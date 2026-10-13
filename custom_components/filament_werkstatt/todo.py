"""Eigene Liste „3D-Drucke“, falls bei der Einrichtung keine bestehende gewählt wurde."""

from __future__ import annotations

from uuid import uuid4

from homeassistant.components.todo import TodoItem, TodoItemStatus, TodoListEntity, TodoListEntityFeature
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.storage import Store

from .const import DOMAIN


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    async_add_entities([DruckListe(hass, entry)])


class DruckListe(TodoListEntity):
    """Einfache Liste, gespeichert in .storage/filament_werkstatt.drucke."""

    _attr_name = "3D-Drucke"
    _attr_icon = "mdi:printer-3d"
    _attr_supported_features = (
        TodoListEntityFeature.CREATE_TODO_ITEM
        | TodoListEntityFeature.UPDATE_TODO_ITEM
        | TodoListEntityFeature.DELETE_TODO_ITEM
        | TodoListEntityFeature.SET_DESCRIPTION_ON_ITEM
    )

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self._attr_unique_id = f"{entry.entry_id}_drucke"
        self._store: Store[list[dict]] = Store(hass, 1, f"{DOMAIN}.drucke")
        self._eintraege: list[dict] = []

    async def async_added_to_hass(self) -> None:
        self._eintraege = await self._store.async_load() or []

    @property
    def todo_items(self) -> list[TodoItem]:
        return [
            TodoItem(uid=e["uid"], summary=e["summary"], status=TodoItemStatus(e["status"]), description=e.get("description"))
            for e in self._eintraege
        ]

    async def _sichern(self) -> None:
        await self._store.async_save(self._eintraege)
        self.async_write_ha_state()

    @staticmethod
    def _als_dict(item: TodoItem, uid: str) -> dict:
        return {"uid": uid, "summary": item.summary or "", "status": str(item.status or TodoItemStatus.NEEDS_ACTION),
                "description": item.description}

    async def async_create_todo_item(self, item: TodoItem) -> None:
        self._eintraege.insert(0, self._als_dict(item, uuid4().hex))
        await self._sichern()

    async def async_update_todo_item(self, item: TodoItem) -> None:
        for i, e in enumerate(self._eintraege):
            if e["uid"] == item.uid:
                self._eintraege[i] = self._als_dict(item, e["uid"])
                break
        await self._sichern()

    async def async_delete_todo_items(self, uids: list[str]) -> None:
        self._eintraege = [e for e in self._eintraege if e["uid"] not in uids]
        await self._sichern()
