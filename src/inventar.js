// ---------------------------------------------------------------------------
// Inventar-Ansicht. Wird in die Panel-Klasse eingemischt (siehe panel.js).
// Änderungen werden sofort in Home Assistant gespeichert.
// ---------------------------------------------------------------------------

const INV_STATUS = [
  { id: "wenig", name: "Wenig Bestand" },
  { id: "ungezaehlt", name: "Nicht nachgezählt" },
  { id: "ohne", name: "Menge fehlt" },
];
const INV_SORTIERUNG = [
  { id: "kategorie", name: "Kategorie" },
  { id: "groesse", name: "Größe" },
  { id: "menge_auf", name: "Menge: wenig zuerst" },
  { id: "menge_ab", name: "Menge: viel zuerst" },
];

// Maße eines Teils, je nach Form mit passender Bezeichnung
function masseFuer(t) {
  const k = kategorie(t.kat);
  if (t.kat === "magnet") {
    if (t.form === "folie") return [];
    if (t.form === "rund") return [{ k: "durchmesser", ...MASS.durchmesser }, { k: "dicke", ...MASS.dicke }];
    return [{ k: "durchmesser", ...MASS.durchmesser, name: "Länge" }, { k: "breite", ...MASS.breite }, { k: "dicke", ...MASS.dicke }];
  }
  return k.masse.map((m) => ({ k: m, ...MASS[m] }));
}

function wenigBestand(t) { return t.menge != null && t.min != null && t.min > 0 && t.menge <= t.min; }

// Größe zum Sortieren: Gewinde, dann Länge bzw. Durchmesser
function groessenWert(t) {
  return (t.gewinde ? gewindeD(t.gewinde) * 1000 : 0) + (t.aussen || t.durchmesser || t.groesse || 0) * 10 + (t.laenge || t.dicke || 0) / 100;
}

// Teile, die zusammenpassen (gleiches Gewinde: Schraube, Mutter, Scheibe, Einsatz)
function passendeTeile(t, alle) {
  if (!t.gewinde) return [];
  return alle.filter((x) => x !== t && x.gewinde === t.gewinde && x.kat !== t.kat)
    .sort((a, b) => KATEGORIEN.findIndex((k) => k.id === a.kat) - KATEGORIEN.findIndex((k) => k.id === b.kat) || groessenWert(a) - groessenWert(b));
}

// ---- Zeichnungen (schematisch, maßstäblich innerhalb des Teils) ----------
function teilSvg(t, gross = false) {
  const B = gross ? 240 : 120, H = gross ? 120 : 64;
  const linie = "rgba(232,241,236,.85)";
  const mass = (x1, y1, x2, y2, text, tx, ty) => gross
    ? `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--mint)" stroke-width="1" marker-start="url(#pf)" marker-end="url(#pf)"/>
       <text x="${tx}" y="${ty}" fill="var(--mint)" font-size="10" text-anchor="middle">${text}</text>` : "";
  const z = (v) => Number(v).toLocaleString("de-DE", { maximumFractionDigits: 2 });
  let innen = "";
  const m = gewindeD(t.gewinde);
  const norm = NORM[t.gewinde] || NORM.M3;
  if (t.kat === "schraube") {
    const L = t.laenge || 10, k = norm.kopf_h, dk = norm.kopf_d;
    const s = Math.min((B - (gross ? 70 : 30)) / (L + k), (H - 36) / dk);
    const x0 = (B - (L + k) * s) / 2, y = H / 2 - (gross ? 6 : 0);
    let gewinde = "";
    for (let x = x0 + k * s + 3; x < x0 + (k + L) * s - 1; x += Math.max(3, 0.5 * s)) gewinde += `<line x1="${x}" y1="${y - (m * s) / 2}" x2="${x + 2}" y2="${y + (m * s) / 2}" stroke="${linie}" stroke-opacity=".35"/>`;
    innen = `<rect x="${x0}" y="${y - (dk * s) / 2}" width="${k * s}" height="${dk * s}" rx="2" fill="#3a4541" stroke="${linie}"/>
      <rect x="${x0 + k * s}" y="${y - (m * s) / 2}" width="${L * s}" height="${m * s}" fill="#2b3431" stroke="${linie}"/>${gewinde}
      ${mass(x0 + k * s, y + (dk * s) / 2 + 12, x0 + (k + L) * s, y + (dk * s) / 2 + 12, `L ${z(L)} mm`, x0 + (k + L / 2) * s, y + (dk * s) / 2 + 26)}
      ${mass(x0 + (k + L) * s + 10, y - (m * s) / 2, x0 + (k + L) * s + 10, y + (m * s) / 2, t.gewinde, x0 + (k + L) * s + 26, y + 4)}`;
  } else if (t.kat === "mutter" || t.kat === "scheibe") {
    const r = (H - (gross ? 30 : 12)) / 2, cx = B / 2, cy = H / 2;
    const loch = r * (m / (t.kat === "mutter" ? norm.mutter_sw : norm.scheibe_d)) * 1.05;
    if (t.kat === "mutter") {
      const pkt = Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 6 + (i * Math.PI) / 3; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; }).join(" ");
      innen = `<polygon points="${pkt}" fill="#3a4541" stroke="${linie}"/>`;
    } else innen = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#3a4541" stroke="${linie}"/>`;
    innen += `<circle cx="${cx}" cy="${cy}" r="${loch}" fill="var(--grund)" stroke="${linie}"/>`;
    if (gross) innen += `<text x="${cx + r + 36}" y="${cy - 6}" fill="var(--mint)" font-size="10" text-anchor="middle">${t.kat === "mutter" ? `SW ${z(norm.mutter_sw)}` : `Ø ${z(norm.scheibe_d)}`}</text>
      <text x="${cx + r + 36}" y="${cy + 10}" fill="var(--mint)" font-size="10" text-anchor="middle">${t.kat === "mutter" ? `Höhe ${z(norm.mutter_h)}` : `Dicke ${z(norm.scheibe_h)}`}</text>`;
  } else if (t.kat === "einsatz") {
    const L = t.laenge || 5, D = t.aussen || 5;
    const s = Math.min((B - 50) / L, (H - 36) / D) * 0.9;
    const x0 = (B - L * s) / 2, y = H / 2 - (gross ? 6 : 0), h = D * s;
    let raendel = "";
    for (let x = x0 + 2; x < x0 + L * s - h * 0.35 - 1; x += Math.max(4, s * 0.6)) raendel += `<line x1="${x}" y1="${y - h / 2}" x2="${x + h * 0.35}" y2="${y + h / 2}" stroke="#7a5a12" stroke-width="1.2"/>`;
    innen = `<rect x="${x0}" y="${y - h / 2}" width="${L * s}" height="${h}" rx="2" fill="#d6a933" stroke="#f3d27a"/>${raendel}
      <rect x="${x0}" y="${y - (m * s) / 2}" width="${L * s}" height="${m * s}" fill="none" stroke="#5a420c" stroke-dasharray="3 2"/>
      ${mass(x0, y + h / 2 + 12, x0 + L * s, y + h / 2 + 12, `${z(L)} mm`, x0 + (L * s) / 2, y + h / 2 + 26)}
      ${mass(x0 + L * s + 12, y - h / 2, x0 + L * s + 12, y + h / 2, `Ø ${z(D)}`, x0 + L * s + 32, y + 4)}`;
  } else if (t.kat === "feder") {
    const L = t.laenge || 20, D = t.aussen || 5;
    const s = Math.min((B - 50) / L, (H - 36) / D);
    const x0 = (B - L * s) / 2, y = H / 2 - (gross ? 6 : 0), h = D * s;
    const windungen = Math.max(4, Math.min(16, Math.round(L / (D * 0.45))));
    let pfad = `M ${x0} ${y}`;
    for (let i = 0; i < windungen; i++) {
      const xa = x0 + (i / windungen) * L * s, xb = x0 + ((i + 0.5) / windungen) * L * s, xc = x0 + ((i + 1) / windungen) * L * s;
      pfad += ` L ${(xa + xb) / 2} ${y - h / 2} L ${(xb + xc) / 2} ${y + h / 2}`;
    }
    pfad += ` L ${x0 + L * s} ${y}`;
    innen = `<path d="${pfad}" fill="none" stroke="#c9d3cf" stroke-width="${Math.max(1, (t.draht || 0.4) * s * 0.8)}" stroke-linejoin="round"/>
      ${mass(x0, y + h / 2 + 12, x0 + L * s, y + h / 2 + 12, `${z(L)} mm`, x0 + (L * s) / 2, y + h / 2 + 26)}
      ${mass(x0 + L * s + 12, y - h / 2, x0 + L * s + 12, y + h / 2, `Ø ${z(D)}`, x0 + L * s + 32, y + 4)}`;
  } else if (t.kat === "duese") {
    const cx = B / 2, top = gross ? 10 : 6, s = gross ? 1.6 : 0.85;
    innen = `<rect x="${cx - 18 * s}" y="${top}" width="${36 * s}" height="${30 * s}" rx="3" fill="#3a4541" stroke="${linie}"/>
      <path d="M ${cx - 22 * s} ${top + 30 * s} h ${44 * s} l ${-6 * s} ${12 * s} h ${-32 * s} z" fill="#b08d3e" stroke="${linie}"/>
      <path d="M ${cx - 12 * s} ${top + 42 * s} h ${24 * s} l ${-9 * s} ${14 * s} h ${-6 * s} z" fill="#d6a933" stroke="${linie}"/>
      <text x="${cx}" y="${top + 20 * s}" fill="var(--mint)" font-size="${gross ? 16 : 10}" font-weight="700" text-anchor="middle">${z(t.groesse)}</text>`;
  } else if (t.kat === "magnet") {
    const cx = B / 2, cy = H / 2;
    if (t.form === "folie") {
      innen = `<rect x="${cx - 26}" y="${cy - 20}" width="52" height="40" rx="2" fill="#3a4541" stroke="${linie}"/><text x="${cx}" y="${cy + 4}" fill="var(--leise)" font-size="10" text-anchor="middle">A4</text>`;
    } else if (t.form === "rund") {
      const r = Math.min((H - (gross ? 30 : 12)) / 2, 6 + (t.durchmesser || 5) * 2.2);
      innen = `<path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z" fill="#c0392b"/><path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy} Z" fill="#2c6fbf"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${linie}"/>
        ${gross ? `<text x="${cx}" y="${cy - r / 3}" fill="#fff" font-size="11" text-anchor="middle">N</text><text x="${cx}" y="${cy + r / 2}" fill="#fff" font-size="11" text-anchor="middle">S</text>
        <text x="${cx + r + 40}" y="${cy - 6}" fill="var(--mint)" font-size="10" text-anchor="middle">Ø ${z(t.durchmesser)}</text>
        <text x="${cx + r + 40}" y="${cy + 10}" fill="var(--mint)" font-size="10" text-anchor="middle">Dicke ${z(t.dicke)}</text>` : ""}`;
    } else {
      const s = Math.min((B - 80) / (t.breite || 5), (H - 30) / (t.durchmesser || 4));
      const w = (t.breite || 5) * s, h = (t.durchmesser || 4) * s;
      innen = `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w / 2}" height="${h}" fill="#c0392b"/><rect x="${cx}" y="${cy - h / 2}" width="${w / 2}" height="${h}" fill="#2c6fbf"/>
        <rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="none" stroke="${linie}"/>`;
    }
  }
  return `<svg viewBox="0 0 ${B} ${H}" class="teil-svg${gross ? " gross" : ""}" aria-hidden="true">
    <defs><marker id="pf" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L6 3 L0 6 z" fill="var(--mint)"/></marker></defs>
    ${innen}</svg>`;
}

const InventarAnsicht = {
  _inv() { return this._daten.inventar; },
  _teil(id = this._invOffen) { return this._modus === "inv-neu" ? this._invNeu : this._inv().find((t) => t.id === id); },

  _invGefiltert() {
    const f = this._invF;
    const worte = suchWorte(this._invSuche || "");
    const liste = this._inv().filter((t) => {
      if (f.kat && t.kat !== f.kat) return false;
      if (f.gewinde && t.gewinde !== f.gewinde) return false;
      if (f.status === "wenig" && !wenigBestand(t)) return false;
      if (f.status === "ungezaehlt" && (t.gezaehlt || t.menge == null)) return false;
      if (f.status === "ohne" && t.menge != null) return false;
      return passtZurSuche(t, worte);
    });
    const katI = (t) => KATEGORIEN.findIndex((k) => k.id === t.kat);
    const s = {
      kategorie: (a, b) => katI(a) - katI(b) || groessenWert(a) - groessenWert(b),
      groesse: (a, b) => groessenWert(a) - groessenWert(b) || katI(a) - katI(b),
      menge_auf: (a, b) => (a.menge ?? 1e9) - (b.menge ?? 1e9),
      menge_ab: (a, b) => (b.menge ?? -1) - (a.menge ?? -1),
    };
    return liste.sort(s[this._invSort] || s.kategorie);
  },

  _invHtml() {
    const inv = this._inv();
    const f = this._invF;
    const stueck = inv.reduce((s, t) => s + (t.menge || 0), 0);
    const wenig = inv.filter(wenigBestand).length;
    const opt = (w, t, an) => `<option value="${esc(w)}" ${an === w ? "selected" : ""}>${esc(t)}</option>`;
    const anzahl = Object.values(f).filter(Boolean).length;
    const aktiv = anzahl || this._invSuche;
    const kats = KATEGORIEN.map((k) => {
      const teile = inv.filter((t) => t.kat === k.id);
      return `<button class="kat ${f.kat === k.id ? "an" : ""}" data-aktion="inv-kat" data-id="${k.id}">
        <span class="kat-icon">${k.icon}</span><strong>${k.name}</strong>
        <small>${teile.length} Sorten · ${zahl(teile.reduce((s, t) => s + (t.menge || 0), 0))} Stück</small></button>`;
    }).join("");
    const filter = `
      ${this._invAuswahl("Kategorie", "kat", "Alle Kategorien", KATEGORIEN.map((k) => opt(k.id, k.name, f.kat)).join(""))}
      ${this._invAuswahl("Gewinde", "gewinde", "Alle Gewinde", GEWINDE.filter((g) => inv.some((t) => t.gewinde === g)).map((g) => opt(g, g, f.gewinde)).join(""))}
      ${this._invAuswahl("Status", "status", "Jeder Status", INV_STATUS.map((s) => opt(s.id, s.name, f.status)).join(""))}`;
    return `
      <section class="stats inv-stats">
        <div class="stat"><strong>${inv.length}</strong><span>Sorten</span></div>
        <div class="stat"><strong>${zahl(stueck)}</strong><span>Teile gesamt</span></div>
        ${this._mobil ? "" : `<div class="stat ${wenig ? "rot" : ""}"><strong>${wenig}</strong><span>wenig Bestand</span></div>
        <div class="stat amber"><strong>${inv.filter((t) => t.menge == null).length}</strong><span>Menge fehlt</span></div>`}
      </section>
      <section class="kats">${kats}</section>
      <section class="werkzeug">
        <button class="chip alle ${aktiv ? "" : "an"}" data-aktion="inv-alle">Alle</button>
        ${this._mobil ? `<button class="auswahl filter-knopf ${anzahl ? "an" : ""}" data-aktion="filter-auf"><span>Filter</span><strong>${anzahl ? `${anzahl} aktiv` : "Keiner"}</strong></button>` : ""}
        ${!this._mobil || this._filterAuf ? `<div class="unterfilter">${filter}</div>` : ""}
        <label class="auswahl sort"><span>Sortieren</span>
          <select id="inv-sortierung">${INV_SORTIERUNG.map((s) => opt(s.id, s.name, this._invSort)).join("")}</select></label>
        <input id="inv-suche" class="suche" type="search" placeholder="Suchen: z. B. M3x12, Feder 5 mm, Einsatz M4 …" value="${esc(this._invSuche || "")}" autocomplete="off">
      </section>
      <section id="inv-raster">${this._invRasterHtml()}</section>`;
  },

  _invAuswahl(name, k, leer, optionen) {
    return `<label class="auswahl ${this._invF[k] ? "an" : ""}"><span>${name}</span>
      <select data-inv-filter="${k}"><option value="">${leer}</option>${optionen}</select></label>`;
  },

  _invRasterHtml() {
    const liste = this._invGefiltert();
    let html = liste.length
      ? `<div class="raster">${liste.map((t) => this._invKachelHtml(t)).join("")}</div>`
      : `<div class="leer-hinweis">Nichts gefunden.</div>`;
    // Querverweise: passende Teile zu den Treffern, die selbst nicht in der Liste sind
    if (this._invSuche && liste.length) {
      const dabei = new Set(liste.map((t) => t.id));
      const passend = [];
      liste.forEach((t) => passendeTeile(t, this._inv()).forEach((x) => { if (!dabei.has(x.id) && !passend.includes(x)) passend.push(x); }));
      if (passend.length) {
        html += `<h3 class="passend-titel">🔗 Passt dazu</h3><div class="chips">${passend.slice(0, 12).map((x) =>
          `<button class="chip" data-aktion="inv-oeffnen" data-id="${esc(x.id)}">${kategorie(x.kat).icon} ${esc(teilName(x))} · ${x.menge ?? "?"} Stk</button>`).join("")}</div>`;
      }
    }
    return html;
  },

  _invKachelHtml(t) {
    const wenig = wenigBestand(t);
    return `<button class="kachel teil ${wenig ? "wenig" : ""}" data-aktion="inv-oeffnen" data-id="${esc(t.id)}">
      ${wenig ? `<span class="badge-offen rot-badge">wenig</span>` : ""}
      <div class="teil-bild">${teilSvg(t)}</div>
      <div class="kachel-name">${esc(teilName(t))}</div>
      <div class="kachel-sub">${esc(teilUntertitel(t))}</div>
      <div class="kachel-fuss">
        <span class="mat" style="--m:var(--leise)">${esc(kategorie(t.kat).einzahl)}</span>
        <span class="rest ${t.menge == null ? "leise" : wenig ? "rot" : ""}">${t.menge == null ? "Menge fehlt" : `${zahl(t.menge)} Stk${t.gezaehlt ? "" : " *"}`}</span>
      </div>
    </button>`;
  },

  _invSheetHtml() {
    const t = this._teil();
    if (!t) return "";
    const neu = this._modus === "inv-neu";
    const k = kategorie(t.kat);
    const passend = neu ? [] : passendeTeile(t, this._inv());
    const masse = masseFuer(t);
    let html = "";
    if (neu) {
      html += `<h3 class="abschnitt">1 · Was ist es?</h3>
        <div class="chips">${KATEGORIEN.map((x) => `<button class="chip ${t.kat === x.id ? "an" : ""}" data-aktion="inv-neu-kat" data-id="${x.id}">${x.icon} ${x.einzahl}</button>`).join("")}</div>`;
      if (t.kat === "magnet") html += `<div class="chips oben-abstand">${["rund", "quader"].map((f) => `<button class="chip ${t.form === f ? "an" : ""}" data-aktion="inv-neu-form" data-id="${f}">${f === "rund" ? "Scheibe (rund)" : "Quader"}</button>`).join("")}</div>`;
      html += `<h3 class="abschnitt">2 · Maße</h3>`;
    }
    html += `<div class="zeichnung">${teilSvg(t, true)}</div>`;
    if (k.gewinde) {
      html += `<div class="rechner-block"><div class="r-kopf"><span>Gewinde</span><strong>${esc(t.gewinde)}</strong></div>
        <div class="chips">${GEWINDE.map((g) => `<button class="chip ${t.gewinde === g ? "an" : ""}" data-aktion="inv-gewinde" data-id="${g}">${g}</button>`).join("")}</div></div>`;
    }
    if (masse.length) {
      html += `<div class="gruppe auf"><div class="gruppe-inhalt ohne-rand">${masse.map((f) => {
        const auf = neu || this._offeneZeilen.has(`inv-${f.k}`);
        return `<div class="zeile eigen ${auf ? "auf" : ""}" data-zeile="inv-${f.k}">
          <button class="zeile-kopf" data-aktion="zeile" data-k="inv-${f.k}"><span class="z-name">${f.name}</span>
            <span class="z-wert"><span class="wert">${zahl(t[f.k], f.nk ?? 0)} ${f.e}</span></span></button>
          ${auf ? `<div class="regler-zeile">
            <button class="rund" data-aktion="inv-schritt" data-k="${f.k}" data-d="-1">−</button>
            <input type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${t[f.k] ?? f.min}" data-inv-mass="${f.k}">
            <button class="rund" data-aktion="inv-schritt" data-k="${f.k}" data-d="1">+</button></div>` : ""}
        </div>`;
      }).join("")}</div></div>`;
    } else if (t.kat === "mutter" || t.kat === "scheibe") {
      html += `<p class="leise klein">Maße nach Norm (${t.kat === "mutter" ? "DIN 934" : "DIN 125"}), gelten für alle ${esc(t.gewinde)}-${t.kat === "mutter" ? "Muttern" : "Scheiben"}.</p>`;
    }
    if (t.kat === "magnet" && t.form !== "folie") html += `<div class="hinweis klein">💡 Loch im Druck für ${t.form === "rund" ? "Ø" : "Maß"} ${zahl(t.durchmesser, 2)} mm: etwa ${zahl(t.durchmesser + 0.15, 2)} mm einplanen (Richtwert, je nach Drucker 0,1–0,2 mm Zugabe).</div>`;
    if (t.kat === "feder" || neu) {
      html += `<label class="formular-zeile">Fach / Lagerort<input class="text" data-inv-text="fach" value="${esc(t.fach || "")}" placeholder="z. B. R1F3 oder Schublade 2"></label>`;
    }

    // Menge
    html += `${neu ? `<h3 class="abschnitt">3 · Menge</h3>` : ""}
      <div class="rechner-block menge-block">
        <div class="r-kopf"><span>Menge</span><strong id="inv-menge">${t.menge == null ? "–" : `${zahl(t.menge)} Stück`}</strong></div>
        <div class="regler-zeile mengen-knoepfe">
          <button class="rund" data-aktion="inv-menge" data-d="-10">−10</button>
          <button class="rund" data-aktion="inv-menge" data-d="-1">−1</button>
          <button class="rund" data-aktion="inv-menge" data-d="1">+1</button>
          <button class="rund" data-aktion="inv-menge" data-d="10">+10</button>
        </div>
        ${!neu && !t.gezaehlt && t.menge != null ? `<div class="hinweis klein">* Menge laut ${esc(t.quelle || "Lieferumfang")}, noch nicht nachgezählt. <button class="mini mint-rand" data-aktion="inv-gezaehlt">Stimmt, nachgezählt ✓</button></div>` : ""}
        <div class="r-kopf oben-abstand"><span>Warnen ab (Mindestbestand)</span><strong id="inv-min">${t.min ? `${t.min} Stück` : "aus"}</strong></div>
        <input type="range" min="0" max="100" step="1" value="${t.min || 0}" data-inv-min="1">
      </div>`;

    if (passend.length) {
      html += `<h3>🔗 Passt dazu (${esc(t.gewinde)})</h3><div class="chips">${passend.map((x) =>
        `<button class="chip" data-aktion="inv-oeffnen" data-id="${esc(x.id)}">${kategorie(x.kat).icon} ${esc(teilName(x))} · ${x.menge ?? "?"} Stk</button>`).join("")}</div>`;
    }
    if (!neu) {
      const info = [["Material", t.material], ["Kopf", t.kopf], ["Quelle", t.quelle], ["Shop", t.shop], ["Preis", t.preis ? `${zahl(t.preis, 2)} € für ${t.kat === "einsatz" ? 50 : ""} Stück`.replace("für  Stück", "") : null], ["Drucker", t.drucker]]
        .filter(([, v]) => v);
      if (info.length) html += `<h3>Infos</h3><div class="info-liste">${info.map(([n, v]) => `<div class="info-zeile"><span>${n}</span><strong>${esc(v)}</strong></div>`).join("")}</div>`;
      html += `<h3>Notizen</h3><textarea data-inv-text="notiz" rows="3" placeholder="z. B. wofür gebraucht, nachbestellen bei …">${esc(t.notiz || "")}</textarea>
        <button class="knopf rot-knopf breit oben-abstand" data-aktion="inv-loeschen">Teil löschen</button>`;
    }

    return `<div class="schleier" data-aktion="schliessen"></div>
      <section class="sheet" role="dialog" aria-label="${esc(teilName(t))}">
        <div class="griff"></div>
        <header class="sheet-kopf">
          <div class="teil-kopf-bild">${teilSvg(t)}</div>
          <div class="sheet-titel"><h2>${neu ? `Neues Teil: ${esc(teilName(t))}` : esc(teilName(t))}</h2>
            <div class="sub">${esc(teilUntertitel(t))}</div>
            <span class="pille mint">${k.icon} ${k.einzahl}</span></div>
          <button class="icon-knopf" data-aktion="schliessen" aria-label="Schließen">✕</button>
        </header>
        <div class="sheet-inhalt">${html}</div>
        ${neu ? `<footer class="sheet-fuss"><button class="knopf leise" data-aktion="schliessen">Abbrechen</button>
          <button class="knopf" data-aktion="inv-anlegen">Teil anlegen</button></footer>` : ""}
      </section>`;
  },

  _invNeuStarten() {
    this._invNeu = { id: "neu", kat: "schraube", gewinde: "M3", laenge: 10, kopf: "Zylinderkopf Innensechskant", menge: 10, gezaehlt: true, min: null, notiz: "", fach: "" };
    this._modus = "inv-neu";
    this._sheetScroll = 0;
  },

  _invNeuKat(kat) {
    const v = { schraube: { gewinde: "M3", laenge: 10, kopf: "Zylinderkopf Innensechskant" }, mutter: { gewinde: "M3" }, scheibe: { gewinde: "M3" },
      einsatz: { gewinde: "M3", laenge: 5, aussen: 5, material: "Messing" }, feder: { draht: 0.4, aussen: 5, laenge: 20, material: "Edelstahl" },
      duese: { groesse: 0.4, drucker: "Bambu Lab P1S", material: "" }, magnet: { form: "rund", durchmesser: 6, breite: 6, dicke: 2 } }[kat];
    this._invNeu = { id: "neu", kat, menge: this._invNeu.menge, gezaehlt: true, min: null, notiz: "", fach: this._invNeu.fach || "", ...v };
  },

  // Gibt true zurück, wenn der Klick zum Inventar gehörte
  _invKlick(a, el) {
    const t = this._teil();
    const speichernWennAlt = () => { if (this._modus !== "inv-neu") this._speichern(); };
    switch (a) {
      case "inv-kat": this._invF = { ...this._invF, kat: this._invF.kat === el.dataset.id ? "" : el.dataset.id }; break;
      case "inv-alle": this._invF = { kat: "", gewinde: "", status: "" }; this._invSuche = ""; break;
      case "inv-oeffnen":
        this._modus = "inv-detail"; this._invOffen = el.dataset.id; this._offeneZeilen.clear(); this._sheetScroll = 0;
        break;
      case "inv-neu-kat": this._invNeuKat(el.dataset.id); break;
      case "inv-neu-form": this._invNeu.form = el.dataset.id; break;
      case "inv-gewinde": t.gewinde = el.dataset.id; speichernWennAlt(); break;
      case "inv-schritt": {
        const f = masseFuer(t).find((x) => x.k === el.dataset.k);
        const schritt = (f.nk ?? 0) >= 2 ? f.step * 10 : f.step;   // feine Regler, gröbere Knöpfe
        this._invMassSetzen(f, (t[f.k] ?? f.min) + Number(el.dataset.d) * schritt, true);
        return true;
      }
      case "inv-menge": {
        t.menge = Math.max(0, (t.menge || 0) + Number(el.dataset.d));
        const anz = this.shadowRoot.getElementById("inv-menge");
        if (anz) anz.textContent = `${zahl(t.menge)} Stück`;
        speichernWennAlt();
        return true;
      }
      case "inv-gezaehlt": t.gezaehlt = true; speichernWennAlt(); break;
      case "inv-loeschen":
        if (!confirm(`${teilName(t)} wirklich löschen?`)) return true;
        this._daten.inventar = this._inv().filter((x) => x !== t);
        this._modus = null; this._invOffen = null;
        this._speichern();
        this._toast(`${teilName(t)} gelöscht.`);
        return true;
      case "inv-anlegen": {
        const n = { ...this._invNeu, id: `${this._invNeu.kat}-${Date.now().toString(36)}`, angelegt_am: new Date().toISOString() };
        this._inv().push(n);
        this._modus = null; this._invNeu = null;
        this._speichern();
        this._toast(`${teilName(n)} angelegt.`);
        return true;
      }
      default: return false;
    }
    this._zeichnen();
    return true;
  },

  _invMassSetzen(f, v, slider) {
    const t = this._teil();
    v = Math.max(f.min, Math.min(f.max, Math.round(v / f.step) * f.step));
    t[f.k] = Number(v.toFixed((f.nk ?? 0) + 1));
    const zeile = this.shadowRoot.querySelector(`[data-zeile="inv-${f.k}"]`);
    if (zeile) {
      zeile.querySelector(".wert").textContent = `${zahl(t[f.k], f.nk ?? 0)} ${f.e}`;
      if (slider) { const i = zeile.querySelector("input"); if (i) i.value = t[f.k]; }
    }
    const bild = this.shadowRoot.querySelector(".zeichnung");
    if (bild) bild.innerHTML = teilSvg(t, true);
    const titel = this.shadowRoot.querySelector(".sheet-titel h2");
    if (titel) titel.textContent = this._modus === "inv-neu" ? `Neues Teil: ${teilName(t)}` : teilName(t);
    if (this._modus !== "inv-neu") this._speichern();
  },

  _invEingabe(t) {
    if (t.id === "inv-suche") {
      this._invSuche = t.value;
      const r = this.shadowRoot.getElementById("inv-raster");
      if (r) r.innerHTML = this._invRasterHtml();
      return true;
    }
    if (t.dataset.invMass) {
      const f = masseFuer(this._teil()).find((x) => x.k === t.dataset.invMass);
      this._invMassSetzen(f, Number(t.value), false);
      return true;
    }
    if (t.dataset.invMin) {
      const teil = this._teil();
      teil.min = Number(t.value) || null;
      const anz = this.shadowRoot.getElementById("inv-min");
      if (anz) anz.textContent = teil.min ? `${teil.min} Stück` : "aus";
      return true;
    }
    if (t.dataset.invText) { this._teil()[t.dataset.invText] = t.value; return true; }
    return false;
  },

  _invAenderung(t) {
    if (t.dataset.invFilter != null) { this._invF = { ...this._invF, [t.dataset.invFilter]: t.value }; this._zeichnen(); return true; }
    if (t.id === "inv-sortierung") { this._invSort = t.value; this._zeichnen(); return true; }
    if ((t.dataset.invMin || t.dataset.invText) && this._modus !== "inv-neu") { this._speichern(); return true; }
    return false;
  },
};
