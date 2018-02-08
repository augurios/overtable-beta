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
    var Ingredients = common.mongoose.model('Ingredients');
    var Order = common.mongoose.model('Order');
    var Category = common.mongoose.model('Category');
    var Product = common.mongoose.model('Product');
    var Sides = common.mongoose.model('Sides');
    var Invoice = common.mongoose.model('Invoice');
    var Table = common.mongoose.model('Table');
    var Employee = common.mongoose.model('Employee');
    var Shift = common.mongoose.model('Shift');




    app.post('/api/v1/order', function (req, res) {
        //console.log(result);
        //var o = result.toJSON();
        Invoice.find({ clientId: req.body.invoiceId }, function (err, invcs) {
            if (!invcs)
                return res.json({ message: 'error' })
            else {
                var invc = invcs[0];
                // do your updates here
              req.body.userId = invc.restaurant.toString();
                var order = new Order(req.body);
                order.invoiceId = invc.id.toString();
                if (order) {
                    order.save(order, function (err, result) {
                        invc.invoiceStatus = "STARTED";
                        invc.orders.push(result.id);
                        invc.save(function (err) {
                            if (err) {
                                console.log('error')
                                return res.json({ message: 'error' })
                            }
                            else {
                                console.log('success')
                                return res.json( result )
                            }
                        });
                    });
                }
            }
        });
    });

    app.post('/api/inventory/restoreProduct', function (req, res) {
        Product.findById(req.body.productId, function (err, result) {
            if (!result)
                return res.json({ message: 'Could not load Document' });
            else {
                // do your updates here
                result.Quantity = parseInt(result.Quantity) + parseInt(req.body.quanity);
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

    app.post('/api/inventory/reduceProduct', function (req, res) {
        Product.findById(req.body.productId, function (err, result) {
            if (!result)
                return res.json({ message: 'Could not load Document' });
            else {
                // do your updates here
                result.Quantity = parseInt(result.Quantity) - 1;
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

    app.post('/api/inventory/restoreInventory', function (req, res) {
        var productId = req.body.productId;
        Product.find({ "_id": productId })
        .populate('Ingradients.name')
        .populate('Sides')
        .exec(function (err, sideorders) {
            if (err) {
                console.log(err);
                res.json(0);
            }


            var sufficientIngrdeitns = true;
            var sufficientSides = true;

            var sideoptions = {
                path: 'Sides.Ingradients.name',
                model: 'Ingredients'
            };
            Product.populate(sideorders, sideoptions, function (err, projects) {

                for (var pcount = 0; pcount < projects.length; pcount++) {
                    var ods = projects[pcount].toJSON().Ingradients;
                    for (var ocont = 0; ocont < ods.length; ocont++) {
                        //use quatity logic here
                        ods[ocont].name.Quantity = parseInt(ods[ocont].name.Quantity) + parseInt(ods[ocont].quantity) * parseInt(req.body.quanity);
                        Ingredients.findByIdAndUpdate(ods[ocont].name._id, { $set: { Quantity: ods[ocont].name.Quantity } }, { new: true }, function (err, ing) {
                            if (err) {
                                console.log('error')
                            }
                            else {
                                console.log('success')
                            }
                        });
                    }
                }

                //for (var pcount = 0; pcount < projects.length; pcount++) {
                //    var ods = projects[pcount].toJSON().Sides[0].Ingradients;
                //    for (var ocont = 0; ocont < ods.length; ocont++) {
                //        ods[ocont].name.Quantity = parseInt(ods[ocont].name.Quantity) + parseInt(ods[ocont].quantity);
                //        Ingredients.findOneAndUpdate({ _id: ods[ocont].name._id }, ods[ocont].name, function (err, result) {
                //            if (err) {
                //                console.log('error')

                //            }
                //            else {
                //                console.log('success')

                //            }
                //        });
                //    }
                //}

                res.send({ message: 'Inventory added successfully' });

            });

        });

    });

    app.post('/api/inventory/reduceInventory', function (req, res) {
        var productId = req.body.productId;
        Product.find({ "_id": productId })
        .populate('Ingradients.name')
        .populate('Sides')
        .exec(function (err, sideorders) {

            if (err) {
                console.log(err);
                res.json(0);
            }


            var sufficientIngrdeitns = true;
            var sufficientSides = true;

            var sideoptions = {
                path: 'Sides.Ingradients.name',
                model: 'Ingredients'
            };

            Product.populate(sideorders, sideoptions, function (err, projects) {
                for (var pcount = 0; pcount < projects.length; pcount++) {
                    var ods = projects[pcount].toJSON().Ingradients;
                    for (var ocont = 0; ocont < ods.length; ocont++) {
                        if (ods[ocont].name.Quantity >= ods[ocont].quantity) {

                        }
                        else {
                            sufficientIngrdeitns = false;
                        }
                    }
                }

                //for (var pcount = 0; pcount < projects.length; pcount++) {
                //    var ods = projects[pcount].toJSON().Sides[0].Ingradients;
                //    for (var ocont = 0; ocont < ods.length; ocont++) {
                //        if (ods[ocont].name.Quantity > ods[ocont].quantity) {

                //        }
                //        else {
                //            sufficientSides = false;
                //        }
                //    }
                //}

                if (sufficientIngrdeitns && sufficientSides) {
                    for (var pcount = 0; pcount < projects.length; pcount++) {
                        var ods = projects[pcount].toJSON().Ingradients;
                        for (var ocont = 0; ocont < ods.length; ocont++) {
                            ods[ocont].name.Quantity = parseInt(ods[ocont].name.Quantity) - parseInt(ods[ocont].quantity);
                            Ingredients.findByIdAndUpdate(ods[ocont].name._id, { $set: { Quantity: ods[ocont].name.Quantity } }, { new: true }, function (err, ing) {
                                if (err) {
                                    console.log("Error in updating the inventory");
                                    console.log(err);
                                    console.log('error')
                                }
                                else {
                                    console.log('success')
                                }
                            });
                        }
                    }

                    //for (var pcount = 0; pcount < projects.length; pcount++) {
                    //    var ods = projects[pcount].toJSON().Sides[0].Ingradients;
                    //    for (var ocont = 0; ocont < ods.length; ocont++) {
                    //        ods[ocont].name.Quantity = parseInt(ods[ocont].name.Quantity) - parseInt(ods[ocont].quantity);
                    //        Ingredients.findOneAndUpdate({ _id: ods[ocont].name._id }, ods[ocont].name, function (err, result) {
                    //            if (err) {
                    //                console.log('error')

                    //            }
                    //            else {
                    //                console.log('success')

                    //            }
                    //        });
                    //    }
                    //}

                    res.send({ message: 'Inventory subtracted successfully' });
                }
                else {
                    // res.status(400).send({ message: 'Inventory does not have required ingrdients' });
                    res.json({ error: "Inventory does not have required ingrdients", order: req.body });
                }
            });

        });

    });

    app.get('/api/get/orders', function (req, res) {
        console.log("orders api");
        console.log(req.decoded);
        tokenVerify(req, res)
          .then(function () {
              Order.find({ status: { $ne: "COMPLETED" } })
                .populate('product')
                .populate('invoiceId')
                .exec(function (err, result) {
                    if (err) {
                        console.log(err);
                        res.json(0);
                    }

                    var options = {
                        path: 'invoiceId.tables',
                        model: 'Table'
                    };
                    Order.populate(result, options, function (err, projects) {
                        res.json(projects);
                    })
                    //return res.json(result);
                })
          });
    });

    app.post('/api/v1/updateOrder', function (req, res) {

        Order.update({ "_id": req.body._id }, { status: req.body.status }, function (err, result) {
            if (!result)
                return (new Error('Could not load Document'));
            else {
                return res.json({ message: 'Update Successfully' })
            }
        });

    });

    app.post('/api/v1/updateOrderStatus', function (req, res) {

        Order.findOneAndUpdate({ _id: req.body._id }, req.body, function (err, result) {
            if (err) {
                console.log('error')
                res.json({ message: 'error' })
            }
            else {
                res.json({ message: 'Update Successfully' })
            }

        });

    });

    app.post('/api/v1/updateStatusOrder', function (req, res) {
        var product;
        Order.find({ "invoiceId": req.body._id })
     .populate('product')
     .exec(function (err, sideorders) {

         if (err) {
             console.log(err);
             res.json(0);
         }


         var sufficientIngrdeitns = true;
         var sufficientSides = true;

         var sideoptions = {
             path: 'product.Sides',
             model: 'Sides'
         };
         Order.populate(sideorders, sideoptions, function (err, orders) {

             var options = {
                 path: 'product.Ingradients.name',
                 model: 'Ingredients'
             };
             Order.populate(orders, options, function (err, projects) {

                 for (var pcount = 0; pcount < projects.length; pcount++) {
                     var ods = projects[pcount].toJSON().product.Ingradients;
                     for (var ocont = 0; ocont < ods.length; ocont++) {
                         if (ods[ocont].name.Quantity > ods[ocont].quantity) {

                         }
                         else {
                             sufficientIngrdeitns = false;
                         }
                     }
                 }

                 //for (var pcount = 0; pcount < projects.length; pcount++) {
                 //    var ods = projects[pcount].toJSON().product.Ingradients;
                 //    for (var ocont = 0; ocnt < ods.length; ocont++) {
                 //        if (ods[i].name.Quantity > ods[i].quantity) {
                 //            //ods[i].name.Quantity = parseInt(ods[i].name.Quantity) - parseInt(ods[i].quantity);
                 //            //var ingredients = new Ingredients(ods[i].name);
                 //            //if (ingredients) {
                 //            //    ingredients.save(ingredients, function (err, result) {
                 //            //        if (err) {
                 //            //            return res.json(err)
                 //            //        }
                 //            //        else {
                 //            //            console.log(result);
                 //            //            return res.json(result)
                 //            //        }
                 //            //    });
                 //            //}
                 //        }
                 //        else {
                 //            sufficientSides = false;
                 //        }
                 //    }
                 //}

                 if (sufficientIngrdeitns) {
                     for (var pcount = 0; pcount < projects.length; pcount++) {
                         var ods = projects[pcount].toJSON().product.Ingradients;
                         for (var ocont = 0; ocont < ods.length; ocont++) {
                             ods[ocont].name.Quantity = parseInt(ods[ocont].name.Quantity) - parseInt(ods[ocont].quantity);
                             Ingredients.findOneAndUpdate({ _id: ods[ocont].name._id }, ods[ocont].name, function (err, result) {
                                 if (err) {
                                     console.log('error')

                                 }
                                 else {
                                     console.log('success')

                                 }
                             });
                         }
                     }

                     //for (var pcount = 0; pcount < projects.length; pcount++) {
                     //    var ods = projects[pcount].toJSON().product.Ingradients;
                     //    for (var ocont = 0; ocnt < ods.length; ocont++) {
                     //        ods[i].name.Quantity = parseInt(ods[i].name.Quantity) - parseInt(ods[i].quantity);
                     //        var ingredients = new Ingredients(ods[i].name);
                     //        if (ingredients) {
                     //            ingredients.save(ingredients, function (err, result) {
                     //                console.log("ingrdenitne updated")
                     //            });
                     //        }
                     //    }
                     //}

                     Order.update({ "invoiceId": req.body._id }, { status: req.body.status }, { multi: true }, function (err, result) {
                         if (!result)
                             return (new Error('Could not load Document'));
                         else {
                             return res.json({ message: 'Update Successfully' })
                         }
                     });
                 }
                 else {
                     res.json({ error: "Inventory does not have required ingrdients" });
                 }

             });

         });

     });

    });
    app.post('/api/v1/cancelOrder', function (req, res) {

        //Order.deleteMany({ "invoiceId": req.body._id }, function (err, result) {
        //    if (!result)
        //        return (new Error('Could not load Document'));
        //    else {
        //        // do your updates here3
        //        return res.json({ message: 'Update Successfully' })

        //    }
        //});

        return res.json({ message: 'Update Successfully' })
    });

    app.post('/api/v1/removeOrderFromInvoice', function (req, res) {
        Invoice.find({ clientId: req.body.invoiceId }, function (err, invcsarray) {
            if (!invcsarray)
                return res.json({ message: 'error' })
            else {
                var invcsingle = invcsarray[0];
                req.body.invoiceId = invcsingle.id.toString();

                Order.findOne({
                    "invoiceId": req.body.invoiceId,
                    "clientId": req.body.clientId
                }).exec(function (err, orderModel) {
                    var orderdId = orderModel.id;

                    Invoice.findById(req.body.invoiceId, function (err, invc) {
                        if (!invc)
                            return res.json({ message: 'error' })
                        else {

                            for (var odCounter = 0; odCounter < invc.orders.length; odCounter++) {
                                if (invc.orders[odCounter] == orderdId) {
                                    invc.orders.splice(odCounter, 1);
                                }
                            }

                            invc.save(function (err) {
                                if (err) {
                                    console.log('error')
                                    return res.json({ message: 'error' })
                                }
                                else {
                                    Order.findByIdAndRemove(orderdId, function (err, result) {
                                        // We'll create a simple object to send back with a message and the id of the document that was removed
                                        // You can really do this however you want, though.

                                        return res.json({ message: 'Update Successfully' })
                                    });

                                }
                            });
                        }
                    });



                });
            }
        });
    });

    app.post('/api/v1/addOrderToInvoice', function (req, res) {
        Invoice.find({ clientId: req.body.item.invoiceId }, function (err, invcs) {
            if (!invcs)
                return res.json({ message: 'error' })
            else {
                var invc = invcs[0];
                // do your updates here
                var order = new Order(req.body.item);
                order.invoiceId = invc.id.toString();
                if (order) {
                    order.save(order, function (err, result) {
                        invc.invoiceStatus = "STARTED";
                        invc.orders.push(result.id);
                        invc.save(function (err) {
                            if (err) {
                                console.log('error')
                                return res.json({ message: 'error' })
                            }
                            else {
                                console.log('success')
                                return res.json({ result })
                            }
                        });
                    });
                }
            }
        });
    });


    app.post('/api/v1/addOrderToSplittedInvoice', function (req, res) {
        Invoice.find({ clientId: req.body.item.invoiceId }, function (err, invcs) {
            if (!invcs)
                return res.json({ message: 'error' })
            else {
                var invc = invcs[0];
                // do your updates here
                var order = new Order(req.body.item);
                order.invoiceId = invc.id.toString();
                if (order) {
                    order.save(order, function (err, result) {
                        invc.invoiceStatus = "STARTED";
                        invc.orders.push(result.id);
                        invc.save(function (err) {
                            if (err) {
                                console.log('error')
                                return res.json({ message: 'error' })
                            }
                            else {
                                console.log('success')
                                return res.json({ result })
                            }
                        });
                    });
                }
            }
        });
    });


    app.post('/api/v1/setQuantityForInvoice', function (req, res) {
        Invoice.find({ clientId: req.body.obj.invoiceId }, function (err, invcs) {
            if (!invcs)
                return res.json({ message: 'error' })
            else {
                var invc = invcs[0];
                // do your updates here
                req.body.obj.invoiceId = invc.id.toString();

        Order.findOneAndUpdate({ _id: req.body.obj._id }, req.body.obj, function (err, result) {
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


    app.post('/api/v1/removeOrder', function (req, res) {

        Invoice.find({ clientId: req.body.Invoice.clientId }, function (err, invcsarray) {
            if (!invcsarray)
                return res.json({ message: 'error' })
            else {
                var invcsingle = invcsarray[0];
                req.body.invoiceId = invcsingle.id.toString();

                Order.findOne({ "invoiceId": req.body.invoiceId, "clientId": req.body.Order.clientId }).exec(function (err, orderModel) {
                    var orderdId = orderModel.id;

                    Invoice.findById(req.body.invoiceId, function (err, invc) {
                        if (!invc)
                            return res.json({ message: 'error' })
                        else {

                            for (var odCounter = 0; odCounter < invc.orders.length; odCounter++) {
                                if (invc.orders[odCounter] == orderdId) {
                                    invc.orders.splice(odCounter, 1);
                                }
                            }

                            invc.save(function (err) {
                                if (err) {
                                    console.log('error')
                                    return res.json({ message: 'error' })
                                }
                                else {
                                    Order.findByIdAndRemove(orderdId, function (err, result) {
                                        // We'll create a simple object to send back with a message and the id of the document that was removed
                                        // You can really do this however you want, though.

                                        return res.json({ message: 'Update Successfully' })
                                    });

                                }
                            });
                        }
                    });



                });
            }
        });

    })

} // employee module ENDS
