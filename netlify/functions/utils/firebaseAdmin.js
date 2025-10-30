// netlify/functions/utils/firebaseAdmin.js
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: process.env.FIRESTORE_TYPE,
      project_id: process.env.FIRESTORE_PROJECT_ID,
      private_key_id: process.env.FIRESTORE_PRIVATE_KEY_ID,
      private_key: process.env.FIRESTORE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FIRESTORE_CLIENT_EMAIL,
      client_id: process.env.FIRESTORE_CLIENT_ID,
      auth_uri: process.env.FIRESTORE_AUTH_URI,
      token_uri: process.env.FIRESTORE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIRESTORE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FIRESTORE_CLIENT_CERT_URL,
    }),
  });
}

export const firestore = admin.firestore();
