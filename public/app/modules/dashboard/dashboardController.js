(function() {
    'use strict';

    angular
        .module('dashboard')
        .controller('dashboardController', Controller);

    Controller.$inject = ['$scope', '$state', '$rootScope', '$location', 'toaster', '$http', 'SessionService', 'localStorageService', '$uibModal', 'PATHS', 'PermissionService', 'dashboardService', '$timeout', '$translate', 'dataservice', 'pouchDB', 'alertservice', 'utilservice'];
    /* @ngInject */
    function Controller($scope, $state, $rootScope, $location, toaster, $http, SessionService, localStorageService, $uibModal, PATHS, PermissionService, dashboardService, $timeout, $translate, dataservice, pouchDB, alertservice, utilservice) {

        //alertservice.showAlert('error', "Failed", "Login Failed");
        var bb= SessionService.getSession(); // get session details

        var vm = this;
        var db = pouchDB('lanapp', { adapter: 'idb' })
        vm.user = {};
        vm.disabled = false;
        vm.loader = false;
        this.auth = function (data) {
            //var restaurantid = JSON.parse(localStorage.getItem('serverLan._meanLanAppSync'))[0].session.data.restaurant;
            if (data && data.length == 4) {
                var pin = data

                vm.disabled = true;
                vm.loader = true;
                $timeout(function () {
                    if ($rootScope.online) {
                        //
                        db.get('usersess').then(function (doc) {
                           // console.log(doc);
                            var obj = { pin: data, restaurantid: doc.usermoment.userid }
                            dashboardService.loginpad(obj).then(doneCallbacks, failCallbacks)
                        });
                    }
                    else {
                        utilservice.getEmployees(true).then(function (emps) {
                            //$scope.Allemployee = [{ _id: -1, firstname: 'No Waiter' }];
                            //for (var i = 0; i < emps.length; i++) {
                            //    $scope.Allemployee.push(emps[i]);
                            //}
                            var empIds = pin
                           
                            //if (result && result.usermoment && result.usermoment.employee) {
                            if (emps && emps.length > 0) {
                                var User = _.find(emps, function (num) { return num.pin == empIds });
                                if (User) {
                                    localStorage.setItem("CURRENTEMP", JSON.stringify(User));
                                    alertservice.showAlert('success', "Done", "Login Successfully")
                                    $rootScope.connection(User._id);
                                   // $location.path("#/employee");
                                    window.location = '/employee'
                                } else {

                                    //alertservice.showAlert('error', "Failed", "Login Failed")
                                    vm.user.auth = null
                                    vm.disabled = false;
                                    vm.loader = false;
                                    alertservice.showAlert('error', 'Error', "Incorrect PIN")

                                }
                            }
                            else {
                                alertservice.showAlert('error', "Failed", "Login Failed")
                                vm.user.auth = null
                                vm.disabled = false;
                                vm.loader = false;
                                alertservice.showAlert('error', 'Error', "Incorrect PIN")
                            }
                            // handle result
                        }).catch(function (err) {
                          //  console.log(err);
                            alertservice.showAlert('error', "Failed", "Login Failed")
                            vm.user.auth = null
                            vm.disabled = false;
                            vm.loader = false;
                        })
                    }
                }, 2000)
            }
        }


        function doneCallbacks(data){
        //  console.log(data);
          if (data.success) {
              

                alertservice.showAlert('success', "Done", data.message)
                    db.get('usersess', function(err, doc) {
                       if (err) {
                          //  console.log("err end session ")
                          //  console.log(err)
                        }
                        else{
                           var datas = doc

                           datas.usermoment.employee = data.data;
                           localStorage.setItem("CURRENTEMP", JSON.stringify(data.data));

                           var empid = data.data._id;
                           db.put({
                               _id: 'usersess',
                               _rev: doc._rev,
                               usermoment: datas.usermoment
                           }).then(function (res) {
                               $rootScope.connection(empid);

                           });

                           var syncData = {
                                                    session : true,
                                                    data : data.data,
                                                    syncstatus: 1
                                              }

                           if(localStorageService.get('_meanLanAppSync')){
                                var arr = [];
                                // var arr = localStorageService.get('_meanLanAppSync');
                                // arr.splice(0, 0,  {session : syncData});
                                // (arr.join());
                             arr.push({session : syncData});
                                localStorageService.set('_meanLanAppSync',arr)
                                  window.location= '/employee'
                                  //$location.path('/employee') // fix for refresh
                           }
                           else{
                                var arr = [];
                                arr.push({session : syncData})
                                localStorageService.set('_meanLanAppSync',arr)
                                 window.location= '/employee'
                                  //$location.path('/employee') // fix for refresh
                           }
                        }
                    });

            }
            else{
                 vm.disabled = false;
                  vm.loader = false;
                  alertservice.showAlert('error', "Failed", data.message)
            }
           vm.user.auth = null

        }
        function failCallbacks(err){
            alertservice.showAlert('error', 'Error', err)
           // console.log(err)
            vm.user.auth = null
            vm.disabled = false;
            vm.loader = false;
        }

        activateUserController()
        function activateUserController (){


        }//activateUserController

    }
})();
