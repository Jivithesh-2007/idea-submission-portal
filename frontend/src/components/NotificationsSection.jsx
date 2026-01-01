import React, { useState } from 'react'
import { MdDelete, MdCheckCircle } from 'react-icons/md'
import styles from '../styles/Dashboard.module.css'

const API_URL = import.meta.env.VITE_API_URL

export default function NotificationsSection({ notifications, onRefresh }) {
  const [deleting, setDeleting] = useState(false)

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        onRefresh()
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const deleteNotification = async (notificationId) => {
    setDeleting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        onRefresh()
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    } finally {
      setDeleting(false)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        onRefresh()
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationColor = (type) => {
    switch(type) {
      case 'idea_approved': return '#10b981'
      case 'idea_rejected': return '#ef4444'
      case 'comment': return '#3b82f6'
      case 'like': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  return (
    <section className={styles.notificationsSection}>
      <div className={styles.sectionHeader}>
        <h2>Notifications</h2>
        {notifications.filter(n => !n.isRead).length > 0 && (
          <button 
            onClick={markAllAsRead}
            className={styles.markAllReadBtn}
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className={styles.notificationsList}>
          {notifications.map((notif) => (
            <div 
              key={notif._id}
              className={`${styles.notificationItemCard} ${!notif.isRead ? styles.unreadCard : ''}`}
            >
              <div className={styles.notifContent}>
                <div className={styles.notifColor} style={{ background: getNotificationColor(notif.type) }}></div>
                <div className={styles.notifText}>
                  <p className={styles.notifMessage}>{notif.message}</p>
                  <small className={styles.notifDate}>
                    {new Date(notif.createdAt).toLocaleDateString()}
                    {' '}
                    at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </small>
                </div>
              </div>
              <div className={styles.notifActions}>
                {!notif.isRead && (
                  <button 
                    onClick={() => markAsRead(notif._id)}
                    className={styles.markReadBtn}
                    title="Mark as read"
                  >
                    <MdCheckCircle size={18} />
                  </button>
                )}
                <button 
                  onClick={() => deleteNotification(notif._id)}
                  disabled={deleting}
                  className={styles.deleteBtn}
                  title="Delete"
                >
                  <MdDelete size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>You don't have any notifications yet</p>
        </div>
      )}
    </section>
  )
}
