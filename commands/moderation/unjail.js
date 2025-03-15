const { permissions } = require("../../utils/permissions.js");
const logger = require("../../utils/logger.js");
const { EmbedBuilder } = require("discord.js");
const User = require("../../models/userModel.js"); // MongoDB modelini dahil et

module.exports = {
    name: "unjail",
    description: "Kullanıcıyı hapisten çıkarır",
    async execute(message, args) {
        if (!permissions.checkModerator(message.member)) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Bu komutu kullanma yetkiniz yok!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const user = message.mentions.members.first();
        if (!user) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Hapisten çıkarılacak kullanıcıyı etiketlemelisiniz!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const reason = args.slice(1).join(" ") || "Sebep belirtilmedi";
        const jailRole = message.guild.roles.cache.find(
            (role) => role.name === "cezalı"
        );

        if (!jailRole) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Jail rolü bulunamadı!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        try {
            // Kullanıcının jail rolünü kontrol et
            if (!user.roles.cache.has(jailRole.id)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setDescription("<a:westina_red:1349419144243576974> Bu kullanıcı hapiste değil!")
                    .setFooter({ text: message.guild.name });
                return message.reply({ embeds: [errorEmbed] });
            }

            // MongoDB veritabanında kullanıcıyı bul ve önceki rollerini al
            const userRecord = await User.findOne({ userId: user.id, guildId: message.guild.id });
            if (!userRecord) {
                const errorEmbed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setDescription("<a:westina_red:1349419144243576974> Kullanıcı verisi bulunamadı!")
                    .setFooter({ text: message.guild.name });
                return message.reply({ embeds: [errorEmbed] });
            }

            // Kullanıcının önceki rollerini geri ver
            const previousRoles = userRecord.previousRoles;
            if (previousRoles && previousRoles.length > 0) {
                await user.roles.add(previousRoles);
            } else {
                const warningEmbed = new EmbedBuilder()
                    .setColor("#ff9900")
                    .setDescription("<a:westina_warning:1349419144243576974> Kullanıcının önceki rollerini bulamadım!")
                    .setFooter({ text: message.guild.name });
                message.reply({ embeds: [warningEmbed] });
            }

            // Jail rolünü kaldır
            await user.roles.remove(jailRole);

            // MongoDB kaydını sil
            await User.deleteOne({ userId: user.id, guildId: message.guild.id });

            const successEmbed = new EmbedBuilder()
                .setColor("#98ff98")
                .setTitle("<a:westina_onay:1349184023867691088> Kullanıcı Hapisten Çıkarıldı")
                .setDescription(`**${user.user.tag}** kullanıcısı hapisten çıkarıldı.`)
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
                .setDescription("<a:westina_red:1349419144243576974> Kullanıcı hapisten çıkarılırken bir hata oluştu!")
                .setFooter({ text: message.guild.name });
            message.reply({ embeds: [errorEmbed] });
        }
    },
};
