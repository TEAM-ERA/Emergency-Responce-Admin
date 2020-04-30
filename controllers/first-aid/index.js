const ejs = require('ejs');
const multer = require('multer');
const {Storage} = require('@google-cloud/storage');
const path = require('path');
const uuid = require('uuid-v4');

const storage = new Storage({
  projectId: 'dsc-uew-k-1b5d3',
  keyFilename: path.join(__dirname, '../../config/dsc-uew-k-1b5d3-firebase-adminsdk-h1osy-b8d2b9f3e9.json'),
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

module.exports = function(app, firebase) {
  const db = firebase.firestore();

  app.get('/first-aid', function(req, res) {
    res.render('first-aid', {
      title: 'ERA | Emergencies',
      description: 'First Aid tips',
    });
  });

  app.get('/first-aid-details', function(req, res) {
    db.collection('Emergency_Cases')
        .doc(req.query.id)
        .get()
        .then(function(querySnapshot) {
          db.collection('Emergency_Cases').doc(req.query.id).collection('steps')
              .orderBy('stepNum')
              .get()
              .then(function(steps) {
                let illustrationURL = 'defaultPic';
                if (querySnapshot.get('illustration')) {
                  illustrationURL = querySnapshot.data().illustration;
                }
                res.render('first-aid-details', {
                  title: 'ERA | First Aid',
                  description: 'First Aid tips',
                  doc: querySnapshot.data(),
                  id: querySnapshot.id,
                  illustration: illustrationURL,
                  steps: steps,
                  stepNum: 0,
                });
              })
              .catch((error) => {
                console.log(error);
              });
        });
  });

  app.get('/emergencies-data', function(req, res) {
    db.collection('Emergency_Cases')
        .orderBy('title')
        .get()
        .then(function(querySnapshot) {
          ejs.renderFile('./views/data/emergencies-data.ejs', {
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

  app.get('/add-first-aid', function(req, res) {
    res.render('add-first-aid', {
      title: 'ERA | Add First Aid',
      description: 'Post Emergency cases and first aid steps',
      post_state: 'Publishing...',
      post_status: 'Unpublished',
    });
  });

  app.get('/edit-first-aid', function(req, res) {
    db.collection('Emergency_Cases')
        .doc(req.query.id)
        .get()
        .then(function(querySnapshot) {
          db.collection('Emergency_Cases').doc(req.query.id).collection('steps')
              .orderBy('stepNum')
              .get()
              .then(function(steps) {
                let illustrationURL = 'defaultPic'; let iconURL = 'defaulIcon';
                if (querySnapshot.get('illustration')) {
                  illustrationURL = querySnapshot.data().illustration;
                }
                if (querySnapshot.get('icon')) {
                  iconURL = querySnapshot.data().illustration;
                }
                res.render('edit-first-aid', {
                  title: 'ERA | Edit First Aid',
                  description: 'First Aid tips',
                  post_state: 'Editing...',
                  post_status: 'Published',
                  doc: querySnapshot.data(),
                  id: querySnapshot.id,
                  illustration: illustrationURL,
                  icon: iconURL,
                  steps: steps,
                  stepNum: 0,
                });
              })
              .catch((error) => {
                console.log(error);
              });
        });
  });

  app.post('/publish-emergencies-case', upload.any(), function(req, res) {
    let ref; let emid;
    if (req.body.id) {
      emid = req.body.id;
      ref = db.collection('Emergency_Cases').doc(emid);
    } else {
      emid = req.body.title + Date.now();
      ref = db.collection('Emergency_Cases').doc(emid);
    }
    ref.set({
      title: req.body.title,
      authorId: req.body.authorId,
      time: firebase.firestore.FieldValue.serverTimestamp(),
    }, {merge: true})
        .then(function(response) {
          uploadSteps(ref.collection('steps'), req.body.steps);
        })
        .then(function(response) {
          uploadFiles(req.files, 'EmergencyCases/' + emid, ref);
          return 'Successful';
        })
        .then(function(response) {
          res.type('text/plain; charset=utf-8');
          res.send({successful: response});
        })
        .catch(function(error) {
          res.type('text/plain; charset=utf-8');
          res.send(error);
        });
  });

  app.delete('/emergencies', function(req, res) {
    const ref = db.collection('Emergency_Cases').doc(req.query.id);
    ref.collection('steps')
        .get()
        .then(function(steps) {
          steps.forEach((step) => {
            ref.collection('steps').doc(step.id).delete();
          });
        })
        .then(function() {
          ref.delete().then(function() {
            deleteFiles('EmergencyCases/' + req.query.id + '/')
                .then(function() {
                  console.log('Files delete');
                  res.send('Tip successfully deleted!');
                })
                .catch(console.error);
          }).catch(function(error) {
            console.error('Error removing document: ', error);
            res.send('Deletion unsuccessfully!');
          });
        })
        .catch((error) => {
          console.log(error);
        });
  });
};

/**
 * Abstract function - Upload the image file to Google Storage
 * @param {Array} files Array of the file objects
 * @param {String} path path to upload the file
 * @param {String} reference firebase firestore ducument reference
 * @return {Number} return 0 or null
 */
const uploadFiles = function( files, path, reference) {
  const urls = {};
  if (files) {
    if (Array.isArray(files)) {
      files.forEach((file) => {
        uploadImageToStorage(file, path).then((url) => {
          urls[file.fieldname] = url;
          reference.set(urls, {merge: true});
        }).catch((error) => {
        });
      });
    } else {
      return 0;
    }
  } else {
    return 0;
  }
};

/**
 * Inner function that actually upload the image file to Google Storage
 * @param {File} file object that will be uploaded to Google Storage
 * @param {String} reference string that will determin the path to upload the file
 * @return {Promise} A promises with the uri string of the file
 */
const uploadImageToStorage = (file, reference) => {
  return new Promise((resolve, reject) => {
    // get the uuid
    const uuidToken = uuid();
    // reject if file is empty or no file is selected
    if (!file) {
      const error = 'No image file';
      console.log(error);
      reject(error);
    }
    // Get storage bucket
    const bucket = storage.bucket('dsc-uew-k-1b5d3.appspot.com');
    const newFileName = reference + '/' + file.originalname;

    const fileUpload = bucket.file(newFileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      public: true,
    });

    blobStream.on('error', (error) => {
      console.log(error);
      reject(error);
    });

    blobStream.on('finish', (e) => {
      // The public URL can be used to directly access the file via HTTP.
      const url = 'https://firebasestorage.googleapis.com/v0/b/' + bucket.name + '/o/' + encodeURIComponent(fileUpload.name) + '?alt=media&token=' + uuidToken;
      resolve(url);
    });
    blobStream.end(file.buffer);
  });
};

/**
 * Upload the first aid steps to the firestore
 * @param {String} reference firebase firestore ducument reference
 * @param {String} steps JSON string
 */
const uploadSteps = function(reference, steps) {
  const stepsArray = JSON.parse(steps);
  stepsArray.forEach((element) => {
    reference.doc('step_number_' + element.stepNum).set({
      stepNum: element.stepNum,
      description: element.description,
    }, {merge: true});
  });
};

/**
 *
 * @param {String} path reference to the file
 * @return {Promise} A promises with the uri string of the file
 */
async function deleteFiles(path) {
  // Deletes the file from the bucket
  const bucket = storage.bucket('dsc-uew-k-1b5d3.appspot.com');
  return bucket.deleteFiles({prefix: path});
}
