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
    previousRoles: { type: [String], default: [] }, 
    jailEndTime: {
        type: Date,
        required: true,
    },
    reason: {
        type: String,
        default: "Sebep belirtilmedi",
    },
    moderatorId: {
        type: String,
        required: true,
    },
    roles: {
        type: [String],  // Kullanıcının geçici olarak alacağı roller
        default: [],
    },
}, { timestamps: true });  // Kullanıcı cezalandırma işleminin zamanını kaydeder.

const User = mongoose.model("User", userSchema);

module.exports = User;
