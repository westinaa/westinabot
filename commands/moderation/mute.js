const { permissions } = require("../../utils/permissions.js");
const logger = require("../../utils/logger.js");
const config = require("../../config.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "mute",
    description: "Kullanıcıyı belirtilen süre boyunca susturur",
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
                .setTitle("Eksik argüman!")
                .setDescription(
                    "❌ Susturulacak kullanıcıyı etiketlemelisiniz!",
                )
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const duration = parseInt(args[1]);
        if (!duration || isNaN(duration) || duration < 1) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription(
                    "❌ Geçerli bir süre belirtmelisiniz! (dakika cinsinden)",
                )
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const reason = args.slice(2).join(" ") || "Sebep belirtilmedi";

        let muteRole = message.guild.roles.cache.find(
            (role) => role.name === config.muteRoleName,
        );
        if (!muteRole) {
            try {
                muteRole = await message.guild.roles.create({
                    name: config.muteRoleName,
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
                    .setDescription(
                        "❌ Mute rolü oluşturulurken bir hata oluştu!",
                    )
                    .setFooter({ text: message.guild.name });
                return message.reply({ embeds: [errorEmbed] });
            }
        }

        try {
            await user.roles.add(muteRole);
            const successEmbed = new EmbedBuilder()
                .setColor("#800080")
                .setTitle("🔇 Kullanıcı Susturuldu")
                .setDescription(`**${user.user.tag}** kullanıcısı susturuldu.`)
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
                        const unmuteEmbed = new EmbedBuilder()
                            .setColor("#00ffff")
                            .setTitle("🔊 Susturma Kaldırıldı")
                            .setDescription(
                                `**${user.user.tag}** kullanıcısının susturulması sona erdi.`,
                            )
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
                        .setDescription(
                            "❌ Kullanıcının susturulması kaldırılırken bir hata oluştu!",
                        )
                        .setFooter({ text: message.guild.name });
                    message.channel.send({ embeds: [errorEmbed] });
                }
            }, duration * 60000);
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("❌ Kullanıcı susturulurken bir hata oluştu!")
                .setFooter({ text: message.guild.name });
            message.reply({ embeds: [errorEmbed] });
        }
    },
};
