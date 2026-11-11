import { api } from "@/lib/api";

export const pushSupported = () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

const toBytes = (b64) => {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export const pushState = async () => {
  if (!pushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = reg && (await reg.pushManager.getSubscription());
  if (sub && Notification.permission === "granted") {
    api.post("/push/subscribe", sub.toJSON()).catch(() => {});
    return "on";
  }
  return "off";
};

/** Must be called from a click. Returns "on" | "denied" | "unsupported". */
export const enablePush = async () => {
  if (!pushSupported()) return "unsupported";
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return "denied";
  const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  const { data } = await api.get("/push/public-key");
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toBytes(data.publicKey) });
  await api.post("/push/subscribe", sub.toJSON());
  await api.post("/push/test").catch(() => {});
  return "on";
};

export const disablePush = async () => {
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = reg && (await reg.pushManager.getSubscription());
  if (sub) {
    await api.post("/push/unsubscribe", sub.toJSON()).catch(() => {});
    await sub.unsubscribe();
  }
  return "off";
};
