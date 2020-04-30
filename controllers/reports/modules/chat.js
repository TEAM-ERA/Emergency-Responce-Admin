// const moment = require('moment');
// const ejs = require('ejs');
// const socket = require('socket.io');
const firebaseAdmin = require('firebase-admin');

/**
 * Generates the unique id for the one to one chat
 * @param {String} uid1 userid 1
 * @param {String} uid2 userid 2
 * @return {String} The unique chat ID.
 */
const getChatId = function(uid1, uid2) {
  const compareStrings = uid1.localeCompare(uid2);
  if (compareStrings < 0) {
    console.log( 'Admin First ', uid1.concat(uid2));
    return uid1.concat(uid2);
  } else {
    console.log('Client First ', uid2.concat(uid1));
    return uid2.concat(uid1);
  }
};


/**
 * Generates the unique id for the one to one chat
 * @param {Firestore} firebaseDB Firebase Firestore.
 * @param {Object} data Object that contains the .
 */
exports.createChatRoom = function(firebaseDB, data) {
  // get the chat id
  const chatId = getChatId(data.adminID, data.reporterID);
  console.log(data);
  firebaseDB.collection('chats').doc(chatId)
      .set({
        user: [data.adminID, data.reporterID],
      }, {merge: true})
      .then(function(doc) {
      });
};


/**
 * Generates the unique id for the one to one chat
 * @param {Firstore} firebaseDb Firebase Firstsore abject.
 * @param {Object} data Other data containing the message and the sender.
 */
exports.sendMsg = function(firebaseDb, data) {
  const chatId = getChatId(data.adminID, data.reporterID);
  firebaseDb.collection('chats').doc(chatId)
      .collection('messages').doc().set({
        from: data.msg.sender,
        to: data.msg.receiver,
        msg: data.msg.body,
        time: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      })
      .then(function() {
        firebaseDb.collection('chats').doc(chatId)
            .set({
              last_message: {
                from: data.msg.sender,
                msg: data.msg.body,
                time: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
              },
            }, {merge: true});
      });
};

/**
 * Load the chat history in the chat area
 * @param {Socket} socket The socket object from the socket.io.
 * @param {Firestore} db Firebase firestore.
 * @param {String} adminID Unique id for the one to one chat.
 * @param {String} reporterID Unique id for the one to one chat.
 */
exports.loadChat = function(socket, db, adminID, reporterID) {
  const chatId = getChatId(adminID, reporterID);
  db.collection('chats').doc(chatId)
      .collection('messages')
      .orderBy('time', 'asc')
      .onSnapshot(function(querySnapshot) {
        const msgs = [];
        querySnapshot.forEach((doc) => {
          msgs.push({
            from: doc.data().from,
            time: doc.data().time.toDate(),
            msg: doc.data().msg,
          });
        });
        socket.emit('loadChat', {
          msgs: msgs,
        });
      });
};

/**
 * Exported function the will will to execute all other modules.
 * @param {socket} socket The socket object from the socket.io.
 * @param {firestore} firebaseDB firebase firestore.
 * @param {Object} data  Extra data.
 */
exports.init = function(socket, firebaseDB, data) {
  // Create Chat room for communication
  createChatRoom(firebaseDB, data);

  // // when the client emits 'new message', this listens and executes
  // socket.on('createChatRoom', (data) => {

  // });
};
