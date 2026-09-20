import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Never bind Coolify's public PORT; the gateway owns that.
  port: Number(process.env.API_PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  adminEmails: ['piyushmodi170@gmail.com'],
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'supersecretrefresh',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '90d'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'ap-south-1',
    bucketName: process.env.AWS_S3_BUCKET_NAME || 'buddysearch-dev'
  },
  otp: {
    provider: process.env.OTP_PROVIDER || 'console',
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      serviceSid: process.env.TWILIO_SERVICE_SID || ''
    }
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || ''
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
  },
  seoAgent: {
    accessToken: process.env.SEO_AGENT_ACCESS_TOKEN || '',
    signingSecret: process.env.SEO_AGENT_SIGNING_SECRET || '',
  },
};
