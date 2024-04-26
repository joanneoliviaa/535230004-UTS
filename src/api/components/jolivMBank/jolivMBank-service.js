const jolivMBankRepository = require('./jolivMBank-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const {User} = require('../../../models');

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @param {string} kodeAkses - Kode akses  yang dibutuhkan untuk login
 * @param {string} noTelepon - nomor telepon user (harus unik)
 * @param {string} password_confirm - konfirm password harus sama dengan password
 * @param {string} pin_Mbank - pin untuk melakukan transaksi
 * @returns {boolean}
 */
async function bikinAkun(name, email, password, kodeAkses, noTelepon, pin_Mbank) {
    // Hash password
    const hashedPassword = await hashPassword(password);
  
    try {
      await jolivMBankRepository.bikinAkun(name, email, hashedPassword, kodeAkses, noTelepon, pin_Mbank);
    } catch (err) {
      return null;
    }
  
    return true;
  }

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
    const user = await jolivMBankRepository.getUserByEmail(email);
  
    if (user) {
      return true;
    }
  
    return false;
  }

/**
 * Check whether the phone number is registered
 * @param {string} noTelepon - nomor telepon
 * @returns {boolean}
 */
async function noTeleponIsRegistered(noTelepon) {
    const users = await jolivMBankRepository.getUserByPhone(noTelepon);
  
    if (users) {
      return true;
    }
  
    return false;
  }
  module.exports = {
    bikinAkun,
    emailIsRegistered,
    noTeleponIsRegistered,
  };
  