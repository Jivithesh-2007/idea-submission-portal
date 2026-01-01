const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Idea = require('../models/Idea');

const router = express.Router();

// Get platform statistics (admin only)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalIdeas = await Idea.countDocuments();
    const approvedIdeas = await Idea.countDocuments({ status: 'approved' });
    const pendingIdeas = await Idea.countDocuments({ status: 'pending' });
    const rejectedIdeas = await Idea.countDocuments({ status: 'rejected' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalIdeas,
        approvedIdeas,
        pendingIdeas,
        rejectedIdeas
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all users (admin only)
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
