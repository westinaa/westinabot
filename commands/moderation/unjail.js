const { permissions } = require("../../utils/permissions.js");
const logger = require("../../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "unjail",
    description: "Kullanıcıyı hapisten çıkarır",
    async execute(message, args) {
        if (!permissions.checkModerator(message.member)) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("❌ Bu komutu kullanma yetkiniz yok!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const user = message.mentions.members.first();
        if (!user) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription(
                    "❌ Hapisten çıkarılacak kullanıcıyı etiketlemelisiniz!",
                )
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const reason = args.slice(1).join(" ") || "Sebep belirtilmedi";
        const jailRole = message.guild.roles.cache.find(
            (role) => role.name === "cezalı",
        );

        if (!jailRole) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("❌ Jail rolü bulunamadı!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        try {
            // Kullanıcının jail rolünü kontrol et
            if (!user.roles.cache.has(jailRole.id)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setDescription("❌ Bu kullanıcı hapiste değil!")
                    .setFooter({ text: message.guild.name });
                return message.reply({ embeds: [errorEmbed] });
            }

            // Jail rolünü kaldır
            await user.roles.remove(jailRole);

            const successEmbed = new EmbedBuilder()
                .setColor("#98ff98")
                .setTitle("🔓 Kullanıcı Hapisten Çıkarıldı")
                .setDescription(
                    `**${user.user.tag}** kullanıcısı hapisten çıkarıldı.`,
                )
                .addFields(
                    {
                        name: "👮 Moderatör",
                        value: message.author.tag,
                        inline: true,
                    },
                    { name: "📝 Sebep", value: reason },
                )
                .setTimestamp()
                .setFooter({ text: message.guild.name });

            message.reply({ embeds: [successEmbed] });
            logger.log(
                message.guild,
                "UNJAIL",
                message.author,
                user.user,
                reason,
            );
        } catch (error) {
            console.error("Unjail hatası:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription(
                    "❌ Kullanıcı hapisten çıkarılırken bir hata oluştu!",
                )
                .setFooter({ text: message.guild.name });
            message.reply({ embeds: [errorEmbed] });
        }
    },
};
