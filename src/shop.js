
// ============================================================================
// Shop: Preisrechner, Produkte, Aufträge, Kleinunternehmer-Grenze, Düsenvergleich
// Daten: this._daten.shop = { einstellungen, produkte, auftraege } (alles optional,
// fehlende Felder bekommen die Standardwerte unten)
// ============================================================================

const SH_TABS = [["rechner", "🧮 Rechner"], ["produkte", "📦 Produkte"], ["auftraege", "🧾 Aufträge"], ["einstellungen", "⚙️ Einstellungen"]];

// Reihenfolge = Ablauf eines Auftrags
const SH_STATUS = [
  { id: "angefragt", name: "angefragt", farbe: "grau" },
  { id: "bestellt", name: "bestellt", farbe: "blau" },
  { id: "druck", name: "im Druck", farbe: "amber" },
  { id: "fertig", name: "fertig", farbe: "tuerkis" },
  { id: "versendet", name: "versendet", farbe: "lila" },
  { id: "bezahlt", name: "bezahlt", farbe: "mint" },
];
const shStatus = (id) => SH_STATUS.find((s) => s.id === id) || SH_STATUS[0];
const shStatusNr = (id) => Math.max(0, SH_STATUS.findIndex((s) => s.id === id));

// Richtwerte (Stand Herbst 2026, bitte selbst prüfen): Gebühr in % vom Bruttopreis + fester Betrag je Verkauf
const SH_PLATTFORMEN = [
  { id: "direkt", name: "Direktverkauf / PayPal Freunde", kurz: "Direkt", prozent: 0, fix: 0 },
  { id: "paypal", name: "PayPal Waren & Dienstleistungen", kurz: "PayPal", prozent: 2.49, fix: 0.35 },
  { id: "etsy", name: "Etsy", prozent: 10.5, fix: 0.5 },
  { id: "ebay", name: "eBay (gewerblich)", kurz: "eBay", prozent: 11, fix: 0.35 },
  { id: "kleinanzeigen", name: "Kleinanzeigen", prozent: 0, fix: 0 },
];
// Ungefähre Preise Deutsche Post / DHL (Privatkunden, online frankiert)
const SH_VERSAND = [
  { id: "abholung", name: "Abholung / Übergabe", preis: 0 },
  { id: "brief", name: "Brief / Warensendung (Maxibrief)", preis: 2.9 },
  { id: "paeckchen_s", name: "Päckchen S", preis: 4.19 },
  { id: "paeckchen_m", name: "Päckchen M", preis: 5.19 },
  { id: "paket2", name: "Paket bis 2 kg", preis: 6.19 },
];
const SH_STANDARD = {
  kwh_preis: 0.35, watt: 110,
  drucker_preis: 699, drucker_h: 5000,
  duese_preis: 15, duese_h: 500,
  platte_preis: 40, platte_h: 1500,
  satz_arbeit: 15, satz_konstruktion: 25,
  aufschlag: 30, kleinunternehmer: true, verpackung: 0.5,
  fehl_standard: 5,   // % Fehldrucke, solange es noch zu wenige eigene Drucke gibt
};
// Einstellungs-Regler, nach Gruppen (Untermenüs)
const SH_EINST = [
  { gruppe: "strom", titel: "⚡ Strom & Drucker", felder: [
    { k: "kwh_preis", name: "Strompreis", e: "€/kWh", min: 0.1, max: 0.8, step: 0.01, nk: 2 },
    { k: "watt", name: "Leistung beim Drucken (ohne Messung)", e: "W", min: 40, max: 400, step: 5 },
    { k: "drucker_preis", name: "Druckerpreis", e: "€", min: 100, max: 3000, step: 1 },
    { k: "drucker_h", name: "Lebensdauer Drucker", e: "h", min: 500, max: 20000, step: 100 },
    { k: "duese_preis", name: "Düse", e: "€", min: 0, max: 80, step: 0.5, nk: 2 },
    { k: "duese_h", name: "Lebensdauer Düse", e: "h", min: 50, max: 3000, step: 50 },
    { k: "platte_preis", name: "Druckplatte", e: "€", min: 0, max: 150, step: 1 },
    { k: "platte_h", name: "Lebensdauer Druckplatte", e: "h", min: 100, max: 6000, step: 50 },
  ] },
  { gruppe: "arbeit", titel: "🛠️ Arbeit & Aufschlag", felder: [
    { k: "satz_arbeit", name: "Stundensatz Vorbereitung & Nacharbeit", e: "€/h", min: 0, max: 80, step: 0.5, nk: 2 },
    { k: "satz_konstruktion", name: "Stundensatz Konstruktion", e: "€/h", min: 0, max: 120, step: 0.5, nk: 2 },
    { k: "aufschlag", name: "Aufschlag (Standard für neue Produkte)", e: "%", min: 0, max: 200, step: 1 },
    { k: "verpackung", name: "Verpackung je Stück", e: "€", min: 0, max: 5, step: 0.05, nk: 2 },
    { k: "fehl_standard", name: "Fehldrucke, solange zu wenig eigene Daten", e: "%", min: 0, max: 30, step: 1 },
  ] },
];
// Rechner-Regler
const SH_REGLER = {
  gewicht_g: { name: "Filament je Platte", e: "g", min: 0, max: 1000, step: 0.5, nk: 1 },
  druck_h: { name: "Druckzeit je Platte", e: "h", min: 0, max: 48, step: 0.05, nk: 2, zeit: true },
  stueck: { name: "Stück pro Platte", e: "Stk", min: 1, max: 60, step: 1 },
  vorbereitung_min: { name: "Vorbereitung je Platte", e: "min", min: 0, max: 90, step: 1, info: "Slicen, Platte reinigen, Filament wechseln" },
  nacharbeit_min: { name: "Nacharbeit je Stück", e: "min", min: 0, max: 120, step: 1, info: "Stützen entfernen, entgraten, montieren, einpacken" },
  konstruktion_h: { name: "Konstruktionszeit", e: "h", min: 0, max: 60, step: 0.25, nk: 2 },
  prototypen: { name: "Prototypen", e: "Stk", min: 0, max: 10, step: 1 },
  proto_g: { name: "Filament je Prototyp", e: "g", min: 0, max: 500, step: 0.5, nk: 1 },
  proto_h: { name: "Druckzeit je Prototyp", e: "h", min: 0, max: 24, step: 0.05, nk: 2, zeit: true },
  menge: { name: "Wie oft verkaufst du das etwa?", e: "Stk", min: 1, max: 500, step: 1, info: "Die Entwicklungskosten werden auf diese Menge verteilt" },
  aufschlag: { name: "Aufschlag", e: "%", min: 0, max: 200, step: 1 },
  extra_eur: { name: "Sonstiges Zubehör je Stück", e: "€", min: 0, max: 30, step: 0.05, nk: 2 },
};
// Kostenteile im Balken (Farben in stil.js: .sh-f-<k>)
const SH_TEILE = [
  ["filament", "Filament"], ["strom", "Strom"], ["verschleiss", "Verschleiß"], ["fehl", "Fehldruck-Zuschlag"], ["zubehoer", "Zubehör"],
  ["arbeit", "Arbeit"], ["entwicklung", "Entwicklung"], ["gebuehren", "Gebühren"], ["versand", "Versand & Verpackung"], ["mwst", "MwSt"], ["gewinn", "Gewinn"],
];
// Düsenvergleich: Annahmen für typische Teile (keine Messung!)
const SH_DUESE06 = { zeit: 0.65, material: 1.07 };
// § 19 UStG seit 2025: Vorjahr höchstens 25.000 €, laufendes Jahr höchstens 100.000 €
const SH_GRENZE = { vorjahr: 25000, jahr: 100000 };

const eur = (v, nk = 2) => (v == null || !isFinite(v) ? "–" : `${zahl(v, nk)} €`);
// Auf ,99 aufrunden (12,30 → 12,99; 12,99 bleibt)
function shRunden99(p) { return p <= 0 ? 0 : Math.ceil(p + 0.01 - 1e-9) - 0.01; }
// „1h 23m 45s“, „2d 3h“ → Stunden
function shZeitStunden(t) {
  if (!t) return null;
  const s = String(t);
  const teil = (re) => { const m = s.match(re); return m ? Number(m[1]) : 0; };
  const h = teil(/(\d+)\s*d/) * 24 + teil(/(\d+)\s*h/) + teil(/(\d+)\s*m(?!s)/) / 60 + teil(/(\d+)\s*s/) / 3600;
  return h > 0 ? h : null;
}
function shDauer(h) {
  if (h == null || !isFinite(h)) return "–";
  const min = Math.round(h * 60);
  return min >= 60 ? `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ""}` : `${min} min`;
}
const shHeute = () => new Date().toISOString().slice(0, 10);
const shId = (vor) => `${vor}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

const ShopAnsicht = {
  // ---- Daten und Zustand ----
  _shDaten() {
    const d = this._daten;
    if (!d.shop || typeof d.shop !== "object") d.shop = {};
    const s = d.shop;
    if (!s.einstellungen) s.einstellungen = {};
    if (!Array.isArray(s.produkte)) s.produkte = [];
    if (!Array.isArray(s.auftraege)) s.auftraege = [];
    return s;
  },
  _shE() {
    const e = { ...SH_STANDARD, ...this._shDaten().einstellungen };
    if (this._shDaten().einstellungen.kwh_preis == null && this._daten.einstellungen && this._daten.einstellungen.strompreis) e.kwh_preis = this._daten.einstellungen.strompreis;
    return e;
  },
  _shPlattformen() { return this._shDaten().einstellungen.plattformen || SH_PLATTFORMEN; },
  _shVersandListe() { return this._shDaten().einstellungen.versand || SH_VERSAND; },
  _shPlattform(id) { const l = this._shPlattformen(); return l.find((x) => x.id === id) || l[0]; },
  _shVersandArt(id) { const l = this._shVersandListe(); return l.find((x) => x.id === id) || l[0]; },
  _shZustand() {
    if (!this._sh) this._sh = { tab: "rechner", r: null, filter: "alle", sort: { k: "nr", ab: false }, menue: null, auftrag: null, auf: { strom: true }, quelle: "hand" };
    if (!this._sh.r) this._sh.r = this._shNeuerEntwurf();
    return this._sh;
  },
  _shNeuerEntwurf(werte = {}) {
    const e = this._shE();
    const r = this._daten.rollen.find((x) => x.id === this._daten.geladen) || this._daten.rollen.find((x) => x.id === this._daten.letzte_rolle) || this._daten.rollen[0] || {};
    return { id: null, name: "", gewicht_g: 20, druck_h: 1, stueck: 1, rolleId: r.id || null, vorbereitung_min: 5, nacharbeit_min: 5,
      konstruktion_h: 0, prototypen: 0, proto_g: null, proto_h: null, menge: 20, aufschlag: e.aufschlag, plattform: "direkt", versand: "abholung",
      zubehoer: [], extra_eur: 0, quelle: "hand", ...JSON.parse(JSON.stringify(werte)) };
  },

  // Preis je Gramm: eigene Rolle (anderer Bereich liefert _preisProGramm), sonst 19,99 € je Rolle
  _shPreisG(rolle) {
    const p = this._preisProGramm?.(rolle);
    if (p && p.wert > 0) return { wert: p.wert, voreingestellt: !!p.voreingestellt };
    if (rolle && rolle.preis_kg) return { wert: rolle.preis_kg / 1000, voreingestellt: false };
    return { wert: 19.99 / ((rolle && rolle.nenn_g) || 1000), voreingestellt: true };
  },

  // Aus den eigenen Drucken: mittlere Leistung (gemessene kWh) und Fehldruckquote
  _shMess() {
    const c = this._shMessCache;
    if (c && Date.now() - c.t < 1500 && c.verlauf === this._drVerlauf) return c.v;
    const e = this._shE();
    const l = this._neDrucke ? this._neDrucke() : [];
    let kwh = 0, std = 0, nStrom = 0, ok = 0, fehl = 0;
    for (const x of l) {
      const k = x.g && x.g.kosten;
      if (k && k.kwh > 0 && x.dauer) { kwh += k.kwh; std += x.dauer; nStrom++; }
      if (x.ergebnis === "ok") ok++; else if (x.ergebnis === "fehl") fehl++;
    }
    const v = {
      kw: std >= 0.5 && kwh > 0 ? kwh / std : e.watt / 1000, kwGemessen: std >= 0.5 && kwh > 0, nStrom,
      quote: ok + fehl >= 3 ? fehl / (ok + fehl) : e.fehl_standard / 100, quoteEigen: ok + fehl >= 3, nDrucke: ok + fehl, fehl,
    };
    this._shMessCache = { t: Date.now(), verlauf: this._drVerlauf, v };
    return v;
  },

  // Was noch an Filament reserviert ist (Aufträge in der Warteschlange, noch nicht fertig)
  _shReserviert(rolleId) {
    return this._shDaten().auftraege.filter((a) => a.reservierung && a.reservierung.rolleId === rolleId && shStatusNr(a.status) < shStatusNr("fertig"))
      .reduce((s, a) => s + (a.reservierung.g || 0), 0);
  },

  // ---- Rechnung ----
  // opt.zeit / opt.material: Faktoren (Düsenvergleich), opt.preis: Gewinn bei diesem Preis statt beim empfohlenen
  _shRechnen(p, opt = {}) {
    const e = this._shE(), mess = this._shMess();
    const st = Math.max(1, Math.round(p.stueck || 1));
    const rolle = this._daten.rollen.find((r) => r.id === p.rolleId);
    const pg = this._shPreisG(rolle);
    const fz = opt.zeit || 1, fm = opt.material || 1;
    const g = ((p.gewicht_g || 0) * fm) / st, h = ((p.druck_h || 0) * fz) / st;
    const proH = mess.kw * e.kwh_preis;
    const verschleissH = e.drucker_preis / Math.max(1, e.drucker_h) + e.duese_preis / Math.max(1, e.duese_h) + e.platte_preis / Math.max(1, e.platte_h);
    const t = {};
    t.filament = g * pg.wert;
    t.strom = h * proH;
    t.verschleiss = h * verschleissH;
    const q = Math.min(0.5, Math.max(0, mess.quote));
    t.fehl = ((t.filament + t.strom + t.verschleiss) * q) / (1 - q);
    t.zubehoer = (p.zubehoer || []).reduce((s, z) => s + this._shTeilPreis(z.id) * (z.stk || 0), 0) + (p.extra_eur || 0);
    t.arbeit = (((p.vorbereitung_min || 0) / st + (p.nacharbeit_min || 0)) / 60) * e.satz_arbeit;
    const protoG = (p.proto_g != null ? p.proto_g : (p.gewicht_g || 0) / st) * fm, protoH = (p.proto_h != null ? p.proto_h : (p.druck_h || 0) / st) * fz;
    const entwicklungGesamt = (p.konstruktion_h || 0) * e.satz_konstruktion + (p.prototypen || 0) * (protoG * pg.wert + protoH * (proH + verschleissH));
    t.entwicklung = entwicklungGesamt / Math.max(1, p.menge || 1);
    t.versand = this._shVersandArt(p.versand).preis + e.verpackung;
    const kosten = Object.values(t).reduce((s, v) => s + v, 0);
    const pf = this._shPlattform(p.plattform);
    const m = e.kleinunternehmer ? 0 : 0.19;
    const pct = (pf.prozent || 0) / 100, fix = pf.fix || 0;
    const nenner = Math.max(0.05, 1 / (1 + m) - pct);
    const preisFuer = (ziel) => (ziel + fix) / nenner;
    const aufschlag = p.aufschlag != null ? p.aufschlag : e.aufschlag;
    const mindest = preisFuer(kosten);
    const empfohlen = shRunden99(preisFuer(kosten * (1 + aufschlag / 100)));
    const bei = (P) => { const netto = P / (1 + m); const gebuehren = P > 0 ? P * pct + fix : 0; return { preis: P, mwst: P - netto, gebuehren, gewinn: netto - gebuehren - kosten }; };
    const b = bei(opt.preis != null ? opt.preis : empfohlen);
    return { g, h, st, t, kosten, mindest, empfohlen, preis: b.preis, gebuehren: b.gebuehren, mwst: b.mwst, gewinn: b.gewinn,
      gewinnH: h > 0 ? b.gewinn / h : null, entwicklungGesamt, pg, mess, rolle, pf, m, bei, verschleissH, q };
  },
  _shTeilPreis(id) {
    const t = (this._daten.inventar || []).find((x) => x.id === id);
    if (!t || !t.preis) return 0;
    return t.preis / this._shPackung(t);
  },
  _shPackung(t) { return t.packung_stk || t.packung || (t.kat === "einsatz" ? 50 : 1); },

  // ---- Oberfläche ----
  _shHtml() {
    const s = this._shZustand();
    this._shDaten();
    if (!this._drVerlauf && !this._drVerlaufLaedt && this._drVerlaufLaden) this._drVerlaufLaden();
    const offen = this._shDaten().auftraege.filter((a) => a.status !== "bezahlt").length;
    const zahlen = { produkte: this._shDaten().produkte.length, auftraege: offen };
    const inhalt = { produkte: () => this._shProdukteHtml(), auftraege: () => this._shAuftraegeHtml(), einstellungen: () => this._shEinstellungenHtml() }[s.tab] || (() => this._shRechnerHtml());
    return `<div class="sh-seite">
      <div class="chips unter-tabs" role="tablist">${SH_TABS.map(([id, n]) => `<button class="chip ${s.tab === id ? "an" : ""}" data-aktion="sh-tab" data-id="${id}">${n}${zahlen[id] ? ` <span class="zahl-punkt">${zahlen[id]}</span>` : ""}</button>`).join("")}</div>
      <div class="wechsel-rein" data-einmal="sh-${s.tab}">${inhalt()}</div></div>`;
  },

  _shWertText(def, v) {
    if (def.zeit) return shDauer(v);
    return `${zahl(v, def.nk || 0)} ${def.e}`;
  },
  _shRegler(k, v, def = SH_REGLER[k], zusatz = "") {
    return `<div class="mod-regler sh-regler"><div class="r-kopf"><span>${esc(def.name)}${def.info ? `<small class="leise sh-info">${esc(def.info)}</small>` : ""}</span><strong id="sh-w-${k}">${this._shWertText(def, v)}</strong></div>
      <input type="range" min="${def.min}" max="${def.max}" step="${def.step}" value="${v}" data-sh="r-${k}" aria-label="${esc(def.name)}">${zusatz}</div>`;
  },
  _shAufKopf(id, titel, zusammenfassung) {
    const an = !!this._sh.auf[id];
    return `<button class="sh-auf-kopf ${an ? "an" : ""}" data-aktion="sh-auf" data-id="${id}" aria-expanded="${an}"><span>${titel}</span><small class="leise" id="sh-zf-${id}">${zusammenfassung}</small><i>›</i></button>`;
  },

  // ---- Rechner ----
  _shRollenOptionen(sel) {
    const rollen = this._daten.rollen.slice().sort((a, b) => a.material.localeCompare(b.material) || a.name.localeCompare(b.name, "de"));
    return rollen.map((r) => {
      const pg = this._shPreisG(r), res = this._shReserviert(r.id);
      return `<option value="${esc(r.id)}" ${r.id === sel ? "selected" : ""}>${esc(r.name)} · ${esc(r.hersteller)} · ${zahl(pg.wert * 1000, 2)} €/kg${pg.voreingestellt ? " (Standard)" : ""}${res ? ` · ${zahl(res)} g reserviert` : ""}</option>`;
    }).join("");
  },
  _shQuellen() {
    const q = this._sh.quelle;
    if (q === "bibliothek") return (this._wsModelle ? this._wsModelle() : []).map((m, i) => {
      const d = m.drucke[0], h = d.start && d.ende ? (new Date(d.ende) - new Date(d.start)) / 3600000 : null;
      return { id: `b${i}`, name: m.name.replace(/\.(gcode\.3mf|gcode|3mf|stl)$/i, ""), g: d.gewicht, h: h > 0 && h < 200 ? h : null, rolle: m.rolle, text: `${m.drucke.length}× gedruckt` };
    });
    if (q === "verlauf") return this._buAlle().filter((d) => d.status !== "laeuft").slice(0, 60).map((d) => {
      const h = d.start && d.ende ? (new Date(d.ende) - new Date(d.start)) / 3600000 : null;
      const g = this._buExtra(d.uid).gebucht;
      return { id: d.uid, name: String(d.name || "Druck").replace(/\.(gcode\.3mf|gcode|3mf|stl)$/i, ""), g: d.gewicht, h: h > 0 && h < 200 ? h : null, rolle: g && g.rolle, text: d.zeit || "" };
    });
    if (q === "modelle") {
      const l = [];
      const m = this._mod;
      if (m && !m.laedt && m.name) {
        const info = m.art === "gcode" && m.gcode ? m.gcode.info : null;
        l.push({ id: "offen", name: m.name.replace(/\.(gcode\.3mf|gcode|3mf|stl)$/i, ""), g: info && info.gramm ? info.gramm : null, h: info ? shZeitStunden(info.zeit) : null, rolle: m.rolleId, text: "gerade geöffnet" });
      }
      for (const z of this._modZuletzt || []) l.push({ id: `z-${z.name}`, name: z.name.replace(/\.(gcode\.3mf|gcode|3mf|stl)$/i, ""), g: null, h: null, text: "zuletzt geöffnet" });
      return l;
    }
    return [];
  },
  _shRechnerHtml() {
    const s = this._sh, p = s.r, e = this._shE();
    const res = this._shRechnen(p);
    const quellen = this._shQuellen();
    const teile = (this._daten.inventar || []).filter((t) => t.preis);
    const zubehoerZf = (p.zubehoer.length || p.extra_eur) ? eur(res.t.zubehoer) + " je Stück" : "keins";
    const entwZf = p.konstruktion_h || p.prototypen ? `${eur(res.entwicklungGesamt)} → ${eur(res.t.entwicklung)} je Stück` : "keine";
    return `<div class="sh-rechner">
      <div class="sh-spalte">
        <div class="sh-mini dr-karte" id="sh-mini">${this._shMiniHtml(res)}</div>
        <div class="dr-karte sh-block">
          <h3 class="dr-titel">${p.id ? `✎ Produkt bearbeiten` : "🧊 Was verkaufst du?"}</h3>
          <label class="feld"><span>Name</span><input id="sh-name" data-sh="t-name" value="${esc(p.name)}" placeholder="z. B. Kabelhalter 3er-Set" maxlength="80"></label>
          <div class="feld-titel">Werte übernehmen aus</div>
          <div class="chips sh-quellen">${[["hand", "✍️ Von Hand"], ["bibliothek", "📚 Bibliothek"], ["modelle", "🧊 3D-Modelle"], ["verlauf", "🕘 Druckverlauf"]].map(([id, n]) => `<button class="chip ${s.quelle === id ? "an" : ""}" data-aktion="sh-quelle" data-id="${id}">${n}</button>`).join("")}</div>
          ${s.quelle !== "hand" ? (quellen.length
            ? `<label class="auswahl breit-auswahl sh-quelle-wahl"><span>${s.quelle === "bibliothek" ? "Modell aus der Bibliothek" : s.quelle === "modelle" ? "3D-Modell" : "Druck"}</span><select data-sh="quelle-wahl"><option value="" disabled selected>Bitte wählen …</option>${quellen.map((x) => `<option value="${esc(x.id)}">${esc(x.name)}${x.g ? ` · ${zahl(x.g, 1)} g` : ""}${x.h ? ` · ${shDauer(x.h)}` : ""}${x.text ? ` · ${esc(x.text)}` : ""}</option>`).join("")}</select></label>`
            : `<p class="leise klein">${s.quelle === "modelle" ? "Noch keine 3D-Modelle geöffnet." : "Noch keine Drucke im Verlauf."}</p>`) : ""}
          <label class="auswahl breit-auswahl"><span>Rolle / Material</span><select data-sh="rolle">${this._shRollenOptionen(p.rolleId)}</select></label>
          ${res.pg.voreingestellt ? `<p class="leise klein">Für diese Rolle ist kein Preis hinterlegt, gerechnet wird mit ${zahl(res.pg.wert * 1000, 2)} €/kg (19,99 € je Rolle).</p>` : ""}
          ${this._shRegler("gewicht_g", p.gewicht_g)}${this._shRegler("druck_h", p.druck_h)}${this._shRegler("stueck", p.stueck)}
        </div>
        <div class="dr-karte sh-block">
          <h3 class="dr-titel">🛠️ Arbeit</h3>
          ${this._shRegler("vorbereitung_min", p.vorbereitung_min)}${this._shRegler("nacharbeit_min", p.nacharbeit_min)}
          <p class="leise klein">Stundensatz ${eur(e.satz_arbeit)} /h, Konstruktion ${eur(e.satz_konstruktion)} /h (änderbar unter Einstellungen).</p>
        </div>
        <div class="dr-karte sh-block">
          ${this._shAufKopf("entw", "💡 Entwicklung & Prototypen", entwZf)}
          ${s.auf.entw ? `<div class="sh-auf-inhalt" data-einmal="sh-auf-entw">
            ${this._shRegler("konstruktion_h", p.konstruktion_h)}${this._shRegler("prototypen", p.prototypen)}
            ${p.prototypen ? `${this._shRegler("proto_g", p.proto_g != null ? p.proto_g : Math.round(((p.gewicht_g || 0) / Math.max(1, p.stueck)) * 2) / 2)}${this._shRegler("proto_h", p.proto_h != null ? p.proto_h : Math.round(((p.druck_h || 0) / Math.max(1, p.stueck)) * 20) / 20)}
              <p class="leise klein">Ohne Änderung zählt jeder Prototyp wie ein fertiges Teil.</p>` : ""}
            ${this._shRegler("menge", p.menge)}</div>` : ""}
        </div>
        <div class="dr-karte sh-block">
          ${this._shAufKopf("zub", "🔩 Zubehör", zubehoerZf)}
          ${s.auf.zub ? `<div class="sh-auf-inhalt" data-einmal="sh-auf-zub">
            ${p.zubehoer.map((z) => { const t = (this._daten.inventar || []).find((x) => x.id === z.id); return t ? `<div class="sh-zub-zeile"><div><strong>${esc(teilName(t))}</strong><small class="leise">${eur(this._shTeilPreis(t.id), 3)} je Stück (${eur(t.preis)} für ${this._shPackung(t)})</small></div>
              <div class="regler-zeile"><button class="rund" data-aktion="sh-zub" data-id="${esc(t.id)}" data-d="-1" aria-label="Weniger">−</button><strong class="sh-zub-zahl">${z.stk}×</strong><button class="rund" data-aktion="sh-zub" data-id="${esc(t.id)}" data-d="1" aria-label="Mehr">＋</button></div></div>` : ""; }).join("")}
            ${teile.length ? `<label class="auswahl breit-auswahl"><span>Teil aus dem Inventar hinzufügen</span><select data-sh="teil-neu"><option value="" disabled selected>Teil wählen …</option>${teile.filter((t) => !p.zubehoer.some((z) => z.id === t.id)).map((t) => `<option value="${esc(t.id)}">${esc(teilName(t))} · ${eur(t.preis / this._shPackung(t), 3)} je Stück</option>`).join("")}</select></label>`
              : `<p class="leise klein">Im Inventar hat noch kein Teil einen Preis.</p>`}
            ${this._shRegler("extra_eur", p.extra_eur)}</div>` : ""}
        </div>
        <div class="dr-karte sh-block">
          <h3 class="dr-titel">🏷️ Verkauf</h3>
          ${this._shRegler("aufschlag", p.aufschlag)}
          <div class="sh-zwei-wahl">
            <label class="auswahl breit-auswahl"><span>Plattform</span><select data-sh="plattform">${this._shPlattformen().map((x) => `<option value="${esc(x.id)}" ${x.id === p.plattform ? "selected" : ""}>${esc(x.name)}${x.prozent || x.fix ? ` · ${zahl(x.prozent, 2)} % + ${zahl(x.fix, 2)} €` : " · keine Gebühr"}</option>`).join("")}</select></label>
            <label class="auswahl breit-auswahl"><span>Versand</span><select data-sh="versand">${this._shVersandListe().map((x) => `<option value="${esc(x.id)}" ${x.id === p.versand ? "selected" : ""}>${esc(x.name)} · ${eur(x.preis)}</option>`).join("")}</select></label>
          </div>
          <p class="leise klein">Gebühren und Porto sind Richtwerte, bitte prüfen. ${e.kleinunternehmer ? "Kleinunternehmer: keine MwSt." : "Mit 19 % MwSt."}</p>
        </div>
      </div>
      <div class="sh-spalte sh-ergebnis-spalte">
        <div class="dr-karte sh-ergebnis" id="sh-ergebnis">${this._shErgebnisHtml(res)}</div>
        <div class="dr-karte sh-duesen" id="sh-duesen">${this._shDuesenHtml(p, res)}</div>
      </div></div>`;
  },
  _shMiniHtml(res) {
    return `<div><small class="leise">Empfohlen</small><strong>${eur(res.empfohlen)}</strong></div>
      <div><small class="leise">Mindestens</small><strong>${eur(res.mindest)}</strong></div>
      <div><small class="leise">Gewinn</small><strong class="${res.gewinn < 0 ? "rot" : "sh-gewinn-text"}">${eur(res.gewinn)}</strong></div>`;
  },
  _shErgebnisHtml(res) {
    const teile = { ...res.t, gebuehren: res.gebuehren, mwst: res.mwst, gewinn: Math.max(0, res.gewinn) };
    const summe = Math.max(0.01, SH_TEILE.reduce((s, [k]) => s + (teile[k] || 0), 0));
    const sichtbar = SH_TEILE.filter(([k]) => teile[k] > 0.0005);
    const p = this._sh.r;
    const hinweise = [];
    hinweise.push(res.mess.kwGemessen ? `Strom: ${zahl(res.mess.kw * 1000)} W im Schnitt, gemessen bei ${res.mess.nStrom} Drucken.` : `Strom: ${zahl(res.mess.kw * 1000)} W angenommen (noch keine Messungen der Steckdose).`);
    hinweise.push(res.mess.quoteEigen ? `Fehldrucke: ${zahl(res.q * 100, 1)} % aus deinen ${res.mess.nDrucke} verbuchten Drucken.` : `Fehldrucke: ${zahl(res.q * 100)} % angenommen (zu wenig verbuchte Drucke).`);
    return `<h3 class="dr-titel">💶 Verkaufspreis${p.name ? ` · ${esc(p.name)}` : ""}</h3>
      <div class="sh-preise">
        <div class="sh-preis haupt-preis"><small>Empfohlener Preis</small><strong>${eur(res.empfohlen)}</strong><span class="leise klein">mit ${zahl(p.aufschlag)} % Aufschlag, auf ,99 gerundet</span></div>
        <div class="sh-preis"><small>Mindestpreis</small><strong>${eur(res.mindest)}</strong><span class="leise klein">kein Gewinn, kein Verlust</span></div>
        <div class="sh-preis"><small>Gewinn je Stück</small><strong class="${res.gewinn < 0 ? "rot" : "sh-gewinn-text"}">${eur(res.gewinn)}</strong><span class="leise klein">${res.gewinnH != null ? `${eur(res.gewinnH)} je Druckstunde` : "–"}</span></div>
      </div>
      <div class="sh-balken" role="img" aria-label="Zusammensetzung des Preises">${sichtbar.map(([k, n]) => `<span class="sh-f-${k}" style="width:${((teile[k] / summe) * 100).toFixed(2)}%" title="${esc(n)}: ${eur(teile[k])}"></span>`).join("")}</div>
      <div class="sh-legende">${sichtbar.map(([k, n]) => `<div class="sh-leg-zeile"><i class="sh-f-${k}"></i><span>${esc(n)}</span><strong>${eur(teile[k])}</strong><small class="leise">${Math.round((teile[k] / summe) * 100)} %</small></div>`).join("")}</div>
      <div class="info-liste sh-eckdaten">
        <div class="info-zeile"><span>Filament je Stück</span><strong>${zahl(res.g, 1)} g · ${zahl(res.pg.wert * 1000, 2)} €/kg</strong></div>
        <div class="info-zeile"><span>Druckzeit je Stück</span><strong>${shDauer(res.h)}</strong></div>
        <div class="info-zeile"><span>Selbstkosten je Stück</span><strong>${eur(res.kosten)}</strong></div>
        <div class="info-zeile"><span>Verschleiß je Druckstunde</span><strong>${eur(res.verschleissH, 3)}</strong></div>
      </div>
      <p class="leise klein sh-annahmen">${hinweise.map(esc).join(" ")}</p>
      <div class="knopf-reihe oben-abstand">
        ${p.id ? `<button class="knopf leise" data-aktion="sh-als-neu">Als neues Produkt</button><button class="knopf" data-aktion="sh-produkt-speichern">✓ Produkt aktualisieren</button>`
          : `<button class="knopf leise" data-aktion="sh-zuruecksetzen">Zurücksetzen</button><button class="knopf" data-aktion="sh-produkt-speichern">📦 Als Produkt speichern</button>`}
      </div>`;
  },
  _shDuesenHtml(p, r04) {
    const r06 = this._shRechnen(p, { zeit: SH_DUESE06.zeit, material: SH_DUESE06.material, preis: r04.empfohlen });
    const menge = p.menge || 1;
    const ersparnisH = (r04.h - r06.h) * menge;
    const diff = r06.gewinn - r04.gewinn;
    const zeile = (name, a, b, besser) => `<span class="sh-dv-name">${name}</span><span>${a}</span><span class="sh-dv-06 ${besser ? "besser" : ""}">${b}</span>`;
    return `<h3 class="dr-titel">🔻 Düsenvergleich 0,4 vs. 0,6 mm <span class="pille amber">Schätzung</span></h3>
      <div class="sh-dv"><span></span><strong>0,4 mm</strong><strong class="sh-dv-06">0,6 mm</strong>
        ${zeile("Druckzeit je Stück", shDauer(r04.h), shDauer(r06.h), r06.h < r04.h)}
        ${zeile("Filament je Stück", `${zahl(r04.g, 1)} g`, `${zahl(r06.g, 1)} g`, false)}
        ${zeile("Selbstkosten", eur(r04.kosten), eur(r06.kosten), r06.kosten < r04.kosten)}
        ${zeile(`Gewinn bei ${eur(r04.empfohlen)}`, eur(r04.gewinn), eur(r06.gewinn), r06.gewinn > r04.gewinn)}
        ${zeile("Gewinn je Druckstunde", r04.gewinnH != null ? eur(r04.gewinnH) : "–", r06.gewinnH != null ? eur(r06.gewinnH) : "–", r06.gewinnH > r04.gewinnH)}</div>
      ${p.druck_h > 0 ? `<div class="hinweis ${diff >= 0 ? "mint" : "amber"} oben-abstand">Mit der 0,6er Düse sparst du je Stück etwa ${shDauer(r04.h - r06.h)}, bei ${zahl(menge)} Stück rund ${shDauer(ersparnisH)} Druckzeit.
        Der Gewinn je Stück ändert sich um ${diff >= 0 ? "+" : ""}${eur(diff)}${r06.gewinnH != null && r04.gewinnH != null ? `, je Druckstunde von ${eur(r04.gewinnH)} auf ${eur(r06.gewinnH)}` : ""}.</div>` : ""}
      <p class="leise klein">Annahme für typische Teile: etwa 30–40 % schneller (gerechnet: ${Math.round((1 - SH_DUESE06.zeit) * 100)} %) und 5–10 % mehr Material (gerechnet: ${Math.round((SH_DUESE06.material - 1) * 100)} %) durch dickere Linien und Schichten. Feine Details, Text und kleine Löcher werden gröber, bei sehr kleinen Teilen ist die Ersparnis geringer. Keine Messung, nur eine Schätzung.</p>`;
  },
  // Nach Regler-Bewegung nur die Ergebnisse neu schreiben (Regler bleibt unter dem Finger)
  _shErgebnisAuffrischen() {
    const p = this._sh.r, res = this._shRechnen(p), root = this.shadowRoot;
    const setze = (id, html) => { const x = root.getElementById(id); if (x) x.innerHTML = html; };
    setze("sh-ergebnis", this._shErgebnisHtml(res));
    setze("sh-duesen", this._shDuesenHtml(p, res));
    setze("sh-mini", this._shMiniHtml(res));
    const zf = root.getElementById("sh-zf-entw");
    if (zf) zf.textContent = p.konstruktion_h || p.prototypen ? `${eur(res.entwicklungGesamt)} → ${eur(res.t.entwicklung)} je Stück` : "keine";
    const zz = root.getElementById("sh-zf-zub");
    if (zz) zz.textContent = p.zubehoer.length || p.extra_eur ? `${eur(res.t.zubehoer)} je Stück` : "keins";
  },

  // ---- Produkte ----
  _shVerkauft(id) {
    return this._shDaten().auftraege.filter((a) => a.produktId === id && a.status !== "angefragt").reduce((s, a) => s + (a.menge || 0), 0);
  },
  _shProdukteHtml() {
    const l = this._shDaten().produkte;
    if (!l.length) return `<div class="leer-karte dr-karte"><span class="gross-icon">📦</span><strong>Noch keine Produkte</strong>
      <span class="leise">Rechne im 🧮 Rechner einen Preis aus und tippe auf „Als Produkt speichern“. Preise rechnen sich hier immer mit den aktuellen Filamentpreisen und Einstellungen neu.</span>
      <button class="knopf oben-abstand" data-aktion="sh-tab" data-id="rechner">Zum Rechner</button></div>`;
    return `<div class="ws-kopfzeile"><p class="leise">Preise werden mit den aktuellen Filamentpreisen und Einstellungen neu gerechnet. Ändert sich etwas, siehst du die Differenz zum gespeicherten Preis.</p>
      <button class="knopf" data-aktion="sh-neu-produkt">＋ Produkt</button></div>
      <div class="sh-produkte">${l.map((p) => {
        const res = this._shRechnen(p), r = res.rolle;
        const diff = p.preis_gespeichert != null ? res.empfohlen - p.preis_gespeichert : 0;
        const verkauft = this._shVerkauft(p.id);
        return `<div class="sh-produkt dr-karte" data-einmal="sh-p-${esc(p.id)}">
          <div class="sh-produkt-kopf">${r ? `<span class="farbtupfer" style="background:${esc(r.hex || "#3ee6a8")}"></span>` : `<span class="ws-icon">📦</span>`}
            <div><strong>${esc(p.name || "Ohne Namen")}</strong><small class="leise">${r ? esc(r.name) : "Rolle fehlt"} · ${zahl(res.g, 1)} g · ${shDauer(res.h)} je Stück${p.stueck > 1 ? ` · ${p.stueck} pro Platte` : ""}</small></div></div>
          <div class="sh-produkt-preis"><strong>${eur(res.empfohlen)}</strong>
            ${Math.abs(diff) >= 0.005 ? `<span class="pille ${diff > 0 ? "amber" : "mint"}" title="Gespeichert war ${eur(p.preis_gespeichert)}">${diff > 0 ? "↑" : "↓"} ${eur(Math.abs(diff))} seit dem Speichern</span>` : `<span class="leise klein">empfohlen</span>`}</div>
          <div class="sh-produkt-zahlen">
            <div><small class="leise">Mindestpreis</small><span>${eur(res.mindest)}</span></div>
            <div><small class="leise">Gewinn/Stück</small><span class="${res.gewinn < 0 ? "rot" : "sh-gewinn-text"}">${eur(res.gewinn)}</span></div>
            <div><small class="leise">Gewinn/Druckstunde</small><span>${res.gewinnH != null ? eur(res.gewinnH) : "–"}</span></div>
            <div><small class="leise">Verkauft</small><span>${zahl(verkauft)} Stk</span></div></div>
          <div class="sh-produkt-knoepfe">
            <button class="knopf klein-knopf" data-aktion="sh-auftrag-neu" data-produkt="${esc(p.id)}">🧾 Auftrag</button>
            <button class="knopf leise klein-knopf" data-aktion="sh-produkt-bearbeiten" data-id="${esc(p.id)}">✎ Bearbeiten</button>
            <button class="rund" data-aktion="sh-produkt-weg" data-id="${esc(p.id)}" aria-label="Produkt löschen" title="Löschen">🗑</button></div></div>`;
      }).join("")}</div>`;
  },

  // ---- Aufträge ----
  _shAuftragGewinn(a) {
    const p = this._shDaten().produkte.find((x) => x.id === a.produktId);
    if (!p || !a.menge) return null;
    const einzel = (a.preis || 0) / a.menge;
    const res = this._shRechnen(p, { preis: einzel });
    return { gewinn: res.gewinn * a.menge, h: res.h * a.menge, kosten: res.kosten * a.menge };
  },
  _shJahresUmsatz(jahr) {
    return this._shDaten().auftraege.filter((a) => a.status === "bezahlt" && String(a.bezahlt_am || a.datum || "").slice(0, 4) === String(jahr)).reduce((s, a) => s + (a.preis || 0), 0);
  },
  _shKuHtml() {
    const e = this._shE(), jahr = new Date().getFullYear();
    const dieses = this._shJahresUmsatz(jahr), vorjahr = this._shJahresUmsatz(jahr - 1);
    const balken = (wert, grenze, titel, text) => {
      const a = wert / grenze, kl = a >= 1 ? "rot" : a >= 0.8 ? "amber" : "";
      return `<div class="sh-ku-zeile"><div class="sh-ku-kopf"><span>${titel}</span><strong class="${kl}">${eur(wert, 0)} <small class="leise">von ${zahl(grenze)} €</small></strong></div>
        <div class="sh-ku-bahn"><span class="${kl}" style="width:${Math.min(100, Math.max(0.5, a * 100)).toFixed(1)}%"></span><i style="left:80%" title="80 %"></i></div>
        <small class="leise">${text}${a >= 0.8 ? ` · <b class="${kl}">${Math.round(a * 100)} % erreicht</b>` : ""}</small></div>`;
    };
    const warn = dieses >= SH_GRENZE.vorjahr * 0.8 || dieses >= SH_GRENZE.jahr * 0.8 || vorjahr > SH_GRENZE.vorjahr;
    return `<div class="dr-karte sh-ku ${warn ? "warn" : ""}">
      <h3 class="dr-titel">🧾 Kleinunternehmer (§ 19 UStG) ${e.kleinunternehmer ? `<span class="pille mint">aktiv</span>` : `<span class="pille leise">aus, 19 % MwSt</span>`}</h3>
      ${balken(dieses, SH_GRENZE.vorjahr, `Umsatz ${jahr}`, "Über 25.000 € in diesem Jahr: ab nächstem Jahr keine Kleinunternehmerregelung mehr")}
      ${balken(dieses, SH_GRENZE.jahr, `Harte Grenze ${jahr}`, "Über 100.000 €: ab dem Umsatz, der die Grenze überschreitet, sofort MwSt")}
      ${balken(vorjahr, SH_GRENZE.vorjahr, `Vorjahr ${jahr - 1}`, "Höchstens 25.000 € im Vorjahr")}
      ${warn ? `<div class="hinweis amber">⚠️ Du näherst dich einer Grenze. Sprich rechtzeitig mit dem Finanzamt oder einer Steuerberatung.</div>` : ""}
      <p class="leise klein">Gezählt werden bezahlte Aufträge aus dieser Liste. Andere Einnahmen deines Gewerbes zählen auch mit. Keine Steuerberatung.</p></div>`;
  },
  _shAuftraegeListe() {
    const s = this._sh, l = this._shDaten().auftraege;
    const produkte = this._shDaten().produkte;
    const prodName = (a) => (produkte.find((p) => p.id === a.produktId) || {}).name || a.produkt || "";
    const gefiltert = s.filter === "alle" ? l.slice() : s.filter === "offen" ? l.filter((a) => a.status !== "bezahlt") : l.filter((a) => a.status === s.filter);
    const k = s.sort.k, r = s.sort.ab ? -1 : 1;
    const wert = { nr: (a) => a.nr || 0, datum: (a) => a.datum || "", kunde: (a) => (a.kunde || "").toLowerCase(), produkt: (a) => prodName(a).toLowerCase(), menge: (a) => a.menge || 0,
      preis: (a) => a.preis || 0, plattform: (a) => this._shPlattform(a.plattform).name.toLowerCase(), status: (a) => shStatusNr(a.status) }[k] || ((a) => a.nr || 0);
    gefiltert.sort((a, b) => { const x = wert(a), y = wert(b); return (x < y ? -1 : x > y ? 1 : (a.nr || 0) - (b.nr || 0)) * r; });
    return { liste: gefiltert, prodName };
  },
  _shStatusPille(a) {
    const st = shStatus(a.status);
    return `<button class="sh-status sh-st-${st.farbe} ${this._sh.menue === a.id ? "offen" : ""}" data-aktion="sh-status-menue" data-id="${esc(a.id)}" aria-expanded="${this._sh.menue === a.id}" title="Status ändern">${esc(st.name)}<i>▾</i></button>`;
  },
  _shStatusWahlHtml(a) {
    return `<div class="sh-status-wahl" data-einmal="sh-sw-${esc(a.id)}">${SH_STATUS.map((st, i) => `<button class="sh-status sh-st-${st.farbe} ${st.id === a.status ? "an" : ""}" data-aktion="sh-status" data-id="${esc(a.id)}" data-status="${st.id}">${i + 1}. ${esc(st.name)}</button>`).join(`<span class="sh-pfeil">→</span>`)}</div>`;
  },
  _shReservierungHtml(a) {
    if (!a.reservierung) return "";
    const r = this._daten.rollen.find((x) => x.id === a.reservierung.rolleId);
    const aktiv = shStatusNr(a.status) < shStatusNr("fertig");
    return `<small class="sh-reserv ${aktiv ? "" : "erledigt"}" title="${aktiv ? "Filament ist für diesen Auftrag reserviert" : "Reservierung erledigt"}">${aktiv ? "🔒" : "✓"} ${zahl(a.reservierung.g, 1)} g${r ? ` ${esc(r.name)}` : ""}${aktiv ? " reserviert" : " verbraucht"}</small>`;
  },
  _shAuftraegeHtml() {
    const s = this._sh, alle = this._shDaten().auftraege;
    const jahr = new Date().getFullYear();
    const gewinnJahr = alle.filter((a) => a.status === "bezahlt" && String(a.bezahlt_am || a.datum || "").startsWith(String(jahr))).reduce((x, a) => x + ((this._shAuftragGewinn(a) || {}).gewinn || 0), 0);
    const offen = alle.filter((a) => a.status !== "bezahlt");
    const offenSumme = offen.reduce((x, a) => x + (a.preis || 0), 0);
    const { liste, prodName } = this._shAuftraegeListe();
    const zaehl = (id) => alle.filter((a) => a.status === id).length;
    const kachel = (w, t, k = "") => `<div class="stat ${k}"><strong>${w}</strong><span>${t}</span></div>`;
    const spalten = [["nr", "Nr"], ["datum", "Datum"], ["kunde", "Kunde"], ["produkt", "Produkt"], ["menge", "Menge"], ["preis", "Preis"], ["plattform", "Plattform"], ["status", "Status"]];
    const pfeil = (k) => (s.sort.k === k ? `<i class="sh-sort-pfeil">${s.sort.ab ? "▼" : "▲"}</i>` : `<i class="sh-sort-pfeil leer">▲</i>`);
    const datum = (d) => (d ? new Date(d + "T12:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "–");
    const knoepfe = (a) => {
      const p = this._shDaten().produkte.find((x) => x.id === a.produktId);
      return `${a.schlange && a.schlange.length ? `<span class="pille mint sh-in-schlange" title="Steht in der Warteschlange">📋 in Schlange</span>`
        : p ? `<button class="mini mint-rand sh-schlange-knopf" data-aktion="sh-schlange" data-id="${esc(a.id)}" title="Drucke in die Warteschlange stellen und Filament reservieren">📋 In Warteschlange</button>` : ""}
        <button class="rund" data-aktion="sh-auftrag-bearbeiten" data-id="${esc(a.id)}" aria-label="Auftrag bearbeiten" title="Bearbeiten">✎</button>`;
    };
    const tabelle = this._mobil
      ? `<div class="sh-karten">${liste.map((a) => `<div class="sh-a-karte dr-karte" data-einmal="sh-a-${esc(a.id)}">
          <div class="sh-a-kopf"><span class="sh-nr">#${a.nr}</span><strong>${esc(a.kunde || "Ohne Namen")}</strong><span class="sh-a-preis">${eur(a.preis)}</span></div>
          <div class="sh-a-mitte"><span>${zahl(a.menge)}× ${esc(prodName(a) || "–")}</span><small class="leise">${datum(a.datum)} · ${esc(this._shPlattform(a.plattform).kurz || this._shPlattform(a.plattform).name)}</small>${this._shReservierungHtml(a)}</div>
          <div class="sh-a-fuss">${this._shStatusPille(a)}<div class="sh-a-knoepfe">${knoepfe(a)}</div></div>
          ${s.menue === a.id ? this._shStatusWahlHtml(a) : ""}</div>`).join("")}</div>`
      : `<div class="sh-tabelle-rahmen dr-karte"><table class="sh-tabelle">
          <thead><tr>${spalten.map(([k, n]) => `<th class="${["menge", "preis"].includes(k) ? "rechts" : ""} ${s.sort.k === k ? "an" : ""}"><button data-aktion="sh-sort" data-id="${k}">${n}${pfeil(k)}</button></th>`).join("")}<th aria-label="Aktionen"></th></tr></thead>
          <tbody>${liste.map((a) => `<tr class="${s.menue === a.id ? "menue-offen" : ""}" data-einmal="sh-a-${esc(a.id)}">
            <td class="sh-nr">#${a.nr}</td><td>${datum(a.datum)}</td><td><strong>${esc(a.kunde || "–")}</strong>${a.notiz ? `<small class="leise sh-notiz">${esc(a.notiz)}</small>` : ""}</td>
            <td>${esc(prodName(a) || "–")}${this._shReservierungHtml(a)}</td><td class="rechts">${zahl(a.menge)}</td><td class="rechts sh-preis-zelle">${eur(a.preis)}</td>
            <td><span class="sh-plattform" title="${esc(this._shPlattform(a.plattform).name)}">${esc(this._shPlattform(a.plattform).kurz || this._shPlattform(a.plattform).name)}</span></td><td>${this._shStatusPille(a)}</td>
            <td class="sh-aktionen">${knoepfe(a)}</td></tr>
            ${s.menue === a.id ? `<tr class="sh-status-zeile"><td colspan="9">${this._shStatusWahlHtml(a)}</td></tr>` : ""}`).join("")}</tbody></table></div>`;
    return `<section class="stats sh-stats">
        ${kachel(eur(this._shJahresUmsatz(jahr), 0), `Umsatz ${jahr} (bezahlt)`)}${kachel(eur(gewinnJahr, 0), `Gewinn ${jahr}`, gewinnJahr < 0 ? "rot" : "")}
        ${kachel(offen.length, "offene Aufträge", offen.length ? "amber" : "")}${kachel(eur(offenSumme, 0), "noch offen")}${kachel(alle.length, "Aufträge gesamt")}</section>
      <div class="sh-auftrag-oben">
        <div class="sh-auftrag-links">
          <div class="ws-kopfzeile"><div class="chips sh-filter">${[["alle", "Alle", alle.length], ["offen", "Offen", offen.length], ...SH_STATUS.map((st) => [st.id, st.name, zaehl(st.id)])].map(([id, n, z]) =>
            `<button class="chip ${s.filter === id ? "an" : ""} ${id !== "alle" && id !== "offen" ? `sh-chip-${shStatus(id).farbe}` : ""}" data-aktion="sh-filter" data-id="${id}">${id !== "alle" && id !== "offen" ? `<i class="sh-punkt"></i>` : ""}${esc(n)}${z ? ` <small>${z}</small>` : ""}</button>`).join("")}</div>
            <button class="knopf" data-aktion="sh-auftrag-neu">＋ Auftrag</button></div>
          ${!alle.length ? `<div class="leer-karte dr-karte"><span class="gross-icon">🧾</span><strong>Noch keine Aufträge</strong><span class="leise">Lege Anfragen und Bestellungen an, verfolge den Status bis „bezahlt“ und schicke die Drucke direkt in die Warteschlange.</span></div>`
            : !liste.length ? `<p class="leise">Kein Auftrag mit diesem Status.</p>` : tabelle}
        </div>
        ${this._shKuHtml()}
      </div>`;
  },

  // Auftrag anlegen / bearbeiten (Sheet)
  _shAuftragOeffnen(a) {
    const s = this._sh, l = this._shDaten().auftraege;
    if (a) s.auftrag = { ...JSON.parse(JSON.stringify(a)), preisHand: true };
    else {
      const p = this._shDaten().produkte.find((x) => x.id === s.neuProdukt) || null;
      s.auftrag = { id: null, nr: l.reduce((m, x) => Math.max(m, x.nr || 0), 0) + 1, datum: shHeute(), kunde: "", produktId: p ? p.id : "", produkt: "", menge: 1,
        preis: p ? this._shRechnen(p).empfohlen : 0, plattform: p ? p.plattform : "direkt", status: "bestellt", notiz: "", preisHand: false };
    }
    s.neuProdukt = null;
    this._dialog = "sh-auftrag";
  },
  _shAuftragPreisNeu() {
    const a = this._sh.auftrag;
    if (a.preisHand) return;
    const p = this._shDaten().produkte.find((x) => x.id === a.produktId);
    if (p) a.preis = Math.round(this._shRechnen(p).empfohlen * (a.menge || 1) * 100) / 100;
  },
  _shDialogHtml() {
    if (this._dialog !== "sh-auftrag" || !this._sh || !this._sh.auftrag) return "";
    const a = this._sh.auftrag, produkte = this._shDaten().produkte;
    const p = produkte.find((x) => x.id === a.produktId);
    const einzel = p ? this._shRechnen(p).empfohlen : 0;
    const maxPreis = Math.max(200, Math.ceil(Math.max(einzel * 50, (a.preis || 0) * 1.5) / 50) * 50);
    return `<div class="schleier" data-aktion="dialog-zu" data-einmal="sh-schleier"></div>
      <section class="sheet sh-sheet" role="dialog" aria-label="${a.id ? "Auftrag bearbeiten" : "Neuer Auftrag"}" data-einmal="sh-sheet">
        <div class="griff"></div>
        <header class="sheet-kopf"><div class="sheet-titel"><h2>${a.id ? `Auftrag #${a.nr}` : "Neuer Auftrag"}</h2><div class="sub">Nr. ${a.nr} · ${esc(shStatus(a.status).name)}</div></div>
          <button class="icon-knopf" data-aktion="dialog-zu" aria-label="Schließen">✕</button></header>
        <div class="sheet-inhalt">
          <label class="feld"><span>Kunde</span><input id="sh-a-kunde" data-sh="a-kunde" value="${esc(a.kunde)}" placeholder="Name oder Benutzername" maxlength="80"></label>
          <label class="feld"><span>Datum</span><input id="sh-a-datum" type="date" data-sh="a-datum" value="${esc(a.datum)}"></label>
          <label class="auswahl breit-auswahl"><span>Produkt</span><select data-sh="a-produkt"><option value="" ${!a.produktId ? "selected" : ""}>Freier Posten (ohne Produkt)</option>${produkte.map((x) => `<option value="${esc(x.id)}" ${x.id === a.produktId ? "selected" : ""}>${esc(x.name || "Ohne Namen")} · ${eur(this._shRechnen(x).empfohlen)}</option>`).join("")}</select></label>
          ${!a.produktId ? `<label class="feld"><span>Was wird verkauft?</span><input id="sh-a-produkt" data-sh="a-produkt-text" value="${esc(a.produkt)}" placeholder="z. B. Sonderanfertigung" maxlength="80"></label>` : ""}
          ${this._shRegler("a-menge", a.menge, { name: "Menge", e: "Stk", min: 1, max: 50, step: 1 })}
          ${this._shRegler("a-preis", a.preis, { name: "Preis gesamt", e: "€", min: 0, max: maxPreis, step: 0.01, nk: 2 },
            `<small class="leise" id="sh-a-preis-hinweis">${p ? `Empfohlen: ${eur(einzel)} je Stück${a.preisHand ? ` · <button class="mini mint-rand sh-inline" data-aktion="sh-a-preis-empf">Empfohlenen Preis nehmen</button>` : ""}` : "Preis frei wählbar"}</small>`)}
          <label class="auswahl breit-auswahl"><span>Plattform</span><select data-sh="a-plattform">${this._shPlattformen().map((x) => `<option value="${esc(x.id)}" ${x.id === a.plattform ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select></label>
          <div class="feld-titel oben-abstand">Status</div>
          <div class="chips sh-status-chips">${SH_STATUS.map((st) => `<button class="sh-status sh-st-${st.farbe} ${st.id === a.status ? "an" : ""}" data-aktion="sh-a-status" data-status="${st.id}">${esc(st.name)}</button>`).join("")}</div>
          <label class="feld"><span>Notiz (optional)</span><input id="sh-a-notiz" data-sh="a-notiz" value="${esc(a.notiz)}" maxlength="160" placeholder="Farbe, Wunsch, Adresse …"></label>
          ${a.reservierung ? `<p>${this._shReservierungHtml(a)}</p>` : ""}
        </div>
        <footer class="sheet-fuss">${a.id ? `<button class="knopf leise sh-loeschen" data-aktion="sh-auftrag-weg">🗑 Löschen</button>` : ""}
          <button class="knopf leise" data-aktion="dialog-zu">Abbrechen</button><button class="knopf" data-aktion="sh-auftrag-speichern">${a.id ? "Speichern" : "Anlegen"}</button></footer>
      </section>`;
  },

  // Druckaufträge für die Warteschlange (je Platte einer) und Filament reservieren
  _shInSchlange(a) {
    const p = this._shDaten().produkte.find((x) => x.id === a.produktId);
    if (!p) { this._toast("Nur Aufträge mit gespeichertem Produkt können in die Warteschlange."); return; }
    const st = Math.max(1, p.stueck || 1), menge = Math.max(1, a.menge || 1);
    const platten = Math.ceil(menge / st);
    const ids = [];
    let summe = 0;
    for (let i = 0; i < platten; i++) {
      const stk = Math.min(st, menge - i * st);
      const g = Math.round(((p.gewicht_g || 0) * stk / st) * 10) / 10;
      summe += g;
      const id = shId("a");
      ids.push(id);
      this._daten.warteschlange.push({ id, name: `${p.name || "Produkt"} · Auftrag #${a.nr}${platten > 1 ? ` (${i + 1}/${platten})` : ""}`, gewicht: g || null,
        zeit: p.druck_h ? shDauer((p.druck_h * stk) / st) : null, rolleId: p.rolleId, notiz: `${stk} Stück${a.kunde ? ` für ${a.kunde}` : ""}`,
        am: new Date().toISOString(), quelle: "shop", auftrag: a.id });
    }
    a.schlange = ids;
    a.reservierung = { rolleId: p.rolleId, g: Math.round(summe * 10) / 10, am: new Date().toISOString() };
    if (shStatusNr(a.status) < shStatusNr("bestellt")) a.status = "bestellt";
    this._speichern();
    const r = this._daten.rollen.find((x) => x.id === p.rolleId);
    const frei = r && r.rest_g != null ? r.rest_g - this._shReserviert(r.id) : null;
    this._toast(`${platten} ${platten === 1 ? "Druck" : "Drucke"} in der Warteschlange, ${zahl(summe, 1)} g ${r ? r.name : ""} reserviert.${frei != null && frei < 0 ? ` Achtung: es fehlen ${zahl(-frei)} g!` : ""}`);
  },

  // ---- Einstellungen ----
  _shEinstellungenHtml() {
    const e = this._shE(), s = this._sh;
    const gruppe = (g) => `<div class="dr-karte sh-block">${this._shAufKopf(g.gruppe, g.titel, g.felder.slice(0, 2).map((f) => this._shWertText(f, e[f.k])).join(" · "))}
      ${s.auf[g.gruppe] ? `<div class="sh-auf-inhalt" data-einmal="sh-auf-${g.gruppe}">${g.felder.map((f) => this._shRegler(`e-${f.k}`, e[f.k], f)).join("")}</div>` : ""}</div>`;
    return `<div class="ws-kopfzeile"><p class="leise">Standardwerte für den Rechner. Änderungen gelten sofort für alle Produkte.</p>
        <button class="knopf leise" data-aktion="sh-standard">↺ Auf Standard zurücksetzen</button></div>
      <div class="sh-einst">
        <div class="sh-spalte">
          ${SH_EINST.map(gruppe).join("")}
          <div class="dr-karte sh-block"><h3 class="dr-titel">🧾 Steuer</h3>
            <div class="sh-schalter-zeile"><div><strong>Kleinunternehmer (§ 19 UStG)</strong><small class="leise">Keine Mehrwertsteuer auf der Rechnung. Aus: 19 % MwSt werden eingerechnet.</small></div>
              <button class="sh-schalter ${e.kleinunternehmer ? "an" : ""}" data-aktion="sh-ku" role="switch" aria-checked="${e.kleinunternehmer}" aria-label="Kleinunternehmer"><span></span></button></div></div>
        </div>
        <div class="sh-spalte">
          <div class="dr-karte sh-block">${this._shAufKopf("plattformen", "🏪 Plattform-Gebühren", "Richtwerte, bitte prüfen")}
            ${s.auf.plattformen ? `<div class="sh-auf-inhalt" data-einmal="sh-auf-pl"><div class="hinweis amber klein">Richtwerte, bitte prüfen. Gebühren ändern sich oft und hängen vom Konto ab (privat/gewerblich).</div>
              ${this._shPlattformen().map((x, i) => `<div class="sh-preset"><strong>${esc(x.name)}</strong>
                ${this._shRegler(`pl-${i}-prozent`, x.prozent, { name: "Anteil vom Preis", e: "%", min: 0, max: 25, step: 0.01, nk: 2 })}
                ${this._shRegler(`pl-${i}-fix`, x.fix, { name: "Fest je Verkauf", e: "€", min: 0, max: 3, step: 0.01, nk: 2 })}</div>`).join("")}</div>` : ""}</div>
          <div class="dr-karte sh-block">${this._shAufKopf("versand", "📦 Versand", "Richtwerte, bitte prüfen")}
            ${s.auf.versand ? `<div class="sh-auf-inhalt" data-einmal="sh-auf-vs"><div class="hinweis amber klein">Richtwerte, bitte prüfen. Ungefähre Preise für Privatkunden (online frankiert). Verpackung kommt je Stück dazu.</div>
              ${this._shVersandListe().map((x, i) => this._shRegler(`vs-${i}`, x.preis, { name: x.name, e: "€", min: 0, max: 20, step: 0.01, nk: 2 })).join("")}</div>` : ""}</div>
          <div class="dr-karte sh-block"><h3 class="dr-titel">📈 Aus deinen Drucken</h3>${this._shMessHtml()}</div>
        </div></div>`;
  },
  _shMessHtml() {
    const m = this._shMess(), e = this._shE();
    return `<div class="info-liste">
      <div class="info-zeile"><span>Leistung beim Drucken<small class="norm">${m.kwGemessen ? `gemessen bei ${m.nStrom} Drucken` : "noch keine Messung, Annahme aus den Einstellungen"}</small></span><strong>${zahl(m.kw * 1000)} W</strong></div>
      <div class="info-zeile"><span>Strom je Druckstunde</span><strong>${eur(m.kw * e.kwh_preis, 3)}</strong></div>
      <div class="info-zeile"><span>Fehldruckquote<small class="norm">${m.quoteEigen ? `${m.fehl} von ${m.nDrucke} verbuchten Drucken` : "zu wenig verbuchte Drucke, Standardwert"}</small></span><strong>${zahl(m.quote * 100, 1)} %</strong></div></div>`;
  },

  // ---- Nerd: Verkaufsstatistik (wird im Nerd-Bereich eingeblendet, nur mit Aufträgen) ----
  _shopNerdHtml() {
    if (!this._daten || !this._daten.shop || !(this._daten.shop.auftraege || []).length) return "";
    const alle = this._daten.shop.auftraege.filter((a) => a.status !== "angefragt");
    const produkte = this._shDaten().produkte;
    // Umsatz je Monat (letzte 12 Monate, bezahlte Aufträge)
    const jetzt = new Date(), monate = [];
    for (let i = 11; i >= 0; i--) { const d = new Date(jetzt.getFullYear(), jetzt.getMonth() - i, 1); monate.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`); }
    const umsatz = Object.fromEntries(monate.map((m) => [m, 0]));
    for (const a of alle) if (a.status === "bezahlt") { const m = String(a.bezahlt_am || a.datum || "").slice(0, 7); if (m in umsatz) umsatz[m] += a.preis || 0; }
    const max = Math.max(1, ...Object.values(umsatz));
    // Gewinn und Stückzahl je Produkt
    const je = {};
    let gewinnSumme = 0, stunden = 0;
    for (const a of alle) {
      const name = (produkte.find((p) => p.id === a.produktId) || {}).name || a.produkt || "Freier Posten";
      const x = (je[name] = je[name] || { name, stk: 0, gewinn: 0, umsatz: 0, h: 0 });
      x.stk += a.menge || 0; x.umsatz += a.preis || 0;
      const g = this._shAuftragGewinn(a);
      if (g) { x.gewinn += g.gewinn; x.h += g.h; gewinnSumme += g.gewinn; stunden += g.h; }
    }
    const liste = Object.values(je);
    const nachGewinn = liste.slice().sort((a, b) => b.gewinn - a.gewinn).slice(0, 8);
    const maxG = Math.max(0.01, ...nachGewinn.map((x) => Math.abs(x.gewinn)));
    const best = liste.slice().sort((a, b) => b.stk - a.stk).slice(0, 5);
    return `<div class="dr-karte sh-nerd oben-abstand" data-einmal="sh-nerd">
      <h3 class="dr-titel">🛒 Verkaufsstatistik</h3>
      <section class="stats sh-stats">
        <div class="stat"><strong>${eur(alle.reduce((s, a) => s + (a.status === "bezahlt" ? a.preis || 0 : 0), 0), 0)}</strong><span>Umsatz bezahlt</span></div>
        <div class="stat"><strong>${eur(gewinnSumme, 0)}</strong><span>Gewinn geschätzt</span></div>
        <div class="stat"><strong>${zahl(alle.reduce((s, a) => s + (a.menge || 0), 0))}</strong><span>Stück verkauft</span></div>
        <div class="stat"><strong>${stunden > 0 ? eur(gewinnSumme / stunden) : "–"}</strong><span>Gewinn je Druckstunde</span></div></section>
      <div class="ws-zwei">
        <div><h3>Umsatz je Monat</h3>
          <div class="ws-saeulen sh-saeulen">${monate.map((m) => `<div class="ws-saeule" title="${eur(umsatz[m])}"><strong>${umsatz[m] ? zahl(umsatz[m]) : ""}</strong>
            <div class="ws-saeule-bahn"><span class="sh-umsatz" style="height:${(umsatz[m] / max) * 100}%"></span></div><small>${WS_MONATE[Number(m.slice(5, 7)) - 1]}</small></div>`).join("")}</div></div>
        <div><h3>Gewinn je Produkt</h3>
          <div class="ne-balken-liste">${nachGewinn.map((x) => `<div class="ne-balken-zeile"><span>${esc(x.name)}</span>
            <div class="ne-balken"><span style="width:${Math.max(2, Math.round((Math.abs(x.gewinn) / maxG) * 100))}%" class="${x.gewinn < 0 ? "rot" : ""}"></span></div><small>${eur(x.gewinn)}${x.h > 0 ? ` · ${eur(x.gewinn / x.h)}/h` : ""}</small></div>`).join("")}</div>
          <h3>Bestseller</h3>
          <div class="info-liste">${best.map((x, i) => `<div class="info-zeile"><span>${["🥇", "🥈", "🥉", "4.", "5."][i]} ${esc(x.name)}</span><strong>${zahl(x.stk)} Stk · ${eur(x.umsatz, 0)}</strong></div>`).join("")}</div></div>
      </div></div>`;
  },

  // ---- Ereignisse ----
  _shKlick(a, el) {
    const s = this._shZustand(), shop = this._shDaten();
    const auftrag = el.dataset.id ? shop.auftraege.find((x) => x.id === el.dataset.id) : null;
    if (a !== "sh-status-menue" && a !== "sh-status") s.menue = null;
    switch (a) {
      case "sh-tab": s.tab = el.dataset.id; if (this._dialog && this._dialog.startsWith("sh-")) this._dialog = null; break;
      case "sh-auf": s.auf[el.dataset.id] = !s.auf[el.dataset.id]; break;
      case "sh-quelle": s.quelle = el.dataset.id; if (s.quelle === "modelle" && this._modZuletztLaden && !this._modZuletzt) this._modZuletztLaden(); break;
      case "sh-zub": {
        const z = s.r.zubehoer.find((x) => x.id === el.dataset.id);
        if (!z) return;
        z.stk = Math.max(0, Math.min(99, z.stk + Number(el.dataset.d)));
        if (!z.stk) s.r.zubehoer = s.r.zubehoer.filter((x) => x !== z);
        break;
      }
      case "sh-zuruecksetzen": s.r = this._shNeuerEntwurf(); s.quelle = "hand"; break;
      case "sh-produkt-speichern": case "sh-als-neu": {
        const p = s.r;
        p.name = (p.name || "").trim();
        if (!p.name) { this._toast("Bitte gib dem Produkt einen Namen."); const f = this.shadowRoot.getElementById("sh-name"); if (f) f.focus(); return; }
        const res = this._shRechnen(p);
        const daten = { ...JSON.parse(JSON.stringify(p)), preis_gespeichert: res.empfohlen, geaendert_am: new Date().toISOString() };
        const i = a === "sh-produkt-speichern" && p.id ? shop.produkte.findIndex((x) => x.id === p.id) : -1;
        if (i >= 0) shop.produkte[i] = { ...shop.produkte[i], ...daten };
        else shop.produkte.push({ ...daten, id: shId("p"), angelegt_am: new Date().toISOString() });
        this._speichern();
        this._toast(`„${p.name}“ gespeichert: ${eur(res.empfohlen)}.`);
        s.r = this._shNeuerEntwurf(); s.quelle = "hand"; s.tab = "produkte";
        break;
      }
      case "sh-neu-produkt": s.r = this._shNeuerEntwurf(); s.quelle = "hand"; s.tab = "rechner"; break;
      case "sh-produkt-bearbeiten": {
        const p = shop.produkte.find((x) => x.id === el.dataset.id);
        if (!p) return;
        s.r = this._shNeuerEntwurf(p); s.quelle = "hand"; s.tab = "rechner";
        break;
      }
      case "sh-produkt-weg": {
        const i = shop.produkte.findIndex((x) => x.id === el.dataset.id);
        if (i < 0 || !confirm(`Produkt „${shop.produkte[i].name}“ löschen? Aufträge bleiben erhalten.`)) return;
        const [weg] = shop.produkte.splice(i, 1);
        for (const x of shop.auftraege) if (x.produktId === weg.id && !x.produkt) x.produkt = weg.name;   // Name im Auftrag behalten
        this._speichern();
        this._toast(`„${weg.name}“ gelöscht.`);
        break;
      }
      case "sh-filter": s.filter = el.dataset.id; break;
      case "sh-sort": s.sort = { k: el.dataset.id, ab: s.sort.k === el.dataset.id ? !s.sort.ab : ["datum", "nr", "preis", "menge"].includes(el.dataset.id) }; break;
      case "sh-status-menue": s.menue = s.menue === el.dataset.id ? null : el.dataset.id; break;
      case "sh-status": {
        if (!auftrag) return;
        this._shStatusSetzen(auftrag, el.dataset.status);
        s.menue = null;
        this._speichern();
        break;
      }
      case "sh-auftrag-neu": s.neuProdukt = el.dataset.produkt || null; this._shAuftragOeffnen(null); break;
      case "sh-auftrag-bearbeiten": if (!auftrag) return; this._shAuftragOeffnen(auftrag); break;
      case "sh-a-status": s.auftrag.status = el.dataset.status; break;
      case "sh-a-preis-empf": s.auftrag.preisHand = false; this._shAuftragPreisNeu(); break;
      case "sh-auftrag-speichern": {
        const n = s.auftrag;
        if (!n.kunde.trim() && !n.produktId && !n.produkt.trim()) { this._toast("Bitte Kunde oder Produkt angeben."); return; }
        const { preisHand, ...daten } = n;
        daten.kunde = daten.kunde.trim(); daten.produkt = (daten.produkt || "").trim();
        if (n.id) {
          const i = shop.auftraege.findIndex((x) => x.id === n.id);
          if (i >= 0) { const alt = shop.auftraege[i]; shop.auftraege[i] = { ...alt, ...daten }; if (alt.status !== daten.status) this._shStatusSetzen(shop.auftraege[i], daten.status); }
        } else {
          const neu = { ...daten, id: shId("o"), angelegt_am: new Date().toISOString() };
          if (neu.status === "bezahlt") neu.bezahlt_am = shHeute();
          shop.auftraege.push(neu);
        }
        s.auftrag = null; this._dialog = null; s.tab = "auftraege";
        this._speichern();
        break;
      }
      case "sh-auftrag-weg": {
        const n = s.auftrag;
        const i = shop.auftraege.findIndex((x) => x.id === n.id);
        if (i < 0 || !confirm(`Auftrag #${n.nr} löschen?`)) return;
        const [weg] = shop.auftraege.splice(i, 1);
        s.auftrag = null; this._dialog = null;
        this._speichern();
        this._toast(`Auftrag #${weg.nr} gelöscht${weg.reservierung ? ", Reservierung aufgehoben" : ""}.`);
        break;
      }
      case "sh-schlange": if (!auftrag) return; this._shInSchlange(auftrag); break;
      case "sh-ku": shop.einstellungen.kleinunternehmer = !this._shE().kleinunternehmer; this._speichern(); break;
      case "sh-standard":
        if (!confirm("Alle Shop-Einstellungen auf die Standardwerte zurücksetzen?")) return;
        shop.einstellungen = {}; this._shMessCache = null; this._speichern();
        this._toast("Shop-Einstellungen zurückgesetzt.");
        break;
      default: return;
    }
    this._zeichnen();
  },
  _shStatusSetzen(a, status) {
    a.status = status;
    if (status === "bezahlt" && !a.bezahlt_am) a.bezahlt_am = shHeute();
    if (status !== "bezahlt") delete a.bezahlt_am;
  },

  _shEingabe(t) {
    const k = t.dataset && t.dataset.sh;
    if (!k || !this._sh) return false;
    const s = this._sh, root = this.shadowRoot;
    const zeige = (id, text) => { const x = root.getElementById(id); if (x) x.textContent = text; };
    if (k === "t-name") { s.r.name = t.value; return true; }
    if (k.startsWith("a-") && s.auftrag) {
      const a = s.auftrag, f = k.slice(2);
      if (f === "kunde") a.kunde = t.value;
      else if (f === "datum") a.datum = t.value || shHeute();
      else if (f === "notiz") a.notiz = t.value;
      else if (f === "produkt-text") a.produkt = t.value;
      return true;
    }
    if (!k.startsWith("r-")) return true;
    const r = k.slice(2), v = Number(t.value);
    if (r === "a-menge" && s.auftrag) {
      s.auftrag.menge = v; zeige("sh-w-a-menge", `${zahl(v)} Stk`);
      if (!s.auftrag.preisHand) {
        this._shAuftragPreisNeu();
        zeige("sh-w-a-preis", eur(s.auftrag.preis));
        const pr = root.querySelector('[data-sh="r-a-preis"]'); if (pr) pr.value = s.auftrag.preis;
      }
    } else if (r === "a-preis" && s.auftrag) {
      s.auftrag.preis = v; s.auftrag.preisHand = true; zeige("sh-w-a-preis", eur(v));
    } else if (r.startsWith("e-")) {
      const f = SH_EINST.flatMap((g) => g.felder).find((x) => x.k === r.slice(2));
      if (!f) return true;
      this._shDaten().einstellungen[f.k] = v; this._shMessCache = null;
      zeige(`sh-w-${r}`, this._shWertText(f, v));
    } else if (r.startsWith("pl-")) {
      const [, i, feld] = r.split("-");
      const e = this._shDaten().einstellungen;
      if (!e.plattformen) e.plattformen = JSON.parse(JSON.stringify(SH_PLATTFORMEN));
      e.plattformen[Number(i)][feld] = v;
      zeige(`sh-w-${r}`, feld === "prozent" ? `${zahl(v, 2)} %` : eur(v));
    } else if (r.startsWith("vs-")) {
      const e = this._shDaten().einstellungen;
      if (!e.versand) e.versand = JSON.parse(JSON.stringify(SH_VERSAND));
      e.versand[Number(r.slice(3))].preis = v;
      zeige(`sh-w-${r}`, eur(v));
    } else if (SH_REGLER[r]) {
      s.r[r] = v;
      zeige(`sh-w-${r}`, this._shWertText(SH_REGLER[r], v));
      this._shErgebnisAuffrischen();
    }
    return true;
  },
  _shAenderung(t) {
    const k = t.dataset && t.dataset.sh;
    if (!k || !this._sh) return false;
    const s = this._sh;
    if (k.startsWith("r-e-") || k.startsWith("r-pl-") || k.startsWith("r-vs-")) { this._speichern(); return true; }
    // Prototyp-Vorgaben hängen an Gewicht, Zeit und Stückzahl: nach dem Loslassen neu zeichnen
    if (k === "r-prototypen" || (this._sh.r.prototypen && ["r-stueck", "r-gewicht_g", "r-druck_h"].includes(k))) { this._zeichnen(); return true; }
    if (k.startsWith("r-") || k.startsWith("t-") || k.startsWith("a-kunde") || k.startsWith("a-notiz") || k.startsWith("a-produkt-text")) return true;
    if (k === "a-datum") { s.auftrag.datum = t.value || shHeute(); return true; }
    if (k === "rolle") s.r.rolleId = t.value;
    else if (k === "plattform") s.r.plattform = t.value;
    else if (k === "versand") s.r.versand = t.value;
    else if (k === "teil-neu") { if (t.value && !s.r.zubehoer.some((z) => z.id === t.value)) s.r.zubehoer.push({ id: t.value, stk: 1 }); }
    else if (k === "quelle-wahl") {
      const x = this._shQuellen().find((q) => q.id === t.value);
      if (!x) return true;
      s.r.name = x.name;
      if (x.g) s.r.gewicht_g = Math.round(x.g * 2) / 2;
      if (x.h) s.r.druck_h = Math.round(x.h * 20) / 20;
      if (x.rolle && this._daten.rollen.some((r) => r.id === x.rolle)) s.r.rolleId = x.rolle;
      s.r.quelle = s.quelle;
      this._toast(x.g || x.h ? `Übernommen: ${x.name}${x.g ? ` · ${zahl(x.g, 1)} g` : ""}${x.h ? ` · ${shDauer(x.h)}` : ""}` : `Name übernommen. Gewicht und Druckzeit bitte einstellen (aus dem Slicer).`);
    } else if (k === "a-produkt") {
      s.auftrag.produktId = t.value;
      const p = this._shDaten().produkte.find((x) => x.id === t.value);
      if (p) { s.auftrag.plattform = p.plattform || s.auftrag.plattform; s.auftrag.preisHand = false; this._shAuftragPreisNeu(); }
    } else if (k === "a-plattform") s.auftrag.plattform = t.value;
    else return false;
    this._zeichnen();
    return true;
  },
};
