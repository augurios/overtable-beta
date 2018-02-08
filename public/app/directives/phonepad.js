/* phonepad.js */

/**
* @desc JS support for PADscreen
* @example <title update-title></title>
*/

(function() {
    'use strict';

    angular
        .module('application.widgets')
        .directive('phonepad', directive);

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
            $(element).click(function () {
                var num = $(this);
                var text = $.trim(num.find('.txt').clone().children().remove().end().text());
                var telNumber = $('#telNumber');
                $(telNumber).val(telNumber.val() + text);
            });
            

        }//link
    }

    Controller.$inject = [];
    /* @ngInject  */
    function Controller() {

    }
})();

