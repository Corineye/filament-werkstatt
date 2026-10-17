"""Findet die Entitäten von Drucker und Steckdose über das Entitäts-Register.

Gesucht wird über den Übersetzungsschlüssel der Bambu-Lab-Integration, nicht über
Namen oder Entity-IDs. So funktioniert es in jeder Sprache und mit jedem Drucker.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er

from .const import (
    BAMBU,
    CONF_DRUCKER,
    CONF_LISTE,
    CONF_PROTOKOLL,
    CONF_RAUM_FEUCHTE,
    CONF_RAUM_TEMP,
    CONF_STECKDOSE,
    DOMAIN,
    RAUM_FEUCHTE_STANDARD,
    RAUM_TEMP_STANDARD,
    RAUM_WOERTER,
)

# Schlüssel der Seite → (Plattform, translation_key in ha-bambulab); mehrere Kandidaten möglich
DRUCKER_SCHLUESSEL: dict[str, list[tuple[str, str]]] = {
    "status": [("sensor", "print_status")],
    "schritt": [("sensor", "stage")],
    "name": [("sensor", "subtask_name")],
    "fortschritt": [("sensor", "print_progress")],
    "schicht": [("sensor", "current_layer")],
    "schichten": [("sensor", "total_layers")],
    "rest_h": [("sensor", "remaining_time")],
    "start": [("sensor", "start_time")],
    "ende": [("sensor", "end_time")],
    "gewicht": [("sensor", "print_weight")],
    "laenge": [("sensor", "print_length")],
    "duese": [("sensor", "nozzle_temp")],
    "duese_ziel": [("sensor", "target_nozzle_temp")],
    "bett": [("sensor", "bed_temp")],
    "bett_ziel": [("sensor", "target_bed_temp")],
    "l_bauteil": [("sensor", "aux_fan_speed")],
    "l_kopf": [("sensor", "cooling_fan_speed")],
    "l_raum": [("sensor", "chamber_fan_speed")],
    "l_hotend": [("sensor", "heatbreak_fan_speed")],
    "duese_mm": [("sensor", "nozzle_diameter")],
    "duese_typ": [("sensor", "nozzle_type")],
    "platte": [("sensor", "print_bed_type")],
    "stunden": [("sensor", "total_usage_hours")],
    "wlan": [("sensor", "wifi_signal")],
    "tempo": [("sensor", "speed_profile")],
    "online": [("binary_sensor", "online")],
    "hms": [("binary_sensor", "hms_errors")],
    "fehler": [("binary_sensor", "print_error")],
    "firmware": [("binary_sensor", "firmware_update")],
    "filament": [("binary_sensor", "extruder_filament_state")],
    "licht": [("light", "chamber_light")],
    "kamera": [("camera", "camera"), ("image", "p1p_camera")],
    "titelbild": [("image", "cover_image")],
    # Zum Einstellen aus der Seite heraus
    "duese_soll": [("number", "target_nozzle_temperature")],
    "bett_soll": [("number", "target_bed_temperature")],
    "f_kopf": [("fan", "cooling_fan")],
    "f_bauteil": [("fan", "aux_fan")],
    "f_raum": [("fan", "chamber_fan")],
}


def _aktiv(eintraege: list[er.RegistryEntry]) -> list[er.RegistryEntry]:
    return [e for e in eintraege if e.disabled_by is None]


def _geraet_name(hass: HomeAssistant, geraet_id: str | None) -> str | None:
    if not geraet_id:
        return None
    g = dr.async_get(hass).async_get(geraet_id)
    return (g.name_by_user or g.name) if g else None


def drucker_entitaeten(hass: HomeAssistant, geraet_id: str | None) -> dict[str, str]:
    """Schlüssel → Entity-ID für den gewählten Drucker."""
    if not geraet_id:
        return {}
    eintraege = _aktiv(er.async_entries_for_device(er.async_get(hass), geraet_id))
    nach_schluessel = {(e.domain, e.translation_key): e.entity_id for e in eintraege if e.translation_key}
    ergebnis: dict[str, str] = {}
    for schluessel, kandidaten in DRUCKER_SCHLUESSEL.items():
        for k in kandidaten:
            if k in nach_schluessel:
                ergebnis[schluessel] = nach_schluessel[k]
                break
    return ergebnis


def steckdose_entitaeten(hass: HomeAssistant, geraet_id: str | None) -> dict[str, str]:
    """Schalter, aktuelle Leistung und Verbrauch heute/Monat der gewählten Steckdose."""
    if not geraet_id:
        return {}
    eintraege = _aktiv(er.async_entries_for_device(er.async_get(hass), geraet_id))
    ergebnis: dict[str, str] = {}

    def text(e: er.RegistryEntry) -> str:
        return " ".join(filter(None, [e.translation_key, e.entity_id, e.original_name, e.name])).lower()

    for e in eintraege:
        klasse = e.device_class or e.original_device_class
        t = text(e)
        if e.domain == "switch" and "schalter" not in ergebnis and e.entity_category is None:
            ergebnis["schalter"] = e.entity_id
        elif e.domain != "sensor":
            continue
        elif klasse == "power" and "watt" not in ergebnis:
            ergebnis["watt"] = e.entity_id
        elif klasse == "energy" and any(w in t for w in ("today", "heute", "daily")) and "heute" not in ergebnis:
            ergebnis["heute"] = e.entity_id
        elif klasse == "energy" and any(w in t for w in ("month", "monat")) and "monat" not in ergebnis:
            ergebnis["monat"] = e.entity_id
    return ergebnis


def einstellungen(hass: HomeAssistant, konf: dict[str, Any], liste: str | None) -> dict[str, Any]:
    """Alles, was die Seite über Drucker, Steckdose und Druckliste wissen muss."""
    return {
        "drucker": drucker_entitaeten(hass, konf.get("drucker")),
        "drucker_name": _geraet_name(hass, konf.get("drucker")),
        "steckdose": steckdose_entitaeten(hass, konf.get("steckdose")),
        "steckdose_name": _geraet_name(hass, konf.get("steckdose")),
        "liste": liste,
        "raum_temp": konf.get(CONF_RAUM_TEMP) or None,
        "raum_feuchte": konf.get(CONF_RAUM_FEUCHTE) or None,
    }


def raum_vorschlaege(hass: HomeAssistant) -> dict[str, str | None]:
    """Temperatur- und Feuchtesensor im Raum des Druckers.

    Zuerst die bekannten Sensoren im Arbeitszimmer, sonst ein Sensor mit passender
    Geräteklasse, dessen Name „Arbeitszimmer“ oder „Werkstatt“ enthält.
    Register und Zustände zusammen, damit es beim Start und für YAML-Sensoren klappt.
    """
    entitaeten = er.async_get(hass)
    sensoren: dict[str, tuple[str | None, str]] = {}
    for e in entitaeten.entities.values():
        if e.domain == "sensor" and not e.disabled_by:
            name = " ".join(filter(None, [e.entity_id, e.name, e.original_name])).lower()
            sensoren[e.entity_id] = (e.device_class or e.original_device_class, name)
    for s in hass.states.async_all("sensor"):
        klasse, name = sensoren.get(s.entity_id, (None, s.entity_id))
        sensoren[s.entity_id] = (
            klasse or s.attributes.get("device_class"),
            f"{name} {s.attributes.get('friendly_name') or ''}".lower(),
        )

    def finden(standard: str, klasse: str) -> str | None:
        if standard in sensoren:
            return standard
        for wort in RAUM_WOERTER:
            treffer = sorted(i for i, (k, n) in sensoren.items() if k == klasse and wort in n)
            if treffer:
                return treffer[0]
        return None

    return {
        CONF_RAUM_TEMP: finden(RAUM_TEMP_STANDARD, "temperature"),
        CONF_RAUM_FEUCHTE: finden(RAUM_FEUCHTE_STANDARD, "humidity"),
    }


def vorschlaege(hass: HomeAssistant) -> dict[str, Any]:
    """Nur eindeutige Treffer vorschlagen.

    Drucker: der einzige Bambu-Lab-Drucker. Steckdose: das einzige Gerät mit Schalter,
    dessen Name nach Drucker klingt. Liste: eine vorhandene Liste „3D-Drucke“.
    Raumklima: siehe raum_vorschlaege().
    Gelesen wird aus den Registern, damit es auch beim Start klappt, bevor alles geladen ist.
    """
    geraete = dr.async_get(hass)
    entitaeten = er.async_get(hass)
    v: dict[str, Any] = {CONF_PROTOKOLL: True}

    drucker = [g.id for e in hass.config_entries.async_entries(BAMBU) for g in dr.async_entries_for_config_entry(geraete, e.entry_id)]
    drucker = [d for d in drucker if any(e.translation_key == "print_status" for e in er.async_entries_for_device(entitaeten, d))]
    if len(drucker) == 1:
        v[CONF_DRUCKER] = drucker[0]

    dosen = set()
    for e in entitaeten.entities.values():
        if e.domain != "switch" or not e.device_id or e.device_id in drucker or e.disabled_by:
            continue
        g = geraete.async_get(e.device_id)
        name = " ".join(filter(None, [g and (g.name_by_user or g.name), e.name, e.original_name, e.entity_id])).lower()
        if any(w in name for w in ("drucker", "printer", "3d")):
            dosen.add(e.device_id)
    if len(dosen) == 1:
        v[CONF_STECKDOSE] = dosen.pop()

    for e in entitaeten.entities.values():
        if e.domain == "todo" and e.platform != DOMAIN and (
            e.entity_id == "todo.3d_drucke" or (e.name or e.original_name) == "3D-Drucke"
        ):
            v[CONF_LISTE] = e.entity_id
            break

    v.update({k: w for k, w in raum_vorschlaege(hass).items() if w})
    return v
