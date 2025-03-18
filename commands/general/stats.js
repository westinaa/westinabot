const { EmbedBuilder } = require('discord.js');
const UserStats = require('../../models/userStats.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  name: 'stat',
  description: 'Kullanıcının istatistiklerini gösterir',
  async execute(message, args) {
    try {
      let targetUser;
      
      if (args[0]) {
        try {
          // Önce mention kontrolü
          targetUser = message.mentions.users.first();
          
          // Mention yoksa ID ile dene
          if (!targetUser) {
            targetUser = await message.client.users.fetch(args[0]);
          }
        } catch (error) {
          return message.reply('Geçerli bir kullanıcı belirtmelisiniz!');
        }
      } else {
        targetUser = message.author;
      }

      if (!targetUser) {
        return message.reply('Kullanıcı bulunamadı!');
      }

      const userStats = await UserStats.findOne({ userId: targetUser.id });

      if (!userStats) {
        return message.reply('Bu kullanıcı için istatistik bulunamadı.');
      }

      // Ses süresini formatla
      const totalVoiceTime = moment.duration({
        hours: userStats.voiceHours || 0,
        minutes: userStats.voiceMinutes || 0
      }).format('H [saat], m [dakika]');

      // Davet istatistikleri
      const inviteStats = [
        `Toplam: ${userStats.invites?.total || 0}`,
        `Gerçek: ${userStats.invites?.real || 0}`,
        `Bonus: ${userStats.invites?.bonus || 0}`,
        `Ayrılan: ${userStats.invites?.left || 0}`,
        `Sahte: ${userStats.invites?.fake || 0}`
      ].join('\n');

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${targetUser.username} İstatistikleri`)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { 
            name: '💬 Mesaj İstatistikleri', 
            value: `Toplam Mesaj: ${userStats.messages || 0}`, 
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
          text: message.guild.name, 
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