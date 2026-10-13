
// ============================================================================
// Start: die wichtigsten aktuellen Infos auf einen Blick, jede Kachel führt zu den Details
// ============================================================================
const StartAnsicht = {
  _stHtml() { return `<div class="karte"><h2>Übersicht</h2><p class="leise">Kommt gleich.</p></div>`; },
  _stKlick(a, el) { this._zeichnen(); },
};
