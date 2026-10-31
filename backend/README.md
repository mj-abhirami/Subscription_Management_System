# SUBSIGHT Backend (Member 2)

Node.js + Express + PostgreSQL backend for the SUBSIGHT hackathon project.

## 1. Requirements
- Node.js 18+
- PostgreSQL 14+
- npm

## 2. Install
```bash
npm install
```

Copy `.env.example` to `.env` and update `DATABASE_URL` and `JWT_SECRET`.

## 3. Create database and schema
Create the database:
```sql
CREATE DATABASE subsight_db;
```
Then run the schema:
```bash
psql -d subsight_db -f database/schema.sql
```
Alternatively, open `database/schema.sql` in pgAdmin Query Tool connected to `subsight_db` and execute it.

## 4. Start server
```bash
npm run dev
```
Health check: `GET http://localhost:5000/api/health`

## 5. API conventions
All responses:
```json
{"success":true,"message":"...","data":{}}
```
Errors:
```json
{"success":false,"message":"...","data":null}
```
Send `Authorization: Bearer <token>` on protected routes.

## 6. Endpoints
- `POST /api/auth/register` (public; creates customer)
- `POST /api/auth/login` (public)
- `GET /api/auth/me` (authenticated)
- `GET/POST /api/products`
- `PUT/DELETE /api/products/:id`
- `GET/POST /api/plans`
- `PUT /api/plans/:id`
- `GET/POST /api/subscriptions`
- `PATCH /api/subscriptions/:id/status`
- `GET/POST /api/invoices`
- `POST /api/invoices/generate-due`
- `GET/POST /api/payments`
- `GET/POST /api/discounts`

## 7. Create an admin account
Public registration deliberately only creates `customer` accounts. Register a user, then promote the first account to admin directly in PostgreSQL:
```sql
UPDATE users SET role='admin' WHERE email='your-admin@example.com';
```
Do not expose role selection on public registration.

## 8. Important implementation notes
- Invoice generation is protected and uses a unique `(subscription_id, billing_period_start)` constraint to prevent duplicate billing for a period.
- Payment recording locks the invoice row, rejects overpayments, and updates `amount_paid` and invoice status in one transaction.
- Customer list queries are scoped to the authenticated customer.
- For a real production system, add stronger lifecycle transition rules, pagination, rate limiting, audit logging, automated tests, payment gateway verification and a proper billing scheduler.
- This is a hackathon MVP. Have Member 3 implement `/api/dashboard`, `/api/analytics`, `/api/renewals` and `/api/customer-health` using this schema.
