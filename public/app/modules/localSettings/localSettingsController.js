(function() {
    'use strict';

    angular
        .module('localSettings')
        .controller('localSettingsController', Controller);
  
    Controller.$inject = ['$scope', '$state', '$rootScope', '$location', 'toaster', '$http', 'SessionService', 'localStorageService', '$uibModal', 'PATHS', 'PermissionService', 'settingService', 'getEmployee', 'alertservice', '$translate', 'utilservice'];
    /* @ngInject */
    function Controller($scope, $state, $rootScope, $location, toaster, $http, SessionService, localStorageService, $uibModal, PATHS, PermissionService, settingService, getEmployee, alertservice, $translate, utilservice) {
    		console.log("controller init");
    		
    		$scope.isNegativeOrder = utilservice.getNagitveSetting()
    		
    		$scope.NegativeOrderSettings = function (value)
    		{
    		    localStorage.setItem("isNegativeOrder", JSON.stringify({ value: value }))
    		    alertservice.showAlert('error', "success",'Setting Change succesfully');
    		}
                
    		localStorage.setItem('isNegativeOrder', '')
        	
        	$scope.allPrinters = [{'device' : "", 'name' : ""}];
        	
        	//settingService.getPrinters();
        	
            settingService.getPrinters().then(function (response) {
                console.log("printers raw data: ",response);
                
	                for(var i = 0; i < response.length; i++) {
		            
			                $scope.allPrinters.push({'device' : response[i].name, 'name' : response[i].name});
						
		             
		              
	                }
                
	                if(localStorage.getItem("currentPrinters")) {
		        	
			        	$scope.currentPrinters = JSON.parse(localStorage.getItem("currentPrinters"));;
			        	console.log('printers from local: ',$scope.currentPrinters);
			        	
		        	} else {
			        	$scope.currentPrinters = {};
		        	}
                
                
                //alert(localStorage.getItem("currentShiftid"))
            }, function (err) { });
            
            $scope.saveSettings = function() {
	            console.log(typeof $scope.currentPrinters, $scope.currentPrinters);
	            localStorage.setItem("currentPrinters", JSON.stringify($scope.currentPrinters));
	            alertservice.showAlert('error', "success",$translate.instant('SETTINGSSAVED'));
	            
            }
              		
    }
})();