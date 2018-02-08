var common = require('../helpers/common.js');
var keys = common.constants.keys()
var response = { status  : null, success : null, data : null }; // status provide conditions of api request, success states the resultant status of api(boolean), data return data from api
var sess = {}; // common session constant
const helpers = common.helpers;
const messages = common.constants.messages();


module.exports = function (app, sessionMiddleware) {


    //Models Required
    var Invoice = common.mongoose.model('Invoice');
    var Employee = common.mongoose.model('Employee');
    var Order = common.mongoose.model('Order');

    var io = require('socket.io')(app);

    io.use(function (socket, next) {

        sessionMiddleware(socket.request, socket.request.res, next);
    });

    io.on('connection', function (socket) {



        var currentTime = new Date();
        console.log('Connection established', currentTime);

        socket.emit('init', {
            name: 'Daniel',
            desc: 'Create this for socket experimentation'
        })


        socket.on('dbSync:online', function (data) {
            console.log(data, new Date())
        })

        socket.on('dbSync:offline', function (data) {
            console.log(data, new Date())
        })

        // Emplyoee Session sync

        socket.on('auth:online', function (data) {
            console.log("session sync", data.data.val)
            // console.log(data.data.val)
            // socket.request.session.employee = {}
            socket.request.session.employee = data.data.val

            socket.request.session.save(function (err) {
                socket.request.session.reload(function (err) {
                    socket.emit('authresponse:online', helpers.response(200, true, 1, messages.syncesessionuser));
                });
            });




        });

        socket.on('authemployeeout:online', function (data) {

            console.log("session sync authemployeeout", data)
            // console.log(data.data.val)
            // socket.request.session.employee = {}

            delete socket.request.session.employee;
            socket.request.session.save(function (err) {
                socket.request.session.reload(function (err) {
                    socket.emit('authresponse:online', helpers.response(200, true, 1, messages.syncesessionuser));
                });
            });




        });

        // Emplyoee profile sync

        socket.on('emplyeeprofile:online', function (data) {

            console.log("Employee sync")

            var dumpdata = data.data.dump

            Employee.find({ _id: dumpdata._id }, function (err, users) {
                if (err) {
                    socket.emit('emplyeeprofilereponse:online', helpers.response(403, false, 0, err));
                }
                else {
                    var updated_user = users[0];

                    updated_user.firstname = dumpdata.firstname
                    updated_user.lastname = dumpdata.lastname
                    updated_user.dateofbirth = dumpdata.dateofbirth
                    updated_user.phone = dumpdata.phone
                    updated_user.pin = dumpdata.pin
                    updated_user.email = dumpdata.email
                    updated_user.position = dumpdata.position
                    updated_user.save(function (err, employee) {
                        if (err) {
                            console.log(err);
                            socket.emit('emplyeeprofilereponse:online', helpers.response(403, false, 0, messages.updatefailed));
                            //return res.json(helpers.response(403,false,0,messages.updatefailed)) 
                        }
                        socket.emit('emplyeeprofilereponse:online', helpers.response(200, true, 1, messages.updateSuccess));
                        // return res.json(helpers.response(200,true,1,messages.loginsuccessful))               
                    })


                }
            });

        });

        var sockets = [];
        //connect user and set the restaurant id and employee id

        //raise the signal when user click on placeorder and pass the order and sent the same order to the kitchen user 

        socket.on('test', function (data) {
            console.log("recieved socket");
            console.log(data);
        })



        AddUserSocketTOCache = function (userId, socket) {
            if (connections.length > 0) {
                var findDate = connections;
                var isUserConnectionExist = false;
                var isSocketExist = false;

                for (var count = 0; count < connections.length; count++) {
                    var con1 = connections[count];
                    if (con1.UserId == userId) {
                        isUserConnectionExist = true;
                        for (var i = 0; i < connections[count].Sockets.length; i++) {
                            if (con1.Sockets[i].id == socket.id) {
                                isSocketExist = true;
                            }
                        }
                        if (!isSocketExist) {
                            connections[count].Sockets.push(socket);

                        }
                    }
                }

                if (!isUserConnectionExist) {
                    connections.push({
                        UserId: userId,
                        Sockets: [socket]
                    });
                }
            }
            else {
                var obj = {
                    UserId: userId,
                    Sockets: [socket]
                }
                connections.push(obj);
            }
        }

        DeleteUserSocketTOCache = function (socket) {
            if (connections.length > 0) {
                for (var count = 0; count < connections.length; count++) {
                    var con1 = connections[count];
                    if (connections[count].Sockets != undefined) {
                        for (var i = 0; i < connections[count].Sockets.length; i++) {
                            if (con1.Sockets[i].id == socket.id) {
                                isSocketExist = true;
                                connections[count].Sockets.splice(i, 1);
                                if (connections[count].Sockets.length == 0) {
                                    connections.splice(count, 1);
                                }
                                break;
                            }

                        }
                    }
                }


            }

        }

        broadCastToClient = function (memberId, messageToBroadCast, eventName) {
            for (var count = 0; count < connections.length; count++) {
                var con1 = connections[count];
                if (con1.UserId == memberId) {
                    for (var i = 0; i < connections[count].Sockets.length; i++) {
                        console.log("using socket id -" + connections[count].Sockets[i].id + " and member id -" + memberId);
                        connections[count].Sockets[i].emit(eventName, messageToBroadCast)
                    }
                }
            }
        }

        socket.on('connectUser', function (userId) {
            AddUserSocketTOCache(userId, socket)
        });

        socket.on('shiftClosed', function (sokectObj) {
            //AddUserSocketTOCache(userId, socket)
            var resId = sokectObj.ResId;
            var shiftId = sokectObj.ShiftId;
            Employee.find({ restaurant: resId }).exec(function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    var userArray = result;
                    for (var i = 0; i < userArray.length; i++) {
                        try {
                            broadCastToClient(userArray[i]._id.toString(), sokectObj, 'onShiftClosed');
                        }
                        catch (err) {
                        }
                    }
                }
            });
        });

        socket.on('changeInvoiceMetaData', function (sokectObj) {
            //AddUserSocketTOCache(userId, socket)
            var resId = sokectObj.ResId;
            Employee.find({ restaurant: resId }).exec(function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    var userArray = result;
                    for (var i = 0; i < userArray.length; i++) {
                        try {
                            broadCastToClient(userArray[i]._id.toString(), sokectObj, 'onChangeInvoiceMetaData');
                        }
                        catch (err) {
                        }
                    }
                }
            });
        });

        socket.on('newInvoice', function (sokectObj) {
            //AddUserSocketTOCache(userId, socket)
            var resId = sokectObj.ResId;
            Employee.find({ restaurant: resId }).exec(function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    var userArray = result;
                    for (var i = 0; i < userArray.length; i++) {
                        try {
                            broadCastToClient(userArray[i]._id.toString(), sokectObj, 'onNewInvoice');
                        }
                        catch (err) {
                        }
                    }
                }
            });
        });


        socket.on('invoiceTableChange', function (sokectObj) {
            //AddUserSocketTOCache(userId, socket)
            var resId = sokectObj.ResId;
            Employee.find({ restaurant: resId }).exec(function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    var userArray = result;
                    for (var i = 0; i < userArray.length; i++) {
                        try {
                            broadCastToClient(userArray[i]._id.toString(), sokectObj, 'onInvoiceTableChange');
                        }
                        catch (err) {
                        }
                    }
                }
            });
        });


        socket.on('invoiceClose', function (sokectObj) {
            //AddUserSocketTOCache(userId, socket)
            var resId = sokectObj.ResId;
            Employee.find({ restaurant: resId }).exec(function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    var userArray = result;
                    for (var i = 0; i < userArray.length; i++) {
                        try {
                            broadCastToClient(userArray[i]._id.toString(), sokectObj, 'onInvoiceClose');
                        }
                        catch (err) {
                        }
                    }
                }
            });
        });

        socket.on('changeInvoiceOrders', function (sokectObj) {
            //AddUserSocketTOCache(userId, socket)
            var resId = sokectObj.ResId;
            Employee.find({ restaurant: resId }).exec(function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    var userArray = result;
                    for (var i = 0; i < userArray.length; i++) {
                        try {
                            broadCastToClient(userArray[i]._id.toString(), sokectObj, 'onChangeInvoiceOrders');
                        }
                        catch (err) {
                        }
                    }
                }
            });
        });


        socket.on('orderPlaced', function (order) {
            //AddUserSocketTOCache(userId, socket)

            var resId = order.ResId;

            Order.findById(order.Order._id)
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
                   //res.json(projects);

                   //return res.json(result);
                   var orderObj = projects;

                   Employee.find({ restaurant: resId }).exec(function (err, result) {
                       if (err) {
                           console.log(err);

                       } else {

                           var userArray = result;
                           for (var i = 0; i < userArray.length; i++) {
                               try {
                                   broadCastToClient(userArray[i]._id.toString(), orderObj, 'onOrderPlaced');
                               }
                               catch (err) {

                               }
                           }
                       }


                   });
                   //get all the user based on restaurant
                   //loop on all the user and broadcasrtt message 
               })
           })


        });

        socket.on('orderStarted', function (orderId) {

            Invoice.findById(orderId.invoiceId, function (err, invoice) {
                if (!invoice)
                    return console.log('Could not load Document');
                else {
                    var socObj = { INV: invoice, orderId: orderId };


                    Employee.find({}).exec(function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            var userArray = result;
                            for (var i = 0; i < userArray.length; i++) {
                                try {
                                    broadCastToClient(userArray[i]._id.toString(), socObj, 'onOrderStarted');
                                }
                                catch (err) {
                                    console.log(err)
                                }
                            }
                        }
                    });
                }
            });
        });

        socket.on('orderCompleted', function (orderId) {
            Employee.find({}).exec(function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    var userArray = result;
                    for (var i = 0; i < userArray.length; i++) {
                        try {
                            broadCastToClient(userArray[i]._id.toString(), orderId, 'onOrderCompleted');
                        }
                        catch (err) { }
                    }
                }
            });
        });

    })
}
function insertDate(obj) {
    var connectionObj = new Connections(obj);
    if (connectionObj) {
        connectionObj.save(connectionObj, function (err, result) {
            console('Update Successfully');
        });
    }
    else {
        console('error');
    }
}

 function updateDate(obj) {
    Employee.findOneAndUpdate({ _id: obj._id }, obj, function (err, result) {
        if (err) {
            console.log('error')
            
        }
        else {
            console('Update Successfully');
        }

    });
}
