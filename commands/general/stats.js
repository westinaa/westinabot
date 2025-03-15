const { MessageEmbed } = require('discord.js');
const UserStats = require('../models/userStats');
const moment = require('moment');

module.exports = {
  name: 'stats',
  description: 'Bir kullanıcının mesaj ve sesli kanal istatistiklerini gösterir.',
  async execute(message, args) {
    if (!args[0]) return message.reply('Lütfen istatistiklerini görmek istediğiniz kullanıcıyı belirtin.');
    
    const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
    if (!user) return message.reply('Geçerli bir kullanıcı bulunamadı.');

    let timePeriod = args[1] ? args[1].toLowerCase() : null;
    let timeLimit = null;

    // Zaman dilimi kontrolü
    if (timePeriod) {
      const days = parseInt(timePeriod);
      if (days && days > 0) {
        timeLimit = moment().subtract(days, 'days').toDate();
      } else {
        return message.reply('Geçersiz zaman dilimi girdiniz. Lütfen geçerli bir zaman dilimi belirtin (örnek: 1g, 7g, 10g).');
      }
    }

    // Kullanıcı verilerini MongoDB'den al
    const userStats = await UserStats.findOne({ userId: user.id });

    if (!userStats) {
      return message.reply('Bu kullanıcıya ait istatistik bulunamadı.');
    }

    let totalVoiceTime = 0;
    let channelMessages = {};

    // Sesli kanal verisini ve mesaj sayılarını hesapla
    userStats.voiceStats.forEach(voiceStat => {
      if (!timeLimit || voiceStat.joinTime >= timeLimit) {
        totalVoiceTime += voiceStat.totalTime;  // Toplam sesli kanal süresi
      }
    });

    // Mesaj sayılarını filtrele
    userStats.messages.forEach((count, channelId) => {
      if (!timeLimit || new Date(channelId) >= timeLimit) {
        channelMessages[channelId] = count;  // Her kanal için mesaj sayısı
      }
    });

    // Sonuçları yanıt olarak gönder
    const formattedVoiceTime = moment.duration(totalVoiceTime).humanize();  // Sesli kanal süresi formatlama
    const messageStats = Object.entries(channelMessages)
      .map(([channelId, count]) => `<#${channelId}>: ${count} mesaj`)
      .join('\n');

    let reply = new MessageEmbed()
      .setTitle(`${user.tag} İstatistikleri`)
      .setDescription(timePeriod ? `Zaman dilimi: son ${timePeriod}.` : 'Tüm zamanlar:')
      .addFields(
        { name: 'Sesli Kanal Süresi', value: formattedVoiceTime, inline: true },
        { name: 'Mesaj Sayıları', value: messageStats || 'Hiç mesaj gönderilmedi.', inline: false }
      )
      .setColor('#3498db');

    message.reply({ embeds: [reply] });
  },
};
