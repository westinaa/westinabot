const UserStats = require('../models/userStats.js');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    if (!newState.guild) return; // Eğer bir sunucuda değilse, devam etme

    const userStats = await UserStats.findOne({ userId: newState.id });

    if (newState.channel && !oldState.channel) {
      // Kanalda aktif oldu
      if (userStats) {
        userStats.voiceActivity += 1; // Burada aktiflik süresini arttırabilirsin (saniye cinsinden)
        await userStats.save();
      }
    } else if (!newState.channel && oldState.channel) {
      // Kanaldan ayrıldı
      // Aktiflik süresi eklenebilir veya başka bir işlem yapılabilir
    }
  },
};