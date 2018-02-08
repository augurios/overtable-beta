(function () {
    'use strict';

 angular
        .module('application.config', ['application.thirdparty'])

	    .config(config)

        config.$inject = ['$stateProvider', '$urlRouterProvider','$locationProvider', '$httpProvider','$compileProvider', 'cfpLoadingBarProvider','localStorageServiceProvider','$translateProvider'];
		/* ngInject */
	    function config($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider,$compileProvider,cfpLoadingBarProvider,localStorageServiceProvider,$translateProvider) {
			cfpLoadingBarProvider.includeSpinner = true;
		
            localStorageServiceProvider
			    .setPrefix('serverLan')
			    .setStorageType('localStorage')
			    .setNotify(true, true)
			    .setStorageCookie(1, '<path>');

			 $compileProvider.debugInfoEnabled(false);

			if (!$httpProvider.defaults.headers.get) {
		        $httpProvider.defaults.headers.get = {};
		    }
		     $translateProvider
			  .useStaticFilesLoader({
			    prefix: './public/app/translations/locale-',
			    suffix: '.json'
			  })
			  .useMissingTranslationHandlerLog()
		      .useSanitizeValueStrategy()
		      .useStorage('translationService')
		      .registerAvailableLanguageKeys(['en', 'sp'])
		      .preferredLanguage('es')
		      .fallbackLanguage('en')
              .usePostCompiling(true)

		    $httpProvider.defaults.useXDomain = true;
		    delete $httpProvider.defaults.headers.common['X-Requested-With'];
		    $httpProvider.interceptors.push('httpRequestInterceptor');
		    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
		    $httpProvider.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
		    $httpProvider.defaults.headers.common['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE';
		    $httpProvider.defaults.headers.common['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
		    $httpProvider.defaults.headers.common['Access-Control-Allow-Credentials'] = 'true';

		    //$httpProvider.interceptors.push(function ($q) {
		    //    return {
		    //        'request': function (config) {
		    //            config.url = config.url + '?id=123';
		    //            return config;// || $q.when(config);

		    //        }

		    //    }
		    //});
	    }



})();