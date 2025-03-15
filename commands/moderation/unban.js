const { permissions } = require('../../utils/permissions.js');
const logger = require('../../utils/logger.js');

module.exports = {
    name: 'unban',
    description: 'Kullanıcının yasaklamasını kaldırır',
    async execute(message, args) {
        if (!permissions.checkModerator(message.member)) {
            return message.reply('Bu komutu kullanma yetkiniz yok!');
        }

        if (!args[0]) {
            return message.reply('Yasağı kaldırılacak kullanıcının ID\'sini belirtmelisiniz!');
        }

        const userId = args[0];
        const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi';

        try {
            console.log(`Unban işlemi başlatıldı - Kullanıcı ID: ${userId}`);
            const banList = await message.guild.bans.fetch();
            const bannedUser = banList.find(ban => ban.user.id === userId);

            if (!bannedUser) {
                return message.reply('Bu ID\'ye sahip yasaklanmış bir kullanıcı bulunamadı!');
            }

            await message.guild.members.unban(userId, reason);
            message.reply(`${bannedUser.user.tag} kullanıcısının yasağı kaldırıldı. Sebep: ${reason}`);
            logger.log(message.guild, 'UNBAN', message.author, bannedUser.user, reason);
        } catch (error) {
            console.error('Unban hatası:', error);
            message.reply('Kullanıcının yasağı kaldırılırken bir hata oluştu!');
        }
    },
};