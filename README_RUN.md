# PropertyChain - Local Dev Runbook

This repo contains **3 parts**:

1. `blockchain/` - Hardhat local chain + contract deploy
2. `backend/` - Express API (Blockchain + Certificates + Public QR/PDF + Mongo RBAC)
3. `frontend/` - React (Vite) role-based dashboards (Citizen / Registrar / Court / Admin)

## Prereqs

- Node.js 18+
- Docker Desktop (for MongoDB) OR any MongoDB instance

## 1) Start Hardhat (local blockchain)

```bash
cd blockchain
npm install
npx hardhat node
```

Open **another terminal**:

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address printed in terminal into `backend/.env` as `CONTRACT_ADDRESS`.

## 2) Start MongoDB (for RBAC dashboards)

```bash
docker run -d --name propertychain-mongo -p 27017:27017 mongo:7
```

Mongo URL you will use:

```text
MONGO_URI=mongodb://localhost:27017
```

## 3) Start Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Health check:

```text
http://localhost:8081/api/health
```

### Important: Phone certificate/QR

- Use `http://<YOUR_LAN_IP>:8081/api/public/qr/BLR-001`
- The generated QR auto-swaps `localhost` to your LAN IP.

## 4) Start Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

### Login demo

1. Open any role login page (Citizen/Registrar/Court/Admin)
2. Click **Seed demo users** (requires Mongo running)
3. Login with the suggested credentials (password: `demo1234`)

## Wi-Fi changes / IP changes

- **Frontend**: run `npm run dev -- --host` (already set) so you can open it from phone via `http://<LAN_IP>:5173`
- **Backend**: CORS allows `localhost:5173` and any `http://<LAN_IP>:5173`
- **Certificate + QR**: public endpoints are Wi-Fi safe because they derive LAN base URL on each request.

## Troubleshooting

- `ERR_CONNECTION_TIMED_OUT` when hitting `http://LAN_IP:8081/api/health`:
  - Make sure backend is bound to `0.0.0.0` (it is by default in this repo)
  - Windows firewall: allow Node on private networks

- `NOT_OWNER` on transfer:
  - You are calling transfer from a wallet that's not the current owner. Use the owner address that registered the property.
