
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'davet',
    description: 'Bot davet linki ve destek sunucusu bilgilerini gösterir',
    async execute(message, args) {
        // Bot ID'sini al (bu client.user.id olacak)
        const botId = message.client.user.id;
        
        // Bot davet linki
        const inviteLink = `https://discord.com/oauth2/authorize?client_id=${botId}&permissions=8&scope=bot%20applications.commands`;
        
        // Destek sunucusu linki - Gerçek linki buraya ekleyin
        const supportServerLink = 'https://discord.gg/mabet';

        // Embed oluştur
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🤖 Bot Davet Bilgileri')
            .setDescription('Aşağıdaki butonları kullanarak botu sunucunuza ekleyebilir veya destek sunucumuza katılabilirsiniz.')
            .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: message.guild.name });

        // Butonları oluştur
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('📨 Botu Davet Et')
                    .setStyle(ButtonStyle.Link)
                    .setURL(inviteLink),
                new ButtonBuilder()
                    .setLabel('🔧 Destek Sunucusu')
                    .setStyle(ButtonStyle.Link)
                    .setURL(supportServerLink)
            );

        // Mesajı gönder
        await message.channel.send({
            embeds: [embed],
            components: [row]
        });
    },
};
