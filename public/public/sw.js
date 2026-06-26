// ─── ProveIt! Service Worker ──────────────────────────────────────────────────
const CACHE_NAME = "proveit-v1";

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
];

// ── Install: pre-cache core shell ─────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately — don't wait for old SW to die
  self.skipWaiting();
});

// ── Activate: clear old caches ────────────────────────────────────────────────
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

// ── Fetch: Network first, fall back to cache, then offline page ───────────────
self.addEventListener("fetch", (event) => {
  // Skip non-GET and browser-extension requests
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Skip Supabase API calls — always go to network for auth/data
  if (event.request.url.includes("supabase.co")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache a copy of successful responses
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => {
        // Network failed — try cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // If it's a navigation request, show offline page
          if (event.request.mode === "navigate") {
            return caches.match("/offline.html");
          }
        });
      })
  );
});
