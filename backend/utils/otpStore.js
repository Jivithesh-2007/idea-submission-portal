// backend/utils/otpStore.js
import OTP from '../models/OTP.js'

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Save OTP to database
export const saveOTP = async (email, otp) => {
  try {
    // Delete existing OTP for this email
    await OTP.deleteMany({ email })
    
    // Create new OTP
    const newOTP = new OTP({
      email: email.toLowerCase(),
      otp,
    })
    
    await newOTP.save()
    console.log(`OTP saved for ${email}: ${otp}`)
    return newOTP
  } catch (error) {
    console.error('Save OTP Error:', error)
    throw error
  }
}

// Verify OTP
export const verifyOTP = async (email, otp) => {
  try {
    const record = await OTP.findOne({ 
      email: email.toLowerCase(), 
      otp,
      verified: false,
      expiresAt: { $gt: new Date() }
    })
    
    if (!record) {
      return { valid: false, message: 'Invalid or expired OTP' }
    }
    
    // Mark as verified
    record.verified = true
    await record.save()
    
    return { valid: true, message: 'OTP verified successfully' }
  } catch (error) {
    console.error('Verify OTP Error:', error)
    return { valid: false, message: 'OTP verification failed' }
  }
}

// Delete OTP
export const deleteOTP = async (email) => {
  try {
    await OTP.deleteMany({ email: email.toLowerCase() })
    console.log(`OTP deleted for ${email}`)
  } catch (error) {
    console.error('Delete OTP Error:', error)
  }
}
