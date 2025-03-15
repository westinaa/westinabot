
const { PermissionFlagsBits } = require('discord.js');
const config = require('../config.js');

exports.permissions = {
    checkModerator(member) {
        // Handle different member formats: both normal member objects and objects with roles property
        if (!member) return false;
        
        // Case 1: Check when roles is directly passed in the structure (used in guard.js)
        if (member.roles && member.roles.cache && typeof member.roles.cache.some === 'function') {
            return member.roles.cache.some(role => config.moderatorRoles.includes(role.name)) || 
                  (member.permissions && member.permissions.has(PermissionFlagsBits.Administrator));
        }
        
        // Case 2: Handle object with nested roles structure (used in guard.js handleRoleChanges & similar)
        if (member.roles && member.roles.cache && Array.isArray(member.roles.cache)) {
            return member.roles.cache.some(role => config.moderatorRoles.includes(role.name));
        }

function checkAdmin(member) {
    return member.permissions.has("Administrator");
}

module.exports = { checkAdmin };

        
        return false;
    }
};
