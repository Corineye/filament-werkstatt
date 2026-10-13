# Erzeugt das Testmodell „halter.stl“: Block mit Löchern für Einsatz, Schraube, Magnet und Überhang.
import trimesh
from trimesh.creation import box, cylinder
from trimesh.transformations import translation_matrix as T, rotation_matrix as R
import math
import os
import zipfile

ordner = "test/modelle"

teil = box(extents=[60, 40, 16], transform=T([0, 0, 8]))
# Überhang: Auskragung oben rechts (braucht Stützen)
teil = teil.union(box(extents=[20, 40, 6], transform=T([38, 0, 13])))
loecher = [
    cylinder(radius=4.2 / 2, height=6.0, sections=64, transform=T([-18, -10, 16 - 3])),        # M3-Einsatz Ø4,2 × 6 Sackloch
    cylinder(radius=4.2 / 2, height=6.0, sections=64, transform=T([-18, 10, 16 - 3])),
    cylinder(radius=3.4 / 2, height=40, sections=64, transform=T([0, 0, 8])),                   # M3-Durchgang
    cylinder(radius=10.15 / 2, height=1.7, sections=96, transform=T([16, -8, 16 - 0.85])),      # Magnet Ø10 × 1,54
    cylinder(radius=3.4 / 2, height=80, sections=64, transform=T([0, 10, 6]) @ R(math.pi / 2, [0, 1, 0])),  # quer durch (X)
]
for l in loecher:
    teil = teil.difference(l)
teil.apply_translation([128, 128, 0])
teil.export("test/modelle/halter.stl")
print(len(teil.faces), teil.volume, teil.bounds)


# ---- Kleiner G-Code im Bambu-Stil (Kasten 30×20×6 mm, Wände, Füllung, Boden/Deckel) ----
def gcode():
    z_h = 0.2
    zeilen = ["; HEADER_BLOCK_START", "; model printing time: 12m 30s; total estimated time: 18m 4s",
              "; total filament length [mm] : 1520.40", "; total filament weight [g] : 4.53",
              "; HEADER_BLOCK_END", "; filament_type = PLA", "; nozzle_diameter = 0.4", "; layer_height = 0.2",
              "G90", "M83", "G28"]
    x0, y0 = 113, 118
    n = int(6 / z_h)
    for i in range(n):
        z = round((i + 1) * z_h, 2)
        zeilen += ["; CHANGE_LAYER", f"; Z_HEIGHT: {z}", f"G1 Z{z} F600"]
        for k, art in enumerate(["Outer wall", "Inner wall"]):
            o = 0.2 + k * 0.42
            pts = [(x0 + o, y0 + o), (x0 + 30 - o, y0 + o), (x0 + 30 - o, y0 + 20 - o), (x0 + o, y0 + 20 - o), (x0 + o, y0 + o)]
            zeilen += [f"; FEATURE: {art}", f"G1 X{pts[0][0]:.3f} Y{pts[0][1]:.3f} F12000"]
            zeilen += [f"G1 X{x:.3f} Y{y:.3f} E0.8" for x, y in pts[1:]]
        massiv = i < 3 or i >= n - 3
        art = "Bottom surface" if i < 3 else "Top surface" if i >= n - 3 else "Sparse infill"
        zeilen.append(f"; FEATURE: {art}")
        schritt = 0.45 if massiv else 3
        y = y0 + 1.2
        r = 1
        while y < y0 + 20 - 1.2:
            a, b = (x0 + 1.2, x0 + 30 - 1.2) if r > 0 else (x0 + 30 - 1.2, x0 + 1.2)
            if massiv or True:
                zeilen += [f"G1 X{a:.3f} Y{y:.3f} F12000", f"G1 X{b:.3f} Y{y:.3f} E1.1"]
            y += schritt
            r = -r
    zeilen += ["M104 S0", "; EXECUTABLE_BLOCK_END"]
    return "\n".join(zeilen) + "\n"


g = gcode()
open(os.path.join(ordner, "kasten.gcode"), "w").write(g)
with zipfile.ZipFile(os.path.join(ordner, "kasten.gcode.3mf"), "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml", "<Types/>")
    z.writestr("Metadata/plate_1.gcode", g)
