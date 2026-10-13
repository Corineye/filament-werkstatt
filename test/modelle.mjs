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
  await p.goto(`http://localhost:${process.env.TEST_PORT || 8765}/test/test.html`);
  await p.waitForTimeout(800);
  return p;
}
const el = (p) => p.locator("filament-werkstatt-panel");
const kam = (p) => p.evaluate(() => { const b = document.querySelector("filament-werkstatt-panel")._buehne; return { f: b._f(), r: b.r, u: b.u, ziel: b.ziel, abstand: b.abstand, neig: b.neigung(), unten: b.unterBett(), art: b.orbitArt, getroffen: b.drehpunktGetroffen, dp: b.drehpunkt }; });
const nah = (a, b, tol = 0.02) => a.every((x, i) => Math.abs(x - b[i]) < tol);
const imBild = async (p, loc) => { const bb = await loc.boundingBox(); const vp = p.viewportSize(); return !!bb && bb.y >= 0 && bb.y + bb.height <= vp.height && bb.x >= 0 && bb.x + bb.width <= vp.width; };
const muster = (p, id) => el(p).locator('select[data-mod="muster"]').evaluate((s, id) => { s.value = id; s.dispatchEvent(new Event("change", { bubbles: true })); }, id);
const musterFertig = (p, id) => warte(p, async () => p.evaluate((id) => { const m = document.querySelector("filament-werkstatt-panel")._mod; return m.muster === id && m.schichtFortschritt === 1 && m.schichtSchluessel.includes(`|${id}|`); }, id), 40000);
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

// ---- Warteschlange: immer sichtbar, nicht im Menü ----
const ws = el(p).locator('.mod-fuss [data-aktion="ws-aus-modell"]');
pruefe(await ws.isVisible() && await imBild(p, ws), "„In die Warteschlange“ sichtbar (Übersicht)");
const wsVorher = await p.evaluate(() => document.querySelector("filament-werkstatt-panel")._daten.warteschlange.length);
await ws.click();
await p.waitForTimeout(200);
pruefe(await p.evaluate((n) => document.querySelector("filament-werkstatt-panel")._daten.warteschlange.length === n + 1, wsVorher), "Warteschlange-Knopf legt einen Auftrag an");

// ---- Ausrichtungswürfel ----
pruefe((await el(p).locator(".mod-w-flaeche").count()) === 6 && (await el(p).locator(".mod-w-zone").count()) === 54, "Würfel: 6 Flächen mit Kanten und Ecken (54 Zonen)");
const wTexte = await el(p).locator(".mod-w-zone.flaeche span").allTextContents();
pruefe(["OBEN", "UNTEN", "VORNE", "HINTEN", "LINKS", "RECHTS"].every((t) => wTexte.includes(t)), "Würfel beschriftet: OBEN UNTEN VORNE HINTEN LINKS RECHTS");
pruefe((await el(p).locator("#mod-achsen line").count()) === 3, "XYZ-Achsenkreuz da");
const tf0 = await el(p).locator("#mod-w-koerper").evaluate((k) => k.style.transform);
await el(p).locator(".w-oben .mod-w-zone.flaeche").click();
await p.waitForTimeout(800);
let k1 = await kam(p);
pruefe(nah(k1.f, [0, 0, -1]) && nah(k1.u, [0, 1, 0]), "Klick auf OBEN: Blick von oben, vorne unten im Bild");
const tf1 = await el(p).locator("#mod-w-koerper").evaluate((k) => k.style.transform);
pruefe(tf0 !== tf1 && tf1.startsWith("matrix3d"), "Würfel dreht sich mit der Kamera");
await el(p).locator('.mod-w-zone.flaeche[data-d="0,-1,0"]').evaluate((b) => b.click());
await p.waitForTimeout(800);
pruefe(nah((await kam(p)).f, [0, 1, 0]), "Klick auf VORNE: Blick von vorne");
await el(p).locator('.mod-w-zone.ecke[data-d="1,-1,1"]').first().evaluate((b) => b.click());
await p.waitForTimeout(800);
const s3 = 1 / Math.sqrt(3);
pruefe(nah((await kam(p)).f, [-s3, s3, -s3]), "Klick auf eine Ecke: Blick schräg von vorne rechts oben");
await el(p).locator('.mod-w-zone.kante[data-d="1,0,1"]').first().evaluate((b) => b.click());
await p.waitForTimeout(800);
pruefe(nah((await kam(p)).f, [-Math.SQRT1_2, 0, -Math.SQRT1_2]), "Klick auf eine Kante: Blick von rechts oben");
await p.screenshot({ path: `${out}/m11-wuerfel-kante.png` });

// ---- Von unten (unter die Druckplatte) ----
await el(p).locator('.mod-w-zone.flaeche[data-d="0,0,-1"]').evaluate((b) => b.click());
await p.waitForTimeout(900);
k1 = await kam(p);
pruefe(k1.unten && nah(k1.f, [0, 0, 1]), "UNTEN: Kamera unter der Druckplatte");
pruefe(await p.evaluate(() => document.querySelector("filament-werkstatt-panel")._buehne.objekte.get("bett").alpha < 0.5), "Druckplatte von unten durchscheinend");
await p.screenshot({ path: `${out}/m12-von-unten.png` });

// ---- Orbit-Menü ----
await el(p).locator('[data-aktion="mod-ansicht"][data-id="iso"]').click();
await p.waitForTimeout(800);
await el(p).locator(".mod-orbit-knopf").click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".mod-orbit-menue .mod-orbit-punkt").count()) === 3 && (await el(p).locator(".mod-orbit-menue").textContent()).includes("Eingeschränkter Orbit"), "Orbit-Menü: Orbit, Eingeschränkter Orbit, Würfel-Schalter");
await p.screenshot({ path: `${out}/m13-orbit-menue.png` });
await el(p).locator('[data-aktion="mod-orbit-art"][data-id="frei"]').click();
await p.waitForTimeout(300);
pruefe((await kam(p)).art === "frei" && (await el(p).locator(".mod-orbit-menue").count()) === 0, "Freier Orbit gewählt, Menü zu");

// Orbit um die Stelle unter dem Zeiger: Drehpunkt bleibt an seiner Bildschirmstelle
const cv = await el(p).locator("canvas.buehne-canvas").boundingBox();
const ziel3 = await p.evaluate(() => document.querySelector("filament-werkstatt-panel")._buehne.projizieren([100, 115, 16]));
await p.mouse.move(cv.x + ziel3[0], cv.y + ziel3[1]);
await p.mouse.down();
for (let i = 1; i <= 8; i++) await p.mouse.move(cv.x + ziel3[0] + i * 12, cv.y + ziel3[1] + i * 5);
await p.waitForTimeout(150);
k1 = await kam(p);
pruefe(k1.getroffen && Math.abs(k1.dp[2] - 16) < 0.3, `Drehpunkt auf dem Modell getroffen (z ≈ ${k1.dp && k1.dp[2].toFixed(2)})`);
const dpBild = await p.evaluate((dp) => document.querySelector("filament-werkstatt-panel")._buehne.projizieren(dp), k1.dp);
pruefe(Math.hypot(dpBild[0] - ziel3[0], dpBild[1] - ziel3[1]) < 3, "Drehpunkt bleibt beim Drehen an seiner Stelle");
pruefe((await el(p).locator("#mod-drehpunkt.an").count()) === 1, "Drehpunkt wird angezeigt");
await p.screenshot({ path: `${out}/m14-orbit-drehpunkt.png` });
await p.mouse.up();
// Daneben ziehen: Modellmitte als Drehpunkt
await p.mouse.move(cv.x + 20, cv.y + cv.height - 60);
await p.mouse.down();
await p.mouse.move(cv.x + 60, cv.y + cv.height - 60, { steps: 4 });
k1 = await kam(p);
await p.mouse.up();
pruefe(k1.getroffen === false && nah(k1.dp, [128, 128, 8], 0.6), "Neben dem Modell: Drehpunkt ist die Modellmitte");
// Eingeschränkter Orbit: waagerecht, bis unter die Platte, nie über Kopf
await el(p).locator(".mod-orbit-knopf").click();
await el(p).locator('[data-aktion="mod-orbit-art"][data-id="eingeschraenkt"]').click();
await p.waitForTimeout(200);
k1 = await kam(p);
pruefe(k1.art === "eingeschraenkt" && Math.abs(k1.r[2]) < 1e-6, "Eingeschränkter Orbit: wieder waagerecht ausgerichtet");
await p.mouse.move(cv.x + 30, cv.y + 300);
await p.mouse.down();
await p.mouse.move(cv.x + 30, cv.y + 40, { steps: 10 });
await p.mouse.up();
k1 = await kam(p);
pruefe(k1.neig < -5 && k1.unten && Math.abs(k1.r[2]) < 1e-6, `Nach oben ziehen: Blick von unten (${k1.neig.toFixed(1)}°)`);
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/m15-unter-platte.png` });
await p.mouse.move(cv.x + 30, cv.y + 120);
await p.mouse.down();
await p.mouse.move(cv.x + 30, cv.y + 900, { steps: 14 });
await p.mouse.up();
k1 = await kam(p);
pruefe(k1.neig <= 89.6 && k1.neig > 80, `Weit nach unten ziehen: höchstens senkrecht von oben (${k1.neig.toFixed(1)}°)`);
// Würfel ziehen dreht die Ansicht (Schalter)
const wb = await el(p).locator("#mod-wuerfel").boundingBox();
const vorZiehen = await kam(p);
await p.mouse.move(wb.x + wb.width / 2, wb.y + wb.height / 2);
await p.mouse.down();
await p.mouse.move(wb.x + wb.width / 2 + 40, wb.y + wb.height / 2 + 10, { steps: 6 });
await p.mouse.up();
await p.waitForTimeout(500);
const nachZiehen = await kam(p);
pruefe(!nah(vorZiehen.r, nachZiehen.r, 0.05), "Würfel ziehen dreht die Ansicht");
await el(p).locator(".mod-orbit-knopf").click();
await el(p).locator('[data-aktion="mod-wuerfel-ziehen"]').click();
await p.waitForTimeout(200);
pruefe((await el(p).locator(".mod-wuerfel-ecke.ziehbar").count()) === 0, "Würfel-Ziehen abgeschaltet");
await el(p).locator(".mod-orbit-knopf").click();
const vor2 = await kam(p);
await p.mouse.move(wb.x + wb.width / 2, wb.y + wb.height / 2);
await p.mouse.down();
await p.mouse.move(wb.x + wb.width / 2 + 40, wb.y + wb.height / 2 + 10, { steps: 6 });
await p.mouse.up();
pruefe(nah(vor2.r, (await kam(p)).r, 1e-4), "Abgeschaltet: Ziehen am Würfel dreht nicht");
await el(p).locator(".mod-orbit-knopf").click();
await el(p).locator('[data-aktion="mod-wuerfel-ziehen"]').click();
await el(p).locator('[data-aktion="mod-ansicht"][data-id="iso"]').click();
await p.waitForTimeout(800);

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
// Löcher löschen: das von Hand gesetzte und ein erkanntes, dann zurückholen
await el(p).locator('.mod-loch-weg[data-nr="6"]').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".mod-pin").count()) === 5 && (await el(p).locator(".mod-loch").count()) === 5, "Von Hand gesetztes Loch gelöscht");
await el(p).locator('.mod-loch-weg[data-nr="1"]').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".mod-pin").count()) === 4 && (await el(p).locator('[data-aktion="mod-loch-zurueck"]').count()) === 1, "Erkanntes Loch gelöscht, Zurückholen angeboten");
await p.screenshot({ path: `${out}/m3d-geloescht.png` });
await el(p).locator('[data-aktion="mod-loch-zurueck"]').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".mod-pin").count()) === 5 && (await el(p).locator('[data-aktion="mod-loch-zurueck"]').count()) === 0, "Gelöschtes Loch zurückgeholt");
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
pruefe(await imBild(p, el(p).locator('.mod-fuss [data-aktion="ws-aus-modell"]')), "„In die Warteschlange“ auch bei Schichten sichtbar");

// ---- Füllmuster ----
const musterListe = await el(p).locator('select[data-mod="muster"] option').evaluateAll((o) => o.map((x) => x.value));
pruefe(musterListe.length === 22 && ["grid", "gyroid", "honeycomb", "cubic", "lightning", "hilbertcurve", "crosshatch", "3dhoneycomb", "lockedzag", "2dlattice"].every((x) => musterListe.includes(x)), `Füllmuster wie in Bambu Studio (${musterListe.length})`);
const fuellHash = (nr) => p.evaluate((nr) => {
  const m = document.querySelector("filament-werkstatt-panel")._mod, l = m.schichtLinien, f = m.schichtFarben;
  let h = 0, n = 0;
  for (let i = nr > 1 ? m.schichtEnden[nr - 2] : 0; i < m.schichtEnden[nr - 1]; i += 2) {
    if (Math.abs(f[i * 3] - 0.85) > 0.01 || Math.abs(f[i * 3 + 1] - 0.3) > 0.01) continue;   // nur Füllung
    h = (h * 31 + Math.round(l[i * 3] * 10) * 7 + Math.round(l[i * 3 + 1] * 10)) % 1000000007; n++;
  }
  return { h, n };
}, nr);
const gridA = await fuellHash(30), gridB = await fuellHash(31);
const vorschauGrid = await el(p).locator(".mod-muster-vorschau").innerHTML();
await muster(p, "gyroid");
pruefe(await musterFertig(p, "gyroid"), "Gyroid gewählt, Schichten neu berechnet");
pruefe((await el(p).locator(".mod-muster-vorschau").innerHTML()) !== vorschauGrid && (await el(p).locator(".mod-muster").textContent()).includes("ändert sich je Schicht"), "Vorschau und Beschreibung zum Muster");
const gyA = await fuellHash(30), gyB = await fuellHash(31);
pruefe(gridA.h === gridB.h && gridA.n > 0, "Gitter: jede Schicht gleich");
pruefe(gyA.n > 0 && gyA.h !== gyB.h && gyA.h !== gridA.h, "Gyroid: ändert sich von Schicht zu Schicht");
await el(p).locator('[data-mod="schicht"]').evaluate((r) => { r.value = 30; r.dispatchEvent(new Event("input", { bubbles: true })); });
await el(p).locator('.mod-w-zone.flaeche[data-d="0,0,1"]').evaluate((b) => b.click());
await p.waitForTimeout(900);
await p.screenshot({ path: `${out}/m16-gyroid-oben.png` });
for (const [id, datei] of [["honeycomb", "m17-wabe"], ["hilbertcurve", "m18-hilbert"], ["cubic", "m19-kubisch"]]) {
  await muster(p, id);
  pruefe(await musterFertig(p, id), `Muster ${id} berechnet`);
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/${datei}.png` });
}
const cA = await fuellHash(30), cB = await fuellHash(31);
pruefe(cA.n > 0 && cA.h !== cB.h, "Kubisch wandert mit der Höhe");
await el(p).locator('[data-aktion="mod-ansicht"][data-id="iso"]').click();
await p.waitForTimeout(700);

// ---- Drehen: 90° bleibt, dazu Benutzerdefiniert ----
await el(p).locator('.tab[data-aktion="mod-tab"][data-id="uebersicht"]').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator('.mod-dreh [data-aktion="mod-drehen"]').count()) === 3, "90°-Knöpfe weiter da");
await el(p).locator('[data-aktion="mod-dreh-eigen"]').click();
await p.waitForTimeout(300);
pruefe((await el(p).locator(".mod-dreh-feld input").count()) === 3, "Benutzerdefiniert: Felder für X, Y, Z");
await el(p).locator("#mod-dreh-2").fill("90");
await p.waitForTimeout(200);
pruefe(await p.evaluate(() => Math.abs(document.querySelector("filament-werkstatt-panel")._buehne.objekte.get("modell").m[0]) < 0.01), "Vorschau dreht das Modell schon mit");
await p.screenshot({ path: `${out}/m20-drehen-eigen.png` });
await el(p).locator('[data-aktion="mod-dreh-anwenden"]').click();
await p.waitForTimeout(500);
let mm = (await el(p).locator(".mod-masse").textContent()).replace(/\s+/g, " ");
pruefe(/X\s*40,0.*Y\s*78,0/.test(mm), `Z um 90° gedreht: 40 × 78 (${mm.trim()})`);
await el(p).locator("#mod-dreh-2").fill("-45");
await el(p).locator('[data-aktion="mod-dreh-plus"][data-g="-45"]').click();
await el(p).locator('[data-aktion="mod-dreh-anwenden"]').click();
await p.waitForTimeout(500);
mm = (await el(p).locator(".mod-masse").textContent()).replace(/\s+/g, " ");
pruefe(/X\s*78,0.*Y\s*40,0/.test(mm), `Mit −45° und Schnellknopf −45° zurück: 78 × 40 (${mm.trim()})`);
await el(p).locator("#mod-dreh-0").evaluate((i) => { i.type = "text"; i.value = "12,5"; i.dispatchEvent(new Event("input", { bubbles: true })); });
await p.waitForTimeout(100);
pruefe(await p.evaluate(() => document.querySelector("filament-werkstatt-panel")._mod.drehWerte[0] === 12.5), "Komma als Dezimalzeichen: 12,5°");
// Bei schrägen Winkeln liegt der tiefste Punkt in der Vorschau genau auf dem Bett
const tiefster = () => p.evaluate(() => {
  const e = document.querySelector("filament-werkstatt-panel"), v = e._mod.v, M = e._buehne.objekte.get("modell").m;
  let u = Infinity;
  for (let i = 0; i < v.length; i += 3) u = Math.min(u, M[2] * v[i] + M[6] * v[i + 1] + M[10] * v[i + 2] + M[14]);
  return u;
});
await el(p).locator("#mod-dreh-0").fill("30");
await p.waitForTimeout(150);
let u = await tiefster();
pruefe(Math.abs(u) < 0.01, `Vorschau X 30°: tiefster Punkt auf dem Bett (${u.toFixed(3)} mm)`);
await el(p).locator("#mod-dreh-1").fill("-47");
await p.waitForTimeout(150);
u = await tiefster();
pruefe(Math.abs(u) < 0.01, `Vorschau X 30°, Y −47°: tiefster Punkt auf dem Bett (${u.toFixed(3)} mm)`);
await p.screenshot({ path: `${out}/m26-drehen-schraeg.png` });
await el(p).locator("#mod-dreh-1").fill("0");
await el(p).locator('[data-aktion="mod-dreh-null"]').click();

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
pruefe(await el(p).locator(".mod-wuerfel-ecke").isVisible(), "Handy: Ausrichtungswürfel sichtbar");
const wsH = el(p).locator('.mod-fuss [data-aktion="ws-aus-modell"]');
const navTop = (await el(p).locator(".nav-unten").boundingBox()).y;
const wsBox = await wsH.boundingBox();
pruefe(wsBox && wsBox.y + wsBox.height <= navTop + 1 && wsBox.y > 0, "Handy: „In die Warteschlange“ sofort sichtbar über der unteren Leiste");
// Ein Finger dreht, zwei Finger zoomen
const cvH = await el(p).locator("canvas.buehne-canvas").boundingBox();
const cdpH = await p.context().newCDPSession(p);
const tvor = await kam(p);
await cdpH.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: cvH.x + 60, y: cvH.y + 300 }] });
for (let i = 1; i <= 8; i++) await cdpH.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: cvH.x + 60 + i * 15, y: cvH.y + 300 }] });
await cdpH.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await p.waitForTimeout(150);
const tnach = await kam(p);
pruefe(!nah(tvor.r, tnach.r, 0.05), "Handy: ein Finger dreht");
await cdpH.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: cvH.x + 150, y: cvH.y + 250, id: 1 }, { x: cvH.x + 250, y: cvH.y + 250, id: 2 }] });
for (let i = 1; i <= 6; i++) await cdpH.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: cvH.x + 150 - i * 12, y: cvH.y + 250, id: 1 }, { x: cvH.x + 250 + i * 12, y: cvH.y + 250, id: 2 }] });
await cdpH.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await p.waitForTimeout(150);
pruefe((await kam(p)).abstand < tnach.abstand * 0.9, "Handy: zwei Finger zoomen");
await el(p).locator('[data-aktion="mod-ansicht"][data-id="iso"]').click();
await p.waitForTimeout(700);
await el(p).locator('.mod-w-zone.ecke[data-d="1,-1,-1"]').first().evaluate((b) => b.click());
await p.waitForTimeout(800);
await p.screenshot({ path: `${out}/m21-handy-unten.png` });
await el(p).locator(".mod-orbit-knopf").click();
await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/m22-handy-orbit.png` });
await el(p).locator('[data-aktion="mod-orbit-art"][data-id="eingeschraenkt"]').click();
await el(p).locator('[data-aktion="mod-ansicht"][data-id="iso"]').click();
await el(p).locator('[data-aktion="mod-dreh-eigen"]').click();
await p.waitForTimeout(300);
await el(p).locator("#mod-dreh-0").fill("30");
await p.waitForTimeout(200);
await el(p).locator(".mod-dreh-eigen").scrollIntoViewIfNeeded();
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/m23-handy-drehen.png` });
await el(p).locator('[data-aktion="mod-dreh-null"]').click();
await el(p).locator('.tab[data-aktion="mod-tab"][data-id="schichten"]').click();
await warte(p, async () => p.evaluate(() => document.querySelector("filament-werkstatt-panel")._mod.schichtFortschritt === 1), 40000);
await muster(p, "gyroid");
pruefe(await musterFertig(p, "gyroid"), "Handy: Gyroid berechnet");
await p.evaluate(() => { const h = document.querySelector("filament-werkstatt-panel").shadowRoot.querySelector(".haupt"); h.scrollTop = 0; });
await el(p).locator('[data-aktion="mod-ansicht"][data-id="iso"]').click();
await p.waitForTimeout(800);
await p.screenshot({ path: `${out}/m24-handy-gyroid.png` });
await el(p).locator(".mod-muster").scrollIntoViewIfNeeded();
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/m25-handy-muster.png` });
pruefe(await imBild(p, wsH), "Handy: Warteschlange-Knopf bleibt beim Scrollen sichtbar");
await el(p).locator('.tab[data-aktion="mod-tab"][data-id="uebersicht"]').click();
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
