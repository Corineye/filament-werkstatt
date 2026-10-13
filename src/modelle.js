// ---------------------------------------------------------------------------
// 3D-Modelle: eigene kleine WebGL-Bühne (drehen, zoomen, verschieben) und die
// Ansicht mit Maßen, Gewicht, Löchern, Schichten und G-Code
// ---------------------------------------------------------------------------

// ---- Matrizen (4×4, spaltenweise wie in WebGL) ----------------------------
const M4 = {
  perspektive(fov, seiten, nah, fern) {
    const f = 1 / Math.tan(fov / 2), nf = 1 / (nah - fern);
    return [f / seiten, 0, 0, 0, 0, f, 0, 0, 0, 0, (fern + nah) * nf, -1, 0, 0, 2 * fern * nah * nf, 0];
  },
  blick(auge, ziel, oben) {
    let zx = auge[0] - ziel[0], zy = auge[1] - ziel[1], zz = auge[2] - ziel[2];
    let l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
    let xx = oben[1] * zz - oben[2] * zy, xy = oben[2] * zx - oben[0] * zz, xz = oben[0] * zy - oben[1] * zx;
    l = Math.hypot(xx, xy, xz) || 1; xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
      -(xx * auge[0] + xy * auge[1] + xz * auge[2]), -(yx * auge[0] + yy * auge[1] + yz * auge[2]), -(zx * auge[0] + zy * auge[1] + zz * auge[2]), 1];
  },
  mal(a, b) {
    const o = new Array(16);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k];
      o[i * 4 + j] = s;
    }
    return o;
  },
  verschieben(x, y, z) { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]; },
  eins() { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; },
  // Drehung (3×3 zeilenweise) um einen Punkt als 4×4
  drehungUm(R, c) {
    const t = [0, 1, 2].map((i) => c[i] - (R[i * 3] * c[0] + R[i * 3 + 1] * c[1] + R[i * 3 + 2] * c[2]));
    return [R[0], R[3], R[6], 0, R[1], R[4], R[7], 0, R[2], R[5], R[8], 0, t[0], t[1], t[2], 1];
  },
};

// ---- Vektoren und Quaternionen für die Kamera -----------------------------
const V3 = {
  plus: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  minus: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mal: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  punkt: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  kreuz: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  // Rodrigues: v um die (normierte) Achse k drehen
  drehen(v, k, w) {
    const c = Math.cos(w), s = Math.sin(w), kv = V3.kreuz(k, v), d = V3.punkt(k, v) * (1 - c);
    return [v[0] * c + kv[0] * s + k[0] * d, v[1] * c + kv[1] * s + k[1] * d, v[2] * c + kv[2] * s + k[2] * d];
  },
};
const QU = {
  // aus Kamera-Basis (Spalten rechts, oben, rück)
  ausBasis(r, u, b) {
    const m00 = r[0], m11 = u[1], m22 = b[2], spur = m00 + m11 + m22;
    let q;
    if (spur > 0) { const s = Math.sqrt(spur + 1) * 2; q = [(u[2] - b[1]) / s, (b[0] - r[2]) / s, (r[1] - u[0]) / s, s / 4]; }
    else if (m00 > m11 && m00 > m22) { const s = Math.sqrt(1 + m00 - m11 - m22) * 2; q = [s / 4, (u[0] + r[1]) / s, (b[0] + r[2]) / s, (u[2] - b[1]) / s]; }
    else if (m11 > m22) { const s = Math.sqrt(1 + m11 - m00 - m22) * 2; q = [(u[0] + r[1]) / s, s / 4, (b[1] + u[2]) / s, (b[0] - r[2]) / s]; }
    else { const s = Math.sqrt(1 + m22 - m00 - m11) * 2; q = [(b[0] + r[2]) / s, (b[1] + u[2]) / s, s / 4, (r[1] - u[0]) / s]; }
    return q;
  },
  zuBasis([x, y, z, w]) {
    return { r: [1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w)], u: [2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w)] };
  },
  slerp(a, b, t) {
    let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    if (d < 0) { b = b.map((x) => -x); d = -d; }
    if (d > 0.9995) { const q = a.map((x, i) => x + (b[i] - x) * t); const l = Math.hypot(...q); return q.map((x) => x / l); }
    const th = Math.acos(d), s = Math.sin(th), fa = Math.sin((1 - t) * th) / s, fb = Math.sin(t * th) / s;
    return a.map((x, i) => x * fa + b[i] * fb);
  },
};

const MESH_VS = `attribute vec3 p; attribute vec3 n; attribute vec3 c;
uniform mat4 mvp; uniform mat4 m; varying vec3 vn; varying vec3 vc; varying float vz;
void main(){ vec4 w = m * vec4(p,1.0); vz = w.z; vn = mat3(m) * n; vc = c; gl_Position = mvp * vec4(p,1.0); }`;
const MESH_FS = `precision mediump float; varying vec3 vn; varying vec3 vc; varying float vz; uniform float alpha; uniform float schnitt;
void main(){ if (vz > schnitt) discard; vec3 n = normalize(vn); if (!gl_FrontFacing) n = -n;
  float l = 0.38 + 0.5 * max(dot(n, normalize(vec3(0.45,-0.6,0.9))), 0.0) + 0.22 * max(dot(n, normalize(vec3(-0.7,0.5,0.3))), 0.0);
  float rand = pow(1.0 - abs(n.z), 3.0) * 0.08;
  gl_FragColor = vec4(vc * l + rand, alpha); }`;
const LINIE_VS = `attribute vec3 p; attribute vec3 c; uniform mat4 mvp; uniform mat4 m; varying vec3 vc; varying float vz;
void main(){ vec4 w = m * vec4(p,1.0); vz = w.z; vc = c; gl_Position = mvp * vec4(p,1.0); }`;
const LINIE_FS = `precision mediump float; varying vec3 vc; varying float vz; uniform float alpha; uniform float hoehe; uniform float dunkel;
void main(){ float f = (vz < hoehe - 0.001) ? dunkel : 1.0; gl_FragColor = vec4(vc * f, alpha); }`;

class Buehne {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.className = "buehne-canvas";
    const gl = this.canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: false });
    this.gl = gl;
    this.ok = !!gl;
    this.objekte = new Map();
    this.ziel = [BETT_MM / 2, BETT_MM / 2, 10];
    this.abstand = 420; this.orbitArt = "eingeschraenkt";
    this._lage(this._richtung(-0.9, 0.65));
    this.zeiger = new Map();
    this.animationen = [];
    if (!gl) return;
    gl.getExtension("OES_element_index_uint");
    this.pMesh = this._programm(MESH_VS, MESH_FS);
    this.pLinie = this._programm(LINIE_VS, LINIE_FS);
    this._ereignisse();
    this._bett();
  }

  _programm(vs, fs) {
    const gl = this.gl;
    const sh = (typ, q) => { const s = gl.createShader(typ); gl.shaderSource(s, q); gl.compileShader(s); return s; };
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    const ort = {};
    ["p", "n", "c"].forEach((a) => (ort[a] = gl.getAttribLocation(p, a)));
    ["mvp", "m", "alpha", "schnitt", "hoehe", "dunkel"].forEach((u) => (ort[u] = gl.getUniformLocation(p, u)));
    return { p, ort };
  }

  _puffer(daten) {
    const gl = this.gl, b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, daten, gl.STATIC_DRAW);
    return b;
  }

  // Dreiecke (9 Zahlen je Dreieck) mit flachen Normalen; farbe: [r,g,b] oder Float32Array je Ecke
  mesh(name, v, farbe, opt = {}) {
    if (!this.ok) return;
    this.weg(name);
    const n = new Float32Array(v.length), c = new Float32Array(v.length);
    for (let i = 0; i < v.length; i += 9) {
      const ux = v[i + 3] - v[i], uy = v[i + 4] - v[i + 1], uz = v[i + 5] - v[i + 2];
      const wx = v[i + 6] - v[i], wy = v[i + 7] - v[i + 1], wz = v[i + 8] - v[i + 2];
      let nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
      const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      for (let k = 0; k < 9; k += 3) { n[i + k] = nx; n[i + k + 1] = ny; n[i + k + 2] = nz; }
    }
    if (farbe instanceof Float32Array) c.set(farbe);
    else for (let i = 0; i < c.length; i += 3) { c[i] = farbe[0]; c[i + 1] = farbe[1]; c[i + 2] = farbe[2]; }
    this.objekte.set(name, { art: "mesh", p: this._puffer(v), n: this._puffer(n), c: this._puffer(c), anzahl: v.length / 3,
      alpha: opt.alpha ?? 1, m: M4.eins(), sichtbar: true, reihe: opt.reihe ?? 1 });
    this.neu();
  }

  // Linien (6 Zahlen je Strecke) mit Farbe je Ecke
  linien(name, v, c, opt = {}) {
    if (!this.ok) return;
    this.weg(name);
    this.objekte.set(name, { art: "linie", p: this._puffer(v), c: this._puffer(c), anzahl: v.length / 3, bis: v.length / 3,
      alpha: opt.alpha ?? 1, m: M4.eins(), sichtbar: true, reihe: opt.reihe ?? 0, hoehe: 1e9, dunkel: opt.dunkel ?? 1 });
    this.neu();
  }

  weg(name) {
    const o = this.objekte.get(name);
    if (!o) return;
    [o.p, o.n, o.c].forEach((b) => b && this.gl.deleteBuffer(b));
    this.objekte.delete(name);
    this.neu();
  }
  setze(name, werte) { const o = this.objekte.get(name); if (o) { Object.assign(o, werte); this.neu(); } }

  _bett() {
    const B = BETT_MM, l = [], c = [];
    const add = (x1, y1, x2, y2, f) => { l.push(x1, y1, 0, x2, y2, 0); c.push(...f, ...f); };
    for (let i = 0; i <= B; i += 10) {
      const f = i % 50 === 0 ? [0.2, 0.3, 0.27] : [0.12, 0.16, 0.15];
      add(i, 0, i, B, f); add(0, i, B, i, f);
    }
    const r = [0.24, 0.9, 0.66];
    add(0, 0, B, 0, r); add(B, 0, B, B, r); add(B, B, 0, B, r); add(0, B, 0, 0, r);
    this.linien("bett-raster", new Float32Array(l), new Float32Array(c), { reihe: -1 });
    const p = new Float32Array([0, 0, -0.05, B, 0, -0.05, B, B, -0.05, 0, 0, -0.05, B, B, -0.05, 0, B, -0.05]);
    this.mesh("bett", p, [0.06, 0.08, 0.075], { reihe: -2 });
  }

  // ---- Kamera ----
  // Lage als Basis: r (rechts), u (oben), Blick f = u × r. Ziel liegt im Abstand vor dem Auge.
  _f() { return V3.kreuz(this.u, this.r); }
  _auge() { return V3.minus(this.ziel, V3.mal(this._f(), this.abstand)); }
  unterBett() { return this._auge()[2] < -0.01; }
  _matrix() {
    const w = this.canvas.width || 1, h = this.canvas.height || 1;
    const p = M4.perspektive(0.7, w / h, Math.max(0.5, this.abstand / 200), this.abstand * 8 + 1000);
    return M4.mal(p, M4.blick(this._auge(), this.ziel, this.u));
  }
  // Basis aus Blickrichtung zum Auge (e zeigt vom Ziel zum Auge); senkrecht: vorne unten im Bild
  _basisAus(e) {
    e = V3.norm(e);
    const f = V3.mal(e, -1);
    if (Math.abs(e[2]) > 0.999) {
      const u = e[2] > 0 ? [0, 1, 0] : [0, -1, 0];
      return { r: V3.norm(V3.kreuz(f, u)), u };
    }
    const r = V3.norm(V3.kreuz(f, [0, 0, 1]));
    return { r, u: V3.kreuz(r, f) };
  }
  _richtung(dreh, neig) { const c = Math.cos(neig); return [c * Math.cos(dreh), c * Math.sin(dreh), Math.sin(neig)]; }
  _lage(e) { const b = this._basisAus(e); this.r = b.r; this.u = b.u; }
  // Neigung über dem Bett in Grad (−90 = von unten, 90 = von oben)
  neigung() { return (Math.asin(Math.max(-1, Math.min(1, -this._f()[2]))) * 180) / Math.PI; }

  ansicht(art, grenzen, animiert = false) {
    let ziel = this.ziel, abstand = this.abstand;
    if (grenzen) {
      const g = grenzen;
      ziel = [(g.min[0] + g.max[0]) / 2, (g.min[1] + g.max[1]) / 2, (g.min[2] + g.max[2]) / 2];
      this.mitte = ziel.slice();
      const r = Math.max(20, Math.hypot(...g.groesse) / 2);
      abstand = Math.min(900, r / Math.sin(0.35) * 1.15);
    }
    let e;
    if (art === "oben") e = [0, 0, 1];
    else if (art === "unten") e = [0, 0, -1];
    else if (art === "vorne") e = this._richtung(-Math.PI / 2, 0.05);
    else if (art === "bett") { ziel = [BETT_MM / 2, BETT_MM / 2, 0]; abstand = 520; e = this._richtung(-1.1, 0.75); }
    else e = this._richtung(-1.05, 0.6);
    this.fliegen(e, ziel, abstand, animiert);
  }

  // Kamera zu einer Blickrichtung (vom Ziel zum Auge) bringen, wahlweise sanft
  fliegen(e, ziel = this.ziel, abstand = this.abstand, animiert = true) {
    const b = this._basisAus(e);
    if (!animiert || !this.r) {
      this.r = b.r; this.u = b.u; this.ziel = ziel.slice(); this.abstand = abstand; this.neu();
      return;
    }
    const q0 = QU.ausBasis(this.r, this.u, V3.mal(this._f(), -1)), q1 = QU.ausBasis(b.r, b.u, V3.norm(e));
    const z0 = this.ziel.slice(), a0 = this.abstand, start = performance.now(), dauer = 520;
    const nr = (this._flugNr = (this._flugNr || 0) + 1);
    this.animieren((t) => {
      if (this._flugNr !== nr) return false;
      const x = Math.min(1, (t - start) / dauer), k = 1 - Math.pow(1 - x, 3);
      const q = QU.zuBasis(QU.slerp(q0, q1, k));
      this.r = V3.norm(q.r); this.u = V3.norm(q.u);
      this.ziel = z0.map((v, i) => v + (ziel[i] - v) * k);
      this.abstand = a0 + (abstand - a0) * k;
      if (x >= 1) { this.r = b.r; this.u = b.u; }
      return x < 1;
    });
  }

  // Weltpunkt → Bildschirm (CSS-Pixel)
  projizieren(p) {
    const m = this._letzte || this._matrix();
    const x = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], y = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13];
    const w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15];
    if (w <= 0) return null;
    const r = this.canvas.getBoundingClientRect();
    return [((x / w + 1) / 2) * r.width, ((1 - y / w) / 2) * r.height];
  }

  // Bildschirmpunkt (CSS-Pixel) → Strahl {von, richtung} in Weltkoordinaten
  strahl(px, py) {
    const r = this.canvas.getBoundingClientRect();
    const f = this._f(), re = this.r, ob = this.u;
    const t = Math.tan(0.35), x = (px / r.width) * 2 - 1, y = 1 - (py / r.height) * 2;
    const seiten = r.width / Math.max(1, r.height);
    return { von: this._auge(), richtung: V3.norm([0, 1, 2].map((i) => f[i] + re[i] * x * t * seiten + ob[i] * y * t)) };
  }

  // ---- Orbit wie in Fusion 360: frei (Trackball) oder eingeschränkt (Drehteller, Z bleibt oben) ----
  // Gedreht wird um den Drehpunkt: die ganze Kamera (Ziel und Lage) wandert um ihn herum.
  orbit(dx, dy, punkt) {
    const p = punkt || this.drehpunkt || this.mitte || this.ziel;
    const k = 0.008;
    const umAchse = (achse, w) => {
      if (!w) return;
      this.r = V3.drehen(this.r, achse, w); this.u = V3.drehen(this.u, achse, w);
      this.ziel = V3.plus(p, V3.drehen(V3.minus(this.ziel, p), achse, w));
    };
    if (this.orbitArt === "frei") {
      umAchse(V3.norm(this.u), -dx * k);
      umAchse(V3.norm(this.r), -dy * k);
    } else {
      umAchse([0, 0, 1], -dx * k);
      // senkrecht nicht überschlagen (auch von unten bis knapp −90°)
      const jetzt = this.neigung(), w = -dy * k, grenze = 89.5;
      const neu = Math.max(-grenze, Math.min(grenze, jetzt - (w * 180) / Math.PI));
      umAchse(V3.norm(this.r), (-(neu - jetzt) * Math.PI) / 180);
    }
    // Basis sauber halten
    const f = V3.norm(this._f());
    this.r = V3.norm(V3.kreuz(f, this.u)); this.u = V3.kreuz(this.r, f);
    this.neu();
  }
  setzeOrbitArt(art) {
    this.orbitArt = art === "frei" ? "frei" : "eingeschraenkt";
    if (this.orbitArt === "eingeschraenkt") {
      // wieder waagerecht ausrichten (Z zeigt im Bild nach oben)
      const f = this._f();
      if (Math.abs(f[2]) < 0.999) { this.r = V3.norm(V3.kreuz(f, [0, 0, 1])); this.u = V3.kreuz(this.r, f); }
      else { this.r = V3.norm([this.r[0], this.r[1], 0]); this.u = V3.kreuz(this.r, f); }
      this.neu();
    }
  }

  // ---- Bedienung: ziehen = Orbit um den Punkt unter dem Zeiger, rechts/Shift/zwei Finger = verschieben, Rad/zwei Finger = zoomen ----
  _ereignisse() {
    const c = this.canvas;
    c.addEventListener("contextmenu", (e) => e.preventDefault());
    c.addEventListener("wheel", (e) => { e.preventDefault(); this.abstand = Math.min(1500, Math.max(8, this.abstand * Math.exp(e.deltaY * 0.0012))); this.neu(); }, { passive: false });
    c.addEventListener("pointerdown", (e) => {
      c.setPointerCapture(e.pointerId);
      const schieben = e.button === 2 || e.button === 1 || e.shiftKey;
      this.zeiger.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, schieben });
      if (this.zeiger.size === 1 && !schieben) {
        // Drehpunkt: Stelle des Modells unter dem Zeiger, sonst die Modellmitte
        const r = c.getBoundingClientRect();
        const s = this.strahl(e.clientX - r.left, e.clientY - r.top);
        const t = this.treffen ? this.treffen(s) : null;
        this.drehpunkt = t != null ? V3.plus(s.von, V3.mal(s.richtung, t)) : (this.mitte || this.ziel).slice();
        this.drehpunktGetroffen = t != null;
        this.drehpunktSichtbar = false;
      } else this.drehpunktSichtbar = false;
    });
    const ende = (e) => {
      const z = this.zeiger.get(e.pointerId);
      // Antippen (kaum bewegt, ein Finger) → für das Markieren von Löchern
      if (z && e.type === "pointerup" && this.zeiger.size === 1 && !this._pinch && Math.hypot(e.clientX - z.x0, e.clientY - z.y0) < 6 && this.antippen) {
        const r = c.getBoundingClientRect();
        this.antippen(this.strahl(e.clientX - r.left, e.clientY - r.top));
      }
      this.zeiger.delete(e.pointerId); this._pinch = null;
      if (!this.zeiger.size) { this.drehpunktSichtbar = false; this.neu(); }
    };
    c.addEventListener("pointerup", ende);
    c.addEventListener("pointercancel", ende);
    c.addEventListener("pointermove", (e) => {
      const z = this.zeiger.get(e.pointerId);
      if (!z) return;
      const dx = e.clientX - z.x, dy = e.clientY - z.y;
      if (this.zeiger.size === 2) {
        const [a, b] = [...this.zeiger.values()];
        z.x = e.clientX; z.y = e.clientY;
        const d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        if (this._pinch) {
          this.abstand = Math.min(1500, Math.max(8, this.abstand * (this._pinch.d / d)));
          this._schieben(mx - this._pinch.mx, my - this._pinch.my);
        }
        this._pinch = { d, mx, my };
        this.drehpunktSichtbar = false;
        this.neu();
        return;
      }
      z.x = e.clientX; z.y = e.clientY;
      if (z.schieben) this._schieben(dx, dy);
      else if (Math.hypot(e.clientX - z.x0, e.clientY - z.y0) >= 3) { this.drehpunktSichtbar = true; this.orbit(dx, dy, this.drehpunkt); }
      this.neu();
    });
  }
  _schieben(dx, dy) {
    const f = (this.abstand * 0.0016) * (800 / Math.max(300, this.canvas.clientHeight));
    this.ziel = V3.plus(this.ziel, V3.plus(V3.mal(this.r, -dx * f), V3.mal(this.u, dy * f)));
  }

  neu() {
    if (this._wartet || !this.ok) return;
    this._wartet = true;
    requestAnimationFrame((t) => { this._wartet = false; this._zeichnen(t); });
  }
  animieren(fn) { this.animationen.push(fn); this.neu(); }

  _zeichnen(zeit) {
    const gl = this.gl, c = this.canvas;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr);
    if (!w || !h) return;
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    this.animationen = this.animationen.filter((fn) => fn(zeit) !== false);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const vp = this._matrix();
    this._letzte = vp;
    // Von unten: Druckplatte durchscheinend, damit das Teil zu sehen bleibt
    const unten = this.unterBett(), bett = this.objekte.get("bett"), raster = this.objekte.get("bett-raster");
    if (bett) bett.alpha = unten ? 0.28 : 1;
    if (raster) raster.alpha = unten ? 0.4 : 1;
    const liste = [...this.objekte.values()].filter((o) => o.sichtbar).sort((a, b) => (a.alpha < 1) - (b.alpha < 1) || a.reihe - b.reihe);
    for (const o of liste) {
      const pr = o.art === "mesh" ? this.pMesh : this.pLinie;
      gl.useProgram(pr.p);
      gl.uniformMatrix4fv(pr.ort.mvp, false, new Float32Array(M4.mal(vp, o.m)));
      gl.uniformMatrix4fv(pr.ort.m, false, new Float32Array(o.m));
      gl.uniform1f(pr.ort.alpha, o.alpha);
      gl.depthMask(o.alpha >= 1);
      const attr = (ort, b) => { if (ort < 0) return; gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.enableVertexAttribArray(ort); gl.vertexAttribPointer(ort, 3, gl.FLOAT, false, 0, 0); };
      attr(pr.ort.p, o.p); attr(pr.ort.c, o.c);
      if (o.art === "mesh") {
        attr(pr.ort.n, o.n);
        gl.uniform1f(pr.ort.schnitt, o.schnitt ?? 1e9);
        gl.drawArrays(gl.TRIANGLES, 0, o.anzahl);
      } else {
        gl.uniform1f(pr.ort.hoehe, o.hoehe);
        gl.uniform1f(pr.ort.dunkel, o.dunkel);
        gl.drawArrays(gl.LINES, 0, Math.min(o.anzahl, o.bis));
      }
    }
    gl.depthMask(true);
    if (this.nachZeichnen) this.nachZeichnen();
    if (this.animationen.length) this.neu();
  }
}

// ---- Teile zum Einsetzen (einfach gezeichnet) -----------------------------
function zylinderDreiecke(r, h, z0 = 0, teile = 40) {
  const v = [];
  for (let i = 0; i < teile; i++) {
    const a1 = (i / teile) * Math.PI * 2, a2 = ((i + 1) / teile) * Math.PI * 2;
    const x1 = Math.cos(a1) * r, y1 = Math.sin(a1) * r, x2 = Math.cos(a2) * r, y2 = Math.sin(a2) * r;
    v.push(x1, y1, z0, x2, y2, z0, x2, y2, z0 + h, x1, y1, z0, x2, y2, z0 + h, x1, y1, z0 + h);
    v.push(0, 0, z0 + h, x1, y1, z0 + h, x2, y2, z0 + h);
    v.push(0, 0, z0, x2, y2, z0, x1, y1, z0);
  }
  return v;
}
// Teil entlang der lokalen z-Achse bauen: z = 0 ist die Lochöffnung, positiv geht ins Loch hinein
function teilGeometrie(teil, loch) {
  const teileFarben = [];
  let v = [];
  const farbe = (arr, f) => { for (let i = 0; i < arr.length; i += 3) teileFarben.push(...f); v = v.concat(arr); };
  if (teil.kat === "einsatz") {
    farbe(zylinderDreiecke(teil.aussen / 2, teil.laenge, 0), [0.84, 0.66, 0.2]);
    farbe(zylinderDreiecke(gewindeD(teil.gewinde) / 2, teil.laenge + 0.02, -0.01, 24), [0.35, 0.26, 0.06]);
  } else if (teil.kat === "schraube") {
    const n = NORM[teil.gewinde] || NORM.M3;
    farbe(zylinderDreiecke(n.kopf_d / 2, n.kopf_h, -n.kopf_h), [0.42, 0.46, 0.45]);
    farbe(zylinderDreiecke(gewindeD(teil.gewinde) / 2, teil.laenge, 0, 24), [0.62, 0.66, 0.65]);
  } else if (teil.kat === "magnet") {
    const start = Math.max(0, loch.tiefe - teil.dicke);
    farbe(zylinderDreiecke(teil.durchmesser / 2, teil.dicke / 2, start), [0.85, 0.25, 0.2]);
    farbe(zylinderDreiecke(teil.durchmesser / 2, teil.dicke / 2, start + teil.dicke / 2), [0.2, 0.45, 0.85]);
  }
  return { v, farben: teileFarben };
}
// Lokale Koordinaten in die Welt drehen: lokale z-Achse zeigt ins Loch
function insLoch(lokal, loch) {
  const a = loch.achse, rein = -loch.richtung;
  const [u, w] = a === 2 ? [0, 1] : a === 0 ? [1, 2] : [2, 0];
  const out = new Float32Array(lokal.length);
  for (let i = 0; i < lokal.length; i += 3) {
    const p = [0, 0, 0];
    p[u] = loch.mitte[u] + lokal[i];
    p[w] = loch.mitte[w] + lokal[i + 1];
    p[a] = loch.oeffnung + lokal[i + 2] * rein;
    out[i] = p[0]; out[i + 1] = p[1]; out[i + 2] = p[2];
  }
  return out;
}

// ---- Zuletzt geöffnete Dateien ----------------------------------------------
// Mit der Integration liegen sie auf dem Home-Assistant-Rechner (Medien › 3d-modelle)
// und jedes Gerät sieht dieselbe Liste. Ohne Integration nur in diesem Browser.
const MOD_SERVER_URL = "/api/filament_werkstatt/modelle";
function modServer(hass) {
  const url = (name) => `${MOD_SERVER_URL}/${encodeURIComponent(name)}`;
  const pruefen = (r) => { if (!r.ok) throw new Error(`Home Assistant antwortet mit ${r.status}`); return r; };
  return {
    aufServer: true,
    async alle() {
      const d = await pruefen(await hass.fetchWithAuth(MOD_SERVER_URL)).json();
      return (d.modelle || []).map((m) => ({ name: m.name, datum: m.zeit, groesse: m.groesse }));
    },
    async holen(name) {
      const r = await hass.fetchWithAuth(url(name));
      return r.ok ? { name, daten: await r.arrayBuffer() } : null;
    },
    async speichern(name, daten) {
      pruefen(await hass.fetchWithAuth(`${MOD_SERVER_URL}?name=${encodeURIComponent(name)}`,
        { method: "POST", body: daten, headers: { "Content-Type": "application/octet-stream" } }));
    },
    async loeschen(name) { await hass.fetchWithAuth(url(name), { method: "DELETE" }); },
  };
}

const MOD_DB = {
  async db() {
    if (this._db) return this._db;
    this._db = await new Promise((ok, fehler) => {
      const r = indexedDB.open("filament-werkstatt", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("modelle", { keyPath: "name" });
      r.onsuccess = () => ok(r.result);
      r.onerror = () => fehler(r.error);
    });
    return this._db;
  },
  async alle() {
    try {
      const db = await this.db();
      return await new Promise((ok) => {
        const r = db.transaction("modelle").objectStore("modelle").getAll();
        r.onsuccess = () => ok((r.result || []).sort((a, b) => b.datum - a.datum).map(({ name, datum, groesse }) => ({ name, datum, groesse })));
        r.onerror = () => ok([]);
      });
    } catch (e) { return []; }
  },
  async holen(name) {
    const db = await this.db();
    return new Promise((ok) => { const r = db.transaction("modelle").objectStore("modelle").get(name); r.onsuccess = () => ok(r.result); r.onerror = () => ok(null); });
  },
  async speichern(name, daten) {
    try {
      const db = await this.db();
      const tx = db.transaction("modelle", "readwrite");
      tx.objectStore("modelle").put({ name, daten, datum: Date.now(), groesse: daten.byteLength });
      await new Promise((ok) => (tx.oncomplete = ok));
      const liste = await this.alle();
      if (liste.length > 8) {
        const tx2 = db.transaction("modelle", "readwrite");
        liste.slice(8).forEach((x) => tx2.objectStore("modelle").delete(x.name));
      }
    } catch (e) { /* Speicher voll oder privat: dann eben nicht */ }
  },
  async loeschen(name) {
    try { const db = await this.db(); db.transaction("modelle", "readwrite").objectStore("modelle").delete(name); } catch (e) { /* egal */ }
  },
};

const STUETZEN = [
  { id: "keine", name: "Keine" },
  { id: "normal", name: "Normal" },
  { id: "baum-schlank", name: "Baum schlank" },
  { id: "baum-stark", name: "Baum stark" },
  { id: "baum-hybrid", name: "Baum hybrid" },
];
const MOD_ICON = {
  orbit: `<svg viewBox="0 0 24 24" class="mod-ico" aria-hidden="true"><ellipse cx="12" cy="12" rx="9.6" ry="4.3" transform="rotate(-28 12 12)"/><ellipse cx="12" cy="12" rx="4.3" ry="9.6" transform="rotate(-28 12 12)" opacity=".45"/><circle cx="12" cy="12" r="2.4" class="voll"/><path d="M17.6 4.3l2.9.6-.9 2.8"/></svg>`,
  orbitEin: `<svg viewBox="0 0 24 24" class="mod-ico" aria-hidden="true"><ellipse cx="12" cy="16" rx="9.4" ry="3.6"/><path d="M12 3v13" stroke-dasharray="2 2"/><circle cx="12" cy="16" r="2.2" class="voll"/><path d="M18.4 11.6l2.6 1.6-2.4 1.8"/></svg>`,
  haus: `<svg viewBox="0 0 24 24" class="mod-ico" aria-hidden="true"><path d="M4 11.5L12 4.5l8 7"/><path d="M6.5 10v9h11v-9"/><path d="M10.5 19v-5h3v5"/></svg>`,
};
const SCHICHT_BEREICH = { 0.2: [0.06, 0.14, 0.1], 0.4: [0.08, 0.28, 0.2], 0.6: [0.18, 0.42, 0.3], 0.8: [0.24, 0.56, 0.4] };

const MOD_MAX_BYTES = 200 * 1048576;      // größere Dateien bringen Handys zum Absturz
const MOD_MAX_DREIECKE = 3000000;

const ModellAnsicht = {
  _modHtml() {
    this._modEinrichten();
    const m = this._mod;
    if (!m) return this._modLeerHtml();
    if (m.laedt) return `<div class="dr-karte mod-laden"><span class="dreher"></span><div><h2>${esc(m.name)}</h2><p class="leise">${esc(m.laedt)}</p></div></div>`;
    const tabs = m.art === "stl"
      ? [["uebersicht", "Übersicht"], ["loecher", `Löcher${m.loecher ? ` (${m.loecher.length})` : ""}`], ["schichten", "Schichten"]]
      : [["uebersicht", "Übersicht"], ["schichten", "Schichten"]];
    return `<div class="mod-raster">
      <div class="mod-huelle">
      <button class="mod-plus" data-aktion="neu" aria-label="Datei öffnen" title="STL oder G-Code öffnen">+</button>
      <div class="mod-buehne-karte dr-karte">
        <div id="mod-buehne" class="mod-buehne"></div>
        <div id="mod-marker" class="mod-marker"></div>
        <div class="mod-leiste">
          <span class="mod-name" title="${esc(m.name)}">${m.art === "stl" ? "🧊" : "🧾"} ${esc(m.name)}</span>
          <button class="chip" data-aktion="mod-ansicht" data-id="iso">3D</button>
          <button class="chip" data-aktion="mod-ansicht" data-id="oben">Oben</button>
          <button class="chip" data-aktion="mod-ansicht" data-id="vorne">Vorne</button>
          <button class="chip" data-aktion="mod-ansicht" data-id="bett">Bett</button>
          ${this._modOrbitHtml()}
          <button class="chip mod-zu" data-aktion="mod-schliessen" aria-label="Modell schließen">✕</button>
        </div>
        ${this._modWuerfelHtml()}
        <div id="mod-drehpunkt" class="mod-drehpunkt" aria-hidden="true"></div>
        ${m.tab === "schichten" && m.schichtZahl ? `<div class="mod-schicht-leiste">
          <button class="rund" data-aktion="mod-schicht" data-d="-1" aria-label="Schicht tiefer">−</button>
          <input type="range" min="1" max="${m.schichtZahl}" step="1" value="${m.schichtNr}" data-mod="schicht">
          <button class="rund" data-aktion="mod-schicht" data-d="1" aria-label="Schicht höher">+</button>
          <span id="mod-schicht-text" class="mod-schicht-text">${this._modSchichtText()}</span>
        </div>` : ""}
        ${m.markieren ? `<div class="mod-markier-hinweis" data-einmal="mod-markier">🎯 Tippe auf die Stelle, an der das Loch beginnt <button class="mini" data-aktion="mod-markieren">Abbrechen</button></div>` : ""}
        <p class="mod-hilfe leise">${this._mobil ? "Ein Finger dreht um die berührte Stelle · zwei Finger zoomen und schieben" : "Ziehen dreht um die Stelle unter dem Zeiger · Rechtsklick oder Shift schiebt · Mausrad zoomt"}</p>
      </div>
      </div>
      <aside class="mod-seite dr-karte">
        <div class="tabs mod-tabs">${tabs.map(([id, n]) => `<button class="tab ${m.tab === id ? "an" : ""}" data-aktion="mod-tab" data-id="${id}">${n}</button>`).join("")}</div>
        <div class="mod-inhalt">${m.tab === "loecher" ? this._modLoecherHtml() : m.tab === "schichten" ? this._modSchichtenHtml() : this._modUebersichtHtml()}</div>
        <div class="mod-fuss"><button class="knopf breit mod-ws" data-aktion="ws-aus-modell">＋ In die Warteschlange</button></div>
      </aside>
    </div>`;
  },

  _modLeerHtml() {
    // Liste beim Öffnen des Reiters auffrischen, ein anderes Gerät kann etwas geöffnet haben
    if (this._modBereit && Date.now() - (this._modZuletztZeit || 0) > 15000) setTimeout(() => this._modZuletztLaden(), 0);
    const zuletzt = this._modZuletzt || [];
    return `<div class="mod-leer">
      <label class="ablage" data-ablage="1">
        <input type="file" accept=".stl,.gcode,.3mf" data-mod="datei" hidden>
        <span class="ablage-icon">🧊</span>
        <strong>STL oder G-Code hierher ziehen</strong>
        <span class="leise">oder tippen, um eine Datei zu wählen</span>
        <span class="leise klein">.stl · .gcode · .gcode.3mf aus Bambu Studio</span>
      </label>
      ${zuletzt.length ? `<div class="dr-karte"><h3 class="dr-titel">🕘 Zuletzt geöffnet <small class="leise">${this._modZuletztServer
        ? `auf allen Geräten · ${zahl(zuletzt.reduce((s, z) => s + (z.groesse || 0), 0) / 1048576, 1)} MB belegt`
        : "nur auf diesem Gerät"}</small></h3><div class="dr-verlauf">${zuletzt.map((z) => `
        <div class="dr-druck mod-zuletzt"><button class="mod-zuletzt-knopf" data-aktion="mod-zuletzt" data-name="${esc(z.name)}"><span class="ld-bild">${/\.stl$/i.test(z.name) ? "🧊" : "🧾"}</span>
          <span class="dr-druck-text"><strong>${esc(z.name)}</strong><small>${new Date(z.datum).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })} · ${zahl(z.groesse / 1048576, 1)} MB</small></span></button>
          <button class="icon-knopf" data-aktion="mod-zuletzt-weg" data-name="${esc(z.name)}" aria-label="Aus der Liste entfernen">✕</button></div>`).join("")}</div></div>` : ""}
    </div>`;
  },

  _modUebersichtHtml() {
    const m = this._mod;
    if (m.art === "gcode") return this._modGcodeUebersichtHtml();
    const g = m.grenzen.groesse;
    const zuGross = g.map((x) => x > BETT_MM + 0.01);
    const passt = !zuGross.some(Boolean);
    const rolle = this._modRolle();
    const dichte = materialInfo(rolle ? rolle.material : "PLA").dichte;
    const gew = gewichtSchaetzen(m.kenn, dichte, { duese: m.duese, waende: m.waende, fuellung: m.fuellung });
    const rest = rolle && rolle.rest_g != null ? rolle.rest_g - gew.gramm : null;
    const rollen = this._daten.rollen.slice().sort((a, b) => (b.rest_g ?? -1) - (a.rest_g ?? -1));
    return `
      <div class="mod-masse">${["X", "Y", "Z"].map((a, i) => `<div class="${zuGross[i] ? "rot" : ""}"><span>${a}</span><strong>${zahl(g[i], 1)}</strong><small>mm</small></div>`).join("")}</div>
      <div class="hinweis ${passt ? "mint" : "rot-hinweis"}">${passt ? "✓ Passt aufs Druckbett (256 × 256 × 256 mm)" : `✕ Zu groß für den P1S: ${["X", "Y", "Z"].filter((_, i) => zuGross[i]).join(", ")} über 256 mm. Drehen hilft nur, wenn eine andere Seite kürzer ist.`}</div>
      <div class="r-kopf oben-abstand"><span>Drehen</span><span class="leise klein">90° oder eigene Winkel</span></div>
      <div class="chips mod-dreh">
        <button class="chip" data-aktion="mod-drehen" data-achse="0">↻ 90° um X</button>
        <button class="chip" data-aktion="mod-drehen" data-achse="1">↻ 90° um Y</button>
        <button class="chip" data-aktion="mod-drehen" data-achse="2">↻ 90° um Z</button>
        <button class="chip ${m.drehEigen ? "an" : ""}" data-aktion="mod-dreh-eigen" aria-expanded="${m.drehEigen ? "true" : "false"}">✎ Benutzerdefiniert</button>
      </div>
      ${m.drehEigen ? this._modDrehEigenHtml() : ""}
      <h3>⚖️ Gewicht und Rolle</h3>
      <label class="auswahl breit-auswahl"><span>Rolle</span><select data-mod="rolle">${rollen.map((r) => `<option value="${esc(r.id)}" ${rolle && r.id === rolle.id ? "selected" : ""}>${esc(r.name)} · ${esc(r.hersteller)}${r.rest_g != null ? ` · ${zahl(r.rest_g)} g` : " · nicht gewogen"}</option>`).join("")}</select></label>
      ${this._modReglerHtml("fuellung", "Füllung", m.fuellung, 0, 100, 5, "%")}
      ${this._modReglerHtml("waende", "Wände", m.waende, 1, 6, 1, "")}
      <div id="mod-gewicht">${this._modGewichtHtml(gew, rest, rolle)}</div>
      ${m.ueber && m.ueber.flaeche > 25 ? `<div class="hinweis amber">⚠️ Etwa ${zahl(m.ueber.flaeche / 100, 1)} cm² hängen über (steiler als ${STUETZ_WINKEL}°) und brauchen Stützen. <button class="mini" data-aktion="mod-tab" data-id="schichten">Ansehen</button></div>` : `<div class="hinweis">Keine nennenswerten Überhänge, Stützen sind voraussichtlich nicht nötig.</div>`}
      <div class="info-liste oben-abstand">
        <div class="info-zeile"><span>Volumen</span><strong>${zahl(m.kenn.volumen / 1000, 1)} cm³</strong></div>
        <div class="info-zeile"><span>Oberfläche</span><strong>${zahl(m.kenn.flaeche / 100, 0)} cm²</strong></div>
        <div class="info-zeile"><span>Dreiecke</span><strong>${zahl(m.kenn.dreiecke)}</strong></div>
      </div>`;
  },

  // Eigene Winkel je Achse; die Vorschau dreht das Modell schon mit, „Anwenden“ übernimmt es
  _modDrehEigenHtml() {
    const w = this._mod.drehWerte || [0, 0, 0];
    return `<div class="mod-dreh-eigen" data-einmal="mod-dreh-eigen">
      <div class="mod-dreh-felder">${["X", "Y", "Z"].map((a, i) => `<label class="mod-dreh-feld a-${a.toLowerCase()} ${i === (this._mod.drehFeld ?? 2) ? "aktiv" : ""}"><span>${a}</span>
        <input type="number" inputmode="decimal" step="0.5" min="-360" max="360" value="${w[i]}" data-mod="dreh-grad" data-achse="${i}" id="mod-dreh-${i}" aria-label="Winkel um ${a} in Grad"><small>°</small></label>`).join("")}</div>
      <div class="chips mod-dreh-schnell">${[-45, -15, -5, 5, 15, 45].map((g) => `<button class="chip" data-aktion="mod-dreh-plus" data-g="${g}">${g > 0 ? "+" : "−"}${Math.abs(g)}°</button>`).join("")}</div>
      <p class="leise klein">Die Schnellknöpfe ändern das zuletzt gewählte Feld. Gedreht wird um die Modellmitte, erst X, dann Y, dann Z. Danach steht das Teil wieder auf dem Bett.</p>
      <div class="knopf-reihe"><button class="knopf leise" data-aktion="mod-dreh-null">Zurücksetzen</button><button class="knopf" data-aktion="mod-dreh-anwenden">Anwenden</button></div>
    </div>`;
  },

  _modGewichtHtml(gew, rest, rolle) {
    return `<div class="ergebnis ${rest != null && rest < 0 ? "fehlt" : ""}">
      <span class="leise klein">Geschätzt für ${esc(rolle ? rolle.material : "PLA")}</span>
      <strong>≈ ${zahl(gew.gramm, gew.gramm < 10 ? 1 : 0)} g</strong>
      <span class="klein">${zahl(gew.meter, 1)} m Filament</span>
      ${rest == null ? `<span class="klein leise">Rolle nicht gewogen, Rest unbekannt.</span>` : rest >= 0 ? `<span class="klein">✓ Reicht. Danach bleiben noch etwa ${zahl(rest)} g auf der Rolle.</span>` : `<span class="klein">✕ Reicht nicht, es fehlen etwa ${zahl(-rest)} g.</span>`}
    </div><p class="leise klein">Schätzung aus Volumen und Oberfläche. Genauer wird es mit dem G-Code aus Bambu Studio.</p>`;
  },

  _modReglerHtml(k, name, wert, min, max, step, einheit) {
    return `<div class="mod-regler"><div class="r-kopf"><span>${name}</span><strong id="mod-wert-${k}">${zahl(wert, step < 1 ? 2 : 0)}${einheit ? ` ${einheit}` : ""}</strong></div>
      <div class="regler-zeile"><input type="range" min="${min}" max="${max}" step="${step}" value="${wert}" data-mod="${k}"></div></div>`;
  },

  _modGcodeUebersichtHtml() {
    const m = this._mod, i = m.gcode.info;
    const rolle = this._modRolle();
    const rest = rolle && rolle.rest_g != null && i.gramm ? rolle.rest_g - i.gramm : null;
    const rollen = this._daten.rollen.slice().sort((a, b) => (b.rest_g ?? -1) - (a.rest_g ?? -1));
    const g = m.grenzen ? m.grenzen.groesse : null;
    return `
      ${g ? `<div class="mod-masse">${["X", "Y", "Z"].map((a, k) => `<div><span>${a}</span><strong>${zahl(g[k], 1)}</strong><small>mm</small></div>`).join("")}</div>` : ""}
      <div class="info-liste">
        <div class="info-zeile"><span>Filament laut Slicer</span><strong>${i.gramm ? `${zahl(i.gramm, 1)} g` : "–"}</strong></div>
        <div class="info-zeile"><span>Länge</span><strong>${i.mm ? `${zahl(i.mm / 1000, 2)} m` : "–"}</strong></div>
        <div class="info-zeile"><span>Druckzeit</span><strong>${esc(i.zeit || "–")}</strong></div>
        <div class="info-zeile"><span>Material</span><strong>${esc(i.material || "–")}</strong></div>
        <div class="info-zeile"><span>Düse / Schicht</span><strong>${i.duese ? `${zahl(i.duese, 1)} mm` : "–"} / ${i.schicht ? `${zahl(i.schicht, 2)} mm` : "–"}</strong></div>
        <div class="info-zeile"><span>Schichten</span><strong>${zahl(m.gcode.schichten.length)}</strong></div>
      </div>
      <h3>⚖️ Reicht die Rolle?</h3>
      <label class="auswahl breit-auswahl"><span>Rolle</span><select data-mod="rolle">${rollen.map((r) => `<option value="${esc(r.id)}" ${rolle && r.id === rolle.id ? "selected" : ""}>${esc(r.name)} · ${esc(r.hersteller)}${r.rest_g != null ? ` · ${zahl(r.rest_g)} g` : " · nicht gewogen"}</option>`).join("")}</select></label>
      <div class="ergebnis ${rest != null && rest < 0 ? "fehlt" : ""}">
        <strong>${i.gramm ? `${zahl(i.gramm, 1)} g` : "Gewicht unbekannt"}</strong>
        ${rest == null ? `<span class="klein leise">${i.gramm ? "Rolle nicht gewogen, Rest unbekannt." : "Im G-Code steht kein Gewicht."}</span>` : rest >= 0 ? `<span class="klein">✓ Reicht. Danach bleiben etwa ${zahl(rest)} g übrig.</span>` : `<span class="klein">✕ Reicht nicht, es fehlen etwa ${zahl(-rest)} g.</span>`}
      </div>
      <button class="knopf leise breit oben-abstand" data-aktion="mod-tab" data-id="schichten">Schichten ansehen</button>`;
  },

  // ---- Löcher ----
  _modLoecherHtml() {
    const m = this._mod;
    if (!m.loecher) return `<div class="mod-laden-klein"><span class="dreher klein"></span> Suche Löcher …</div>`;
    const markierKnopf = `<button class="knopf leise breit mod-markier ${m.markieren ? "an" : ""}" data-aktion="mod-markieren">${m.markieren ? "✕ Markieren abbrechen" : "＋ Loch von Hand markieren"}</button>`;
    if (!m.loecher.length) return `<div class="hinweis">Keine runden Löcher gefunden. Erkannt werden kreisrunde Löcher entlang X, Y und Z. Schräge oder eckige Löcher kannst du von Hand markieren.</div>${markierKnopf}`;
    const inv = this._daten.inventar;
    const eingesetzt = m.eingesetzt;
    const liste = m.loecher.map((l) => {
      const auf = m.lochAuswahl === l.nr;
      const drin = eingesetzt[l.nr];
      const vor = teileFuerLoch(l, inv);
      const richtung = l.achse === 2 ? "senkrecht" : l.achse === 0 ? "quer (X)" : "quer (Y)";
      return `<div class="mod-loch ${auf ? "auf" : ""} ${drin ? "drin" : ""}">
        <button class="mod-loch-kopf" data-aktion="mod-loch" data-nr="${l.nr}">
          <span class="mod-nr">${l.nr}</span>
          <span class="dr-druck-text"><strong>Ø ${zahl(l.durchmesser, 2)} mm · ${zahl(l.tiefe, 1)} mm tief</strong>
            <small>${l.manuell ? "von Hand · " : ""}${l.durch ? "durchgehend" : "Sackloch"} · ${richtung}${drin ? ` · ✓ ${esc(kategorie((inv.find((t) => t.id === drin) || {}).kat).einzahl)} ${esc(teilName(inv.find((t) => t.id === drin) || {}))}` : ""}</small></span>
          <span class="pille ${vor.length ? "mint" : "leise"}">${vor.length ? `${vor.length} passend` : "nichts passend"}</span>
        </button>
        ${auf && l.manuell ? `<div class="mod-manuell">
          ${this._modReglerHtml(`loch-d-${l.nr}`, "Durchmesser", l.durchmesser, 1, 30, 0.05, "mm").replace(`data-mod="loch-d-${l.nr}"`, `data-mod="loch-d" data-nr="${l.nr}"`)}
          ${this._modReglerHtml(`loch-t-${l.nr}`, "Tiefe", l.tiefe, 0.5, 60, 0.5, "mm").replace(`data-mod="loch-t-${l.nr}"`, `data-mod="loch-t" data-nr="${l.nr}"`)}
          <div class="chips"><button class="chip ${l.durch ? "" : "an"}" data-aktion="mod-loch-art" data-nr="${l.nr}" data-durch="0">Sackloch</button><button class="chip ${l.durch ? "an" : ""}" data-aktion="mod-loch-art" data-nr="${l.nr}" data-durch="1">Durchgehend</button>
          <button class="mini" data-aktion="mod-loch-weg" data-nr="${l.nr}">Loch löschen</button></div></div>` : ""}
        ${auf ? `<div class="mod-vorschlaege">${vor.length ? vor.map((x) => `
          <div class="mod-vorschlag ${drin === x.teil.id ? "an" : ""}">
            <span class="mod-v-bild">${teilSvg(x.teil)}</span>
            <span class="dr-druck-text"><strong>${kategorie(x.teil.kat).icon} ${esc(teilName(x.teil))}</strong><small>${esc(x.text)} · Bestand ${x.teil.menge ?? "?"}</small></span>
            ${drin === x.teil.id ? `<button class="mini" data-aktion="mod-raus" data-nr="${l.nr}">Entfernen</button>` : `<button class="knopf klein-knopf" data-aktion="mod-einsetzen" data-nr="${l.nr}" data-id="${esc(x.teil.id)}">Einsetzen</button>`}
          </div>`).join("") : `<p class="leise klein">Im Inventar ist nichts, das passt. Für einen Einschmelzeinsatz sollte das Loch etwa 0,5–1 mm kleiner sein als der Einsatz, für eine Schraube 0,2–0,6 mm größer als das Gewinde.</p>`}</div>` : ""}
      </div>`;
    }).join("");
    const zaehlen = {};
    Object.values(eingesetzt).forEach((id) => (zaehlen[id] = (zaehlen[id] || 0) + 1));
    const teileliste = Object.entries(zaehlen).map(([id, n]) => {
      const t = inv.find((x) => x.id === id);
      if (!t) return "";
      const knapp = t.menge != null && t.menge < n;
      return `<div class="info-zeile"><span>${n}× ${kategorie(t.kat).icon} ${esc(kategorie(t.kat).einzahl)} ${esc(teilName(t))}</span><strong class="${knapp ? "rot" : ""}">Bestand ${t.menge ?? "?"}</strong></div>`;
    }).join("");
    return `<div class="knopf-reihe"><button class="knopf" data-aktion="mod-alle-einsetzen">Alle passenden einsetzen</button>
        ${Object.keys(eingesetzt).length ? `<button class="knopf leise" data-aktion="mod-alle-raus">Alle entfernen</button>` : ""}</div>
      <div class="mod-loecher">${liste}</div>${markierKnopf}
      ${teileliste ? `<h3>🧾 Teileliste für dieses Modell</h3><div class="info-liste">${teileliste}</div>` : ""}
      <p class="leise klein oben-abstand">Erkannt werden kreisrunde Löcher entlang X, Y und Z. Schräge Löcher und Sechskant-Taschen für Muttern noch nicht. Tiefe auf etwa ±0,3 mm genau.</p>`;
  },

  // ---- Schichten ----
  _modSchichtenHtml() {
    const m = this._mod;
    if (m.art === "gcode") {
      const arten = new Set();
      m.gcode.schichten.forEach((s) => { for (let i = 4; i < s.linien.length; i += 5) arten.add(GCODE_ARTEN_LISTE[s.linien[i]]); });
      return `<p class="leise">Echte Druckwege aus dem G-Code. Mit dem Regler unter der Ansicht gehst du Schicht für Schicht.</p>
        ${this._modLegendeHtml([...arten])}`;
    }
    const duesen = [...new Set(this._daten.inventar.filter((t) => t.kat === "duese" && (t.menge == null || t.menge > 0)).map((t) => t.groesse))].sort();
    const [smin, smax] = SCHICHT_BEREICH[m.duese] || [0.08, 0.28];
    return `
      <div class="r-kopf"><span>Düse</span><span class="leise klein">aus deinem Inventar</span></div>
      <div class="chips">${(duesen.length ? duesen : [0.4]).map((d) => `<button class="chip ${m.duese === d ? "an" : ""}" data-aktion="mod-duese" data-id="${d}">${zahl(d, 1)} mm</button>`).join("")}</div>
      ${this._modReglerHtml("schicht_h", "Schichthöhe", m.schicht_h, smin, smax, 0.02, "mm")}
      <p class="leise klein">Für ${zahl(m.duese, 1)} mm sind ${zahl(smin, 2)}–${zahl(smax, 2)} mm sinnvoll. Dünner sieht feiner aus und dauert länger.</p>
      ${this._modReglerHtml("waende", "Wände", m.waende, 1, 6, 1, "")}
      ${this._modReglerHtml("fuellung", "Füllung", m.fuellung, 0, 100, 5, "%")}
      ${this._modMusterHtml()}
      <div class="r-kopf oben-abstand"><span>Stützen</span><button class="mini mint-rand" data-aktion="mod-stuetzen-hilfe">Was ist was?</button></div>
      <div class="chips">${STUETZEN.map((s) => `<button class="chip ${m.stuetzen === s.id ? "an" : ""}" data-aktion="mod-stuetzen" data-id="${s.id}">${s.name}</button>`).join("")}</div>
      <div id="mod-schicht-status">${this._modSchichtStatusHtml()}</div>
      ${this._modLegendeHtml(["aussen", "innen", "fuellung", ...(m.stuetzen !== "keine" ? ["stuetze"] : [])])}
      <p class="leise klein">Vereinfachte Vorschau, kein echter Slicer: Wände, Füllung und Stützen sind angenähert. Für die echten Wege den G-Code aus Bambu Studio laden.</p>`;
  },

  // Füllmuster wie in Bambu Studio, mit kleiner Vorschau
  _modMusterHtml() {
    const m = this._mod, mu = FUELLMUSTER.find((x) => x.id === m.muster) || FUELLMUSTER[0];
    const gruppen = Object.entries(FUELLMUSTER_GRUPPEN).map(([g, name]) => `<optgroup label="${esc(name)}">${FUELLMUSTER.filter((x) => x.gruppe === g)
      .map((x) => `<option value="${x.id}" ${x.id === mu.id ? "selected" : ""}>${esc(x.name)}${x.name !== x.bambu ? ` (${esc(x.bambu)})` : ""}</option>`).join("")}</optgroup>`).join("");
    return `<div class="mod-muster" id="mod-muster">
      <div class="mod-muster-vorschau" title="So sieht ${esc(mu.name)} in einer Schicht ungefähr aus">${musterVorschauSvg(mu.id)}</div>
      <div class="mod-muster-text">
        <label class="auswahl breit-auswahl"><span>Füllmuster</span><select data-mod="muster">${gruppen}</select></label>
        <p class="leise klein">${esc(mu.text)}${mu.gruppe === "3d" ? " <span class=\"pille mint\">ändert sich je Schicht</span>" : ""}</p>
      </div>
    </div>`;
  },

  _modSchichtStatusHtml() {
    const m = this._mod;
    if (m.schichtFortschritt != null && m.schichtFortschritt < 1) return `<div class="mod-laden-klein"><span class="dreher klein"></span> Berechne Schichten … ${zahl(m.schichtFortschritt * 100)} %</div>`;
    if (!m.schichtGewicht) return "";
    const rolle = this._modRolle();
    return `<div class="info-liste oben-abstand">
      <div class="info-zeile"><span>Schichten</span><strong>${zahl(m.schichtZahl)}</strong></div>
      <div class="info-zeile"><span>Filament (aus den Schichten)</span><strong>≈ ${zahl(m.schichtGewicht, 1)} g</strong></div>
      ${m.stuetzGewicht ? `<div class="info-zeile"><span>davon Stützen</span><strong>≈ ${zahl(m.stuetzGewicht, 1)} g</strong></div>` : ""}
      <div class="info-zeile"><span>Material</span><strong>${esc(rolle ? rolle.material : "PLA")}</strong></div>
    </div>`;
  },

  _modLegendeHtml(arten) {
    return `<div class="mod-legende">${arten.filter(Boolean).map((a) => { const f = LINIEN_FARBEN[a] || [1, 1, 1];
      return `<span><i style="background: rgb(${f.map((x) => Math.round(x * 255)).join(",")})"></i>${LINIEN_NAMEN[a] || a}</span>`; }).join("")}</div>`;
  },

  _modSchichtText() {
    const m = this._mod;
    const z = m.schichtHoehen ? m.schichtHoehen[m.schichtNr - 1] : null;
    return `Schicht ${m.schichtNr} von ${m.schichtZahl}${z != null ? ` · ${zahl(z, 2)} mm` : ""}`;
  },

  _modStuetzenHilfeHtml() {
    const bild = (art) => {
      const boden = `<rect x="0" y="92" width="160" height="8" fill="#2a3330"/>`;
      const teil = `<path d="M20 20 h120 v18 h-60 v-0 h-60 z" fill="#3ee6a8" opacity=".85"/><rect x="20" y="20" width="40" height="72" fill="#3ee6a8" opacity=".85"/>`;
      let st = "";
      if (art === "normal") for (let x = 66; x < 140; x += 8) st += `<line x1="${x}" y1="40" x2="${x}" y2="92" stroke="#4fe08a" stroke-width="2"/>`;
      if (art.startsWith("baum")) {
        const dick = art === "baum-stark" ? 5 : art === "baum-hybrid" ? 3.5 : 2.2;
        st += `<path d="M100 92 C100 75 100 70 100 62" stroke="#4fe08a" stroke-width="${dick + 1.5}" fill="none"/>`;
        [70, 86, 114, 130].forEach((x) => (st += `<path d="M100 64 Q${(x + 100) / 2} 55 ${x} 40" stroke="#4fe08a" stroke-width="${dick}" fill="none"/>`));
        if (art === "baum-hybrid") for (let x = 66; x < 140; x += 6) st += `<line x1="${x}" y1="40" x2="${x}" y2="43" stroke="#4fe08a" stroke-width="2"/>`;
      }
      return `<svg viewBox="0 0 160 100" class="stuetz-bild">${boden}${teil}${st}</svg>`;
    };
    const texte = {
      keine: "Druckt ohne Stützen. Gut, wenn nichts mehr als etwa 30–45° überhängt. Brücken bis ca. 10–20 mm schafft der P1S meist frei.",
      normal: "Senkrechte Säulen im Gitter direkt unter dem Überhang. Stabil und schnell berechnet, braucht aber mehr Material und hinterlässt mehr Spuren.",
      "baum-schlank": "Dünne Äste, die sich nach unten zu einem Stamm vereinen. Spart Material, lässt sich leicht entfernen. Gut für Figuren und kleine Überhänge.",
      "baum-stark": "Wie Baum schlank, aber mit dickeren Ästen. Für schwere oder hohe Überhänge, wackelt weniger.",
      "baum-hybrid": "Baum unten, oben flache Auflage wie bei Normal. Gut für große, flache Überhänge, die eine glatte Unterseite brauchen.",
    };
    return `<h2>Welche Stützen?</h2><div class="stuetz-liste">${STUETZEN.map((s) => `<div class="stuetz-eintrag">${bild(s.id)}<div><strong>${s.name}</strong><p class="leise klein">${texte[s.id]}</p></div></div>`).join("")}</div>
      <button class="knopf leise breit" data-aktion="dialog-zu">Schließen</button>`;
  },

  // ---- Orbit-Knopf mit kleinem Menü (wie in Fusion 360) ----
  _modOrbitHtml() {
    const frei = this._modOrbitArt === "frei", offen = !!this._modOrbitMenue;
    return `<div class="mod-orbit">
      <button class="chip mod-orbit-knopf ${offen ? "an" : ""}" data-aktion="mod-orbit-menue" aria-haspopup="menu" aria-expanded="${offen}" title="Orbit: ${frei ? "frei" : "eingeschränkt"}">
        ${frei ? MOD_ICON.orbit : MOD_ICON.orbitEin}<span class="mod-orbit-name">${frei ? "Orbit" : "Eingeschr. Orbit"}</span><span class="mod-pfeil">▾</span></button>
      ${offen ? `<div class="mod-orbit-menue" role="menu" data-einmal="mod-orbit-menue">
        <button class="mod-orbit-punkt ${frei ? "an" : ""}" role="menuitemradio" aria-checked="${frei}" data-aktion="mod-orbit-art" data-id="frei">${MOD_ICON.orbit}
          <span><strong>Orbit</strong><small>Frei in alle Richtungen, auch über Kopf</small></span></button>
        <button class="mod-orbit-punkt ${frei ? "" : "an"}" role="menuitemradio" aria-checked="${!frei}" data-aktion="mod-orbit-art" data-id="eingeschraenkt">${MOD_ICON.orbitEin}
          <span><strong>Eingeschränkter Orbit</strong><small>Wie ein Drehteller: oben bleibt oben</small></span></button>
        <div class="mod-orbit-trenner"></div>
        <button class="mod-orbit-punkt" role="menuitemcheckbox" aria-checked="${!!this._modWuerfelZiehen}" data-aktion="mod-wuerfel-ziehen">
          <span class="mod-schalter ${this._modWuerfelZiehen ? "an" : ""}"></span>
          <span><strong>Würfel ziehen dreht die Ansicht</strong><small>Aus: der Würfel reagiert nur auf Klicks</small></span></button>
        <p class="mod-orbit-tipp leise klein">Gedreht wird um die Stelle des Modells, auf die du beim Ziehen zeigst. Daneben: um die Modellmitte.</p>
      </div>` : ""}
    </div>`;
  },

  // ---- Ausrichtungswürfel: Flächen, Kanten und Ecken anklickbar ----
  _modWuerfelHtml() {
    const S = this._mobil ? 48 : 64;
    const FL = [
      { n: [0, 0, 1], x: [1, 0, 0], y: [0, -1, 0], name: "OBEN" },
      { n: [0, 0, -1], x: [1, 0, 0], y: [0, 1, 0], name: "UNTEN" },
      { n: [0, -1, 0], x: [1, 0, 0], y: [0, 0, -1], name: "VORNE" },
      { n: [0, 1, 0], x: [-1, 0, 0], y: [0, 0, -1], name: "HINTEN" },
      { n: [1, 0, 0], x: [0, 1, 0], y: [0, 0, -1], name: "RECHTS" },
      { n: [-1, 0, 0], x: [0, -1, 0], y: [0, 0, -1], name: "LINKS" },
    ];
    const wortFuer = (d) => [d[1] < 0 ? "vorne" : d[1] > 0 ? "hinten" : "", d[0] < 0 ? "links" : d[0] > 0 ? "rechts" : "", d[2] > 0 ? "oben" : d[2] < 0 ? "unten" : ""].filter(Boolean).join(" ");
    const flaechen = FL.map((f) => {
      const m = [...f.x, 0, ...f.y, 0, ...f.n, 0, ...f.n.map((v) => (v * S) / 2), 1];
      let zonen = "";
      for (const j of [-1, 0, 1]) for (const i of [-1, 0, 1]) {
        const d = [0, 1, 2].map((k) => f.n[k] + i * f.x[k] + j * f.y[k]);
        const art = i === 0 && j === 0 ? "flaeche" : i === 0 || j === 0 ? "kante" : "ecke";
        const titel = wortFuer(d);
        zonen += `<button class="mod-w-zone ${art}" ${art === "flaeche" ? "" : `tabindex="-1"`} data-aktion="mod-wuerfel" data-d="${d.join(",")}" title="Ansicht ${titel}" aria-label="Ansicht ${titel}">${art === "flaeche" ? `<span>${f.name}</span>` : ""}</button>`;
      }
      return `<div class="mod-w-flaeche w-${f.name.toLowerCase()}" style="transform: matrix3d(${m.map((v) => +v.toFixed(4)).join(",")})">${zonen}</div>`;
    }).join("");
    const achsen = [["x", "X"], ["y", "Y"], ["z", "Z"]].map(([k, n]) => `<line id="mod-achse-${k}" class="a-${k}" x1="0" y1="0" x2="0" y2="0"/><text id="mod-achse-${k}-t" class="a-${k}" x="0" y="0">${n}</text>`).join("");
    return `<div class="mod-wuerfel-ecke ${this._modWuerfelZiehen ? "ziehbar" : ""}" id="mod-wuerfel-ecke" style="--w: ${S}px">
      <button class="mod-heim" data-aktion="mod-ansicht" data-id="start" title="Startansicht" aria-label="Startansicht">${MOD_ICON.haus}</button>
      <div class="mod-wuerfel" id="mod-wuerfel" role="group" aria-label="Ausrichtungswürfel">
        <div class="mod-w-koerper" id="mod-w-koerper" style="transform: ${this._modWuerfelMatrix()}">${flaechen}</div>
      </div>
      <svg class="mod-achsen" id="mod-achsen" viewBox="-26 -26 52 52" aria-hidden="true">${achsen}</svg>
    </div>`;
  },
  _modWuerfelMatrix() {
    const b = this._buehne;
    if (!b || !b.r) return "rotateX(-60deg) rotateZ(-38deg)";
    const r = b.r, u = b.u, f = b._f();
    // Welt → Bildschirm (CSS: y nach unten, z zum Betrachter)
    return `matrix3d(${[r[0], -u[0], -f[0], 0, r[1], -u[1], -f[1], 0, r[2], -u[2], -f[2], 0, 0, 0, 0, 1].map((v) => +v.toFixed(5)).join(",")})`;
  },
  // Würfel, Achsen und Drehpunkt bei jedem Bild nachführen
  _modWuerfelNachfuehren() {
    const root = this.shadowRoot, b = this._buehne;
    if (!b) return;
    const k = root.getElementById("mod-w-koerper");
    if (k) k.style.transform = this._modWuerfelMatrix();
    const f = b._f();
    for (const [i, a] of ["x", "y", "z"].entries()) {
      const l = root.getElementById(`mod-achse-${a}`), t = root.getElementById(`mod-achse-${a}-t`);
      if (!l) continue;
      const e = [0, 0, 0]; e[i] = 1;
      const x = V3.punkt(b.r, e) * 17, y = -V3.punkt(b.u, e) * 17, hinten = V3.punkt(f, e) > 0.2;
      l.setAttribute("x2", x.toFixed(1)); l.setAttribute("y2", y.toFixed(1));
      t.setAttribute("x", (x * 1.32).toFixed(1)); t.setAttribute("y", (y * 1.32 + 3).toFixed(1));
      l.style.opacity = t.style.opacity = hinten ? 0.35 : 1;
    }
    const p = root.getElementById("mod-drehpunkt");
    if (p) {
      const s = b.drehpunktSichtbar && b.drehpunkt ? b.projizieren(b.drehpunkt) : null;
      p.classList.toggle("an", !!s);
      p.classList.toggle("mitte", !!s && !b.drehpunktGetroffen);
      if (s) p.style.transform = `translate(${s[0]}px, ${s[1]}px)`;
    }
  },
  // Würfel ziehen = Orbit um die Modellmitte (wenn eingeschaltet)
  _modWuerfelZiehenEinrichten() {
    const w = this.shadowRoot.getElementById("mod-wuerfel");
    if (!w || w._fw) return;
    w._fw = true;
    let z = null;
    w.addEventListener("pointerdown", (e) => {
      if (!this._modWuerfelZiehen || !this._buehne) return;
      z = { id: e.pointerId, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, gezogen: false };
    });
    w.addEventListener("pointermove", (e) => {
      if (!z || e.pointerId !== z.id) return;
      if (!z.gezogen && Math.hypot(e.clientX - z.x0, e.clientY - z.y0) < 4) return;
      if (!z.gezogen) { z.gezogen = true; try { w.setPointerCapture(e.pointerId); } catch (x) { /* egal */ } w.classList.add("zieht"); }
      const b = this._buehne;
      b.orbit((e.clientX - z.x) * 1.5, (e.clientY - z.y) * 1.5, b.mitte || b.ziel);
      z.x = e.clientX; z.y = e.clientY;
    });
    const ende = () => { if (z && z.gezogen) this._modWuerfelGezogen = performance.now(); z = null; w.classList.remove("zieht"); };
    w.addEventListener("pointerup", ende);
    w.addEventListener("pointercancel", ende);
  },
  _modMenueZu() {
    if (!this._modOrbitMenue) return;
    this._modOrbitMenue = false;
    const root = this.shadowRoot, menue = root.querySelector(".mod-orbit-menue"), k = root.querySelector(".mod-orbit-knopf");
    if (menue) menue.remove();
    if (k) { k.classList.remove("an"); k.setAttribute("aria-expanded", "false"); }
  },
  _modEinstellung(k, wert) {
    try { if (wert === undefined) return localStorage.getItem(`fw-mod-${k}`); localStorage.setItem(`fw-mod-${k}`, String(wert)); } catch (e) { /* privat: dann eben nicht merken */ }
    return null;
  },

  _modLadenDialogHtml() {
    return `<h2>Datei öffnen</h2>
      <label class="ablage klein-ablage" data-ablage="1">
        <input type="file" accept=".stl,.gcode,.3mf" data-mod="datei" hidden>
        <span class="ablage-icon">＋</span><strong>Hierher ziehen oder tippen</strong>
        <span class="leise klein">.stl · .gcode · .gcode.3mf</span>
      </label>
      <button class="knopf leise breit" data-aktion="dialog-zu">Abbrechen</button>`;
  },

  // ---- Einrichtung und Bühne ----
  _modEinrichten() {
    if (this._modBereit) return;
    this._modBereit = true;
    this._modOrbitArt = this._modEinstellung("orbit") === "frei" ? "frei" : "eingeschraenkt";
    this._modWuerfelZiehen = this._modEinstellung("wuerfel-ziehen") !== "0";
    this._modZuletztLaden();
    const root = this.shadowRoot;
    // Eigene Winkel: das zuletzt angetippte Feld bekommt die Schnellknöpfe
    root.addEventListener("focusin", (e) => {
      const t = e.target;
      if (!this._mod || !t.dataset || t.dataset.mod !== "dreh-grad") return;
      this._mod.drehFeld = Number(t.dataset.achse);
      root.querySelectorAll(".mod-dreh-feld").forEach((f, i) => f.classList.toggle("aktiv", i === this._mod.drehFeld));
    });
    root.addEventListener("dragover", (e) => {
      if (this._ansicht !== "modelle") return;
      e.preventDefault();
      const app = root.querySelector(".app");
      if (app) app.classList.add("ziehen");
    });
    root.addEventListener("dragleave", (e) => { if (!e.relatedTarget) { const app = root.querySelector(".app"); if (app) app.classList.remove("ziehen"); } });
    root.addEventListener("drop", (e) => {
      if (this._ansicht !== "modelle") return;
      e.preventDefault();
      const app = root.querySelector(".app");
      if (app) app.classList.remove("ziehen");
      const f = e.dataTransfer && e.dataTransfer.files[0];
      if (f) { this._dialog = null; this._modDatei(f); }
    });
  },

  _modStandard() {
    const rolle = this._daten.rollen.filter((r) => r.rest_g != null).sort((a, b) => b.rest_g - a.rest_g)[0];
    const muster = this._modMusterId || this._modEinstellung("muster");
    return { tab: "uebersicht", fuellung: 15, waende: 2, duese: 0.4, schicht_h: 0.2, stuetzen: "keine", eingesetzt: {}, rolleId: this._modRolleId || (rolle && rolle.id),
      muster: FUELLMUSTER.some((x) => x.id === muster) ? muster : "grid", drehEigen: false, drehWerte: [0, 0, 0], drehFeld: 2 };
  },
  // Speicher für „Zuletzt geöffnet“: auf dem Server, wenn die Integration da ist
  _modSpeicher() {
    return this._konfig && this._hass && this._hass.fetchWithAuth ? modServer(this._hass) : MOD_DB;
  },
  async _modZuletztLaden() {
    this._modZuletztZeit = Date.now();
    const sp = this._modSpeicher();
    try {
      if (sp.aufServer && !this._modUmgezogen) {
        // Einmalig: Modelle, die bisher nur in diesem Browser lagen, auf den Server legen
        this._modUmgezogen = true;
        for (const z of (await MOD_DB.alle()).reverse()) {
          const x = await MOD_DB.holen(z.name);
          if (x) { await sp.speichern(x.name, x.daten); await MOD_DB.loeschen(z.name); }
        }
      }
      this._modZuletzt = await sp.alle();
      this._modZuletztServer = !!sp.aufServer;
    } catch (e) {
      this._modZuletzt = await MOD_DB.alle();   // Server nicht erreichbar: wenigstens die lokalen
      this._modZuletztServer = false;
    }
    if (this._ansicht === "modelle" && !this._mod) this._zeichnen();
  },
  _modRolle() { const m = this._mod; return this._daten.rollen.find((r) => r.id === (m && m.rolleId)) || null; },

  async _modDatei(datei, name) {
    name = name || datei.name;
    const groesse = datei instanceof ArrayBuffer ? datei.byteLength : datei.size;
    if (groesse > MOD_MAX_BYTES) { this._toast(`Die Datei ist mit ${zahl(groesse / 1048576)} MB zu groß (höchstens ${MOD_MAX_BYTES / 1048576} MB).`); return; }
    if (!groesse) { this._toast("Die Datei ist leer."); return; }
    let puffer;
    try { puffer = datei instanceof ArrayBuffer ? datei : await datei.arrayBuffer(); }
    catch (e) { this._toast("Die Datei konnte nicht gelesen werden."); return; }
    this._mod = { ...this._modStandard(), name, laedt: "Lese Datei …" };
    this._zeichnen();
    await new Promise((r) => setTimeout(r, 30));
    try {
      if (/\.stl$/i.test(name)) await this._modStl(puffer, name);
      else if (/\.3mf$/i.test(name)) {
        const zip = await zipDateien(puffer);
        const g = zip.dateien.find((d) => /plate_\d+\.gcode$/i.test(d.name)) || zip.dateien.find((d) => /\.gcode$/i.test(d.name));
        if (!g) throw new Error("In dieser 3MF ist kein G-Code. Bitte in Bambu Studio „Datei › Exportieren › G-Code exportieren“ (.gcode.3mf) benutzen.");
        this._mod.laedt = "Entpacke G-Code …"; this._zeichnen();
        this._modGcode(new TextDecoder().decode(await zip.lesen(g)), name);
      } else if (/\.gcode$/i.test(name)) this._modGcode(new TextDecoder().decode(puffer), name);
      else throw new Error("Unbekanntes Format. Erlaubt sind .stl, .gcode und .gcode.3mf.");
      const sp = this._modSpeicher();
      sp.speichern(name, puffer).catch(() => MOD_DB.speichern(name, puffer)).then(() => this._modZuletztLaden());
    } catch (e) {
      this._mod = null;
      this._toast(e.message || String(e));
      return;
    }
    this._zeichnen();
    if (this._buehne) this._buehne.ansicht("iso", this._mod.grenzen);
  },

  async _modStl(puffer, name) {
    const roh = stlLesen(puffer);
    if (!roh.length) throw new Error("In der STL wurden keine Dreiecke gefunden.");
    if (roh.length / 9 > MOD_MAX_DREIECKE) throw new Error(`Das Modell hat ${zahl(roh.length / 9)} Dreiecke, mehr als ${zahl(MOD_MAX_DREIECKE)} schafft der Browser nicht flüssig. Bitte im Slicer vereinfachen.`);
    if (roh.some((x) => !Number.isFinite(x))) throw new Error("Die STL enthält ungültige Koordinaten (beschädigte Datei).");
    const v = aufsBett(roh);
    const m = this._mod;
    Object.assign(m, { art: "stl", v, laedt: null });
    this._modGeometrieNeu();
  },

  _modGeometrieNeu() {
    const m = this._mod;
    m.grenzen = meshGrenzen(m.v);
    m.kenn = meshKennwerte(m.v);
    m.ueber = ueberhaenge(m.v);
    m.loecher = null; m.eingesetzt = {}; m.lochAuswahl = null;
    m.schichten = null; m.schichtZahl = 0; m.schichtGewicht = null;
    const id = (m.id = (m.id || 0) + 1);
    setTimeout(() => {
      if (this._mod !== m || m.id !== id) return;
      m.loecher = loecherFinden(m.v, m.grenzen);
      if (this._ansicht === "modelle") { if (m.tab === "loecher") this._zeichnen(); else this._modSeiteNeu(); this._modMarker(); }
    }, 50);
    if (this._buehne) this._modSzene();
  },

  _modGcode(text, name) {
    const g = gcodeLesen(text);
    if (!g.schichten.length) throw new Error("Im G-Code wurden keine Druckwege gefunden.");
    const m = this._mod;
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (const s of g.schichten) {
      for (let i = 0; i < s.linien.length; i += 5) {
        if (s.linien[i + 4] === GCODE_ARTEN_NR.turm || s.linien[i + 4] === GCODE_ARTEN_NR.rand) continue;
        for (const [x, y] of [[s.linien[i], s.linien[i + 1]], [s.linien[i + 2], s.linien[i + 3]]]) {
          if (x < min[0]) min[0] = x; if (x > max[0]) max[0] = x; if (y < min[1]) min[1] = y; if (y > max[1]) max[1] = y;
        }
      }
      if (s.z < min[2]) min[2] = 0; if (s.z > max[2]) max[2] = s.z;
    }
    Object.assign(m, { art: "gcode", gcode: g, laedt: null, grenzen: { min, max, groesse: [max[0] - min[0], max[1] - min[1], max[2]] } });
    m.schichtHoehen = g.schichten.map((s) => s.z);
    m.schichtZahl = g.schichten.length;
    m.schichtNr = g.schichten.length;
    if (this._buehne) this._modSzene();
  },

  // Bühne einhängen (das Canvas bleibt beim Neuzeichnen erhalten)
  _modNachZeichnen() {
    const ort = this.shadowRoot.getElementById("mod-buehne");
    if (!ort) return;
    if (!this._buehne) {
      this._buehne = new Buehne();
      if (!this._buehne.ok) { ort.innerHTML = `<div class="dr-kamera-leer">Dieser Browser kann kein WebGL.</div>`; return; }
      this._buehne.nachZeichnen = () => { this._modMarkerSetzen(); this._modWuerfelNachfuehren(); };
      this._buehne.antippen = (strahl) => this._modAntippen(strahl);
      this._buehne.treffen = (strahl) => this._modTreffen(strahl);
      this._buehne.setzeOrbitArt(this._modOrbitArt);
      // Ein Tipp in die Ansicht schließt das Orbit-Menü (ohne Neuzeichnen, sonst ginge das Ziehen verloren)
      this._buehne.canvas.addEventListener("pointerdown", () => this._modMenueZu());
      this._modSzene();
      this._buehne.ansicht("iso", this._mod && this._mod.grenzen);
    }
    ort.appendChild(this._buehne.canvas);
    this._modWuerfelZiehenEinrichten();
    this._modWuerfelNachfuehren();
    if (!this._modRo) {
      this._modRo = new ResizeObserver(() => this._buehne && this._buehne.neu());
    }
    this._modRo.disconnect();
    this._modRo.observe(ort);
    this._modMarker();
    this._buehne.neu();
  },

  _modSzene() {
    const b = this._buehne, m = this._mod;
    if (!b || !m || m.laedt) return;
    for (const n of [...b.objekte.keys()]) if (!n.startsWith("bett")) b.weg(n);
    if (m.art === "stl") {
      const farbe = new Float32Array(m.v.length);
      const ueber = m.tab === "schichten" && m.stuetzen !== "keine" ? m.ueber.markiert : null;
      for (let t = 0; t < m.v.length / 9; t++) {
        const f = ueber && ueber[t] ? [1, 0.45, 0.3] : [0.24, 0.86, 0.64];
        for (let k = 0; k < 9; k += 3) { farbe[t * 9 + k] = f[0]; farbe[t * 9 + k + 1] = f[1]; farbe[t * 9 + k + 2] = f[2]; }
      }
      b.mesh("modell", m.v, farbe);
      this._modGrundriss();
      Object.entries(m.eingesetzt).forEach(([nr, id]) => this._modTeilZeigen(Number(nr), id, false));
      if (m.tab === "schichten") this._modSchichtenStarten();
      if (m.drehWerte && m.drehWerte.some((x) => Number(x))) setTimeout(() => this._modDrehVorschau(), 0);
    } else {
      this._modGcodeLinien();
    }
    this._modSchichtAnzeigen();
  },

  _modGrundriss() {
    const b = this._buehne, g = this._mod.grenzen;
    const zuGross = g.groesse.some((x) => x > BETT_MM + 0.01);
    const f = zuGross ? [1, 0.42, 0.42] : [0.24, 0.9, 0.66];
    const [x1, y1, x2, y2] = [g.min[0], g.min[1], g.max[0], g.max[1]];
    const l = [x1, y1, 0.05, x2, y1, 0.05, x2, y1, 0.05, x2, y2, 0.05, x2, y2, 0.05, x1, y2, 0.05, x1, y2, 0.05, x1, y1, 0.05];
    b.linien("grundriss", new Float32Array(l), new Float32Array(l.map((_, i) => f[i % 3])));
  },

  // ---- Löcher in der Ansicht ----
  _modMarker() {
    const box = this.shadowRoot.getElementById("mod-marker");
    const m = this._mod;
    if (!box || !m || m.art !== "stl" || !m.loecher || m.tab === "schichten") { if (box) box.innerHTML = ""; return; }
    box.innerHTML = m.loecher.map((l) => `<button class="mod-pin ${m.lochAuswahl === l.nr ? "an" : ""} ${m.eingesetzt[l.nr] ? "drin" : ""}" data-aktion="mod-loch" data-nr="${l.nr}" data-pin="${l.nr}">${l.nr}</button>`).join("");
    this._modMarkerSetzen();
  },
  _modMarkerSetzen() {
    const box = this.shadowRoot.getElementById("mod-marker");
    const m = this._mod;
    if (!box || !m || !m.loecher || !this._buehne) return;
    for (const l of m.loecher) {
      const pin = box.querySelector(`[data-pin="${l.nr}"]`);
      if (!pin) continue;
      const p = l.mitte.slice();
      p[l.achse] = l.oeffnung + l.richtung * 0.5;
      const s = this._buehne.projizieren(p);
      if (!s) { pin.style.display = "none"; continue; }
      pin.style.display = "";
      pin.style.transform = `translate(${s[0] - 11}px, ${s[1] - 40}px)`;   // über dem Loch, damit es sichtbar bleibt
    }
  },

  _modTeilZeigen(nr, id, animiert = true) {
    const m = this._mod, b = this._buehne;
    const loch = m.loecher && m.loecher.find((l) => l.nr === nr);
    const teil = this._daten.inventar.find((t) => t.id === id);
    if (!b || !loch || !teil) return;
    const geo = teilGeometrie(teil, loch);
    const name = `teil-${nr}`;
    b.mesh(name, insLoch(geo.v, loch), new Float32Array(geo.farben), { reihe: 2 });
    if (!animiert) return;
    // Von außen entlang der Lochachse hereinfliegen, mit kleinem Nachfedern
    const weg = [0, 0, 0];
    weg[loch.achse] = loch.richtung * 45;
    const start = performance.now(), dauer = 900;
    b.animieren((t) => {
      const x = Math.min(1, (t - start) / dauer);
      const e = 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);   // „easeOutBack“
      const f = 1 - e;
      b.setze(name, { m: M4.verschieben(weg[0] * f, weg[1] * f, weg[2] * f) });
      return x < 1;
    });
  },

  // ---- Schichten: vereinfachtes Slicen im Hintergrund ----
  _modSchichtenStarten() {
    const m = this._mod;
    const schluessel = `${m.duese}|${m.schicht_h}|${m.waende}|${m.fuellung}|${m.muster}|${m.stuetzen}|${m.id}`;
    if (m.schichtSchluessel === schluessel && (m.schichtFortschritt === 1 || m.schichtLaeuft)) { this._modSchichtAnzeigen(); return; }
    m.schichtSchluessel = schluessel;
    m.schichtLaeuft = true;
    m.schichtFortschritt = 0;
    const s = schnittVorbereiten(m.v, 2);
    const hoehe = m.grenzen.max[2];
    const zs = [];
    for (let z = m.schicht_h; z <= hoehe + 1e-6; z += m.schicht_h) zs.push(Math.min(z, hoehe - 0.01) - m.schicht_h / 2);
    const massivUnten = Math.ceil(0.6 / m.schicht_h), massivOben = Math.ceil(0.8 / m.schicht_h);
    const linien = [], farben = [], enden = [];
    let laenge = 0, stuetzLaenge = 0;
    const stuetzen = m.stuetzen !== "keine" ? this._modStuetzen(m) : [];
    let i = 0;
    const schritt = () => {
      if (this._mod !== m || m.schichtSchluessel !== schluessel) return;
      const bis = Math.min(zs.length, i + 8);
      for (; i < bis; i++) {
        const z = zs[i], zz = z + m.schicht_h / 2;
        const sch = schichtBerechnen(s, z, { duese: m.duese, waende: m.waende, fuellung: m.fuellung, muster: m.muster, hoehe, nr: i, massiv: i < massivUnten || i >= zs.length - massivOben });
        const add = (a, b, f) => { linien.push(a[0], a[1], zz, b[0], b[1], zz); farben.push(...f, ...f); return Math.hypot(b[0] - a[0], b[1] - a[1]); };
        for (const [art, zuege] of [["aussen", sch.aussen], ["innen", sch.innen]]) {
          for (const zug of zuege) for (let k = 0; k < zug.length; k++) laenge += add(zug[k], zug[(k + 1) % zug.length], LINIEN_FARBEN[art]);
        }
        for (const [a, b] of sch.fuellung) laenge += add(a, b, LINIEN_FARBEN.fuellung);
        for (const st of stuetzen) for (const [a, b] of st) {
          // Strecke a→b (3D) in dieser Schicht?
          if ((a[2] <= zz && b[2] >= zz) || (b[2] <= zz && a[2] >= zz)) {
            const f = Math.abs(b[2] - a[2]) < 1e-6 ? 0 : (zz - a[2]) / (b[2] - a[2]);
            const x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f;
            const r = st.dicke || 0.6;
            stuetzLaenge += add([x - r, y], [x + r, y], LINIEN_FARBEN.stuetze) + add([x, y - r], [x, y + r], LINIEN_FARBEN.stuetze);
          }
        }
        enden.push(linien.length / 3);
      }
      m.schichtFortschritt = i / zs.length;
      const status = this.shadowRoot.getElementById("mod-schicht-status");
      if (i < zs.length) {
        if (status) status.innerHTML = this._modSchichtStatusHtml();
        setTimeout(schritt, 0);
        return;
      }
      const querschnitt = m.duese * 1.05 * m.schicht_h;
      const dichte = materialInfo(this._modRolle() ? this._modRolle().material : "PLA").dichte;
      Object.assign(m, {
        schichtLaeuft: false, schichtFortschritt: 1, schichtEnden: enden, schichtHoehen: zs.map((z) => z + m.schicht_h / 2),
        schichtZahl: zs.length, schichtNr: Math.min(m.schichtNr || zs.length, zs.length) || zs.length,
        schichtGewicht: ((laenge + stuetzLaenge) * querschnitt * dichte) / 1000, stuetzGewicht: (stuetzLaenge * querschnitt * dichte) / 1000,
        schichtLinien: new Float32Array(linien), schichtFarben: new Float32Array(farben),
      });
      if (this._ansicht === "modelle" && m.tab === "schichten") { this._zeichnen(); this._modSchichtAnzeigen(); }
    };
    setTimeout(schritt, 0);
  },

  // Stützen als 3D-Strecken: Normal = senkrechte Säulen im Raster, Baum = Äste zu Stämmen
  _modStuetzen(m) {
    const v = m.v, ueber = m.ueber.markiert;
    const raster = m.stuetzen === "normal" ? 2.5 : 4;
    const punkte = [];
    const gesehen = new Set();
    for (let t = 0; t < ueber.length && punkte.length < 600; t++) {
      if (!ueber[t]) continue;
      const i = t * 9;
      const xs = [v[i], v[i + 3], v[i + 6]], ys = [v[i + 1], v[i + 4], v[i + 7]];
      for (let x = Math.ceil(Math.min(...xs) / raster) * raster; x <= Math.max(...xs); x += raster) {
        for (let y = Math.ceil(Math.min(...ys) / raster) * raster; y <= Math.max(...ys); y += raster) {
          const k = `${x}|${y}`;
          if (gesehen.has(k)) continue;
          // Punkt im Dreieck? Höhe dort berechnen
          const d = (ys[1] - ys[2]) * (xs[0] - xs[2]) + (xs[2] - xs[1]) * (ys[0] - ys[2]);
          if (Math.abs(d) < 1e-9) continue;
          const l1 = ((ys[1] - ys[2]) * (x - xs[2]) + (xs[2] - xs[1]) * (y - ys[2])) / d, l2 = ((ys[2] - ys[0]) * (x - xs[2]) + (xs[0] - xs[2]) * (y - ys[2])) / d;
          if (l1 < 0 || l2 < 0 || l1 + l2 > 1) continue;
          gesehen.add(k);
          const z = l1 * v[i + 2] + l2 * v[i + 5] + (1 - l1 - l2) * v[i + 8];
          punkte.push([x, y, z, this._modBodenUnter(v, x, y, z)]);
        }
      }
    }
    if (m.stuetzen === "normal") return punkte.map(([x, y, z, boden]) => Object.assign([[[x, y, boden], [x, y, z]]], { dicke: 0.9 }));
    // Bäume: Punkte nach Boden-Höhe und 12-mm-Feldern bündeln, Stamm in der Mitte
    const dicke = m.stuetzen === "baum-stark" ? 1.4 : m.stuetzen === "baum-hybrid" ? 1.1 : 0.8;
    const gruppen = new Map();
    for (const p of punkte) {
      const k = `${Math.round(p[0] / 12)}|${Math.round(p[1] / 12)}|${Math.round(p[3])}`;
      if (!gruppen.has(k)) gruppen.set(k, []);
      gruppen.get(k).push(p);
    }
    const baeume = [];
    for (const g of gruppen.values()) {
      const cx = g.reduce((s, p) => s + p[0], 0) / g.length, cy = g.reduce((s, p) => s + p[1], 0) / g.length;
      const boden = Math.max(...g.map((p) => p[3]));
      const zMin = Math.min(...g.map((p) => p[2]));
      const gabel = boden + (zMin - boden) * 0.55;
      const aeste = g.map((p) => [[cx, cy, gabel], [p[0], p[1], p[2]]]);
      baeume.push(Object.assign([[[cx, cy, boden], [cx, cy, gabel]]], { dicke: dicke * 1.6 }));
      aeste.forEach((a) => baeume.push(Object.assign([a], { dicke })));
    }
    return baeume;
  },
  _modBodenUnter(v, x, y, z) {
    let boden = 0;
    for (let i = 0; i < v.length; i += 9) {
      const ax = v[i], ay = v[i + 1], bx = v[i + 3], by = v[i + 4], cx = v[i + 6], cy = v[i + 7];
      const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
      if (Math.abs(d) < 1e-9) continue;
      const l1 = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / d, l2 = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / d;
      if (l1 < 0 || l2 < 0 || l1 + l2 > 1) continue;
      const h = l1 * v[i + 2] + l2 * v[i + 5] + (1 - l1 - l2) * v[i + 8];
      if (h < z - 0.3 && h > boden) boden = h;
    }
    return boden;
  },

  _modGcodeLinien() {
    const m = this._mod, g = m.gcode;
    const linien = [], farben = [], enden = [];
    for (const s of g.schichten) {
      const l = s.linien;
      for (let i = 0; i < l.length; i += 5) {
        const f = LINIEN_FARBEN[GCODE_ARTEN_LISTE[l[i + 4]]] || [1, 1, 1];
        linien.push(l[i], l[i + 1], s.z, l[i + 2], l[i + 3], s.z);
        farben.push(...f, ...f);
      }
      enden.push(linien.length / 3);
    }
    m.schichtEnden = enden;
    this._buehne.linien("wege", new Float32Array(linien), new Float32Array(farben), { dunkel: 0.55 });
  },

  _modSchichtAnzeigen() {
    const m = this._mod, b = this._buehne;
    if (!b || !m) return;
    const schichten = m.tab === "schichten" || m.art === "gcode";
    const modell = b.objekte.get("modell");
    if (modell) b.setze("modell", schichten ? { sichtbar: true, alpha: 0.08 } : { sichtbar: true, alpha: 1 });
    for (const [n] of b.objekte) if (n.startsWith("teil-")) b.setze(n, { sichtbar: !schichten });
    if (m.art === "stl" && schichten && m.schichtLinien && m.schichtFortschritt === 1) {
      if (!b.objekte.has("wege") || m.schichtWegeSchluessel !== m.schichtSchluessel) {
        b.linien("wege", m.schichtLinien, m.schichtFarben, { dunkel: 0.32 });   // tiefere Schichten deutlich dunkler, damit das Muster der aktuellen hervorsticht
        m.schichtWegeSchluessel = m.schichtSchluessel;
      }
    } else if (m.art === "stl" && !schichten) b.weg("wege");
    if (b.objekte.has("wege") && m.schichtEnden) {
      const nr = Math.max(1, Math.min(m.schichtNr || 1, m.schichtEnden.length));
      b.setze("wege", { bis: m.schichtEnden[nr - 1], hoehe: m.schichtHoehen[nr - 1] });
    }
  },

  _modSeiteNeu() {
    const box = this.shadowRoot.querySelector(".mod-inhalt");
    if (box) { const sc = box.scrollTop; box.innerHTML = this._mod.tab === "loecher" ? this._modLoecherHtml() : this._mod.tab === "schichten" ? this._modSchichtenHtml() : this._modUebersichtHtml(); box.scrollTop = sc; this._auswahlenBauen(); }
    const tab = this.shadowRoot.querySelector('[data-aktion="mod-tab"][data-id="loecher"]');
    if (tab && this._mod.loecher) tab.textContent = `Löcher (${this._mod.loecher.length})`;
  },

  // ---- Ereignisse ----
  _modKlick(a, el) {
    const m = this._mod;
    if (!["mod-orbit-menue", "mod-orbit-art", "mod-wuerfel-ziehen"].includes(a)) this._modMenueZu();
    switch (a) {
      case "mod-ansicht": if (this._buehne) this._buehne.ansicht(el.dataset.id, m && m.grenzen, true); return;
      case "mod-orbit-menue": this._modOrbitMenue = !this._modOrbitMenue; break;
      case "mod-orbit-art":
        this._modOrbitArt = el.dataset.id === "frei" ? "frei" : "eingeschraenkt";
        this._modEinstellung("orbit", this._modOrbitArt);
        if (this._buehne) this._buehne.setzeOrbitArt(this._modOrbitArt);
        this._modOrbitMenue = false;
        this._toast(this._modOrbitArt === "frei" ? "Orbit: frei drehen" : "Eingeschränkter Orbit: oben bleibt oben");
        break;
      case "mod-wuerfel-ziehen":
        this._modWuerfelZiehen = !this._modWuerfelZiehen;
        this._modEinstellung("wuerfel-ziehen", this._modWuerfelZiehen ? "1" : "0");
        break;
      case "mod-wuerfel": {
        if (performance.now() - (this._modWuerfelGezogen || -1e9) < 350 || !this._buehne) return;   // war Ziehen, kein Klick
        const b = this._buehne;
        b.fliegen(el.dataset.d.split(",").map(Number), b.mitte || b.ziel, b.abstand, true);
        return;
      }
      case "mod-dreh-eigen": m.drehEigen = !m.drehEigen; if (!m.drehEigen) { m.drehWerte = [0, 0, 0]; this._modDrehVorschau(); } this._modSeiteNeu(); return;
      case "mod-dreh-plus": {
        const i = m.drehFeld ?? 2;
        m.drehWerte[i] = Math.round(((Number(m.drehWerte[i]) || 0) + Number(el.dataset.g)) * 10) / 10;
        if (m.drehWerte[i] > 360 || m.drehWerte[i] < -360) m.drehWerte[i] %= 360;
        const f = this.shadowRoot.getElementById(`mod-dreh-${i}`);
        if (f) f.value = m.drehWerte[i];
        this._modDrehVorschau();
        return;
      }
      case "mod-dreh-null":
        m.drehWerte = [0, 0, 0];
        [0, 1, 2].forEach((i) => { const f = this.shadowRoot.getElementById(`mod-dreh-${i}`); if (f) f.value = 0; });
        this._modDrehVorschau();
        return;
      case "mod-dreh-anwenden": {
        if (!m.drehWerte.some((x) => Number(x))) { this._toast("Erst einen Winkel eingeben."); return; }
        const text = ["X", "Y", "Z"].map((n, i) => (Number(m.drehWerte[i]) ? `${n} ${zahl(Number(m.drehWerte[i]), 1)}°` : "")).filter(Boolean).join(", ");
        drehenGrad(m.v, m.drehWerte);
        m.drehWerte = [0, 0, 0];
        this._modGeometrieNeu();
        if (this._buehne) this._buehne.ansicht("iso", m.grenzen, true);
        this._toast(`Gedreht um ${text}.`);
        break;
      }
      case "mod-schliessen": this._mod = null; if (this._buehne) for (const n of [...this._buehne.objekte.keys()]) if (!n.startsWith("bett")) this._buehne.weg(n); break;
      case "mod-tab":
        m.tab = el.dataset.id;
        this._zeichnen();
        this._modSzene();
        return;
      case "mod-drehen":
        drehen90(m.v, Number(el.dataset.achse), 1);
        m.drehWerte = [0, 0, 0];
        this._modGeometrieNeu();
        if (this._buehne) this._buehne.ansicht("iso", m.grenzen);
        break;
      case "mod-loch":
        m.tab = "loecher";
        m.lochAuswahl = m.lochAuswahl === Number(el.dataset.nr) ? null : Number(el.dataset.nr);
        this._zeichnen();
        this._modSchichtAnzeigen();
        return;
      case "mod-einsetzen":
        m.eingesetzt[el.dataset.nr] = el.dataset.id;
        this._modTeilZeigen(Number(el.dataset.nr), el.dataset.id, true);
        break;
      case "mod-raus": delete m.eingesetzt[el.dataset.nr]; if (this._buehne) this._buehne.weg(`teil-${el.dataset.nr}`); break;
      case "mod-alle-einsetzen": {
        let verzoegerung = 0;
        for (const l of m.loecher || []) {
          const v = teileFuerLoch(l, this._daten.inventar)[0];
          if (!v || m.eingesetzt[l.nr]) continue;
          m.eingesetzt[l.nr] = v.teil.id;
          setTimeout(() => this._modTeilZeigen(l.nr, v.teil.id, true), verzoegerung);
          verzoegerung += 250;
        }
        break;
      }
      case "mod-alle-raus": Object.keys(m.eingesetzt).forEach((nr) => this._buehne && this._buehne.weg(`teil-${nr}`)); m.eingesetzt = {}; break;
      case "mod-duese": {
        m.duese = Number(el.dataset.id);
        const [lo, hi, std] = SCHICHT_BEREICH[m.duese] || [0.08, 0.28, 0.2];
        if (m.schicht_h < lo || m.schicht_h > hi) m.schicht_h = std;
        this._zeichnen(); this._modSchichtenStarten();
        return;
      }
      case "mod-stuetzen": m.stuetzen = el.dataset.id; this._zeichnen(); this._modSzene(); return;
      case "mod-markieren": m.markieren = !m.markieren; m.tab = "loecher"; break;
      case "mod-loch-art": { const l = m.loecher.find((x) => x.nr === Number(el.dataset.nr)); if (l) { l.durch = el.dataset.durch === "1"; this._modLochGrenzen(l); } this._modSeiteNeu(); return; }
      case "mod-loch-weg": {
        const nr = Number(el.dataset.nr);
        m.loecher = m.loecher.filter((x) => x.nr !== nr);
        delete m.eingesetzt[nr];
        if (this._buehne) this._buehne.weg(`teil-${nr}`);
        m.lochAuswahl = null;
        break;
      }
      case "mod-stuetzen-hilfe": this._dialog = "mod-stuetzen"; break;
      case "mod-schicht": this._modSchichtSetzen((m.schichtNr || 1) + Number(el.dataset.d)); return;
      case "mod-zuletzt":
        (this._modZuletztServer ? this._modSpeicher() : MOD_DB).holen(el.dataset.name)
          .catch(() => null)
          .then((x) => x ? this._modDatei(x.daten, x.name) : this._toast("Datei nicht mehr gespeichert."));
        return;
      case "mod-zuletzt-weg":
        (this._modZuletztServer ? this._modSpeicher() : MOD_DB).loeschen(el.dataset.name).catch(() => {});
        this._modZuletzt = (this._modZuletzt || []).filter((z) => z.name !== el.dataset.name);
        break;
      default: return;
    }
    this._zeichnen();
  },

  // Loch von Hand: Strahl gegen alle Dreiecke (Möller–Trumbore), nächster Treffer zählt
  _modAntippen(strahl) {
    const m = this._mod;
    if (!m || !m.markieren || m.art !== "stl") return;
    const o = strahl.von, d = strahl.richtung;
    const h = strahlTreffer(m.v, o, d);
    const best = h ? h.t : Infinity;
    let n = h ? h.n : null;
    if (!n) { this._toast("Da ist kein Modell. Tippe direkt auf die Oberfläche."); return; }
    const treffer = [0, 1, 2].map((i) => o[i] + d[i] * best);
    // Normale zur Kamera drehen = nach außen; Lochachse = größte Komponente
    if (n[0] * d[0] + n[1] * d[1] + n[2] * d[2] > 0) n = n.map((x) => -x);
    const achse = [0, 1, 2].reduce((a, i) => (Math.abs(n[i]) > Math.abs(n[a]) ? i : a), 0);
    const nr = Math.max(0, ...m.loecher.map((l) => l.nr)) + 1;
    const l = { nr, achse, durchmesser: 4.2, tiefe: 6, durch: false, mitte: treffer, oeffnung: treffer[achse], richtung: Math.sign(n[achse]) || 1, manuell: true };
    this._modLochGrenzen(l);
    m.loecher.push(l);
    m.markieren = false;
    m.lochAuswahl = nr;
    this._zeichnen();
  },
  // Drehpunkt für den Orbit: Abstand entlang des Strahls bis zum Modell oder null
  _modTreffen(strahl) {
    const m = this._mod;
    if (!m || m.art !== "stl" || !m.v || m.laedt) return null;
    const h = strahlTreffer(m.v, strahl.von, strahl.richtung);
    return h ? h.t : null;
  },
  // Vorschau für eigene Winkel: das Modell wird nur in der Ansicht gedreht
  _modDrehVorschau() {
    const m = this._mod, b = this._buehne;
    if (!m || !b || m.art !== "stl") return;
    const aktiv = m.drehWerte && m.drehWerte.some((x) => Number(x));
    const c = [0, 1, 2].map((i) => (m.grenzen.min[i] + m.grenzen.max[i]) / 2);
    const mat = aktiv ? M4.drehungUm(drehMatrix(m.drehWerte), c) : M4.eins();
    b.setze("modell", { m: mat });
    b.setze("grundriss", { sichtbar: !aktiv });
    for (const [n] of b.objekte) if (n.startsWith("teil-")) b.setze(n, { sichtbar: !aktiv && m.tab !== "schichten" });
    const box = this.shadowRoot.getElementById("mod-marker");
    if (box) box.classList.toggle("versteckt", !!aktiv);
  },
  _modLochGrenzen(l) {
    const ende = l.oeffnung - l.richtung * l.tiefe;
    l.von = Math.min(l.oeffnung, ende); l.bis = Math.max(l.oeffnung, ende);
  },

  _modSchichtSetzen(nr) {
    const m = this._mod;
    m.schichtNr = Math.max(1, Math.min(m.schichtZahl || 1, nr));
    const r = this.shadowRoot.querySelector('[data-mod="schicht"]');
    if (r) r.value = m.schichtNr;
    const t = this.shadowRoot.getElementById("mod-schicht-text");
    if (t) t.textContent = this._modSchichtText();
    this._modSchichtAnzeigen();
  },

  _modEingabe(t) {
    const k = t.dataset && t.dataset.mod;
    if (!k || !this._mod) return false;
    const m = this._mod;
    if (k === "schicht") { this._modSchichtSetzen(Number(t.value)); return true; }
    if (k === "dreh-grad") {
      const i = Number(t.dataset.achse), w = Number(String(t.value).replace(",", "."));
      m.drehFeld = i;
      m.drehWerte[i] = Number.isFinite(w) ? Math.max(-360, Math.min(360, w)) : 0;
      this._modDrehVorschau();
      return true;
    }
    if (k === "loch-d" || k === "loch-t") {
      const l = m.loecher && m.loecher.find((x) => x.nr === Number(t.dataset.nr));
      if (!l) return true;
      if (k === "loch-d") l.durchmesser = Number(t.value); else l.tiefe = Number(t.value);
      this._modLochGrenzen(l);
      const w = this.shadowRoot.getElementById(`mod-wert-${k}-${l.nr}`);
      if (w) w.textContent = `${zahl(Number(t.value), 2)} mm`;
      return true;
    }
    if (["fuellung", "waende", "schicht_h"].includes(k)) {
      m[k] = Number(t.value);
      const w = this.shadowRoot.getElementById(`mod-wert-${k}`);
      if (w) w.textContent = `${zahl(m[k], k === "schicht_h" ? 2 : 0)}${k === "fuellung" ? " %" : k === "schicht_h" ? " mm" : ""}`;
      const g = this.shadowRoot.getElementById("mod-gewicht");
      if (g && m.art === "stl") {
        const rolle = this._modRolle();
        const gew = gewichtSchaetzen(m.kenn, materialInfo(rolle ? rolle.material : "PLA").dichte, { duese: m.duese, waende: m.waende, fuellung: m.fuellung });
        g.innerHTML = this._modGewichtHtml(gew, rolle && rolle.rest_g != null ? rolle.rest_g - gew.gramm : null, rolle);
      }
      return true;
    }
    return false;
  },

  _modAenderung(t) {
    const k = t.dataset && t.dataset.mod;
    if (!k) return false;
    if (k === "datei") { const f = t.files && t.files[0]; this._dialog = null; if (f) this._modDatei(f); return true; }
    const m = this._mod;
    if (!m) return false;
    if (k === "rolle") { m.rolleId = this._modRolleId = t.value; this._zeichnen(); return true; }
    if (k === "dreh-grad") return true;
    if (k === "muster") {
      if (!FUELLMUSTER.some((x) => x.id === t.value)) return true;
      m.muster = this._modMusterId = t.value;
      this._modEinstellung("muster", t.value);
      this._modSeiteNeu();
      if (m.art === "stl" && m.tab === "schichten") this._modSchichtenStarten();
      return true;
    }
    if (k === "loch-d" || k === "loch-t") {
      const nr = Number(t.dataset.nr);
      if (m.eingesetzt[nr]) this._modTeilZeigen(nr, m.eingesetzt[nr], false);
      this._modSeiteNeu();
      return true;
    }
    if (["fuellung", "waende", "schicht_h"].includes(k) && m.tab === "schichten" && m.art === "stl") { this._modSchichtenStarten(); this._modSeiteNeu(); return true; }
    return ["fuellung", "waende", "schicht_h", "schicht"].includes(k);
  },
};
