import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address').transform((val) => val.toLowerCase().trim()),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CLIENT', 'BUDDY', 'BOTH']).optional().default('CLIENT'),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address').transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  role: z.enum(['CLIENT', 'BUDDY', 'BOTH']).optional(),
  availableForRequests: z.boolean().optional(),
});

export const createRequestSchema = z.object({
  type: z.enum(['NEED_BUDDY', 'AM_BUDDY']).optional(),
  category: z.string(),
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  budget: z.number().min(0).optional(),
  location: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  dateTime: z.string().optional().transform(str => str ? new Date(str) : undefined),
});

export const updateRequestSchema = z.object({
  title: z.string().min(3).max(150).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  budget: z.number().min(0).optional(),
  location: z.string().optional(),
  status: z.enum(['OPEN', 'CLOSED', 'EXPIRED']).optional(),
});

export const createOfferSchema = z.object({
  message: z.string().optional(),
});

export const sendMessageSchema = z.object({
  text: z.string().min(1),
});

export const createOrderSchema = z.object({
  planId: z.string(),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});
