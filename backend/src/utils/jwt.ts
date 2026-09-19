import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UserPayload } from '../types/index.js';

export const generateToken = (payload: UserPayload): string => {
  const options: SignOptions = {
    expiresIn: (config.jwt.expiresIn || '30d') as any
  };
  return jwt.sign(payload, config.jwt.secret, options);
};

export const generateRefreshToken = (payload: UserPayload): string => {
  const options: SignOptions = {
    expiresIn: (config.jwt.refreshExpiresIn || '7d') as any
  };
  return jwt.sign(payload, config.jwt.refreshSecret, options);
};

export const verifyToken = (token: string): UserPayload | null => {
  try {
    return jwt.verify(token, config.jwt.secret) as UserPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): UserPayload | null => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as UserPayload;
  } catch (error) {
    return null;
  }
};
