const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,  // Her kullanıcı sadece bir kez kaydedilebilir
    },
    guildId: {
        type: String,
        required: true,
    },
    jailEndTime: {
        type: Date,
        required: true,
    },
    reason: {
        type: String,
        default: "Sebep b
