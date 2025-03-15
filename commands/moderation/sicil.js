const { permissions } = require("../../utils/permissions.js");
const { EmbedBuilder } = require("discord.js");
const UserModel = require("../../models/userModel.js");

module.exports = {
    name: "sicil",
    description: "Kullanıcının tüm ceza geçmişini gösterir",
    async execute(message, args) {
        if (!permissions.checkModerator(message.member)) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ffffff")
                .setDescription("<a:westina_red:1349419144243576974> Bu komutu kullanma yetkiniz yok!")
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [errorEmbed] });
        }

        let user;
        let userTag = '';

        if (message.mentions.users.size > 0) {
            user = message.mentions.users.first();
            userTag = `<@${user.id}>`;
        } else if (args[0]) {
            const userId = args[0];
            user = await message.guild.members.fetch(userId).catch(() => null);
            if (user) userTag = `<@${user.id}>`;
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ffffff")
                .setTitle("Eksik argüman!")
                .setDescription("<a:westina_red:1349419144243576974> Kullanıcının ID'sini girmelisiniz ya da etiketlemelisiniz!")
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [errorEmbed] });
        }

        if (!user) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ffffff")
                .setTitle("Geçersiz kullanıcı!")
                .setDescription("<a:westina_red:1349419144243576974> Bu ID veya etiket ile bir kullanıcı bulunamadı!")
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [errorEmbed] });
        }

        try {
            const userData = await UserModel.findOne({ userId: user.id, guildId: message.guild.id });

            if (!userData) {
                const noDataEmbed = new EmbedBuilder()
                    .setColor("#ffffff")
                    .setTitle("Ceza Geçmişi")
                    .setDescription(`${userTag} kullanıcısının herhangi bir ceza geçmişi bulunmamaktadır.`)
                    .setFooter({ text: "made by westina <3" });
                return message.reply({ embeds: [noDataEmbed] });
            }

            let penalties = [];

            if (userData.bans) {
                userData.bans.forEach(ban => {
                    penalties.push({
                        type: "⛔ Yasaklama",
                        timestamp: `<t:${Math.floor(new Date(ban.createdAt).getTime() / 1000)}:F>`,
                        reason: ban.reason || "Sebep belirtilmemiş"
                    });
                });
            }

            if (userData.mutes) {
                userData.mutes.forEach(mute => {
                    penalties.push({
                        type: "🔇 Susturma",
                        timestamp: `<t:${Math.floor(new Date(mute.createdAt).getTime() / 1000)}:F>`,
                        reason: mute.reason || "Sebep belirtilmemiş"
                    });
                });
            }

            if (userData.jails) {
                userData.jails.forEach(jail => {
                    penalties.push({
                        type: "🚔 Jail",
                        timestamp: `<t:${Math.floor(new Date(jail.createdAt).getTime() / 1000)}:F>`,
                        reason: jail.reason || "Sebep belirtilmemiş"
                    });
                });
            }

            if (penalties.length === 0) {
                const noDataEmbed = new EmbedBuilder()
                    .setColor("#ffffff")
                    .setTitle("Ceza Geçmişi")
                    .setDescription(`${userTag} kullanıcısının herhangi bir ceza geçmişi bulunmamaktadır.`)
                    .setFooter({ text: "made by westina <3" });
                return message.reply({ embeds: [noDataEmbed] });
            }

            // Tarihe göre sıralama (en eski en yukarıda olacak şekilde)
            penalties.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            // Timeline oluşturma
            let timelineDescription = "";
            penalties.forEach((penalty, index) => {
                timelineDescription += `**${penalty.type}**\n📅 ${penalty.timestamp}\n📌 **Sebep:** ${penalty.reason}\n`;
                if (index !== penalties.length - 1) {
                    timelineDescription += `\n⬇️\n`;
                }
            });

            const successEmbed = new EmbedBuilder()
                .setColor("#ffffff")
                .setTitle("<a:westina_onay:1349184023867691088> Kullanıcı Sicili")
                .setDescription(`**${userTag}** kullanıcısının ceza geçmişi:\n\n${timelineDescription}`)
                .setTimestamp()
                .setFooter({ text: message.guild.name });

            message.reply({ embeds: [successEmbed] });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ffffff")
                .setDescription("<a:westina_red:1349419144243576974> Ceza geçmişi çekilirken bir hata oluştu!")
                .setFooter({ text: message.guild.name });
            message.reply({ embeds: [errorEmbed] });
            console.error("Sicil komutu hatası:", error);
        }
    },
};
