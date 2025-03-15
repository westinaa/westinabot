const { permissions } = require('../../utils/permissions.js');
const logger = require('../../utils/logger.js');
const { EmbedBuilder } = require('discord.js');
const User = require("../../models/userModel.js"); // MongoDB modelini ekledik

module.exports = {
    name: 'unmute',
    description: 'Kullanıcının susturulmasını kaldırır',
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
                .setTitle("Eksik argüman!")
                .setDescription("<a:westina_red:1349419144243576974> Susturması kaldırılacak kullanıcıyı etiketlemelisiniz!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi';
        const muteRole = message.guild.roles.cache.find(role => role.name === "Muted");

        if (!muteRole) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Mute rolü bulunamadı!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        try {
            console.log(`Unmute işlemi başlatıldı - Kullanıcı: ${user.user.tag}`);

            if (!user.roles.cache.has(muteRole.id)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setDescription("<a:westina_red:1349419144243576974> Bu kullanıcı zaten susturulmamış!")
                    .setFooter({ text: message.guild.name });
                return message.reply({ embeds: [errorEmbed] });
            }

            // MongoDB'den mute bilgisini kaldırıyoruz
            await User.findOneAndUpdate(
                { userID: user.id },
                { $set: { muted: false, muteExpiry: null } },
                { upsert: true }
            );

            // Mute rolünü kaldırma işlemi
            await user.roles.remove(muteRole);

            const successEmbed = new EmbedBuilder()
                .setColor("#00ffff")
                .setTitle("<a:westina_onay:1349184023867691088> Susturma Kaldırıldı")
                .setDescription(`**${user.user.tag}** kullanıcısının susturulması başarıyla kaldırıldı.`)
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
                "UNMUTE",
                message.author,
                user.user,
                reason,
            );
        } catch (error) {
            console.error("Unmute hatası:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Kullanıcının susturulması kaldırılırken bir hata oluştu!")
                .setFooter({ text: message.guild.name });
            message.reply({ embeds: [errorEmbed] });
        }
    },
};
