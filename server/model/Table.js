var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');


var TableSchema = new mongoose.Schema({
  number:{type:Number},
  name: { type: String },
  roomid: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  created_at:  { type : Date, default: Date.now },
  updated_at:  { type : Date, default: Date.now },
  created_by: String,
  updated_by: String,
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  active: {type: Number, default: 1},
  syncflag : {type: Number, default: 0}
});

mongoose.model('Table', TableSchema);

