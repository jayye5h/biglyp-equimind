/* EquiMind service worker: shows daily check-in reminder push notifications. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = { title: "EquiMind", body: "Your daily check-in is waiting for you.", url: "/dashboard" };
  try { data = { ...data, ...(event.data ? event.data.json() : {}) }; } catch (e) { /* plain text */ }
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/avatars/stages/stage3.webp",
    badge: "/avatars/stages/stage3.webp",
    tag: data.tag || "eq-reminder",
    renotify: true,
    data: { url: data.url || "/dashboard" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/dashboard", self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    const win = list.find((c) => c.url.startsWith(self.location.origin));
    if (win) return win.focus().then(() => win.navigate(url));
    return self.clients.openWindow(url);
  }));
});
