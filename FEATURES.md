# EcoCaptain - Complete Feature List

## ✅ Implemented Features

### Admin Features

1. **Captain Management**
   - Create captain profiles with:
     - Full name, email, password
     - Locality assignment
     - Society/Area assignment
     - Phone number
   - View all captains with locality and society info
   - Delete captains
   - Automatic email with credentials sent to new captains

2. **E-Waste Management**
   - View all e-waste submissions from captains
   - Review submissions with photos (max 3 images)
   - Set pricing for e-waste items
   - Plan collection with:
     - Collection date and time
     - Collection notes
     - Collection steps
   - Schedule pickup
   - Update status through workflow:
     - Pending → Reviewed → Priced → Collection Planned → Pickup Scheduled → Collected → Processed → Payment Initiated → Paid
   - Add admin notes for each entry
   - Process payments and update captain balance

3. **Analytics Dashboard**
   - Total e-waste entries
   - Total weight collected
   - Total payments made
   - Active captains count
   - Last 7 days activity
   - Status breakdown

### Captain Features

1. **Profile Management**
   - View personal information (name, email, locality, society)
   - Add/Update UPI ID for receiving payments
   - View account balance
   - UPI ID validation

2. **E-Waste Upload**
   - Upload e-waste submissions with:
     - Description
     - Quantity/Weight (kg)
     - Location address
     - Photos (maximum 3 images, stored in AWS S3)
   - Real-time validation for image limits

3. **E-Waste History**
   - View all submitted e-waste entries
   - Track status of each submission
   - View pricing information
   - See collection and pickup details
   - View payment information

4. **Payment History**
   - View all payments received
   - See current balance
   - Track payment dates and descriptions

### Email Notifications

1. **Captain Credentials Email**
   - Sent when admin creates a new captain
   - Includes login credentials
   - Shows assigned locality and society
   - Provides next steps guide

2. **Status Update Emails**
   - Sent to captain when e-waste status changes
   - Includes current status and relevant details
   - Different templates for each status:
     - Pending
     - Reviewed
     - Priced (with price amount)
     - Collection Planned (with collection date/time)
     - Pickup Scheduled (with pickup date)
     - Collected
     - Processed
     - Payment Initiated
     - Paid (with payment amount)

3. **Payment Notification Email**
   - Sent when payment is completed
   - Shows payment amount
   - Includes payment description

### Technical Features

1. **Authentication**
   - JWT-based authentication
   - Role-based access control (Admin/Captain)
   - Secure password hashing with bcrypt

2. **File Upload**
   - AWS S3 integration
   - CloudFront CDN for image delivery
   - Maximum 3 images per e-waste entry
   - Image validation

3. **Database**
   - MongoDB with Mongoose ODM
   - Database: `eco-captain-db`
   - Collections: users, ewasteentries, payments
   - Automatic balance updates on payment

4. **API Endpoints**
   - `/api/auth` - Authentication
   - `/api/captains` - Captain management
   - `/api/ewaste` - E-waste management
   - `/api/payments` - Payment history
   - `/api/analytics` - Analytics data
   - `/api/profile` - Profile management

## Workflow

### E-Waste Collection Workflow

1. **Captain Uploads E-Waste**
   - Captain logs in
   - Uploads e-waste with description, quantity, location, and photos (max 3)
   - Status: `Pending`

2. **Admin Reviews**
   - Admin sees new submission
   - Can update status to `Reviewed`
   - Email sent to captain

3. **Admin Sets Price**
   - Admin reviews and sets price
   - Status: `Priced`
   - Email sent to captain with price

4. **Admin Plans Collection**
   - Admin sets collection date, time, notes, and steps
   - Status: `Collection Planned`
   - Email sent to captain with collection details

5. **Admin Schedules Pickup**
   - Admin schedules actual pickup
   - Status: `Pickup Scheduled`
   - Email sent to captain

6. **Collection Completed**
   - Admin updates status to `Collected`
   - Email sent to captain

7. **Processing**
   - Admin updates status to `Processed`
   - Email sent to captain

8. **Payment Processing**
   - Admin initiates payment (status: `Payment Initiated`)
   - Admin processes payment externally
   - Admin updates status to `Paid` with payment amount
   - Captain balance updated automatically
   - Payment notification email sent to captain

## Status Flow

```
Pending → Reviewed → Priced → Collection Planned → Pickup Scheduled → Collected → Processed → Payment Initiated → Paid
```

## Environment Variables

### Backend (server/.env)
- MongoDB connection
- JWT configuration
- Admin credentials
- AWS S3 credentials
- Gmail OAuth2 credentials

### Frontend (.env)
- API URL
- Admin email (for reference)

## Security

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation
- UPI ID format validation
- File upload validation (max 3 images, image types only)
