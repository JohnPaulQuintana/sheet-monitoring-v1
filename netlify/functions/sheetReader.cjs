// netlify/functions/sheetReader.js
const { google } = require("googleapis");
const admin = require("firebase-admin");
const pLimit = require("p-limit").default; // add concurrency control

const FIREBASE_BASE64 = "ew0KICAidHlwZSI6ICJzZXJ2aWNlX2FjY291bnQiLA0KICAicHJvamVjdF9pZCI6ICJiai1hbGVydCIsDQogICJwcml2YXRlX2tleV9pZCI6ICIzNGU2MGE2N2E5NmJkZTE0MGJmMDliZDUzN2MwNDJjM2EwNmMwNWU5IiwNCiAgInByaXZhdGVfa2V5IjogIi0tLS0tQkVHSU4gUFJJVkFURSBLRVktLS0tLVxuTUlJRXZ3SUJBREFOQmdrcWhraUc5dzBCQVFFRkFBU0NCS2t3Z2dTbEFnRUFBb0lCQVFDMFpFYUJmUVM3TUlFNVxud21wUDlHQXRUQnRXOUVhcmhwYWdJV0puSXMzd1dsa28yaXM3U0FEdjFPRmtLS0FyU2V6cEJZWktyQVdvRzFvZFxuQ0J6eHorTm8xczNWdjBhYVVZNGtpazJaVDR1a0ZwTTZ3VU5KNmkySnM2OVdNNDZrVWFKYVVwQzFHQ1FLdUtlN1xuNTk1YjBKby9rVGN2c0VVOWR4N05GcUJWQnRzNWcwR3FGMjRkczFFcFVzL3NwNHdiR2xHaWQvcHlHR1Ywd254M1xuN2FXSEpBbTdLclB0Zjk1K01SeTBxdGpaTGMvUjB6MW82TkVSQkYzTWs5Ykk5RUoxOUdQeE41NmM2MWRCTytGbVxuVjVLb3Q4UXN2MHlHdlpSbkxSTHlzQisraDhzSzQ2ZHFZZ09DY1orSVZmMVRvYWgzSVVjcnQ0Wk4wTDZocHFBUlxudWRIN1pxOTNBZ01CQUFFQ2dnRUFPTXJ0SzYxSmhRbURWY1R3cFpXQmhpRlU1aTVuNVc2dEUyTVBVUHN6TFAyMFxuM2xpNWphTmdzQ0VzaU5VRmdEdDQrL0FDVkpZTi9kd0dwZWM4L2FCK3J5NFpoYmIvcW13TXZWSlJsZmZtTmRYcFxucW5EWUYzaER0L3U3TXY5dVpDdFRXdTV0b3FZa0NzQVNCdVc4S3RubEJpaFk0SW0xY3VHQzcveTBvN0JSNnF2eFxuN0Zoem0xZ082c29TZU50aUg1N3lSLzVEcnJ5RHRPQkpkRFdRS2hWNEQvM3d3azBEdS9qUCtnbTJvSW5qMzlLVlxuc0hQWXZOdmV1bExEMndxWVNvMHJLNFN0RUpPREg3eWl3eWVzZEFOV3FlRjJtak1YMkdjbG1iV3FOZU9FTWxZZVxuR0NHN0tuOGgvZ2pPSmVNRStJbDVXNzRydC85Wjk3TEE2d0kzUmhtZ0NRS0JnUURkU2ZpVFlCNzdZSk5PK0d4alxuM29BUGtSNW9TaGxDYVlZY1NlS0xScGNySGNhZFI3amUzWnZVZ1hFMjJSZitLaGdpdlc3UkJqMGZINmVpTXR6MVxuL1FieG1hTzhkdDZWNjM2c2QvTkhhRFp4cEYrYVpxUVBiNkhDY0U0ZnUxMCs5eHZtR1pGdWsxcjcvT0hHSk5VaVxucG1XcG9Zckl2NVdJRTcxN0xTRVoyRDBEOVFLQmdRRFFzQXN6cmIxTkFHNmtYWWlnNzFxU2xGMUNpZHp2MVlaUlxudE85M2dvWkVYN09vM1YxcGN3cWhpTm9RUDZFSlI5M0d1TFZoRWljeUY1SGRsckdCU2RrMnVwY0Q1TFN0OEcrM1xuaUh3eC9welBBQWRBSVplam5vakZYUFdHSU9YQ2owRUJwUHoxZ25WdjRPNHdoaDZXSDhNTWRWbEc1d1JpdVVjWVxuMWdRczdHWHVPd0tCZ1FDOENJYjRjOHpmdllodXFoa3dJM2lkd2FvYzVCbmluTmdnWVlmbTRPekM3bUkrY3h0Y1xuQk9MTkI5Q3owblRZdTl3V2FQRXBIQ3dEcmxvN01RMGcyUWgxY3gvMm5PczJhUTBTY0RxQWlzVDRlN3ZnN3lhcFxuRnlwVWxpbE1QV0ZXaDVObFNvU1JlUlR1MmtyZW01MmYrOVNXOTNWK2I0MFlPKzNlSk5ManF5THRvUUtCZ1FES1xub21YK0pER3YxeitYOGdwODJtMUQ3elF2SzlhUU92RlYzUzY1Q05CL0M3NVR0YjdDYWFaays1RmlQYWFNY0cvMFxuU2Q0MUIzOXZzRnMrb3RoeEJkZ1l3RTFxeG1SNmtRQ3BZYW5Xa2JpSmR5bVRLQXNxSVFJRlFpSlZ2eFBhTzJlUFxueFRpcTI2WlVvRUFvZGRLMVN0b0YrdHhaY0hCZHZESkE5MjdPZ0N6cGlRS0JnUURHUEJhTXQ1RnJtcUVXMHNNclxuc1NueEN4VklCRUQxbjZPMU9uVlM3UENTc05uZTg1YjlqVzhDNS82Um1qVTY0U3g2RG5weW9pYi9TVzRBSEx4VFxuR29jbFdXK2lxUWpIV1ZVc2VVVzNSaFRMcWZpcnFkWitZb3Y3cjdNZG5LYWdhTTE3YkRaQ0pSTHczLzlYaURDb1xuS05TT25TNjBFZnQ0N05QS2M4T21BbWJRVXc9PVxuLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLVxuIiwNCiAgImNsaWVudF9lbWFpbCI6ICJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0Biai1hbGVydC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsDQogICJjbGllbnRfaWQiOiAiMTA0MTE3MzE5NzA0MjQwMzQ1MjQ3IiwNCiAgImF1dGhfdXJpIjogImh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbS9vL29hdXRoMi9hdXRoIiwNCiAgInRva2VuX3VyaSI6ICJodHRwczovL29hdXRoMi5nb29nbGVhcGlzLmNvbS90b2tlbiIsDQogICJhdXRoX3Byb3ZpZGVyX3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwNCiAgImNsaWVudF94NTA5X2NlcnRfdXJsIjogImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL3JvYm90L3YxL21ldGFkYXRhL3g1MDkvZmlyZWJhc2UtYWRtaW5zZGstZmJzdmMlNDBiai1hbGVydC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSINCn0NCg==";
const SHEET_BASE64 = "ew0KICAiY2xpZW50X2VtYWlsIjogImJpLWF1dG9tYXRpb25AYmktYXV0b21hdGlvbi00NDI3MDYuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLA0KICAicHJpdmF0ZV9rZXkiOiAiLS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tXG5NSUlFdkFJQkFEQU5CZ2txaGtpRzl3MEJBUUVGQUFTQ0JLWXdnZ1NpQWdFQUFvSUJBUUNsUVB3M3FZeHNYSkppXG44NlVzRWE4QzZOUUZMcUtJUGNQQ0EybzNMVnpmTUlQcmJQbEU1eUk2cFdtSENrSmg1MXB6UlRqVlRnSncyMlZqXG5YRUFNMDlmUHJ1N0sraGw3NUlqTjAvWExCYi9qVGxIUkxLQXVRUWp1d1dVYTdNN2VWaHFQdlI3UDY4SWVSQkZzXG5UT2Z1elYva0Vpc05UaVNwTjB5UVdWbDFFelg1ekoyWm05YVRjZThRNzNKQ1VNTzJMT3ZqZzQwY3ZTVE93MmtFXG4vbkNMaVZXdHZCWkVXWEJ1b2kxOXVOTlZQd3pYUDBuYVRETkM5SGs2SnkybGJpVHhoM3VzWU0zdDFnZVEvSC9LXG5VUzdMSGdZV2I4TXZkMlgvbW9JaVVEdU9GR1hLaWhoUXJNM0toZ3hWamdBeU9CQkovT3cycldzTDAwZXVEVW1xXG52UEdHWHlYckFnTUJBQUVDZ2dFQVNwbUFnbHd1d1FnMUtTaFdDd1BjbnBLZWk4eFdvT3hJLzc5czVvVzY1Q0pSXG5teWl4aW5KUTJHcXRyY0ZxNENtQmdvSGdPeUtoSlhOVlhMcGJTNjhpUUdYMjlIaGNvcm96SzcrZ3VNcmFxZkZFXG5MQXBhTVNjNHNoZHAzZkxESEVtQWFoejAyT1hUMXJmaHFhTTZIR3BuL0Z4YlJRRmV1V2oyVGorWGk2dGxkV00zXG5ZZVQzTkdGNkVzYmp5cUgzM2pjRjl5ZnNnbnFhRzNDdkF1M0N3ZEI2bGxMSHlEOEZaWGgycGx0ZWEwRHhrZUJYXG5nais2aVBHRkhLVkRUbEttTEZndENTVGExNU1wendNeHlaQ2FsWVNxblBYbm1lc3RpRHV2bmtCT1RHVWJEV2orXG44dTRyNndNMzFPMnVUaTUzamhHaWlTRnUxbk5kZTdFMzZmeU1XazFkcVFLQmdRRG1wbDF4ekk4M3FBV2dzNXlJXG5CR2R0NkZsUWMrSG91Z0hRS2hzUGRvZTJYblNmc1B0L25qNmdSTTNGdUFzdU9tMVIzZGFiaG9lRHdYbVVUYXRKXG56bnJYN2ZlYmJhUE1Ka0ZKdzE0UHoxZmoyaXYyRFJpN2pmME8zNXhkbEVPOVpOYnh1cmQzbXhMY2Era01xUHpOXG42ZjdoamNkSS92eU1ZZTV1K0NHa0E4eFFuUUtCZ1FDM2FwNHkvalVMenk4U2ttSTNKQzdNUithckZneE5ESi9MXG5YL0tua0krYlFNeW9qaXNPSnZhMFA4TTNiL3pFd2tWeTRVM1hzWVcyK0JjK2lwMk1hV01KY0t4TEF0YjA0bS8xXG5GRjMrVE1nUDdjY0FuTmpEeldNaFRMQlpaWXEySWtIMUVLcDlQbGxyZGlwSXJLaXlUQjFjUW9pcHlGdGY0dDRiXG5aejVPUVdqMkp3S0JnRXB1YzRkT3lRVGY3dmorSFV4emgyRWJjdjhZZGxXZytRYlJINnhzeHJ6ZVhHcFFOY2pvXG5Lek9USUlobXJRejlBOXhBWjRvRzd1Smc1RGdzbkZNVUUrWnN2OVBqbk5FN295UUhyT29UTWp5d1lqRmo1cEJYXG44TXNFOURQcXJiV0h2aW1CNU1UdlFUWHFpT2x4K3lzRUVTRituRW45SjBpeUxieVh6RnRlY21ldEFvR0FPTGswXG5hN2pLVnZpZ0tqSXpSYkplOXJaVjFCdGhlb0tvK0pDWHp0S2FWdjFYVGRtSjN6cVZtWEVPd3BwVHBkWWUvRVJKXG5lcWRnSHhIaXZtaklDS0NmREZCWU9HcU1aL2VQZ0Uvb01iazFOaGZuTDMxU1hGdXNpS1BhOWdxOU4wNm83MDFVXG5MSitYci9BL2EzSmFTYW5ZZXF2bzcva1NxVGpVVDgxQ0s1bDNDSWtDZ1lBK2xteHV4UFU2RlBBejFzUDMxV1gvXG5qK2ZVbi90STZ1TktLWmhJb2NKTnUySE9kdENRRTFxYTFVRHRFUGVsZTBEZW5KdzJKOUVhNzBEVHArUGF3YVNwXG5oSXNWdHJNSEExVlIzNFlZcEdCZGlvWXpHcnJxaDhrdnpEV1h6UzhJVkViSVRFcXozWTFncFNtYVQ0amVVMk90XG4rUERQRDNMQmVMeFFsdkRRRXUwaVRRPT1cbi0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS1cbiINCn0NCg==";

/* -------------------- FIREBASE INIT (cached) -------------------- */
let serviceAccount;
try {
  serviceAccount = JSON.parse(Buffer.from(FIREBASE_BASE64 || "", "base64").toString("utf8"));
} catch (err) {
  console.error("Failed to parse Firebase credentials:", err);
  throw err;
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const firestore = admin.firestore();

/* -------------------- GOOGLE AUTH (cached) -------------------- */
let googleAuth, sheetsApi, driveApi;

function initGoogleClients() {
  if (!googleAuth) {
    try {
      const sheetCredentials = JSON.parse(Buffer.from(SHEET_BASE64 || "", "base64").toString("utf8"));

      googleAuth = new google.auth.GoogleAuth({
        credentials: {
          client_email: sheetCredentials.client_email,
          private_key: sheetCredentials.private_key.replace(/\\n/g, "\n"),
        },
        scopes: [
          "https://www.googleapis.com/auth/spreadsheets.readonly",
          "https://www.googleapis.com/auth/drive.metadata.readonly",
        ],
      });

      sheetsApi = google.sheets({ version: "v4", auth: googleAuth });
      driveApi = google.drive({ version: "v3", auth: googleAuth });
    } catch (err) {
      console.error("Failed to initialize Google clients:", err);
      throw err;
    }
  }
}

/* -------------------- ⚙️ MAIN HANDLER -------------------- */
exports.handler = async function (event) {
  console.time("sheetReader");
  initGoogleClients();

  try {
    const uid = event.queryStringParameters?.uid;
    if (!uid) return { statusCode: 400, body: JSON.stringify({ error: "Missing uid" }) };

    const userDoc = await firestore.collection("online_sheets").doc(uid).get();
    const sheetIds = userDoc.exists ? userDoc.data().sheet_ids || [] : [];
    if (!sheetIds.length)
      return { statusCode: 200, body: JSON.stringify({ spreadsheets: [] }) };

    /* -------------------- 🧠 Dynamic Concurrency -------------------- */
    let concurrency = 5;
    if (sheetIds.length > 50) concurrency = 3;
    else if (sheetIds.length > 20) concurrency = 4;
    const limit = pLimit(concurrency);
    console.log(`⚙️ Running with concurrency = ${concurrency}`);

    async function processSheet(spreadsheetId) {
      const [sheetInfo, driveInfo, revisionsInfo] = await Promise.all([
        sheetsApi.spreadsheets.get({
          spreadsheetId,
          fields: "spreadsheetId,properties.title,sheets.properties",
        }),
        driveApi.files.get({
          fileId: spreadsheetId,
          fields: "id,name,modifiedTime,lastModifyingUser(displayName,emailAddress)",
          supportsAllDrives: true,
        }),
        driveApi.revisions.list({
          fileId: spreadsheetId,
          fields:
            "revisions(id,modifiedTime,lastModifyingUser(displayName,emailAddress))",
          supportsAllDrives: true,
        }),
      ]);

      const history = (revisionsInfo.data.revisions || [])
        .map((rev) => ({
          id: rev.id,
          modifiedTime: rev.modifiedTime,
          user: rev.lastModifyingUser?.displayName || "Unknown",
          email: rev.lastModifyingUser?.emailAddress || "Unknown",
        }))
        .sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime));

      const lastModifiedTime = driveInfo.data.modifiedTime;
      const today = new Date();
      const wasUpdatedToday =
        lastModifiedTime &&
        new Date(lastModifiedTime).toDateString() === today.toDateString();

      const sheetsWithStatus = (sheetInfo.data.sheets || []).map((s) => ({
        ...s.properties,
        status: wasUpdatedToday ? "updated" : "not_updated",
        lastModifiedTime,
        lastModifiedBy:
          driveInfo.data.lastModifyingUser?.emailAddress || "Unknown",
      }));

      return {
        spreadsheetId,
        title: sheetInfo.data.properties.title,
        sheets: sheetsWithStatus,
        lastModifiedBy:
          driveInfo.data.lastModifyingUser?.emailAddress || "Unknown",
        lastModifiedName:
          driveInfo.data.lastModifyingUser?.displayName || "Unknown",
        lastModifiedTime,
        history,
      };
    }

    /* -------------------- 🧩 Run in Controlled Parallel -------------------- */
    const results = await Promise.allSettled(
      sheetIds.map((id) => limit(() => processSheet(id)))
    );

    const allSheetsData = results
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r) => r.value);

    console.timeEnd("sheetReader");
    return { statusCode: 200, body: JSON.stringify({ spreadsheets: allSheetsData }) };
  } catch (err) {
    console.error("❌ SheetReader Error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};