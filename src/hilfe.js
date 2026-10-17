// ---------------------------------------------------------------------------
// Hilfe: P1S-Zeichnung mit Bereichen, Sovol-Trockner, Fehlerbilder, Kalibrierung
// ---------------------------------------------------------------------------

const HI_TABS = [["drucker", "🖨️ Drucker"], ["trockner", "♨️ Trockner"], ["fehler", "🩺 Fehlerbilder"], ["kalibrierung", "🎯 Kalibrierung"], ["kunststoffe", "🧪 Kunststoffe"], ["codes", "⚠️ Fehlercodes"]];
// Welche Rollenwerte zu welchem Bereich der Zeichnung gehören
const HI_FELDER = { duese: ["duese_erste", "duese", "flow"], extruder: ["k", "max_vol"], luefter: ["luefter_min", "luefter_max"],
  riemen: ["v_aussen", "v_innen", "v_fuellung"], bett: ["bett"], spule: ["tr_temp", "tr_dauer"] };

const HilfeAnsicht = {
  // Neue Hilfe-Reiter (v0.12): Konstruktions-Tipps, Slicer-Lexikon, Druckplatten
  _hiKonstruktionHtml() { return `<div class="karte"><p class="leise">Kommt gleich.</p></div>`; },
  _hiLexikonHtml() { return `<div class="karte"><p class="leise">Kommt gleich.</p></div>`; },
  _hiPlattenHtml() { return `<div class="karte"><p class="leise">Kommt gleich.</p></div>`; },

  _hiZustand() {
    if (!this._hi) this._hi = { tab: "drucker", p1s: "duese", tr: "material", fehler: null, kal: "temp", rolle: null, kalWert: null };
    return this._hi;
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
    return true;
  },
  _hiAenderung(t) {
    const k = t.dataset && t.dataset.hi;
    if (!k) return false;
    if (k === "rolle") { this._hi.rolle = t.value; this._hi.kalWert = null; this._zeichnen(); }
    return true;
  },
};
