const { Events } = require('discord.js');
const UserStats = require('../models/userStats.js');
const moment = require('moment');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return; // Botların mesajlarını sayma

    try {
      let userStats = await UserStats.findOne({ userId: message.author.id });

      if (!userStats) {
        userStats = new UserStats({
          userId: message.author.id,
          messages: 0,
          dailyMessages: 0,
          weeklyMessages: 0,
          lastWeeklyResetMessages: Date.now(), // Haftalık sıfırlama tarihi ekleniyor
        });
      }

      // Günlük mesaj sayısını artır
      userStats.dailyMessages += 1;

      // Haftalık mesaj sayısını artır
      const now = moment();
      const lastWeeklyReset = moment(userStats.lastWeeklyResetMessages); // Haftalık sıfırlama tarihi

      // Haftalık sıfırlamayı kontrol et
      if (now.isoWeek() !== lastWeeklyReset.isoWeek()) {
        // Haftalık sıfırlama: Pazartesi'den Pazartesi'ye sıfırlama
        userStats.weeklyMessages = 1;  // Yeni haftanın ilk mesajı
        userStats.lastWeeklyResetMessages = now.toDate();  // Haftalık reset zamanı güncelleniyor
      } else {
        userStats.weeklyMessages += 1;
      }

      // Toplam mesaj sayısını artır
      userStats.messages += 1;

      await userStats.save();  // Güncellenmiş veriyi kaydet

    } catch (error) {
      console.error('Mesaj güncellenirken bir hata oluştu:', error);
    }
  }
};
