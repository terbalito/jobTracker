importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCctInHQCrbOjJM_KRzJAOVcnNsSF-d3sc",
    authDomain: "jobtracker-1e97f.firebaseapp.com",
    projectId: "jobtracker-1e97f",
    storageBucket: "jobtracker-1e97f.firebasestorage.app",
    messagingSenderId: "1052589010482",
    appId: "1:1052589010482:web:99a79df3c396fca97b562b",
    measurementId: "G-D8KG274ZSL"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Message en arrière-plan reçu : ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icons/icon-192.png'
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
