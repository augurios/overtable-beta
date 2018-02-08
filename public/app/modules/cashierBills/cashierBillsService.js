(function () {
    'use strict';

    angular
        .module('cashierBills')
        .factory('cashierBillsService.js', cashierServiceFn)
        .service('cashierBillsServiceFn', cashierServiceFn);


    cashierServiceFn.$inject = ['$http', 'pouchDB', 'localStorageService', '$rootScope', '$q', 'utilservice'];
    /* @ngInject */
    function cashierServiceFn($http, pouchDB, localStorageService, $rootScope, $q, utilservice) {
        var db = pouchDB('lanapp', { adapter: 'idb' });
       // console.log("testiado fresh");
        var service = {};
        service.GetEmp = GetEmp;
        service.getPrinters = getPrinters;
        service.getInDollars = getInDollars
        service.printInvoice = printInvoice;
        service.CurrentEmployee = CurrentEmployee;
        service.updateUser = CurrentEmployeeUpdate;
        service.GetInvoice = GetInvoice;
        service.EditingTable = EditingTable;
        service.placeOrder = placeOrder;
        service.placeOrderWithOutSync = placeOrderWithOutSync;
        service.UpdateInvoiceStatus = UpdateInvoiceStatus;
        service.UpdateInvoiceStatusNew = UpdateInvoiceStatusNew;
        service.addSplitInvoice_updateInvoice = addSplitInvoice_updateInvoice;
        service.removeOrder = removeOrder;
        service.SplitInvoiceStatus = SplitInvoiceStatus;
        service.finishSplit = finishSplit;
        service.removeOrderFromInvoice = removeOrderFromInvoice;
        service.setQuantityForInvoice = setQuantityForInvoice;
        service.addOrderToSplittedInvoice = addOrderToSplittedInvoice;
        service.addInvoinAndOrderInShift = addInvoinAndOrderInShift;
        service.UpdateInvoiceStatusById = UpdateInvoiceStatusById;
        service.reduceInventory = reduceInventory;
        service.restoreInventory = restoreInventory;
        service.restoreProduct = restoreProduct;
        service.reduceProduct = reduceProduct;
        service.getProductPriceWithQuantity = getProductPriceWithQuantity;
        service.priceCalculation = priceCalculation;
        service.getactualPriceForCampare = getactualPriceForCampare;
        service.defaultInvoiceObject = defaultInvoiceObject;
        service.restoreInvoiceToLocalDb = restoreInvoiceToLocalDb;
        service.updateSingleInvoiceToLocalDB = updateSingleInvoiceToLocalDB;
        service.addSingleInvoiceToLocalDB = addSingleInvoiceToLocalDB;
        service.isSoldOut = isSoldOut;
        service.validateProduct = validateProduct;
        service.syncInvoiceMetaData = syncInvoiceMetaData;
        service.closeInvoice = closeInvoice;
        service.applyDiscount = applyDiscount;
        service.getBillNo = getBillNo;
        service.addMultipleOrderInShift = addMultipleOrderInShift;
        service.isProductAvailable = isProductAvailable;
        service.checkProductAvailibilty = checkProductAvailibilty;
        service.splitItemBetweenInvoice = splitItemBetweenInvoice;
        service.CancleInvoice = CancleInvoice;
       
        return service;

        /////////
        function myMapFunction(doc) {
            if (doc._id == 'usersess') {
                if (doc.usermoment.employee) {
                    emit(doc.usermoment.employee);
                } else {
                    emit(doc.name);
                }
            }
        }

        function getMapByID(doc) {
            if (doc._id == 'employee') {
                if (doc.emplyoeedata) {
                    emit(doc.emplyoeedata);
                } else {
                    emit(doc.name);
                }
            }
        }


        function getPrinters() {
            return $http.get('http://localhost:10086/printers').then(function (res) {
	           // console.log('printers:',res.data);
                return res.data;
            }, handleError('Error Getting Printers'));
        }
		
		 function getInDollars(amount) {
			 if ($rootScope.online) {
				var params = {  amount: amount };
              return $http.post("http://localhost:9000/convertdollar", params)
              .success(function (data) {
	             // console.log('results',data);
                  return data;
                  
              });
            
            } else {
			     var params = { amount: amount };
			     return $http.post("http://localhost:9000/convertdollar", params)
                 .success(function (data) {
                     // console.log('results',data);
                     return data;

                 });

            }
        }

        function printInvoice(data) {
           // console.log(data);

            return $http.post('http://localhost:10086/printinvoice', data, { headers: { 'Content-Type': 'text/plain' }, data: data }).then(function (res) {
                return res.data;
            }, handleError('Error Printing'));
        }




        function CurrentEmployee() {

            if ($rootScope.online) {
                return $http.get(window.APIBASEURL + '/api/v1/employeedetails').then(handleSuccessLocally, handleError('Error getting all users'));
            }
            else {

                return db.query(myMapFunction).then(function (result) {
                    return result.rows[0].key
                }).catch(function (err) {
                   // console.log(err)
                });
            }

        }

        //function GetAllEmployee()
        //{
        //    return $q((resolve, reject) => {
        //        db.get('EMPLOYEES', true).then(function (Employee) {
        //            console.log(Employee);
        //            //resolve(invdoc);
        //        });
        //    });

        //}

        function CurrentEmployeeUpdate(data) {

            if ($rootScope.online) {
                return $http.post(window.APIBASEURL + '/api/v1/currentemployeeUpdate', data).then(handleSuccess, handleError('Error getting all users'));
            }
            else {

                data.flag = 1;
                return db.query(getMapByID, { include_docs: true }).then(function (result) {
                    //console.log(result.rows[0].key)
                    var empIds = []
                    empIds = data._id
                    var indexed;

                    var filteredArray = result.rows[0].key.filter(function (itm) {
                        return empIds.indexOf(itm._id) > -1;
                    });

                    //console.log(filteredArray)


                    for (var i = 0, len = result.rows[0].key.length; i < len; i++) {

                        if (result.rows[0].key[i]._id == data._id) {
                            indexed = i;

                            db.get('employee').then(function (doc) {
                                var newdata = doc

                                delete doc.emplyoeedata[indexed];
                                doc.emplyoeedata[indexed] = data

                                var syncData = {
                                    edit: data._id,
                                    data: data,
                                    syncstatus: 0
                                }


                                if (localStorageService.get('_meanLanAppSync')) {
                                    // put employee data on 1st array node
                                    //localStorageService.set('_meanLanAppSync',{employeeprofile : syncData});//
                                    var arr = localStorageService.get('_meanLanAppSync');
                                    // arr.push(localStorageService.get('_meanLanAppSync'));
                                    if ("1" in arr) {
                                        delete arr[1];
                                        arr[1] = { employeeprofile: syncData }
                                    }
                                    else {
                                        arr[1] = { employeeprofile: syncData }
                                    }
                                   // console.log("New struct")
                                   // console.log(arr)
                                    localStorageService.set('_meanLanAppSync', arr)
                                }


                                return db.put({
                                    _id: 'employee',
                                    _rev: doc._rev,
                                    emplyoeedata: doc.emplyoeedata
                                });

                            });

                        }
                    }

                }).catch(function (err) {
                   // console.log(err)
                });

                /*   db.get('employee').then(function(doc) {
                     return db.put({
                       _id: 'employee',
                       _rev: doc._rev,

                     });
                   }).then(function(response) {
                     // handle response
                   }).catch(function (err) {
                     console.log(err);
                   });*/
                //session  update
                /*db.get('usersess').then(function(doc) {
                     console.log(doc)
                     var doc_rev =  doc._rev
                     var data = doc.usermoment
                     delete doc.usermoment.employee;
                     var updataion;
                     doc.usermoment.employee = data;
                     updataion = doc.usermoment.employee

                    db.put({
                         _id: 'usersess',
                         _rev: doc_rev,
                         usermoment: updataion
                       });

                 }).then(function(response) {
                   // handle response
                    console.log(response)
                 }).catch(function (err) {
                   console.log(err);
                 });*/
            }

        }



        

        function GetEmp(data) {
            return $http.get(window.APIBASEURL + '/api/get/employee', data).then(function (res) {
                return res.data;
            }, handleError('Error getting all users'));
        }

        function GetInvoice(fromlocal) {
            return $q((resolve, reject) => {
                if (fromlocal) {
                    utilservice.getDocFromPouchDB('INVOICES', true).then(function (incs) {
                        if (incs.isFound) {
                            utilservice.getDocFromPouchDB('ORDERS', true).then(function (orderslist) {
                                utilservice.getDocFromPouchDB('Product', true).then(function (products) {
                                    var allorders = orderslist.underlyingdoc.docdata;
                                    var allproduct = products.underlyingdoc.docdata
                                    var toreturn = [];
                                    for (var i = 0 ; i < incs.underlyingdoc.docdata.length; i++) {
                                        if (!incs.underlyingdoc.docdata[i].tables)
                                            incs.underlyingdoc.docdata[i].tables = { _id: '-1', number: 'No Table' }
                                        if (incs.underlyingdoc.docdata[i].invoiceStatus != "ARCHIVED") {
                                            if (incs.underlyingdoc.docdata[i].orders) {
                                                for (var odcounter = 0; odcounter < incs.underlyingdoc.docdata[i].orders.length; odcounter++) {
                                                    if (incs.underlyingdoc.docdata[i].orders[odcounter]) {
                                                        var orderobj = incs.underlyingdoc.docdata[i].orders[odcounter];
                                                        try {
                                                            if (orderobj.indexOf('CUSTOM-GENERETED-ID') >= 0) {
                                                                orderobj = _.find(allorders, function (num) { return num.clientId == orderobj });
                                                            } else {
                                                                orderobj = _.find(allorders, function (num) { return num._id == orderobj });
                                                            }
                                                        } catch (dfsdf) {
                                                            orderobj = _.find(allorders, function (num) { return num.clientId == orderobj.clientId });
                                                        }

                                                        if (orderobj && orderobj.product) {
                                                            var productobj = null;
                                                            try {
                                                                if (orderobj.product.indexOf('CUSTOM-GENERETED-ID') >= 0) {
                                                                    productobj = _.find(allproduct, function (num) {
                                                                        return num.clientId == orderobj.product;
                                                                    });
                                                                } else {
                                                                    productobj = _.find(allproduct, function (num) {
                                                                        return num._id == orderobj.product;
                                                                    });
                                                                }
                                                            } catch (dfsdf) {
                                                                //_id && object
                                                                if (orderobj.product._id) {
                                                                    productobj = _.find(allproduct, function (num) {
                                                                        return num._id == orderobj.product._id
                                                                    });
                                                                }
                                                            }
                                                            orderobj.product = productobj;
                                                        } else {
                                                            if (orderobj && orderobj.productClientId) {
                                                                orderobj.product = _.find(allproduct, function (num) {
                                                                    return num.clientId == orderobj.productClientId;
                                                                });
                                                            }
                                                        }
                                                        incs.underlyingdoc.docdata[i].orders[odcounter] = orderobj;

                                                        if (!orderobj || orderobj==null) {
                                                           var  data={}
                                                            data.errorRefData = { invoice: incs.underlyingdoc.docdata[i], allorders: allorders }
                                                            data.created_at = new Date();
                                                            data.updated_at = new Date();
                                                            data.restaurantId = localStorage.getItem('resId')
                                                            data.employee = $rootScope.loggedInUser 
                                                            $http.post(window.APIBASEURL + '/api/v1/ErrorLogs', data).then(function (res) {
                                                             console.log('OrderObj null')
                                                            }, handleError('OrderObj null'));

                                                        }
                                                    }
                                                }
                                            }
                                            toreturn.push(incs.underlyingdoc.docdata[i]);
                                        }
                                    }
                                    resolve(toreturn);
                                });
                            });
                        }
                        else
                            resolve([]);
                    });
                } else {
                    if ($rootScope.online)
                        $http.get(window.APIBASEURL + '/api/get/invoice', '').then(function (invs) {
                            resolve(invs.data);
                        }, handleError('Error getting all users'));
                    else {
                        utilservice.getDocFromPouchDB('INVOICES', true).then(function (incs) {
                            if (incs.isFound) {
                                utilservice.getDocFromPouchDB('ORDERS', true).then(function (orderslist) {

                                    var allorders = orderslist.underlyingdoc.docdata;
                                    var toreturn = [];
                                    for (var i = 0 ; i < incs.underlyingdoc.docdata.length; i++) {
                                        if (incs.underlyingdoc.docdata[i].invoiceStatus != "ARCHIVED") {
                                            for (var odcounter = 0; odcounter < incs.underlyingdoc.docdata[i].orders; odcounter++) {
                                                for (var odcounter = 0; odcounter < incs.underlyingdoc.docdata[i].orders; odcounter++) {
                                                    if (incs.underlyingdoc.docdata[i].orders[odcounter]) {
                                                        try {
                                                            if (incs.underlyingdoc.docdata[i].orders[odcounter].indexOf('CUSTOM-GENERETED-ID') >= 0) {
                                                                var orderobj = _.find(allorders, function (num) { return num.clientId == incs.underlyingdoc.docdata[i].orders[odcounter] });
                                                                incs.underlyingdoc.docdata[i].orders[odcounter] = orderobj;
                                                            }
                                                        } catch (dfsdf) {
                                                            var orderobj = _.find(allorders, function (num) { return num.clientId == incs.underlyingdoc.docdata[i].orders[odcounter].clientId });
                                                            incs.underlyingdoc.docdata[i].orders[odcounter] = orderobj;
                                                        }
                                                    }
                                                }
                                            }
                                            toreturn.push(incs.underlyingdoc.docdata[i]);
                                        }
                                    }
                                    resolve(toreturn);
                                });
                            }
                            else
                                resolve([]);
                        });
                    }
                }
            });
        }

        function CancleInvoice(invoiceobj) {

            function closeInvoiceMofiyfn(isExist, catid, doctomanage, existDocument) {
                try {
                    doctomanage.lastupdatetime = new Date();;
                    for (var cnt = 0; cnt < existDocument.docdata.length ; cnt++) {
                        if (existDocument.docdata[cnt].clientId == doctomanage.clientId) {
                            existDocument.docdata[cnt].invoiceStatus = doctomanage.invoiceStatus;
                            existDocument.docdata[cnt].iscash = doctomanage.iscash;
                            existDocument.docdata[cnt].lastupdatetime = new Date();
                            existDocument.docdata[cnt].override = doctomanage.override;
                        }
                    }
                    return existDocument;
                } catch (err) {
                    return existDocument;
                }
            }

            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('INVOICES', invoiceobj, closeInvoiceMofiyfn).then(function (res) {
                        utilservice.syncINVOICES();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });




        }


        function closeInvoice(invoiceobj) {

           function closeInvoiceMofiyfn(isExist, catid, doctomanage, existDocument) {
                try {
                    doctomanage.lastupdatetime = new Date();;
                    for (var cnt = 0; cnt < existDocument.docdata.length ; cnt++) {
                        if (existDocument.docdata[cnt].clientId == doctomanage.clientId) {
                            existDocument.docdata[cnt].invoiceStatus = doctomanage.invoiceStatus;
                            existDocument.docdata[cnt].iscash = doctomanage.iscash;
                            existDocument.docdata[cnt].lastupdatetime = new Date();
                            existDocument.docdata[cnt].override = doctomanage.override;
                        }
                    }
                    return existDocument;
                } catch (err) {
                    return existDocument;
                }
            }

            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('INVOICES', invoiceobj, closeInvoiceMofiyfn).then(function (res) {

                    if (invoiceobj.iscash) {

                        function modifySHiftBalance(isExist, catid, doctomanage, existDocument) {
                            try {
                                existDocument.lastupdatetime = new Date();;
                                
                                if (existDocument.shiftdata && (existDocument.shiftdata.closingBalance || existDocument.shiftdata.closingBalance==0))
                                existDocument.shiftdata.closingBalance = existDocument.shiftdata.closingBalance + doctomanage.prices.grandtotal;

                                return existDocument;
                            } catch (err) {
                                return existDocument;
                            }
                        }

                        utilservice.addOrUpdateDocInPouchDB('CurrentShift', invoiceobj, modifySHiftBalance).then(function (res) {
                            //update the shift
                            utilservice.syncINVOICES();
                        }).catch(function (err) {
                            reject(err);
                        });
                    } else
                        utilservice.syncINVOICES();

                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function applyDiscount(invoiceobj) {

            function applyDiscountMofiyfn(isExist, catid, doctomanage, existDocument) {
                try {
                    doctomanage.lastupdatetime = new Date();;
                    for (var cnt = 0; cnt < existDocument.docdata.length ; cnt++) {
                        if (existDocument.docdata[cnt].clientId == doctomanage.clientId) {
                            existDocument.docdata[cnt].discount = doctomanage.discount;
                            existDocument.docdata[cnt].lastupdatetime = new Date();
                        }
                    }
                    return existDocument;
                } catch (err) {
                    return existDocument;
                }
            }

            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('INVOICES', invoiceobj, applyDiscountMofiyfn).then(function (res) {
                    utilservice.syncINVOICES();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function getBillNo(fromlocal) {
            fromlocal = true;
            function billmofiyfn(isExist, catid, doctomanage, existDocument) {
                var time = new Date();
                var newDoc = existDocument || { _id: catid };
                newDoc.billNo = doctomanage;
                newDoc.lastupdatetime = time;
                newDoc.lastsynctime = time;
                return newDoc;
            }
            return $q(function (resolve, reject) {
                if (fromlocal) {
                    utilservice.getDocFromPouchDB('BILLNUMBR', true).then(function (docdetails) {
                        var billno = 0;
                        if (docdetails.isFound)
                            billno = docdetails.underlyingdoc.billNo;
                        utilservice.addOrUpdateDocInPouchDB('BILLNUMBR', billno + 1, billmofiyfn);
                        resolve(billno);
                    });
                }
                else {
                    if ($rootScope.online) {
                        $http.get(window.APIBASEURL + '/api/v1/getBillno').then(function (response) {
                            var billno = response.data.billNo;
                            billno++;
                            utilservice.addOrUpdateDocInPouchDB('BILLNUMBR', billno, billmofiyfn)
                            resolve(billno);
                        });
                    }
                    else {
                        utilservice.getDocFromPouchDB('BILLNUMBR', true).then(function (docdetails) {
                            var billno = 0;
                            if (docdetails.isFound)
                                billno = docdetails.underlyingdoc.billNo;
                            billno++;
                            utilservice.addOrUpdateDocInPouchDB('BILLNUMBR', billno, billmofiyfn)
                            resolve(billno);
                        });
                    }
                }
            });
        }

        function invoiceMofiyfn(isExist, catid, doctomanage, existDocument) {
            try {
                doctomanage.lastupdatetime = new Date();;
                for (var cnt = 0; cnt < existDocument.docdata.length ; cnt++) {
                    if (existDocument.docdata[cnt].clientId == doctomanage.clientId) {
                        existDocument.docdata[cnt] = doctomanage;
                    }
                }
                return existDocument;
            } catch (err) {
                return existDocument;
            }
        }

        function orderMofiyfn(isExist, catid, doctomanage, existDocument) {
            try {
                doctomanage.lastupdatetime = new Date();;
                for (var cnt = 0; cnt < existDocument.docdata.length ; cnt++) {
                    if (existDocument.docdata[cnt].clientId == doctomanage.clientId) {
                        existDocument.docdata[cnt] = doctomanage;
                        existDocument.docdata[cnt].lastupdatetime = new Date();
                    }
                }
                return existDocument;
            } catch (err) {
                return existDocument;
            }
        }


        function UpdateInvoiceStatus(data) {

            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('INVOICES', data, invoiceMofiyfn).then(function (res) {
                    utilservice.syncINVOICES();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function UpdateInvoiceStatusNew(data) {

            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('INVOICES', data, invoiceMofiyfn).then(function (res) {
                    //utilservice.syncINVOICES();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function UpdateInvoiceStatusById(invoiceStatus) {
            return $http.post(window.APIBASEURL + '/api/v1/updateinvoicestatusbyid', invoiceStatus).then(getInvoiceSuccess, handleError('Error getting all users'));
        }

        function SplitInvoiceStatus(invoiceStatus) {

            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('INVOICES', data, invoiceMofiyfn).then(function (res) {
                    utilservice.syncINVOICES();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }










        function finishSplit(data) {

            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('INVOICES', data, invoiceMofiyfn).then(function (res) {
                    utilservice.syncINVOICES();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });

        }



     

        function addSplitInvoice_updateInvoice(data) {
            return $http.post(window.APIBASEURL + '/api/v1/splitinvoice', data).then(function (res) {

                return res.data;

            }, handleError('Error getting all users'));

        }

        function placeOrder(orderToPlaced) {


            function innerAddMofiyfn(isExist, catid, doctomanage, existDocument) {
                var time = new Date();
                var newDoc = existDocument || { _id: catid };
                newDoc.docdata = newDoc.docdata || [];
                for (var olist = 0; olist < doctomanage.length; olist++) {
                    var onedoc = doctomanage[olist];
                    onedoc.lastupdatetime = time;
                    newDoc.docdata.push(onedoc)
                }
                newDoc.lastupdatetime = time;
                return newDoc;
            }

            var _self = this;
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('ORDERS', orderToPlaced, innerAddMofiyfn).then(function (res) {
                    _self.addMultipleOrderInShift(orderToPlaced).then(function (response) {
                        utilservice.syncINVOICES();
                        console.log(orderToPlaced);
                        console.log("placeorder done");
                        resolve(orderToPlaced);
                    }, function (err) { });
                }).catch(function (err) {
                    reject(err);
                });
            });
        }


        function placeOrderWithOutSync(orderToPlaced) {


            function innerAddMofiyfn(isExist, catid, doctomanage, existDocument) {
                var time = new Date();
                var newDoc = existDocument || { _id: catid };
                newDoc.docdata = newDoc.docdata || [];
                for (var olist = 0; olist < doctomanage.length; olist++) {
                    var onedoc = doctomanage[olist];
                    onedoc.lastupdatetime = time;
                    newDoc.docdata.push(onedoc)
                }
                newDoc.lastupdatetime = time;
                return newDoc;
            }

            var _self = this;
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('ORDERS', orderToPlaced, innerAddMofiyfn).then(function (res) {
                    _self.addMultipleOrderInShift(orderToPlaced).then(function (response) {
                        //utilservice.syncINVOICES();
                       // console.log(orderToPlaced);
                       // console.log("placeorder done");
                        resolve(orderToPlaced);
                    }, function (err) { });
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function removeOrderFromInvoice(item, stopsyncing) {

            return dbRemoveloRemoveOrder(item.clientId, item.invoiceId, stopsyncing);

        }

        function splitItemBetweenInvoice(splitobj, stopsyncing) {
            return $q((resolve, reject) => {
                db.get('INVOICES', true).then(function (invdoc) {
                    var invcs = invdoc.docdata || [];
                    for (var cnt = 0; cnt < invcs.length; cnt++) {
                        if (invcs[cnt].clientId == splitobj.oldInvoiceId) {
                            if (invcs[cnt].orders) {
                                for (var odcounter = 0; odcounter < invcs[cnt].orders.length; odcounter++) {
                                    if (utilservice.idMatcher(splitobj.orderClientId, invcs[cnt].orders)) {
                                        invcs[cnt].orders.splice(odcounter, 1);
                                        invcs[cnt].lastupdatetime = new Date();
                                    }
                                }
                            }
                        } else if (invcs[cnt].clientId == splitobj.newInvoiceId) {
                            invcs[cnt].orders = invcs[cnt].orders || [];
                            invcs[cnt].orders.push(splitobj.orderClientId);
                            invcs[cnt].lastupdatetime = new Date();
                        }
                    }
                    invdoc.docdata = invcs;
                    db.put(invdoc).then(function (res) {
                        db.get('ORDERS', true).then(function (oddoc) {
                            //match the orderid and replace the invoice id 
                            oddoc.docdata = oddoc.docdata || [];
                            for (var cnt = 0; cnt < oddoc.docdata.length; cnt++) {
                                if (oddoc.docdata[cnt].clientId == splitobj.orderClientId) {
                                    oddoc.docdata[cnt].invoiceId = splitobj.newInvoiceId;
                                    oddoc.docdata[cnt].lastupdatetime = new Date();
                                }
                            }
                            db.put(oddoc).then(function () {
                                if (stopsyncing) { }
                                else utilservice.syncINVOICES();
                                resolve(splitobj);
                            });
                        });
                    });
                });
            });
        }

        function addOrderToSplittedInvoice(orderobj, stopsyncing) {

            return $q((resolve, reject) => {
                var item = orderobj.item;

                db.get('INVOICES', true).then(function (invdoc) {
                    //var invdoc = { _id: 'INVOICES' };
                    //if (invfromdb.isFound)
                    //    invdoc = invfromdb.underlyingdoc;
                    var invcs = invdoc.docdata || [];
                    for (var cnt = 0; cnt < invcs.length; cnt++) {
                        if (utilservice.idMatcher(item.invoiceId, invcs[cnt])) {
                            invcs[cnt].orders = invcs[cnt].orders || [];
                            if (item.splitClientId)
                                invcs[cnt].orders.push(item.splitClientId);
                            else
                                invcs[cnt].orders.push(item.clientId);
                            invcs[cnt].lastupdatetime = new Date();
                        }
                    }
                    invdoc.docdata = invcs;
                    db.put(invdoc).then(function () {
                        db.get('ORDERS', true).then(function (oddoc) {
                            //var oddoc = { _id: 'ORDERS' };
                            //if (oddocfromdb.isFound)
                            //    oddoc = oddocfromdb.underlyingdoc;
                            item.lastupdatetime = new Date();
                            oddoc.docdata = oddoc.docdata || [];
                            oddoc.docdata.push(item);
                            db.put(oddoc).then(function () {
                                if (stopsyncing) { }
                                else utilservice.syncINVOICES();
                                resolve(item);
                            });
                        });
                    });
                });
            });
        }

        function setQuantityForInvoice(item, stopsyncing) {

            function setQuantityForInvoiceOrderMofiyfn(isExist, catid, doctomanage, existDocument) {
                try {
                    doctomanage.lastupdatetime = new Date();;
                    for (var cnt = 0; cnt < existDocument.docdata.length ; cnt++) {
                        if (doctomanage.splitClientId) {
                            if (existDocument.docdata[cnt].splitClientId == doctomanage.splitClientId) {
                                existDocument.docdata[cnt] = doctomanage;
                                existDocument.docdata[cnt].lastupdatetime = new Date();
                            }
                        } else {
                            if (existDocument.docdata[cnt].clientId == doctomanage.clientId) {
                                existDocument.docdata[cnt] = doctomanage;
                                existDocument.docdata[cnt].lastupdatetime = new Date();
                            }
                        }
                    }
                    return existDocument;
                } catch (err) {
                    return existDocument;
                }
            }

            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('ORDERS', item.obj, setQuantityForInvoiceOrderMofiyfn).then(function (res) {
                    if (stopsyncing) { }
                    else utilservice.syncINVOICES();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });

        }


        function dbRemoveloRemoveOrder(item, invoice, stopsyncing) {

            function orderDeleteModifyn(isExist, catid, doctomanage, existDocument) {
                var time = new Date();
                var newDoc = existDocument || { _id: catid };
                newDoc.docdata = newDoc.docdata || [];
                if (item.clientId)
                    newDoc.docdata.push({ clientId: item.clientId, lastupdatetime: new Date() });
                else
                    newDoc.docdata.push({ clientId: item, lastupdatetime: new Date() });
               // console.log("delete order data");
               // console.log(newDoc);
                return newDoc;
            }


            return $q((resolve, reject) => {
                var db = pouchDB('lanapp', { adapter: 'idb' });
                db.get('INVOICES').then(function (invdoc) {
                    //var invdoc = { _id: 'INVOICES' };
                    //if (invfromdb.isFound)
                    //    invdoc = invfromdb.underlyingdoc;
                    var invcs = invdoc.docdata || [];
                    for (var cnt = 0; cnt < invcs.length; cnt++) {
                        var invclid = invoice;
                        if (invoice.clientId)
                            invclid = invoice.clientId;
                        if (invcs[cnt].clientId == invclid) {
                            for (var odCounter = 0; odCounter < invcs[cnt].orders.length; odCounter++) {
                                var odid = invcs[cnt].orders[odCounter].clientId || invcs[cnt].orders[odCounter];
                                if (utilservice.idMatcher(odid, item)) {
                                    invcs[cnt].orders.splice(odCounter, 1);
                                }
                            }
                            invcs[cnt].lastupdatetime = new Date();
                        }
                    }
                    invdoc.docdata = invcs;
                    db.put(invdoc).then(function () {
                        //remove order from local as well
                        utilservice.addOrUpdateDocInPouchDB('ORDERTODELETE', item, orderDeleteModifyn).then(function (res) {
                            removeOrderFromShift(item).then(function (item) {
                                if (stopsyncing) { }
                                else utilservice.syncINVOICES();
                                resolve(item);
                            });
                        }).catch(function (err) {
                            reject(err);
                        });
                    });
                });
            });
        }

        function removeOrder(item) {

            return dbRemoveloRemoveOrder(item.Order, item.Invoice);
        }


        function EditWaiter(data) {
            return $http.post('/api/v1/waiter', data).then(function (res) {

                return res.data;

            }, handleError('Error getting all users'));

        }

        function syncInvoiceMetaData(data) {

            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('INVOICES', data, invoiceMofiyfn).then(function (res) {
                    utilservice.syncINVOICES();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function EditingTable(data) {
            return $http.post('/api/v1/updatetable', data).then(function (res) {

                return res.data;

            }, handleError('Error getting'));

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

        function addMultipleOrderInShift(orderToPlaced) {
            function addMofiyfn(isExist, catid, doctomanage, existDocument) {
                var time = new Date();
                var newDoc = existDocument || { _id: catid };
                newDoc.shiftdata = newDoc.shiftdata || {};
                newDoc.shiftdata.orders = newDoc.shiftdata.orders || [];
                for (var olist = 0; olist < doctomanage.length; olist++) {
                    newDoc.shiftdata.orders.push(doctomanage[olist].clientId)
                }
                newDoc.lastupdatetime = time;
                return newDoc;
            }
            var _self = this;
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('CurrentShift', orderToPlaced, addMofiyfn).then(function (res) {
                    //utilservice.syncShift();
                   // console.log(res);
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function addInvoinAndOrderInShift(id, type) {
            var toSend = {
                shid: localStorage.getItem("currentShiftid"),
                id: id,
                type: type
            };


            function addMofiyfn(isExist, catid, doctomanage, existDocument) {
                var time = new Date();
                var newDoc = existDocument || { _id: catid };
                newDoc.shiftdata = newDoc.shiftdata || {};
                if (doctomanage.type == 'INVOICE') {
                    newDoc.shiftdata.invoices = newDoc.shiftdata.invoices || [];
                    newDoc.shiftdata.invoices.push(doctomanage.id)
                } else {
                    newDoc.shiftdata.orders = newDoc.shiftdata.orders || [];
                    newDoc.shiftdata.orders.push(doctomanage.id)
                }
                newDoc.lastupdatetime = time;
                return newDoc;
            }

            var _self = this;
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('CurrentShift', toSend, addMofiyfn).then(function (res) {
                    //utilservice.syncShift();
                    console.log(res);
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function removeOrderFromShift(order) {

            function removeOrderMofiyfn(isExist, catid, doctomanage, existDocument) {
                var time = new Date();
                var newDoc = existDocument || { _id: catid };
                newDoc.shiftdata = newDoc.shiftdata || {};
                for (var odc = 0; odc < newDoc.shiftdata.orders.length; odc++) {
                    if (newDoc.shiftdata.orders[odc] == order.clientId || newDoc.shiftdata.orders[odc] == order._id) {
                        newDoc.shiftdata.orders.splice(odc);
                    }
                }
                newDoc.lastupdatetime = time;
                return newDoc;
            }

            var _self = this;
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('CurrentShift', order, removeOrderMofiyfn).then(function (res) {
                    //utilservice.syncShift();
                    //console.log(res);
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function getProductPriceWithQuantity(order) {
            var price = 0.0;
            try {
                price = parseFloat(order.product.Price) * parseFloat(order.quantity);
            }
            catch (err) {
                price = 0.0;
            }
            return price;
        }

        function priceCalculation(invoice) {
            var orders = invoice.orders;
            var tax = 0;
            var prices = { total: 0, grandtotal: 0 };

            if (invoice.override && invoice.override.isPriceOverride)
            {
                return prices;

            }
           
            if (orders && orders.length) {
                for (var i = 0; i < orders.length; i++) {
                    if (orders[i] && orders[i].product) {
                        prices.total = prices.total + (orders[i].product.Price * orders[i].quantity)
                    } else {
                        prices.total = 0;
                    }

                }
                prices.grandtotal = prices.total + (prices.total * tax) / 100
            }

            if (invoice.discount && invoice.discount.type) {
                if (invoice.discount.type === 'percentage') {
                    var getpercent = (invoice.discount.Amount / 100 * prices.grandtotal);
                    prices.grandtotal = prices.grandtotal - getpercent;
                } else {
                   // var getpercent = (invoice.discount.Amount / 100 * prices.grandtotal);
                    prices.grandtotal = prices.grandtotal - invoice.discount.Amount;
                }
            }
            //console.log(prices);
            return prices;
        }

        function getactualPriceForCampare(invoice) {
            var orders = invoice.orders;
            var tax = 0;
            var prices = { total: 0, grandtotal: 0 };
            if (orders && orders.length) {
                for (var i = 0; i < orders.length; i++) {
                    if (orders[i].product) {
                        prices.total = prices.total + (orders[i].product.Price * orders[i].quantity)
                    } else {
                        prices.total = 0;
                    }

                }
                prices.grandtotal = prices.total + (prices.total * tax) / 100
            }

            
            return prices.grandtotal;
        }

        function defaultInvoiceObject(name, table, servedby, restaurant, people) {
            var obj = {
                clientId: utilservice.generateGUID(),
                invoiceNumber: '',
                clientName: name,
                tables: table,
                iscash: true,
                servedby: servedby,
                invoiceStatus: $rootScope.invoiceStatusmanager.NEW,
                created_by: 'Admin',
                updated_by: 'Admin',
                restaurant: restaurant,
                people: people,
                updated_at: new Date(),
                created_at: new Date()
            }
            return obj;
        }

        function updateSingleInvoiceToLocalDB(invoice) {
            delete invoice["__v"];
            db.get(invoice.clientId).then(function (existDocument) {
             //   console.log(existDocument);
                var doc = invoice;
                doc._rev = existDocument._rev;
                db.put(doc).then(function () {
               //     console.log("Doc updated in poch Db\n for  exisinng doc");
                }).catch(function (err) {
               //     console.log("Error while updating Data to poch Db\n");
               //     console.log(err);
                });
            }).catch(function (err) {
                if (err && err.status == 404) {
                    db.put(invoice).then(function () {
                    //    console.log("Doc updated in poch Db\n");
                    }).catch(function (err) {
                     //   console.log("Error while updating Data to poch Db\n");
                      //  console.log(err);
                    });
                }
            });
        }

        function addSingleInvoiceToLocalDB(invoice) {
            function addMofiyfn(isExist, catid, doctomanage, existDocument) {
                var time = new Date();
                var newDoc = existDocument || { _id: catid };
                newDoc.docdata = newDoc.docdata || [];
                doctomanage.lastupdatetime = time;
                newDoc.docdata.push(doctomanage)
                return newDoc;
            }

            var _self = this;
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('INVOICES', invoice, addMofiyfn).then(function (res) {
                 //   console.log(res);
                    _self.addInvoinAndOrderInShift(res.clientId, 'INVOICE').then(function (response) {
                        utilservice.syncINVOICES();
                        resolve(res);
                    }, function (err) { });
                }).catch(function (err) {
                    reject(err);
                });
            });

        }

        function restoreInvoiceToLocalDb(allInvoice) {
            allInvoice.map(function (invoice) {
                this.updateSingleInvoiceToLocalDB(invoice);
            });
        }

        function isSoldOut(productId, ingredientsInventory, Allproducts) {
            var product = null;
            for (var pcon = 0; pcon < Allproducts.length; pcon++) {
                if (Allproducts[pcon].clientId == productId)
                    product = Allproducts[pcon];
            }
            var sufficientIngrdeitns = true;
            if (product) {
                if (product.type == "Retail") {
                    if (parseInt(product.Quantity) == 0)
                        sufficientIngrdeitns = false;
                } else {
                    var inds = product.Ingradients;
                    for (var icont = 0; icont < inds.length; icont++) {
                        var iid = -1;
                        if (inds[icont].name && inds[icont].name._id)
                            iid = inds[icont].name._id;
                        else
                            iid = inds[icont].name;
                        var ingref = _.find(ingredientsInventory, function (num) {
                            return num._id == iid;
                        });
                        if (ingref) {
                            if (parseFloat(inds[icont].quantity) > parseFloat(ingref.Quantity))
                                sufficientIngrdeitns = false;
                        } else {
                            sufficientIngrdeitns = false;
                        }
                    }
                }
            }

            return !sufficientIngrdeitns;
        }

        function validateProduct(productId, ingredientsInventory, Allproducts) {
            var isSoldOut = this.isSoldOut(productId, ingredientsInventory, Allproducts);
            return !isSoldOut;
        }

        function checkProductAvailibilty() {
            return $q((resolve, reject) => {

                db.get('Product').then(function (existDocument) {
                    db.get('Ingredients').then(function (ingredientsInventoryDoc) {
                        db.get('Sides').then(function (sideInventoryDoc) {

                            db.get('Production').then(function (ProductionInventoryDoc) {
                                var pamaps = [];

                                for (var pcon = 0; pcon < existDocument.docdata.length; pcon++) {
                                 
                                        var isAvailable = true;
                                        var product = existDocument.docdata[pcon];
                                        if (product.type == "Retail") {
                                            if (parseInt(product.Quantity) <= 0) {
                                                isAvailable = false;
                                            }
                                        } else {
                                            var ingredientsInventory = ingredientsInventoryDoc.docdata;
                                            var productinds = product.Ingradients;
                                            var dbSides = sideInventoryDoc.docdata;
                                            var proSides = product.Sides;
                                            var producation = ProductionInventoryDoc.docdata;
                                            var sidemap = [];

                                            function getSideIngQuanity(proSides, dbSides, ingradientClientId) {
                                                var quantity = 0;
                                                for (var icont = 0; icont < proSides.length; icont++) {
                                                    for (var ic = 0; ic < dbSides.length; ic++) {
                                                        if (dbSides[ic].clientId == proSides[icont].clientId) {
                                                            for (var i = 0; i < dbSides[ic].Ingradients.length; i++) {
                                                                if (ingradientClientId == dbSides[ic].Ingradients[i].ingradientClientId) {
                                                                    quantity = parseFloat(dbSides[ic].Ingradients[i].quantity)
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                return quantity;
                                            }

                                            for (var ic = 0; ic < ingredientsInventory.length; ic++) {
                                              //  if (ingredientsInventory[ic].Quantity < 0)
                                                 //   ingredientsInventory[ic].Quantity = 0;
                                                var required = getSideIngQuanity(proSides, dbSides, ingredientsInventory[ic].clientId);
                                                for (var icont = 0; icont < productinds.length; icont++) {
                                                    if (ingredientsInventory[ic].clientId == productinds[icont].ingradientClientId) {
                                                        required = required + parseFloat(productinds[icont].quantity);
                                                    }
                                                }
                                                
                                                if (required > parseFloat(ingredientsInventory[ic].Quantity))
                                                    isAvailable = false;
                                            }

                                            // check for production quanity 
                                            if (product.Production) {//list
                                                for (var ic = 0; ic < product.Production.length; ic++) {
                                                    var required = 0;
                                                    for (var icont = 0; icont < producation.length; icont++) {
                                                        if (producation[icont].clientId == product.Production[ic].ProductionClientId) {
                                                            required = parseFloat(product.Production[ic].quantity);
                                                            if (required > parseFloat(producation[icont].AvailableQuantity))
                                                                isAvailable = false;
                                                        }
                                                    }
                                                    //if (required > parseFloat(producation[icont].AvailableQuantity))
                                                    //    isAvailable = false;
                                                }
                                            }
                                        }
                                        
                                        //for (var i = 0 ; i < ingredientsInventory.length; i++) {
                                        //    for (var j = 0; j < existDocument.docdata[pcon].Ingradients.length; j++) {
                                        //        if (ingredientsInventory[i].Quantity <= (existDocument.docdata[pcon].Ingradients[j].quantity)*3)
                                        //        { }
                                        //    }
                                        //}
                                        
                                        // check if current ingredients/production amount is equal or less than (the required amount by the Product * 3)
                                        
                                        // check if there is already a notification placed on local for current ingredient/production 
                                         
                                        // add notification for current ingredient/product to localhost
                                        
                                        if (utilservice.getNagitveSetting()) 
                                            isAvailable = true;
                              
                                        pamaps.push({ clientId: existDocument.docdata[pcon].clientId, isAvailable: isAvailable });
                                    
                                }

                                resolve(pamaps)
                            });
                        });
                    });
                });
            });
        }

        function isProductAvailable(productId) {
            return $q((resolve, reject) => {
                this.checkProductAvailibilty().then(function (props) {
                    var isAvailable = true;
                    for (var k = 0; k < props.length; k++) {
                        if (productId == props[k].clientId)
                            isAvailable = props[k].isAvailable;
                    }
                    resolve(isAvailable);
                })
            });
        }

        function restoreProduct(productId, quantity) {
        //    console.log(quantity);
            return $q((resolve, reject) => {
                var isAvailable = false;
                db.get('Product').then(function (existDocument) {
              //      console.log(quantity);
                    for (var pcon = 0; pcon < existDocument.docdata.length; pcon++) {
                        if (existDocument.docdata[pcon].clientId == productId) {
                            existDocument.docdata[pcon].Quantity = parseInt(existDocument.docdata[pcon].Quantity) + parseInt(quantity);
                            existDocument.lastupdatetime = new Date();
                            if (parseInt(existDocument.docdata[pcon].Quantity) > 0)
                                isAvailable = true;
                        }
                    }
                    db.put(existDocument).then(function () {
                  //      console.log("Doc updated in poch Db\n for  exisinng doc");
                        utilservice.syncProductInventory();
                        resolve(isAvailable);
                    }).catch(function (err) {
                       // console.log("Error while updating Data to poch Db\n");
                      //  console.log(err);
                        resolve(isAvailable);
                    });
                });
            });
        }

        function reduceProduct(productId, quanity) {
            return $q((resolve, reject) => {
                var isAvailable = false;
                db.get('Product').then(function (existDocument) {
                    for (var pcon = 0; pcon < existDocument.docdata.length; pcon++) {
                        if (existDocument.docdata[pcon].clientId == productId) {
                            existDocument.docdata[pcon].Quantity = parseInt(existDocument.docdata[pcon].Quantity) - 1
                            existDocument.lastupdatetime = new Date();
                            if (parseInt(existDocument.docdata[pcon].Quantity) > 0)
                                isAvailable = true;
                        }
                    }
                    db.put(existDocument).then(function () {
                      //  console.log("Doc updated in poch Db\n for  exisinng doc");
                        utilservice.syncProductInventory();
                        resolve(isAvailable);
                    }).catch(function (err) {
                      //  console.log("Error while updating Data to poch Db\n");
                     //   console.log(err);
                        resolve(isAvailable);
                    });
                });
            });
        }

        function reduceInventory(productId, quanity) {
            return $q((resolve, reject) => {
                db.get('Product').then(function (existDocument) {
                    db.get('Ingredients').then(function (ingredientsInventoryDoc) {
                        db.get('Sides').then(function (sideInventoryDoc) {

                            db.get('Production').then(function (ProductionInventoryDoc) {

                                for (var pcon = 0; pcon < existDocument.docdata.length; pcon++) {
                                    if (existDocument.docdata[pcon].clientId == productId) {

                                        var product = existDocument.docdata[pcon];
                                        var ingredientsInventory = ingredientsInventoryDoc.docdata;
                                        var productinds = product.Ingradients;
                                        var dbSides = sideInventoryDoc.docdata;
                                        var proSides = product.Sides;
                                        var producation = ProductionInventoryDoc.docdata

                                        function getclientId(productSide) {
                                            try {
                                                if (productSide.indexOf('CUSTOM-GENERETED-ID') >= 0) {
                                                    return productSide
                                                }

                                            } catch (ddsdf) {
                                                return productSide.clientId
                                            }
                                        }
                                        //get ingridiant client id in case of db side
                                        function getIngclientId(DbSideingrediant) {
                                            try {
                                                if (DbSideingrediant.name.indexOf('CUSTOM-GENERETED-ID') >= 0) {

                                                    return DbSideingrediant.name
                                                }

                                            } catch (ddsdf) {
                                                return DbSideingrediant.name.clientId
                                            }
                                        }



                                        function getSideIngQuanity(proSides, dbSides, ingradientClientId) {
                                            //method for get client id of side
                                            

                                            var quantity = 0;
                                            for (var icont = 0; icont < proSides.length; icont++) {
                                                for (var ic = 0; ic < dbSides.length; ic++) {
                                                    if (dbSides[ic].clientId == getclientId(proSides[icont])) {
                                                        for (var i = 0; i < dbSides[ic].Ingradients.length; i++) {
                                                            if (ingradientClientId == getIngclientId(dbSides[ic].Ingradients[i])) {
                                                                quantity = parseFloat(dbSides[ic].Ingradients[i].quantity)
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            return quantity;
                                        }

                                        for (var ic = 0; ic < ingredientsInventory.length; ic++) {
                                            var required = getSideIngQuanity(proSides, dbSides, ingredientsInventory[ic].clientId);
                                            for (var icont = 0; icont < productinds.length; icont++) {
                                                if (ingredientsInventory[ic].clientId == productinds[icont].ingradientClientId) {
                                                    required = required + parseFloat(productinds[icont].quantity);
                                                }
                                            }
                                            ingredientsInventory[ic].Quantity = parseFloat(ingredientsInventory[ic].Quantity) - required;
                                        }

                                        ingredientsInventoryDoc.docdata = ingredientsInventory;
                                        ingredientsInventoryDoc.lastupdatetime = new Date();
                                        db.put(ingredientsInventoryDoc).then(function () {
                                      //      console.log("Doc updated in poch Db\n for  exisinng doc");
                                            utilservice.syncIngredientsInventory();

                                            resolve(true);
                                        }).catch(function (err) {
                                       //     console.log("Error while updating Data to poch Db\n");
                                       //     console.log(err);
                                            resolve(true);
                                        });

                                        // check for production quanity 
                                        if (product.Production) {
                                            for (var ic = 0; ic < producation.length; ic++) {
                                                required = 0;
                                                //var required = getSideIngQuanity(proSides, dbSides, ingredientsInventory[ic].clientId);
                                                for (var icont = 0; icont < product.Production.length; icont++) {
                                                    if (producation[ic].clientId == product.Production[icont].ProductionClientId) {
                                                        required = parseFloat(product.Production[icont].quantity);
                                                    }
                                                }
                                                producation[ic].AvailableQuantity =  parseFloat(producation[ic].AvailableQuantity) - required;
                                            }
                                        }

                                        ProductionInventoryDoc.docdata = producation;
                                        ProductionInventoryDoc.lastupdatetime = new Date();
                                        db.put(ProductionInventoryDoc).then(function () {
                                           // console.log("Doc updated in poch Db\n for  exisinng doc");
                                            utilservice.syncProductionInventry();
                                            utilservice.checkLowProductionNotification();
                                            utilservice.checkLowIngredientsNotification();
                                            resolve(true);
                                        }).catch(function (err) {
                                           // console.log("Error while updating Data to poch Db\n");
                                           // console.log(err);
                                            resolve(true);
                                        });
                                    }
                                }
                            });
                        });
                    });
                });
            });
        }

        function restoreInventory(productId, quanity) {
            return $q((resolve, reject) => {
                db.get('Product').then(function (existDocument) {
                    db.get('Ingredients').then(function (ingredientsInventoryDoc) {
                        db.get('Sides').then(function (sideInventoryDoc) {
                            db.get('Production').then(function (ProductionInventoryDoc) {
                                for (var pcon = 0; pcon < existDocument.docdata.length; pcon++) {
                                    if (existDocument.docdata[pcon].clientId == productId) {

                                        var product = existDocument.docdata[pcon];
                                        var ingredientsInventory = ingredientsInventoryDoc.docdata;
                                        var productinds = product.Ingradients;
                                        var dbSides = sideInventoryDoc.docdata;
                                        var proSides = product.Sides;
                                        var producation = ProductionInventoryDoc.docdata

                                        function getclientId(productSide) {
                                            try {
                                                if (productSide.indexOf('CUSTOM-GENERETED-ID') >= 0) {
                                                    return productSide
                                                }

                                            } catch (ddsdf) {
                                                return productSide.clientId
                                            }
                                        }
                                        //get ingridiant client id in case of db side
                                        function getIngclientId(DbSideingrediant) {
                                            try {
                                                if (DbSideingrediant.name.indexOf('CUSTOM-GENERETED-ID') >= 0) {

                                                    return DbSideingrediant.name
                                                }

                                            } catch (ddsdf) {
                                                return DbSideingrediant.name.clientId
                                            }
                                        }


                                        function getSideIngQuanity(proSides, dbSides, ingradientClientId) {
                                            var quantity = 0;
                                            for (var icont = 0; icont < proSides.length; icont++) {
                                                for (var ic = 0; ic < dbSides.length; ic++) {
                                                    if (dbSides[ic].clientId == getclientId(proSides[icont])) {
                                                        for (var i = 0; i < dbSides[ic].Ingradients.length; i++) {
                                                            if (ingradientClientId == getIngclientId(dbSides[ic].Ingradients[i])) {
                                                                quantity = parseFloat(dbSides[ic].Ingradients[i].quantity)
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            return quantity;
                                        }

                                        //for (var icont = 0; icont < productinds.length; icont++) {
                                        //    for (var ic = 0; ic < ingredientsInventory.length; ic++) {
                                        //        if (ingredientsInventory[ic].clientId == productinds[icont].ingradientClientId) {
                                        //            var required = parseFloat(productinds[icont].quantity) + getSideIngQuanity(proSides, dbSides, productinds[icont].ingradientClientId);
                                        //            ingredientsInventory[ic].Quantity = parseFloat(ingredientsInventory[ic].Quantity) + required;
                                        //        }
                                        //    }
                                        //}

                                        for (var ic = 0; ic < ingredientsInventory.length; ic++) {
                                            var required = getSideIngQuanity(proSides, dbSides, ingredientsInventory[ic].clientId);
                                            for (var icont = 0; icont < productinds.length; icont++) {
                                                if (ingredientsInventory[ic].clientId == productinds[icont].ingradientClientId) {
                                                    required = required + parseFloat(productinds[icont].quantity);
                                                }
                                            }
                                            ingredientsInventory[ic].Quantity = parseFloat(ingredientsInventory[ic].Quantity) + required;
                                        }

                                        ingredientsInventoryDoc.docdata = ingredientsInventory;
                                        ingredientsInventoryDoc.lastupdatetime = new Date();
                                        db.put(ingredientsInventoryDoc).then(function () {
                                           // console.log("Doc updated in poch Db\n for  exisinng doc");
                                            utilservice.syncIngredientsInventory();
                                            resolve(true);
                                        }).catch(function (err) {
                                           // console.log("Error while updating Data to poch Db\n");
                                           // console.log(err);
                                            resolve(true);
                                        });

                                        if (product.Production) {
                                            for (var ic = 0; ic < producation.length; ic++) {
                                                required = 0;
                                                //var required = getSideIngQuanity(proSides, dbSides, ingredientsInventory[ic].clientId);
                                                for (var icont = 0; icont < product.Production.length; icont++) {
                                                    if (producation[ic].clientId == product.Production[icont].ProductionClientId) {
                                                        required = parseFloat(product.Production[icont].quantity);
                                                    }
                                                }
                                                producation[ic].AvailableQuantity = parseFloat(producation[ic].AvailableQuantity) + required;
                                            }
                                        }

                                        ProductionInventoryDoc.docdata = producation;
                                        ProductionInventoryDoc.lastupdatetime = new Date();
                                        db.put(ProductionInventoryDoc).then(function () {
                                           // console.log("Doc updated in poch Db\n for  exisinng doc");
                                            utilservice.syncProductionInventry();
                                            utilservice.checkLowProductionNotification();
                                            utilservice.checkLowIngredientsNotification();
                                            resolve(true);
                                        }).catch(function (err) {
                                           // console.log("Error while updating Data to poch Db\n");
                                           // console.log(err);
                                            resolve(true);
                                        });

                                    }
                                }
                            });
                        });
                    });
                });
            });
        }
    }
})();
