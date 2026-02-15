import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-messaging.js";

let messaging = null;

// 🔹 Initialisation quand Firebase est prêt
window.addEventListener("firebase-ready", () => {
    if (window.auth && window.auth.app) {
        try {
            messaging = getMessaging(window.auth.app);
            console.log("✅ Messaging prêt");
        } catch (err) {
            console.error("Erreur init messaging après firebase-ready :", err);
        }
    }
});

// 🔹 Essai immédiat si Firebase déjà initialisé
try {
    const app = window.auth?.app;
    if (app) {
        messaging = getMessaging(app);
    }
} catch (error) {
    console.warn("Firebase pas encore initialisé :", error);
}

// 🔹 Demande de permission et récupération du token FCM
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        alert("Votre navigateur ne supporte pas les notifications.");
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        console.log("Permission notifications refusée");
        return;
    }

    if ('serviceWorker' in navigator) {
        try {
            // Enregistrer SW FCM
            const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log("✅ SW FCM enregistré :", reg);

            // Initialiser Messaging après enregistrement du SW
            const { getMessaging, getToken, onMessage } = await import('https://www.gstatic.com/firebasejs/12.8.0/firebase-messaging.js');
            const messaging = getMessaging(window.auth.app);
            const token = await getToken(messaging, { vapidKey: "BFJMh3LkKj7SVbyisP0Hz0Mnj7i5YLKQd3DcrtX7GFhumqFsEL2RYL9IqnYUjnwR4GLMK9wpA2uWatWgWGx7m0c" });
            console.log("Token FCM :", token);
            localStorage.setItem('fcm-token', token);

            // Écouter messages foreground
            onMessage(messaging, (payload) => {
                console.log("Message reçu au premier plan :", payload);
                const toast = document.getElementById('notification-toast');
                if (toast) {
                    toast.textContent = payload.notification?.title || "Nouvelle notification";
                    toast.classList.remove('hidden');
                    setTimeout(() => toast.classList.add('hidden'), 4000);
                }
            });

        } catch (err) {
            console.error("Erreur FCM :", err);
        }
    }
}


// 🔹 Écouter les messages au premier plan
export function listenForegroundMessages() {
    if (!messaging) {
        console.warn("Messaging non initialisé. Impossible d'écouter les messages.");
        return;
    }

    onMessage(messaging, (payload) => {
        console.log("Message reçu au premier plan :", payload);

        const toast = document.getElementById('notification-toast');
        if (toast) {
            toast.textContent = payload.notification?.title || "Nouvelle notification";
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 4000);
        }
    });
}
