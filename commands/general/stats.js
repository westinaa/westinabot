const { MessageEmbed } = require('discord.js');
const UserStats = require('../../models/userStats.js');
const moment = require('moment');

module.exports = {
  name: 'stats',
  description: 'Bir kullanıcının mesaj ve sesli kanal istatistiklerini gösterir.',
  async execute(message, args) {
    if (!args[0]) return message.reply('Lütfen istatistiklerini görmek istediğiniz kullanıcıyı belirtin.');
    
    const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
    if (!user) return message.reply('Geçerli bir kullanıcı bulunamadı.');

    console.log(`Kullanıcı ID: ${user.id}`);

    let timePeriod = args[1] ? args[1].toLowerCase() : null;
    let timeLimit = null;

    if (timePeriod) {
      const days = parseInt(timePeriod);
      if (days && days > 0) {
        timeLimit = moment().subtract(days, 'days').toDate();
      } else {
        return message.reply('Geçersiz zaman dilimi girdiniz. Lütfen geçerli bir zaman dilimi belirtin (örnek: 1g, 7g, 10g).');
      }
    }

    const userStats = await UserStats.findOne({ userId: user.id }).lean();

    console.log(`Veri çekildi:`, userStats);

    if (!userStats) {
      return message.reply('Bu kullanıcıya ait istatistik bulunamadı.');
    }

    const messages = userStats.messages || {};
    const voiceStats = userStats.voiceStats || [];

    console.log(`Mesajlar:`, messages);
    console.log(`Sesli verileri:`, voiceStats);

    if (Object.keys(messages).length === 0 && voiceStats.length === 0) {
      return message.reply('Bu kullanıcıya ait istatistik bulunamadı.');
    }

    let totalVoiceTime = 0;
    let channelMessages = {};

    voiceStats.forEach(voiceStat => {
      if (!timeLimit || voiceStat.joinTime >= timeLimit) {
        totalVoiceTime += voiceStat.totalTime;
      }
    });

    Object.entries(messages).forEach(([channelId, count]) => {
      if (!timeLimit || new Date(channelId) >= timeLimit) {
        channelMessages[channelId] = count;
      }
    });

    const formattedVoiceTime = moment.duration(totalVoiceTime, 'seconds').humanize();
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
