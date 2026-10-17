// Hilfe › Kunststoffe (Materialkarten, Filter, Suche, Unterarten, eigene Rollen) und Fehlercodes.
import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PFAD || "playwright");
const out = process.argv[2] || "test/bilder";
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
const karten = (p) => el(p).locator(".ks-karte");
const namen = (p) => el(p).locator(".ks-karte .ks-name strong").allTextContents();
const breiteOk = (p) => p.evaluate(() => { const h = window.el.shadowRoot.querySelector(".haupt"); return h.scrollWidth - h.clientWidth <= 1; });

// ---------------- Desktop ----------------
let p = await seite(1400, 900);
await tab(p, "kunststoffe");
const alle = await karten(p).count();
pruefe(alle >= 16, `Kunststoffe: ${alle} Materialkarten`);
const n0 = await namen(p);
pruefe(["PLA", "PETG", "ABS", "ASA", "PC", "TPU", "PA / Nylon", "PET-CF", "PPA-CF", "PPS-CF", "Stützmaterial", "HIPS"].every((x) => n0.includes(x)), "Alle Grundmaterialien inkl. Stützmaterial und Fremdmaterialien");
const pla = el(p).locator('.ks-karte[data-ks-karte="pla"]');
const plaText = await pla.textContent();
pruefe(plaText.includes("190–230 °C") && plaText.includes("55 °C · 8 h") && plaText.includes("Gehärtet") && plaText.includes("Druckplatte") && plaText.includes("Gehäuse"), "PLA-Karte zeigt Düse, Bett, Platte, Gehäuse, Trocknen, gehärtete Düse");
pruefe((await pla.locator(".ks-ampel.gruen").count()) === 1, "PLA: P1S-Ampel grün");
pruefe((await el(p).locator('.ks-karte[data-ks-karte="ppscf"] .ks-ampel.rot').count()) === 1, "PPS-CF: P1S-Ampel rot");
pruefe((await el(p).locator('.ks-karte[data-ks-karte="pa"] .ks-ampel.orange').count()) === 1, "PA/Nylon: Ampel „Umrüstung“");
// Eigene Rollen als Chips
const plaRollen = await p.evaluate(() => window.el._daten.rollen.filter((r) => r.material === "PLA").length);
pruefe((await pla.locator(".ks-rolle").count()) === 3 && (await pla.locator(".ks-mehr").textContent()).includes(`+${plaRollen - 3}`), `PLA-Karte zeigt 3 Rollen-Chips und „+${plaRollen - 3} weitere“`);
await p.screenshot({ path: `${out}/ks1-kunststoffe-uebersicht.png` });

// Aufklappen: Details und Unterarten
await pla.locator(".ks-kopf").click();
await p.waitForTimeout(450);
const plaAuf = el(p).locator('.ks-karte[data-ks-karte="pla"]');
let t = await plaAuf.textContent();
pruefe((await plaAuf.locator(":scope > .ks-rollen .ks-rolle").count()) === plaRollen, `Aufgeklappt: alle ${plaRollen} eigenen PLA-Rollen als Chips`);
pruefe(t.includes("Stärken") &&t.includes("Schwächen") && t.includes("Sicherheit") && t.includes("Lebensmittel"), "Aufgeklappt: Anwendungen, Stärken/Schwächen, Sicherheit, Lebensmittel");
const unterarten = await plaAuf.locator(".ks-variante").count();
pruefe(unterarten >= 15, `PLA: ${unterarten} Unterarten`);
pruefe(["PLA Basic", "PLA Matte", "PLA Silk / Silk+", "PLA Wood", "PLA-CF", "PLA Glow", "PLA Aero", "PLA Pure"].every((x) => t.includes(x)), "PLA-Unterarten Basic, Matte, Silk, Wood, CF, Glow, Aero, Pure");
const silk = plaAuf.locator(".ks-variante", { hasText: "PLA Silk / Silk+" }).first();
await silk.locator(".ks-var-kopf").click();
await p.waitForTimeout(450);
t = await el(p).locator(".ks-variante.auf").first().textContent();
pruefe(t.includes("Was ist anders") && t.includes("Druckhinweise") && t.includes("210–240 °C"), "Unterart Silk aufgeklappt: Was ist anders + Druckhinweise");
const silkRolle = await p.evaluate(() => window.el._daten.rollen.find((r) => r.material === "PLA" && /silk/i.test(r.art || "")));
if (silkRolle) pruefe((await el(p).locator(`.ks-variante.auf .ks-rolle[data-id="${silkRolle.id}"]`).count()) === 1, `Silk zeigt deine Rolle ${silkRolle.name}`);
// Unsichere Angabe leise markiert
const tough = el(p).locator(".ks-variante", { hasText: "PLA Tough+" }).first();
await tough.locator(".ks-var-kopf").click();
await p.waitForTimeout(450);
pruefe((await el(p).locator(".ks-variante.auf .ks-pruefen").count()) >= 1, "Unsichere Angabe (Tough+-Temperatur) als „bitte prüfen“ markiert");
await p.screenshot({ path: `${out}/ks2-pla-aufgeklappt.png` });
// Zuklappen
await el(p).locator('.ks-karte[data-ks-karte="pla"] .ks-kopf').click();
await p.waitForTimeout(500);
pruefe((await el(p).locator('.ks-karte[data-ks-karte="pla"].auf').count()) === 0, "PLA-Karte wieder zugeklappt");

// Filter
await el(p).locator('[data-aktion="hi-ks-filter"][data-id="lebensmittel"]').click();
await p.waitForTimeout(350);
pruefe((await el(p).locator(".ks-warnung").count()) === 1 && (await el(p).locator(".ks-warnung").textContent()).includes("PLA Pure"), "Lebensmittel-Filter: Warnkasten mit Hinweis auf PLA Pure");
pruefe((await namen(p)).join() === "PLA", "Lebensmittel-Filter zeigt nur PLA");
await p.screenshot({ path: `${out}/ks3-filter-lebensmittel.png` });
await el(p).locator('[data-aktion="hi-ks-filter"][data-id="faser"]').click();
await p.waitForTimeout(350);
let nf = await namen(p);
pruefe(nf.includes("PA / Nylon") && nf.includes("PET-CF") && nf.includes("PLA") && !nf.includes("TPU"), "Faserverstärkt: PA, PET-CF, PLA (CF/Glow/Wood), kein TPU");
pruefe((await el(p).locator(".ks-warnung").count()) === 0, "Warnkasten nur beim Lebensmittel-Filter");
await el(p).locator('[data-aktion="hi-ks-filter"][data-id="flexibel"]').click();
await p.waitForTimeout(350);
nf = await namen(p);
pruefe(nf.includes("TPU") && !nf.includes("ABS"), "Flexibel: TPU, kein ABS");
await el(p).locator('[data-aktion="hi-ks-filter"][data-id="p1s"]').click();
await p.waitForTimeout(350);
nf = await namen(p);
pruefe(nf.includes("PLA") && nf.includes("PETG") && !nf.includes("PPS-CF") && !nf.includes("PEEK / PEKK / PEI"), "P1S-geeignet: PLA, PETG, ohne PPS-CF/PEEK");
await el(p).locator('[data-aktion="hi-ks-filter"][data-id="stuetz"]').click();
await p.waitForTimeout(350);
nf = await namen(p);
pruefe(nf.includes("Stützmaterial") && nf.includes("HIPS"), "Stützmaterial: Bambu-Supports und HIPS");
await el(p).locator('[data-aktion="hi-ks-filter"][data-id=""]').click();
await p.waitForTimeout(350);
pruefe((await karten(p).count()) === alle, "„Alle“ zeigt wieder alle Karten");

// Suche (Feld behält den Fokus)
const suche = el(p).locator('input[data-ks="suche"]');
await suche.click();
await p.keyboard.type("zahnräder");
await p.waitForTimeout(250);
nf = await namen(p);
pruefe(nf.includes("PA / Nylon") && nf.length <= 3, `Suche „zahnräder“ findet PA/Nylon (${nf.join(", ")})`);
pruefe(await p.evaluate(() => window.el.shadowRoot.activeElement && window.el.shadowRoot.activeElement.dataset.ks === "suche"), "Suchfeld behält beim Tippen den Fokus");
await suche.fill("");
await p.keyboard.type("silk");
await p.waitForTimeout(250);
pruefe((await namen(p)).join() === "PLA", "Suche „silk“ findet PLA");
await suche.fill("xyzxyz");
await p.waitForTimeout(250);
pruefe((await el(p).locator(".ks-leer").count()) === 1, "Suche ohne Treffer: Hinweis mit Zurücksetzen");
await el(p).locator('[data-aktion="hi-ks-zuruecksetzen"]').click();
await p.waitForTimeout(300);
pruefe((await karten(p).count()) === alle, "Zurücksetzen zeigt alle Karten");

// Rolle öffnen
const rolle = await p.evaluate(() => window.el._daten.rollen.find((r) => r.material === "PETG"));
await el(p).locator(`.ks-karte[data-ks-karte="petg"] .ks-rolle[data-id="${rolle.id}"]`).click();
await p.waitForTimeout(500);
pruefe(await p.evaluate((id) => window.el._modus === "detail" && window.el._offen === id, rolle.id), `Chip öffnet die Rolle ${rolle.name}`);
await p.evaluate(() => { const x = window.el; x._modus = null; x._ansicht = "hilfe"; x._zeichnen(); });
await p.waitForTimeout(300);

// Fehlercodes
await tab(p, "codes");
const links = el(p).locator(".cd-seite a[href]");
pruefe((await links.count()) === 1 && (await links.first().getAttribute("href")).includes("wiki.bambulab.com") && (await links.first().textContent()).includes("Bambu Lab Wiki"), "Fehlercodes: genau ein Link „Bambu Lab Wiki“");
pruefe((await el(p).locator(".cd-gruppe").count()) === 8, "8 Gruppen (Heizbett … Speicherkarte/Netzwerk)");
const gtext = await el(p).locator(".cd-gruppen").textContent();
pruefe(["Heizbett", "Hotend / Düse", "Motoren / Achsen", "Extruder / Filament", "Lüfter", "Kamera / KI-Erkennung", "Steuerung / System", "Speicherkarte / Netzwerk"].every((x) => gtext.includes(x)), "Gruppen nach Bauteil benannt");
pruefe((await el(p).locator(".cd-seite").textContent()).includes("sinngemäß übersetzt"), "Hinweis „sinngemäß übersetzt“");
await p.screenshot({ path: `${out}/ks4-fehlercodes.png` });
await el(p).locator('[data-aktion="hi-cd-auf"][data-id="luefter"]').click();
await p.waitForTimeout(450);
t = await el(p).locator(".cd-gruppe.auf").textContent();
pruefe(t.includes("0300-0300-0001-0001") && t.includes("Was tun"), "Lüfter-Gruppe aufgeklappt mit Code und „Was tun“");
await p.screenshot({ path: `${out}/ks5-fehlercodes-luefter.png` });
const cs = el(p).locator('input[data-ks="code-suche"]');
await cs.click();
await p.keyboard.type("0300 0200");
await p.waitForTimeout(250);
pruefe((await el(p).locator(".cd-code").count()) >= 5 && (await el(p).locator(".cd-gruppe").count()) === 1, "Suche nach Code „0300 0200“ (mit Leerzeichen) findet die Düsen-Codes");
await cs.fill("");
await p.keyboard.type("sd-karte");
await p.waitForTimeout(250);
pruefe((await el(p).locator(".cd-code").count()) >= 1, "Suche nach Text „sd-karte“ findet Codes");
await cs.fill("ZZZ");
await p.waitForTimeout(250);
pruefe((await el(p).locator(".cd-code").count()) === 0 && (await el(p).locator("#cd-liste").textContent()).includes("Kein passender Code"), "Kein Treffer: Hinweis");
await cs.fill("");
await p.waitForTimeout(200);
pruefe(await breiteOk(p), "Desktop: kein seitliches Scrollen");
await p.close();

// ---------------- Handy ----------------
p = await seite(390, 844, true);
await tab(p, "kunststoffe");
pruefe(await breiteOk(p), "Handy: Kunststoffe ohne seitliches Scrollen");
await p.screenshot({ path: `${out}/ks6-handy-kunststoffe.png` });
await el(p).locator('.ks-karte[data-ks-karte="tpu"] .ks-kopf').click();
await p.waitForTimeout(450);
await el(p).locator('.ks-karte[data-ks-karte="tpu"]').scrollIntoViewIfNeeded();
await el(p).locator(".ks-variante", { hasText: "TPU 85A" }).locator(".ks-var-kopf").click();
await p.waitForTimeout(450);
pruefe((await el(p).locator(".ks-variante.auf").textContent()).includes("0,6"), "Handy: TPU 85A aufgeklappt (nur 0,6/0,8 mm)");
pruefe(await breiteOk(p), "Handy: aufgeklappte Karte ohne seitliches Scrollen");
await el(p).locator('.ks-karte[data-ks-karte="tpu"]').screenshot({ path: `${out}/ks7-handy-tpu.png` });
await el(p).locator(".haupt").evaluate((h) => { h.scrollTop = 0; });
await el(p).locator('[data-aktion="hi-ks-filter"][data-id="lebensmittel"]').click();
await p.waitForTimeout(350);
await p.screenshot({ path: `${out}/ks8-handy-lebensmittel.png` });
await tab(p, "codes");
await el(p).locator('[data-aktion="hi-cd-auf"][data-id="bett"]').click();
await p.waitForTimeout(450);
pruefe(await breiteOk(p), "Handy: Fehlercodes ohne seitliches Scrollen");
await p.screenshot({ path: `${out}/ks9-handy-fehlercodes.png` });

await b.close();
console.log(fehler.length ? "\nFehler:\n" + fehler.join("\n") : "\nAlles grün.");
process.exit(fehler.length ? 1 : 0);
