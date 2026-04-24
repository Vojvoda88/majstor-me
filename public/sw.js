// BrziMajstor.ME - PWA Service Worker
// Ikone za push: drži u skladu sa lib/pwa-icon-assets.ts (PWA_ICON_CACHE_VERSION).
const ICON_192 = "/launcher-icon-192.png?v=20260424-e8318b87";
const CACHE_NAME = "majstor-me-v20260424-e8318b87";
const START_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(START_URL)).catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(START_URL))
      .then((r) => r || caches.match("/"))
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "BrziMajstor.ME", body: "", link: "/" };
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (_) {
      data.body = event.data.text();
    }
  }
  const options = {
    body: data.body,
    icon: ICON_192,
    badge: ICON_192,
    data: { url: data.link },
    tag: data.tag || "majstor-me",
    renotify: true,
  };
  event.waitUntil(
    (async () => {
      await self.registration.showNotification(data.title, options);
      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of clients) {
        client.postMessage({
          type: "PUSH_RECEIVED",
          payload: {
            title: data.title,
            body: data.body,
            link: data.link,
          },
        });
      }
    })()
  );
});

function normalizeNotificationTarget(raw) {
  const fallback = `${self.location.origin}/`;
  if (!raw || typeof raw !== "string") return fallback;
  try {
    const parsed = new URL(raw, self.location.origin);
    const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return `${self.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
  } catch (_) {
    if (raw.startsWith("/")) return `${self.location.origin}${raw}`;
    return fallback;
  }
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = normalizeNotificationTarget(event.notification.data?.url || "/");
  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const sameOrigin = clientList.filter(
        (c) => typeof c.url === "string" && c.url.startsWith(self.location.origin)
      );

      for (const client of sameOrigin) {
        if ("navigate" in client && typeof client.navigate === "function") {
          try {
            const after = await client.navigate(targetUrl);
            if (after && "focus" in after) {
              await after.focus();
              return;
            }
          } catch (_) {
            /* pokušaj openWindow */
          }
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
