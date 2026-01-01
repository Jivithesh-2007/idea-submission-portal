import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/ThemeContext'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import styles from '../styles/Auth.module.css'

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
  })
  const [emailDomain, setEmailDomain] = useState('karunya.edu.in')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Please enter your full name')
      return
    }

    if (!formData.email.trim()) {
      setError('Please enter your username')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const fullEmail = `${formData.email}@${emailDomain}`
      await signup(formData.name, fullEmail, formData.password, formData.department)
      navigate('/student-dashboard')
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.authContainer} ${isDarkMode ? styles.darkMode : ''}`}>
      <div className={styles.authFormWrapper}>
        <div className={styles.authHeader}>
          <h1>ClassForge</h1>
          <p>Join and share your innovative ideas</p>
        </div>

        <h2>Create Account</h2>
        <p className={styles.authSubtitle}>Sign up to start submitting your ideas</p>

        {error && <div className={styles.authError}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.authFormGroup}>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          <div className={styles.authFormGroup}>
            <label htmlFor="email">Username</label>
            <div className={styles.emailInputGroup}>
              <input
                id="email"
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
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

          <div className={styles.authFormGroup}>
            <label htmlFor="department">Department</label>
            <input
              id="department"
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., Computer Science"
            />
          </div>

          <div className={styles.authFormGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.passwordInputGroup}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeToggle}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.authFormGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className={styles.passwordInputGroup}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.eyeToggle}
              >
                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.authSubmitBtn}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.authSignupLink}>
          Already have an account? <Link to="/login">Sign In →</Link>
        </div>
      </div>
    </div>
  )
}
