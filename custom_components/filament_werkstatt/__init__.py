"""Filament-Werkstatt: richtet die Seite „Filament“ in der Seitenleiste ein.

Die eigentliche Seite liegt in frontend/ (JavaScript). Diese Integration stellt
die Dateien bereit und meldet das Panel an, damit nichts in die
configuration.yaml geschrieben werden muss.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

DOMAIN = "filament_werkstatt"
PANEL_PFAD = "filament"
URL_BASIS = "/filament_werkstatt_dateien"
ORDNER = Path(__file__).parent / "frontend"


def _version() -> str:
    try:
        return json.loads((Path(__file__).parent / "manifest.json").read_text())["version"]
    except (OSError, ValueError, KeyError):
        return "0"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Dateien bereitstellen und die Seite in der Seitenleiste anmelden."""
    daten = hass.data.setdefault(DOMAIN, {})
    if not daten.get("dateien"):
        # Ohne Zwischenspeicher-Kopfzeilen: nach einem Update kommen sofort die neuen Dateien
        await hass.http.async_register_static_paths(
            [StaticPathConfig(URL_BASIS, str(ORDNER), False)]
        )
        daten["dateien"] = True

    version = await hass.async_add_executor_job(_version)

    # Alter Eintrag aus der configuration.yaml (panel_custom) mit gleicher Adresse:
    # ersetzen statt abzustürzen. Den Block kann man danach löschen.
    if PANEL_PFAD in hass.data.get(frontend.DATA_PANELS, {}):
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
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Seite aus der Seitenleiste entfernen (die Dateien bleiben bis zum Neustart erreichbar)."""
    frontend.async_remove_panel(hass, PANEL_PFAD, warn_if_unknown=False)
    return True
