var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');


var ShiftSchema = new mongoose.Schema({
    starttime: { type: Date, default: Date.now },
    endtime: Date,
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    idsshiftopenedby: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    created_by: String,
    updated_by: String,
    clientId: { type: String },
    isactive: { type: Number, default: 1 },
});

mongoose.model('Shift', ShiftSchema);

