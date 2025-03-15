const { MessageEmbed } = require('discord.js');
const UserModel = require('../models/userModel');
const Punishment = require('../models/Punishment');

module.exports = {
  name: 'sicil', // Komut adı
  description: 'Kullanıcının geçmiş cezalarını gösterir.',

  async execute(message, args) {
    // Kullanıcıyı bul
    const userId = args[0] || message.author.id;
    const user = await UserModel.findOne({ userId: userId });

    if (!user) {
      return message.reply('Bu kullanıcı bulunamadı.');
    }

    // Ceza geçmişlerini al
    const mutes = user.mutes || [];
    const jails = user.jails || [];
    const bans = user.bans || [];

    // Embed mesajı için başlık
    const embed = new MessageEmbed()
      .setTitle('Kullanıcı Cezaları - ' + (userId === message.author.id ? 'Sizin Geçmişiniz' : 'Kullanıcı: ' + userId))
      .setColor('#FFFFFF')  // Renk beyaz
      .setTimestamp()
      .setFooter('Ceza Bilgisi', message.guild.iconURL());

    // Ceza türlerini ekle
    let logContent = '';

    // Mute cezaları (SesMute)
    if (mutes.length > 0) {
      logContent += `**<:Mute2:1216364500865908806> Chat Mute Cezaları:**\n`;
      mutes.forEach(mute => {
        logContent += `• **Tarih:** <t:${Math.floor(mute.createdAt / 1000)}:R> - **Sebep:** <:update:1346630749046181953> ${mute.reason} - **Yetkili:** <:wstaff:1349521387517382780> <@${mute.moderatorId}>\n`;
      });
    }

    // Jail cezaları
    if (jails.length > 0) {
      logContent += `\n**<:w_jail:1349478025170784278> Jail Cezaları:**\n`;
      jails.forEach(jail => {
        logContent += `• **Tarih:** <t:${Math.floor(jail.createdAt / 1000)}:R> - **Sebep:** <:update:1346630749046181953> ${jail.reason} - **Yetkili:** <:wstaff:1349521387517382780> <@${jail.moderatorId}>\n`;
      });
    }

    // Ban cezaları
    if (bans.length > 0) {
      logContent += `\n**<a:aku_ban:1349419058721849526> Ban Cezaları:**\n`;
      bans.forEach(ban => {
        logContent += `• **Tarih:** <t:${Math.floor(ban.createdAt / 1000)}:R> - **Sebep:** <:update:1346630749046181953> ${ban.reason} - **Yetkili:** <:wstaff:1349521387517382780> <@${ban.moderatorId}>\n`;
      });
    }

    // Eğer ceza geçmişi yoksa
    if (logContent === '') {
      logContent = 'Bu kullanıcıya ait geçmiş ceza kaydı bulunmamaktadır.';
    }

    // Embed mesajını oluştur
    embed.setDescription(logContent);

    // Mesajı gönder
    message.channel.send({ embeds: [embed] });
  }
};
