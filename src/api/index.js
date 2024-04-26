const express = require('express');

const authentication = require('./components/authentication/authentication-route');
const users = require('./components/users/users-route');
const jolivMBank = require('./components/jolivMBank/jolivMBank-route');

module.exports = () => {
  const app = express.Router();

  authentication(app);
  users(app);
  jolivMBank(app);

  return app;
};
