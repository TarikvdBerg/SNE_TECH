var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var mysql = require('mysql');
var myConnection = require('express-myconnection');
var bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();

var async = require('async');
var crypto = require('crypto');

var dbOptions = {
	connectionLimit : process.env.DB_CONLIMIT,
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
	database: process.env.DB_DATABASE
};

// ## local
// var dbOptions = {
// 	connectionLimit: '50',
// 	host: "localhost",
// 	user: 'root',
// 	password: "root",
// 	port: '3306',
// 	database: 'messinq'
// };

// ## vulkerserver
// var dbOptions = {
//     connectionLimit: '50',
//     host: "vulker.nl",
//     user: 'guus',
//     password: "welkom123",
//     port: '33060',
//     database: 'messinq'
// };

//console.log(dbOptions);
var app = express();
app.use(myConnection(mysql, dbOptions, 'single'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'messinq',
    saveUninitialized: true,
    resave: false
}));

app.use(express.static(__dirname + '/views'));


app.get("*", function(req, res, next) {
    if (req.session.username == '') {
        res.redirect('/login');
    }
    res.locals.currentUser = req.session.username;

    if (req.originalUrl == '/login' || req.originalUrl == '/register') {
        req.session.current_URL = req.protocol + '://' + req.get('host');
    } else {
        req.session.current_URL = req.protocol + '://' + req.get('host') + req.originalUrl;
    }

    next();
});

app.get('/username-request', function(req, res) {
    res.send(res.locals.currentUser);
});

app.get('/', function(req, res) {
    res.redirect('/chat');
});

app.get('/chat', function(req, res) {
    if (req.session.username) {
        req.getConnection(function(err, connection) {
            connection.query('SELECT * FROM users', function(err, results) {
                res.render('chat/window', {});
            });
        });
    } else {

        res.redirect('/login');
    }
});


app.get('/login', function(req, res) {
    console.log("GET /login");
    if (req.session.username == undefined) {
        res.render('users/login', {
            postUrl: '/login',
            error: false,
            newUser: false
        });
    } else {

        res.redirect('/');
    }
});


app.post('/login', function(req, res) {
    var Gebruikers_naam = req.body.username;
    var LokaalWachtwoord = req.body.password;

    if (req.body.username != '' && req.body.password != '') {
        req.getConnection(function(err, connection) {
            //console.log(Gebruikers_naam);
            //console.log(Wachtwoordhash);
            connection.query('SELECT * FROM gebruiker WHERE gebruikers_naam = ? LIMIT 1', [Gebruikers_naam], function(err, results) {
                console.log("User logged in");
                console.log(results)
                if (results != undefined && results.length > 0) {
                    bcrypt.compare(LokaalWachtwoord, results[0].wachtwoordhash, function(err, ress) {
                        if (!ress) {
                            console.log("login - ress bestaat NIET")
                            res.render('users/login', {
                                postUrl: '/login',
                                error: 'Invalid username or password.',
                                newUser: false
                            });
                        } else {
                            console.log("login - ress bestaat")
                            req.session.username = results[0].gebruikers_naam;
                            console.log(req.session);
                            res.redirect('/');
                        }
                    });
                } else {
                    console.log("login - results is kleiner dan 0")
                    res.render('users/login', {
                        postUrl: '/login',
                        error: 'Invalid username or password.',
                        newUser: false
                    });
                }
            });
        });
    } else {
        res.render('users/login', {
            postUrl: '/login',
            error: 'Please fill in all fields.',
            newUser: false
        });
    }
});

app.get('/register', function(req, res) {
    if (req.session.username == undefined) {
        res.render('users/register', {
            postUrl: '/register',
            error: false
        });
    } else {

        res.redirect('/');
    }
});



app.post('/register', function(req, res) {
    req.getConnection(function(err, connection) {
        var data = {
            Emailadres: req.body.email,
            Gebruikers_naam: req.body.username,
            Wachtwoordhash: bcrypt.hashSync(req.body.password, 10),
        };
        if (req.body.email != '' && req.body.username != '' && req.body.password != '') {
            console.log([data.Emailadres]);
            console.log([data.Gebruikers_naam]);
            console.log([data.Wachtwoordhash]);
            // connection.query("SELECT * FROM gebruiker WHERE gebruikers_naam = ? LIMIT 1", [data.Gebruikers_naam], function(err, results) {
            connection.query("SELECT * FROM gebruiker WHERE emailadres = ? LIMIT 1", [data.Emailadres], function(err, results) {

                console.log("registerdebug", results)
                if (err || results[0] != undefined) {
                    //console.log("undefined error");
                    res.render('users/register', {
                        postUrl: '/register',
                        // error: 'Gebruikersnaam bestaat al'
                        error: 'Email adres bestaat al'
                    });
                } else {
                    console.log("else undefined debug");
                    connection.query("INSERT INTO gebruiker set ? ", [data], function(err, results) {
                        console.log("na db insert", err);
                        res.render('users/login', {
                            postUrl: '/login',
                            error: 'Gebruiker ' + req.body.username + ' aangemaakt',
                            newUser: req.body.username
                        });
                    });
                }
            });
        } else {
            res.render('users/register', {
                postUrl: '/register',
                error: 'Vul alle velden in aub'
            });
        }
    });
});


app.get('/forgotpassword', function(req, res) {
    if (req.session.username == undefined) {
        res.render('users/forgotpassword', {
            postUrl: '/forgotpassword',
            user: req.body.username,
            error: false,
            newUser: false
        });
    } else {

        res.redirect('/');
    }
});


var mongoose = require('mongoose');
const Schema = mongoose.Schema;

var UserInfo = new Schema({
    Emailadres: { type: String, required: true },
    password: { type: String, required: true }
}, {
    collection: 'User'
});

var User = mongoose.model('User', UserInfo)

app.post('/forgotpassword', function(req, res, next) {
    var email = req.body.email;

    async.waterfall([function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString("hex");
                console.log("token inside", token);
                done(err, token);
            });
        },

        function(token, done) {
            User.findOne({ email: req.body.email }, //checking if the email address sent by client is present in the db(valid)
                function(err, user) {
                    if (!user) {
                        console.log([user.email])
                        return throwFailed(res, 'No user found with that email address.')
                    }
                    ResetPassword
                        .findOne({
                            where: { email: user.email, status: 0 },
                        }).then(function(resetPassword) {
                            if (resetPassword)
                                resetPassword.destroy({
                                    where: {
                                        email: resetPassword.email
                                    }
                                })
                            token = crypto.randomBytes(32).toString('hex') //creating the token to be sent to the forgot password form (react)
                            bcrypt.hash(token, null, null, function(err, hash) { //hashing the password to store in the db node.js
                                ResetPassword.create({
                                    email: user.email,
                                    resetPasswordToken: hash,
                                    expire: moment.utc().add(config.tokenExpiry, 'seconds'),
                                }).then(function(item) {
                                    if (!item)
                                        return throwFailed(res, 'Oops problem in creating new password record')
                                    let mailOptions = {
                                        from: '"<jyothi pitta>" jyothi.pitta@ktree.us',
                                        to: user.email,
                                        subject: 'Reset your account password',
                                        html: '<h4><b>Reset Password</b></h4>' +
                                            '<p>To reset your password, complete this form:</p>' +
                                            '<a href=' + config.clientUrl + 'reset/' + user.email + '/' + token + '">' + config.clientUrl + 'reset/' + user.email + '/' + token + '</a>' +
                                            '<br><br>' +
                                            '<p>--Team</p>'
                                    }
                                    let mailSent = sendMail(mailOptions) //sending mail to the user where he can reset password.User id and the token generated are sent as params in a link
                                    if (mailSent) {
                                        return res.json({ success: true, message: 'Check your mail to reset your password.' })
                                    } else {
                                        return throwFailed(error, 'Unable to send email.');
                                    }
                                })
                            })
                        });
                })

        }


    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');

    });
});

app.post('/reset-password', function(req, res) {
    const email = req.body.email
    dbOptions.findOne({ email: email })
        .exec()
        .then(function(user) {
            if (!user) {
                return throwFailed(res, 'No user found with that email address.')
            }
        })


    token = crypto.randomBytes(32).toString('hex') //this token would be sent in the link to reset forgot password
    bcrypt.hash(token, null, null, function(err, hash) {
        let password = new ResetPassword({
            email: user._email,
            resetPasswordToken: hash,
            expire: moment.utc().add(config.tokenExpiry, 'seconds'),
        });
        password.save(function(err) {
            if (err) throw err;
        });
    });

    let mailOptions = {
        from: config.senderEmail,
        to: user.email,
        subject: 'Reset your account password',
        html: '<h4><b>Reset Password</b></h4>' +
            '<p>To reset your password, complete this form:</p>' +
            '<a href=' + config.clientUrl + 'reset/' + user._email + '/' + token + '">' + config.clientUrl + 'reset/' + user._email + '/' + token + '</a>' +
            '<br><br>' +
            '<p>--Team</p>'
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info))

});




app.get('/profile', function(req, res) {
    res.render('users/profile', {
        postUrl: '/profile',
        username: req.body.username,
        title: 'Profile Page'
    });
});




app.post("/profile", (request, response) => {
    var id = request.body.username;
    var account = {
        "type": "account",
        "pid": id,
        "email": request.body.email,
        "password": Bcrypt.hashSync(request.body.password, 10)
    };
    var profile = request.body;
    profile.type = "profile";
    delete profile.password;
    bucket.insert(id, profile, (error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        bucket.insert(request.body.email, account, (error, result) => {
            if (error) {
                bucket.remove(id);
                return response.status(500).send(error);
            }
            response.send(result);
        });
    });
});


app.get('/logout', function(req, res) {

    req.session.destroy();

    res.redirect('/');
});


// Serverside chat gedeelte
var expressWs = require('express-ws')(app);

var clients = {};

var sendClientList = (websocket) => {
    console.log("sendClientList");
    websocket.send(JSON.stringify({
        event: "client_list",
        data: {
            clients: Object.keys(clients),
        },
    }));
};

var onMessage = (websocket, request) => (message) => {
    console.log("ONMESSAGE");
    try {
        var data = JSON.parse(message);

        switch (data.event) {
            case "client_register":
                clients[data.data.username] = websocket;

                websocket.send(JSON.stringify({
                    event: "client_register",
                    data: {
                        message: `Registered as ${data.data.username}`,
                    },
                }));

                for (var client in clients) {
                    try {
                        sendClientList(clients[client]);
                    } catch (ex) {
                        console.warn(`Exception while sending updated client list to '${client}', removing him from the client list.`);
                        delete clients[client];
                    }
                }

                break;
            case "message":
                clients[data.data.recipient].send(JSON.stringify({
                    event: "message",
                    data: {
                        from: data.data.sender,
                        to: data.data.recipient,
                        message: data.data.message,
                    },
                }));
                break;
            case "client_list":
                sendClientList(websocket);
                break;
            default:
                websocket.send(JSON.stringify({
                    event: "error",
                    data: {
                        message: `Unknown command ${data.event}`,
                    },
                }));
                break;
        }
    } catch (e) {
        console.error(e);
    }
};

app.use(express.static('public'));

// register web socket on /chat2, will fire on new websocket connections
app.ws('/chat2', (websocket, request) => {
    console.log("chat2 ws rq");
    websocket.on("message", onMessage(websocket, request));
    websocket.on("close", () => {
        for (var client in clients) {
            if (clients[client] === websocket) {
                delete clients[client];

                console.info(`Removed client '${client}'`);
                return;
            }
        }
    });
})

// 404
app.get('*', function(req, res) {
    res.redirect('/');
    console.log('404 trigger, NOT logged in')
});


app.listen(3000, function() {
    console.log('App listening at http://localhost:3000');
});



module.exports = mongoose.model('User', UserInfo);