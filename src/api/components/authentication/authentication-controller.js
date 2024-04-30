const e = require('express');
const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');
const gagalLogin = {};

function simpenwaktuGagal(email){
  gagalLogin[email] = {
    timestamp: Date.now(),
    attempts: 1
  };
}

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
    if(gagalLogin[email] && gagalLogin[email].attempts >= 5){
      throw errorResponder(errorTypes.FORBIDDEN, `User ${(email)} exceeded maximum login attempt, please kindly try again in 30 minutes :)`);
    }
    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (!loginSuccess) {
      if(!gagalLogin[email]){
        simpenwaktuGagal(email);
      }
      else {
        gagalLogin[email].attempts++
      }
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, `Wrong email or password. Login attempt = ${gagalLogin[email].attempts}`);
      
    }

    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

setInterval(() => {
  const waktuSekarang = Date.now();
  for (const email in gagalLogin){
    if (waktuSekarang - gagalLogin[email].timestamp >= 30*60*1000){
      delete gagalLogin[email];
    }
  }
}, 60000);

module.exports = {
  login,
};