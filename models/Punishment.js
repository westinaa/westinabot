const mongoose = require('mongoose');

// Punishment Schema (Ceza Şeması)
const punishmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // Ceza verilen kullanıcının ID'si
    moderatorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // Ceza veren moderatörün ID'si
    type: { type: String, required: true, enum: ['mute', 'jail', 'ban'], default: 'mute' }, // Ceza türü (mute, jail, ban, vs.)
    reason: { type: String, default: 'Sebep belirtilmedi' }, // Ceza sebebi
    duration: { type: Number, default: 0 }, // Ceza süresi (saat veya dakika olarak)
    startTime: { type: Date, default: Date.now }, // Ceza başlangıç zamanı
    endTime: { type: Date }, // Ceza bitiş zamanı (süreli cezalar için)
    isActive: { type: Boolean, default: true }, // Cezanın aktif olup olmadığını kontrol eder
});

// Punishment Modeli
const Punishment = mongoose.model('Punishment', punishmentSchema);

module.exports = Punishment;
