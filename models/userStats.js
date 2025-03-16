const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: { type: Number, default: 0 },
  voiceActivity: { type: Number, default: 0 }
});

module.exports = mongoose.model('UserStats', userStatsSchema);