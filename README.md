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
    module_url: /hacsfiles/filament-werkstatt/filament-werkstatt.js?v=1
```

5. Home Assistant neu starten.

## Updates

HACS meldet neue Versionen selbst. Nach dem Update die Zahl hinter `?v=` in der `configuration.yaml` um eins erhöhen und Home Assistant neu starten, damit der Browser die neue Datei lädt.
