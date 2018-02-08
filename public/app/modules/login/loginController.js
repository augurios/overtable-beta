(function() {
    'use strict';

    angular
        .module('login')
        .controller('login', LoginController);

    LoginController.$inject = ['$scope','$state','$rootScope','$location','toaster','$http','localStorageService','loginService','alertservice'];
    
    function LoginController($scope, $state, $rootScope, $location, toaster, $http, localStorageService, loginService, alertservice) {
        var vm = this
    	this.buttontext = "Sign In"
        this.authenticate = function (){
        	this.buttontext = "Signing..."
        	   vm.buttontext = "Wait..";

		           if ($scope.authenticate.$valid) {
		                 var promise = loginService.login(vm.credential);
		                    promise.then(
		                      function(payload) { 
								  
		                          if (payload.data.success) {
			                          
		                              $rootScope.token = payload.data.data.token;
		                              $http.defaults.headers.common['x-access-token'] = payload.data.data.token;
		                              localStorageService.set('_meanLanApp', payload.data.data.token);
		                              localStorageService.set('_meanLanAppLogIn', 1);
		                              vm.buttontext = "Logined";
		                              window.location = '/dashboard'
		                              //$location.path('/dashboard');  fix for refresh
		                              alertservice.showAlert('success', "Success", payload.data.message)
		                          }
		                          else {
		                              alertservice.showAlert('error', "Failed", payload.data.message)
		                          }
		                      		 vm.buttontext = "Sign In";
		                        },
		                      function(errorPayload) {
		                          if(!errorPayload.success){
		                              alertservice.showAlert('error', "Failed", errorPayload.message)
		                           }
		                      }); 
		           }
		           else{
		            vm.buttontext = "Sign In";
		            vm.submitted = true;
		           }
        }
    }
    	
})();