# EcoCaptain - E-Waste Management Platform

A full-stack application for managing e-waste collection and payments, built with React, TypeScript, Express.js, and MongoDB.

## Features

- **Admin Dashboard**: Manage captains, review e-waste submissions, set prices, schedule pickups, and process payments
- **Captain Dashboard**: Upload e-waste submissions with photos, track status, and view payment history
- **Authentication**: JWT-based authentication with role-based access control
- **File Uploads**: AWS S3 integration for storing e-waste photos
- **Email Notifications**: Gmail OAuth2 integration for sending captain credentials
- **Analytics**: Dashboard with statistics and insights

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- AWS S3 for file storage
- Gmail OAuth2 for email

## Quick Setup

### 1. Setup Environment Variables

Run the automated setup script:

```bash
npm run setup-env
```

This creates all required `.env` files automatically.

### 2. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
npm install
```

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 4. Login

Open `http://localhost:5173` and login with:
- **Email:** `aniketh0701@gmail.com`
- **Password:** `Admin@123`

## Manual Setup

If the setup script doesn't work, see [SETUP.md](./SETUP.md) for detailed manual setup instructions.

## Database

The application uses MongoDB. The database name is `eco-captain-db`.

### Collections
- `users` - User accounts (admins and captains)
- `ewasteentries` - E-waste submissions
- `payments` - Payment transactions

## Environment Variables

See `server/.env` for all required environment variables.

## Project Structure

```
project/
├── server/                 # Backend Express server
│   ├── config/            # Database configuration
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── services/          # Email and S3 services
│   └── server.js          # Server entry point
├── src/                   # Frontend React app
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── lib/               # API client
│   └── pages/             # Page components
└── package.json           # Frontend dependencies
```

## Default Admin Credentials

- Email: `aniketh0701@gmail.com`
- Password: `Admin@123`

## License

MIT
