import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '.env');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists. Skipping creation.');
  console.log('   If you want to recreate it, delete the existing file first.\n');
  process.exit(0);
}

// Create .env file with template
const envTemplate = `# Environment Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb+srv://aniketh:Aniketh%40123@ecotrade.nfr9772.mongodb.net/eco-captain-db?retryWrites=true&w=majority&appName=ecotrade

# JWT Configuration
JWT_SECRET=SarvinSecretKeyIYBGJhhhJ3fd
JWT_EXPIRE=7d

# Admin Configuration
ADMIN_EMAIL=aniketh0701@gmail.com
ADMIN_PASSWORD=Admin@123

# AWS S3 & CloudFront Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=ecodispose-images-bucket
AWS_CLOUDFRONT_DOMAIN=https://d7vynzspib3jv.cloudfront.net

# Payment Gateway Configuration
RAZORPAY_KEY_ID=rzp_live_RQAemVx0dSjSca
RAZORPAY_KEY_SECRET=uxqOh4VC2x1OIgUH59xWA3ps

# Gmail OAuth2 Credentials
GMAIL_CLIENT_ID=1080913491397-pd9r7k39qq72l6dhavpkkjauasplsd90.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=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
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
GMAIL_USER=team@eco-dispose.com
GMAIL_REDIRECT_URI=https://developers.google.com/oauthplayground

# Application Configuration
APP_NAME=Eco Trade
FRONTEND_URL=http://localhost:5173
`;

try {
  fs.writeFileSync(envPath, envTemplate, 'utf8');
  console.log('✅ .env file created successfully!');
  console.log(`   Location: ${envPath}\n`);
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}
