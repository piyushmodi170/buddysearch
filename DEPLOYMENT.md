# BuddySearch — MongoDB Production Deployment Guide

This guide covers the deployment procedure for **BuddySearch** in production environments using **MongoDB** (MongoDB Atlas or Docker MongoDB), Redis, Express, and Next.js.

---

## 🚀 1. Quick Start: Single-Command Docker Compose

### Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)

### Steps
1. **Clone the Repository & Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env and supply your MongoDB URL and secret keys
   ```

2. **Launch Services**:
   ```bash
   docker-compose up -d --build
   ```

3. **Run Database Push & Seed**:
   ```bash
   docker exec -it buddysearch-backend npx prisma db push --schema=./database/prisma/schema.prisma
   docker exec -it buddysearch-backend npx prisma db seed --schema=./database/prisma/schema.prisma
   ```

4. **Verify Running Containers**:
   ```bash
   docker-compose ps
   ```
   - **Frontend**: `http://localhost:3000`
   - **Backend API**: `http://localhost:4000/api/health`

---

## 🌐 2. Cloud Architecture Options (MongoDB Atlas)

### Setting up MongoDB Atlas
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and allow your server IP or `0.0.0.0/0`.
3. Copy the connection string: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/buddysearch?retryWrites=true&w=majority`.
4. Set `DATABASE_URL` in your backend deployment configuration.

---

## 🔒 3. Production Security Checklist

- [x] **MongoDB Credentials**: `DATABASE_URL` uses authentication credentials and secure Atlas / Docker params.
- [x] **HTTPS / SSL**: SSL enabled via Cloudflare, Nginx Reverse Proxy, or AWS ALB.
- [x] **CORS Restricted**: `FRONTEND_URL` strictly matched in Express backend middleware.
- [x] **Rate Limiting**: Express rate limiter enabled (100 requests per 15 min window).
- [x] **Razorpay Webhook Hardening**: HMAC SHA256 signature verification enabled on all payments.
