const { User } = require('../../../models');

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @param {string} kodeAkses - Kode akses  yang dibutuhkan untuk login
 * @param {string} noTelepon - nomor telepon user (harus unik)
 * @param {string} password_confirm - konfirm password harus sama dengan password
 * @param {string} pin_Mbank - pin untuk melakukan transaksi
 * @returns {Promise}
 */
async function bikinAkun(name, email, password, kodeAkses, noTelepon, pin_Mbank) {
    return User.create({
      name,
      email,
      password,
      kodeAkses,
      noTelepon,
      pin_Mbank,
    });
  }

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
    return User.findOne({ email });
  }
  
/**
 * Get user by phone number to prevent duplicate phone number
 * @param {string} noTelepon
 * @returns {Promise}
 */
async function getUserByPhone(noTelepon){
    return User.findOne({noTelepon});
}

  module.exports = {
    bikinAkun,
    getUserByEmail,
    getUserByPhone,
  };