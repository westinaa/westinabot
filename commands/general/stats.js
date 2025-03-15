const { EmbedBuilder } = require('discord.js');
const statistics = require('../../utils/statistics.js');

module.exports = {
    name: 'stats',
    description: 'Sunucu ve kullanıcı istatistiklerini gösterir',
    async execute(message, args) {
        // Sayısal argümanı bul
        const numberArg = args.find(arg => !isNaN(arg) && !arg.includes('@'));
        let days = null;
        if (numberArg) {
            days = parseInt(numberArg);
            if (days < 1 || days > 365) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ Lütfen 1 ile 365 arasında geçerli bir gün sayısı belirtin! (Örnek: !stats 15)')
                    .setFooter({ text: message.guild.name });
                return message.reply({ embeds: [errorEmbed] });
            }
        }

        // Eğer bir kullanıcı etiketlendiyse, direkt kullanıcı istatistiklerini göster
        const mentionedUser = message.mentions.users.first();
        if (mentionedUser) {
            const userStats = statistics.getUserStats(mentionedUser.id, message.guild.id, days);
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`📊 Kullanıcı İstatistikleri: ${mentionedUser.tag} ${days ? `(Son ${days} gün)` : ''}`)
                .addFields(
                    { name: '💬 Toplam Mesaj', value: userStats.messages.toString(), inline: true },
                    { name: '🎤 Ses Kanalı Süresi', value: `${Math.round(userStats.voiceMinutes / 60)} saat`, inline: true },
                    { name: '⏱️ Son Aktivite', value: userStats.lastActive ? `<t:${Math.floor(userStats.lastActive / 1000)}:R>` : 'Veri yok', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `${message.guild.name} | Periyot: ${days ? `${days} gün` : 'Tüm zamanlar'}` });

            return message.channel.send({ embeds: [embed] });
        }

        const subCommand = args[0]?.toLowerCase();

        if (subCommand === 'sunucu' || !subCommand) {
            // Sunucu istatistikleri
            const serverStats = statistics.getServerStats(message.guild, days);
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`📊 Sunucu İstatistikleri ${days ? `(Son ${days} gün)` : ''}`)
                .addFields(
                    { name: '👥 Toplam Üye', value: serverStats.totalMembers.toString(), inline: true },
                    { name: '🟢 Çevrimiçi Üye', value: serverStats.onlineMembers.toString(), inline: true },
                    { name: '📈 Aktif Üye', value: serverStats.activeUsers24h.toString(), inline: true },
                    { name: '🎭 Rol Sayısı', value: serverStats.roles.toString(), inline: true },
                    { name: '📝 Metin Kanalları', value: serverStats.channels.text.toString(), inline: true },
                    { name: '🔊 Ses Kanalları', value: serverStats.channels.voice.toString(), inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `${message.guild.name} | Periyot: ${days ? `${days} gün` : 'Son 24 saat'}` });

            await message.channel.send({ embeds: [embed] });

        } else if (subCommand === 'top') {
            // En aktif kullanıcılar
            const topUsers = statistics.getTopUsers(message.guild.id, 10, days);
            const topUsersFields = await Promise.all(topUsers.map(async (user, index) => {
                const member = await message.guild.members.fetch(user.userId).catch(() => null);
                if (!member) return null;
                return {
                    name: `${index + 1}. ${member.user.tag}`,
                    value: `Mesajlar: ${user.messages} | Ses: ${Math.round(user.voiceMinutes / 60)} saat`,
                    inline: false
                };
            }));

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`🏆 En Aktif Kullanıcılar ${days ? `(Son ${days} gün)` : ''}`)
                .addFields(topUsersFields.filter(field => field !== null))
                .setTimestamp()
                .setFooter({ text: `${message.guild.name} | Periyot: ${days ? `${days} gün` : 'Tüm zamanlar'}` });

            await message.channel.send({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ Geçersiz komut! Kullanım:\n!stats [5] - Sunucu istatistikleri\n!stats @kullanıcı [7] - Kullanıcı istatistikleri\n!stats top [10] - En aktif kullanıcılar\n!stats sunucu [30] - Detaylı sunucu istatistikleri\n\nNot: Gün sayısını 1-365 arasında belirtebilirsiniz.')
                .setFooter({ text: message.guild.name });

            await message.channel.send({ embeds: [embed] });
        }
    },
};