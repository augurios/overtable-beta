var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');


var ConnectionSchema = new mongoose.Schema({
    UserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    RestaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    created_by: String,
    updated_by: String,
    Sockets: [],
    active: { type: Number, default: 1 },
    syncflag: { type: Number, default: 0 }
});

mongoose.model('Connection', ConnectionSchema);

