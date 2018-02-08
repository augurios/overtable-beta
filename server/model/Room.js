/// <reference path="Room.js" />
var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');


var RoomSchema = new mongoose.Schema({
    name: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    created_by: String,
    updated_by: String,
    tableNum: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Table' }, ],
    active: { type: Number, default: 1 },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

mongoose.model('Room', RoomSchema);

