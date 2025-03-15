
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

        const restartEmbed = new EmbedBuilder()
            .setColor("#00ff00")
            .setDescription("🔄 Bot yeniden başlatılıyor...")
            .setFooter({ text: message.guild.name })
            .setTimestamp();

        await message.channel.send({ embeds: [restartEmbed] });
        
        console.log(`Bot ${message.author.tag} tarafından yeniden başlatılıyor...`);
        
        // Botu yeniden başlat
        setTimeout(() => {
            process.exit(0); // Process'i bitirerek Replit'in otomatik olarak yeniden başlatmasını sağlar
        }, 1000);
    },
};
