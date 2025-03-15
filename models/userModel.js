const mongoose = require('mongoose');

// Kullanıcı modelini oluşturuyoruz
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },  // Kullanıcı ID'si
    guildId: { type: String, required: true }, // Sunucu ID'si
    mutes: [
        {
            createdAt: { type: Date, default: Date.now },  // Mute tarihi
            reason: { type: String, default: 'Sebep belirtilmemiş' },  // Mute nedeni
            moderatorId: { type: String, required: true },  // Cezayı veren moderatörün ID'si
        }
    ],
    jails: [
        {
            createdAt: { type: Date, default: Date.now },  // Jail uygulama tarihi
            reason: { type: String, default: 'Sebep belirtilmemiş' },  // Jail nedeni
            moderatorId: { type: String, required: true },  // Cezayı veren moderatörün ID'si
        }
    ],
    bans: [
        {
            createdAt: { type: Date, default: Date.now },  // Ban tarihi
            reason: { type: String, default: 'Sebep belirtilmemiş' },  // Ban nedeni
            moderatorId: { type: String, required: true },  // Cezayı veren moderatörün ID'si
        }
    ],
    vmutes: [ // Yeni alan: VMute logları
        {
            createdAt: { type: Date, default: Date.now },  // VMute tarihi
            reason: { type: String, default: 'Sebep belirtilmemiş' },  // VMute nedeni
            endedAt: { type: Date, required: true },  // VMute bitiş tarihi
            moderatorId: { type: String, required: true },  // Cezayı veren moderatörün ID'si
        }
    ]
});

// Modeli oluştur
const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
