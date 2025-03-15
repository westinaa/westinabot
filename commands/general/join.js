const { joinVoiceChannel } = require('@discordjs/voice');
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "join",
    description: "Botun bulunduğunuz ses kanalına katılmasını sağlar",
    async execute(message, args) {
        // Eğer bot zaten bir ses kanalında ise, bu komut çalışmaz
        if (message.guild.me.voice.channel) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Bot zaten bir ses kanalına bağlı!")
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [errorEmbed] });
        }

        // Eğer mesajı gönderen kişi bir ses kanalında değilse
        if (!message.member.voice.channel) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Bir ses kanalına katılmalısınız!")
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [errorEmbed] });
        }

        // Kullanıcının bulunduğu ses kanalına bağlan
        const connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id, // Kullanıcının bulunduğu kanal
            guildId: message.guild.id, // Sunucu ID
            adapterCreator: message.guild.voiceAdapterCreator, // Ses adapteri
        });

        const successEmbed = new EmbedBuilder()
            .setColor("#00ff00")
            .setDescription("<a:westina_onay:1349184023867691088> Bot başarıyla ses kanalına katıldı!")
            .setFooter({ text: "made by westina <3" });
        
        message.reply({ embeds: [successEmbed] });

        // Katıldığında ses kanalında belirli bir şey yapmak isterseniz, connection'ı kullanabilirsiniz.
        connection.on('error', (error) => {
            console.error('Ses kanalına bağlanırken bir hata oluştu:', error);
        });
    }
};
