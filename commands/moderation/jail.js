const { permissions } = require("../../utils/permissions.js");
const logger = require("../../utils/logger.js");
const config = require("../../config.js");
const { EmbedBuilder } = require("discord.js");
const mongoose = require("mongoose");
const userModel = require("../../models/userModel.js"); // MongoDB şeması

module.exports = {
    name: "jail",
    description: "Kullanıcıyı geçici olarak hapse atar",
    async execute(message, args) {
        if (!permissions.checkModerator(message.member)) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Bu komutu kullanma yetkiniz yok!")
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [errorEmbed] });
        }

        const user = message.mentions.members.first();
        if (!user) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Hapse atılacak kullanıcıyı etiketlemelisiniz!")
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [errorEmbed] });
        }

        const duration = parseInt(args[1]);
        if (!duration || isNaN(duration) || duration < 1) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Geçerli bir süre belirtmelisiniz! (saat cinsinden)")
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [errorEmbed] });
        }

        const reason = args.slice(2).join(" ") || "Sebep belirtilmedi";

        // Jail rolünü kontrol et veya oluştur
        let jailRole = message.guild.roles.cache.find(role => role.name === "cezalı");
        if (!jailRole) {
            try {
                jailRole = await message.guild.roles.create({
                    name: "cezalı",
                    color: "#36393f",
                    reason: "Jail sistemi için rol"
                });

                // Tüm kanallarda jail rolü için izinleri ayarla
                message.guild.channels.cache.forEach(async channel => {
                    await channel.permissionOverwrites.create(jailRole, {
                        ViewChannel: false,
                        SendMessages: false,
                        AddReactions: false,
                        Speak: false
                    });
                });
            } catch (error) {
                const errorEmbed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setDescription("<a:westina_red:1349419144243576974> Jail rolü oluşturulurken bir hata oluştu!")
                    .setFooter({ text: "made by westina <3" });
                return message.reply({ embeds: [errorEmbed] });
            }
        }

        try {
            // Kullanıcının mevcut rollerini kaydet
            const userRoles = user.roles.cache.filter(r => r.id !== message.guild.id).map(r => r.id);

            // Tüm rolleri kaldır ve jail rolünü ver
            await user.roles.remove(userRoles);
            await user.roles.add(jailRole);

            // MongoDB'ye kullanıcıyı kaydet
            const jailEndTime = Date.now() + duration * 3600000; // Şu anki zaman + süre

            const jailData = new userModel({
                userId: user.id,
                guildId: message.guild.id,
                jailEndTime: jailEndTime,
                reason: reason,
                moderatorId: message.author.id,
            });

            await jailData.save();

            const successEmbed = new EmbedBuilder()
                .setColor("#1e1e1e")
                .setTitle("🔒 Kullanıcı Hapse Atıldı")
                .setDescription(`**${user.user.tag}** kullanıcısı hapse atıldı.`)
                .addFields(
                    { name: "👮 Moderatör", value: message.author.tag, inline: true },
                    { name: "⏱️ Süre", value: `${duration} saat`, inline: true },
                    { name: "📝 Sebep", value: reason }
                )
                .setTimestamp()
                .setFooter({ text: "made by westina <3" });

            message.reply({ embeds: [successEmbed] });
            logger.log(message.guild, "JAIL", message.author, user.user, `${duration} saat - ${reason}`);

            // Süre sonunda jail'den çıkar
            setTimeout(async () => {
                try {
                    // MongoDB'den kullanıcıyı bul ve jail durumunu kaldır
                    const jailRecord = await userModel.findOne({ userId: user.id, guildId: message.guild.id });
                    if (jailRecord) {
                        await user.roles.remove(jailRole);
                        await user.roles.add(userRoles);

                        const releaseEmbed = new EmbedBuilder()
                            .setColor("#00ff00")
                            .setTitle("🔓 Kullanıcı Serbest Bırakıldı")
                            .setDescription(`**${user.user.tag}** kullanıcısının hapis süresi doldu.`)
                            .setTimestamp()
                            .setFooter({ text: "made by westina <3" });

                        message.channel.send({ embeds: [releaseEmbed] });
                        logger.log(message.guild, "UNJAIL", message.client.user, user.user, "Süre doldu");

                        // MongoDB kaydını sil
                        await userModel.deleteOne({ userId: user.id, guildId: message.guild.id });
                    }
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor("#ff0000")
                        .setDescription("<a:westina_red:1349419144243576974> Kullanıcı hapisten çıkarılırken bir hata oluştu!")
                        .setFooter({ text: message.guild.name });
                    message.channel.send({ embeds: [errorEmbed] });
                }
            }, duration * 3600000); // Saati milisaniyeye çevir

        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Kullanıcı hapse atılırken bir hata oluştu!")
                .setFooter({ text: message.guild.name });
            message.reply({ embeds: [errorEmbed] });
        }
    },
};
