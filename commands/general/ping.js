const https = require('node:https');
const { URL } = require('node:url');

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
            const parsedURL = new URL(renderURL);
            const options = {
                method: 'GET'
            };

            const req = https.request(parsedURL, options, (res) => {
                const endTime = Date.now();
                uptimeLatency = endTime - startTime;
                uptimeStatus = (res.statusCode >= 200 && res.statusCode < 300) ? '<a:yellow_verify:1346909656685084745>' : '⚠️';
                const finalMessage = `${pingEmoji} **Gecikme:** ${botPing}ms\n${apiEmoji} **API Gecikmesi:** ${apiPing}ms\n${uptimeEmoji} **Uptime/VDS Ping:** ${uptimeStatus} \` ${uptimeLatency}ms \` (PORT ${res.statusCode})`;
                initialMessage.edit(finalMessage).catch(console.error);
            });

            req.on('error', (error) => {
                const endTime = Date.now();
                uptimeLatency = endTime - startTime;
                uptimeStatus = '❌';
                console.error('Render uptime ping hatası:', error);
                const finalMessage = `${pingEmoji} **Gecikme:** ${botPing}ms\n${apiEmoji} **API Gecikmesi:** ${apiPing}ms\n${uptimeEmoji} **Render Ping (${renderURL}):** ${uptimeStatus} Hata (${uptimeLatency}ms)`;
                initialMessage.edit(finalMessage).catch(console.error);
            });

            req.end(); // İsteği sonlandır
        } catch (error) {
            console.error('URL ayrıştırma hatası:', error);
            uptimeLatency = 'Hata';
            uptimeStatus = '❌';
            const finalMessage = `${pingEmoji} **Gecikme:** ${botPing}ms\n${apiEmoji} **API Gecikmesi:** ${apiPing}ms\n${uptimeEmoji} **Render Ping (${renderURL}):** ${uptimeStatus} Hata`;
            initialMessage.edit(finalMessage).catch(console.error);
        }
    },
};
