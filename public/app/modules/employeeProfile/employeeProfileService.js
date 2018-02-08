(function () {
    'use strict';

    angular
        .module('employeeprofile')
        .factory('employeeprofileService', serviceFn);

    serviceFn.$inject = ['$http','pouchDB','localStorageService','$rootScope'];
    /* @ngInject */
    function serviceFn($http,pouchDB,localStorageService,$rootScope) {
        var db =  pouchDB('lanapp', {adapter : 'idb'});
        var service = {};
        service.CurrentEmployee   = CurrentEmployee;
        service.updateUser        = CurrentEmployeeUpdate;
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

        function CurrentEmployee() {
            if ($rootScope.online) {
                var curemp = JSON.parse(localStorage.getItem("CURRENTEMP"));
                var url = window.APIBASEURL + '/clientapp/api/v1/employeedetails/' + curemp._id;
                console.log(url);
                return $http.get(url).then(handleSuccessLocally, handleError('Error getting all users'));
            }
            else {
                return db.get('usersess').then(function (result) {
                    return result.usermoment.employee;
                }).catch(function (err) {
                    console.log(err)
                });
            }
        }

        function CurrentEmployeeUpdate(data) {

            db.get('usersess').then(function (result) {
                result.usermoment.employee = data;
                db.put(result);
            }).catch(function (err) {
                console.log(err)
            });

            if ($rootScope.online) {
                return $http.post(window.APIBASEURL + '/clientapp/api/v1/currentemployeeUpdate', data).then(handleSuccess, handleError('Error getting all users'));
            }

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