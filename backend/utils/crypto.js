import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const SECRET = process.env.SECRET_KEY;

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, Buffer.from(SECRET), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return JSON.stringify({
    iv: iv.toString('hex'),
    content: encrypted,
    tag: cipher.getAuthTag().toString('hex')
  });
}

export function decrypt(hash) {
  const data = JSON.parse(hash);
  const decipher = crypto.createDecipheriv(
    ALGO,
    Buffer.from(SECRET),
    Buffer.from(data.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(data.tag, 'hex'));

  let decrypted = decipher.update(data.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
