import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Public web config (safe to ship in the client).
const firebaseConfig = {
  apiKey: "AIzaSyBaevyjviX8F50NHMlIrNCefxk49hMEAqQ",
  authDomain: "dev-pulse-cd743.firebaseapp.com",
  projectId: "dev-pulse-cd743",
  storageBucket: "dev-pulse-cd743.firebasestorage.app",
  messagingSenderId: "723698366296",
  appId: "1:723698366296:web:296d25a721a3a01189172d",
};

const VAPID_KEY =
  "BJGrL4kashue1rxChcL8vBNg_s0W8vYaZF4meiYEn_Raqt3RuDarHYlfIZKyKZZ_uOVcLHQjH9zBArlhQ6TRK6Q";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function messagingIfSupported() {
  try {
    return (await isSupported()) ? getMessaging(app) : null;
  } catch {
    return null;
  }
}

function setStatus(s) { try { localStorage.setItem("dp-push-status", s); } catch { /* */ } }
export function pushStatus() { try { return localStorage.getItem("dp-push-status") || ""; } catch { return ""; } }

/**
 * Ask for permission (returns it), then BEST-EFFORT register the FCM token and
 * save it to Firestore. Token failures never change the returned permission, so
 * the UI toggle always reflects the real browser permission. Status for the
 * token step is stored for on-screen display.
 */
export async function enablePush() {
  if (typeof Notification === "undefined") return "unsupported";
  const permission = await Notification.requestPermission();
  if (permission !== "granted") { setStatus(`permission: ${permission}`); return permission; }

  try {
    const messaging = await messagingIfSupported();
    if (!messaging) { setStatus("messaging not supported on this browser"); return permission; }

    const reg = await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}firebase-messaging-sw.js`,
      { scope: `${import.meta.env.BASE_URL}fcm/` }
    );
    await navigator.serviceWorker.ready;

    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
    if (!token) { setStatus("no token returned"); return permission; }

    await setDoc(
      doc(db, "tokens", token),
      { token, updated: Date.now(), ua: navigator.userAgent },
      { merge: true }
    );
    setStatus("registered");
  } catch (e) {
    setStatus("error: " + (e && e.message ? e.message : String(e)).slice(0, 120));
    console.error("FCM registration failed", e);
  }
  return permission;
}

/** Fire `cb(payload)` when a message arrives while the app is open. */
export async function listenForeground(cb) {
  const messaging = await messagingIfSupported();
  if (messaging) onMessage(messaging, cb);
}
