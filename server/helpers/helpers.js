const crypto = require('crypto');
const mongoose = require('mongoose');
const async = require('async');
var config = require('../config/config.js');
var constants = require('../config/constants.js');

// Key provider
const keys = constants.keys();
const definition = constants.define();

var algorithm = 'aes-256-ctr',
    password =  keys.cipher_key;





//Time functions
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!
var yyyy = today.getFullYear();

if (dd < 10) {
  dd = '0' + dd
}

if (mm < 10) {
  mm = '0' + mm
}
today = yyyy + '-' + mm + '-' + dd;
exports.clock = function () {
  var time = {
    today: today,
    current_date: dd,
    current_month: mm,
    current_year: yyyy
  };
  return time;
}
/**
 * Page Generate Passoword:  Function for creating passwords,checking password,updating password
 *
 * Using Crypto Module
 *
 * @param string $password
 *   Should Password as string
 *
 * @return string
 *   return string
 *
 * @seen at login()
 */
exports.generatePassword = function (password) {
  return crypto.createHmac('sha256', keys.cryptokey)
    .update(password)
    .digest('hex');
};


/**
 * Get File Extention
 *
 * @param string filename
 *
 * @return string
 *   return string
 *
 */
exports.fileExt = function (filename) {
  filename = filename.trim()
  return filename.split('.').pop();
}

/**
 * generate File Name with random number
 *
 * Using Crypto Module
 *
 * @param int low,int high, string filename
 *
 * @return string
 *   return string
 *
 */

exports.generateName = function (low, high, filename) {
  if (!filename || filename != "") {
    var no = Math.random() * (high - low) + low;
    var total = Math.round(no);
    var filenamnew = this.url_structure(filename);
    total = filenamnew + "-" + total;
    total = total.trim()
    return total;
  }
  else {
    var no = Math.random() * (high - low) + low;
    var total = Math.round(no);
    total = total.trim()
    return total;
  }

}

/**
 * generate File Name with out extention

 * @param string filename
 *
 * @return string
 *   return string
 *
 */

exports.getFileName = function (filename) {
  var filename = filename.replace(/\\/g, '/');
  var fname = filename.substring(filename.lastIndexOf('/') + 1, filename.lastIndexOf('.'));
  fname = fname.trim()
  return fname;
}


/**
 * generate File Name with out extention

 * @param string filename
 *
 * @return string
 */
exports.allowed_uploads = function (filename) {
  var extention = filename.split('.').pop();
  extention = extention.toLowerCase();
  return (((definition.supporting_uploads_type.toLowerCase()).indexOf(extention) >= 0))
}

// filename removing  space and adding hyphens to lowercase
exports.url_structure = function (filename) {
  var filenamnew = filename.replace(/\s+/g, '-').toLowerCase();
  return filenamnew;
}

// filename removing  space and adding hyphens to lowercase
exports.passwordHasher = function (password, iterationCount) {
  const passhash = common.crypto.pbkdf2Sync(password, 'salt', parseInt(iterationCount), 512, 'sha512');
  var Pasword = passhash.toString('hex');
  return Pasword;
}

// filename removing  space and adding hyphens to lowercase
exports.timefunctions = function () {
  var moment = require('moment')
  var now = moment()
  var formatted = now.format('YYYY-MM-DD HH:mm:ss Z')
  return formatted;
}


/**
 * return result format 
 * 
 * @return {[status]} 
 */
exports.response = function (status,success,data,message) {
  var response = { status  : status, success : success, data : data, message: message  }
  return response;
}
/**
 * create username
 */

exports.username = function (str) {
  
  str = str.replace(/\s+/g, '-').toLowerCase();
 /* User.find({ username: str },function(err, users){
     if (err) { console.log("error helper");console.log(err); res.json(0); }
     if(users){
       console.log("helper2")*/
      str = str+'-'+Math.random().toString(36).substr(2, 5)
     /* console.log(str)
      return str
     }
     else{
       console.log("helper3")*/
       return str
 /*    }
  });*/
}

/**
 * Generate Password
 */

exports.generateRandomPassword = function () {
   var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 8; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;

}

/**
 * Generate Token Based on email
 */

exports.tokenizer = function (data) {
var common = require('./common');
var tokenval = common.jwt.sign({
/*  exp: Math.floor(Date.now() / 1000) + (60 * 60)*/
  data: '_dated_'+Date.now()+data
},keys.cryptokey);
return tokenval
}
/**
 * Generate Token For forgot password
 */

exports.encrypt = function (data) {
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(data,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}


exports.decrypt = function (data) { 
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(data,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

/**
 * Generate Salt
 */

exports.saltGen = function () {
  var buf = crypto.randomBytes(64).toString('hex');
  return buf
}



// Base64 Ecryption
exports.encodedata = function (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  //this = input;

  var output = "";
  var chr1, chr2, chr3 = "";
  var enc1, enc2, enc3, enc4 = "";
  var i = 0;

  do {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }

    output = output +
      keyStr.charAt(enc1) +
      keyStr.charAt(enc2) +
      keyStr.charAt(enc3) +
      keyStr.charAt(enc4);
    chr1 = chr2 = chr3 = "";
    enc1 = enc2 = enc3 = enc4 = "";
  } while (i < input.length);

  return output;
}
// Base64 Decryption
exports.decodedata = function (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  var output = "";
  var chr1, chr2, chr3 = "";
  var enc1, enc2, enc3, enc4 = "";
  var i = 0;

  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  var base64test = /[^A-Za-z0-9\+\/\=]/g;
  if (base64test.exec(input)) {
    //window.alert("There were invalid base64 characters in the input text.\n" +
    //    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
    //    "Expect errors in decoding.");
  }
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

  do {
    enc1 = String(keyStr).indexOf(input.charAt(i++));
    enc2 = String(keyStr).indexOf(input.charAt(i++));
    enc3 = String(keyStr).indexOf(input.charAt(i++));
    enc4 = String(keyStr).indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 != 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 != 64) {
      output = output + String.fromCharCode(chr3);
    }

    chr1 = chr2 = chr3 = "";
    enc1 = enc2 = enc3 = enc4 = "";

  } while (i < input.length);
  output = output.replace(/\0[\s\S]*$/g, '');
  return output;

}

exports.authenticateEmployee = function () {

  return function (req, res, next) {

      if (req.session.employee)
          next();
      else
         res.json(this.response(403,false,0,"Forbidden Access")) 
          //res.send(403)
  }
}