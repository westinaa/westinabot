const { permissions } = require('../../utils/permissions.js');
const logger = require('../../utils/logger.js');

module.exports = {
    name: 'rol',
    description: 'Rol verme/alma işlemleri',
    async execute(message, args) {
        if (!permissions.checkModerator(message.member)) {
            return message.reply('Bu komutu kullanma yetkiniz yok!');
        }

        if (args.length < 2) {
            return message.reply('Kullanım: !rol <ver/al> @kullanıcı @rol');
        }

        const action = args[0].toLowerCase();
        const user = message.mentions.members.first();
        const role = message.mentions.roles.first();

        if (!user || !role) {
            return message.reply('Lütfen geçerli bir kullanıcı ve rol etiketleyin!');
        }

        try {
            if (action === 'ver') {
                await user.roles.add(role);
                message.reply(`${user.user.tag} kullanıcısına ${role.name} rolü verildi.`);
                logger.log(message.guild, 'ROL-VERME', message.author, user.user, `${role.name} rolü verildi`);
            } else if (action === 'al') {
                await user.roles.remove(role);
                message.reply(`${user.user.tag} kullanıcısından ${role.name} rolü alındı.`);
                logger.log(message.guild, 'ROL-ALMA', message.author, user.user, `${role.name} rolü alındı`);
            } else {
                message.reply('Geçersiz işlem! Kullanım: !rol <ver/al> @kullanıcı @rol');
            }
        } catch (error) {
            message.reply('Rol işlemi yapılırken bir hata oluştu!');
        }
    },
};
