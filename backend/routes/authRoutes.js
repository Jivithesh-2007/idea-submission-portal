// backend/routes/authRoutes.js
import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import OTP from '../models/OTP.js'
import { sendOTPEmail } from '../services/emailService.js'
import {
  forgotPasswordSendOTP,
  forgotPasswordReset,
} from '../controllers/authController.js'

const router = express.Router()

// Function to generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ========== SIGNUP OTP FLOW ==========

// Step 1: Send OTP for signup
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      })
    }

    // Delete old OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() })

    // Generate new OTP
    const otp = generateOTP()

    // Save OTP to database
    await OTP.create({
      email: email.toLowerCase(),
      otp,
    })

    // Send OTP via email
    const emailSent = await sendOTPEmail(email.toLowerCase(), otp)

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
      })
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
      email: email.toLowerCase(),
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Step 2: Verify OTP for signup
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      })
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ email: email.toLowerCase(), otp })

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      })
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id })
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      })
    }

    // OTP verified - mark it as verified
    otpRecord.verified = true
    await otpRecord.save()

    res.json({
      success: true,
      message: 'OTP verified successfully',
      email: email.toLowerCase(),
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Step 3: Signup (after OTP verification)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, department, otp } = req.body

    // Validate input
    if (!name || !email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      })
    }

    // Verify OTP first
    const otpRecord = await OTP.findOne({ email: email.toLowerCase(), otp })
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      })
    }

    // Determine role based on email domain
    let role = 'student'
    if (email.includes('@karunya.edu') && !email.includes('@karunya.edu.in')) {
      role = 'faculty'
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      department,
      role,
    })

    await user.save()

    // Delete OTP after successful signup
    await OTP.deleteOne({ _id: otpRecord._id })

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      token,
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// ========== LOGIN ==========

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    )
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        bio: user.bio,
        phone: user.phone,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// ========== FORGOT PASSWORD OTP FLOW ==========

router.post('/forgot-password/send-otp', forgotPasswordSendOTP)
router.post('/forgot-password/reset', forgotPasswordReset)

export default router
