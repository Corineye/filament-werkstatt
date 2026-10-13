"""Zuletzt geöffnete 3D-Modelle auf dem Home-Assistant-Rechner, damit jedes Gerät sie sieht.

Die Dateien liegen unter Medien › 3d-modelle. Behalten werden die neuesten
MAX_ANZAHL Dateien, ältere werden beim Hochladen automatisch gelöscht.
"""

from __future__ import annotations

from http import HTTPStatus
from pathlib import Path
import re
import time

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

MAX_ANZAHL = 20
MAX_BYTES = 200 * 1024 * 1024
ENDUNGEN = (".stl", ".gcode", ".3mf")


def ordner(hass: HomeAssistant) -> Path:
    return Path(hass.config.media_dirs.get("local") or hass.config.path("media")) / "3d-modelle"


def _sicherer_name(name: str) -> str | None:
    """Nur ein Dateiname ohne Pfad und mit erlaubter Endung."""
    name = Path(name.replace("\\", "/")).name.strip()
    name = re.sub(r"[^\w.\- ()äöüÄÖÜß]", "_", name)
    if not name or name.startswith(".") or not name.lower().endswith(ENDUNGEN):
        return None
    return name[:150]


def _liste(pfad: Path) -> list[dict]:
    if not pfad.is_dir():
        return []
    dateien = [p for p in pfad.iterdir() if p.is_file() and p.name.lower().endswith(ENDUNGEN)]
    dateien.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    return [{"name": p.name, "groesse": p.stat().st_size, "zeit": int(p.stat().st_mtime * 1000)} for p in dateien]


def _aufraeumen(pfad: Path) -> None:
    for alt in _liste(pfad)[MAX_ANZAHL:]:
        (pfad / alt["name"]).unlink(missing_ok=True)


class ModelleListe(HomeAssistantView):
    """GET: Liste der Modelle. POST ?name=…: Datei (roher Inhalt) speichern."""

    url = "/api/filament_werkstatt/modelle"
    name = "api:filament_werkstatt:modelle"

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        pfad = ordner(hass)
        liste = await hass.async_add_executor_job(_liste, pfad)
        return self.json({"modelle": liste, "belegt": sum(m["groesse"] for m in liste), "max_anzahl": MAX_ANZAHL})

    async def post(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        name = _sicherer_name(request.query.get("name", ""))
        if not name:
            return self.json_message("Ungültiger Dateiname", HTTPStatus.BAD_REQUEST)
        # Gestreamt lesen: die Grenze von Home Assistant für Anfragen liegt unter großen STL-Dateien
        teile: list[bytes] = []
        groesse = 0
        async for stueck in request.content.iter_chunked(1 << 16):
            groesse += len(stueck)
            if groesse > MAX_BYTES:
                return self.json_message("Datei zu groß", HTTPStatus.REQUEST_ENTITY_TOO_LARGE)
            teile.append(stueck)
        pfad = ordner(hass)

        def speichern() -> None:
            pfad.mkdir(parents=True, exist_ok=True)
            ziel = pfad / name
            tmp = pfad / f".{name}.{time.time_ns()}.tmp"
            tmp.write_bytes(b"".join(teile))
            tmp.replace(ziel)
            _aufraeumen(pfad)

        await hass.async_add_executor_job(speichern)
        return self.json({"name": name, "groesse": groesse})


class ModellDatei(HomeAssistantView):
    """GET: Datei laden (und als zuletzt geöffnet markieren). DELETE: aus der Liste entfernen."""

    url = "/api/filament_werkstatt/modelle/{name}"
    name = "api:filament_werkstatt:modell"

    async def get(self, request: web.Request, name: str) -> web.StreamResponse:
        hass: HomeAssistant = request.app["hass"]
        sicher = _sicherer_name(name)
        datei = ordner(hass) / sicher if sicher else None
        if not datei or not await hass.async_add_executor_job(datei.is_file):
            return self.json_message("Nicht gefunden", HTTPStatus.NOT_FOUND)
        # Öffnen zählt als „zuletzt geöffnet“
        await hass.async_add_executor_job(datei.touch)
        return web.FileResponse(datei, headers={"Cache-Control": "no-store"})

    async def delete(self, request: web.Request, name: str) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        sicher = _sicherer_name(name)
        if not sicher:
            return self.json_message("Ungültiger Dateiname", HTTPStatus.BAD_REQUEST)
        await hass.async_add_executor_job(lambda: (ordner(hass) / sicher).unlink(missing_ok=True))
        return self.json({"geloescht": sicher})
