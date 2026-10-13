// ---------------------------------------------------------------------------
// Wissen: Fehlerbilder, Kalibrierung, P1S-Zeichnung, Trockner, Wartung.
// Wird von Hilfe, Fehldruck-Fragen, Werkstatt und Nerd-Menü gemeinsam genutzt.
// ---------------------------------------------------------------------------

// Kleine Zeichnungen der Fehlerbilder (120 × 80)
const FB_FARBE = "#3ee6a8", FB_ROT = "#ff6b6b", FB_GRAU = "#2a3330";
const fbBild = (inhalt) => `<svg viewBox="0 0 120 80" class="fb-bild" aria-hidden="true"><rect x="0" y="70" width="120" height="10" fill="${FB_GRAU}"/>${inhalt}</svg>`;
const FB_ZEICHNUNG = {
  haftung: fbBild(`<path d="M30 70 L32 40 L88 36 L92 62 Z" fill="${FB_FARBE}" opacity=".85" transform="rotate(-8 60 60)"/><path d="M20 70 q10 -6 20 0" stroke="${FB_ROT}" stroke-width="2" fill="none"/><text x="96" y="30" fill="${FB_ROT}" font-size="14">↑</text>`),
  warping: fbBild(`<path d="M22 62 Q22 70 28 70 L92 70 Q98 70 98 62 L98 34 L22 34 Z" fill="${FB_FARBE}" opacity=".85"/><path d="M22 62 Q16 60 14 54 M98 62 Q104 60 106 54" stroke="${FB_ROT}" stroke-width="3" fill="none"/><path d="M14 54 L22 34 M106 54 L98 34" stroke="${FB_FARBE}" stroke-width="2"/>`),
  spaghetti: fbBild(`<rect x="40" y="50" width="40" height="20" fill="${FB_FARBE}" opacity=".85"/><path d="M45 50 C30 20 70 40 60 15 C55 5 90 25 75 45 C65 60 100 30 95 10 M50 48 C40 30 25 40 30 20" stroke="${FB_FARBE}" stroke-width="1.6" fill="none"/>`),
  verschiebung: fbBild(`<rect x="30" y="52" width="50" height="18" fill="${FB_FARBE}" opacity=".85"/><rect x="44" y="30" width="50" height="22" fill="${FB_FARBE}" opacity=".85"/><path d="M80 52 L94 52" stroke="${FB_ROT}" stroke-width="2"/><text x="96" y="62" fill="${FB_ROT}" font-size="11">→</text>`),
  unterextrusion: fbBild(`<rect x="25" y="22" width="70" height="48" fill="none" stroke="${FB_FARBE}" stroke-width="1"/>${[26, 32, 38, 44, 50, 56, 62].map((y, i) => `<path d="M25 ${y} H95" stroke="${FB_FARBE}" stroke-width="3.5" stroke-dasharray="${i % 2 ? "9 5" : "14 4"}"/>`).join("")}`),
  faeden: fbBild(`<rect x="18" y="26" width="18" height="44" fill="${FB_FARBE}" opacity=".85"/><rect x="84" y="26" width="18" height="44" fill="${FB_FARBE}" opacity=".85"/>${[32, 40, 47, 55].map((y) => `<path d="M36 ${y} Q60 ${y + 8} 84 ${y - 2}" stroke="${FB_FARBE}" stroke-width=".8" fill="none"/>`).join("")}`),
  feucht: fbBild(`<rect x="25" y="28" width="70" height="42" fill="${FB_FARBE}" opacity=".85"/>${[[35, 40], [55, 36], [72, 48], [45, 58], [82, 34], [64, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#0b1210"/>`).join("")}<text x="98" y="26" fill="#5cc8ff" font-size="13">💧</text>`),
  verstopft: fbBild(`<path d="M50 6 h20 v18 l-6 10 h-8 l-6 -10 z" fill="#8da49a"/><circle cx="60" cy="38" r="3" fill="${FB_ROT}"/><path d="M40 70 v-8 h40 v8" fill="${FB_FARBE}" opacity=".85"/><text x="72" y="48" fill="${FB_ROT}" font-size="12">✕</text>`),
  stuetzen: fbBild(`<rect x="20" y="22" width="80" height="10" fill="${FB_FARBE}" opacity=".85"/><rect x="20" y="32" width="12" height="38" fill="${FB_FARBE}" opacity=".85"/><path d="M60 70 V50 M75 70 V44 M90 70 V56" stroke="#4fe08a" stroke-width="2"/><path d="M58 44 l6 6 M73 38 l6 6" stroke="${FB_ROT}" stroke-width="2"/><path d="M55 32 q10 8 20 0 q10 10 25 2" stroke="${FB_FARBE}" stroke-width="1.5" fill="none"/>`),
  trennung: fbBild(`<rect x="30" y="54" width="60" height="16" fill="${FB_FARBE}" opacity=".85"/><rect x="30" y="24" width="60" height="26" fill="${FB_FARBE}" opacity=".85"/><path d="M28 52 L40 51 L50 53 L62 50 L74 53 L92 51" stroke="${FB_ROT}" stroke-width="2.2" fill="none"/>`),
  elefantenfuss: fbBild(`<path d="M34 24 H86 V62 Q92 66 94 70 H26 Q28 66 34 62 Z" fill="${FB_FARBE}" opacity=".85"/><path d="M26 70 Q28 64 34 62 M94 70 Q92 64 86 62" stroke="${FB_ROT}" stroke-width="2.5" fill="none"/>`),
  pickel: fbBild(`<rect x="25" y="24" width="70" height="46" fill="${FB_FARBE}" opacity=".85"/>${[[40, 34], [70, 30], [55, 50], [82, 58], [34, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#b9f5dd"/>`).join("")}`),
  geisterbild: fbBild(`<rect x="25" y="24" width="70" height="46" fill="${FB_FARBE}" opacity=".85"/><path d="M40 34 v26 M44 34 v26 M48 34 v26" stroke="#0b1210" stroke-width="1.2" opacity=".6"/><text x="56" y="52" fill="#0b1210" font-size="16" font-weight="700">B</text><text x="61" y="52" fill="#0b1210" font-size="16" font-weight="700" opacity=".35">B</text>`),
  naht: fbBild(`<rect x="30" y="22" width="60" height="48" rx="8" fill="${FB_FARBE}" opacity=".85"/><path d="M62 22 v48" stroke="#b9f5dd" stroke-width="2.5" stroke-dasharray="3 2"/>`),
};

// Fehlerbilder mit Ursachen und konkreten Änderungen an den Rollenwerten.
// aenderung: k = Feld aus FELDER, d = Änderung (absolut) oder f = Faktor, min/max = Grenzen
const FEHLERBILDER = [
  { id: "haftung", name: "Löst sich vom Bett", kurz: "Teil hat sich gelöst oder verschoben",
    ursachen: ["Druckbett fettig (Fingerabdrücke)", "Bett zu kalt", "Erste Schicht zu schnell", "Falsche Platte für das Material"],
    loesungen: [
      { text: "Platte mit Spülmittel und warmem Wasser waschen, danach nicht mehr anfassen." },
      { text: "Betttemperatur etwas erhöhen", aenderung: { k: "bett", d: 5, max: 110 } },
      { text: "Erste Schicht langsamer drucken", aenderung: { k: "v_erste", d: -10, min: 15 } },
      { text: "Rand (Brim) 5 mm in Bambu Studio einschalten, vor allem bei kleinen Kontaktflächen." },
    ] },
  { id: "warping", name: "Ecken heben sich (Verzug)", kurz: "Ecken biegen sich nach oben",
    ursachen: ["Material schrumpft beim Abkühlen (ASA, ABS, PETG)", "Zugluft oder offene Haube", "Lüfter zu stark"],
    loesungen: [
      { text: "Bauteillüfter maximal reduzieren", aenderung: { k: "luefter_max", d: -20, min: 0 } },
      { text: "Betttemperatur erhöhen", aenderung: { k: "bett", d: 5, max: 110 } },
      { text: "Haube und Tür geschlossen lassen, Drucker vorher 10 min aufheizen lassen." },
      { text: "Rand (Brim) oder Mausohren an den Ecken setzen." },
    ] },
  { id: "spaghetti", name: "Fadensalat (Spaghetti)", kurz: "Druck hängt in der Luft, Fäden überall",
    ursachen: ["Teil hat sich gelöst", "Stützen fehlen oder sind umgekippt", "Überhang zu steil"],
    loesungen: [
      { text: "Haftung prüfen (siehe „Löst sich vom Bett“)." },
      { text: "Stützen einschalten, Baum-Stützen für Überhänge über 45°." },
      { text: "Teil so drehen, dass die größte flache Seite auf dem Bett liegt." },
    ] },
  { id: "verschiebung", name: "Schichtverschiebung", kurz: "Obere Schichten sind seitlich versetzt",
    ursachen: ["Düse ist gegen ein hochgebogenes Teil gestoßen", "Zu schnell oder zu hohe Beschleunigung", "Riemen locker"],
    loesungen: [
      { text: "Außen- und Innenwand langsamer", aenderung: { k: "v_innen", f: 0.8, min: 20 } },
      { text: "Füllung langsamer", aenderung: { k: "v_fuellung", f: 0.8, min: 20 } },
      { text: "Z-Hop beim Verfahren in Bambu Studio einschalten (Prozess › Andere › Z-Hop)." },
      { text: "Riemenspannung prüfen (Wartung)." },
    ] },
  { id: "unterextrusion", name: "Lücken (zu wenig Material)", kurz: "Wände löchrig, Linien dünn",
    ursachen: ["Max. Volumenstrom zu hoch für das Material", "Düse teilweise verstopft", "Temperatur zu niedrig", "Rolle hakt"],
    loesungen: [
      { text: "Max. Volumenstrom senken", aenderung: { k: "max_vol", d: -2, min: 2 } },
      { text: "Düsentemperatur etwas erhöhen", aenderung: { k: "duese", d: 5, max: 300 } },
      { text: "Flow Ratio kalibrieren (Hilfe › Kalibrierung)." },
      { text: "Prüfen, ob die Rolle frei abrollt und nichts verknotet ist." },
    ] },
  { id: "faeden", name: "Fäden (Stringing)", kurz: "Feine Fäden zwischen Teilen",
    ursachen: ["Filament feucht", "Düse zu heiß", "Rückzug zu kurz"],
    loesungen: [
      { text: "Rolle trocknen (Werte siehe Trockner-Hilfe)." },
      { text: "Düsentemperatur senken", aenderung: { k: "duese", d: -5, min: 170 } },
      { text: "Rückzug in Bambu Studio um 0,2 mm erhöhen." },
    ] },
  { id: "feucht", name: "Blasen, Knacken, raue Oberfläche", kurz: "Knistert beim Drucken, Bläschen",
    ursachen: ["Filament hat Feuchtigkeit gezogen (PETG, TPU, PA besonders)"],
    loesungen: [
      { text: "Rolle trocknen, danach luftdicht mit Trockenmittel lagern." },
      { text: "Beim Drucken direkt aus dem Trockner ziehen." },
    ] },
  { id: "verstopft", name: "Kein Filament kommt", kurz: "Düse verstopft oder Extruder rutscht",
    ursachen: ["Düse verstopft (Wood-PLA in 0,2 mm, Kohle im Hotend)", "Hitzestau bei PLA in warmer Kammer", "Filament gerissen"],
    loesungen: [
      { text: "Kaltzug (Cold Pull) machen oder Düse tauschen." },
      { text: "Bei PLA Tür oder Haube einen Spalt öffnen (Hitzestau)." },
      { text: "Düsentemperatur etwas erhöhen", aenderung: { k: "duese", d: 5, max: 300 } },
    ] },
  { id: "stuetzen", name: "Stützen versagen", kurz: "Stützen kippen oder lösen sich",
    ursachen: ["Zu dünne Baumstützen", "Kleine Auflage auf dem Bett"],
    loesungen: [
      { text: "„Baum stark“ oder „Normal“ statt „Baum schlank“ wählen." },
      { text: "Rand für Stützen einschalten (Stützen › Rand)." },
    ] },
  { id: "trennung", name: "Schichten trennen sich", kurz: "Teil bricht entlang der Schichten",
    ursachen: ["Düse zu kalt", "Lüfter zu stark", "Material feucht"],
    loesungen: [
      { text: "Düsentemperatur erhöhen", aenderung: { k: "duese", d: 5, max: 300 } },
      { text: "Bauteillüfter reduzieren", aenderung: { k: "luefter_max", d: -20, min: 0 } },
      { text: "Bei ASA/ABS Haube geschlossen lassen." },
    ] },
  { id: "elefantenfuss", name: "Elefantenfuß", kurz: "Unterste Schichten stehen über",
    ursachen: ["Bett zu heiß", "Erste Schicht zu dick gequetscht"],
    loesungen: [
      { text: "Betttemperatur senken", aenderung: { k: "bett", d: -5, min: 0 } },
      { text: "„Elefantenfuß-Kompensation“ in Bambu Studio auf 0,15 mm setzen." },
    ] },
  { id: "pickel", name: "Pickel und Kleckse", kurz: "Kleine Knubbel auf der Oberfläche",
    ursachen: ["Zu viel Material (Flow)", "Naht verteilt auf „Zufällig“", "Feuchtes Filament"],
    loesungen: [
      { text: "Flow Ratio leicht senken", aenderung: { k: "flow", d: -0.02, min: 0.85 } },
      { text: "Nahtposition auf „Ausgerichtet“ oder „Hinten“ stellen." },
    ] },
  { id: "geisterbild", name: "Wellen hinter Kanten (Ghosting)", kurz: "Echo-Muster nach Ecken",
    ursachen: ["Schwingungen bei hoher Geschwindigkeit", "Lockere Riemen"],
    loesungen: [
      { text: "Außenwand langsamer", aenderung: { k: "v_aussen", f: 0.8, min: 20 } },
      { text: "Vibrations-Kalibrierung am Drucker neu laufen lassen." },
    ] },
  { id: "naht", name: "Sichtbare Naht", kurz: "Senkrechte Linie, wo jede Schicht beginnt",
    ursachen: ["Druckdruck beim Start und Ende der Wand (K-Faktor)"],
    loesungen: [
      { text: "Flussdynamik (K-Faktor) kalibrieren (Hilfe › Kalibrierung)." },
      { text: "Naht in eine Ecke legen: Nahtposition „Ausgerichtet“." },
    ] },
];
const fehlerbild = (id) => FEHLERBILDER.find((f) => f.id === id);

// Was eine Änderung konkret bedeutet: aktueller Wert → neuer Wert
function aenderungRechnen(rolle, a) {
  const alt = wert(rolle, a.k).v;
  if (alt == null) return null;
  let neu = a.f != null ? alt * a.f : alt + a.d;
  if (a.min != null) neu = Math.max(a.min, neu);
  if (a.max != null) neu = Math.min(a.max, neu);
  const f = FELDER.find((x) => x.k === a.k);
  const st = f ? f.step : 1;
  neu = Math.round(neu / st) * st;
  if (Math.abs(neu - alt) < 1e-9) return null;
  return { k: a.k, alt, neu, feld: f };
}

// Fragenkatalog für Fehldrucke
const FEHL_FRAGEN = {
  wann: [
    { id: "erste", name: "Erste Schicht", hinweis: "Fast immer Haftung: Bett sauber, Temperatur, erste Schicht." },
    { id: "frueh", name: "Im ersten Drittel", hinweis: "Häufig Haftung oder Verzug, der langsam die Ecken anhebt." },
    { id: "mitte", name: "Mittendrin", hinweis: "Oft Stützen, Kollision mit hochgebogenen Teilen oder verstopfte Düse." },
    { id: "spaet", name: "Gegen Ende", hinweis: "Hitzestau, Verzug bei hohen Teilen oder Filament fast leer/feucht." },
  ],
  extra: [
    { id: "getrocknet", frage: "War die Rolle frisch getrocknet?", ja: null, nein: "feucht" },
    { id: "bett_sauber", frage: "War das Druckbett frisch gereinigt?", ja: null, nein: "haftung" },
    { id: "haube", frage: "War die Haube/Tür geschlossen?", ja: null, nein: "warping" },
  ],
};
// Aus Fortschritt (%) eine Antwort für „Wann?“ vorschlagen
const wannAusFortschritt = (p) => (p == null ? null : p < 3 ? "erste" : p < 33 ? "frueh" : p < 80 ? "mitte" : "spaet");

// Kalibrierungen (Bambu Studio › Kalibrierung)
const KALIBRIERUNGEN = [
  { id: "temp", name: "Temperaturturm", feld: "duese", icon: "🌡️",
    wozu: "Findet die beste Düsentemperatur für eine Rolle: sauber, ohne Fäden, mit fester Schichthaftung.",
    so: ["Bambu Studio › Kalibrierung › Temperatur.", "Material wählen, Bereich vorgeben (z. B. 230 → 190 °C bei PLA).", "Drucken. Jede Stufe hat eine andere Temperatur."],
    achten: ["Unten heiß, oben kalt: die Stufe mit sauberen Brücken, wenig Fäden und ohne Lücken wählen.", "Turm oben abbrechen: wenn er leicht bricht, ist es zu kalt."],
    fehler: ["Fäden an den heißen Stufen (zu heiß oder feucht)", "Brücken hängen durch", "Turm bricht bei kalten Stufen"],
    bild: `<svg viewBox="0 0 120 90" class="kal-bild"><rect x="0" y="82" width="120" height="8" fill="#2a3330"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="38" y="${70 - i * 13}" width="44" height="12" fill="hsl(${10 + i * 28} 70% 55%)"/><text x="88" y="${79 - i * 13}" font-size="7" fill="#8da49a">${230 - i * 5}°</text>`).join("")}</svg>` },
  { id: "flow", name: "Flow Rate", feld: "flow", icon: "💧",
    wozu: "Stimmt, wie viel Material gefördert wird. Zu viel macht Pickel und raue Deckflächen, zu wenig Lücken.",
    so: ["Bambu Studio › Kalibrierung › Flow-Rate › Durchgang 1.", "Die glatteste Fläche wählen und die Zahl eintragen.", "Optional Durchgang 2 für die Feinabstimmung."],
    achten: ["Mit dem Finger über die Oberflächen fahren: die glatteste ohne Rillen und ohne Wülste.", "Bei Lücken zwischen den Linien ist der Wert zu klein."],
    fehler: ["Deckfläche mit Rillen (zu wenig)", "Wülste und Pickel (zu viel)", "Flächen unterscheiden sich kaum: Material feucht oder Temperatur falsch"],
    bild: `<svg viewBox="0 0 120 90" class="kal-bild"><rect x="0" y="82" width="120" height="8" fill="#2a3330"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<rect x="${8 + (i % 3) * 36}" y="${10 + Math.floor(i / 3) * 24}" width="30" height="20" rx="3" fill="#3ee6a8" opacity="${i === 4 ? 1 : 0.45}"/>`).join("")}</svg>` },
  { id: "k", name: "Flussdynamik (K-Faktor)", feld: "k", icon: "📈",
    wozu: "Gleicht den Druck in der Düse beim Beschleunigen und Bremsen aus. Saubere Ecken, gleichmäßige Wände, weniger Naht.",
    so: ["Bambu Studio › Kalibrierung › Flussdynamik › Manuell (Linien-Methode).", "Die Linie mit der gleichmäßigsten Breite wählen.", "Den K-Wert eintragen und in Bambu Studio als PA-Profil speichern."],
    achten: ["Gerade, gleich breite Linie ohne dicken Anfang und dünnes Ende.", "Bei 0,2-mm-Düse und TPU ist der Wert anders, eigenes Profil anlegen."],
    fehler: ["Dicke Ecken und Wulst an der Naht (K zu klein)", "Lücken nach Ecken (K zu groß)"],
    bild: `<svg viewBox="0 0 120 90" class="kal-bild"><rect x="0" y="82" width="120" height="8" fill="#2a3330"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M10 ${12 + i * 12} H40 L${40 + 4} ${12 + i * 12} H110" stroke="#3ee6a8" stroke-width="${i === 3 ? 3 : 2 + Math.abs(i - 3) * 0.6}" opacity="${i === 3 ? 1 : 0.5}" stroke-dasharray="${i < 3 ? "30 2 80 0" : "30 4 80 0"}"/>`).join("")}</svg>` },
  { id: "maxvol", name: "Max. Volumenstrom", feld: "max_vol", icon: "🚀",
    wozu: "Wie viel mm³/s die Düse schmelzen kann, bevor Lücken entstehen. Begrenzt das Tempo, damit der Druck nicht unterextrudiert.",
    so: ["Bambu Studio › Kalibrierung › Max. Volumenstrom.", "Turm drucken, die Höhe ablesen, ab der die Wand Lücken bekommt.", "Höhe × Schritt + Start ergibt den Wert, davon 10–20 % abziehen."],
    achten: ["Die Stelle, an der die Oberfläche matt und löchrig wird.", "Lieber etwas vorsichtiger eintragen."],
    fehler: ["Ganzer Turm löchrig: Temperatur zu niedrig", "Kein Wechsel sichtbar: Bereich zu klein gewählt"],
    bild: `<svg viewBox="0 0 120 90" class="kal-bild"><rect x="0" y="82" width="120" height="8" fill="#2a3330"/><path d="M40 82 L50 10 L70 10 L80 82 Z" fill="#3ee6a8" opacity=".85"/><path d="M48 30 H72" stroke="#ff6b6b" stroke-width="2" stroke-dasharray="3 2"/><text x="78" y="32" font-size="8" fill="#ff6b6b">Lücken ab hier</text></svg>` },
];

// ---- Bambu Lab P1S: Bereiche der Zeichnung ----
// x/y = Punkt in der Zeichnung (viewBox 420 × 440), live = Wert aus Home Assistant
const P1S_BEREICHE = [
  { id: "duese", n: 1, x: 214, y: 196, name: "Düse und Hotend", live: "duese", einheit: "°C",
    text: "Hier wird das Filament geschmolzen. Die Temperatur entscheidet über Haftung der Schichten, Glanz und Fäden.",
    einst: [["Düse erste Schicht / weitere", "Etwas heißer in der ersten Schicht verbessert die Haftung."], ["Düsendurchmesser", "0,2 fein und langsam, 0,4 Standard, 0,6 schnell und stabil."], ["Flow Ratio", "Wie viel Material genau gefördert wird."]] },
  { id: "extruder", n: 2, x: 214, y: 140, name: "Extruder", live: null,
    text: "Zahnräder schieben das Filament in die Düse. Von hier kommen Rückzug, Flussdynamik und das Förderlimit.",
    einst: [["Rückzug (Retraction)", "Zieht das Filament beim Verfahren zurück, gegen Fäden."], ["K-Faktor", "Gleicht den Druck beim Beschleunigen aus."], ["Max. Volumenstrom", "Obergrenze für mm³/s, sonst Lücken."]] },
  { id: "luefter", n: 3, x: 246, y: 178, name: "Bauteillüfter", live: "l_bauteil", einheit: "%",
    text: "Kühlt die frische Schicht. Viel Luft für PLA und Überhänge, wenig für ASA/ABS/PETG.",
    einst: [["Lüfter min. / max.", "Bereich, in dem der Lüfter je nach Schichtzeit läuft."], ["Überhang-Lüfter", "Volle Kühlung an Überhängen und Brücken."]] },
  { id: "riemen", n: 4, x: 110, y: 88, name: "Riemen und Kohlestangen (X/Y)", live: "tempo",
    text: "Bewegen den Druckkopf. Geschwindigkeit und Beschleunigung wirken hier, zu viel davon macht Wellen hinter Kanten.",
    einst: [["Geschwindigkeiten", "Außenwand langsamer für schöne Oberflächen, Füllung schnell."], ["Beschleunigung", "Höher = schneller, aber mehr Schwingungen."], ["Geschwindigkeitsprofil am Drucker", "Leise, Standard, Sport, Wahnsinn."]] },
  { id: "bett", n: 5, x: 210, y: 300, name: "Druckbett", live: "bett", einheit: "°C",
    text: "Heizbett mit wechselbarer Platte. Platte und Temperatur entscheiden über Haftung und Elefantenfuß.",
    einst: [["Druckbetttyp", "Textured PEI für fast alles, Cool Plate für PLA, Engineering für Kleber."], ["Betttemperatur", "PLA 55 °C, PETG 70 °C, ASA 100 °C."], ["Erste Schicht", "Höhe und Tempo der ersten Schicht."]] },
  { id: "z", n: 6, x: 76, y: 262, name: "Z-Achse (Spindeln)", live: null,
    text: "Senkt das Bett Schicht für Schicht ab. Hier wirken Schichthöhe und Z-Hop.",
    einst: [["Schichthöhe", "0,2 mm Standard, 0,12 fein, 0,28 schnell (bei 0,4-mm-Düse)."], ["Z-Hop", "Hebt beim Verfahren an, verhindert Anstoßen."]] },
  { id: "aux", n: 7, x: 36, y: 190, name: "Hilfslüfter (seitlich)", live: null,
    text: "Großer Lüfter an der Seite für zusätzliche Kühlung. Gut für PLA bei hohem Tempo, bei ASA/ABS aus.",
    einst: [["Hilfslüfter", "In Bambu Studio unter Filament › Kühlung."]] },
  { id: "kammer", n: 8, x: 372, y: 64, name: "Druckraumlüfter", live: "l_raum", einheit: "%",
    text: "Saugt warme Luft ab. Bei PLA gegen Hitzestau, bei ASA/ABS gering halten, damit es warm bleibt.",
    einst: [["Kammerlüfter", "Filament › Kühlung › Druckraumlüfter."]] },
  { id: "spule", n: 9, x: 402, y: 210, name: "Spulenhalter und PTFE", live: "filament",
    text: "Die Rolle hängt hinten. Ohne AMS läuft das Filament durch den PTFE-Schlauch zum Druckkopf.",
    einst: [["Trocknen", "Feuchtes Filament macht Fäden und Blasen."], ["Abrollen", "Rolle muss frei laufen, sonst Lücken."]] },
  { id: "kamera", n: 10, x: 58, y: 54, name: "Kamera", live: null,
    text: "Zeigt den Druck live und macht das Endfoto. Die Fehlererkennung (Spaghetti) läuft darüber.",
    einst: [["Druckfehlererkennung", "Am Drucker unter Einstellungen einschalten."]] },
  { id: "display", n: 11, x: 110, y: 404, name: "Display", live: "schritt",
    text: "Bedienung am Gerät: Filament laden, Extruder fahren, Geschwindigkeitsprofil, Kalibrierung.",
    einst: [["Extruder fahren", "Vor dem Druck 3× fördern (wird beim Verbuchen eingerechnet)."]] },
  { id: "schneider", n: 12, x: 180, y: 158, name: "Filament-Schneider", live: null,
    text: "Schneidet beim Entladen das Filament ab. Das Reststück bis zur Düse wird beim Rollenwechsel der alten Rolle abgezogen.",
    einst: [["Reststück", "Etwa 4–5 cm, rund 0,15 g."]] },
];

function p1sSvg(aktiv) {
  const linie = 'stroke="#5d726a" stroke-width="1.4" fill="none"';
  return `<svg viewBox="0 0 420 440" class="p1s-bild" role="img" aria-label="Zeichnung Bambu Lab P1S">
    <defs><pattern id="p1s-raster" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0 H0 V10" stroke="rgba(62,230,168,.06)" fill="none"/></pattern></defs>
    <rect x="0" y="0" width="420" height="440" fill="url(#p1s-raster)"/>
    <!-- Gehäuse -->
    <rect x="20" y="24" width="370" height="400" rx="14" ${linie}/>
    <rect x="34" y="40" width="342" height="330" rx="6" stroke="#3ee6a8" stroke-opacity=".35" stroke-width="1" fill="rgba(62,230,168,.03)"/>
    <path d="M34 40 L376 40" stroke="#5d726a" stroke-width="3"/>
    <!-- Kammerlüfter hinten oben -->
    <circle cx="372" cy="64" r="12" ${linie}/><path d="M372 52 V76 M360 64 H384" stroke="#5d726a"/>
    <!-- Kamera -->
    <rect x="48" y="48" width="20" height="12" rx="3" ${linie}/><circle cx="58" cy="54" r="3" fill="#5d726a"/>
    <!-- Kohlestangen + Riemen -->
    <path d="M44 88 H366" stroke="#8da49a" stroke-width="3"/><path d="M44 96 H366" stroke="#5d726a" stroke-width="1.2" stroke-dasharray="4 3"/>
    <path d="M44 88 V120 M366 88 V120" ${linie}/>
    <!-- Druckkopf -->
    <rect x="178" y="98" width="72" height="84" rx="8" fill="rgba(141,164,154,.10)" stroke="#8da49a" stroke-width="1.6"/>
    <rect x="190" y="110" width="48" height="36" rx="4" ${linie}/><circle cx="214" cy="128" r="10" ${linie}/>
    <circle cx="246" cy="164" r="11" ${linie}/><path d="M238 164 H254 M246 156 V172" stroke="#5d726a"/>
    <path d="M178 150 L170 158 L182 162" ${linie}/>
    <path d="M206 182 L222 182 L218 194 L210 194 Z" fill="#8da49a"/><path d="M212 194 L216 194 L214 200 Z" fill="#ffb547"/>
    <!-- PTFE zur Spule -->
    <path d="M214 98 C214 60 330 50 380 130 C392 150 396 180 400 196" stroke="#ffb547" stroke-opacity=".7" stroke-width="2" fill="none" stroke-dasharray="5 3"/>
    <!-- Spule hinten -->
    <circle cx="402" cy="210" r="14" stroke="#ffb547" stroke-width="2" fill="rgba(255,181,71,.12)"/><circle cx="402" cy="210" r="4" fill="#ffb547"/>
    <!-- Hilfslüfter seitlich -->
    <rect x="22" y="160" width="14" height="60" rx="3" ${linie}/><path d="M24 170 H34 M24 180 H34 M24 190 H34 M24 200 H34 M24 210 H34" stroke="#5d726a"/>
    <!-- Z-Spindeln -->
    <path d="M76 120 V360 M344 120 V360" stroke="#8da49a" stroke-width="2.5" stroke-dasharray="2 3"/>
    <!-- Druckbett -->
    <path d="M70 286 L350 286 L362 306 L58 306 Z" fill="rgba(62,230,168,.10)" stroke="#3ee6a8" stroke-width="1.6"/>
    <rect x="58" y="306" width="304" height="8" fill="rgba(62,230,168,.25)"/>
    <!-- kleines Druckteil -->
    <rect x="196" y="268" width="36" height="22" rx="2" fill="#3ee6a8" opacity=".7"/>
    <!-- Display + Tür -->
    <rect x="70" y="390" width="80" height="26" rx="4" stroke="#8da49a" stroke-width="1.4" fill="rgba(62,230,168,.06)"/>
    <path d="M78 403 H110" stroke="#3ee6a8" stroke-width="2"/>
    <path d="M34 370 H376" ${linie}/>
    ${P1S_BEREICHE.map((b) => `<g class="p1s-punkt ${aktiv === b.id ? "an" : ""}" data-aktion="hi-p1s" data-id="${b.id}" tabindex="0">
      <circle cx="${b.x}" cy="${b.y}" r="16" class="p1s-flaeche"/>
      <circle cx="${b.x}" cy="${b.y}" r="10" class="p1s-ring"/><text x="${b.x}" y="${b.y + 3.5}" text-anchor="middle">${b.n}</text></g>`).join("")}
  </svg>`;
}

// ---- Sovol-Trockner: Bereiche des Displays ----
const TROCKNER_BEREICHE = [
  { id: "material", name: "Material", x: 92, y: 236, text: "Voreinstellung für das Material. Setzt Temperatur und Zeit. Für eigene Werte „Custom“ wählen und anpassen." },
  { id: "feuchte", name: "Luftfeuchte", x: 162, y: 236, text: "Relative Feuchte im Trockner. Ziel: unter 15 % für PLA/PETG, unter 10 % für ASA, TPU, PA. Sinkt sie nicht mehr, ist die Rolle trocken." },
  { id: "soll", name: "Soll-Temperatur", x: 232, y: 236, text: "Die eingestellte Temperatur. Nie über die Erweichungstemperatur, sonst verkleben die Windungen (PLA max. 55 °C)." },
  { id: "ist", name: "Ist-Temperatur", x: 296, y: 236, text: "Aktuelle Temperatur im Inneren. Sie erreicht den Sollwert nach etwa 20–30 Minuten, die Zeit zählt aber sofort." },
  { id: "zeit", name: "Restzeit", x: 360, y: 236, text: "Verbleibende Trocknungszeit. Danach Rolle warm luftdicht einpacken oder direkt aus dem Trockner drucken." },
  { id: "spulen", name: "Zwei Spulenplätze", x: 200, y: 110, text: "Zwei Rollen gleichzeitig. Nur Materialien mit ähnlicher Temperatur zusammen trocknen, sonst nach dem empfindlicheren richten." },
  { id: "auslass", name: "Filament-Auslass", x: 386, y: 96, text: "Durch die Öffnung kann direkt aus dem Trockner gedruckt werden. Gut für TPU und PETG bei langen Drucken." },
];
function trocknerSvg(aktiv) {
  const l = 'stroke="#8da49a" stroke-width="1.5" fill="none"';
  const spule = (cx) => `<circle cx="${cx}" cy="110" r="54" stroke="#ffb547" stroke-width="2" fill="rgba(255,181,71,.08)"/>
    <circle cx="${cx}" cy="110" r="40" stroke="#ffb547" stroke-opacity=".5" fill="none"/><circle cx="${cx}" cy="110" r="10" fill="#ffb547" opacity=".6"/>`;
  return `<svg viewBox="0 0 440 290" class="trockner-bild" role="img" aria-label="Zeichnung Sovol Filament-Trockner">
    <rect x="20" y="20" width="400" height="250" rx="22" ${l}/>
    <rect x="34" y="32" width="372" height="160" rx="14" stroke="#5cc8ff" stroke-opacity=".4" stroke-width="1.4" fill="rgba(92,200,255,.05)"/>
    ${spule(130)}${spule(310)}
    <path d="M386 84 h20" stroke="#ffb547" stroke-width="2"/><circle cx="406" cy="84" r="4" fill="none" stroke="#8da49a"/>
    <rect x="60" y="206" width="330" height="54" rx="10" fill="rgba(0,0,0,.35)" stroke="#3ee6a8" stroke-opacity=".5"/>
    <text x="92" y="228" class="tr-wert" text-anchor="middle">PETG</text>
    <text x="162" y="228" class="tr-wert" text-anchor="middle">12 %</text>
    <text x="232" y="228" class="tr-wert" text-anchor="middle">65°</text>
    <text x="296" y="228" class="tr-wert" text-anchor="middle">63°</text>
    <text x="360" y="228" class="tr-wert" text-anchor="middle">05:40</text>
    ${TROCKNER_BEREICHE.map((b) => `<g class="p1s-punkt ${aktiv === b.id ? "an" : ""}" data-aktion="hi-tr" data-id="${b.id}" tabindex="0">
      <rect x="${b.x - 30}" y="${b.y - (b.id === "spulen" ? 60 : 12)}" width="60" height="${b.id === "spulen" ? 120 : 24}" rx="8" class="p1s-flaeche"/>
      <circle cx="${b.x}" cy="${b.y + (b.id === "spulen" ? 70 : 14)}" r="9" class="p1s-ring"/><text x="${b.x}" y="${b.y + (b.id === "spulen" ? 73.5 : 17.5)}" text-anchor="middle">${TROCKNER_BEREICHE.indexOf(b) + 1}</text></g>`).join("")}
  </svg>`;
}

// Trocknen je Material (Richtwerte, Sovol max. 70 °C)
const TROCKNEN_TABELLE = [
  { m: "PLA", temp: 50, h: 6, ziel: 15, zeichen: "Fäden, matte Stellen, spröde Rolle", lagern: "Beutel mit Trockenmittel reicht meist." },
  { m: "PLA Silk / Matte", temp: 50, h: 6, ziel: 15, zeichen: "Glanz geht verloren, Fäden", lagern: "Wie PLA." },
  { m: "Wood-PLA", temp: 45, h: 6, ziel: 15, zeichen: "Verstopfte Düse, raue Oberfläche", lagern: "Trocken lagern, nicht mit 0,2-mm-Düse." },
  { m: "PETG", temp: 65, h: 6, ziel: 15, zeichen: "Knistern, Blasen, viele Fäden", lagern: "Zieht schnell Wasser, luftdicht lagern." },
  { m: "ASA", temp: 70, h: 6, ziel: 10, zeichen: "Blasen, schwache Schichthaftung", lagern: "Luftdicht mit Trockenmittel." },
  { m: "ABS", temp: 70, h: 4, ziel: 10, zeichen: "Blasen, raue Oberfläche", lagern: "Luftdicht mit Trockenmittel." },
  { m: "TPU", temp: 55, h: 8, ziel: 10, zeichen: "Starkes Knistern, Fäden ohne Ende", lagern: "Direkt aus dem Trockner drucken." },
  { m: "PC", temp: 70, h: 8, ziel: 10, zeichen: "Blasen, trübe Oberfläche", lagern: "Am besten im Trockner lassen." },
  { m: "PA / Nylon", temp: 70, h: 12, ziel: 10, zeichen: "Knistern, weiche Teile", lagern: "Nur aus dem Trockner drucken." },
];

// ---- Wartung (Stunden aus der „Gesamtnutzung“ des Druckers) ----
const WARTUNG_AUFGABEN = [
  { id: "platte", name: "Druckplatte reinigen", alle_h: 10, alle_tage: 7, text: "Spülmittel und warmes Wasser, abtrocknen, nicht mehr anfassen." },
  { id: "stangen", name: "Kohlestangen reinigen", alle_h: 100, alle_tage: 30, text: "Mit trockenem Tuch oder etwas Isopropanol abwischen. Nicht ölen." },
  { id: "duese", name: "Düse und Silikonsocke prüfen", alle_h: 200, alle_tage: 60, text: "Verkrustungen entfernen, Socke auf Risse prüfen." },
  { id: "luefter", name: "Lüfter von Staub befreien", alle_h: 300, alle_tage: 90, text: "Hotend-, Bauteil- und Kammerlüfter mit Pinsel oder Druckluft." },
  { id: "spindeln", name: "Z-Spindeln schmieren", alle_h: 300, alle_tage: 90, text: "Alte Schmiere abwischen, dünn neues Fett (Bambu-Schmierfett) auftragen." },
  { id: "riemen", name: "Riemenspannung prüfen", alle_h: 300, alle_tage: 90, text: "Am Drucker: Einstellungen › Riemenspannung, danach Vibrations-Kalibrierung." },
  { id: "ptfe", name: "PTFE-Schlauch und Schneider prüfen", alle_h: 500, alle_tage: 180, text: "Schlauch auf Knicke und Abrieb, Schneider auf stumpfe Klinge prüfen." },
  { id: "filter", name: "Aktivkohlefilter tauschen", alle_h: 500, alle_tage: 180, text: "Vor allem, wenn du oft ASA/ABS druckst." },
  { id: "kalibrieren", name: "Komplette Kalibrierung", alle_h: 500, alle_tage: 180, text: "Bett-Nivellierung, Vibration und Motoren am Drucker neu kalibrieren." },
];
// Verschleißteile mit Richtwert für die Lebensdauer in Druckstunden
const ERSATZTEILE_STANDARD = [
  { id: "duese04", name: "Düse 0,4 mm gehärtet", lebensdauer_h: 2000, eingebaut_h: 0 },
  { id: "platte", name: "Textured PEI Plate", lebensdauer_h: 1500, eingebaut_h: 0 },
  { id: "socke", name: "Silikonsocke Hotend", lebensdauer_h: 500, eingebaut_h: 0 },
  { id: "ptfe", name: "PTFE-Schlauch", lebensdauer_h: 1000, eingebaut_h: 0 },
  { id: "filter", name: "Aktivkohlefilter", lebensdauer_h: 500, eingebaut_h: 0 },
  { id: "riemen", name: "Riemen X/Y", lebensdauer_h: 3000, eingebaut_h: 0 },
];

// ---- Unscharfe Suche ----
function normText(s) {
  return String(s || "").toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9,.]+/g, " ").trim();
}
function wortAbstand(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const z = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let vor = z[0]; z[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const t = z[j];
      z[j] = Math.min(z[j] + 1, z[j - 1] + 1, vor + (a[i - 1] === b[j - 1] ? 0 : 1));
      vor = t;
    }
  }
  return z[b.length];
}
// Punktzahl: 0 = passt nicht. Jedes Suchwort muss passen (genau, Anfang, enthalten oder vertippt)
function suchPunkte(anfrage, text) {
  const woerter = normText(anfrage).split(" ").filter(Boolean);
  if (!woerter.length) return 0;
  const t = normText(text), teile = t.split(" ");
  let summe = 0;
  for (const w of woerter) {
    let best = 0;
    if (t.includes(w)) best = 3;
    for (const x of teile) {
      if (x === w) best = Math.max(best, 4);
      else if (x.startsWith(w)) best = Math.max(best, 3.5);
      else if (w.length >= 4 && wortAbstand(w, x.slice(0, w.length + 1)) <= (w.length >= 7 ? 2 : 1)) best = Math.max(best, 1.5);
    }
    if (!best) return 0;
    summe += best;
  }
  return summe;
}
