(function() {
    'use strict';
    angular
        .module('ordersMonitor')
        .controller('ordersMonitorController', Controller);
    Controller.$inject = ['$scope', '$state', '$rootScope', '$location', 'toaster', '$http', 'SessionService', 'localStorageService', '$uibModal', 'employeeprofileService', 'PATHS', 'PermissionService', 'getEmployee', 'alertservice', 'ordersMonitorServiceFun', '$timeout','utilservice','$stateParams'];
    /* @ngInject */
    function Controller($scope, $state, $rootScope, $location, toaster, $http, SessionService, localStorageService, $uibModal, employeeprofileService, PATHS, PermissionService, getEmployee, alertservice, ordersMonitorServiceFun, $timeout, utilservice, $stateParams) {
        function handleError(err) { }



        var orderType = $stateParams.orderType;

        $scope.getOrderByGroup = function (allOrders) {

            $scope.allOrders = _.filter(allOrders, function (num) {
                if (!num.product.OrderGroup)
                    num.product.OrderGroup='A'
                return num.product.OrderGroup == orderType;
            });
           
        }
        // print setup
        $scope.printOrderEnabled = false;
        if (localStorage.getItem("currentPrinters")) {
            var printers = JSON.parse(localStorage.getItem("currentPrinters"));
            if (printers && printers.Printer2 && printers.Printer2.length > 0) {
                $scope.printerName = printers.Printer2;
                if (printers.printOnOrderComplete) {
                    $scope.printOrderEnabled = true;
                  //  console.log('print on complete enabled');
                } else {
                    $scope.printOnOrderComplete = false;
                  //  console.log('print on complete disabled');
                }
            }
        } else {
            $scope.printOrderEnabled = false;
        }

        $scope.$on('onShiftClosed', function (eve, sokectObj) {
           // console.log(sokectObj);
            $("#shiftCloseModal").modal('show');
            //alert("Shift has been closed by manager, All orders will be archived automcatically");
            for (var i = 0; i < $scope.allOrders.length; i++) {
                $scope.allOrders[i].status = $rootScope.orderStatusmanager.ARCHIVED;
            }
            //$scope.$apply();
            setTimeout(function () {
                window.location = '/employee';
            }, 5000);
        });

        $scope.$on('onOrderPlaced', function (eve, orderDetail) {
            // access opt.a, opt.b
            //alert("capturing  event now");
         //   console.log("getting event", eve, orderDetail);
            orderDetail.orderStatus = true
            if ($scope.allOrders)
                $scope.allOrders.push(orderDetail);
            else {
                $scope.allOrders = [];
                $scope.allOrders.push(orderDetail);
            }
            $scope.$apply();
        });

        $scope.$on('onOrderStarted', function (eve, orderDetails) {
            var order = orderDetails.orderId;
            if ($scope.allOrders) {
                var orderId = order.orderId;
                for (var i = 0; i < $scope.allOrders.length; i++) {
                    if ($scope.allOrders[i]._id == orderId) {
                        $scope.allOrders[i].status = $rootScope.orderStatusmanager.STARTED;
                        //alertservice.showAlert('error', "Failed", "Inventory Doesn't have ingredient to make product...");
                    }
                }
                $scope.$apply();
            }
        });

        $scope.$on('onOrderCompleted', function (eve, orderId) {
            if ($scope.allOrders) {
                for (var i = 0; i < $scope.allOrders.length; i++) {
                    if ($scope.allOrders[i]._id == orderId) {
                        $scope.allOrders[i].status = $rootScope.orderStatusmanager.COMPLETED;
                        //alertservice.showAlert('error', "Failed", "Inventory Doesn't have ingredient to make product...");
                    }
                }
                $scope.$apply();
            }
        });

        $scope.shift = JSON.parse(localStorage.getItem('ShiftUser'));
        $scope.getOrders = function () {

           // console.log(getEmployee.restaurant);
            var fromlocal = true;
            if (fromlocal) {
                $scope.allOrders=[];
                var allOrders=[];
                utilservice.getDocFromPouchDB('ORDERS', true).then(function (data) {
                    utilservice.getDocFromPouchDB('ORDERTODELETE', true).then(function (ORDERTODELETElist) {
                      
                        var deletedOrdersList = [];
                        if (ORDERTODELETElist.isFound) {
                            for (var todelte = 0; todelte < ORDERTODELETElist.underlyingdoc.docdata.length; todelte++) {
                                deletedOrdersList.push(ORDERTODELETElist.underlyingdoc.docdata[todelte].clientId)
                            }
                        }
                        var odlist = [];
                        if (data.isFound) {
                            odlist = data.underlyingdoc.docdata;
                        }
                        allOrders = _.filter(odlist, function (oneord) {
                            return oneord.restaurantId == getEmployee.restaurant && oneord.status != "ARCHIVED"
                            && deletedOrdersList.indexOf(oneord.clientId) == -1;
                        });
                        utilservice.getDocFromPouchDB('INVOICES', true).then(function (invoices) {
                            var invlist = [];
                            if (invoices.isFound)
                                invlist = invoices.underlyingdoc.docdata;

                            function getINVID(order) {
                                var ivid = order.invoiceId;
                                try {
                                    if (order.invoiceId._id)
                                        ivid = order.invoiceId._id;
                                } catch (err) {
                                    ivid = order.invoiceId;
                                }
                                return ivid;
                            }

                            for (var i = 0; i < allOrders.length; i++) {
                                var inv = _.find(invlist, function (oneinv) {
                                    return utilservice.idMatcher(getINVID(allOrders[i]), oneinv);
                                });
                                allOrders[i].invoiceId = inv;
                                allOrders[i].orderStatus = true;
                               
                            }

                            utilservice.getDocFromPouchDB('Product', true).then(function (products) {
                                var productslist = [];
                                if (products.isFound)
                                    productslist = products.underlyingdoc.docdata;

                                function getPROID(order) {
                                    var odid = order.product;
                                    try {
                                        if (order.product._id)
                                            odid = order.product._id;
                                    } catch (err) {
                                        odid = order.product;
                                    }
                                    return odid;
                                }

                                for (var i = 0; i < allOrders.length; i++) {
                                    var pro = _.find(productslist, function (onepro) {
                                        return utilservice.idMatcher(getPROID(allOrders[i]), onepro);
                                    });

                                    allOrders[i].product = pro;
                                    allOrders[i].orderStatus = true;

                                    //if (allOrders[i].product) {
                                    //    var productobj = null;
                                    //    try {
                                    //        if (allOrders[i].product.indexOf('CUSTOM-GENERETED-ID') >= 0) {
                                    //            productobj = _.find(allproduct, function (num) {
                                    //                return num.clientId == allOrders[i].product;
                                    //            });
                                    //        } else {
                                    //            productobj = _.find(allproduct, function (num) {
                                    //                return num._id == allOrders[i].product;
                                    //            });
                                    //        }
                                    //    } catch (dfsdf) {
                                    //        //_id && object
                                    //        if (allOrders[i].product._id) {
                                    //            productobj = _.find(allproduct[i], function (num) {
                                    //                return num._id == allOrders[i].product._id
                                    //            });
                                    //        }
                                    //    }
                                    //    allOrders[i].product = productobj;
                                    //}
                                }

                                $scope.getOrderByGroup(allOrders);
                            });

                        });
                    });
                });

            } else {
                var time = new Date();
                if ($rootScope.online) {
                    $http.get(window.APIBASEURL + '/api/get/orders', '').then(function (res) {
                        for (var i = 0; i < res.data.length; i++) {
                            res.data[i].lastupdatetime = time
                            res.data[i].lastsynctime = time
                            res.data[i].orderStatus = true;
                        }
                        $scope.allOrders = _.filter(res.data, function (oneord) {
                            return oneord.restaurantId == getEmployee.restaurant;
                        });
                       /// console.log($scope.allOrders);
                    }, handleError('Error getting all users'));
                } else {
                    utilservice.getDocFromPouchDB('ORDERS', true).then(function (data) {
                        var odlist = [];
                        if (data.isFound) {
                            odlist = data.underlyingdoc.docdata;
                        }
                        $scope.allOrders = _.filter(odlist, function (oneord) {
                            return oneord.restaurantId == getEmployee.restaurant && oneord.status != "ARCHIVED";
                        });
                        utilservice.getDocFromPouchDB('INVOICES', true).then(function (invoices) {
                            var invlist = [];
                            if (invoices.isFound)
                                invlist = invoices.underlyingdoc.docdata;

                            function getINVID(order) {
                                var ivid = order.invoiceId;
                                try {
                                    if (order.invoiceId._id)
                                        ivid = order.invoiceId._id;
                                } catch (err) {
                                    ivid = order.invoiceId;
                                }
                                return ivid;
                            }

                            for (var i = 0; i < $scope.allOrders.length; i++) {
                                var inv = _.find(invlist, function (oneinv) {
                                    return utilservice.idMatcher(getINVID($scope.allOrders[i]), oneinv);
                                });
                                $scope.allOrders[i].invoiceId = inv;
                                $scope.allOrders[i].orderStatus = true;
                            }

                            utilservice.getDocFromPouchDB('Product', true).then(function (products) {
                                var productslist = [];
                                if (products.isFound)
                                    productslist = products.underlyingdoc.docdata;

                                function getPROID(order) {
                                    var odid = order.product;
                                    try {
                                        if (order.product._id)
                                            odid = order.product._id;
                                    } catch (err) {
                                        odid = order.product;
                                    }
                                    return odid;
                                }

                                for (var i = 0; i < $scope.allOrders.length; i++) {
                                    var pro = _.find(productslist, function (onepro) {
                                        return utilservice.idMatcher(getPROID($scope.allOrders[i]), onepro);
                                    });
                                    $scope.allOrders[i].product = pro;
                                    $scope.allOrders[i].orderStatus = true;
                                }
                            });

                        });
                    });
                }
            }

          
        }

        $scope.getOrders();

      

        $scope.startOrder = function (data) {
           // console.log(data);
           // console.log("order data");
            data.orderStatus = false;
            var socketObj = {
                clientId: data.clientId,
                invoiceId: data.invoiceId._id,
                orderId: data._id
            }
            //data.status = $rootScope.orderStatusmanager.STARTED;
            var obj = angular.copy(data)
            obj.status = $rootScope.orderStatusmanager.STARTED;
            ordersMonitorServiceFun.startOrder(obj).then(function (success) {
                if (!success) {
                    for (var i = 0; i < $scope.allOrders.length; i++) {
                        if ($scope.allOrders[i].clientId == data.clientId) {
                            $scope.allOrders[i].status = $rootScope.orderStatusmanager.PLACED;
                            alertservice.showAlert('error', "Failed", "Inventory Doesn't have ingredient to make product...");
                        }
                    }
                } else {
                    data.status = $rootScope.orderStatusmanager.STARTED;
                    alertservice.showAlert('error', "Failed", "Product has been start...");
                    $rootScope.socket.emit('orderStarted', socketObj);
                }

            }, function (err) {
                for (var i = 0; i < $scope.allOrders.length; i++) {
                    if ($scope.allOrders[i]._id == data._id) {
                        $scope.allOrders[i].status = $rootScope.orderStatusmanager.PLACED;
                        alertservice.showAlert('error', "Failed", "Product unavailable...");
                    }

                }
            });
        }

        $scope.completeOrder = function (data, index) {
           // console.log('on complete: ', data);
            data.status = $rootScope.orderStatusmanager.COMPLETED;
            var obj = data
            ordersMonitorServiceFun.updateOrderStatus(obj).then(function (response) {
                alertservice.showAlert('error', "Failed", "Order successfully done...");
               // console.log(response);
                $rootScope.socket.emit('orderCompleted', data._id);
                if ($scope.printOrderEnabled) {
                    var printObj = obj;
                    printObj.client = obj.invoiceId.clientName;
                    printObj.tableName = obj.invoiceId.tables.roomid.name;
                    printObj.tableNum = obj.invoiceId.tables.number;
                    printObj.time = obj.invoiceId.created_at;
                    printObj.product.image = "";
                    
                    //console.log("order to print:", printObj);
                    
                    utilservice.printOrder(printObj);
                }
            }, function (err) {
                alertservice.showAlert('error', "Failed", "Product unavailable...");
            });
        }
    }
})();
