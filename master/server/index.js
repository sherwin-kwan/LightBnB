const database = require('./dataQueries');
const apiRoutes = require('./apiRoutes');
const userRoutes = require('./userRoutes');
const db = require('./db');

const path = require('path');

const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');

const app = express();

app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// /api/endpoints
const apiRouter = express.Router();
apiRoutes(apiRouter, database);
app.use('/api', apiRouter);

// /user/endpoints
const userRouter = express.Router();
userRoutes(userRouter, database);
app.use('/users', userRouter);

// New test code

const addDataToTesting = (data) => {
  return db.query(`
  INSERT INTO testing (text, num)
  VALUES ($1, $2)
  RETURNING *;
  `, [data.text, data.num])
  .then((res) => res.rows[0])
  .catch((e) => console.log(e));
};

app.post('/testing', (req, res) => {
  // Rest operator??
  console.log({...req.body});
  addDataToTesting({...req.body})
    .then(output => {
      console.log(`Successfully added ${output}`);
      res.send(output);
    })
    .catch(e => {
      console.error(e);
      res.send(e);
    });
});


app.use(express.static(path.join(__dirname, '../public')));

app.get("/test", (req, res) => {
  res.send("🤗");
});

const port = process.env.PORT || 3000; 
app.listen(port, (err) => console.log(err || `listening on port ${port} 😎`));