"""Filament-Werkstatt: Seite „Filament“ in der Seitenleiste und Druck-Protokoll.

Die eigentliche Seite liegt in frontend/ (JavaScript). Diese Integration stellt
die Dateien bereit, meldet das Panel an und protokolliert jeden Druck des
gewählten Bambu-Lab-Druckers. In die configuration.yaml muss nichts.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.components import frontend, panel_custom, persistent_notification, websocket_api
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.start import async_at_started

from .const import ALTE_AUTOMATION, CONF_DRUCKER, CONF_LISTE, CONF_PROTOKOLL, DOMAIN, PANEL_PFAD, URL_BASIS
from .geraete import drucker_entitaeten, einstellungen, vorschlaege
from .protokoll import DruckProtokoll

_LOGGER = logging.getLogger(__name__)

ORDNER = Path(__file__).parent / "frontend"


def _version() -> str:
    try:
        return json.loads((Path(__file__).parent / "manifest.json").read_text())["version"]
    except (OSError, ValueError, KeyError):
        return "0"


def _konf(entry: ConfigEntry) -> dict[str, Any]:
    return {**entry.data, **entry.options}


def _eigene_liste(entry: ConfigEntry) -> bool:
    return not _konf(entry).get(CONF_LISTE)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Dateien bereitstellen, Seite anmelden, Druck-Protokoll starten."""
    daten = hass.data.setdefault(DOMAIN, {})
    if not daten.get("dateien"):
        # Ohne Zwischenspeicher-Kopfzeilen: nach einem Update kommen sofort die neuen Dateien
        await hass.http.async_register_static_paths(
            [StaticPathConfig(URL_BASIS, str(ORDNER), False)]
        )
        websocket_api.async_register_command(hass, ws_einstellungen)
        daten["dateien"] = True

    # Einrichtung aus Version 0.9 (ohne Fragen): einmal mit den Vorschlägen ergänzen,
    # damit die bestehende Druckliste weiter benutzt wird
    if CONF_PROTOKOLL not in _konf(entry):
        hass.config_entries.async_update_entry(entry, data={**entry.data, **vorschlaege(hass)})

    konf = _konf(entry)

    # Druckliste: gewählte bestehende Liste oder die eigene „3D-Drucke“
    # Merken, ob die eigene Liste geladen wurde: beim Entladen nach einer Änderung
    # der Optionen stehen dort schon die neuen Werte
    entry.runtime_data = _eigene_liste(entry)
    if entry.runtime_data:
        await hass.config_entries.async_forward_entry_setups(entry, [Platform.TODO])
        liste = er.async_get(hass).async_get_entity_id("todo", DOMAIN, f"{entry.entry_id}_drucke")
    else:
        liste = konf[CONF_LISTE]
    daten["konf"] = konf
    daten["liste"] = liste

    # Druck-Protokoll (ersetzt die frühere Automation)
    protokoll_an = False
    if konf.get(CONF_PROTOKOLL, True) and liste:
        ent = drucker_entitaeten(hass, konf.get(CONF_DRUCKER))
        if "status" in ent:
            ordner = Path(hass.config.media_dirs.get("local") or hass.config.path("media")) / "3d-drucke"
            entry.async_on_unload(DruckProtokoll(hass, ent, liste, ordner).starten())
            protokoll_an = True
        elif konf.get(CONF_DRUCKER):
            _LOGGER.warning("Beim gewählten Drucker wurde kein Druckstatus gefunden, Protokoll ist aus")

    if protokoll_an:
        @callback
        def alte_automation_pruefen(_hass: HomeAssistant) -> None:
            for s in hass.states.async_all("automation"):
                if s.attributes.get("friendly_name") == ALTE_AUTOMATION and s.state == "on":
                    persistent_notification.async_create(
                        hass,
                        f"Die Filament-Werkstatt protokolliert die Drucke jetzt selbst. Die Automation "
                        f"„{ALTE_AUTOMATION}“ ({s.entity_id}) wird nicht mehr gebraucht und kann unter "
                        "Einstellungen › Automationen gelöscht werden. Solange sie eingeschaltet ist, "
                        "überlässt die Integration ihr das Eintragen, damit nichts doppelt erscheint.",
                        title="Filament-Werkstatt",
                        notification_id=f"{DOMAIN}_alte_automation",
                    )

        entry.async_on_unload(async_at_started(hass, alte_automation_pruefen))

    version = await hass.async_add_executor_job(_version)

    # Alter Eintrag aus der configuration.yaml (panel_custom) mit gleicher Adresse:
    # ersetzen statt abzustürzen. Den Block kann man danach löschen.
    if PANEL_PFAD in hass.data.get(frontend.DATA_PANELS, {}):
        if not daten.get("panel"):
            _LOGGER.warning(
                "Die Seite /%s war schon angemeldet (vermutlich panel_custom in der configuration.yaml). "
                "Sie wird durch die Integration ersetzt, der panel_custom-Block kann gelöscht werden",
                PANEL_PFAD,
            )
        frontend.async_remove_panel(hass, PANEL_PFAD)

    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_PFAD,
        webcomponent_name="filament-werkstatt-panel",
        sidebar_title="Filament",
        sidebar_icon="mdi:printer-3d-nozzle",
        module_url=f"{URL_BASIS}/filament-werkstatt.js?v={version}",
        require_admin=False,
        config={},
    )
    daten["panel"] = True
    entry.async_on_unload(entry.add_update_listener(_neu_laden))
    return True


async def _neu_laden(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Seite entfernen, Protokoll stoppen (die Dateien bleiben bis zum Neustart erreichbar)."""
    if entry.runtime_data and not await hass.config_entries.async_unload_platforms(entry, [Platform.TODO]):
        return False
    frontend.async_remove_panel(hass, PANEL_PFAD, warn_if_unknown=False)
    daten = hass.data.get(DOMAIN, {})
    daten.pop("konf", None)
    daten.pop("liste", None)
    daten["panel"] = False
    return True


@websocket_api.websocket_command({vol.Required("type"): "filament_werkstatt/einstellungen"})
@callback
def ws_einstellungen(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Liefert der Seite die Entitäten von Drucker und Steckdose und die Druckliste."""
    daten = hass.data.get(DOMAIN, {})
    if "konf" not in daten:
        connection.send_result(msg["id"], {})
        return
    connection.send_result(msg["id"], einstellungen(hass, daten["konf"], daten.get("liste")))
