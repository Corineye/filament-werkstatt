// ---------------------------------------------------------------------------
// Die Seite selbst: ein Web-Component, das Home Assistant als Panel lädt.
// Daten liegen in Home Assistant (frontend/user_data), also in den HA-Backups.
// ---------------------------------------------------------------------------

const VERSION = "0.6.0";
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
  { id: "inventar", name: "Inventar", icon: "🔩" },
  { id: "drucker", name: "Drucker", icon: "🖨️" },
  { id: "hilfe", name: "Hilfe", icon: "💡", bald: true },
  { id: "system", name: "System", icon: "⚙️" },
];

const STATUS = [
  { id: "offen", name: "Nicht probiert" },
  { id: "probiert", name: "Probiert" },
  { id: "leer", name: "Fast leer" },
  { id: "ungewogen", name: "Nicht gewogen" },
];
const SORTIERUNG = [
  { id: "material", name: "Material" },
  { id: "rest_auf", name: "Rest: wenig zuerst" },
  { id: "rest_ab", name: "Rest: viel zuerst" },
  { id: "hersteller", name: "Hersteller" },
  { id: "farbe", name: "Farbe" },
];
const STANDARD_GROESSEN = [250, 500, 750, 1000, 2000];
const FAST_LEER_G = 150;
const MATERIAL_REIHE = ["PLA", "PETG", "ASA", "TPU"];

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const zahl = (v, nk = 0) =>
  v == null || Number.isNaN(v) ? "–" : Number(v).toLocaleString("de-DE", { minimumFractionDigits: nk, maximumFractionDigits: nk });
const feldNk = (f) => f.nk ?? 0;
const gramm = (g) => (g >= 1000 && g % 1000 === 0 ? `${g / 1000} kg` : `${zahl(g)} g`);
const sorteName = (r) => (r.art && r.art.startsWith(r.material) ? r.art : `${r.material} ${r.art || ""}`.trim());

function wert(rolle, k) {
  if (rolle.eigen && rolle.eigen[k] != null) return { v: rolle.eigen[k], quelle: "eigen" };
  if (rolle.vorschlag && rolle.vorschlag[k] != null) return { v: rolle.vorschlag[k], quelle: "vorschlag" };
  return { v: null, quelle: "leer" };
}

function prozent(rolle) {
  if (rolle.rest_g == null) return null;
  return Math.max(0, Math.min(100, Math.round((rolle.rest_g / (rolle.nenn_g || 1000)) * 100)));
}

function spuleSvg(rolle, gross = false) {
  const p = prozent(rolle);
  const r = 27;
  const umfang = 2 * Math.PI * r;
  const farbeRing = p == null ? "var(--leise)" : p <= 10 ? "var(--rot)" : p <= 20 ? "var(--amber)" : "var(--mint)";
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
      : `<circle cx="32" cy="32" r="${r}" fill="none" stroke="${farbeRing}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(umfang * p) / 100} ${umfang}" transform="rotate(-90 32 32)"/>`}
    <circle cx="32" cy="32" r="20" fill="${transparent ? `url(#${id})` : rolle.glanz ? `url(#${id}-gl)` : esc(rolle.hex)}" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    <circle cx="32" cy="32" r="6.5" fill="var(--grund)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
  </svg>`;
}

class FilamentWerkstattPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Stil einmal anlegen statt bei jedem Neuzeichnen neu einzulesen (spart Rechenzeit, kein Flackern)
    try {
      const blatt = new CSSStyleSheet();
      blatt.replaceSync(STIL);
      this.shadowRoot.adoptedStyleSheets = [blatt];
      this._stilFest = true;
    } catch (e) { this._stilFest = false; }
    this._daten = null;
    this._fehler = null;
    this._ansicht = "filament";
    this._f = { sorte: "", hersteller: "", farbe: "", status: "" };
    this._sort = "material";
    this._suche = "";
    this._modus = null;          // null | "detail" | "neu"
    this._offen = null;          // id der geöffneten Rolle
    this._neu = null;            // Entwurf beim Hinzufügen
    this._tab = "einstellungen";
    this._bearbeiten = false;
    this._entwurf = null;
    this._entwurfText = null;
    this._nachTest = false;
    this._dialog = null;         // "probiert" | "spule" | "groesse"
    this._gruppen = new Set(["temp"]);
    this._offeneZeilen = new Set();
    this._rechner = null;
    this._rechnerStart = null;
    this._speicherStatus = "";
    this._mobil = false;
    this._narrow = false;
    this._check = null;
    this._invF = { kat: "", gewinde: "", status: "" };
    this._invSort = "kategorie";
    this._invSuche = "";
    this._invOffen = null;
    this._invNeu = null;
  }

  // ---- Home Assistant -----------------------------------------------------
  set hass(hass) {
    const erstes = !this._hass;
    this._hass = hass;
    if (erstes) this._laden();
    else this._drHassNeu();
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
      this.shadowRoot.addEventListener("click", (e) => this._klick(e));
      this.shadowRoot.addEventListener("input", (e) => this._eingabe(e));
      this.shadowRoot.addEventListener("change", (e) => this._aenderung(e));
      this.shadowRoot.addEventListener("scroll", (e) => { this._ddBeimScrollen(e.target); }, true);
      this.shadowRoot.addEventListener("keydown", (e) => { if (e.key === "Escape") this._ddZu(); });
    }
    this._ro.observe(this);
    this._zeichnen();
  }
  disconnectedCallback() { this._ro && this._ro.disconnect(); }

  // ---- Laden und Speichern ------------------------------------------------
  async _laden() {
    this._fehler = null;
    try {
      const r = await this._hass.callWS({ type: "frontend/get_user_data", key: SPEICHER_KEY });
      if (r && r.value && Array.isArray(r.value.rollen)) {
        // Sicherung des letzten Stands, bevor in dieser Sitzung etwas geändert wird
        this._hass.callWS({ type: "frontend/set_user_data", key: SICHERUNG_KEY, value: r.value }).catch(() => {});
        const alt = r.value.version;
        this._daten = migrieren(JSON.parse(JSON.stringify(r.value)));
        if (alt !== this._daten.version) await this._speichernJetzt();
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
    this._toastTimer = setTimeout(() => this._toastWeg(), 2600);
    this._zeichnen();
  }

  // Nur die Meldung entfernen, nicht neu zeichnen (sonst gehen Eingaben verloren)
  _toastWeg() {
    this._toastText = null;
    const t = this.shadowRoot.querySelector(".toast");
    if (t) t.remove();
  }

  // ---- Hilfsfunktionen ----------------------------------------------------
  _rolle() {
    if (this._modus === "neu") return this._neu;
    return this._daten && this._daten.rollen.find((r) => r.id === this._offen);
  }

  _spule(id) { return this._daten.spulen.find((s) => s.id === id); }
  _spulenNutzer(id) { return this._daten.rollen.filter((r) => r.spule === id).length; }

  _gefiltert() {
    const q = this._suche.trim().toLowerCase();
    const { sorte, hersteller, farbe, status } = this._f;
    const liste = this._daten.rollen.filter((r) => {
      if (sorte) {
        const [art, m, a] = sorte.split("|");
        if (r.material !== m) return false;
        if (art === "a" && r.art !== a) return false;
      }
      if (hersteller && r.hersteller !== hersteller) return false;
      if (farbe && farbfamilie(r) !== farbe) return false;
      if (status === "offen" && r.probiert) return false;
      if (status === "probiert" && !r.probiert) return false;
      if (status === "leer" && !(r.rest_g != null && r.rest_g <= FAST_LEER_G)) return false;
      if (status === "ungewogen" && r.rest_g != null) return false;
      if (q && !`${r.name} ${r.hersteller} ${r.material} ${r.art} ${r.farbe} ${farbfamilie(r)}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const name = (a, b) => a.name.localeCompare(b.name, "de");
    const reihe = this._materialien();
    const mat = (a, b) => reihe.indexOf(a.material) - reihe.indexOf(b.material);
    const rest = (r) => (r.rest_g == null ? null : r.rest_g);
    const sortierer = {
      material: (a, b) => mat(a, b) || name(a, b),
      rest_auf: (a, b) => (rest(a) ?? 1e9) - (rest(b) ?? 1e9) || name(a, b),
      rest_ab: (a, b) => (rest(b) ?? -1) - (rest(a) ?? -1) || name(a, b),
      hersteller: (a, b) => a.hersteller.localeCompare(b.hersteller, "de") || name(a, b),
      farbe: (a, b) => {
        const fa = FARBFAMILIEN.indexOf(farbfamilie(a)), fb = FARBFAMILIEN.indexOf(farbfamilie(b));
        if (fa !== fb) return fa - fb;
        const ha = a.hex === "transparent" ? { h: 0, l: 1 } : hsl(a.hex), hb = b.hex === "transparent" ? { h: 0, l: 1 } : hsl(b.hex);
        return ha.h - hb.h || hb.l - ha.l;
      },
    };
    return liste.sort(sortierer[this._sort] || sortierer.material);
  }

  // Standardmaterialien, eigene Materialien und alles, was bei Rollen vorkommt
  _materialien() {
    const liste = [...MATERIAL_REIHE, ...(this._daten.materialien_eigen || [])];
    this._daten.rollen.forEach((r) => { if (!liste.includes(r.material)) liste.push(r.material); });
    return liste;
  }
  _arten(m) {
    const liste = [...(ARTEN[m] || ["Basic"]), ...((this._daten.arten_eigen || {})[m] || [])];
    return [...new Set(liste)];
  }

  _filterAktiv() { return Object.values(this._f).some(Boolean) || this._suche; }

  // ---- Restrechner --------------------------------------------------------
  _rechnerStarten(r) {
    let spule = null, spule_g = 0;
    if (r.spule && this._spule(r.spule)) { spule = r.spule; spule_g = this._spule(r.spule).g; }
    else if (r.spule_g != null) { spule = "einzel"; spule_g = r.spule_g; }
    const nenn = r.nenn_g || 1000;
    this._rechner = { brutto: (r.rest_g != null ? r.rest_g : nenn) + spule_g, spule, spule_g, nenn_g: nenn, gewogen: false };
    this._rechnerStart = JSON.stringify(this._rechner);
  }
  _rechnerGeaendert() { return this._rechner && JSON.stringify(this._rechner) !== this._rechnerStart; }

  _spuleUebernehmen(r) {
    const c = this._rechner;
    if (c.spule === "einzel") { r.spule = null; r.spule_g = c.spule_g; }
    else if (c.spule && this._spule(c.spule)) {
      this._spule(c.spule).g = c.spule_g;   // gilt für alle Rollen mit dieser Spule
      r.spule = c.spule; delete r.spule_g;
    }
  }

  _restSpeichern(mitGewicht) {
    const r = this._rolle();
    const c = this._rechner;
    r.nenn_g = c.nenn_g;
    this._spuleUebernehmen(r);
    let text = "Gespeichert.";
    if (mitGewicht || c.gewogen) {
      r.rest_g = Math.max(0, c.brutto - c.spule_g);
      r.gewogen_am = new Date().toISOString();
      text = `Restgewicht ${zahl(r.rest_g)} g gespeichert.`;
    }
    this._rechnerStarten(r);
    this._speichern();
    return text;
  }

  // ---- Ereignisse ---------------------------------------------------------
  _klick(e) {
    // Tipp auf den Label-Text: der Browser klickt danach selbst den Listen-Knopf
    if (e.target.closest("label") && e.target.closest("label").querySelector(".dd-knopf") && !e.target.closest(".dd-knopf, input, textarea")) return;
    if (this._ddOffen && !e.target.closest(".dd-liste")) {
      const war = this._ddOffen;
      this._ddZu();
      if (e.target.closest(".dd-knopf") === war.knopf) return;
    }
    const el = e.target.closest("[data-aktion]");
    if (!el) return;
    const a = el.dataset.aktion;
    if (a === "dd") { this._ddAuf(el); return; }
    if (a === "dd-wahl") { this._ddWaehlen(el); return; }
    if (a.startsWith("inv-")) { this._invKlick(a, el); return; }
    if (a.startsWith("dr-")) { this._drKlick(a, el); return; }
    if (this._klappLaeuft && (a === "zeile" || a === "gruppe")) return;
    if (a === "zeile" && el.dataset.k.startsWith("inv-")) {
      const k = el.dataset.k;
      this._klappen(`z:${k}`, this._offeneZeilen.has(k), () => { this._offeneZeilen.has(k) ? this._offeneZeilen.delete(k) : this._offeneZeilen.add(k); }, `[data-zeile="${k}"]`);
      return;
    }
    const rolle = this._rolle();
    switch (a) {
      case "menue":
        this.dispatchEvent(new Event("hass-toggle-menu", { bubbles: true, composed: true }));
        return;
      case "ansicht":
        if (el.dataset.bald) { this._toast("Kommt in einem der nächsten Schritte."); return; }
        this._ansicht = el.dataset.id;
        this._filterAuf = false;
        if (this._ansicht === "system") this._systemcheck();
        break;
      case "alle":
        this._f = { sorte: "", hersteller: "", farbe: "", status: "" };
        this._suche = "";
        break;
      case "status": this._f = { sorte: "", hersteller: "", farbe: "", status: el.dataset.id }; break;
      case "oeffnen":
        this._modus = "detail";
        this._offen = el.dataset.id;
        this._tab = "einstellungen";
        this._bearbeiten = false;
        this._offeneZeilen.clear();
        this._rechner = null;
        this._sheetScroll = 0;
        break;
      case "neu": this._ansicht === "inventar" ? this._invNeuStarten() : this._neuStarten(); break;
      case "schliessen": if (!this._schliessen()) return; break;
      case "tab":
        if (this._tab === "rest" && this._rechnerGeaendert()) this._toast(this._restSpeichern(false));
        this._tab = el.dataset.id; this._sheetScroll = 0;
        break;
      case "gruppe": {
        const g = el.dataset.id;
        this._klappen(`g:${g}`, this._gruppen.has(g), () => { this._gruppen.has(g) ? this._gruppen.delete(g) : this._gruppen.add(g); }, `[data-gruppe="${g}"]`);
        return;
      }
      case "zeile": {
        const k = el.dataset.k;
        const teil = this._bearbeiten || this._modus === "neu";   // sonst ändert sich auch der Fuß: alles neu zeichnen
        if (!this._bearbeiten) this._bearbeitenStarten(rolle, false);
        this._klappen(`z:${k}`, this._offeneZeilen.has(k), () => { this._offeneZeilen.has(k) ? this._offeneZeilen.delete(k) : this._offeneZeilen.add(k); }, teil ? `[data-zeile="${k}"]` : null);
        return;
      }
      case "verwerfen":
        this._bearbeiten = false; this._entwurf = null; this._nachTest = false; this._offeneZeilen.clear();
        break;
      case "speichern-einst": {
        const zuvor = rolle.eigen || {};
        rolle.eigen = this._nurGeaenderte(rolle, this._entwurf, zuvor);
        Object.assign(rolle, this._entwurfText);
        if (this._nachTest) { rolle.probiert = true; rolle.probiert_am = new Date().toISOString(); }
        const text = this._nachTest ? `${rolle.name} ist jetzt als probiert markiert.` : "Einstellungen gespeichert.";
        this._bearbeiten = false; this._entwurf = null; this._nachTest = false; this._offeneZeilen.clear();
        this._speichern();
        this._toast(text);
        return;
      }
      case "alle-vorschlaege":
        Object.assign(this._entwurf, { ...rolle.vorschlag, ...this._entwurf });
        FELDER.forEach((f) => this._offeneZeilen.add(f.k));
        GRUPPEN.forEach((g) => this._gruppen.add(g.id));
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
        this._bearbeitenStarten(rolle, true);
        this._tab = "einstellungen";
        FELDER.forEach((f) => this._offeneZeilen.add(f.k));
        this._offeneZeilen.add("platte");
        GRUPPEN.forEach((g) => this._gruppen.add(g.id));
        this._gruppen.add("platte");
        break;
      // Restgewicht
      case "brutto": this._rechnerSetzen("brutto", this._rechner.brutto + Number(el.dataset.d)); return;
      case "spule-wahl":
        this._rechner.spule = el.dataset.id;
        if (el.dataset.id !== "einzel") this._rechner.spule_g = this._spule(el.dataset.id).g;
        this._dialog = null;
        break;
      case "spule-weitere": this._dialog = "spule"; break;
      case "spule-neu": {
        const name = (this.shadowRoot.getElementById("spule-name").value || "").trim();
        if (!name) { this._toast("Gib der Spule einen Namen."); return; }
        const id = `spule-${Date.now().toString(36)}`;
        this._daten.spulen.push({ id, name, hersteller: rolle.hersteller || name, g: this._rechner.spule_g });
        this._rechner.spule = id;
        this._dialog = null;
        this._speichern();
        break;
      }
      case "groesse": this._dialog = "groesse"; break;
      case "groesse-wahl":
        this._rechner.nenn_g = Number(el.dataset.g);
        if (this._modus === "neu") this._neu.nenn_g = this._rechner.nenn_g;
        break;
      case "rest-speichern": this._toast(this._restSpeichern(true)); return;
      case "rest-verwerfen":
        this._rechnerStarten(rolle);
        this._toast("Änderungen verworfen.");
        return;
      // Neues Filament
      case "neu-material":
        this._neu.material = el.dataset.id;
        this._neu.art = this._arten(el.dataset.id)[0];
        this._neuVorschlag();
        break;
      case "neu-art": this._neu.art = el.dataset.id; this._neuVorschlag(); break;
      case "neu-voll": this._neu.voll = el.dataset.id === "ja"; break;
      case "neu-transparent": this._neu.hex = this._neu.hex === "transparent" ? "#3ee6a8" : "transparent"; break;
      case "neu-anlegen": this._neuAnlegen(); return;
      case "eigen-dialog": this._dialog = `eigen-${el.dataset.id}`; break;
      case "eigen-anlegen": {
        const was = el.dataset.id;
        const name = (this.shadowRoot.getElementById("eigen-name").value || "").trim();
        if (!name) { this._toast("Bitte einen Namen eingeben."); return; }
        if (was === "material") {
          const vorhanden = this._materialien().find((m) => m.toLowerCase() === name.toLowerCase());
          const m = vorhanden || name;
          if (!vorhanden) this._daten.materialien_eigen.push(m);
          this._neu.material = m;
          this._neu.art = this._arten(m)[0];
        } else {
          const m = this._neu.material;
          const vorhanden = this._arten(m).find((a) => a.toLowerCase() === name.toLowerCase());
          if (!vorhanden) (this._daten.arten_eigen[m] = this._daten.arten_eigen[m] || []).push(name);
          this._neu.art = vorhanden || name;
        }
        this._neuVorschlag();
        this._dialog = null;
        this._speichern();
        break;
      }
      case "filter-auf": this._filterAuf = !this._filterAuf; break;
      case "nochmal-laden": this._laden(); return;
      case "pruefen": this._systemcheck(); return;
      default: return;
    }
    this._zeichnen();
  }

  _schliessen() {
    if (this._dialog) { this._dialog = null; return true; }
    if (this._modus === "inv-neu" && !confirm("Neues Teil verwerfen?")) return false;
    if (this._modus === "inv-detail" || this._modus === "inv-neu") {
      this._modus = null; this._invOffen = null; this._invNeu = null; this._offeneZeilen.clear();
      return true;
    }
    if (this._modus === "neu") {
      if (!confirm("Neues Filament verwerfen?")) return false;
    } else if (this._bearbeiten) {
      if (!confirm("Geänderte Einstellungen verwerfen?")) return false;
    } else if (this._tab === "rest" && this._rechnerGeaendert()) {
      this._toastText = this._restSpeichern(false);
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => this._toastWeg(), 2600);
    }
    this._modus = null; this._offen = null; this._neu = null;
    this._bearbeiten = false; this._entwurf = null; this._rechner = null; this._offeneZeilen.clear();
    return true;
  }

  _bearbeitenStarten(rolle, nachTest) {
    this._entwurf = nachTest ? { ...rolle.vorschlag, ...rolle.eigen } : { ...rolle.eigen };
    this._entwurfText = { preset: rolle.preset, pa_profil: rolle.pa_profil, filament_setting: rolle.filament_setting };
    this._bearbeiten = true;
    this._nachTest = nachTest;
  }

  // Nur Werte, die vom Vorschlag abweichen oder schon eigene waren, werden „eigen“
  _nurGeaenderte(rolle, entwurf, zuvor) {
    const eigen = {};
    for (const [k, v] of Object.entries(entwurf)) {
      if (v == null) continue;
      if (this._nachTest || k in zuvor || v !== (rolle.vorschlag || {})[k]) eigen[k] = v;
    }
    return eigen;
  }

  _neuStarten() {
    const material = "PLA", art = "Basic";
    this._neu = {
      id: "neu", name: "", hersteller: "", material, art, farbe: "", farbcode: "", hex: "#3ee6a8",
      nenn_g: 1000, rest_g: null, spule: null, probiert: false, voll: true, eigen: {}, vorschlag: richtwerteFuer(material, art),
      preset: "", pa_profil: "", filament_setting: "", notiz: "", herstellerNeu: false,
    };
    this._modus = "neu";
    this._entwurf = this._neu.eigen;
    this._entwurfText = { preset: "", pa_profil: "", filament_setting: "" };
    this._bearbeiten = true;
    this._nachTest = false;
    this._offeneZeilen.clear();
    this._gruppen = new Set(["temp"]);
    this._rechnerStarten(this._neu);
    this._sheetScroll = 0;
  }

  _neuVorschlag() {
    this._neu.vorschlag = richtwerteFuer(this._neu.material, this._neu.art);
    // Werte, die nur dem alten Vorschlag entsprachen, nicht als eigene behalten
  }

  _neuName(n) { return `${n.material} ${n.art} ${n.farbe}`.replace(/\s+/g, " ").trim(); }

  _neuAnlegen() {
    const n = this._neu;
    if (!n.hersteller.trim()) { this._toast("Bitte einen Hersteller angeben."); return; }
    if (!n.farbe.trim()) { this._toast("Bitte die Farbe benennen."); return; }
    const name = this._neuName(n);
    const id = `${n.hersteller}-${name}`.toLowerCase().replace(/[^a-z0-9äöüß]+/g, "-") + "-" + Date.now().toString(36);
    const rolle = {
      id, name, hersteller: n.hersteller.trim(), material: n.material, art: n.art, farbe: n.farbe.trim(), farbcode: n.farbcode.trim(),
      hex: n.hex, nenn_g: this._rechner.nenn_g, rest_g: n.voll ? this._rechner.nenn_g : null, spule: null,
      probiert: false, eigen: { ...n.eigen }, vorschlag: n.vorschlag, preis_kg: null,
      ...this._entwurfText, notiz: "", angelegt_am: new Date().toISOString(),
    };
    if (n.voll) rolle.gewogen_am = rolle.angelegt_am;
    this._spuleUebernehmen(rolle);
    this._daten.rollen.push(rolle);
    this._speichern();
    this._modus = null; this._neu = null; this._bearbeiten = false; this._entwurf = null; this._rechner = null;
    this._toast(`${rolle.name} angelegt, als „noch nicht probiert“ markiert.`);
  }

  _eingabe(e) {
    const t = e.target;
    if (this._invEingabe(t)) return;
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
    } else if (t.dataset.neu) {
      this._neu[t.dataset.neu] = t.value;
      if (t.dataset.neu === "hex" || t.dataset.neu === "farbe") this._neuKopfAktualisieren();
    } else if (t.dataset.info) {
      const rolle = this._rolle();
      const v = Number(t.value);
      const anzeige = this.shadowRoot.getElementById(`info-${t.dataset.info}`);
      if (anzeige) anzeige.textContent = v === 0 ? "nicht gesetzt" : `${zahl(v, 2)} €`;
      rolle[t.dataset.info] = v === 0 ? null : v;
    }
  }

  _aenderung(e) {
    const t = e.target;
    if (this._invAenderung(t)) return;
    if (t.dataset.filter != null) { this._f[t.dataset.filter] = t.value; this._zeichnen(); return; }
    if (t.id === "sortierung") { this._sort = t.value; this._zeichnen(); return; }
    if (t.dataset.info) this._speichern();
    if (t.id === "notiz") { this._rolle().notiz = t.value; this._speichern(); }
    if (t.dataset.platte != null) {
      this._entwurf.platte = t.value;
      const zeile = this.shadowRoot.querySelector('[data-zeile="platte"]');
      if (zeile) { zeile.className = "zeile eigen"; zeile.querySelector(".wert").textContent = t.value; const tag = zeile.querySelector(".tag"); if (tag) tag.remove(); }
    }
    if (t.id === "neu-hersteller") {
      if (t.value === "__neu") { this._neu.herstellerNeu = true; this._neu.hersteller = ""; }
      else { this._neu.herstellerNeu = false; this._neu.hersteller = t.value; }
      this._rechnerSpuleVorschlagen();
      this._zeichnen();
    }
    if (t.dataset.neu === "hersteller") { this._rechnerSpuleVorschlagen(); this._zeichnen(); }
  }

  // Bei neuem Filament: passende Spule des Herstellers vorschlagen
  _rechnerSpuleVorschlagen() {
    if (this._modus !== "neu") return;
    const passend = this._daten.spulen.filter((s) => s.hersteller.toLowerCase() === this._neu.hersteller.trim().toLowerCase());
    if (passend.length) { this._rechner.spule = passend[0].id; this._rechner.spule_g = passend[0].g; }
    else if (this._rechner.spule !== "einzel") { this._rechner.spule = null; }
  }

  _neuKopfAktualisieren() {
    const kopf = this.shadowRoot.getElementById("neu-vorschau");
    if (kopf) kopf.innerHTML = this._neuVorschauHtml();
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
    if (slider) { const i = zeile.querySelector("input"); if (i) i.value = v; }
  }

  _rechnerSetzen(k, v, slider = true) {
    const max = k === "brutto" ? 3500 : k === "nenn_g" ? 3000 : 500;
    v = Math.max(0, Math.min(max, Math.round(v)));
    this._rechner[k] = v;
    if (k === "brutto") this._rechner.gewogen = true;
    if (k === "spule_g" && !this._rechner.spule) this._rechner.spule = "einzel";
    if (k === "nenn_g" && this._modus === "neu") this._neu.nenn_g = v;
    const el = this.shadowRoot.getElementById(`r-${k}`);
    if (el) el.textContent = k === "nenn_g" ? gramm(v) : `${zahl(v)} g`;
    if (slider) { const s = this.shadowRoot.querySelector(`[data-rechner="${k}"]`); if (s) s.value = v; }
    const erg = this.shadowRoot.getElementById("r-ergebnis");
    if (erg) erg.innerHTML = this._rechnerErgebnisHtml();
    const verwerfen = this.shadowRoot.querySelector('[data-aktion="rest-verwerfen"]');
    if (verwerfen) verwerfen.disabled = !this._rechnerGeaendert();
    if (k === "nenn_g") this.shadowRoot.querySelectorAll("[data-aktion=groesse-wahl]").forEach((c) => c.classList.toggle("an", Number(c.dataset.g) === v));
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
    const fokusId = root.activeElement && ["suche", "inv-suche"].includes(root.activeElement.id) ? root.activeElement.id : null;
    const schonDa = new Set([...root.querySelectorAll("[data-einmal]")].map((x) => x.dataset.einmal));
    this._ddOffen = null;

    root.innerHTML = `${this._stilFest ? "" : `<style>${STIL}</style>`}
      <div class="app ${this._mobil ? "mobil" : ""}">
        ${this._kopfHtml()}
        <main class="haupt">${this._inhaltHtml()}</main>
        ${["filament", "inventar"].includes(this._ansicht) && this._daten && !this._modus ? `<button class="fab" data-aktion="neu" aria-label="Hinzufügen" title="${this._ansicht === "inventar" ? "Teil hinzufügen" : "Filament hinzufügen"}">+</button>` : ""}
        ${this._mobil ? this._navHtml("unten") : ""}
        ${this._modus === "detail" ? this._sheetHtml() : ""}
        ${this._modus === "neu" ? this._neuSheetHtml() : ""}
        ${this._modus === "inv-detail" || this._modus === "inv-neu" ? this._invSheetHtml() : ""}
        ${this._dialogHtml()}
        ${this._toastText ? `<div class="toast" data-einmal="toast-${esc(this._toastText)}">${esc(this._toastText)}</div>` : ""}
      </div>`;

    const h = root.querySelector(".haupt");
    if (h) h.scrollTop = scrollHaupt;
    const s = root.querySelector(".sheet-inhalt");
    if (s && this._sheetScroll) s.scrollTop = this._sheetScroll;
    const i = fokusId && root.getElementById(fokusId);
    if (i) {
      i.focus();
      i.setSelectionRange(i.value.length, i.value.length);
    }
    // Einblend-Animationen nur beim ersten Erscheinen, nicht bei jedem Neuzeichnen
    root.querySelectorAll("[data-einmal]").forEach((x) => { if (schonDa.has(x.dataset.einmal)) x.classList.add("still"); });
    this._auswahlenBauen();
    if (this._klappNeu) {
      const k = root.querySelector(`[data-klapp="${this._klappNeu}"]`);
      this._klappNeu = null;
      if (k) this._klappAnimieren(k, true);
    }
  }

  // ---- Aufklappen mit Animation (nach unten fahren) -----------------------
  // teil: Selektor des Bereichs, der allein neu gezeichnet werden darf (schneller, nichts flackert)
  _klappen(schluessel, istAuf, umschalten, teil) {
    const neu = () => (teil && this._teilweise(teil)) || (this._zeichnen(), true);
    const el = istAuf && this.shadowRoot.querySelector(`[data-klapp="${schluessel}"]`);
    if (!el) {
      umschalten();
      if (istAuf) { neu(); return; }
      this._klappNeu = schluessel;
      neu();
      const k = this._klappNeu && this.shadowRoot.querySelector(`[data-klapp="${schluessel}"]`);
      this._klappNeu = null;
      if (k) this._klappAnimieren(k, true);
      return;
    }
    const gruppe = el.parentElement.closest(".gruppe");
    if (gruppe && schluessel.startsWith("g:")) gruppe.classList.remove("auf");
    this._klappLaeuft = true;
    this._klappAnimieren(el, false, () => { this._klappLaeuft = false; umschalten(); neu(); });
  }

  // Nur ein Element der offenen Detailansicht durch seine neue Fassung ersetzen
  _teilweise(selektor) {
    const root = this.shadowRoot;
    const alt = root.querySelector(`.sheet ${selektor}`);
    if (!alt) return false;
    const html = this._modus === "detail" ? this._sheetHtml() : this._modus === "neu" ? this._neuSheetHtml()
      : this._modus === "inv-detail" || this._modus === "inv-neu" ? this._invSheetHtml() : null;
    if (!html) return false;
    const vorlage = document.createElement("template");
    vorlage.innerHTML = html;
    const neu = vorlage.content.querySelector(selektor);
    if (!neu) return false;
    alt.replaceWith(neu);
    this._auswahlenBauen();
    return true;
  }

  _klappAnimieren(el, auf, fertig) {
    const h = el.scrollHeight;
    const ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (ruhig || !el.animate) { fertig && fertig(); return; }
    el.style.overflow = "hidden";
    const schritte = [{ height: "0px", opacity: 0 }, { height: `${h}px`, opacity: 1 }];
    const anim = el.animate(auf ? schritte : schritte.reverse(), { duration: Math.min(320, 160 + h * 0.4), easing: "cubic-bezier(.2,.7,.2,1)" });
    anim.onfinish = () => { el.style.overflow = ""; fertig && fertig(); };
    if (auf) {
      const pfeil = el.parentElement.querySelector(":scope > .gruppe-kopf .pfeil");
      if (pfeil) pfeil.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(90deg)" }], { duration: 180, easing: "ease" });
    }
  }

  // ---- Eigene Auswahllisten statt der Browser-Liste -----------------------
  // Das <select> bleibt (unsichtbar) die Quelle des Werts; ein Knopf zeigt ihn an.
  _auswahlenBauen() {
    this.shadowRoot.querySelectorAll("select:not(.dd-nativ)").forEach((sel) => {
      const i = (this._ddNr = (this._ddNr || 0) + 1);
      sel.classList.add("dd-nativ");
      sel.tabIndex = -1;
      sel.dataset.dd = String(i);
      const opt = sel.options[sel.selectedIndex];
      const knopf = document.createElement("button");
      knopf.type = "button";
      knopf.className = `dd-knopf ${sel.classList.contains("text") ? "text" : ""}`;
      knopf.dataset.aktion = "dd";
      knopf.dataset.dd = String(i);
      knopf.innerHTML = `<span class="dd-text ${!opt || opt.disabled ? "leise" : ""}"></span><span class="dd-pfeil">▾</span>`;
      knopf.firstChild.textContent = opt ? opt.textContent : "";
      sel.before(knopf);   // zuerst im <label>, damit ein Tipp aufs Label die Liste öffnet
    });
  }

  _ddAuf(knopf) {
    const root = this.shadowRoot;
    const sel = root.querySelector(`select[data-dd="${knopf.dataset.dd}"]`);
    const app = root.querySelector(".app");
    if (!sel || !app) return;
    let html = "";
    for (const kind of sel.children) {
      if (kind.tagName === "OPTGROUP") {
        html += `<div class="dd-gruppe">${esc(kind.label)}</div>`;
        for (const o of kind.children) html += this._ddOptionHtml(o, sel, true);
      } else html += this._ddOptionHtml(kind, sel, false);
    }
    const liste = document.createElement("div");
    liste.className = "dd-liste";
    liste.setAttribute("role", "listbox");
    liste.innerHTML = html;
    app.appendChild(liste);
    const a = app.getBoundingClientRect(), k = knopf.getBoundingClientRect();
    const breite = Math.max(k.width, 200);
    const links = Math.min(Math.max(8, k.left - a.left), a.width - breite - 8);
    const unten = a.bottom - k.bottom - 12, oben = k.top - a.top - 12;
    const nachOben = unten < 260 && oben > unten;
    liste.style.left = `${links}px`;
    liste.style.width = `${breite}px`;
    liste.style.maxHeight = `${Math.min(360, nachOben ? oben : unten)}px`;
    if (nachOben) { liste.style.bottom = `${a.bottom - k.top + 6}px`; liste.classList.add("nach-oben"); }
    else liste.style.top = `${k.bottom - a.top + 6}px`;
    knopf.classList.add("offen");
    const stand = new Map([...this.shadowRoot.querySelectorAll(".haupt, .sheet-inhalt, .dialog")].map((x) => [x, x.scrollTop]));
    this._ddOffen = { liste, knopf, stand };
    const an = liste.querySelector(".an");
    if (an) liste.scrollTop = Math.max(0, an.offsetTop - liste.clientHeight / 2);
  }

  // Liste schließen, wenn die Seite darunter wirklich bewegt wird (nicht bei verspäteten Scroll-Meldungen)
  _ddBeimScrollen(ziel) {
    const d = this._ddOffen;
    if (!d || d.liste.contains(ziel) || !ziel.matches || !ziel.matches(".haupt, .sheet-inhalt, .dialog")) return;
    if (!d.stand.has(ziel)) d.stand.set(ziel, ziel.scrollTop);
    if (Math.abs(ziel.scrollTop - d.stand.get(ziel)) > 4) this._ddZu();
  }

  _ddOptionHtml(o, sel, eingerueckt) {
    if (o.disabled) return "";
    const an = o.value === sel.value;
    return `<button type="button" class="dd-option ${an ? "an" : ""} ${eingerueckt ? "eingerueckt" : ""}" role="option" data-aktion="dd-wahl" data-dd="${sel.dataset.dd}" data-wert="${esc(o.value)}">
      <span>${esc(o.textContent)}</span>${an ? "<i>✓</i>" : ""}</button>`;
  }

  _ddWaehlen(el) {
    const sel = this.shadowRoot.querySelector(`select[data-dd="${el.dataset.dd}"]`);
    this._ddZu();
    if (!sel || sel.value === el.dataset.wert) return;
    sel.value = el.dataset.wert;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  }

  _ddZu() {
    if (!this._ddOffen) return;
    this._ddOffen.liste.remove();
    this._ddOffen.knopf.classList.remove("offen");
    this._ddOffen = null;
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
    if (this._ansicht === "inventar") return this._invHtml();
    if (this._ansicht === "drucker") return this._drHtml();
    return this._filamentHtml();
  }

  _auswahl(name, schluessel, leer, optionen) {
    const aktiv = this._f[schluessel];
    return `<label class="auswahl ${aktiv ? "an" : ""}"><span>${name}</span>
      <select data-filter="${schluessel}">
        <option value="">${leer}</option>${optionen}
      </select></label>`;
  }

  _filamentHtml() {
    const rollen = this._daten.rollen;
    const gewogen = rollen.filter((r) => r.rest_g != null);
    const gesamt = gewogen.reduce((s, r) => s + r.rest_g, 0);
    const offen = rollen.filter((r) => !r.probiert).length;
    const leer = rollen.filter((r) => r.rest_g != null && r.rest_g <= FAST_LEER_G).length;
    const ungewogen = rollen.length - gewogen.length;
    const stat = (wert, text, status, klasse = "") =>
      `<button class="stat ${klasse}" ${status ? `data-aktion="status" data-id="${status}"` : ""}><strong>${wert}</strong><span>${text}</span></button>`;
    const opt = (wert, text) => `<option value="${esc(wert)}">${esc(text)}</option>`;

    const sorten = this._materialien().filter((m) => rollen.some((r) => r.material === m)).map((m) => {
      const arten = [...new Set(rollen.filter((r) => r.material === m).map((r) => r.art).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
      return `<optgroup label="${m}">${opt(`m|${m}`, `Alle ${m}`)}${arten.map((a) => opt(`a|${m}|${a}`, a.startsWith(m) ? a : `${a}-${m}`)).join("")}</optgroup>`;
    }).join("");
    const hersteller = [...new Set(rollen.map((r) => r.hersteller))].sort((a, b) => a.localeCompare(b, "de")).map((h) => opt(h, h)).join("");
    const farben = FARBFAMILIEN.filter((f) => rollen.some((r) => farbfamilie(r) === f)).map((f) => opt(f, f)).join("");
    const status = STATUS.map((s) => opt(s.id, s.name)).join("");
    const anzahl = Object.values(this._f).filter(Boolean).length;
    const mitWert = (html, w) => html.replace(`value="${esc(w)}"`, `value="${esc(w)}" selected`);

    return `
      <section class="stats">
        ${stat(rollen.length, "Rollen", null)}
        ${stat(`${zahl(gesamt / 1000, 1)} kg`, "Filament übrig", null)}
        ${stat(offen, "nicht probiert", "offen", "amber")}
        ${stat(leer, "fast leer", "leer", leer ? "rot" : "")}
        ${stat(ungewogen, "nicht gewogen", "ungewogen")}
      </section>
      <section class="werkzeug">
        <button class="chip alle ${this._filterAktiv() ? "" : "an"}" data-aktion="alle">Alle</button>
        ${this._mobil ? `<button class="auswahl filter-knopf ${anzahl ? "an" : ""}" data-aktion="filter-auf"><span>Filter</span><strong>${anzahl ? `${anzahl} aktiv` : "Keiner"}</strong></button>` : ""}
        ${!this._mobil || this._filterAuf ? `<div class="unterfilter" data-einmal="filter">
          ${this._auswahl("Material", "sorte", "Alle Materialien", mitWert(sorten, this._f.sorte))}
          ${this._auswahl("Hersteller", "hersteller", "Alle Hersteller", mitWert(hersteller, this._f.hersteller))}
          ${this._auswahl("Farbe", "farbe", "Alle Farben", mitWert(farben, this._f.farbe))}
          ${this._auswahl("Status", "status", "Jeder Status", mitWert(status, this._f.status))}
        </div>` : ""}
        <label class="auswahl sort"><span>Sortieren</span>
          <select id="sortierung">${SORTIERUNG.map((s) => `<option value="${s.id}" ${this._sort === s.id ? "selected" : ""}>${s.name}</option>`).join("")}</select>
        </label>
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
      return `<button class="kachel ${r.probiert ? "" : "offen"}" data-aktion="oeffnen" data-id="${esc(r.id)}">
        ${r.probiert ? "" : `<span class="badge-offen">noch nicht probiert</span>`}
        <div class="kachel-spule">${spuleSvg(r)}</div>
        <div class="kachel-name">${esc(r.name)}</div>
        <div class="kachel-sub">${esc(r.hersteller)}</div>
        <div class="kachel-fuss">
          <span class="mat" style="--m:${materialInfo(r.material).farbe}">${esc(r.art === "Wood" ? "Wood-PLA" : r.material)}</span>
          <span class="rest ${r.rest_g == null ? "leise" : p <= 10 ? "rot" : p <= 20 ? "amber" : ""}">${rest}</span>
        </div>
      </button>`;
    }).join("");
  }

  // ---- Detailansicht ------------------------------------------------------
  _sheetHtml() {
    const r = this._rolle();
    if (!r) return "";
    const tabs = [["einstellungen", "Einstellungen"], ["rest", "Restgewicht"], ["infos", "Infos"]];
    let fuss = "";
    if (this._tab === "einstellungen") {
      if (this._bearbeiten) {
        fuss = `<button class="knopf leise" data-aktion="verwerfen">Verwerfen</button>
          <button class="knopf" data-aktion="speichern-einst">${this._nachTest ? "Speichern & als probiert markieren" : "Speichern"}</button>`;
      } else if (!r.probiert) {
        fuss = `<button class="knopf amber" data-aktion="probiert">✓ Probiert</button>`;
      }
    }
    return `<div class="schleier" data-aktion="schliessen" data-einmal="schleier"></div>
      <section class="sheet" data-einmal="sheet-${this._modus}" role="dialog" aria-label="${esc(r.name)}">
        <div class="griff"></div>
        <header class="sheet-kopf">
          ${spuleSvg(r, true)}
          <div class="sheet-titel">
            <h2>${esc(r.name)}</h2>
            <div class="sub">${esc(r.hersteller)} · ${esc(sorteName(r))} · ${esc(r.farbe)}</div>
            ${r.probiert
              ? `<span class="pille mint">✓ probiert${r.probiert_am ? ` am ${new Date(r.probiert_am).toLocaleDateString("de-DE")}` : ""}</span>`
              : `<span class="pille amber">noch nicht probiert</span>`}
          </div>
          <button class="icon-knopf" data-aktion="schliessen" aria-label="Schließen">✕</button>
        </header>
        <div class="tabs">${tabs.map(([id, n]) => `<button class="tab ${this._tab === id ? "an" : ""}" data-aktion="tab" data-id="${id}" ${this._bearbeiten ? "disabled" : ""}>${n}</button>`).join("")}</div>
        <div class="sheet-inhalt">
          ${this._tab === "einstellungen" ? this._letzterDruckHtml(r) + this._einstellungenHtml(r) : this._tab === "rest" ? this._restHtml(r) : this._infosHtml(r)}
        </div>
        ${fuss ? `<footer class="sheet-fuss">${fuss}</footer>` : ""}
      </section>`;
  }

  // Platzhalter: wird mit der Druckverbuchung (nächster Schritt) gefüllt
  _letzterDruckHtml(r) {
    const d = r.letzter_druck;
    return `<div class="letzter-druck">
      <div class="ld-bild">${d && d.bild ? `<img src="${esc(d.bild)}" alt="">` : "🖼️"}</div>
      <div class="ld-text">
        <strong>Letzter Druck</strong>
        <span class="leise klein">${d ? esc(d.name) : "Noch kein Druck mit dieser Rolle verbucht. Erscheint, sobald die Verbuchung läuft."}</span>
      </div>
      <button class="knopf leise klein-knopf" disabled>Zum Druck ›</button>
    </div>`;
  }

  _einstellungenHtml(r) {
    const bearb = this._bearbeiten;
    const neu = this._modus === "neu";
    const anzeige = (k) => {
      if (!bearb || this._entwurf[k] == null) return wert(r, k);
      const v = this._entwurf[k];
      const eigen = this._nachTest || k in (r.eigen || {}) || v !== (r.vorschlag || {})[k];
      return { v, quelle: eigen ? "eigen" : "vorschlag" };
    };
    const hatVorschlaege = [...FELDER.map((f) => f.k), "platte"].some((k) => anzeige(k).quelle === "vorschlag");
    let html = "";
    if (bearb && this._nachTest) html += `<div class="hinweis mint">Stell die Werte so ein, wie du sie beim Testdruck benutzt hast, und tippe dann auf Speichern.</div>`;
    if (!kenntMaterial(r.material)) html += `<div class="hinweis amber">Für ${esc(r.material)} habe ich keine eigenen Richtwerte. Die Vorschläge stammen von PLA, bitte vor dem ersten Druck anpassen.</div>`;
    if (neu) html += `<div class="hinweis amber">Vorschläge für ${esc(sorteName(r))}. Was du nicht änderst, bleibt orange als Vorschlag markiert. Die Rolle ist bis zum Testdruck „noch nicht probiert“.</div>`;
    else if (!r.probiert && !bearb) html += `<div class="hinweis amber">Diese Rolle hast du noch nicht probiert. Die Werte sind Vorschläge${r.herkunft ? `: ${esc(r.herkunft)}` : " für diese Materialart."}</div>`;
    if (!neu && r.probiert && !bearb && !Object.keys(r.eigen || {}).length) html += `<div class="hinweis">Du druckst diese Rolle mit dem Preset „${esc(r.preset || "–")}“. Die Werte hier sind Richtwerte dafür, bis du deine eigenen einträgst.</div>`;
    if (r.hinweis) html += `<div class="hinweis">💡 ${esc(r.hinweis)}</div>`;
    html += `<div class="legende"><span><i class="dot mint"></i>dein Wert</span><span><i class="dot amber"></i>Vorschlag</span>
      <span class="leise">Tippe auf einen Wert, um ihn zu ändern.</span>
      ${bearb && hatVorschlaege && !neu ? `<button class="mini" data-aktion="alle-vorschlaege">Alle Vorschläge übernehmen</button>` : ""}</div>`;

    for (const g of GRUPPEN) {
      const felder = FELDER.filter((f) => f.g === g.id);
      html += this._gruppeHtml(g.id, g.icon, g.name, felder.map((f) => zahl(anzeige(f.k).v, feldNk(f))).join(" · "),
        felder.every((f) => anzeige(f.k).quelle !== "eigen"),
        felder.map((f) => {
          const w = anzeige(f.k);
          const auf = this._offeneZeilen.has(f.k);
          return `<div class="zeile ${w.quelle} ${auf ? "auf" : ""}" data-zeile="${f.k}">
            <button class="zeile-kopf" data-aktion="zeile" data-k="${f.k}"><span class="z-name">${f.name}</span>
              <span class="z-wert"><span class="wert">${zahl(w.v, feldNk(f))} ${f.e}</span>${w.quelle === "vorschlag" ? '<span class="tag">Vorschlag</span>' : ""}</span></button>
            ${auf ? `<div class="klapp" data-klapp="z:${f.k}"><div class="regler-zeile">
              <button class="rund" data-aktion="schritt" data-k="${f.k}" data-d="-1" aria-label="weniger">−</button>
              <input type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${w.v ?? f.min}" data-feld="${f.k}">
              <button class="rund" data-aktion="schritt" data-k="${f.k}" data-d="1" aria-label="mehr">+</button>
            </div></div>` : ""}
          </div>`;
        }).join(""));
      if (g.id === "fluss") html += this._platteHtml(r, anzeige);
    }

    const profil = [["preset", "Preset"], ["pa_profil", "PA-Profil"], ["filament_setting", "Filament-Einstellung"]];
    const profilAuf = this._offeneZeilen.has("profil");
    html += this._gruppeHtml("profil", "🗂️", "Profile in Bambu Studio", esc((bearb ? this._entwurfText.preset : r.preset) || "kein Preset"), false,
      `${profil.map(([k, n]) => `<div class="zeile"><div class="zeile-kopf statisch"><span class="z-name">${n}</span>
        ${bearb ? "" : `<span class="z-wert">${esc(r[k] || "–")}</span>`}</div>
        ${bearb ? `<input class="text" data-text="${k}" value="${esc(this._entwurfText[k] || "")}" placeholder="Name in Bambu Studio">` : ""}</div>`).join("")}
       ${bearb || profilAuf ? "" : `<button class="mini mint-rand" data-aktion="zeile" data-k="profil">Profile bearbeiten</button>`}`);
    return html;
  }

  _platteHtml(r, anzeige) {
    const w = anzeige("platte");
    const auf = this._offeneZeilen.has("platte");
    return this._gruppeHtml("platte", "🔲", "Druckbett", esc(w.v || "–"), w.quelle !== "eigen",
      `<div class="zeile ${w.quelle} ${auf ? "auf" : ""}" data-zeile="platte">
        <button class="zeile-kopf" data-aktion="zeile" data-k="platte"><span class="z-name">Druckbetttyp</span>
          <span class="z-wert"><span class="wert">${esc(w.v || "–")}</span>${w.quelle === "vorschlag" ? '<span class="tag">Vorschlag</span>' : ""}</span></button>
        ${auf ? `<div class="klapp" data-klapp="z:platte"><select class="text" data-platte="1">${PLATTEN.map((p) => `<option ${p === w.v ? "selected" : ""}>${esc(p)}</option>`).join("")}</select></div>` : ""}
      </div>`);
  }

  _gruppeHtml(id, icon, name, zusammenfassung, nurVorschlag, inhalt) {
    const auf = this._gruppen.has(id);
    return `<div class="gruppe ${auf ? "auf" : ""}" data-gruppe="${id}">
      <button class="gruppe-kopf" data-aktion="gruppe" data-id="${id}">
        <span class="g-icon">${icon}</span><span class="g-name">${name}</span>
        <span class="g-zus ${nurVorschlag ? "amber" : ""}">${zusammenfassung}</span><span class="pfeil">›</span>
      </button>
      ${auf ? `<div class="klapp" data-klapp="g:${id}"><div class="gruppe-inhalt">${inhalt}</div></div>` : ""}
    </div>`;
  }

  // ---- Restgewicht --------------------------------------------------------
  _restHtml(r) {
    if (!this._rechner) this._rechnerStarten(r);
    const c = this._rechner;
    const p = prozent(r);
    const m = r.rest_g != null ? r.rest_g / grammProMeter(r.material) : null;
    return `
      <div class="rest-jetzt">
        <div class="rest-zeile">
          <div><span class="gross-zahl">${r.rest_g == null ? "?" : zahl(r.rest_g)}</span><span class="einheit">${r.rest_g == null ? "nicht gewogen" : "g übrig"}</span></div>
          <button class="groesse-knopf" data-aktion="groesse">Spule: <strong id="r-nenn_g">${gramm(c.nenn_g)}</strong> ▾</button>
        </div>
        ${p != null ? `<div class="balken"><i style="width:${p}%"></i></div>
          <div class="leise klein">${p} % von ${gramm(r.nenn_g)} · ca. ${zahl(m)} m${r.gewogen_am ? ` · gewogen am ${new Date(r.gewogen_am).toLocaleDateString("de-DE")}` : ""}</div>` : ""}
      </div>
      <h3>⚖️ Rolle wiegen</h3>
      <p class="leise klein">Leg die Rolle mit Spule auf die Waage und stell das Gewicht ein. Das Leergewicht der Spule wird abgezogen.</p>
      <div class="rechner-block">
        <div class="r-kopf"><span>Waage zeigt</span><strong id="r-brutto">${zahl(c.brutto)} g</strong></div>
        <div class="regler-zeile">
          <button class="rund" data-aktion="brutto" data-d="-10">−10</button>
          <button class="rund" data-aktion="brutto" data-d="-1">−1</button>
          <input type="range" min="0" max="3500" step="1" value="${c.brutto}" data-rechner="brutto">
          <button class="rund" data-aktion="brutto" data-d="1">+1</button>
          <button class="rund" data-aktion="brutto" data-d="10">+10</button>
        </div>
      </div>
      ${this._spuleBlockHtml(r)}
      <div id="r-ergebnis" class="ergebnis ${r.rest_g != null && Math.max(0, c.brutto - c.spule_g) === r.rest_g ? "" : "ungespeichert"}">${this._rechnerErgebnisHtml()}</div>
      <div class="knopf-reihe">
        <button class="knopf rot-knopf" data-aktion="rest-verwerfen" ${this._rechnerGeaendert() ? "" : "disabled"}>Änderung verwerfen</button>
        <button class="knopf" data-aktion="rest-speichern">Als Restgewicht speichern</button>
      </div>
      <p class="leise klein mitte">Schließt du mit ✕, wird automatisch gespeichert.</p>`;
  }

  _spuleBlockHtml(r) {
    const c = this._rechner;
    const herst = (r.hersteller || "").trim().toLowerCase();
    const passend = this._daten.spulen.filter((s) => s.hersteller.toLowerCase() === herst);
    const gewaehlt = c.spule && c.spule !== "einzel" ? this._spule(c.spule) : null;
    const chips = [...passend];
    if (gewaehlt && !chips.includes(gewaehlt)) chips.unshift(gewaehlt);
    const nutzer = gewaehlt ? this._spulenNutzer(gewaehlt.id) + (r.spule === gewaehlt.id ? 0 : 1) : 0;
    let hinweis = "";
    if (c.spule === "einzel") hinweis = `<div class="hinweis klein">Einzelfall: Dieses Gewicht gilt nur für diese Rolle und ist mit keiner Spule verknüpft.</div>`;
    else if (gewaehlt) hinweis = `<div class="leise klein sync">🔗 Änderst du das Gewicht, gilt es für ${nutzer === 1 ? "diese Rolle" : `alle ${nutzer} Rollen`} mit der Spule „${esc(gewaehlt.name)}“.</div>`;
    else hinweis = `<div class="hinweis amber klein">Für ${esc(r.hersteller || "diesen Hersteller")} ist noch keine Spule hinterlegt. Unter „Weitere“ kannst du eine anlegen oder „Einzelfall“ wählen.</div>`;
    return `<div class="rechner-block">
      <div class="r-kopf"><span>Leere Spule</span><strong id="r-spule_g">${zahl(c.spule_g)} g</strong></div>
      <div class="chips spulen">
        ${chips.map((s) => `<button class="chip ${c.spule === s.id ? "an" : ""}" data-aktion="spule-wahl" data-id="${s.id}">${esc(s.name)}</button>`).join("")}
        ${c.spule === "einzel" ? `<button class="chip an" data-aktion="spule-weitere">Einzelfall</button>` : ""}
        <button class="chip weitere" data-aktion="spule-weitere">Weitere …</button>
      </div>
      <div class="regler-zeile"><input type="range" min="0" max="500" step="1" value="${c.spule_g}" data-rechner="spule_g"></div>
      ${hinweis}
    </div>`;
  }

  _rechnerErgebnisHtml() {
    const r = this._rolle();
    const c = this._rechner;
    const rest = Math.max(0, c.brutto - c.spule_g);
    const p = Math.round((rest / (c.nenn_g || 1000)) * 100);
    const gleich = r.rest_g != null && rest === r.rest_g;
    const titel = gleich ? "Entspricht dem gespeicherten Restgewicht"
      : `Neu berechnet, noch nicht gespeichert${r.rest_g != null ? ` (bisher ${zahl(r.rest_g)} g)` : ""}`;
    const box = this.shadowRoot.getElementById("r-ergebnis");
    if (box) box.classList.toggle("ungespeichert", !gleich);
    return `<span class="leise">${titel}</span><strong>${zahl(rest)} g</strong>
      <span class="leise">${p} % von ${gramm(c.nenn_g)} · ca. ${zahl(rest / grammProMeter(r.material))} m</span>`;
  }

  _infosHtml(r) {
    const zeile = (n, v) => `<div class="info-zeile"><span>${n}</span><strong>${esc(v || "–")}</strong></div>`;
    return `
      <div class="info-liste">
        ${zeile("Hersteller", r.hersteller)}${zeile("Material", r.material)}${zeile("Art", r.art)}
        ${zeile("Farbe", `${r.farbe} (${farbfamilie(r)})`)}${zeile("Farbcode", r.farbcode)}${zeile("Spulengröße", gramm(r.nenn_g || 1000))}
      </div>
      <div class="rechner-block">
        <div class="r-kopf"><span>Preis pro kg</span><strong id="info-preis_kg">${r.preis_kg ? `${zahl(r.preis_kg, 2)} €` : "nicht gesetzt"}</strong></div>
        <input type="range" min="0" max="80" step="0.5" value="${r.preis_kg || 0}" data-info="preis_kg">
      </div>
      <h3>Notizen</h3>
      <textarea id="notiz" rows="4" placeholder="z. B. Schichthöhe, Besonderheiten …">${esc(r.notiz)}</textarea>`;
  }

  // ---- Filament hinzufügen ------------------------------------------------
  _neuVorschauHtml() {
    const n = this._neu;
    return `${spuleSvg({ ...n, id: "neu", rest_g: n.voll ? n.nenn_g : null }, true)}
      <div class="sheet-titel"><h2>Neues Filament</h2>
        <div class="sub">${esc(n.hersteller || "Hersteller?")} · ${esc(this._neuName(n) || "–")}</div>
        <span class="pille amber">wird als „noch nicht probiert“ angelegt</span></div>`;
  }

  _neuSheetHtml() {
    const n = this._neu;
    const bekannt = [...new Set(this._daten.rollen.map((r) => r.hersteller))].sort((a, b) => a.localeCompare(b, "de"));
    const c = this._rechner;
    const groessen = [...new Set([...this._daten.rollen.map((r) => r.nenn_g || 1000), ...STANDARD_GROESSEN])].sort((a, b) => a - b);
    return `<div class="schleier" data-aktion="schliessen" data-einmal="schleier"></div>
      <section class="sheet" data-einmal="sheet-${this._modus}" role="dialog" aria-label="Neues Filament">
        <div class="griff"></div>
        <header class="sheet-kopf"><div id="neu-vorschau" class="neu-vorschau">${this._neuVorschauHtml()}</div>
          <button class="icon-knopf" data-aktion="schliessen" aria-label="Schließen">✕</button></header>
        <div class="sheet-inhalt">
          <h3 class="abschnitt">1 · Grunddaten</h3>
          <div class="formular">
            <label>Hersteller
              <select id="neu-hersteller" class="text">
                <option value="" ${!n.hersteller && !n.herstellerNeu ? "selected" : ""} disabled>Bitte wählen</option>
                ${bekannt.map((h) => `<option ${h === n.hersteller && !n.herstellerNeu ? "selected" : ""}>${esc(h)}</option>`).join("")}
                <option value="__neu" ${n.herstellerNeu ? "selected" : ""}>Neuer Hersteller …</option>
              </select></label>
            ${n.herstellerNeu ? `<label>Name des Herstellers<input class="text" data-neu="hersteller" value="${esc(n.hersteller)}" placeholder="z. B. Polymaker"></label>` : ""}
            <div class="feld-titel">Material</div>
            <div class="chips">${this._materialien().map((m) => `<button class="chip ${n.material === m ? "an" : ""}" data-aktion="neu-material" data-id="${esc(m)}">${esc(m)}</button>`).join("")}
              <button class="chip weitere" data-aktion="eigen-dialog" data-id="material">+ Neu hinzufügen</button></div>
            <div class="feld-titel">Art</div>
            <div class="chips">${this._arten(n.material).map((a) => `<button class="chip ${n.art === a ? "an" : ""}" data-aktion="neu-art" data-id="${esc(a)}">${esc(a)}</button>`).join("")}
              <button class="chip weitere" data-aktion="eigen-dialog" data-id="art">+ Neu hinzufügen</button></div>
            <label>Farbe<input class="text" data-neu="farbe" value="${esc(n.farbe)}" placeholder="z. B. Dunkelblau"></label>
            <div class="farb-zeile">
              <label class="farbwahl">Farbton<input type="color" data-neu="hex" value="${n.hex === "transparent" ? "#ffffff" : esc(n.hex)}" ${n.hex === "transparent" ? "disabled" : ""}></label>
              <button class="chip ${n.hex === "transparent" ? "an" : ""}" data-aktion="neu-transparent">Transparent</button>
            </div>
            <label>Farbcode (optional)<input class="text" data-neu="farbcode" value="${esc(n.farbcode)}" placeholder="vom Etikett"></label>
          </div>

          <h3 class="abschnitt">2 · Menge &amp; Spule</h3>
          <div class="rechner-block">
            <div class="r-kopf"><span>Spulengröße</span><strong id="r-nenn_g">${gramm(c.nenn_g)}</strong></div>
            <input type="range" min="100" max="3000" step="50" value="${c.nenn_g}" data-rechner="nenn_g">
            <div class="chips">${groessen.map((g) => `<button class="chip ${c.nenn_g === g ? "an" : ""}" data-aktion="groesse-wahl" data-g="${g}">${gramm(g)}</button>`).join("")}</div>
          </div>
          <div class="rechner-block">
            <div class="r-kopf"><span>Rolle ist neu und voll</span></div>
            <div class="chips"><button class="chip ${n.voll ? "an" : ""}" data-aktion="neu-voll" data-id="ja">Ja, voll</button>
              <button class="chip ${n.voll ? "" : "an"}" data-aktion="neu-voll" data-id="nein">Nein, später wiegen</button></div>
          </div>
          ${this._spuleBlockHtml(n)}

          <h3 class="abschnitt">3 · Druckeinstellungen, Trocknen, Druckbett</h3>
          ${this._einstellungenHtml(n)}
        </div>
        <footer class="sheet-fuss">
          <button class="knopf leise" data-aktion="schliessen">Abbrechen</button>
          <button class="knopf" data-aktion="neu-anlegen">Filament anlegen</button>
        </footer>
      </section>`;
  }

  // ---- Dialoge ------------------------------------------------------------
  _dialogHtml() {
    if (!this._dialog) return "";
    if (this._dialog === "dr-druck") return `<div class="schleier oben" data-aktion="dialog-zu" data-einmal="schleier-dr"></div><div class="dialog" role="dialog" data-einmal="dialog-dr">${this._drDialogHtml()}</div>`;
    const r = this._rolle();
    let inhalt = "";
    if (this._dialog === "probiert") {
      inhalt = `<h2>Wie lief der Testdruck?</h2>
        <p class="leise">${esc(r.name)} von ${esc(r.hersteller)}</p>
        <button class="wahl" data-aktion="test-gut"><span>✓</span><div><strong>Lief gut</strong><small>Vorschläge als deine Werte übernehmen</small></div></button>
        <button class="wahl" data-aktion="test-anpassen"><span>🎚</span><div><strong>Lief, aber ich habe etwas geändert</strong><small>Werte mit Reglern anpassen und speichern</small></div></button>
        <p class="leise klein">Ist der Druck schiefgegangen? Dafür kommt später das Fehldruck-Menü mit Ursachen und Tipps.</p>
        <button class="knopf leise breit" data-aktion="dialog-zu">Abbrechen</button>`;
    } else if (this._dialog === "spule") {
      const c = this._rechner;
      inhalt = `<h2>Leere Spule wählen</h2>
        <p class="leise klein">Gleiche Spule = gleiches Gewicht. Änderst du es, gilt das für alle Rollen mit dieser Spule.</p>
        <div class="liste">${this._daten.spulen.map((s) => `<button class="wahl kompakt ${c.spule === s.id ? "an" : ""}" data-aktion="spule-wahl" data-id="${s.id}">
          <div><strong>${esc(s.name)}</strong><small>${s.g} g · ${this._spulenNutzer(s.id)} Rollen</small></div></button>`).join("")}
          <button class="wahl kompakt ${c.spule === "einzel" ? "an" : ""}" data-aktion="spule-wahl" data-id="einzel">
            <div><strong>Einzelfall</strong><small>Eigenes Gewicht nur für diese Rolle, mit keiner Spule verknüpft</small></div></button>
        </div>
        <div class="neu-spule">
          <div class="feld-titel">Neue Spule anlegen (mit ${zahl(c.spule_g)} g, später am Regler anpassen)</div>
          <div class="regler-zeile"><input id="spule-name" class="text" value="${esc(r.hersteller || "")}" placeholder="Name, z. B. Elegoo">
            <button class="knopf klein-knopf" data-aktion="spule-neu">Anlegen</button></div>
        </div>
        <button class="knopf leise breit" data-aktion="dialog-zu">Schließen</button>`;
    } else if (this._dialog === "eigen-material" || this._dialog === "eigen-art") {
      const art = this._dialog === "eigen-art";
      inhalt = `<h2>${art ? `Neue Art für ${esc(this._neu.material)}` : "Neues Material"}</h2>
        <p class="leise klein">Taucht danach bei jedem neuen Filament als Schnellauswahl auf.</p>
        <div class="regler-zeile"><input id="eigen-name" class="text" placeholder="${art ? "z. B. Glow, Marble" : "z. B. ABS, PA, PLA-CF"}" autocomplete="off">
          <button class="knopf klein-knopf" data-aktion="eigen-anlegen" data-id="${art ? "art" : "material"}">Hinzufügen</button></div>
        <button class="knopf leise breit oben-abstand" data-aktion="dialog-zu">Abbrechen</button>`;
    } else if (this._dialog === "groesse") {
      const c = this._rechner;
      const groessen = [...new Set([...this._daten.rollen.map((x) => x.nenn_g || 1000), ...STANDARD_GROESSEN])].sort((a, b) => a - b);
      inhalt = `<h2>Spulengröße</h2>
        <p class="leise klein">Wie viel Filament war auf der Rolle, als sie neu war?</p>
        <div class="r-kopf"><span>Füllmenge</span><strong id="r-nenn_g">${gramm(c.nenn_g)}</strong></div>
        <input type="range" min="100" max="3000" step="50" value="${c.nenn_g}" data-rechner="nenn_g">
        <div class="feld-titel">Schnellauswahl</div>
        <div class="chips">${groessen.map((g) => `<button class="chip ${c.nenn_g === g ? "an" : ""}" data-aktion="groesse-wahl" data-g="${g}">${gramm(g)}</button>`).join("")}</div>
        <button class="knopf breit oben-abstand" data-aktion="dialog-zu">Fertig</button>`;
    }
    return `<div class="schleier oben" data-aktion="dialog-zu" data-einmal="schleier-${this._dialog}"></div><div class="dialog" role="dialog" data-einmal="dialog-${this._dialog}">${inhalt}</div>`;
  }

  _systemHtml() {
    const c = this._check;
    const liste = c ? c.liste.map((e) => `<li class="${e.ok ? "ok" : "nein"}"><span class="punkt">${e.ok ? "✓" : "✕"}</span>
      <div><strong>${esc(e.titel)}</strong><small>${esc(e.details)}</small></div></li>`).join("") : "";
    return `<div class="karte system">
      <h2>Systemcheck</h2>
      <p class="leise">Prüft, ob die Seite alles in Home Assistant erreicht. Version ${VERSION}.</p>
      <ul class="check">${liste}</ul>
      <button class="knopf" data-aktion="pruefen" ${c && c.laeuft ? "disabled" : ""}>${c && c.laeuft ? "Prüft …" : "Neu prüfen"}</button>
    </div>`;
  }
}

Object.assign(FilamentWerkstattPanel.prototype, InventarAnsicht, DruckerAnsicht);

if (!customElements.get("filament-werkstatt-panel")) {
  customElements.define("filament-werkstatt-panel", FilamentWerkstattPanel);
}
