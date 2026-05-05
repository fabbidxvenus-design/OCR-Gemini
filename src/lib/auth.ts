import bcrypt from 'bcryptjs';
import { db } from '@/db/schema';

const SALT_ROUNDS = 10;

export async function hashPIN(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

export async function verifyPIN(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export async function getStoredPINHash(): Promise<string | null> {
  const authRecords = await db.auth.toArray();
  if (authRecords.length === 0) return null;
  return authRecords[0].pinHash;
}

export async function storePINHash(pinHash: string): Promise<void> {
  const now = new Date();
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);

  await db.auth.clear();
  await db.auth.add({
    pinHash,
    lastLogin: now,
    sessionExpiry: expiry,
  });
}

export async function updateLastLogin(): Promise<void> {
  const authRecords = await db.auth.toArray();
  if (authRecords.length === 0) return;

  const now = new Date();
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);

  await db.auth.update(authRecords[0].id!, {
    lastLogin: now,
    sessionExpiry: expiry,
  });
}

export function validatePINFormat(pin: string): { valid: boolean; error?: string } {
  if (!pin) return { valid: false, error: 'PIN không được để trống' };
  if (!/^\d+$/.test(pin)) return { valid: false, error: 'PIN chỉ được chứa số' };
  if (pin.length < 4) return { valid: false, error: 'PIN phải có ít nhất 4 chữ số' };
  if (pin.length > 6) return { valid: false, error: 'PIN không được quá 6 chữ số' };
  return { valid: true };
}