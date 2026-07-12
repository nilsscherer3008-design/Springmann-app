# Springmann Bestellerfassung – PWA

## Starten (lokal testen)
```
cd springmann-app
python3 -m http.server 8080
```
Dann im Handy-Browser (im selben WLAN) `http://<IP-des-Rechners>:8080` öffnen.

## Live-Schalten
PWA-Installation erfordert **HTTPS**. Einfachste Optionen:
- Ordner-Inhalt zu **Netlify**, **Vercel** oder **GitHub Pages** hochladen (Drag & Drop reicht bei Netlify).
- Dann die HTTPS-URL auf dem Smartphone öffnen → Installations-Banner erscheint automatisch.

## Dateien
- `index.html` – komplette App (UI + Logik)
- `manifest.json` – macht die App installierbar
- `sw.js` – Service Worker (Offline-Cache, Voraussetzung fürs Install-Pop-up)
- `icons/` – App-Icons (192px, 512px, maskable)

## Hinweis
Die Erfassung läuft ohne Texterkennung: Kunde, Menge und Farbe werden manuell
eingegeben, ein Foto der Ware/des Etiketts kann optional als Beleg
hinzugefügt werden.
