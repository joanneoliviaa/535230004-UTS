const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');
const { User } = require('../../../models');
const batasWaktu = 30*60*1000;
/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {objecst} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;
  const user = await User.findOne({email});
  
  try {
    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if(!loginSuccess){
      if(user && user.gagalLogin < 5){
      await User.updateOne({email}, {$inc:{gagalLogin:1}});
      await authenticationServices.updateWaktuGagalLogin(email);
      await authenticationServices.pesanCintaKarenaGagal(email);
      }

      else {
        if(user && user.gagalLogin >=5 && user.timeStamp_gagalLogin){
          const rentangWaktu = Date.now() - (user.timeStamp_gagalLogin||0);
          if(rentangWaktu < batasWaktu) {
            return errorResponder(errorTypes.ALERT, 'You have tried more than 5 times login attempt. Try to wait for 30 minutes.');
      }
    }
  }
}
  
  else {
      await authenticationServices.resetCounter(email);
      return response.status(200).json(loginSuccess);
      }
      next();
    }

   catch (error) {
    console.error('Salah di controller', error);
    return errorResponder(errorTypes.INTERNAL_SERVER_ERROR,'Error kak');
  }
}

module.exports = {
  login,
};


