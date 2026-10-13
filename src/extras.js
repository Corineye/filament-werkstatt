// ---------------------------------------------------------------------------
// Querschnitt: globale Suche mit Querverweisen, Sicherung (wöchentliche
// Erinnerung, Herunterladen, Einspielen), Bambu-Studio-Profil, „Mehr“-Menü am Handy
// ---------------------------------------------------------------------------

const SICHERUNG_TAGE = 7;
const IMPORT_MAX_BYTES = 20 * 1048576;

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
  if (r.preis_kg) p.filament_cost = s(r.preis_kg);
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
      <p class="leise">Die Daten liegen in Home Assistant und sind damit in dessen Backups. Zusätzlich kannst du eine Datei herunterladen und später wieder einspielen.</p>
      ${e ? `<p class="klein">Letzte Sicherung: ${e.sicherung_am ? new Date(e.sicherung_am).toLocaleString("de-DE") : "noch keine"}</p>` : ""}
      <div class="knopf-reihe"><button class="knopf" data-aktion="sich-laden" ${e ? "" : "disabled"}>💾 Herunterladen</button>
        <label class="knopf leise datei-knopf">📂 Einspielen<input type="file" accept=".json,application/json" data-sys="import" hidden></label></div></div>`;
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
      case "sich-laden": this._sicherungLaden(); return true;
      case "sich-spaeter": this._daten.einstellungen.sicherung_spaeter = new Date().toISOString(); this._speichern(); break;
      case "sich-import-ok": this._importAusfuehren(); return true;
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
