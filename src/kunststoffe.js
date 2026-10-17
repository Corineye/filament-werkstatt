
// ============================================================================
// Hilfe › Kunststoffe (Materialien und Unterarten) und Fehlercodes des Druckers
// ============================================================================
// Quelle Kunststoffe: Recherche 13.10.2026 (website/kunststoffe-recherche.md): Bambu-Wiki,
// Bambu-Shopseiten und Datenblätter. Alle genannten Produkte gelten als in Deutschland erhältlich.
// Unsicheres steht in „unsicher“ und wird leise als „bitte prüfen“ markiert.

// Filter-Chips über der Materialliste
const KS_FILTER = [
  ["einsteiger", "🌱 Einsteigerfreundlich"], ["hitze", "🔥 Hitzebeständig"], ["flexibel", "🪀 Flexibel"], ["outdoor", "☀️ Outdoor/UV"],
  ["lebensmittel", "🍎 Lebensmittel & Kinder"], ["faser", "🧶 Faserverstärkt (abrasiv)"], ["stuetz", "🪜 Stützmaterial"], ["optik", "✨ Optik & Deko"], ["p1s", "✅ P1S-geeignet"],
];
// Ampel „Für den P1S geeignet?“ (P1S mit Serien-Edelstahldüse, ohne AMS)
const KS_P1S = {
  ok: { stufe: "gruen", kurz: "P1S: gut", lang: "Gut geeignet" },
  bedingt: { stufe: "gelb", kurz: "P1S: bedingt", lang: "Geht mit Einschränkungen" },
  duese: { stufe: "orange", kurz: "P1S: Umrüstung", lang: "Nur mit gehärteter Düse und gehärtetem Extruder" },
  nein: { stufe: "rot", kurz: "P1S: nein", lang: "Nicht geeignet" },
};

const KUNSTSTOFFE = [
  { id: "pla", name: "PLA", voll: "Polylactid", farbe: "#3ee6a8", material: ["PLA"], p1s: "ok", filter: ["einsteiger", "optik"],
    kurz: "Der Standard im Hobby-3D-Druck. Aus nachwachsenden Rohstoffen (Maisstärke, Zuckerrohr), druckt sehr einfach, verzieht kaum und riecht wenig.",
    duese: "190–230 °C", dueseNotiz: "Spezialsorten bis 240–260 °C", bett: "35–65 °C", bettNotiz: "Cool Plate 35–45 °C, PEI 45–65 °C",
    platte: "Cool Plate, Smooth oder Textured PEI", platteNotiz: "Engineering Plate nicht empfohlen; Klebestift oder Bambu Liquid Glue",
    gehaeuse: "nein", gehaeuseNotiz: "Beim P1S ab Bett über 45 °C Glasdeckel abnehmen oder Tür öffnen (laut Bambu-Wiki), sonst Hitzestau und Verstopfung (Heat Creep).",
    trocknen: "55 °C · 8 h", hygro: "niedrig–mittel", gehaertet: "nein", gehaertetNotiz: "außer gefüllte Sorten (CF, Glow, Wood)",
    anwendungen: "Deko, Figuren, Prototypen, Spielzeug, Halterungen für drinnen, Cosplay",
    staerken: ["sehr einfach zu drucken", "kaum Verzug (Warping)", "hohe Detailtreue, steif", "riesige Farb- und Effektauswahl", "geringe Emissionen"],
    schwaechen: ["wenig hitzebeständig (verformt ab ca. 57 °C, Auto im Sommer!)", "spröde", "kriecht unter Dauerlast", "nur mäßig UV-beständig"],
    sicherheit: "Geringe Emissionen, trotzdem lüften.",
    lebensmittel: "Das Material an sich ist unbedenklich, gedruckte Teile sind aber in der Regel nicht lebensmittelsicher. Einzige Bambu-Sorte mit Lebensmittel- und Spielzeugangabe: PLA Pure.",
    varianten: [
      { id: "basic", name: "PLA Basic", arten: ["basic"], filter: ["einsteiger", "lebensmittel"],
        was: "Standard-PLA, glänzend bis seidenmatt, sehr viele Farben, einsteigerfreundlich. Laut Bambu-Blog UL 2904 GREENGUARD (geprüfte Emissionen) – das ist kein Lebensmittelzertifikat.",
        druck: "190–230 °C, bis 300 mm/s, alle Düsen inkl. 0,2 mm." },
      { id: "pure", name: "PLA Pure", neu: "neu, Juni 2026", filter: ["einsteiger", "lebensmittel"],
        was: "Für den Druck im Wohnraum: Rezeptur aus 5 Bestandteilen ohne übliche Zusätze, weniger Emissionen als PLA Basic. Laut Bambu EU 10/2011 (Lebensmittelkontakt), EN 71-3 (Spielzeug) und UL 2904 GREENGUARD. Für Spielzeug, Haushalt und Küchenhelfer für trockene Lebensmittel.",
        druck: "Bambu-Profil „PLA Pure“ wählen. Für lebensmittelnahe Teile eine saubere Düse nutzen, nicht direkt nach anderen Materialien ohne Reinigung.",
        unsicher: "Druckwerte im Detail nicht verifiziert; Zertifikate sind Herstellerangaben und gelten für das Filament, nicht automatisch für jedes Druckteil." },
      { id: "matte", name: "PLA Matte", arten: ["matte", "matt"], filter: ["einsteiger", "optik"],
        was: "Matte, samtige Oberfläche, Schichtlinien fallen weniger auf; etwas spröder als Basic. Deko, Modelle, Figuren.",
        druck: "Wie PLA Basic, alle Düsen." },
      { id: "silk", name: "PLA Silk / Silk+", arten: ["silk", "silk+"], filter: ["einsteiger", "optik"],
        was: "Seidiger Hochglanz- bzw. Metallic-Look. Silk+ ist die verbesserte Fassung (bessere Schichthaftung, mehr Farben). Mechanisch schwächer als Basic. Vasen, Deko, Figuren.",
        druck: "Silk+: 210–240 °C, bis 250 mm/s. Für den besten Glanz Außenwand langsam drucken (ca. 50 mm/s). Alle Düsen 0,2–0,8 mm, verformt ab ca. 56 °C." },
      { id: "silkmulti", name: "PLA Silk Multi-Color", filter: ["optik"],
        was: "Zwei oder drei Farben parallel im Strang – die Farbe wechselt je nach Blickwinkel und Wandrichtung. Vasen, Deko.",
        druck: "Wie Silk. Am schönsten im Vasenmodus bzw. bei runden, einwandigen Objekten." },
      { id: "gradient", name: "PLA Basic Gradient", arten: ["gradient"], filter: ["optik"],
        was: "Farbverlauf entlang der Spule: die Farbe wechselt über die Länge.",
        druck: "Wie Basic. Wie viel Verlauf man sieht, hängt von der Teilegröße ab." },
      { id: "galaxy", name: "PLA Galaxy", arten: ["galaxy"], filter: ["optik", "faser"], p1s: "bedingt",
        was: "Glitzer- und Sternenhimmel-Effekt durch Glas-Mikrokugeln (laut Datenblatt). Deko.",
        druck: "190–230 °C. Datenblatt erlaubt 0,2–0,8 mm, besser 0,4 mm oder größer. Verschleiß bei Dauernutzung möglich.",
        unsicher: "Gehärtete Düse: Datenblatt fordert keine, Händler raten von 0,2 mm ab – Angaben uneinheitlich." },
      { id: "sparkle", name: "PLA Sparkle", arten: ["sparkle", "glitzer"], filter: ["optik", "faser"], p1s: "bedingt",
        was: "Glitzert durch Metallpartikel. Deko, Figuren.",
        druck: "190–230 °C, bis 250 mm/s; 0,2-mm-Düse nicht unterstützt.",
        unsicher: "Bambu-Wiki stuft metallgefülltes PLA als „gehärtete Düse“ ein, die Shopseite sagt nichts dazu." },
      { id: "marble", name: "PLA Marble", arten: ["marble", "marmor"], filter: ["optik"], p1s: "bedingt",
        was: "Steinoptik mit Marmor-Sprenkeln durch Partikel. Deko, Architekturmodelle.",
        druck: "190–230 °C, bis 250 mm/s; 0,2 mm nicht kompatibel (gefülltes PLA, ab 0,4 mm).",
        unsicher: "Ob eine gehärtete Düse nötig ist, gibt Bambu uneinheitlich an." },
      { id: "metal", name: "PLA Metal", arten: ["metal", "metallic"], filter: ["einsteiger", "optik"],
        was: "Metallic-Look ohne echte Metallpartikel (laut Bambu keine Metallfüllstoffe). Deko, Cosplay.",
        druck: "190–230 °C, bis 300 mm/s, keine Düsenbeschränkung genannt." },
      { id: "glow", name: "PLA Glow", arten: ["glow"], filter: ["optik", "faser"], p1s: "duese",
        was: "Leuchtet im Dunkeln nach; die Leuchtpigmente sind abrasiv. Nachtlichter, Schilder, Kinderdeko. Lädt sich mit UV- bzw. Sonnenlicht auf (ca. 2 h).",
        druck: "190–230 °C (Wiki: 210–240 °C), bis 250 mm/s. Laut Bambu gehärtete Düse bei regelmäßigem Druck nötig; 0,4/0,6/0,8 mm, nicht 0,2 mm. Gelegentlich geht es mit 0,6-mm-Edelstahldüse – kostet aber Düse." },
      { id: "wood", name: "PLA Wood", arten: ["wood", "holz"], filter: ["optik", "faser"], p1s: "bedingt",
        was: "PLA mit feinem Holzmehl: Holzoptik, leichter Holzduft. Deko, Schachfiguren, Kästchen. Nimmt mehr Feuchte auf als PLA.",
        druck: "190–240 °C, bis 250 mm/s. Gehärtete Düse empfohlen, Edelstahl laut Bambu nicht empfohlen; 0,2 mm nicht unterstützt. Am P1S höchstens mit 0,6-mm-Düse." },
      { id: "translucent", name: "PLA Translucent", arten: ["translucent", "transparent", "klar"], filter: ["einsteiger", "optik"],
        was: "Milchig durchscheinend (frosted), streut Licht. Lampenschirme, Leuchtobjekte.",
        druck: "200–240 °C, bis 150 mm/s, Bett 35–65 °C, alle Düsen. Je dünner die Wand (Vasenmodus), desto durchscheinender." },
      { id: "tough", name: "PLA Tough+", neu: "seit Juli 2025, ersetzt PLA Tough", filter: ["flexibel"],
        was: "Schlagzäh, laut Bambu Zähigkeit auf ABS-Niveau und bis zu doppelte Schichthaftung. Hält wiederholtes Biegen aus: Clips, Schnapphaken, Federn.",
        druck: "Höhere Drucktemperatur (Profil ca. 245 °C); bei mehr Hitze mehr Geruch, also lüften. Bambus Festigkeitswerte gelten nach Tempern (8 h bei 50 °C).",
        unsicher: "Die ca. 245 °C stammen aus dem Forum, nicht aus dem Datenblatt." },
      { id: "aero", name: "PLA Aero",
        was: "Aufschäumendes Leicht-PLA: Teile wiegen etwa halb so viel wie aus PLA Basic. RC-Flugzeuge, Segler, Drohnen.",
        druck: "Spezialprofil nötig: 220–260 °C (heißer = mehr Schaum), Flussrate 0,5–0,8, bis 180 mm/s, nur 0,4-mm-Düse. Sehr feuchteempfindlich (55 °C / 8 h trocknen). Bambu-Anleitung „Studio settings for RC models“ beachten." },
      { id: "cf", name: "PLA-CF", arten: ["cf", "pla-cf"], filter: ["faser"], p1s: "duese",
        was: "PLA mit Kohlefaser: steifer, matte Oberfläche, Schichtlinien kaum sichtbar, maßhaltig. Halterungen, Rahmen.",
        druck: "210–240 °C, bis 200–250 mm/s. Gehärtete Düse erforderlich; 0,4/0,6/0,8 mm, nicht 0,2 mm." },
      { id: "dynamic", name: "PLA Dynamic",
        was: "Bei Händlern gelistet (z. B. „White Orange“), Beschreibung allgemein; der Unterschied zu Basic ist unklar.",
        druck: "Händlerangabe: 190–220 °C.", unsicher: "Nicht in Bambu-Quellen bestätigt." },
      { id: "lite", name: "PLA Lite",
        was: "Günstige Spar-Linie von Bambu.", druck: "Wie PLA Basic.", unsicher: "Nur knapp beschrieben, Druckwerte nicht verifiziert." },
    ] },

  { id: "petg", name: "PETG", voll: "Polyethylenterephthalat-Glykol", farbe: "#5cc8ff", material: ["PETG"], p1s: "ok", filter: ["einsteiger", "outdoor"],
    kurz: "Zäher, leicht flexibler Allrounder zwischen PLA und ABS. Wasser- und recht witterungsbeständig, geringe Emissionen.",
    duese: "230–270 °C", dueseNotiz: "Wiki: 240–270 °C", bett: "60–80 °C", bettNotiz: "PETG HF: 65–75 °C",
    platte: "Textured PEI, Smooth PEI, Engineering", platteNotiz: "Cool Plate nicht empfohlen; auf glattem PEI Klebestift als Trennschicht (haftet sonst zu stark)",
    gehaeuse: "empfohlen", gehaeuseNotiz: "Nicht nötig, geschlossen empfohlen. Beim P1S ab Bett über 70 °C ggf. Deckel oder Tür öffnen (Wiki).",
    trocknen: "65–70 °C · 8 h", hygro: "mittel", gehaertet: "nein", gehaertetNotiz: "außer PETG-CF",
    anwendungen: "Funktionsteile, Outdoor-Teile (Blumentöpfe, Gießkannen), Gehäuse, mechanische Teile, Behälter",
    staerken: ["zäh und schlagfest", "gute Schichthaftung", "chemikalien- und wasserbeständig", "wärmebeständiger als PLA (ca. 70 °C)", "kaum Verzug"],
    schwaechen: ["Fädenziehen (Stringing)", "haftet manchmal zu stark auf glattem PEI", "weniger detailscharf", "kratzempfindlich"],
    sicherheit: "Geringe Emissionen, lüften.",
    lebensmittel: "PETG gilt als Rohstoff oft als lebensmittelgeeignet, Bambu gibt für seine PETG-Sorten aber keine Zertifizierung an. Druckteile sind wegen der Schichtrillen nicht lebensmittelsicher.",
    varianten: [
      { id: "basic", name: "PETG Basic", arten: ["basic"], filter: ["einsteiger", "outdoor"], was: "Standard-PETG.", druck: "240–270 °C, Standardprofil ca. 172 mm/s." },
      { id: "hf", name: "PETG HF", arten: ["hf", "high flow", "high speed", "rapid"], filter: ["einsteiger", "outdoor"],
        was: "Für schnelles Drucken (Profil ca. 258 mm/s, bis ca. 300 mm/s – etwa doppelt so schnell). Wasser-, UV- und temperaturbeständig; Bambu empfiehlt es für Outdoor-Teile.",
        druck: "230–260 °C, Bett 65–75 °C. Vor Drucken über 6 h trocknen (65 °C / 8 h). Alle Düsen.",
        unsicher: "„HF“ wird von Bambu nicht ausgeschrieben; „High Flow“ ist naheliegend." },
      { id: "translucent", name: "PETG Translucent", arten: ["translucent", "transparent", "klar"], filter: ["optik"],
        was: "Getönt durchsichtig bis klar (klarer als PLA Translucent). Lampen, Sichtfenster, Deko.",
        druck: "230–270 °C, bis 220 mm/s. Durchsicht hängt von Wandstärke, Füllung und Tempo ab." },
      { id: "cf", name: "PETG-CF", arten: ["cf", "petg-cf"], filter: ["faser"], p1s: "duese",
        was: "Mit Kohlefaser: steifer, matt, weniger Fädenziehen, maßhaltig.",
        druck: "240–270 °C. Gehärtete Düse nötig – laut Bambu-Wiki war eine Edelstahldüse nach 10 h PETG-CF sichtbar aufgeweitet. Nicht 0,2 mm." },
    ] },

  { id: "abs", name: "ABS", voll: "Acrylnitril-Butadien-Styrol", farbe: "#ff8a7a", material: ["ABS"], p1s: "ok", filter: ["hitze"],
    kurz: "Klassischer technischer Kunststoff (LEGO-Steine sind aus ABS). Wärmebeständig und zäh, verzieht aber gern und riecht beim Druck.",
    duese: "240–280 °C", bett: "90–100 °C", bettNotiz: "P1S schafft max. 100 °C – reicht",
    platte: "Textured PEI, Smooth PEI, Engineering", platteNotiz: "mit Kleber; Cool Plate nicht",
    gehaeuse: "ja", gehaeuseNotiz: "Tür und Deckel geschlossen lassen, Kammer vorheizen hilft.",
    trocknen: "80 °C · 8 h", trocknenNotiz: "Standard-Spulen halten meist nur ca. 70 °C – umspulen oder hitzefeste Spule", hygro: "niedrig–mittel", gehaertet: "nein", gehaertetNotiz: "außer ABS-GF",
    anwendungen: "Gehäuse, Teile im Auto-Innenraum, Funktionsteile, Teile zum Schleifen oder Aceton-Glätten",
    staerken: ["wärmebeständig (ca. 90–100 °C)", "schlagzäh", "gut nachzubearbeiten", "mit Aceton glättbar"],
    schwaechen: ["Verzug und Risse (Gehäuse nötig)", "Geruch und Emissionen (Styrol)", "nicht UV-beständig (vergilbt, versprödet)"],
    sicherheit: "Deutlicher Geruch, Styrol-Emissionen und viele ultrafeine Partikel: gut lüften, Aktivkohlefilter nutzen, nicht im Wohn- oder Schlafraum drucken, nach Druckende abkühlen lassen, bevor du öffnest.",
    lebensmittel: "Nicht für Lebensmittel, keine Zertifizierung bekannt.",
    varianten: [
      { id: "std", name: "ABS", arten: ["basic", "abs", ""], filter: ["hitze"], was: "Standard-ABS.", druck: "Werte wie oben." },
      { id: "gf", name: "ABS-GF", arten: ["gf", "abs-gf"], filter: ["hitze", "faser"], p1s: "duese",
        was: "Glasfaserverstärkt: steifer, maßhaltiger, weniger Verzug, matt. Gehäuse, Formen, Steckverbinder.",
        druck: "240–270 °C, Bett 80–100 °C, bis 180 mm/s. Gehärtete Düse, 0,6 mm empfohlen, nicht 0,2 mm." },
    ] },

  { id: "asa", name: "ASA", voll: "Acrylnitril-Styrol-Acrylat", farbe: "#ffb057", material: ["ASA"], p1s: "ok", filter: ["hitze", "outdoor"],
    kurz: "Das „Outdoor-ABS“: ähnlich wie ABS, aber sehr UV- und witterungsbeständig.",
    duese: "240–280 °C", bett: "90–100 °C", platte: "Textured PEI, Smooth PEI, Engineering", platteNotiz: "wie ABS, mit Kleber",
    gehaeuse: "ja", trocknen: "80 °C · 8 h", trocknenNotiz: "Spulengrenze (ca. 70 °C) beachten", hygro: "niedrig–mittel", gehaertet: "nein", gehaertetNotiz: "außer ASA-CF",
    anwendungen: "Outdoor-Teile (Garten, Halterungen an Auto und Fahrrad, Schilder, Hausnummern), Teile in der Sonne",
    staerken: ["UV- und witterungsbeständig", "wärmebeständig (ca. 95–100 °C)", "schlagzäh", "matte Oberfläche"],
    schwaechen: ["Verzug (Gehäuse nötig)", "Geruch und Emissionen wie ABS"],
    sicherheit: "Wie ABS: lüften, Aktivkohlefilter, nicht im Wohnraum.",
    lebensmittel: "Nicht für Lebensmittel.",
    varianten: [
      { id: "std", name: "ASA", arten: ["basic", "asa", ""], filter: ["hitze", "outdoor"], was: "Standard-ASA.", druck: "Werte wie oben." },
      { id: "aero", name: "ASA Aero", arten: ["aero"], filter: ["outdoor"],
        was: "Aufschäumendes Leicht-ASA (50–75 % der ASA-Dichte), UV- und wasserfest: leichte Outdoor-Teile, RC-Flugzeuge, Drohnen.",
        druck: "Spezialprofil: 240–280 °C, Flussrate ca. 0,45–0,80, Bett 80–90 °C, nur 0,4-mm-Düse. Engineering- oder High-Temp-Platte (Textured PEI nicht empfohlen). Gehäuse Pflicht, starker Geruch." },
      { id: "cf", name: "ASA-CF", arten: ["cf", "asa-cf"], filter: ["outdoor", "faser"], p1s: "duese",
        was: "Kohlefaser-ASA: steif, matt, für draußen.", druck: "Gehärtete Düse erforderlich, nicht 0,2 mm.",
        unsicher: "Nur in einer Händlerliste gefunden, Druckwerte nicht verifiziert." },
    ] },

  { id: "pc", name: "PC", voll: "Polycarbonat", farbe: "#9aa7ff", material: ["PC"], p1s: "bedingt", filter: ["hitze"],
    kurz: "Sehr fest, sehr schlagzäh und hitzebeständig (über 110 °C). Anspruchsvoll im Druck.",
    duese: "260–290 °C", dueseNotiz: "P1S max. 300 °C – am oberen Rand", bett: "100–120 °C", bettNotiz: "laut Wiki – der P1S schafft max. 100 °C, also untere Grenze",
    platte: "Smooth PEI, Textured PEI, Engineering", platteNotiz: "Klebestift ja, Liquid Glue laut Wiki nicht empfohlen",
    gehaeuse: "ja", trocknen: "80 °C · 8 h", trocknenNotiz: "Trocknen ist Pflicht", hygro: "hoch", gehaertet: "nein",
    p1sNotiz: "Laut Bambu „möglich“: Das Bett ist am Limit, Haftung und Verzug sind schwieriger. Bitte am eigenen Drucker ausprobieren.",
    anwendungen: "Stark belastete oder heiße Funktionsteile, Schutzgehäuse, Halterungen in Motornähe",
    staerken: ["höchste Schlagzähigkeit und Wärmebeständigkeit der Standard-Materialien", "teils durchsichtig"],
    schwaechen: ["Verzug", "sehr feuchteempfindlich", "hohe Temperaturen nötig", "Emissionen"],
    sicherheit: "Emissionen: lüften, Filter nutzen.", lebensmittel: "Nein.",
    varianten: [
      { id: "std", name: "PC", arten: ["basic", "pc", ""], filter: ["hitze"], was: "Standard-PC.", druck: "Werte wie oben." },
      { id: "fr", name: "PC FR", arten: ["fr"], filter: ["hitze"],
        was: "Flammhemmend nach UL 94 V-0. Elektronikgehäuse, Industrie- und Schutzteile.",
        druck: "260–280 °C, Bett 90–110 °C mit Klebestift (PVP), Smooth oder Textured PEI. Vorher trocknen (80 °C / 8 h). Am P1S gleiche Grenzen wie PC." },
    ] },

  { id: "tpu", name: "TPU", voll: "Thermoplastisches Polyurethan", farbe: "#c58bff", material: ["TPU"], p1s: "ok", filter: ["flexibel"],
    kurz: "Gummiartig elastisch. Die Härte wird in Shore A (weich) bzw. Shore D (härter) angegeben.",
    duese: "200–250 °C", bett: "30–45 °C", platte: "Textured PEI (ideal), Smooth PEI", platteNotiz: "Engineering bei 30–35 °C; Cool Plate nicht empfohlen",
    gehaeuse: "nein", gehaeuseNotiz: "Tür und Deckel öffnen bei Bett über 45 °C.",
    trocknen: "70 °C · 8 h", trocknenNotiz: "Trocknen ist Pflicht", hygro: "hoch", gehaertet: "nein",
    p1sNotiz: "Ohne AMS ideal: Weiche TPUs gehen ohnehin nur über die externe Spulenhalterung.",
    anwendungen: "Handyhüllen, Dichtungen, Puffer, Reifen, Schuhsohlen, Griffe, Scharniere",
    staerken: ["flexibel", "extrem zäh", "abriebfest", "dämpft Schläge"],
    schwaechen: ["langsam zu drucken", "Fädenziehen", "je weicher, desto schwieriger", "kann sich im Extruder stauchen"],
    sicherheit: "Geringe Emissionen.", lebensmittel: "Keine Zertifizierung bekannt.",
    varianten: [
      { id: "68d", name: "TPU for AMS (68D)", arten: ["68d", "for ams"], filter: ["einsteiger", "flexibel"],
        was: "Härte 68D: zäh und nur leicht flexibel, AMS-tauglich. Schutzteile, Halterungen mit etwas Nachgiebigkeit. Ein eigenes „TPU 68D“ gibt es nicht – das ist dieses Produkt.",
        druck: "220–240 °C, Bett 30–35 °C, vorher trocknen (70 °C / 8 h). 0,2 mm nicht unterstützt." },
      { id: "95a", name: "TPU 95A HF", arten: ["95a", "95a hf", "hf"], filter: ["flexibel"],
        was: "Klassisches, mittelweiches TPU als High-Flow-Version für schnelleren Druck. Hüllen, Dämpfer.",
        druck: "Nicht AMS-tauglich – am P1S ohne AMS über die externe Spule kein Problem." },
      { id: "90a", name: "TPU 90A", arten: ["90a"], filter: ["flexibel"],
        was: "Fester als 85A: Schuhsohlen, RC-Reifen, Funktionsteile.",
        druck: "200–250 °C, bis 200 mm/s. Standardprofil nicht verändern, Flussdynamik-Kalibrierung aus. 0,4/0,6/0,8 mm, nicht 0,2 mm." },
      { id: "85a", name: "TPU 85A", arten: ["85a"], filter: ["flexibel"],
        was: "Das weichste Bambu-TPU: Polster, Schutz, Fidget-Toys.",
        druck: "Wie 90A, aber nur mit 0,6- oder 0,8-mm-Düse (0,2 und 0,4 nicht unterstützt). Mit 0,6-mm-Düse am P1S gut." },
    ] },

  { id: "pa", name: "PA / Nylon", voll: "Polyamid, mit Kohle- oder Glasfaser", farbe: "#7fd4c1", material: ["PA", "PA-CF", "PAHT-CF", "PA6-CF", "PA6-GF", "NYLON", "PA12"], p1s: "duese", filter: ["hitze", "faser"],
    kurz: "Technischer Kunststoff: extrem zäh, verschleißfest, gleitfähig. Bambu verkauft Nylon nur faserverstärkt.",
    duese: "260–290 °C", dueseNotiz: "CF/GF bis 300 °C", bett: "80–100 °C", bettNotiz: "mit Klebestift; Wiki nennt 100–120 °C – am P1S (max. 100 °C) ausprobieren",
    platte: "Engineering, Smooth PEI, Textured PEI", platteNotiz: "Cool Plate nicht",
    gehaeuse: "ja", trocknen: "80 °C · 8–12 h", trocknenNotiz: "Pflicht; beim Drucken unter 20 % Luftfeuchte (Trockenbox mit Durchführung)", hygro: "sehr hoch", gehaertet: "ja", gehaertetNotiz: "für alle CF/GF-Sorten, 0,6 mm empfohlen",
    p1sNotiz: "Faserverstärkte Sorten erst nach Umrüstung auf gehärteten Extruder und gehärtetes Hotend. Unverstärktes PA (Fremdhersteller) ist laut Bambu „möglich“.",
    anwendungen: "Zahnräder, Lager, Scharniere, Vorrichtungen, Werkzeughalter, Kfz-Teile",
    staerken: ["sehr zäh und fest", "verschleißfest", "wärmebeständig (PAHT-CF bis ca. 194 °C)"],
    schwaechen: ["extrem hygroskopisch (verliert feucht an Festigkeit)", "Verzug", "teuer"],
    sicherheit: "Emissionen beim Druck; Faserstaub beim Schleifen nicht einatmen.", lebensmittel: "Nein.",
    varianten: [
      { id: "paht", name: "PAHT-CF", arten: ["paht-cf", "paht"], filter: ["hitze", "faser"],
        was: "Hochtemperatur-Nylon mit Kohlefaser, nimmt relativ wenig Feuchte auf, hohe Zugfestigkeit. Vorrichtungen, Spritzgussformen, Prototypen. Für offene Drucker ungeeignet.",
        druck: "260–290 °C, bis 100 mm/s. Gehärtete Düse, 0,6 mm empfohlen." },
      { id: "pa6cf", name: "PA6-CF", arten: ["pa6-cf", "cf"], filter: ["hitze", "faser"],
        was: "Sehr steif, fest und hitzebeständig – aber nur für trockene Umgebung (wird feucht weicher).",
        druck: "260–290 °C, Bett 80–100 °C, bis 100 mm/s. Stützen innerhalb von 2 h entfernen. Gehärtete Düse, 0,6 mm empfohlen." },
      { id: "pa6gf", name: "PA6-GF", arten: ["pa6-gf", "gf"], filter: ["hitze", "faser"],
        was: "Mit Glasfaser: maßhaltig, hitze- und chemikalienbeständig, etwas zäher als CF.",
        druck: "Gehärtete Düse, nicht 0,2 mm." },
      { id: "pa", name: "PA unverstärkt", arten: ["pa", "nylon", "pa12"], p1s: "bedingt", filter: ["hitze"],
        was: "Reines Nylon gibt es nur von Fremdherstellern. Zäh und gleitfähig, aber sehr feuchteempfindlich.",
        druck: "Edelstahldüse reicht. Trocken drucken, Klebestift, Gehäuse geschlossen.",
        unsicher: "Werte allgemein, nicht aus Bambu-Quellen." },
    ] },

  { id: "petcf", name: "PET-CF", voll: "PET mit Kohlefaser", farbe: "#6fa8dc", material: ["PET-CF"], p1s: "duese", filter: ["hitze", "faser"],
    kurz: "PET (nicht PETG) mit Kohlefaser: nimmt sehr wenig Feuchte auf, maßhaltig und hitzebeständig – das „bessere Nylon“ für feuchte Umgebung.",
    duese: "260–290 °C", bett: "80–100 °C", bettNotiz: "mit Klebestift", platte: "Engineering, Smooth PEI, Textured PEI",
    gehaeuse: "empfohlen", gehaeuseNotiz: "Offen möglich, aber schlechtere Schichthaftung.",
    trocknen: "80 °C · 8–12 h", trocknenNotiz: "Spule max. 90 °C", hygro: "niedrig", gehaertet: "ja", gehaertetNotiz: "0,6 mm empfohlen",
    anwendungen: "Tragende Teile in heißer oder feuchter Umgebung, Kfz-Zubehör, Vorrichtungen",
    staerken: ["kaum Feuchteaufnahme", "maßhaltig", "hitzebeständig", "steif"], schwaechen: ["abrasiv (gehärtete Düse)", "teuer"],
    sicherheit: "Lüften; Faserstaub beim Schleifen vermeiden.", lebensmittel: "Nein.", varianten: [] },

  { id: "ppacf", name: "PPA-CF", voll: "Polyphthalamid mit Kohlefaser", farbe: "#8fb3a6", material: ["PPA-CF", "PPA"], p1s: "nein", filter: ["hitze", "faser"],
    kurz: "Hochleistungs-Polyamid mit Kohlefaser: sehr steif, hitze-, chemikalien- und feuchtebeständig.",
    duese: "280–310 °C", dueseNotiz: "P1S max. 300 °C", bett: "100–120 °C", bettNotiz: "P1S max. 100 °C", platte: "Engineering, Smooth PEI (Klebestift)",
    gehaeuse: "ja", trocknen: "100–140 °C · 8–12 h", trocknenNotiz: "nur mit hitzefester Spule (max. 160 °C)", hygro: "hoch", gehaertet: "ja",
    p1sNotiz: "Bambu listet den P1S als kompatibel, aber Düse (max. 300 °C) und Bett (max. 100 °C) liegen am bzw. unter dem unteren Rand – für den Hobbydruck nicht empfohlen.",
    anwendungen: "Industrie- und Kfz-Teile, Propeller, Teile für feuchte oder heiße Umgebung",
    staerken: ["sehr steif", "hitze- und chemikalienbeständig", "feuchtebeständig"], schwaechen: ["braucht Profi-Drucker", "bis 100 mm/s", "teuer"],
    sicherheit: "Emissionen, Faserstaub.", lebensmittel: "Nein.", varianten: [] },

  { id: "ppscf", name: "PPS-CF", voll: "Polyphenylensulfid mit Kohlefaser", farbe: "#a0a0b8", material: ["PPS-CF", "PPS"], p1s: "nein", filter: ["hitze", "faser"],
    kurz: "Industrie-Hochleistungskunststoff: flammhemmend (UL 94 V-0), über 200 °C einsetzbar, chemikalienbeständig.",
    duese: "310–340 °C", bett: "100–120 °C", platte: "Engineering", gehaeuse: "ja", gehaeuseNotiz: "plus beheizte Kammer 60–90 °C",
    trocknen: "100–140 °C · 8–12 h", hygro: "–", gehaertet: "ja",
    p1sNotiz: "Laut Bambu nur für X1E, H2D und H2S. Der P1S erreicht weder die Düsen- noch die Kammertemperatur.",
    anwendungen: "Industrieteile mit Flammschutz und hoher Dauertemperatur",
    staerken: ["flammhemmend", "über 200 °C einsetzbar", "chemikalienbeständig"], schwaechen: ["nur für Profi-Drucker mit Kammerheizung"],
    sicherheit: "Emissionen, Faserstaub.", lebensmittel: "Nein.", varianten: [] },

  { id: "stuetz", name: "Stützmaterial", voll: "Support-Filamente von Bambu", farbe: "#d8d8d8", material: ["PVA", "SUPPORT", "SUPPORT FOR PLA", "SUPPORT FOR PLA/PETG", "SUPPORT FOR ABS", "SUPPORT FOR PA/PET"], p1s: "bedingt", filter: ["stuetz"],
    kurz: "Spezielle Filamente nur für die Kontaktfläche zwischen Stütze und Teil: lassen sich leicht abziehen oder in Wasser auflösen.",
    duese: "190–250 °C", dueseNotiz: "je nach Sorte (Support for PA/PET 260–300 °C)", bett: "wie das Modellmaterial",
    platte: "wie das Modellmaterial", gehaeuse: "je nach Material", trocknen: "je nach Sorte", trocknenNotiz: "PVA 80 °C / 12 h", hygro: "bis sehr hoch (PVA)", gehaertet: "nein", gehaertetNotiz: "Support for PA/PET: gehärtete Düse empfohlen",
    p1sNotiz: "Ohne AMS druckt der P1S nur ein Material. Stützmaterial geht nur mit manuellem Filamentwechsel (Bambu Studio: „Pause/Farbwechsel auf Schicht“) – lohnt sich nur bei wenigen Interface-Lagen. Alternative: Stützen aus demselben Material mit gut eingestelltem Z-Abstand.",
    anwendungen: "Saubere Unterseiten bei Überhängen, komplexe Innengeometrien",
    staerken: ["glatte Unterseiten", "werkzeugfrei zu entfernen", "PVA: wasserlöslich"], schwaechen: ["ohne AMS umständlich", "PVA sehr feuchteempfindlich"],
    sicherheit: "Wie das jeweilige Modellmaterial.", lebensmittel: "Nein.",
    varianten: [
      { id: "plapetg", name: "Support for PLA/PETG", arten: ["for pla/petg", "pla/petg"], filter: ["stuetz"],
        was: "Haftet nur schwach am Bauteil und lässt sich werkzeugfrei abziehen – glatte Unterseite. Nur als Support- bzw. Interface-Schicht, nicht für Modelle. Nicht mit PA-CF, PET-CF, ABS, TPU oder ASA.",
        druck: "190–240 °C. Im Slicer unter „Support/Raft Interface“ wählen, nicht als Basis für Baumstützen; Z-Abstand 0." },
      { id: "pla", name: "Support for PLA", arten: ["for pla"], filter: ["stuetz"],
        was: "Wie oben, nur für PLA.", druck: "Wie Support for PLA/PETG.", unsicher: "Eine „New Version“ ist bei Händlern gelistet; der Unterschied ist nicht verifiziert." },
      { id: "pva", name: "PVA", arten: ["pva"], filter: ["stuetz"],
        was: "Wasserlöslich (warmes Wasser bis 50 °C bei PLA) – für komplexe Innengeometrien. Passt zu PLA, PETG, PLA-CF und PETG-CF.",
        druck: "220–250 °C. Sehr hygroskopisch: 80 °C / 12 h trocknen (Spulengrenze beachten), unter 20 % Luftfeuchte verarbeiten. Normale Stützen statt Baumstützen." },
      { id: "abs", name: "Support for ABS", arten: ["for abs"], filter: ["stuetz"],
        was: "Leicht abtrennbar, gute Interface-Qualität für ABS (und ASA).", druck: "Gehäuse nötig." },
      { id: "papet", name: "Support for PA/PET", arten: ["for pa/pet"], filter: ["stuetz"], p1s: "duese",
        was: "Von Hand entfernbar, für PAHT-CF, PA6-CF, PET-CF und PA6-GF.", druck: "260–300 °C, trocknen, gehärtete Düse empfohlen (Wiki)." },
    ] },

  // Gängige Materialien anderer Hersteller (Werte allgemein, nicht aus Bambu-Quellen)
  { id: "hips", name: "HIPS", voll: "Schlagzähes Polystyrol", fremd: true, farbe: "#e0c27a", material: ["HIPS"], p1s: "bedingt", filter: ["stuetz", "hitze"],
    kurz: "Schlagzähes Polystyrol, in Limonen löslich – klassisches Stützmaterial für ABS. Druckt ähnlich wie ABS.",
    duese: "230–250 °C", bett: "90–100 °C", platte: "Textured oder Smooth PEI", gehaeuse: "ja", trocknen: "ca. 60 °C · 4–6 h", hygro: "niedrig", gehaertet: "nein",
    anwendungen: "Stützen für ABS (in Limonen auflösen), leichte Gehäuse, Modellbau",
    staerken: ["druckt wie ABS", "leicht", "in Limonen löslich"], schwaechen: ["Verzug", "Styrol-Emissionen"],
    sicherheit: "Styrol-Emissionen: lüften.", lebensmittel: "Nein.", varianten: [] },
  { id: "pp", name: "PP", voll: "Polypropylen", fremd: true, farbe: "#b9d97a", material: ["PP"], p1s: "bedingt", filter: [],
    kurz: "Leicht und chemikalienbeständig, ideal für Filmscharniere. Haftet auf fast nichts außer PP-Klebeband oder Spezialplatten und verzieht stark.",
    duese: "220–250 °C", bett: "80–100 °C", platte: "PP-Klebeband oder Spezialplatte", gehaeuse: "empfohlen", trocknen: "ca. 60 °C · 6 h", hygro: "sehr niedrig", gehaertet: "nein",
    p1sNotiz: "Schwierig: braucht einen speziellen Haftuntergrund.",
    anwendungen: "Filmscharniere, Behälter für Chemikalien, leichte Teile",
    staerken: ["leicht", "chemikalienbeständig", "biegefest (Filmscharniere)"], schwaechen: ["schlechte Betthaftung", "starker Verzug"],
    sicherheit: "Lüften.", lebensmittel: "Druckteile nicht lebensmittelsicher.", varianten: [] },
  { id: "pvb", name: "PVB", voll: "Polyvinylbutyral (z. B. „Polysmooth“)", fremd: true, farbe: "#a4c8f0", material: ["PVB"], p1s: "ok", filter: ["optik", "einsteiger"],
    kurz: "Druckt ähnlich wie PLA und lässt sich mit Isopropanol glatt polieren – für glänzende, fast durchsichtige Oberflächen.",
    duese: "190–220 °C", bett: "50–70 °C", platte: "Textured oder Smooth PEI", gehaeuse: "nein", trocknen: "ca. 50 °C · 6 h", hygro: "mittel", gehaertet: "nein",
    anwendungen: "Vasen, Lampenschirme, Schaustücke mit glatter Oberfläche",
    staerken: ["druckt wie PLA", "mit Isopropanol glättbar"], schwaechen: ["teurer als PLA", "Glätten braucht Übung"],
    sicherheit: "Beim Glätten mit Isopropanol: lüften, keine offene Flamme.", lebensmittel: "Nein.", varianten: [] },
  { id: "pctg", name: "PCTG / CPE", voll: "Verwandte von PETG", fremd: true, farbe: "#7cc6e8", material: ["PCTG", "CPE"], p1s: "ok", filter: ["outdoor"],
    kurz: "PETG-Verwandte: zäher bzw. klarer als PETG, drucken ähnlich.",
    duese: "240–270 °C", bett: "70–80 °C", platte: "Textured PEI", platteNotiz: "auf glattem PEI Kleber als Trennschicht", gehaeuse: "nein", trocknen: "ca. 65 °C · 6 h", hygro: "mittel", gehaertet: "nein",
    anwendungen: "Funktionsteile, klare Abdeckungen, Outdoor-Teile",
    staerken: ["sehr zäh", "klar", "chemikalienbeständig"], schwaechen: ["Fädenziehen wie PETG"],
    sicherheit: "Geringe Emissionen, lüften.", lebensmittel: "Druckteile nicht lebensmittelsicher.", varianten: [] },
  { id: "peek", name: "PEEK / PEKK / PEI", voll: "Hochleistungskunststoffe (PEI = Ultem)", fremd: true, farbe: "#c9a46c", material: ["PEEK", "PEKK", "PEI", "ULTEM"], p1s: "nein", filter: ["hitze"],
    kurz: "Hochleistungskunststoffe für Luftfahrt und Medizintechnik: extrem hitze- und chemikalienbeständig.",
    duese: "360–450 °C", bett: "120–160 °C", platte: "Spezialplatten", gehaeuse: "ja", gehaeuseNotiz: "plus Kammer 70–150 °C", trocknen: "120–150 °C", hygro: "mittel", gehaertet: "ja",
    p1sNotiz: "Nicht geeignet: P1S max. 300 °C an der Düse, keine aktive Kammerheizung.",
    anwendungen: "Industrie, Luftfahrt, Medizintechnik",
    staerken: ["extrem hitzebeständig", "chemikalienbeständig"], schwaechen: ["braucht Industriedrucker", "sehr teuer"],
    sicherheit: "Nur auf Industrieanlagen.", lebensmittel: "Nein.", varianten: [] },
  { id: "metall", name: "Metall- & Keramik-Filamente", voll: "Bronze-, Kupfer-, Stahl-Fill, Sinter-Filamente", fremd: true, farbe: "#c08a5a", material: ["METALL", "BRONZE", "KUPFER", "COPPER"], p1s: "duese", filter: ["optik", "faser"],
    kurz: "PLA oder Binder mit echtem Metall- bzw. Keramikpulver. Schwer, kalt anzufassen, polierbar – oder zum Sintern im Ofen.",
    duese: "195–220 °C", dueseNotiz: "bei Metall-PLA, je nach Hersteller", bett: "50–60 °C", platte: "Textured PEI", gehaeuse: "nein", trocknen: "wie PLA", hygro: "niedrig–mittel", gehaertet: "ja",
    p1sNotiz: "Stark abrasiv: ohne gehärtete Düse nicht geeignet.",
    anwendungen: "Schmuck, Figuren mit Metallgefühl, Sinterteile",
    staerken: ["echte Metalloptik und Gewicht", "polierbar"], schwaechen: ["stark abrasiv", "spröde", "teuer"],
    sicherheit: "Beim Schleifen und Polieren Staubschutz.", lebensmittel: "Nein.", varianten: [] },
];

// ---- Fehlercodes (HMS) für den P1S ---------------------------------------------
// Meldungen aus Bambus offizieller HMS-Texttabelle (englisch), Zuordnung zur X1-/P1-Serie über die
// Bambu-Wiki-Seiten je Code; Kurzcodes (z. B. 0300-8004) sind Druckfehler-Meldungen derselben Tabelle.
// Text sinngemäß übersetzt, „Was tun“ kurz zusammengefasst.
const CD_WIKI = "https://wiki.bambulab.com/en/hms/home";
const CD_GRUPPEN = [
  { id: "bett", name: "Heizbett", icon: "🟫", codes: [
    { c: "0300-0100-0001-0003", t: "Heizbett-Temperatur auffällig: Die Heizung ist überhitzt.", tun: "Drucker ausschalten und abkühlen lassen. Tritt es wieder auf: Heizbett-Kabel prüfen, Support kontaktieren." },
    { c: "0300-0100-0001-0006", t: "Heizbett-Temperatur auffällig: Der Temperaturfühler hat womöglich einen Kurzschluss.", tun: "Ausschalten, Stecker und Kabel des Heizbetts prüfen (Kabel bricht gern an der Biegestelle)." },
    { c: "0300-0100-0001-0007", t: "Heizbett-Temperatur auffällig: Der Temperaturfühler hat womöglich eine Unterbrechung.", tun: "Ausschalten, Heizbett-Stecker fest einstecken, Kabel auf Bruch prüfen." },
    { c: "0300-0100-0001-000A", t: "Temperaturregelung des Heizbetts gestört, die AC-Platine ist evtl. defekt.", tun: "Neu starten. Bleibt die Meldung, laut Wiki AC-Platine prüfen bzw. tauschen lassen." },
    { c: "0300-0100-0003-0008", t: "Die Betttemperatur liegt über dem Grenzwert und wird automatisch auf die Grenze gesetzt.", tun: "Nur ein Hinweis: Der P1S schafft max. 100 °C. Im Filamentprofil die Betttemperatur senken." },
    { c: "0300-0D00-0001-0003", auch: "bis …-000A", t: "Die Druckplatte liegt nicht richtig. Bitte ausrichten.", tun: "Platte abnehmen, Bett und Plattenunterseite von Krümeln befreien, an den hinteren Stiften anlegen und neu starten." },
    { c: "0300-0D00-0002-0003", auch: "bis …-000A", t: "Die Druckplatte liegt möglicherweise nicht richtig.", tun: "Platte prüfen und neu auflegen. Kommt die Meldung oft, Bett auf Fremdkörper und Wölbung prüfen." },
    { c: "0300-0D00-0002-0001", t: "Referenzfahrt des Betts auffällig: Beule auf dem Bett oder Düsenspitze nicht sauber.", tun: "Düsenspitze bei Drucktemperatur von Filamentresten befreien, Platte auf Beulen und Reste prüfen." },
    { c: "0300-0D00-0001-000C", t: "Die Daten der Bettnivellierung sind auffällig.", tun: "Fremdkörper auf dem Bett und an den Z-Schlitten entfernen, dann Nivellierung neu starten." },
    { c: "0300-0A00-0001-0001", auch: "Sensor 2: 0300-0B00…, Sensor 3: 0300-0C00…", t: "Kraftsensor 1 im Heizbett ist zu empfindlich – klemmt evtl. zwischen Dehnungsarm und Bettträger, oder die Einstellschraube ist zu fest.", tun: "Z-Schlitten und Z-Riemenräder auf Fremdkörper prüfen, Bett frei beweglich? Sonst Support-Ticket mit Foto/Video." },
    { c: "0300-0A00-0001-0002", auch: "auch …-0003, Sensor 2/3: 0B00/0C00", t: "Das Signal von Kraftsensor 1 ist schwach – Sensor defekt oder schlechter Kontakt.", tun: "Ausschalten, Sensorkabel unter dem Bett prüfen und fest einstecken." },
    { c: "0300-0A00-0001-0004", auch: "Sensor 2/3: 0B00/0C00", t: "Störung an Kraftsensor 1: Die Bettplatte hat etwas außerhalb des Betts berührt.", tun: "Prüfen, ob Kabel, Reste oder Gegenstände das Bett berühren; Bett freiräumen." },
    { c: "0300-0A00-0001-0005", auch: "Sensor 2/3: 0B00/0C00", t: "Kraftsensor 1 misst eine unerwartete Dauerkraft – das Bett klemmt evtl.", tun: "Bett von Hand auf Leichtgängigkeit prüfen, Fremdkörper entfernen, neu starten." },
  ] },
  { id: "hotend", name: "Hotend / Düse", icon: "🔥", codes: [
    { c: "0300-0200-0001-0001", t: "Düsentemperatur auffällig: Die Heizung hat womöglich einen Kurzschluss.", tun: "Ausschalten. Heizpatrone und Kabel am Hotend prüfen, ggf. Hotend tauschen." },
    { c: "0300-0200-0001-0002", t: "Düsentemperatur auffällig: Die Heizung hat womöglich eine Unterbrechung.", tun: "Ausschalten, Hotend-Stecker am Druckkopf fest einstecken, Kabel prüfen." },
    { c: "0300-0200-0001-0003", t: "Düsentemperatur auffällig: Die Heizung ist überhitzt.", tun: "Sofort ausschalten und abkühlen lassen. Kommt es wieder, Support kontaktieren." },
    { c: "0300-0200-0001-0006", t: "Düsentemperatur auffällig: Der Temperaturfühler hat womöglich einen Kurzschluss.", tun: "Ausschalten, Stecker des Thermistors am Druckkopf prüfen und fest einstecken." },
    { c: "0300-0200-0001-0007", t: "Düsentemperatur auffällig: Der Temperaturfühler hat womöglich eine Unterbrechung.", tun: "Ausschalten, Thermistor-Kabel prüfen; bei Bruch Hotend bzw. Fühler tauschen." },
    { c: "0300-4006", kurz: true, t: "Die Düse ist verstopft.", tun: "Kaltzug (Cold Pull) machen oder Düse mit Nadel reinigen. Bei PLA: Deckel/Tür auf, damit kein Hitzestau entsteht." },
    { c: "0300-1200-0002-0001", t: "Die Frontabdeckung des Druckkopfs ist abgefallen.", tun: "Abdeckung wieder aufstecken (Magnete). Prüfen, ob der Druck noch sauber läuft." },
  ] },
  { id: "motoren", name: "Motoren / Achsen", icon: "⚙️", codes: [
    { c: "0300-0600-0001-0001", auch: "Motor B: 0300-0700…, Motor Z: 0300-0800…", t: "Motor A hat eine Unterbrechung – Kabel locker oder Motor defekt.", tun: "Ausschalten, Motorkabel prüfen und fest einstecken. Bleibt es, Motor tauschen." },
    { c: "0300-0600-0001-0002", auch: "Motor B/Z: 0700/0800", t: "Motor A hat einen Kurzschluss, ist evtl. defekt.", tun: "Ausschalten, Kabel auf Scheuerstellen prüfen, sonst Motor tauschen." },
    { c: "0300-0600-0001-0003", auch: "Motor B/Z: 0700/0800", t: "Der Widerstand von Motor A ist auffällig, der Motor ist evtl. defekt.", tun: "Neu starten; bleibt die Meldung, Support kontaktieren." },
    { c: "0300-1300-0001-0001", auch: "Motor B: 1400, Motor Z: 1500", t: "Der Stromsensor von Motor A ist auffällig (Messschaltung).", tun: "Neu starten. Bleibt es, ist meist die Hauptplatine betroffen – Support." },
    { c: "0300-0D00-0001-000B", t: "Der Z-Motor scheint beim Fahren zu klemmen.", tun: "Z-Schlitten und Z-Riemenräder auf Fremdkörper prüfen, nichts unter dem Bett eingeklemmt?" },
    { c: "0300-1000-0002-0001", t: "Die Resonanzfrequenz der X-Achse ist niedrig – der Riemen ist evtl. locker.", tun: "Riemenspannung prüfen bzw. nachspannen (Wiki-Anleitung), dann Kalibrierung." },
    { c: "0300-1100-0002-0001", t: "Die Resonanzfrequenz der Y-Achse ist niedrig – der Riemen ist evtl. locker.", tun: "Y-Riemen prüfen und spannen, danach Kalibrierung." },
    { c: "0300-1000-0002-0002", auch: "Y-Achse: 0300-1100-0002-0002", t: "Die Resonanzfrequenz der X-Achse weicht stark von der letzten Kalibrierung ab.", tun: "Carbonstange bzw. Führungsstange reinigen, dann Kalibrierung wiederholen." },
    { c: "0300-0F00-0001-0001", t: "Auffällige Daten vom Beschleunigungssensor.", tun: "Drucker neu starten." },
    { c: "0300-4000", kurz: true, t: "Referenzfahrt der Z-Achse fehlgeschlagen, der Druck wurde gestoppt.", tun: "Bett und Düse von Resten befreien, nichts unter dem Bett? Dann neu starten." },
    { c: "0300-4009", kurz: true, t: "Referenzfahrt der X/Y-Achse fehlgeschlagen.", tun: "Prüfen, ob der Druckkopf frei fährt (Fremdkörper, Kabel), Stangen reinigen, neu starten." },
    { c: "0300-400E", kurz: true, t: "Der Motor-Selbsttest ist fehlgeschlagen.", tun: "Neu starten; bleibt es, Motorkabel prüfen." },
  ] },
  { id: "extruder", name: "Extruder / Filament", icon: "🧵", codes: [
    { c: "0300-8004", kurz: true, t: "Filament ist aufgebraucht. Bitte neues laden.", tun: "Neue Rolle einlegen und laden, dann „Fortsetzen“. Ohne AMS: externe Spule tauschen." },
    { c: "0300-800D", kurz: true, t: "Der Extruder fördert nicht normal.", tun: "Druck ansehen; ist es vertretbar, fortsetzen. Sonst Filament (feucht? verknotet?) und Düse prüfen." },
    { c: "0300-1600-0001-0001", t: "Der Stromsensor des Extrudermotors ist auffällig (Messschaltung).", tun: "Neu starten; bleibt es, Support kontaktieren." },
    { c: "0500-0400-0002-0007", t: "Die Betttemperatur liegt über der Glasübergangstemperatur des Filaments – die Düse kann verstopfen. Tür offen lassen.", tun: "Typisch bei PLA mit heißem Bett: Tür öffnen bzw. Glasdeckel abnehmen, Betttemperatur senken." },
  ] },
  { id: "luefter", name: "Lüfter", icon: "🌀", codes: [
    { c: "0300-0300-0001-0001", t: "Der Hotend-Lüfter dreht zu langsam oder steht – evtl. blockiert oder Stecker nicht richtig drin.", tun: "Ausschalten, Lüfter auf Fäden und Reste prüfen, Stecker fest einstecken, ggf. Lüfter tauschen." },
    { c: "0300-0300-0002-0002", t: "Der Hotend-Lüfter läuft langsam, evtl. behindert.", tun: "Lüfter von Staub und Filamentresten befreien." },
    { c: "0300-0400-0002-0001", t: "Der Bauteillüfter dreht zu langsam oder steht – evtl. blockiert oder Stecker locker.", tun: "Frontabdeckung abnehmen, Lüfter reinigen, Stecker prüfen." },
    { c: "0300-4005", kurz: true, t: "Die Drehzahl des Hotend-Lüfters ist auffällig.", tun: "Wie oben: Lüfter reinigen und Stecker prüfen." },
  ] },
  { id: "kamera", name: "Kamera / KI-Erkennung", icon: "📷", codes: [
    { c: "0C00-0300-0003-0008", t: "Mögliches Spaghetti-Problem erkannt. Bitte Druck ansehen und entscheiden, ob er abgebrochen wird.", tun: "Druck prüfen. Vorbeugen: Platte reinigen (Spülmittel), Filament trocknen, ggf. Kleber." },
    { c: "0300-8003", kurz: true, t: "Die KI-Drucküberwachung hat Spaghetti erkannt (Druck pausiert).", tun: "Druck ansehen, bei Bedarf abbrechen; Platte reinigen und Filament trocknen." },
    { c: "0C00-0300-0003-0006", t: "Ausgeworfenes Filament hat sich evtl. im Abfallschacht gestaut.", tun: "Abfallschacht hinten am Drucker leeren." },
    { c: "0C00-0100-0002-0008", t: "Kein Bild von der Live-Kamera – Spaghetti- und Schacht-Erkennung sind gerade nicht verfügbar.", tun: "Drucker neu starten; Kamerakabel prüfen." },
    { c: "0500-0100-0002-0002", t: "Die Live-Kamera ist nicht verbunden.", tun: "Ausschalten, Kamerakabel an Kamera und Platine prüfen." },
    { c: "0500-0100-0002-0001", t: "Die Medien-Verarbeitung (Kamerabild) ist gestört.", tun: "Neu starten; hilft das mehrfach nicht, Support kontaktieren." },
    { c: "0500-0200-0002-0006", t: "Fehler bei der Video-Übertragung (Streaming).", tun: "Netzwerk prüfen, neu starten bzw. Firmware aktualisieren." },
  ] },
  { id: "system", name: "Steuerung / System", icon: "🧠", codes: [
    { c: "0500-0300-0001-0001", t: "Das MC-Modul (Bewegungssteuerung) ist gestört.", tun: "Neu starten, Kabelverbindungen zur Hauptplatine prüfen." },
    { c: "0500-0300-0001-0002", t: "Der Druckkopf ist gestört.", tun: "Neu starten; Druckkopfkabel prüfen." },
    { c: "0500-0300-0001-000A", t: "Systemzustand auffällig – bitte auf Werkseinstellungen zurücksetzen.", tun: "Vorher Druckaufträge sichern, dann am Display zurücksetzen." },
    { c: "0500-0300-0001-000B", t: "Das Display ist gestört.", tun: "Drucker neu starten." },
    { c: "0300-4100-0001-0001", t: "Die Systemspannung ist instabil – der Stromausfallschutz wurde ausgelöst.", tun: "Steckdose, Mehrfachstecker und Kabel prüfen; Drucker möglichst direkt anschließen." },
    { c: "0300-4000-0002-0001", t: "Datenübertragung über die serielle Schnittstelle gestört – evtl. Softwarefehler.", tun: "Neu starten, Firmware aktualisieren." },
    { c: "0500-0400-0001-0006", t: "Der vorherige Druck konnte nicht fortgesetzt werden.", tun: "Druck neu starten; nach Stromausfall Teil prüfen." },
    { c: "0500-0500-0001-0007", t: "MQTT-Befehl konnte nicht überprüft werden.", tun: "Bambu Studio (inkl. Netzwerk-Plugin) bzw. Bambu Handy aktualisieren und neu starten. Betrifft auch Home-Assistant-Steuerung." },
  ] },
  { id: "netz", name: "Speicherkarte / Netzwerk", icon: "📶", codes: [
    { c: "0500-0100-0003-0004", t: "Nicht genug Platz auf der microSD-Karte – keine Video- und Zeitraffer-Aufnahme möglich.", tun: "Alte Zeitraffer und Druckdateien von der Karte löschen." },
    { c: "0500-0100-0003-0005", t: "Die microSD-Karte ist schreibgeschützt – keine Video- und Zeitraffer-Aufnahme.", tun: "Karte am PC prüfen bzw. formatieren (FAT32), sonst ersetzen." },
    { c: "0500-0100-0003-0006", t: "microSD-Karte nicht formatiert.", tun: "Am Drucker formatieren (Daten gehen verloren)." },
    { c: "0500-C011", kurz: true, t: "Die Leistung der SD-Karte hat nachgelassen – Druck, Protokolle und Videos können leiden.", tun: "Karte formatieren; hilft das nicht, neue Karte einsetzen." },
    { c: "0500-400C", kurz: true, t: "Bitte microSD-Karte einstecken und den Druck neu starten.", tun: "Karte einstecken – ohne Karte druckt der P1S nicht aus der Cloud oder vom PC." },
    { c: "0500-0200-0002-0001", auch: "auch …-0003, …-0005", t: "Verbindung zum Internet fehlgeschlagen.", tun: "WLAN am Drucker prüfen, Router-Abstand verringern, ggf. neu verbinden." },
    { c: "0500-0200-0002-0002", t: "Anmeldung des Geräts fehlgeschlagen – Kontodaten prüfen.", tun: "In Bambu Handy/Studio ab- und wieder anmelden, Drucker ggf. neu binden." },
    { c: "0500-0200-0002-0004", t: "Unberechtigter Benutzer – Kontodaten prüfen.", tun: "Mit dem Konto anmelden, an das der Drucker gebunden ist." },
    { c: "0500-0200-0002-0008", t: "Zeitsynchronisation fehlgeschlagen.", tun: "Internetzugang prüfen (Zeitserver erreichbar?), neu starten." },
    { c: "0500-0300-0002-000C", t: "WLAN-Hardwarefehler.", tun: "WLAN am Drucker aus- und wieder einschalten oder neu starten." },
    { c: "0500-0400-0001-0001", t: "Druckauftrag konnte nicht heruntergeladen werden.", tun: "Netzwerk prüfen und Auftrag erneut senden." },
    { c: "0500-0400-0001-0002", t: "Druckstatus konnte nicht gemeldet werden.", tun: "Netzwerk prüfen; der Druck läuft meist trotzdem weiter." },
    { c: "0500-0400-0001-0003", t: "Inhalt der Druckdatei ist nicht lesbar.", tun: "Neu slicen und erneut senden." },
    { c: "0500-0400-0001-0004", t: "Die Druckdatei ist nicht autorisiert.", tun: "Datei aus Bambu Studio mit dem gebundenen Konto senden." },
    { c: "0500-4037", kurz: true, t: "Die geslicte Datei passt nicht zum Druckermodell.", tun: "In Bambu Studio „Bambu Lab P1S“ als Drucker wählen und neu slicen." },
    { c: "0500-4038", kurz: true, t: "Der Düsendurchmesser in der Datei passt nicht zur eingestellten Düse.", tun: "Im Slicer die richtige Düse (z. B. 0,4 mm) wählen oder am Drucker die Düseneinstellung anpassen." },
  ] },
];

const KunststoffAnsicht = {
  _ksZustand() {
    if (!this._ks) this._ks = { filter: "", q: "", auf: {}, cdQ: "", cdAuf: {} };
    return this._ks;
  },

  // ---- Kunststoffe ---------------------------------------------------------
  // P1S-Ampel einer Variante (erbt vom Material)
  _ksP1s(m, v) { return (v && v.p1s) || m.p1s; },
  _ksPasst(m, v, f) {
    if (f === "p1s") return this._ksP1s(m, v) === "ok";
    return ((v ? v.filter : m.filter) || []).includes(f);
  },
  _ksTextPasst(m, v, q) {
    const t = (v ? [v.name, v.was, v.druck] : [m.name, m.voll, m.kurz, m.anwendungen, (m.staerken || []).join(" ")]).join(" ").toLowerCase();
    return t.includes(q);
  },
  // Was nach Filter und Suche zu sehen ist: Material plus die passenden Varianten
  _ksAuswahl() {
    const k = this._ksZustand(), q = k.q.trim().toLowerCase();
    return KUNSTSTOFFE.map((m) => {
      const vars = m.varianten || [];
      const mPasst = (!k.filter || this._ksPasst(m, null, k.filter)) && (!q || this._ksTextPasst(m, null, q));
      const vPasst = vars.filter((v) => (!k.filter || this._ksPasst(m, v, k.filter)) && (!q || this._ksTextPasst(m, v, q) || this._ksTextPasst(m, null, q)));
      if (!mPasst && !vPasst.length) return null;
      // Passt nur das Material (keine Variante einzeln), werden alle Varianten gezeigt
      const gefiltert = (k.filter || q) && vPasst.length && vPasst.length < vars.length;
      return { m, varianten: gefiltert ? vPasst : vars, gefiltert };
    }).filter(Boolean);
  },
  // Eigene Rollen eines Materials bzw. einer Variante
  _ksRollen(m, v) {
    const mats = m.material.map((x) => x.toLowerCase());
    return (this._daten.rollen || []).filter((r) => {
      const mat = String(r.material || "").toLowerCase();
      if (!mats.includes(mat)) return false;
      if (!v) return true;
      const art = String(r.art || "").toLowerCase().trim();
      return (v.arten || []).includes(art);
    }).sort((a, b) => a.name.localeCompare(b.name, "de"));
  },
  // max: zugeklappte Karte zeigt nur die ersten Rollen, „+N“ klappt die Karte auf (mehrId)
  _ksRollenHtml(rollen, titel, max = 0, mehrId = "") {
    if (!rollen.length) return "";
    const zeigen = max && rollen.length > max + 1 ? rollen.slice(0, max) : rollen;
    const rest = rollen.length - zeigen.length;
    return `<div class="ks-rollen"><span class="ks-rollen-titel">${esc(titel)}</span>${zeigen.map((r) =>
      `<button class="chip ks-rolle" data-aktion="oeffnen-filament" data-id="${esc(r.id)}" title="${esc(r.name)} · ${esc(r.hersteller)}"><i class="ks-farbe ${r.hex === "transparent" ? "klar" : ""}" style="${r.hex && r.hex !== "transparent" ? `background:${esc(r.hex)}` : ""}"></i>${esc(r.name)}<small>${esc(r.hersteller)}</small></button>`).join("")}${rest ? `<button class="chip ks-mehr" data-aktion="hi-ks-auf" data-id="${esc(mehrId)}">+${rest} weitere</button>` : ""}</div>`;
  },
  _ksAmpelHtml(stufe, lang = false) {
    const a = KS_P1S[stufe] || KS_P1S.bedingt;
    return `<span class="ks-ampel ${a.stufe}" title="${esc(a.lang)}"><i></i>${esc(lang ? a.lang : a.kurz)}</span>`;
  },
  _ksUnsicherHtml(text) {
    return text ? `<span class="ks-pruefen" title="${esc(text)}">bitte prüfen</span>` : "";
  },

  _hiKunststoffeHtml() {
    const k = this._ksZustand();
    return `<div class="ks-seite">
      <div class="ks-kopfzeile">
        <p class="leise ks-einleitung">Alle gängigen Filamente mit den wichtigsten Werten für deinen P1S (Edelstahldüse, ohne AMS). Tippe auf eine Karte für Details und Unterarten. Werte laut Bambu, sofern nicht anders markiert.</p>
        <input class="suche ks-suche" type="search" placeholder="Suchen: Silk, Outdoor, Zahnrad …" value="${esc(k.q)}" data-ks="suche" aria-label="Kunststoffe durchsuchen">
      </div>
      <div class="chips ks-filter unter-tabs" role="group" aria-label="Filter">
        <button class="chip ${!k.filter ? "an" : ""}" data-aktion="hi-ks-filter" data-id="">Alle</button>
        ${KS_FILTER.map(([id, n]) => `<button class="chip ${k.filter === id ? "an" : ""}" data-aktion="hi-ks-filter" data-id="${id}" aria-pressed="${k.filter === id}">${n}</button>`).join("")}
      </div>
      ${k.filter === "lebensmittel" ? this._ksLebensmittelHtml() : ""}
      <div id="ks-liste">${this._ksListeHtml()}</div>
      <div class="ks-legende leise klein">${Object.keys(KS_P1S).map((s) => this._ksAmpelHtml(s, true)).join("")}</div>
    </div>`;
  },
  _ksLebensmittelHtml() {
    return `<div class="ks-warnung" data-einmal="ks-warnung"><strong>⚠️ Gedruckte Teile sind grundsätzlich nicht lebensmittelsicher</strong>
      <p>In den Rillen zwischen den Schichten halten sich Bakterien, die sich nicht zuverlässig wegspülen lassen. Dazu kommen Reste früherer Materialien in der Düse und Farbzusätze.
      Nur <b>PLA Pure</b> ist laut Bambu zertifiziert (EU 10/2011, Spielzeug EN 71-3) – und auch dann nur: kurzer Kontakt mit <b>trockenen</b> Lebensmitteln, keine Flüssigkeiten, nicht über 60 °C (keine Spülmaschine), saubere Düse.
      PLA Basic hat nur ein Emissions-Zertifikat (GREENGUARD).</p>
      <p class="leise klein">Kinder: Kleinteile können verschluckt werden, gedruckte Teile splittern (vor allem PLA und CF). Kinder nicht unbeaufsichtigt an den laufenden Drucker – Düse bis 300 °C, Bett bis 100 °C.</p></div>`;
  },
  _ksListeHtml() {
    const k = this._ksZustand(), liste = this._ksAuswahl();
    if (!liste.length) return `<div class="dr-karte ks-leer"><p class="leise">Nichts gefunden. Anderen Filter oder Suchbegriff probieren.</p><button class="mini mint-rand" data-aktion="hi-ks-zuruecksetzen">Filter zurücksetzen</button></div>`;
    return `<div class="ks-raster">${liste.map((x) => this._ksKarteHtml(x)).join("")}</div>`;
  },
  _ksKarteHtml({ m, varianten, gefiltert }) {
    const k = this._ksZustand(), auf = !!k.auf[m.id];
    const rollen = this._ksRollen(m);
    const wert = (icon, name, w, notiz, klasse = "") => `<div class="ks-wert ${klasse}" ${notiz ? `title="${esc(notiz)}"` : ""}><span>${icon} ${esc(name)}</span><strong>${esc(w)}</strong></div>`;
    const ja = (x) => x === "ja" ? "amber" : "";
    return `<article class="ks-karte ${auf ? "auf" : ""} ${m.fremd ? "fremd" : ""}" style="--ks-farbe:${m.farbe}" data-ks-karte="${m.id}" data-einmal="ks-${m.id}">
      <button class="ks-kopf" data-aktion="hi-ks-auf" data-id="${m.id}" aria-expanded="${auf}">
        <span class="ks-name"><strong>${esc(m.name)}</strong><small>${esc(m.voll)}</small></span>
        ${this._ksAmpelHtml(m.p1s)}
        <span class="ks-pfeil" aria-hidden="true">›</span>
      </button>
      <p class="ks-kurz">${esc(m.kurz)}${m.fremd ? ` <span class="ks-fremd">kein Bambu-Material · Richtwerte, bitte prüfen</span>` : ""}</p>
      <div class="ks-werte">
        ${wert("🌡️", "Düse", m.duese, m.dueseNotiz)}${wert("🟫", "Bett", m.bett, m.bettNotiz)}${wert("📦", "Gehäuse", m.gehaeuse, m.gehaeuseNotiz)}
        ${wert("♨️", "Trocknen", m.trocknen, m.trocknenNotiz)}${wert("🔩", "Gehärtet", m.gehaertet, `Gehärtete Düse nötig? ${m.gehaertetNotiz || ""}`.trim(), ja(m.gehaertet))}${wert("💧", "Feuchte", m.hygro, "Wie stark das Material Wasser aus der Luft zieht")}
        ${wert("🧱", "Druckplatte", m.platte, m.platteNotiz, "breit")}
      </div>
      ${this._ksRollenHtml(rollen, "Deine Rollen", auf ? 0 : 3, m.id)}
      ${varianten.length && !auf ? `<button class="ks-var-vorschau" data-aktion="hi-ks-auf" data-id="${m.id}">${gefiltert ? `${varianten.length} passende ${varianten.length === 1 ? "Unterart" : "Unterarten"}: ` : `${varianten.length} ${varianten.length === 1 ? "Unterart" : "Unterarten"}: `}<span>${varianten.map((v) => esc(v.name)).join(" · ")}</span></button>` : ""}
      ${auf ? `<div class="klapp" data-klapp="ks:${m.id}">${this._ksDetailHtml(m, varianten, gefiltert)}</div>` : ""}
    </article>`;
  },
  _ksDetailHtml(m, varianten, gefiltert) {
    const liste = (xs) => `<ul>${xs.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
    return `<div class="ks-detail">
      <div class="ks-block"><h4>Typische Anwendungen</h4><p>${esc(m.anwendungen)}</p></div>
      <div class="ks-pro-contra">
        <div class="ks-block pro"><h4>Stärken</h4>${liste(m.staerken || [])}</div>
        <div class="ks-block contra"><h4>Schwächen</h4>${liste(m.schwaechen || [])}</div>
      </div>
      ${m.p1sNotiz ? `<div class="ks-block ks-p1s"><h4>Am P1S ${this._ksAmpelHtml(m.p1s, true)}</h4><p>${esc(m.p1sNotiz)}</p></div>` : ""}
      ${m.gehaeuseNotiz && m.gehaeuse !== "ja" ? `<div class="ks-block ks-sicher"><h4>📦 Gehäuse &amp; Deckel</h4><p>${esc(m.gehaeuseNotiz)}</p></div>` : ""}
      <div class="ks-block ks-sicher"><h4>🛡️ Sicherheit</h4><p>${esc(m.sicherheit)}</p></div>
      <div class="ks-block ks-essen"><h4>🍎 Lebensmittel &amp; Kinder</h4><p>${esc(m.lebensmittel)}</p></div>
      ${varianten.length ? `<h4 class="ks-var-titel">Unterarten${gefiltert ? ` <span class="leise klein">· nur passende (${varianten.length} von ${m.varianten.length})</span>` : ""}</h4>
        <div class="ks-varianten">${varianten.map((v) => this._ksVarianteHtml(m, v)).join("")}</div>` : ""}
    </div>`;
  },
  _ksVarianteHtml(m, v) {
    const k = this._ksZustand(), sl = `${m.id}:${v.id}`, auf = !!k.auf[sl];
    const p = this._ksP1s(m, v), rollen = this._ksRollen(m, v);
    const tags = (v.filter || []).map((f) => (KS_FILTER.find((x) => x[0] === f) || [])[1]).filter(Boolean).map((n) => n.split(" ")[0]).join("");
    return `<div class="ks-variante ${auf ? "auf" : ""}">
      <button class="ks-var-kopf" data-aktion="hi-ks-auf" data-id="${sl}" aria-expanded="${auf}">
        <span class="ks-var-name"><strong>${esc(v.name)}</strong>${v.neu ? `<em class="ks-neu">${esc(v.neu)}</em>` : ""}${rollen.length ? `<em class="ks-hab">${rollen.length}× im Regal</em>` : ""}</span>
        <span class="ks-var-tags" aria-hidden="true">${tags}</span>
        ${p !== m.p1s ? this._ksAmpelHtml(p) : ""}
        <span class="ks-pfeil" aria-hidden="true">›</span>
      </button>
      ${auf ? `<div class="klapp" data-klapp="ks:${sl}"><div class="ks-var-detail">
        <div><h5>Was ist anders</h5><p>${esc(v.was)}</p></div>
        <div><h5>Druckhinweise</h5><p>${esc(v.druck)}</p></div>
        ${v.unsicher ? `<p class="ks-unsicher">${this._ksUnsicherHtml(v.unsicher)} ${esc(v.unsicher)}</p>` : ""}
        ${p !== m.p1s ? `<p class="klein">${this._ksAmpelHtml(p, true)}</p>` : ""}
        ${this._ksRollenHtml(rollen, "Deine Rollen")}
      </div></div>` : ""}
    </div>`;
  },

  // ---- Fehlercodes ---------------------------------------------------------
  _cdPasst(c, q) {
    if (!q) return true;
    const roh = q.replace(/[\s_-]/g, "").toLowerCase();
    const code = (c.c + (c.auch || "")).replace(/[\s_-]/g, "").toLowerCase();
    return (roh && code.includes(roh)) || `${c.t} ${c.tun}`.toLowerCase().includes(q.toLowerCase());
  },
  _hiCodesHtml() {
    const k = this._ksZustand();
    const anzahl = CD_GRUPPEN.reduce((s, g) => s + g.codes.length, 0);
    return `<div class="cd-seite">
      <div class="dr-karte cd-kopf">
        <div class="cd-kopf-text"><h2>Fehlercodes des P1S</h2>
          <p class="leise">${anzahl} häufige HMS- und Druckfehler-Codes, nach Bauteil sortiert. Meldungen sinngemäß übersetzt; die Liste ist eine Auswahl, nicht vollständig.</p></div>
        <a class="knopf cd-wiki" href="${CD_WIKI}" target="_blank" rel="noopener noreferrer">📘 Bambu Lab Wiki ↗</a>
      </div>
      <input class="suche cd-suche" type="search" placeholder="Code oder Stichwort, z. B. 0300-0300" value="${esc(k.cdQ)}" data-ks="code-suche" aria-label="Fehlercodes durchsuchen">
      <div id="cd-liste">${this._cdListeHtml()}</div>
      <p class="leise klein cd-quelle">Meldungstexte aus Bambus offizieller HMS-Tabelle, Zuordnung zum P1S über das Bambu-Wiki (X1-/P1-Seiten). Ein Code mit vier Blöcken ist eine HMS-Meldung, ein kurzer Code (z. B. 0300-8004) eine Druckfehler-Meldung.</p>
    </div>`;
  },
  _cdListeHtml() {
    const k = this._ksZustand(), q = k.cdQ.trim();
    const gruppen = CD_GRUPPEN.map((g) => ({ g, codes: g.codes.filter((c) => this._cdPasst(c, q)) })).filter((x) => x.codes.length);
    if (!gruppen.length) return `<div class="dr-karte"><p class="leise">Kein passender Code. Im Bambu Lab Wiki (oben) gibt es die vollständige Liste.</p></div>`;
    return `<div class="cd-gruppen">${gruppen.map(({ g, codes }) => {
      const auf = !!q || !!k.cdAuf[g.id];
      return `<section class="cd-gruppe ${auf ? "auf" : ""}" data-einmal="cd-${g.id}">
        <button class="cd-gruppe-kopf" data-aktion="hi-cd-auf" data-id="${g.id}" aria-expanded="${auf}">
          <span class="cd-icon" aria-hidden="true">${g.icon}</span><strong>${esc(g.name)}</strong><span class="cd-anzahl">${codes.length}</span><span class="ks-pfeil" aria-hidden="true">›</span></button>
        ${auf ? `<div class="klapp" data-klapp="cd:${g.id}"><div class="cd-codes">${codes.map((c) => `<div class="cd-code">
          <div class="cd-code-kopf"><code>${esc(c.c)}</code>${c.kurz ? `<span class="cd-art">Druckfehler</span>` : ""}${c.auch ? `<small class="leise">${esc(c.auch)}</small>` : ""}</div>
          <p class="cd-text">${esc(c.t)}</p>
          <p class="cd-tun"><span>Was tun</span>${esc(c.tun)}</p></div>`).join("")}</div></div>` : ""}
      </section>`;
    }).join("")}</div>`;
  },

  // ---- Ereignisse ----------------------------------------------------------
  _ksKlick(a, el) {
    const k = this._ksZustand(), id = el.dataset.id;
    switch (a) {
      case "hi-ks-filter": k.filter = k.filter === id ? "" : id; break;
      case "hi-ks-zuruecksetzen": k.filter = ""; k.q = ""; break;
      case "hi-ks-auf": this._klappen(`ks:${id}`, !!k.auf[id], () => { k.auf[id] = !k.auf[id]; }); return;
      case "hi-cd-auf": if (k.cdQ.trim()) return;   // bei Suche sind alle Treffer offen
        this._klappen(`cd:${id}`, !!k.cdAuf[id], () => { k.cdAuf[id] = !k.cdAuf[id]; }); return;
      default: return;
    }
    this._zeichnen();
  },
  // Suchfelder: nur die Liste neu zeichnen, damit das Feld den Fokus behält
  _ksEingabe(t) {
    const art = t.dataset && t.dataset.ks;
    if (!art) return false;
    const k = this._ksZustand();
    if (art === "suche") {
      k.q = t.value;
      const box = this.shadowRoot.getElementById("ks-liste");
      if (box) box.innerHTML = this._ksListeHtml();
    } else if (art === "code-suche") {
      k.cdQ = t.value;
      const box = this.shadowRoot.getElementById("cd-liste");
      if (box) box.innerHTML = this._cdListeHtml();
    }
    return true;
  },
};
