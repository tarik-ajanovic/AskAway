var express = require('express');
var pg = require("pg");
var router = express.Router();
var {initialize, checkNotAuthenticated, checkAuthenticated} = require('../passport');
var db = require ('../db');
const passport = require("passport");
var io = null;
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

var mailer = require ("../mailer");



router.post('/upload', checkAuthenticated, db.uploadPresentation);

router.get('/share/:code', checkAuthenticated, db.getPresentation, function (req,res, next){
    res.render('share', {title: req.body.presentation[0].title, presentation: req.body.presentation[0]})
})

router.post('/share/:code', checkAuthenticated, db.getPresentation, function (req,res, next){
    mailer.sendInvitationMail(req.body.mailingList, req.body.presentation[0].title, req.body.presentation[0].start_date, req.body.presentation[0].code);
    res.redirect('back');
})

router.get('/:code', db.getPresentation, db.getQuestions, function (req,res,next) {
    let code = req.params.code;
    let begin_date = new Date(req.body.presentation[0].start_date);
    let current_date = new Date();
    let end_date = new Date(req.body.presentation[0].start_date);
    end_date.setHours(end_date.getHours() + 24);

    //if (begin_date < current_date || req.isAuthenticated()) {
        if (!io) {
            io = require('socket.io')(req.connection.server);

            //Definisemo funkciju za nakon sto se uspostavi konekcija
            io.sockets.on('connection', function (client) {
                client.join(req.params.code);
                console.log("connected successfully to ", req.params.code);
                //inicjalno ucitavanje pitanja
                io.to(code).emit('server_question', req.body.questions);
                console.log("poslao pitanja");

                client.on('disconnect', function () {
                    client.leave(req.params.code);
                    console.log('client disconnected from', req.params.code);
                });

                client.on('question_like', async function (d) {
                    db.likeQuestion(d);
                    //TREBA NAPUNITI REQ.BODY.QUESTIONS SA PITANJIMA OPET, SADA AZURIRANIM LAJKOVIMA
                    await pool.query("SELECT * FROM question WHERE presentation_id = $1 ORDER BY likes DESC", [req.body.presentation[0].presentation_id], (err, results) => {
                        if (err) {
                            throw err;
                        }
                        console.log('pokupio updated pitanja');
                        console.log('saljem updated pitanja');
                        io.to(code).emit('server_question', results.rows);
                    })
                })

                //sta radimo kada na server dodje poruka od korisnika (tj. kada korisnik posalje pitanje
                //potrebno verifikovat pa onda dodat u bazu te emitovat drugim klijentima
                client.on('client_question', async function (d) {
                    let isForbidden = containsForbidden(d, req.body.presentation[0].forb_words);
                    isForbidden = !isForbidden;
                    console.log("usao u uslov za bazu i emit");
                    db.addQuestion(d, req.body.presentation[0].presentation_id, isForbidden);

                    //ovim saljemo poruku svim ostalim konektovanim na socket (broadcast-amo) nakon provjere;
                    await pool.query("SELECT * FROM question WHERE presentation_id = $1 ORDER BY likes DESC", [req.body.presentation[0].presentation_id], (err, results) => {
                        if (err) {
                            throw err;
                        }
                        console.log('pokupio updated pitanja');
                        console.log('saljem updated pitanja');
                        io.to(code).emit('server_question', results.rows);
                    })
                })
            });
        }
        res.render('presentation', {
            title: req.body.presentation[0].title, presentation: req.body.presentation[0],
            questions: req.body.questions, not_yet: false
        })
    //}


    /*else {
        res.render('presentation', {title: req.body.presentation[0].title, presentation: req.body.presentation[0],
            questions: req.body.questions,
            not_yet: true
        })
    }*/
});


function containsForbidden(text, forbiddenWords){
    if (forbiddenWords === ",") return false;
    else{
        forbiddenWords = forbiddenWords.replace(/ /g, '');
        const forbiddenWordsArray = forbiddenWords.split(",");

        for (let i = 0; i < forbiddenWordsArray.length; i++){
            if (text.includes(forbiddenWordsArray[i])){
                return true;
            }
        }
        return false;
    }
}

module.exports = router;
