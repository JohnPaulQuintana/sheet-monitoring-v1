import axios from "axios";
import { auth } from "../firebase"; // your firebase auth context

export const fetchSheetHistory = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated");

  const res = await axios.get(`/.netlify/functions/sheetReader?uid=${uid}`);
  return res.data;
};
