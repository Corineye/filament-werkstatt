// ---------------------------------------------------------------------------
// 3D-Modelle: STL lesen, Maße/Volumen, Schnitte, Löcher, Schichten, G-Code
// (alles ohne fremde Bibliotheken, läuft offline auf dem Pi)
// ---------------------------------------------------------------------------

const BETT_MM = 256;          // Bauraum P1S: 256 × 256 × 256 mm
const STUETZ_WINKEL = 30;     // Überhang ab 30° zur Waagerechten (Bambu-Standard „Threshold angle“)
const FILAMENT_QUERSCHNITT = Math.PI * 0.875 * 0.875;   // mm² bei 1,75 mm

// ---- STL ------------------------------------------------------------------
// Ergebnis: Float32Array mit 9 Zahlen je Dreieck (x1 y1 z1 x2 y2 z2 x3 y3 z3)
function stlLesen(puffer) {
  const dv = new DataView(puffer);
  if (puffer.byteLength >= 84) {
    const n = dv.getUint32(80, true);
    if (84 + n * 50 === puffer.byteLength) {
      if (typeof MOD_MAX_DREIECKE !== "undefined" && n > MOD_MAX_DREIECKE) throw new Error(`Das Modell hat ${n.toLocaleString("de-DE")} Dreiecke, das schafft der Browser nicht flüssig. Bitte im Slicer vereinfachen.`);
      const v = new Float32Array(n * 9);
      for (let i = 0; i < n; i++) {
        const o = 84 + i * 50 + 12;
        for (let k = 0; k < 9; k++) v[i * 9 + k] = dv.getFloat32(o + k * 4, true);
      }
      return v;
    }
  }
  const text = new TextDecoder().decode(puffer);
  if (!/^\s*solid/i.test(text) || !/vertex/i.test(text)) throw new Error("Das ist keine gültige STL-Datei.");
  const zahlen = [];
  const re = /vertex\s+([-+\d.eE]+)\s+([-+\d.eE]+)\s+([-+\d.eE]+)/g;
  let m;
  while ((m = re.exec(text))) zahlen.push(+m[1], +m[2], +m[3]);
  if (!zahlen.length || zahlen.length % 9) throw new Error("Die STL-Datei ist unvollständig.");
  return new Float32Array(zahlen);
}

function meshGrenzen(v) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < v.length; i += 3) for (let k = 0; k < 3; k++) {
    if (v[i + k] < min[k]) min[k] = v[i + k];
    if (v[i + k] > max[k]) max[k] = v[i + k];
  }
  return { min, max, groesse: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] };
}

// Modell mittig aufs Bett stellen (Unterkante auf z = 0)
function aufsBett(v) {
  const g = meshGrenzen(v);
  const dx = BETT_MM / 2 - (g.min[0] + g.max[0]) / 2, dy = BETT_MM / 2 - (g.min[1] + g.max[1]) / 2, dz = -g.min[2];
  for (let i = 0; i < v.length; i += 3) { v[i] += dx; v[i + 1] += dy; v[i + 2] += dz; }
  return v;
}

// Um 90° drehen (achse 0/1/2, richtung ±1)
function drehen90(v, achse, richtung) {
  const [a, b] = achse === 0 ? [1, 2] : achse === 1 ? [2, 0] : [0, 1];
  for (let i = 0; i < v.length; i += 3) {
    const p = v[i + a], q = v[i + b];
    v[i + a] = -q * richtung; v[i + b] = p * richtung;
  }
  return aufsBett(v);
}

function meshKennwerte(v) {
  let vol = 0, flaeche = 0;
  for (let i = 0; i < v.length; i += 9) {
    const ax = v[i], ay = v[i + 1], az = v[i + 2], bx = v[i + 3], by = v[i + 4], bz = v[i + 5], cx = v[i + 6], cy = v[i + 7], cz = v[i + 8];
    vol += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
    const ux = bx - ax, uy = by - ay, uz = bz - az, wx = cx - ax, wy = cy - ay, wz = cz - az;
    flaeche += Math.hypot(uy * wz - uz * wy, uz * wx - ux * wz, ux * wy - uy * wx) / 2;
  }
  return { volumen: Math.abs(vol), flaeche, dreiecke: v.length / 9 };
}

// Gewicht schätzen: Hülle (Wände) voll, Inneres mit Füllgrad
function gewichtSchaetzen(kenn, dichte, { duese = 0.4, waende = 2, fuellung = 15 } = {}) {
  const linie = duese * 1.05;
  const huelle = Math.min(kenn.volumen, kenn.flaeche * waende * linie * 0.9);
  const mm3 = huelle + (kenn.volumen - huelle) * (fuellung / 100);
  return { gramm: (mm3 / 1000) * dichte, mm3, meter: mm3 / FILAMENT_QUERSCHNITT / 1000 };
}

// Flächen, die Stützen brauchen (Normale zeigt steiler als STUETZ_WINKEL nach unten, nicht auf dem Bett)
function ueberhaenge(v) {
  const grenze = -Math.cos((STUETZ_WINKEL * Math.PI) / 180);
  const markiert = new Uint8Array(v.length / 9);
  let flaeche = 0;
  for (let t = 0, i = 0; i < v.length; i += 9, t++) {
    const ux = v[i + 3] - v[i], uy = v[i + 4] - v[i + 1], uz = v[i + 5] - v[i + 2];
    const wx = v[i + 6] - v[i], wy = v[i + 7] - v[i + 1], wz = v[i + 8] - v[i + 2];
    const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    const l = Math.hypot(nx, ny, nz) || 1;
    const zMin = Math.min(v[i + 2], v[i + 5], v[i + 8]);
    if (nz / l < grenze && zMin > 0.3) { markiert[t] = 1; flaeche += l / 2; }
  }
  return { markiert, flaeche };
}

// ---- Schnitte ---------------------------------------------------------------
// Dreiecke nach Höhe sortiert vorbereiten, damit viele Schnitte schnell gehen
function schnittVorbereiten(v, achse = 2) {
  const [a, b] = achse === 2 ? [0, 1] : achse === 0 ? [1, 2] : [2, 0];
  const n = v.length / 9;
  const lo = new Float32Array(n), hi = new Float32Array(n);
  for (let t = 0; t < n; t++) {
    const i = t * 9;
    lo[t] = Math.min(v[i + achse], v[i + 3 + achse], v[i + 6 + achse]);
    hi[t] = Math.max(v[i + achse], v[i + 3 + achse], v[i + 6 + achse]);
  }
  const reihe = Uint32Array.from({ length: n }, (_, i) => i).sort((x, y) => lo[x] - lo[y]);
  return { v, achse, a, b, lo, hi, reihe };
}

// Schnitt bei Höhe h: geschlossene Linienzüge [[x,y], …] in den Achsen a/b
function schneiden(s, h) {
  const { v, achse, a, b, lo, hi, reihe } = s;
  const strecken = [];
  for (let k = 0; k < reihe.length; k++) {
    const t = reihe[k];
    if (lo[t] > h) break;
    if (hi[t] < h || lo[t] === hi[t]) continue;
    const i = t * 9, p = [];
    for (let e = 0; e < 3; e++) {
      const i1 = i + e * 3, i2 = i + ((e + 1) % 3) * 3;
      const h1 = v[i1 + achse], h2 = v[i2 + achse];
      if ((h1 <= h && h2 > h) || (h2 <= h && h1 > h)) {
        const f = (h - h1) / (h2 - h1);
        p.push([v[i1 + a] + (v[i2 + a] - v[i1 + a]) * f, v[i1 + b] + (v[i2 + b] - v[i1 + b]) * f]);
      }
    }
    if (p.length === 2) strecken.push(p);
  }
  return streckenVerbinden(strecken);
}

function streckenVerbinden(strecken) {
  const schl = (p) => `${Math.round(p[0] * 1000)},${Math.round(p[1] * 1000)}`;
  const nach = new Map();
  strecken.forEach((st, i) => {
    for (const e of [0, 1]) {
      const k = schl(st[e]);
      if (!nach.has(k)) nach.set(k, []);
      nach.get(k).push(i);
    }
  });
  const benutzt = new Uint8Array(strecken.length);
  const zuege = [];
  for (let i = 0; i < strecken.length; i++) {
    if (benutzt[i]) continue;
    benutzt[i] = 1;
    const zug = [strecken[i][0], strecken[i][1]];
    const start = schl(zug[0]);
    let ende = zug[1];
    for (let schritte = 0; schritte < strecken.length; schritte++) {
      const k = schl(ende);
      if (k === start) break;
      const kand = (nach.get(k) || []).find((j) => !benutzt[j]);
      if (kand == null) break;
      benutzt[kand] = 1;
      const st = strecken[kand];
      ende = schl(st[0]) === k ? st[1] : st[0];
      zug.push(ende);
    }
    if (zug.length >= 4) { zug.pop(); zuege.push(zug); }
  }
  return zuege;
}

const flaecheZug = (z) => { let f = 0; for (let i = 0, j = z.length - 1; i < z.length; j = i++) f += (z[j][0] - z[i][0]) * (z[j][1] + z[i][1]); return f / 2; };
function punktInZug(p, z) {
  let drin = false;
  for (let i = 0, j = z.length - 1; i < z.length; j = i++) {
    if ((z[i][1] > p[1]) !== (z[j][1] > p[1]) && p[0] < ((z[j][0] - z[i][0]) * (p[1] - z[i][1])) / (z[j][1] - z[i][1]) + z[i][0]) drin = !drin;
  }
  return drin;
}

// Verschachtelung bestimmen: gerade Tiefe = Außenkontur, ungerade = Loch
function zuegeOrdnen(zuege) {
  return zuege.map((z, i) => {
    let tiefe = 0;
    for (let j = 0; j < zuege.length; j++) if (j !== i && punktInZug(z[0], zuege[j])) tiefe++;
    // Außen gegen den Uhrzeigersinn, Löcher im Uhrzeigersinn (Material liegt dann immer links)
    const f = flaecheZug(z);
    const loch = tiefe % 2 === 1;
    const zug = (loch ? f > 0 : f < 0) ? z.slice().reverse() : z;
    return { zug, loch, tiefe };
  });
}

// ---- Löcher erkennen ------------------------------------------------------
// Kreisrunde Löcher entlang X, Y und Z finden (Ø, Tiefe, durchgehend oder Sackloch)
function kreisPruefen(z) {
  if (z.length < 8) return null;
  let cx = 0, cy = 0;
  z.forEach((p) => { cx += p[0]; cy += p[1]; });
  cx /= z.length; cy /= z.length;
  const r = z.map((p) => Math.hypot(p[0] - cx, p[1] - cy));
  const rm = r.reduce((s, x) => s + x, 0) / r.length;
  const abw = Math.max(...r.map((x) => Math.abs(x - rm)));
  if (rm < 0.5 || rm > 30 || abw / rm > 0.08) return null;
  // Radius aus der Fläche ist genauer als der Mittelwert der Ecken
  const rf = Math.sqrt(Math.abs(flaecheZug(z)) / Math.PI);
  return { cx, cy, r: (rf + rm) / 2 };
}

function strahlTrifft(v, achse, p, von, richtung, max, toleranz) {
  // Gibt es Material entlang der Achse direkt hinter dem Lochende? (Strahl durch den Lochmittelpunkt)
  const [a, b] = achse === 2 ? [0, 1] : achse === 0 ? [1, 2] : [2, 0];
  for (let i = 0; i < v.length; i += 9) {
    const ax = v[i + a], ay = v[i + b], bx = v[i + 3 + a], by = v[i + 3 + b], cx = v[i + 6 + a], cy = v[i + 6 + b];
    const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
    if (Math.abs(d) < 1e-12) continue;
    const l1 = ((by - cy) * (p[0] - cx) + (cx - bx) * (p[1] - cy)) / d;
    const l2 = ((cy - ay) * (p[0] - cx) + (ax - cx) * (p[1] - cy)) / d;
    const l3 = 1 - l1 - l2;
    if (l1 < 0 || l2 < 0 || l3 < 0) continue;
    const h = l1 * v[i + achse] + l2 * v[i + 3 + achse] + l3 * v[i + 6 + achse];
    const t = (h - von) * richtung;
    if (t > -toleranz && t < max) return true;
  }
  return false;
}

function loecherFinden(v, grenzen) {
  const gefunden = [];
  for (const achse of [2, 0, 1]) {
    const s = schnittVorbereiten(v, achse);
    const lo = grenzen.min[achse], hi = grenzen.max[achse];
    const hoehe = hi - lo;
    if (hoehe < 0.5) continue;
    const schritt = Math.max(0.15, Math.min(0.5, hoehe / 120));
    const spuren = [];
    for (let h = lo + schritt / 2; h < hi; h += schritt) {
      for (const k of zuegeOrdnen(schneiden(s, h))) {
        if (!k.loch) continue;
        const kreis = kreisPruefen(k.zug);
        if (!kreis) continue;
        const spur = spuren.find((x) => x.offen && Math.hypot(x.cx - kreis.cx, x.cy - kreis.cy) < 0.3 && Math.abs(x.r - kreis.r) < 0.15 && h - x.bis < schritt * 1.6);
        if (spur) { spur.bis = h; spur.rs.push(kreis.r); }
        else spuren.push({ cx: kreis.cx, cy: kreis.cy, r: kreis.r, rs: [kreis.r], von: h, bis: h, offen: true });
      }
    }
    for (const sp of spuren) {
      const von = sp.von - schritt / 2, bis = sp.bis + schritt / 2;
      const tiefe = bis - von;
      if (tiefe < 0.6) continue;
      const r = sp.rs.sort((x, y) => x - y)[Math.floor(sp.rs.length / 2)];
      const unten = strahlTrifft(v, achse, [sp.cx, sp.cy], von, -1, schritt * 2, schritt * 0.6);
      const oben = strahlTrifft(v, achse, [sp.cx, sp.cy], bis, 1, schritt * 2, schritt * 0.6);
      if (unten && oben) continue;   // geschlossener Hohlraum, kein Loch
      // Gleiches Loch über eine andere Achse schon gefunden? (nur bei Würfelformen möglich)
      const mitte = [0, 0, 0];
      const [a, b] = achse === 2 ? [0, 1] : achse === 0 ? [1, 2] : [2, 0];
      mitte[a] = sp.cx; mitte[b] = sp.cy; mitte[achse] = (von + bis) / 2;
      if (gefunden.some((g) => Math.hypot(g.mitte[0] - mitte[0], g.mitte[1] - mitte[1], g.mitte[2] - mitte[2]) < r)) continue;
      // Öffnung: die Seite ohne Material dahinter; bei Sacklöchern liegt dort der Eingang
      const durch = !unten && !oben;
      const offenOben = !oben;
      gefunden.push({
        achse, durchmesser: r * 2, tiefe, durch,
        mitte, von, bis, oeffnung: offenOben ? bis : von, richtung: offenOben ? 1 : -1,
      });
    }
  }
  return gefunden.sort((x, y) => y.durchmesser - x.durchmesser).map((l, i) => ({ ...l, nr: i + 1 }));
}

// Passende Teile aus dem Inventar für ein Loch
function teileFuerLoch(loch, inventar) {
  const d = loch.durchmesser, t = loch.tiefe;
  const vorschlaege = [];
  for (const teil of inventar) {
    if (teil.kat === "einsatz" && teil.aussen) {
      // Einschmelzgewinde: Loch etwa 0,1–1,1 mm kleiner als der Außendurchmesser, tief genug
      const unter = teil.aussen - d;
      if (unter >= 0.05 && unter <= 1.15 && (loch.durch || t + 0.2 >= teil.laenge)) {
        vorschlaege.push({ teil, art: "einsatz", text: `Einschmelzen: Loch ${zahl(unter, 1)} mm kleiner als der Einsatz`, guete: Math.abs(unter - 0.6) + (loch.durch ? 0.5 : 0) });  // durchgehend: lieber Schraube
      }
    } else if (teil.kat === "schraube") {
      const g = gewindeD(teil.gewinde);
      const n = NORM[teil.gewinde] || {};
      if (loch.durch && d >= g + 0.05 && d <= g + 0.9) {   // Durchgangsloch nur bei durchgehenden Löchern sinnvoll
        // Durchgehend: Schraube sollte durch das Teil reichen (plus Mutter); Sackloch: nicht länger als das Loch
        const passt = loch.durch ? teil.laenge >= t : teil.laenge <= t + 0.5;
        const ziel = loch.durch ? t + (n.mutter_h || g * 0.8) : t;
        vorschlaege.push({ teil, art: "durchgang", text: `Durchgangsloch für ${teil.gewinde} (Norm ${zahl(n.loch || g + 0.4, 1)} mm)${passt ? "" : loch.durch ? ", Schraube kürzer als das Loch" : ", Schraube länger als das Loch"}`, guete: Math.abs(d - (n.loch || g + 0.4)) + (passt ? 0 : 1) + Math.abs(teil.laenge - ziel) / 200 });
      } else if (d >= g * 0.72 && d <= g * 0.95 && !loch.durch && teil.laenge <= t + 0.5) {
        vorschlaege.push({ teil, art: "selbstschneidend", text: `Kernloch zum direkten Eindrehen (${teil.gewinde})`, guete: 1 + Math.abs(d - g * 0.85) + teil.laenge / 1000 });
      }
    } else if (teil.kat === "magnet" && teil.form === "rund" && teil.durchmesser) {
      const spiel = d - teil.durchmesser;
      if (spiel >= -0.05 && spiel <= 0.45 && !loch.durch && t + 0.15 >= teil.dicke) {
        vorschlaege.push({ teil, art: "magnet", text: `Magnet mit ${zahl(spiel, 2)} mm Spiel`, guete: Math.abs(spiel - 0.15) });
      }
    }
  }
  // Je Art nur die besten Treffer, Schrauben nicht alle Längen einzeln aufzählen
  vorschlaege.sort((x, y) => x.guete - y.guete);
  const schrauben = vorschlaege.filter((x) => x.teil.kat === "schraube").slice(0, 3);
  return [...vorschlaege.filter((x) => x.teil.kat !== "schraube").slice(0, 3), ...schrauben].sort((x, y) => x.guete - y.guete);
}

// ---- Schichten (vereinfachtes Slicen) -------------------------------------
// Je Schicht: Außenwand, innere Wände (Versatz) und Füllung (Linien), zur Ansicht
function zugVersetzen(zug, abstand) {
  const n = zug.length, neu = [];
  for (let i = 0; i < n; i++) {
    const p0 = zug[(i - 1 + n) % n], p1 = zug[i], p2 = zug[(i + 1) % n];
    let ax = p1[0] - p0[0], ay = p1[1] - p0[1], bx = p2[0] - p1[0], by = p2[1] - p1[1];
    const la = Math.hypot(ax, ay) || 1, lb = Math.hypot(bx, by) || 1;
    ax /= la; ay /= la; bx /= lb; by /= lb;
    // Material liegt links: Normale nach links
    let nx = -ay - by, ny = ax + bx;
    const ln = Math.hypot(nx, ny) || 1;
    nx /= ln; ny /= ln;
    const cos = nx * -ay + ny * ax;
    const f = abstand / Math.max(0.35, cos);
    neu.push([p1[0] + nx * f, p1[1] + ny * f]);
  }
  // Außenkontur muss schrumpfen, Loch muss wachsen; kippt die Richtung, ist kein Platz mehr
  const f0 = flaecheZug(zug), f1 = flaecheZug(neu);
  if (f0 > 0 ? !(f1 > 0.2 && f1 < f0) : !(f1 < 0 && -f1 > -f0)) return null;
  return neu;
}

function fuellLinien(konturen, abstand, winkel) {
  const c = Math.cos(winkel), s = Math.sin(winkel);
  const dreh = (p) => [p[0] * c + p[1] * s, -p[0] * s + p[1] * c];
  const zurueck = (p) => [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
  const kanten = [];
  let ymin = Infinity, ymax = -Infinity;
  for (const z of konturen) {
    const r = z.map(dreh);
    for (let i = 0; i < r.length; i++) {
      const p = r[i], q = r[(i + 1) % r.length];
      kanten.push([p, q]);
      ymin = Math.min(ymin, p[1]); ymax = Math.max(ymax, p[1]);
    }
  }
  const linien = [];
  for (let y = Math.ceil(ymin / abstand) * abstand; y < ymax; y += abstand) {
    const xs = [];
    for (const [p, q] of kanten) if ((p[1] > y) !== (q[1] > y)) xs.push(p[0] + ((y - p[1]) * (q[0] - p[0])) / (q[1] - p[1]));
    xs.sort((x, w) => x - w);
    for (let i = 0; i + 1 < xs.length; i += 2) if (xs[i + 1] - xs[i] > 0.2) linien.push([zurueck([xs[i], y]), zurueck([xs[i + 1], y])]);
  }
  return linien;
}

function schichtBerechnen(s, z, opt) {
  const breite = opt.duese * 1.05;
  const konturen = zuegeOrdnen(schneiden(s, z));
  const aussen = [], innen = [], fuellung = [];
  const innerste = [];
  for (const k of konturen) {
    aussen.push(k.zug);
    let letzte = k.zug;
    for (let w = 1; w < opt.waende; w++) {
      const n = zugVersetzen(k.zug, breite * w);
      if (!n) break;
      innen.push(n);
      letzte = n;
    }
    const f = zugVersetzen(k.zug, breite * opt.waende);
    innerste.push(f || letzte);
  }
  if (opt.fuellung > 0 && innerste.length) {
    if (opt.massiv) {   // Boden/Deckel: dicht gefüllt, geradlinig
      const winkel = ((opt.nr % 2 ? 45 : -45) * Math.PI) / 180;
      fuellung.push(...fuellLinien(innerste, breite, winkel));
    } else {
      // Abstand so, dass eine einzelne Linienschar die gewünschte Dichte hätte; jedes Muster rechnet das auf seine Form um
      const s = Math.max(breite, breite / (opt.fuellung / 100));
      fuellung.push(...fuellMuster(opt.muster || "grid", innerste, { s, z, nr: opt.nr || 0, hoehe: opt.hoehe || z }));
    }
  }
  return { z, aussen, innen, fuellung };
}

// ---- Füllmuster wie in Bambu Studio (Prozess › Stärke › „Sparse infill pattern“) ----
// Vereinfachte Nachbildung je Schicht; Muster der Gruppe „3d“ ändern sich mit der Höhe.
const FUELLMUSTER = [
  { id: "grid", name: "Gitter", bambu: "Grid", gruppe: "2d", text: "Zwei Linienrichtungen in jeder Schicht. Stabil, in vielen Bambu-Profilen voreingestellt." },
  { id: "zig-zag", name: "Geradlinig", bambu: "Rectilinear", gruppe: "2d", text: "Eine Richtung je Schicht, abwechselnd um 90° gedreht und am Rand verbunden. Schnell und sparsam." },
  { id: "line", name: "Linie", bambu: "Line", gruppe: "2d", text: "Wie Geradlinig, aber ohne Verbindungen am Rand. Sehr schnell, eher schwach." },
  { id: "alignedrectilinear", name: "Ausgerichtet geradlinig", bambu: "Aligned Rectilinear", gruppe: "2d", text: "Geradlinig, aber alle Schichten liegen in derselben Richtung übereinander." },
  { id: "triangles", name: "Dreiecke", bambu: "Triangles", gruppe: "2d", text: "Drei Richtungen in jeder Schicht ergeben Dreiecke. Steif in der Ebene." },
  { id: "tri-hexagon", name: "Tri-Hexagon", bambu: "Tri-hexagon", gruppe: "2d", text: "Sterne aus Dreiecken und Sechsecken. Steif und gleichmäßig." },
  { id: "honeycomb", name: "Wabe", bambu: "Honeycomb", gruppe: "2d", text: "Sechseckige Waben. Sehr stabil, druckt aber langsamer." },
  { id: "2dlattice", name: "2D-Gitter", bambu: "2D Lattice", gruppe: "2d", text: "Rautengitter aus zwei schrägen Richtungen." },
  { id: "zigzag", name: "Zickzack", bambu: "Zig Zag", gruppe: "2d", text: "Zickzack-Linien, alle in derselben Richtung." },
  { id: "crosszag", name: "Kreuz-Zickzack", bambu: "Cross Zag", gruppe: "2d", text: "Zickzack-Linien, die je Schicht die Richtung wechseln." },
  { id: "cubic", name: "Kubisch", bambu: "Cubic", gruppe: "3d", text: "Drei Richtungen, die mit der Höhe wandern: Würfel auf der Spitze. Stabil in alle Richtungen." },
  { id: "adaptivecubic", name: "Adaptiv kubisch", bambu: "Adaptive Cubic", gruppe: "3d", text: "Kubisch, innen grob und zum Rand hin dichter. Spart Material bei großen Teilen." },
  { id: "supportcubic", name: "Stützend kubisch", bambu: "Support Cubic", gruppe: "3d", text: "Kubisch, aber nur unter den Deckflächen dicht. Spart Material und Zeit." },
  { id: "gyroid", name: "Gyroid", bambu: "Gyroid", gruppe: "3d", text: "Wellige Fläche, die sich mit jeder Schicht verschiebt. In alle Richtungen gleich stark." },
  { id: "3dhoneycomb", name: "3D-Wabe", bambu: "3D Honeycomb", gruppe: "3d", text: "Räumliche Waben aus Oktaederstümpfen: das Muster wechselt mit der Höhe." },
  { id: "crosshatch", name: "Kreuzschraffur", bambu: "Cross Hatch", gruppe: "3d", text: "Schichtblöcke wechseln die Richtung mit weichem Übergang. Stabil und schnell." },
  { id: "lockedzag", name: "Verriegelter Zickzack", bambu: "Locked Zag", gruppe: "3d", text: "Zickzack, das sich von Schicht zu Schicht verzahnt." },
  { id: "lightning", name: "Blitz", bambu: "Lightning", gruppe: "3d", text: "Baumartige Äste nur unter den Deckflächen. Am schnellsten, aber nicht belastbar." },
  { id: "concentric", name: "Konzentrisch", bambu: "Concentric", gruppe: "kurve", text: "Ringe parallel zur Außenwand. Flexibel, gut für TPU und durchscheinende Teile." },
  { id: "hilbertcurve", name: "Hilbert-Kurve", bambu: "Hilbert Curve", gruppe: "kurve", text: "Eine einzige raumfüllende Kurve. Dekorativ, z. B. für sichtbare Flächen." },
  { id: "archimedeanchords", name: "Archimedische Akkorde", bambu: "Archimedean Chords", gruppe: "kurve", text: "Spirale aus kurzen Sehnen von der Mitte nach außen." },
  { id: "octagramspiral", name: "Oktagramm-Spirale", bambu: "Octagram Spiral", gruppe: "kurve", text: "Sternförmige Spirale mit acht Spitzen. Dekorativ." },
];
const FUELLMUSTER_GRUPPEN = { "2d": "Jede Schicht gleich", "3d": "Ändert sich mit der Höhe", kurve: "Kurven und Spiralen" };

// Kanten der Füllfläche in waagerechte Bänder sortieren: schnelles Innen-Prüfen und Zuschneiden
function bereichIndex(konturen) {
  const k = [];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const z of konturen) for (let i = 0; i < z.length; i++) {
    const p = z[i], q = z[(i + 1) % z.length];
    k.push(p[0], p[1], q[0], q[1]);
    x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]);
  }
  const kanten = new Float64Array(k), n = kanten.length / 4;
  const nb = Math.max(1, Math.min(512, Math.ceil(n / 3)));
  const h = (y1 - y0) / nb || 1;
  const baender = Array.from({ length: nb }, () => []);
  for (let e = 0; e < n; e++) {
    const a = kanten[e * 4 + 1], b = kanten[e * 4 + 3];
    const von = Math.max(0, Math.floor((Math.min(a, b) - y0) / h)), bis = Math.min(nb - 1, Math.floor((Math.max(a, b) - y0) / h));
    for (let j = von; j <= bis; j++) baender[j].push(e);
  }
  return { kanten, baender, y0, h, nb, box: [x0, y0, x1, y1], stempel: new Int32Array(n), runde: 0 };
}
function bereichInnen(ix, x, y) {
  const j = Math.floor((y - ix.y0) / ix.h);
  if (j < 0 || j >= ix.nb) return false;
  let drin = false;
  const k = ix.kanten;
  for (const e of ix.baender[j]) {
    const ax = k[e * 4], ay = k[e * 4 + 1], bx = k[e * 4 + 2], by = k[e * 4 + 3];
    if ((ay > y) !== (by > y) && x < ax + ((y - ay) * (bx - ax)) / (by - ay)) drin = !drin;
  }
  return drin;
}
// Strecke a→b auf die Fläche zuschneiden (gerade/ungerade-Regel); ohne = Fläche, die ausgespart wird
function streckeZuschneiden(ix, a, b, aus, ohne) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  if (Math.abs(dx) + Math.abs(dy) < 1e-9) return;
  const ts = [0, 1], k = ix.kanten, r = ++ix.runde;
  const von = Math.max(0, Math.floor((Math.min(a[1], b[1]) - ix.y0) / ix.h)), bis = Math.min(ix.nb - 1, Math.floor((Math.max(a[1], b[1]) - ix.y0) / ix.h));
  for (let j = von; j <= bis; j++) for (const e of ix.baender[j]) {
    if (ix.stempel[e] === r) continue;
    ix.stempel[e] = r;
    const ex = k[e * 4 + 2] - k[e * 4], ey = k[e * 4 + 3] - k[e * 4 + 1];
    const d = dx * ey - dy * ex;
    if (Math.abs(d) < 1e-12) continue;
    const wx = k[e * 4] - a[0], wy = k[e * 4 + 1] - a[1];
    const t = (wx * ey - wy * ex) / d, u = (wx * dy - wy * dx) / d;
    if (t > 0 && t < 1 && u >= 0 && u <= 1) ts.push(t);
  }
  ts.sort((x, y) => x - y);
  for (let i = 0; i + 1 < ts.length; i++) {
    const t0 = ts[i], t1 = ts[i + 1];
    if (t1 - t0 < 1e-6) continue;
    const tm = (t0 + t1) / 2, mx = a[0] + dx * tm, my = a[1] + dy * tm;
    if (!bereichInnen(ix, mx, my) || (ohne && bereichInnen(ohne, mx, my))) continue;
    aus.push([[a[0] + dx * t0, a[1] + dy * t0], [a[0] + dx * t1, a[1] + dy * t1]]);
  }
}
// Unendliche Linienschar (Winkel in Grad, Abstand, Versatz) über die Fläche
function linienSchar(box, grad, abstand, versatz = 0) {
  const w = (grad * Math.PI) / 180, d = [Math.cos(w), Math.sin(w)], n = [-d[1], d[0]];
  const c = [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2], R = Math.hypot(box[2] - box[0], box[3] - box[1]) / 2 + 1;
  const cn = c[0] * n[0] + c[1] * n[1], cd = c[0] * d[0] + c[1] * d[1];
  const v = ((versatz % abstand) + abstand) % abstand;
  const out = [];
  for (let o = Math.ceil((cn - R - v) / abstand) * abstand + v; o <= cn + R; o += abstand) {
    out.push([[n[0] * o + d[0] * (cd - R), n[1] * o + d[1] * (cd - R)], [n[0] * o + d[0] * (cd + R), n[1] * o + d[1] * (cd + R)]]);
  }
  return out;
}
// Zickzack-Linien: Schar in Richtung grad, Zacken mit Periode und Amplitude; versetzt = Nachbarn gespiegelt
function zickzackSchar(box, grad, abstand, periode, amplitude, phase = 0, gespiegelt = false) {
  const w = (grad * Math.PI) / 180, d = [Math.cos(w), Math.sin(w)], n = [-d[1], d[0]];
  const c = [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2], R = Math.hypot(box[2] - box[0], box[3] - box[1]) / 2 + periode;
  const cn = c[0] * n[0] + c[1] * n[1], cd = c[0] * d[0] + c[1] * d[1];
  const out = [], halb = periode / 2;
  for (let o = Math.ceil((cn - R) / abstand) * abstand; o <= cn + R; o += abstand) {
    const vz = gespiegelt && Math.round(o / abstand) % 2 ? -1 : 1;
    let vor = null;
    for (let t = Math.floor((cd - R) / halb) * halb + (phase % halb); t <= cd + R; t += halb) {
      const zacke = (Math.round((t - phase) / halb) % 2 ? 1 : -1) * amplitude * vz;
      const p = [n[0] * (o + zacke) + d[0] * t, n[1] * (o + zacke) + d[1] * t];
      if (vor) out.push([vor, p]);
      vor = p;
    }
  }
  return out;
}

function fuellMuster(id, konturen, { s, z, nr, hoehe }) {
  const ix = bereichIndex(konturen), box = ix.box, aus = [];
  const schneiden = (strecken, ohne) => { for (const [a, b] of strecken) streckeZuschneiden(ix, a, b, aus, ohne); };
  const kubisch = (S, auch) => { [0, 60, 120].forEach((g, k) => schneiden(linienSchar(box, g, S, z * [1, -1, 1][k] * 1.15), auch)); };
  switch (id) {
    case "zig-zag": case "line": case "alignedrectilinear": {
      const g = id === "alignedrectilinear" ? 45 : nr % 2 ? 45 : -45;
      schneiden(linienSchar(box, g, s));
      if (id !== "line") verbinden(aus, ix, s);
      break;
    }
    case "grid": schneiden(linienSchar(box, 45, 2 * s)); schneiden(linienSchar(box, -45, 2 * s)); break;
    case "2dlattice": schneiden(linienSchar(box, 60, 2 * s)); schneiden(linienSchar(box, 120, 2 * s)); break;
    case "triangles": [0, 60, 120].forEach((g) => schneiden(linienSchar(box, g, 3 * s))); break;
    case "tri-hexagon": [0, 60, 120].forEach((g, k) => schneiden(linienSchar(box, g, 3 * s, k === 0 ? 1.5 * s : 0))); break;
    case "cubic": kubisch(3 * s); break;
    case "supportcubic": kubisch(z > hoehe * 0.72 ? 3 * s : 6 * s); break;
    case "adaptivecubic": {
      // grob überall, fein nur in einem Streifen entlang der Wände
      kubisch(6 * s);
      const kern = konturen.map((k) => zugVersetzen(k, 4 * s)).filter(Boolean);
      const ohne = kern.length ? bereichIndex(kern) : null;
      if (ohne) [0, 60, 120].forEach((g, k) => schneiden(linienSchar(box, g, 3 * s, z * [1, -1, 1][k] * 1.15), ohne));
      else kubisch(3 * s);
      break;
    }
    case "honeycomb": {
      const a = 1.155 * s, hx = 1.5 * a, hy = Math.sqrt(3) * a, st = [];
      for (let i = Math.floor(box[0] / hx) - 1; i * hx <= box[2] + hx; i++) {
        for (let j = Math.floor(box[1] / hy) - 1; j * hy <= box[3] + hy; j++) {
          const cx = i * hx, cy = j * hy + (i & 1 ? hy / 2 : 0);
          const ecke = (k) => [cx + a * Math.cos((k * Math.PI) / 3), cy + a * Math.sin((k * Math.PI) / 3)];
          st.push([ecke(0), ecke(1)], [ecke(1), ecke(2)], [ecke(5), ecke(0)]);
        }
      }
      schneiden(st);
      break;
    }
    case "zigzag": schneiden(zickzackSchar(box, 45, s, 2 * s, 0.35 * s)); break;
    case "crosszag": schneiden(zickzackSchar(box, nr % 2 ? 45 : -45, s, 2 * s, 0.35 * s)); break;
    case "lockedzag": schneiden(zickzackSchar(box, nr % 2 ? 45 : -45, s, 2 * s, 0.35 * s, Math.floor(nr / 2) % 2 ? s : 0)); break;
    case "3dhoneycomb": {
      // Schnitt durch Oktaederstümpfe: Zickzack, dessen Ausschlag mit der Höhe zu- und abnimmt, Richtung wechselt je Lage
      const P = 2 * s, lage = Math.floor(z / (P / 2)), t = (z % (P / 2)) / (P / 2);
      const amp = (P / 4) * (lage % 2 ? t : 1 - t);
      schneiden(zickzackSchar(box, lage % 4 < 2 ? 0 : 90, P / 2, P, amp, 0, true));
      break;
    }
    case "crosshatch": {
      const H = Math.max(1.6, 2 * s), block = Math.floor(z / H), t = (z % H) / H;
      const amp = t < 0.35 ? (s / 2) * (1 - t / 0.35) : 0;   // Übergang: Zacken werden flach
      const g = block % 2 ? 90 : 0;
      if (amp > 0.05) schneiden(zickzackSchar(box, g, s, s, amp, 0, true));
      else schneiden(linienSchar(box, g, s));
      break;
    }
    case "gyroid": {
      // Gyroid-Fläche sin x·cos y + sin y·cos z + sin z·cos x = 0 bei Höhe z, Linien mit Marching Squares
      const P = 2.4 * s, k = (2 * Math.PI) / P;
      let zelle = P / 10;
      const bw = box[2] - box[0] + 2, bh = box[3] - box[1] + 2;
      while ((bw / zelle) * (bh / zelle) > 60000) zelle *= 1.25;
      const nx = Math.ceil(bw / zelle) + 1, ny = Math.ceil(bh / zelle) + 1, x0 = box[0] - 1, y0 = box[1] - 1;
      const sz = Math.sin(k * z), cz = Math.cos(k * z);
      const f = new Float32Array(nx * ny);
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const x = k * (x0 + i * zelle), y = k * (y0 + j * zelle);
        f[j * nx + i] = Math.sin(x) * Math.cos(y) + Math.sin(y) * cz + sz * Math.cos(x);
      }
      const st = [];
      const rand = (i1, j1, i2, j2) => {
        const a = f[j1 * nx + i1], b = f[j2 * nx + i2], t = a / (a - b);
        return [x0 + (i1 + (i2 - i1) * t) * zelle, y0 + (j1 + (j2 - j1) * t) * zelle];
      };
      for (let j = 0; j + 1 < ny; j++) for (let i = 0; i + 1 < nx; i++) {
        const p = [];
        const v = [f[j * nx + i], f[j * nx + i + 1], f[(j + 1) * nx + i + 1], f[(j + 1) * nx + i]];
        if ((v[0] > 0) !== (v[1] > 0)) p.push(rand(i, j, i + 1, j));
        if ((v[1] > 0) !== (v[2] > 0)) p.push(rand(i + 1, j, i + 1, j + 1));
        if ((v[2] > 0) !== (v[3] > 0)) p.push(rand(i + 1, j + 1, i, j + 1));
        if ((v[3] > 0) !== (v[0] > 0)) p.push(rand(i, j + 1, i, j));
        if (p.length >= 2) st.push([p[0], p[1]]);
        if (p.length === 4) st.push([p[2], p[3]]);
      }
      schneiden(st);
      break;
    }
    case "concentric": {
      let ringe = konturen.slice();
      // Ringe wandern nach innen (Löcher nach außen); ein Ring, der ganz außerhalb liegt, endet
      for (let n = 0; n < 200 && ringe.length; n++) {
        ringe = ringe.filter((r) => {
          if (n >= 3 && flaecheZug(r) < 0) return false;   // um Löcher nur ein paar Ringe, den Rest machen die äußeren

          const vorher = aus.length;
          for (let i = 0; i < r.length; i++) streckeZuschneiden(ix, r[i], r[(i + 1) % r.length], aus);
          return aus.length > vorher;
        }).map((r) => zugVersetzen(r, s)).filter(Boolean);
      }
      break;
    }
    case "hilbertcurve": {
      const groesse = Math.max(box[2] - box[0], box[3] - box[1]) + 2;
      let ordnung = Math.ceil(Math.log2(groesse / s));
      ordnung = Math.max(1, Math.min(7, ordnung));
      const n = 1 << ordnung, schritt = Math.max(s, groesse / n);
      const ox = Math.floor((box[0] - 1) / schritt) * schritt, oy = Math.floor((box[1] - 1) / schritt) * schritt;
      const punkt = (d) => {
        let x = 0, y = 0, t = d;
        for (let q = 1; q < n; q *= 2) {
          const rx = 1 & (t / 2), ry = 1 & (t ^ rx);
          if (ry === 0) { if (rx === 1) { x = q - 1 - x; y = q - 1 - y; } [x, y] = [y, x]; }
          x += q * rx; y += q * ry; t = Math.floor(t / 4);
        }
        return [ox + (x + 0.5) * schritt, oy + (y + 0.5) * schritt];
      };
      const st = [];
      let vor = punkt(0);
      for (let d = 1; d < n * n; d++) { const p = punkt(d); st.push([vor, p]); vor = p; }
      schneiden(st);
      break;
    }
    case "archimedeanchords": case "octagramspiral": {
      const c = [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2], R = Math.hypot(box[2] - box[0], box[3] - box[1]) / 2 + s;
      const st = [];
      let vor = c.slice(), th = 0;
      while (true) {
        const r = (s * th) / (2 * Math.PI);
        if (r > R) break;
        let p;
        if (id === "archimedeanchords") { th += Math.min(1, Math.max(0.08, (1.6 * s) / Math.max(r, 0.1))); p = [c[0] + r * Math.cos(th), c[1] + r * Math.sin(th)]; }
        else { th += Math.PI / 8; const zacke = Math.round(th / (Math.PI / 8)) % 2 ? 1 : 0.72; p = [c[0] + r * zacke * Math.cos(th), c[1] + r * zacke * Math.sin(th)]; }
        st.push([vor, p]); vor = p;
      }
      schneiden(st);
      break;
    }
    case "lightning": {
      // Bäume, die nach oben hin (zu den Deckflächen) weiter verzweigen
      const L = 5 * s, anteil = 0.25 + 0.75 * Math.min(1, Math.max(0, z / Math.max(hoehe, 0.01))), st = [];
      const hx = L, hy = L * 0.866;
      for (let j = Math.floor(box[1] / hy) - 1; j * hy <= box[3] + hy; j++) {
        for (let i = Math.floor(box[0] / hx) - 1; i * hx <= box[2] + hx; i++) {
          const cx = i * hx + (j & 1 ? hx / 2 : 0), cy = j * hy;
          const zufall = Math.abs(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1;
          const dreh = zufall * Math.PI * 2;
          for (let a = 0; a < 3; a++) {
            const w = dreh + (a * 2 * Math.PI) / 3, len = (L / 2) * anteil;
            const m = [cx + Math.cos(w) * len, cy + Math.sin(w) * len];
            st.push([[cx, cy], m]);
            if (anteil > 0.55) for (const sg of [-0.6, 0.6]) st.push([m, [m[0] + Math.cos(w + sg) * len * 0.45, m[1] + Math.sin(w + sg) * len * 0.45]]);
          }
        }
      }
      schneiden(st);
      break;
    }
    default: schneiden(linienSchar(box, 45, 2 * s)); schneiden(linienSchar(box, -45, 2 * s));
  }
  return aus;
}
// Geradlinig: Nachbarlinien am Rand zu einem Zickzack verbinden, wenn die Verbindung innen liegt
function verbinden(linien, ix, s) {
  const n = linien.length;
  for (let i = 1; i < n; i += 2) { const l = linien[i]; linien[i] = [l[1], l[0]]; }
  for (let i = 0; i + 1 < n; i++) {
    const a = linien[i][1], b = linien[i + 1][0];
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 2.2 * s && bereichInnen(ix, (a[0] + b[0]) / 2 + (b[1] - a[1]) * 0.001, (a[1] + b[1]) / 2)) linien.push([a, b]);
  }
}

// Kleine Vorschau eines Musters als SVG (für die Auswahl)
function musterVorschauSvg(id, z = 6) {
  const q = zuegeOrdnen([[[1, 1], [39, 1], [39, 39], [1, 39]]]).map((k) => k.zug);
  const st = fuellMuster(id, q, { s: 3.2, z, nr: Math.round(z / 0.2), hoehe: 12 });
  const d = st.map(([a, b]) => `M${a[0].toFixed(2)} ${a[1].toFixed(2)}L${b[0].toFixed(2)} ${b[1].toFixed(2)}`).join("");
  return `<svg viewBox="0 0 40 40" class="mod-muster-bild" aria-hidden="true"><rect x="1" y="1" width="38" height="38" rx="3"/><path d="${d}"/></svg>`;
}

// ---- Strahl gegen Dreiecke (Möller–Trumbore): nächster Treffer {t, n} oder null ----
function strahlTreffer(v, o, d) {
  let best = Infinity, n = null;
  for (let i = 0; i < v.length; i += 9) {
    const e1x = v[i + 3] - v[i], e1y = v[i + 4] - v[i + 1], e1z = v[i + 5] - v[i + 2];
    const e2x = v[i + 6] - v[i], e2y = v[i + 7] - v[i + 1], e2z = v[i + 8] - v[i + 2];
    const px = d[1] * e2z - d[2] * e2y, py = d[2] * e2x - d[0] * e2z, pz = d[0] * e2y - d[1] * e2x;
    const det = e1x * px + e1y * py + e1z * pz;
    if (Math.abs(det) < 1e-12) continue;
    const inv = 1 / det, tx = o[0] - v[i], ty = o[1] - v[i + 1], tz = o[2] - v[i + 2];
    const u = (tx * px + ty * py + tz * pz) * inv;
    if (u < 0 || u > 1) continue;
    const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
    const w = (d[0] * qx + d[1] * qy + d[2] * qz) * inv;
    if (w < 0 || u + w > 1) continue;
    const t = (e2x * qx + e2y * qy + e2z * qz) * inv;
    if (t > 0 && t < best) { best = t; n = [e1y * e2z - e1z * e2y, e1z * e2x - e1x * e2z, e1x * e2y - e1y * e2x]; }
  }
  return n ? { t: best, n } : null;
}

// ---- Frei drehen: Winkel in Grad um X, dann Y, dann Z (um die Modellmitte), danach wieder aufs Bett ----
// Drehmatrix (3×3 zeilenweise) R = Rz · Ry · Rx aus Winkeln in Grad
function drehMatrix(grad) {
  const [ax, ay, az] = grad.map((x) => ((Number(x) || 0) * Math.PI) / 180);
  const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay), cz = Math.cos(az), sz = Math.sin(az);
  return [cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx,
    sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx,
    -sy, cy * sx, cy * cx];
}
function drehenGrad(v, grad) {
  const g = meshGrenzen(v), c = [0, 1, 2].map((i) => (g.min[i] + g.max[i]) / 2);
  const R = drehMatrix(grad);
  for (let i = 0; i < v.length; i += 3) {
    const x = v[i] - c[0], y = v[i + 1] - c[1], z = v[i + 2] - c[2];
    v[i] = R[0] * x + R[1] * y + R[2] * z + c[0];
    v[i + 1] = R[3] * x + R[4] * y + R[5] * z + c[1];
    v[i + 2] = R[6] * x + R[7] * y + R[8] * z + c[2];
  }
  return aufsBett(v);
}

// ---- G-Code ------------------------------------------------------------------
const GCODE_ARTEN = {
  "outer wall": "aussen", "inner wall": "innen", "sparse infill": "fuellung", "internal solid infill": "fuellung",
  "top surface": "oben", "bottom surface": "unten", "bridge": "bruecke", "support": "stuetze", "support interface": "stuetze",
  "overhang wall": "aussen", "gap infill": "innen", "skirt": "rand", "brim": "rand", "prime tower": "turm",
  perimeter: "aussen", "external perimeter": "aussen", "solid infill": "fuellung", infill: "fuellung",
};

function gcodeLesen(text) {
  const schichten = [];
  let x = 0, y = 0, z = 0, e = 0, relE = false, relXYZ = false, art = "innen";
  let schicht = null;
  const info = {};
  const neueSchicht = (hz) => { schicht = { z: hz, linien: [] }; schichten.push(schicht); };
  const zeilen = text.split("\n");
  for (let zi = 0; zi < zeilen.length; zi++) {
    const zeile = zeilen[zi];
    if (zeile.charCodeAt(0) === 59) {   // ;
      const k = zeile.slice(1).trim();
      const kl = k.toLowerCase();
      if (kl.startsWith("feature:") || kl.startsWith("type:")) art = GCODE_ARTEN[kl.split(":")[1].trim()] || "innen";
      else if (kl.startsWith("layer_change") || kl.startsWith("change_layer")) schicht = null;
      else if (kl.startsWith("total filament weight")) info.gramm = parseFloat(k.split(":")[1]);
      else if (kl.startsWith("total filament length")) info.mm = parseFloat(k.split(":")[1]);
      else if (kl.startsWith("filament used [g]")) info.gramm = info.gramm || parseFloat(k.split("=")[1]);
      else if (kl.includes("total estimated time")) info.zeit = k.slice(kl.indexOf("total estimated time")).split(/[:=]/)[1].split(";")[0].trim();
      else if (kl.startsWith("model printing time") || kl.startsWith("estimated printing time")) info.zeit = info.zeit || k.split(/[:=]/).slice(1).join(":").split(";")[0].trim();
      else if (kl.startsWith("filament_type") || kl.startsWith("filament type")) info.material = info.material || k.split(/[:=]/)[1].trim();
      else if (kl.startsWith("nozzle_diameter")) info.duese = info.duese || parseFloat(k.split(/[:=]/)[1]);
      else if (kl.startsWith("layer_height") && !info.schicht) info.schicht = parseFloat(k.split(/[:=]/)[1]);
      continue;
    }
    const c = zeile.charCodeAt(0);
    if (c !== 71 && c !== 77) continue;   // G / M
    const befehl = zeile.split(";")[0].trim().split(/\s+/);
    const cmd = befehl[0];
    if (cmd === "M82") { relE = false; continue; }
    if (cmd === "M83") { relE = true; continue; }
    if (cmd === "G90") { relXYZ = false; relE = false; continue; }
    if (cmd === "G91") { relXYZ = true; continue; }
    if (cmd === "G92") { for (const p of befehl) if (p[0] === "E") e = parseFloat(p.slice(1)); continue; }
    if (cmd !== "G0" && cmd !== "G1" && cmd !== "G2" && cmd !== "G3") continue;
    let nx = x, ny = y, nz = z, ne = null;
    for (let i = 1; i < befehl.length; i++) {
      const p = befehl[i], w = parseFloat(p.slice(1));
      if (p[0] === "X") nx = relXYZ ? x + w : w;
      else if (p[0] === "Y") ny = relXYZ ? y + w : w;
      else if (p[0] === "Z") nz = relXYZ ? z + w : w;
      else if (p[0] === "E") ne = w;
    }
    const extrudiert = ne != null && (relE ? ne > 0 : ne > e);
    if (ne != null) e = relE ? e + ne : ne;
    if (extrudiert && (nx !== x || ny !== y)) {
      if (!schicht || Math.abs(schicht.z - nz) > 1e-4) {
        const vorhanden = schichten.length && Math.abs(schichten[schichten.length - 1].z - nz) < 1e-4 ? schichten[schichten.length - 1] : null;
        if (vorhanden) schicht = vorhanden; else neueSchicht(nz);
      }
      schicht.linien.push(x, y, nx, ny, GCODE_ARTEN_NR[art] ?? 1);
    }
    x = nx; y = ny; z = nz;
  }
  return { schichten: schichten.filter((s) => s.linien.length), info };
}
const GCODE_ARTEN_LISTE = ["aussen", "innen", "fuellung", "oben", "unten", "bruecke", "stuetze", "rand", "turm"];
const GCODE_ARTEN_NR = Object.fromEntries(GCODE_ARTEN_LISTE.map((a, i) => [a, i]));
const LINIEN_FARBEN = {
  aussen: [1, 0.55, 0.25], innen: [1, 0.85, 0.35], fuellung: [0.85, 0.3, 0.35], oben: [0.95, 0.35, 0.45], unten: [0.6, 0.5, 1],
  bruecke: [0.45, 0.75, 1], stuetze: [0.3, 0.9, 0.55], rand: [0.6, 0.6, 0.6], turm: [0.5, 0.5, 0.7],
};
const LINIEN_NAMEN = { aussen: "Außenwand", innen: "Innere Wände", fuellung: "Füllung", oben: "Oberfläche", unten: "Boden", bruecke: "Brücke", stuetze: "Stützen", rand: "Rand", turm: "Reinigungsturm" };

// ---- ZIP (für .gcode.3mf aus Bambu Studio) ------------------------------------
async function zipDateien(puffer) {
  const dv = new DataView(puffer);
  let ende = -1;
  for (let i = puffer.byteLength - 22; i >= Math.max(0, puffer.byteLength - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { ende = i; break; }
  if (ende < 0) throw new Error("Die Datei ist kein gültiges 3MF/ZIP.");
  const anzahl = dv.getUint16(ende + 10, true);
  let o = dv.getUint32(ende + 16, true);
  const dateien = [];
  for (let n = 0; n < anzahl; n++) {
    if (dv.getUint32(o, true) !== 0x02014b50) break;
    const methode = dv.getUint16(o + 10, true), groesse = dv.getUint32(o + 20, true);
    const nameLen = dv.getUint16(o + 28, true), extraLen = dv.getUint16(o + 30, true), komLen = dv.getUint16(o + 32, true);
    const lokal = dv.getUint32(o + 42, true);
    const name = new TextDecoder().decode(new Uint8Array(puffer, o + 46, nameLen));
    dateien.push({ name, methode, groesse, lokal });
    o += 46 + nameLen + extraLen + komLen;
  }
  const lesen = async (d) => {
    const nl = dv.getUint16(d.lokal + 26, true), el = dv.getUint16(d.lokal + 28, true);
    const daten = new Uint8Array(puffer, d.lokal + 30 + nl + el, d.groesse);
    if (d.methode === 0) return daten;
    if (d.methode !== 8 || typeof DecompressionStream === "undefined") throw new Error("Dieser Browser kann die Datei nicht entpacken.");
    const strom = new Blob([daten]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(strom).arrayBuffer());
  };
  return { dateien, lesen };
}
