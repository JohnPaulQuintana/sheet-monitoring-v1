// netlify/functions/sheetReader.js
import { google } from "googleapis";
import { firestore } from "./utils/firebaseAdmin.js";

export const handler = async (event) => {
  try {
    const uid = event.queryStringParameters?.uid;
    if (!uid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing uid parameter" }),
      };
    }

    

    // Fetch user sheet IDs from Firestore
    const userDoc = await firestore.collection("online_sheets").doc(uid).get();
    const sheetIds = userDoc.exists ? userDoc.data().sheet_ids || [] : [];

    if (!sheetIds.length) {
      return {
        statusCode: 200,
        body: JSON.stringify({ spreadsheets: [] }),
      };
    }

    // const { sheetPath } = loadAllServiceAccounts();
    // const sheetCredentials = JSON.parse(fs.readFileSync(sheetPath, "utf8"));
    const sheet_base64 = "ew0KICAiY2xpZW50X2VtYWlsIjogImJpLWF1dG9tYXRpb25AYmktYXV0b21hdGlvbi00NDI3MDYuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLA0KICAicHJpdmF0ZV9rZXkiOiAiLS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tXG5NSUlFdkFJQkFEQU5CZ2txaGtpRzl3MEJBUUVGQUFTQ0JLWXdnZ1NpQWdFQUFvSUJBUUNsUVB3M3FZeHNYSkppXG44NlVzRWE4QzZOUUZMcUtJUGNQQ0EybzNMVnpmTUlQcmJQbEU1eUk2cFdtSENrSmg1MXB6UlRqVlRnSncyMlZqXG5YRUFNMDlmUHJ1N0sraGw3NUlqTjAvWExCYi9qVGxIUkxLQXVRUWp1d1dVYTdNN2VWaHFQdlI3UDY4SWVSQkZzXG5UT2Z1elYva0Vpc05UaVNwTjB5UVdWbDFFelg1ekoyWm05YVRjZThRNzNKQ1VNTzJMT3ZqZzQwY3ZTVE93MmtFXG4vbkNMaVZXdHZCWkVXWEJ1b2kxOXVOTlZQd3pYUDBuYVRETkM5SGs2SnkybGJpVHhoM3VzWU0zdDFnZVEvSC9LXG5VUzdMSGdZV2I4TXZkMlgvbW9JaVVEdU9GR1hLaWhoUXJNM0toZ3hWamdBeU9CQkovT3cycldzTDAwZXVEVW1xXG52UEdHWHlYckFnTUJBQUVDZ2dFQVNwbUFnbHd1d1FnMUtTaFdDd1BjbnBLZWk4eFdvT3hJLzc5czVvVzY1Q0pSXG5teWl4aW5KUTJHcXRyY0ZxNENtQmdvSGdPeUtoSlhOVlhMcGJTNjhpUUdYMjlIaGNvcm96SzcrZ3VNcmFxZkZFXG5MQXBhTVNjNHNoZHAzZkxESEVtQWFoejAyT1hUMXJmaHFhTTZIR3BuL0Z4YlJRRmV1V2oyVGorWGk2dGxkV00zXG5ZZVQzTkdGNkVzYmp5cUgzM2pjRjl5ZnNnbnFhRzNDdkF1M0N3ZEI2bGxMSHlEOEZaWGgycGx0ZWEwRHhrZUJYXG5nais2aVBHRkhLVkRUbEttTEZndENTVGExNU1wendNeHlaQ2FsWVNxblBYbm1lc3RpRHV2bmtCT1RHVWJEV2orXG44dTRyNndNMzFPMnVUaTUzamhHaWlTRnUxbk5kZTdFMzZmeU1XazFkcVFLQmdRRG1wbDF4ekk4M3FBV2dzNXlJXG5CR2R0NkZsUWMrSG91Z0hRS2hzUGRvZTJYblNmc1B0L25qNmdSTTNGdUFzdU9tMVIzZGFiaG9lRHdYbVVUYXRKXG56bnJYN2ZlYmJhUE1Ka0ZKdzE0UHoxZmoyaXYyRFJpN2pmME8zNXhkbEVPOVpOYnh1cmQzbXhMY2Era01xUHpOXG42ZjdoamNkSS92eU1ZZTV1K0NHa0E4eFFuUUtCZ1FDM2FwNHkvalVMenk4U2ttSTNKQzdNUithckZneE5ESi9MXG5YL0tua0krYlFNeW9qaXNPSnZhMFA4TTNiL3pFd2tWeTRVM1hzWVcyK0JjK2lwMk1hV01KY0t4TEF0YjA0bS8xXG5GRjMrVE1nUDdjY0FuTmpEeldNaFRMQlpaWXEySWtIMUVLcDlQbGxyZGlwSXJLaXlUQjFjUW9pcHlGdGY0dDRiXG5aejVPUVdqMkp3S0JnRXB1YzRkT3lRVGY3dmorSFV4emgyRWJjdjhZZGxXZytRYlJINnhzeHJ6ZVhHcFFOY2pvXG5Lek9USUlobXJRejlBOXhBWjRvRzd1Smc1RGdzbkZNVUUrWnN2OVBqbk5FN295UUhyT29UTWp5d1lqRmo1cEJYXG44TXNFOURQcXJiV0h2aW1CNU1UdlFUWHFpT2x4K3lzRUVTRituRW45SjBpeUxieVh6RnRlY21ldEFvR0FPTGswXG5hN2pLVnZpZ0tqSXpSYkplOXJaVjFCdGhlb0tvK0pDWHp0S2FWdjFYVGRtSjN6cVZtWEVPd3BwVHBkWWUvRVJKXG5lcWRnSHhIaXZtaklDS0NmREZCWU9HcU1aL2VQZ0Uvb01iazFOaGZuTDMxU1hGdXNpS1BhOWdxOU4wNm83MDFVXG5MSitYci9BL2EzSmFTYW5ZZXF2bzcva1NxVGpVVDgxQ0s1bDNDSWtDZ1lBK2xteHV4UFU2RlBBejFzUDMxV1gvXG5qK2ZVbi90STZ1TktLWmhJb2NKTnUySE9kdENRRTFxYTFVRHRFUGVsZTBEZW5KdzJKOUVhNzBEVHArUGF3YVNwXG5oSXNWdHJNSEExVlIzNFlZcEdCZGlvWXpHcnJxaDhrdnpEV1h6UzhJVkViSVRFcXozWTFncFNtYVQ0amVVMk90XG4rUERQRDNMQmVMeFFsdkRRRXUwaVRRPT1cbi0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS1cbiINCn0NCg=="
    let sheetCredentials;
    try {
      sheetCredentials = JSON.parse(Buffer.from(sheet_base64, "base64").toString("utf8"));
    } catch (err) {
      console.error("Failed to parse Firebase credentials:", err);
      throw err;
    }

    const credentials = {
      client_email: sheetCredentials.client_email,
      private_key: sheetCredentials.private_key.replace(/\\n/g, "\n"),
    };

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets.readonly",
        "https://www.googleapis.com/auth/drive.metadata.readonly",
      ],
    });

    const sheetsApi = google.sheets({ version: "v4", auth });
    const drive = google.drive({ version: "v3", auth });

    const allSheetsData = [];

    for (const spreadsheetId of sheetIds) {
      const sheetInfo = await sheetsApi.spreadsheets.get({
        spreadsheetId,
        fields: "spreadsheetId,properties.title,sheets.properties",
      });

      const driveInfo = await drive.files.get({
        fileId: spreadsheetId,
        fields: "id,name,modifiedTime,lastModifyingUser(displayName,emailAddress)",
        supportsAllDrives: true,
      });

      const revisionsInfo = await drive.revisions.list({
        fileId: spreadsheetId,
        fields: "revisions(id, modifiedTime, lastModifyingUser(displayName,emailAddress))",
        supportsAllDrives: true,
      });

      const history = (revisionsInfo.data.revisions || [])
        .map((rev) => ({
          id: rev.id,
          modifiedTime: rev.modifiedTime,
          user: rev.lastModifyingUser?.displayName || "Unknown",
          email: rev.lastModifyingUser?.emailAddress || "Unknown",
        }))
        .sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime));

      const lastModifiedTime = driveInfo.data.modifiedTime;
      const wasUpdatedToday = (() => {
        if (!lastModifiedTime) return false;
        const modified = new Date(lastModifiedTime);
        const today = new Date();
        return (
          modified.getFullYear() === today.getFullYear() &&
          modified.getMonth() === today.getMonth() &&
          modified.getDate() === today.getDate()
        );
      })();

      const sheetsWithStatus = (sheetInfo.data.sheets || []).map((s) => ({
        ...s.properties,
        status: wasUpdatedToday ? "updated" : "not_updated",
        lastModifiedTime,
        lastModifiedBy:
          driveInfo.data.lastModifyingUser?.emailAddress || "Unknown",
      }));

      allSheetsData.push({
        spreadsheetId,
        title: sheetInfo.data.properties.title,
        sheets: sheetsWithStatus,
        lastModifiedBy: driveInfo.data.lastModifyingUser?.emailAddress || "Unknown",
        lastModifiedName: driveInfo.data.lastModifyingUser?.displayName || "Unknown",
        lastModifiedTime,
        history,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ spreadsheets: allSheetsData }),
    };
  } catch (error) {
    console.error("Sheet metadata error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
