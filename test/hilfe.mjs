// Hilfe v0.12: Trockner mit zwei Plätzen, Konstruktion (mit Rechnern), Slicer-Lexikon, Druckplatten.
import { createRequire } from "module";
import { mkdirSync } from "fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PFAD || "playwright");
const out = process.argv[2] || "test/bilder";
mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const fehler = [];
const pruefe = (ok, text) => { if (!ok) fehler.push("Prüfung fehlgeschlagen: " + text); console.log((ok ? "✓ " : "✕ ") + text); };
async function seite(breite, hoehe, mobil = false) {
  const ctx = await b.newContext({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 2, hasTouch: mobil, isMobile: mobil, timezoneId: "Europe/Berlin" });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => fehler.push(e.message));
  p.on("console", (m) => m.type() === "error" && !m.text().includes("404") && fehler.push(m.text()));
  await p.goto(`http://localhost:${process.env.TEST_PORT || 8765}/test/test.html?drucker=bereit&ansicht=hilfe`);
  await p.waitForTimeout(800);
  await p.evaluate(() => { const x = window.el; x._dialog = null; x._bu = null; x._daten.buchen_ab = "2099-01-01"; x._zeichnen(); });
  return p;
}
const el = (p) => p.locator("filament-werkstatt-panel");
const tab = async (p, id) => { await el(p).locator(`[data-aktion="hi-tab"][data-id="${id}"]`).click(); await p.waitForTimeout(350); };
// Eigene Auswahlliste bedienen: Knopf vor dem <select> öffnen, Option wählen
const waehle = async (p, i, wert) => {
  await el(p).locator(".hi-kombi-wahl .auswahl").nth(i).locator(".dd-knopf").click();
  await p.waitForTimeout(150);
  await el(p).locator(`.dd-option[data-wert="${wert}"]`).click();
  await p.waitForTimeout(350);
};
const platz = (i) => i;
const anzeige = (p) => el(p).locator(".tr-kombi-bild").evaluateAll((l) => l.map((svg) => Object.fromEntries([...svg.querySelectorAll("[data-kombi]")].map((t) => [t.dataset.kombi, t.textContent]))));
const kein_seitwaerts = (p) => p.evaluate(() => { const h = window.el.shadowRoot.querySelector(".haupt"); return h.scrollWidth - h.clientWidth <= 1; });

// ---------------- Desktop ----------------
let p = await seite(1400, 900);
pruefe(await p.evaluate(() => window.el._ansicht === "hilfe"), "Hilfe öffnet sich");

// Trockner: zwei Plätze
await tab(p, "trockner");
pruefe((await el(p).locator(".hi-kombi").count()) === 1 && (await el(p).locator(".hi-kombi-leer").count()) === 1, "Trockner: Karte „Zwei Spulen“ mit leeren Plätzen");
pruefe((await el(p).locator(".trockner-bild .p1s-punkt").count()) === 7, "Große Trockner-Zeichnung bleibt unverändert");
await waehle(p, platz(0), "m:PLA");
let w = await anzeige(p);
pruefe(w.length === 1 && w[0].Soll === "50°" && w[0].Zeit === "06:00", `Nur Platz 1 (PLA): Display 50° / 06:00 (${JSON.stringify(w[0])})`);
await waehle(p, platz(1), "m:PETG");
w = await anzeige(p);
let erg = await el(p).locator(".hi-kombi-erg").getAttribute("data-modus");
pruefe(erg === "zusammen" && w.length === 1 && w[0].Soll === "50°" && w[0].Zeit === "08:00" && w[0].Feuchte === "< 15 %", `PLA + PETG: gemeinsam 50 °C, 6 h + 2 h (${JSON.stringify(w[0])})`);
pruefe((await el(p).locator(".hi-kombi-hinweis.amber").count()) === 1, "PLA + PETG: Hinweis, dass PETG länger braucht");
await p.screenshot({ path: `${out}/trockner-pla-petg-zusammen.png`, fullPage: false });
await el(p).locator(".hi-kombi").scrollIntoViewIfNeeded();
await el(p).locator(".hi-kombi").screenshot({ path: `${out}/trockner-karte-zusammen.png` });
await waehle(p, platz(1), "m:ASA");
w = await anzeige(p);
erg = await el(p).locator(".hi-kombi-erg").getAttribute("data-modus");
pruefe(erg === "getrennt" && w.length === 2 && w[0].Soll === "50°" && w[1].Soll === "70°", `PLA + ASA: Warnung und zwei Läufe (50° und 70°)`);
pruefe((await el(p).locator(".hi-kombi-hinweis.rot").count()) === 1, "PLA + ASA: rote Warnung (20 °C auseinander)");
await el(p).locator(".hi-kombi").screenshot({ path: `${out}/trockner-karte-pla-asa-getrennt.png` });
// Rollen aus dem Bestand
const petg = await p.evaluate(() => window.el._daten.rollen.filter((r) => r.material === "PETG").slice(0, 2).map((r) => r.id));
await waehle(p, platz(0), `r:${petg[0]}`);
await waehle(p, platz(1), `r:${petg[1]}`);
w = await anzeige(p);
pruefe(w.length === 1 && w[0].Soll === "65°" && w[0].Material === "PETG", `Zwei PETG-Rollen: gemeinsam 65 °C (${JSON.stringify(w[0])})`);
pruefe(await p.evaluate((ids) => JSON.stringify(window.el._daten.trockner_plaetze) === JSON.stringify(ids.map((x) => `r:${x}`)), petg), "Belegung wird in den Daten gespeichert");
await waehle(p, platz(1), `r:${petg[0]}`);
pruefe((await el(p).locator(".hi-kombi-hinweis.rot").count()) === 1, "Gleiche Rolle zweimal: Warnung");
const holz = await p.evaluate(() => window.el._daten.rollen.find((r) => r.art === "Wood").id);
await waehle(p, platz(0), `r:${holz}`);
await waehle(p, platz(1), "m:PLA");
w = await anzeige(p);
pruefe(w.length === 1 && w[0].Soll === "45°" && w[0].Material === "Wood", `Wood-PLA + PLA: 45 °C (${JSON.stringify(w[0])})`);
await waehle(p, platz(1), "m:PA");
pruefe((await el(p).locator(".hi-kombi-erg").getAttribute("data-modus")) === "getrennt" && (await el(p).locator(".hi-kombi-erg").textContent()).includes("80 °C"), "Wood-PLA + PA: getrennt, Hinweis auf 80 °C > Sovol-Maximum");

// Konstruktion
await tab(p, "konstruktion");
const tipps = await el(p).locator(".kn-tipp").count();
pruefe(tipps >= 15 && (await el(p).locator(".kn-tipp .kn-bild").count()) === tipps, `Konstruktion: ${tipps} Tipps mit Zeichnung`);
await p.screenshot({ path: `${out}/konstruktion-uebersicht.png` });
pruefe((await el(p).locator(".kn-stufen .kn-empf strong").textContent()).includes("1,32"), "Wand-Rechner 0,4 mm: 3 Linien = 1,32 mm");
await el(p).locator('[data-aktion="hi-kn-duese"][data-id="0.6"]').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".kn-stufen .kn-empf strong").textContent()).includes("1,86"), "Wand-Rechner 0,6 mm: 3 Linien = 1,86 mm");
await el(p).locator('[data-aktion="hi-kn-duese"][data-id="0.4"]').click();
await p.waitForTimeout(300);
const regler = async (v) => { await el(p).locator('input[data-hi="kn-wand"]').evaluate((i, v) => { i.value = v; i.dispatchEvent(new Event("input", { bubbles: true, composed: true })); }, v); await p.waitForTimeout(150); };
await regler(1.2);
pruefe((await el(p).locator("#hi-kn-wand-erg .hinweis.amber").count()) === 1 && (await el(p).locator("#hi-kn-wand-erg").textContent()).includes("1,32"), "1,2 mm Wand: Rest-Warnung, Vorschlag 1,32 mm");
await regler(1.75);
pruefe((await el(p).locator("#hi-kn-wand-erg .hinweis.mint").count()) === 1 && (await el(p).locator("#hi-kn-wand-wert").textContent()).includes("1,75"), "1,75 mm Wand: passt genau (4 Linien)");
await el(p).locator('[data-aktion="hi-kn-einsatz"]', { hasText: "M3" }).first().click();
await p.waitForTimeout(300);
let t = await el(p).locator(".kn-einsatz-erg").textContent();
pruefe(t.includes("4,5 mm") && t.includes("6 mm"), "Einsatz M3 5 × Ø5: Loch 4,5 mm, Tiefe 6 mm");
await el(p).locator('[data-aktion="hi-auf"][data-id="kn:einsaetze"]').click();
await p.waitForTimeout(450);
pruefe((await el(p).locator('.hi-eintrag[data-eintrag="kn:einsaetze"].auf .kn-tabelle').count()) === 1, "Tipp „Gewindeeinsätze“ klappt auf, mit Tabelle aus dem Inventar");
await el(p).locator('[data-aktion="hi-auf"][data-id="kn:magnete"]').click();
await p.waitForTimeout(450);
t = await el(p).locator('.hi-eintrag[data-eintrag="kn:magnete"]').textContent();
pruefe(t.includes("10,15"), "Magnettaschen aus dem Inventar (Ø 10 → 10,15)");
await el(p).locator('.hi-eintrag[data-eintrag="kn:einsaetze"]').scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/konstruktion-aufgeklappt.png` });
await el(p).locator('[data-aktion="hi-auf"][data-id="kn:einsaetze"]').click();
await p.waitForTimeout(500);
pruefe((await el(p).locator('.hi-eintrag[data-eintrag="kn:einsaetze"].auf').count()) === 0, "Zweiter Klick klappt wieder zu");
await el(p).locator('[data-aktion="hi-kn-gruppe"][data-id="geometrie"]').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".kn-tipp").count()) < tipps && (await el(p).locator('.hi-eintrag[data-eintrag="kn:ueberhang"]').count()) === 1, "Filter „Form & Überhänge“");
pruefe((await el(p).locator('.hi-eintrag[data-eintrag="kn:magnete"]').count()) === 0, "Filter blendet andere Tipps aus");

// Slicer-Lexikon
await tab(p, "lexikon");
const anzahl = await el(p).locator(".lex-eintrag").count();
pruefe(anzahl >= 40 && anzahl <= 60, `Lexikon: ${anzahl} Einträge`);
pruefe((await el(p).locator(".lex-gruppe").count()) === 6, "Sechs Gruppen wie in Bambu Studio");
await p.screenshot({ path: `${out}/lexikon-uebersicht.png` });
await el(p).locator("#hi-lex-suche").fill("naht");
await p.waitForTimeout(250);
t = await el(p).locator("#hi-lex-liste").textContent();
pruefe(t.includes("Nahtposition") && t.includes("Seam position"), "Suche „naht“ findet Nahtposition");
await el(p).locator("#hi-lex-suche").fill("brim");
await p.waitForTimeout(250);
t = await el(p).locator("#hi-lex-liste").textContent();
pruefe(t.includes("Randtyp") && (await el(p).locator("#hi-lex-suche").evaluate((i) => i.getRootNode().activeElement === i)), "Suche „brim“ (englisch) findet Randtyp, Fokus bleibt im Feld");
await el(p).locator("#hi-lex-suche").fill("flussverhältnis");
await p.waitForTimeout(250);
pruefe((await el(p).locator(".lex-eintrag.auf").count()) >= 1 && (await el(p).locator(".lex-eintrag.auf").first().textContent()).includes("Typische Werte"), "Wenige Treffer sind gleich aufgeklappt");
await p.screenshot({ path: `${out}/lexikon-suche.png` });
await el(p).locator("#hi-lex-suche").fill("xyzqq");
await p.waitForTimeout(250);
pruefe((await el(p).locator(".lex-leer").count()) === 1, "Keine Treffer: Hinweis");
await el(p).locator('[data-aktion="hi-lex-gruppe"][data-id="stuetzen"]').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".lex-gruppe").count()) === 1 && (await el(p).locator("#hi-lex-suche").inputValue()) === "", "Gruppe „Stützen“ zeigt nur diese Gruppe, Suche geleert");
await el(p).locator(".lex-eintrag .hi-eintrag-kopf").first().click();
await p.waitForTimeout(450);
pruefe((await el(p).locator(".lex-eintrag.auf").count()) === 1, "Eintrag klappt auf");
await p.screenshot({ path: `${out}/lexikon-stuetzen.png` });

// Druckplatten
await tab(p, "platten");
pruefe((await el(p).locator(".pl-zelle").count()) === 35, "Matrix: 7 Materialien × 5 Platten");
const zelle = (m, pl) => el(p).locator(".pl-zeile", { has: p.locator(`.pl-mat:text-is("${m}")`) }).locator(`.pl-zelle[data-id="${pl}"]`);
pruefe(await zelle("PLA", "cool").evaluate((z) => z.classList.contains("kleber")) && await zelle("PETG", "cool").evaluate((z) => z.classList.contains("nein")) && await zelle("PETG", "textured").evaluate((z) => z.classList.contains("ok")), "PLA/Cool = Kleber, PETG/Cool = ✗, PETG/Textured = ✓");
pruefe(await zelle("TPU", "supertack").evaluate((z) => z.classList.contains("nein")), "TPU nicht auf SuperTack");
pruefe((await el(p).locator('.pl-spalte.drin[data-id="textured"]').count()) === 1 && (await el(p).locator(".pl-detail h2").textContent()).includes("Textured"), "Platte im Drucker (Textured PEI) ist markiert und gewählt");
await p.screenshot({ path: `${out}/platten-uebersicht.png` });
await el(p).locator('.pl-spalte[data-id="supertack"]').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".pl-detail h2").textContent()).includes("SuperTack") && (await el(p).locator(".pl-detail").textContent()).includes("TPU"), "SuperTack gewählt: Details mit Warnung zu TPU");
await el(p).locator(".pl-detail").scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/platten-supertack.png` });
pruefe(await kein_seitwaerts(p), "Desktop: kein seitliches Scrollen");

// ---------------- Handy ----------------
p = await seite(390, 844, true);
await tab(p, "trockner");
await p.evaluate(() => { window.el._daten.trockner_plaetze = ["m:PLA", "m:ASA"]; window.el._zeichnen(); });
await p.waitForTimeout(300);
await el(p).locator(".hi-kombi").scrollIntoViewIfNeeded();
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/handy-trockner-getrennt.png` });
pruefe(await kein_seitwaerts(p), "Handy Trockner: kein seitliches Scrollen");
await el(p).locator(".hi-kombi").screenshot({ path: `${out}/handy-trockner-karte.png` });
await p.evaluate(() => { window.el._daten.trockner_plaetze = ["m:PLA", "m:TPU"]; window.el._zeichnen(); });
await p.waitForTimeout(300);
await el(p).locator(".hi-kombi").screenshot({ path: `${out}/handy-trockner-pla-tpu.png` });
await tab(p, "konstruktion");
await p.screenshot({ path: `${out}/handy-konstruktion.png` });
pruefe(await kein_seitwaerts(p), "Handy Konstruktion: kein seitliches Scrollen");
await el(p).locator('[data-aktion="hi-auf"][data-id="kn:schrauben"]').tap();
await p.waitForTimeout(450);
await el(p).locator('.hi-eintrag[data-eintrag="kn:schrauben"]').scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/handy-konstruktion-schrauben.png` });
pruefe(await kein_seitwaerts(p), "Handy Konstruktion aufgeklappt: kein seitliches Scrollen");
await tab(p, "lexikon");
await el(p).locator(".lex-eintrag .hi-eintrag-kopf").first().tap();
await p.waitForTimeout(450);
await p.screenshot({ path: `${out}/handy-lexikon.png` });
pruefe(await kein_seitwaerts(p), "Handy Lexikon: kein seitliches Scrollen");
await tab(p, "platten");
await p.screenshot({ path: `${out}/handy-platten.png` });
const passt = await el(p).locator(".pl-matrix").evaluate((m) => m.scrollWidth <= m.clientWidth + 1 && m.getBoundingClientRect().right <= 390);
pruefe(passt && await kein_seitwaerts(p), "Handy Platten: Matrix passt in die Breite");
await el(p).locator(".pl-detail").scrollIntoViewIfNeeded();
await p.screenshot({ path: `${out}/handy-platten-detail.png` });

await b.close();
console.log(fehler.length ? "\nFehler:\n" + fehler.join("\n") : "\nAlles grün.");
process.exit(fehler.length ? 1 : 0);
