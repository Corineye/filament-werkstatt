
// ============================================================================
// Notizbuch: alle Notizen an einem Ort (Rollen, Fehldrucke, Drucke) plus eigene Einträge und Erinnerungen
// ============================================================================
const NotizAnsicht = {
  _nbHtml() { return `<div class="karte"><h2>Notizbuch</h2><p class="leise">Kommt gleich.</p></div>`; },
  _nbKlick(a, el) { this._zeichnen(); },
};
