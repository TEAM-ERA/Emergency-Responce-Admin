const moment = require('moment');
const ejs = require('ejs');
const chat = require('./chat');
const notification = require('../../notification');

/**
 * Query Selected Report.
 * @param {socket} socket Socket.io.
 * @param {firebaseDb} firebaseDb firebase Cloud Firestore.
 * @param {moment} moment moment.js object.
 */
function queryUserReport(socket, firebaseDb, moment) {
  socket.on('queryUserReport', function(data) {
    console.log(data);
    // create one to one chat room
    chat.createChatRoom(firebaseDb, data);
    // firestore ref
    const ref = firebaseDb.collection('REPORTS');
    /**
     * Get the initial Message that will be sent to the reporter
     * @param {String} report report object
     * @return {Object} Returns the message object
     */
    const initialMessage = function(report) {
      return {
        adminID: data.adminID,
        reporterID: report.uid,
        msg: {
          sender: data.adminID,
          receiver: report.uid,
          body: 'Hello, ' + report.reporterName + ', Welcome to Emergency Response Assistance.\n Keep calm I am here to help you.',
        },
      };
    };
    // Get the report doc and send to client via socket
    ref.doc(data.reportID)
        .get()
        .then(function(doc) {
          // send an report doc to the client
          socket.emit('getUserReport', {
            doc: doc.data(),
            time: moment(doc.data().time.toDate()).calendar(),
            reportID: data.reportID,
          });
          // check if the report is not responded already
          if (!doc.data().isResponded) {
            // Update the report: Add the respondent field to the report doc
            ref.doc(data.reportID).update({isResponded: true, respondentID: data.adminID})
                .then(()=>{
                  // send an report status to the client
                  socket.emit('reportStatUpdated', {isResponded: true});
                  // send initial or default message to the Reporter
                  chat.sendMsg(firebaseDb, initialMessage(doc.data()));
                })
                .catch(function(err) {
                  // Handle error
                  console.log(err);
                });
          } else {
            // Report responeded; send an report status to the client
            socket.emit('reportStatUpdated', {isResponded: true});
          }
          // Get the chat messages if there is any
          chat.loadChat(socket, firebaseDb, data.adminID, doc.data().uid);
        });
  });
}

/**
 * Send realtime reports to clients.
 * @param {socket} socket Socket.io.
 * @param {firebaseDb} db firebase Cloud Firestore.
 * @param {moment} moment moment.js object.
 * @param {Firebase_Messaging} fcm moment.js object.
 */
function reportSnapshot(socket, db, moment, fcm) {
  socket.on('queryReports', function(data) {
    db.collection('REPORTS').orderBy('time', 'desc').onSnapshot(function(querySnapshot) {
      let num = 0;
      querySnapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          ejs.renderFile(
              './views/data/reportSnapshot.ejs',
              {querySnapshot: querySnapshot, moment: moment},
              function(err, str) {
                if (err) {
                  console.log(err);
                } else {
                  socket.emit('reportSnapshot', {
                    reportList: str,
                  });
                }
              },
          );
          if (!change.doc.data().isResponded) {
            try {
              ++num;
              const registrationToken= socket.handshake.session.fcmtoken;
              notification.push(fcm, {
                webpush: {
                  notification: {
                    title: 'New Emergency Report',
                    body: change.doc.data().emergency,
                    icon: change.doc.data().reporterImage,
                  },
                },
                data: {
                  num: num.toString(10),
                  case: change.doc.data().emergency,
                  time: moment(new Date(change.doc.data().time.toDate())).format('lll'),
                },
                token: registrationToken,
              });
            } catch (error) {
              console.log('Error sending message', error);
            }
          };
        }
      });
    });
  });
}

/**
 * Exported function the will will to execute all other modules.
 * @param {server} server The node server.
 * @param {firebase} firebase firebase Admin object.
 * @param {Socket} io Socket io.
 */
module.exports = function(server, firebase, io) {
  const db = firebase.firestore();
  const fcm = firebase.messaging();
  io.on('connection', function(socket) {
    queryUserReport(socket, db, moment);
    reportSnapshot(socket, db, moment, fcm);
    // when the client emits 'new message', this listens and executes
    socket.on('sendMsg', (data) => {
      chat.sendMsg(db, data);
    });
  });
};
