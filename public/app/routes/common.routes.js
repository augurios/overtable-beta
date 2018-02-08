(function () {
    'use strict';

    var $urlRouterProviderRef = null;
    var $stateProviderRef = null;
    
    angular
        .module('application.routes', [
        ])
        .config(['$stateProvider', 
            '$urlRouterProvider', 
            '$locationProvider', 
            '$httpProvider', 
            '$compileProvider',
            function (
                     $stateProvider,
                     $urlRouterProvider, 
                     $locationProvider, 
                     $httpProvider, 
                     $compileProvider
                   ) 
            {  
            
            $urlRouterProviderRef = $urlRouterProvider;
            $locationProvider.html5Mode(true);
            $stateProviderRef = $stateProvider;
            $urlRouterProvider.otherwise('/404');
            
             
            $stateProviderRef.state('404', {
                    url: '/404',                    
                    templateUrl:'errorpages/404.html',
                    controller  : 'not_found',
                    data : { pageTitle: 'Page not Found' }
            });
             $stateProviderRef.state('reset', {
                    url: '/reset',                    
                    templateUrl: 'pages/password.html',
                    controller  : 'resetPassword',
                    data : { pageTitle: 'Reset Your Password' }
            });
        }])
})();


