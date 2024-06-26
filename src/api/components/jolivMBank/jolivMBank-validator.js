const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  bikinAkun: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
      password: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(32)
        .required()
        .label('Password'),
      password_confirm: joi.string().required().label('Password confirmation'),
      kodeAkses: joi.string().required().label('Kode Akses'),
      noTelepon: joi.number().integer().min(12).required().label('Nomor Telepon'),
      pin_Mbank: joi.number().integer().min(6).required().label('Pin Mbank'),
    },
  },

  mauLogin:{
    body:{
      kodeAkses: joi.string().required().label('Kode Akses'),
      password: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(32)
        .required()
        .label('Password'),
    },
  },

  transaksiBos: {
    body:{
    id: joi.string().required().label('Id tujuan'),
    jumlah_uang: joi.number().integer().required().label('Jumlah dana transaksi.'),
    pin_Mbank: joi.number().integer().min(6).required().label('Pin Mbank'),
  },
},

updateNotelp:{
  body:{
    noTelepon: joi.number().integer().min(12).required().label('Nomor Telepon'),
    kodeAkses: joi.string().required().label('Kode Akses'),
  }
},

deleteUser:{
  body:{
    email: joi.string().email().required().label('Email'),
    name: joi.string().min(1).max(100).required().label('Name'),
    password: joiPassword
    .string()
    .minOfSpecialCharacters(1)
    .minOfLowercase(1)
    .minOfUppercase(1)
    .minOfNumeric(1)
    .noWhiteSpaces()
    .onlyLatinCharacters()
    .min(6)
    .max(32)
    .required()
    .label('Password'),
    pin_Mbank: joi.number().integer().min(6).required().label('Pin Mbank'),
  }
}
};
