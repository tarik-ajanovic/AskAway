var express = require('express');
var router = express.Router();
var pg = require('pg');
var bcrypt = require('bcrypt');
var passport = require('passport');

var {initialize, checkAuthenticated, checkNotAuthenticated} = require('../passport');
initialize(passport);

router.get('/', checkNotAuthenticated, function (req, res, next) {
    res.redirect('/');
})

router.post('/', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
}))

module.exports = router;
