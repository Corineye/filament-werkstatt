#!/bin/sh
# Baut die Seite aus den Teilen in src/ (Reihenfolge ist wichtig):
#   filament-werkstatt.js          kleiner Lader (bleibt immer gleich, steht in der configuration.yaml)
#   filament-werkstatt-kern.js     die eigentliche Seite
#   filament-werkstatt-version.js  Versionsnummer, damit der Lader neue Versionen erkennt
cd "$(dirname "$0")"
{
  echo "// Filament-Werkstatt – automatisch aus src/ gebaut (sh build.sh). Nicht direkt bearbeiten."
  cat src/daten.js src/inventar-daten.js src/wissen.js src/stil.js src/inventar.js src/drucker.js src/buchen.js src/hilfe.js src/werkstatt.js src/nerd.js src/extras.js src/stl.js src/modelle.js src/panel.js
} > filament-werkstatt-kern.js
VERSION=$(sed -n 's/^const VERSION = "\(.*\)";$/\1/p' src/panel.js)
echo "export const VERSION = \"$VERSION\";" > filament-werkstatt-version.js
cp src/lader.js filament-werkstatt.js
