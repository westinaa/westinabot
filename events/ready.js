const { Events, EmbedBuilder } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`${client.user.tag} başarıyla giriş yaptı!`); // Konsola mesaj

        const channelId = "KANAL_ID"; // Buraya mesajın gideceği kanalın ID'sini yaz
        const channel = client.channels.cache.get(channelId);

        if (channel) {
            const embed = new EmbedBuilder()
                .setColor("#ffffff")
                .setTitle("🚀 Bot Başlatıldı!")
                .setDescription("Bot başarıyla yeniden başlatıldı ve şimdi aktif!")
                .setTimestamp()
                .setFooter({ text: client.user.username });

            channel.send({ embeds: [embed] }); // Kanala mesaj gönder
        } else {
            console.log("Belirtilen kanal bulunamadı, mesaj gönderilemedi!");
        }
    },
};
