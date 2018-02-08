(function () {
    'use strict';

    angular
        .module('ordersMonitor')
        .factory('ordersMonitorService.js', ordersMonitorServiceFn)
        .service('ordersMonitorServiceFun', ordersMonitorServiceFn);

    ordersMonitorServiceFn.$inject = ['$http', 'pouchDB', 'localStorageService', '$rootScope', '$q', 'utilservice'];
    /* @ngInject */
    function ordersMonitorServiceFn($http, pouchDB, localStorageService, $rootScope, $q, utilservice) {
        var db = pouchDB('lanapp', { adapter: 'idb' });
        var service = {};
        service.GetOrders = GetOrders;
        service.startOrder = startOrder;
        service.updateOrderStatus = updateOrderStatus;
        return service;



        function orderStatusMofiyfn(isExist, catid, doctomanage, existDocument) {
            try {
                doctomanage.lastupdatetime = new Date();;
              //  console.log("comparing ids");
                for (var cnt = 0; cnt < existDocument.docdata.length ; cnt++) {
                    try {
                       // console.log({ a: existDocument.docdata[cnt].clientId, b: doctomanage.clientId })
                        if (existDocument.docdata[cnt].clientId == doctomanage.clientId) {
                            existDocument.docdata[cnt].status = doctomanage.status;
                            existDocument.docdata[cnt].lastupdatetime = new Date();
                        }
                    }
                    catch (err) {

                    }
                }
                return existDocument;
            } catch (err) {
                return existDocument;
            }
        }


        function startOrder(data) {

            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('ORDERS', data, orderStatusMofiyfn).then(function (res) {
                    utilservice.syncINVOICES();
                    resolve(true);
                }).catch(function (err) {
                    reject(false);
                });
            });

            //if (true) {
            //    return $http.post('/api/v1/updateOrder', data).then(function (res) {

            //        return res;

            //    }, function(error){

            //        return error;
            //    });
            //}
            //else {
            //    if (data) {
            //        db.put(data).then(function (response) {
            //            return response
            //        }).catch(function (error) {
            //            return error
            //        });
            //    }
            //}
        }
        function updateOrderStatus(data) {

            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('ORDERS', data, orderStatusMofiyfn).then(function (res) {
                    utilservice.syncINVOICES();
                    resolve(true);
                }).catch(function (err) {
                    reject(false);
                });
            });

            //if (true) {
            //    return $http.post('/api/v1/updateOrderStatus', data).then(function (res) {

            //        return res;

            //    }, function (error) {

            //        return error;
            //    });
            //}
            //else {
            //    if (data) {
            //        db.put(data).then(function (response) {
            //            return response
            //        }).catch(function (error) {
            //            return error
            //        });
            //    }
            //}
        }




        function GetOrders() {
            return $http.get(window.APIBASEURL+ '/api/get/orders', '').then(function (res) {

                return res.data;

            }, handleError('Error getting all users'));

        }


        function GetTables() {
            return $http.get(window.APIBASEURL + '/api/get/tables', '').then(function (res) {

                return res.data;

            }, handleError('Error getting all users'));

        }


        function InvoiceSuccess(res) {
            return res.data;
        }
        function getInvoiceSuccess(res) {
            return res.data;
        }

        function handleSuccess(res) {
            return res.data;
        }
        function handleSuccessLocally(res) {
            return res.data.data[0];
        }

        function handleError(error) {
            return function () {
                return { success: false, message: error };
            };
        }

    }
})();