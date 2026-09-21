import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SECRET = process.env.ADMIN_SECRET || 'aymen-dubai-tourisme-admin-secret-key-2026';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  if (hash === password) return true;
  try {
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
      return await bcrypt.compare(password, hash);
    }
  } catch {
    // fallback
  }
  return hash === password;
}

export function generateToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  
  const payloadWithExp = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days expiration
  };
  
  const payloadEncoded = Buffer.from(JSON.stringify(payloadWithExp)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(`${header}.${payloadEncoded}`).digest('base64url');
  
  return `${header}.${payloadEncoded}.${signature}`;
}

export function verifyToken(token: string): any | null {
  try {
    const [headerEncoded, payloadEncoded, signature] = token.split('.');
    if (!headerEncoded || !payloadEncoded || !signature) return null;
    
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(`${headerEncoded}.${payloadEncoded}`).digest('base64url');
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(payloadEncoded, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    
    return payload;
  } catch (error) {
    return null;
  }
}
