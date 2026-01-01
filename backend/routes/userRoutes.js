const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Idea = require('../models/Idea');

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        bio: user.bio,
        phone: user.phone,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, department, bio, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        name,
        department,
        bio,
        phone,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        bio: user.bio,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Change password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new passwords are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get dashboard stats (for student)
router.get('/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const ideas = await Idea.find({ author: req.userId });

    const stats = {
      totalIdeas: ideas.length,
      approvedIdeas: ideas.filter(i => i.status === 'approved').length,
      pendingIdeas: ideas.filter(i => i.status === 'pending').length,
      rejectedIdeas: ideas.filter(i => i.status === 'rejected').length
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all students (for faculty)
router.get('/students', authMiddleware, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('_id name email department createdAt')
      .sort({ createdAt: -1 });

    const studentStats = await Promise.all(
      students.map(async (student) => {
        const ideas = await Idea.find({ author: student._id });
        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          department: student.department,
          createdAt: student.createdAt,
          totalIdeas: ideas.length,
          approvedIdeas: ideas.filter(i => i.status === 'approved').length,
          pendingIdeas: ideas.filter(i => i.status === 'pending').length,
          rejectedIdeas: ideas.filter(i => i.status === 'rejected').length
        };
      })
    );

    res.json({
      success: true,
      students: studentStats
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
