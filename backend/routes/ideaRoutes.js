const express = require('express');
const authMiddleware = require('../middleware/auth');
const Idea = require('../models/Idea');
const Notification = require('../models/Notification');

const router = express.Router();

/* ===========================
   GET USER'S OWN IDEAS
   =========================== */
router.get('/user/my-ideas', authMiddleware, async (req, res) => {
  try {
    const ideas = await Idea.find({ author: req.userId })
      .populate('author', 'name email department')
      .populate('comments.user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, ideas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ===========================
   GET ALL IDEAS (FILTERS)
   =========================== */
router.get('/', async (req, res) => {
  try {
    const { status, search, domain } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (domain) filter.domain = domain;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const ideas = await Idea.find(filter)
      .populate('author', 'name email department')
      .sort({ createdAt: -1 });

    res.json({ success: true, ideas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ===========================
   GET SINGLE IDEA
   =========================== */
router.get('/:ideaId', async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.ideaId)
      .populate('author', 'name email department')
      .populate('comments.user', 'name email');

    if (!idea) {
      return res.status(404).json({ success: false, message: 'Idea not found' });
    }

    idea.views += 1;
    await idea.save();

    res.json({ success: true, idea });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ===========================
   CREATE IDEA
   =========================== */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, domain, tags } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title required' });
    }

    if (!description || description.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Description must be at least 50 characters',
      });
    }

    const idea = await Idea.create({
      title: title.trim(),
      description: description.trim(),
      domain,
      tags,
      author: req.userId,
    });

    res.status(201).json({
      success: true,
      message: 'Idea submitted successfully',
      idea,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
