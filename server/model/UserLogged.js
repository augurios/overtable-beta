var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');


var Schema = new mongoose.Schema({
  Userid: String,
  usertoken: String,
  generatedtoken: String,
  created_at:  { type : Date, default: Date.now },
  updated_at:  { type : Date, default: Date.now },
  created_by: String,
  active: {type: Number, default: 1},
});

mongoose.model('LoggedInUser', Schema);

