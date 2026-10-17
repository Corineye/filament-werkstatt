"""Nächtliche Sicherung der Seiten-Daten auf dem Home-Assistant-Rechner.

Jede Nacht um 03:00 (Ortszeit) werden die Daten jedes Benutzers (Frontend-Benutzerdaten,
Schlüssel „filament_werkstatt“) als JSON in den Medienordner geschrieben:
  filament-werkstatt-sicherung/<JJJJ-MM-TT>_<benutzer>.json
Pro Benutzer bleiben die neuesten 14 Dateien. Die Dateien sind genau das, was die Seite
speichert, man kann sie also auch über „Einspielen“ wieder laden.
"""

from __future__ import annotations

from collections.abc import Callable
from datetime import datetime, timedelta
import json
import logging
import os
from pathlib import Path
import re
from typing import Any

from homeassistant.auth.models import User
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_track_time_change
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util, slugify

from .const import SICHERUNG_BEHALTEN, SICHERUNG_ORDNER, SICHERUNG_STUNDE, SPEICHER_KEY

_LOGGER = logging.getLogger(__name__)

DATEI_MUSTER = re.compile(r"^(\d{4}-\d{2}-\d{2})_([a-z0-9_]+)\.json$")


def kennung(user: User) -> str:
    """Name des Benutzers für den Dateinamen (nur a–z, 0–9 und _)."""
    return slugify(user.name or "") or user.id[:12]


async def benutzer_daten(hass: HomeAssistant, user_id: str) -> Any:
    """Gespeicherte Seiten-Daten eines Benutzers, ohne etwas zu verändern.

    Bevorzugt über den Speicher der Frontend-Integration (hat die neuesten Werte im
    Speicher); wenn es den so nicht gibt, direkt aus .storage/frontend.user_data_<id>.
    """
    try:
        from homeassistant.components.frontend.storage import async_user_store  # noqa: PLC0415

        store = await async_user_store(hass, user_id)
        daten = store[1] if isinstance(store, tuple) else store.data  # ältere HA-Versionen: (store, daten)
        return (daten or {}).get(SPEICHER_KEY)
    except Exception:  # noqa: BLE001
        _LOGGER.debug("Frontend-Speicher nicht direkt lesbar, lese die Datei", exc_info=True)
    daten = await Store(hass, 1, f"frontend.user_data_{user_id}").async_load()
    return (daten or {}).get(SPEICHER_KEY) if isinstance(daten, dict) else None


def _gueltig(daten: Any) -> bool:
    return isinstance(daten, dict) and isinstance(daten.get("rollen"), list)


class Sicherung:
    """Schreibt, listet und liest die Sicherungen im Medienordner."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.ordner = Path(hass.config.media_dirs.get("local") or hass.config.path("media")) / SICHERUNG_ORDNER
        self.automatisch = False

    # ---- Zeitplan ----
    @callback
    def starten(self) -> Callable[[], None]:
        """Jede Nacht um 03:00 sichern; nach dem Start fehlende Sicherungen nachholen."""

        @callback
        def nachts(_jetzt: datetime) -> None:
            self.hass.async_create_background_task(self.alle_sichern(), "filament_werkstatt_sicherung")

        @callback
        def gestartet(_hass: HomeAssistant) -> None:
            # Lief der Rechner um 03:00 nicht, die Sicherung jetzt nachholen
            self.hass.async_create_background_task(self.alle_sichern(nur_fehlende=True), "filament_werkstatt_sicherung_start")

        ab_zeit = async_track_time_change(self.hass, nachts, hour=SICHERUNG_STUNDE, minute=0, second=0)
        ab_start = async_at_started(self.hass, gestartet)
        self.automatisch = True

        @callback
        def stoppen() -> None:
            self.automatisch = False
            ab_zeit()
            ab_start()

        return stoppen

    # ---- Sichern ----
    async def alle_sichern(self, nur_fehlende: bool = False) -> int:
        """Alle Benutzer mit Werkstatt-Daten sichern. Gibt die Anzahl der Dateien zurück."""
        anzahl = 0
        gestern = (dt_util.now() - timedelta(days=1)).date().isoformat()
        for user in await self.hass.auth.async_get_users():
            if user.system_generated or not user.is_active:
                continue
            try:
                if nur_fehlende:
                    liste = await self.hass.async_add_executor_job(self._dateien, kennung(user))
                    if liste and liste[0][0] >= gestern:
                        continue
                if await self.sichern(user):
                    anzahl += 1
            except Exception:  # noqa: BLE001 – ein Benutzer darf die anderen nicht aufhalten
                _LOGGER.exception("Sicherung für %s fehlgeschlagen", user.name)
        if anzahl:
            _LOGGER.info("Filament-Werkstatt: %s Sicherung(en) in %s geschrieben", anzahl, self.ordner)
        return anzahl

    async def sichern(self, user: User) -> dict[str, Any] | None:
        """Daten eines Benutzers sichern (überschreibt die Datei von heute)."""
        daten = await benutzer_daten(self.hass, user.id)
        if not _gueltig(daten):
            return None
        text = json.dumps(daten, ensure_ascii=False, indent=1)
        name = f"{dt_util.now().date().isoformat()}_{kennung(user)}.json"
        return await self.hass.async_add_executor_job(self._schreiben, name, text, kennung(user))

    def _schreiben(self, name: str, text: str, wer: str) -> dict[str, Any]:
        self.ordner.mkdir(parents=True, exist_ok=True)
        ziel = self.ordner / name
        tmp = ziel.with_suffix(".tmp")
        tmp.write_text(text, encoding="utf-8")
        os.replace(tmp, ziel)
        # Nur die neuesten behalten
        for _datum, alt in self._dateien(wer)[SICHERUNG_BEHALTEN:]:
            try:
                alt.unlink()
            except OSError:
                _LOGGER.warning("Alte Sicherung %s ließ sich nicht löschen", alt)
        return self._eintrag(ziel)

    # ---- Lesen ----
    def _dateien(self, wer: str) -> list[tuple[str, Path]]:
        """(Datum, Pfad) der Sicherungen eines Benutzers, neueste zuerst."""
        if not self.ordner.is_dir():
            return []
        l = []
        for p in self.ordner.iterdir():
            m = DATEI_MUSTER.match(p.name)
            if m and m.group(2) == wer and p.is_file():
                l.append((m.group(1), p))
        return sorted(l, reverse=True)

    def _eintrag(self, p: Path) -> dict[str, Any]:
        st = p.stat()
        # Uhrzeit aus der Datei; passt deren Datum nicht zum Namen (z. B. nach dem
        # Zurückspielen eines HA-Backups), gilt das Datum im Namen mit 03:00
        zeit = dt_util.as_local(dt_util.utc_from_timestamp(st.st_mtime))
        if zeit.date().isoformat() != p.name[:10]:
            datum = datetime.strptime(p.name[:10], "%Y-%m-%d")
            zeit = datum.replace(hour=SICHERUNG_STUNDE, tzinfo=dt_util.get_default_time_zone())
        e: dict[str, Any] = {
            "datei": p.name,
            "datum": p.name[:10],
            "zeit": zeit.isoformat(),
            "groesse": st.st_size,
            "rollen": None,
            "geaendert": None,
        }
        try:
            d = json.loads(p.read_text(encoding="utf-8"))
            e["rollen"] = len(d.get("rollen") or [])
            e["inventar"] = len(d.get("inventar") or [])
            e["geaendert"] = d.get("geaendert")
        except (OSError, ValueError, AttributeError):
            e["kaputt"] = True
        return e

    def liste(self, user: User) -> list[dict[str, Any]]:
        return [self._eintrag(p) for _datum, p in self._dateien(kennung(user))]

    def lesen(self, user: User, datei: str) -> Any:
        """Eine Sicherung des Benutzers lesen; fremde oder unbekannte Dateien gibt es nicht."""
        m = DATEI_MUSTER.match(datei or "")
        if not m or m.group(2) != kennung(user):
            raise FileNotFoundError(datei)
        return json.loads((self.ordner / datei).read_text(encoding="utf-8"))
