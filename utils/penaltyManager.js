// utils/penaltyManager.js

const penalties = new Map(); // Store penalties for each user

class Penalty {
    constructor(type, moderator, date) {
        this.type = type; // Type of penalty (e.g., mute, jail)
        this.moderator = moderator; // The moderator who issued the penalty
        this.date = date; // Date penalty was issued
    }
}

function addPenalty(userId, type, moderator) {
    const penalty = new Penalty(type, moderator, new Date());
    if (!penalties.has(userId)) {
        penalties.set(userId, []);
    }
    penalties.get(userId).push(penalty);
}

function getPenalties(userId) {
    return penalties.get(userId) || [];
}

function getTotalPoints(userId) {
    return getPenalties(userId).length; // Each penalty counts as one point
}

module.exports = {
    addPenalty,
    getPenalties,
    getTotalPoints,
};
