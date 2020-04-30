const ejs = require('ejs');
const moment = require('moment');

module.exports = function(app, firebase) {
  const db = firebase.firestore();

  app.get('/health-tips', function(req, res) {
    res.render('health-tips', {
      title: 'Health Tip',
      description: 'List Posted health tips',
    });
  });

  app.get('/health-tips-data', function(req, res) {
    db.collection('Tips')
        .orderBy('time', 'desc')
        .get()
        .then(function(querySnapshot) {
          ejs.renderFile('./views/data/health-tips-data.ejs', {
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

  app.get('/add-health-tip', function(req, res) {
    res.render('add-health-tip', {
      title: 'Add Health Tip',
      description: 'Post health tips',
      post_state: 'Publishing...',
      post_status: 'Unpublished',
    });
  });

  app.get('/edit-health-tip', function(req, res) {
    db.collection('Tips')
        .doc(req.query.id)
        .get()
        .then(function(querySnapshot) {
          res.render('edit-health-tip', {
            title: 'Edit Health Tip',
            description: 'Post health tips',
            post_state: 'Editing...',
            post_status: 'Published',
            tip: querySnapshot.data(),
            tipId: querySnapshot.id,
            moment: moment,
          });
        });
  });

  app.delete('/health-tip', function(req, res) {
    db.collection('Tips').doc(req.query.id).delete().then(function() {
      res.send('Tip successfully deleted!');
    }).catch(function(error) {
      console.error('Error removing document: ', error);
      res.send('Deletion unsuccessfully!');
    });
  });

  app.post('/publish-health-tip', function(req, res) {
    let ref;
    if (req.body.tipId) {
      ref = db.collection('Tips').doc(req.body.tipId);
    } else {
      ref = db.collection('Tips').doc();
    }
    ref.set({
      title: req.body.tips_topic,
      description: req.body.tips_desc,
      authorId: req.body.authorId,
      author: req.body.author_name,
      time: firebase.firestore.FieldValue.serverTimestamp(),
    }, {merge: true})
        .then(function(response) {
          res.type('text/plain; charset=utf-8');
          res.send('Successful');
        })
        .catch(function(error) {
          console.log(error);
          res.send(error);
        });
  });
};
