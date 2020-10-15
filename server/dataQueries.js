const constants = require('./constants');
const format = require('pg-format');
const db = require('./db');

/// Users

// /**
//  * Get a single user from the database given their id.
//  * @param {string} id The id of the user.
//  * @return {Promise<{}>} A promise to the user.
//  */
const getUserWithId = (id) => {
  return db.query(`
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
  return db.query(`
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
  return db.query(`
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
    firstItem = false;
    if (key === 'city') {
      whereClause += `city LIKE '${options.city}%'`;
    } else if (key === 'maximum_price_per_night') {
      whereClause += `cost_per_night <= ${options.maximum_price_per_night}`;
    } else if (key === 'minimum_price_per_night') {
      whereClause += `cost_per_night >= ${options.minimum_price_per_night}`;
    } else if (key === 'owner_id') {
      whereClause += `owner_id = ${options.owner_id}`;
    }
  };
  // Next, we use pg-format to sanitize the two clauses before interpolating them into the query, in order to avoid SQL injection attacks
  const fullQuery = `
  SELECT properties.*, avg(reviews.rating) 
    FROM properties
    LEFT JOIN reviews ON reviews.property_id = properties.id ${format(whereClause)}
    GROUP BY properties.id ${format(havingClause)}
    LIMIT $1;
  `;
  console.log(fullQuery);
  // With the full query constructed, we can return results
  return db.query(fullQuery, [perPage])
    .then(res => {
      return res.rows
    })
    .catch(err => console.error('query error', err.stack));
};

exports.getAllProperties = getAllProperties;

// /**
//  * Add a property to the database
//  * @param {{}} property An object containing all of the property details.
//  * @return {Promise<{}>} A promise to the property.
//  */

const addProperty = (property) => {
  let query = 'INSERT INTO properties (';
  let valuesClause = '';
  // A C-style for loop is used to ensure that we can detect the last key-value pair, so we know not to insert a comma
  for (let i = Object.keys(property).length - 1; i >= 0; i--) {
    const key = Object.keys(property)[i];
    query += `${key}`;
    const value = property[key];
    valuesClause += (value) ? `'${value}'` : 'null';
    // The only falsy value is if i = 0, the last key-value pair in the loop. For all preceding pairs, insert an ending comma. For i = 0, insert no comma.
    if (i) {
      query += ', ';
      valuesClause += ', ';
    }
  };
  // Use pg-format to sanitize the values clause
  query += `) VALUES (${format(valuesClause)}) RETURNING *;`;
  return db.query(query)
    .then((res) => {
      console.log(res.rows[0]);
      return res.rows[0];
    })
    .catch(err => console.error('query error', err.stack));
};

exports.addProperty = addProperty;



// /// Reservations

// /**
//  * Get all reservations for a single user.
//  * @param {string} guest_id The id of the user.
//  * @return {Promise<[{}]>} A promise to the reservations.
//  */
const getAllReservations = (guest_id, limit = 10) => {
  return db.query(`
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

exports.getAllReservations = getAllReservations;
