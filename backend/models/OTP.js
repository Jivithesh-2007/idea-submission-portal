// backend/models/OTP.js
import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 10 * 60 * 1000, // 10 minutes
    expires: '10m', // Auto-delete after 10 min
  },
}, {
  timestamps: true,
})

// Fix: Check if model exists before creating
const OTP = mongoose.models.OTP || mongoose.model('OTP', otpSchema)

export default OTP
