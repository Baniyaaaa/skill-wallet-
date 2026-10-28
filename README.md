# HotelPro – Hotel Management System (MERN)

Secure, scalable hotel management: rooms, bookings, guests, payments, role-based dashboards.

**Stack:** MongoDB · Express · React (Vite) · Node.js · JWT · Bootstrap

## Quick start
```bash
# 1. Backend
cd backend
cp .env.example .env        # edit MONGO_URI / JWT_SECRET
npm install
npm run seed                # creates admin, staff, sample rooms
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```
Requires Node 16+ and a running MongoDB (local or Atlas).

## Demo logins (after `npm run seed`)
| Role  | Email               | Password  |
|-------|---------------------|-----------|
| Admin | admin@hotelpro.com  | admin123  |
| Staff | staff@hotelpro.com  | staff123  |
Guests register from the UI.

## Epics
1. Authentication & roles (JWT, bcrypt) 2. Room inventory 3. Booking & availability
4. Guest management 5. Payments 6. Admin dashboard & reports

## API summary
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/auth/me | user |
| GET | /api/rooms?checkIn=&checkOut=&type= | public |
| POST/PUT/DELETE | /api/rooms(/:id) | admin |
| POST | /api/bookings | user |
| GET | /api/bookings/mine | user |
| GET | /api/bookings | staff/admin |
| PUT | /api/bookings/:id/cancel | owner/staff |
| PUT | /api/bookings/:id/checkin, /checkout | staff/admin |
| POST | /api/payments | user (owner of booking) |
| GET | /api/payments, /api/payments/mine | staff/admin, user |
| GET/PUT/DELETE | /api/users(/:id) | admin (GET also staff) |
| GET | /api/stats | staff/admin |

Payments are simulated (no real gateway); swap `routes/payments.js` for Stripe/Razorpay when ready.
