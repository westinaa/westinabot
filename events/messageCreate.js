client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Kullanıcı istatistiklerini al
  let userStats = await UserStats.findOne({ userId: message.author.id });

  if (!userStats) {
    userStats = new UserStats({ userId: message.author.id });
  }

  // Mesaj sayısını güncelle
  userStats.messages += 1;
  
  // Veritabanına kaydet
  await userStats.save();
});