const usersSchema = {
  name: String,
  email: String,
  password: String,
  gagalLogin: Number,
  timeStamp_gagalLogin: Date,
  terakhirBerhasilLogin: Date,
};

module.exports = usersSchema;
