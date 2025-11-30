import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    console.log("=== Google Login Attempt ===");
    console.log("Client ID being used:", process.env.GOOGLE_CLIENT_ID);
    console.log("Credential received:", credential ? "Yes" : "No");

    if (!credential) {
      return res.status(400).json({ message: "No credential provided" });
    }

    // Verify Google JWT token
    console.log("Verifying token with Google...");
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log("Token verified successfully!");

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    // Check if user exists
    let user = await User.findOne({ googleId });

    if (!user) {
      // Create new user
      user = await User.create({
        googleId,
        email,
        name,
        picture,
        lastLogin: new Date(),
      });
      console.log("New user created:", email);
    } else {
      // Update last login for existing user
      user.lastLogin = new Date();
      await user.save();
      console.log("Existing user logged in:", email);
    }

    // Create JWT token for our app
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        googleId: user.googleId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return token and user data
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ message: "Invalid Google token", error: err.message });
  }
};
