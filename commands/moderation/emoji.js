const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "emoji",
    description: "Bir emojiyi sunucuya ekler",
    async execute(message, args) {
        // Yetki kontrolü: "Emojileri Yönet" yetkisi olup olmadığını kontrol et
        if (!message.member.permissions.has("ManageEmojisAndStickers")) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor("#ffffff")
                    .setDescription("<a:w_carpi:1350461649751900271> Bu komutu kullanmak için `Emojileri Yönet` yetkiniz olmalıdır!")]
            });
        }

        // Argüman kontrolü (emoji ve isim olmalı)
        if (args.length < 2) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor("#ffffff")
                    .setDescription("<a:w_carpi:1350461649751900271> Kullanım: `.emoji <emoji> <emoji-ismi>`")]
            });
        }

        const emojiArg = args[0]; // Kullanıcının yazdığı emoji
        const emojiName = args[1]; // Kullanıcının belirttiği emoji ismi

        // Emoji URL'sini alma (özel veya genel emoji mi?)
        const emojiMatch = emojiArg.match(/^<a?:\w+:(\d+)>$/); // Emoji formatını kontrol et
        if (!emojiMatch) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor("#ffffff")
                    .setDescription("<a:w_carpi:1350461649751900271> Geçerli bir emoji belirtmelisiniz! (Örneğin: `:emoji_name:`)")]
            });
        }

        const emojiId = emojiMatch[1]; // Emoji ID'sini al
        const isAnimated = emojiArg.startsWith("<a:"); // Hareketli emoji mi?
        const emojiURL = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? "gif" : "png"}`; // Emoji URL'sini oluştur

        try {
            // Emojiyi sunucuya ekle
            const newEmoji = await message.guild.emojis.create({
                attachment: emojiURL,
                name: emojiName
            });

            const successEmbed = new EmbedBuilder()
                .setColor("#ffffff")
                .setTitle("<a:westina_onay:1349184023867691088> Emoji Eklendi!")
                .setDescription(`**:${emojiName}:** emojisi başarıyla sunucuya eklendi!`)
                .setThumbnail(newEmoji.url)
                .addFields({ name: "Kullanım", value: `\`:${emojiName}:\``, inline: true })
                .setFooter({ text: message.guild.name });

            return message.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error("Emoji ekleme hatası:", error);
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor("#ffffff")
                    .setDescription("<a:w_carpi:1350461649751900271> Emoji eklenirken bir hata oluştu! Sunucuda yeterli emoji slotu olmayabilir.")]
            });
        }
    },
};
