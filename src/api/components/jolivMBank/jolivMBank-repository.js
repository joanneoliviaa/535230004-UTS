const { User } = require('../../../models');

/**
 * Get a list of accounts
 * @returns {Promise}
 */
async function getAccounts() {
    return User.find({}, {name: 1, saldo: 1, email: 1});
  }

/**
 * Create new account
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @param {string} kodeAkses - Kode akses  yang dibutuhkan untuk login
 * @param {string} noTelepon - nomor telepon user (harus unik)
 * @param {string} password_confirm - konfirm password harus sama dengan password
 * @param {string} pin_Mbank - pin untuk melakukan transaksi
 * @params {string} saldo - isi saldo akun 
 * @returns {Promise}
 */
async function bikinAkun(name, email, password, kodeAkses, noTelepon, pin_Mbank, saldo) {
    return User.create({
      name,
      email,
      password,
      kodeAkses,
      noTelepon,
      pin_Mbank,
      saldo,
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
    getAccounts,
    bikinAkun,
    getUserByEmail,
    getUserByPhone,
  };