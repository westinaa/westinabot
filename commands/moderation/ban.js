const { permissions } = require("../../utils/permissions.js");
const logger = require("../../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

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

        const user = message.mentions.users.first();
        if (!user) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("Eksik argüman!")
                .setDescription(
                    "❌ Yasaklanacak kullanıcıyı etiketlemelisiniz!",
                )
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [errorEmbed] });
        }

        const reason = args.slice(1).join(" ") || "Sebep belirtilmedi";

        try {
            await message.guild.members.ban(user, { reason });
            const successEmbed = new EmbedBuilder()
                .setColor("#00ff00")
                .setTitle("🔨 Kullanıcı Yasaklandı")
                .setDescription(
                    `**${user.tag}** kullanıcısı başarıyla yasaklandı.`,
                )
                .addFields(
                    {
                        name: "👮 Moderatör",
                        value: message.author.tag,
                        inline: true,
                    },
                    { name: "📝 Sebep", value: reason, inline: true },
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