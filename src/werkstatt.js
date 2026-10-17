// ---------------------------------------------------------------------------
// Werkstatt: Warteschlange mit Bestandsprüfung, Einkaufsliste, Modell-Bibliothek,
// Fehldrucke, Wartungsplan mit Verschleißteilen, Kosten je Druck und Monat
// ---------------------------------------------------------------------------

const WS_TABS = [["schlange", "📋 Warteschlange"], ["einkauf", "🛒 Einkauf"], ["bibliothek", "📚 Bibliothek"], ["fehl", "💥 Fehldrucke"], ["wartung", "🔧 Wartung"], ["kosten", "💶 Kosten"]];
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

const WerkstattAnsicht = {
  _wsZustand() {
    if (!this._ws) this._ws = { tab: "schlange", neu: null };
    return this._ws;
  },

  _wsHtml() {
    const w = this._wsZustand();
    const zahlen = { schlange: this._daten.warteschlange.length, einkauf: this._wsEinkauf().length, wartung: this._wsWartung().filter((a) => a.faellig).length };
    const inhalt = { einkauf: () => this._wsEinkaufHtml(), bibliothek: () => this._wsBibliothekHtml(), fehl: () => this._wsFehlHtml(), wartung: () => this._wsWartungHtml(), kosten: () => this._wsKostenHtml() }[w.tab] || (() => this._wsSchlangeHtml());
    return `<div class="ws-seite">
      <div class="chips unter-tabs" role="tablist">${WS_TABS.map(([id, n]) => `<button class="chip ${w.tab === id ? "an" : ""}" data-aktion="ws-tab" data-id="${id}">${n}${zahlen[id] ? ` <span class="zahl-punkt ${id === "wartung" ? "amber-punkt" : ""}">${zahlen[id]}</span>` : ""}</button>`).join("")}</div>
      <div class="ws-inhalt wechsel-rein" data-einmal="ws-${w.tab}">${inhalt()}</div></div>`;
  },

  // ---- Warteschlange ----
  _wsBestand() {
    // Aufträge der Reihe nach von den Rollen abziehen: späterer Auftrag sieht, was übrig bleibt
    const e = this._daten.einstellungen, rest = {};
    return this._daten.warteschlange.map((a) => {
      const r = this._daten.rollen.find((x) => x.id === a.rolleId);
      const bedarf = (a.gewicht || 0) * this._korrektur(r).faktor + e.linie_g + e.extruder_g;
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
  _wsSchlangeHtml() {
    const liste = this._wsBestand();
    const text = { ok: ["✓ reicht", "mint"], knapp: ["knapp", "amber"], fehlt: ["reicht nicht", "rot"], ungewogen: ["Rolle nicht gewogen", "amber"], unbekannt: ["Gewicht unbekannt", "leise"], ohne: ["keine Rolle gewählt", "amber"] };
    return `<div class="ws-kopfzeile"><p class="leise">Was als Nächstes gedruckt wird. Die Bestandsprüfung rechnet die Aufträge der Reihe nach von den Rollen ab.</p>
      <button class="knopf" data-aktion="ws-neu">＋ Auftrag</button></div>
      ${!liste.length ? `<div class="leer-karte dr-karte"><span class="gross-icon">📋</span><strong>Die Warteschlange ist leer</strong>
        <span class="leise">Füge Aufträge hier hinzu, aus dem 3D-Modell-Viewer oder mit „Nochmal drucken“ in der Bibliothek.</span></div>` : ""}
      <div class="ws-liste">${liste.map((x, i) => {
        const [st, farbe] = text[x.stufe];
        return `<div class="ws-auftrag dr-karte" data-einmal="ws-a-${esc(x.a.id)}">
          <div class="ws-nr">${i + 1}</div>
          <div class="ws-text"><strong>${esc(x.a.name)}</strong>
            <small class="leise">${x.a.gewicht ? `${zahl(x.a.gewicht, 1)} g` : "Gewicht unbekannt"}${x.a.zeit ? ` · ${esc(x.a.zeit)}` : ""}${x.r ? ` · ${esc(x.r.name)}` : ""}${x.r && x.a.gewicht ? (() => { const p = this._preisProGramm(x.r); return ` · ≈ ${zahl(x.bedarf * p.wert, 2)} €${this._voreingestelltHtml(p)}`; })() : ""}</small>
            <span class="pille ${farbe}">${st}${x.vorher != null && x.a.gewicht ? (x.danach < 0 ? ` · es fehlen ${zahl(-x.danach)} g` : ` · danach ${zahl(x.danach)} g`) : ""}</span>
            ${x.ersatz && x.ersatz.length ? `<div class="chips ws-ersatz"><span class="leise klein">Reicht stattdessen:</span>${x.ersatz.map((r) => `<button class="chip" data-aktion="ws-rolle" data-id="${esc(x.a.id)}" data-rolle="${esc(r.id)}">${esc(r.name)} · ${zahl(r.rest_g)} g</button>`).join("")}</div>` : ""}
            ${x.a.notiz ? `<small class="leise">📝 ${esc(x.a.notiz)}</small>` : ""}</div>
          <div class="ws-knoepfe">
            <button class="rund" data-aktion="ws-hoch" data-id="${esc(x.a.id)}" ${i === 0 ? "disabled" : ""} aria-label="Nach oben">↑</button>
            <button class="rund" data-aktion="ws-runter" data-id="${esc(x.a.id)}" ${i === liste.length - 1 ? "disabled" : ""} aria-label="Nach unten">↓</button>
            <button class="rund" data-aktion="ws-bearbeiten" data-id="${esc(x.a.id)}" aria-label="Bearbeiten">✎</button>
            <button class="rund" data-aktion="ws-weg" data-id="${esc(x.a.id)}" aria-label="Entfernen">✓</button>
          </div></div>`;
      }).join("")}</div>`;
  },
  _wsAuftragNeu(werte) {
    const voll = this._daten.rollen.filter((r) => r.rest_g != null).sort((a, b) => b.rest_g - a.rest_g)[0] || this._daten.rollen[0] || {};
    this._wsZustand().neu = { id: null, name: "", gewicht: 20, rolleId: this._daten.letzte_rolle || voll.id, notiz: "", ...werte };
    this._dialog = "ws-auftrag";
  },
  _wsAuftragDialogHtml() {
    const n = this._ws.neu;
    const rollen = this._daten.rollen.slice().sort((a, b) => a.name.localeCompare(b.name, "de"));
    return `<h2>${n.id ? "Auftrag bearbeiten" : "Neuer Auftrag"}</h2>
      <label class="feld"><span>Was wird gedruckt?</span><input id="ws-name" value="${esc(n.name)}" placeholder="z. B. Kabelhalter" maxlength="80"></label>
      <div class="mod-regler"><div class="r-kopf"><span>Filament</span><strong id="ws-gewicht">${zahl(n.gewicht, 1)} g</strong></div>
        <div class="regler-zeile"><button class="rund" data-aktion="ws-g" data-d="-5">−5</button><input type="range" min="0" max="1000" step="0.5" value="${n.gewicht}" data-ws="gewicht"><button class="rund" data-aktion="ws-g" data-d="5">+5</button></div></div>
      <label class="auswahl breit-auswahl"><span>Rolle</span><select data-ws="rolle">${rollen.map((r) => `<option value="${esc(r.id)}" ${r.id === n.rolleId ? "selected" : ""}>${esc(r.name)} · ${esc(r.hersteller)}${r.rest_g != null ? ` · ${zahl(r.rest_g)} g` : ""}</option>`).join("")}</select></label>
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
    this._daten.warteschlange.push({ id: `a-${Date.now().toString(36)}`, name: m.name.replace(/\.(gcode\.3mf|gcode|3mf|stl)$/i, ""), gewicht: g ? Math.round(g * 10) / 10 : null,
      zeit: m.art === "gcode" ? m.gcode.info.zeit || null : null, rolleId: m.rolleId, notiz: "", am: new Date().toISOString(), quelle: m.art });
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
      if (wenigBestand(t) || (t.menge === 0)) liste.push({ art: "teil", titel: teilName(t), text: `${t.menge} Stk${t.min ? `, Mindestbestand ${t.min}` : ""}`, id: t.id, dringend: t.menge === 0, icon: kategorie(t.kat).icon });
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
  _wsModelle() {
    const gruppen = new Map();
    for (const d of this._buAlle()) {
      if (d.status === "laeuft") continue;
      const k = modellSchluessel(d.name);
      const x = this._buExtra(d.uid);
      const g = gruppen.get(k) || { name: d.name, drucke: [], ok: 0, fehl: 0 };
      g.drucke.push(d);
      const erg = x.gebucht ? x.gebucht.ergebnis : d.status === "finish" ? "ok" : null;
      if (erg === "ok") g.ok++; else if (erg === "fehl") g.fehl++;
      if (!g.rolle && x.gebucht) g.rolle = x.gebucht.rolle;
      gruppen.set(k, g);
    }
    return [...gruppen.values()].sort((a, b) => (b.drucke[0].start || "").localeCompare(a.drucke[0].start || ""));
  },
  _wsBibliothekHtml() {
    const modelle = this._wsModelle();
    const q = this._ws.suche || "";
    const zeige = q ? modelle.filter((m) => suchPunkte(q, m.name)) : modelle;
    return `<div class="ws-kopfzeile"><input class="such-feld" data-ws="suche" value="${esc(q)}" placeholder="Modell suchen …" aria-label="Modell suchen"></div>
      ${!modelle.length ? `<div class="leer-karte dr-karte"><span class="gross-icon">📚</span><strong>Noch keine Modelle</strong><span class="leise">Jeder Druck aus dem Druckverlauf landet hier, gleiche Modelle werden zusammengefasst.</span></div>` : ""}
      <div class="ws-raster" id="ws-bib">${zeige.map((m) => this._wsModellKarte(m)).join("") || (modelle.length ? `<p class="leise">Kein Modell passt zu „${esc(q)}“.</p>` : "")}</div>`;
  },
  _wsModellKarte(m) {
    const d = m.drucke[0], f = fotoName(d), foto = f && this._drFotos && this._drFotos[f];
    const r = this._daten.rollen.find((x) => x.id === m.rolle);
    const quote = m.ok + m.fehl ? Math.round((m.ok / (m.ok + m.fehl)) * 100) : null;
    return `<div class="ws-modell dr-karte">
      <div class="ws-foto" data-foto="${esc(f || "")}">${foto ? `<img src="${esc(foto)}" alt="" loading="lazy">` : `<span>🧊</span>`}</div>
      <div class="ws-modell-text"><strong title="${esc(m.name)}">${esc(m.name)}</strong>
        <small class="leise">${m.drucke.length}× gedruckt · zuletzt ${esc(d.zeit || "–")}</small>
        <small class="leise">${d.gewicht != null ? `${zahl(d.gewicht, 1)} g` : "–"}${r ? ` · ${esc(r.name)}` : ""}${quote != null ? ` · ${quote} % geglückt` : ""}</small></div>
      <div class="ws-modell-knoepfe"><button class="knopf klein-knopf" data-aktion="ws-nochmal" data-uid="${esc(d.uid)}">↻ Nochmal drucken</button>
        <button class="mini" data-aktion="zum-druck" data-uid="${esc(d.uid)}">Details</button></div></div>`;
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
          <div class="ws-modell-knoepfe"><button class="mini" data-aktion="zum-druck" data-uid="${esc(d.uid)}">Details</button></div></div>`;
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
      // Ältere Buchungen ohne Preis: mit dem heutigen (ggf. voreingestellten) Preis der Rolle nachrechnen
      let fil = k.filament, vor = !!k.voreingestellt;
      if (fil == null) { const p = this._preisProGramm(this._daten.rollen.find((r) => r.id === g.rolle)); fil = (g.g || 0) * p.wert; vor = p.voreingestellt; }
      const eintrag = { uid, name: x.name || (x.hand && x.hand.name) || "Druck", datum, g: g.g, fil, vor, strom: k.strom, kwh: k.kwh, ergebnis: g.ergebnis };
      drucke.push(eintrag);
      const mo = (monate[m] = monate[m] || { fil: 0, strom: 0, kwh: 0, n: 0, g: 0, ohnePreis: 0 });
      mo.fil += fil || 0; mo.strom += k.strom || 0; mo.kwh += k.kwh || 0; mo.n++; mo.g += g.g || 0;
      if (vor) mo.ohnePreis++;
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
        ${ohnePreis ? `<div class="hinweis klein">${ohnePreis} Rollen haben keinen eigenen Preis, ihr Filament zählt mit ${zahl(PREIS_STANDARD_ROLLE, 2)} € je Rolle <span class="voreingestellt">voreingestellt</span>. Preis eintragen: Rolle öffnen › Infos.</div>` : ""}
        ${drucke.length ? `<h3>Letzte Drucke</h3><div class="info-liste">${drucke.slice(0, 8).map((d) => `<button class="info-zeile zeilen-knopf" data-aktion="zum-druck" data-uid="${esc(d.uid)}"><span>${esc(d.name)}<small class="norm">${d.datum ? new Date(d.datum).toLocaleDateString("de-DE") : ""} · ${zahl(d.g, 1)} g${d.kwh != null ? ` · ${zahl(d.kwh, 2)} kWh` : ""}</small></span><strong>${eur((d.fil || 0) + (d.strom || 0))}${d.vor ? this._voreingestelltHtml({ voreingestellt: true }) : ""}</strong></button>`).join("")}</div>` : ""}
      </div>
      <div class="dr-karte"><h3 class="dr-titel">Einstellungen</h3>
        ${WS_EINSTELLUNGEN.map((f) => `<div class="mod-regler"><div class="r-kopf"><span>${esc(f.name)}</span><strong id="ws-e-${f.k}">${zahl(e[f.k], f.nk || 0)} ${f.e}</strong></div>
          <input type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${e[f.k]}" data-ws="e-${f.k}"></div>`).join("")}
        <p class="leise klein">Zusatzposten werden bei jedem Verbuchen abgezogen, das Reststück beim Rollenwechsel von der alten Rolle.</p></div></div>`;
  },

  // ---- Ereignisse ----
  _wsKlick(a, el) {
    const w = this._wsZustand(), q = this._daten.warteschlange;
    const idx = el.dataset.id ? q.findIndex((x) => x.id === el.dataset.id) : -1;
    switch (a) {
      case "ws-tab": w.tab = el.dataset.id; if (w.tab === "bibliothek" || w.tab === "fehl") this._wsFotos(); break;
      case "ws-neu": this._wsAuftragNeu(); break;
      case "ws-bearbeiten": if (idx < 0) return; this._wsAuftragNeu({ ...q[idx] }); break;
      case "ws-g": { const n = w.neu; n.gewicht = Math.max(0, Math.min(1000, (n.gewicht || 0) + Number(el.dataset.d))); this._wsGewichtZeigen(); return; }
      case "ws-speichern": {
        const n = w.neu;
        n.name = (this.shadowRoot.getElementById("ws-name").value || "").trim();
        n.notiz = (this.shadowRoot.getElementById("ws-notiz").value || "").trim();
        if (!n.name) { this._toast("Bitte einen Namen eingeben."); return; }
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
        q.push({ id: `a-${Date.now().toString(36)}`, name: d.name, gewicht: d.gewicht, rolleId: (g && g.rolle) || this._daten.letzte_rolle, notiz: "", am: new Date().toISOString(), quelle: "bibliothek" });
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
    const s = this.shadowRoot.getElementById("ws-gewicht"); if (s) s.textContent = `${zahl(n.gewicht, 1)} g`;
    const i = this.shadowRoot.querySelector('[data-ws="gewicht"]'); if (i) i.value = n.gewicht;
  },
  _wsFotos() { if (this._drVerlauf) this._drFotosLaden(); },
  _wsEingabe(t) {
    const k = t.dataset && t.dataset.ws;
    if (!k) return false;
    const w = this._wsZustand();
    if (k === "gewicht") { w.neu.gewicht = Number(t.value); this._wsGewichtZeigen(); }
    else if (k === "suche") {
      w.suche = t.value;
      const box = this.shadowRoot.getElementById("ws-bib");
      const m = this._wsModelle(), zeige = w.suche ? m.filter((x) => suchPunkte(w.suche, x.name)) : m;
      if (box) box.innerHTML = zeige.map((x) => this._wsModellKarte(x)).join("") || `<p class="leise">Kein Modell passt zu „${esc(w.suche)}“.</p>`;
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
    else if (k.startsWith("e-")) this._speichern();
    return true;
  },
};
