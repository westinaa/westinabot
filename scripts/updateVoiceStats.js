const UserStats = require('../../models/userStats.js'); // Dizin yapısına göre kontrol et
const mongoose = require('mongoose');

async function updateOldData() {
  const dbURI = process.env.MONGODB; // MongoDB URI'sini environment variable'dan alıyoruz

  if (!dbURI) {
    console.error("MongoDB URI'si tanımlanmadı!");
    return;
  }

  // MongoDB'ye bağlanıyoruz
  await mongoose.connect(dbURI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  });

  const users = await UserStats.find();

  for (const user of users) {
    if (user.voiceActivity && (user.voiceHours === 0 && user.voiceMinutes === 0)) {
      user.voiceHours = Math.floor(user.voiceActivity / 3600);
      user.voiceMinutes = Math.floor((user.voiceActivity % 3600) / 60);
      await user.save();
      console.log(`✅ Güncellendi: ${user.userId} -> ${user.voiceHours} saat, ${user.voiceMinutes} dakika`);
    }
  }

  console.log('🔥 Tüm eski veriler başarıyla güncellendi!');
  mongoose.connection.close();
}

updateOldData().catch(console.error);