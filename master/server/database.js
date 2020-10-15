const properties = require('./json/properties.json');
const users = require('./json/users.json');
const pg = require('pg');
const passwordFile = require('./passwordFile');
const constants = require('./constants');
var format = require('pg-format');

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

// /// Properties

// /**
//  * Get all properties.
//  * @param {{}} options An object containing query options.
//  * @param {*} limit The number of results to return.
//  * @return {Promise<[{}]>}  A promise to the properties.
//  */

const getAllProperties = (options, perPage = constants.maxPropertyResults) => {
  // We have a parameters object, which contains three kinds of parameters:
  // A) Parameters which go into the WHERE clause
  // B) Parameters which go into the HAVING clause (right now, that is only "minimum_rating")
  // C) Parameters with empty values which should be skipped  
  // We will do a for-in loop through the object to construct the WHERE and HAVING clauses of the query
  let whereClause = ''; let havingClause = ''; let firstItem = true;
  for (let key in options) {
    console.log(key, options[key]);
    // Case C
    if (!options[key]) continue
    // Case B
    else if (key === 'minimum_rating') {
      havingClause += ` HAVING avg(reviews.rating) >= ${options.minimum_rating}`;
      continue;
    }
    // Case A
    whereClause += (firstItem) ? ` WHERE ` : ` AND `;
    firstItem = false;;
    if (key === 'city') {
      whereClause += `city LIKE '${options.city}%'`;
    } else if (key === 'maximum_price_per_night') {
      whereClause += `cost_per_night <= ${options.maximum_price_per_night}`;
    } else if (key === 'minimum_price_per_night') {
      whereClause += `cost_per_night >= ${options.minimum_price_per_night}`;
    } else if (key === 'owner_id') {
      whereClause += `owner_id = ${options.owner_id}`;
    }
  }
  // Next, we use pg-format to sanitize the two clauses before interpolating them into the query, in order to avoid SQL injection attacks
  const fullQuery = `
  SELECT properties.*, avg(reviews.rating) 
    FROM properties
    JOIN reviews ON reviews.property_id = properties.id ${format(whereClause)}
    GROUP BY properties.id ${format(havingClause)}
    LIMIT $1;
  `;
  console.log(fullQuery);
  // With the full query constructed, we can return results
  return pool.query(fullQuery, [perPage])
    .then(res => {
      return res.rows
    })
    .catch(err => console.error('query error', err.stack));
};

exports.getAllProperties = getAllProperties;


// SELECT properties.id, properties.title, properties.cost_per_night, avg(reviews.rating)
//   FROM properties
//   JOIN reviews ON reviews.property_id = properties.id
//   WHERE city = 'Vancouver'
//   GROUP BY properties.id
//   HAVING avg(reviews.rating) >= 4
//   ORDER BY cost_per_night
//   LIMIT 10;


// /// Reservations

// /**
//  * Get all reservations for a single user.
//  * @param {string} guest_id The id of the user.
//  * @return {Promise<[{}]>} A promise to the reservations.
//  */
const getAllReservations = (guest_id, limit = 10) => {
  return pool.query(`
  SELECT properties.*, reservations.start_date AS start_date, reservations.end_date AS end_date, avg(reviews.rating)
    FROM properties
    JOIN reviews ON properties.id = reviews.property_id
    JOIN reservations ON properties.id = reservations.property_id
    WHERE reservations.guest_id = $1
    AND reservations.end_date < now()::date
    GROUP BY properties.id, reservations.id
    ORDER BY reservations.start_date
    LIMIT $2;
`, [guest_id, limit])
    .then((res) => {
      return res.rows
    })
    .catch(err => console.error('query error', err.stack));
};

getAllReservations(35).then((rows) => console.log(rows.length));

exports.getAllReservations = getAllReservations;

// ALL OF THE BELOW IS OLD CODE USING SIMULATED DATA
//
//
//
//


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
