const { permissions } = require("../../utils/permissions.js");
const { EmbedBuilder } = require("discord.js");
const UserModel = require("../../models/userModel.js"); // UserModel'i dahil ediyoruz (Ban, Mute, Jail için)

module.exports = {
    name: "sicil",
    description: "Kullanıcının tüm ceza geçmişini gösterir",
    async execute(message, args) {
        // Sadece moderatörlerin komut kullanabilmesini sağla
        if (!permissions.checkModerator(message.member)) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ffffff")  // Rengi beyaz yaptım
                .setDescription("<a:westina_red:1349419144243576974> Bu komutu kullanma yetkiniz yok!")
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [errorEmbed] });
        }

        let user;
        let userTag = ''; // Kullanıcı etiketi

        // 1. ID veya etiket kontrolü
        if (message.mentions.users.size > 0) {
            user = message.mentions.users.first(); // Etiketlenen kullanıcıyı al
            userTag = `<@${user.id}>`;
        } else if (args[0]) {
            // ID üzerinden kullanıcı araması
            const userId = args[0];
            user = await message.guild.members.fetch(userId).catch(() => null);
            if (user) userTag = `<@${user.id}>`;
        } else {
            // Eğer kullanıcı ne etiketlenmiş ne de ID verilmişse, komutla ilgili işlem yapmayalım.
            const errorEmbed = new EmbedBuilder()
                .setColor("#ffffff")  // Rengi beyaz yaptım
                .setTitle("Eksik argüman!")
                .setDescription("<a:westina_red:1349419144243576974> Kullanıcının ID'sini girmelisiniz ya da etiketlemelisiniz!")
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [errorEmbed] });
        }

        // Kullanıcı bulunamazsa hata mesajı ver
        if (!user) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ffffff")  // Rengi beyaz yaptım
                .setTitle("Geçersiz kullanıcı!")
                .setDescription("<a:westina_red:1349419144243576974> Bu ID veya etiket ile bir kullanıcı bulunamadı!")
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [errorEmbed] });
        }

        // Veritabanından ceza geçmişini çekme
        try {
            // UserModel üzerinden ban, mute ve jail verilerini çekiyoruz
            const userData = await UserModel.findOne({ userId: user.id, guildId: message.guild.id });

            if (!userData) {
                const noDataEmbed = new EmbedBuilder()
                    .setColor("#ffffff")  // Rengi beyaz yaptım
                    .setTitle("Ceza Geçmişi")
                    .setDescription(`${userTag} kullanıcısının herhangi bir ceza geçmişi bulunmamaktadır.`)
                    .setFooter({ text: "made by westina <3" });
                return message.reply({ embeds: [noDataEmbed] });
            }

            // Ceza geçmişini Embed formatında oluşturma
            let embedDescription = `**${userTag}** kullanıcısının ceza geçmişi:\n\n`;

            // Yasaklamalar (Banlar)
            if (userData.bans && userData.bans.length > 0) {
                embedDescription += `**Yasaklamalar:**\n`;
                userData.bans.forEach(ban => {
                    embedDescription += `- Yasaklanma Tarihi: ${ban.createdAt.toDateString()}\nSebep: ${ban.reason || 'Sebep belirtilmemiş'}\n\n`;
                });
            }

            // Mute ve Jail verileri
            if (userData.mutes && userData.mutes.length > 0) {
                embedDescription += `**Mutele Alınmalar:**\n`;
                userData.mutes.forEach(mute => {
                    embedDescription += `- Mute Tarihi: ${mute.createdAt.toDateString()}\nSebep: ${mute.reason || 'Sebep belirtilmemiş'}\n\n`;
                });
            }

            if (userData.jails && userData.jails.length > 0) {
                embedDescription += `**Jail Uygulamaları:**\n`;
                userData.jails.forEach(jail => {
                    embedDescription += `- Jail Uygulama Tarihi: ${jail.createdAt.toDateString()}\nSebep: ${jail.reason || 'Sebep belirtilmemiş'}\n\n`;
                });
            }

            // Sicil Embed
            const successEmbed = new EmbedBuilder()
                .setColor("#ffffff")  // Rengi beyaz yaptım
                .setTitle("<a:westina_onay:1349184023867691088> Kullanıcı Sicili")
                .setDescription(embedDescription)
                .setTimestamp()
                .setFooter({ text: message.guild.name });

            message.reply({ embeds: [successEmbed] });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ffffff")  // Rengi beyaz yaptım
                .setDescription("<a:westina_red:1349419144243576974> Ceza geçmişi çekilirken bir hata oluştu!")
                .setFooter({ text: message.guild.name });
            message.reply({ embeds: [errorEmbed] });
            console.error("Sicil komutu hatası:", error);
        }
    },
};
