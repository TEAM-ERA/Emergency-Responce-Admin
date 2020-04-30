importScripts('https://www.gstatic.com/firebasejs/7.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.8.1/firebase-messaging.js');
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBFmCPBratRce0ZmkBZHeTCTmz7DhYu95Y',
  authDomain: 'dsc-uew-k-1b5d3.firebaseapp.com',
  databaseURL: 'https://dsc-uew-k-1b5d3.firebaseio.com',
  projectId: 'dsc-uew-k-1b5d3',
  storageBucket: 'dsc-uew-k-1b5d3.appspot.com',
  messagingSenderId: '399519729218',
  appId: '1:399519729218:web:434394a93164034e70cfdb',
  measurementId: 'G-RVC5YPCSBP',
};

// Initialize Firebase
const defaultProject = firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  const title = 'New Emergency Report';
  console.log(payload);
  const options = {
    body: payload.data.case,
  };
  return self.registration.showNotification(title, options);
});

self.onnotificationclick = function(event) {
  console.log('On notification click: ', event.notification.tag);
  event.notification.close();
  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: 'window',
  }).then(function(clientList) {
    for (let i = 0; i < clientList.length; i++) {
      const client = clientList[i];
      if (client.url == '/' && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow('/');
    }
  }));
};
