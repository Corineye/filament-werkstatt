// ---------------------------------------------------------------------------
// Hilfe: P1S-Zeichnung mit Bereichen, Sovol-Trockner, Fehlerbilder, Kalibrierung
// ---------------------------------------------------------------------------

const HI_TABS = [["drucker", "🖨️ Drucker"], ["trockner", "♨️ Trockner"], ["fehler", "🩺 Fehlerbilder"], ["kalibrierung", "🎯 Kalibrierung"], ["kunststoffe", "🧪 Kunststoffe"], ["codes", "⚠️ Fehlercodes"], ["konstruktion", "📐 Konstruktion"], ["lexikon", "📖 Slicer-Lexikon"], ["platten", "🟫 Druckplatten"]];
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
