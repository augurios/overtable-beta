var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');


var OrdersSchema = new mongoose.Schema({
    clientId:String,
    note: String,
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    userId: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
    quantity: { type: Number },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    status: { type: String },
    ingredient: [],
    variation: [],
    extraingredient: [],
    date: { type: Date, default: Date.now },
});

mongoose.model('Order', OrdersSchema);

