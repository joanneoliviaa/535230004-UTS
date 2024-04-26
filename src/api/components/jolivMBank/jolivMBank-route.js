const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const jolivMBankControllers = require('./jolivMBank-controller');
const jolivMBankValidator = require('./jolivMBank-validator.js');

const route = express.Router();

module.exports = (app) => {
  app.use('/jolivMBank', route);

  // Get list of accounts
  route.get('/', authenticationMiddleware, (req, res, next) => {
    jolivMBankControllers.getAccounts(req, res, next).catch(next);
  });

  // Create user
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(jolivMBankValidator.bikinAkun),
    jolivMBankControllers.bikinAkun
  );
}