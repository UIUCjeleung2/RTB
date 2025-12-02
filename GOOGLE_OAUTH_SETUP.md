# Google OAuth Setup Guide for RTB

This guide will walk you through setting up Google OAuth authentication for the RTB application.

## Prerequisites

- Google account
- MongoDB Atlas account (already configured)

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Project name: `RTB` (or any name you prefer)
5. Click **"Create"**

---

## Step 2: Enable Google+ API

1. In your project, go to **"APIs & Services"** > **"Library"**
2. Search for **"Google+ API"**
3. Click on it and click **"Enable"**

---

## Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Choose **"External"** (unless you have a Google Workspace account)
3. Click **"Create"**

**Fill in the required fields:**
- App name: `RTB - Recursive Trello Board`
- User support email: Your email
- Developer contact email: Your email
- Click **"Save and Continue"**

**Scopes (Step 2):**
- Click **"Add or Remove Scopes"**
- Select:
  - `.../auth/userinfo.email`
  - `.../auth/userinfo.profile`
- Click **"Update"** then **"Save and Continue"**

**Test users (Step 3):**
- Click **"Add Users"**
- Add your Gmail address (and any teammate emails)
- Click **"Save and Continue"**

**Summary (Step 4):**
- Review and click **"Back to Dashboard"**

---

## Step 4: Create OAuth 2.0 Client ID

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth 2.0 Client ID"**

**Configure the Client ID:**
- Application type: **Web application**
- Name: `RTB Web Client`

**Authorized JavaScript origins:**
- Click **"Add URI"**
- Add: `http://localhost:3000`

**Authorized redirect URIs:**
- You can leave this blank for now

3. Click **"Create"**

**You'll see a modal with your credentials:**
- **Client ID**: Something like `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: Not needed for this implementation
- **Copy the Client ID** - you'll need it in the next step

---

## Step 5: Configure Your Application

### Backend Configuration

1. Open `rtb/backend/.env`
2. Replace the `GOOGLE_CLIENT_ID` value with your actual Client ID:

```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

### Frontend Configuration

1. Open `rtb/frontend/.env`
2. Replace the `REACT_APP_GOOGLE_CLIENT_ID` value with the **SAME** Client ID:

```env
REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

**IMPORTANT:** Both files must have the exact same Client ID!

---

## Step 6: Run the Application

### Terminal 1 - Backend
```bash
cd rtb/backend
npm start
```

You should see:
```
MongoDB connected
Server running on port 5001
```

### Terminal 2 - Frontend
```bash
cd rtb/frontend
npm start
```

Browser should open to: `http://localhost:3000`

---

## Step 7: Test Google Login

1. You should see the login page with a **"Continue with Google"** button
2. Click the button
3. Select your Google account
4. Authorize the app
5. You should be redirected to `/dashboard` (which will show an error for now - that's normal!)
6. Check browser console - you should see "Login successful!" with your user data

---

## Verify It Works

### Check MongoDB
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **"Browse Collections"** on your cluster
3. You should see:
   - Database: `rtb`
   - Collection: `users`
   - Your user document with:
     - `googleId`
     - `email`
     - `name`
     - `picture`
     - `createdAt`
     - `lastLogin`

### Check localStorage
1. Open browser DevTools (F12)
2. Go to **Application** > **Local Storage** > `http://localhost:3000`
3. You should see:
   - `token`: Your JWT token
   - `user`: Your user data (JSON string)

---

## Troubleshooting

### "Invalid Google token" error
- Make sure `GOOGLE_CLIENT_ID` is the same in both `.env` files
- Check that you copied the full Client ID (ends with `.apps.googleusercontent.com`)
- Restart both backend and frontend servers after changing `.env`

### Google button doesn't appear
- Check browser console for errors
- Make sure the Google script is loaded in `public/index.html`
- Clear browser cache and reload

### "redirect_uri_mismatch" error
- Go back to Google Cloud Console > Credentials
- Make sure `http://localhost:3000` is in **Authorized JavaScript origins**
- Wait a few minutes for changes to propagate

### MongoDB connection error
- Check your `MONGO_URI` is correct
- Make sure your IP is whitelisted in MongoDB Atlas
- Verify MongoDB cluster is running

### Backend won't start
- Run `npm install` in `rtb/backend`
- Check that `google-auth-library` is installed
- Look for syntax errors in console

---

## Security Notes

✅ **DO:**
- Keep `.env` files in `.gitignore` (already done)
- Use different Client IDs for development and production
- Add only trusted email addresses as test users

❌ **DON'T:**
- Commit `.env` files to git
- Share your Client ID publicly (though it's not super sensitive)
- Use the same credentials in production

---

## Next Steps

Once Google OAuth is working:
1. Build the Dashboard page
2. Create Board and Task models
3. Implement recursive task subdivision
4. Add protected routes with JWT middleware

---

## Need Help?

- [Google OAuth Documentation](https://developers.google.com/identity/gsi/web/guides/overview)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- Check backend console for error messages
- Check browser console for frontend errors
