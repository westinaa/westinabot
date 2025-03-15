const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "say",
    description: "Sunucu istatistiklerini gösterir",
    async execute(message, args) {
        const guild = message.guild;

        // Sesli kanallardaki toplam üye sayısını hesapla
        const voiceChannels = guild.channels.cache.filter((c) => c.type === 2); // 2 = Voice Channel
        const voiceMembers = new Set();
        voiceChannels.forEach((vc) => {
            vc.members.forEach((member) => {
                voiceMembers.add(member.id);
            });
        });

        // Çevrimiçi üye sayısını hesapla
        const onlineMembers = guild.members.cache.filter(
            (member) =>
                member.presence?.status === "online" ||
                member.presence?.status === "idle" ||
                member.presence?.status === "dnd",
        ).size;

        // Tarih ve saat bilgisini oluştur
        const now = new Date();
        const options = {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        };

        const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("📊 Sunucu İstatistikleri")
            .addFields({
                name: "🎤 Sesli Kanallardaki Üyeler",
                value: "` " + voiceMembers.size.toString() + " `",
            })
            .addFields({
                name: "👥 Toplam Üye",
                value: "` " + guild.memberCount.toString() + " `",
            })
            .addFields(
                {
                    name: "🟢 Çevrimiçi Üyeler",
                    value: `${onlineMembers} üye`,
                    inline: true,
                },
                {
                    name: "🚀 Boost Sayısı",
                    value: `${guild.premiumSubscriptionCount || 0} boost`,
                    inline: true,
                },
            )
            .setTimestamp()
            .setFooter({ text: guild.name });

        await message.channel.send({ embeds: [embed] });
    },
};
