// models/userStats.js
const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: { type: Number, default: 0 },
  voiceActivity: { type: Number, default: 0 },
});

const UserStats = mongoose.model('UserStats', userStatsSchema);

module.exports = UserStats;