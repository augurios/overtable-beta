(function () {
    /**
     * @ngInject
     */
    'use strict';

    var $urlRouterProviderRef = null;
    var $stateProviderRef = null;
    
    angular
        .module('ordersMonitor', [
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
            

                $stateProviderRef.state('ordersMonitorA', {
                    url: '/ordersA',                    
                    templateUrl: path.TEMPLATE+'ordersMonitor/ordersMonitor.html',
                    controller  : 'ordersMonitorController',
                    controllerAs  : 'vm',
                    data : { pageTitle: 'Orders Monitor',bodyClass:"menuavaled ordersmonitor"},
                    resolve: {
                        employee: auth,
                        getEmployee : ResolveEmployee
                    },
                    params: {
                        orderType: 'A'
                    }
                });

                $stateProviderRef.state('ordersMonitorB', {
                    url: '/ordersB',
                    templateUrl: path.TEMPLATE + 'ordersMonitor/ordersMonitor.html',
                    controller: 'ordersMonitorController',
                    controllerAs: 'vm',
                    data: { pageTitle: 'Orders Monitor', bodyClass: "menuavaled ordersmonitor" },
                    resolve: {
                        employee: auth,
                        getEmployee: ResolveEmployee
                    },
                    params: {
                        orderType: 'B'
                    }
                });

                auth.$inject = ['empService','$rootScope'];
                function auth(empService, $rootScope) {
                    if ($rootScope.online) {
                        empService.authEmployee();
                    }
                    else{

                        empService.authEmployee()
                    }
                    
                }
                ResolveEmployee.$inject = ['employeeprofileService','$rootScope'];
                function ResolveEmployee(employeeprofileService, $rootScope) {
                    if ($rootScope.online) {
                         //return employeeprofileService.CurrentEmployee().then(function(data){ return data });
                         return employeeprofileService.CurrentEmployee()
                    }
                    else{
                       return employeeprofileService.CurrentEmployee()
                    }
                    
                }

        }])
})();


