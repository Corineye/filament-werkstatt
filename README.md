# Filament-Werkstatt

Eigene Seite in Home Assistant für die 3D-Druck-Werkstatt: Filamentrollen mit Druckeinstellungen, Restfilament-Rechner, Inventar und Druckerdaten vom Bambu Lab P1S.

Die Seite läuft komplett in Home Assistant. Die Daten (Rollen, Einstellungen, Bestände) werden in Home Assistant gespeichert und sind damit Teil der normalen HA-Backups. Dieses Repository enthält nur den Programmcode.

## Installation über HACS

1. HACS öffnen, oben rechts auf die drei Punkte, dann „Benutzerdefinierte Repositories“.
2. Repository `https://github.com/Corineye/filament-werkstatt` eintragen, Typ **Integration**, hinzufügen.
3. „Filament-Werkstatt“ in HACS suchen und herunterladen.
4. Home Assistant neu starten (das verlangt Home Assistant bei jeder neuen Integration einmal).
5. Einstellungen › Geräte & Dienste › „Integration hinzufügen“ › „Filament-Werkstatt“.
6. Drucker, Steckdose und Druckliste prüfen. Eindeutige Treffer sind schon ausgewählt, dann einfach Absenden.

Fertig. „Filament“ erscheint in der Seitenleiste. In der `configuration.yaml` muss nichts eingetragen werden, eine Automation braucht es auch nicht.

### Was ausgewählt wird

| Feld | Wofür | Vorschlag |
| --- | --- | --- |
| Drucker | Live-Werte, Kamera, Druck-Protokoll. Aus der [Bambu-Lab-Integration](https://github.com/greghesp/ha-bambulab). | der einzige Bambu-Drucker |
| Steckdose | Drucker ein- und ausschalten, Stromkosten pro Druck | das einzige schaltbare Gerät mit „Drucker“, „Printer“ oder „3D“ im Namen |
| Druckliste | Verlauf aller Drucke | eine vorhandene Liste „3D-Drucke“, sonst legt die Integration eine eigene an |
| Drucke protokollieren | trägt jeden Druck ein und speichert ein Endfoto | an |

Alles ist später unter Geräte & Dienste › Filament-Werkstatt › „Konfigurieren“ änderbar. Die Entitäten werden über die internen Schlüssel der Bambu-Lab-Integration gefunden, Namen und Sprache spielen keine Rolle.

### Druck-Protokoll

Läuft ein Druck zwei Minuten, legt die Integration einen Eintrag „Name · Startzeit“ mit Gewicht, Länge und Temperaturen an. Am Ende ergänzt sie Status und Fortschritt und speichert ein Kamerabild unter Medien › `3d-drucke`. Die Seite fragt danach, von welcher Rolle verbucht werden soll.

Wer vorher die Automation „3D-Drucker: Druck protokollieren“ benutzt hat, bekommt einen Hinweis. Solange sie eingeschaltet ist, trägt die Integration nichts ein, damit nichts doppelt erscheint. Danach kann sie gelöscht werden.

### Umstieg von Version 0.8 (Dashboard-Variante)

1. In HACS „Filament-Werkstatt“ entfernen (drei Punkte › Entfernen) und das benutzerdefinierte Repository löschen.
2. Das Repository wie oben als **Integration** neu hinzufügen, herunterladen, Home Assistant neu starten, Integration hinzufügen.
3. Den alten `panel_custom`-Block mit `filament-werkstatt-panel` aus der `configuration.yaml` löschen. Solange er noch drin ist, übernimmt die Integration trotzdem und schreibt nur eine Warnung ins Protokoll.

Die Daten bleiben erhalten, sie liegen in Home Assistant und nicht im Repository.

## Updates

HACS meldet neue Versionen selbst. Nach dem Update in HACS einfach die Seite neu laden. HACS zeigt danach eventuell „Neustart erforderlich“ an. Für die Seite selbst ist der Neustart nicht nötig, er kann beim nächsten Mal mit erledigt werden.

Ist die Seite beim Update offen, erscheint oben der Hinweis „Version … ist installiert“ mit einem Knopf zum Neuladen.

So funktioniert es: Die Integration stellt die Dateien aus `custom_components/filament_werkstatt/frontend/` bereit und trägt die Seite in die Seitenleiste ein. `filament-werkstatt.js` ist nur ein kleiner Lader, der sich nie ändert. Er fragt bei jedem Öffnen `filament-werkstatt-version.js` ab (nie aus dem Zwischenspeicher) und lädt dann `filament-werkstatt-kern.js` mit genau dieser Versionsnummer. Eine neue Version hat damit automatisch eine neue Adresse, und der Browser kann keine alte Fassung mehr anzeigen.
