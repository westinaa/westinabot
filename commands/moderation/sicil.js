const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const UserModel = require('../../models/userModel.js'); // MongoDB Model

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
        const dateA = a.createdAt ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt ? b.createdAt.getTime() : 0;
        return dateB - dateA;
      });

      // Sayfalama ayarları
      const perPage = 5;
      let page = 0;

      const generateEmbed = (page) => {
        const start = page * perPage;
        const end = start + perPage;
        const currentPunishments = allPunishments.slice(start, end);

        const punishmentList = currentPunishments.map(p => {
          const punishmentDate = p.createdAt ? `<t:${Math.floor(p.createdAt.getTime() / 1000)}:R>` : 'Tarih Bilgisi Yok';
          const moderator = p.moderatorId ? `<@${p.moderatorId}>` : 'Bilinmiyor';
          const reason = p.reason || 'Sebep Bilgisi Yok';

          // Ceza türüne göre emoji ekle
          let emoji;
          switch (p.type) {
            case 'Ban':
              emoji = '<a:pepeban:1345852922533122160>';
              break;
            case 'Jail':
              emoji = '<:w_jail:1349478025170784278>';
              break;
            case 'Mute':
              emoji = '<:Mute2:1216364500865908806>';
              break;
            case 'VMute':
              emoji = '<:Mute:1216364483371335793>';
              break;
            default:
              emoji = '';
              break;
          }

          return `**${emoji} ${p.type}** • ${punishmentDate}\n` +
                 `<:wstaff:1349521387517382780> **Yetkili:** ${moderator}\n` +
                 `<:update:1346630749046181953> **Sebep:** ${reason}\n`;
        }).join('\n');

        return new EmbedBuilder()
          .setTitle(`${user.username} Kullanıcı Sicili`)
          .setDescription(punishmentList || 'Bu sayfada ceza yok.')
          .setColor('#ffffff')
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
