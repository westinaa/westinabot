const { permissions } = require("../../utils/permissions.js");
const logger = require("../../utils/logger.js");
const { EmbedBuilder } = require("discord.js");
const User = require("../../models/userModel.js"); // MongoDB modelini dahil ettik

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

        const reason = args.slice(1).join(" ") || "Sebep belirtilmedi";

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
                console.error("Jail rolü oluşturulurken hata:", error);
                const errorEmbed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setDescription("<a:westina_red:1349419144243576974> Jail rolü oluşturulurken bir hata oluştu!")
                    .setFooter({ text: "made by westina <3" });
                return message.reply({ embeds: [errorEmbed] });
            }
        }

        try {
            // Kullanıcının mevcut rollerini kaydet
            const userRoles = user.roles.cache.filter(r => r.id !== message.guild.id && r.name !== "sponsor").map(r => r.id);  // "sponsor" rolünü filtrele

            // Jail işlemi veritabanında
            const existingUser = await User.findOne({ userId: user.id });

            if (existingUser) {
                // Kullanıcı zaten veritabanında varsa, jail bilgisini ekle
                existingUser.jails.push({
                    createdAt: new Date(),
                    reason: reason,
                    jailEndTime: null,  // Süresiz olarak
                    moderatorId: message.author.id,
                });

                // Kullanıcının rollerini de veritabanına kaydet
                existingUser.userRoles = userRoles;

                await existingUser.save();
            } else {
                // Kullanıcı veritabanında yoksa, yeni kayıt oluştur
                const jailData = {
                    userId: user.id,
                    guildId: message.guild.id,
                    jails: [{
                        createdAt: new Date(),
                        reason: reason,
                        jailEndTime: null,  // Süresiz
                        moderatorId: message.author.id,
                    }],
                    userRoles: userRoles,  // Kullanıcı rollerini kaydediyoruz
                    mutes: [],
                    bans: [],
                };

                await new User(jailData).save();
            }

            // "Sponsor" rolü varsa, bu rolü kaldırma
            const sponsorRole = user.roles.cache.find(r => r.name === "sponsor");
            if (sponsorRole) {
                // "Sponsor" rolünü tut ve diğer rollerden "sponsor" dışındaki rolleri kaldır
                await user.roles.remove(userRoles);
                await user.roles.add(jailRole);  // Jail rolünü ekle
            } else {
                // "Sponsor" rolü yoksa, tüm rolleri kaldır ve jail rolünü ver
                await user.roles.remove(userRoles);
                await user.roles.add(jailRole);
            }
        } catch (error) {
            console.error("Kullanıcı hapse atılırken bir hata oluştu:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Kullanıcı hapse atılırken bir hata oluştu!")
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        const successEmbed = new EmbedBuilder()
            .setColor("#1e1e1e")
            .setTitle("🔒 Kullanıcı Hapse Atıldı")
            .setDescription(`**${user.user.tag}** kullanıcısı hapse atıldı.`)
            .addFields(
                { name: "👮 Moderatör", value: message.author.tag, inline: true },
                { name: "📝 Sebep", value: reason }
            )
            .setTimestamp()
            .setFooter({ text: "made by westina <3" });

        message.reply({ embeds: [successEmbed] });
        logger.log(message.guild, "JAIL", message.author, user.user, reason);
    },
};
