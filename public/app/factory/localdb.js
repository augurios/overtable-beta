(function() {
    'use strict';

    angular
        .module('mainServerapp')
        .factory('localdb', LocalDB);

    LocalDB.$inject = ['$http', '$location', '$window', 'toaster','$q','$state','pouchDB','$rootScope','localStorageService'];

    /* @ngInject */
    function LocalDB($http, $location, $window, toaster, $q, $state, pouchDB, $rootScope, localStorageService) {
        var db = pouchDB('lanapp', { adapter: 'idb' });

        var service = {
            syncLocalEmployeeTable: Empupdates
        };
        return service;

        ////////////////

        function Empupdates() {

            return db.get('employee').then(function (doc) {
                //db.remove(doc);
                return $http.get('/api/get/employee')
                           .success(function (employess) {
                               // get employee details for current retuarant;
                               console.log("Syncing Local Db of Employess", employess)
                               return db.put({
                                   _id: 'employee',
                                   _rev: doc._rev,
                                   emplyoeedata: employess.data
                               });

                           })
            });
        }
    }
})();



