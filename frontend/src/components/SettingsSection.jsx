import React, { useState } from 'react'
import { MdSave, MdEdit } from 'react-icons/md'
import styles from '../styles/Dashboard.module.css'

const API_URL = import.meta.env.VITE_API_URL

export default function SettingsSection({ user, onUpdate, onRefresh }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [editMode, setEditMode] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        onUpdate(data.user)
        setSuccess('Profile updated successfully!')
        setEditMode(false)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to update profile')
      }
    } catch (err) {
      setError('Failed to update profile')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('Password changed successfully!')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setShowPasswordForm(false)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to change password')
      }
    } catch (err) {
      setError('Failed to change password')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={styles.settingsSection}>
      <h2>Settings</h2>

      {error && <div className={styles.submitError}>{error}</div>}
      {success && <div className={styles.submitSuccess}>{success}</div>}

      {/* PROFILE SETTINGS */}
      <div className={styles.settingsCard}>
        <div className={styles.settingsCardHeader}>
          <h3>Profile Settings</h3>
          {!editMode && (
            <button 
              onClick={() => setEditMode(true)}
              className={styles.editBtn}
            >
              <MdEdit size={16} /> Edit Profile
            </button>
          )}
        </div>

        {editMode ? (
          <form onSubmit={handleSaveProfile} className={styles.settingsForm}>
            <div className={styles.settingsFormGroup}>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className={styles.settingsFormGroup}>
              <label htmlFor="department">Department</label>
              <input
                id="department"
                type="text"
                name="department"
                value={formData.department}
                onChange={handleProfileChange}
              />
            </div>

            <div className={styles.settingsFormGroup}>
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleProfileChange}
                rows="4"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className={styles.settingsFormGroup}>
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleProfileChange}
              />
            </div>

            <div className={styles.settingsButtonGroup}>
              <button type="submit" disabled={loading} className={styles.saveBtn}>
                <MdSave size={16} /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button"
                onClick={() => setEditMode(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.profileDisplay}>
            <div className={styles.profileField}>
              <strong>Name:</strong>
              <p>{formData.name}</p>
            </div>
            <div className={styles.profileField}>
              <strong>Email:</strong>
              <p>{user?.email}</p>
            </div>
            <div className={styles.profileField}>
              <strong>Department:</strong>
              <p>{formData.department || 'Not set'}</p>
            </div>
            <div className={styles.profileField}>
              <strong>Bio:</strong>
              <p>{formData.bio || 'No bio added'}</p>
            </div>
            <div className={styles.profileField}>
              <strong>Phone:</strong>
              <p>{formData.phone || 'Not set'}</p>
            </div>
          </div>
        )}
      </div>

      {/* SECURITY SETTINGS */}
      <div className={styles.settingsCard}>
        <div className={styles.settingsCardHeader}>
          <h3>Security Settings</h3>
        </div>

        {!showPasswordForm ? (
          <button 
            onClick={() => setShowPasswordForm(true)}
            className={styles.changePasswordBtn}
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handleChangePassword} className={styles.settingsForm}>
            <div className={styles.settingsFormGroup}>
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your current password"
                required
              />
            </div>

            <div className={styles.settingsFormGroup}>
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password (min 6 characters)"
                required
              />
            </div>

            <div className={styles.settingsFormGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                required
              />
            </div>

            <div className={styles.settingsButtonGroup}>
              <button type="submit" disabled={loading} className={styles.saveBtn}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              <button 
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ACCOUNT PREFERENCES */}
      <div className={styles.settingsCard}>
        <div className={styles.settingsCardHeader}>
          <h3>Preferences</h3>
        </div>

        <div className={styles.preferenceItem}>
          <h4>Theme</h4>
          <p>Light/Dark mode is managed from the top navigation bar</p>
        </div>

        <div className={styles.preferenceItem}>
          <h4>Email Notifications</h4>
          <p>Notifications are currently managed through the notifications section</p>
        </div>

        <div className={styles.preferenceItem}>
          <h4>Account</h4>
          <p>Account created on {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
        </div>
      </div>
    </section>
  )
}
