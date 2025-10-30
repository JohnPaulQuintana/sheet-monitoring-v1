import { useState } from "react";
import { doc, setDoc, getDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function AddSheetTab() {
  const [sheetUrl, setSheetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const uid = auth.currentUser?.uid;

  const showPopup = (message: string, type: "success" | "error" = "success") => {
    setPopup({ message, type });
    setTimeout(() => setPopup(null), 3000);
  };

  // Extract sheet ID from URL
  const extractSheetId = (url: string) => {
    try {
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  const handleAddSheet = async () => {
    if (!sheetUrl.trim()) return showPopup("Please enter a sheet URL.", "error");
    if (!uid) return showPopup("You must be logged in.", "error");

    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) return showPopup("Invalid Google Sheet URL.", "error");

    setLoading(true);

    try {
      const userDocRef = doc(db, "online_sheets", uid);

      // Create user doc if it doesn't exist
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, { sheet_ids: [] });
      }

      // Add sheet ID to the array
      await setDoc(userDocRef, { sheet_ids: arrayUnion(sheetId) }, { merge: true });

      showPopup(`Sheet added successfully!`);
      setSheetUrl("");
    } catch (err: any) {
      console.error("Error adding sheet ID:", err);
      showPopup("Failed to add sheet. Check console for details.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow relative">
      <h2 className="text-lg font-semibold text-green-700 mb-4">Add a New Sheet</h2>

      <input
        type="text"
        value={sheetUrl}
        onChange={(e) => setSheetUrl(e.target.value)}
        placeholder="Enter Google Sheet URL"
        className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-600"
      />

      <button
        onClick={handleAddSheet}
        disabled={loading}
        className={`w-full py-2 text-white rounded-md ${
          loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Adding..." : "Add Sheet"}
      </button>

      {/* Popup Notification */}
      {popup && (
        <div
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-md text-white ${
            popup.type === "success" ? "bg-green-600" : "bg-red-600"
          } transition-opacity duration-300`}
        >
          {popup.message}
        </div>
      )}
    </div>
  );
}
