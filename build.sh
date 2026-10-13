#!/bin/sh
# Baut die Seite aus den Teilen in src/ (Reihenfolge ist wichtig) in die Integration:
#   custom_components/filament_werkstatt/frontend/
#     filament-werkstatt.js          kleiner Lader (ändert sich nie)
#     filament-werkstatt-kern.js     die eigentliche Seite
#     filament-werkstatt-version.js  Versionsnummer, damit der Lader neue Versionen erkennt
# Die Versionsnummer in manifest.json wird aus src/panel.js übernommen.
cd "$(dirname "$0")"
ZIEL=custom_components/filament_werkstatt/frontend
mkdir -p "$ZIEL"
{
  echo "// Filament-Werkstatt – automatisch aus src/ gebaut (sh build.sh). Nicht direkt bearbeiten."
  cat src/daten.js src/inventar-daten.js src/wissen.js src/stil.js src/inventar.js src/drucker.js src/buchen.js src/hilfe.js src/werkstatt.js src/nerd.js src/extras.js src/stl.js src/modelle.js src/panel.js
} > "$ZIEL/filament-werkstatt-kern.js"
VERSION=$(sed -n 's/^const VERSION = "\(.*\)";$/\1/p' src/panel.js)
echo "export const VERSION = \"$VERSION\";" > "$ZIEL/filament-werkstatt-version.js"
cp src/lader.js "$ZIEL/filament-werkstatt.js"
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" custom_components/filament_werkstatt/manifest.json
