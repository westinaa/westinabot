const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "say",
    description: "Sunucu istatistiklerini gösterir",
    async execute(message, args) {
        const guild = message.guild;

        // Sayıları emojiye çeviren fonksiyon
        function numberToEmoji(number) {
            const emojiNumbers = {
                '0': '0️⃣',
                '1': '<a:w1:1349513708669374587>',
                '2': '<a:w2:1349513703854182452>',
                '3': '<a:w3:1349513701065232404>',
                '4': '<a:w4:1349513697600737340>',
                '5': '<a:w5:1349513693691514911>',
                '6': '<a:w6:1349513690608570398>',
                '7': '<a:w7:1349513686632628386>',
                '8': '<a:w8:1349513681943400552>',
                '9': '<a:w9:1349513678457802752>'
            };
            return number.toString().split('').map(digit => emojiNumbers[digit] || digit).join('');
        }

        // Komutun kullanıldığı an (Unix Timestamp)
        const timestamp = Math.floor(Date.now() / 1000);

        // Sesli kanallardaki toplam üye sayısını hesapla
        const voiceChannels = guild.channels.cache.filter((c) => c.type === 2);
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

        const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) }) // Sunucu adı ve resmi
            .setDescription(
                `<t:${timestamp}:R> **Tarihli Sunucu Verisi**\n\n` + // Zaman gösterimi
                `\` ❯ \` <:voice:1349504902703091743> Şu anda toplam ${numberToEmoji(voiceMembers.size)}\n kişi seslide.\n` +
                `\` ❯ \` <:uye:1349504908050698333> Sunucuda toplam ${numberToEmoji(guild.memberCount)} üye var\n` +
                `\` ❯ \` <:online:1349504905374863484> Anlık çevrimiçi üye sayısı: ${numberToEmoji(onlineMembers)}\n` +
                `\` ❯ \` <a:aku_boost:1349419063029534722> Sunucuya toplam ${numberToEmoji(guild.premiumSubscriptionCount || 0)} boost basılmış.`
            )
            .setTimestamp()
            .setFooter({ text: guild.name });

        await message.channel.send({ embeds: [embed] });
    },
};
