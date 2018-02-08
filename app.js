var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var mongoose = require('mongoose');
var convert = require('convert-units');
var converter = require('google-currency');
var passport = require('passport');
var http = require('http');
var debug = require('debug')('project:server');
var session = require('express-session');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
//var MongoDBStore = require('connect-mongodb-session')(session);
const MongoStore = require('connect-mongo')(session);



//global.connections = [];

var appExpress = express();
var router = express.Router();

var common = require('./server/helpers/common');

var port = 9000;//common.config.environment().port
var credential = common.db_access.dbconfig();
var keys = common.constants.keys();


//codeto hamed uncaught exception
var process = require('process');
process.on('uncaughtException', function (err) {
    console.log("uncaughtException occured" + JSON.stringify(err));
});

appExpress.set('port', port);
appExpress.use(logger('dev'));
appExpress.use(bodyParser.json({limit: '50mb'}));
appExpress.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));
appExpress.use(express.json({limit: '50mb'}));
appExpress.use(express.urlencoded({limit: '50mb'}));
appExpress.use(cookieParser());
appExpress.use('/', serveStatic(__dirname + '/')); // serve static files
appExpress.use('/public', serveStatic(__dirname + '/public')); // serve static files
appExpress.use('/vendors', serveStatic(__dirname + '/vendors')); // serve static files

//app.set('superSecret', keys.sessionkey); // secret variable
//router.use(function(req, res, next) {

//  // check header or url parameters or post parameters for token
//  var token = req.body.token || req.query.token || req.headers['x-access-token'];

//  // decode token
//  if (token) {

//    // verifies secret and checks exp
//    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
//      if (err) {
//        return res.json({ success: false, message: 'Failed to authenticate token.' });    
//      } else {
//        // if everything is good, save to request for use in other routes
//        req.decoded = decoded;    
//        next();
//      }
//    });

//  } else {

//    // if there is no token
//    // return an error
//    return res.status(403).send({ 
//        success: false, 
//        message: 'No token provided.' 
//    });
    
//  }
//});

//var db = require('./server/config/database').dbconfig();

//var optionsMong = {
//  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
//  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
//};

//mongoose.connect(db.connectionstring, optionsMong, function (err) {
//    //codeto to handle db connetion issue and it shouddauto recontect
//    console.log(err);
//});


//var date = new Date();
//date.setTime(date.getTime()+(365 * 24 * 60 * 60 * 1000)); //won't have to log in for a year

//var sessionMiddleware = session({
//    secret: keys.sessionkey,
//    name: 'MyLANapp',
//    saveUninitialized: false, // don't create session until something stored
//    resave: true, //don't save session if unmodified
//    cookie : {maxAge: date}, 
//    rolling : true, //won't have to log in for a year from last touch Prevent Browser cookie deletion on exit
//    store: new MongoStore({
//        url: db.connectionstring,
//        collection : db.collection.session_collection,
//         //touchAfter: 24 * 3600, // time period in seconds // session be updated only one time in a period of 24 hours
//        ttl: 24 * 60 * 60
//    })
//})
////app.use(sessionMiddleware);


//var sio = require('socket.io')(serve);



//// apply the routes to our application with the prefix /api
//app.use('/api/v1/', router);

//require('./server/routes/routes.js')(app); // Main Route File

var serve = http.createServer(appExpress);
serve.listen(port); // create server


//require('./server/routes/sockets.js')(serve,sessionMiddleware);


//sio.sockets.on("connection", function(socket) {
//  console.log(socket.request )
//  socket.request.session // Now it's available from Socket.IO sockets too! Win!
//});

console.log("App listening on port " + port);

//// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  var err = new Error('Not Found');
//  err.status = 404;
//  next(err);
//});

//// error handler
//app.use(function(err, req, res, next) {
//  // set locals, only providing error in development
//  res.locals.message = err.message;
//  res.locals.error = req.app.get('env') === 'development' ? err : {};

//  // render the error page
//  console.log(err)
//  res.status(err.status || 500);
//  res.redirect('/error');
//});

appExpress.post('/convertunit', function (req, res) {
    console.log(req.body);
    function getapiformat(symbol) {
        if (symbol == 'Litres')
            return 'l'
        else if (symbol == 'Ounces')
            return 'oz'
        else if (symbol == 'Grams')
            return 'g'
        else if (symbol == 'Kilograms')
            return 'kg'
        else if (symbol == 'Milliliter')
            return 'ml'
        

    }
    
   
       req.body.ConvertFrom = getapiformat(req.body.ConvertFrom)
       req.body.ConvertTo= getapiformat(req.body.ConvertTo)
    var conversion = req.body


    conversion = conversion = convert(req.body.amount).from(req.body.ConvertFrom).to(req.body.ConvertTo)
   
    res.json({ amount: conversion });
});

appExpress.post('/convertdollar', function (req, res) {
    console.log(req.body);
    var options = {
	  from: "CRC",
	  to: "USD",
	  amount: req.body.amount
	}
	converter(options).then(value => {
	  console.log(value)
	  res.json({ amount: value }); // Return object
	})

     
    
});

appExpress.get('*', function (req, res) {
    res.sendfile(__dirname + '/public/template/index.html');
});


