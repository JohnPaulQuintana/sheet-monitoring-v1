// Disable all console logs in production
if (process.env.NODE_ENV === "production") {
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  console.warn = noop;
  console.error = noop;
}

// src/App.tsx
import Dashboard from "./pages/Dashboard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <p className="p-4">Loading...</p>;

  return user ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="h-screen flex flex-col bg-gray-50 text-gray-900">
        <AppContent />
      </div>
    </AuthProvider>
  );
}
