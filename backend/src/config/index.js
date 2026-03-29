import dotenv from "dotenv";
import { ethers } from "ethers";
import os from "os";

dotenv.config();

/* ---------------- ENV HELPERS ---------------- */
export function mustEnv(key) {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
}

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

/* ---------------- BASIC CONFIG ---------------- */
export const PORT = Number(process.env.PORT || 8081);
export const LOCAL_IP = getLocalIp();

export const PUBLIC_BASE =
  process.env.PUBLIC_BASE_URL || `http://${LOCAL_IP}:${PORT}`;

export const BACKEND_URL = process.env.BACKEND_URL || `http://${LOCAL_IP}:${PORT}`;

export const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || "http://localhost:5173";

export const JWT_SECRET =
  process.env.JWT_SECRET || "demo_secret_change_me";

/* ---------------- DATABASE (MongoDB) ---------------- */
// Optional. If not set, Mongo-backed RBAC APIs will be unavailable.
export const MONGO_URI = process.env.MONGO_URI || "";
console.log('[DEBUG] Loaded MONGO_URI:', MONGO_URI ? MONGO_URI.substring(0, 20) + '...' : 'UNDEFINED');

/* ---------------- BLOCKCHAIN ---------------- */
export const RPC_URL = mustEnv("RPC_URL");
export const PRIVATE_KEY = mustEnv("PRIVATE_KEY");
export const CONTRACT_ADDRESS = mustEnv("CONTRACT_ADDRESS");

/* ---------------- IPFS ---------------- */
export const PINATA_JWT = process.env.PINATA_JWT || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5MTJlNmU5OC1lOTg1LTQ2OTctODA2Yi04ODJiMDcyZWRiMjkiLCJlbWFpbCI6ImFhZGkubi5oYXJhbGVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6Ijg4YTNlODgyOTVkYmM2NzY3NTZkIiwic2NvcGVkS2V5U2VjcmV0IjoiYmQwMWUxMzU2ZjFkODEwNTA1NTk4M2RkMGQ3YmI3NjBmYjMwZjczODQ2M2I4OTNmYzkyYzFkZTg1NzZjZmYyOCIsImV4cCI6MTc5OTc3MDA4OH0.62KWSyFW90DAEP7g4jtxzfx_OSxaDgtGqOm3jWYBdwE';
export const IPFS_GATEWAY = process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

/* ---------------- ETHERS ---------------- */
export const provider = new ethers.JsonRpcProvider(RPC_URL);
export const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

/* ---------------- CONTRACT ---------------- */
export const CONTRACT_ABI = [
  "function registerProperty(string propertyId, bytes32 docHash, string fileRef, address owner)",
  "function initiateTransfer(string propertyId, address buyer)",
  "function finalizeTransfer(string propertyId)",
  "function flagDispute(string propertyId, string reason, string caseId)",
  "function clearDispute(string propertyId)",
  "function getProperty(string propertyId) view returns (bool, bytes32, string, uint256, address, uint8, string, string, uint256, bool, address)",

  "event PropertyRegistered(string indexed propertyId, bytes32 docHash, string fileRef, address owner, address registrar, uint256 timestamp)",
  "event TransferInitiated(string indexed propertyId, address indexed from, address indexed to, uint256 timestamp)",
  "event TransferFinalized(string indexed propertyId, address indexed from, address indexed to, uint256 timestamp)",
  "event DisputeFlagged(string indexed propertyId, string reason, string caseId, address indexed by, uint256 timestamp)",
  "event DisputeCleared(string indexed propertyId, address indexed by, uint256 timestamp)"
];

export const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  wallet
);
