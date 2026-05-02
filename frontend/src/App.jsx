import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SettingsModal from "./components/SettingsModal";

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [showSettings, setShowSettings] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const handleUpdated = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <>
      <Dashboard
        user={user}
        onLogout={handleLogout}
        onOpenSettings={() => setShowSettings(true)}
      />
      {showSettings && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
          onUpdated={(u) => { handleUpdated(u); setShowSettings(false); }}
        />
      )}
    </>
  );
}

export default App;