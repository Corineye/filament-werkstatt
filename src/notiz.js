
// ============================================================================
// Notizbuch: alle Notizen an einem Ort (Rollen, Fehldrucke, Drucke) plus eigene Einträge und Erinnerungen
// ============================================================================
// Gesammelte Notizen bleiben an ihrem Ursprung gespeichert, Bearbeiten hier ändert das Original:
//   Filament   rolle.notiz
//   Drucke     daten.drucke[uid].kommentar (Fehldruck: zusätzlich die Antworten aus daten.drucke[uid].fehl)
//   Wartung    daten.wartung.notizen[aufgabeId]
// Eigene Einträge:  daten.notizen     = [{ id, titel, text, tags: [], link: { art: "rolle"|"druck"|"modell", id }, am, geaendert }]
// Erinnerungen:     daten.erinnerungen = [{ id, text, faellig: "JJJJ-MM-TT", erledigt, erledigt_am, link, am }]
const NB_QUELLEN = [
  { id: "alle", name: "Alle", icon: "📓" },
  { id: "eigen", name: "Eigene", icon: "✍️" },
  { id: "filament", name: "Filament", icon: "🧵" },
  { id: "fehl", name: "Fehldrucke", icon: "💥" },
  { id: "druck", name: "Drucke", icon: "🖨️" },
  { id: "wartung", name: "Wartung", icon: "🔧" },
  { id: "erinnerung", name: "Erinnerungen", icon: "⏰" },
];

const NotizAnsicht = {
  _nbZustand() {
    if (!this._nb) this._nb = { quelle: "alle", suche: "", edit: null };
    return this._nb;
  },
  // Datum als JJJJ-MM-TT in Ortszeit
  _nbHeute(plusTage = 0) {
    const d = new Date(Date.now() + plusTage * 86400000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  },
  _nbDatum(tag) {
    if (!tag) return "";
    const d = /^\d{4}-\d{2}-\d{2}$/.test(tag) ? new Date(`${tag}T12:00:00`) : new Date(tag);
    return isNaN(d) ? "" : d.toLocaleDateString("de-DE", { day: "numeric", month: "short", year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
  },
  // Offene Erinnerungen, die heute oder früher fällig sind (für die Startseite)
  _nbFaellig() {
    const heute = this._nbHeute();
    return (this._daten.erinnerungen || []).filter((e) => !e.erledigt && e.faellig && e.faellig <= heute).sort((a, b) => a.faellig.localeCompare(b.faellig));
  },

  // Ziel einer Verknüpfung als Knopf-Attribute
  _nbLinkZiel(l) {
    if (!l || !l.art) return null;
    if (l.art === "rolle") {
      const r = this._daten.rollen.find((x) => x.id === l.id);
      return r ? { attr: `data-aktion="oeffnen-filament" data-id="${esc(r.id)}"`, text: r.name, icon: "🧵" } : null;
    }
    if (l.art === "druck") {
      const d = this._buAlle().find((x) => x.uid === l.id);
      const x = this._buExtra(l.id);
      const name = (d && d.name) || x.name || (x.hand && x.hand.name);
      return name || this._drVerlauf ? { attr: `data-aktion="zum-druck" data-uid="${esc(l.id)}"`, text: name || "Druck", icon: "🖨️" } : null;
    }
    if (l.art === "modell") return { attr: `data-aktion="nb-modell" data-id="${esc(l.id)}"`, text: l.id, icon: "🧊" };
    if (l.art === "wartung") return { attr: `data-aktion="such-werkstatt" data-tab="wartung"`, text: "Wartung", icon: "🔧" };
    return null;
  },

  // Alle Notizen aus allen Quellen in einer Form
  _nbAlle() {
    const d = this._daten, l = [];
    for (const n of d.notizen || []) {
      l.push({ key: `eigen:${n.id}`, quelle: "eigen", titel: n.titel || "Ohne Titel", text: n.text || "", tags: n.tags || [], link: n.link, am: n.geaendert || n.am, loeschbar: true });
    }
    for (const e of d.erinnerungen || []) {
      l.push({ key: `erinnerung:${e.id}`, quelle: "erinnerung", titel: e.text, text: "", tags: [], link: e.link, am: e.am, erinnerung: e, loeschbar: true });
    }
    for (const r of d.rollen) {
      if (!(r.notiz || "").trim()) continue;
      l.push({ key: `rolle:${r.id}`, quelle: "filament", titel: r.name, unter: `${r.hersteller} · ${sorteName(r)}`, text: r.notiz, tags: [], link: { art: "rolle", id: r.id }, am: r.gewogen_am || r.angelegt_am, hex: r.hex });
    }
    const verlauf = new Map(this._buAlle().map((x) => [x.uid, x]));
    for (const [uid, x] of Object.entries(d.drucke || {})) {
      const fehl = !!x.fehl || (x.gebucht && x.gebucht.ergebnis === "fehl");
      if (!(x.kommentar || "").trim() && !x.fehl) continue;
      const v = verlauf.get(uid);
      const name = (v && v.name) || x.name || (x.hand && x.hand.name) || "Druck";
      const rolle = x.gebucht && d.rollen.find((r) => r.id === x.gebucht.rolle);
      l.push({ key: `druck:${uid}`, quelle: fehl ? "fehl" : "druck", titel: name, unter: [v && v.zeit, rolle && rolle.name].filter(Boolean).join(" · "),
        text: x.kommentar || "", tags: [], link: { art: "druck", id: uid }, am: (v && v.start) || (x.gebucht && x.gebucht.am) || x.start, fehl: x.fehl });
    }
    const wn = (d.wartung && d.wartung.notizen) || {};
    for (const a of WARTUNG_AUFGABEN) {
      l.push({ key: `wartung:${a.id}`, quelle: "wartung", titel: a.name, unter: `alle ${a.alle_h} h oder ${a.alle_tage} Tage`, text: wn[a.id] || "", tags: [], link: { art: "wartung" },
        am: (((d.wartung && d.wartung.aufgaben) || {})[a.id] || {}).am, leerErlaubt: true });
    }
    return l;
  },
  _nbGefiltert() {
    const z = this._nbZustand();
    let l = this._nbAlle();
    // Leere Wartungsnotizen nur im Wartungs-Filter (zum Anlegen), sonst stören sie
    if (z.quelle !== "wartung") l = l.filter((x) => !x.leerErlaubt || x.text.trim());
    if (z.quelle !== "alle") l = l.filter((x) => x.quelle === z.quelle);
    const q = z.suche.trim().replace(/^#/, "");
    if (q) l = l.filter((x) => suchPunkte(q, `${x.titel} ${x.unter || ""} ${x.text} ${x.tags.join(" ")} ${this._nbFehlText(x.fehl)}`) > 0);
    // Offene Erinnerungen zuerst (nach Fälligkeit), dann Neuestes, erledigte am Ende
    const rang = (x) => (x.erinnerung ? (x.erinnerung.erledigt ? 2 : 0) : 1);
    return l.sort((a, b) => rang(a) - rang(b)
      || (rang(a) === 0 ? (a.erinnerung.faellig || "9").localeCompare(b.erinnerung.faellig || "9") : 0)
      || String(b.am || "").localeCompare(String(a.am || "")));
  },
  _nbFehlText(f) {
    if (!f) return "";
    return [(FEHL_FRAGEN.wann.find((w) => w.id === f.wann) || {}).name, ...(f.ursachen || []).map((id) => (fehlerbild(id) || {}).name)].filter(Boolean).join(" ");
  },
  _nbZaehlen() {
    const l = this._nbAlle().filter((x) => !x.leerErlaubt || x.text.trim());
    const z = { alle: l.length };
    for (const x of l) z[x.quelle] = (z[x.quelle] || 0) + 1;
    z.erinnerung = (this._daten.erinnerungen || []).filter((e) => !e.erledigt).length;
    return z;
  },

  _nbHtml() {
    const z = this._nbZustand();
    const n = this._nbZaehlen();
    const faellig = this._nbFaellig().length;
    return `<div class="nb-seite">
      <div class="nb-kopf">
        <div><h2>📓 Notizbuch</h2><p class="leise">Alle Notizen an einem Ort. Änderungen landen dort, wo die Notiz herkommt.</p></div>
        <div class="nb-knoepfe"><button class="knopf leise" data-aktion="nb-neu" data-art="erinnerung">⏰ Erinnerung</button><button class="knopf" data-aktion="nb-neu" data-art="eigen">＋ Notiz</button></div>
      </div>
      <div class="nb-werkzeug">
        <div class="chips nb-chips" role="tablist">${NB_QUELLEN.map((q) => `<button class="chip ${z.quelle === q.id ? "an" : ""}" data-aktion="nb-quelle" data-id="${q.id}" role="tab" aria-selected="${z.quelle === q.id}">${q.icon} ${q.name}${n[q.id] ? ` <span class="zahl-punkt ${q.id === "erinnerung" && faellig ? "amber-punkt" : ""}">${q.id === "erinnerung" && faellig ? faellig : n[q.id]}</span>` : ""}</button>`).join("")}</div>
        <input class="such-feld" data-nb="suche" type="search" value="${esc(z.suche)}" placeholder="Notizen durchsuchen …" aria-label="Notizen durchsuchen" autocomplete="off">
      </div>
      <div id="nb-liste" class="nb-liste wechsel-rein" data-einmal="nb-${z.quelle}">${this._nbListeHtml()}</div></div>`;
  },
  _nbListeHtml() {
    const z = this._nbZustand();
    const l = this._nbGefiltert();
    const neu = z.edit && z.edit.key.endsWith(":neu") ? this._nbEditorHtml(z.edit) : "";
    if (!l.length && !neu) {
      const q = NB_QUELLEN.find((x) => x.id === z.quelle);
      return `<div class="leer-karte dr-karte nb-leer"><span class="gross-icon">${z.suche ? "🔍" : q.icon}</span><strong>${z.suche ? `Nichts gefunden für „${esc(z.suche)}“` : "Hier ist noch nichts"}</strong>
        <span class="leise">${z.suche ? "Andere Wörter oder einen anderen Filter probieren." : z.quelle === "erinnerung" ? "Erinnerungen an dich selbst, z. B. „Düse prüfen“, erscheinen am Fälligkeitstag auf der Startseite." : "Notizen zu Rollen, Drucken und Wartung tauchen hier automatisch auf."}</span></div>`;
    }
    return neu + l.map((x) => (z.edit && z.edit.key === x.key ? this._nbEditorHtml(z.edit) : this._nbKarteHtml(x))).join("");
  },

  _nbKarteHtml(x) {
    const q = NB_QUELLEN.find((y) => y.id === x.quelle);
    const ziel = this._nbLinkZiel(x.link);
    const k = esc(x.key);
    if (x.erinnerung) {
      const e = x.erinnerung, heute = this._nbHeute();
      const stand = e.erledigt ? ["erledigt", "leise"] : !e.faellig ? ["ohne Datum", "leise"] : e.faellig < heute ? [`überfällig seit ${this._nbDatum(e.faellig)}`, "rot"] : e.faellig === heute ? ["heute", "amber"] : [`fällig ${this._nbDatum(e.faellig)}`, "mint"];
      return `<article class="nb-karte nb-erinnerung ${e.erledigt ? "erledigt" : ""} ${stand[1]}-rand" data-einmal="nb-${k}">
        <button class="nb-haken ${e.erledigt ? "an" : ""}" data-aktion="nb-erledigt" data-key="${k}" aria-label="${e.erledigt ? "Wieder öffnen" : "Erledigt"}">${e.erledigt ? "✓" : ""}</button>
        <div class="nb-inhalt"><strong class="nb-titel">${esc(e.text)}</strong>
          <div class="nb-meta"><span class="pille ${stand[1]}">⏰ ${esc(stand[0])}</span>${ziel ? `<button class="chip nb-link" ${ziel.attr}>${ziel.icon} ${esc(ziel.text)} ›</button>` : ""}</div></div>
        <div class="nb-aktionen"><button class="rund" data-aktion="nb-bearbeiten" data-key="${k}" aria-label="Bearbeiten">✎</button><button class="rund" data-aktion="nb-loeschen" data-key="${k}" aria-label="Löschen">🗑</button></div>
      </article>`;
    }
    const f = x.fehl;
    const antworten = f ? [
      f.wann && ["Wann", (FEHL_FRAGEN.wann.find((w) => w.id === f.wann) || {}).name],
      f.bilder && f.bilder.length && ["Aussehen", f.bilder.map((id) => (fehlerbild(id) || {}).name).filter(Boolean).join(", ")],
      ...FEHL_FRAGEN.extra.filter((q2) => f.extra && f.extra[q2.id]).map((q2) => [q2.frage, f.extra[q2.id] === "?" ? "weiß nicht" : f.extra[q2.id]]),
      f.ursachen && f.ursachen.length && ["Ursachen", f.ursachen.map((id) => (fehlerbild(id) || {}).name).filter(Boolean).join(", ")],
      f.geaendert && f.geaendert.length && ["Geändert", f.geaendert.join(", ")],
    ].filter((y) => y && y[1]) : [];
    return `<article class="nb-karte q-${x.quelle}" data-einmal="nb-${k}">
      <header class="nb-karte-kopf"><span class="nb-quelle">${x.hex ? `<span class="farbtupfer klein-tupfer" style="background:${x.hex === "transparent" ? "transparent" : esc(x.hex)}"></span>` : q.icon} ${q.name}</span>
        ${x.am ? `<small class="leise">${esc(this._nbDatum(x.am))}</small>` : ""}</header>
      <strong class="nb-titel">${esc(x.titel)}</strong>${x.unter ? `<small class="leise nb-unter">${esc(x.unter)}</small>` : ""}
      ${x.text.trim() ? `<p class="nb-text">${esc(x.text)}</p>` : x.leerErlaubt || x.fehl ? `<p class="nb-text leise">${x.fehl ? "Noch kein Kommentar." : "Noch keine Notiz."}</p>` : ""}
      ${antworten.length ? `<dl class="nb-antworten">${antworten.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join("")}</dl>` : ""}
      ${x.tags.length ? `<div class="nb-tags">${x.tags.map((t) => `<button class="nb-tag" data-aktion="nb-tag" data-id="${esc(t)}">#${esc(t)}</button>`).join("")}</div>` : ""}
      <footer class="nb-fuss">${ziel ? `<button class="chip nb-link" ${ziel.attr}>${ziel.icon} ${esc(ziel.text)} ›</button>` : "<span></span>"}
        <span class="nb-aktionen"><button class="rund" data-aktion="nb-bearbeiten" data-key="${k}" aria-label="Bearbeiten">✎</button>${x.loeschbar ? `<button class="rund" data-aktion="nb-loeschen" data-key="${k}" aria-label="Löschen">🗑</button>` : ""}</span></footer>
    </article>`;
  },

  // ---- Bearbeiten (direkt in der Liste) ----
  _nbEditorHtml(e) {
    const art = e.key.split(":")[0];
    const eigen = art === "eigen", erinnerung = art === "erinnerung";
    const titel = { eigen: e.key.endsWith(":neu") ? "Neue Notiz" : "Notiz bearbeiten", erinnerung: e.key.endsWith(":neu") ? "Neue Erinnerung" : "Erinnerung bearbeiten",
      rolle: `Notiz zu ${e.titel}`, druck: `Kommentar zu ${e.titel}`, wartung: `Wartungsnotiz: ${e.titel}` }[art];
    let vorschlaege = "";
    if (erinnerung && e.key.endsWith(":neu")) {
      // Wartungsaufgaben als Vorschlag, mit dem Tag, an dem sie fällig werden
      const auf = (this._daten.wartung && this._daten.wartung.aufgaben) || {};
      const l = this._wsWartung().slice(0, 3).map((w) => {
        const z = auf[w.a.id];
        const tag = z && z.am ? new Date(new Date(z.am).getTime() + w.a.alle_tage * 86400000) : null;
        const iso = !tag || w.faellig ? this._nbHeute() : `${tag.getFullYear()}-${String(tag.getMonth() + 1).padStart(2, "0")}-${String(tag.getDate()).padStart(2, "0")}`;
        return `<button class="chip" data-aktion="nb-vorschlag" data-id="${esc(w.a.name)}" data-tag="${iso}">🔧 ${esc(w.a.name)}</button>`;
      });
      vorschlaege = `<div class="nb-vorschlaege"><small class="leise">Vorschläge aus der Wartung</small><div class="chips">${l.join("")}</div></div>`;
    }
    const rollen = this._daten.rollen.slice().sort((a, b) => a.name.localeCompare(b.name, "de"));
    const drucke = this._buAlle().slice(0, 40);
    const modelle = this._drVerlauf ? this._wsModelle().slice(0, 40) : [];
    const lw = e.link && e.link.art ? `${e.link.art}:${e.link.id || ""}` : "";
    const opt = (v, t) => `<option value="${esc(v)}" ${v === lw ? "selected" : ""}>${esc(t)}</option>`;
    const linkWahl = eigen || erinnerung ? `<label class="auswahl breit-auswahl nb-linkwahl"><span>Verknüpfen mit</span><select data-nb="link">
        <option value="" ${lw ? "" : "selected"}>Nichts verknüpft</option>
        <optgroup label="Rollen">${rollen.map((r) => opt(`rolle:${r.id}`, `${r.name} · ${r.hersteller}`)).join("")}</optgroup>
        ${modelle.length ? `<optgroup label="Modelle">${modelle.map((m) => opt(`modell:${m.name}`, m.name)).join("")}</optgroup>` : ""}
        ${drucke.length ? `<optgroup label="Drucke">${drucke.map((d) => opt(`druck:${d.uid}`, `${d.name}${d.zeit ? ` · ${d.zeit}` : ""}`)).join("")}</optgroup>` : ""}
        ${erinnerung ? `<optgroup label="Werkstatt">${opt("wartung:", "Wartungsplan")}</optgroup>` : ""}
      </select></label>` : "";
    return `<article class="nb-karte nb-edit" data-einmal="nb-edit-${esc(e.key)}">
      <strong class="nb-titel">${esc(titel)}</strong>
      ${eigen ? `<input class="text" data-nb="titel" value="${esc(e.titel)}" placeholder="Titel" maxlength="120">` : ""}
      ${erinnerung ? `<input class="text" data-nb="titel" value="${esc(e.titel)}" placeholder="Woran soll ich dich erinnern?" maxlength="160">${vorschlaege}
        <label class="feld nb-datum"><span>Fällig am</span><input type="date" data-nb="faellig" value="${esc(e.faellig || "")}"></label>
        <div class="chips nb-schnell">${[["Heute", 0], ["Morgen", 1], ["In 1 Woche", 7], ["In 1 Monat", 30]].map(([t, n]) => `<button class="chip ${e.faellig === this._nbHeute(n) ? "an" : ""}" data-aktion="nb-tag-in" data-id="${n}">${t}</button>`).join("")}</div>`
        : `<textarea data-nb="text" rows="${eigen ? 6 : 5}" maxlength="4000" placeholder="${eigen ? "Was willst du festhalten?" : "Notiz …"}">${esc(e.text)}</textarea>`}
      ${eigen ? `<input class="text" data-nb="tags" value="${esc(e.tags)}" placeholder="Schlagworte, mit Komma getrennt (z. B. petg, tipp)">` : ""}
      ${linkWahl}
      ${art === "druck" && e.fehl ? `<small class="leise">Die Antworten aus dem Fehldruck-Fragebogen bleiben erhalten.</small>` : ""}
      <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="nb-abbrechen">Abbrechen</button><button class="knopf" data-aktion="nb-speichern">Speichern</button></div>
    </article>`;
  },

  _nbBearbeiten(key) {
    const x = this._nbAlle().find((y) => y.key === key);
    if (!x) return;
    const e = x.erinnerung;
    this._nbZustand().edit = { key, titel: x.titel, text: x.text, tags: x.tags.join(", "), link: x.link || null, faellig: e ? e.faellig || "" : "", fehl: !!x.fehl };
  },

  _nbSpeichern() {
    const z = this._nbZustand(), e = z.edit;
    if (!e) return;
    const [art, ...rest] = e.key.split(":");
    const id = rest.join(":");
    const d = this._daten, jetzt = new Date().toISOString();
    const text = (e.text || "").trim();
    if (art === "eigen") {
      const tags = [...new Set((e.tags || "").split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean))];
      const titel = (e.titel || "").trim();
      if (!titel && !text) { this._toast("Bitte einen Titel oder Text eingeben."); return; }
      d.notizen = d.notizen || [];
      if (id === "neu") d.notizen.unshift({ id: `n-${Date.now().toString(36)}`, titel, text, tags, link: e.link || null, am: jetzt, geaendert: jetzt });
      else { const n = d.notizen.find((x) => x.id === id); if (n) Object.assign(n, { titel, text, tags, link: e.link || null, geaendert: jetzt }); }
    } else if (art === "erinnerung") {
      const titel = (e.titel || "").trim();
      if (!titel) { this._toast("Woran soll ich dich erinnern?"); return; }
      d.erinnerungen = d.erinnerungen || [];
      if (id === "neu") d.erinnerungen.push({ id: `e-${Date.now().toString(36)}`, text: titel, faellig: e.faellig || "", erledigt: false, link: e.link || null, am: jetzt });
      else { const n = d.erinnerungen.find((x) => x.id === id); if (n) Object.assign(n, { text: titel, faellig: e.faellig || "", link: e.link || null }); }
    } else if (art === "rolle") {
      const r = d.rollen.find((x) => x.id === id);
      if (r) r.notiz = text;
    } else if (art === "druck") {
      d.drucke = d.drucke || {};
      d.drucke[id] = { ...(d.drucke[id] || {}), kommentar: text };
    } else if (art === "wartung") {
      const n = { ...((d.wartung && d.wartung.notizen) || {}) };
      if (text) n[id] = text; else delete n[id];
      d.wartung = { ...d.wartung, notizen: n };
    }
    z.edit = null;
    this._speichern();
    this._toast(art === "erinnerung" ? "Erinnerung gespeichert." : art === "eigen" ? "Notiz gespeichert." : "Gespeichert, auch beim Original.");
  },

  _nbListeNeu() {
    const box = this.shadowRoot.getElementById("nb-liste");
    if (box) box.innerHTML = this._nbListeHtml();
  },
  _nbFokus() {
    setTimeout(() => {
      const i = this.shadowRoot.querySelector('.nb-edit [data-nb="titel"], .nb-edit [data-nb="text"]');
      if (i) { i.focus(); try { i.setSelectionRange(i.value.length, i.value.length); } catch (e) { /* Datumsfeld */ } }
    }, 0);
  },

  _nbKlick(a, el) {
    const z = this._nbZustand();
    switch (a) {
      case "nb-quelle": z.quelle = el.dataset.id; break;
      case "nb-neu": {
        const art = el.dataset.art;
        if (this._ansicht !== "notiz") { if (!this._schliessen()) return; this._ansicht = "notiz"; }
        z.edit = { key: `${art}:neu`, titel: "", text: "", tags: "", link: null, faellig: art === "erinnerung" ? this._nbHeute(1) : "" };
        if (z.quelle !== "alle" && z.quelle !== art) z.quelle = art;
        z.suche = "";
        this._zeichnen(); this._nbFokus();
        return;
      }
      case "nb-bearbeiten": this._nbBearbeiten(el.dataset.key); this._zeichnen(); this._nbFokus(); return;
      case "nb-abbrechen": z.edit = null; break;
      case "nb-speichern": this._nbSpeichern(); return;
      case "nb-loeschen": {
        const [art, id] = el.dataset.key.split(":");
        const liste = art === "eigen" ? this._daten.notizen : this._daten.erinnerungen;
        const i = (liste || []).findIndex((x) => x.id === id);
        if (i < 0) return;
        if (!confirm(art === "eigen" ? "Diese Notiz löschen?" : "Diese Erinnerung löschen?")) return;
        liste.splice(i, 1);
        this._speichern();
        this._toast("Gelöscht.");
        return;
      }
      case "nb-erledigt": {
        const id = el.dataset.key.split(":")[1];
        const e = (this._daten.erinnerungen || []).find((x) => x.id === id);
        if (!e) return;
        e.erledigt = !e.erledigt;
        if (e.erledigt) e.erledigt_am = new Date().toISOString(); else delete e.erledigt_am;
        this._speichern();
        break;
      }
      case "nb-tag": z.suche = el.dataset.id; break;
      case "nb-tag-in": if (z.edit) z.edit.faellig = this._nbHeute(Number(el.dataset.id)); break;
      case "nb-vorschlag": if (z.edit) { z.edit.titel = el.dataset.id; z.edit.faellig = el.dataset.tag; z.edit.link = { art: "wartung" }; } break;
      case "nb-modell": {
        if (!this._schliessen()) return;
        this._ansicht = "werkstatt";
        const w = this._wsZustand();
        w.tab = "bibliothek"; w.suche = el.dataset.id;
        this._wsFotos();
        break;
      }
      default: return;
    }
    this._zeichnen();
  },

  // Tippen: nur den Entwurf merken bzw. die Liste filtern, nicht alles neu zeichnen
  _nbEingabe(t) {
    const k = t.dataset && t.dataset.nb;
    if (!k) return false;
    const z = this._nbZustand();
    if (k === "suche") {
      z.suche = t.value;
      clearTimeout(this._nbSuchTimer);
      this._nbSuchTimer = setTimeout(() => this._nbListeNeu(), 80);
    } else if (z.edit && ["titel", "text", "tags", "faellig"].includes(k)) {
      z.edit[k] = t.value;
      if (k === "faellig") this.shadowRoot.querySelectorAll('[data-aktion="nb-tag-in"]').forEach((c) => c.classList.toggle("an", this._nbHeute(Number(c.dataset.id)) === t.value));
    }
    return true;
  },
  _nbAenderung(t) {
    const k = t.dataset && t.dataset.nb;
    if (!k) return false;
    const z = this._nbZustand();
    if (k === "link" && z.edit) {
      const v = t.value, i = v.indexOf(":");
      z.edit.link = v ? { art: v.slice(0, i), id: v.slice(i + 1) } : null;
      this._zeichnen();
    }
    return true;
  },
};
