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

/**
 * Ask for permission, register the FCM service worker, get a token, and save it
 * to Firestore so the sender can reach this device. Returns the permission.
 */
export async function enablePush() {
  if (typeof Notification === "undefined") return "unsupported";
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission;

  const messaging = await messagingIfSupported();
  if (!messaging) return "unsupported";

  // Dedicated scope so this SW doesn't clash with the app's PWA service worker.
  const reg = await navigator.serviceWorker.register(
    `${import.meta.env.BASE_URL}firebase-messaging-sw.js`,
    { scope: `${import.meta.env.BASE_URL}fcm/` }
  );

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: reg,
  });

  if (token) {
    await setDoc(
      doc(db, "tokens", token),
      { token, updated: Date.now(), ua: navigator.userAgent },
      { merge: true }
    );
  }
  return "granted";
}

/** Fire `cb(payload)` when a message arrives while the app is open. */
export async function listenForeground(cb) {
  const messaging = await messagingIfSupported();
  if (messaging) onMessage(messaging, cb);
}
