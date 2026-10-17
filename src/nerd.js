// ---------------------------------------------------------------------------
// Nerd-Menü: Statistik, Fehlerquoten, wann Drucke scheitern, Schätzung gegen
// Waage (Korrekturfaktor), eigene Werte gegen Vorschläge, Gesundheit des Druckers
// ---------------------------------------------------------------------------

const NE_TABS = [["statistik", "📊 Statistik"], ["abgleich", "⚖️ Schätzung vs. Waage"], ["werte", "🎛️ Deine Werte"], ["gesundheit", "❤️ Gesundheit"]];
const NE_VERGLEICH = ["duese", "duese_erste", "bett", "luefter_max", "flow", "k", "max_vol", "v_aussen"];
const NE_TAGESZEIT = [["Nacht", 0, 6], ["Morgen", 6, 12], ["Nachmittag", 12, 18], ["Abend", 18, 24]];

// Zeitpunkt aus einem HA-Verlaufseintrag (komprimiert: lu in Sekunden)
function verlaufZeit(x) {
  if (x.lu != null) return x.lu * 1000;
  return new Date(x.last_updated || x.last_changed || x.lc || 0).getTime();
}
// Aufheizvorgänge: Zieltemperatur springt hoch → Zeit, bis die Ist-Temperatur fast da ist
function aufheizZeiten(ziel, ist, schwelle) {
  const z = ziel.map((x) => ({ t: verlaufZeit(x), v: Number(x.s ?? x.state) })).filter((x) => !isNaN(x.v) && x.t);
  const i = ist.map((x) => ({ t: verlaufZeit(x), v: Number(x.s ?? x.state) })).filter((x) => !isNaN(x.v) && x.t);
  const erg = [];
  for (let k = 1; k < z.length; k++) {
    if (!(z[k - 1].v < schwelle && z[k].v >= schwelle)) continue;
    const t0 = z[k].t, soll = z[k].v;
    const start = [...i].reverse().find((x) => x.t <= t0);
    const da = i.find((x) => x.t >= t0 && x.v >= soll - 3);
    if (!da) continue;
    const s = (da.t - t0) / 1000;
    if (s > 3 && s < 1800) erg.push({ am: t0, s, soll, von: start ? start.v : null });
  }
  return erg;
}

const NerdAnsicht = {
  _neZustand() {
    if (!this._ne) this._ne = { tab: "statistik", abRolle: null, abWert: null, heiz: null };
    return this._ne;
  },
  _neHtml() {
    const n = this._neZustand();
    const inhalt = { abgleich: () => this._neAbgleichHtml(), werte: () => this._neWerteHtml(), gesundheit: () => this._neGesundheitHtml() }[n.tab] || (() => this._neStatistikHtml());
    return `<div class="ne-seite">
      <div class="chips unter-tabs">${NE_TABS.map(([id, t]) => `<button class="chip ${n.tab === id ? "an" : ""}" data-aktion="ne-tab" data-id="${id}">${t}</button>`).join("")}</div>
      <div class="wechsel-rein" data-einmal="ne-${n.tab}">${inhalt()}${n.tab === "statistik" && this._shopNerdHtml ? this._shopNerdHtml() : ""}</div></div>`;
  },

  // Ein Datensatz je Druck: Ergebnis, Material, Rolle, Zeitpunkte
  _neDrucke() {
    return this._buAlle().filter((d) => d.status !== "laeuft").map((d) => {
      const x = this._buExtra(d.uid), g = x.gebucht;
      const ergebnis = g ? g.ergebnis : d.status === "finish" ? "ok" : d.status === "failed" ? "abbruch" : null;
      const r = g ? this._daten.rollen.find((y) => y.id === g.rolle) : null;
      const dauer = d.start && d.ende ? (new Date(d.ende) - new Date(d.start)) / 3600000 : null;
      return { d, x, g, ergebnis, rolle: r, material: r ? r.material : null, dauer: dauer > 0 && dauer < 200 ? dauer : null,
        wann: x.fehl && x.fehl.wann ? x.fehl.wann : g && g.ergebnis === "fehl" ? wannAusFortschritt(g.fortschritt) : null };
    });
  },

  _neStatistikHtml() {
    const l = this._neDrucke();
    if (!l.length) return `<div class="leer-karte dr-karte"><span class="gross-icon">📊</span><strong>Noch keine Drucke</strong><span class="leise">Sobald Drucke aufgezeichnet und verbucht sind, erscheinen hier Zahlen.</span></div>`;
    const ok = l.filter((x) => x.ergebnis === "ok").length, fehl = l.filter((x) => x.ergebnis === "fehl").length;
    const stunden = l.reduce((s, x) => s + (x.dauer || 0), 0);
    const gramm = l.reduce((s, x) => s + (x.g ? x.g.g : 0), 0);
    const kwh = l.reduce((s, x) => s + (x.g && x.g.kosten && x.g.kosten.kwh ? x.g.kosten.kwh : 0), 0);
    const quote = ok + fehl ? Math.round((ok / (ok + fehl)) * 100) : null;
    const kachel = (w, t, k = "") => `<div class="stat ${k}"><strong>${w}</strong><span>${t}</span></div>`;
    // Fehlerquote je Material und je Rolle
    const gruppe = (schl) => {
      const m = {};
      for (const x of l) { const k = schl(x); if (!k || !(x.ergebnis === "ok" || x.ergebnis === "fehl")) continue; (m[k] = m[k] || { ok: 0, fehl: 0 })[x.ergebnis]++; }
      return Object.entries(m).map(([k, v]) => ({ k, ...v, n: v.ok + v.fehl, q: v.fehl / (v.ok + v.fehl) })).sort((a, b) => b.q - a.q || b.n - a.n);
    };
    const balken = (zeilen, name) => zeilen.length ? `<div class="ne-balken-liste">${zeilen.slice(0, 8).map((z) => `<div class="ne-balken-zeile"><span>${esc(name(z.k))}</span>
      <div class="ne-balken"><span style="width:${Math.max(2, Math.round(z.q * 100))}%" class="${z.q >= 0.3 ? "rot" : z.q >= 0.1 ? "amber" : ""}"></span></div><small>${Math.round(z.q * 100)} % · ${z.fehl}/${z.n}</small></div>`).join("")}</div>`
      : `<p class="leise klein">Noch keine verbuchten Drucke.</p>`;
    const rollenName = (id) => { const r = this._daten.rollen.find((x) => x.id === id); return r ? r.name : "gelöschte Rolle"; };
    // Wann scheitern Drucke: Phase und Tageszeit
    const fehlL = l.filter((x) => x.ergebnis === "fehl");
    const phasen = FEHL_FRAGEN.wann.map((w) => ({ name: w.name, n: fehlL.filter((x) => x.wann === w.id).length }));
    const maxP = Math.max(1, ...phasen.map((p) => p.n));
    const tz = NE_TAGESZEIT.map(([name, von, bis]) => {
      const imFenster = l.filter((x) => { if (!x.d.start || !(x.ergebnis === "ok" || x.ergebnis === "fehl")) return false; const h = new Date(x.d.start).getHours(); return h >= von && h < bis; });
      const f = imFenster.filter((x) => x.ergebnis === "fehl").length;
      return { name, n: imFenster.length, f, q: imFenster.length ? f / imFenster.length : 0 };
    });
    return `<section class="stats">
        ${kachel(l.length, "Drucke")}${kachel(quote == null ? "–" : `${quote} %`, "geglückt", quote != null && quote < 80 ? "amber" : "")}
        ${kachel(fehl, "Fehldrucke", fehl ? "rot" : "")}${kachel(`${zahl(stunden, 1)} h`, "Druckzeit")}
        ${kachel(`${zahl(gramm / 1000, 2)} kg`, "verbraucht")}${kachel(`${zahl(kwh, 1)} kWh`, "Strom")}</section>
      <div class="ws-zwei oben-abstand">
        <div class="dr-karte"><h3 class="dr-titel">Fehlerquote je Material</h3>${balken(gruppe((x) => x.material), (k) => k)}
          <h3>Fehlerquote je Rolle</h3>${balken(gruppe((x) => x.g && x.g.rolle), rollenName)}</div>
        <div class="dr-karte"><h3 class="dr-titel">Wann Drucke scheitern</h3>
          ${fehlL.length ? `<div class="ne-phasen">${phasen.map((p) => `<div class="ne-phase"><div class="ne-phase-bahn"><span style="height:${(p.n / maxP) * 100}%"></span></div><strong>${p.n}</strong><small>${esc(p.name)}</small></div>`).join("")}</div>`
            : `<p class="leise klein">Noch keine Fehldrucke verbucht.</p>`}
          <h3>Nach Tageszeit (Druckstart)</h3>
          <div class="info-liste">${tz.map((t) => `<div class="info-zeile"><span>${t.name}</span><strong>${t.n ? `${t.n} ${t.n === 1 ? "Druck" : "Drucke"} · ${Math.round(t.q * 100)} % Fehldrucke` : "–"}</strong></div>`).join("")}</div>
          ${this._neErkenntnisse(gruppe((x) => x.material), phasen, tz)}</div></div>`;
  },
  // Kurze Sätze aus den Zahlen, nur wenn genug Daten da sind
  _neErkenntnisse(mats, phasen, tz) {
    const s = [];
    const schlecht = mats.find((m) => m.n >= 3 && m.q >= 0.25);
    if (schlecht) s.push(`${schlecht.k} scheitert auffällig oft (${Math.round(schlecht.q * 100)} %). Ein Blick in Hilfe › Fehlerbilder und eine Kalibrierung lohnen sich.`);
    const p = phasen.slice().sort((a, b) => b.n - a.n)[0];
    if (p && p.n >= 2) s.push(`Die meisten Fehldrucke passieren „${p.name}“. ${FEHL_FRAGEN.wann.find((w) => w.name === p.name).hinweis}`);
    const t = tz.filter((x) => x.n >= 3).sort((a, b) => b.q - a.q)[0];
    if (t && t.q >= 0.3) s.push(`Drucke, die ${t.name === "Nacht" ? "nachts" : `am ${t.name}`} starten, scheitern öfter. Vielleicht kühlt der Raum ab oder niemand schaut beim ersten Layer zu.`);
    return s.length ? `<div class="hinweis mint oben-abstand">💡 ${s.map(esc).join("<br>💡 ")}</div>` : "";
  },

  // ---- Schätzung gegen Waage ----
  _neAbgleichHtml() {
    const n = this._ne, d = this._daten;
    const rollen = this._neRollen();
    const r = this._neRolle();
    const korr = d.einstellungen.korrektur || {};
    const verlauf = (d.abgleich || []).slice(-8).reverse();
    if (!r) return `<div class="hinweis amber">Wiege zuerst eine Rolle (Rolle öffnen › Rest), dann kann hier verglichen werden.</div>`;
    const seit = this._neGebuchtSeit(r);
    const brutto = n.abWert != null ? n.abWert : Math.round((r.rest_g || 0) + this._neSpuleG(r));
    const netto = brutto - this._neSpuleG(r);
    const echt = r.rest_g + seit.g - netto;   // tatsächlich verbraucht seit dem letzten Wiegen
    const faktor = seit.druck_g > 0 ? (echt - seit.fix_g) / seit.druck_g : null;
    return `<div class="ws-zwei">
      <div class="dr-karte"><h3 class="dr-titel">Rolle nachwiegen</h3>
        <p class="leise klein">Leg die Rolle mit Spule auf die Waage. Der Vergleich zeigt, ob die Gewichte aus dem Slicer zu deinem Verbrauch passen, und lernt daraus einen Korrekturfaktor je Material.</p>
        <label class="auswahl breit-auswahl"><span>Rolle</span><select data-ne="rolle">${rollen.map((x) => `<option value="${esc(x.id)}" ${x.id === r.id ? "selected" : ""}>${esc(x.name)} · ${esc(x.hersteller)}</option>`).join("")}</select></label>
        <div class="mod-regler"><div class="r-kopf"><span>Waage zeigt (mit Spule)</span><strong id="ne-brutto">${zahl(brutto)} g</strong></div>
          <div class="regler-zeile"><button class="rund" data-aktion="ne-schritt" data-d="-1">−1</button><input type="range" min="0" max="${Math.max(1500, (r.nenn_g || 1000) + 400)}" step="1" value="${brutto}" data-ne="brutto"><button class="rund" data-aktion="ne-schritt" data-d="1">+1</button></div></div>
        <div id="ne-ergebnis">${this._neAbgleichErgebnis(r, seit, netto, echt, faktor)}</div>
        <button class="knopf breit oben-abstand" data-aktion="ne-abgleich" ${seit.n ? "" : "disabled"}>Gewicht übernehmen und Faktor lernen</button>
        ${seit.n ? "" : `<p class="leise klein">Seit dem letzten Wiegen wurde nichts von dieser Rolle verbucht, es gibt noch nichts zu vergleichen.</p>`}</div>
      <div class="dr-karte"><h3 class="dr-titel">Korrekturfaktoren</h3>
        <p class="leise klein">Damit wird das Slicer-Gewicht beim Verbuchen multipliziert. 1,00 = Slicer stimmt genau.</p>
        <div class="info-liste">${[...new Set(d.rollen.map((x) => x.material))].map((m) => `<div class="info-zeile"><span>${esc(m)}</span><strong>${korr[m] ? zahl(korr[m], 3) : "1,000"}</strong></div>`).join("")}</div>
        ${Object.keys(korr).length ? `<button class="knopf leise breit oben-abstand" data-aktion="ne-korr-weg">Faktoren zurücksetzen</button>` : ""}
        ${verlauf.length ? `<h3>Letzte Abgleiche</h3><div class="info-liste">${verlauf.map((v) => `<div class="info-zeile"><span>${esc(v.name)}<small class="norm">${new Date(v.am).toLocaleDateString("de-DE")} · gebucht ${zahl(v.gebucht, 1)} g, echt ${zahl(v.echt, 1)} g</small></span><strong class="${Math.abs(v.faktor - 1) > 0.1 ? "amber" : ""}">× ${zahl(v.faktor, 3)}</strong></div>`).join("")}</div>` : ""}</div></div>`;
  },
  _neAbgleichErgebnis(r, seit, netto, echt, faktor) {
    const abw = seit.g ? ((echt - seit.g) / seit.g) * 100 : 0;
    return `<div class="info-liste oben-abstand">
      <div class="info-zeile"><span>Zuletzt gewogen</span><strong>${r.gewogen_am ? new Date(r.gewogen_am).toLocaleDateString("de-DE") : "–"}</strong></div>
      <div class="info-zeile"><span>Seitdem verbucht</span><strong>${seit.n} Drucke · ${zahl(seit.g, 1)} g</strong></div>
      <div class="info-zeile"><span>Laut Waage verbraucht</span><strong class="${Math.abs(abw) > 10 ? "amber" : ""}">${zahl(echt, 1)} g${seit.g ? ` (${abw >= 0 ? "+" : ""}${zahl(abw)} %)` : ""}</strong></div>
      <div class="info-zeile"><span>Rest neu</span><strong>${zahl(Math.max(0, netto))} g</strong></div>
      <div class="info-zeile"><span>Faktor aus diesem Abgleich</span><strong>${faktor != null && faktor > 0 ? `× ${zahl(faktor, 3)}` : "–"}</strong></div></div>
      ${echt < 0 ? `<div class="hinweis amber">Die Rolle wiegt mehr als erwartet. Stimmt das Spulengewicht?</div>` : ""}`;
  },
  // Nur gewogene Rollen lassen sich vergleichen
  _neRollen() { return this._daten.rollen.filter((r) => r.rest_g != null).sort((a, b) => a.name.localeCompare(b.name, "de")); },
  _neRolle() {
    const l = this._neRollen(), n = this._neZustand();
    return l.find((x) => x.id === n.abRolle) || l.find((x) => x.id === this._daten.letzte_rolle) || l[0] || null;
  },
  _neSpuleG(r) {
    const s = r.spule && this._daten.spulen.find((x) => x.id === r.spule);
    return s ? s.g : r.spule_g != null ? r.spule_g : 0;
  },
  _neGebuchtSeit(r) {
    const ab = r.gewogen_am || "";
    let g = 0, druck_g = 0, fix_g = 0, n = 0;
    for (const x of Object.values(this._daten.drucke || {})) {
      const b = x.gebucht;
      if (b && b.rolle === r.id && b.am > ab) { g += b.g; druck_g += b.druck_g || 0; fix_g += b.fix_g || 0; n++; }
      if (b && b.wechsel && b.wechsel.rolle === r.id && b.am > ab) { g += b.wechsel.g; fix_g += b.wechsel.g; }
    }
    return { g, druck_g, fix_g, n };
  },
  _neAbgleichen() {
    const n = this._ne, d = this._daten;
    const r = this._neRolle();
    if (!r || n.abWert == null) { this._toast("Bitte zuerst das Gewicht von der Waage einstellen."); return; }
    const seit = this._neGebuchtSeit(r);
    const netto = Math.max(0, n.abWert - this._neSpuleG(r));
    const echt = r.rest_g + seit.g - netto;
    let faktor = seit.druck_g > 0 ? (echt - seit.fix_g) / seit.druck_g : null;
    if (faktor != null && (faktor < 0.5 || faktor > 1.6)) {
      this._toast(`Faktor ${zahl(faktor, 2)} ist unplausibel (Spulengewicht oder Waage prüfen). Gewicht übernommen, Faktor nicht gelernt.`);
      faktor = null;
    }
    d.abgleich = [...(d.abgleich || []), { am: new Date().toISOString(), rolle: r.id, name: r.name, material: r.material, gebucht: seit.g, echt, faktor: faktor || 1 }].slice(-60);
    if (faktor != null) {
      // Mittel der letzten Abgleiche dieses Materials, vorsichtig begrenzt
      const f = d.abgleich.filter((v) => v.material === r.material && v.faktor).slice(-5).map((v) => v.faktor);
      d.einstellungen.korrektur = { ...d.einstellungen.korrektur, [r.material]: Math.min(1.3, Math.max(0.7, f.reduce((s, v) => s + v, 0) / f.length)) };
    }
    r.rest_g = netto;
    r.gewogen_am = new Date().toISOString();
    n.abWert = null;
    this._speichern();
    if (faktor != null) this._toast(`${r.name}: ${zahl(netto)} g übernommen, Faktor für ${r.material} jetzt ${zahl(d.einstellungen.korrektur[r.material], 3)}.`);
  },

  // ---- Eigene Werte gegen Vorschläge ----
  _neWerteHtml() {
    const rollen = this._daten.rollen.filter((r) => r.eigen && Object.keys(r.eigen).length);
    if (!rollen.length) return `<div class="leer-karte dr-karte"><span class="gross-icon">🎛️</span><strong>Noch keine eigenen Werte</strong><span class="leise">Wenn du nach einem Test Werte anpasst oder kalibrierst, siehst du hier, wo du vom Vorschlag abweichst.</span></div>`;
    const mats = [...new Set(rollen.map((r) => r.material))];
    const zeilen = mats.map((m) => {
      const rs = rollen.filter((r) => r.material === m);
      const felder = NE_VERGLEICH.map((k) => {
        const f = FELDER.find((x) => x.k === k);
        const diffs = rs.filter((r) => r.eigen[k] != null && r.vorschlag && r.vorschlag[k] != null).map((r) => r.eigen[k] - r.vorschlag[k]);
        if (!diffs.length) return null;
        const mittel = diffs.reduce((s, v) => s + v, 0) / diffs.length;
        return Math.abs(mittel) < f.step / 2 ? null : { f, mittel, n: diffs.length };
      }).filter(Boolean);
      return { m, n: rs.length, felder };
    });
    return `<p class="leise">Wo deine eingestellten Werte im Schnitt vom Vorschlag abweichen. Weichst du immer in dieselbe Richtung ab, sind die Vorschläge für neue Rollen zu korrigieren.</p>
      <div class="ws-raster">${zeilen.map((z) => `<div class="dr-karte"><h3 class="dr-titel">${esc(z.m)} · ${z.n} Rollen mit eigenen Werten</h3>
        ${z.felder.length ? `<div class="info-liste">${z.felder.map((x) => `<div class="info-zeile"><span>${esc(x.f.name)}<small class="norm">bei ${x.n} Rollen</small></span><strong class="${x.mittel > 0 ? "amber" : "mint"}">${x.mittel > 0 ? "+" : ""}${zahl(x.mittel, x.f.nk || 0)} ${esc(x.f.e)}</strong></div>`).join("")}</div>`
          : `<p class="leise klein">Deine Werte entsprechen den Vorschlägen.</p>`}</div>`).join("")}</div>
      <h3>Je Rolle</h3>
      <div class="info-liste">${rollen.map((r) => {
        const anders = Object.keys(r.eigen).filter((k) => r.vorschlag && r.vorschlag[k] != null && r.eigen[k] !== r.vorschlag[k]);
        return `<button class="info-zeile zeilen-knopf" data-aktion="oeffnen-filament" data-id="${esc(r.id)}"><span>${esc(r.name)}<small class="norm">${esc(r.hersteller)}${r.kalibriert ? " · kalibriert" : ""}</small></span><strong>${anders.length ? `${anders.length} Werte geändert` : "wie Vorschlag"}</strong></button>`;
      }).join("")}</div>`;
  },

  // ---- Gesundheit ----
  _neGesundheitHtml() {
    const n = this._ne, w = (k) => this._drW(k), z = (k) => this._drZ(k);
    const wlan = z("wlan") != null ? z("wlan") : (w("wlan") ? parseInt(w("wlan"), 10) : null);
    const zeile = (name, wert, gut, text) => `<div class="ne-gesund ${gut === false ? "schlecht" : gut ? "gut" : ""}"><span class="punkt">${gut === false ? "!" : gut ? "✓" : "·"}</span><div><strong>${esc(name)}</strong><small class="leise">${esc(text)}</small></div><b>${esc(wert)}</b></div>`;
    const h = n.heiz;
    const mittel = (l) => (l.length ? l.reduce((s, x) => s + x.s, 0) / l.length : null);
    const heizKarte = (titel, l, normal) => {
      if (!l || !l.length) return `<div class="ne-heiz"><strong>${titel}</strong><small class="leise">Keine Aufheizvorgänge im Zeitraum gefunden.</small></div>`;
      const m = mittel(l), alt = mittel(l.slice(0, Math.ceil(l.length / 2))), neu = mittel(l.slice(Math.floor(l.length / 2)));
      const trend = l.length >= 4 && neu > alt * 1.2;
      const maxS = Math.max(...l.map((x) => x.s));
      return `<div class="ne-heiz"><strong>${titel}</strong><span class="ne-heiz-wert ${m > normal * 1.5 ? "amber" : ""}">${zahl(m)} s</span>
        <div class="ne-mini-saeulen">${l.slice(-20).map((x) => `<span title="${new Date(x.am).toLocaleString("de-DE")}: ${zahl(x.s)} s auf ${zahl(x.soll)} °C" style="height:${Math.max(8, (x.s / maxS) * 100)}%"></span>`).join("")}</div>
        <small class="leise">${l.length} Vorgänge · normal etwa ${normal} s${trend ? " · <b class='amber'>wird langsamer</b>" : ""}</small></div>`;
    };
    return `<div class="ws-zwei">
      <div class="dr-karte"><h3 class="dr-titel">Zustand jetzt</h3>
        ${zeile("Verbindung", w("online") === "on" ? "online" : w("online") === "off" ? "offline" : "–", w("online") === "on" ? true : w("online") === "off" ? null : null, "Drucker meldet sich bei Home Assistant")}
        ${zeile("WLAN", wlan != null ? `${wlan} dBm` : "–", wlan == null ? null : wlan > -70, "Besser als −70 dBm ist gut, unter −80 dBm brechen Verbindungen ab")}
        ${zeile("HMS-Meldungen", w("hms") === "on" ? "aktiv" : w("hms") === "off" ? "keine" : "–", w("hms") === "on" ? false : w("hms") === "off" ? true : null, "Fehlercodes des Druckers selbst")}
        ${zeile("Firmware", w("firmware") === "on" ? "Update da" : w("firmware") === "off" ? "aktuell" : "–", w("firmware") === "on" ? false : w("firmware") === "off" ? true : null, "Updates bringen oft bessere Kalibrierung")}
        ${zeile("Betriebsstunden", z("stunden") != null ? `${zahl(z("stunden"))} h` : "–", null, "Grundlage für den Wartungsplan")}
        ${zeile("Wartung fällig", `${this._wsWartung().filter((x) => x.faellig).length}`, this._wsWartung().some((x) => x.faellig) ? false : true, "Siehe Werkstatt › Wartung")}</div>
      <div class="dr-karte"><h3 class="dr-titel">Aufheizzeiten</h3>
        <p class="leise klein">Wird das Aufheizen mit der Zeit langsamer, kann das auf ein schwächelndes Heizelement, einen losen Thermistor oder eine fehlende Silikonsocke hindeuten.</p>
        ${!h ? `<button class="knopf breit" data-aktion="ne-heiz">Letzte 4 Tage auswerten</button>` : h.laedt ? `<div class="mod-laden-klein"><span class="dreher klein"></span> Lese Verlauf aus Home Assistant …</div>`
          : h.fehler ? `<div class="hinweis amber">${esc(h.fehler)}</div><button class="knopf leise breit" data-aktion="ne-heiz">Nochmal versuchen</button>`
          : `${heizKarte("Düse", h.duese, 90)}${heizKarte("Druckbett", h.bett, 120)}<button class="knopf leise breit oben-abstand" data-aktion="ne-heiz">Neu auswerten</button>`}</div></div>`;
  },
  async _neHeizLaden() {
    const n = this._ne;
    n.heiz = { laedt: true };
    this._zeichnen();
    const ids = ["duese", "duese_ziel", "bett", "bett_ziel"].map((k) => this._drId(k));
    if (ids.some((x) => !x)) { n.heiz = { fehler: "Temperatursensoren des Druckers nicht gefunden." }; this._zeichnen(); return; }
    try {
      const start = new Date(Date.now() - 4 * 86400000).toISOString();
      const r = await Promise.race([
        this._hass.callWS({ type: "history/history_during_period", start_time: start, entity_ids: ids, minimal_response: true, no_attributes: true }),
        new Promise((_, nein) => setTimeout(() => nein(new Error("Home Assistant hat nicht rechtzeitig geantwortet.")), 30000)),
      ]);
      const l = (id) => (r && r[id]) || [];
      n.heiz = { duese: aufheizZeiten(l(ids[1]), l(ids[0]), 150), bett: aufheizZeiten(l(ids[3]), l(ids[2]), 40) };
    } catch (e) {
      n.heiz = { fehler: `Verlauf konnte nicht gelesen werden: ${e.message || e}` };
    }
    if (this._ansicht === "nerd") this._zeichnen();
  },

  // ---- Ereignisse ----
  _neKlick(a, el) {
    const n = this._neZustand();
    switch (a) {
      case "ne-tab": n.tab = el.dataset.id; break;
      case "ne-schritt": {
        const i = this.shadowRoot.querySelector('[data-ne="brutto"]');
        if (!i) return;
        i.value = Number(i.value) + Number(el.dataset.d);
        this._neEingabe(i);
        return;
      }
      case "ne-abgleich": this._neAbgleichen(); break;
      case "ne-korr-weg": this._daten.einstellungen.korrektur = {}; this._speichern(); this._toast("Korrekturfaktoren zurückgesetzt."); return;
      case "ne-heiz": this._neHeizLaden(); return;
      default: return;
    }
    this._zeichnen();
  },
  _neEingabe(t) {
    const k = t.dataset && t.dataset.ne;
    if (!k) return false;
    if (k === "brutto") {
      const n = this._ne;
      n.abWert = Number(t.value);
      const r = this._neRolle();
      if (!r) return true;
      const s = this.shadowRoot.getElementById("ne-brutto"); if (s) s.textContent = `${zahl(n.abWert)} g`;
      const seit = this._neGebuchtSeit(r), netto = n.abWert - this._neSpuleG(r), echt = r.rest_g + seit.g - netto;
      const box = this.shadowRoot.getElementById("ne-ergebnis");
      if (box) box.innerHTML = this._neAbgleichErgebnis(r, seit, netto, echt, seit.druck_g > 0 ? (echt - seit.fix_g) / seit.druck_g : null);
    }
    return true;
  },
  _neAenderung(t) {
    const k = t.dataset && t.dataset.ne;
    if (!k) return false;
    if (k === "rolle") { this._ne.abRolle = t.value; this._ne.abWert = null; this._zeichnen(); }
    return true;
  },
};
