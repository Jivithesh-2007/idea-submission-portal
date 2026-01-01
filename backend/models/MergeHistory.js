const mongoose = require('mongoose');

const mergeHistorySchema = new mongoose.Schema({
  originalIdea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea',
    required: true
  },
  mergedIdeas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea'
  }],
  mergedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: String,
  mergeDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MergeHistory', mergeHistorySchema);
