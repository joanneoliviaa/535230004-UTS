const jolivMBankService = require('./jolivMBank-service');
const jolivMBankRepository = require('./jolivMBank-repository');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get list of users request
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
  
      return response.status(200).json({ name, email, saldo });
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

  module.exports = {
    getAccounts,
    bikinAkun,
    mauLogin,
    transaksiBos,
  };
  
