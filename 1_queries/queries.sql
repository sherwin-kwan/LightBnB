SELECT * from users
  WHERE email = 'tristanjacobs@gmail.com';

SELECT avg(end_date - start_date) FROM reservations;

SELECT properties.id, properties.title, properties.cost_per_night, avg(reviews.rating)
  FROM properties
  JOIN reviews ON reviews.property_id = properties.id
  WHERE city = 'Vancouver'
  GROUP BY properties.id
  HAVING avg(reviews.rating) >= 4
  ORDER BY cost_per_night
  LIMIT 10;

SELECT properties.city AS city, count(reservations.id) AS total_reservations
  FROM properties JOIN reservations ON reservations.property_id = properties.id
  GROUP BY city
  ORDER BY total_reservations DESC;

SELECT reservations.*, properties.*, avg(reviews.rating)
  FROM properties
  JOIN reviews ON properties.id = reviews.property_id
  JOIN reservations ON properties.id = reservations.property_id
  WHERE properties.owner_id = 1
  AND reservations.end_date < now()::date
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT 10;
  