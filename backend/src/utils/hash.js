import crypto from 'crypto';

export function sha256Hex(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function shortHex(s, left = 10, right = 8) {
  if (!s) return '';
  const str = String(s);
  if (str.length <= left + right + 3) return str;
  return `${str.slice(0,left)}...${str.slice(-right)}`;
}
