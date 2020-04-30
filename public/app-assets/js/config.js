// Your web app's Firebase configuration
const firebaseConfig = /* PASTE YOUR FIREBASE CONFID OBJECT HERE */

// register service wroker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js');
  });
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// get firebase services
const auth = firebase.auth();
const messaging = firebase.messaging();

// As httpOnly cookies are to be used, do not persist any state client side.
auth.setPersistence(firebase.auth.Auth.Persistence.NONE);

/**
 * request messaging permession
 */
messaging.requestPermission()
    .then(function() {
      // get message token
      return messaging.getToken();
    })
    .then(function(token) {
      // send token to server
      sendToServer(token);
    })
    .catch(function(error) {
      console.log('Error Occured or Blocked', error);
    });


/**
 * handle the message when the page is open
 */
messaging.onMessage(function(payload) {
  // get the audio element
  const alertsound = document.getElementById('alertsound');
  // get alert element if exist
  const alertBox = $('.alerts-container .alert.report');
  // check for the arrival of the first message
  if (payload.data.num == 1) {
    // play the audio
    const playPromise = alertsound.play(); // return a promise
    // check if play was successfull
    if (playPromise !== undefined) {
      playPromise.then((_) => {
      // Play audio again
        alertsound.play();
      }).catch((error) => {
        console.log(error);
      });
    }
  }
  // check if alert boss exist
  if (alertBox.length == 0) {
    // display an alert if it does not exist
    showReportAlert('New Emergency Reported');
  } else {
    // Update the text of the alert if it exist
    alertBox.find('.alert-msg').text('New Emergency Reported');
  }
});


// Socket io init
const socket = io.connect('http://localhost:3000');

/**
 * Send the FCM token to the server
 * @param {String} token token generated from the client FCM
 */
function sendToServer(token) {
  $.ajax({
    type: 'post',
    url: '/fcmtoken',
    data: {fcmtoken: token},
    success: function(response) {
      console.log(response);
    },
    fail: function(err) {
      console.log(err);
    },
  });
}

