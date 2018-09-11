const admin = require('firebase-admin');
const functions = require('firebase-functions');
const app = require('actions-on-google').actionssdk();

admin.initializeApp(functions.config().firebase);
const db = admin.database();
const rootRef = db.ref();

const mainIntent = conv => {
  conv.ask(`Hi! Can you say something?
If you want to listen your saying before, You can ask to say 'last said'.
You can finish this conversation to say bye.`);
};

const subIntent = (conv, rawInput) => {
  const userId = conv.user.id || 'test';
  if (rawInput === 'bye') {
    return conv.close('Goodbye!');
  } else if (rawInput === 'last said') {
    return rootRef.once('value').then(snapshot => {
      const lastSaid = snapshot.child(userId).val();
      conv.ask(`You said, ${lastSaid}, before. Can you say something?`);
    });
  }
  return rootRef.set({ [userId]: rawInput }).then(() => {
    conv.ask(`You said, ${rawInput}. Can you say something?`);
  });
};

app.intent('actions.intent.MAIN', mainIntent);
app.intent('actions.intent.TEXT', subIntent);

exports.echoWithDB = functions.https.onRequest(app);
