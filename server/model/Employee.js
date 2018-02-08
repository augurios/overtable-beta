var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');


var EmployeeSchema = new mongoose.Schema({
  firstname: {type: String},
  lastname: {type: String},
  email: {type: String, lowercase: true},
  pin:  Number,
  phone: String,
  position: String,
  role:  String,
  image: String,
  position: String,
  dateofbirth: String,
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at:  { type : Date, default: Date.now },
  updated_at:  { type : Date, default: Date.now },
  created_by: String,
  updated_by: String,
  active: {type: Number, default: 1},
  syncflag : {type: Number, default: 0}
});

mongoose.model('Employee', EmployeeSchema);

