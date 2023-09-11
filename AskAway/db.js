var pg = require("pg");
var mailer = require ("./mailer");
const {idleTimeoutMillis} = require("pg/lib/defaults");
var bcrypt = require('bcrypt');

var config ={
    user: 'tojxtfass', //env var: PGUSER
    database: 'tojxtfass', //env var: PGDATABASE
    password: 'b7VX13F-J1pv0QS-SXb1l3TMtz1NauCzs', //env var: PGPASSWORD
    host: 'mouse.db.elephantsql.com', // Server hosting the postgres database
    port: 5432, //env var: PGPORT
    max: 100, // max number of clients in the pool
    idleTimeoutMillis: 30000
}

var pool = new pg.Pool(config);

/*pool.query('Sql naredbe', [varijable], (err, results) => {
    if (err) {
        throw err;
    }
    next();
});*/

async function uploadPresentation (req, res, next){
    console.log("Scheduling a presentation");
    await pool.query('INSERT INTO presentation(title, code, presenter_id, start_date) VALUES($1, $2, $3, $4)',
                [req.body.title, req.body.code, req.user.id, req.body.start_date], (err, results) => {
        if (err) {
            console.log(err);
            req.flash('error', "Invalid code");
            res.redirect('/home');
        }
        else {
            mailer.sendConformationMail(req.user, req.body.title, req.body.start_date, req.body.code);
            res.redirect('/home');
        }
        })
}

function updateForbidden (req, res, next) {
    let id = req.user.id;
    let newForbidden = req.body.forbidden;
    pool.query(`UPDATE presenter SET forbidden_words = $1 WHERE id = $2`, [newForbidden, id], (err, results) => {
        if (err) {
            console.log(err);
        }
        console.log('updated forbidden words');
        console.log(id, newForbidden);
        next();
    });
}

function getUpcomingPresentations (req,res,next){
    pool.query("SELECT presenter_id, title, code, start_date FROM presentation WHERE start_date>current_timestamp AT TIME ZONE 'CET' AND presenter_id = $1 ORDER BY start_date", [req.user.id], (err, results) => {
        if(err){
            throw err;
        }
        console.log('pokupio predavanja');
        req.body.presentations = results.rows;
        next();
    })
}

function getPreviousPresentations (req,res,next){
    pool.query("SELECT presenter_id, title, code, start_date FROM presentation WHERE start_date<current_timestamp AT TIME ZONE 'CET' AND presenter_id = $1 ORDER BY start_date", [req.user.id], (err, results) => {
        if(err){
            throw err;
        }
        console.log('pokupio prosla predavanja');
        req.body.pastpresentations = results.rows;
        next();
    })
}

function getPresentation (req,res,next){
    let id = req.params.code;
    pool.query("SELECT  presentation.title as p_title, presentation_id, code, rating, presenter_id, start_date, p.first_name, p.last_name, p.title as presenter_title, p.forbidden_words as forb_words FROM presentation INNER JOIN presenter p ON presentation.presenter_id = p. id WHERE presentation.code = $1", [id], (err, results) => {
        if(err){
            throw err;
        }
        else if (results.rows.length < 1){
            res.redirect('/home');
        }
        else{
            console.log('Nasao predavanje', id);
            req.body.presentation = results.rows;
            next();
        }
    })
}

function addQuestion(questionContent, presentation_id, isForbidden){
    pool.query('INSERT INTO question(text, presentation_id, hidden) VALUES($1, $2, $3) ', [questionContent, presentation_id, isForbidden], (err, results) => {
        if (err) {
            console.log(err);
        }
        console.log("Question added!");
    });
}

function getQuestions (req,res,next){
    let id = req.body.presentation[0].presentation_id;
    pool.query("SELECT * FROM question WHERE presentation_id = $1 ORDER BY likes DESC", [id], (err, results) => {
        if(err){
            throw err;
        }
        console.log('pokupio pitanja', id);
        req.body.questions = results.rows;
        next();
    })
}

function likeQuestion(question_id){
    pool.query(`UPDATE question SET likes = likes+1 WHERE question_id = $1`, [question_id], (err, results) => {
        if (err) {
            console.log(err);
        }
        console.log("Like added to question!");
    });
}

function answerQuestion(question_id){
    pool.query(`UPDATE question SET answered = true WHERE question_id = $1`, [question_id], (err, results) => {
        if (err) {
            console.log(err);
        }
        console.log("Question answered!");
    });
}

function updateQuestions(presentation_id){
    let questions;
    pool.query("SELECT * FROM question WHERE presentation_id = $1 ORDER BY likes DESC", [presentation_id], (err, results) => {
        if(err){
            throw err;
        }
        console.log('pokupio updated pitanja', presentation_id);
        questions = results.rows;

    })
    return questions;
}

function getAllUsers (req,res,next){
    pool.query("SELECT * FROM presenter", [], (err, results) => {
        if(err){
            throw err;
        }
        console.log('pokupio sve usere');
        req.body.users = results.rows;
        next();
    })
}

async function addUser (req,res,next) {
    const password = await bcrypt.hash(req.body.password,10);
    const presenter = {
        first_name: req.body.fname,
        last_name: req.body.lname,
        username: req.body.username,
        password: password,
        email: req.body.email,
        profession: req.body.profession
    }
    pool.query(`INSERT INTO presenter (first_name, last_name, username, password, email, title) values ($1,$2,$3,$4,$5,$6)`,
        [presenter.first_name, presenter.last_name, presenter.username, presenter.password, presenter.email, presenter.profession], (err, results) => {
        if (err) {
            console.log(err);
        }
        console.log("admin added user");
        next();
    });
}

function deleteUser (req, res, next) {
    let id = req.params.id;
    pool.query('DELETE FROM presenter WHERE id = $1', [id], (err, results) => {
        if (err) {
            console.log(err);
        }
        console.log("admin deleted user successfully");
        next();
    });
}

function getUser (req, res, next) {
    let id = req.params.id;
    pool.query("SELECT * FROM presenter WHERE id = $1 ", [id], (err, results) => {
        if(err){
            throw err;
        }
        console.log(`pokupio usera id: ${id}`);
        req.body.useradmin = results.rows;
        next();
    })
}

function getUsersPresentations (req,res, next) {
    let id = req.params.id;
    pool.query("SELECT * FROM presentation WHERE presenter_id = $1 ", [id], (err, results) => {
        if(err){
            throw err;
        }
        console.log(`pokupio prezentacije od usera id: ${id}`);
        req.body.userpresentations = results.rows;
        next();
    })
}

function updateUser (req, res, next) {
    let id = req.params.id;
    const presenter = {
        first_name: req.body.fname,
        last_name: req.body.lname,
        username: req.body.username,
        email: req.body.email,
        profession: req.body.profession
    }
    pool.query(`UPDATE presenter SET first_name = $1, last_name = $2, username = $3, email = $4, title = $5 WHERE id = $6`,
        [presenter.first_name, presenter.last_name, presenter.username, presenter.email, presenter.profession, id], (err, results) => {
            if (err) {
                console.log(err);
            }
            console.log("admin updated user");
            next();
        });
}

function deletePresentation (req, res, next) {
    let id = req.params.id;
    pool.query('DELETE FROM presentation WHERE presentation_id = $1', [id], (err, results) => {
        if (err) {
            console.log(err);
        }
        console.log("admin deleted presentation successfully");
        next();
    });
}

function getPresentationAdmin (req,res,next){
    let id = req.params.id;
    pool.query("SELECT  * FROM presentation WHERE presentation_id = $1", [id], (err, results) => {
        if(err){
            throw err;
        }
        else{
            console.log('Nasao predavanje');
            req.body.presentation = results.rows;
            next();
        }
    })
}

function deleteQuestion (req, res, next) {
    let id = req.params.id;
    pool.query('DELETE FROM question WHERE question_id = $1', [id], (err, results) => {
        if (err) {
            console.log(err);
        }
        console.log("admin deleted question successfully");
        next();
    });
}

function getAllPresentations (req, res, next) {
    pool.query("SELECT * FROM presentation", [], (err, results) => {
        if(err){
            throw err;
        }
        console.log('pokupio sve prezentacije');
        req.body.presentations = results.rows;
        next();
    })
}

function updatePresentation (req, res, next) {
    pool.query(`UPDATE presentation SET title = $1, code = $2, start_date = $3 WHERE id = $6`,
        [req.body.title, req.body.code, req.body.start_date, req.params.id], (err, results) => {
            if (err) {
                console.log(err);
            }
            console.log("admin updated presentation");
            next();
        });
}

module.exports = {uploadPresentation, getUpcomingPresentations, getPreviousPresentations, getPresentation, addQuestion, getQuestions, likeQuestion,
                    updateQuestions, getAllUsers, addUser, deleteUser, getUser, getUsersPresentations, updateUser, deletePresentation,
                    getPresentationAdmin, deleteQuestion, getAllPresentations, updateForbidden, updatePresentation };
