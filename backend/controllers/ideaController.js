const Idea = require('../models/Idea');
const User = require('../models/User');
const Notification = require('../models/Notification');
const MergeHistory = require('../models/MergeHistory');
const ActivityLog = require('../models/ActivityLog');

exports.submitIdea = async (req, res) => {
  try {
    const { title, description, domain, tags } = req.body;

    if (!title || !description || !domain) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const idea = new Idea({
      title,
      description,
      domain,
      tags: tags || [],
      author: req.userId
    });

    await idea.save();

    await ActivityLog.create({
      user: req.userId,
      action: 'CREATE',
      resource: 'idea',
      resourceId: idea._id,
      details: { title, domain }
    });

    res.status(201).json({
      success: true,
      message: 'Idea submitted successfully',
      idea
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getIdeas = async (req, res) => {
  try {
    const { status, domain, search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) filter.status = status;
    if (domain) filter.domain = domain;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const ideas = await Idea.find(filter)
      .populate('author', 'name email')
      .populate('feedback.faculty', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Idea.countDocuments(filter);

    res.status(200).json({
      success: true,
      ideas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getIdeaById = async (req, res) => {
  try {
    const idea = await Idea.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'name email department')
      .populate('feedback.faculty', 'name email')
      .populate('contributors', 'name email');

    if (!idea) {
      return res.status(404).json({ success: false, message: 'Idea not found' });
    }

    res.status(200).json({ success: true, idea });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ success: false, message: 'Idea not found' });
    }

    if (idea.author.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (idea.status !== 'pending' && req.userRole !== 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot edit approved/rejected idea' });
    }

    Object.assign(idea, req.body);
    await idea.save();

    await ActivityLog.create({
      user: req.userId,
      action: 'UPDATE',
      resource: 'idea',
      resourceId: idea._id
    });

    res.status(200).json({ success: true, message: 'Idea updated', idea });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ success: false, message: 'Idea not found' });
    }

    if (idea.author.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (idea.status !== 'pending' && req.userRole !== 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete approved/rejected idea' });
    }

    await Idea.deleteOne({ _id: req.params.id });

    await ActivityLog.create({
      user: req.userId,
      action: 'DELETE',
      resource: 'idea',
      resourceId: idea._id
    });

    res.status(200).json({ success: true, message: 'Idea deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveIdea = async (req, res) => {
  try {
    const idea = await Idea.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedAt: new Date() },
      { new: true }
    );

    if (!idea) {
      return res.status(404).json({ success: false, message: 'Idea not found' });
    }

    await Notification.create({
      user: idea.author,
      type: 'approval',
      idea: idea._id,
      message: `Your idea "${idea.title}" has been approved!`
    });

    await ActivityLog.create({
      user: req.userId,
      action: 'APPROVE',
      resource: 'idea',
      resourceId: idea._id
    });

    res.status(200).json({ success: true, message: 'Idea approved', idea });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectIdea = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const idea = await Idea.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected', 
        rejectedAt: new Date(),
        'feedback': [{
          faculty: req.userId,
          comment: reason || 'Idea rejected',
          date: new Date()
        }]
      },
      { new: true }
    );

    if (!idea) {
      return res.status(404).json({ success: false, message: 'Idea not found' });
    }

    await Notification.create({
      user: idea.author,
      type: 'rejection',
      idea: idea._id,
      message: `Your idea "${idea.title}" has been rejected. Reason: ${reason || 'See feedback for details'}`
    });

    await ActivityLog.create({
      user: req.userId,
      action: 'REJECT',
      resource: 'idea',
      resourceId: idea._id,
      details: { reason }
    });

    res.status(200).json({ success: true, message: 'Idea rejected', idea });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addFeedback = async (req, res) => {
  try {
    const { comment } = req.body;

    const idea = await Idea.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          feedback: {
            faculty: req.userId,
            comment,
            date: new Date()
          }
        }
      },
      { new: true }
    );

    if (!idea) {
      return res.status(404).json({ success: false, message: 'Idea not found' });
    }

    await Notification.create({
      user: idea.author,
      type: 'feedback',
      idea: idea._id,
      message: 'You have received feedback on your idea'
    });

    res.status(200).json({ success: true, message: 'Feedback added', idea });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.mergeIdeas = async (req, res) => {
  try {
    const { originalIdeaId, ideaIdsToMerge, reason } = req.body;

    if (!originalIdeaId || !ideaIdsToMerge || ideaIdsToMerge.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid merge request' });
    }

    const originalIdea = await Idea.findById(originalIdeaId);
    if (!originalIdea) {
      return res.status(404).json({ success: false, message: 'Original idea not found' });
    }

    await Idea.updateMany(
      { _id: { $in: ideaIdsToMerge } },
      { mergedWith: originalIdeaId, status: 'merged', mergeReason: reason }
    );

    originalIdea.contributors = [...new Set([...originalIdea.contributors, ...ideaIdsToMerge])];
    await originalIdea.save();

    await MergeHistory.create({
      originalIdea: originalIdeaId,
      mergedIdeas: ideaIdsToMerge,
      mergedBy: req.userId,
      reason
    });

    const mergedIdeas = await Idea.find({ _id: { $in: ideaIdsToMerge } });
    for (const idea of mergedIdeas) {
      await Notification.create({
        user: idea.author,
        type: 'merge',
        idea: originalIdeaId,
        message: `Your idea has been merged with "${originalIdea.title}"`
      });
    }

    await ActivityLog.create({
      user: req.userId,
      action: 'MERGE',
      resource: 'merge',
      details: { originalIdeaId, mergedCount: ideaIdsToMerge.length }
    });

    res.status(200).json({
      success: true,
      message: 'Ideas merged successfully',
      originalIdea
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
