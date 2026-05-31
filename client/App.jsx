import React, { useState, useEffect } from 'react';
import Auth from './Auth.jsx';
import Dashboard from './Dashboard.jsx';

function App() {
  const [userToken, setUserToken] = useState(null);

  // When the web app first opens, quickly check if a user token is already cached
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUserToken(token);
    }
  }, []);

  const handleLoginSuccess = () => {
    // Read the newly created token and move the view forward
    const token = localStorage.getItem("token");
    setUserToken(token);
  };

  const handleLogout = () => {
    // Clear out browser storage completely and reset view
    localStorage.removeItem("token");
    setUserToken(null);
  };

  return (
    <div>
      {userToken ? (
        // 🔑 Added token={userToken} here so Dashboard can fetch your private tasks safely!
        <Dashboard token={userToken} onLogout={handleLogout} />
      ) : (
        <Auth onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;