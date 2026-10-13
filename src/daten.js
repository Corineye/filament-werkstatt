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
