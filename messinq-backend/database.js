var mysql = require('mysql');
var express = require('expr');
//var db = require('../models');
var bcrypt = require('bcrypt');

var app = express();

const saltround = 10;

var connection = mysql.createConnection({
  connectionLimit: 5,
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "databasename"
});


// URL van onderstaande code
//https://medium.com/@mridu.sh92/a-quick-guide-for-authentication-using-bcrypt-on-express-nodejs-1d8791bb418f

//register: storing name, email and password and redirecting to home page after signup
app.post('/signup', function (req, res) {
  bcrypt.hash(req.body.passwordsignup, saltRounds, function (err,   hash) {
    // this is same as INSERT INTO user VALUE email = 'the email the user typed in' limit 1.
    db.User.create({
      email: req.body.emailsignup,
      name: req.body.usernamesignup,
      password: hash
    }).then(function(data) {
      if (data) {
        res.redirect('/signin');
      } else {
        res.send('something went wrong');
        res.redirect('/signup');
      }
    });
  });
});

//login page: storing and comparing email and password,and redirecting to home page after login
app.post('/signin', function (req, res) {
  //this is same as select * from users where email = 'the email the user typed in0 limit 1'
  db.User.findOne({
      where: {
        email: req.body.email
      }
  }).then(function (user) {
      if (!user) {
         res.redirect('/');
      } else {
        // password_hash comes from user data model. At the moment this column is not inside the user data model
        bcrypt.compare(req.body.password, user.password, function (err, result) {
          if (result == true) {
            res.redirect('/dashboard');
          } else {
            res.send('Incorrect password');
            res.redirect('/signin');
          }
        });
      }
  });
});

console.log("listening requests...")
app.listen(3306);