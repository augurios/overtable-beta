
(function () {
    'use strict';

    angular
        .module('dashboard')
        .factory('dashboardService', serviceFn);

    serviceFn.$inject = ['$http','pouchDB','$rootScope'];
    /* @ngInject */
    function serviceFn($http, pouchDB, $rootScope) {
        var db =  pouchDB('lanapp', {adapter : 'idb'});
        var service = {};
        service.loginpad       = employeeLogin;
        return service;
        
        /////////
       

        function employeeLogin(data) {
            if ($rootScope.online) {
                // pdb.get(noteid, {attachments: true}, function(error, response) {
                //  Employee.findOne({ pin: PIN, active : 1 }, function (err, user) {


                /* db.query('employee', {
                             pin: 1111
                           }).then(function (result) {
                                         console.log(result);
                           }).catch(function (err) {
                                  console.log(err);
                             });*/

                /*db.query(function (doc, emit) {
                  emit(doc.name);
                }, {key: 'foo'}).then(function (result) {
                  // found docs with name === 'foo'
                }).catch(function (err) {
                  // handle any errors
                });*/

                /* db.allDocs({
                   include_docs: true,
                   startkey: 'pin'
                 }).then(function (result) {
                     console.log(result)
                   // handle result
                 }).catch(function (err) {
                   console.log(err);
                 });*/
                /* db.get('employee').then(function (result) {
                     console.log(result)
                     var empIds = [1112]
                     var filteredArray = result.emplyoeedata.filter(function(itm){
                       return empIds.indexOf(itm.pin) > -1;
                     });
 
                     filteredArray = {  filteredArray };
                     console.log(filteredArray)
                   // handle result
                 }).catch(function (err) {
                   console.log(err);
                 })*/
                return $http.post(window.APIBASEURL + '/clientapp/api/v1/employeeLogin', { minifpin: data }).then(handleSuccessLocal, handleError('Error getting all users'));
            }
            else {

            }
        }
       


        function handleSuccess(res) {
            return res.data;
        }
        function handleSuccessLocal(res) {
            var return_data = res.data;
            /*db.get('usersess', function(err, doc) {
                    if (err) { 
                        console.log("err end session")
                        console.log(err)
                    }
                    else{
                        console.log("Done handleSuccessLocal")
                        console.log(doc)
                        
                        var id= doc._rev;
                        var datas = doc

                        datas.usermoment.employee = return_data

                               db.put({
                                _id: 'usersess',
                                _rev: doc._rev,
                                usermoment: datas
                              });

                    }

                })*/
             return return_data;
        }
        function handleError(error) {
            return function () {
                return { success: false, message: error };
            };
        }
    }

})();