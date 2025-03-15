const { EmbedBuilder } = require('discord.js');
const statistics = require('../../utils/statistics.js');

module.exports = {
    name: 'activity',
    description: 'Kullanıcının detaylı aktivite bilgilerini gösterir',
    async execute(message, args) {
        // Sayısal argümanı bul
        const numberArg = args.find(arg => !isNaN(arg) && !arg.includes('@'));
        let days = numberArg ? parseInt(numberArg) : 7;

        if (days < 1 || days > 30) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ Lütfen 1 ile 30 arasında geçerli bir gün sayısı belirtin!')
                .setFooter({ text: message.guild.name });
            return message.reply({ embeds: [errorEmbed] });
        }

        // Hedef kullanıcıyı belirle
        const target = message.mentions.users.first() || message.author;

        try {
            const activity = await statistics.getDetailedActivity(target.id, message.guild.id, message.guild, days);

            // En aktif kanallar
            const topChannels = Object.entries(activity.channelActivity)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([channel, count], index) => `${index + 1}. #${channel}: ${count} mesaj`)
                .join('\n');

            // En çok kullanılan ses kanalları
            const topVoiceChannels = Object.entries(activity.voiceChannels)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([channel, minutes], index) => `${index + 1}. ${channel}: ${Math.round(minutes / 60)} saat`)
                .join('\n');

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`📊 Detaylı Aktivite Raporu: ${target.tag}`)
                .setDescription(`Son ${days} günün aktivite özeti:`)
                .addFields(
                    {
                        name: '💬 Toplam Aktivite',
                        value: `Mesaj: ${activity.totalMessages}\nSes: ${Math.round(activity.totalVoiceMinutes / 60)} saat`,
                        inline: false
                    },
                    {
                        name: '📝 En Aktif Metin Kanalları',
                        value: topChannels || 'Veri yok',
                        inline: false
                    },
                    {
                        name: '🎤 En Çok Kullanılan Ses Kanalları',
                        value: topVoiceChannels || 'Veri yok',
                        inline: false
                    }
                )
                .setTimestamp()
                .setFooter({ text: `${message.guild.name} | Son ${days} gün` });

            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Activity error:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ Aktivite bilgileri alınırken bir hata oluştu!')
                .setFooter({ text: message.guild.name });
            message.reply({ embeds: [errorEmbed] });
        }
    },
};
