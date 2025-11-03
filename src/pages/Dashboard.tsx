import { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import SheetHistory from "../components/SheetHistory";
import AddSheetTab from "../components/AddSheetTab";
import { fetchSheetHistory } from "../services/api";
import {
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // your firebase config
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import UserAccordion from "../components/UserAccordion";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [sheets, setSheets] = useState<any[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("data-processor");
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Record<string, any>>({});

  const scrollRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);

  // Fetch User
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setProfile(userDoc.data());
      } else {
        console.warn("No user profile found in Firestore for UID:", user.uid);
      }
    };

    fetchUserProfile();
  }, [user]);

  // 🧭 Load sheets for authenticated user
  useEffect(() => {
    const loadSheets = async () => {
      if (!user) return;

      try {
        const data = await fetchSheetHistory();
        setSheets(data.spreadsheets || []);
      } catch (err: any) {
        console.error("Error fetching sheets:", err);
        setError(err.message || "Failed to fetch sheets");
      } finally {
        setLoading(false);
      }
    };
    loadSheets();
  }, [user]);

  // 🕒 Auto-refresh every 60s
  useEffect(() => {
    const fetchAndUpdate = async () => {
      try {
        console.log("Sending request for new updates....");
        const data = await fetchSheetHistory();
        const newSheets = data.spreadsheets || [];

        const changed = JSON.stringify(newSheets) !== JSON.stringify(sheets);
        if (changed) {
          console.log("🔄 Detected sheet updates, refreshing UI");
          setSheets(newSheets);

          if (selectedSheet) {
            const updatedSheet = newSheets.find(
              (s: any) => s.spreadsheetId === selectedSheet.spreadsheetId
            );
            if (updatedSheet) {
              setSelectedSheet(updatedSheet);
              setHistory(updatedSheet.history || []);
            }
          }
        }
      } catch (err) {
        console.warn("Auto-refresh failed:", err);
      }
    };

    // 🟢 Run immediately once
    fetchAndUpdate();

    // 🕒 Then every 5 minutes
    const interval = setInterval(fetchAndUpdate, 300000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []); // 👈 Run only once on mount

  // ⚡ Select a sheet and load history
  const handleSelectSheet = (sheet: any) => {
    setSelectedSheet(sheet);
    setSidebarOpen(false);
    setHistory(sheet?.history || []);
  };

  // 🧩 Get active users from sheet histories (filtered by edit count + recent activity)
  const users = useMemo(() => {
    const userStats: Record<string, { count: number; lastEdit: number }> = {};

    // 1️⃣ Aggregate user edit counts and latest edit date
    sheets.forEach((sheet) => {
      sheet.history?.forEach((h: any) => {
        console.log(h);
        if (!h.user || !h.modifiedTime) return;

        const user = h.user.trim();
        const editTime = new Date(h.modifiedTime).getTime();

        if (!userStats[user]) {
          userStats[user] = { count: 1, lastEdit: editTime };
        } else {
          userStats[user].count += 1;
          if (editTime > userStats[user].lastEdit) {
            userStats[user].lastEdit = editTime;
          }
        }
      });
    });

    // 2️⃣ Define thresholds
    const MIN_EDITS = 5; // minimum number of edits to be considered "active"
    const MAX_DAYS_INACTIVE = 30; // if last edit older than 30 days, skip

    const now = Date.now();

    // 3️⃣ Filter users based on thresholds
    const filteredUsers = Object.keys(userStats).filter((user) => {
      const { count, lastEdit } = userStats[user];
      const daysSinceEdit = (now - lastEdit) / (1000 * 60 * 60 * 24);
      return count > MIN_EDITS && daysSinceEdit <= MAX_DAYS_INACTIVE;
    });

    // 4️⃣ Sort by most recent activity first
    filteredUsers.sort((a, b) => userStats[b].lastEdit - userStats[a].lastEdit);

    return filteredUsers;
  }, [sheets]);

  // 🎯 Filter sheets by selected user
  const filteredSheets = useMemo(() => {
    if (!activeUser) return sheets;
    return sheets.filter((sheet) =>
      sheet.history?.some((h: any) => h.user === activeUser)
    );
  }, [activeUser, sheets]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("✅ User logged out successfully");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  // ✅ Loading State
  if (loading)
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <Loader2 size={64} className="text-green-600" />
        </motion.div>
        <p className="text-lg font-semibold text-gray-700 animate-pulse">
          Loading sheets...
        </p>
      </div>
    );

  // ✅ Error State
  if (error)
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <AlertCircle size={64} className="text-red-600 mb-4" />
        <p className="text-lg font-semibold text-red-700">
          Error loading sheets
        </p>
        <p className="text-sm text-red-500 mt-1">{error}</p>
      </div>
    );

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar (fixed for lg, overlay for mobile) */}
      <div className="flex-shrink-0">
        <Sidebar
          sheets={filteredSheets}
          selected={selectedSheet}
          onSelect={handleSelectSheet}
          onLogout={handleLogout}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Section */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          user={profile}
          title={selectedSheet ? selectedSheet.title : "Dashboard"}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* 🧭 Responsive User Tabs (Scrollable + Adaptive Layout) */}
        {/* {users.length > 0 && (
          <div className="relative flex items-center bg-white border-b border-gray-200">
            
            <button
              onClick={() =>
                scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })
              }
              className="absolute left-1 z-10 p-1 rounded-md bg-green-500 shadow-sm hover:bg-green-600 text-white transition flex"
            >
              <ChevronLeft size={18} />
            </button>

            
            <div
              ref={scrollRef}
              className="
                flex items-center gap-2 px-10 md:px-10 py-2 border
                overflow-x-auto scroll-smooth no-scrollbar w-full
                sm:px-6 sm:py-2
              "
            >
              <button
                onClick={() => setActiveUser(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border flex-shrink-0 transition
                ${
                  activeUser === null
                    ? "bg-green-600 text-white border-green-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }
              `}
              >
                All
              </button>

              {users.map((user) => (
                <button
                  key={user}
                  onClick={() => {
                    setActiveUser(user);
                    // Open sidebar only on mobile (less than md)
                    if (window.innerWidth < 768) {
                      setSidebarOpen(true);
                    }
                  }}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-full text-sm font-medium border flex-shrink-0 transition
                    ${
                      activeUser === user
                        ? "bg-green-600 text-white border-green-600"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <User size={14} />
                  <span className="truncate max-w-[120px] sm:max-w-[160px]">
                    {user}
                  </span>
                </button>
              ))}
            </div>

            
            <button
              onClick={() =>
                scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })
              }
              className="absolute right-1 z-10 p-1 rounded-md bg-green-500 shadow-sm hover:bg-green-600 text-white transition flex"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )} */}

        {/* Tabs (History / Add Sheet) */}
        <div className="flex items-center border-b bg-white px-6">
          <button
            className={`py-3 px-4 text-sm font-medium ${
              activeTab === "data-processor"
                ? "border-b-2 border-green-600 text-green-700"
                : "text-gray-500 hover:text-green-600"
            }`}
            onClick={() => setActiveTab("data-processor")}
          >
            Data Processor
          </button>
          {/* <button
            className={`py-3 px-4 text-sm font-medium ${
              activeTab === "history"
                ? "border-b-2 border-green-600 text-green-700"
                : "text-gray-500 hover:text-green-600"
            }`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button> */}
          <button
            className={`py-3 px-4 text-sm font-medium ${
              activeTab === "add"
                ? "border-b-2 border-green-600 text-green-700"
                : "text-gray-500 hover:text-green-600"
            }`}
            onClick={() => setActiveTab("add")}
          >
            Add Sheet
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 bg-gray-50 min-w-0">
          {activeTab === "history" &&
            (selectedSheet ? (
              <SheetHistory history={history} />
            ) : (
              <p className="text-gray-500 p-4">
                Select a sheet to view its history.
              </p>
            ))}
          {activeTab === "add" && <AddSheetTab />}
          {activeTab === "data-processor" && (
            <div>
              {users.map((u) => {
                const userLower = u.toLowerCase();

                // 🔍 Get all sheets this user ever touched
                const userSheets = sheets.filter((sheet) =>
                  sheet.history?.some(
                    (h: any) => h.user?.toLowerCase() === userLower
                  )
                );

                // 🧮 Compute counts
                let updatedCount = 0;
                let notUpdatedCount = 0;

                userSheets.forEach((sheet) => {
                  const lastModified = new Date(sheet.lastModifiedTime);
                  const now = new Date();

                  const isToday =
                    lastModified.getFullYear() === now.getFullYear() &&
                    lastModified.getMonth() === now.getMonth() &&
                    lastModified.getDate() === now.getDate();

                  // ✅ If this user appears in sheet.history (edited before)
                  // AND the sheet was updated today → count as updated
                  const hasEdited = sheet.history?.some(
                    (h: any) => h.user?.toLowerCase() === userLower
                  );

                  if (hasEdited && isToday) {
                    updatedCount++;
                  } else {
                    notUpdatedCount++;
                  }
                });

                // 🕒 Find latest edit time for display
                const lastUpdated = userSheets
                  .map((s) => new Date(s.lastModifiedTime || 0).getTime())
                  .filter(Boolean)
                  .sort((a, b) => b - a)[0];

                const lastUpdatedDate = lastUpdated
                  ? new Date(lastUpdated).toLocaleString()
                  : "N/A";

                return (
                  <UserAccordion
                    key={u}
                    user={u}
                    sheets={userSheets}
                    sheetCount={userSheets.length}
                    updatedCount={updatedCount}
                    notUpdatedCount={notUpdatedCount}
                    lastUpdated={lastUpdatedDate}
                    onSelectSheet={handleSelectSheet}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
