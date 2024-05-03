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
 * @returns {boolean} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function cekDuluSebelumLogin(kodeAkses, password){
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

/**
 * Untuk melakukan transaksi keuangan, user perlu menginput id tujuan 
 * @params {string} id - id tujuan 
 * @params {number} jumlah_transaksi - jumlah transaksi
 * @params {string} berita - pesan kepada tujuan transaksi (opsional)
 * @returns {object}
 */
async function transaksiBos(idOrangLain, idSendiri, jumlah_uang){
  const dariSiapa = await jolivMBankRepository.getUser(idSendiri);
  const keSiapa = await jolivMBankRepository.getUser(idOrangLain);

  if(dariSiapa != keSiapa){
    let saldoSendiri = await jolivMBankRepository.getSaldoById(idSendiri);
    if(jumlah_uang <= saldoSendiri){
      dariSiapa.saldo -= jumlah_uang;
      keSiapa.saldo += jumlah_uang;

      await jolivMBankRepository.saveTransaksi(idSendiri, dariSiapa.saldo);
      await jolivMBankRepository.saveTransaksi(idOrangLain, keSiapa.saldo);
      return true;
      }
      else {
        throw new Error("Saldo anda tidak cukup. Silahkan isi ulang :D.");
      }}
        else {
          return false;
        }
      }

/**
 * Update nomor telepon
 * @param {string} id - id
 * @param {string} kodeAkses - kode akses
 * @returns {boolean}
 */
async function updateNotelp(id, noTelepon) {
  const user = await jolivMBankRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await jolivMBankRepository.updateNotelp(id, noTelepon);
  }
   catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete akun user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await jolivMBankRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await jolivMBankRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the password is correct
 * @param {string} id- User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(id, password) {
  const user = await jolivMBankRepository.getUser(id);
  return passwordMatched(password, user.password);
}

  module.exports = {
    getAccounts,
    bikinAkun,
    emailIsRegistered,
    noTeleponIsRegistered,
    kodeAksesIsRegistered,
    cekDuluSebelumLogin,
    transaksiBos,
    updateNotelp, 
    deleteUser, 
    checkPassword,
  };
  