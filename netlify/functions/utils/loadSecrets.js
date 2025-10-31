import fs from "fs";
import os from "os";
import path from "path";

/**
 * Decode a Base64 JSON environment variable and write it to a temp file.
 * Works on both Windows (local) and Linux (Netlify cloud).
 * Returns the file path.
 */
function writeBase64ToFile(base64Env, filename) {
  const base64 = process.env[base64Env];
  if (!base64) throw new Error(`Missing ${base64Env} environment variable`);

  const json = Buffer.from(base64, "base64").toString("utf8");

  // Use OS temp directory for compatibility
  const tempDir = os.tmpdir();
  const filePath = path.join(tempDir, filename);

  fs.writeFileSync(filePath, json);

  // Optional: log where it was written (for debugging)
  console.log(`[loadSecrets] Wrote ${base64Env} to: ${filePath}`);

  return filePath;
}

/**
 * Decode all credentials and return their paths.
 */
export function loadAllServiceAccounts() {
  const sheetPath = writeBase64ToFile("SHEET_ACCOUNT_BASE64", "sheetAccount.json");
  const firebasePath = writeBase64ToFile("VITE_FIREBASE_BASE64", "firebaseConfig.json");
  const firestorePath = writeBase64ToFile("FIRESTORE_CREDENTIALS_BASE64", "firestoreServiceAccount.json");

  return { sheetPath, firebasePath, firestorePath };
}
