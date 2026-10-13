// 3D-Modelle: STL laden, Maße, Löcher mit Teilen, Schichten, G-Code (.gcode.3mf), Handy-Ansicht.
import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PFAD || "playwright");
const out = process.argv[2] || "test/bilder";
const b = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
const fehler = [];
const pruefe = (ok, text) => { if (!ok) fehler.push("Prüfung fehlgeschlagen: " + text); console.log((ok ? "✓ " : "✕ ") + text); };
async function seite(breite, hoehe, mobil = false) {
  const ctx = await b.newContext({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 2, hasTouch: mobil, isMobile: mobil });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => fehler.push(e.message));
  p.on("console", (m) => m.type() === "error" && !m.text().includes("404") && fehler.push(m.text()));
  await p.goto("http://localhost:8765/test/test.html");
  await p.waitForTimeout(800);
  return p;
}
const el = (p) => p.locator("filament-werkstatt-panel");
const warte = async (p, f, ms = 15000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await f()) return true; await p.waitForTimeout(150); } return false; };

// ---- Desktop: leere Ansicht, STL laden ----
let p = await seite(1400, 900);
await el(p).locator('.nav-oben [data-id="modelle"]').click();
await p.waitForTimeout(400);
pruefe((await el(p).locator(".ablage").count()) === 1, "Leere Ansicht mit Ablagefeld");
await p.screenshot({ path: `${out}/m1-leer.png` });
await el(p).locator('input[data-mod="datei"]').setInputFiles("test/modelle/halter.stl");
pruefe(await warte(p, async () => (await el(p).locator(".mod-masse").count()) === 1), "STL geladen, Maße sichtbar");
const masse = await el(p).locator(".mod-masse").textContent();
pruefe(masse.includes("78,0") && masse.includes("40,0") && masse.includes("16,0"), `Maße 78 × 40 × 16 mm (${masse.replace(/\s+/g, " ").trim()})`);
const ueb = await el(p).locator(".mod-inhalt").textContent();
pruefe(ueb.includes("Passt aufs Druckbett") && /≈ \d+(,\d)? g/.test(ueb), "Bett-Check und Gewicht");
pruefe(ueb.includes("brauchen Stützen"), "Überhang erkannt");
pruefe(await warte(p, async () => (await el(p).locator(".mod-pin").count()) === 5), "5 Loch-Markierungen in der Ansicht");
pruefe(await el(p).locator("canvas.buehne-canvas").evaluate((c) => c.width > 100 && c.height > 100), "WebGL-Bühne hat Größe");
await p.waitForTimeout(500);
await p.screenshot({ path: `${out}/m2-stl.png` });

// ---- Löcher ----
await el(p).locator('.tab[data-aktion="mod-tab"][data-id="loecher"]').click();
await p.waitForTimeout(300);
const loecher = await el(p).locator(".mod-loecher").textContent();
pruefe(loecher.includes("Ø 10,15") && loecher.includes("Ø 4,20") && loecher.includes("Ø 3,40"), "Lochdurchmesser 10,15 / 4,20 / 3,40");
pruefe(loecher.includes("Sackloch") && loecher.includes("durchgehend"), "Sackloch und Durchgang unterschieden");
// Loch mit Ø 4,2 öffnen → Einsatz M3 vorgeschlagen
const k = el(p).locator(".mod-loch", { hasText: "Ø 4,20" }).first().locator(".mod-loch-kopf");
await k.click();
await p.waitForTimeout(300);
const vor = await el(p).locator(".mod-vorschlaege").textContent();
pruefe(/M3/.test(vor) && /Einsatz|Gewindeeinsatz/i.test(vor), "M3-Einsatz für Ø 4,2 vorgeschlagen");
await el(p).locator('.mod-vorschlag [data-aktion="mod-einsetzen"]').first().click();
await p.waitForTimeout(1200);
pruefe((await el(p).locator(".mod-pin.drin").count()) === 1, "Teil eingesetzt (Markierung grün)");
await el(p).locator('[data-aktion="mod-alle-einsetzen"]').click();
await p.waitForTimeout(2200);
const liste = await el(p).locator(".mod-inhalt").textContent();
pruefe(liste.includes("Teileliste") && (await el(p).locator(".mod-pin.drin").count()) >= 4, "Alle passenden eingesetzt, Teileliste da");
pruefe(/Magnet/i.test(liste), "Magnet für die Ø10-Tasche"); if (!/Magnet/i.test(liste)) console.log(liste);
await p.screenshot({ path: `${out}/m3-loecher.png` });
// Loch von Hand markieren: auf die Oberseite tippen
await el(p).locator('[data-aktion="mod-markieren"]').first().click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".mod-markier-hinweis").count()) === 1, "Markier-Hinweis sichtbar");
const pkt = await p.evaluate(() => { const x = document.querySelector("filament-werkstatt-panel"); const s = x._buehne.projizieren([106, 140, 16]); const r = x._buehne.canvas.getBoundingClientRect(); return [r.left + s[0], r.top + s[1]]; });
await p.mouse.click(pkt[0], pkt[1]);
await p.waitForTimeout(400);
pruefe((await el(p).locator(".mod-pin").count()) === 6 && (await el(p).locator(".mod-manuell").count()) === 1, "Loch 6 von Hand gesetzt, Regler offen");
await el(p).locator('[data-mod="loch-d"]').evaluate((r) => { r.value = 10.15; r.dispatchEvent(new Event("input", { bubbles: true })); r.dispatchEvent(new Event("change", { bubbles: true })); });
await p.waitForTimeout(300);
pruefe(/Magnet/.test(await el(p).locator(".mod-loch.auf").textContent()), "Ø 10,15 von Hand → Magnet vorgeschlagen");
await p.screenshot({ path: `${out}/m3c-hand.png` });
await el(p).locator('[data-aktion="mod-ansicht"][data-id="vorne"]').click();
await p.waitForTimeout(500);
await p.screenshot({ path: `${out}/m3b-vorne.png` });

// ---- Schichten ----
await el(p).locator('.tab[data-aktion="mod-tab"][data-id="schichten"]').click();
await el(p).locator('[data-aktion="mod-stuetzen"][data-id="baum-schlank"]').click();
pruefe(await warte(p, async () => ((await el(p).locator(".mod-inhalt").textContent()) || "").includes("davon Stützen"), 40000) && (await el(p).locator('[data-mod="schicht"]').count()) === 1, "Schichten berechnet, Regler da");
const sch = await el(p).locator(".mod-inhalt").textContent();
pruefe(sch.includes("0,2 mm") && sch.includes("0,4 mm") && sch.includes("0,6 mm") && !sch.includes("0,8 mm"), "Nur Düsen aus dem Inventar");
pruefe(sch.includes("80") && sch.includes("davon Stützen"), "80 Schichten bei 0,2 mm, Stützen-Gewicht"); if (!sch.includes("davon")) console.log(sch);
await el(p).locator('[data-mod="schicht"]').evaluate((r) => { r.value = 40; r.dispatchEvent(new Event("input", { bubbles: true })); });
await p.waitForTimeout(400);
pruefe((await el(p).locator("#mod-schicht-text").textContent()).includes("Schicht 40 von 80"), "Schicht 40 gewählt");
await el(p).locator('[data-aktion="mod-ansicht"][data-id="iso"]').click();
await p.waitForTimeout(500);
await p.screenshot({ path: `${out}/m4-schichten.png` });
await el(p).locator('[data-aktion="mod-stuetzen-hilfe"]').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".stuetz-eintrag").count()) === 5, "Stützen-Erklärung mit 5 Bildern");
await p.screenshot({ path: `${out}/m5-stuetzen.png` });
await el(p).locator('.dialog [data-aktion="dialog-zu"]').click();

// ---- G-Code über den Plus-Knopf ----
await el(p).locator(".mod-plus").click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".dialog .ablage").count()) === 1, "Plus öffnet Datei-Dialog");
await el(p).locator('.dialog input[data-mod="datei"]').setInputFiles("test/modelle/kasten.gcode.3mf");
pruefe(await warte(p, async () => ((await el(p).locator(".mod-inhalt").textContent()) || "").includes("4,5 g")), "G-Code aus .gcode.3mf: 4,5 g");
const gc = await el(p).locator(".mod-inhalt").textContent();
pruefe(gc.includes("18m 4s") && gc.includes("PLA") && gc.includes("30"), "Zeit, Material, 30 Schichten");
await el(p).locator('.tab[data-aktion="mod-tab"][data-id="schichten"]').click();
await p.waitForTimeout(300);
await el(p).locator('[data-mod="schicht"]').evaluate((r) => { r.value = 15; r.dispatchEvent(new Event("input", { bubbles: true })); });
await p.waitForTimeout(500);
await p.screenshot({ path: `${out}/m6-gcode.png` });
await el(p).locator('[data-aktion="mod-schliessen"]').click();
await p.waitForTimeout(400);
pruefe((await el(p).locator(".mod-zuletzt").count()) === 2, "Zuletzt geöffnet: 2 Dateien");
await p.screenshot({ path: `${out}/m7-zuletzt.png` });

// ---- Handy ----
p = await seite(390, 844, true);
await el(p).locator('.nav-unten [data-id="modelle"]').click();
await p.waitForTimeout(400);
await p.screenshot({ path: `${out}/m8-handy-leer.png` });
await el(p).locator('input[data-mod="datei"]').setInputFiles("test/modelle/halter.stl");
await warte(p, async () => (await el(p).locator(".mod-pin").count()) === 5);
await p.waitForTimeout(400);
await p.screenshot({ path: `${out}/m9-handy-stl.png` });
await el(p).locator('.tab[data-aktion="mod-tab"][data-id="loecher"]').click();
await el(p).locator('[data-aktion="mod-alle-einsetzen"]').click();
await p.waitForTimeout(2200);
await p.screenshot({ path: `${out}/m10-handy-loecher.png` });

// ---- Handy: Detailansicht nach unten wegwischen ----
await el(p).locator('.nav-unten [data-id="inventar"]').click();
await p.waitForTimeout(400);
await el(p).locator(".kachel, .inv-kachel, [data-aktion='inv-teil']").first().click();
await p.waitForTimeout(500);
pruefe((await el(p).locator(".sheet").count()) === 1, "Detailansicht offen");
const box = await el(p).locator(".sheet .sheet-kopf").boundingBox();
const wisch = async (von, bis, schritte) => {
  const cdp = await p.context().newCDPSession(p);
  const x = box.x + box.width / 2;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: von }] });
  for (let i = 1; i <= schritte; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: von + ((bis - von) * i) / schritte }] }); await p.waitForTimeout(16); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
};
await wisch(box.y + 20, box.y + 80, 6);
await p.waitForTimeout(400);
pruefe((await el(p).locator(".sheet").count()) === 1, "Kurzes Wischen: bleibt offen");
await wisch(box.y + 20, box.y + 320, 10);
await p.waitForTimeout(500);
pruefe((await el(p).locator(".sheet").count()) === 0, "Weit nach unten wischen: geschlossen");

await b.close();
if (fehler.length) { console.log("\nFEHLER:\n" + fehler.join("\n")); process.exit(1); }
console.log("\nAlles grün.");
