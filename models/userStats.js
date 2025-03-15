const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: { type: Map, of: Number, default: {} },  // Mesaj sayısı
  voiceStats: [{
    channelId: String,
    joinTime: Date,
    leaveTime: Date,
    totalTime: { type: Number, default: 0 }  // Sesli kanalda geçirilen toplam süre
  }],
  lastUpdated: { type: Date, default: Date.now }
});

const UserStats = mongoose.model('UserStats', userStatsSchema);

module.exports = UserStats;
