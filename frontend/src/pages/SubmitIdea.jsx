import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { MdArrowBack } from 'react-icons/md'
import styles from '../styles/SubmitIdea.module.css'

const API_URL = import.meta.env.VITE_API_URL

export default function SubmitIdea() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: 'AI/ML',
    tags: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()

  const domains = [
    'AI/ML',
    'Web Development',
    'Mobile Development',
    'IoT',
    'Robotics',
    'Blockchain',
    'Cloud Computing',
    'Other',
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (formData.description.length < 50) {
      setError('Description must be at least 50 characters')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('You must be logged in to submit an idea')
        navigate('/login')
        return
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        domain: formData.domain,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      }

      console.log('Submitting idea:', payload)

      const response = await fetch(`${API_URL}/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit idea')
      }

      setSuccess('Idea submitted successfully!')
      setFormData({
        title: '',
        description: '',
        domain: 'AI/ML',
        tags: '',
      })

      setTimeout(() => {
        navigate('/student-dashboard')
      }, 1500)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message || 'Failed to submit idea. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.submitContainer} ${isDarkMode ? styles.darkMode : ''}`}>
      <div className={styles.submitFormWrapper}>
        <div className={styles.submitHeader}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            <MdArrowBack size={20} /> Back
          </button>
          <div>
            <h1>Share Your Innovative Idea</h1>
            <p>Help shape the future with your creativity</p>
          </div>
        </div>

        {error && <div className={styles.submitError}>{error}</div>}
        {success && <div className={styles.submitSuccess}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.submitForm}>
          <div className={styles.submitFormGroup}>
            <label htmlFor="title">
              Idea Title <span className={styles.required}>*</span>
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Give your idea a catchy, descriptive title"
              maxLength="200"
              required
            />
            <small>{formData.title.length}/200 characters</small>
          </div>

          <div className={styles.submitFormGroup}>
            <label htmlFor="domain">
              Domain <span className={styles.required}>*</span>
            </label>
            <select
              id="domain"
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              required
            >
              {domains.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.submitFormGroup}>
            <label htmlFor="description">
              Description <span className={styles.required}>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your idea in detail. Explain what the idea is, why it's valuable, and how it could be implemented."
              rows="8"
              minLength="50"
              maxLength="5000"
              required
            />
            <small>
              {formData.description.length}/5000 characters (minimum 50)
            </small>
          </div>

          <div className={styles.submitFormGroup}>
            <label htmlFor="tags">Tags (Optional)</label>
            <input
              id="tags"
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., innovation, sustainable, technology (comma separated)"
            />
          </div>

          <div className={styles.submitButtonGroup}>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Submitting...' : 'Submit Idea'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>
        </form>

        <div className={styles.guideline}>
          <h3>Tips for a great submission</h3>
          <ul>
            <li>Be clear and concise with your title</li>
            <li>Provide detailed information about your idea</li>
            <li>Explain the benefits and potential impact</li>
            <li>Add relevant tags for better discovery</li>
            <li>Be specific and avoid vague descriptions</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
