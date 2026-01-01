// backend/services/emailService.js - CORRECTED
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// FIXED: createTransport (NOT createTransporter)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export const sendOTPEmail = async (to, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: to,
      subject: 'ClassForge - Your OTP for Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🔐 ClassForge Password Reset</h2>
          <div style="background: #f8fafc; padding: 30px; border-radius: 12px;">
            <h3 style="color: #1e293b;">Your OTP Code:</h3>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; font-size: 36px; font-weight: bold; 
                        text-align: center; padding: 25px; 
                        border-radius: 16px; letter-spacing: 10px; 
                        margin: 25px 0; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
            <p style="color: #64748b;">
              <strong>Valid for 10 minutes only.</strong><br>
              Use this code to reset your password.
            </p>
            <div style="text-align: center;">
              <a href="http://localhost:5173/forgot-password" 
                 style="background: #10b981; color: white; padding: 14px 36px; 
                        text-decoration: none; border-radius: 10px; 
                        font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </div>
          </div>
          <p style="color: #94a3b8; text-align: center; font-size: 14px;">
            © 2026 ClassForge
          </p>
        </div>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`✅ OTP email sent to: ${to}`)
    return result
  } catch (error) {
    console.error('❌ Email error:', error.message)
    throw new Error('Failed to send OTP email')
  }
}
