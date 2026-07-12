/*
 * Service Worker für die Springmann Bestellerfassung-App.
 * Aufgaben:
 *  1) Beim ersten Aufruf die wichtigsten Dateien cachen (App-Shell),
 *     damit die App auch bei schlechtem WLAN im Lager funktioniert.
 *  2) Ein Service Worker ist außerdem eine technische Voraussetzung
 *     dafür, dass Chrome/Android das "beforeinstallprompt"-Event
 *     überhaupt auslöst (= Grundlage für unser Installations-Pop-up).
 *  3) Externe Ressourcen (JSZip-Bibliothek für den ZIP-Export, Schriftarten)
 *     werden beim ersten erfolgreichen Laden automatisch zusätzlich
 *     gecacht, damit z. B. "Bestellung abschließen" (CSV+Fotos-ZIP) auch
 *     offline zuverlässig funktioniert, sobald die App einmal mit
 *     Internet geöffnet wurde.
 */

const APP_SHELL_CACHE = "springmann-shell-v2";
const EXTERN_CACHE = "springmann-extern-v2";

// Dateien, die für den Offline-Start der App gebraucht werden
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./assets/springmann-logo.png",
];

// --- Installation: App-Shell in den Cache legen ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting(); // neue Version sofort aktiv werden lassen
});

// --- Aktivierung: alte Cache-Versionen aufräumen ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== APP_SHELL_CACHE && key !== EXTERN_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// --- Fetch: eigene Dateien vs. externe Ressourcen unterschiedlich behandeln ---
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const istEigeneDatei = new URL(event.request.url).origin === self.location.origin;

  if (istEigeneDatei) {
    // App-Shell: erst Cache, sonst Netzwerk (mit Fallback auf index.html
    // für Navigations-Anfragen, damit die App bei Direktaufruf offline
    // trotzdem startet)
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).catch(() => {
            if (event.request.mode === "navigate") {
              return caches.match("./index.html");
            }
          })
        );
      })
    );
  } else {
    // Externe Ressourcen (JSZip, Google Fonts): erst Cache, sonst Netzwerk
    // laden UND fürs nächste Mal (auch offline) im Cache speichern.
    event.respondWith(
      caches.open(EXTERN_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const antwort = await fetch(event.request);
          if (antwort && antwort.status === 200) {
            cache.put(event.request, antwort.clone());
          }
          return antwort;
        } catch (fehler) {
          throw fehler;
        }
      })
    );
  }
});
