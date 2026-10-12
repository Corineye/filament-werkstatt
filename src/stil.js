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
  height: 100%;
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
  position: relative; height: 100%; display: flex; flex-direction: column; overflow: hidden;
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

.haupt { flex: 1; overflow-y: auto; padding: 24px; position: relative; z-index: 1; }
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
.sheet-inhalt { flex: 1; overflow-y: auto; padding: 16px 20px 24px; }
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
.auswahl span { font-size: 10px; text-transform: uppercase; letter-spacing: .6px; color: var(--leise); }
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
select.text { appearance: auto; }
select.text option { background: #111816; }

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
.dialog { max-height: calc(100% - 40px); overflow-y: auto; }
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
`;
