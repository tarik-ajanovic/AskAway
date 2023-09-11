var pg = require("pg");
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

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

function initialize(passport) {
    const authenticateUser = (username, password, done) => {
            pool.query(`SELECT * FROM presenter WHERE username = $1`, [username], async function (err, result) {
                    if (err) {
                        throw err;
                    }
                    if(result.rows.length > 0) {
                        const user = result.rows[0];
                        var user_id = user.id;
                        if (await bcrypt.compare(password, user.password)) {
                            console.log("dobar pass");
                            return done(null, user);
                        } else {
                            console.log("ne valja pass");
                            return done(null, false, {message: "Incorrect password"});
                        }
                    }
                    else {return done(null, false, {message: "Invalid username"});}
                });

    }
    passport.use(new LocalStrategy({usernameField: 'username'}, authenticateUser));
    passport.serializeUser((user, done) => {done(null, user.id)});
    passport.deserializeUser((id, done) => {
            pool.query(`SELECT * FROM presenter WHERE id = $1`, [id], (err, result) => {
                if(err) {
                    throw err;
                }
                return done(null, result.rows[0]);
            })
    });
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/home')
    }
    next();
}

module.exports = {initialize, checkAuthenticated, checkNotAuthenticated};