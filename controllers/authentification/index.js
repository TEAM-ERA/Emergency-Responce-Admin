/* eslint-disable linebreak-style */

module.exports = function(app, firebase) {
  const auth = firebase.auth();
  app.get('/login', function(_req, res) {
    res.render('login', {
      title: 'Login | ERA',
      description: 'Login to Emergency Response Assistance',
    });
  });
  app.get('/register', function(_req, res) {
    res.render('signup', {
      title: 'Sign Up | ERA',
      description: 'Register to Emergency Response Assistance',
    });
  });
  // signin
  app.post('/signup/user', (req, res) => {
    auth.createUser({
      displayName: req.body.username,
      email: req.body.email,
      password: req.body.password,
    }).then(function(userRecord) {
      auth.setCustomUserClaims(userRecord.uid, {admin: true}).then(() => {
        auth.createCustomToken(userRecord.uid)
            .then(function(customToken) {
              res.send(customToken);
            });
      });
    }).catch(function(error) {
      console.log('Error creating new user:', error);
    });
  });

  app.post('/sessionLogin', (req, res) => {
    const idToken = req.body.idToken.toString();
    auth.verifyIdToken(idToken)
        .then((decodedIdToken) => {
          // Only process if the user just signed in in the last 5 minutes.
          if (new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) {
            // generate a new session id
            req.session.regenerate(function(err) {
              if (!err) {
                // Create session cookie and set it.
              }
            });
            const sessData = req.session;
            sessData.idToken = req.body.idToken;
            console.log(sessData);
            
            res.send('Login Succesful');
          } else {
            // A user that was not recently signed in is trying to set a session cookie.
            // To guard against ID token theft, require re-authentication.
            res.status(401).send('Recent sign in required!');
          }
        });
  });

  app.post('/sessionLogout', (req, res) => {
    req.session.destroy(function(err) {
      // cannot access session here
      res.send('Logout Successul');
    });
  });
};

