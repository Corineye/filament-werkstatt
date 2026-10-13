// ---------------------------------------------------------------------------
// Aussehen: dunkler Tech-Look, Mint-Akzente, Glas-Karten, Rasterhintergrund
// ---------------------------------------------------------------------------

const STIL = `
:host {
  --grund: #080c0b;
  --flaeche: rgba(255,255,255,0.035);
  --flaeche-hover: rgba(255,255,255,0.06);
  --rand: rgba(255,255,255,0.08);
  --text: #e8f1ec;
  --leise: #8da49a;
  --mint: #3ee6a8;
  --mint-weich: rgba(62,230,168,0.12);
  --amber: #ffb547;
  --amber-weich: rgba(255,181,71,0.12);
  --rot: #ff6b6b;
  --radius: 18px;
  display: block;
  /* Immer genau so hoch wie das Fenster: sonst wächst die Seite mit dem Inhalt
     und es scrollt die ganze Seite statt nur der Liste bzw. der Detailansicht */
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  overflow: clip;
  font-family: var(--paper-font-body1_-_font-family, "Roboto", system-ui, sans-serif);
  color: var(--text);
  background: var(--grund);
  -webkit-font-smoothing: antialiased;
}
* { box-sizing: border-box; }
button { font: inherit; color: inherit; cursor: pointer; border: none; background: none; }
button:disabled { opacity: .45; cursor: default; }
h2 { margin: 0; font-size: 20px; font-weight: 600; }
h3 { margin: 22px 0 6px; font-size: 15px; font-weight: 600; }
p { margin: 4px 0 12px; }
.leise { color: var(--leise); }
.klein { font-size: 13px; }
.amber { color: var(--amber); }
.rot { color: var(--rot); }

.app {
  position: relative; height: 100%; display: flex; flex-direction: column; overflow: hidden; overflow: clip;
  background:
    radial-gradient(1200px 500px at 85% -10%, rgba(62,230,168,0.10), transparent 60%),
    radial-gradient(800px 400px at -10% 110%, rgba(62,230,168,0.06), transparent 60%),
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px) 0 0 / 44px 44px,
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px) 0 0 / 44px 44px,
    var(--grund);
}

/* Kopfzeile und Navigation */
.kopf {
  display: flex; align-items: center; gap: 16px; padding: 14px 24px;
  border-bottom: 1px solid var(--rand); background: rgba(8,12,11,0.7); backdrop-filter: blur(14px);
  position: relative; z-index: 2;
}
.marke { display: flex; align-items: center; gap: 10px; font-weight: 700; letter-spacing: .3px; white-space: nowrap; }
.punkt-leucht { width: 10px; height: 10px; border-radius: 50%; background: var(--mint); box-shadow: 0 0 12px var(--mint); }
.nav-oben { display: flex; gap: 4px; margin-left: 12px; flex: 1; }
.nav-punkt { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 12px; color: var(--leise); position: relative; }
.nav-punkt:hover { background: var(--flaeche-hover); color: var(--text); }
.nav-punkt.aktiv { background: var(--mint-weich); color: var(--mint); }
.nav-punkt.bald { opacity: .5; }
.nav-punkt small { font-size: 10px; text-transform: uppercase; letter-spacing: .6px; border: 1px solid var(--rand); border-radius: 6px; padding: 0 5px; }
.speicher { margin-left: auto; font-size: 12px; color: var(--leise); white-space: nowrap; }
.speicher.gespeichert::before { content: "● "; color: var(--mint); }
.speicher.speichert::before { content: "● "; color: var(--amber); }
.speicher.fehler { color: var(--rot); }
.icon-knopf { width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; font-size: 18px; flex: none; }
.icon-knopf:hover { background: var(--flaeche-hover); }

.haupt { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 24px; position: relative; z-index: 1; }
.mobil .haupt { padding: 16px 16px 96px; }
.nav-unten {
  position: absolute; left: 0; right: 0; bottom: 0; z-index: 3; display: flex; justify-content: space-around;
  padding: 6px 4px calc(6px + env(safe-area-inset-bottom)); background: rgba(8,12,11,0.88);
  backdrop-filter: blur(16px); border-top: 1px solid var(--rand);
}
.nav-unten .nav-punkt { flex-direction: column; gap: 2px; padding: 6px 8px; font-size: 11px; min-width: 60px; }
.nav-unten .nav-icon { font-size: 20px; }
.nav-unten small { position: absolute; top: 0; right: 4px; font-size: 8px !important; padding: 0 3px !important; }

/* Karten und Kennzahlen */
.karte { background: var(--flaeche); border: 1px solid var(--rand); border-radius: var(--radius); padding: 24px; backdrop-filter: blur(10px); max-width: 680px; margin: 0 auto; }
.stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 18px; }
.mobil .stats { grid-template-columns: repeat(2, 1fr); gap: 8px; }
.mobil .stats .stat:nth-child(n+3) { display: none; }
.stat { text-align: left; background: var(--flaeche); border: 1px solid var(--rand); border-radius: 16px; padding: 14px 16px; backdrop-filter: blur(10px); display: flex; flex-direction: column; gap: 2px; }
.stat[data-aktion]:hover { background: var(--flaeche-hover); }
.stat strong { font-size: 22px; font-weight: 700; }
.mobil .stat strong { font-size: 18px; }
.stat span { font-size: 12px; color: var(--leise); }
.stat.amber strong { color: var(--amber); }
.stat.rot strong { color: var(--rot); }

.werkzeug { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 18px; }
.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.mobil .werkzeug .chips { flex-wrap: nowrap; overflow-x: auto; width: 100%; padding-bottom: 4px; scrollbar-width: none; }
.chip { padding: 7px 14px; border-radius: 999px; background: var(--flaeche); border: 1px solid var(--rand); font-size: 13px; white-space: nowrap; }
.chip:hover { background: var(--flaeche-hover); }
.chip.an { background: var(--mint-weich); border-color: rgba(62,230,168,.5); color: var(--mint); }
.suche { flex: 1; min-width: 220px; padding: 10px 14px; border-radius: 12px; border: 1px solid var(--rand); background: rgba(0,0,0,.25); color: var(--text); font: inherit; outline: none; }
.suche:focus { border-color: rgba(62,230,168,.6); }
.mobil .suche { min-width: 0; width: 100%; }

/* Kacheln */
.raster { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px; }
.mobil .raster { grid-template-columns: 1fr 1fr; gap: 10px; }
.kachel {
  position: relative; text-align: left; display: flex; flex-direction: column; gap: 4px; padding: 16px;
  background: var(--flaeche); border: 1px solid var(--rand); border-radius: var(--radius); backdrop-filter: blur(10px);
  transition: transform .15s ease, border-color .15s ease, background .15s ease;
}
.kachel:hover { transform: translateY(-2px); border-color: rgba(62,230,168,.35); background: var(--flaeche-hover); }
.kachel.offen { border: 1px dashed rgba(255,181,71,.55); background: linear-gradient(160deg, var(--amber-weich), transparent 55%), var(--flaeche); }
.kachel.offen:hover { border-color: var(--amber); }
.badge-offen { position: absolute; top: 12px; right: 12px; font-size: 10px; font-weight: 600; color: var(--amber); background: rgba(255,181,71,.14); border-radius: 6px; padding: 2px 6px; letter-spacing: .2px; }
.mobil .badge-offen { font-size: 9px; padding: 2px 5px; }
.kachel-spule { width: 64px; height: 64px; margin-bottom: 8px; }
.spule-svg { width: 100%; height: 100%; display: block; }
.spule-svg.gross { width: 72px; height: 72px; flex: none; }
.kachel-name { font-weight: 600; font-size: 15px; line-height: 1.25; }
.kachel-sub { color: var(--leise); font-size: 13px; }
.kachel-fuss { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; gap: 6px; }
.mat { font-size: 11px; font-weight: 700; letter-spacing: .5px; color: var(--m); border: 1px solid color-mix(in srgb, var(--m) 45%, transparent); background: color-mix(in srgb, var(--m) 12%, transparent); padding: 2px 8px; border-radius: 6px; }
.rest { font-size: 13px; font-weight: 600; }
.rest.leise { font-weight: 400; }
.leer-hinweis, .laden { color: var(--leise); padding: 40px; text-align: center; grid-column: 1 / -1; }

/* Detailansicht (rechts am Desktop, von unten am Handy) */
.schleier { position: absolute; inset: 0; background: rgba(0,0,0,.55); z-index: 10; backdrop-filter: blur(2px); }
.schleier.oben { z-index: 20; }
.sheet {
  position: absolute; z-index: 11; top: 0; right: 0; bottom: 0; width: min(560px, 100%); display: flex; flex-direction: column;
  background: rgba(14,20,18,.96); border-left: 1px solid var(--rand); backdrop-filter: blur(20px);
  box-shadow: -20px 0 60px rgba(0,0,0,.5); animation: rein .2s ease;
}
@keyframes rein { from { transform: translateX(30px); opacity: 0; } }
.mobil .sheet { top: auto; left: 0; width: 100%; height: 92%; border-left: none; border-top: 1px solid var(--rand); border-radius: 22px 22px 0 0; animation: hoch .22s ease; }
@keyframes hoch { from { transform: translateY(40px); opacity: 0; } }
.griff { display: none; }
.mobil .griff { display: block; width: 40px; height: 4px; border-radius: 2px; background: rgba(255,255,255,.25); margin: 8px auto 0; }
.sheet-kopf { display: flex; gap: 14px; align-items: flex-start; padding: 20px 20px 12px; }
.sheet-titel { flex: 1; min-width: 0; }
.sheet-titel .sub { color: var(--leise); font-size: 13px; margin: 4px 0 8px; }
.pille { display: inline-block; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 999px; }
.pille.mint { color: var(--mint); background: var(--mint-weich); }
.pille.amber { color: var(--amber); background: var(--amber-weich); }
.tabs { display: flex; gap: 4px; padding: 0 20px; border-bottom: 1px solid var(--rand); }
.tab { padding: 10px 14px; color: var(--leise); border-bottom: 2px solid transparent; margin-bottom: -1px; }
.tab.an { color: var(--mint); border-color: var(--mint); }
.sheet-inhalt { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 16px 20px 24px; }
.sheet-fuss { display: flex; gap: 10px; justify-content: flex-end; padding: 14px 20px calc(14px + env(safe-area-inset-bottom)); border-top: 1px solid var(--rand); }
.mobil .sheet-fuss .knopf { flex: 1; }

.hinweis { font-size: 13px; line-height: 1.45; padding: 10px 12px; border-radius: 12px; background: var(--flaeche); border: 1px solid var(--rand); margin-bottom: 10px; }
.hinweis.amber { color: #ffd59a; background: var(--amber-weich); border-color: rgba(255,181,71,.3); }
.hinweis.mint { color: #b9f5dd; background: var(--mint-weich); border-color: rgba(62,230,168,.3); }
.legende { display: flex; gap: 14px; align-items: center; font-size: 12px; color: var(--leise); margin: 12px 0; flex-wrap: wrap; }
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
.dot.mint { background: var(--mint); }
.dot.amber { background: var(--amber); }
.mini { margin-left: auto; font-size: 12px; color: var(--amber); border: 1px solid rgba(255,181,71,.4); border-radius: 8px; padding: 4px 10px; }

/* Untermenüs (aufklappbare Gruppen) */
.gruppe { border: 1px solid var(--rand); border-radius: 14px; margin-bottom: 10px; background: var(--flaeche); overflow: hidden; }
.gruppe-kopf { width: 100%; display: flex; align-items: center; gap: 10px; padding: 13px 14px; text-align: left; }
.gruppe-kopf:hover { background: var(--flaeche-hover); }
.g-name { font-weight: 600; white-space: nowrap; }
.g-zus { margin-left: auto; font-size: 12px; color: var(--mint); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.g-zus.amber { color: var(--amber); }
.pfeil { color: var(--leise); transition: transform .15s; font-size: 18px; }
.gruppe.auf .pfeil { transform: rotate(90deg); }
.gruppe-inhalt { padding: 2px 14px 10px; border-top: 1px solid var(--rand); }
.zeile { padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,.04); }
.zeile:last-child { border-bottom: none; }
.zeile-kopf { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.z-name { font-size: 14px; }
.z-wert { display: flex; gap: 8px; align-items: center; font-weight: 600; font-size: 14px; text-align: right; }
.zeile.eigen .wert { color: var(--mint); }
.zeile.vorschlag .wert { color: var(--amber); }
.tag { font-size: 10px; font-weight: 600; color: var(--amber); border: 1px solid rgba(255,181,71,.4); border-radius: 6px; padding: 1px 6px; }
.text { width: 100%; margin-top: 8px; padding: 9px 12px; border-radius: 10px; border: 1px solid var(--rand); background: rgba(0,0,0,.3); color: var(--text); font: inherit; }

/* Regler */
.regler-zeile { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.rund { min-width: 34px; height: 34px; padding: 0 8px; border-radius: 10px; background: var(--flaeche-hover); border: 1px solid var(--rand); font-weight: 600; font-size: 13px; flex: none; }
.rund:active { background: var(--mint-weich); color: var(--mint); }
input[type=range] { -webkit-appearance: none; appearance: none; flex: 1; width: 100%; height: 6px; border-radius: 3px; background: rgba(255,255,255,.1); outline: none; margin: 10px 0; }
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: var(--mint); box-shadow: 0 0 0 5px rgba(62,230,168,.18), 0 2px 8px rgba(0,0,0,.4); cursor: pointer; }
input[type=range]::-moz-range-thumb { width: 22px; height: 22px; border: none; border-radius: 50%; background: var(--mint); box-shadow: 0 0 0 5px rgba(62,230,168,.18); cursor: pointer; }

/* Restgewicht */
.rest-jetzt { padding: 16px; border-radius: 16px; background: var(--flaeche); border: 1px solid var(--rand); }
.gross-zahl { font-size: 40px; font-weight: 700; color: var(--mint); margin-right: 8px; }
.einheit { color: var(--leise); }
.balken { height: 8px; border-radius: 4px; background: rgba(255,255,255,.08); margin: 10px 0 8px; overflow: hidden; }
.balken i { display: block; height: 100%; background: linear-gradient(90deg, var(--mint), #7cf5c8); border-radius: 4px; }
.rechner-block { padding: 14px 16px; border-radius: 16px; background: var(--flaeche); border: 1px solid var(--rand); margin-top: 12px; }
.r-kopf { display: flex; justify-content: space-between; align-items: baseline; }
.r-kopf strong { font-size: 20px; }
.spulen { margin-top: 10px; }
.spulen .chip { font-size: 12px; padding: 6px 10px; }
.ergebnis { margin: 14px 0; padding: 16px; border-radius: 16px; border: 1px solid rgba(62,230,168,.35); background: var(--mint-weich); display: grid; gap: 2px; }
.ergebnis strong { font-size: 30px; color: var(--mint); }
.ergebnis.ungespeichert { border-color: rgba(255,181,71,.45); background: var(--amber-weich); }
.ergebnis.ungespeichert strong { color: var(--amber); }

/* Infos */
.info-liste { border: 1px solid var(--rand); border-radius: 14px; overflow: hidden; }
.info-zeile { display: flex; justify-content: space-between; gap: 10px; padding: 11px 14px; border-bottom: 1px solid var(--rand); font-size: 14px; }
.info-zeile:last-child { border-bottom: none; }
.info-zeile span { color: var(--leise); }
.info-zeile .norm { display: block; font-size: 11px; opacity: .7; margin-top: 1px; }
textarea { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid var(--rand); background: rgba(0,0,0,.3); color: var(--text); font: inherit; resize: vertical; }

/* Knöpfe, Dialog, Meldung */
.knopf { padding: 11px 18px; border-radius: 12px; background: var(--mint); color: #062018; font-weight: 700; }
.knopf:hover { filter: brightness(1.08); }
.knopf.leise { background: var(--flaeche-hover); color: var(--text); border: 1px solid var(--rand); font-weight: 600; }
.knopf.amber { background: var(--amber); color: #2a1a00; }
.knopf.breit { width: 100%; }
.dialog {
  position: absolute; z-index: 21; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(420px, calc(100% - 32px));
  background: rgba(16,22,20,.98); border: 1px solid var(--rand); border-radius: 20px; padding: 22px; box-shadow: 0 30px 80px rgba(0,0,0,.6);
}
.wahl { width: 100%; display: flex; gap: 14px; align-items: center; text-align: left; padding: 14px; margin-bottom: 10px; border-radius: 14px; background: var(--flaeche); border: 1px solid var(--rand); }
.wahl:hover { border-color: rgba(62,230,168,.5); background: var(--mint-weich); }
.wahl > span { font-size: 20px; width: 28px; text-align: center; }
.wahl small { display: block; color: var(--leise); margin-top: 2px; }
.toast { position: absolute; z-index: 30; left: 50%; bottom: 28px; transform: translateX(-50%); padding: 11px 18px; border-radius: 12px; background: rgba(20,30,26,.96); border: 1px solid rgba(62,230,168,.4); color: var(--text); box-shadow: 0 10px 30px rgba(0,0,0,.5); max-width: calc(100% - 32px); font-size: 14px; }
.mobil .toast { bottom: 90px; }

/* Systemcheck */
.check { list-style: none; margin: 16px 0; padding: 0; display: grid; gap: 10px; }
.check li { display: flex; gap: 12px; align-items: flex-start; padding: 12px; border-radius: 12px; background: var(--flaeche); }
.check .punkt { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; flex: none; font-weight: 700; color: var(--grund); }
.check .ok .punkt { background: var(--mint); }
.check .nein .punkt { background: var(--rot); }
.check strong { display: block; }
.check small { color: var(--leise); word-break: break-word; }
.fehlerkarte h2 { color: var(--rot); }

/* Filter-Auswahlmenüs */
.werkzeug .alle { padding: 10px 18px; }
.auswahl { position: relative; display: flex; flex-direction: column; gap: 2px; padding: 6px 30px 6px 12px; border-radius: 12px; background: var(--flaeche); border: 1px solid var(--rand); min-width: 130px; cursor: pointer; }
.auswahl::after { content: "▾"; position: absolute; right: 11px; top: 50%; transform: translateY(-50%); color: var(--leise); pointer-events: none; }
.auswahl > span { font-size: 10px; text-transform: uppercase; letter-spacing: .6px; color: var(--leise); }
.auswahl select { appearance: none; -webkit-appearance: none; background: transparent; border: none; color: var(--text); font: inherit; font-size: 14px; padding: 0; outline: none; cursor: pointer; width: 100%; }
.auswahl select option, .auswahl select optgroup { background: #111816; color: var(--text); }
.auswahl.an { border-color: rgba(62,230,168,.5); background: var(--mint-weich); }
.auswahl.an select { color: var(--mint); }
.auswahl.sort { margin-left: auto; }
.werkzeug .suche { flex-basis: 100%; }
.unterfilter { display: contents; }
.filter-knopf { text-align: left; }
.filter-knopf strong { font-weight: 400; font-size: 14px; }
.filter-knopf.an strong { color: var(--mint); }
.mobil .werkzeug { display: grid; grid-template-columns: auto 1fr 1fr; gap: 8px; }
.mobil .werkzeug .alle { border-radius: 12px; }
.mobil .auswahl { min-width: 0; }
.mobil .auswahl.sort { margin-left: 0; }
.mobil .unterfilter { grid-column: 1 / -1; grid-row: 2; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 10px; border-radius: 14px; border: 1px solid rgba(62,230,168,.3); background: rgba(62,230,168,.05); animation: hoch .18s ease; }
.mobil .werkzeug .suche { grid-column: 1 / -1; }

/* Runder Plus-Knopf */
.fab { position: absolute; right: 28px; bottom: 28px; z-index: 5; width: 60px; height: 60px; border-radius: 50%; background: var(--mint); color: #062018; font-size: 34px; font-weight: 400; line-height: 1; display: grid; place-items: center; box-shadow: 0 0 0 6px rgba(62,230,168,.15), 0 10px 30px rgba(62,230,168,.35); transition: transform .15s; }
.fab:hover { transform: scale(1.06) rotate(90deg); }
.mobil .fab { right: 18px; bottom: 92px; width: 56px; height: 56px; }

/* Zeilen zum Antippen */
.zeile-kopf { width: 100%; text-align: left; padding: 2px 0; border-radius: 8px; }
button.zeile-kopf:hover .z-name { color: var(--mint); }
.zeile.auf { background: rgba(62,230,168,.04); margin: 0 -14px; padding: 10px 14px; }
.zeile-kopf.statisch { cursor: default; }
.mini.mint-rand { color: var(--mint); border-color: rgba(62,230,168,.4); margin: 6px 0 4px; }


/* Letzter Druck */
.letzter-druck { display: flex; gap: 12px; align-items: center; padding: 12px; border-radius: 14px; border: 1px dashed var(--rand); background: var(--flaeche); margin-bottom: 12px; }
.ld-bild { width: 56px; height: 56px; border-radius: 10px; background: rgba(0,0,0,.35); display: grid; place-items: center; font-size: 22px; flex: none; overflow: hidden; }
.ld-bild img { width: 100%; height: 100%; object-fit: cover; }
.ld-text { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.klein-knopf { padding: 8px 12px; font-size: 13px; white-space: nowrap; }

/* Restgewicht */
.rest-zeile { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.groesse-knopf { padding: 8px 12px; border-radius: 10px; border: 1px solid var(--rand); background: var(--flaeche-hover); font-size: 13px; color: var(--leise); }
.groesse-knopf strong { color: var(--text); }
.groesse-knopf:hover { border-color: rgba(62,230,168,.5); }
.knopf-reihe { display: flex; gap: 10px; }
.knopf-reihe .knopf { flex: 1; }
.rot-knopf { background: rgba(255,107,107,.14); color: var(--rot); border: 1px solid rgba(255,107,107,.5); }
.rot-knopf:hover:not(:disabled) { background: rgba(255,107,107,.24); }
.mobil .knopf-reihe .knopf { padding: 12px 10px; font-size: 14px; }
.mitte { text-align: center; margin-top: 10px; }
.chip.weitere { border-style: dashed; }
.sync { margin-top: 4px; }

/* Neues Filament */
.neu-vorschau { display: flex; gap: 14px; align-items: flex-start; flex: 1; min-width: 0; }
.abschnitt { color: var(--mint); font-size: 13px; text-transform: uppercase; letter-spacing: .8px; margin: 20px 0 10px; }
.abschnitt:first-child { margin-top: 4px; }
.formular { display: grid; gap: 12px; }
.formular label { display: grid; gap: 6px; font-size: 13px; color: var(--leise); }
.formular .text { margin-top: 0; }
.feld-titel { font-size: 13px; color: var(--leise); margin: 6px 0 -4px; }
.farb-zeile { display: flex; align-items: flex-end; gap: 12px; }
.farbwahl input { width: 64px; height: 38px; border: 1px solid var(--rand); border-radius: 10px; background: none; padding: 2px; cursor: pointer; }

/* Dialog-Listen */
.dialog { max-height: calc(100% - 40px); overflow-y: auto; overscroll-behavior: contain; animation: auf .18s ease; }
@keyframes auf { from { opacity: 0; transform: translate(-50%, -48%) scale(.97); } }
.schleier { animation: blende .2s ease; }
@keyframes blende { from { opacity: 0; } }
.toast { animation: blende .2s ease; }
.still { animation: none !important; }
.klapp { display: block; }

/* Eigene Auswahllisten */
select.dd-nativ { position: absolute !important; opacity: 0; pointer-events: none; width: 1px; height: 1px; margin: 0; padding: 0; border: 0; }
.dd-knopf { display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; font-size: 14px; color: var(--text); }
.dd-knopf .dd-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dd-knopf .dd-text.leise { color: var(--leise); }
.dd-pfeil { color: var(--leise); transition: transform .18s ease; font-size: 12px; }
.dd-knopf.offen .dd-pfeil { transform: rotate(180deg); color: var(--mint); }
.auswahl .dd-knopf { padding: 0; }
.auswahl .dd-pfeil { display: none; }
.auswahl.an .dd-knopf { color: var(--mint); }
.auswahl:has(.dd-knopf.offen) { border-color: rgba(62,230,168,.6); }
.dd-knopf.text { padding: 10px 12px; }
.dd-knopf.text:hover, .dd-knopf.text.offen { border-color: rgba(62,230,168,.5); }
.dd-liste {
  position: absolute; z-index: 40; overflow-y: auto; overscroll-behavior: contain; padding: 6px;
  background: rgba(16,23,21,.97); border: 1px solid rgba(62,230,168,.28); border-radius: 16px;
  backdrop-filter: blur(18px); box-shadow: 0 18px 50px rgba(0,0,0,.55), 0 0 0 1px rgba(0,0,0,.3);
  animation: dd-rein .16s cubic-bezier(.2,.7,.2,1); transform-origin: top center;
}
.dd-liste.nach-oben { transform-origin: bottom center; }
@keyframes dd-rein { from { opacity: 0; transform: translateY(-6px) scale(.98); } }
.dd-liste.nach-oben { animation-name: dd-rein-oben; }
@keyframes dd-rein-oben { from { opacity: 0; transform: translateY(6px) scale(.98); } }
.dd-gruppe { font-size: 10px; text-transform: uppercase; letter-spacing: .7px; color: var(--leise); padding: 10px 10px 4px; }
.dd-option { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; text-align: left; padding: 9px 12px; border-radius: 10px; font-size: 14px; }
.dd-option.eingerueckt { padding-left: 20px; }
.dd-option:hover { background: var(--flaeche-hover); }
.dd-option.an { background: var(--mint-weich); color: var(--mint); }
.dd-option i { font-style: normal; font-size: 12px; }
.liste { display: grid; gap: 8px; margin: 12px 0; }
.wahl.kompakt { padding: 10px 14px; margin: 0; }
.wahl.an { border-color: rgba(62,230,168,.6); background: var(--mint-weich); }
.neu-spule { margin: 8px 0 14px; padding-top: 12px; border-top: 1px solid var(--rand); }
.neu-spule .text { margin: 0; }
.oben-abstand { margin-top: 16px; }
.dialog .chips { margin-top: 10px; }

/* Inventar */
.inv-stats { grid-template-columns: repeat(4, 1fr); }
.mobil .inv-stats { grid-template-columns: repeat(2, 1fr); }
.mobil .inv-stats .stat:nth-child(n+3) { display: flex; }
.kats { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; margin-bottom: 18px; }
.mobil .kats { display: flex; overflow-x: auto; gap: 8px; padding-bottom: 4px; scrollbar-width: none; }
.kat { text-align: left; display: flex; flex-direction: column; gap: 2px; padding: 12px 14px; border-radius: 16px; background: var(--flaeche); border: 1px solid var(--rand); }
.mobil .kat { flex: none; min-width: 132px; }
.kat:hover { background: var(--flaeche-hover); }
.kat.an { border-color: rgba(62,230,168,.5); background: var(--mint-weich); }
.kat-icon { font-size: 20px; }
.kat strong { font-size: 14px; }
.kat small { font-size: 11px; color: var(--leise); }
.teil-bild { height: 64px; margin-bottom: 8px; display: flex; align-items: center; }
.teil-svg { height: 100%; width: auto; max-width: 100%; display: block; }
.teil-svg.gross { width: 100%; height: auto; max-height: 200px; }
.zeichnung { padding: 12px; border-radius: 16px; background: rgba(0,0,0,.25); border: 1px solid var(--rand); margin-bottom: 12px;
  background-image: linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px); background-size: 12px 12px; }
.teil-kopf-bild { width: 84px; height: 48px; flex: none; display: flex; align-items: center; }
.kachel.wenig { border-color: rgba(255,107,107,.5); }
.rot-badge { color: var(--rot) !important; background: rgba(255,107,107,.14) !important; }
.passend-titel { margin-top: 24px; }
.ohne-rand { border-top: none; }
.formular-zeile { display: grid; gap: 6px; font-size: 13px; color: var(--leise); margin-top: 12px; }
.mengen-knoepfe { justify-content: space-between; }
.mengen-knoepfe .rund { flex: 1; height: 40px; }

/* Drucker */
.dr-raster { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.mobil .dr-raster { grid-template-columns: 1fr; gap: 12px; }
.dr-spalte, .dr-live { display: grid; gap: 16px; align-content: start; }
.mobil .dr-spalte, .mobil .dr-live { gap: 12px; }
.dr-karte { background: var(--flaeche); border: 1px solid var(--rand); border-radius: var(--radius); padding: 18px; backdrop-filter: blur(10px); }
.dr-titel { margin: 0 0 12px; font-size: 14px; color: var(--leise); font-weight: 600; letter-spacing: .3px; }
.dr-status { display: flex; gap: 20px; align-items: center; position: relative; overflow: hidden;
  background: radial-gradient(400px 200px at 0% 0%, rgba(62,230,168,.10), transparent 70%), var(--flaeche); }
.mobil .dr-status { flex-direction: column; text-align: center; }
.dr-ring { position: relative; width: 132px; height: 132px; flex: none; }
.ring { width: 100%; height: 100%; display: block; }
.ring circle { transition: stroke-dasharray .8s ease; }
.dr-ring-text { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; }
.dr-ring-text strong { font-size: 26px; }
.dr-ring-text span { font-size: 11px; color: var(--leise); }
.dr-status-text { flex: 1; min-width: 0; display: grid; gap: 6px; justify-items: start; }
.mobil .dr-status-text { justify-items: center; }
.dr-status-text h2 { overflow-wrap: anywhere; }
.dr-status-text p { margin: 0; }
.dr-werte { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; width: 100%; margin-top: 6px; }
.dr-werte > div { background: rgba(0,0,0,.2); border: 1px solid var(--rand); border-radius: 12px; padding: 8px 10px; display: grid; gap: 2px; text-align: left; }
.dr-werte span { font-size: 11px; color: var(--leise); }
.dr-werte strong { font-size: 15px; }
.dr-titelbild { width: 96px; height: 96px; object-fit: contain; border-radius: 14px; background: rgba(0,0,0,.25); border: 1px solid var(--rand); flex: none; }
.dr-aus { display: flex; gap: 18px; align-items: center; }
.dr-aus p { margin: 6px 0 0; }
.dr-aus-icon { width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; font-size: 28px; flex: none; color: var(--leise); border: 1px solid var(--rand); background: rgba(0,0,0,.25); }
.dreher { width: 28px; height: 28px; border-radius: 50%; border: 3px solid rgba(62,230,168,.2); border-top-color: var(--mint); animation: drehen .9s linear infinite; }
@keyframes drehen { to { transform: rotate(360deg); } }
.dr-temp { margin-bottom: 14px; }
.dr-temp:last-child { margin-bottom: 0; }
.dr-temp-kopf { display: flex; justify-content: space-between; align-items: baseline; }
.dr-temp-kopf strong { font-size: 22px; }
.dr-balken { position: relative; height: 8px; border-radius: 4px; background: rgba(255,255,255,.08); margin: 8px 0 6px; }
.dr-balken i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 4px; background: linear-gradient(90deg, #3ee6a8, #ffb547 70%, #ff6b6b); transition: width .8s ease; }
.dr-balken b { position: absolute; top: -4px; width: 2px; height: 16px; background: var(--text); border-radius: 1px; transform: translateX(-1px); }
.dr-temp small { font-size: 12px; }
.dr-luefter { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.dr-l { display: grid; justify-items: center; gap: 2px; padding: 10px 4px; border-radius: 12px; background: rgba(0,0,0,.2); border: 1px solid var(--rand); }
.dr-l small { font-size: 11px; color: var(--leise); }
.dr-l-icon { font-size: 22px; color: var(--leise); }
.dr-l-icon.dreht { color: var(--mint); animation: drehen var(--dauer) linear infinite; }
.dr-werte-3 { margin: 0 0 8px; }
.dr-kamera-kopf { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 10px; }
.dr-kamera-kopf .dr-titel { margin: 0; }
.dr-kamera { aspect-ratio: 16 / 9; border-radius: 14px; overflow: hidden; background: rgba(0,0,0,.4); border: 1px solid var(--rand); }
.dr-kamera img { width: 100%; height: 100%; object-fit: cover; display: block; }
.dr-kamera-leer { height: 100%; display: grid; place-items: center; color: var(--leise); font-size: 14px; }
.dr-kamera-karte p { margin: 8px 0 0; }
.dr-verlauf { display: grid; gap: 8px; }
.dr-druck { display: flex; gap: 12px; align-items: center; text-align: left; padding: 10px; border-radius: 14px; background: rgba(0,0,0,.18); border: 1px solid var(--rand); }
.dr-druck:hover { border-color: rgba(62,230,168,.4); background: var(--flaeche-hover); }
.dr-druck .ld-bild { width: 48px; height: 48px; font-size: 18px; }
.dr-druck-text { flex: 1; min-width: 0; display: grid; gap: 2px; }
.dr-druck-text strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dr-druck-text small { color: var(--leise); font-size: 12px; }
.dr-kommentar { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text) !important; opacity: .8; }
.pille.rot { color: var(--rot); background: rgba(255,107,107,.14); }
.pille.leise { color: var(--leise); background: var(--flaeche-hover); }
.dr-steckdose { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.dr-aus .knopf { margin-top: 12px; }
.dreher.klein { width: 14px; height: 14px; border-width: 2px; display: inline-block; vertical-align: -2px; }
.dr-foto-gross { width: 100%; border-radius: 14px; margin-top: 8px; border: 1px solid var(--rand); }
.rot-hinweis { color: #ffc2c2; background: rgba(255,107,107,.12); border-color: rgba(255,107,107,.4); }
.mobil .dr-werte { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.mobil .dr-luefter { grid-template-columns: repeat(2, minmax(0, 1fr)); }
/* 3D-Modelle */
.mod-raster { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 16px; height: 100%; min-height: 480px; }
.mobil .mod-raster { grid-template-columns: 1fr; height: auto; min-height: 0; gap: 12px; }
.mod-buehne-karte { position: relative; display: flex; flex-direction: column; padding: 0; overflow: hidden; min-height: 0;
  background: radial-gradient(600px 400px at 50% 0%, rgba(62,230,168,.07), transparent 70%), rgba(0,0,0,.25); }
.mod-buehne { position: relative; flex: 1; min-height: 0; }
.mobil .mod-buehne { flex: none; height: 52vh; height: 52dvh; }
.buehne-canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: grab; outline: none; }
.buehne-canvas:active { cursor: grabbing; }
.mod-marker { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.mod-pin { position: absolute; left: 0; top: 0; width: 22px; height: 22px; border-radius: 50%; pointer-events: auto; font-size: 12px; font-weight: 700;
  background: rgba(8,12,11,.85); color: var(--amber); border: 2px solid var(--amber); box-shadow: 0 2px 10px rgba(0,0,0,.5); transition: background .15s; }
.mod-pin::after { content: ""; position: absolute; left: 50%; top: 100%; width: 2px; height: 16px; margin: 2px 0 0 -1px; background: var(--amber); opacity: .8; border-radius: 1px; }
.mod-pin::before { content: ""; position: absolute; left: 50%; top: calc(100% + 16px); width: 6px; height: 6px; margin-left: -3px; border-radius: 50%; background: var(--amber); }
.mod-pin.drin::after, .mod-pin.drin::before { background: var(--mint); }
.mod-pin:hover, .mod-pin.an { background: var(--amber); color: #2a1a00; }
.mod-pin.drin { color: var(--mint); border-color: var(--mint); }
.mod-pin.drin.an { background: var(--mint); color: #062018; }
.mod-leiste { position: absolute; left: 12px; right: 12px; top: 12px; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; pointer-events: none; }
.mod-leiste > * { pointer-events: auto; }
.mod-leiste .chip { background: rgba(8,12,11,.75); backdrop-filter: blur(8px); padding: 6px 12px; font-size: 12px; }
.mod-name { margin-right: auto; font-weight: 600; font-size: 14px; max-width: 45%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 6px 12px; border-radius: 999px; background: rgba(8,12,11,.75); border: 1px solid var(--rand); }
.mobil .mod-name { max-width: 100%; flex-basis: 100%; margin-right: 0; padding-right: 44px; }
.mod-zu { width: 32px; padding: 6px 0 !important; text-align: center; }
.mobil .mod-zu { position: absolute; right: 34px; top: 0; }
.mobil .mod-leiste { padding-right: 0; }
.mod-schicht-leiste { position: absolute; left: 12px; right: 12px; bottom: 36px; display: flex; gap: 8px; align-items: center; padding: 8px 10px; border-radius: 14px; background: rgba(8,12,11,.8); border: 1px solid var(--rand); backdrop-filter: blur(8px); flex-wrap: wrap; }
.mod-schicht-leiste input { flex: 1; min-width: 120px; }
.mod-schicht-text { font-size: 13px; color: var(--leise); min-width: 160px; text-align: right; font-variant-numeric: tabular-nums; }
.mobil .mod-schicht-text { flex-basis: 100%; text-align: center; min-width: 0; }
.mod-hilfe { position: absolute; left: 0; right: 0; bottom: 0; margin: 0; padding: 8px 12px; font-size: 12px; text-align: center; pointer-events: none; }
.mod-seite { display: flex; flex-direction: column; padding: 0; min-height: 0; overflow: hidden; }
.mod-tabs { padding: 4px 12px 0; flex: none; }
.mod-inhalt { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 16px 18px 90px; }
.mobil .mod-inhalt { overflow: visible; padding-bottom: 18px; }
.mod-inhalt h3:first-child { margin-top: 0; }
.mod-masse { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 12px; }
.mod-masse > div { display: grid; gap: 0; padding: 10px; border-radius: 12px; background: rgba(0,0,0,.22); border: 1px solid var(--rand); }
.mod-masse span { font-size: 11px; color: var(--leise); font-weight: 700; }
.mod-masse strong { font-size: 22px; font-variant-numeric: tabular-nums; }
.mod-masse small { font-size: 11px; color: var(--leise); }
.mod-masse .rot { border-color: rgba(255,107,107,.5); background: rgba(255,107,107,.1); }
.mod-masse .rot strong { color: var(--rot); }
.mod-dreh { margin: 8px 0 4px; }
.breit-auswahl { width: 100%; margin: 4px 0 8px; }
.mod-regler { margin: 12px 0; }
.mod-regler .r-kopf strong { font-size: 16px; }
.mod-regler input { width: 100%; }
.ergebnis.fehlt { border-color: rgba(255,107,107,.45); background: rgba(255,107,107,.1); }
.ergebnis.fehlt strong { color: var(--rot); }
.mod-loecher { display: grid; gap: 8px; margin: 12px 0; }
.mod-loch { border-radius: 14px; background: rgba(0,0,0,.18); border: 1px solid var(--rand); overflow: hidden; }
.mod-loch.auf { border-color: rgba(255,181,71,.5); }
.mod-loch.drin { border-color: rgba(62,230,168,.4); }
.mod-loch-kopf { width: 100%; display: flex; gap: 10px; align-items: center; text-align: left; padding: 10px; }
.mod-loch-kopf:hover { background: var(--flaeche-hover); }
.mod-nr { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; font-weight: 700; flex: none; border: 2px solid var(--amber); color: var(--amber); }
.mod-loch.drin .mod-nr { border-color: var(--mint); color: var(--mint); }
.mod-vorschlaege { display: grid; gap: 6px; padding: 0 10px 10px; }
.mod-vorschlag { display: flex; gap: 10px; align-items: center; padding: 8px; border-radius: 12px; background: var(--flaeche); border: 1px solid var(--rand); }
.mod-vorschlag.an { border-color: rgba(62,230,168,.5); background: var(--mint-weich); }
.mod-vorschlag .mini { margin-left: 0; }
.mod-v-bild { width: 44px; height: 44px; flex: none; display: grid; place-items: center; border-radius: 10px; background: rgba(0,0,0,.3); overflow: hidden; }
.mod-v-bild svg { width: 100%; height: 100%; }
.mod-legende { display: flex; flex-wrap: wrap; gap: 6px 14px; margin: 12px 0; font-size: 12px; color: var(--leise); }
.mod-legende span { display: inline-flex; align-items: center; gap: 6px; }
.mod-legende i { width: 14px; height: 4px; border-radius: 2px; display: inline-block; }
.mod-laden { display: flex; gap: 16px; align-items: center; max-width: 520px; margin: 40px auto; }
.mod-laden-klein { display: flex; gap: 8px; align-items: center; color: var(--leise); font-size: 13px; margin: 12px 0; }
.mod-leer { display: grid; gap: 16px; max-width: 720px; margin: 0 auto; }
.ablage { display: grid; justify-items: center; gap: 6px; text-align: center; padding: 56px 24px; border-radius: 22px; cursor: pointer;
  border: 2px dashed rgba(62,230,168,.35); background: radial-gradient(400px 200px at 50% 0%, rgba(62,230,168,.10), transparent 70%), var(--flaeche); transition: border-color .2s, background .2s; }
.ablage:hover, .app.ziehen .ablage { border-color: var(--mint); background: var(--mint-weich); }
.ablage strong { font-size: 18px; }
.ablage-icon { font-size: 44px; line-height: 1; margin-bottom: 6px; }
.klein-ablage { padding: 30px 16px; margin: 14px 0; }
.klein-ablage .ablage-icon { font-size: 30px; color: var(--mint); }
.app.ziehen::after { content: "Datei loslassen zum Öffnen"; position: absolute; inset: 12px; z-index: 40; display: grid; place-items: center; border-radius: 22px;
  border: 2px dashed var(--mint); background: rgba(8,12,11,.8); color: var(--mint); font-size: 20px; font-weight: 600; pointer-events: none; }
.mod-zuletzt { padding: 0 6px 0 0; }
.mod-zuletzt-knopf { flex: 1; min-width: 0; display: flex; gap: 12px; align-items: center; text-align: left; padding: 10px; }
.mod-huelle { position: relative; display: flex; min-height: 0; }
.mod-huelle > .mod-buehne-karte { flex: 1; }
.mod-plus { position: absolute; z-index: 3; top: -14px; right: -14px; width: 52px; height: 52px; border-radius: 50%; background: var(--mint); color: #062018;
  font-size: 30px; line-height: 1; display: grid; place-items: center; border: 4px solid var(--grund);
  box-shadow: 0 0 0 4px rgba(62,230,168,.15), 0 8px 24px rgba(62,230,168,.35); transition: transform .2s cubic-bezier(.2,.9,.3,1.3); }
.mod-plus:hover { transform: scale(1.08) rotate(90deg); }
.mod-plus:active { transform: scale(.94); }
.mobil .mod-plus { top: -12px; right: -8px; width: 48px; height: 48px; }
.mod-leiste { padding-right: 34px; }
.mod-markier-hinweis { position: absolute; left: 50%; top: 64px; transform: translateX(-50%); z-index: 2; display: flex; gap: 10px; align-items: center; white-space: nowrap;
  padding: 8px 8px 8px 14px; border-radius: 999px; background: rgba(255,181,71,.16); border: 1px solid rgba(255,181,71,.5); color: #ffd59a; font-size: 13px; backdrop-filter: blur(8px); animation: hinweis-rein .25s ease; }
@keyframes hinweis-rein { from { opacity: 0; transform: translate(-50%, -8px); } }
.mod-markier-hinweis .mini { margin: 0; }
.mobil .mod-markier-hinweis { top: 104px; white-space: normal; width: calc(100% - 24px); }
.mod-markier.an { border-color: rgba(255,181,71,.5); color: var(--amber); }
.mod-manuell { padding: 0 10px 6px; }
.mod-manuell .chips { align-items: center; margin-bottom: 6px; }
.mod-loch-kopf .dr-druck-text strong { white-space: normal; }
.breit-dialog { width: min(560px, calc(100% - 32px)); }
.stuetz-liste { display: grid; gap: 10px; margin: 14px 0; }
.stuetz-eintrag { display: flex; gap: 14px; align-items: center; padding: 10px; border-radius: 14px; background: var(--flaeche); border: 1px solid var(--rand); }
.stuetz-eintrag p { margin: 2px 0 0; }
.stuetz-bild { width: 110px; height: 69px; flex: none; border-radius: 10px; background: rgba(0,0,0,.3); }
/* Verbuchen */
.bu-balken { position: relative; z-index: 2; display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap; padding: 10px 24px;
  background: linear-gradient(90deg, rgba(62,230,168,.18), rgba(62,230,168,.06)); border-bottom: 1px solid rgba(62,230,168,.35); animation: balken-rein .35s cubic-bezier(.2,.9,.3,1.1); }
.bu-balken.rot { background: linear-gradient(90deg, rgba(255,107,107,.26), rgba(255,107,107,.08)); border-bottom-color: rgba(255,107,107,.5); }
@keyframes balken-rein { from { transform: translateY(-100%); opacity: 0; } }
.bu-text { font-size: 14px; min-width: 0; }
.bu-knoepfe { display: flex; gap: 8px; }
.bu-mehr { font-size: 12px; color: var(--leise); margin-left: 6px; }
.mobil .bu-balken { padding: 10px 16px; }
.mobil .bu-knoepfe { width: 100%; }
.mobil .bu-knoepfe .knopf { flex: 1; }
.dialog-x { position: absolute; top: 12px; right: 12px; }
.bu-dialog h2 { padding-right: 36px; }
.bu-kopf { display: flex; gap: 14px; align-items: center; margin-bottom: 10px; }
.bu-kopf .ld-bild { width: 64px; height: 64px; }
.bu-kopf p { margin: 2px 0 0; }
.bu-rollen { display: grid; gap: 8px; margin-bottom: 8px; }
.bu-rolle { position: relative; display: flex; gap: 12px; align-items: center; text-align: left; padding: 10px; border-radius: 14px; background: var(--flaeche); border: 1px solid var(--rand); transition: border-color .15s, background .15s, transform .15s; }
.bu-rolle:hover { border-color: rgba(62,230,168,.4); }
.bu-rolle:active { transform: scale(.98); }
.bu-rolle.an { border-color: var(--mint); background: var(--mint-weich); box-shadow: 0 0 0 3px rgba(62,230,168,.12); }
.bu-rolle svg { width: 44px; height: 44px; flex: none; }
.bu-rolle-text { display: grid; gap: 1px; min-width: 0; }
.bu-rolle-text small { font-size: 12px; color: var(--leise); }
.bu-rolle-text small.mint { color: var(--mint); }
.achtung-punkt { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: var(--rot); color: #fff; font-weight: 800; font-size: 14px; flex: none; box-shadow: 0 0 0 4px rgba(255,107,107,.2); animation: puls 2s ease-in-out infinite; }
@keyframes puls { 50% { box-shadow: 0 0 0 7px rgba(255,107,107,.08); } }
.bu-rolle .achtung-punkt { position: absolute; top: 8px; right: 8px; }
.kachel-achtung { position: absolute; top: 10px; left: 10px; z-index: 1; }
.achtung-hinweis { display: flex; gap: 12px; align-items: center; }
.achtung-hinweis > div { flex: 1; display: grid; gap: 2px; }
.achtung-hinweis small { font-size: 12px; opacity: .85; }
.achtung-hinweis .mini { margin: 0; color: var(--mint); border-color: rgba(62,230,168,.4); }
.chip.rot-chip.an { background: rgba(255,107,107,.16); border-color: rgba(255,107,107,.5); color: var(--rot); }
.bu-ergebnis { margin: 6px 0; }
.bu-bilder { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; }
.bu-bild { display: grid; gap: 4px; justify-items: center; text-align: center; padding: 8px; border-radius: 12px; background: var(--flaeche); border: 1px solid var(--rand); font-size: 12px; line-height: 1.25; transition: border-color .15s, background .15s; }
.bu-bild.an { border-color: var(--amber); background: rgba(255,181,71,.10); }
.fb-bild { width: 100%; max-width: 110px; height: auto; border-radius: 8px; background: rgba(0,0,0,.3); }
.bu-frage { display: flex; gap: 10px; align-items: center; justify-content: space-between; flex-wrap: wrap; padding: 8px 0; border-bottom: 1px solid var(--rand); font-size: 14px; }
.bu-frage .chip { padding: 5px 12px; }
.bu-ursache { border: 1px solid var(--rand); border-radius: 14px; padding: 12px; margin: 10px 0; background: var(--flaeche); }
.bu-ursache-kopf { display: flex; gap: 12px; align-items: center; }
.bu-ursache-kopf .fb-bild { width: 84px; flex: none; }
.bu-ursache-kopf > div { display: grid; gap: 2px; }
.bu-ursache-kopf small { font-size: 12px; }
.bu-loesungen { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 8px; font-size: 14px; }
.bu-loesungen li { display: flex; gap: 10px; align-items: flex-start; }
.bu-haken { width: 22px; height: 22px; border-radius: 7px; border: 1.5px solid var(--mint); color: #062018; font-size: 13px; font-weight: 800; flex: none; display: grid; place-items: center; transition: background .15s; }
.bu-haken.an { background: var(--mint); }
.bu-punkt { width: 22px; text-align: center; color: var(--leise); flex: none; }
.bu-aend { display: inline-block; margin-top: 2px; font-size: 12px; color: var(--amber); }
.bu-aend strong { color: var(--text); }
.feld { display: grid; gap: 4px; margin: 10px 0; font-size: 13px; color: var(--leise); }
.feld input { padding: 11px 12px; border-radius: 12px; border: 1px solid var(--rand); background: rgba(0,0,0,.3); color: var(--text); font: inherit; font-size: 15px; }
.feld input:focus, textarea:focus { outline: none; border-color: rgba(62,230,168,.6); }
`;
