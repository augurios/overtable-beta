/* title.js */

/**
* @desc For displaying titles
* @example <title update-title></title>
*/

(function() {
    'use strict';

    angular
        .module('application.widgets')
        .directive('updateTitle', title)

        title.$inject =['$rootScope', '$timeout'];
        
            
            var directive = {
                bindToController: true,
                controller: Controller,
                controllerAs: 'vm',
                restrict: 'AE',
                scope: {
                }
            };
            return directive;
            /* @ngInject */
            function title($rootScope, $timeout) {
                return {
                    link: function (scope, element) {

                        var listener = function (event, toState) {

                            var title = 'MeanApp';
                            if (toState.data && toState.data.pageTitle){ title = toState.data.pageTitle + " | " +title};

                            $timeout(function () {
                                element.text(title);
                            }, 0, false);
                        };

                        $rootScope.$on('$stateChangeSuccess', listener);
                    }
                };
            }


    Controller.$inject =[];
    /* @ngInject */
    function Controller() {

    }
})();

