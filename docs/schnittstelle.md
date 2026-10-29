# Schnittstelle für externe Programme (ab Version 0.16.0)

Dienste: `lesen`, `warteschlange_hinzufuegen`, `warteschlange_aendern`, `warteschlange_entfernen`, `projekt_setzen`.

## 1. Wo liegen die Daten?
Es gibt **keine Datei unter `/config/www`**. Die Seite speichert alles in den Frontend-Benutzerdaten von Home Assistant:

- Datei: `/config/.storage/frontend.user_data_<BENUTZER-ID>`
- darin der Schlüssel `filament_werkstatt` (die komplette JSON, Datenversion 4)
- **Pro Home-Assistant-Benutzer eine eigene Kopie.** Die Dienste nehmen automatisch den Benutzer des Tokens (siehe unten).

Weitere Dateien:

| Was | Wo |
|---|---|
| Stand beim letzten Öffnen der Seite | gleiche Datei, Schlüssel `filament_werkstatt_sicherung` |
| Nächtliche Sicherung (03:00, je Benutzer die letzten 14) | `/media/filament-werkstatt-sicherung/<JJJJ-MM-TT>_<benutzer>.json` |
| Sicherung vor jeder Änderung durch die Dienste (je Benutzer die letzten 30) | `/media/filament-werkstatt-sicherung/vor-dienst_<Datum>_<Uhrzeit>-<ms>_<benutzer>.json` |
| Druckliste (To-do) | Entität `todo.3d_drucke` bzw. die in der Einrichtung gewählte Liste (`.storage/filament_werkstatt.drucke`) |
| Endfotos | `/media/3d-drucke/<JJJJ-MM-TT_HH-MM>.jpg` (Startzeit des Drucks, Ortszeit) |
| 3D-Modelle (Bibliothek) | `/media/3d-modelle/` |

Die Dateien in `.storage` nie von außen beschreiben (HA hält die Daten im Speicher und überschreibt sie). Zum Lesen und Schreiben die Dienste unten benutzen.

## 2. Speicherweg und Konflikte
- Die Seite schreibt mit dem Websocket-Befehl `frontend/set_user_data` (Schlüssel `filament_werkstatt`), ca. 0,5 s nach jeder Änderung.
- **Stempel:** Feld `geaendert` (ISO-Zeit, UTC, z. B. `2026-10-29T19:41:45.307Z`). Vor dem Speichern liest die Seite den Stand erneut. Ist `geaendert` im Speicher neuer als beim Laden, zeigt sie einen Konflikt-Dialog und überschreibt nichts.
- Die Dienste benutzen dieselbe Speicherstelle und denselben Stempel, serialisieren ihre Schreibzugriffe mit einer Sperre (gleichzeitige Aufrufe gehen nicht verloren) und legen vor jeder Änderung eine Sicherung an.
- Nach einer Änderung durch einen Dienst meldet HA das sofort an die geöffnete Seite (Abo `frontend/subscribe_user_data`); die Seite lädt den neuen Stand, sobald nichts Ungespeichertes offen ist (sonst nach wenigen Sekunden).
- Wer selbst über die Websocket-API schreibt, muss `geaendert` neu setzen (ISO-Zeit UTC mit Millisekunden und `Z`).

## 3. Schema (Datenversion 4)
Zeiten: ISO-8601 (UTC) wenn nicht anders vermerkt. Gewichte in Gramm, Temperaturen in °C, Geschwindigkeiten in mm/s, Preise in €.

**Oberste Ebene:** `version` (4), `geaendert`, `rollen[]`, `spulen[]`, `materialien_eigen[]`, `arten_eigen{}`, `inventar[]`, `einstellungen{}`, `drucke{}`, `warteschlange[]`, `geladen`, `letzte_rolle`, `buchen_ab`, `abgleich[]`, `wartung{}`; optional `projekte[]`, `notizen[]`, `erinnerungen[]`, `shop{}`.

**rollen[]** – Pflicht: `id`, `name`, `hersteller`, `material`, `farbe`, `nenn_g` (Spulengröße, meist 1000).
Optional: `art` (Basic, Matte, Silk …), `farbcode`, `hex`, `glanz`, `rest_g` (Restgewicht, null = nicht gewogen), `spule` (ID aus `spulen`), `probiert` (bool), `preis_kg` (null = Standardpreis 19,99 € je Rolle), `kauflink`, `bewertung` (1–5), `geoeffnet_am`/`getrocknet_am` (JJJJ-MM-TT), `korrektur` ({f, n}), `achtung` (bool), `preset`, `pa_profil`, `filament_setting`, `notiz`, `hinweis`, `eigen{}` (eigene Werte), `vorschlag{}` (Richtwerte: `duese`, `duese_erste`, `bett`, `luefter_min/max`, `v_*`, `flow`, `max_vol`, `k`, `tr_temp` °C, `tr_dauer` h, `tr_feuchte` %, `platte`).

**spulen[]:** `id`, `name`, `hersteller`, `g` (Leergewicht der Spule).

**warteschlange[]** – Pflicht: `id`, `name`.
Optional: `gewicht` (g), `dauer_min` (Minuten) und `zeit` (Text aus dem Slicer, z. B. „1h 35m“), `rolleId`, `notiz`, `am` (angelegt), `quelle` (`hand`, `stl`, `gcode`, `werkstatt-app` …), **`projekt`** (Text, neu), **`datei`** (Pfad der STL/3MF auf dem PC, Text, neu).

**drucke{}** – Schlüssel = `uid` des Eintrags der To-do-Liste „3D-Drucke“; Werte alle optional:
`kommentar`, `eigener_name` (neu), **`projekt`** (neu), `gebucht{am, rolle, g, druck_g, slicer_g, korr, fix_g, wechsel, ergebnis ("ok"|"fehl"|"anders"), fortschritt (%), kosten{filament, kwh, strom, voreingestellt}}`, `fehl{wann, ursachen[], geaendert[]}`, `ignoriert`, `hand{name, start, gewicht, status}` (von Hand nachgetragen).

**inventar[]** – Pflicht: `id`, `kat` (`schraube`, `mutter`, `scheibe`, `einsatz`, `feder`, `duese`, `magnet`, `werkzeug`), `menge` (null = nicht erfasst).
Je nach `kat`: `gewinde`, `laenge` (mm), `kopf`, `aussen`, `draht`, `groesse` (mm), `durchmesser`, `breite`, `dicke`, `form`, `material`, `fach`, `quelle`, `preis`, `shop`, `notiz`, `min` (Mindestbestand), `gezaehlt` (bool).

**einstellungen{}:** `strompreis` (€/kWh), `linie_g`, `extruder_g`, `wechsel_g` (Zusatzverbrauch je Druck, g), `mindest_g`, `mindest_material_g`, `korrektur{}`, `korrektur_n{}`, `schlange_klug`, `sicherung_am/_spaeter/_start`.

**Rest:** `geladen` = Rollen-ID im Drucker (oder null), `letzte_rolle`, `buchen_ab` (ältere Drucke werden nicht zum Verbuchen angeboten), `wartung{aufgaben{}, teile}`.

## 4. Dienste
Alle Dienste nehmen optional `benutzer` (Name, Kurzname oder ID). Ohne Angabe gilt der Besitzer des Tokens, sonst der einzige Benutzer mit Daten. Bei Prüffehlern kommt mit `?return_response` `{"ok": false, "fehler": "…"}` zurück, sonst wird ein Fehler ausgelöst.

### `filament_werkstatt.lesen`
Parameter: `benutzer` (optional). Antwort: `{ok, benutzer, version, geaendert, daten}`; `daten` ist die komplette JSON.

### `filament_werkstatt.warteschlange_hinzufuegen`
| Parameter | Pflicht | Beschreibung |
|---|---|---|
| `name` | ja | Name des Auftrags (max. 80 Zeichen) |
| `gewicht_g` | nein | Filament in g |
| `zeit_min` | nein | Druckdauer in Minuten |
| `rolle_id` | nein | ID aus `rollen`; ohne Angabe: geladene bzw. zuletzt benutzte Rolle |
| `notiz` | nein | max. 140 Zeichen |
| `projekt` | nein | Text, max. 60 Zeichen |
| `quelle` | nein | Standard `werkstatt-app` |
| `datei` | nein | Pfad der STL/3MF auf dem PC (max. 260 Zeichen) |
| `benutzer` | nein | siehe oben |

Antwort: `{ok, id, platz, benutzer}`.

### `filament_werkstatt.warteschlange_aendern`
Parameter: `id` (Pflicht) und beliebig viele von `name`, `gewicht_g`, `zeit_min`, `rolle_id`, `notiz`, `projekt`, `datei` (nur genannte Felder ändern sich; leerer `projekt`/`datei` entfernt das Feld), `benutzer`. Antwort: `{ok, id, geaendert[], benutzer}`.

### `filament_werkstatt.warteschlange_entfernen`
Parameter: `id` (Pflicht), `benutzer`. Antwort: `{ok, id, uebrig, benutzer}`. Vorher entsteht eine Sicherung (`vor-dienst_…`).

### `filament_werkstatt.projekt_setzen`
Parameter: `druck_uid` (Eintrag der To-do-Liste „3D-Drucke“) und/oder `warteschlange_id`, `projekt` (leer = Projekt entfernen), `benutzer`. Antwort: `{ok, gesetzt[], projekt, benutzer}`.

## 5. Beispiele (HTTP, Long-Lived-Token)
```
POST http://<HA>:8123/api/services/filament_werkstatt/lesen?return_response
Authorization: Bearer <TOKEN>
Content-Type: application/json

{}
```
```
POST /api/services/filament_werkstatt/warteschlange_hinzufuegen?return_response
{"name": "Kabelclip", "gewicht_g": 12.5, "zeit_min": 95, "rolle_id": "bambu-pla-basic-grau",
 "notiz": "aus der App", "projekt": "Schlüsselanhänger", "quelle": "werkstatt-app"}
```
→ `{"changed_states": [], "service_response": {"ok": true, "id": "a-mvty6xur", "platz": 1, "benutzer": "corin"}}`
```
POST /api/services/filament_werkstatt/projekt_setzen?return_response
{"druck_uid": "<uid aus todo.3d_drucke>", "projekt": "Lampe"}
```
Die `uid` der Drucke liefert `POST /api/services/todo/get_items?return_response` mit `{"entity_id": "todo.3d_drucke"}`.

## 6. Nach dem Update
HACS-Update, **Home Assistant neu starten** (neue Dienste und neue Datei), Seite neu laden (Strg+F5). Danach unter Entwicklerwerkzeuge › Aktionen erscheinen die fünf Dienste.
