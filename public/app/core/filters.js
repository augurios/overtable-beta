(function () {
    'use strict';

    angular
           .module('application.filters', [])
           .filter('customCurrency', function ($filter) {

               return function (input, optional1, optional2) {

                   var output = "";

                   try{
                       output = (input.toLocaleString('en'));
                   } catch (err) {

                   }
                   //console.log(input);
                   // Do filter work here

                   return output;

               }

           })


})();