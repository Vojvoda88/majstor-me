// BrziMajstor.ME - PWA Service Worker
const CACHE_NAME = "majstor-me-v2";
const START_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(START_URL)).catch(() => {}).then(() => self.skipWaiting())
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
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.link },
    tag: data.tag || "majstor-me",
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
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
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          if ("navigate" in client && typeof client.navigate === "function") {
            return client.navigate(targetUrl).then((c) => (c ? c.focus() : undefined));
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
