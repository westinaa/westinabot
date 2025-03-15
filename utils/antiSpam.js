
const config = require('../config.js');

const messageCache = new Map();

module.exports = {
    checkSpam(message) {
        // Spam koruması devre dışı bırakıldı
        return false;
        
        /* Eski spam kontrolü:
        if (!messageCache.has(message.author.id)) {
            messageCache.set(message.author.id, {
                messages: 1,
                lastMessage: message.createdTimestamp
            });
            return false;
        }

        const userData = messageCache.get(message.author.id);
        const timeDiff = message.createdTimestamp - userData.lastMessage;

        if (timeDiff < config.spamInterval) {
            userData.messages++;
            if (userData.messages >= config.spamThreshold) {
                message.reply('Lütfen spam yapmayınız!');
                return true;
            }
        } else {
            userData.messages = 1;
        }

        userData.lastMessage = message.createdTimestamp;
        return false;
        */
    }
};
