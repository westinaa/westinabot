const { Events } = require('discord.js'); 
const UserStats = require('../models/userStats.js');
const moment = require('moment');

module.exports = {
  name: Events.voiceStateUpdate,
  async execute(oldState, newState) {
    try {
      // Kullanıcıyı belirle
      const userId = newState.member.user.id;

      // Kullanıcı verilerini bul
      let userStats = await UserStats.findOne({ userId });

      // Kullanıcı verileri bulunmazsa yeni bir kullanıcı oluştur
      if (!userStats) {
        userStats = new UserStats({ userId, voiceHours: 0, voiceMinutes: 0 });
      }

      // Kullanıcı ses kanalına girdiğinde
      if (!oldState.channelId && newState.channelId) {
        newState.member.voiceJoinTime = Date.now();  // Ses kanalına giriş zamanını kaydediyoruz
      }

      // Kullanıcı ses kanalından çıktığında
      else if (oldState.channelId && !newState.channelId) {
        if (oldState.member.voiceJoinTime) {
          const elapsedTime = Date.now() - oldState.member.voiceJoinTime;
          const minutes = Math.floor(elapsedTime / 60000);
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;

          // Ses süresi güncelleniyor
          userStats.voiceMinutes = (userStats.voiceMinutes || 0) + minutes;
          userStats.voiceHours = Math.floor(userStats.voiceMinutes / 60);
          userStats.voiceMinutes = userStats.voiceMinutes % 60;

          // Haftalık ses verisini güncelle
          userStats.voiceWeeklyMinutes = (userStats.voiceWeeklyMinutes || 0) + minutes;
          userStats.voiceWeeklyHours = Math.floor(userStats.voiceWeeklyMinutes / 60);
          userStats.voiceWeeklyMinutes = userStats.voiceWeeklyMinutes % 60;

          // Günlük ses verisini güncelle
          userStats.voiceDailyMinutes = (userStats.voiceDailyMinutes || 0) + minutes;
          userStats.voiceDailyHours = Math.floor(userStats.voiceDailyMinutes / 60);
          userStats.voiceDailyMinutes = userStats.voiceDailyMinutes % 60;

          // Haftalık sıfırlama kontrolü
          const now = moment();
          const lastWeeklyResetMessages = moment(userStats.lastWeeklyResetMessages);
          const lastWeeklyResetVoice = moment(userStats.lastWeeklyResetVoice);

          // Pazartesi günü haftalık veriyi sıfırlıyoruz
          if (now.isoWeekday() === 1 && now.isoWeek() !== lastWeeklyResetMessages.isoWeek()) {
            userStats.voiceWeeklyMinutes = 0;
            userStats.voiceWeeklyHours = 0;
            userStats.lastWeeklyResetVoice = now.toDate();  // Haftalık ses sıfırlama zamanı
          }

          // Veritabanında güncelleniyor
          await userStats.save();
        }
      }

    } catch (error) {
      console.error('Voice state update sırasında hata oluştu:', error);
    }
  }
};
