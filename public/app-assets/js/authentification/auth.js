$(document).ready(function() {
  // get password input elements
  const passwordField = $('#signupForm #password');
  const confirmPasswordField = $('#signupForm #password_again');

  /**
   * Handle sign up form submit
   */
  $('#signupForm').on('submit', function(e) {
    e.preventDefault();
    // diactivate the submit btn
    diactivateBtn();
    // get field values
    const userEmail = $('#email').val();
    const userName = $('#username').val();
    // check if password values are the same
    if (passwordField.val() === confirmPasswordField.val()) {
      // send ajax post to the server
      $.ajax({
        type: 'post',
        url: '/signup/user',
        data: {
          username: userName,
          email: userEmail,
          password: passwordField.val(),
          password_again: confirmPasswordField.val(),
        },
        success: function(customToken) {
          // signin with token from server
          signInWithToken(customToken);
        },
      });
    } else {
      // handle errors
      $('.error-msg .details').text('Password didn\'t match');
      $('.error-msg .solution').text('Enter Password again');
      $('.error-msg').css('display', 'block');
    }
  });

  $('#frmLogin').on('submit', function(e) {
    e.preventDefault();
    // diactivate the submit btn
    diactivateBtn();
    // get field values
    const username = $('#username').val();
    const password = $('#password').val();

    // When the user signs in with email and password.
    firebase.auth().signInWithEmailAndPassword(username, password)
        .then((user) => {
          // Get the user's ID token as it is needed to exchange for a session cookie.
          const token = {
            idToken: user.user.ma,
          };
          // post token to server
          postIdTokenToSessionLogin('/sessionLogin', token);
        })
        .catch(function(error) {
          // Handle Errors here.
          $('.error-msg .code').text(error.code);
          $('.error-msg .details').text(error.message);
          $('.error-msg').css('display', 'block');
          activateBtn();
        });
  });

  passwordField.on('input', function(event) {
    if (passwordField.val() === confirmPasswordField.val()) {
      confirmPasswordField.siblings().css('color', 'green');
      passwordField.siblings().css('color', 'green');
    } else {
      if ($(event.target).val().length < 8) {
        $(event.target)
            .siblings()
            .css('color', 'red');
      } else {
        $(event.target)
            .siblings()
            .css('color', '#ffa500');
        confirmPasswordField.siblings().css('color', 'red');
      }
    }
  });
  confirmPasswordField.on('input', function(event) {
    if (passwordField.val() === confirmPasswordField.val()) {
      confirmPasswordField.siblings().css('color', 'green');
      passwordField.siblings().css('color', 'green');
    } else {
      if ($(event.target).val().length < 8) {
        $(event.target)
            .siblings()
            .css('color', 'red');
      } else {
        $(event.target)
            .siblings()
            .css('color', '#ffa500');
        passwordField.siblings().css('color', 'red');
      }
    }
  });
});

/**
 * Signin user after signing up
 * @param {String} customToken firebase authentification token
 */
function signInWithToken(customToken) {
  // firebase signInWithCustomToken return a promise
  firebase.auth().signInWithCustomToken(customToken)
      .then(function() {
        // get current user idToken
        auth.currentUser
            .getIdToken()
            .then(function(idToken) {
              // return data object
              const data = {idToken: idToken};
              return data;
            })
            .then(function(data) {
              // Send token to backend
              postIdTokenToSessionLogin('/sessionLogin', data);
            })
            .catch(function(error) {
              console.log(error);
              // activate submit btn
              activateBtn();
            });
      })
      .catch(function(error) {
      // Handle Errors here.
        $('.error-msg .code').text(error.code);
        $('.error-msg .details').text(error.message);
        $('.error-msg').css('display', 'none');
      });
}

/**
 * Send request to server
 * @param {String} path request url
 * @param {Object} data data that will be sent to the server
 */
function postIdTokenToSessionLogin(path, data) {
  $.ajax({
    type: 'POST',
    url: path,
    data: data,
    success: function(responce) {
      // activate submit btn
      activateBtn();
      // load the Reports
      window.location.replace('/response');
    },
  });
}

/**
 * activate submit btn
 */
function activateBtn() {
  $('#submit .preloader-wrapper.small').hide();
  $('#submit span').text('Publish');
  $('#submit').prop('disabled', false);
}

/**
 * diactivate the submit btn
 */
function diactivateBtn() {
  $('#submit .preloader-wrapper.small')
      .css({'display': 'inline-block'});
  $('#submit span').text('Please wait while processing...');
  $('#submit').prop('disabled', true);
}
