angular
    .module('mainServerapp')
    .factory('pathservice', ['$http', 'pouchDB', 'PATHS', '$rootScope', function ($http, pouchDB, PATHS, $rootScope) {
     var db =  pouchDB('lanapp', {adapter : 'idb'});
     var consts = {
         consts: function (callback) {
             if ($rootScope.online) {
                        $http.get(window.APIBASEURL+'/auth/getpaths')
                      .success(function (data) {
                          db.put({
                             _id: 'constants',
                            paths : data
                          }).then(function (response) {
                            callback(data);
                          }).catch(function (err) {
                            callback(data);
                          });
                      })
                      .error(function (data) {
                          console.log('Error auth/paths: ' + data)
                          db.get('constants', function(err, doc) {
                            if (err) { return console.log(err); }
                              callback(doc.paths);
                          });
                      });
                    }
                    else{
                      db.get('constants', function(err, doc) {
                        if (err) { return console.log(err); }
                          callback(doc.paths);
                      });
                    }
                }
     }
    return consts;
}]);
(function() {
  'use strict';

  angular
    .module('mainServerapp')
    .factory('SessionService', sessionService)
    .factory('httpRequestInterceptor',httpRequestInterceptor)
    .factory('socket', socketService)
  sessionService.$inject = ['$http', '$location', '$window', 'toaster', '$q', '$state', 'pouchDB', '$rootScope', 'alertservice'];
    /* @ngInject */
  function sessionService($http, $location, $window, toaster, $q, $state, pouchDB, $rootScope, alertservice) {
      var db = pouchDB('lanapp', { adapter: 'idb' });

      var Session = {
          data: {
              role_id: ''
          },
          status: {
              status_id: 0
          },
          sessions: {
              sess: {}
          },
          getAuthUrl(){
              var authurl = window.APIBASEURL + '/clientapp/auth/get_session/' + localStorage.getItem("INSTANCEID");
              return authurl;
          },
          getSession: function () {
              console.log("getSession method");
              if ($rootScope.online) {
                  $http.get(this.getAuthUrl(), { cache: false })
                .success(function (data) {


                    if (typeof data.userid == "undefined" || data.userid == null || data == 0) {
                        var userIsAuthenticated = false;
                        $location.path('/login');
                    }
                    else {
                        var userIsAuthenticated = true;
                    }
                })
                  .error(function (data) {
                      var userIsAuthenticated = false;
                      $location.path('/login');
                      console.log('Error: ' + data);
                  });
              }
              else {

                  db.get('usersess', function (err, doc) {
                      if (err) { console.log(err); $location.path('/login'); }

                      var data = doc.usermoment;
                      console.log(doc.usermoment)
                      if (typeof data.userid == "undefined" || data.userid == null || data == 0) {
                          var userIsAuthenticated = false;
                          $location.path('/login');
                      }
                      else {
                          var userIsAuthenticated = true;
                      }
                  });
              }
          },   // get session
          
          loginResolver: function () {
              var deferred = $q.defer();
              if ($rootScope.online) {
                  $http.get(this.getAuthUrl(), { cache: false })
                    .success(function (data) {
                        db.get('usersess', function (err, doc) {
                            if (err) {
                                console.log("error on updating session on loginResolver")
                                console.log(err)
                                db.put({
                                    _id: 'usersess',
                                    usermoment: data
                                });
                            }
                            else {
                            }

                        })
                        if (data == 0 || data == null) {
                            $state.go('/login');
                            deferred.resolve({ success: false, data: null });
                        }
                        else {
                            deferred.resolve({ success: true, data: data });
                        }
                    }).error(function (msg, code) {
                        deferred.reject(msg);
                    });
                  return deferred.promise;
              }
              else {
                  db.get('usersess', function (err, doc) {
                      if (err) {
                          $state.go('/login');
                          deferred.resolve({ success: false, data: null });
                      }
                      else {
                          deferred.resolve({ success: true, data: data });
                      }
                  })
              }
              return deferred.promise;
          },

          rootPage: function () {
              console.log("getSession rootPage");
              var deferred = $q.defer();
              if ($rootScope.online) {
                  $http.get(getAuthUrl(), { cache: false })
                .success(function (data) {
                    $http.get(window.APIBASEURL + '/api/get/employee')
                        .success(function (employess) {
                            console.log(employess)
                            db.put({
                                _id: 'employee',
                                emplyoeedata: employess.data
                            });
                            deferred.resolve({ success: true, data: data });
                        })
                    if (data == 0 || data == null) {
                        $state.go('/login');
                        deferred.resolve({ success: false, data: null });
                    }
                    else {
                        $state.go('/login');
                        deferred.resolve({ success: true, data: data });
                    }
                }).error(function (msg, code) {
                    deferred.reject(msg);
                });
                  return deferred.promise;
              } else {
                  console.log("Offline Session Fecthing isLoggedIn")
                  console.log("Offline getSession isLoggedIn");
                  db.get('usersess', function (err, doc) {
                      if (err) {
                          console.log(err);
                          $state.go('/login'); return false
                      }
                      var data = doc.usermoment;
                      if (data == 0 || data == null) {
                          $state.go('/login');  
                          deferred.resolve(false);
                      }
                      else {
                          $location.path('/dashboard');
                          //return true
                          deferred.resolve(true);
                      }
                  }).catch(function (err) {
                      $state.go('/login')
                  });
              }
          },       
          isLoggedIn: function () {
              console.log("getSession isLoggedIn 2");
              var deferred = $q.defer();
              if ($rootScope.online) {
                  $http.get(this.getAuthUrl(), { cache: false })
                    .success(function (data) {

                        if (data == 0 || data == null) {
                            $state.go('/login');
                            deferred.resolve(false);
                        }
                        else {
                            $location.path('/dashboard');
                            deferred.resolve(true);
                        }
                    }).error(function (msg, code) {
                        deferred.resolve(false);
                    });                  
              }
              else {

                  console.log("Offline Session Fecthing isLoggedIn")
                  console.log("Offline getSession isLoggedIn");
                  db.get('usersess', function (err, doc) {
                      if (err) {
                          console.log(err);
                          $state.go('/login');
                          deferred.resolve(false);
                      }
                      var data = doc.usermoment;
                      console.log(doc.usermoment)
                      if (data == 0 || data == null) {
                          $state.go('/login');
                          deferred.resolve(false);
                      }
                      else {
                          localStorage.setItem("INSTANCEID", data.instanceid);
                          localStorage.setItem("EMAIL", data.email);
                          deferred.resolve(true);
                      }
                  });
              }
              return deferred.promise;
          },
          logOut: function () {
              console.log("logOut mthod")
              if ($rootScope.online) {
                  $http.post(window.APIBASEURL + '/clientapp/api/logout/' + localStorage.getItem("INSTANCEID"))
                      .success(function (data) {
                          if (data.user == null) {
                              db.destroy().then(function (response) {
                                  // success
                                  window.location = '/';
                                  alertservice.showAlert('success', "Success", "You have successfully logged out")
                              }).catch(function (err) {
                                  console.log(err);
                              });
                          }
                      })
                      .error(function (data) {
                          console.log('Error: ' + data);
                      });
              }
              else {

                  db.get('employee').then(function (doc) {
                      db.remove(doc);
                  }).then(function (result) {
                  }).catch(function (err) {
                      console.log(err);
                  });
                  db.get('usersess').then(function (doc) {
                      db.remove(doc);
                      window.location = '/';
                      alertservice.showAlert('success', "Success", "You have successfully logged out")
                  }).then(function (result) {
                      window.location = '/';
                      alertservice.showAlert('success', "Success", "You have successfully logged out")
                  }).catch(function (err) {
                      console.log(err);
                      window.location = '/';
                      alertservice.showAlert('success', "Success", "You have successfully logged out")
                  });

              }
          },// log out everyone
          userInfo: function (callback) {
              console.log("logOut mthod")
              if ($rootScope.online) {
                  $http.get(this.getAuthUrl(), { cache: false })
                .success(function (data) {
                    return callback(data);
                })
                  .error(function (data) {
                      var userIsAuthenticated = false;
                      $location.path('/login');
                      console.log('Error: ' + data);
                  });
              } else {

                  console.log("Offline Session Fecthing isLoggedIn")
                  db.get('usersess', function (err, doc) {
                      if (err) { console.log(err); $state.go('/login'); return false }

                      var data = doc.usermoment;
                      console.log(doc.usermoment)
                      if (data == 0 || data == null) {
                          $state.go('/login');
                          return false
                          //deferred.resolve(false);
                      }
                      else {
                          $location.path('/dashboard');
                          return true
                          // deferred.resolve(true);
                      }
                  });
              }
          }
      };

      return Session;

  }//fn session service

    httpRequestInterceptor.$inject = ['$rootScope','localStorageService'];
    /* @ngInject */
    function httpRequestInterceptor($rootScope,localStorageService) {
      return {
         request: function($config) {
             $config.headers['x-access-token'] = localStorageService.get('_meanLanApp');
          return $config;
        }
      }
    }//fn httpRequestInterceptor service

    socketService.$inject = ['$rootScope'];
    function socketService($rootScope) {
        console.log("socket service to connect -" + window.APIBASEURL);
        var socket = io.connect("http://overtableapp.disruptive.pro:8088/");
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            },
        };
    }

})()

angular
.module('mainServerapp').factory('PermissionService', ['$http', '$uibModal', '$location', '$state', '$window', 'toaster', 'alertservice', function ($http, $uibModal, $location, $state, $window, toaster, alertservice) {

var permissionModule = {
    checkPermission: function (data) {
        //var params = { pos : $location.$$path}
        var urlRq = typeof data == "undefined" ? $location.$$path : data
        var params = { pos : urlRq }
        var promise = $http.post(window.APIBASEURL + '/api/v1/check_permission', params)
          .then(function (response) {

            if(response.data == 1){
              return true
            }
            else{
                alertservice.showAlert("error", "Unauthenticated access", "You are not permitted.")
              $state.go('404')
            }

        });
    }
}
return permissionModule;
}]);


(function () {
  'use strict';
  angular
    .module('mainServerapp')
    .factory('translationService', translationService);
  /* @ngInject */
  translationService.$inject = ['$window'];
  function translationService($window) {
    var langKey;
    var Service = {
      get: get,
      set: set,
      put: put
    };

    return Service;

    function get(name) {
      if (!langKey) {
        langKey = $window.localStorage.getItem(name);
      }

      return langKey;
    }

    function set(name, value) {
      var isoCode;

      if (!value || value === '') {
        value = 'en';
      }
      isoCode = value;
      langKey = value;
      // $window.moment.locale(isoCode);
      $window.localStorage.setItem(name, value);
    }

    function put(name, value) {
      var isoCode;

      if (!value || value === '') {
        value = 'en';
      }
      isoCode = value;
      langKey = value;
      // $window.moment.locale(isoCode);
      $window.localStorage.setItem(name, value);
    }
  }
})();

angular
    .module('mainServerapp')
    .factory('dataservice',['$http','pouchDB','breeze','$timeout', dataserviceFn])

    function dataserviceFn($http,pouchDB,breeze,$timeout) {

        // convert server PascalCase property names to camelCase
        breeze.NamingConvention.camelCase.setAsDefault();

        // create a new manager talking to sample service
        var host="http://sampleservice.breezejs.com";
        var serviceName = host+"/api/todos";
        var manager = new breeze.EntityManager(serviceName);



        var service = {
          getAllTodos: getAllTodos,
          save: save,
          reset: reset
        };
        return service;

        /*** implementation ***/

        function getAllTodos() {
          console.log("Getting Todos");
          return breeze.EntityQuery.from("Todos")
                .using(manager).execute()
                .then(success)
                .catch(function(error){ opFailed('Get Todos', error)} );

          function success(data) {
              console.log("Retrieved " + data.results.length);
              return data.results;
          }
        }

        function opFailed(operation, error){
          console.log(operation + " failed: \n"+error);
          throw error; // re-throw so next in promise chain sees it
        }

        function save(){
          var changeCount = manager.getChanges().length;
          var msg = (save)
            ? "Saving "+ changeCount + " change(s) ..."
            : "No changes to save";

          console.log(msg);
          return manager
            .saveChanges()
            .then( function (data) {
              console.log("Saved  " + changeCount);}
            )
            .catch(function(error) { opFailed('Save', error)} );
        }

        function reset() {
          console.log("Resetting the data to initial state");
          manager.clear();

          return $http.post(serviceName + '/reset')
            .then( function (data) { console.log("Database reset");} )
            .catch(function(error) { opFailed('Database reset', error)} );

        }

    }



angular
    .module('mainServerapp')
    .factory('socket',['$rootScope', function ($rootScope) {
      var socket = io.connect();
      return {
        on: function (eventName, callback) {
          socket.on(eventName, function () {
            var args = arguments;
            $rootScope.$apply(function () {
              callback.apply(socket, args);
            });
          });
        },
        emit: function (eventName, data, callback) {
          socket.emit(eventName, data, function () {
            var args = arguments;
            $rootScope.$apply(function () {
              if (callback) {
                callback.apply(socket, args);
              }
            });
          })
        }
      };
    }]);


angular
    .module('mainServerapp')
    .factory('configservice', ['appconfig', appconfigserviceFn])

function appconfigserviceFn() {

    var service = {
        orderStatusContants: orderStatusContants
    };

    function orderStatusContants() {
        this.New = "New"
    };

}


angular
    .module('mainServerapp')
    .factory('alertservice', ['toaster', alertserviceFn])

function alertserviceFn(toaster) {

    var service = {
        showAlert: showAlert
    };
    return service;

    /*** implementation ***/

    function showAlert(type, title, message, timeout, closeCallback) {

        var options = {
            content: message, // text of the snackbar
            style: "toast", // add a custom class to your snackbar
            htmlAllowed: true
        }

        if (timeout)
            Option.timeout = timeout;
        else
            Option.timeout = 2000;

        if (closeCallback)
            options.onClose = closeCallback // callback called when the snackbar gets closed.

        var isSnackBar = true;                                                         ;

        if (isSnackBar)
            $.snackbar(options);
        else
            toaster.pop(type, title, message);
    }
}



angular
    .module('mainServerapp')
    .factory('utilservice', ['$http','$rootScope','$q','pouchDB','alertservice','localStorageService', utilserviceFn])

function utilserviceFn($http, $rootScope, $q, pouchDB, alertservice, localStorageService) {

    var service = {
        idMatcher: idMatcher,
        isOnline, isOnline,
        loadShift: loadShift,
        loadRooms: loadRooms,
        printOrder: printOrder,
        loadTables: loadTables,
        loadCategory: loadCategory,
        loadIngedients: loadIngedients,
        loadSides: loadSides,
        loadProductions: loadProductions,
        loadProduct, loadProduct,
        loadEmployees: loadEmployees,
        loadInvoices: loadInvoices,
        loadOrders: loadOrders,
        loadBillNumber:loadBillNumber,
        getEmployees: getEmployees,
        generateGUID: generateGUID,
        getResId: getResId,
        syncInventory: syncInventory,
        deleteCategoty:deleteCategoty,
        syncProductInventory: syncProductInventory,
        syncIngredientsInventory: syncIngredientsInventory,
        syncProductionInventry: syncProductionInventry,
        syncINVOICES: syncINVOICES,
        syncSidesInventry: syncSidesInventry,
        syncShift: syncShift,
        addOrUpdateDocInPouchDB: addOrUpdateDocInPouchDB,
        getDocFromPouchDB: getDocFromPouchDB,
        removeDocFromPouchDB: removeDocFromPouchDB,
        setDocIntoPouchDB: setDocIntoPouchDB,
        forceUpdate: forceUpdate,
        getShift: getShift,
        loadRestaurant: loadRestaurant,
        checkLowProductionNotification: checkLowProductionNotification,
        checkLowIngredientsNotification: checkLowIngredientsNotification,
        getUserDetails: getUserDetails,
        getNagitveSetting: getNagitveSetting
    };
    return service;




    function getNagitveSetting() {

        if (localStorage.getItem("isNegativeOrder"))
            var negv = JSON.parse(localStorage.getItem("isNegativeOrder"));

        if (negv) 
          return  negv.value;
        else 
            return true;
      
    }

    function getUserDetails(id) {
        return $http.get(window.APIBASEURL + '/api/v1/getuserbyid/' + id).then(handleSuccess, handleError('Error getting user data'));
    }
    function handleSuccess(res) {
        return res.data;
    }
    function handleError(error) {
        return function () {
            return { success: false, message: error };
        };
    }

    function checkLowIngredientsNotification() {
        var db = pouchDB('lanapp', { adapter: 'idb' });
        return $q((resolve, reject) => {
            db.get('Product').then(function (existDocument) {
                db.get('Ingredients').then(function (ingredientsInventoryDoc) {
                    db.get('Sides').then(function (sideInventoryDoc) {

                        existDocument.docdata = _.reject(existDocument.docdata, function (product) {
                            return product.isactive == 0;
                        });

                        var product = existDocument.docdata;
                        var ingredientsInventory = ingredientsInventoryDoc.docdata;
                        var dbSides = sideInventoryDoc.docdata;
                        var reuiredIngradientArray = [];
                        for (var pcon = 0; pcon < product.length; pcon++) {
                          
                            if (product[pcon].type == "Product") {
                               
                               // var productinds = product.Ingradients;
                              
                              //  var proSides = product.Sides;
                               
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
                                   // if (ingredientsInventory[ic].Quantity < 0)
                                     //   ingredientsInventory[ic].Quantity = 0;
                                    var required = 0;
                                    required = getSideIngQuanity(product[pcon].Sides, dbSides, ingredientsInventory[ic].clientId);
                                    for (var icont = 0; icont < product[pcon].Ingradients.length; icont++) {
                                        if (ingredientsInventory[ic].clientId == product[pcon].Ingradients[icont].ingradientClientId) {
                                            required = parseInt(required) + parseInt(product[pcon].Ingradients[icont].quantity);
                                        }
                                    }
                                    var checkSameIngrident = null;
                                    if (reuiredIngradientArray.length > 0) {
                                        checkSameIngrident = _.find(reuiredIngradientArray, function (num) { return num.ingradientClientId == ingredientsInventory[ic].clientId });
                                    }
                                    if (checkSameIngrident) {
                                        if (parseInt(required) > checkSameIngrident.Required)
                                        checkSameIngrident.Required = parseInt(required);
                                    }
                                    else
                                        reuiredIngradientArray.push({ ingradientClientId: ingredientsInventory[ic].clientId, Required: required })

                                }

                            }
                        }

                        var toStore = [];
                        var IngredientNotification = [];
                        try {
                            if (localStorage.getItem("IngredientNotification")) {
                               IngredientNotification = JSON.parse(localStorage.getItem('IngredientNotification'))
                            }
                        } catch (ddsfsdf) {

                        }

                       

                        for (var i = 0; i < reuiredIngradientArray.length; i++) {
                            var checkAvailableIngrident = _.find(ingredientsInventory, function (num) { return num.clientId == reuiredIngradientArray[i].ingradientClientId });
                            if (checkAvailableIngrident && checkAvailableIngrident.Quantity <= 0) {
                                if (reuiredIngradientArray[i].Required >= 0) {
                                        toStore.push({
                                            ingredientsItem: checkAvailableIngrident,
                                            notType: "Depleted",
                                            useInProducts: reuiredIngradientArray[i].Required,
                                            time: new Date(),
                                            Status: true
                                        });
                                   
                                }
                            } else if (checkAvailableIngrident && checkAvailableIngrident.Quantity < 3 * reuiredIngradientArray[i].Required) {
                                toStore.push({
                                    ingredientsItem: checkAvailableIngrident,
                                    notType: "Running low",
                                    useInProducts: reuiredIngradientArray[i].Required,
                                    time: new Date(),
                                    Status:true
                                });
                            }
                        }
                        for (var i = 0; i < toStore.length; i++) {

                            var localIngridientsNotif = _.find(IngredientNotification, function (num) { return num.ingredientsItem.clientId == toStore[i].ingredientsItem.clientId; });
                            if (localIngridientsNotif && !localIngridientsNotif.Status) {
                                if (new Date().getTime() - new Date(localIngridientsNotif.time).getTime() <= (24 * 1000 * 60 * 60)) {
                                    toStore[i].Status = false;
                                    toStore[i].time = new Date();
                                }

                            }

                        }
                        
                        localStorage.setItem("IngredientNotification", JSON.stringify(toStore))





                    });
                });
            });
        });
    }


    function checkLowProductionNotification() {
        var db = pouchDB('lanapp', { adapter: 'idb' });
        return $q((resolve, reject) => {
            db.get('Product').then(function (existDocument) {
                db.get('Production').then(function (ProductionInventoryDoc) {
                    var DbProduct = existDocument.docdata;
                    DbProduct =  _.reject(DbProduct, function (product) {
                        return product.isactive == 0;
                    });
                    var DbProduction = ProductionInventoryDoc.docdata;
                    DbProduction = _.reject(DbProduction, function (production) {
                        return production.isactive == 0;
                    });
                    var reuiredProductionArray = [];
                    for (var pcon = 0; pcon < DbProduct.length; pcon++) {
                        if (DbProduct[pcon].Production) {
                            required = 0;
                            //var required = getSideIngQuanity(proSides, dbSides, ingredientsInventory[ic].clientId);
                            for (var icont = 0; icont < DbProduct[pcon].Production.length; icont++) {
                                required = parseFloat(DbProduct[pcon].Production[icont].quantity);
                                var checkSameProduction=null;
                                if (reuiredProductionArray.length > 0) {
                                    checkSameProduction= _.find(reuiredProductionArray, function (num) { return num.ProductionClientId == DbProduct[pcon].Production[icont].ProductionClientId });
                                }
                                if (checkSameProduction) {
                                    if (required > checkSameProduction.Required)
                                    checkSameProduction.Required =  required
                                }
                                else
                                    reuiredProductionArray.push({ ProductionClientId: DbProduct[pcon].Production[icont].ProductionClientId, Required: required })
                            }
                        }
                    }

                    var toStore = [];
                    var ProductionNotification = [];
                    try {
                        if (localStorage.getItem("ProductionNotification")) {
                            ProductionNotification = JSON.parse(localStorage.getItem('ProductionNotification'))
                        }
                    } catch (ddsfsdf) {

                    }


                    for (var i = 0; i < reuiredProductionArray.length; i++) {
                        var checkAvailableProduction = _.find(DbProduction, function (num) { return num.clientId == reuiredProductionArray[i].ProductionClientId });
                        if (checkAvailableProduction && checkAvailableProduction.AvailableQuantity <= 0) {
                            if (reuiredProductionArray[i].Required >= 0) {
                                toStore.push({
                                    productionItem: checkAvailableProduction,
                                    notType: "Depleted",
                                    useInProducts: reuiredProductionArray[i].Required,
                                    Status: true,
                                    time:new Date()
                                });
                            }
                        }

                        else if (checkAvailableProduction && checkAvailableProduction.AvailableQuantity < 3 * reuiredProductionArray[i].Required) {
                                toStore.push({
                                    productionItem: checkAvailableProduction,
                                    notType: "Running low",
                                    useInProducts: reuiredProductionArray[i].Required,
                                    Status: true,
                                    time: new Date()
                                });
                        }
                    }
                    for (var i = 0; i < toStore.length; i++) {

                        var localProductionNotif = _.find(ProductionNotification, function (num) { return num.productionItem.clientId == toStore[i].productionItem.clientId; });
                        if (localProductionNotif && !localProductionNotif.Status) {
                            if (new Date().getTime() - new Date(localProductionNotif.time).getTime() <= (24 * 1000 * 60 * 60)) {
                                toStore[i].Status = false;
                                toStore[i].time = new Date();
                            }

                        }

                    }


                    localStorage.setItem("ProductionNotification", JSON.stringify(toStore))


                });
            });
        });
    }


    function getShift() {
        var db = pouchDB('lanapp', { adapter: 'idb' });
        return $q((resolve, reject) => {
            db.get('CurrentShift').then(function (existDocument) {
                var shiftdata = existDocument.shiftdata;
                $rootScope.shiftOpen = true;
                $rootScope.shift = shiftdata;
                localStorage.setItem('ShiftUser', JSON.stringify(shiftdata));
                localStorage.setItem("currentShiftid", shiftdata.clientId);
                resolve({ isopen: true, shiftdata: shiftdata });
            }).catch(function (err) {
                resolve({ isopen: false, shiftdata: null });
            });
        });
    }


    function loadRestaurant() {
        var deferred = $q.defer();
        if ($rootScope.online) {
            $http.get(window.APIBASEURL + '/clientapp/api/get/restaurantdata/' + localStorage.getItem("INSTANCEID"))
                            .success(function (restdata) {
                                if (restdata && restdata.data)
                                localStorageService.set('restaurantData', restdata.data.restdata);
                               forceUpdate('RESTAURENTEMPLOYEE', restdata);
                                deferred.resolve({ success: true, data: restdata });
                            }).error(function (msg, code) {
                                deferred.reject(msg);
                            });
        } else {
            db.get('RESTAURENTEMPLOYEE', function (err, doc) {
                if (err) { }
                else {
                    deferred.resolve({ success: true, data: doc.docdata });
                }
            });
        }
        return deferred.promise;
    }


    function loadBillNumber() {
        var _shelf = angular.copy(this);
        var db = pouchDB('lanapp', { adapter: 'idb' });
        return $q((resolve, reject) => {
            if ($rootScope.online) {
                function billmofiyfn(isExist, catid, doctomanage, existDocument) {
                    var time = new Date();
                    var newDoc = existDocument || { _id: catid };
                    newDoc.billNo = doctomanage;
                    newDoc.lastupdatetime = time;
                    newDoc.lastsynctime = time;
                    return newDoc;
                }
                $http.get(window.APIBASEURL + '/clientapp/api/v1/invoicescount/' + localStorage.getItem("resId")).then(function (res) {
                    _shelf.addOrUpdateDocInPouchDB('BILLNUMBR', res.data.billNo, billmofiyfn);
                }, function (res) {
                    _shelf.addOrUpdateDocInPouchDB('BILLNUMBR', 0, billmofiyfn);
                });
            } 
        });
    }

    function loadShift() {
        var _shelf = angular.copy(this);
        var db = pouchDB('lanapp', { adapter: 'idb' });
        return $q((resolve, reject) => {
            if ($rootScope.online) {
                $http.post(window.APIBASEURL + '/api/get/getshiftWithOutLogout', { id: localStorage.getItem("resId") }).then(function (res) {
                    if (res.data && res.data.isopen) {
                        $rootScope.shiftOpen = true;
                        $rootScope.shift = res.data.shift;
                        localStorage.setItem('ShiftUser', JSON.stringify(res.data.shift));
                        localStorage.setItem("currentShiftid", res.data.shift.clientId);
                        res.data.shift.shiftOpen = true;
                        function mofiyfn(isExist, catid, doctomanage, existDocument) {
                            var time = new Date();
                            var newDoc = existDocument || {};
                            newDoc.shiftdata = doctomanage;
                            newDoc.lastupdatetime = time;
                            newDoc._id = catid;
                            newDoc.lastsynctime = time;
                            return newDoc;
                        }
                        _shelf.addOrUpdateDocInPouchDB('CurrentShift', res.data.shift, mofiyfn)
                        resolve(true);
                    } else
                        resolve(false);
                }, function (res) {
                    console.log();
                });
            } else {
                db.get('CurrentShift').then(function (existDocument) {
                    var shiftdata = existDocument.shiftdata;
                    localStorage.setItem('ShiftUser', JSON.stringify(shiftdata));
                    localStorage.setItem("currentShiftid", shiftdata.clientId);
                    resolve(true);
                }).catch(function (err) {
                    resolve(false);
                });
            }
        });
    }

    function loadRooms(fromlocal) {
        var db = pouchDB('lanapp', { adapter: 'idb' });
        return $q((resolve, reject) => {
            if (fromlocal) {
                db.get('Rooms').then(function (existDocument) {
                    $rootScope.restoRooms = existDocument.docdata;
                    resolve(existDocument.docdata);
                }).catch(function (res) {
                    $rootScope.restoRooms = [];
                    resolve([]);
                });

            } else {
                if ($rootScope.online) {
                    $http.post(window.APIBASEURL + '/api/room/getrooms', { id: localStorage.getItem("resId") }).then(function (res) {
                        if (res.data) {
                            $rootScope.restoRooms = res.data;
                            db.get('Rooms').then(function (existDocument) {
                                existDocument.docdata = res.data;
                                db.put(existDocument).then(function () {
                                    resolve(res.data);
                                }).catch(function (err) {
                                    console.log("Error while updating Data to poch Db\n");
                                    console.log(err);
                                    reject(err);
                                });
                            }).catch(function (err) {
                                if (err && err.status == 404) {
                                    var doc = {
                                        _id: 'Rooms',
                                        docdata: res.data
                                    }
                                    db.put(doc).then(function () {
                                        console.log("Doc updated in poch Db\n");
                                        resolve(res.data);
                                    }).catch(function (err) {
                                        console.log("Error while updating Data to poch Db\n");
                                        console.log(err);
                                        reject(err);
                                    });
                                }
                            });
                        }
                    }, function (res) {
                        console.log();
                    });
                } else {
                    db.get('Rooms').then(function (existDocument) {
                        $rootScope.restoRooms = existDocument.docdata;
                        resolve(existDocument.docdata);
                    }).catch(function (res) {
                        $rootScope.restoRooms = [];
                        resolve([]);
                    });
                }
            }
        });
    }

    function loadTables(fromlocal) {
        var db = pouchDB('lanapp', { adapter: 'idb' });
        return $q((resolve, reject) => {
            if (fromlocal) {
                db.get('Tables').then(function (existDocument) {
                    resolve(existDocument.docdata);
                }).catch(function (err) {
                    resolve([]);
                });

            } else {
                if ($rootScope.online) {
                    $http.get(window.APIBASEURL + '/api/get/tables', '').then(function (res) {
                        db.get('Tables').then(function (existDocument) {
                            existDocument.docdata = res.data;
                            db.put(existDocument).then(function () {
                                resolve(res.data);
                            }).catch(function (err) {
                                console.log("Error while updating Data to poch Db\n");
                                console.log(err);
                                reject(err);
                            });
                        }).catch(function (err) {
                            if (err && err.status == 404) {
                                var doc = {
                                    _id: 'Tables',
                                    docdata: res.data
                                }
                                db.put(doc).then(function () {
                                    console.log("Doc updated in poch Db\n");
                                    resolve(res.data);
                                }).catch(function (err) {
                                    console.log("Error while updating Data to poch Db\n");
                                    console.log(err);
                                    reject(err);
                                });
                            }
                        });
                    }, function (apierr) {
                        console.log('Error getting all tables');
                    });

                } else {
                    db.get('Tables').then(function (existDocument) {
                        resolve(existDocument.docdata);
                    }).catch(function (err) {
                        resolve([]);
                    });
                }
            }
        });
    }

    function generateGUID() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        }
        return "CUSTOM-GENERETED-ID-" + s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
    }

    function getResId() {
        var db = pouchDB('lanapp', { adapter: 'idb' });
        return $q((resolve, reject) => {
            resolve(localStorage.getItem("resId"));
        });
        /*** implementation ***/
    }

    function triggerCB(pro, count, data) {
        // if (count == 4) {
        pro(data);
        // }
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

    function loadInvoices() {
        var _self = this;
        var time = new Date();
        return $q((resolve, reject) => {
            $http.get(window.APIBASEURL + '/api/get/invoice').then(function (response) {
                var resId = localStorage.getItem("resId");
                var filtered = [];
                if (response && response.data && response.data.length > 0) {
                    var res = response.data;
                    
                    for (var i = 0 ; i < res.length; i++) {
                        if (!res[i].tables)
                            res[i].tables = { _id: '-1', number: 'No Table' }
                        if (res[i].restaurant == resId) {
                            res[i].lastupdatetime = time
                            res[i].lastsynctime = time
                            filtered.push(res[i]);
                        }
                    }
                }
                _self.addOrUpdateDocInPouchDB('INVOICES', filtered, restorModfiyfn).then(function (localreponse) {
                }).catch(function (err) {
                    console.log("error in addinf category");
                });
                resolve(filtered);
            }, handleError('Error getting all users'));
        });
    }

    function loadOrders() {
        var _self = this;
        return $q((resolve, reject) => {
            $http.get(window.APIBASEURL + '/api/get/orders').then(function (response) {
                var resId = localStorage.getItem("resId");
                var filtered = [];
                var time = new Date();
                if (response && response.data && response.data.length > 0) {
                    var res = response.data;
                    for (var i = 0 ; i < res.length; i++) {
                        if (res[i].restaurantId == resId) {
                            res[i].lastupdatetime = time
                            res[i].lastsynctime = time
                            filtered.push(res[i]);
                        }
                    }
                }
                _self.addOrUpdateDocInPouchDB('ORDERS', filtered, restorModfiyfn).then(function (localreponse) {
                }).catch(function (err) {
                    console.log("error in addinf category");
                });
                resolve(filtered);
            }, handleError('Error getting all users'));
        });
    }

    function loadCategory() {
        var _self = this;
        return $q((resolve, reject) => {
            $http.post(window.APIBASEURL + '/api/get/Category', { id: localStorage.getItem("resId") }).then(function (res) {
                _self.addOrUpdateDocInPouchDB('Category', res.data, restorModfiyfn).then(function (localreponse) {
                }).catch(function (err) {
                    console.log("error in addinf category");
                });
                resolve(res.data);
            }, handleError('Error getting all users'));
        });
    }

    function loadIngedients() {
        var _self = this;
        return $q((resolve, reject) => {
            $http.post(window.APIBASEURL + '/api/get/Ingredients', { id: localStorage.getItem("resId") }).then(function (res) {
                _self.addOrUpdateDocInPouchDB('Ingredients', res.data, restorModfiyfn).then(function (localreponse) {
                }).catch(function (err) {
                    console.log("error in adding Ingredients");
                });
                resolve(res.data);
            }, handleError('Error getting all users'));
        });
    }

    function loadSides() {
        var _self = this;
        return $q((resolve, reject) => {
            $http.post(window.APIBASEURL + '/api/get/Sides', { id: localStorage.getItem("resId") }).then(function (res) {
                _self.addOrUpdateDocInPouchDB('Sides', res.data, restorModfiyfn).then(function (localreponse) {
                }).catch(function (err) {
                    console.log("error in adding Sides");
                });
                resolve(res.data);
            }, handleError('Error getting all users'));
        });
    }

    function loadProductions() {
        var _self = this;
        return $q((resolve, reject) => {
            $http.post(window.APIBASEURL + '/api/get/Production', { id: localStorage.getItem("resId") }).then(function (res) {
                _self.addOrUpdateDocInPouchDB('Production', res.data, restorModfiyfn).then(function (localreponse) {
                }).catch(function (err) {
                    console.log("error in adding Production");
                });
                resolve(res.data);
            }, handleError('Error getting all users'));
        });
    }

    function loadProduct() {
        var _self = this;
        return $q((resolve, reject) => {
            $http.post(window.APIBASEURL + '/api/get/Product', { id: localStorage.getItem("resId") }).then(function (res) {
                _self.addOrUpdateDocInPouchDB('Product', res.data, restorModfiyfn).then(function (localreponse) {
                    console.log("Product addded successfully");
                }).catch(function (err) {
                    console.log("error in adding Product");
                });
                resolve(res.data);
            }, handleError('Error getting all users'));
        });
    }

    function handleError() { }

    function loadEmployees() {
        var _selfobj = this;
        return $q((resolve, reject) => {
            $http.get(window.APIBASEURL + '/clientapp/api/get/employee/' + localStorage.getItem("resId")).then(function (res) {
                _selfobj.addOrUpdateDocInPouchDB('EMPLOYEES', res.data.data, restorModfiyfn).then(function (localreponse) {
                }).catch(function (err) {
                    console.log("error in adding Product");
                });
                resolve(res.data.data);
            }, handleError('Error getting all users'));
        });
    }

    function getEmployees(fromlocal) {
        var _self1 = this;
        return $q((resolve, reject) => {
            if (fromlocal) {

                var db = pouchDB('lanapp', { adapter: 'idb' });
                db.get('EMPLOYEES').then(function (existDocument) {
                    resolve(existDocument.docdata);
                }).catch(function (err) {
                    resolve([]);
                });

            } else {
                if ($rootScope.online)
                    _self1.loadEmployees().then(function (empls) {
                        resolve(empls);
                    });
                else {
                    var db = pouchDB('lanapp', { adapter: 'idb' });
                    db.get('EMPLOYEES').then(function (existDocument) {
                        resolve(existDocument.docdata);
                    }).catch(function (err) {
                        resolve([]);
                    });
                }
            }
        });
    }


   

    function syncInventory(showmessage) {
        return $q((resolve, reject) => {
            if ($rootScope.online) {
                console.log("sync cat start " + new Date().getTime());
                syncCategoty(showmessage).then(function (syncstatus) {
                    console.log("sync ing start " + new Date().getTime());
                    syncIngredientsInventory(showmessage).then(function (syncstatusing) {
                        console.log("sync sides start " + new Date().getTime());
                        syncProductionInventry(showmessage).then(function (syncstatussides) {
                            console.log("sync production start " + new Date().getTime());
                            syncSidesInventry(showmessage).then(function (syncstatussides) {
                                console.log("sync product start " + new Date().getTime());
                                syncProductInventory(showmessage).then(function (syncstatuspro) {
                                    console.log("sync product end" + new Date().getTime());
                                    resolve(true);
                                }).catch(function (err) {
                                    resolve(true);
                                });
                            }).catch(function (err) {
                                resolve(true);
                            });
                            //deleteCategoty();
                        }).catch(function (err) {
                            resolve(true);
                        })
                    }).catch(function (err) {
                        resolve(true);
                    });
                }).catch(function (err) {
                    resolve(true);
                });
                
            } else {
                resolve(true);
            }
        });
    }

    function deleteCategoty() {
        var db = pouchDB('lanapp', { adapter: 'idb' });
        db.get('CATTODELETE').then(function (existDocument) {
            
            if (!existDocument.lastupdatetime || existDocument.lastupdatetime > existDocument.lastsynctime) {
                var time = new Date();
                existDocument.lastupdatetime = time;
                existDocument.lastsynctime = time;
                console.log("Cat Id to be delete");
                console.log(existDocument.docdata);
                for (var cnt = 0; cnt < existDocument.IDS.length; cnt++) {
                    $http.post(window.APIBASEURL + '/api/sync/deletcategory', { id: existDocument.IDS[cnt] }).then(function (response) {
                    });
                }
                db.put(existDocument).then(function () {
                    console.log("Doc updated in poch Db\n for  exisinng doc");
                }).catch(function (err) {
                    console.log("Error while updating Data to poch Db\n");
                    console.log(err);
                });
            }
        });
    }

    function syncCategoty(showmessage) {
        var db = pouchDB('lanapp', { adapter: 'idb' });
        return $q((resolve, reject) => {
            if ($rootScope.online) {
                db.get('Category').then(function (existDocument) {
                    if (!existDocument.lastupdatetime || existDocument.lastupdatetime > existDocument.lastsynctime) {
                        var time = new Date();
                        existDocument.lastupdatetime = time;
                        existDocument.lastsynctime = time;
                        if (showmessage)
                            alertservice.showAlert('success', "Success", "Syncing category to the cloud server");
                        $http.post(window.APIBASEURL + '/api/sync/category', existDocument.docdata).then(function (response) { });
                        db.put(existDocument).then(function () {
                        }).catch(function (err) {
                            console.log("Error while updating Data to poch Db\n");
                            console.log(err);
                        });
                    }
                    resolve(true);
                }).catch(function (err) {
                    resolve(true);
                });
            } else {
                resolve(true);
            }
        });
    }

    function syncIngredientsInventory(showmessage) {
        return $q((resolve, reject) => {
            if ($rootScope.online) {
                var db = pouchDB('lanapp', { adapter: 'idb' });
                db.get('Ingredients').then(function (existDocument) {
                    if (existDocument.lastupdatetime > existDocument.lastsynctime) {
                        var time = new Date();
                        existDocument.lastupdatetime = time;
                        existDocument.lastsynctime = time;
                        if (showmessage)
                            alertservice.showAlert('success', "Success", "Syncing ingredientts to the cloud server");
                        $http.post(window.APIBASEURL + '/api/sync/ingredients', existDocument.docdata).then(function (response) {                          });
                        db.put(existDocument).then(function () {
                        }).catch(function (err) {
                            console.log("Error while updating Data to poch Db\n");
                            console.log(err);
                        });
                    }
                    resolve(true);
                }).catch(function (err) {
                    resolve(true);
                });
            } else {
                resolve(true);
            }
        });
    }
    function syncProductionInventry(showmessage) {
        return $q((resolve, reject) => {
            if ($rootScope.online) {
                var db = pouchDB('lanapp', { adapter: 'idb' });
                db.get('Production').then(function (existDocument) {
                    if (existDocument.lastupdatetime > existDocument.lastsynctime) {
                        var time = new Date();
                        existDocument.lastupdatetime = time;
                        existDocument.lastsynctime = time;
                        if (showmessage)
                            alertservice.showAlert('success', "Success", "Syncing Production to the cloud server");
                        $http.post(window.APIBASEURL + '/api/sync/production', existDocument.docdata).then(function (response) {
                            console.log("production output");
                            console.log(response);
                        });
                        db.put(existDocument).then(function () {
                        }).catch(function (err) {
                            console.log("Error while updating Data to poch Db\n");
                            console.log(err);
                        });
                    }
                    resolve(true);
                }).catch(function (err) {
                    resolve(true);
                });
            } else {
                resolve(true);
            }
        });
    }

    function syncSidesInventry(showmessage) {
        return $q((resolve, reject) => {
            if ($rootScope.online) {
                var db = pouchDB('lanapp', { adapter: 'idb' });
                db.get('Sides').then(function (existDocument) {
                    if (existDocument.lastupdatetime > existDocument.lastsynctime) {
                        var time = new Date();
                        existDocument.lastupdatetime = time;
                        existDocument.lastsynctime = time;
                        if (showmessage)
                            alertservice.showAlert('success', "Success", "Syncing sides to the cloud server");
                        $http.post(window.APIBASEURL + '/api/sync/sides', existDocument.docdata).then(function (response) {                         });
                        db.put(existDocument).then(function () {
                        }).catch(function (err) {
                            console.log("Error while updating Data to poch Db\n");
                            console.log(err);
                        });
                    }
                    resolve(true);
                }).catch(function (err) {
                    resolve(true);
                });
            } else {
                resolve(true);
            }
        });
    }

    function syncProductInventory(showmessage) {
        return $q((resolve, reject) => {
            if ($rootScope.online) {
                var db = pouchDB('lanapp', { adapter: 'idb' });
                db.get('Product').then(function (existDocument) {
                    if (existDocument.lastupdatetime > existDocument.lastsynctime) {
                        var time = new Date();
                        existDocument.lastupdatetime = time;
                        existDocument.lastsynctime = time;
                        if (showmessage)
                            alertservice.showAlert('success', "Success", "Syncing product to the cloud server");
                        $http.post(window.APIBASEURL + '/api/sync/product', existDocument.docdata).then(function (response) {        });
                        db.put(existDocument).then(function () {
                        }).catch(function (err) {
                            console.log("Error while updating Data to poch Db\n");
                            console.log(err);
                        });
                    }
                    resolve(true);
                }).catch(function (err) {
                    resolve(true);
                });
            } else {
                resolve(true);
            }
        });
    }

    function syncProductInventory1() {
        if ($rootScope.online) {
            var db = pouchDB('lanapp', { adapter: 'idb' });

            db.get('Product').then(function (existDocument) {
                var time = new Date();
                existDocument.lastupdatetime = time;
                existDocument.lastsynctime = time;
                $http.post(window.APIBASEURL + '/api/sync/productInventory', existDocument.docdata).then(function (response) {

                });
                db.put(existDocument).then(function (doctomanage) {
                   return doctomanage;
                }).catch(function (err) {
                    console.log("Error while updating Data to poch Db\n");
                    console.log(err);
                });
            });
        }
    }

    function syncIngredientsInventory1() {
        if ($rootScope.online) {
            var db = pouchDB('lanapp', { adapter: 'idb' });

            db.get('Ingredients').then(function (existDocument) {
                var time = new Date();
                existDocument.lastupdatetime = time;
                existDocument.lastsynctime = time;
                $http.post(window.APIBASEURL + '/api/sync/ingredientsInventory', existDocument.docdata).then(function (response) {

                });
                db.put(existDocument).then(function () {
                }).catch(function (err) {
                    console.log("Error while updating Data to poch Db\n");
                    console.log(err);
                });
            });
        }
    }

    function syncShift() {
        alert("syncing shift");
    }

    function getInvoicesToUpdate() {
        var invToReturn =[];
        return $q((resolve, reject) => {
            var db = pouchDB('lanapp', { adapter: 'idb' });
            db.get('INVOICES').then(function (invoices) {
                var invoiceList = invoices.docdata;
                for (var cnt = 0; cnt < invoiceList.length; cnt++) {
                    var singleInvoice = invoiceList[cnt];
                    if (!singleInvoice.lastupdatetime || !singleInvoice.lastsynctime ||
                        singleInvoice.lastupdatetime > singleInvoice.lastsynctime) {
                        var time = new Date();
                        singleInvoice.lastupdatetime = time;
                        singleInvoice.lastsynctime = time;
                        invoiceList[cnt] = singleInvoice;
                        invToReturn.push(singleInvoice);
                    }
                }
                invoices.docdata = invoiceList;
                if (invToReturn.length > 0)
                    db.put(invoices);
                resolve(invToReturn);
            }).catch(function (err) {
                resolve([]);
            });
        });
    }

    function getOrdersToUpdate(){
        var orderToReturn =[];
        return $q((resolve, reject) => {
            var db = pouchDB('lanapp', { adapter: 'idb' });
            db.get('ORDERS').then(function (orders) {
                var ordersList = orders.docdata;
                for (var cnt1 = 0; cnt1 < ordersList.length; cnt1++) {
                    var singleOrder = ordersList[cnt1];
                    if (!singleOrder.lastupdatetime || !singleOrder.lastsynctime ||
                        singleOrder.lastupdatetime > singleOrder.lastsynctime) {
                        var time = new Date();
                        singleOrder.lastupdatetime = time;
                        singleOrder.lastsynctime = time;
                        if (singleOrder.splitClientId)
                            singleOrder.clientId = singleOrder.splitClientId;
                        ordersList[cnt1] = singleOrder;
                        orderToReturn.push(singleOrder);
                    }
                }
                orders.docdata = ordersList;
                if (orderToReturn.length > 0)
                    db.put(orders);
                resolve(orderToReturn);
            }).catch(function (err) {
                resolve([]);
            });
        });
    }

    function getOrdersIDToDELETE() {
        var orderToReturn = [];
        return $q((resolve, reject) => {
            var db = pouchDB('lanapp', { adapter: 'idb' });
            db.get('ORDERTODELETE').then(function (orders) {
                var ordersList = orders.docdata;
                for (var cnt1 = 0; cnt1 < ordersList.length; cnt1++) {
                    var singleOrder = ordersList[cnt1];
                    if (!singleOrder.lastupdatetime || !singleOrder.lastsynctime ||
                        singleOrder.lastupdatetime > singleOrder.lastsynctime) {
                        var time = new Date();
                        singleOrder.lastupdatetime = time;
                        singleOrder.lastsynctime = time;
                        ordersList[cnt1] = singleOrder;
                        orderToReturn.push(singleOrder);
                    }
                }
                orders.docdata = ordersList;
                if (orderToReturn.length > 0)
                    db.put(orders);
                resolve(orderToReturn);
            }).catch(function (err) {
                resolve([]);
            });
        });
    }

    function getAllShiftToUpdate() {
        var allShiftToReturn = [];
        return $q((resolve, reject) => {
            var db = pouchDB('lanapp', { adapter: 'idb' });
            db.get('ALLSHIFTS').then(function (orders) {
                var ordersList = orders.docdata;
                for (var cnt1 = 0; cnt1 < ordersList.length; cnt1++) {
                    var singleOrder = ordersList[cnt1];
                    if (!singleOrder.lastupdatetime || !singleOrder.lastsynctime ||
                        singleOrder.lastupdatetime > singleOrder.lastsynctime) {
                        var time = new Date();
                        singleOrder.lastupdatetime = time;
                        singleOrder.lastsynctime = time;
                        ordersList[cnt1] = singleOrder;
                        allShiftToReturn.push(singleOrder);
                    }
                }
                orders.docdata = ordersList;
                if (allShiftToReturn.length > 0)
                    db.put(orders);
                resolve(allShiftToReturn);
            }).catch(function (err) {
                resolve([]);
            });
        });
    }

    function getCurrentShiftToUpdate(){
        var currentShift =null;
        return $q((resolve, reject) => {
            var db = pouchDB('lanapp', { adapter: 'idb' });
            db.get('CurrentShift').then(function (shift) {
                if (!shift.lastupdatetime || !shift.lastsynctime ||
                    shift.lastupdatetime > shift.lastsynctime) {
                    var time = new Date();
                    shift.lastupdatetime = time;
                    shift.lastsynctime = time;
                    currentShift = shift.shiftdata;
                    db.put(shift);
                }
                resolve(currentShift);
            }).catch(function (err) {
                resolve(null);
            });;
        });
    }

    function syncINVOICES(showmessage) {
        return $q((resolve, reject) => {
            if ($rootScope.online) {

                function showSyncAlerts(TBMData, showmessage) {
                    if (showmessage) {
                        if (TBMData.INVOICES.length > 0)
                            alertservice.showAlert('success', "Success", "Syncing invoice to the cloud server");
                        if (TBMData.ORDERS.length > 0)
                            alertservice.showAlert('success', "Success", "Syncing orders to the cloud server");
                        if (TBMData.SHIFT)
                            alertservice.showAlert('success', "Success", "Syncing shift to the cloud server");
                    }
                }

                var TBMData = {
                    INVOICES: [],
                    ORDERS: [],
                    SHIFT: null,
                    ALLSHIFT: [],
                    ORDERTODELETE: []
                };
                getInvoicesToUpdate().then(function (invoices) {
                    TBMData.INVOICES = invoices;
                    getOrdersToUpdate().then(function (orders) {
                        TBMData.ORDERS = orders;
                        getCurrentShiftToUpdate().then(function (currentShift) {
                            TBMData.SHIFT = currentShift;
                            getAllShiftToUpdate().then(function (allshifts) {
                                TBMData.ALLSHIFT = allshifts;
                                getOrdersIDToDELETE().then(function (idToDeletes) {
                                    TBMData.ORDERTODELETE = idToDeletes;
                                    console.log(TBMData);
                                    console.log("Start syncing bills module");
                                    $http.post(window.APIBASEURL + '/api/sync/billsModule', TBMData).then(function (res) {
                                        resolve(true);
                                    }, function (error) {
                                        resolve(true);
                                    });
                                    showSyncAlerts(TBMData, showmessage);
                                });
                            });
                        })
                    })
                })
            } else {
                resolve(true);
            }
        });
    }

    function printOrder(printObj, productid) {
        var db = pouchDB('lanapp', { adapter: 'idb' });
        db.get('Product', function (err, doc) {

            var productdata = _.find(doc.docdata, function (num) { return num.clientId == productid; });
            //chage these values 
            printObj.product.image = productdata.image;
            printObj.product.Ordertype = productdata.OrderGroup || 'A';
            try {
                var printers = JSON.parse(localStorage.getItem("currentPrinters"));
                if (printObj.product.Ordertype == 'A') {
                    printObj.printer = printers.Printer2;
                    console.log('orderType A', printers)
                    return $http.post('http://localhost:10086/printorder', printObj, { headers: { 'Content-Type': 'text/plain' }, data: printObj }).then(function (res) {
                        return res.data;
                    }, function (error) {

                    });
                } else {
                    console.log('orderType B', printers)
                    printObj.printer = printers.Printer3;
                    return $http.post('http://localhost:10086/printorder', printObj, { headers: { 'Content-Type': 'text/plain' }, data: printObj }).then(function (res) {
                        return res.data;
                    }, function (error) {

                    });
                }
            } catch (err) {
                alertservice.showAlert('failed', "Failed", "No printer installed/attached");
            }
        });
    }

    function addOrUpdateDocInPouchDB(id, doctomanage, mofiyfn) {
        var db = pouchDB('lanapp', { adapter: 'idb' });
        return $q((resolve, reject) => {
            db.get(id).then(function (existDocument) {
                var doc = mofiyfn(true, id, doctomanage, existDocument);
                db.put(doc).then(function () {
                    resolve(doctomanage);
                }).catch(function (err) {
                    console.log(err);
                    reject(err);
                });
            }).catch(function (err) {
                if (err && err.status == 404) {
                    var doc = mofiyfn(false, id, doctomanage, null);
                    db.put(doc).then(function () {
                        resolve(doctomanage);
                    }).catch(function (err) {
                        console.log(err);
                        reject(err);
                    });
                }
            });
        });
    }

    function removeDocFromPouchDB(id) {
        var db = pouchDB('lanapp', { adapter: 'idb' });
        db.get(id).then(function (doc) {
            return db.remove(doc);
        });
    }

    function getDocFromPouchDB (id,isMandatory){
        return $q((resolve, reject) => {
            var db = pouchDB('lanapp', { adapter: 'idb' });
            db.get(id).then(function (existDocument) {
                if (isMandatory)
                    resolve({ isFound: true, underlyingdoc: existDocument });
                else
                    resolve(existDocument);
            }).catch(function (err) {
                if (err && err.status == 404) {
                    if (isMandatory)
                        resolve({ isFound: false, underlyingdoc: null });
                    else
                        resolve({});
                } else {
                    if (isMandatory)
                        resolve({ isFound: false, underlyingdoc: null });
                    else
                        resolve({});
                }
            });
        });
    }

    function idMatcher(source, targetobj) {
        return source == targetobj.clientId || source == targetobj._id || source == targetobj;
    }


    function setDocIntoPouchDB(id, doc) {

    }
    function forceUpdate(id, data) {
        var db = pouchDB('lanapp', { adapter: 'idb' });
        db.get(id).then(function (existDocument) {
            existDocument.docdata = data;
            db.put(existDocument);
        }).catch(function (err) {
            var newDoc = {
                _id: id,
                docdata: data
            }
            db.put(newDoc);
        });
    }


    function isOnline() {
        return navigator.onLine;
    }

}


