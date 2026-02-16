// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Config Firebase
firebase.initializeApp({
    apiKey: "AIzaSyCctInHQCrbOjJM_KRzJAOVcnNsSF-d3sc",
    authDomain: "jobtracker-1e97f.firebaseapp.com",
    projectId: "jobtracker-1e97f",
    storageBucket: "jobtracker-1e97f.firebasestorage.app",
    messagingSenderId: "1052589010482",
    appId: "1:1052589010482:web:99a79df3c396fca97b562b",
    measurementId: "G-D8KG274ZSL"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[FCM SW] Message en arrière-plan :', payload);

    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/android/android-launchericon-192-192.png',
        badge: '/android/android-launchericon-48-48.png',
        vibrate: [200, 100, 200],
        tag: 'urgent-job'
    });
});