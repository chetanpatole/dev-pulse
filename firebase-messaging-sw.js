/* Firebase Cloud Messaging background handler.
   Loaded as a standalone service worker (compat build via importScripts). */
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBaevyjviX8F50NHMlIrNCefxk49hMEAqQ",
  authDomain: "dev-pulse-cd743.firebaseapp.com",
  projectId: "dev-pulse-cd743",
  storageBucket: "dev-pulse-cd743.firebasestorage.app",
  messagingSenderId: "723698366296",
  appId: "1:723698366296:web:296d25a721a3a01189172d",
});

const messaging = firebase.messaging();

// We send data-only messages, so show the notification ourselves (avoids the
// browser auto-showing a second one).
messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};
  self.registration.showNotification(d.title || "Dev Pulse", {
    body: d.body || "",
    icon: "/dev-pulse/icon.svg",
    badge: "/dev-pulse/icon.svg",
    tag: "dev-pulse-insight",
    data: { url: d.url || "/dev-pulse/" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/dev-pulse/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes("/dev-pulse/") && "focus" in c) return c.focus();
      }
      return clients.openWindow(url);
    })
  );
});
