# BlockEstate - Quick Start Guide

## Prerequisites Checklist
- [ ] Node.js v18+ installed
- [ ] MongoDB installed or Docker available
- [ ] Git installed

## Setup Steps (5 minutes)

### Step 1: Install Dependencies (2 minutes)
```powershell
# Blockchain
cd blockchain
npm install

# Backend  
cd ../backend
npm install

# Frontend
cd ../frontend
npm install
cd ..
```

### Step 2: Start MongoDB (30 seconds)
```powershell
# Using Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# OR install MongoDB Community Server
```

### Step 3: Start Blockchain (30 seconds)
```powershell
# Terminal 1
cd blockchain
npm run node
# Keep this running!
```

### Step 4: Deploy Contracts (1 minute)
```powershell
# Terminal 2
cd blockchain
npm run deploy
npm run export

# COPY the PropertyRegistry address from output
# Example: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Step 5: Configure Backend (30 seconds)
Edit `backend/.env` and update:
```
CONTRACT_ADDRESS=0x... (paste address from step 4)
```

### Step 6: Start Backend (30 seconds)
```powershell
# Terminal 3
cd backend
npm run dev
# Wait for "Connected to MongoDB" message
```

### Step 7: Start Frontend (30 seconds)
```powershell
# Terminal 4
cd frontend
npm run dev
# Open http://localhost:5173 in browser
```

## First Login (1 minute)

1. Go to http://localhost:5173
2. Click **Register**
3. Create an account:
   - Email: admin@test.com
   - Password: admin123
   - Name: Admin User
   - Role: **admin**
4. Click **Register**, then **Login**
5. Login with your credentials

## Create More Users

Same process - register with different emails and roles:
- **citizen** - For property owners
- **registrar** - For government officials
- **court** - For court officers
- **admin** - For system administrators

## Test the System

**As Citizen:**
1. Navigate to dashboard
2. See stats and quick actions

**As Registrar:**
1. View pending applications
2. Review and approve/reject

**As Admin:**
1. Manage users
2. View system stats

## Verify QR Code

Go to http://localhost:5173/verify-qr and test property verification.

## Troubleshooting

**MongoDB error?**
```powershell
docker ps  # Check if MongoDB is running
```

**Blockchain error?**
```powershell
# Make sure blockchain node is running on port 8545
# Restart: cd blockchain && npm run node
```

**Backend error?**
```powershell
# Check CONTRACT_ADDRESS is set in backend/.env
```

## You're Ready! 🎉

Your BlockEstate system is now running. Save your credentials in `CREDENTIALS.md`.

See `README.md` for complete documentation.
