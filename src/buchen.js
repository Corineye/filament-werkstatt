// ---------------------------------------------------------------------------
// Verbuchen: nach jedem Druck fragen, welche Rolle benutzt wurde, und den
// Verbrauch abziehen (Druck + Anfangslinie + Extruder-Fahrten, beim Rollenwechsel
// das Reststück von der alten Rolle). Abbruch: Fehldruck oder anders überlegt.
// Fehldruck: Fragenkatalog → Ursachen → Änderungen, rotes Ausrufezeichen an der Rolle.
// ---------------------------------------------------------------------------

const BU_ENDE = ["finish", "failed"];

const BuchenAnsicht = {
  // Alle Drucke: Liste aus Home Assistant + von Hand nachgetragene
  _buAlle() {
    const hand = Object.entries(this._daten.drucke || {}).filter(([, x]) => x.hand).map(([uid, x]) => ({
      uid, titel: x.hand.name, name: x.hand.name, zeit: new Date(x.hand.start).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" }),
      gewicht: x.hand.gewicht, laenge: null, duese_c: null, bett_c: null, duese_mm: null, start: x.hand.start, ende: x.hand.start,
      status: x.hand.status || "finish", fortschritt: x.hand.status === "failed" ? x.hand.fortschritt : 100, hand: true,
    }));
    return [...(this._drVerlauf || []), ...hand].sort((a, b) => (b.start || "").localeCompare(a.start || ""));
  },
  _buExtra(uid) { return (this._daten.drucke || {})[uid] || {}; },
  _buOffene() {
    if (!this._daten || !this._drVerlauf) return [];
    const ab = this._daten.buchen_ab || "";
    return this._buAlle().filter((d) => {
      const x = this._buExtra(d.uid);
      return BU_ENDE.includes(d.status) && !x.gebucht && !x.ignoriert && !d.hand && !d.erledigt && (d.ende || d.start || "") >= ab;
    });
  },

  // Druckstatus beobachten: nach dem Ende den Verlauf neu laden (Automation schreibt mit Verzögerung)
  _buHassNeu() {
    if (!this._daten) return;
    const s = this._drW && this._drW("status");
    if (s && s !== this._buStatus) {
      const vorher = this._buStatus;
      this._buStatus = s;
      if (vorher && ["running", "pause", "prepare"].includes(vorher) && BU_ENDE.includes(s)) {
        [20000, 60000, 120000].forEach((t) => setTimeout(() => this._drVerlaufLaden(), t));
      }
    }
  },

  // Nach dem Laden des Verlaufs: einmal pro Sitzung von selbst nachfragen
  _buNachLaden() {
    const offen = this._buOffene();
    if (!offen.length || this._modus || this._dialog) return;
    this._buGezeigt = this._buGezeigt || new Set();
    const d = offen.find((x) => !this._buGezeigt.has(x.uid));
    if (!d) return;
    this._buGezeigt.add(d.uid);
    if (d.status === "failed") return;   // Abbruch: erst über den roten Balken fragen
    this._buStarten(d.uid);
    this._zeichnen();
  },

  // Balken oben: Abbruch rot, fertige Drucke mint
  _buBalkenHtml() {
    const offen = this._buOffene();
    if (!offen.length || this._ansicht === "system") return "";
    const d = offen[offen.length - 1];
    const weitere = offen.length > 1 ? ` <span class="bu-mehr">+${offen.length - 1} weitere</span>` : "";
    if (d.status === "failed") {
      return `<div class="bu-balken rot" data-einmal="bu-${esc(d.uid)}" role="alert">
        <span class="bu-text">⛔ <strong>${esc(d.name)}</strong> wurde abgebrochen${d.fortschritt != null ? ` (bei ${zahl(d.fortschritt)} %)` : ""}. Fehldruck oder anders überlegt?${weitere}</span>
        <span class="bu-knoepfe"><button class="knopf rot-knopf klein-knopf" data-aktion="bu-start" data-uid="${esc(d.uid)}" data-ergebnis="fehl">Fehldruck</button>
        <button class="knopf leise klein-knopf" data-aktion="bu-start" data-uid="${esc(d.uid)}" data-ergebnis="anders">Anders überlegt</button></span></div>`;
    }
    return `<div class="bu-balken" data-einmal="bu-${esc(d.uid)}">
      <span class="bu-text">✅ <strong>${esc(d.name)}</strong> ist fertig${d.gewicht != null ? ` (${zahl(d.gewicht, 1)} g)` : ""}. Verbrauch verbuchen?${weitere}</span>
      <span class="bu-knoepfe"><button class="knopf klein-knopf" data-aktion="bu-start" data-uid="${esc(d.uid)}">Verbuchen</button></span></div>`;
  },

  // ---- Dialog ----
  _buStarten(uid, ergebnis) {
    const d = this._buAlle().find((x) => x.uid === uid);
    if (!d) return;
    const vor = this._buVorschlaege(d);
    this._bu = {
      uid, ergebnis: ergebnis || (d.status === "failed" ? "fehl" : "ok"),
      fortschritt: d.status === "failed" ? (d.fortschritt != null ? d.fortschritt : 50) : 100,
      rolleId: vor[0] ? vor[0].rolle.id : null, schritt: "buchen", wann: null, bilder: [], extra: {}, waehlen: false, strom: "laedt", uebernehmen: {},
    };
    this._bu.wann = wannAusFortschritt(this._bu.fortschritt);
    this._dialog = "bu";
    this._buStromLaden(d);
  },

  // Material aus der Düsentemperatur raten (im Eintrag festgehalten)
  _buMaterialRaten(d) {
    const t = d.duese_c;
    if (!t) return null;
    if (t <= 232) return ["PLA", "TPU"];
    if (t <= 258) return ["PETG", "ABS"];
    return ["ASA", "ABS", "PC"];
  },
  _buBedarf(d, rolle, fortschritt) {
    const e = this._daten.einstellungen;
    const anteil = Math.max(0, Math.min(100, fortschritt)) / 100;
    const korr = this._korrektur(rolle).faktor;
    const slicer = (d.gewicht || 0) * anteil;
    const druck = slicer * korr;
    return { druck, slicer, fix: e.linie_g + e.extruder_g, summe: druck + e.linie_g + e.extruder_g, korr };
  },
  _buVorschlaege(d) {
    const mats = this._buMaterialRaten(d);
    const letzte = this._daten.letzte_rolle;
    const bedarf = (d.gewicht || 0) + 0.5;
    return this._daten.rollen.map((r) => {
      let p = 0;
      const gruende = [];
      if (r.id === this._daten.geladen) { p += 10; gruende.push("ist geladen"); }   // immer zuerst
      else if (r.id === letzte) { p += 4; gruende.push("zuletzt benutzt"); }
      if (mats) { if (mats.includes(r.material)) { p += 3; gruende.push(`${zahl(d.duese_c)} °C passt zu ${r.material}`); } else p -= 3; }
      if (r.rest_g != null) { if (r.rest_g >= bedarf) p += 1; else { p -= 4; gruende.push("zu wenig Rest"); } }
      if (r.probiert) p += 0.5;
      return { rolle: r, p, gruende };
    }).sort((a, b) => b.p - a.p).slice(0, 3);
  },

  async _buStromLaden(d) {
    const id = this._drId && this._drId("monat", true);
    const bu = this._bu;
    if (!id || !d.start || !d.ende || d.hand) { bu.strom = null; return; }
    try {
      const vorher = new Date(new Date(d.start).getTime() - 60000).toISOString();
      const nachher = new Date(new Date(d.ende).getTime() + 60000).toISOString();
      const r = await this._hass.callWS({ type: "history/history_during_period", start_time: vorher, end_time: nachher, entity_ids: [id], minimal_response: true, no_attributes: true });
      const werte = ((r && r[id]) || []).map((x) => Number(x.s != null ? x.s : x.state)).filter((x) => !isNaN(x));
      let kwh = null;
      if (werte.length >= 2) {
        // Monatswechsel: Zähler fällt auf 0 → Anteile addieren
        kwh = 0;
        for (let i = 1; i < werte.length; i++) kwh += werte[i] >= werte[i - 1] ? werte[i] - werte[i - 1] : werte[i];
      }
      bu.strom = kwh != null ? { kwh, eur: kwh * this._daten.einstellungen.strompreis } : null;
    } catch (e) {
      bu.strom = null;
    }
    if (this._bu === bu && this._dialog === "bu") { const k = this.shadowRoot.getElementById("bu-kosten"); if (k) k.innerHTML = this._buKostenHtml(); }
  },

  _buKostenHtml() {
    const bu = this._bu, d = this._buAlle().find((x) => x.uid === bu.uid);
    const rolle = this._daten.rollen.find((r) => r.id === bu.rolleId);
    const b = this._buBedarf(d, rolle, bu.fortschritt);
    const preis = rolle ? this._preisProGramm(rolle) : null;
    const fil = preis ? b.summe * preis.wert : null;
    const strom = bu.strom === "laedt" ? "lädt …" : bu.strom ? `${zahl(bu.strom.kwh, 3)} kWh · ${zahl(bu.strom.eur, 2)} €` : "keine Messung";
    const gesamt = (fil || 0) + (bu.strom && bu.strom.eur ? bu.strom.eur : 0);
    return `<div class="info-zeile"><span>Filament${preis ? `<small class="norm">${zahl(preis.wert * 100, 1)} ct/g${preis.voreingestellt ? ` · ${zahl(PREIS_STANDARD_ROLLE, 2)} € je Rolle` : ""}</small>` : ""}</span><strong>${fil != null ? `${zahl(fil, 2)} €${this._voreingestelltHtml(preis)}` : `<span class="leise">keine Rolle gewählt</span>`}</strong></div>
      <div class="info-zeile"><span>Strom (Steckdose)</span><strong>${strom}</strong></div>
      <div class="info-zeile"><span>Dieser Druck</span><strong>${gesamt ? `${zahl(gesamt, 2)} €` : "–"}</strong></div>`;
  },

  _buDialogHtml() {
    const bu = this._bu;
    const d = bu && this._buAlle().find((x) => x.uid === bu.uid);
    if (!d) return "";
    if (bu.schritt === "fragen") return this._buFragenHtml(d);
    if (bu.schritt === "loesungen") return this._buLoesungenHtml(d);
    const rolle = this._daten.rollen.find((r) => r.id === bu.rolleId);
    const vor = this._buVorschlaege(d);
    const b = this._buBedarf(d, rolle, bu.fortschritt);
    const e = this._daten.einstellungen;
    const alt = this._daten.letzte_rolle && this._daten.letzte_rolle !== bu.rolleId ? this._daten.rollen.find((r) => r.id === this._daten.letzte_rolle) : null;
    const f = fotoName(d), foto = f && this._drFotos && this._drFotos[f];
    const rest = rolle && rolle.rest_g != null ? rolle.rest_g - b.summe : null;
    const kachel = (r, gruende) => `<button class="bu-rolle ${r.id === bu.rolleId ? "an" : ""}" data-aktion="bu-rolle" data-id="${esc(r.id)}">
        ${spuleSvg(r)}<span class="bu-rolle-text"><strong>${esc(r.name)}</strong><small>${esc(r.hersteller)} · ${r.rest_g != null ? `${zahl(r.rest_g)} g` : "nicht gewogen"}</small>
        ${gruende && gruende.length ? `<small class="mint">${esc(gruende.join(" · "))}</small>` : ""}</span>${r.achtung ? `<span class="achtung-punkt" title="Rolle beobachten">!</span>` : ""}</button>`;
    const andere = this._daten.rollen.slice().sort((a, c) => a.name.localeCompare(c.name, "de"));
    return `<div class="bu-kopf">
        <span class="ld-bild">${foto ? `<img src="${esc(foto)}" alt="">` : "🖨️"}</span>
        <div><h2>${esc(d.name)}</h2><p class="leise klein">${esc(d.zeit)}${d.gewicht != null ? ` · ${zahl(d.gewicht, 1)} g laut Slicer` : ""}</p></div>
      </div>
      ${d.status === "failed" || bu.ergebnis !== "ok" ? `<div class="chips bu-ergebnis">
        <button class="chip ${bu.ergebnis === "fehl" ? "an rot-chip" : ""}" data-aktion="bu-ergebnis" data-id="fehl">⛔ Fehldruck</button>
        <button class="chip ${bu.ergebnis === "anders" ? "an" : ""}" data-aktion="bu-ergebnis" data-id="anders">🤷 Anders überlegt</button>
        <button class="chip ${bu.ergebnis === "ok" ? "an" : ""}" data-aktion="bu-ergebnis" data-id="ok">✅ Doch fertig</button></div>
        <p class="leise klein">${bu.ergebnis === "anders" ? "Zählt nicht in die Fehlerquote. Das verbrauchte Material wird trotzdem abgezogen." : bu.ergebnis === "fehl" ? "Danach stelle ich dir ein paar Fragen zur Ursache." : ""}</p>
        <div class="mod-regler"><div class="r-kopf"><span>Gedruckt bis</span><strong id="bu-wert-fortschritt">${zahl(bu.fortschritt)} %</strong></div>
          <div class="regler-zeile"><input type="range" min="0" max="100" step="1" value="${bu.fortschritt}" data-bu="fortschritt"></div></div>` : ""}
      <h3>Welche Rolle war drin?</h3>
      <div class="bu-rollen">${vor.map((v) => kachel(v.rolle, v.gruende)).join("")}</div>
      ${bu.waehlen ? `<label class="auswahl breit-auswahl"><span>Andere Rolle</span><select data-bu="rolle">${andere.map((r) => `<option value="${esc(r.id)}" ${r.id === bu.rolleId ? "selected" : ""}>${esc(r.name)} · ${esc(r.hersteller)}</option>`).join("")}</select></label>`
        : `<button class="mini mint-rand" data-aktion="bu-waehlen">Andere Rolle wählen</button>`}
      <div id="bu-rechnung" class="info-liste oben-abstand">${this._buRechnungHtml(d, rolle, b, alt, rest)}</div>
      <h3>Kosten</h3>
      <div id="bu-kosten" class="info-liste">${this._buKostenHtml()}</div>
      <div class="knopf-reihe oben-abstand">
        <button class="knopf leise" data-aktion="bu-ignorieren">Nicht verbuchen</button>
        <button class="knopf" data-aktion="bu-buchen" ${rolle ? "" : "disabled"}>${bu.ergebnis === "fehl" ? "Verbuchen und Ursache suchen" : "Verbuchen"}</button>
      </div>`;
  },

  _buRechnungHtml(d, rolle, b, alt, rest) {
    const e = this._daten.einstellungen;
    return `${d.gewicht == null ? `<div class="info-zeile"><span class="amber">Gewicht fehlt im Eintrag</span><strong>0 g</strong></div>` : `<div class="info-zeile"><span>Druck${this._bu.fortschritt < 100 ? ` (${zahl(this._bu.fortschritt)} %)` : ""}${b.korr !== 1 ? `<small class="norm">${zahl(b.slicer, 1)} g laut Slicer · ${esc(this._korrekturText(rolle))}</small>` : ""}</span><strong>${zahl(b.druck, 1)} g</strong></div>`}
      <div class="info-zeile"><span>Anfangslinie + 3× Extruder</span><strong>${zahl(e.linie_g + e.extruder_g, 2)} g</strong></div>
      <div class="info-zeile"><span><strong class="tx">Von ${esc(rolle ? rolle.name : "–")} ab</strong></span><strong>${zahl(b.summe, 1)} g</strong></div>
      ${alt ? `<div class="info-zeile"><span>🔁 Rollenwechsel: Reststück von ${esc(alt.name)}</span><strong>${zahl(e.wechsel_g, 2)} g</strong></div>` : ""}
      ${rest != null ? `<div class="info-zeile"><span>Danach auf der Rolle</span><strong class="${rest < 0 ? "rot" : ""}">${rest < 0 ? "reicht rechnerisch nicht (bitte wiegen)" : `${zahl(rest)} g`}</strong></div>` : ""}`;
  },

  _buRechnungNeu() {
    const bu = this._bu, d = this._buAlle().find((x) => x.uid === bu.uid);
    const rolle = this._daten.rollen.find((r) => r.id === bu.rolleId);
    const b = this._buBedarf(d, rolle, bu.fortschritt);
    const alt = this._daten.letzte_rolle && this._daten.letzte_rolle !== bu.rolleId ? this._daten.rollen.find((r) => r.id === this._daten.letzte_rolle) : null;
    const el = this.shadowRoot.getElementById("bu-rechnung");
    if (el) el.innerHTML = this._buRechnungHtml(d, rolle, b, alt, rolle && rolle.rest_g != null ? rolle.rest_g - b.summe : null);
    const k = this.shadowRoot.getElementById("bu-kosten");
    if (k) k.innerHTML = this._buKostenHtml();
  },

  _buBuchen() {
    const bu = this._bu, d = this._buAlle().find((x) => x.uid === bu.uid);
    const rolle = this._daten.rollen.find((r) => r.id === bu.rolleId);
    if (!d || !rolle) return;
    if (this._buExtra(d.uid).gebucht) { this._toast("Dieser Druck ist schon verbucht."); this._dialog = null; return; }   // doppelt getippt
    const e = this._daten.einstellungen;
    const b = this._buBedarf(d, rolle, bu.fortschritt);
    let wechsel = null;
    const alt = this._daten.letzte_rolle && this._daten.letzte_rolle !== rolle.id ? this._daten.rollen.find((r) => r.id === this._daten.letzte_rolle) : null;
    if (alt) {
      wechsel = { rolle: alt.id, g: e.wechsel_g };
      if (alt.rest_g != null) alt.rest_g = Math.max(0, alt.rest_g - e.wechsel_g);
    }
    if (rolle.rest_g != null) rolle.rest_g = Math.max(0, rolle.rest_g - b.summe);
    rolle.verbraucht_g = (rolle.verbraucht_g || 0) + b.summe;
    const preis = this._preisProGramm(rolle);
    const fil = b.summe * preis.wert;
    const strom = bu.strom && bu.strom !== "laedt" ? bu.strom : null;
    this._daten.drucke[d.uid] = {
      ...this._buExtra(d.uid),
      gebucht: { am: new Date().toISOString(), rolle: rolle.id, g: b.summe, druck_g: b.druck, slicer_g: b.slicer, korr: b.korr, fix_g: b.fix, wechsel, ergebnis: bu.ergebnis, fortschritt: bu.fortschritt,
        kosten: { filament: fil, voreingestellt: preis.voreingestellt || undefined, kwh: strom ? strom.kwh : null, strom: strom ? strom.eur : null } },
      name: d.name, start: d.start, ende: d.ende,
    };
    this._daten.letzte_rolle = rolle.id;
    let text = `${zahl(b.summe, 1)} g von ${rolle.name} abgezogen${wechsel ? `, ${zahl(wechsel.g, 2)} g Reststück von ${alt.name}` : ""}.`;
    if (bu.ergebnis === "ok" && rolle.achtung) {
      delete rolle.achtung;
      text += " Druck geglückt, das rote Ausrufezeichen ist weg.";
    }
    this._speichern();
    if (bu.ergebnis === "fehl") { bu.schritt = "fragen"; this._toast(text); return; }
    this._dialog = null;
    this._bu = null;
    this._toast(text);
    setTimeout(() => this._buNachLaden(), 3000);
  },

  _buRueckgaengig(uid) {
    const x = this._buExtra(uid), g = x.gebucht;
    if (!g) return;
    const rolle = this._daten.rollen.find((r) => r.id === g.rolle);
    if (rolle) { if (rolle.rest_g != null) rolle.rest_g += g.g; rolle.verbraucht_g = Math.max(0, (rolle.verbraucht_g || 0) - g.g); }
    if (g.wechsel) { const alt = this._daten.rollen.find((r) => r.id === g.wechsel.rolle); if (alt && alt.rest_g != null) alt.rest_g += g.wechsel.g; }
    delete x.gebucht;
    delete x.fehl;
    this._speichern();
    this._toast(`Buchung zurückgenommen, ${zahl(g.g, 1)} g wieder gutgeschrieben.`);
  },

  // ---- Fehldruck: Fragen ----
  _buFragenHtml(d) {
    const bu = this._bu;
    return `<h2>Was ist passiert?</h2><p class="leise klein">${esc(d.name)} · ${zahl(bu.fortschritt)} % gedruckt</p>
      <h3>Wann ging es schief?</h3>
      <div class="chips">${FEHL_FRAGEN.wann.map((w) => `<button class="chip ${bu.wann === w.id ? "an" : ""}" data-aktion="bu-wann" data-id="${w.id}">${w.name}</button>`).join("")}</div>
      ${bu.wann ? `<p class="leise klein">${esc(FEHL_FRAGEN.wann.find((w) => w.id === bu.wann).hinweis)}</p>` : ""}
      <h3>Wie sieht es aus? <span class="leise klein">(mehrere möglich)</span></h3>
      <div class="bu-bilder">${FEHLERBILDER.map((f) => `<button class="bu-bild ${bu.bilder.includes(f.id) ? "an" : ""}" data-aktion="bu-bild" data-id="${f.id}">${FB_ZEICHNUNG[f.id] || ""}<span>${esc(f.name)}</span></button>`).join("")}</div>
      <h3>Noch drei kurze Fragen</h3>
      ${FEHL_FRAGEN.extra.map((q) => `<div class="bu-frage"><span>${esc(q.frage)}</span><span class="chips">
        ${["ja", "nein", "?"].map((a) => `<button class="chip ${bu.extra[q.id] === a ? "an" : ""}" data-aktion="bu-extra" data-id="${q.id}" data-a="${a}">${a === "?" ? "weiß nicht" : a}</button>`).join("")}</span></div>`).join("")}
      <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="bu-fertig">Überspringen</button>
        <button class="knopf" data-aktion="bu-auswerten">Ursachen anzeigen</button></div>`;
  },

  _buUrsachen() {
    const bu = this._bu;
    const liste = [...bu.bilder];
    FEHL_FRAGEN.extra.forEach((q) => { const a = bu.extra[q.id]; if (a === "nein" && q.nein && !liste.includes(q.nein)) liste.push(q.nein); });
    if (!liste.length) {
      // Nichts ausgewählt: aus dem Zeitpunkt die häufigste Ursache nehmen
      liste.push(bu.wann === "erste" || bu.wann === "frueh" ? "haftung" : bu.wann === "spaet" ? "verstopft" : "spaghetti");
    }
    return liste.map(fehlerbild).filter(Boolean);
  },

  _buLoesungenHtml(d) {
    const bu = this._bu;
    const rolle = this._daten.rollen.find((r) => r.id === bu.rolleId);
    const ursachen = this._buUrsachen();
    return `<h2>Mögliche Ursachen</h2><p class="leise klein">Für ${esc(rolle ? rolle.name : "die Rolle")}. Haken bei den Werten, die ich in die Rolle übernehmen soll.</p>
      ${ursachen.map((u) => `<div class="bu-ursache"><div class="bu-ursache-kopf">${FB_ZEICHNUNG[u.id] || ""}<div><strong>${esc(u.name)}</strong><small class="leise">${esc(u.ursachen.join(" · "))}</small></div></div>
        <ul class="bu-loesungen">${u.loesungen.map((l, i) => {
          const a = l.aenderung && rolle ? aenderungRechnen(rolle, l.aenderung) : null;
          const key = `${u.id}-${i}`;
          return `<li>${a ? `<button class="bu-haken ${bu.uebernehmen[key] ? "an" : ""}" data-aktion="bu-haken" data-id="${key}" aria-label="übernehmen">${bu.uebernehmen[key] ? "✓" : ""}</button>` : `<span class="bu-punkt">•</span>`}
            <span>${esc(l.text)}${a ? ` <span class="bu-aend">${esc(a.feld.name)}: ${zahl(a.alt, a.feld.nk || 0)} → <strong>${zahl(a.neu, a.feld.nk || 0)}</strong> ${esc(a.feld.e)}</span>` : ""}</span></li>`;
        }).join("")}</ul></div>`).join("")}
      <div class="hinweis rot-hinweis">Die Rolle bekommt ein rotes <strong>!</strong>, bis ein Druck mit ihr wieder klappt.</div>
      <div class="knopf-reihe"><button class="knopf leise" data-aktion="bu-zurueck">Zurück</button>
        <button class="knopf" data-aktion="bu-fehl-speichern">${Object.values(bu.uebernehmen).some(Boolean) ? "Übernehmen und markieren" : "Rolle markieren"}</button></div>`;
  },

  _buFehlSpeichern() {
    const bu = this._bu;
    const rolle = this._daten.rollen.find((r) => r.id === bu.rolleId);
    const ursachen = this._buUrsachen();
    const geaendert = [];
    if (rolle) {
      ursachen.forEach((u) => u.loesungen.forEach((l, i) => {
        if (!bu.uebernehmen[`${u.id}-${i}`] || !l.aenderung) return;
        const a = aenderungRechnen(rolle, l.aenderung);
        if (!a) return;
        rolle.eigen = { ...(rolle.eigen || {}), [a.k]: a.neu };
        geaendert.push(`${a.feld.name} ${zahl(a.neu, a.feld.nk || 0)} ${a.feld.e}`.trim());
      }));
      rolle.achtung = { seit: new Date().toISOString(), druck: bu.uid, grund: ursachen.map((u) => u.name).join(", "), geaendert };
    }
    const x = this._daten.drucke[bu.uid] || (this._daten.drucke[bu.uid] = {});
    x.fehl = { wann: bu.wann, bilder: bu.bilder, extra: bu.extra, ursachen: ursachen.map((u) => u.id), geaendert };
    this._speichern();
    this._dialog = null;
    this._bu = null;
    this._toast(geaendert.length ? `Gespeichert: ${geaendert.join(", ")}. Rolle ist rot markiert.` : "Gespeichert. Die Rolle ist rot markiert, bis ein Druck klappt.");
  },

  // ---- Druck von Hand nachtragen ----
  _buHandHtml() {
    const h = this._buHand;
    const rollen = this._daten.rollen.slice().sort((a, b) => a.name.localeCompare(b.name, "de"));
    return `<h2>Druck nachtragen</h2><p class="leise klein">Wenn die Automation einen Druck nicht erfasst hat, z. B. weil die Bambu-Cloud nicht erreichbar war.</p>
      <label class="feld"><span>Name</span><input id="bu-hand-name" value="${esc(h.name)}" placeholder="z. B. Kabelhalter"></label>
      <div class="mod-regler"><div class="r-kopf"><span>Gewicht laut Slicer</span><strong id="bu-wert-hand-g">${zahl(h.gewicht, 1)} g</strong></div>
        <div class="regler-zeile"><input type="range" min="0" max="500" step="0.5" value="${h.gewicht}" data-bu="hand-g"></div></div>
      <div class="chips"><button class="chip ${h.status === "finish" ? "an" : ""}" data-aktion="bu-hand-status" data-id="finish">Fertig</button>
        <button class="chip ${h.status === "failed" ? "an" : ""}" data-aktion="bu-hand-status" data-id="failed">Abgebrochen</button></div>
      <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="dialog-zu">Abbrechen</button>
        <button class="knopf" data-aktion="bu-hand-ok">Weiter zum Verbuchen</button></div>`;
  },

  _buKlick(a, el) {
    const bu = this._bu;
    switch (a) {
      case "bu-start": this._buStarten(el.dataset.uid, el.dataset.ergebnis); break;
      case "bu-rolle": bu.rolleId = el.dataset.id; break;
      case "bu-waehlen": bu.waehlen = true; break;
      case "bu-ergebnis": bu.ergebnis = el.dataset.id; if (bu.ergebnis === "ok") bu.fortschritt = 100; break;
      case "bu-buchen": this._buBuchen(); break;
      case "bu-ignorieren":
        this._daten.drucke[bu.uid] = { ...this._buExtra(bu.uid), ignoriert: true };
        this._speichern(); this._dialog = null; this._bu = null;
        this._toast("Wird nicht verbucht. Im Druckverlauf kannst du es später nachholen.");
        return;
      case "bu-wann": bu.wann = el.dataset.id; break;
      case "bu-bild": bu.bilder = bu.bilder.includes(el.dataset.id) ? bu.bilder.filter((x) => x !== el.dataset.id) : [...bu.bilder, el.dataset.id]; break;
      case "bu-extra": bu.extra[el.dataset.id] = el.dataset.a; break;
      case "bu-auswerten": bu.schritt = "loesungen"; this._sheetScroll = 0; break;
      case "bu-zurueck": bu.schritt = "fragen"; break;
      case "bu-haken": bu.uebernehmen[el.dataset.id] = !bu.uebernehmen[el.dataset.id]; break;
      case "bu-fehl-speichern": this._buFehlSpeichern(); return;
      case "bu-fertig": this._dialog = null; this._bu = null; break;
      case "bu-rueckgaengig": this._buRueckgaengig(el.dataset.uid); break;
      case "bu-hand": this._buHand = { name: "", gewicht: 10, status: "finish" }; this._dialog = "bu-hand"; break;
      case "bu-hand-status": this._buHand.status = el.dataset.id; break;
      case "bu-hand-ok": {
        const name = (this.shadowRoot.getElementById("bu-hand-name").value || "").trim() || "Druck von Hand";
        const uid = `hand-${Date.now()}`;
        this._daten.drucke[uid] = { hand: { name, gewicht: this._buHand.gewicht, start: new Date().toISOString(), status: this._buHand.status, fortschritt: 50 } };
        this._speichern();
        this._buStarten(uid);
        break;
      }
      case "bu-achtung-weg": {
        const r = this._daten.rollen.find((x) => x.id === el.dataset.id);
        if (r) { delete r.achtung; this._speichern(); this._toast("Markierung entfernt."); }
        break;
      }
      default: return;
    }
    this._zeichnen();
  },

  _buEingabe(t) {
    const k = t.dataset && t.dataset.bu;
    if (!k) return false;
    if (k === "fortschritt") {
      this._bu.fortschritt = Number(t.value);
      const w = this.shadowRoot.getElementById("bu-wert-fortschritt");
      if (w) w.textContent = `${zahl(this._bu.fortschritt)} %`;
      this._buRechnungNeu();
    }
    if (k === "hand-g") {
      this._buHand.gewicht = Number(t.value);
      const w = this.shadowRoot.getElementById("bu-wert-hand-g");
      if (w) w.textContent = `${zahl(this._buHand.gewicht, 1)} g`;
    }
    if (k === "rolle") { this._bu.rolleId = t.value; this._buRechnungNeu(); }
    return true;
  },
  _buAenderung(t) {
    const k = t.dataset && t.dataset.bu;
    if (!k) return false;
    if (k === "rolle") { this._bu.rolleId = t.value; this._zeichnen(); }
    if (k === "fortschritt") this._bu.wann = wannAusFortschritt(this._bu.fortschritt);
    return true;
  },

  // Für Rollen-Detail: letzter verbuchter Druck dieser Rolle
  _buLetzterDruck(rolleId) {
    let best = null;
    for (const [uid, x] of Object.entries(this._daten.drucke || {})) {
      if (x.gebucht && x.gebucht.rolle === rolleId && (!best || x.gebucht.am > best.x.gebucht.am)) best = { uid, x };
    }
    if (!best) return null;
    const d = this._buAlle().find((v) => v.uid === best.uid);
    return { uid: best.uid, name: (d && d.name) || best.x.name || "Druck", d, x: best.x };
  },
  // ---- Preis und Korrektur je Rolle (auch für andere Bereiche) ----
  // Preis pro Gramm: eigener Preis oder voreingestellt 19,99 € je Rolle → { wert, voreingestellt }
  _preisProGramm(rolle) { return preisProGramm(rolle); },
  // Dezente Markierung hinter einem Preis, der auf dem voreingestellten Rollenpreis beruht
  _voreingestelltHtml(preis) {
    return preis && preis.voreingestellt ? ` <span class="voreingestellt" title="Kein eigener Preis: gerechnet mit ${zahl(PREIS_STANDARD_ROLLE, 2)} € je Rolle">voreingestellt</span>` : "";
  },

  // Korrekturfaktor für das Slicer-Gewicht: zuerst der dieser Rolle, sonst der des Materials
  _korrektur(rolle) {
    if (!rolle) return { faktor: 1, quelle: null, n: 0 };
    const k = rolle.korrektur;
    if (k && k.n >= 1 && k.f > 0) return { faktor: k.f, quelle: "rolle", n: k.n };
    const e = this._daten.einstellungen;
    const f = (e.korrektur || {})[rolle.material];
    if (f > 0 && f !== 1) return { faktor: f, quelle: "material", n: (e.korrektur_n || {})[rolle.material] || 1 };
    return { faktor: 1, quelle: null, n: 0 };
  },
  // z. B. „Korrektur +4 % (gelernt aus 3 Wiegungen)“
  _korrekturText(rolle) {
    const k = this._korrektur(rolle);
    if (!k.quelle) return "Keine Korrektur";
    const p = Math.round((k.faktor - 1) * 100);
    return `Korrektur ${p > 0 ? "+" : p < 0 ? "−" : "±"}${Math.abs(p)} % (${k.quelle === "material" ? `${rolle.material}, ` : ""}gelernt aus ${k.n} ${k.n === 1 ? "Wiegung" : "Wiegungen"})`;
  },

  // Seit dem letzten Wiegen verbucht: gesamt, davon Slicer-Gewicht (ohne Korrektur) und feste Posten
  _buSeitWiegen(r) {
    const ab = r.gewogen_am || "";
    let g = 0, slicer = 0, fix = 0, n = 0;
    for (const x of Object.values(this._daten.drucke || {})) {
      const b = x.gebucht;
      if (b && b.rolle === r.id && b.am > ab) {
        g += b.g; fix += b.fix_g || 0; n++;
        slicer += b.slicer_g != null ? b.slicer_g : (b.druck_g || 0) / (b.korr || 1);
      }
      if (b && b.wechsel && b.wechsel.rolle === r.id && b.am > ab) { g += b.wechsel.g; fix += b.wechsel.g; }
    }
    return { g, slicer, fix, n };
  },

  // Wiegen: gewogenen Rest mit dem verbuchten vergleichen und daraus den Faktor lernen
  // (je Rolle und je Material). Ändert rest_g nicht. Gibt einen Satz für die Meldung zurück.
  _wiegungLernen(r, netto) {
    if (!r || r.rest_g == null) return "";
    const seit = this._buSeitWiegen(r);
    if (!seit.n || seit.slicer < 5) return "";   // zu wenig verbucht, um etwas zu lernen
    const echt = r.rest_g + seit.g - netto;     // tatsächlich verbraucht seit dem letzten Wiegen
    const faktor = (echt - seit.fix) / seit.slicer;
    const [min, max] = KORREKTUR_UNPLAUSIBEL;
    if (!(faktor >= min && faktor <= max)) return ` Abweichung zu groß (× ${zahl(faktor, 2)}), Korrektur nicht gelernt. Stimmt das Spulengewicht?`;
    const d = this._daten, e = d.einstellungen;
    const k = r.korrektur || { f: 1, n: 0 };
    r.korrektur = { f: korrekturMitteln(k.f, k.n, faktor), n: k.n + 1, am: new Date().toISOString() };
    const mn = (e.korrektur_n || {})[r.material] || (e.korrektur[r.material] ? 1 : 0);
    e.korrektur = { ...e.korrektur, [r.material]: korrekturMitteln(e.korrektur[r.material], mn, faktor) };
    e.korrektur_n = { ...(e.korrektur_n || {}), [r.material]: mn + 1 };
    d.abgleich = [...(d.abgleich || []), { am: new Date().toISOString(), rolle: r.id, name: r.name, material: r.material, gebucht: seit.g, echt, faktor }].slice(-60);
    return ` ${this._korrekturText(r)}.`;
  },
  _korrekturZuruecksetzen(r) {
    delete r.korrektur;
    this._speichern();
    this._toast(`Korrektur für ${r.name} zurückgesetzt.`);
  },
};
