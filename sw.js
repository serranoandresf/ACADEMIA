/* Mi Academia — service worker: deja la app disponible sin conexión.
   Solo cachea los archivos de la app. Tus cursos y tu progreso NO pasan por aquí (viven en IndexedDB y localStorage). */
const V = "academia-app-v3"; // sube este número cuando publiques una versión nueva
const ARCHIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("academia-app-") && k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Responde desde la caché propia al instante y actualiza en segundo plano (la versión nueva se ve en la siguiente apertura)
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.open(V).then((c) => c.match(e.request, { ignoreSearch: true }).then((guardado) => {
      const red = fetch(e.request).then((r) => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => guardado);
      return guardado || red;
    })),
  );
});
