const { EmbedBuilder } = require('discord.js'); // doğru import
const UserStats = require('../../models/userStats.js'); // MongoDB modelini import et
const moment = require('moment'); // Tarih formatlamak için

module.exports = {
  name: 'stats',
  description: 'Kullanıcı istatistiklerini gösterir ve sunucuyu sıralar.',
  async execute(message, args) {
    const guild = message.guild;

    // Kullanıcı belirtilmişse, belirtilen kullanıcıyı al
    let user = message.mentions.users.first() || message.author;

    try {
      // Kullanıcı verisini MongoDB'den al
      const stats = await UserStats.findOne({ userId: user.id });

      if (!stats) {
        console.error(`İstatistik bulunamadı: ${user.id}`); // Konsola hata yazdır
        return message.channel.send("Bu kullanıcıya ait istatistik bulunamadı.");
      }

      // Kanal bazında mesaj sayısı
      const userMessagesInChannel = stats.messages;
      const totalMessagesInGuild = await UserStats.aggregate([
        { $group: { _id: null, totalMessages: { $sum: "$messages" } } },
      ]);

      // Ses aktifliği
      const userVoiceActivity = stats.voiceActivity;
      const totalVoiceActivityInGuild = await UserStats.aggregate([
        { $group: { _id: null, totalVoiceActivity: { $sum: "$voiceActivity" } } },
      ]);

      // Embed mesaj
      const embed = new EmbedBuilder()
        .setTitle(`${user.username} İstatistikleri`)
        .addFields(
          { name: 'Kanal Bazında Mesaj Sayısı:', value: String(userMessagesInChannel) || '0', inline: true },
          { name: 'Sunucudaki Toplam Mesaj Sayısı:', value: String(totalMessagesInGuild[0]?.totalMessages) || '0', inline: true },
          { name: 'Kanal Bazında Ses Aktifliği (saniye):', value: String(userVoiceActivity) || '0', inline: true },
          { name: 'Sunucudaki Toplam Ses Aktifliği (saniye):', value: String(totalVoiceActivityInGuild[0]?.totalVoiceActivity) || '0', inline: true }
        )
        .setColor('#00FF00');

      message.channel.send({ embeds: [embed] });

      // Sunucudaki en aktif kullanıcıları sıralama
      const allUsersStats = await UserStats.find();
      const sortedStats = allUsersStats.sort((a, b) => (b.messages + b.voiceActivity) - (a.messages + a.voiceActivity));

      // Top 5 en aktif kullanıcılar
      let leaderboard = '';
      sortedStats.slice(0, 5).forEach((userStat, index) => {
        leaderboard += `${index + 1}. <@${userStat.userId}> - Mesajlar: ${userStat.messages}, Ses Aktifliği: ${userStat.voiceActivity}s\n`;
      });

      // Sıralamayı gönder
      const leaderboardEmbed = new EmbedBuilder()
        .setTitle('Sunucudaki En Aktif Kullanıcılar')
        .setDescription(leaderboard)
        .setColor('#FF0000');

      message.channel.send({ embeds: [leaderboardEmbed] });
    } catch (error) {
      console.error("Hata oluştu:", error); // Hata ayrıntılarını konsola yazdır
      message.channel.send("Bir hata oluştu.");
    }
  },
};