"""Gemeinsame Konstanten der Filament-Werkstatt."""

DOMAIN = "filament_werkstatt"
PANEL_PFAD = "filament"
URL_BASIS = "/filament_werkstatt_dateien"

# Einstellungen aus der Einrichtung
CONF_DRUCKER = "drucker"        # Geräte-ID des Bambu-Lab-Druckers
CONF_STECKDOSE = "steckdose"    # Geräte-ID der Steckdose vor dem Drucker
CONF_LISTE = "liste"            # bestehende To-do-Liste für die Drucke (leer = eigene Liste)
CONF_PROTOKOLL = "protokoll"    # Drucke automatisch protokollieren
CONF_RAUM_TEMP = "raum_temp"    # Temperatursensor im Raum des Druckers
CONF_RAUM_FEUCHTE = "raum_feuchte"  # Luftfeuchtesensor im Raum des Druckers

BAMBU = "bambu_lab"
ALTE_AUTOMATION = "3D-Drucker: Druck protokollieren"

# Raumklima: diese Sensoren werden zuerst vorgeschlagen, sonst einer mit passendem Namen
RAUM_TEMP_STANDARD = "sensor.luft_sensor_arbeitszimmer_temperatur"
RAUM_FEUCHTE_STANDARD = "sensor.luft_sensor_arbeitszimmer_luftfeuchtigkeit"
RAUM_WOERTER = ("arbeitszimmer", "werkstatt")

# Nächtliche Sicherung der Seiten-Daten in den Medienordner
SPEICHER_KEY = "filament_werkstatt"      # Schlüssel in den Frontend-Benutzerdaten
SICHERUNG_ORDNER = "filament-werkstatt-sicherung"
SICHERUNG_BEHALTEN = 14
SICHERUNG_STUNDE = 3

# Update-Prüfung: HACS-Update-Entität dieses Repositorys
REPO = "Corineye/filament-werkstatt"
