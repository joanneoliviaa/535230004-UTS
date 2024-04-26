const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');
const {User} = require('../../../models');

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );
    
    if(loginSuccess){
      await authenticationServices.resetLoginAttempt();
      return response.status(200).json(loginSuccess);
    }

    else{
      const aaa = await authenticationServices.hayoUdahKenaLimitBelum(email);
      if(aaa){
        await authenticationServices.resetLimitAfterTime();
      }
      else{
        await authenticationServices.naikan_percobaangagalLogin(email);
        const loveMessage = await authenticationServices.pesanCintaKarenaGagal(email);
        return response.status(403).json({message: loveMessage})};
      }
      }
    
    catch(error){
      return next(error);
    }
   }

module.exports = {
  login,
};
