const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');
const {User} = require('../../../models');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { P } = require('pino');
const { gagalLogin } = require('../../../models/users-schema');

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

  if(user){
    user.terakhirBerhasilLogin = new Date();
    await user.save();
  }
  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.
  if (user && passwordChecked) {
    const waktu = new Date() - user.terakhirBerhasilLogin;
    const menit = Math.floor(waktu/(1000*60));
    if(menit>=30 || !user.timeStamp_gagalLogin){
      user.gagalLogin = 0;
    }

    user.terakhirBerhasilLogin = new Date();
    await user.save();
    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  }
  else{
  return null;
  }
}

/**
 * @param {string} email - email
 * @returns {number} - Waktu exact nya kapan
 */
async function kapanGagalLogin_latest(email){
  const ara = await User.findOne({email});

  if(ara){
    if(ara.timeStamp_gagalLogin){
      const stemWaktu = new Date(ara.timeStamp_gagalLogin);
      const waktuSekarang = new Date();
      const perbedaanWaktu = waktuSekarang - stemWaktu;
      const perbedaanMenit = Math.floor(perbedaanWaktu/(1000*60));
      return perbedaanMenit;
  }

  else{
    ara.timeStamp_gagalLogin = new Date();
    await ara.save();
    return 0;
  }
  }
}

/**
 * @param {string} email - email user
 * @returns {object} - berapa kali user sudah berusaha untuk login
 */
async function hayoUdahKenaLimitBelum(email){
  const unknown_user = await User.findOne({email});

  if(unknown_user && unknown_user.gagalLogin >=5){
    return true;
  }
  
  return false;
  }

  /**
   * @params {string} -
   * @returns
  */
 async function resetLimitAfterTime(){
    try{
      const users = await User.find({gagalLogin: {$gt:4}});

      for(const user of users){
        const lastFailed = user.timeStamp_gagalLogin;
        const waktu = new Date() - lastFailed;
        const menit = Math.floor(waktu/(1000*60));
        if(menit>=30){
          user.gagalLogin = 0;
          user.timeStamp_gagalLogin = 0;
          await user.save();
        }
      }
    }
    catch(error){
      console.error('Error reset limit after time login:', error);
    }
  }
setInterval(resetLimitAfterTime, 30*60*1000);


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

/**
 * @params {string} - email 
 * @returns {Promise<boolean>}
 */
async function naikan_percobaangagalLogin(email){
  try{
    const pengguna = await User.findOne({email});
    if(pengguna){
      pengguna.gagalLogin=(pengguna.gagalLogin||0) +1;
      pengguna.timeStamp_gagalLogin = new Date();

      await pengguna.save()
      return true;
    }

    else{
      return false;
    }
  }
  catch(error){
    console.error('Error di fungsi naikan percobaan login', error);
    return false;
  }
}

async function resetLoginAttempt(email){
  try{
    const userr = await User.findOne({email});
    if(userr){
      userr.gagalLogin = 0;
      await userr.save();
      return true;
    }

    else {
      return false;
    }
  }

  catch(error){
    console.error('errornya di resetLoginAttempt', error);
    return false;
  }
}

module.exports = {
  kapanGagalLogin_latest,
  checkLoginCredentials,
  hayoUdahKenaLimitBelum,
  resetLimitAfterTime,
  pesanCintaKarenaGagal,
  naikan_percobaangagalLogin,
  resetLoginAttempt,
};
