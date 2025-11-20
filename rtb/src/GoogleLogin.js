import { useEffect, useState } from "react";

export default function GoogleLogin() {
  const [user, setUser] = useState(null);

  // Decode the JWT credential Google returns
  function decodeJWT(token) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  }

  function handleLogin(response) {
    const userObject = decodeJWT(response.credential);
    setUser(userObject);

    console.log("Google Login JWT:", response.credential);
    console.log("Decoded User:", userObject);
  }

  function handleLogout() {
    setUser(null);
  }

  useEffect(() => {
    /* global google */

    const initializeGoogle = () => {
      if (window.google) {
        console.log("CLIENT ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID);
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleLogin,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          { theme: "outline", size: "large" }
        );

        // Optional: auto-prompt One Tap
        // window.google.accounts.id.prompt();
      }
    };

    // Check every 100ms if the script has loaded
    const interval = setInterval(() => {
      if (window.google) {
        clearInterval(interval);
        initializeGoogle();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [handleLogin]);

  return (
    <div>
      {/* If user is logged in, show profile */}
      {user ? (
        <div style={{ textAlign: "center" }}>
          <img
            src={user.picture}
            alt="profile"
            style={{ borderRadius: "50%", width: 50 }}
          />
          <h3>Welcome, {user.name}</h3>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        // Otherwise show the Google button
        <div id="googleSignInDiv"></div>
      )}
    </div>
  );
}
