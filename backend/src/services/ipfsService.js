import { PINATA_JWT, IPFS_GATEWAY } from '../config/index.js';

export const IpfsService = {
  extractCid(fileRef) {
    if (!fileRef) return null;
    const s = String(fileRef);

    // ipfs://<cid>
    if (s.startsWith('ipfs://')) return s.slice('ipfs://'.length).split('/')[0];

    // https://gateway.../ipfs/<cid>
    const m = s.match(/\/ipfs\/([^/?#]+)/i);
    if (m) return m[1];

    // bare cid?
    if (/^[a-zA-Z0-9]{46,}$/.test(s)) return s;

    return null;
  },

  toGatewayUrl(cid) {
    if (!cid) return null;
    const gw = (IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs').replace(/\/$/, '');
    return `${gw}/${cid}`;
  },

  async pinToPinata({ buffer, filename = 'document.bin', contentType = 'application/octet-stream' }) {
    if (!PINATA_JWT) {
      const err = new Error('PINATA_JWT is not set in backend/.env');
      err.statusCode = 500;
      throw err;
    }
    if (!buffer || !(buffer instanceof Buffer)) {
      const err = new Error('pinToPinata expects a Buffer');
      err.statusCode = 500;
      throw err;
    }

    // Node 18+ supports global fetch + FormData + Blob
    const form = new FormData();
    const blob = new Blob([buffer], { type: contentType });
    form.append('file', blob, filename);

    // Optional pin metadata
    form.append('pinataMetadata', JSON.stringify({ name: filename }));
    // Optional pin options
    form.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: form
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!res.ok) {
      const msg = data?.error?.details || data?.error || data?.message || text || 'Pinata upload failed';
      const err = new Error(msg);
      err.statusCode = res.status;
      err.data = data;
      throw err;
    }

    const cid = data?.IpfsHash;
    if (!cid) {
      const err = new Error('Pinata response missing IpfsHash');
      err.statusCode = 500;
      err.data = data;
      throw err;
    }

    return cid;
  }
};
