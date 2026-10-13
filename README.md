# Filament-Werkstatt

Eigene Seite in Home Assistant für die 3D-Druck-Werkstatt: Filamentrollen mit Druckeinstellungen, Restfilament-Rechner, Inventar und Druckerdaten vom Bambu Lab P1S.

Die Seite läuft komplett in Home Assistant. Die Daten (Rollen, Einstellungen, Bestände) werden in Home Assistant gespeichert und sind damit Teil der normalen HA-Backups. Dieses Repository enthält nur den Programmcode.

## Installation über HACS

1. HACS öffnen, oben rechts auf die drei Punkte, dann „Benutzerdefinierte Repositories“.
2. Repository `https://github.com/Corineye/filament-werkstatt` eintragen, Typ **Dashboard**, hinzufügen.
3. „Filament-Werkstatt“ in HACS suchen und herunterladen.
4. In der `configuration.yaml` diesen Block eintragen (oder den alten `panel_custom`-Block ersetzen):

```yaml
panel_custom:
  - name: filament-werkstatt-panel
    sidebar_title: Filament
    sidebar_icon: mdi:printer-3d-nozzle
    url_path: filament
    module_url: /hacsfiles/filament-werkstatt/filament-werkstatt.js
```

5. Home Assistant neu starten.

## Updates

HACS meldet neue Versionen selbst. Nach dem Update in HACS einfach die Seite neu laden, mehr ist nicht nötig. Die `configuration.yaml` bleibt unverändert und Home Assistant muss nicht neu gestartet werden.

Ist die Seite beim Update offen, erscheint oben der Hinweis „Version … ist installiert“ mit einem Knopf zum Neuladen.

So funktioniert es: `filament-werkstatt.js` ist nur ein kleiner Lader, der sich nie ändert. Er fragt bei jedem Öffnen `filament-werkstatt-version.js` ab (nie aus dem Zwischenspeicher) und lädt dann `filament-werkstatt-kern.js` mit genau dieser Versionsnummer. Eine neue Version hat damit automatisch eine neue Adresse, und der Browser kann keine alte Fassung mehr anzeigen.
