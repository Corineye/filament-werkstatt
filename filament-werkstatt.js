// Filament-Werkstatt – Lader. Diese Datei ändert sich nie, deshalb ist es egal,
// wenn der Browser sie zwischenspeichert. Sie fragt bei jedem Öffnen die aktuelle
// Versionsnummer ab (nie aus dem Zwischenspeicher) und lädt dann genau diese
// Version der Seite. Nach einem HACS-Update reicht also ein Neuladen der Seite.
const basis = new URL(".", import.meta.url);
let version = null;
try {
  const v = await import(new URL(`filament-werkstatt-version.js?t=${Date.now()}`, basis));
  version = v.VERSION;
} catch (e) {
  console.warn("Filament-Werkstatt: Versionsdatei nicht lesbar, lade ohne Zwischenspeicher.", e);
}
window.__filamentWerkstattBasis = basis.href;
await import(new URL(`filament-werkstatt-kern.js?v=${encodeURIComponent(version || Date.now())}`, basis));
