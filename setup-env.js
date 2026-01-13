import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Frontend .env file
const frontendEnvPath = join(__dirname, '.env');
const frontendEnvTemplate = `# Frontend Environment Variables
VITE_API_URL=http://localhost:5000/api
VITE_ADMIN_EMAIL=aniketh0701@gmail.com
VITE_ADMIN_PASSWORD=Admin@123
`;

// Backend .env file
const backendEnvPath = join(__dirname, 'server', '.env');
const backendEnvTemplate = `# Environment Configuration
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

console.log('🔧 Setting up environment files...\n');

// Create frontend .env
if (fs.existsSync(frontendEnvPath)) {
  console.log('⚠️  Frontend .env already exists. Skipping...');
} else {
  try {
    fs.writeFileSync(frontendEnvPath, frontendEnvTemplate, 'utf8');
    console.log('✅ Frontend .env created successfully!');
    console.log(`   Location: ${frontendEnvPath}\n`);
  } catch (error) {
    console.error('❌ Error creating frontend .env:', error.message);
  }
}

// Create backend .env
if (fs.existsSync(backendEnvPath)) {
  console.log('⚠️  Backend .env already exists. Skipping...');
} else {
  try {
    // Ensure server directory exists
    const serverDir = join(__dirname, 'server');
    if (!fs.existsSync(serverDir)) {
      fs.mkdirSync(serverDir, { recursive: true });
    }
    
    fs.writeFileSync(backendEnvPath, backendEnvTemplate, 'utf8');
    console.log('✅ Backend .env created successfully!');
    console.log(`   Location: ${backendEnvPath}\n`);
  } catch (error) {
    console.error('❌ Error creating backend .env:', error.message);
  }
}

console.log('✨ Environment setup complete!');
console.log('\n📝 Next steps:');
console.log('   1. Install backend dependencies: cd server && npm install');
console.log('   2. Install frontend dependencies: npm install');
console.log('   3. Start backend: cd server && npm run dev');
console.log('   4. Start frontend: npm run dev');
console.log('\n🔐 Default Admin Login:');
console.log('   Email: aniketh0701@gmail.com');
console.log('   Password: Admin@123\n');
