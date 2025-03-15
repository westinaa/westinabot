const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    jailEndTime: { type: Date, default: null }, // Süreli hapis için zaman
    reason: { type: String, default: "Sebep belirtilmedi" },
    moderatorId: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
