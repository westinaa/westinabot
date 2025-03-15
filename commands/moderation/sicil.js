const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const UserModel = require('../../models/userModel.js');

module.exports = {
  name: 'sicil',
  description: 'Bir kullanıcının ceza geçmişini gösterir.',
  async execute(message, args) {
    try {
      // Kullanıcıyı belirle
      const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
      if (!user) return message.reply('Lütfen geçerli bir kullanıcı etiketleyin veya ID girin.');

      // MongoDB'den kullanıcı verisini al
      const userData = await UserModel.findOne({ userId: user.id, guildId: message.guild.id });
      if (!userData) return message.reply('Bu kullanıcının sicili temiz!');

      // Cezaları birleştir
      const allPunishments = [
        ...userData.bans.map(p => ({ type: 'Ban', ...p })),
        ...userData.jails.map(p => ({ type: 'Jail', ...p })),
        ...userData.mutes.map(p => ({ type: 'Mute', ...p })),
        ...userData.vmutes.map(p => ({ type: 'VMute', ...p })),
      ];

      if (allPunishments.length === 0) return message.reply('Bu kullanıcının sicili temiz!');

      // Tarihe göre sıralama (En yeni cezalar en üstte olacak)
      allPunishments.sort((a, b) => {
        // createdAt kontrolü
        const dateA = a.createdAt ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt ? b.createdAt.getTime() : 0;
        return dateB - dateA;
   
