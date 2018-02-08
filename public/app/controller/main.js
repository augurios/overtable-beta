(function() {
    'use strict';

    angular
        .module('mainServerapp')
        .controller('not_found', NotFoundController)
        .controller('main', Controller)

    
    /* @ngInject */
    function NotFoundController() {
        var vm = this;
        vm.title = 'Controller';

        activate();

        ////////////////

        function activate() {
        }
    }

   

    Controller.$inject = ['$scope', '$state', '$rootScope', '$http', '$window', 'localStorageService', 'SessionService', 'toaster', 'empService', '$translate', 'pouchDB', 'socket', 'loginService', 'localdb', '$timeout', 'alertservice','$location'];
    
     /* @ngInject */
    function Controller($scope, $state, $rootScope, $http, $window, localStorageService, SessionService, toaster, empService, $translate, pouchDB, socket, loginService, localdb, $timeout, alertservice, $location) {
      
       
      //loginService.getRestaurant().then(function(data){
      //    if (data)
      //        localStorageService.set('restaurantData', data.data.data.restdata);
            
            
      //     }, function(err){
      //      console.log(err)
      //     });
       
       $scope.$watch('online', function(newStatus) {
        $rootScope.nointernet = newStatus;
        $rootScope.syncing = false;
        
        if(newStatus){
          
            socket.emit('dbSync:online', {
              name: 'DB Sync',
              desc: 'This defines what to happen when coming online'
            })
            
            


            
             if(localStorageService.get('_meanLanAppSync')){
              $rootScope.syncing = true;
                
               
                var wohe = localStorageService.get('_meanLanAppSync');
                if (wohe instanceof Array) {
                  //Current User Server Auth

                  // dynamic sockets
                  
                  for(var i = 0; i<wohe.length; ++i){ 
                    if(wohe[i]) {
  

                        if(wohe[i].hasOwnProperty("employeeprofile")) {
  
                          dosyncronise_employee(wohe[i])
                          /*wohe.splice(i, 1);
                          localStorageService.set('_meanLanAppSync',wohe);
                          $rootScope.syncing = false
  */
                        };
                        if(wohe[i].hasOwnProperty("session")) {
                          dosyncronise_session(wohe[i])
                        };
                      
                    }
                   
                  }

                  //console.log(typeof wohe[0]['session']);
                 // console.log(typeof wohe[0] == 'undefined');
                  if( typeof wohe[0] == 'undefined' ){
                  //if(!wohe[0]['session']){
                    dosyncronise_employeesessionout({"session" : false})
                  }
                  

                  // localstoragge is an array
                  
                  function dosyncronise_employee(employeesync){
                   
                    
                    var userId = employeesync.employeeprofile.edit
                    var datawho = employeesync.employeeprofile.data
                  
                    socket.emit('emplyeeprofile:online', {
                      name: 'DB Sync',
                      desc: 'Syncing profile data to employee profile (current employee)',
                      data: { id : userId, dump : datawho }
                    },function (data) {
                          wohe.splice(i, 1);
                          localStorageService.set('_meanLanAppSync',wohe);
                          $rootScope.syncing = false
  
                          $rootScope.$broadcast('updatemployeelocaly');
                    })
                   // delete employeesync
                    

                  }

                  function dosyncronise_session(sessionsync){

                      var sessionEmployee = sessionsync.session.data
                    // if(sessionEmployee.flag == 1){
                        socket.emit('auth:online', {
                          name: 'DB Sync',
                          desc: 'Syncing session data to employee profile (current employee)',
                          data: { val : sessionEmployee }
                        })
                        $rootScope.syncing = false; 
                  } 
                  function dosyncronise_employeesessionout(sessionsync){

                      var sessionEmployee = sessionsync
              
                    // if(sessionEmployee.flag == 1){
                        socket.emit('authemployeeout:online', {
                          name: 'DB Sync',
                          desc: 'Syncing session out data to employee profile (current employee)',
                          data:  sessionEmployee 
                        })
                        $rootScope.syncing = false; 
                  }

               /* if ('session' in wohe[0]){
                  
                 // if(wohe.session.hasOwnProperty("data")){
                      var sessionEmployee = wohe[0].session.data
                      console.log(sessionEmployee)
                    // if(sessionEmployee.flag == 1){
                        socket.emit('auth:online', {
                          name: 'DB Sync',
                          desc: 'Syncing session data to employee profile (current employee)',
                          data: { val : sessionEmployee }
                        })
                        $rootScope.syncing = false; 
                      //}
                  }
               // }
                else{
                      $rootScope.syncing = false; 
                      console.log("no data to sync in session part")
                }*/

                 // Employee Profile Update
              /*if ('1' in wohe){
                 if ('employeeprofile' in wohe[1]){
                    if ('edit' in wohe[1].employeeprofile){
                        var userId = wohe[1].employeeprofile.edit
                        var datawho = wohe[1].employeeprofile.data
                      
                        socket.emit('emplyeeprofile:online', {
                          name: 'DB Sync',
                          desc: 'Syncing profile data to employee profile (current employee)',
                          data: { id : userId, dump : datawho }
                        },function (data) {
                              $rootScope.$broadcast('updatemployeelocaly');
                              })
                       // delete wohe[1]
                       wohe.splice(1, 1);
                        console.log(wohe)
                       // wohe.session.flag = 0;
                        localStorageService.set('_meanLanAppSync',wohe);
                        $rootScope.syncing = false
                    }
                }
                else{ 
                    $rootScope.syncing = false;
                    console.log("no data to sync in profile part")
                }
              }else{
                 $rootScope.$broadcast('updatemployeelocaly');
              }*/

               

              // clear / remove
              // localStorageService.get('_meanLanAppSync') // localStorageService.remove('_meanLanAppSync');
              // $rootScope.syncdetails);
              // After syncing
                }
                $timeout(function(){
                   $rootScope.$broadcast('updatemployeelocaly');
                   $rootScope.syncing = false; 
                 }, 3000);

            }
        }
        else{
          socket.emit('dbSync:offline', {
              name: 'DB Sync',
              desc: 'This defines what to happen when going offline'
          })
        }
       });
       

       $rootScope.$on('getemployeeDetailsforthisResturant', function(event, data) {
	       
	      
	       
	       
          loginService.getEmployess().then(function(data){
            console.log(data)
            
           }, function(err){
            console.log(err)
           });
       })

         socket.on('emplyeeprofilereponse:online', function(data){
      /*    alert(data)
          console.log(data)*/
             if (data.success) alertservice.showAlert("success", "Sync Profile Success", data.message)
             else alertservice.showAlert("error", "Failed", data.message)

         
         })  
         socket.on('authresponse:online', function(data){
          //alert(data)
          console.log(data)
          if (data.success) alertservice.showAlert("success", "Sync Profile Success", data.message)
          else alertservice.showAlert("error", "Failed", data.message)

         
         })
         
         $rootScope.$on('updatemployeelocaly', function(event, data) {
          /**/
          //localdb.syncLocalEmployeeTable().then(SuccessLocal,FailLocal)
          // update the local employess tables
          
       })
         function SuccessLocal(res){
          console.log(res)
         }
        function FailLocal(err){
          console.log(err)
         }

        var core = this;
        core.logout = function () {
            if ($rootScope.online) {
                //clar all local document
                localStorageService.clearAll();
                $rootScope.token = {};
                $rootScope.user = {}
                SessionService.logOut();
            } else {
                alertservice.showAlert('success', "Success", "You need active intenet connectin to  logout from this session");
            }
        }

        core.terminate = function () {
            empService.terminateEmployeeSession().then(function (res) {
                try {
                    $scope.$apply(function () {
                        console.log("in apply funciton");
                        $location.path('/dashboard');
                    });
                } catch (lerr) {
                    $timeout(function () {
                        console.log("in timeout funciton");
                        //$scope.$apply(function () {
                        $location.path('/dashboard');
                        //});
                    });
                }
            })
        }
        
        core.exitApp = function () {
	        var txt;
			var r = confirm("Realmente quieres salir?!");
			if (r == true) {
			    $http.get('http://localhost:10086/exit').then(function (res) {
                	return res.data;
				}, 'Error exiting app');
			} else {
			    return
			}
			
	        
        }

        $scope.changeOnlineStatusTest = function (status) {
            $rootScope.online = status;
            if (status) {
                var db = pouchDB('lanapp', { adapter: 'idb' });
                db.get('usersess', function (err, doc) {
                    if (err) {
                        console.log("err end session ")
                        console.log(err)
                    }
                    else
                        $rootScope.connection(doc.usermoment.employee._id);
                });
            }
        }
        
        $scope.changeLanguage = function(langKey) {
          $translate.use(langKey);
        };

    }
})();