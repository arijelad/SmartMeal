var express = require('express');
var router = express.Router();
var pg = require('pg');
var bcrypt = require('bcrypt');
var fileUpoload = require('express-fileupload');
var simpleslider = require('simple-slider');
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


let functions = {
  registerAdministratorRestaurant: async function (req, res, next) {
    var administrator = {
      "name": req.body.name,
      "last_name": req.body.last_name,
      "email": req.body.email,
      "password": req.body.password,
      "password2": req.body.password2,
      "type": req.body.type
    };
    console.info(administrator);

    let errors = []; // dodadjemo erore ukoliko se dese

    //validacija forme
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
      res.redirect('/admin');
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
              res.redirect('/admin');
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
                res.redirect('/admin');
                next();
              })
            }

          }
        });
      })
    }
  },
  getFoodTypes: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query('SELECT * FROM lkpfoodtypes', [], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.foodtypes = result.rows;
          next();
        }
      });
    });
  },
  deleteFoodType: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`DELETE FROM lkpfoodtypes WHERE food_id = $1`, [req.params.id], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('It is deleted');
          next();
        }
      });
    });
  },
  updateFoodType: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`UPDATE lkpfoodtypes set food_name = $1 WHERE food_name = $2`, [req.body.anothervalue, req.body.cid], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('It is updated');
          next();
        }
      });
    });
  },
  insertFoodType: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`INSERT INTO lkpfoodtypes (food_name) 
        VALUES ($1)`, [req.body.newvalue], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('It is inserted');
          next();
        }
      });
    });
  },
  getFoodCategory: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query('SELECT * FROM lkpfoodcategories', [], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.foodcategory = result.rows;
          next();
        }
      });
    });
  },
  deleteFoodCategory: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`DELETE FROM lkpfoodcategories WHERE category_id = $1`, [req.params.id], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('It is deleted');
          next();
        }
      });
    });
  },
  updateFoodCategory: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`UPDATE lkpfoodcategories set category_name = $1 WHERE category_name = $2`, [req.body.anothervalue, req.body.cid], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('It is updated');
          next();
        }
      });
    });
  },
  insertFoodCategory: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`INSERT INTO lkpfoodcategories (category_name) 
        VALUES ($1)`, [req.body.newvalue], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('It is inserted');
          next();
        }
      });
    });
  },
  getRestaurantTypes: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query('SELECT * FROM lkprestaurants', [], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.restauranttype = result.rows;
          next();
        }
      });
    });
  },
  deleteRestaurantType: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`DELETE FROM lkprestaurants WHERE restaurant_type_id = $1`, [req.params.id], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('It is deleted');
          next();
        }
      });
    });
  },
  updateRestaurantType: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`UPDATE lkprestaurants set name = $1 WHERE name = $2`, [req.body.anothervalue, req.body.cid], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('It is updated');
          next();
        }
      });
    });
  },
  insertRestaurantType: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`INSERT INTO lkprestaurants (name) 
        VALUES ($1)`, [req.body.newvalue], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('It is inserted');
          next();
        }
      });
    });
  },
  insertRestaurant: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`INSERT INTO restaurants (restaurant_name, id_restaurant_type,id_food_type,id_review,id_city) 
        VALUES ($1, $2, $3, $4,$5)`, [req.body.restaurantname, req.body.rid, req.body.fid, req.body.sid, req.body.cid], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('It is inserted');
          next();
        }
      });
    });
  },
  getStars: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query('SELECT * FROM lkpreviews', [], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.stars = result.rows;
          console.info(req.stars);
          next();
        }
      });
    });
  },
  getCities: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query('SELECT * FROM lkpcity', [], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.cities = result.rows;
          next();
        }
      });
    });
  },
  getRestaurants: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query('SELECT * FROM restaurants', [], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.restaurants = result.rows;
          next();
        }
      });
    });
  },
  deleteRestaurant: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`UPDATE restaurants SET status = false WHERE restaurant_id = $1;`, [req.params.id], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('Restaurant is deleted');
          next();
        }
      });
    });
  },
  addRestaurant: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`UPDATE restaurants SET status = true WHERE status = $1;`, [req.body.stats], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('Restaurant is updated');
          next();
        }
      });
    });
  },
  registerAdminRest: async function (req, res, next) {
    var administrator = {
      "name": req.body.name,
      "last_name": req.body.last_name,
      "email": req.body.email,
      "password": req.body.password,
      "password2": req.body.password2,
      "type": req.body.type,
      "restaurant": req.body.restaurantId
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
      res.render('./registerViews/registerRestaurant', {errors});

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
              res.render('./registerViews/registerRestaurant', {errors});
            } else {
              client.query
              (`INSERT INTO users (name,last_name,password,email,id_type, id_restaurant)
               VALUES ($1, $2, $3,$4,$5,$6)`, [administrator.name, administrator.last_name, cryptPassword, administrator.email, administrator.type, administrator.restaurant], (err, result) => {
                if (err) {
                  throw err;
                }
                console.log(result.rows);
                console.info("success");
                req.flash('success_msg', "Registrirani ste. Prijavite se");
                next();
              })
            }

          }
        });
      })
    }
  },
  getArticles: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query('SELECT * FROM articles', [], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.articles = result.rows;
          console.info(req.articles);
          next();
        }
      });
    });
  },
  insertArticle: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`INSERT INTO articles (name,price, picture,id_article_type) 
        VALUES ($1, $2, $3,$4)`, [req.body.article, req.body.price, req.body.uploaded_image, req.body.typeId], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('Article is inserted');
          next();
        }
      });
    });
  },
  updatePriceArticle: function (req, res, next) {
    var percentage = req.body.percentage;
    var price = req.body.priceBefore;
    var minus = (price * percentage) / 100;
    var newPrice = price - minus;

    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`INSERT INTO sale(percentage, new_price, article_name, time_from, time_until) VALUES ($1,$2, $3,$4,$5)`, [percentage, newPrice, req.body.whichArticle,req.body.date_from, req.body.date_until], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('Article is updated');
          next();
        }
      });
    });
  },
  getArticleTypes: function(req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query('SELECT * FROM article_type', [], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.articleT = result.rows;
          next();
        }
      });
    });
  },
  getArticleFood: function(req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query('SELECT * FROM articles where id_article_type=1', [], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.articleFood = result.rows;
          next();
        }
      });
    });
  },
  getArticleDrink: function(req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query('SELECT * FROM articles where id_article_type=2', [], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.articleDrink = result.rows;
          next();
        }
      });
    });
  },
  getArticleSide: function(req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query('SELECT * FROM articles where id_article_type=3', [], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.articleSide = result.rows;
          next();
        }
      });
    });
  },
  insertFoodToGroupMeni: function (req, res, next) {


    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`INSERT into group_meni (id_food, id_drink,id_side) VALUES ($1,$2,$3);`, [req.body.foodF,req.body.drinkD,req.body.sideS], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('Group meni is inserted');
          next();
        }
      });
    });
  },
  insertRangeDeliverer: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`update restaurants set delivery_distance  =$1 where restaurant_id = $2`, [req.body.distance, 4], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('Distance is inserted');
          next();
        }
      });
    });
  },
};



/* */


//administrator-GET
router.get('/', function(req, res, next) {
  res.render('main', {title: 'Express'});
});

router.get('/admin',administrator, function(req, res, next) {
  res.render('administrator.ejs', {user:"Arijela"});
});
router.get('/adminrest', functions.getRestaurants, function(req, res, next) {
  res.render('./registerViews/registerRestaurant', {rest: req.restaurants });
});
router.get('/adminaddrest',functions.getRestaurantTypes,functions.getFoodTypes,functions.getStars,functions.getCities,
    function(req,res,next){
  res.render('administratoradd.ejs', {foodtypes :req.foodtypes, foodcategories: req.foodcategory, restauranttypes: req.restauranttype, stars: req.stars, cities: req.cities });
});
router.post('/adminaddrest',functions.insertRestaurant,
    function(req,res,next){
    });
router.get('/managefood', functions.getFoodTypes,functions.getFoodCategory,functions.getRestaurantTypes,
    function(req, res, next) {
      res.render('managelookup.ejs', {foodtypes: req.foodtypes, foodcategory: req.foodcategory, restauranttype:req.restauranttype});
    });

//administratorRestaurant-GET
router.get('/administratorrestaurant',administratorRestaurant,
    function(req, res, next) {
      res.render('administratorrest.ejs');
    });
router.get('/administrationarticles', functions.getArticles,functions.getArticleTypes,
    function(req,res,next){
    res.render('addArticles.ejs', {articles: req.articles, types:req.articleT});

    });
router.get('/addSale', functions.getArticles,
    function(req,res,next){
      res.render('addSale.ejs', {articles:req.articles});

    });
router.get('/addGroup', functions.getArticleFood,functions.getArticleDrink, functions.getArticleSide,
    function(req,res,next){
      res.render('addGroup.ejs', {food: req.articleFood, drink: req.articleDrink,side: req.articleSide});

    });

router.get('/addDistance', function (req,res,next){
  res.render('addDistance.ejs');
})

router.get('/addeliverer',
    function(req, res, next) {
      res.render('./registerViews/registerDeliverer');
    });


router.get('/managerrest', functions.getRestaurants,function(req,res,next){
  res.render('managerrest.ejs', {restaurants: req.restaurants})
});

router.get('/customer',customer, function(req, res, next) {
  res.render('customer.ejs', {user:"Arijela"});
});


router.post('/managerrest', functions.addRestaurant,
    function(req,res,next){

});
router.post('/adminrest', functions.registerAdminRest, functions.getRestaurants,
    function (req,res,next){
      res.render('./registerViews/registerRestaurant', {rest: req.restaurants });

});

router.delete('/managerrest/:id',
    functions.deleteRestaurant,
    //functions.insertFoodType,
    function(req, res, next) {

    });


//administrator-POST
router.post('/admin',
    functions.registerAdministratorRestaurant,
    function(req, res, next) {
      res.sendStatus(200);
    });


router.post('/managefood',
    functions.updateFoodType,functions.updateFoodCategory,functions.updateRestaurantType,
    //functions.insertFoodType,
    function(req, res, next) {

    });


router.delete('/managefood/:id',
    functions.deleteFoodType,functions.deleteFoodCategory,functions.deleteRestaurantType,
    //functions.insertFoodType,
    function(req, res, next) {

    });



router.post('/managefood/ins',
    functions.insertFoodType, functions.insertFoodCategory,functions.insertRestaurantType,
    function(req, res, next) {

    });

//ADMINISTRATOR RESTAURANT-POST
router.post('/administrationarticles', functions.insertArticle, functions.getArticles,functions.getArticleTypes,
    function(req,res,next){
    res.render('addArticles.ejs', {articles: req.articles, types:req.articleT});

    });
router.post('/addSale',functions.updatePriceArticle, functions.getArticles,
    function(req,res,next){
      res.render('addSale.ejs', {articles:req.articles});

    });
router.post('/addDistance',functions.insertRangeDeliverer,
    function(req,res,next){
      res.render('addDistance.ejs', );

    });
router.post('/addGroup',functions.insertFoodToGroupMeni,functions.getArticleFood,functions.getArticleDrink,functions.getArticleSide,
    function(req,res,next){
      res.render('addGroup.ejs',{food: req.articleFood,drink: req.articleDrink,side: req.articleSide } );

    });




module.exports = router;
