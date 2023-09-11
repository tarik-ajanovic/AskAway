var express = require('express');
var router = express.Router();

var {initialize, checkNotAuthenticated} = require('../passport');
const passport = require("passport");
initialize(passport);

/* GET home page. */
router.get('/', checkNotAuthenticated, function(req, res, next) {
  res.render('index', { title: 'AskAway' });
});

module.exports = router;
