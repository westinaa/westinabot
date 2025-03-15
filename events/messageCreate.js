const UserStats = require('../models/userStats.js'); // models klasörüne göre doğru yol

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    // message objesinin undefined olmaması için kontrol ekleyelim
    if (!message || !message.author) return;

    if (message.author.bot) return; // Botların mesajlarını sayma

    // Kullanıcı verisini MongoDB'den al
    const stats = await UserStats.findOne({ userId: message.author.id });

    if (stats) {
      stats.messages += 1; // Mesaj sayısını arttır
      await stats.save();
    } else {
      // Eğer kullanıcıya ait istatistik yoksa yeni oluştur
      const newStats = new UserStats({
        userId: message.author.id,
        messages: 1,
      });
      await newStats.save();
    }
  },
};