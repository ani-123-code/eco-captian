import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  const accessToken = await oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });

  return transporter;
};

export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = await createTransporter();
    const mailOptions = {
      from: `"${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export const sendCaptainCredentials = async (email, password, name, locality = '', society = '') => {
  const subject = 'Welcome to EcoCaptain - Your Account Credentials';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
        .credentials { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981; }
        .credential-item { margin: 15px 0; }
        .label { font-weight: bold; color: #6b7280; display: block; margin-bottom: 5px; }
        .value { color: #111827; font-size: 16px; padding: 8px; background-color: #f3f4f6; border-radius: 4px; }
        .info-box { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌱 Welcome to EcoCaptain!</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>Your captain account has been created successfully! You can now start managing e-waste collections in your area.</p>
          
          ${locality || society ? `
          <div class="info-box">
            <strong>Your Assignment:</strong><br>
            ${locality ? `📍 Locality: ${locality}<br>` : ''}
            ${society ? `🏘️ Society: ${society}` : ''}
          </div>
          ` : ''}
          
          <div class="credentials">
            <h3 style="margin-top: 0; color: #10b981;">Your Login Credentials:</h3>
            <div class="credential-item">
              <span class="label">Email:</span>
              <div class="value">${email}</div>
            </div>
            <div class="credential-item">
              <span class="label">Password:</span>
              <div class="value">${password}</div>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}" class="button">Login to Dashboard</a>
          </div>
          
          <div class="info-box">
            <strong>📋 Next Steps:</strong>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>Log in to your dashboard using the credentials above</li>
              <li>Add your UPI ID for receiving payments</li>
              <li>Start uploading e-waste items for collection</li>
              <li>Track your submissions and payments</li>
            </ol>
          </div>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br><strong>The EcoCaptain Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

export const sendEwasteStatusUpdate = async (email, name, ewasteDescription, status, additionalInfo = {}) => {
  const statusMessages = {
    'Pending': 'Your e-waste submission has been received and is pending review.',
    'Reviewed': 'Your e-waste has been reviewed by our team.',
    'Priced': `Your e-waste has been priced at ₹${additionalInfo.price || 'N/A'}.`,
    'Collection Planned': `Collection has been planned for ${additionalInfo.collectionDate || 'your area'}.`,
    'Pickup Scheduled': `Pickup has been scheduled for ${additionalInfo.pickupDate || 'your area'}.`,
    'Collected': 'Your e-waste has been successfully collected.',
    'Processed': 'Your e-waste has been processed.',
    'Payment Initiated': `Payment of ₹${additionalInfo.paymentAmount || 'N/A'} has been initiated.`,
    'Paid': `Payment of ₹${additionalInfo.paymentAmount || 'N/A'} has been completed and credited to your account.`,
  };

  const subject = `EcoCaptain: E-Waste Status Update - ${status}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
        .status-box { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981; }
        .info-item { margin: 10px 0; }
        .label { font-weight: bold; color: #6b7280; }
        .value { color: #111827; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 E-Waste Status Update</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>${statusMessages[status] || 'Your e-waste submission status has been updated.'}</p>
          
          <div class="status-box">
            <div class="info-item">
              <span class="label">Item Description:</span>
              <div class="value">${ewasteDescription}</div>
            </div>
            <div class="info-item">
              <span class="label">Current Status:</span>
              <div class="value"><strong>${status}</strong></div>
            </div>
            ${additionalInfo.price ? `
            <div class="info-item">
              <span class="label">Price:</span>
              <div class="value">₹${additionalInfo.price}</div>
            </div>
            ` : ''}
            ${additionalInfo.collectionDate ? `
            <div class="info-item">
              <span class="label">Collection Date:</span>
              <div class="value">${new Date(additionalInfo.collectionDate).toLocaleDateString()}</div>
            </div>
            ` : ''}
            ${additionalInfo.paymentAmount ? `
            <div class="info-item">
              <span class="label">Payment Amount:</span>
              <div class="value">₹${additionalInfo.paymentAmount}</div>
            </div>
            ` : ''}
            ${additionalInfo.notes ? `
            <div class="info-item">
              <span class="label">Notes:</span>
              <div class="value">${additionalInfo.notes}</div>
            </div>
            ` : ''}
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}" class="button">View Dashboard</a>
          </div>
          
          <p>Thank you for your contribution to a cleaner environment!</p>
          
          <p>Best regards,<br><strong>The EcoCaptain Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

export const sendRegistrationConfirmation = async (email, name) => {
  const subject = 'EcoCaptain: Registration Request Received';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
        .info-box { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌱 Registration Request Received</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>Thank you for your interest in becoming an EcoCaptain!</p>
          
          <div class="info-box">
            <p><strong>Your registration request has been received and is under review.</strong></p>
            <p>Our team will contact you soon to complete the registration process and provide you with your login credentials.</p>
          </div>
          
          <p>We appreciate your commitment to environmental sustainability and look forward to working with you!</p>
          
          <p>Best regards,<br><strong>The EcoCaptain Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

export const sendPaymentNotification = async (email, name, amount, description) => {
  const subject = `EcoCaptain: Payment of ₹${amount} Completed`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
        .payment-box { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981; text-align: center; }
        .amount { font-size: 32px; font-weight: bold; color: #10b981; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Payment Received</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>Great news! Your payment has been processed successfully.</p>
          
          <div class="payment-box">
            <div style="color: #6b7280; margin-bottom: 10px;">Payment Amount</div>
            <div class="amount">₹${amount}</div>
            ${description ? `<div style="color: #6b7280; margin-top: 10px;">${description}</div>` : ''}
          </div>
          
          <p>The payment has been credited to your account balance. You can view your updated balance in your dashboard.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}" class="button">View Dashboard</a>
          </div>
          
          <p>Thank you for your continued partnership with EcoCaptain!</p>
          
          <p>Best regards,<br><strong>The EcoCaptain Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};
