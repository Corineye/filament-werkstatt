// ---------------------------------------------------------------------------
// Drucker: Live-Ansicht des Bambu Lab P1S und der Steckdose aus Home Assistant,
// Titelbild des Drucks, Steuerung, Raumklima, Stromdiagramme und Druckverlauf
// (Liste „3D-Drucke“, von der Automation befüllt)
// ---------------------------------------------------------------------------

const DR_GERAET = "3D-Drucker P1S";
const DR_STECKDOSE = "3d-Drucker";
const DR_LISTE = "todo.3d_drucke";

// Anzeigename in Home Assistant → vermutete Entity-ID (Rückfall, falls der Name anders lautet)
const DR_ENTITAETEN = {
  status: ["Druckstatus", "sensor.p1s_01p00c572701906_druckstatus"],
  schritt: ["Aktueller Arbeitsschritt", "sensor.p1s_01p00c572701906_aktueller_arbeitsschritt"],
  name: ["Name der Aufgabe", "sensor.p1s_01p00c572701906_name_der_aufgabe"],
  fortschritt: ["Druckfortschritt", "sensor.p1s_01p00c572701906_druckfortschritt"],
  schicht: ["Aktuelle Schicht", "sensor.p1s_01p00c572701906_aktuelle_schicht"],
  schichten: ["Gesamtzahl der Schichten", "sensor.p1s_01p00c572701906_gesamtzahl_der_schichten"],
  rest_h: ["Verbleibende Zeit", "sensor.p1s_01p00c572701906_verbleibende_zeit"],
  start: ["Startzeit", "sensor.p1s_01p00c572701906_startzeit"],
  ende: ["Endzeit", "sensor.p1s_01p00c572701906_endzeit"],
  gewicht: ["Gewicht des Drucks", "sensor.p1s_01p00c572701906_gewicht_des_drucks"],
  laenge: ["Drucklänge", "sensor.p1s_01p00c572701906_drucklange"],
  duese: ["Temperatur der Düse", "sensor.p1s_01p00c572701906_temperatur_der_duse"],
  duese_ziel: ["Zieltemperatur der Düse", "sensor.p1s_01p00c572701906_zieltemperatur_der_duse"],
  bett: ["Druckbetttemperatur", "sensor.p1s_01p00c572701906_druckbetttemperatur"],
  bett_ziel: ["Zieltemperatur vom Druckbett", "sensor.p1s_01p00c572701906_zieltemperatur_vom_druckbett"],
  l_bauteil: ["Bauteillüfterdrehzahl", "sensor.p1s_01p00c572701906_bauteillufterdrehzahl"],
  l_kopf: ["Druckkopflüfterdrehzahl", "sensor.p1s_01p00c572701906_druckkopflufterdrehzahl"],
  l_raum: ["Druckraumlüfterdrehzahl", "sensor.p1s_01p00c572701906_druckraumlufterdrehzahl"],
  l_hotend: ["Hotendlüfterdrehzahl", "sensor.p1s_01p00c572701906_hotendlufterdrehzahl"],
  duese_mm: ["Düsengröße", "sensor.p1s_01p00c572701906_dusengrosse"],
  duese_typ: ["Düsentyp", "sensor.p1s_01p00c572701906_dusentyp"],
  platte: ["Druckbett Typ", "sensor.p1s_01p00c572701906_druckbett_typ"],
  stunden: ["Gesamtnutzung", "sensor.p1s_01p00c572701906_gesamtnutzung"],
  wlan: ["Wi-Fi-Signalqualität", "sensor.p1s_01p00c572701906_wi_fi_signalqualitat"],
  tempo: ["Geschwindigkeitsprofil", "sensor.p1s_01p00c572701906_geschwindigkeitsprofil"],
  online: ["Online", "binary_sensor.p1s_01p00c572701906_online"],
  hms: ["HMS-Fehler", "binary_sensor.p1s_01p00c572701906_hms_fehler"],
  fehler: ["Druckfehler", "binary_sensor.p1s_01p00c572701906_druckfehler"],
  firmware: ["Firmware Status", "binary_sensor.p1s_01p00c572701906_firmware_status"],
  filament: ["Extruder Filament Status", "binary_sensor.p1s_01p00c572701906_extruder_filament_status"],
  licht: ["Druckraumbeleuchtung", "light.p1s_01p00c572701906_druckraumbeleuchtung"],
  kamera: ["Kamera", "camera.p1s_01p00c572701906_kamera"],
  titelbild: ["Titelbild", "image.p1s_01p00c572701906_titelbild"],
  // Zum Einstellen (ha-bambulab: number.target_*_temperature, fan.*_fan). Mehrere Namen/IDs je nach Version.
  duese_soll: ["Zieltemperatur der Düse", "number.p1s_01p00c572701906_zieltemperatur_der_duse"],
  bett_soll: [["Zieltemperatur des Druckbett", "Zieltemperatur vom Druckbett", "Zieltemperatur des Druckbetts"],
    "number.p1s_01p00c572701906_zieltemperatur_des_druckbett", "number.p1s_01p00c572701906_zieltemperatur_vom_druckbett"],
  f_kopf: ["Druckkopflüfter", "fan.p1s_01p00c572701906_druckkopflufter"],
  f_bauteil: ["Bauteillüfter", "fan.p1s_01p00c572701906_bauteillufter"],
  f_raum: ["Druckraumlüfter", "fan.p1s_01p00c572701906_druckraumlufter"],
  // Steuerung (ha-bambulab: button.pause/resume/stop, select.printing_speed)
  pause: [["Druck pausieren", "Pause"], "button.p1s_01p00c572701906_druck_pausieren", "button.p1s_01p00c572701906_pause"],
  fortsetzen: [["Druck fortsetzen", "Fortsetzen"], "button.p1s_01p00c572701906_druck_fortsetzen", "button.p1s_01p00c572701906_fortsetzen"],
  stopp: [["Druck stoppen", "Stopp", "Stop"], "button.p1s_01p00c572701906_druck_stoppen", "button.p1s_01p00c572701906_stopp"],
  tempo_wahl: [["Druckgeschwindigkeit", "Geschwindigkeit"], "select.p1s_01p00c572701906_druckgeschwindigkeit"],
};
const DR_STECKDOSE_ENTITAETEN = {
  schalter: ["", "switch.3d_drucker"],
  watt: ["Derzeitiger Verbrauch", "sensor.3d_drucker_derzeitiger_verbrauch"],
  heute: ["Heutiger Verbrauch", "sensor.3d_drucker_heutiger_verbrauch"],
  monat: ["Der Verbrauch dieses Monats", "sensor.3d_drucker_der_verbrauch_dieses_monats"],
};

const DR_STATUS = {
  idle: ["Bereit", "leise"], running: ["Druckt", "mint"], pause: ["Pausiert", "amber"], prepare: ["Bereitet vor", "mint"],
  slicing: ["Bereitet vor", "mint"], finish: ["Fertig", "mint"], failed: ["Fehlgeschlagen", "rot"], offline: ["Offline", "leise"],
};
const DR_SCHRITTE = {
  printing: "Druckt", idle: "Bereit", heatbed_preheating: "Heizt das Druckbett vor", heating_hotend: "Heizt die Düse auf",
  auto_bed_leveling: "Druckbett vermessen", scanning_bed_surface: "Druckbett scannen", homing_toolhead: "Druckkopf fährt in Grundstellung",
  cleaning_nozzle_tip: "Reinigt die Düsenspitze", checking_extruder_temperature: "Prüft die Düsentemperatur",
  calibrating_extrusion: "Kalibriert den Fluss", calibrating_extrusion_flow: "Kalibriert den Fluss", calibrating_motor_noise: "Kalibriert die Motoren",
  calibrating_micro_lidar: "Kalibriert den Lidar", inspecting_first_layer: "Prüft die erste Schicht", identifying_build_plate_type: "Erkennt die Druckplatte",
  changing_filament: "Filamentwechsel", filament_loading: "Lädt Filament", filament_unloading: "Entlädt Filament",
  paused_user: "Von dir pausiert", paused_filament_runout: "Pause: Filament leer", paused_front_cover_falling: "Pause: Frontabdeckung",
  paused_nozzle_temperature_malfunction: "Pause: Problem mit der Düsentemperatur", paused_heat_bed_temperature_malfunction: "Pause: Problem mit der Betttemperatur",
  paused_skipped_step: "Pause: Schrittverlust", paused_first_layer_error: "Pause: Fehler in der ersten Schicht", m400_pause: "Pause per G-Code",
};
const DR_PLATTEN = { textured_plate: "Textured PEI Plate", cool_plate: "Cool Plate/PLA Plate", engineering_plate: "Engineering Plate",
  hot_plate: "Smooth PEI Plate / High Temp Plate", supertack_plate: "Bambu Cool Plate SuperTack" };
const DR_DUESEN = { hardened_steel: "Gehärteter Stahl", stainless_steel: "Edelstahl" };

// Zieltemperaturen, die man hier setzen darf (number.set_value). ziel = Sensor mit dem aktuellen Ziel,
// rolle = Feld der geladenen Rolle für den Schnellknopf, heiss = ab hier nachfragen
const DR_TEMP = {
  duese: { name: "Düse", max: 300, ziel: "duese_ziel", ist: "duese", rolle: "duese", heiss: 270 },
  bett: { name: "Druckbett", max: 110, ziel: "bett_ziel", ist: "bett", rolle: "bett", heiss: 90 },
};
// Lüfter-Kachel (Drehzahl-Sensor) → einstellbarer Lüfter (fan.set_percentage / fan.turn_off)
const DR_LUEFTER = {
  l_kopf: { f: "f_kopf", name: "Druckkopflüfter", info: "Kühlt das frisch gedruckte Filament direkt an der Düse." },
  l_bauteil: { f: "f_bauteil", name: "Bauteillüfter", info: "Großer Lüfter an der Seite, kühlt das ganze Bauteil." },
  l_raum: { f: "f_raum", name: "Druckraumlüfter", info: "Zieht warme Luft aus dem Druckraum. Bei ASA/ABS lieber aus lassen." },
};
const DR_LUEFTER_STUFEN = [0, 10, 30, 50, 80, 100];
// Zustände, in denen ein Druck läuft (auch pausiert oder in Vorbereitung)
const DR_DRUCKT = ["running", "pause", "prepare", "slicing"];
// Geschwindigkeitsstufen des P1S (select.printing_speed)
const DR_TEMPO = [["silent", "Leise", "50 %"], ["standard", "Standard", "100 %"], ["sport", "Sport", "124 %"], ["ludicrous", "Ludicrous", "166 %"]];
// Symbole der Steuerknöpfe (SVG, weil ⏸/▶ je nach Schrift unterschiedlich aussehen)
const DR_ICONS = {
  pause: `<svg viewBox="0 0 16 16" width="14" height="14"><rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor"/><rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor"/></svg>`,
  fortsetzen: `<svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 2.2v11.6c0 .6.7 1 1.2.6l8.6-5.8c.5-.3.5-1 0-1.3L5.2 1.6C4.7 1.2 4 1.6 4 2.2z" fill="currentColor"/></svg>`,
  stopp: `<svg viewBox="0 0 16 16" width="14" height="14"><rect x="2.5" y="2.5" width="11" height="11" rx="2" fill="currentColor"/></svg>`,
};
// Raumklima: Sensoren aus der Einrichtung, sonst diese
const DR_RAUM_TEMP = "sensor.luft_sensor_arbeitszimmer_temperatur";
const DR_RAUM_FEUCHTE = "sensor.luft_sensor_arbeitszimmer_luftfeuchtigkeit";
// Materialien: verziehen sich bei Kälte/Zugluft bzw. ziehen Wasser
const DR_WARP = /^(ASA|ABS|PC|PA)\b/i;
const DR_DAEMPFE = /^(ASA|ABS)\b/i;
const DR_HYGRO = /^(PETG|TPU|PA|PVA)\b/i;
// Stromdiagramme: Zeitraum → Dauer, Anzahl Abschnitte der Leistungskurve, Zeitraster der Energie
const DR_STROM_BEREICHE = {
  "24h": { name: "24 h", ms: 24 * 3600e3, stuecke: 144, periode: "hour" },
  "7d": { name: "7 Tage", ms: 7 * 86400e3, stuecke: 168, periode: "day" },
  "30d": { name: "30 Tage", ms: 30 * 86400e3, stuecke: 180, periode: "day" },
};

// Beschreibung eines Druckeintrags „schluessel=wert; …“ lesen
function druckDaten(eintrag) {
  const d = {};
  String(eintrag.description || "").split(/[;\n]/).forEach((teil) => {
    const i = teil.indexOf("=");
    if (i > 0) d[teil.slice(0, i).trim()] = teil.slice(i + 1).trim();
  });
  const [name, zeit] = String(eintrag.summary || "").split(" · ");
  const num = (v) => (v == null || v === "" || isNaN(Number(v)) ? null : Number(v));
  return {
    uid: eintrag.uid || eintrag.summary, titel: eintrag.summary, name: name || "Druck", zeit: zeit || "",
    gewicht: num(d.gewicht_g), laenge: num(d.laenge_m), duese_c: num(d.duese_c), bett_c: num(d.bett_c), duese_mm: num(d.duese_mm),
    start: d.start && d.start !== "unknown" ? d.start : null, ende: d.ende || null, status: d.status || "laeuft", fortschritt: num(d.fortschritt),
    erledigt: eintrag.status === "completed",
  };
}

// Dateiname des Endfotos wie in der Automation: Startzeit (Ortszeit) als JJJJ-MM-TT_HH-MM
function fotoName(druck) {
  const t = druck.start ? new Date(druck.start) : null;
  if (!t || isNaN(t)) return null;
  const p = (n) => String(n).padStart(2, "0");
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}_${p(t.getHours())}-${p(t.getMinutes())}`;
}

// Schöne obere Grenze für eine Diagrammachse (1, 2, 2,5, 5 × 10^n)
function drGrenze(v) {
  if (!(v > 0)) return 1;
  const e = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / e;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e;
}

function ringSvg(prozent, farbe = "var(--mint)") {
  const r = 52, u = 2 * Math.PI * r, p = Math.max(0, Math.min(100, prozent || 0));
  return `<svg viewBox="0 0 120 120" class="ring" aria-hidden="true">
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="9"/>
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="${farbe}" stroke-width="9" stroke-linecap="round"
      stroke-dasharray="${(u * p) / 100} ${u}" transform="rotate(-90 60 60)" style="filter: drop-shadow(0 0 6px ${farbe})"/>
  </svg>`;
}

const DruckerAnsicht = {
  // Entität finden: zuerst über den Anzeigenamen, sonst über die vermutete ID
  _drId(schluessel, steckdose = false) {
    const states = (this._hass && this._hass.states) || {};
    if (this._drCache !== states) {
      this._drCache = states;
      this._drNamen = {};
      for (const [id, s] of Object.entries(states)) {
        const n = s.attributes && s.attributes.friendly_name;
        if (n) this._drNamen[`${id.split(".")[0]}|${n}`] = id;
      }
      this._drIds = {};
    }
    const k = (steckdose ? "s:" : "") + schluessel;
    if (k in this._drIds) return this._drIds[k];
    // Zuerst, was die Integration bei der Einrichtung gefunden hat
    const konf = this._konfig && this._konfig[steckdose ? "steckdose" : "drucker"];
    if (konf && konf[schluessel] && states[konf[schluessel]]) return (this._drIds[k] = konf[schluessel]);
    const [namen, ...ids] = (steckdose ? DR_STECKDOSE_ENTITAETEN : DR_ENTITAETEN)[schluessel];
    const domain = ids[0].split(".")[0];
    const gefunden = [].concat(namen).map((name) => this._drNamen[`${domain}|${steckdose ? (name ? `${DR_STECKDOSE} ${name}` : DR_STECKDOSE) : `${DR_GERAET} ${name}`}`]).find(Boolean)
      || ids.find((id) => states[id]) || null;
    this._drIds[k] = gefunden;
    return gefunden;
  },
  _drListe() { return (this._konfig && this._konfig.liste) || DR_LISTE; },
  _drSteckdoseName() { return (this._konfig && this._konfig.steckdose_name) || DR_STECKDOSE; },
  _drS(schluessel, steckdose = false) {
    const id = this._drId(schluessel, steckdose);
    return id ? this._hass.states[id] : null;
  },
  _drW(schluessel, steckdose = false) {
    const s = this._drS(schluessel, steckdose);
    return s && !["unknown", "unavailable", ""].includes(s.state) ? s.state : null;
  },
  _drZ(schluessel, steckdose = false) {
    const w = this._drW(schluessel, steckdose);
    return w == null || isNaN(Number(w)) ? null : Number(w);
  },

  // Zustand: aus (Steckdose), startet (Steckdose an, Drucker noch nicht online), bereit, druckt …
  _drZustand() {
    const steckdose = this._drW("schalter", true);
    const online = this._drW("online") === "on";
    if (steckdose === "off") return "aus";
    if (!online) return steckdose === "on" ? "startet" : "offline";
    return this._drW("status") || "idle";
  },

  // Bei jeder Änderung in Home Assistant höchstens einmal pro Sekunde neu zeichnen
  _drHassNeu() {
    if (this._ansicht !== "drucker" || this._modus || this._dialog || this._ddOffen) return;
    if (this._drTimer) return;
    this._drTimer = setTimeout(() => { this._drTimer = null; this._drLiveZeichnen(); }, 1000);
  },
  _drLiveZeichnen() {
    if (this._ansicht !== "drucker") return;
    const live = this.shadowRoot.getElementById("dr-live");
    const kopf = this.shadowRoot.getElementById("dr-live-kopf");
    if (!live || !kopf) return;
    // Während jemand eine Zieltemperatur tippt, nicht dazwischenfunken
    const aktiv = this.shadowRoot.activeElement;
    if (aktiv && aktiv.dataset && aktiv.dataset.drTemp != null && live.contains(aktiv)) { this._drHassNeu(); return; }
    const zustand = this._drZustand();
    if (zustand !== this._drLetzterZustand) { this._zeichnen(); return; }   // z. B. eingeschaltet: alles neu
    kopf.innerHTML = this._drLiveHtml("kopf");
    live.innerHTML = this._drLiveHtml("rest");
    // Rechte Spalte nur tauschen, wenn sich etwas geändert hat (Bild soll nicht neu laden)
    for (const [id, html] of [["dr-bild-karte", this._drBildHtml(zustand)], ["dr-raum", this._drRaumHtml()]]) {
      const x = this.shadowRoot.getElementById(id);
      if (x && this._drRechts[id] !== html) { x.innerHTML = html; this._drRechts[id] = html; }
    }
  },

  _drHtml() {
    if (!this._drVerlauf && !this._drVerlaufLaedt) this._drVerlaufLaden();
    const zustand = this._drZustand();
    this._drLetzterZustand = zustand;
    const bild = this._drBildHtml(zustand), raum = this._drRaumHtml();
    this._drRechts = { "dr-bild-karte": bild, "dr-raum": raum };
    return `<div class="dr-raster">
        <div class="dr-spalte">
          <section id="dr-live-kopf" class="dr-live">${this._drLiveHtml("kopf")}</section>
          ${this._drFilamentHtml()}
          <section id="dr-live" class="dr-live">${this._drLiveHtml("rest")}</section>
        </div>
        <div class="dr-spalte">
          <section id="dr-bild-karte">${bild}</section>
          <section id="dr-raum">${raum}</section>
          ${this._drVerlaufHtml()}
        </div>
      </div>`;
  },

  _drLiveHtml(teil) {
    const zustand = this._drZustand();
    const z = (k, nk = 0) => { const v = this._drZ(k); return v == null ? "–" : zahl(v, nk); };
    if (teil === "kopf") return this._drKopfHtml(zustand, z);
    return this._drWerteHtml(zustand);
  },

  // Statuskarte oben (Ring, Name, Zeitleiste) bzw. „Drucker ist aus“, darunter die Steuerung
  _drKopfHtml(zustand, z) {
    let html = "";
    const warnung = (() => { try { return this._druckWarnung(); } catch (e) { console.warn("Filament-Werkstatt:", e); return null; } })();
    if (warnung) html += `<div class="hinweis rot-hinweis dr-druck-warnung" role="alert"><strong>⚠️ Filament reicht nicht</strong><span>${esc(warnung.text)}</span></div>`;

    if (zustand === "aus" || zustand === "startet" || zustand === "offline") {
      const text = zustand === "aus" ? ["Drucker ist aus", "Die Steckdose ist ausgeschaltet. Schalte sie ein, dann erscheinen hier nach etwa 15–30 Sekunden die Werte."]
        : zustand === "startet" ? ["Drucker startet …", "Die Steckdose ist an. Der Drucker meldet sich meist nach 15–30 Sekunden. Bis dahin sind die Werte vom letzten Druck."]
        : ["Drucker nicht erreichbar", "Home Assistant bekommt gerade keine Werte vom Drucker (Bambu-Cloud oder WLAN)."];
      html += `<div class="dr-karte dr-aus"><div class="dr-aus-icon">${zustand === "startet" ? '<span class="dreher"></span>' : "⏻"}</div>
        <div><h2>${text[0]}</h2><p class="leise">${text[1]}</p>
          ${zustand === "aus" && this._drId("schalter", true) ? this._drSchaltKnopf("an") : ""}</div></div>`;
    } else {
      const [statusText, statusFarbe] = DR_STATUS[zustand] || [zustand, "leise"];
      const schritt = this._drW("schritt");
      const druckt = DR_DRUCKT.includes(zustand);
      const fortschritt = this._drZ("fortschritt") || 0;
      const name = this._drW("name");
      const tempo = DR_TEMPO.find(([k]) => k === (this._drW("tempo_wahl") || this._drW("tempo")));
      const laenge = this._drZ("laenge");
      html += `<div class="dr-karte dr-status">
        <div class="dr-ring">${ringSvg(druckt || zustand === "finish" ? fortschritt : 0, statusFarbe === "rot" ? "var(--rot)" : statusFarbe === "amber" ? "var(--amber)" : "var(--mint)")}
          <div class="dr-ring-text"><strong>${druckt || zustand === "finish" ? `${zahl(fortschritt)} %` : "–"}</strong><span>${druckt ? `Schicht ${z("schicht")}/${z("schichten")}` : ""}</span></div></div>
        <div class="dr-status-text">
          <span class="pille ${statusFarbe}">${statusText}</span>
          <h2>${druckt || zustand === "finish" || zustand === "failed" ? esc(name || "Druck") : "Bereit zum Drucken"}</h2>
          ${schritt && schritt !== "idle" && schritt !== "printing" ? `<p class="leise">${esc(DR_SCHRITTE[schritt] || schritt.replace(/_/g, " "))}</p>` : ""}
          ${druckt ? `<div class="dr-werte"><div><span>Gewicht</span><strong>${z("gewicht", 1)} g</strong></div>
            <div><span>Länge</span><strong>${laenge == null ? "–" : `${zahl(laenge, 1)} m`}</strong></div>
            <div><span>Tempo</span><strong>${tempo ? tempo[1] : "–"}</strong></div></div>` : ""}
        </div>
        ${druckt ? this._drZeitleisteHtml(zustand, fortschritt) : ""}
      </div>`;
      if (this._drW("hms") === "on" || this._drW("fehler") === "on") {
        html += `<div class="hinweis rot-hinweis">⚠️ Der Drucker meldet einen Fehler. Details stehen in der Bambu-App bzw. am Drucker.</div>`;
      }
      html += this._drSteuerHtml(zustand);
    }
    return html;
  },

  // Restzeit in Stunden (ha-bambulab liefert Stunden oder Minuten, je nach Einheit)
  _drRestH() {
    const v = this._drZ("rest_h");
    if (v == null) return null;
    const s = this._drS("rest_h");
    const e = ((s && s.attributes && s.attributes.unit_of_measurement) || "h").toLowerCase();
    return e.startsWith("min") ? v / 60 : e === "s" ? v / 3600 : e === "d" ? v * 24 : v;
  },

  // Zeitleiste: Schicht x von y, Fortschritt, Restzeit, „fertig um“
  _drZeitleisteHtml(zustand, fortschritt) {
    const uhr = (t) => t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    const restH = this._drRestH();
    const endeW = this._drW("ende"), startW = this._drW("start");
    let ende = endeW && !isNaN(new Date(endeW)) ? new Date(endeW) : null;
    if (!ende && restH != null) ende = new Date(Date.now() + restH * 3600e3);
    const start = startW && !isNaN(new Date(startW)) ? new Date(startW) : null;
    const tagText = (t) => { const h = new Date(); h.setHours(0, 0, 0, 0); const d = Math.round((new Date(t).setHours(0, 0, 0, 0) - h) / 86400e3); return d === 0 ? "" : d === 1 ? "morgen " : `${t.toLocaleDateString("de-DE", { weekday: "short" })} `; };
    const restText = restH == null ? "–" : restH >= 1 ? `${Math.floor(restH)} h ${Math.round((restH % 1) * 60)} min` : `${Math.max(0, Math.round(restH * 60))} min`;
    const schicht = this._drZ("schicht"), schichten = this._drZ("schichten");
    const p = Math.max(0, Math.min(100, fortschritt));
    const pause = zustand === "pause";
    return `<div class="dr-zeitleiste ${pause ? "pausiert" : ""}">
      <div class="dr-zl-kopf"><span>${schicht != null && schichten ? `Schicht <strong>${zahl(schicht)}</strong> von ${zahl(schichten)}` : "Schicht –"}</span>
        <span>${pause ? `<span class="amber">⏸ pausiert</span>` : `noch <strong>${restText}</strong>`}</span></div>
      <div class="dr-zl-balken" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${zahl(p)}" aria-label="Druckfortschritt">
        <i style="width:${p}%"></i>${schichten ? `<b style="width:${Math.max(0, Math.min(100, ((schicht || 0) / schichten) * 100))}%"></b>` : ""}</div>
      <div class="dr-zl-fuss"><span>${start ? `Start ${tagText(start)}${uhr(start)}` : ""}</span>
        <span class="dr-zl-ende">fertig um <strong>${ende ? `${tagText(ende)}${uhr(ende)}` : "–"}</strong></span></div>
    </div>`;
  },

  // Temperaturen, Lüfter, Strom, Infos
  _drWerteHtml(zustand) {
    let html = "";
    const aus = ["aus", "startet", "offline"].includes(zustand);
    // Temperaturen
    const temp = (titel, k, ist, ziel) => {
      const max = DR_TEMP[k].max;
      const i = this._drZ(ist), s = this._drZ(`${k}_soll`) != null ? this._drZ(`${k}_soll`) : this._drZ(ziel);   // einstellbare Entität zuerst
      const heizt = s && i != null && Math.abs(s - i) > 3;
      const breite = Math.max(0, Math.min(100, ((i || 0) / max) * 100));
      return `<div class="dr-temp">
        <div class="dr-temp-kopf"><span>${titel}</span><strong>${i == null ? "–" : zahl(i)} °C</strong></div>
        <div class="dr-balken"><i style="width:${breite}%;background-size:${breite > 0 ? 10000 / breite : 100}% 100%"></i>${s ? `<b style="left:${Math.min(100, (s / max) * 100)}%"></b>` : ""}</div>
        <div class="dr-temp-fuss"><small class="${heizt ? "amber" : "leise"}">${s ? `Ziel ${zahl(s)} °C${heizt ? (s > i ? " · heizt auf" : " · kühlt ab") : " · erreicht"}` : "aus"}</small>
          ${this._drSollHtml(k, s)}</div>
      </div>`;
    };
    if (!aus) html += `<div class="dr-karte"><h3 class="dr-titel">🌡️ Temperaturen</h3>
      ${temp("Düse", "duese", "duese", "duese_ziel")}${temp("Druckbett", "bett", "bett", "bett_ziel")}</div>`;

    // Lüfter
    const luefter = [["Bauteil", "l_bauteil"], ["Druckkopf", "l_kopf"], ["Hotend", "l_hotend"], ["Druckraum", "l_raum"]].filter(([, k]) => this._drId(k));
    if (luefter.length && !aus) {
      const steuerbar = luefter.some(([, k]) => DR_LUEFTER[k] && this._drId(DR_LUEFTER[k].f));
      html += `<div class="dr-karte"><h3 class="dr-titel">🌀 Lüfter${steuerbar ? `<span class="leise klein dr-titel-zusatz">zum Einstellen antippen</span>` : ""}</h3><div class="dr-luefter">${luefter.map(([n, k]) => {
        const f = DR_LUEFTER[k] && this._drId(DR_LUEFTER[k].f) ? DR_LUEFTER[k].f : null;
        const v = this._drLuefterWert(k) || 0;
        const inhalt = `<span class="dr-l-icon ${v > 0 ? "dreht" : ""}" style="--dauer:${v > 0 ? Math.max(0.25, 2 - v / 60) : 0}s">✣</span><strong>${zahl(v)} %</strong><small>${n}</small>`;
        return f ? `<button class="dr-l dr-l-knopf" data-aktion="dr-luefter" data-k="${k}" aria-label="${esc(DR_LUEFTER[k].name)} einstellen, jetzt ${zahl(v)} %">${inhalt}<i class="dr-l-stift" aria-hidden="true">✎</i></button>`
          : `<div class="dr-l" title="Regelt der Drucker selbst">${inhalt}</div>`;
      }).join("")}</div></div>`;
    }

    // Strom aus der Steckdose
    const w = this._drZ("watt", true);
    const diagramme = this._drId("watt", true) || this._drId("heute", true) || this._drId("monat", true);
    html += `<div class="dr-karte"><h3 class="dr-titel">⚡ Strom${diagramme ? `<span class="leise klein dr-titel-zusatz">für Diagramme antippen</span>` : ""}</h3>
      <${diagramme ? `button class="dr-werte dr-werte-3 dr-strom-knopf" data-aktion="dr-strom" aria-label="Stromverbrauch als Diagramm zeigen"` : `div class="dr-werte dr-werte-3"`}>
      <div><span>Jetzt</span><strong>${w == null ? "–" : `${zahl(w, w < 10 ? 1 : 0)} W`}</strong></div>
      <div><span>Heute</span><strong>${this._drZ("heute", true) == null ? "–" : `${zahl(this._drZ("heute", true), 2)} kWh`}</strong></div>
      <div><span>Diesen Monat</span><strong>${this._drZ("monat", true) == null ? "–" : `${zahl(this._drZ("monat", true), 2)} kWh`}</strong></div>
    </${diagramme ? "button" : "div"}><div class="dr-steckdose"><span class="leise klein">Steckdose: ${this._drW("schalter", true) === "on" ? "an" : this._drW("schalter", true) === "off" ? "aus" : "nicht gefunden"}</span>
      ${this._drId("schalter", true) ? this._drSchaltKnopf(this._drW("schalter", true) === "on" ? "aus" : "an") : ""}</div></div>`;

    // Drucker-Infos
    const wlan = this._drZ("wlan");
    const wlanText = wlan == null ? "–" : `${wlan >= -60 ? "sehr gut" : wlan >= -70 ? "gut" : wlan >= -80 ? "mäßig" : "schwach"} (${zahl(wlan)} dBm)`;
    const info = [
      ["Düse", `${this._drW("duese_mm") ? `${zahl(Number(this._drW("duese_mm")), 1)} mm` : "–"} · ${DR_DUESEN[this._drW("duese_typ")] || this._drW("duese_typ") || "–"}`],
      ["Druckplatte", DR_PLATTEN[this._drW("platte")] || this._drW("platte") || "–"],
      ["Filament im Extruder", this._drW("filament") === "on" ? "eingelegt" : this._drW("filament") === "off" ? "keins" : "–"],
      ["Betriebsstunden", this._drZ("stunden") == null ? "–" : `${zahl(this._drZ("stunden"))} h`],
      ["WLAN", wlanText],
      ["Firmware", this._drW("firmware") === "on" ? "Update verfügbar" : this._drW("firmware") === "off" ? "aktuell" : "–"],
    ];
    html += `<div class="dr-karte"><h3 class="dr-titel">🖨️ Bambu Lab P1S</h3><div class="info-liste">${info.map(([n, v]) =>
      `<div class="info-zeile"><span>${n}</span><strong class="${v === "Update verfügbar" ? "amber" : ""}">${esc(v)}</strong></div>`).join("")}</div></div>`;
    return html;
  },

  // ---- Titelbild des Drucks (statt Kamera) ------------------------------
  // Während eines Drucks das aktuelle Titelbild, sonst das letzte, sonst „Kein Druck“
  _drBildHtml(zustand) {
    const s = this._drS("titelbild");
    const url = s && !["unavailable", "unknown"].includes(s.state) && s.attributes && s.attributes.entity_picture;
    if (url) this._drLetztesBild = url;
    const zeige = url || this._drLetztesBild;
    const druckt = DR_DRUCKT.includes(zustand);
    const letzter = this._drVerlauf && this._buAlle()[0];
    const name = druckt ? this._drW("name") : (["finish", "failed"].includes(zustand) && this._drW("name")) || (letzter && letzter.name);
    const fortschritt = this._drZ("fortschritt");
    return `<div class="dr-karte dr-bild-karte ${druckt ? "aktiv" : ""}">
      <div class="dr-kamera-kopf"><h3 class="dr-titel">🖼️ ${druckt ? "Aktueller Druck" : "Letzter Druck"}</h3>
        ${druckt && fortschritt != null ? `<span class="pille mint">${zahl(fortschritt)} %</span>` : ""}</div>
      <div class="dr-bild">${zeige
        ? `<img id="dr-titelbild-gross" src="${esc(zeige)}" alt="Titelbild${name ? ` von ${esc(name)}` : ""}">`
        : `<div class="dr-kamera-leer"><span class="dr-bild-leer-icon" aria-hidden="true">◇</span>Kein Druck</div>`}</div>
      ${zeige && name ? `<p class="dr-bild-name">${esc(name)}</p>` : ""}
    </div>`;
  },

  // ---- Druckverlauf ------------------------------------------------------
  async _drVerlaufLaden() {
    this._drVerlaufLaedt = true;
    try {
      const r = await this._hass.callWS({ type: "todo/item/list", entity_id: this._drListe() });
      this._drVerlauf = (r.items || []).map(druckDaten).sort((a, b) => (b.start || "").localeCompare(a.start || ""));
      this._drVerlaufFehler = null;
    } catch (e) {
      this._drVerlauf = [];
      this._drVerlaufFehler = e.message || String(e);
    }
    this._drVerlaufLaedt = false;
    if (!this._modus && !this._ddOffen) this._zeichnen();
    this._drFotosLaden();
    this._buNachLaden();
  },
  async _drFotosLaden() {
    this._drFotos = this._drFotos || {};
    for (const d of this._buAlle().slice(0, 30)) {
      const f = fotoName(d);
      if (!f || f in this._drFotos) continue;
      this._drFotos[f] = null;
      try {
        const r = await this._hass.callWS({ type: "media_source/resolve_media", media_content_id: `media-source://media_source/local/3d-drucke/${f}.jpg` });
        this._drFotos[f] = r && r.url ? r.url : null;
        const img = this.shadowRoot.querySelector(`[data-foto="${f}"]`);
        if (img && r && r.url) img.innerHTML = `<img src="${esc(r.url)}" alt="">`;
      } catch (e) { /* kein Foto vorhanden */ }
    }
  },

  _drVerlaufHtml() {
    const liste = this._drVerlauf ? this._buAlle() : null;
    let inhalt;
    if (!liste) inhalt = `<div class="leise klein">Lade Druckverlauf …</div>`;
    else if (this._drVerlaufFehler) inhalt = `<div class="hinweis amber">Die Liste „3D-Drucke“ konnte nicht gelesen werden: ${esc(this._drVerlaufFehler)}</div>`;
    else if (!liste.length) inhalt = `<div class="leise klein">Noch keine Drucke aufgezeichnet. Die Automation trägt jeden Druck automatisch ein.</div>`;
    else {
      const zeige = this._drAlle ? liste : liste.slice(0, 8);
      inhalt = `<div class="dr-verlauf">${zeige.map((d) => {
        const f = fotoName(d);
        const foto = f && this._drFotos && this._drFotos[f];
        const extra = (this._daten.drucke || {})[d.uid] || {};
        const g = extra.gebucht;
        const [st, farbe] = g ? (g.ergebnis === "fehl" ? ["Fehldruck", "rot"] : g.ergebnis === "anders" ? ["abgebrochen", "leise"] : ["verbucht", "mint"])
          : d.status === "finish" ? ["fertig", "amber"] : d.status === "failed" ? ["abgebrochen", "rot"] : d.status === "laeuft" ? ["läuft / ohne Abschluss", "amber"] : [d.status, "leise"];
        return `<button class="dr-druck" data-aktion="dr-druck" data-uid="${esc(d.uid)}">
          <span class="ld-bild" data-foto="${esc(f || "")}">${foto ? `<img src="${esc(foto)}" alt="">` : "🖼️"}</span>
          <span class="dr-druck-text"><strong>${esc(d.name)}</strong>
            <small>${esc(d.zeit)}${d.gewicht != null ? ` · ${zahl(d.gewicht, 1)} g` : ""}${d.duese_mm ? ` · ${zahl(d.duese_mm, 1)} mm Düse` : ""}${g ? ` · ${esc((this._daten.rollen.find((r) => r.id === g.rolle) || {}).name || "")}` : ""}${d.hand ? " · von Hand" : ""}</small>
            ${extra.kommentar ? `<small class="dr-kommentar">💬 ${esc(extra.kommentar)}</small>` : ""}</span>
          <span class="pille ${farbe}">${st}</span>
        </button>`;
      }).join("")}</div>
      ${liste.length > 8 ? `<button class="mini mint-rand" data-aktion="dr-alle">${this._drAlle ? "Weniger zeigen" : `Alle ${liste.length} Drucke zeigen`}</button>` : ""}`;
    }
    return `<div class="dr-karte"><div class="dr-kamera-kopf"><h3 class="dr-titel">🗂️ Druckverlauf</h3>
      <span class="chips"><button class="chip" data-aktion="bu-hand">＋ Nachtragen</button><button class="chip" data-aktion="dr-neu-laden">↻ Aktualisieren</button></span></div>${inhalt}</div>`;
  },

  _drDialogHtml() {
    const d = this._buAlle().find((x) => x.uid === this._drOffen);
    if (!d) return "";
    const extra = (this._daten.drucke || {})[d.uid] || {};
    const f = fotoName(d);
    const foto = f && this._drFotos && this._drFotos[f];
    const zeile = (n, v) => (v == null || v === "" ? "" : `<div class="info-zeile"><span>${n}</span><strong>${esc(v)}</strong></div>`);
    const dauer = d.start && d.ende ? Math.round((new Date(d.ende) - new Date(d.start)) / 60000) : null;
    return `${this._buNameHtml(d)}<p class="leise">${esc(d.zeit)}</p>
      ${foto ? `<img class="dr-foto-gross" src="${esc(foto)}" alt="Endfoto">` : ""}
      <div class="info-liste oben-abstand">
        ${zeile("Ergebnis", d.status === "finish" ? "fertig" : d.status === "failed" ? "fehlgeschlagen" : d.status === "laeuft" ? "ohne Abschluss" : d.status)}
        ${zeile("Fortschritt am Ende", d.fortschritt != null ? `${zahl(d.fortschritt)} %` : null)}
        ${zeile("Dauer", dauer != null && dauer > 0 ? (dauer >= 60 ? `${Math.floor(dauer / 60)} h ${dauer % 60} min` : `${dauer} min`) : null)}
        ${zeile("Gewicht (Slicer)", d.gewicht != null ? `${zahl(d.gewicht, 1)} g` : null)}
        ${zeile("Länge", d.laenge != null ? `${zahl(d.laenge, 2)} m` : null)}
        ${zeile("Düse / Bett", d.duese_c ? `${zahl(d.duese_c)} °C / ${zahl(d.bett_c)} °C` : null)}
        ${zeile("Düse", d.duese_mm ? `${zahl(d.duese_mm, 1)} mm` : null)}
      </div>
      ${this._drBuchungHtml(d, extra)}
      <h3>Kommentar</h3>
      <textarea id="dr-kommentar" rows="4" placeholder="z. B. warum abgebrochen, was du gelernt hast …">${esc(extra.kommentar || "")}</textarea>
      <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="dialog-zu">Schließen</button>
        <button class="knopf" data-aktion="dr-kommentar-speichern">Speichern</button></div>`;
  },

  _drBuchungHtml(d, extra) {
    const g = extra.gebucht;
    if (!g) {
      return BU_ENDE.includes(d.status) ? `<div class="hinweis amber oben-abstand">Noch nicht verbucht${extra.ignoriert ? " (übersprungen)" : ""}.
        <button class="mini" data-aktion="bu-start" data-uid="${esc(d.uid)}">Jetzt verbuchen</button></div>` : "";
    }
    const rolle = this._daten.rollen.find((r) => r.id === g.rolle);
    const k = g.kosten || {};
    const kosten = (k.filament || 0) + (k.strom || 0);
    const fehl = extra.fehl;
    return `<h3>Verbucht</h3><div class="info-liste">
      <div class="info-zeile"><span>Rolle</span><strong>${esc(rolle ? rolle.name : "gelöscht")}</strong></div>
      <div class="info-zeile"><span>Abgezogen</span><strong>${zahl(g.g, 1)} g${g.wechsel ? ` + ${zahl(g.wechsel.g, 2)} g Reststück` : ""}</strong></div>
      <div class="info-zeile"><span>Ergebnis</span><strong>${g.ergebnis === "fehl" ? "Fehldruck" : g.ergebnis === "anders" ? "anders überlegt" : "geglückt"}</strong></div>
      ${kosten ? `<div class="info-zeile"><span>Kosten</span><strong>${zahl(kosten, 2)} €${k.kwh != null ? ` (${zahl(k.kwh, 3)} kWh)` : ""}</strong></div>` : ""}
      ${fehl ? `<div class="info-zeile"><span>Ursachen</span><strong>${esc((fehl.ursachen || []).map((id) => (fehlerbild(id) || {}).name).filter(Boolean).join(", ") || "–")}</strong></div>` : ""}
    </div><button class="mini" data-aktion="bu-rueckgaengig" data-uid="${esc(d.uid)}">Buchung rückgängig machen</button>`;
  },

  // ---- Steckdose schalten ------------------------------------------------
  // Einschalten immer mit Nachfrage, Ausschalten nur ohne, wenn der Drucker in Ruhe und kalt ist
  _drRuhig() {
    const st = this._drW("status");
    const duese = this._drZ("duese"), bett = this._drZ("bett");
    const ruhe = !st || ["idle", "finish", "failed", "offline", "unknown"].includes(st);
    return ruhe && (duese == null || duese < 60) && (bett == null || bett < 45);
  },
  _drSchaltKnopf(ziel) {
    if (this._drSchaltet) return `<button class="knopf leise klein-knopf" disabled><span class="dreher klein"></span> Schaltet …</button>`;
    return ziel === "an"
      ? `<button class="knopf klein-knopf" data-aktion="dr-schalten" data-ziel="an">⏻ Einschalten</button>`
      : `<button class="knopf rot-knopf klein-knopf" data-aktion="dr-schalten" data-ziel="aus">⏻ Ausschalten</button>`;
  },

  _drSchaltDialogHtml() {
    const an = this._drSchaltZiel === "an";
    if (an) {
      return `<h2>Drucker einschalten?</h2>
        <p class="leise">Die Steckdose „${esc(this._drSteckdoseName())}“ wird eingeschaltet. Der Drucker meldet sich nach etwa 15–30 Sekunden.</p>
        <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="dialog-zu">Abbrechen</button>
          <button class="knopf" data-aktion="dr-schalten-ok">Einschalten</button></div>`;
    }
    const st = this._drW("status");
    const druckt = DR_DRUCKT.includes(st);
    const duese = this._drZ("duese"), bett = this._drZ("bett");
    const heiss = duese != null && duese >= 60;
    const bettWarm = bett != null && bett >= 45;
    const beschaeftigt = !druckt && st && !["idle", "finish", "failed", "offline", "unknown"].includes(st);
    return `<h2>${druckt ? "Drucker druckt gerade." : heiss || bettWarm ? "Drucker ist noch heiß." : "Drucker ist beschäftigt."} Wirklich ausschalten?</h2>
      ${druckt ? `<div class="hinweis rot-hinweis"><strong>Achtung, es läuft ein Druck.</strong> Ausschalten bricht ihn sofort ab und er ist verloren.</div>` : ""}
      ${beschaeftigt ? `<div class="hinweis amber">Der Drucker meldet „${esc((DR_STATUS[st] || [st])[0])}“.</div>` : ""}
      ${heiss ? `<div class="hinweis amber">Die Düse ist noch ${zahl(duese)} °C heiß. Der Hotend-Lüfter braucht Strom, um sie abzukühlen. Besser warten, bis sie unter 60 °C ist, sonst kann das Filament im Hotend verstopfen.</div>` : ""}
      ${bettWarm ? `<div class="hinweis amber">Das Druckbett ist noch ${zahl(bett)} °C warm. Ohne Strom kühlt es ungleichmäßig ab, besser unter 45 °C warten.</div>` : ""}
      <p class="leise klein">Ohne Nachfrage geht das Ausschalten nur im Ruhezustand: kein Druck, Düse unter 60 °C und Bett unter 45 °C.</p>
      <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="dialog-zu">Abbrechen</button>
        <button class="knopf rot-knopf" data-aktion="dr-schalten-ok">${druckt ? "Trotzdem ausschalten" : "Ausschalten"}</button></div>`;
  },

  async _drSchalten() {
    const id = this._drId("schalter", true);
    const ziel = this._drSchaltZiel;
    this._dialog = null;
    this._drSchaltet = true;
    this._zeichnen();
    try {
      await this._hass.callService("switch", ziel === "an" ? "turn_on" : "turn_off", { entity_id: id });
    } catch (e) {
      this._drSchaltet = false;
      this._toast(`Schalten hat nicht geklappt: ${e.message || e}`);
      return;
    }
    // Warten, bis Home Assistant den neuen Zustand meldet (meist ca. 3 s)
    const soll = ziel === "an" ? "on" : "off";
    const start = Date.now();
    const pruefen = () => {
      if (this._drW("schalter", true) === soll) {
        this._drSchaltet = false;
        this._toast(ziel === "an" ? "Steckdose ist an. Der Drucker startet." : "Steckdose ist aus.");
        return;
      }
      if (Date.now() - start > 15000) {
        this._drSchaltet = false;
        this._toast("Die Steckdose hat nicht geantwortet. Bitte in Home Assistant prüfen.");
        return;
      }
      setTimeout(pruefen, 500);
    };
    setTimeout(pruefen, 500);
  },

  // ---- Geladenes Filament (this._daten.geladen = Rollen-ID oder null) ----
  _drGeladen() {
    const id = this._daten && this._daten.geladen;
    return id ? this._daten.rollen.find((r) => r.id === id) || null : null;
  },
  _drLadenSetzen(id) {
    const alt = this._drGeladen();
    this._daten.geladen = id || null;
    this._speichern();
    const r = this._drGeladen();
    this._toast(r ? `${r.name} ist jetzt als geladen markiert.` : alt ? `${alt.name} ist nicht mehr geladen.` : "Kein Filament geladen.");
  },
  _drFilamentHtml() {
    if (!this._daten) return "";
    const r = this._drGeladen();
    const rollen = this._daten.rollen.slice().sort((a, b) => a.name.localeCompare(b.name, "de"));
    const mats = [...new Set(rollen.map((x) => x.material))].sort((a, b) => a.localeCompare(b, "de"));
    const optionen = mats.map((m) => `<optgroup label="${esc(m)}">${rollen.filter((x) => x.material === m).map((x) =>
      `<option value="${esc(x.id)}" ${r && x.id === r.id ? "selected" : ""}>${esc(x.name)} · ${esc(x.hersteller)}${x.rest_g != null ? ` · ${zahl(x.rest_g)} g` : ""}</option>`).join("")}</optgroup>`).join("");
    return `<section class="dr-karte dr-filament ${r ? "geladen" : ""}" id="dr-filament">
      <h3 class="dr-titel">🧵 Geladenes Filament</h3>
      <div class="dr-fil-zeile">
        <span class="dr-fil-spule">${r ? spuleSvg(r) : `<span class="dr-fil-leer" aria-hidden="true">∅</span>`}</span>
        <span class="dr-fil-text">${r
          ? `<strong>${esc(r.name)}</strong><small>${esc(r.hersteller)} · ${esc(sorteName(r))} · ${r.rest_g == null ? "nicht gewogen" : `${zahl(r.rest_g)} g übrig`}</small>`
          : `<strong>Kein Filament geladen</strong><small>Wähle die Rolle, die gerade im Drucker steckt. Sie wird beim Verbuchen zuerst vorgeschlagen.</small>`}</span>
        ${r ? `<span class="pille gruen">● geladen</span>` : ""}
      </div>
      <div class="dr-fil-wahl">
        <label class="auswahl breit-auswahl"><span>${r ? "Andere Rolle laden" : "Rolle wählen"}</span><select data-dr="geladen">${r ? "" : `<option value="" selected disabled>Rolle wählen …</option>`}${optionen}</select></label>
        <button class="knopf leise klein-knopf" data-aktion="dr-laden" data-id="" ${r ? "" : "disabled"}>Kein Filament geladen</button>
      </div>
      ${r ? `<button class="mini mint-rand" data-aktion="oeffnen-filament" data-id="${esc(r.id)}">Einstellungen der Rolle ›</button>` : ""}
    </section>`;
  },

  // ---- Zieltemperatur setzen (number.set_value) -------------------------
  _drSollHtml(k, s) {
    if (!this._drId(`${k}_soll`)) return "";
    const d = DR_TEMP[k];
    const entwurf = (this._drTempEntwurf || {})[k];
    const sendet = this._drTempSendet === k;
    const r = this._drGeladen();
    const rw = r ? wert(r, d.rolle).v : null;
    return `<span class="dr-soll">
      ${rw != null && rw !== s ? `<button class="chip dr-rolle-chip" data-aktion="dr-temp" data-k="${k}" data-wert="${rw}" title="Wert der geladenen Rolle ${esc(r.name)}" ${sendet ? "disabled" : ""}>🧵 ${zahl(rw)} °C</button>` : ""}
      <input type="number" inputmode="numeric" min="0" max="${d.max}" step="1" data-dr-temp="${k}" value="${esc(entwurf == null ? "" : entwurf)}"
        placeholder="${s ? zahl(s) : "0"}" aria-label="Neue Zieltemperatur ${d.name} in °C (0 bis ${d.max})" class="${this._drTempFehler === k ? "fehler" : ""}"><span class="dr-einheit">°C</span>
      <button class="mini mint-rand" data-aktion="dr-temp" data-k="${k}" ${sendet ? "disabled" : ""}>${sendet ? `<span class="dreher klein"></span>` : "Setzen"}</button>
    </span>`;
  },
  _drTempAnfrage(k, roh) {
    const d = DR_TEMP[k];
    const text = String(roh == null ? "" : roh).trim().replace(",", ".");
    const v = Number(text);
    if (text === "" || !Number.isFinite(v) || v < 0 || v > d.max) {
      this._drTempFehler = k;
      this._toast(text === "" ? `Bitte eine Zieltemperatur für ${d.name} eingeben (0–${d.max} °C).` : `${d.name}: nur 0–${d.max} °C möglich.`);
      return;
    }
    this._drTempFehler = null;
    const w = Math.round(v);
    this._drTempWunsch = { k, wert: w, warnungen: this._drTempWarnungen(k, w) };
    if (this._drTempWunsch.warnungen.length) { this._dialog = "dr-temp"; this._zeichnen(); return; }
    this._drTempSenden();
  },
  // Nachfragen nur, wenn es etwas zu bedenken gibt
  _drTempWarnungen(k, w) {
    const d = DR_TEMP[k];
    const liste = [];
    const druckt = ["running", "pause", "prepare", "slicing"].includes(this._drZustand());
    if (druckt) liste.push(w === 0 ? { rot: true, text: "Es läuft ein Druck. Mit 0 °C schaltest du die Heizung ab, der Druck misslingt dann." }
      : { text: "Es läuft ein Druck. Die neue Temperatur gilt sofort für diesen Druck, bis der G-Code sie wieder ändert." });
    if (w >= d.heiss) liste.push({ text: k === "duese" ? `${w} °C an der Düse ist sehr heiß. Das brauchen nur Materialien wie ASA, PC oder PA.`
      : `${w} °C am Druckbett ist sehr heiß, nur für ABS, ASA oder PC sinnvoll. Nicht anfassen.` });
    const r = this._drGeladen();
    const rw = r ? wert(r, d.rolle).v : null;
    if (rw != null && w > 0 && Math.abs(w - rw) >= 25) liste.push({ text: `Für die geladene Rolle „${r.name}“ sind ${zahl(rw)} °C eingetragen.` });
    return liste;
  },
  _drTempDialogHtml() {
    const w = this._drTempWunsch;
    if (!w) return "";
    const d = DR_TEMP[w.k];
    const ist = this._drZ(d.ist), ziel = this._drZ(d.ziel);
    const rot = w.warnungen.some((x) => x.rot);
    return `<h2>${d.name} ${w.wert === 0 ? "ausschalten" : `auf ${w.wert} °C setzen`}?</h2>
      <p class="leise">Jetzt ${ist == null ? "–" : zahl(ist)} °C${ziel ? `, Ziel ${zahl(ziel)} °C` : ", Heizung aus"}.</p>
      ${w.warnungen.map((x) => `<div class="hinweis ${x.rot ? "rot-hinweis" : "amber"}">${esc(x.text)}</div>`).join("")}
      <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="dialog-zu">Abbrechen</button>
        <button class="knopf ${rot ? "rot-knopf" : ""}" data-aktion="dr-temp-ok">${w.wert === 0 ? "Heizung aus" : `Auf ${w.wert} °C setzen`}</button></div>`;
  },
  async _drTempSenden() {
    const w = this._drTempWunsch;
    if (!w) return;
    const d = DR_TEMP[w.k];
    const id = this._drId(`${w.k}_soll`);
    this._dialog = null;
    this._drTempSendet = w.k;
    this._zeichnen();
    try {
      await this._hass.callService("number", "set_value", { entity_id: id, value: w.wert });
    } catch (e) {
      this._drTempSendet = null;
      this._toast(`${d.name}: Senden hat nicht geklappt (${e.message || e}).`);
      return;
    }
    if (this._drTempEntwurf) delete this._drTempEntwurf[w.k];
    const ok = await this._drWarten(() => this._drZ(`${w.k}_soll`) === w.wert || this._drZ(d.ziel) === w.wert, 10000);
    this._drTempSendet = null;
    this._toast(ok ? (w.wert === 0 ? `${d.name}: Heizung ist aus.` : `${d.name}: Ziel ${w.wert} °C übernommen.`)
      : `${d.name}: ${w.wert} °C gesendet, der Drucker hat es noch nicht bestätigt.`);
  },
  // Warten, bis Home Assistant den neuen Zustand meldet
  _drWarten(pruef, max) {
    const start = Date.now();
    return new Promise((fertig) => {
      const schritt = () => {
        if (pruef()) fertig(true);
        else if (Date.now() - start > max) fertig(false);
        else setTimeout(schritt, 400);
      };
      setTimeout(schritt, 400);
    });
  },

  // ---- Lüfter einstellen (fan.set_percentage / fan.turn_off) ------------
  _drLuefterWert(k) {
    const f = DR_LUEFTER[k] && this._drS(DR_LUEFTER[k].f);
    if (f && f.state === "off") return 0;
    if (f && f.attributes && f.attributes.percentage != null && !isNaN(Number(f.attributes.percentage))) return Number(f.attributes.percentage);
    return this._drZ(k);
  },
  _drLuefterDialogHtml() {
    const k = this._drLuefterK, L = DR_LUEFTER[k];
    if (!L) return "";
    const v = this._drLuefterWert(k) || 0;
    const druckt = ["running", "pause", "prepare", "slicing"].includes(this._drZustand());
    const sendet = this._drLuefterSendet;
    return `<h2>🌀 ${L.name}</h2>
      <p class="leise">Läuft gerade mit <strong class="tx">${zahl(v)} %</strong>. ${esc(L.info)}</p>
      ${druckt ? `<div class="hinweis amber">Es läuft ein Druck: Der Drucker stellt die Lüfter selbst per G-Code ein und kann deinen Wert beim nächsten Befehl wieder ändern.</div>` : ""}
      <div class="chips dr-stufen">${DR_LUEFTER_STUFEN.map((p) => `<button class="chip ${p === v ? "an" : ""}" data-aktion="dr-luefter-setzen" data-wert="${p}" ${sendet ? "disabled" : ""}>${p === 0 ? "Aus" : `${p} %`}</button>`).join("")}</div>
      <div class="feld"><span>Eigener Wert (0–100 %)</span>
        <span class="dr-soll breit"><input type="number" inputmode="numeric" min="0" max="100" step="10" data-dr-luefter value="${esc(this._drLuefterEntwurf == null ? "" : this._drLuefterEntwurf)}" placeholder="${zahl(v)}" aria-label="${L.name} in Prozent"><span class="dr-einheit">%</span>
        <button class="knopf klein-knopf" data-aktion="dr-luefter-setzen" ${sendet ? "disabled" : ""}>${sendet ? `<span class="dreher klein"></span> Sendet …` : "Setzen"}</button></span></div>
      <p class="leise klein">Der Drucker stellt in 10-%-Schritten ein, krumme Werte werden gerundet.</p>
      <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="dialog-zu">Schließen</button></div>`;
  },
  async _drLuefterSetzen(roh) {
    const k = this._drLuefterK, L = DR_LUEFTER[k];
    const id = L && this._drId(L.f);
    if (!id || this._drLuefterSendet) return;
    const text = String(roh == null ? "" : roh).trim().replace(",", ".").replace("%", "").trim();
    const v = Number(text);
    if (text === "" || !Number.isFinite(v) || v < 0 || v > 100) {
      this._toast(text === "" ? "Bitte einen Wert von 0 bis 100 % eingeben." : `${L.name}: nur 0–100 % möglich.`);
      return;
    }
    const p = Math.round(v / 10) * 10;
    this._drLuefterSendet = true;
    this._zeichnen();
    try {
      if (p === 0) await this._hass.callService("fan", "turn_off", { entity_id: id });
      else await this._hass.callService("fan", "set_percentage", { entity_id: id, percentage: p });
    } catch (e) {
      this._drLuefterSendet = false;
      this._toast(`${L.name}: Senden hat nicht geklappt (${e.message || e}).`);
      return;
    }
    this._drLuefterEntwurf = null;
    const ok = await this._drWarten(() => this._drLuefterWert(k) === p, 8000);
    this._drLuefterSendet = false;
    if (this._dialog === "dr-luefter") this._dialog = null;
    const gerundet = p !== v ? ` (gerundet von ${zahl(v)} %)` : "";
    this._toast(ok ? (p === 0 ? `${L.name} ist aus.` : `${L.name} läuft mit ${p} %${gerundet}.`)
      : `${L.name}: ${p} % gesendet, der Drucker hat es noch nicht bestätigt.`);
  },

  // ---- Steuerung: Pause / Fortsetzen / Stopp, Licht, Geschwindigkeit -----
  _drVerfuegbar(k) {
    const s = this._drS(k);
    return !!s && s.state !== "unavailable";
  },
  _drSteuerHtml(zustand) {
    const druckt = DR_DRUCKT.includes(zustand);
    const sendet = this._drSteuerSendet;
    const knoepfe = [];
    if (["running", "prepare", "slicing"].includes(zustand) && this._drVerfuegbar("pause")) knoepfe.push(["pause", DR_ICONS.pause, "Pause", ""]);
    if (zustand === "pause" && this._drVerfuegbar("fortsetzen")) knoepfe.push(["fortsetzen", DR_ICONS.fortsetzen, "Fortsetzen", "mint"]);
    if (druckt && this._drVerfuegbar("stopp")) knoepfe.push(["stopp", DR_ICONS.stopp, "Stopp", "rot"]);
    const licht = this._drVerfuegbar("licht") ? this._drS("licht").state === "on" : null;
    const tempoS = druckt && this._drVerfuegbar("tempo_wahl") ? this._drS("tempo_wahl") : null;
    if (!knoepfe.length && licht == null && !tempoS) return "";
    const knopf = ([art, icon, name, farbe]) => `<button class="dr-steuer-knopf ${farbe}" data-aktion="dr-steuer" data-art="${art}" ${sendet ? "disabled" : ""}>
      <span class="dr-steuer-icon" aria-hidden="true">${sendet === art ? `<span class="dreher klein"></span>` : icon}</span>${name}</button>`;
    const optionen = tempoS && Array.isArray(tempoS.attributes.options) ? tempoS.attributes.options : DR_TEMPO.map(([k]) => k);
    const stufen = DR_TEMPO.filter(([k]) => optionen.includes(k));
    return `<div class="dr-karte dr-steuer"><h3 class="dr-titel">🎛️ Steuerung</h3>
      <div class="dr-steuer-reihe">${knoepfe.map(knopf).join("")}
        ${licht == null ? "" : `<button class="dr-steuer-knopf dr-licht ${licht ? "an" : ""}" data-aktion="dr-licht" aria-pressed="${licht}" ${sendet ? "disabled" : ""}>
          <span class="dr-steuer-icon" aria-hidden="true">${sendet === "licht" ? `<span class="dreher klein"></span>` : "💡"}</span>Licht ${licht ? "an" : "aus"}</button>`}</div>
      ${tempoS && stufen.length ? `<div class="dr-tempo"><span class="leise klein">Geschwindigkeit</span>
        <div class="chips">${stufen.map(([k, name, p]) => `<button class="chip ${tempoS.state === k ? "an" : ""} ${k === "ludicrous" ? "dr-tempo-wild" : ""}" data-aktion="dr-tempo" data-wert="${k}" title="${p}" ${sendet || tempoS.state === k ? "disabled" : ""}>${sendet === `tempo-${k}` ? `<span class="dreher klein"></span> ` : ""}${name}</button>`).join("")}</div></div>` : ""}
    </div>`;
  },
  _drSteuerDialogHtml() {
    const art = this._drSteuerArt;
    const name = esc(this._drW("name") || "Druck");
    const f = this._drZ("fortschritt"), s = this._drZ("schicht"), n = this._drZ("schichten");
    const stand = `${f == null ? "" : `${zahl(f)} %`}${s != null && n ? `, Schicht ${zahl(s)}/${zahl(n)}` : ""}`;
    if (art === "stopp") {
      return `<h2>Druck abbrechen?</h2>
        <div class="hinweis rot-hinweis">„${name}“ wird endgültig abgebrochen${stand ? ` (${stand})` : ""}. Das lässt sich nicht rückgängig machen.</div>
        <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="dialog-zu">Weiterdrucken</button>
          <button class="knopf rot-knopf" data-aktion="dr-steuer-ok">Stopp</button></div>`;
    }
    return `<h2>Druck pausieren?</h2>
      <p class="leise">„${name}“ hält an${stand ? ` (${stand})` : ""}, der Druckkopf fährt zur Seite. Mit „Fortsetzen“ geht es weiter.</p>
      <div class="hinweis amber">Lange Pausen können eine sichtbare Linie im Bauteil hinterlassen, weil die letzte Schicht abkühlt.</div>
      <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="dialog-zu">Abbrechen</button>
        <button class="knopf amber" data-aktion="dr-steuer-ok">Pausieren</button></div>`;
  },
  // Gemeinsamer Ablauf: Dienst aufrufen, auf Bestätigung warten, Rückmeldung
  async _drSteuerAufruf(marke, aufruf, pruef, texte) {
    if (this._drSteuerSendet) return;
    this._dialog = null;
    this._drSteuerSendet = marke;
    this._zeichnen();
    try {
      await aufruf();
    } catch (e) {
      this._drSteuerSendet = null;
      this._toast(`${texte[1]}: Senden hat nicht geklappt (${e.message || e}).`);
      return;
    }
    const ok = await this._drWarten(pruef, 15000);
    this._drSteuerSendet = null;
    this._toast(ok ? texte[0] : `${texte[1]} gesendet, der Drucker hat es noch nicht bestätigt.`);
  },
  _drSteuerSenden(art) {
    const id = this._drId(art);
    if (!id) return;
    const ziel = { pause: (s) => s === "pause", fortsetzen: (s) => s === "running", stopp: (s) => !DR_DRUCKT.includes(s) }[art];
    const texte = { pause: ["Druck ist pausiert.", "Pause"], fortsetzen: ["Druck läuft weiter.", "Fortsetzen"], stopp: ["Druck wurde abgebrochen.", "Stopp"] }[art];
    this._drSteuerAufruf(art, () => this._hass.callService("button", "press", { entity_id: id }), () => ziel(this._drW("status")), texte);
  },
  _drLichtSchalten() {
    const id = this._drId("licht");
    if (!id) return;
    const an = this._drW("licht") !== "on";
    this._drSteuerAufruf("licht", () => this._hass.callService("light", an ? "turn_on" : "turn_off", { entity_id: id }),
      () => this._drW("licht") === (an ? "on" : "off"), [an ? "Licht im Druckraum ist an." : "Licht im Druckraum ist aus.", "Licht"]);
  },
  _drTempoSetzen(wert) {
    const id = this._drId("tempo_wahl");
    const stufe = DR_TEMPO.find(([k]) => k === wert);
    if (!id || !stufe) return;
    this._drSteuerAufruf(`tempo-${wert}`, () => this._hass.callService("select", "select_option", { entity_id: id, option: wert }),
      () => this._drW("tempo_wahl") === wert, [`Geschwindigkeit: ${stufe[1]} (${stufe[2]}).`, "Geschwindigkeit"]);
  },

  // ---- Raumklima (wird auch von der Startseite benutzt) ------------------
  // { temp, feuchte, warnungen: [{ stufe: "rot"|"amber", text }] }
  _raumklima() {
    const k = this._konfig || {};
    const lies = (id) => {
      const s = id && this._hass && this._hass.states[id];
      const v = s && s.state !== "" ? Number(s.state) : NaN;
      return Number.isFinite(v) ? v : null;
    };
    const temp = lies(k.raum_temp) ?? lies(DR_RAUM_TEMP);
    const feuchte = lies(k.raum_feuchte) ?? lies(DR_RAUM_FEUCHTE);
    const r = this._drGeladen();
    const mat = (r && r.material) || "";
    const warnungen = [];
    if (temp != null && temp < 18 && DR_WARP.test(mat)) {
      warnungen.push({ stufe: "amber", text: `Nur ${zahl(temp, 1)} °C im Raum: ${mat} verzieht sich bei Kälte und Zugluft (Warping). Tür und Fenster zu, Drucker aus dem Luftzug, Raum möglichst heizen.` });
    }
    const daempfe = this._drLetzteDaempfe();
    if (daempfe) {
      const min = Math.max(1, Math.round((Date.now() - daempfe.ende) / 60000));
      warnungen.push({ stufe: "amber", text: `${daempfe.mat}-Druck vor ${min} min beendet: jetzt gut lüften, die Dämpfe (Styrol) hängen noch im Raum.` });
    }
    if (feuchte != null && feuchte > 60) {
      warnungen.push(DR_HYGRO.test(mat)
        ? { stufe: "rot", text: `${zahl(feuchte)} % Luftfeuchte: ${mat} zieht schnell Wasser. Rolle nach dem Druck sofort luftdicht mit Trockenmittel verpacken, besser aus dem Trockner drucken.` }
        : { stufe: "amber", text: `${zahl(feuchte)} % Luftfeuchte: Filament trocken lagern (Box mit Trockenmittel), offene Rollen nicht herumliegen lassen.` });
    }
    return { temp, feuchte, warnungen };
  },
  // Letzter ABS/ASA-Druck, der vor weniger als einer Stunde zu Ende ging
  _drLetzteDaempfe() {
    if (!this._daten) return null;
    const jetzt = Date.now();
    const geladen = this._drGeladen();
    const kand = [];
    const st = this._drW("status"), ende = this._drW("ende");
    if (["finish", "failed"].includes(st) && ende) kand.push({ ende: new Date(ende).getTime(), mat: geladen && geladen.material });
    for (const d of this._drVerlauf ? this._buAlle().slice(0, 5) : []) {
      if (!["finish", "failed"].includes(d.status) || !d.ende) continue;
      const g = ((this._daten.drucke || {})[d.uid] || {}).gebucht;
      const rolle = (g && this._daten.rollen.find((x) => x.id === g.rolle)) || geladen;
      kand.push({ ende: new Date(d.ende).getTime(), mat: rolle && rolle.material });
    }
    return kand.find((x) => x.mat && DR_DAEMPFE.test(x.mat) && jetzt - x.ende >= 0 && jetzt - x.ende < 3600e3) || null;
  },
  _drRaumHtml() {
    const k = this._raumklima();
    if (k.temp == null && k.feuchte == null) return "";
    const skala = (v, min, max) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
    const wert = (icon, text, name, v, min, max, gut, klasse) => `<div class="dr-raum-wert ${klasse}">
      <span class="dr-raum-icon" aria-hidden="true">${icon}</span><strong>${text}</strong><small>${name}</small>
      ${v == null ? "" : `<span class="dr-raum-skala" style="--gut-a:${skala(gut[0], min, max)}%;--gut-b:${skala(gut[1], min, max)}%"><i style="left:${skala(v, min, max)}%"></i></span>`}</div>`;
    return `<div class="dr-karte dr-raum-karte"><h3 class="dr-titel">🏠 Raumklima</h3>
      <div class="dr-raum-werte">
        ${wert("🌡️", k.temp == null ? "–" : `${zahl(k.temp, 1)} °C`, "Temperatur", k.temp, 10, 32, [18, 28], k.temp != null && k.temp < 18 ? "kalt" : "")}
        ${wert("💧", k.feuchte == null ? "–" : `${zahl(k.feuchte)} %`, "Luftfeuchte", k.feuchte, 0, 100, [30, 60], k.feuchte != null && k.feuchte > 60 ? "feucht" : "")}
      </div>
      ${k.warnungen.map((w) => `<div class="hinweis ${w.stufe === "rot" ? "rot-hinweis" : "amber"} dr-raum-warnung">${esc(w.text)}</div>`).join("")}
      ${k.warnungen.length ? "" : `<p class="leise klein dr-raum-ok">✓ Passt zum Drucken.</p>`}
    </div>`;
  },

  // ---- Warnung: Druck braucht mehr Filament, als auf der Rolle ist -------
  // { text, rolleId, stufe } oder null (wird auch von der Startseite benutzt)
  _druckWarnung() {
    if (!this._hass || !this._daten) return null;
    if (!DR_DRUCKT.includes(this._drZustand())) return null;
    const r = this._drGeladen();
    const g = this._drZ("gewicht");
    if (!r || r.rest_g == null || g == null || g <= r.rest_g) return null;
    return { stufe: "rot", rolleId: r.id,
      text: `Dieser Druck braucht ${zahl(g, 1)} g, auf „${r.name}“ sind nur noch ${zahl(r.rest_g)} g. Rolle rechtzeitig wechseln oder den Druck stoppen.` };
  },

  // ---- Stromdiagramme (Sheet) --------------------------------------------
  _drStromPreis() {
    const d = this._daten || {};
    const shop = d.shop && d.shop.einstellungen && Number(d.shop.einstellungen.kwh_preis);
    if (shop > 0) return { preis: shop, quelle: "Shop" };
    const werk = d.einstellungen && Number(d.einstellungen.strompreis);
    return werk > 0 ? { preis: werk, quelle: "Werkstatt" } : { preis: 0.35, quelle: "Standard" };
  },
  async _drStromLaden(bereich) {
    bereich = DR_STROM_BEREICHE[bereich] ? bereich : (this._drStrom && this._drStrom.bereich) || "24h";
    const B = DR_STROM_BEREICHE[bereich];
    const cache = (this._drStromCache = this._drStromCache || {});
    if (cache[bereich] && Date.now() - cache[bereich].geladen < 60000) { this._drStrom = cache[bereich]; return; }
    this._drStrom = { bereich, laedt: true };
    const ende = Date.now(), start = ende - B.ms;
    const wattId = this._drId("watt", true), kwhId = this._drId("heute", true) || this._drId("monat", true);
    // Raster für die Energie: ganze Stunden bzw. ganze Tage (Ortszeit)
    const slots = [];
    if (B.periode === "hour") {
      const t = new Date(ende); t.setMinutes(0, 0, 0);
      for (let i = 23; i >= 0; i--) slots.push(t.getTime() - i * 3600e3);
    } else {
      const t = new Date(ende); t.setHours(0, 0, 0, 0);
      for (let i = Math.round(B.ms / 86400e3) - 1; i >= 0; i--) { const d = new Date(t); d.setDate(d.getDate() - i); slots.push(d.getTime()); }
    }
    const fehler = (e) => ({ fehler: e.message || String(e) });
    const [hist, stat] = await Promise.all([
      wattId ? this._hass.callWS({ type: "history/history_during_period", start_time: new Date(start).toISOString(), end_time: new Date(ende).toISOString(),
        entity_ids: [wattId], minimal_response: true, no_attributes: true, significant_changes_only: false }).catch(fehler) : null,
      kwhId ? this._hass.callWS({ type: "recorder/statistics_during_period", start_time: new Date(slots[0]).toISOString(), end_time: new Date(ende).toISOString(),
        statistic_ids: [kwhId], period: B.periode, types: ["change"], units: { energy: "kWh" } }).catch(fehler) : null,
    ]);
    // Leistung: Stufenfunktion aus den Zustandswechseln
    const roh = hist && !hist.fehler && Array.isArray(hist[wattId]) ? hist[wattId] : [];
    const punkte = roh.map((x) => {
      const s = x.s != null ? x.s : x.state;
      const t = x.lu != null ? x.lu * 1000 : Date.parse(x.last_updated || x.last_changed);
      return { t: Math.max(start, t), w: s !== "" && s != null && Number.isFinite(Number(s)) ? Number(s) : null };
    }).filter((p) => Number.isFinite(p.t)).sort((a, b) => a.t - b.t);
    // Mittelwert (zeitgewichtet) und Wh der Stufenfunktion zwischen a und b
    const abschnitt = (a, b) => {
      let summe = 0, gedeckt = 0, max = null;
      for (let j = 0; j < punkte.length; j++) {
        const von = Math.max(punkte[j].t, a), bis = Math.min(j + 1 < punkte.length ? punkte[j + 1].t : ende, b);
        if (bis > von && punkte[j].w != null) { summe += punkte[j].w * (bis - von); gedeckt += bis - von; max = Math.max(max == null ? 0 : max, punkte[j].w); }
      }
      return { mittel: gedeckt ? summe / gedeckt : null, wh: gedeckt ? summe / 3600e3 : null, gedeckt, max };
    };
    const dt = B.ms / B.stuecke;
    const kurve = [];
    for (let b = 0; b < B.stuecke; b++) {
      const a = abschnitt(start + b * dt, start + (b + 1) * dt);
      kurve.push({ t: start + b * dt, w: a.gedeckt > dt * 0.05 ? a.mittel : null, max: a.max });
    }
    // Energie: Zählerstatistik, für fehlende Abschnitte aus der Leistung gerechnet
    const statRoh = stat && !stat.fehler && Array.isArray(stat[kwhId]) ? stat[kwhId] : null;
    const zeit = (v) => (typeof v === "number" ? (v < 1e12 ? v * 1000 : v) : Date.parse(v));
    let ausZaehler = 0;
    const balken = slots.map((t, k) => {
      let t1 = k + 1 < slots.length ? slots[k + 1] : t + 3600e3;
      if (k + 1 === slots.length && B.periode === "day") { const d = new Date(t); d.setDate(d.getDate() + 1); t1 = d.getTime(); }
      const e = statRoh && statRoh.find((x) => Math.abs(zeit(x.start) - t) < 60000);
      if (e && e.change != null && Number.isFinite(Number(e.change))) { ausZaehler++; return { t, t1, kwh: Math.max(0, Number(e.change)) }; }
      const wh = abschnitt(t, Math.min(t1, ende)).wh;
      return { t, t1, kwh: wh == null ? null : wh / 1000 };
    });
    const gueltig = kurve.filter((k) => k.w != null);
    const S = {
      bereich, start, ende, kurve, balken, geladen: Date.now(),
      summe: balken.reduce((s, x) => s + (x.kwh || 0), 0),
      schnitt: gueltig.length ? gueltig.reduce((s, k) => s + k.w, 0) / gueltig.length : null,
      spitze: punkte.filter((p) => p.w != null).reduce((m, p) => Math.max(m, p.w), 0) || null,
      quelle: ausZaehler ? (ausZaehler === balken.length ? "Zähler der Steckdose" : "Zähler, Rest aus der Leistung berechnet") : "aus der Leistung berechnet",
      fehler: (!wattId || (hist && hist.fehler)) && (!kwhId || (stat && stat.fehler)) ? (hist && hist.fehler) || (stat && stat.fehler) || "Keine Strom-Sensoren gefunden." : null,
    };
    if (!S.fehler) cache[bereich] = S;
    if (this._drStrom && this._drStrom.bereich === bereich) {
      this._drStrom = S;
      if (this._dialog === "dr-strom") this._zeichnen();
    }
  },

  // Zeitpunkt für Achsen (kurz) und Anzeige (lang)
  _drStromZeit(t, art, lang) {
    const d = new Date(t);
    const B = DR_STROM_BEREICHE[this._drStrom.bereich];
    const hm = (x) => new Date(x).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    const tag = d.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "numeric" });
    const kurzTag = B.ms > 8 * 86400e3 ? `${d.getDate()}.${d.getMonth() + 1}.` : d.toLocaleDateString("de-DE", { weekday: "short" });
    if (art === "kwh") return B.periode === "hour" ? (lang ? `${tag}, ${hm(t)}–${hm(t + 3600e3)}` : `${d.getHours()}`) : lang ? tag : kurzTag;
    return B.periode === "hour" ? (lang ? `${tag}, ${hm(t)}` : `${d.getHours()}:00`) : lang ? `${tag}, ${hm(t)}` : kurzTag;
  },
  // Selbst gezeichnetes Diagramm: art = "watt" (Fläche) oder "kwh" (Säulen)
  _drDiagrammSvg(art) {
    const S = this._drStrom;
    const B = DR_STROM_BEREICHE[S.bereich];
    const W = this._mobil ? 340 : 520, H = art === "watt" ? 190 : 160, L = 42, R = 8, O = 24, U = 22;
    const pw = W - L - R, ph = H - O - U;
    const werte = art === "watt" ? S.kurve.map((k) => k.w) : S.balken.map((b) => b.kwh);
    const oben = drGrenze(Math.max(0, ...werte.filter((v) => v != null)) * (art === "kwh" && werte.length <= 7 ? 1.18 : 1.05));
    const y = (v) => O + ph - (v / oben) * ph;
    const n = werte.length;
    let svg = "";
    for (let i = 0; i <= 4; i++) {
      const v = (oben / 4) * i, yy = y(v).toFixed(1);
      svg += `<line class="dr-dg-gitter" x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}"/><text class="dr-dg-achse" x="${L - 6}" y="${(+yy + 3.5).toFixed(1)}" text-anchor="end">${zahl(v, art === "watt" ? 0 : oben <= 2 ? 2 : oben <= 20 ? 1 : 0)}</text>`;
    }
    svg += `<text class="dr-dg-achse dr-dg-einheit" x="${L - 6}" y="${O - 12}" text-anchor="end">${art === "watt" ? "W" : "kWh"}</text>`;
    if (art === "watt") {
      // Marken der x-Achse: alle 6 Stunden, jeden Tag bzw. jeden 5. Tag
      const x = (t) => L + ((t - S.start) / (S.ende - S.start)) * pw;
      const marken = [];
      const t = new Date(S.start); t.setMinutes(0, 0, 0);
      if (B.periode === "hour") { t.setHours(Math.ceil(t.getHours() / 6) * 6); for (let m = t.getTime(); m < S.ende; m += 6 * 3600e3) marken.push(m); }
      else {
        t.setHours(0); t.setDate(t.getDate() + 1);
        for (let k = 0; t.getTime() < S.ende; k++, t.setDate(t.getDate() + 1)) if (B.ms < 8 * 86400e3 || k % 5 === 0) marken.push(t.getTime());
      }
      marken.forEach((m) => {
        const xx = x(m);
        if (xx > L + 10 && xx < W - R - 10) svg += `<line class="dr-dg-strich" x1="${xx.toFixed(1)}" x2="${xx.toFixed(1)}" y1="${O + ph}" y2="${O + ph + 4}"/><text class="dr-dg-achse" x="${xx.toFixed(1)}" y="${H - 5}" text-anchor="middle">${this._drStromZeit(m, "watt")}</text>`;
      });
      // Fläche und Linie, Lücken ohne Messung bleiben offen
      const bw = pw / n;
      let linie = "", flaeche = "", offen = false;
      werte.forEach((v, k) => {
        const xx = (L + bw * (k + 0.5)).toFixed(1);
        if (v == null) { if (offen) { flaeche += `L${(L + bw * (k - 0.5)).toFixed(1)},${O + ph}Z`; offen = false; } return; }
        const yy = y(v).toFixed(1);
        if (!offen) { linie += `M${xx},${yy}`; flaeche += `M${xx},${O + ph}L${xx},${yy}`; offen = true; }
        else { linie += `L${xx},${yy}`; flaeche += `L${xx},${yy}`; }
      });
      if (offen) flaeche += `L${(L + bw * (n - 0.5)).toFixed(1)},${O + ph}Z`;
      svg = `<defs><linearGradient id="dr-dg-verlauf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3ee6a8" stop-opacity=".45"/><stop offset="1" stop-color="#3ee6a8" stop-opacity="0"/></linearGradient></defs>${svg}
        <path class="dr-dg-flaeche" d="${flaeche}" fill="url(#dr-dg-verlauf)"/><path class="dr-dg-linie" d="${linie}"/>`;
    } else {
      const bw = pw / n, luecke = Math.min(8, bw * 0.28);
      const preis = this._drStromPreis().preis;
      const jede = n <= 8 ? 1 : n <= 24 ? 6 : 5;
      S.balken.forEach((b, k) => {
        const xx = L + bw * k + luecke / 2, w = bw - luecke;
        if (b.kwh != null && b.kwh > 0) {
          const h = Math.max(1.5, O + ph - y(b.kwh));
          svg += `<rect class="dr-dg-saeule" data-i="${k}" x="${xx.toFixed(1)}" y="${(O + ph - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(4, w / 3).toFixed(1)}" style="animation-delay:${k * 12}ms"/>`;
          if (n <= 8) svg += `<text class="dr-dg-wert" x="${(xx + w / 2).toFixed(1)}" y="${(O + ph - h - 4).toFixed(1)}" text-anchor="middle">${zahl(b.kwh * preis, 2)} €</text>`;
        }
        if (k % jede === 0) svg += `<text class="dr-dg-achse" x="${(xx + w / 2).toFixed(1)}" y="${H - 5}" text-anchor="middle">${this._drStromZeit(b.t, "kwh")}</text>`;
      });
    }
    svg += `<line class="dr-dg-zeiger" x1="0" x2="0" y1="${O}" y2="${O + ph}" style="display:none"/>${art === "watt" ? `<circle class="dr-dg-punkt" r="4" cx="0" cy="0" style="display:none"/>` : ""}
      <rect class="dr-dg-fang" x="${L}" y="${O}" width="${pw}" height="${ph}" fill="transparent"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${art === "watt" ? "Leistung über die Zeit" : "Energie pro Abschnitt"}" data-w="${W}" data-l="${L}" data-pw="${pw}" data-o="${O}" data-ph="${ph}" data-oben="${oben}">${svg}</svg>`;
  },
  _drDiagrammInfo(art, k) {
    const S = this._drStrom;
    if (art === "watt") {
      const p = S.kurve[k];
      if (!p) return "";
      return `<span>${esc(this._drStromZeit(p.t + (S.ende - S.start) / S.kurve.length / 2, "watt", true))}</span><strong>${p.w == null ? "keine Messung" : `${zahl(p.w, p.w < 10 ? 1 : 0)} W`}</strong>${p.max != null && p.w != null && p.max > p.w * 1.2 + 1 ? `<small>Spitze ${zahl(p.max)} W</small>` : ""}`;
    }
    const b = S.balken[k];
    if (!b) return "";
    const preis = this._drStromPreis().preis;
    return `<span>${esc(this._drStromZeit(b.t, "kwh", true))}</span><strong>${b.kwh == null ? "keine Messung" : `${zahl(b.kwh, 2)} kWh`}</strong>${b.kwh != null ? `<small>${zahl(b.kwh * preis, 2)} €</small>` : ""}`;
  },
  // Antippen/Darüberfahren zeigt den Wert an der Stelle (ohne neu zu zeichnen)
  _drDiagrammeVerbinden() {
    this.shadowRoot.querySelectorAll(".dr-diagramm[data-art]").forEach((box) => {
      const svg = box.querySelector("svg"), info = box.querySelector(".dr-dg-info");
      if (!svg || !info || svg.dataset.verbunden) return;
      svg.dataset.verbunden = "1";
      const art = box.dataset.art, S = this._drStrom;
      const n = art === "watt" ? S.kurve.length : S.balken.length;
      const d = (k) => Number(svg.dataset[k]);
      const zeiger = svg.querySelector(".dr-dg-zeiger"), punkt = svg.querySelector(".dr-dg-punkt");
      const standard = info.innerHTML;
      const zeigen = (e) => {
        const r = svg.getBoundingClientRect();
        const vx = ((e.clientX - r.left) / r.width) * d("w");
        const k = Math.max(0, Math.min(n - 1, Math.floor(((vx - d("l")) / d("pw")) * n)));
        const x = d("l") + (d("pw") / n) * (k + 0.5);
        zeiger.setAttribute("x1", x); zeiger.setAttribute("x2", x); zeiger.style.display = "";
        svg.querySelectorAll(".dr-dg-saeule.an").forEach((s) => s.classList.remove("an"));
        const saeule = svg.querySelector(`.dr-dg-saeule[data-i="${k}"]`);
        if (saeule) saeule.classList.add("an");
        if (punkt) {
          const w = S.kurve[k] && S.kurve[k].w;
          if (w == null) punkt.style.display = "none";
          else { punkt.setAttribute("cx", x); punkt.setAttribute("cy", d("o") + d("ph") - (w / d("oben")) * d("ph")); punkt.style.display = ""; }
        }
        info.innerHTML = this._drDiagrammInfo(art, k);
        info.classList.add("an");
      };
      svg.addEventListener("pointermove", zeigen);
      svg.addEventListener("pointerdown", zeigen);
      svg.addEventListener("pointerleave", (e) => {
        if (e.pointerType === "touch") return;   // am Handy bleibt der angetippte Wert stehen
        zeiger.style.display = "none"; if (punkt) punkt.style.display = "none";
        svg.querySelectorAll(".dr-dg-saeule.an").forEach((s) => s.classList.remove("an"));
        info.innerHTML = standard; info.classList.remove("an");
      });
    });
  },
  _drStromSheetHtml() {
    const S = this._drStrom || { bereich: "24h", laedt: true };
    const B = DR_STROM_BEREICHE[S.bereich];
    const w = this._drZ("watt", true);
    const { preis, quelle } = this._drStromPreis();
    let inhalt;
    if (S.laedt) inhalt = `<div class="dr-dg-laedt"><span class="dreher"></span><span class="leise klein">Lade Verlauf …</span></div>`;
    else if (S.fehler) inhalt = `<div class="hinweis amber">Der Verlauf konnte nicht geladen werden: ${esc(S.fehler)}</div>`;
    else {
      const kachel = (wert, name) => `<div><span>${name}</span><strong>${wert}</strong></div>`;
      inhalt = `<div class="dr-werte dr-strom-summen">
          ${kachel(`${zahl(S.summe, S.summe < 10 ? 2 : 1)} kWh`, "Verbrauch")}${kachel(`${zahl(S.summe * preis, 2)} €`, "Kosten")}
          ${kachel(S.schnitt == null ? "–" : `${zahl(S.schnitt, S.schnitt < 10 ? 1 : 0)} W`, "Ø Leistung")}${kachel(S.spitze == null ? "–" : `${zahl(S.spitze)} W`, "Spitze")}</div>
        <div class="dr-diagramm" data-art="watt"><div class="dr-dg-kopf"><h3>Leistung</h3><div class="dr-dg-info"><span class="leise">Antippen für Werte</span></div></div>${this._drDiagrammSvg("watt")}</div>
        <div class="dr-diagramm" data-art="kwh"><div class="dr-dg-kopf"><h3>${B.periode === "hour" ? "Energie pro Stunde" : "Energie pro Tag"}</h3><div class="dr-dg-info"><span class="leise">${B.periode === "hour" ? "Säule antippen" : "Tag antippen"}</span></div></div>${this._drDiagrammSvg("kwh")}</div>
        <p class="leise klein dr-strom-fuss">Strompreis ${zahl(preis, 2)} €/kWh${quelle === "Standard" ? " (Standardwert)" : ` (aus den ${quelle}-Einstellungen)`} · Energie: ${esc(S.quelle)}</p>`;
      setTimeout(() => this._drDiagrammeVerbinden(), 0);
    }
    return `<div class="schleier" data-aktion="dialog-zu" data-einmal="schleier-dr-strom"></div>
      <section class="sheet dr-strom-sheet" data-einmal="sheet-dr-strom" role="dialog" aria-label="Stromverbrauch">
        <div class="griff"></div>
        <header class="sheet-kopf"><div class="sheet-titel"><h2>⚡ Stromverbrauch</h2>
          <div class="sub">Steckdose „${esc(this._drSteckdoseName())}“${w != null ? ` · jetzt ${zahl(w, w < 10 ? 1 : 0)} W` : ""}</div></div>
          <button class="icon-knopf" data-aktion="dialog-zu" aria-label="Schließen">✕</button></header>
        <div class="sheet-inhalt">
          <div class="chips dr-strom-bereiche" role="tablist">${Object.entries(DR_STROM_BEREICHE).map(([k, b]) =>
            `<button class="chip ${k === S.bereich ? "an" : ""}" data-aktion="dr-strom-bereich" data-b="${k}" role="tab" aria-selected="${k === S.bereich}">${b.name}</button>`).join("")}</div>
          <div class="dr-strom-inhalt" data-einmal="dr-strom-${S.bereich}-${S.laedt ? "l" : "f"}">${inhalt}</div>
        </div>
      </section>`;
  },

  // Zusätzliche Dialoge dieser Ansicht (von panel.js _dialogHtml aufgerufen)
  _drDialogeHtml() {
    if (this._dialog === "dr-strom") return this._drStromSheetHtml();
    if (this._dialog === "dr-steuer") return `<div class="schleier oben" data-aktion="dialog-zu" data-einmal="schleier-dr-st"></div><div class="dialog" role="alertdialog" data-einmal="dialog-dr-st">${this._drSteuerDialogHtml()}</div>`;
    return "";
  },

  // ---- Eingaben, von panel.js weitergereicht -----------------------------
  _drEingabe(t) {
    if (t.dataset.drTemp != null) { (this._drTempEntwurf = this._drTempEntwurf || {})[t.dataset.drTemp] = t.value; t.classList.remove("fehler"); return true; }
    if (t.dataset.drLuefter != null) { this._drLuefterEntwurf = t.value; return true; }
    return false;
  },
  _drAenderung(t) {
    if (t.dataset.dr === "geladen") { if (t.value) this._drLadenSetzen(t.value); return true; }
    return false;
  },
  _drTaste(e) {
    const t = e.target;
    if (e.key !== "Enter" || !t.dataset) return false;
    if (t.dataset.drTemp != null) { e.preventDefault(); this._drTempAnfrage(t.dataset.drTemp, t.value); return true; }
    if (t.dataset.drLuefter != null) { e.preventDefault(); this._drLuefterSetzen(t.value); return true; }
    return false;
  },

  _drKlick(a, el) {
    switch (a) {
      case "dr-laden": this._drLadenSetzen(el.dataset.id); return;
      case "dr-temp": {
        const k = el.dataset.k;
        let roh = el.dataset.wert;
        if (roh == null) {
          const i = this.shadowRoot.querySelector(`[data-dr-temp="${k}"]`);
          roh = i ? i.value : "";
          (this._drTempEntwurf = this._drTempEntwurf || {})[k] = roh;
        }
        this._drTempAnfrage(k, roh);
        return;
      }
      case "dr-temp-ok": this._drTempSenden(); return;
      case "dr-luefter": this._drLuefterK = el.dataset.k; this._drLuefterEntwurf = null; this._dialog = "dr-luefter"; break;
      case "dr-luefter-setzen": {
        const i = this.shadowRoot.querySelector("[data-dr-luefter]");
        this._drLuefterSetzen(el.dataset.wert != null ? el.dataset.wert : i ? i.value : "");
        return;
      }
      case "dr-schalten":
        this._drSchaltZiel = el.dataset.ziel;
        if (el.dataset.ziel === "aus" && this._drRuhig()) { this._drSchalten(); return; }   // Ruhezustand: direkt aus
        this._dialog = "dr-schalten";
        break;
      case "dr-schalten-ok": this._drSchalten(); return;
      case "dr-alle": this._drAlle = !this._drAlle; break;
      case "dr-strom": this._dialog = "dr-strom"; this._drStromLaden(); break;
      case "dr-strom-bereich": this._drStromLaden(el.dataset.b); break;
      case "dr-steuer":
        if (el.dataset.art === "fortsetzen") { this._drSteuerSenden("fortsetzen"); return; }   // Weitermachen ohne Nachfrage
        this._drSteuerArt = el.dataset.art; this._dialog = "dr-steuer";
        break;
      case "dr-steuer-ok": this._drSteuerSenden(this._drSteuerArt); return;
      case "dr-licht": this._drLichtSchalten(); return;
      case "dr-tempo": this._drTempoSetzen(el.dataset.wert); return;
      case "dr-neu-laden": this._drVerlauf = null; this._drVerlaufLaden(); break;
      case "dr-druck": this._drOffen = el.dataset.uid; this._dialog = "dr-druck"; break;
      case "dr-kommentar-speichern": {
        const text = (this.shadowRoot.getElementById("dr-kommentar").value || "").trim();
        this._daten.drucke = this._daten.drucke || {};
        this._daten.drucke[this._drOffen] = { ...(this._daten.drucke[this._drOffen] || {}), kommentar: text };
        this._dialog = null;
        this._speichern();
        this._toast("Kommentar gespeichert.");
        return;
      }
      default: return;
    }
    this._zeichnen();
  },
};
