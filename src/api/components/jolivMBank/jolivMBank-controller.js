const jolivMBankService = require('./jolivMBank-service');
const jolivMBankRepository = require('./jolivMBank-repository');
const { errorResponder, errorTypes } = require('../../../core/errors');

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

      //Phone number must be unique
      const noTeleponIsRegistered = await jolivMBankService.noTeleponIsRegistered(noTelepon);
      if (noTeleponIsRegistered){
        throw errorResponder(errorTypes.FORBIDDEN, 'Nomor Telepon tidak boleh sama.');
      }
  
      const success = await jolivMBankService.bikinAkun(name, email, password, kodeAkses, noTelepon, pin_Mbank);
      if (!success) {
        throw errorResponder(
          errorTypes.UNPROCESSABLE_ENTITY,
          'Failed to create user'
        );
      }
  
      return response.status(200).json({ name, email });
    } catch (error) {
      return next(error);
    }
  }

  module.exports = {
    bikinAkun,
  };
  
