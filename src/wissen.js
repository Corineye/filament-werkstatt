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
    ursachen: ["Druckaufbau in der Düse am Anfang und Ende der Wand (Pressure Advance / K-Faktor)", "Ungünstige Nahtposition (z. B. „Nächste“ auf glatten Flächen)"],
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

// Temperaturturm: unterste (heißeste) Stufe passend zur Düsentemperatur der Rolle
const kalTempOben = (r) => { const d = r && wert(r, "duese").v; return d ? Math.round((d + 15) / 5) * 5 : 230; };
// Platzhalter in Kalibrier-Texten mit Werten der Beispielrolle füllen
function kalText(s, r) {
  const oben = kalTempOben(r);
  return s.replace(/\{t_hoch\}/g, oben).replace(/\{t_tief\}/g, oben - 25).replace(/\{material\}/g, (r && r.material) || "PLA");
}

// Kalibrierungen (Bambu Studio › Kalibrierung)
const KALIBRIERUNGEN = [
  { id: "temp", name: "Temperaturturm", feld: "duese", icon: "🌡️",
    wozu: "Findet die beste Düsentemperatur für eine Rolle: sauber, ohne Fäden, mit fester Schichthaftung.",
    so: ["Bambu Studio › Kalibrierung › Temperatur.", "Material wählen, Bereich vorgeben (z. B. {t_hoch} → {t_tief} °C bei {material}).", "Drucken. Jede Stufe hat eine andere Temperatur."],
    achten: ["Unten heiß, oben kalt: die Stufe mit sauberen Brücken, wenig Fäden und ohne Lücken wählen.", "Turm oben abbrechen: wenn er leicht bricht, ist es zu kalt."],
    fehler: ["Fäden an den heißen Stufen (zu heiß oder feucht)", "Brücken hängen durch", "Turm bricht bei kalten Stufen"],
    bild: (r) => { const oben = kalTempOben(r); return `<svg viewBox="0 0 120 90" class="kal-bild"><rect x="0" y="82" width="120" height="8" fill="#2a3330"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="38" y="${70 - i * 13}" width="44" height="12" fill="hsl(${10 + i * 28} 70% 55%)"/><text x="88" y="${79 - i * 13}" font-size="7" fill="#8da49a">${oben - i * 5}°</text>`).join("")}</svg>`; } },
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
    einst: [["Druckbetttyp", "Textured PEI für fast alles, Cool Plate für PLA, Engineering Plate mit Klebestift."], ["Betttemperatur", "PLA 55 °C, PETG 70 °C, ASA 100 °C."], ["Erste Schicht", "Höhe und Tempo der ersten Schicht."]] },
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
  { id: "display", n: 11, x: 110, y: 32, name: "Display", live: "schritt",
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
    <!-- Display oben an der Front -->
    <rect x="72" y="26" width="76" height="12" rx="3" stroke="#8da49a" stroke-width="1.4" fill="rgba(62,230,168,.10)" class="p1s-display"/>
    <!-- Tür unten -->
    <path d="M34 370 H376" ${linie}/><path d="M186 397 H234" stroke="#5d726a" stroke-width="3" stroke-linecap="round"/>
    ${P1S_BEREICHE.map((b) => `<g class="p1s-punkt ${aktiv === b.id ? "an" : ""}" data-aktion="hi-p1s" data-id="${b.id}" tabindex="0">
      <circle cx="${b.x}" cy="${b.y}" r="16" class="p1s-flaeche"/>
      <circle cx="${b.x}" cy="${b.y}" r="10" class="p1s-ring"/><text x="${b.x}" y="${b.y + 3.5}" text-anchor="middle">${b.n}</text></g>`).join("")}
  </svg>`;
}

// ---- Sovol-Trockner: Bereiche der Zeichnung ----
// f = Hover-Fläche [x, y, breite, höhe], b = Nummernpunkt [x, y] (viewBox 440 × 290).
// Die Display-Werte stehen mittig in ihrer Fläche (y = 221), die Nummer darunter.
const TR_TEXT_Y = 221;
const trFeld = (x) => ({ f: [x - 29, TR_TEXT_Y - 12, 58, 24], b: [x, 247], x });
const TROCKNER_BEREICHE = [
  { id: "material", name: "Material", ...trFeld(92), text: "Voreinstellung für das Material. Setzt Temperatur und Zeit. Für eigene Werte „Custom“ wählen und anpassen." },
  { id: "feuchte", name: "Luftfeuchte", ...trFeld(162), text: "Relative Feuchte im Trockner. Ziel: unter 15 % für PLA/PETG, unter 10 % für ASA, TPU, PA. Sinkt sie nicht mehr, ist die Rolle trocken." },
  { id: "soll", name: "Soll-Temperatur", ...trFeld(232), text: "Die eingestellte Temperatur. Nie über die Erweichungstemperatur, sonst verkleben die Windungen (PLA max. 55 °C)." },
  { id: "ist", name: "Ist-Temperatur", ...trFeld(296), text: "Aktuelle Temperatur im Inneren. Sie erreicht den Sollwert nach etwa 20–30 Minuten, die Zeit zählt aber sofort." },
  { id: "zeit", name: "Restzeit", ...trFeld(360), text: "Verbleibende Trocknungszeit. Danach Rolle warm luftdicht einpacken oder direkt aus dem Trockner drucken." },
  { id: "spulen", name: "Zwei Spulenplätze", f: [34, 32, 372, 160], b: [220, 110], text: "Zwei Rollen gleichzeitig. Nur Materialien mit ähnlicher Temperatur zusammen trocknen, sonst nach dem empfindlicheren richten." },
  { id: "auslass", name: "Filament-Auslass", f: [192, 2, 56, 58], b: [220, 46], text: "Durch die Öffnung oben in der Mitte kann direkt aus dem Trockner gedruckt werden. Gut für TPU und PETG bei langen Drucken." },
];
// Werte im Display passend zur Rolle (r), sonst PETG als Beispiel
function trocknerWerte(r) {
  const t = r ? wert(r, "tr_temp").v : null, d = r ? wert(r, "tr_dauer").v : null, f = r ? wert(r, "tr_feuchte").v : null;
  const soll = t != null ? t : 65, std = d != null ? d : 6, ziel = f != null ? f : 15;
  const rest = Math.max(0, Math.round(std * 60) - 20);
  const mat = r && r.material ? String(r.material) : "PETG";
  return { material: mat.length > 6 ? mat.slice(0, 6) : mat, feuchte: `${Math.max(1, ziel - 3)} %`, soll: `${soll}°`, ist: `${Math.max(20, soll - 2)}°`,
    zeit: `${String(Math.floor(rest / 60)).padStart(2, "0")}:${String(rest % 60).padStart(2, "0")}` };
}
function trocknerSvg(aktiv, r) {
  const l = 'stroke="#8da49a" stroke-width="1.5" fill="none"';
  const w = trocknerWerte(r);
  const spule = (cx) => `<circle cx="${cx}" cy="110" r="54" stroke="#ffb547" stroke-width="2" fill="rgba(255,181,71,.08)"/>
    <circle cx="${cx}" cy="110" r="40" stroke="#ffb547" stroke-opacity=".5" fill="none"/><circle cx="${cx}" cy="110" r="10" fill="#ffb547" opacity=".6"/>`;
  return `<svg viewBox="0 0 440 290" class="trockner-bild" role="img" aria-label="Zeichnung Sovol Filament-Trockner">
    <rect x="20" y="20" width="400" height="250" rx="22" ${l}/>
    <rect x="34" y="32" width="372" height="160" rx="14" stroke="#5cc8ff" stroke-opacity=".4" stroke-width="1.4" fill="rgba(92,200,255,.05)"/>
    ${spule(130)}${spule(310)}
    <!-- Auslass oben in der Mitte, Filament von der rechten Rolle -->
    <path d="M310 56 Q300 30 220 28 V6" stroke="#ffb547" stroke-width="2" fill="none"/>
    <rect x="210" y="8" width="20" height="14" rx="4" stroke="#8da49a" stroke-width="1.5" fill="#0b1210" class="tr-auslass"/><circle cx="220" cy="15" r="3" fill="#ffb547"/>
    <rect x="60" y="206" width="330" height="54" rx="10" fill="rgba(0,0,0,.35)" stroke="#3ee6a8" stroke-opacity=".5"/>
    ${TROCKNER_BEREICHE.map((b) => `<g class="p1s-punkt ${aktiv === b.id ? "an" : ""}" data-aktion="hi-tr" data-id="${b.id}" tabindex="0">
      <rect x="${b.f[0]}" y="${b.f[1]}" width="${b.f[2]}" height="${b.f[3]}" rx="${b.id === "spulen" ? 14 : 8}" class="p1s-flaeche"/>
      <circle cx="${b.b[0]}" cy="${b.b[1]}" r="9" class="p1s-ring"/><text x="${b.b[0]}" y="${b.b[1]}" text-anchor="middle" dominant-baseline="central">${TROCKNER_BEREICHE.indexOf(b) + 1}</text></g>`).join("")}
    ${TROCKNER_BEREICHE.filter((b) => b.x).map((b) => `<text x="${b.x}" y="${TR_TEXT_Y}" class="tr-wert" data-wert="${b.id}" text-anchor="middle" dominant-baseline="central">${esc(w[b.id])}</text>`).join("")}
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

// ---------------------------------------------------------------------------
// v0.12 Hilfe: zwei Spulen trocknen, Konstruktion, Slicer-Lexikon, Druckplatten
// ---------------------------------------------------------------------------

// ---- Trockner mit zwei Plätzen ----
// Sovol heizt höchstens auf 70 °C. „ideal“ = Wert, den das Material eigentlich bräuchte.
const TROCKNER_MAX = 70;
const TROCKNEN_MATERIALIEN = [
  { id: "PLA", name: "PLA", ...TROCKNEN.PLA },
  { id: "WOOD", name: "Wood-PLA", ...TROCKNEN.PLA, tr_temp: 45 },
  { id: "PETG", name: "PETG", ...TROCKNEN.PETG },
  { id: "TPU", name: "TPU", ...TROCKNEN.TPU },
  { id: "ASA", name: "ASA", ...TROCKNEN.ASA },
  { id: "ABS", name: "ABS", ...TROCKNEN.ABS },
  { id: "PC", name: "PC", ...TROCKNEN.PC },
  { id: "PA", name: "PA / Nylon", tr_temp: 70, tr_dauer: 12, tr_feuchte: 10, ideal: 80 },
];
// Ab mehr als diesem Abstand lohnt sich ein gemeinsamer Lauf nicht mehr
const TROCKNEN_GRENZE = 15;

// Zwei Plätze zusammenführen. a/b = { name, material, temp, dauer, feuchte, ideal?, id? } oder null.
// Ergebnis: modus (leer|einzeln|zusammen|getrennt), laeufe [{ temp, dauer, feuchte, material, name, plaetze }], hinweise [{ art, text }]
function trocknenKombi(a, b) {
  const hinweise = [];
  const lauf = (x, plaetze) => ({ temp: Math.min(TROCKNER_MAX, x.temp), dauer: x.dauer, feuchte: x.feuchte, material: x.material, name: x.name, plaetze });
  const zuHeiss = (x) => {
    if (x.ideal && x.ideal > TROCKNER_MAX) hinweise.push({ art: "amber", text: `${x.name} bräuchte eigentlich ${x.ideal} °C. Der Sovol schafft nur ${TROCKNER_MAX} °C: lieber etwas länger trocknen und direkt aus dem Trockner drucken.` });
  };
  if (!a && !b) return { modus: "leer", laeufe: [], hinweise };
  if (!a || !b) {
    const x = a || b;
    zuHeiss(x);
    return { modus: "einzeln", laeufe: [lauf(x, [a ? 1 : 2])], hinweise };
  }
  zuHeiss(a); zuHeiss(b);
  if (a.id && a.id === b.id) hinweise.push({ art: "rot", text: "Dieselbe Rolle steht in beiden Plätzen. Wähle für einen Platz eine andere Rolle." });
  const [kalt, warm] = a.temp <= b.temp ? [a, b] : [b, a];
  const nr = (x) => (x === a ? 1 : 2);
  const abstand = warm.temp - kalt.temp;
  if (abstand > TROCKNEN_GRENZE) {
    hinweise.push({ art: "rot", text: `${kalt.name} (${kalt.temp} °C) und ${warm.name} (${warm.temp} °C) liegen ${abstand} °C auseinander. Bei ${warm.temp} °C wird ${kalt.name} weich und die Windungen verkleben, bei ${kalt.temp} °C wird ${warm.name} kaum trocken. Besser zwei Läufe nacheinander.` });
    hinweise.push({ art: "mint", text: "Die zuerst getrocknete Rolle warm in einen Beutel mit Trockenmittel packen, bis die zweite fertig ist." });
    return { modus: "getrennt", laeufe: [lauf(kalt, [nr(kalt)]), lauf(warm, [nr(warm)])], hinweise };
  }
  // Gemeinsam: Temperatur der empfindlicheren Rolle, Zeit der längeren.
  // Wer unter seinem Richtwert trocknet, braucht etwas länger.
  const laenger = Math.max(a.dauer, b.dauer);
  const plus = abstand >= 10 ? 2 : abstand >= 5 ? 1 : 0;
  if (plus) hinweise.push({ art: "amber", text: `${warm.name} trocknet bei ${kalt.temp} °C, also ${abstand} °C unter seinem Richtwert, darum ${plus} h mehr als die längere Zeit (${zahl(laenger, laenger % 1 ? 1 : 0)} h).${abstand >= 10 ? ` Knistert ${warm.name} sehr stark, lieber getrennt trocknen.` : ""}` });
  else hinweise.push({ art: "mint", text: "Passt gut zusammen: beide Rollen trocknen fast bei derselben Temperatur." });
  hinweise.push({ art: "mint", text: `Temperatur der empfindlicheren Rolle (${kalt.name}), Zeit der längeren, Feuchteziel der anspruchsvolleren.` });
  return { modus: "zusammen", laeufe: [{ temp: Math.min(TROCKNER_MAX, kalt.temp), dauer: laenger + plus, feuchte: Math.min(a.feuchte, b.feuchte), material: kalt.material, name: kalt.name, plaetze: [1, 2] }], hinweise };
}

// Trockner-Display für ein Ergebnis: gleiche Form wie die große Zeichnung, Spulen in Rollenfarbe.
// w = Lauf, plaetze = [{ farbe } | null, …], aktiv = Plätze, die in diesem Lauf trocknen, frei = Text für den anderen Platz
function trocknerKombiSvg(w, plaetze, aktiv, frei = "danach") {
  const l = 'stroke="#8da49a" stroke-width="1.5" fill="none"';
  const spule = (cx, p, nr) => {
    if (!p || !aktiv.includes(nr)) return `<circle cx="${cx}" cy="110" r="54" stroke="#5d726a" stroke-width="1.5" stroke-dasharray="5 5" fill="none"/>
      <text x="${cx}" y="110" class="tr-kombi-leer" text-anchor="middle" dominant-baseline="central">${p ? frei : "leer"}</text>`;
    const klar = !p.farbe || p.farbe === "transparent";
    return `<circle cx="${cx}" cy="110" r="54" stroke="#ffb547" stroke-width="2" fill="rgba(255,181,71,.08)"/>
      <circle cx="${cx}" cy="110" r="44" fill="${klar ? "#cfe9df" : esc(p.farbe)}" opacity="${klar ? 0.2 : 0.85}" stroke="rgba(255,255,255,.25)"/>
      <circle cx="${cx}" cy="110" r="14" fill="#0b1210" stroke="#ffb547" stroke-opacity=".6"/>
      <text x="${cx}" y="110" class="tr-kombi-nr" text-anchor="middle" dominant-baseline="central">${nr}</text>`;
  };
  const mat = String(w.material || "").slice(0, 6);
  const min = Math.round(w.dauer * 60);
  const zeit = `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
  const werte = [[92, mat, "Material"], [162, `< ${w.feuchte} %`, "Feuchte"], [232, `${w.temp}°`, "Soll"], [296, "--", "Ist"], [360, zeit, "Zeit"]];
  return `<svg viewBox="0 0 440 290" class="tr-kombi-bild" role="img" aria-label="Trockner-Display: ${esc(mat)}, ${w.temp} Grad, ${zeit} Stunden">
    <rect x="20" y="20" width="400" height="250" rx="22" ${l}/>
    <rect x="34" y="32" width="372" height="160" rx="14" stroke="#5cc8ff" stroke-opacity=".4" stroke-width="1.4" fill="rgba(92,200,255,.05)"/>
    ${spule(130, plaetze[0], 1)}${spule(310, plaetze[1], 2)}
    <rect x="60" y="206" width="330" height="54" rx="10" fill="rgba(0,0,0,.35)" stroke="#3ee6a8" stroke-opacity=".5"/>
    ${werte.map(([x, t, n]) => `<text x="${x}" y="225" class="tr-wert" data-kombi="${n}" text-anchor="middle" dominant-baseline="central">${esc(t)}</text>
      <text x="${x}" y="247" class="tr-kombi-name" text-anchor="middle" dominant-baseline="central">${n}</text>`).join("")}
  </svg>`;
}

// ---- Konstruktion: Zeichnungen (120 × 80, gleicher Stil wie die Fehlerbilder) ----
const KN_M = "#3ee6a8", KN_R = "#ff6b6b", KN_A = "#ffb547", KN_L = "#8da49a", KN_F = "rgba(62,230,168,.16)", KN_D = "#0b1210";
const knBild = (inhalt) => `<svg viewBox="0 0 120 80" class="kn-bild" aria-hidden="true">${inhalt}</svg>`;
const knTxt = (x, y, t, farbe = KN_L, groesse = 8) => `<text x="${x}" y="${y}" fill="${farbe}" font-size="${groesse}" font-family="ui-monospace, monospace" text-anchor="middle">${t}</text>`;
const KN_BETT = `<rect x="0" y="70" width="120" height="10" fill="#2a3330"/>`;
const KN_BILD = {
  passungen: knBild(`<rect x="22" y="12" width="76" height="56" rx="6" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.4"/>
    <circle cx="60" cy="40" r="19" fill="${KN_D}" stroke="${KN_M}" stroke-width="1.2"/><circle cx="60" cy="40" r="15.5" fill="${KN_A}" opacity=".85"/>
    <path d="M75.5 40 H79" stroke="#fff" stroke-width="1.4"/><path d="M86 26 L79 37" stroke="${KN_L}" stroke-width=".8"/>${knTxt(98, 24, "Spalt", KN_L, 7)}`),
  tropfen: knBild(`${[18, 26, 34, 42, 50, 58, 66].map((y) => `<path d="M14 ${y} H106" stroke="${KN_M}" stroke-opacity=".2"/>`).join("")}
    <rect x="14" y="12" width="92" height="58" rx="4" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/>
    <path d="M60 22.2 L69.9 32.1 A14 14 0 1 1 50.1 32.1 Z" fill="${KN_D}" stroke="${KN_M}" stroke-width="1.4"/>
    <circle cx="60" cy="42" r="14" fill="none" stroke="${KN_R}" stroke-dasharray="2 2" opacity=".7"/>${knTxt(86, 28, "45°", KN_A)}${knTxt(110, 78, "Z↑", KN_L, 7)}`),
  einsaetze: knBild(`<path d="M14 72 H106 V28 H72 V54 H48 V28 H14 Z" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/>
    <rect x="51" y="5" width="18" height="18" rx="1.5" fill="${KN_A}"/>${[9, 13, 17, 21].map((y) => `<path d="M51 ${y} l18 -2" stroke="#7a5200" stroke-width="1"/>`).join("")}
    <path d="M60 25 V30" stroke="${KN_A}" stroke-width="1.2"/><path d="M57 27 l3 3 3 -3" stroke="${KN_A}" fill="none"/>
    <path d="M48 62 H72" stroke="${KN_L}"/>${knTxt(60, 70, "Ø Loch", KN_L, 7)}<path d="M80 28 V54" stroke="${KN_L}"/><path d="M77 28 H83 M77 54 H83" stroke="${KN_L}"/>${knTxt(94, 44, "L+1", KN_L, 7)}`),
  schrauben: knBild(`<rect x="16" y="14" width="88" height="22" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/><rect x="16" y="38" width="88" height="34" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/>
    <rect x="52" y="14" width="16" height="22" fill="${KN_D}"/><rect x="56.5" y="38" width="7" height="26" fill="${KN_D}"/>
    <rect x="49" y="4" width="22" height="10" rx="2" fill="${KN_A}"/><rect x="56" y="14" width="8" height="46" fill="${KN_A}" opacity=".9"/>
    ${[18, 24, 30, 36, 42, 48, 54].map((y) => `<path d="M56 ${y} l8 2" stroke="#7a5200"/>`).join("")}${knTxt(33, 28, "Durchg.", KN_L, 7)}${knTxt(33, 58, "Kern", KN_L, 7)}`),
  magnete: knBild(`<rect x="14" y="34" width="92" height="38" rx="3" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/><rect x="38" y="34" width="44" height="11" fill="${KN_D}" stroke="${KN_M}"/>
    <rect x="40" y="10" width="40" height="10" rx="2" fill="#b8c4bf"/><rect x="40" y="10" width="20" height="10" rx="2" fill="${KN_R}" opacity=".85"/>${knTxt(50, 18, "N", "#fff", 7)}${knTxt(70, 18, "S", KN_D, 7)}
    <path d="M60 23 V30" stroke="${KN_L}"/><path d="M57 27 l3 3 3 -3" stroke="${KN_L}" fill="none"/>${knTxt(98, 28, "+0,15", KN_A, 7)}`),
  muttern: knBild(`<rect x="14" y="6" width="92" height="60" rx="4" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/>
    <polygon points="60,16 77.3,26 77.3,46 60,56 42.7,46 42.7,26" fill="${KN_D}" stroke="${KN_M}" stroke-width="1.2"/>
    <polygon points="60,19 74.7,27.5 74.7,44.5 60,53 45.3,44.5 45.3,27.5" fill="${KN_A}" opacity=".85"/><circle cx="60" cy="36" r="6" fill="${KN_D}"/>
    <path d="M42.7 61 H77.3" stroke="${KN_L}"/><path d="M42.7 58 V64 M77.3 58 V64" stroke="${KN_L}"/>${knTxt(60, 76, "SW + 0,2", KN_A, 7)}`),
  ueberhang: knBild(`${KN_BETT}<path d="M14 70 V40 L44 10 H58 V70 Z" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.4"/>
    <path d="M66 70 V44 L106 34 V42 L74 70 Z" fill="rgba(255,107,107,.15)" stroke="${KN_R}" stroke-width="1.4"/>
    <path d="M14 22 V40" stroke="${KN_L}" stroke-dasharray="2 2"/><path d="M14 28 A12 12 0 0 1 22.5 31.5" fill="none" stroke="${KN_A}" stroke-width="1.2"/>
    ${knTxt(34, 62, "45° ✓", KN_M)}${knTxt(96, 62, "✗", KN_R, 12)}`),
  bruecken: knBild(`${KN_BETT}<rect x="14" y="26" width="16" height="44" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/><rect x="90" y="26" width="16" height="44" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/>
    <rect x="14" y="20" width="92" height="6" fill="${KN_M}" opacity=".85"/><path d="M30 26 Q60 42 90 26" stroke="${KN_R}" stroke-dasharray="3 2" fill="none"/>
    <path d="M32 56 H88" stroke="${KN_L}"/><path d="M32 53 V59 M88 53 V59" stroke="${KN_L}"/>${knTxt(60, 52, "≤ 20 mm", KN_A)}`),
  fasen: knBild(`${KN_BETT}<path d="M10 70 V22 H52 V62 L44 70 Z" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.4"/>
    <path d="M68 70 V22 H110 V58 Q110 70 98 70 Z" fill="rgba(255,107,107,.12)" stroke="${KN_R}" stroke-width="1.4"/>${knTxt(31, 48, "Fase ✓", KN_M)}${knTxt(89, 44, "Radius", KN_R)}${knTxt(89, 56, "✗", KN_R, 10)}`),
  waende: knBild(`<rect x="10" y="18" width="100" height="44" rx="4" fill="none" stroke="${KN_L}" stroke-dasharray="3 3"/>
    ${[0, 1, 2].map((i) => `<ellipse cx="${36 + i * 24}" cy="38" rx="12" ry="7" fill="${i === 0 ? KN_A : KN_M}" opacity="${i === 0 ? 0.9 : 0.75}"/>`).join("")}
    <path d="M24 54 H96" stroke="${KN_L}"/><path d="M24 51 V57 M96 51 V57" stroke="${KN_L}"/>${knTxt(60, 72, "3 × Linienbreite", KN_L, 7)}`),
  details: knBild(`${KN_BETT}<rect x="14" y="30" width="14" height="40" fill="${KN_M}" opacity=".8"/><rect x="40" y="30" width="7" height="40" fill="${KN_M}" opacity=".8"/>
    <rect x="62" y="30" width="3.5" height="40" fill="${KN_A}" opacity=".9"/><rect x="84" y="30" width="1.5" height="40" fill="${KN_R}"/>
    ${knTxt(21, 24, "2", KN_L, 7)}${knTxt(43.5, 24, "1", KN_L, 7)}${knTxt(64, 24, "0,5", KN_A, 7)}${knTxt(85, 24, "0,2", KN_R, 7)}${knTxt(106, 52, "mm", KN_L, 7)}`),
  schichten: knBild(`${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="30" y="${13 + i * 9}" width="60" height="8" rx="3" fill="${KN_M}" opacity=".7"/>`).join("")}
    <path d="M16 39 H27 M93 39 H104" stroke="${KN_M}" stroke-width="2"/><path d="M20 35 l-4 4 4 4 M100 35 l4 4 -4 4" stroke="${KN_M}" stroke-width="2" fill="none"/>
    <path d="M60 2 V10 M60 69 V77" stroke="${KN_R}" stroke-width="2"/><path d="M56 6 l4 -4 4 4 M56 73 l4 4 4 -4" stroke="${KN_R}" stroke-width="2" fill="none"/>
    <path d="M34 39.5 l7 -2 7 2 7 -2 7 2" stroke="${KN_R}" stroke-width="1.4" fill="none"/>`),
  ausrichtung: knBild(`${KN_BETT}<path d="M8 70 V58 H48 V70 Z M8 58 V36 H18 V58" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.3"/>
    ${knTxt(34, 46, "✓", KN_M, 12)}<path d="M70 70 H80 V18 H70 Z M80 70 H106 V60 H80" fill="rgba(255,107,107,.12)" stroke="${KN_R}" stroke-width="1.3"/>
    ${[28, 36, 44, 52].map((y) => `<path d="M70 ${y} H80" stroke="${KN_R}" stroke-opacity=".5"/>`).join("")}${knTxt(96, 44, "✗", KN_R, 12)}`),
  schnapp: knBild(`<rect x="10" y="50" width="40" height="22" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/>
    <path d="M40 50 V18 L48 12 H52 V50 Z" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.2"/><path d="M48 12 L58 18 L52 24 Z" fill="${KN_M}" opacity=".8"/>
    <path d="M52 50 q0 -4 4 -4" stroke="${KN_A}" stroke-width="1.4" fill="none"/>${knTxt(88, 30, "L ≥ 5 × t", KN_A)}${knTxt(88, 44, "liegend", KN_L, 7)}${knTxt(88, 54, "drucken", KN_L, 7)}`),
  gewinde: knBild(`<rect x="34" y="8" width="52" height="12" rx="2" fill="${KN_A}"/>
    <path d="M42 20 ${[0, 1, 2, 3, 4, 5, 6].map((i) => `L36 ${24 + i * 7} L42 ${27.5 + i * 7}`).join(" ")} L42 72 H78 ${[6, 5, 4, 3, 2, 1, 0].map((i) => `L78 ${27.5 + i * 7} L84 ${24 + i * 7}`).join(" ")} L78 20 Z" fill="${KN_A}" opacity=".8"/>
    ${knTxt(104, 48, "≥ M8", KN_M, 8)}`),
  warping: knBild(`${KN_BETT}<rect x="24" y="18" width="72" height="44" rx="8" fill="${KN_F}" stroke="${KN_M}" stroke-width="1.4"/>
    ${[[24, 18], [96, 18], [24, 62], [96, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="rgba(255,181,71,.12)" stroke="${KN_A}" stroke-width="1.2"/>`).join("")}${knTxt(60, 44, "R ≥ 3", KN_M)}`),
};

// Konstruktionstipps für FDM (Werte für den P1S mit 0,4-mm-Düse, gut kalibriert).
// werte: [Bezeichnung, Wert]; dyn: Tabelle wird aus Corins Inventar berechnet (hilfe.js)
const KN_GRUPPEN = [["alle", "Alle"], ["passung", "Passungen & Löcher"], ["verbindung", "Verbinden"], ["geometrie", "Form & Überhänge"], ["festigkeit", "Festigkeit & Ausrichtung"]];
const KONSTRUKTION = [
  { id: "passungen", g: "passung", titel: "Passungen und Toleranzen", kurz: "Wie viel Spalt zwei Teile brauchen",
    punkte: ["Der Spalt gilt pro Seite: eine Welle mit 10 mm Ø braucht für eine Schiebepassung ein Loch mit 10,3–10,4 mm.",
      "Senkrechte Löcher drucken etwa 0,1–0,2 mm zu klein, weil die Düse in Kurven nach innen drückt. Dafür gibt es in Bambu Studio die X-Y-Loch-Kompensation.",
      "Einmal einen Toleranztest (Stufen 0,1 / 0,2 / 0,3 mm) mit deinem Material drucken, dann kennst du deine Werte.",
      "PETG und TPU brauchen etwas mehr Spalt als PLA, weil sie weicher fließen und leicht Fäden ziehen."],
    werte: [["Presspassung (hält ohne Kleber)", "0 – 0,05 mm"], ["Feste Passung (mit Druck fügen)", "0,1 mm"], ["Schiebepassung (läuft leicht)", "0,15 – 0,2 mm"],
      ["Spielpassung (locker, Deckel)", "0,3 mm"], ["Print-in-Place (Scharnier im Druck)", "0,3 – 0,5 mm"], ["Senkrechter Spalt (Z)", "≥ 1 Schichthöhe, besser 2"]] },
  { id: "tropfen", g: "passung", titel: "Liegende Löcher: Tropfenform", kurz: "Waagrechte Löcher ohne Stützen",
    punkte: ["Ein liegendes Loch hat oben einen flachen Überhang, der durchhängt. Ab etwa 5–6 mm Ø wird es oben unrund.",
      "Lösung: die Oberseite als 45°-Spitze ausführen (Tropfen) oder oben flach abschneiden, sodass eine kurze Brücke entsteht.",
      "Die Spitze zeigt immer nach oben (+Z), also bei der Konstruktion die spätere Druckrichtung beachten.",
      "Für Achsen und Schrauben ist die Tropfenspitze egal: sie liegen unten und an den Seiten an."],
    werte: [["Bis Ø 5 mm", "rund geht meist"], ["Ab Ø 6 mm", "Tropfen 45° oder flache Decke"], ["Senkrechte Löcher", "immer am genauesten"]] },
  { id: "einsaetze", g: "verbindung", titel: "Gewindeeinsätze (Einschmelzmuttern)", kurz: "Lochmaß für deine Messing-Einsätze", dyn: "einsatz",
    punkte: ["Loch-Ø etwas kleiner als der Außen-Ø der Rändelung: Startwert Außen-Ø − 0,5 mm. Mit einem Teststreifen ±0,1 mm prüfen.",
      "Lochtiefe = Länge des Einsatzes + 1 mm, damit verdrängtes Material Platz hat.",
      "Oben eine kleine Fase (0,5 mm) erleichtert das Ansetzen. Um den Einsatz mindestens 1,5–2 mm Wand, im Slicer 4 Wandlinien.",
      "Lötkolben: PLA etwa 210–230 °C, PETG 230–250 °C, ASA 240–260 °C. Senkrecht und langsam eindrücken, nicht drehen.",
      "Den Rechner oben nutzen: er zeigt die Maße für deine Einsätze aus dem Inventar."] },
  { id: "schrauben", g: "verbindung", titel: "Schrauben: Durchgangs- und Kernlöcher", kurz: "Loch für durchgesteckte und eingedrehte Schrauben", dyn: "schraube",
    punkte: ["Durchgangsloch: Normmaß (mittel) + 0,2 mm, weil gedruckte Löcher kleiner werden.",
      "Direkt in Kunststoff schrauben: Kernloch etwa 0,8 × Gewinde-Ø. Hält für wenige Montagen, besser sind Einsätze oder Muttern.",
      "Für Zylinderköpfe eine Senkung mit Kopf-Ø + 0,5 mm vorsehen. Liegt die Senkung unten, mit einer Opferschicht (0,2 mm) drucken und danach durchstechen.",
      "Um Schraubenlöcher mindestens 3 Wandlinien, damit die Schraube nicht in die Füllung schneidet."] },
  { id: "magnete", g: "verbindung", titel: "Magnettaschen", kurz: "Taschen für deine Magnete", dyn: "magnet",
    punkte: ["Tasche: Magnet-Ø + 0,1–0,2 mm, Tiefe: Magnetdicke + 0,1–0,2 mm. Für Presssitz + 0,1, für Kleber + 0,2.",
      "Eingeschlossene Magnete: Druck in Bambu Studio an der Schicht über der Tasche anhalten (Pause), Magnete einlegen, weiterdrucken. Polung vorher markieren!",
      "Über der Tasche mindestens 0,4–0,6 mm (2–3 Schichten) Material, sonst bricht die Decke durch.",
      "Magnete verlieren ab etwa 80 °C dauerhaft Kraft. Kein Problem beim Drucken, aber nicht auf ein heißes Bett legen."] },
  { id: "muttern", g: "verbindung", titel: "Sechskant-Muttertaschen", kurz: "Muttern sicher einlassen", dyn: "mutter",
    punkte: ["Tasche: Schlüsselweite (über die flachen Seiten) + 0,2–0,3 mm, Tiefe: Mutternhöhe + 0,2 mm.",
      "Waagrechte Mutter im Druck: eine flache Seite nach oben legen, dann ist die Decke eine kurze Brücke.",
      "Seitlich einschiebbare Muttern (Schlitz) halten beim Schrauben gut und lassen sich tauschen.",
      "Senkrecht über einer Mutter: erst die Tasche, darüber eine Opferschicht, damit das Schraubenloch sauber druckt."] },
  { id: "ueberhang", g: "geometrie", titel: "Überhänge: die 45°-Regel", kurz: "Was ohne Stützen geht",
    punkte: ["Bis 45° zur Senkrechten druckt jede Schicht noch zur Hälfte auf der vorherigen. Mit gutem Lüfter gehen beim P1S mit PLA oft 55–60°.",
      "Steilere Überhänge mit Fasen oder einem Stützwinkel konstruieren statt Stützen zu drucken.",
      "Rundungen auf der Unterseite werden zum Ende hin flach. Eine 45°-Fase am Ende hilft.",
      "PETG, ASA und TPU vertragen weniger Überhang als PLA, weil sie mit weniger Lüfter gedruckt werden."],
    werte: [["PLA", "bis 50–60°"], ["PETG", "bis 45°"], ["ASA / ABS", "bis 40–45°"], ["TPU", "bis 35–40°"]] },
  { id: "bruecken", g: "geometrie", titel: "Brücken", kurz: "Frei gespannte Strecken zwischen zwei Stützen",
    punkte: ["Eine Brücke spannt sich zwischen zwei Auflagen. Kurze Brücken sind kein Problem, die erste Schicht hängt leicht durch.",
      "Brücken möglichst gerade halten. Geschlossene Ringe (Decke über einem Loch) überbrückt Bambu Studio in Streifen.",
      "Für saubere Brücken: Lüfter 100 %, langsam (Überbrückung 25–50 mm/s), Material trocken.",
      "Lange Brücken mit einer Mittelstütze im Modell teilen, das ist oft schneller als Stützstrukturen."],
    werte: [["PLA", "bis 20–30 mm gut"], ["PETG", "bis 10–15 mm"], ["ASA / ABS", "bis 10 mm"]] },
  { id: "fasen", g: "geometrie", titel: "Fasen statt Rundungen unten", kurz: "Gegen Elefantenfuß und Überhänge",
    punkte: ["Unten am Bett eine 45°-Fase (0,4–1 mm) statt einer Rundung: die Rundung beginnt als flacher Überhang direkt über dem Bett.",
      "Die Fase gleicht auch den Elefantenfuß aus: die erste Schicht wird breit gedrückt, das Teil passt trotzdem.",
      "Rundungen sind oben und an senkrechten Kanten in Ordnung, dort sehen sie sogar besser aus als Fasen.",
      "Löcher, die unten am Bett liegen, ebenfalls leicht anfasen: sie werden durch den Elefantenfuß sonst zu eng."],
    werte: [["Fase am Bett", "0,4 – 1 mm × 45°"], ["Rundungen", "oben / senkrecht frei wählbar"]] },
  { id: "waende", g: "festigkeit", titel: "Wandstärke = Vielfache der Linienbreite", kurz: "Wände ohne Lücken planen",
    punkte: ["Der Slicer füllt eine Wand mit ganzen Linien. Passt die Stärke nicht, entsteht eine schmale Lücke oder eine Füllung im Zickzack.",
      "Faustregel: mindestens 2 Linien, für Funktionsteile 3–4 Linien. Den Rechner oben für deine Düse nutzen.",
      "Bambu Studio (Wandgenerator Arachne) passt Linienbreiten an, trotzdem sind ganze Vielfache stabiler und schneller.",
      "Dünne Rippen lieber etwas dicker als zu dünn: Festigkeit kommt beim FDM-Druck vor allem von den Wänden."] },
  { id: "details", g: "geometrie", titel: "Kleinste Details", kurz: "Was mit der Düse noch druckbar ist",
    punkte: ["In XY ist die kleinste Wand etwa eine Linienbreite (0,4-mm-Düse: rund 0,45 mm), stabil wird es ab 2 Linien.",
      "In Z ist die Schichthöhe die kleinste Stufe. Höhen besser als Vielfache der Schichthöhe planen.",
      "Erhabene Schrift: Strichstärke ≥ 0,5 mm (besser 0,8), Höhe ≥ 0,4 mm. Vertiefte Schrift: ≥ 0,6 mm breit, 0,4–0,6 mm tief.",
      "Kleine Stifte unter 2 mm Ø brechen leicht ab und schmelzen beim Druck, weil die Schicht keine Zeit zum Abkühlen hat."],
    werte: [["0,2-mm-Düse", "Details ab 0,25 mm"], ["0,4-mm-Düse", "Details ab 0,45 mm"], ["0,6-mm-Düse", "Details ab 0,65 mm"]] },
  { id: "schichten", g: "festigkeit", titel: "Schichtrichtung und Festigkeit", kurz: "Teile sind zwischen den Schichten am schwächsten",
    punkte: ["Gedruckte Teile sind nicht in alle Richtungen gleich fest: zwischen den Schichten (Z) halten sie nur etwa 50–70 % der Festigkeit in XY.",
      "Die Hauptlast soll entlang der Schichten laufen, nicht die Schichten auseinanderziehen.",
      "Mehr Wände helfen mehr als mehr Füllung. Höhere Düsentemperatur und weniger Lüfter verbessern die Schichthaftung.",
      "Haken, Halter und Clips daher liegend drucken, nicht stehend."] },
  { id: "ausrichtung", g: "festigkeit", titel: "Druckausrichtung", kurz: "Wie das Teil auf dem Bett liegt",
    punkte: ["Größte flache Seite nach unten: beste Haftung, kaum Stützen.",
      "Runde Löcher senkrecht stellen, dann werden sie wirklich rund und maßhaltig.",
      "Sichtflächen nach oben oder zur Seite, die Unterseite übernimmt die Struktur der Platte.",
      "Belastung entlang der Schichten (siehe Schichtrichtung). Im Zweifel ein Teil in zwei Teile aufteilen, die jeweils gut liegen."] },
  { id: "schnapp", g: "verbindung", titel: "Schnapphaken", kurz: "Clips, die nicht brechen",
    punkte: ["Biegearm mindestens 5–10 × so lang wie dick, Haken 0,5–1 mm Hinterschnitt.",
      "Immer liegend drucken, damit der Arm entlang der Schichten biegt.",
      "Am Fuß des Arms eine Rundung (Radius ≥ halbe Dicke) gegen Bruch.",
      "PETG und PLA+ verzeihen mehr Biegung als normales PLA, das spröde bricht."],
    werte: [["Länge : Dicke", "≥ 5 : 1, besser 10 : 1"], ["Hinterschnitt", "0,5 – 1 mm"], ["Fügewinkel", "30 – 45°"]] },
  { id: "gewinde", g: "verbindung", titel: "Gedruckte Gewinde", kurz: "Wann Gewinde selbst drucken",
    punkte: ["Gewinde ab etwa M8 lassen sich direkt drucken. Kleinere lieber mit Einsatz, Mutter oder nachschneiden.",
      "Gewinde senkrecht drucken (Achse in Z), mit kleiner Schichthöhe (0,12–0,16 mm).",
      "Spiel 0,2–0,3 mm zwischen Innen- und Außengewinde, Gewindeanfang anfasen.",
      "Für Deckel und Dosen grobe Gewinde (Trapez, 3–4 mm Steigung) verwenden: robust und schnell."],
    werte: [["Kleinstes Gewinde", "≈ M8"], ["Spiel", "0,2 – 0,3 mm"], ["Schichthöhe", "0,12 – 0,16 mm"]] },
  { id: "warping", g: "geometrie", titel: "Verzug und Auflagefläche", kurz: "Große flache Teile ohne hochgezogene Ecken",
    punkte: ["Spitze Ecken heben sich zuerst. Ecken in der Draufsicht runden (Radius ≥ 3 mm).",
      "Bei ASA/ABS und großen PETG-Teilen: Rand (Brim) oder Randohren an den Ecken.",
      "Lange, dünne Teile mit großer Auflage verziehen sich am stärksten. Teilen oder Rippen auf die Oberseite setzen.",
      "Kleine Auflageflächen (Spitzen, Kugeln) unten abflachen, damit genug Fläche das Teil hält."] },
];

// ---- Slicer-Lexikon: Bambu Studio, Namen wie in der deutschen Oberfläche (englisch in Klammern) ----
// Gruppen wie die Reiter in Bambu Studio (Prozess: Qualität, Stärke, Geschwindigkeit, Stützen, Sonstige; dazu Filament).
// ab = Abschnitt im Reiter, was = was es macht, werte = typische Werte (P1S, 0,4-mm-Düse), wann = wann ändern
const LEX_GRUPPEN = [
  { id: "qualitaet", name: "Qualität", en: "Quality", icon: "✨" },
  { id: "staerke", name: "Stärke", en: "Strength", icon: "🧱" },
  { id: "tempo", name: "Geschwindigkeit", en: "Speed", icon: "⚡" },
  { id: "stuetzen", name: "Stützen", en: "Support", icon: "🌲" },
  { id: "sonstige", name: "Sonstige", en: "Others", icon: "🧩" },
  { id: "filament", name: "Filament", en: "Filament", icon: "🧵" },
];
const LEXIKON = [
  // Qualität
  { g: "qualitaet", ab: "Schichthöhe", de: "Schichthöhe", en: "Layer height",
    was: "Höhe jeder gedruckten Schicht. Bestimmt, wie fein Rundungen und Schrägen werden und wie lange der Druck dauert.",
    werte: "0,4-mm-Düse: 0,08 – 0,28 mm. Standard 0,20 mm, fein 0,12 – 0,16 mm. Faustregel 25 – 75 % des Düsen-Ø.",
    wann: "Feiner für Figuren, Schrift und flache Schrägen. Gröber für schnelle, robuste Funktionsteile. Halbe Schichthöhe ≈ doppelte Druckzeit." },
  { g: "qualitaet", ab: "Schichthöhe", de: "Höhe der ersten Schicht", en: "Initial layer height",
    was: "Dicke der ersten Schicht auf der Platte. Eine dickere erste Schicht verzeiht kleine Unebenheiten.",
    werte: "0,2 mm (0,4-mm-Düse), 0,1 mm (0,2-mm-Düse), 0,3 mm (0,6-mm-Düse).",
    wann: "Selten ändern. Bei Haftproblemen eher Platte reinigen als die Höhe anpassen." },
  { g: "qualitaet", ab: "Breite der Linie", de: "Breite der Linie", en: "Line width",
    was: "Wie breit eine gedruckte Linie ist, getrennt für Außenwand, Innenwand, Füllung, Oberfläche und Stützen.",
    werte: "0,4-mm-Düse: Außenwand 0,42 mm, sonst 0,45 mm. Sinnvoll 100 – 120 % des Düsen-Ø.",
    wann: "Breitere Füllung (0,5 mm) macht Teile stabiler und schneller. Schmalere Außenwand für feinste Details. Konstruktion: Wandstärken als Vielfache planen." },
  { g: "qualitaet", ab: "Naht", de: "Nahtposition", en: "Seam position",
    was: "Wo jede Schichtrunde beginnt und endet. An dieser Stelle entsteht eine kleine Naht.",
    werte: "Ausgerichtet (Aligned, Standard), Nächste (Nearest), Rückseite (Back), Zufällig (Random).",
    wann: "Rückseite für Sichtteile mit klarer Vorderseite. Zufällig verteilt die Naht, macht die Oberfläche aber rau. Die Naht lässt sich auch aufmalen." },
  { g: "qualitaet", ab: "Naht", de: "Schrägnaht-Typ", en: "Scarf seam type",
    was: "Lässt Anfang und Ende einer Runde schräg über mehrere Höhenstufen überlappen. Die Naht ist dann kaum zu sehen.",
    werte: "Aus (Standard) oder für Konturen bzw. alle Wände. Dazu Schrägnaht Länge und Starthöhe.",
    wann: "Für runde, glatte Sichtteile wie Vasen, Becher, Zylinder. Kostet etwas Zeit und braucht gut kalibrierten Fluss." },
  { g: "qualitaet", ab: "Präzision", de: "Elefantenfußkompensation", en: "Elephant foot compensation",
    was: "Zieht die erste Schicht etwas nach innen, weil sie beim Andrücken breiter wird als geplant.",
    werte: "0,15 mm (Standard).",
    wann: "Erhöhen (0,2 – 0,25), wenn die Unterkante wulstig ist oder Teile unten nicht passen. Besser zusätzlich eine kleine Fase ins Modell." },
  { g: "qualitaet", ab: "Präzision", de: "X-Y-Loch-Kompensation", en: "X-Y hole compensation",
    was: "Vergrößert (+) oder verkleinert (−) senkrechte Löcher in XY. Gedruckte Löcher werden meist etwas zu klein.",
    werte: "0 mm (Standard). Typisch +0,05 bis +0,15 mm.",
    wann: "Wenn Schrauben, Stifte oder Lager nicht in die Löcher passen. Wirkt nur auf senkrechte Löcher." },
  { g: "qualitaet", ab: "Präzision", de: "Präzise Z-Höhe", en: "Precise Z height",
    was: "Passt die letzten Schichten an, damit die Gesamthöhe genau dem Modell entspricht und nicht auf die Schichthöhe gerundet wird.",
    werte: "Aus (Standard).",
    wann: "Einschalten, wenn die Höhe genau stimmen muss, z. B. bei Teilen, die ineinander gesteckt werden." },
  { g: "qualitaet", ab: "Glätten", de: "Glätten-Typ", en: "Ironing type",
    was: "Die Düse fährt noch einmal heiß und mit sehr wenig Material über die Oberfläche und bügelt sie glatt.",
    werte: "Kein Glätten (Standard), Nur oberste Oberfläche, Alle Oberflächen, Alle soliden Schichten.",
    wann: "Für glatte, flache Deckflächen (Schilder, Deckel). Kostet deutlich Zeit. Nicht bei gewölbten Oberseiten." },
  { g: "qualitaet", ab: "Glätten", de: "Glätten-Fluss", en: "Ironing flow",
    was: "Wie viel Material beim Glätten noch fließt, um feine Rillen zu füllen.",
    werte: "10 % (Standard), sinnvoll 8 – 15 %. Dazu Abstand der Glättlinien 0,1 mm und 20 – 30 mm/s.",
    wann: "Mehr, wenn noch Rillen bleiben. Weniger, wenn sich Wülste bilden oder die Fläche glänzend verschmiert." },
  { g: "qualitaet", ab: "Wandgenerator", de: "Wandgenerator", en: "Wall generator",
    was: "Wie Wände berechnet werden: Klassisch mit fester Linienbreite oder Arachne mit veränderlicher Breite.",
    werte: "Klassisch (Standard) oder Arachne.",
    wann: "Arachne für dünne Stellen, Schrift und spitz zulaufende Teile, dort entstehen keine Lücken. Klassisch für gleichmäßige Außenflächen." },
  { g: "qualitaet", ab: "Erweitert", de: "Reihenfolge der Wände", en: "Order of walls",
    was: "Ob zuerst die inneren oder die äußeren Wände einer Schicht gedruckt werden.",
    werte: "innen/außen (Standard), außen/innen, innen/außen/innen.",
    wann: "außen/innen für genauere Außenmaße und schönere Flächen, aber schlechtere Überhänge. innen/außen/innen als Mittelweg." },
  { g: "qualitaet", ab: "Überhänge", de: "Erkennen von Wandüberhängen", en: "Detect overhang wall",
    was: "Erkennt überhängende Wände und druckt sie langsamer, mit Brückenfluss und mehr Kühlung.",
    werte: "An (Standard).",
    wann: "An lassen. Nur bei Sonderfällen (Spiralvase, Tests) ausschalten." },
  // Stärke
  { g: "staerke", ab: "Wände", de: "Wandlinien", en: "Wall loops",
    was: "Anzahl der Linien in jeder Außenwand. Wände tragen den größten Teil der Festigkeit.",
    werte: "2 (Standard). 3 – 4 für Funktionsteile, 4 – 6 bei Gewinden und Einsätzen.",
    wann: "Erhöhen, wenn Teile brechen oder Schrauben in die Füllung schneiden. Hilft mehr als höhere Fülldichte." },
  { g: "staerke", ab: "Wände", de: "Nur eine Wand auf den oberen Flächen", en: "Only one wall on top surfaces",
    was: "Auf Deckflächen wird nur eine Wandlinie gedruckt, damit mehr Platz für ein sauberes Oberflächenmuster bleibt.",
    werte: "An (Standard).",
    wann: "Aus, wenn auf kleinen Deckflächen Lücken entstehen." },
  { g: "staerke", ab: "Obere/Untere Schichten", de: "Obere Schalenschichten", en: "Top shell layers",
    was: "Anzahl der geschlossenen Schichten oben. Zusammen mit „Dicke der oberen Schale“: es gilt der größere Wert.",
    werte: "5 Schichten bzw. 1,0 mm (Standard bei 0,20 mm).",
    wann: "Erhöhen, wenn die Füllung durchscheint oder die Oberfläche Löcher hat (vor allem bei wenig Fülldichte)." },
  { g: "staerke", ab: "Obere/Untere Schichten", de: "Untere Schalenschichten", en: "Bottom shell layers",
    was: "Anzahl der geschlossenen Schichten unten.",
    werte: "3 Schichten (Standard).",
    wann: "Mehr bei wasserdichten Gefäßen oder dünnen Bodenplatten, die belastet werden." },
  { g: "staerke", ab: "Obere/Untere Schichten", de: "Muster der Oberfläche", en: "Top surface pattern",
    was: "Linienmuster der obersten geschlossenen Schicht.",
    werte: "Monotonische Linie (Standard), Monotonisch, Geradlinig, Konzentrisch und mehr.",
    wann: "Konzentrisch für runde Deckel und Knöpfe. Monotonisch für gleichmäßigen Glanz ohne Streifen." },
  { g: "staerke", ab: "Füllung", de: "Fülldichte", en: "Sparse infill density",
    was: "Wie dicht das Innere gefüllt wird.",
    werte: "15 % (Standard). Deko 5 – 15 %, Funktionsteile 20 – 40 %, stark belastet 40 – 60 %.",
    wann: "Erst Wände erhöhen, dann Füllung. Über 50 % bringt kaum mehr Festigkeit, kostet aber viel Material." },
  { g: "staerke", ab: "Füllung", de: "Füllmuster", en: "Sparse infill pattern",
    was: "Form der inneren Füllung.",
    werte: "Gitternetz (Grid), Gyroid, Kubisch, Adaptiv kubisch, Blitz (Lightning), Bienenwabe u. a. Standard je nach Version Gitternetz oder Kreuzschraffur.",
    wann: "Gyroid: in alle Richtungen gleich fest, gut für PETG und TPU. Blitz: nur als Stütze für Deckflächen, für Deko. Kubisch: stabil und schnell." },
  { g: "staerke", ab: "Füllung", de: "Überlappung Füllung/Wand", en: "Infill/Wall overlap",
    was: "Wie weit die Füllung in die Wand hineinragt, damit beides verbunden ist.",
    werte: "15 % (Standard).",
    wann: "Erhöhen, wenn sich die Füllung von der Wand löst. Zu hoch drückt sich die Füllung außen durch." },
  { g: "staerke", ab: "Erweitert", de: "Sicherstellung der vertikalen Wanddicke", en: "Ensure vertical shell thickness",
    was: "Fügt an schrägen Flächen massive Füllung ein, damit die Wand dort nicht zu dünn wird.",
    werte: "An bzw. „Alle“ (Standard).",
    wann: "An lassen. Nur ausschalten, um bei Deko-Teilen Material zu sparen." },
  // Geschwindigkeit
  { g: "tempo", ab: "Geschwindigkeit der ersten Schicht", de: "Erste Schicht", en: "Initial layer",
    was: "Druckgeschwindigkeit der ersten Schicht. Langsamer = bessere Haftung.",
    werte: "50 mm/s (Standard). Bei Haftproblemen 20 – 30 mm/s, TPU 15 – 20 mm/s.",
    wann: "Wenn die erste Schicht nicht haftet, sich Ecken lösen oder sehr kleine Teile umfallen." },
  { g: "tempo", ab: "Geschwindigkeit der restlichen Schichten", de: "Außenwand", en: "Outer wall",
    was: "Geschwindigkeit der sichtbaren Außenwand. Hat den größten Einfluss auf das Aussehen.",
    werte: "200 mm/s (Standard). Silk, Transparent, Holz: 40 – 120 mm/s.",
    wann: "Langsamer für glänzendere, glattere Oberflächen und weniger Geisterbilder." },
  { g: "tempo", ab: "Geschwindigkeit der restlichen Schichten", de: "Innere Wand", en: "Inner wall",
    was: "Geschwindigkeit der inneren Wandlinien.",
    werte: "300 mm/s (Standard).",
    wann: "Senken, wenn das Material den Volumenstrom nicht schafft (Lücken) oder die Außenwand wellig wird." },
  { g: "tempo", ab: "Geschwindigkeit der restlichen Schichten", de: "Füllung", en: "Sparse infill",
    was: "Geschwindigkeit der inneren Füllung.",
    werte: "270 mm/s (Standard). Wird oft durch die Maximale Volumengeschwindigkeit gebremst.",
    wann: "Senken bei Schichtverschiebung oder wenn die Füllung löchrig ist." },
  { g: "tempo", ab: "Geschwindigkeit der restlichen Schichten", de: "Oberfläche", en: "Top surface",
    was: "Geschwindigkeit der obersten Schicht.",
    werte: "200 mm/s (Standard). Für glatte Deckflächen 60 – 120 mm/s.",
    wann: "Langsamer bei Rillen oder Lücken in der Oberfläche." },
  { g: "tempo", ab: "Geschwindigkeit der restlichen Schichten", de: "Überbrückung", en: "Bridge",
    was: "Geschwindigkeit frei gespannter Linien über Lücken.",
    werte: "50 mm/s (Standard), 25 – 50 mm/s.",
    wann: "Langsamer, wenn Brücken durchhängen oder reißen." },
  { g: "tempo", ab: "Überhanggeschwindigkeit", de: "Verlangsamen bei Überhängen", en: "Slow down for overhang",
    was: "Druckt überhängende Wände je nach Überhang (10 – 25 %, 25 – 50 %, 50 – 75 %, 75 – 100 % der Linienbreite) langsamer.",
    werte: "An. Typisch 0 / 50 / 30 / 10 mm/s für die vier Stufen.",
    wann: "Werte senken, wenn sich Überhänge hochbiegen oder Kanten ausfransen." },
  { g: "tempo", ab: "Beschleunigung", de: "Beschleunigung", en: "Acceleration",
    was: "Wie schnell der Kopf auf Tempo kommt. Für normales Drucken, Außenwand, erste Schicht, Oberfläche getrennt.",
    werte: "Normales Drucken 10 000, Außenwand 5 000, Oberfläche 2 000, erste Schicht 500 mm/s².",
    wann: "Senken bei Schichtverschiebung, Geisterbildern oder hohen, dünnen Teilen, die wackeln." },
  // Stützen
  { g: "stuetzen", ab: "Stützen", de: "Stützstrukturen aktivieren", en: "Enable support",
    was: "Schaltet automatische Stützen unter Überhängen ein.",
    werte: "Aus (Standard).",
    wann: "Wenn Überhänge steiler als etwa 45° oder freie Flächen in der Luft beginnen. Alternativ das Teil drehen oder Fasen konstruieren." },
  { g: "stuetzen", ab: "Stützen", de: "Typ", en: "Type",
    was: "Art der Stützen und ob sie automatisch oder nur an bemalten Stellen entstehen.",
    werte: "Normal (auto), Baum (auto), Normal (manuell), Baum (manuell).",
    wann: "Baum: weniger Material, leichter zu entfernen, gut bei Figuren. Normal: für große, flache Überhänge. Manuell: nur, wo du Stützen aufmalst." },
  { g: "stuetzen", ab: "Stützen", de: "Stil", en: "Style",
    was: "Feinform der Stützen, z. B. bei Baumstützen.",
    werte: "Standard, Baum schlank, Baum stark, Baum-Hybrid, Baum Organisch.",
    wann: "Organisch: lässt sich am leichtesten lösen. Stark: für hohe, schwere Überhänge. Hybrid: Baum mit flachen Stützbereichen." },
  { g: "stuetzen", ab: "Stützen", de: "Schwellenwinkel", en: "Threshold angle",
    was: "Ab welchem Winkel (gemessen von der Waagrechten) keine Stützen mehr nötig sind. Flachere Flächen werden gestützt.",
    werte: "30° (Standard).",
    wann: "Kleiner (20 – 25°) für weniger Stützen bei PLA. Größer (35 – 40°) bei PETG, ASA, TPU." },
  { g: "stuetzen", ab: "Stützen", de: "Nur auf Druckplatte", en: "On build plate only",
    was: "Stützen wachsen nur von der Platte, nicht auf dem Modell selbst.",
    werte: "Aus (Standard).",
    wann: "An, wenn Stützen auf Sichtflächen Spuren hinterlassen würden." },
  { g: "stuetzen", ab: "Erweitert", de: "Oberer Z-Abstand", en: "Top Z distance",
    was: "Abstand zwischen Stütze und Modell in der Höhe. Bestimmt, wie leicht die Stütze abgeht.",
    werte: "0,2 mm (Standard bei 0,2-mm-Schichten). 0,1 – 0,15 für glattere Unterseiten.",
    wann: "Größer, wenn Stützen zu fest sitzen. Kleiner, wenn die Unterseite durchhängt." },
  { g: "stuetzen", ab: "Erweitert", de: "Stützen/Objekt XY-Abstand", en: "Support/object xy distance",
    was: "Seitlicher Abstand zwischen Stütze und Modell.",
    werte: "0,35 mm (Standard).",
    wann: "Größer, wenn Stützen an senkrechten Wänden festkleben." },
  { g: "stuetzen", ab: "Erweitert", de: "Obere Schnittstellschichten", en: "Top interface layers",
    was: "Dichte Schichten oben auf der Stütze, direkt unter dem Modell. Ergeben eine glattere Unterseite.",
    werte: "2 – 3 Schichten.",
    wann: "Mehr für schönere Unterseiten, weniger für leichteres Entfernen." },
  { g: "stuetzen", ab: "Erweitert", de: "Brücken nicht unterstützen", en: "Don't support bridges",
    was: "Kurze Brücken werden nicht gestützt, weil sie frei gedruckt werden können.",
    werte: "An (Standard).",
    wann: "Aus, wenn lange Brücken durchhängen." },
  { g: "stuetzen", ab: "Floß", de: "Floßschichten", en: "Raft layers",
    was: "Druckt erst ein Gitter (Floß) und darauf das Modell.",
    werte: "0 (Standard, kein Floß).",
    wann: "Selten nötig. Bei winzigen Auflageflächen oder starkem Verzug, sonst lieber Rand (Brim)." },
  // Sonstige
  { g: "sonstige", ab: "Druckbetthaftung", de: "Randtyp", en: "Brim type",
    was: "Ein Rand aus Linien rund um das Teil auf der ersten Schicht, damit es besser haftet.",
    werte: "Automatisch (Standard), Keine Umrandung, Nur äußerer Rand, Nur innerer Rand, Äußerer und innerer Rand, Randohren (Brim ears).",
    wann: "Äußerer Rand bei kleinen Auflageflächen, ASA/ABS und hohen Teilen. Randohren nur an den Ecken großer Teile." },
  { g: "sonstige", ab: "Druckbetthaftung", de: "Randbreite", en: "Brim width",
    was: "Wie breit der Rand ist.",
    werte: "5 mm (Standard), 3 – 10 mm.",
    wann: "Breiter bei starkem Verzug, schmaler, wenn er schwer abgeht." },
  { g: "sonstige", ab: "Druckbetthaftung", de: "Lücke zwischen Rand und Objekt", en: "Brim-object gap",
    was: "Abstand zwischen Rand und Teil. Entscheidet, wie leicht sich der Rand abtrennen lässt.",
    werte: "0,1 mm (Standard).",
    wann: "Größer (0,15 – 0,2), wenn der Rand zu fest sitzt und Spuren hinterlässt." },
  { g: "sonstige", ab: "Spezialmodus", de: "Druckreihenfolge", en: "Print sequence",
    was: "Mehrere Teile Schicht für Schicht gemeinsam oder Teil für Teil nacheinander drucken.",
    werte: "Nach Ebene (Standard), Nach Objekt.",
    wann: "Nach Objekt: ein Fehler ruiniert nicht alle Teile und es gibt weniger Fäden. Geht nur mit niedrigen Teilen und genug Abstand." },
  { g: "sonstige", ab: "Spezialmodus", de: "Spiralvase", en: "Spiral vase",
    was: "Druckt nur eine einzige Wand als durchgehende Spirale ohne Naht, ohne Füllung und Deckel.",
    werte: "Aus (Standard).",
    wann: "Für Vasen, Lampenschirme, Becher-Einsätze. Mit 0,6-mm-Düse werden die Wände stabiler." },
  { g: "sonstige", ab: "Spezialmodus", de: "Zeitraffer", en: "Timelapse",
    was: "Kamera-Zeitraffer: normal oder Smooth, bei dem der Kopf für jedes Bild zur Seite fährt.",
    werte: "Normal (Standard), Smooth.",
    wann: "Smooth braucht einen Reinigungsturm und verlängert den Druck. Nur für schöne Videos." },
  { g: "sonstige", ab: "Fuzzy Skin", de: "Fuzzy Skin", en: "Fuzzy Skin",
    was: "Lässt die Düse beim Außenwand-Drucken zufällig zittern. Ergibt eine raue, griffige Oberfläche, die Schichtlinien verdeckt.",
    werte: "Aus (Standard). Fuzzy Skin Stärke 0,3 mm, Punktabstand 0,8 mm.",
    wann: "Für Griffe, Gehäuse und Teile, deren Schichtlinien man nicht sehen soll. Lässt sich auch nur an Stellen aufmalen." },
  { g: "sonstige", ab: "G-Code-Ausgabe", de: "Vermeiden von Wandüberquerungen", en: "Avoid crossing wall",
    was: "Leerfahrten führen um Wände herum statt quer darüber.",
    werte: "Aus (Standard).",
    wann: "An bei Fäden oder Kratzspuren auf Oberflächen. Etwas längere Druckzeit." },
  // Filament
  { g: "filament", ab: "Drucktemperatur", de: "Düsentemperatur", en: "Nozzle temperature",
    was: "Temperatur der Düse für die erste Schicht und die weiteren Schichten.",
    werte: "PLA 210 – 230 °C, PETG 240 – 255 °C, ASA 260 – 270 °C, TPU 220 – 230 °C.",
    wann: "Höher für bessere Schichthaftung und hohe Geschwindigkeit. Niedriger gegen Fäden und Glanzverlust. Mit Temperaturturm finden." },
  { g: "filament", ab: "Drucktemperatur", de: "Druckbetttemperatur", en: "Bed temperature",
    was: "Betttemperatur, getrennt für jede Plattenart (Cool Plate, Engineering, Smooth PEI, Textured PEI).",
    werte: "PLA 55 – 65 °C, PETG 70 °C, ASA/ABS 90 – 100 °C, TPU 35 – 45 °C (Textured PEI).",
    wann: "Höher bei Haftproblemen, niedriger bei Elefantenfuß. Mehr dazu im Reiter Druckplatten." },
  { g: "filament", ab: "Grundlegende Informationen", de: "Flussverhältnis", en: "Flow ratio",
    was: "Multipliziert die geförderte Materialmenge. Gleicht Durchmesser- und Dichteschwankungen aus.",
    werte: "0,95 – 1,0. Bambu PLA 0,98, PETG 0,95.",
    wann: "Kalibrieren bei jeder neuen Marke. Zu hoch: Wülste, raue Oberfläche. Zu niedrig: Lücken." },
  { g: "filament", ab: "Grundlegende Informationen", de: "Pressure Advance aktivieren", en: "Enable pressure advance",
    was: "Gleicht den Druck in der Düse beim Beschleunigen und Bremsen aus (K-Faktor). Sonst werden Ecken dick und Linienanfänge dünn.",
    werte: "PLA 0,02, PETG 0,04, TPU 0 – 0,05. Ermittelt mit der Kalibrierung Flussdynamik.",
    wann: "Kalibrieren bei neuem Material oder wenn Ecken ausbeulen." },
  { g: "filament", ab: "Volumetrische Geschwindigkeitsbegrenzung", de: "Maximale Volumengeschwindigkeit", en: "Max volumetric speed",
    was: "Obergrenze, wie viel mm³ Material pro Sekunde geschmolzen werden. Bremst alle Geschwindigkeiten passend ein.",
    werte: "PLA 15 – 21, PETG 12 – 20 (HF bis 25), ASA 12 – 16, TPU 3 – 4 mm³/s.",
    wann: "Senken bei Lücken trotz richtigem Fluss. Kalibrieren mit dem Max-Volumengeschwindigkeit-Test." },
  { g: "filament", ab: "Kühlung", de: "Lüftergeschwindigkeit", en: "Fan speed",
    was: "Bauteillüfter zwischen Minimum und Maximum, abhängig von der Schichtzeit (Minimale Lüftergeschwindigkeit, Schwellenwert für die maximale Lüftergeschwindigkeit).",
    werte: "PLA 80 – 100 %, PETG 20 – 60 %, ASA/ABS 0 – 30 %, TPU 70 – 100 %.",
    wann: "Mehr für Überhänge und Brücken. Weniger für bessere Schichthaftung und gegen Verzug." },
  { g: "filament", ab: "Kühlung", de: "Verlangsamen für eine bessere Schichtkühlung", en: "Slow printing down for better layer cooling",
    was: "Bremst kleine Schichten, damit jede Schicht Zeit zum Abkühlen hat (bis zur Minimalen Druckgeschwindigkeit).",
    werte: "An (Standard), Schichtdauer ca. 4 – 8 s.",
    wann: "An lassen. Wichtig für kleine Teile und Spitzen, die sonst weich werden." },
  { g: "filament", ab: "Kühlung", de: "Hilfslüfter", en: "Auxiliary part cooling fan",
    was: "Der große Seitenlüfter im P1S. Kühlt zusätzlich von der Seite.",
    werte: "PLA 0 – 70 %, PETG, ASA, ABS 0 %.",
    wann: "Für große Überhänge in PLA. Bei PETG und ASA aus, sonst Verzug und schwache Schichten." },
  { g: "filament", ab: "Kühlung", de: "Zwangskühlung für Überhänge und Brücken", en: "Force cooling for overhang and bridge",
    was: "Lüfter bei Überhängen und Brücken auf den eigenen Wert (Lüftergeschwindigkeit für Überhänge) setzen.",
    werte: "An, 100 % für PLA. Bei PETG 60 – 90 %.",
    wann: "An lassen. Bei ASA nur, wenn Überhänge sonst durchhängen." },
  { g: "filament", ab: "Überschreibung", de: "Rückzugslänge", en: "Retraction length",
    was: "Wie weit das Filament vor Leerfahrten zurückgezogen wird, damit nichts nachläuft.",
    werte: "P1S: 0,8 mm (Standard). PETG 0,8 – 1,2 mm, TPU 0 – 0,4 mm.",
    wann: "Erhöhen in 0,2-mm-Schritten bei Fäden (zuerst trocknen und Temperatur prüfen). Zu viel kann die Düse verstopfen." },
  { g: "filament", ab: "Überschreibung", de: "Z-Hop beim Rückzug", en: "Z hop when retract",
    was: "Hebt die Düse bei Leerfahrten an, damit sie nicht über das Teil kratzt.",
    werte: "0,4 mm (Standard am P1S).",
    wann: "Erhöhen bei Kratzern oder wenn die Düse an hochgebogenen Stellen hängen bleibt. Mehr Z-Hop = mehr Fäden." },
  { g: "filament", ab: "Grundlegende Informationen", de: "Erweichungstemperatur", en: "Softening temperature",
    was: "Ab dieser Temperatur wird das Filament weich. Bambu Studio warnt, wenn Bett oder Kammer wärmer sind (Tür öffnen).",
    werte: "PLA ca. 45 °C, PETG ca. 65 – 70 °C, ASA/ABS ca. 95 – 100 °C.",
    wann: "Nur bei eigenen Filamenten eintragen. Gilt auch als Grenze fürs Trocknen." },
];

// ---- Druckplatten (Namen wie PLATTEN in daten.js; Werte nach dem Bambu-Wiki, P1S-Bett max. 100 °C) ----
const BETT_MAX_P1S = 100;
const PLATTEN_INFO = [
  { id: "cool", name: "Cool Plate/PLA Plate", kurz: "Cool Plate", farbe: "#2b2f31", muster: "glatt",
    text: "Glatte, schwarze Platte für niedrige Betttemperaturen. Gedacht für PLA bei 35–45 °C, wenn die Kammer kühl bleiben soll.",
    gut: ["PLA bei offener Tür und niedrigem Bett", "Glatte, glänzende Unterseiten"],
    pflege: ["Vor jedem Druck dünn Klebestift auftragen: hilft beim Haften und beim Lösen.", "Kleber regelmäßig mit warmem Wasser abwaschen.", "Nicht über 60 °C heizen."],
    vorsicht: "Für PETG, TPU, ASA, ABS nicht geeignet." },
  { id: "supertack", name: "Bambu Cool Plate SuperTack", kurz: "SuperTack", farbe: "#1f2a27", muster: "glatt",
    text: "Cool Plate mit besonders haftender Beschichtung. Hält PLA und PETG schon bei niedriger Temperatur ohne Kleber. Wärmer = haftet stärker.",
    gut: ["PLA und PETG ohne Kleber", "Kleine Auflageflächen, hohe dünne Teile", "Glatte Unterseiten"],
    pflege: ["Ohne Kleber verwenden. Mit Spülmittel und warmem Wasser reinigen.", "Weiche Oberfläche: Spachtel vorsichtig ansetzen. Kratzer stören nicht.", "Sitzt ein Teil zu fest: Platte auf 50 °C heizen und dann lösen."],
    vorsicht: "Kein TPU (beschädigt die Platte). Kein Bambu PLA Silk. PLA mit PETG-Stützschnittstelle nur mit Floß." },
  { id: "eng", name: "Engineering Plate", kurz: "Engineering", farbe: "#3a3f3c", muster: "matt",
    text: "Glatte, matte Platte für technische Materialien. Braucht immer Kleber, der hier als Haft- und Trennmittel dient.",
    gut: ["PETG, ASA, ABS, PC, PA mit Kleber", "Glatte Unterseiten bei Technik-Materialien"],
    pflege: ["Klebestift vor jedem Druck dünn auftragen.", "Kleberreste mit warmem Wasser und Spülmittel abwaschen."],
    vorsicht: "Für PLA nicht empfohlen. Ohne Kleber reißen PETG und TPU Stücke aus der Oberfläche." },
  { id: "smooth", name: "Smooth PEI Plate / High Temp Plate", kurz: "Smooth PEI", farbe: "#c9a24a", muster: "glatt",
    text: "Glatte PEI-Platte (goldgelb) für fast alle Materialien. Gibt spiegelglatte Unterseiten.",
    gut: ["PLA ohne Kleber", "Glänzende Unterseiten", "PETG, TPU, ASA mit Kleber als Trennmittel"],
    pflege: ["Mit Spülmittel und warmem Wasser waschen, zwischendurch Isopropanol.", "Kein Aceton auf PEI.", "Teile nach dem Abkühlen durch leichtes Biegen lösen."],
    vorsicht: "PETG und TPU haften auf glattem PEI zu stark: immer Kleber als Trennschicht, sonst reißen sie die Beschichtung heraus." },
  { id: "textured", name: "Textured PEI Plate", kurz: "Textured PEI", farbe: "#b8872f", muster: "struktur",
    text: "Raue PEI-Platte, Standard am P1S. Haftet gut, Teile lösen sich nach dem Abkühlen fast von selbst. Unterseite bekommt eine feine Struktur.",
    gut: ["Fast alles ohne Kleber: PLA, PETG, TPU, ASA, ABS", "Unterseiten ohne Fingerabdrücke", "PETG ohne Abreißen der Oberfläche"],
    pflege: ["Wöchentlich mit Spülmittel und warmem Wasser waschen, gut abtrocknen.", "Nicht mit den Fingern auf die Druckfläche fassen.", "Kein Aceton. Verschlissene Stellen in der Mitte sind normal."],
    vorsicht: "Sehr kleine Kontaktflächen haften schlechter als auf glatten Platten. Dann Rand (Brim) oder SuperTack." },
];
// Matrix Material × Platte: a = ok | kleber | nein, t = Betttemperatur in °C
const PLATTEN_MATRIX = [
  { m: "PLA", w: { cool: ["kleber", "35–45"], supertack: ["ok", "35–45"], eng: ["nein"], smooth: ["ok", "55–65"], textured: ["ok", "55–65"] } },
  { m: "PETG", w: { cool: ["nein"], supertack: ["ok", "60–70"], eng: ["kleber", "70–80"], smooth: ["kleber", "70–80"], textured: ["ok", "70–80"] } },
  { m: "TPU", w: { cool: ["nein"], supertack: ["nein"], eng: ["kleber", "30–35"], smooth: ["kleber", "35–45"], textured: ["ok", "35–45"] } },
  { m: "ASA", w: { cool: ["nein"], supertack: ["nein"], eng: ["kleber", "90–100"], smooth: ["kleber", "90–100"], textured: ["ok", "90–100"] } },
  { m: "ABS", w: { cool: ["nein"], supertack: ["nein"], eng: ["kleber", "90–100"], smooth: ["kleber", "90–100"], textured: ["ok", "90–100"] } },
  { m: "PC", w: { cool: ["nein"], supertack: ["nein"], eng: ["kleber", "100"], smooth: ["kleber", "100"], textured: ["kleber", "100"] } },
  { m: "PA", w: { cool: ["nein"], supertack: ["nein"], eng: ["kleber", "100"], smooth: ["kleber", "100"], textured: ["kleber", "100"] } },
];
// Kleine Zeichnung einer Platte (Draufsicht, leicht schräg)
function platteSvg(p) {
  const id = `pl-${p.id}`;
  const muster = p.muster === "struktur"
    ? `<pattern id="${id}" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1" fill="rgba(0,0,0,.28)"/><circle cx="0" cy="0" r=".6" fill="rgba(255,255,255,.18)"/></pattern>`
    : `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(255,255,255,${p.muster === "matt" ? 0.06 : 0.22})"/><stop offset=".45" stop-color="rgba(255,255,255,0)"/><stop offset="1" stop-color="rgba(255,255,255,${p.muster === "matt" ? 0.03 : 0.1})"/></linearGradient>`;
  return `<svg viewBox="0 0 120 80" class="pl-bild" aria-hidden="true"><defs>${muster}</defs>
    <path d="M18 14 H102 L112 66 H8 Z" fill="${p.farbe}" stroke="rgba(255,255,255,.25)"/>
    <path d="M18 14 H102 L112 66 H8 Z" fill="url(#${id})"/>
    <path d="M8 66 H112 V70 H8 Z" fill="#555c58"/>
    <rect x="52" y="8" width="16" height="6" rx="2" fill="#8da49a"/>
  </svg>`;
}
