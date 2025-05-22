const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  try {
    // Check if already initialized
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
      });
    }
    return admin;
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    throw error;
  }
};

// Initialize Firebase client SDK
const firebase = initializeFirebaseAdmin();
const db = firebase.firestore();
const auth = firebase.auth();

module.exports = {
  firebase,
  db,
  auth,
  admin
};