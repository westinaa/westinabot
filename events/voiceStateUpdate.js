const UserStats = require('../../models/userStats.js');
const { Events } = require('discord.js');

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    if (!oldState || !newState) return;

    const userId = newState.member.user.id;
    let userStats = await UserStats.findOne({ userId });

    if (!userStats) {
      userStats = new UserStats({ userId, voiceHours: 0, voiceMinutes: 0 });
    }

    // Kullanıcı ses kanalına girdiğinde
    if (!oldState.channelId && newState.channelId) {
      newState.member.voiceJoinTime = Date.now();
    } 
    // Kullanıcı ses kanalından çıktığında
    else if (oldState.channelId && !newState.channelId) {
      if (oldState.member.voiceJoinTime) {
        const elapsedTime = Date.now() - oldState.member.voiceJoinTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        try {
          await UserStats.findOneAndUpdate(
            { userId },
            {
              $inc: {
                voiceHours: hours,
                voiceMinutes: remainingMinutes
              }
            },
            { upsert: true }
          );
        } catch (error) {
          console.error('Ses istatistiği güncellenirken hata:', error);
        }
      }
    }
  }
};
