// Filament-Werkstatt – Platzhalter mit Systemcheck (v0.1)
// Prüft, ob das Panel alles erreicht, was die Website später braucht.
const P = "sensor.p1s_01p00c572701906_";
const SENSOREN = [
  "druckstatus", "name_der_aufgabe", "gewicht_des_drucks", "drucklange",
  "zieltemperatur_der_duse", "zieltemperatur_vom_druckbett", "startzeit",
  "druckfortschritt", "dusengrosse", "temperatur_der_duse", "druckbetttemperatur",
];
const SPEICHER_KEY = "filament_werkstatt_test";

class FilamentWerkstattPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._gestartet = false;
    this._ergebnisse = [];
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._gestartet) {
      this._gestartet = true;
      this._pruefen();
    }
  }

  set narrow(_) {}
  set panel(_) {}

  _eintrag(titel, ok, details) {
    this._ergebnisse.push({ titel, ok, details });
    this._zeichnen();
  }

  async _pruefen() {
    const hass = this._hass;
    this._zeichnen();

    // 1. Drucker-Sensoren
    const fehlen = SENSOREN.filter((s) => !hass.states[P + s]);
    this._eintrag(
      "Drucker-Sensoren",
      fehlen.length === 0,
      fehlen.length === 0
        ? `Alle ${SENSOREN.length} gefunden, Druckstatus: ${hass.states[P + "druckstatus"].state}`
        : `Nicht gefunden: ${fehlen.join(", ")}`
    );

    // 2. Kamera
    const kameras = Object.keys(hass.states).filter(
      (id) => id.startsWith("camera.") && id.includes("p1s")
    );
    this._eintrag(
      "Drucker-Kamera",
      kameras.length > 0,
      kameras.length > 0 ? kameras.join(", ") : "Keine Kamera mit „p1s“ im Namen gefunden"
    );

    // 3. To-do-Liste direkt lesen
    try {
      const r = await hass.callWS({ type: "todo/item/list", entity_id: "todo.3d_drucke" });
      const n = (r.items || []).length;
      const erster = n ? `, z. B. „${r.items[0].summary}“` : "";
      this._eintrag("To-do-Liste lesen", true, `${n} Einträge lesbar${erster}`);
    } catch (e) {
      this._eintrag("To-do-Liste lesen", false, e.message || String(e));
    }

    // 4. Daten in Home Assistant speichern und wieder lesen
    try {
      const wert = { test: new Date().toISOString() };
      await hass.callWS({ type: "frontend/set_user_data", key: SPEICHER_KEY, value: wert });
      const r = await hass.callWS({ type: "frontend/get_user_data", key: SPEICHER_KEY });
      const ok = r && r.value && r.value.test === wert.test;
      this._eintrag("Daten speichern", ok, ok ? "Speichern und Lesen klappt" : "Gelesener Wert passt nicht");
    } catch (e) {
      this._eintrag("Daten speichern", false, e.message || String(e));
    }

    // 5. Medienordner
    try {
      const r = await hass.callWS({ type: "media_source/browse_media", media_content_id: "media-source://media_source" });
      const namen = (r.children || []).map((c) => c.title).join(", ");
      this._eintrag("Medienordner", true, namen ? `Erreichbar: ${namen}` : "Erreichbar");
    } catch (e) {
      this._eintrag("Medienordner", false, e.message || String(e));
    }

    this._fertig = true;
    this._zeichnen();
  }

  _zeichnen() {
    const zeilen = this._ergebnisse
      .map(
        (e) => `<li class="${e.ok ? "ok" : "fehler"}">
          <span class="punkt">${e.ok ? "✓" : "✕"}</span>
          <div><strong>${e.titel}</strong><small>${e.details}</small></div>
        </li>`
      )
      .join("");
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; min-height: 100%; background: #0b0f0d; color: #e6efe9;
          font-family: system-ui, sans-serif; padding: 24px 16px; box-sizing: border-box; }
        .karte { max-width: 640px; margin: 0 auto; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; }
        h1 { margin: 0 0 4px; font-size: 22px; }
        p { margin: 0 0 20px; color: #9fb3a8; }
        ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
        li { display: flex; gap: 12px; align-items: flex-start; padding: 12px;
          border-radius: 12px; background: rgba(255,255,255,0.03); }
        .punkt { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center;
          flex: none; font-weight: 700; }
        .ok .punkt { background: #3ee6a8; color: #0b0f0d; }
        .fehler .punkt { background: #ff6b6b; color: #0b0f0d; }
        strong { display: block; }
        small { color: #9fb3a8; word-break: break-word; }
      </style>
      <div class="karte">
        <h1>Filament-Werkstatt</h1>
        <p>${this._fertig ? "Systemcheck abgeschlossen. Schick Claude einen Screenshot dieser Seite." : "Systemcheck läuft …"}</p>
        <ul>${zeilen}</ul>
      </div>`;
  }
}

customElements.define("filament-werkstatt-panel", FilamentWerkstattPanel);
