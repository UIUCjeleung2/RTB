# RTB Login Screen Setup Instructions

## 1. Switch to login_screen branch
```bash
git checkout login_screen
```

## 2. Setup Backend

### Navigate to backend directory:
```bash
cd rtb/backend
```

### Create a .env file:
```bash
# Create .env file with these variables:
PORT=5001
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_random_secret_key_here
```

**Example .env:**
```
PORT=5001
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rtb?retryWrites=true&w=majority
JWT_SECRET=super_secret_random_string_12345
```

**To generate a secure JWT_SECRET:**
```bash
# On Windows (PowerShell):
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# On Mac/Linux:
openssl rand -base64 32
```

### Install dependencies (if not already done):
```bash
npm install
```

### Start the backend server:
```bash
npm start
```

**You should see:**
```
MongoDB connected
Server running on port 5001
```

**Leave this terminal running!**

---

## 3. Setup Frontend (in a NEW terminal)

### Navigate to frontend directory:
```bash
cd rtb/frontend
```

### Install dependencies (if not already done):
```bash
npm install
```

### Start the frontend development server:
```bash
npm start
```

**You should see:**
```
Compiled successfully!
You can now view frontend in the browser.

Local:            http://localhost:3000
```

**Your browser should auto-open to http://localhost:3000**

---

## 4. Test the Application

### Register a new user:
1. Click "Register" link on login page
2. Enter email: `test@example.com`
3. Enter password: `password123`
4. Click "Sign Up"
5. You should see "Registration successful! Please log in."

### Login:
1. Enter the same email/password
2. Click "Sign In"
3. You should see "Login successful!"
4. Browser will try to navigate to `/dashboard` (which doesn't exist yet)

### Check if it worked:
- Open browser DevTools (F12)
- Go to Console tab
- You should see no errors
- Go to Application tab → Local Storage → http://localhost:3000
- You should see `token` and `email` stored there

---

## Troubleshooting

### Backend won't start:
- **Check MongoDB connection**: Make sure MONGO_URI in .env is correct
- **Port already in use**: Change PORT in .env to 5002, update frontend code
- **Missing .env**: Create the file in `rtb/backend/`

### Frontend can't connect to backend:
- **CORS error**: Backend has CORS enabled, should work
- **Check backend is running**: Visit http://localhost:5001 in browser
  - Should see: `{"message":"Server is running"}`
- **Wrong port**: Check Login.js and Register.js use `http://localhost:5001`

### "User already exists":
- You already registered that email
- Use a different email OR delete from MongoDB

### MongoDB connection error:
- Backend will still start but authentication won't work
- Check your MONGO_URI is correct
- Make sure IP is whitelisted in MongoDB Atlas (or use 0.0.0.0/0 for all)
