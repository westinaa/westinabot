const { permissions } = require("../../utils/permissions.js");
const logger = require("../../utils/logger.js");
const { EmbedBuilder } = require("discord.js");
const UserModel = require("../../models/userModel.js"); // UserModel'i dahil et

module.exports = {
    name: "ban",
    description: "Kullanıcıyı sunucudan yasaklar",
    async execute(message, args) {
        if (!permissions.checkModerator(message.member)) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("<a:westina_red:1349419144243576974> Bu komutu kullanma yetkiniz yok!")
                .setFooter({ text: "made by westina <3" });
            return message.reply({ embeds: [errorEmbed] });
        }

        // Kullanıcıyı etiketleme veya ID ile alma
        let user = message.mentions.users.first();
        let userTag = '';
        if (!user) {
            const userId = args[0];
            if (!userId) {
                const errorEmbed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setTitle("Eksik argüman!")
                    .setDescription("<a:westina_red:1349419144243576974> Yasaklanacak kullanıcıyı etiketlemelisiniz ya da ID girmelisiniz!")
                    .setFooter({ text: "made by westina <3" });
                return message.reply({ embeds: [errorEmbed] });
            }
            user = await message.guild.members.fetch(userId).catch(() => null);
            if (!user) {
                const errorEmbed = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setTitle("Geçersiz kullanıcı!")
                    .setDescription("<a:westina_red:1349419144243576974> Bu ID ile bir kullanıcı bulunamadı!")
                    .setFooter({ text: "made by westina <3" });
                return message.reply({ embeds: [errorEmbed] });
            }
            // Eğer ID kullanıldıysa, kullanıcı etiketini <@ID> şeklinde alırız.
            userTag = `<@${user.id}>`;
        } else {
            // Eğer etiketle kullanıcı bulunduysa, tag'ini alıyoruz.
            userTag = `${user.tag}`;
        }

        const reason = args.slice(1).join(" ") || "Sebep belirtilmedi";

        try {
            // Kullanıcıyı yasakla
            await message.guild.members.ban(user, { reason });

            // Veritabanında kullanıcıyı bul
            let userData = await UserModel.findOne({ userId: user.id, guildId: message.guild.id });
            if (!userData) {
                // Eğer kullanıcı verisi yoksa, yeni kullanıcı verisi oluştur
                userData = new UserModel({
                    userId: user.id,
                    guildId: message.guild.id,
                    mutes: [],
                    jails: [],
                    bans: [],
                    vmutes: [] // Bu alan da burada olacak, gelecekte VMute işlemi eklediğinizde kullanılabilir
                });
            }

            // Ban'ı kullanıcı verisine ekle
            userData.bans.push({
                createdAt: new Date(),
                reason: reason,
                moderatorId: message.author.id // Moderatörün ID'sini ekliyoruz
            });

            await userData.save(); // Kullanıcı verisini kaydet

            const successEmbed = new EmbedBuilder()
                .setColor("#00ff00")
                .setTitle("<a:westina_onay:1349184023867691088> Kullanıcı Yasaklandı")
                .setDescription(
                    `**${userTag}** kullanıcısı başarıyla yasaklandı.`
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
                .setDescription("<a:westina_red:1349419144243576974> Kullanıcı yasaklanırken bir hata oluştu!")
                .setFooter({ text: message.guild.name });
            message.reply({ embeds: [errorEmbed] });
            console.error("Ban işlemi hatası:", error);
        }
    },
};
