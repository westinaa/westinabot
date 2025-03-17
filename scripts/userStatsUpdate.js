const UserStats = require('../models/userStats.js'); // UserStats modelini dahil ediyoruz
const mongoose = require('mongoose');

async function updateOldData() {
  const dbURI = process.env.MONGODB; // MongoDB URI'nizi process.env üzerinden alıyoruz

  if (!dbURI) {
    console.error("MongoDB URI'si tanımlanmadı!");
    return;
  }

  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB'ye bağlanıldı!");

    const users = await UserStats.find(); // Kullanıcıları alıyoruz

    for (const user of users) {
      // Eğer kullanıcının voiceActivity'si varsa ve saat/dakika sıfırsa
      if (user.voiceActivity && (user.voiceHours === 0 && user.voiceMinutes === 0)) {
        // VoiceActivity'yi saat ve dakikaya çeviriyoruz
        user.voiceHours = Math.floor(user.voiceActivity / 3600);
        user.voiceMinutes = Math.floor((user.voiceActivity % 3600) / 60);
        
        await user.save();  // Veriyi kaydediyoruz
        console.log(`✅ Güncellendi: ${user.userId} -> ${user.voiceHours} saat, ${user.voiceMinutes} dakika`);
      }
    }

    console.log('🔥 Tüm eski veriler başarıyla güncellendi!');
  } catch (error) {
    console.error("MongoDB bağlantısı veya veri güncelleme sırasında hata oluştu:", error);
  } finally {
    mongoose.connection.close(); // Bağlantıyı kapatıyoruz
  }
}

module.exports = { updateOldData }; // Fonksiyonu dışa aktarıyoruz