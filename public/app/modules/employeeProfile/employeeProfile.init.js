(function () {
    /**
     * @ngInject
     */
    'use strict';

    var $urlRouterProviderRef = null;
    var $stateProviderRef = null;
    
    angular
        .module('employeeprofile', [
            'application.thirdparty'
        ])
        .config(['$stateProvider', 
            '$urlRouterProvider', 
            '$locationProvider', 
            '$httpProvider', 
            '$compileProvider',
            'PATHS',
            function (
                     $stateProvider,
                     $urlRouterProvider, 
                     $locationProvider, 
                     $httpProvider, 
                     $compileProvider,
                     path
                    ) 
            {  
            
            $urlRouterProviderRef = $urlRouterProvider;
            $stateProviderRef = $stateProvider;
            

                $stateProviderRef.state('empprofile', {
                    url: '/employeeprofile',                    
                    templateUrl: path.TEMPLATE+'employeeProfile/employeeProfile.html',
                    controller  : 'employeeprofileController',
                    controllerAs  : 'vm',
                    data : { pageTitle: 'Employee Profile',bodyClass:"menuavaled empprof"},
                    resolve: {
                        employee: auth,
                        getEmployee : ResolveEmployee
                    }
                });
                auth.$inject = ['empService','$rootScope'];
                function auth(empService, $rootScope) {
                    if ($rootScope.online) {
                        return empService.authEmployee().then(function(data){ return data });
                    }
                    else{

                        empService.authEmployee()
                    }
                    
                }
                ResolveEmployee.$inject = ['employeeprofileService','$rootScope'];
                function ResolveEmployee(employeeprofileService, $rootScope) {
                    if ($rootScope.online) {
                         //return employeeprofileService.CurrentEmployee().then(function(data){ return data });
                         return employeeprofileService.CurrentEmployee().then(function(data){ return data }); //temp
                    }
                    else{
                       return employeeprofileService.CurrentEmployee().then(function(data){ return data });
                    }
                    
                }

        }])
})();


