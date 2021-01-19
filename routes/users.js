var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
var pg = require('pg');
const passport = require('passport');
const flash = require('connect-flash')

const initializePassport = require('../passportConfig');
initializePassport(passport);

router.use(passport.initialize());
router.use(passport.session());

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
const {administrator, administratorRestaurant,deliverer, customer} = require('../authorization');

let fun = {
  registerUser: async function (req, res, next) {
    var administrator = {
      "name": req.body.name,
      "last_name": req.body.last_name,
      "email": req.body.email,
      "password": req.body.password,
      "password2": req.body.password2,
      "type" : req.body.type,
      "lat" : req.body.lat,
      "lng" : req.body.lng
    };
    console.info(administrator);

    let errors = []; // dodadjemo erore ukoliko se dese

    //validacija forme3e
    if (!administrator.name || !administrator.email || !administrator.password || !administrator.password2 || !administrator.last_name) {
      errors.push({message: "Molimo Vas popunite sva polja"});
    }
    if (administrator.password.length < 5) {
      errors.push({message: "Lozinka treba da bude duza od 5 karaktera "});
    }
    if (administrator.password !== administrator.password2) {
      errors.push({message: "Lozinke se ne podudaraju"})
    }
    if (errors.length > 0) {
        if(administrator.type === '2'){
          res.render('./registerViews/register',{errors});
        }else if(administrator.type === '3'){
          res.render('./registerViews/registerDeliverer',{errors});
        }else{
          res.render('./registerViews/registerCustomer',{errors});
        }
    } else {
        let cryptPassword = await bcrypt.hash(administrator.password, 10);
        //console.log(cryptPassword);

        pool.connect((err, client, done) => {
          if (err) throw err;
          client.query(`SELECT * FROM users where email=$1 and id_type=$2`, [administrator.email, administrator.type], (err, result) => {
            done();
            if (err) {
              console.info(err.stack);
              res.sendStatus(500);
            } else {
              console.info(result.rows);
              //res.render('main', {title: 'Express'});

              if (result.rows.length > 0) {
                errors.push({message: "Postoji racun sa navedenim emailom"});
                if(administrator.type === '2'){
                  res.render('./registerViews/register',{errors});
                }else if(administrator.type === '3'){
                  res.render('./registerViews/registerDeliverer',{errors});
                }else{
                  res.render('./registerViews/registerCustomer',{errors});
                }
              } else {
                pool.query
                (`INSERT INTO users (name,last_name,password,email,id_type)
               VALUES ($1, $2, $3,$4,$5)`, [administrator.name, administrator.last_name, cryptPassword, administrator.email, administrator.type], (err, result) => {
                  if (err) {
                    throw err;
                  }
                  console.log(result.rows);
                  console.info("success");
                  req.flash('success_msg', "Registrirani ste. Prijavite se");
                  if(administrator.type === '2'){
                    res.render('./registerViews/loginn');
                  }else if(administrator.type === '3'){
                    res.render('./registerViews/logindeliverer');
                  }else{
                    res.render('./registerViews/logincustomer');
                  }
                  next();

                })
              }

            }
          });
        })
    }
  },
  registerCustomer: async function (req, res, next) {
    var administrator = {
      "name": req.body.name,
      "last_name": req.body.last_name,
      "email": req.body.email,
      "password": req.body.password,
      "password2": req.body.password2,
      "type" : req.body.type,
      "lat" : req.body.lat,
      "lng" : req.body.lng
    };
    console.info(administrator);

    let errors = []; // dodadjemo erore ukoliko se dese

    //validacija forme3e
    if (!administrator.name || !administrator.email || !administrator.password || !administrator.password2 || !administrator.last_name) {
      errors.push({message: "Molimo Vas popunite sva polja"});
    }
    if (administrator.password.length < 5) {
      errors.push({message: "Lozinka treba da bude duza od 5 karaktera "});
    }
    if (administrator.password !== administrator.password2) {
      errors.push({message: "Lozinke se ne podudaraju"})
    }
    if (errors.length > 0) {
      if(administrator.type === '2'){
        res.render('./registerViews/register',{errors});
      }else if(administrator.type === '3'){
        res.render('./registerViews/registerDeliverer',{errors});
      }else{
        res.render('./registerViews/registerCustomer',{errors});
      }
    } else {
      let cryptPassword = await bcrypt.hash(administrator.password, 10);
      //console.log(cryptPassword);

      pool.connect((err, client, done) => {
        if (err) throw err;
        client.query(`SELECT * FROM users where email=$1 and id_type=$2`, [administrator.email, administrator.type], (err, result) => {
          done();
          if (err) {
            console.info(err.stack);
            res.sendStatus(500);
          } else {
            console.info(result.rows);

            if (result.rows.length > 0) {
              errors.push({message: "Postoji racun sa navedenim emailom"});
              res.render('./registerViews/registerCustomer',{errors});
            } else {
              pool.query
              (`INSERT INTO users (name,last_name,password,email,id_type,latitude,longitude)
               VALUES ($1, $2, $3,$4,$5,$6,$7)`, [administrator.name, administrator.last_name, cryptPassword, administrator.email, administrator.type,administrator.lat,administrator.lng], (err, result) => {
                if (err) {
                  throw err;
                }
                console.log(result.rows);
                console.info("success");
                req.flash('success_msg', "Registrirani ste. Prijavite se");
                res.render('./registerViews/logincustomer');
                next();
              })
            }

          }
        });
      })
    }
  }

}



/* GET users listing. */
router.get('/login', function(req, res, next) {
  res.render('./registerViews/loginn');
});
router.get('/login/adminrestaurant',function(req, res, next) {
  res.render('./registerViews/loginrestaurant');
});
router.get('/login/deliverer', function(req, res, next) {
  res.render('./registerViews/logindeliverer');
});
router.get('/login/customer', function(req, res, next) {
  res.render('./registerViews/logincustomer');
});



router.get('/register', function(req, res, next) {
  res.render('./registerViews/register')
});
router.get('/deliverer', function(req, res, next) {
  res.render('./registerViews/registerDeliverer')
});
router.get('/customer', function(req, res, next) {
  res.render('./registerViews/registerCustomer')
});

router.post('/register',
    fun.registerCustomer,
    function(req, res, next) {
      res.sendStatus(200);
});

router.post('/deliverer',
    fun.registerUser,
    function(req, res, next) {
      res.sendStatus(200);
    });
router.post('/customer',
    fun.registerCustomer,
    function(req, res, next) {
      res.sendStatus(200);
    });

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});
router.post('/login/adminrestaurant', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/administratorrestaurant',
    failureRedirect: '/users/login/adminrestaurant',
    failureFlash: true
  })(req, res, next);
});
router.post('/login/deliverer', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/users/login/deliverer',
    session:false
  })(req, res, next);
});
router.post('/login/customer', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/customer',
    failureRedirect: '/users/login/customer',
    failureFlash: true
  })(req, res, next);
});

router.get('users/logout', (req, res) => {
  req.logOut();
  req.flash('success_msg', "Uspjesno ste se odjavili");
  res.redirect('/login');
})

module.exports = router;
