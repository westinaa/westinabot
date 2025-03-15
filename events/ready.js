const { Events, EmbedBuilder } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`${client.user.tag} başarıyla giriş yaptı!`); // Konsola mesaj

        const channelId = "1350464454252560454"; // Buraya mesajın gideceği kanalın ID'sini yaz
        const channel = client.channels.cache.get(channelId);

        if (channel) {
            const embed = new EmbedBuilder()
                .setColor("#ffffff")
                .setTitle("🚀 Bot başarıyla başlatıldı.")
                .setDescription("<a:westina_onay:1349184023867691088> Bot, VDS, MongoDB girişleri başarılı oldu ve şu an aktif.")
                .setTimestamp()
                .setFooter({ text: client.user.username });

            channel.send({ embeds: [embed] }); // Kanala mesaj gönder
        } else {
            console.log("Belirtilen kanal bulunamadı, mesaj gönderilemedi!");
        }
    },
};
