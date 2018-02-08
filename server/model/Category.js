var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');


var CategorySchema = new mongoose.Schema({
    Name: { type: String },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    created_by: String,
    updated_by: String,
    isactive: { type: Number, default: 1 },
    clientId: { type: String },
    ParentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    ParentClientId: String,
});

mongoose.model('Category', CategorySchema);

