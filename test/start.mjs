// Start (Übersicht) und Notizbuch: Kacheln führen zu den Details, Notizen bleiben mit ihrem Ursprung verbunden.
import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PFAD || "playwright");
const out = process.argv[2] || "test/bilder";
const b = await chromium.launch();
const fehler = [];
const pruefe = (ok, text) => { if (!ok) fehler.push("Prüfung fehlgeschlagen: " + text); console.log((ok ? "✓ " : "✕ ") + text); };
const heute = (n = 0) => { const d = new Date(Date.now() + n * 86400000); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

async function seite(breite, hoehe, ansicht = "start") {
  const p = await b.newPage({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 2 });
  p.on("pageerror", (e) => fehler.push(e.message));
  p.on("console", (m) => m.type() === "error" && fehler.push(m.text()));
  p.on("dialog", (d) => d.accept());
  await p.goto(`http://localhost:${process.env.TEST_PORT || 8765}/test/test.html?ansicht=${ansicht}`);
  await p.waitForTimeout(900);
  // Testdaten: Kommentare, Fehldruck mit Antworten, Erinnerungen, eigene Notiz, Shop-Aufträge
  await p.evaluate((h) => {
    const x = window.el, d = x._daten;
    d.buchen_ab = "2000-01-01T00:00:00Z";
    d.drucke.a2 = { kommentar: "Ecke hat sich gelöst", gebucht: { rolle: d.rollen[1].id, ergebnis: "fehl", g: 16, fortschritt: 34, am: "2026-10-11T17:10:00Z" },
      fehl: { wann: "frueh", bilder: ["haftung"], extra: { getrocknet: "nein", bett_sauber: "ja" }, ursachen: ["haftung"], geaendert: ["Druckbett 60 °C"] } };
    d.drucke.a3 = { kommentar: "Zähne sauber, passt genau" };
    d.erinnerungen = [{ id: "e1", text: "Düse prüfen", faellig: h.gestern, erledigt: false, am: "2026-10-01T10:00:00Z" },
      { id: "e2", text: "PETG nachbestellen", faellig: h.woche, erledigt: false, am: "2026-10-02T10:00:00Z" }];
    d.notizen = [{ id: "n1", titel: "Brim bei ASA", text: "Immer 5 mm Brim, sonst biegen sich die Ecken.", tags: ["asa", "tipp"], link: null, am: "2026-10-05T10:00:00Z", geaendert: "2026-10-05T10:00:00Z" }];
    d.warteschlange = [{ id: "q1", name: "Kabelclip", gewicht: 4, rolleId: d.rollen[2].id, notiz: "" }, { id: "q2", name: "Wandhalter", gewicht: 80, rolleId: d.rollen[1].id, notiz: "" },
      { id: "q3", name: "Deckel", gewicht: 30, rolleId: d.rollen[3].id, notiz: "" }, { id: "q4", name: "Box", gewicht: 120, rolleId: d.rollen[3].id, notiz: "" }];
    d.geladen = d.rollen[3].id;
    d.shop = { auftraege: [{ name: "Schlüsselanhänger ×10", status: "offen" }, { name: "Lampe", status: "versendet" }] };
    // Hilfsfunktionen anderer Bereiche: eine liefert Daten, eine wirft – die Übersicht muss trotzdem stehen
    x._raumklima = () => ({ temp: 21.4, feuchte: 52, warnungen: [{ stufe: "amber", text: "Luftfeuchte über 50 %: offene Rollen ziehen Wasser" }] });
    x._druckWarnung = () => { throw new Error("absichtlich"); };
    x._zeichnen();
  }, { gestern: heute(-1), woche: heute(7) });
  await p.waitForTimeout(500);
  return p;
}
const el = (p) => p.locator("filament-werkstatt-panel");
const daten = (p, f) => el(p).evaluate((x, f) => new Function("d", "x", `return (${f})`)(x._daten, x), f);
const ansicht = (p) => el(p).evaluate((x) => x._ansicht);
const zurStart = async (p) => { await el(p).evaluate((x) => { x._modus = null; x._dialog = null; x._ansicht = "start"; x._zeichnen(); }); await p.waitForTimeout(250); };

// ---- Desktop: Übersicht
const p = await seite(1400, 900);
const kacheln = await el(p).locator(".st-kachel").count();
pruefe(kacheln >= 10, `Übersicht zeigt ${kacheln} Kacheln`);
const drText = await el(p).locator(".st-drucker").textContent();
pruefe(drText.includes("Kabelhalter Schreibtisch") && drText.includes("62 %") && drText.includes("Fertig um"), "Druckerkachel: Name, Fortschritt, Fertig um");
pruefe((await el(p).locator(".st-titelbild").count()) === 1, "Druckerkachel zeigt das Titelbild");
const warn = await el(p).locator(".st-warnungen").textContent();
pruefe(warn.includes("Kalibrierwürfel") && warn.includes("Verbrauch verbuchen"), "Hinweis: fertiger Druck wartet aufs Verbuchen");
pruefe(warn.includes("Luftfeuchte über 50 %"), "Hinweis aus dem Raumklima wird übernommen");
pruefe((await el(p).locator(".st-klima").textContent()).includes("52 %"), "Raumklima-Kachel zeigt die Luftfeuchte");
pruefe((await el(p).locator(".st-erinnerung").textContent()).includes("Düse prüfen") && !(await el(p).locator(".st-erinnerung").textContent()).includes("PETG"), "Nur fällige Erinnerungen auf der Startseite");
pruefe((await el(p).locator(".st-schlange li").count()) === 3, "Warteschlange: die nächsten drei");
pruefe((await el(p).locator(".st-shop").textContent()).includes("1"), "Shop-Kachel zählt offene Aufträge");
pruefe((await el(p).locator(".st-wenig .st-rollen-zeile").count()) > 0, "Fast-leer-Kachel listet Rollen unter 150 g");
await p.waitForTimeout(400);
await p.screenshot({ path: `${out}/start-uebersicht-desktop.png` });

// Kacheln sind Links zu den Details
await el(p).locator(".st-wenig .st-kachel-kopf").click();
await p.waitForTimeout(200);
pruefe((await ansicht(p)) === "filament" && (await el(p).evaluate((x) => x._f.status)) === "leer", "Fast leer › Filament mit Filter „fast leer“");
await zurStart(p);
await el(p).locator(".st-einkauf").click();
pruefe((await ansicht(p)) === "werkstatt" && (await el(p).evaluate((x) => x._ws.tab)) === "einkauf", "Einkaufsliste › Werkstatt, Reiter Einkauf");
await zurStart(p);
await el(p).locator(".st-schlange-k").click();
pruefe((await el(p).evaluate((x) => x._ws.tab)) === "schlange", "Warteschlange › Werkstatt, Reiter Warteschlange");
await zurStart(p);
await el(p).locator(".st-wartung").click();
pruefe((await el(p).evaluate((x) => x._ws.tab)) === "wartung", "Wartung › Werkstatt, Reiter Wartung");
await zurStart(p);
await el(p).locator(".st-drucker").click();
pruefe((await ansicht(p)) === "drucker", "Druckerkachel › Drucker");
await zurStart(p);
await el(p).locator(".st-geladen").click();
await p.waitForTimeout(300);
pruefe((await ansicht(p)) === "filament" && (await el(p).evaluate((x) => x._modus === "detail" && x._offen === x._daten.geladen)), "Geladene Rolle › Rolle im Detail");
await zurStart(p);
await el(p).locator(".st-foto").first().click();
await p.waitForTimeout(200);
pruefe((await ansicht(p)) === "drucker" && (await el(p).evaluate((x) => x._dialog)) === "dr-druck", "Foto › Druck im Verlauf");
await zurStart(p);
await el(p).locator(".st-warn", { hasText: "Kalibrierwürfel" }).click();
await p.waitForTimeout(200);
pruefe((await el(p).evaluate((x) => x._dialog)) === "bu", "Hinweis zum Verbuchen öffnet den Buchungsdialog");
await zurStart(p);
await el(p).locator('.st-erinnerung [data-aktion="st-erledigt"]').click();
await p.waitForTimeout(200);
pruefe(await daten(p, "d.erinnerungen[0].erledigt === true"), "Erinnerung auf der Startseite abhaken");
pruefe((await el(p).locator(".st-erinnerung").count()) === 0, "Erledigte Erinnerung verschwindet von der Startseite");
await el(p).locator(".st-erinnerung, .st-warnungen").first().waitFor();

// ---- Notizbuch
await el(p).evaluate((x) => { x._ansicht = "notiz"; x._zeichnen(); });
await p.waitForTimeout(400);
const alle = await el(p).locator(".nb-karte").count();
pruefe(alle >= 5, `Notizbuch sammelt ${alle} Notizen (eigene, Rolle, Drucke, Fehldruck, Erinnerungen)`);
await p.screenshot({ path: `${out}/notizbuch-alle-desktop.png` });
await el(p).locator('[data-aktion="nb-quelle"][data-id="fehl"]').click();
pruefe((await el(p).locator(".nb-karte").count()) === 1 && (await el(p).locator(".nb-antworten").textContent()).includes("War die Rolle frisch getrocknet"), "Filter Fehldrucke zeigt die Antworten");
await el(p).locator('[data-aktion="nb-bearbeiten"]').first().click();
await el(p).locator('.nb-edit [data-nb="text"]').fill("Ecke hat sich gelöst, Bett war fettig");
await el(p).locator('[data-aktion="nb-speichern"]').click();
pruefe((await daten(p, "d.drucke.a2.kommentar")) === "Ecke hat sich gelöst, Bett war fettig" && await daten(p, "d.drucke.a2.fehl.wann === 'frueh'"), "Fehldruck-Kommentar wird am Druck gespeichert, Antworten bleiben");
await el(p).locator('[data-aktion="nb-quelle"][data-id="druck"]').click();
pruefe((await el(p).locator(".nb-karte").textContent()).includes("Zähne sauber"), "Filter Drucke zeigt den Druckkommentar");
await el(p).locator('[data-aktion="nb-quelle"][data-id="filament"]').click();
const rollenNotizen = await el(p).locator(".nb-karte").count();
pruefe(rollenNotizen >= 1, `Filter Filament zeigt ${rollenNotizen} Rollennotizen`);
const rid = await el(p).evaluate((x) => x._daten.rollen.find((r) => (r.notiz || "").trim()).id);
await el(p).locator(`[data-aktion="nb-bearbeiten"][data-key="rolle:${rid}"]`).click();
await el(p).locator('.nb-edit [data-nb="text"]').fill("0,16 mm, Glätten oben");
await el(p).locator('[data-aktion="nb-speichern"]').click();
pruefe((await daten(p, `d.rollen.find((r) => r.id === "${rid}").notiz`)) === "0,16 mm, Glätten oben", "Rollennotiz wird an der Rolle geändert");
await el(p).locator('[data-aktion="nb-quelle"][data-id="wartung"]').click();
pruefe((await el(p).locator(".nb-karte").count()) === 9, "Filter Wartung zeigt alle Wartungsaufgaben zum Notieren");
await el(p).locator('[data-aktion="nb-bearbeiten"][data-key="wartung:duese"]').click();
await el(p).locator('.nb-edit [data-nb="text"]').fill("Socke hat einen kleinen Riss");
await el(p).locator('[data-aktion="nb-speichern"]').click();
pruefe((await daten(p, "d.wartung.notizen.duese")) === "Socke hat einen kleinen Riss", "Wartungsnotiz in daten.wartung.notizen");

// Eigene Notiz mit Schlagworten und Verknüpfung
await el(p).locator('[data-aktion="nb-quelle"][data-id="alle"]').click();
await el(p).locator('[data-aktion="nb-neu"][data-art="eigen"]').click();
await p.waitForTimeout(150);
pruefe(await el(p).evaluate((x) => x.shadowRoot.activeElement && x.shadowRoot.activeElement.dataset.nb === "titel"), "Neue Notiz: Titel hat den Fokus");
await el(p).locator('.nb-edit [data-nb="titel"]').fill("Silk langsam");
await el(p).locator('.nb-edit [data-nb="text"]').fill("Außenwand 60 mm/s für Glanz.");
await el(p).locator('.nb-edit [data-nb="tags"]').fill("silk, #tipp");
await el(p).locator('.nb-edit .dd-knopf').click();
await p.waitForTimeout(150);
await el(p).locator(".dd-liste .dd-option", { hasText: "Silk PLA Silber" }).first().click();
await p.waitForTimeout(150);
pruefe((await el(p).locator('.nb-edit [data-nb="text"]').inputValue()) === "Außenwand 60 mm/s für Glanz.", "Entwurf bleibt nach Wahl der Verknüpfung erhalten");
await p.screenshot({ path: `${out}/notizbuch-neue-notiz-desktop.png` });
await el(p).locator('[data-aktion="nb-speichern"]').click();
const n = await daten(p, "d.notizen[0]");
pruefe(n.titel === "Silk langsam" && n.tags.join() === "silk,tipp" && n.link && n.link.art === "rolle", "Eigene Notiz mit Schlagworten und Verknüpfung gespeichert");
await el(p).locator('.nb-tag', { hasText: "#tipp" }).first().click();
pruefe((await el(p).locator(".nb-karte").count()) === 2, "Schlagwort antippen filtert (2 Notizen mit #tipp)");
await el(p).locator('.such-feld[data-nb="suche"]').fill("brim");
await p.waitForTimeout(200);
pruefe((await el(p).locator(".nb-karte").count()) === 1, "Suche findet „Brim bei ASA“");
await el(p).locator('.such-feld[data-nb="suche"]').fill("");
await p.waitForTimeout(200);
await el(p).locator('.nb-karte:has-text("Silk langsam") .nb-link').click();
await p.waitForTimeout(300);
pruefe((await ansicht(p)) === "filament" && (await el(p).evaluate((x) => x._modus)) === "detail", "Verknüpfung öffnet die Rolle");
await el(p).evaluate((x) => { x._modus = null; x._ansicht = "notiz"; x._zeichnen(); });
await p.waitForTimeout(200);
await el(p).locator('[data-aktion="nb-loeschen"][data-key^="eigen:"]').first().click();
pruefe((await daten(p, "d.notizen.length")) === 1, "Eigene Notiz löschen");

// Erinnerung anlegen: heute fällig → Startseite
await el(p).locator('[data-aktion="nb-neu"][data-art="erinnerung"]').click();
await el(p).locator('.nb-edit [data-nb="titel"]').fill("Riemen nachspannen");
await el(p).locator('[data-aktion="nb-tag-in"][data-id="0"]').click();
await p.screenshot({ path: `${out}/notizbuch-neue-erinnerung-desktop.png` });
await el(p).locator('[data-aktion="nb-speichern"]').click();
pruefe(await daten(p, `d.erinnerungen.some((e) => e.text === "Riemen nachspannen" && e.faellig === "${heute()}")`), "Erinnerung mit Fälligkeit heute gespeichert");
await el(p).locator('[data-aktion="nb-quelle"][data-id="erinnerung"]').click();
await p.screenshot({ path: `${out}/notizbuch-erinnerungen-desktop.png` });
await zurStart(p);
pruefe((await el(p).locator(".st-erinnerung").textContent()).includes("Riemen nachspannen"), "Neue fällige Erinnerung steht auf der Startseite");
const gespeichert = await p.evaluate(() => { const s = JSON.parse(window.speicher.filament_werkstatt || "{}"); return s.version; });
await p.waitForTimeout(700);
pruefe(await p.evaluate(() => JSON.parse(window.speicher.filament_werkstatt).notizen.length === 1), `Notizen landen im Speicher (Version ${gespeichert})`);

// ---- Handy
const m = await seite(390, 844);
const breit = await el(m).evaluate((x) => { const h = x.shadowRoot.querySelector(".haupt"); return h.scrollWidth - h.clientWidth; });
pruefe(breit <= 0, `Übersicht ohne seitliches Scrollen (${breit} px)`);
const reihe = await el(m).evaluate((x) => [...x.shadowRoot.querySelectorAll(".st-kachel")].slice(0, 3).map((k) => k.classList[1]));
pruefe(reihe[0] === "st-drucker" && reihe[1] === "st-warnungen", `Handy: Drucker und Hinweise zuerst (${reihe.join(", ")})`);
const spalten = await el(m).evaluate((x) => getComputedStyle(x.shadowRoot.querySelector(".st-raster")).gridTemplateColumns.split(" ").length);
pruefe(spalten === 1, "Handy: eine Spalte");
await m.screenshot({ path: `${out}/start-uebersicht-handy.png` });
await el(m).locator(".haupt").evaluate((x) => (x.scrollTop = 900));
await m.waitForTimeout(200);
await m.screenshot({ path: `${out}/start-uebersicht-handy-unten.png` });
await el(m).locator(".haupt").evaluate((x) => (x.scrollTop = 2400));
await m.waitForTimeout(200);
await m.screenshot({ path: `${out}/start-uebersicht-handy-ende.png` });
await el(m).locator('[data-aktion="mehr"]').click();
await el(m).locator('.mehr-punkt[data-id="notiz"]').click();
await m.waitForTimeout(400);
const nbBreit = await el(m).evaluate((x) => { const h = x.shadowRoot.querySelector(".haupt"); return h.scrollWidth - h.clientWidth; });
pruefe(nbBreit <= 0, `Notizbuch ohne seitliches Scrollen (${nbBreit} px)`);
await m.screenshot({ path: `${out}/notizbuch-handy.png` });
await el(m).locator('[data-aktion="nb-quelle"][data-id="fehl"]').click();
await el(m).locator('[data-aktion="nb-bearbeiten"]').first().click();
await m.waitForTimeout(200);
await m.screenshot({ path: `${out}/notizbuch-bearbeiten-handy.png` });
await el(m).locator('[data-aktion="nb-abbrechen"]').click();
await el(m).locator('[data-aktion="nb-neu"][data-art="erinnerung"]').click();
await m.waitForTimeout(200);
await m.screenshot({ path: `${out}/notizbuch-erinnerung-handy.png` });

// Ohne fremde Hilfsfunktionen und mit Drucker aus: Übersicht steht trotzdem
const o = await b.newPage({ viewport: { width: 1400, height: 900 } });
o.on("pageerror", (e) => fehler.push(e.message));
await o.goto(`http://localhost:${process.env.TEST_PORT || 8765}/test/test.html?ansicht=start&drucker=aus`);
await o.waitForTimeout(900);
pruefe((await el(o).locator(".st-drucker").textContent()).includes("Drucker ist aus"), "Drucker aus: Kachel sagt es");
pruefe((await el(o).locator(".st-klima").count()) === 0, "Ohne Raumklima-Funktion keine Klimakachel");
await o.screenshot({ path: `${out}/start-drucker-aus-desktop.png` });

console.log("Fehler:", fehler.length ? fehler : "keine");
await b.close();
process.exit(fehler.length ? 1 : 0);
