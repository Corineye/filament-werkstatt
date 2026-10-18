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
.nav-oben .nav-punkt.nur-icon { padding: 8px 10px; }
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
.nav-unten .nav-punkt { flex-direction: column; gap: 2px; padding: 6px 4px; font-size: 11px; min-width: 0; flex: 1; }
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
.mod-loch-zeile { display: flex; align-items: stretch; }
.mod-loch-weg { flex: none; width: 44px; display: grid; place-items: center; color: var(--leise); border-left: 1px solid var(--rand); }
.mod-loch-weg:hover, .mod-loch-weg:focus-visible { color: var(--rot); background: rgba(255,107,107,.1); }
.mod-loch-weg svg { width: 18px; height: 18px; }
.mod-loch-kopf { flex: 1; min-width: 0; width: 100%; display: flex; gap: 10px; align-items: center; text-align: left; padding: 10px; }
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
.bu-name { width: 100%; box-sizing: border-box; font: inherit; font-size: 1.15rem; font-weight: 700; color: inherit; background: transparent; border: 1px dashed transparent; border-radius: 8px; padding: 4px 8px; margin: 0 -8px 2px; }
.bu-name:hover, .bu-name:focus { border-color: var(--mint, #3ee8b5); background: rgba(255,255,255,.04); outline: none; }
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

/* ---- Ansichtswechsel und gemeinsame Bausteine ---- */
.ansicht-rein { animation: ansicht-rein .28s cubic-bezier(.2,.8,.2,1); }
.ansicht-rein.voll { height: 100%; }
@keyframes ansicht-rein { from { opacity: 0; transform: translateY(8px); } }
.wechsel-rein { animation: blende .22s ease; }
.wechsel { animation: wechsel .25s ease; }
@keyframes wechsel { from { opacity: .2; transform: translateX(6px); } }
.unter-tabs { margin-bottom: 16px; }
.mobil .unter-tabs { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin: 0 -16px 14px; padding: 0 16px 4px; scroll-snap-type: x proximity; scroll-padding-inline: 16px; }
.mobil .unter-tabs::-webkit-scrollbar { display: none; }
.mobil .unter-tabs .chip { scroll-snap-align: start; }
.chip { transition: background .15s, border-color .15s, color .15s, transform .1s; }
.chip:active, .knopf:active, .rund:active { transform: scale(.96); }
.knopf, .rund, .wahl, .mini { transition: filter .15s, background .15s, transform .1s; }
.zahl-punkt { display: inline-grid; place-items: center; min-width: 18px; height: 18px; padding: 0 5px; margin-left: 4px; border-radius: 9px; background: var(--mint); color: #062018; font-size: 11px; font-weight: 800; }
.zahl-punkt.amber-punkt { background: var(--amber); color: #2a1a00; }
.leer-karte { display: grid; justify-items: center; text-align: center; gap: 6px; padding: 34px 20px; }
.gross-icon { font-size: 40px; animation: schweben 3s ease-in-out infinite; }
@keyframes schweben { 50% { transform: translateY(-5px); } }
.farbtupfer { width: 28px; height: 28px; border-radius: 50%; flex: none; border: 2px solid rgba(255,255,255,.18); box-shadow: inset 0 -4px 8px rgba(0,0,0,.25); }
.zeilen-knopf { width: 100%; text-align: left; align-items: center; }
.zeilen-knopf:hover { background: var(--flaeche-hover); }
.zeilen-knopf span { display: grid; }
.such-feld { width: 100%; max-width: 420px; padding: 10px 14px; border-radius: 12px; border: 1px solid var(--rand); background: rgba(0,0,0,.3); color: var(--text); font: inherit; }
.such-feld:focus { outline: none; border-color: rgba(62,230,168,.6); }
.datei-knopf { display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
.toast.mit-knopf { display: flex; align-items: center; gap: 12px; }
.toast .mini { margin: 0; }
.dialog textarea[readonly] { font-size: 13px; }
.nav-oben { overflow-x: auto; scrollbar-width: none; }
.nav-oben::-webkit-scrollbar { display: none; }
@media (max-width: 1440px) { .nav-oben .nav-punkt { padding: 8px 9px; gap: 6px; } }
@media (max-width: 1080px) { .nav-oben .nav-name { display: none; } .nav-oben .nav-punkt { padding: 8px 11px; } .nav-oben .nav-icon { font-size: 18px; } }
.nav-unten .nav-punkt { transition: color .15s, background .15s; border-radius: 14px; }
.nav-unten .nav-punkt.aktiv .nav-icon { animation: tipp .3s ease; }
@keyframes tipp { 40% { transform: scale(1.2); } }
.such-knopf { margin-left: 4px; }
.mobil .such-knopf { margin-left: 0; }
.mobil .kopf { gap: 8px; padding: 10px 12px; }
.mobil .marke { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.mobil .speicher { font-size: 0; }
.mobil .speicher::before { font-size: 14px; }
.speicher.fehler::before { content: "● "; color: var(--rot); }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }

/* ---- Hilfe ---- */
.hi-tabs { margin-bottom: 16px; }
.hi-raster { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.mobil .hi-raster { grid-template-columns: 1fr; gap: 12px; }
.hi-bild-karte { position: relative; }
.p1s-bild, .trockner-bild { width: 100%; height: auto; display: block; }
.p1s-punkt { cursor: pointer; outline: none; }
.p1s-flaeche { fill: rgba(62,230,168,0); transition: fill .2s; }
.p1s-ring { fill: #0b1512; stroke: var(--mint); stroke-width: 1.6; transition: fill .2s, r .2s; }
.p1s-punkt text { fill: var(--mint); font-size: 11px; font-weight: 700; pointer-events: none; transition: fill .2s; }
.p1s-punkt:hover .p1s-flaeche, .p1s-punkt:focus .p1s-flaeche { fill: rgba(62,230,168,.12); }
.p1s-punkt.an .p1s-flaeche { fill: rgba(62,230,168,.18); }
.p1s-punkt.an .p1s-ring { fill: var(--mint); animation: ring-puls 1.8s ease-in-out infinite; }
.p1s-punkt.an text { fill: #062018; }
@keyframes ring-puls { 50% { stroke-width: 5; stroke-opacity: .35; } }
.tr-wert { fill: var(--mint); font-size: 14px; font-weight: 700; font-family: ui-monospace, monospace; }
.hi-info h2 { margin: 2px 0 6px; }
.hi-info h3 { margin-top: 16px; }
.hi-nr { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; background: var(--mint); color: #062018; font-weight: 800; }
.hi-live { display: flex; justify-content: space-between; gap: 10px; padding: 10px 14px; border-radius: 12px; background: var(--mint-weich); border: 1px solid rgba(62,230,168,.3); font-size: 14px; }
.hi-live span { color: var(--leise); }
.hi-einst { display: grid; gap: 8px; }
.hi-einst > div { display: grid; gap: 2px; padding: 10px 12px; border-radius: 12px; background: rgba(0,0,0,.2); border: 1px solid var(--rand); font-size: 14px; }
.hi-einst .leise { font-size: 13px; }
.info-zeile.kopfzeile { background: rgba(255,255,255,.03); font-size: 12px; text-transform: uppercase; letter-spacing: .5px; }
.hi-sprung .chip { min-width: 36px; justify-content: center; padding: 6px 10px; }
.hi-tr-info { display: grid; gap: 4px; margin-top: 12px; padding: 12px 14px; border-radius: 12px; background: rgba(0,0,0,.25); border: 1px solid var(--rand); font-size: 14px; min-height: 76px; }
.tr-tabelle { display: grid; gap: 6px; }
.tr-zeile { display: grid; grid-template-columns: 90px 1fr; gap: 4px 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--rand); }
.tr-zeile small { grid-column: 1 / -1; font-size: 12px; }
.tr-werte { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.tr-werte b { font-size: 12px; font-weight: 600; padding: 3px 8px; border-radius: 8px; background: var(--amber-weich); color: var(--amber); white-space: nowrap; }
.tr-rollen { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 8px; }
.tr-rolle { display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 14px; background: rgba(0,0,0,.18); border: 1px solid var(--rand); text-align: left; }
.tr-rolle:hover { background: var(--flaeche-hover); }
.tr-rolle svg { width: 38px; height: 38px; flex: none; }
.tr-rolle > span:nth-child(2) { flex: 1; display: grid; min-width: 0; }
.tr-rolle small { color: var(--leise); font-size: 12px; }
.fb-raster { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; align-items: start; }
.mobil .fb-raster { grid-template-columns: 1fr; }
.fb-karte { border: 1px solid var(--rand); border-radius: 16px; background: var(--flaeche); overflow: hidden; transition: border-color .2s, background .2s; }
.fb-karte:hover { border-color: rgba(255,181,71,.45); background: var(--flaeche-hover); }
.fb-kopf { width: 100%; display: flex; gap: 12px; align-items: center; padding: 10px; text-align: left; }
.fb-kopf .fb-bild { width: 84px; flex: none; }
.fb-kopf > span { display: grid; gap: 2px; }
.fb-kopf small { font-size: 12px; }
.kal-wahl { margin-bottom: 14px; }
.kal-kopf { display: flex; gap: 14px; align-items: center; }
.kal-bild { width: 120px; height: auto; flex: none; border-radius: 12px; background: rgba(0,0,0,.3); }
.mobil .kal-bild { width: 92px; }
.kal-liste { margin: 0; padding-left: 20px; display: grid; gap: 6px; font-size: 14px; line-height: 1.45; }
.kal-liste.fehler li::marker { color: var(--rot); }

/* ---- Hilfe: Beispielrolle, Trockner-Zeichnung, Fehlerbild-Fenster ---- */
.hi-rollenwahl { margin-top: 16px; }
.hi-tr-info + .hi-rollenwahl, .hi-bild-karte .hi-rollenwahl { margin-top: 0; }
.hi-werte { margin-top: 8px; }
.hi-fb-wahl { max-width: 420px; margin: 0 0 14px; }
.hi-fb-wahl .hi-rollenwahl { margin-top: 0; }
.tr-wert { pointer-events: none; }
.hi-fb-ebene { position: absolute; inset: 0; z-index: 26; display: grid; place-items: center; padding: 20px; }
.hi-fb-schleier { position: absolute; inset: 0; background: rgba(0,0,0,.6); backdrop-filter: blur(3px); animation: hi-fb-blende .22s ease both; }
.hi-fb-popup { position: relative; width: min(620px, 100%); max-height: 100%; overflow-y: auto; overscroll-behavior: contain; outline: none;
  padding: 24px; border-radius: 22px; background: rgba(16,22,20,.98); border: 1px solid rgba(255,181,71,.35); box-shadow: 0 30px 80px rgba(0,0,0,.6);
  animation: hi-fb-auf .24s cubic-bezier(.2,.8,.2,1) both; }
.hi-fb-ebene.zu { pointer-events: none; }
.hi-fb-ebene.zu .hi-fb-schleier { animation: hi-fb-blende-zu .18s ease forwards; }
.hi-fb-ebene.zu .hi-fb-popup { animation: hi-fb-zu .18s ease forwards; }
@keyframes hi-fb-blende { from { opacity: 0; } }
@keyframes hi-fb-blende-zu { to { opacity: 0; } }
@keyframes hi-fb-auf { from { opacity: 0; transform: translateY(14px) scale(.96); } }
@keyframes hi-fb-zu { to { opacity: 0; transform: translateY(10px) scale(.97); } }
.hi-fb-x { position: absolute; top: 12px; right: 12px; background: var(--flaeche-hover); border: 1px solid var(--rand); }
.hi-fb-x:hover { border-color: rgba(255,181,71,.5); }
.hi-fb-kopf { display: flex; gap: 16px; align-items: center; padding-right: 40px; }
.hi-fb-kopf .fb-bild { width: 180px; max-width: 40%; flex: none; }
.hi-fb-kopf p { margin: 4px 0 0; }
.hi-fb-ursachen { margin: 0; padding-left: 20px; display: grid; gap: 6px; font-size: 14px; line-height: 1.45; }
.hi-fb-ursachen li::marker { color: var(--amber); }
.mobil .hi-fb-ebene { padding: 12px 12px calc(12px + env(safe-area-inset-bottom)); }
.mobil .hi-fb-popup { padding: 18px 16px; border-radius: 18px; }
.mobil .hi-fb-kopf { flex-direction: column; align-items: flex-start; gap: 10px; padding-right: 36px; }
.mobil .hi-fb-kopf .fb-bild { width: 150px; max-width: 100%; }
@media (prefers-reduced-motion: reduce) { .hi-fb-schleier, .hi-fb-popup, .hi-fb-ebene.zu .hi-fb-schleier, .hi-fb-ebene.zu .hi-fb-popup { animation-duration: .01s; } }

/* ---- Werkstatt ---- */
.ws-kopfzeile { display: flex; gap: 12px; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
.ws-kopfzeile p { margin: 0; max-width: 760px; }
.mobil .ws-kopfzeile { flex-direction: column; align-items: stretch; }
.ws-liste { display: grid; gap: 10px; }
.ws-auftrag { display: flex; gap: 14px; align-items: flex-start; padding: 14px; }
.ws-nr { width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; background: var(--mint-weich); color: var(--mint); font-weight: 800; flex: none; }
.ws-text { flex: 1; min-width: 0; display: grid; gap: 4px; justify-items: start; }
.ws-text small { font-size: 13px; }
.ws-knoepfe { display: flex; gap: 6px; flex: none; }
.mobil .ws-auftrag { flex-wrap: wrap; }
.mobil .ws-knoepfe { width: 100%; justify-content: flex-end; }
.ws-ersatz { align-items: center; gap: 6px; }
.ws-ersatz .chip { font-size: 12px; padding: 5px 10px; }
.ws-einkauf, .ws-wartung { display: flex; gap: 14px; align-items: center; padding: 12px 14px; }
.ws-einkauf > div, .ws-wartung > .ws-text { flex: 1; display: grid; gap: 2px; min-width: 0; }
.ws-einkauf.dringend, .ws-wartung.dringend { border-color: rgba(255,107,107,.45); background: linear-gradient(90deg, rgba(255,107,107,.08), var(--flaeche)); }
.ws-icon { width: 28px; text-align: center; font-size: 20px; flex: none; }
.ws-balken, .ne-balken { height: 6px; border-radius: 3px; background: rgba(255,255,255,.07); overflow: hidden; width: 100%; margin: 4px 0; }
.ws-balken span, .ne-balken span { display: block; height: 100%; border-radius: 3px; background: var(--mint); animation: balken-wachsen .6s cubic-bezier(.2,.8,.2,1); transform-origin: left; }
.ws-balken span.amber, .ne-balken span.amber { background: var(--amber); }
.ws-balken span.rot, .ne-balken span.rot { background: var(--rot); }
@keyframes balken-wachsen { from { transform: scaleX(0); } }
.ws-raster { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
.mobil .ws-raster { grid-template-columns: 1fr; }
.ws-modell { display: grid; gap: 10px; padding: 12px; align-content: start; }
.mobil .ws-modell { grid-template-columns: 96px 1fr; }
.mobil .ws-modell .ws-modell-knoepfe { grid-column: 1 / -1; }
.ws-foto { aspect-ratio: 4 / 3; border-radius: 12px; overflow: hidden; background: rgba(0,0,0,.3); display: grid; place-items: center; font-size: 34px; }
.ws-foto img { width: 100%; height: 100%; object-fit: cover; animation: blende .3s ease; }
.ws-modell.fehl .ws-foto { box-shadow: inset 0 0 0 2px rgba(255,107,107,.4); }
.ws-modell-text { display: grid; gap: 3px; min-width: 0; }
.ws-modell-text strong { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ws-modell-text small { font-size: 12px; }
.ws-modell-knoepfe { display: flex; gap: 8px; align-items: center; }
.ws-modell-knoepfe .knopf { flex: 1; }
.ws-zwei { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.mobil .ws-zwei { grid-template-columns: 1fr; gap: 12px; }
.ws-saeulen { display: flex; gap: 10px; align-items: flex-end; height: 200px; padding-top: 10px; }
.ws-saeule { flex: 1; display: grid; grid-template-rows: auto 1fr auto; gap: 4px; height: 100%; text-align: center; font-size: 12px; }
.ws-saeule strong { font-size: 12px; }
.ws-saeule small { color: var(--leise); }
.ws-saeule-bahn { display: flex; flex-direction: column-reverse; border-radius: 8px; background: rgba(255,255,255,.04); overflow: hidden; }
.ws-saeule-bahn span { display: block; animation: saeule .7s cubic-bezier(.2,.8,.2,1); transform-origin: bottom; }
.ws-saeule-bahn .fil, .ws-legende i.fil { background: var(--mint); }
.ws-saeule-bahn .strom, .ws-legende i.strom { background: var(--amber); }
@keyframes saeule { from { transform: scaleY(0); } }
.ws-legende { display: flex; gap: 16px; margin-top: 8px; font-size: 12px; color: var(--leise); }
.ws-legende i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 6px; vertical-align: -1px; }

/* ---- Nerd ---- */
.ne-seite .stats { grid-template-columns: repeat(6, 1fr); }
.mobil .ne-seite .stats { grid-template-columns: repeat(3, 1fr); }
.mobil .ne-seite .stats .stat { display: flex; padding: 10px 12px; }
.mobil .ne-seite .stats .stat strong { font-size: 18px; }
.ne-balken-liste { display: grid; gap: 10px; }
.ne-balken-zeile { display: grid; grid-template-columns: minmax(0, 1fr) 1.2fr auto; gap: 10px; align-items: center; font-size: 13px; }
.ne-balken-zeile > span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ne-balken-zeile small { color: var(--leise); white-space: nowrap; }
.ne-phasen { display: flex; gap: 12px; height: 150px; align-items: flex-end; }
.ne-phase { flex: 1; display: grid; grid-template-rows: 1fr auto auto; height: 100%; text-align: center; gap: 4px; }
.ne-phase small { font-size: 11px; color: var(--leise); }
.ne-phase-bahn { display: flex; align-items: flex-end; border-radius: 8px; background: rgba(255,255,255,.04); overflow: hidden; }
.ne-phase-bahn span { width: 100%; background: linear-gradient(var(--rot), rgba(255,107,107,.5)); animation: saeule .7s cubic-bezier(.2,.8,.2,1); transform-origin: bottom; }
.ne-gesund { display: flex; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--rand); }
.ne-gesund:last-child { border-bottom: none; }
.ne-gesund > div { flex: 1; display: grid; gap: 2px; }
.ne-gesund small { font-size: 12px; }
.ne-gesund b { font-size: 14px; white-space: nowrap; }
.ne-gesund .punkt { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; font-weight: 800; background: rgba(255,255,255,.06); color: var(--leise); flex: none; }
.ne-gesund.gut .punkt { background: var(--mint-weich); color: var(--mint); }
.ne-gesund.schlecht .punkt { background: rgba(255,107,107,.16); color: var(--rot); }
.ne-heiz { display: grid; gap: 6px; padding: 12px 0; border-bottom: 1px solid var(--rand); }
.ne-heiz-wert { font-size: 26px; font-weight: 700; color: var(--mint); }
.ne-heiz-wert.amber { color: var(--amber); }
.ne-mini-saeulen { display: flex; gap: 3px; align-items: flex-end; height: 44px; }
.ne-mini-saeulen span { flex: 1; background: rgba(62,230,168,.5); border-radius: 2px 2px 0 0; animation: saeule .6s ease; transform-origin: bottom; }

/* ---- Suche ---- */
.such-schleier { z-index: 24; }
.such-box { position: absolute; z-index: 25; top: 70px; left: 50%; transform: translateX(-50%); width: min(640px, calc(100% - 32px)); max-height: calc(100% - 100px); display: flex; flex-direction: column;
  border-radius: 20px; background: rgba(14,22,19,.97); border: 1px solid rgba(62,230,168,.3); box-shadow: 0 24px 60px rgba(0,0,0,.6); animation: such-rein .2s cubic-bezier(.2,.8,.2,1); overflow: hidden; }
@keyframes such-rein { from { opacity: 0; transform: translate(-50%, -10px) scale(.98); } }
.mobil .such-box { top: 12px; max-height: calc(100% - 24px); }
.such-kopf { display: flex; align-items: center; gap: 10px; padding: 10px 10px 10px 16px; border-bottom: 1px solid var(--rand); }
.such-kopf input { flex: 1; min-width: 0; background: none; border: none; color: var(--text); font: inherit; font-size: 17px; padding: 8px 0; outline: none; }
.such-ergebnisse { overflow-y: auto; overscroll-behavior: contain; padding: 6px 8px 12px; }
.such-gruppe h4 { margin: 12px 8px 4px; font-size: 11px; text-transform: uppercase; letter-spacing: .8px; color: var(--leise); font-weight: 600; }
.such-treffer { width: 100%; display: flex; gap: 12px; align-items: center; padding: 9px 10px; border-radius: 12px; text-align: left; animation: blende .15s ease; }
.such-treffer:hover, .such-treffer:focus, .such-treffer.erst { background: var(--flaeche-hover); outline: none; }
.such-treffer > span:last-child { display: grid; min-width: 0; }
.such-treffer strong { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.such-treffer small { font-size: 12px; }
.such-icon { width: 28px; text-align: center; font-size: 18px; flex: none; }
.such-passend { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; padding: 0 10px 8px 50px; }
.such-passend .chip { font-size: 12px; padding: 4px 10px; }
.such-leer { padding: 22px 12px; text-align: center; font-size: 14px; }

/* ---- Mehr-Menü (Handy) ---- */
.mehr-schleier { z-index: 4; }
.mehr-sheet { position: absolute; z-index: 5; left: 0; right: 0; bottom: 0; padding: 4px 16px calc(84px + env(safe-area-inset-bottom)); display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
  border-radius: 22px 22px 0 0; background: rgba(14,22,19,.98); border-top: 1px solid var(--rand); animation: hoch .25s cubic-bezier(.2,.8,.2,1); }
.mehr-sheet .griff { grid-column: 1 / -1; margin-bottom: 6px; }
.mehr-punkt { position: relative; display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: 16px; background: var(--flaeche); border: 1px solid var(--rand); text-align: left; }
.mehr-punkt > span:first-child { font-size: 22px; }
.mehr-punkt.aktiv { background: var(--mint-weich); border-color: rgba(62,230,168,.45); color: var(--mint); }
.mehr-punkt .zahl-punkt { position: absolute; top: 8px; right: 8px; }
.suche-punkt { grid-column: 1 / -1; }
.mobil .nav-unten { z-index: 6; }

/* ==== 3D-Modelle: Orbit, Ausrichtungswürfel, Füllmuster, eigene Winkel, Warteschlange (v0.11) ==== */
.mod-ico { width: 18px; height: 18px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.mod-ico .voll { fill: currentColor; stroke: none; }
.mod-orbit { position: relative; }
.mod-leiste .mod-orbit-knopf { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px 5px 8px; }
.mod-orbit-knopf .mod-pfeil { font-size: 10px; opacity: .7; transition: transform .2s; }
.mod-orbit-knopf.an .mod-pfeil { transform: rotate(180deg); }
.mod-orbit-menue { position: absolute; z-index: 6; top: calc(100% + 8px); right: 0; width: 290px; padding: 6px; border-radius: 16px;
  background: rgba(14,22,19,.96); border: 1px solid var(--rand); backdrop-filter: blur(16px); box-shadow: 0 18px 40px rgba(0,0,0,.5);
  animation: dd-rein .18s cubic-bezier(.2,.8,.2,1); transform-origin: top right; }
.mod-orbit-punkt { width: 100%; display: flex; gap: 12px; align-items: center; text-align: left; padding: 10px; border-radius: 12px; }
.mod-orbit-punkt:hover { background: var(--flaeche-hover); }
.mod-orbit-punkt.an { background: var(--mint-weich); color: var(--mint); }
.mod-orbit-punkt .mod-ico { width: 24px; height: 24px; }
.mod-orbit-punkt > span:last-child { display: grid; gap: 2px; min-width: 0; }
.mod-orbit-punkt strong { font-size: 13px; }
.mod-orbit-punkt small { font-size: 11px; color: var(--leise); }
.mod-orbit-trenner { height: 1px; margin: 4px 8px; background: var(--rand); }
.mod-orbit-tipp { margin: 4px 10px 6px; }
.mod-schalter { position: relative; width: 30px; height: 18px; flex: none; border-radius: 9px; background: rgba(255,255,255,.14); transition: background .2s; }
.mod-schalter::after { content: ""; position: absolute; left: 2px; top: 2px; width: 14px; height: 14px; border-radius: 50%; background: #cfe0d8; transition: transform .2s cubic-bezier(.2,.8,.2,1); }
.mod-schalter.an { background: var(--mint); }
.mod-schalter.an::after { transform: translateX(12px); background: #062018; }
.mobil .mod-orbit-name { display: none; }
.mobil .mod-orbit { position: static; }
.mobil .mod-orbit-menue { left: 0; right: 0; width: auto; transform-origin: top center; }

/* Ausrichtungswürfel */
.mod-wuerfel-ecke { position: absolute; z-index: 2; top: 58px; right: 14px; width: calc(var(--w) * 1.7); height: calc(var(--w) * 1.7); pointer-events: none; }
.mobil .mod-wuerfel-ecke { top: 104px; right: 4px; }
.mod-wuerfel { position: absolute; inset: 0; pointer-events: none; touch-action: none; }
.mod-w-koerper { position: absolute; left: 50%; top: 50%; width: 0; height: 0; transform-style: preserve-3d; }
.mod-w-flaeche { position: absolute; left: calc(var(--w) / -2); top: calc(var(--w) / -2); width: var(--w); height: var(--w); display: grid;
  grid-template-columns: 20% 60% 20%; grid-template-rows: 20% 60% 20%; backface-visibility: hidden; -webkit-backface-visibility: hidden;
  background: linear-gradient(145deg, rgba(36,56,49,.95), rgba(16,26,23,.95)); border: 1px solid rgba(62,230,168,.38); border-radius: 4px; pointer-events: auto; }
.mod-w-flaeche.w-oben { background: linear-gradient(145deg, rgba(46,72,62,.96), rgba(22,36,31,.96)); }
.mod-w-flaeche.w-unten { background: linear-gradient(145deg, rgba(22,30,28,.96), rgba(12,18,16,.96)); }
.mod-w-zone { padding: 0; border-radius: 2px; display: grid; place-items: center; transition: background .12s; cursor: pointer; }
.mod-w-zone:hover { background: rgba(62,230,168,.45); }
.mod-w-zone.flaeche:hover { background: rgba(62,230,168,.22); }
.mod-w-zone span { font-size: calc(var(--w) * .145); font-weight: 800; letter-spacing: .6px; color: #d7efe5; pointer-events: none; user-select: none; }
.ziehbar .mod-w-zone { cursor: grab; }
.mod-wuerfel.zieht .mod-w-zone { cursor: grabbing; }
.mod-heim { position: absolute; left: 0; top: 0; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; pointer-events: auto;
  color: var(--leise); background: rgba(8,12,11,.7); border: 1px solid var(--rand); backdrop-filter: blur(8px); transition: color .15s, transform .15s; }
.mod-heim:hover { color: var(--mint); transform: scale(1.08); }
.mod-heim .mod-ico { width: 16px; height: 16px; }
.mod-achsen { position: absolute; left: -14px; bottom: -16px; width: 54px; height: 54px; overflow: visible; pointer-events: none; }
.mod-achsen line { stroke-width: 2.2; stroke-linecap: round; transition: opacity .2s; }
.mod-achsen text { font-size: 9px; font-weight: 800; text-anchor: middle; stroke: none; transition: opacity .2s; }
.mod-achsen .a-x { stroke: #ff6b6b; fill: #ff6b6b; }
.mod-achsen .a-y { stroke: #4fe08a; fill: #4fe08a; }
.mod-achsen .a-z { stroke: #5cc8ff; fill: #5cc8ff; }
.mod-achsen text.a-x, .mod-achsen text.a-y, .mod-achsen text.a-z { stroke: none; }

/* Drehpunkt beim Orbit */
.mod-drehpunkt { position: absolute; left: -7px; top: -7px; width: 14px; height: 14px; border-radius: 50%; pointer-events: none; z-index: 1; opacity: 0;
  background: var(--mint); box-shadow: 0 0 0 4px rgba(62,230,168,.25), 0 0 14px rgba(62,230,168,.8); transition: opacity .15s; }
.mod-drehpunkt.an { opacity: 1; }
.mod-drehpunkt.mitte { background: var(--amber); box-shadow: 0 0 0 4px rgba(255,181,71,.25), 0 0 14px rgba(255,181,71,.7); }
.mod-marker.versteckt { display: none; }

/* Warteschlange: immer sichtbar unten in der Seitenleiste */
.mod-inhalt { padding-bottom: 20px; }
.mod-fuss { flex: none; padding: 12px 18px 16px; border-top: 1px solid var(--rand); background: linear-gradient(180deg, rgba(8,12,11,.2), rgba(8,12,11,.55)); }
.mod-ws { box-shadow: 0 6px 20px rgba(62,230,168,.18); }
.mobil .mod-seite { overflow: visible; }
.mobil .mod-fuss { position: sticky; z-index: 2; bottom: calc(76px + env(safe-area-inset-bottom)); margin: 0 10px 10px; padding: 8px; border: 1px solid var(--rand); border-radius: 16px;
  background: rgba(14,22,19,.9); backdrop-filter: blur(14px); box-shadow: 0 10px 30px rgba(0,0,0,.45); }

/* Füllmuster */
.mod-muster { display: flex; gap: 12px; align-items: flex-start; margin: 6px 0 10px; }
.mod-muster-vorschau { width: 64px; height: 64px; flex: none; margin-top: 4px; border-radius: 12px; overflow: hidden; background: rgba(0,0,0,.25); border: 1px solid var(--rand); }
.mod-muster-bild { width: 100%; height: 100%; display: block; animation: blende .25s ease; }
.mod-muster-bild rect { fill: none; stroke: rgba(255,170,90,.55); stroke-width: .9; }
.mod-muster-bild path { fill: none; stroke: #d94d59; stroke-width: .75; stroke-linecap: round; }
.mod-muster-text { flex: 1; min-width: 0; }
.mod-muster-text p { margin: 6px 0 0; }
.mod-muster-text .pille { font-size: 10px; padding: 1px 7px; margin-left: 4px; vertical-align: 1px; }

/* Eigene Drehwinkel */
.mod-dreh-eigen { margin: 8px 0 14px; padding: 12px; border-radius: 14px; background: rgba(0,0,0,.2); border: 1px solid rgba(62,230,168,.25); animation: ansicht-rein .22s ease; }
.mod-dreh-felder { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.mod-dreh-feld { display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 12px; background: rgba(0,0,0,.3); border: 1px solid var(--rand); transition: border-color .15s, box-shadow .15s; }
.mod-dreh-feld.aktiv { border-color: rgba(62,230,168,.55); box-shadow: 0 0 0 3px rgba(62,230,168,.1); }
.mod-dreh-feld span { font-weight: 800; font-size: 13px; }
.mod-dreh-feld.a-x span { color: #ff6b6b; }
.mod-dreh-feld.a-y span { color: #4fe08a; }
.mod-dreh-feld.a-z span { color: #5cc8ff; }
.mod-dreh-feld input { flex: 1; min-width: 0; width: 100%; padding: 8px 2px; border: none; background: none; color: var(--text); font: inherit; font-size: 16px; text-align: right; font-variant-numeric: tabular-nums; outline: none; -moz-appearance: textfield; }
.mod-dreh-feld input::-webkit-inner-spin-button { opacity: .4; }
.mod-dreh-feld small { color: var(--leise); }
.mod-dreh-schnell { margin: 10px 0 4px; }
.mod-dreh-schnell .chip { padding: 5px 10px; font-size: 12px; font-variant-numeric: tabular-nums; }
.mod-dreh-eigen .knopf-reihe { margin-top: 8px; }

/* ---- Sicherungs-Balken ---- */
.bu-balken.blau { background: linear-gradient(90deg, rgba(92,200,255,.18), rgba(92,200,255,.05)); border-bottom-color: rgba(92,200,255,.4); }
/* ==== Allgemein: Kopfzeilen-Suche, Regler-Wertbox, Wartungs-Infos ==== */
:host { --gelb: #ffd54a; --gelb-weich: rgba(255,213,74,.14); }
/* Suche in der Kopfzeile links neben „Filament“ */
.kopf-suche { display: flex; align-items: center; gap: 8px; flex: none; height: 38px; padding: 0 8px 0 12px; margin-left: 8px; border-radius: 12px;
  border: 1px solid var(--rand); background: rgba(0,0,0,.28); color: var(--leise); font-size: 14px; transition: border-color .15s, background .15s, color .15s; }
.kopf-suche:hover, .kopf-suche:focus-visible { border-color: rgba(62,230,168,.5); background: rgba(62,230,168,.06); color: var(--text); outline: none; }
.kopf-suche-icon { font-size: 15px; }
.kopf-suche-text { min-width: 64px; text-align: left; }
.kopf-suche kbd { font: inherit; font-size: 11px; letter-spacing: .3px; padding: 2px 6px; border-radius: 6px; border: 1px solid var(--rand); background: rgba(255,255,255,.04); color: var(--leise); }
.kopf-suche + .nav-oben { margin-left: 0; }
.nav-oben .nav-punkt { white-space: nowrap; flex: none; }
@media (max-width: 1400px) { .nav-oben .nav-punkt { padding: 8px 9px; gap: 6px; } }
@media (max-width: 1340px) { .kopf .speicher { font-size: 0; } .kopf .speicher::before { font-size: 14px; } }
@media (max-width: 1320px) { .nav-oben .nav-name { display: none; } .nav-oben .nav-punkt { padding: 8px 11px; } .nav-oben .nav-icon { font-size: 18px; } }
@media (max-width: 1640px) { .kopf-suche kbd { display: none; } }
@media (max-width: 1520px) { .kopf-suche-text { display: none; } .kopf-suche { width: 38px; padding: 0; justify-content: center; margin-left: 4px; } }

/* Regler: aktueller Wert in gelber Box über dem Knopf, antippen zum Eintippen */
.regler-wert { position: absolute; z-index: 35; transform: translateY(-100%); display: grid; justify-items: center; gap: 2px;
  padding: 3px; border-radius: 11px; background: var(--gelb); color: #1b1503; box-shadow: 0 0 0 4px rgba(255,213,74,.16), 0 6px 18px rgba(0,0,0,.5);
  animation: regler-wert-rein .14s ease-out; pointer-events: auto; }
.regler-wert::after { content: ""; position: absolute; left: var(--spitze, 50%); bottom: -5px; width: 10px; height: 10px; margin-left: -5px; background: var(--gelb); transform: rotate(45deg); border-radius: 2px; }
@keyframes regler-wert-rein { from { opacity: 0; transform: translateY(calc(-100% + 6px)); } }
.regler-wert-knopf { display: flex; align-items: baseline; gap: 6px; padding: 3px 8px; border-radius: 8px; color: inherit; font-weight: 800; font-size: 15px; font-variant-numeric: tabular-nums; white-space: nowrap; min-height: 28px; }
.regler-wert-knopf:hover, .regler-wert-knopf:focus-visible { background: rgba(0,0,0,.08); outline: none; }
.regler-wert-knopf i { font-style: normal; font-weight: 400; font-size: 12px; opacity: .6; }
.regler-wert small { position: relative; z-index: 1; font-size: 11px; font-weight: 600; padding: 0 6px 2px; white-space: nowrap; opacity: .8; }
.regler-wert-feld { width: 9ch; min-width: 72px; padding: 5px 8px; border-radius: 8px; border: 2px solid rgba(27,21,3,.55); background: #fff8dc; color: #1b1503;
  font: inherit; font-weight: 800; font-size: 16px; text-align: center; outline: none; font-variant-numeric: tabular-nums; }
.regler-wert-feld:focus { border-color: #1b1503; }
.regler-wert-feld.falsch { border-color: var(--rot); background: #ffe1e1; animation: regler-wackeln .25s; }
@keyframes regler-wackeln { 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
input[type=range]:active::-webkit-slider-thumb { background: var(--gelb); box-shadow: 0 0 0 7px rgba(255,213,74,.2), 0 2px 8px rgba(0,0,0,.4); }

/* Wartung: Info mit kleiner P1S-Zeichnung */
.ws-wartung { flex-wrap: wrap; }
.ws-info-knopf { width: 32px; height: 32px; border-radius: 10px; flex: none; display: grid; place-items: center; font-size: 15px; font-weight: 700; color: var(--leise); border: 1px solid var(--rand); }
.ws-info-knopf:hover { color: var(--text); background: var(--flaeche-hover); }
.ws-info-knopf.an { color: #1b1503; background: var(--gelb); border-color: var(--gelb); }
.ws-info { flex: 1 0 100%; display: flex; gap: 14px; align-items: center; padding: 12px; border-radius: 14px; background: rgba(0,0,0,.28); border: 1px solid rgba(255,213,74,.22); animation: blende .2s ease; }
.ws-info-bild { width: 170px; flex: none; }
.ws-info-bild svg { width: 100%; height: auto; display: block; }
.ws-info-text { display: grid; gap: 6px; font-size: 14px; line-height: 1.45; min-width: 0; }
.ws-info-text p { margin: 0; }
.ws-info-text b { color: var(--gelb); font-weight: 600; }
.mobil .ws-info { flex-direction: column; align-items: stretch; }
.mobil .ws-info-bild { width: min(240px, 100%); align-self: center; }
.ws-p1s .an { filter: drop-shadow(0 0 3px rgba(255,213,74,.85)); }
.ws-p1s .ws-p1s-puls { fill: none; stroke: var(--gelb); stroke-width: 1.4; animation: ws-puls 1.8s ease-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes ws-puls { from { opacity: .9; transform: scale(.6); } to { opacity: 0; transform: scale(1.6); } }

/* ==== Drucker-Steuerung: geladenes Filament, Zieltemperatur, Lüfter (v0.11) ==== */
:host { --gruen: #5be37d; --gruen-weich: rgba(91,227,125,.14); }
.pille.gruen { color: var(--gruen); background: var(--gruen-weich); }
/* Kachel der geladenen Rolle */
.kachel.geladen { border: 1.5px solid rgba(91,227,125,.75); background: linear-gradient(160deg, rgba(91,227,125,.16), transparent 60%), var(--flaeche);
  box-shadow: 0 0 0 1px rgba(91,227,125,.15), 0 0 22px rgba(91,227,125,.18); }
.kachel.geladen:hover { border-color: var(--gruen); }
.badge-geladen { position: absolute; top: 12px; left: 12px; z-index: 1; font-size: 10px; font-weight: 700; color: #062012; background: var(--gruen); border-radius: 6px; padding: 2px 7px; letter-spacing: .3px; }
.mobil .badge-geladen { font-size: 9px; padding: 2px 5px; }
.kachel.geladen .kachel-achtung { top: 34px; }
/* Knopf „Geladen“ in der Detailansicht */
.geladen-knopf { margin-left: 6px; font-size: 12px; font-weight: 600; padding: 2px 10px; border-radius: 999px; color: var(--leise); border: 1px solid var(--rand); vertical-align: middle; }
.geladen-knopf:hover { color: var(--gruen); border-color: rgba(91,227,125,.5); }
.geladen-knopf.an { color: #062012; background: var(--gruen); border-color: var(--gruen); }
/* Karte „Geladenes Filament“ */
.dr-filament.geladen { border-color: rgba(91,227,125,.45); background: radial-gradient(360px 160px at 0% 0%, rgba(91,227,125,.10), transparent 70%), var(--flaeche); }
.dr-fil-zeile { display: flex; gap: 14px; align-items: center; }
.dr-fil-spule { width: 52px; height: 52px; flex: none; display: grid; place-items: center; }
.dr-fil-leer { width: 46px; height: 46px; border-radius: 50%; border: 1.5px dashed var(--rand); display: grid; place-items: center; color: var(--leise); font-size: 20px; }
.dr-fil-text { flex: 1; min-width: 0; display: grid; gap: 2px; }
.dr-fil-text small { color: var(--leise); font-size: 12px; }
.dr-fil-wahl { display: flex; gap: 10px; align-items: center; margin-top: 12px; }
.dr-fil-wahl .auswahl { flex: 1; min-width: 0; margin: 0; }
.mobil .dr-fil-wahl { flex-direction: column; align-items: stretch; }
.dr-filament > .mini { margin: 10px 0 0; }
/* Zieltemperatur eingeben */
.dr-temp-fuss { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
.dr-soll { display: inline-flex; align-items: center; gap: 6px; margin-left: auto; }
.dr-soll input { width: 74px; padding: 6px 8px; border-radius: 10px; border: 1px solid var(--rand); background: rgba(0,0,0,.3); color: var(--text); font: inherit; font-size: 14px; text-align: right; }
.dr-soll input:focus { outline: none; border-color: rgba(62,230,168,.6); }
.dr-soll input.fehler { border-color: var(--rot); background: rgba(255,107,107,.1); }
.dr-soll .mini { margin: 0; min-width: 62px; }
.dr-einheit { color: var(--leise); font-size: 13px; }
.dr-rolle-chip { padding: 4px 10px; font-size: 12px; }
.dr-soll.breit { display: flex; margin: 0; }
.dr-soll.breit input { flex: 1; width: auto; padding: 10px 12px; font-size: 15px; }
/* Lüfter zum Antippen */
.dr-titel-zusatz { font-weight: 400; margin-left: 8px; font-size: 12px; }
.dr-l-knopf { position: relative; color: inherit; cursor: pointer; transition: border-color .15s, background .15s; }
.dr-l-knopf:hover { border-color: rgba(62,230,168,.5); background: var(--mint-weich); }
.dr-l-stift { position: absolute; top: 6px; right: 8px; font-style: normal; font-size: 11px; color: var(--leise); }
.dr-stufen { margin: 12px 0 4px; }
.dr-stufen .chip { min-width: 54px; }
/* ===== Hilfe › Kunststoffe und Fehlercodes (kunststoffe.js) ===== */
.ks-seite, .cd-seite { max-width: 1240px; }
.ks-kopfzeile { display: flex; gap: 16px; align-items: center; margin-bottom: 12px; }
.ks-einleitung { flex: 1; margin: 0; font-size: 14px; }
.ks-suche { flex: 0 1 360px; }
.mobil .ks-kopfzeile { flex-direction: column; align-items: stretch; gap: 10px; }
.mobil .ks-suche { flex: none; min-width: 0; width: 100%; }
.ks-filter { margin-bottom: 14px; }
.ks-warnung { border: 1px solid rgba(255,181,71,.45); background: linear-gradient(135deg, rgba(255,181,71,.12), rgba(255,181,71,.04)); border-radius: 14px; padding: 14px 16px; margin-bottom: 14px; animation: ansicht-rein .3s ease; }
.ks-warnung > strong { color: var(--amber); display: block; margin-bottom: 4px; }
.ks-warnung p { margin: 6px 0 0; font-size: 14px; line-height: 1.5; }
.ks-raster { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 14px; align-items: start; }
.mobil .ks-raster { grid-template-columns: 1fr; gap: 12px; }
.ks-karte { position: relative; background: var(--flaeche); border: 1px solid var(--rand); border-radius: var(--radius); padding: 16px 16px 14px 18px; backdrop-filter: blur(10px); overflow: hidden;
  transition: border-color .2s, background .2s; animation: ansicht-rein .35s ease both; }
.ks-karte::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 3px; background: var(--ks-farbe); box-shadow: 0 0 14px var(--ks-farbe); opacity: .8; }
.ks-karte:hover { border-color: rgba(62,230,168,.28); }
.ks-karte.auf { grid-column: 1 / -1; border-color: rgba(62,230,168,.35); background: radial-gradient(600px 200px at 0% 0%, rgba(62,230,168,.07), transparent 70%), var(--flaeche); }
.ks-karte.fremd { border-style: dashed; }
.ks-kopf { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; padding: 0; }
.ks-name { flex: 1; min-width: 0; display: grid; gap: 1px; }
.ks-name strong { font-size: 19px; letter-spacing: .2px; color: var(--ks-farbe); }
.ks-name small { color: var(--leise); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ks-pfeil { color: var(--leise); font-size: 20px; line-height: 1; transition: transform .2s ease, color .2s; }
.auf > .ks-kopf .ks-pfeil, .auf > .ks-var-kopf .ks-pfeil, .auf > .cd-gruppe-kopf .ks-pfeil { transform: rotate(90deg); color: var(--mint); }
.ks-kurz { font-size: 13.5px; line-height: 1.45; margin: 8px 0 10px; color: #cfe0d8; }
.ks-fremd { display: inline-block; font-size: 11px; color: var(--leise); border: 1px dashed var(--rand); border-radius: 6px; padding: 1px 6px; }
.ks-ampel { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; padding: 4px 9px; border-radius: 999px; white-space: nowrap; border: 1px solid; flex: none; text-transform: none; letter-spacing: 0; font-weight: 500; }
.ks-ampel i { width: 8px; height: 8px; border-radius: 50%; background: currentColor; box-shadow: 0 0 8px currentColor; }
.ks-ampel.gruen { color: var(--mint); border-color: rgba(62,230,168,.4); background: var(--mint-weich); }
.ks-ampel.gelb { color: #ffd166; border-color: rgba(255,209,102,.4); background: rgba(255,209,102,.1); }
.ks-ampel.orange { color: #ff9f5a; border-color: rgba(255,159,90,.45); background: rgba(255,159,90,.1); }
.ks-ampel.rot { color: var(--rot); border-color: rgba(255,107,107,.45); background: rgba(255,107,107,.1); }
.ks-werte { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.ks-wert { background: rgba(0,0,0,.22); border: 1px solid var(--rand); border-radius: 10px; padding: 6px 9px; display: grid; gap: 1px; min-width: 0; }
.ks-wert span { font-size: 11px; color: var(--leise); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ks-wert strong { font-size: 13px; font-weight: 600; overflow-wrap: anywhere; }
.ks-wert.breit { grid-column: 1 / -1; }
.chip.ks-mehr { font-size: 12px; padding: 4px 10px; border-style: dashed; color: var(--mint); }
.ks-wert.amber strong { color: var(--amber); }
.ks-wert[title] { cursor: help; }
.ks-rollen { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 10px; }
.ks-rollen-titel { font-size: 11px; color: var(--leise); text-transform: uppercase; letter-spacing: .6px; margin-right: 2px; }
.chip.ks-rolle { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px 4px 6px; font-size: 12px; border-color: rgba(62,230,168,.3); }
.chip.ks-rolle:hover { border-color: rgba(62,230,168,.6); background: var(--mint-weich); }
.chip.ks-rolle small { color: var(--leise); font-size: 11px; }
.ks-farbe { width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(255,255,255,.25); flex: none; }
.ks-farbe.klar { background: repeating-conic-gradient(rgba(255,255,255,.35) 0 25%, transparent 0 50%) 0 0 / 6px 6px; }
.ks-var-vorschau { display: block; width: 100%; text-align: left; margin-top: 10px; font-size: 12px; color: var(--mint); padding: 8px 0 0; border-top: 1px solid var(--rand); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ks-var-vorschau span { color: var(--leise); }
.ks-var-vorschau:hover span { color: var(--text); }
.ks-detail { padding-top: 14px; margin-top: 12px; border-top: 1px solid var(--rand); display: grid; gap: 10px; }
.ks-block h4, .ks-var-titel { margin: 0 0 4px; font-size: 12px; font-weight: 600; color: var(--leise); text-transform: uppercase; letter-spacing: .6px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ks-block p { margin: 0; font-size: 14px; line-height: 1.5; }
.ks-block ul { margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.55; }
.ks-pro-contra { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.mobil .ks-pro-contra { grid-template-columns: 1fr; }
.ks-block.pro, .ks-block.contra, .ks-block.ks-p1s, .ks-block.ks-sicher, .ks-block.ks-essen { background: rgba(0,0,0,.18); border: 1px solid var(--rand); border-radius: 12px; padding: 10px 12px; }
.ks-block.pro li::marker { color: var(--mint); }
.ks-block.contra li::marker { color: var(--amber); }
.ks-block.ks-essen { border-color: rgba(255,181,71,.25); }
.ks-var-titel { margin-top: 6px; }
.ks-var-titel .leise { text-transform: none; letter-spacing: 0; font-weight: 400; }
.ks-varianten { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 8px; align-items: start; }
.mobil .ks-varianten { grid-template-columns: 1fr; }
.ks-variante { border: 1px solid var(--rand); border-radius: 12px; background: rgba(255,255,255,.02); transition: border-color .2s, background .2s; }
.ks-variante:hover { border-color: rgba(62,230,168,.25); }
.ks-variante.auf { grid-column: 1 / -1; border-color: rgba(62,230,168,.35); background: rgba(62,230,168,.04); }
.ks-var-kopf { display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 12px; text-align: left; }
.ks-var-name { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; }
.ks-var-name strong { font-size: 14px; font-weight: 600; }
.ks-neu, .ks-hab { font-style: normal; font-size: 11px; padding: 1px 7px; border-radius: 999px; }
.ks-neu { color: #8fd8ff; border: 1px solid rgba(143,216,255,.35); }
.ks-hab { color: var(--mint); border: 1px solid rgba(62,230,168,.35); }
.ks-var-tags { font-size: 12px; letter-spacing: 1px; opacity: .85; }
.ks-var-detail { padding: 0 12px 12px; display: grid; gap: 8px; }
.ks-var-detail h5 { margin: 0 0 2px; font-size: 12px; color: var(--leise); font-weight: 600; }
.ks-var-detail p { margin: 0; font-size: 13.5px; line-height: 1.5; }
.ks-var-detail .ks-rollen { margin-top: 2px; }
.ks-var-detail p.ks-unsicher { color: var(--leise); font-size: 12.5px; }
.ks-pruefen { display: inline-block; font-size: 10.5px; padding: 0 6px; border-radius: 6px; border: 1px dashed rgba(255,209,102,.5); color: #ffd166; margin-right: 4px; cursor: help; }
.ks-legende { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
.ks-leer { text-align: center; }
/* Fehlercodes */
.cd-kopf { display: flex; gap: 16px; align-items: center; margin-bottom: 12px; background: radial-gradient(500px 160px at 0% 0%, rgba(62,230,168,.08), transparent 70%), var(--flaeche); }
.cd-kopf-text { flex: 1; min-width: 0; }
.cd-kopf p { margin: 4px 0 0; font-size: 14px; }
.cd-wiki { text-decoration: none; white-space: nowrap; flex: none; }
.mobil .cd-kopf { flex-direction: column; align-items: stretch; }
.mobil .cd-wiki { text-align: center; }
.cd-suche { width: 100%; min-width: 0; margin-bottom: 12px; }
.cd-gruppen { display: grid; gap: 10px; }
.cd-gruppe { background: var(--flaeche); border: 1px solid var(--rand); border-radius: 16px; backdrop-filter: blur(10px); transition: border-color .2s; animation: ansicht-rein .3s ease both; }
.cd-gruppe.auf { border-color: rgba(62,230,168,.32); }
.cd-gruppe-kopf { display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px 16px; text-align: left; }
.cd-gruppe-kopf strong { flex: 1; font-size: 15px; }
.cd-icon { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; background: rgba(0,0,0,.25); border: 1px solid var(--rand); font-size: 17px; flex: none; }
.cd-anzahl { font-size: 12px; color: var(--mint); background: var(--mint-weich); border-radius: 999px; padding: 2px 9px; }
.cd-codes { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 8px; padding: 0 12px 12px; }
.mobil .cd-codes { grid-template-columns: 1fr; padding: 0 10px 10px; }
.cd-code { background: rgba(0,0,0,.22); border: 1px solid var(--rand); border-radius: 12px; padding: 10px 12px; display: grid; gap: 6px; align-content: start; }
.cd-code-kopf { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.cd-code-kopf code { font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace; font-size: 13px; color: var(--mint); letter-spacing: .3px; }
.cd-code-kopf small { font-size: 11.5px; }
.cd-art { font-size: 10.5px; color: var(--leise); border: 1px solid var(--rand); border-radius: 6px; padding: 0 6px; }
.cd-text { margin: 0; font-size: 14px; line-height: 1.45; }
.cd-tun { margin: 0; font-size: 13px; line-height: 1.45; color: #cfe0d8; }
.cd-tun span { display: inline-block; font-size: 10.5px; text-transform: uppercase; letter-spacing: .6px; color: #062018; background: var(--mint); border-radius: 5px; padding: 0 5px; margin-right: 6px; font-weight: 700; }
.cd-quelle { margin-top: 14px; }

/* ==== Werkstatt v0.12: Bibliothek-Filter, kluge Warteschlange, Projekte, Werkzeug & Zubehör (Inventar) ==== */
/* Warteschlange: Umschalter, Zeitplan, Trenner je Rolle, rote Markierung */
.ws-modus { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; }
.ws-modus .mini { margin: 0; }
.ws-umschalter { display: inline-flex; padding: 3px; border-radius: 12px; background: rgba(0,0,0,.3); border: 1px solid var(--rand); }
.ws-umschalter button { padding: 7px 14px; border-radius: 9px; font-size: 13px; color: var(--leise); transition: background .18s, color .18s; white-space: nowrap; }
.ws-umschalter button:hover { color: var(--text); }
.ws-umschalter button.an { background: var(--mint-weich); color: var(--mint); box-shadow: inset 0 0 0 1px rgba(62,230,168,.45); }
.mobil .ws-modus { flex-direction: column; align-items: stretch; }
.mobil .ws-umschalter { display: grid; grid-template-columns: 1fr 1fr; }
.ws-plan { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; padding: 14px 16px; margin-bottom: 12px;
  background: radial-gradient(420px 140px at 0% 0%, rgba(62,230,168,.08), transparent 70%), var(--flaeche); }
.mobil .ws-plan { grid-template-columns: 1fr; gap: 10px; }
.ws-plan-zeile { display: flex; gap: 10px; align-items: flex-start; min-width: 0; }
.ws-plan-zeile > div { display: grid; gap: 2px; min-width: 0; }
.ws-plan-zeile strong { font-size: 14px; }
.ws-plan-zeile small { font-size: 12px; line-height: 1.35; }
.ws-plan-icon { width: 30px; height: 30px; flex: none; display: grid; place-items: center; border-radius: 9px; background: rgba(0,0,0,.28); font-size: 15px; }
.ws-plan-zahl { color: var(--gelb); font-size: 17px; }
.ws-trenner { display: flex; align-items: center; gap: 8px; margin: 8px 0 -2px; font-size: 12px; font-weight: 600; color: var(--leise); letter-spacing: .2px; animation: blende .25s ease; }
.ws-trenner::after { content: ""; flex: 1; height: 1px; background: var(--rand); }
.ws-trenner .farbtupfer { width: 14px; height: 14px; border-width: 1px; }
.ws-trenner.geladen { color: var(--gruen); }
.ws-trenner.geladen::after { background: rgba(91,227,125,.35); }
.ws-pillen { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.pille.ws-uhr { color: var(--gelb); background: var(--gelb-weich); font-variant-numeric: tabular-nums; }
.pille.ws-ohne-dauer { color: var(--leise); background: rgba(255,255,255,.05); font-weight: 500; }
.pille.ws-pj-pille { color: var(--pj, var(--mint)); background: color-mix(in srgb, var(--pj, var(--mint)) 14%, transparent); border: 1px solid color-mix(in srgb, var(--pj, var(--mint)) 35%, transparent); }
button.pille.ws-pj-pille:hover { background: color-mix(in srgb, var(--pj, var(--mint)) 24%, transparent); }
.ws-auftrag.fehlt { border-color: rgba(255,107,107,.5); background: linear-gradient(90deg, rgba(255,107,107,.10), var(--flaeche) 40%); box-shadow: inset 3px 0 0 var(--rot); }
.ws-nr { position: relative; }
.ws-auftrag.fehlt .ws-nr { background: rgba(255,107,107,.16); color: var(--rot); }
.ws-rot-punkt { position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; border-radius: 50%; background: var(--rot); box-shadow: 0 0 0 2px var(--grund), 0 0 10px var(--rot); animation: ws-rot-puls 1.6s ease-in-out infinite; }
@keyframes ws-rot-puls { 50% { box-shadow: 0 0 0 2px var(--grund), 0 0 2px var(--rot); } }
.mobil .ws-knoepfe { flex-wrap: wrap; }

/* Bibliothek: Suche, Filter, Trefferzahl */
.ws-bib-werkzeug { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 10px; }
.ws-bib-werkzeug .such-feld { flex: 1 1 260px; max-width: 360px; }
.ws-bib-filter { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.ws-bib-filter .auswahl { min-width: 170px; }
.ws-bib-status .chip { padding: 8px 12px; }
.mobil .ws-bib-werkzeug { display: grid; grid-template-columns: 1fr auto; }
.mobil .ws-bib-werkzeug .such-feld { max-width: none; }
.mobil .ws-bib-filter { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 10px; border-radius: 14px; border: 1px solid rgba(62,230,168,.3); background: rgba(62,230,168,.05); animation: hoch .18s ease; }
.mobil .ws-bib-filter .auswahl { min-width: 0; }
.mobil .ws-bib-status { grid-column: 1 / -1; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; }
.ws-treffer { display: flex; gap: 10px; align-items: center; justify-content: space-between; min-height: 30px; margin-bottom: 10px; font-size: 13px; color: var(--leise); }
.ws-treffer strong { color: var(--text); }
.ws-treffer .mini { margin-left: 0; flex: none; }
.ws-bib-leer { grid-column: 1 / -1; }
.ws-modell-knoepfe .rund { flex: none; }
.ws-modell { min-width: 0; }
.ws-modell-knoepfe { flex-wrap: wrap; }
.ws-modell-knoepfe .knopf { min-width: 0; }

/* Projekte: Übersicht */
.ws-pj-raster { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
.mobil .ws-pj-raster { grid-template-columns: 1fr; }
.ws-pj-karte { position: relative; overflow: hidden; display: grid; grid-template-columns: auto 1fr auto; gap: 6px 12px; align-items: center; text-align: left; padding: 16px 16px 14px 18px; color: inherit;
  background: radial-gradient(300px 120px at 0% 0%, color-mix(in srgb, var(--pj) 14%, transparent), transparent 70%), var(--flaeche); transition: border-color .18s, transform .18s; }
.ws-pj-karte::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--pj); box-shadow: 0 0 14px var(--pj); }
.ws-pj-karte:hover { border-color: color-mix(in srgb, var(--pj) 55%, transparent); transform: translateY(-1px); }
.ws-pj-icon { width: 44px; height: 44px; border-radius: 13px; display: grid; place-items: center; font-size: 22px; background: color-mix(in srgb, var(--pj) 16%, transparent); border: 1px solid color-mix(in srgb, var(--pj) 40%, transparent); }
.ws-pj-icon.klein { width: 34px; height: 34px; border-radius: 10px; font-size: 17px; flex: none; }
.ws-pj-text { display: grid; gap: 2px; min-width: 0; }
.ws-pj-text strong { font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ws-pj-text small { font-size: 12px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.ws-pj-prozent { font-weight: 800; font-size: 18px; color: var(--pj); font-variant-numeric: tabular-nums; }
.ws-pj-balken { grid-column: 1 / -1; margin: 6px 0 0; }
.ws-pj-balken span, .ws-pj-detail .ws-balken span { background: var(--pj); box-shadow: 0 0 10px var(--pj); }
.ws-pj-fuss { grid-column: 1 / -1; font-size: 12px; }
/* Projekte: Detail */
.ws-pj-zurueck { margin: 0 0 10px; color: var(--leise); border-color: var(--rand); }
.ws-pj-zurueck:hover { color: var(--text); }
.ws-pj-kopf { display: flex; gap: 18px; align-items: center; margin-bottom: 12px; background: radial-gradient(420px 180px at 0% 0%, color-mix(in srgb, var(--pj) 14%, transparent), transparent 70%), var(--flaeche);
  border-color: color-mix(in srgb, var(--pj) 35%, transparent); }
.ws-pj-ring { position: relative; width: 112px; height: 112px; flex: none; }
.ws-pj-ring .ring { overflow: visible; }
.ws-pj-ring-text { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; }
.ws-pj-ring-text span { font-size: 22px; line-height: 1; }
.ws-pj-ring-text strong { font-size: 18px; }
.ws-pj-kopf-text { min-width: 0; display: grid; gap: 4px; }
.ws-pj-kopf-text h2 { margin: 0; font-size: 22px; overflow-wrap: anywhere; }
.ws-pj-kopf-text p { margin: 0; line-height: 1.4; }
.ws-pj-kopf-knoepfe { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
.knopf.rot-text { color: var(--rot); }
.mobil .ws-pj-kopf { flex-direction: column; align-items: stretch; text-align: center; }
.mobil .ws-pj-ring { align-self: center; }
.mobil .ws-pj-kopf-knoepfe { justify-content: center; }
.ws-pj-zahlen { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; }
.mobil .ws-pj-zahlen { grid-template-columns: 1fr 1fr; gap: 8px; }
.ws-pj-zahl { display: grid; gap: 2px; padding: 12px 14px; border-radius: 14px; background: var(--flaeche); border: 1px solid var(--rand); animation: blende .3s ease; }
.ws-pj-zahl span { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: var(--leise); }
.ws-pj-zahl strong { font-size: 20px; font-variant-numeric: tabular-nums; }
.ws-pj-zahl small { font-size: 11px; color: var(--leise); }
.ws-pj-teile-kopf { align-items: center; }
.ws-pj-teile-kopf h3 { margin: 0; }
.mobil .ws-pj-teile-kopf { flex-direction: row; }
.ws-pj-teil.fertig { border-color: rgba(62,230,168,.35); }
.ws-pj-teil.fertig .ws-foto { box-shadow: inset 0 0 0 2px rgba(62,230,168,.4); }
.ws-pj-teil .ws-modell-knoepfe { flex-wrap: wrap; }
/* Projekt-Dialoge */
.ws-pj-farben { gap: 10px; }
.ws-farbe { width: 32px; height: 32px; border-radius: 50%; background: var(--f); border: 2px solid rgba(255,255,255,.15); transition: transform .15s, box-shadow .15s; }
.ws-farbe:hover { transform: scale(1.08); }
.ws-farbe.an { box-shadow: 0 0 0 3px var(--grund), 0 0 0 5px var(--f), 0 0 16px var(--f); }
.ws-pj-icons .chip { font-size: 17px; padding: 5px 10px; }
.dialog textarea { width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 12px; border: 1px solid var(--rand); background: rgba(0,0,0,.3); color: var(--text); font: inherit; font-size: 14px; resize: vertical; }
.ws-pj-wahl { display: grid; gap: 6px; max-height: 46vh; overflow-y: auto; overscroll-behavior: contain; }
.ws-pj-zeile { display: flex; gap: 10px; align-items: center; text-align: left; padding: 9px 12px; border-radius: 12px; background: var(--flaeche); border: 1px solid var(--rand); color: inherit; transition: background .15s, border-color .15s; }
.ws-pj-zeile:hover { background: var(--flaeche-hover); }
.ws-pj-zeile.an { border-color: rgba(62,230,168,.5); background: var(--mint-weich); }
.ws-pj-zeile-text { flex: 1; min-width: 0; display: grid; gap: 1px; font-size: 14px; overflow-wrap: anywhere; }
.ws-pj-zeile-text small { font-size: 12px; color: var(--leise); }
.ws-pj-zeile b { width: 28px; height: 28px; flex: none; display: grid; place-items: center; border-radius: 50%; border: 1px solid var(--rand); color: var(--leise); }
.ws-pj-zeile.an b { color: #062018; background: var(--mint); border-color: var(--mint); }
.ws-pj-quellen .chip { padding: 6px 11px; font-size: 12px; }

/* Inventar: Werkzeug & Zubehör */
.kats { grid-template-columns: repeat(8, minmax(0, 1fr)); }
.kat strong { overflow-wrap: anywhere; }
.inv-schnell { grid-column: 1 / -1; margin-bottom: 14px; padding: 14px 16px; background: radial-gradient(420px 140px at 0% 0%, rgba(255,213,74,.07), transparent 70%), var(--flaeche); }
.inv-schnell-kopf { display: grid; gap: 2px; margin-bottom: 8px; }
.inv-vorlagen { display: grid; gap: 10px; margin: 6px 0 12px; }
.inv-schnell .inv-vorlagen { margin-bottom: 0; }
.inv-vorlagen-gruppe { display: grid; gap: 6px; }
.inv-vorlagen .chip { padding: 6px 11px; font-size: 12px; }
.mobil .inv-vorlagen .chips { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
.pille.inv-zustand { font-size: 11px; padding: 2px 8px; }
.chip.an.zustand-amber { background: var(--amber-weich); border-color: rgba(255,181,71,.5); color: var(--amber); }
.chip.an.zustand-rot { background: rgba(255,107,107,.16); border-color: rgba(255,107,107,.5); color: var(--rot); }
.r-kopf strong.mint { color: var(--mint); }
.r-kopf strong.amber { color: var(--amber); }
.r-kopf strong.rot { color: var(--rot); }

/* ==== Start (Übersicht) und Notizbuch ==== */
.st-seite { max-width: 1320px; margin: 0 auto; }
.st-kopf { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.st-kopf h2 { font-size: 24px; letter-spacing: .2px; }
.st-kopf p { margin: 2px 0 0; }
.st-lage { font-size: 13px; padding: 6px 14px; }
.st-raster { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-auto-flow: row dense; gap: 14px; align-items: stretch; }
.st-kachel { position: relative; background: var(--flaeche); border: 1px solid var(--rand); border-radius: var(--radius); padding: 16px 18px; backdrop-filter: blur(10px);
  display: flex; flex-direction: column; gap: 10px; min-width: 0; animation: st-rein .4s cubic-bezier(.2,.8,.2,1) both; transition: border-color .18s, background .18s, transform .18s, box-shadow .18s; }
.st-kachel[data-aktion] { cursor: pointer; }
.st-kachel[data-aktion]:hover { border-color: rgba(62,230,168,.35); background: var(--flaeche-hover); transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,.25), 0 0 0 1px rgba(62,230,168,.08); }
.st-kachel[data-aktion]:focus-visible { outline: 2px solid var(--mint); outline-offset: 2px; }
.st-kachel.still { animation: none; }
.st-raster > :nth-child(2) { animation-delay: .04s; } .st-raster > :nth-child(3) { animation-delay: .08s; } .st-raster > :nth-child(4) { animation-delay: .12s; }
.st-raster > :nth-child(5) { animation-delay: .16s; } .st-raster > :nth-child(n+6) { animation-delay: .2s; }
@keyframes st-rein { from { opacity: 0; transform: translateY(10px); } }
.st-kachel-kopf { display: flex; align-items: center; gap: 8px; }
.st-kachel-kopf h3 { margin: 0; font-size: 14px; font-weight: 600; color: var(--leise); letter-spacing: .2px; }
.st-kachel-kopf .zahl-punkt { margin-left: 0; }
.st-pfeil { margin-left: auto; color: var(--leise); font-size: 20px; line-height: 1; transition: transform .18s, color .18s; }
.st-kachel:hover .st-pfeil { color: var(--mint); transform: translateX(3px); }
.zahl-punkt.rot-punkt { background: var(--rot); color: #2a0606; }
.st-drucker { grid-column: span 2; }
.st-warnungen { grid-row: span 2; }
.st-letzte { grid-column: span 2; }
.st-warnungen.rot-rand { border-color: rgba(255,107,107,.35); }
/* Drucker */
.st-dr { display: flex; align-items: center; gap: 18px; min-width: 0; }
.st-ring { position: relative; width: 104px; height: 104px; flex: none; }
.st-ring-text { position: absolute; inset: 0; display: grid; place-content: center; }
.st-ring-text strong { font-size: 22px; }
.st-dr-text { flex: 1; min-width: 0; display: grid; gap: 6px; justify-items: start; }
.st-dr-name { font-size: 19px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.st-werte { display: grid; grid-template-columns: repeat(2, minmax(0, 120px)); gap: 8px; width: 100%; }
.st-werte > div { background: rgba(0,0,0,.22); border: 1px solid var(--rand); border-radius: 12px; padding: 7px 10px; display: grid; gap: 1px; }
.st-werte span { font-size: 11px; color: var(--leise); }
.st-werte strong { font-size: 15px; }
.st-werte.st-gross { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.st-werte.st-gross strong { font-size: 20px; }
.st-titelbild { width: 96px; height: 96px; object-fit: contain; border-radius: 14px; background: rgba(0,0,0,.3); border: 1px solid var(--rand); flex: none; }
/* Listen in Kacheln */
.st-liste { display: grid; gap: 6px; }
.st-warn { display: flex; align-items: center; gap: 10px; text-align: left; padding: 9px 11px; border-radius: 12px; background: rgba(0,0,0,.2); border: 1px solid var(--rand); font-size: 13px; line-height: 1.35; transition: background .15s, border-color .15s; }
.st-warn:hover { background: var(--flaeche-hover); border-color: rgba(255,255,255,.16); }
.st-warn > span:nth-child(2) { flex: 1; min-width: 0; }
.st-warn i { font-style: normal; color: var(--leise); }
.st-warn.rot { color: inherit; border-color: rgba(255,107,107,.35); background: rgba(255,107,107,.08); }
.st-warn.amber { color: inherit; border-color: rgba(255,181,71,.3); background: var(--amber-weich); }
.st-warn.leise { color: inherit; }
.st-warn-icon { flex: none; width: 22px; text-align: center; }
.st-ruhe { display: grid; place-items: center; gap: 6px; text-align: center; padding: 18px 8px; flex: 1; }
.st-ruhe span { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; font-size: 22px; color: var(--mint); background: var(--mint-weich); box-shadow: 0 0 24px rgba(62,230,168,.2); }
.st-zeile, .st-schlange li { display: flex; align-items: center; gap: 10px; min-width: 0; }
.st-zeile-text { flex: 1; min-width: 0; display: grid; gap: 1px; }
.st-zeile-text strong { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.st-zeile-text small { font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.st-schlange { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.st-nr { width: 24px; height: 24px; border-radius: 8px; display: grid; place-items: center; font-size: 12px; font-weight: 700; background: var(--mint-weich); color: var(--mint); flex: none; }
.st-rolle { display: flex; align-items: center; gap: 14px; }
.st-rolle .spule-svg { width: 58px; height: 58px; flex: none; }
.st-rolle > span:last-child { display: grid; gap: 2px; min-width: 0; }
.st-gramm { font-size: 20px; font-weight: 700; margin-top: 2px; }
.st-gramm.mint { color: var(--mint); }
.st-rollen { display: grid; gap: 4px; }
.st-rollen-zeile { display: flex; align-items: center; gap: 10px; padding: 6px 8px; margin: 0 -8px; border-radius: 10px; text-align: left; }
.st-rollen-zeile:hover { background: var(--flaeche-hover); }
.st-rollen-zeile .farbtupfer { width: 22px; height: 22px; }
.st-g { font-weight: 700; font-size: 14px; white-space: nowrap; }
.st-fotos { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.st-foto { display: grid; gap: 3px; text-align: left; min-width: 0; padding: 0; border-radius: 14px; }
.st-foto-bild { aspect-ratio: 16 / 10; border-radius: 12px; overflow: hidden; background: rgba(0,0,0,.3); border: 1px solid var(--rand); display: grid; place-items: center; font-size: 26px; margin-bottom: 4px; transition: border-color .15s; }
.st-foto-bild img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.st-foto:hover .st-foto-bild { border-color: rgba(62,230,168,.45); }
.st-foto:hover img { transform: scale(1.04); }
.st-foto strong { font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.st-foto small { font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.st-zahl { display: flex; align-items: baseline; gap: 10px; }
.st-zahl strong { font-size: 34px; font-weight: 700; line-height: 1; }
.st-zahl strong.mint { color: var(--mint); }
.st-kurz { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.st-kachel p { margin: 0; }
.st-kachel > small { font-size: 12px; }
@media (max-width: 1180px) { .app:not(.mobil) .st-raster { grid-template-columns: repeat(2, minmax(0, 1fr)); } .app:not(.mobil) .st-warnungen { grid-row: auto; } }
.mobil .st-raster { grid-template-columns: minmax(0, 1fr); gap: 12px; }
.mobil .st-drucker, .mobil .st-letzte { grid-column: auto; }
.mobil .st-warnungen { grid-row: auto; }
.mobil .st-kopf h2 { font-size: 21px; }
.mobil .st-ring { width: 72px; height: 72px; }
.mobil .st-werte { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.mobil .st-werte > div { padding: 6px 8px; }
.mobil .st-werte span, .mobil .st-werte strong { white-space: nowrap; }
.mobil .st-werte strong { font-size: 14px; }
.mobil .st-ring-text strong { font-size: 16px; }
.mobil .st-titelbild { width: 52px; height: 52px; border-radius: 10px; }
.mobil .st-dr { gap: 12px; }
.mobil .st-dr-name { font-size: 16px; }
.mobil .st-fotos { gap: 8px; }
/* Haken (Erinnerung erledigt) */
.nb-haken { width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--leise); flex: none; display: grid; place-items: center; font-size: 13px; font-weight: 700; color: #062018; transition: background .15s, border-color .15s, transform .1s; }
.nb-haken:hover { border-color: var(--mint); background: var(--mint-weich); }
.nb-haken:active { transform: scale(.9); }
.nb-haken.an { background: var(--mint); border-color: var(--mint); }
/* Notizbuch */
.nb-seite { max-width: 1320px; margin: 0 auto; }
.nb-kopf { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.nb-kopf p { margin: 4px 0 0; }
.nb-knoepfe { display: flex; gap: 8px; }
.nb-werkzeug { display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap; margin-bottom: 16px; }
.nb-werkzeug .such-feld { max-width: 320px; }
.nb-liste { columns: 300px; column-gap: 12px; }
.nb-liste > * { break-inside: avoid; margin-bottom: 12px; }
.nb-karte { background: var(--flaeche); border: 1px solid var(--rand); border-radius: 16px; padding: 14px 16px; backdrop-filter: blur(10px); display: grid; gap: 6px; min-width: 0;
  animation: st-rein .3s cubic-bezier(.2,.8,.2,1) both; transition: border-color .15s; }
.nb-karte.still { animation: none; }
.nb-karte:hover { border-color: rgba(255,255,255,.14); }
.nb-karte-kopf { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.nb-quelle { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; text-transform: uppercase; letter-spacing: .6px; color: var(--leise); font-weight: 600; }
.klein-tupfer { width: 12px; height: 12px; border-width: 1px; }
.q-fehl .nb-quelle { color: var(--rot); }
.q-eigen .nb-quelle { color: var(--mint); }
.q-wartung .nb-quelle { color: var(--amber); }
.nb-titel { font-size: 15px; overflow-wrap: anywhere; }
.nb-unter { font-size: 12px; margin-top: -4px; }
.nb-text { margin: 2px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 14px; line-height: 1.5; max-height: 12em; overflow: hidden; }
.nb-antworten { margin: 4px 0 0; display: grid; gap: 3px; font-size: 12px; padding: 8px 10px; border-radius: 10px; background: rgba(255,107,107,.06); border: 1px solid rgba(255,107,107,.18); }
.nb-antworten div { display: flex; gap: 12px; justify-content: space-between; align-items: baseline; }
.nb-antworten dt { color: var(--leise); flex: 1; min-width: 0; }

.nb-antworten dd { margin: 0; overflow-wrap: anywhere; text-align: right; max-width: 60%; font-weight: 600; }
.nb-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.nb-tag { font-size: 12px; color: var(--mint); background: var(--mint-weich); border-radius: 999px; padding: 2px 9px; }
.nb-tag:hover { filter: brightness(1.2); }
.nb-fuss { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 4px; }
.nb-link { padding: 5px 11px; font-size: 12px; max-width: 70%; overflow: hidden; text-overflow: ellipsis; }
.nb-aktionen { display: flex; gap: 6px; flex: none; }
.nb-aktionen .rund { min-width: 30px; height: 30px; font-size: 12px; }
.nb-erinnerung { grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; }
.nb-erinnerung .nb-inhalt { display: grid; gap: 6px; min-width: 0; }
.nb-meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.nb-erinnerung.rot-rand { border-color: rgba(255,107,107,.35); }
.nb-erinnerung.amber-rand { border-color: rgba(255,181,71,.35); }
.nb-erinnerung.erledigt { opacity: .6; }
.nb-erinnerung.erledigt .nb-titel { text-decoration: line-through; color: var(--leise); }
.nb-edit { border-color: rgba(62,230,168,.45); box-shadow: 0 0 0 1px rgba(62,230,168,.12), 0 10px 30px rgba(0,0,0,.25); gap: 8px; }
.nb-edit .text { margin-top: 0; }
.nb-edit .text:focus, .nb-edit input[type="date"]:focus { outline: none; border-color: rgba(62,230,168,.6); }
.nb-edit textarea { min-height: 110px; }
.nb-edit .knopf-reihe { margin-top: 6px; }
.nb-datum { margin: 2px 0 0; }
.nb-datum input { color-scheme: dark; }
.nb-schnell .chip, .nb-vorschlaege .chip { padding: 5px 11px; font-size: 12px; }
.nb-vorschlaege { display: grid; gap: 6px; }
.nb-linkwahl { margin: 0; }
.nb-leer { column-span: all; }
.mobil .nb-liste { columns: 1; }
.mobil .nb-kopf { flex-direction: column; flex-wrap: nowrap; align-items: stretch; }
.mobil .nb-knoepfe .knopf { flex: 1; }
.mobil .nb-werkzeug { flex-direction: column; flex-wrap: nowrap; align-items: stretch; }
.mobil .nb-werkzeug .such-feld { max-width: none; }
.mobil .nb-chips { flex-wrap: nowrap; overflow-x: auto; margin: 0 -16px; padding: 2px 16px; scrollbar-width: none; }
.mobil .nb-chips::-webkit-scrollbar { display: none; }

/* ==== 3D-Modelle: Werkzeuge (Auflegen, Beste Lage, Messen, Wandstärke, Skalieren), angedockte Warteschlange (v0.12) ==== */
/* Handy: Warteschlange als feste Leiste direkt über der unteren Navigation, der Inhalt endet darüber */
.mobil .mod-fuss.dock { position: absolute; left: 0; right: 0; bottom: var(--mod-nav-h, 64px); z-index: 2; margin: 0; padding: 8px 16px; border: none; border-top: 1px solid var(--rand); border-radius: 0;
  background: rgba(8,12,11,.9); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); box-shadow: 0 -10px 24px rgba(0,0,0,.35); }
.mobil .mod-fuss.dock .knopf { min-height: 44px; }
.mobil .mod-raster { padding-bottom: var(--mod-fuss-h, 0px); }
/* Handy: die Seite wächst mit dem Inhalt, sonst geht der Platz unter der Leiste verloren */
.mobil .ansicht-rein.voll { height: auto; }
/* Vier Reiter passen nebeneinander */
.mod-tabs { gap: 0; padding: 4px 8px 0; overflow-x: auto; scrollbar-width: none; }
.mod-tabs .tab { flex: 1 0 auto; padding: 10px 9px; font-size: 13.5px; white-space: nowrap; text-align: center; }
.mobil .mod-tabs .tab { font-size: 13px; padding: 10px 6px; }
/* Werkzeug-Liste (ohne Auswahl) und Leiste zum Wechseln */
.mod-wz-einleitung { margin: 0 0 12px; font-size: 13px; }
.mod-wz-liste { display: grid; gap: 8px; }
.mod-wz-zeile { display: flex; gap: 12px; align-items: center; width: 100%; text-align: left; padding: 10px 12px 10px 10px; border-radius: 14px; background: rgba(0,0,0,.18); border: 1px solid var(--rand);
  transition: border-color .15s, background .15s, transform .15s; animation: ansicht-rein .3s cubic-bezier(.2,.8,.2,1) both; }
.mod-wz-zeile:nth-child(2) { animation-delay: .03s; } .mod-wz-zeile:nth-child(3) { animation-delay: .06s; } .mod-wz-zeile:nth-child(4) { animation-delay: .09s; } .mod-wz-zeile:nth-child(5) { animation-delay: .12s; }
.mod-wz-zeile:hover, .mod-wz-zeile:focus-visible { border-color: rgba(62,230,168,.45); background: var(--mint-weich); outline: none; }
.mod-wz-zeile:active { transform: scale(.985); }
.mod-wz-zeile > .mod-ico { width: 22px; height: 22px; padding: 9px; border-radius: 12px; color: var(--mint); background: rgba(62,230,168,.1); border: 1px solid rgba(62,230,168,.22); }
.mod-wz-zeile > span:not(.mod-wz-pfeil) { flex: 1; min-width: 0; display: grid; gap: 2px; }
.mod-wz-zeile strong { font-size: 14px; }
.mod-wz-zeile small { font-size: 12px; color: var(--leise); }
.mod-wz-pfeil { color: var(--leise); font-size: 22px; line-height: 1; }
.mod-wz-leiste { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 3px; padding: 4px; margin-bottom: 14px; border-radius: 16px; background: rgba(0,0,0,.28); border: 1px solid var(--rand); }
.mod-wz { display: grid; justify-items: center; gap: 4px; padding: 8px 2px 6px; border-radius: 12px; color: var(--leise); font-size: 11px; font-weight: 600; transition: color .15s, background .15s, box-shadow .15s; }
.mod-wz .mod-ico { width: 22px; height: 22px; }
.mod-wz span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mod-wz:hover { color: var(--text); background: var(--flaeche-hover); }
.mod-wz.an { color: var(--mint); background: var(--mint-weich); box-shadow: inset 0 0 0 1px rgba(62,230,168,.45); }
.mod-wz-karte { animation: ansicht-rein .22s ease; }
.mod-wz-karte h3 { margin-top: 0; }
.mod-wz-aktiv { display: flex; align-items: center; gap: 10px; }
.mod-wz-puls { width: 10px; height: 10px; flex: none; border-radius: 50%; background: var(--mint); animation: wz-puls 1.6s ease-out infinite; }
@keyframes wz-puls { 0% { box-shadow: 0 0 0 0 rgba(62,230,168,.6); } 100% { box-shadow: 0 0 0 10px rgba(62,230,168,0); } }
/* Hinweis im 3D-Bild, solange Antippen erwartet wird */
.mod-wz-hinweis { background: rgba(10,30,24,.82); border-color: rgba(62,230,168,.5); color: #c6f6e3; box-shadow: 0 8px 24px rgba(0,0,0,.4); }
.mod-wz-hinweis .mod-ico { width: 18px; height: 18px; color: var(--mint); }
.mobil .mod-wz-hinweis { top: auto; bottom: 34px; justify-content: center; flex-wrap: wrap; row-gap: 6px; }
/* Beste Lage: Vergleich als Balken */
.mod-vergleich { display: grid; gap: 8px; margin: 12px 0 6px; }
.mod-v-zeile { display: grid; grid-template-columns: 78px minmax(0, 1fr) auto; gap: 10px; align-items: center; font-size: 13px; }
.mod-v-zeile > span { color: var(--leise); }
.mod-v-zeile strong { min-width: 74px; text-align: right; font-variant-numeric: tabular-nums; }
.mod-balken { height: 10px; border-radius: 5px; background: rgba(255,255,255,.06); overflow: hidden; }
.mod-balken i { display: block; height: 100%; border-radius: 5px; background: linear-gradient(90deg, #ffb547, #ff6b6b); transition: width .45s cubic-bezier(.2,.8,.2,1); }
.mod-v-zeile.vorschlag .mod-balken i { background: linear-gradient(90deg, #22b884, var(--mint)); }
.mod-v-zeile.vorschlag strong { color: var(--mint); }
.mod-v-text { color: var(--leise); margin: 0 0 4px; }
.mod-lage-chips { display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 6px; }
.mod-lage-chips .chip { display: grid; gap: 1px; padding: 6px 8px; border-radius: 12px; text-align: center; font-variant-numeric: tabular-nums; }
.mod-lage-chips .chip strong { font-size: 13px; }
.mod-lage-chips .chip small { font-size: 10.5px; color: var(--leise); }
/* Messen */
.mod-mess { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.mod-mess-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.mod-mess-linie { stroke: var(--gelb); stroke-width: 2.5; stroke-linecap: round; stroke-dasharray: 7 5; filter: drop-shadow(0 0 4px rgba(255,213,74,.55)); animation: mess-laufen .9s linear infinite; }
@keyframes mess-laufen { to { stroke-dashoffset: -12; } }
.mod-mess-punkt { fill: var(--gelb); stroke: #1b1503; stroke-width: 2; filter: drop-shadow(0 0 6px rgba(255,213,74,.8)); }
.mod-mess-text { position: absolute; left: 0; top: 0; padding: 4px 10px; border-radius: 9px; background: var(--gelb); color: #1b1503; font-weight: 800; font-size: 14px;
  white-space: nowrap; font-variant-numeric: tabular-nums; box-shadow: 0 0 0 4px rgba(255,213,74,.16), 0 6px 18px rgba(0,0,0,.5); }
.mod-mess-schritte { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 4px 0 12px; }
.mod-mess-schritte span { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 12px; background: rgba(0,0,0,.2); border: 1px solid var(--rand); font-size: 13px; color: var(--leise); transition: color .2s, border-color .2s; }
.mod-mess-schritte i { width: 22px; height: 22px; flex: none; display: grid; place-items: center; border-radius: 50%; border: 2px solid currentColor; font-style: normal; font-size: 12px; font-weight: 800; }
.mod-mess-schritte .jetzt { color: var(--gelb); border-color: rgba(255,213,74,.5); }
.mod-mess-schritte .fertig { color: var(--mint); border-color: rgba(62,230,168,.4); }
.mod-mess-schritte .fertig i { background: var(--mint); border-color: var(--mint); color: #062018; }
.mod-mess-ergebnis { display: grid; justify-items: center; gap: 6px; padding: 16px 12px; border-radius: 16px; border: 1px solid rgba(255,213,74,.35);
  background: radial-gradient(260px 120px at 50% 0%, rgba(255,213,74,.12), transparent 70%), rgba(0,0,0,.22); animation: ansicht-rein .25s ease; }
.mod-mess-ergebnis strong { font-size: 30px; color: var(--gelb); font-variant-numeric: tabular-nums; }
.mod-mess-achsen { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
.mod-mess-achsen span { display: inline-flex; align-items: baseline; gap: 6px; padding: 3px 10px; border-radius: 999px; background: rgba(255,255,255,.05); font-size: 12px; font-weight: 800; }
.mod-mess-achsen b { color: var(--text); font-weight: 600; font-variant-numeric: tabular-nums; }
.mod-mess-achsen .a-x { color: #ff6b6b; }
.mod-mess-achsen .a-y { color: #4fe08a; }
.mod-mess-achsen .a-z { color: #5cc8ff; }
/* Wandstärke und Skalieren */
.mod-duenn-hinweis .mini { display: inline-block; margin: 6px 0 0; }
.mod-skala-felder input { font-size: 15px; -moz-appearance: textfield; }
.mod-skala-felder input::-webkit-inner-spin-button, .mod-skala-felder input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.mod-skala-schnell { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; margin: 2px 0 6px; }
.mod-skala-schnell .chip { padding: 6px 0; font-size: 12px; text-align: center; font-variant-numeric: tabular-nums; }
.mod-skala-loecher .hinweis { margin: 10px 0 4px; }
.mod-skala-loch { display: flex; gap: 10px; align-items: center; margin: 6px 0; padding: 8px 10px; border-radius: 12px; font-size: 13px; background: rgba(0,0,0,.18); border: 1px solid var(--rand); }
.mod-skala-loch.schlecht { border-color: rgba(255,181,71,.5); background: rgba(255,181,71,.08); color: #ffd59a; }
.mod-skala-loch.gut .mod-nr { border-color: var(--mint); color: var(--mint); }
.mod-skala-loecher .mini { margin: 4px 0 0; }
/* ---- Hilfe v0.12: Trockner mit zwei Plätzen, Konstruktion, Slicer-Lexikon, Druckplatten ---- */
.hinweis.rot { color: #ffc2c2; background: rgba(255,107,107,.1); border-color: rgba(255,107,107,.35); }
.pl-jetzt { color: var(--mint); }
/* Aufklappbare Einträge */
.hi-eintrag { border: 1px solid var(--rand); border-radius: 16px; background: var(--flaeche); backdrop-filter: blur(10px); transition: border-color .2s, background .2s, box-shadow .2s; min-width: 0; }
.hi-eintrag:hover { border-color: rgba(62,230,168,.35); background: var(--flaeche-hover); }
.hi-eintrag.auf { border-color: rgba(62,230,168,.45); box-shadow: 0 8px 28px rgba(0,0,0,.25), inset 0 0 0 1px rgba(62,230,168,.08); }
.hi-eintrag-kopf { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 12px; text-align: left; border-radius: 16px; }
.hi-eintrag-kopf:focus-visible { outline: 2px solid rgba(62,230,168,.6); outline-offset: -2px; }
.hi-pfeil { margin-left: auto; flex: none; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; color: var(--leise); font-size: 18px; transition: transform .22s ease, color .2s, background .2s; }
.hi-eintrag.auf .hi-pfeil { transform: rotate(90deg); color: var(--mint); background: var(--mint-weich); }
.hi-eintrag-text { display: none; padding: 0 14px 14px; }
.hi-eintrag.auf .hi-eintrag-text { display: block; }
/* Trockner: zwei Plätze */
.hi-kombi-wahl { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.hi-kombi-wahl .breit-auswahl { margin: 0; }
.hi-kombi-erg { margin-top: 14px; }
.hi-kombi-hinweis { margin-bottom: 8px; }
.hi-kombi-leer { margin: 6px 0 0; }
.hi-laeufe { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); margin-top: 6px; }
.hi-laeufe:not(.zwei) .hi-lauf { display: grid; grid-template-columns: minmax(0, 400px) minmax(0, 1fr); gap: 4px 18px; align-items: center; }
.hi-laeufe:not(.zwei) .hi-lauf h4 { grid-column: 1 / -1; }
.hi-laeufe:not(.zwei) .hi-lauf-schritte { grid-template-columns: 1fr 1fr; margin: 0; }
.mobil .hi-laeufe:not(.zwei) .hi-lauf { grid-template-columns: 1fr; }
.mobil .hi-laeufe:not(.zwei) .hi-lauf-schritte { margin-top: 10px; }
.hi-laeufe.zwei { grid-template-columns: 1fr 1fr; }
.hi-lauf { padding: 12px; border-radius: 16px; background: rgba(0,0,0,.22); border: 1px solid var(--rand); animation: hi-lauf-rein .3s ease both; }
@keyframes hi-lauf-rein { from { opacity: 0; transform: translateY(6px); } }
.hi-lauf h4 { margin: 0 0 8px; font-size: 14px; color: var(--mint); }
.tr-kombi-bild { width: 100%; max-width: 400px; height: auto; display: block; margin: 0 auto; }
.tr-kombi-name { fill: var(--leise); font-size: 10px; letter-spacing: .4px; }
.tr-kombi-nr { fill: #ffb547; font-size: 13px; font-weight: 700; }
.tr-kombi-leer { fill: var(--leise); font-size: 13px; }
.hi-lauf-schritte { list-style: none; margin: 10px 0 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; counter-reset: schritt; }
.hi-lauf-schritte li { counter-increment: schritt; display: grid; gap: 2px; padding: 8px 10px; border-radius: 12px; background: var(--flaeche); border: 1px solid var(--rand); font-size: 12px; min-width: 0; }
.hi-lauf-schritte li span { color: var(--leise); }
.hi-lauf-schritte li span::before { content: counter(schritt) ". "; color: var(--mint); font-weight: 700; }
.hi-lauf-schritte strong { color: var(--amber); font-size: 15px; overflow-wrap: anywhere; }
.hi-lauf-schritte small { font-size: 11px; }
.hi-laeufe.zwei .hi-lauf-schritte { grid-template-columns: 1fr 1fr; }
.mobil .hi-kombi-wahl, .mobil .hi-laeufe.zwei { grid-template-columns: 1fr; }
.mobil .hi-lauf-schritte { grid-template-columns: 1fr 1fr; }
/* Konstruktion */
.kn-rechner { margin-bottom: 16px; align-items: stretch; }
.kn-karte .chips { margin: 4px 0 10px; }
.kn-karte .chip { padding: 6px 12px; }
.kn-da { font-style: normal; color: var(--mint); font-size: 9px; vertical-align: 2px; }
.kn-stufen .info-zeile { padding: 8px 14px; }
.kn-stufen .kn-empf { background: var(--mint-weich); }
.kn-stufen .kn-empf strong { color: var(--mint); }
.kn-regler { margin: 14px 0 8px; }
.kn-erg .hinweis { margin: 0; }
.kn-erg strong { color: inherit; }
.kn-einsatz-erg { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.kn-gross { display: grid; gap: 2px; padding: 12px 14px; border-radius: 14px; background: var(--mint-weich); border: 1px solid rgba(62,230,168,.3); }
.kn-gross span { font-size: 12px; color: var(--leise); }
.kn-gross strong { font-size: 26px; color: var(--mint); line-height: 1.1; }
.kn-gross small { font-size: 11px; }
.kn-karte .info-liste .info-zeile { padding: 9px 14px; }
.kn-karte > p.klein { margin: 10px 0 0; }
.kn-raster { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 10px; align-items: start; }
.mobil .kn-raster { grid-template-columns: 1fr; }
.kn-bild { width: 96px; height: auto; flex: none; border-radius: 10px; background: rgba(0,0,0,.3); }
.mobil .kn-bild { width: 84px; }
.kn-kopf-text { display: grid; gap: 2px; min-width: 0; }
.kn-kopf-text small { font-size: 12px; }
.kn-punkte { margin-top: 4px; }
.kn-werte { margin-top: 12px; }
.kn-werte .info-zeile { padding: 8px 12px; font-size: 13px; }
.kn-werte strong { color: var(--amber); text-align: right; }
.kn-tab-titel { margin: 12px 0 6px; }
.kn-tabelle { margin-top: 12px; border: 1px solid var(--rand); border-radius: 12px; overflow: hidden; font-size: 13px; }
.kn-tz { display: grid; grid-template-columns: 1.3fr repeat(calc(var(--spalten) - 1), 1fr); gap: 6px; padding: 7px 12px; border-bottom: 1px solid var(--rand); align-items: center; }
.kn-tz:last-child { border-bottom: none; }
.kn-tz span { color: var(--amber); font-variant-numeric: tabular-nums; }
.kn-tk { background: rgba(0,0,0,.25); }
.kn-tk span { color: var(--leise); font-size: 11px; text-transform: uppercase; letter-spacing: .4px; }
.mobil .kn-tz { padding: 7px 10px; font-size: 12px; }
/* Slicer-Lexikon */
.lex-werkzeug { display: flex; margin-bottom: 12px; }
.lex-werkzeug .suche { max-width: 520px; }
.lex-gruppen .chip small { margin-left: 6px; font-size: 11px; color: var(--leise); }
.lex-gruppen .chip.an small { color: var(--mint); }
.lex-gruppe { margin-bottom: 18px; }
.lex-gruppe-titel { margin: 4px 0 10px; font-size: 15px; }
.lex-gruppe-titel small { font-weight: 400; }
.lex-liste { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 8px; align-items: start; }
.mobil .lex-liste { grid-template-columns: 1fr; }
.lex-eintrag .hi-eintrag-kopf { flex-wrap: wrap; row-gap: 2px; padding: 11px 14px; }
.lex-name { display: grid; gap: 1px; min-width: 0; flex: 1 1 180px; }
.lex-name small { color: var(--leise); font-size: 12px; }
.lex-name small::before { content: "("; } .lex-name small::after { content: ")"; }
.lex-ab { order: 3; flex-basis: 100%; font-size: 11px; color: var(--mint); opacity: .8; }
.lex-eintrag .hi-pfeil { order: 2; }
.lex-text { margin: 0; display: grid; gap: 4px; font-size: 14px; line-height: 1.45; }
.lex-text dt { font-size: 11px; text-transform: uppercase; letter-spacing: .6px; color: var(--leise); margin-top: 6px; }
.lex-text dd { margin: 0; }
.lex-text dd.lex-werte { color: var(--amber); }
.lex-anzahl { margin: 0 0 8px; }
/* Druckplatten */
.pl-matrix { display: grid; gap: 4px; }
.pl-zeile { display: grid; grid-template-columns: minmax(56px, .8fr) repeat(5, minmax(0, 1fr)); gap: 4px; align-items: stretch; border-radius: 12px; transition: background .2s; }
.pl-zeile.deine { background: rgba(62,230,168,.07); box-shadow: inset 0 0 0 1px rgba(62,230,168,.3); }
.pl-mat { display: flex; align-items: center; padding-left: 10px; font-size: 14px; }
.pl-zeile.deine .pl-mat { color: var(--mint); }
.pl-spalte { padding: 8px 4px; border-radius: 10px; font-size: 12px; font-weight: 600; color: var(--leise); text-align: center; line-height: 1.2; border: 1px solid transparent; hyphens: manual; }
.pl-spalte:hover { color: var(--text); background: var(--flaeche-hover); }
.pl-spalte.an { color: var(--mint); border-color: rgba(62,230,168,.45); background: var(--mint-weich); }
.pl-spalte.drin::after { content: " ●"; color: var(--mint); font-size: 9px; vertical-align: 1px; }
.pl-zelle { display: grid; place-items: center; gap: 0; padding: 7px 2px; border-radius: 10px; background: rgba(255,255,255,.03); border: 1px solid var(--rand); transition: transform .15s, border-color .15s; min-width: 0; }
.pl-zelle:hover { transform: translateY(-1px); border-color: rgba(255,255,255,.2); }
.pl-zelle b { font-size: 15px; line-height: 1.1; }
.pl-zelle small { font-size: 11px; color: var(--leise); font-variant-numeric: tabular-nums; }
.pl-zelle.ok { background: rgba(62,230,168,.10); border-color: rgba(62,230,168,.28); }
.pl-zelle.ok b { color: var(--mint); }
.pl-zelle.kleber { background: var(--amber-weich); border-color: rgba(255,181,71,.3); }
.pl-zelle.kleber b { color: var(--amber); font-size: 12px; font-weight: 600; }
.pl-zelle.nein b { color: rgba(255,107,107,.75); }
.pl-zelle.nein { opacity: .7; }
.pl-zelle.spalte { box-shadow: 0 0 0 1px rgba(62,230,168,.5); }
.pl-legende { display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 12px 0 4px; font-size: 12px; color: var(--leise); }
.pl-legende b { font-weight: 700; margin-right: 4px; }
.pl-legende .ok { color: var(--mint); } .pl-legende .kleber { color: var(--amber); } .pl-legende .nein { color: var(--rot); }
.pl-detail-kopf { display: flex; gap: 14px; align-items: center; margin-bottom: 12px; }
.pl-detail-kopf h2 { font-size: 18px; }
.pl-detail-kopf p { margin: 4px 0 0; font-size: 14px; }
.pl-bild { width: 120px; height: auto; flex: none; border-radius: 12px; background: rgba(0,0,0,.3); }
.pl-wahl .chip { padding: 6px 12px; }
.mobil .pl-karte { padding: 14px 10px; }
.mobil .pl-zeile { grid-template-columns: 46px repeat(5, minmax(0, 1fr)); gap: 3px; }
.mobil .pl-mat { padding-left: 4px; font-size: 12px; }
.mobil .pl-spalte { font-size: 10px; padding: 6px 1px; }
.mobil .pl-zelle { padding: 6px 1px; }
.mobil .pl-zelle.kleber b { font-size: 9.5px; }
.mobil .pl-zelle small { font-size: 9.5px; }
.mobil .pl-detail-kopf { flex-direction: column; align-items: flex-start; }
.mobil .pl-bild { width: 110px; }
@media (prefers-reduced-motion: reduce) { .hi-lauf { animation: none; } .hi-pfeil, .pl-zelle { transition: none; } }
/* ==== Drucker v0.12: Titelbild, Zeitleiste, Steuerung, Raumklima, Druckwarnung, Stromdiagramme ==== */
#dr-bild-karte:empty, #dr-raum:empty { display: none; }
/* Titelbild statt Kamera */
.dr-bild { position: relative; aspect-ratio: 4 / 3; border-radius: 14px; overflow: hidden; display: grid; place-items: center;
  background: radial-gradient(60% 60% at 50% 55%, rgba(62,230,168,.16), transparent 70%), linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px) 0 0 / 22px 22px,
    linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px) 0 0 / 22px 22px, rgba(0,0,0,.35); border: 1px solid var(--rand); }
.mobil .dr-bild { aspect-ratio: 1 / 1; max-height: 340px; width: 100%; }
.dr-bild img { max-width: 88%; max-height: 88%; object-fit: contain; display: block; filter: drop-shadow(0 12px 28px rgba(0,0,0,.55)); animation: dr-bild-rein .5s ease; }
.dr-bild-karte.aktiv .dr-bild img { animation: dr-bild-rein .5s ease, dr-schweben 6s ease-in-out .5s infinite; }
@keyframes dr-bild-rein { from { opacity: 0; transform: scale(.94); } }
@keyframes dr-schweben { 50% { transform: translateY(-5px); } }
.dr-bild .dr-kamera-leer { display: grid; justify-items: center; gap: 8px; height: auto; }
.dr-bild-leer-icon { font-size: 42px; color: rgba(62,230,168,.35); line-height: 1; }
.dr-bild-name { margin: 10px 0 0; font-weight: 600; text-align: center; overflow-wrap: anywhere; }
/* Zeitleiste im Statuskasten */
.dr-status { flex-wrap: wrap; }
.mobil .dr-status { flex-wrap: nowrap; }
.mobil .dr-zeitleiste { align-self: stretch; }
.dr-zeitleiste { flex-basis: 100%; display: grid; gap: 8px; padding-top: 14px; border-top: 1px solid var(--rand); text-align: left; }
.dr-zl-kopf, .dr-zl-fuss { display: flex; justify-content: space-between; gap: 10px; font-size: 13px; color: var(--leise); }
.dr-zl-kopf strong, .dr-zl-fuss strong { color: var(--text); }
.dr-zl-ende strong { color: var(--mint); font-size: 15px; }
.dr-zl-balken { position: relative; height: 12px; border-radius: 6px; background: rgba(255,255,255,.07); overflow: hidden; }
.dr-zl-balken i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 6px; transition: width .8s ease;
  background: linear-gradient(90deg, rgba(62,230,168,.55), var(--mint)); box-shadow: 0 0 12px rgba(62,230,168,.5); overflow: hidden; }
.dr-zl-balken i::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent);
  transform: translateX(-100%); animation: dr-glanz 2.4s ease-in-out infinite; }
.dr-zl-balken b { position: absolute; left: 0; bottom: 0; height: 2px; background: rgba(255,255,255,.55); transition: width .8s ease; }
.dr-zeitleiste.pausiert .dr-zl-balken i { background: linear-gradient(90deg, rgba(255,181,71,.5), var(--amber)); box-shadow: none; }
.dr-zeitleiste.pausiert .dr-zl-balken i::after { display: none; }
@keyframes dr-glanz { to { transform: translateX(100%); } }
/* Steuerung */
.dr-steuer-reihe { display: flex; gap: 10px; flex-wrap: wrap; }
.dr-steuer-knopf { flex: 1 1 0; min-width: 104px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 14px; border-radius: 14px;
  font-weight: 600; background: rgba(0,0,0,.22); border: 1px solid var(--rand); transition: background .15s, border-color .15s, transform .1s, box-shadow .2s; }
.dr-steuer-knopf:hover:not(:disabled) { background: var(--flaeche-hover); border-color: rgba(62,230,168,.4); }
.dr-steuer-knopf:active:not(:disabled) { transform: scale(.97); }
.dr-steuer-icon { font-size: 16px; width: 18px; display: inline-grid; place-items: center; }
.dr-bild-karte .dr-bild { max-height: 420px; width: 100%; }
.dr-steuer-knopf.rot { color: var(--rot); border-color: rgba(255,107,107,.45); background: rgba(255,107,107,.08); }
.dr-steuer-knopf.rot:hover:not(:disabled) { background: rgba(255,107,107,.18); border-color: rgba(255,107,107,.7); }
.dr-steuer-knopf.mint { color: #062018; background: var(--mint); border-color: var(--mint); }
.dr-licht.an { color: #ffe9a8; border-color: rgba(255,214,102,.55); background: rgba(255,214,102,.12); box-shadow: 0 0 18px rgba(255,214,102,.18); }
.dr-tempo { display: grid; gap: 4px; margin-top: 14px; }
.dr-tempo .chips { margin-top: 2px; }
.dr-tempo .chip:disabled.an { opacity: 1; }
.dr-tempo-wild.an { color: var(--amber); background: var(--amber-weich); border-color: rgba(255,181,71,.5); }
.mobil .dr-tempo .chips { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.mobil .dr-tempo .chip { padding: 7px 4px; text-align: center; }
/* Druckwarnung */
.dr-druck-warnung { display: grid; gap: 2px; margin: 0; border-width: 1px; border-style: solid; animation: dr-puls 2.4s ease-in-out infinite; }
.dr-druck-warnung strong { color: var(--rot); }
@keyframes dr-puls { 50% { box-shadow: 0 0 0 4px rgba(255,107,107,.12); } }
/* Raumklima */
.dr-raum-werte { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 10px; }
.dr-raum-wert { display: grid; grid-template-columns: auto 1fr; column-gap: 10px; align-items: center; padding: 10px 12px; border-radius: 12px; background: rgba(0,0,0,.2); border: 1px solid var(--rand); }
.dr-raum-icon { grid-row: span 2; font-size: 20px; }
.dr-raum-wert strong { font-size: 18px; }
.dr-raum-wert small { font-size: 11px; color: var(--leise); }
.dr-raum-wert.kalt strong { color: #8fd3ff; }
.dr-raum-wert.feucht strong { color: var(--amber); }
.dr-raum-skala { grid-column: 1 / -1; position: relative; height: 4px; margin-top: 8px; border-radius: 2px;
  background: linear-gradient(90deg, rgba(255,255,255,.08) var(--gut-a), rgba(62,230,168,.35) var(--gut-a), rgba(62,230,168,.35) var(--gut-b), rgba(255,255,255,.08) var(--gut-b)); }
.dr-raum-skala i { position: absolute; top: -3px; width: 10px; height: 10px; margin-left: -5px; border-radius: 50%; background: var(--text); box-shadow: 0 0 8px rgba(255,255,255,.5); transition: left .8s ease; }
.dr-raum-warnung { margin: 8px 0 0; }
.dr-raum-ok { margin: 0; color: var(--mint); }
/* Strom: Werte antippbar */
.dr-strom-knopf { position: relative; cursor: pointer; text-align: left; color: inherit; padding: 0; border-radius: 12px; transition: transform .1s; }
.dr-strom-knopf > div { transition: border-color .15s, background .15s; }
.dr-strom-knopf:hover > div { border-color: rgba(62,230,168,.45); background: var(--mint-weich); }
.dr-strom-knopf:active { transform: scale(.98); }
/* Strom-Sheet mit Diagrammen */
.dr-strom-bereiche { margin-bottom: 14px; }
.dr-strom-summen { grid-template-columns: repeat(4, minmax(0, 1fr)); margin: 0 0 6px; }
.mobil .dr-strom-summen { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.dr-strom-inhalt { animation: blende .25s ease; }
.dr-diagramm { margin-top: 14px; padding: 12px 12px 6px; border-radius: 14px; background: rgba(0,0,0,.22); border: 1px solid var(--rand); }
.dr-dg-kopf { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; min-height: 22px; }
.dr-dg-kopf h3 { margin: 0; font-size: 14px; white-space: nowrap; }
.dr-dg-info { font-size: 12px; text-align: right; display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; align-items: baseline; color: var(--leise); }
.dr-dg-info strong { color: var(--mint); font-size: 14px; }
.dr-dg-info small { color: var(--amber); }
.dr-diagramm svg { display: block; margin-top: 6px; touch-action: pan-y; overflow: visible; cursor: crosshair; user-select: none; -webkit-user-select: none; }
.dr-dg-gitter { stroke: rgba(255,255,255,.07); stroke-width: 1; }
.dr-dg-strich { stroke: rgba(255,255,255,.25); }
.dr-dg-achse { fill: var(--leise); font-size: 10px; }
.dr-dg-einheit { font-weight: 700; }
.dr-dg-wert { fill: var(--amber); font-size: 10px; font-weight: 600; }
.dr-dg-linie { fill: none; stroke: var(--mint); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; filter: drop-shadow(0 0 4px rgba(62,230,168,.6)); }
.dr-dg-flaeche { animation: blende .5s ease; }
.dr-dg-saeule { fill: rgba(62,230,168,.55); transform-box: fill-box; transform-origin: bottom; animation: dr-wachsen .45s cubic-bezier(.2,.9,.3,1.1) both; transition: fill .15s; }
.dr-dg-saeule.an { fill: var(--mint); filter: drop-shadow(0 0 6px rgba(62,230,168,.7)); }
@keyframes dr-wachsen { from { transform: scaleY(0); } }
.dr-dg-zeiger { stroke: rgba(255,255,255,.45); stroke-width: 1; stroke-dasharray: 3 3; pointer-events: none; }
.dr-dg-punkt { fill: var(--grund); stroke: var(--mint); stroke-width: 2.5; pointer-events: none; }
.dr-dg-laedt { display: grid; justify-items: center; gap: 12px; padding: 60px 0; }
.dr-strom-fuss { margin: 12px 0 0; }
/* ==== Filament (v0.12): voreingestellter Preis, Kauflink, Sterne, Feuchte, Korrektur ==== */
.voreingestellt { display: inline-block; margin-left: 6px; font-size: 10px; font-weight: 600; letter-spacing: .3px; color: var(--leise); border: 1px dashed rgba(141,164,154,.45); border-radius: 6px; padding: 0 5px; vertical-align: 2px; text-transform: lowercase; }
.r-kopf strong .voreingestellt { font-size: 10px; }
.kauflink { display: flex; align-items: center; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--rand); flex-wrap: wrap; }
.kauflink .mini { margin: 0 0 0 auto; }
.kauflink.bearbeiten { display: block; }
.kauflink.bearbeiten .feld { margin-top: 0; }
.kauflink input.fehler { border-color: var(--rot); background: rgba(255,107,107,.1); }
.kauf-knopf { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 12px; font-weight: 700; font-size: 14px; text-decoration: none;
  color: #062018; background: linear-gradient(135deg, var(--mint), #7ff0c6); box-shadow: 0 4px 18px rgba(62,230,168,.25); transition: transform .12s, filter .15s, box-shadow .15s; }
.kauf-knopf:hover { filter: brightness(1.06); box-shadow: 0 6px 24px rgba(62,230,168,.35); }
.kauf-knopf:active { transform: scale(.97); }
.sterne-block { display: grid; gap: 4px; justify-items: start; padding: 14px 16px; border-radius: 16px; background: var(--flaeche); border: 1px solid var(--rand); margin-top: 12px; }
.sterne-block > span { font-size: 14px; color: var(--leise); }
.sterne { display: flex; gap: 2px; }
.stern { font-size: 30px; line-height: 1; padding: 4px 3px; color: rgba(255,255,255,.16); transition: color .15s, transform .15s, text-shadow .2s; }
.stern.an { color: var(--gelb, #ffd54a); text-shadow: 0 0 14px rgba(255,213,74,.35); }
.stern:hover { transform: scale(1.12); }
.stern:active { transform: scale(.92); }
.sterne-block small { font-size: 12px; }
.feuchte-daten { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.mobil .feuchte-daten { grid-template-columns: 1fr; gap: 6px; }
.datum-feld { display: grid; gap: 2px; font-size: 13px; color: var(--leise); margin-top: 6px; }
.datum-feld .text { margin-top: 0; color-scheme: dark; min-height: 40px; }
.feuchte-block .chips { margin-top: 4px; }
.feuchte-hinweis { display: flex; align-items: center; gap: 10px; }
.feuchte-hinweis > div { flex: 1; min-width: 0; display: grid; gap: 1px; }
.feuchte-hinweis small { opacity: .85; }
.feuchte-hinweis .mini { margin: 0; flex: none; color: var(--mint); border-color: rgba(62,230,168,.4); }
.feuchte-icon { font-size: 20px; }
.mobil .feuchte-hinweis { flex-wrap: wrap; }
.mobil .feuchte-hinweis > div { flex-basis: calc(100% - 40px); }
.mobil .feuchte-hinweis .mini { margin-left: 30px; }
.badge-trocknen { position: absolute; top: 12px; right: 12px; z-index: 1; font-size: 10px; font-weight: 600; color: #9fd8ff; background: rgba(92,200,255,.14); border: 1px solid rgba(92,200,255,.35); border-radius: 6px; padding: 1px 6px; animation: trocknen-puls 2.4s ease-in-out infinite; }
.kachel.offen .badge-trocknen { top: 34px; }
.mobil .badge-trocknen { font-size: 9px; padding: 1px 5px; }
@keyframes trocknen-puls { 0%, 100% { box-shadow: 0 0 0 0 rgba(92,200,255,0); } 50% { box-shadow: 0 0 0 4px rgba(92,200,255,.12); } }
.korrektur-block { display: flex; align-items: center; gap: 12px; margin-top: 14px; padding: 12px 14px; border-radius: 14px; border: 1px dashed var(--rand); background: rgba(255,255,255,.02); }
.korrektur-block.an { border-style: solid; border-color: rgba(62,230,168,.3); background: var(--mint-weich); }
.korr-icon { font-size: 20px; }
.korr-text { flex: 1; min-width: 0; display: grid; gap: 2px; font-size: 14px; }
.korr-text small { font-size: 12px; }
.korrektur-block .mini { margin: 0; flex: none; }
/* ===================== Shop: Rechner, Produkte, Aufträge ===================== */
.sh-seite { --sh-filament: #2bc4c4; --sh-strom: #ffd54a; --sh-verschleiss: #7d948a; --sh-fehl: #ff6b6b; --sh-zubehoer: #e48ad0;
  --sh-arbeit: #5ab0ff; --sh-entwicklung: #a98bff; --sh-gebuehren: #ff8f6b; --sh-versand: #ffb547; --sh-mwst: #4f5d58; --sh-gewinn: #3ee6a8; }
.sh-f-filament { background: var(--sh-filament); } .sh-f-strom { background: var(--sh-strom); } .sh-f-verschleiss { background: var(--sh-verschleiss); }
.sh-f-fehl { background: var(--sh-fehl); } .sh-f-zubehoer { background: var(--sh-zubehoer); } .sh-f-arbeit { background: var(--sh-arbeit); }
.sh-f-entwicklung { background: var(--sh-entwicklung); } .sh-f-gebuehren { background: var(--sh-gebuehren); } .sh-f-versand { background: var(--sh-versand); }
.sh-f-mwst { background: var(--sh-mwst); }
.sh-f-gewinn { background: linear-gradient(90deg, #3ee6a8, #7cf5c8); box-shadow: 0 0 14px rgba(62,230,168,.55); }
.sh-gewinn-text { color: var(--mint); }
.sh-rechner { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.sh-spalte { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.sh-ergebnis-spalte { position: sticky; top: 0; }
.mobil .sh-rechner { grid-template-columns: 1fr; gap: 14px; }
.mobil .sh-ergebnis-spalte { position: static; }
.sh-block { padding: 16px 18px; }
.sh-block .dr-titel { margin-bottom: 6px; }
.sh-regler { margin: 10px 0; }
.sh-regler .r-kopf { gap: 10px; }
.sh-regler .r-kopf span { display: flex; flex-direction: column; gap: 1px; font-size: 14px; }
.sh-regler .r-kopf strong { white-space: nowrap; color: var(--text); font-variant-numeric: tabular-nums; }
.sh-info { font-size: 11px; }
.sh-quellen { margin: 8px 0 10px; }
.sh-quellen .chip { padding: 6px 12px; }
.sh-zwei-wahl { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.mobil .sh-zwei-wahl { grid-template-columns: 1fr; gap: 0; }
.sh-auf-kopf { width: 100%; display: flex; align-items: center; gap: 10px; text-align: left; padding: 2px 0; font-size: 14px; color: var(--leise); font-weight: 600; }
.sh-auf-kopf span { flex: none; }
.sh-auf-kopf small { flex: 1; text-align: right; font-weight: 400; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.sh-auf-kopf i { font-style: normal; font-size: 18px; transition: transform .2s ease; color: var(--leise); }
.sh-auf-kopf.an i { transform: rotate(90deg); color: var(--mint); }
.sh-auf-kopf:hover span { color: var(--text); }
.sh-auf-inhalt { margin-top: 6px; animation: sh-auf .25s cubic-bezier(.2,.8,.2,1); }
@keyframes sh-auf { from { opacity: 0; transform: translateY(-6px); } }
.sh-zub-zeile { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--rand); }
.sh-zub-zeile > div:first-child { display: flex; flex-direction: column; min-width: 0; }
.sh-zub-zeile .regler-zeile { margin: 0; }
.sh-zub-zahl { min-width: 34px; text-align: center; }
/* Ergebnis */
.sh-ergebnis { position: relative; overflow: hidden; }
.sh-ergebnis::before { content: ""; position: absolute; inset: -40% -20% auto auto; width: 260px; height: 260px; background: radial-gradient(circle, rgba(62,230,168,.13), transparent 65%); pointer-events: none; }
.sh-preise { display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.sh-preis { display: flex; flex-direction: column; gap: 2px; padding: 12px; border-radius: 14px; background: rgba(0,0,0,.22); border: 1px solid var(--rand); min-width: 0; }
.sh-preis small { font-size: 11px; text-transform: uppercase; letter-spacing: .6px; color: var(--leise); }
.sh-preis strong { font-size: 20px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.sh-preis.haupt-preis { border-color: rgba(62,230,168,.45); background: linear-gradient(160deg, rgba(62,230,168,.16), rgba(62,230,168,.03)); }
.sh-preis.haupt-preis strong { font-size: 28px; color: var(--mint); text-shadow: 0 0 22px rgba(62,230,168,.35); }
.mobil .sh-preise { grid-template-columns: 1fr 1fr; }
.mobil .sh-preis.haupt-preis { grid-column: 1 / -1; }
.sh-balken { display: flex; height: 26px; border-radius: 9px; overflow: hidden; background: rgba(255,255,255,.05); gap: 2px; }
.sh-balken span { display: block; height: 100%; min-width: 3px; transition: width .35s cubic-bezier(.2,.8,.2,1); animation: balken-wachsen .6s cubic-bezier(.2,.8,.2,1); transform-origin: left; }
.sh-legende { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; margin: 12px 0 14px; }
.mobil .sh-legende { grid-template-columns: 1fr; }
.sh-leg-zeile { display: grid; grid-template-columns: 12px minmax(0, 1fr) auto 36px; gap: 8px; align-items: center; font-size: 13px; padding: 3px 0; }
.sh-leg-zeile i { width: 12px; height: 12px; border-radius: 4px; }
.sh-leg-zeile span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sh-leg-zeile strong { font-variant-numeric: tabular-nums; font-weight: 600; }
.sh-leg-zeile small { text-align: right; }
.sh-eckdaten .info-zeile { padding: 8px 14px; font-size: 13px; }
.sh-annahmen { margin: 10px 0 0; }
.sh-mini { display: none; }
.mobil .sh-mini { display: flex; position: sticky; top: -16px; z-index: 3; justify-content: space-between; gap: 8px; padding: 10px 14px; background: rgba(14,22,19,.92); backdrop-filter: blur(14px); border-color: rgba(62,230,168,.3); }
.sh-mini div { display: flex; flex-direction: column; }
.sh-mini small { font-size: 10px; text-transform: uppercase; letter-spacing: .5px; }
.sh-mini strong { font-size: 16px; font-variant-numeric: tabular-nums; }
.sh-mini div:first-child strong { color: var(--mint); }
/* Düsenvergleich */
.sh-duesen .dr-titel { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.sh-dv { display: grid; grid-template-columns: minmax(0, 1.4fr) 1fr 1fr; border: 1px solid var(--rand); border-radius: 14px; overflow: hidden; font-size: 13px; }
.sh-dv > * { padding: 8px 12px; border-bottom: 1px solid var(--rand); font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; }
.sh-dv > :nth-last-child(-n+3) { border-bottom: none; }
.sh-dv > strong { background: rgba(0,0,0,.22); font-size: 12px; text-transform: uppercase; letter-spacing: .6px; }
.sh-dv .sh-dv-name { text-align: left; color: var(--leise); white-space: normal; }
.sh-dv .sh-dv-06 { background: rgba(255,181,71,.07); }
.sh-dv strong.sh-dv-06 { color: var(--amber); background: rgba(255,181,71,.12); }
.sh-dv .sh-dv-06.besser { color: var(--mint); font-weight: 700; }
/* Produkte */
.sh-produkte { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
.mobil .sh-produkte { grid-template-columns: 1fr; }
.sh-produkt { display: flex; flex-direction: column; gap: 12px; transition: border-color .2s, transform .2s; }
.sh-produkt:hover { border-color: rgba(62,230,168,.35); transform: translateY(-2px); }
.sh-produkt-kopf { display: flex; gap: 12px; align-items: center; }
.sh-produkt-kopf > div { display: flex; flex-direction: column; min-width: 0; }
.sh-produkt-kopf strong { font-size: 16px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sh-produkt-preis { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.sh-produkt-preis strong { font-size: 30px; color: var(--mint); text-shadow: 0 0 20px rgba(62,230,168,.3); font-variant-numeric: tabular-nums; }
.sh-produkt-zahlen { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.sh-produkt-zahlen > div { display: flex; flex-direction: column; padding: 8px 10px; border-radius: 12px; background: rgba(0,0,0,.2); }
.sh-produkt-zahlen small { font-size: 11px; }
.sh-produkt-zahlen span { font-weight: 600; font-variant-numeric: tabular-nums; }
.sh-produkt-knoepfe { display: flex; gap: 8px; align-items: center; margin-top: auto; }
.sh-produkt-knoepfe .rund { margin-left: auto; }
/* Status-Pillen */
.sh-status { --st: var(--leise); display: inline-flex; align-items: center; gap: 5px; padding: 4px 11px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap;
  color: var(--st); background: color-mix(in srgb, var(--st) 15%, transparent); border: 1px solid color-mix(in srgb, var(--st) 35%, transparent); transition: transform .15s, box-shadow .15s; }
.sh-status i { font-style: normal; font-size: 10px; opacity: .7; transition: transform .2s; }
.sh-status.offen i { transform: rotate(180deg); }
.sh-status:hover { box-shadow: 0 0 0 3px color-mix(in srgb, var(--st) 18%, transparent); }
.sh-status.an { background: var(--st); color: #071510; }
.sh-st-grau, .sh-chip-grau { --st: #a3b5ad; } .sh-st-blau, .sh-chip-blau { --st: #5ab0ff; } .sh-st-amber, .sh-chip-amber { --st: #ffb547; }
.sh-st-tuerkis, .sh-chip-tuerkis { --st: #2bd4d4; } .sh-st-lila, .sh-chip-lila { --st: #b18cff; } .sh-st-mint, .sh-chip-mint { --st: #3ee6a8; }
.sh-filter .chip { display: inline-flex; align-items: center; gap: 6px; }
.sh-filter .chip small { opacity: .7; }
.sh-punkt { width: 8px; height: 8px; border-radius: 50%; background: var(--st); box-shadow: 0 0 8px var(--st); }
.sh-status-wahl { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 10px 12px; border-radius: 12px; background: rgba(0,0,0,.25); animation: sh-auf .2s ease; }
.sh-pfeil { color: var(--leise); font-size: 12px; }
.sh-status-chips { gap: 6px; margin: 6px 0 10px; }
/* Aufträge */
.sh-stats { grid-template-columns: repeat(5, 1fr); }
.sh-auftrag-oben { display: grid; grid-template-columns: minmax(0, 1fr) 330px; gap: 16px; align-items: start; }
.mobil .sh-auftrag-oben { grid-template-columns: minmax(0, 1fr); }
@media (max-width: 1180px) { .sh-auftrag-oben { grid-template-columns: minmax(0, 1fr); } }
.sh-auftrag-links { min-width: 0; }
.sh-auftrag-links .ws-kopfzeile { align-items: center; }
.sh-tabelle-rahmen { padding: 0; overflow-x: auto; }
.sh-tabelle { width: 100%; border-collapse: collapse; font-size: 14px; }
.sh-tabelle th { text-align: left; padding: 0; border-bottom: 1px solid var(--rand); background: rgba(0,0,0,.18); }
.sh-tabelle th button { width: 100%; display: flex; align-items: center; gap: 4px; padding: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: .7px; color: var(--leise); font-weight: 700; white-space: nowrap; }
.sh-tabelle th.rechts button { justify-content: flex-end; }
.sh-tabelle th.an button, .sh-tabelle th button:hover { color: var(--mint); }
.sh-sort-pfeil { font-style: normal; font-size: 9px; }
.sh-sort-pfeil.leer { opacity: 0; }
.sh-tabelle th button:hover .sh-sort-pfeil.leer { opacity: .4; }
.sh-tabelle td { padding: 11px 12px; border-bottom: 1px solid var(--rand); vertical-align: middle; }
.sh-tabelle tbody tr { transition: background .15s; }
.sh-tabelle tbody tr:not(.sh-status-zeile):hover { background: rgba(62,230,168,.045); }
.sh-tabelle tbody tr:last-child td { border-bottom: none; }
.sh-tabelle tr.menue-offen td { border-bottom-color: transparent; background: rgba(62,230,168,.05); }
.sh-tabelle .sh-status-zeile td { padding: 0 12px 12px; background: rgba(62,230,168,.05); }
.sh-tabelle .rechts { text-align: right; font-variant-numeric: tabular-nums; }
.sh-tabelle td strong { font-weight: 600; }
.sh-nr { font-family: ui-monospace, "SF Mono", Menlo, monospace; color: var(--leise); font-size: 13px; }
.sh-preis-zelle { font-weight: 700; color: var(--text); white-space: nowrap; }
.sh-plattform { font-size: 12px; color: var(--leise); }
.sh-notiz { display: block; font-size: 12px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sh-reserv { display: block; font-size: 11px; color: var(--amber); margin-top: 2px; }
.sh-reserv.erledigt { color: var(--leise); }
.sh-aktionen { white-space: nowrap; text-align: right; }
.sh-aktionen .mini, .sh-a-knoepfe .mini { margin: 0 6px 0 0; }
.sh-aktionen .rund { vertical-align: middle; }
.sh-in-schlange { margin-right: 6px; }
.mini.sh-inline { margin: 0 0 0 4px; padding: 2px 8px; }
.sh-karten { display: grid; gap: 10px; }
.sh-a-karte { padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.sh-a-kopf { display: flex; align-items: baseline; gap: 8px; }
.sh-a-kopf strong { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; }
.sh-a-preis { font-weight: 800; font-size: 17px; color: var(--mint); font-variant-numeric: tabular-nums; }
.sh-a-mitte { display: flex; flex-direction: column; gap: 1px; font-size: 14px; }
.sh-a-fuss { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.sh-a-knoepfe { display: flex; align-items: center; gap: 4px; }
/* Kleinunternehmer */
.sh-ku { display: flex; flex-direction: column; gap: 12px; }
.sh-ku .dr-titel { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 0; }
.sh-ku.warn { border-color: rgba(255,181,71,.4); }
.sh-ku-zeile { display: flex; flex-direction: column; gap: 4px; }
.sh-ku-kopf { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; font-size: 13px; }
.sh-ku-kopf strong { font-variant-numeric: tabular-nums; white-space: nowrap; }
.sh-ku-kopf strong small { font-weight: 400; font-size: 11px; }
.sh-ku-bahn { position: relative; height: 10px; border-radius: 5px; background: rgba(255,255,255,.07); }
.sh-ku-bahn span { display: block; height: 100%; border-radius: 5px; background: linear-gradient(90deg, #2bc4c4, #3ee6a8); box-shadow: 0 0 12px rgba(62,230,168,.35); animation: balken-wachsen .8s cubic-bezier(.2,.8,.2,1); transform-origin: left; }
.sh-ku-bahn span.amber { background: linear-gradient(90deg, #ffb547, #ffd54a); box-shadow: 0 0 12px rgba(255,181,71,.4); }
.sh-ku-bahn span.rot { background: var(--rot); box-shadow: 0 0 12px rgba(255,107,107,.45); }
.sh-ku-bahn i { position: absolute; top: -3px; bottom: -3px; width: 2px; background: rgba(255,181,71,.6); border-radius: 1px; }
.sh-ku .hinweis, .sh-ku p { margin: 0; }
.sh-ku small b { font-weight: 700; }
.sh-ku small b.amber { color: var(--amber); } .sh-ku small b.rot { color: var(--rot); }
/* Einstellungen */
.sh-einst { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.mobil .sh-einst { grid-template-columns: 1fr; }
.sh-preset { padding: 10px 0 2px; border-bottom: 1px solid var(--rand); }
.sh-preset:last-child { border-bottom: none; }
.sh-preset .sh-regler { margin: 4px 0; }
.sh-schalter-zeile { display: flex; align-items: center; gap: 14px; justify-content: space-between; }
.sh-schalter-zeile > div { display: flex; flex-direction: column; gap: 2px; }
.sh-schalter { width: 50px; height: 28px; border-radius: 14px; background: rgba(255,255,255,.12); position: relative; flex: none; transition: background .2s; }
.sh-schalter span { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #dfe9e4; transition: transform .22s cubic-bezier(.2,.9,.3,1.3); }
.sh-schalter.an { background: var(--mint); box-shadow: 0 0 14px rgba(62,230,168,.4); }
.sh-schalter.an span { transform: translateX(22px); background: #062018; }
/* Sheet und Nerd */
.sh-sheet .feld input[type=date] { color-scheme: dark; }
.knopf.sh-loeschen { margin-right: auto; color: var(--rot); }
.mobil .sh-sheet .sheet-fuss .knopf.sh-loeschen { flex: 0 0 auto; }
.sh-saeulen { height: 170px; gap: 6px; }
.sh-umsatz { background: linear-gradient(180deg, #7cf5c8, #2bc4c4); border-radius: 6px 6px 0 0; }
.sh-nerd .sh-stats { grid-template-columns: repeat(4, 1fr); }
.mobil .sh-stats { grid-template-columns: repeat(2, 1fr); }
.mobil .sh-nerd .sh-stats .stat:nth-child(n+3) { display: flex; }
.mobil .sh-filter { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin: 0 -16px; padding: 0 16px 4px; }
.mobil .sh-filter::-webkit-scrollbar { display: none; }
.mobil .sh-auftrag-links .ws-kopfzeile { gap: 10px; align-items: stretch; }
/* ---- Integration: automatische Sicherung und Update-Prüfung (System) ---- */
.sich-auto { margin: 16px 0 6px; padding: 14px; border-radius: 14px; border: 1px solid rgba(62,230,168,.22); background: radial-gradient(420px 140px at 0% 0%, rgba(62,230,168,.08), transparent 70%), var(--flaeche); }
.sich-auto-kopf { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; font-size: 14px; }
.sich-auto-kopf .dot { margin-right: 2px; background: var(--leise); }
.sich-auto-kopf .dot.mint { background: var(--mint); box-shadow: 0 0 10px var(--mint); }
.sich-auto-kopf .dot.amber { background: var(--amber); }
.sich-auto-kopf .dot.aus { background: var(--rot); }
.sich-auto > p { margin: 6px 0 10px; }
.sich-liste { display: grid; gap: 6px; margin-bottom: 12px; }
.sich-zeile { display: flex; align-items: center; gap: 10px; padding: 8px 10px 8px 12px; border-radius: 12px; background: rgba(0,0,0,.22); border: 1px solid var(--rand); }
.sich-zeile.kaputt { opacity: .6; }
.sich-text { flex: 1; min-width: 0; display: grid; gap: 1px; }
.sich-text strong { font-size: 14px; font-weight: 600; }
.sich-text small { font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sich-zeile .knopf { flex: none; }
.sich-unter { margin: 18px 0 4px; font-size: 14px; color: var(--leise); font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }
.upd-karte .knopf-reihe, .sich-auto .knopf-reihe { flex-wrap: wrap; }
.upd-karte .knopf-reihe .knopf { min-width: 180px; }
.upd-liste { margin: 14px 0 12px; }
.upd-liste .pille { margin-left: 6px; vertical-align: 1px; }
.upd-notizen { margin: 0 0 12px; padding: 12px 14px; border-radius: 12px; background: rgba(0,0,0,.25); border: 1px solid var(--rand); max-height: 260px; overflow: auto; font-size: 13px; line-height: 1.5; }
.upd-notizen p { margin: 0 0 6px; }
.upd-md { white-space: pre-wrap; color: var(--leise); }
.upd-md strong { color: var(--text); }
.upd-link { color: var(--mint); text-decoration: none; }
.upd-link:hover { text-decoration: underline; }
.upd-liste .info-zeile strong { text-align: right; }
.mobil .sich-zeile { padding: 8px 8px 8px 10px; gap: 8px; }
.mobil .sich-text strong { font-size: 13px; }
.mobil .sich-text small { white-space: normal; }
.mobil .sich-zeile .klein-knopf { padding: 8px 10px; font-size: 12px; }
.mobil .upd-karte .knopf-reihe .knopf { min-width: 0; flex-basis: 100%; }
`;
