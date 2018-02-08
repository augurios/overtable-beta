var common = require('../helpers/common');

/*Models*/
const userModel = require('../model/Users');
const permissionModel = require('../model/Permission');
const UserLogged = require('../model/UserLogged');
const Employee = require('../model/Employee');
const Invoice = require('../model/Invoice');
const Table = require('../model/Table');
const Category = require('../model/Category');
const Slides = require('../model/Sides');
const Ingredients = require('../model/Ingredients');
const Product = require('../model/Product');
const Order = require('../model/Order');
const Shift = require('../model/Shift');
const Connection = require('../model/Connection');
const Room = require('../model/Room');

module.exports = function (app) {

  //global constants/paths
  app.get('/auth/getpaths', function (req, res) {
       res.json(common.constants.define());
  });

   require('../controller/init')(app);
   require('../controller/employee')(app);
   require('../controller/invoice')(app);
   require('../controller/product')(app);
   require('../controller/order')(app);
   require('../controller/shift')(app);
  //application to send every request to index.html
  
  app.get('*', function (req, res) {
 	 res.sendFile('./public/template/index.html'); 
  });
}