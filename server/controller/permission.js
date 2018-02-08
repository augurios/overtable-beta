/**
  * @author - disruptive.pro
  * @desc Authenticated Users Operation for the application
  * @model - User.js
**/

var common = require('../helpers/common.js');
var keys = common.constants.keys()
var response = { status  : null, success : null, data : null }; // status provide conditions of api request, success states the resultant status of api(boolean), data return data from api
var sess = {}; // common session constant
sess.user = null // set session constant user(int *usually id*) is set to null
const helpers = common.helpers;
const messages = common.constants.messages();

module.exports = function (app) {

//Models Required
var User = common.mongoose.model('User');
var Permission = common.mongoose.model('Screens');

app.post('/api/v1/check_permission', function (req, res) {
sess = req.session;
var current_role =  sess.role;
console.log(req.body.pos)
var screen_path = req.body.pos
Permission.find({"users" : {"$in" : [current_role]},"screen_path":screen_path}, function(err, data){
       if (err) { console.log(err); res.json(0); }
       if(data.length > 0){
        res.json(1)
       }
        else{
          res.json(0)
        }
       
    });
});

/*app.get('/api/create_permsion', function (req, res) {

 var data = new Permission();

    data.screen_name = "Manage Users";
    data.screen_path = "/user";
    data.users =["admin","restaurant"];
    data.created_at =  Date.now();
    data.updated_at =  Date.now();
    data.created_by =  1;
    data.updated_by = 1;
    data.active = 1;

 data.save(function(err, response){
  console.log(err)
 });
 
});*/

} // user module ENDS
