import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/ThemeContext'
import IdeaPreviewModal from '../components/IdeaPreviewModal'
import ProfileModal from '../components/ProfileModal'
import NotificationsSection from '../components/NotificationsSection'
import SettingsSection from '../components/SettingsSection'
import { MdDashboard, MdAdd, MdExplore, MdNotes, MdNotifications, MdSettings, MdLogout } from 'react-icons/md'
import { FaBell, FaUser, FaMoon, FaSun } from 'react-icons/fa'
import styles from '../styles/Dashboard.module.css'

const API_URL = import.meta.env.VITE_API_URL

export default function StudentDashboard() {
  const { user, logout, updateUser } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [ideas, setIdeas] = useState([])
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedIdea, setSelectedIdea] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        navigate('/login')
        return
      }

      const headers = { 'Authorization': `Bearer ${token}` }

      const [statsRes, ideasRes, notificationsRes] = await Promise.all([
        fetch(`${API_URL}/users/dashboard/stats`, { headers })
          .then(r => {
            if (r.status === 401) {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              navigate('/login')
              throw new Error('Token expired')
            }
            return r.json()
          }),
        fetch(`${API_URL}/ideas`, { headers })
          .then(r => r.json()),
        fetch(`${API_URL}/notifications`, { headers })
          .then(r => r.json()),
      ])

      if (statsRes.success) setStats(statsRes.stats)
      if (ideasRes.success) setIdeas(ideasRes.ideas || [])
      if (notificationsRes.success) setNotifications(notificationsRes.notifications || [])
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleProfileUpdate = async (updatedData) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      })
      const data = await response.json()
      if (data.success) {
        updateUser(data.user)
        setShowProfileModal(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchDashboardData()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleViewIdea = (idea) => {
    setSelectedIdea(idea)
    setShowPreviewModal(true)
  }

  const getUserIdeas = () => {
    return ideas.filter(i => i.author?.id === user?.id || i.author?._id === user?.id)
  }

  if (loading) return <div className={styles.loadingScreen}>Loading...</div>

  return (
    <div className={`${styles.dashboardContainer} ${isDarkMode ? styles.darkMode : ''}`}>
      <header className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logo}>ClassForge</h1>
        </div>
        <div className={styles.headerRight}>
          <button 
            className={styles.themeToggle} 
            onClick={toggleTheme} 
            aria-label="Toggle theme"
          >
            {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
          </button>

          <div className={styles.notificationContainer}>
            <button
              className={styles.notificationBtn}
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <FaBell size={18} />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className={styles.notificationBadge}>
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className={styles.notificationDropdown}>
                <div className={styles.notificationHeader}>
                  <h3>Notifications</h3>
                </div>
                <div className={styles.notificationList}>
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`${styles.notificationItem} ${!notif.isRead ? styles.unread : ''}`}
                        onClick={() => markNotificationAsRead(notif._id)}
                      >
                        <p>{notif.message}</p>
                        <small>{new Date(notif.createdAt).toLocaleDateString()}</small>
                      </div>
                    ))
                  ) : (
                    <p className={styles.noNotifications}>No notifications</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.profileContainer}>
            <button
              className={styles.profileBtn}
              onClick={() => setShowProfile(!showProfile)}
              aria-label="Profile"
            >
              <div className={styles.profileAvatar}>
                <FaUser size={16} />
              </div>
            </button>

            {showProfile && (
              <div className={styles.profileDropdown}>
                <div className={styles.profileHeader}>
                  <p className={styles.profileName}>{user?.name}</p>
                  <p className={styles.profileEmail}>{user?.email}</p>
                  <p className={styles.profileRole}>{user?.role}</p>
                </div>
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className={styles.editProfileBtn}
                >
                  Edit Profile
                </button>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  <MdLogout size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={styles.dashboardLayout}>
        <aside className={styles.dashboardSidebar}>
          <nav className={styles.sidebarNav}>
            <button
              className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <MdDashboard size={20} />
              <span>Dashboard</span>
            </button>

            <button
              className={`${styles.navItem}`}
              onClick={() => navigate('/submit-idea')}
            >
              <MdAdd size={20} />
              <span>Submit Idea</span>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === 'explore' ? styles.active : ''}`}
              onClick={() => setActiveTab('explore')}
            >
              <MdExplore size={20} />
              <span>Explore Ideas</span>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === 'myideas' ? styles.active : ''}`}
              onClick={() => setActiveTab('myideas')}
            >
              <MdNotes size={20} />
              <span>My Ideas</span>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === 'notifications' ? styles.active : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <MdNotifications size={20} />
              <span>Notifications</span>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <MdSettings size={20} />
              <span>Settings</span>
            </button>
          </nav>
        </aside>

        <main className={styles.dashboardContent}>
          {activeTab === 'dashboard' && (
            <>
              <section className={styles.welcomeSection}>
                <div>
                  <h2>Welcome back, {user?.name}!</h2>
                  <p>Track and manage your innovative ideas</p>
                </div>
              </section>

              <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <MdNotes size={28} />
                  </div>
                  <div className={styles.statContent}>
                    <h3>{stats?.totalIdeas || 0}</h3>
                    <p>Total Ideas</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon} style={{ color: '#10b981' }}>
                    <MdDashboard size={28} />
                  </div>
                  <div className={styles.statContent}>
                    <h3>{stats?.approvedIdeas || 0}</h3>
                    <p>Approved</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon} style={{ color: '#f59e0b' }}>
                    <MdDashboard size={28} />
                  </div>
                  <div className={styles.statContent}>
                    <h3>{stats?.pendingIdeas || 0}</h3>
                    <p>Pending</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon} style={{ color: '#ef4444' }}>
                    <MdDashboard size={28} />
                  </div>
                  <div className={styles.statContent}>
                    <h3>{stats?.rejectedIdeas || 0}</h3>
                    <p>Rejected</p>
                  </div>
                </div>
              </section>

              <section className={styles.recentIdeasSection}>
                <div className={styles.sectionHeader}>
                  <h3>My Recent Ideas</h3>
                  <Link to="/submit-idea" className={styles.viewAllBtn}>
                    <MdAdd size={16} /> Submit New
                  </Link>
                </div>
                <div className={styles.ideasGrid}>
                  {getUserIdeas().length > 0 ? (
                    getUserIdeas().slice(0, 6).map((idea) => (
                      <div key={idea._id} className={styles.ideaCard}>
                        <div className={styles.ideaHeader}>
                          <h4>{idea.title}</h4>
                          <span className={`${styles.status} ${styles[idea.status]}`}>
                            {idea.status}
                          </span>
                        </div>
                        <p className={styles.ideaDescription}>
                          {idea.description.substring(0, 100)}...
                        </p>
                        <div className={styles.ideaMeta}>
                          <span className={styles.domain}>{idea.domain}</span>
                          <span className={styles.views}>{idea.views} views</span>
                        </div>
                        <button 
                          onClick={() => handleViewIdea(idea)}
                          className={styles.viewBtn}
                        >
                          View Details
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className={styles.emptyState}>
                      No ideas yet. <Link to="/submit-idea">Submit your first idea</Link>
                    </p>
                  )}
                </div>
              </section>
            </>
          )}

          {activeTab === 'explore' && (
            <section className={styles.exploreSection}>
              <div className={styles.exploreHeader}>
                <h2>Explore All Ideas</h2>
                <p>Discover innovative ideas from the community</p>
              </div>
              <div className={styles.ideasGrid}>
                {ideas.filter(i => i.status === 'approved').length > 0 ? (
                  ideas.filter(i => i.status === 'approved').map((idea) => (
                    <div key={idea._id} className={styles.ideaCard}>
                      <div className={styles.ideaHeader}>
                        <h4>{idea.title}</h4>
                        <span className={`${styles.status} ${styles[idea.status]}`}>
                          {idea.status}
                        </span>
                      </div>
                      <p className={styles.ideaAuthor}>by {idea.author?.name}</p>
                      <p className={styles.ideaDescription}>
                        {idea.description.substring(0, 100)}...
                      </p>
                      <div className={styles.ideaMeta}>
                        <span className={styles.domain}>{idea.domain}</span>
                        <span className={styles.views}>{idea.views} views</span>
                      </div>
                      <button 
                        onClick={() => handleViewIdea(idea)}
                        className={styles.viewBtn}
                      >
                        View Details
                      </button>
                    </div>
                  ))
                ) : (
                  <p className={styles.emptyState}>No approved ideas available yet</p>
                )}
              </div>
            </section>
          )}

          {activeTab === 'myideas' && (
            <section className={styles.myIdeasSection}>
              <div className={styles.myIdeasHeader}>
                <h2>My Ideas</h2>
                <Link to="/submit-idea" className={styles.viewAllBtn}>
                  <MdAdd size={16} /> Submit New Idea
                </Link>
              </div>
              <div className={styles.ideasGrid}>
                {getUserIdeas().length > 0 ? (
                  getUserIdeas().map((idea) => (
                    <div key={idea._id} className={styles.ideaCard}>
                      <div className={styles.ideaHeader}>
                        <h4>{idea.title}</h4>
                        <span className={`${styles.status} ${styles[idea.status]}`}>
                          {idea.status}
                        </span>
                      </div>
                      <p className={styles.ideaDescription}>
                        {idea.description.substring(0, 100)}...
                      </p>
                      <div className={styles.ideaMeta}>
                        <span className={styles.domain}>{idea.domain}</span>
                        <span className={styles.views}>{idea.views} views</span>
                      </div>
                      <button 
                        onClick={() => handleViewIdea(idea)}
                        className={styles.viewBtn}
                      >
                        View Details
                      </button>
                    </div>
                  ))
                ) : (
                  <p className={styles.emptyState}>
                    You haven't submitted any ideas yet.
                    <br />
                    <Link to="/submit-idea">Submit your first idea →</Link>
                  </p>
                )}
              </div>
            </section>
          )}

          {activeTab === 'notifications' && (
            <NotificationsSection 
              notifications={notifications}
              onRefresh={fetchDashboardData}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsSection 
              user={user}
              onUpdate={handleProfileUpdate}
              onRefresh={fetchDashboardData}
            />
          )}
        </main>
      </div>

      {showPreviewModal && (
        <IdeaPreviewModal 
          idea={selectedIdea} 
          onClose={() => {
            setShowPreviewModal(false)
            fetchDashboardData()
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {showProfileModal && (
        <ProfileModal 
          user={user}
          onClose={() => setShowProfileModal(false)}
          onSave={handleProfileUpdate}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  )
}
