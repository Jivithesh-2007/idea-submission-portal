// backend/controllers/authController.js
import User from '../models/User.js'
import { generateOTP, saveOTP, verifyOTP, deleteOTP } from '../utils/otpStore.js'
import { sendOTPEmail } from '../services/emailService.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Forgot Password - Send OTP
export const forgotPasswordSendOTP = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      })
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found with this email' 
      })
    }

    // Generate OTP
    const otp = generateOTP()
    console.log(`Generated OTP for ${email}:`, otp)

    // Save OTP
    saveOTP(email, otp)

    // Send OTP via email
    await sendOTPEmail(email, otp)

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email successfully',
    })
  } catch (error) {
    console.error('Forgot Password Error:', error)
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send OTP' 
    })
  }
}

// Forgot Password - Verify OTP and Reset
export const forgotPasswordReset = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, OTP, and new password are required' 
      })
    }

    // Verify OTP
    const otpVerification = verifyOTP(email, otp)
    if (!otpVerification.valid) {
      return res.status(400).json({ 
        success: false, 
        message: otpVerification.message 
      })
    }

    // Find user and update password
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    await user.save()

    // Clear OTP
    deleteOTP(email)

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    })
  } catch (error) {
    console.error('Password Reset Error:', error)
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to reset password' 
    })
  }
}
