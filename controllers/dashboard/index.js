const moment = require('moment');
const ejs = require('ejs');
module.exports = function(app, firebase) {
  const db = firebase.firestore();

  app.get('/', function(req, res) {
    res.render('index', {
      title: 'ERA | Dashboard',
      description: 'Emergency Response Assistance',
      moment: moment,
      greeting: greeting(),
    });
  });

  app.get('/recent-report', function(req, res) {
    db.collection('REPORTS')
        .orderBy('time', 'desc')
        .get()
        .then(function(querySnapshot) {
          ejs.renderFile('./views/data/recent-reports.ejs', {
            querySnapshot: querySnapshot,
            moment: moment,
          }, function(err, str) {
            if (err) {
              console.log(err);
            } else {
              res.send(str);
            }
          });
        })
        .catch(function(error) {
          res.send(error);
        });
  });

  app.get('/recent-tips', function(req, res) {
    db.collection('Tips')
        .orderBy('time', 'desc')
        .get()
        .then(function(querySnapshot) {
          ejs.renderFile('./views/data/recent-tips.ejs', {
            querySnapshot: querySnapshot,
            moment: moment,
          }, function(err, str) {
            if (err) {
              console.log(err);
            } else {
              res.send(str);
            }
          });
        })
        .catch(function(error) {
          res.send(error);
        });
  });

  app.get('/recent-emergencies', function(req, res) {
    db.collection('Emergency_Cases')
        .orderBy('time', 'desc')
        .get()
        .then(function(querySnapshot) {
          ejs.renderFile('./views/data/recent-emergencies.ejs', {
            querySnapshot: querySnapshot,
          }, function(err, str) {
            if (err) {
              console.log(err);
            } else {
              res.send(str);
            }
          });
        })
        .catch(function(error) {
          res.send(error);
        });
  });
};

/**
   * Get the hour of the day and greet
   * @return {Sting}  Greetings
   */
function greeting() {
  const now = new Date();
  const hour = now.getHours();
  if ((hour >= 4 && hour <= 11)) {
    return 'Good Morning';
  } else if ((hour >= 12 && hour <= 16)) {
    return 'Good Afternoon';
  } else if ((hour >= 17 && hour <= 20)) {
    return 'Good Evening';
  } else if ((hour >= 21 || hour <= 3)) {
    return 'Good Night';
  }
}
