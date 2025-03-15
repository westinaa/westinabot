
const { EmbedBuilder } = require("discord.js");
const config = require("../../config.js");

module.exports = {
    name: "restart",
    description: "Botu yeniden başlatır (sadece bot sahibi kullanabilir)",
    async execute(message, args) {
        // Sadece bot sahibinin komutu kullanabilmesini sağla
        if (message.author.id !== config.ownerId) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("❌ Bu komut sadece bot sahibi tarafından kullanılabilir!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const timestamp = Math.floor(Date.now() / 1000); // Komutun kullanıldığı anı kaydet

        const restartEmbed = new EmbedBuilder()
            .setColor("#ffffff")
            .setAuthor({
                name: message.client.user.username,  // Botun ismi
                iconURL: message.client.user.displayAvatarURL()  // Botun profil resmi
            })
            .setDescription("<a:aku_loading:1349419105622691911> Tüm komutları kaydedip sistemi tekrar başlatıyorum. \n<:seta:1346909730173354054> Bu işlem \`~ 1dk\` sürecektir.")
            .setFooter({ text: `<t:${timestamp}:R>` })
            .setTimestamp();

        await message.channel.send({ embeds: [restartEmbed] });
        
        console.log(`Bot ${message.author.tag} tarafından yeniden başlatılıyor...`);
        
        // Botu yeniden başlat
        setTimeout(() => {
            process.exit(0); // Process'i bitirerek Replit'in otomatik olarak yeniden başlatmasını sağlar
        }, 1000);
    },
};
