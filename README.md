# BuddySearch

BuddySearch is an activity companion marketplace in India connecting people who want to book a buddy for travel, gym, movies, and similar plans.

## Tech Stack
- **Database**: PostgreSQL
- **Cache**: Redis
- **ORM**: Prisma
- **Backend/Frontend**: Node.js, TypeScript

## Prerequisites
- Node.js 18+
- Docker and Docker Compose

## Quick Start

1. **Clone and Setup**
   ```bash
   cd buddysearch
   npm install
   ```
2. **Start Infrastructure Services**
   ```bash
   docker-compose up -d
   ```
3. **Install Database Dependencies**
   ```bash
   cd database
   npm install
   ```
4. **Environment Variables**
   Create a `.env` file in the root directory based on `.env.example`.

5. **Run Migrations & Seed Database**
   ```bash
   cd database
   npm run generate
   npm run migrate
   npm run seed
   ```

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string.
- `REDIS_URL`: Redis connection string.
- `JWT_SECRET`: Secret key for JWT signing.
- `JWT_EXPIRES_IN`: JWT expiration time.
- `TWILIO_*`: Credentials for SMS OTP via Twilio.
- `AWS_*`: S3 credentials for file uploads.
- `RAZORPAY_*`: Payment gateway credentials.

## Folder Structure
- `/`: Project root with Docker configurations and environment files.
- `/database`: Prisma ORM setup, schema definitions, and seed data.

## Available Scripts (in `/database`)
- `npm run generate`: Generate Prisma client.
- `npm run migrate`: Run development migrations.
- `npm run seed`: Seed the database with initial data.
- `npm run studio`: Open Prisma Studio to view database contents.

## API Summary (Placeholder for backend implementation)
- `/api/auth`: User authentication and OTP verification.
- `/api/users`: User profile management.
- `/api/requests`: Manage buddy requests and offers.
- `/api/chat`: Messaging and chat features.
- `/api/payments`: Razorpay integration for membership plans.
