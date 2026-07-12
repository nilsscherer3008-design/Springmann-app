/*
 * Service Worker für die Springmann Bestellerfassung-App.
 * Aufgaben:
 *  1) Beim ersten Aufruf die wichtigsten Dateien cachen (App-Shell),
 *     damit die App auch bei schlechtem WLAN im Lager funktioniert.
 *  2) Ein Service Worker ist außerdem eine technische Voraussetzung
 *     dafür, dass Chrome/Android das "beforeinstallprompt"-Event
 *     überhaupt auslöst (= Grundlage für unser Installations-Pop-up).
 */

const CACHE_NAME = "springmann-cache-v1";

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
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting(); // neue Version sofort aktiv werden lassen
});

// --- Aktivierung: alte Cache-Versionen aufräumen ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// --- Fetch: erst Cache, sonst Netzwerk (Offline-First für App-Shell) ---
self.addEventListener("fetch", (event) => {
  // externe CDN-Aufrufe (z.B. Tesseract.js) nicht cachen, nur eigene Dateien
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => {
          // Fallback auf die Startseite, wenn offline und Ressource unbekannt
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        })
      );
    })
  );
});
