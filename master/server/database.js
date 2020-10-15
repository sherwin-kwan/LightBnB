const properties = require('./json/properties.json');
const users = require('./json/users.json');
const pg = require('pg');
const passwordFile = require('./passwordFile');

const pool = new pg.Pool({
  user: 'vagrant',
  password: passwordFile,
  host: 'localhost',
  database: 'lightbnb'
});


/// Users

// /**
//  * Get a single user from the database given their id.
//  * @param {string} id The id of the user.
//  * @return {Promise<{}>} A promise to the user.
//  */
const getUserWithId = (id) => {
  return pool.query(`
  SELECT * FROM users
  WHERE id = $1`, [id])
  .then((res) => {
    // res.rows will be empty if there are 0 results for the database query (Note: empty arrays are truthy so .length needs to be added to the condition)
    return (res.rows.length) ? res.rows[0] : null;
  })
  .catch(err => console.error('query error', err.stack));
};

getUserWithId(-1).then((res) => console.log(res));
exports.getUserWithId = getUserWithId;

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = (email) => {
  return pool.query(`
  SELECT * FROM users
  WHERE email = $1
    `, [email])
    .then((res) => {
      return (res.rows.length) ? res.rows[0] : null;
    })
    .catch(err => console.error('query error', err.stack));
};

exports.getUserWithEmail = getUserWithEmail;


// /// Properties

// /**
//  * Get all properties.
//  * @param {{}} options An object containing query options.
//  * @param {*} limit The number of results to return.
//  * @return {Promise<[{}]>}  A promise to the properties.
//  */

const getAllProperties = (options, perPage = 10) => {
  return pool.query(`
  SELECT * FROM properties
  LIMIT $1;
  `, [perPage])
    .then(res => res.rows)
    .catch(err => console.error('query error', err.stack));
}


// ALL OF THE BELOW IS OLD CODE USING SIMULATED DATA
//
//
//
//


// /**
//  * Add a new user to the database.
// Note: Password is already hashed before it's inserted as a parameter here.
//  * @param {{name: string, password: string, email: string}} user
//  * @return {Promise<{}>} A promise to the user.
//  */
const addUser = (user) => {
  return pool.query(`
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *;`, [user.name, user.email, user.password])
  .then((res) => {
    return res.rows[0];
  })
  .catch(err => console.error('query error', err.stack));
};


exports.addUser = addUser;

// /// Reservations

// /**
//  * Get all reservations for a single user.
//  * @param {string} guest_id The id of the user.
//  * @return {Promise<[{}]>} A promise to the reservations.
//  */
const getAllReservations = function (guest_id, limit = 10) {
  return getAllProperties(null, 2);
}
exports.getAllReservations = getAllReservations;


exports.getAllProperties = getAllProperties;


// /**
//  * Add a property to the database
//  * @param {{}} property An object containing all of the property details.
//  * @return {Promise<{}>} A promise to the property.
//  */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
