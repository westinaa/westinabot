const { permissions } = require("../../utils/permissions.js");
const logger = require("../../utils/logger.js");
const { EmbedBuilder } = require("discord.js");
const User = require("../../models/userModel.js"); // MongoDB modelini ekledik

module.exports = {
    name: "mute",
    description: "Kullanıcıyı belirtilen süre boyunca susturur",
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
                .setDescription("<a:westina_red:1349419144243576974> Susturulacak kullanıcıyı etiketlemelisiniz!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const duration = parseInt(args[1]);
        if (!duration || isNaN(duration) || duration < 1) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Geçerli bir süre belirtmelisiniz! (dakika cinsinden)")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const reason = args.slice(2).join(" ") || "Sebep belirtilmedi";

        let muteRole = message.guild.roles.cache.find(
            (role) => role.name === "Muted"
        );
        if (!muteRole) {
            try {
                muteRole = await message.guild.roles.create({
                    name: "Muted",
                    color: "#808080",
                    reason: "Susturulmuş kullanıcılar için rol",
                });

                message.guild.channels.cache.forEach(async (channel) => {
                    if (channel.type === 0) {
                        await channel.permissionOverwrites.create(muteRole, {
                            SendMessages: false,
                            AddReactions: false,
                        });
                    }
                });
            } catch (error) {
                const errorEmbed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setDescription("<a:westina_red:1349419144243576974> Mute rolü oluşturulurken bir hata oluştu!")
                    .setFooter({ text: message.guild.name });
                return message.reply({ embeds: [errorEmbed] });
            }
        }

        try {
            await user.roles.add(muteRole);

            // MongoDB'ye kaydetme
            await User.findOneAndUpdate(
                { userID: user.id },
                { $set: { muted: true, muteExpiry: Date.now() + duration * 60000 } },
                { upsert: true }
            );

            const successEmbed = new EmbedBuilder()
                .setColor("#800080")
                .setTitle("<a:westina_onay:1349184023867691088> Kullanıcı Susturuldu")
                .setDescription(`**${user.user.tag}** kullanıcısı başarıyla susturuldu.`)
                .addFields(
                    {
                        name: "👮 Moderatör",
                        value: message.author.tag,
                        inline: true,
                    },
                    {
                        name: "⏱️ Süre",
                        value: `${duration} dakika`,
                        inline: true,
                    },
                    { name: "📝 Sebep", value: reason },
                )
                .setTimestamp()
                .setFooter({ text: message.guild.name });

            message.reply({ embeds: [successEmbed] });
            logger.log(
                message.guild,
                "MUTE",
                message.author,
                user.user,
                `${duration} dakika - ${reason}`,
            );

            setTimeout(async () => {
                try {
                    if (user.roles.cache.has(muteRole.id)) {
                        await user.roles.remove(muteRole);
                        
                        // MongoDB'den mute bilgilerini kaldırma
                        await User.findOneAndUpdate(
                            { userID: user.id },
                            { $set: { muted: false, muteExpiry: null } },
                            { upsert: true }
                        );

                        const unmuteEmbed = new EmbedBuilder()
                            .setColor("#00ffff")
                            .setTitle("<a:westina_onay:1349184023867691088> Susturma Kaldırıldı")
                            .setDescription(`**${user.user.tag}** kullanıcısının susturulması sona erdi.`)
                            .setTimestamp()
                            .setFooter({ text: message.guild.name });

                        message.channel.send({ embeds: [unmuteEmbed] });
                        logger.log(
                            message.guild,
                            "UNMUTE",
                            message.client.user,
                            user.user,
                            "Süre doldu",
                        );
                    }
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor("#ff0000")
                        .setDescription("<a:westina_red:1349419144243576974> Kullanıcının susturulması kaldırılırken bir hata oluştu!")
                        .setFooter({ text: message.guild.name });
                    message.channel.send({ embeds: [errorEmbed] });
                }
            }, duration * 60000); // Dakika cinsinden süreyi milisaniyeye çevir
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Kullanıcı susturulurken bir hata oluştu!")
                .setFooter({ text: message.guild.name });
            message.reply({ embeds: [errorEmbed] });
        }
    },
};
