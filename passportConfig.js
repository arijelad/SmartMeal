const LocalStrategy = require('passport-local').Strategy;
var pg = require('pg');
const bcrypt = require('bcrypt');

var config = {
    user: 'aenkrzvj', //env var: PGUSER
    database: 'aenkrzvj', //env var: PGDATABASE
    password: 'ckgx5HFILfN8rgW4zy9O7qXVTZWII4R6', //env var: PGPASSWORD
    host: 'hattie.db.elephantsql.com', // Server hosting the postgres database
    port: 5432, //env var: PGPORT
    max: 100, // max number of clients in the pool
    idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
};
var pool = new pg.Pool(config);

module.exports = (passport)=>{
    passport.use(new LocalStrategy({
            usernameField: "email",
            passwordField: "password"},
        (email, password, done)=>{
            pool.connect((err, client, don)=>{
                if(err){
                    throw (err);
                }else{
                    client.query("SELECT * FROM users WHERE email=$1 ",[email],(err, result)=>{
                        don();
                        if(err){
                            throw (err);
                        }
                        if(result.rows.length>0){
                            const user = result.rows[0];
                            bcrypt.compare(password, user.password, (err, isMatch)=>{
                                if(err){
                                    throw (err);
                                }
                                if(isMatch){
                                    return done(null, user);
                                }else{
                                    return done(null, false, {message: "Lozinka nije tačna!"});
                                }
                            } )
                        }else{
                            return done(null, false, {message: "Korisnik s ovom e-mail adresom nije registrovan"});
                        }
                    } )
                }
            })
        }));
    passport.serializeUser((user, done)=>{
        done(null, user.user_id);
    })
    passport.deserializeUser((id, done)=>{
        pool.connect((err, client, don)=>{
            if(err){
                throw (err);
            }else {
                client.query("SELECT * FROM users WHERE user_id = $1", [id], (err, result)=>{
                    don();
                    if(err){
                        throw (err);
                    }else{
                        return done(null, result.rows[0]);

                    }
                })
            }
        })
    })
}




/*

function initialize(passport){
    const autheticateUser = (email,password, done) => {
        pool.query(
            `SELECT * FROM users where email=$1`, [email],(err,results)=>{
                if(err) {
                    throw err;
                }
                console.log(results.rows);

                if(results.rows.length>0){
                    const user = results.rows[0];

                    bcrypt.compare(password,user.password, (err, isMatch) =>{
                        if(err){
                            throw err;
                        }
                        if(isMatch){
                            return done(null, user);
                        }else{
                            return done(null, false, {message: "Unijeli ste pogresnu lozinku"})
                        }
                    });
                }else {
                    return done(null, false, {message: "Email nije registrovan"})
                }



        }
        );
    };

    passport.use(new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        autheticateUser
    )
    );
    passport.serializeUser((user,done) => done(null,user.id));

    passport.deserializeUser((id,done)=>{
        pool.query(
            `SELECT * FROM users where user_id=$1`,[id], (err, results) => {
                if (err) {
                    throw err;
                }
                return done(null, results.rows[0]);
            }
        );
    });
}
module.exports = initialize;*/
