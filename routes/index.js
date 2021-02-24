var express = require('express');
var router = express.Router();
var pg = require('pg');
var bcrypt = require('bcrypt');
var fileUpoload = require('express-fileupload');
var simpleslider = require('simple-slider');
var nodemailer = require('nodemailer');
const setTitle = require('node-bash-title');
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
  registerDeliverer: async function (req, res, next) {
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
      res.redirect('/addeliverer');
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
              res.redirect('/addeliverer');
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
                res.redirect('/addeliverer');
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
      client.query(`UPDATE lkpfoodtypes set food_name = $1 WHERE food_id = $2`, [req.body.anothervalue, req.body.idD], (err, result) => {
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
      client.query(`UPDATE lkpfoodcategories set category_name = $1 WHERE category_id = $2`, [req.body.anothervalue, req.body.idD], (err, result) => {
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
      client.query(`UPDATE lkprestaurants set name = $1 WHERE restaurant_type_id = $2`, [req.body.anothervalue, req.body.idD], (err, result) => {
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

          //re = result.rows[0];
          //console.info(req.user.latitude, req.user.longitude,re.latitude, re.longitude)

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
      client.query('SELECT * FROM articles where restaurant = $1', [req.user.id_restaurant], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.articles = result.rows;

          console.info(req.user);
          next();
        }
      });
    });
  },
  getAllArticles: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query('SELECT * FROM articles ', [], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.articles = result.rows;
          next();
        }
      });
    });
  },
  insertArticle: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`INSERT INTO articles (name,price, picture,id_article_type,id_user,restaurant) 
        VALUES ($1, $2, $3,$4, $5,$6);`,
      [req.body.article, req.body.price, req.body.uploaded_image, req.body.typeId,req.user.user_id,req.user.id_restaurant], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('Article is inserted');
          console.info(req.user);
          next();
        }
      });
    });
  },
  updateArticle: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`update articles set restaurant = (select restaurant_name from restaurants where restaurant_id
      = $1) where id_user=$2`, [req.user.id_restaurant, req.user.user_id], (err, result) => {
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
      client.query('SELECT * FROM articles where type=1 and restaurant= $1', [req.user.id_restaurant], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.articleFood = result.rows;
          console.info(req.user);

          next();
        }
      });
    });
  },
  getArticleDrink: function(req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query('SELECT * FROM articles where type=2 and restaurant = $1' , [req.user.id_restaurant], (err, result) => {
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
      client.query('SELECT * FROM articles where type=3 and restaurant = $1', [req.user.id_restaurant], (err, result) => {
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
      client.query(`INSERT into group_meni (id_food, id_drink,id_side,id_restaurant,price) VALUES ($1,$2,$3,$4,$5);`, [req.body.foodF,req.body.drinkD,req.body.sideS, req.user.id_restaurant,req.body.priceGroup], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('Group meni is inserted');
          console.info(req.user);
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
  getArticlesForRestaurantFood: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`select a.name, a.price,a.picture, a.price_sale from articles a where restaurant =
      (select restaurant_id from restaurants where restaurant_name = $1);` , [req.params.restName], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.restaurantArticles = result.rows;
          console.info(req.params.restName);
          next();

          //re = result.rows[0];
          //console.info(req.user.latitude, req.user.longitude,re.latitude, re.longitude)

        }
      });
    });
  },
  getOfferForBrajlovic: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query('select offer_name from offers\n' +
          'inner join offer_restaurant o on offers.offer_id = o.id_offer\n' +
          'inner join restaurants r on o.id_restaurant = r.restaurant_id\n' +
          'where r.restaurant_name = $1', [req.params.restName], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.offerBraj = result.rows;
          next();

        }
      });
    });
  },
  getSearchArticles: function (req, res, next) {
        pool.connect((err, client, done) => {

            if (err) throw err;
            client.query(`select a.name as name, a.price as price,a.picture as picture, a.price_sale as price_sale from articles a inner join restaurants r on a.restaurant = r.restaurant_id where a.name Ilike $1 and r.restaurant_name = $2`, [`%${req.body.searchArticle}%`, req.params.restName], (err, result) => {
                done();
                if (err) {
                    console.info(err.stack);
                    res.sendStatus(500);
                } else {
                    req.searchArticles = result.rows;
                    next();
                    console.info("novi: ", result.rows);
                    console.info(req.body.searchArticle);
                  console.info(req.user);


                }
            });
        });
    },
  getArticleForCategory: function (req, res, next) {
        pool.connect((err, client, done) => {

            if (err) throw err;
            client.query(`SELECT a.name as name, a.price as price,a.picture as picture, a.price_sale as price_sale FROM articles a
            inner join offers o on a.id_article_type = o.offer_id
            inner join restaurants r on a.restaurant = r.restaurant_id
            where o.offer_name = $1 and r.restaurant_name = $2;`, [req.body.categoryArticle, req.params.restName], (err, result) => {
                done();
                if (err) {
                    console.info(err.stack);
                    res.sendStatus(500);
                } else {
                    req.searchCategoryArticles = result.rows;
                    next();
                }
            });
        });
    },
  insertIntoBasket: function (req, res, next) {

    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`INSERT INTO baskets (food,id_user, price, restaurant) 
        VALUES ($1, $2, $3,$4)`, [req.body.cartFood, req.user.user_id, req.body.cartPrice, req.params.restName], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('It is inserted into backet');
          console.info('u insertu: ', req.params.restName);

          next();
        }
      });
    });
  },
  insertGroupIntoBasket: function (req, res, next) {

    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`INSERT INTO baskets (food,id_user, price, restaurant) 
        VALUES ($1, $2, $3,$4)`, [req.body.groupCart, req.user.user_id, req.body.cartPrice, req.params.restName], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('Group meni is inserted into backet');
          console.info('u insertu: ', req.body.groupCart);
          console.info('u insertu: ', req.body.cartPrice);


          next();
        }
      });
    });
  },
  getCartForUser: function (req, res, next) {
    pool.connect((err, client, done) => {

      if (err) throw err;
      client.query(`SELECT * FROM baskets
                where id_user = $1;`, [req.user.user_id], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.carts = result.rows;
          console.info(req.user);
          next();
        }
      });
    });
  },
  updateBasket: function (req, res, next) {

    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`update baskets set id_deliverer =( select user_id from users where id_restaurant = (select restaurant_id from restaurants where restaurant_name = $1) and (id_type = 3))
        where restaurant = $1;`, [req.params.restName], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('Basket is updated');
          console.info('u updatu 1', req.params.restName);

          next();
        }
      });
    });
  },
  updateBasket2: function (req, res, next) {

  pool.connect((err, client, done) => {
    if (err) throw err;
    client.query(`update baskets set status = true where restaurant = $1;`, [req.params.restName], (err, result) => {
      done();
      if (err) {
        console.info(err.stack);
        res.sendStatus(500);
      } else {
        console.info('Basket is updated second time');
        console.info('u updatu:',req.params.restName )

        next();
      }
    });
  });
},
  updateBasket3: function (req, res, next) {

    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`update baskets set time = $1 where restaurant = $2;`, [req.body.timedelivery,req.params.restName], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('Basket is updated second time');
          

          next();
        }
      });
    });
  },
  updateBasket4: function (req, res, next) {

    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`update baskets set payement = $1 where restaurant = $2;`, [req.body.card,req.params.restName], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('Basket is updated second time');


          next();
        }
      });
    });
  },
  getOrdersForDeliverer: function (req, res, next) {
    pool.connect((err, client, done) => {

      if (err) throw err;
      client.query(`select basket_id,food, payement, to_char(time, 'Day, DD  HH12:MI:SS') as time, price, u.name as name, u.last_name as last from baskets inner join users u on baskets.id_user = u.user_id
           where id_deliverer = $1;`, [req.user.user_id], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.forDelivering = result.rows;
          next();
          console.info('orders delivery', result.rows);



        }
      });
    });
  },
  getAllOrders: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`select delivery_status,food, payement, to_char(time, 'Day, DD  HH12:MI:SS') as time, price, u.name as name, u.last_name as last from baskets inner join users u on baskets.id_user = u.user_id
          where status = $1;`, ['true'], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.orders = result.rows;

          console.info(req.user);
          next();
        }
      });
    });
  },
  getAllOrdersForUser: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`select delivery_status,food, payement, to_char(time, 'Day, DD  HH12:MI:SS') as time, price, u.name as name, u.last_name as last from baskets inner join users u on baskets.id_user = u.user_id
          where id_user = $1;`, [req.user.user_id], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.orders = result.rows;

          console.info(req.user);
          next();
        }
      });
    });
  },
  getGroupForRestaurant: function (req, res, next) {
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`select * from group_meni inner join restaurants r on group_meni.id_restaurant = r.restaurant_id 
      where r.restaurant_name = $1;`, [req.params.restName], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          req.groupMeni = result.rows;
          console.info(result.rows);
          next();
        }
      });
    });
  },
  updateDeliveryStatus: function (req, res, next) {
    console.info('id:',req.body.dId);
    pool.connect((err, client, done) => {
      if (err) throw err;
      client.query(`update baskets set delivery_status = $1 where basket_id = $2`, [req.body.status_delivering, req.body.dId], (err, result) => {
        done();
        if (err) {
          console.info(err.stack);
          res.sendStatus(500);
        } else {
          console.info('Group meni is updated for delivery status');
          console.info(req.body.status_deliverings);
          console.info(req.body.dId);



          next();
        }
      });
    });
  },
};



/* */

//administrator-GET
router.get('/', function(req, res, next) {
  res.render('main', {title: ''});
});

router.get('/admin',administrator, function(req, res, next) {
  res.render('administrator.ejs', {user:"Arijela"});
});
router.get('/adminrest', administrator,functions.getRestaurants, function(req, res, next) {
  res.render('./registerViews/registerRestaurant', {rest: req.restaurants });
});
router.get('/adminaddrest', administrator,functions.getRestaurantTypes,functions.getFoodTypes,functions.getStars,functions.getCities,
    function(req,res,next){
  res.render('administratoradd.ejs', {foodtypes :req.foodtypes, foodcategories: req.foodcategory, restauranttypes: req.restauranttype, stars: req.stars, cities: req.cities });
});
router.post('/adminaddrest',functions.insertRestaurant,
    function(req,res,next){
    });
router.get('/managefood', administrator,functions.getFoodTypes,functions.getFoodCategory,functions.getRestaurantTypes,
    function(req, res, next) {
      res.render('managelookup.ejs', {foodtypes: req.foodtypes, foodcategory: req.foodcategory, restauranttype:req.restauranttype});
    });

//administratorRestaurant-GET
router.get('/administratorrestaurant',administratorRestaurant,
    function(req, res, next) {
      res.redirect('/addeliverer');
    });
router.get('/administrationarticles', administratorRestaurant,functions.getArticles,functions.getArticleTypes,
    function(req,res,next){
    res.render('addArticles.ejs', {articles: req.articles, types:req.articleT});

    });
router.get('/addSale',administratorRestaurant, functions.getArticles,
    function(req,res,next){
      res.render('addSale.ejs', {articles:req.articles});

    });
router.get('/addGroup',administratorRestaurant, functions.getArticleFood,functions.getArticleDrink, functions.getArticleSide,
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
router.post('/addeliverer',functions.registerDeliverer,
    function(req, res, next) {
      res.render('./registerViews/registerDeliverer');
    });



router.get('/managerrest',administrator, functions.getRestaurants,function(req,res,next){

    res.render('managerrest.ejs', {restaurants: req.restaurants})
});
router.get('/manageponude', administrator, functions.getAllArticles,function(req,res,next){

  res.render('manageponude.ejs', {restaurants: req.articles})
});

router.get('/managenarudzbe',administrator, functions.getAllOrders,function(req,res,next){

  res.render('managenarudzbe.ejs', {restaurants: req.orders})
});






//KUPAC-CUSTOMER GET
router.get('/customer',customer, functions.getRestaurants, function(req, res, next) {
  res.render('customer.ejs', {restaurants: req.restaurants, user: req.user});
});
router.get('/deliverer',deliverer,functions.getOrdersForDeliverer, function(req, res, next) {
  res.render('./restaurants/deliverer.ejs', {orders: req.forDelivering, title: req.user.name});
});
router.post('/deliverer',deliverer,functions.updateDeliveryStatus,functions.getOrdersForDeliverer, function(req, res, next) {
  res.render('./restaurants/deliverer.ejs', {orders: req.forDelivering, title: req.user.name});
});

router.get('/customer/:restName',customer,functions.getGroupForRestaurant, functions.getRestaurants,functions.getArticlesForRestaurantFood,functions.getOfferForBrajlovic, function(req, res, next) {
  let title = req.params.restName;
  console.info('title', title);
  res.render('./restaurants/brajlovic.ejs', {meni: req.groupMeni,title: title, restaurants: req.restaurants, user: req.user,articles: req.restaurantArticles, offer: req.offerBraj});
});
router.get('/cart/:restName',customer,functions.getCartForUser, functions.getAllOrdersForUser, function(req, res, next) {
  res.render('./restaurants/cart.ejs', {cart: req.carts, title:req.params.restName,restaurants: req.orders});
});
router.post('/cart/:restName',customer,functions.updateBasket, functions.updateBasket2,functions.updateBasket3,functions.updateBasket4, function(req, res, next) {
  var nodemailer = require('nodemailer');

  var transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
      user: 'arijela_98@outlook.com',
      pass: 'Lelicka1998.'
    }
  });
  var mailOptions = {
    from: 'arijela_98@outlook.com',
    to: toString(req.user.email),
    subject: 'SERVIS ZA DOSTAVU HRANE',
    text: 'Vasa narudzba je uspjesno spasena'
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  res.redirect('/cart/Montana');

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
      res.render('managerrest.ejs', {restaurants: req.restaurants})
    });

//CUSTOMER - post
router.post('/customer/:restName',customer,functions.getGroupForRestaurant,functions.insertIntoBasket,functions.getRestaurants,functions.getArticlesForRestaurantFood,functions.getOfferForBrajlovic, function(req, res, next) {
  res.render('./restaurants/brajlovic.ejs', {meni: req.groupMeni,title: req.params.restName, restaurants: req.restaurants, user: req.user,articles: req.restaurantArticles, offer: req.offerBraj});
});
router.post('/customer/:restName/search',customer,functions.getGroupForRestaurant,functions.getRestaurants,functions.getSearchArticles,functions.getOfferForBrajlovic, function(req, res, next) {
  res.render('./restaurants/brajlovic.ejs', {meni: req.groupMeni,title: req.params.restName, restaurants: req.restaurants,articles: req.searchArticles, offer: req.offerBraj});
});
router.post('/customer/:restName/search2',customer,functions.getGroupForRestaurant,functions.getRestaurants,functions.getArticleForCategory,functions.getOfferForBrajlovic, function(req, res, next) {
  res.render('./restaurants/brajlovic.ejs', {meni: req.groupMeni,title: req.params.restName, restaurants: req.restaurants,articles: req.searchCategoryArticles, offer: req.offerBraj});
});
router.post('/customer/:restName/group',customer,functions.insertGroupIntoBasket,functions.getGroupForRestaurant,functions.getRestaurants,functions.getArticleForCategory,functions.getOfferForBrajlovic,  function(req, res, next) {
  res.render('./restaurants/brajlovic.ejs', {meni: req.groupMeni,title: req.params.restName, restaurants: req.restaurants,articles: req.searchCategoryArticles, offer: req.offerBraj});
});


//administrator-POST
router.post('/admin',
    functions.registerAdministratorRestaurant,
    function(req, res, next) {
      res.sendStatus(200);
    });


router.post('/managefood',
    functions.updateFoodType,functions.updateFoodCategory,functions.updateRestaurantType,functions.getFoodTypes,functions.getFoodCategory,functions.getRestaurantTypes,
    //functions.insertFoodType,
    function(req, res, next) {
      res.render('managelookup.ejs', {foodtypes: req.foodtypes, foodcategory: req.foodcategory, restauranttype:req.restauranttype});
    });


router.delete('/managefood/:id',
    functions.deleteFoodType,functions.getFoodTypes,functions.getFoodCategory,functions.getRestaurantTypes,
    function(req, res, next) {
      res.render('managelookup.ejs', {foodtypes: req.foodtypes, foodcategory: req.foodcategory, restauranttype:req.restauranttype});
    });



router.post('/managefood/ins',functions.insertFoodType,functions.insertFoodCategory,functions.insertRestaurantType,functions.getFoodTypes,functions.getFoodCategory,functions.getRestaurantTypes,

    function(req, res, next) {
      res.render('managelookup.ejs', {foodtypes: req.foodtypes, foodcategory: req.foodcategory, restauranttype:req.restauranttype});
    });

//ADMINISTRATOR RESTAURANT-POST
router.post('/administrationarticles',administratorRestaurant, functions.insertArticle, functions.getArticles,functions.getArticleTypes,
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
