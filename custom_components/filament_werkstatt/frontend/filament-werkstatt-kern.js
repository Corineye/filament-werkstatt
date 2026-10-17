// Filament-Werkstatt – automatisch aus src/ gebaut (sh build.sh). Nicht direkt bearbeiten.
// ---------------------------------------------------------------------------
// Startdaten: Corins Rollen aus Filament_Settings.xlsx (Stand 12.10.2026)
// „eigen“ = Werte, die Corin selbst eingetragen hat.
// „vorschlag“ = Richtwerte für alles, was noch fehlt. Sie werden in der
// Oberfläche anders eingefärbt, bis Corin sie übernimmt oder ändert.
// ---------------------------------------------------------------------------

const DATEN_VERSION = 4;

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
    ...werkstattStandard(),
  };
}

// Neu in Version 4: Verbuchen, Werkstatt, Wartung, Einstellungen
const EINSTELLUNGEN_STANDARD = {
  strompreis: 0.35,      // €/kWh
  linie_g: 0.3,          // Anfangslinie + Reinigung am Druckstart (je Druck)
  extruder_g: 0.1,       // 3 Extruder-Fahrten vor dem Druck (je Druck)
  wechsel_g: 0.15,       // Reststück Schneider → Düse beim Rollenwechsel (alte Rolle)
  mindest_g: 250,        // Einkaufsliste: unter dieser Menge je Farbe + Material nachkaufen
  mindest_material_g: 500,
  korrektur: {},         // Faktor je Material aus dem Abgleich beim Wiegen
  sicherung_am: null,
  sicherung_spaeter: null,
  sicherung_start: null, // erste Erinnerung eine Woche nach dem ersten Start
};
function werkstattStandard() {
  return {
    einstellungen: { ...JSON.parse(JSON.stringify(EINSTELLUNGEN_STANDARD)), sicherung_start: new Date().toISOString() },
    drucke: {},
    letzte_rolle: null,
    geladen: null,        // Rolle, die gerade im Drucker steckt (ID), null = kein Filament geladen
    buchen_ab: new Date().toISOString(),   // ältere Drucke nicht nachfragen
    warteschlange: [],
    abgleich: [],
    wartung: { aufgaben: {}, teile: null },
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
  const w = werkstattStandard();
  for (const k of Object.keys(w)) if (d[k] == null) d[k] = w[k];
  d.einstellungen = { ...EINSTELLUNGEN_STANDARD, ...d.einstellungen };
  if (!d.einstellungen.sicherung_start) d.einstellungen.sicherung_start = new Date().toISOString();
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
// Wissen: Fehlerbilder, Kalibrierung, P1S-Zeichnung, Trockner, Wartung.
// Wird von Hilfe, Fehldruck-Fragen, Werkstatt und Nerd-Menü gemeinsam genutzt.
// ---------------------------------------------------------------------------

// Kleine Zeichnungen der Fehlerbilder (120 × 80)
const FB_FARBE = "#3ee6a8", FB_ROT = "#ff6b6b", FB_GRAU = "#2a3330";
const fbBild = (inhalt) => `<svg viewBox="0 0 120 80" class="fb-bild" aria-hidden="true"><rect x="0" y="70" width="120" height="10" fill="${FB_GRAU}"/>${inhalt}</svg>`;
const FB_ZEICHNUNG = {
  haftung: fbBild(`<path d="M30 70 L32 40 L88 36 L92 62 Z" fill="${FB_FARBE}" opacity=".85" transform="rotate(-8 60 60)"/><path d="M20 70 q10 -6 20 0" stroke="${FB_ROT}" stroke-width="2" fill="none"/><text x="96" y="30" fill="${FB_ROT}" font-size="14">↑</text>`),
  warping: fbBild(`<path d="M22 62 Q22 70 28 70 L92 70 Q98 70 98 62 L98 34 L22 34 Z" fill="${FB_FARBE}" opacity=".85"/><path d="M22 62 Q16 60 14 54 M98 62 Q104 60 106 54" stroke="${FB_ROT}" stroke-width="3" fill="none"/><path d="M14 54 L22 34 M106 54 L98 34" stroke="${FB_FARBE}" stroke-width="2"/>`),
  spaghetti: fbBild(`<rect x="40" y="50" width="40" height="20" fill="${FB_FARBE}" opacity=".85"/><path d="M45 50 C30 20 70 40 60 15 C55 5 90 25 75 45 C65 60 100 30 95 10 M50 48 C40 30 25 40 30 20" stroke="${FB_FARBE}" stroke-width="1.6" fill="none"/>`),
  verschiebung: fbBild(`<rect x="30" y="52" width="50" height="18" fill="${FB_FARBE}" opacity=".85"/><rect x="44" y="30" width="50" height="22" fill="${FB_FARBE}" opacity=".85"/><path d="M80 52 L94 52" stroke="${FB_ROT}" stroke-width="2"/><text x="96" y="62" fill="${FB_ROT}" font-size="11">→</text>`),
  unterextrusion: fbBild(`<rect x="25" y="22" width="70" height="48" fill="none" stroke="${FB_FARBE}" stroke-width="1"/>${[26, 32, 38, 44, 50, 56, 62].map((y, i) => `<path d="M25 ${y} H95" stroke="${FB_FARBE}" stroke-width="3.5" stroke-dasharray="${i % 2 ? "9 5" : "14 4"}"/>`).join("")}`),
  faeden: fbBild(`<rect x="18" y="26" width="18" height="44" fill="${FB_FARBE}" opacity=".85"/><rect x="84" y="26" width="18" height="44" fill="${FB_FARBE}" opacity=".85"/>${[32, 40, 47, 55].map((y) => `<path d="M36 ${y} Q60 ${y + 8} 84 ${y - 2}" stroke="${FB_FARBE}" stroke-width=".8" fill="none"/>`).join("")}`),
  feucht: fbBild(`<rect x="25" y="28" width="70" height="42" fill="${FB_FARBE}" opacity=".85"/>${[[35, 40], [55, 36], [72, 48], [45, 58], [82, 34], [64, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#0b1210"/>`).join("")}<text x="98" y="26" fill="#5cc8ff" font-size="13">💧</text>`),
  verstopft: fbBild(`<path d="M50 6 h20 v18 l-6 10 h-8 l-6 -10 z" fill="#8da49a"/><circle cx="60" cy="38" r="3" fill="${FB_ROT}"/><path d="M40 70 v-8 h40 v8" fill="${FB_FARBE}" opacity=".85"/><text x="72" y="48" fill="${FB_ROT}" font-size="12">✕</text>`),
  stuetzen: fbBild(`<rect x="20" y="22" width="80" height="10" fill="${FB_FARBE}" opacity=".85"/><rect x="20" y="32" width="12" height="38" fill="${FB_FARBE}" opacity=".85"/><path d="M60 70 V50 M75 70 V44 M90 70 V56" stroke="#4fe08a" stroke-width="2"/><path d="M58 44 l6 6 M73 38 l6 6" stroke="${FB_ROT}" stroke-width="2"/><path d="M55 32 q10 8 20 0 q10 10 25 2" stroke="${FB_FARBE}" stroke-width="1.5" fill="none"/>`),
  trennung: fbBild(`<rect x="30" y="54" width="60" height="16" fill="${FB_FARBE}" opacity=".85"/><rect x="30" y="24" width="60" height="26" fill="${FB_FARBE}" opacity=".85"/><path d="M28 52 L40 51 L50 53 L62 50 L74 53 L92 51" stroke="${FB_ROT}" stroke-width="2.2" fill="none"/>`),
  elefantenfuss: fbBild(`<path d="M34 24 H86 V62 Q92 66 94 70 H26 Q28 66 34 62 Z" fill="${FB_FARBE}" opacity=".85"/><path d="M26 70 Q28 64 34 62 M94 70 Q92 64 86 62" stroke="${FB_ROT}" stroke-width="2.5" fill="none"/>`),
  pickel: fbBild(`<rect x="25" y="24" width="70" height="46" fill="${FB_FARBE}" opacity=".85"/>${[[40, 34], [70, 30], [55, 50], [82, 58], [34, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#b9f5dd"/>`).join("")}`),
  geisterbild: fbBild(`<rect x="25" y="24" width="70" height="46" fill="${FB_FARBE}" opacity=".85"/><path d="M40 34 v26 M44 34 v26 M48 34 v26" stroke="#0b1210" stroke-width="1.2" opacity=".6"/><text x="56" y="52" fill="#0b1210" font-size="16" font-weight="700">B</text><text x="61" y="52" fill="#0b1210" font-size="16" font-weight="700" opacity=".35">B</text>`),
  naht: fbBild(`<rect x="30" y="22" width="60" height="48" rx="8" fill="${FB_FARBE}" opacity=".85"/><path d="M62 22 v48" stroke="#b9f5dd" stroke-width="2.5" stroke-dasharray="3 2"/>`),
};

// Fehlerbilder mit Ursachen und konkreten Änderungen an den Rollenwerten.
// aenderung: k = Feld aus FELDER, d = Änderung (absolut) oder f = Faktor, min/max = Grenzen
const FEHLERBILDER = [
  { id: "haftung", name: "Löst sich vom Bett", kurz: "Teil hat sich gelöst oder verschoben",
    ursachen: ["Druckbett fettig (Fingerabdrücke)", "Bett zu kalt", "Erste Schicht zu schnell", "Falsche Platte für das Material"],
    loesungen: [
      { text: "Platte mit Spülmittel und warmem Wasser waschen, danach nicht mehr anfassen." },
      { text: "Betttemperatur etwas erhöhen", aenderung: { k: "bett", d: 5, max: 110 } },
      { text: "Erste Schicht langsamer drucken", aenderung: { k: "v_erste", d: -10, min: 15 } },
      { text: "Rand (Brim) 5 mm in Bambu Studio einschalten, vor allem bei kleinen Kontaktflächen." },
    ] },
  { id: "warping", name: "Ecken heben sich (Verzug)", kurz: "Ecken biegen sich nach oben",
    ursachen: ["Material schrumpft beim Abkühlen (ASA, ABS, PETG)", "Zugluft oder offene Haube", "Lüfter zu stark"],
    loesungen: [
      { text: "Bauteillüfter maximal reduzieren", aenderung: { k: "luefter_max", d: -20, min: 0 } },
      { text: "Betttemperatur erhöhen", aenderung: { k: "bett", d: 5, max: 110 } },
      { text: "Haube und Tür geschlossen lassen, Drucker vorher 10 min aufheizen lassen." },
      { text: "Rand (Brim) oder Mausohren an den Ecken setzen." },
    ] },
  { id: "spaghetti", name: "Fadensalat (Spaghetti)", kurz: "Druck hängt in der Luft, Fäden überall",
    ursachen: ["Teil hat sich gelöst", "Stützen fehlen oder sind umgekippt", "Überhang zu steil"],
    loesungen: [
      { text: "Haftung prüfen (siehe „Löst sich vom Bett“)." },
      { text: "Stützen einschalten, Baum-Stützen für Überhänge über 45°." },
      { text: "Teil so drehen, dass die größte flache Seite auf dem Bett liegt." },
    ] },
  { id: "verschiebung", name: "Schichtverschiebung", kurz: "Obere Schichten sind seitlich versetzt",
    ursachen: ["Düse ist gegen ein hochgebogenes Teil gestoßen", "Zu schnell oder zu hohe Beschleunigung", "Riemen locker"],
    loesungen: [
      { text: "Außen- und Innenwand langsamer", aenderung: { k: "v_innen", f: 0.8, min: 20 } },
      { text: "Füllung langsamer", aenderung: { k: "v_fuellung", f: 0.8, min: 20 } },
      { text: "Z-Hop beim Verfahren in Bambu Studio einschalten (Prozess › Andere › Z-Hop)." },
      { text: "Riemenspannung prüfen (Wartung)." },
    ] },
  { id: "unterextrusion", name: "Lücken (zu wenig Material)", kurz: "Wände löchrig, Linien dünn",
    ursachen: ["Max. Volumenstrom zu hoch für das Material", "Düse teilweise verstopft", "Temperatur zu niedrig", "Rolle hakt"],
    loesungen: [
      { text: "Max. Volumenstrom senken", aenderung: { k: "max_vol", d: -2, min: 2 } },
      { text: "Düsentemperatur etwas erhöhen", aenderung: { k: "duese", d: 5, max: 300 } },
      { text: "Flow Ratio kalibrieren (Hilfe › Kalibrierung)." },
      { text: "Prüfen, ob die Rolle frei abrollt und nichts verknotet ist." },
    ] },
  { id: "faeden", name: "Fäden (Stringing)", kurz: "Feine Fäden zwischen Teilen",
    ursachen: ["Filament feucht", "Düse zu heiß", "Rückzug zu kurz"],
    loesungen: [
      { text: "Rolle trocknen (Werte siehe Trockner-Hilfe)." },
      { text: "Düsentemperatur senken", aenderung: { k: "duese", d: -5, min: 170 } },
      { text: "Rückzug in Bambu Studio um 0,2 mm erhöhen." },
    ] },
  { id: "feucht", name: "Blasen, Knacken, raue Oberfläche", kurz: "Knistert beim Drucken, Bläschen",
    ursachen: ["Filament hat Feuchtigkeit gezogen (PETG, TPU, PA besonders)"],
    loesungen: [
      { text: "Rolle trocknen, danach luftdicht mit Trockenmittel lagern." },
      { text: "Beim Drucken direkt aus dem Trockner ziehen." },
    ] },
  { id: "verstopft", name: "Kein Filament kommt", kurz: "Düse verstopft oder Extruder rutscht",
    ursachen: ["Düse verstopft (Wood-PLA in 0,2 mm, Kohle im Hotend)", "Hitzestau bei PLA in warmer Kammer", "Filament gerissen"],
    loesungen: [
      { text: "Kaltzug (Cold Pull) machen oder Düse tauschen." },
      { text: "Bei PLA Tür oder Haube einen Spalt öffnen (Hitzestau)." },
      { text: "Düsentemperatur etwas erhöhen", aenderung: { k: "duese", d: 5, max: 300 } },
    ] },
  { id: "stuetzen", name: "Stützen versagen", kurz: "Stützen kippen oder lösen sich",
    ursachen: ["Zu dünne Baumstützen", "Kleine Auflage auf dem Bett"],
    loesungen: [
      { text: "„Baum stark“ oder „Normal“ statt „Baum schlank“ wählen." },
      { text: "Rand für Stützen einschalten (Stützen › Rand)." },
    ] },
  { id: "trennung", name: "Schichten trennen sich", kurz: "Teil bricht entlang der Schichten",
    ursachen: ["Düse zu kalt", "Lüfter zu stark", "Material feucht"],
    loesungen: [
      { text: "Düsentemperatur erhöhen", aenderung: { k: "duese", d: 5, max: 300 } },
      { text: "Bauteillüfter reduzieren", aenderung: { k: "luefter_max", d: -20, min: 0 } },
      { text: "Bei ASA/ABS Haube geschlossen lassen." },
    ] },
  { id: "elefantenfuss", name: "Elefantenfuß", kurz: "Unterste Schichten stehen über",
    ursachen: ["Bett zu heiß", "Erste Schicht zu dick gequetscht"],
    loesungen: [
      { text: "Betttemperatur senken", aenderung: { k: "bett", d: -5, min: 0 } },
      { text: "„Elefantenfuß-Kompensation“ in Bambu Studio auf 0,15 mm setzen." },
    ] },
  { id: "pickel", name: "Pickel und Kleckse", kurz: "Kleine Knubbel auf der Oberfläche",
    ursachen: ["Zu viel Material (Flow)", "Naht verteilt auf „Zufällig“", "Feuchtes Filament"],
    loesungen: [
      { text: "Flow Ratio leicht senken", aenderung: { k: "flow", d: -0.02, min: 0.85 } },
      { text: "Nahtposition auf „Ausgerichtet“ oder „Hinten“ stellen." },
    ] },
  { id: "geisterbild", name: "Wellen hinter Kanten (Ghosting)", kurz: "Echo-Muster nach Ecken",
    ursachen: ["Schwingungen bei hoher Geschwindigkeit", "Lockere Riemen"],
    loesungen: [
      { text: "Außenwand langsamer", aenderung: { k: "v_aussen", f: 0.8, min: 20 } },
      { text: "Vibrations-Kalibrierung am Drucker neu laufen lassen." },
    ] },
  { id: "naht", name: "Sichtbare Naht", kurz: "Senkrechte Linie, wo jede Schicht beginnt",
    ursachen: ["Druckaufbau in der Düse am Anfang und Ende der Wand (Pressure Advance / K-Faktor)", "Ungünstige Nahtposition (z. B. „Nächste“ auf glatten Flächen)"],
    loesungen: [
      { text: "Flussdynamik (K-Faktor) kalibrieren (Hilfe › Kalibrierung)." },
      { text: "Naht in eine Ecke legen: Nahtposition „Ausgerichtet“." },
    ] },
];
const fehlerbild = (id) => FEHLERBILDER.find((f) => f.id === id);

// Was eine Änderung konkret bedeutet: aktueller Wert → neuer Wert
function aenderungRechnen(rolle, a) {
  const alt = wert(rolle, a.k).v;
  if (alt == null) return null;
  let neu = a.f != null ? alt * a.f : alt + a.d;
  if (a.min != null) neu = Math.max(a.min, neu);
  if (a.max != null) neu = Math.min(a.max, neu);
  const f = FELDER.find((x) => x.k === a.k);
  const st = f ? f.step : 1;
  neu = Math.round(neu / st) * st;
  if (Math.abs(neu - alt) < 1e-9) return null;
  return { k: a.k, alt, neu, feld: f };
}

// Fragenkatalog für Fehldrucke
const FEHL_FRAGEN = {
  wann: [
    { id: "erste", name: "Erste Schicht", hinweis: "Fast immer Haftung: Bett sauber, Temperatur, erste Schicht." },
    { id: "frueh", name: "Im ersten Drittel", hinweis: "Häufig Haftung oder Verzug, der langsam die Ecken anhebt." },
    { id: "mitte", name: "Mittendrin", hinweis: "Oft Stützen, Kollision mit hochgebogenen Teilen oder verstopfte Düse." },
    { id: "spaet", name: "Gegen Ende", hinweis: "Hitzestau, Verzug bei hohen Teilen oder Filament fast leer/feucht." },
  ],
  extra: [
    { id: "getrocknet", frage: "War die Rolle frisch getrocknet?", ja: null, nein: "feucht" },
    { id: "bett_sauber", frage: "War das Druckbett frisch gereinigt?", ja: null, nein: "haftung" },
    { id: "haube", frage: "War die Haube/Tür geschlossen?", ja: null, nein: "warping" },
  ],
};
// Aus Fortschritt (%) eine Antwort für „Wann?“ vorschlagen
const wannAusFortschritt = (p) => (p == null ? null : p < 3 ? "erste" : p < 33 ? "frueh" : p < 80 ? "mitte" : "spaet");

// Temperaturturm: unterste (heißeste) Stufe passend zur Düsentemperatur der Rolle
const kalTempOben = (r) => { const d = r && wert(r, "duese").v; return d ? Math.round((d + 15) / 5) * 5 : 230; };
// Platzhalter in Kalibrier-Texten mit Werten der Beispielrolle füllen
function kalText(s, r) {
  const oben = kalTempOben(r);
  return s.replace(/\{t_hoch\}/g, oben).replace(/\{t_tief\}/g, oben - 25).replace(/\{material\}/g, (r && r.material) || "PLA");
}

// Kalibrierungen (Bambu Studio › Kalibrierung)
const KALIBRIERUNGEN = [
  { id: "temp", name: "Temperaturturm", feld: "duese", icon: "🌡️",
    wozu: "Findet die beste Düsentemperatur für eine Rolle: sauber, ohne Fäden, mit fester Schichthaftung.",
    so: ["Bambu Studio › Kalibrierung › Temperatur.", "Material wählen, Bereich vorgeben (z. B. {t_hoch} → {t_tief} °C bei {material}).", "Drucken. Jede Stufe hat eine andere Temperatur."],
    achten: ["Unten heiß, oben kalt: die Stufe mit sauberen Brücken, wenig Fäden und ohne Lücken wählen.", "Turm oben abbrechen: wenn er leicht bricht, ist es zu kalt."],
    fehler: ["Fäden an den heißen Stufen (zu heiß oder feucht)", "Brücken hängen durch", "Turm bricht bei kalten Stufen"],
    bild: (r) => { const oben = kalTempOben(r); return `<svg viewBox="0 0 120 90" class="kal-bild"><rect x="0" y="82" width="120" height="8" fill="#2a3330"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="38" y="${70 - i * 13}" width="44" height="12" fill="hsl(${10 + i * 28} 70% 55%)"/><text x="88" y="${79 - i * 13}" font-size="7" fill="#8da49a">${oben - i * 5}°</text>`).join("")}</svg>`; } },
  { id: "flow", name: "Flow Rate", feld: "flow", icon: "💧",
    wozu: "Stimmt, wie viel Material gefördert wird. Zu viel macht Pickel und raue Deckflächen, zu wenig Lücken.",
    so: ["Bambu Studio › Kalibrierung › Flow-Rate › Durchgang 1.", "Die glatteste Fläche wählen und die Zahl eintragen.", "Optional Durchgang 2 für die Feinabstimmung."],
    achten: ["Mit dem Finger über die Oberflächen fahren: die glatteste ohne Rillen und ohne Wülste.", "Bei Lücken zwischen den Linien ist der Wert zu klein."],
    fehler: ["Deckfläche mit Rillen (zu wenig)", "Wülste und Pickel (zu viel)", "Flächen unterscheiden sich kaum: Material feucht oder Temperatur falsch"],
    bild: `<svg viewBox="0 0 120 90" class="kal-bild"><rect x="0" y="82" width="120" height="8" fill="#2a3330"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<rect x="${8 + (i % 3) * 36}" y="${10 + Math.floor(i / 3) * 24}" width="30" height="20" rx="3" fill="#3ee6a8" opacity="${i === 4 ? 1 : 0.45}"/>`).join("")}</svg>` },
  { id: "k", name: "Flussdynamik (K-Faktor)", feld: "k", icon: "📈",
    wozu: "Gleicht den Druck in der Düse beim Beschleunigen und Bremsen aus. Saubere Ecken, gleichmäßige Wände, weniger Naht.",
    so: ["Bambu Studio › Kalibrierung › Flussdynamik › Manuell (Linien-Methode).", "Die Linie mit der gleichmäßigsten Breite wählen.", "Den K-Wert eintragen und in Bambu Studio als PA-Profil speichern."],
    achten: ["Gerade, gleich breite Linie ohne dicken Anfang und dünnes Ende.", "Bei 0,2-mm-Düse und TPU ist der Wert anders, eigenes Profil anlegen."],
    fehler: ["Dicke Ecken und Wulst an der Naht (K zu klein)", "Lücken nach Ecken (K zu groß)"],
    bild: `<svg viewBox="0 0 120 90" class="kal-bild"><rect x="0" y="82" width="120" height="8" fill="#2a3330"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M10 ${12 + i * 12} H40 L${40 + 4} ${12 + i * 12} H110" stroke="#3ee6a8" stroke-width="${i === 3 ? 3 : 2 + Math.abs(i - 3) * 0.6}" opacity="${i === 3 ? 1 : 0.5}" stroke-dasharray="${i < 3 ? "30 2 80 0" : "30 4 80 0"}"/>`).join("")}</svg>` },
  { id: "maxvol", name: "Max. Volumenstrom", feld: "max_vol", icon: "🚀",
    wozu: "Wie viel mm³/s die Düse schmelzen kann, bevor Lücken entstehen. Begrenzt das Tempo, damit der Druck nicht unterextrudiert.",
    so: ["Bambu Studio › Kalibrierung › Max. Volumenstrom.", "Turm drucken, die Höhe ablesen, ab der die Wand Lücken bekommt.", "Höhe × Schritt + Start ergibt den Wert, davon 10–20 % abziehen."],
    achten: ["Die Stelle, an der die Oberfläche matt und löchrig wird.", "Lieber etwas vorsichtiger eintragen."],
    fehler: ["Ganzer Turm löchrig: Temperatur zu niedrig", "Kein Wechsel sichtbar: Bereich zu klein gewählt"],
    bild: `<svg viewBox="0 0 120 90" class="kal-bild"><rect x="0" y="82" width="120" height="8" fill="#2a3330"/><path d="M40 82 L50 10 L70 10 L80 82 Z" fill="#3ee6a8" opacity=".85"/><path d="M48 30 H72" stroke="#ff6b6b" stroke-width="2" stroke-dasharray="3 2"/><text x="78" y="32" font-size="8" fill="#ff6b6b">Lücken ab hier</text></svg>` },
];

// ---- Bambu Lab P1S: Bereiche der Zeichnung ----
// x/y = Punkt in der Zeichnung (viewBox 420 × 440), live = Wert aus Home Assistant
const P1S_BEREICHE = [
  { id: "duese", n: 1, x: 214, y: 196, name: "Düse und Hotend", live: "duese", einheit: "°C",
    text: "Hier wird das Filament geschmolzen. Die Temperatur entscheidet über Haftung der Schichten, Glanz und Fäden.",
    einst: [["Düse erste Schicht / weitere", "Etwas heißer in der ersten Schicht verbessert die Haftung."], ["Düsendurchmesser", "0,2 fein und langsam, 0,4 Standard, 0,6 schnell und stabil."], ["Flow Ratio", "Wie viel Material genau gefördert wird."]] },
  { id: "extruder", n: 2, x: 214, y: 140, name: "Extruder", live: null,
    text: "Zahnräder schieben das Filament in die Düse. Von hier kommen Rückzug, Flussdynamik und das Förderlimit.",
    einst: [["Rückzug (Retraction)", "Zieht das Filament beim Verfahren zurück, gegen Fäden."], ["K-Faktor", "Gleicht den Druck beim Beschleunigen aus."], ["Max. Volumenstrom", "Obergrenze für mm³/s, sonst Lücken."]] },
  { id: "luefter", n: 3, x: 246, y: 178, name: "Bauteillüfter", live: "l_bauteil", einheit: "%",
    text: "Kühlt die frische Schicht. Viel Luft für PLA und Überhänge, wenig für ASA/ABS/PETG.",
    einst: [["Lüfter min. / max.", "Bereich, in dem der Lüfter je nach Schichtzeit läuft."], ["Überhang-Lüfter", "Volle Kühlung an Überhängen und Brücken."]] },
  { id: "riemen", n: 4, x: 110, y: 88, name: "Riemen und Kohlestangen (X/Y)", live: "tempo",
    text: "Bewegen den Druckkopf. Geschwindigkeit und Beschleunigung wirken hier, zu viel davon macht Wellen hinter Kanten.",
    einst: [["Geschwindigkeiten", "Außenwand langsamer für schöne Oberflächen, Füllung schnell."], ["Beschleunigung", "Höher = schneller, aber mehr Schwingungen."], ["Geschwindigkeitsprofil am Drucker", "Leise, Standard, Sport, Wahnsinn."]] },
  { id: "bett", n: 5, x: 210, y: 300, name: "Druckbett", live: "bett", einheit: "°C",
    text: "Heizbett mit wechselbarer Platte. Platte und Temperatur entscheiden über Haftung und Elefantenfuß.",
    einst: [["Druckbetttyp", "Textured PEI für fast alles, Cool Plate für PLA, Engineering Plate mit Klebestift."], ["Betttemperatur", "PLA 55 °C, PETG 70 °C, ASA 100 °C."], ["Erste Schicht", "Höhe und Tempo der ersten Schicht."]] },
  { id: "z", n: 6, x: 76, y: 262, name: "Z-Achse (Spindeln)", live: null,
    text: "Senkt das Bett Schicht für Schicht ab. Hier wirken Schichthöhe und Z-Hop.",
    einst: [["Schichthöhe", "0,2 mm Standard, 0,12 fein, 0,28 schnell (bei 0,4-mm-Düse)."], ["Z-Hop", "Hebt beim Verfahren an, verhindert Anstoßen."]] },
  { id: "aux", n: 7, x: 36, y: 190, name: "Hilfslüfter (seitlich)", live: null,
    text: "Großer Lüfter an der Seite für zusätzliche Kühlung. Gut für PLA bei hohem Tempo, bei ASA/ABS aus.",
    einst: [["Hilfslüfter", "In Bambu Studio unter Filament › Kühlung."]] },
  { id: "kammer", n: 8, x: 372, y: 64, name: "Druckraumlüfter", live: "l_raum", einheit: "%",
    text: "Saugt warme Luft ab. Bei PLA gegen Hitzestau, bei ASA/ABS gering halten, damit es warm bleibt.",
    einst: [["Kammerlüfter", "Filament › Kühlung › Druckraumlüfter."]] },
  { id: "spule", n: 9, x: 402, y: 210, name: "Spulenhalter und PTFE", live: "filament",
    text: "Die Rolle hängt hinten. Ohne AMS läuft das Filament durch den PTFE-Schlauch zum Druckkopf.",
    einst: [["Trocknen", "Feuchtes Filament macht Fäden und Blasen."], ["Abrollen", "Rolle muss frei laufen, sonst Lücken."]] },
  { id: "kamera", n: 10, x: 58, y: 54, name: "Kamera", live: null,
    text: "Zeigt den Druck live und macht das Endfoto. Die Fehlererkennung (Spaghetti) läuft darüber.",
    einst: [["Druckfehlererkennung", "Am Drucker unter Einstellungen einschalten."]] },
  { id: "display", n: 11, x: 110, y: 32, name: "Display", live: "schritt",
    text: "Bedienung am Gerät: Filament laden, Extruder fahren, Geschwindigkeitsprofil, Kalibrierung.",
    einst: [["Extruder fahren", "Vor dem Druck 3× fördern (wird beim Verbuchen eingerechnet)."]] },
  { id: "schneider", n: 12, x: 180, y: 158, name: "Filament-Schneider", live: null,
    text: "Schneidet beim Entladen das Filament ab. Das Reststück bis zur Düse wird beim Rollenwechsel der alten Rolle abgezogen.",
    einst: [["Reststück", "Etwa 4–5 cm, rund 0,15 g."]] },
];

function p1sSvg(aktiv) {
  const linie = 'stroke="#5d726a" stroke-width="1.4" fill="none"';
  return `<svg viewBox="0 0 420 440" class="p1s-bild" role="img" aria-label="Zeichnung Bambu Lab P1S">
    <defs><pattern id="p1s-raster" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0 H0 V10" stroke="rgba(62,230,168,.06)" fill="none"/></pattern></defs>
    <rect x="0" y="0" width="420" height="440" fill="url(#p1s-raster)"/>
    <!-- Gehäuse -->
    <rect x="20" y="24" width="370" height="400" rx="14" ${linie}/>
    <rect x="34" y="40" width="342" height="330" rx="6" stroke="#3ee6a8" stroke-opacity=".35" stroke-width="1" fill="rgba(62,230,168,.03)"/>
    <path d="M34 40 L376 40" stroke="#5d726a" stroke-width="3"/>
    <!-- Kammerlüfter hinten oben -->
    <circle cx="372" cy="64" r="12" ${linie}/><path d="M372 52 V76 M360 64 H384" stroke="#5d726a"/>
    <!-- Kamera -->
    <rect x="48" y="48" width="20" height="12" rx="3" ${linie}/><circle cx="58" cy="54" r="3" fill="#5d726a"/>
    <!-- Kohlestangen + Riemen -->
    <path d="M44 88 H366" stroke="#8da49a" stroke-width="3"/><path d="M44 96 H366" stroke="#5d726a" stroke-width="1.2" stroke-dasharray="4 3"/>
    <path d="M44 88 V120 M366 88 V120" ${linie}/>
    <!-- Druckkopf -->
    <rect x="178" y="98" width="72" height="84" rx="8" fill="rgba(141,164,154,.10)" stroke="#8da49a" stroke-width="1.6"/>
    <rect x="190" y="110" width="48" height="36" rx="4" ${linie}/><circle cx="214" cy="128" r="10" ${linie}/>
    <circle cx="246" cy="164" r="11" ${linie}/><path d="M238 164 H254 M246 156 V172" stroke="#5d726a"/>
    <path d="M178 150 L170 158 L182 162" ${linie}/>
    <path d="M206 182 L222 182 L218 194 L210 194 Z" fill="#8da49a"/><path d="M212 194 L216 194 L214 200 Z" fill="#ffb547"/>
    <!-- PTFE zur Spule -->
    <path d="M214 98 C214 60 330 50 380 130 C392 150 396 180 400 196" stroke="#ffb547" stroke-opacity=".7" stroke-width="2" fill="none" stroke-dasharray="5 3"/>
    <!-- Spule hinten -->
    <circle cx="402" cy="210" r="14" stroke="#ffb547" stroke-width="2" fill="rgba(255,181,71,.12)"/><circle cx="402" cy="210" r="4" fill="#ffb547"/>
    <!-- Hilfslüfter seitlich -->
    <rect x="22" y="160" width="14" height="60" rx="3" ${linie}/><path d="M24 170 H34 M24 180 H34 M24 190 H34 M24 200 H34 M24 210 H34" stroke="#5d726a"/>
    <!-- Z-Spindeln -->
    <path d="M76 120 V360 M344 120 V360" stroke="#8da49a" stroke-width="2.5" stroke-dasharray="2 3"/>
    <!-- Druckbett -->
    <path d="M70 286 L350 286 L362 306 L58 306 Z" fill="rgba(62,230,168,.10)" stroke="#3ee6a8" stroke-width="1.6"/>
    <rect x="58" y="306" width="304" height="8" fill="rgba(62,230,168,.25)"/>
    <!-- kleines Druckteil -->
    <rect x="196" y="268" width="36" height="22" rx="2" fill="#3ee6a8" opacity=".7"/>
    <!-- Display oben an der Front -->
    <rect x="72" y="26" width="76" height="12" rx="3" stroke="#8da49a" stroke-width="1.4" fill="rgba(62,230,168,.10)" class="p1s-display"/>
    <!-- Tür unten -->
    <path d="M34 370 H376" ${linie}/><path d="M186 397 H234" stroke="#5d726a" stroke-width="3" stroke-linecap="round"/>
    ${P1S_BEREICHE.map((b) => `<g class="p1s-punkt ${aktiv === b.id ? "an" : ""}" data-aktion="hi-p1s" data-id="${b.id}" tabindex="0">
      <circle cx="${b.x}" cy="${b.y}" r="16" class="p1s-flaeche"/>
      <circle cx="${b.x}" cy="${b.y}" r="10" class="p1s-ring"/><text x="${b.x}" y="${b.y + 3.5}" text-anchor="middle">${b.n}</text></g>`).join("")}
  </svg>`;
}

// ---- Sovol-Trockner: Bereiche der Zeichnung ----
// f = Hover-Fläche [x, y, breite, höhe], b = Nummernpunkt [x, y] (viewBox 440 × 290).
// Die Display-Werte stehen mittig in ihrer Fläche (y = 221), die Nummer darunter.
const TR_TEXT_Y = 221;
const trFeld = (x) => ({ f: [x - 29, TR_TEXT_Y - 12, 58, 24], b: [x, 247], x });
const TROCKNER_BEREICHE = [
  { id: "material", name: "Material", ...trFeld(92), text: "Voreinstellung für das Material. Setzt Temperatur und Zeit. Für eigene Werte „Custom“ wählen und anpassen." },
  { id: "feuchte", name: "Luftfeuchte", ...trFeld(162), text: "Relative Feuchte im Trockner. Ziel: unter 15 % für PLA/PETG, unter 10 % für ASA, TPU, PA. Sinkt sie nicht mehr, ist die Rolle trocken." },
  { id: "soll", name: "Soll-Temperatur", ...trFeld(232), text: "Die eingestellte Temperatur. Nie über die Erweichungstemperatur, sonst verkleben die Windungen (PLA max. 55 °C)." },
  { id: "ist", name: "Ist-Temperatur", ...trFeld(296), text: "Aktuelle Temperatur im Inneren. Sie erreicht den Sollwert nach etwa 20–30 Minuten, die Zeit zählt aber sofort." },
  { id: "zeit", name: "Restzeit", ...trFeld(360), text: "Verbleibende Trocknungszeit. Danach Rolle warm luftdicht einpacken oder direkt aus dem Trockner drucken." },
  { id: "spulen", name: "Zwei Spulenplätze", f: [34, 32, 372, 160], b: [220, 110], text: "Zwei Rollen gleichzeitig. Nur Materialien mit ähnlicher Temperatur zusammen trocknen, sonst nach dem empfindlicheren richten." },
  { id: "auslass", name: "Filament-Auslass", f: [192, 2, 56, 58], b: [220, 46], text: "Durch die Öffnung oben in der Mitte kann direkt aus dem Trockner gedruckt werden. Gut für TPU und PETG bei langen Drucken." },
];
// Werte im Display passend zur Rolle (r), sonst PETG als Beispiel
function trocknerWerte(r) {
  const t = r ? wert(r, "tr_temp").v : null, d = r ? wert(r, "tr_dauer").v : null, f = r ? wert(r, "tr_feuchte").v : null;
  const soll = t != null ? t : 65, std = d != null ? d : 6, ziel = f != null ? f : 15;
  const rest = Math.max(0, Math.round(std * 60) - 20);
  const mat = r && r.material ? String(r.material) : "PETG";
  return { material: mat.length > 6 ? mat.slice(0, 6) : mat, feuchte: `${Math.max(1, ziel - 3)} %`, soll: `${soll}°`, ist: `${Math.max(20, soll - 2)}°`,
    zeit: `${String(Math.floor(rest / 60)).padStart(2, "0")}:${String(rest % 60).padStart(2, "0")}` };
}
function trocknerSvg(aktiv, r) {
  const l = 'stroke="#8da49a" stroke-width="1.5" fill="none"';
  const w = trocknerWerte(r);
  const spule = (cx) => `<circle cx="${cx}" cy="110" r="54" stroke="#ffb547" stroke-width="2" fill="rgba(255,181,71,.08)"/>
    <circle cx="${cx}" cy="110" r="40" stroke="#ffb547" stroke-opacity=".5" fill="none"/><circle cx="${cx}" cy="110" r="10" fill="#ffb547" opacity=".6"/>`;
  return `<svg viewBox="0 0 440 290" class="trockner-bild" role="img" aria-label="Zeichnung Sovol Filament-Trockner">
    <rect x="20" y="20" width="400" height="250" rx="22" ${l}/>
    <rect x="34" y="32" width="372" height="160" rx="14" stroke="#5cc8ff" stroke-opacity=".4" stroke-width="1.4" fill="rgba(92,200,255,.05)"/>
    ${spule(130)}${spule(310)}
    <!-- Auslass oben in der Mitte, Filament von der rechten Rolle -->
    <path d="M310 56 Q300 30 220 28 V6" stroke="#ffb547" stroke-width="2" fill="none"/>
    <rect x="210" y="8" width="20" height="14" rx="4" stroke="#8da49a" stroke-width="1.5" fill="#0b1210" class="tr-auslass"/><circle cx="220" cy="15" r="3" fill="#ffb547"/>
    <rect x="60" y="206" width="330" height="54" rx="10" fill="rgba(0,0,0,.35)" stroke="#3ee6a8" stroke-opacity=".5"/>
    ${TROCKNER_BEREICHE.map((b) => `<g class="p1s-punkt ${aktiv === b.id ? "an" : ""}" data-aktion="hi-tr" data-id="${b.id}" tabindex="0">
      <rect x="${b.f[0]}" y="${b.f[1]}" width="${b.f[2]}" height="${b.f[3]}" rx="${b.id === "spulen" ? 14 : 8}" class="p1s-flaeche"/>
      <circle cx="${b.b[0]}" cy="${b.b[1]}" r="9" class="p1s-ring"/><text x="${b.b[0]}" y="${b.b[1]}" text-anchor="middle" dominant-baseline="central">${TROCKNER_BEREICHE.indexOf(b) + 1}</text></g>`).join("")}
    ${TROCKNER_BEREICHE.filter((b) => b.x).map((b) => `<text x="${b.x}" y="${TR_TEXT_Y}" class="tr-wert" data-wert="${b.id}" text-anchor="middle" dominant-baseline="central">${esc(w[b.id])}</text>`).join("")}
  </svg>`;
}

// Trocknen je Material (Richtwerte, Sovol max. 70 °C)
const TROCKNEN_TABELLE = [
  { m: "PLA", temp: 50, h: 6, ziel: 15, zeichen: "Fäden, matte Stellen, spröde Rolle", lagern: "Beutel mit Trockenmittel reicht meist." },
  { m: "PLA Silk / Matte", temp: 50, h: 6, ziel: 15, zeichen: "Glanz geht verloren, Fäden", lagern: "Wie PLA." },
  { m: "Wood-PLA", temp: 45, h: 6, ziel: 15, zeichen: "Verstopfte Düse, raue Oberfläche", lagern: "Trocken lagern, nicht mit 0,2-mm-Düse." },
  { m: "PETG", temp: 65, h: 6, ziel: 15, zeichen: "Knistern, Blasen, viele Fäden", lagern: "Zieht schnell Wasser, luftdicht lagern." },
  { m: "ASA", temp: 70, h: 6, ziel: 10, zeichen: "Blasen, schwache Schichthaftung", lagern: "Luftdicht mit Trockenmittel." },
  { m: "ABS", temp: 70, h: 4, ziel: 10, zeichen: "Blasen, raue Oberfläche", lagern: "Luftdicht mit Trockenmittel." },
  { m: "TPU", temp: 55, h: 8, ziel: 10, zeichen: "Starkes Knistern, Fäden ohne Ende", lagern: "Direkt aus dem Trockner drucken." },
  { m: "PC", temp: 70, h: 8, ziel: 10, zeichen: "Blasen, trübe Oberfläche", lagern: "Am besten im Trockner lassen." },
  { m: "PA / Nylon", temp: 70, h: 12, ziel: 10, zeichen: "Knistern, weiche Teile", lagern: "Nur aus dem Trockner drucken." },
];

// ---- Wartung (Stunden aus der „Gesamtnutzung“ des Druckers) ----
const WARTUNG_AUFGABEN = [
  { id: "platte", name: "Druckplatte reinigen", alle_h: 10, alle_tage: 7, text: "Spülmittel und warmes Wasser, abtrocknen, nicht mehr anfassen." },
  { id: "stangen", name: "Kohlestangen reinigen", alle_h: 100, alle_tage: 30, text: "Mit trockenem Tuch oder etwas Isopropanol abwischen. Nicht ölen." },
  { id: "duese", name: "Düse und Silikonsocke prüfen", alle_h: 200, alle_tage: 60, text: "Verkrustungen entfernen, Socke auf Risse prüfen." },
  { id: "luefter", name: "Lüfter von Staub befreien", alle_h: 300, alle_tage: 90, text: "Hotend-, Bauteil- und Kammerlüfter mit Pinsel oder Druckluft." },
  { id: "spindeln", name: "Z-Spindeln schmieren", alle_h: 300, alle_tage: 90, text: "Alte Schmiere abwischen, dünn neues Fett (Bambu-Schmierfett) auftragen." },
  { id: "riemen", name: "Riemenspannung prüfen", alle_h: 300, alle_tage: 90, text: "Am Drucker: Einstellungen › Riemenspannung, danach Vibrations-Kalibrierung." },
  { id: "ptfe", name: "PTFE-Schlauch und Schneider prüfen", alle_h: 500, alle_tage: 180, text: "Schlauch auf Knicke und Abrieb, Schneider auf stumpfe Klinge prüfen." },
  { id: "filter", name: "Aktivkohlefilter tauschen", alle_h: 500, alle_tage: 180, text: "Vor allem, wenn du oft ASA/ABS druckst." },
  { id: "kalibrieren", name: "Komplette Kalibrierung", alle_h: 500, alle_tage: 180, text: "Bett-Nivellierung, Vibration und Motoren am Drucker neu kalibrieren." },
];
// Verschleißteile mit Richtwert für die Lebensdauer in Druckstunden
const ERSATZTEILE_STANDARD = [
  { id: "duese04", name: "Düse 0,4 mm gehärtet", lebensdauer_h: 2000, eingebaut_h: 0 },
  { id: "platte", name: "Textured PEI Plate", lebensdauer_h: 1500, eingebaut_h: 0 },
  { id: "socke", name: "Silikonsocke Hotend", lebensdauer_h: 500, eingebaut_h: 0 },
  { id: "ptfe", name: "PTFE-Schlauch", lebensdauer_h: 1000, eingebaut_h: 0 },
  { id: "filter", name: "Aktivkohlefilter", lebensdauer_h: 500, eingebaut_h: 0 },
  { id: "riemen", name: "Riemen X/Y", lebensdauer_h: 3000, eingebaut_h: 0 },
];

// ---- Unscharfe Suche ----
function normText(s) {
  return String(s || "").toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9,.]+/g, " ").trim();
}
function wortAbstand(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const z = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let vor = z[0]; z[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const t = z[j];
      z[j] = Math.min(z[j] + 1, z[j - 1] + 1, vor + (a[i - 1] === b[j - 1] ? 0 : 1));
      vor = t;
    }
  }
  return z[b.length];
}
// Punktzahl: 0 = passt nicht. Jedes Suchwort muss passen (genau, Anfang, enthalten oder vertippt)
function suchPunkte(anfrage, text) {
  const woerter = normText(anfrage).split(" ").filter(Boolean);
  if (!woerter.length) return 0;
  const t = normText(text), teile = t.split(" ");
  let summe = 0;
  for (const w of woerter) {
    let best = 0;
    if (t.includes(w)) best = 3;
    for (const x of teile) {
      if (x === w) best = Math.max(best, 4);
      else if (x.startsWith(w)) best = Math.max(best, 3.5);
      else if (w.length >= 4 && wortAbstand(w, x.slice(0, w.length + 1)) <= (w.length >= 7 ? 2 : 1)) best = Math.max(best, 1.5);
    }
    if (!best) return 0;
    summe += best;
  }
  return summe;
}

// ---------------------------------------------------------------------------
// v0.12 Hilfe: zwei Spulen trocknen, Konstruktion, Slicer-Lexikon, Druckplatten
// ---------------------------------------------------------------------------

// ---- Trockner mit zwei Plätzen ----
// Sovol heizt höchstens auf 70 °C. „ideal“ = Wert, den das Material eigentlich bräuchte.
const TROCKNER_MAX = 70;
const TROCKNEN_MATERIALIEN = [
  { id: "PLA", name: "PLA", ...TROCKNEN.PLA },
  { id: "WOOD", name: "Wood-PLA", ...TROCKNEN.PLA, tr_temp: 45 },
  { id: "PETG", name: "PETG", ...TROCKNEN.PETG },
  { id: "TPU", name: "TPU", ...TROCKNEN.TPU },
  { id: "ASA", name: "ASA", ...TROCKNEN.ASA },
  { id: "ABS", name: "ABS", ...TROCKNEN.ABS },
  { id: "PC", name: "PC", ...TROCKNEN.PC },
  { id: "PA", name: "PA / Nylon", tr_temp: 70, tr_dauer: 12, tr_feuchte: 10, ideal: 80 },
];
// Ab mehr als diesem Abstand lohnt sich ein gemeinsamer Lauf nicht mehr
const TROCKNEN_GRENZE = 15;

// Zwei Plätze zusammenführen. a/b = { name, material, temp, dauer, feuchte, ideal?, id? } oder null.
// Ergebnis: modus (leer|einzeln|zusammen|getrennt), laeufe [{ temp, dauer, feuchte, material, name, plaetze }], hinweise [{ art, text }]
function trocknenKombi(a, b) {
  const hinweise = [];
  const lauf = (x, plaetze) => ({ temp: Math.min(TROCKNER_MAX, x.temp), dauer: x.dauer, feuchte: x.feuchte, material: x.material, name: x.name, plaetze });
  const zuHeiss = (x) => {
    if (x.ideal && x.ideal > TROCKNER_MAX) hinweise.push({ art: "amber", text: `${x.name} bräuchte eigentlich ${x.ideal} °C. Der Sovol schafft nur ${TROCKNER_MAX} °C: lieber etwas länger trocknen und direkt aus dem Trockner drucken.` });
  };
  if (!a && !b) return { modus: "leer", laeufe: [], hinweise };
  if (!a || !b) {
    const x = a || b;
    zuHeiss(x);
    return { modus: "einzeln", laeufe: [lauf(x, [a ? 1 : 2])], hinweise };
  }
  zuHeiss(a); zuHeiss(b);
  if (a.id && a.id === b.id) hinweise.push({ art: "rot", text: "Dieselbe Rolle steht in beiden Plätzen. Wähle für einen Platz eine andere Rolle." });
  const [kalt, warm] = a.temp <= b.temp ? [a, b] : [b, a];
  const nr = (x) => (x === a ? 1 : 2);
  const abstand = warm.temp - kalt.temp;
  if (abstand > TROCKNEN_GRENZE) {
    hinweise.push({ art: "rot", text: `${kalt.name} (${kalt.temp} °C) und ${warm.name} (${warm.temp} °C) liegen ${abstand} °C auseinander. Bei ${warm.temp} °C wird ${kalt.name} weich und die Windungen verkleben, bei ${kalt.temp} °C wird ${warm.name} kaum trocken. Besser zwei Läufe nacheinander.` });
    hinweise.push({ art: "mint", text: "Die zuerst getrocknete Rolle warm in einen Beutel mit Trockenmittel packen, bis die zweite fertig ist." });
    return { modus: "getrennt", laeufe: [lauf(kalt, [nr(kalt)]), lauf(warm, [nr(warm)])], hinweise };
  }
  // Gemeinsam: Temperatur der empfindlicheren Rolle, Zeit der längeren.
  // Wer unter seinem Richtwert trocknet, braucht etwas länger.
  const laenger = Math.max(a.dauer, b.dauer);
  const plus = abstand >= 10 ? 2 : abstand >= 5 ? 1 : 0;
  if (plus) hinweise.push({ art: "amber", text: `${warm.name} trocknet bei ${kalt.temp} °C, also ${abstand} °C unter seinem Richtwert, darum ${plus} h mehr als die längere Zeit (${zahl(laenger, laenger % 1 ? 1 : 0)} h).${abstand >= 10 ? ` Knistert ${warm.name} sehr stark, lieber getrennt trocknen.` : ""}` });
  else hinweise.push({ art: "mint", text: "Passt gut zusammen: beide Rollen trocknen fast bei derselben Temperatur." });
  hinweise.push({ art: "mint", text: `Temperatur der empfindlicheren Rolle (${kalt.name}), Zeit der längeren, Feuchteziel der anspruchsvolleren.` });
  return { modus: "zusammen", laeufe: [{ temp: Math.min(TROCKNER_MAX, kalt.temp), dauer: laenger + plus, feuchte: Math.min(a.feuchte, b.feuchte), material: kalt.material, name: kalt.name, plaetze: [1, 2] }], hinweise };
}

// Trockner-Display für ein Ergebnis: gleiche Form wie die große Zeichnung, Spulen in Rollenfarbe.
// w = Lauf, plaetze = [{ farbe } | null, …], aktiv = Plätze, die in diesem Lauf trocknen, frei = Text für den anderen Platz
function trocknerKombiSvg(w, plaetze, aktiv, frei = "danach") {
  const l = 'stroke="#8da49a" stroke-width="1.5" fill="none"';
  const spule = (cx, p, nr) => {
    if (!p || !aktiv.includes(nr)) return `<circle cx="${cx}" cy="110" r="54" stroke="#5d726a" stroke-width="1.5" stroke-dasharray="5 5" fill="none"/>
      <text x="${cx}" y="110" class="tr-kombi-leer" text-anchor="middle" dominant-baseline="central">${p ? frei : "leer"}</text>`;
    const klar = !p.farbe || p.farbe === "transparent";
    return `<circle cx="${cx}" cy="110" r="54" stroke="#ffb547" stroke-width="2" fill="rgba(255,181,71,.08)"/>
      <circle cx="${cx}" cy="110" r="44" fill="${klar ? "#cfe9df" : esc(p.farbe)}" opacity="${klar ? 0.2 : 0.85}" stroke="rgba(255,255,255,.25)"/>
      <circle cx="${cx}" cy="110" r="14" fill="#0b1210" stroke="#ffb547" stroke-opacity=".6"/>
      <text x="${cx}" y="110" class="tr-kombi-nr" text-anchor="middle" dominant-baseline="central">${nr}</text>`;
  };
  const mat = String(w.material || "").slice(0, 6);
  const min = Math.round(w.dauer * 60);
  const zeit = `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
  const werte = [[92, mat, "Material"], [162, `< ${w.feuchte} %`, "Feuchte"], [232, `${w.temp}°`, "Soll"], [296, "--", "Ist"], [360, zeit, "Zeit"]];
  return `<svg viewBox="0 0 440 290" class="tr-kombi-bild" role="img" aria-label="Trockner-Display: ${esc(mat)}, ${w.temp} Grad, ${zeit} Stunden">
    <rect x="20" y="20" width="400" height="250" rx="22" ${l}/>
    <rect x="34" y="32" width="372" height="160" rx="14" stroke="#5cc8ff" stroke-opacity=".4" stroke-width="1.4" fill="rgba(92,200,255,.05)"/>
    ${spule(130, plaetze[0], 1)}${spule(310, plaetze[1], 2)}
    <rect x="60" y="206" width="330" height="54" rx="10" fill="rgba(0,0,0,.35)" stroke="#3ee6a8" stroke-opacity=".5"/>
    ${werte.map(([x, t, n]) => `<text x="${x}" y="225" class="tr-wert" data-kombi="${n}" text-anchor="middle" dominant-baseline="central">${esc(t)}</text>
      <text x="${x}" y="247" class="tr-kombi-name" text-anchor="middle" dominant-baseline="central">${n}</text>`).join("")}
  </svg>`;
}

// ---- Konstruktion: Zeichnungen (120 × 80, gleicher Stil wie die Fehlerbilder) ----
const KN_M = "#3ee6a8", KN_R = "#ff6b6b", KN_A = "#ffb547", KN_L = "#8da49a", KN_F = "rgba(62,230,168,.16)", KN_D = "#0b1210";
const knBild = (inhalt) => `<svg viewBox="0 0 120 80" class="kn-bild" aria-hidden="true">${inhalt}</svg>`;
const knTxt = (x, y, t, farbe = KN_L, groesse = 8) => `<text x="${x}" y="${y}" fill="${farbe}" font-size="${groesse}" font-family="ui-monospace, monospace" text-anchor="middle">${t}</text>`;
const KN_BETT = `<rect x="0" y="70" width="120" height="10" fill="#2a3330"/>`;
const KN_BILD = {
  passungen: knBild(`<rect x="22" y="12" width="76" height="56" rx="6" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.4"/>
    <circle cx="60" cy="40" r="19" fill="${KN_D}" stroke="${KN_M}" stroke-width="1.2"/><circle cx="60" cy="40" r="15.5" fill="${KN_A}" opacity=".85"/>
    <path d="M75.5 40 H79" stroke="#fff" stroke-width="1.4"/><path d="M86 26 L79 37" stroke="${KN_L}" stroke-width=".8"/>${knTxt(98, 24, "Spalt", KN_L, 7)}`),
  tropfen: knBild(`${[18, 26, 34, 42, 50, 58, 66].map((y) => `<path d="M14 ${y} H106" stroke="${KN_M}" stroke-opacity=".2"/>`).join("")}
    <rect x="14" y="12" width="92" height="58" rx="4" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/>
    <path d="M60 22.2 L69.9 32.1 A14 14 0 1 1 50.1 32.1 Z" fill="${KN_D}" stroke="${KN_M}" stroke-width="1.4"/>
    <circle cx="60" cy="42" r="14" fill="none" stroke="${KN_R}" stroke-dasharray="2 2" opacity=".7"/>${knTxt(86, 28, "45°", KN_A)}${knTxt(110, 78, "Z↑", KN_L, 7)}`),
  einsaetze: knBild(`<path d="M14 72 H106 V28 H72 V54 H48 V28 H14 Z" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/>
    <rect x="51" y="5" width="18" height="18" rx="1.5" fill="${KN_A}"/>${[9, 13, 17, 21].map((y) => `<path d="M51 ${y} l18 -2" stroke="#7a5200" stroke-width="1"/>`).join("")}
    <path d="M60 25 V30" stroke="${KN_A}" stroke-width="1.2"/><path d="M57 27 l3 3 3 -3" stroke="${KN_A}" fill="none"/>
    <path d="M48 62 H72" stroke="${KN_L}"/>${knTxt(60, 70, "Ø Loch", KN_L, 7)}<path d="M80 28 V54" stroke="${KN_L}"/><path d="M77 28 H83 M77 54 H83" stroke="${KN_L}"/>${knTxt(94, 44, "L+1", KN_L, 7)}`),
  schrauben: knBild(`<rect x="16" y="14" width="88" height="22" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/><rect x="16" y="38" width="88" height="34" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/>
    <rect x="52" y="14" width="16" height="22" fill="${KN_D}"/><rect x="56.5" y="38" width="7" height="26" fill="${KN_D}"/>
    <rect x="49" y="4" width="22" height="10" rx="2" fill="${KN_A}"/><rect x="56" y="14" width="8" height="46" fill="${KN_A}" opacity=".9"/>
    ${[18, 24, 30, 36, 42, 48, 54].map((y) => `<path d="M56 ${y} l8 2" stroke="#7a5200"/>`).join("")}${knTxt(33, 28, "Durchg.", KN_L, 7)}${knTxt(33, 58, "Kern", KN_L, 7)}`),
  magnete: knBild(`<rect x="14" y="34" width="92" height="38" rx="3" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/><rect x="38" y="34" width="44" height="11" fill="${KN_D}" stroke="${KN_M}"/>
    <rect x="40" y="10" width="40" height="10" rx="2" fill="#b8c4bf"/><rect x="40" y="10" width="20" height="10" rx="2" fill="${KN_R}" opacity=".85"/>${knTxt(50, 18, "N", "#fff", 7)}${knTxt(70, 18, "S", KN_D, 7)}
    <path d="M60 23 V30" stroke="${KN_L}"/><path d="M57 27 l3 3 3 -3" stroke="${KN_L}" fill="none"/>${knTxt(98, 28, "+0,15", KN_A, 7)}`),
  muttern: knBild(`<rect x="14" y="6" width="92" height="60" rx="4" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/>
    <polygon points="60,16 77.3,26 77.3,46 60,56 42.7,46 42.7,26" fill="${KN_D}" stroke="${KN_M}" stroke-width="1.2"/>
    <polygon points="60,19 74.7,27.5 74.7,44.5 60,53 45.3,44.5 45.3,27.5" fill="${KN_A}" opacity=".85"/><circle cx="60" cy="36" r="6" fill="${KN_D}"/>
    <path d="M42.7 61 H77.3" stroke="${KN_L}"/><path d="M42.7 58 V64 M77.3 58 V64" stroke="${KN_L}"/>${knTxt(60, 76, "SW + 0,2", KN_A, 7)}`),
  ueberhang: knBild(`${KN_BETT}<path d="M14 70 V40 L44 10 H58 V70 Z" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.4"/>
    <path d="M66 70 V44 L106 34 V42 L74 70 Z" fill="rgba(255,107,107,.15)" stroke="${KN_R}" stroke-width="1.4"/>
    <path d="M14 22 V40" stroke="${KN_L}" stroke-dasharray="2 2"/><path d="M14 28 A12 12 0 0 1 22.5 31.5" fill="none" stroke="${KN_A}" stroke-width="1.2"/>
    ${knTxt(34, 62, "45° ✓", KN_M)}${knTxt(96, 62, "✗", KN_R, 12)}`),
  bruecken: knBild(`${KN_BETT}<rect x="14" y="26" width="16" height="44" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/><rect x="90" y="26" width="16" height="44" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/>
    <rect x="14" y="20" width="92" height="6" fill="${KN_M}" opacity=".85"/><path d="M30 26 Q60 42 90 26" stroke="${KN_R}" stroke-dasharray="3 2" fill="none"/>
    <path d="M32 56 H88" stroke="${KN_L}"/><path d="M32 53 V59 M88 53 V59" stroke="${KN_L}"/>${knTxt(60, 52, "≤ 20 mm", KN_A)}`),
  fasen: knBild(`${KN_BETT}<path d="M10 70 V22 H52 V62 L44 70 Z" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.4"/>
    <path d="M68 70 V22 H110 V58 Q110 70 98 70 Z" fill="rgba(255,107,107,.12)" stroke="${KN_R}" stroke-width="1.4"/>${knTxt(31, 48, "Fase ✓", KN_M)}${knTxt(89, 44, "Radius", KN_R)}${knTxt(89, 56, "✗", KN_R, 10)}`),
  waende: knBild(`<rect x="10" y="18" width="100" height="44" rx="4" fill="none" stroke="${KN_L}" stroke-dasharray="3 3"/>
    ${[0, 1, 2].map((i) => `<ellipse cx="${36 + i * 24}" cy="38" rx="12" ry="7" fill="${i === 0 ? KN_A : KN_M}" opacity="${i === 0 ? 0.9 : 0.75}"/>`).join("")}
    <path d="M24 54 H96" stroke="${KN_L}"/><path d="M24 51 V57 M96 51 V57" stroke="${KN_L}"/>${knTxt(60, 72, "3 × Linienbreite", KN_L, 7)}`),
  details: knBild(`${KN_BETT}<rect x="14" y="30" width="14" height="40" fill="${KN_M}" opacity=".8"/><rect x="40" y="30" width="7" height="40" fill="${KN_M}" opacity=".8"/>
    <rect x="62" y="30" width="3.5" height="40" fill="${KN_A}" opacity=".9"/><rect x="84" y="30" width="1.5" height="40" fill="${KN_R}"/>
    ${knTxt(21, 24, "2", KN_L, 7)}${knTxt(43.5, 24, "1", KN_L, 7)}${knTxt(64, 24, "0,5", KN_A, 7)}${knTxt(85, 24, "0,2", KN_R, 7)}${knTxt(106, 52, "mm", KN_L, 7)}`),
  schichten: knBild(`${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="30" y="${13 + i * 9}" width="60" height="8" rx="3" fill="${KN_M}" opacity=".7"/>`).join("")}
    <path d="M16 39 H27 M93 39 H104" stroke="${KN_M}" stroke-width="2"/><path d="M20 35 l-4 4 4 4 M100 35 l4 4 -4 4" stroke="${KN_M}" stroke-width="2" fill="none"/>
    <path d="M60 2 V10 M60 69 V77" stroke="${KN_R}" stroke-width="2"/><path d="M56 6 l4 -4 4 4 M56 73 l4 4 4 -4" stroke="${KN_R}" stroke-width="2" fill="none"/>
    <path d="M34 39.5 l7 -2 7 2 7 -2 7 2" stroke="${KN_R}" stroke-width="1.4" fill="none"/>`),
  ausrichtung: knBild(`${KN_BETT}<path d="M8 70 V58 H48 V70 Z M8 58 V36 H18 V58" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.3"/>
    ${knTxt(34, 46, "✓", KN_M, 12)}<path d="M70 70 H80 V18 H70 Z M80 70 H106 V60 H80" fill="rgba(255,107,107,.12)" stroke="${KN_R}" stroke-width="1.3"/>
    ${[28, 36, 44, 52].map((y) => `<path d="M70 ${y} H80" stroke="${KN_R}" stroke-opacity=".5"/>`).join("")}${knTxt(96, 44, "✗", KN_R, 12)}`),
  schnapp: knBild(`<rect x="10" y="50" width="40" height="22" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/>
    <path d="M40 50 V18 L48 12 H52 V50 Z" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/><path d="M48 12 L58 18 L52 24 Z" fill="${KN_M}" opacity=".8"/>
    <path d="M52 50 q0 -4 4 -4" stroke="${KN_A}" stroke-width="1.4" fill="none"/>${knTxt(88, 30, "L ≥ 5 × t", KN_A)}${knTxt(88, 44, "liegend", KN_L, 7)}${knTxt(88, 54, "drucken", KN_L, 7)}`),
  gewinde: knBild(`<rect x="34" y="8" width="52" height="12" rx="2" fill="${KN_A}"/>
    <path d="M42 20 ${[0, 1, 2, 3, 4, 5, 6].map((i) => `L36 ${24 + i * 7} L42 ${27.5 + i * 7}`).join(" ")} L42 72 H78 ${[6, 5, 4, 3, 2, 1, 0].map((i) => `L78 ${27.5 + i * 7} L84 ${24 + i * 7}`).join(" ")} L78 20 Z" fill="${KN_A}" opacity=".8"/>
    ${knTxt(104, 48, "≥ M8", KN_M, 8)}`),
  warping: knBild(`${KN_BETT}<rect x="24" y="18" width="72" height="44" rx="8" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.4"/>
    ${[[24, 18], [96, 18], [24, 62], [96, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="rgba(255,181,71,.12)" stroke="${KN_A}" stroke-width="1.2"/>`).join("")}${knTxt(60, 44, "R ≥ 3", KN_M)}`),
};

// Konstruktionstipps für FDM (Werte für den P1S mit 0,4-mm-Düse, gut kalibriert).
// werte: [Bezeichnung, Wert]; dyn: Tabelle wird aus Corins Inventar berechnet (hilfe.js)
const KN_GRUPPEN = [["alle", "Alle"], ["passung", "Passungen & Löcher"], ["verbindung", "Verbinden"], ["geometrie", "Form & Überhänge"], ["festigkeit", "Festigkeit & Ausrichtung"]];
const KONSTRUKTION = [
  { id: "passungen", g: "passung", titel: "Passungen und Toleranzen", kurz: "Wie viel Spalt zwei Teile brauchen",
    punkte: ["Der Spalt gilt pro Seite: eine Welle mit 10 mm Ø braucht für eine Schiebepassung ein Loch mit 10,3–10,4 mm.",
      "Senkrechte Löcher drucken etwa 0,1–0,2 mm zu klein, weil die Düse in Kurven nach innen drückt. Dafür gibt es in Bambu Studio die X-Y-Loch-Kompensation.",
      "Einmal einen Toleranztest (Stufen 0,1 / 0,2 / 0,3 mm) mit deinem Material drucken, dann kennst du deine Werte.",
      "PETG und TPU brauchen etwas mehr Spalt als PLA, weil sie weicher fließen und leicht Fäden ziehen."],
    werte: [["Presspassung (hält ohne Kleber)", "0 – 0,05 mm"], ["Feste Passung (mit Druck fügen)", "0,1 mm"], ["Schiebepassung (läuft leicht)", "0,15 – 0,2 mm"],
      ["Spielpassung (locker, Deckel)", "0,3 mm"], ["Print-in-Place (Scharnier im Druck)", "0,3 – 0,5 mm"], ["Senkrechter Spalt (Z)", "≥ 1 Schichthöhe, besser 2"]] },
  { id: "tropfen", g: "passung", titel: "Liegende Löcher: Tropfenform", kurz: "Waagrechte Löcher ohne Stützen",
    punkte: ["Ein liegendes Loch hat oben einen flachen Überhang, der durchhängt. Ab etwa 5–6 mm Ø wird es oben unrund.",
      "Lösung: die Oberseite als 45°-Spitze ausführen (Tropfen) oder oben flach abschneiden, sodass eine kurze Brücke entsteht.",
      "Die Spitze zeigt immer nach oben (+Z), also bei der Konstruktion die spätere Druckrichtung beachten.",
      "Für Achsen und Schrauben ist die Tropfenspitze egal: sie liegen unten und an den Seiten an."],
    werte: [["Bis Ø 5 mm", "rund geht meist"], ["Ab Ø 6 mm", "Tropfen 45° oder flache Decke"], ["Senkrechte Löcher", "immer am genauesten"]] },
  { id: "einsaetze", g: "verbindung", titel: "Gewindeeinsätze (Einschmelzmuttern)", kurz: "Lochmaß für deine Messing-Einsätze", dyn: "einsatz",
    punkte: ["Loch-Ø etwas kleiner als der Außen-Ø der Rändelung: Startwert Außen-Ø − 0,5 mm. Mit einem Teststreifen ±0,1 mm prüfen.",
      "Lochtiefe = Länge des Einsatzes + 1 mm, damit verdrängtes Material Platz hat.",
      "Oben eine kleine Fase (0,5 mm) erleichtert das Ansetzen. Um den Einsatz mindestens 1,5–2 mm Wand, im Slicer 4 Wandlinien.",
      "Lötkolben: PLA etwa 210–230 °C, PETG 230–250 °C, ASA 240–260 °C. Senkrecht und langsam eindrücken, nicht drehen.",
      "Den Rechner oben nutzen: er zeigt die Maße für deine Einsätze aus dem Inventar."] },
  { id: "schrauben", g: "verbindung", titel: "Schrauben: Durchgangs- und Kernlöcher", kurz: "Loch für durchgesteckte und eingedrehte Schrauben", dyn: "schraube",
    punkte: ["Durchgangsloch: Normmaß (mittel) + 0,2 mm, weil gedruckte Löcher kleiner werden.",
      "Direkt in Kunststoff schrauben: Kernloch etwa 0,8 × Gewinde-Ø. Hält für wenige Montagen, besser sind Einsätze oder Muttern.",
      "Für Zylinderköpfe eine Senkung mit Kopf-Ø + 0,5 mm vorsehen. Liegt die Senkung unten, mit einer Opferschicht (0,2 mm) drucken und danach durchstechen.",
      "Um Schraubenlöcher mindestens 3 Wandlinien, damit die Schraube nicht in die Füllung schneidet."] },
  { id: "magnete", g: "verbindung", titel: "Magnettaschen", kurz: "Taschen für deine Magnete", dyn: "magnet",
    punkte: ["Tasche: Magnet-Ø + 0,1–0,2 mm, Tiefe: Magnetdicke + 0,1–0,2 mm. Für Presssitz + 0,1, für Kleber + 0,2.",
      "Eingeschlossene Magnete: Druck in Bambu Studio an der Schicht über der Tasche anhalten (Pause), Magnete einlegen, weiterdrucken. Polung vorher markieren!",
      "Über der Tasche mindestens 0,4–0,6 mm (2–3 Schichten) Material, sonst bricht die Decke durch.",
      "Magnete verlieren ab etwa 80 °C dauerhaft Kraft. Kein Problem beim Drucken, aber nicht auf ein heißes Bett legen."] },
  { id: "muttern", g: "verbindung", titel: "Sechskant-Muttertaschen", kurz: "Muttern sicher einlassen", dyn: "mutter",
    punkte: ["Tasche: Schlüsselweite (über die flachen Seiten) + 0,2–0,3 mm, Tiefe: Mutternhöhe + 0,2 mm.",
      "Waagrechte Mutter im Druck: eine flache Seite nach oben legen, dann ist die Decke eine kurze Brücke.",
      "Seitlich einschiebbare Muttern (Schlitz) halten beim Schrauben gut und lassen sich tauschen.",
      "Senkrecht über einer Mutter: erst die Tasche, darüber eine Opferschicht, damit das Schraubenloch sauber druckt."] },
  { id: "ueberhang", g: "geometrie", titel: "Überhänge: die 45°-Regel", kurz: "Was ohne Stützen geht",
    punkte: ["Bis 45° zur Senkrechten druckt jede Schicht noch zur Hälfte auf der vorherigen. Mit gutem Lüfter gehen beim P1S mit PLA oft 55–60°.",
      "Steilere Überhänge mit Fasen oder einem Stützwinkel konstruieren statt Stützen zu drucken.",
      "Rundungen auf der Unterseite werden zum Ende hin flach. Eine 45°-Fase am Ende hilft.",
      "PETG, ASA und TPU vertragen weniger Überhang als PLA, weil sie mit weniger Lüfter gedruckt werden."],
    werte: [["PLA", "bis 50–60°"], ["PETG", "bis 45°"], ["ASA / ABS", "bis 40–45°"], ["TPU", "bis 35–40°"]] },
  { id: "bruecken", g: "geometrie", titel: "Brücken", kurz: "Frei gespannte Strecken zwischen zwei Stützen",
    punkte: ["Eine Brücke spannt sich zwischen zwei Auflagen. Kurze Brücken sind kein Problem, die erste Schicht hängt leicht durch.",
      "Brücken möglichst gerade halten. Geschlossene Ringe (Decke über einem Loch) überbrückt Bambu Studio in Streifen.",
      "Für saubere Brücken: Lüfter 100 %, langsam (Überbrückung 25–50 mm/s), Material trocken.",
      "Lange Brücken mit einer Mittelstütze im Modell teilen, das ist oft schneller als Stützstrukturen."],
    werte: [["PLA", "bis 20–30 mm gut"], ["PETG", "bis 10–15 mm"], ["ASA / ABS", "bis 10 mm"]] },
  { id: "fasen", g: "geometrie", titel: "Fasen statt Rundungen unten", kurz: "Gegen Elefantenfuß und Überhänge",
    punkte: ["Unten am Bett eine 45°-Fase (0,4–1 mm) statt einer Rundung: die Rundung beginnt als flacher Überhang direkt über dem Bett.",
      "Die Fase gleicht auch den Elefantenfuß aus: die erste Schicht wird breit gedrückt, das Teil passt trotzdem.",
      "Rundungen sind oben und an senkrechten Kanten in Ordnung, dort sehen sie sogar besser aus als Fasen.",
      "Löcher, die unten am Bett liegen, ebenfalls leicht anfasen: sie werden durch den Elefantenfuß sonst zu eng."],
    werte: [["Fase am Bett", "0,4 – 1 mm × 45°"], ["Rundungen", "oben / senkrecht frei wählbar"]] },
  { id: "waende", g: "festigkeit", titel: "Wandstärke = Vielfache der Linienbreite", kurz: "Wände ohne Lücken planen",
    punkte: ["Der Slicer füllt eine Wand mit ganzen Linien. Passt die Stärke nicht, entsteht eine schmale Lücke oder eine Füllung im Zickzack.",
      "Faustregel: mindestens 2 Linien, für Funktionsteile 3–4 Linien. Den Rechner oben für deine Düse nutzen.",
      "Bambu Studio (Wandgenerator Arachne) passt Linienbreiten an, trotzdem sind ganze Vielfache stabiler und schneller.",
      "Dünne Rippen lieber etwas dicker als zu dünn: Festigkeit kommt beim FDM-Druck vor allem von den Wänden."] },
  { id: "details", g: "geometrie", titel: "Kleinste Details", kurz: "Was mit der Düse noch druckbar ist",
    punkte: ["In XY ist die kleinste Wand etwa eine Linienbreite (0,4-mm-Düse: rund 0,45 mm), stabil wird es ab 2 Linien.",
      "In Z ist die Schichthöhe die kleinste Stufe. Höhen besser als Vielfache der Schichthöhe planen.",
      "Erhabene Schrift: Strichstärke ≥ 0,5 mm (besser 0,8), Höhe ≥ 0,4 mm. Vertiefte Schrift: ≥ 0,6 mm breit, 0,4–0,6 mm tief.",
      "Kleine Stifte unter 2 mm Ø brechen leicht ab und schmelzen beim Druck, weil die Schicht keine Zeit zum Abkühlen hat."],
    werte: [["0,2-mm-Düse", "Details ab 0,25 mm"], ["0,4-mm-Düse", "Details ab 0,45 mm"], ["0,6-mm-Düse", "Details ab 0,65 mm"]] },
  { id: "schichten", g: "festigkeit", titel: "Schichtrichtung und Festigkeit", kurz: "Teile sind zwischen den Schichten am schwächsten",
    punkte: ["Gedruckte Teile sind nicht in alle Richtungen gleich fest: zwischen den Schichten (Z) halten sie nur etwa 50–70 % der Festigkeit in XY.",
      "Die Hauptlast soll entlang der Schichten laufen, nicht die Schichten auseinanderziehen.",
      "Mehr Wände helfen mehr als mehr Füllung. Höhere Düsentemperatur und weniger Lüfter verbessern die Schichthaftung.",
      "Haken, Halter und Clips daher liegend drucken, nicht stehend."] },
  { id: "ausrichtung", g: "festigkeit", titel: "Druckausrichtung", kurz: "Wie das Teil auf dem Bett liegt",
    punkte: ["Größte flache Seite nach unten: beste Haftung, kaum Stützen.",
      "Runde Löcher senkrecht stellen, dann werden sie wirklich rund und maßhaltig.",
      "Sichtflächen nach oben oder zur Seite, die Unterseite übernimmt die Struktur der Platte.",
      "Belastung entlang der Schichten (siehe Schichtrichtung). Im Zweifel ein Teil in zwei Teile aufteilen, die jeweils gut liegen."] },
  { id: "schnapp", g: "verbindung", titel: "Schnapphaken", kurz: "Clips, die nicht brechen",
    punkte: ["Biegearm mindestens 5–10 × so lang wie dick, Haken 0,5–1 mm Hinterschnitt.",
      "Immer liegend drucken, damit der Arm entlang der Schichten biegt.",
      "Am Fuß des Arms eine Rundung (Radius ≥ halbe Dicke) gegen Bruch.",
      "PETG und PLA+ verzeihen mehr Biegung als normales PLA, das spröde bricht."],
    werte: [["Länge : Dicke", "≥ 5 : 1, besser 10 : 1"], ["Hinterschnitt", "0,5 – 1 mm"], ["Fügewinkel", "30 – 45°"]] },
  { id: "gewinde", g: "verbindung", titel: "Gedruckte Gewinde", kurz: "Wann Gewinde selbst drucken",
    punkte: ["Gewinde ab etwa M8 lassen sich direkt drucken. Kleinere lieber mit Einsatz, Mutter oder nachschneiden.",
      "Gewinde senkrecht drucken (Achse in Z), mit kleiner Schichthöhe (0,12–0,16 mm).",
      "Spiel 0,2–0,3 mm zwischen Innen- und Außengewinde, Gewindeanfang anfasen.",
      "Für Deckel und Dosen grobe Gewinde (Trapez, 3–4 mm Steigung) verwenden: robust und schnell."],
    werte: [["Kleinstes Gewinde", "≈ M8"], ["Spiel", "0,2 – 0,3 mm"], ["Schichthöhe", "0,12 – 0,16 mm"]] },
  { id: "warping", g: "geometrie", titel: "Verzug und Auflagefläche", kurz: "Große flache Teile ohne hochgezogene Ecken",
    punkte: ["Spitze Ecken heben sich zuerst. Ecken in der Draufsicht runden (Radius ≥ 3 mm).",
      "Bei ASA/ABS und großen PETG-Teilen: Rand (Brim) oder Randohren an den Ecken.",
      "Lange, dünne Teile mit großer Auflage verziehen sich am stärksten. Teilen oder Rippen auf die Oberseite setzen.",
      "Kleine Auflageflächen (Spitzen, Kugeln) unten abflachen, damit genug Fläche das Teil hält."] },
];

// ---- Slicer-Lexikon: Bambu Studio, Namen wie in der deutschen Oberfläche (englisch in Klammern) ----
// Gruppen wie die Reiter in Bambu Studio (Prozess: Qualität, Stärke, Geschwindigkeit, Stützen, Sonstige; dazu Filament).
// ab = Abschnitt im Reiter, was = was es macht, werte = typische Werte (P1S, 0,4-mm-Düse), wann = wann ändern
const LEX_GRUPPEN = [
  { id: "qualitaet", name: "Qualität", en: "Quality", icon: "✨" },
  { id: "staerke", name: "Stärke", en: "Strength", icon: "🧱" },
  { id: "tempo", name: "Geschwindigkeit", en: "Speed", icon: "⚡" },
  { id: "stuetzen", name: "Stützen", en: "Support", icon: "🌲" },
  { id: "sonstige", name: "Sonstige", en: "Others", icon: "🧩" },
  { id: "filament", name: "Filament", en: "Filament", icon: "🧵" },
];
const LEXIKON = [
  // Qualität
  { g: "qualitaet", ab: "Schichthöhe", de: "Schichthöhe", en: "Layer height",
    was: "Höhe jeder gedruckten Schicht. Bestimmt, wie fein Rundungen und Schrägen werden und wie lange der Druck dauert.",
    werte: "0,4-mm-Düse: 0,08 – 0,28 mm. Standard 0,20 mm, fein 0,12 – 0,16 mm. Faustregel 25 – 75 % des Düsen-Ø.",
    wann: "Feiner für Figuren, Schrift und flache Schrägen. Gröber für schnelle, robuste Funktionsteile. Halbe Schichthöhe ≈ doppelte Druckzeit." },
  { g: "qualitaet", ab: "Schichthöhe", de: "Höhe der ersten Schicht", en: "Initial layer height",
    was: "Dicke der ersten Schicht auf der Platte. Eine dickere erste Schicht verzeiht kleine Unebenheiten.",
    werte: "0,2 mm (0,4-mm-Düse), 0,1 mm (0,2-mm-Düse), 0,3 mm (0,6-mm-Düse).",
    wann: "Selten ändern. Bei Haftproblemen eher Platte reinigen als die Höhe anpassen." },
  { g: "qualitaet", ab: "Breite der Linie", de: "Breite der Linie", en: "Line width",
    was: "Wie breit eine gedruckte Linie ist, getrennt für Außenwand, Innenwand, Füllung, Oberfläche und Stützen.",
    werte: "0,4-mm-Düse: Außenwand 0,42 mm, sonst 0,45 mm. Sinnvoll 100 – 120 % des Düsen-Ø.",
    wann: "Breitere Füllung (0,5 mm) macht Teile stabiler und schneller. Schmalere Außenwand für feinste Details. Konstruktion: Wandstärken als Vielfache planen." },
  { g: "qualitaet", ab: "Naht", de: "Nahtposition", en: "Seam position",
    was: "Wo jede Schichtrunde beginnt und endet. An dieser Stelle entsteht eine kleine Naht.",
    werte: "Ausgerichtet (Aligned, Standard), Nächste (Nearest), Rückseite (Back), Zufällig (Random).",
    wann: "Rückseite für Sichtteile mit klarer Vorderseite. Zufällig verteilt die Naht, macht die Oberfläche aber rau. Die Naht lässt sich auch aufmalen." },
  { g: "qualitaet", ab: "Naht", de: "Schrägnaht-Typ", en: "Scarf seam type",
    was: "Lässt Anfang und Ende einer Runde schräg über mehrere Höhenstufen überlappen. Die Naht ist dann kaum zu sehen.",
    werte: "Aus (Standard) oder für Konturen bzw. alle Wände. Dazu Schrägnaht Länge und Starthöhe.",
    wann: "Für runde, glatte Sichtteile wie Vasen, Becher, Zylinder. Kostet etwas Zeit und braucht gut kalibrierten Fluss." },
  { g: "qualitaet", ab: "Präzision", de: "Elefantenfußkompensation", en: "Elephant foot compensation",
    was: "Zieht die erste Schicht etwas nach innen, weil sie beim Andrücken breiter wird als geplant.",
    werte: "0,15 mm (Standard).",
    wann: "Erhöhen (0,2 – 0,25), wenn die Unterkante wulstig ist oder Teile unten nicht passen. Besser zusätzlich eine kleine Fase ins Modell." },
  { g: "qualitaet", ab: "Präzision", de: "X-Y-Loch-Kompensation", en: "X-Y hole compensation",
    was: "Vergrößert (+) oder verkleinert (−) senkrechte Löcher in XY. Gedruckte Löcher werden meist etwas zu klein.",
    werte: "0 mm (Standard). Typisch +0,05 bis +0,15 mm.",
    wann: "Wenn Schrauben, Stifte oder Lager nicht in die Löcher passen. Wirkt nur auf senkrechte Löcher." },
  { g: "qualitaet", ab: "Präzision", de: "Präzise Z-Höhe", en: "Precise Z height",
    was: "Passt die letzten Schichten an, damit die Gesamthöhe genau dem Modell entspricht und nicht auf die Schichthöhe gerundet wird.",
    werte: "Aus (Standard).",
    wann: "Einschalten, wenn die Höhe genau stimmen muss, z. B. bei Teilen, die ineinander gesteckt werden." },
  { g: "qualitaet", ab: "Glätten", de: "Glätten-Typ", en: "Ironing type",
    was: "Die Düse fährt noch einmal heiß und mit sehr wenig Material über die Oberfläche und bügelt sie glatt.",
    werte: "Kein Glätten (Standard), Nur oberste Oberfläche, Alle Oberflächen, Alle soliden Schichten.",
    wann: "Für glatte, flache Deckflächen (Schilder, Deckel). Kostet deutlich Zeit. Nicht bei gewölbten Oberseiten." },
  { g: "qualitaet", ab: "Glätten", de: "Glätten-Fluss", en: "Ironing flow",
    was: "Wie viel Material beim Glätten noch fließt, um feine Rillen zu füllen.",
    werte: "10 % (Standard), sinnvoll 8 – 15 %. Dazu Abstand der Glättlinien 0,1 mm und 20 – 30 mm/s.",
    wann: "Mehr, wenn noch Rillen bleiben. Weniger, wenn sich Wülste bilden oder die Fläche glänzend verschmiert." },
  { g: "qualitaet", ab: "Wandgenerator", de: "Wandgenerator", en: "Wall generator",
    was: "Wie Wände berechnet werden: Klassisch mit fester Linienbreite oder Arachne mit veränderlicher Breite.",
    werte: "Klassisch (Standard) oder Arachne.",
    wann: "Arachne für dünne Stellen, Schrift und spitz zulaufende Teile, dort entstehen keine Lücken. Klassisch für gleichmäßige Außenflächen." },
  { g: "qualitaet", ab: "Erweitert", de: "Reihenfolge der Wände", en: "Order of walls",
    was: "Ob zuerst die inneren oder die äußeren Wände einer Schicht gedruckt werden.",
    werte: "innen/außen (Standard), außen/innen, innen/außen/innen.",
    wann: "außen/innen für genauere Außenmaße und schönere Flächen, aber schlechtere Überhänge. innen/außen/innen als Mittelweg." },
  { g: "qualitaet", ab: "Überhänge", de: "Erkennen von Wandüberhängen", en: "Detect overhang wall",
    was: "Erkennt überhängende Wände und druckt sie langsamer, mit Brückenfluss und mehr Kühlung.",
    werte: "An (Standard).",
    wann: "An lassen. Nur bei Sonderfällen (Spiralvase, Tests) ausschalten." },
  // Stärke
  { g: "staerke", ab: "Wände", de: "Wandlinien", en: "Wall loops",
    was: "Anzahl der Linien in jeder Außenwand. Wände tragen den größten Teil der Festigkeit.",
    werte: "2 (Standard). 3 – 4 für Funktionsteile, 4 – 6 bei Gewinden und Einsätzen.",
    wann: "Erhöhen, wenn Teile brechen oder Schrauben in die Füllung schneiden. Hilft mehr als höhere Fülldichte." },
  { g: "staerke", ab: "Wände", de: "Nur eine Wand auf den oberen Flächen", en: "Only one wall on top surfaces",
    was: "Auf Deckflächen wird nur eine Wandlinie gedruckt, damit mehr Platz für ein sauberes Oberflächenmuster bleibt.",
    werte: "An (Standard).",
    wann: "Aus, wenn auf kleinen Deckflächen Lücken entstehen." },
  { g: "staerke", ab: "Obere/Untere Schichten", de: "Obere Schalenschichten", en: "Top shell layers",
    was: "Anzahl der geschlossenen Schichten oben. Zusammen mit „Dicke der oberen Schale“: es gilt der größere Wert.",
    werte: "5 Schichten bzw. 1,0 mm (Standard bei 0,20 mm).",
    wann: "Erhöhen, wenn die Füllung durchscheint oder die Oberfläche Löcher hat (vor allem bei wenig Fülldichte)." },
  { g: "staerke", ab: "Obere/Untere Schichten", de: "Untere Schalenschichten", en: "Bottom shell layers",
    was: "Anzahl der geschlossenen Schichten unten.",
    werte: "3 Schichten (Standard).",
    wann: "Mehr bei wasserdichten Gefäßen oder dünnen Bodenplatten, die belastet werden." },
  { g: "staerke", ab: "Obere/Untere Schichten", de: "Muster der Oberfläche", en: "Top surface pattern",
    was: "Linienmuster der obersten geschlossenen Schicht.",
    werte: "Monotonische Linie (Standard), Monotonisch, Geradlinig, Konzentrisch und mehr.",
    wann: "Konzentrisch für runde Deckel und Knöpfe. Monotonisch für gleichmäßigen Glanz ohne Streifen." },
  { g: "staerke", ab: "Füllung", de: "Fülldichte", en: "Sparse infill density",
    was: "Wie dicht das Innere gefüllt wird.",
    werte: "15 % (Standard). Deko 5 – 15 %, Funktionsteile 20 – 40 %, stark belastet 40 – 60 %.",
    wann: "Erst Wände erhöhen, dann Füllung. Über 50 % bringt kaum mehr Festigkeit, kostet aber viel Material." },
  { g: "staerke", ab: "Füllung", de: "Füllmuster", en: "Sparse infill pattern",
    was: "Form der inneren Füllung.",
    werte: "Gitternetz (Grid), Gyroid, Kubisch, Adaptiv kubisch, Blitz (Lightning), Bienenwabe u. a. Standard je nach Version Gitternetz oder Kreuzschraffur.",
    wann: "Gyroid: in alle Richtungen gleich fest, gut für PETG und TPU. Blitz: nur als Stütze für Deckflächen, für Deko. Kubisch: stabil und schnell." },
  { g: "staerke", ab: "Füllung", de: "Überlappung Füllung/Wand", en: "Infill/Wall overlap",
    was: "Wie weit die Füllung in die Wand hineinragt, damit beides verbunden ist.",
    werte: "15 % (Standard).",
    wann: "Erhöhen, wenn sich die Füllung von der Wand löst. Zu hoch drückt sich die Füllung außen durch." },
  { g: "staerke", ab: "Erweitert", de: "Sicherstellung der vertikalen Wanddicke", en: "Ensure vertical shell thickness",
    was: "Fügt an schrägen Flächen massive Füllung ein, damit die Wand dort nicht zu dünn wird.",
    werte: "An bzw. „Alle“ (Standard).",
    wann: "An lassen. Nur ausschalten, um bei Deko-Teilen Material zu sparen." },
  // Geschwindigkeit
  { g: "tempo", ab: "Geschwindigkeit der ersten Schicht", de: "Erste Schicht", en: "Initial layer",
    was: "Druckgeschwindigkeit der ersten Schicht. Langsamer = bessere Haftung.",
    werte: "50 mm/s (Standard). Bei Haftproblemen 20 – 30 mm/s, TPU 15 – 20 mm/s.",
    wann: "Wenn die erste Schicht nicht haftet, sich Ecken lösen oder sehr kleine Teile umfallen." },
  { g: "tempo", ab: "Geschwindigkeit der restlichen Schichten", de: "Außenwand", en: "Outer wall",
    was: "Geschwindigkeit der sichtbaren Außenwand. Hat den größten Einfluss auf das Aussehen.",
    werte: "200 mm/s (Standard). Silk, Transparent, Holz: 40 – 120 mm/s.",
    wann: "Langsamer für glänzendere, glattere Oberflächen und weniger Geisterbilder." },
  { g: "tempo", ab: "Geschwindigkeit der restlichen Schichten", de: "Innere Wand", en: "Inner wall",
    was: "Geschwindigkeit der inneren Wandlinien.",
    werte: "300 mm/s (Standard).",
    wann: "Senken, wenn das Material den Volumenstrom nicht schafft (Lücken) oder die Außenwand wellig wird." },
  { g: "tempo", ab: "Geschwindigkeit der restlichen Schichten", de: "Füllung", en: "Sparse infill",
    was: "Geschwindigkeit der inneren Füllung.",
    werte: "270 mm/s (Standard). Wird oft durch die Maximale Volumengeschwindigkeit gebremst.",
    wann: "Senken bei Schichtverschiebung oder wenn die Füllung löchrig ist." },
  { g: "tempo", ab: "Geschwindigkeit der restlichen Schichten", de: "Oberfläche", en: "Top surface",
    was: "Geschwindigkeit der obersten Schicht.",
    werte: "200 mm/s (Standard). Für glatte Deckflächen 60 – 120 mm/s.",
    wann: "Langsamer bei Rillen oder Lücken in der Oberfläche." },
  { g: "tempo", ab: "Geschwindigkeit der restlichen Schichten", de: "Überbrückung", en: "Bridge",
    was: "Geschwindigkeit frei gespannter Linien über Lücken.",
    werte: "50 mm/s (Standard), 25 – 50 mm/s.",
    wann: "Langsamer, wenn Brücken durchhängen oder reißen." },
  { g: "tempo", ab: "Überhanggeschwindigkeit", de: "Verlangsamen bei Überhängen", en: "Slow down for overhang",
    was: "Druckt überhängende Wände je nach Überhang (10 – 25 %, 25 – 50 %, 50 – 75 %, 75 – 100 % der Linienbreite) langsamer.",
    werte: "An. Typisch 0 / 50 / 30 / 10 mm/s für die vier Stufen.",
    wann: "Werte senken, wenn sich Überhänge hochbiegen oder Kanten ausfransen." },
  { g: "tempo", ab: "Beschleunigung", de: "Beschleunigung", en: "Acceleration",
    was: "Wie schnell der Kopf auf Tempo kommt. Für normales Drucken, Außenwand, erste Schicht, Oberfläche getrennt.",
    werte: "Normales Drucken 10 000, Außenwand 5 000, Oberfläche 2 000, erste Schicht 500 mm/s².",
    wann: "Senken bei Schichtverschiebung, Geisterbildern oder hohen, dünnen Teilen, die wackeln." },
  // Stützen
  { g: "stuetzen", ab: "Stützen", de: "Stützstrukturen aktivieren", en: "Enable support",
    was: "Schaltet automatische Stützen unter Überhängen ein.",
    werte: "Aus (Standard).",
    wann: "Wenn Überhänge steiler als etwa 45° oder freie Flächen in der Luft beginnen. Alternativ das Teil drehen oder Fasen konstruieren." },
  { g: "stuetzen", ab: "Stützen", de: "Typ", en: "Type",
    was: "Art der Stützen und ob sie automatisch oder nur an bemalten Stellen entstehen.",
    werte: "Normal (auto), Baum (auto), Normal (manuell), Baum (manuell).",
    wann: "Baum: weniger Material, leichter zu entfernen, gut bei Figuren. Normal: für große, flache Überhänge. Manuell: nur, wo du Stützen aufmalst." },
  { g: "stuetzen", ab: "Stützen", de: "Stil", en: "Style",
    was: "Feinform der Stützen, z. B. bei Baumstützen.",
    werte: "Standard, Baum schlank, Baum stark, Baum-Hybrid, Baum Organisch.",
    wann: "Organisch: lässt sich am leichtesten lösen. Stark: für hohe, schwere Überhänge. Hybrid: Baum mit flachen Stützbereichen." },
  { g: "stuetzen", ab: "Stützen", de: "Schwellenwinkel", en: "Threshold angle",
    was: "Ab welchem Winkel (gemessen von der Waagrechten) keine Stützen mehr nötig sind. Flachere Flächen werden gestützt.",
    werte: "30° (Standard).",
    wann: "Kleiner (20 – 25°) für weniger Stützen bei PLA. Größer (35 – 40°) bei PETG, ASA, TPU." },
  { g: "stuetzen", ab: "Stützen", de: "Nur auf Druckplatte", en: "On build plate only",
    was: "Stützen wachsen nur von der Platte, nicht auf dem Modell selbst.",
    werte: "Aus (Standard).",
    wann: "An, wenn Stützen auf Sichtflächen Spuren hinterlassen würden." },
  { g: "stuetzen", ab: "Erweitert", de: "Oberer Z-Abstand", en: "Top Z distance",
    was: "Abstand zwischen Stütze und Modell in der Höhe. Bestimmt, wie leicht die Stütze abgeht.",
    werte: "0,2 mm (Standard bei 0,2-mm-Schichten). 0,1 – 0,15 für glattere Unterseiten.",
    wann: "Größer, wenn Stützen zu fest sitzen. Kleiner, wenn die Unterseite durchhängt." },
  { g: "stuetzen", ab: "Erweitert", de: "Stützen/Objekt XY-Abstand", en: "Support/object xy distance",
    was: "Seitlicher Abstand zwischen Stütze und Modell.",
    werte: "0,35 mm (Standard).",
    wann: "Größer, wenn Stützen an senkrechten Wänden festkleben." },
  { g: "stuetzen", ab: "Erweitert", de: "Obere Schnittstellschichten", en: "Top interface layers",
    was: "Dichte Schichten oben auf der Stütze, direkt unter dem Modell. Ergeben eine glattere Unterseite.",
    werte: "2 – 3 Schichten.",
    wann: "Mehr für schönere Unterseiten, weniger für leichteres Entfernen." },
  { g: "stuetzen", ab: "Erweitert", de: "Brücken nicht unterstützen", en: "Don't support bridges",
    was: "Kurze Brücken werden nicht gestützt, weil sie frei gedruckt werden können.",
    werte: "An (Standard).",
    wann: "Aus, wenn lange Brücken durchhängen." },
  { g: "stuetzen", ab: "Floß", de: "Floßschichten", en: "Raft layers",
    was: "Druckt erst ein Gitter (Floß) und darauf das Modell.",
    werte: "0 (Standard, kein Floß).",
    wann: "Selten nötig. Bei winzigen Auflageflächen oder starkem Verzug, sonst lieber Rand (Brim)." },
  // Sonstige
  { g: "sonstige", ab: "Druckbetthaftung", de: "Randtyp", en: "Brim type",
    was: "Ein Rand aus Linien rund um das Teil auf der ersten Schicht, damit es besser haftet.",
    werte: "Automatisch (Standard), Keine Umrandung, Nur äußerer Rand, Nur innerer Rand, Äußerer und innerer Rand, Randohren (Brim ears).",
    wann: "Äußerer Rand bei kleinen Auflageflächen, ASA/ABS und hohen Teilen. Randohren nur an den Ecken großer Teile." },
  { g: "sonstige", ab: "Druckbetthaftung", de: "Randbreite", en: "Brim width",
    was: "Wie breit der Rand ist.",
    werte: "5 mm (Standard), 3 – 10 mm.",
    wann: "Breiter bei starkem Verzug, schmaler, wenn er schwer abgeht." },
  { g: "sonstige", ab: "Druckbetthaftung", de: "Lücke zwischen Rand und Objekt", en: "Brim-object gap",
    was: "Abstand zwischen Rand und Teil. Entscheidet, wie leicht sich der Rand abtrennen lässt.",
    werte: "0,1 mm (Standard).",
    wann: "Größer (0,15 – 0,2), wenn der Rand zu fest sitzt und Spuren hinterlässt." },
  { g: "sonstige", ab: "Spezialmodus", de: "Druckreihenfolge", en: "Print sequence",
    was: "Mehrere Teile Schicht für Schicht gemeinsam oder Teil für Teil nacheinander drucken.",
    werte: "Nach Ebene (Standard), Nach Objekt.",
    wann: "Nach Objekt: ein Fehler ruiniert nicht alle Teile und es gibt weniger Fäden. Geht nur mit niedrigen Teilen und genug Abstand." },
  { g: "sonstige", ab: "Spezialmodus", de: "Spiralvase", en: "Spiral vase",
    was: "Druckt nur eine einzige Wand als durchgehende Spirale ohne Naht, ohne Füllung und Deckel.",
    werte: "Aus (Standard).",
    wann: "Für Vasen, Lampenschirme, Becher-Einsätze. Mit 0,6-mm-Düse werden die Wände stabiler." },
  { g: "sonstige", ab: "Spezialmodus", de: "Zeitraffer", en: "Timelapse",
    was: "Kamera-Zeitraffer: normal oder Smooth, bei dem der Kopf für jedes Bild zur Seite fährt.",
    werte: "Normal (Standard), Smooth.",
    wann: "Smooth braucht einen Reinigungsturm und verlängert den Druck. Nur für schöne Videos." },
  { g: "sonstige", ab: "Fuzzy Skin", de: "Fuzzy Skin", en: "Fuzzy Skin",
    was: "Lässt die Düse beim Außenwand-Drucken zufällig zittern. Ergibt eine raue, griffige Oberfläche, die Schichtlinien verdeckt.",
    werte: "Aus (Standard). Fuzzy Skin Stärke 0,3 mm, Punktabstand 0,8 mm.",
    wann: "Für Griffe, Gehäuse und Teile, deren Schichtlinien man nicht sehen soll. Lässt sich auch nur an Stellen aufmalen." },
  { g: "sonstige", ab: "G-Code-Ausgabe", de: "Vermeiden von Wandüberquerungen", en: "Avoid crossing wall",
    was: "Leerfahrten führen um Wände herum statt quer darüber.",
    werte: "Aus (Standard).",
    wann: "An bei Fäden oder Kratzspuren auf Oberflächen. Etwas längere Druckzeit." },
  // Filament
  { g: "filament", ab: "Drucktemperatur", de: "Düsentemperatur", en: "Nozzle temperature",
    was: "Temperatur der Düse für die erste Schicht und die weiteren Schichten.",
    werte: "PLA 210 – 230 °C, PETG 240 – 255 °C, ASA 260 – 270 °C, TPU 220 – 230 °C.",
    wann: "Höher für bessere Schichthaftung und hohe Geschwindigkeit. Niedriger gegen Fäden und Glanzverlust. Mit Temperaturturm finden." },
  { g: "filament", ab: "Drucktemperatur", de: "Druckbetttemperatur", en: "Bed temperature",
    was: "Betttemperatur, getrennt für jede Plattenart (Cool Plate, Engineering, Smooth PEI, Textured PEI).",
    werte: "PLA 55 – 65 °C, PETG 70 °C, ASA/ABS 90 – 100 °C, TPU 35 – 45 °C (Textured PEI).",
    wann: "Höher bei Haftproblemen, niedriger bei Elefantenfuß. Mehr dazu im Reiter Druckplatten." },
  { g: "filament", ab: "Grundlegende Informationen", de: "Flussverhältnis", en: "Flow ratio",
    was: "Multipliziert die geförderte Materialmenge. Gleicht Durchmesser- und Dichteschwankungen aus.",
    werte: "0,95 – 1,0. Bambu PLA 0,98, PETG 0,95.",
    wann: "Kalibrieren bei jeder neuen Marke. Zu hoch: Wülste, raue Oberfläche. Zu niedrig: Lücken." },
  { g: "filament", ab: "Grundlegende Informationen", de: "Pressure Advance aktivieren", en: "Enable pressure advance",
    was: "Gleicht den Druck in der Düse beim Beschleunigen und Bremsen aus (K-Faktor). Sonst werden Ecken dick und Linienanfänge dünn.",
    werte: "PLA 0,02, PETG 0,04, TPU 0 – 0,05. Ermittelt mit der Kalibrierung Flussdynamik.",
    wann: "Kalibrieren bei neuem Material oder wenn Ecken ausbeulen." },
  { g: "filament", ab: "Volumetrische Geschwindigkeitsbegrenzung", de: "Maximale Volumengeschwindigkeit", en: "Max volumetric speed",
    was: "Obergrenze, wie viel mm³ Material pro Sekunde geschmolzen werden. Bremst alle Geschwindigkeiten passend ein.",
    werte: "PLA 15 – 21, PETG 12 – 20 (HF bis 25), ASA 12 – 16, TPU 3 – 4 mm³/s.",
    wann: "Senken bei Lücken trotz richtigem Fluss. Kalibrieren mit dem Max-Volumengeschwindigkeit-Test." },
  { g: "filament", ab: "Kühlung", de: "Lüftergeschwindigkeit", en: "Fan speed",
    was: "Bauteillüfter zwischen Minimum und Maximum, abhängig von der Schichtzeit (Minimale Lüftergeschwindigkeit, Schwellenwert für die maximale Lüftergeschwindigkeit).",
    werte: "PLA 80 – 100 %, PETG 20 – 60 %, ASA/ABS 0 – 30 %, TPU 70 – 100 %.",
    wann: "Mehr für Überhänge und Brücken. Weniger für bessere Schichthaftung und gegen Verzug." },
  { g: "filament", ab: "Kühlung", de: "Verlangsamen für eine bessere Schichtkühlung", en: "Slow printing down for better layer cooling",
    was: "Bremst kleine Schichten, damit jede Schicht Zeit zum Abkühlen hat (bis zur Minimalen Druckgeschwindigkeit).",
    werte: "An (Standard), Schichtdauer ca. 4 – 8 s.",
    wann: "An lassen. Wichtig für kleine Teile und Spitzen, die sonst weich werden." },
  { g: "filament", ab: "Kühlung", de: "Hilfslüfter", en: "Auxiliary part cooling fan",
    was: "Der große Seitenlüfter im P1S. Kühlt zusätzlich von der Seite.",
    werte: "PLA 0 – 70 %, PETG, ASA, ABS 0 %.",
    wann: "Für große Überhänge in PLA. Bei PETG und ASA aus, sonst Verzug und schwache Schichten." },
  { g: "filament", ab: "Kühlung", de: "Zwangskühlung für Überhänge und Brücken", en: "Force cooling for overhang and bridge",
    was: "Lüfter bei Überhängen und Brücken auf den eigenen Wert (Lüftergeschwindigkeit für Überhänge) setzen.",
    werte: "An, 100 % für PLA. Bei PETG 60 – 90 %.",
    wann: "An lassen. Bei ASA nur, wenn Überhänge sonst durchhängen." },
  { g: "filament", ab: "Überschreibung", de: "Rückzugslänge", en: "Retraction length",
    was: "Wie weit das Filament vor Leerfahrten zurückgezogen wird, damit nichts nachläuft.",
    werte: "P1S: 0,8 mm (Standard). PETG 0,8 – 1,2 mm, TPU 0 – 0,4 mm.",
    wann: "Erhöhen in 0,2-mm-Schritten bei Fäden (zuerst trocknen und Temperatur prüfen). Zu viel kann die Düse verstopfen." },
  { g: "filament", ab: "Überschreibung", de: "Z-Hop beim Rückzug", en: "Z hop when retract",
    was: "Hebt die Düse bei Leerfahrten an, damit sie nicht über das Teil kratzt.",
    werte: "0,4 mm (Standard am P1S).",
    wann: "Erhöhen bei Kratzern oder wenn die Düse an hochgebogenen Stellen hängen bleibt. Mehr Z-Hop = mehr Fäden." },
  { g: "filament", ab: "Grundlegende Informationen", de: "Erweichungstemperatur", en: "Softening temperature",
    was: "Ab dieser Temperatur wird das Filament weich. Bambu Studio warnt, wenn Bett oder Kammer wärmer sind (Tür öffnen).",
    werte: "PLA ca. 45 °C, PETG ca. 65 – 70 °C, ASA/ABS ca. 95 – 100 °C.",
    wann: "Nur bei eigenen Filamenten eintragen. Gilt auch als Grenze fürs Trocknen." },
];

// ---- Druckplatten (Namen wie PLATTEN in daten.js; Werte nach dem Bambu-Wiki, P1S-Bett max. 100 °C) ----
const BETT_MAX_P1S = 100;
const PLATTEN_INFO = [
  { id: "cool", name: "Cool Plate/PLA Plate", kurz: "Cool Plate", farbe: "#2b2f31", muster: "glatt",
    text: "Glatte, schwarze Platte für niedrige Betttemperaturen. Gedacht für PLA bei 35–45 °C, wenn die Kammer kühl bleiben soll.",
    gut: ["PLA bei offener Tür und niedrigem Bett", "Glatte, glänzende Unterseiten"],
    pflege: ["Vor jedem Druck dünn Klebestift auftragen: hilft beim Haften und beim Lösen.", "Kleber regelmäßig mit warmem Wasser abwaschen.", "Nicht über 60 °C heizen."],
    vorsicht: "Für PETG, TPU, ASA, ABS nicht geeignet." },
  { id: "supertack", name: "Bambu Cool Plate SuperTack", kurz: "SuperTack", farbe: "#1f2a27", muster: "glatt",
    text: "Cool Plate mit besonders haftender Beschichtung. Hält PLA und PETG schon bei niedriger Temperatur ohne Kleber. Wärmer = haftet stärker.",
    gut: ["PLA und PETG ohne Kleber", "Kleine Auflageflächen, hohe dünne Teile", "Glatte Unterseiten"],
    pflege: ["Ohne Kleber verwenden. Mit Spülmittel und warmem Wasser reinigen.", "Weiche Oberfläche: Spachtel vorsichtig ansetzen. Kratzer stören nicht.", "Sitzt ein Teil zu fest: Platte auf 50 °C heizen und dann lösen."],
    vorsicht: "Kein TPU (beschädigt die Platte). Kein Bambu PLA Silk. PLA mit PETG-Stützschnittstelle nur mit Floß." },
  { id: "eng", name: "Engineering Plate", kurz: "Engineering", farbe: "#3a3f3c", muster: "matt",
    text: "Glatte, matte Platte für technische Materialien. Braucht immer Kleber, der hier als Haft- und Trennmittel dient.",
    gut: ["PETG, ASA, ABS, PC, PA mit Kleber", "Glatte Unterseiten bei Technik-Materialien"],
    pflege: ["Klebestift vor jedem Druck dünn auftragen.", "Kleberreste mit warmem Wasser und Spülmittel abwaschen."],
    vorsicht: "Für PLA nicht empfohlen. Ohne Kleber reißen PETG und TPU Stücke aus der Oberfläche." },
  { id: "smooth", name: "Smooth PEI Plate / High Temp Plate", kurz: "Smooth PEI", farbe: "#c9a24a", muster: "glatt",
    text: "Glatte PEI-Platte (goldgelb) für fast alle Materialien. Gibt spiegelglatte Unterseiten.",
    gut: ["PLA ohne Kleber", "Glänzende Unterseiten", "PETG, TPU, ASA mit Kleber als Trennmittel"],
    pflege: ["Mit Spülmittel und warmem Wasser waschen, zwischendurch Isopropanol.", "Kein Aceton auf PEI.", "Teile nach dem Abkühlen durch leichtes Biegen lösen."],
    vorsicht: "PETG und TPU haften auf glattem PEI zu stark: immer Kleber als Trennschicht, sonst reißen sie die Beschichtung heraus." },
  { id: "textured", name: "Textured PEI Plate", kurz: "Textured PEI", farbe: "#b8872f", muster: "struktur",
    text: "Raue PEI-Platte, Standard am P1S. Haftet gut, Teile lösen sich nach dem Abkühlen fast von selbst. Unterseite bekommt eine feine Struktur.",
    gut: ["Fast alles ohne Kleber: PLA, PETG, TPU, ASA, ABS", "Unterseiten ohne Fingerabdrücke", "PETG ohne Abreißen der Oberfläche"],
    pflege: ["Wöchentlich mit Spülmittel und warmem Wasser waschen, gut abtrocknen.", "Nicht mit den Fingern auf die Druckfläche fassen.", "Kein Aceton. Verschlissene Stellen in der Mitte sind normal."],
    vorsicht: "Sehr kleine Kontaktflächen haften schlechter als auf glatten Platten. Dann Rand (Brim) oder SuperTack." },
];
// Matrix Material × Platte: a = ok | kleber | nein, t = Betttemperatur in °C
const PLATTEN_MATRIX = [
  { m: "PLA", w: { cool: ["kleber", "35–45"], supertack: ["ok", "35–45"], eng: ["nein"], smooth: ["ok", "55–65"], textured: ["ok", "55–65"] } },
  { m: "PETG", w: { cool: ["nein"], supertack: ["ok", "60–70"], eng: ["kleber", "70–80"], smooth: ["kleber", "70–80"], textured: ["ok", "70–80"] } },
  { m: "TPU", w: { cool: ["nein"], supertack: ["nein"], eng: ["kleber", "30–35"], smooth: ["kleber", "35–45"], textured: ["ok", "35–45"] } },
  { m: "ASA", w: { cool: ["nein"], supertack: ["nein"], eng: ["kleber", "90–100"], smooth: ["kleber", "90–100"], textured: ["ok", "90–100"] } },
  { m: "ABS", w: { cool: ["nein"], supertack: ["nein"], eng: ["kleber", "90–100"], smooth: ["kleber", "90–100"], textured: ["ok", "90–100"] } },
  { m: "PC", w: { cool: ["nein"], supertack: ["nein"], eng: ["kleber", "100"], smooth: ["kleber", "100"], textured: ["kleber", "100"] } },
  { m: "PA", w: { cool: ["nein"], supertack: ["nein"], eng: ["kleber", "100"], smooth: ["kleber", "100"], textured: ["kleber", "100"] } },
];
// Kleine Zeichnung einer Platte (Draufsicht, leicht schräg)
function platteSvg(p) {
  const id = `pl-${p.id}`;
  const muster = p.muster === "struktur"
    ? `<pattern id="${id}" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1" fill="rgba(0,0,0,.28)"/><circle cx="0" cy="0" r=".6" fill="rgba(255,255,255,.18)"/></pattern>`
    : `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(255,255,255,${p.muster === "matt" ? 0.06 : 0.22})"/><stop offset=".45" stop-color="rgba(255,255,255,0)"/><stop offset="1" stop-color="rgba(255,255,255,${p.muster === "matt" ? 0.03 : 0.1})"/></linearGradient>`;
  return `<svg viewBox="0 0 120 80" class="pl-bild" aria-hidden="true"><defs>${muster}</defs>
    <path d="M18 14 H102 L112 66 H8 Z" fill="${p.farbe}" stroke="rgba(255,255,255,.25)"/>
    <path d="M18 14 H102 L112 66 H8 Z" fill="url(#${id})"/>
    <path d="M8 66 H112 V70 H8 Z" fill="#555c58"/>
    <rect x="52" y="8" width="16" height="6" rx="2" fill="#8da49a"/>
  </svg>`;
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
.nav-oben .nav-punkt.nur-icon { padding: 8px 10px; }
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
.nav-unten .nav-punkt { flex-direction: column; gap: 2px; padding: 6px 4px; font-size: 11px; min-width: 0; flex: 1; }
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
.dr-steckdose { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.dr-aus .knopf { margin-top: 12px; }
.dreher.klein { width: 14px; height: 14px; border-width: 2px; display: inline-block; vertical-align: -2px; }
.dr-foto-gross { width: 100%; border-radius: 14px; margin-top: 8px; border: 1px solid var(--rand); }
.rot-hinweis { color: #ffc2c2; background: rgba(255,107,107,.12); border-color: rgba(255,107,107,.4); }
.mobil .dr-werte { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.mobil .dr-luefter { grid-template-columns: repeat(2, minmax(0, 1fr)); }
/* 3D-Modelle */
.mod-raster { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 16px; height: 100%; min-height: 480px; }
.mobil .mod-raster { grid-template-columns: 1fr; height: auto; min-height: 0; gap: 12px; }
.mod-buehne-karte { position: relative; display: flex; flex-direction: column; padding: 0; overflow: hidden; min-height: 0;
  background: radial-gradient(600px 400px at 50% 0%, rgba(62,230,168,.07), transparent 70%), rgba(0,0,0,.25); }
.mod-buehne { position: relative; flex: 1; min-height: 0; }
.mobil .mod-buehne { flex: none; height: 52vh; height: 52dvh; }
.buehne-canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: grab; outline: none; }
.buehne-canvas:active { cursor: grabbing; }
.mod-marker { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.mod-pin { position: absolute; left: 0; top: 0; width: 22px; height: 22px; border-radius: 50%; pointer-events: auto; font-size: 12px; font-weight: 700;
  background: rgba(8,12,11,.85); color: var(--amber); border: 2px solid var(--amber); box-shadow: 0 2px 10px rgba(0,0,0,.5); transition: background .15s; }
.mod-pin::after { content: ""; position: absolute; left: 50%; top: 100%; width: 2px; height: 16px; margin: 2px 0 0 -1px; background: var(--amber); opacity: .8; border-radius: 1px; }
.mod-pin::before { content: ""; position: absolute; left: 50%; top: calc(100% + 16px); width: 6px; height: 6px; margin-left: -3px; border-radius: 50%; background: var(--amber); }
.mod-pin.drin::after, .mod-pin.drin::before { background: var(--mint); }
.mod-pin:hover, .mod-pin.an { background: var(--amber); color: #2a1a00; }
.mod-pin.drin { color: var(--mint); border-color: var(--mint); }
.mod-pin.drin.an { background: var(--mint); color: #062018; }
.mod-leiste { position: absolute; left: 12px; right: 12px; top: 12px; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; pointer-events: none; }
.mod-leiste > * { pointer-events: auto; }
.mod-leiste .chip { background: rgba(8,12,11,.75); backdrop-filter: blur(8px); padding: 6px 12px; font-size: 12px; }
.mod-name { margin-right: auto; font-weight: 600; font-size: 14px; max-width: 45%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 6px 12px; border-radius: 999px; background: rgba(8,12,11,.75); border: 1px solid var(--rand); }
.mobil .mod-name { max-width: 100%; flex-basis: 100%; margin-right: 0; padding-right: 44px; }
.mod-zu { width: 32px; padding: 6px 0 !important; text-align: center; }
.mobil .mod-zu { position: absolute; right: 34px; top: 0; }
.mobil .mod-leiste { padding-right: 0; }
.mod-schicht-leiste { position: absolute; left: 12px; right: 12px; bottom: 36px; display: flex; gap: 8px; align-items: center; padding: 8px 10px; border-radius: 14px; background: rgba(8,12,11,.8); border: 1px solid var(--rand); backdrop-filter: blur(8px); flex-wrap: wrap; }
.mod-schicht-leiste input { flex: 1; min-width: 120px; }
.mod-schicht-text { font-size: 13px; color: var(--leise); min-width: 160px; text-align: right; font-variant-numeric: tabular-nums; }
.mobil .mod-schicht-text { flex-basis: 100%; text-align: center; min-width: 0; }
.mod-hilfe { position: absolute; left: 0; right: 0; bottom: 0; margin: 0; padding: 8px 12px; font-size: 12px; text-align: center; pointer-events: none; }
.mod-seite { display: flex; flex-direction: column; padding: 0; min-height: 0; overflow: hidden; }
.mod-tabs { padding: 4px 12px 0; flex: none; }
.mod-inhalt { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 16px 18px 90px; }
.mobil .mod-inhalt { overflow: visible; padding-bottom: 18px; }
.mod-inhalt h3:first-child { margin-top: 0; }
.mod-masse { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 12px; }
.mod-masse > div { display: grid; gap: 0; padding: 10px; border-radius: 12px; background: rgba(0,0,0,.22); border: 1px solid var(--rand); }
.mod-masse span { font-size: 11px; color: var(--leise); font-weight: 700; }
.mod-masse strong { font-size: 22px; font-variant-numeric: tabular-nums; }
.mod-masse small { font-size: 11px; color: var(--leise); }
.mod-masse .rot { border-color: rgba(255,107,107,.5); background: rgba(255,107,107,.1); }
.mod-masse .rot strong { color: var(--rot); }
.mod-dreh { margin: 8px 0 4px; }
.breit-auswahl { width: 100%; margin: 4px 0 8px; }
.mod-regler { margin: 12px 0; }
.mod-regler .r-kopf strong { font-size: 16px; }
.mod-regler input { width: 100%; }
.ergebnis.fehlt { border-color: rgba(255,107,107,.45); background: rgba(255,107,107,.1); }
.ergebnis.fehlt strong { color: var(--rot); }
.mod-loecher { display: grid; gap: 8px; margin: 12px 0; }
.mod-loch { border-radius: 14px; background: rgba(0,0,0,.18); border: 1px solid var(--rand); overflow: hidden; }
.mod-loch.auf { border-color: rgba(255,181,71,.5); }
.mod-loch.drin { border-color: rgba(62,230,168,.4); }
.mod-loch-zeile { display: flex; align-items: stretch; }
.mod-loch-weg { flex: none; width: 44px; display: grid; place-items: center; color: var(--leise); border-left: 1px solid var(--rand); }
.mod-loch-weg:hover, .mod-loch-weg:focus-visible { color: var(--rot); background: rgba(255,107,107,.1); }
.mod-loch-weg svg { width: 18px; height: 18px; }
.mod-loch-kopf { flex: 1; min-width: 0; width: 100%; display: flex; gap: 10px; align-items: center; text-align: left; padding: 10px; }
.mod-loch-kopf:hover { background: var(--flaeche-hover); }
.mod-nr { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; font-weight: 700; flex: none; border: 2px solid var(--amber); color: var(--amber); }
.mod-loch.drin .mod-nr { border-color: var(--mint); color: var(--mint); }
.mod-vorschlaege { display: grid; gap: 6px; padding: 0 10px 10px; }
.mod-vorschlag { display: flex; gap: 10px; align-items: center; padding: 8px; border-radius: 12px; background: var(--flaeche); border: 1px solid var(--rand); }
.mod-vorschlag.an { border-color: rgba(62,230,168,.5); background: var(--mint-weich); }
.mod-vorschlag .mini { margin-left: 0; }
.mod-v-bild { width: 44px; height: 44px; flex: none; display: grid; place-items: center; border-radius: 10px; background: rgba(0,0,0,.3); overflow: hidden; }
.mod-v-bild svg { width: 100%; height: 100%; }
.mod-legende { display: flex; flex-wrap: wrap; gap: 6px 14px; margin: 12px 0; font-size: 12px; color: var(--leise); }
.mod-legende span { display: inline-flex; align-items: center; gap: 6px; }
.mod-legende i { width: 14px; height: 4px; border-radius: 2px; display: inline-block; }
.mod-laden { display: flex; gap: 16px; align-items: center; max-width: 520px; margin: 40px auto; }
.mod-laden-klein { display: flex; gap: 8px; align-items: center; color: var(--leise); font-size: 13px; margin: 12px 0; }
.mod-leer { display: grid; gap: 16px; max-width: 720px; margin: 0 auto; }
.ablage { display: grid; justify-items: center; gap: 6px; text-align: center; padding: 56px 24px; border-radius: 22px; cursor: pointer;
  border: 2px dashed rgba(62,230,168,.35); background: radial-gradient(400px 200px at 50% 0%, rgba(62,230,168,.10), transparent 70%), var(--flaeche); transition: border-color .2s, background .2s; }
.ablage:hover, .app.ziehen .ablage { border-color: var(--mint); background: var(--mint-weich); }
.ablage strong { font-size: 18px; }
.ablage-icon { font-size: 44px; line-height: 1; margin-bottom: 6px; }
.klein-ablage { padding: 30px 16px; margin: 14px 0; }
.klein-ablage .ablage-icon { font-size: 30px; color: var(--mint); }
.app.ziehen::after { content: "Datei loslassen zum Öffnen"; position: absolute; inset: 12px; z-index: 40; display: grid; place-items: center; border-radius: 22px;
  border: 2px dashed var(--mint); background: rgba(8,12,11,.8); color: var(--mint); font-size: 20px; font-weight: 600; pointer-events: none; }
.mod-zuletzt { padding: 0 6px 0 0; }
.mod-zuletzt-knopf { flex: 1; min-width: 0; display: flex; gap: 12px; align-items: center; text-align: left; padding: 10px; }
.mod-huelle { position: relative; display: flex; min-height: 0; }
.mod-huelle > .mod-buehne-karte { flex: 1; }
.mod-plus { position: absolute; z-index: 3; top: -14px; right: -14px; width: 52px; height: 52px; border-radius: 50%; background: var(--mint); color: #062018;
  font-size: 30px; line-height: 1; display: grid; place-items: center; border: 4px solid var(--grund);
  box-shadow: 0 0 0 4px rgba(62,230,168,.15), 0 8px 24px rgba(62,230,168,.35); transition: transform .2s cubic-bezier(.2,.9,.3,1.3); }
.mod-plus:hover { transform: scale(1.08) rotate(90deg); }
.mod-plus:active { transform: scale(.94); }
.mobil .mod-plus { top: -12px; right: -8px; width: 48px; height: 48px; }
.mod-leiste { padding-right: 34px; }
.mod-markier-hinweis { position: absolute; left: 50%; top: 64px; transform: translateX(-50%); z-index: 2; display: flex; gap: 10px; align-items: center; white-space: nowrap;
  padding: 8px 8px 8px 14px; border-radius: 999px; background: rgba(255,181,71,.16); border: 1px solid rgba(255,181,71,.5); color: #ffd59a; font-size: 13px; backdrop-filter: blur(8px); animation: hinweis-rein .25s ease; }
@keyframes hinweis-rein { from { opacity: 0; transform: translate(-50%, -8px); } }
.mod-markier-hinweis .mini { margin: 0; }
.mobil .mod-markier-hinweis { top: 104px; white-space: normal; width: calc(100% - 24px); }
.mod-markier.an { border-color: rgba(255,181,71,.5); color: var(--amber); }
.mod-manuell { padding: 0 10px 6px; }
.mod-manuell .chips { align-items: center; margin-bottom: 6px; }
.mod-loch-kopf .dr-druck-text strong { white-space: normal; }
.breit-dialog { width: min(560px, calc(100% - 32px)); }
.stuetz-liste { display: grid; gap: 10px; margin: 14px 0; }
.stuetz-eintrag { display: flex; gap: 14px; align-items: center; padding: 10px; border-radius: 14px; background: var(--flaeche); border: 1px solid var(--rand); }
.stuetz-eintrag p { margin: 2px 0 0; }
.stuetz-bild { width: 110px; height: 69px; flex: none; border-radius: 10px; background: rgba(0,0,0,.3); }
/* Verbuchen */
.bu-balken { position: relative; z-index: 2; display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap; padding: 10px 24px;
  background: linear-gradient(90deg, rgba(62,230,168,.18), rgba(62,230,168,.06)); border-bottom: 1px solid rgba(62,230,168,.35); animation: balken-rein .35s cubic-bezier(.2,.9,.3,1.1); }
.bu-balken.rot { background: linear-gradient(90deg, rgba(255,107,107,.26), rgba(255,107,107,.08)); border-bottom-color: rgba(255,107,107,.5); }
@keyframes balken-rein { from { transform: translateY(-100%); opacity: 0; } }
.bu-text { font-size: 14px; min-width: 0; }
.bu-knoepfe { display: flex; gap: 8px; }
.bu-mehr { font-size: 12px; color: var(--leise); margin-left: 6px; }
.mobil .bu-balken { padding: 10px 16px; }
.mobil .bu-knoepfe { width: 100%; }
.mobil .bu-knoepfe .knopf { flex: 1; }
.dialog-x { position: absolute; top: 12px; right: 12px; }
.bu-dialog h2 { padding-right: 36px; }
.bu-kopf { display: flex; gap: 14px; align-items: center; margin-bottom: 10px; }
.bu-kopf .ld-bild { width: 64px; height: 64px; }
.bu-kopf p { margin: 2px 0 0; }
.bu-rollen { display: grid; gap: 8px; margin-bottom: 8px; }
.bu-rolle { position: relative; display: flex; gap: 12px; align-items: center; text-align: left; padding: 10px; border-radius: 14px; background: var(--flaeche); border: 1px solid var(--rand); transition: border-color .15s, background .15s, transform .15s; }
.bu-rolle:hover { border-color: rgba(62,230,168,.4); }
.bu-rolle:active { transform: scale(.98); }
.bu-rolle.an { border-color: var(--mint); background: var(--mint-weich); box-shadow: 0 0 0 3px rgba(62,230,168,.12); }
.bu-rolle svg { width: 44px; height: 44px; flex: none; }
.bu-rolle-text { display: grid; gap: 1px; min-width: 0; }
.bu-rolle-text small { font-size: 12px; color: var(--leise); }
.bu-rolle-text small.mint { color: var(--mint); }
.achtung-punkt { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: var(--rot); color: #fff; font-weight: 800; font-size: 14px; flex: none; box-shadow: 0 0 0 4px rgba(255,107,107,.2); animation: puls 2s ease-in-out infinite; }
@keyframes puls { 50% { box-shadow: 0 0 0 7px rgba(255,107,107,.08); } }
.bu-rolle .achtung-punkt { position: absolute; top: 8px; right: 8px; }
.kachel-achtung { position: absolute; top: 10px; left: 10px; z-index: 1; }
.achtung-hinweis { display: flex; gap: 12px; align-items: center; }
.achtung-hinweis > div { flex: 1; display: grid; gap: 2px; }
.achtung-hinweis small { font-size: 12px; opacity: .85; }
.achtung-hinweis .mini { margin: 0; color: var(--mint); border-color: rgba(62,230,168,.4); }
.chip.rot-chip.an { background: rgba(255,107,107,.16); border-color: rgba(255,107,107,.5); color: var(--rot); }
.bu-ergebnis { margin: 6px 0; }
.bu-bilder { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; }
.bu-bild { display: grid; gap: 4px; justify-items: center; text-align: center; padding: 8px; border-radius: 12px; background: var(--flaeche); border: 1px solid var(--rand); font-size: 12px; line-height: 1.25; transition: border-color .15s, background .15s; }
.bu-bild.an { border-color: var(--amber); background: rgba(255,181,71,.10); }
.fb-bild { width: 100%; max-width: 110px; height: auto; border-radius: 8px; background: rgba(0,0,0,.3); }
.bu-frage { display: flex; gap: 10px; align-items: center; justify-content: space-between; flex-wrap: wrap; padding: 8px 0; border-bottom: 1px solid var(--rand); font-size: 14px; }
.bu-frage .chip { padding: 5px 12px; }
.bu-ursache { border: 1px solid var(--rand); border-radius: 14px; padding: 12px; margin: 10px 0; background: var(--flaeche); }
.bu-ursache-kopf { display: flex; gap: 12px; align-items: center; }
.bu-ursache-kopf .fb-bild { width: 84px; flex: none; }
.bu-ursache-kopf > div { display: grid; gap: 2px; }
.bu-ursache-kopf small { font-size: 12px; }
.bu-loesungen { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 8px; font-size: 14px; }
.bu-loesungen li { display: flex; gap: 10px; align-items: flex-start; }
.bu-haken { width: 22px; height: 22px; border-radius: 7px; border: 1.5px solid var(--mint); color: #062018; font-size: 13px; font-weight: 800; flex: none; display: grid; place-items: center; transition: background .15s; }
.bu-haken.an { background: var(--mint); }
.bu-punkt { width: 22px; text-align: center; color: var(--leise); flex: none; }
.bu-aend { display: inline-block; margin-top: 2px; font-size: 12px; color: var(--amber); }
.bu-aend strong { color: var(--text); }
.feld { display: grid; gap: 4px; margin: 10px 0; font-size: 13px; color: var(--leise); }
.feld input { padding: 11px 12px; border-radius: 12px; border: 1px solid var(--rand); background: rgba(0,0,0,.3); color: var(--text); font: inherit; font-size: 15px; }
.feld input:focus, textarea:focus { outline: none; border-color: rgba(62,230,168,.6); }

/* ---- Ansichtswechsel und gemeinsame Bausteine ---- */
.ansicht-rein { animation: ansicht-rein .28s cubic-bezier(.2,.8,.2,1); }
.ansicht-rein.voll { height: 100%; }
@keyframes ansicht-rein { from { opacity: 0; transform: translateY(8px); } }
.wechsel-rein { animation: blende .22s ease; }
.wechsel { animation: wechsel .25s ease; }
@keyframes wechsel { from { opacity: .2; transform: translateX(6px); } }
.unter-tabs { margin-bottom: 16px; }
.mobil .unter-tabs { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin: 0 -16px 14px; padding: 0 16px 4px; scroll-snap-type: x proximity; scroll-padding-inline: 16px; }
.mobil .unter-tabs::-webkit-scrollbar { display: none; }
.mobil .unter-tabs .chip { scroll-snap-align: start; }
.chip { transition: background .15s, border-color .15s, color .15s, transform .1s; }
.chip:active, .knopf:active, .rund:active { transform: scale(.96); }
.knopf, .rund, .wahl, .mini { transition: filter .15s, background .15s, transform .1s; }
.zahl-punkt { display: inline-grid; place-items: center; min-width: 18px; height: 18px; padding: 0 5px; margin-left: 4px; border-radius: 9px; background: var(--mint); color: #062018; font-size: 11px; font-weight: 800; }
.zahl-punkt.amber-punkt { background: var(--amber); color: #2a1a00; }
.leer-karte { display: grid; justify-items: center; text-align: center; gap: 6px; padding: 34px 20px; }
.gross-icon { font-size: 40px; animation: schweben 3s ease-in-out infinite; }
@keyframes schweben { 50% { transform: translateY(-5px); } }
.farbtupfer { width: 28px; height: 28px; border-radius: 50%; flex: none; border: 2px solid rgba(255,255,255,.18); box-shadow: inset 0 -4px 8px rgba(0,0,0,.25); }
.zeilen-knopf { width: 100%; text-align: left; align-items: center; }
.zeilen-knopf:hover { background: var(--flaeche-hover); }
.zeilen-knopf span { display: grid; }
.such-feld { width: 100%; max-width: 420px; padding: 10px 14px; border-radius: 12px; border: 1px solid var(--rand); background: rgba(0,0,0,.3); color: var(--text); font: inherit; }
.such-feld:focus { outline: none; border-color: rgba(62,230,168,.6); }
.datei-knopf { display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
.toast.mit-knopf { display: flex; align-items: center; gap: 12px; }
.toast .mini { margin: 0; }
.dialog textarea[readonly] { font-size: 13px; }
.nav-oben { overflow-x: auto; scrollbar-width: none; }
.nav-oben::-webkit-scrollbar { display: none; }
@media (max-width: 1440px) { .nav-oben .nav-punkt { padding: 8px 9px; gap: 6px; } }
@media (max-width: 1080px) { .nav-oben .nav-name { display: none; } .nav-oben .nav-punkt { padding: 8px 11px; } .nav-oben .nav-icon { font-size: 18px; } }
.nav-unten .nav-punkt { transition: color .15s, background .15s; border-radius: 14px; }
.nav-unten .nav-punkt.aktiv .nav-icon { animation: tipp .3s ease; }
@keyframes tipp { 40% { transform: scale(1.2); } }
.such-knopf { margin-left: 4px; }
.mobil .such-knopf { margin-left: 0; }
.mobil .kopf { gap: 8px; padding: 10px 12px; }
.mobil .marke { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.mobil .speicher { font-size: 0; }
.mobil .speicher::before { font-size: 14px; }
.speicher.fehler::before { content: "● "; color: var(--rot); }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }

/* ---- Hilfe ---- */
.hi-tabs { margin-bottom: 16px; }
.hi-raster { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.mobil .hi-raster { grid-template-columns: 1fr; gap: 12px; }
.hi-bild-karte { position: relative; }
.p1s-bild, .trockner-bild { width: 100%; height: auto; display: block; }
.p1s-punkt { cursor: pointer; outline: none; }
.p1s-flaeche { fill: rgba(62,230,168,0); transition: fill .2s; }
.p1s-ring { fill: #0b1512; stroke: var(--mint); stroke-width: 1.6; transition: fill .2s, r .2s; }
.p1s-punkt text { fill: var(--mint); font-size: 11px; font-weight: 700; pointer-events: none; transition: fill .2s; }
.p1s-punkt:hover .p1s-flaeche, .p1s-punkt:focus .p1s-flaeche { fill: rgba(62,230,168,.12); }
.p1s-punkt.an .p1s-flaeche { fill: rgba(62,230,168,.18); }
.p1s-punkt.an .p1s-ring { fill: var(--mint); animation: ring-puls 1.8s ease-in-out infinite; }
.p1s-punkt.an text { fill: #062018; }
@keyframes ring-puls { 50% { stroke-width: 5; stroke-opacity: .35; } }
.tr-wert { fill: var(--mint); font-size: 14px; font-weight: 700; font-family: ui-monospace, monospace; }
.hi-info h2 { margin: 2px 0 6px; }
.hi-info h3 { margin-top: 16px; }
.hi-nr { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; background: var(--mint); color: #062018; font-weight: 800; }
.hi-live { display: flex; justify-content: space-between; gap: 10px; padding: 10px 14px; border-radius: 12px; background: var(--mint-weich); border: 1px solid rgba(62,230,168,.3); font-size: 14px; }
.hi-live span { color: var(--leise); }
.hi-einst { display: grid; gap: 8px; }
.hi-einst > div { display: grid; gap: 2px; padding: 10px 12px; border-radius: 12px; background: rgba(0,0,0,.2); border: 1px solid var(--rand); font-size: 14px; }
.hi-einst .leise { font-size: 13px; }
.info-zeile.kopfzeile { background: rgba(255,255,255,.03); font-size: 12px; text-transform: uppercase; letter-spacing: .5px; }
.hi-sprung .chip { min-width: 36px; justify-content: center; padding: 6px 10px; }
.hi-tr-info { display: grid; gap: 4px; margin-top: 12px; padding: 12px 14px; border-radius: 12px; background: rgba(0,0,0,.25); border: 1px solid var(--rand); font-size: 14px; min-height: 76px; }
.tr-tabelle { display: grid; gap: 6px; }
.tr-zeile { display: grid; grid-template-columns: 90px 1fr; gap: 4px 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--rand); }
.tr-zeile small { grid-column: 1 / -1; font-size: 12px; }
.tr-werte { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.tr-werte b { font-size: 12px; font-weight: 600; padding: 3px 8px; border-radius: 8px; background: var(--amber-weich); color: var(--amber); white-space: nowrap; }
.tr-rollen { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 8px; }
.tr-rolle { display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 14px; background: rgba(0,0,0,.18); border: 1px solid var(--rand); text-align: left; }
.tr-rolle:hover { background: var(--flaeche-hover); }
.tr-rolle svg { width: 38px; height: 38px; flex: none; }
.tr-rolle > span:nth-child(2) { flex: 1; display: grid; min-width: 0; }
.tr-rolle small { color: var(--leise); font-size: 12px; }
.fb-raster { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; align-items: start; }
.mobil .fb-raster { grid-template-columns: 1fr; }
.fb-karte { border: 1px solid var(--rand); border-radius: 16px; background: var(--flaeche); overflow: hidden; transition: border-color .2s, background .2s; }
.fb-karte:hover { border-color: rgba(255,181,71,.45); background: var(--flaeche-hover); }
.fb-kopf { width: 100%; display: flex; gap: 12px; align-items: center; padding: 10px; text-align: left; }
.fb-kopf .fb-bild { width: 84px; flex: none; }
.fb-kopf > span { display: grid; gap: 2px; }
.fb-kopf small { font-size: 12px; }
.kal-wahl { margin-bottom: 14px; }
.kal-kopf { display: flex; gap: 14px; align-items: center; }
.kal-bild { width: 120px; height: auto; flex: none; border-radius: 12px; background: rgba(0,0,0,.3); }
.mobil .kal-bild { width: 92px; }
.kal-liste { margin: 0; padding-left: 20px; display: grid; gap: 6px; font-size: 14px; line-height: 1.45; }
.kal-liste.fehler li::marker { color: var(--rot); }

/* ---- Hilfe: Beispielrolle, Trockner-Zeichnung, Fehlerbild-Fenster ---- */
.hi-rollenwahl { margin-top: 16px; }
.hi-tr-info + .hi-rollenwahl, .hi-bild-karte .hi-rollenwahl { margin-top: 0; }
.hi-werte { margin-top: 8px; }
.hi-fb-wahl { max-width: 420px; margin: 0 0 14px; }
.hi-fb-wahl .hi-rollenwahl { margin-top: 0; }
.tr-wert { pointer-events: none; }
.hi-fb-ebene { position: absolute; inset: 0; z-index: 26; display: grid; place-items: center; padding: 20px; }
.hi-fb-schleier { position: absolute; inset: 0; background: rgba(0,0,0,.6); backdrop-filter: blur(3px); animation: hi-fb-blende .22s ease both; }
.hi-fb-popup { position: relative; width: min(620px, 100%); max-height: 100%; overflow-y: auto; overscroll-behavior: contain; outline: none;
  padding: 24px; border-radius: 22px; background: rgba(16,22,20,.98); border: 1px solid rgba(255,181,71,.35); box-shadow: 0 30px 80px rgba(0,0,0,.6);
  animation: hi-fb-auf .24s cubic-bezier(.2,.8,.2,1) both; }
.hi-fb-ebene.zu { pointer-events: none; }
.hi-fb-ebene.zu .hi-fb-schleier { animation: hi-fb-blende-zu .18s ease forwards; }
.hi-fb-ebene.zu .hi-fb-popup { animation: hi-fb-zu .18s ease forwards; }
@keyframes hi-fb-blende { from { opacity: 0; } }
@keyframes hi-fb-blende-zu { to { opacity: 0; } }
@keyframes hi-fb-auf { from { opacity: 0; transform: translateY(14px) scale(.96); } }
@keyframes hi-fb-zu { to { opacity: 0; transform: translateY(10px) scale(.97); } }
.hi-fb-x { position: absolute; top: 12px; right: 12px; background: var(--flaeche-hover); border: 1px solid var(--rand); }
.hi-fb-x:hover { border-color: rgba(255,181,71,.5); }
.hi-fb-kopf { display: flex; gap: 16px; align-items: center; padding-right: 40px; }
.hi-fb-kopf .fb-bild { width: 180px; max-width: 40%; flex: none; }
.hi-fb-kopf p { margin: 4px 0 0; }
.hi-fb-ursachen { margin: 0; padding-left: 20px; display: grid; gap: 6px; font-size: 14px; line-height: 1.45; }
.hi-fb-ursachen li::marker { color: var(--amber); }
.mobil .hi-fb-ebene { padding: 12px 12px calc(12px + env(safe-area-inset-bottom)); }
.mobil .hi-fb-popup { padding: 18px 16px; border-radius: 18px; }
.mobil .hi-fb-kopf { flex-direction: column; align-items: flex-start; gap: 10px; padding-right: 36px; }
.mobil .hi-fb-kopf .fb-bild { width: 150px; max-width: 100%; }
@media (prefers-reduced-motion: reduce) { .hi-fb-schleier, .hi-fb-popup, .hi-fb-ebene.zu .hi-fb-schleier, .hi-fb-ebene.zu .hi-fb-popup { animation-duration: .01s; } }

/* ---- Werkstatt ---- */
.ws-kopfzeile { display: flex; gap: 12px; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
.ws-kopfzeile p { margin: 0; max-width: 760px; }
.mobil .ws-kopfzeile { flex-direction: column; align-items: stretch; }
.ws-liste { display: grid; gap: 10px; }
.ws-auftrag { display: flex; gap: 14px; align-items: flex-start; padding: 14px; }
.ws-nr { width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; background: var(--mint-weich); color: var(--mint); font-weight: 800; flex: none; }
.ws-text { flex: 1; min-width: 0; display: grid; gap: 4px; justify-items: start; }
.ws-text small { font-size: 13px; }
.ws-knoepfe { display: flex; gap: 6px; flex: none; }
.mobil .ws-auftrag { flex-wrap: wrap; }
.mobil .ws-knoepfe { width: 100%; justify-content: flex-end; }
.ws-ersatz { align-items: center; gap: 6px; }
.ws-ersatz .chip { font-size: 12px; padding: 5px 10px; }
.ws-einkauf, .ws-wartung { display: flex; gap: 14px; align-items: center; padding: 12px 14px; }
.ws-einkauf > div, .ws-wartung > .ws-text { flex: 1; display: grid; gap: 2px; min-width: 0; }
.ws-einkauf.dringend, .ws-wartung.dringend { border-color: rgba(255,107,107,.45); background: linear-gradient(90deg, rgba(255,107,107,.08), var(--flaeche)); }
.ws-icon { width: 28px; text-align: center; font-size: 20px; flex: none; }
.ws-balken, .ne-balken { height: 6px; border-radius: 3px; background: rgba(255,255,255,.07); overflow: hidden; width: 100%; margin: 4px 0; }
.ws-balken span, .ne-balken span { display: block; height: 100%; border-radius: 3px; background: var(--mint); animation: balken-wachsen .6s cubic-bezier(.2,.8,.2,1); transform-origin: left; }
.ws-balken span.amber, .ne-balken span.amber { background: var(--amber); }
.ws-balken span.rot, .ne-balken span.rot { background: var(--rot); }
@keyframes balken-wachsen { from { transform: scaleX(0); } }
.ws-raster { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
.mobil .ws-raster { grid-template-columns: 1fr; }
.ws-modell { display: grid; gap: 10px; padding: 12px; align-content: start; }
.mobil .ws-modell { grid-template-columns: 96px 1fr; }
.mobil .ws-modell .ws-modell-knoepfe { grid-column: 1 / -1; }
.ws-foto { aspect-ratio: 4 / 3; border-radius: 12px; overflow: hidden; background: rgba(0,0,0,.3); display: grid; place-items: center; font-size: 34px; }
.ws-foto img { width: 100%; height: 100%; object-fit: cover; animation: blende .3s ease; }
.ws-modell.fehl .ws-foto { box-shadow: inset 0 0 0 2px rgba(255,107,107,.4); }
.ws-modell-text { display: grid; gap: 3px; min-width: 0; }
.ws-modell-text strong { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ws-modell-text small { font-size: 12px; }
.ws-modell-knoepfe { display: flex; gap: 8px; align-items: center; }
.ws-modell-knoepfe .knopf { flex: 1; }
.ws-zwei { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.mobil .ws-zwei { grid-template-columns: 1fr; gap: 12px; }
.ws-saeulen { display: flex; gap: 10px; align-items: flex-end; height: 200px; padding-top: 10px; }
.ws-saeule { flex: 1; display: grid; grid-template-rows: auto 1fr auto; gap: 4px; height: 100%; text-align: center; font-size: 12px; }
.ws-saeule strong { font-size: 12px; }
.ws-saeule small { color: var(--leise); }
.ws-saeule-bahn { display: flex; flex-direction: column-reverse; border-radius: 8px; background: rgba(255,255,255,.04); overflow: hidden; }
.ws-saeule-bahn span { display: block; animation: saeule .7s cubic-bezier(.2,.8,.2,1); transform-origin: bottom; }
.ws-saeule-bahn .fil, .ws-legende i.fil { background: var(--mint); }
.ws-saeule-bahn .strom, .ws-legende i.strom { background: var(--amber); }
@keyframes saeule { from { transform: scaleY(0); } }
.ws-legende { display: flex; gap: 16px; margin-top: 8px; font-size: 12px; color: var(--leise); }
.ws-legende i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 6px; vertical-align: -1px; }

/* ---- Nerd ---- */
.ne-seite .stats { grid-template-columns: repeat(6, 1fr); }
.mobil .ne-seite .stats { grid-template-columns: repeat(3, 1fr); }
.mobil .ne-seite .stats .stat { display: flex; padding: 10px 12px; }
.mobil .ne-seite .stats .stat strong { font-size: 18px; }
.ne-balken-liste { display: grid; gap: 10px; }
.ne-balken-zeile { display: grid; grid-template-columns: minmax(0, 1fr) 1.2fr auto; gap: 10px; align-items: center; font-size: 13px; }
.ne-balken-zeile > span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ne-balken-zeile small { color: var(--leise); white-space: nowrap; }
.ne-phasen { display: flex; gap: 12px; height: 150px; align-items: flex-end; }
.ne-phase { flex: 1; display: grid; grid-template-rows: 1fr auto auto; height: 100%; text-align: center; gap: 4px; }
.ne-phase small { font-size: 11px; color: var(--leise); }
.ne-phase-bahn { display: flex; align-items: flex-end; border-radius: 8px; background: rgba(255,255,255,.04); overflow: hidden; }
.ne-phase-bahn span { width: 100%; background: linear-gradient(var(--rot), rgba(255,107,107,.5)); animation: saeule .7s cubic-bezier(.2,.8,.2,1); transform-origin: bottom; }
.ne-gesund { display: flex; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--rand); }
.ne-gesund:last-child { border-bottom: none; }
.ne-gesund > div { flex: 1; display: grid; gap: 2px; }
.ne-gesund small { font-size: 12px; }
.ne-gesund b { font-size: 14px; white-space: nowrap; }
.ne-gesund .punkt { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; font-weight: 800; background: rgba(255,255,255,.06); color: var(--leise); flex: none; }
.ne-gesund.gut .punkt { background: var(--mint-weich); color: var(--mint); }
.ne-gesund.schlecht .punkt { background: rgba(255,107,107,.16); color: var(--rot); }
.ne-heiz { display: grid; gap: 6px; padding: 12px 0; border-bottom: 1px solid var(--rand); }
.ne-heiz-wert { font-size: 26px; font-weight: 700; color: var(--mint); }
.ne-heiz-wert.amber { color: var(--amber); }
.ne-mini-saeulen { display: flex; gap: 3px; align-items: flex-end; height: 44px; }
.ne-mini-saeulen span { flex: 1; background: rgba(62,230,168,.5); border-radius: 2px 2px 0 0; animation: saeule .6s ease; transform-origin: bottom; }

/* ---- Suche ---- */
.such-schleier { z-index: 24; }
.such-box { position: absolute; z-index: 25; top: 70px; left: 50%; transform: translateX(-50%); width: min(640px, calc(100% - 32px)); max-height: calc(100% - 100px); display: flex; flex-direction: column;
  border-radius: 20px; background: rgba(14,22,19,.97); border: 1px solid rgba(62,230,168,.3); box-shadow: 0 24px 60px rgba(0,0,0,.6); animation: such-rein .2s cubic-bezier(.2,.8,.2,1); overflow: hidden; }
@keyframes such-rein { from { opacity: 0; transform: translate(-50%, -10px) scale(.98); } }
.mobil .such-box { top: 12px; max-height: calc(100% - 24px); }
.such-kopf { display: flex; align-items: center; gap: 10px; padding: 10px 10px 10px 16px; border-bottom: 1px solid var(--rand); }
.such-kopf input { flex: 1; min-width: 0; background: none; border: none; color: var(--text); font: inherit; font-size: 17px; padding: 8px 0; outline: none; }
.such-ergebnisse { overflow-y: auto; overscroll-behavior: contain; padding: 6px 8px 12px; }
.such-gruppe h4 { margin: 12px 8px 4px; font-size: 11px; text-transform: uppercase; letter-spacing: .8px; color: var(--leise); font-weight: 600; }
.such-treffer { width: 100%; display: flex; gap: 12px; align-items: center; padding: 9px 10px; border-radius: 12px; text-align: left; animation: blende .15s ease; }
.such-treffer:hover, .such-treffer:focus, .such-treffer.erst { background: var(--flaeche-hover); outline: none; }
.such-treffer > span:last-child { display: grid; min-width: 0; }
.such-treffer strong { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.such-treffer small { font-size: 12px; }
.such-icon { width: 28px; text-align: center; font-size: 18px; flex: none; }
.such-passend { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; padding: 0 10px 8px 50px; }
.such-passend .chip { font-size: 12px; padding: 4px 10px; }
.such-leer { padding: 22px 12px; text-align: center; font-size: 14px; }

/* ---- Mehr-Menü (Handy) ---- */
.mehr-schleier { z-index: 4; }
.mehr-sheet { position: absolute; z-index: 5; left: 0; right: 0; bottom: 0; padding: 4px 16px calc(84px + env(safe-area-inset-bottom)); display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
  border-radius: 22px 22px 0 0; background: rgba(14,22,19,.98); border-top: 1px solid var(--rand); animation: hoch .25s cubic-bezier(.2,.8,.2,1); }
.mehr-sheet .griff { grid-column: 1 / -1; margin-bottom: 6px; }
.mehr-punkt { position: relative; display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: 16px; background: var(--flaeche); border: 1px solid var(--rand); text-align: left; }
.mehr-punkt > span:first-child { font-size: 22px; }
.mehr-punkt.aktiv { background: var(--mint-weich); border-color: rgba(62,230,168,.45); color: var(--mint); }
.mehr-punkt .zahl-punkt { position: absolute; top: 8px; right: 8px; }
.suche-punkt { grid-column: 1 / -1; }
.mobil .nav-unten { z-index: 6; }

/* ==== 3D-Modelle: Orbit, Ausrichtungswürfel, Füllmuster, eigene Winkel, Warteschlange (v0.11) ==== */
.mod-ico { width: 18px; height: 18px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.mod-ico .voll { fill: currentColor; stroke: none; }
.mod-orbit { position: relative; }
.mod-leiste .mod-orbit-knopf { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px 5px 8px; }
.mod-orbit-knopf .mod-pfeil { font-size: 10px; opacity: .7; transition: transform .2s; }
.mod-orbit-knopf.an .mod-pfeil { transform: rotate(180deg); }
.mod-orbit-menue { position: absolute; z-index: 6; top: calc(100% + 8px); right: 0; width: 290px; padding: 6px; border-radius: 16px;
  background: rgba(14,22,19,.96); border: 1px solid var(--rand); backdrop-filter: blur(16px); box-shadow: 0 18px 40px rgba(0,0,0,.5);
  animation: dd-rein .18s cubic-bezier(.2,.8,.2,1); transform-origin: top right; }
.mod-orbit-punkt { width: 100%; display: flex; gap: 12px; align-items: center; text-align: left; padding: 10px; border-radius: 12px; }
.mod-orbit-punkt:hover { background: var(--flaeche-hover); }
.mod-orbit-punkt.an { background: var(--mint-weich); color: var(--mint); }
.mod-orbit-punkt .mod-ico { width: 24px; height: 24px; }
.mod-orbit-punkt > span:last-child { display: grid; gap: 2px; min-width: 0; }
.mod-orbit-punkt strong { font-size: 13px; }
.mod-orbit-punkt small { font-size: 11px; color: var(--leise); }
.mod-orbit-trenner { height: 1px; margin: 4px 8px; background: var(--rand); }
.mod-orbit-tipp { margin: 4px 10px 6px; }
.mod-schalter { position: relative; width: 30px; height: 18px; flex: none; border-radius: 9px; background: rgba(255,255,255,.14); transition: background .2s; }
.mod-schalter::after { content: ""; position: absolute; left: 2px; top: 2px; width: 14px; height: 14px; border-radius: 50%; background: #cfe0d8; transition: transform .2s cubic-bezier(.2,.8,.2,1); }
.mod-schalter.an { background: var(--mint); }
.mod-schalter.an::after { transform: translateX(12px); background: #062018; }
.mobil .mod-orbit-name { display: none; }
.mobil .mod-orbit { position: static; }
.mobil .mod-orbit-menue { left: 0; right: 0; width: auto; transform-origin: top center; }

/* Ausrichtungswürfel */
.mod-wuerfel-ecke { position: absolute; z-index: 2; top: 58px; right: 14px; width: calc(var(--w) * 1.7); height: calc(var(--w) * 1.7); pointer-events: none; }
.mobil .mod-wuerfel-ecke { top: 104px; right: 4px; }
.mod-wuerfel { position: absolute; inset: 0; pointer-events: none; touch-action: none; }
.mod-w-koerper { position: absolute; left: 50%; top: 50%; width: 0; height: 0; transform-style: preserve-3d; }
.mod-w-flaeche { position: absolute; left: calc(var(--w) / -2); top: calc(var(--w) / -2); width: var(--w); height: var(--w); display: grid;
  grid-template-columns: 20% 60% 20%; grid-template-rows: 20% 60% 20%; backface-visibility: hidden; -webkit-backface-visibility: hidden;
  background: linear-gradient(145deg, rgba(36,56,49,.95), rgba(16,26,23,.95)); border: 1px solid rgba(62,230,168,.38); border-radius: 4px; pointer-events: auto; }
.mod-w-flaeche.w-oben { background: linear-gradient(145deg, rgba(46,72,62,.96), rgba(22,36,31,.96)); }
.mod-w-flaeche.w-unten { background: linear-gradient(145deg, rgba(22,30,28,.96), rgba(12,18,16,.96)); }
.mod-w-zone { padding: 0; border-radius: 2px; display: grid; place-items: center; transition: background .12s; cursor: pointer; }
.mod-w-zone:hover { background: rgba(62,230,168,.45); }
.mod-w-zone.flaeche:hover { background: rgba(62,230,168,.22); }
.mod-w-zone span { font-size: calc(var(--w) * .145); font-weight: 800; letter-spacing: .6px; color: #d7efe5; pointer-events: none; user-select: none; }
.ziehbar .mod-w-zone { cursor: grab; }
.mod-wuerfel.zieht .mod-w-zone { cursor: grabbing; }
.mod-heim { position: absolute; left: 0; top: 0; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; pointer-events: auto;
  color: var(--leise); background: rgba(8,12,11,.7); border: 1px solid var(--rand); backdrop-filter: blur(8px); transition: color .15s, transform .15s; }
.mod-heim:hover { color: var(--mint); transform: scale(1.08); }
.mod-heim .mod-ico { width: 16px; height: 16px; }
.mod-achsen { position: absolute; left: -14px; bottom: -16px; width: 54px; height: 54px; overflow: visible; pointer-events: none; }
.mod-achsen line { stroke-width: 2.2; stroke-linecap: round; transition: opacity .2s; }
.mod-achsen text { font-size: 9px; font-weight: 800; text-anchor: middle; stroke: none; transition: opacity .2s; }
.mod-achsen .a-x { stroke: #ff6b6b; fill: #ff6b6b; }
.mod-achsen .a-y { stroke: #4fe08a; fill: #4fe08a; }
.mod-achsen .a-z { stroke: #5cc8ff; fill: #5cc8ff; }
.mod-achsen text.a-x, .mod-achsen text.a-y, .mod-achsen text.a-z { stroke: none; }

/* Drehpunkt beim Orbit */
.mod-drehpunkt { position: absolute; left: -7px; top: -7px; width: 14px; height: 14px; border-radius: 50%; pointer-events: none; z-index: 1; opacity: 0;
  background: var(--mint); box-shadow: 0 0 0 4px rgba(62,230,168,.25), 0 0 14px rgba(62,230,168,.8); transition: opacity .15s; }
.mod-drehpunkt.an { opacity: 1; }
.mod-drehpunkt.mitte { background: var(--amber); box-shadow: 0 0 0 4px rgba(255,181,71,.25), 0 0 14px rgba(255,181,71,.7); }
.mod-marker.versteckt { display: none; }

/* Warteschlange: immer sichtbar unten in der Seitenleiste */
.mod-inhalt { padding-bottom: 20px; }
.mod-fuss { flex: none; padding: 12px 18px 16px; border-top: 1px solid var(--rand); background: linear-gradient(180deg, rgba(8,12,11,.2), rgba(8,12,11,.55)); }
.mod-ws { box-shadow: 0 6px 20px rgba(62,230,168,.18); }
.mobil .mod-seite { overflow: visible; }
.mobil .mod-fuss { position: sticky; z-index: 2; bottom: calc(76px + env(safe-area-inset-bottom)); margin: 0 10px 10px; padding: 8px; border: 1px solid var(--rand); border-radius: 16px;
  background: rgba(14,22,19,.9); backdrop-filter: blur(14px); box-shadow: 0 10px 30px rgba(0,0,0,.45); }

/* Füllmuster */
.mod-muster { display: flex; gap: 12px; align-items: flex-start; margin: 6px 0 10px; }
.mod-muster-vorschau { width: 64px; height: 64px; flex: none; margin-top: 4px; border-radius: 12px; overflow: hidden; background: rgba(0,0,0,.25); border: 1px solid var(--rand); }
.mod-muster-bild { width: 100%; height: 100%; display: block; animation: blende .25s ease; }
.mod-muster-bild rect { fill: none; stroke: rgba(255,170,90,.55); stroke-width: .9; }
.mod-muster-bild path { fill: none; stroke: #d94d59; stroke-width: .75; stroke-linecap: round; }
.mod-muster-text { flex: 1; min-width: 0; }
.mod-muster-text p { margin: 6px 0 0; }
.mod-muster-text .pille { font-size: 10px; padding: 1px 7px; margin-left: 4px; vertical-align: 1px; }

/* Eigene Drehwinkel */
.mod-dreh-eigen { margin: 8px 0 14px; padding: 12px; border-radius: 14px; background: rgba(0,0,0,.2); border: 1px solid rgba(62,230,168,.25); animation: ansicht-rein .22s ease; }
.mod-dreh-felder { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.mod-dreh-feld { display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 12px; background: rgba(0,0,0,.3); border: 1px solid var(--rand); transition: border-color .15s, box-shadow .15s; }
.mod-dreh-feld.aktiv { border-color: rgba(62,230,168,.55); box-shadow: 0 0 0 3px rgba(62,230,168,.1); }
.mod-dreh-feld span { font-weight: 800; font-size: 13px; }
.mod-dreh-feld.a-x span { color: #ff6b6b; }
.mod-dreh-feld.a-y span { color: #4fe08a; }
.mod-dreh-feld.a-z span { color: #5cc8ff; }
.mod-dreh-feld input { flex: 1; min-width: 0; width: 100%; padding: 8px 2px; border: none; background: none; color: var(--text); font: inherit; font-size: 16px; text-align: right; font-variant-numeric: tabular-nums; outline: none; -moz-appearance: textfield; }
.mod-dreh-feld input::-webkit-inner-spin-button { opacity: .4; }
.mod-dreh-feld small { color: var(--leise); }
.mod-dreh-schnell { margin: 10px 0 4px; }
.mod-dreh-schnell .chip { padding: 5px 10px; font-size: 12px; font-variant-numeric: tabular-nums; }
.mod-dreh-eigen .knopf-reihe { margin-top: 8px; }

/* ---- Sicherungs-Balken ---- */
.bu-balken.blau { background: linear-gradient(90deg, rgba(92,200,255,.18), rgba(92,200,255,.05)); border-bottom-color: rgba(92,200,255,.4); }
/* ==== Allgemein: Kopfzeilen-Suche, Regler-Wertbox, Wartungs-Infos ==== */
:host { --gelb: #ffd54a; --gelb-weich: rgba(255,213,74,.14); }
/* Suche in der Kopfzeile links neben „Filament“ */
.kopf-suche { display: flex; align-items: center; gap: 8px; flex: none; height: 38px; padding: 0 8px 0 12px; margin-left: 8px; border-radius: 12px;
  border: 1px solid var(--rand); background: rgba(0,0,0,.28); color: var(--leise); font-size: 14px; transition: border-color .15s, background .15s, color .15s; }
.kopf-suche:hover, .kopf-suche:focus-visible { border-color: rgba(62,230,168,.5); background: rgba(62,230,168,.06); color: var(--text); outline: none; }
.kopf-suche-icon { font-size: 15px; }
.kopf-suche-text { min-width: 64px; text-align: left; }
.kopf-suche kbd { font: inherit; font-size: 11px; letter-spacing: .3px; padding: 2px 6px; border-radius: 6px; border: 1px solid var(--rand); background: rgba(255,255,255,.04); color: var(--leise); }
.kopf-suche + .nav-oben { margin-left: 0; }
.nav-oben .nav-punkt { white-space: nowrap; flex: none; }
@media (max-width: 1400px) { .nav-oben .nav-punkt { padding: 8px 9px; gap: 6px; } }
@media (max-width: 1340px) { .kopf .speicher { font-size: 0; } .kopf .speicher::before { font-size: 14px; } }
@media (max-width: 1320px) { .nav-oben .nav-name { display: none; } .nav-oben .nav-punkt { padding: 8px 11px; } .nav-oben .nav-icon { font-size: 18px; } }
@media (max-width: 1640px) { .kopf-suche kbd { display: none; } }
@media (max-width: 1520px) { .kopf-suche-text { display: none; } .kopf-suche { width: 38px; padding: 0; justify-content: center; margin-left: 4px; } }

/* Regler: aktueller Wert in gelber Box über dem Knopf, antippen zum Eintippen */
.regler-wert { position: absolute; z-index: 35; transform: translateY(-100%); display: grid; justify-items: center; gap: 2px;
  padding: 3px; border-radius: 11px; background: var(--gelb); color: #1b1503; box-shadow: 0 0 0 4px rgba(255,213,74,.16), 0 6px 18px rgba(0,0,0,.5);
  animation: regler-wert-rein .14s ease-out; pointer-events: auto; }
.regler-wert::after { content: ""; position: absolute; left: var(--spitze, 50%); bottom: -5px; width: 10px; height: 10px; margin-left: -5px; background: var(--gelb); transform: rotate(45deg); border-radius: 2px; }
@keyframes regler-wert-rein { from { opacity: 0; transform: translateY(calc(-100% + 6px)); } }
.regler-wert-knopf { display: flex; align-items: baseline; gap: 6px; padding: 3px 8px; border-radius: 8px; color: inherit; font-weight: 800; font-size: 15px; font-variant-numeric: tabular-nums; white-space: nowrap; min-height: 28px; }
.regler-wert-knopf:hover, .regler-wert-knopf:focus-visible { background: rgba(0,0,0,.08); outline: none; }
.regler-wert-knopf i { font-style: normal; font-weight: 400; font-size: 12px; opacity: .6; }
.regler-wert small { position: relative; z-index: 1; font-size: 11px; font-weight: 600; padding: 0 6px 2px; white-space: nowrap; opacity: .8; }
.regler-wert-feld { width: 9ch; min-width: 72px; padding: 5px 8px; border-radius: 8px; border: 2px solid rgba(27,21,3,.55); background: #fff8dc; color: #1b1503;
  font: inherit; font-weight: 800; font-size: 16px; text-align: center; outline: none; font-variant-numeric: tabular-nums; }
.regler-wert-feld:focus { border-color: #1b1503; }
.regler-wert-feld.falsch { border-color: var(--rot); background: #ffe1e1; animation: regler-wackeln .25s; }
@keyframes regler-wackeln { 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
input[type=range]:active::-webkit-slider-thumb { background: var(--gelb); box-shadow: 0 0 0 7px rgba(255,213,74,.2), 0 2px 8px rgba(0,0,0,.4); }

/* Wartung: Info mit kleiner P1S-Zeichnung */
.ws-wartung { flex-wrap: wrap; }
.ws-info-knopf { width: 32px; height: 32px; border-radius: 10px; flex: none; display: grid; place-items: center; font-size: 15px; font-weight: 700; color: var(--leise); border: 1px solid var(--rand); }
.ws-info-knopf:hover { color: var(--text); background: var(--flaeche-hover); }
.ws-info-knopf.an { color: #1b1503; background: var(--gelb); border-color: var(--gelb); }
.ws-info { flex: 1 0 100%; display: flex; gap: 14px; align-items: center; padding: 12px; border-radius: 14px; background: rgba(0,0,0,.28); border: 1px solid rgba(255,213,74,.22); animation: blende .2s ease; }
.ws-info-bild { width: 170px; flex: none; }
.ws-info-bild svg { width: 100%; height: auto; display: block; }
.ws-info-text { display: grid; gap: 6px; font-size: 14px; line-height: 1.45; min-width: 0; }
.ws-info-text p { margin: 0; }
.ws-info-text b { color: var(--gelb); font-weight: 600; }
.mobil .ws-info { flex-direction: column; align-items: stretch; }
.mobil .ws-info-bild { width: min(240px, 100%); align-self: center; }
.ws-p1s .an { filter: drop-shadow(0 0 3px rgba(255,213,74,.85)); }
.ws-p1s .ws-p1s-puls { fill: none; stroke: var(--gelb); stroke-width: 1.4; animation: ws-puls 1.8s ease-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes ws-puls { from { opacity: .9; transform: scale(.6); } to { opacity: 0; transform: scale(1.6); } }

/* ==== Drucker-Steuerung: geladenes Filament, Zieltemperatur, Lüfter (v0.11) ==== */
:host { --gruen: #5be37d; --gruen-weich: rgba(91,227,125,.14); }
.pille.gruen { color: var(--gruen); background: var(--gruen-weich); }
/* Kachel der geladenen Rolle */
.kachel.geladen { border: 1.5px solid rgba(91,227,125,.75); background: linear-gradient(160deg, rgba(91,227,125,.16), transparent 60%), var(--flaeche);
  box-shadow: 0 0 0 1px rgba(91,227,125,.15), 0 0 22px rgba(91,227,125,.18); }
.kachel.geladen:hover { border-color: var(--gruen); }
.badge-geladen { position: absolute; top: 12px; left: 12px; z-index: 1; font-size: 10px; font-weight: 700; color: #062012; background: var(--gruen); border-radius: 6px; padding: 2px 7px; letter-spacing: .3px; }
.mobil .badge-geladen { font-size: 9px; padding: 2px 5px; }
.kachel.geladen .kachel-achtung { top: 34px; }
/* Knopf „Geladen“ in der Detailansicht */
.geladen-knopf { margin-left: 6px; font-size: 12px; font-weight: 600; padding: 2px 10px; border-radius: 999px; color: var(--leise); border: 1px solid var(--rand); vertical-align: middle; }
.geladen-knopf:hover { color: var(--gruen); border-color: rgba(91,227,125,.5); }
.geladen-knopf.an { color: #062012; background: var(--gruen); border-color: var(--gruen); }
/* Karte „Geladenes Filament“ */
.dr-filament.geladen { border-color: rgba(91,227,125,.45); background: radial-gradient(360px 160px at 0% 0%, rgba(91,227,125,.10), transparent 70%), var(--flaeche); }
.dr-fil-zeile { display: flex; gap: 14px; align-items: center; }
.dr-fil-spule { width: 52px; height: 52px; flex: none; display: grid; place-items: center; }
.dr-fil-leer { width: 46px; height: 46px; border-radius: 50%; border: 1.5px dashed var(--rand); display: grid; place-items: center; color: var(--leise); font-size: 20px; }
.dr-fil-text { flex: 1; min-width: 0; display: grid; gap: 2px; }
.dr-fil-text small { color: var(--leise); font-size: 12px; }
.dr-fil-wahl { display: flex; gap: 10px; align-items: center; margin-top: 12px; }
.dr-fil-wahl .auswahl { flex: 1; min-width: 0; margin: 0; }
.mobil .dr-fil-wahl { flex-direction: column; align-items: stretch; }
.dr-filament > .mini { margin: 10px 0 0; }
/* Zieltemperatur eingeben */
.dr-temp-fuss { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
.dr-soll { display: inline-flex; align-items: center; gap: 6px; margin-left: auto; }
.dr-soll input { width: 74px; padding: 6px 8px; border-radius: 10px; border: 1px solid var(--rand); background: rgba(0,0,0,.3); color: var(--text); font: inherit; font-size: 14px; text-align: right; }
.dr-soll input:focus { outline: none; border-color: rgba(62,230,168,.6); }
.dr-soll input.fehler { border-color: var(--rot); background: rgba(255,107,107,.1); }
.dr-soll .mini { margin: 0; min-width: 62px; }
.dr-einheit { color: var(--leise); font-size: 13px; }
.dr-rolle-chip { padding: 4px 10px; font-size: 12px; }
.dr-soll.breit { display: flex; margin: 0; }
.dr-soll.breit input { flex: 1; width: auto; padding: 10px 12px; font-size: 15px; }
/* Lüfter zum Antippen */
.dr-titel-zusatz { font-weight: 400; margin-left: 8px; font-size: 12px; }
.dr-l-knopf { position: relative; color: inherit; cursor: pointer; transition: border-color .15s, background .15s; }
.dr-l-knopf:hover { border-color: rgba(62,230,168,.5); background: var(--mint-weich); }
.dr-l-stift { position: absolute; top: 6px; right: 8px; font-style: normal; font-size: 11px; color: var(--leise); }
.dr-stufen { margin: 12px 0 4px; }
.dr-stufen .chip { min-width: 54px; }
/* ---- Hilfe v0.12: Trockner mit zwei Plätzen, Konstruktion, Slicer-Lexikon, Druckplatten ---- */
.hinweis.rot { color: #ffc2c2; background: rgba(255,107,107,.1); border-color: rgba(255,107,107,.35); }
.pl-jetzt { color: var(--mint); }
/* Aufklappbare Einträge */
.hi-eintrag { border: 1px solid var(--rand); border-radius: 16px; background: var(--flaeche); backdrop-filter: blur(10px); transition: border-color .2s, background .2s, box-shadow .2s; min-width: 0; }
.hi-eintrag:hover { border-color: rgba(62,230,168,.35); background: var(--flaeche-hover); }
.hi-eintrag.auf { border-color: rgba(62,230,168,.45); box-shadow: 0 8px 28px rgba(0,0,0,.25), inset 0 0 0 1px rgba(62,230,168,.08); }
.hi-eintrag-kopf { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 12px; text-align: left; border-radius: 16px; }
.hi-eintrag-kopf:focus-visible { outline: 2px solid rgba(62,230,168,.6); outline-offset: -2px; }
.hi-pfeil { margin-left: auto; flex: none; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; color: var(--leise); font-size: 18px; transition: transform .22s ease, color .2s, background .2s; }
.hi-eintrag.auf .hi-pfeil { transform: rotate(90deg); color: var(--mint); background: var(--mint-weich); }
.hi-eintrag-text { display: none; padding: 0 14px 14px; }
.hi-eintrag.auf .hi-eintrag-text { display: block; }
/* Trockner: zwei Plätze */
.hi-kombi-wahl { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.hi-kombi-wahl .breit-auswahl { margin: 0; }
.hi-kombi-erg { margin-top: 14px; }
.hi-kombi-hinweis { margin-bottom: 8px; }
.hi-kombi-leer { margin: 6px 0 0; }
.hi-laeufe { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); margin-top: 6px; }
.hi-laeufe:not(.zwei) .hi-lauf { display: grid; grid-template-columns: minmax(0, 400px) minmax(0, 1fr); gap: 4px 18px; align-items: center; }
.hi-laeufe:not(.zwei) .hi-lauf h4 { grid-column: 1 / -1; }
.hi-laeufe:not(.zwei) .hi-lauf-schritte { grid-template-columns: 1fr 1fr; margin: 0; }
.mobil .hi-laeufe:not(.zwei) .hi-lauf { grid-template-columns: 1fr; }
.mobil .hi-laeufe:not(.zwei) .hi-lauf-schritte { margin-top: 10px; }
.hi-laeufe.zwei { grid-template-columns: 1fr 1fr; }
.hi-lauf { padding: 12px; border-radius: 16px; background: rgba(0,0,0,.22); border: 1px solid var(--rand); animation: hi-lauf-rein .3s ease both; }
@keyframes hi-lauf-rein { from { opacity: 0; transform: translateY(6px); } }
.hi-lauf h4 { margin: 0 0 8px; font-size: 14px; color: var(--mint); }
.tr-kombi-bild { width: 100%; max-width: 400px; height: auto; display: block; margin: 0 auto; }
.tr-kombi-name { fill: var(--leise); font-size: 10px; letter-spacing: .4px; }
.tr-kombi-nr { fill: #ffb547; font-size: 13px; font-weight: 700; }
.tr-kombi-leer { fill: var(--leise); font-size: 13px; }
.hi-lauf-schritte { list-style: none; margin: 10px 0 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; counter-reset: schritt; }
.hi-lauf-schritte li { counter-increment: schritt; display: grid; gap: 2px; padding: 8px 10px; border-radius: 12px; background: var(--flaeche); border: 1px solid var(--rand); font-size: 12px; min-width: 0; }
.hi-lauf-schritte li span { color: var(--leise); }
.hi-lauf-schritte li span::before { content: counter(schritt) ". "; color: var(--mint); font-weight: 700; }
.hi-lauf-schritte strong { color: var(--amber); font-size: 15px; overflow-wrap: anywhere; }
.hi-lauf-schritte small { font-size: 11px; }
.hi-laeufe.zwei .hi-lauf-schritte { grid-template-columns: 1fr 1fr; }
.mobil .hi-kombi-wahl, .mobil .hi-laeufe.zwei { grid-template-columns: 1fr; }
.mobil .hi-lauf-schritte { grid-template-columns: 1fr 1fr; }
/* Konstruktion */
.kn-rechner { margin-bottom: 16px; align-items: stretch; }
.kn-karte .chips { margin: 4px 0 10px; }
.kn-karte .chip { padding: 6px 12px; }
.kn-da { font-style: normal; color: var(--mint); font-size: 9px; vertical-align: 2px; }
.kn-stufen .info-zeile { padding: 8px 14px; }
.kn-stufen .kn-empf { background: var(--mint-weich); }
.kn-stufen .kn-empf strong { color: var(--mint); }
.kn-regler { margin: 14px 0 8px; }
.kn-erg .hinweis { margin: 0; }
.kn-erg strong { color: inherit; }
.kn-einsatz-erg { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.kn-gross { display: grid; gap: 2px; padding: 12px 14px; border-radius: 14px; background: var(--mint-weich); border: 1px solid rgba(62,230,168,.3); }
.kn-gross span { font-size: 12px; color: var(--leise); }
.kn-gross strong { font-size: 26px; color: var(--mint); line-height: 1.1; }
.kn-gross small { font-size: 11px; }
.kn-karte .info-liste .info-zeile { padding: 9px 14px; }
.kn-karte > p.klein { margin: 10px 0 0; }
.kn-raster { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 10px; align-items: start; }
.mobil .kn-raster { grid-template-columns: 1fr; }
.kn-bild { width: 96px; height: auto; flex: none; border-radius: 10px; background: rgba(0,0,0,.3); }
.mobil .kn-bild { width: 84px; }
.kn-kopf-text { display: grid; gap: 2px; min-width: 0; }
.kn-kopf-text small { font-size: 12px; }
.kn-punkte { margin-top: 4px; }
.kn-werte { margin-top: 12px; }
.kn-werte .info-zeile { padding: 8px 12px; font-size: 13px; }
.kn-werte strong { color: var(--amber); text-align: right; }
.kn-tab-titel { margin: 12px 0 6px; }
.kn-tabelle { margin-top: 12px; border: 1px solid var(--rand); border-radius: 12px; overflow: hidden; font-size: 13px; }
.kn-tz { display: grid; grid-template-columns: 1.3fr repeat(calc(var(--spalten) - 1), 1fr); gap: 6px; padding: 7px 12px; border-bottom: 1px solid var(--rand); align-items: center; }
.kn-tz:last-child { border-bottom: none; }
.kn-tz span { color: var(--amber); font-variant-numeric: tabular-nums; }
.kn-tk { background: rgba(0,0,0,.25); }
.kn-tk span { color: var(--leise); font-size: 11px; text-transform: uppercase; letter-spacing: .4px; }
.mobil .kn-tz { padding: 7px 10px; font-size: 12px; }
/* Slicer-Lexikon */
.lex-werkzeug { display: flex; margin-bottom: 12px; }
.lex-werkzeug .suche { max-width: 520px; }
.lex-gruppen .chip small { margin-left: 6px; font-size: 11px; color: var(--leise); }
.lex-gruppen .chip.an small { color: var(--mint); }
.lex-gruppe { margin-bottom: 18px; }
.lex-gruppe-titel { margin: 4px 0 10px; font-size: 15px; }
.lex-gruppe-titel small { font-weight: 400; }
.lex-liste { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 8px; align-items: start; }
.mobil .lex-liste { grid-template-columns: 1fr; }
.lex-eintrag .hi-eintrag-kopf { flex-wrap: wrap; row-gap: 2px; padding: 11px 14px; }
.lex-name { display: grid; gap: 1px; min-width: 0; flex: 1 1 180px; }
.lex-name small { color: var(--leise); font-size: 12px; }
.lex-name small::before { content: "("; } .lex-name small::after { content: ")"; }
.lex-ab { order: 3; flex-basis: 100%; font-size: 11px; color: var(--mint); opacity: .8; }
.lex-eintrag .hi-pfeil { order: 2; }
.lex-text { margin: 0; display: grid; gap: 4px; font-size: 14px; line-height: 1.45; }
.lex-text dt { font-size: 11px; text-transform: uppercase; letter-spacing: .6px; color: var(--leise); margin-top: 6px; }
.lex-text dd { margin: 0; }
.lex-text dd.lex-werte { color: var(--amber); }
.lex-anzahl { margin: 0 0 8px; }
/* Druckplatten */
.pl-matrix { display: grid; gap: 4px; }
.pl-zeile { display: grid; grid-template-columns: minmax(56px, .8fr) repeat(5, minmax(0, 1fr)); gap: 4px; align-items: stretch; border-radius: 12px; transition: background .2s; }
.pl-zeile.deine { background: rgba(62,230,168,.07); box-shadow: inset 0 0 0 1px rgba(62,230,168,.3); }
.pl-mat { display: flex; align-items: center; padding-left: 10px; font-size: 14px; }
.pl-zeile.deine .pl-mat { color: var(--mint); }
.pl-spalte { padding: 8px 4px; border-radius: 10px; font-size: 12px; font-weight: 600; color: var(--leise); text-align: center; line-height: 1.2; border: 1px solid transparent; hyphens: manual; }
.pl-spalte:hover { color: var(--text); background: var(--flaeche-hover); }
.pl-spalte.an { color: var(--mint); border-color: rgba(62,230,168,.45); background: var(--mint-weich); }
.pl-spalte.drin::after { content: " ●"; color: var(--mint); font-size: 9px; vertical-align: 1px; }
.pl-zelle { display: grid; place-items: center; gap: 0; padding: 7px 2px; border-radius: 10px; background: rgba(255,255,255,.03); border: 1px solid var(--rand); transition: transform .15s, border-color .15s; min-width: 0; }
.pl-zelle:hover { transform: translateY(-1px); border-color: rgba(255,255,255,.2); }
.pl-zelle b { font-size: 15px; line-height: 1.1; }
.pl-zelle small { font-size: 11px; color: var(--leise); font-variant-numeric: tabular-nums; }
.pl-zelle.ok { background: rgba(62,230,168,.10); border-color: rgba(62,230,168,.28); }
.pl-zelle.ok b { color: var(--mint); }
.pl-zelle.kleber { background: var(--amber-weich); border-color: rgba(255,181,71,.3); }
.pl-zelle.kleber b { color: var(--amber); font-size: 12px; font-weight: 600; }
.pl-zelle.nein b { color: rgba(255,107,107,.75); }
.pl-zelle.nein { opacity: .7; }
.pl-zelle.spalte { box-shadow: 0 0 0 1px rgba(62,230,168,.5); }
.pl-legende { display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 12px 0 4px; font-size: 12px; color: var(--leise); }
.pl-legende b { font-weight: 700; margin-right: 4px; }
.pl-legende .ok { color: var(--mint); } .pl-legende .kleber { color: var(--amber); } .pl-legende .nein { color: var(--rot); }
.pl-detail-kopf { display: flex; gap: 14px; align-items: center; margin-bottom: 12px; }
.pl-detail-kopf h2 { font-size: 18px; }
.pl-detail-kopf p { margin: 4px 0 0; font-size: 14px; }
.pl-bild { width: 120px; height: auto; flex: none; border-radius: 12px; background: rgba(0,0,0,.3); }
.pl-wahl .chip { padding: 6px 12px; }
.mobil .pl-karte { padding: 14px 10px; }
.mobil .pl-zeile { grid-template-columns: 46px repeat(5, minmax(0, 1fr)); gap: 3px; }
.mobil .pl-mat { padding-left: 4px; font-size: 12px; }
.mobil .pl-spalte { font-size: 10px; padding: 6px 1px; }
.mobil .pl-zelle { padding: 6px 1px; }
.mobil .pl-zelle.kleber b { font-size: 9.5px; }
.mobil .pl-zelle small { font-size: 9.5px; }
.mobil .pl-detail-kopf { flex-direction: column; align-items: flex-start; }
.mobil .pl-bild { width: 110px; }
@media (prefers-reduced-motion: reduce) { .hi-lauf { animation: none; } .hi-pfeil, .pl-zelle { transition: none; } }
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
  // Zum Einstellen (ha-bambulab: number.target_*_temperature, fan.*_fan). Mehrere Namen/IDs je nach Version.
  duese_soll: ["Zieltemperatur der Düse", "number.p1s_01p00c572701906_zieltemperatur_der_duse"],
  bett_soll: [["Zieltemperatur des Druckbett", "Zieltemperatur vom Druckbett", "Zieltemperatur des Druckbetts"],
    "number.p1s_01p00c572701906_zieltemperatur_des_druckbett", "number.p1s_01p00c572701906_zieltemperatur_vom_druckbett"],
  f_kopf: ["Druckkopflüfter", "fan.p1s_01p00c572701906_druckkopflufter"],
  f_bauteil: ["Bauteillüfter", "fan.p1s_01p00c572701906_bauteillufter"],
  f_raum: ["Druckraumlüfter", "fan.p1s_01p00c572701906_druckraumlufter"],
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

// Zieltemperaturen, die man hier setzen darf (number.set_value). ziel = Sensor mit dem aktuellen Ziel,
// rolle = Feld der geladenen Rolle für den Schnellknopf, heiss = ab hier nachfragen
const DR_TEMP = {
  duese: { name: "Düse", max: 300, ziel: "duese_ziel", ist: "duese", rolle: "duese", heiss: 270 },
  bett: { name: "Druckbett", max: 110, ziel: "bett_ziel", ist: "bett", rolle: "bett", heiss: 90 },
};
// Lüfter-Kachel (Drehzahl-Sensor) → einstellbarer Lüfter (fan.set_percentage / fan.turn_off)
const DR_LUEFTER = {
  l_kopf: { f: "f_kopf", name: "Druckkopflüfter", info: "Kühlt das frisch gedruckte Filament direkt an der Düse." },
  l_bauteil: { f: "f_bauteil", name: "Bauteillüfter", info: "Großer Lüfter an der Seite, kühlt das ganze Bauteil." },
  l_raum: { f: "f_raum", name: "Druckraumlüfter", info: "Zieht warme Luft aus dem Druckraum. Bei ASA/ABS lieber aus lassen." },
};
const DR_LUEFTER_STUFEN = [0, 10, 30, 50, 80, 100];

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
    // Zuerst, was die Integration bei der Einrichtung gefunden hat
    const konf = this._konfig && this._konfig[steckdose ? "steckdose" : "drucker"];
    if (konf && konf[schluessel] && states[konf[schluessel]]) return (this._drIds[k] = konf[schluessel]);
    const [namen, ...ids] = (steckdose ? DR_STECKDOSE_ENTITAETEN : DR_ENTITAETEN)[schluessel];
    const domain = ids[0].split(".")[0];
    const gefunden = [].concat(namen).map((name) => this._drNamen[`${domain}|${steckdose ? (name ? `${DR_STECKDOSE} ${name}` : DR_STECKDOSE) : `${DR_GERAET} ${name}`}`]).find(Boolean)
      || ids.find((id) => states[id]) || null;
    this._drIds[k] = gefunden;
    return gefunden;
  },
  _drListe() { return (this._konfig && this._konfig.liste) || DR_LISTE; },
  _drSteckdoseName() { return (this._konfig && this._konfig.steckdose_name) || DR_STECKDOSE; },
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
    const kopf = this.shadowRoot.getElementById("dr-live-kopf");
    if (!live || !kopf) return;
    // Während jemand eine Zieltemperatur tippt, nicht dazwischenfunken
    const aktiv = this.shadowRoot.activeElement;
    if (aktiv && aktiv.dataset && aktiv.dataset.drTemp != null && live.contains(aktiv)) { this._drHassNeu(); return; }
    const zustand = this._drZustand();
    if (zustand !== this._drLetzterZustand) { this._zeichnen(); return; }   // z. B. eingeschaltet: alles neu
    kopf.innerHTML = this._drLiveHtml("kopf");
    live.innerHTML = this._drLiveHtml("rest");
    this._drKameraPruefen();
  },

  _drHtml() {
    if (!this._drVerlauf && !this._drVerlaufLaedt) this._drVerlaufLaden();
    const zustand = this._drZustand();
    this._drLetzterZustand = zustand;
    setTimeout(() => this._drKameraPruefen(), 0);
    return `<div class="dr-raster">
        <div class="dr-spalte">
          <section id="dr-live-kopf" class="dr-live">${this._drLiveHtml("kopf")}</section>
          ${this._drFilamentHtml()}
          <section id="dr-live" class="dr-live">${this._drLiveHtml("rest")}</section>
        </div>
        <div class="dr-spalte">
          ${this._drKameraHtml(zustand)}
          ${this._drVerlaufHtml()}
        </div>
      </div>`;
  },

  _drLiveHtml(teil) {
    const zustand = this._drZustand();
    const z = (k, nk = 0) => { const v = this._drZ(k); return v == null ? "–" : zahl(v, nk); };
    if (teil === "kopf") return this._drKopfHtml(zustand, z);
    return this._drWerteHtml(zustand);
  },

  // Statuskarte oben (Ring, Name, Restzeit) bzw. „Drucker ist aus“
  _drKopfHtml(zustand, z) {
    let html = "";

    if (zustand === "aus" || zustand === "startet" || zustand === "offline") {
      const text = zustand === "aus" ? ["Drucker ist aus", "Die Steckdose ist ausgeschaltet. Schalte sie ein, dann erscheinen hier nach etwa 15–30 Sekunden die Werte."]
        : zustand === "startet" ? ["Drucker startet …", "Die Steckdose ist an. Der Drucker meldet sich meist nach 15–30 Sekunden. Bis dahin sind die Werte vom letzten Druck."]
        : ["Drucker nicht erreichbar", "Home Assistant bekommt gerade keine Werte vom Drucker (Bambu-Cloud oder WLAN)."];
      html += `<div class="dr-karte dr-aus"><div class="dr-aus-icon">${zustand === "startet" ? '<span class="dreher"></span>' : "⏻"}</div>
        <div><h2>${text[0]}</h2><p class="leise">${text[1]}</p>
          ${zustand === "aus" && this._drId("schalter", true) ? this._drSchaltKnopf("an") : ""}</div></div>`;
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
    return html;
  },

  // Temperaturen, Lüfter, Strom, Infos
  _drWerteHtml(zustand) {
    let html = "";
    const aus = ["aus", "startet", "offline"].includes(zustand);
    // Temperaturen
    const temp = (titel, k, ist, ziel) => {
      const max = DR_TEMP[k].max;
      const i = this._drZ(ist), s = this._drZ(`${k}_soll`) != null ? this._drZ(`${k}_soll`) : this._drZ(ziel);   // einstellbare Entität zuerst
      const heizt = s && i != null && Math.abs(s - i) > 3;
      const breite = Math.max(0, Math.min(100, ((i || 0) / max) * 100));
      return `<div class="dr-temp">
        <div class="dr-temp-kopf"><span>${titel}</span><strong>${i == null ? "–" : zahl(i)} °C</strong></div>
        <div class="dr-balken"><i style="width:${breite}%;background-size:${breite > 0 ? 10000 / breite : 100}% 100%"></i>${s ? `<b style="left:${Math.min(100, (s / max) * 100)}%"></b>` : ""}</div>
        <div class="dr-temp-fuss"><small class="${heizt ? "amber" : "leise"}">${s ? `Ziel ${zahl(s)} °C${heizt ? (s > i ? " · heizt auf" : " · kühlt ab") : " · erreicht"}` : "aus"}</small>
          ${this._drSollHtml(k, s)}</div>
      </div>`;
    };
    if (!aus) html += `<div class="dr-karte"><h3 class="dr-titel">🌡️ Temperaturen</h3>
      ${temp("Düse", "duese", "duese", "duese_ziel")}${temp("Druckbett", "bett", "bett", "bett_ziel")}</div>`;

    // Lüfter
    const luefter = [["Bauteil", "l_bauteil"], ["Druckkopf", "l_kopf"], ["Hotend", "l_hotend"], ["Druckraum", "l_raum"]].filter(([, k]) => this._drId(k));
    if (luefter.length && !aus) {
      const steuerbar = luefter.some(([, k]) => DR_LUEFTER[k] && this._drId(DR_LUEFTER[k].f));
      html += `<div class="dr-karte"><h3 class="dr-titel">🌀 Lüfter${steuerbar ? `<span class="leise klein dr-titel-zusatz">zum Einstellen antippen</span>` : ""}</h3><div class="dr-luefter">${luefter.map(([n, k]) => {
        const f = DR_LUEFTER[k] && this._drId(DR_LUEFTER[k].f) ? DR_LUEFTER[k].f : null;
        const v = this._drLuefterWert(k) || 0;
        const inhalt = `<span class="dr-l-icon ${v > 0 ? "dreht" : ""}" style="--dauer:${v > 0 ? Math.max(0.25, 2 - v / 60) : 0}s">✣</span><strong>${zahl(v)} %</strong><small>${n}</small>`;
        return f ? `<button class="dr-l dr-l-knopf" data-aktion="dr-luefter" data-k="${k}" aria-label="${esc(DR_LUEFTER[k].name)} einstellen, jetzt ${zahl(v)} %">${inhalt}<i class="dr-l-stift" aria-hidden="true">✎</i></button>`
          : `<div class="dr-l" title="Regelt der Drucker selbst">${inhalt}</div>`;
      }).join("")}</div></div>`;
    }

    // Strom aus der Steckdose
    const w = this._drZ("watt", true);
    html += `<div class="dr-karte"><h3 class="dr-titel">⚡ Strom</h3><div class="dr-werte dr-werte-3">
      <div><span>Jetzt</span><strong>${w == null ? "–" : `${zahl(w, w < 10 ? 1 : 0)} W`}</strong></div>
      <div><span>Heute</span><strong>${this._drZ("heute", true) == null ? "–" : `${zahl(this._drZ("heute", true), 2)} kWh`}</strong></div>
      <div><span>Diesen Monat</span><strong>${this._drZ("monat", true) == null ? "–" : `${zahl(this._drZ("monat", true), 2)} kWh`}</strong></div>
    </div><div class="dr-steckdose"><span class="leise klein">Steckdose: ${this._drW("schalter", true) === "on" ? "an" : this._drW("schalter", true) === "off" ? "aus" : "nicht gefunden"}</span>
      ${this._drId("schalter", true) ? this._drSchaltKnopf(this._drW("schalter", true) === "on" ? "aus" : "an") : ""}</div></div>`;

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
      const r = await this._hass.callWS({ type: "todo/item/list", entity_id: this._drListe() });
      this._drVerlauf = (r.items || []).map(druckDaten).sort((a, b) => (b.start || "").localeCompare(a.start || ""));
      this._drVerlaufFehler = null;
    } catch (e) {
      this._drVerlauf = [];
      this._drVerlaufFehler = e.message || String(e);
    }
    this._drVerlaufLaedt = false;
    if (!this._modus && !this._ddOffen) this._zeichnen();
    this._drFotosLaden();
    this._buNachLaden();
  },
  async _drFotosLaden() {
    this._drFotos = this._drFotos || {};
    for (const d of this._buAlle().slice(0, 30)) {
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
    const liste = this._drVerlauf ? this._buAlle() : null;
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
        const g = extra.gebucht;
        const [st, farbe] = g ? (g.ergebnis === "fehl" ? ["Fehldruck", "rot"] : g.ergebnis === "anders" ? ["abgebrochen", "leise"] : ["verbucht", "mint"])
          : d.status === "finish" ? ["fertig", "amber"] : d.status === "failed" ? ["abgebrochen", "rot"] : d.status === "laeuft" ? ["läuft / ohne Abschluss", "amber"] : [d.status, "leise"];
        return `<button class="dr-druck" data-aktion="dr-druck" data-uid="${esc(d.uid)}">
          <span class="ld-bild" data-foto="${esc(f || "")}">${foto ? `<img src="${esc(foto)}" alt="">` : "🖼️"}</span>
          <span class="dr-druck-text"><strong>${esc(d.name)}</strong>
            <small>${esc(d.zeit)}${d.gewicht != null ? ` · ${zahl(d.gewicht, 1)} g` : ""}${d.duese_mm ? ` · ${zahl(d.duese_mm, 1)} mm Düse` : ""}${g ? ` · ${esc((this._daten.rollen.find((r) => r.id === g.rolle) || {}).name || "")}` : ""}${d.hand ? " · von Hand" : ""}</small>
            ${extra.kommentar ? `<small class="dr-kommentar">💬 ${esc(extra.kommentar)}</small>` : ""}</span>
          <span class="pille ${farbe}">${st}</span>
        </button>`;
      }).join("")}</div>
      ${liste.length > 8 ? `<button class="mini mint-rand" data-aktion="dr-alle">${this._drAlle ? "Weniger zeigen" : `Alle ${liste.length} Drucke zeigen`}</button>` : ""}`;
    }
    return `<div class="dr-karte"><div class="dr-kamera-kopf"><h3 class="dr-titel">🗂️ Druckverlauf</h3>
      <span class="chips"><button class="chip" data-aktion="bu-hand">＋ Nachtragen</button><button class="chip" data-aktion="dr-neu-laden">↻ Aktualisieren</button></span></div>${inhalt}</div>`;
  },

  _drDialogHtml() {
    const d = this._buAlle().find((x) => x.uid === this._drOffen);
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
      ${this._drBuchungHtml(d, extra)}
      <h3>Kommentar</h3>
      <textarea id="dr-kommentar" rows="4" placeholder="z. B. warum abgebrochen, was du gelernt hast …">${esc(extra.kommentar || "")}</textarea>
      <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="dialog-zu">Schließen</button>
        <button class="knopf" data-aktion="dr-kommentar-speichern">Speichern</button></div>`;
  },

  _drBuchungHtml(d, extra) {
    const g = extra.gebucht;
    if (!g) {
      return BU_ENDE.includes(d.status) ? `<div class="hinweis amber oben-abstand">Noch nicht verbucht${extra.ignoriert ? " (übersprungen)" : ""}.
        <button class="mini" data-aktion="bu-start" data-uid="${esc(d.uid)}">Jetzt verbuchen</button></div>` : "";
    }
    const rolle = this._daten.rollen.find((r) => r.id === g.rolle);
    const k = g.kosten || {};
    const kosten = (k.filament || 0) + (k.strom || 0);
    const fehl = extra.fehl;
    return `<h3>Verbucht</h3><div class="info-liste">
      <div class="info-zeile"><span>Rolle</span><strong>${esc(rolle ? rolle.name : "gelöscht")}</strong></div>
      <div class="info-zeile"><span>Abgezogen</span><strong>${zahl(g.g, 1)} g${g.wechsel ? ` + ${zahl(g.wechsel.g, 2)} g Reststück` : ""}</strong></div>
      <div class="info-zeile"><span>Ergebnis</span><strong>${g.ergebnis === "fehl" ? "Fehldruck" : g.ergebnis === "anders" ? "anders überlegt" : "geglückt"}</strong></div>
      ${kosten ? `<div class="info-zeile"><span>Kosten</span><strong>${zahl(kosten, 2)} €${k.kwh != null ? ` (${zahl(k.kwh, 3)} kWh)` : ""}</strong></div>` : ""}
      ${fehl ? `<div class="info-zeile"><span>Ursachen</span><strong>${esc((fehl.ursachen || []).map((id) => (fehlerbild(id) || {}).name).filter(Boolean).join(", ") || "–")}</strong></div>` : ""}
    </div><button class="mini" data-aktion="bu-rueckgaengig" data-uid="${esc(d.uid)}">Buchung rückgängig machen</button>`;
  },

  // ---- Steckdose schalten (immer mit Nachfrage) --------------------------
  _drSchaltKnopf(ziel) {
    if (this._drSchaltet) return `<button class="knopf leise klein-knopf" disabled><span class="dreher klein"></span> Schaltet …</button>`;
    return ziel === "an"
      ? `<button class="knopf klein-knopf" data-aktion="dr-schalten" data-ziel="an">⏻ Einschalten</button>`
      : `<button class="knopf rot-knopf klein-knopf" data-aktion="dr-schalten" data-ziel="aus">⏻ Ausschalten</button>`;
  },

  _drSchaltDialogHtml() {
    const an = this._drSchaltZiel === "an";
    if (an) {
      return `<h2>Drucker einschalten?</h2>
        <p class="leise">Die Steckdose „${esc(this._drSteckdoseName())}“ wird eingeschaltet. Der Drucker meldet sich nach etwa 15–30 Sekunden.</p>
        <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="dialog-zu">Abbrechen</button>
          <button class="knopf" data-aktion="dr-schalten-ok">Einschalten</button></div>`;
    }
    const status = this._drZustand();
    const druckt = ["running", "pause", "prepare", "slicing"].includes(status);
    const duese = this._drZ("duese");
    const heiss = duese != null && duese > 50;
    return `<h2>Drucker ausschalten?</h2>
      ${druckt ? `<div class="hinweis rot-hinweis"><strong>Achtung, es läuft ein Druck.</strong> Ausschalten bricht ihn sofort ab und er ist verloren.</div>` : ""}
      ${heiss ? `<div class="hinweis amber">Die Düse ist noch ${zahl(duese)} °C heiß. Der Hotend-Lüfter braucht Strom, um sie abzukühlen. Besser warten, bis sie unter 50 °C ist, sonst kann das Filament im Hotend verstopfen.</div>` : ""}
      ${!druckt && !heiss ? `<p class="leise">Die Steckdose „${esc(this._drSteckdoseName())}“ wird ausgeschaltet. Es läuft kein Druck und die Düse ist kalt.</p>` : ""}
      <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="dialog-zu">Abbrechen</button>
        <button class="knopf rot-knopf" data-aktion="dr-schalten-ok">${druckt ? "Trotzdem ausschalten" : "Ausschalten"}</button></div>`;
  },

  async _drSchalten() {
    const id = this._drId("schalter", true);
    const ziel = this._drSchaltZiel;
    this._dialog = null;
    this._drSchaltet = true;
    this._zeichnen();
    try {
      await this._hass.callService("switch", ziel === "an" ? "turn_on" : "turn_off", { entity_id: id });
    } catch (e) {
      this._drSchaltet = false;
      this._toast(`Schalten hat nicht geklappt: ${e.message || e}`);
      return;
    }
    // Warten, bis Home Assistant den neuen Zustand meldet (meist ca. 3 s)
    const soll = ziel === "an" ? "on" : "off";
    const start = Date.now();
    const pruefen = () => {
      if (this._drW("schalter", true) === soll) {
        this._drSchaltet = false;
        this._toast(ziel === "an" ? "Steckdose ist an. Der Drucker startet." : "Steckdose ist aus.");
        return;
      }
      if (Date.now() - start > 15000) {
        this._drSchaltet = false;
        this._toast("Die Steckdose hat nicht geantwortet. Bitte in Home Assistant prüfen.");
        return;
      }
      setTimeout(pruefen, 500);
    };
    setTimeout(pruefen, 500);
  },

  // ---- Geladenes Filament (this._daten.geladen = Rollen-ID oder null) ----
  _drGeladen() {
    const id = this._daten && this._daten.geladen;
    return id ? this._daten.rollen.find((r) => r.id === id) || null : null;
  },
  _drLadenSetzen(id) {
    const alt = this._drGeladen();
    this._daten.geladen = id || null;
    this._speichern();
    const r = this._drGeladen();
    this._toast(r ? `${r.name} ist jetzt als geladen markiert.` : alt ? `${alt.name} ist nicht mehr geladen.` : "Kein Filament geladen.");
  },
  _drFilamentHtml() {
    if (!this._daten) return "";
    const r = this._drGeladen();
    const rollen = this._daten.rollen.slice().sort((a, b) => a.name.localeCompare(b.name, "de"));
    const mats = [...new Set(rollen.map((x) => x.material))].sort((a, b) => a.localeCompare(b, "de"));
    const optionen = mats.map((m) => `<optgroup label="${esc(m)}">${rollen.filter((x) => x.material === m).map((x) =>
      `<option value="${esc(x.id)}" ${r && x.id === r.id ? "selected" : ""}>${esc(x.name)} · ${esc(x.hersteller)}${x.rest_g != null ? ` · ${zahl(x.rest_g)} g` : ""}</option>`).join("")}</optgroup>`).join("");
    return `<section class="dr-karte dr-filament ${r ? "geladen" : ""}" id="dr-filament">
      <h3 class="dr-titel">🧵 Geladenes Filament</h3>
      <div class="dr-fil-zeile">
        <span class="dr-fil-spule">${r ? spuleSvg(r) : `<span class="dr-fil-leer" aria-hidden="true">∅</span>`}</span>
        <span class="dr-fil-text">${r
          ? `<strong>${esc(r.name)}</strong><small>${esc(r.hersteller)} · ${esc(sorteName(r))} · ${r.rest_g == null ? "nicht gewogen" : `${zahl(r.rest_g)} g übrig`}</small>`
          : `<strong>Kein Filament geladen</strong><small>Wähle die Rolle, die gerade im Drucker steckt. Sie wird beim Verbuchen zuerst vorgeschlagen.</small>`}</span>
        ${r ? `<span class="pille gruen">● geladen</span>` : ""}
      </div>
      <div class="dr-fil-wahl">
        <label class="auswahl breit-auswahl"><span>${r ? "Andere Rolle laden" : "Rolle wählen"}</span><select data-dr="geladen">${r ? "" : `<option value="" selected disabled>Rolle wählen …</option>`}${optionen}</select></label>
        <button class="knopf leise klein-knopf" data-aktion="dr-laden" data-id="" ${r ? "" : "disabled"}>Kein Filament geladen</button>
      </div>
      ${r ? `<button class="mini mint-rand" data-aktion="oeffnen-filament" data-id="${esc(r.id)}">Einstellungen der Rolle ›</button>` : ""}
    </section>`;
  },

  // ---- Zieltemperatur setzen (number.set_value) -------------------------
  _drSollHtml(k, s) {
    if (!this._drId(`${k}_soll`)) return "";
    const d = DR_TEMP[k];
    const entwurf = (this._drTempEntwurf || {})[k];
    const sendet = this._drTempSendet === k;
    const r = this._drGeladen();
    const rw = r ? wert(r, d.rolle).v : null;
    return `<span class="dr-soll">
      ${rw != null && rw !== s ? `<button class="chip dr-rolle-chip" data-aktion="dr-temp" data-k="${k}" data-wert="${rw}" title="Wert der geladenen Rolle ${esc(r.name)}" ${sendet ? "disabled" : ""}>🧵 ${zahl(rw)} °C</button>` : ""}
      <input type="number" inputmode="numeric" min="0" max="${d.max}" step="1" data-dr-temp="${k}" value="${esc(entwurf == null ? "" : entwurf)}"
        placeholder="${s ? zahl(s) : "0"}" aria-label="Neue Zieltemperatur ${d.name} in °C (0 bis ${d.max})" class="${this._drTempFehler === k ? "fehler" : ""}"><span class="dr-einheit">°C</span>
      <button class="mini mint-rand" data-aktion="dr-temp" data-k="${k}" ${sendet ? "disabled" : ""}>${sendet ? `<span class="dreher klein"></span>` : "Setzen"}</button>
    </span>`;
  },
  _drTempAnfrage(k, roh) {
    const d = DR_TEMP[k];
    const text = String(roh == null ? "" : roh).trim().replace(",", ".");
    const v = Number(text);
    if (text === "" || !Number.isFinite(v) || v < 0 || v > d.max) {
      this._drTempFehler = k;
      this._toast(text === "" ? `Bitte eine Zieltemperatur für ${d.name} eingeben (0–${d.max} °C).` : `${d.name}: nur 0–${d.max} °C möglich.`);
      return;
    }
    this._drTempFehler = null;
    const w = Math.round(v);
    this._drTempWunsch = { k, wert: w, warnungen: this._drTempWarnungen(k, w) };
    if (this._drTempWunsch.warnungen.length) { this._dialog = "dr-temp"; this._zeichnen(); return; }
    this._drTempSenden();
  },
  // Nachfragen nur, wenn es etwas zu bedenken gibt
  _drTempWarnungen(k, w) {
    const d = DR_TEMP[k];
    const liste = [];
    const druckt = ["running", "pause", "prepare", "slicing"].includes(this._drZustand());
    if (druckt) liste.push(w === 0 ? { rot: true, text: "Es läuft ein Druck. Mit 0 °C schaltest du die Heizung ab, der Druck misslingt dann." }
      : { text: "Es läuft ein Druck. Die neue Temperatur gilt sofort für diesen Druck, bis der G-Code sie wieder ändert." });
    if (w >= d.heiss) liste.push({ text: k === "duese" ? `${w} °C an der Düse ist sehr heiß. Das brauchen nur Materialien wie ASA, PC oder PA.`
      : `${w} °C am Druckbett ist sehr heiß, nur für ABS, ASA oder PC sinnvoll. Nicht anfassen.` });
    const r = this._drGeladen();
    const rw = r ? wert(r, d.rolle).v : null;
    if (rw != null && w > 0 && Math.abs(w - rw) >= 25) liste.push({ text: `Für die geladene Rolle „${r.name}“ sind ${zahl(rw)} °C eingetragen.` });
    return liste;
  },
  _drTempDialogHtml() {
    const w = this._drTempWunsch;
    if (!w) return "";
    const d = DR_TEMP[w.k];
    const ist = this._drZ(d.ist), ziel = this._drZ(d.ziel);
    const rot = w.warnungen.some((x) => x.rot);
    return `<h2>${d.name} ${w.wert === 0 ? "ausschalten" : `auf ${w.wert} °C setzen`}?</h2>
      <p class="leise">Jetzt ${ist == null ? "–" : zahl(ist)} °C${ziel ? `, Ziel ${zahl(ziel)} °C` : ", Heizung aus"}.</p>
      ${w.warnungen.map((x) => `<div class="hinweis ${x.rot ? "rot-hinweis" : "amber"}">${esc(x.text)}</div>`).join("")}
      <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="dialog-zu">Abbrechen</button>
        <button class="knopf ${rot ? "rot-knopf" : ""}" data-aktion="dr-temp-ok">${w.wert === 0 ? "Heizung aus" : `Auf ${w.wert} °C setzen`}</button></div>`;
  },
  async _drTempSenden() {
    const w = this._drTempWunsch;
    if (!w) return;
    const d = DR_TEMP[w.k];
    const id = this._drId(`${w.k}_soll`);
    this._dialog = null;
    this._drTempSendet = w.k;
    this._zeichnen();
    try {
      await this._hass.callService("number", "set_value", { entity_id: id, value: w.wert });
    } catch (e) {
      this._drTempSendet = null;
      this._toast(`${d.name}: Senden hat nicht geklappt (${e.message || e}).`);
      return;
    }
    if (this._drTempEntwurf) delete this._drTempEntwurf[w.k];
    const ok = await this._drWarten(() => this._drZ(`${w.k}_soll`) === w.wert || this._drZ(d.ziel) === w.wert, 10000);
    this._drTempSendet = null;
    this._toast(ok ? (w.wert === 0 ? `${d.name}: Heizung ist aus.` : `${d.name}: Ziel ${w.wert} °C übernommen.`)
      : `${d.name}: ${w.wert} °C gesendet, der Drucker hat es noch nicht bestätigt.`);
  },
  // Warten, bis Home Assistant den neuen Zustand meldet
  _drWarten(pruef, max) {
    const start = Date.now();
    return new Promise((fertig) => {
      const schritt = () => {
        if (pruef()) fertig(true);
        else if (Date.now() - start > max) fertig(false);
        else setTimeout(schritt, 400);
      };
      setTimeout(schritt, 400);
    });
  },

  // ---- Lüfter einstellen (fan.set_percentage / fan.turn_off) ------------
  _drLuefterWert(k) {
    const f = DR_LUEFTER[k] && this._drS(DR_LUEFTER[k].f);
    if (f && f.state === "off") return 0;
    if (f && f.attributes && f.attributes.percentage != null && !isNaN(Number(f.attributes.percentage))) return Number(f.attributes.percentage);
    return this._drZ(k);
  },
  _drLuefterDialogHtml() {
    const k = this._drLuefterK, L = DR_LUEFTER[k];
    if (!L) return "";
    const v = this._drLuefterWert(k) || 0;
    const druckt = ["running", "pause", "prepare", "slicing"].includes(this._drZustand());
    const sendet = this._drLuefterSendet;
    return `<h2>🌀 ${L.name}</h2>
      <p class="leise">Läuft gerade mit <strong class="tx">${zahl(v)} %</strong>. ${esc(L.info)}</p>
      ${druckt ? `<div class="hinweis amber">Es läuft ein Druck: Der Drucker stellt die Lüfter selbst per G-Code ein und kann deinen Wert beim nächsten Befehl wieder ändern.</div>` : ""}
      <div class="chips dr-stufen">${DR_LUEFTER_STUFEN.map((p) => `<button class="chip ${p === v ? "an" : ""}" data-aktion="dr-luefter-setzen" data-wert="${p}" ${sendet ? "disabled" : ""}>${p === 0 ? "Aus" : `${p} %`}</button>`).join("")}</div>
      <div class="feld"><span>Eigener Wert (0–100 %)</span>
        <span class="dr-soll breit"><input type="number" inputmode="numeric" min="0" max="100" step="10" data-dr-luefter value="${esc(this._drLuefterEntwurf == null ? "" : this._drLuefterEntwurf)}" placeholder="${zahl(v)}" aria-label="${L.name} in Prozent"><span class="dr-einheit">%</span>
        <button class="knopf klein-knopf" data-aktion="dr-luefter-setzen" ${sendet ? "disabled" : ""}>${sendet ? `<span class="dreher klein"></span> Sendet …` : "Setzen"}</button></span></div>
      <p class="leise klein">Der Drucker stellt in 10-%-Schritten ein, krumme Werte werden gerundet.</p>
      <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="dialog-zu">Schließen</button></div>`;
  },
  async _drLuefterSetzen(roh) {
    const k = this._drLuefterK, L = DR_LUEFTER[k];
    const id = L && this._drId(L.f);
    if (!id || this._drLuefterSendet) return;
    const text = String(roh == null ? "" : roh).trim().replace(",", ".").replace("%", "").trim();
    const v = Number(text);
    if (text === "" || !Number.isFinite(v) || v < 0 || v > 100) {
      this._toast(text === "" ? "Bitte einen Wert von 0 bis 100 % eingeben." : `${L.name}: nur 0–100 % möglich.`);
      return;
    }
    const p = Math.round(v / 10) * 10;
    this._drLuefterSendet = true;
    this._zeichnen();
    try {
      if (p === 0) await this._hass.callService("fan", "turn_off", { entity_id: id });
      else await this._hass.callService("fan", "set_percentage", { entity_id: id, percentage: p });
    } catch (e) {
      this._drLuefterSendet = false;
      this._toast(`${L.name}: Senden hat nicht geklappt (${e.message || e}).`);
      return;
    }
    this._drLuefterEntwurf = null;
    const ok = await this._drWarten(() => this._drLuefterWert(k) === p, 8000);
    this._drLuefterSendet = false;
    if (this._dialog === "dr-luefter") this._dialog = null;
    const gerundet = p !== v ? ` (gerundet von ${zahl(v)} %)` : "";
    this._toast(ok ? (p === 0 ? `${L.name} ist aus.` : `${L.name} läuft mit ${p} %${gerundet}.`)
      : `${L.name}: ${p} % gesendet, der Drucker hat es noch nicht bestätigt.`);
  },

  // ---- Eingaben, von panel.js weitergereicht -----------------------------
  _drEingabe(t) {
    if (t.dataset.drTemp != null) { (this._drTempEntwurf = this._drTempEntwurf || {})[t.dataset.drTemp] = t.value; t.classList.remove("fehler"); return true; }
    if (t.dataset.drLuefter != null) { this._drLuefterEntwurf = t.value; return true; }
    return false;
  },
  _drAenderung(t) {
    if (t.dataset.dr === "geladen") { if (t.value) this._drLadenSetzen(t.value); return true; }
    return false;
  },
  _drTaste(e) {
    const t = e.target;
    if (e.key !== "Enter" || !t.dataset) return false;
    if (t.dataset.drTemp != null) { e.preventDefault(); this._drTempAnfrage(t.dataset.drTemp, t.value); return true; }
    if (t.dataset.drLuefter != null) { e.preventDefault(); this._drLuefterSetzen(t.value); return true; }
    return false;
  },

  _drKlick(a, el) {
    switch (a) {
      case "dr-laden": this._drLadenSetzen(el.dataset.id); return;
      case "dr-temp": {
        const k = el.dataset.k;
        let roh = el.dataset.wert;
        if (roh == null) {
          const i = this.shadowRoot.querySelector(`[data-dr-temp="${k}"]`);
          roh = i ? i.value : "";
          (this._drTempEntwurf = this._drTempEntwurf || {})[k] = roh;
        }
        this._drTempAnfrage(k, roh);
        return;
      }
      case "dr-temp-ok": this._drTempSenden(); return;
      case "dr-luefter": this._drLuefterK = el.dataset.k; this._drLuefterEntwurf = null; this._dialog = "dr-luefter"; break;
      case "dr-luefter-setzen": {
        const i = this.shadowRoot.querySelector("[data-dr-luefter]");
        this._drLuefterSetzen(el.dataset.wert != null ? el.dataset.wert : i ? i.value : "");
        return;
      }
      case "dr-schalten": this._drSchaltZiel = el.dataset.ziel; this._dialog = "dr-schalten"; break;
      case "dr-schalten-ok": this._drSchalten(); return;
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
// Verbuchen: nach jedem Druck fragen, welche Rolle benutzt wurde, und den
// Verbrauch abziehen (Druck + Anfangslinie + Extruder-Fahrten, beim Rollenwechsel
// das Reststück von der alten Rolle). Abbruch: Fehldruck oder anders überlegt.
// Fehldruck: Fragenkatalog → Ursachen → Änderungen, rotes Ausrufezeichen an der Rolle.
// ---------------------------------------------------------------------------

const BU_ENDE = ["finish", "failed"];

const BuchenAnsicht = {
  // Alle Drucke: Liste aus Home Assistant + von Hand nachgetragene
  _buAlle() {
    const hand = Object.entries(this._daten.drucke || {}).filter(([, x]) => x.hand).map(([uid, x]) => ({
      uid, titel: x.hand.name, name: x.hand.name, zeit: new Date(x.hand.start).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" }),
      gewicht: x.hand.gewicht, laenge: null, duese_c: null, bett_c: null, duese_mm: null, start: x.hand.start, ende: x.hand.start,
      status: x.hand.status || "finish", fortschritt: x.hand.status === "failed" ? x.hand.fortschritt : 100, hand: true,
    }));
    return [...(this._drVerlauf || []), ...hand].sort((a, b) => (b.start || "").localeCompare(a.start || ""));
  },
  _buExtra(uid) { return (this._daten.drucke || {})[uid] || {}; },
  _buOffene() {
    if (!this._daten || !this._drVerlauf) return [];
    const ab = this._daten.buchen_ab || "";
    return this._buAlle().filter((d) => {
      const x = this._buExtra(d.uid);
      return BU_ENDE.includes(d.status) && !x.gebucht && !x.ignoriert && !d.hand && !d.erledigt && (d.ende || d.start || "") >= ab;
    });
  },

  // Druckstatus beobachten: nach dem Ende den Verlauf neu laden (Automation schreibt mit Verzögerung)
  _buHassNeu() {
    if (!this._daten) return;
    const s = this._drW && this._drW("status");
    if (s && s !== this._buStatus) {
      const vorher = this._buStatus;
      this._buStatus = s;
      if (vorher && ["running", "pause", "prepare"].includes(vorher) && BU_ENDE.includes(s)) {
        [20000, 60000, 120000].forEach((t) => setTimeout(() => this._drVerlaufLaden(), t));
      }
    }
  },

  // Nach dem Laden des Verlaufs: einmal pro Sitzung von selbst nachfragen
  _buNachLaden() {
    const offen = this._buOffene();
    if (!offen.length || this._modus || this._dialog) return;
    this._buGezeigt = this._buGezeigt || new Set();
    const d = offen.find((x) => !this._buGezeigt.has(x.uid));
    if (!d) return;
    this._buGezeigt.add(d.uid);
    if (d.status === "failed") return;   // Abbruch: erst über den roten Balken fragen
    this._buStarten(d.uid);
    this._zeichnen();
  },

  // Balken oben: Abbruch rot, fertige Drucke mint
  _buBalkenHtml() {
    const offen = this._buOffene();
    if (!offen.length || this._ansicht === "system") return "";
    const d = offen[offen.length - 1];
    const weitere = offen.length > 1 ? ` <span class="bu-mehr">+${offen.length - 1} weitere</span>` : "";
    if (d.status === "failed") {
      return `<div class="bu-balken rot" data-einmal="bu-${esc(d.uid)}" role="alert">
        <span class="bu-text">⛔ <strong>${esc(d.name)}</strong> wurde abgebrochen${d.fortschritt != null ? ` (bei ${zahl(d.fortschritt)} %)` : ""}. Fehldruck oder anders überlegt?${weitere}</span>
        <span class="bu-knoepfe"><button class="knopf rot-knopf klein-knopf" data-aktion="bu-start" data-uid="${esc(d.uid)}" data-ergebnis="fehl">Fehldruck</button>
        <button class="knopf leise klein-knopf" data-aktion="bu-start" data-uid="${esc(d.uid)}" data-ergebnis="anders">Anders überlegt</button></span></div>`;
    }
    return `<div class="bu-balken" data-einmal="bu-${esc(d.uid)}">
      <span class="bu-text">✅ <strong>${esc(d.name)}</strong> ist fertig${d.gewicht != null ? ` (${zahl(d.gewicht, 1)} g)` : ""}. Verbrauch verbuchen?${weitere}</span>
      <span class="bu-knoepfe"><button class="knopf klein-knopf" data-aktion="bu-start" data-uid="${esc(d.uid)}">Verbuchen</button></span></div>`;
  },

  // ---- Dialog ----
  _buStarten(uid, ergebnis) {
    const d = this._buAlle().find((x) => x.uid === uid);
    if (!d) return;
    const vor = this._buVorschlaege(d);
    this._bu = {
      uid, ergebnis: ergebnis || (d.status === "failed" ? "fehl" : "ok"),
      fortschritt: d.status === "failed" ? (d.fortschritt != null ? d.fortschritt : 50) : 100,
      rolleId: vor[0] ? vor[0].rolle.id : null, schritt: "buchen", wann: null, bilder: [], extra: {}, waehlen: false, strom: "laedt", uebernehmen: {},
    };
    this._bu.wann = wannAusFortschritt(this._bu.fortschritt);
    this._dialog = "bu";
    this._buStromLaden(d);
  },

  // Material aus der Düsentemperatur raten (im Eintrag festgehalten)
  _buMaterialRaten(d) {
    const t = d.duese_c;
    if (!t) return null;
    if (t <= 232) return ["PLA", "TPU"];
    if (t <= 258) return ["PETG", "ABS"];
    return ["ASA", "ABS", "PC"];
  },
  _buBedarf(d, rolle, fortschritt) {
    const e = this._daten.einstellungen;
    const anteil = Math.max(0, Math.min(100, fortschritt)) / 100;
    const korr = (rolle && e.korrektur[rolle.material]) || 1;
    const druck = (d.gewicht || 0) * anteil * korr;
    return { druck, fix: e.linie_g + e.extruder_g, summe: druck + e.linie_g + e.extruder_g, korr };
  },
  _buVorschlaege(d) {
    const mats = this._buMaterialRaten(d);
    const letzte = this._daten.letzte_rolle;
    const bedarf = (d.gewicht || 0) + 0.5;
    return this._daten.rollen.map((r) => {
      let p = 0;
      const gruende = [];
      if (r.id === this._daten.geladen) { p += 10; gruende.push("ist geladen"); }   // immer zuerst
      else if (r.id === letzte) { p += 4; gruende.push("zuletzt benutzt"); }
      if (mats) { if (mats.includes(r.material)) { p += 3; gruende.push(`${zahl(d.duese_c)} °C passt zu ${r.material}`); } else p -= 3; }
      if (r.rest_g != null) { if (r.rest_g >= bedarf) p += 1; else { p -= 4; gruende.push("zu wenig Rest"); } }
      if (r.probiert) p += 0.5;
      return { rolle: r, p, gruende };
    }).sort((a, b) => b.p - a.p).slice(0, 3);
  },

  async _buStromLaden(d) {
    const id = this._drId && this._drId("monat", true);
    const bu = this._bu;
    if (!id || !d.start || !d.ende || d.hand) { bu.strom = null; return; }
    try {
      const vorher = new Date(new Date(d.start).getTime() - 60000).toISOString();
      const nachher = new Date(new Date(d.ende).getTime() + 60000).toISOString();
      const r = await this._hass.callWS({ type: "history/history_during_period", start_time: vorher, end_time: nachher, entity_ids: [id], minimal_response: true, no_attributes: true });
      const werte = ((r && r[id]) || []).map((x) => Number(x.s != null ? x.s : x.state)).filter((x) => !isNaN(x));
      let kwh = null;
      if (werte.length >= 2) {
        // Monatswechsel: Zähler fällt auf 0 → Anteile addieren
        kwh = 0;
        for (let i = 1; i < werte.length; i++) kwh += werte[i] >= werte[i - 1] ? werte[i] - werte[i - 1] : werte[i];
      }
      bu.strom = kwh != null ? { kwh, eur: kwh * this._daten.einstellungen.strompreis } : null;
    } catch (e) {
      bu.strom = null;
    }
    if (this._bu === bu && this._dialog === "bu") { const k = this.shadowRoot.getElementById("bu-kosten"); if (k) k.innerHTML = this._buKostenHtml(); }
  },

  _buKostenHtml() {
    const bu = this._bu, d = this._buAlle().find((x) => x.uid === bu.uid);
    const rolle = this._daten.rollen.find((r) => r.id === bu.rolleId);
    const b = this._buBedarf(d, rolle, bu.fortschritt);
    const fil = rolle && rolle.preis_kg ? (b.summe / 1000) * rolle.preis_kg : null;
    const strom = bu.strom === "laedt" ? "lädt …" : bu.strom ? `${zahl(bu.strom.kwh, 3)} kWh · ${zahl(bu.strom.eur, 2)} €` : "keine Messung";
    const gesamt = (fil || 0) + (bu.strom && bu.strom.eur ? bu.strom.eur : 0);
    return `<div class="info-zeile"><span>Filament</span><strong>${fil != null ? `${zahl(fil, 2)} €` : `<span class="leise">Preis/kg fehlt</span>`}</strong></div>
      <div class="info-zeile"><span>Strom (Steckdose)</span><strong>${strom}</strong></div>
      <div class="info-zeile"><span>Dieser Druck</span><strong>${gesamt ? `${zahl(gesamt, 2)} €` : "–"}</strong></div>`;
  },

  _buDialogHtml() {
    const bu = this._bu;
    const d = bu && this._buAlle().find((x) => x.uid === bu.uid);
    if (!d) return "";
    if (bu.schritt === "fragen") return this._buFragenHtml(d);
    if (bu.schritt === "loesungen") return this._buLoesungenHtml(d);
    const rolle = this._daten.rollen.find((r) => r.id === bu.rolleId);
    const vor = this._buVorschlaege(d);
    const b = this._buBedarf(d, rolle, bu.fortschritt);
    const e = this._daten.einstellungen;
    const alt = this._daten.letzte_rolle && this._daten.letzte_rolle !== bu.rolleId ? this._daten.rollen.find((r) => r.id === this._daten.letzte_rolle) : null;
    const f = fotoName(d), foto = f && this._drFotos && this._drFotos[f];
    const rest = rolle && rolle.rest_g != null ? rolle.rest_g - b.summe : null;
    const kachel = (r, gruende) => `<button class="bu-rolle ${r.id === bu.rolleId ? "an" : ""}" data-aktion="bu-rolle" data-id="${esc(r.id)}">
        ${spuleSvg(r)}<span class="bu-rolle-text"><strong>${esc(r.name)}</strong><small>${esc(r.hersteller)} · ${r.rest_g != null ? `${zahl(r.rest_g)} g` : "nicht gewogen"}</small>
        ${gruende && gruende.length ? `<small class="mint">${esc(gruende.join(" · "))}</small>` : ""}</span>${r.achtung ? `<span class="achtung-punkt" title="Rolle beobachten">!</span>` : ""}</button>`;
    const andere = this._daten.rollen.slice().sort((a, c) => a.name.localeCompare(c.name, "de"));
    return `<div class="bu-kopf">
        <span class="ld-bild">${foto ? `<img src="${esc(foto)}" alt="">` : "🖨️"}</span>
        <div><h2>${esc(d.name)}</h2><p class="leise klein">${esc(d.zeit)}${d.gewicht != null ? ` · ${zahl(d.gewicht, 1)} g laut Slicer` : ""}</p></div>
      </div>
      ${d.status === "failed" || bu.ergebnis !== "ok" ? `<div class="chips bu-ergebnis">
        <button class="chip ${bu.ergebnis === "fehl" ? "an rot-chip" : ""}" data-aktion="bu-ergebnis" data-id="fehl">⛔ Fehldruck</button>
        <button class="chip ${bu.ergebnis === "anders" ? "an" : ""}" data-aktion="bu-ergebnis" data-id="anders">🤷 Anders überlegt</button>
        <button class="chip ${bu.ergebnis === "ok" ? "an" : ""}" data-aktion="bu-ergebnis" data-id="ok">✅ Doch fertig</button></div>
        <p class="leise klein">${bu.ergebnis === "anders" ? "Zählt nicht in die Fehlerquote. Das verbrauchte Material wird trotzdem abgezogen." : bu.ergebnis === "fehl" ? "Danach stelle ich dir ein paar Fragen zur Ursache." : ""}</p>
        <div class="mod-regler"><div class="r-kopf"><span>Gedruckt bis</span><strong id="bu-wert-fortschritt">${zahl(bu.fortschritt)} %</strong></div>
          <div class="regler-zeile"><input type="range" min="0" max="100" step="1" value="${bu.fortschritt}" data-bu="fortschritt"></div></div>` : ""}
      <h3>Welche Rolle war drin?</h3>
      <div class="bu-rollen">${vor.map((v) => kachel(v.rolle, v.gruende)).join("")}</div>
      ${bu.waehlen ? `<label class="auswahl breit-auswahl"><span>Andere Rolle</span><select data-bu="rolle">${andere.map((r) => `<option value="${esc(r.id)}" ${r.id === bu.rolleId ? "selected" : ""}>${esc(r.name)} · ${esc(r.hersteller)}</option>`).join("")}</select></label>`
        : `<button class="mini mint-rand" data-aktion="bu-waehlen">Andere Rolle wählen</button>`}
      <div id="bu-rechnung" class="info-liste oben-abstand">${this._buRechnungHtml(d, rolle, b, alt, rest)}</div>
      <h3>Kosten</h3>
      <div id="bu-kosten" class="info-liste">${this._buKostenHtml()}</div>
      <div class="knopf-reihe oben-abstand">
        <button class="knopf leise" data-aktion="bu-ignorieren">Nicht verbuchen</button>
        <button class="knopf" data-aktion="bu-buchen" ${rolle ? "" : "disabled"}>${bu.ergebnis === "fehl" ? "Verbuchen und Ursache suchen" : "Verbuchen"}</button>
      </div>`;
  },

  _buRechnungHtml(d, rolle, b, alt, rest) {
    const e = this._daten.einstellungen;
    return `${d.gewicht == null ? `<div class="info-zeile"><span class="amber">Gewicht fehlt im Eintrag</span><strong>0 g</strong></div>` : `<div class="info-zeile"><span>Druck${this._bu.fortschritt < 100 ? ` (${zahl(this._bu.fortschritt)} %)` : ""}${b.korr !== 1 ? ` × ${zahl(b.korr, 2)} Abgleich` : ""}</span><strong>${zahl(b.druck, 1)} g</strong></div>`}
      <div class="info-zeile"><span>Anfangslinie + 3× Extruder</span><strong>${zahl(e.linie_g + e.extruder_g, 2)} g</strong></div>
      <div class="info-zeile"><span><strong class="tx">Von ${esc(rolle ? rolle.name : "–")} ab</strong></span><strong>${zahl(b.summe, 1)} g</strong></div>
      ${alt ? `<div class="info-zeile"><span>🔁 Rollenwechsel: Reststück von ${esc(alt.name)}</span><strong>${zahl(e.wechsel_g, 2)} g</strong></div>` : ""}
      ${rest != null ? `<div class="info-zeile"><span>Danach auf der Rolle</span><strong class="${rest < 0 ? "rot" : ""}">${rest < 0 ? "reicht rechnerisch nicht (bitte wiegen)" : `${zahl(rest)} g`}</strong></div>` : ""}`;
  },

  _buRechnungNeu() {
    const bu = this._bu, d = this._buAlle().find((x) => x.uid === bu.uid);
    const rolle = this._daten.rollen.find((r) => r.id === bu.rolleId);
    const b = this._buBedarf(d, rolle, bu.fortschritt);
    const alt = this._daten.letzte_rolle && this._daten.letzte_rolle !== bu.rolleId ? this._daten.rollen.find((r) => r.id === this._daten.letzte_rolle) : null;
    const el = this.shadowRoot.getElementById("bu-rechnung");
    if (el) el.innerHTML = this._buRechnungHtml(d, rolle, b, alt, rolle && rolle.rest_g != null ? rolle.rest_g - b.summe : null);
    const k = this.shadowRoot.getElementById("bu-kosten");
    if (k) k.innerHTML = this._buKostenHtml();
  },

  _buBuchen() {
    const bu = this._bu, d = this._buAlle().find((x) => x.uid === bu.uid);
    const rolle = this._daten.rollen.find((r) => r.id === bu.rolleId);
    if (!d || !rolle) return;
    if (this._buExtra(d.uid).gebucht) { this._toast("Dieser Druck ist schon verbucht."); this._dialog = null; return; }   // doppelt getippt
    const e = this._daten.einstellungen;
    const b = this._buBedarf(d, rolle, bu.fortschritt);
    let wechsel = null;
    const alt = this._daten.letzte_rolle && this._daten.letzte_rolle !== rolle.id ? this._daten.rollen.find((r) => r.id === this._daten.letzte_rolle) : null;
    if (alt) {
      wechsel = { rolle: alt.id, g: e.wechsel_g };
      if (alt.rest_g != null) alt.rest_g = Math.max(0, alt.rest_g - e.wechsel_g);
    }
    if (rolle.rest_g != null) rolle.rest_g = Math.max(0, rolle.rest_g - b.summe);
    rolle.verbraucht_g = (rolle.verbraucht_g || 0) + b.summe;
    const fil = rolle.preis_kg ? (b.summe / 1000) * rolle.preis_kg : null;
    const strom = bu.strom && bu.strom !== "laedt" ? bu.strom : null;
    this._daten.drucke[d.uid] = {
      ...this._buExtra(d.uid),
      gebucht: { am: new Date().toISOString(), rolle: rolle.id, g: b.summe, druck_g: b.druck, fix_g: b.fix, wechsel, ergebnis: bu.ergebnis, fortschritt: bu.fortschritt,
        kosten: { filament: fil, kwh: strom ? strom.kwh : null, strom: strom ? strom.eur : null } },
      name: d.name, start: d.start, ende: d.ende,
    };
    this._daten.letzte_rolle = rolle.id;
    let text = `${zahl(b.summe, 1)} g von ${rolle.name} abgezogen${wechsel ? `, ${zahl(wechsel.g, 2)} g Reststück von ${alt.name}` : ""}.`;
    if (bu.ergebnis === "ok" && rolle.achtung) {
      delete rolle.achtung;
      text += " Druck geglückt, das rote Ausrufezeichen ist weg.";
    }
    this._speichern();
    if (bu.ergebnis === "fehl") { bu.schritt = "fragen"; this._toast(text); return; }
    this._dialog = null;
    this._bu = null;
    this._toast(text);
    setTimeout(() => this._buNachLaden(), 3000);
  },

  _buRueckgaengig(uid) {
    const x = this._buExtra(uid), g = x.gebucht;
    if (!g) return;
    const rolle = this._daten.rollen.find((r) => r.id === g.rolle);
    if (rolle) { if (rolle.rest_g != null) rolle.rest_g += g.g; rolle.verbraucht_g = Math.max(0, (rolle.verbraucht_g || 0) - g.g); }
    if (g.wechsel) { const alt = this._daten.rollen.find((r) => r.id === g.wechsel.rolle); if (alt && alt.rest_g != null) alt.rest_g += g.wechsel.g; }
    delete x.gebucht;
    delete x.fehl;
    this._speichern();
    this._toast(`Buchung zurückgenommen, ${zahl(g.g, 1)} g wieder gutgeschrieben.`);
  },

  // ---- Fehldruck: Fragen ----
  _buFragenHtml(d) {
    const bu = this._bu;
    return `<h2>Was ist passiert?</h2><p class="leise klein">${esc(d.name)} · ${zahl(bu.fortschritt)} % gedruckt</p>
      <h3>Wann ging es schief?</h3>
      <div class="chips">${FEHL_FRAGEN.wann.map((w) => `<button class="chip ${bu.wann === w.id ? "an" : ""}" data-aktion="bu-wann" data-id="${w.id}">${w.name}</button>`).join("")}</div>
      ${bu.wann ? `<p class="leise klein">${esc(FEHL_FRAGEN.wann.find((w) => w.id === bu.wann).hinweis)}</p>` : ""}
      <h3>Wie sieht es aus? <span class="leise klein">(mehrere möglich)</span></h3>
      <div class="bu-bilder">${FEHLERBILDER.map((f) => `<button class="bu-bild ${bu.bilder.includes(f.id) ? "an" : ""}" data-aktion="bu-bild" data-id="${f.id}">${FB_ZEICHNUNG[f.id] || ""}<span>${esc(f.name)}</span></button>`).join("")}</div>
      <h3>Noch drei kurze Fragen</h3>
      ${FEHL_FRAGEN.extra.map((q) => `<div class="bu-frage"><span>${esc(q.frage)}</span><span class="chips">
        ${["ja", "nein", "?"].map((a) => `<button class="chip ${bu.extra[q.id] === a ? "an" : ""}" data-aktion="bu-extra" data-id="${q.id}" data-a="${a}">${a === "?" ? "weiß nicht" : a}</button>`).join("")}</span></div>`).join("")}
      <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="bu-fertig">Überspringen</button>
        <button class="knopf" data-aktion="bu-auswerten">Ursachen anzeigen</button></div>`;
  },

  _buUrsachen() {
    const bu = this._bu;
    const liste = [...bu.bilder];
    FEHL_FRAGEN.extra.forEach((q) => { const a = bu.extra[q.id]; if (a === "nein" && q.nein && !liste.includes(q.nein)) liste.push(q.nein); });
    if (!liste.length) {
      // Nichts ausgewählt: aus dem Zeitpunkt die häufigste Ursache nehmen
      liste.push(bu.wann === "erste" || bu.wann === "frueh" ? "haftung" : bu.wann === "spaet" ? "verstopft" : "spaghetti");
    }
    return liste.map(fehlerbild).filter(Boolean);
  },

  _buLoesungenHtml(d) {
    const bu = this._bu;
    const rolle = this._daten.rollen.find((r) => r.id === bu.rolleId);
    const ursachen = this._buUrsachen();
    return `<h2>Mögliche Ursachen</h2><p class="leise klein">Für ${esc(rolle ? rolle.name : "die Rolle")}. Haken bei den Werten, die ich in die Rolle übernehmen soll.</p>
      ${ursachen.map((u) => `<div class="bu-ursache"><div class="bu-ursache-kopf">${FB_ZEICHNUNG[u.id] || ""}<div><strong>${esc(u.name)}</strong><small class="leise">${esc(u.ursachen.join(" · "))}</small></div></div>
        <ul class="bu-loesungen">${u.loesungen.map((l, i) => {
          const a = l.aenderung && rolle ? aenderungRechnen(rolle, l.aenderung) : null;
          const key = `${u.id}-${i}`;
          return `<li>${a ? `<button class="bu-haken ${bu.uebernehmen[key] ? "an" : ""}" data-aktion="bu-haken" data-id="${key}" aria-label="übernehmen">${bu.uebernehmen[key] ? "✓" : ""}</button>` : `<span class="bu-punkt">•</span>`}
            <span>${esc(l.text)}${a ? ` <span class="bu-aend">${esc(a.feld.name)}: ${zahl(a.alt, a.feld.nk || 0)} → <strong>${zahl(a.neu, a.feld.nk || 0)}</strong> ${esc(a.feld.e)}</span>` : ""}</span></li>`;
        }).join("")}</ul></div>`).join("")}
      <div class="hinweis rot-hinweis">Die Rolle bekommt ein rotes <strong>!</strong>, bis ein Druck mit ihr wieder klappt.</div>
      <div class="knopf-reihe"><button class="knopf leise" data-aktion="bu-zurueck">Zurück</button>
        <button class="knopf" data-aktion="bu-fehl-speichern">${Object.values(bu.uebernehmen).some(Boolean) ? "Übernehmen und markieren" : "Rolle markieren"}</button></div>`;
  },

  _buFehlSpeichern() {
    const bu = this._bu;
    const rolle = this._daten.rollen.find((r) => r.id === bu.rolleId);
    const ursachen = this._buUrsachen();
    const geaendert = [];
    if (rolle) {
      ursachen.forEach((u) => u.loesungen.forEach((l, i) => {
        if (!bu.uebernehmen[`${u.id}-${i}`] || !l.aenderung) return;
        const a = aenderungRechnen(rolle, l.aenderung);
        if (!a) return;
        rolle.eigen = { ...(rolle.eigen || {}), [a.k]: a.neu };
        geaendert.push(`${a.feld.name} ${zahl(a.neu, a.feld.nk || 0)} ${a.feld.e}`.trim());
      }));
      rolle.achtung = { seit: new Date().toISOString(), druck: bu.uid, grund: ursachen.map((u) => u.name).join(", "), geaendert };
    }
    const x = this._daten.drucke[bu.uid] || (this._daten.drucke[bu.uid] = {});
    x.fehl = { wann: bu.wann, bilder: bu.bilder, extra: bu.extra, ursachen: ursachen.map((u) => u.id), geaendert };
    this._speichern();
    this._dialog = null;
    this._bu = null;
    this._toast(geaendert.length ? `Gespeichert: ${geaendert.join(", ")}. Rolle ist rot markiert.` : "Gespeichert. Die Rolle ist rot markiert, bis ein Druck klappt.");
  },

  // ---- Druck von Hand nachtragen ----
  _buHandHtml() {
    const h = this._buHand;
    const rollen = this._daten.rollen.slice().sort((a, b) => a.name.localeCompare(b.name, "de"));
    return `<h2>Druck nachtragen</h2><p class="leise klein">Wenn die Automation einen Druck nicht erfasst hat, z. B. weil die Bambu-Cloud nicht erreichbar war.</p>
      <label class="feld"><span>Name</span><input id="bu-hand-name" value="${esc(h.name)}" placeholder="z. B. Kabelhalter"></label>
      <div class="mod-regler"><div class="r-kopf"><span>Gewicht laut Slicer</span><strong id="bu-wert-hand-g">${zahl(h.gewicht, 1)} g</strong></div>
        <div class="regler-zeile"><input type="range" min="0" max="500" step="0.5" value="${h.gewicht}" data-bu="hand-g"></div></div>
      <div class="chips"><button class="chip ${h.status === "finish" ? "an" : ""}" data-aktion="bu-hand-status" data-id="finish">Fertig</button>
        <button class="chip ${h.status === "failed" ? "an" : ""}" data-aktion="bu-hand-status" data-id="failed">Abgebrochen</button></div>
      <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="dialog-zu">Abbrechen</button>
        <button class="knopf" data-aktion="bu-hand-ok">Weiter zum Verbuchen</button></div>`;
  },

  _buKlick(a, el) {
    const bu = this._bu;
    switch (a) {
      case "bu-start": this._buStarten(el.dataset.uid, el.dataset.ergebnis); break;
      case "bu-rolle": bu.rolleId = el.dataset.id; break;
      case "bu-waehlen": bu.waehlen = true; break;
      case "bu-ergebnis": bu.ergebnis = el.dataset.id; if (bu.ergebnis === "ok") bu.fortschritt = 100; break;
      case "bu-buchen": this._buBuchen(); break;
      case "bu-ignorieren":
        this._daten.drucke[bu.uid] = { ...this._buExtra(bu.uid), ignoriert: true };
        this._speichern(); this._dialog = null; this._bu = null;
        this._toast("Wird nicht verbucht. Im Druckverlauf kannst du es später nachholen.");
        return;
      case "bu-wann": bu.wann = el.dataset.id; break;
      case "bu-bild": bu.bilder = bu.bilder.includes(el.dataset.id) ? bu.bilder.filter((x) => x !== el.dataset.id) : [...bu.bilder, el.dataset.id]; break;
      case "bu-extra": bu.extra[el.dataset.id] = el.dataset.a; break;
      case "bu-auswerten": bu.schritt = "loesungen"; this._sheetScroll = 0; break;
      case "bu-zurueck": bu.schritt = "fragen"; break;
      case "bu-haken": bu.uebernehmen[el.dataset.id] = !bu.uebernehmen[el.dataset.id]; break;
      case "bu-fehl-speichern": this._buFehlSpeichern(); return;
      case "bu-fertig": this._dialog = null; this._bu = null; break;
      case "bu-rueckgaengig": this._buRueckgaengig(el.dataset.uid); break;
      case "bu-hand": this._buHand = { name: "", gewicht: 10, status: "finish" }; this._dialog = "bu-hand"; break;
      case "bu-hand-status": this._buHand.status = el.dataset.id; break;
      case "bu-hand-ok": {
        const name = (this.shadowRoot.getElementById("bu-hand-name").value || "").trim() || "Druck von Hand";
        const uid = `hand-${Date.now()}`;
        this._daten.drucke[uid] = { hand: { name, gewicht: this._buHand.gewicht, start: new Date().toISOString(), status: this._buHand.status, fortschritt: 50 } };
        this._speichern();
        this._buStarten(uid);
        break;
      }
      case "bu-achtung-weg": {
        const r = this._daten.rollen.find((x) => x.id === el.dataset.id);
        if (r) { delete r.achtung; this._speichern(); this._toast("Markierung entfernt."); }
        break;
      }
      default: return;
    }
    this._zeichnen();
  },

  _buEingabe(t) {
    const k = t.dataset && t.dataset.bu;
    if (!k) return false;
    if (k === "fortschritt") {
      this._bu.fortschritt = Number(t.value);
      const w = this.shadowRoot.getElementById("bu-wert-fortschritt");
      if (w) w.textContent = `${zahl(this._bu.fortschritt)} %`;
      this._buRechnungNeu();
    }
    if (k === "hand-g") {
      this._buHand.gewicht = Number(t.value);
      const w = this.shadowRoot.getElementById("bu-wert-hand-g");
      if (w) w.textContent = `${zahl(this._buHand.gewicht, 1)} g`;
    }
    if (k === "rolle") { this._bu.rolleId = t.value; this._buRechnungNeu(); }
    return true;
  },
  _buAenderung(t) {
    const k = t.dataset && t.dataset.bu;
    if (!k) return false;
    if (k === "rolle") { this._bu.rolleId = t.value; this._zeichnen(); }
    if (k === "fortschritt") this._bu.wann = wannAusFortschritt(this._bu.fortschritt);
    return true;
  },

  // Für Rollen-Detail: letzter verbuchter Druck dieser Rolle
  _buLetzterDruck(rolleId) {
    let best = null;
    for (const [uid, x] of Object.entries(this._daten.drucke || {})) {
      if (x.gebucht && x.gebucht.rolle === rolleId && (!best || x.gebucht.am > best.x.gebucht.am)) best = { uid, x };
    }
    if (!best) return null;
    const d = this._buAlle().find((v) => v.uid === best.uid);
    return { uid: best.uid, name: (d && d.name) || best.x.name || "Druck", d, x: best.x };
  },
};
// ---------------------------------------------------------------------------
// Hilfe: P1S-Zeichnung mit Bereichen, Sovol-Trockner, Fehlerbilder, Kalibrierung
// ---------------------------------------------------------------------------

const HI_TABS = [["drucker", "🖨️ Drucker"], ["trockner", "♨️ Trockner"], ["fehler", "🩺 Fehlerbilder"], ["kalibrierung", "🎯 Kalibrierung"], ["kunststoffe", "🧪 Kunststoffe"], ["konstruktion", "📐 Konstruktion"], ["lexikon", "📖 Slicer-Lexikon"], ["platten", "🟫 Druckplatten"], ["codes", "⚠️ Fehlercodes"]];
// Welche Rollenwerte zu welchem Bereich der Zeichnung gehören
const HI_FELDER = { duese: ["duese_erste", "duese", "flow"], extruder: ["k", "max_vol"], luefter: ["luefter_min", "luefter_max"],
  riemen: ["v_aussen", "v_innen", "v_fuellung"], bett: ["bett"], spule: ["tr_temp", "tr_dauer"] };

const HilfeAnsicht = {
  _hiZustand() {
    if (!this._hi) this._hi = { tab: "drucker", p1s: "duese", tr: "material", fehler: null, kal: "temp", rolle: null, kalWert: null,
      // v0.12: aufgeklappte Einträge, Konstruktions-Rechner, Lexikon-Suche, gewählte Platte
      auf: new Set(), knGruppe: "alle", knDuese: 0.4, knWand: 1.2, knEinsatz: null, lexQ: "", lexGruppe: "alle", platte: null };
    return this._hi;
  },

  // Aufklappbarer Eintrag (Konstruktion, Lexikon). Zustand bleibt beim Neuzeichnen erhalten.
  _hiEintragHtml(id, kopf, inhalt, klasse = "", vonSelbstAuf = false) {
    const auf = this._hi.auf.has(id) || vonSelbstAuf;
    return `<div class="hi-eintrag ${klasse} ${auf ? "auf" : ""}" data-eintrag="${esc(id)}">
      <button class="hi-eintrag-kopf" data-aktion="hi-auf" data-id="${esc(id)}" aria-expanded="${auf}">${kopf}<span class="hi-pfeil" aria-hidden="true">›</span></button>
      <div class="hi-eintrag-text">${inhalt}</div></div>`;
  },
  // Auf-/Zuklappen ohne alles neu zu zeichnen
  _hiAufZu(id) {
    const h = this._hi;
    const box = [...this.shadowRoot.querySelectorAll(".hi-eintrag")].find((x) => x.dataset.eintrag === id);
    const auf = box ? !box.classList.contains("auf") : !h.auf.has(id);
    if (auf) h.auf.add(id); else h.auf.delete(id);
    if (!box) { this._zeichnen(); return; }
    const text = box.querySelector(".hi-eintrag-text");
    box.querySelector(".hi-eintrag-kopf").setAttribute("aria-expanded", String(auf));
    if (auf) { box.classList.add("auf"); this._klappAnimieren(text, true); }
    else this._klappAnimieren(text, false, () => { if (!h.auf.has(id)) box.classList.remove("auf"); });
  },

  // ---- Trockner: zwei Plätze ----
  _hiPlaetze() {
    const p = this._daten.trockner_plaetze;
    return Array.isArray(p) ? [p[0] || "", p[1] || ""] : ["", ""];
  },
  // Inhalt eines Platzes: "r:<Rollen-ID>" oder "m:<Material>" → Trocknungswerte
  _hiPlatzWert(code) {
    if (!code) return null;
    const [art, id] = [code.slice(0, 2), code.slice(2)];
    if (art === "r:") {
      const r = this._daten.rollen.find((x) => x.id === id);
      if (!r) return null;
      const std = TROCKNEN_MATERIALIEN.find((m) => m.id === r.material) || TROCKNEN_MATERIALIEN[0];
      const v = (k) => wert(r, k).v ?? std[k];
      const holz = String(r.art || "").toLowerCase() === "wood";
      return { id: r.id, name: r.name, material: holz ? "Wood" : r.material, temp: v("tr_temp"), dauer: v("tr_dauer"), feuchte: v("tr_feuchte"),
        ideal: std.id === r.material ? std.ideal : null, farbe: r.hex || materialInfo(r.material).farbe };
    }
    const m = TROCKNEN_MATERIALIEN.find((x) => x.id === id);
    if (!m) return null;
    return { name: m.name, material: m.id === "WOOD" ? "Wood" : m.id, temp: m.tr_temp, dauer: m.tr_dauer, feuchte: m.tr_feuchte, ideal: m.ideal,
      farbe: materialInfo(m.id === "WOOD" ? "PLA" : m.id).farbe };
  },
  _hiKombiHtml() {
    const d = this._daten, plaetze = this._hiPlaetze();
    const werte = plaetze.map((c) => this._hiPlatzWert(c));
    const k = trocknenKombi(werte[0], werte[1]);
    const rollen = d.rollen.slice().sort((a, b) => a.name.localeCompare(b.name, "de"));
    const wahl = (i) => `<label class="auswahl breit-auswahl ${plaetze[i] ? "an" : ""}"><span>Platz ${i + 1} · ${i ? "rechts" : "links"}</span><select data-hi="tr-platz" data-platz="${i}">
      <option value="" ${plaetze[i] ? "" : "selected"}>– leer –</option>
      <optgroup label="Deine Rollen">${rollen.map((r) => `<option value="r:${esc(r.id)}" ${plaetze[i] === `r:${r.id}` ? "selected" : ""}>${esc(r.name)} · ${esc(r.hersteller)}</option>`).join("")}</optgroup>
      <optgroup label="Nur Material">${TROCKNEN_MATERIALIEN.map((m) => `<option value="m:${m.id}" ${plaetze[i] === `m:${m.id}` ? "selected" : ""}>${esc(m.name)}</option>`).join("")}</optgroup>
    </select></label>`;
    const zeit = (h) => `${zahl(h, h % 1 ? 1 : 0)} h`;
    const lauf = (l, i) => `<div class="hi-lauf">
        <h4>${k.modus === "getrennt" ? `Lauf ${i + 1} · ${esc(l.name)}` : k.modus === "zusammen" ? "Beide Rollen zusammen" : esc(l.name)}</h4>
        ${trocknerKombiSvg(l, werte, l.plaetze, i ? "vorher" : "danach")}
        <ol class="hi-lauf-schritte">
          <li><span>Material</span><strong>${esc(l.name)}</strong><small class="leise">oder „Custom“</small></li>
          <li><span>Temperatur</span><strong>${l.temp} °C</strong></li>
          <li><span>Zeit</span><strong>${zeit(l.dauer)}</strong></li>
          <li><span>Fertig, wenn Feuchte</span><strong>&lt; ${l.feuchte} %</strong></li>
        </ol></div>`;
    return `<div class="dr-karte oben-abstand hi-kombi" data-einmal="hi-kombi">
      <h3 class="dr-titel">Zwei Spulen zusammen trocknen</h3>
      <p class="leise klein">Wähle für jeden Platz eine Rolle oder nur das Material. Du bekommst die gemeinsame Einstellung fürs Display.</p>
      <div class="hi-kombi-wahl">${wahl(0)}${wahl(1)}</div>
      <div class="hi-kombi-erg" data-modus="${k.modus}">
        ${k.modus === "leer" ? `<p class="leise hi-kombi-leer">Noch nichts gewählt. Wähle oben, was in den Trockner kommt.</p>` : `
        ${k.hinweise.map((x) => `<div class="hinweis ${x.art} hi-kombi-hinweis">${x.art === "rot" ? "⚠️ " : x.art === "amber" ? "⏱ " : "✓ "}${esc(x.text)}</div>`).join("")}
        <div class="hi-laeufe ${k.laeufe.length > 1 ? "zwei" : ""}">${k.laeufe.map(lauf).join("")}</div>`}
      </div></div>`;
  },

  // ---- Konstruktion ----
  _hiKonstruktionHtml() {
    const h = this._hiZustand();
    const tipps = KONSTRUKTION.filter((t) => h.knGruppe === "alle" || t.g === h.knGruppe);
    return `<p class="leise">Tipps für Teile, die du selbst konstruierst – auf FDM-Druck und deinen P1S abgestimmt. Tippe auf einen Tipp für Werte und Details.</p>
      <div class="hi-raster kn-rechner">${this._knWandHtml()}${this._knEinsatzHtml()}</div>
      <div class="chips unter-tabs kn-gruppen">${KN_GRUPPEN.map(([id, n]) => `<button class="chip ${h.knGruppe === id ? "an" : ""}" data-aktion="hi-kn-gruppe" data-id="${id}">${esc(n)}</button>`).join("")}</div>
      <div class="kn-raster">${tipps.map((t) => this._hiEintragHtml(`kn:${t.id}`,
        `${KN_BILD[t.id] || ""}<span class="kn-kopf-text"><strong>${esc(t.titel)}</strong><small class="leise">${esc(t.kurz)}</small></span>`,
        `<ul class="kal-liste kn-punkte">${t.punkte.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
         ${t.werte ? `<div class="info-liste kn-werte">${t.werte.map(([n, w]) => `<div class="info-zeile"><span>${esc(n)}</span><strong>${esc(w)}</strong></div>`).join("")}</div>` : ""}
         ${t.dyn ? this._knTabelleHtml(t.dyn) : ""}`, "kn-tipp")).join("")}</div>`;
  },
  // Linienbreiten in Bambu Studio je Düse: [Außenwand, Innenwand]
  _knLinien(duese) {
    return { 0.2: [0.22, 0.22], 0.4: [0.42, 0.45], 0.6: [0.62, 0.62], 0.8: [0.82, 0.82] }[duese] || [duese * 1.05, duese * 1.1];
  },
  _knWanddicke(duese, n) { const [a, i] = this._knLinien(duese); return a + (n - 1) * i; },
  _knWandHtml() {
    const h = this._hi, d = h.knDuese;
    const imInventar = new Set((this._daten.inventar || []).filter((t) => t.kat === "duese").map((t) => Number(t.groesse)));
    const [a, i] = this._knLinien(d);
    const stufen = [[2, "Minimum"], [3, "Standard"], [4, "Funktionsteil"], [5, "Schrauben, Einsätze"], [6, "sehr stabil"]];
    return `<div class="dr-karte kn-karte" data-einmal="kn-wand"><h3 class="dr-titel">🧮 Wandstärke für deine Düse</h3>
      <div class="chips kn-duesen">${[0.2, 0.4, 0.6, 0.8].map((x) => `<button class="chip ${x === d ? "an" : ""}" data-aktion="hi-kn-duese" data-id="${x}">${zahl(x, 1)} mm${imInventar.has(x) ? ' <i class="kn-da" title="im Inventar">●</i>' : ""}</button>`).join("")}</div>
      <p class="leise klein">Linienbreite in Bambu Studio: Außenwand ${zahl(a, 2)} mm, sonst ${zahl(i, 2)} mm · Schichthöhe ${zahl(d * 0.25, 2)}–${zahl(d * 0.7, 2)} mm</p>
      <div class="info-liste kn-stufen">${stufen.map(([n, t]) => `<div class="info-zeile ${n === 3 ? "kn-empf" : ""}"><span>${n} Linien · ${esc(t)}</span><strong>${zahl(this._knWanddicke(d, n), 2)} mm</strong></div>`).join("")}</div>
      <div class="mod-regler kn-regler"><div class="r-kopf"><span>Deine geplante Wand</span><strong id="hi-kn-wand-wert">${zahl(h.knWand, 2)} mm</strong></div>
        <div class="regler-zeile"><input type="range" min="0.2" max="5" step="0.05" value="${h.knWand}" data-hi="kn-wand" aria-label="Geplante Wandstärke"></div></div>
      <div id="hi-kn-wand-erg" class="kn-erg">${this._knWandErgebnisHtml()}</div></div>`;
  },
  _knWandErgebnisHtml() {
    const h = this._hi, d = h.knDuese, w = h.knWand;
    const [a] = this._knLinien(d);
    if (w < a - 0.01) return `<div class="hinweis rot">Dünner als eine Linie (${zahl(a, 2)} mm): wird nicht oder nur lückenhaft gedruckt.</div>`;
    let n = 1;
    while (this._knWanddicke(d, n + 1) <= w + 0.02) n++;
    const rest = w - this._knWanddicke(d, n);
    if (rest < 0.06) return `<div class="hinweis mint">✓ Passt: genau ${n} ${n === 1 ? "Linie" : "Linien"}${n < 2 ? " – stabil wird es erst ab 2 Linien" : ""}.</div>`;
    return `<div class="hinweis amber">${n} ${n === 1 ? "Linie" : "Linien"} + ${zahl(rest, 2)} mm Rest: dort entsteht eine Lücke oder Zickzack-Füllung.
      Besser <strong>${zahl(this._knWanddicke(d, n), 2)} mm</strong> oder <strong>${zahl(this._knWanddicke(d, n + 1), 2)} mm</strong>.</div>`;
  },
  // Gewindeeinsätze aus dem Inventar (sonst übliche Größen)
  _knEinsaetze() {
    const inv = (this._daten.inventar || []).filter((t) => t.kat === "einsatz" && t.aussen && t.laenge);
    const liste = inv.length ? inv : [{ id: "std-m2", gewinde: "M2", laenge: 3, aussen: 3.5 }, { id: "std-m3", gewinde: "M3", laenge: 5, aussen: 5 }, { id: "std-m4", gewinde: "M4", laenge: 5, aussen: 6 }];
    return liste.slice().sort((x, y) => gewindeD(x.gewinde) - gewindeD(y.gewinde) || x.aussen - y.aussen);
  },
  _knEinsatzMasse(e) {
    const loch = Math.round((e.aussen - 0.5) * 10) / 10;
    const n = NORM[e.gewinde];
    return { loch, von: Math.round((e.aussen - 0.6) * 10) / 10, bis: Math.round((e.aussen - 0.4) * 10) / 10, tiefe: e.laenge + 1, dom: Math.round((loch + 4) * 10) / 10,
      durchgang: n ? Math.round((n.loch + 0.2) * 10) / 10 : null };
  },
  _knEinsatzHtml() {
    const h = this._hi, liste = this._knEinsaetze();
    const e = liste.find((x) => x.id === h.knEinsatz) || liste.find((x) => x.gewinde === "M3") || liste[0];
    const m = this._knEinsatzMasse(e);
    const r = this._hiRolle();
    const loet = { PETG: "230–250", ASA: "240–260", ABS: "240–260", PC: "260–280", TPU: "200–220" }[r && r.material] || "210–230";
    const z = (v) => zahl(v, v % 1 ? 1 : 0);
    return `<div class="dr-karte kn-karte" data-einmal="kn-einsatz"><h3 class="dr-titel">🟡 Loch für Gewindeeinsatz</h3>
      <div class="chips kn-einsaetze">${liste.map((x) => `<button class="chip ${x.id === e.id ? "an" : ""}" data-aktion="hi-kn-einsatz" data-id="${esc(x.id)}">${esc(x.gewinde)} · ${z(x.laenge)} × Ø ${zahl(x.aussen, 1)}</button>`).join("")}</div>
      <div class="kn-einsatz-erg">
        <div class="kn-gross"><span>Loch-Ø im CAD</span><strong>${zahl(m.loch, 1)} mm</strong><small class="leise">Bereich ${zahl(m.von, 1)}–${zahl(m.bis, 1)} mm, mit Teststreifen prüfen</small></div>
        <div class="kn-gross"><span>Lochtiefe</span><strong>${z(m.tiefe)} mm</strong><small class="leise">Länge + 1 mm</small></div>
      </div>
      <div class="info-liste">
        <div class="info-zeile"><span>Fase am Lochrand</span><strong>0,5 mm × 45°</strong></div>
        <div class="info-zeile"><span>Dom/Wand rundum</span><strong>Ø ≥ ${zahl(m.dom, 1)} mm (≥ 2 mm Wand)</strong></div>
        ${m.durchgang ? `<div class="info-zeile"><span>Durchgangsloch im Gegenstück</span><strong>${zahl(m.durchgang, 1)} mm</strong></div>` : ""}
        <div class="info-zeile"><span>Lötkolben (${esc(r ? r.material : "PLA")})</span><strong>${loet} °C</strong></div>
      </div>
      <p class="leise klein">${(this._daten.inventar || []).some((t) => t.kat === "einsatz") ? "Größen aus deinem Inventar." : "Übliche Größen – trage deine Einsätze im Inventar ein."} Slicer: 4 Wandlinien um das Loch.</p></div>`;
  },
  // Tabellen in den Tipps, berechnet aus Normmaßen und Corins Inventar
  _knTabelleHtml(art) {
    const inv = this._daten.inventar || [];
    const z = (v, nk = 1) => zahl(Math.round(v * 100) / 100, nk);
    const tabelle = (kopf, zeilen) => `<div class="kn-tabelle" style="--spalten:${kopf.length}"><div class="kn-tz kn-tk">${kopf.map((k) => `<span>${esc(k)}</span>`).join("")}</div>
      ${zeilen.map((zl) => `<div class="kn-tz">${zl.map((x, i) => i ? `<span>${x}</span>` : `<strong>${x}</strong>`).join("")}</div>`).join("")}</div>`;
    if (art === "einsatz") return tabelle(["Einsatz", "Loch-Ø", "Tiefe", "Dom-Ø"], this._knEinsaetze().map((e) => {
      const m = this._knEinsatzMasse(e);
      return [`${esc(e.gewinde)} · ${zahl(e.laenge)} × ${z(e.aussen)}`, `${z(m.loch)}`, `${zahl(m.tiefe)}`, `≥ ${z(m.dom)}`];
    }));
    if (art === "schraube") return tabelle(["Gewinde", "Durchgang", "Kernloch", "Kopfsenkung"], ["M2", "M2.5", "M3", "M4", "M5"].map((g) => {
      const n = NORM[g], d = gewindeD(g);
      return [g, z(n.loch + 0.2), z(Math.round(d * 0.8 * 10) / 10), `Ø ${z(n.kopf_d + 0.5)} × ${z(n.kopf_h + 0.3)}`];
    }));
    if (art === "mutter") {
      const gew = [...new Set(inv.filter((t) => t.kat === "mutter").map((t) => t.gewinde))];
      return tabelle(["Mutter", "SW-Tasche", "über Ecken", "Tiefe"], (gew.length ? gew : ["M2", "M3", "M4"]).filter((g) => NORM[g]).map((g) => {
        const n = NORM[g], sw = n.mutter_sw + 0.25;
        return [g, z(sw, 2), z(sw * 2 / Math.sqrt(3), 2), z(n.mutter_h + 0.2)];
      }));
    }
    if (art === "magnet") {
      const mags = inv.filter((t) => t.kat === "magnet" && t.form !== "folie" && t.durchmesser && t.dicke);
      if (!mags.length) return `<p class="leise klein">Trage deine Magnete im Inventar ein, dann stehen hier die passenden Taschen.</p>`;
      return `<p class="leise klein kn-tab-titel">Deine Magnete aus dem Inventar (+0,15 mm):</p>` + tabelle(["Magnet", "Tasche", "Tiefe"], mags.map((t) => t.form === "quader"
        ? [`▭ ${z(t.durchmesser, 2)} × ${z(t.breite, 2)} × ${z(t.dicke, 2)}`, `${z(t.durchmesser + 0.15, 2)} × ${z(t.breite + 0.15, 2)}`, z(t.dicke + 0.15, 2)]
        : [`● Ø ${z(t.durchmesser, 2)} × ${z(t.dicke, 2)}`, `Ø ${z(t.durchmesser + 0.15, 2)}`, z(t.dicke + 0.15, 2)]));
    }
    return "";
  },

  // ---- Slicer-Lexikon ----
  _hiLexikonHtml() {
    const h = this._hiZustand();
    return `<p class="leise">Einstellungen in Bambu Studio, so benannt wie in der deutschen Oberfläche (englisch in Klammern). Werte gelten für den P1S mit 0,4-mm-Düse.</p>
      <div class="lex-werkzeug"><input id="hi-lex-suche" class="suche" type="search" data-hi="lex-suche" value="${esc(h.lexQ)}" placeholder="Einstellung suchen, z. B. Naht, Brim, Fluss …" autocomplete="off" aria-label="Lexikon durchsuchen"></div>
      <div class="chips unter-tabs lex-gruppen">${[{ id: "alle", name: "Alle", icon: "📖" }, ...LEX_GRUPPEN].map((g) => `<button class="chip ${h.lexGruppe === g.id ? "an" : ""}" data-aktion="hi-lex-gruppe" data-id="${g.id}">${g.icon} ${esc(g.name)}<small>${g.id === "alle" ? LEXIKON.length : LEXIKON.filter((e) => e.g === g.id).length}</small></button>`).join("")}</div>
      <div id="hi-lex-liste">${this._hiLexListeHtml()}</div>`;
  },
  _hiLexListeHtml() {
    const h = this._hi, q = h.lexQ.trim();
    const eintrag = (e, mitGruppe, vonSelbstAuf) => {
      const g = LEX_GRUPPEN.find((x) => x.id === e.g);
      return this._hiEintragHtml(`lex:${e.en}`,
        `<span class="lex-name"><strong>${esc(e.de)}</strong><small>${esc(e.en)}</small></span>${mitGruppe || e.ab !== e.de ? `<span class="lex-ab">${mitGruppe ? `${g.icon} ${esc(g.name)} › ` : ""}${esc(e.ab)}</span>` : ""}`,
        `<dl class="lex-text"><dt>Was es macht</dt><dd>${esc(e.was)}</dd><dt>Typische Werte</dt><dd class="lex-werte">${esc(e.werte)}</dd><dt>Wann ändern</dt><dd>${esc(e.wann)}</dd></dl>`,
        "lex-eintrag", vonSelbstAuf);
    };
    if (q) {
      const treffer = LEXIKON.map((e) => ({ e, p: suchPunkte(q, `${e.de} ${e.en} ${e.ab}`) * 2 + suchPunkte(q, `${e.de} ${e.en} ${e.ab} ${e.was}`) }))
        .filter((x) => x.p > 0).sort((a, b) => b.p - a.p);
      if (!treffer.length) return `<div class="dr-karte lex-leer"><p class="leise">Nichts gefunden für „${esc(q)}“. Versuche den englischen Namen oder ein kürzeres Wort.</p></div>`;
      return `<p class="leise klein lex-anzahl">${treffer.length} Treffer</p><div class="lex-liste">${treffer.map((x) => eintrag(x.e, true, treffer.length <= 2)).join("")}</div>`;
    }
    return LEX_GRUPPEN.filter((g) => h.lexGruppe === "alle" || g.id === h.lexGruppe).map((g) => `<section class="lex-gruppe">
      <h3 class="lex-gruppe-titel">${g.icon} ${esc(g.name)} <small class="leise">(${esc(g.en)})</small></h3>
      <div class="lex-liste">${LEXIKON.filter((e) => e.g === g.id).map((e) => eintrag(e, false, false)).join("")}</div></section>`).join("");
  },
  _hiLexSuchen() {
    const box = this.shadowRoot.getElementById("hi-lex-liste");
    if (box) box.innerHTML = this._hiLexListeHtml();
  },

  // ---- Druckplatten ----
  _hiPlattenHtml() {
    const h = this._hiZustand();
    const jetzt = this._drW ? this._drW("platte") : null;
    const imDrucker = jetzt && typeof DR_PLATTEN !== "undefined" ? PLATTEN_INFO.find((p) => p.name === DR_PLATTEN[jetzt]) : null;
    const p = PLATTEN_INFO.find((x) => x.id === h.platte) || imDrucker || PLATTEN_INFO.find((x) => x.id === "textured");
    const r = this._hiRolle();
    const zeileR = r && PLATTEN_MATRIX.find((z) => z.m === r.material);
    const kurz = this._mobil ? { cool: "Cool", supertack: "Super­Tack", eng: "Engi­neering", smooth: "Smooth PEI", textured: "Tex­tured" } : null;
    const zelle = ([a, t], pl, m) => `<button class="pl-zelle ${a} ${pl.id === p.id ? "spalte" : ""}" data-aktion="hi-platte" data-id="${pl.id}" title="${esc(m)} auf ${esc(pl.kurz)}: ${a === "ok" ? "geeignet" : a === "kleber" ? "mit Kleber" : "nicht geeignet"}${t ? `, ${t} °C` : ""}">
      <b>${a === "ok" ? "✓" : a === "kleber" ? "Kleber" : "✗"}</b>${t ? `<small>${t}°</small>` : ""}</button>`;
    const fuerRolle = zeileR ? zeileR.w[p.id] : null;
    return `<p class="leise">Welche Bambu-Platte für welches Material, mit Kleber oder ohne, und wie du sie pflegst.${imDrucker ? ` Im Drucker liegt gerade die <strong class="pl-jetzt">${esc(imDrucker.kurz)}</strong>.` : ""}</p>
      <div class="dr-karte pl-karte" data-einmal="pl-matrix"><h3 class="dr-titel">Material × Platte</h3>
        <div class="pl-matrix" role="table" aria-label="Material und Druckplatte">
          <div class="pl-zeile pl-kopf" role="row"><span></span>${PLATTEN_INFO.map((pl) => `<button class="pl-spalte ${pl.id === p.id ? "an" : ""} ${imDrucker && imDrucker.id === pl.id ? "drin" : ""}" data-aktion="hi-platte" data-id="${pl.id}">${esc(kurz ? kurz[pl.id] : pl.kurz)}</button>`).join("")}</div>
          ${PLATTEN_MATRIX.map((z) => `<div class="pl-zeile ${r && r.material === z.m ? "deine" : ""}" role="row"><strong class="pl-mat">${esc(z.m)}</strong>${PLATTEN_INFO.map((pl) => zelle(z.w[pl.id] || ["nein"], pl, z.m)).join("")}</div>`).join("")}
        </div>
        <div class="pl-legende"><span><b class="ok">✓</b> ohne Kleber</span><span><b class="kleber">Kleber</b> nur mit Klebestift</span><span><b class="nein">✗</b> nicht geeignet</span><span class="leise">Zahlen = Bett in °C</span></div>
        <p class="leise klein">Der P1S heizt das Bett auf höchstens ${BETT_MAX_P1S} °C. PLA mit Bett über 45 °C: Tür oder Deckel einen Spalt öffnen, sonst wird es in der Kammer zu warm.${r && zeileR ? ` Hervorgehoben: ${esc(r.material)} (${esc(r.name)}).` : ""}</p>
      </div>
      <div class="hi-raster oben-abstand">
        <div class="dr-karte pl-detail" data-einmal="pl-${p.id}">
          <div class="pl-detail-kopf">${platteSvg(p)}<div><h2>${esc(p.name)}</h2><p class="leise">${esc(p.text)}</p></div></div>
          ${fuerRolle ? `<div class="hinweis ${fuerRolle[0] === "nein" ? "rot" : fuerRolle[0] === "kleber" ? "amber" : "mint"}">${esc(r.name)}: ${fuerRolle[0] === "nein" ? "auf dieser Platte nicht drucken" : `${fuerRolle[0] === "kleber" ? "mit Klebestift, " : "ohne Kleber, "}Bett ${fuerRolle[1]} °C`}${wert(r, "platte").v ? ` · eingetragen: ${esc(wert(r, "platte").v)}` : ""}</div>` : ""}
          <h3>Gut für</h3><ul class="kal-liste">${p.gut.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
          <h3>Reinigen und pflegen</h3><ul class="kal-liste">${p.pflege.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
          <div class="hinweis amber oben-abstand">⚠️ ${esc(p.vorsicht)}</div>
        </div>
        <div class="dr-karte pl-allgemein"><h3 class="dr-titel">Für alle Platten</h3>
          <ul class="kal-liste">
            <li>Fett von den Fingern ist der häufigste Grund für schlechte Haftung: Druckfläche nur am Rand anfassen.</li>
            <li>Gründlich reinigen: Spülmittel und warmes Wasser, gut abspülen und trocknen. Für zwischendurch Isopropanol (≥ 90 %).</li>
            <li>Klebestift dünn und gleichmäßig auftragen. Er wirkt als Haftmittel und als Trennschicht, damit PETG oder TPU die Platte nicht beschädigt.</li>
            <li>Teile erst nach dem Abkühlen lösen. Die Federstahlplatte leicht biegen, nicht hebeln.</li>
            <li>In Bambu Studio immer die Platte einstellen, die wirklich im Drucker liegt: davon hängt die Betttemperatur ab.</li>
          </ul>
          <div class="chips oben-abstand pl-wahl">${PLATTEN_INFO.map((pl) => `<button class="chip ${pl.id === p.id ? "an" : ""}" data-aktion="hi-platte" data-id="${pl.id}">${esc(pl.kurz)}</button>`).join("")}</div>
        </div>
      </div>`;
  },

  _hiHtml() {
    const h = this._hiZustand();
    const inhalt = h.tab === "trockner" ? this._hiTrocknerHtml() : h.tab === "fehler" ? this._hiFehlerHtml() : h.tab === "kalibrierung" ? this._hiKalHtml()
      : h.tab === "kunststoffe" ? this._hiKunststoffeHtml() : h.tab === "codes" ? this._hiCodesHtml()
      : h.tab === "konstruktion" ? this._hiKonstruktionHtml() : h.tab === "lexikon" ? this._hiLexikonHtml() : h.tab === "platten" ? this._hiPlattenHtml()
      : this._hiDruckerHtml();
    return `<div class="hi-seite" data-einmal="hi-${h.tab}">
      <div class="chips hi-tabs unter-tabs">${HI_TABS.map(([id, n]) => `<button class="chip ${h.tab === id ? "an" : ""}" data-aktion="hi-tab" data-id="${id}">${n}</button>`).join("")}</div>
      ${inhalt}${h.tab === "fehler" && fehlerbild(h.fehler) ? this._hiFehlerPopupHtml() : ""}</div>`;
  },

  // Beispielrolle für alle Werte in der Hilfe (eine Auswahl für den ganzen Bereich):
  // selbst gewählt, sonst die Rolle im Drucker, sonst zuletzt verbucht, sonst die erste probierte
  _hiRolle() {
    const d = this._daten, h = this._hiZustand();
    const id = (x) => x && d.rollen.find((r) => r.id === x);
    return id(h.rolle) || id(d.geladen) || id(d.letzte_rolle) || d.rollen.find((r) => r.probiert) || d.rollen[0];
  },
  // Auswahl der Beispielrolle; gilt sofort in allen Hilfe-Bereichen
  _hiRollenWahl(titel = "Beispielwerte für") {
    const d = this._daten, r = this._hiRolle();
    if (!r) return "";
    const rollen = d.rollen.slice().sort((a, b) => a.name.localeCompare(b.name, "de"));
    return `<label class="auswahl breit-auswahl hi-rollenwahl"><span>${esc(titel)}</span><select data-hi="rolle">${rollen.map((x) =>
      `<option value="${esc(x.id)}" ${x.id === r.id ? "selected" : ""}>${esc(x.name)} · ${esc(x.hersteller)}${x.id === d.geladen ? " · im Drucker" : ""}</option>`).join("")}</select></label>`;
  },

  _hiDruckerHtml() {
    const h = this._hi;
    return `<div class="hi-raster">
      <div class="dr-karte hi-bild-karte"><h3 class="dr-titel">Bambu Lab P1S · ${this._mobil ? "tippe auf eine Nummer" : "fahre mit der Maus über die Nummern"}</h3>${p1sSvg(h.p1s)}</div>
      <div id="hi-info" class="dr-karte hi-info">${this._hiP1sInfoHtml()}</div>
    </div>`;
  },
  _hiP1sInfoHtml() {
    const b = P1S_BEREICHE.find((x) => x.id === this._hi.p1s) || P1S_BEREICHE[0];
    let live = "";
    if (b.live && this._drW) {
      const w = this._drW(b.live);
      if (w != null) live = `<div class="hi-live"><span>Gerade am Drucker</span><strong>${esc(DR_SCHRITTE[w] || w)}${b.einheit && !isNaN(Number(w)) ? ` ${b.einheit}` : ""}</strong></div>`;
    }
    const r = this._hiRolle();
    const felder = (HI_FELDER[b.id] || []).map((k) => FELDER.find((f) => f.k === k)).filter(Boolean);
    const werte = r && felder.length ? `${this._hiRollenWahl()}<div class="info-liste hi-werte">
      ${felder.map((f) => { const w = wert(r, f.k); return `<div class="info-zeile"><span>${esc(f.name)}</span><strong class="${w.quelle === "vorschlag" ? "amber" : ""}">${w.v == null ? "–" : `${zahl(w.v, f.nk || 0)} ${f.e}`}</strong></div>`; }).join("")}
      ${b.id === "bett" ? `<div class="info-zeile"><span>Druckplatte</span><strong>${esc(wert(r, "platte").v || "–")}</strong></div>` : ""}</div>` : "";
    return `<div class="hi-nr">${b.n}</div><h2>${esc(b.name)}</h2><p>${esc(b.text)}</p>${live}
      <h3>Einstellungen, die hier wirken</h3>
      <div class="hi-einst">${b.einst.map(([n, t]) => `<div><strong>${esc(n)}</strong><span class="leise">${esc(t)}</span></div>`).join("")}</div>${werte}
      <div class="chips oben-abstand hi-sprung">${P1S_BEREICHE.map((x) => `<button class="chip ${x.id === b.id ? "an" : ""}" data-aktion="hi-p1s" data-id="${x.id}">${x.n}</button>`).join("")}</div>`;
  },

  _hiTrocknerHtml() {
    const h = this._hi;
    const b = TROCKNER_BEREICHE.find((x) => x.id === h.tr) || TROCKNER_BEREICHE[0];
    const rollen = this._daten.rollen.slice().sort((a, c) => (wert(c, "tr_temp").v || 0) - (wert(a, "tr_temp").v || 0));
    return `<div class="hi-raster">
      <div class="dr-karte hi-bild-karte"><h3 class="dr-titel">Sovol Filament-Trockner · ${this._mobil ? "tippe auf die Felder" : "fahre über die Felder"}</h3>${trocknerSvg(h.tr, this._hiRolle())}
        <div class="oben-abstand">${this._hiRollenWahl("Display zeigt Werte für")}</div>
        <div id="hi-tr-info" class="hi-tr-info"><strong>${TROCKNER_BEREICHE.indexOf(b) + 1} · ${esc(b.name)}</strong><span>${esc(b.text)}</span></div></div>
      <div class="dr-karte"><h3 class="dr-titel">Richtwerte je Material</h3>
        <div class="tr-tabelle">${TROCKNEN_TABELLE.map((t) => `<div class="tr-zeile"><strong>${esc(t.m)}</strong>
          <span class="tr-werte"><b>${t.temp} °C</b><b>${t.h} h</b><b>&lt; ${t.ziel} %</b></span>
          <small class="leise">Feucht, wenn: ${esc(t.zeichen)}. ${esc(t.lagern)}</small></div>`).join("")}</div></div>
    </div>
    ${this._hiKombiHtml()}
    <div class="dr-karte oben-abstand"><h3 class="dr-titel">Deine Rollen</h3><div class="tr-rollen">${rollen.map((r) => {
      const t = wert(r, "tr_temp").v, d = wert(r, "tr_dauer").v, f = wert(r, "tr_feuchte").v;
      return `<button class="tr-rolle" data-aktion="oeffnen-filament" data-id="${esc(r.id)}">${spuleSvg(r)}<span><strong>${esc(r.name)}</strong><small>${esc(r.hersteller)}</small></span>
        <span class="tr-werte"><b>${t != null ? `${zahl(t)} °C` : "–"}</b><b>${d != null ? `${zahl(d, 1)} h` : "–"}</b><b>${f != null ? `&lt; ${zahl(f)} %` : "–"}</b></span></button>`;
    }).join("")}</div></div>`;
  },

  _hiFehlerHtml() {
    const r = this._hiRolle();
    return `<p class="leise">Typische Fehlerbilder mit Ursachen und was du änderst. Tippe auf ein Bild für die Lösungen.</p>
      <div class="hi-fb-wahl">${this._hiRollenWahl("Werte beziehen sich auf")}</div>
      <div class="fb-raster">${FEHLERBILDER.map((f) => `<div class="fb-karte" data-fb="${f.id}">
          <button class="fb-kopf" data-aktion="hi-fehler" data-id="${f.id}" aria-haspopup="dialog">${FB_ZEICHNUNG[f.id] || ""}<span><strong>${esc(f.name)}</strong><small class="leise">${esc(f.kurz)}</small></span></button>
        </div>`).join("")}</div>`;
  },
  // Großes Fenster mit Ursachen und Lösungen, mittig über allem (wird in .app gehängt)
  _hiFehlerPopupHtml() {
    const f = fehlerbild(this._hi.fehler);
    if (!f) return "";
    const r = this._hiRolle();
    return `<div class="hi-fb-ebene" data-fb-ebene="${f.id}">
      <div class="hi-fb-schleier" data-aktion="hi-fehler-zu" data-einmal="hi-fb-schleier"></div>
      <div class="hi-fb-popup" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="hi-fb-titel" data-einmal="hi-fb-${f.id}">
        <button class="icon-knopf hi-fb-x" data-aktion="hi-fehler-zu" aria-label="Schließen">✕</button>
        <div class="hi-fb-kopf">${FB_ZEICHNUNG[f.id] || ""}<div><h2 id="hi-fb-titel">${esc(f.name)}</h2><p class="leise">${esc(f.kurz)}</p></div></div>
        <h3>Ursachen</h3><ul class="hi-fb-ursachen">${f.ursachen.map((u) => `<li>${esc(u)}</li>`).join("")}</ul>
        <h3>Was du änderst${r ? ` <span class="leise klein">· Werte für ${esc(r.name)}</span>` : ""}</h3>
        <ul class="bu-loesungen">${f.loesungen.map((l) => { const a = l.aenderung && r ? aenderungRechnen(r, l.aenderung) : null;
          return `<li><span class="bu-punkt">•</span><span>${esc(l.text)}${a ? ` <span class="bu-aend">${esc(a.feld.name)}: ${zahl(a.alt, a.feld.nk || 0)} → <strong>${zahl(a.neu, a.feld.nk || 0)}</strong> ${esc(a.feld.e)}</span>` : ""}</span></li>`; }).join("")}</ul>
        ${this._hiRollenWahl("Werte für andere Rolle")}
      </div></div>`;
  },
  // Fenster öffnen, ohne die Seite neu zu zeichnen (kein Flackern)
  _hiFehlerAuf(id) {
    const h = this._hi, app = this.shadowRoot.querySelector(".app");
    if (!fehlerbild(id) || !app) return;
    const alt = app.querySelector(".hi-fb-ebene");
    if (alt) alt.remove();
    h.fehler = id;
    app.insertAdjacentHTML("beforeend", this._hiFehlerPopupHtml());
    this._auswahlenBauen();
    this._hiPopupEinrichten(true);
  },
  _hiFehlerZu() {
    const h = this._hi, ebene = this.shadowRoot.querySelector(".hi-fb-ebene");
    const id = h.fehler;
    h.fehler = null;
    if (!ebene) return;
    if (ebene.classList.contains("zu")) return;
    // .still würde die Schließ-Animation abschalten
    ebene.querySelectorAll(".still").forEach((x) => x.classList.remove("still"));
    ebene.classList.add("zu");
    setTimeout(() => {
      ebene.remove();
      const k = this.shadowRoot.querySelector(`.fb-karte[data-fb="${id}"] .fb-kopf`);
      if (k) k.focus({ preventScroll: true });
    }, 190);
  },
  // Fenster aus .haupt nach .app holen (über Navigation und Kopf) und Tastatur einrichten
  _hiPopupEinrichten(fokus) {
    const app = this.shadowRoot.querySelector(".app");
    const ebene = this.shadowRoot.querySelector(".hi-fb-ebene");
    if (!app || !ebene) return;
    if (ebene.parentElement !== app) app.appendChild(ebene);
    if (ebene._hiBereit) return;
    ebene._hiBereit = true;
    ebene.addEventListener("keydown", (e) => { if (e.key === "Escape" && !this._ddOffen) { e.stopPropagation(); this._hiFehlerZu(); } });
    // Fenster ist modal: Fokus hinein, damit Escape und Tab dort wirken
    const ziel = fokus ? ebene.querySelector(".hi-fb-x") : ebene.querySelector(".hi-fb-popup");
    if (ziel && !ebene.contains(this.shadowRoot.activeElement)) ziel.focus({ preventScroll: true });
  },

  _hiKalHtml() {
    const h = this._hi;
    const k = KALIBRIERUNGEN.find((x) => x.id === h.kal) || KALIBRIERUNGEN[0];
    const f = FELDER.find((x) => x.k === k.feld);
    const r = this._hiRolle();
    const aktuell = wert(r, k.feld).v;
    const w = h.kalWert != null ? h.kalWert : aktuell;
    const kal = (r.kalibriert || {})[k.feld];
    return `<div class="chips kal-wahl unter-tabs">${KALIBRIERUNGEN.map((x) => `<button class="chip ${x.id === k.id ? "an" : ""}" data-aktion="hi-kal" data-id="${x.id}">${x.icon} ${esc(x.name)}</button>`).join("")}</div>
      <div class="hi-raster">
        <div class="dr-karte" data-einmal="kal-${k.id}"><div class="kal-kopf">${typeof k.bild === "function" ? k.bild(r) : k.bild}<div><h2>${esc(k.name)}</h2><p class="leise">${esc(k.wozu)}</p></div></div>
          <h3>So geht's</h3><ol class="kal-liste">${k.so.map((s) => `<li>${esc(kalText(s, r))}</li>`).join("")}</ol>
          <h3>Worauf achten</h3><ul class="kal-liste">${k.achten.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
          <h3>Typische Fehler</h3><ul class="kal-liste fehler">${k.fehler.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>
        <div class="dr-karte"><h3 class="dr-titel">Ergebnis eintragen</h3>
          ${this._hiRollenWahl("Rolle")}
          <div class="mod-regler"><div class="r-kopf"><span>${esc(f.name)}</span><strong id="hi-kal-wert">${w == null ? "–" : `${zahl(w, f.nk || 0)} ${f.e}`}</strong></div>
            <div class="regler-zeile"><button class="rund" data-aktion="hi-kal-schritt" data-d="-1">−</button><input type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${w == null ? f.min : w}" data-hi="kal-wert"><button class="rund" data-aktion="hi-kal-schritt" data-d="1">+</button></div></div>
          <p class="leise klein">Bisher: ${aktuell == null ? "–" : `${zahl(aktuell, f.nk || 0)} ${f.e}`} (${wert(r, k.feld).quelle === "vorschlag" ? "Vorschlag" : "dein Wert"})${kal ? ` · kalibriert am ${new Date(kal).toLocaleDateString("de-DE")}` : ""}</p>
          <button class="knopf breit" data-aktion="hi-kal-speichern">In ${esc(r.name)} speichern</button></div>
      </div>`;
  },

  // Mausbewegung über der Zeichnung: Info sofort wechseln, ohne alles neu zu zeichnen
  _hiNachZeichnen() {
    this._hiPopupEinrichten(false);
    const svg = this.shadowRoot.querySelector(".p1s-bild, .trockner-bild");
    if (!svg || svg._hiBereit) return;
    svg._hiBereit = true;
    svg.addEventListener("mouseover", (e) => {
      const g = e.target.closest && e.target.closest(".p1s-punkt");
      if (!g || this._mobil) return;
      this._hiZeigen(g.dataset.aktion, g.dataset.id);
    });
  },
  _hiZeigen(art, id) {
    const h = this._hi;
    if (art === "hi-p1s") { if (h.p1s === id) return; h.p1s = id; } else { if (h.tr === id) return; h.tr = id; }
    this.shadowRoot.querySelectorAll(".p1s-punkt").forEach((g) => g.classList.toggle("an", g.dataset.id === id));
    if (art === "hi-p1s") {
      const box = this.shadowRoot.getElementById("hi-info");
      if (box) { box.innerHTML = this._hiP1sInfoHtml(); this._auswahlenBauen(); box.classList.remove("wechsel"); void box.offsetWidth; box.classList.add("wechsel"); }
      if (this._mobil && box) box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      const b = TROCKNER_BEREICHE.find((x) => x.id === id);
      const box = this.shadowRoot.getElementById("hi-tr-info");
      if (box && b) { box.innerHTML = `<strong>${TROCKNER_BEREICHE.indexOf(b) + 1} · ${esc(b.name)}</strong><span>${esc(b.text)}</span>`; box.classList.remove("wechsel"); void box.offsetWidth; box.classList.add("wechsel"); }
    }
  },

  _hiKlick(a, el) {
    if (a.startsWith("hi-ks-") || a.startsWith("hi-cd-")) { this._ksKlick(a, el); return; }   // Kunststoffe/Fehlercodes (kunststoffe.js)
    const h = this._hiZustand();
    switch (a) {
      case "hi-tab": h.tab = el.dataset.id; h.fehler = null; break;
      case "hi-p1s": case "hi-tr": this._hiZeigen(a, el.dataset.id); return;
      case "hi-fehler": this._hiFehlerAuf(el.dataset.id); return;
      case "hi-fehler-zu": this._hiFehlerZu(); return;
      case "hi-kal": h.kal = el.dataset.id; h.kalWert = null; break;
      case "hi-auf": this._hiAufZu(el.dataset.id); return;
      case "hi-kn-gruppe": h.knGruppe = el.dataset.id; break;
      case "hi-kn-duese": h.knDuese = Number(el.dataset.id); break;
      case "hi-kn-einsatz": h.knEinsatz = el.dataset.id; break;
      case "hi-lex-gruppe": h.lexGruppe = el.dataset.id; h.lexQ = ""; break;
      case "hi-platte": h.platte = el.dataset.id; break;
      case "hi-kal-schritt": {
        const k = KALIBRIERUNGEN.find((x) => x.id === h.kal), f = FELDER.find((x) => x.k === k.feld);
        const r = this._hiRolle();
        const alt = h.kalWert != null ? h.kalWert : (wert(r, k.feld).v ?? f.min);
        h.kalWert = Math.min(f.max, Math.max(f.min, Math.round((alt + Number(el.dataset.d) * f.step) / f.step) * f.step));
        this._hiKalWertZeigen();
        return;
      }
      case "hi-kal-speichern": {
        const k = KALIBRIERUNGEN.find((x) => x.id === h.kal), f = FELDER.find((x) => x.k === k.feld);
        const r = this._hiRolle();
        const w = h.kalWert != null ? h.kalWert : wert(r, k.feld).v;
        if (w == null) return;
        r.eigen = { ...(r.eigen || {}), [k.feld]: w };
        r.kalibriert = { ...(r.kalibriert || {}), [k.feld]: new Date().toISOString() };
        h.kalWert = null;
        this._speichern();
        this._toast(`${f.name} ${zahl(w, f.nk || 0)} ${f.e} bei ${r.name} gespeichert.`);
        return;
      }
      default: return;
    }
    this._zeichnen();
  },
  _hiKalWertZeigen() {
    const h = this._hi, k = KALIBRIERUNGEN.find((x) => x.id === h.kal), f = FELDER.find((x) => x.k === k.feld);
    const s = this.shadowRoot.getElementById("hi-kal-wert");
    if (s) s.textContent = `${zahl(h.kalWert, f.nk || 0)} ${f.e}`;
    const i = this.shadowRoot.querySelector('[data-hi="kal-wert"]');
    if (i) i.value = h.kalWert;
  },
  _hiEingabe(t) {
    const k = t.dataset && t.dataset.hi;
    if (!k) return false;
    if (k === "kal-wert") { this._hi.kalWert = Number(t.value); this._hiKalWertZeigen(); }
    if (k === "kn-wand") {
      this._hi.knWand = Number(t.value);
      const w = this.shadowRoot.getElementById("hi-kn-wand-wert"), e = this.shadowRoot.getElementById("hi-kn-wand-erg");
      if (w) w.textContent = `${zahl(this._hi.knWand, 2)} mm`;
      if (e) e.innerHTML = this._knWandErgebnisHtml();
    }
    if (k === "lex-suche") { this._hi.lexQ = t.value; this._hiLexSuchen(); }
    return true;
  },
  _hiAenderung(t) {
    const k = t.dataset && t.dataset.hi;
    if (!k) return false;
    if (k === "rolle") { this._hi.rolle = t.value; this._hi.kalWert = null; this._zeichnen(); }
    if (k === "tr-platz") {
      const p = this._hiPlaetze();
      p[Number(t.dataset.platz)] = t.value;
      this._daten.trockner_plaetze = p;   // optionales Feld, fehlt in älteren Daten
      this._speichern();
      this._zeichnen();
    }
    return true;
  },
};
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
            <small class="leise">${x.a.gewicht ? `${zahl(x.a.gewicht, 1)} g` : "Gewicht unbekannt"}${x.a.zeit ? ` · ${esc(x.a.zeit)}` : ""}${x.r ? ` · ${esc(x.r.name)}` : ""}</small>
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
// ---------------------------------------------------------------------------
// Nerd-Menü: Statistik, Fehlerquoten, wann Drucke scheitern, Schätzung gegen
// Waage (Korrekturfaktor), eigene Werte gegen Vorschläge, Gesundheit des Druckers
// ---------------------------------------------------------------------------

const NE_TABS = [["statistik", "📊 Statistik"], ["abgleich", "⚖️ Schätzung vs. Waage"], ["werte", "🎛️ Deine Werte"], ["gesundheit", "❤️ Gesundheit"]];
const NE_VERGLEICH = ["duese", "duese_erste", "bett", "luefter_max", "flow", "k", "max_vol", "v_aussen"];
const NE_TAGESZEIT = [["Nacht", 0, 6], ["Morgen", 6, 12], ["Nachmittag", 12, 18], ["Abend", 18, 24]];

// Zeitpunkt aus einem HA-Verlaufseintrag (komprimiert: lu in Sekunden)
function verlaufZeit(x) {
  if (x.lu != null) return x.lu * 1000;
  return new Date(x.last_updated || x.last_changed || x.lc || 0).getTime();
}
// Aufheizvorgänge: Zieltemperatur springt hoch → Zeit, bis die Ist-Temperatur fast da ist
function aufheizZeiten(ziel, ist, schwelle) {
  const z = ziel.map((x) => ({ t: verlaufZeit(x), v: Number(x.s ?? x.state) })).filter((x) => !isNaN(x.v) && x.t);
  const i = ist.map((x) => ({ t: verlaufZeit(x), v: Number(x.s ?? x.state) })).filter((x) => !isNaN(x.v) && x.t);
  const erg = [];
  for (let k = 1; k < z.length; k++) {
    if (!(z[k - 1].v < schwelle && z[k].v >= schwelle)) continue;
    const t0 = z[k].t, soll = z[k].v;
    const start = [...i].reverse().find((x) => x.t <= t0);
    const da = i.find((x) => x.t >= t0 && x.v >= soll - 3);
    if (!da) continue;
    const s = (da.t - t0) / 1000;
    if (s > 3 && s < 1800) erg.push({ am: t0, s, soll, von: start ? start.v : null });
  }
  return erg;
}

const NerdAnsicht = {
  _neZustand() {
    if (!this._ne) this._ne = { tab: "statistik", abRolle: null, abWert: null, heiz: null };
    return this._ne;
  },
  _neHtml() {
    const n = this._neZustand();
    const inhalt = { abgleich: () => this._neAbgleichHtml(), werte: () => this._neWerteHtml(), gesundheit: () => this._neGesundheitHtml() }[n.tab] || (() => this._neStatistikHtml());
    return `<div class="ne-seite">
      <div class="chips unter-tabs">${NE_TABS.map(([id, t]) => `<button class="chip ${n.tab === id ? "an" : ""}" data-aktion="ne-tab" data-id="${id}">${t}</button>`).join("")}</div>
      <div class="wechsel-rein" data-einmal="ne-${n.tab}">${inhalt()}</div></div>`;
  },

  // Ein Datensatz je Druck: Ergebnis, Material, Rolle, Zeitpunkte
  _neDrucke() {
    return this._buAlle().filter((d) => d.status !== "laeuft").map((d) => {
      const x = this._buExtra(d.uid), g = x.gebucht;
      const ergebnis = g ? g.ergebnis : d.status === "finish" ? "ok" : d.status === "failed" ? "abbruch" : null;
      const r = g ? this._daten.rollen.find((y) => y.id === g.rolle) : null;
      const dauer = d.start && d.ende ? (new Date(d.ende) - new Date(d.start)) / 3600000 : null;
      return { d, x, g, ergebnis, rolle: r, material: r ? r.material : null, dauer: dauer > 0 && dauer < 200 ? dauer : null,
        wann: x.fehl && x.fehl.wann ? x.fehl.wann : g && g.ergebnis === "fehl" ? wannAusFortschritt(g.fortschritt) : null };
    });
  },

  _neStatistikHtml() {
    const l = this._neDrucke();
    if (!l.length) return `<div class="leer-karte dr-karte"><span class="gross-icon">📊</span><strong>Noch keine Drucke</strong><span class="leise">Sobald Drucke aufgezeichnet und verbucht sind, erscheinen hier Zahlen.</span></div>`;
    const ok = l.filter((x) => x.ergebnis === "ok").length, fehl = l.filter((x) => x.ergebnis === "fehl").length;
    const stunden = l.reduce((s, x) => s + (x.dauer || 0), 0);
    const gramm = l.reduce((s, x) => s + (x.g ? x.g.g : 0), 0);
    const kwh = l.reduce((s, x) => s + (x.g && x.g.kosten && x.g.kosten.kwh ? x.g.kosten.kwh : 0), 0);
    const quote = ok + fehl ? Math.round((ok / (ok + fehl)) * 100) : null;
    const kachel = (w, t, k = "") => `<div class="stat ${k}"><strong>${w}</strong><span>${t}</span></div>`;
    // Fehlerquote je Material und je Rolle
    const gruppe = (schl) => {
      const m = {};
      for (const x of l) { const k = schl(x); if (!k || !(x.ergebnis === "ok" || x.ergebnis === "fehl")) continue; (m[k] = m[k] || { ok: 0, fehl: 0 })[x.ergebnis]++; }
      return Object.entries(m).map(([k, v]) => ({ k, ...v, n: v.ok + v.fehl, q: v.fehl / (v.ok + v.fehl) })).sort((a, b) => b.q - a.q || b.n - a.n);
    };
    const balken = (zeilen, name) => zeilen.length ? `<div class="ne-balken-liste">${zeilen.slice(0, 8).map((z) => `<div class="ne-balken-zeile"><span>${esc(name(z.k))}</span>
      <div class="ne-balken"><span style="width:${Math.max(2, Math.round(z.q * 100))}%" class="${z.q >= 0.3 ? "rot" : z.q >= 0.1 ? "amber" : ""}"></span></div><small>${Math.round(z.q * 100)} % · ${z.fehl}/${z.n}</small></div>`).join("")}</div>`
      : `<p class="leise klein">Noch keine verbuchten Drucke.</p>`;
    const rollenName = (id) => { const r = this._daten.rollen.find((x) => x.id === id); return r ? r.name : "gelöschte Rolle"; };
    // Wann scheitern Drucke: Phase und Tageszeit
    const fehlL = l.filter((x) => x.ergebnis === "fehl");
    const phasen = FEHL_FRAGEN.wann.map((w) => ({ name: w.name, n: fehlL.filter((x) => x.wann === w.id).length }));
    const maxP = Math.max(1, ...phasen.map((p) => p.n));
    const tz = NE_TAGESZEIT.map(([name, von, bis]) => {
      const imFenster = l.filter((x) => { if (!x.d.start || !(x.ergebnis === "ok" || x.ergebnis === "fehl")) return false; const h = new Date(x.d.start).getHours(); return h >= von && h < bis; });
      const f = imFenster.filter((x) => x.ergebnis === "fehl").length;
      return { name, n: imFenster.length, f, q: imFenster.length ? f / imFenster.length : 0 };
    });
    return `<section class="stats">
        ${kachel(l.length, "Drucke")}${kachel(quote == null ? "–" : `${quote} %`, "geglückt", quote != null && quote < 80 ? "amber" : "")}
        ${kachel(fehl, "Fehldrucke", fehl ? "rot" : "")}${kachel(`${zahl(stunden, 1)} h`, "Druckzeit")}
        ${kachel(`${zahl(gramm / 1000, 2)} kg`, "verbraucht")}${kachel(`${zahl(kwh, 1)} kWh`, "Strom")}</section>
      <div class="ws-zwei oben-abstand">
        <div class="dr-karte"><h3 class="dr-titel">Fehlerquote je Material</h3>${balken(gruppe((x) => x.material), (k) => k)}
          <h3>Fehlerquote je Rolle</h3>${balken(gruppe((x) => x.g && x.g.rolle), rollenName)}</div>
        <div class="dr-karte"><h3 class="dr-titel">Wann Drucke scheitern</h3>
          ${fehlL.length ? `<div class="ne-phasen">${phasen.map((p) => `<div class="ne-phase"><div class="ne-phase-bahn"><span style="height:${(p.n / maxP) * 100}%"></span></div><strong>${p.n}</strong><small>${esc(p.name)}</small></div>`).join("")}</div>`
            : `<p class="leise klein">Noch keine Fehldrucke verbucht.</p>`}
          <h3>Nach Tageszeit (Druckstart)</h3>
          <div class="info-liste">${tz.map((t) => `<div class="info-zeile"><span>${t.name}</span><strong>${t.n ? `${t.n} ${t.n === 1 ? "Druck" : "Drucke"} · ${Math.round(t.q * 100)} % Fehldrucke` : "–"}</strong></div>`).join("")}</div>
          ${this._neErkenntnisse(gruppe((x) => x.material), phasen, tz)}</div></div>`;
  },
  // Kurze Sätze aus den Zahlen, nur wenn genug Daten da sind
  _neErkenntnisse(mats, phasen, tz) {
    const s = [];
    const schlecht = mats.find((m) => m.n >= 3 && m.q >= 0.25);
    if (schlecht) s.push(`${schlecht.k} scheitert auffällig oft (${Math.round(schlecht.q * 100)} %). Ein Blick in Hilfe › Fehlerbilder und eine Kalibrierung lohnen sich.`);
    const p = phasen.slice().sort((a, b) => b.n - a.n)[0];
    if (p && p.n >= 2) s.push(`Die meisten Fehldrucke passieren „${p.name}“. ${FEHL_FRAGEN.wann.find((w) => w.name === p.name).hinweis}`);
    const t = tz.filter((x) => x.n >= 3).sort((a, b) => b.q - a.q)[0];
    if (t && t.q >= 0.3) s.push(`Drucke, die ${t.name === "Nacht" ? "nachts" : `am ${t.name}`} starten, scheitern öfter. Vielleicht kühlt der Raum ab oder niemand schaut beim ersten Layer zu.`);
    return s.length ? `<div class="hinweis mint oben-abstand">💡 ${s.map(esc).join("<br>💡 ")}</div>` : "";
  },

  // ---- Schätzung gegen Waage ----
  _neAbgleichHtml() {
    const n = this._ne, d = this._daten;
    const rollen = this._neRollen();
    const r = this._neRolle();
    const korr = d.einstellungen.korrektur || {};
    const verlauf = (d.abgleich || []).slice(-8).reverse();
    if (!r) return `<div class="hinweis amber">Wiege zuerst eine Rolle (Rolle öffnen › Rest), dann kann hier verglichen werden.</div>`;
    const seit = this._neGebuchtSeit(r);
    const brutto = n.abWert != null ? n.abWert : Math.round((r.rest_g || 0) + this._neSpuleG(r));
    const netto = brutto - this._neSpuleG(r);
    const echt = r.rest_g + seit.g - netto;   // tatsächlich verbraucht seit dem letzten Wiegen
    const faktor = seit.druck_g > 0 ? (echt - seit.fix_g) / seit.druck_g : null;
    return `<div class="ws-zwei">
      <div class="dr-karte"><h3 class="dr-titel">Rolle nachwiegen</h3>
        <p class="leise klein">Leg die Rolle mit Spule auf die Waage. Der Vergleich zeigt, ob die Gewichte aus dem Slicer zu deinem Verbrauch passen, und lernt daraus einen Korrekturfaktor je Material.</p>
        <label class="auswahl breit-auswahl"><span>Rolle</span><select data-ne="rolle">${rollen.map((x) => `<option value="${esc(x.id)}" ${x.id === r.id ? "selected" : ""}>${esc(x.name)} · ${esc(x.hersteller)}</option>`).join("")}</select></label>
        <div class="mod-regler"><div class="r-kopf"><span>Waage zeigt (mit Spule)</span><strong id="ne-brutto">${zahl(brutto)} g</strong></div>
          <div class="regler-zeile"><button class="rund" data-aktion="ne-schritt" data-d="-1">−1</button><input type="range" min="0" max="${Math.max(1500, (r.nenn_g || 1000) + 400)}" step="1" value="${brutto}" data-ne="brutto"><button class="rund" data-aktion="ne-schritt" data-d="1">+1</button></div></div>
        <div id="ne-ergebnis">${this._neAbgleichErgebnis(r, seit, netto, echt, faktor)}</div>
        <button class="knopf breit oben-abstand" data-aktion="ne-abgleich" ${seit.n ? "" : "disabled"}>Gewicht übernehmen und Faktor lernen</button>
        ${seit.n ? "" : `<p class="leise klein">Seit dem letzten Wiegen wurde nichts von dieser Rolle verbucht, es gibt noch nichts zu vergleichen.</p>`}</div>
      <div class="dr-karte"><h3 class="dr-titel">Korrekturfaktoren</h3>
        <p class="leise klein">Damit wird das Slicer-Gewicht beim Verbuchen multipliziert. 1,00 = Slicer stimmt genau.</p>
        <div class="info-liste">${[...new Set(d.rollen.map((x) => x.material))].map((m) => `<div class="info-zeile"><span>${esc(m)}</span><strong>${korr[m] ? zahl(korr[m], 3) : "1,000"}</strong></div>`).join("")}</div>
        ${Object.keys(korr).length ? `<button class="knopf leise breit oben-abstand" data-aktion="ne-korr-weg">Faktoren zurücksetzen</button>` : ""}
        ${verlauf.length ? `<h3>Letzte Abgleiche</h3><div class="info-liste">${verlauf.map((v) => `<div class="info-zeile"><span>${esc(v.name)}<small class="norm">${new Date(v.am).toLocaleDateString("de-DE")} · gebucht ${zahl(v.gebucht, 1)} g, echt ${zahl(v.echt, 1)} g</small></span><strong class="${Math.abs(v.faktor - 1) > 0.1 ? "amber" : ""}">× ${zahl(v.faktor, 3)}</strong></div>`).join("")}</div>` : ""}</div></div>`;
  },
  _neAbgleichErgebnis(r, seit, netto, echt, faktor) {
    const abw = seit.g ? ((echt - seit.g) / seit.g) * 100 : 0;
    return `<div class="info-liste oben-abstand">
      <div class="info-zeile"><span>Zuletzt gewogen</span><strong>${r.gewogen_am ? new Date(r.gewogen_am).toLocaleDateString("de-DE") : "–"}</strong></div>
      <div class="info-zeile"><span>Seitdem verbucht</span><strong>${seit.n} Drucke · ${zahl(seit.g, 1)} g</strong></div>
      <div class="info-zeile"><span>Laut Waage verbraucht</span><strong class="${Math.abs(abw) > 10 ? "amber" : ""}">${zahl(echt, 1)} g${seit.g ? ` (${abw >= 0 ? "+" : ""}${zahl(abw)} %)` : ""}</strong></div>
      <div class="info-zeile"><span>Rest neu</span><strong>${zahl(Math.max(0, netto))} g</strong></div>
      <div class="info-zeile"><span>Faktor aus diesem Abgleich</span><strong>${faktor != null && faktor > 0 ? `× ${zahl(faktor, 3)}` : "–"}</strong></div></div>
      ${echt < 0 ? `<div class="hinweis amber">Die Rolle wiegt mehr als erwartet. Stimmt das Spulengewicht?</div>` : ""}`;
  },
  // Nur gewogene Rollen lassen sich vergleichen
  _neRollen() { return this._daten.rollen.filter((r) => r.rest_g != null).sort((a, b) => a.name.localeCompare(b.name, "de")); },
  _neRolle() {
    const l = this._neRollen(), n = this._neZustand();
    return l.find((x) => x.id === n.abRolle) || l.find((x) => x.id === this._daten.letzte_rolle) || l[0] || null;
  },
  _neSpuleG(r) {
    const s = r.spule && this._daten.spulen.find((x) => x.id === r.spule);
    return s ? s.g : r.spule_g != null ? r.spule_g : 0;
  },
  _neGebuchtSeit(r) {
    const ab = r.gewogen_am || "";
    let g = 0, druck_g = 0, fix_g = 0, n = 0;
    for (const x of Object.values(this._daten.drucke || {})) {
      const b = x.gebucht;
      if (b && b.rolle === r.id && b.am > ab) { g += b.g; druck_g += b.druck_g || 0; fix_g += b.fix_g || 0; n++; }
      if (b && b.wechsel && b.wechsel.rolle === r.id && b.am > ab) { g += b.wechsel.g; fix_g += b.wechsel.g; }
    }
    return { g, druck_g, fix_g, n };
  },
  _neAbgleichen() {
    const n = this._ne, d = this._daten;
    const r = this._neRolle();
    if (!r || n.abWert == null) { this._toast("Bitte zuerst das Gewicht von der Waage einstellen."); return; }
    const seit = this._neGebuchtSeit(r);
    const netto = Math.max(0, n.abWert - this._neSpuleG(r));
    const echt = r.rest_g + seit.g - netto;
    let faktor = seit.druck_g > 0 ? (echt - seit.fix_g) / seit.druck_g : null;
    if (faktor != null && (faktor < 0.5 || faktor > 1.6)) {
      this._toast(`Faktor ${zahl(faktor, 2)} ist unplausibel (Spulengewicht oder Waage prüfen). Gewicht übernommen, Faktor nicht gelernt.`);
      faktor = null;
    }
    d.abgleich = [...(d.abgleich || []), { am: new Date().toISOString(), rolle: r.id, name: r.name, material: r.material, gebucht: seit.g, echt, faktor: faktor || 1 }].slice(-60);
    if (faktor != null) {
      // Mittel der letzten Abgleiche dieses Materials, vorsichtig begrenzt
      const f = d.abgleich.filter((v) => v.material === r.material && v.faktor).slice(-5).map((v) => v.faktor);
      d.einstellungen.korrektur = { ...d.einstellungen.korrektur, [r.material]: Math.min(1.3, Math.max(0.7, f.reduce((s, v) => s + v, 0) / f.length)) };
    }
    r.rest_g = netto;
    r.gewogen_am = new Date().toISOString();
    n.abWert = null;
    this._speichern();
    if (faktor != null) this._toast(`${r.name}: ${zahl(netto)} g übernommen, Faktor für ${r.material} jetzt ${zahl(d.einstellungen.korrektur[r.material], 3)}.`);
  },

  // ---- Eigene Werte gegen Vorschläge ----
  _neWerteHtml() {
    const rollen = this._daten.rollen.filter((r) => r.eigen && Object.keys(r.eigen).length);
    if (!rollen.length) return `<div class="leer-karte dr-karte"><span class="gross-icon">🎛️</span><strong>Noch keine eigenen Werte</strong><span class="leise">Wenn du nach einem Test Werte anpasst oder kalibrierst, siehst du hier, wo du vom Vorschlag abweichst.</span></div>`;
    const mats = [...new Set(rollen.map((r) => r.material))];
    const zeilen = mats.map((m) => {
      const rs = rollen.filter((r) => r.material === m);
      const felder = NE_VERGLEICH.map((k) => {
        const f = FELDER.find((x) => x.k === k);
        const diffs = rs.filter((r) => r.eigen[k] != null && r.vorschlag && r.vorschlag[k] != null).map((r) => r.eigen[k] - r.vorschlag[k]);
        if (!diffs.length) return null;
        const mittel = diffs.reduce((s, v) => s + v, 0) / diffs.length;
        return Math.abs(mittel) < f.step / 2 ? null : { f, mittel, n: diffs.length };
      }).filter(Boolean);
      return { m, n: rs.length, felder };
    });
    return `<p class="leise">Wo deine eingestellten Werte im Schnitt vom Vorschlag abweichen. Weichst du immer in dieselbe Richtung ab, sind die Vorschläge für neue Rollen zu korrigieren.</p>
      <div class="ws-raster">${zeilen.map((z) => `<div class="dr-karte"><h3 class="dr-titel">${esc(z.m)} · ${z.n} Rollen mit eigenen Werten</h3>
        ${z.felder.length ? `<div class="info-liste">${z.felder.map((x) => `<div class="info-zeile"><span>${esc(x.f.name)}<small class="norm">bei ${x.n} Rollen</small></span><strong class="${x.mittel > 0 ? "amber" : "mint"}">${x.mittel > 0 ? "+" : ""}${zahl(x.mittel, x.f.nk || 0)} ${esc(x.f.e)}</strong></div>`).join("")}</div>`
          : `<p class="leise klein">Deine Werte entsprechen den Vorschlägen.</p>`}</div>`).join("")}</div>
      <h3>Je Rolle</h3>
      <div class="info-liste">${rollen.map((r) => {
        const anders = Object.keys(r.eigen).filter((k) => r.vorschlag && r.vorschlag[k] != null && r.eigen[k] !== r.vorschlag[k]);
        return `<button class="info-zeile zeilen-knopf" data-aktion="oeffnen-filament" data-id="${esc(r.id)}"><span>${esc(r.name)}<small class="norm">${esc(r.hersteller)}${r.kalibriert ? " · kalibriert" : ""}</small></span><strong>${anders.length ? `${anders.length} Werte geändert` : "wie Vorschlag"}</strong></button>`;
      }).join("")}</div>`;
  },

  // ---- Gesundheit ----
  _neGesundheitHtml() {
    const n = this._ne, w = (k) => this._drW(k), z = (k) => this._drZ(k);
    const wlan = z("wlan") != null ? z("wlan") : (w("wlan") ? parseInt(w("wlan"), 10) : null);
    const zeile = (name, wert, gut, text) => `<div class="ne-gesund ${gut === false ? "schlecht" : gut ? "gut" : ""}"><span class="punkt">${gut === false ? "!" : gut ? "✓" : "·"}</span><div><strong>${esc(name)}</strong><small class="leise">${esc(text)}</small></div><b>${esc(wert)}</b></div>`;
    const h = n.heiz;
    const mittel = (l) => (l.length ? l.reduce((s, x) => s + x.s, 0) / l.length : null);
    const heizKarte = (titel, l, normal) => {
      if (!l || !l.length) return `<div class="ne-heiz"><strong>${titel}</strong><small class="leise">Keine Aufheizvorgänge im Zeitraum gefunden.</small></div>`;
      const m = mittel(l), alt = mittel(l.slice(0, Math.ceil(l.length / 2))), neu = mittel(l.slice(Math.floor(l.length / 2)));
      const trend = l.length >= 4 && neu > alt * 1.2;
      const maxS = Math.max(...l.map((x) => x.s));
      return `<div class="ne-heiz"><strong>${titel}</strong><span class="ne-heiz-wert ${m > normal * 1.5 ? "amber" : ""}">${zahl(m)} s</span>
        <div class="ne-mini-saeulen">${l.slice(-20).map((x) => `<span title="${new Date(x.am).toLocaleString("de-DE")}: ${zahl(x.s)} s auf ${zahl(x.soll)} °C" style="height:${Math.max(8, (x.s / maxS) * 100)}%"></span>`).join("")}</div>
        <small class="leise">${l.length} Vorgänge · normal etwa ${normal} s${trend ? " · <b class='amber'>wird langsamer</b>" : ""}</small></div>`;
    };
    return `<div class="ws-zwei">
      <div class="dr-karte"><h3 class="dr-titel">Zustand jetzt</h3>
        ${zeile("Verbindung", w("online") === "on" ? "online" : w("online") === "off" ? "offline" : "–", w("online") === "on" ? true : w("online") === "off" ? null : null, "Drucker meldet sich bei Home Assistant")}
        ${zeile("WLAN", wlan != null ? `${wlan} dBm` : "–", wlan == null ? null : wlan > -70, "Besser als −70 dBm ist gut, unter −80 dBm brechen Verbindungen ab")}
        ${zeile("HMS-Meldungen", w("hms") === "on" ? "aktiv" : w("hms") === "off" ? "keine" : "–", w("hms") === "on" ? false : w("hms") === "off" ? true : null, "Fehlercodes des Druckers selbst")}
        ${zeile("Firmware", w("firmware") === "on" ? "Update da" : w("firmware") === "off" ? "aktuell" : "–", w("firmware") === "on" ? false : w("firmware") === "off" ? true : null, "Updates bringen oft bessere Kalibrierung")}
        ${zeile("Betriebsstunden", z("stunden") != null ? `${zahl(z("stunden"))} h` : "–", null, "Grundlage für den Wartungsplan")}
        ${zeile("Wartung fällig", `${this._wsWartung().filter((x) => x.faellig).length}`, this._wsWartung().some((x) => x.faellig) ? false : true, "Siehe Werkstatt › Wartung")}</div>
      <div class="dr-karte"><h3 class="dr-titel">Aufheizzeiten</h3>
        <p class="leise klein">Wird das Aufheizen mit der Zeit langsamer, kann das auf ein schwächelndes Heizelement, einen losen Thermistor oder eine fehlende Silikonsocke hindeuten.</p>
        ${!h ? `<button class="knopf breit" data-aktion="ne-heiz">Letzte 4 Tage auswerten</button>` : h.laedt ? `<div class="mod-laden-klein"><span class="dreher klein"></span> Lese Verlauf aus Home Assistant …</div>`
          : h.fehler ? `<div class="hinweis amber">${esc(h.fehler)}</div><button class="knopf leise breit" data-aktion="ne-heiz">Nochmal versuchen</button>`
          : `${heizKarte("Düse", h.duese, 90)}${heizKarte("Druckbett", h.bett, 120)}<button class="knopf leise breit oben-abstand" data-aktion="ne-heiz">Neu auswerten</button>`}</div></div>`;
  },
  async _neHeizLaden() {
    const n = this._ne;
    n.heiz = { laedt: true };
    this._zeichnen();
    const ids = ["duese", "duese_ziel", "bett", "bett_ziel"].map((k) => this._drId(k));
    if (ids.some((x) => !x)) { n.heiz = { fehler: "Temperatursensoren des Druckers nicht gefunden." }; this._zeichnen(); return; }
    try {
      const start = new Date(Date.now() - 4 * 86400000).toISOString();
      const r = await Promise.race([
        this._hass.callWS({ type: "history/history_during_period", start_time: start, entity_ids: ids, minimal_response: true, no_attributes: true }),
        new Promise((_, nein) => setTimeout(() => nein(new Error("Home Assistant hat nicht rechtzeitig geantwortet.")), 30000)),
      ]);
      const l = (id) => (r && r[id]) || [];
      n.heiz = { duese: aufheizZeiten(l(ids[1]), l(ids[0]), 150), bett: aufheizZeiten(l(ids[3]), l(ids[2]), 40) };
    } catch (e) {
      n.heiz = { fehler: `Verlauf konnte nicht gelesen werden: ${e.message || e}` };
    }
    if (this._ansicht === "nerd") this._zeichnen();
  },

  // ---- Ereignisse ----
  _neKlick(a, el) {
    const n = this._neZustand();
    switch (a) {
      case "ne-tab": n.tab = el.dataset.id; break;
      case "ne-schritt": {
        const i = this.shadowRoot.querySelector('[data-ne="brutto"]');
        if (!i) return;
        i.value = Number(i.value) + Number(el.dataset.d);
        this._neEingabe(i);
        return;
      }
      case "ne-abgleich": this._neAbgleichen(); break;
      case "ne-korr-weg": this._daten.einstellungen.korrektur = {}; this._speichern(); this._toast("Korrekturfaktoren zurückgesetzt."); return;
      case "ne-heiz": this._neHeizLaden(); return;
      default: return;
    }
    this._zeichnen();
  },
  _neEingabe(t) {
    const k = t.dataset && t.dataset.ne;
    if (!k) return false;
    if (k === "brutto") {
      const n = this._ne;
      n.abWert = Number(t.value);
      const r = this._neRolle();
      if (!r) return true;
      const s = this.shadowRoot.getElementById("ne-brutto"); if (s) s.textContent = `${zahl(n.abWert)} g`;
      const seit = this._neGebuchtSeit(r), netto = n.abWert - this._neSpuleG(r), echt = r.rest_g + seit.g - netto;
      const box = this.shadowRoot.getElementById("ne-ergebnis");
      if (box) box.innerHTML = this._neAbgleichErgebnis(r, seit, netto, echt, seit.druck_g > 0 ? (echt - seit.fix_g) / seit.druck_g : null);
    }
    return true;
  },
  _neAenderung(t) {
    const k = t.dataset && t.dataset.ne;
    if (!k) return false;
    if (k === "rolle") { this._ne.abRolle = t.value; this._ne.abWert = null; this._zeichnen(); }
    return true;
  },
};
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
// ---------------------------------------------------------------------------
// 3D-Modelle: STL lesen, Maße/Volumen, Schnitte, Löcher, Schichten, G-Code
// (alles ohne fremde Bibliotheken, läuft offline auf dem Pi)
// ---------------------------------------------------------------------------

const BETT_MM = 256;          // Bauraum P1S: 256 × 256 × 256 mm
const STUETZ_WINKEL = 30;     // Überhang ab 30° zur Waagerechten (Bambu-Standard „Threshold angle“)
const FILAMENT_QUERSCHNITT = Math.PI * 0.875 * 0.875;   // mm² bei 1,75 mm

// ---- STL ------------------------------------------------------------------
// Ergebnis: Float32Array mit 9 Zahlen je Dreieck (x1 y1 z1 x2 y2 z2 x3 y3 z3)
function stlLesen(puffer) {
  const dv = new DataView(puffer);
  if (puffer.byteLength >= 84) {
    const n = dv.getUint32(80, true);
    if (84 + n * 50 === puffer.byteLength) {
      if (typeof MOD_MAX_DREIECKE !== "undefined" && n > MOD_MAX_DREIECKE) throw new Error(`Das Modell hat ${n.toLocaleString("de-DE")} Dreiecke, das schafft der Browser nicht flüssig. Bitte im Slicer vereinfachen.`);
      const v = new Float32Array(n * 9);
      for (let i = 0; i < n; i++) {
        const o = 84 + i * 50 + 12;
        for (let k = 0; k < 9; k++) v[i * 9 + k] = dv.getFloat32(o + k * 4, true);
      }
      return v;
    }
  }
  const text = new TextDecoder().decode(puffer);
  if (!/^\s*solid/i.test(text) || !/vertex/i.test(text)) throw new Error("Das ist keine gültige STL-Datei.");
  const zahlen = [];
  const re = /vertex\s+([-+\d.eE]+)\s+([-+\d.eE]+)\s+([-+\d.eE]+)/g;
  let m;
  while ((m = re.exec(text))) zahlen.push(+m[1], +m[2], +m[3]);
  if (!zahlen.length || zahlen.length % 9) throw new Error("Die STL-Datei ist unvollständig.");
  return new Float32Array(zahlen);
}

function meshGrenzen(v) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < v.length; i += 3) for (let k = 0; k < 3; k++) {
    if (v[i + k] < min[k]) min[k] = v[i + k];
    if (v[i + k] > max[k]) max[k] = v[i + k];
  }
  return { min, max, groesse: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] };
}

// Modell mittig aufs Bett stellen (Unterkante auf z = 0)
function aufsBett(v) {
  const g = meshGrenzen(v);
  const dx = BETT_MM / 2 - (g.min[0] + g.max[0]) / 2, dy = BETT_MM / 2 - (g.min[1] + g.max[1]) / 2, dz = -g.min[2];
  for (let i = 0; i < v.length; i += 3) { v[i] += dx; v[i + 1] += dy; v[i + 2] += dz; }
  return v;
}

// Um 90° drehen (achse 0/1/2, richtung ±1)
function drehen90(v, achse, richtung) {
  const [a, b] = achse === 0 ? [1, 2] : achse === 1 ? [2, 0] : [0, 1];
  for (let i = 0; i < v.length; i += 3) {
    const p = v[i + a], q = v[i + b];
    v[i + a] = -q * richtung; v[i + b] = p * richtung;
  }
  return aufsBett(v);
}

function meshKennwerte(v) {
  let vol = 0, flaeche = 0;
  for (let i = 0; i < v.length; i += 9) {
    const ax = v[i], ay = v[i + 1], az = v[i + 2], bx = v[i + 3], by = v[i + 4], bz = v[i + 5], cx = v[i + 6], cy = v[i + 7], cz = v[i + 8];
    vol += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
    const ux = bx - ax, uy = by - ay, uz = bz - az, wx = cx - ax, wy = cy - ay, wz = cz - az;
    flaeche += Math.hypot(uy * wz - uz * wy, uz * wx - ux * wz, ux * wy - uy * wx) / 2;
  }
  return { volumen: Math.abs(vol), flaeche, dreiecke: v.length / 9 };
}

// Gewicht schätzen: Hülle (Wände) voll, Inneres mit Füllgrad
function gewichtSchaetzen(kenn, dichte, { duese = 0.4, waende = 2, fuellung = 15 } = {}) {
  const linie = duese * 1.05;
  const huelle = Math.min(kenn.volumen, kenn.flaeche * waende * linie * 0.9);
  const mm3 = huelle + (kenn.volumen - huelle) * (fuellung / 100);
  return { gramm: (mm3 / 1000) * dichte, mm3, meter: mm3 / FILAMENT_QUERSCHNITT / 1000 };
}

// Flächen, die Stützen brauchen (Normale zeigt steiler als STUETZ_WINKEL nach unten, nicht auf dem Bett)
function ueberhaenge(v) {
  const grenze = -Math.cos((STUETZ_WINKEL * Math.PI) / 180);
  const markiert = new Uint8Array(v.length / 9);
  let flaeche = 0;
  for (let t = 0, i = 0; i < v.length; i += 9, t++) {
    const ux = v[i + 3] - v[i], uy = v[i + 4] - v[i + 1], uz = v[i + 5] - v[i + 2];
    const wx = v[i + 6] - v[i], wy = v[i + 7] - v[i + 1], wz = v[i + 8] - v[i + 2];
    const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    const l = Math.hypot(nx, ny, nz) || 1;
    const zMin = Math.min(v[i + 2], v[i + 5], v[i + 8]);
    if (nz / l < grenze && zMin > 0.3) { markiert[t] = 1; flaeche += l / 2; }
  }
  return { markiert, flaeche };
}

// ---- Schnitte ---------------------------------------------------------------
// Dreiecke nach Höhe sortiert vorbereiten, damit viele Schnitte schnell gehen
function schnittVorbereiten(v, achse = 2) {
  const [a, b] = achse === 2 ? [0, 1] : achse === 0 ? [1, 2] : [2, 0];
  const n = v.length / 9;
  const lo = new Float32Array(n), hi = new Float32Array(n);
  for (let t = 0; t < n; t++) {
    const i = t * 9;
    lo[t] = Math.min(v[i + achse], v[i + 3 + achse], v[i + 6 + achse]);
    hi[t] = Math.max(v[i + achse], v[i + 3 + achse], v[i + 6 + achse]);
  }
  const reihe = Uint32Array.from({ length: n }, (_, i) => i).sort((x, y) => lo[x] - lo[y]);
  return { v, achse, a, b, lo, hi, reihe };
}

// Schnitt bei Höhe h: geschlossene Linienzüge [[x,y], …] in den Achsen a/b
function schneiden(s, h) {
  const { v, achse, a, b, lo, hi, reihe } = s;
  const strecken = [];
  for (let k = 0; k < reihe.length; k++) {
    const t = reihe[k];
    if (lo[t] > h) break;
    if (hi[t] < h || lo[t] === hi[t]) continue;
    const i = t * 9, p = [];
    for (let e = 0; e < 3; e++) {
      const i1 = i + e * 3, i2 = i + ((e + 1) % 3) * 3;
      const h1 = v[i1 + achse], h2 = v[i2 + achse];
      if ((h1 <= h && h2 > h) || (h2 <= h && h1 > h)) {
        const f = (h - h1) / (h2 - h1);
        p.push([v[i1 + a] + (v[i2 + a] - v[i1 + a]) * f, v[i1 + b] + (v[i2 + b] - v[i1 + b]) * f]);
      }
    }
    if (p.length === 2) strecken.push(p);
  }
  return streckenVerbinden(strecken);
}

function streckenVerbinden(strecken) {
  const schl = (p) => `${Math.round(p[0] * 1000)},${Math.round(p[1] * 1000)}`;
  const nach = new Map();
  strecken.forEach((st, i) => {
    for (const e of [0, 1]) {
      const k = schl(st[e]);
      if (!nach.has(k)) nach.set(k, []);
      nach.get(k).push(i);
    }
  });
  const benutzt = new Uint8Array(strecken.length);
  const zuege = [];
  for (let i = 0; i < strecken.length; i++) {
    if (benutzt[i]) continue;
    benutzt[i] = 1;
    const zug = [strecken[i][0], strecken[i][1]];
    const start = schl(zug[0]);
    let ende = zug[1];
    for (let schritte = 0; schritte < strecken.length; schritte++) {
      const k = schl(ende);
      if (k === start) break;
      const kand = (nach.get(k) || []).find((j) => !benutzt[j]);
      if (kand == null) break;
      benutzt[kand] = 1;
      const st = strecken[kand];
      ende = schl(st[0]) === k ? st[1] : st[0];
      zug.push(ende);
    }
    if (zug.length >= 4) { zug.pop(); zuege.push(zug); }
  }
  return zuege;
}

const flaecheZug = (z) => { let f = 0; for (let i = 0, j = z.length - 1; i < z.length; j = i++) f += (z[j][0] - z[i][0]) * (z[j][1] + z[i][1]); return f / 2; };
function punktInZug(p, z) {
  let drin = false;
  for (let i = 0, j = z.length - 1; i < z.length; j = i++) {
    if ((z[i][1] > p[1]) !== (z[j][1] > p[1]) && p[0] < ((z[j][0] - z[i][0]) * (p[1] - z[i][1])) / (z[j][1] - z[i][1]) + z[i][0]) drin = !drin;
  }
  return drin;
}

// Verschachtelung bestimmen: gerade Tiefe = Außenkontur, ungerade = Loch
function zuegeOrdnen(zuege) {
  return zuege.map((z, i) => {
    let tiefe = 0;
    for (let j = 0; j < zuege.length; j++) if (j !== i && punktInZug(z[0], zuege[j])) tiefe++;
    // Außen gegen den Uhrzeigersinn, Löcher im Uhrzeigersinn (Material liegt dann immer links)
    const f = flaecheZug(z);
    const loch = tiefe % 2 === 1;
    const zug = (loch ? f > 0 : f < 0) ? z.slice().reverse() : z;
    return { zug, loch, tiefe };
  });
}

// ---- Löcher erkennen ------------------------------------------------------
// Kreisrunde Löcher entlang X, Y und Z finden (Ø, Tiefe, durchgehend oder Sackloch)
function kreisPruefen(z) {
  if (z.length < 8) return null;
  let cx = 0, cy = 0;
  z.forEach((p) => { cx += p[0]; cy += p[1]; });
  cx /= z.length; cy /= z.length;
  const r = z.map((p) => Math.hypot(p[0] - cx, p[1] - cy));
  const rm = r.reduce((s, x) => s + x, 0) / r.length;
  const abw = Math.max(...r.map((x) => Math.abs(x - rm)));
  if (rm < 0.5 || rm > 30 || abw / rm > 0.08) return null;
  // Radius aus der Fläche ist genauer als der Mittelwert der Ecken
  const rf = Math.sqrt(Math.abs(flaecheZug(z)) / Math.PI);
  return { cx, cy, r: (rf + rm) / 2 };
}

function strahlTrifft(v, achse, p, von, richtung, max, toleranz) {
  // Gibt es Material entlang der Achse direkt hinter dem Lochende? (Strahl durch den Lochmittelpunkt)
  const [a, b] = achse === 2 ? [0, 1] : achse === 0 ? [1, 2] : [2, 0];
  for (let i = 0; i < v.length; i += 9) {
    const ax = v[i + a], ay = v[i + b], bx = v[i + 3 + a], by = v[i + 3 + b], cx = v[i + 6 + a], cy = v[i + 6 + b];
    const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
    if (Math.abs(d) < 1e-12) continue;
    const l1 = ((by - cy) * (p[0] - cx) + (cx - bx) * (p[1] - cy)) / d;
    const l2 = ((cy - ay) * (p[0] - cx) + (ax - cx) * (p[1] - cy)) / d;
    const l3 = 1 - l1 - l2;
    if (l1 < 0 || l2 < 0 || l3 < 0) continue;
    const h = l1 * v[i + achse] + l2 * v[i + 3 + achse] + l3 * v[i + 6 + achse];
    const t = (h - von) * richtung;
    if (t > -toleranz && t < max) return true;
  }
  return false;
}

function loecherFinden(v, grenzen) {
  const gefunden = [];
  for (const achse of [2, 0, 1]) {
    const s = schnittVorbereiten(v, achse);
    const lo = grenzen.min[achse], hi = grenzen.max[achse];
    const hoehe = hi - lo;
    if (hoehe < 0.5) continue;
    const schritt = Math.max(0.15, Math.min(0.5, hoehe / 120));
    const spuren = [];
    for (let h = lo + schritt / 2; h < hi; h += schritt) {
      for (const k of zuegeOrdnen(schneiden(s, h))) {
        if (!k.loch) continue;
        const kreis = kreisPruefen(k.zug);
        if (!kreis) continue;
        const spur = spuren.find((x) => x.offen && Math.hypot(x.cx - kreis.cx, x.cy - kreis.cy) < 0.3 && Math.abs(x.r - kreis.r) < 0.15 && h - x.bis < schritt * 1.6);
        if (spur) { spur.bis = h; spur.rs.push(kreis.r); }
        else spuren.push({ cx: kreis.cx, cy: kreis.cy, r: kreis.r, rs: [kreis.r], von: h, bis: h, offen: true });
      }
    }
    for (const sp of spuren) {
      const von = sp.von - schritt / 2, bis = sp.bis + schritt / 2;
      const tiefe = bis - von;
      if (tiefe < 0.6) continue;
      const r = sp.rs.sort((x, y) => x - y)[Math.floor(sp.rs.length / 2)];
      const unten = strahlTrifft(v, achse, [sp.cx, sp.cy], von, -1, schritt * 2, schritt * 0.6);
      const oben = strahlTrifft(v, achse, [sp.cx, sp.cy], bis, 1, schritt * 2, schritt * 0.6);
      if (unten && oben) continue;   // geschlossener Hohlraum, kein Loch
      // Gleiches Loch über eine andere Achse schon gefunden? (nur bei Würfelformen möglich)
      const mitte = [0, 0, 0];
      const [a, b] = achse === 2 ? [0, 1] : achse === 0 ? [1, 2] : [2, 0];
      mitte[a] = sp.cx; mitte[b] = sp.cy; mitte[achse] = (von + bis) / 2;
      if (gefunden.some((g) => Math.hypot(g.mitte[0] - mitte[0], g.mitte[1] - mitte[1], g.mitte[2] - mitte[2]) < r)) continue;
      // Öffnung: die Seite ohne Material dahinter; bei Sacklöchern liegt dort der Eingang
      const durch = !unten && !oben;
      const offenOben = !oben;
      gefunden.push({
        achse, durchmesser: r * 2, tiefe, durch,
        mitte, von, bis, oeffnung: offenOben ? bis : von, richtung: offenOben ? 1 : -1,
      });
    }
  }
  return gefunden.sort((x, y) => y.durchmesser - x.durchmesser).map((l, i) => ({ ...l, nr: i + 1 }));
}

// Passende Teile aus dem Inventar für ein Loch
function teileFuerLoch(loch, inventar) {
  const d = loch.durchmesser, t = loch.tiefe;
  const vorschlaege = [];
  for (const teil of inventar) {
    if (teil.kat === "einsatz" && teil.aussen) {
      // Einschmelzgewinde: Loch etwa 0,1–1,1 mm kleiner als der Außendurchmesser, tief genug
      const unter = teil.aussen - d;
      if (unter >= 0.05 && unter <= 1.15 && (loch.durch || t + 0.2 >= teil.laenge)) {
        vorschlaege.push({ teil, art: "einsatz", text: `Einschmelzen: Loch ${zahl(unter, 1)} mm kleiner als der Einsatz`, guete: Math.abs(unter - 0.6) + (loch.durch ? 0.5 : 0) });  // durchgehend: lieber Schraube
      }
    } else if (teil.kat === "schraube") {
      const g = gewindeD(teil.gewinde);
      const n = NORM[teil.gewinde] || {};
      if (loch.durch && d >= g + 0.05 && d <= g + 0.9) {   // Durchgangsloch nur bei durchgehenden Löchern sinnvoll
        // Durchgehend: Schraube sollte durch das Teil reichen (plus Mutter); Sackloch: nicht länger als das Loch
        const passt = loch.durch ? teil.laenge >= t : teil.laenge <= t + 0.5;
        const ziel = loch.durch ? t + (n.mutter_h || g * 0.8) : t;
        vorschlaege.push({ teil, art: "durchgang", text: `Durchgangsloch für ${teil.gewinde} (Norm ${zahl(n.loch || g + 0.4, 1)} mm)${passt ? "" : loch.durch ? ", Schraube kürzer als das Loch" : ", Schraube länger als das Loch"}`, guete: Math.abs(d - (n.loch || g + 0.4)) + (passt ? 0 : 1) + Math.abs(teil.laenge - ziel) / 200 });
      } else if (d >= g * 0.72 && d <= g * 0.95 && !loch.durch && teil.laenge <= t + 0.5) {
        vorschlaege.push({ teil, art: "selbstschneidend", text: `Kernloch zum direkten Eindrehen (${teil.gewinde})`, guete: 1 + Math.abs(d - g * 0.85) + teil.laenge / 1000 });
      }
    } else if (teil.kat === "magnet" && teil.form === "rund" && teil.durchmesser) {
      const spiel = d - teil.durchmesser;
      if (spiel >= -0.05 && spiel <= 0.45 && !loch.durch && t + 0.15 >= teil.dicke) {
        vorschlaege.push({ teil, art: "magnet", text: `Magnet mit ${zahl(spiel, 2)} mm Spiel`, guete: Math.abs(spiel - 0.15) });
      }
    }
  }
  // Je Art nur die besten Treffer, Schrauben nicht alle Längen einzeln aufzählen
  vorschlaege.sort((x, y) => x.guete - y.guete);
  const schrauben = vorschlaege.filter((x) => x.teil.kat === "schraube").slice(0, 3);
  return [...vorschlaege.filter((x) => x.teil.kat !== "schraube").slice(0, 3), ...schrauben].sort((x, y) => x.guete - y.guete);
}

// ---- Schichten (vereinfachtes Slicen) -------------------------------------
// Je Schicht: Außenwand, innere Wände (Versatz) und Füllung (Linien), zur Ansicht
function zugVersetzen(zug, abstand) {
  const n = zug.length, neu = [];
  for (let i = 0; i < n; i++) {
    const p0 = zug[(i - 1 + n) % n], p1 = zug[i], p2 = zug[(i + 1) % n];
    let ax = p1[0] - p0[0], ay = p1[1] - p0[1], bx = p2[0] - p1[0], by = p2[1] - p1[1];
    const la = Math.hypot(ax, ay) || 1, lb = Math.hypot(bx, by) || 1;
    ax /= la; ay /= la; bx /= lb; by /= lb;
    // Material liegt links: Normale nach links
    let nx = -ay - by, ny = ax + bx;
    const ln = Math.hypot(nx, ny) || 1;
    nx /= ln; ny /= ln;
    const cos = nx * -ay + ny * ax;
    const f = abstand / Math.max(0.35, cos);
    neu.push([p1[0] + nx * f, p1[1] + ny * f]);
  }
  // Außenkontur muss schrumpfen, Loch muss wachsen; kippt die Richtung, ist kein Platz mehr
  const f0 = flaecheZug(zug), f1 = flaecheZug(neu);
  if (f0 > 0 ? !(f1 > 0.2 && f1 < f0) : !(f1 < 0 && -f1 > -f0)) return null;
  return neu;
}

function fuellLinien(konturen, abstand, winkel) {
  const c = Math.cos(winkel), s = Math.sin(winkel);
  const dreh = (p) => [p[0] * c + p[1] * s, -p[0] * s + p[1] * c];
  const zurueck = (p) => [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
  const kanten = [];
  let ymin = Infinity, ymax = -Infinity;
  for (const z of konturen) {
    const r = z.map(dreh);
    for (let i = 0; i < r.length; i++) {
      const p = r[i], q = r[(i + 1) % r.length];
      kanten.push([p, q]);
      ymin = Math.min(ymin, p[1]); ymax = Math.max(ymax, p[1]);
    }
  }
  const linien = [];
  for (let y = Math.ceil(ymin / abstand) * abstand; y < ymax; y += abstand) {
    const xs = [];
    for (const [p, q] of kanten) if ((p[1] > y) !== (q[1] > y)) xs.push(p[0] + ((y - p[1]) * (q[0] - p[0])) / (q[1] - p[1]));
    xs.sort((x, w) => x - w);
    for (let i = 0; i + 1 < xs.length; i += 2) if (xs[i + 1] - xs[i] > 0.2) linien.push([zurueck([xs[i], y]), zurueck([xs[i + 1], y])]);
  }
  return linien;
}

function schichtBerechnen(s, z, opt) {
  const breite = opt.duese * 1.05;
  const konturen = zuegeOrdnen(schneiden(s, z));
  const aussen = [], innen = [], fuellung = [];
  const innerste = [];
  for (const k of konturen) {
    aussen.push(k.zug);
    let letzte = k.zug;
    for (let w = 1; w < opt.waende; w++) {
      const n = zugVersetzen(k.zug, breite * w);
      if (!n) break;
      innen.push(n);
      letzte = n;
    }
    const f = zugVersetzen(k.zug, breite * opt.waende);
    innerste.push(f || letzte);
  }
  if (opt.fuellung > 0 && innerste.length) {
    if (opt.massiv) {   // Boden/Deckel: dicht gefüllt, geradlinig
      const winkel = ((opt.nr % 2 ? 45 : -45) * Math.PI) / 180;
      fuellung.push(...fuellLinien(innerste, breite, winkel));
    } else {
      // Abstand so, dass eine einzelne Linienschar die gewünschte Dichte hätte; jedes Muster rechnet das auf seine Form um
      const s = Math.max(breite, breite / (opt.fuellung / 100));
      fuellung.push(...fuellMuster(opt.muster || "grid", innerste, { s, z, nr: opt.nr || 0, hoehe: opt.hoehe || z }));
    }
  }
  return { z, aussen, innen, fuellung };
}

// ---- Füllmuster wie in Bambu Studio (Prozess › Stärke › „Sparse infill pattern“) ----
// Vereinfachte Nachbildung je Schicht; Muster der Gruppe „3d“ ändern sich mit der Höhe.
const FUELLMUSTER = [
  { id: "grid", name: "Gitter", bambu: "Grid", gruppe: "2d", text: "Zwei Linienrichtungen in jeder Schicht. Stabil, in vielen Bambu-Profilen voreingestellt." },
  { id: "zig-zag", name: "Geradlinig", bambu: "Rectilinear", gruppe: "2d", text: "Eine Richtung je Schicht, abwechselnd um 90° gedreht und am Rand verbunden. Schnell und sparsam." },
  { id: "line", name: "Linie", bambu: "Line", gruppe: "2d", text: "Wie Geradlinig, aber ohne Verbindungen am Rand. Sehr schnell, eher schwach." },
  { id: "alignedrectilinear", name: "Ausgerichtet geradlinig", bambu: "Aligned Rectilinear", gruppe: "2d", text: "Geradlinig, aber alle Schichten liegen in derselben Richtung übereinander." },
  { id: "triangles", name: "Dreiecke", bambu: "Triangles", gruppe: "2d", text: "Drei Richtungen in jeder Schicht ergeben Dreiecke. Steif in der Ebene." },
  { id: "tri-hexagon", name: "Tri-Hexagon", bambu: "Tri-hexagon", gruppe: "2d", text: "Sterne aus Dreiecken und Sechsecken. Steif und gleichmäßig." },
  { id: "honeycomb", name: "Wabe", bambu: "Honeycomb", gruppe: "2d", text: "Sechseckige Waben. Sehr stabil, druckt aber langsamer." },
  { id: "2dlattice", name: "2D-Gitter", bambu: "2D Lattice", gruppe: "2d", text: "Rautengitter aus zwei schrägen Richtungen." },
  { id: "zigzag", name: "Zickzack", bambu: "Zig Zag", gruppe: "2d", text: "Zickzack-Linien, alle in derselben Richtung." },
  { id: "crosszag", name: "Kreuz-Zickzack", bambu: "Cross Zag", gruppe: "2d", text: "Zickzack-Linien, die je Schicht die Richtung wechseln." },
  { id: "cubic", name: "Kubisch", bambu: "Cubic", gruppe: "3d", text: "Drei Richtungen, die mit der Höhe wandern: Würfel auf der Spitze. Stabil in alle Richtungen." },
  { id: "adaptivecubic", name: "Adaptiv kubisch", bambu: "Adaptive Cubic", gruppe: "3d", text: "Kubisch, innen grob und zum Rand hin dichter. Spart Material bei großen Teilen." },
  { id: "supportcubic", name: "Stützend kubisch", bambu: "Support Cubic", gruppe: "3d", text: "Kubisch, aber nur unter den Deckflächen dicht. Spart Material und Zeit." },
  { id: "gyroid", name: "Gyroid", bambu: "Gyroid", gruppe: "3d", text: "Wellige Fläche, die sich mit jeder Schicht verschiebt. In alle Richtungen gleich stark." },
  { id: "3dhoneycomb", name: "3D-Wabe", bambu: "3D Honeycomb", gruppe: "3d", text: "Räumliche Waben aus Oktaederstümpfen: das Muster wechselt mit der Höhe." },
  { id: "crosshatch", name: "Kreuzschraffur", bambu: "Cross Hatch", gruppe: "3d", text: "Schichtblöcke wechseln die Richtung mit weichem Übergang. Stabil und schnell." },
  { id: "lockedzag", name: "Verriegelter Zickzack", bambu: "Locked Zag", gruppe: "3d", text: "Zickzack, das sich von Schicht zu Schicht verzahnt." },
  { id: "lightning", name: "Blitz", bambu: "Lightning", gruppe: "3d", text: "Baumartige Äste nur unter den Deckflächen. Am schnellsten, aber nicht belastbar." },
  { id: "concentric", name: "Konzentrisch", bambu: "Concentric", gruppe: "kurve", text: "Ringe parallel zur Außenwand. Flexibel, gut für TPU und durchscheinende Teile." },
  { id: "hilbertcurve", name: "Hilbert-Kurve", bambu: "Hilbert Curve", gruppe: "kurve", text: "Eine einzige raumfüllende Kurve. Dekorativ, z. B. für sichtbare Flächen." },
  { id: "archimedeanchords", name: "Archimedische Akkorde", bambu: "Archimedean Chords", gruppe: "kurve", text: "Spirale aus kurzen Sehnen von der Mitte nach außen." },
  { id: "octagramspiral", name: "Oktagramm-Spirale", bambu: "Octagram Spiral", gruppe: "kurve", text: "Sternförmige Spirale mit acht Spitzen. Dekorativ." },
];
const FUELLMUSTER_GRUPPEN = { "2d": "Jede Schicht gleich", "3d": "Ändert sich mit der Höhe", kurve: "Kurven und Spiralen" };

// Kanten der Füllfläche in waagerechte Bänder sortieren: schnelles Innen-Prüfen und Zuschneiden
function bereichIndex(konturen) {
  const k = [];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const z of konturen) for (let i = 0; i < z.length; i++) {
    const p = z[i], q = z[(i + 1) % z.length];
    k.push(p[0], p[1], q[0], q[1]);
    x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]);
  }
  const kanten = new Float64Array(k), n = kanten.length / 4;
  const nb = Math.max(1, Math.min(512, Math.ceil(n / 3)));
  const h = (y1 - y0) / nb || 1;
  const baender = Array.from({ length: nb }, () => []);
  for (let e = 0; e < n; e++) {
    const a = kanten[e * 4 + 1], b = kanten[e * 4 + 3];
    const von = Math.max(0, Math.floor((Math.min(a, b) - y0) / h)), bis = Math.min(nb - 1, Math.floor((Math.max(a, b) - y0) / h));
    for (let j = von; j <= bis; j++) baender[j].push(e);
  }
  return { kanten, baender, y0, h, nb, box: [x0, y0, x1, y1], stempel: new Int32Array(n), runde: 0 };
}
function bereichInnen(ix, x, y) {
  const j = Math.floor((y - ix.y0) / ix.h);
  if (j < 0 || j >= ix.nb) return false;
  let drin = false;
  const k = ix.kanten;
  for (const e of ix.baender[j]) {
    const ax = k[e * 4], ay = k[e * 4 + 1], bx = k[e * 4 + 2], by = k[e * 4 + 3];
    if ((ay > y) !== (by > y) && x < ax + ((y - ay) * (bx - ax)) / (by - ay)) drin = !drin;
  }
  return drin;
}
// Strecke a→b auf die Fläche zuschneiden (gerade/ungerade-Regel); ohne = Fläche, die ausgespart wird
function streckeZuschneiden(ix, a, b, aus, ohne) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  if (Math.abs(dx) + Math.abs(dy) < 1e-9) return;
  const ts = [0, 1], k = ix.kanten, r = ++ix.runde;
  const von = Math.max(0, Math.floor((Math.min(a[1], b[1]) - ix.y0) / ix.h)), bis = Math.min(ix.nb - 1, Math.floor((Math.max(a[1], b[1]) - ix.y0) / ix.h));
  for (let j = von; j <= bis; j++) for (const e of ix.baender[j]) {
    if (ix.stempel[e] === r) continue;
    ix.stempel[e] = r;
    const ex = k[e * 4 + 2] - k[e * 4], ey = k[e * 4 + 3] - k[e * 4 + 1];
    const d = dx * ey - dy * ex;
    if (Math.abs(d) < 1e-12) continue;
    const wx = k[e * 4] - a[0], wy = k[e * 4 + 1] - a[1];
    const t = (wx * ey - wy * ex) / d, u = (wx * dy - wy * dx) / d;
    if (t > 0 && t < 1 && u >= 0 && u <= 1) ts.push(t);
  }
  ts.sort((x, y) => x - y);
  for (let i = 0; i + 1 < ts.length; i++) {
    const t0 = ts[i], t1 = ts[i + 1];
    if (t1 - t0 < 1e-6) continue;
    const tm = (t0 + t1) / 2, mx = a[0] + dx * tm, my = a[1] + dy * tm;
    if (!bereichInnen(ix, mx, my) || (ohne && bereichInnen(ohne, mx, my))) continue;
    aus.push([[a[0] + dx * t0, a[1] + dy * t0], [a[0] + dx * t1, a[1] + dy * t1]]);
  }
}
// Unendliche Linienschar (Winkel in Grad, Abstand, Versatz) über die Fläche
function linienSchar(box, grad, abstand, versatz = 0) {
  const w = (grad * Math.PI) / 180, d = [Math.cos(w), Math.sin(w)], n = [-d[1], d[0]];
  const c = [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2], R = Math.hypot(box[2] - box[0], box[3] - box[1]) / 2 + 1;
  const cn = c[0] * n[0] + c[1] * n[1], cd = c[0] * d[0] + c[1] * d[1];
  const v = ((versatz % abstand) + abstand) % abstand;
  const out = [];
  for (let o = Math.ceil((cn - R - v) / abstand) * abstand + v; o <= cn + R; o += abstand) {
    out.push([[n[0] * o + d[0] * (cd - R), n[1] * o + d[1] * (cd - R)], [n[0] * o + d[0] * (cd + R), n[1] * o + d[1] * (cd + R)]]);
  }
  return out;
}
// Zickzack-Linien: Schar in Richtung grad, Zacken mit Periode und Amplitude; versetzt = Nachbarn gespiegelt
function zickzackSchar(box, grad, abstand, periode, amplitude, phase = 0, gespiegelt = false) {
  const w = (grad * Math.PI) / 180, d = [Math.cos(w), Math.sin(w)], n = [-d[1], d[0]];
  const c = [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2], R = Math.hypot(box[2] - box[0], box[3] - box[1]) / 2 + periode;
  const cn = c[0] * n[0] + c[1] * n[1], cd = c[0] * d[0] + c[1] * d[1];
  const out = [], halb = periode / 2;
  for (let o = Math.ceil((cn - R) / abstand) * abstand; o <= cn + R; o += abstand) {
    const vz = gespiegelt && Math.round(o / abstand) % 2 ? -1 : 1;
    let vor = null;
    for (let t = Math.floor((cd - R) / halb) * halb + (phase % halb); t <= cd + R; t += halb) {
      const zacke = (Math.round((t - phase) / halb) % 2 ? 1 : -1) * amplitude * vz;
      const p = [n[0] * (o + zacke) + d[0] * t, n[1] * (o + zacke) + d[1] * t];
      if (vor) out.push([vor, p]);
      vor = p;
    }
  }
  return out;
}

function fuellMuster(id, konturen, { s, z, nr, hoehe }) {
  const ix = bereichIndex(konturen), box = ix.box, aus = [];
  const schneiden = (strecken, ohne) => { for (const [a, b] of strecken) streckeZuschneiden(ix, a, b, aus, ohne); };
  const kubisch = (S, auch) => { [0, 60, 120].forEach((g, k) => schneiden(linienSchar(box, g, S, z * [1, -1, 1][k] * 1.15), auch)); };
  switch (id) {
    case "zig-zag": case "line": case "alignedrectilinear": {
      const g = id === "alignedrectilinear" ? 45 : nr % 2 ? 45 : -45;
      schneiden(linienSchar(box, g, s));
      if (id !== "line") verbinden(aus, ix, s);
      break;
    }
    case "grid": schneiden(linienSchar(box, 45, 2 * s)); schneiden(linienSchar(box, -45, 2 * s)); break;
    case "2dlattice": schneiden(linienSchar(box, 60, 2 * s)); schneiden(linienSchar(box, 120, 2 * s)); break;
    case "triangles": [0, 60, 120].forEach((g) => schneiden(linienSchar(box, g, 3 * s))); break;
    case "tri-hexagon": [0, 60, 120].forEach((g, k) => schneiden(linienSchar(box, g, 3 * s, k === 0 ? 1.5 * s : 0))); break;
    case "cubic": kubisch(3 * s); break;
    case "supportcubic": kubisch(z > hoehe * 0.72 ? 3 * s : 6 * s); break;
    case "adaptivecubic": {
      // grob überall, fein nur in einem Streifen entlang der Wände
      kubisch(6 * s);
      const kern = konturen.map((k) => zugVersetzen(k, 4 * s)).filter(Boolean);
      const ohne = kern.length ? bereichIndex(kern) : null;
      if (ohne) [0, 60, 120].forEach((g, k) => schneiden(linienSchar(box, g, 3 * s, z * [1, -1, 1][k] * 1.15), ohne));
      else kubisch(3 * s);
      break;
    }
    case "honeycomb": {
      const a = 1.155 * s, hx = 1.5 * a, hy = Math.sqrt(3) * a, st = [];
      for (let i = Math.floor(box[0] / hx) - 1; i * hx <= box[2] + hx; i++) {
        for (let j = Math.floor(box[1] / hy) - 1; j * hy <= box[3] + hy; j++) {
          const cx = i * hx, cy = j * hy + (i & 1 ? hy / 2 : 0);
          const ecke = (k) => [cx + a * Math.cos((k * Math.PI) / 3), cy + a * Math.sin((k * Math.PI) / 3)];
          st.push([ecke(0), ecke(1)], [ecke(1), ecke(2)], [ecke(5), ecke(0)]);
        }
      }
      schneiden(st);
      break;
    }
    case "zigzag": schneiden(zickzackSchar(box, 45, s, 2 * s, 0.35 * s)); break;
    case "crosszag": schneiden(zickzackSchar(box, nr % 2 ? 45 : -45, s, 2 * s, 0.35 * s)); break;
    case "lockedzag": schneiden(zickzackSchar(box, nr % 2 ? 45 : -45, s, 2 * s, 0.35 * s, Math.floor(nr / 2) % 2 ? s : 0)); break;
    case "3dhoneycomb": {
      // Schnitt durch Oktaederstümpfe: Zickzack, dessen Ausschlag mit der Höhe zu- und abnimmt, Richtung wechselt je Lage
      const P = 2 * s, lage = Math.floor(z / (P / 2)), t = (z % (P / 2)) / (P / 2);
      const amp = (P / 4) * (lage % 2 ? t : 1 - t);
      schneiden(zickzackSchar(box, lage % 4 < 2 ? 0 : 90, P / 2, P, amp, 0, true));
      break;
    }
    case "crosshatch": {
      const H = Math.max(1.6, 2 * s), block = Math.floor(z / H), t = (z % H) / H;
      const amp = t < 0.35 ? (s / 2) * (1 - t / 0.35) : 0;   // Übergang: Zacken werden flach
      const g = block % 2 ? 90 : 0;
      if (amp > 0.05) schneiden(zickzackSchar(box, g, s, s, amp, 0, true));
      else schneiden(linienSchar(box, g, s));
      break;
    }
    case "gyroid": {
      // Gyroid-Fläche sin x·cos y + sin y·cos z + sin z·cos x = 0 bei Höhe z, Linien mit Marching Squares
      const P = 2.4 * s, k = (2 * Math.PI) / P;
      let zelle = P / 10;
      const bw = box[2] - box[0] + 2, bh = box[3] - box[1] + 2;
      while ((bw / zelle) * (bh / zelle) > 60000) zelle *= 1.25;
      const nx = Math.ceil(bw / zelle) + 1, ny = Math.ceil(bh / zelle) + 1, x0 = box[0] - 1, y0 = box[1] - 1;
      const sz = Math.sin(k * z), cz = Math.cos(k * z);
      const f = new Float32Array(nx * ny);
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const x = k * (x0 + i * zelle), y = k * (y0 + j * zelle);
        f[j * nx + i] = Math.sin(x) * Math.cos(y) + Math.sin(y) * cz + sz * Math.cos(x);
      }
      const st = [];
      const rand = (i1, j1, i2, j2) => {
        const a = f[j1 * nx + i1], b = f[j2 * nx + i2], t = a / (a - b);
        return [x0 + (i1 + (i2 - i1) * t) * zelle, y0 + (j1 + (j2 - j1) * t) * zelle];
      };
      for (let j = 0; j + 1 < ny; j++) for (let i = 0; i + 1 < nx; i++) {
        const p = [];
        const v = [f[j * nx + i], f[j * nx + i + 1], f[(j + 1) * nx + i + 1], f[(j + 1) * nx + i]];
        if ((v[0] > 0) !== (v[1] > 0)) p.push(rand(i, j, i + 1, j));
        if ((v[1] > 0) !== (v[2] > 0)) p.push(rand(i + 1, j, i + 1, j + 1));
        if ((v[2] > 0) !== (v[3] > 0)) p.push(rand(i + 1, j + 1, i, j + 1));
        if ((v[3] > 0) !== (v[0] > 0)) p.push(rand(i, j + 1, i, j));
        if (p.length >= 2) st.push([p[0], p[1]]);
        if (p.length === 4) st.push([p[2], p[3]]);
      }
      schneiden(st);
      break;
    }
    case "concentric": {
      let ringe = konturen.slice();
      // Ringe wandern nach innen (Löcher nach außen); ein Ring, der ganz außerhalb liegt, endet
      for (let n = 0; n < 200 && ringe.length; n++) {
        ringe = ringe.filter((r) => {
          if (n >= 3 && flaecheZug(r) < 0) return false;   // um Löcher nur ein paar Ringe, den Rest machen die äußeren

          const vorher = aus.length;
          for (let i = 0; i < r.length; i++) streckeZuschneiden(ix, r[i], r[(i + 1) % r.length], aus);
          return aus.length > vorher;
        }).map((r) => zugVersetzen(r, s)).filter(Boolean);
      }
      break;
    }
    case "hilbertcurve": {
      const groesse = Math.max(box[2] - box[0], box[3] - box[1]) + 2;
      let ordnung = Math.ceil(Math.log2(groesse / s));
      ordnung = Math.max(1, Math.min(7, ordnung));
      const n = 1 << ordnung, schritt = Math.max(s, groesse / n);
      const ox = Math.floor((box[0] - 1) / schritt) * schritt, oy = Math.floor((box[1] - 1) / schritt) * schritt;
      const punkt = (d) => {
        let x = 0, y = 0, t = d;
        for (let q = 1; q < n; q *= 2) {
          const rx = 1 & (t / 2), ry = 1 & (t ^ rx);
          if (ry === 0) { if (rx === 1) { x = q - 1 - x; y = q - 1 - y; } [x, y] = [y, x]; }
          x += q * rx; y += q * ry; t = Math.floor(t / 4);
        }
        return [ox + (x + 0.5) * schritt, oy + (y + 0.5) * schritt];
      };
      const st = [];
      let vor = punkt(0);
      for (let d = 1; d < n * n; d++) { const p = punkt(d); st.push([vor, p]); vor = p; }
      schneiden(st);
      break;
    }
    case "archimedeanchords": case "octagramspiral": {
      const c = [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2], R = Math.hypot(box[2] - box[0], box[3] - box[1]) / 2 + s;
      const st = [];
      let vor = c.slice(), th = 0;
      while (true) {
        const r = (s * th) / (2 * Math.PI);
        if (r > R) break;
        let p;
        if (id === "archimedeanchords") { th += Math.min(1, Math.max(0.08, (1.6 * s) / Math.max(r, 0.1))); p = [c[0] + r * Math.cos(th), c[1] + r * Math.sin(th)]; }
        else { th += Math.PI / 8; const zacke = Math.round(th / (Math.PI / 8)) % 2 ? 1 : 0.72; p = [c[0] + r * zacke * Math.cos(th), c[1] + r * zacke * Math.sin(th)]; }
        st.push([vor, p]); vor = p;
      }
      schneiden(st);
      break;
    }
    case "lightning": {
      // Bäume, die nach oben hin (zu den Deckflächen) weiter verzweigen
      const L = 5 * s, anteil = 0.25 + 0.75 * Math.min(1, Math.max(0, z / Math.max(hoehe, 0.01))), st = [];
      const hx = L, hy = L * 0.866;
      for (let j = Math.floor(box[1] / hy) - 1; j * hy <= box[3] + hy; j++) {
        for (let i = Math.floor(box[0] / hx) - 1; i * hx <= box[2] + hx; i++) {
          const cx = i * hx + (j & 1 ? hx / 2 : 0), cy = j * hy;
          const zufall = Math.abs(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1;
          const dreh = zufall * Math.PI * 2;
          for (let a = 0; a < 3; a++) {
            const w = dreh + (a * 2 * Math.PI) / 3, len = (L / 2) * anteil;
            const m = [cx + Math.cos(w) * len, cy + Math.sin(w) * len];
            st.push([[cx, cy], m]);
            if (anteil > 0.55) for (const sg of [-0.6, 0.6]) st.push([m, [m[0] + Math.cos(w + sg) * len * 0.45, m[1] + Math.sin(w + sg) * len * 0.45]]);
          }
        }
      }
      schneiden(st);
      break;
    }
    default: schneiden(linienSchar(box, 45, 2 * s)); schneiden(linienSchar(box, -45, 2 * s));
  }
  return aus;
}
// Geradlinig: Nachbarlinien am Rand zu einem Zickzack verbinden, wenn die Verbindung innen liegt
function verbinden(linien, ix, s) {
  const n = linien.length;
  for (let i = 1; i < n; i += 2) { const l = linien[i]; linien[i] = [l[1], l[0]]; }
  for (let i = 0; i + 1 < n; i++) {
    const a = linien[i][1], b = linien[i + 1][0];
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 2.2 * s && bereichInnen(ix, (a[0] + b[0]) / 2 + (b[1] - a[1]) * 0.001, (a[1] + b[1]) / 2)) linien.push([a, b]);
  }
}

// Kleine Vorschau eines Musters als SVG (für die Auswahl)
function musterVorschauSvg(id, z = 6) {
  const q = zuegeOrdnen([[[1, 1], [39, 1], [39, 39], [1, 39]]]).map((k) => k.zug);
  const st = fuellMuster(id, q, { s: 3.2, z, nr: Math.round(z / 0.2), hoehe: 12 });
  const d = st.map(([a, b]) => `M${a[0].toFixed(2)} ${a[1].toFixed(2)}L${b[0].toFixed(2)} ${b[1].toFixed(2)}`).join("");
  return `<svg viewBox="0 0 40 40" class="mod-muster-bild" aria-hidden="true"><rect x="1" y="1" width="38" height="38" rx="3"/><path d="${d}"/></svg>`;
}

// ---- Strahl gegen Dreiecke (Möller–Trumbore): nächster Treffer {t, n} oder null ----
function strahlTreffer(v, o, d) {
  let best = Infinity, n = null;
  for (let i = 0; i < v.length; i += 9) {
    const e1x = v[i + 3] - v[i], e1y = v[i + 4] - v[i + 1], e1z = v[i + 5] - v[i + 2];
    const e2x = v[i + 6] - v[i], e2y = v[i + 7] - v[i + 1], e2z = v[i + 8] - v[i + 2];
    const px = d[1] * e2z - d[2] * e2y, py = d[2] * e2x - d[0] * e2z, pz = d[0] * e2y - d[1] * e2x;
    const det = e1x * px + e1y * py + e1z * pz;
    if (Math.abs(det) < 1e-12) continue;
    const inv = 1 / det, tx = o[0] - v[i], ty = o[1] - v[i + 1], tz = o[2] - v[i + 2];
    const u = (tx * px + ty * py + tz * pz) * inv;
    if (u < 0 || u > 1) continue;
    const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
    const w = (d[0] * qx + d[1] * qy + d[2] * qz) * inv;
    if (w < 0 || u + w > 1) continue;
    const t = (e2x * qx + e2y * qy + e2z * qz) * inv;
    if (t > 0 && t < best) { best = t; n = [e1y * e2z - e1z * e2y, e1z * e2x - e1x * e2z, e1x * e2y - e1y * e2x]; }
  }
  return n ? { t: best, n } : null;
}

// ---- Frei drehen: Winkel in Grad um X, dann Y, dann Z (um die Modellmitte), danach wieder aufs Bett ----
// Drehmatrix (3×3 zeilenweise) R = Rz · Ry · Rx aus Winkeln in Grad
function drehMatrix(grad) {
  const [ax, ay, az] = grad.map((x) => ((Number(x) || 0) * Math.PI) / 180);
  const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay), cz = Math.cos(az), sz = Math.sin(az);
  return [cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx,
    sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx,
    -sy, cy * sx, cy * cx];
}
function drehenGrad(v, grad) {
  const g = meshGrenzen(v), c = [0, 1, 2].map((i) => (g.min[i] + g.max[i]) / 2);
  const R = drehMatrix(grad);
  for (let i = 0; i < v.length; i += 3) {
    const x = v[i] - c[0], y = v[i + 1] - c[1], z = v[i + 2] - c[2];
    v[i] = R[0] * x + R[1] * y + R[2] * z + c[0];
    v[i + 1] = R[3] * x + R[4] * y + R[5] * z + c[1];
    v[i + 2] = R[6] * x + R[7] * y + R[8] * z + c[2];
  }
  return aufsBett(v);
}

// ---- G-Code ------------------------------------------------------------------
const GCODE_ARTEN = {
  "outer wall": "aussen", "inner wall": "innen", "sparse infill": "fuellung", "internal solid infill": "fuellung",
  "top surface": "oben", "bottom surface": "unten", "bridge": "bruecke", "support": "stuetze", "support interface": "stuetze",
  "overhang wall": "aussen", "gap infill": "innen", "skirt": "rand", "brim": "rand", "prime tower": "turm",
  perimeter: "aussen", "external perimeter": "aussen", "solid infill": "fuellung", infill: "fuellung",
};

function gcodeLesen(text) {
  const schichten = [];
  let x = 0, y = 0, z = 0, e = 0, relE = false, relXYZ = false, art = "innen";
  let schicht = null;
  const info = {};
  const neueSchicht = (hz) => { schicht = { z: hz, linien: [] }; schichten.push(schicht); };
  const zeilen = text.split("\n");
  for (let zi = 0; zi < zeilen.length; zi++) {
    const zeile = zeilen[zi];
    if (zeile.charCodeAt(0) === 59) {   // ;
      const k = zeile.slice(1).trim();
      const kl = k.toLowerCase();
      if (kl.startsWith("feature:") || kl.startsWith("type:")) art = GCODE_ARTEN[kl.split(":")[1].trim()] || "innen";
      else if (kl.startsWith("layer_change") || kl.startsWith("change_layer")) schicht = null;
      else if (kl.startsWith("total filament weight")) info.gramm = parseFloat(k.split(":")[1]);
      else if (kl.startsWith("total filament length")) info.mm = parseFloat(k.split(":")[1]);
      else if (kl.startsWith("filament used [g]")) info.gramm = info.gramm || parseFloat(k.split("=")[1]);
      else if (kl.includes("total estimated time")) info.zeit = k.slice(kl.indexOf("total estimated time")).split(/[:=]/)[1].split(";")[0].trim();
      else if (kl.startsWith("model printing time") || kl.startsWith("estimated printing time")) info.zeit = info.zeit || k.split(/[:=]/).slice(1).join(":").split(";")[0].trim();
      else if (kl.startsWith("filament_type") || kl.startsWith("filament type")) info.material = info.material || k.split(/[:=]/)[1].trim();
      else if (kl.startsWith("nozzle_diameter")) info.duese = info.duese || parseFloat(k.split(/[:=]/)[1]);
      else if (kl.startsWith("layer_height") && !info.schicht) info.schicht = parseFloat(k.split(/[:=]/)[1]);
      continue;
    }
    const c = zeile.charCodeAt(0);
    if (c !== 71 && c !== 77) continue;   // G / M
    const befehl = zeile.split(";")[0].trim().split(/\s+/);
    const cmd = befehl[0];
    if (cmd === "M82") { relE = false; continue; }
    if (cmd === "M83") { relE = true; continue; }
    if (cmd === "G90") { relXYZ = false; relE = false; continue; }
    if (cmd === "G91") { relXYZ = true; continue; }
    if (cmd === "G92") { for (const p of befehl) if (p[0] === "E") e = parseFloat(p.slice(1)); continue; }
    if (cmd !== "G0" && cmd !== "G1" && cmd !== "G2" && cmd !== "G3") continue;
    let nx = x, ny = y, nz = z, ne = null;
    for (let i = 1; i < befehl.length; i++) {
      const p = befehl[i], w = parseFloat(p.slice(1));
      if (p[0] === "X") nx = relXYZ ? x + w : w;
      else if (p[0] === "Y") ny = relXYZ ? y + w : w;
      else if (p[0] === "Z") nz = relXYZ ? z + w : w;
      else if (p[0] === "E") ne = w;
    }
    const extrudiert = ne != null && (relE ? ne > 0 : ne > e);
    if (ne != null) e = relE ? e + ne : ne;
    if (extrudiert && (nx !== x || ny !== y)) {
      if (!schicht || Math.abs(schicht.z - nz) > 1e-4) {
        const vorhanden = schichten.length && Math.abs(schichten[schichten.length - 1].z - nz) < 1e-4 ? schichten[schichten.length - 1] : null;
        if (vorhanden) schicht = vorhanden; else neueSchicht(nz);
      }
      schicht.linien.push(x, y, nx, ny, GCODE_ARTEN_NR[art] ?? 1);
    }
    x = nx; y = ny; z = nz;
  }
  return { schichten: schichten.filter((s) => s.linien.length), info };
}
const GCODE_ARTEN_LISTE = ["aussen", "innen", "fuellung", "oben", "unten", "bruecke", "stuetze", "rand", "turm"];
const GCODE_ARTEN_NR = Object.fromEntries(GCODE_ARTEN_LISTE.map((a, i) => [a, i]));
const LINIEN_FARBEN = {
  aussen: [1, 0.55, 0.25], innen: [1, 0.85, 0.35], fuellung: [0.85, 0.3, 0.35], oben: [0.95, 0.35, 0.45], unten: [0.6, 0.5, 1],
  bruecke: [0.45, 0.75, 1], stuetze: [0.3, 0.9, 0.55], rand: [0.6, 0.6, 0.6], turm: [0.5, 0.5, 0.7],
};
const LINIEN_NAMEN = { aussen: "Außenwand", innen: "Innere Wände", fuellung: "Füllung", oben: "Oberfläche", unten: "Boden", bruecke: "Brücke", stuetze: "Stützen", rand: "Rand", turm: "Reinigungsturm" };

// ---- ZIP (für .gcode.3mf aus Bambu Studio) ------------------------------------
async function zipDateien(puffer) {
  const dv = new DataView(puffer);
  let ende = -1;
  for (let i = puffer.byteLength - 22; i >= Math.max(0, puffer.byteLength - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { ende = i; break; }
  if (ende < 0) throw new Error("Die Datei ist kein gültiges 3MF/ZIP.");
  const anzahl = dv.getUint16(ende + 10, true);
  let o = dv.getUint32(ende + 16, true);
  const dateien = [];
  for (let n = 0; n < anzahl; n++) {
    if (dv.getUint32(o, true) !== 0x02014b50) break;
    const methode = dv.getUint16(o + 10, true), groesse = dv.getUint32(o + 20, true);
    const nameLen = dv.getUint16(o + 28, true), extraLen = dv.getUint16(o + 30, true), komLen = dv.getUint16(o + 32, true);
    const lokal = dv.getUint32(o + 42, true);
    const name = new TextDecoder().decode(new Uint8Array(puffer, o + 46, nameLen));
    dateien.push({ name, methode, groesse, lokal });
    o += 46 + nameLen + extraLen + komLen;
  }
  const lesen = async (d) => {
    const nl = dv.getUint16(d.lokal + 26, true), el = dv.getUint16(d.lokal + 28, true);
    const daten = new Uint8Array(puffer, d.lokal + 30 + nl + el, d.groesse);
    if (d.methode === 0) return daten;
    if (d.methode !== 8 || typeof DecompressionStream === "undefined") throw new Error("Dieser Browser kann die Datei nicht entpacken.");
    const strom = new Blob([daten]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(strom).arrayBuffer());
  };
  return { dateien, lesen };
}
// ---------------------------------------------------------------------------
// 3D-Modelle: eigene kleine WebGL-Bühne (drehen, zoomen, verschieben) und die
// Ansicht mit Maßen, Gewicht, Löchern, Schichten und G-Code
// ---------------------------------------------------------------------------

// ---- Matrizen (4×4, spaltenweise wie in WebGL) ----------------------------
const M4 = {
  perspektive(fov, seiten, nah, fern) {
    const f = 1 / Math.tan(fov / 2), nf = 1 / (nah - fern);
    return [f / seiten, 0, 0, 0, 0, f, 0, 0, 0, 0, (fern + nah) * nf, -1, 0, 0, 2 * fern * nah * nf, 0];
  },
  blick(auge, ziel, oben) {
    let zx = auge[0] - ziel[0], zy = auge[1] - ziel[1], zz = auge[2] - ziel[2];
    let l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
    let xx = oben[1] * zz - oben[2] * zy, xy = oben[2] * zx - oben[0] * zz, xz = oben[0] * zy - oben[1] * zx;
    l = Math.hypot(xx, xy, xz) || 1; xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
      -(xx * auge[0] + xy * auge[1] + xz * auge[2]), -(yx * auge[0] + yy * auge[1] + yz * auge[2]), -(zx * auge[0] + zy * auge[1] + zz * auge[2]), 1];
  },
  mal(a, b) {
    const o = new Array(16);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k];
      o[i * 4 + j] = s;
    }
    return o;
  },
  verschieben(x, y, z) { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]; },
  eins() { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; },
  // Drehung (3×3 zeilenweise) um einen Punkt als 4×4
  drehungUm(R, c) {
    const t = [0, 1, 2].map((i) => c[i] - (R[i * 3] * c[0] + R[i * 3 + 1] * c[1] + R[i * 3 + 2] * c[2]));
    return [R[0], R[3], R[6], 0, R[1], R[4], R[7], 0, R[2], R[5], R[8], 0, t[0], t[1], t[2], 1];
  },
};

// ---- Vektoren und Quaternionen für die Kamera -----------------------------
const V3 = {
  plus: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  minus: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mal: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  punkt: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  kreuz: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  // Rodrigues: v um die (normierte) Achse k drehen
  drehen(v, k, w) {
    const c = Math.cos(w), s = Math.sin(w), kv = V3.kreuz(k, v), d = V3.punkt(k, v) * (1 - c);
    return [v[0] * c + kv[0] * s + k[0] * d, v[1] * c + kv[1] * s + k[1] * d, v[2] * c + kv[2] * s + k[2] * d];
  },
};
const QU = {
  // aus Kamera-Basis (Spalten rechts, oben, rück)
  ausBasis(r, u, b) {
    const m00 = r[0], m11 = u[1], m22 = b[2], spur = m00 + m11 + m22;
    let q;
    if (spur > 0) { const s = Math.sqrt(spur + 1) * 2; q = [(u[2] - b[1]) / s, (b[0] - r[2]) / s, (r[1] - u[0]) / s, s / 4]; }
    else if (m00 > m11 && m00 > m22) { const s = Math.sqrt(1 + m00 - m11 - m22) * 2; q = [s / 4, (u[0] + r[1]) / s, (b[0] + r[2]) / s, (u[2] - b[1]) / s]; }
    else if (m11 > m22) { const s = Math.sqrt(1 + m11 - m00 - m22) * 2; q = [(u[0] + r[1]) / s, s / 4, (b[1] + u[2]) / s, (b[0] - r[2]) / s]; }
    else { const s = Math.sqrt(1 + m22 - m00 - m11) * 2; q = [(b[0] + r[2]) / s, (b[1] + u[2]) / s, s / 4, (r[1] - u[0]) / s]; }
    return q;
  },
  zuBasis([x, y, z, w]) {
    return { r: [1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w)], u: [2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w)] };
  },
  slerp(a, b, t) {
    let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    if (d < 0) { b = b.map((x) => -x); d = -d; }
    if (d > 0.9995) { const q = a.map((x, i) => x + (b[i] - x) * t); const l = Math.hypot(...q); return q.map((x) => x / l); }
    const th = Math.acos(d), s = Math.sin(th), fa = Math.sin((1 - t) * th) / s, fb = Math.sin(t * th) / s;
    return a.map((x, i) => x * fa + b[i] * fb);
  },
};

const MESH_VS = `attribute vec3 p; attribute vec3 n; attribute vec3 c;
uniform mat4 mvp; uniform mat4 m; varying vec3 vn; varying vec3 vc; varying float vz;
void main(){ vec4 w = m * vec4(p,1.0); vz = w.z; vn = mat3(m) * n; vc = c; gl_Position = mvp * vec4(p,1.0); }`;
const MESH_FS = `precision mediump float; varying vec3 vn; varying vec3 vc; varying float vz; uniform float alpha; uniform float schnitt;
void main(){ if (vz > schnitt) discard; vec3 n = normalize(vn); if (!gl_FrontFacing) n = -n;
  float l = 0.38 + 0.5 * max(dot(n, normalize(vec3(0.45,-0.6,0.9))), 0.0) + 0.22 * max(dot(n, normalize(vec3(-0.7,0.5,0.3))), 0.0);
  float rand = pow(1.0 - abs(n.z), 3.0) * 0.08;
  gl_FragColor = vec4(vc * l + rand, alpha); }`;
const LINIE_VS = `attribute vec3 p; attribute vec3 c; uniform mat4 mvp; uniform mat4 m; varying vec3 vc; varying float vz;
void main(){ vec4 w = m * vec4(p,1.0); vz = w.z; vc = c; gl_Position = mvp * vec4(p,1.0); }`;
const LINIE_FS = `precision mediump float; varying vec3 vc; varying float vz; uniform float alpha; uniform float hoehe; uniform float dunkel;
void main(){ float f = (vz < hoehe - 0.001) ? dunkel : 1.0; gl_FragColor = vec4(vc * f, alpha); }`;

class Buehne {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.className = "buehne-canvas";
    const gl = this.canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: false });
    this.gl = gl;
    this.ok = !!gl;
    this.objekte = new Map();
    this.ziel = [BETT_MM / 2, BETT_MM / 2, 10];
    this.abstand = 420; this.orbitArt = "eingeschraenkt";
    this._lage(this._richtung(-0.9, 0.65));
    this.zeiger = new Map();
    this.animationen = [];
    if (!gl) return;
    gl.getExtension("OES_element_index_uint");
    this.pMesh = this._programm(MESH_VS, MESH_FS);
    this.pLinie = this._programm(LINIE_VS, LINIE_FS);
    this._ereignisse();
    this._bett();
  }

  _programm(vs, fs) {
    const gl = this.gl;
    const sh = (typ, q) => { const s = gl.createShader(typ); gl.shaderSource(s, q); gl.compileShader(s); return s; };
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    const ort = {};
    ["p", "n", "c"].forEach((a) => (ort[a] = gl.getAttribLocation(p, a)));
    ["mvp", "m", "alpha", "schnitt", "hoehe", "dunkel"].forEach((u) => (ort[u] = gl.getUniformLocation(p, u)));
    return { p, ort };
  }

  _puffer(daten) {
    const gl = this.gl, b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, daten, gl.STATIC_DRAW);
    return b;
  }

  // Dreiecke (9 Zahlen je Dreieck) mit flachen Normalen; farbe: [r,g,b] oder Float32Array je Ecke
  mesh(name, v, farbe, opt = {}) {
    if (!this.ok) return;
    this.weg(name);
    const n = new Float32Array(v.length), c = new Float32Array(v.length);
    for (let i = 0; i < v.length; i += 9) {
      const ux = v[i + 3] - v[i], uy = v[i + 4] - v[i + 1], uz = v[i + 5] - v[i + 2];
      const wx = v[i + 6] - v[i], wy = v[i + 7] - v[i + 1], wz = v[i + 8] - v[i + 2];
      let nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
      const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      for (let k = 0; k < 9; k += 3) { n[i + k] = nx; n[i + k + 1] = ny; n[i + k + 2] = nz; }
    }
    if (farbe instanceof Float32Array) c.set(farbe);
    else for (let i = 0; i < c.length; i += 3) { c[i] = farbe[0]; c[i + 1] = farbe[1]; c[i + 2] = farbe[2]; }
    this.objekte.set(name, { art: "mesh", p: this._puffer(v), n: this._puffer(n), c: this._puffer(c), anzahl: v.length / 3,
      alpha: opt.alpha ?? 1, m: M4.eins(), sichtbar: true, reihe: opt.reihe ?? 1 });
    this.neu();
  }

  // Linien (6 Zahlen je Strecke) mit Farbe je Ecke
  linien(name, v, c, opt = {}) {
    if (!this.ok) return;
    this.weg(name);
    this.objekte.set(name, { art: "linie", p: this._puffer(v), c: this._puffer(c), anzahl: v.length / 3, bis: v.length / 3,
      alpha: opt.alpha ?? 1, m: M4.eins(), sichtbar: true, reihe: opt.reihe ?? 0, hoehe: 1e9, dunkel: opt.dunkel ?? 1 });
    this.neu();
  }

  weg(name) {
    const o = this.objekte.get(name);
    if (!o) return;
    [o.p, o.n, o.c].forEach((b) => b && this.gl.deleteBuffer(b));
    this.objekte.delete(name);
    this.neu();
  }
  setze(name, werte) { const o = this.objekte.get(name); if (o) { Object.assign(o, werte); this.neu(); } }

  _bett() {
    const B = BETT_MM, l = [], c = [];
    const add = (x1, y1, x2, y2, f) => { l.push(x1, y1, 0, x2, y2, 0); c.push(...f, ...f); };
    for (let i = 0; i <= B; i += 10) {
      const f = i % 50 === 0 ? [0.2, 0.3, 0.27] : [0.12, 0.16, 0.15];
      add(i, 0, i, B, f); add(0, i, B, i, f);
    }
    const r = [0.24, 0.9, 0.66];
    add(0, 0, B, 0, r); add(B, 0, B, B, r); add(B, B, 0, B, r); add(0, B, 0, 0, r);
    this.linien("bett-raster", new Float32Array(l), new Float32Array(c), { reihe: -1 });
    const p = new Float32Array([0, 0, -0.05, B, 0, -0.05, B, B, -0.05, 0, 0, -0.05, B, B, -0.05, 0, B, -0.05]);
    this.mesh("bett", p, [0.06, 0.08, 0.075], { reihe: -2 });
  }

  // ---- Kamera ----
  // Lage als Basis: r (rechts), u (oben), Blick f = u × r. Ziel liegt im Abstand vor dem Auge.
  _f() { return V3.kreuz(this.u, this.r); }
  _auge() { return V3.minus(this.ziel, V3.mal(this._f(), this.abstand)); }
  unterBett() { return this._auge()[2] < -0.01; }
  _matrix() {
    const w = this.canvas.width || 1, h = this.canvas.height || 1;
    const p = M4.perspektive(0.7, w / h, Math.max(0.5, this.abstand / 200), this.abstand * 8 + 1000);
    return M4.mal(p, M4.blick(this._auge(), this.ziel, this.u));
  }
  // Basis aus Blickrichtung zum Auge (e zeigt vom Ziel zum Auge); senkrecht: vorne unten im Bild
  _basisAus(e) {
    e = V3.norm(e);
    const f = V3.mal(e, -1);
    if (Math.abs(e[2]) > 0.999) {
      const u = e[2] > 0 ? [0, 1, 0] : [0, -1, 0];
      return { r: V3.norm(V3.kreuz(f, u)), u };
    }
    const r = V3.norm(V3.kreuz(f, [0, 0, 1]));
    return { r, u: V3.kreuz(r, f) };
  }
  _richtung(dreh, neig) { const c = Math.cos(neig); return [c * Math.cos(dreh), c * Math.sin(dreh), Math.sin(neig)]; }
  _lage(e) { const b = this._basisAus(e); this.r = b.r; this.u = b.u; }
  // Neigung über dem Bett in Grad (−90 = von unten, 90 = von oben)
  neigung() { return (Math.asin(Math.max(-1, Math.min(1, -this._f()[2]))) * 180) / Math.PI; }

  ansicht(art, grenzen, animiert = false) {
    let ziel = this.ziel, abstand = this.abstand;
    if (grenzen) {
      const g = grenzen;
      ziel = [(g.min[0] + g.max[0]) / 2, (g.min[1] + g.max[1]) / 2, (g.min[2] + g.max[2]) / 2];
      this.mitte = ziel.slice();
      const r = Math.max(20, Math.hypot(...g.groesse) / 2);
      abstand = Math.min(900, r / Math.sin(0.35) * 1.15);
    }
    let e;
    if (art === "oben") e = [0, 0, 1];
    else if (art === "unten") e = [0, 0, -1];
    else if (art === "vorne") e = this._richtung(-Math.PI / 2, 0.05);
    else if (art === "bett") { ziel = [BETT_MM / 2, BETT_MM / 2, 0]; abstand = 520; e = this._richtung(-1.1, 0.75); }
    else e = this._richtung(-1.05, 0.6);
    this.fliegen(e, ziel, abstand, animiert);
  }

  // Kamera zu einer Blickrichtung (vom Ziel zum Auge) bringen, wahlweise sanft
  fliegen(e, ziel = this.ziel, abstand = this.abstand, animiert = true) {
    const b = this._basisAus(e);
    if (!animiert || !this.r) {
      this.r = b.r; this.u = b.u; this.ziel = ziel.slice(); this.abstand = abstand; this.neu();
      return;
    }
    const q0 = QU.ausBasis(this.r, this.u, V3.mal(this._f(), -1)), q1 = QU.ausBasis(b.r, b.u, V3.norm(e));
    const z0 = this.ziel.slice(), a0 = this.abstand, start = performance.now(), dauer = 520;
    const nr = (this._flugNr = (this._flugNr || 0) + 1);
    this.animieren((t) => {
      if (this._flugNr !== nr) return false;
      const x = Math.min(1, (t - start) / dauer), k = 1 - Math.pow(1 - x, 3);
      const q = QU.zuBasis(QU.slerp(q0, q1, k));
      this.r = V3.norm(q.r); this.u = V3.norm(q.u);
      this.ziel = z0.map((v, i) => v + (ziel[i] - v) * k);
      this.abstand = a0 + (abstand - a0) * k;
      if (x >= 1) { this.r = b.r; this.u = b.u; }
      return x < 1;
    });
  }

  // Weltpunkt → Bildschirm (CSS-Pixel)
  projizieren(p) {
    const m = this._letzte || this._matrix();
    const x = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], y = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13];
    const w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15];
    if (w <= 0) return null;
    const r = this.canvas.getBoundingClientRect();
    return [((x / w + 1) / 2) * r.width, ((1 - y / w) / 2) * r.height];
  }

  // Bildschirmpunkt (CSS-Pixel) → Strahl {von, richtung} in Weltkoordinaten
  strahl(px, py) {
    const r = this.canvas.getBoundingClientRect();
    const f = this._f(), re = this.r, ob = this.u;
    const t = Math.tan(0.35), x = (px / r.width) * 2 - 1, y = 1 - (py / r.height) * 2;
    const seiten = r.width / Math.max(1, r.height);
    return { von: this._auge(), richtung: V3.norm([0, 1, 2].map((i) => f[i] + re[i] * x * t * seiten + ob[i] * y * t)) };
  }

  // ---- Orbit wie in Fusion 360: frei (Trackball) oder eingeschränkt (Drehteller, Z bleibt oben) ----
  // Gedreht wird um den Drehpunkt: die ganze Kamera (Ziel und Lage) wandert um ihn herum.
  orbit(dx, dy, punkt) {
    const p = punkt || this.drehpunkt || this.mitte || this.ziel;
    const k = 0.008;
    const umAchse = (achse, w) => {
      if (!w) return;
      this.r = V3.drehen(this.r, achse, w); this.u = V3.drehen(this.u, achse, w);
      this.ziel = V3.plus(p, V3.drehen(V3.minus(this.ziel, p), achse, w));
    };
    if (this.orbitArt === "frei") {
      umAchse(V3.norm(this.u), -dx * k);
      umAchse(V3.norm(this.r), -dy * k);
    } else {
      umAchse([0, 0, 1], -dx * k);
      // senkrecht nicht überschlagen (auch von unten bis knapp −90°)
      const jetzt = this.neigung(), w = -dy * k, grenze = 89.5;
      const neu = Math.max(-grenze, Math.min(grenze, jetzt - (w * 180) / Math.PI));
      umAchse(V3.norm(this.r), (-(neu - jetzt) * Math.PI) / 180);
    }
    // Basis sauber halten
    const f = V3.norm(this._f());
    this.r = V3.norm(V3.kreuz(f, this.u)); this.u = V3.kreuz(this.r, f);
    this.neu();
  }
  setzeOrbitArt(art) {
    this.orbitArt = art === "frei" ? "frei" : "eingeschraenkt";
    if (this.orbitArt === "eingeschraenkt") {
      // wieder waagerecht ausrichten (Z zeigt im Bild nach oben)
      const f = this._f();
      if (Math.abs(f[2]) < 0.999) { this.r = V3.norm(V3.kreuz(f, [0, 0, 1])); this.u = V3.kreuz(this.r, f); }
      else { this.r = V3.norm([this.r[0], this.r[1], 0]); this.u = V3.kreuz(this.r, f); }
      this.neu();
    }
  }

  // ---- Bedienung: ziehen = Orbit um den Punkt unter dem Zeiger, rechts/Shift/zwei Finger = verschieben, Rad/zwei Finger = zoomen ----
  _ereignisse() {
    const c = this.canvas;
    c.addEventListener("contextmenu", (e) => e.preventDefault());
    c.addEventListener("wheel", (e) => { e.preventDefault(); this.abstand = Math.min(1500, Math.max(8, this.abstand * Math.exp(e.deltaY * 0.0012))); this.neu(); }, { passive: false });
    c.addEventListener("pointerdown", (e) => {
      c.setPointerCapture(e.pointerId);
      const schieben = e.button === 2 || e.button === 1 || e.shiftKey;
      this.zeiger.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, schieben });
      if (this.zeiger.size === 1 && !schieben) {
        // Drehpunkt: Stelle des Modells unter dem Zeiger, sonst die Modellmitte
        const r = c.getBoundingClientRect();
        const s = this.strahl(e.clientX - r.left, e.clientY - r.top);
        const t = this.treffen ? this.treffen(s) : null;
        this.drehpunkt = t != null ? V3.plus(s.von, V3.mal(s.richtung, t)) : (this.mitte || this.ziel).slice();
        this.drehpunktGetroffen = t != null;
        this.drehpunktSichtbar = false;
      } else this.drehpunktSichtbar = false;
    });
    const ende = (e) => {
      const z = this.zeiger.get(e.pointerId);
      // Antippen (kaum bewegt, ein Finger) → für das Markieren von Löchern
      if (z && e.type === "pointerup" && this.zeiger.size === 1 && !this._pinch && Math.hypot(e.clientX - z.x0, e.clientY - z.y0) < 6 && this.antippen) {
        const r = c.getBoundingClientRect();
        this.antippen(this.strahl(e.clientX - r.left, e.clientY - r.top));
      }
      this.zeiger.delete(e.pointerId); this._pinch = null;
      if (!this.zeiger.size) { this.drehpunktSichtbar = false; this.neu(); }
    };
    c.addEventListener("pointerup", ende);
    c.addEventListener("pointercancel", ende);
    c.addEventListener("pointermove", (e) => {
      const z = this.zeiger.get(e.pointerId);
      if (!z) return;
      const dx = e.clientX - z.x, dy = e.clientY - z.y;
      if (this.zeiger.size === 2) {
        const [a, b] = [...this.zeiger.values()];
        z.x = e.clientX; z.y = e.clientY;
        const d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        if (this._pinch) {
          this.abstand = Math.min(1500, Math.max(8, this.abstand * (this._pinch.d / d)));
          this._schieben(mx - this._pinch.mx, my - this._pinch.my);
        }
        this._pinch = { d, mx, my };
        this.drehpunktSichtbar = false;
        this.neu();
        return;
      }
      z.x = e.clientX; z.y = e.clientY;
      if (z.schieben) this._schieben(dx, dy);
      else if (Math.hypot(e.clientX - z.x0, e.clientY - z.y0) >= 3) { this.drehpunktSichtbar = true; this.orbit(dx, dy, this.drehpunkt); }
      this.neu();
    });
  }
  _schieben(dx, dy) {
    const f = (this.abstand * 0.0016) * (800 / Math.max(300, this.canvas.clientHeight));
    this.ziel = V3.plus(this.ziel, V3.plus(V3.mal(this.r, -dx * f), V3.mal(this.u, dy * f)));
  }

  neu() {
    if (this._wartet || !this.ok) return;
    this._wartet = true;
    requestAnimationFrame((t) => { this._wartet = false; this._zeichnen(t); });
  }
  animieren(fn) { this.animationen.push(fn); this.neu(); }

  _zeichnen(zeit) {
    const gl = this.gl, c = this.canvas;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr);
    if (!w || !h) return;
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    this.animationen = this.animationen.filter((fn) => fn(zeit) !== false);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const vp = this._matrix();
    this._letzte = vp;
    // Von unten: Druckplatte durchscheinend, damit das Teil zu sehen bleibt
    const unten = this.unterBett(), bett = this.objekte.get("bett"), raster = this.objekte.get("bett-raster");
    if (bett) bett.alpha = unten ? 0.28 : 1;
    if (raster) raster.alpha = unten ? 0.4 : 1;
    const liste = [...this.objekte.values()].filter((o) => o.sichtbar).sort((a, b) => (a.alpha < 1) - (b.alpha < 1) || a.reihe - b.reihe);
    for (const o of liste) {
      const pr = o.art === "mesh" ? this.pMesh : this.pLinie;
      gl.useProgram(pr.p);
      gl.uniformMatrix4fv(pr.ort.mvp, false, new Float32Array(M4.mal(vp, o.m)));
      gl.uniformMatrix4fv(pr.ort.m, false, new Float32Array(o.m));
      gl.uniform1f(pr.ort.alpha, o.alpha);
      gl.depthMask(o.alpha >= 1);
      const attr = (ort, b) => { if (ort < 0) return; gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.enableVertexAttribArray(ort); gl.vertexAttribPointer(ort, 3, gl.FLOAT, false, 0, 0); };
      attr(pr.ort.p, o.p); attr(pr.ort.c, o.c);
      if (o.art === "mesh") {
        attr(pr.ort.n, o.n);
        gl.uniform1f(pr.ort.schnitt, o.schnitt ?? 1e9);
        gl.drawArrays(gl.TRIANGLES, 0, o.anzahl);
      } else {
        gl.uniform1f(pr.ort.hoehe, o.hoehe);
        gl.uniform1f(pr.ort.dunkel, o.dunkel);
        gl.drawArrays(gl.LINES, 0, Math.min(o.anzahl, o.bis));
      }
    }
    gl.depthMask(true);
    if (this.nachZeichnen) this.nachZeichnen();
    if (this.animationen.length) this.neu();
  }
}

// ---- Teile zum Einsetzen (einfach gezeichnet) -----------------------------
function zylinderDreiecke(r, h, z0 = 0, teile = 40) {
  const v = [];
  for (let i = 0; i < teile; i++) {
    const a1 = (i / teile) * Math.PI * 2, a2 = ((i + 1) / teile) * Math.PI * 2;
    const x1 = Math.cos(a1) * r, y1 = Math.sin(a1) * r, x2 = Math.cos(a2) * r, y2 = Math.sin(a2) * r;
    v.push(x1, y1, z0, x2, y2, z0, x2, y2, z0 + h, x1, y1, z0, x2, y2, z0 + h, x1, y1, z0 + h);
    v.push(0, 0, z0 + h, x1, y1, z0 + h, x2, y2, z0 + h);
    v.push(0, 0, z0, x2, y2, z0, x1, y1, z0);
  }
  return v;
}
const ICON_MUELL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>`;

// Teil entlang der lokalen z-Achse bauen: z = 0 ist die Lochöffnung, positiv geht ins Loch hinein
function teilGeometrie(teil, loch) {
  const teileFarben = [];
  let v = [];
  const farbe = (arr, f) => { for (let i = 0; i < arr.length; i += 3) teileFarben.push(...f); v = v.concat(arr); };
  if (teil.kat === "einsatz") {
    farbe(zylinderDreiecke(teil.aussen / 2, teil.laenge, 0), [0.84, 0.66, 0.2]);
    farbe(zylinderDreiecke(gewindeD(teil.gewinde) / 2, teil.laenge + 0.02, -0.01, 24), [0.35, 0.26, 0.06]);
  } else if (teil.kat === "schraube") {
    const n = NORM[teil.gewinde] || NORM.M3;
    farbe(zylinderDreiecke(n.kopf_d / 2, n.kopf_h, -n.kopf_h), [0.42, 0.46, 0.45]);
    farbe(zylinderDreiecke(gewindeD(teil.gewinde) / 2, teil.laenge, 0, 24), [0.62, 0.66, 0.65]);
  } else if (teil.kat === "magnet") {
    const start = Math.max(0, loch.tiefe - teil.dicke);
    farbe(zylinderDreiecke(teil.durchmesser / 2, teil.dicke / 2, start), [0.85, 0.25, 0.2]);
    farbe(zylinderDreiecke(teil.durchmesser / 2, teil.dicke / 2, start + teil.dicke / 2), [0.2, 0.45, 0.85]);
  }
  return { v, farben: teileFarben };
}
// Lokale Koordinaten in die Welt drehen: lokale z-Achse zeigt ins Loch
function insLoch(lokal, loch) {
  const a = loch.achse, rein = -loch.richtung;
  const [u, w] = a === 2 ? [0, 1] : a === 0 ? [1, 2] : [2, 0];
  const out = new Float32Array(lokal.length);
  for (let i = 0; i < lokal.length; i += 3) {
    const p = [0, 0, 0];
    p[u] = loch.mitte[u] + lokal[i];
    p[w] = loch.mitte[w] + lokal[i + 1];
    p[a] = loch.oeffnung + lokal[i + 2] * rein;
    out[i] = p[0]; out[i + 1] = p[1]; out[i + 2] = p[2];
  }
  return out;
}

// ---- Zuletzt geöffnete Dateien ----------------------------------------------
// Mit der Integration liegen sie auf dem Home-Assistant-Rechner (Medien › 3d-modelle)
// und jedes Gerät sieht dieselbe Liste. Ohne Integration nur in diesem Browser.
const MOD_SERVER_URL = "/api/filament_werkstatt/modelle";
function modServer(hass) {
  const url = (name) => `${MOD_SERVER_URL}/${encodeURIComponent(name)}`;
  const pruefen = (r) => { if (!r.ok) throw new Error(`Home Assistant antwortet mit ${r.status}`); return r; };
  return {
    aufServer: true,
    async alle() {
      const d = await pruefen(await hass.fetchWithAuth(MOD_SERVER_URL)).json();
      return (d.modelle || []).map((m) => ({ name: m.name, datum: m.zeit, groesse: m.groesse }));
    },
    async holen(name) {
      const r = await hass.fetchWithAuth(url(name));
      return r.ok ? { name, daten: await r.arrayBuffer() } : null;
    },
    async speichern(name, daten) {
      pruefen(await hass.fetchWithAuth(`${MOD_SERVER_URL}?name=${encodeURIComponent(name)}`,
        { method: "POST", body: daten, headers: { "Content-Type": "application/octet-stream" } }));
    },
    async loeschen(name) { await hass.fetchWithAuth(url(name), { method: "DELETE" }); },
  };
}

const MOD_DB = {
  async db() {
    if (this._db) return this._db;
    this._db = await new Promise((ok, fehler) => {
      const r = indexedDB.open("filament-werkstatt", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("modelle", { keyPath: "name" });
      r.onsuccess = () => ok(r.result);
      r.onerror = () => fehler(r.error);
    });
    return this._db;
  },
  async alle() {
    try {
      const db = await this.db();
      return await new Promise((ok) => {
        const r = db.transaction("modelle").objectStore("modelle").getAll();
        r.onsuccess = () => ok((r.result || []).sort((a, b) => b.datum - a.datum).map(({ name, datum, groesse }) => ({ name, datum, groesse })));
        r.onerror = () => ok([]);
      });
    } catch (e) { return []; }
  },
  async holen(name) {
    const db = await this.db();
    return new Promise((ok) => { const r = db.transaction("modelle").objectStore("modelle").get(name); r.onsuccess = () => ok(r.result); r.onerror = () => ok(null); });
  },
  async speichern(name, daten) {
    try {
      const db = await this.db();
      const tx = db.transaction("modelle", "readwrite");
      tx.objectStore("modelle").put({ name, daten, datum: Date.now(), groesse: daten.byteLength });
      await new Promise((ok) => (tx.oncomplete = ok));
      const liste = await this.alle();
      if (liste.length > 8) {
        const tx2 = db.transaction("modelle", "readwrite");
        liste.slice(8).forEach((x) => tx2.objectStore("modelle").delete(x.name));
      }
    } catch (e) { /* Speicher voll oder privat: dann eben nicht */ }
  },
  async loeschen(name) {
    try { const db = await this.db(); db.transaction("modelle", "readwrite").objectStore("modelle").delete(name); } catch (e) { /* egal */ }
  },
};

const STUETZEN = [
  { id: "keine", name: "Keine" },
  { id: "normal", name: "Normal" },
  { id: "baum-schlank", name: "Baum schlank" },
  { id: "baum-stark", name: "Baum stark" },
  { id: "baum-hybrid", name: "Baum hybrid" },
];
const MOD_ICON = {
  orbit: `<svg viewBox="0 0 24 24" class="mod-ico" aria-hidden="true"><ellipse cx="12" cy="12" rx="9.6" ry="4.3" transform="rotate(-28 12 12)"/><ellipse cx="12" cy="12" rx="4.3" ry="9.6" transform="rotate(-28 12 12)" opacity=".45"/><circle cx="12" cy="12" r="2.4" class="voll"/><path d="M17.6 4.3l2.9.6-.9 2.8"/></svg>`,
  orbitEin: `<svg viewBox="0 0 24 24" class="mod-ico" aria-hidden="true"><ellipse cx="12" cy="16" rx="9.4" ry="3.6"/><path d="M12 3v13" stroke-dasharray="2 2"/><circle cx="12" cy="16" r="2.2" class="voll"/><path d="M18.4 11.6l2.6 1.6-2.4 1.8"/></svg>`,
  haus: `<svg viewBox="0 0 24 24" class="mod-ico" aria-hidden="true"><path d="M4 11.5L12 4.5l8 7"/><path d="M6.5 10v9h11v-9"/><path d="M10.5 19v-5h3v5"/></svg>`,
};
const SCHICHT_BEREICH = { 0.2: [0.06, 0.14, 0.1], 0.4: [0.08, 0.28, 0.2], 0.6: [0.18, 0.42, 0.3], 0.8: [0.24, 0.56, 0.4] };

const MOD_MAX_BYTES = 200 * 1048576;      // größere Dateien bringen Handys zum Absturz
const MOD_MAX_DREIECKE = 3000000;

const ModellAnsicht = {
  _modHtml() {
    this._modEinrichten();
    const m = this._mod;
    if (!m) return this._modLeerHtml();
    if (m.laedt) return `<div class="dr-karte mod-laden"><span class="dreher"></span><div><h2>${esc(m.name)}</h2><p class="leise">${esc(m.laedt)}</p></div></div>`;
    const tabs = m.art === "stl"
      ? [["uebersicht", "Übersicht"], ["loecher", `Löcher${m.loecher ? ` (${m.loecher.length})` : ""}`], ["schichten", "Schichten"]]
      : [["uebersicht", "Übersicht"], ["schichten", "Schichten"]];
    return `<div class="mod-raster">
      <div class="mod-huelle">
      <button class="mod-plus" data-aktion="neu" aria-label="Datei öffnen" title="STL oder G-Code öffnen">+</button>
      <div class="mod-buehne-karte dr-karte">
        <div id="mod-buehne" class="mod-buehne"></div>
        <div id="mod-marker" class="mod-marker"></div>
        <div class="mod-leiste">
          <span class="mod-name" title="${esc(m.name)}">${m.art === "stl" ? "🧊" : "🧾"} ${esc(m.name)}</span>
          <button class="chip" data-aktion="mod-ansicht" data-id="iso">3D</button>
          <button class="chip" data-aktion="mod-ansicht" data-id="oben">Oben</button>
          <button class="chip" data-aktion="mod-ansicht" data-id="vorne">Vorne</button>
          <button class="chip" data-aktion="mod-ansicht" data-id="bett">Bett</button>
          ${this._modOrbitHtml()}
          <button class="chip mod-zu" data-aktion="mod-schliessen" aria-label="Modell schließen">✕</button>
        </div>
        ${this._modWuerfelHtml()}
        <div id="mod-drehpunkt" class="mod-drehpunkt" aria-hidden="true"></div>
        ${m.tab === "schichten" && m.schichtZahl ? `<div class="mod-schicht-leiste">
          <button class="rund" data-aktion="mod-schicht" data-d="-1" aria-label="Schicht tiefer">−</button>
          <input type="range" min="1" max="${m.schichtZahl}" step="1" value="${m.schichtNr}" data-mod="schicht">
          <button class="rund" data-aktion="mod-schicht" data-d="1" aria-label="Schicht höher">+</button>
          <span id="mod-schicht-text" class="mod-schicht-text">${this._modSchichtText()}</span>
        </div>` : ""}
        ${m.markieren ? `<div class="mod-markier-hinweis" data-einmal="mod-markier">🎯 Tippe auf die Stelle, an der das Loch beginnt <button class="mini" data-aktion="mod-markieren">Abbrechen</button></div>` : ""}
        <p class="mod-hilfe leise">${this._mobil ? "Ein Finger dreht um die berührte Stelle · zwei Finger zoomen und schieben" : "Ziehen dreht um die Stelle unter dem Zeiger · Rechtsklick oder Shift schiebt · Mausrad zoomt"}</p>
      </div>
      </div>
      <aside class="mod-seite dr-karte">
        <div class="tabs mod-tabs">${tabs.map(([id, n]) => `<button class="tab ${m.tab === id ? "an" : ""}" data-aktion="mod-tab" data-id="${id}">${n}</button>`).join("")}</div>
        <div class="mod-inhalt">${m.tab === "loecher" ? this._modLoecherHtml() : m.tab === "schichten" ? this._modSchichtenHtml() : this._modUebersichtHtml()}</div>
        <div class="mod-fuss"><button class="knopf breit mod-ws" data-aktion="ws-aus-modell">＋ In die Warteschlange</button></div>
      </aside>
    </div>`;
  },

  _modLeerHtml() {
    // Liste beim Öffnen des Reiters auffrischen, ein anderes Gerät kann etwas geöffnet haben
    if (this._modBereit && Date.now() - (this._modZuletztZeit || 0) > 15000) setTimeout(() => this._modZuletztLaden(), 0);
    const zuletzt = this._modZuletzt || [];
    return `<div class="mod-leer">
      <label class="ablage" data-ablage="1">
        <input type="file" accept=".stl,.gcode,.3mf" data-mod="datei" hidden>
        <span class="ablage-icon">🧊</span>
        <strong>STL oder G-Code hierher ziehen</strong>
        <span class="leise">oder tippen, um eine Datei zu wählen</span>
        <span class="leise klein">.stl · .gcode · .gcode.3mf aus Bambu Studio</span>
      </label>
      ${zuletzt.length ? `<div class="dr-karte"><h3 class="dr-titel">🕘 Zuletzt geöffnet <small class="leise">${this._modZuletztServer
        ? `auf allen Geräten · ${zahl(zuletzt.reduce((s, z) => s + (z.groesse || 0), 0) / 1048576, 1)} MB belegt`
        : "nur auf diesem Gerät"}</small></h3><div class="dr-verlauf">${zuletzt.map((z) => `
        <div class="dr-druck mod-zuletzt"><button class="mod-zuletzt-knopf" data-aktion="mod-zuletzt" data-name="${esc(z.name)}"><span class="ld-bild">${/\.stl$/i.test(z.name) ? "🧊" : "🧾"}</span>
          <span class="dr-druck-text"><strong>${esc(z.name)}</strong><small>${new Date(z.datum).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })} · ${zahl(z.groesse / 1048576, 1)} MB</small></span></button>
          <button class="icon-knopf" data-aktion="mod-zuletzt-weg" data-name="${esc(z.name)}" aria-label="Aus der Liste entfernen">✕</button></div>`).join("")}</div></div>` : ""}
    </div>`;
  },

  _modUebersichtHtml() {
    const m = this._mod;
    if (m.art === "gcode") return this._modGcodeUebersichtHtml();
    const g = m.grenzen.groesse;
    const zuGross = g.map((x) => x > BETT_MM + 0.01);
    const passt = !zuGross.some(Boolean);
    const rolle = this._modRolle();
    const dichte = materialInfo(rolle ? rolle.material : "PLA").dichte;
    const gew = gewichtSchaetzen(m.kenn, dichte, { duese: m.duese, waende: m.waende, fuellung: m.fuellung });
    const rest = rolle && rolle.rest_g != null ? rolle.rest_g - gew.gramm : null;
    const rollen = this._daten.rollen.slice().sort((a, b) => (b.rest_g ?? -1) - (a.rest_g ?? -1));
    return `
      <div class="mod-masse">${["X", "Y", "Z"].map((a, i) => `<div class="${zuGross[i] ? "rot" : ""}"><span>${a}</span><strong>${zahl(g[i], 1)}</strong><small>mm</small></div>`).join("")}</div>
      <div class="hinweis ${passt ? "mint" : "rot-hinweis"}">${passt ? "✓ Passt aufs Druckbett (256 × 256 × 256 mm)" : `✕ Zu groß für den P1S: ${["X", "Y", "Z"].filter((_, i) => zuGross[i]).join(", ")} über 256 mm. Drehen hilft nur, wenn eine andere Seite kürzer ist.`}</div>
      <div class="r-kopf oben-abstand"><span>Drehen</span><span class="leise klein">90° oder eigene Winkel</span></div>
      <div class="chips mod-dreh">
        <button class="chip" data-aktion="mod-drehen" data-achse="0">↻ 90° um X</button>
        <button class="chip" data-aktion="mod-drehen" data-achse="1">↻ 90° um Y</button>
        <button class="chip" data-aktion="mod-drehen" data-achse="2">↻ 90° um Z</button>
        <button class="chip ${m.drehEigen ? "an" : ""}" data-aktion="mod-dreh-eigen" aria-expanded="${m.drehEigen ? "true" : "false"}">✎ Benutzerdefiniert</button>
      </div>
      ${m.drehEigen ? this._modDrehEigenHtml() : ""}
      <h3>⚖️ Gewicht und Rolle</h3>
      <label class="auswahl breit-auswahl"><span>Rolle</span><select data-mod="rolle">${rollen.map((r) => `<option value="${esc(r.id)}" ${rolle && r.id === rolle.id ? "selected" : ""}>${esc(r.name)} · ${esc(r.hersteller)}${r.rest_g != null ? ` · ${zahl(r.rest_g)} g` : " · nicht gewogen"}</option>`).join("")}</select></label>
      ${this._modReglerHtml("fuellung", "Füllung", m.fuellung, 0, 100, 5, "%")}
      ${this._modReglerHtml("waende", "Wände", m.waende, 1, 6, 1, "")}
      <div id="mod-gewicht">${this._modGewichtHtml(gew, rest, rolle)}</div>
      ${m.ueber && m.ueber.flaeche > 25 ? `<div class="hinweis amber">⚠️ Etwa ${zahl(m.ueber.flaeche / 100, 1)} cm² hängen über (steiler als ${STUETZ_WINKEL}°) und brauchen Stützen. <button class="mini" data-aktion="mod-tab" data-id="schichten">Ansehen</button></div>` : `<div class="hinweis">Keine nennenswerten Überhänge, Stützen sind voraussichtlich nicht nötig.</div>`}
      <div class="info-liste oben-abstand">
        <div class="info-zeile"><span>Volumen</span><strong>${zahl(m.kenn.volumen / 1000, 1)} cm³</strong></div>
        <div class="info-zeile"><span>Oberfläche</span><strong>${zahl(m.kenn.flaeche / 100, 0)} cm²</strong></div>
        <div class="info-zeile"><span>Dreiecke</span><strong>${zahl(m.kenn.dreiecke)}</strong></div>
      </div>`;
  },

  // Eigene Winkel je Achse; die Vorschau dreht das Modell schon mit, „Anwenden“ übernimmt es
  _modDrehEigenHtml() {
    const w = this._mod.drehWerte || [0, 0, 0];
    return `<div class="mod-dreh-eigen" data-einmal="mod-dreh-eigen">
      <div class="mod-dreh-felder">${["X", "Y", "Z"].map((a, i) => `<label class="mod-dreh-feld a-${a.toLowerCase()} ${i === (this._mod.drehFeld ?? 2) ? "aktiv" : ""}"><span>${a}</span>
        <input type="number" inputmode="decimal" step="0.5" min="-360" max="360" value="${w[i]}" data-mod="dreh-grad" data-achse="${i}" id="mod-dreh-${i}" aria-label="Winkel um ${a} in Grad"><small>°</small></label>`).join("")}</div>
      <div class="chips mod-dreh-schnell">${[-45, -15, -5, 5, 15, 45].map((g) => `<button class="chip" data-aktion="mod-dreh-plus" data-g="${g}">${g > 0 ? "+" : "−"}${Math.abs(g)}°</button>`).join("")}</div>
      <p class="leise klein">Die Schnellknöpfe ändern das zuletzt gewählte Feld. Gedreht wird um die Modellmitte, erst X, dann Y, dann Z. Danach steht das Teil wieder auf dem Bett.</p>
      <div class="knopf-reihe"><button class="knopf leise" data-aktion="mod-dreh-null">Zurücksetzen</button><button class="knopf" data-aktion="mod-dreh-anwenden">Anwenden</button></div>
    </div>`;
  },

  _modGewichtHtml(gew, rest, rolle) {
    return `<div class="ergebnis ${rest != null && rest < 0 ? "fehlt" : ""}">
      <span class="leise klein">Geschätzt für ${esc(rolle ? rolle.material : "PLA")}</span>
      <strong>≈ ${zahl(gew.gramm, gew.gramm < 10 ? 1 : 0)} g</strong>
      <span class="klein">${zahl(gew.meter, 1)} m Filament</span>
      ${rest == null ? `<span class="klein leise">Rolle nicht gewogen, Rest unbekannt.</span>` : rest >= 0 ? `<span class="klein">✓ Reicht. Danach bleiben noch etwa ${zahl(rest)} g auf der Rolle.</span>` : `<span class="klein">✕ Reicht nicht, es fehlen etwa ${zahl(-rest)} g.</span>`}
    </div><p class="leise klein">Schätzung aus Volumen und Oberfläche. Genauer wird es mit dem G-Code aus Bambu Studio.</p>`;
  },

  _modReglerHtml(k, name, wert, min, max, step, einheit) {
    return `<div class="mod-regler"><div class="r-kopf"><span>${name}</span><strong id="mod-wert-${k}">${zahl(wert, step < 1 ? 2 : 0)}${einheit ? ` ${einheit}` : ""}</strong></div>
      <div class="regler-zeile"><input type="range" min="${min}" max="${max}" step="${step}" value="${wert}" data-mod="${k}"></div></div>`;
  },

  _modGcodeUebersichtHtml() {
    const m = this._mod, i = m.gcode.info;
    const rolle = this._modRolle();
    const rest = rolle && rolle.rest_g != null && i.gramm ? rolle.rest_g - i.gramm : null;
    const rollen = this._daten.rollen.slice().sort((a, b) => (b.rest_g ?? -1) - (a.rest_g ?? -1));
    const g = m.grenzen ? m.grenzen.groesse : null;
    return `
      ${g ? `<div class="mod-masse">${["X", "Y", "Z"].map((a, k) => `<div><span>${a}</span><strong>${zahl(g[k], 1)}</strong><small>mm</small></div>`).join("")}</div>` : ""}
      <div class="info-liste">
        <div class="info-zeile"><span>Filament laut Slicer</span><strong>${i.gramm ? `${zahl(i.gramm, 1)} g` : "–"}</strong></div>
        <div class="info-zeile"><span>Länge</span><strong>${i.mm ? `${zahl(i.mm / 1000, 2)} m` : "–"}</strong></div>
        <div class="info-zeile"><span>Druckzeit</span><strong>${esc(i.zeit || "–")}</strong></div>
        <div class="info-zeile"><span>Material</span><strong>${esc(i.material || "–")}</strong></div>
        <div class="info-zeile"><span>Düse / Schicht</span><strong>${i.duese ? `${zahl(i.duese, 1)} mm` : "–"} / ${i.schicht ? `${zahl(i.schicht, 2)} mm` : "–"}</strong></div>
        <div class="info-zeile"><span>Schichten</span><strong>${zahl(m.gcode.schichten.length)}</strong></div>
      </div>
      <h3>⚖️ Reicht die Rolle?</h3>
      <label class="auswahl breit-auswahl"><span>Rolle</span><select data-mod="rolle">${rollen.map((r) => `<option value="${esc(r.id)}" ${rolle && r.id === rolle.id ? "selected" : ""}>${esc(r.name)} · ${esc(r.hersteller)}${r.rest_g != null ? ` · ${zahl(r.rest_g)} g` : " · nicht gewogen"}</option>`).join("")}</select></label>
      <div class="ergebnis ${rest != null && rest < 0 ? "fehlt" : ""}">
        <strong>${i.gramm ? `${zahl(i.gramm, 1)} g` : "Gewicht unbekannt"}</strong>
        ${rest == null ? `<span class="klein leise">${i.gramm ? "Rolle nicht gewogen, Rest unbekannt." : "Im G-Code steht kein Gewicht."}</span>` : rest >= 0 ? `<span class="klein">✓ Reicht. Danach bleiben etwa ${zahl(rest)} g übrig.</span>` : `<span class="klein">✕ Reicht nicht, es fehlen etwa ${zahl(-rest)} g.</span>`}
      </div>
      <button class="knopf leise breit oben-abstand" data-aktion="mod-tab" data-id="schichten">Schichten ansehen</button>`;
  },

  // ---- Löcher ----
  _modLoecherHtml() {
    const m = this._mod;
    if (!m.loecher) return `<div class="mod-laden-klein"><span class="dreher klein"></span> Suche Löcher …</div>`;
    const markierKnopf = `<button class="knopf leise breit mod-markier ${m.markieren ? "an" : ""}" data-aktion="mod-markieren">${m.markieren ? "✕ Markieren abbrechen" : "＋ Loch von Hand markieren"}</button>`;
    if (!m.loecher.length) return `<div class="hinweis">Keine runden Löcher gefunden. Erkannt werden kreisrunde Löcher entlang X, Y und Z. Schräge oder eckige Löcher kannst du von Hand markieren.</div>${markierKnopf}`;
    const inv = this._daten.inventar;
    const eingesetzt = m.eingesetzt;
    const liste = m.loecher.map((l) => {
      const auf = m.lochAuswahl === l.nr;
      const drin = eingesetzt[l.nr];
      const vor = teileFuerLoch(l, inv);
      const richtung = l.achse === 2 ? "senkrecht" : l.achse === 0 ? "quer (X)" : "quer (Y)";
      return `<div class="mod-loch ${auf ? "auf" : ""} ${drin ? "drin" : ""}">
        <div class="mod-loch-zeile"><button class="mod-loch-kopf" data-aktion="mod-loch" data-nr="${l.nr}">
          <span class="mod-nr">${l.nr}</span>
          <span class="dr-druck-text"><strong>Ø ${zahl(l.durchmesser, 2)} mm · ${zahl(l.tiefe, 1)} mm tief</strong>
            <small>${l.manuell ? "von Hand · " : ""}${l.durch ? "durchgehend" : "Sackloch"} · ${richtung}${drin ? ` · ✓ ${esc(kategorie((inv.find((t) => t.id === drin) || {}).kat).einzahl)} ${esc(teilName(inv.find((t) => t.id === drin) || {}))}` : ""}</small></span>
          <span class="pille ${vor.length ? "mint" : "leise"}">${vor.length ? `${vor.length} passend` : "nichts passend"}</span>
        </button><button class="mod-loch-weg" data-aktion="mod-loch-weg" data-nr="${l.nr}" title="Loch löschen" aria-label="Loch ${l.nr} löschen">${ICON_MUELL}</button></div>
        ${auf && l.manuell ? `<div class="mod-manuell">
          ${this._modReglerHtml(`loch-d-${l.nr}`, "Durchmesser", l.durchmesser, 1, 30, 0.05, "mm").replace(`data-mod="loch-d-${l.nr}"`, `data-mod="loch-d" data-nr="${l.nr}"`)}
          ${this._modReglerHtml(`loch-t-${l.nr}`, "Tiefe", l.tiefe, 0.5, 60, 0.5, "mm").replace(`data-mod="loch-t-${l.nr}"`, `data-mod="loch-t" data-nr="${l.nr}"`)}
          <div class="chips"><button class="chip ${l.durch ? "" : "an"}" data-aktion="mod-loch-art" data-nr="${l.nr}" data-durch="0">Sackloch</button><button class="chip ${l.durch ? "an" : ""}" data-aktion="mod-loch-art" data-nr="${l.nr}" data-durch="1">Durchgehend</button>
          </div></div>` : ""}
        ${auf ? `<div class="mod-vorschlaege">${vor.length ? vor.map((x) => `
          <div class="mod-vorschlag ${drin === x.teil.id ? "an" : ""}">
            <span class="mod-v-bild">${teilSvg(x.teil)}</span>
            <span class="dr-druck-text"><strong>${kategorie(x.teil.kat).icon} ${esc(teilName(x.teil))}</strong><small>${esc(x.text)} · Bestand ${x.teil.menge ?? "?"}</small></span>
            ${drin === x.teil.id ? `<button class="mini" data-aktion="mod-raus" data-nr="${l.nr}">Entfernen</button>` : `<button class="knopf klein-knopf" data-aktion="mod-einsetzen" data-nr="${l.nr}" data-id="${esc(x.teil.id)}">Einsetzen</button>`}
          </div>`).join("") : `<p class="leise klein">Im Inventar ist nichts, das passt. Für einen Einschmelzeinsatz sollte das Loch etwa 0,5–1 mm kleiner sein als der Einsatz, für eine Schraube 0,2–0,6 mm größer als das Gewinde.</p>`}</div>` : ""}
      </div>`;
    }).join("");
    const zaehlen = {};
    Object.values(eingesetzt).forEach((id) => (zaehlen[id] = (zaehlen[id] || 0) + 1));
    const teileliste = Object.entries(zaehlen).map(([id, n]) => {
      const t = inv.find((x) => x.id === id);
      if (!t) return "";
      const knapp = t.menge != null && t.menge < n;
      return `<div class="info-zeile"><span>${n}× ${kategorie(t.kat).icon} ${esc(kategorie(t.kat).einzahl)} ${esc(teilName(t))}</span><strong class="${knapp ? "rot" : ""}">Bestand ${t.menge ?? "?"}</strong></div>`;
    }).join("");
    return `<div class="knopf-reihe"><button class="knopf" data-aktion="mod-alle-einsetzen">Alle passenden einsetzen</button>
        ${Object.keys(eingesetzt).length ? `<button class="knopf leise" data-aktion="mod-alle-raus">Alle entfernen</button>` : ""}</div>
      <div class="mod-loecher">${liste}</div>${markierKnopf}
      ${m.geloescht && m.geloescht.length ? `<button class="knopf leise breit" data-aktion="mod-loch-zurueck">↺ Gelöschte Löcher zurückholen (${m.geloescht.length})</button>` : ""}
      ${teileliste ? `<h3>🧾 Teileliste für dieses Modell</h3><div class="info-liste">${teileliste}</div>` : ""}
      <p class="leise klein oben-abstand">Erkannt werden kreisrunde Löcher entlang X, Y und Z. Schräge Löcher und Sechskant-Taschen für Muttern noch nicht. Tiefe auf etwa ±0,3 mm genau.</p>`;
  },

  // ---- Schichten ----
  _modSchichtenHtml() {
    const m = this._mod;
    if (m.art === "gcode") {
      const arten = new Set();
      m.gcode.schichten.forEach((s) => { for (let i = 4; i < s.linien.length; i += 5) arten.add(GCODE_ARTEN_LISTE[s.linien[i]]); });
      return `<p class="leise">Echte Druckwege aus dem G-Code. Mit dem Regler unter der Ansicht gehst du Schicht für Schicht.</p>
        ${this._modLegendeHtml([...arten])}`;
    }
    const duesen = [...new Set(this._daten.inventar.filter((t) => t.kat === "duese" && (t.menge == null || t.menge > 0)).map((t) => t.groesse))].sort();
    const [smin, smax] = SCHICHT_BEREICH[m.duese] || [0.08, 0.28];
    return `
      <div class="r-kopf"><span>Düse</span><span class="leise klein">aus deinem Inventar</span></div>
      <div class="chips">${(duesen.length ? duesen : [0.4]).map((d) => `<button class="chip ${m.duese === d ? "an" : ""}" data-aktion="mod-duese" data-id="${d}">${zahl(d, 1)} mm</button>`).join("")}</div>
      ${this._modReglerHtml("schicht_h", "Schichthöhe", m.schicht_h, smin, smax, 0.02, "mm")}
      <p class="leise klein">Für ${zahl(m.duese, 1)} mm sind ${zahl(smin, 2)}–${zahl(smax, 2)} mm sinnvoll. Dünner sieht feiner aus und dauert länger.</p>
      ${this._modReglerHtml("waende", "Wände", m.waende, 1, 6, 1, "")}
      ${this._modReglerHtml("fuellung", "Füllung", m.fuellung, 0, 100, 5, "%")}
      ${this._modMusterHtml()}
      <div class="r-kopf oben-abstand"><span>Stützen</span><button class="mini mint-rand" data-aktion="mod-stuetzen-hilfe">Was ist was?</button></div>
      <div class="chips">${STUETZEN.map((s) => `<button class="chip ${m.stuetzen === s.id ? "an" : ""}" data-aktion="mod-stuetzen" data-id="${s.id}">${s.name}</button>`).join("")}</div>
      <div id="mod-schicht-status">${this._modSchichtStatusHtml()}</div>
      ${this._modLegendeHtml(["aussen", "innen", "fuellung", ...(m.stuetzen !== "keine" ? ["stuetze"] : [])])}
      <p class="leise klein">Vereinfachte Vorschau, kein echter Slicer: Wände, Füllung und Stützen sind angenähert. Für die echten Wege den G-Code aus Bambu Studio laden.</p>`;
  },

  // Füllmuster wie in Bambu Studio, mit kleiner Vorschau
  _modMusterHtml() {
    const m = this._mod, mu = FUELLMUSTER.find((x) => x.id === m.muster) || FUELLMUSTER[0];
    const gruppen = Object.entries(FUELLMUSTER_GRUPPEN).map(([g, name]) => `<optgroup label="${esc(name)}">${FUELLMUSTER.filter((x) => x.gruppe === g)
      .map((x) => `<option value="${x.id}" ${x.id === mu.id ? "selected" : ""}>${esc(x.name)}${x.name !== x.bambu ? ` (${esc(x.bambu)})` : ""}</option>`).join("")}</optgroup>`).join("");
    return `<div class="mod-muster" id="mod-muster">
      <div class="mod-muster-vorschau" title="So sieht ${esc(mu.name)} in einer Schicht ungefähr aus">${musterVorschauSvg(mu.id)}</div>
      <div class="mod-muster-text">
        <label class="auswahl breit-auswahl"><span>Füllmuster</span><select data-mod="muster">${gruppen}</select></label>
        <p class="leise klein">${esc(mu.text)}${mu.gruppe === "3d" ? " <span class=\"pille mint\">ändert sich je Schicht</span>" : ""}</p>
      </div>
    </div>`;
  },

  _modSchichtStatusHtml() {
    const m = this._mod;
    if (m.schichtFortschritt != null && m.schichtFortschritt < 1) return `<div class="mod-laden-klein"><span class="dreher klein"></span> Berechne Schichten … ${zahl(m.schichtFortschritt * 100)} %</div>`;
    if (!m.schichtGewicht) return "";
    const rolle = this._modRolle();
    return `<div class="info-liste oben-abstand">
      <div class="info-zeile"><span>Schichten</span><strong>${zahl(m.schichtZahl)}</strong></div>
      <div class="info-zeile"><span>Filament (aus den Schichten)</span><strong>≈ ${zahl(m.schichtGewicht, 1)} g</strong></div>
      ${m.stuetzGewicht ? `<div class="info-zeile"><span>davon Stützen</span><strong>≈ ${zahl(m.stuetzGewicht, 1)} g</strong></div>` : ""}
      <div class="info-zeile"><span>Material</span><strong>${esc(rolle ? rolle.material : "PLA")}</strong></div>
    </div>`;
  },

  _modLegendeHtml(arten) {
    return `<div class="mod-legende">${arten.filter(Boolean).map((a) => { const f = LINIEN_FARBEN[a] || [1, 1, 1];
      return `<span><i style="background: rgb(${f.map((x) => Math.round(x * 255)).join(",")})"></i>${LINIEN_NAMEN[a] || a}</span>`; }).join("")}</div>`;
  },

  _modSchichtText() {
    const m = this._mod;
    const z = m.schichtHoehen ? m.schichtHoehen[m.schichtNr - 1] : null;
    return `Schicht ${m.schichtNr} von ${m.schichtZahl}${z != null ? ` · ${zahl(z, 2)} mm` : ""}`;
  },

  _modStuetzenHilfeHtml() {
    const bild = (art) => {
      const boden = `<rect x="0" y="92" width="160" height="8" fill="#2a3330"/>`;
      const teil = `<path d="M20 20 h120 v18 h-60 v-0 h-60 z" fill="#3ee6a8" opacity=".85"/><rect x="20" y="20" width="40" height="72" fill="#3ee6a8" opacity=".85"/>`;
      let st = "";
      if (art === "normal") for (let x = 66; x < 140; x += 8) st += `<line x1="${x}" y1="40" x2="${x}" y2="92" stroke="#4fe08a" stroke-width="2"/>`;
      if (art.startsWith("baum")) {
        const dick = art === "baum-stark" ? 5 : art === "baum-hybrid" ? 3.5 : 2.2;
        st += `<path d="M100 92 C100 75 100 70 100 62" stroke="#4fe08a" stroke-width="${dick + 1.5}" fill="none"/>`;
        [70, 86, 114, 130].forEach((x) => (st += `<path d="M100 64 Q${(x + 100) / 2} 55 ${x} 40" stroke="#4fe08a" stroke-width="${dick}" fill="none"/>`));
        if (art === "baum-hybrid") for (let x = 66; x < 140; x += 6) st += `<line x1="${x}" y1="40" x2="${x}" y2="43" stroke="#4fe08a" stroke-width="2"/>`;
      }
      return `<svg viewBox="0 0 160 100" class="stuetz-bild">${boden}${teil}${st}</svg>`;
    };
    const texte = {
      keine: "Druckt ohne Stützen. Gut, wenn nichts mehr als etwa 30–45° überhängt. Brücken bis ca. 10–20 mm schafft der P1S meist frei.",
      normal: "Senkrechte Säulen im Gitter direkt unter dem Überhang. Stabil und schnell berechnet, braucht aber mehr Material und hinterlässt mehr Spuren.",
      "baum-schlank": "Dünne Äste, die sich nach unten zu einem Stamm vereinen. Spart Material, lässt sich leicht entfernen. Gut für Figuren und kleine Überhänge.",
      "baum-stark": "Wie Baum schlank, aber mit dickeren Ästen. Für schwere oder hohe Überhänge, wackelt weniger.",
      "baum-hybrid": "Baum unten, oben flache Auflage wie bei Normal. Gut für große, flache Überhänge, die eine glatte Unterseite brauchen.",
    };
    return `<h2>Welche Stützen?</h2><div class="stuetz-liste">${STUETZEN.map((s) => `<div class="stuetz-eintrag">${bild(s.id)}<div><strong>${s.name}</strong><p class="leise klein">${texte[s.id]}</p></div></div>`).join("")}</div>
      <button class="knopf leise breit" data-aktion="dialog-zu">Schließen</button>`;
  },

  // ---- Orbit-Knopf mit kleinem Menü (wie in Fusion 360) ----
  _modOrbitHtml() {
    const frei = this._modOrbitArt === "frei", offen = !!this._modOrbitMenue;
    return `<div class="mod-orbit">
      <button class="chip mod-orbit-knopf ${offen ? "an" : ""}" data-aktion="mod-orbit-menue" aria-haspopup="menu" aria-expanded="${offen}" title="Orbit: ${frei ? "frei" : "eingeschränkt"}">
        ${frei ? MOD_ICON.orbit : MOD_ICON.orbitEin}<span class="mod-orbit-name">${frei ? "Orbit" : "Eingeschr. Orbit"}</span><span class="mod-pfeil">▾</span></button>
      ${offen ? `<div class="mod-orbit-menue" role="menu" data-einmal="mod-orbit-menue">
        <button class="mod-orbit-punkt ${frei ? "an" : ""}" role="menuitemradio" aria-checked="${frei}" data-aktion="mod-orbit-art" data-id="frei">${MOD_ICON.orbit}
          <span><strong>Orbit</strong><small>Frei in alle Richtungen, auch über Kopf</small></span></button>
        <button class="mod-orbit-punkt ${frei ? "" : "an"}" role="menuitemradio" aria-checked="${!frei}" data-aktion="mod-orbit-art" data-id="eingeschraenkt">${MOD_ICON.orbitEin}
          <span><strong>Eingeschränkter Orbit</strong><small>Wie ein Drehteller: oben bleibt oben</small></span></button>
        <div class="mod-orbit-trenner"></div>
        <button class="mod-orbit-punkt" role="menuitemcheckbox" aria-checked="${!!this._modWuerfelZiehen}" data-aktion="mod-wuerfel-ziehen">
          <span class="mod-schalter ${this._modWuerfelZiehen ? "an" : ""}"></span>
          <span><strong>Würfel ziehen dreht die Ansicht</strong><small>Aus: der Würfel reagiert nur auf Klicks</small></span></button>
        <p class="mod-orbit-tipp leise klein">Gedreht wird um die Stelle des Modells, auf die du beim Ziehen zeigst. Daneben: um die Modellmitte.</p>
      </div>` : ""}
    </div>`;
  },

  // ---- Ausrichtungswürfel: Flächen, Kanten und Ecken anklickbar ----
  _modWuerfelHtml() {
    const S = this._mobil ? 48 : 64;
    const FL = [
      { n: [0, 0, 1], x: [1, 0, 0], y: [0, -1, 0], name: "OBEN" },
      { n: [0, 0, -1], x: [1, 0, 0], y: [0, 1, 0], name: "UNTEN" },
      { n: [0, -1, 0], x: [1, 0, 0], y: [0, 0, -1], name: "VORNE" },
      { n: [0, 1, 0], x: [-1, 0, 0], y: [0, 0, -1], name: "HINTEN" },
      { n: [1, 0, 0], x: [0, 1, 0], y: [0, 0, -1], name: "RECHTS" },
      { n: [-1, 0, 0], x: [0, -1, 0], y: [0, 0, -1], name: "LINKS" },
    ];
    const wortFuer = (d) => [d[1] < 0 ? "vorne" : d[1] > 0 ? "hinten" : "", d[0] < 0 ? "links" : d[0] > 0 ? "rechts" : "", d[2] > 0 ? "oben" : d[2] < 0 ? "unten" : ""].filter(Boolean).join(" ");
    const flaechen = FL.map((f) => {
      const m = [...f.x, 0, ...f.y, 0, ...f.n, 0, ...f.n.map((v) => (v * S) / 2), 1];
      let zonen = "";
      for (const j of [-1, 0, 1]) for (const i of [-1, 0, 1]) {
        const d = [0, 1, 2].map((k) => f.n[k] + i * f.x[k] + j * f.y[k]);
        const art = i === 0 && j === 0 ? "flaeche" : i === 0 || j === 0 ? "kante" : "ecke";
        const titel = wortFuer(d);
        zonen += `<button class="mod-w-zone ${art}" ${art === "flaeche" ? "" : `tabindex="-1"`} data-aktion="mod-wuerfel" data-d="${d.join(",")}" title="Ansicht ${titel}" aria-label="Ansicht ${titel}">${art === "flaeche" ? `<span>${f.name}</span>` : ""}</button>`;
      }
      return `<div class="mod-w-flaeche w-${f.name.toLowerCase()}" style="transform: matrix3d(${m.map((v) => +v.toFixed(4)).join(",")})">${zonen}</div>`;
    }).join("");
    const achsen = [["x", "X"], ["y", "Y"], ["z", "Z"]].map(([k, n]) => `<line id="mod-achse-${k}" class="a-${k}" x1="0" y1="0" x2="0" y2="0"/><text id="mod-achse-${k}-t" class="a-${k}" x="0" y="0">${n}</text>`).join("");
    return `<div class="mod-wuerfel-ecke ${this._modWuerfelZiehen ? "ziehbar" : ""}" id="mod-wuerfel-ecke" style="--w: ${S}px">
      <button class="mod-heim" data-aktion="mod-ansicht" data-id="start" title="Startansicht" aria-label="Startansicht">${MOD_ICON.haus}</button>
      <div class="mod-wuerfel" id="mod-wuerfel" role="group" aria-label="Ausrichtungswürfel">
        <div class="mod-w-koerper" id="mod-w-koerper" style="transform: ${this._modWuerfelMatrix()}">${flaechen}</div>
      </div>
      <svg class="mod-achsen" id="mod-achsen" viewBox="-26 -26 52 52" aria-hidden="true">${achsen}</svg>
    </div>`;
  },
  _modWuerfelMatrix() {
    const b = this._buehne;
    if (!b || !b.r) return "rotateX(-60deg) rotateZ(-38deg)";
    const r = b.r, u = b.u, f = b._f();
    // Welt → Bildschirm (CSS: y nach unten, z zum Betrachter)
    return `matrix3d(${[r[0], -u[0], -f[0], 0, r[1], -u[1], -f[1], 0, r[2], -u[2], -f[2], 0, 0, 0, 0, 1].map((v) => +v.toFixed(5)).join(",")})`;
  },
  // Würfel, Achsen und Drehpunkt bei jedem Bild nachführen
  _modWuerfelNachfuehren() {
    const root = this.shadowRoot, b = this._buehne;
    if (!b) return;
    const k = root.getElementById("mod-w-koerper");
    if (k) k.style.transform = this._modWuerfelMatrix();
    const f = b._f();
    for (const [i, a] of ["x", "y", "z"].entries()) {
      const l = root.getElementById(`mod-achse-${a}`), t = root.getElementById(`mod-achse-${a}-t`);
      if (!l) continue;
      const e = [0, 0, 0]; e[i] = 1;
      const x = V3.punkt(b.r, e) * 17, y = -V3.punkt(b.u, e) * 17, hinten = V3.punkt(f, e) > 0.2;
      l.setAttribute("x2", x.toFixed(1)); l.setAttribute("y2", y.toFixed(1));
      t.setAttribute("x", (x * 1.32).toFixed(1)); t.setAttribute("y", (y * 1.32 + 3).toFixed(1));
      l.style.opacity = t.style.opacity = hinten ? 0.35 : 1;
    }
    const p = root.getElementById("mod-drehpunkt");
    if (p) {
      const s = b.drehpunktSichtbar && b.drehpunkt ? b.projizieren(b.drehpunkt) : null;
      p.classList.toggle("an", !!s);
      p.classList.toggle("mitte", !!s && !b.drehpunktGetroffen);
      if (s) p.style.transform = `translate(${s[0]}px, ${s[1]}px)`;
    }
  },
  // Würfel ziehen = Orbit um die Modellmitte (wenn eingeschaltet)
  _modWuerfelZiehenEinrichten() {
    const w = this.shadowRoot.getElementById("mod-wuerfel");
    if (!w || w._fw) return;
    w._fw = true;
    let z = null;
    w.addEventListener("pointerdown", (e) => {
      if (!this._modWuerfelZiehen || !this._buehne) return;
      z = { id: e.pointerId, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, gezogen: false };
    });
    w.addEventListener("pointermove", (e) => {
      if (!z || e.pointerId !== z.id) return;
      if (!z.gezogen && Math.hypot(e.clientX - z.x0, e.clientY - z.y0) < 4) return;
      if (!z.gezogen) { z.gezogen = true; try { w.setPointerCapture(e.pointerId); } catch (x) { /* egal */ } w.classList.add("zieht"); }
      const b = this._buehne;
      b.orbit((e.clientX - z.x) * 1.5, (e.clientY - z.y) * 1.5, b.mitte || b.ziel);
      z.x = e.clientX; z.y = e.clientY;
    });
    const ende = () => { if (z && z.gezogen) this._modWuerfelGezogen = performance.now(); z = null; w.classList.remove("zieht"); };
    w.addEventListener("pointerup", ende);
    w.addEventListener("pointercancel", ende);
  },
  _modMenueZu() {
    if (!this._modOrbitMenue) return;
    this._modOrbitMenue = false;
    const root = this.shadowRoot, menue = root.querySelector(".mod-orbit-menue"), k = root.querySelector(".mod-orbit-knopf");
    if (menue) menue.remove();
    if (k) { k.classList.remove("an"); k.setAttribute("aria-expanded", "false"); }
  },
  _modEinstellung(k, wert) {
    try { if (wert === undefined) return localStorage.getItem(`fw-mod-${k}`); localStorage.setItem(`fw-mod-${k}`, String(wert)); } catch (e) { /* privat: dann eben nicht merken */ }
    return null;
  },

  _modLadenDialogHtml() {
    return `<h2>Datei öffnen</h2>
      <label class="ablage klein-ablage" data-ablage="1">
        <input type="file" accept=".stl,.gcode,.3mf" data-mod="datei" hidden>
        <span class="ablage-icon">＋</span><strong>Hierher ziehen oder tippen</strong>
        <span class="leise klein">.stl · .gcode · .gcode.3mf</span>
      </label>
      <button class="knopf leise breit" data-aktion="dialog-zu">Abbrechen</button>`;
  },

  // ---- Einrichtung und Bühne ----
  _modEinrichten() {
    if (this._modBereit) return;
    this._modBereit = true;
    this._modOrbitArt = this._modEinstellung("orbit") === "frei" ? "frei" : "eingeschraenkt";
    this._modWuerfelZiehen = this._modEinstellung("wuerfel-ziehen") !== "0";
    this._modZuletztLaden();
    const root = this.shadowRoot;
    // Eigene Winkel: das zuletzt angetippte Feld bekommt die Schnellknöpfe
    root.addEventListener("focusin", (e) => {
      const t = e.target;
      if (!this._mod || !t.dataset || t.dataset.mod !== "dreh-grad") return;
      this._mod.drehFeld = Number(t.dataset.achse);
      root.querySelectorAll(".mod-dreh-feld").forEach((f, i) => f.classList.toggle("aktiv", i === this._mod.drehFeld));
    });
    root.addEventListener("dragover", (e) => {
      if (this._ansicht !== "modelle") return;
      e.preventDefault();
      const app = root.querySelector(".app");
      if (app) app.classList.add("ziehen");
    });
    root.addEventListener("dragleave", (e) => { if (!e.relatedTarget) { const app = root.querySelector(".app"); if (app) app.classList.remove("ziehen"); } });
    root.addEventListener("drop", (e) => {
      if (this._ansicht !== "modelle") return;
      e.preventDefault();
      const app = root.querySelector(".app");
      if (app) app.classList.remove("ziehen");
      const f = e.dataTransfer && e.dataTransfer.files[0];
      if (f) { this._dialog = null; this._modDatei(f); }
    });
  },

  _modStandard() {
    const rolle = this._daten.rollen.filter((r) => r.rest_g != null).sort((a, b) => b.rest_g - a.rest_g)[0];
    const muster = this._modMusterId || this._modEinstellung("muster");
    return { tab: "uebersicht", fuellung: 15, waende: 2, duese: 0.4, schicht_h: 0.2, stuetzen: "keine", eingesetzt: {}, rolleId: this._modRolleId || (rolle && rolle.id),
      muster: FUELLMUSTER.some((x) => x.id === muster) ? muster : "grid", drehEigen: false, drehWerte: [0, 0, 0], drehFeld: 2 };
  },
  // Speicher für „Zuletzt geöffnet“: auf dem Server, wenn die Integration da ist
  _modSpeicher() {
    return this._konfig && this._hass && this._hass.fetchWithAuth ? modServer(this._hass) : MOD_DB;
  },
  async _modZuletztLaden() {
    this._modZuletztZeit = Date.now();
    const sp = this._modSpeicher();
    try {
      if (sp.aufServer && !this._modUmgezogen) {
        // Einmalig: Modelle, die bisher nur in diesem Browser lagen, auf den Server legen
        this._modUmgezogen = true;
        for (const z of (await MOD_DB.alle()).reverse()) {
          const x = await MOD_DB.holen(z.name);
          if (x) { await sp.speichern(x.name, x.daten); await MOD_DB.loeschen(z.name); }
        }
      }
      this._modZuletzt = await sp.alle();
      this._modZuletztServer = !!sp.aufServer;
    } catch (e) {
      this._modZuletzt = await MOD_DB.alle();   // Server nicht erreichbar: wenigstens die lokalen
      this._modZuletztServer = false;
    }
    if (this._ansicht === "modelle" && !this._mod) this._zeichnen();
  },
  _modRolle() { const m = this._mod; return this._daten.rollen.find((r) => r.id === (m && m.rolleId)) || null; },

  async _modDatei(datei, name) {
    name = name || datei.name;
    const groesse = datei instanceof ArrayBuffer ? datei.byteLength : datei.size;
    if (groesse > MOD_MAX_BYTES) { this._toast(`Die Datei ist mit ${zahl(groesse / 1048576)} MB zu groß (höchstens ${MOD_MAX_BYTES / 1048576} MB).`); return; }
    if (!groesse) { this._toast("Die Datei ist leer."); return; }
    let puffer;
    try { puffer = datei instanceof ArrayBuffer ? datei : await datei.arrayBuffer(); }
    catch (e) { this._toast("Die Datei konnte nicht gelesen werden."); return; }
    this._mod = { ...this._modStandard(), name, laedt: "Lese Datei …" };
    this._zeichnen();
    await new Promise((r) => setTimeout(r, 30));
    try {
      if (/\.stl$/i.test(name)) await this._modStl(puffer, name);
      else if (/\.3mf$/i.test(name)) {
        const zip = await zipDateien(puffer);
        const g = zip.dateien.find((d) => /plate_\d+\.gcode$/i.test(d.name)) || zip.dateien.find((d) => /\.gcode$/i.test(d.name));
        if (!g) throw new Error("In dieser 3MF ist kein G-Code. Bitte in Bambu Studio „Datei › Exportieren › G-Code exportieren“ (.gcode.3mf) benutzen.");
        this._mod.laedt = "Entpacke G-Code …"; this._zeichnen();
        this._modGcode(new TextDecoder().decode(await zip.lesen(g)), name);
      } else if (/\.gcode$/i.test(name)) this._modGcode(new TextDecoder().decode(puffer), name);
      else throw new Error("Unbekanntes Format. Erlaubt sind .stl, .gcode und .gcode.3mf.");
      const sp = this._modSpeicher();
      sp.speichern(name, puffer).catch(() => MOD_DB.speichern(name, puffer)).then(() => this._modZuletztLaden());
    } catch (e) {
      this._mod = null;
      this._toast(e.message || String(e));
      return;
    }
    this._zeichnen();
    if (this._buehne) this._buehne.ansicht("iso", this._mod.grenzen);
  },

  async _modStl(puffer, name) {
    const roh = stlLesen(puffer);
    if (!roh.length) throw new Error("In der STL wurden keine Dreiecke gefunden.");
    if (roh.length / 9 > MOD_MAX_DREIECKE) throw new Error(`Das Modell hat ${zahl(roh.length / 9)} Dreiecke, mehr als ${zahl(MOD_MAX_DREIECKE)} schafft der Browser nicht flüssig. Bitte im Slicer vereinfachen.`);
    if (roh.some((x) => !Number.isFinite(x))) throw new Error("Die STL enthält ungültige Koordinaten (beschädigte Datei).");
    const v = aufsBett(roh);
    const m = this._mod;
    Object.assign(m, { art: "stl", v, laedt: null });
    this._modGeometrieNeu();
  },

  _modGeometrieNeu() {
    const m = this._mod;
    m.grenzen = meshGrenzen(m.v);
    m.kenn = meshKennwerte(m.v);
    m.ueber = ueberhaenge(m.v);
    m.loecher = null; m.eingesetzt = {}; m.lochAuswahl = null; m.geloescht = [];
    m.schichten = null; m.schichtZahl = 0; m.schichtGewicht = null;
    const id = (m.id = (m.id || 0) + 1);
    setTimeout(() => {
      if (this._mod !== m || m.id !== id) return;
      m.loecher = loecherFinden(m.v, m.grenzen);
      if (this._ansicht === "modelle") { if (m.tab === "loecher") this._zeichnen(); else this._modSeiteNeu(); this._modMarker(); }
    }, 50);
    if (this._buehne) this._modSzene();
  },

  _modGcode(text, name) {
    const g = gcodeLesen(text);
    if (!g.schichten.length) throw new Error("Im G-Code wurden keine Druckwege gefunden.");
    const m = this._mod;
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (const s of g.schichten) {
      for (let i = 0; i < s.linien.length; i += 5) {
        if (s.linien[i + 4] === GCODE_ARTEN_NR.turm || s.linien[i + 4] === GCODE_ARTEN_NR.rand) continue;
        for (const [x, y] of [[s.linien[i], s.linien[i + 1]], [s.linien[i + 2], s.linien[i + 3]]]) {
          if (x < min[0]) min[0] = x; if (x > max[0]) max[0] = x; if (y < min[1]) min[1] = y; if (y > max[1]) max[1] = y;
        }
      }
      if (s.z < min[2]) min[2] = 0; if (s.z > max[2]) max[2] = s.z;
    }
    Object.assign(m, { art: "gcode", gcode: g, laedt: null, grenzen: { min, max, groesse: [max[0] - min[0], max[1] - min[1], max[2]] } });
    m.schichtHoehen = g.schichten.map((s) => s.z);
    m.schichtZahl = g.schichten.length;
    m.schichtNr = g.schichten.length;
    if (this._buehne) this._modSzene();
  },

  // Bühne einhängen (das Canvas bleibt beim Neuzeichnen erhalten)
  _modNachZeichnen() {
    const ort = this.shadowRoot.getElementById("mod-buehne");
    if (!ort) return;
    if (!this._buehne) {
      this._buehne = new Buehne();
      if (!this._buehne.ok) { ort.innerHTML = `<div class="dr-kamera-leer">Dieser Browser kann kein WebGL.</div>`; return; }
      this._buehne.nachZeichnen = () => { this._modMarkerSetzen(); this._modWuerfelNachfuehren(); };
      this._buehne.antippen = (strahl) => this._modAntippen(strahl);
      this._buehne.treffen = (strahl) => this._modTreffen(strahl);
      this._buehne.setzeOrbitArt(this._modOrbitArt);
      // Ein Tipp in die Ansicht schließt das Orbit-Menü (ohne Neuzeichnen, sonst ginge das Ziehen verloren)
      this._buehne.canvas.addEventListener("pointerdown", () => this._modMenueZu());
      this._modSzene();
      this._buehne.ansicht("iso", this._mod && this._mod.grenzen);
    }
    ort.appendChild(this._buehne.canvas);
    this._modWuerfelZiehenEinrichten();
    this._modWuerfelNachfuehren();
    if (!this._modRo) {
      this._modRo = new ResizeObserver(() => this._buehne && this._buehne.neu());
    }
    this._modRo.disconnect();
    this._modRo.observe(ort);
    this._modMarker();
    this._buehne.neu();
  },

  _modSzene() {
    const b = this._buehne, m = this._mod;
    if (!b || !m || m.laedt) return;
    for (const n of [...b.objekte.keys()]) if (!n.startsWith("bett")) b.weg(n);
    if (m.art === "stl") {
      const farbe = new Float32Array(m.v.length);
      const ueber = m.tab === "schichten" && m.stuetzen !== "keine" ? m.ueber.markiert : null;
      for (let t = 0; t < m.v.length / 9; t++) {
        const f = ueber && ueber[t] ? [1, 0.45, 0.3] : [0.24, 0.86, 0.64];
        for (let k = 0; k < 9; k += 3) { farbe[t * 9 + k] = f[0]; farbe[t * 9 + k + 1] = f[1]; farbe[t * 9 + k + 2] = f[2]; }
      }
      b.mesh("modell", m.v, farbe);
      this._modGrundriss();
      Object.entries(m.eingesetzt).forEach(([nr, id]) => this._modTeilZeigen(Number(nr), id, false));
      if (m.tab === "schichten") this._modSchichtenStarten();
      if (m.drehWerte && m.drehWerte.some((x) => Number(x))) setTimeout(() => this._modDrehVorschau(), 0);
    } else {
      this._modGcodeLinien();
    }
    this._modSchichtAnzeigen();
  },

  _modGrundriss() {
    const b = this._buehne, g = this._mod.grenzen;
    const zuGross = g.groesse.some((x) => x > BETT_MM + 0.01);
    const f = zuGross ? [1, 0.42, 0.42] : [0.24, 0.9, 0.66];
    const [x1, y1, x2, y2] = [g.min[0], g.min[1], g.max[0], g.max[1]];
    const l = [x1, y1, 0.05, x2, y1, 0.05, x2, y1, 0.05, x2, y2, 0.05, x2, y2, 0.05, x1, y2, 0.05, x1, y2, 0.05, x1, y1, 0.05];
    b.linien("grundriss", new Float32Array(l), new Float32Array(l.map((_, i) => f[i % 3])));
  },

  // ---- Löcher in der Ansicht ----
  _modMarker() {
    const box = this.shadowRoot.getElementById("mod-marker");
    const m = this._mod;
    if (!box || !m || m.art !== "stl" || !m.loecher || m.tab === "schichten") { if (box) box.innerHTML = ""; return; }
    box.innerHTML = m.loecher.map((l) => `<button class="mod-pin ${m.lochAuswahl === l.nr ? "an" : ""} ${m.eingesetzt[l.nr] ? "drin" : ""}" data-aktion="mod-loch" data-nr="${l.nr}" data-pin="${l.nr}">${l.nr}</button>`).join("");
    this._modMarkerSetzen();
  },
  _modMarkerSetzen() {
    const box = this.shadowRoot.getElementById("mod-marker");
    const m = this._mod;
    if (!box || !m || !m.loecher || !this._buehne) return;
    for (const l of m.loecher) {
      const pin = box.querySelector(`[data-pin="${l.nr}"]`);
      if (!pin) continue;
      const p = l.mitte.slice();
      p[l.achse] = l.oeffnung + l.richtung * 0.5;
      const s = this._buehne.projizieren(p);
      if (!s) { pin.style.display = "none"; continue; }
      pin.style.display = "";
      pin.style.transform = `translate(${s[0] - 11}px, ${s[1] - 40}px)`;   // über dem Loch, damit es sichtbar bleibt
    }
  },

  _modTeilZeigen(nr, id, animiert = true) {
    const m = this._mod, b = this._buehne;
    const loch = m.loecher && m.loecher.find((l) => l.nr === nr);
    const teil = this._daten.inventar.find((t) => t.id === id);
    if (!b || !loch || !teil) return;
    const geo = teilGeometrie(teil, loch);
    const name = `teil-${nr}`;
    b.mesh(name, insLoch(geo.v, loch), new Float32Array(geo.farben), { reihe: 2 });
    if (!animiert) return;
    // Von außen entlang der Lochachse hereinfliegen, mit kleinem Nachfedern
    const weg = [0, 0, 0];
    weg[loch.achse] = loch.richtung * 45;
    const start = performance.now(), dauer = 900;
    b.animieren((t) => {
      const x = Math.min(1, (t - start) / dauer);
      const e = 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);   // „easeOutBack“
      const f = 1 - e;
      b.setze(name, { m: M4.verschieben(weg[0] * f, weg[1] * f, weg[2] * f) });
      return x < 1;
    });
  },

  // ---- Schichten: vereinfachtes Slicen im Hintergrund ----
  _modSchichtenStarten() {
    const m = this._mod;
    const schluessel = `${m.duese}|${m.schicht_h}|${m.waende}|${m.fuellung}|${m.muster}|${m.stuetzen}|${m.id}`;
    if (m.schichtSchluessel === schluessel && (m.schichtFortschritt === 1 || m.schichtLaeuft)) { this._modSchichtAnzeigen(); return; }
    m.schichtSchluessel = schluessel;
    m.schichtLaeuft = true;
    m.schichtFortschritt = 0;
    const s = schnittVorbereiten(m.v, 2);
    const hoehe = m.grenzen.max[2];
    const zs = [];
    for (let z = m.schicht_h; z <= hoehe + 1e-6; z += m.schicht_h) zs.push(Math.min(z, hoehe - 0.01) - m.schicht_h / 2);
    const massivUnten = Math.ceil(0.6 / m.schicht_h), massivOben = Math.ceil(0.8 / m.schicht_h);
    const linien = [], farben = [], enden = [];
    let laenge = 0, stuetzLaenge = 0;
    const stuetzen = m.stuetzen !== "keine" ? this._modStuetzen(m) : [];
    let i = 0;
    const schritt = () => {
      if (this._mod !== m || m.schichtSchluessel !== schluessel) return;
      const bis = Math.min(zs.length, i + 8);
      for (; i < bis; i++) {
        const z = zs[i], zz = z + m.schicht_h / 2;
        const sch = schichtBerechnen(s, z, { duese: m.duese, waende: m.waende, fuellung: m.fuellung, muster: m.muster, hoehe, nr: i, massiv: i < massivUnten || i >= zs.length - massivOben });
        const add = (a, b, f) => { linien.push(a[0], a[1], zz, b[0], b[1], zz); farben.push(...f, ...f); return Math.hypot(b[0] - a[0], b[1] - a[1]); };
        for (const [art, zuege] of [["aussen", sch.aussen], ["innen", sch.innen]]) {
          for (const zug of zuege) for (let k = 0; k < zug.length; k++) laenge += add(zug[k], zug[(k + 1) % zug.length], LINIEN_FARBEN[art]);
        }
        for (const [a, b] of sch.fuellung) laenge += add(a, b, LINIEN_FARBEN.fuellung);
        for (const st of stuetzen) for (const [a, b] of st) {
          // Strecke a→b (3D) in dieser Schicht?
          if ((a[2] <= zz && b[2] >= zz) || (b[2] <= zz && a[2] >= zz)) {
            const f = Math.abs(b[2] - a[2]) < 1e-6 ? 0 : (zz - a[2]) / (b[2] - a[2]);
            const x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f;
            const r = st.dicke || 0.6;
            stuetzLaenge += add([x - r, y], [x + r, y], LINIEN_FARBEN.stuetze) + add([x, y - r], [x, y + r], LINIEN_FARBEN.stuetze);
          }
        }
        enden.push(linien.length / 3);
      }
      m.schichtFortschritt = i / zs.length;
      const status = this.shadowRoot.getElementById("mod-schicht-status");
      if (i < zs.length) {
        if (status) status.innerHTML = this._modSchichtStatusHtml();
        setTimeout(schritt, 0);
        return;
      }
      const querschnitt = m.duese * 1.05 * m.schicht_h;
      const dichte = materialInfo(this._modRolle() ? this._modRolle().material : "PLA").dichte;
      Object.assign(m, {
        schichtLaeuft: false, schichtFortschritt: 1, schichtEnden: enden, schichtHoehen: zs.map((z) => z + m.schicht_h / 2),
        schichtZahl: zs.length, schichtNr: Math.min(m.schichtNr || zs.length, zs.length) || zs.length,
        schichtGewicht: ((laenge + stuetzLaenge) * querschnitt * dichte) / 1000, stuetzGewicht: (stuetzLaenge * querschnitt * dichte) / 1000,
        schichtLinien: new Float32Array(linien), schichtFarben: new Float32Array(farben),
      });
      if (this._ansicht === "modelle" && m.tab === "schichten") { this._zeichnen(); this._modSchichtAnzeigen(); }
    };
    setTimeout(schritt, 0);
  },

  // Stützen als 3D-Strecken: Normal = senkrechte Säulen im Raster, Baum = Äste zu Stämmen
  _modStuetzen(m) {
    const v = m.v, ueber = m.ueber.markiert;
    const raster = m.stuetzen === "normal" ? 2.5 : 4;
    const punkte = [];
    const gesehen = new Set();
    for (let t = 0; t < ueber.length && punkte.length < 600; t++) {
      if (!ueber[t]) continue;
      const i = t * 9;
      const xs = [v[i], v[i + 3], v[i + 6]], ys = [v[i + 1], v[i + 4], v[i + 7]];
      for (let x = Math.ceil(Math.min(...xs) / raster) * raster; x <= Math.max(...xs); x += raster) {
        for (let y = Math.ceil(Math.min(...ys) / raster) * raster; y <= Math.max(...ys); y += raster) {
          const k = `${x}|${y}`;
          if (gesehen.has(k)) continue;
          // Punkt im Dreieck? Höhe dort berechnen
          const d = (ys[1] - ys[2]) * (xs[0] - xs[2]) + (xs[2] - xs[1]) * (ys[0] - ys[2]);
          if (Math.abs(d) < 1e-9) continue;
          const l1 = ((ys[1] - ys[2]) * (x - xs[2]) + (xs[2] - xs[1]) * (y - ys[2])) / d, l2 = ((ys[2] - ys[0]) * (x - xs[2]) + (xs[0] - xs[2]) * (y - ys[2])) / d;
          if (l1 < 0 || l2 < 0 || l1 + l2 > 1) continue;
          gesehen.add(k);
          const z = l1 * v[i + 2] + l2 * v[i + 5] + (1 - l1 - l2) * v[i + 8];
          punkte.push([x, y, z, this._modBodenUnter(v, x, y, z)]);
        }
      }
    }
    if (m.stuetzen === "normal") return punkte.map(([x, y, z, boden]) => Object.assign([[[x, y, boden], [x, y, z]]], { dicke: 0.9 }));
    // Bäume: Punkte nach Boden-Höhe und 12-mm-Feldern bündeln, Stamm in der Mitte
    const dicke = m.stuetzen === "baum-stark" ? 1.4 : m.stuetzen === "baum-hybrid" ? 1.1 : 0.8;
    const gruppen = new Map();
    for (const p of punkte) {
      const k = `${Math.round(p[0] / 12)}|${Math.round(p[1] / 12)}|${Math.round(p[3])}`;
      if (!gruppen.has(k)) gruppen.set(k, []);
      gruppen.get(k).push(p);
    }
    const baeume = [];
    for (const g of gruppen.values()) {
      const cx = g.reduce((s, p) => s + p[0], 0) / g.length, cy = g.reduce((s, p) => s + p[1], 0) / g.length;
      const boden = Math.max(...g.map((p) => p[3]));
      const zMin = Math.min(...g.map((p) => p[2]));
      const gabel = boden + (zMin - boden) * 0.55;
      const aeste = g.map((p) => [[cx, cy, gabel], [p[0], p[1], p[2]]]);
      baeume.push(Object.assign([[[cx, cy, boden], [cx, cy, gabel]]], { dicke: dicke * 1.6 }));
      aeste.forEach((a) => baeume.push(Object.assign([a], { dicke })));
    }
    return baeume;
  },
  _modBodenUnter(v, x, y, z) {
    let boden = 0;
    for (let i = 0; i < v.length; i += 9) {
      const ax = v[i], ay = v[i + 1], bx = v[i + 3], by = v[i + 4], cx = v[i + 6], cy = v[i + 7];
      const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
      if (Math.abs(d) < 1e-9) continue;
      const l1 = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / d, l2 = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / d;
      if (l1 < 0 || l2 < 0 || l1 + l2 > 1) continue;
      const h = l1 * v[i + 2] + l2 * v[i + 5] + (1 - l1 - l2) * v[i + 8];
      if (h < z - 0.3 && h > boden) boden = h;
    }
    return boden;
  },

  _modGcodeLinien() {
    const m = this._mod, g = m.gcode;
    const linien = [], farben = [], enden = [];
    for (const s of g.schichten) {
      const l = s.linien;
      for (let i = 0; i < l.length; i += 5) {
        const f = LINIEN_FARBEN[GCODE_ARTEN_LISTE[l[i + 4]]] || [1, 1, 1];
        linien.push(l[i], l[i + 1], s.z, l[i + 2], l[i + 3], s.z);
        farben.push(...f, ...f);
      }
      enden.push(linien.length / 3);
    }
    m.schichtEnden = enden;
    this._buehne.linien("wege", new Float32Array(linien), new Float32Array(farben), { dunkel: 0.55 });
  },

  _modSchichtAnzeigen() {
    const m = this._mod, b = this._buehne;
    if (!b || !m) return;
    const schichten = m.tab === "schichten" || m.art === "gcode";
    const modell = b.objekte.get("modell");
    if (modell) b.setze("modell", schichten ? { sichtbar: true, alpha: 0.08 } : { sichtbar: true, alpha: 1 });
    for (const [n] of b.objekte) if (n.startsWith("teil-")) b.setze(n, { sichtbar: !schichten });
    if (m.art === "stl" && schichten && m.schichtLinien && m.schichtFortschritt === 1) {
      if (!b.objekte.has("wege") || m.schichtWegeSchluessel !== m.schichtSchluessel) {
        b.linien("wege", m.schichtLinien, m.schichtFarben, { dunkel: 0.32 });   // tiefere Schichten deutlich dunkler, damit das Muster der aktuellen hervorsticht
        m.schichtWegeSchluessel = m.schichtSchluessel;
      }
    } else if (m.art === "stl" && !schichten) b.weg("wege");
    if (b.objekte.has("wege") && m.schichtEnden) {
      const nr = Math.max(1, Math.min(m.schichtNr || 1, m.schichtEnden.length));
      b.setze("wege", { bis: m.schichtEnden[nr - 1], hoehe: m.schichtHoehen[nr - 1] });
    }
  },

  _modSeiteNeu() {
    const box = this.shadowRoot.querySelector(".mod-inhalt");
    if (box) { const sc = box.scrollTop; box.innerHTML = this._mod.tab === "loecher" ? this._modLoecherHtml() : this._mod.tab === "schichten" ? this._modSchichtenHtml() : this._modUebersichtHtml(); box.scrollTop = sc; this._auswahlenBauen(); }
    const tab = this.shadowRoot.querySelector('[data-aktion="mod-tab"][data-id="loecher"]');
    if (tab && this._mod.loecher) tab.textContent = `Löcher (${this._mod.loecher.length})`;
  },

  // ---- Ereignisse ----
  _modKlick(a, el) {
    const m = this._mod;
    if (!["mod-orbit-menue", "mod-orbit-art", "mod-wuerfel-ziehen"].includes(a)) this._modMenueZu();
    switch (a) {
      case "mod-ansicht": if (this._buehne) this._buehne.ansicht(el.dataset.id, m && m.grenzen, true); return;
      case "mod-orbit-menue": this._modOrbitMenue = !this._modOrbitMenue; break;
      case "mod-orbit-art":
        this._modOrbitArt = el.dataset.id === "frei" ? "frei" : "eingeschraenkt";
        this._modEinstellung("orbit", this._modOrbitArt);
        if (this._buehne) this._buehne.setzeOrbitArt(this._modOrbitArt);
        this._modOrbitMenue = false;
        this._toast(this._modOrbitArt === "frei" ? "Orbit: frei drehen" : "Eingeschränkter Orbit: oben bleibt oben");
        break;
      case "mod-wuerfel-ziehen":
        this._modWuerfelZiehen = !this._modWuerfelZiehen;
        this._modEinstellung("wuerfel-ziehen", this._modWuerfelZiehen ? "1" : "0");
        break;
      case "mod-wuerfel": {
        if (performance.now() - (this._modWuerfelGezogen || -1e9) < 350 || !this._buehne) return;   // war Ziehen, kein Klick
        const b = this._buehne;
        b.fliegen(el.dataset.d.split(",").map(Number), b.mitte || b.ziel, b.abstand, true);
        return;
      }
      case "mod-dreh-eigen": m.drehEigen = !m.drehEigen; if (!m.drehEigen) { m.drehWerte = [0, 0, 0]; this._modDrehVorschau(); } this._modSeiteNeu(); return;
      case "mod-dreh-plus": {
        const i = m.drehFeld ?? 2;
        m.drehWerte[i] = Math.round(((Number(m.drehWerte[i]) || 0) + Number(el.dataset.g)) * 10) / 10;
        if (m.drehWerte[i] > 360 || m.drehWerte[i] < -360) m.drehWerte[i] %= 360;
        const f = this.shadowRoot.getElementById(`mod-dreh-${i}`);
        if (f) f.value = m.drehWerte[i];
        this._modDrehVorschau();
        return;
      }
      case "mod-dreh-null":
        m.drehWerte = [0, 0, 0];
        [0, 1, 2].forEach((i) => { const f = this.shadowRoot.getElementById(`mod-dreh-${i}`); if (f) f.value = 0; });
        this._modDrehVorschau();
        return;
      case "mod-dreh-anwenden": {
        if (!m.drehWerte.some((x) => Number(x))) { this._toast("Erst einen Winkel eingeben."); return; }
        const text = ["X", "Y", "Z"].map((n, i) => (Number(m.drehWerte[i]) ? `${n} ${zahl(Number(m.drehWerte[i]), 1)}°` : "")).filter(Boolean).join(", ");
        drehenGrad(m.v, m.drehWerte);
        m.drehWerte = [0, 0, 0];
        this._modGeometrieNeu();
        if (this._buehne) this._buehne.ansicht("iso", m.grenzen, true);
        this._toast(`Gedreht um ${text}.`);
        break;
      }
      case "mod-schliessen": this._mod = null; if (this._buehne) for (const n of [...this._buehne.objekte.keys()]) if (!n.startsWith("bett")) this._buehne.weg(n); break;
      case "mod-tab":
        m.tab = el.dataset.id;
        this._zeichnen();
        this._modSzene();
        return;
      case "mod-drehen":
        drehen90(m.v, Number(el.dataset.achse), 1);
        m.drehWerte = [0, 0, 0];
        this._modGeometrieNeu();
        if (this._buehne) this._buehne.ansicht("iso", m.grenzen);
        break;
      case "mod-loch":
        m.tab = "loecher";
        m.lochAuswahl = m.lochAuswahl === Number(el.dataset.nr) ? null : Number(el.dataset.nr);
        this._zeichnen();
        this._modSchichtAnzeigen();
        return;
      case "mod-einsetzen":
        m.eingesetzt[el.dataset.nr] = el.dataset.id;
        this._modTeilZeigen(Number(el.dataset.nr), el.dataset.id, true);
        break;
      case "mod-raus": delete m.eingesetzt[el.dataset.nr]; if (this._buehne) this._buehne.weg(`teil-${el.dataset.nr}`); break;
      case "mod-alle-einsetzen": {
        let verzoegerung = 0;
        for (const l of m.loecher || []) {
          const v = teileFuerLoch(l, this._daten.inventar)[0];
          if (!v || m.eingesetzt[l.nr]) continue;
          m.eingesetzt[l.nr] = v.teil.id;
          setTimeout(() => this._modTeilZeigen(l.nr, v.teil.id, true), verzoegerung);
          verzoegerung += 250;
        }
        break;
      }
      case "mod-alle-raus": Object.keys(m.eingesetzt).forEach((nr) => this._buehne && this._buehne.weg(`teil-${nr}`)); m.eingesetzt = {}; break;
      case "mod-duese": {
        m.duese = Number(el.dataset.id);
        const [lo, hi, std] = SCHICHT_BEREICH[m.duese] || [0.08, 0.28, 0.2];
        if (m.schicht_h < lo || m.schicht_h > hi) m.schicht_h = std;
        this._zeichnen(); this._modSchichtenStarten();
        return;
      }
      case "mod-stuetzen": m.stuetzen = el.dataset.id; this._zeichnen(); this._modSzene(); return;
      case "mod-markieren": m.markieren = !m.markieren; m.tab = "loecher"; break;
      case "mod-loch-art": { const l = m.loecher.find((x) => x.nr === Number(el.dataset.nr)); if (l) { l.durch = el.dataset.durch === "1"; this._modLochGrenzen(l); } this._modSeiteNeu(); return; }
      case "mod-loch-weg": {
        const nr = Number(el.dataset.nr);
        const weg = m.loecher.find((x) => x.nr === nr);
        if (weg && !weg.manuell) (m.geloescht = m.geloescht || []).push(weg);
        m.loecher = m.loecher.filter((x) => x.nr !== nr);
        delete m.eingesetzt[nr];
        if (this._buehne) this._buehne.weg(`teil-${nr}`);
        m.lochAuswahl = null;
        break;
      }
      case "mod-loch-zurueck":
        m.loecher = m.loecher.concat(m.geloescht || []).sort((a, b) => a.nr - b.nr);
        m.geloescht = [];
        break;
      case "mod-stuetzen-hilfe": this._dialog = "mod-stuetzen"; break;
      case "mod-schicht": this._modSchichtSetzen((m.schichtNr || 1) + Number(el.dataset.d)); return;
      case "mod-zuletzt":
        (this._modZuletztServer ? this._modSpeicher() : MOD_DB).holen(el.dataset.name)
          .catch(() => null)
          .then((x) => x ? this._modDatei(x.daten, x.name) : this._toast("Datei nicht mehr gespeichert."));
        return;
      case "mod-zuletzt-weg":
        (this._modZuletztServer ? this._modSpeicher() : MOD_DB).loeschen(el.dataset.name).catch(() => {});
        this._modZuletzt = (this._modZuletzt || []).filter((z) => z.name !== el.dataset.name);
        break;
      default: return;
    }
    this._zeichnen();
  },

  // Loch von Hand: Strahl gegen alle Dreiecke (Möller–Trumbore), nächster Treffer zählt
  _modAntippen(strahl) {
    const m = this._mod;
    if (!m || !m.markieren || m.art !== "stl") return;
    const o = strahl.von, d = strahl.richtung;
    const h = strahlTreffer(m.v, o, d);
    const best = h ? h.t : Infinity;
    let n = h ? h.n : null;
    if (!n) { this._toast("Da ist kein Modell. Tippe direkt auf die Oberfläche."); return; }
    const treffer = [0, 1, 2].map((i) => o[i] + d[i] * best);
    // Normale zur Kamera drehen = nach außen; Lochachse = größte Komponente
    if (n[0] * d[0] + n[1] * d[1] + n[2] * d[2] > 0) n = n.map((x) => -x);
    const achse = [0, 1, 2].reduce((a, i) => (Math.abs(n[i]) > Math.abs(n[a]) ? i : a), 0);
    const nr = Math.max(0, ...m.loecher.map((l) => l.nr)) + 1;
    const l = { nr, achse, durchmesser: 4.2, tiefe: 6, durch: false, mitte: treffer, oeffnung: treffer[achse], richtung: Math.sign(n[achse]) || 1, manuell: true };
    this._modLochGrenzen(l);
    m.loecher.push(l);
    m.markieren = false;
    m.lochAuswahl = nr;
    this._zeichnen();
  },
  // Drehpunkt für den Orbit: Abstand entlang des Strahls bis zum Modell oder null
  _modTreffen(strahl) {
    const m = this._mod;
    if (!m || m.art !== "stl" || !m.v || m.laedt) return null;
    const h = strahlTreffer(m.v, strahl.von, strahl.richtung);
    return h ? h.t : null;
  },
  // Vorschau für eigene Winkel: das Modell wird nur in der Ansicht gedreht
  _modDrehVorschau() {
    const m = this._mod, b = this._buehne;
    if (!m || !b || m.art !== "stl") return;
    const aktiv = m.drehWerte && m.drehWerte.some((x) => Number(x));
    const c = [0, 1, 2].map((i) => (m.grenzen.min[i] + m.grenzen.max[i]) / 2);
    const R = aktiv ? drehMatrix(m.drehWerte) : null;
    const mat = aktiv ? M4.drehungUm(R, c) : M4.eins();
    if (aktiv) {
      // Wie beim Anwenden: der tiefste Punkt liegt immer auf dem Druckbett
      const v = m.v;
      let unten = Infinity;
      for (let i = 0; i < v.length; i += 3) {
        const z = R[6] * (v[i] - c[0]) + R[7] * (v[i + 1] - c[1]) + R[8] * (v[i + 2] - c[2]);
        if (z < unten) unten = z;
      }
      mat[14] = -unten - (R[6] * c[0] + R[7] * c[1] + R[8] * c[2]);
    }
    b.setze("modell", { m: mat });
    b.setze("grundriss", { sichtbar: !aktiv });
    for (const [n] of b.objekte) if (n.startsWith("teil-")) b.setze(n, { sichtbar: !aktiv && m.tab !== "schichten" });
    const box = this.shadowRoot.getElementById("mod-marker");
    if (box) box.classList.toggle("versteckt", !!aktiv);
  },
  _modLochGrenzen(l) {
    const ende = l.oeffnung - l.richtung * l.tiefe;
    l.von = Math.min(l.oeffnung, ende); l.bis = Math.max(l.oeffnung, ende);
  },

  _modSchichtSetzen(nr) {
    const m = this._mod;
    m.schichtNr = Math.max(1, Math.min(m.schichtZahl || 1, nr));
    const r = this.shadowRoot.querySelector('[data-mod="schicht"]');
    if (r) r.value = m.schichtNr;
    const t = this.shadowRoot.getElementById("mod-schicht-text");
    if (t) t.textContent = this._modSchichtText();
    this._modSchichtAnzeigen();
  },

  _modEingabe(t) {
    const k = t.dataset && t.dataset.mod;
    if (!k || !this._mod) return false;
    const m = this._mod;
    if (k === "schicht") { this._modSchichtSetzen(Number(t.value)); return true; }
    if (k === "dreh-grad") {
      const i = Number(t.dataset.achse), w = Number(String(t.value).replace(",", "."));
      m.drehFeld = i;
      m.drehWerte[i] = Number.isFinite(w) ? Math.max(-360, Math.min(360, w)) : 0;
      this._modDrehVorschau();
      return true;
    }
    if (k === "loch-d" || k === "loch-t") {
      const l = m.loecher && m.loecher.find((x) => x.nr === Number(t.dataset.nr));
      if (!l) return true;
      if (k === "loch-d") l.durchmesser = Number(t.value); else l.tiefe = Number(t.value);
      this._modLochGrenzen(l);
      const w = this.shadowRoot.getElementById(`mod-wert-${k}-${l.nr}`);
      if (w) w.textContent = `${zahl(Number(t.value), 2)} mm`;
      return true;
    }
    if (["fuellung", "waende", "schicht_h"].includes(k)) {
      m[k] = Number(t.value);
      const w = this.shadowRoot.getElementById(`mod-wert-${k}`);
      if (w) w.textContent = `${zahl(m[k], k === "schicht_h" ? 2 : 0)}${k === "fuellung" ? " %" : k === "schicht_h" ? " mm" : ""}`;
      const g = this.shadowRoot.getElementById("mod-gewicht");
      if (g && m.art === "stl") {
        const rolle = this._modRolle();
        const gew = gewichtSchaetzen(m.kenn, materialInfo(rolle ? rolle.material : "PLA").dichte, { duese: m.duese, waende: m.waende, fuellung: m.fuellung });
        g.innerHTML = this._modGewichtHtml(gew, rolle && rolle.rest_g != null ? rolle.rest_g - gew.gramm : null, rolle);
      }
      return true;
    }
    return false;
  },

  _modAenderung(t) {
    const k = t.dataset && t.dataset.mod;
    if (!k) return false;
    if (k === "datei") { const f = t.files && t.files[0]; this._dialog = null; if (f) this._modDatei(f); return true; }
    const m = this._mod;
    if (!m) return false;
    if (k === "rolle") { m.rolleId = this._modRolleId = t.value; this._zeichnen(); return true; }
    if (k === "dreh-grad") return true;
    if (k === "muster") {
      if (!FUELLMUSTER.some((x) => x.id === t.value)) return true;
      m.muster = this._modMusterId = t.value;
      this._modEinstellung("muster", t.value);
      this._modSeiteNeu();
      if (m.art === "stl" && m.tab === "schichten") this._modSchichtenStarten();
      return true;
    }
    if (k === "loch-d" || k === "loch-t") {
      const nr = Number(t.dataset.nr);
      if (m.eingesetzt[nr]) this._modTeilZeigen(nr, m.eingesetzt[nr], false);
      this._modSeiteNeu();
      return true;
    }
    if (["fuellung", "waende", "schicht_h"].includes(k) && m.tab === "schichten" && m.art === "stl") { this._modSchichtenStarten(); this._modSeiteNeu(); return true; }
    return ["fuellung", "waende", "schicht_h", "schicht"].includes(k);
  },
};

// ============================================================================
// Hilfe › Kunststoffe (Materialien und Unterarten) und Fehlercodes des Druckers
// ============================================================================
const KunststoffAnsicht = {
  _hiKunststoffeHtml() { return `<div class="karte"><p class="leise">Kommt gleich.</p></div>`; },
  _ksKlick(a, el) { this._zeichnen(); },
  _hiCodesHtml() { return `<div class="karte"><p class="leise">Kommt gleich.</p></div>`; },
};

// ============================================================================
// Start: die wichtigsten aktuellen Infos auf einen Blick, jede Kachel führt zu den Details
// ============================================================================
const StartAnsicht = {
  _stHtml() { return `<div class="karte"><h2>Übersicht</h2><p class="leise">Kommt gleich.</p></div>`; },
  _stKlick(a, el) { this._zeichnen(); },
};

// ============================================================================
// Shop: Preisrechner, Produkte, Aufträge, Kleinunternehmer-Grenze, Düsenvergleich
// ============================================================================
const ShopAnsicht = {
  _shHtml() { return `<div class="karte"><h2>Shop</h2><p class="leise">Kommt gleich.</p></div>`; },
  _shKlick(a, el) { this._zeichnen(); },
};

// ============================================================================
// Notizbuch: alle Notizen an einem Ort (Rollen, Fehldrucke, Drucke) plus eigene Einträge und Erinnerungen
// ============================================================================
const NotizAnsicht = {
  _nbHtml() { return `<div class="karte"><h2>Notizbuch</h2><p class="leise">Kommt gleich.</p></div>`; },
  _nbKlick(a, el) { this._zeichnen(); },
};
// ---------------------------------------------------------------------------
// Die Seite selbst: ein Web-Component, das Home Assistant als Panel lädt.
// Daten liegen in Home Assistant (frontend/user_data), also in den HA-Backups.
// ---------------------------------------------------------------------------

const VERSION = "0.12.0";
const SPEICHER_KEY = "filament_werkstatt";
const SICHERUNG_KEY = "filament_werkstatt_sicherung";
// Drucker-Werte, die für Protokoll und Verbuchen gebraucht werden (Schlüssel wie in drucker.js)
const DRUCKER_WICHTIG = ["status", "name", "gewicht", "laenge", "duese_ziel", "bett_ziel", "start", "fortschritt", "duese_mm", "duese", "bett"];

const NAVIGATION = [
  { id: "start", name: "Start", icon: "🏠" },
  { id: "filament", name: "Filament", icon: "🧵" },
  { id: "inventar", name: "Inventar", icon: "🔩" },
  { id: "drucker", name: "Drucker", icon: "🖨️" },
  { id: "modelle", name: "3D-Modelle", kurz: "3D", icon: "🧊" },
  { id: "werkstatt", name: "Werkstatt", icon: "🧰" },
  { id: "hilfe", name: "Hilfe", icon: "💡" },
  { id: "shop", name: "Shop", icon: "🛒" },
  { id: "notiz", name: "Notizbuch", kurz: "Notizen", icon: "📓" },
  { id: "nerd", name: "Nerd", icon: "🤓", nurIcon: true },
  { id: "system", name: "System", icon: "⚙️", nurIcon: true },
];
// Handy: diese Bereiche unten, der Rest im „Mehr“-Menü
const NAV_UNTEN = ["start", "filament", "inventar", "drucker", "modelle"];

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
    // Startansicht: Übersicht (Tests können per window.__fwStartAnsicht eine andere wählen)
    this._ansicht = window.__fwStartAnsicht || "start";
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
    else { this._drHassNeu(); this._buHassNeu(); }
  }
  set narrow(n) {
    if (this._narrow !== !!n) { this._narrow = !!n; this._zeichnen(); }
  }
  set panel(_) {}

  connectedCallback() {
    // Home Assistant kann Werte setzen, bevor der Lader das Element definiert hat.
    // Diese liegen dann als einfache Eigenschaften vor und überdecken die Setter.
    for (const k of ["narrow", "panel", "route", "hass"]) {
      if (Object.prototype.hasOwnProperty.call(this, k)) {
        const wert = this[k];
        delete this[k];
        this[k] = wert;
      }
    }
    if (!this._ro) {
      this._ro = new ResizeObserver((e) => {
        const mobil = e[0].contentRect.width < 720;
        if (mobil !== this._mobil) { this._mobil = mobil; this._zeichnen(); }
      });
      this.shadowRoot.addEventListener("click", (e) => this._sicher(() => this._klick(e)));
      this.shadowRoot.addEventListener("input", (e) => this._sicher(() => this._eingabe(e)));
      this.shadowRoot.addEventListener("change", (e) => this._sicher(() => this._aenderung(e)));
      this.shadowRoot.addEventListener("scroll", (e) => { this._ddBeimScrollen(e.target); }, true);
      this.shadowRoot.addEventListener("keydown", (e) => this._sicher(() => this._taste(e)));
      this._tasteGlobal = (e) => { if ((e.key === "k" && (e.ctrlKey || e.metaKey)) && this.isConnected && this._daten) { e.preventDefault(); this._sucheOeffnen(); } };
      window.addEventListener("keydown", this._tasteGlobal);
      // Zurück im Tab/App: neuere Daten von einem anderen Gerät holen
      this._sichtbar = () => { if (document.visibilityState === "visible") { this._fremdeAenderungPruefen(); this._updatePruefen(); } };
      this._updateTimer = setInterval(() => this._updatePruefen(), 30 * 60000);
      document.addEventListener("visibilitychange", this._sichtbar);
      this._wischenEinrichten();
      this._reglerEinrichten();
    }
    this._ro.observe(this);
    this._zeichnen();
  }
  disconnectedCallback() { this._ro && this._ro.disconnect(); }

  // Fehler in einem Klick soll nicht die ganze Seite lahmlegen
  _sicher(f) {
    try { f(); } catch (e) {
      console.error("Filament-Werkstatt:", e);
      this._dialog = null;
      this._toast(`Da ist etwas schiefgelaufen: ${e.message || e}`);
    }
  }

  _taste(e) {
    if (e.key === "Escape") {
      this._ddZu();
      if (this._sucheOffen || this._mehrOffen) { this._sucheOffen = false; this._mehrOffen = false; this._zeichnen(); }
      else if (this._dialog && !["bu", "sich-import", "konflikt"].includes(this._dialog)) { this._dialog = null; this._zeichnen(); }
      return;
    }
    if (this._drTaste(e)) return;
    if (e.key === "Enter" && e.target.id === "global-suche") {
      const erst = this.shadowRoot.querySelector(".such-treffer");
      if (erst) erst.click();
    }
  }

  // ---- Laden und Speichern ------------------------------------------------
  async _laden() {
    this._fehler = null;
    await this._konfigLaden();
    try {
      const r = await this._hass.callWS({ type: "frontend/get_user_data", key: SPEICHER_KEY });
      if (r && r.value && Array.isArray(r.value.rollen)) {
        // Sicherung des letzten Stands, bevor in dieser Sitzung etwas geändert wird
        this._hass.callWS({ type: "frontend/set_user_data", key: SICHERUNG_KEY, value: r.value }).catch(() => {});
        const alt = r.value.version;
        this._standGeladen = r.value.geaendert || null;
        this._daten = migrieren(JSON.parse(JSON.stringify(r.value)));
        if (alt !== this._daten.version) await this._speichernJetzt(true);
      } else {
        this._daten = standardDaten();
        await this._speichernJetzt(true);
      }
      this._drVerlaufLaden();
    } catch (e) {
      this._fehler = e.message || String(e);
    }
    this._zeichnen();
  }

  // Drucker, Steckdose und Druckliste aus der Einrichtung der Integration
  async _konfigLaden() {
    try {
      const k = await this._hass.callWS({ type: "filament_werkstatt/einstellungen" });
      this._konfig = k && k.liste ? k : null;
    } catch (e) {
      this._konfig = null;   // ältere Einrichtung ohne Integration: Suche über Namen
    }
    this._drCache = null;
  }

  _speichern() {
    this._speicherStatus = "speichert";
    this._ungespeichert = true;
    this._statusZeigen();
    clearTimeout(this._speicherTimer);
    clearTimeout(this._wiederholTimer);
    this._speicherTimer = setTimeout(() => this._speichernJetzt(), 500);
  }

  // Vor dem Schreiben prüfen, ob ein anderes Gerät inzwischen gespeichert hat.
  // Schlägt das Speichern fehl, nach 3 s, 10 s und 30 s nochmal versuchen.
  async _speichernJetzt(erzwingen = false) {
    if (!this._daten || this._konflikt) return;
    try {
      if (!erzwingen && this._standGeladen) {
        const r = await this._hass.callWS({ type: "frontend/get_user_data", key: SPEICHER_KEY });
        const fremd = r && r.value && r.value.geaendert;
        if (fremd && fremd > this._standGeladen) {
          this._konflikt = { am: fremd };
          this._dialog = "konflikt";
          this._speicherStatus = "fehler";
          this._zeichnen();
          return;
        }
      }
      this._daten.geaendert = new Date().toISOString();
      await this._hass.callWS({ type: "frontend/set_user_data", key: SPEICHER_KEY, value: this._daten });
      this._standGeladen = this._daten.geaendert;
      this._speicherStatus = "gespeichert";
      this._ungespeichert = false;
      this._versuche = 0;
    } catch (e) {
      this._speicherStatus = "fehler";
      this._versuche = (this._versuche || 0) + 1;
      if (this._versuche <= 3) this._wiederholTimer = setTimeout(() => this._speichernJetzt(erzwingen), [3000, 10000, 30000][this._versuche - 1]);
    }
    this._statusZeigen();
  }

  async _fremdeAenderungPruefen() {
    if (!this._hass || !this._daten || this._ungespeichert || this._modus || this._dialog || this._konflikt) return;
    try {
      const r = await this._hass.callWS({ type: "frontend/get_user_data", key: SPEICHER_KEY });
      const v = r && r.value;
      if (v && v.geaendert && this._standGeladen && v.geaendert > this._standGeladen && Array.isArray(v.rollen) && !this._ungespeichert && !this._modus && !this._dialog) {
        this._daten = migrieren(JSON.parse(JSON.stringify(v)));
        this._standGeladen = v.geaendert;
        this._toast("Neuere Daten von einem anderen Gerät geladen.");
      }
    } catch (e) { /* offline: beim nächsten Mal */ }
  }

  _statusZeigen() {
    const el = this.shadowRoot.getElementById("speicher");
    if (el) el.outerHTML = this._speicherHtml();
  }

  _speicherHtml() {
    const s = this._speicherStatus;
    const text = s === "speichert" ? "Speichert …" : s === "gespeichert" ? "Gespeichert" : s === "fehler" ? (this._konflikt ? "Nicht gespeichert" : this._versuche && this._versuche <= 3 ? "Speichern fehlgeschlagen, neuer Versuch …" : "Speichern fehlgeschlagen") : "";
    return `<span id="speicher" class="speicher ${s}" title="${text}">${text}</span>`;
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
    this._toastKnopf = null;
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
    if (a.startsWith("mod-")) { this._modKlick(a, el); return; }
    if (a.startsWith("bu-")) { this._buKlick(a, el); return; }
    if (a.startsWith("hi-")) { this._hiKlick(a, el); return; }
    if (a.startsWith("ws-")) { this._wsKlick(a, el); return; }
    if (a.startsWith("ne-")) { this._neKlick(a, el); return; }
    if (a.startsWith("st-")) { this._stKlick(a, el); return; }
    if (a.startsWith("sh-")) { this._shKlick(a, el); return; }
    if (a.startsWith("nb-")) { this._nbKlick(a, el); return; }
    if (this._exKlick(a, el)) return;
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
        if (!this._schliessen()) return;
        this._ansicht = el.dataset.id;
        this._filterAuf = false;
        this._sucheOffen = false; this._mehrOffen = false;
        if (this._ansicht === "werkstatt" && ["bibliothek", "fehl"].includes(this._wsZustand().tab)) this._wsFotos();
        if (this._ansicht === "system") this._systemcheck();
        break;
      case "alle":
        this._f = { sorte: "", hersteller: "", farbe: "", status: "" };
        this._suche = "";
        break;
      case "status": this._f = { sorte: "", hersteller: "", farbe: "", status: el.dataset.id }; break;
      case "oeffnen-filament":
        if (!this._daten.rollen.some((x) => x.id === el.dataset.id)) return;
        if (this._modus && !this._schliessen()) return;
        this._ansicht = "filament"; this._sucheOffen = false; this._mehrOffen = false;
        // fall through
      case "oeffnen":
        this._modus = "detail";
        this._offen = el.dataset.id;
        this._tab = "einstellungen";
        this._bearbeiten = false;
        this._offeneZeilen.clear();
        this._rechner = null;
        this._sheetScroll = 0;
        break;
      case "neu": this._ansicht === "modelle" ? (this._dialog = "mod-laden") : this._ansicht === "inventar" ? this._invNeuStarten() : this._neuStarten(); break;
      case "schliessen": if (!this._schliessen()) return; break;
      case "zum-druck":
        if (!this._schliessen()) return;
        this._ansicht = "drucker"; this._drOffen = el.dataset.uid; this._dialog = "dr-druck";
        break;
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
    if (this._modEingabe(t)) return;
    if (this._buEingabe(t)) return;
    if (this._drEingabe(t)) return;
    if (this._hiEingabe(t) || this._wsEingabe(t) || this._neEingabe(t)) return;
    if (t.id === "global-suche") {
      this._sucheQ = t.value;
      clearTimeout(this._suchTimer);
      this._suchTimer = setTimeout(() => { const box = this.shadowRoot.getElementById("such-ergebnisse"); if (box) box.innerHTML = this._suchErgebnisHtml(); }, 80);
      return;
    }
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
    if (this._modAenderung(t)) return;
    if (this._buAenderung(t)) return;
    if (this._drAenderung(t)) return;
    if (this._hiAenderung(t) || this._wsAenderung(t) || this._neAenderung(t)) return;
    if (t.dataset.sys === "import") { this._sicherungEinlesen(t.files && t.files[0]); t.value = ""; return; }
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
    const k = this._konfig;
    add("Integration", !!(k && k.liste), k && k.liste
      ? `Drucker: ${k.drucker_name || "keiner gewählt"} · Steckdose: ${k.steckdose_name || "keine gewählt"} · Liste: ${k.liste}`
      : "Keine Einstellungen der Integration gefunden, es wird nach Namen gesucht");
    const fehlen = DRUCKER_WICHTIG.filter((s) => !this._drId(s));
    add("Drucker-Sensoren", !fehlen.length, !fehlen.length
      ? `Alle ${DRUCKER_WICHTIG.length} gefunden, Druckstatus: ${this._drW("status") || "–"}`
      : `Nicht gefunden: ${fehlen.join(", ")}. Direkt nach einem HA-Neustart ist das normal, dann in einer Minute neu prüfen.`);
    const kamera = this._drId("kamera");
    add("Drucker-Kamera", !!kamera, kamera || "Keine Kamera gefunden");
    try {
      const r = await hass.callWS({ type: "todo/item/list", entity_id: this._drListe() });
      add("Druckliste lesen", true, `${(r.items || []).length} Einträge in ${this._drListe()}`);
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
    const fokusId = root.activeElement && ["suche", "inv-suche", "global-suche"].includes(root.activeElement.id) ? root.activeElement.id : null;
    const schonDa = new Set([...root.querySelectorAll("[data-einmal]")].map((x) => x.dataset.einmal));
    this._ddOffen = null;

    let html;
    try {
      html = this._appHtml();
    } catch (e) {
      // Fehler beim Aufbau: Notansicht statt leerer Seite
      console.error("Filament-Werkstatt:", e);
      this._modus = null; this._dialog = null; this._sucheOffen = false; this._mehrOffen = false;
      html = `<div class="app ${this._mobil ? "mobil" : ""}">${this._kopfHtml()}<main class="haupt"><div class="karte fehlerkarte"><h2>Diese Ansicht konnte nicht angezeigt werden</h2>
        <p>${esc(e.message || e)}</p><p class="leise klein">Deine Daten sind nicht betroffen.</p><button class="knopf" data-aktion="ansicht" data-id="filament">Zur Filament-Übersicht</button></div></main></div>`;
    }
    this._reglerMerken();
    root.innerHTML = `${this._stilFest ? "" : `<style>${STIL}</style>`}${html}`;
    this._nachZeichnen(root, scrollHaupt, fokusId, schonDa);
  }

  _appHtml() {
    return `
      <div class="app ${this._mobil ? "mobil" : ""}">
        ${this._kopfHtml()}
        ${this._daten && this._drVerlauf ? this._buBalkenHtml() : ""}
        ${this._updateBalkenHtml()}
        ${this._daten ? this._sicherungBalkenHtml() : ""}
        <main class="haupt"><div class="ansicht-rein ${this._ansicht === "modelle" ? "voll" : ""}" data-einmal="ansicht-${this._ansicht}">${this._inhaltHtml()}</div></main>
        ${["filament", "inventar"].includes(this._ansicht) && this._daten && !this._modus && !this._mehrOffen && !this._sucheOffen ? `<button class="fab" data-aktion="neu" aria-label="Hinzufügen" title="${this._ansicht === "inventar" ? "Teil hinzufügen" : "Filament hinzufügen"}">+</button>` : ""}
        ${this._mobil ? this._navHtml("unten") : ""}
        ${this._modus === "detail" ? this._sheetHtml() : ""}
        ${this._modus === "neu" ? this._neuSheetHtml() : ""}
        ${this._modus === "inv-detail" || this._modus === "inv-neu" ? this._invSheetHtml() : ""}
        ${this._mobil ? this._mehrHtml() : ""}
        ${this._sucheHtml()}
        ${this._dialogHtml()}
        ${this._toastText ? `<div class="toast ${this._toastKnopf ? "mit-knopf" : ""}" role="status" data-einmal="toast-${esc(this._toastText)}">${esc(this._toastText)}${this._toastKnopf ? ` <button class="mini mint-rand" data-aktion="toast-knopf">${esc(this._toastKnopf.knopf)}</button>` : ""}</div>` : ""}
      </div>`;
  }

  _nachZeichnen(root, scrollHaupt, fokusId, schonDa) {
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
    try {
      this._auswahlenBauen();
      if (this._ansicht === "modelle") this._modNachZeichnen();
      if (this._ansicht === "hilfe") this._hiNachZeichnen();
    } catch (e) { console.error("Filament-Werkstatt:", e); }
    if (this._klappNeu) {
      const k = root.querySelector(`[data-klapp="${this._klappNeu}"]`);
      this._klappNeu = null;
      if (k) this._klappAnimieren(k, true);
    }
    this._reglerWiederfinden();
  }

  // ---- Handy: Detailansicht nach unten wegwischen ------------------------
  // Greift am Griff/Kopf immer, im Inhalt nur, wenn dieser ganz oben steht.
  _wischenEinrichten() {
    const root = this.shadowRoot;
    let w = null;
    root.addEventListener("touchstart", (e) => {
      w = null;
      if (!this._mobil || e.touches.length !== 1) return;
      const sheet = e.target.closest(".sheet");
      if (!sheet || e.target.closest('input[type="range"], .dd-liste, textarea')) return;
      const inhalt = sheet.querySelector(".sheet-inhalt");
      const imInhalt = !!e.target.closest(".sheet-inhalt");
      if (imInhalt && inhalt.scrollTop > 0) return;
      w = { sheet, inhalt, imInhalt, y0: e.touches[0].clientY, t0: performance.now(), dy: 0, aktiv: false };
    }, { passive: true });
    root.addEventListener("touchmove", (e) => {
      if (!w) return;
      const dy = e.touches[0].clientY - w.y0;
      if (!w.aktiv) {
        if (dy < -4 || (w.imInhalt && w.inhalt.scrollTop > 0)) { w = null; return; }
        if (dy < 8) return;
        w.aktiv = true;
        w.sheet.style.transition = "none";
        w.sheet.style.animation = "none";
        w.schleier = root.querySelector(".schleier:not(.oben)");
      }
      e.preventDefault();
      w.dy = Math.max(0, dy - 8);
      w.sheet.style.transform = `translateY(${w.dy}px)`;
      if (w.schleier) w.schleier.style.opacity = String(Math.max(0.2, 1 - w.dy / w.sheet.offsetHeight));
    }, { passive: false });
    const ende = () => {
      if (!w || !w.aktiv) { w = null; return; }
      const { sheet, schleier, dy } = w;
      const tempo = dy / Math.max(1, performance.now() - w.t0);
      w = null;
      if (dy > 120 || (dy > 40 && tempo > 0.6)) {
        sheet.style.transition = "transform .18s ease-in";
        sheet.style.transform = "translateY(100%)";
        if (schleier) { schleier.style.transition = "opacity .18s"; schleier.style.opacity = "0"; }
        setTimeout(() => { const s = root.querySelector(".schleier:not(.oben)"); if (s && s.dataset.aktion) s.click(); }, 170);
      } else {
        sheet.style.transition = "transform .22s cubic-bezier(.2,.9,.3,1.2)";
        sheet.style.transform = "";
        if (schleier) { schleier.style.transition = "opacity .2s"; schleier.style.opacity = ""; }
      }
    };
    root.addEventListener("touchend", ende);
    root.addEventListener("touchcancel", ende);
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

  // ---- Regler: aktueller Wert in einer gelben Box über dem Knopf ----------
  // Gilt für jeden input[type=range] im Panel, auch für künftige und nach dem
  // Neuzeichnen. Antippen der Box: genauen Wert eintippen (Enter/Verlassen
  // übernimmt, Escape bricht ab). Übernommen wird wie beim Ziehen: Wert setzen,
  // dann „input“ und „change“ auslösen, damit alle abhängigen Anzeigen mitgehen.
  _reglerEinrichten() {
    const root = this.shadowRoot;
    const istRegler = (x) => x && x.matches && x.matches('input[type="range"]');
    root.addEventListener("pointerdown", (e) => {
      const r = e.target.closest && e.target.closest('input[type="range"]');
      const inBox = e.target.closest && e.target.closest(".regler-wert");
      // Woanders hingetippt, während eine Zahl eingetippt wird: erst übernehmen
      if (!inBox && this._regler && this._regler.edit) this._reglerUebernehmen();
      if (r) this._reglerAn(r);
      else if (!inBox) this._reglerAus();
    }, true);
    // Tastatur: Tab auf einen Regler zeigt die Box ebenfalls
    root.addEventListener("keydown", (e) => { if (e.key === "Tab") this._reglerTab = Date.now(); }, true);
    root.addEventListener("keyup", (e) => { if (istRegler(e.target) && /^(Arrow|Page|Home|End)/.test(e.key)) this._reglerAn(e.target); }, true);
    root.addEventListener("focusin", (e) => {
      if (istRegler(e.target)) { if (Date.now() - (this._reglerTab || 0) < 600) this._reglerAn(e.target); }
      else if (this._regler && !(e.target.closest && e.target.closest(".regler-wert"))) this._reglerAus();
    });
    root.addEventListener("input", (e) => { if (this._regler && e.target === this._regler.el) this._reglerZeigen(); }, true);
    root.addEventListener("scroll", () => { if (this._regler) this._reglerLage(); }, true);
    window.addEventListener("resize", () => { if (this._regler) this._reglerLage(); });
  }

  // Merkmale, an denen derselbe Regler nach dem Neuzeichnen wiedererkannt wird
  _reglerSchluessel(el) {
    const teile = [...el.attributes].filter((a) => a.name === "id" || a.name.startsWith("data-")).map((a) => `[${a.name}="${CSS.escape(a.value)}"]`);
    const sel = `input[type="range"]${teile.join("")}`;
    return { sel, nr: [...this.shadowRoot.querySelectorAll(sel)].indexOf(el) };
  }

  _reglerAn(el) {
    if (this._regler && this._regler.el === el) { this._reglerZeigen(); return; }
    this._reglerAus();
    this._regler = { el, edit: false, text: "" };
    this._reglerZeigen();
  }

  _reglerAus() {
    if (!this._regler) return;
    const box = this._regler.box;
    this._regler = null;
    if (box) box.remove();
  }

  _reglerMerken() {
    const r = this._regler;
    if (!r) return;
    if (r.el.isConnected) r.schl = this._reglerSchluessel(r.el);
    if (r.edit && r.box) { const f = r.box.querySelector("input"); if (f) r.text = f.value; }
    r.box = null;
  }

  _reglerWiederfinden() {
    const r = this._regler;
    if (!r) return;
    if (!r.el.isConnected) {
      const neu = r.schl && this.shadowRoot.querySelectorAll(r.schl.sel)[r.schl.nr];
      if (!neu) { this._regler = null; return; }
      r.el = neu;
    }
    this._reglerZeigen();
  }

  _reglerZahlen(el) {
    const min = el.min === "" ? 0 : Number(el.min), max = el.max === "" ? 100 : Number(el.max);
    const step = el.step === "any" ? 0 : (el.step === "" ? 1 : Number(el.step));
    const nk = step ? Math.min(6, (String(el.step).split(".")[1] || "").length) : 2;
    return { min, max, step, nk };
  }

  _reglerText(el, v, tausender = true) {
    const { nk } = this._reglerZahlen(el);
    return Number(v).toLocaleString("de-DE", { minimumFractionDigits: nk, maximumFractionDigits: nk, useGrouping: tausender });
  }

  // Box anlegen bzw. auffrischen
  _reglerZeigen() {
    const r = this._regler;
    if (!r) return;
    if (!r.el.isConnected) { this._reglerWiederfinden(); return; }
    const app = this.shadowRoot.querySelector(".app");
    if (!app) return;
    if (!r.box || !r.box.isConnected) {
      r.box = document.createElement("div");
      r.box.className = "regler-wert";
      for (const ev of ["click", "input", "change", "keydown", "keyup"]) r.box.addEventListener(ev, (e) => e.stopPropagation());
      r.box.addEventListener("click", (e) => { if (e.target.closest(".regler-wert-knopf")) this._reglerBearbeiten(); });
      app.appendChild(r.box);
      r.inhalt = null;
    }
    if (r.edit) {
      if (r.inhalt !== "edit") {
        r.inhalt = "edit";
        const { min, max } = this._reglerZahlen(r.el);
        r.box.classList.add("edit");
        r.box.innerHTML = `<input class="regler-wert-feld" type="text" inputmode="decimal" enterkeyhint="done" autocomplete="off" aria-label="Wert eintippen (${this._reglerText(r.el, min, false)} bis ${this._reglerText(r.el, max, false)})"><small>${esc(this._reglerText(r.el, min))} – ${esc(this._reglerText(r.el, max))}</small>`;
        const f = r.box.querySelector("input");
        f.value = r.text;
        f.addEventListener("keydown", (e) => {
          if (e.key === "Enter") { e.preventDefault(); this._reglerUebernehmen(); }
          else if (e.key === "Escape") { e.preventDefault(); this._reglerAbbrechen(); }
        });
        f.addEventListener("input", () => { r.text = f.value; f.classList.remove("falsch"); });
        f.addEventListener("blur", () => { if (this._regler === r && r.edit && r.box && r.box.contains(f)) this._reglerUebernehmen(); });
        f.focus();
        f.select();
      }
    } else {
      r.box.classList.remove("edit");
      const text = this._reglerText(r.el, r.el.value);
      const knopf = r.inhalt === "zeige" && r.box.querySelector(".regler-wert-knopf");
      if (knopf) knopf.firstChild.textContent = text;
      else {
        r.box.innerHTML = `<button type="button" class="regler-wert-knopf" title="Antippen, um eine genaue Zahl einzutippen"><span>${esc(text)}</span><i aria-hidden="true">✎</i></button>${r.hinweis ? `<small>${esc(r.hinweis)}</small>` : ""}`;
        r.inhalt = "zeige";
      }
    }
    this._reglerLage();
  }

  // Box mittig über den Reglerknopf setzen, innerhalb der Seite halten
  _reglerLage() {
    const r = this._regler;
    if (!r || !r.box) return;
    const app = this.shadowRoot.querySelector(".app");
    const ra = r.el.getBoundingClientRect();
    if (!app || !ra.width) { r.box.style.visibility = "hidden"; return; }
    const pa = app.getBoundingClientRect();
    const { min, max } = this._reglerZahlen(r.el);
    const anteil = max > min ? Math.min(1, Math.max(0, (Number(r.el.value) - min) / (max - min))) : 0;
    const knopf = 22;
    const x = ra.left + knopf / 2 + anteil * (ra.width - knopf) - pa.left;
    const b = r.box.offsetWidth || 60;
    const links = Math.max(8, Math.min(pa.width - b - 8, x - b / 2));
    r.box.style.visibility = "";
    r.box.style.left = `${links}px`;
    r.box.style.top = `${ra.top - pa.top + ra.height / 2 - 22}px`;
    r.box.style.setProperty("--spitze", `${Math.max(10, Math.min(b - 10, x - links))}px`);
  }

  _reglerBearbeiten() {
    const r = this._regler;
    if (!r || r.edit) return;
    r.edit = true;
    r.hinweis = null;
    r.text = this._reglerText(r.el, r.el.value, false);
    this._reglerZeigen();
  }

  _reglerAbbrechen() {
    const r = this._regler;
    if (!r) return;
    r.edit = false;
    this._reglerZeigen();
    try { r.el.focus({ preventScroll: true }); } catch (e) { /* egal */ }
  }

  // Eingabe prüfen: Komma oder Punkt, auf min/max begrenzen, auf die Schrittweite runden
  _reglerUebernehmen() {
    const r = this._regler;
    if (!r || !r.edit) return;
    const roh = String(r.text || "").trim().replace(/\s/g, "");
    const norm = /,/.test(roh) ? roh.replace(/\./g, "").replace(",", ".") : roh;
    let v = norm === "" ? NaN : Number(norm);
    const f = r.box && r.box.querySelector("input");
    if (!Number.isFinite(v)) {
      if (f) { f.classList.add("falsch"); f.focus(); }
      return;
    }
    const { min, max, step, nk } = this._reglerZahlen(r.el);
    const eingegeben = v;
    if (step) v = min + Math.round((v - min) / step) * step;
    v = Math.min(max, Math.max(min, v));
    if (step && min + Math.floor((max - min) / step + 1e-9) * step < v) v = min + Math.floor((max - min) / step + 1e-9) * step;
    v = Number(v.toFixed(nk));
    r.hinweis = eingegeben > max ? `höchstens ${this._reglerText(r.el, max)}` : eingegeben < min ? `mindestens ${this._reglerText(r.el, min)}` : Math.abs(eingegeben - v) > 1e-9 ? `gerundet auf ${this._reglerText(r.el, v)}` : null;
    r.edit = false;
    r.inhalt = null;
    const el = r.el;
    el.value = String(v);
    this._reglerZeigen();
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    if (this._regler === r && r.hinweis) {
      clearTimeout(this._reglerHinweisTimer);
      this._reglerHinweisTimer = setTimeout(() => { if (this._regler === r && !r.edit) { r.hinweis = null; r.inhalt = null; this._reglerZeigen(); } }, 2500);
    }
  }

  _kopfHtml() {
    return `<header class="kopf">
      ${this._narrow ? `<button class="icon-knopf" data-aktion="menue" aria-label="Menü">☰</button>` : ""}
      <div class="marke"><span class="punkt-leucht"></span>Filament-Werkstatt</div>
      ${!this._mobil && this._daten ? `<button class="such-knopf kopf-suche" data-aktion="such-auf" aria-label="Suchen" title="Suchen (Strg+K)"><span class="kopf-suche-icon">🔍</span><span class="kopf-suche-text">Suchen …</span><kbd>Strg K</kbd></button>` : ""}
      ${this._mobil ? "" : this._navHtml("oben")}
      ${this._speicherHtml()}
      ${this._mobil && this._daten ? `<button class="icon-knopf such-knopf" data-aktion="such-auf" aria-label="Suchen" title="Suchen (Strg+K)">🔍</button>` : ""}
    </header>`;
  }

  _navHtml(lage) {
    // Oben ist wenig Platz: Kurznamen, Nerd und System nur als Symbol (Name als Tooltip)
    const punkt = (n) => `<button class="nav-punkt ${this._ansicht === n.id ? "aktiv" : ""} ${lage === "oben" && n.nurIcon ? "nur-icon" : ""}" data-aktion="ansicht" data-id="${n.id}" title="${n.name}" aria-label="${n.name}">
        <span class="nav-icon">${n.icon}</span>${lage === "oben" && n.nurIcon ? "" : `<span class="nav-name">${n.kurz || n.name}</span>`}</button>`;
    if (lage === "oben") return `<nav class="nav nav-oben">${NAVIGATION.map(punkt).join("")}</nav>`;
    const mehrAktiv = !NAV_UNTEN.includes(this._ansicht);
    const mehrIcon = mehrAktiv ? (NAVIGATION.find((n) => n.id === this._ansicht) || {}).icon || "☰" : "☰";
    return `<nav class="nav nav-unten">${NAVIGATION.filter((n) => NAV_UNTEN.includes(n.id)).map(punkt).join("")}
      <button class="nav-punkt ${mehrAktiv || this._mehrOffen ? "aktiv" : ""}" data-aktion="mehr" aria-label="Weitere Bereiche"><span class="nav-icon">${mehrIcon}</span><span class="nav-name">Mehr</span></button></nav>`;
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
    if (this._ansicht === "modelle") return this._modHtml();
    if (this._ansicht === "hilfe") return this._hiHtml();
    if (this._ansicht === "werkstatt") return this._wsHtml();
    if (this._ansicht === "nerd") return this._neHtml();
    if (this._ansicht === "start") return this._stHtml();
    if (this._ansicht === "shop") return this._shHtml();
    if (this._ansicht === "notiz") return this._nbHtml();
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
      const geladen = r.id === this._daten.geladen;
      return `<button class="kachel ${r.probiert ? "" : "offen"} ${geladen ? "geladen" : ""}" data-aktion="oeffnen" data-id="${esc(r.id)}">
        ${geladen ? `<span class="badge-geladen">● geladen</span>` : ""}
        ${r.probiert ? "" : `<span class="badge-offen">noch nicht probiert</span>`}
        ${r.achtung ? `<span class="achtung-punkt kachel-achtung" title="Nach Fehldruck: testen und genau hinschauen">!</span>` : ""}
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
            ${r.id === this._daten.geladen
              ? `<button class="geladen-knopf an" data-aktion="dr-laden" data-id="" title="Antippen: kein Filament mehr geladen">● Geladen</button>`
              : `<button class="geladen-knopf" data-aktion="dr-laden" data-id="${esc(r.id)}" title="Diese Rolle steckt jetzt im Drucker">Geladen</button>`}
          </div>
          <button class="icon-knopf" data-aktion="schliessen" aria-label="Schließen">✕</button>
        </header>
        <div class="tabs">${tabs.map(([id, n]) => `<button class="tab ${this._tab === id ? "an" : ""}" data-aktion="tab" data-id="${id}" ${this._bearbeiten ? "disabled" : ""}>${n}</button>`).join("")}</div>
        <div class="sheet-inhalt">
          ${r.achtung && this._tab === "einstellungen" ? `<div class="hinweis rot-hinweis achtung-hinweis"><span class="achtung-punkt">!</span><div><strong>Nach einem Fehldruck: testen und genau hinschauen.</strong>
            <small>${esc(r.achtung.grund || "")}${r.achtung.geaendert && r.achtung.geaendert.length ? ` · geändert: ${esc(r.achtung.geaendert.join(", "))}` : ""}</small></div>
            <button class="mini" data-aktion="bu-achtung-weg" data-id="${esc(r.id)}">Test hat geklappt</button></div>` : ""}
          ${this._tab === "einstellungen" ? this._letzterDruckHtml(r) + this._einstellungenHtml(r) : this._tab === "rest" ? this._restHtml(r) : this._infosHtml(r)}
        </div>
        ${fuss ? `<footer class="sheet-fuss">${fuss}</footer>` : ""}
      </section>`;
  }

  // Letzter verbuchter Druck mit dieser Rolle, Sprung in den Druckverlauf
  _letzterDruckHtml(r) {
    const l = this._buLetzterDruck(r.id);
    const f = l && l.d ? fotoName(l.d) : null;
    const foto = f && this._drFotos && this._drFotos[f];
    if (f && this._drFotos && !(f in this._drFotos)) setTimeout(() => this._drFotosLaden(), 0);
    const g = l && l.x.gebucht;
    return `<div class="letzter-druck">
      <div class="ld-bild" ${f ? `data-foto="${esc(f)}"` : ""}>${foto ? `<img src="${esc(foto)}" alt="">` : "🖼️"}</div>
      <div class="ld-text">
        <strong>Letzter Druck</strong>
        <span class="leise klein">${l ? `${esc(l.name)} · ${zahl(g.g, 1)} g · ${new Date(g.am).toLocaleDateString("de-DE")}${g.ergebnis === "fehl" ? " · Fehldruck" : ""}${l.x.kommentar ? ` · 💬 ${esc(l.x.kommentar)}` : ""}` : "Noch kein Druck mit dieser Rolle verbucht."}</span>
      </div>
      <button class="knopf leise klein-knopf" ${l ? `data-aktion="zum-druck" data-uid="${esc(l.uid)}"` : "disabled"}>Zum Druck ›</button>
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
      <textarea id="notiz" rows="4" maxlength="2000" placeholder="z. B. Schichthöhe, Besonderheiten …">${esc(r.notiz)}</textarea>
      <h3>Bambu Studio</h3>
      <p class="leise klein">Filament-Profil mit deinen Werten (Temperaturen, Lüfter, Flow, K-Faktor, Volumenstrom) als Datei. In Bambu Studio über Datei › Importieren › Konfiguration importieren laden.</p>
      <button class="knopf leise breit" data-aktion="profil-export">⬇ Profil für Bambu Studio</button>`;
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
    if (this._dialog === "bu" || this._dialog === "bu-hand") return `<div class="schleier oben" data-einmal="schleier-bu"></div><div class="dialog breit-dialog bu-dialog" role="dialog" data-einmal="dialog-${this._dialog}"><button class="icon-knopf dialog-x" data-aktion="${this._dialog === "bu" ? "bu-fertig" : "dialog-zu"}" aria-label="Schließen">✕</button>${this._dialog === "bu" ? this._buDialogHtml() : this._buHandHtml()}</div>`;
    if (this._dialog === "ws-auftrag") return `<div class="schleier oben" data-aktion="dialog-zu" data-einmal="schleier-ws"></div><div class="dialog" role="dialog" data-einmal="dialog-ws">${this._wsAuftragDialogHtml()}</div>`;
    if (this._dialog === "sich-import") return `<div class="schleier oben" data-einmal="schleier-imp"></div><div class="dialog" role="dialog" data-einmal="dialog-imp">${this._importDialogHtml()}</div>`;
    if (this._dialog === "kopieren") return `<div class="schleier oben" data-aktion="dialog-zu" data-einmal="schleier-kop"></div><div class="dialog" role="dialog" data-einmal="dialog-kop"><h2>Zum Kopieren markieren</h2>
      <p class="leise klein">Die Zwischenablage ist hier gesperrt. Text markieren und kopieren:</p><textarea rows="10" readonly>${esc(this._kopierText || "")}</textarea><button class="knopf breit oben-abstand" data-aktion="dialog-zu">Fertig</button></div>`;
    if (this._dialog === "konflikt") return `<div class="schleier oben" data-einmal="schleier-kon"></div><div class="dialog" role="alertdialog" data-einmal="dialog-kon"><h2>Auf einem anderen Gerät geändert</h2>
      <p class="leise">Seit du die Seite geöffnet hast, wurde auf einem anderen Gerät gespeichert (${this._konflikt ? new Date(this._konflikt.am).toLocaleString("de-DE") : ""}). Welcher Stand soll gelten?</p>
      <button class="wahl" data-aktion="kon-laden"><span>↻</span><div><strong>Neu laden</strong><small>Stand vom anderen Gerät übernehmen, meine letzte Änderung verwerfen</small></div></button>
      <button class="wahl" data-aktion="kon-behalten"><span>✓</span><div><strong>Meinen Stand speichern</strong><small>Überschreibt die Änderungen vom anderen Gerät</small></div></button></div>`;
    if (this._dialog === "mod-laden") return `<div class="schleier oben" data-aktion="dialog-zu" data-einmal="schleier-mod"></div><div class="dialog" role="dialog" data-einmal="dialog-mod">${this._modLadenDialogHtml()}</div>`;
    if (this._dialog === "mod-stuetzen") return `<div class="schleier oben" data-aktion="dialog-zu" data-einmal="schleier-mod-s"></div><div class="dialog breit-dialog" role="dialog" data-einmal="dialog-mod-s">${this._modStuetzenHilfeHtml()}</div>`;
    if (this._dialog === "dr-schalten") return `<div class="schleier oben" data-aktion="dialog-zu" data-einmal="schleier-dr-s"></div><div class="dialog" role="dialog" data-einmal="dialog-dr-s">${this._drSchaltDialogHtml()}</div>`;
    if (this._dialog === "dr-temp") return `<div class="schleier oben" data-aktion="dialog-zu" data-einmal="schleier-dr-t"></div><div class="dialog" role="dialog" data-einmal="dialog-dr-t">${this._drTempDialogHtml()}</div>`;
    if (this._dialog === "dr-luefter") return `<div class="schleier oben" data-aktion="dialog-zu" data-einmal="schleier-dr-l"></div><div class="dialog" role="dialog" data-einmal="dialog-dr-l">${this._drLuefterDialogHtml()}</div>`;
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
    </div>${this._sicherungKarteHtml()}`;
  }
}

Object.assign(FilamentWerkstattPanel.prototype, InventarAnsicht, DruckerAnsicht, ModellAnsicht, BuchenAnsicht, HilfeAnsicht, WerkstattAnsicht, NerdAnsicht, ExtrasAnsicht, StartAnsicht, ShopAnsicht, NotizAnsicht, KunststoffAnsicht);

if (!customElements.get("filament-werkstatt-panel")) {
  customElements.define("filament-werkstatt-panel", FilamentWerkstattPanel);
}
