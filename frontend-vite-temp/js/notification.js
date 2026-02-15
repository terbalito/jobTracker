import { 
    getMessaging, 
    getToken, 
    onMessage 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-messaging.js";

let messaging = null;

/**
 * 🔥 Initialisation de Firebase Messaging
 * On attend que Firebase soit prêt
 */
window.addEventListener("firebase-ready", () => {
    if (window.auth && window.auth.app) {
        try {
            messaging = getMessaging(window.auth.app);
            console.log("✅ Messaging prêt");
        } catch (error) {
            console.error("❌ Erreur initialisation messaging :", error);
        }
    } else {
        console.warn("⚠️ Firebase non disponible pour Messaging");
    }
});


/**
 * 🔔 Demande la permission pour les notifications
 */
export async function requestNotificationPermission() {

    if (!messaging) {
        console.warn("Messaging non prêt.");
        return;
    }

    if (!('Notification' in window)) {
        alert("Votre navigateur ne supporte pas les notifications.");
        return;
    }

    try {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            console.log("✅ Permission notifications accordée !");

            try {
                const token = await getToken(messaging, { 
                    vapidKey: "<VOTRE_CLE_VAPID>" 
                });

                if (token) {
                    console.log("📌 Token FCM :", token);
                } else {
                    console.warn("⚠️ Aucun token reçu.");
                }

            } catch (err) {
                console.error("❌ Erreur récupération token FCM :", err);
            }

        } else {
            console.log("❌ Permission notifications refusée");
        }

    } catch (error) {
        console.error("❌ Erreur permission notification :", error);
    }
}


/**
 * 📩 Écoute des messages reçus quand l'app est ouverte
 */
export function listenForegroundMessages() {

    window.addEventListener("firebase-ready", () => {

        if (!messaging) {
            console.warn("Messaging non prêt pour onMessage.");
            return;
        }

        onMessage(messaging, (payload) => {
            console.log("📨 Message reçu au premier plan :", payload);

            const toast = document.getElementById('notification-toast');

            if (toast) {
                toast.textContent = payload.notification?.title || "Nouvelle notification";
                toast.classList.remove('hidden');

                setTimeout(() => {
                    toast.classList.add('hidden');
                }, 4000);
            }
        });

    });
}
