const IDs = require("../ids.json");

const isStaff = (member) => {
  return (
    member.roles.cache.has(IDs.adminRole) ||
    member.roles.cache.has(IDs.respRole) ||
    member.roles.cache.has(IDs.superModoRole) ||
    member.roles.cache.has(IDs.modoRole) ||
    member.roles.cache.has(IDs.devRole) ||
    member.roles.cache.has(IDs.guideRole)
  );
};

const isHighStaff = (member) => {
  return member.roles.cache.has(IDs.adminRole) || member.roles.cache.has(IDs.respRole);
};

const isModerator = (member) => {
  return (
    member.roles.cache.has(IDs.adminRole) ||
    member.roles.cache.has(IDs.respRole) ||
    member.roles.cache.has(IDs.superModoRole) ||
    member.roles.cache.has(IDs.modoRole)
  );
};

module.exports = { isStaff, isHighStaff, isModerator };
