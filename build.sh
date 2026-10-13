#!/bin/sh
# Baut filament-werkstatt.js aus den Teilen in src/ (Reihenfolge ist wichtig).
cd "$(dirname "$0")"
{
  echo "// Filament-Werkstatt – automatisch aus src/ gebaut (sh build.sh). Nicht direkt bearbeiten."
  cat src/daten.js src/inventar-daten.js src/stil.js src/inventar.js src/drucker.js src/panel.js
} > filament-werkstatt.js
