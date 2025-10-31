// // netlify/functions/utils/firebaseAdmin.js
// import admin from "firebase-admin";

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert({
//       type: process.env.FIRESTORE_TYPE,
//       project_id: process.env.FIRESTORE_PROJECT_ID,
//       private_key_id: process.env.FIRESTORE_PRIVATE_KEY_ID,
//       private_key: process.env.FIRESTORE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//       client_email: process.env.FIRESTORE_CLIENT_EMAIL,
//       client_id: process.env.FIRESTORE_CLIENT_ID,
//       auth_uri: process.env.FIRESTORE_AUTH_URI,
//       token_uri: process.env.FIRESTORE_TOKEN_URI,
//       auth_provider_x509_cert_url: process.env.FIRESTORE_AUTH_PROVIDER_CERT_URL,
//       client_x509_cert_url: process.env.FIRESTORE_CLIENT_CERT_URL,
//     }),
//   });
// }

// export const firestore = admin.firestore();
// import admin from "firebase-admin";

// let serviceAccount;

// try {
//   if (!process.env.FIRESTORE_CREDENTIALS_BASE64) {
//     throw new Error("Missing FIRESTORE_CREDENTIALS_BASE64 environment variable");
//   }

//   serviceAccount = JSON.parse(
//     Buffer.from(process.env.FIRESTORE_CREDENTIALS_BASE64, "base64").toString("utf8")
//   );
// } catch (err) {
//   console.error("Failed to parse Firebase credentials:", err);
//   throw err;
// }

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

// export const firestore = admin.firestore();
import admin from "firebase-admin";
import fs from "fs";
import { loadAllServiceAccounts } from "./loadSecrets.js";

// Initialize Firestore Admin SDK using decoded credentials from helper
let serviceAccount;

try {
  // 🧩 Decode all Base64 envs and get their file paths
  const { firestorePath } = loadAllServiceAccounts();

  if (!fs.existsSync(firestorePath)) {
    throw new Error("Firestore credentials file not found at " + firestorePath);
  }

  // 🧠 Read parsed credentials
  const fileContents = fs.readFileSync(firestorePath, "utf8");
  serviceAccount = JSON.parse(fileContents);

  console.log("🔥 Firestore initialized using decoded FIRESTORE_CREDENTIALS_BASE64");
} catch (err) {
  console.error("❌ Failed to load Firestore credentials:", err);
  throw err;
}

// Initialize Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const firestore = admin.firestore();
