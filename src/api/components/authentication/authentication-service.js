const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');
const {User} = require('../../../models');
const { errorResponder, errorTypes } = require('../../../core/errors');
const moment = require('moment');

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  const user = await authenticationRepository.getUserByEmail(email);

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.
  if (user && passwordChecked) {
    user.terakhirBerhasilLogin = new Date();
    await user.save();
    await resetLimitAfterTime(email);
    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  }

  else if(!passwordChecked){
    const kegagalan_login = await hayoUdahKenaLimitBelum(email);
    if(kegagalan_login > 5){
      const terakhirGagalLogin = await kapanGagalLogin_latest(email);
      const waktu_terakhirGagal = moment().diff(moment(terakhirGagalLogin), 'minutes');
      if(waktu_terakhirGagal < 30){
        throw errorResponder(errorTypes.FORBIDDEN, `Cannot login. Please wait and try again in ${30 - waktu_terakhirGagal} minutes.`)
      }

      else {
        await resetLimitAfterTime(email);
      }
    }
  }
  return null;
  }

/**
 * @param {string} email - email
 * @returns {string} - Waktu exact nya kapan
 */
async function kapanGagalLogin_latest(email){
  const ara = await User.findOne({email});

  if(ara){
    if(ara.timeStamp_gagalLogin){
      return moment(ara.timeStamp_gagalLogin).format('YYYY-MM-DD HH:mm:ss');
  }
  }
}

/**
 * @param {string} email - email user
 * @returns {object} - berapa kali user sudah berusaha untuk login
 */
async function hayoUdahKenaLimitBelum(email){
  const unknown_user = await User.findOne({email});

  if(unknown_user){
    return unknown_user.gagalLogin || 0;
  }
  
  else{
    throw errorResponder(errorTypes.FORBIDDEN,'Waduh..')
  }
}

/**
 * @param {string} email - email user
 * @returns {Promise} 
 */
async function naikan_percobaangagalLogin(email){
  const pengguna = await User.findOne({email});

  if(pengguna){
    pengguna.gagalLogin = (pengguna.gagalLogin || 0) + 1;
    pengguna.timeStamp_gagalLogin = new Date();

    pengguna.kapanGagalLogin_latest = moment().format('YYYY-MM-DD HH:mm:ss');

    await pengguna.save();
    return true;
    }

    else{
      return false;
    }
}

/**
 * @params {string} email - email user
 * @returns {Promise}
 */
async function reset_percobaanLogin(email){
  const anya = await User.findOne({email});

  if(anya){
    anya.gagalLogin = 0;
    await anya.save();
    return true;
  }

  else{
    return false;

  }

}

/** 
 * @params {string} email 
 * @returns {promise}
 */
async function resetLimitAfterTime(email){
  const penggunaa = await User.findOne({email});

  if(penggunaa){
    const timeElapsed = new Date() - penggunaa.terakhirBerhasilLogin;
    const minutesElapsed = Math.floor(timeElapsed/(1000*60));
    if(minutesElapsed>=30){
      penggunaa.gagalLogin = 0;
      penggunaa.timeStamp_gagalLogin = null;
      await penggunaa.save();
    }
  }
}

/**
 * @params {string} email - email
 * @returns {object} 
 */
async function pesanCintaKarenaGagal(email){
  const bondoMan = await User.findOne({email});

  if(bondoMan){
    const suratCinta = `User ${email} gagal login. Attempt = ${bondoMan.gagalLogin ||0}.`;
    return suratCinta;
  }
}

module.exports = {
  kapanGagalLogin_latest,
  checkLoginCredentials,
  hayoUdahKenaLimitBelum,
  naikan_percobaangagalLogin,
  reset_percobaanLogin,
  pesanCintaKarenaGagal,
};
