const { EmbedBuilder } = require('discord.js');
const User = require('../../models/userModel'); // User modelini içeri aktar
const ms = require('ms'); // ms modülü, süreyi işlemek için

module.exports = {
    name: 'vmute',
    description: 'Kişiyi sesli kanalda mikrofonunu susturur',
    async execute(message, args) {
        // Yetki kontrolü: 'Mute' yetkisi olmalı
        if (!message.member.permissions.has('MuteMembers')) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('<a:w_carpi:1350461649751900271> Bu komutu kullanmak için **"Üyeleri Sustur"** yetkiniz olmalıdır!')
                ]
            });
        }

        // Argüman kontrolü: Etiket, süre ve sebep
        if (args.length < 3) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('<a:w_carpi:1350461649751900271> Kullanım: `.vmute <@etiket/ID> <süre> <sebep>`')
                ]
            });
        }

        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!user) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('<a:w_carpi:1350461649751900271> Geçerli bir kullanıcı bulunamadı!')
                ]
            });
        }

        const muteDuration = ms(args[1]);
        if (!muteDuration) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('<a:w_carpi:1350461649751900271> Geçerli bir süre belirtmelisiniz! Örneğin: 1m, 1h, 1d.')
                ]
            });
        }

        const reason = args.slice(2).join(' ') || 'Sebep belirtilmedi';

        // Kullanıcıyı sustur
        try {
            await user.voice.setMute(true, reason); // Sesli kanalda susturma

            // Veritabanına kaydet
            const muteEndTime = Date.now() + muteDuration;
            await User.findOneAndUpdate(
                { userId: user.id, guildId: message.guild.id },
                {
                    $push: {
                        vmutes: {
                            createdAt: Date.now(),
                            reason: reason,
                            endedAt: muteEndTime,
                        }
                    }
                },
                { upsert: true }
            );

            // Success message
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('<a:westina_onay:1349184023867691088> Başarıyla Susturuldu!')
                .setDescription(`<@${user.id}> mikrofonu **${args[1]}** süreyle susturuldu. Sebep: **${reason}**`)
                .setFooter({ text: message.guild.name });

            message.reply({ embeds: [successEmbed] });

            // Süre bitiminde otomatik olarak susturmayı kaldır
            setTimeout(async () => {
                await user.voice.setMute(false, 'Susturma süresi bitti');
                await User.findOneAndUpdate(
                    { userId: user.id, guildId: message.guild.id },
                    { $pull: { vmutes: { endedAt: muteEndTime } } }
                );
            }, muteDuration);

        } catch (error) {
            console.error('VMute komut hatası:', error);
            message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('<a:w_carpi:1350461649751900271> Kullanıcı susturulurken bir hata oluştu!')
                ]
            });
        }
    },
};
