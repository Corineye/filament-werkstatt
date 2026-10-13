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
    const voll = opt.massiv;   // Boden/Deckel: dicht gefüllt
    const abstand = voll ? breite : Math.max(breite, (breite * 2) / (opt.fuellung / 100));
    const winkel = ((opt.nr % 2 ? 45 : -45) * Math.PI) / 180;
    fuellung.push(...fuellLinien(innerste, abstand, winkel));
  }
  return { z, aussen, innen, fuellung };
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
