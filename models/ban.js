const mongoose = require("mongoose");

const banSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    moderatorId: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        default: "Sebep belirtilmedi",
    },
    guildId: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Ban = mongoose.model("Ban", banSchema);

module.exports = Ban;
