const pg = require('pg');
const passwordFile = require('./passwordFile');

const pool = new pg.Pool({
  user: 'vagrant',
  password: passwordFile,
  host: 'localhost',
  database: 'lightbnb'
});

const query = (q, params) => {
  return pool.query(q, params);
};

module.exports = { query };