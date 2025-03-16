const UserStats = require('./models/userStats.js'); // MongoDB modelini import et

module.exports = {
  name: 'messageCreate', // Olay adı
  async execute(message) {
    // Botun kendi mesajlarını yoksay
    if (message.author.bot) return;

    try {
      // Kullanıcı istatistiklerini MongoDB'den al
      let userStats = await UserStats.findOne({ userId: message.author.id });

      if (!userStats) {
        // Eğer kullanıcıya ait istatistik yoksa, yeni bir istatistik oluştur
        userStats = new UserStats({ userId: message.author.id });
      }

      // Mesaj sayısını güncelle
      userStats.messages += 1;
      
      // Veritabanına kaydet
      await userStats.save();
    } catch (error) {
      console.error('Mesaj işlenirken hata oluştu:', error);
    }
  },
};