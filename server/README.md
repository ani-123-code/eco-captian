# EcoCaptain Backend Server

Express.js backend server for the EcoCaptain e-waste management platform.

## Features

- MongoDB database with Mongoose ODM
- JWT authentication
- Email service using Gmail OAuth2
- AWS S3 integration for file uploads
- RESTful API endpoints

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `server` directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_CLOUDFRONT_DOMAIN=your_cloudfront_domain
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
GMAIL_USER=your_gmail_user
GMAIL_REDIRECT_URI=your_redirect_uri
APP_NAME=Eco Trade
FRONTEND_URL=http://localhost:5173
```

3. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Captains
- `GET /api/captains` - Get all captains (admin only)
- `POST /api/captains` - Create new captain (admin only)
- `DELETE /api/captains/:id` - Delete captain (admin only)

### E-Waste
- `GET /api/ewaste` - Get all e-waste entries
- `POST /api/ewaste` - Create new e-waste entry
- `PUT /api/ewaste/:id/price` - Update price (admin only)
- `PUT /api/ewaste/:id/pickup` - Schedule pickup (admin only)
- `PUT /api/ewaste/:id/payment` - Process payment (admin only)

### Payments
- `GET /api/payments` - Get all payments

### Analytics
- `GET /api/analytics` - Get analytics data (admin only)

## Database Schema

### User
- email (unique)
- password (hashed)
- full_name
- role (admin/captain)
- balance

### EwasteEntry
- captain_id (ref: User)
- description
- quantity
- location_address
- photos (array of URLs)
- status (Pending/Priced/Pickup Scheduled/Processed/Paid)
- price
- pickup_date
- pickup_notes
- payment_amount

### Payment
- captain_id (ref: User)
- ewaste_id (ref: EwasteEntry)
- amount
- description
