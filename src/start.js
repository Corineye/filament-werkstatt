
// ============================================================================
// Start: die wichtigsten aktuellen Infos auf einen Blick, jede Kachel führt zu den Details
// ============================================================================
// Hinweise anderer Bereiche (Druck passt nicht auf die Rolle, Raumklima, Trocknen) werden
// nur benutzt, wenn es die Funktionen gibt. Ein Fehler darin legt die Übersicht nicht lahm.
const ST_ZUSTAND = {
  aus: ["Aus", "leise"], startet: ["Startet …", "amber"], offline: ["Nicht erreichbar", "leise"],
};

// Rückgabe fremder Hinweis-Funktionen vereinheitlichen: String, Objekt oder Liste davon
function stHinweise(x, std) {
  if (!x) return [];
  if (Array.isArray(x)) return x.flatMap((y) => stHinweise(y, std));
  if (typeof x === "string") return [{ ...std, text: x }];
  if (typeof x === "object") {
    const t = x.text || x.titel || x.meldung || x.hinweis;
    return t ? [{ ...std, text: String(t), stufe: x.stufe || std.stufe }] : [];
  }
  return [];
}

const StartAnsicht = {
  // Fremde Hilfsfunktion aufrufen, ohne dass ein Fehler darin die Seite stört
  _stVersuch(f) {
    try { return f(); } catch (e) { console.warn("Filament-Werkstatt Übersicht:", e); return null; }
  },

  _stHtml() {
    const warn = this._stWarnungen();
    const stunde = new Date().getHours();
    const gruss = stunde < 5 ? "Gute Nacht" : stunde < 11 ? "Guten Morgen" : stunde < 18 ? "Guten Tag" : "Guten Abend";
    const datum = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
    const rot = warn.filter((w) => w.stufe === "rot").length;
    const kachel = [
      this._stDruckerHtml(),
      this._stWarnHtml(warn),
      this._stErinnerungHtml(),
      this._stGeladenHtml(),
      this._stSchlangeHtml(),
      this._stWenigHtml(),
      this._stLetzteHtml(),
      this._stKlimaHtml(),
      this._stEinkaufHtml(),
      this._stWartungHtml(),
      this._stShopHtml(),
    ].filter(Boolean);
    return `<div class="st-seite">
      <header class="st-kopf"><div><h2>${gruss}</h2><p class="leise">${esc(datum)}</p></div>
        <span class="pille ${rot ? "rot" : warn.length ? "amber" : "mint"} st-lage">${warn.length ? `${warn.length} ${warn.length === 1 ? "Hinweis" : "Hinweise"}` : "✓ Alles im grünen Bereich"}</span></header>
      <div class="st-raster">${kachel.join("")}</div></div>`;
  },

  // Kachelrahmen: die ganze Kachel ist ein Link, Knöpfe darin haben eigene Ziele
  _stKachel(klasse, ziel, titel, inhalt, zusatz = "") {
    const attr = Object.entries(ziel).map(([k, v]) => `data-${k}="${esc(v)}"`).join(" ");
    return `<section class="st-kachel ${klasse}" ${attr} role="link" tabindex="0" data-einmal="st-${klasse.split(" ")[0]}">
      <header class="st-kachel-kopf"><h3>${titel}</h3>${zusatz}<span class="st-pfeil" aria-hidden="true">›</span></header>${inhalt}</section>`;
  },

  // ---- Drucker ----
  _stDruckerHtml() {
    return this._stKachel("st-drucker", { aktion: "st-zu", ziel: "drucker" }, "🖨️ Drucker", `<div id="st-drucker">${this._stDruckerInhalt()}</div>`);
  },
  _stDruckerInhalt() {
    const zustand = this._drZustand();
    const [text, farbe] = DR_STATUS[zustand] || ST_ZUSTAND[zustand] || [zustand, "leise"];
    const druckt = ["running", "pause", "prepare", "slicing"].includes(zustand);
    const fortschritt = this._drZ("fortschritt") || 0;
    const restH = this._drZ("rest_h");
    const ende = this._drW("ende");
    const bild = druckt && this._drS("titelbild");
    const bildUrl = bild && bild.attributes && bild.attributes.entity_picture;
    const name = this._drW("name");
    const restText = restH == null ? "–" : restH >= 1 ? `${Math.floor(restH)} h ${Math.round((restH % 1) * 60)} min` : `${Math.round(restH * 60)} min`;
    const endeText = ende && !isNaN(new Date(ende)) ? new Date(ende).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "–";
    const ring = druckt || zustand === "finish" ? fortschritt : 0;
    const fehler = this._drW("hms") === "on" || this._drW("fehler") === "on";
    const titel = druckt || zustand === "finish" || zustand === "failed" ? name || "Druck"
      : zustand === "aus" ? "Drucker ist aus" : zustand === "offline" ? "Keine Verbindung" : zustand === "startet" ? "Drucker startet" : "Bereit zum Drucken";
    return `<div class="st-dr">
      <div class="st-ring">${ringSvg(ring, farbe === "rot" ? "var(--rot)" : farbe === "amber" ? "var(--amber)" : "var(--mint)")}
        <div class="st-ring-text"><strong>${druckt || zustand === "finish" ? `${zahl(fortschritt)} %` : zustand === "aus" ? "⏻" : "–"}</strong></div></div>
      <div class="st-dr-text">
        <span class="pille ${farbe}">${esc(text)}</span>
        <strong class="st-dr-name" title="${esc(titel)}">${esc(titel)}</strong>
        ${druckt ? `<div class="st-werte"><div><span>Restzeit</span><strong>${restText}</strong></div><div><span>Fertig um</span><strong>${endeText}</strong></div></div>`
          : `<small class="leise">${zustand === "aus" ? "Steckdose ist ausgeschaltet." : zustand === "finish" ? "Druck ist fertig." : "Kein Druck läuft."}</small>`}
        ${fehler ? `<small class="rot">⚠️ Der Drucker meldet einen Fehler.</small>` : ""}
      </div>
      ${bildUrl ? `<img class="st-titelbild" src="${esc(bildUrl)}" alt="Titelbild des Drucks">` : ""}
    </div>`;
  },
  // Live: Druckerkachel höchstens alle 2 s neu füllen, wenn die Übersicht offen ist
  _stHassNeu() {
    if (this._ansicht !== "start" || !this._daten || this._modus || this._dialog || this._ddOffen || this._stTimer) return;
    this._stTimer = setTimeout(() => {
      this._stTimer = null;
      const el = this.shadowRoot.getElementById("st-drucker");
      if (el && this._ansicht === "start") el.innerHTML = this._stDruckerInhalt();
    }, 2000);
  },

  // ---- Hinweise aus allen Bereichen ----
  _stWarnungen() {
    const l = [];
    const d = this._daten;
    if (this._drW("hms") === "on" || this._drW("fehler") === "on") l.push({ icon: "⚠️", text: "Der Drucker meldet einen Fehler.", stufe: "rot", aktion: "st-zu", ziel: "drucker" });
    if (this._drVerlauf) for (const x of this._buOffene()) {
      l.push(x.status === "failed"
        ? { icon: "⛔", text: `„${x.name}“ wurde abgebrochen: Fehldruck verbuchen?`, stufe: "rot", aktion: "bu-start", uid: x.uid, ergebnis: "fehl" }
        : { icon: "✅", text: `„${x.name}“ ist fertig: Verbrauch verbuchen${x.gewicht != null ? ` (${zahl(x.gewicht, 1)} g)` : ""}`, stufe: "amber", aktion: "bu-start", uid: x.uid });
    }
    l.push(...stHinweise(this._stVersuch(() => this._druckWarnung?.()), { icon: "🧵", stufe: "rot", aktion: "st-zu", ziel: "drucker" }));
    const klima = this._stVersuch(() => this._raumklima?.());
    if (klima) l.push(...stHinweise(klima.warnungen, { icon: "💧", stufe: "amber", aktion: "st-zu", ziel: "drucker" }));
    for (const r of d.rollen) {
      if (r.achtung) l.push({ icon: "❗", text: `${r.name}: nach Fehldruck testen`, stufe: "rot", aktion: "oeffnen-filament", id: r.id });
      if (this._feuchteHinweis) {
        for (const h of stHinweise(this._stVersuch(() => this._feuchteHinweis(r)), { icon: "♨️", stufe: "", aktion: "oeffnen-filament", id: r.id })) {
          l.push({ ...h, text: `${r.name}: ${h.text}`, stufe: h.stufe || "leise" });
        }
      }
    }
    for (const w of this._wsWartung().filter((x) => x.faellig)) l.push({ icon: "🔧", text: `Wartung fällig: ${w.a.name}`, stufe: "amber", aktion: "such-werkstatt", tab: "wartung" });
    const rang = { rot: 0, amber: 1 };
    return l.sort((a, b) => (rang[a.stufe] ?? 2) - (rang[b.stufe] ?? 2));
  },
  _stWarnHtml(l) {
    const inhalt = l.length
      ? `<div class="st-liste">${l.slice(0, 7).map((w) => `<button class="st-warn ${w.stufe || ""}" data-aktion="${w.aktion}" ${["ziel", "uid", "id", "tab", "ergebnis"].filter((k) => w[k]).map((k) => `data-${k}="${esc(w[k])}"`).join(" ")}>
          <span class="st-warn-icon">${w.icon}</span><span>${esc(w.text)}</span><i>›</i></button>`).join("")}</div>
        ${l.length > 7 ? `<small class="leise">und ${l.length - 7} weitere</small>` : ""}`
      : `<div class="st-ruhe"><span>✓</span><small class="leise">Nichts zu tun: alles verbucht, keine Wartung fällig.</small></div>`;
    return `<section class="st-kachel st-warnungen ${l.some((w) => w.stufe === "rot") ? "rot-rand" : ""}" data-einmal="st-warnungen">
      <header class="st-kachel-kopf"><h3>🔔 Hinweise</h3>${l.length ? `<span class="zahl-punkt ${l.some((w) => w.stufe === "rot") ? "rot-punkt" : "amber-punkt"}">${l.length}</span>` : ""}</header>${inhalt}</section>`;
  },

  // ---- Fällige Erinnerungen aus dem Notizbuch ----
  _stErinnerungHtml() {
    const l = this._nbFaellig();
    if (!l.length) return "";
    const heute = this._nbHeute();
    return this._stKachel("st-erinnerung", { aktion: "st-zu", ziel: "notiz", nb: "erinnerung" }, "⏰ Erinnerungen", `<div class="st-liste">${l.slice(0, 4).map((e) => `
      <div class="st-zeile"><button class="nb-haken" data-aktion="st-erledigt" data-id="${esc(e.id)}" aria-label="Erledigt: ${esc(e.text)}"></button>
        <span class="st-zeile-text"><strong>${esc(e.text)}</strong><small class="${e.faellig < heute ? "rot" : "amber"}">${e.faellig < heute ? `überfällig seit ${this._nbDatum(e.faellig)}` : "heute fällig"}</small></span></div>`).join("")}</div>
      ${l.length > 4 ? `<small class="leise">und ${l.length - 4} weitere</small>` : ""}`, `<span class="zahl-punkt amber-punkt">${l.length}</span>`);
  },

  // ---- Geladene Rolle ----
  _stGeladenHtml() {
    const r = this._drGeladen();
    if (!r) return this._stKachel("st-geladen", { aktion: "st-zu", ziel: "drucker" }, "🧵 Geladen", `<div class="st-rolle"><span class="dr-fil-leer">∅</span><span><strong>Kein Filament geladen</strong><small class="leise">Im Drucker-Bereich wählen</small></span></div>`);
    const p = prozent(r);
    return this._stKachel("st-geladen", { aktion: "oeffnen-filament", id: r.id }, "🧵 Geladen", `<div class="st-rolle">${spuleSvg(r)}
      <span><strong>${esc(r.name)}</strong><small class="leise">${esc(r.hersteller)} · ${esc(sorteName(r))}</small>
        <span class="st-gramm ${r.rest_g == null ? "leise" : p <= 10 ? "rot" : p <= 20 ? "amber" : "mint"}">${r.rest_g == null ? "nicht gewogen" : `${zahl(r.rest_g)} g übrig`}</span></span></div>`);
  },

  // ---- Warteschlange: die nächsten drei ----
  _stSchlangeHtml() {
    const l = this._wsBestand();
    const text = { ok: ["reicht", "mint"], knapp: ["knapp", "amber"], fehlt: ["reicht nicht", "rot"], ungewogen: ["nicht gewogen", "amber"], unbekannt: ["?", "leise"], ohne: ["keine Rolle", "amber"] };
    const inhalt = l.length ? `<ol class="st-schlange">${l.slice(0, 3).map((x) => { const [t, f] = text[x.stufe] || ["", "leise"];
      return `<li><span class="st-nr">${l.indexOf(x) + 1}</span><span class="st-zeile-text"><strong>${esc(x.a.name)}</strong><small class="leise">${x.a.gewicht ? `${zahl(x.a.gewicht, 1)} g` : "Gewicht unbekannt"}${x.r ? ` · ${esc(x.r.name)}` : ""}</small></span><span class="pille ${f}">${t}</span></li>`; }).join("")}</ol>
      ${l.length > 3 ? `<small class="leise">und ${l.length - 3} weitere</small>` : ""}`
      : `<p class="leise klein">Nichts geplant. Aufträge kommen aus dem 3D-Viewer oder der Bibliothek.</p>`;
    return this._stKachel("st-schlange-k", { aktion: "st-zu", ziel: "werkstatt", tab: "schlange" }, "📋 Warteschlange", inhalt, l.length ? `<span class="zahl-punkt">${l.length}</span>` : "");
  },

  // ---- Wenig Filament ----
  _stWenigHtml() {
    const l = this._daten.rollen.filter((r) => r.rest_g != null && r.rest_g < FAST_LEER_G).sort((a, b) => a.rest_g - b.rest_g);
    const inhalt = l.length ? `<div class="st-rollen">${l.slice(0, 4).map((r) => `<button class="st-rollen-zeile" data-aktion="oeffnen-filament" data-id="${esc(r.id)}">
        <span class="farbtupfer" style="background:${r.hex === "transparent" ? "transparent" : esc(r.hex)}"></span><span class="st-zeile-text"><strong>${esc(r.name)}</strong><small class="leise">${esc(r.hersteller)}</small></span>
        <span class="${r.rest_g < FAST_LEER_G / 3 ? "rot" : "amber"} st-g">${zahl(r.rest_g)} g</span></button>`).join("")}</div>
      ${l.length > 4 ? `<small class="leise">und ${l.length - 4} weitere</small>` : ""}`
      : `<p class="leise klein">Alle gewogenen Rollen haben mehr als ${FAST_LEER_G} g.</p>`;
    return this._stKachel("st-wenig", { aktion: "st-zu", ziel: "filament", status: "leer" }, "🪫 Fast leer", inhalt, l.length ? `<span class="zahl-punkt amber-punkt">${l.length}</span>` : "");
  },

  // ---- Letzte Drucke mit Foto ----
  _stLetzteHtml() {
    if (!this._drVerlauf) return this._stKachel("st-letzte", { aktion: "st-zu", ziel: "werkstatt", tab: "bibliothek" }, "📸 Letzte Drucke", `<p class="leise klein">Lade Druckverlauf …</p>`);
    const l = this._buAlle().filter((d) => d.status !== "laeuft").slice(0, 3);
    if (this._drFotos === undefined) setTimeout(() => this._drFotosLaden(), 0);
    const inhalt = l.length ? `<div class="st-fotos">${l.map((d) => {
      const f = fotoName(d), foto = f && this._drFotos && this._drFotos[f];
      const g = this._buExtra(d.uid).gebucht;
      const fehl = (g && g.ergebnis === "fehl") || d.status === "failed";
      return `<button class="st-foto" data-aktion="zum-druck" data-uid="${esc(d.uid)}" title="${esc(d.name)}">
        <span class="st-foto-bild" data-foto="${esc(f || "")}">${foto ? `<img src="${esc(foto)}" alt="" loading="lazy">` : "🧊"}</span>
        <strong>${esc(d.name)}</strong><small class="${fehl ? "rot" : "leise"}">${fehl ? "Fehldruck · " : ""}${esc((d.zeit || "").split(" ")[0])}</small></button>`; }).join("")}</div>`
      : `<p class="leise klein">Noch keine Drucke aufgezeichnet.</p>`;
    return this._stKachel("st-letzte", { aktion: "st-zu", ziel: "werkstatt", tab: "bibliothek" }, "📸 Letzte Drucke", inhalt);
  },

  // ---- Raumklima (nur wenn ein Bereich es liefert) ----
  _stKlimaHtml() {
    const k = this._stVersuch(() => this._raumklima?.());
    if (!k || (k.temp == null && k.feuchte == null)) return "";
    const w = stHinweise(k.warnungen, { stufe: "amber" });
    const feuchtFarbe = k.feuchte == null ? "" : k.feuchte > 60 ? "rot" : k.feuchte > 45 ? "amber" : "mint";
    return this._stKachel("st-klima", { aktion: "st-zu", ziel: "drucker" }, "🌡️ Raumklima", `<div class="st-werte st-gross">
      <div><span>Temperatur</span><strong>${k.temp == null ? "–" : `${zahl(Number(k.temp), 1)} °C`}</strong></div>
      <div><span>Luftfeuchte</span><strong class="${feuchtFarbe}">${k.feuchte == null ? "–" : `${zahl(Number(k.feuchte))} %`}</strong></div></div>
      ${w.length ? `<small class="amber">${esc(w[0].text)}</small>` : `<small class="leise">Gut für offenes Filament.</small>`}`);
  },

  // ---- Einkaufsliste ----
  _stEinkaufHtml() {
    const l = this._wsEinkauf();
    const dringend = l.filter((x) => x.dringend).length;
    return this._stKachel("st-einkauf", { aktion: "st-zu", ziel: "werkstatt", tab: "einkauf" }, "🛒 Einkaufsliste", `<div class="st-zahl"><strong class="${dringend ? "rot" : l.length ? "amber" : "mint"}">${l.length}</strong>
      <span class="leise">${l.length ? `${l.length === 1 ? "Eintrag" : "Einträge"}${dringend ? `, ${dringend} dringend` : ""}` : "Nichts nachzukaufen"}</span></div>
      ${l.length ? `<small class="leise st-kurz">${esc(l.slice(0, 3).map((x) => x.titel).join(" · "))}</small>` : ""}`);
  },

  // ---- Wartung ----
  _stWartungHtml() {
    const l = this._wsWartung();
    const faellig = l.filter((x) => x.faellig);
    const naechste = l.find((x) => !x.neu && !x.faellig);
    return this._stKachel("st-wartung", { aktion: "st-zu", ziel: "werkstatt", tab: "wartung" }, "🔧 Wartung", `<div class="st-zahl"><strong class="${faellig.length ? "amber" : "mint"}">${faellig.length || "✓"}</strong>
      <span class="leise">${faellig.length ? `${faellig.length === 1 ? "Aufgabe" : "Aufgaben"} fällig` : "Nichts fällig"}</span></div>
      <small class="leise st-kurz">${faellig.length ? esc(faellig.map((x) => x.a.name).join(" · ")) : naechste ? `Als Nächstes: ${esc(naechste.a.name)} (${zahl(Math.min(100, naechste.anteil * 100))} %)` : "Wartung erfassen: Werkstatt › Wartung"}</small>`);
  },

  // ---- Offene Shop-Aufträge (wenn der Shop sie führt) ----
  _stShopHtml() {
    const a = this._daten.shop && this._daten.shop.auftraege;
    if (!Array.isArray(a)) return "";
    const fertig = (x) => x && (x.erledigt || x.bezahlt && x.versendet || ["erledigt", "fertig", "versendet", "abgeschlossen", "storniert"].includes(x.status));
    const offen = a.filter((x) => !fertig(x));
    return this._stKachel("st-shop", { aktion: "st-zu", ziel: "shop" }, "🛍️ Aufträge", `<div class="st-zahl"><strong class="${offen.length ? "amber" : "mint"}">${offen.length}</strong><span class="leise">${offen.length === 1 ? "offener Auftrag" : "offene Aufträge"}</span></div>
      ${offen.length ? `<small class="leise st-kurz">${esc(offen.slice(0, 3).map((x) => x.name || x.titel || x.kunde || "Auftrag").join(" · "))}</small>` : ""}`);
  },

  // ---- Ereignisse ----
  _stKlick(a, el) {
    switch (a) {
      case "st-zu": {
        if (!this._schliessen()) return;
        const ziel = el.dataset.ziel;
        this._ansicht = ziel;
        this._sucheOffen = false; this._mehrOffen = false; this._filterAuf = false;
        if (ziel === "werkstatt") {
          this._wsZustand().tab = el.dataset.tab || "schlange";
          if (["bibliothek", "fehl"].includes(this._ws.tab)) this._wsFotos();
        }
        if (ziel === "filament" && el.dataset.status) { this._f = { sorte: "", hersteller: "", farbe: "", status: el.dataset.status }; this._suche = ""; }
        if (ziel === "notiz") { const n = this._nbZustand(); n.quelle = el.dataset.nb || "alle"; n.edit = null; }
        // Neue Ansicht oben beginnen, nicht an der Scrollstelle der Übersicht
        this._zeichnen();
        { const h = this.shadowRoot.querySelector(".haupt"); if (h) h.scrollTop = 0; }
        return;
      }
      case "st-erledigt": {
        const e = (this._daten.erinnerungen || []).find((x) => x.id === el.dataset.id);
        if (!e) return;
        e.erledigt = true; e.erledigt_am = new Date().toISOString();
        this._speichern();
        this._toast(`Erledigt: ${e.text}`);
        return;
      }
      default: return;
    }
    this._zeichnen();
  },
};
