// Ansicht: Seitenhöhe, Scrollen nur im Detail, Aufklapp-Animation, eigene Auswahllisten.
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
  await p.goto(`http://localhost:${process.env.TEST_PORT || 8765}/test/test.html`);
  await p.waitForTimeout(800);
  return p;
}
const el = (p) => p.locator("filament-werkstatt-panel");
const seiteScrollt = (p) => p.evaluate(() => document.scrollingElement.scrollHeight > innerHeight + 1 || scrollY > 0);
const waehle = async (p, select, text) => {
  await el(p).locator(`.dd-knopf:has(+ ${select})`).click();
  await p.waitForTimeout(150);
  await el(p).locator(".dd-liste .dd-option", { hasText: text }).first().click();
  await p.waitForTimeout(200);
};

// ---- Desktop: wenige Rollen gefiltert, Seite bleibt voll
let p = await seite(1400, 900);
await waehle(p, 'select[data-filter="hersteller"]', "Sunlu");
pruefe((await el(p).locator(".kachel").count()) === 3, "Eigene Liste: Hersteller Sunlu zeigt 3 Rollen");
const hoehe = await el(p).evaluate((x) => x.shadowRoot.querySelector(".app").getBoundingClientRect().height);
pruefe(hoehe === 900, `Seite füllt das Fenster auch mit 3 Rollen (${hoehe} px)`);
await p.screenshot({ path: `${out}/a1-wenige-rollen.png` });
await el(p).locator('.dd-knopf:has(+ select[data-filter="status"])').click();
await p.waitForTimeout(250);
await p.screenshot({ path: `${out}/a2-auswahlliste.png` });
pruefe((await el(p).locator(".dd-liste").count()) === 1, "Status-Liste öffnet als eigene Liste");
await p.mouse.click(700, 800);
await p.waitForTimeout(100);
pruefe((await el(p).locator(".dd-liste").count()) === 0, "Tipp daneben schließt die Liste");

// ---- Detail: nur die Detailansicht scrollt
await el(p).locator('[data-id="sunlu-tpu-schwarz"]').click();
await p.waitForTimeout(400);
await el(p).evaluate((x) => (window.__sheet = x.shadowRoot.querySelector(".sheet")));
for (const g of ["tempo", "fluss", "trocknen", "platte", "profil"]) {
  await el(p).locator(`[data-aktion="gruppe"][data-id="${g}"]`).click();
  await p.waitForTimeout(380);
}
await p.mouse.move(1100, 500);
await p.mouse.wheel(0, 3000);
await p.waitForTimeout(400);
const innen = await el(p).evaluate((x) => x.shadowRoot.querySelector(".sheet-inhalt").scrollTop);
pruefe(innen > 0 && !(await seiteScrollt(p)), `Nur die Detailansicht scrollt (innen ${innen} px, Seite fest)`);
pruefe(await el(p).evaluate((x) => x.shadowRoot.querySelector(".sheet").getAnimations().length === 0 && window.__sheet === x.shadowRoot.querySelector(".sheet")), "Detailansicht bleibt beim Aufklappen stehen (wird nicht neu aufgebaut)");
await p.screenshot({ path: `${out}/a3-detail-gescrollt.png` });

// Aufklappen fährt nach unten auf
await el(p).locator(".sheet-inhalt").evaluate((x) => (x.scrollTop = 0));
await el(p).locator('[data-aktion="gruppe"][data-id="temp"]').click();   // zu
await p.waitForTimeout(400);
await el(p).locator('[data-aktion="gruppe"][data-id="temp"]').click();   // auf
const anim = await el(p).evaluate((x) => { const k = x.shadowRoot.querySelector('[data-klapp="g:temp"]'); const a = k.getAnimations()[0]; return a ? a.effect.getKeyframes().map((f) => f.height) : []; });
await p.waitForTimeout(220);
await p.screenshot({ path: `${out}/a4-aufklappen-mitte.png` });
await p.waitForTimeout(400);
const ende = await el(p).evaluate((x) => x.shadowRoot.querySelector('[data-klapp="g:temp"]').getBoundingClientRect().height);
pruefe(anim[0] === "0px" && anim[1] === `${ende}px`, `Gruppe fährt von oben nach unten auf (${anim.join(" → ")})`);
await el(p).locator('[data-aktion="zeile"][data-k="duese"]').click();
await p.waitForTimeout(400);
await el(p).locator('[data-aktion="zeile"][data-k="platte"]').click();
await p.waitForTimeout(400);
await el(p).locator('[data-klapp="z:platte"] .dd-knopf').click();
await p.waitForTimeout(250);
await p.screenshot({ path: `${out}/a5-druckbett-liste.png` });
await el(p).locator(".dd-liste .dd-option", { hasText: "Cool Plate" }).first().click();
await p.waitForTimeout(200);
pruefe((await el(p).locator('[data-zeile="platte"] .wert').textContent()).includes("Cool Plate"), "Druckbett über eigene Liste gewählt");

// ---- Handy
const m = await seite(390, 844);
await el(m).locator('[data-aktion="filter-auf"]').click();
await waehle(m, 'select[data-filter="hersteller"]', "Sunlu");
await m.screenshot({ path: `${out}/a6-handy-wenige.png` });
pruefe(!(await seiteScrollt(m)) && (await el(m).evaluate((x) => x.shadowRoot.querySelector(".app").getBoundingClientRect().height)) === 844, "Handy: Seite füllt den Bildschirm mit wenigen Rollen");
await el(m).locator('[data-aktion="alle"]').click();
await el(m).locator('[data-id="bambu-pla-basic-grau"]').click();
await m.waitForTimeout(400);
const s = await el(m).evaluate((x) => {
  const i = x.shadowRoot.querySelector(".sheet-inhalt");
  i.scrollTop = 99999;
  const letztes = i.lastElementChild.getBoundingClientRect().bottom;
  return { leer: i.getBoundingClientRect().bottom - letztes, sheetUnten: x.shadowRoot.querySelector(".sheet").getBoundingClientRect().bottom };
});
await m.waitForTimeout(200);
await m.screenshot({ path: `${out}/a7-handy-detail-ende.png` });
pruefe(s.leer < 40 && s.sheetUnten <= 844 && !(await seiteScrollt(m)), `Handy: Detail scrollt nur bis zum Inhalt (Rest ${Math.round(s.leer)} px)`);

// ---- Schraube mit Kopfmaßen
await el(m).locator('.sheet-kopf [data-aktion="schliessen"]').click();
await el(m).locator('.nav-unten [data-id="inventar"]').click();
await el(m).locator("#inv-suche").fill("m3x12");
await m.waitForTimeout(200);
await el(m).locator(".kachel").first().click();
await m.waitForTimeout(400);
pruefe((await el(m).locator(".sheet-inhalt").textContent()).includes("DIN 912"), "Schraube zeigt Kopfmaße mit Norm");
await m.screenshot({ path: `${out}/a8-schraube-kopf.png` });
await el(m).locator(".sheet-inhalt").evaluate((x) => (x.scrollTop = 380));
await m.waitForTimeout(150);
await m.screenshot({ path: `${out}/a9-schraube-norm.png` });

console.log("Fehler:", fehler.length ? fehler : "keine");
await b.close();
process.exit(fehler.length ? 1 : 0);
