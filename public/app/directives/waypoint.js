/* waypoint.js */

/**
* @desc For waypoints manuplations
* 
*/


(function() {
    'use strict';

    angular
        .module('application.widgets')
        .directive('waypoint', directive);

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
            // animation handler
            $('[data-animation-delay]').each(function () {
              var animationDelay = $(this).data("animation-delay");
              $(this).css({
                  "-webkit-animation-delay": animationDelay,
                  "-moz-animation-delay": animationDelay,
                  "-o-animation-delay": animationDelay,
                  "-ms-animation-delay": animationDelay,
                  "animation-delay": animationDelay
              });
          });
                
          $('[data-animation]').waypoint(function (direction) {
              if (direction == "down") {
                  $(this).addClass("animated " + $(this).data("animation"));
              }
          }, {
              offset: '90%'
          }).waypoint(function (direction) {
              if (direction == "up") {
                  $(this).removeClass("animated " + $(this).data("animation"));
              }
          }, {
              offset: '100%'
          });
            

        }//link
    }

    Controller.$inject = [];
    /* @ngInject  */
    function Controller() {

    }
})();

