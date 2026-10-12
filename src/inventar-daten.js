// ---------------------------------------------------------------------------
// Inventar: Kategorien, Maße und Corins Startbestand
// (aus federn.csv, gewindeeinsaetze.csv, schrauben.csv, duesen.csv und dem
// Blatt „Zubehör“ der Filament-Tabelle, Stand 12.10.2026)
// ---------------------------------------------------------------------------

const GEWINDE = ["M2", "M2.5", "M3", "M4", "M5", "M6"];

// Normmaße (Zylinderkopf DIN 912 / ISO 4762 mit Innensechskant-SW, Mutter DIN 934, Scheibe DIN 125,
// Durchgangsloch DIN EN 20273 mittel, Senkung DIN 974-1 für Zylinderschrauben)
const NORM = {
  M2: { kopf_d: 3.8, kopf_h: 2, inbus: 1.5, loch: 2.4, senk_d: 4.4, mutter_sw: 4, mutter_h: 1.6, scheibe_d: 5, scheibe_h: 0.3 },
  "M2.5": { kopf_d: 4.5, kopf_h: 2.5, inbus: 2, loch: 2.9, senk_d: 5.5, mutter_sw: 5, mutter_h: 2, scheibe_d: 6, scheibe_h: 0.5 },
  M3: { kopf_d: 5.5, kopf_h: 3, inbus: 2.5, loch: 3.4, senk_d: 6.5, mutter_sw: 5.5, mutter_h: 2.4, scheibe_d: 7, scheibe_h: 0.5 },
  M4: { kopf_d: 7, kopf_h: 4, inbus: 3, loch: 4.5, senk_d: 8, mutter_sw: 7, mutter_h: 3.2, scheibe_d: 9, scheibe_h: 0.8 },
  M5: { kopf_d: 8.5, kopf_h: 5, inbus: 4, loch: 5.5, senk_d: 10, mutter_sw: 8, mutter_h: 4, scheibe_d: 10, scheibe_h: 1 },
  M6: { kopf_d: 10, kopf_h: 6, inbus: 5, loch: 6.6, senk_d: 11, mutter_sw: 10, mutter_h: 5, scheibe_d: 12, scheibe_h: 1.6 },
};
const gewindeD = (g) => parseFloat(String(g || "M3").slice(1)) || 3;

// Felder je Kategorie. Zahlenwerte werden mit Reglern geändert.
const MASS = {
  laenge: { name: "Länge", e: "mm", min: 1, max: 60, step: 1 },
  aussen: { name: "Außendurchmesser", e: "mm", min: 1, max: 30, step: 0.1, nk: 1 },
  draht: { name: "Drahtstärke", e: "mm", min: 0.1, max: 2, step: 0.1, nk: 1 },
  groesse: { name: "Düsengröße", e: "mm", min: 0.2, max: 1, step: 0.2, nk: 1 },
  durchmesser: { name: "Durchmesser", e: "mm", min: 1, max: 30, step: 0.01, nk: 2 },
  breite: { name: "Breite", e: "mm", min: 1, max: 50, step: 0.01, nk: 2 },
  dicke: { name: "Dicke", e: "mm", min: 0.1, max: 10, step: 0.01, nk: 2 },
};

const KATEGORIEN = [
  { id: "schraube", name: "Schrauben", einzahl: "Schraube", icon: "🔩", gewinde: true, masse: ["laenge"],
    worte: "schraube schrauben zylinderkopf inbus innensechskant bolt screw" },
  { id: "mutter", name: "Muttern", einzahl: "Mutter", icon: "⬡", gewinde: true, masse: [],
    worte: "mutter muttern sechskant nut" },
  { id: "scheibe", name: "Unterlegscheiben", einzahl: "Unterlegscheibe", icon: "◯", gewinde: true, masse: [],
    worte: "scheibe scheiben unterlegscheibe beilagscheibe washer" },
  { id: "einsatz", name: "Gewindeeinsätze", einzahl: "Gewindeeinsatz", icon: "🟡", gewinde: true, masse: ["laenge", "aussen"],
    worte: "einsatz einsätze gewindeeinsatz einschmelzgewinde einschmelzmutter rändelmutter insert heat messing" },
  { id: "feder", name: "Federn", einzahl: "Feder", icon: "🌀", gewinde: false, masse: ["draht", "aussen", "laenge"],
    worte: "feder federn druckfeder spring edelstahl" },
  { id: "duese", name: "Düsen", einzahl: "Düse", icon: "🔻", gewinde: false, masse: ["groesse"],
    worte: "düse düsen duese nozzle hotend" },
  { id: "magnet", name: "Magnete", einzahl: "Magnet", icon: "🧲", gewinde: false, masse: ["durchmesser", "breite", "dicke"],
    worte: "magnet magnete neodym magnetfolie" },
];
const kategorie = (id) => KATEGORIEN.find((k) => k.id === id) || KATEGORIEN[0];

function standardInventar() {
  const liste = [];
  const add = (x) => liste.push({ gezaehlt: false, min: null, notiz: "", ...x });
  // Schrauben, Muttern, Scheiben (1080er Set)
  [["M2", [4, 6, 8, 12, 16, 20], 30], ["M3", [4, 8, 12, 16, 20, 30], 20], ["M4", [6, 10, 14, 18, 20, 30], 10]].forEach(([g, laengen, n]) =>
    laengen.forEach((l) => add({ id: `schraube-${g}-${l}`, kat: "schraube", gewinde: g, laenge: l, kopf: "Zylinderkopf Innensechskant", menge: n, quelle: "1080er Set" })));
  [["M2", 180], ["M3", 120], ["M4", 60]].forEach(([g, n]) => {
    add({ id: `mutter-${g}`, kat: "mutter", gewinde: g, menge: n, quelle: "1080er Set" });
    add({ id: `scheibe-${g}`, kat: "scheibe", gewinde: g, menge: n, quelle: "1080er Set" });
  });
  // Gewindeeinsätze (HUI JI, je 50 Stück)
  [["M2", 3, 3.2, 1.65], ["M2", 3, 3.5, 1.69], ["M2", 3, 4.0, 1.69], ["M3", 5, 5.0, 2.25], ["M4", 5, 6.0, 2.49], ["M5", 5, 7.0, 2.69], ["M6", 5, 9.0, 4.59]].forEach(([g, l, d, preis]) =>
    add({ id: `einsatz-${g}-${l}-${d}`, kat: "einsatz", gewinde: g, laenge: l, aussen: d, material: "Messing", menge: 50, preis, shop: "HUI JI Official Store", quelle: "Bestellung" }));
  // Federn (Sortimentsbox, Edelstahl 304, je 16 Stück)
  [[0.5, 6, 1], [0.4, 5, 2], [0.3, 4, 3]].forEach(([draht, d, reihe]) =>
    [10, 15, 20, 25, 30].forEach((l, i) =>
      add({ id: `feder-${draht}-${d}-${l}`, kat: "feder", draht, aussen: d, laenge: l, material: "Edelstahl 304", menge: 16, fach: `R${reihe}F${i + 1}`, quelle: "Sortimentsbox" })));
  // Düsen für den P1S
  [[0.2, 1], [0.4, 2], [0.6, 1]].forEach(([g, n]) => add({ id: `duese-${g}`, kat: "duese", groesse: g, menge: n, gezaehlt: true, drucker: "Bambu Lab P1S", material: "" }));
  // Magnete (Menge noch nicht erfasst)
  add({ id: "magnet-10-1.54", kat: "magnet", form: "rund", durchmesser: 10, dicke: 1.54, menge: null });
  add({ id: "magnet-3-0.94", kat: "magnet", form: "rund", durchmesser: 3, dicke: 0.94, menge: null });
  add({ id: "magnet-5-0.95", kat: "magnet", form: "rund", durchmesser: 5, dicke: 0.95, menge: null });
  add({ id: "magnet-3.97x5", kat: "magnet", form: "quader", durchmesser: 3.97, breite: 5, dicke: 1.94, menge: null, notiz: "Maße aus der Tabelle: 3,97 × 5" });
  add({ id: "magnet-3.97x9.95", kat: "magnet", form: "quader", durchmesser: 3.97, breite: 9.95, dicke: 1.96, menge: null, notiz: "Maße aus der Tabelle: 3,97 × 9,95" });
  add({ id: "magnetfolie-a4", kat: "magnet", form: "folie", breite: 297, durchmesser: 210, dicke: 0.68, menge: null, name: "Magnetfolie DIN A4" });
  return liste;
}

function teilName(t) {
  const z = (v, nk = 2) => Number(v).toLocaleString("de-DE", { maximumFractionDigits: nk });
  switch (t.kat) {
    case "schraube": return `${t.gewinde} × ${z(t.laenge)}`;
    case "mutter": return `Mutter ${t.gewinde}`;
    case "scheibe": return `Scheibe ${t.gewinde}`;
    case "einsatz": return `${t.gewinde} · ${z(t.laenge)} mm`;
    case "feder": return `Ø ${z(t.aussen)} × ${z(t.laenge)} mm`;
    case "duese": return `${z(t.groesse, 1)} mm Düse`;
    case "magnet":
      if (t.name) return t.name;
      return t.form === "rund" ? `Ø ${z(t.durchmesser)} × ${z(t.dicke)} mm` : `${z(t.durchmesser)} × ${z(t.breite)} × ${z(t.dicke)} mm`;
    default: return t.name || "Teil";
  }
}

function teilUntertitel(t) {
  const z = (v) => Number(v).toLocaleString("de-DE", { maximumFractionDigits: 2 });
  switch (t.kat) {
    case "schraube": return t.kopf || "Schraube";
    case "mutter": return "Sechskantmutter";
    case "scheibe": return "Unterlegscheibe";
    case "einsatz": return `Ø außen ${z(t.aussen)} mm · ${t.material || "Messing"}`;
    case "feder": return `Draht ${z(t.draht)} mm${t.fach ? ` · Fach ${t.fach}` : ""}`;
    case "duese": return `${t.material || "Material unbekannt"} · ${t.drucker || "P1S"}`;
    case "magnet": return t.form === "folie" ? `Dicke ${z(t.dicke)} mm` : t.form === "rund" ? "Scheibenmagnet" : "Quadermagnet";
    default: return "";
  }
}

// Unscharfe Suche: jedes Suchwort muss passen (Teilwort, Zahl oder ein Tippfehler Abstand)
function abstand(a, b) {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function suchWorte(q) {
  return q.toLowerCase().replace(/,/g, ".").replace(/ø/g, " ").replace(/(\d)\s*[x×*]\s*(\d)/g, "$1 $2").replace(/(m\d(?:\.\d)?)(?=\d|x|×)/g, "$1 ")
    .split(/[\s×]+/).map((w) => w.replace(/^x$/, "")).filter(Boolean);
}
function teilText(t) {
  const k = kategorie(t.kat);
  const zahlen = ["laenge", "aussen", "draht", "groesse", "durchmesser", "breite", "dicke"].filter((m) => t[m] != null).map((m) => String(t[m]));
  return { text: `${k.worte} ${teilName(t)} ${teilUntertitel(t)} ${t.gewinde || ""} ${t.fach || ""} ${t.notiz || ""}`.toLowerCase().replace(/,/g, "."), zahlen };
}
function passtZurSuche(t, worte) {
  if (!worte.length) return true;
  const { text, zahlen } = teilText(t);
  const woerter = text.split(/[^a-z0-9äöüß.]+/).filter(Boolean);
  return worte.every((w) => {
    if (/^\d+(\.\d+)?$/.test(w)) return zahlen.some((z) => Number(z) === Number(w));
    if (text.includes(w)) return true;
    return w.length >= 4 && woerter.some((x) => x.length >= 4 && abstand(w, x) <= 1);
  });
}
