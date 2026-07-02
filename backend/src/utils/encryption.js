const crypto = require('crypto');

// AES-256-GCM encryption for secrets stored in the DB (e.g. Humanforce ICS links).
// Key is derived from HF_ENCRYPTION_KEY if set, otherwise JWT_SECRET, so no extra
// env setup is required. Changing the source secret invalidates stored values.
const getKey = () => {
  const secret = process.env.HF_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret) throw new Error('HF_ENCRYPTION_KEY or JWT_SECRET must be set for encryption');
  return crypto.scryptSync(secret, 'humanforce-sync-v1', 32);
};

const encrypt = (plaintext) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
};

const decrypt = (stored) => {
  const [ivHex, tagHex, dataHex] = stored.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8');
};

module.exports = { encrypt, decrypt };
