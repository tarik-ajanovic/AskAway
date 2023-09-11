var express = require('express');
var router = express.Router();
var flash = require('express-flash');
var db = require ('../db');

var {initialize, checkAuthenticated} = require('../passport');
const passport = require("passport");
initialize(passport);

/* GET home page. */
router.get('/', checkAuthenticated, db.getUpcomingPresentations, db.getPreviousPresentations, function(req, res, next) {
  res.render('home', { title: 'Dashboard | AskAway', user: req.user, presentations: req.body.presentations,
    pastpresentations: req.body.pastpresentations, message: req.flash('error')});
});

router.post('/forbidden', checkAuthenticated, db.updateForbidden, function (req, res, next) {
  res.redirect('/home');
})

module.exports = router;
