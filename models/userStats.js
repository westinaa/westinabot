const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: { type: Number, default: 0 },
  voiceHours: { type: Number, default: 0 }, // Saat olarak kayıt
  voiceMinutes: { type: Number, default: 0 }, // Dakika olarak kayıt
  invites: {
    total: { type: Number, default: 0 }, // Toplam davet
    real: { type: Number, default: 0 },  // Gerçek davet
    bonus: { type: Number, default: 0 }, // Bonus davet
    left: { type: Number, default: 0 },  // Ayrılan davet
    fake: { type: Number, default: 0 }   // Fake davet
  }
});

module.exports = mongoose.model('UserStats', userStatsSchema);