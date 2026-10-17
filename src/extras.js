// ---------------------------------------------------------------------------
// Querschnitt: globale Suche mit Querverweisen, Sicherung (wöchentliche
// Erinnerung, Herunterladen, Einspielen, nächtliche Sicherung auf dem HA-Rechner),
// Update-Prüfung, Bambu-Studio-Profil, „Mehr“-Menü am Handy
// ---------------------------------------------------------------------------

const SICHERUNG_TAGE = 7;
const IMPORT_MAX_BYTES = 20 * 1048576;
// Automatische Sicherung gilt als „läuft“, wenn die letzte höchstens so alt ist
const SICHERUNG_AUTO_TAGE = 2;
const SICHERUNG_AUTO_ZEIGEN = 5;
// Fallback der Update-Prüfung ohne HACS: Versionsnummer direkt aus GitHub
const UPDATE_MANIFEST = "https://raw.githubusercontent.com/Corineye/filament-werkstatt/main/custom_components/filament_werkstatt/manifest.json";

// Versionsnummern vergleichen: 1 = a neuer, -1 = b neuer, 0 = gleich
function versionVergleich(a, b) {
  const teile = (v) => String(v || "").trim().replace(/^v/i, "").split(/[.\-+]/).map((x) => parseInt(x, 10) || 0);
  const x = teile(a), y = teile(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] || 0) - (y[i] || 0);
    if (d) return d > 0 ? 1 : -1;
  }
  return 0;
}

// „heute“, „gestern“ oder „Mo., 12.10.“
function tagText(iso) {
  const d = new Date(iso), h = new Date();
  const tag = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((tag(h) - tag(d)) / 86400000);
  if (diff === 0) return "heute";
  if (diff === 1) return "gestern";
  return d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" });
}
const uhrzeitText = (iso) => new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

// Versionshinweise (Markdown von GitHub) schlicht darstellen: Überschriften, fett, Listen
function kleinMarkdown(md) {
  return esc(String(md || "").trim().slice(0, 6000))
    .replace(/^#{1,6}\s*(.+)$/gm, "<strong>$1</strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^\s*[-*]\s+/gm, "• ");
}

// Filament-Profil für Bambu Studio (Datei › Importieren › Konfiguration importieren)
function bambuProfil(r) {
  const w = (k) => wert(r, k).v;
  const s = (v) => [v == null ? "" : String(v)];
  const platte = String(w("platte") || PLATTE_STANDARD);
  const bett = w("bett");
  const p = {
    type: "filament", name: `${r.hersteller} ${r.name} (Werkstatt)`, from: "User", instantiation: "true",
    inherits: `Generic ${["PLA", "PETG", "ABS", "ASA", "TPU", "PC"].includes(r.material) ? r.material : "PLA"} @BBL X1C`,
    filament_settings_id: [`${r.hersteller} ${r.name} (Werkstatt)`],
    filament_type: [r.material], filament_vendor: [r.hersteller],
    default_filament_colour: [r.hex || ""],
    filament_density: s(materialInfo(r.material).dichte),
    nozzle_temperature_initial_layer: s(w("duese_erste")), nozzle_temperature: s(w("duese")),
    fan_min_speed: s(w("luefter_min")), fan_max_speed: s(w("luefter_max")),
    filament_flow_ratio: s(w("flow")), filament_max_volumetric_speed: s(w("max_vol")),
    compatible_printers: ["Bambu Lab P1S 0.4 nozzle"],
  };
  if (w("k") != null) { p.pressure_advance = s(w("k")); p.enable_pressure_advance = ["1"]; }
  p.filament_cost = s(Math.round(preisProGramm(r).wert * 100000) / 100);   // €/kg, ohne eigenen Preis voreingestellt
  // Betttemperatur für die gewählte Platte (die anderen bleiben vom Basisprofil)
  const plattenKey = /textured|pei/i.test(platte) ? "textured_plate_temp" : /engineer/i.test(platte) ? "eng_plate_temp" : /cool/i.test(platte) ? "cool_plate_temp" : "hot_plate_temp";
  if (bett != null) { p[plattenKey] = s(bett); p[`${plattenKey}_initial_layer`] = s(bett); }
  for (const k of Object.keys(p)) if (Array.isArray(p[k]) && p[k].length === 1 && p[k][0] === "") delete p[k];
  return p;
}

// Prüft eine eingespielte Sicherung, bevor sie die Daten ersetzt
function sicherungPruefen(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Die Datei enthält keine Werkstatt-Daten.");
  if (!Array.isArray(obj.rollen)) throw new Error("In der Datei fehlen die Filament-Rollen.");
  if (obj.rollen.length > 2000) throw new Error("Zu viele Rollen, die Datei sieht nicht nach einer Sicherung aus.");
  const kaputt = obj.rollen.findIndex((r) => !r || typeof r.id !== "string" || typeof r.name !== "string");
  if (kaputt >= 0) throw new Error(`Rolle Nr. ${kaputt + 1} ist unvollständig (Name oder Kennung fehlt).`);
  if (new Set(obj.rollen.map((r) => r.id)).size !== obj.rollen.length) throw new Error("Rollen-Kennungen sind doppelt.");
  if (obj.inventar != null && !Array.isArray(obj.inventar)) throw new Error("Das Inventar in der Datei ist beschädigt.");
  if (obj.spulen != null && !Array.isArray(obj.spulen)) throw new Error("Die Spulenliste in der Datei ist beschädigt.");
  if ((obj.version || 1) > DATEN_VERSION) throw new Error("Die Sicherung stammt aus einer neueren Version. Bitte erst die Seite aktualisieren.");
  return obj;
}

const ExtrasAnsicht = {
  // ---- Globale Suche ----
  _suchTreffer(q) {
    if (!q || !q.trim()) return [];
    const d = this._daten, l = [];
    const add = (gruppe, punkte, x) => { if (punkte > 0) l.push({ gruppe, punkte, ...x }); };
    for (const r of d.rollen) {
      add("Filament", suchPunkte(q, `${r.name} ${r.hersteller} ${r.material} ${r.art || ""} ${r.farbe} ${farbfamilie(r)} ${r.farbcode || ""}`),
        { icon: "🧵", titel: r.name, sub: `${r.hersteller} · ${r.rest_g != null ? `${zahl(r.rest_g)} g` : "nicht gewogen"}${r.achtung ? " · ❗" : ""}`, aktion: "oeffnen-filament", id: r.id, hex: r.hex });
    }
    for (const t of d.inventar) {
      const p = suchPunkte(q, teilText(t).text);
      add("Inventar", p, { icon: kategorie(t.kat).icon, titel: teilName(t), sub: `${kategorie(t.kat).einzahl} · ${t.menge ?? "?"} Stk${t.fach ? ` · Fach ${t.fach}` : ""}`, aktion: "such-teil", id: t.id,
        passend: p > 0 ? passendeTeile(t, d.inventar).slice(0, 4) : [] });
    }
    if (this._drVerlauf) for (const m of this._wsModelle()) {
      add("Drucke", suchPunkte(q, m.name), { icon: "🖨️", titel: m.name, sub: `${m.drucke.length}× gedruckt · zuletzt ${m.drucke[0].zeit || "–"}`, aktion: "zum-druck", uid: m.drucke[0].uid });
    }
    for (const f of FEHLERBILDER) add("Hilfe", suchPunkte(q, `${f.name} ${f.kurz} ${f.ursachen.join(" ")} fehler`) * 0.9, { icon: "🩺", titel: f.name, sub: f.kurz, aktion: "such-hilfe", tab: "fehler", id: f.id });
    for (const b of P1S_BEREICHE) add("Hilfe", suchPunkte(q, `${b.name} ${b.text} p1s drucker`) * 0.8, { icon: "🖨️", titel: b.name, sub: "P1S-Zeichnung", aktion: "such-hilfe", tab: "drucker", id: b.id });
    for (const k of KALIBRIERUNGEN) add("Hilfe", suchPunkte(q, `${k.name} ${k.wozu} kalibrieren kalibrierung`) * 0.85, { icon: k.icon, titel: k.name, sub: "Kalibrierung", aktion: "such-hilfe", tab: "kalibrierung", id: k.id });
    for (const t of TROCKNEN_TABELLE) add("Hilfe", suchPunkte(q, `${t.m} trocknen trockner feucht`) * 0.8, { icon: "♨️", titel: `${t.m} trocknen`, sub: `${t.temp} °C · ${t.h} h`, aktion: "such-hilfe", tab: "trockner" });
    for (const a of WARTUNG_AUFGABEN) add("Werkstatt", suchPunkte(q, `${a.name} ${a.text} wartung`) * 0.8, { icon: "🔧", titel: a.name, sub: "Wartung", aktion: "such-werkstatt", tab: "wartung" });
    for (const n of NAVIGATION) add("Bereiche", suchPunkte(q, n.name) * 1.1, { icon: n.icon, titel: n.name, sub: "Bereich öffnen", aktion: "ansicht", id: n.id });
    return l.sort((a, b) => b.punkte - a.punkte).slice(0, 40);
  },
  _suchErgebnisHtml() {
    const q = this._sucheQ || "";
    if (!q.trim()) return `<div class="such-leer leise">Suche nach Filament, Schrauben (z. B. „m3 10“), Drucken, Fehlerbildern oder Wartung. Tippfehler sind okay.</div>`;
    const l = this._suchTreffer(q);
    if (!l.length) return `<div class="such-leer leise">Nichts gefunden für „${esc(q)}“.</div>`;
    const gruppen = [...new Set(l.map((x) => x.gruppe))];
    let nr = 0;
    return gruppen.map((g) => `<div class="such-gruppe"><h4>${esc(g)}</h4>${l.filter((x) => x.gruppe === g).slice(0, 8).map((x) => `
      <button class="such-treffer ${nr++ === 0 ? "erst" : ""}" data-aktion="${x.aktion}" data-id="${esc(x.id || "")}" data-uid="${esc(x.uid || "")}" data-tab="${esc(x.tab || "")}">
        ${x.hex ? `<span class="farbtupfer" style="background:${esc(x.hex)}"></span>` : `<span class="such-icon">${x.icon}</span>`}
        <span><strong>${esc(x.titel)}</strong><small class="leise">${esc(x.sub)}</small></span></button>
      ${x.passend && x.passend.length ? `<div class="such-passend"><span class="leise klein">passt dazu:</span>${x.passend.map((p) => `<button class="chip" data-aktion="such-teil" data-id="${esc(p.id)}">${kategorie(p.kat).icon} ${esc(teilName(p))} · ${p.menge ?? "?"} Stk</button>`).join("")}</div>` : ""}`).join("")}</div>`).join("");
  },
  _sucheHtml() {
    if (!this._sucheOffen) return "";
    return `<div class="schleier oben such-schleier" data-aktion="such-zu" data-einmal="such-schleier"></div>
      <div class="such-box" role="dialog" aria-label="Suche" data-einmal="such-box">
        <div class="such-kopf"><span>🔍</span><input id="global-suche" value="${esc(this._sucheQ || "")}" placeholder="Alles durchsuchen …" autocomplete="off" enterkeyhint="search"><button class="icon-knopf" data-aktion="such-zu" aria-label="Suche schließen">✕</button></div>
        <div id="such-ergebnisse" class="such-ergebnisse">${this._suchErgebnisHtml()}</div></div>`;
  },
  _sucheOeffnen() {
    this._sucheOffen = true; this._mehrOffen = false;
    this._zeichnen();
    const i = this.shadowRoot.getElementById("global-suche");
    if (i) { i.focus(); i.select(); }
  },

  // ---- Sicherung ----
  _sicherungFaellig() {
    const e = this._daten && this._daten.einstellungen;
    if (!e || this._ansicht === "system") return false;
    // Sichert Home Assistant jede Nacht selbst, braucht es keine Erinnerung zum Herunterladen
    if (this._autoSich === undefined) { this._autoSichLaden(); return false; }
    if (this._autoSichAktiv()) return false;
    const seit = tageSeit(e.sicherung_am || e.sicherung_start), spaeter = tageSeit(e.sicherung_spaeter);
    return (seit == null || seit >= SICHERUNG_TAGE) && (spaeter == null || spaeter >= 2);
  },
  _sicherungBalkenHtml() {
    if (!this._sicherungFaellig() || (this._drVerlauf && this._buOffene().length)) return "";
    const am = this._daten.einstellungen.sicherung_am;
    return `<div class="bu-balken blau" data-einmal="sicherung-balken">
      <span class="bu-text">💾 ${am ? `Die letzte Sicherung ist ${zahl(tageSeit(am))} Tage alt.` : "Es gibt noch keine Sicherung auf deinem Gerät."} Jetzt herunterladen?</span>
      <span class="bu-knoepfe"><button class="knopf klein-knopf" data-aktion="sich-laden">Herunterladen</button><button class="knopf leise klein-knopf" data-aktion="sich-spaeter">Später</button></span></div>`;
  },
  _sicherungLaden() {
    const datum = new Date().toISOString().slice(0, 10);
    const ok = this._dateiGeben(`filament-werkstatt-${datum}.json`, JSON.stringify(this._daten, null, 1), "application/json");
    if (!ok) return;
    this._daten.einstellungen.sicherung_am = new Date().toISOString();
    this._speichern();
    this._toast("Sicherung heruntergeladen. Bewahre sie z. B. in der Cloud auf.");
  },
  _dateiGeben(name, text, typ) {
    try {
      const url = URL.createObjectURL(new Blob([text], { type: typ }));
      const a = document.createElement("a");
      a.href = url; a.download = name;
      this.shadowRoot.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return true;
    } catch (e) {
      this._toast(`Herunterladen geht hier nicht (${e.message || e}). Öffne die Seite im Browser.`);
      return false;
    }
  },
  async _sicherungEinlesen(datei) {
    try {
      if (!datei) return;
      if (datei.size > IMPORT_MAX_BYTES) throw new Error("Die Datei ist zu groß für eine Sicherung.");
      let obj;
      try { obj = JSON.parse(await datei.text()); } catch (e) { throw new Error("Die Datei ist kein gültiges JSON."); }
      this._import = { daten: sicherungPruefen(obj), name: datei.name };
      this._dialog = "sich-import";
    } catch (e) {
      this._toast(e.message || String(e));
      return;
    }
    this._zeichnen();
  },
  _importDialogHtml() {
    const d = this._import.daten;
    return `<h2>Sicherung einspielen?</h2>
      <p class="leise">${esc(this._import.name)}${d.geaendert ? `, Stand ${new Date(d.geaendert).toLocaleString("de-DE")}` : ""}</p>
      <div class="info-liste"><div class="info-zeile"><span>Rollen</span><strong>${d.rollen.length}</strong></div>
        <div class="info-zeile"><span>Inventar-Teile</span><strong>${(d.inventar || []).length}</strong></div>
        <div class="info-zeile"><span>Drucke mit Buchung</span><strong>${Object.values(d.drucke || {}).filter((x) => x.gebucht).length}</strong></div></div>
      <div class="hinweis amber oben-abstand">Alle aktuellen Daten werden ersetzt. Der jetzige Stand wird vorher in Home Assistant zwischengespeichert.</div>
      <div class="knopf-reihe"><button class="knopf leise" data-aktion="dialog-zu">Abbrechen</button><button class="knopf amber" data-aktion="sich-import-ok">Ersetzen</button></div>`;
  },
  async _importAusfuehren() {
    const neu = this._import && this._import.daten;
    if (!neu) return;
    try {
      await this._hass.callWS({ type: "frontend/set_user_data", key: SICHERUNG_KEY, value: this._daten });
    } catch (e) {
      this._toast("Zwischenspeichern fehlgeschlagen, Einspielen abgebrochen.");
      return;
    }
    this._daten = migrieren(JSON.parse(JSON.stringify(neu)));
    this._import = null; this._dialog = null; this._modus = null;
    await this._speichernJetzt(true);
    this._toast(`Sicherung eingespielt: ${this._daten.rollen.length} Rollen.`);
  },
  _sicherungKarteHtml() {
    const e = this._daten ? this._daten.einstellungen : null;
    return `<div class="karte system oben-abstand"><h2>Sicherung</h2>
      <p class="leise">Die Daten liegen in Home Assistant und sind damit in dessen Backups. Jede Nacht legt Home Assistant zusätzlich eine Kopie im Medienordner ab. Außerdem kannst du eine Datei herunterladen und später wieder einspielen.</p>
      ${this._autoSichHtml()}
      <h3 class="sich-unter">Datei auf diesem Gerät</h3>
      ${e ? `<p class="klein">Letzter Download: ${e.sicherung_am ? new Date(e.sicherung_am).toLocaleString("de-DE") : "noch keiner"}</p>` : ""}
      <div class="knopf-reihe"><button class="knopf leise" data-aktion="sich-laden" ${e ? "" : "disabled"}>💾 Herunterladen</button>
        <label class="knopf leise datei-knopf">📂 Einspielen<input type="file" accept=".json,application/json" data-sys="import" hidden></label></div></div>`;
  },

  // ---- Automatische Sicherung im Medienordner (Integration, jede Nacht 03:00) ----
  async _autoSichLaden() {
    if (this._autoSichLaedt || !this._hass) return;
    this._autoSichLaedt = true;
    try {
      this._autoSich = await this._hass.callWS({ type: "filament_werkstatt/sicherungen" });
    } catch (e) {
      this._autoSich = null;   // ältere Integration: nur Herunterladen
    }
    this._autoSichLaedt = false;
    if (!this._modus && !this._dialog) this._zeichnen();
  },
  _autoSichAktiv() {
    const s = this._autoSich;
    if (!s || !s.automatisch || !s.liste || !s.liste.length) return false;
    const alter = tageSeit(s.liste[0].zeit);
    return alter != null && alter <= SICHERUNG_AUTO_TAGE;
  },
  _autoSichHtml() {
    const s = this._autoSich;
    if (s === undefined) {
      this._autoSichLaden();
      return `<div class="sich-auto"><div class="sich-auto-kopf"><span class="dot"></span><strong>Automatische Sicherung</strong> <span class="leise">wird geprüft …</span></div></div>`;
    }
    if (!s) {
      return `<div class="sich-auto"><div class="sich-auto-kopf"><span class="dot aus"></span><strong>Automatische Sicherung:</strong> <span class="leise">nicht verfügbar</span></div>
        <p class="klein leise">Die Integration ist zu alt oder nicht geladen. Herunterladen geht trotzdem.</p></div>`;
    }
    const l = s.liste || [], neu = l[0], aktiv = this._autoSichAktiv();
    const status = !s.automatisch ? "aus, die Integration ist nicht geladen"
      : neu ? `letzte ${tagText(neu.zeit)} ${uhrzeitText(neu.zeit)} · ${l.length} gespeichert`
      : `noch keine, die erste kommt um ${esc(s.uhrzeit)}`;
    const zeigen = this._autoSichAlle ? l : l.slice(0, SICHERUNG_AUTO_ZEIGEN);
    const tagName = (iso) => {
      const t = tagText(iso), datum = new Date(iso).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", ...(this._mobil ? {} : { year: "numeric" }) });
      return t === "heute" || t === "gestern" ? `${t[0].toUpperCase()}${t.slice(1)}, ${datum}` : datum;
    };
    return `<div class="sich-auto">
      <div class="sich-auto-kopf"><span class="dot ${aktiv ? "mint" : s.automatisch ? "amber" : "aus"}"></span><strong>Automatische Sicherung:</strong> <span>${status}</span></div>
      <p class="klein leise">Jede Nacht um ${esc(s.uhrzeit)} im Medienordner unter „${esc(s.ordner)}“, die neuesten ${s.behalten} bleiben.${neu && !aktiv && s.automatisch ? " Die letzte ist älter als zwei Tage. War der Rechner aus?" : ""}</p>
      ${l.length ? `<div class="sich-liste">${zeigen.map((e) => `<div class="sich-zeile${e.kaputt ? " kaputt" : ""}">
          <div class="sich-text"><strong>${tagName(e.zeit)}</strong>
            <small class="leise">${uhrzeitText(e.zeit)} Uhr · ${e.kaputt ? "beschädigt" : `${zahl(e.rollen)} Rollen · ${zahl(e.inventar || 0)} Teile`} · ${zahl(e.groesse / 1024)} KB</small></div>
          <button class="knopf leise klein-knopf" data-aktion="sich-auto-wieder" data-id="${esc(e.datei)}" ${e.kaputt ? "disabled" : ""}>Wiederherstellen</button></div>`).join("")}</div>` : ""}
      <div class="knopf-reihe"><button class="knopf" data-aktion="sich-auto-jetzt" ${this._autoSichLaeuft || !this._daten ? "disabled" : ""}>${this._autoSichLaeuft ? "Sichert …" : "☁️ Jetzt sichern"}</button>
        ${l.length > SICHERUNG_AUTO_ZEIGEN ? `<button class="knopf leise" data-aktion="sich-auto-alle">${this._autoSichAlle ? "Weniger zeigen" : `Alle ${l.length} zeigen`}</button>` : ""}</div></div>`;
  },
  async _autoSichJetzt() {
    if (this._autoSichLaeuft) return;
    this._autoSichLaeuft = true;
    this._zeichnen();
    try {
      // Erst offene Änderungen speichern, sonst sichert Home Assistant den alten Stand
      if (this._ungespeichert) { clearTimeout(this._speicherTimer); await this._speichernJetzt(); }
      this._autoSich = await this._hass.callWS({ type: "filament_werkstatt/sicherung_jetzt" });
      this._autoSichLaeuft = false;
      this._toast("Gesichert: Die Kopie liegt jetzt im Medienordner von Home Assistant.");
    } catch (e) {
      this._autoSichLaeuft = false;
      this._toast(`Sichern fehlgeschlagen: ${e.message || e}`);
    }
  },
  // Wiederherstellen über denselben Weg wie „Einspielen“ (Rückfrage, Zwischenspeicher)
  async _autoSichWieder(datei) {
    try {
      const r = await this._hass.callWS({ type: "filament_werkstatt/sicherung_lesen", datei });
      const e = ((this._autoSich && this._autoSich.liste) || []).find((x) => x.datei === datei);
      this._import = { daten: sicherungPruefen(r.daten), name: `Automatische Sicherung vom ${e ? new Date(e.zeit).toLocaleString("de-DE") : datei.slice(0, 10)}` };
      this._dialog = "sich-import";
    } catch (e) {
      this._toast(`Sicherung nicht lesbar: ${e.message || e}`);
      return;
    }
    this._zeichnen();
  },

  // ---- Nach Updates suchen (HACS-Update-Entität, sonst GitHub) ----
  async _updateSuchen() {
    const u = { laeuft: true };
    this._upd = u;
    this._zeichnen();
    const hass = this._hass;
    let info = { version: VERSION, entity_id: null };
    try { info = { ...info, ...(await hass.callWS({ type: "filament_werkstatt/update" })) }; } catch (e) { /* ältere Integration: GitHub */ }
    try {
      const eid = info.entity_id;
      if (eid && hass.states[eid]) {
        u.quelle = "hacs"; u.entity = eid;
        // HACS fragt GitHub sonst nur alle paar Stunden: jetzt neu prüfen lassen
        try { await hass.callService("homeassistant", "update_entity", { entity_id: eid }); } catch (e) { /* dann der letzte bekannte Stand */ }
        await new Promise((r) => setTimeout(r, 600));
        const a = (this._hass.states[eid] || hass.states[eid]).attributes || {};
        u.installiert = a.installed_version || info.version;
        u.neueste = a.latest_version || u.installiert;
        u.zusammenfassung = a.release_summary || "";
        u.url = a.release_url || "";
        if (versionVergleich(u.neueste, u.installiert) > 0) {
          try { u.notizen = await this._hass.callWS({ type: "update/release_notes", entity_id: eid }); } catch (e) { /* ohne Notizen */ }
        }
      } else {
        u.quelle = "github";
        const r = await fetch(`${UPDATE_MANIFEST}?t=${Date.now()}`, { cache: "no-store" });
        if (!r.ok) throw new Error(`GitHub antwortet mit ${r.status}`);
        u.installiert = info.version;
        u.neueste = (await r.json()).version;
        if (!u.neueste) throw new Error("Keine Versionsnummer auf GitHub gefunden");
        u.url = "https://github.com/Corineye/filament-werkstatt/releases";
      }
      u.neuer = versionVergleich(u.neueste, u.installiert) > 0;
    } catch (e) {
      u.fehler = e.message || String(e);
    }
    u.laeuft = false;
    u.am = new Date().toISOString();
    if (this._upd === u) this._zeichnen();
  },
  async _updateInstallieren() {
    const u = this._upd;
    if (!u || !u.entity || u.installiert_laeuft) return;
    if (!confirm(`Version ${u.neueste} jetzt über HACS installieren? Danach muss Home Assistant neu starten.`)) return;
    u.installiert_laeuft = true; u.fehler = null;
    this._zeichnen();
    try {
      await this._hass.callService("update", "install", { entity_id: u.entity });
      u.neustart = true; u.installiert = u.neueste; u.neuer = false;
    } catch (e) {
      u.fehler = `Installieren fehlgeschlagen: ${e.message || e}`;
    }
    u.installiert_laeuft = false;
    this._zeichnen();
  },
  async _haNeustart() {
    if (!confirm("Home Assistant jetzt neu starten? Für ein bis zwei Minuten ist dann nichts erreichbar.")) return;
    const u = this._upd || (this._upd = {});
    try {
      await this._hass.callService("homeassistant", "restart", {});
    } catch (e) {
      // Beim Neustart reißt die Verbindung oft ab, das ist kein Fehler. Fehlende Rechte schon.
      if (/unauthori|admin/i.test(`${e.code || ""} ${e.message || ""}`)) { this._toast("Neu starten dürfen nur Administratoren."); return; }
    }
    u.neustart_laeuft = true;
    this._zeichnen();
  },
  _updateKarteHtml() {
    const u = this._upd;
    // Installierte Version neuer als die laufende Seite: schon heruntergeladen, Neustart fehlt
    const neustart = !!(u && (u.neustart || (u.installiert && !u.neuer && versionVergleich(u.installiert, VERSION) > 0)));
    let inhalt = "";
    if (u && u.neustart_laeuft) {
      inhalt = `<div class="hinweis mint">🔄 Home Assistant startet neu … Danach die Seite neu laden.</div>`;
    } else if (u && !u.laeuft && !u.fehler && u.neueste) {
      const status = neustart ? `<span class="pille amber">Neustart nötig</span>` : u.neuer ? `<span class="pille amber">Update verfügbar</span>` : `<span class="pille mint">Aktuell</span>`;
      inhalt = `<div class="info-liste upd-liste">
          <div class="info-zeile"><span>Installiert</span><strong>${esc(u.installiert)}</strong></div>
          <div class="info-zeile"><span>Neueste Version</span><strong>${esc(u.neueste)} ${status}</strong></div>
          <div class="info-zeile"><span>Geprüft über</span><strong>${u.quelle === "hacs" ? "HACS" : "GitHub"}</strong></div></div>
        ${u.neuer && (u.zusammenfassung || u.notizen) ? `<div class="upd-notizen">${u.zusammenfassung ? `<p><strong>${esc(u.zusammenfassung)}</strong></p>` : ""}${u.notizen ? `<div class="upd-md">${kleinMarkdown(u.notizen)}</div>` : ""}</div>` : ""}
        ${u.neuer && u.url ? `<p class="klein"><a class="upd-link" href="${esc(u.url)}" target="_blank" rel="noopener">Änderungen auf GitHub ansehen ↗</a></p>` : ""}
        ${u.neuer && u.quelle !== "hacs" ? `<div class="hinweis">Keine HACS-Update-Entität gefunden. So aktualisierst du: in HACS „Filament-Werkstatt“ öffnen, „Herunterladen“ wählen und danach Home Assistant neu starten.</div>` : ""}
        ${neustart ? `<div class="hinweis amber">Version ${esc(u.installiert)} ist installiert. Damit sie aktiv wird, muss Home Assistant neu starten.</div>` : ""}`;
    }
    if (u && u.fehler) inhalt += `<div class="hinweis amber">${esc(u.fehler)}</div>`;
    const knoepfe = [];
    if (!u || !u.neustart_laeuft) knoepfe.push(`<button class="knopf ${u && (u.neuer || neustart) ? "leise" : ""}" data-aktion="upd-suchen" ${u && (u.laeuft || u.installiert_laeuft) ? "disabled" : ""}>${u && u.laeuft ? "Sucht …" : "🔎 Nach Updates suchen"}</button>`);
    if (u && u.neuer && u.quelle === "hacs" && !neustart) knoepfe.push(`<button class="knopf amber" data-aktion="upd-installieren" ${u.installiert_laeuft ? "disabled" : ""}>${u.installiert_laeuft ? "Wird installiert …" : "⬇️ Jetzt aktualisieren"}</button>`);
    if (neustart && !u.neustart_laeuft) knoepfe.push(`<button class="knopf amber" data-aktion="upd-neustart">🔄 Home Assistant neu starten</button>`);
    return `<div class="karte system oben-abstand upd-karte"><h2>Updates</h2>
      <p class="leise">Diese Seite läuft mit Version ${VERSION}.${u && u.am && !u.laeuft ? ` Zuletzt geprüft um ${uhrzeitText(u.am)} Uhr.` : " Prüft über HACS (sonst direkt bei GitHub), ob es eine neuere Version gibt."}</p>
      ${inhalt}
      <div class="knopf-reihe">${knoepfe.join("")}</div></div>`;
  },

  // ---- Neue Version erkennen (nach einem HACS-Update) ----
  async _updatePruefen() {
    const basis = window.__filamentWerkstattBasis;
    if (!basis || this._neueVersion) return;
    try {
      const v = await import(new URL(`filament-werkstatt-version.js?t=${Date.now()}`, basis));
      if (v.VERSION && v.VERSION !== VERSION) { this._neueVersion = v.VERSION; if (!this._modus && !this._dialog) this._zeichnen(); }
    } catch (e) { /* offline oder Datei fehlt: beim nächsten Mal */ }
  },
  _updateBalkenHtml() {
    if (!this._neueVersion) return "";
    return `<div class="bu-balken" data-einmal="update-${esc(this._neueVersion)}">
      <span class="bu-text">✨ Version ${esc(this._neueVersion)} ist installiert. Neu laden, um sie zu benutzen.</span>
      <span class="bu-knoepfe"><button class="knopf klein-knopf" data-aktion="update-laden">Neu laden</button></span></div>`;
  },

  // ---- Hilfen ----
  _toastMitKnopf(text, knopf, aktion) {
    this._toastKnopf = { knopf, aktion };
    this._toastText = text;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this._toastWeg(), 5000);
    this._zeichnen();
  },
  async _kopieren(text, meldung) {
    try {
      await navigator.clipboard.writeText(text);
      this._toast(meldung);
    } catch (e) {
      // Ohne Zwischenablage-Recht (z. B. http): Text zum Markieren anzeigen
      this._kopierText = text;
      this._dialog = "kopieren";
      this._zeichnen();
    }
  },

  _mehrHtml() {
    if (!this._mehrOffen) return "";
    return `<div class="schleier mehr-schleier" data-aktion="mehr-zu" data-einmal="mehr-schleier"></div>
      <div class="mehr-sheet" data-einmal="mehr-sheet"><div class="griff"></div>
        <button class="mehr-punkt suche-punkt" data-aktion="such-auf"><span>🔍</span><strong>Suchen</strong></button>
        ${NAVIGATION.filter((n) => !NAV_UNTEN.includes(n.id)).map((n) => `<button class="mehr-punkt ${this._ansicht === n.id ? "aktiv" : ""}" data-aktion="ansicht" data-id="${n.id}"><span>${n.icon}</span><strong>${n.name}</strong>${n.id === "werkstatt" && this._daten && this._wsWartung().some((x) => x.faellig) ? `<span class="zahl-punkt amber-punkt">!</span>` : ""}</button>`).join("")}</div>`;
  },

  _exKlick(a, el) {
    switch (a) {
      case "such-auf": this._sucheOeffnen(); return true;
      case "such-zu": this._sucheOffen = false; break;
      case "such-teil": this._sucheOffen = false; this._mehrOffen = false; this._modus = null; this._ansicht = "inventar"; this._invKlick("inv-oeffnen", el); return true;
      case "such-hilfe": {
        this._sucheOffen = false; this._ansicht = "hilfe";
        const h = this._hiZustand(); h.tab = el.dataset.tab;
        if (el.dataset.id) { if (h.tab === "fehler") h.fehler = el.dataset.id; else if (h.tab === "drucker") h.p1s = el.dataset.id; else if (h.tab === "kalibrierung") h.kal = el.dataset.id; }
        break;
      }
      case "such-werkstatt": this._sucheOffen = false; this._ansicht = "werkstatt"; this._wsZustand().tab = el.dataset.tab; break;
      case "mehr": this._mehrOffen = !this._mehrOffen; break;
      case "mehr-zu": this._mehrOffen = false; break;
      case "update-laden":
        if (this._ungespeichert) { clearTimeout(this._speicherTimer); this._speichernJetzt().then(() => location.reload()); } else location.reload();
        return true;
      case "sich-laden": this._sicherungLaden(); return true;
      case "sich-spaeter": this._daten.einstellungen.sicherung_spaeter = new Date().toISOString(); this._speichern(); break;
      case "sich-import-ok": this._importAusfuehren(); return true;
      case "sich-auto-jetzt": this._autoSichJetzt(); return true;
      case "sich-auto-wieder": this._autoSichWieder(el.dataset.id); return true;
      case "sich-auto-alle": this._autoSichAlle = !this._autoSichAlle; break;
      case "upd-suchen": this._updateSuchen(); return true;
      case "upd-installieren": this._updateInstallieren(); return true;
      case "upd-neustart": this._haNeustart(); return true;
      case "profil-export": {
        const r = this._rolle();
        if (!r) return true;
        const name = `${r.hersteller}-${r.name}`.replace(/[^a-z0-9äöüß]+/gi, "_");
        if (this._dateiGeben(`${name}.json`, JSON.stringify(bambuProfil(r), null, 2), "application/json")) this._toast("Profil gespeichert. In Bambu Studio: Datei › Importieren › Konfiguration importieren.");
        return true;
      }
      case "kon-laden": this._konflikt = null; this._dialog = null; this._laden(); return true;
      case "kon-behalten": this._konflikt = null; this._dialog = null; this._speichernJetzt(true); break;
      case "toast-knopf": { const k = this._toastKnopf; this._toastKnopf = null; if (k && k.aktion.startsWith("ws-")) this._wsKlick(k.aktion, { dataset: {} }); return true; }
      default: return false;
    }
    this._zeichnen();
    return true;
  },
};
