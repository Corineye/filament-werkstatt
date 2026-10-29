"""Dienste für andere Programme (z. B. die Desktop-App „Werkstatt“).

Die Seite speichert alles in den Frontend-Benutzerdaten von Home Assistant
(.storage/frontend.user_data_<Benutzer-ID>, Schlüssel „filament_werkstatt“). Die Dienste
lesen und schreiben genau dort, mit demselben Stempel „geaendert“ wie die Seite. Vor jeder
Änderung entsteht eine Sicherung im Medienordner (filament-werkstatt-sicherung/vor-dienst_*),
und Home Assistant meldet die Änderung sofort an die geöffnete Seite.

  filament_werkstatt.lesen                    → komplette Daten (Antwort)
  filament_werkstatt.warteschlange_hinzufuegen → neuer Auftrag in der Warteschlange
  filament_werkstatt.projekt_setzen           → Projekt eines Drucks / Auftrags setzen
"""

from __future__ import annotations

import asyncio
import copy
from datetime import datetime, timezone
import json
import logging
from pathlib import Path
import time
from typing import Any

import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.util import dt as dt_util

from .const import DOMAIN, SICHERUNG_ORDNER, SPEICHER_KEY
from .sicherung import benutzer_daten, kennung, _gueltig

_LOGGER = logging.getLogger(__name__)

VOR_DIENST_BEHALTEN = 30   # so viele Sicherungen „vor-dienst_…“ je Benutzer bleiben liegen

BENUTZER = {vol.Optional("benutzer"): cv.string}

SCHEMA_LESEN = vol.Schema({**BENUTZER})
SCHEMA_HINZUFUEGEN = vol.Schema({
    vol.Required("name"): vol.All(cv.string, vol.Length(min=1, max=80)),
    vol.Optional("gewicht_g"): vol.All(vol.Coerce(float), vol.Range(min=0, max=5000)),
    vol.Optional("zeit_min"): vol.All(vol.Coerce(int), vol.Range(min=0, max=100000)),
    vol.Optional("rolle_id"): cv.string,
    vol.Optional("notiz", default=""): vol.All(cv.string, vol.Length(max=140)),
    vol.Optional("projekt", default=""): vol.All(cv.string, vol.Length(max=60)),
    vol.Optional("quelle", default="werkstatt-app"): vol.All(cv.string, vol.Length(max=40)),
    **BENUTZER,
})
SCHEMA_PROJEKT = vol.Schema({
    vol.Optional("druck_uid"): cv.string,
    vol.Optional("warteschlange_id"): cv.string,
    vol.Required("projekt"): vol.All(cv.string, vol.Length(max=60)),
    **BENUTZER,
})


def _jetzt() -> str:
    """Zeitstempel im Format von JavaScripts toISOString (damit die Seite ihn vergleichen kann)."""
    t = datetime.now(timezone.utc)
    return t.strftime("%Y-%m-%dT%H:%M:%S.") + f"{t.microsecond // 1000:03d}Z"


def _base36(n: int) -> str:
    z = "0123456789abcdefghijklmnopqrstuvwxyz"
    s = ""
    while n:
        n, r = divmod(n, 36)
        s = z[r] + s
    return s or "0"


async def _benutzer_mit_daten(hass: HomeAssistant) -> list:
    liste = []
    for user in await hass.auth.async_get_users():
        if user.system_generated or not user.is_active:
            continue
        if _gueltig(await benutzer_daten(hass, user.id)):
            liste.append(user)
    return liste


async def _ziel(hass: HomeAssistant, call: ServiceCall):
    """Welcher Benutzer? Angegebener, sonst der Besitzer des Zugangs-Tokens, sonst der einzige mit Daten."""
    kandidaten = await _benutzer_mit_daten(hass)
    if not kandidaten:
        raise ServiceValidationError("Es gibt noch keine Filament-Werkstatt-Daten. Seite einmal öffnen.")
    wunsch = (call.data.get("benutzer") or "").strip().lower()
    if wunsch:
        for u in kandidaten:
            if wunsch in (u.id.lower(), kennung(u), (u.name or "").lower()):
                return u
        raise ServiceValidationError(
            f"Benutzer „{call.data['benutzer']}“ hat keine Daten. Möglich: {', '.join(kennung(u) for u in kandidaten)}"
        )
    if call.context.user_id:
        for u in kandidaten:
            if u.id == call.context.user_id:
                return u
    if len(kandidaten) == 1:
        return kandidaten[0]
    raise ServiceValidationError(
        f"Mehrere Benutzer haben Daten, bitte „benutzer“ angeben: {', '.join(kennung(u) for u in kandidaten)}"
    )


def _sperre(hass: HomeAssistant) -> asyncio.Lock:
    return hass.data.setdefault(DOMAIN, {}).setdefault("schreibsperre", asyncio.Lock())


def _sichern_vorher(hass: HomeAssistant, user, daten: dict[str, Any]) -> str:
    ordner = Path(hass.config.media_dirs.get("local") or hass.config.path("media")) / SICHERUNG_ORDNER
    ordner.mkdir(parents=True, exist_ok=True)
    wer = kennung(user)
    jetzt = dt_util.now()
    name = f"vor-dienst_{jetzt.strftime('%Y-%m-%d_%H-%M-%S')}-{jetzt.microsecond // 1000:03d}_{wer}.json"
    ziel = ordner / name
    tmp = ziel.with_suffix(".tmp")
    tmp.write_text(json.dumps(daten, ensure_ascii=False, indent=1), encoding="utf-8")
    tmp.replace(ziel)
    alte = sorted(ordner.glob(f"vor-dienst_*_{wer}.json"), reverse=True)
    for a in alte[VOR_DIENST_BEHALTEN:]:
        try:
            a.unlink()
        except OSError:
            _LOGGER.warning("Alte Sicherung %s ließ sich nicht löschen", a)
    return name


async def _aendern(hass: HomeAssistant, call: ServiceCall, aenderung) -> tuple[Any, str]:
    """Daten lesen, Sicherung anlegen, `aenderung(daten)` anwenden, mit neuem Stempel speichern."""
    from homeassistant.components.frontend.storage import async_user_store  # noqa: PLC0415

    user = await _ziel(hass, call)
    async with _sperre(hass):
        store = await async_user_store(hass, user.id)
        aktuell = (store.data or {}).get(SPEICHER_KEY)
        if not _gueltig(aktuell):
            raise ServiceValidationError("Die Daten dieses Benutzers sind leer oder unlesbar.")
        daten = copy.deepcopy(aktuell)
        await hass.async_add_executor_job(_sichern_vorher, hass, user, aktuell)
        ergebnis = aenderung(daten)
        daten["geaendert"] = _jetzt()
        await store.async_set_item(SPEICHER_KEY, daten)
    return ergebnis, kennung(user)


def _mit_fehlerantwort(f):
    """Fragt der Aufrufer eine Antwort an (REST: ?return_response), kommt ein Prüffehler als
    {"ok": false, "fehler": "…"} zurück statt als unleserlicher Serverfehler; sonst wird er ausgelöst."""

    async def umhuellt(call: ServiceCall) -> ServiceResponse:
        try:
            antwort = await f(call)
        except ServiceValidationError as fehler:
            if call.return_response:
                return {"ok": False, "fehler": str(fehler)}
            raise
        return {"ok": True, **antwort} if antwort is not None else antwort

    return umhuellt


def registrieren(hass: HomeAssistant) -> None:
    """Die drei Dienste anmelden (einmal je Start)."""

    async def lesen(call: ServiceCall) -> ServiceResponse:
        user = await _ziel(hass, call)
        daten = await benutzer_daten(hass, user.id)
        return {"benutzer": kennung(user), "version": daten.get("version"), "geaendert": daten.get("geaendert"), "daten": daten}

    async def hinzufuegen(call: ServiceCall) -> ServiceResponse:
        d = call.data

        def aender(daten: dict[str, Any]) -> dict[str, Any]:
            schlange = daten.setdefault("warteschlange", [])
            rolle = d.get("rolle_id")
            if rolle and not any(r.get("id") == rolle for r in daten.get("rollen", [])):
                raise ServiceValidationError(f"Rolle „{rolle}“ gibt es nicht.")
            if not rolle:
                rolle = daten.get("geladen") or daten.get("letzte_rolle")
            neu = {
                "id": f"a-{_base36(int(time.time() * 1000))}",
                "name": d["name"].strip(),
                "gewicht": round(d["gewicht_g"], 1) if d.get("gewicht_g") else None,
                "zeit": None,
                "dauer_min": d.get("zeit_min") or None,
                "rolleId": rolle,
                "notiz": d["notiz"].strip(),
                "am": _jetzt(),
                "quelle": d["quelle"],
            }
            if d["projekt"].strip():
                neu["projekt"] = d["projekt"].strip()
            if any(x.get("id") == neu["id"] for x in schlange):   # gleiche Millisekunde: Zähler anhängen
                neu["id"] += f"-{len(schlange)}"
            schlange.append(neu)
            return {"id": neu["id"], "platz": len(schlange)}

        ergebnis, wer = await _aendern(hass, call, aender)
        return {**ergebnis, "benutzer": wer}

    async def projekt_setzen(call: ServiceCall) -> ServiceResponse:
        d = call.data
        uid, wid = d.get("druck_uid"), d.get("warteschlange_id")
        if not uid and not wid:
            raise ServiceValidationError("Bitte druck_uid oder warteschlange_id angeben.")
        projekt = d["projekt"].strip()

        def aender(daten: dict[str, Any]) -> dict[str, Any]:
            gesetzt = []
            if uid:
                alle = daten.setdefault("drucke", {})
                x = dict(alle.get(uid) or {})
                if projekt:
                    x["projekt"] = projekt
                else:
                    x.pop("projekt", None)
                alle[uid] = x
                gesetzt.append("druck")
            if wid:
                treffer = [a for a in daten.setdefault("warteschlange", []) if a.get("id") == wid]
                if not treffer:
                    raise ServiceValidationError(f"Warteschlangen-Eintrag „{wid}“ gibt es nicht.")
                for a in treffer:
                    if projekt:
                        a["projekt"] = projekt
                    else:
                        a.pop("projekt", None)
                gesetzt.append("warteschlange")
            return {"gesetzt": gesetzt, "projekt": projekt}

        ergebnis, wer = await _aendern(hass, call, aender)
        return {**ergebnis, "benutzer": wer}

    hass.services.async_register(DOMAIN, "lesen", _mit_fehlerantwort(lesen), schema=SCHEMA_LESEN, supports_response=SupportsResponse.ONLY)
    hass.services.async_register(DOMAIN, "warteschlange_hinzufuegen", _mit_fehlerantwort(hinzufuegen), schema=SCHEMA_HINZUFUEGEN, supports_response=SupportsResponse.OPTIONAL)
    hass.services.async_register(DOMAIN, "projekt_setzen", _mit_fehlerantwort(projekt_setzen), schema=SCHEMA_PROJEKT, supports_response=SupportsResponse.OPTIONAL)
