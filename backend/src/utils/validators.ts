import { z } from 'zod';

const phoneSchema = z.string()
  .transform(val => val.replace(/\D/g, '').slice(-10))
  .refine(val => val.length === 10, 'Phone must contain at least 10 digits');

const optionalEmail = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
  z.string().email('Enter a valid email address').optional()
);

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  email: optionalEmail,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CLIENT', 'BUDDY', 'BOTH']).optional().default('CLIENT'),
}).superRefine((data, ctx) => {
  const digits = (data.phone || '').replace(/\D/g, '');
  const hasPhone = digits.length >= 10;
  const hasEmail = Boolean(data.email);
  if (!hasPhone && !hasEmail) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Provide an email address or a 10-digit phone number',
      path: ['identifier'],
    });
  }
});

export const loginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  phone: z.string().optional(),
  email: z.string().optional(),
  identifier: z.string().optional(),
}).transform((data) => ({
  password: data.password,
  identifier: (data.identifier || data.email || data.phone || '').trim(),
})).superRefine((data, ctx) => {
  if (!data.identifier) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Email or phone is required',
      path: ['identifier'],
    });
  }
});

export const otpSendSchema = z.object({
  phone: phoneSchema,
});

export const otpVerifySchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6, 'Code must be 6 digits'),
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
  type: z.string().optional(),
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
