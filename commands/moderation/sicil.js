const { EmbedBuilder } = require('discord.js');
const UserModel = require('../../models/userModel.js');
const Punishment = require('../../models/Punishment.js');

module.exports = {
  name: 'sicil',
  description: 'Kullanıcının geçmiş cezalarını gösterir.',

  async execute(message, args) {
    const userId = (args[0] || message.author.id).toString();  // ID'yi String formatına çeviriyoruz
    console.log('Aranan Kullanıcı ID:', userId);  // ID'yi loglayalım

    try {
      // Kullanıcıyı veritabanından bul
      const user = await UserModel.findOne({ userId: userId });

      if (!user) {
        console.log('Veritabanında kullanıcı bulunamadı', userId);  // Veritabanında kullanıcı bulunamazsa logla
        return message.reply('Veritabanımda bu kullanıcının ceza kaydı bulunmuyor..');
      }

      // Ceza geçmişlerini al
      const mutes = user.mutes || [];
      const jails = user.jails || [];
      const bans = user.bans || [];

      // Embed mesajı için başlık
      const embed = new EmbedBuilder()
        .setTitle('Kullanıcı Cezaları - ' + (userId === message.author.id ? 'Sizin Geçmişiniz' : 'Kullanıcı: ' + userId))
        .setColor('#FFFFFF')
        .setTimestamp()
        .setFooter({ text: 'Ceza Bilgisi', iconURL: message.guild.iconURL() });

      // Ceza türlerini ekle
      let logContent = '';

      // Mute cezaları
      if (mutes.length > 0) {
        logContent += `**<:Mute2:1216364500865908806> Chat Mute Cezaları:**\n`;
        mutes.forEach(mute => {
          logContent += `\` ❯ \` <:events9:1350560935739133952> **Tarih:** <t:${Math.floor(mute.createdAt / 1000)}:R> \n\` ❯ \` <:update:1346630749046181953> **Sebep:** \` ${mute.reason} \` \n\` ❯ \<:wstaff:1349521387517382780> **Yetkili:** <@${mute.moderatorId}>\n`;
        });
      }

      // Jail cezaları
      if (jails.length > 0) {
        logContent += `\n**<:w_jail:1349478025170784278> Jail Cezaları:**\n`;
        jails.forEach(jail => {
          logContent += `\` ❯ \` <:events9:1350560935739133952> **Tarih:** <t:${Math.floor(jail.createdAt / 1000)}:R> \n\` ❯ \` <:update:1346630749046181953> **Sebep:** \` ${jail.reason} \` \n\` ❯ \<:wstaff:1349521387517382780> **Yetkili:** <@${jail.moderatorId}>\n`;
        });
      }

      // Ban cezaları
      if (bans.length > 0) {
        logContent += `\n**<a:aku_ban:1349419058721849526> Ban Cezaları:**\n`;
        bans.forEach(ban => {
          logContent += `\` ❯ \` <:events9:1350560935739133952> **Tarih:** <t:${Math.floor(ban.createdAt / 1000)}:R> \n\` ❯ \` <:update:1346630749046181953> **Sebep:** \` ${ban.reason} \` \n\` ❯ \<:wstaff:1349521387517382780> **Yetkili:** <@${ban.moderatorId}>\n`;
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

    } catch (error) {
      console.error('Veritabanı hatası:', error);
      message.reply('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }
};
