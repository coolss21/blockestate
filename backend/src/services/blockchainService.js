import { ethers } from 'ethers';
import { RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS } from '../config/index.js';

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let PropertyRegistryABI = [];
let CONTRACT_ADDRESS_LOADED = CONTRACT_ADDRESS;

try {
  // Try to load from exported files
  PropertyRegistryABI = require('../contracts/abis/PropertyRegistry.json');
  const addresses = require('../contracts/addresses.json');
  // Support both { contracts: { ... } } and { network: { ... } } structures
  const addr = addresses.contracts?.PropertyRegistry || addresses.localhost?.PropertyRegistry || addresses.PropertyRegistry;
  if (addr) {
    CONTRACT_ADDRESS_LOADED = addr;
  }
} catch (error) {
  console.warn('⚠️ Could not load PropertyRegistry.json or addresses.json (run npm run export)');
  // Fallback to hardcoded ABI if file load fails
  PropertyRegistryABI = [
    'function registerProperty(string propertyId, bytes32 docHash, string fileRef, address owner)',
    'function initiateTransfer(string propertyId, address buyer)',
    'function finalizeTransfer(string propertyId)',
    'function flagDispute(string propertyId, string reason, string caseId)',
    'function clearDispute(string propertyId)',
    'function getProperty(string propertyId) view returns (bool, bytes32, string, uint256, address, uint8, string, string, uint256, bool, address)',
    'event PropertyRegistered(string indexed propertyId, bytes32 docHash, string fileRef, address owner, address registrar, uint256 timestamp)',
    'event TransferInitiated(string indexed propertyId, address indexed from, address indexed to, uint256 timestamp)',
    'event TransferFinalized(string indexed propertyId, address indexed from, address indexed to, uint256 timestamp)',
    'event DisputeFlagged(string indexed propertyId, string reason, string caseId, address indexed by, uint256 timestamp)',
    'event DisputeCleared(string indexed propertyId, address indexed by, uint256 timestamp)'
  ];
}

const contract = new ethers.Contract(CONTRACT_ADDRESS_LOADED, PropertyRegistryABI, wallet);

function toNumberSafe(v) {
  // ethers v6 returns bigint for uints
  try {
    if (typeof v === 'bigint') return Number(v);
    if (typeof v === 'number') return v;
    return Number(v);
  } catch {
    return 0;
  }
}

function mapGetPropertyResult(r) {
  // r is an array-like tuple
  // [exists, docHash, fileRef, createdAt, owner, status, disputeReason, disputeCaseId, disputeAt, transferPending, pendingBuyer]
  const exists = Boolean(r?.[0]);
  return {
    exists,
    docHash: r?.[1] ?? '0x',
    fileRef: r?.[2] ?? '',
    createdAt: toNumberSafe(r?.[3]),
    owner: r?.[4] ?? ethers.ZeroAddress,
    status: toNumberSafe(r?.[5]),
    disputeReason: r?.[6] ?? '',
    disputeCaseId: r?.[7] ?? '',
    disputeAt: toNumberSafe(r?.[8]),
    transferPending: Boolean(r?.[9]),
    pendingBuyer: r?.[10] ?? ethers.ZeroAddress
  };
}

function scoreTimeline(events) {
  // Simple heuristic fraud-risk scoring
  //  - dispute flag => high risk
  //  - many transfers in short history => medium
  //  - otherwise low
  let score = 0;
  const counts = Object.create(null);
  for (const e of events || []) {
    counts[e.label] = (counts[e.label] || 0) + 1;
  }

  if ((counts.DisputeFlagged || 0) > 0) score += 70;
  if ((counts.TransferInitiated || 0) > 1) score += 20;
  if ((counts.TransferFinalized || 0) > 1) score += 20;
  if ((counts.PropertyRegistered || 0) > 1) score += 30; // shouldn't happen normally

  // clamp
  score = Math.max(0, Math.min(100, score));
  const risk = score >= 70 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW';
  return { score, risk };
}

export const BlockchainService = {
  provider,
  wallet,
  contract,

  async getAccounts() {
    return await provider.send('eth_accounts', []);
  },

  async getProperty(propertyId) {
    const r = await contract.getProperty(propertyId);
    return mapGetPropertyResult(r);
  },

  async registerProperty({ propertyId, docHash, fileRef, ownerAddress }) {
    const tx = await contract.registerProperty(propertyId, docHash, fileRef, ownerAddress);
    const receipt = await tx.wait();
    return receipt.hash;
  },

  async initiateTransfer({ propertyId, buyerAddress }) {
    const tx = await contract.initiateTransfer(propertyId, buyerAddress);
    const receipt = await tx.wait();
    return receipt.hash;
  },

  async finalizeTransfer({ propertyId }) {
    const tx = await contract.finalizeTransfer(propertyId);
    const receipt = await tx.wait();
    return receipt.hash;
  },

  async flagDispute({ propertyId, reason, caseId }) {
    const tx = await contract.flagDispute(propertyId, reason, caseId);
    const receipt = await tx.wait();
    return receipt.hash;
  },

  async clearDispute({ propertyId }) {
    const tx = await contract.clearDispute(propertyId);
    const receipt = await tx.wait();
    return receipt.hash;
  },

  async getTimeline(propertyId, lookbackBlocks = 5000) {
    const latest = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latest - lookbackBlocks);

    const events = [];
    const pushEvents = async (filter, label) => {
      const logs = await contract.queryFilter(filter, fromBlock, latest);
      for (const l of logs) {
        events.push({
          label,
          blockNumber: l.blockNumber,
          txHash: l.transactionHash,
          args: l.args
            ? Object.fromEntries(Object.entries(l.args).filter(([k]) => Number.isNaN(Number(k))))
            : {}
        });
      }
    };

    await pushEvents(contract.filters.PropertyRegistered(propertyId), 'PropertyRegistered');
    await pushEvents(contract.filters.TransferInitiated(propertyId), 'TransferInitiated');
    await pushEvents(contract.filters.TransferFinalized(propertyId), 'TransferFinalized');
    await pushEvents(contract.filters.DisputeFlagged(propertyId), 'DisputeFlagged');
    await pushEvents(contract.filters.DisputeCleared(propertyId), 'DisputeCleared');

    events.sort((a, b) => a.blockNumber - b.blockNumber);
    return events;
  },

  async timeline(propertyId) {
    const events = await this.getTimeline(propertyId);
    const { score, risk } = scoreTimeline(events);
    return { events, score, risk };
  }
};
