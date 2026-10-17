// ---------------------------------------------------------------------------
// Werkstatt: Warteschlange mit Bestandsprüfung und kluger Sortierung, Einkaufsliste,
// Modell-Bibliothek mit Filtern, Projekte, Fehldrucke, Wartungsplan mit
// Verschleißteilen, Kosten je Druck und Monat
// ---------------------------------------------------------------------------

const WS_TABS = [["schlange", "📋 Warteschlange"], ["einkauf", "🛒 Einkauf"], ["bibliothek", "📚 Bibliothek"], ["projekte", "📁 Projekte"], ["fehl", "💥 Fehldrucke"], ["wartung", "🔧 Wartung"], ["kosten", "💶 Kosten"]];
const WS_EINSTELLUNGEN = [
  { k: "strompreis", name: "Strompreis", e: "€/kWh", min: 0.1, max: 0.8, step: 0.01, nk: 2 },
  { k: "linie_g", name: "Anfangslinie je Druck", e: "g", min: 0, max: 2, step: 0.05, nk: 2 },
  { k: "extruder_g", name: "3 Extruder-Fahrten je Druck", e: "g", min: 0, max: 1, step: 0.05, nk: 2 },
  { k: "wechsel_g", name: "Reststück beim Rollenwechsel", e: "g", min: 0, max: 1, step: 0.05, nk: 2 },
  { k: "mindest_g", name: "Nachkaufen je Farbe unter", e: "g", min: 0, max: 1000, step: 50 },
  { k: "mindest_material_g", name: "Nachkaufen je Material unter", e: "g", min: 0, max: 3000, step: 100 },
];
// Wartung: wo sitzt das Teil im P1S, was ist es, wofür ist es gut.
// teile = hervorgehobene Bereiche in der kleinen Zeichnung (wsP1sMini)
const WS_WARTUNG_INFO = {
  platte: { teile: ["platte"], wo: "Auf dem Heizbett unten im Druckraum.",
    was: "Die abnehmbare, magnetische Federstahlplatte mit Beschichtung (z. B. Textured PEI).",
    wofuer: "Darauf haftet die erste Schicht. Fingerfett und Klebereste lassen Drucke sich lösen oder an den Ecken hochbiegen." },
  stangen: { teile: ["stangen"], wo: "Oben im Druckraum: eine quer (X-Achse), je eine links und rechts nach hinten (Y-Achse).",
    was: "Glatte, schwarze Stangen aus Kohlefaser, auf denen der Druckkopf in Gleitlagern läuft.",
    wofuer: "Sie führen den Druckkopf leicht und steif. Staub und Abrieb machen Geräusche und Schwingungen. Trocken halten, Kohlefaser nicht ölen." },
  duese: { teile: ["duese"], wo: "Ganz unten am Druckkopf, direkt über dem Druckbett.",
    was: "Die Düse am Heizblock, darum die Silikonsocke.",
    wofuer: "Hier kommt das geschmolzene Filament heraus. Die Socke hält die Wärme am Heizblock und verhindert, dass Plastik daran festklebt und auf den Druck tropft." },
  luefter: { teile: ["luefter"], wo: "Am Druckkopf (Bauteil- und Hotend-Lüfter), links an der Seite (Hilfslüfter) und hinten oben (Druckraumlüfter).",
    was: "Die Lüfter des Druckers.",
    wofuer: "Sie kühlen die frische Schicht und das Hotend und führen warme Luft ab. Verstaubt fördern sie weniger: schlechtere Überhänge oder Hitzestau im Hotend." },
  spindeln: { teile: ["spindeln"], wo: "Senkrecht im Druckraum, das Druckbett hängt daran.",
    was: "Die Gewindespindeln der Z-Achse.",
    wofuer: "Sie fahren das Bett Schicht für Schicht nach unten. Laufen sie trocken oder verschmutzt, wird die Bewegung ruckelig, das zeigt sich als Streifen in der Wand (Z-Banding)." },
  riemen: { teile: ["riemen"], wo: "Oben links und rechts entlang der Y-Stangen und quer zum Druckkopf, angetrieben von den Motoren hinten.",
    was: "Die Zahnriemen der X/Y-Bewegung (CoreXY).",
    wofuer: "Sie ziehen den Druckkopf hin und her. Zu locker gibt ungenaue Maße und Wellen hinter Kanten (Ghosting), zu straff belastet Lager und Motoren." },
  ptfe: { teile: ["ptfe"], wo: "Von der Spule hinten über den Druckraum bis oben in den Druckkopf, der Schneider sitzt seitlich am Kopf.",
    was: "Der weiße Teflonschlauch und der Filament-Schneider.",
    wofuer: "Der Schlauch führt das Filament reibungsarm zum Extruder. Knicke oder Abrieb bremsen es (zu wenig Material), eine stumpfe Klinge schneidet beim Wechsel nicht sauber." },
  filter: { teile: ["filter"], wo: "Hinten oben am Druckraumlüfter, wo die Luft den Drucker verlässt.",
    was: "Der Aktivkohlefilter vor dem Druckraumlüfter.",
    wofuer: "Bindet Gerüche und einen Teil der Dämpfe, vor allem bei ASA und ABS. Ist die Kohle gesättigt, wirkt er kaum noch." },
  kalibrieren: { teile: ["kopf", "platte", "stangen"], wo: "Der ganze Drucker: Druckkopf, Bett und Achsen.",
    was: "Die automatische Kalibrierung am Drucker (Bett-Nivellierung, Vibration, Motoren).",
    wofuer: "Damit die erste Schicht überall gleich dick wird und schnelle Bewegungen sauber bleiben. Sinnvoll nach Transport, Umbau oder Riemenspannen." },
};
// Verschleißteile (ERSATZTEILE_STANDARD) mit eigener Erklärung
const WS_TEIL_INFO = {
  duese04: { teile: ["duese"], wo: "Ganz unten am Druckkopf.",
    was: "Die Düse mit 0,4 mm Öffnung aus gehärtetem Stahl.",
    wofuer: "Bestimmt, wie fein gedruckt wird. Abrieb (vor allem durch Carbon- oder Glow-Filament) weitet die Öffnung, dann werden Wände ungenau und es gibt mehr Fäden." },
  platte: WS_WARTUNG_INFO.platte,
  socke: { teile: ["duese"], wo: "Am Heizblock direkt über der Düse.",
    was: "Die Silikonhülle um den Heizblock.",
    wofuer: "Hält die Temperatur stabil, schützt vor Luftzug vom Lüfter und vor festklebendem Plastik. Rissig oder verhärtet: tauschen." },
  ptfe: WS_WARTUNG_INFO.ptfe,
  filter: WS_WARTUNG_INFO.filter,
  riemen: WS_WARTUNG_INFO.riemen,
};

// Kleine Vorderansicht des P1S (im Stil der Hilfe-Zeichnung), gewählte Teile gelb
function wsP1sMini(an, titel) {
  const g = new Set(an || []);
  const gelb = "#ffd54a", grau = "#5d726a", hell = "#8da49a";
  const f = (id, sonst = grau) => (g.has(id) ? gelb : sonst);
  const kl = (id) => (g.has(id) ? "an" : "");
  const sw = (id, normal, hervor) => (g.has(id) ? hervor : normal);
  const puls = (id, x, y, r = 9) => (g.has(id) ? `<circle cx="${x}" cy="${y}" r="${r}" class="ws-p1s-puls"/>` : "");
  return `<svg viewBox="0 0 220 180" class="ws-p1s" role="img" aria-label="${esc(titel || "Bambu Lab P1S")}">
    <defs><pattern id="ws-p1s-raster" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0 H0 V10" stroke="rgba(62,230,168,.06)" fill="none"/></pattern></defs>
    <rect x="0" y="0" width="220" height="180" fill="url(#ws-p1s-raster)"/>
    <rect x="12" y="10" width="184" height="162" rx="9" stroke="${grau}" stroke-width="1.3" fill="none"/>
    <rect x="20" y="18" width="168" height="124" rx="4" stroke="#3ee6a8" stroke-opacity=".3" fill="rgba(62,230,168,.03)"/>
    <path d="M20 142 H188" stroke="${grau}" stroke-width="1.2"/>
    <rect x="28" y="152" width="40" height="12" rx="3" stroke="${hell}" fill="rgba(62,230,168,.06)"/><path d="M33 158 H52" stroke="#3ee6a8" stroke-width="1.6"/>
    <g class="${kl("filter")}"><rect x="132" y="19" width="28" height="17" rx="2" stroke="${f("filter")}" stroke-width="${sw("filter", 1, 1.8)}" fill="${g.has("filter") ? "rgba(255,213,74,.25)" : "rgba(141,164,154,.08)"}"/>
      <path d="M135 22 L139 33 M141 22 L145 33 M147 22 L151 33 M153 22 L157 33" stroke="${f("filter")}" stroke-opacity=".5" stroke-width=".8"/></g>
    <g class="${kl("spindeln")}"><path d="M34 34 V138 M174 34 V138" stroke="${f("spindeln", hell)}" stroke-width="${sw("spindeln", 2.2, 3.2)}" stroke-dasharray="2 2.5"/></g>
    <g class="${kl("riemen")}"><path d="M30 34 L50 22 M178 34 L158 22 M36 52 H88 M120 52 H172" stroke="${f("riemen")}" stroke-width="${sw("riemen", 1.1, 2.2)}" stroke-dasharray="4 2.5" fill="none"/></g>
    <g class="${kl("stangen")}"><path d="M26 42 L48 27 M182 42 L160 27 M30 47 H178" stroke="${f("stangen", hell)}" stroke-width="${sw("stangen", 2.4, 3.6)}" stroke-linecap="round"/></g>
    <g class="${kl("ptfe")}"><path d="M104 41 C106 8 200 2 204 66" stroke="${g.has("ptfe") ? gelb : "#ffb547"}" stroke-opacity="${g.has("ptfe") ? 1 : 0.55}" stroke-width="${sw("ptfe", 1.6, 2.6)}" fill="none" stroke-dasharray="${g.has("ptfe") ? "none" : "4 2.5"}"/>
      <path d="M88 58 L82 63 L90 67" stroke="${f("ptfe")}" stroke-width="${sw("ptfe", 1.2, 2.2)}" fill="none"/></g>
    <circle cx="204" cy="78" r="10" stroke="#ffb547" stroke-width="1.6" fill="rgba(255,181,71,.12)"/><circle cx="204" cy="78" r="3" fill="#ffb547"/>
    <g class="${kl("kopf")}"><rect x="88" y="40" width="32" height="34" rx="5" fill="rgba(141,164,154,.12)" stroke="${f("kopf", hell)}" stroke-width="${sw("kopf", 1.4, 2.2)}"/></g>
    <g class="${kl("luefter")}" stroke="${f("luefter")}" stroke-width="${sw("luefter", 1.1, 1.8)}" fill="none">
      <circle cx="104" cy="56" r="7"/><path d="M98 56 H110 M104 50 V62" stroke-width="1"/>
      <rect x="13" y="66" width="7" height="34" rx="2"/><path d="M14 72 H19 M14 78 H19 M14 84 H19 M14 90 H19 M14 96 H19" stroke-width="1"/>
      <circle cx="146" cy="27.5" r="6" fill="#0b1512"/><path d="M141 27.5 H151 M146 22.5 V32.5" stroke-width="1"/></g>
    <g class="${kl("duese")}"><path d="M96 74 H112 L109 82 H99 Z" fill="${f("duese", hell)}"/><path d="M102 82 H106 L104 88 Z" fill="${g.has("duese") ? gelb : "#ffb547"}"/></g>
    <g class="${kl("platte")}"><path d="M42 118 H166 L174 128 H34 Z" fill="${g.has("platte") ? "rgba(255,213,74,.24)" : "rgba(62,230,168,.10)"}" stroke="${g.has("platte") ? gelb : "#3ee6a8"}" stroke-width="${sw("platte", 1.2, 1.9)}"/></g>
    <rect x="34" y="128" width="140" height="5" fill="rgba(62,230,168,.22)"/>
    <rect x="94" y="106" width="20" height="13" rx="1.5" fill="#3ee6a8" opacity=".6"/>
    ${puls("platte", 104, 123, 13)}${puls("stangen", 60, 47, 9)}${puls("riemen", 40, 28, 8)}${puls("duese", 104, 83, 8)}${puls("luefter", 104, 56, 10)}${puls("spindeln", 34, 86, 9)}${puls("ptfe", 160, 12, 8)}${puls("filter", 146, 27.5, 12)}${puls("kopf", 104, 57, 15)}
  </svg>`;
}
const WS_MONATE = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

// Druckname ohne Endung und Plattennummer, damit gleiche Modelle zusammenfallen
function modellSchluessel(name) {
  return normText(String(name || "").replace(/\.(gcode|3mf|stl)$/gi, "").replace(/[_-]?plate[_ ]?\d+$/i, "")) || "druck";
}
function tageSeit(iso) { return iso ? (Date.now() - new Date(iso).getTime()) / 86400000 : null; }

// Bibliothek-Filter
const WS_ZEITRAUM = [["", "Jederzeit"], ["7", "Letzte 7 Tage"], ["30", "Letzte 30 Tage"], ["90", "Letzte 3 Monate"], ["jahr", "Dieses Jahr"]];
const WS_ERGEBNIS = [["ok", "✅ Erfolgreich"], ["fehl", "💥 Fehldruck"], ["ab", "⛔ Abgebrochen"]];
// Zeitplan der Warteschlange
const WS_ABEND = 22;          // „Bis 22:00 schaffst du …“
const WS_PAUSE_MIN = 5;       // Platte abnehmen, nächsten Druck starten
const WS_WECHSEL_MIN = 3;     // Rolle tauschen
// Projekte
const WS_PJ_FARBEN = ["#3ee6a8", "#5cc8ff", "#ffb547", "#ff6b6b", "#c58cff", "#ffd54a", "#ff8ad8", "#8da49a"];
const WS_PJ_ICONS = ["📦", "🏠", "🎁", "🔧", "🎮", "🌱", "🚗", "🧩", "🎄", "💡", "🐾", "🖨️"];
const WS_PJ_TEIL_STATUS = { fertig: ["✓ fertig", "mint"], schlange: ["📋 in der Warteschlange", "amber"], fehl: ["💥 Fehldruck", "rot"], offen: ["offen", "leise"] };

// Druckdauer aus dem G-Code-Text („1h 23m 4s“, „2d 3h“, „45m“, „1:23:00“) in Minuten
function wsDauerMin(text) {
  if (text == null || text === "") return null;
  if (typeof text === "number") return text;
  const s = String(text).toLowerCase();
  const uhr = s.match(/^\s*(\d+):(\d{2})(?::(\d{2}))?\s*$/);
  if (uhr) return Number(uhr[1]) * 60 + Number(uhr[2]) + (uhr[3] ? Number(uhr[3]) / 60 : 0);
  let min = 0, gefunden = false;
  for (const [, z, e] of s.matchAll(/(\d+(?:[.,]\d+)?)\s*(d|h|m(?!s)|s)/g)) {
    gefunden = true;
    min += parseFloat(z.replace(",", ".")) * { d: 1440, h: 60, m: 1, s: 1 / 60 }[e];
  }
  return gefunden ? Math.round(min) : null;
}
function wsDauerText(min) {
  if (min == null) return "–";
  min = Math.round(min);
  return min >= 60 ? `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ""}` : `${min} min`;
}
const wsUhr = (ms) => new Date(ms).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
// Dauer eines Auftrags: eingestellt oder aus dem G-Code
const wsAuftragDauer = (a) => (a.dauer_min != null && a.dauer_min > 0 ? a.dauer_min : wsDauerMin(a.zeit));
// Dauer eines fertigen Drucks aus Start und Ende
function wsDruckDauer(d) {
  if (!d || !d.start || !d.ende) return null;
  const m = (new Date(d.ende) - new Date(d.start)) / 60000;
  return m > 0 && m < 14 * 1440 ? Math.round(m) : null;
}

const WerkstattAnsicht = {
  _wsZustand() {
    if (!this._ws) this._ws = { tab: "schlange", neu: null };
    return this._ws;
  },

  _wsHtml() {
    const w = this._wsZustand();
    const zahlen = { schlange: this._daten.warteschlange.length, einkauf: this._wsEinkauf().length, wartung: this._wsWartung().filter((a) => a.faellig).length };
    const inhalt = { einkauf: () => this._wsEinkaufHtml(), bibliothek: () => this._wsBibliothekHtml(), projekte: () => this._wsProjekteHtml(), fehl: () => this._wsFehlHtml(), wartung: () => this._wsWartungHtml(), kosten: () => this._wsKostenHtml() }[w.tab] || (() => this._wsSchlangeHtml());
    const pj = w.tab === "projekte" && w.projekt && this._wsProjekt(w.projekt) ? `-${w.projekt}` : "";
    // Fotos für Projekte nachladen (Bibliothek und Fehldrucke laden sie beim Tab-Wechsel)
    if (w.tab === "projekte" && this._drVerlauf && !this._wsFotosAngefragt) { this._wsFotosAngefragt = true; setTimeout(() => this._wsFotos(), 0); }
    return `<div class="ws-seite">
      <div class="chips unter-tabs" role="tablist">${WS_TABS.map(([id, n]) => `<button class="chip ${w.tab === id ? "an" : ""}" data-aktion="ws-tab" data-id="${id}">${n}${zahlen[id] ? ` <span class="zahl-punkt ${id === "wartung" ? "amber-punkt" : ""}">${zahlen[id]}</span>` : ""}</button>`).join("")}</div>
      <div class="ws-inhalt wechsel-rein" data-einmal="ws-${w.tab}${pj}">${inhalt()}</div></div>`;
  },

  // ---- Warteschlange ----
  _wsBestand(liste = this._daten.warteschlange) {
    // Aufträge der Reihe nach von den Rollen abziehen: späterer Auftrag sieht, was übrig bleibt
    const e = this._daten.einstellungen, rest = {};
    return liste.map((a) => {
      const r = this._daten.rollen.find((x) => x.id === a.rolleId);
      const bedarf = (a.gewicht || 0) + e.linie_g + e.extruder_g;
      if (!r) return { a, r: null, stufe: "ohne", bedarf };
      if (r.rest_g == null) return { a, r, stufe: "ungewogen", bedarf };
      const vorher = r.id in rest ? rest[r.id] : r.rest_g;
      rest[r.id] = vorher - bedarf;
      const stufe = !a.gewicht ? "unbekannt" : vorher >= bedarf * 1.1 ? "ok" : vorher >= bedarf ? "knapp" : "fehlt";
      const ersatz = stufe === "fehlt" || stufe === "knapp" ? this._daten.rollen.filter((x) => x !== r && x.material === r.material && x.rest_g != null && x.rest_g >= bedarf * 1.1)
        .sort((x, y) => (farbfamilie(y) === farbfamilie(r)) - (farbfamilie(x) === farbfamilie(r)) || x.rest_g - y.rest_g).slice(0, 3) : [];
      return { a, r, stufe, bedarf, vorher, danach: vorher - bedarf, ersatz };
    });
  },
  _wsKlug() { return !!this._daten.einstellungen.schlange_klug; },
  // Klug sortieren: nach Rolle gruppieren, die geladene Rolle zuerst, dann die Rollen in der
  // Reihenfolge, in der sie zuerst vorkommen; innerhalb einer Rolle bleibt die eigene Reihenfolge.
  // Aufträge ohne (bekannte) Rolle kommen ans Ende.
  _wsKlugeReihenfolge(q = this._daten.warteschlange) {
    const geladen = this._daten.geladen, gruppen = new Map();
    for (const a of q) {
      const k = a.rolleId && this._daten.rollen.some((r) => r.id === a.rolleId) ? a.rolleId : "";
      if (!gruppen.has(k)) gruppen.set(k, []);
      gruppen.get(k).push(a);
    }
    const zuerst = (k) => (k && k === geladen ? 0 : k ? 1 : 2);
    return [...gruppen.keys()].sort((a, b) => zuerst(a) - zuerst(b)).flatMap((k) => gruppen.get(k));
  },
  _wsReihenfolge() { return this._wsKlug() ? this._wsKlugeReihenfolge() : this._daten.warteschlange.slice(); },
  // Rollenwechsel einer Reihenfolge (ab der geladenen Rolle)
  _wsWechsel(liste) {
    let vorher = this._daten.geladen || null, n = 0;
    for (const a of liste) { if (!a.rolleId) continue; if (vorher && a.rolleId !== vorher) n++; vorher = a.rolleId; }
    return n;
  },
  // Druckt der Drucker gerade? Restzeit wie in der Drucker-Ansicht
  _wsDruckLaeuft() {
    const zustand = this._drZustand ? this._drZustand() : null;
    if (!["running", "pause", "prepare", "slicing"].includes(zustand)) return null;
    const h = this._drZ("rest_h");
    return { rest_min: h != null ? Math.max(0, h * 60) : 0, name: this._drW("name") };
  },
  // Zeitplan: ab jetzt bzw. nach dem laufenden Druck, Pause je Druck, Zeit je Rollenwechsel
  _wsZeitplan(liste) {
    const laeuft = this._wsDruckLaeuft(), jetzt = Date.now();
    let t = jetzt + (laeuft ? laeuft.rest_min * 60000 : 0), rolle = this._daten.geladen || null;
    const start = t;
    const plan = liste.map((x, i) => {
      const min = wsAuftragDauer(x.a);
      if (min == null) return { ende: null, min: null };
      if (i > 0 || laeuft) t += WS_PAUSE_MIN * 60000;
      if (x.a.rolleId && rolle && x.a.rolleId !== rolle) t += WS_WECHSEL_MIN * 60000;
      if (x.a.rolleId) rolle = x.a.rolleId;
      t += min * 60000;
      return { ende: t, min };
    });
    const abend = new Date(jetzt); abend.setHours(WS_ABEND, 0, 0, 0);
    const morgen = abend.getTime() <= jetzt;
    if (morgen) abend.setDate(abend.getDate() + 1);
    const bisAbend = plan.filter((p) => p.ende != null && p.ende <= abend.getTime()).length;
    return { plan, laeuft, start, ende: t, morgen, bisAbend, ohneDauer: plan.filter((p) => p.ende == null).length };
  },
  _wsSchlangeHtml() {
    const q = this._daten.warteschlange, klug = this._wsKlug();
    const liste = this._wsBestand(this._wsReihenfolge());
    const zp = this._wsZeitplan(liste);
    const text = { ok: ["✓ reicht", "mint"], knapp: ["knapp", "amber"], fehlt: ["reicht nicht", "rot"], ungewogen: ["Rolle nicht gewogen", "amber"], unbekannt: ["Gewicht unbekannt", "leise"], ohne: ["keine Rolle gewählt", "amber"] };
    const wechselManuell = this._wsWechsel(q), wechselKlug = this._wsWechsel(this._wsKlugeReihenfolge());
    const geladen = this._daten.rollen.find((r) => r.id === this._daten.geladen);
    const projekte = this._wsProjekte();
    const heute = new Date().toDateString();
    let letzteRolle = null;
    return `<div class="ws-kopfzeile"><p class="leise">Was als Nächstes gedruckt wird. Die Bestandsprüfung rechnet die Aufträge der Reihe nach von den Rollen ab.</p>
      <button class="knopf" data-aktion="ws-neu">＋ Auftrag</button></div>
      ${q.length > 1 ? `<div class="ws-modus" role="group" aria-label="Reihenfolge">
        <div class="ws-umschalter"><button class="${klug ? "" : "an"}" data-aktion="ws-klug" data-id="aus" aria-pressed="${!klug}">✋ Meine Reihenfolge</button>
          <button class="${klug ? "an" : ""}" data-aktion="ws-klug" data-id="an" aria-pressed="${klug}">🧠 Klug sortieren</button></div>
        ${klug && wechselKlug < wechselManuell ? `<button class="mini mint-rand" data-aktion="ws-klug-uebernehmen">Als meine Reihenfolge übernehmen</button>` : ""}</div>` : ""}
      ${q.length ? `<div class="ws-plan dr-karte">
        <div class="ws-plan-zeile"><span class="ws-plan-icon">⏱</span><div><strong>${zp.laeuft ? `Start nach dem laufenden Druck · noch ${wsDauerText(zp.laeuft.rest_min)}` : "Start: jetzt"}</strong>
          <small class="leise">${zp.ohneDauer < liste.length ? `Alles fertig um ${zp.ohneDauer ? "≥ " : ""}${wsUhr(zp.ende)}${new Date(zp.ende).toDateString() !== heute ? ` (${new Date(zp.ende).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "numeric" })})` : ""}` : "Noch für keinen Auftrag eine Druckdauer eingetragen"} · je Druck ${WS_PAUSE_MIN} min Platte wechseln, je Rollenwechsel ${WS_WECHSEL_MIN} min</small></div></div>
        <div class="ws-plan-zeile ws-plan-abend"><span class="ws-plan-icon">🌙</span><div><strong>Bis ${zp.morgen ? "morgen " : ""}${WS_ABEND}:00 schaffst du <b class="ws-plan-zahl">${zp.bisAbend}</b> ${zp.bisAbend === 1 ? "Druck" : "Drucke"}${zp.bisAbend < liste.length ? ` von ${liste.length}` : ""}</strong>
          ${zp.ohneDauer ? `<small class="amber">${zp.ohneDauer} ${zp.ohneDauer === 1 ? "Auftrag hat" : "Aufträge haben"} keine Druckdauer und ${zp.ohneDauer === 1 ? "zählt" : "zählen"} nicht mit. Dauer eintragen mit ✎</small>` : ""}</div></div>
        <div class="ws-plan-zeile"><span class="ws-plan-icon">🔁</span><div><strong>${klug ? wechselKlug : wechselManuell} Rollenwechsel</strong>
          <small class="leise">${klug ? (wechselKlug < wechselManuell ? `statt ${wechselManuell} in deiner Reihenfolge` : "weniger geht nicht") : wechselKlug < wechselManuell ? `Klug sortiert wären es nur ${wechselKlug}` : "Die Reihenfolge ist schon günstig"}${geladen ? ` · geladen: ${esc(geladen.name)}` : " · keine Rolle als geladen markiert"}</small></div></div>
      </div>` : ""}
      ${!liste.length ? `<div class="leer-karte dr-karte"><span class="gross-icon">📋</span><strong>Die Warteschlange ist leer</strong>
        <span class="leise">Füge Aufträge hier hinzu, aus dem 3D-Modell-Viewer oder mit „Nochmal drucken“ in der Bibliothek.</span></div>` : ""}
      <div class="ws-liste">${liste.map((x, i) => {
        const [st, farbe] = text[x.stufe];
        const p = zp.plan[i];
        let trenner = "";
        if (klug) {
          const k = x.r ? x.r.id : "";
          if (k !== letzteRolle) {
            const art = !k ? "Ohne Rolle" : k === this._daten.geladen ? `Geladen: ${esc(x.r.name)}` : `${i ? "🔁 Rollenwechsel: " : "Zuerst einlegen: "}${esc(x.r.name)}`;
            trenner = `<div class="ws-trenner ${k && k === this._daten.geladen ? "geladen" : ""}">${x.r && x.r.hex ? `<span class="farbtupfer" style="background:${esc(x.r.hex)}"></span>` : ""}${art}</div>`;
            letzteRolle = k;
          }
        }
        const mi = q.indexOf(x.a);
        const pj = projekte.filter((pr) => pr.teile.some((t) => t.art === "auftrag" && t.ref === x.a.id));
        return `${trenner}<div class="ws-auftrag dr-karte ${x.stufe === "fehlt" ? "fehlt" : ""}" data-einmal="ws-a-${esc(x.a.id)}">
          <div class="ws-nr">${i + 1}${x.stufe === "fehlt" ? `<i class="ws-rot-punkt" title="Rolle reicht nicht"></i>` : ""}</div>
          <div class="ws-text"><strong>${esc(x.a.name)}</strong>
            <small class="leise">${x.a.gewicht ? `${zahl(x.a.gewicht, 1)} g` : "Gewicht unbekannt"}${p.min != null ? ` · ${wsDauerText(p.min)}` : ""}${x.r ? ` · ${esc(x.r.name)}` : ""}</small>
            <span class="ws-pillen"><span class="pille ${farbe}">${st}${x.vorher != null && x.a.gewicht ? (x.danach < 0 ? ` · es fehlen ${zahl(-x.danach)} g` : ` · danach ${zahl(x.danach)} g`) : ""}</span>
              ${p.ende != null ? `<span class="pille ws-uhr">fertig um ${wsUhr(p.ende)}${new Date(p.ende).toDateString() !== heute ? ` (${new Date(p.ende).toLocaleDateString("de-DE", { weekday: "short" })})` : ""}</span>` : `<span class="pille ws-ohne-dauer">Dauer fehlt</span>`}
              ${pj.map((pr) => `<span class="pille ws-pj-pille" style="--pj:${esc(pr.farbe)}">${esc(pr.icon)} ${esc(pr.name)}</span>`).join("")}</span>
            ${x.ersatz && x.ersatz.length ? `<div class="chips ws-ersatz"><span class="leise klein">Reicht stattdessen:</span>${x.ersatz.map((r) => `<button class="chip" data-aktion="ws-rolle" data-id="${esc(x.a.id)}" data-rolle="${esc(r.id)}">${esc(r.name)} · ${zahl(r.rest_g)} g</button>`).join("")}</div>` : ""}
            ${x.a.notiz ? `<small class="leise">📝 ${esc(x.a.notiz)}</small>` : ""}</div>
          <div class="ws-knoepfe">
            ${klug ? "" : `<button class="rund" data-aktion="ws-hoch" data-id="${esc(x.a.id)}" ${mi === 0 ? "disabled" : ""} aria-label="Nach oben">↑</button>
            <button class="rund" data-aktion="ws-runter" data-id="${esc(x.a.id)}" ${mi === q.length - 1 ? "disabled" : ""} aria-label="Nach unten">↓</button>`}
            <button class="rund" data-aktion="ws-zu-projekt" data-art="auftrag" data-ref="${esc(x.a.id)}" aria-label="Zu Projekt" title="Zu Projekt">📁</button>
            <button class="rund" data-aktion="ws-bearbeiten" data-id="${esc(x.a.id)}" aria-label="Bearbeiten">✎</button>
            <button class="rund" data-aktion="ws-weg" data-id="${esc(x.a.id)}" aria-label="Entfernen">✓</button>
          </div></div>`;
      }).join("")}</div>`;
  },
  _wsAuftragNeu(werte) {
    const voll = this._daten.rollen.filter((r) => r.rest_g != null).sort((a, b) => b.rest_g - a.rest_g)[0] || this._daten.rollen[0] || {};
    const n = { id: null, name: "", gewicht: 20, rolleId: this._daten.letzte_rolle || voll.id, notiz: "", ...werte };
    if (n.dauer_min == null) n.dauer_min = wsDauerMin(n.zeit) || 0;
    this._wsZustand().neu = n;
    this._ws.dlg = "auftrag";
    this._dialog = "ws-auftrag";
  },
  // Alle Werkstatt-Dialoge laufen über this._dialog = "ws-auftrag", welcher es ist, steht in _ws.dlg
  _wsAuftragDialogHtml() {
    const dlg = this._ws.dlg || "auftrag";
    if (dlg === "projekt") return this._wsProjektDialogHtml();
    if (dlg === "zu-projekt") return this._wsZuProjektDialogHtml();
    if (dlg === "pj-teil") return this._wsPjTeilDialogHtml();
    const n = this._ws.neu;
    const rollen = this._daten.rollen.slice().sort((a, b) => a.name.localeCompare(b.name, "de"));
    return `<h2>${n.id ? "Auftrag bearbeiten" : "Neuer Auftrag"}</h2>
      <label class="feld"><span>Was wird gedruckt?</span><input id="ws-name" value="${esc(n.name)}" placeholder="z. B. Kabelhalter" maxlength="80"></label>
      <div class="mod-regler"><div class="r-kopf"><span>Filament</span><strong id="ws-gewicht">${zahl(n.gewicht, 1)} g</strong></div>
        <div class="regler-zeile"><button class="rund" data-aktion="ws-g" data-d="-5">−5</button><input type="range" min="0" max="1000" step="0.5" value="${n.gewicht}" data-ws="gewicht"><button class="rund" data-aktion="ws-g" data-d="5">+5</button></div></div>
      <div class="mod-regler"><div class="r-kopf"><span>Druckdauer</span><strong id="ws-dauer">${n.dauer_min ? wsDauerText(n.dauer_min) : "unbekannt"}</strong></div>
        <div class="regler-zeile"><button class="rund" data-aktion="ws-d" data-d="-15">−15</button><input type="range" min="0" max="1440" step="5" value="${n.dauer_min || 0}" data-ws="dauer" aria-label="Druckdauer in Minuten"><button class="rund" data-aktion="ws-d" data-d="15">+15</button></div>
        <small class="leise klein">In Minuten, steht im Slicer. Damit rechnet die Warteschlange aus, wann was fertig ist.</small></div>
      <label class="auswahl breit-auswahl"><span>Rolle</span><select data-ws="rolle">${rollen.map((r) => `<option value="${esc(r.id)}" ${r.id === n.rolleId ? "selected" : ""}>${esc(r.name)} · ${esc(r.hersteller)}${r.rest_g != null ? ` · ${zahl(r.rest_g)} g` : ""}${r.id === this._daten.geladen ? " · geladen" : ""}</option>`).join("")}</select></label>
      <label class="feld"><span>Notiz (optional)</span><input id="ws-notiz" value="${esc(n.notiz)}" maxlength="140"></label>
      <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="dialog-zu">Abbrechen</button><button class="knopf" data-aktion="ws-speichern">${n.id ? "Speichern" : "Hinzufügen"}</button></div>`;
  },
  // Aus dem STL-/G-Code-Viewer: Name, Gewicht und gewählte Rolle übernehmen
  _wsAusModell() {
    const m = this._mod;
    if (!m || m.laedt) return;
    let g = null;
    if (m.art === "gcode") g = m.gcode && m.gcode.info.gramm;
    else if (m.kenn) { const r = this._modRolle(); g = gewichtSchaetzen(m.kenn, materialInfo(r ? r.material : "PLA").dichte, { duese: m.duese, waende: m.waende, fuellung: m.fuellung }).gramm; }
    const zeit = m.art === "gcode" ? m.gcode.info.zeit || null : null;
    this._daten.warteschlange.push({ id: `a-${Date.now().toString(36)}`, name: m.name.replace(/\.(gcode\.3mf|gcode|3mf|stl)$/i, ""), gewicht: g ? Math.round(g * 10) / 10 : null,
      zeit, dauer_min: wsDauerMin(zeit), rolleId: m.rolleId, notiz: "", am: new Date().toISOString(), quelle: m.art });
    this._speichern();
    this._toast(`„${m.name}“ steht jetzt in der Warteschlange (Platz ${this._daten.warteschlange.length}).`);
  },

  // ---- Einkaufsliste ----
  _wsEinkauf() {
    const d = this._daten, e = d.einstellungen, liste = [];
    const gruppen = {};
    for (const r of d.rollen) {
      if (r.rest_g == null) continue;
      const k = `${r.material}|${farbfamilie(r)}`;
      (gruppen[k] = gruppen[k] || { material: r.material, farbe: farbfamilie(r), g: 0, rollen: [] });
      gruppen[k].g += r.rest_g; gruppen[k].rollen.push(r);
    }
    for (const x of Object.values(gruppen)) {
      if (x.g < e.mindest_g) liste.push({ art: "farbe", titel: `${x.material} ${x.farbe}`, text: `nur noch ${zahl(x.g)} g (${x.rollen.map((r) => r.name).join(", ")})`, hex: x.rollen[0].hex, dringend: x.g < e.mindest_g / 2 });
    }
    const mats = {};
    for (const r of d.rollen) if (r.rest_g != null) mats[r.material] = (mats[r.material] || 0) + r.rest_g;
    for (const [m, g] of Object.entries(mats)) if (g < e.mindest_material_g) liste.push({ art: "material", titel: `${m} allgemein`, text: `insgesamt nur noch ${zahl(g)} g ${m}`, dringend: g < e.mindest_material_g / 2 });
    for (const t of d.inventar) {
      if (wenigBestand(t) || (t.menge === 0)) liste.push({ art: "teil", titel: teilName(t), text: `${t.menge} Stk${t.min ? `, Mindestbestand ${t.min}` : ""}`, id: t.id, dringend: t.menge === 0, icon: t.icon || kategorie(t.kat).icon });
      else if (t.zustand === "ersetzen") liste.push({ art: "teil", titel: teilName(t), text: "Zustand: ersetzen", id: t.id, dringend: false, icon: t.icon || kategorie(t.kat).icon });
    }
    const h = this._drZ ? this._drZ("stunden") : null;
    if (h != null) for (const t of this._wsTeile()) {
      const genutzt = h - (t.eingebaut_h || 0);
      if (genutzt >= t.lebensdauer_h * 0.9) liste.push({ art: "verschleiss", titel: t.name, text: `${zahl(genutzt)} von ~${zahl(t.lebensdauer_h)} Druckstunden`, dringend: genutzt >= t.lebensdauer_h, icon: "⚙️" });
    }
    return liste.sort((a, b) => b.dringend - a.dringend);
  },
  _wsEinkaufHtml() {
    const l = this._wsEinkauf(), e = this._daten.einstellungen;
    const ungewogen = this._daten.rollen.filter((r) => r.rest_g == null).length;
    return `<div class="ws-kopfzeile"><p class="leise">Filament unter ${zahl(e.mindest_g)} g je Farbe oder ${zahl(e.mindest_material_g)} g je Material, Teile unter dem Mindestbestand und abgenutzte Verschleißteile. Grenzen änderst du unter 💶 Kosten.</p>
      ${l.length ? `<button class="knopf leise" data-aktion="ws-kopieren">📋 Liste kopieren</button>` : ""}</div>
      ${!l.length ? `<div class="leer-karte dr-karte"><span class="gross-icon">✅</span><strong>Nichts nachzukaufen</strong><span class="leise">Alle Farben, Materialien und Teile sind über den Grenzen.</span></div>` : ""}
      <div class="ws-liste">${l.map((x) => `<div class="ws-einkauf dr-karte ${x.dringend ? "dringend" : ""}">
        ${x.hex ? `<span class="farbtupfer" style="background:${esc(x.hex)}"></span>` : `<span class="ws-icon">${x.icon || "🧵"}</span>`}
        <div><strong>${esc(x.titel)}</strong><small class="leise">${esc(x.text)}</small></div>
        ${x.dringend ? `<span class="pille rot">dringend</span>` : ""}
        ${x.id ? `<button class="mini" data-aktion="such-teil" data-id="${esc(x.id)}">Öffnen</button>` : ""}</div>`).join("")}</div>
      ${ungewogen ? `<p class="leise klein oben-abstand">${ungewogen} Rollen sind nicht gewogen und fehlen in der Rechnung.</p>` : ""}`;
  },
  _wsEinkaufText() {
    return "Einkaufsliste 3D-Drucker\n" + this._wsEinkauf().map((x) => `- ${x.titel}: ${x.text}${x.dringend ? " (dringend)" : ""}`).join("\n");
  },

  // ---- Modell-Bibliothek ----
  // Drucke nach Modell zusammenfassen (ohne Angabe: alle Drucke, sonst die gefilterten)
  _wsModelle(drucke = this._buAlle()) {
    const gruppen = new Map();
    for (const d of drucke) {
      if (d.status === "laeuft") continue;
      const k = modellSchluessel(d.name);
      const x = this._buExtra(d.uid);
      const g = gruppen.get(k) || { name: d.name, schluessel: k, drucke: [], ok: 0, fehl: 0 };
      g.drucke.push(d);
      const erg = x.gebucht ? x.gebucht.ergebnis : d.status === "finish" ? "ok" : null;
      if (erg === "ok") g.ok++; else if (erg === "fehl") g.fehl++;
      if (!g.rolle && x.gebucht) g.rolle = x.gebucht.rolle;
      gruppen.set(k, g);
    }
    return [...gruppen.values()].sort((a, b) => (b.drucke[0].start || "").localeCompare(a.drucke[0].start || ""));
  },
  // Ergebnis eines Drucks: ok (erfolgreich), fehl (als Fehldruck verbucht), ab (abgebrochen bzw. anders überlegt)
  _wsErgebnis(d) {
    const g = this._buExtra(d.uid).gebucht;
    if (g) return g.ergebnis === "ok" ? "ok" : g.ergebnis === "fehl" ? "fehl" : "ab";
    return d.status === "finish" ? "ok" : d.status === "failed" ? "ab" : null;
  },
  _wsBibF() {
    const w = this._wsZustand();
    if (!w.bib) w.bib = { fil: "", status: "", zeit: "" };
    return w.bib;
  },
  _wsDruckPasst(d, f) {
    if (f.status && this._wsErgebnis(d) !== f.status) return false;
    if (f.fil) {
      const g = this._buExtra(d.uid).gebucht, rid = g && g.rolle;
      if (!rid) return false;
      if (f.fil.startsWith("r:")) { if (rid !== f.fil.slice(2)) return false; }
      else { const r = this._daten.rollen.find((x) => x.id === rid); if (!r || r.material !== f.fil.slice(2)) return false; }
    }
    if (f.zeit) {
      const t = d.start ? new Date(d.start) : null;
      if (!t || isNaN(t)) return false;
      if (f.zeit === "jahr") { if (t.getFullYear() !== new Date().getFullYear()) return false; }
      else if ((Date.now() - t.getTime()) / 86400000 > Number(f.zeit)) return false;
    }
    return true;
  },
  _wsBibTreffer() {
    const f = this._wsBibF(), q = (this._ws.suche || "").trim();
    let modelle = this._wsModelle(this._buAlle().filter((d) => this._wsDruckPasst(d, f)));
    if (q) modelle = modelle.filter((m) => { const r = this._daten.rollen.find((x) => x.id === m.rolle); return suchPunkte(q, `${m.name} ${r ? `${r.name} ${r.material}` : ""}`); });
    return { modelle, drucke: modelle.reduce((s, m) => s + m.drucke.length, 0) };
  },
  _wsBibAktiv() { const f = this._wsBibF(); return [f.fil, f.status, f.zeit].filter(Boolean).length + ((this._ws.suche || "").trim() ? 1 : 0); },
  _wsBibZahlHtml(tr) {
    const n = this._wsBibAktiv();
    return `<span><strong>${tr.drucke}</strong> ${tr.drucke === 1 ? "Druck" : "Drucke"} in <strong>${tr.modelle.length}</strong> ${tr.modelle.length === 1 ? "Modell" : "Modellen"}${n ? ` · ${n} ${n === 1 ? "Filter" : "Filter"} aktiv` : ""}</span>
      ${n ? `<button class="mini" data-aktion="ws-bib-reset">✕ Filter zurücksetzen</button>` : ""}`;
  },
  _wsBibRasterHtml(tr) {
    if (tr.modelle.length) return tr.modelle.map((m) => this._wsModellKarte(m)).join("");
    return `<div class="leer-karte dr-karte ws-bib-leer"><span class="gross-icon">🔍</span><strong>Kein Druck passt zu den Filtern</strong>
      <span class="leise">Probier einen längeren Zeitraum oder ein anderes Filament.</span><button class="knopf leise klein-knopf" data-aktion="ws-bib-reset">Filter zurücksetzen</button></div>`;
  },
  _wsBibliothekHtml() {
    const w = this._wsZustand(), f = this._wsBibF(), q = w.suche || "";
    const alle = this._wsModelle();
    if (!alle.length) return `<div class="leer-karte dr-karte"><span class="gross-icon">📚</span><strong>Noch keine Modelle</strong><span class="leise">Jeder Druck aus dem Druckverlauf landet hier, gleiche Modelle werden zusammengefasst.</span></div>`;
    const tr = this._wsBibTreffer();
    // Filament-Auswahl: Rollen, mit denen schon etwas verbucht wurde (sonst alle), darüber die Materialien
    const benutzt = new Set(this._buAlle().map((d) => (this._buExtra(d.uid).gebucht || {}).rolle).filter(Boolean));
    const rollen = this._daten.rollen.filter((r) => !benutzt.size || benutzt.has(r.id)).sort((a, b) => a.name.localeCompare(b.name, "de"));
    const mats = [...new Set(rollen.map((r) => r.material))].sort();
    const opt = (v, t) => `<option value="${esc(v)}" ${f.fil === v || f.zeit === v ? "selected" : ""}>${esc(t)}</option>`;
    const anzahl = [f.fil, f.status, f.zeit].filter(Boolean).length;
    const filter = `<div class="ws-bib-filter" data-einmal="ws-bib-filter">
        <label class="auswahl ${f.fil ? "an" : ""}"><span>Filament</span><select data-ws="bib-fil"><option value="">Alle Filamente</option>
          <optgroup label="Material">${mats.map((m) => opt(`m:${m}`, `Alle ${m}`)).join("")}</optgroup>
          <optgroup label="Rolle">${rollen.map((r) => opt(`r:${r.id}`, `${r.name} · ${r.material}`)).join("")}</optgroup></select></label>
        <label class="auswahl ${f.zeit ? "an" : ""}"><span>Zeitraum</span><select data-ws="bib-zeit">${WS_ZEITRAUM.map(([v, t]) => `<option value="${v}" ${f.zeit === v ? "selected" : ""}>${t}</option>`).join("")}</select></label>
        <div class="chips ws-bib-status" role="group" aria-label="Ergebnis"><button class="chip ${f.status ? "" : "an"}" data-aktion="ws-bib-status" data-id="">Alle</button>
          ${WS_ERGEBNIS.map(([v, t]) => `<button class="chip ${f.status === v ? "an" : ""} ${v === "ok" ? "" : "rot-chip"}" data-aktion="ws-bib-status" data-id="${v}">${t}</button>`).join("")}</div>
      </div>`;
    return `<div class="ws-bib-werkzeug">
        <input class="such-feld" type="search" data-ws="suche" value="${esc(q)}" placeholder="Modell oder Filament suchen …" aria-label="Modell suchen" autocomplete="off">
        ${this._mobil ? `<button class="auswahl filter-knopf ${anzahl ? "an" : ""}" data-aktion="ws-bib-auf" aria-expanded="${!!w.bibAuf}"><span>Filter</span><strong>${anzahl ? `${anzahl} aktiv` : "Keiner"}</strong></button>` : ""}
        ${!this._mobil || w.bibAuf ? filter : ""}
      </div>
      <div class="ws-treffer" id="ws-bib-zahl">${this._wsBibZahlHtml(tr)}</div>
      <div class="ws-raster" id="ws-bib">${this._wsBibRasterHtml(tr)}</div>`;
  },
  _wsModellKarte(m) {
    const d = m.drucke[0], f = fotoName(d), foto = f && this._drFotos && this._drFotos[f];
    const r = this._daten.rollen.find((x) => x.id === m.rolle);
    const quote = m.ok + m.fehl ? Math.round((m.ok / (m.ok + m.fehl)) * 100) : null;
    const pj = this._wsProjekte().filter((p) => p.teile.some((t) => t.schluessel === m.schluessel && (t.art === "modell" || t.art === "auftrag" || m.drucke.some((x) => x.uid === t.ref))));
    return `<div class="ws-modell dr-karte">
      <div class="ws-foto" data-foto="${esc(f || "")}">${foto ? `<img src="${esc(foto)}" alt="" loading="lazy">` : `<span>🧊</span>`}</div>
      <div class="ws-modell-text"><strong title="${esc(m.name)}">${esc(m.name)}</strong>
        <small class="leise">${m.drucke.length}× gedruckt · zuletzt ${esc(d.zeit || "–")}</small>
        <small class="leise">${d.gewicht != null ? `${zahl(d.gewicht, 1)} g` : "–"}${r ? ` · ${esc(r.name)}` : ""}${quote != null ? ` · ${quote} % geglückt` : ""}</small>
        ${pj.length ? `<span class="ws-pillen">${pj.map((p) => `<button class="pille ws-pj-pille" style="--pj:${esc(p.farbe)}" data-aktion="ws-pj-auf" data-id="${esc(p.id)}">${esc(p.icon)} ${esc(p.name)}</button>`).join("")}</span>` : ""}</div>
      <div class="ws-modell-knoepfe"><button class="knopf klein-knopf" data-aktion="ws-nochmal" data-uid="${esc(d.uid)}" title="Nochmal drucken: in die Warteschlange">↻ Nochmal</button>
        <button class="rund" data-aktion="ws-zu-projekt" data-art="modell" data-ref="${esc(m.schluessel)}" data-name="${esc(m.name)}" aria-label="Zu Projekt" title="Zu Projekt">📁</button>
        <button class="mini" data-aktion="zum-druck" data-uid="${esc(d.uid)}">Details</button></div></div>`;
  },

  // ---- Projekte ----
  _wsProjekte() { return (this._daten && this._daten.projekte) || []; },
  _wsProjekt(id) { return this._wsProjekte().find((p) => p.id === id); },
  // Stand eines Projektteils: passender Druck (über die Druck-ID oder den Modellnamen), Auftrag in der Warteschlange
  _wsPjTeilInfo(t) {
    const q = this._daten.warteschlange;
    const alle = this._buAlle().filter((d) => d.status !== "laeuft");
    const drucke = t.art === "druck" ? alle.filter((d) => d.uid === t.ref) : alle.filter((d) => modellSchluessel(d.name) === t.schluessel);
    const ok = drucke.find((d) => this._wsErgebnis(d) === "ok");
    const d = ok || drucke[0] || null;
    const auftrag = (t.art === "auftrag" && q.find((a) => a.id === t.ref)) || (!ok && q.find((a) => modellSchluessel(a.name) === t.schluessel)) || null;
    const fertig = t.fertig != null ? t.fertig : !!ok;
    const status = fertig ? "fertig" : auftrag ? "schlange" : d && this._wsErgebnis(d) === "fehl" ? "fehl" : "offen";
    const g = d ? this._buExtra(d.uid).gebucht : null;
    const gramm = g && g.g != null ? g.g : d && d.gewicht != null ? d.gewicht : auftrag && auftrag.gewicht != null ? auftrag.gewicht : null;
    let kosten = null, geschaetzt = false;
    if (g && g.kosten && (g.kosten.filament != null || g.kosten.strom != null)) kosten = (g.kosten.filament || 0) + (g.kosten.strom || 0);
    else if (gramm != null) {
      const r = this._daten.rollen.find((x) => x.id === ((g && g.rolle) || (auftrag && auftrag.rolleId)));
      if (r && r.preis_kg) { kosten = (gramm * r.preis_kg) / 1000; geschaetzt = true; }
    }
    const min = d ? wsDruckDauer(d) : auftrag ? wsAuftragDauer(auftrag) : null;
    return { t, d, auftrag, status, fertig, gramm, kosten, geschaetzt, min, foto: d ? fotoName(d) : null, anzahl: drucke.length };
  },
  _wsPjSumme(p) {
    const infos = p.teile.map((t) => this._wsPjTeilInfo(t));
    const s = { infos, fertig: 0, g: 0, g_fertig: 0, kosten: 0, geschaetzt: false, ohneKosten: 0, min: 0 };
    for (const i of infos) {
      if (i.fertig) { s.fertig++; s.g_fertig += i.gramm || 0; }
      s.g += i.gramm || 0;
      if (i.kosten != null) s.kosten += i.kosten; else s.ohneKosten++;
      if (i.geschaetzt) s.geschaetzt = true;
      s.min += i.min || 0;
    }
    s.anteil = infos.length ? s.fertig / infos.length : 0;
    return s;
  },
  _wsPjZeile(s) {
    return `${s.fertig}/${s.infos.length} ${s.infos.length === 1 ? "Teil" : "Teile"} fertig · ${zahl(s.g)} g · ${s.geschaetzt ? "ca. " : ""}${zahl(s.kosten, 2)} € · ${wsDauerText(s.min)}`;
  },
  _wsProjekteHtml() {
    const w = this._wsZustand();
    const p = w.projekt && this._wsProjekt(w.projekt);
    if (p) return this._wsProjektHtml(p);
    const liste = this._wsProjekte();
    return `<div class="ws-kopfzeile"><p class="leise">Fasse zusammengehörige Drucke zu einem Projekt zusammen, z. B. alle Teile eines Gehäuses. Teile kommen aus der Bibliothek, der Warteschlange oder dem Druckverlauf (📁).</p>
      <button class="knopf" data-aktion="ws-pj-neu">＋ Projekt</button></div>
      ${!liste.length ? `<div class="leer-karte dr-karte"><span class="gross-icon">📁</span><strong>Noch keine Projekte</strong>
        <span class="leise">Lege ein Projekt an und ordne ihm Drucke zu. Dann siehst du Fortschritt, Gewicht, Kosten und Druckzeit auf einen Blick.</span></div>` : ""}
      <div class="ws-pj-raster">${liste.map((pr) => {
        const s = this._wsPjSumme(pr);
        return `<button class="ws-pj-karte dr-karte" data-aktion="ws-pj-auf" data-id="${esc(pr.id)}" style="--pj:${esc(pr.farbe)}" data-einmal="ws-pj-${esc(pr.id)}">
          <span class="ws-pj-icon">${esc(pr.icon)}</span>
          <span class="ws-pj-text"><strong>${esc(pr.name)}</strong>${pr.beschreibung ? `<small class="leise">${esc(pr.beschreibung)}</small>` : ""}</span>
          <span class="ws-pj-prozent">${Math.round(s.anteil * 100)} %</span>
          <span class="ws-balken ws-pj-balken"><span style="width:${Math.round(s.anteil * 100)}%"></span></span>
          <small class="leise ws-pj-fuss">${s.infos.length ? this._wsPjZeile(s) : "Noch keine Teile"}</small></button>`;
      }).join("")}</div>`;
  },
  _wsProjektHtml(p) {
    const s = this._wsPjSumme(p);
    const prozent = Math.round(s.anteil * 100);
    const kachel = (titel, wert, sub) => `<div class="ws-pj-zahl"><span>${titel}</span><strong>${wert}</strong>${sub ? `<small>${sub}</small>` : ""}</div>`;
    return `<div class="ws-pj-detail" style="--pj:${esc(p.farbe)}">
      <button class="mini ws-pj-zurueck" data-aktion="ws-pj-zu">← Alle Projekte</button>
      <div class="ws-pj-kopf dr-karte">
        <div class="ws-pj-ring">${ringSvg(prozent, p.farbe)}<div class="ws-pj-ring-text"><span>${esc(p.icon)}</span><strong>${prozent} %</strong></div></div>
        <div class="ws-pj-kopf-text"><h2>${esc(p.name)}</h2>${p.beschreibung ? `<p class="leise">${esc(p.beschreibung)}</p>` : ""}
          <div class="ws-pj-kopf-knoepfe"><button class="knopf leise klein-knopf" data-aktion="ws-pj-bearbeiten" data-id="${esc(p.id)}">✎ Bearbeiten</button>
            <button class="knopf leise klein-knopf rot-text" data-aktion="ws-pj-loeschen" data-id="${esc(p.id)}">🗑 Löschen</button></div></div>
      </div>
      <div class="ws-pj-zahlen">
        ${kachel("Fortschritt", `${s.fertig} / ${s.infos.length}`, s.infos.length === 1 ? "Teil fertig" : "Teile fertig")}
        ${kachel("Gewicht", `${zahl(s.g)} g`, s.g_fertig < s.g ? `davon ${zahl(s.g_fertig)} g gedruckt` : s.g ? "alles gedruckt" : "")}
        ${kachel("Kosten", `${s.geschaetzt ? "ca. " : ""}${zahl(s.kosten, 2)} €`, s.ohneKosten ? `${s.ohneKosten} ohne Preis` : "Filament + Strom")}
        ${kachel("Druckzeit", wsDauerText(s.min), "zusammen")}
      </div>
      <div class="ws-kopfzeile ws-pj-teile-kopf"><h3>Teile</h3><button class="knopf klein-knopf" data-aktion="ws-pj-teil-neu">＋ Teil hinzufügen</button></div>
      ${!s.infos.length ? `<div class="leer-karte dr-karte"><span class="gross-icon">🧩</span><strong>Noch keine Teile</strong><span class="leise">Füge Modelle aus der Bibliothek, Aufträge aus der Warteschlange, Drucke aus dem Verlauf oder geplante Teile hinzu.</span></div>` : ""}
      <div class="ws-raster">${s.infos.map((i) => {
        const foto = i.foto && this._drFotos && this._drFotos[i.foto];
        const [st, farbe] = WS_PJ_TEIL_STATUS[i.status];
        return `<div class="ws-modell ws-pj-teil dr-karte ${i.fertig ? "fertig" : ""}" data-einmal="ws-pj-t-${esc(i.t.id)}">
          <div class="ws-foto" data-foto="${esc(i.foto || "")}">${foto ? `<img src="${esc(foto)}" alt="" loading="lazy">` : `<span>${i.fertig ? "✅" : i.auftrag ? "📋" : "🧩"}</span>`}</div>
          <div class="ws-modell-text"><strong title="${esc(i.t.name)}">${esc(i.t.name)}</strong>
            <span class="ws-pillen"><span class="pille ${farbe}">${st}</span>${i.t.fertig != null ? `<span class="pille ws-ohne-dauer" title="Von Hand gesetzt">von Hand</span>` : ""}</span>
            <small class="leise">${i.gramm != null ? `${zahl(i.gramm, 1)} g` : "– g"} · ${i.kosten != null ? `${i.geschaetzt ? "ca. " : ""}${zahl(i.kosten, 2)} €` : "– €"} · ${wsDauerText(i.min)}</small>
            <small class="leise">${{ modell: "aus der Bibliothek", druck: "aus dem Druckverlauf", auftrag: "aus der Warteschlange", plan: "geplant" }[i.t.art] || ""}${i.anzahl > 1 ? ` · ${i.anzahl}× gedruckt` : ""}</small></div>
          <div class="ws-modell-knoepfe">
            <button class="knopf ${i.fertig ? "leise" : ""} klein-knopf" data-aktion="ws-pj-fertig" data-id="${esc(i.t.id)}" title="${i.fertig ? "Doch nicht fertig" : "Als fertig abhaken"}">${i.fertig ? "↺ Offen" : "✓ Fertig"}</button>
            ${!i.fertig && !i.auftrag ? `<button class="rund" data-aktion="ws-pj-drucken" data-id="${esc(i.t.id)}" aria-label="In die Warteschlange" title="In die Warteschlange">📋</button>` : ""}
            ${i.d ? `<button class="mini" data-aktion="zum-druck" data-uid="${esc(i.d.uid)}">Details</button>` : ""}
            <button class="rund" data-aktion="ws-pj-teil-weg" data-id="${esc(i.t.id)}" aria-label="Aus dem Projekt nehmen" title="Aus dem Projekt nehmen">✕</button></div></div>`;
      }).join("")}</div></div>`;
  },
  // Projekt anlegen / bearbeiten
  _wsProjektDialogHtml() {
    const n = this._ws.pjNeu;
    return `<h2>${n.id ? "Projekt bearbeiten" : "Neues Projekt"}</h2>
      <label class="feld"><span>Name</span><input id="ws-pj-name" value="${esc(n.name)}" placeholder="z. B. Gehäuse Wetterstation" maxlength="60"></label>
      <label class="feld"><span>Beschreibung (optional)</span><textarea id="ws-pj-text" rows="2" maxlength="300" placeholder="Wofür, was fehlt noch …">${esc(n.beschreibung)}</textarea></label>
      <div class="feld-titel">Farbe</div>
      <div class="chips ws-pj-farben">${WS_PJ_FARBEN.map((f) => `<button class="ws-farbe ${n.farbe === f ? "an" : ""}" style="--f:${f}" data-aktion="ws-pj-farbe" data-id="${f}" aria-label="Farbe ${f}" aria-pressed="${n.farbe === f}"></button>`).join("")}</div>
      <div class="feld-titel oben-abstand">Symbol</div>
      <div class="chips ws-pj-icons">${WS_PJ_ICONS.map((i) => `<button class="chip ${n.icon === i ? "an" : ""}" data-aktion="ws-pj-icon" data-id="${i}">${i}</button>`).join("")}</div>
      <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="dialog-zu">Abbrechen</button><button class="knopf" data-aktion="ws-pj-speichern">${n.id ? "Speichern" : "Anlegen"}</button></div>`;
  },
  // Eintrag (Modell, Druck, Auftrag) einem oder mehreren Projekten zuordnen
  _wsZuProjektDialogHtml() {
    const z = this._ws.zu, liste = this._wsProjekte();
    return `<h2>📁 Zu Projekt</h2><p class="leise">„${esc(z.name)}“ gehört zu …</p>
      ${liste.length ? `<div class="ws-pj-wahl">${liste.map((p) => {
        const drin = p.teile.some((t) => t.art === z.art && t.ref === z.ref);
        return `<button class="ws-pj-zeile ${drin ? "an" : ""}" data-aktion="ws-zu-wahl" data-id="${esc(p.id)}" style="--pj:${esc(p.farbe)}" aria-pressed="${drin}">
          <span class="ws-pj-icon klein">${esc(p.icon)}</span><span class="ws-pj-zeile-text">${esc(p.name)}<small>${p.teile.length} ${p.teile.length === 1 ? "Teil" : "Teile"}</small></span><b>${drin ? "✓" : "＋"}</b></button>`;
      }).join("")}</div>` : `<p class="leise klein">Noch kein Projekt da.</p>`}
      <button class="knopf leise breit oben-abstand" data-aktion="ws-zu-neu">＋ Neues Projekt mit diesem Teil</button>
      <button class="knopf breit oben-abstand" data-aktion="dialog-zu">Fertig</button>`;
  },
  // Teile zum offenen Projekt hinzufügen
  _wsPjTeilDialogHtml() {
    const w = this._ws, p = this._wsProjekt(w.projekt);
    if (!p) return `<p class="leise">Projekt nicht gefunden.</p><button class="knopf breit" data-aktion="dialog-zu">Schließen</button>`;
    const quelle = w.pjQuelle || "bibliothek";
    const drin = (art, ref) => p.teile.some((t) => t.art === art && t.ref === ref);
    const zeile = (art, ref, name, sub) => `<button class="ws-pj-zeile ${drin(art, ref) ? "an" : ""}" data-aktion="ws-pj-teil-dazu" data-art="${art}" data-ref="${esc(ref)}" data-name="${esc(name)}">
      <span class="ws-pj-zeile-text">${esc(name)}<small>${esc(sub)}</small></span><b>${drin(art, ref) ? "✓" : "＋"}</b></button>`;
    let inhalt = "";
    if (quelle === "bibliothek") {
      const m = this._wsModelle();
      inhalt = m.length ? m.map((x) => zeile("modell", x.schluessel, x.name, `${x.drucke.length}× gedruckt · zuletzt ${x.drucke[0].zeit || "–"}`)).join("") : `<p class="leise klein">Die Bibliothek ist leer.</p>`;
    } else if (quelle === "schlange") {
      const q = this._daten.warteschlange;
      inhalt = q.length ? q.map((a) => zeile("auftrag", a.id, a.name, `${a.gewicht ? `${zahl(a.gewicht, 1)} g` : "Gewicht unbekannt"}${wsAuftragDauer(a) ? ` · ${wsDauerText(wsAuftragDauer(a))}` : ""}`)).join("") : `<p class="leise klein">Die Warteschlange ist leer.</p>`;
    } else if (quelle === "verlauf") {
      const v = this._buAlle().filter((d) => d.status !== "laeuft").slice(0, 40);
      const erg = { ok: "erfolgreich", fehl: "Fehldruck", ab: "abgebrochen" };
      inhalt = v.length ? v.map((d) => zeile("druck", d.uid, d.name, `${d.zeit || ""}${this._wsErgebnis(d) ? ` · ${erg[this._wsErgebnis(d)]}` : ""}`)).join("") : `<p class="leise klein">Noch keine Drucke im Verlauf.</p>`;
    } else {
      inhalt = `<label class="feld"><span>Name des Teils</span><input id="ws-pj-plan" placeholder="z. B. Deckel" maxlength="80"></label>
        <p class="leise klein">Ein geplantes Teil wird fertig, sobald ein Druck mit gleichem Namen geglückt ist, oder wenn du es von Hand abhakst.</p>
        <button class="knopf breit" data-aktion="ws-pj-plan-dazu">＋ Geplantes Teil hinzufügen</button>`;
    }
    return `<h2>Teil hinzufügen</h2><p class="leise klein">zu ${esc(p.icon)} ${esc(p.name)}</p>
      <div class="chips ws-pj-quellen">${[["bibliothek", "📚 Bibliothek"], ["schlange", "📋 Warteschlange"], ["verlauf", "🕘 Verlauf"], ["plan", "✏️ Geplant"]].map(([id, n]) => `<button class="chip ${quelle === id ? "an" : ""}" data-aktion="ws-pj-quelle" data-id="${id}">${n}</button>`).join("")}</div>
      <div class="ws-pj-wahl oben-abstand">${inhalt}</div>
      <button class="knopf leise breit oben-abstand" data-aktion="dialog-zu">Fertig</button>`;
  },
  // Teil in ein Projekt aufnehmen (doppelt wird ignoriert); gibt true zurück, wenn neu
  _wsPjTeilDazu(p, art, ref, name) {
    if (p.teile.some((t) => t.art === art && t.ref === ref)) return false;
    p.teile.push({ id: `t-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, art, ref, name, schluessel: art === "modell" ? ref : modellSchluessel(name), am: new Date().toISOString() });
    return true;
  },
  // Name eines Eintrags je nach Art
  _wsEintragName(art, ref, name) {
    if (art === "auftrag") { const a = this._daten.warteschlange.find((x) => x.id === ref); return a ? a.name : name; }
    if (art === "druck") { const d = this._buAlle().find((x) => x.uid === ref); return d ? d.name : name; }
    return name;
  },
  _wsPjFormLesen() {
    const n = this._ws.pjNeu, root = this.shadowRoot;
    const a = root.getElementById("ws-pj-name"), b = root.getElementById("ws-pj-text");
    if (a) n.name = a.value; if (b) n.beschreibung = b.value;
  },
  // Gibt true zurück, wenn der Klick zu den Projekten/zur Bibliothek gehörte
  _wsPjKlick(a, el) {
    const w = this._wsZustand();
    const p = w.projekt && this._wsProjekt(w.projekt);
    switch (a) {
      case "ws-bib-status": this._wsBibF().status = el.dataset.id; break;
      case "ws-bib-reset": w.bib = { fil: "", status: "", zeit: "" }; w.suche = ""; break;
      case "ws-bib-auf": w.bibAuf = !w.bibAuf; break;
      case "ws-pj-neu": w.pjNeu = { id: null, name: "", beschreibung: "", farbe: WS_PJ_FARBEN[this._wsProjekte().length % WS_PJ_FARBEN.length], icon: "📦" }; w.dlg = "projekt"; this._dialog = "ws-auftrag"; break;
      case "ws-pj-bearbeiten": { const x = this._wsProjekt(el.dataset.id); if (!x) return true; w.pjNeu = { id: x.id, name: x.name, beschreibung: x.beschreibung || "", farbe: x.farbe, icon: x.icon }; w.dlg = "projekt"; this._dialog = "ws-auftrag"; break; }
      case "ws-pj-farbe": this._wsPjFormLesen(); w.pjNeu.farbe = el.dataset.id; break;
      case "ws-pj-icon": this._wsPjFormLesen(); w.pjNeu.icon = el.dataset.id; break;
      case "ws-pj-speichern": {
        this._wsPjFormLesen();
        const n = w.pjNeu;
        n.name = (n.name || "").trim(); n.beschreibung = (n.beschreibung || "").trim();
        if (!n.name) { this._toast("Bitte einen Namen eingeben."); return true; }
        if (!this._daten.projekte) this._daten.projekte = [];
        let x = n.id && this._wsProjekt(n.id);
        if (x) Object.assign(x, { name: n.name, beschreibung: n.beschreibung, farbe: n.farbe, icon: n.icon });
        else {
          x = { id: `p-${Date.now().toString(36)}`, name: n.name, beschreibung: n.beschreibung, farbe: n.farbe, icon: n.icon, teile: [], am: new Date().toISOString() };
          this._daten.projekte.push(x);
          if (n.mitTeil) this._wsPjTeilDazu(x, n.mitTeil.art, n.mitTeil.ref, n.mitTeil.name);
          this._toast(`Projekt „${x.name}“ angelegt${n.mitTeil ? ` mit „${n.mitTeil.name}“` : ""}.`);
        }
        w.pjNeu = null; this._dialog = null;
        if (!n.mitTeil) { w.tab = "projekte"; w.projekt = x.id; }
        this._speichern();
        break;
      }
      case "ws-pj-auf": w.tab = "projekte"; w.projekt = el.dataset.id; this._wsFotos(); break;
      case "ws-pj-zu": w.projekt = null; break;
      case "ws-pj-loeschen": {
        const i = this._wsProjekte().findIndex((x) => x.id === el.dataset.id);
        if (i < 0 || !confirm(`Projekt „${this._daten.projekte[i].name}“ löschen? Die Drucke selbst bleiben erhalten.`)) return true;
        const [weg] = this._daten.projekte.splice(i, 1);
        this._wsPjWeg = { p: weg, i };
        w.projekt = null;
        this._speichern();
        this._toastMitKnopf(`Projekt „${weg.name}“ gelöscht.`, "Rückgängig", "ws-pj-zurueck");
        break;
      }
      case "ws-pj-zurueck": {
        const z = this._wsPjWeg;
        if (z && !this._wsProjekt(z.p.id)) { this._daten.projekte.splice(Math.min(z.i, this._daten.projekte.length), 0, z.p); this._speichern(); }
        this._wsPjWeg = null; this._toastText = null;
        break;
      }
      case "ws-zu-projekt": {
        const art = el.dataset.art, ref = el.dataset.ref;
        const name = this._wsEintragName(art, ref, el.dataset.name || "");
        w.zu = { art, ref, name };
        w.dlg = "zu-projekt"; this._dialog = "ws-auftrag";
        break;
      }
      case "ws-zu-wahl": {
        const x = this._wsProjekt(el.dataset.id), z = w.zu;
        if (!x || !z) return true;
        if (!this._wsPjTeilDazu(x, z.art, z.ref, z.name)) x.teile = x.teile.filter((t) => !(t.art === z.art && t.ref === z.ref));
        this._speichern();
        break;
      }
      case "ws-zu-neu": w.pjNeu = { id: null, name: "", beschreibung: "", farbe: WS_PJ_FARBEN[this._wsProjekte().length % WS_PJ_FARBEN.length], icon: "📦", mitTeil: w.zu }; w.dlg = "projekt"; break;
      case "ws-pj-teil-neu": w.pjQuelle = w.pjQuelle || "bibliothek"; w.dlg = "pj-teil"; this._dialog = "ws-auftrag"; break;
      case "ws-pj-quelle": w.pjQuelle = el.dataset.id; break;
      case "ws-pj-teil-dazu": {
        if (!p) return true;
        const art = el.dataset.art, ref = el.dataset.ref;
        if (!this._wsPjTeilDazu(p, art, ref, this._wsEintragName(art, ref, el.dataset.name || ""))) p.teile = p.teile.filter((t) => !(t.art === art && t.ref === ref));
        this._speichern();
        break;
      }
      case "ws-pj-plan-dazu": {
        const f = this.shadowRoot.getElementById("ws-pj-plan"), name = f ? f.value.trim() : "";
        if (!p || !name) { this._toast("Bitte einen Namen eingeben."); return true; }
        this._wsPjTeilDazu(p, "plan", `plan-${Date.now().toString(36)}`, name);
        this._speichern();
        this._toast(`„${name}“ ist jetzt Teil von „${p.name}“.`);
        break;
      }
      case "ws-pj-fertig": {
        const t = p && p.teile.find((x) => x.id === el.dataset.id);
        if (!t) return true;
        const i = this._wsPjTeilInfo({ ...t, fertig: undefined });
        const soll = !this._wsPjTeilInfo(t).fertig;
        if (soll === !!(i.d && this._wsErgebnis(i.d) === "ok")) delete t.fertig; else t.fertig = soll;   // wie automatisch: keine Ausnahme merken
        this._speichern();
        break;
      }
      case "ws-pj-teil-weg": {
        if (!p) return true;
        const t = p.teile.find((x) => x.id === el.dataset.id);
        p.teile = p.teile.filter((x) => x.id !== el.dataset.id);
        this._speichern();
        if (t) this._toast(`„${t.name}“ aus dem Projekt genommen.`);
        break;
      }
      case "ws-pj-drucken": {
        const t = p && p.teile.find((x) => x.id === el.dataset.id);
        if (!t) return true;
        const i = this._wsPjTeilInfo(t), g = i.d ? this._buExtra(i.d.uid).gebucht : null;
        const neu = { id: `a-${Date.now().toString(36)}`, name: t.name, gewicht: i.gramm, dauer_min: i.min, rolleId: (g && g.rolle) || this._daten.geladen || this._daten.letzte_rolle, notiz: "", am: new Date().toISOString(), quelle: "projekt" };
        this._daten.warteschlange.push(neu);
        if (t.art === "plan") { t.art = "auftrag"; t.ref = neu.id; }
        this._speichern();
        this._toast(`„${t.name}“ steht in der Warteschlange (Platz ${this._daten.warteschlange.length}).`);
        break;
      }
      default: return false;
    }
    this._zeichnen();
    return true;
  },

  // ---- Fehldrucke ----
  _wsFehldrucke() {
    return this._buAlle().filter((d) => { const g = this._buExtra(d.uid).gebucht; return g && g.ergebnis === "fehl"; });
  },
  _wsFehlHtml() {
    const l = this._wsFehldrucke();
    if (!l.length) return `<div class="leer-karte dr-karte"><span class="gross-icon">🎉</span><strong>Keine Fehldrucke</strong><span class="leise">Wird ein abgebrochener Druck als Fehldruck verbucht, landet er hier mit Endfoto und Ursache.</span></div>`;
    return `<p class="leise">${l.length} Fehldrucke mit Endfoto, Ursache und was geändert wurde.</p>
      <div class="ws-raster">${l.map((d) => {
        const x = this._buExtra(d.uid), f = fotoName(d), foto = f && this._drFotos && this._drFotos[f];
        const r = this._daten.rollen.find((y) => y.id === x.gebucht.rolle);
        const ursachen = ((x.fehl && x.fehl.ursachen) || []).map((id) => fehlerbild(id)).filter(Boolean);
        return `<div class="ws-modell dr-karte fehl">
          <div class="ws-foto" data-foto="${esc(f || "")}">${foto ? `<img src="${esc(foto)}" alt="" loading="lazy">` : `<span>💥</span>`}</div>
          <div class="ws-modell-text"><strong>${esc(d.name)}</strong>
            <small class="leise">${esc(d.zeit || "")} · bei ${zahl(x.gebucht.fortschritt)} %${r ? ` · ${esc(r.name)}` : ""}</small>
            ${ursachen.length ? `<small>🩺 ${esc(ursachen.map((u) => u.name).join(", "))}</small>` : `<small class="leise">Ursache nicht angegeben</small>`}
            ${x.fehl && x.fehl.geaendert && x.fehl.geaendert.length ? `<small class="mint">Geändert: ${esc(x.fehl.geaendert.join(", "))}</small>` : ""}</div>
          <div class="ws-modell-knoepfe"><button class="rund" data-aktion="ws-zu-projekt" data-art="druck" data-ref="${esc(d.uid)}" data-name="${esc(d.name)}" aria-label="Zu Projekt" title="Zu Projekt">📁</button>
            <button class="mini" data-aktion="zum-druck" data-uid="${esc(d.uid)}">Details</button></div></div>`;
      }).join("")}</div>`;
  },

  // ---- Wartung ----
  _wsTeile() {
    const w = this._daten.wartung;
    return w.teile || ERSATZTEILE_STANDARD.map((t) => ({ ...t }));
  },
  _wsWartung() {
    const h = this._drZ ? this._drZ("stunden") : null;
    const auf = this._daten.wartung.aufgaben || {};
    return WARTUNG_AUFGABEN.map((a) => {
      const z = auf[a.id];
      if (!z) return { a, neu: true, faellig: false, anteil: 0 };
      const seitH = h != null && z.h != null ? h - z.h : null;
      const seitT = tageSeit(z.am);
      const anteil = Math.max(seitH != null ? seitH / a.alle_h : 0, seitT / a.alle_tage);
      return { a, z, seitH, seitT, anteil, faellig: anteil >= 1 };
    }).sort((x, y) => y.anteil - x.anteil);
  },
  _wsWartungHtml() {
    const h = this._drZ ? this._drZ("stunden") : null;
    const liste = this._wsWartung();
    const teile = this._wsTeile();
    const balken = (anteil) => `<div class="ws-balken"><span style="width:${Math.min(100, Math.round(anteil * 100))}%" class="${anteil >= 1 ? "rot" : anteil >= 0.8 ? "amber" : ""}"></span></div>`;
    return `<div class="ws-kopfzeile"><p class="leise">Fällig nach Druckstunden oder Tagen, je nachdem was zuerst kommt. ${h != null ? `Der Drucker hat ${zahl(h)} Betriebsstunden.` : "Betriebsstunden gerade nicht abrufbar, gezählt wird nach Tagen."}</p></div>
      <div class="ws-liste">${liste.map((x) => `<div class="ws-wartung dr-karte ${x.faellig ? "dringend" : ""}">
        <div class="ws-text"><strong>${esc(x.a.name)}</strong><small class="leise">${esc(x.a.text)}</small>
          ${x.neu ? `<small class="amber">Noch nicht erfasst. Tippe auf „Erledigt“, wenn du es zuletzt gemacht hast, dann zählt es ab heute.</small>`
            : `${balken(x.anteil)}<small class="leise">Zuletzt vor ${zahl(x.seitT)} Tagen${x.seitH != null ? ` und ${zahl(x.seitH)} Druckstunden` : ""} · alle ${x.a.alle_h} h oder ${x.a.alle_tage} Tage</small>`}</div>
        ${this._wsInfoKnopf("a-" + x.a.id, WS_WARTUNG_INFO[x.a.id], x.a.name)}
        <button class="knopf ${x.faellig ? "" : "leise"} klein-knopf" data-aktion="ws-erledigt" data-id="${x.a.id}">✓ Erledigt</button>
        ${this._wsInfoHtml("a-" + x.a.id, WS_WARTUNG_INFO[x.a.id], x.a.name)}</div>`).join("")}</div>
      <h3>⚙️ Verschleißteile</h3>
      <div class="ws-liste">${teile.map((t) => {
        const genutzt = h != null ? Math.max(0, h - (t.eingebaut_h || 0)) : null;
        const anteil = genutzt != null ? genutzt / t.lebensdauer_h : 0;
        return `<div class="ws-wartung dr-karte ${anteil >= 1 ? "dringend" : ""}"><div class="ws-text"><strong>${esc(t.name)}</strong>
          ${genutzt != null ? `${balken(anteil)}<small class="leise">${zahl(genutzt)} von ~${zahl(t.lebensdauer_h)} Druckstunden${t.getauscht_am ? ` · getauscht am ${new Date(t.getauscht_am).toLocaleDateString("de-DE")}` : " · seit Inbetriebnahme"}</small>` : `<small class="leise">Richtwert ~${zahl(t.lebensdauer_h)} Druckstunden</small>`}</div>
          ${this._wsInfoKnopf("t-" + t.id, WS_TEIL_INFO[t.id], t.name)}
          <button class="knopf leise klein-knopf" data-aktion="ws-getauscht" data-id="${t.id}" ${h == null ? "disabled" : ""}>Getauscht</button>
          ${this._wsInfoHtml("t-" + t.id, WS_TEIL_INFO[t.id], t.name)}</div>`;
      }).join("")}</div>`;
  },

  // Info-Knopf (i) und aufgeklapptes Info-Feld mit Zeichnung
  _wsInfoKnopf(id, info, name) {
    if (!info) return "";
    const an = this._wsZustand().info === id;
    return `<button class="ws-info-knopf ${an ? "an" : ""}" data-aktion="ws-info" data-id="${esc(id)}" aria-expanded="${an}" aria-label="Was ist das: ${esc(name)}" title="Wo sitzt das, wofür ist das?">i</button>`;
  },
  _wsInfoHtml(id, info, name) {
    if (!info || this._wsZustand().info !== id) return "";
    return `<div class="ws-info" data-ws-info="${esc(id)}" data-einmal="ws-info-${esc(id)}">
      <div class="ws-info-bild">${wsP1sMini(info.teile, `${name}: Lage im Bambu Lab P1S`)}</div>
      <div class="ws-info-text"><p><b>Was ist das?</b> ${esc(info.was)}</p><p><b>Wo?</b> ${esc(info.wo)}</p><p><b>Wofür?</b> ${esc(info.wofuer)}</p></div></div>`;
  },

  // ---- Kosten ----
  _wsKosten() {
    const monate = {};
    const drucke = [];
    for (const [uid, x] of Object.entries(this._daten.drucke || {})) {
      const g = x.gebucht;
      if (!g) continue;
      const k = g.kosten || {};
      const datum = x.start || g.am;
      const m = (datum || "").slice(0, 7);
      const eintrag = { uid, name: x.name || (x.hand && x.hand.name) || "Druck", datum, g: g.g, fil: k.filament, strom: k.strom, kwh: k.kwh, ergebnis: g.ergebnis };
      drucke.push(eintrag);
      const mo = (monate[m] = monate[m] || { fil: 0, strom: 0, kwh: 0, n: 0, g: 0, ohnePreis: 0 });
      mo.fil += k.filament || 0; mo.strom += k.strom || 0; mo.kwh += k.kwh || 0; mo.n++; mo.g += g.g || 0;
      if (k.filament == null) mo.ohnePreis++;
    }
    return { monate, drucke: drucke.sort((a, b) => (b.datum || "").localeCompare(a.datum || "")) };
  },
  _wsKostenHtml() {
    const { monate, drucke } = this._wsKosten();
    const e = this._daten.einstellungen;
    const schluessel = Object.keys(monate).sort().slice(-6);
    const max = Math.max(0.01, ...schluessel.map((k) => monate[k].fil + monate[k].strom));
    const ohnePreis = this._daten.rollen.filter((r) => !r.preis_kg).length;
    const eur = (v) => (v == null ? "–" : `${zahl(v, 2)} €`);
    return `<div class="ws-zwei">
      <div class="dr-karte"><h3 class="dr-titel">Kosten je Monat</h3>
        ${schluessel.length ? `<div class="ws-saeulen">${schluessel.map((k) => { const m = monate[k], s = m.fil + m.strom;
          return `<div class="ws-saeule" title="${m.n} Drucke · ${zahl(m.g)} g · ${zahl(m.kwh, 2)} kWh"><strong>${zahl(s, 2)} €</strong>
            <div class="ws-saeule-bahn"><span class="fil" style="height:${(m.fil / max) * 100}%"></span><span class="strom" style="height:${(m.strom / max) * 100}%"></span></div>
            <small>${WS_MONATE[Number(k.slice(5, 7)) - 1]} ${k.slice(2, 4)}</small></div>`; }).join("")}</div>
          <div class="ws-legende"><span><i class="fil"></i>Filament</span><span><i class="strom"></i>Strom</span></div>`
          : `<p class="leise">Noch keine verbuchten Drucke. Kosten entstehen beim Verbuchen nach jedem Druck.</p>`}
        ${ohnePreis ? `<div class="hinweis amber klein">${ohnePreis} Rollen haben keinen Preis, ihr Filament zählt mit 0 €. Preis eintragen: Rolle öffnen › Infos.</div>` : ""}
        ${drucke.length ? `<h3>Letzte Drucke</h3><div class="info-liste">${drucke.slice(0, 8).map((d) => `<button class="info-zeile zeilen-knopf" data-aktion="zum-druck" data-uid="${esc(d.uid)}"><span>${esc(d.name)}<small class="norm">${d.datum ? new Date(d.datum).toLocaleDateString("de-DE") : ""} · ${zahl(d.g, 1)} g${d.kwh != null ? ` · ${zahl(d.kwh, 2)} kWh` : ""}</small></span><strong>${eur((d.fil || 0) + (d.strom || 0))}</strong></button>`).join("")}</div>` : ""}
      </div>
      <div class="dr-karte"><h3 class="dr-titel">Einstellungen</h3>
        ${WS_EINSTELLUNGEN.map((f) => `<div class="mod-regler"><div class="r-kopf"><span>${esc(f.name)}</span><strong id="ws-e-${f.k}">${zahl(e[f.k], f.nk || 0)} ${f.e}</strong></div>
          <input type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${e[f.k]}" data-ws="e-${f.k}"></div>`).join("")}
        <p class="leise klein">Zusatzposten werden bei jedem Verbuchen abgezogen, das Reststück beim Rollenwechsel von der alten Rolle.</p></div></div>`;
  },

  // ---- Ereignisse ----
  _wsKlick(a, el) {
    const w = this._wsZustand(), q = this._daten.warteschlange;
    if (this._wsPjKlick(a, el)) return;
    const idx = el.dataset.id ? q.findIndex((x) => x.id === el.dataset.id) : -1;
    switch (a) {
      case "ws-tab":
        if (el.dataset.id === "projekte" && w.tab === "projekte") w.projekt = null;   // zweiter Tipp: zurück zur Übersicht
        w.tab = el.dataset.id;
        if (["bibliothek", "fehl", "projekte"].includes(w.tab)) this._wsFotos();
        break;
      case "ws-neu": this._wsAuftragNeu(); break;
      case "ws-bearbeiten": if (idx < 0) return; this._wsAuftragNeu({ ...q[idx] }); break;
      case "ws-g": { const n = w.neu; n.gewicht = Math.max(0, Math.min(1000, (n.gewicht || 0) + Number(el.dataset.d))); this._wsGewichtZeigen(); return; }
      case "ws-d": { const n = w.neu; n.dauer_min = Math.max(0, Math.min(1440, (n.dauer_min || 0) + Number(el.dataset.d))); this._wsGewichtZeigen(); return; }
      case "ws-klug": this._daten.einstellungen.schlange_klug = el.dataset.id === "an"; this._speichern(); break;
      case "ws-klug-uebernehmen": {
        this._daten.warteschlange = this._wsKlugeReihenfolge();
        this._daten.einstellungen.schlange_klug = false;
        this._speichern();
        this._toast("Klug sortierte Reihenfolge übernommen. Du kannst sie jetzt wieder von Hand ändern.");
        break;
      }
      case "ws-speichern": {
        const n = w.neu;
        n.name = (this.shadowRoot.getElementById("ws-name").value || "").trim();
        n.notiz = (this.shadowRoot.getElementById("ws-notiz").value || "").trim();
        if (!n.name) { this._toast("Bitte einen Namen eingeben."); return; }
        n.dauer_min = n.dauer_min > 0 ? n.dauer_min : null;
        if (n.id) { const i = q.findIndex((x) => x.id === n.id); if (i >= 0) q[i] = { ...q[i], ...n }; }
        else q.push({ ...n, id: `a-${Date.now().toString(36)}`, am: new Date().toISOString(), quelle: "hand" });
        w.neu = null; this._dialog = null; this._speichern();
        break;
      }
      case "ws-hoch": case "ws-runter": {
        const j = idx + (a === "ws-hoch" ? -1 : 1);
        if (idx < 0 || j < 0 || j >= q.length) return;
        [q[idx], q[j]] = [q[j], q[idx]];
        this._speichern();
        break;
      }
      case "ws-weg": {
        if (idx < 0) return;
        const [weg] = q.splice(idx, 1);
        this._wsLetzterWeg = { a: weg, i: idx };
        this._speichern();
        this._toastMitKnopf(`„${weg.name}“ entfernt.`, "Rückgängig", "ws-zurueck");
        return;
      }
      case "ws-zurueck": {
        const z = this._wsLetzterWeg;
        if (z && !q.some((x) => x.id === z.a.id)) { q.splice(Math.min(z.i, q.length), 0, z.a); this._speichern(); }
        this._wsLetzterWeg = null; this._toastText = null;
        break;
      }
      case "ws-rolle": if (idx < 0) return; q[idx].rolleId = el.dataset.rolle; this._speichern(); break;
      case "ws-aus-modell": this._wsAusModell(); return;
      case "ws-nochmal": {
        const d = this._buAlle().find((x) => x.uid === el.dataset.uid);
        if (!d) return;
        const g = this._buExtra(d.uid).gebucht;
        q.push({ id: `a-${Date.now().toString(36)}`, name: d.name, gewicht: d.gewicht, dauer_min: wsDruckDauer(d), rolleId: (g && g.rolle) || this._daten.letzte_rolle, notiz: "", am: new Date().toISOString(), quelle: "bibliothek" });
        this._speichern();
        this._toast(`„${d.name}“ steht in der Warteschlange (Platz ${q.length}).`);
        return;
      }
      case "ws-info": w.info = w.info === el.dataset.id ? null : el.dataset.id; break;
      case "ws-kopieren": this._kopieren(this._wsEinkaufText(), "Einkaufsliste kopiert."); return;
      case "ws-erledigt": {
        const h = this._drZ("stunden");
        this._daten.wartung.aufgaben = { ...(this._daten.wartung.aufgaben || {}), [el.dataset.id]: { h, am: new Date().toISOString() } };
        this._speichern();
        const t = WARTUNG_AUFGABEN.find((x) => x.id === el.dataset.id);
        this._toast(`${t ? t.name : "Wartung"} erledigt, die Zählung beginnt neu.`);
        return;
      }
      case "ws-getauscht": {
        const h = this._drZ("stunden");
        if (h == null) return;
        const teile = this._wsTeile();
        const t = teile.find((x) => x.id === el.dataset.id);
        if (!t) return;
        t.eingebaut_h = h; t.getauscht_am = new Date().toISOString();
        this._daten.wartung.teile = teile;
        this._speichern();
        this._toast(`${t.name}: Zähler steht wieder auf 0.`);
        return;
      }
      default: return;
    }
    this._zeichnen();
  },
  _wsGewichtZeigen() {
    const n = this._ws.neu;
    const d = this.shadowRoot.getElementById("ws-dauer"); if (d) d.textContent = n.dauer_min ? wsDauerText(n.dauer_min) : "unbekannt";
    const di = this.shadowRoot.querySelector('[data-ws="dauer"]'); if (di) di.value = n.dauer_min || 0;
    const s = this.shadowRoot.getElementById("ws-gewicht"); if (s) s.textContent = `${zahl(n.gewicht, 1)} g`;
    const i = this.shadowRoot.querySelector('[data-ws="gewicht"]'); if (i) i.value = n.gewicht;
  },
  _wsFotos() { if (this._drVerlauf) this._drFotosLaden(); },
  _wsEingabe(t) {
    const k = t.dataset && t.dataset.ws;
    if (!k) return false;
    const w = this._wsZustand();
    if (k === "gewicht") { w.neu.gewicht = Number(t.value); this._wsGewichtZeigen(); }
    else if (k === "dauer") { w.neu.dauer_min = Number(t.value); this._wsGewichtZeigen(); }
    else if (k === "suche") {
      // Nur Trefferzahl und Raster neu, damit das Suchfeld den Fokus behält
      w.suche = t.value;
      const tr = this._wsBibTreffer();
      const box = this.shadowRoot.getElementById("ws-bib"), zahlBox = this.shadowRoot.getElementById("ws-bib-zahl");
      if (box) box.innerHTML = this._wsBibRasterHtml(tr);
      if (zahlBox) zahlBox.innerHTML = this._wsBibZahlHtml(tr);
    } else if (k.startsWith("e-")) {
      const f = WS_EINSTELLUNGEN.find((x) => x.k === k.slice(2));
      this._daten.einstellungen[f.k] = Number(t.value);
      const s = this.shadowRoot.getElementById(`ws-e-${f.k}`); if (s) s.textContent = `${zahl(Number(t.value), f.nk || 0)} ${f.e}`;
    }
    return true;
  },
  _wsAenderung(t) {
    const k = t.dataset && t.dataset.ws;
    if (!k) return false;
    if (k === "rolle") this._ws.neu.rolleId = t.value;
    else if (k === "bib-fil" || k === "bib-zeit") { this._wsBibF()[k === "bib-fil" ? "fil" : "zeit"] = t.value; this._zeichnen(); }
    else if (k.startsWith("e-")) this._speichern();
    return true;
  },
};
