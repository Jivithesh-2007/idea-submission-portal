import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'ClassForge - Your OTP for Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #1976d2; text-align: center; margin-bottom: 30px;">ClassForge</h2>
            
            <h3 style="color: #333; margin-bottom: 15px;">Password Reset Request</h3>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You requested to reset your password. Use the OTP below to complete the process.
            </p>
            
            <div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 20px; margin: 30px 0; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px; margin-bottom: 10px;">Your One-Time Password:</p>
              <p style="margin: 0; font-size: 32px; font-weight: bold; color: #1976d2; letter-spacing: 5px;">${otp}</p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              <strong>⏱️ This OTP will expire in 10 minutes.</strong>
            </p>
            
            <p style="color: #999; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              If you didn't request this password reset, please ignore this email or contact support immediately.
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 15px; text-align: center;">
              © 2026 ClassForge. All rights reserved.
            </p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log('OTP email sent successfully to:', email)
    return true
  } catch (error) {
    console.error('Email sending error:', error)
    throw new Error('Failed to send OTP email: ' + error.message)
  }
}
