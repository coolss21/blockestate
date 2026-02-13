# BlockEstate - Land Registry System

A complete, production-grade blockchain-based land registry system with role-based access control, document verification, and fraud detection.

## 🚀 Features

- **Password-Based Authentication** - Email/password login (NO MetaMask required)
- **4 User Roles** - Citizen, Registrar, Court, Admin with strict RBAC
- **Blockchain Integration** - Local Hardhat Ethereum node (offline)
- **IPFS Storage** - Pinata integration for document storage
- **MongoDB Database** - Off-chain metadata and audit logs
- **QR Verification** - Public property verification via QR codes
- **Complete Workflows** - Application submission, approval, dispute management

## 📁 Project Structure

```
BlockEstate-FullStack/
├── blockchain/          # Hardhat + Solidity contracts
│   ├── contracts/      # Smart contracts (RoleAccess, DocumentStorage, FraudTimeline, PropertyRegistry)
│   └── scripts/        # Deployment and ABI export scripts
├── backend/            # Express.js API server
│   ├── src/
│   │   ├── models/     # Mongoose models
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   └── middleware/ # Auth, RBAC middleware
│   └── .env            # Backend configuration
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── pages/      # Role-based pages
│   │   ├── components/ # Reusable components
│   │   └── context/    # Auth context
│   └── .env            # Frontend configuration
├── CREDENTIALS.md      # User credentials documentation
└── README.md           # This file
```

## 🛠️ Tech Stack

### Blockchain
- Hardhat (local Ethereum node)
- Solidity ^0.8.20
- Ethers.js v6

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcrypt for passwords
- Multer for file uploads
- QRCode for certificate generation

### Frontend
- React 18
- Vite
- React Router v6
- Axios for API calls
- Tailwind CSS (basic styling)

## 📋 Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (Docker or local installation)
- **Git**

## 🚀 Setup Instructions

### 1. Install Dependencies

```powershell
# Install all dependencies
cd blockchain
npm install

cd ../backend
npm install

cd ../frontend
npm install
```

### 2. Configure MongoDB

**Option A: Using Docker (Recommended)**

```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: Download MongoDB**

Download MongoDB Community Server from https://www.mongodb.com/try/download/community and install it.

### 3. Configure Environment Variables

Backend `.env` is already configured. Make sure these values are correct:

```
PORT=5000
PUBLIC_BASE_URL=http://localhost:5000
FRONTEND_ORIGIN=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/blockestate
JWT_SECRET=your-super-secret-jwt-key-change-in-production
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=(will be set after deployment)
PINATA_JWT=(optional - leave empty to run without IPFS uploads)
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs
```

### 4. Start the Blockchain

```powershell
cd blockchain
npm run node
```

Keep this terminal open. You should see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

### 5. Deploy Contracts (New Terminal)

```powershell
cd blockchain
npm run deploy
npm run export
```

**IMPORTANT:** Copy the `PropertyRegistry` address from the output and update it in `backend/.env`:

```
CONTRACT_ADDRESS=0x... (paste the address here)
```

### 6. Start the Backend (New Terminal)

```powershell
cd backend
npm run dev
```

You should see:
```
✓ Connected to MongoDB
✓ Server running on http://localhost:5000
```

### 7. Start the Frontend (New Terminal)

```powershell
cd frontend
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:5173/
```

## 👥 Creating Users

Open `CREDENTIALS.md` and follow the instructions to create users for different roles.

**Quick Start:**

1. Go to http://localhost:5173
2. Click "Register"
3. Fill in details (email, password, name, role)
4. Register accounts for all roles you need
5. Login with any account to access the role-specific dashboard

**Roles:**
- **Citizen** - Apply for property registration, view properties, track applications
- **Registrar** - Review applications, approve/reject, generate certificates
- **Court** - Register disputes, flag properties, manage cases
- **Admin** - Manage users, configure system, view audit logs

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Citizen
- `GET /api/citizen/dashboard` - Get dashboard stats
- `GET /api/citizen/properties` - List user properties
- `POST /api/citizen/apply` - Submit new application (with file upload)
- `GET /api/citizen/applications` - List applications
- `GET /api/citizen/disputes` - List disputes

### Registrar
- `GET /api/registrar/dashboard` - Dashboard stats
- `GET /api/registrar/inbox` - Application inbox
- `GET /api/registrar/application/:appId` - Application details
- `POST /api/registrar/application/:appId/approve` - Approve (registers on blockchain)
- `POST /api/registrar/application/:appId/reject` - Reject application
- `POST /api/registrar/certificate/:propertyId` - Generate certificate with QR

### Court
- `GET /api/court/dashboard` - Dashboard stats
- `POST /api/court/cases/register` - Register new case (flags dispute on-chain)
- `GET /api/court/cases` - List cases
- `GET /api/court/cases/:caseId` - Case details
- `POST /api/court/cases/:caseId/orders` - Add court order
- `GET /api/court/hearings` - List hearings
- `POST /api/court/hearings` - Schedule hearing
- `POST /api/court/cases/:caseId/close` - Close case (clears dispute on-chain)

### Admin
- `GET /api/admin/dashboard` - System statistics
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PATCH /api/admin/users/:id/role` - Change user role
- `GET /api/admin/config` - System configuration
- `PUT /api/admin/config` - Update configuration
- `GET /api/admin/audit` - Audit logs

### Public
- `GET /api/public/property/:propertyId` - Public property info
- `POST /api/public/verify` - Verify property (via QR or ID)

## 🔄 Complete End-to-End Workflow

1. **Citizen** registers and logs in
2. **Citizen** submits property application with documents
3. **Registrar** reviews application in inbox
4. **Registrar** approves → property registered on blockchain
5. **Registrar** generates certificate with QR code
6. **Citizen** downloads certificate
7. **Anyone** can verify property via `/verify-qr` page
8. **Court** can flag disputes if needed (blocks transfers)
9. **Admin** monitors all activity via audit logs

## 🧪 Testing

### Test User Creation

```powershell
# Register a citizen
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"test1234\",\"name\":\"Test User\",\"role\":\"citizen\"}"
```

### Test Login

```powershell
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"test1234\"}"
```

## 📊 Database Collections

- **users** - User accounts with roles
- **properties** - Registered properties with blockchain references
- **applications** - Property registration applications
- **documents** - Document metadata and IPFS links
- **disputes** - Property disputes
- **cases** - Court cases
- **auditlogs** - Complete audit trail
- **officeconfigs** - System configuration

## 🔒 Security Features

- Password hashing with bcrypt
- JWT authentication with httpOnly cookies
- Strict role-based access control (RBAC)
- Input validation
- Blockchain transaction verification
- Document hash verification
- Audit logging for all actions

## 📝 Notes

- **Blockchain is OFFLINE** - Uses local Hardhat node, no external network needed
- **IPFS is OPTIONAL** - System works without Pinata JWT (marks uploads as pending)
- **All passwords are hashed** - Never stored in plain text
- **Wallet addresses** - Auto-generated by backend for blockchain transactions
- **No MetaMask required** - Everything is password-based

## 🛑 Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running on port 27017
- Check if Docker container is running: `docker ps`

### Blockchain Connection Error
- Make sure Hardhat node is running: `npm run node` in blockchain folder
- Check if it's listening on http://127.0.0.1:8545

### Frontend Can't Connect to Backend
- Verify backend is running on port 5000
- Check `frontend/.env` has correct API URL
- Check browser console for CORS errors

### Contract Deployment Fails
- Make sure Hardhat node is running first
- Check if all contracts compile: `npx hardhat compile`

## 📞 Support

For issues or questions, check:
- `CREDENTIALS.md` for user creation
- Backend logs in terminal
- Frontend browser console
- Blockchain node logs

## 📄 License

MIT

---

**Built with ❤️ for secure, transparent land registry**
