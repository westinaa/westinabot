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

      // Haftalık ve günlük mesaj istatistikleri
      const weeklyMessages = userStats.weeklyMessages || 0;
      const dailyMessages = userStats.dailyMessages || 0;
      
      // Haftalık ve günlük ses süresi için hesaplamalar
      const weeklyVoiceTime = moment.duration({
        hours: userStats.voiceWeeklyHours || 0,
        minutes: userStats.voiceWeeklyMinutes || 0
      }).format('H [saat], m [dakika]');

      const dailyVoiceTime = moment.duration({
        hours: userStats.voiceDailyHours || 0,
        minutes: userStats.voiceDailyMinutes || 0
      }).format('H [saat], m [dakika]');

      // Davet istatistikleri
      const inviteStats = [
        `Toplam: ${userStats.invites?.total || 0}`,
        `Gerçek: ${userStats.invites?.real || 0}`,
        `Bonus: ${userStats.invites?.bonus || 0}`,
        `Ayrılan: ${userStats.invites?.left || 0}`,
        `Sahte: ${userStats.invites?.fake || 0}`
      ].join('\n');

      // Haftalık mesaj sıfırlama kontrolü
      const lastWeeklyResetMessages = moment(userStats.lastWeeklyResetMessages);
      const lastWeeklyResetVoice = moment(userStats.lastWeeklyResetVoice);

      const embed = new EmbedBuilder()
        .setColor('#ffffff')
        .setAuthor({
          name: `${targetUser.username}`,
          iconURL: targetUser.displayAvatarURL(),
        })
        .setDescription(
          `${targetUser} üyesinin \`(${moment().format('YYYY-MM-DD')})\` tarihinden itibaren \`${message.guild.name}\` sunucusunda toplam ses ve mesaj bilgileri aşağıda belirtilmiştir:\n\n` +
          
          `<a:mesaj2:1216364533745188954> __**Mesaj İstatistikleri**__\n` +
          `Toplam Mesaj: \`${userStats.messages || 0}\`\n` +
          `Haftalık Mesaj: \`${weeklyMessages}\`\n` +
          `Günlük Mesaj: \`${dailyMessages}\`\n\n` +
          
          `<:voice:1349504902703091743> __**Ses İstatistikleri**__\n` +
          `Toplam Ses Süresi: \`${totalVoiceTime}\`\n` +
          `Haftalık Ses Süresi: \`${weeklyVoiceTime}\`\n` +
          `Günlük Ses Süresi: \`${dailyVoiceTime}\`\n\n` +

          `<:invite:1350472218500665417> __**Davet İstatistikleri**__\n` +
          `\`${inviteStats}\``
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
