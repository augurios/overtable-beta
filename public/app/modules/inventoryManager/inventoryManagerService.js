(function () {
    'use strict';

    angular
        .module('inventoryManager')
        .factory('inventoryManagerService.js', serviceFn)
        .service('serviceFun', serviceFn);

    serviceFn.$inject = ['$http', 'pouchDB', 'localStorageService', '$rootScope', 'utilservice', '$q'];
    /* @ngInject */
    function serviceFn($http, pouchDB, localStorageService, $rootScope, utilservice, $q) {
        var db = pouchDB('lanapp', { adapter: 'idb' });
        var service = {};
        service.AddCategory = AddCategory;
        service.GetSides = GetSides;
        service.GetProduction = GetProduction;
        service.GetCategory = GetCategory;
        service.GetIngedients = GetIngedients;
        service.AddIngedient = AddIngedient;
        service.AddProduct = AddProduct;
        service.AddSide = AddSide;
        service.AddProduction = AddProduction;
        service.UpdateIngedient = UpdateIngedient;
        service.UpdateSide = UpdateSide;
        service.UpdateProduction = UpdateProduction;
        service.DisableIngedient = DisableIngedient;
        service.DisableSides = DisableSides;
        service.DisableProduction = DisableProduction;
        service.DisableProduct = DisableProduct;
        service.UpdateProductionAmount = UpdateProductionAmount;
        service.reduceINGForProduction = reduceINGForProduction;
        service.GetProducts = GetProducts;
        service.UpdateCategory = UpdateCategory;
        service.UploadImage = UploadImage;
        service.UpdateProduct = UpdateProduct;
        service.DeleteCategory = DeleteCategory;
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


        function addMofiyfn(isExist, catid, doctomanage, existDocument) {
            var time = new Date();
            if (isExist) {
                if (existDocument && existDocument.docdata) {
                    existDocument.docdata.push(doctomanage);
                } else {
                    existDocument.docdata = [doctomanage];
                }
                existDocument.lastupdatetime = time;
            } else {
                existDocument = {
                    _id: catid,
                    docdata: [doctomanage],
                    lastupdatetime: time,
                    lastsynctime: time
                }
            }
            return existDocument;
        }

        function AddCategory(data) {
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('Category', data, addMofiyfn).then(function (res) {
                    utilservice.syncInventory().then(function (syncData) {
                      //  console.log(syncData.Category);
                    });
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function AddSide(data) {
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('Sides', data, addMofiyfn).then(function (res) {
                    // resolve(res);
                    utilservice.syncInventory().then(function (syncData) {
                        //resolve(syncData.Sides);
                    });
                    utilservice.checkLowIngredientsNotification();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function AddProduction(data) {
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('Production', data, addMofiyfn).then(function (res) {
                    // resolve(res);
                    utilservice.syncInventory().then(function (syncData) {
                        //resolve(syncData.Sides);
                    });
                    utilservice.checkLowProductionNotification();
                    utilservice.checkLowIngredientsNotification();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }


        function AddProduct(data) {
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('Product', data, addMofiyfn).then(function (res) {
                    // resolve(res);
                    utilservice.syncInventory().then(function (syncData) {
                        //resolve(syncData.Product);
                    });
                    utilservice.checkLowProductionNotification();
                    utilservice.checkLowIngredientsNotification();

                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function AddIngedient(data) {
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('Ingredients', data, addMofiyfn).then(function (res) {
                    // resolve(res);
                    utilservice.syncInventory().then(function (syncData) {
                        //resolve(syncData.Ingedients);
                    });
                    utilservice.checkLowIngredientsNotification();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function updateMofiyfn(isExist, catid, doctomanage, existDocument) {
            var time = new Date();
            if (isExist) {
                existDocument.lastupdatetime = time;
                if (catid == 'Category') {
                    for (var i = 0; i < existDocument.docdata.length; i++) {
                        if (existDocument.docdata[i].clientId == doctomanage.clientId) {
                            existDocument.docdata[i].Name = doctomanage.Name;
                        }
                    }
                } else if (catid == 'Ingredients') {
                    for (var i = 0; i < existDocument.docdata.length; i++) {
                        if (existDocument.docdata[i].clientId == doctomanage.clientId) {
                            existDocument.docdata[i].Cost = doctomanage.Cost;
                            existDocument.docdata[i].Edits = doctomanage.Edits;
                            existDocument.docdata[i].Merma = doctomanage.Merma;
                            existDocument.docdata[i].Name = doctomanage.Name;
                            existDocument.docdata[i].Quantity = doctomanage.Quantity;
                            existDocument.docdata[i].UnitType = doctomanage.UnitType;
                            existDocument.docdata[i].message = doctomanage.message;
                            existDocument.docdata[i].isactive = doctomanage.isactive;
                        }
                    }
                }
                else if (catid == 'Sides') {
                    for (var i = 0; i < existDocument.docdata.length; i++) {
                        if (existDocument.docdata[i].clientId == doctomanage.clientId) {
                            existDocument.docdata[i].Name = doctomanage.Name;
                            existDocument.docdata[i].Ingradients = doctomanage.Ingradients;
                            existDocument.docdata[i].isactive = doctomanage.isactive;
                        }
                    }
                }
                else if (catid == 'Production') {
                    for (var i = 0; i < existDocument.docdata.length; i++) {
                        if (existDocument.docdata[i].clientId == doctomanage.clientId) {
                            existDocument.docdata[i].Name = doctomanage.Name;
                            existDocument.docdata[i].Ingradients = doctomanage.Ingradients;
                            existDocument.docdata[i].isactive = doctomanage.isactive;
                            existDocument.docdata[i].Productionamount = doctomanage.Productionamount;
                            existDocument.docdata[i].ProductionUnit = doctomanage.ProductionUnit;
                            existDocument.docdata[i].message = doctomanage.message || "";
                        }
                    }
                }
                else if (catid == 'Product') {
                    if (doctomanage.type == "Retail") {
                        for (var i = 0; i < existDocument.docdata.length; i++) {
                            if (existDocument.docdata[i].clientId == doctomanage.clientId) {
                                existDocument.docdata[i].Category = doctomanage.Category;
                                existDocument.docdata[i].Edits = doctomanage.Edits;
                                existDocument.docdata[i].Ingradients = doctomanage.Ingradients;
                                existDocument.docdata[i].Name = doctomanage.Name;
                                existDocument.docdata[i].ParentCategory = doctomanage.ParentCategory;
                                existDocument.docdata[i].Price = doctomanage.Price;
                                existDocument.docdata[i].Quantity = doctomanage.Quantity;
                                existDocument.docdata[i].Sides = doctomanage.Sides;
                                existDocument.docdata[i].Production = doctomanage.Production;
                                existDocument.docdata[i].image = doctomanage.image;
                                existDocument.docdata[i].variations = doctomanage.variations;
                                existDocument.docdata[i].OrderGroup = doctomanage.OrderGroup;
                            }
                        }
                    } else {
                        for (var i = 0; i < existDocument.docdata.length; i++) {
                            if (existDocument.docdata[i].clientId == doctomanage.clientId) {
                                existDocument.docdata[i].Category = doctomanage.Category;
                                existDocument.docdata[i].Edits = doctomanage.Edits;
                                existDocument.docdata[i].Ingradients = doctomanage.Ingradients;
                                existDocument.docdata[i].Production = doctomanage.Production;
                                existDocument.docdata[i].Name = doctomanage.Name;
                                existDocument.docdata[i].ParentCategory = doctomanage.ParentCategory;
                                existDocument.docdata[i].Price = doctomanage.Price;
                                existDocument.docdata[i].Quantity = doctomanage.Quantity;
                                existDocument.docdata[i].Sides = doctomanage.Sides;
                                existDocument.docdata[i].image = doctomanage.image;
                                existDocument.docdata[i].variations = doctomanage.variations;
                                existDocument.docdata[i].OrderGroup = doctomanage.OrderGroup;
                            }
                        }
                    }
                } else {
                    throw new Error("Error in updating the data of -" + catid + " and type is not defined");
                }
            } else {
                throw new Error("Error in updating the data of -" + catid);
            }
            return existDocument;
        }

        function UpdateProduct(data) {
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('Product', data, updateMofiyfn).then(function (res) {
                    utilservice.syncInventory().then(function (syncData) {
                        //resolve(res);
                    });
                    utilservice.checkLowIngredientsNotification();
                    utilservice.checkLowProductionNotification();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function UpdateIngedient(data) {
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('Ingredients', data, updateMofiyfn).then(function (res) {
                    //resolve(res);
                    utilservice.syncInventory();
                    utilservice.checkLowIngredientsNotification();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function UpdateSide(data) {
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('Sides', data, updateMofiyfn).then(function (res) {
                    //resolve(res);
                    utilservice.syncInventory();
                    utilservice.checkLowIngredientsNotification();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function UpdateProduction(data) {
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('Production', data, updateMofiyfn).then(function (res) {
                    //resolve(res);
                    utilservice.syncInventory();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function UpdateCategory(data) {
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('Category', data, updateMofiyfn).then(function (res) {
                    //resolve(res);
                    utilservice.syncInventory();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function restorModfiyfn(isExist, catid, doctomanage, existDocument) {
            var time = new Date();
            if (isExist) {
                existDocument.docdata = doctomanage;
                existDocument.lastupdatetime = time;
                existDocument.lastsynctime = time;
            } else {
                existDocument = {
                    _id: catid,
                    docdata: doctomanage,
                    lastupdatetime: time,
                    lastsynctime: time
                }
            }
            return existDocument;
        }

        function GetSides() {
            return $q((resolve, reject) => {
                if ($rootScope.online) {
                    utilservice.getResId().then(function (resid) {
                        $http.post(window.APIBASEURL + '/api/get/Sides', { id: resid }).then(function (res) {
                            utilservice.addOrUpdateDocInPouchDB('Sides', res.data, restorModfiyfn).then(function (localreponse) {
                               // console.log("Sides addded successfully");
                            }).catch(function (err) {
                               // console.log("error in adding Sides");
                            });
                            resolve(res.data);
                        }, handleError('Error getting all users'));
                    });
                } else {
                    db.get('Sides', function (err, doc) {
                        resolve(doc.docdata);
                    });
                }
            });
        }

        function GetProduction(fromlocal) {
            return $q((resolve, reject) => {
                if (fromlocal) {
                    db.get('Production', function (err, doc) {
                        resolve(doc.docdata);
                    });
                } else {
                    if ($rootScope.online) {
                        utilservice.getResId().then(function (resid) {
                            $http.post(window.APIBASEURL + '/api/get/Production', { id: resid }).then(function (res) {
                                utilservice.addOrUpdateDocInPouchDB('Production', res.data, restorModfiyfn).then(function (localreponse) {
                                   // console.log("Production addded successfully");
                                }).catch(function (err) {
                                   // console.log("error in adding Production");
                                });
                                resolve(res.data);
                            }, handleError('Error getting all users'));
                        });
                    } else {
                        db.get('Production', function (err, doc) {
                            resolve(doc.docdata);
                        });
                    }
                }
            });
        }

        function GetCategory(fromlocal) {
            return $q((resolve, reject) => {
                if (fromlocal) {
                    db.get('Category', function (err, doc) {
                        var category = [];
                        for (var i = 0; i < doc.docdata.length; i++) {
                            if (doc.docdata[i].ParentCategory) {
                                try {
                                    if (doc.docdata[i].ParentCategory.indexOf('CUSTOM-GENERETED-ID') != -1) {
                                        var parCat = _.find(doc.docdata, function (num) { return num.clientId == doc.docdata[i].ParentCategory });
                                        doc.docdata[i].ParentCategory = parCat;
                                    }
                                } catch (dfsdf) { }
                            }
                        }
                        resolve(doc.docdata);
                    });
                } else {
                    if ($rootScope.online) {
                        utilservice.getResId().then(function (resid) {
                            $http.post(window.APIBASEURL + '/api/get/Category', { id: resid }).then(function (res) {
                                debugger;
                               // console.log(res);
                                utilservice.addOrUpdateDocInPouchDB('Category', res.data, restorModfiyfn).then(function (localreponse) {
                                   // console.log("category added successfuly");
                                }).catch(function (err) {
                                    console.log("error in addinf category");
                                });
                                resolve(res.data);
                            }, handleError('Error getting all users'));
                        });
                    } else {
                        db.get('Category', function (err, doc) {
                            resolve(doc.docdata);
                        });
                    }
                }
            });
        }

        function GetIngedients(fromlocal) {
            return $q((resolve, reject) => {
                if (fromlocal) {
                    db.get('Ingredients', function (err, doc) {
                        resolve(doc.docdata);
                    });
                } else {
                    if ($rootScope.online) {
                        utilservice.getResId().then(function (resid) {
                            $http.post(window.APIBASEURL + '/api/get/Ingredients', { id: resid }).then(function (res) {
                                utilservice.addOrUpdateDocInPouchDB('Ingredients', res.data, restorModfiyfn).then(function (localreponse) {
                                   // console.log("Ingredients addded successfully");
                                }).catch(function (err) {
                                  //  console.log("error in adding Ingredients");
                                });
                                resolve(res.data);
                            }, handleError('Error getting all users'));
                        });
                    } else {
                        db.get('Ingredients', function (err, doc) {
                            resolve(doc.docdata);
                        });
                    }
                }
            });
        }

        function GetProducts(fromlocal) {
            return $q(function (resolve, reject) {
                if (fromlocal) {
                    db.get('Product', function (err, doc) {
                        db.get('Ingredients').then(function (ingredientsInventoryDoc) {
                            db.get('Sides').then(function (sideInventoryDoc) {
                                db.get('Production').then(function (ProductionInventoryDoc) {
                                    var Dbingredi = ingredientsInventoryDoc.docdata
                                    var Dbsides = sideInventoryDoc.docdata
                                    var DbProduction = ProductionInventoryDoc.docdata
                                    for (var i = 0; i < doc.docdata.length; i++) {
                                        if (doc.docdata[i].Sides) {
                                            for (var sid = 0; sid < doc.docdata[i].Sides.length; sid++) {
                                                if (doc.docdata[i].Sides[sid]) {
                                                    try {
                                                        if (doc.docdata[i].Sides[sid].indexOf('CUSTOM-GENERETED-ID') >= 0) {
                                                            var Sidesobj = _.find(Dbsides, function (num) { return num.clientId == doc.docdata[i].Sides[sid] });
                                                            doc.docdata[i].Sides[sid] = Sidesobj
                                                        }
                                                    } catch (dfsdf) { }
                                                }
                                            }
                                        }
                                        if (doc.docdata[i].Ingradients) {
                                            for (var ing = 0; ing < doc.docdata[i].Ingradients.length; ing++) {
                                                if (doc.docdata[i].Ingradients[ing].name) {
                                                    try {
                                                        if (doc.docdata[i].Ingradients[ing].name.indexOf('CUSTOM-GENERETED-ID') >= 0) {
                                                            var ingriObj = _.find(Dbingredi, function (num) { return num.clientId == doc.docdata[i].Ingradients[ing].name });
                                                            doc.docdata[i].Ingradients[ing].name = ingriObj;
                                                        }
                                                    } catch (dfsdf) { }
                                                }
                                            }
                                        }
                                        if (doc.docdata[i].Production) {
                                            for (var ing = 0; ing < doc.docdata[i].Production.length; ing++) {
                                                if (doc.docdata[i].Production[ing].ProductionClientId) {
                                                    try {
                                                        if (doc.docdata[i].Production[ing].ProductionClientId.indexOf('CUSTOM-GENERETED-ID') >= 0) {
                                                            var productionObj = _.find(DbProduction, function (num) { return num.clientId == doc.docdata[i].Production[ing].ProductionClientId });
                                                            doc.docdata[i].Production[ing].name = productionObj;
                                                        }
                                                    } catch (dfsdf) { }
                                                }
                                            }
                                        }

                                    }

                                    resolve(doc.docdata);
                                });
                            });
                        });
                    });
                } else {
                    if ($rootScope.online) {
                        utilservice.getResId().then(function (resid) {
                            $http.post(window.APIBASEURL + '/api/get/Product', { id: resid }).then(function (res) {
                                utilservice.addOrUpdateDocInPouchDB('Product', res.data, restorModfiyfn).then(function (localreponse) {
                                   // console.log("Product addded successfully");
                                    resolve(res.data);
                                }).catch(function (err) {
                                   // console.log("error in adding Product");
                                    resolve(res.data);
                                });
                            }, handleError('Error getting all users'));
                        });
                    } else {
                        db.get('Product', function (err, doc) {
                            resolve(doc.docdata);
                        });
                    }
                }
            });
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
        function UploadImage(data) {
            return $http.post(window.APIBASEURL + '/api/v1/uploadImage', data).then(function (res) {

                return res;

            }, function (error) {

                return error;
            });

        }

        function DeleteCategory(doctomanage, subids) {
            var db = pouchDB('lanapp', { adapter: 'idb' });
            return $q(function (resolve, reject) {
                db.get('Category').then(function (existDocument) {
                   // console.log(existDocument);
                    existDocument.lastupdatetime = new Date();
                    for (var i = 0; i < existDocument.docdata.length; i++) {
                        if (existDocument.docdata[i].clientId == doctomanage) {
                            existDocument.docdata.splice(i, 1)
                        }
                    }

                   // console.log(utilservice);
                    function mofiyfn(isExist, catid, doctomanage, existDocument) {
                        var time = new Date();
                        var newDoc = existDocument || {};

                        newDoc.IDS = newDoc.IDS || [];

                        if (newDoc.IDS.length > 0) {
                            var even = _.find(newDoc.IDS, function (num) { return num == doctomanage });
                            if (!even) {
                                newDoc.IDS.push(doctomanage);
                            }
                            for (var i = 0; i < subids.length; i++) {
                                var even = _.find(newDoc.IDS, function (num) { return num == subids[i] });
                                if (!even) {
                                    newDoc.IDS.push(subids[i]);
                                }
                            }
                           
                        } else {
                            newDoc.IDS.push(doctomanage);
                            for (var i = 0; i < subids.length; i++) {
                                newDoc.IDS.push(subids[i]);
                            }
                        }
                       // console.log(newDoc.IDS)
                      
                        newDoc._id = catid;
 
                        newDoc.lastupdatetime = time;
                        
                        newDoc.lastsynctime = new Date(new Date().getTime() - 100000);//new Date(time.setMinutes(time.getMinutes() - 30));
                        //setTimeout(function () {
                        //    ;
                        //},200)
                        return newDoc;
                    }

                    //doctomanage.lastsynctime = new Date();
                    utilservice.addOrUpdateDocInPouchDB('CATTODELETE', doctomanage, mofiyfn).then(function () {
                        utilservice.deleteCategoty();
                    });

                    db.put({
                        _id: 'Category',
                        _rev: existDocument._rev,
                        docdata: existDocument.docdata
                    }).then(function () {
                        // console.log("Doc updated in poch Db\n for  exisinng doc");
                        utilservice.syncInventory();
                        resolve(doctomanage);
                    }).catch(function (err) {
                       // console.log("Error while updating Data to poch Db\n");
                       // console.log(err);
                        reject(err);
                    });
                })
            });
        }

        function disbaleMofiyfn(isExist, catid, doctomanage, existDocument) {
            var time = new Date();
            if (isExist) {
                existDocument.lastupdatetime = time;
                if (catid == 'Ingredients') {
                    for (var i = 0; i < existDocument.docdata.length; i++) {
                        if (existDocument.docdata[i].clientId == doctomanage.clientId) {
                            existDocument.docdata[i].isactive = doctomanage.isactive;
                        }
                    }
                }
                else if (catid == 'Sides') {
                    for (var i = 0; i < existDocument.docdata.length; i++) {
                        if (existDocument.docdata[i].clientId == doctomanage.clientId) {
                            existDocument.docdata[i].isactive = doctomanage.isactive;
                        }
                    }
                }
                else if (catid == 'Production') {
                    for (var i = 0; i < existDocument.docdata.length; i++) {
                        if (existDocument.docdata[i].clientId == doctomanage.clientId) {
                            // existDocument.docdata[i].AvailableQuantity = doctomanage.AvailableQuantity;
                            existDocument.docdata[i].isactive = doctomanage.isactive;
                        }
                    }
                }
            } else {
                throw new Error("Error in updating the data of -" + catid);
            }
            return existDocument;
        }

        function UpdateAmount(isExist, catid, doctomanage, existDocument) {
            var time = new Date();
            if (isExist) {
                existDocument.lastupdatetime = time;
                if (catid == 'Production') {
                    for (var i = 0; i < existDocument.docdata.length; i++) {
                        if (existDocument.docdata[i].clientId == doctomanage.clientId) {
                            existDocument.docdata[i].AvailableQuantity = doctomanage.AvailableQuantity;
                            existDocument.docdata[i].message = doctomanage.message;
                        }
                    }
                }
            } else {
                throw new Error("Error in updating the data of -" + catid);
            }
            return existDocument;
        }




        function DisableIngedient(data) {
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('Ingredients', data, updateMofiyfn).then(function (res) {
                    //resolve(res);
                    utilservice.syncInventory();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function DisableSides(data) {
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('Sides', data, disbaleMofiyfn).then(function (res) {
                    //resolve(res);
                    utilservice.syncInventory();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
        function DisableProduction(data) {
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('Production', data, disbaleMofiyfn).then(function (res) {
                    //resolve(res);
                    utilservice.syncInventory();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function disbaleprod(isExist, catid, doctomanage, existDocument) {
            var time = new Date();
            if (isExist) {
                existDocument.lastupdatetime = time;
                if (catid == 'Product') {
                    for (var i = 0; i < existDocument.docdata.length; i++) {
                        if (existDocument.docdata[i].clientId == doctomanage.clientId) {
                            existDocument.docdata[i].isactive = doctomanage.isactive;
                        }
                    }
                }
                
            } else {
                throw new Error("Error in updating the data of -" + catid);
            }
            return existDocument;
        }




        function DisableProduct(data) {
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('Product', data, disbaleprod).then(function (res) {
                    //resolve(res);
                    utilservice.syncInventory();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function UpdateProductionAmount(data) {
            return $q((resolve, reject) => {
                utilservice.addOrUpdateDocInPouchDB('Production', data, UpdateAmount).then(function (res) {
                    //resolve(res);
                    utilservice.syncInventory();
                    utilservice.checkLowProductionNotification();
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }

        function reduceINGForProduction(production) {
            return $q((resolve, reject) => {
                db.get('Ingredients').then(function (ingredientsInventoryDoc) {
                    var ingredientsInventory = ingredientsInventoryDoc.docdata;
                    for (var icnt = 0; icnt < production.Ingradients.length; icnt++) {
                        var pING = production.Ingradients[icnt];
                        for (var refcnt = 0; refcnt < ingredientsInventory.length; refcnt++) {
                            if (pING.ingradientClientId == ingredientsInventory[refcnt].clientId) {
                                ingredientsInventory[refcnt].Quantity = ingredientsInventory[refcnt].Quantity - parseFloat(pING.quantity);
                            }
                        }
                    }
                    ingredientsInventoryDoc.docdata = ingredientsInventory;
                    ingredientsInventoryDoc.lastupdatetime = new Date();
                    db.put(ingredientsInventoryDoc).then(function () {
                       // console.log("Doc updated in poch Db\n for  exisinng doc");
                        utilservice.syncIngredientsInventory();
                        utilservice.checkLowIngredientsNotification();
                        resolve(true);
                    }).catch(function (err) {
                       // console.log("Error while updating Data to poch Db\n");
                       // console.log(err);
                        resolve(true);
                    });
                });
            });
        }
    }
})();
