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
      allPunishments.sort((a, b) => b.createdAt - a.createdAt);

      // Sayfalama ayarları
      const perPage = 5;
      let page = 0;

      const generateEmbed = (page) => {
        const start = page * perPage;
        const end = start + perPage;
        const currentPunishments = allPunishments.slice(start, end);

        const punishmentList = currentPunishments.map(p =>
          `**${p.type}** • <t:${Math.floor(p.createdAt.getTime() / 1000)}:R>\n` +
          `🔹 **Yetkili:** <@${p.moderatorId}>\n` +
          `🔹 **Sebep:** ${p.reason}\n`
        ).join('\n');

        return new EmbedBuilder()
          .setTitle(`${user.tag} Kullanıcı Sicili`)
          .setDescription(punishmentList || 'Bu sayfada ceza yok.')
          .setColor('#ff0000')
          .setFooter({ text: `Sayfa ${page + 1}/${Math.ceil(allPunishments.length / perPage)}` });
      };

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('⬅️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('➡️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(allPunishments.length <= perPage)
        );

      const msg = await message.reply({ embeds: [generateEmbed(page)], components: [row] });

      // Butonlara tepki verme
      const filter = (interaction) => interaction.user.id === message.author.id;
      const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async (interaction) => {
        if (interaction.customId === 'prev' && page > 0) {
          page--;
        } else if (interaction.customId === 'next' && page < Math.ceil(allPunishments.length / perPage) - 1) {
          page++;
        }

        const newRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('prev')
              .setLabel('⬅️')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('➡️')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page >= Math.ceil(allPunishments.length / perPage) - 1)
          );

        await interaction.update({ embeds: [generateEmbed(page)], components: [newRow] });
      });

      collector.on('end', () => {
        msg.edit({ components: [] }).catch((err) => console.error('Error when removing components:', err));
      });
    } catch (error) {
      console.error('Error executing the sicil command:', error);
      message.reply('Komut çalıştırılırken bir hata oluştu.');
    }
  },
};
