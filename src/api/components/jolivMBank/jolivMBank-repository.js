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
 * Get account by phone number to prevent duplicate phone number
 * @param {string} noTelepon
 * @returns {Promise}
 */
async function getUserByPhone(noTelepon){
    return User.findOne({noTelepon});
}

/**
 * Get account's name
 * @param {string} name
 * @returns {Promise}
 */
async function getUserByName(name){
  return User.findOne({name});
}


/**
 * Get account's name by id 
 * @param {string} name
 * @params {string} id
 * @returns {Promise}
 */
async function getNameById(id){
  const namaTujuan = await User.findOne({_id: id});
  if(namaTujuan){
    return namaTujuan.name;
  }
  
  else{
    return null;
  }
}

/**
 * Get user by kodeAkses to prevent duplicate kodeAkses
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getAccountByKodeAkses(kodeAkses) {
  return User.findOne({ kodeAkses });
}

/**
 * Get account by kodeAkses for login information
 * @param {string} kodeAkses - Kode akses
 * @returns {Promise}
 */
async function getUserByKodeAkses(kodeAkses) {
  return User.findOne({ kodeAkses });
}

/**
 * Get account by id for transaksi 
 * @param {string} id - id
 * @returns {Promise}
 */
async function getSaldoById(id) {
  const norekTujuan = await User.findOne({_id: id});
  if(norekTujuan){
    return norekTujuan.saldo;
  }
  
  else{
    return null;
  }
}

/**
 * @params {string} id - id
 * @returns {Promise} - id akun
 */
async function getUser(id){
  return User.findOne({_id:id});
}

/**
 * @params {string} id - id
 * @params {number} saldo - saldo 
 * @returns {Promise}
 */
async function saveTransaksi(id, saldo){
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        saldo,
      },
    }
  );
}

  module.exports = {
    getAccounts,
    bikinAkun,
    getUserByName,
    getUserByEmail,
    getUserByPhone,
    getAccountByKodeAkses,
    getUserByKodeAkses,
    getSaldoById,
    getUser,
    saveTransaksi,
    getNameById,
  };