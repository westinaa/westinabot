const UserStats = require('../models/userStats.js'); // MongoDB modelini import et

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    console.log(message); // Mesaj objesini logla
    
    if (!message || !message.author) return; // Mesaj veya mesaj yazarını kontrol et

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