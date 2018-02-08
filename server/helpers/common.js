var database = require('../config/database.js');
var credentialDB = database.dbconfig();

var common = function () { };

/**
  * @Database initialization 
**/
common.db_access = require('../config/database.js');

/**
  * @Basic Configuration Files included
**/

common.config = require('../config/config.js');
common.constants = require('../config/constants.js');
common.helpers = require('../helpers/helpers.js');

/**
  * @Common Requiring Modules
**/

common.mail = common.config.mail();
common.crypto = require('crypto');
common.pbkdf2 = require('pbkdf2');
common.jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
common.jwts = require('jwt-simple'); // used to create, sign, and verify tokens
common.fs = require('fs');
common.path = require("path");
common.moment = require("moment");
common.async = require("async");
common.nodemailer = require('nodemailer')
common.smtpTransport = require('nodemailer-smtp-transport');
common.flash = require('connect-flash');
common.validator = require('validator');
common.mongoose = require('mongoose');
common.passport = require('passport');
common.io = require('socket.io')


// Mail config
common.transporter = common.nodemailer.createTransport("SMTP", {
  host: common.mail.smtp_host,
  auth: {
    user: common.mail.smtp_user,
    pass: common.mail.smtp_password
  }
});

common.getSession = function (req, res) {
  var sess;
  if (typeof session != "undefined") {
    sess = req.session;

    if (sess.userid == null) {
      res.redirect('/login');
    }
    else {
      return sess;
    }
  }

}

common.l = function (data) {
  console.log(data);
}


module.exports = common;
