/*
 *Getting modules
 */
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const sharedsession = require('express-socket.io-session');
const socket = require('socket.io');
const cookieParser = require('cookie-parser');
const MemcachedStore = require('connect-memcached')(session);
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const dashboard = require('./controllers/dashboard');
const reports = require('./controllers/reports');
const healthTips = require('./controllers/health-tips');
const authentification = require('./controllers/authentification');
const firstAid = require('./controllers/first-aid');
const notification = require('./controllers/notification');
const serviceAccount = require(
    './config/credentials.json',
);
// decalre contants for the session
const SESSION_AGE = 1000 * 60 * 60 * 24;
const NODE_ENV = process.env.NODE_ENV == 'Production';

const sessionMiddleware = session({
  name: process.env.SESSION_NAME,
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: SESSION_AGE,
    sameSite: true,
    secure: NODE_ENV,
  },
  store: new MemcachedStore({
    hosts: [process.env.SESSION_STORE_HOST],
    secret: process.env.SESSION_NAME,
  }),
});

/*PASTE YOUR FIRE INIT CODE HERE*/

/*
 *creating instances of express
 */
const app = express();

/*
 *Set up template engine
 */
app.set('view engine', 'ejs');

/*
 *Set up Middlewares
 */
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(sessionMiddleware);
// middleware to check if user is authentificated
app.use((req, res, next) => {
  const idToken = req.session.idToken || '';
  if (
    req.path == '/login' ||
    req.path == '/fcmtoken' ||
    req.path == '/register' ||
    req.path == '/signup/user' ||
    req.path == '/sessionLogin' ||
    req.path == '/sessionLogin'
  ) {
    next();
    return 0;
  } else {
    admin.auth().verifyIdToken(idToken)
        .then((decodedIdToken) => {
          console.log(decodedIdToken.admin);
          // Check custom claims to confirm user is an admin.
          if (decodedIdToken.admin) {
            res.locals.admin = decodedIdToken;
            next();
            return 0;
          }
          res.status(401).send('UNAUTHORIZED REQUEST!');
        })
        .catch((error) => {
          // Session cookie is unavailable or invalid. Force user to login.
          res.redirect('/login');
        });
  }
});


/*
 *App listening on port 3000
 */
const server = app.listen('3000', '127.0.0.1', function(err) {
  if (err) console.log(JSON.stringify(err));
  else console.log('App is running fine');
});

// sharing the session with the server
const io = socket(server);
io.use(sharedsession(sessionMiddleware));

/*
 *fire controllers
 */
authentification(app, admin);
dashboard(app, admin);
reports(app, admin, server, io);
healthTips(app, admin);
firstAid(app, admin);
notification.init(app, admin);
