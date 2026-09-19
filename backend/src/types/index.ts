import { Request } from 'express';

export interface UserPayload {
  id: string;
  email?: string;
  phone?: string;
  role: string;
  isAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export interface SocketData {
  userId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
