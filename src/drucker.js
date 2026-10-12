// ---------------------------------------------------------------------------
// Drucker: Live-Ansicht des Bambu Lab P1S und der Steckdose aus Home Assistant,
// Kamera und Druckverlauf (Liste „3D-Drucke“, von der Automation befüllt)
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
    const [name, id] = (steckdose ? DR_STECKDOSE_ENTITAETEN : DR_ENTITAETEN)[schluessel];
    const voll = steckdose ? (name ? `${DR_STECKDOSE} ${name}` : DR_STECKDOSE) : `${DR_GERAET} ${name}`;
    const gefunden = this._drNamen[`${id.split(".")[0]}|${voll}`] || (states[id] ? id : null);
    this._drIds[k] = gefunden;
    return gefunden;
  },
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
    if (!live) return;
    const zustand = this._drZustand();
    if (zustand !== this._drLetzterZustand) { this._zeichnen(); return; }   // z. B. eingeschaltet: alles neu
    live.innerHTML = this._drLiveHtml();
    this._drKameraPruefen();
  },

  _drHtml() {
    if (!this._drVerlauf && !this._drVerlaufLaedt) this._drVerlaufLaden();
    const zustand = this._drZustand();
    this._drLetzterZustand = zustand;
    setTimeout(() => this._drKameraPruefen(), 0);
    return `<div class="dr-raster">
        <div class="dr-spalte">
          <section id="dr-live" class="dr-live">${this._drLiveHtml()}</section>
        </div>
        <div class="dr-spalte">
          ${this._drKameraHtml(zustand)}
          ${this._drVerlaufHtml()}
        </div>
      </div>`;
  },

  _drLiveHtml() {
    const zustand = this._drZustand();
    const z = (k, nk = 0) => { const v = this._drZ(k); return v == null ? "–" : zahl(v, nk); };
    let html = "";

    if (zustand === "aus" || zustand === "startet" || zustand === "offline") {
      const text = zustand === "aus" ? ["Drucker ist aus", "Die Steckdose ist ausgeschaltet. Schalte sie ein, dann erscheinen hier nach etwa 15–30 Sekunden die Werte."]
        : zustand === "startet" ? ["Drucker startet …", "Die Steckdose ist an. Der Drucker meldet sich meist nach 15–30 Sekunden. Bis dahin sind die Werte vom letzten Druck."]
        : ["Drucker nicht erreichbar", "Home Assistant bekommt gerade keine Werte vom Drucker (Bambu-Cloud oder WLAN)."];
      html += `<div class="dr-karte dr-aus"><div class="dr-aus-icon">${zustand === "startet" ? '<span class="dreher"></span>' : "⏻"}</div>
        <div><h2>${text[0]}</h2><p class="leise">${text[1]}</p></div></div>`;
    } else {
      const [statusText, statusFarbe] = DR_STATUS[zustand] || [zustand, "leise"];
      const schritt = this._drW("schritt");
      const druckt = ["running", "pause", "prepare", "slicing"].includes(zustand);
      const fortschritt = this._drZ("fortschritt") || 0;
      const restH = this._drZ("rest_h");
      const ende = this._drW("ende");
      const bild = this._drS("titelbild");
      const bildUrl = druckt && bild && bild.attributes.entity_picture;
      const name = this._drW("name");
      const restText = restH == null ? "–" : restH >= 1 ? `${Math.floor(restH)} h ${Math.round((restH % 1) * 60)} min` : `${Math.round(restH * 60)} min`;
      const endeText = ende && !isNaN(new Date(ende)) ? new Date(ende).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "–";
      html += `<div class="dr-karte dr-status">
        <div class="dr-ring">${ringSvg(druckt || zustand === "finish" ? fortschritt : 0, statusFarbe === "rot" ? "var(--rot)" : statusFarbe === "amber" ? "var(--amber)" : "var(--mint)")}
          <div class="dr-ring-text"><strong>${druckt || zustand === "finish" ? `${zahl(fortschritt)} %` : "–"}</strong><span>${druckt ? `Schicht ${z("schicht")}/${z("schichten")}` : ""}</span></div></div>
        <div class="dr-status-text">
          <span class="pille ${statusFarbe}">${statusText}</span>
          <h2>${druckt || zustand === "finish" || zustand === "failed" ? esc(name || "Druck") : "Bereit zum Drucken"}</h2>
          ${schritt && schritt !== "idle" && schritt !== "printing" ? `<p class="leise">${esc(DR_SCHRITTE[schritt] || schritt.replace(/_/g, " "))}</p>` : ""}
          ${druckt ? `<div class="dr-werte"><div><span>Restzeit</span><strong>${restText}</strong></div><div><span>Fertig um</span><strong>${endeText}</strong></div>
            <div><span>Gewicht</span><strong>${z("gewicht", 1)} g</strong></div></div>` : ""}
        </div>
        ${bildUrl ? `<img class="dr-titelbild" src="${esc(bildUrl)}" alt="">` : ""}
      </div>`;
      if (this._drW("hms") === "on" || this._drW("fehler") === "on") {
        html += `<div class="hinweis rot-hinweis">⚠️ Der Drucker meldet einen Fehler. Details stehen in der Bambu-App bzw. am Drucker.</div>`;
      }
    }

    const aus = ["aus", "startet", "offline"].includes(zustand);
    // Temperaturen
    const temp = (titel, ist, ziel, max) => {
      const i = this._drZ(ist), s = this._drZ(ziel);
      const heizt = s && i != null && Math.abs(s - i) > 3;
      const breite = Math.max(0, Math.min(100, ((i || 0) / max) * 100));
      return `<div class="dr-temp">
        <div class="dr-temp-kopf"><span>${titel}</span><strong>${i == null ? "–" : zahl(i)} °C</strong></div>
        <div class="dr-balken"><i style="width:${breite}%;background-size:${breite > 0 ? 10000 / breite : 100}% 100%"></i>${s ? `<b style="left:${Math.min(100, (s / max) * 100)}%"></b>` : ""}</div>
        <small class="${heizt ? "amber" : "leise"}">${s ? `Ziel ${zahl(s)} °C${heizt ? (s > i ? " · heizt auf" : " · kühlt ab") : " · erreicht"}` : "aus"}</small>
      </div>`;
    };
    if (!aus) html += `<div class="dr-karte"><h3 class="dr-titel">🌡️ Temperaturen</h3>
      ${temp("Düse", "duese", "duese_ziel", 300)}${temp("Druckbett", "bett", "bett_ziel", 110)}</div>`;

    // Lüfter
    const luefter = [["Bauteil", "l_bauteil"], ["Druckkopf", "l_kopf"], ["Hotend", "l_hotend"], ["Druckraum", "l_raum"]].filter(([, k]) => this._drId(k));
    if (luefter.length && !aus) {
      html += `<div class="dr-karte"><h3 class="dr-titel">🌀 Lüfter</h3><div class="dr-luefter">${luefter.map(([n, k]) => {
        const v = this._drZ(k) || 0;
        return `<div class="dr-l"><span class="dr-l-icon ${v > 0 ? "dreht" : ""}" style="--dauer:${v > 0 ? Math.max(0.25, 2 - v / 60) : 0}s">✣</span><strong>${zahl(v)} %</strong><small>${n}</small></div>`;
      }).join("")}</div></div>`;
    }

    // Strom aus der Steckdose
    const w = this._drZ("watt", true);
    html += `<div class="dr-karte"><h3 class="dr-titel">⚡ Strom</h3><div class="dr-werte dr-werte-3">
      <div><span>Jetzt</span><strong>${w == null ? "–" : `${zahl(w, w < 10 ? 1 : 0)} W`}</strong></div>
      <div><span>Heute</span><strong>${this._drZ("heute", true) == null ? "–" : `${zahl(this._drZ("heute", true), 2)} kWh`}</strong></div>
      <div><span>Diesen Monat</span><strong>${this._drZ("monat", true) == null ? "–" : `${zahl(this._drZ("monat", true), 2)} kWh`}</strong></div>
    </div><p class="leise klein">Steckdose: ${this._drW("schalter", true) === "on" ? "an" : this._drW("schalter", true) === "off" ? "aus" : "nicht gefunden"}</p></div>`;

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

  // ---- Kamera: Standbild alle 10 s, auf Wunsch live -----------------------
  _drKameraHtml(zustand) {
    const an = !["aus", "startet", "offline"].includes(zustand) && this._drS("kamera");
    return `<div class="dr-karte dr-kamera-karte">
      <div class="dr-kamera-kopf"><h3 class="dr-titel">📷 Kamera</h3>
        ${an ? `<button class="chip ${this._drLive ? "an" : ""}" data-aktion="dr-live">${this._drLive ? "● Live" : "Live ansehen"}</button>` : ""}</div>
      <div class="dr-kamera">${an ? `<img id="dr-kamera-bild" alt="Kamerabild">` : `<div class="dr-kamera-leer">${zustand === "aus" ? "Drucker ist aus" : "Kein Bild"}</div>`}</div>
      ${an && !this._drLive ? `<p class="leise klein">Standbild, wird alle 10 Sekunden erneuert.</p>` : ""}
    </div>`;
  },
  _drKameraPruefen() {
    const img = this.shadowRoot.getElementById("dr-kamera-bild");
    const s = this._drS("kamera");
    clearTimeout(this._drKameraTimer);
    if (!img || !s) return;
    const token = s.attributes.access_token;
    const id = s.entity_id || this._drId("kamera");
    const url = this._drLive
      ? (token ? `/api/camera_proxy_stream/${id}?token=${token}` : s.attributes.entity_picture)
      : `${token ? `/api/camera_proxy/${id}?token=${token}` : s.attributes.entity_picture}${(token ? "&" : (s.attributes.entity_picture || "").includes("?") ? "&" : "?")}t=${Date.now()}`;
    if (this._drLive) { if (img.dataset.url !== url) { img.src = url; img.dataset.url = url; } return; }
    // Neues Bild erst laden, dann tauschen (kein Flackern)
    const neu = new Image();
    neu.onload = () => { if (img.isConnected) img.src = neu.src; };
    neu.src = url;
    if (!img.src) img.src = url;
    this._drKameraTimer = setTimeout(() => this._drKameraPruefen(), 10000);
  },

  // ---- Druckverlauf ------------------------------------------------------
  async _drVerlaufLaden() {
    this._drVerlaufLaedt = true;
    try {
      const r = await this._hass.callWS({ type: "todo/item/list", entity_id: DR_LISTE });
      this._drVerlauf = (r.items || []).map(druckDaten).sort((a, b) => (b.start || "").localeCompare(a.start || ""));
      this._drVerlaufFehler = null;
    } catch (e) {
      this._drVerlauf = [];
      this._drVerlaufFehler = e.message || String(e);
    }
    this._drVerlaufLaedt = false;
    if (this._ansicht === "drucker") this._zeichnen();
    this._drFotosLaden();
  },
  async _drFotosLaden() {
    this._drFotos = this._drFotos || {};
    for (const d of (this._drVerlauf || []).slice(0, 12)) {
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
    const liste = this._drVerlauf;
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
        const [st, farbe] = d.status === "finish" ? ["fertig", "mint"] : d.status === "failed" ? ["fehlgeschlagen", "rot"] : d.status === "laeuft" ? ["ohne Abschluss", "amber"] : [d.status, "leise"];
        return `<button class="dr-druck" data-aktion="dr-druck" data-uid="${esc(d.uid)}">
          <span class="ld-bild" data-foto="${esc(f || "")}">${foto ? `<img src="${esc(foto)}" alt="">` : "🖼️"}</span>
          <span class="dr-druck-text"><strong>${esc(d.name)}</strong>
            <small>${esc(d.zeit)}${d.gewicht != null ? ` · ${zahl(d.gewicht, 1)} g` : ""}${d.duese_mm ? ` · ${zahl(d.duese_mm, 1)} mm Düse` : ""}</small>
            ${extra.kommentar ? `<small class="dr-kommentar">💬 ${esc(extra.kommentar)}</small>` : ""}</span>
          <span class="pille ${farbe}">${st}</span>
        </button>`;
      }).join("")}</div>
      ${liste.length > 8 ? `<button class="mini mint-rand" data-aktion="dr-alle">${this._drAlle ? "Weniger zeigen" : `Alle ${liste.length} Drucke zeigen`}</button>` : ""}`;
    }
    return `<div class="dr-karte"><div class="dr-kamera-kopf"><h3 class="dr-titel">🗂️ Druckverlauf</h3>
      <button class="chip" data-aktion="dr-neu-laden">↻ Aktualisieren</button></div>${inhalt}</div>`;
  },

  _drDialogHtml() {
    const d = (this._drVerlauf || []).find((x) => x.uid === this._drOffen);
    if (!d) return "";
    const extra = (this._daten.drucke || {})[d.uid] || {};
    const f = fotoName(d);
    const foto = f && this._drFotos && this._drFotos[f];
    const zeile = (n, v) => (v == null || v === "" ? "" : `<div class="info-zeile"><span>${n}</span><strong>${esc(v)}</strong></div>`);
    const dauer = d.start && d.ende ? Math.round((new Date(d.ende) - new Date(d.start)) / 60000) : null;
    return `<h2>${esc(d.name)}</h2><p class="leise">${esc(d.zeit)}</p>
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
      <h3>Kommentar</h3>
      <textarea id="dr-kommentar" rows="4" placeholder="z. B. warum abgebrochen, was du gelernt hast …">${esc(extra.kommentar || "")}</textarea>
      <div class="knopf-reihe oben-abstand"><button class="knopf leise" data-aktion="dialog-zu">Schließen</button>
        <button class="knopf" data-aktion="dr-kommentar-speichern">Speichern</button></div>`;
  },

  _drKlick(a, el) {
    switch (a) {
      case "dr-live": this._drLive = !this._drLive; break;
      case "dr-alle": this._drAlle = !this._drAlle; break;
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
