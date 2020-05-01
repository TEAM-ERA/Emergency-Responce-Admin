importScripts('https://www.gstatic.com/firebasejs/7.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.8.1/firebase-messaging.js');
// Your web app's Firebase configuration


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
