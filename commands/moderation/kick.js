const { permissions } = require("../../utils/permissions.js");
const logger = require("../../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "kick",
    description: "Kullanıcıyı sunucudan atar",
    async execute(message, args) {
        if (!permissions.checkModerator(message.member)) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("❌ Bu komutu kullanma yetkiniz yok!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const user = message.mentions.users.first();
        if (!user) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("Eksik argüman!")
                .setDescription("❌ Atılacak kullanıcıyı etiketlemelisiniz!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const reason = args.slice(1).join(" ") || "Sebep belirtilmedi";

        try {
            const member = message.guild.members.cache.get(user.id);
            await member.kick(reason);
            const successEmbed = new EmbedBuilder()
                .setColor("#ffa500")
                .setTitle("👢 Kullanıcı Atıldı")
                .setDescription(`**${user.tag}** kullanıcısı başarıyla atıldı.`)
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
            logger.log(message.guild, "KICK", message.author, user, reason);
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("❌ Kullanıcı atılırken bir hata oluştu!")
                .setFooter({ text: message.guild.name });
            message.reply({ embeds: [errorEmbed] });
        }
    },
};
