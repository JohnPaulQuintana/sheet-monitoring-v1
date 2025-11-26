import axios from "axios";
import { auth } from "../firebase"; // your firebase auth context

const getUid = () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated");
  return uid;
};

export const fetchAllSheets = async () => {
  const uid = getUid();
  try {
    const res = await axios.get(`/.netlify/functions/getSheets?uid=${uid}`);
    return res.data.sheets || [];
  } catch (err: any) {
    console.error("Error fetching sheets:", err.message);
    throw err;
  }
};

/**
 * Fetch sheet history.
 * @param sheetId optional, fetch single sheet if provided
 */
export const fetchSheetHistory = async (sheetId?: string) => {
  const uid = getUid();
  try {
    let url = `/.netlify/functions/sheetReader?uid=${uid}`;
    if (sheetId) url += `&sheet_id=${sheetId}`;

    const res = await axios.get(url);

    // If sheetId is provided, return the single sheet object
    return sheetId ? res.data.spreadsheet : res.data.spreadsheets || [];
  } catch (err: any) {
    console.error("Error fetching sheet history:", err.message);
    throw err;
  }
};
