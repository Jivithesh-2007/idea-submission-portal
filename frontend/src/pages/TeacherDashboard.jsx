import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/ThemeContext'
import IdeaPreviewModal from '../components/IdeaPreviewModal'
import ProfileModal from '../components/ProfileModal'
import NotificationsSection from '../components/NotificationsSection'
import SettingsSection from '../components/SettingsSection'
import { MdDashboard, MdAssignment, MdCheckCircle, MdMerge, MdPeople, MdNotifications, MdSettings, MdLogout } from 'react-icons/md'
import { FaBell, FaUser, FaMoon, FaSun, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import styles from '../styles/Dashboard.module.css'

const API_URL = import.meta.env.VITE_API_URL

export default function TeacherDashboard() {
  const { user, logout, updateUser } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [ideas, setIdeas] = useState([])
  const [students, setStudents] = useState([])
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedIdea, setSelectedIdea] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('submissions')
  const [filterStatus, setFilterStatus] = useState('pending')
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    fetchTeacherData()
    const interval = setInterval(fetchTeacherData, 3000)
    return () => clearInterval(interval)
  }, [filterStatus])

  const fetchTeacherData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        navigate('/login')
        return
      }

      const headers = { 'Authorization': `Bearer ${token}` }

      const [ideasRes, notificationsRes, studentsRes] = await Promise.all([
        fetch(`${API_URL}/ideas?status=${filterStatus}`, { headers })
          .then(r => {
            if (r.status === 401) {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              navigate('/login')
              throw new Error('Token expired')
            }
            return r.json()
          }),
        fetch(`${API_URL}/notifications`, { headers })
          .then(r => r.json()),
        fetch(`${API_URL}/users/students`, { headers })
          .then(r => r.json()),
      ])

      if (ideasRes.success) setIdeas(ideasRes.ideas || [])
      if (notificationsRes.success) setNotifications(notificationsRes.notifications || [])
      if (studentsRes.success) setStudents(studentsRes.students || [])
    } catch (error) {
      console.error('Error fetching teacher data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveIdea = async (ideaId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/ideas/${ideaId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        fetchTeacherData()
      }
    } catch (error) {
      console.error('Error approving idea:', error)
    }
  }

  const handleRejectIdea = async (ideaId) => {
    const reason = prompt('Enter rejection reason:')
    if (reason) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/ideas/${ideaId}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reason })
        })
        const data = await response.json()
        if (data.success) {
          fetchTeacherData()
        }
      } catch (error) {
        console.error('Error rejecting idea:', error)
      }
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
      fetchTeacherData()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleViewIdea = (idea) => {
    setSelectedIdea(idea)
    setShowPreviewModal(true)
  }

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles.calendarEmpty}></div>)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = i === new Date().getDate() && 
                     currentDate.getMonth() === new Date().getMonth() &&
                     currentDate.getFullYear() === new Date().getFullYear()
      days.push(
        <div 
          key={i} 
          className={`${styles.calendarDay} ${isToday ? styles.today : ''}`}
        >
          {i}
        </div>
      )
    }

    return { days, monthNames }
  }

  const { days, monthNames } = renderCalendar()

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
                  <p className={styles.profileRole}>Faculty</p>
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
              className={`${styles.navItem} ${activeTab === 'submissions' ? styles.active : ''}`}
              onClick={() => setActiveTab('submissions')}
            >
              <MdDashboard size={20} />
              <span>Dashboard</span>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === 'pending' ? styles.active : ''}`}
              onClick={() => {
                setActiveTab('pending')
                setFilterStatus('pending')
              }}
            >
              <MdAssignment size={20} />
              <span>Review Ideas</span>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === 'approved' ? styles.active : ''}`}
              onClick={() => {
                setActiveTab('approved')
                setFilterStatus('approved')
              }}
            >
              <MdCheckCircle size={20} />
              <span>Approved Ideas</span>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === 'students' ? styles.active : ''}`}
              onClick={() => setActiveTab('students')}
            >
              <MdPeople size={20} />
              <span>Students</span>
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
          {activeTab === 'submissions' && (
            <div className={styles.teacherDashboardGrid}>
              <div className={styles.ideasSection}>
                <section className={styles.teacherHeader}>
                  <h2>Idea Submissions</h2>
                  <p>Manage and review student ideas</p>
                </section>

                <div className={styles.filterButtons}>
                  <button
                    className={`${styles.filterBtn} ${filterStatus === 'pending' ? styles.active : ''}`}
                    onClick={() => setFilterStatus('pending')}
                  >
                    Pending ({ideas.filter(i => i.status === 'pending').length})
                  </button>
                  <button
                    className={`${styles.filterBtn} ${filterStatus === 'approved' ? styles.active : ''}`}
                    onClick={() => setFilterStatus('approved')}
                  >
                    Approved ({ideas.filter(i => i.status === 'approved').length})
                  </button>
                  <button
                    className={`${styles.filterBtn} ${filterStatus === 'rejected' ? styles.active : ''}`}
                    onClick={() => setFilterStatus('rejected')}
                  >
                    Rejected ({ideas.filter(i => i.status === 'rejected').length})
                  </button>
                </div>

                <div className={styles.submissionsGrid}>
                  {ideas.length > 0 ? (
                    ideas.map((idea) => (
                      <div key={idea._id} className={styles.submissionCard}>
                        <div className={styles.submissionHeader}>
                          <div>
                            <h4>{idea.title}</h4>
                            <p className={styles.authorName}>by {idea.author?.name}</p>
                          </div>
                          <span className={`${styles.status} ${styles[idea.status]}`}>
                            {idea.status}
                          </span>
                        </div>
                        <p className={styles.submissionDescription}>
                          {idea.description.substring(0, 150)}...
                        </p>
                        <div className={styles.submissionMeta}>
                          <span className={styles.domain}>{idea.domain}</span>
                          <span className={styles.date}>
                            {new Date(idea.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleViewIdea(idea)}
                          className={styles.viewBtn}
                        >
                          View Full Idea
                        </button>
                        {idea.status === 'pending' && (
                          <div className={styles.actionButtons}>
                            <button
                              className={styles.approveBtn}
                              onClick={() => handleApproveIdea(idea._id)}
                            >
                              Approve
                            </button>
                            <button
                              className={styles.rejectBtn}
                              onClick={() => handleRejectIdea(idea._id)}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className={styles.emptyState}>No {filterStatus} submissions</p>
                  )}
                </div>
              </div>

              <div className={styles.rightPanel}>
                <div className={styles.calendarCard}>
                  <div className={styles.calendarHeader}>
                    <button onClick={previousMonth} className={styles.calendarNav}>
                      <FaChevronLeft size={14} />
                    </button>
                    <h3>
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <button onClick={nextMonth} className={styles.calendarNav}>
                      <FaChevronRight size={14} />
                    </button>
                  </div>

                  <div className={styles.calendarWeekdays}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className={styles.weekday}>{day}</div>
                    ))}
                  </div>

                  <div className={styles.calendarDays}>
                    {days}
                  </div>
                </div>

                <div className={styles.quickStats}>
                  <div className={styles.quickStatItem}>
                    <div className={styles.statLabel}>Total Submissions</div>
                    <div className={styles.statValue}>{ideas.length}</div>
                  </div>
                  <div className={styles.quickStatItem}>
                    <div className={styles.statLabel}>Pending Review</div>
                    <div className={styles.statValue}>{ideas.filter(i => i.status === 'pending').length}</div>
                  </div>
                  <div className={styles.quickStatItem}>
                    <div className={styles.statLabel}>Approved</div>
                    <div className={styles.statValue}>{ideas.filter(i => i.status === 'approved').length}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <section className={styles.reviewSection}>
              <h2>Pending Reviews</h2>
              <div className={styles.submissionsGrid}>
                {ideas.filter(i => i.status === 'pending').length > 0 ? (
                  ideas.filter(i => i.status === 'pending').map((idea) => (
                    <div key={idea._id} className={styles.submissionCard}>
                      <div className={styles.submissionHeader}>
                        <div>
                          <h4>{idea.title}</h4>
                          <p className={styles.authorName}>by {idea.author?.name}</p>
                        </div>
                      </div>
                      <p className={styles.submissionDescription}>
                        {idea.description.substring(0, 150)}...
                      </p>
                      <div className={styles.submissionMeta}>
                        <span className={styles.domain}>{idea.domain}</span>
                      </div>
                      <button 
                        onClick={() => handleViewIdea(idea)}
                        className={styles.viewBtn}
                      >
                        View & Review
                      </button>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.approveBtn}
                          onClick={() => handleApproveIdea(idea._id)}
                        >
                          Approve
                        </button>
                        <button
                          className={styles.rejectBtn}
                          onClick={() => handleRejectIdea(idea._id)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.emptyState}>No pending submissions</p>
                )}
              </div>
            </section>
          )}

          {activeTab === 'approved' && (
            <section className={styles.approvedSection}>
              <h2>Approved Ideas</h2>
              <div className={styles.submissionsGrid}>
                {ideas.filter(i => i.status === 'approved').length > 0 ? (
                  ideas.filter(i => i.status === 'approved').map((idea) => (
                    <div key={idea._id} className={styles.submissionCard}>
                      <div className={styles.submissionHeader}>
                        <div>
                          <h4>{idea.title}</h4>
                          <p className={styles.authorName}>by {idea.author?.name}</p>
                        </div>
                        <span className={`${styles.status} ${styles.approved}`}>
                          Approved
                        </span>
                      </div>
                      <p className={styles.submissionDescription}>
                        {idea.description.substring(0, 150)}...
                      </p>
                      <div className={styles.submissionMeta}>
                        <span className={styles.domain}>{idea.domain}</span>
                        <span className={styles.date}>
                          {new Date(idea.createdAt).toLocaleDateString()}
                        </span>
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
                  <p className={styles.emptyState}>No approved ideas yet</p>
                )}
              </div>
            </section>
          )}

          {activeTab === 'students' && (
            <section className={styles.studentsSection}>
              <div className={styles.sectionHeader}>
                <h2>Registered Students</h2>
                <p>Total: {students.length} students</p>
              </div>

              {students.length > 0 ? (
                <div className={styles.studentsGrid}>
                  {students.map((student) => (
                    <div key={student._id} className={styles.studentCard}>
                      <div className={styles.studentHeader}>
                        <h4>{student.name}</h4>
                        <span className={styles.joinDate}>
                          Joined {new Date(student.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className={styles.studentInfo}>
                        <p><strong>Email:</strong> {student.email}</p>
                        <p><strong>Department:</strong> {student.department || 'Not specified'}</p>
                      </div>

                      <div className={styles.studentStats}>
                        <div className={styles.studentStat}>
                          <span className={styles.statLabel}>Total Ideas</span>
                          <span className={styles.statValue}>{student.totalIdeas}</span>
                        </div>
                        <div className={styles.studentStat}>
                          <span className={styles.statLabel}>Approved</span>
                          <span className={styles.statValue} style={{ color: '#10b981' }}>
                            {student.approvedIdeas}
                          </span>
                        </div>
                        <div className={styles.studentStat}>
                          <span className={styles.statLabel}>Pending</span>
                          <span className={styles.statValue} style={{ color: '#f59e0b' }}>
                            {student.pendingIdeas}
                          </span>
                        </div>
                        <div className={styles.studentStat}>
                          <span className={styles.statLabel}>Rejected</span>
                          <span className={styles.statValue} style={{ color: '#ef4444' }}>
                            {student.rejectedIdeas}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>No students registered yet</p>
              )}
            </section>
          )}

          {activeTab === 'notifications' && (
            <NotificationsSection 
              notifications={notifications}
              onRefresh={fetchTeacherData}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsSection 
              user={user}
              onUpdate={handleProfileUpdate}
              onRefresh={fetchTeacherData}
            />
          )}
        </main>
      </div>

      {showPreviewModal && (
        <IdeaPreviewModal 
          idea={selectedIdea} 
          onClose={() => {
            setShowPreviewModal(false)
            fetchTeacherData()
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
