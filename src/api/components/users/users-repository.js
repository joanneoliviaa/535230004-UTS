const { User } = require('../../../models');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/** 
 * Get users by search
 * @param {string} search - query yang diinput oleh user
 * @returns {Promise} - berisi data user hasil pencarian
 */
async function cariLewatQuery(search){
  if(!search || !search.includes(':')){
    return [];
  }
  
  const [emailAtaunama, kataKunci] = search.split(':');
  const objek_yangDicari = {};


  if (emailAtaunama == 'email' || emailAtaunama == 'name'){
    const biarBisaDicari = new RegExp(`^${kataKunci}`, 'i');
    objek_yangDicari[emailAtaunama] = {$regex: biarBisaDicari};
  }

  return User.find(objek_yangDicari);

}

/** 
 * Sorting either is ascending (naik) or descending (turun). Sorting by user's name or email
 * @param {string}  sort - query yang diinput oleh user
 * @retuns {Promise} - berisi array hasil sorting
 */
async function menyusunData(sort, users){
  let hasilSorting = {};

  if(!sort || !sort.includes(':')){
    hasilSorting['email'] = 1;
  }

  else{
    const [sortEmailatauNama, mauAscAtauDesc] = sort.split(':');
    const kataKunciUrutan = sortEmailatauNama === 'name' ? 'name' : 'email';
    const urutannya = mauAscAtauDesc === 'desc' ? -1 : 1;

    users.sort((a,b) => {
      if(a[kataKunciUrutan] < b[kataKunciUrutan]) return -1 * urutannya;
      if(a[kataKunciUrutan] > b[kataKunciUrutan]) return 1 * urutannya;
      return 0
    });

    
}
return users;
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getUsers,
  getUser,
  cariLewatQuery,
  menyusunData,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
};
