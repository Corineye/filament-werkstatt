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
  // Zum Einstellen (ha-bambulab: number.target_*_temperature, fan.*_fan). Mehrere Namen/IDs je nach Version.
  duese_soll: ["Zieltemperatur der Düse", "number.p1s_01p00c572701906_zieltemperatur_der_duse"],
  bett_soll: [["Zieltemperatur des Druckbett", "Zieltemperatur vom Druckbett", "Zieltemperatur des Druckbetts"],
    "number.p1s_01p00c572701906_zieltemperatur_des_druckbett", "number.p1s_01p00c572701906_zieltemperatur_vom_druckbett"],
  f_kopf: ["Druckkopflüfter", "fan.p1s_01p00c572701906_druckkopflufter"],
  f_bauteil: ["Bauteillüfter", "fan.p1s_01p00c572701906_bauteillufter"],
  f_raum: ["Druckraumlüfter", "fan.p1s_01p00c572701906_druckraumlufter"],
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
    this._drKameraPruefen();
  },

  _drHtml() {
    if (!this._drVerlauf && !this._drVerlaufLaedt) this._drVerlaufLaden();
    const zustand = this._drZustand();
    this._drLetzterZustand = zustand;
    setTimeout(() => this._drKameraPruefen(), 0);
    return `<div class="dr-raster">
        <div class="dr-spalte">
          <section id="dr-live-kopf" class="dr-live">${this._drLiveHtml("kopf")}</section>
          ${this._drFilamentHtml()}
          <section id="dr-live" class="dr-live">${this._drLiveHtml("rest")}</section>
        </div>
        <div class="dr-spalte">
          ${this._drKameraHtml(zustand)}
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

  // Statuskarte oben (Ring, Name, Restzeit) bzw. „Drucker ist aus“
  _drKopfHtml(zustand, z) {
    let html = "";

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
    return html;
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
    html += `<div class="dr-karte"><h3 class="dr-titel">⚡ Strom</h3><div class="dr-werte dr-werte-3">
      <div><span>Jetzt</span><strong>${w == null ? "–" : `${zahl(w, w < 10 ? 1 : 0)} W`}</strong></div>
      <div><span>Heute</span><strong>${this._drZ("heute", true) == null ? "–" : `${zahl(this._drZ("heute", true), 2)} kWh`}</strong></div>
      <div><span>Diesen Monat</span><strong>${this._drZ("monat", true) == null ? "–" : `${zahl(this._drZ("monat", true), 2)} kWh`}</strong></div>
    </div><div class="dr-steckdose"><span class="leise klein">Steckdose: ${this._drW("schalter", true) === "on" ? "an" : this._drW("schalter", true) === "off" ? "aus" : "nicht gefunden"}</span>
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

  // ---- Steckdose schalten (immer mit Nachfrage) --------------------------
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
    const status = this._drZustand();
    const druckt = ["running", "pause", "prepare", "slicing"].includes(status);
    const duese = this._drZ("duese");
    const heiss = duese != null && duese > 50;
    return `<h2>Drucker ausschalten?</h2>
      ${druckt ? `<div class="hinweis rot-hinweis"><strong>Achtung, es läuft ein Druck.</strong> Ausschalten bricht ihn sofort ab und er ist verloren.</div>` : ""}
      ${heiss ? `<div class="hinweis amber">Die Düse ist noch ${zahl(duese)} °C heiß. Der Hotend-Lüfter braucht Strom, um sie abzukühlen. Besser warten, bis sie unter 50 °C ist, sonst kann das Filament im Hotend verstopfen.</div>` : ""}
      ${!druckt && !heiss ? `<p class="leise">Die Steckdose „${esc(this._drSteckdoseName())}“ wird ausgeschaltet. Es läuft kein Druck und die Düse ist kalt.</p>` : ""}
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
      case "dr-schalten": this._drSchaltZiel = el.dataset.ziel; this._dialog = "dr-schalten"; break;
      case "dr-schalten-ok": this._drSchalten(); return;
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
