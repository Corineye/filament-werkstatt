// Filament-Werkstatt – automatisch aus src/ gebaut (sh build.sh). Nicht direkt bearbeiten.
// ---------------------------------------------------------------------------
// Startdaten: Corins Rollen aus Filament_Settings.xlsx (Stand 12.10.2026)
// „eigen“ = Werte, die Corin selbst eingetragen hat.
// „vorschlag“ = Richtwerte für alles, was noch fehlt. Sie werden in der
// Oberfläche anders eingefärbt, bis Corin sie übernimmt oder ändert.
// ---------------------------------------------------------------------------

const DATEN_VERSION = 2;

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
  };
}

// Ältere gespeicherte Daten auf den aktuellen Aufbau bringen
function migrieren(d) {
  if ((d.version || 1) < 2) {
    d.rollen.forEach((r) => { r.vorschlag = { ...richtwerteFuer(r.material, r.art), ...r.vorschlag }; });
    d.spulen.forEach((s) => { const std = SPULEN.find((x) => x.id === s.id); if (!s.hersteller) s.hersteller = std ? std.hersteller : s.name; });
  }
  if (!d.materialien_eigen) d.materialien_eigen = [];
  if (!d.arten_eigen) d.arten_eigen = {};
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
  height: 100%;
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
  position: relative; height: 100%; display: flex; flex-direction: column; overflow: hidden;
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

.haupt { flex: 1; overflow-y: auto; padding: 24px; position: relative; z-index: 1; }
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
.sheet-inhalt { flex: 1; overflow-y: auto; padding: 16px 20px 24px; }
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
.auswahl span { font-size: 10px; text-transform: uppercase; letter-spacing: .6px; color: var(--leise); }
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
select.text { appearance: auto; }
select.text option { background: #111816; }

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
.dialog { max-height: calc(100% - 40px); overflow-y: auto; }
.liste { display: grid; gap: 8px; margin: 12px 0; }
.wahl.kompakt { padding: 10px 14px; margin: 0; }
.wahl.an { border-color: rgba(62,230,168,.6); background: var(--mint-weich); }
.neu-spule { margin: 8px 0 14px; padding-top: 12px; border-top: 1px solid var(--rand); }
.neu-spule .text { margin: 0; }
.oben-abstand { margin-top: 16px; }
.dialog .chips { margin-top: 10px; }
`;
// ---------------------------------------------------------------------------
// Die Seite selbst: ein Web-Component, das Home Assistant als Panel lädt.
// Daten liegen in Home Assistant (frontend/user_data), also in den HA-Backups.
// ---------------------------------------------------------------------------

const VERSION = "0.3.0";
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
      this.shadowRoot.addEventListener("click", (e) => this._klick(e));
      this.shadowRoot.addEventListener("input", (e) => this._eingabe(e));
      this.shadowRoot.addEventListener("change", (e) => this._aenderung(e));
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
    this._toastTimer = setTimeout(() => { this._toastText = null; this._zeichnen(); }, 2600);
    this._zeichnen();
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
      case "neu": this._neuStarten(); break;
      case "schliessen": if (!this._schliessen()) return; break;
      case "tab":
        if (this._tab === "rest" && this._rechnerGeaendert()) this._toast(this._restSpeichern(false));
        this._tab = el.dataset.id; this._sheetScroll = 0;
        break;
      case "gruppe": {
        const g = el.dataset.id;
        this._gruppen.has(g) ? this._gruppen.delete(g) : this._gruppen.add(g);
        break;
      }
      case "zeile": {
        const k = el.dataset.k;
        if (!this._bearbeiten) this._bearbeitenStarten(rolle, false);
        this._offeneZeilen.has(k) ? this._offeneZeilen.delete(k) : this._offeneZeilen.add(k);
        break;
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
    if (this._modus === "neu") {
      if (!confirm("Neues Filament verwerfen?")) return false;
    } else if (this._bearbeiten) {
      if (!confirm("Geänderte Einstellungen verwerfen?")) return false;
    } else if (this._tab === "rest" && this._rechnerGeaendert()) {
      this._toastText = this._restSpeichern(false);
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => { this._toastText = null; this._zeichnen(); }, 2600);
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
    const fokusSuche = root.activeElement && root.activeElement.id === "suche";

    root.innerHTML = `<style>${STIL}</style>
      <div class="app ${this._mobil ? "mobil" : ""}">
        ${this._kopfHtml()}
        <main class="haupt">${this._inhaltHtml()}</main>
        ${this._ansicht === "filament" && this._daten && !this._modus ? `<button class="fab" data-aktion="neu" aria-label="Filament hinzufügen" title="Filament hinzufügen">+</button>` : ""}
        ${this._mobil ? this._navHtml("unten") : ""}
        ${this._modus === "detail" ? this._sheetHtml() : ""}
        ${this._modus === "neu" ? this._neuSheetHtml() : ""}
        ${this._dialogHtml()}
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
        ${!this._mobil || this._filterAuf ? `<div class="unterfilter">
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
    return `<div class="schleier" data-aktion="schliessen"></div>
      <section class="sheet" role="dialog" aria-label="${esc(r.name)}">
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
            ${auf ? `<div class="regler-zeile">
              <button class="rund" data-aktion="schritt" data-k="${f.k}" data-d="-1" aria-label="weniger">−</button>
              <input type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${w.v ?? f.min}" data-feld="${f.k}">
              <button class="rund" data-aktion="schritt" data-k="${f.k}" data-d="1" aria-label="mehr">+</button>
            </div>` : ""}
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
        ${auf ? `<select class="text" data-platte="1">${PLATTEN.map((p) => `<option ${p === w.v ? "selected" : ""}>${esc(p)}</option>`).join("")}</select>` : ""}
      </div>`);
  }

  _gruppeHtml(id, icon, name, zusammenfassung, nurVorschlag, inhalt) {
    const auf = this._gruppen.has(id);
    return `<div class="gruppe ${auf ? "auf" : ""}">
      <button class="gruppe-kopf" data-aktion="gruppe" data-id="${id}">
        <span class="g-icon">${icon}</span><span class="g-name">${name}</span>
        <span class="g-zus ${nurVorschlag ? "amber" : ""}">${zusammenfassung}</span><span class="pfeil">›</span>
      </button>
      ${auf ? `<div class="gruppe-inhalt">${inhalt}</div>` : ""}
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
    return `<div class="schleier" data-aktion="schliessen"></div>
      <section class="sheet" role="dialog" aria-label="Neues Filament">
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
    return `<div class="schleier oben" data-aktion="dialog-zu"></div><div class="dialog" role="dialog">${inhalt}</div>`;
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

if (!customElements.get("filament-werkstatt-panel")) {
  customElements.define("filament-werkstatt-panel", FilamentWerkstattPanel);
}
