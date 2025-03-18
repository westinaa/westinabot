const { EmbedBuilder } = require('discord.js');
const UserStats = require('../models/userStats.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  name: 'stat',
  description: 'Kullanıcının istatistiklerini gösterir',
  async execute(message, args) {
    try {
      const targetUser = message.mentions.users.first() || 
                        await message.client.users.fetch(args[0]) || 
                        message.author;

      const userStats = await UserStats.findOne({ userId: targetUser.id });

      if (!userStats) {
        return message.reply('Bu kullanıcı için istatistik bulunamadı.');
      }

      // Ses süresini formatla
      const totalVoiceTime = moment.duration({
        hours: userStats.voiceHours,
        minutes: userStats.voiceMinutes
      }).format('H [saat], m [dakika]');

      // Davet istatistikleri
      const inviteStats = [
        `Toplam: ${userStats.invites.total}`,
        `Gerçek: ${userStats.invites.real}`,
        `Bonus: ${userStats.invites.bonus}`,
        `Ayrılan: ${userStats.invites.left}`,
        `Sahte: ${userStats.invites.fake}`
      ].join('\n');

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${targetUser.username} İstatistikleri`)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { 
            name: '💬 Mesaj İstatistikleri', 
            value: `Toplam Mesaj: ${userStats.messages}`, 
            inline: true 
          },
          { 
            name: '🎤 Ses İstatistikleri', 
            value: totalVoiceTime, 
            inline: true 
          },
          { 
            name: '📨 Davet İstatistikleri', 
            value: inviteStats,
            inline: false 
          }
        )
        .setFooter({ 
          text: `${message.guild.name}`, 
          iconURL: message.guild.iconURL() 
        })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Stat komutu hatası:', error);
      message.reply('İstatistikler gösterilirken bir hata oluştu.');
    }
  }
};