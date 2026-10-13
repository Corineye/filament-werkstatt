"""Einrichtung über Einstellungen › Geräte & Dienste.

Drucker, Steckdose und Druckliste werden vorgeschlagen, wenn sie eindeutig sind;
man muss also meist nur auf Absenden drücken. Später änderbar über „Konfigurieren“.
"""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    BooleanSelector,
    DeviceSelector,
    DeviceSelectorConfig,
    EntityFilterSelectorConfig,
    EntitySelector,
    EntitySelectorConfig,
)

from .const import BAMBU, CONF_DRUCKER, CONF_LISTE, CONF_PROTOKOLL, CONF_STECKDOSE, DOMAIN
from .geraete import vorschlaege


def _schema(werte: dict[str, Any]) -> vol.Schema:
    def opt(schluessel: str) -> vol.Optional:
        return vol.Optional(schluessel, description={"suggested_value": werte.get(schluessel)})

    return vol.Schema({
        opt(CONF_DRUCKER): DeviceSelector(DeviceSelectorConfig(integration=BAMBU)),
        opt(CONF_STECKDOSE): DeviceSelector(
            DeviceSelectorConfig(entity=EntityFilterSelectorConfig(domain="switch"))
        ),
        opt(CONF_LISTE): EntitySelector(EntitySelectorConfig(domain="todo")),
        vol.Optional(CONF_PROTOKOLL, default=werte.get(CONF_PROTOKOLL, True)): BooleanSelector(),
    })


class FilamentWerkstattFlow(ConfigFlow, domain=DOMAIN):
    """Legt die einzige Instanz an."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        if user_input is not None:
            return self.async_create_entry(title="Filament-Werkstatt", data=user_input)
        return self.async_show_form(step_id="user", data_schema=_schema(vorschlaege(self.hass)))

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return FilamentWerkstattOptionen()


class FilamentWerkstattOptionen(OptionsFlow):
    """Drucker, Steckdose und Liste später ändern."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            # Leere Felder ausdrücklich leeren, sonst gilt der alte Wert aus data weiter
            werte = {k: user_input.get(k) for k in (CONF_DRUCKER, CONF_STECKDOSE, CONF_LISTE)}
            werte[CONF_PROTOKOLL] = user_input.get(CONF_PROTOKOLL, True)
            return self.async_create_entry(data=werte)
        aktuell = {**self.config_entry.data, **self.config_entry.options}
        return self.async_show_form(step_id="init", data_schema=_schema(aktuell))
