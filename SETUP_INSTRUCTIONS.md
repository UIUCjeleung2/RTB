# RTB (Recursive Trello Board) Setup Instructions

## Overview

This application uses **Google OAuth** for authentication and **MongoDB** for data storage. No passwords needed - users sign in with their Google accounts!

---

## Quick Start

### 1. Install Dependencies

```bash
# Backend
cd rtb/backend
npm install

# Frontend
cd rtb/frontend
npm install
```

### 2. Setup Google OAuth

**See detailed instructions in:** `GOOGLE_OAUTH_SETUP.md`

**Quick version:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project
3. Enable Google+ API
4. Create OAuth 2.0 Client ID
5. Add `http://localhost:3000` to Authorized JavaScript origins
6. Copy your Client ID

### 3. Configure Environment Variables

**Backend** (`rtb/backend/.env`):
```env
PORT=5001
MONGO_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/rtb
JWT_SECRET=your_random_secret_key
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

**Frontend** (`rtb/frontend/.env`):
```env
REACT_APP_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

**IMPORTANT:** Both Client IDs must be identical!

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd rtb/backend
npm start
```

Expected output:
```
MongoDB connected
Server running on port 5001
```

**Terminal 2 - Frontend:**
```bash
cd rtb/frontend
npm start
```

Browser opens to: `http://localhost:3000`

---

## What's Implemented

### Authentication Flow
1. User clicks "Sign in with Google"
2. Google authentication popup
3. Backend verifies Google JWT
4. User created in MongoDB (if new) or retrieved (if existing)
5. Backend issues JWT token
6. User redirected to dashboard

### Database Schema (MongoDB)
```javascript
User {
  googleId: String (unique),
  email: String (unique),
  name: String,
  picture: String,
  lastLogin: Date,
  createdAt: Date
}
```

### Tech Stack
- **Frontend:** React 19, React Router
- **Backend:** Express 5, Node.js
- **Database:** MongoDB Atlas
- **Authentication:** Google OAuth + JWT
- **Security:** google-auth-library for token verification

---

## Troubleshooting

### "Invalid Google token"
- Check `GOOGLE_CLIENT_ID` matches in both `.env` files
- Restart both servers after changing `.env`

### Google button not showing
- Check browser console for errors
- Verify Google script in `public/index.html`
- Clear browser cache

### MongoDB connection failed
- Verify `MONGO_URI` is correct
- Check IP whitelist in MongoDB Atlas
- Ensure cluster is running

### Port already in use
- Change `PORT` in `rtb/backend/.env` to different port (e.g., 5002)
- Update frontend API calls in `GoogleLogin.js` to match new port

---

## Project Structure

```
RTB/
├── rtb/
│   ├── backend/
│   │   ├── controllers/
│   │   │   └── authController.js      # Google OAuth logic
│   │   ├── models/
│   │   │   └── User.js                # User schema
│   │   ├── routes/
│   │   │   └── authRoutes.js          # /auth/google endpoint
│   │   ├── middleware/
│   │   │   └── auth.js                # JWT verification
│   │   ├── server.js                  # Express server
│   │   ├── package.json
│   │   └── .env                       # Backend config
│   │
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   │   └── GoogleLogin.js     # Google button component
│       │   ├── pages/
│       │   │   └── Login/
│       │   │       ├── Login.js       # Login page
│       │   │       └── Login.css      # Login styles
│       │   ├── App.js                 # Router setup
│       │   └── index.js
│       ├── public/
│       │   └── index.html             # Google script loaded here
│       ├── package.json
│       └── .env                       # Frontend config
│
├── GOOGLE_OAUTH_SETUP.md              # Detailed Google setup guide
└── SETUP_INSTRUCTIONS.md              # This file
```

---

## Next Steps

Once authentication is working:

1. **Create Dashboard Page**
   - Display user info
   - Show user's boards

2. **Implement Board System**
   - Create Board model
   - CRUD operations for boards

3. **Implement Task System**
   - Create Task model
   - Recursive task subdivision
   - Task hierarchy visualization

4. **Protected Routes**
   - Add JWT middleware to protected endpoints
   - Frontend route guards

---

## Security Notes

✅ **Good practices:**
- `.env` files are in `.gitignore`
- Google verifies JWT on backend (secure)
- JWT tokens expire after 7 days
- User data encrypted in transit (HTTPS)

❌ **Don't do this:**
- Commit `.env` files
- Share Client IDs publicly
- Use production credentials in development

---

## Resources

- [Google OAuth Guide](GOOGLE_OAUTH_SETUP.md)
- [Google Identity Docs](https://developers.google.com/identity/gsi/web)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [JWT.io](https://jwt.io/) - Decode and inspect JWT tokens

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review `GOOGLE_OAUTH_SETUP.md` for detailed Google setup
3. Check server logs in terminal
4. Check browser console (F12) for frontend errors
5. Verify all `.env` variables are set correctly
