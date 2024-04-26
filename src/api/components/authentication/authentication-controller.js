const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');
const { User } = require('../../../models');

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
      await authenticationServices.resetCounter(email);
      return response.status(200).json(loginSuccess);
    }

    else if(!loginSuccess){
      const user = await User.findOne({email});
      const waktuSekarang = Date.now();
      const dah30menitBlum = new Date(waktuSekarang - 30 * 60 * 1000);
      if(user.timeStamp_gagalLogin && user.timeStamp_gagalLogin > dah30menitBlum && user.gagalLogin>=5){
        throw errorResponder(errorTypes.FORBIDDEN, 'Too many failed login attempts.')
      }

      await User.updateOne({email}, {$inc:{gagalLogin:1}, $set:{timeStamp_gagalLogin:Date.now()}});
      await authenticationServices.pesanCintaKarenaGagal(email);
    }

    next();
  }
   catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
