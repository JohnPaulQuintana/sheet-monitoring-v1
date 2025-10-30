import { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import SheetHistory from "../components/SheetHistory";
import AddSheetTab from "../components/AddSheetTab";
import { fetchSheetHistory } from "../services/api";
import { User, ChevronLeft, ChevronRight } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // your firebase config
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";

export default function Dashboard() {
  const [sheets, setSheets] = useState<any[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("history");
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
    const interval = setInterval(async () => {
      try {
        const data = await fetchSheetHistory();
        const newSheets = data.spreadsheets || [];
        const changed = JSON.stringify(newSheets) !== JSON.stringify(sheets);
        console.log("Sending request for new updates....")
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
    }, 60000);
    return () => clearInterval(interval);
  }, [sheets, selectedSheet]);

  // ⚡ Select a sheet and load history
  const handleSelectSheet = (sheet: any) => {
    setSelectedSheet(sheet);
    setSidebarOpen(false);
    setHistory(sheet?.history || []);
  };

  // 🧩 Get all unique users from sheet histories
  const users = useMemo(() => {
    const userSet = new Set<string>();
    sheets.forEach((sheet) => {
      sheet.history?.forEach((h: any) => {
        // console.log(h)
        if (h.user) userSet.add(h.user);
      });
    });
    return Array.from(userSet);
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

  if (loading) return <p className="text-gray-500 p-4">Loading sheets...</p>;
  if (error) return <p className="text-red-500 p-4">Error: {error}</p>;

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
        {users.length > 0 && (
          <div className="relative flex items-center bg-white border-b border-gray-200">
            {/* ◀ Scroll Left */}
            <button
              onClick={() =>
                scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })
              }
              className="absolute left-1 z-10 p-1 rounded-md bg-green-500 shadow-sm hover:bg-green-600 text-white transition flex"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Tabs Container */}
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

            {/* ▶ Scroll Right */}
            <button
              onClick={() =>
                scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })
              }
              className="absolute right-1 z-10 p-1 rounded-md bg-green-500 shadow-sm hover:bg-green-600 text-white transition flex"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Tabs (History / Add Sheet) */}
        <div className="flex items-center border-b bg-white px-6">
          <button
            className={`py-3 px-4 text-sm font-medium ${
              activeTab === "history"
                ? "border-b-2 border-green-600 text-green-700"
                : "text-gray-500 hover:text-green-600"
            }`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
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
        </div>
      </div>
    </div>
  );
}
