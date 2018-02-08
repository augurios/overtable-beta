
(function () {
    'use strict';

    angular
        .module('login')
        .service('loginService', LoginService);

    LoginService.$inject = ['$http', '$q', '$rootScope', 'pouchDB', 'localStorageService', 'utilservice'];
    /* @ngInject */
    function LoginService($http, $q, $rootScope, pouchDB, localStorageService, utilservice) {
        var db = pouchDB('lanapp', { adapter: 'idb' });
        return {
            login: function (user) {

                var credetialsLogin = {}
                credetialsLogin.email = user.email;
                credetialsLogin.password = user.pwd;
                credetialsLogin.token = user.token;

                var deferred = $q.defer();
                $http.post(window.APIBASEURL + '/api/login', credetialsLogin)
                  .success(function (data) {

                      if (data && data.data) {

                          //window.INSTANCEID = data.data.instanceid;

                          localStorage.setItem("INSTANCEID", data.data.instanceid);
                          localStorage.setItem("EMAIL", data.data.email);
                          localStorage.setItem("resId", data.data.userid);


                          db.get('usersess').then(function (doc) {
                              doc.usermoment = data.data;
                              db.put(doc).then(function () {
                                  $http.get(window.APIBASEURL + '/clientapp/api/get/employee/' + data.data.userid)
                                 .success(function (employess) {
                                     // get employee details for current retuarant;
                                     if (employess.data != 0) {
                                         db.put({
                                             _id: 'employee',
                                             emplyoeedata: employess.data
                                         }, function () {
                                             deferred.resolve({ success: true, data: data });
                                         });
                                     } else {
                                         deferred.resolve({ success: true, data: data });
                                     }

                                 })
                              }).catch(function (err) {
                                  alert("error in saving user session to the database")
                              });
                          }).catch(function (err) {
                              if (err && err.status == 404) {
                                  var doc = {
                                      _id: 'usersess',
                                      usermoment: data.data
                                  }
                                  db.put(doc).then(function () {
                                      $http.get(window.APIBASEURL + '/clientapp/api/get/employee/' + data.data.userid)
                                     .success(function (employess) {
                                         // get employee details for current retuarant;
                                         if (employess.data != 0) {
                                             db.put({
                                                 _id: 'employee',
                                                 emplyoeedata: employess.data
                                             }, function () {
                                                 deferred.resolve({ success: true, data: data });
                                             });
                                         } else {
                                             deferred.resolve({ success: true, data: data });
                                         }

                                     })
                                  }).catch(function (err) {
                                      alert("error in saving user session to the database")
                                  });
                              }
                          });
                      }
                      else {
                          deferred.resolve({ success: false, data: data });
                      }
                  }).error(function (msg, code) {
                      deferred.reject(msg);
                  });
                return deferred.promise;
            },
            getEmployess: function () {
                // get employee details for current retuarant;
                var deferred = $q.defer();
                if ($rootScope.online) {
                    $http.get(window.APIBASEURL + '/api/get/employee')
                                    .success(function (employess) {
                                     //   console.log(employess.data)
                                        if (employess.data != 0) { }
                                        utilservice.forceUpdate('ALLRESTAURENTEMPLOYEE', employess);
                                        deferred.resolve({ success: true, data: employess });
                                    }).error(function (msg, code) {
                                        deferred.reject(msg);
                                    });
                } else {
                    db.get('ALLRESTAURENTEMPLOYEE', function (err, doc) {
                        if (err) { }
                        else {
                            deferred.resolve({ success: true, data: doc.docdata });
                        }
                    });
                }
                return deferred.promise;
            },
            getRestaurant: function () {
                // get employee details for current retuarant;
                var deferred = $q.defer();
                if ($rootScope.online) {
                    $http.get(window.APIBASEURL + '/clientapp/api/get/restaurantdata/' + localStorage.getItem("INSTANCEID"))
                                    .success(function (restdata) {
                                        // localStorageService.set('restaurantData', restdata.restdata);
                                        utilservice.forceUpdate('RESTAURENTEMPLOYEE', restdata);
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
        }
    }//login
})();