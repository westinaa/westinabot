const { permissions } = require("../../utils/permissions.js");
const logger = require("../../utils/logger.js");
const { EmbedBuilder } = require("discord.js");
const Ban = require("../../models/Ban"); // Ban modelini dahil et

module.exports = {
    name: "ban",
    description: "Kullanıcıyı sunucudan yasaklar",
    async execute(message, args) {
        if (!permissions.checkModerator(message.member)) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("❌ Bu komutu kullanma yetkiniz yok!")
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [errorEmbed] });
        }

        // Kullanıcıyı etiketleme veya ID ile alma
        let user = message.mentions.users.first();
        if (!user) {
            const userId = args[0];
            if (!userId) {
                const errorEmbed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setTitle("Eksik argüman!")
                    .setDescription("❌ Yasaklanacak kullanıcıyı etiketlemelisiniz ya da ID girmelisiniz!")
                    .setFooter({ text: "made by westina <3" });
                return message.reply({ embeds: [errorEmbed] });
            }
            user = await message.guild.members.fetch(userId).catch(() => null);
            if (!user) {
                const errorEmbed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setTitle("Geçersiz kullanıcı!")
                    .setDescription("❌ Bu ID ile bir kullanıcı bulunamadı!")
                    .setFooter({ text: "made by westina <3" });
                return message.reply({ embeds: [errorEmbed] });
            }
        }

        const reason = args.slice(1).join(" ") || "Sebep belirtilmedi";

        try {
            // Kullanıcıyı yasakla
            await message.guild.members.ban(user, { reason });

            // MongoDB'ye kaydet
            const newBan = new Ban({
                userId: user.id,
                moderatorId: message.author.id,
                reason: reason,
                guildId: message.guild.id,
            });

            await newBan.save(); // Yeni ban kaydını veritabanına kaydet

            const successEmbed = new EmbedBuilder()
                .setColor("#00ff00")
                .setTitle("🔨 Kullanıcı Yasaklandı")
                .setDescription(
                    `**${user.tag}** kullanıcısı başarıyla yasaklandı.`
                )
                .addFields(
                    {
                        name: "👮 Moderatör",
                        value: message.author.tag,
                        inline: true,
                    },
                    { name: "📝 Sebep", value: reason, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: message.guild.name });

            message.reply({ embeds: [successEmbed] });
            logger.log(message.guild, "BAN", message.author, user, reason);
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("❌ Kullanıcı yasaklanırken bir hata oluştu!")
                .setFooter({ text: message.guild.name });
            message.reply({ embeds: [errorEmbed] });
        }
    },
};
