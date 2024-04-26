const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');
const moment = require('moment');

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
      await authenticationServices.reset_percobaanLogin(email);
      return response.status(200).json(loginSuccess);
    }
    
   else{
    const kegagalan_login = await authenticationServices.hayoUdahKenaLimitBelum(email);
    if(kegagalan_login > 5){
      const terakhirGagalLogin = await authenticationServices.kapanGagalLogin_latest(email);
      const waktu_terakhirGagal = moment().diff(moment(terakhirGagalLogin), 'minutes');
      if(waktu_terakhirGagal < 30){
        throw errorResponder(errorTypes.FORBIDDEN, `Cannot login. Please wait and try again in ${30 - waktu_terakhirGagal} minutes.`)
      }

      else {
        await authenticationServices.naikan_percobaangagalLogin(email);
        const loveMessage = await authenticationServices.pesanCintaKarenaGagal(email);
        return response.status(403).json({message: loveMessage});
   }
    }
    }
   } 

   catch (error){
      return next (error);

    }
    }

module.exports = {
  login,
};
