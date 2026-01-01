import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/ThemeContext'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import styles from '../styles/Auth.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [emailDomain, setEmailDomain] = useState('karunya.edu.in')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()

  const fullEmail = `${email}@${emailDomain}`

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email.trim()) {
        setError('Please enter your username')
        setLoading(false)
        return
      }

      if (!password.trim()) {
        setError('Please enter your password')
        setLoading(false)
        return
      }

      const response = await login(fullEmail, password)

      if (response.user.role === 'faculty') {
        navigate('/teacher-dashboard')
      } else {
        navigate('/student-dashboard')
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.authContainer} ${isDarkMode ? styles.darkMode : ''}`}>
      <div className={styles.authFormWrapper}>
        <div className={styles.authHeader}>
          <h1>ClassForge</h1>
          <p>Manage and share your innovative ideas</p>
        </div>
        
        <h2>Welcome back</h2>
        <p className={styles.authSubtitle}>Login to your account</p>
        
        {error && <div className={styles.authError}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.authForm}>
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

          <div className={styles.authFormGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.passwordInputGroup}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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

          <Link to="/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </Link>

          <button type="submit" disabled={loading} className={styles.authSubmitBtn}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.authSignupLink}>
          New to ClassForge? <Link to="/signup">Create Account →</Link>
        </div>
      </div>
    </div>
  )
}
