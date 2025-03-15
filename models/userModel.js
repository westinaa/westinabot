const mongoose = require('mongoose');

// Kullanıcı modelini oluşturuyoruz
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },  // Kullanıcı ID'si
    guildId: { type: String, required: true }, // Sunucu ID'si
    mutes: [
        {
            createdAt: { type: Date, default: Date.now },  // Mute tarihi
            reason: { type: String, default: 'Sebep belirtilmemiş' },  // Mute nedeni
        }
    ],
    jails: [
        {
            createdAt: { type: Date, default: Date.now },  // Jail uygulama tarihi
            reason: { type: String, default: 'Sebep belirtilmemiş' },  // Jail nedeni
        }
    ],
    bans: [
        {
            createdAt: { type: Date, default: Date.now },  // Ban tarihi
            reason: { type: String, default: 'Sebep belirtilmemiş' },  // Ban nedeni
        }
    ]
});

// Modeli oluştur
const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
