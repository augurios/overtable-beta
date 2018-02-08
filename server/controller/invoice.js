/**
  * @author - disruptive.pro
  * @desc Employee Operation for the application
**/

var common = require('../helpers/common.js');
var keys = common.constants.keys()
var response = { status: null, success: null, data: null }; // status provide conditions of api request, success states the resultant status of api(boolean), data return data from api
var sess = {}; // common session constant
const helpers = common.helpers;
const messages = common.constants.messages();
function tokenVerify(req,res) {
  return new Promise(function (resolve,reject) {
    if(req.headers['x-access-token']) {
      common.jwt.verify(req.headers['x-access-token'], keys.sessionkey, function (err, decoded) {
        if (err) {
          return reject({success: false, message: 'Failed to authenticate token.'});
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          return resolve();
        }
      });
    } else { return reject({error:'No token provided'})}
  })
}

module.exports = function (app) {

    //Models Required
    var Invoice = common.mongoose.model('Invoice');
    var Table = common.mongoose.model('Table');
    var Employee = common.mongoose.model('Employee');
    var Order = common.mongoose.model('Order');

    app.get('/api/v1/getBillno', function (req, res) {
        tokenVerify(req, res)
          .then(function () {
              Invoice.find({ restaurant: req.decoded._id })
                .exec()
                .then(function (result, err) {
                    res.send({ billNo: result.length })
                })
          })
    });

    app.post('/api/v1/invoice', function (req, res) {


        Invoice.find({}).exec(function (err, result) {
            if (err) {
                console.log(err);
                res.json(0);
            } else {
                if (!result) {

                }
                //req.body.invoiceNumber = result[result.length - 1] == undefined ? 1 : result[result.length - 1].invoiceNumber + 1;
               if(req.body.tables && req.body.tables._id===-1) {
                  delete req.body.tables;
               }
                var invoice = new Invoice(req.body);

                if (invoice) {
                    invoice.save( function (err, result) {
                        console.log(result);
                        return res.json(result)
                    });
                }
                else {
                    return res.json(helpers.response(401, false, 0, messages.unauthorized))
                }

            }


         });



    })

    app.post('/api/v1/splitinvoice', function (req, res) {
        var invoice = new Invoice(req.body.splitInvoice);

        if (invoice) {
            invoice.save(invoice, function (err, result) {
                console.log(result);
                return res.json(result);
            });
        }
        else {
            return res.json(helpers.response(401, false, 0, messages.unauthorized))
        }
    })

    app.post('/api/v1/updateinvoice', function (req, res) {

        Invoice.findById(req.body._id, function (err, result) {
                if (!result)
                    return next(new Error('Could not load Document'));
                else {
                    // do your updates here
                    result.clientName = req.body.clientName;
                    result.save(function (err) {
                        if (err) {
                            console.log('error')
                            return res.json({ message: 'error' })
                        }
                        else {
                            console.log('success')
                            return res.json({ message: 'Update Successfully' })
                        }
                    });
                }
            });


    })

    app.post('/api/v1/addOrderToInvoice', function (req, res) {
            Invoice.findById(req.body._id, function (err, result) {
                if (!result)
                    return next(new Error('Could not load Document'));
                else {
                    // do your updates here
                    result.orders.push(req.body.productId);
                    result.save(function (err) {
                        if (err) {
                            console.log('error')
                            return res.json({ message: 'error' })
                        }
                        else {
                            console.log('success')
                            return res.json({ message: 'Update Successfully' })
                        }
                    });
                }
            });
        });

    app.post('/api/v1/updateinvoicestatus', function (req, res) {
        Invoice.findOneAndUpdate({ _id: req.body._id }, req.body, function (err, result) {
                if (err) {
                    console.log('error')
                    return res.json({ Error: 'Unexpected error' })
                }
                else {
                    console.log('success')
                    return res.json({ message: 'Update Successfully' })
                }
            });
    });

    app.post('/api/v1/updateinvoicestatusbyid', function (req, res) {
         Invoice.findById(req.body._id, function (err, result) {
                if (err) {
                    console.log('error')
                    return res.json({ Error: 'Unexpected error' })
                }
                else {
                      result.invoiceStatus = req.body.invoiceStatus;
                result.save(function (err) {
                    if (err) {
                        console.log('error')
                        return res.json({ message: 'error' })
                    }
                    else {
                        console.log('success')
                        return res.json({ message: 'Update Successfully' })
                    }
                });
                }
            });
    });

    app.post('/api/v1/splitinvoicestatus', function (req, res) {
        Invoice.findById(req.body._id, function (err, result) {
            if (!result)
                return next(new Error('Could not load Document'));
            else {
                // do your updates here
                result.invoiceStatus = req.body.invoiceStatus;
                result.save(function (err) {
                    if (err) {
                        console.log('error')
                        return res.json({ message: 'error' })
                    }
                    else {
                        console.log('success')
                        return res.json({ message: 'Update Successfully' })
                    }
                });
            }
        });
    });

    app.post('/api/v1/updatetable', function (req, res) {

        Invoice.findById(req.body._id, function (err, result) {
            if (!result)
                return next(new Error('Could not load Document'));
            else {
                // do your updates here
                result.tables = req.body.tables;
                result.save(function (err) {
                    if (err) {
                        console.log('error')
                        return res.json({ message: 'error' })
                    }
                    else {
                        console.log('success')
                        return res.json({ message: 'Update Successfully' })
                    }
                });
            }
        });


    })

    app.post('/api/invoice/syncInvoiceMetaData', function (req, res) {
        Invoice.find({clientId:req.body.clientId}, function (err, results) {
            if (!results)
                return res.json({ message: 'error' })
            else {
                var result = results[0];
                result.clientName = req.body.clientName;
                result.servedby = req.body.servedby;
                result.people = req.body.people;
                result.tables = req.body.tables;
                result.save(function (err) {
                    if (err) {
                        console.log('error')
                        return res.json({ message: 'error' })
                    }
                    else {
                        console.log('success')
                        return res.json({ message: 'Update Successfully' })
                    }
                });
            }
        });
    })

    app.post('/api/v1/waiter', function (req, res) {

        Invoice.findById(req.body._id, function (err, result) {
            if (!result)
                return next(new Error('Could not load Document'));
            else {
                // do your updates here
                result.servedby = req.body.servedby;
                result.save(function (err) {
                    if (err) {
                        console.log('error')
                        return res.json({ message: 'error' })
                    }
                    else {
                        console.log('success')
                        return res.json({ message: 'Update Successfully' })
                    }
                });
            }
        });


    })


    app.post('/api/v1/closeInvoice', function (req, res) {
        console.log("on closing invoice: ", req.body);
        Invoice.find({ clientId: req.body.clientId }, function (err, invoices) {
            if (!invoices)
                return res.json({ Error: 'Unexpected error' })
            else {
                var result = invoices[0];
                // do your updates here
                result.invoiceStatus = "CLOSED";
                result.iscash = req.body.iscash;
                result.save(function (err) {
                    if (err) {
                        console.log('error')
                        return res.json({ Error: 'Unexpected error' })
                    }
                    else {
                        console.log('success')
                        return res.json({ message: 'Update Successfully' })
                    }
                });
            }
        });
    });



    app.get('/api/get/invoice', function (req, res) {

        Invoice.find({ invoiceStatus: { $ne: "ARCHIVED" } })
       .populate('tables')
       .populate('servedby')
       .populate('orders')
       //.populate('orders.product')
       .exec(function (err, result) {
         if (err) {
             console.log(err);
             res.json(0);
         }
         var options = {
             path: 'orders.product',
             model: 'Product'
         };
         Invoice.populate(result, options, function (err, tempresult) {

             var roomoptions = {
                 path: 'tables.roomid',
                 model: 'Room'
             };
             Invoice.populate(tempresult, roomoptions, function (err, projects) {

                 res.json(projects);

             });
         });

         //return res.json(result);
     })

        //Invoice.find({}, function (err, result) {
        //    if (err) {
        //        console.log(err);
        //        res.json(0);
        //    }
        //         return res.json(result);
        //    });

    })

    app.get('/api/get/tables', function (req, res) {
        Table.find({})
        .populate('roomid')
        .exec(function (err, resulttemp) {
            if (err) {
                console.log(err);
                return res.json(0);
            } else {
                return res.json(resulttemp);
                //var options = {
                //    path: 'roomid',
                //    model: 'Room'
                //};
                //Table.populate(resulttemp, options, function (err, result) {
                //    console.log("returning table data");
                //    return res.json(result);
                //});
            }
        });
    })

    app.get('/api/get/employee', function (req, res) {
        Employee.find({ active: 1, restaurant: req.body.restaurant }, function (err, result) {
            if (err) {
                console.log(err);
                res.json(0);
            }
            return res.json(result);
        });
    })

    app.post('/api/v1/finishsplit', function (req, res) {
          Invoice.findOneAndUpdate({ _id: req.body._id }, req.body, function (err, result) {
            if (err) {
                console.log('error')
                return res.json({ message: 'error' })
            }
            else {
                for (var i = 0; i < req.body.orders.length; i++) {
                    Order.findOneAndUpdate({ _id: req.body.orders[i]._id }, req.body.orders[i], function (err, result) {
                        if (err) {
                            console.log('error')
                            return res.json({ message: 'error' })
                        }
                        else {
                            console.log('success')

                        }
                    });
                }
                return res.json({ message: 'Update Successfully' })
            }
        });
    });
} // employee module ENDS
