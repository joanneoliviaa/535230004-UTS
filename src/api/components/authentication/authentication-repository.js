const { User } = require('../../../models');
const { timeStamp_gagalLogin } = require('../../../models/users-schema');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

module.exports = {
  getUserByEmail,
};
