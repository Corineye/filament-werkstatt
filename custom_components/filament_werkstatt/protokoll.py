"""Protokolliert jeden Druck in einer To-do-Liste und speichert ein Endfoto.

Ersetzt die frühere Automation „3D-Drucker: Druck protokollieren“. Das Format der
Einträge ist dasselbe, damit alte und neue Drucke gleich gelesen werden:
Titel „<Name> · TT.MM.JJJJ HH:MM“ (Startzeit), Beschreibung „schluessel=wert; …“.
"""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from datetime import datetime
import logging
from pathlib import Path

from homeassistant.core import CALLBACK_TYPE, Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers.event import async_call_later, async_track_state_change_event
from homeassistant.util import dt as dt_util

from .const import ALTE_AUTOMATION

_LOGGER = logging.getLogger(__name__)

START_NACH_S = 120          # erst eintragen, wenn wirklich 2 Minuten gedruckt wird
FOTO_NACH_S = 5             # kurz warten, bis das Licht/Bild nach dem Druck passt
LAEUFT = ("running", "pause", "prepare")
ENDE = ("finish", "failed")
LEER = ("unknown", "unavailable", "", None)


class DruckProtokoll:
    """Hört auf den Druckstatus und schreibt die Liste."""

    def __init__(self, hass: HomeAssistant, entitaeten: dict[str, str], liste: str, foto_ordner: Path) -> None:
        self.hass = hass
        self.ent = entitaeten
        self.liste = liste
        self.foto_ordner = foto_ordner
        self._start_timer: CALLBACK_TYPE | None = None
        self._sperre = asyncio.Lock()   # wie „mode: queued“: Start und Ende nie gleichzeitig

    # ---- Ablauf -----------------------------------------------------------
    @callback
    def starten(self) -> Callable[[], None]:
        status = self.ent["status"]
        abmelden = async_track_state_change_event(self.hass, [status], self._geaendert)
        # Läuft beim Start von Home Assistant schon ein Druck, trotzdem eintragen (doppelt wird nichts)
        s = self.hass.states.get(status)
        if s and s.state == "running":
            self._start_planen()

        def stoppen() -> None:
            abmelden()
            self._start_abbrechen()

        return stoppen

    @callback
    def _geaendert(self, event: Event[EventStateChangedData]) -> None:
        alt = event.data["old_state"].state if event.data["old_state"] else None
        neu = event.data["new_state"].state if event.data["new_state"] else None
        if neu == "running" and alt != "running":
            self._start_planen()
        elif neu != "running":
            self._start_abbrechen()
        if self._alte_automation_an():
            return   # die frühere Automation schreibt noch selbst, sonst gäbe es alles doppelt
        if alt in LAEUFT and neu in ENDE:
            self.hass.async_create_task(self._ende(), "filament_werkstatt_druck_ende")

    def _alte_automation_an(self) -> bool:
        return any(
            s.state == "on" and s.attributes.get("friendly_name") == ALTE_AUTOMATION
            for s in self.hass.states.async_all("automation")
        )

    @callback
    def _start_planen(self) -> None:
        self._start_abbrechen()

        @callback
        def los(_now: datetime) -> None:
            self._start_timer = None
            self.hass.async_create_task(self._start(), "filament_werkstatt_druck_start")

        self._start_timer = async_call_later(self.hass, START_NACH_S, los)

    @callback
    def _start_abbrechen(self) -> None:
        if self._start_timer:
            self._start_timer()
            self._start_timer = None

    # ---- Werte ------------------------------------------------------------
    def _w(self, schluessel: str) -> str:
        """Zustand wie states() in einer Vorlage: 'unknown', wenn es ihn nicht gibt."""
        eid = self.ent.get(schluessel)
        s = self.hass.states.get(eid) if eid else None
        return s.state if s else "unknown"

    def _startzeit(self) -> datetime:
        t = dt_util.parse_datetime(self._w("start")) if self._w("start") not in LEER else None
        return dt_util.as_local(t) if t else dt_util.now()

    def _titel(self) -> tuple[str, str]:
        zeit = self._startzeit().strftime("%d.%m.%Y %H:%M")
        name = self._w("name")
        return zeit, f"{name if name not in LEER else 'Druck'} · {zeit}"

    async def _offene(self) -> list[dict]:
        antwort = await self.hass.services.async_call(
            "todo", "get_items", {"status": ["needs_action"]},
            target={"entity_id": self.liste}, blocking=True, return_response=True,
        )
        return list((antwort or {}).get(self.liste, {}).get("items", []))

    async def _schreiben(self, dienst: str, daten: dict) -> None:
        await self.hass.services.async_call("todo", dienst, daten, target={"entity_id": self.liste}, blocking=True)

    # ---- Start und Ende ---------------------------------------------------
    async def _start(self) -> None:
        if self._alte_automation_an():
            return
        async with self._sperre:
            try:
                zeit, titel = self._titel()
                if any(str(e.get("summary", "")).endswith(zeit) for e in await self._offene()):
                    return   # z. B. nach einer Pause schon eingetragen
                await self._schreiben("add_item", {"item": titel, "description": "; ".join([
                    f"gewicht_g={self._w('gewicht')}", f"laenge_m={self._w('laenge')}",
                    f"duese_c={self._w('duese_ziel')}", f"bett_c={self._w('bett_ziel')}",
                    f"duese_mm={self._w('duese_mm')}", f"start={self._w('start')}", "status=laeuft",
                ])})
                _LOGGER.debug("Druck eingetragen: %s", titel)
            except Exception:  # noqa: BLE001 – ein Fehler hier darf den Drucker nie stören
                _LOGGER.warning("Druckstart konnte nicht in %s eingetragen werden", self.liste, exc_info=True)

    async def _ende(self) -> None:
        async with self._sperre:
            start = self._startzeit()
            try:
                zeit, titel = self._titel()
                treffer = [e for e in await self._offene() if str(e.get("summary", "")).endswith(zeit)]
                schluss = [f"ende={dt_util.now().isoformat()}", f"status={self._w('status')}",
                           f"fortschritt={self._w('fortschritt')}"]
                if treffer:
                    alt = (treffer[0].get("description") or "").replace("status=laeuft", "").strip().rstrip(";")
                    await self._schreiben("update_item", {
                        "item": treffer[0].get("uid") or treffer[0]["summary"], "rename": titel,
                        "description": "; ".join(filter(None, [alt] + schluss)),
                    })
                else:
                    # sehr kurzer Druck oder Neustart während des Drucks: jetzt anlegen
                    await self._schreiben("add_item", {"item": titel, "description": "; ".join([
                        f"gewicht_g={self._w('gewicht')}", f"laenge_m={self._w('laenge')}",
                        f"duese_mm={self._w('duese_mm')}", f"start={self._w('start')}",
                    ] + schluss)})
            except Exception:  # noqa: BLE001
                _LOGGER.warning("Druckende konnte nicht in %s eingetragen werden", self.liste, exc_info=True)
        await asyncio.sleep(FOTO_NACH_S)
        await self._foto(start)

    async def _foto(self, start: datetime) -> None:
        """Endfoto unter Medien › 3d-drucke, Dateiname = Startzeit (so ordnet die Seite es zu)."""
        kamera = self.ent.get("kamera")
        if not kamera:
            return
        try:
            if kamera.startswith("camera."):
                from homeassistant.components.camera import async_get_image
            else:
                from homeassistant.components.image import async_get_image
            bild = await async_get_image(self.hass, kamera)
            ziel = self.foto_ordner / f"{start.strftime('%Y-%m-%d_%H-%M')}.jpg"

            def speichern() -> None:
                ziel.parent.mkdir(parents=True, exist_ok=True)
                ziel.write_bytes(bild.content)

            await self.hass.async_add_executor_job(speichern)
        except Exception:  # noqa: BLE001 – Kamera aus: Druck ist trotzdem eingetragen
            _LOGGER.info("Endfoto von %s nicht möglich", kamera, exc_info=True)
