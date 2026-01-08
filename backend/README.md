# Stellar Backend

Simple, production-ready Node.js + Express + PostgreSQL backend with JWT authentication and role-based access control (RBAC). Plain JavaScript, clean structure, minimal abstractions.

## Tech
- Node.js, Express.js
- PostgreSQL (pg)
- JWT (jsonwebtoken)
- Bcrypt for password hashing
- Helmet, CORS, morgan, basic rate limiting

## Folder Structure
```
backend/
├─ src/
│  ├─ config/
│  │  └─ db.js
│  ├─ middleware/
│  │  ├─ auth.middleware.js
│  │  └─ role.middleware.js
│  ├─ controllers/
│  │  ├─ auth.controller.js
│  │  ├─ admin.controller.js
│  │  ├─ store.controller.js
│  │  └─ user.controller.js
│  ├─ routes/
│  │  ├─ auth.routes.js
│  │  ├─ admin.routes.js
│  │  ├─ store.routes.js
│  │  └─ user.routes.js
│  ├─ app.js
│  └─ server.js
├─ .env
├─ package.json
└─ README.md
```

## Environment Variables (.env)
```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/stellar_db
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
```

## PostgreSQL Schema
Run these commands in your database (e.g., psql):

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin','store_owner','user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores (owner_id);
```

## API
Base URL: `http://localhost:5000`

- Auth
  - POST `/api/auth/register`
  - POST `/api/auth/login`
- Admin
  - GET `/api/admin/dashboard`
  - GET `/api/admin/users`
  - GET `/api/admin/stores`
- Store Owner
  - GET `/api/store/dashboard`
  - POST `/api/store/create`
  - GET `/api/store/my-stores`
- User
  - GET `/api/user/dashboard`

### Auth Notes
- Passwords are hashed with bcrypt.
- On login/register, a JWT is returned.
- The frontend must send the JWT on protected requests using the Authorization header:
  `Authorization: Bearer <token>`

## How to Run Locally
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create the PostgreSQL database and run the SQL schema above.
3. Create a `.env` from the example values and set `DATABASE_URL` and `JWT_SECRET`.
4. Start the server:
   ```bash
   npm run dev  # or npm start
   ```
5. Health check at `GET /api/health` should return `{ status: "ok" }`.

## Roles in 4–5 lines
- Every authenticated request is first validated by JWT middleware.
- `authorize('admin')` allows only admin users into admin routes.
- `authorize('store_owner')` allows only store owners into store routes.
- `authorize('user')` allows only regular users into user routes.
- Roles are embedded in the JWT; changing roles requires updating the user in the DB and issuing a new token.

## Notes
- Uses async/await throughout and returns proper HTTP status codes.
- No hard-coded secrets; all sensitive values are in environment vars.
- Minimal, readable controllers and routes; no unnecessary abstractions.
