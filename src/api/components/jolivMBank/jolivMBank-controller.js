const jolivMBankService = require('./jolivMBank-service');
const jolivMBankRepository = require('./jolivMBank-repository');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { throttle } = require('lodash');

/**
 * Handle get list to show user's account 
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getAccounts(request, response, next) {
    try {
      const users = await jolivMBankService.getAccounts();
      return response.status(200).json(users);
    } catch (error) {
      return next(error);
    }
  }

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function bikinAkun(request, response, next) {
    try {
      const name = request.body.name;
      const email = request.body.email;
      const password = request.body.password;
      const password_confirm = request.body.password_confirm;
      const kodeAkses = request.body.kodeAkses;
      const noTelepon = request.body.noTelepon;
      const pin_Mbank = request.body.pin_Mbank;
      // Setiap saldo akun baru akan diset menjadi Rp. 100.000
      const saldo = 100000;
  
      // Check confirmation password
      if (password !== password_confirm) {
        throw errorResponder(
          errorTypes.INVALID_PASSWORD,
          'Password confirmation mismatched'
        );
      }
  
      // Email must be unique
      const emailIsRegistered = await jolivMBankService.emailIsRegistered(email);
      if (emailIsRegistered) {
        throw errorResponder(
          errorTypes.EMAIL_ALREADY_TAKEN,
          'Email is already registered'
        );
      }

    // kodeAkses must be unique
    const kodeAksesIsRegistered = await jolivMBankService.kodeAksesIsRegistered(kodeAkses);
    if (kodeAksesIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Kode akses is already registered'
      );
    }

      //Phone number must be unique
      const noTeleponIsRegistered = await jolivMBankService.noTeleponIsRegistered(noTelepon);
      if (noTeleponIsRegistered){
        throw errorResponder(errorTypes.FORBIDDEN, 'Nomor Telepon tidak boleh sama.');
      }
  
      const success = await jolivMBankService.bikinAkun(name, email, password, kodeAkses, noTelepon, pin_Mbank, saldo);
      if (!success) {
        throw errorResponder(
          errorTypes.UNPROCESSABLE_ENTITY,
          'Failed to create user'
        );
      }
  
      return response.status(200).json({
        message: 'Selamat! Akun anda sudah berhasil dibuat dengan detail sebagai berikut',
        name, 
        email, 
        saldo,
       });
    } catch (error) {
      return next(error);
    }
  }

/**
 * Handle login account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function mauLogin(request, response, next){
  const { kodeAkses, password } = request.body;

  try{
    const loginBerhasil = await jolivMBankService.cekDuluSebelumLogin(
      kodeAkses,
      password
    );

    if(loginBerhasil){
      return response.status(200).json(loginBerhasil);
    }

    else{
      throw errorResponder(errorTypes.BAD_REQUEST,'Gagal login.');
    }
  }

  catch(error){
    next(error);
  }

}

/**
 * Handle transaksi keuangan
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function transaksiBos(request, response, next){
  try {
    const idSendiri = request.params.id;
    const idOrangLain = request.body.id;
    const jumlah_uang = request.body.jumlah_uang;
    const pin_Mbank = request.body.pin_Mbank;

    const pinSama = await jolivMBankRepository.cekPin(idSendiri);
    if(pin_Mbank != pinSama){
      throw errorResponder(errorTypes.FORBIDDEN, 'Pin mbank salah. Silahkan coba lagi.');
    }

    const transaksiYes = await jolivMBankService.transaksiBos(idOrangLain, idSendiri, jumlah_uang);
    const namaTujuan = await jolivMBankRepository.getNameById(idOrangLain);
    const namaSendiri = await jolivMBankRepository.getNameById(idSendiri);
    const waktuSekarang = new Date();

    if (transaksiYes){
      return response.status(200).json({
        idTujuan: idOrangLain,
        namaTujuan: namaTujuan,
        jumlahTransaksi: jumlah_uang,
        waktuTransaksi: waktuSekarang,
        message: `Selamat! Transaksi anda berhasil, ${namaSendiri}.`
      });
      }
    }
catch(error){
  next(error);
}
}

/**
 * Handle change user phone number request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateNotelp(request, response, next) {
  try {
    const id = request.params.id;
    const kodeAkses = request.body.kodeAkses;
    const noTelepon = request.body.noTelepon;

    //Cek kesamaan kode akses
    const sama_ga = await jolivMBankRepository.getkodeAksesById(id);
    if(kodeAkses != sama_ga){
      throw errorResponder(errorTypes.BAD_REQUEST,'Kode akses salah.');
    }

    //nomor telepon lama ga boleh sama kayak yg baru dan harus unik.
    const telp_sama = await jolivMBankRepository.getUserByPhoneId(id);
    const telp_bandingin = await jolivMBankService.noTeleponIsRegistered(noTelepon);
    if(noTelepon == telp_sama && telp_bandingin){
      throw errorResponder(errorTypes.BAD_REQUEST, 'Nomor telepon harus unik.');
    }

    const changeSuccess = await jolivMBankService.updateNotelp(id, noTelepon);
      if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change pin joliv digital bank.'
      );
    }

    return response.status(200).json("Nomor telepon berhasil diubah.");
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;
    const email = request.body.email;
    const name = request.body.name;
    const password = request.body.password;
    const pin_Mbank = request.body.pin_Mbank;

    const emailSamaKah = await jolivMBankRepository.cekEmail(id);
    if(email != emailSamaKah){
      throw errorResponder(errorTypes.BAD_REQUEST, 'Email harus sama!');
    }
    const namaSamaKah = await jolivMBankRepository.cekNama(id);
    if(name != namaSamaKah){
      throw errorResponder(errorTypes.BAD_REQUEST, "Nama harus sama!");
    }
    const passwordSamaKah = await jolivMBankService.checkPassword(id, password);
    if(!passwordSamaKah){
      throw errorResponder(errorTypes.BAD_REQUEST, "Password harus sama!");
    }
    const pinSamaKah = await jolivMBankRepository.cekPin(id);
    if(pin_Mbank != pinSamaKah){
      throw errorResponder(errorTypes.BAD_REQUEST, `Pin harus sama! ${pinSamaKah}`);
    }

    const success = await jolivMBankService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ 
      message: `Akun dengan nama pengguna ${name} dan id ${id} berhasil dihapus. Sampai jumpa kembali.`
     });
  } catch (error) {
    return next(error);
  }
}


  module.exports = {
    getAccounts,
    bikinAkun,
    mauLogin,
    transaksiBos,
    updateNotelp,
    deleteUser,
  };
  
