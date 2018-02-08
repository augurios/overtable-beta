var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');


var ScreenSchema = new mongoose.Schema({
  screen_name: String,
  screen_path: String,
  users: Array,
  created_at:  { type : Date, default: Date.now },
  updated_at:  { type : Date, default: Date.now },
  created_by: String,
  updated_by: String,
  active: {type: Number, default: 1},
});

mongoose.model('Screens', ScreenSchema);

