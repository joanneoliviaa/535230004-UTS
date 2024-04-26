const usersSchema = {
  name: String,
  email: String,
  password: String,
  gagalLogin: Number,
  timeStamp_gagalLogin: Date,
  terakhirBerhasilLogin: Date,
  kodeAkses: String,
  noTelepon: Number,
  confirm_password: String,
  pin_mBank: Number,
  saldo: Number,
};

module.exports = usersSchema;
