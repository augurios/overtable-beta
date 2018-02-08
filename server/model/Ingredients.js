var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');


var IngredientsSchema = new mongoose.Schema({
    Name: { type: String },
    Cost: { type: Number },
    UnitType: { type: String },
    Quantity: { type: Number },
    created_at:  { type : Date, default: Date.now },
    updated_at:  { type : Date, default: Date.now },
    created_by: String,
    updated_by: String,
    isactive: { type: Number, default: 1 },
    message: { type: String },
    Merma: { type: String },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    clientId: { type: String },
    Edits:[]
    });

mongoose.model('Ingredients', IngredientsSchema);

