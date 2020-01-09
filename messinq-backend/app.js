var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var mysql = require('mysql');
var myConnection = require('express-myconnection');
var bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();

var dbOptions = {
	connectionLimit : process.env.DB_CONLIMIT,
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
	database: process.env.DB_DATABASE
};

//console.log(dbOptions);
var app = express();
app.use(myConnection(mysql, dbOptions, 'single'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'messinq',
  saveUninitialized: true,
  resave: false
}));


app.get("*", function(req, res, next) {
	if(req.session.username=='') {
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

app.get('/username-request', function(req, res){
	res.send(res.locals.currentUser);
});
	
app.get('/', function(req, res){
	res.redirect('/chat');
});

app.get('/chat', function(req, res){
  if(req.session.username){
	    req.getConnection(function(err, connection){
		    connection.query('SELECT * FROM users', function(err,results) {
			    res.render('chat/window', {});
			});
		});
  } else {

    res.redirect('/login');
  }
});


app.get('/login', function(req, res){
	console.log("GET /login");
	if(req.session.username == undefined){
		res.render('users/login', {
			postUrl: '/login',
			error: false,
			newUser: false
		});
	} else {

		res.redirect('/');
	}
});


app.post('/login', function(req, res){
	var Gebruikers_naam = req.body.username;
	var LokaalWachtwoord = req.body.password;
	
	if(req.body.username!='' && req.body.password!='') {
		req.getConnection(function(err, connection){
			//console.log(Gebruikers_naam);
			//console.log(Wachtwoordhash);
			connection.query('SELECT * FROM gebruiker WHERE gebruikers_naam = ? LIMIT 1', [Gebruikers_naam],function(err,results)	 {
				console.log("User logged in");
				console.log(results)
				if (results != undefined && results.length > 0) {
					bcrypt.compare(LokaalWachtwoord, results[0].wachtwoordhash, function(err, ress) {
						if(!ress){
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
	if(req.session.username == undefined){
		res.render('users/register', {
			postUrl: '/register',
			error: false
		});
	} else {

		res.redirect('/');
	}
});

app.post('/register', function(req, res) {
  req.getConnection(function (err, connection) {
    var data = {
        Gebruikers_naam    : req.body.username,
        Wachtwoordhash     : bcrypt.hashSync(req.body.password, 10),
    };
    if(req.body.username!='' && req.body.password!='') {
		console.log([data.Gebruikers_naam]);
		console.log([data.Wachtwoordhash]);
		connection.query("SELECT * FROM gebruiker WHERE gebruikers_naam = ? LIMIT 1", [data.Gebruikers_naam], function(err, results) {
			console.log("registerdebug", results)
			if (err || results[0]!=undefined) {
				//console.log("undefined error");
				res.render('users/register', {
					postUrl: '/register',
					error: 'Gebruikersnaam bestaat al'
				});
			} else {
				console.log("else undefined debug");
				connection.query("INSERT INTO gebruiker set ? ", [data], function(err, results) {
					console.log("na db insert", err);
					res.render('users/login', {
						postUrl: '/login',
						error: 'Gebruiker '+req.body.username+' aangemaakt',
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

app.get('/logout', function(req, res){

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

//app.use(express.static('public'));

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
app.get('*', function(req, res){
	res.redirect('/');
	console.log('404 trigger, NOT logged in')
});

app.listen(3000, function() {
  console.log('App listening at http://localhost:3000');
});
