import admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { loggerFactory } from 'visible_logger';
//For local devlopment
import dotenv from 'dotenv';

const logger = loggerFactory({ hideLogsDuringTest: true });

let key;

if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'dev') {
  dotenv.config();
  key = process.env.FIREBASE_PRIVATE_KEY;
} else {
  const { privateKey } = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);
  key = privateKey;
}

// Initialize Firebase admin
initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: key,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  }),
});
const db = admin.firestore();

// Use local emulator
//connectFirestoreEmulator(db, '127.0.0.1', 8080);

logger.info('Database initialized', 'Firestore');

export default db;
