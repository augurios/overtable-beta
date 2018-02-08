(function() {
    'use strict';

    angular
        .module('employeeprofile')
        .controller('employeeprofileController', Controller);
  
    Controller.$inject = ['$scope', '$state', '$rootScope', '$location', 'toaster', '$http', 'SessionService', 'localStorageService', '$uibModal', 'employeeprofileService', 'PATHS', 'PermissionService', 'getEmployee', 'alertservice'];
    /* @ngInject */
    function Controller($scope, $state, $rootScope,$location,toaster,$http,SessionService,localStorageService,$uibModal,employeeprofileService,PATHS,PermissionService,getEmployee,alertservice) {
     
        //SessionService.getSession(); // get session details
        var vm = this;
        this.employee  =  getEmployee

        this.change = function(){
           employeeprofileService.updateUser(this.employee).then(successcallback,failPayload)
        }

        function successcallback(res){
            if ($rootScope.online) {
                if(res.success)
                {
                    $rootScope.$broadcast('updatemployeelocaly');
                    alertservice.showAlert('success', "Success", res.message)
                } 
                else {
                    alertservice.showAlert('failed', "Failed", res.message)
                }
            }
            else{
                alertservice.showAlert('success', "Success", "Updated")
            }
           
        }
        function failPayload(err){
            console.log(err)
        }

        activateUserController()
        function activateUserController (){
        

        }//activateUserController
  		
    }
})();