
(function () {
    'use strict';

    angular
        .module('localSettings')
        .factory('settingService', serviceFn);

    serviceFn.$inject = ['$http', '$location', 'toaster', '$q', '$state', 'pouchDB', 'localStorageService', 'alertservice'];
    /* @ngInject */
    function serviceFn($http, $location, toaster, $q, $state, pouchDB, localStorageService, alertservice) {
        var db =  pouchDB('lanapp', {adapter : 'idb'});
        var service = {};
        service.getPrinters = getPrinters;
        
        
        return service;

        /////////
		function getPrinters() {
			return $http.get('http://localhost:10086/printers').then(function (res) {
				console.log('printers:',res.data);
                return res.data;
            }, handleError('Error Getting Printers'));
		}
		
		
		 function handleError(error) {
            return function () {
                return { success: false, message: error };
            };
        }
		
		

    }

})();
