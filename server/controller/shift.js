/**
  * @author - disruptive.pro
  * @desc Employee Operation for the application
**/

var common = require('../helpers/common.js');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var keys = common.constants.keys()
var response = { status: null, success: null, data: null }; // status provide conditions of api request, success states the resultant status of api(boolean), data return data from api
var sess = {}; // common session constant
const helpers = common.helpers;
const messages = common.constants.messages();

module.exports = function (app) {

    //Models Required
     var Ingredients = common.mongoose.model('Ingredients');
     var Order = common.mongoose.model('Order');
     var Category = common.mongoose.model('Category');
     var Product = common.mongoose.model('Product');
     var Shift = common.mongoose.model('Shift');
     var Invoice = common.mongoose.model('Invoice');
     var Table = common.mongoose.model('Table');
     var Employee = common.mongoose.model('Employee');




     app.post('/api/v1/createshift', function (req, res) {
         var shift = new Shift(req.body);
         if (shift) {
             shift.save(shift, function (err, result) {
                 return res.json(result)
             });
         }
         else {
             return res.json(helpers.response(401, false, 0, messages.unauthorized))
         }

     });

  app.post('/api/v1/endshift', function (req, res) {
      Shift.findByIdAndUpdate(req.body.SHID,{endtime: new Date()}).exec()
        .then(function (shift, err) {
                if (err) {
                    console.log('error')
                    return res.json({ message: 'error' })
                }
                else {
                    var invoices = shift.invoices
                        Invoice.update({_id:{$in:invoices}}, {$set:{invoiceStatus : "ARCHIVED"}},{multi:true}).exec()
                          .then(function (result, err) {
                            if (err)
                                console.log({ message: 'error' });
                            else {
                              console.log('invoice updated');
                              var orders = shift.orders;
                              Order.update({_id:{$in:orders}},{$set:{status : "ARCHIVED"}},{multi:true}).exec()
                                .then(function ( result,err) {
                                  if (err)
                                    console.log('Could not load Document');
                                  else {
                                    console.log('orders updated');
                                    return res.json({ message: 'Update Successfully' });
                                  }
                                });
                            }
                        });

                }
            });
    });


  app.post('/api/v1/insertInvoiceAndOrderInShift', function (req, res) {
      Shift.findById(req.body.shid, function (err, result) {
          if (!result)
              return res.json(new Error('Could not load Document'));
          else {
              // do your updates here
              if (req.body.type == "INVOICE") {
                  result.invoices.push(req.body.id);
              }
              else {
                  result.orders.push(req.body.id);
              }

              result.save(function (err) {
                  if (err) {
                      console.log('error')
                      return res.json({ message: 'error' })
                  }
                  else {
                      Shift.findById(req.body.shid, function (err, result) {
                          if (!result)
                              return next(new Error('Could not load Document'));
                          else {
                              return res.json(result);
                          }
                      });
                  }
              });
          }
      });

  });

    app.post('/api/get/getshiftWithOutLogout', function (req, res) {

        Shift.find({restaurant: req.body.id, endtime:null },function (err, result) {
            if (err) {
                console.log(err);
                res.json(0);
            } else {
                if (result.length > 0)
                    res.json({ isopen: true, shift: result[0] });
                else
                    res.json({ isopen: false, shift: null });
            }
        });
    });

} // employee module ENDS
