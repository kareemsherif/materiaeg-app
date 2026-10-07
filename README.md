# MATERIA – Premium Artificial Leather

Official website for MATERIA (https://materiaeg.com) – Egypt's leading manufacturer and supplier of premium artificial leather (PVC leather).

## Technologies Used

- Vite
- React 18 & TypeScript
- Tailwind CSS & Lucide Icons
- shadcn/ui
- PHP Backend API (`/public/api`) & MySQL

## Development Setup

```sh
# Install dependencies
npm install

# Start local development server
npm run dev

# Type-check
npm run typecheck

# Build for production
npm run build
```

## Backend API & Deployment (`public/api` → `/api`)

The PHP backend needs a secrets file that is **never committed to git**:

```sh
# On the server (or locally for testing):
cp public/api/config.secrets.example.php public/api/config.secrets.php
# then edit config.secrets.php with the real DB credentials,
# a long random API_SECRET_KEY, and a strong ADMIN_PASSWORD
```

Database setup (run once, in order):

1. Create the database and import `materia_db.sql`, **or**
2. Open `https://your-domain.com/api/seed.php` in the browser to create
   tables and seed products/settings/default industries.
   Re-running seed on a non-empty database requires `?key=YOUR_ADMIN_PASSWORD`.

Security notes:

- `config.secrets.php` is git-ignored — never commit real credentials.
- Admin login is rate-limited (5 failed attempts → 15-minute lockout).
- Admin JWT tokens expire after 7 days.
- If credentials were ever committed to version control, **rotate them**:
  change the DB password, set a new `API_SECRET_KEY`, and set a new
  `ADMIN_PASSWORD` (old tokens become invalid immediately).
