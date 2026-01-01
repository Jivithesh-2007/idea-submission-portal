import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/useAuth'
import { MdClose, MdSend } from 'react-icons/md'
import styles from '../styles/Modal.module.css'

const API_URL = import.meta.env.VITE_API_URL

export default function IdeaPreviewModal({ idea, onClose, isDarkMode }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [ideaData, setIdeaData] = useState(idea)

  useEffect(() => {
    if (ideaData) {
      fetchIdeaDetails()
    }
  }, [ideaData?._id])

  const fetchIdeaDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/ideas/${ideaData._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setIdeaData(data.idea)
        setComments(data.idea.comments || [])
      }
    } catch (error) {
      console.error('Error fetching idea details:', error)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/ideas/${ideaData._id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newComment })
      })

      const data = await response.json()
      if (data.success) {
        setComments(data.idea.comments || [])
        setNewComment('')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!ideaData) return null

  return (
    <div 
      className={`${styles.modalOverlay} ${isDarkMode ? styles.darkMode : ''}`} 
      onClick={onClose}
    >
      <div 
        className={styles.modalContent} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose}>
          <MdClose size={28} />
        </button>

        <div className={styles.modalHeader}>
          <h2>{ideaData.title}</h2>
          <span className={`${styles.status} ${styles[ideaData.status]}`}>
            {ideaData.status}
          </span>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.ideaMeta}>
            <div className={styles.metaItem}>
              <strong>Author:</strong> {ideaData.author?.name}
            </div>
            <div className={styles.metaItem}>
              <strong>Email:</strong> {ideaData.author?.email}
            </div>
            <div className={styles.metaItem}>
              <strong>Department:</strong> {ideaData.author?.department}
            </div>
            <div className={styles.metaItem}>
              <strong>Domain:</strong> {ideaData.domain}
            </div>
            <div className={styles.metaItem}>
              <strong>Views:</strong> {ideaData.views}
            </div>
            <div className={styles.metaItem}>
              <strong>Submitted:</strong>{' '}
              {new Date(ideaData.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className={styles.description}>
            <h3>Description</h3>
            <p>{ideaData.description}</p>
          </div>

          {ideaData.tags && ideaData.tags.length > 0 && (
            <div className={styles.tags}>
              <h3>Tags</h3>
              <div className={styles.tagList}>
                {ideaData.tags.map((tag, idx) => (
                  <span key={idx} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {ideaData.status === 'rejected' && ideaData.rejectionReason && (
            <div className={styles.rejectionReason}>
              <h3>Rejection Reason</h3>
              <p>{ideaData.rejectionReason}</p>
            </div>
          )}

          {ideaData.author?.bio && (
            <div className={styles.bio}>
              <h3>About Author</h3>
              <p>{ideaData.author.bio}</p>
            </div>
          )}

          {ideaData.author?.phone && (
            <div className={styles.contact}>
              <h3>Contact</h3>
              <p>Phone: {ideaData.author.phone}</p>
            </div>
          )}

          {/* COMMENTS SECTION */}
          <div className={styles.commentsSection}>
            <h3>Comments ({comments.length})</h3>

            {user && (
              <form 
                onSubmit={handleAddComment} 
                className={styles.commentForm}
              >
                <div className={styles.commentInputGroup}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows="2"
                    className={styles.commentInput}
                  />
                  <button 
                    type="submit" 
                    disabled={loading || !newComment.trim()}
                    className={styles.commentSubmitBtn}
                  >
                    <MdSend size={18} />
                  </button>
                </div>
              </form>
            )}

            <div className={styles.commentsList}>
              {comments.length > 0 ? (
                comments.map((comment, idx) => (
                  <div key={idx} className={styles.commentItem}>
                    <div className={styles.commentHeader}>
                      <strong>{comment.user?.name || 'Anonymous'}</strong>
                      <small>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <p className={styles.commentText}>{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className={styles.noComments}>
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
