import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address').transform((val) => val.toLowerCase().trim()),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must include a letter')
    .regex(/\d/, 'Password must include a number'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  role: z.enum(['CLIENT', 'BUDDY', 'BOTH']).optional().default('CLIENT'),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address').transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
});

export const emailOnlySchema = z.object({
  email: z.string().email('Enter a valid email address').transform((val) => val.toLowerCase().trim()),
});

export const verifyEmailSchema = z.object({
  email: z.string().email('Enter a valid email address').transform((val) => val.toLowerCase().trim()),
  code: z.string().min(4, 'Enter the 6-digit code from your email'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address').transform((val) => val.toLowerCase().trim()),
  code: z.string().min(4, 'Enter the 6-digit code from your email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must include a letter')
    .regex(/\d/, 'Password must include a number'),
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
  gender: z.string().optional(),
});

export const completeOnboardingSchema = z.object({
  gender: z.enum(['male', 'female', 'other']),
  state: z.string().min(2, 'Select your state'),
  city: z.string().min(2, 'Enter your city'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  bio: z.string().max(500).optional().or(z.literal('')),
  availableForRequests: z.boolean().optional(),
  instagram: z.string().optional().or(z.literal('')),
  facebook: z.string().optional().or(z.literal('')),
  linkedin: z.string().optional().or(z.literal('')),
  twitter: z.string().optional().or(z.literal('')),
  interestIds: z.array(z.string()).max(4, 'You can select up to 4 services only'),
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
  planId: z.string().trim().min(1, 'Select a plan'),
});

export const createUpiOrderSchema = z.object({
  planId: z.string().trim().min(1, 'Select a plan'),
});

export const submitUtrSchema = z.object({
  paymentId: z.string().trim().min(1, 'Payment is required'),
  utr: z.string().trim().min(8, 'Enter the UTR / UPI reference from your bank app'),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});
