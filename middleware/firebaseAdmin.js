const admin = require('firebase-admin');
const serviceAccount = require('../resurrection-power-parish-firebase-adminsdk-fbsvc-7d3ce0a628.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
