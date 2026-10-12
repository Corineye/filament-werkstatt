// ---------------------------------------------------------------------------
// Die Seite selbst: ein Web-Component, das Home Assistant als Panel lädt.
// Daten liegen in Home Assistant (frontend/user_data), also in den HA-Backups.
// ---------------------------------------------------------------------------

const VERSION = "0.2.0";
const SPEICHER_KEY = "filament_werkstatt";
const SICHERUNG_KEY = "filament_werkstatt_sicherung";
const DRUCKER = "sensor.p1s_01p00c572701906_";
const DRUCKER_SENSOREN = [
  "druckstatus", "name_der_aufgabe", "gewicht_des_drucks", "drucklange",
  "zieltemperatur_der_duse", "zieltemperatur_vom_druckbett", "startzeit",
  "druckfortschritt", "dusengrosse", "temperatur_der_duse", "druckbetttemperatur",
];

const NAVIGATION = [
  { id: "filament", name: "Filament", icon: "🧵" },
  { id: "inventar", name: "Inventar", icon: "🔩", bald: true },
  { id: "drucker", name: "Drucker", icon: "🖨️", bald: true },
  { id: "hilfe", name: "Hilfe", icon: "💡", bald: true },
  { id: "system", name: "System", icon: "⚙️" },
];

const FILTER = [
  { id: "alle", name: "Alle" },
  { id: "PLA", name: "PLA" },
  { id: "PETG", name: "PETG" },
  { id: "ASA", name: "ASA" },
  { id: "TPU", name: "TPU" },
  { id: "offen", name: "Nicht probiert" },
  { id: "leer", name: "Fast leer" },
  { id: "ungewogen", name: "Nicht gewogen" },
];
const FAST_LEER_G = 150;

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const zahl = (v, nk = 0) =>
  v == null || Number.isNaN(v) ? "–" : Number(v).toLocaleString("de-DE", { minimumFractionDigits: nk, maximumFractionDigits: nk });
const feldNk = (f) => f.nk ?? 0;

function wert(rolle, k) {
  if (rolle.eigen && rolle.eigen[k] != null) return { v: rolle.eigen[k], quelle: "eigen" };
  if (rolle.vorschlag && rolle.vorschlag[k] != null) return { v: rolle.vorschlag[k], quelle: "vorschlag" };
  return { v: null, quelle: "leer" };
}

function prozent(rolle) {
  if (rolle.rest_g == null) return null;
  return Math.max(0, Math.min(100, Math.round((rolle.rest_g / (rolle.nenn_g || 1000)) * 100)));
}

function spulenGewicht(daten, rolle) {
  if (rolle.spule_g != null) return rolle.spule_g;
  const s = daten.spulen.find((x) => x.id === rolle.spule);
  return s ? s.g : null;
}

function spuleSvg(rolle, gross = false) {
  const p = prozent(rolle);
  const r = 27;
  const umfang = 2 * Math.PI * r;
  const farbeRing = p == null ? "var(--leise)" : p <= 10 ? "var(--rot)" : p <= 20 ? "var(--amber)" : "var(--mint)";
  const strich = p == null ? "" : `stroke-dasharray="${(umfang * p) / 100} ${umfang}"`;
  const transparent = rolle.hex === "transparent";
  const id = `m-${rolle.id}${gross ? "-g" : ""}`;
  return `<svg viewBox="0 0 64 64" class="spule-svg${gross ? " gross" : ""}" aria-hidden="true">
    <defs>
      <pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="6" height="6" fill="rgba(255,255,255,0.06)"/><rect width="2" height="6" fill="rgba(255,255,255,0.22)"/>
      </pattern>
      ${rolle.glanz ? `<linearGradient id="${id}-gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".5" stop-color="${rolle.hex}"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>` : ""}
    </defs>
    <circle cx="32" cy="32" r="${r}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="5"/>
    ${p == null
      ? `<circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--leise)" stroke-width="2" stroke-dasharray="3 4"/>`
      : `<circle cx="32" cy="32" r="${r}" fill="none" stroke="${farbeRing}" stroke-width="5" stroke-linecap="round" ${strich} transform="rotate(-90 32 32)"/>`}
    <circle cx="32" cy="32" r="20" fill="${transparent ? `url(#${id})` : rolle.glanz ? `url(#${id}-gl)` : rolle.hex}" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    <circle cx="32" cy="32" r="6.5" fill="var(--grund)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
  </svg>`;
}

class FilamentWerkstattPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._daten = null;
    this._fehler = null;
    this._ansicht = "filament";
    this._filter = "alle";
    this._suche = "";
    this._offen = null;
    this._tab = "einstellungen";
    this._bearbeiten = false;
    this._entwurf = null;
    this._nachTest = false;
    this._dialog = null;
    this._gruppen = new Set(["temp"]);
    this._rechner = null;
    this._speicherStatus = "";
    this._mobil = false;
    this._narrow = false;
    this._check = null;
  }

  // ---- Home Assistant -----------------------------------------------------
  set hass(hass) {
    const erstes = !this._hass;
    this._hass = hass;
    if (erstes) this._laden();
  }
  set narrow(n) {
    if (this._narrow !== !!n) { this._narrow = !!n; this._zeichnen(); }
  }
  set panel(_) {}

  connectedCallback() {
    if (!this._ro) {
      this._ro = new ResizeObserver((e) => {
        const mobil = e[0].contentRect.width < 720;
        if (mobil !== this._mobil) { this._mobil = mobil; this._zeichnen(); }
      });
    }
    this._ro.observe(this);
    this.shadowRoot.addEventListener("click", (e) => this._klick(e));
    this.shadowRoot.addEventListener("input", (e) => this._eingabe(e));
    this.shadowRoot.addEventListener("change", (e) => this._aenderung(e));
    this._zeichnen();
  }
  disconnectedCallback() { this._ro && this._ro.disconnect(); }

  // ---- Laden und Speichern ------------------------------------------------
  async _laden() {
    this._fehler = null;
    try {
      const r = await this._hass.callWS({ type: "frontend/get_user_data", key: SPEICHER_KEY });
      if (r && r.value && Array.isArray(r.value.rollen)) {
        this._daten = r.value;
        // Sicherung des letzten Stands, bevor in dieser Sitzung etwas geändert wird
        this._hass.callWS({ type: "frontend/set_user_data", key: SICHERUNG_KEY, value: r.value }).catch(() => {});
      } else {
        this._daten = standardDaten();
        await this._speichernJetzt();
      }
    } catch (e) {
      this._fehler = e.message || String(e);
    }
    this._zeichnen();
  }

  _speichern() {
    this._speicherStatus = "speichert";
    this._statusZeigen();
    clearTimeout(this._speicherTimer);
    this._speicherTimer = setTimeout(() => this._speichernJetzt(), 500);
  }

  async _speichernJetzt() {
    try {
      this._daten.geaendert = new Date().toISOString();
      await this._hass.callWS({ type: "frontend/set_user_data", key: SPEICHER_KEY, value: this._daten });
      this._speicherStatus = "gespeichert";
    } catch (e) {
      this._speicherStatus = "fehler";
    }
    this._statusZeigen();
  }

  _statusZeigen() {
    const el = this.shadowRoot.getElementById("speicher");
    if (el) el.outerHTML = this._speicherHtml();
  }

  _speicherHtml() {
    const s = this._speicherStatus;
    const text = s === "speichert" ? "Speichert …" : s === "gespeichert" ? "Gespeichert" : s === "fehler" ? "Speichern fehlgeschlagen" : "";
    return `<span id="speicher" class="speicher ${s}">${text}</span>`;
  }

  _toast(text) {
    this._toastText = text;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { this._toastText = null; this._zeichnen(); }, 2600);
    this._zeichnen();
  }

  // ---- Hilfsfunktionen ----------------------------------------------------
  _rolle(id = this._offen) { return this._daten && this._daten.rollen.find((r) => r.id === id); }

  _gefiltert() {
    const q = this._suche.trim().toLowerCase();
    const reihenfolge = ["PLA", "PETG", "ASA", "TPU"];
    return this._daten.rollen
      .filter((r) => {
        const f = this._filter;
        if (f === "offen" && r.probiert) return false;
        if (f === "leer" && !(r.rest_g != null && r.rest_g <= FAST_LEER_G)) return false;
        if (f === "ungewogen" && r.rest_g != null) return false;
        if (MATERIAL[f] && r.material !== f) return false;
        if (q && !`${r.name} ${r.hersteller} ${r.material} ${r.art} ${r.farbe}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => reihenfolge.indexOf(a.material) - reihenfolge.indexOf(b.material) || a.name.localeCompare(b.name, "de"));
  }

  // ---- Ereignisse ---------------------------------------------------------
  _klick(e) {
    const el = e.target.closest("[data-aktion]");
    if (!el) return;
    const a = el.dataset.aktion;
    const rolle = this._rolle();
    switch (a) {
      case "menue":
        this.dispatchEvent(new Event("hass-toggle-menu", { bubbles: true, composed: true }));
        return;
      case "ansicht":
        if (el.dataset.bald) { this._toast("Kommt in einem der nächsten Schritte."); return; }
        this._ansicht = el.dataset.id;
        if (this._ansicht === "system") this._systemcheck();
        break;
      case "filter": this._filter = el.dataset.id; break;
      case "oeffnen":
        this._offen = el.dataset.id;
        this._tab = "einstellungen";
        this._bearbeiten = false;
        this._rechner = null;
        this._sheetScroll = 0;
        break;
      case "schliessen":
        if (this._bearbeiten && !confirm("Änderungen verwerfen?")) return;
        this._offen = null; this._bearbeiten = false; this._dialog = null; break;
      case "tab": this._tab = el.dataset.id; this._sheetScroll = 0; break;
      case "gruppe": {
        const g = el.dataset.id;
        this._gruppen.has(g) ? this._gruppen.delete(g) : this._gruppen.add(g);
        break;
      }
      case "bearbeiten":
        this._entwurf = { ...rolle.eigen };
        this._entwurfText = { preset: rolle.preset, pa_profil: rolle.pa_profil, filament_setting: rolle.filament_setting };
        this._bearbeiten = true; this._nachTest = false;
        break;
      case "verwerfen": this._bearbeiten = false; this._entwurf = null; this._nachTest = false; break;
      case "speichern-einst":
        rolle.eigen = { ...this._entwurf };
        Object.assign(rolle, this._entwurfText);
        if (this._nachTest) { rolle.probiert = true; rolle.probiert_am = new Date().toISOString(); }
        this._bearbeiten = false; this._entwurf = null;
        this._speichern();
        this._toast(this._nachTest ? `${rolle.name} ist jetzt als probiert markiert.` : "Einstellungen gespeichert.");
        this._nachTest = false;
        return;
      case "alle-vorschlaege":
        this._entwurf = { ...rolle.vorschlag, ...this._entwurf };
        FELDER.forEach((f) => this._gruppen.add(f.g));
        break;
      case "schritt": {
        const f = FELDER.find((x) => x.k === el.dataset.k);
        const alt = this._entwurf[f.k] ?? wert(rolle, f.k).v ?? f.min;
        this._feldSetzen(f, alt + Number(el.dataset.d) * f.step);
        return;
      }
      case "probiert": this._dialog = "probiert"; break;
      case "dialog-zu": this._dialog = null; break;
      case "test-gut":
        rolle.eigen = { ...rolle.vorschlag, ...rolle.eigen };
        rolle.probiert = true; rolle.probiert_am = new Date().toISOString();
        this._dialog = null;
        this._speichern();
        this._toast(`${rolle.name} ist jetzt als probiert markiert.`);
        return;
      case "test-anpassen":
        this._dialog = null;
        this._entwurf = { ...rolle.vorschlag, ...rolle.eigen };
        this._entwurfText = { preset: rolle.preset, pa_profil: rolle.pa_profil, filament_setting: rolle.filament_setting };
        this._bearbeiten = true; this._nachTest = true; this._tab = "einstellungen";
        FELDER.forEach((f) => this._gruppen.add(f.g));
        break;
      case "brutto": this._rechnerSetzen("brutto", this._rechner.brutto + Number(el.dataset.d)); return;
      case "spule-wahl": {
        const s = this._daten.spulen.find((x) => x.id === el.dataset.id);
        this._rechner.spule = s.id; this._rechner.spule_g = s.g;
        break;
      }
      case "rest-speichern": {
        const rest = Math.max(0, this._rechner.brutto - this._rechner.spule_g);
        rolle.rest_g = rest;
        rolle.gewogen_am = new Date().toISOString();
        const s = this._daten.spulen.find((x) => x.id === this._rechner.spule && x.g === this._rechner.spule_g);
        if (s) { rolle.spule = s.id; delete rolle.spule_g; } else { rolle.spule = null; rolle.spule_g = this._rechner.spule_g; }
        this._rechner = null;
        this._speichern();
        this._toast(`Restgewicht ${zahl(rest)} g gespeichert.`);
        return;
      }
      case "neu-pruefen": this._systemcheck(); return;
      case "nochmal-laden": this._laden(); return;
      default: return;
    }
    this._zeichnen();
  }

  _eingabe(e) {
    const t = e.target;
    if (t.dataset.feld) {
      const f = FELDER.find((x) => x.k === t.dataset.feld);
      this._feldSetzen(f, Number(t.value), false);
    } else if (t.dataset.rechner) {
      this._rechnerSetzen(t.dataset.rechner, Number(t.value), false);
    } else if (t.id === "suche") {
      this._suche = t.value;
      const grid = this.shadowRoot.getElementById("raster");
      if (grid) grid.innerHTML = this._kachelnHtml();
    } else if (t.dataset.text && this._entwurfText) {
      this._entwurfText[t.dataset.text] = t.value;
    } else if (t.dataset.info) {
      const rolle = this._rolle();
      const k = t.dataset.info;
      const v = Number(t.value);
      const anzeige = this.shadowRoot.getElementById(`info-${k}`);
      if (anzeige) anzeige.textContent = k === "preis_kg" ? (v === 0 ? "nicht gesetzt" : `${zahl(v, 2)} €`) : `${zahl(v)} g`;
      rolle[k] = k === "preis_kg" && v === 0 ? null : v;
    }
  }

  _aenderung(e) {
    const t = e.target;
    if (t.dataset.info) this._speichern();
    if (t.id === "notiz") { this._rolle().notiz = t.value; this._speichern(); }
  }

  _feldSetzen(f, v, slider = true) {
    v = Math.max(f.min, Math.min(f.max, Math.round(v / f.step) * f.step));
    v = Number(v.toFixed(feldNk(f) + 1));
    this._entwurf[f.k] = v;
    const zeile = this.shadowRoot.querySelector(`[data-zeile="${f.k}"]`);
    if (!zeile) return;
    zeile.querySelector(".wert").textContent = `${zahl(v, feldNk(f))} ${f.e}`.trim();
    zeile.classList.remove("vorschlag");
    zeile.classList.add("eigen");
    const tag = zeile.querySelector(".tag");
    if (tag) tag.remove();
    if (slider) zeile.querySelector("input").value = v;
  }

  _rechnerSetzen(k, v, slider = true) {
    const max = k === "brutto" ? 2000 : 500;
    v = Math.max(0, Math.min(max, Math.round(v)));
    this._rechner[k] = v;
    if (k === "spule_g") this._rechner.spule = null;
    const el = this.shadowRoot.getElementById(`r-${k}`);
    if (el) el.textContent = `${zahl(v)} g`;
    if (slider) { const s = this.shadowRoot.querySelector(`[data-rechner="${k}"]`); if (s) s.value = v; }
    if (k === "spule_g") this.shadowRoot.querySelectorAll(".spulen .chip").forEach((c) => c.classList.remove("an"));
    const erg = this.shadowRoot.getElementById("r-ergebnis");
    if (erg) erg.innerHTML = this._rechnerErgebnisHtml();
  }

  // ---- Systemcheck --------------------------------------------------------
  async _systemcheck() {
    const hass = this._hass;
    const liste = [];
    this._check = { laeuft: true, liste };
    const add = (titel, ok, details) => { liste.push({ titel, ok, details }); this._zeichnen(); };
    const fehlen = DRUCKER_SENSOREN.filter((s) => !hass.states[DRUCKER + s]);
    add("Drucker-Sensoren", !fehlen.length, !fehlen.length
      ? `Alle ${DRUCKER_SENSOREN.length} gefunden, Druckstatus: ${hass.states[DRUCKER + "druckstatus"].state}`
      : `Nicht gefunden: ${fehlen.join(", ")}. Direkt nach einem HA-Neustart ist das normal, dann in einer Minute neu prüfen.`);
    const kameras = Object.keys(hass.states).filter((id) => id.startsWith("camera.") && id.includes("p1s"));
    add("Drucker-Kamera", kameras.length > 0, kameras.length ? kameras.join(", ") : "Keine Kamera mit „p1s“ im Namen gefunden");
    try {
      const r = await hass.callWS({ type: "todo/item/list", entity_id: "todo.3d_drucke" });
      add("Druckliste lesen", true, `${(r.items || []).length} Einträge in todo.3d_drucke`);
    } catch (e) { add("Druckliste lesen", false, e.message || String(e)); }
    try {
      const r = await hass.callWS({ type: "frontend/get_user_data", key: SPEICHER_KEY });
      const n = r && r.value && r.value.rollen ? r.value.rollen.length : 0;
      add("Gespeicherte Daten", n > 0, n ? `${n} Rollen gespeichert, zuletzt geändert ${r.value.geaendert ? new Date(r.value.geaendert).toLocaleString("de-DE") : "–"}` : "Noch keine Daten gespeichert");
    } catch (e) { add("Gespeicherte Daten", false, e.message || String(e)); }
    try {
      const r = await hass.callWS({ type: "media_source/browse_media", media_content_id: "media-source://media_source" });
      add("Medienordner", true, (r.children || []).map((c) => c.title).join(", ") || "Erreichbar");
    } catch (e) { add("Medienordner", false, e.message || String(e)); }
    this._check.laeuft = false;
    this._zeichnen();
  }

  // ---- Zeichnen -----------------------------------------------------------
  _zeichnen() {
    const root = this.shadowRoot;
    const haupt = root.querySelector(".haupt");
    const sheet = root.querySelector(".sheet-inhalt");
    const scrollHaupt = haupt ? haupt.scrollTop : 0;
    if (sheet) this._sheetScroll = sheet.scrollTop;
    const fokusSuche = root.activeElement && root.activeElement.id === "suche";

    root.innerHTML = `<style>${STIL}</style>
      <div class="app ${this._mobil ? "mobil" : ""}">
        ${this._kopfHtml()}
        <main class="haupt">${this._inhaltHtml()}</main>
        ${this._mobil ? this._navHtml("unten") : ""}
        ${this._offen ? this._sheetHtml() : ""}
        ${this._dialog === "probiert" ? this._probiertDialogHtml() : ""}
        ${this._toastText ? `<div class="toast">${esc(this._toastText)}</div>` : ""}
      </div>`;

    const h = root.querySelector(".haupt");
    if (h) h.scrollTop = scrollHaupt;
    const s = root.querySelector(".sheet-inhalt");
    if (s && this._sheetScroll) s.scrollTop = this._sheetScroll;
    if (fokusSuche) {
      const i = root.getElementById("suche");
      i.focus();
      i.setSelectionRange(i.value.length, i.value.length);
    }
  }

  _kopfHtml() {
    return `<header class="kopf">
      ${this._narrow ? `<button class="icon-knopf" data-aktion="menue" aria-label="Menü">☰</button>` : ""}
      <div class="marke"><span class="punkt-leucht"></span>Filament-Werkstatt</div>
      ${this._mobil ? "" : this._navHtml("oben")}
      ${this._speicherHtml()}
    </header>`;
  }

  _navHtml(lage) {
    return `<nav class="nav nav-${lage}">${NAVIGATION.map((n) => `
      <button class="nav-punkt ${this._ansicht === n.id ? "aktiv" : ""} ${n.bald ? "bald" : ""}" data-aktion="ansicht" data-id="${n.id}" ${n.bald ? 'data-bald="1"' : ""}>
        <span class="nav-icon">${n.icon}</span><span>${n.name}</span>${n.bald ? '<small>bald</small>' : ""}
      </button>`).join("")}</nav>`;
  }

  _inhaltHtml() {
    if (this._fehler) {
      return `<div class="karte fehlerkarte"><h2>Daten konnten nicht geladen werden</h2><p>${esc(this._fehler)}</p>
        <button class="knopf" data-aktion="nochmal-laden">Nochmal versuchen</button></div>`;
    }
    if (this._ansicht === "system") return this._systemHtml();
    if (!this._daten) return `<div class="laden">Lade Daten aus Home Assistant …</div>`;
    return this._filamentHtml();
  }

  _filamentHtml() {
    const rollen = this._daten.rollen;
    const gewogen = rollen.filter((r) => r.rest_g != null);
    const gesamt = gewogen.reduce((s, r) => s + r.rest_g, 0);
    const offen = rollen.filter((r) => !r.probiert).length;
    const leer = rollen.filter((r) => r.rest_g != null && r.rest_g <= FAST_LEER_G).length;
    const ungewogen = rollen.length - gewogen.length;
    const stat = (wert, text, filter, klasse = "") =>
      `<button class="stat ${klasse}" ${filter ? `data-aktion="filter" data-id="${filter}"` : ""}><strong>${wert}</strong><span>${text}</span></button>`;
    return `
      <section class="stats">
        ${stat(rollen.length, "Rollen", "alle")}
        ${stat(`${zahl(gesamt / 1000, 1)} kg`, "Filament übrig", null)}
        ${stat(offen, "nicht probiert", "offen", "amber")}
        ${stat(leer, "fast leer", "leer", leer ? "rot" : "")}
        ${stat(ungewogen, "nicht gewogen", "ungewogen")}
      </section>
      <section class="werkzeug">
        <div class="chips">${FILTER.map((f) => `<button class="chip ${this._filter === f.id ? "an" : ""}" data-aktion="filter" data-id="${f.id}">${f.name}</button>`).join("")}</div>
        <input id="suche" class="suche" type="search" placeholder="Suchen: Farbe, Hersteller, Material …" value="${esc(this._suche)}" autocomplete="off">
      </section>
      <section id="raster" class="raster">${this._kachelnHtml()}</section>`;
  }

  _kachelnHtml() {
    const liste = this._gefiltert();
    if (!liste.length) return `<div class="leer-hinweis">Keine Rolle passt zu diesem Filter.</div>`;
    return liste.map((r) => {
      const rest = r.rest_g == null ? "nicht gewogen" : `${zahl(r.rest_g)} g`;
      const p = prozent(r);
      return `<button class="kachel ${r.probiert ? "" : "offen"}" data-aktion="oeffnen" data-id="${r.id}">
        ${r.probiert ? "" : `<span class="badge-offen">noch nicht probiert</span>`}
        <div class="kachel-spule">${spuleSvg(r)}</div>
        <div class="kachel-name">${esc(r.name)}</div>
        <div class="kachel-sub">${esc(r.hersteller)}</div>
        <div class="kachel-fuss">
          <span class="mat" style="--m:${(MATERIAL[r.material] || MATERIAL.PLA).farbe}">${esc(r.material)}</span>
          <span class="rest ${r.rest_g == null ? "leise" : p <= 10 ? "rot" : p <= 20 ? "amber" : ""}">${rest}</span>
        </div>
      </button>`;
    }).join("");
  }

  _sheetHtml() {
    const r = this._rolle();
    if (!r) return "";
    const tabs = [["einstellungen", "Einstellungen"], ["rest", "Restgewicht"], ["infos", "Infos"]];
    let fuss = "";
    if (this._bearbeiten) {
      fuss = `<button class="knopf leise" data-aktion="verwerfen">Verwerfen</button>
        <button class="knopf" data-aktion="speichern-einst">${this._nachTest ? "Speichern & als probiert markieren" : "Speichern"}</button>`;
    } else if (this._tab === "einstellungen") {
      fuss = r.probiert
        ? `<button class="knopf leise" data-aktion="bearbeiten">🎚 Einstellungen ändern</button>`
        : `<button class="knopf amber" data-aktion="probiert">✓ Probiert</button>`;
    }
    return `<div class="schleier" data-aktion="schliessen"></div>
      <section class="sheet" role="dialog" aria-label="${esc(r.name)}">
        <div class="griff"></div>
        <header class="sheet-kopf">
          ${spuleSvg(r, true)}
          <div class="sheet-titel">
            <h2>${esc(r.name)}</h2>
            <div class="sub">${esc(r.hersteller)} · ${esc(r.art && r.art.startsWith(r.material) ? r.art : `${r.material} ${r.art || ""}`)} · ${esc(r.farbe)}</div>
            ${r.probiert
              ? `<span class="pille mint">✓ probiert${r.probiert_am ? ` am ${new Date(r.probiert_am).toLocaleDateString("de-DE")}` : ""}</span>`
              : `<span class="pille amber">noch nicht probiert</span>`}
          </div>
          <button class="icon-knopf" data-aktion="schliessen" aria-label="Schließen">✕</button>
        </header>
        <div class="tabs">${tabs.map(([id, n]) => `<button class="tab ${this._tab === id ? "an" : ""}" data-aktion="tab" data-id="${id}" ${this._bearbeiten ? "disabled" : ""}>${n}</button>`).join("")}</div>
        <div class="sheet-inhalt">
          ${this._tab === "einstellungen" ? this._einstellungenHtml(r) : this._tab === "rest" ? this._restHtml(r) : this._infosHtml(r)}
        </div>
        ${fuss ? `<footer class="sheet-fuss">${fuss}</footer>` : ""}
      </section>`;
  }

  _einstellungenHtml(r) {
    const bearb = this._bearbeiten;
    const anzeige = (k) => (bearb && this._entwurf[k] != null ? { v: this._entwurf[k], quelle: "eigen" } : wert(r, k));
    const hatVorschlaege = FELDER.some((f) => anzeige(f.k).quelle === "vorschlag");
    let html = "";
    if (bearb && this._nachTest) html += `<div class="hinweis mint">Stell die Werte so ein, wie du sie beim Testdruck benutzt hast, und tippe dann auf Speichern.</div>`;
    if (!r.probiert && !bearb) html += `<div class="hinweis amber">Diese Rolle hast du noch nicht probiert. Die Werte sind Vorschläge${r.herkunft ? `: ${esc(r.herkunft)}` : " für diese Materialart."}</div>`;
    if (r.probiert && !bearb && !Object.keys(r.eigen || {}).length) html += `<div class="hinweis">Du druckst diese Rolle mit dem Preset „${esc(r.preset || "–")}“. Die Werte hier sind Richtwerte dafür, bis du unter „Einstellungen ändern“ deine eigenen einträgst.</div>`;
    if (r.hinweis) html += `<div class="hinweis">💡 ${esc(r.hinweis)}</div>`;
    html += `<div class="legende"><span><i class="dot mint"></i>dein Wert</span><span><i class="dot amber"></i>Vorschlag</span>
      ${bearb && hatVorschlaege ? `<button class="mini" data-aktion="alle-vorschlaege">Alle Vorschläge übernehmen</button>` : ""}</div>`;

    for (const g of GRUPPEN) {
      const felder = FELDER.filter((f) => f.g === g.id);
      const auf = this._gruppen.has(g.id);
      const zusammenfassung = felder.map((f) => zahl(anzeige(f.k).v, feldNk(f))).join(" · ");
      const nurVorschlag = felder.every((f) => anzeige(f.k).quelle !== "eigen");
      html += `<div class="gruppe ${auf ? "auf" : ""}">
        <button class="gruppe-kopf" data-aktion="gruppe" data-id="${g.id}">
          <span class="g-icon">${g.icon}</span><span class="g-name">${g.name}</span>
          <span class="g-zus ${nurVorschlag ? "amber" : ""}">${zusammenfassung}</span><span class="pfeil">›</span>
        </button>
        ${auf ? `<div class="gruppe-inhalt">${felder.map((f) => {
          const w = anzeige(f.k);
          const v = w.v ?? f.min;
          return `<div class="zeile ${w.quelle}" data-zeile="${f.k}">
            <div class="zeile-kopf"><span class="z-name">${f.name}</span>
              <span class="z-wert"><span class="wert">${zahl(w.v, feldNk(f))} ${f.e}</span>${w.quelle === "vorschlag" ? '<span class="tag">Vorschlag</span>' : ""}</span></div>
            ${bearb ? `<div class="regler-zeile">
              <button class="rund" data-aktion="schritt" data-k="${f.k}" data-d="-1" aria-label="weniger">−</button>
              <input type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${v}" data-feld="${f.k}">
              <button class="rund" data-aktion="schritt" data-k="${f.k}" data-d="1" aria-label="mehr">+</button>
            </div>` : ""}
          </div>`;
        }).join("")}</div>` : ""}
      </div>`;
    }

    const profil = [["preset", "Preset"], ["pa_profil", "PA-Profil"], ["filament_setting", "Filament-Einstellung"]];
    const auf = this._gruppen.has("profil");
    html += `<div class="gruppe ${auf ? "auf" : ""}">
      <button class="gruppe-kopf" data-aktion="gruppe" data-id="profil"><span class="g-icon">🗂️</span><span class="g-name">Profile in Bambu Studio</span>
        <span class="g-zus">${esc(r.preset || "kein Preset")}</span><span class="pfeil">›</span></button>
      ${auf ? `<div class="gruppe-inhalt">${profil.map(([k, n]) => `<div class="zeile"><div class="zeile-kopf"><span class="z-name">${n}</span>
        ${bearb ? "" : `<span class="z-wert">${esc(r[k] || "–")}</span>`}</div>
        ${bearb ? `<input class="text" data-text="${k}" value="${esc(this._entwurfText[k] || "")}" placeholder="Name in Bambu Studio">` : ""}</div>`).join("")}</div>` : ""}
    </div>`;
    return html;
  }

  _restHtml(r) {
    const spule = spulenGewicht(this._daten, r);
    if (!this._rechner) {
      const sp = spule ?? 0;
      this._rechner = { brutto: r.rest_g != null ? r.rest_g + sp : (r.nenn_g || 1000) + sp, spule: r.spule_g != null ? null : r.spule, spule_g: sp, unbekannt: spule == null };
    }
    const p = prozent(r);
    const m = r.rest_g != null ? r.rest_g / grammProMeter(r.material) : null;
    return `
      <div class="rest-jetzt">
        <div><span class="gross-zahl">${r.rest_g == null ? "?" : zahl(r.rest_g)}</span><span class="einheit">${r.rest_g == null ? "nicht gewogen" : "g übrig"}</span></div>
        ${p != null ? `<div class="balken"><i style="width:${p}%"></i></div>
          <div class="leise klein">${p} % von ${zahl(r.nenn_g)} g · ca. ${zahl(m)} m${r.gewogen_am ? ` · gewogen am ${new Date(r.gewogen_am).toLocaleDateString("de-DE")}` : ""}</div>` : ""}
      </div>
      <h3>⚖️ Rolle wiegen</h3>
      <p class="leise klein">Leg die Rolle mit Spule auf die Waage und stell das Gewicht ein. Das Leergewicht der Spule wird abgezogen.</p>
      <div class="rechner-block">
        <div class="r-kopf"><span>Waage zeigt</span><strong id="r-brutto">${zahl(this._rechner.brutto)} g</strong></div>
        <div class="regler-zeile">
          <button class="rund" data-aktion="brutto" data-d="-10">−10</button>
          <button class="rund" data-aktion="brutto" data-d="-1">−1</button>
          <input type="range" min="0" max="2000" step="1" value="${this._rechner.brutto}" data-rechner="brutto">
          <button class="rund" data-aktion="brutto" data-d="1">+1</button>
          <button class="rund" data-aktion="brutto" data-d="10">+10</button>
        </div>
      </div>
      <div class="rechner-block">
        <div class="r-kopf"><span>Leere Spule</span><strong id="r-spule_g">${zahl(this._rechner.spule_g)} g</strong></div>
        ${this._rechner.unbekannt ? `<div class="hinweis amber klein">Das Leergewicht dieser Spule ist noch unbekannt. Wähl eine passende Spule oder stell das Gewicht einer leeren Spule ein.</div>` : ""}
        <div class="chips spulen">${this._daten.spulen.map((s) => `<button class="chip ${this._rechner.spule === s.id ? "an" : ""}" data-aktion="spule-wahl" data-id="${s.id}">${esc(s.name)} · ${s.g} g</button>`).join("")}</div>
        <div class="regler-zeile"><input type="range" min="0" max="500" step="1" value="${this._rechner.spule_g}" data-rechner="spule_g"></div>
      </div>
      <div id="r-ergebnis" class="ergebnis">${this._rechnerErgebnisHtml()}</div>
      <button class="knopf breit" data-aktion="rest-speichern">Als Restgewicht speichern</button>`;
  }

  _rechnerErgebnisHtml() {
    const r = this._rolle();
    const rest = Math.max(0, this._rechner.brutto - this._rechner.spule_g);
    const p = Math.round((rest / (r.nenn_g || 1000)) * 100);
    return `<span class="leise">Filament auf der Rolle</span><strong>${zahl(rest)} g</strong>
      <span class="leise">${p} % · ca. ${zahl(rest / grammProMeter(r.material))} m</span>`;
  }

  _infosHtml(r) {
    const zeile = (n, v) => `<div class="info-zeile"><span>${n}</span><strong>${esc(v || "–")}</strong></div>`;
    return `
      <div class="info-liste">
        ${zeile("Hersteller", r.hersteller)}${zeile("Material", r.material)}${zeile("Art", r.art)}
        ${zeile("Farbe", r.farbe)}${zeile("Farbcode", r.farbcode)}
      </div>
      <div class="rechner-block">
        <div class="r-kopf"><span>Füllmenge neue Rolle</span><strong id="info-nenn_g">${zahl(r.nenn_g)} g</strong></div>
        <input type="range" min="250" max="3000" step="250" value="${r.nenn_g}" data-info="nenn_g">
      </div>
      <div class="rechner-block">
        <div class="r-kopf"><span>Preis pro kg</span><strong id="info-preis_kg">${r.preis_kg ? `${zahl(r.preis_kg, 2)} €` : "nicht gesetzt"}</strong></div>
        <input type="range" min="0" max="80" step="0.5" value="${r.preis_kg || 0}" data-info="preis_kg">
      </div>
      <h3>Notizen</h3>
      <textarea id="notiz" rows="4" placeholder="z. B. Schichthöhe, Besonderheiten …">${esc(r.notiz)}</textarea>`;
  }

  _probiertDialogHtml() {
    const r = this._rolle();
    return `<div class="schleier oben" data-aktion="dialog-zu"></div>
      <div class="dialog" role="dialog">
        <h2>Wie lief der Testdruck?</h2>
        <p class="leise">${esc(r.name)} von ${esc(r.hersteller)}</p>
        <button class="wahl" data-aktion="test-gut"><span>✓</span><div><strong>Lief gut</strong><small>Vorschläge als deine Werte übernehmen</small></div></button>
        <button class="wahl" data-aktion="test-anpassen"><span>🎚</span><div><strong>Lief, aber ich habe etwas geändert</strong><small>Werte mit Reglern anpassen und speichern</small></div></button>
        <p class="leise klein">Ist der Druck schiefgegangen? Dafür kommt später das Fehldruck-Menü mit Ursachen und Tipps.</p>
        <button class="knopf leise breit" data-aktion="dialog-zu">Abbrechen</button>
      </div>`;
  }

  _systemHtml() {
    const c = this._check;
    const liste = c ? c.liste.map((e) => `<li class="${e.ok ? "ok" : "nein"}"><span class="punkt">${e.ok ? "✓" : "✕"}</span>
      <div><strong>${esc(e.titel)}</strong><small>${esc(e.details)}</small></div></li>`).join("") : "";
    return `<div class="karte system">
      <h2>Systemcheck</h2>
      <p class="leise">Prüft, ob die Seite alles in Home Assistant erreicht. Version ${VERSION}.</p>
      <ul class="check">${liste}</ul>
      <button class="knopf" data-aktion="neu-pruefen" ${c && c.laeuft ? "disabled" : ""}>${c && c.laeuft ? "Prüft …" : "Neu prüfen"}</button>
    </div>`;
  }
}

if (!customElements.get("filament-werkstatt-panel")) {
  customElements.define("filament-werkstatt-panel", FilamentWerkstattPanel);
}
