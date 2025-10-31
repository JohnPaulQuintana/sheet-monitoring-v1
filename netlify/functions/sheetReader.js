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

    // 🔐 Decode Base64 credentials
    const decodedCredentials = JSON.parse(
      Buffer.from(process.env.SHEET_ACCOUNT_BASE64, "base64").toString("utf8")
    );

    const credentials = {
      client_email: decodedCredentials.client_email,
      private_key: decodedCredentials.private_key.replace(/\\n/g, "\n"),
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
