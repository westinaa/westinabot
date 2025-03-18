const { Events } = require('discord.js'); 
const UserStats = require('../models/userStats.js');

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

          // Veritabanında güncelleniyor
          await userStats.save();
        }
      }

    } catch (error) {
      console.error('Voice state update sırasında hata oluştu:', error);
    }
  }
};
