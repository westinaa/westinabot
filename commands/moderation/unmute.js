const { permissions } = require('../../utils/permissions.js');
const logger = require('../../utils/logger.js');
const config = require('../../config.js');

module.exports = {
    name: 'unmute',
    description: 'Kullanıcının susturulmasını kaldırır',
    async execute(message, args) {
        if (!permissions.checkModerator(message.member)) {
            return message.reply('Bu komutu kullanma yetkiniz yok!');
        }

        const user = message.mentions.members.first();
        if (!user) {
            return message.reply('Susturması kaldırılacak kullanıcıyı etiketlemelisiniz!');
        }

        const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi';
        const muteRole = message.guild.roles.cache.find(role => role.name === config.muteRoleName);

        if (!muteRole) {
            return message.reply('Mute rolü bulunamadı!');
        }

        try {
            console.log(`Unmute işlemi başlatıldı - Kullanıcı: ${user.user.tag}`);

            if (!user.roles.cache.has(muteRole.id)) {
                return message.reply('Bu kullanıcı zaten susturulmamış!');
            }

            await user.roles.remove(muteRole);
            message.reply(`${user.user.tag} kullanıcısının susturulması kaldırıldı. Sebep: ${reason}`);
            logger.log(message.guild, 'UNMUTE', message.author, user.user, reason);
        } catch (error) {
            console.error('Unmute hatası:', error);
            message.reply('Kullanıcının susturulması kaldırılırken bir hata oluştu!');
        }
    },
};