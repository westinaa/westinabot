const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: { type: Number, default: 0 },
  dailyMessages: { type: Number, default: 0 },
  weeklyMessages: { type: Number, default: 0 },
  voiceHours: { type: Number, default: 0 },
  voiceMinutes: { type: Number, default: 0 },
  voiceWeeklyHours: { type: Number, default: 0 },
  voiceWeeklyMinutes: { type: Number, default: 0 },
  voiceDailyHours: { type: Number, default: 0 },
  voiceDailyMinutes: { type: Number, default: 0 },
  invites: {
    total: { type: Number, default: 0 },
    real: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    left: { type: Number, default: 0 },
    fake: { type: Number, default: 0 }
  },
  lastWeeklyReset: { type: Date, default: Date.now } // Haftalık sıfırlama tarihi
});

module.exports = mongoose.model('UserStats', userStatsSchema);
