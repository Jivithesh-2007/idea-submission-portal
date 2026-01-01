import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { FaArrowLeft } from 'react-icons/fa'
import styles from '../styles/Auth.module.css'

const API_URL = import.meta.env.VITE_API_URL

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [emailDomain, setEmailDomain] = useState('karunya.edu.in')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()

  const fullEmail = `${email}@${emailDomain}`

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (!email.trim()) {
        setError('Please enter your username')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/auth/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fullEmail })
      })

      const data = await response.json()

      if (data.success) {
        setMessage('OTP sent to your email! Check your inbox.')
        setStep(2)
      } else {
        setError(data.message || 'Failed to send OTP')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (!otp.trim()) {
        setError('Please enter OTP')
        setLoading(false)
        return
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/auth/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fullEmail,
          otp,
          newPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Password reset successfully! Redirecting to login...')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setError(data.message || 'Failed to reset password')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.authContainer} ${isDarkMode ? styles.darkMode : ''}`}>
      <div className={styles.authFormWrapper}>
        <div className={styles.authHeader}>
          <h1>ClassForge</h1>
          <p>Reset your password</p>
        </div>
        
        <h2>Forgot Password?</h2>
        <p className={styles.authSubtitle}>We'll help you reset it</p>
        
        {error && <div className={styles.authError}>{error}</div>}
        {message && <div className={styles.authSuccess}>{message}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOTP} className={styles.authForm}>
            <div className={styles.authFormGroup}>
              <label htmlFor="email">Username</label>
              <div className={styles.emailInputGroup}>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username"
                  required
                  className={styles.emailInput}
                />
                <select
                  value={emailDomain}
                  onChange={(e) => setEmailDomain(e.target.value)}
                  className={styles.domainSelect}
                >
                  <option value="karunya.edu.in">@ karunya.edu.in</option>
                  <option value="karunya.edu">@ karunya.edu</option>
                </select>
              </div>
              <small className={styles.emailHint}>Student: @karunya.edu.in | Faculty: @karunya.edu</small>
            </div>

            <button type="submit" disabled={loading} className={styles.authSubmitBtn}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className={styles.authForm}>
            <div className={styles.authFormGroup}>
              <label htmlFor="otp">One-Time Password</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                required
              />
              <small className={styles.emailHint}>Check your email for the OTP</small>
            </div>

            <div className={styles.authFormGroup}>
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
              />
            </div>

            <div className={styles.authFormGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className={styles.authSubmitBtn}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1)
                setEmail('')
                setOtp('')
                setNewPassword('')
                setConfirmPassword('')
                setError('')
                setMessage('')
              }}
              className={styles.backBtn}
            >
              Back
            </button>
          </form>
        )}

        <div className={styles.authSignupLink}>
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
