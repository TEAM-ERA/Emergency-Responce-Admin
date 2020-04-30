/* eslint-disable require-jsdoc */
let token = '';
const tokens = [];

// Send a message to the device corresponding to the provided
// registration token.
exports.push = function(messaging, message) {
  messaging.send(message)
      .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
};

exports.getToken =function() {
  tokens.forEach(function(elem, index) {
    if (elem == token) {

    }
  });
  return tokens.push();
};

exports.init = function(app, firebase) {
  app.post('/fcmtoken', function(req, res, next) {
    const sessData = req.session;
    token = req.body.fcmtoken;
    sessData.fcmtoken = req.body.fcmtoken;
    res.send('Returning with some text' + sessData.fcmtoken);
  });
};

