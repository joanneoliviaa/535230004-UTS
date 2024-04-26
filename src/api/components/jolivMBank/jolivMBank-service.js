const jolivMBankRepository = require('./jolivMBank-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const {User} = require('../../../models');

/**
 * Get list of accounts
 * @returns {Array}
 */
async function getAccounts() {
    const users = await jolivMBankRepository.getAccounts();
  
    const results = [];
    for (let i = 0; i < users.length; i += 1) {
      const user = users[i];
      results.push({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    }
  
    return results;
  }

/**
 * Create new accounts
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @param {string} kodeAkses - Kode akses  yang dibutuhkan untuk login
 * @param {string} noTelepon - nomor telepon user (harus unik)
 * @param {string} password_confirm - konfirm password harus sama dengan password
 * @param {string} pin_Mbank - pin untuk melakukan transaksi
 * @returns {boolean}
 */
async function bikinAkun(name, email, password, kodeAkses, noTelepon, pin_Mbank, saldo) {
    // Hash password
    const hashedPassword = await hashPassword(password);
  
    try {
      await jolivMBankRepository.bikinAkun(name, email, hashedPassword, kodeAkses, noTelepon, pin_Mbank, saldo);
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

/**
 * Check whether the kode akses is registered
 * @param {string} kodeAkses - kode akses
 * @returns {boolean}
 */
async function kodeAksesIsRegistered(kodeAkses) {
  const users = await jolivMBankRepository.getAccountByKodeAkses(kodeAkses);

  if (users) {
    return true;
  }

  return false;
}

  /**
 * Check kodeAkses and password
 * @param {string} email - Email
 * @param {string} password - Password
 * @param {string} name - output yang akan tampil saat user berhasil login
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function cekDuluSebelumLogin(kodeAkses, password, name){
  const account = await jolivMBankRepository.getUserByKodeAkses(kodeAkses);

  const userPassword = account ? account.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  if(!account){
    return null;
  }
  const namaPengguna = account.name;
  if(kodeAkses && passwordChecked){
    return {
      message: `Selamat Datang, ${namaPengguna}!`,
      saldo: account.saldo,
    };
  }
}

  module.exports = {
    getAccounts,
    bikinAkun,
    emailIsRegistered,
    noTeleponIsRegistered,
    kodeAksesIsRegistered,
    cekDuluSebelumLogin,
  };
  