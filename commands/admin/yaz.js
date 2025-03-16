module.exports = {
    name: 'yaz',
    description: 'Bot bir mesaj gönderir.',
    execute(message, args) {
        // Bot sahibinin ID'sini kontrol et
        if (message.author.id !== '474006896408264712') {
            return message.reply('Bu komutu sadece bot sahibi kullanabilir.');
        }

        // Mesaj içeriğini al
        const mesaj = args.join(' ');
        if (!mesaj) {
            return message.reply('Göndermek için bir mesaj yazmalısın.');
        }

        // Mesajı kanala gönder
        message.channel.send(mesaj);

        // Komut mesajını sil
        message.delete().catch(() => {});
    },
};