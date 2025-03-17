const { EmbedBuilder } = require('discord.js');
const UserStats = require('../../models/userStats.js');
const moment = require("moment")

module.exports = {
  name: 'stats',
  description: 'Kullanıcı istatistiklerini gösterir ve sıralama yapar.',
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;

    try {
      // Eğer "top" argümanı girilmişse sıralamayı göster
      if (args[0] === 'top') {
        const allUsersStats = await UserStats.find();
        const sortedStats = allUsersStats.sort((a, b) => (b.messages + b.voiceActivity) - (a.messages + a.voiceActivity));

        let leaderboard = '';
        sortedStats.slice(0, 5).forEach((userStat, index) => {
          leaderboard += `${index + 1}. <@${userStat.userId}> - Mesajlar: ${userStat.messages}, Ses Aktifliği: ${userStat.voiceActivity}s\n`;
        });

        const leaderboardEmbed = new EmbedBuilder()
          .setTitle('Sunucudaki En Aktif Kullanıcılar')
          .setDescription(leaderboard)
          .setColor('#FF0000');

        return message.channel.send({ embeds: [leaderboardEmbed] });
      }

      // Kullanıcı istatistiklerini göster
      const stats = await UserStats.findOne({ userId: user.id });

      if (!stats) {
        return message.channel.send("Bu kullanıcıya ait istatistik bulunamadı.");
      }

      const embed = new EmbedBuilder()
        .setTitle(`${user.username} İstatistikleri`)
        .addFields(
          { name: 'Mesaj Sayısı (Kanal Bazında):', value: String(stats.messages) || '0', inline: true },
          { name: 'Ses Aktifliği (saniye):', value: String(stats.voiceActivity) || '0', inline: true }
        )
        .setColor('#00FF00');

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Hata oluştu:", error);
      message.channel.send("Bir hata oluştu.");
    }
  },
};