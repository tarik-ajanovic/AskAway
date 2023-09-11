var express = require('express');
var router = express.Router();
var db = require ('../db');
var {initialize, checkNotAuthenticated, checkAuthenticated} = require('../passport');
const passport = require("passport");
initialize(passport);

/* GET home page. */
router.get('/',checkAuthenticated, checkAdmin, function(req, res, next) {
  res.redirect('/admin/users')
});

router.get('/users',checkAuthenticated, checkAdmin, db.getAllUsers, function(req, res, next) {
  res.render('admin_users', { title: 'Admin Dashboard | AskAway', users: req.body.users });
});

router.get('/presentations', checkAuthenticated, checkAdmin, db.getAllPresentations, function (req, res, next) {
  res.render('admin_presentations', { title: 'Admin Dashboard | AskAway', presentations: req.body.presentations })
})

router.post('/users', db.addUser, function(req,res,next){
  res.redirect('/admin/users');
})

router.get('/delete/:id', checkAuthenticated, checkAdmin, db.deleteUser, function (req, res, next) {
  res.redirect('/admin/users');
})

router.get('/user/:id', checkAuthenticated, checkAdmin, db.getUser,db.getUsersPresentations, function (req, res, next) {
  res.render('user', { title: 'Admin | AskAway', useradmin: req.body.useradmin, userspresentations: req.body.userpresentations });
})

router.post('/user/:id', checkAuthenticated, checkAdmin, db.updateUser, function (req, res, next) {
  let id = req.params.id;
  res.redirect(`admin/user/${id}`);
})



router.get('/presentation/delete/:id', checkAuthenticated, checkAdmin, db.deletePresentation, function (req, res, next) {
  res.redirect('/admin/presentations');
})

router.get('/presentation/:id', checkAuthenticated, checkAdmin, db.getPresentationAdmin, db.getQuestions, function (req, res, next) {
  res.render('admin_presentation', { title: 'Admin | AskAway', presentation: req.body.presentation[0], questions: req.body.questions });
})

router.post('/presentation/:id', checkAuthenticated, checkAdmin, db.getPresentationAdmin, db.updatePresentation, function (req,res,next) {
  res.redirect('back');
})



router.get('/question/delete/:id', checkAuthenticated, checkAdmin, db.deleteQuestion, function (req, res, next) {
  res.redirect('back');
})



function checkAdmin (req,res,next){
  if (!req.user.admin){ //ako user nije admin redirect na '/'
    return res.redirect('/');
  }
  next();
}

module.exports = router;
