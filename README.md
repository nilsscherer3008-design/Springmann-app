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

## Artikelnummer-Erkennung anpassen
In `index.html`, Funktion `extrahiereArtikelnummer()`: Regex `/\b[A-Z]{1,3}[-\s]?\d{4,6}\b/`
an das echte Etikett-Format anpassen, falls nötig.
