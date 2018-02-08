/* menu.js */

/**
* @desc JS support for Menu
* @example <a menu> .. </a>
*/

(function() {
    'use strict';

    angular
        .module('application.widgets')
        .directive('menu', directive);

    directive.$inject = ['$timeout'];

    /* @ngInject */
    function directive($timeout) {

        var directive = {
            bindToController: true,
            controller: Controller,
            controllerAs: 'vm',
            link: link,
            restrict: 'A',
            scope: {
            }
        };
        return directive;

        function link(scope, element, attrs) {
            $(element).on('click', function(event) {
            ///$('a[href="#navbar-more-show"], .navbar-more-overlay').on('click', function(event) {
                event.preventDefault();
                $('body').toggleClass('navbar-more-show');
                if ($('body').hasClass('navbar-more-show')) {
                   element.closest('li').addClass('active');
                }else{
                    element.closest('li').removeClass('active');
                }
                return false;
            });
            

        }//link
    }

    Controller.$inject = [];
    /* @ngInject  */
    function Controller() {

    }
})();

