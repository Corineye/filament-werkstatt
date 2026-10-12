// Filament-Werkstatt – automatisch aus src/ gebaut (sh build.sh). Nicht direkt bearbeiten.
// ---------------------------------------------------------------------------
// Startdaten: Corins Rollen aus Filament_Settings.xlsx (Stand 12.10.2026)
// „eigen“ = Werte, die Corin selbst eingetragen hat.
// „vorschlag“ = Richtwerte für alles, was noch fehlt. Sie werden in der
// Oberfläche anders eingefärbt, bis Corin sie übernimmt oder ändert.
// ---------------------------------------------------------------------------

const DATEN_VERSION = 3;

// Leergewicht der Spulen in Gramm (Blatt „Tabelle2“)
// Ändert sich das Gewicht einer Spule, gilt es für alle Rollen, die diese Spule nutzen.
const SPULEN = [
  { id: "deeplee", name: "Deeplee", hersteller: "Deeplee", g: 142 },
  { id: "bambu", name: "Bambu Original", hersteller: "Bambulab", g: 250 },
  { id: "bambu_nachdruck", name: "Bambu Nachdruck", hersteller: "Bambulab", g: 235 },
  { id: "lvvj3d", name: "LVVJ3D", hersteller: "LVVJ3D", g: 77 },
];

// Druckplatten in Bambu Studio
const PLATTEN = [
  "Cool Plate/PLA Plate",
  "Engineering Plate",
  "Smooth PEI Plate / High Temp Plate",
  "Textured PEI Plate",
  "Bambu Cool Plate SuperTack",
];

// Arten je Material (für Filter und „Filament hinzufügen“)
const ARTEN = {
  PLA: ["Basic", "Matte", "Silk", "Wood", "PLA+", "Transparent", "Carbon"],
  PETG: ["Basic", "HF", "Rapid", "Transparent", "Carbon"],
  ASA: ["Basic", "Carbon"],
  TPU: ["95A", "85A"],
  ABS: ["Basic"],
  PC: ["Basic"],
};

// Dichte in g/cm³, daraus Gramm pro Meter bei 1,75 mm
const MATERIAL = {
  PLA: { dichte: 1.24, farbe: "#3ee6a8" },
  PETG: { dichte: 1.27, farbe: "#5cc8ff" },
  ASA: { dichte: 1.07, farbe: "#ffb057" },
  TPU: { dichte: 1.21, farbe: "#c58bff" },
  ABS: { dichte: 1.04, farbe: "#ff8a7a" },
  PC: { dichte: 1.2, farbe: "#9aa7ff" },
};
const MATERIAL_UNBEKANNT = { dichte: 1.2, farbe: "#b8c4bf" };
const materialInfo = (m) => MATERIAL[m] || MATERIAL_UNBEKANNT;
const QUERSCHNITT_CM2 = Math.PI * 0.0875 * 0.0875;
const grammProMeter = (material) =>
  QUERSCHNITT_CM2 * 100 * (materialInfo(material).dichte);

// Einstellungsfelder: Gruppe, Bezeichnung, Einheit, Reglerbereich
const GRUPPEN = [
  { id: "temp", name: "Temperaturen", icon: "🌡️" },
  { id: "luefter", name: "Lüfter", icon: "🌀" },
  { id: "tempo", name: "Geschwindigkeiten", icon: "⚡" },
  { id: "fluss", name: "Fluss & Kalibrierung", icon: "💧" },
  { id: "trocknen", name: "Trocknen", icon: "♨️" },
];
const FELDER = [
  { k: "duese_erste", g: "temp", name: "Düse erste Schicht", e: "°C", min: 170, max: 300, step: 1 },
  { k: "duese", g: "temp", name: "Düse weitere Schichten", e: "°C", min: 170, max: 300, step: 1 },
  { k: "bett", g: "temp", name: "Druckbett", e: "°C", min: 0, max: 110, step: 1 },
  { k: "luefter_min", g: "luefter", name: "Bauteillüfter min.", e: "%", min: 0, max: 100, step: 5 },
  { k: "luefter_max", g: "luefter", name: "Bauteillüfter max.", e: "%", min: 0, max: 100, step: 5 },
  { k: "v_erste", g: "tempo", name: "Erste Schicht", e: "mm/s", min: 10, max: 150, step: 5 },
  { k: "v_aussen", g: "tempo", name: "Außenwand", e: "mm/s", min: 10, max: 500, step: 5 },
  { k: "v_innen", g: "tempo", name: "Innenwand", e: "mm/s", min: 10, max: 600, step: 5 },
  { k: "v_fuellung", g: "tempo", name: "Füllung", e: "mm/s", min: 10, max: 600, step: 5 },
  { k: "v_massiv", g: "tempo", name: "Massive Füllung", e: "mm/s", min: 10, max: 600, step: 5 },
  { k: "v_oben", g: "tempo", name: "Oberfläche", e: "mm/s", min: 10, max: 500, step: 5 },
  { k: "flow", g: "fluss", name: "Flow Ratio", e: "", min: 0.8, max: 1.1, step: 0.001, nk: 3 },
  { k: "max_vol", g: "fluss", name: "Max. Volumenstrom", e: "mm³/s", min: 1, max: 40, step: 0.5, nk: 1 },
  { k: "k", g: "fluss", name: "K-Faktor (Pressure Advance)", e: "", min: 0, max: 0.1, step: 0.001, nk: 3 },
  { k: "tr_temp", g: "trocknen", name: "Temperatur", e: "°C", min: 35, max: 90, step: 5 },
  { k: "tr_dauer", g: "trocknen", name: "Dauer", e: "h", min: 1, max: 24, step: 0.5, nk: 1 },
  { k: "tr_feuchte", g: "trocknen", name: "Ziel: relative Feuchte unter", e: "%", min: 5, max: 40, step: 1 },
];

// Richtwerte je Materialart (Bambu-Standardgeschwindigkeiten, 0,4-mm-Düse)
const TEMPO_STANDARD = { v_erste: 50, v_aussen: 200, v_innen: 300, v_fuellung: 270, v_massiv: 250, v_oben: 200 };
const TROCKNEN = {
  PLA: { tr_temp: 50, tr_dauer: 6, tr_feuchte: 15 },
  PETG: { tr_temp: 65, tr_dauer: 6, tr_feuchte: 15 },
  ASA: { tr_temp: 70, tr_dauer: 6, tr_feuchte: 10 },
  TPU: { tr_temp: 55, tr_dauer: 8, tr_feuchte: 10 },
  ABS: { tr_temp: 70, tr_dauer: 4, tr_feuchte: 10 },
  PC: { tr_temp: 70, tr_dauer: 8, tr_feuchte: 10 },
};
const PLATTE_STANDARD = "Textured PEI Plate";
const RICHTWERTE = {
  pla: { duese_erste: 220, duese: 220, bett: 55, luefter_min: 80, luefter_max: 100, ...TEMPO_STANDARD, flow: 0.98, max_vol: 15, k: 0.02 },
  pla_matte: { duese_erste: 220, duese: 220, bett: 55, luefter_min: 80, luefter_max: 100, ...TEMPO_STANDARD, flow: 0.98, max_vol: 20, k: 0.02 },
  pla_silk: { duese_erste: 225, duese: 225, bett: 55, luefter_min: 80, luefter_max: 100, ...TEMPO_STANDARD, v_aussen: 100, v_oben: 120, flow: 0.98, max_vol: 12, k: 0.02 },
  pla_transparent: { duese_erste: 215, duese: 215, bett: 55, luefter_min: 80, luefter_max: 100, ...TEMPO_STANDARD, v_aussen: 60, v_oben: 80, flow: 0.98, max_vol: 10, k: 0.02 },
  petg: { duese_erste: 240, duese: 245, bett: 70, luefter_min: 20, luefter_max: 50, ...TEMPO_STANDARD, flow: 0.95, max_vol: 12, k: 0.04 },
  petg_hf: { duese_erste: 245, duese: 250, bett: 70, luefter_min: 30, luefter_max: 70, ...TEMPO_STANDARD, flow: 0.95, max_vol: 20, k: 0.04 },
  pla_wood: { duese_erste: 215, duese: 225, bett: 55, luefter_min: 80, luefter_max: 100, v_erste: 30, v_aussen: 60, v_innen: 80, v_fuellung: 100, v_massiv: 80, v_oben: 50, flow: 0.98, max_vol: 10, k: 0.02 },
  asa: { duese_erste: 265, duese: 265, bett: 100, luefter_min: 10, luefter_max: 30, ...TEMPO_STANDARD, flow: 0.95, max_vol: 12, k: 0.03 },
  abs: { duese_erste: 255, duese: 260, bett: 100, luefter_min: 10, luefter_max: 30, ...TEMPO_STANDARD, flow: 0.95, max_vol: 16, k: 0.03 },
  pc: { duese_erste: 270, duese: 270, bett: 110, luefter_min: 0, luefter_max: 30, ...TEMPO_STANDARD, flow: 0.95, max_vol: 12, k: 0.03 },
  tpu: { duese_erste: 225, duese: 225, bett: 35, luefter_min: 70, luefter_max: 100, v_erste: 20, v_aussen: 30, v_innen: 35, v_fuellung: 40, v_massiv: 35, v_oben: 30, flow: 1.0, max_vol: 3.5, k: 0 },
};

// Passende Richtwerte für Material + Art, inklusive Trocknen und Druckplatte
function richtwerteFuer(material, art) {
  const a = (art || "").toLowerCase();
  let basis = RICHTWERTE.pla;
  if (material === "PLA") {
    basis = a === "matte" ? RICHTWERTE.pla_matte : a === "silk" ? RICHTWERTE.pla_silk
      : a === "transparent" ? RICHTWERTE.pla_transparent : a === "wood" ? RICHTWERTE.pla_wood : RICHTWERTE.pla;
  } else if (material === "PETG") {
    basis = a === "hf" || a === "rapid" ? RICHTWERTE.petg_hf : RICHTWERTE.petg;
  } else if (material === "ASA") basis = RICHTWERTE.asa;
  else if (material === "TPU") basis = RICHTWERTE.tpu;
  else if (material === "ABS") basis = RICHTWERTE.abs;
  else if (material === "PC") basis = RICHTWERTE.pc;
  const tr = { ...(TROCKNEN[material] || TROCKNEN.PLA) };
  if (a === "wood") tr.tr_temp = 45;
  return { ...basis, ...tr, platte: PLATTE_STANDARD };
}

// Gibt es eigene Richtwerte für dieses Material? Sonst stammen die Vorschläge von PLA.
const kenntMaterial = (m) => ["PLA", "PETG", "ASA", "TPU", "ABS", "PC"].includes(m);

// Getestete Werte, die für Schwesterrollen gleicher Serie als Vorschlag dienen
const DEEPLEE_PLUS = { ...RICHTWERTE.pla, v_erste: 30, v_aussen: 65, v_innen: 150, v_fuellung: 180, v_massiv: 180 };
const ELEGOO_RAPID = { ...RICHTWERTE.petg, duese_erste: 245, duese: 250, bett: 70, luefter_min: 65, luefter_max: 80, v_erste: 30, v_aussen: 300, v_innen: 450, v_fuellung: 500, v_massiv: 450, v_oben: 300, max_vol: 20 };
const LVVJ3D_WOOD = { ...RICHTWERTE.pla, duese_erste: 215, duese: 230, bett: 55, v_erste: 25, v_aussen: 40, v_innen: 40, v_fuellung: 60, v_massiv: 45, v_oben: 30, flow: 0.98, max_vol: 10 };

const HINWEISE = {
  wood: "Holzfasern können eine 0,2-mm-Düse verstopfen. Besser 0,4 oder 0,6 mm verwenden.",
  asa_cf: "Carbonfasern schleifen Messingdüsen ab, also nur mit der gehärteten Düse drucken. Haube geschlossen lassen, Lüfter niedrig halten (Verzug).",
  tpu: "Langsam drucken, Rückzug klein halten. Rolle locker abrollen lassen.",
  silk: "Glanz wird besser, je langsamer die Außenwand gedruckt wird.",
  transparent: "Für mehr Durchsicht: dicke Wände, wenig Füllung, langsame Außenwand.",
  petg: "PETG haftet sehr stark. Auf der Textured PEI Plate löst es sich gut, auf glatten Platten Kleber als Trennmittel nehmen.",
};

// Rollen. rest_g = Restfilament ohne Spule (null = noch nicht gewogen)
const STANDARD_ROLLEN = [
  { id: "anycubic-silk-silber", name: "Silk PLA Silber", hersteller: "Anycubic", material: "PLA", art: "Silk", farbe: "Silber", farbcode: "AHSCSL-103", hex: "#c3c8cc", glanz: true, rest_g: null, spule: null, probiert: false,
    eigen: {}, vorschlag: RICHTWERTE.pla_silk, hinweis: HINWEISE.silk },
  { id: "bambu-pla-basic-grau", name: "PLA Basic Grau", hersteller: "Bambulab", material: "PLA", art: "Basic", farbe: "Grau", farbcode: "10103", hex: "#8e9089", rest_g: 92, spule: "bambu", probiert: true,
    preset: "Bambu", eigen: {}, vorschlag: RICHTWERTE.pla },
  { id: "bambu-pla-matte-gruen", name: "PLA Matte Dunkelgrün", hersteller: "Bambulab", material: "PLA", art: "Matte", farbe: "Dunkelgrün", farbcode: "11501", hex: "#4f6b45", rest_g: 139, spule: "bambu", probiert: true,
    preset: "Bambu", eigen: {}, vorschlag: RICHTWERTE.pla_matte },
  { id: "bambu-pla-matte-rot", name: "PLA Matte Dunkelrot", hersteller: "Bambulab", material: "PLA", art: "Matte", farbe: "Dunkelrot", farbcode: "11202", hex: "#a8343a", rest_g: 519, spule: "bambu", probiert: true,
    preset: "Bambu", eigen: {}, vorschlag: RICHTWERTE.pla_matte },
  { id: "bambu-petg-hf-schwarz", name: "PETG HF Schwarz", hersteller: "Bambulab", material: "PETG", art: "HF", farbe: "Schwarz", farbcode: "33102", hex: "#222222", rest_g: 146, spule: "bambu", probiert: true,
    preset: "Bambu", eigen: {}, vorschlag: RICHTWERTE.petg_hf, hinweis: HINWEISE.petg },
  { id: "deeplee-pla-plus-beige", name: "PLA+ Beige", hersteller: "Deeplee", material: "PLA", art: "PLA+", farbe: "Beige", hex: "#e6d3ad", rest_g: null, spule: "deeplee", probiert: true,
    preset: "Deeplee PLA PLA+", pa_profil: "Standart", filament_setting: "Deeplee PLA PLA+ Bambu Lab 0.4 nozzle",
    eigen: { v_erste: 30, v_aussen: 65, v_innen: 150, v_fuellung: 180, v_massiv: 180 }, vorschlag: DEEPLEE_PLUS,
    notiz: "0,16 mm / Glätten alle Oberflächen" },
  { id: "deeplee-pla-plus-braun", name: "PLA+ Braun", hersteller: "Deeplee", material: "PLA", art: "PLA+", farbe: "Braun", hex: "#6b4a2f", rest_g: 15, spule: "deeplee", probiert: false,
    eigen: {}, vorschlag: DEEPLEE_PLUS, herkunft: "Werte von deinem getesteten Deeplee PLA+ Beige übernommen." },
  { id: "deeplee-pla-plus-schwarz", name: "PLA+ Schwarz", hersteller: "Deeplee", material: "PLA", art: "PLA+", farbe: "Schwarz", hex: "#1f1f1f", rest_g: 29, spule: "deeplee", probiert: false,
    eigen: {}, vorschlag: DEEPLEE_PLUS, herkunft: "Werte von deinem getesteten Deeplee PLA+ Beige übernommen." },
  { id: "elegoo-rapid-petg-beige", name: "Rapid PETG Beige", hersteller: "Elegoo", material: "PETG", art: "Rapid", farbe: "Beige", hex: "#e0cba3", rest_g: 950, spule: null, probiert: true,
    preset: "Generic PETG HF", pa_profil: "Deeple Rapid PETG 28.11", filament_setting: "Elegoo Rapid PETG 06.26",
    eigen: { duese_erste: 245, duese: 250, bett: 70, luefter_min: 65, luefter_max: 80, v_erste: 30, v_aussen: 300, v_innen: 450, v_fuellung: 500, v_massiv: 450, v_oben: 300 },
    vorschlag: ELEGOO_RAPID, hinweis: HINWEISE.petg },
  { id: "elegoo-rapid-petg-braun", name: "Rapid PETG Braun", hersteller: "Elegoo", material: "PETG", art: "Rapid", farbe: "Braun", hex: "#7a4e2d", rest_g: 826, spule: null, probiert: false,
    eigen: {}, vorschlag: ELEGOO_RAPID, herkunft: "Werte von deinem getesteten Elegoo Rapid PETG Beige übernommen.", hinweis: HINWEISE.petg },
  { id: "elegoo-pla-matte-navy", name: "PLA Matte Dunkelblau", hersteller: "Elegoo", material: "PLA", art: "Matte", farbe: "Navy Blue", farbcode: "1-2508-0812", hex: "#24315e", rest_g: null, spule: null, probiert: true,
    preset: "Bambu PLA Matte", pa_profil: "Standart", filament_setting: "Bambu PLA Matte", eigen: {}, vorschlag: RICHTWERTE.pla_matte },
  { id: "esun-petg-silber", name: "PETG Silber", hersteller: "eSun", material: "PETG", art: "Basic", farbe: "Silber", hex: "#b4b9be", glanz: true, rest_g: null, spule: null, probiert: false,
    eigen: {}, vorschlag: RICHTWERTE.petg, hinweis: HINWEISE.petg },
  { id: "giantarm-pla-transparent", name: "PLA Transparent", hersteller: "Giantarm", material: "PLA", art: "Transparent", farbe: "Transparent", farbcode: "700-001-1193", hex: "transparent", rest_g: null, spule: null, probiert: false,
    eigen: {}, vorschlag: RICHTWERTE.pla_transparent, hinweis: HINWEISE.transparent },
  { id: "lvvj3d-wood-cherry", name: "Wood PLA Cherry", hersteller: "LVVJ3D", material: "PLA", art: "Wood", farbe: "Cherry", hex: "#8b3f2e", rest_g: 82, spule: "lvvj3d", probiert: false,
    eigen: {}, vorschlag: LVVJ3D_WOOD, herkunft: "Werte von deinem getesteten LVVJ3D Wood Oak übernommen.", hinweis: HINWEISE.wood },
  { id: "lvvj3d-wood-oak", name: "Wood PLA Oak", hersteller: "LVVJ3D", material: "PLA", art: "Wood", farbe: "Oak", hex: "#c49a6c", rest_g: 200, spule: "lvvj3d", probiert: true,
    preset: "LVVJ3D PLA 10240512", pa_profil: "LVVJ3D PLA 10240512", filament_setting: "LVVJ3D PLA 10240512",
    eigen: { duese_erste: 215, duese: 230, bett: 55, v_erste: 25, v_aussen: 40, v_innen: 40, v_fuellung: 60, v_massiv: 45, v_oben: 30, flow: 0.98 },
    vorschlag: LVVJ3D_WOOD, hinweis: HINWEISE.wood },
  { id: "lvvj3d-wood-teak", name: "Wood PLA Teak", hersteller: "LVVJ3D", material: "PLA", art: "Wood", farbe: "Teak", hex: "#9c6b3c", rest_g: 176, spule: "lvvj3d", probiert: false,
    eigen: {}, vorschlag: LVVJ3D_WOOD, herkunft: "Werte von deinem getesteten LVVJ3D Wood Oak übernommen.", hinweis: HINWEISE.wood },
  { id: "lvvj3d-wood-walnut", name: "Wood PLA Walnut", hersteller: "LVVJ3D", material: "PLA", art: "Wood", farbe: "Walnut", hex: "#5c3a21", rest_g: 200, spule: "lvvj3d", probiert: false,
    eigen: {}, vorschlag: LVVJ3D_WOOD, herkunft: "Werte von deinem getesteten LVVJ3D Wood Oak übernommen.", hinweis: HINWEISE.wood },
  // „Sunlu PETG weiß“ und „PETG Weiß“ standen doppelt in der Tabelle und sind hier zusammengelegt.
  { id: "sunlu-petg-weiss", name: "PETG Weiß", hersteller: "Sunlu", material: "PETG", art: "Basic", farbe: "Weiß", hex: "#f1f1ee", rest_g: null, spule: null, probiert: false,
    eigen: {}, vorschlag: RICHTWERTE.petg, hinweis: HINWEISE.petg, notiz: "Stand in der Tabelle doppelt, zusammengelegt." },
  { id: "sunlu-petg-schwarz", name: "PETG Schwarz", hersteller: "Sunlu", material: "PETG", art: "Basic", farbe: "Schwarz", hex: "#1f1f1f", rest_g: null, spule: null, probiert: false,
    eigen: {}, vorschlag: RICHTWERTE.petg, hinweis: HINWEISE.petg },
  { id: "sunlu-tpu-schwarz", name: "TPU Schwarz", hersteller: "Sunlu", material: "TPU", art: "95A", farbe: "Schwarz", hex: "#1f1f1f", rest_g: null, spule: null, probiert: false,
    eigen: {}, vorschlag: RICHTWERTE.tpu, hinweis: HINWEISE.tpu },
  { id: "esun-pla-matte-rosa", name: "PLA Matte Rosa", hersteller: "eSun", material: "PLA", art: "Matte", farbe: "Rosa", hex: "#e6a3b6", rest_g: 810, spule: null, probiert: true,
    preset: "Generic PLA / eSun PLA Matte", eigen: {}, vorschlag: RICHTWERTE.pla_matte },
  { id: "eryone-asa-carbon-grau", name: "ASA Carbon Grau", hersteller: "Eryone", material: "ASA", art: "Carbon", farbe: "Grau", hex: "#55595d", rest_g: 1000, spule: null, probiert: true,
    preset: "2. Eryone ASA Carbon Fiber ASA", eigen: { duese_erste: 265, duese: 265, flow: 0.95769, k: 0.03 },
    vorschlag: RICHTWERTE.asa, hinweis: HINWEISE.asa_cf },
];

function standardDaten() {
  return {
    version: DATEN_VERSION,
    rollen: STANDARD_ROLLEN.map((r) => ({
      nenn_g: 1000,
      preis_kg: null,
      preset: "",
      pa_profil: "",
      filament_setting: "",
      notiz: "",
      ...JSON.parse(JSON.stringify(r)),
      vorschlag: { ...richtwerteFuer(r.material, r.art), ...r.vorschlag },
    })),
    spulen: JSON.parse(JSON.stringify(SPULEN)),
    materialien_eigen: [],
    arten_eigen: {},
    inventar: standardInventar(),
  };
}

// Ältere gespeicherte Daten auf den aktuellen Aufbau bringen
function migrieren(d) {
  if ((d.version || 1) < 2) {
    d.rollen.forEach((r) => { r.vorschlag = { ...richtwerteFuer(r.material, r.art), ...r.vorschlag }; });
    d.spulen.forEach((s) => { const std = SPULEN.find((x) => x.id === s.id); if (!s.hersteller) s.hersteller = std ? std.hersteller : s.name; });
  }
  if (!d.inventar) d.inventar = standardInventar();
  if (!d.materialien_eigen) d.materialien_eigen = [];
  if (!d.arten_eigen) d.arten_eigen = {};
  if (!d.drucke) d.drucke = {};   // Kommentare usw. zu Drucken aus dem Verlauf, Schlüssel = Eintrag in „3D-Drucke“
  d.version = DATEN_VERSION;
  return d;
}

// Farbfamilie aus dem Farbwert (für Filter und Sortierung, nur näherungsweise)
const FARBFAMILIEN = ["Weiß", "Beige", "Gelb", "Orange", "Rot", "Rosa", "Lila", "Blau", "Grün", "Braun", "Grau", "Silber", "Schwarz", "Transparent"];
function hsl(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s, l };
}
function farbfamilie(rolle) {
  if (!rolle.hex || rolle.hex === "transparent") return "Transparent";
  const { h, s, l } = hsl(rolle.hex);
  if (l < 0.16) return "Schwarz";
  if (l > 0.9 && s < 0.3) return "Weiß";
  if (s < 0.12) return rolle.glanz ? "Silber" : "Grau";
  if (h < 15 || h >= 345) return l < 0.3 ? "Braun" : "Rot";
  if (h < 50) return l < 0.5 ? "Braun" : s < 0.6 && l > 0.6 ? "Beige" : "Orange";
  if (h < 70) return "Gelb";
  if (h < 170) return "Grün";
  if (h < 260) return "Blau";
  if (h < 300) return "Lila";
  return "Rosa";
}
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
// ---------------------------------------------------------------------------
// Aussehen: dunkler Tech-Look, Mint-Akzente, Glas-Karten, Rasterhintergrund
// ---------------------------------------------------------------------------

const STIL = `
:host {
  --grund: #080c0b;
  --flaeche: rgba(255,255,255,0.035);
  --flaeche-hover: rgba(255,255,255,0.06);
  --rand: rgba(255,255,255,0.08);
  --text: #e8f1ec;
  --leise: #8da49a;
  --mint: #3ee6a8;
  --mint-weich: rgba(62,230,168,0.12);
  --amber: #ffb547;
  --amber-weich: rgba(255,181,71,0.12);
  --rot: #ff6b6b;
  --radius: 18px;
  display: block;
  /* Immer genau so hoch wie das Fenster: sonst wächst die Seite mit dem Inhalt
     und es scrollt die ganze Seite statt nur der Liste bzw. der Detailansicht */
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  overflow: clip;
  font-family: var(--paper-font-body1_-_font-family, "Roboto", system-ui, sans-serif);
  color: var(--text);
  background: var(--grund);
  -webkit-font-smoothing: antialiased;
}
* { box-sizing: border-box; }
button { font: inherit; color: inherit; cursor: pointer; border: none; background: none; }
button:disabled { opacity: .45; cursor: default; }
h2 { margin: 0; font-size: 20px; font-weight: 600; }
h3 { margin: 22px 0 6px; font-size: 15px; font-weight: 600; }
p { margin: 4px 0 12px; }
.leise { color: var(--leise); }
.klein { font-size: 13px; }
.amber { color: var(--amber); }
.rot { color: var(--rot); }

.app {
  position: relative; height: 100%; display: flex; flex-direction: column; overflow: hidden; overflow: clip;
  background:
    radial-gradient(1200px 500px at 85% -10%, rgba(62,230,168,0.10), transparent 60%),
    radial-gradient(800px 400px at -10% 110%, rgba(62,230,168,0.06), transparent 60%),
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px) 0 0 / 44px 44px,
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px) 0 0 / 44px 44px,
    var(--grund);
}

/* Kopfzeile und Navigation */
.kopf {
  display: flex; align-items: center; gap: 16px; padding: 14px 24px;
  border-bottom: 1px solid var(--rand); background: rgba(8,12,11,0.7); backdrop-filter: blur(14px);
  position: relative; z-index: 2;
}
.marke { display: flex; align-items: center; gap: 10px; font-weight: 700; letter-spacing: .3px; white-space: nowrap; }
.punkt-leucht { width: 10px; height: 10px; border-radius: 50%; background: var(--mint); box-shadow: 0 0 12px var(--mint); }
.nav-oben { display: flex; gap: 4px; margin-left: 12px; flex: 1; }
.nav-punkt { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 12px; color: var(--leise); position: relative; }
.nav-punkt:hover { background: var(--flaeche-hover); color: var(--text); }
.nav-punkt.aktiv { background: var(--mint-weich); color: var(--mint); }
.nav-punkt.bald { opacity: .5; }
.nav-punkt small { font-size: 10px; text-transform: uppercase; letter-spacing: .6px; border: 1px solid var(--rand); border-radius: 6px; padding: 0 5px; }
.speicher { margin-left: auto; font-size: 12px; color: var(--leise); white-space: nowrap; }
.speicher.gespeichert::before { content: "● "; color: var(--mint); }
.speicher.speichert::before { content: "● "; color: var(--amber); }
.speicher.fehler { color: var(--rot); }
.icon-knopf { width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; font-size: 18px; flex: none; }
.icon-knopf:hover { background: var(--flaeche-hover); }

.haupt { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 24px; position: relative; z-index: 1; }
.mobil .haupt { padding: 16px 16px 96px; }
.nav-unten {
  position: absolute; left: 0; right: 0; bottom: 0; z-index: 3; display: flex; justify-content: space-around;
  padding: 6px 4px calc(6px + env(safe-area-inset-bottom)); background: rgba(8,12,11,0.88);
  backdrop-filter: blur(16px); border-top: 1px solid var(--rand);
}
.nav-unten .nav-punkt { flex-direction: column; gap: 2px; padding: 6px 8px; font-size: 11px; min-width: 60px; }
.nav-unten .nav-icon { font-size: 20px; }
.nav-unten small { position: absolute; top: 0; right: 4px; font-size: 8px !important; padding: 0 3px !important; }

/* Karten und Kennzahlen */
.karte { background: var(--flaeche); border: 1px solid var(--rand); border-radius: var(--radius); padding: 24px; backdrop-filter: blur(10px); max-width: 680px; margin: 0 auto; }
.stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 18px; }
.mobil .stats { grid-template-columns: repeat(2, 1fr); gap: 8px; }
.mobil .stats .stat:nth-child(n+3) { display: none; }
.stat { text-align: left; background: var(--flaeche); border: 1px solid var(--rand); border-radius: 16px; padding: 14px 16px; backdrop-filter: blur(10px); display: flex; flex-direction: column; gap: 2px; }
.stat[data-aktion]:hover { background: var(--flaeche-hover); }
.stat strong { font-size: 22px; font-weight: 700; }
.mobil .stat strong { font-size: 18px; }
.stat span { font-size: 12px; color: var(--leise); }
.stat.amber strong { color: var(--amber); }
.stat.rot strong { color: var(--rot); }

.werkzeug { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 18px; }
.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.mobil .werkzeug .chips { flex-wrap: nowrap; overflow-x: auto; width: 100%; padding-bottom: 4px; scrollbar-width: none; }
.chip { padding: 7px 14px; border-radius: 999px; background: var(--flaeche); border: 1px solid var(--rand); font-size: 13px; white-space: nowrap; }
.chip:hover { background: var(--flaeche-hover); }
.chip.an { background: var(--mint-weich); border-color: rgba(62,230,168,.5); color: var(--mint); }
.suche { flex: 1; min-width: 220px; padding: 10px 14px; border-radius: 12px; border: 1px solid var(--rand); background: rgba(0,0,0,.25); color: var(--text); font: inherit; outline: none; }
.suche:focus { border-color: rgba(62,230,168,.6); }
.mobil .suche { min-width: 0; width: 100%; }

/* Kacheln */
.raster { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px; }
.mobil .raster { grid-template-columns: 1fr 1fr; gap: 10px; }
.kachel {
  position: relative; text-align: left; display: flex; flex-direction: column; gap: 4px; padding: 16px;
  background: var(--flaeche); border: 1px solid var(--rand); border-radius: var(--radius); backdrop-filter: blur(10px);
  transition: transform .15s ease, border-color .15s ease, background .15s ease;
}
.kachel:hover { transform: translateY(-2px); border-color: rgba(62,230,168,.35); background: var(--flaeche-hover); }
.kachel.offen { border: 1px dashed rgba(255,181,71,.55); background: linear-gradient(160deg, var(--amber-weich), transparent 55%), var(--flaeche); }
.kachel.offen:hover { border-color: var(--amber); }
.badge-offen { position: absolute; top: 12px; right: 12px; font-size: 10px; font-weight: 600; color: var(--amber); background: rgba(255,181,71,.14); border-radius: 6px; padding: 2px 6px; letter-spacing: .2px; }
.mobil .badge-offen { font-size: 9px; padding: 2px 5px; }
.kachel-spule { width: 64px; height: 64px; margin-bottom: 8px; }
.spule-svg { width: 100%; height: 100%; display: block; }
.spule-svg.gross { width: 72px; height: 72px; flex: none; }
.kachel-name { font-weight: 600; font-size: 15px; line-height: 1.25; }
.kachel-sub { color: var(--leise); font-size: 13px; }
.kachel-fuss { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; gap: 6px; }
.mat { font-size: 11px; font-weight: 700; letter-spacing: .5px; color: var(--m); border: 1px solid color-mix(in srgb, var(--m) 45%, transparent); background: color-mix(in srgb, var(--m) 12%, transparent); padding: 2px 8px; border-radius: 6px; }
.rest { font-size: 13px; font-weight: 600; }
.rest.leise { font-weight: 400; }
.leer-hinweis, .laden { color: var(--leise); padding: 40px; text-align: center; grid-column: 1 / -1; }

/* Detailansicht (rechts am Desktop, von unten am Handy) */
.schleier { position: absolute; inset: 0; background: rgba(0,0,0,.55); z-index: 10; backdrop-filter: blur(2px); }
.schleier.oben { z-index: 20; }
.sheet {
  position: absolute; z-index: 11; top: 0; right: 0; bottom: 0; width: min(560px, 100%); display: flex; flex-direction: column;
  background: rgba(14,20,18,.96); border-left: 1px solid var(--rand); backdrop-filter: blur(20px);
  box-shadow: -20px 0 60px rgba(0,0,0,.5); animation: rein .2s ease;
}
@keyframes rein { from { transform: translateX(30px); opacity: 0; } }
.mobil .sheet { top: auto; left: 0; width: 100%; height: 92%; border-left: none; border-top: 1px solid var(--rand); border-radius: 22px 22px 0 0; animation: hoch .22s ease; }
@keyframes hoch { from { transform: translateY(40px); opacity: 0; } }
.griff { display: none; }
.mobil .griff { display: block; width: 40px; height: 4px; border-radius: 2px; background: rgba(255,255,255,.25); margin: 8px auto 0; }
.sheet-kopf { display: flex; gap: 14px; align-items: flex-start; padding: 20px 20px 12px; }
.sheet-titel { flex: 1; min-width: 0; }
.sheet-titel .sub { color: var(--leise); font-size: 13px; margin: 4px 0 8px; }
.pille { display: inline-block; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 999px; }
.pille.mint { color: var(--mint); background: var(--mint-weich); }
.pille.amber { color: var(--amber); background: var(--amber-weich); }
.tabs { display: flex; gap: 4px; padding: 0 20px; border-bottom: 1px solid var(--rand); }
.tab { padding: 10px 14px; color: var(--leise); border-bottom: 2px solid transparent; margin-bottom: -1px; }
.tab.an { color: var(--mint); border-color: var(--mint); }
.sheet-inhalt { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 16px 20px 24px; }
.sheet-fuss { display: flex; gap: 10px; justify-content: flex-end; padding: 14px 20px calc(14px + env(safe-area-inset-bottom)); border-top: 1px solid var(--rand); }
.mobil .sheet-fuss .knopf { flex: 1; }

.hinweis { font-size: 13px; line-height: 1.45; padding: 10px 12px; border-radius: 12px; background: var(--flaeche); border: 1px solid var(--rand); margin-bottom: 10px; }
.hinweis.amber { color: #ffd59a; background: var(--amber-weich); border-color: rgba(255,181,71,.3); }
.hinweis.mint { color: #b9f5dd; background: var(--mint-weich); border-color: rgba(62,230,168,.3); }
.legende { display: flex; gap: 14px; align-items: center; font-size: 12px; color: var(--leise); margin: 12px 0; flex-wrap: wrap; }
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
.dot.mint { background: var(--mint); }
.dot.amber { background: var(--amber); }
.mini { margin-left: auto; font-size: 12px; color: var(--amber); border: 1px solid rgba(255,181,71,.4); border-radius: 8px; padding: 4px 10px; }

/* Untermenüs (aufklappbare Gruppen) */
.gruppe { border: 1px solid var(--rand); border-radius: 14px; margin-bottom: 10px; background: var(--flaeche); overflow: hidden; }
.gruppe-kopf { width: 100%; display: flex; align-items: center; gap: 10px; padding: 13px 14px; text-align: left; }
.gruppe-kopf:hover { background: var(--flaeche-hover); }
.g-name { font-weight: 600; white-space: nowrap; }
.g-zus { margin-left: auto; font-size: 12px; color: var(--mint); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.g-zus.amber { color: var(--amber); }
.pfeil { color: var(--leise); transition: transform .15s; font-size: 18px; }
.gruppe.auf .pfeil { transform: rotate(90deg); }
.gruppe-inhalt { padding: 2px 14px 10px; border-top: 1px solid var(--rand); }
.zeile { padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,.04); }
.zeile:last-child { border-bottom: none; }
.zeile-kopf { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.z-name { font-size: 14px; }
.z-wert { display: flex; gap: 8px; align-items: center; font-weight: 600; font-size: 14px; text-align: right; }
.zeile.eigen .wert { color: var(--mint); }
.zeile.vorschlag .wert { color: var(--amber); }
.tag { font-size: 10px; font-weight: 600; color: var(--amber); border: 1px solid rgba(255,181,71,.4); border-radius: 6px; padding: 1px 6px; }
.text { width: 100%; margin-top: 8px; padding: 9px 12px; border-radius: 10px; border: 1px solid var(--rand); background: rgba(0,0,0,.3); color: var(--text); font: inherit; }

/* Regler */
.regler-zeile { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.rund { min-width: 34px; height: 34px; padding: 0 8px; border-radius: 10px; background: var(--flaeche-hover); border: 1px solid var(--rand); font-weight: 600; font-size: 13px; flex: none; }
.rund:active { background: var(--mint-weich); color: var(--mint); }
input[type=range] { -webkit-appearance: none; appearance: none; flex: 1; width: 100%; height: 6px; border-radius: 3px; background: rgba(255,255,255,.1); outline: none; margin: 10px 0; }
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: var(--mint); box-shadow: 0 0 0 5px rgba(62,230,168,.18), 0 2px 8px rgba(0,0,0,.4); cursor: pointer; }
input[type=range]::-moz-range-thumb { width: 22px; height: 22px; border: none; border-radius: 50%; background: var(--mint); box-shadow: 0 0 0 5px rgba(62,230,168,.18); cursor: pointer; }

/* Restgewicht */
.rest-jetzt { padding: 16px; border-radius: 16px; background: var(--flaeche); border: 1px solid var(--rand); }
.gross-zahl { font-size: 40px; font-weight: 700; color: var(--mint); margin-right: 8px; }
.einheit { color: var(--leise); }
.balken { height: 8px; border-radius: 4px; background: rgba(255,255,255,.08); margin: 10px 0 8px; overflow: hidden; }
.balken i { display: block; height: 100%; background: linear-gradient(90deg, var(--mint), #7cf5c8); border-radius: 4px; }
.rechner-block { padding: 14px 16px; border-radius: 16px; background: var(--flaeche); border: 1px solid var(--rand); margin-top: 12px; }
.r-kopf { display: flex; justify-content: space-between; align-items: baseline; }
.r-kopf strong { font-size: 20px; }
.spulen { margin-top: 10px; }
.spulen .chip { font-size: 12px; padding: 6px 10px; }
.ergebnis { margin: 14px 0; padding: 16px; border-radius: 16px; border: 1px solid rgba(62,230,168,.35); background: var(--mint-weich); display: grid; gap: 2px; }
.ergebnis strong { font-size: 30px; color: var(--mint); }
.ergebnis.ungespeichert { border-color: rgba(255,181,71,.45); background: var(--amber-weich); }
.ergebnis.ungespeichert strong { color: var(--amber); }

/* Infos */
.info-liste { border: 1px solid var(--rand); border-radius: 14px; overflow: hidden; }
.info-zeile { display: flex; justify-content: space-between; gap: 10px; padding: 11px 14px; border-bottom: 1px solid var(--rand); font-size: 14px; }
.info-zeile:last-child { border-bottom: none; }
.info-zeile span { color: var(--leise); }
.info-zeile .norm { display: block; font-size: 11px; opacity: .7; margin-top: 1px; }
textarea { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid var(--rand); background: rgba(0,0,0,.3); color: var(--text); font: inherit; resize: vertical; }

/* Knöpfe, Dialog, Meldung */
.knopf { padding: 11px 18px; border-radius: 12px; background: var(--mint); color: #062018; font-weight: 700; }
.knopf:hover { filter: brightness(1.08); }
.knopf.leise { background: var(--flaeche-hover); color: var(--text); border: 1px solid var(--rand); font-weight: 600; }
.knopf.amber { background: var(--amber); color: #2a1a00; }
.knopf.breit { width: 100%; }
.dialog {
  position: absolute; z-index: 21; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(420px, calc(100% - 32px));
  background: rgba(16,22,20,.98); border: 1px solid var(--rand); border-radius: 20px; padding: 22px; box-shadow: 0 30px 80px rgba(0,0,0,.6);
}
.wahl { width: 100%; display: flex; gap: 14px; align-items: center; text-align: left; padding: 14px; margin-bottom: 10px; border-radius: 14px; background: var(--flaeche); border: 1px solid var(--rand); }
.wahl:hover { border-color: rgba(62,230,168,.5); background: var(--mint-weich); }
.wahl > span { font-size: 20px; width: 28px; text-align: center; }
.wahl small { display: block; color: var(--leise); margin-top: 2px; }
.toast { position: absolute; z-index: 30; left: 50%; bottom: 28px; transform: translateX(-50%); padding: 11px 18px; border-radius: 12px; background: rgba(20,30,26,.96); border: 1px solid rgba(62,230,168,.4); color: var(--text); box-shadow: 0 10px 30px rgba(0,0,0,.5); max-width: calc(100% - 32px); font-size: 14px; }
.mobil .toast { bottom: 90px; }

/* Systemcheck */
.check { list-style: none; margin: 16px 0; padding: 0; display: grid; gap: 10px; }
.check li { display: flex; gap: 12px; align-items: flex-start; padding: 12px; border-radius: 12px; background: var(--flaeche); }
.check .punkt { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; flex: none; font-weight: 700; color: var(--grund); }
.check .ok .punkt { background: var(--mint); }
.check .nein .punkt { background: var(--rot); }
.check strong { display: block; }
.check small { color: var(--leise); word-break: break-word; }
.fehlerkarte h2 { color: var(--rot); }

/* Filter-Auswahlmenüs */
.werkzeug .alle { padding: 10px 18px; }
.auswahl { position: relative; display: flex; flex-direction: column; gap: 2px; padding: 6px 30px 6px 12px; border-radius: 12px; background: var(--flaeche); border: 1px solid var(--rand); min-width: 130px; cursor: pointer; }
.auswahl::after { content: "▾"; position: absolute; right: 11px; top: 50%; transform: translateY(-50%); color: var(--leise); pointer-events: none; }
.auswahl > span { font-size: 10px; text-transform: uppercase; letter-spacing: .6px; color: var(--leise); }
.auswahl select { appearance: none; -webkit-appearance: none; background: transparent; border: none; color: var(--text); font: inherit; font-size: 14px; padding: 0; outline: none; cursor: pointer; width: 100%; }
.auswahl select option, .auswahl select optgroup { background: #111816; color: var(--text); }
.auswahl.an { border-color: rgba(62,230,168,.5); background: var(--mint-weich); }
.auswahl.an select { color: var(--mint); }
.auswahl.sort { margin-left: auto; }
.werkzeug .suche { flex-basis: 100%; }
.unterfilter { display: contents; }
.filter-knopf { text-align: left; }
.filter-knopf strong { font-weight: 400; font-size: 14px; }
.filter-knopf.an strong { color: var(--mint); }
.mobil .werkzeug { display: grid; grid-template-columns: auto 1fr 1fr; gap: 8px; }
.mobil .werkzeug .alle { border-radius: 12px; }
.mobil .auswahl { min-width: 0; }
.mobil .auswahl.sort { margin-left: 0; }
.mobil .unterfilter { grid-column: 1 / -1; grid-row: 2; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 10px; border-radius: 14px; border: 1px solid rgba(62,230,168,.3); background: rgba(62,230,168,.05); animation: hoch .18s ease; }
.mobil .werkzeug .suche { grid-column: 1 / -1; }

/* Runder Plus-Knopf */
.fab { position: absolute; right: 28px; bottom: 28px; z-index: 5; width: 60px; height: 60px; border-radius: 50%; background: var(--mint); color: #062018; font-size: 34px; font-weight: 400; line-height: 1; display: grid; place-items: center; box-shadow: 0 0 0 6px rgba(62,230,168,.15), 0 10px 30px rgba(62,230,168,.35); transition: transform .15s; }
.fab:hover { transform: scale(1.06) rotate(90deg); }
.mobil .fab { right: 18px; bottom: 92px; width: 56px; height: 56px; }

/* Zeilen zum Antippen */
.zeile-kopf { width: 100%; text-align: left; padding: 2px 0; border-radius: 8px; }
button.zeile-kopf:hover .z-name { color: var(--mint); }
.zeile.auf { background: rgba(62,230,168,.04); margin: 0 -14px; padding: 10px 14px; }
.zeile-kopf.statisch { cursor: default; }
.mini.mint-rand { color: var(--mint); border-color: rgba(62,230,168,.4); margin: 6px 0 4px; }


/* Letzter Druck */
.letzter-druck { display: flex; gap: 12px; align-items: center; padding: 12px; border-radius: 14px; border: 1px dashed var(--rand); background: var(--flaeche); margin-bottom: 12px; }
.ld-bild { width: 56px; height: 56px; border-radius: 10px; background: rgba(0,0,0,.35); display: grid; place-items: center; font-size: 22px; flex: none; overflow: hidden; }
.ld-bild img { width: 100%; height: 100%; object-fit: cover; }
.ld-text { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.klein-knopf { padding: 8px 12px; font-size: 13px; white-space: nowrap; }

/* Restgewicht */
.rest-zeile { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.groesse-knopf { padding: 8px 12px; border-radius: 10px; border: 1px solid var(--rand); background: var(--flaeche-hover); font-size: 13px; color: var(--leise); }
.groesse-knopf strong { color: var(--text); }
.groesse-knopf:hover { border-color: rgba(62,230,168,.5); }
.knopf-reihe { display: flex; gap: 10px; }
.knopf-reihe .knopf { flex: 1; }
.rot-knopf { background: rgba(255,107,107,.14); color: var(--rot); border: 1px solid rgba(255,107,107,.5); }
.rot-knopf:hover:not(:disabled) { background: rgba(255,107,107,.24); }
.mobil .knopf-reihe .knopf { padding: 12px 10px; font-size: 14px; }
.mitte { text-align: center; margin-top: 10px; }
.chip.weitere { border-style: dashed; }
.sync { margin-top: 4px; }

/* Neues Filament */
.neu-vorschau { display: flex; gap: 14px; align-items: flex-start; flex: 1; min-width: 0; }
.abschnitt { color: var(--mint); font-size: 13px; text-transform: uppercase; letter-spacing: .8px; margin: 20px 0 10px; }
.abschnitt:first-child { margin-top: 4px; }
.formular { display: grid; gap: 12px; }
.formular label { display: grid; gap: 6px; font-size: 13px; color: var(--leise); }
.formular .text { margin-top: 0; }
.feld-titel { font-size: 13px; color: var(--leise); margin: 6px 0 -4px; }
.farb-zeile { display: flex; align-items: flex-end; gap: 12px; }
.farbwahl input { width: 64px; height: 38px; border: 1px solid var(--rand); border-radius: 10px; background: none; padding: 2px; cursor: pointer; }

/* Dialog-Listen */
.dialog { max-height: calc(100% - 40px); overflow-y: auto; overscroll-behavior: contain; animation: auf .18s ease; }
@keyframes auf { from { opacity: 0; transform: translate(-50%, -48%) scale(.97); } }
.schleier { animation: blende .2s ease; }
@keyframes blende { from { opacity: 0; } }
.toast { animation: blende .2s ease; }
.still { animation: none !important; }
.klapp { display: block; }

/* Eigene Auswahllisten */
select.dd-nativ { position: absolute !important; opacity: 0; pointer-events: none; width: 1px; height: 1px; margin: 0; padding: 0; border: 0; }
.dd-knopf { display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; font-size: 14px; color: var(--text); }
.dd-knopf .dd-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dd-knopf .dd-text.leise { color: var(--leise); }
.dd-pfeil { color: var(--leise); transition: transform .18s ease; font-size: 12px; }
.dd-knopf.offen .dd-pfeil { transform: rotate(180deg); color: var(--mint); }
.auswahl .dd-knopf { padding: 0; }
.auswahl .dd-pfeil { display: none; }
.auswahl.an .dd-knopf { color: var(--mint); }
.auswahl:has(.dd-knopf.offen) { border-color: rgba(62,230,168,.6); }
.dd-knopf.text { padding: 10px 12px; }
.dd-knopf.text:hover, .dd-knopf.text.offen { border-color: rgba(62,230,168,.5); }
.dd-liste {
  position: absolute; z-index: 40; overflow-y: auto; overscroll-behavior: contain; padding: 6px;
  background: rgba(16,23,21,.97); border: 1px solid rgba(62,230,168,.28); border-radius: 16px;
  backdrop-filter: blur(18px); box-shadow: 0 18px 50px rgba(0,0,0,.55), 0 0 0 1px rgba(0,0,0,.3);
  animation: dd-rein .16s cubic-bezier(.2,.7,.2,1); transform-origin: top center;
}
.dd-liste.nach-oben { transform-origin: bottom center; }
@keyframes dd-rein { from { opacity: 0; transform: translateY(-6px) scale(.98); } }
.dd-liste.nach-oben { animation-name: dd-rein-oben; }
@keyframes dd-rein-oben { from { opacity: 0; transform: translateY(6px) scale(.98); } }
.dd-gruppe { font-size: 10px; text-transform: uppercase; letter-spacing: .7px; color: var(--leise); padding: 10px 10px 4px; }
.dd-option { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; text-align: left; padding: 9px 12px; border-radius: 10px; font-size: 14px; }
.dd-option.eingerueckt { padding-left: 20px; }
.dd-option:hover { background: var(--flaeche-hover); }
.dd-option.an { background: var(--mint-weich); color: var(--mint); }
.dd-option i { font-style: normal; font-size: 12px; }
.liste { display: grid; gap: 8px; margin: 12px 0; }
.wahl.kompakt { padding: 10px 14px; margin: 0; }
.wahl.an { border-color: rgba(62,230,168,.6); background: var(--mint-weich); }
.neu-spule { margin: 8px 0 14px; padding-top: 12px; border-top: 1px solid var(--rand); }
.neu-spule .text { margin: 0; }
.oben-abstand { margin-top: 16px; }
.dialog .chips { margin-top: 10px; }

/* Inventar */
.inv-stats { grid-template-columns: repeat(4, 1fr); }
.mobil .inv-stats { grid-template-columns: repeat(2, 1fr); }
.mobil .inv-stats .stat:nth-child(n+3) { display: flex; }
.kats { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; margin-bottom: 18px; }
.mobil .kats { display: flex; overflow-x: auto; gap: 8px; padding-bottom: 4px; scrollbar-width: none; }
.kat { text-align: left; display: flex; flex-direction: column; gap: 2px; padding: 12px 14px; border-radius: 16px; background: var(--flaeche); border: 1px solid var(--rand); }
.mobil .kat { flex: none; min-width: 132px; }
.kat:hover { background: var(--flaeche-hover); }
.kat.an { border-color: rgba(62,230,168,.5); background: var(--mint-weich); }
.kat-icon { font-size: 20px; }
.kat strong { font-size: 14px; }
.kat small { font-size: 11px; color: var(--leise); }
.teil-bild { height: 64px; margin-bottom: 8px; display: flex; align-items: center; }
.teil-svg { height: 100%; width: auto; max-width: 100%; display: block; }
.teil-svg.gross { width: 100%; height: auto; max-height: 200px; }
.zeichnung { padding: 12px; border-radius: 16px; background: rgba(0,0,0,.25); border: 1px solid var(--rand); margin-bottom: 12px;
  background-image: linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px); background-size: 12px 12px; }
.teil-kopf-bild { width: 84px; height: 48px; flex: none; display: flex; align-items: center; }
.kachel.wenig { border-color: rgba(255,107,107,.5); }
.rot-badge { color: var(--rot) !important; background: rgba(255,107,107,.14) !important; }
.passend-titel { margin-top: 24px; }
.ohne-rand { border-top: none; }
.formular-zeile { display: grid; gap: 6px; font-size: 13px; color: var(--leise); margin-top: 12px; }
.mengen-knoepfe { justify-content: space-between; }
.mengen-knoepfe .rund { flex: 1; height: 40px; }

/* Drucker */
.dr-raster { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.mobil .dr-raster { grid-template-columns: 1fr; gap: 12px; }
.dr-spalte, .dr-live { display: grid; gap: 16px; align-content: start; }
.mobil .dr-spalte, .mobil .dr-live { gap: 12px; }
.dr-karte { background: var(--flaeche); border: 1px solid var(--rand); border-radius: var(--radius); padding: 18px; backdrop-filter: blur(10px); }
.dr-titel { margin: 0 0 12px; font-size: 14px; color: var(--leise); font-weight: 600; letter-spacing: .3px; }
.dr-status { display: flex; gap: 20px; align-items: center; position: relative; overflow: hidden;
  background: radial-gradient(400px 200px at 0% 0%, rgba(62,230,168,.10), transparent 70%), var(--flaeche); }
.mobil .dr-status { flex-direction: column; text-align: center; }
.dr-ring { position: relative; width: 132px; height: 132px; flex: none; }
.ring { width: 100%; height: 100%; display: block; }
.ring circle { transition: stroke-dasharray .8s ease; }
.dr-ring-text { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; }
.dr-ring-text strong { font-size: 26px; }
.dr-ring-text span { font-size: 11px; color: var(--leise); }
.dr-status-text { flex: 1; min-width: 0; display: grid; gap: 6px; justify-items: start; }
.mobil .dr-status-text { justify-items: center; }
.dr-status-text h2 { overflow-wrap: anywhere; }
.dr-status-text p { margin: 0; }
.dr-werte { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; width: 100%; margin-top: 6px; }
.dr-werte > div { background: rgba(0,0,0,.2); border: 1px solid var(--rand); border-radius: 12px; padding: 8px 10px; display: grid; gap: 2px; text-align: left; }
.dr-werte span { font-size: 11px; color: var(--leise); }
.dr-werte strong { font-size: 15px; }
.dr-titelbild { width: 96px; height: 96px; object-fit: contain; border-radius: 14px; background: rgba(0,0,0,.25); border: 1px solid var(--rand); flex: none; }
.dr-aus { display: flex; gap: 18px; align-items: center; }
.dr-aus p { margin: 6px 0 0; }
.dr-aus-icon { width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; font-size: 28px; flex: none; color: var(--leise); border: 1px solid var(--rand); background: rgba(0,0,0,.25); }
.dreher { width: 28px; height: 28px; border-radius: 50%; border: 3px solid rgba(62,230,168,.2); border-top-color: var(--mint); animation: drehen .9s linear infinite; }
@keyframes drehen { to { transform: rotate(360deg); } }
.dr-temp { margin-bottom: 14px; }
.dr-temp:last-child { margin-bottom: 0; }
.dr-temp-kopf { display: flex; justify-content: space-between; align-items: baseline; }
.dr-temp-kopf strong { font-size: 22px; }
.dr-balken { position: relative; height: 8px; border-radius: 4px; background: rgba(255,255,255,.08); margin: 8px 0 6px; }
.dr-balken i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 4px; background: linear-gradient(90deg, #3ee6a8, #ffb547 70%, #ff6b6b); transition: width .8s ease; }
.dr-balken b { position: absolute; top: -4px; width: 2px; height: 16px; background: var(--text); border-radius: 1px; transform: translateX(-1px); }
.dr-temp small { font-size: 12px; }
.dr-luefter { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.dr-l { display: grid; justify-items: center; gap: 2px; padding: 10px 4px; border-radius: 12px; background: rgba(0,0,0,.2); border: 1px solid var(--rand); }
.dr-l small { font-size: 11px; color: var(--leise); }
.dr-l-icon { font-size: 22px; color: var(--leise); }
.dr-l-icon.dreht { color: var(--mint); animation: drehen var(--dauer) linear infinite; }
.dr-werte-3 { margin: 0 0 8px; }
.dr-kamera-kopf { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 10px; }
.dr-kamera-kopf .dr-titel { margin: 0; }
.dr-kamera { aspect-ratio: 16 / 9; border-radius: 14px; overflow: hidden; background: rgba(0,0,0,.4); border: 1px solid var(--rand); }
.dr-kamera img { width: 100%; height: 100%; object-fit: cover; display: block; }
.dr-kamera-leer { height: 100%; display: grid; place-items: center; color: var(--leise); font-size: 14px; }
.dr-kamera-karte p { margin: 8px 0 0; }
.dr-verlauf { display: grid; gap: 8px; }
.dr-druck { display: flex; gap: 12px; align-items: center; text-align: left; padding: 10px; border-radius: 14px; background: rgba(0,0,0,.18); border: 1px solid var(--rand); }
.dr-druck:hover { border-color: rgba(62,230,168,.4); background: var(--flaeche-hover); }
.dr-druck .ld-bild { width: 48px; height: 48px; font-size: 18px; }
.dr-druck-text { flex: 1; min-width: 0; display: grid; gap: 2px; }
.dr-druck-text strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dr-druck-text small { color: var(--leise); font-size: 12px; }
.dr-kommentar { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text) !important; opacity: .8; }
.pille.rot { color: var(--rot); background: rgba(255,107,107,.14); }
.pille.leise { color: var(--leise); background: var(--flaeche-hover); }
.dr-foto-gross { width: 100%; border-radius: 14px; margin-top: 8px; border: 1px solid var(--rand); }
.rot-hinweis { color: #ffc2c2; background: rgba(255,107,107,.12); border-color: rgba(255,107,107,.4); }
.mobil .dr-werte { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.mobil .dr-luefter { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;
// ---------------------------------------------------------------------------
// Inventar-Ansicht. Wird in die Panel-Klasse eingemischt (siehe panel.js).
// Änderungen werden sofort in Home Assistant gespeichert.
// ---------------------------------------------------------------------------

const INV_STATUS = [
  { id: "wenig", name: "Wenig Bestand" },
  { id: "ungezaehlt", name: "Nicht nachgezählt" },
  { id: "ohne", name: "Menge fehlt" },
];
const INV_SORTIERUNG = [
  { id: "kategorie", name: "Kategorie" },
  { id: "groesse", name: "Größe" },
  { id: "menge_auf", name: "Menge: wenig zuerst" },
  { id: "menge_ab", name: "Menge: viel zuerst" },
];

// Maße eines Teils, je nach Form mit passender Bezeichnung
function masseFuer(t) {
  const k = kategorie(t.kat);
  if (t.kat === "magnet") {
    if (t.form === "folie") return [];
    if (t.form === "rund") return [{ k: "durchmesser", ...MASS.durchmesser }, { k: "dicke", ...MASS.dicke }];
    return [{ k: "durchmesser", ...MASS.durchmesser, name: "Länge" }, { k: "breite", ...MASS.breite }, { k: "dicke", ...MASS.dicke }];
  }
  return k.masse.map((m) => ({ k: m, ...MASS[m] }));
}

function wenigBestand(t) { return t.menge != null && t.min != null && t.min > 0 && t.menge <= t.min; }

// Größe zum Sortieren: Gewinde, dann Länge bzw. Durchmesser
function groessenWert(t) {
  return (t.gewinde ? gewindeD(t.gewinde) * 1000 : 0) + (t.aussen || t.durchmesser || t.groesse || 0) * 10 + (t.laenge || t.dicke || 0) / 100;
}

// Teile, die zusammenpassen (gleiches Gewinde: Schraube, Mutter, Scheibe, Einsatz)
function passendeTeile(t, alle) {
  if (!t.gewinde) return [];
  return alle.filter((x) => x !== t && x.gewinde === t.gewinde && x.kat !== t.kat)
    .sort((a, b) => KATEGORIEN.findIndex((k) => k.id === a.kat) - KATEGORIEN.findIndex((k) => k.id === b.kat) || groessenWert(a) - groessenWert(b));
}

// ---- Zeichnungen (schematisch, maßstäblich innerhalb des Teils) ----------
function teilSvg(t, gross = false) {
  const B = gross ? 240 : 120, H = gross ? (t.kat === "schraube" ? 160 : 120) : 64;
  const linie = "rgba(232,241,236,.85)";
  const mass = (x1, y1, x2, y2, text, tx, ty) => gross
    ? `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--mint)" stroke-width="1" marker-start="url(#pf)" marker-end="url(#pf)"/>
       <text x="${tx}" y="${ty}" fill="var(--mint)" font-size="10" text-anchor="middle">${text}</text>` : "";
  const z = (v) => Number(v).toLocaleString("de-DE", { maximumFractionDigits: 2 });
  let innen = "";
  const m = gewindeD(t.gewinde);
  const norm = NORM[t.gewinde] || NORM.M3;
  if (t.kat === "schraube") {
    const L = t.laenge || 10, k = norm.kopf_h, dk = norm.kopf_d;
    const s = Math.min((B - (gross ? 100 : 30)) / (L + k), (H - (gross ? 70 : 36)) / dk);
    const x0 = (B - (L + k) * s) / 2 + (gross ? 10 : 0), y = H / 2 + (gross ? 2 : 0);
    let gewinde = "";
    for (let x = x0 + k * s + 3; x < x0 + (k + L) * s - 1; x += Math.max(3, 0.5 * s)) gewinde += `<line x1="${x}" y1="${y - (m * s) / 2}" x2="${x + 2}" y2="${y + (m * s) / 2}" stroke="${linie}" stroke-opacity=".35"/>`;
    innen = `<rect x="${x0}" y="${y - (dk * s) / 2}" width="${k * s}" height="${dk * s}" rx="2" fill="#3a4541" stroke="${linie}"/>
      <rect x="${x0 + k * s}" y="${y - (m * s) / 2}" width="${L * s}" height="${m * s}" fill="#2b3431" stroke="${linie}"/>${gewinde}
      ${mass(x0 + k * s, y + (dk * s) / 2 + 12, x0 + (k + L) * s, y + (dk * s) / 2 + 12, `L ${z(L)} mm`, x0 + (k + L / 2) * s, y + (dk * s) / 2 + 26)}
      ${mass(x0 + (k + L) * s + 10, y - (m * s) / 2, x0 + (k + L) * s + 10, y + (m * s) / 2, t.gewinde, x0 + (k + L) * s + 26, y + 4)}
      ${gross ? `<line x1="${x0 + k * s * 0.15}" y1="${y - 2.5}" x2="${x0 + k * s * 0.15}" y2="${y + 2.5}" stroke="${linie}" stroke-opacity=".5"/>
      ${mass(x0 - 10, y - (dk * s) / 2, x0 - 10, y + (dk * s) / 2, "", 0, 0)}
      <text x="${x0 - 16}" y="${y - 2}" fill="var(--mint)" font-size="10" text-anchor="end">Kopf</text>
      <text x="${x0 - 16}" y="${y + 11}" fill="var(--mint)" font-size="10" text-anchor="end">Ø ${z(dk)}</text>
      ${mass(x0, y - (dk * s) / 2 - 10, x0 + k * s, y - (dk * s) / 2 - 10, `k ${z(k)}`, x0 + (k * s) / 2, y - (dk * s) / 2 - 16)}` : ""}`;
  } else if (t.kat === "mutter" || t.kat === "scheibe") {
    const r = (H - (gross ? 30 : 12)) / 2, cx = B / 2, cy = H / 2;
    const loch = r * (m / (t.kat === "mutter" ? norm.mutter_sw : norm.scheibe_d)) * 1.05;
    if (t.kat === "mutter") {
      const pkt = Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 6 + (i * Math.PI) / 3; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; }).join(" ");
      innen = `<polygon points="${pkt}" fill="#3a4541" stroke="${linie}"/>`;
    } else innen = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#3a4541" stroke="${linie}"/>`;
    innen += `<circle cx="${cx}" cy="${cy}" r="${loch}" fill="var(--grund)" stroke="${linie}"/>`;
    if (gross) innen += `<text x="${cx + r + 36}" y="${cy - 6}" fill="var(--mint)" font-size="10" text-anchor="middle">${t.kat === "mutter" ? `SW ${z(norm.mutter_sw)}` : `Ø ${z(norm.scheibe_d)}`}</text>
      <text x="${cx + r + 36}" y="${cy + 10}" fill="var(--mint)" font-size="10" text-anchor="middle">${t.kat === "mutter" ? `Höhe ${z(norm.mutter_h)}` : `Dicke ${z(norm.scheibe_h)}`}</text>`;
  } else if (t.kat === "einsatz") {
    const L = t.laenge || 5, D = t.aussen || 5;
    const s = Math.min((B - 50) / L, (H - 36) / D) * 0.9;
    const x0 = (B - L * s) / 2, y = H / 2 - (gross ? 6 : 0), h = D * s;
    let raendel = "";
    for (let x = x0 + 2; x < x0 + L * s - h * 0.35 - 1; x += Math.max(4, s * 0.6)) raendel += `<line x1="${x}" y1="${y - h / 2}" x2="${x + h * 0.35}" y2="${y + h / 2}" stroke="#7a5a12" stroke-width="1.2"/>`;
    innen = `<rect x="${x0}" y="${y - h / 2}" width="${L * s}" height="${h}" rx="2" fill="#d6a933" stroke="#f3d27a"/>${raendel}
      <rect x="${x0}" y="${y - (m * s) / 2}" width="${L * s}" height="${m * s}" fill="none" stroke="#5a420c" stroke-dasharray="3 2"/>
      ${mass(x0, y + h / 2 + 12, x0 + L * s, y + h / 2 + 12, `${z(L)} mm`, x0 + (L * s) / 2, y + h / 2 + 26)}
      ${mass(x0 + L * s + 12, y - h / 2, x0 + L * s + 12, y + h / 2, `Ø ${z(D)}`, x0 + L * s + 32, y + 4)}`;
  } else if (t.kat === "feder") {
    const L = t.laenge || 20, D = t.aussen || 5;
    const s = Math.min((B - 50) / L, (H - 36) / D);
    const x0 = (B - L * s) / 2, y = H / 2 - (gross ? 6 : 0), h = D * s;
    const windungen = Math.max(4, Math.min(16, Math.round(L / (D * 0.45))));
    let pfad = `M ${x0} ${y}`;
    for (let i = 0; i < windungen; i++) {
      const xa = x0 + (i / windungen) * L * s, xb = x0 + ((i + 0.5) / windungen) * L * s, xc = x0 + ((i + 1) / windungen) * L * s;
      pfad += ` L ${(xa + xb) / 2} ${y - h / 2} L ${(xb + xc) / 2} ${y + h / 2}`;
    }
    pfad += ` L ${x0 + L * s} ${y}`;
    innen = `<path d="${pfad}" fill="none" stroke="#c9d3cf" stroke-width="${Math.max(1, (t.draht || 0.4) * s * 0.8)}" stroke-linejoin="round"/>
      ${mass(x0, y + h / 2 + 12, x0 + L * s, y + h / 2 + 12, `${z(L)} mm`, x0 + (L * s) / 2, y + h / 2 + 26)}
      ${mass(x0 + L * s + 12, y - h / 2, x0 + L * s + 12, y + h / 2, `Ø ${z(D)}`, x0 + L * s + 32, y + 4)}`;
  } else if (t.kat === "duese") {
    const cx = B / 2, top = gross ? 10 : 6, s = gross ? 1.6 : 0.85;
    innen = `<rect x="${cx - 18 * s}" y="${top}" width="${36 * s}" height="${30 * s}" rx="3" fill="#3a4541" stroke="${linie}"/>
      <path d="M ${cx - 22 * s} ${top + 30 * s} h ${44 * s} l ${-6 * s} ${12 * s} h ${-32 * s} z" fill="#b08d3e" stroke="${linie}"/>
      <path d="M ${cx - 12 * s} ${top + 42 * s} h ${24 * s} l ${-9 * s} ${14 * s} h ${-6 * s} z" fill="#d6a933" stroke="${linie}"/>
      <text x="${cx}" y="${top + 20 * s}" fill="var(--mint)" font-size="${gross ? 16 : 10}" font-weight="700" text-anchor="middle">${z(t.groesse)}</text>`;
  } else if (t.kat === "magnet") {
    const cx = B / 2, cy = H / 2;
    if (t.form === "folie") {
      innen = `<rect x="${cx - 26}" y="${cy - 20}" width="52" height="40" rx="2" fill="#3a4541" stroke="${linie}"/><text x="${cx}" y="${cy + 4}" fill="var(--leise)" font-size="10" text-anchor="middle">A4</text>`;
    } else if (t.form === "rund") {
      const r = Math.min((H - (gross ? 30 : 12)) / 2, 6 + (t.durchmesser || 5) * 2.2);
      innen = `<path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z" fill="#c0392b"/><path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy} Z" fill="#2c6fbf"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${linie}"/>
        ${gross ? `<text x="${cx}" y="${cy - r / 3}" fill="#fff" font-size="11" text-anchor="middle">N</text><text x="${cx}" y="${cy + r / 2}" fill="#fff" font-size="11" text-anchor="middle">S</text>
        <text x="${cx + r + 40}" y="${cy - 6}" fill="var(--mint)" font-size="10" text-anchor="middle">Ø ${z(t.durchmesser)}</text>
        <text x="${cx + r + 40}" y="${cy + 10}" fill="var(--mint)" font-size="10" text-anchor="middle">Dicke ${z(t.dicke)}</text>` : ""}`;
    } else {
      const s = Math.min((B - 80) / (t.breite || 5), (H - 30) / (t.durchmesser || 4));
      const w = (t.breite || 5) * s, h = (t.durchmesser || 4) * s;
      innen = `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w / 2}" height="${h}" fill="#c0392b"/><rect x="${cx}" y="${cy - h / 2}" width="${w / 2}" height="${h}" fill="#2c6fbf"/>
        <rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="none" stroke="${linie}"/>`;
    }
  }
  return `<svg viewBox="0 0 ${B} ${H}" class="teil-svg${gross ? " gross" : ""}" aria-hidden="true">
    <defs><marker id="pf" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L6 3 L0 6 z" fill="var(--mint)"/></marker></defs>
    ${innen}</svg>`;
}

const InventarAnsicht = {
  _inv() { return this._daten.inventar; },
  _teil(id = this._invOffen) { return this._modus === "inv-neu" ? this._invNeu : this._inv().find((t) => t.id === id); },

  _invGefiltert() {
    const f = this._invF;
    const worte = suchWorte(this._invSuche || "");
    const liste = this._inv().filter((t) => {
      if (f.kat && t.kat !== f.kat) return false;
      if (f.gewinde && t.gewinde !== f.gewinde) return false;
      if (f.status === "wenig" && !wenigBestand(t)) return false;
      if (f.status === "ungezaehlt" && (t.gezaehlt || t.menge == null)) return false;
      if (f.status === "ohne" && t.menge != null) return false;
      return passtZurSuche(t, worte);
    });
    const katI = (t) => KATEGORIEN.findIndex((k) => k.id === t.kat);
    const s = {
      kategorie: (a, b) => katI(a) - katI(b) || groessenWert(a) - groessenWert(b),
      groesse: (a, b) => groessenWert(a) - groessenWert(b) || katI(a) - katI(b),
      menge_auf: (a, b) => (a.menge ?? 1e9) - (b.menge ?? 1e9),
      menge_ab: (a, b) => (b.menge ?? -1) - (a.menge ?? -1),
    };
    return liste.sort(s[this._invSort] || s.kategorie);
  },

  _invHtml() {
    const inv = this._inv();
    const f = this._invF;
    const stueck = inv.reduce((s, t) => s + (t.menge || 0), 0);
    const wenig = inv.filter(wenigBestand).length;
    const opt = (w, t, an) => `<option value="${esc(w)}" ${an === w ? "selected" : ""}>${esc(t)}</option>`;
    const anzahl = Object.values(f).filter(Boolean).length;
    const aktiv = anzahl || this._invSuche;
    const kats = KATEGORIEN.map((k) => {
      const teile = inv.filter((t) => t.kat === k.id);
      return `<button class="kat ${f.kat === k.id ? "an" : ""}" data-aktion="inv-kat" data-id="${k.id}">
        <span class="kat-icon">${k.icon}</span><strong>${k.name}</strong>
        <small>${teile.length} Sorten · ${zahl(teile.reduce((s, t) => s + (t.menge || 0), 0))} Stück</small></button>`;
    }).join("");
    const filter = `
      ${this._invAuswahl("Kategorie", "kat", "Alle Kategorien", KATEGORIEN.map((k) => opt(k.id, k.name, f.kat)).join(""))}
      ${this._invAuswahl("Gewinde", "gewinde", "Alle Gewinde", GEWINDE.filter((g) => inv.some((t) => t.gewinde === g)).map((g) => opt(g, g, f.gewinde)).join(""))}
      ${this._invAuswahl("Status", "status", "Jeder Status", INV_STATUS.map((s) => opt(s.id, s.name, f.status)).join(""))}`;
    return `
      <section class="stats inv-stats">
        <div class="stat"><strong>${inv.length}</strong><span>Sorten</span></div>
        <div class="stat"><strong>${zahl(stueck)}</strong><span>Teile gesamt</span></div>
        ${this._mobil ? "" : `<div class="stat ${wenig ? "rot" : ""}"><strong>${wenig}</strong><span>wenig Bestand</span></div>
        <div class="stat amber"><strong>${inv.filter((t) => t.menge == null).length}</strong><span>Menge fehlt</span></div>`}
      </section>
      <section class="kats">${kats}</section>
      <section class="werkzeug">
        <button class="chip alle ${aktiv ? "" : "an"}" data-aktion="inv-alle">Alle</button>
        ${this._mobil ? `<button class="auswahl filter-knopf ${anzahl ? "an" : ""}" data-aktion="filter-auf"><span>Filter</span><strong>${anzahl ? `${anzahl} aktiv` : "Keiner"}</strong></button>` : ""}
        ${!this._mobil || this._filterAuf ? `<div class="unterfilter" data-einmal="filter">${filter}</div>` : ""}
        <label class="auswahl sort"><span>Sortieren</span>
          <select id="inv-sortierung">${INV_SORTIERUNG.map((s) => opt(s.id, s.name, this._invSort)).join("")}</select></label>
        <input id="inv-suche" class="suche" type="search" placeholder="Suchen: z. B. M3x12, Feder 5 mm, Einsatz M4 …" value="${esc(this._invSuche || "")}" autocomplete="off">
      </section>
      <section id="inv-raster">${this._invRasterHtml()}</section>`;
  },

  _invAuswahl(name, k, leer, optionen) {
    return `<label class="auswahl ${this._invF[k] ? "an" : ""}"><span>${name}</span>
      <select data-inv-filter="${k}"><option value="">${leer}</option>${optionen}</select></label>`;
  },

  _invRasterHtml() {
    const liste = this._invGefiltert();
    let html = liste.length
      ? `<div class="raster">${liste.map((t) => this._invKachelHtml(t)).join("")}</div>`
      : `<div class="leer-hinweis">Nichts gefunden.</div>`;
    // Querverweise: passende Teile zu den Treffern, die selbst nicht in der Liste sind
    if (this._invSuche && liste.length) {
      const dabei = new Set(liste.map((t) => t.id));
      const passend = [];
      liste.forEach((t) => passendeTeile(t, this._inv()).forEach((x) => { if (!dabei.has(x.id) && !passend.includes(x)) passend.push(x); }));
      if (passend.length) {
        html += `<h3 class="passend-titel">🔗 Passt dazu</h3><div class="chips">${passend.slice(0, 12).map((x) =>
          `<button class="chip" data-aktion="inv-oeffnen" data-id="${esc(x.id)}">${kategorie(x.kat).icon} ${esc(teilName(x))} · ${x.menge ?? "?"} Stk</button>`).join("")}</div>`;
      }
    }
    return html;
  },

  _invKachelHtml(t) {
    const wenig = wenigBestand(t);
    return `<button class="kachel teil ${wenig ? "wenig" : ""}" data-aktion="inv-oeffnen" data-id="${esc(t.id)}">
      ${wenig ? `<span class="badge-offen rot-badge">wenig</span>` : ""}
      <div class="teil-bild">${teilSvg(t)}</div>
      <div class="kachel-name">${esc(teilName(t))}</div>
      <div class="kachel-sub">${esc(teilUntertitel(t))}</div>
      <div class="kachel-fuss">
        <span class="mat" style="--m:var(--leise)">${esc(kategorie(t.kat).einzahl)}</span>
        <span class="rest ${t.menge == null ? "leise" : wenig ? "rot" : ""}">${t.menge == null ? "Menge fehlt" : `${zahl(t.menge)} Stk${t.gezaehlt ? "" : " *"}`}</span>
      </div>
    </button>`;
  },

  _invSheetHtml() {
    const t = this._teil();
    if (!t) return "";
    const neu = this._modus === "inv-neu";
    const k = kategorie(t.kat);
    const passend = neu ? [] : passendeTeile(t, this._inv());
    const masse = masseFuer(t);
    let html = "";
    if (neu) {
      html += `<h3 class="abschnitt">1 · Was ist es?</h3>
        <div class="chips">${KATEGORIEN.map((x) => `<button class="chip ${t.kat === x.id ? "an" : ""}" data-aktion="inv-neu-kat" data-id="${x.id}">${x.icon} ${x.einzahl}</button>`).join("")}</div>`;
      if (t.kat === "magnet") html += `<div class="chips oben-abstand">${["rund", "quader"].map((f) => `<button class="chip ${t.form === f ? "an" : ""}" data-aktion="inv-neu-form" data-id="${f}">${f === "rund" ? "Scheibe (rund)" : "Quader"}</button>`).join("")}</div>`;
      html += `<h3 class="abschnitt">2 · Maße</h3>`;
    }
    html += `<div class="zeichnung">${teilSvg(t, true)}</div>`;
    if (k.gewinde) {
      html += `<div class="rechner-block"><div class="r-kopf"><span>Gewinde</span><strong>${esc(t.gewinde)}</strong></div>
        <div class="chips">${GEWINDE.map((g) => `<button class="chip ${t.gewinde === g ? "an" : ""}" data-aktion="inv-gewinde" data-id="${g}">${g}</button>`).join("")}</div></div>`;
    }
    if (masse.length) {
      html += `<div class="gruppe auf"><div class="gruppe-inhalt ohne-rand">${masse.map((f) => {
        const auf = neu || this._offeneZeilen.has(`inv-${f.k}`);
        return `<div class="zeile eigen ${auf ? "auf" : ""}" data-zeile="inv-${f.k}">
          <button class="zeile-kopf" data-aktion="zeile" data-k="inv-${f.k}"><span class="z-name">${f.name}</span>
            <span class="z-wert"><span class="wert">${zahl(t[f.k], f.nk ?? 0)} ${f.e}</span></span></button>
          ${auf ? `<div class="klapp" data-klapp="z:inv-${f.k}"><div class="regler-zeile">
            <button class="rund" data-aktion="inv-schritt" data-k="${f.k}" data-d="-1">−</button>
            <input type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${t[f.k] ?? f.min}" data-inv-mass="${f.k}">
            <button class="rund" data-aktion="inv-schritt" data-k="${f.k}" data-d="1">+</button></div></div>` : ""}
        </div>`;
      }).join("")}</div></div>`;
      if (t.kat === "schraube") {
        const n = NORM[t.gewinde] || NORM.M3;
        html += this._invNormHtml(t, n);
      }
    } else if (t.kat === "mutter" || t.kat === "scheibe") {
      html += `<p class="leise klein">Maße nach Norm (${t.kat === "mutter" ? "DIN 934" : "DIN 125"}), gelten für alle ${esc(t.gewinde)}-${t.kat === "mutter" ? "Muttern" : "Scheiben"}.</p>`;
    }
    if (t.kat === "magnet" && t.form !== "folie") html += `<div class="hinweis klein">💡 Loch im Druck für ${t.form === "rund" ? "Ø" : "Maß"} ${zahl(t.durchmesser, 2)} mm: etwa ${zahl(t.durchmesser + 0.15, 2)} mm einplanen (Richtwert, je nach Drucker 0,1–0,2 mm Zugabe).</div>`;
    if (t.kat === "feder" || neu) {
      html += `<label class="formular-zeile">Fach / Lagerort<input class="text" data-inv-text="fach" value="${esc(t.fach || "")}" placeholder="z. B. R1F3 oder Schublade 2"></label>`;
    }

    // Menge
    html += `${neu ? `<h3 class="abschnitt">3 · Menge</h3>` : ""}
      <div class="rechner-block menge-block">
        <div class="r-kopf"><span>Menge</span><strong id="inv-menge">${t.menge == null ? "–" : `${zahl(t.menge)} Stück`}</strong></div>
        <div class="regler-zeile mengen-knoepfe">
          <button class="rund" data-aktion="inv-menge" data-d="-10">−10</button>
          <button class="rund" data-aktion="inv-menge" data-d="-1">−1</button>
          <button class="rund" data-aktion="inv-menge" data-d="1">+1</button>
          <button class="rund" data-aktion="inv-menge" data-d="10">+10</button>
        </div>
        ${!neu && !t.gezaehlt && t.menge != null ? `<div class="hinweis klein">* Menge laut ${esc(t.quelle || "Lieferumfang")}, noch nicht nachgezählt. <button class="mini mint-rand" data-aktion="inv-gezaehlt">Stimmt, nachgezählt ✓</button></div>` : ""}
        <div class="r-kopf oben-abstand"><span>Warnen ab (Mindestbestand)</span><strong id="inv-min">${t.min ? `${t.min} Stück` : "aus"}</strong></div>
        <input type="range" min="0" max="100" step="1" value="${t.min || 0}" data-inv-min="1">
      </div>`;

    if (passend.length) {
      html += `<h3>🔗 Passt dazu (${esc(t.gewinde)})</h3><div class="chips">${passend.map((x) =>
        `<button class="chip" data-aktion="inv-oeffnen" data-id="${esc(x.id)}">${kategorie(x.kat).icon} ${esc(teilName(x))} · ${x.menge ?? "?"} Stk</button>`).join("")}</div>`;
    }
    if (!neu) {
      const info = [["Material", t.material], ["Kopf", t.kopf], ["Quelle", t.quelle], ["Shop", t.shop], ["Preis", t.preis ? `${zahl(t.preis, 2)} € für ${t.kat === "einsatz" ? 50 : ""} Stück`.replace("für  Stück", "") : null], ["Drucker", t.drucker]]
        .filter(([, v]) => v);
      if (info.length) html += `<h3>Infos</h3><div class="info-liste">${info.map(([n, v]) => `<div class="info-zeile"><span>${n}</span><strong>${esc(v)}</strong></div>`).join("")}</div>`;
      html += `<h3>Notizen</h3><textarea data-inv-text="notiz" rows="3" placeholder="z. B. wofür gebraucht, nachbestellen bei …">${esc(t.notiz || "")}</textarea>
        <button class="knopf rot-knopf breit oben-abstand" data-aktion="inv-loeschen">Teil löschen</button>`;
    }

    return `<div class="schleier" data-aktion="schliessen" data-einmal="schleier"></div>
      <section class="sheet" data-einmal="sheet-${this._modus}" role="dialog" aria-label="${esc(teilName(t))}">
        <div class="griff"></div>
        <header class="sheet-kopf">
          <div class="teil-kopf-bild">${teilSvg(t)}</div>
          <div class="sheet-titel"><h2>${neu ? `Neues Teil: ${esc(teilName(t))}` : esc(teilName(t))}</h2>
            <div class="sub">${esc(teilUntertitel(t))}</div>
            <span class="pille mint">${k.icon} ${k.einzahl}</span></div>
          <button class="icon-knopf" data-aktion="schliessen" aria-label="Schließen">✕</button>
        </header>
        <div class="sheet-inhalt">${html}</div>
        ${neu ? `<footer class="sheet-fuss"><button class="knopf leise" data-aktion="schliessen">Abbrechen</button>
          <button class="knopf" data-aktion="inv-anlegen">Teil anlegen</button></footer>` : ""}
      </section>`;
  },

  _invNeuStarten() {
    this._invNeu = { id: "neu", kat: "schraube", gewinde: "M3", laenge: 10, kopf: "Zylinderkopf Innensechskant", menge: 10, gezaehlt: true, min: null, notiz: "", fach: "" };
    this._modus = "inv-neu";
    this._sheetScroll = 0;
  },

  _invNeuKat(kat) {
    const v = { schraube: { gewinde: "M3", laenge: 10, kopf: "Zylinderkopf Innensechskant" }, mutter: { gewinde: "M3" }, scheibe: { gewinde: "M3" },
      einsatz: { gewinde: "M3", laenge: 5, aussen: 5, material: "Messing" }, feder: { draht: 0.4, aussen: 5, laenge: 20, material: "Edelstahl" },
      duese: { groesse: 0.4, drucker: "Bambu Lab P1S", material: "" }, magnet: { form: "rund", durchmesser: 6, breite: 6, dicke: 2 } }[kat];
    this._invNeu = { id: "neu", kat, menge: this._invNeu.menge, gezaehlt: true, min: null, notiz: "", fach: this._invNeu.fach || "", ...v };
  },

  // Gibt true zurück, wenn der Klick zum Inventar gehörte
  _invKlick(a, el) {
    const t = this._teil();
    const speichernWennAlt = () => { if (this._modus !== "inv-neu") this._speichern(); };
    switch (a) {
      case "inv-kat": this._invF = { ...this._invF, kat: this._invF.kat === el.dataset.id ? "" : el.dataset.id }; break;
      case "inv-alle": this._invF = { kat: "", gewinde: "", status: "" }; this._invSuche = ""; break;
      case "inv-oeffnen":
        this._modus = "inv-detail"; this._invOffen = el.dataset.id; this._offeneZeilen.clear(); this._sheetScroll = 0;
        break;
      case "inv-neu-kat": this._invNeuKat(el.dataset.id); break;
      case "inv-neu-form": this._invNeu.form = el.dataset.id; break;
      case "inv-gewinde": t.gewinde = el.dataset.id; speichernWennAlt(); break;
      case "inv-schritt": {
        const f = masseFuer(t).find((x) => x.k === el.dataset.k);
        const schritt = (f.nk ?? 0) >= 2 ? f.step * 10 : f.step;   // feine Regler, gröbere Knöpfe
        this._invMassSetzen(f, (t[f.k] ?? f.min) + Number(el.dataset.d) * schritt, true);
        return true;
      }
      case "inv-menge": {
        t.menge = Math.max(0, (t.menge || 0) + Number(el.dataset.d));
        const anz = this.shadowRoot.getElementById("inv-menge");
        if (anz) anz.textContent = `${zahl(t.menge)} Stück`;
        speichernWennAlt();
        return true;
      }
      case "inv-gezaehlt": t.gezaehlt = true; speichernWennAlt(); break;
      case "inv-loeschen":
        if (!confirm(`${teilName(t)} wirklich löschen?`)) return true;
        this._daten.inventar = this._inv().filter((x) => x !== t);
        this._modus = null; this._invOffen = null;
        this._speichern();
        this._toast(`${teilName(t)} gelöscht.`);
        return true;
      case "inv-anlegen": {
        const n = { ...this._invNeu, id: `${this._invNeu.kat}-${Date.now().toString(36)}`, angelegt_am: new Date().toISOString() };
        this._inv().push(n);
        this._modus = null; this._invNeu = null;
        this._speichern();
        this._toast(`${teilName(n)} angelegt.`);
        return true;
      }
      default: return false;
    }
    this._zeichnen();
    return true;
  },

  _invMassSetzen(f, v, slider) {
    const t = this._teil();
    v = Math.max(f.min, Math.min(f.max, Math.round(v / f.step) * f.step));
    t[f.k] = Number(v.toFixed((f.nk ?? 0) + 1));
    const zeile = this.shadowRoot.querySelector(`[data-zeile="inv-${f.k}"]`);
    if (zeile) {
      zeile.querySelector(".wert").textContent = `${zahl(t[f.k], f.nk ?? 0)} ${f.e}`;
      if (slider) { const i = zeile.querySelector("input"); if (i) i.value = t[f.k]; }
    }
    const bild = this.shadowRoot.querySelector(".zeichnung");
    if (bild) bild.innerHTML = teilSvg(t, true);
    const titel = this.shadowRoot.querySelector(".sheet-titel h2");
    if (titel) titel.textContent = this._modus === "inv-neu" ? `Neues Teil: ${teilName(t)}` : teilName(t);
    if (this._modus !== "inv-neu") this._speichern();
  },

  _invEingabe(t) {
    if (t.id === "inv-suche") {
      this._invSuche = t.value;
      const r = this.shadowRoot.getElementById("inv-raster");
      if (r) r.innerHTML = this._invRasterHtml();
      return true;
    }
    if (t.dataset.invMass) {
      const f = masseFuer(this._teil()).find((x) => x.k === t.dataset.invMass);
      this._invMassSetzen(f, Number(t.value), false);
      return true;
    }
    if (t.dataset.invMin) {
      const teil = this._teil();
      teil.min = Number(t.value) || null;
      const anz = this.shadowRoot.getElementById("inv-min");
      if (anz) anz.textContent = teil.min ? `${teil.min} Stück` : "aus";
      return true;
    }
    if (t.dataset.invText) { this._teil()[t.dataset.invText] = t.value; return true; }
    return false;
  },

  // Maße zum Konstruieren (Kopf, Loch, Senkung) mit Normangabe
  _invNormHtml(t, n) {
    const z = (v) => zahl(v, 1);
    const zeile = (name, wert, norm) => `<div class="info-zeile"><span>${name}<small class="norm">${norm}</small></span><strong>${wert}</strong></div>`;
    return `<h3>📐 Zum Konstruieren (${esc(t.gewinde)})</h3><div class="info-liste">
      ${zeile("Kopfdurchmesser dk", `${z(n.kopf_d)} mm`, "DIN 912 / ISO 4762")}
      ${zeile("Kopfhöhe k", `${z(n.kopf_h)} mm`, "DIN 912 / ISO 4762")}
      ${zeile("Innensechskant", `SW ${z(n.inbus)}`, "DIN 912 / ISO 4762")}
      ${zeile("Durchgangsloch", `Ø ${z(n.loch)} mm`, "DIN EN 20273, mittel")}
      ${zeile("Senkung für den Kopf", `Ø ${z(n.senk_d)} × ${z(n.kopf_h + 0.4)} mm tief`, "Richtwert, vgl. DIN 974-1")}
    </div>
    <p class="leise klein">Maße nach DIN 912 / ISO 4762 (Zylinderschraube mit Innensechskant). Durchgangsloch nach DIN EN 20273 (ISO 273), Reihe mittel. Die Senkung ist ein Richtwert (Ø mit Spiel, Tiefe = Kopfhöhe + 0,4 mm, damit der Kopf bündig verschwindet); die genauen Werte stehen in DIN 974-1. Für den 3D-Druck Löcher etwa 0,1–0,2 mm größer zeichnen.</p>`;
  },

  _invAenderung(t) {
    if (t.dataset.invFilter != null) { this._invF = { ...this._invF, [t.dataset.invFilter]: t.value }; this._zeichnen(); return true; }
    if (t.id === "inv-sortierung") { this._invSort = t.value; this._zeichnen(); return true; }
    if ((t.dataset.invMin || t.dataset.invText) && this._modus !== "inv-neu") { this._speichern(); return true; }
    return false;
  },
};
// ---------------------------------------------------------------------------
// Drucker: Live-Ansicht des Bambu Lab P1S und der Steckdose aus Home Assistant,
// Kamera und Druckverlauf (Liste „3D-Drucke“, von der Automation befüllt)
// ---------------------------------------------------------------------------

const DR_GERAET = "3D-Drucker P1S";
const DR_STECKDOSE = "3d-Drucker";
const DR_LISTE = "todo.3d_drucke";

// Anzeigename in Home Assistant → vermutete Entity-ID (Rückfall, falls der Name anders lautet)
const DR_ENTITAETEN = {
  status: ["Druckstatus", "sensor.p1s_01p00c572701906_druckstatus"],
  schritt: ["Aktueller Arbeitsschritt", "sensor.p1s_01p00c572701906_aktueller_arbeitsschritt"],
  name: ["Name der Aufgabe", "sensor.p1s_01p00c572701906_name_der_aufgabe"],
  fortschritt: ["Druckfortschritt", "sensor.p1s_01p00c572701906_druckfortschritt"],
  schicht: ["Aktuelle Schicht", "sensor.p1s_01p00c572701906_aktuelle_schicht"],
  schichten: ["Gesamtzahl der Schichten", "sensor.p1s_01p00c572701906_gesamtzahl_der_schichten"],
  rest_h: ["Verbleibende Zeit", "sensor.p1s_01p00c572701906_verbleibende_zeit"],
  start: ["Startzeit", "sensor.p1s_01p00c572701906_startzeit"],
  ende: ["Endzeit", "sensor.p1s_01p00c572701906_endzeit"],
  gewicht: ["Gewicht des Drucks", "sensor.p1s_01p00c572701906_gewicht_des_drucks"],
  laenge: ["Drucklänge", "sensor.p1s_01p00c572701906_drucklange"],
  duese: ["Temperatur der Düse", "sensor.p1s_01p00c572701906_temperatur_der_duse"],
  duese_ziel: ["Zieltemperatur der Düse", "sensor.p1s_01p00c572701906_zieltemperatur_der_duse"],
  bett: ["Druckbetttemperatur", "sensor.p1s_01p00c572701906_druckbetttemperatur"],
  bett_ziel: ["Zieltemperatur vom Druckbett", "sensor.p1s_01p00c572701906_zieltemperatur_vom_druckbett"],
  l_bauteil: ["Bauteillüfterdrehzahl", "sensor.p1s_01p00c572701906_bauteillufterdrehzahl"],
  l_kopf: ["Druckkopflüfterdrehzahl", "sensor.p1s_01p00c572701906_druckkopflufterdrehzahl"],
  l_raum: ["Druckraumlüfterdrehzahl", "sensor.p1s_01p00c572701906_druckraumlufterdrehzahl"],
  l_hotend: ["Hotendlüfterdrehzahl", "sensor.p1s_01p00c572701906_hotendlufterdrehzahl"],
  duese_mm: ["Düsengröße", "sensor.p1s_01p00c572701906_dusengrosse"],
  duese_typ: ["Düsentyp", "sensor.p1s_01p00c572701906_dusentyp"],
  platte: ["Druckbett Typ", "sensor.p1s_01p00c572701906_druckbett_typ"],
  stunden: ["Gesamtnutzung", "sensor.p1s_01p00c572701906_gesamtnutzung"],
  wlan: ["Wi-Fi-Signalqualität", "sensor.p1s_01p00c572701906_wi_fi_signalqualitat"],
  tempo: ["Geschwindigkeitsprofil", "sensor.p1s_01p00c572701906_geschwindigkeitsprofil"],
  online: ["Online", "binary_sensor.p1s_01p00c572701906_online"],
  hms: ["HMS-Fehler", "binary_sensor.p1s_01p00c572701906_hms_fehler"],
  fehler: ["Druckfehler", "binary_sensor.p1s_01p00c572701906_druckfehler"],
  firmware: ["Firmware Status", "binary_sensor.p1s_01p00c572701906_firmware_status"],
  filament: ["Extruder Filament Status", "binary_sensor.p1s_01p00c572701906_extruder_filament_status"],
  licht: ["Druckraumbeleuchtung", "light.p1s_01p00c572701906_druckraumbeleuchtung"],
  kamera: ["Kamera", "camera.p1s_01p00c572701906_kamera"],
  titelbild: ["Titelbild", "image.p1s_01p00c572701906_titelbild"],
};
const DR_STECKDOSE_ENTITAETEN = {
  schalter: ["", "switch.3d_drucker"],
  watt: ["Derzeitiger Verbrauch", "sensor.3d_drucker_derzeitiger_verbrauch"],
  heute: ["Heutiger Verbrauch", "sensor.3d_drucker_heutiger_verbrauch"],
  monat: ["Der Verbrauch dieses Monats", "sensor.3d_drucker_der_verbrauch_dieses_monats"],
};

const DR_STATUS = {
  idle: ["Bereit", "leise"], running: ["Druckt", "mint"], pause: ["Pausiert", "amber"], prepare: ["Bereitet vor", "mint"],
  slicing: ["Bereitet vor", "mint"], finish: ["Fertig", "mint"], failed: ["Fehlgeschlagen", "rot"], offline: ["Offline", "leise"],
};
const DR_SCHRITTE = {
  printing: "Druckt", idle: "Bereit", heatbed_preheating: "Heizt das Druckbett vor", heating_hotend: "Heizt die Düse auf",
  auto_bed_leveling: "Druckbett vermessen", scanning_bed_surface: "Druckbett scannen", homing_toolhead: "Druckkopf fährt in Grundstellung",
  cleaning_nozzle_tip: "Reinigt die Düsenspitze", checking_extruder_temperature: "Prüft die Düsentemperatur",
  calibrating_extrusion: "Kalibriert den Fluss", calibrating_extrusion_flow: "Kalibriert den Fluss", calibrating_motor_noise: "Kalibriert die Motoren",
  calibrating_micro_lidar: "Kalibriert den Lidar", inspecting_first_layer: "Prüft die erste Schicht", identifying_build_plate_type: "Erkennt die Druckplatte",
  changing_filament: "Filamentwechsel", filament_loading: "Lädt Filament", filament_unloading: "Entlädt Filament",
  paused_user: "Von dir pausiert", paused_filament_runout: "Pause: Filament leer", paused_front_cover_falling: "Pause: Frontabdeckung",
  paused_nozzle_temperature_malfunction: "Pause: Problem mit der Düsentemperatur", paused_heat_bed_temperature_malfunction: "Pause: Problem mit der Betttemperatur",
  paused_skipped_step: "Pause: Schrittverlust", paused_first_layer_error: "Pause: Fehler in der ersten Schicht", m400_pause: "Pause per G-Code",
};
const DR_PLATTEN = { textured_plate: "Textured PEI Plate", cool_plate: "Cool Plate/PLA Plate", engineering_plate: "Engineering Plate",
  hot_plate: "Smooth PEI Plate / High Temp Plate", supertack_plate: "Bambu Cool Plate SuperTack" };
const DR_DUESEN = { hardened_steel: "Gehärteter Stahl", stainless_steel: "Edelstahl" };

// Beschreibung eines Druckeintrags „schluessel=wert; …“ lesen
function druckDaten(eintrag) {
  const d = {};
  String(eintrag.description || "").split(/[;\n]/).forEach((teil) => {
    const i = teil.indexOf("=");
    if (i > 0) d[teil.slice(0, i).trim()] = teil.slice(i + 1).trim();
  });
  const [name, zeit] = String(eintrag.summary || "").split(" · ");
  const num = (v) => (v == null || v === "" || isNaN(Number(v)) ? null : Number(v));
  return {
    uid: eintrag.uid || eintrag.summary, titel: eintrag.summary, name: name || "Druck", zeit: zeit || "",
    gewicht: num(d.gewicht_g), laenge: num(d.laenge_m), duese_c: num(d.duese_c), bett_c: num(d.bett_c), duese_mm: num(d.duese_mm),
    start: d.start && d.start !== "unknown" ? d.start : null, ende: d.ende || null, status: d.status || "laeuft", fortschritt: num(d.fortschritt),
    erledigt: eintrag.status === "completed",
  };
}

// Dateiname des Endfotos wie in der Automation: Startzeit (Ortszeit) als JJJJ-MM-TT_HH-MM
function fotoName(druck) {
  const t = druck.start ? new Date(druck.start) : null;
  if (!t || isNaN(t)) return null;
  const p = (n) => String(n).padStart(2, "0");
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}_${p(t.getHours())}-${p(t.getMinutes())}`;
}

function ringSvg(prozent, farbe = "var(--mint)") {
  const r = 52, u = 2 * Math.PI * r, p = Math.max(0, Math.min(100, prozent || 0));
  return `<svg viewBox="0 0 120 120" class="ring" aria-hidden="true">
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="9"/>
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="${farbe}" stroke-width="9" stroke-linecap="round"
      stroke-dasharray="${(u * p) / 100} ${u}" transform="rotate(-90 60 60)" style="filter: drop-shadow(0 0 6px ${farbe})"/>
  </svg>`;
}

const DruckerAnsicht = {
  // Entität finden: zuerst über den Anzeigenamen, sonst über die vermutete ID
  _drId(schluessel, steckdose = false) {
    const states = (this._hass && this._hass.states) || {};
    if (this._drCache !== states) {
      this._drCache = states;
      this._drNamen = {};
      for (const [id, s] of Object.entries(states)) {
        const n = s.attributes && s.attributes.friendly_name;
        if (n) this._drNamen[`${id.split(".")[0]}|${n}`] = id;
      }
      this._drIds = {};
    }
    const k = (steckdose ? "s:" : "") + schluessel;
    if (k in this._drIds) return this._drIds[k];
    const [name, id] = (steckdose ? DR_STECKDOSE_ENTITAETEN : DR_ENTITAETEN)[schluessel];
    const voll = steckdose ? (name ? `${DR_STECKDOSE} ${name}` : DR_STECKDOSE) : `${DR_GERAET} ${name}`;
    const gefunden = this._drNamen[`${id.split(".")[0]}|${voll}`] || (states[id] ? id : null);
    this._drIds[k] = gefunden;
    return gefunden;
  },
  _drS(schluessel, steckdose = false) {
    const id = this._drId(schluessel, steckdose);
    return id ? this._hass.states[id] : null;
  },
  _drW(schluessel, steckdose = false) {
    const s = this._drS(schluessel, steckdose);
    return s && !["unknown", "unavailable", ""].includes(s.state) ? s.state : null;
  },
  _drZ(schluessel, steckdose = false) {
    const w = this._drW(schluessel, steckdose);
    return w == null || isNaN(Number(w)) ? null : Number(w);
  },

  // Zustand: aus (Steckdose), startet (Steckdose an, Drucker noch nicht online), bereit, druckt …
  _drZustand() {
    const steckdose = this._drW("schalter", true);
    const online = this._drW("online") === "on";
    if (steckdose === "off") return "aus";
    if (!online) return steckdose === "on" ? "startet" : "offline";
    return this._drW("status") || "idle";
  },

  // Bei jeder Änderung in Home Assistant höchstens einmal pro Sekunde neu zeichnen
  _drHassNeu() {
    if (this._ansicht !== "drucker" || this._modus || this._dialog || this._ddOffen) return;
    if (this._drTimer) return;
    this._drTimer = setTimeout(() => { this._drTimer = null; this._drLiveZeichnen(); }, 1000);
  },
  _drLiveZeichnen() {
    if (this._ansicht !== "drucker") return;
    const live = this.shadowRoot.getElementById("dr-live");
    if (!live) return;
    const zustand = this._drZustand();
    if (zustand !== this._drLetzterZustand) { this._zeichnen(); return; }   // z. B. eingeschaltet: alles neu
    live.innerHTML = this._drLiveHtml();
    this._drKameraPruefen();
  },

  _drHtml() {
    if (!this._drVerlauf && !this._drVerlaufLaedt) this._drVerlaufLaden();
    const zustand = this._drZustand();
    this._drLetzterZustand = zustand;
    setTimeout(() => this._drKameraPruefen(), 0);
    return `<div class="dr-raster">
        <div class="dr-spalte">
          <section id="dr-live" class="dr-live">${this._drLiveHtml()}</section>
        </div>
        <div class="dr-spalte">
          ${this._drKameraHtml(zustand)}
          ${this._drVerlaufHtml()}
        </div>
      </div>`;
  },

  _drLiveHtml() {
    const zustand = this._drZustand();
    const z = (k, nk = 0) => { const v = this._drZ(k); return v == null ? "–" : zahl(v, nk); };
    let html = "";

    if (zustand === "aus" || zustand === "startet" || zustand === "offline") {
      const text = zustand === "aus" ? ["Drucker ist aus", "Die Steckdose ist ausgeschaltet. Schalte sie ein, dann erscheinen hier nach etwa 15–30 Sekunden die Werte."]
        : zustand === "startet" ? ["Drucker startet …", "Die Steckdose ist an. Der Drucker meldet sich meist nach 15–30 Sekunden. Bis dahin sind die Werte vom letzten Druck."]
        : ["Drucker nicht erreichbar", "Home Assistant bekommt gerade keine Werte vom Drucker (Bambu-Cloud oder WLAN)."];
      html += `<div class="dr-karte dr-aus"><div class="dr-aus-icon">${zustand === "startet" ? '<span class="dreher"></span>' : "⏻"}</div>
        <div><h2>${text[0]}</h2><p class="leise">${text[1]}</p></div></div>`;
    } else {
      const [statusText, statusFarbe] = DR_STATUS[zustand] || [zustand, "leise"];
      const schritt = this._drW("schritt");
      const druckt = ["running", "pause", "prepare", "slicing"].includes(zustand);
      const fortschritt = this._drZ("fortschritt") || 0;
      const restH = this._drZ("rest_h");
      const ende = this._drW("ende");
      const bild = this._drS("titelbild");
      const bildUrl = druckt && bild && bild.attributes.entity_picture;
      const name = this._drW("name");
      const restText = restH == null ? "–" : restH >= 1 ? `${Math.floor(restH)} h ${Math.round((restH % 1) * 60)} min` : `${Math.round(restH * 60)} min`;
      const endeText = ende && !isNaN(new Date(ende)) ? new Date(ende).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "–";
      html += `<div class="dr-karte dr-status">
        <div class="dr-ring">${ringSvg(druckt || zustand === "finish" ? fortschritt : 0, statusFarbe === "rot" ? "var(--rot)" : statusFarbe === "amber" ? "var(--amber)" : "var(--mint)")}
          <div class="dr-ring-text"><strong>${druckt || zustand === "finish" ? `${zahl(fortschritt)} %` : "–"}</strong><span>${druckt ? `Schicht ${z("schicht")}/${z("schichten")}` : ""}</span></div></div>
        <div class="dr-status-text">
          <span class="pille ${statusFarbe}">${statusText}</span>
          <h2>${druckt || zustand === "finish" || zustand === "failed" ? esc(name || "Druck") : "Bereit zum Drucken"}</h2>
          ${schritt && schritt !== "idle" && schritt !== "printing" ? `<p class="leise">${esc(DR_SCHRITTE[schritt] || schritt.replace(/_/g, " "))}</p>` : ""}
          ${druckt ? `<div class="dr-werte"><div><span>Restzeit</span><strong>${restText}</strong></div><div><span>Fertig um</span><strong>${endeText}</strong></div>
            <div><span>Gewicht</span><strong>${z("gewicht", 1)} g</strong></div></div>` : ""}
        </div>
        ${bildUrl ? `<img class="dr-titelbild" src="${esc(bildUrl)}" alt="">` : ""}
      </div>`;
      if (this._drW("hms") === "on" || this._drW("fehler") === "on") {
        html += `<div class="hinweis rot-hinweis">⚠️ Der Drucker meldet einen Fehler. Details stehen in der Bambu-App bzw. am Drucker.</div>`;
      }
    }

    const aus = ["aus", "startet", "offline"].includes(zustand);
    // Temperaturen
    const temp = (titel, ist, ziel, max) => {
      const i = this._drZ(ist), s = this._drZ(ziel);
      const heizt = s && i != null && Math.abs(s - i) > 3;
      const breite = Math.max(0, Math.min(100, ((i || 0) / max) * 100));
      return `<div class="dr-temp">
        <div class="dr-temp-kopf"><span>${titel}</span><strong>${i == null ? "–" : zahl(i)} °C</strong></div>
        <div class="dr-balken"><i style="width:${breite}%;background-size:${breite > 0 ? 10000 / breite : 100}% 100%"></i>${s ? `<b style="left:${Math.min(100, (s / max) * 100)}%"></b>` : ""}</div>
        <small class="${heizt ? "amber" : "leise"}">${s ? `Ziel ${zahl(s)} °C${heizt ? (s > i ? " · heizt auf" : " · kühlt ab") : " · erreicht"}` : "aus"}</small>
      </div>`;
    };
    if (!aus) html += `<div class="dr-karte"><h3 class="dr-titel">🌡️ Temperaturen</h3>
      ${temp("Düse", "duese", "duese_ziel", 300)}${temp("Druckbett", "bett", "bett_ziel", 110)}</div>`;

    // Lüfter
    const luefter = [["Bauteil", "l_bauteil"], ["Druckkopf", "l_kopf"], ["Hotend", "l_hotend"], ["Druckraum", "l_raum"]].filter(([, k]) => this._drId(k));
    if (luefter.length && !aus) {
      html += `<div class="dr-karte"><h3 class="dr-titel">🌀 Lüfter</h3><div class="dr-luefter">${luefter.map(([n, k]) => {
        const v = this._drZ(k) || 0;
        return `<div class="dr-l"><span class="dr-l-icon ${v > 0 ? "dreht" : ""}" style="--dauer:${v > 0 ? Math.max(0.25, 2 - v / 60) : 0}s">✣</span><strong>${zahl(v)} %</strong><small>${n}</small></div>`;
      }).join("")}</div></div>`;
    }

    // Strom aus der Steckdose
    const w = this._drZ("watt", true);
    html += `<div class="dr-karte"><h3 class="dr-titel">⚡ Strom</h3><div class="dr-werte dr-werte-3">
      <div><span>Jetzt</span><strong>${w == null ? "–" : `${zahl(w, w < 10 ? 1 : 0)} W`}</strong></div>
      <div><span>Heute</span><strong>${this._drZ("heute", true) == null ? "–" : `${zahl(this._drZ("heute", true), 2)} kWh`}</strong></div>
      <div><span>Diesen Monat</span><strong>${this._drZ("monat", true) == null ? "–" : `${zahl(this._drZ("monat", true), 2)} kWh`}</strong></div>
    </div><p class="leise klein">Steckdose: ${this._drW("schalter", true) === "on" ? "an" : this._drW("schalter", true) === "off" ? "aus" : "nicht gefunden"}</p></div>`;

    // Drucker-Infos
    const wlan = this._drZ("wlan");
    const wlanText = wlan == null ? "–" : `${wlan >= -60 ? "sehr gut" : wlan >= -70 ? "gut" : wlan >= -80 ? "mäßig" : "schwach"} (${zahl(wlan)} dBm)`;
    const info = [
      ["Düse", `${this._drW("duese_mm") ? `${zahl(Number(this._drW("duese_mm")), 1)} mm` : "–"} · ${DR_DUESEN[this._drW("duese_typ")] || this._drW("duese_typ") || "–"}`],
      ["Druckplatte", DR_PLATTEN[this._drW("platte")] || this._drW("platte") || "–"],
      ["Filament im Extruder", this._drW("filament") === "on" ? "eingelegt" : this._drW("filament") === "off" ? "keins" : "–"],
      ["Betriebsstunden", this._drZ("stunden") == null ? "–" : `${zahl(this._drZ("stunden"))} h`],
      ["WLAN", wlanText],
      ["Firmware", this._drW("firmware") === "on" ? "Update verfügbar" : this._drW("firmware") === "off" ? "aktuell" : "–"],
    ];
    html += `<div class="dr-karte"><h3 class="dr-titel">🖨️ Bambu Lab P1S</h3><div class="info-liste">${info.map(([n, v]) =>
      `<div class="info-zeile"><span>${n}</span><strong class="${v === "Update verfügbar" ? "amber" : ""}">${esc(v)}</strong></div>`).join("")}</div></div>`;
    return html;
  },

  // ---- Kamera: Standbild alle 10 s, auf Wunsch live -----------------------
  _drKameraHtml(zustand) {
    const an = !["aus", "startet", "offline"].includes(zustand) && this._drS("kamera");
    return `<div class="dr-karte dr-kamera-karte">
      <div class="dr-kamera-kopf"><h3 class="dr-titel">📷 Kamera</h3>
        ${an ? `<button class="chip ${this._drLive ? "an" : ""}" data-aktion="dr-live">${this._drLive ? "● Live" : "Live ansehen"}</button>` : ""}</div>
      <div class="dr-kamera">${an ? `<img id="dr-kamera-bild" alt="Kamerabild">` : `<div class="dr-kamera-leer">${zustand === "aus" ? "Drucker ist aus" : "Kein Bild"}</div>`}</div>
      ${an && !this._drLive ? `<p class="leise klein">Standbild, wird alle 10 Sekunden erneuert.</p>` : ""}
    </div>`;
  },
  _drKameraPruefen() {
    const img = this.shadowRoot.getElementById("dr-kamera-bild");
    const s = this._drS("kamera");
    clearTimeout(this._drKameraTimer);
    if (!img || !s) return;
    const token = s.attributes.access_token;
    const id = s.entity_id || this._drId("kamera");
    const url = this._drLive
      ? (token ? `/api/camera_proxy_stream/${id}?token=${token}` : s.attributes.entity_picture)
      : `${token ? `/api/camera_proxy/${id}?token=${token}` : s.attributes.entity_picture}${(token ? "&" : (s.attributes.entity_picture || "").includes("?") ? "&" : "?")}t=${Date.now()}`;
    if (this._drLive) { if (img.dataset.url !== url) { img.src = url; img.dataset.url = url; } return; }
    // Neues Bild erst laden, dann tauschen (kein Flackern)
    const neu = new Image();
    neu.onload = () => { if (img.isConnected) img.src = neu.src; };
    neu.src = url;
    if (!img.src) img.src = url;
    this._drKameraTimer = setTimeout(() => this._drKameraPruefen(), 10000);
  },

  // ---- Druckverlauf ------------------------------------------------------
  async _drVerlaufLaden() {
    this._drVerlaufLaedt = true;
    try {
      const r = await this._hass.callWS({ type: "todo/item/list", entity_id: DR_LISTE });
      this._drVerlauf = (r.items || []).map(druckDaten).sort((a, b) => (b.start || "").localeCompare(a.start || ""));
      this._drVerlaufFehler = null;
    } catch (e) {
      this._drVerlauf = [];
      this._drVerlaufFehler = e.message || String(e);
    }
    this._drVerlaufLaedt = false;
    if (this._ansicht === "drucker") this._zeichnen();
    this._drFotosLaden();
  },
  async _drFotosLaden() {
    this._drFotos = this._drFotos || {};
    for (const d of (this._drVerlauf || []).slice(0, 12)) {
      const f = fotoName(d);
      if (!f || f in this._drFotos) continue;
      this._drFotos[f] = null;
      try {
        const r = await this._hass.callWS({ type: "media_source/resolve_media", media_content_id: `media-source://media_source/local/3d-drucke/${f}.jpg` });
        this._drFotos[f] = r && r.url ? r.url : null;
        const img = this.shadowRoot.querySelector(`[data-foto="${f}"]`);
        if (img && r && r.url) img.innerHTML = `<img src="${esc(r.url)}" alt="">`;
      } catch (e) { /* kein Foto vorhanden */ }
    }
  },

  _drVerlaufHtml() {
    const liste = this._drVerlauf;
    let inhalt;
    if (!liste) inhalt = `<div class="leise klein">Lade Druckverlauf …</div>`;
    else if (this._drVerlaufFehler) inhalt = `<div class="hinweis amber">Die Liste „3D-Drucke“ konnte nicht gelesen werden: ${esc(this._drVerlaufFehler)}</div>`;
    else if (!liste.length) inhalt = `<div class="leise klein">Noch keine Drucke aufgezeichnet. Die Automation trägt jeden Druck automatisch ein.</div>`;
    else {
      const zeige = this._drAlle ? liste : liste.slice(0, 8);
      inhalt = `<div class="dr-verlauf">${zeige.map((d) => {
        const f = fotoName(d);
        const foto = f && this._drFotos && this._drFotos[f];
        const extra = (this._daten.drucke || {})[d.uid] || {};
        const [st, farbe] = d.status === "finish" ? ["fertig", "mint"] : d.status === "failed" ? ["fehlgeschlagen", "rot"] : d.status === "laeuft" ? ["ohne Abschluss", "amber"] : [d.status, "leise"];
        return `<button class="dr-druck" data-aktion="dr-druck" data-uid="${esc(d.uid)}">
          <span class="ld-bild" data-foto="${esc(f || "")}">${foto ? `<img src="${esc(foto)}" alt="">` : "🖼️"}</span>
          <span class="dr-druck-text"><strong>${esc(d.name)}</strong>
            <small>${esc(d.zeit)}${d.gewicht != null ? ` · ${zahl(d.gewicht, 1)} g` : ""}${d.duese_mm ? ` · ${zahl(d.duese_mm, 1)} mm Düse` : ""}</small>
            ${extra.kommentar ? `<small class="dr-kommentar">💬 ${esc(extra.kommentar)}</small>` : ""}</span>
          <span class="pille ${farbe}">${st}</span>
        </button>`;
      }).join("")}</div>
      ${liste.length > 8 ? `<button class="mini mint-rand" data-aktion="dr-alle">${this._drAlle ? "Weniger zeigen" : `Alle ${liste.length} Drucke zeigen`}</button>` : ""}`;
    }
    return `<div class="dr-karte"><div class="dr-kamera-kopf"><h3 class="dr-titel">🗂️ Druckverlauf</h3>
      <button class="chip" data-aktion="dr-neu-laden">↻ Aktualisieren</button></div>${inhalt}</div>`;
  },

  _drDialogHtml() {
    const d = (this._drVerlauf || []).find((x) => x.uid === this._drOffen);
    if (!d) return "";
    const extra = (this._daten.drucke || {})[d.uid] || {};
    const f = fotoName(d);
    const foto = f && this._drFotos && this._drFotos[f];
    const zeile = (n, v) => (v == null || v === "" ? "" : `<div class="info-zeile"><span>${n}</span><strong>${esc(v)}</strong></div>`);
    const dauer = d.start && d.ende ? Math.round((new Date(d.ende) - new Date(d.start)) / 60000) : null;
    return `<h2>${esc(d.name)}</h2><p class="leise">${esc(d.zeit)}</p>
      ${foto ? `<img class="dr-foto-gross" src="${esc(foto)}" alt="Endfoto">` : ""}
      <div class="info-liste oben-abstand">
        ${zeile("Ergebnis", d.status === "finish" ? "fertig" : d.status === "failed" ? "fehlgeschlagen" : d.status === "laeuft" ? "ohne Abschluss" : d.status)}
        ${zeile("Fortschritt am Ende", d.fortschritt != null ? `${zahl(d.fortschritt)} %` : null)}
        ${zeile("Dauer", dauer != null && dauer > 0 ? (dauer >= 60 ? `${Math.floor(dauer / 60)} h ${dauer % 60} min` : `${dauer} min`) : null)}
        ${zeile("Gewicht (Slicer)", d.gewicht != null ? `${zahl(d.gewicht, 1)} g` : null)}
        ${zeile("Länge", d.laenge != null ? `${zahl(d.laenge, 2)} m` : null)}
        ${zeile("Düse / Bett", d.duese_c ? `${zahl(d.duese_c)} °C / ${zahl(d.bett_c)} °C` : null)}
        ${zeile("Düse", d.duese_mm ? `${zahl(d.duese_mm, 1)} mm` : null)}
      </div>
      <h3>Kommentar</h3>
      <textarea id="dr-kommentar" rows="4" placeholder="z. B. warum abgebrochen, was du gelernt hast …">${esc(extra.kommentar || "")}</textarea>
      <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="dialog-zu">Schließen</button>
        <button class="knopf" data-aktion="dr-kommentar-speichern">Speichern</button></div>`;
  },

  _drKlick(a, el) {
    switch (a) {
      case "dr-live": this._drLive = !this._drLive; break;
      case "dr-alle": this._drAlle = !this._drAlle; break;
      case "dr-neu-laden": this._drVerlauf = null; this._drVerlaufLaden(); break;
      case "dr-druck": this._drOffen = el.dataset.uid; this._dialog = "dr-druck"; break;
      case "dr-kommentar-speichern": {
        const text = (this.shadowRoot.getElementById("dr-kommentar").value || "").trim();
        this._daten.drucke = this._daten.drucke || {};
        this._daten.drucke[this._drOffen] = { ...(this._daten.drucke[this._drOffen] || {}), kommentar: text };
        this._dialog = null;
        this._speichern();
        this._toast("Kommentar gespeichert.");
        return;
      }
      default: return;
    }
    this._zeichnen();
  },
};
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
