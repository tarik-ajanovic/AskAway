var express = require('express');
var router = express.Router();
var pg = require('pg');
var bcrypt = require('bcrypt');

var {initialize, checkNotAuthenticated} = require('../passport');
const passport = require("passport");
initialize(passport);

var config ={
  user: 'tojxtfas', //env var: PGUSER
  database: 'tojxtfas', //env var: PGDATABASE
  password: 'b7VX13F-J1pv0QS-SXb1l3TMtz1NauCz', //env var: PGPASSWORD
  host: 'mouse.db.elephantsql.com', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 100, // max number of clients in the pool
  idleTimeoutMillis: 30000
}

var pool = new pg.Pool(config);

const addPresenter = async (req,res,next) =>{
  const password = await bcrypt.hash(req.body.password,10);
  const presenter = {
    first_name: req.body.fname,
    last_name: req.body.lname,
    username: req.body.username,
    password: password,
    email: req.body.email,
    profession: req.body.profession
  }

  pool.connect(function (err, client, done) {
    if (err) {
      return res.send(err);
    }

    client.query(`INSERT INTO presenter (first_name, last_name, username, password, email, title) values ($1,$2,$3,$4,$5,$6)`,
        [presenter.first_name, presenter.last_name, presenter.username, presenter.password, presenter.email, presenter.profession], function (err, result) {
      done();

      if (err) {
        return res.render('signup', { title: 'Sign up | AskAway', error: true});
      }
      else {
        return res.redirect('/');
      }
    });
  })
}

router.get('/', checkNotAuthenticated,function(req, res, next) {
  res.render('signup', { title: 'Sign up | AskAway'});
});

router.post('/', addPresenter);

module.exports = router;
