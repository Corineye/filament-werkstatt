// Klickt die Seite in einem nachgebauten Home Assistant durch und macht Screenshots.
// Aufruf (im Repo): python3 -m http.server 8765 &  dann  node test/lauf.mjs <bilderordner>
import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PFAD || "playwright");
const out = process.argv[2] || "test/bilder";
const b = await chromium.launch();
const fehler = [];
const pruefe = (ok, text) => { if (!ok) fehler.push("Prüfung fehlgeschlagen: " + text); console.log((ok ? "✓ " : "✕ ") + text); };

async function seite(breite, hoehe) {
  const p = await b.newPage({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 2 });
  p.on("pageerror", (e) => fehler.push(e.message));
  p.on("console", (m) => m.type() === "error" && fehler.push(m.text()));
  p.on("dialog", (d) => d.accept());
  await p.goto("http://localhost:8765/test/test.html");
  await p.waitForTimeout(800);
  return p;
}
const el = (p) => p.locator("filament-werkstatt-panel");
const daten = (p) => p.evaluate(() => JSON.parse(speicher.filament_werkstatt));
const rolle = async (p, id) => (await daten(p)).rollen.find((r) => r.id === id);

// ---- Desktop: Übersicht, Filter, Sortierung
let p = await seite(1400, 900);
await p.screenshot({ path: `${out}/1-uebersicht.png` });
await el(p).locator('select[data-filter="sorte"]').selectOption("a|PLA|Wood");
await p.waitForTimeout(200);
pruefe((await el(p).locator(".kachel").count()) === 4, "Filter Wood-PLA zeigt 4 Rollen");
await el(p).locator("#sortierung").selectOption("rest_auf");
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/2-filter.png` });
await el(p).locator('[data-aktion="alle"]').click();
await el(p).locator("#sortierung").selectOption("farbe");
await p.waitForTimeout(200);
pruefe((await el(p).locator(".kachel").count()) === 22, "Alle setzt Filter zurück (22 Rollen)");
await p.screenshot({ path: `${out}/3-sortiert-farbe.png` });

// ---- Detail: Zeile antippen, Regler, speichern bleibt „nicht probiert“
await el(p).locator('[data-id="deeplee-pla-plus-braun"]').click();
await p.waitForTimeout(300);
await el(p).locator('[data-aktion="zeile"][data-k="duese"]').click();
await el(p).locator('[data-aktion="schritt"][data-k="duese"][data-d="1"]').click();
await el(p).locator('[data-aktion="gruppe"][data-id="trocknen"]').click();
await el(p).locator('[data-aktion="gruppe"][data-id="platte"]').click();
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/4-detail-regler.png` });
await el(p).locator('[data-aktion="speichern-einst"]').click();
await p.waitForTimeout(900);
let braun = await rolle(p, "deeplee-pla-plus-braun");
pruefe(braun.eigen.duese === 221 && !braun.probiert && Object.keys(braun.eigen).length === 1, "Nur geänderter Wert wird eigen, Rolle bleibt nicht probiert");

// ---- Restgewicht: Spule, Größe, Auto-Speichern beim Schließen
await el(p).locator('[data-aktion="tab"][data-id="rest"]').click();
await p.waitForTimeout(200);
await el(p).locator('[data-aktion="groesse"]').click();
await el(p).locator('[data-aktion="groesse-wahl"][data-g="250"]').click();
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/5-spulengroesse.png` });
await el(p).locator('.dialog [data-aktion="dialog-zu"]').click();
await el(p).locator('[data-aktion="brutto"][data-d="10"]').click();
await el(p).locator('[data-aktion="spule-weitere"]').click();
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/6-spule-weitere.png` });
await el(p).locator('.dialog [data-aktion="dialog-zu"].knopf').click();
await p.locator("filament-werkstatt-panel").evaluate((x) => {
  const s = x.shadowRoot.querySelector('[data-rechner="spule_g"]');
  s.value = 150; s.dispatchEvent(new Event("input", { bubbles: true }));
});
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/7-restgewicht.png` });
await el(p).locator('.sheet-kopf [data-aktion="schliessen"]').click();
await p.waitForTimeout(900);
braun = await rolle(p, "deeplee-pla-plus-braun");
const d = await daten(p);
pruefe(braun.nenn_g === 250 && braun.rest_g === 17, `Schließen speichert (Größe 250 g, Rest ${braun.rest_g} g)`);
pruefe(d.spulen.find((s) => s.id === "deeplee").g === 150, "Spulengewicht gilt für alle Deeplee-Spulen (150 g)");

// Verwerfen
await el(p).locator('[data-id="lvvj3d-wood-oak"]').click();
await el(p).locator('[data-aktion="tab"][data-id="rest"]').click();
await el(p).locator('[data-aktion="brutto"][data-d="10"]').click();
await el(p).locator('[data-aktion="rest-verwerfen"]').click();
await el(p).locator('.sheet-kopf [data-aktion="schliessen"]').click();
await p.waitForTimeout(900);
pruefe((await rolle(p, "lvvj3d-wood-oak")).rest_g === 200, "Verwerfen setzt zurück, nichts gespeichert");

// ---- Filament hinzufügen
await el(p).locator('[data-aktion="neu"]').click();
await p.waitForTimeout(300);
await el(p).locator("#neu-hersteller").selectOption("Elegoo");
await el(p).locator('[data-aktion="neu-art"][data-id="Silk"]').click();
await el(p).locator('[data-neu="farbe"]').fill("Gold");
await el(p).locator('[data-neu="hex"]').evaluate((i) => { i.value = "#d4a62a"; i.dispatchEvent(new Event("input", { bubbles: true })); });
await el(p).locator('[data-aktion="groesse-wahl"][data-g="500"]').first().click();
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/8-neu.png` });
await el(p).locator('[data-aktion="zeile"][data-k="bett"]').click();
await el(p).locator('[data-aktion="schritt"][data-k="bett"][data-d="1"]').click();
await el(p).locator('[data-aktion="neu-anlegen"]').click();
await p.waitForTimeout(900);
const neu = (await daten(p)).rollen.find((r) => r.name === "PLA Silk Gold");
pruefe(neu && !neu.probiert && neu.eigen.bett === 56 && Object.keys(neu.eigen).length === 1 && neu.nenn_g === 500 && neu.rest_g === 500,
  "Neues Filament: nicht probiert, nur Bett als eigener Wert, 500 g voll");

// ---- Handy
const m = await seite(390, 844);
await m.screenshot({ path: `${out}/9-handy.png` });
await el(m).locator('[data-id="lvvj3d-wood-teak"]').click();
await m.waitForTimeout(400);
await m.screenshot({ path: `${out}/10-handy-detail.png` });
await el(m).locator('[data-aktion="tab"][data-id="rest"]').click();
await m.waitForTimeout(300);
await el(m).locator(".sheet-inhalt").evaluate((x) => (x.scrollTop = 9999));
await m.screenshot({ path: `${out}/11-handy-rest.png` });
await el(m).locator('.sheet-kopf [data-aktion="schliessen"]').click();
await el(m).locator('[data-aktion="neu"]').click();
await m.waitForTimeout(400);
await m.screenshot({ path: `${out}/12-handy-neu.png` });

console.log("Fehler:", fehler.length ? fehler : "keine");
await b.close();
process.exit(fehler.length ? 1 : 0);
