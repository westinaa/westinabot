const { EmbedBuilder } = require('discord.js');
const UserStats = require('../../models/userStats');
const moment = require('moment');

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
          .setTitle('🏆 Sunucudaki En Aktif Kullanıcılar')
          .setDescription(leaderboard)
          .setColor('#FF0000');

        return message.channel.send({ embeds: [leaderboardEmbed] });
      }

      // Kullanıcı istatistiklerini göster
      const stats = await UserStats.findOne({ userId: user.id });

      if (!stats) {
        return message.channel.send("Bu kullanıcıya ait istatistik bulunamadı.");
      }

      // Embed formatını örneğe göre düzenle
      const embed = new EmbedBuilder()
.setAuthor({
  name: user.username,
  iconURL: user.displayAvatarURL({ dynamic: true })
})
        .setColor('#ffffff')
        .setDescription(`**${user}** üyesinin **${moment().format('D MMMM YYYY HH:mm')}** tarihinden itibaren sunucudaki toplam ses ve mesaj bilgileri aşağıda belirtilmiştir.`)
        .addFields(
          { name: '**🗣️ Toplam Ses**', value: `${stats.voiceActivity || 0} saniye`, inline: false },
          { name: '**💬 Toplam Mesaj**', value: `${stats.messages || 0} mesaj`, inline: false },
          { name: '**📨 Toplam Davet**', value: `Veri bulunmuyor.`, inline: false }
        )
        .addFields(
          { name: '⭐ **Sesli Sohbet İstatistiği**', value: '\u200B', inline: false },
          { name: '🔊 **Genel Toplam Ses**', value: `${stats.voiceActivity || 0} saniye`, inline: true },
          { name: '💬 **Genel Toplam Mesaj**', value: `${stats.messages || 0} mesaj`, inline: true },
          { name: '🕰️ **Haftalık Ses**', value: `0 dakika`, inline: true },
          { name: '💬 **Haftalık Chat**', value: `3 mesaj`, inline: true },
          { name: '🕰️ **Günlük Ses**', value: `0 dakika`, inline: true },
          { name: '💬 **Günlük Chat**', value: `3 mesaj`, inline: true }
        )
        .addFields(
          { name: '🚀 **Davetler**', value: `0 (0 gerçek, 0 bonus, 0 ayrılmış, 0 fake)`, inline: false },
          { name: '🌟 **Daha geniş çaplı bilgilere erişmek için aşağıdaki butonları kullanınız!**', value: '\u200B', inline: false }
        )
        .setFooter({ text: 'Created by westina <3' });

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Hata oluştu:", error);
      message.channel.send("Bir hata oluştu.");
    }
  },
};