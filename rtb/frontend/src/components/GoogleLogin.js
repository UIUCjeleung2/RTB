import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleLogin() {
  const navigate = useNavigate();

  const handleCredentialResponse = async (response) => {
    console.log("=== Google Login Frontend ===");
    console.log("Client ID used:", process.env.REACT_APP_GOOGLE_CLIENT_ID);
    console.log("Got credential from Google:", response.credential ? "Yes" : "No");

    try {
      // Send Google credential to our backend
      console.log("Sending credential to backend...");
      const res = await fetch("https://rtbbackend-ng6n.onrender.com/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store our JWT token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        console.log("Login successful!", data.user);

        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        console.error("Backend error:", data);
        alert(`Login failed: ${data.message}\nError: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong during login");
    }
  };

  useEffect(() => {
    // Initialize Google Sign-In
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          {
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
          }
        );
      }
    };

    // Check if Google script is loaded
    const checkGoogleLoaded = setInterval(() => {
      if (window.google) {
        clearInterval(checkGoogleLoaded);
        initializeGoogleSignIn();
      }
    }, 100);

    return () => clearInterval(checkGoogleLoaded);
  }, []);

  return (
    <div>
      <div id="googleSignInDiv"></div>
    </div>
  );
}
