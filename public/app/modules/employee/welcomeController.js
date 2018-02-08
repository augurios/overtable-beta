(function () {
    'use strict';

    angular
        .module('welcomeEmployee')
        .controller('employeeWelcomeController', Controller);

    Controller.$inject = ['$scope', '$state', '$rootScope', '$location', 'toaster', '$http', 'SessionService', 'localStorageService', '$uibModal', 'PATHS', 'PermissionService', 'empService', 'getEmployee', 'utilservice', 'cashierBillsServiceFn', 'alertservice'];
    /* @ngInject */
    function Controller($scope, $state, $rootScope, $location, toaster, $http, SessionService, localStorageService, $uibModal, PATHS, PermissionService, empService, getEmployee, utilservice, cashierBillsServiceFn, alertservice) {

        //SessionService.getSession(); // get session details
        //if ($rootScope.loggedInUser && $rootScope.loggedInUser.role == 'kitchen')
          //  window.location = '/inventory'
       $scope.loggedinuser = JSON.parse(localStorage.getItem('CURRENTEMP'));
       
        var vm = this;
        $scope.cashierBillsServiceFn = cashierBillsServiceFn
        activateUserController()
        function activateUserController() {

        }//activateUserController
        try{
            if (localStorage.getItem("ProductionNotification")) {
                $scope.ProductionNotificationData = JSON.parse(localStorage.getItem('ProductionNotification'))
                $scope.ProductionNotification = _.filter($scope.ProductionNotificationData, function (num) { return num.Status == true; });
            }
        } catch (ddsfsdf) {

        }
        try {
            if (localStorage.getItem("IngredientNotification")) {
                $scope.IngredientNotificationData = JSON.parse(localStorage.getItem('IngredientNotification'))
                $scope.IngredientNotification = _.filter($scope.IngredientNotificationData, function (num) { return num.Status == true; });
            }
        } catch (ddsfsdf) {

        }

        if (localStorage.getItem("currentPrinters")) {
            $scope.printers = JSON.parse(localStorage.getItem("currentPrinters"));
            
        }
        
        $scope.openShift = function () {
            $('#modalOpenShift').modal('show');
            $scope.openShiftCash = 0
        }

        $scope.openmodifyDialog = function () {

            $('#modalEditShift').modal('show');
            $scope.observation = '';
            $scope.editedQuantity = 0;

        }
      
        $scope.removenotification = function (notifObj) {
            if (notifObj.ingredientsItem) {
                notifObj.Status = false;
                notifObj.time = new Date();
                localStorage.setItem("IngredientNotification", JSON.stringify($scope.IngredientNotificationData))
            } else if (notifObj.productionItem) {
                notifObj.Status = false;
                notifObj.time = new Date();
                localStorage.setItem("ProductionNotification", JSON.stringify($scope.ProductionNotificationData))
            }

        }

        $scope.shiftOff = function () {
            $rootScope.shift = JSON.parse(localStorage.getItem('ShiftUser'));
            var objTOSend = {
                SHID: localStorage.getItem("currentShiftid"),
                endtime: new Date()
            }
            var sokectObj = {
                ShiftId: localStorage.getItem("currentShiftid"),
                ResId: getEmployee.restaurant
            };
           // console.log(objTOSend);
            $rootScope.shift.endtime = new Date();
            $rootScope.shift.closeShiftBy= $scope.loggedinuser.firstname,
            empService.endtShift($rootScope.shift).then(function (response) {
              //  console.log(response);
                //$scope.shift = response;
                $rootScope.shiftOpen = false;
                localStorage.setItem('ShiftUser', null);
                $rootScope.socket.emit('shiftClosed', sokectObj);
            }, function (err) { });
          
            
        }

        $scope.modifyShift = function () {

            var OperationType ='Remove';
            if ($scope.Operation)
                OperationType = 'Add';

            if (!$scope.observation || $scope.observation=='' ||  $scope.observation.length < 10)
                alertservice.showAlert('error', "error", "Observation length should be more than this")
            else if (!$scope.editedQuantity || $scope.editedQuantity == null)
                alertservice.showAlert('error', "error", "Enter The Amount")
            else {
                if (OperationType == 'Remove' && $scope.editedQuantity > $rootScope.shift.closingBalance) {

                    alertservice.showAlert('error', "error", "Amount should Not be Greaterthan the Balance")

                } else {

                    var edit = {
                        editamount: $scope.editedQuantity, observation: $scope.observation, opertaiontype: OperationType,
                        time: new Date(), editby: $scope.loggedinuser.firstname
                    }
                    // $rootScope.shift.closingBalance = $rootScope.shift.closingBalance + editedQuantity
                    // observation

                    $('#modalEditShift').modal('hide');
                    function modifySHiftBalance(isExist, catid, doctomanage, existDocument) {
                        try {
                            existDocument.lastupdatetime = new Date();;

                            if (existDocument.shiftdata && (existDocument.shiftdata.closingBalance || existDocument.shiftdata.closingBalance==0)) {
                                if (doctomanage.opertaiontype == 'Add')
                                    existDocument.shiftdata.closingBalance = existDocument.shiftdata.closingBalance + doctomanage.editamount;
                                else
                                    existDocument.shiftdata.closingBalance = existDocument.shiftdata.closingBalance - doctomanage.editamount;

                                $rootScope.shift = existDocument.shiftdata;
                                existDocument.shiftdata.edits = existDocument.shiftdata.edits || [];
                                existDocument.shiftdata.edits.push(doctomanage);
                            }
                            return existDocument;
                        } catch (err) {
                            return existDocument;
                        }
                    }

                    utilservice.addOrUpdateDocInPouchDB('CurrentShift', edit, modifySHiftBalance).then(function (res) {

                        utilservice.syncINVOICES();
                    }).catch(function (err) {
                        reject(err);
                    });
                }
            }
        }
        

        $scope.shiftOn = function () {
            if (!$scope.openShiftCash || $scope.openShiftCash == null)
                $scope.openShiftCash = 0;
            var Edits = [];

            var obj = {
                idsshiftopenedby: getEmployee._id,
                restaurant: getEmployee.restaurant,
                created_by: getEmployee.firstname,
                updated_by: getEmployee.firstname,
                openingBalance: $scope.openShiftCash,
                openShiftBy: $scope.loggedinuser.firstname,
              
                closingBalance: $scope.openShiftCash,
                edits: Edits,
                clientId: utilservice.generateGUID()
            }
            obj.starttime = new Date();
            obj.orders = [];
            obj.invoices = [];
            empService.startShift(obj).then(function (response) {
             //   console.log(response);
                $rootScope.shift = response;
                $rootScope.shiftOpen = true;
                localStorage.setItem('ShiftUser', JSON.stringify(response));
                localStorage.setItem("currentShiftid", response.clientId);
            }, function (err) { });
          //  console.log(getEmployee)
        }


        function GetShiftFromLocal() {
            utilservice.getShift().then(function (response) {
                if (response.isopen) {
                    $rootScope.shiftOpen = response.isopen;
                    $rootScope.shift = response.shiftdata;
                }
            });
        }
        GetShiftFromLocal();
        $scope.confirmShift = function() {
            $('#modalConfirmShift').modal('show');
        }
        
        $scope.ReportAndshiftOff = function (shift) {
            GetShiftFromLocal();
           // console.log(getEmployee.firstname);
            $scope.isloading = true;
            $('#modalShiftReport').modal('show');
            cashierBillsServiceFn.GetInvoice(true).then(function (res) {
	        //    console.log("resssssponse: ",res);
                var allInvoice = [];
                var totalcash=0;
                var totalCredit=0;
                var synctime = new Date();
                $scope.isloading = false;
                for (var i = 0 ; i < res.length; i++) {
                    if (res[i].restaurant == getEmployee.restaurant) {
                        res[i].css = 'list-group-item';
                        res[i].prices = cashierBillsServiceFn.priceCalculation(res[i]);

                        allInvoice.push(res[i]);
                    }
                }
                for (var i = 0; i < allInvoice.length; i++) {
                    if (allInvoice[i].invoiceStatus == "CLOSED") {
                        if (allInvoice[i].iscash) {
                            totalcash = totalcash + allInvoice[i].prices.grandtotal;
                        }
                        if (!allInvoice[i].iscash) {
                            totalCredit = totalCredit + allInvoice[i].prices.grandtotal
                        }
                    }
                }
              //  console.log("all invoice",allInvoice);
                
                // getting 10% for each employee
                
                var salesPerEmployee = [];
                for(var i = 0; i < allInvoice.length; i++) {

	                var employee = allInvoice[i].servedby.firstname +" "+ allInvoice[i].servedby.lastname;
	                salesPerEmployee.push({'employee' : employee,"total":allInvoice[i].prices.grandtotal });
                }
              //  console.log("Presorted", salesPerEmployee);
                
                
                
                function compare(a, b) {
				  // Use toUpperCase() to ignore character casing
				  const genreA = a.employee.toUpperCase();
				  const genreB = b.employee.toUpperCase();
				
				  let comparison = 0;
				  if (genreA > genreB) {
				    comparison = 1;
				  } else if (genreA < genreB) {
				    comparison = -1;
				  }
				  return comparison;
				}
				
				salesPerEmployee.sort(compare);
                        
                
              //  console.log("sorted by employee", salesPerEmployee);
                
                var employeeScore = [];
                
                for(var ii = 0;ii < salesPerEmployee.length; ii++) {
	                if (employeeScore.length == 0) {
						employeeScore.push(salesPerEmployee[ii]);
				//		console.log("primer metida", employeeScore);
					} else if (salesPerEmployee[ii].employee == employeeScore[employeeScore.length-1].employee){
					//	console.log("verifica: ", ii, salesPerEmployee[ii].employee, employeeScore[employeeScore.length-1].employee);
						employeeScore[employeeScore.length-1].total = employeeScore[employeeScore.length-1].total + salesPerEmployee[ii].total
					}  else {
						employeeScore.push(salesPerEmployee[ii]);
					//	console.log("otra metida", employeeScore);
					}
                }
                                
            //    console.log("Sales by employee", employeeScore);
                
                var percentagePerEmployee = [];
                
                for(var ii = 0;ii < employeeScore.length; ii++) {
	                
	                
                	var percentageTax = employeeScore[ii].total - (13 / 100 * employeeScore[ii].total);
                	var percentage = (10 / 100 * percentageTax);
                	
                //	console.log('total',employeeScore[ii].total,'percentageTax',percentageTax, percentage,);
                	
                	percentagePerEmployee.push({"Employee":employeeScore[ii].employee,"Percentage":percentage})
                }
                
              //  console.log("Percentage by employee", percentagePerEmployee);
                
                $scope.shiftReport = shift;
                $scope.shiftReport.employeeScore = percentagePerEmployee;                
                $scope.shiftReport.totalCash = totalcash;
                $scope.shiftReport.totalCredit = totalCredit;
                $scope.shiftReport.grandTotal = $scope.shiftReport.totalCash + $scope.shiftReport.totalCredit;
                $scope.shiftReport.tax = (13 / 100 * $scope.shiftReport.grandTotal).toFixed(2);;
               
                $scope.shiftOff();

            });
        }
        $scope.printReport = function(report) {
	        report.printer = $scope.printers.Printer1;
	        return $http.post('http://localhost:10086/printreport', report, {headers:{'Content-Type': 'text/plain'},data: report}).then(function (res) {
                return res.data;
            }, function(error) {
	            
            });
        }
    }

})();