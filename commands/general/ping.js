const fetch = require('node-fetch');

module.exports = {
    name: 'ping',
    description: 'Botun, API\'nin ve Render uygulamasının (westinabot.onrender.com) gecikme sürelerini gösterir.',
    async execute(message, args) {
        const pingEmoji = '<a:w_load:1350582644324438067>'; // Bot gecikmesi için emoji
        const apiEmoji = '<a:w_loading:1350582535264010240>';   // API gecikmesi için emoji
        const uptimeEmoji = '<:w_pr:1350585558879178824>'; // Render gecikmesi için emoji
        const renderURL = 'https://westinabot.onrender.com'; // Sabit Render URL'si

        const initialMessage = await message.channel.send(`${pingEmoji} Pong isteği gönderiliyor...`);
        const botPing = initialMessage.createdTimestamp - message.createdTimestamp;
        const apiPing = Math.round(message.client.ws.ping);

        let uptimeLatency = 'Ölçülüyor...';
        let uptimeStatus = '';

        const startTime = Date.now();
        try {
            const response = await fetch(renderURL);
            const endTime = Date.now();
            uptimeLatency = endTime - startTime;
            uptimeStatus = response.ok ? '<a:yellow_verify:1346909656685084745>' : '⚠️';
        } catch (error) {
            console.error('Render uptime ping hatası:', error);
            uptimeLatency = 'Hata';
            uptimeStatus = '❌';
        }

        const finalMessage = `${pingEmoji} **Gecikme:** ${botPing}ms\n${apiEmoji} **API Gecikmesi:** ${apiPing}ms\n${uptimeEmoji} **Render Ping (${renderURL}):** ${uptimeStatus} ${uptimeLatency}ms`;

        await initialMessage.edit(finalMessage);
    },
};
