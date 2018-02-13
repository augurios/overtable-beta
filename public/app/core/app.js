//Disruption Activated
(function () {
    'use strict';

    angular
           .module('mainServerapp',
               ['application.core',
               'application.config',
               'application.routes',
               'application.filters',
               'welcomeEmployee', 'login', 'dashboard', 'employeeprofile', 'cashierBills', 'inventoryManager', 'ordersMonitor', 'cashierHall', 'localSettings','cashierKiosk'
               ]
           )
           .run(['$q', '$http', '$stateParams', '$state', '$rootScope', '$location', '$urlRouter', '$route', '$window', '$compile', 'localStorageService', 'pathservice', 'REGEX', 'pouchDB', 'utilservice',
    function ($q, $http, $stateParams, $state, $rootScope, $location, $urlRouter, $route, $window, $compile, localStorageService, pathservice, REGEX, pouchDB, utilservice) {
		
        var db = pouchDB('lanapp', { adapter: 'idb' });
        
		
        
        pathservice.consts(function (data) {
            $rootScope.paths = data;
        });
        $rootScope.regex = REGEX;
        $http.defaults.headers.common['x-access-token'] = $rootScope.token;

        $rootScope.$state = $state;
        $rootScope.$on("$stateChangeStart", function (event, toState, test) {
            $rootScope.bodyClass = toState.data.bodyClass;
            $rootScope.isHome = toState.data.isHome;
            $rootScope.title = toState.data.pageTitle;
            $rootScope.teal = toState.data.teal;
            $rootScope.lbg = typeof (toState.data.lbg) === "undefined" ? toState.data.lbg : "nil";
            $rootScope.nopanel = toState.data.nopanel ? false : true;
        })

        $rootScope.loadApp = function () {

            var db = pouchDB('lanapp', { adapter: 'idb' });
            db.get('usersess', function (err, doc) {
                if (err) {
                    console.log("err end session ")
                    console.log(err)
                }
                else {
                    var datas = doc;
                    //changed for solving inventory not listed

                    if (doc.usermoment) {
                        localStorage.setItem("INSTANCEID", doc.usermoment.instanceid);
                        localStorage.setItem("EMAIL", doc.usermoment.email);
                        localStorage.setItem("resId", doc.usermoment.userid);

                       
                        utilservice.getUserDetails(doc.usermoment.userid).then(function (resData) {
                            if (resData.data && resData.data.image)
                                $rootScope.logo = resData.data.image;
                        });
                    }

                    if (doc.usermoment && doc.usermoment.employee) {

                        localStorage.setItem("CURRENTEMP", JSON.stringify(doc.usermoment.employee));

                        $rootScope.loggedInUser = doc.usermoment.employee;

                        //no sync required for these collection; 
                        utilservice.loadRooms();
                        utilservice.loadTables();
                        utilservice.loadEmployees();
                        utilservice.loadRestaurant();
                        utilservice.loadBillNumber();

                        //Sync order 
                        //1 -Category
                        //2 -Ingrdeient 
                        //3- Sides
                        //4- Prodduct
                        //5 - Invoices
                        //6 -Orders
                        //7 -Shift
                        utilservice.syncInventory(true).then(function (res) {
                            setTimeout(function (err) {
                                //loading everything from the servver to the device again
                                utilservice.loadCategory();
                                utilservice.loadIngedients();
                                utilservice.loadSides();
                                utilservice.loadProductions();
                                utilservice.loadProduct();

                            }, 2000);

                            utilservice.syncINVOICES(true).then(function (invsyncstatus) {
                                setTimeout(function () {
                                    utilservice.loadShift().then(function (shiftId) {
                                        utilservice.loadAppData(shiftId);
                                    });
                                    //utilservice.loadInvoices();
                                    //utilservice.loadOrders();
                                }, 2000);
                            })

                        });
                    }
                }
            });
        }

        $rootScope.connection = function (obj) {
            $rootScope.loadApp();
            $rootScope.socket.emit('connectUser', obj);
        }

        $rootScope.connectSocket = function () {
            angular.element(document).ready(function () {
                console.log(window.APIBASEURL);
                console.log("home socket service to connect -" + window.APIBASEURL);
                var iosocket = io.connect("http://overtableapp.disruptive.pro:8088/")
                iosocket.on('connect', function () {

                    console.log('Socket Connected');

                    $rootScope.socket = iosocket;

                    db.get('usersess', function (err, doc) {
                        if (err) {
                            console.log("err end session ")
                            console.log(err)
                        }
                        else {
                            try{
                                var datas = doc;
                                var id = doc.usermoment.employee._id;
                                $rootScope.socket.emit('connectUser', id);
                            } catch (err) {

                            }
                        }
                    });

                    iosocket.on('onShiftClosed', function (sokectObj) {
                        $rootScope.$broadcast('onShiftClosed', sokectObj);
                    });

                    iosocket.on('onNewInvoice', function (sokectObj) {
                        $rootScope.$broadcast('onNewInvoice', sokectObj);
                    });

                    iosocket.on('onInvoiceClose', function (sokectObj) {
                        if ($rootScope.socket.id != sokectObj.senderid)
                            $rootScope.$broadcast('onInvoiceClose', sokectObj);
                    });

                    iosocket.on('onChangeInvoiceOrders', function (sokectObj) {
                        if ($rootScope.socket.id != sokectObj.senderid)
                            $rootScope.$broadcast('onChangeInvoiceOrders', sokectObj);
                    });

                    iosocket.on('onInvoiceTableChange', function (sokectObj) {
                        if ($rootScope.socket.id != sokectObj.senderid)
                            $rootScope.$broadcast('onInvoiceTableChange', sokectObj);
                    });

                    iosocket.on('onChangeInvoiceMetaData', function (sokectObj) {
                        $rootScope.$broadcast('onChangeInvoiceMetaData', sokectObj);
                    });

                    iosocket.on('onOrderPlaced', function (order) {
                        $rootScope.$broadcast('onOrderPlaced', order);
                    });

                    iosocket.on('onOrderStarted', function (orderId) {
                        $rootScope.$broadcast('onOrderStarted', orderId);
                    });

                    iosocket.on('onOrderCompleted', function (orderId) {
                        $rootScope.$broadcast('onOrderCompleted', orderId);
                    });

                    iosocket.on('message', function (message) {
                        $('#incomingChatMessages').append($('<li></li>').text(message));
                    });

                    iosocket.on('disconnect', function () {
                        $('#incomingChatMessages').append('<li>Disconnected</li>');
                    });

                    iosocket.on('onTyping', function (message) {
                        $('#incomingChatMessages').append($('<li></li>').text("Typing"));
                    });
                    iosocket.on('onStopTyping', function (message) {
                        $('#incomingChatMessages').append($('<li></li>').text("stopTyping"));
                    });
                    iosocket.on('onConnectUser', function (message) {
                        console.log(message);
                        $('#incomingChatMessages').append($('<li></li>').text(message));
                    });
                    iosocket.on('onTextMessage', function (message) {
                        console.log(message);
                        $('#incomingChatMessages').append($('<li></li>').text("onTextMessage event"));
                    });
                    iosocket.on('selfTextMessage', function (message) {
                        console.log(message);
                        $('#incomingChatMessages').append($('<li></li>').text("selfTextMessage event"));
                    });
                });
            });
        }

        $rootScope.connectSocket();

        $rootScope.raiseSocketEvent = function (eventName, eventObj) {
            eventObj.senderid = $rootScope.socket.id;
            $rootScope.socket.emit(eventName, eventObj);
        }

        $rootScope.orderStatusmanager = {
            TEMPORAL: 'TEMPORAL',
            PLACED: 'PLACED',
            STARTED: 'STARTED',
            COMPLETED: 'COMPLETED',
            CLOSED: 'CLOSED',
            ARCHIVED: 'ARCHIVED'
        };

        $rootScope.invoiceStatusmanager = {
            NEW: 'NEW',
            STARTED: 'STARTED',
            COMPLETED: 'COMPLETED',
            CLOSED: 'CLOSED'
        };

        $rootScope.SplitItemDirection = {
            FORWARD: 'FORWARD',
            BACKWORD: 'BACKWORD'
        };

        $rootScope.dbDocumentKeys = {
            USERSESSION: "usersess",
            CURRENTEMPLOYEE: "CURRENTEMPLOYEE",
            ALLEMPLOYEES: "ALLEMPLOYEES",
            INVOICES: "INVOICES",
            ORDERS: "ORDERS",
            PRODUCTS: "PRODUCTS",
            INGREDIENTS: "INGREDIENTS",
            SIDES: "SIDES",
            CATEGORY: "CATEGORY",
        }

        $rootScope.$on("$viewContentLoaded", function (event, toState, test) {
            $.material.init();
        })

        $rootScope.lang = 'en';

        $rootScope.$on('$translateChangeSuccess', function (event, data) {
            var language = data.language;
            $rootScope.lang = language;
        });

        /*$rootScope.syncdetails = {}
        localStorageService.set('_meanLanAppSync',$rootScope.syncdetails);*/
        $rootScope.online = navigator.onLine;
        $window.addEventListener("offline", function () {
            $rootScope.$apply(function () {
                $rootScope.online = false;
            });
        }, false);
        $window.addEventListener("online", function () {
            $rootScope.$apply(function () {
                $rootScope.online = true;
                $rootScope.loadApp();
            });
        }, false);

        //$rootScope.online = false;

        $rootScope.toaster = { 'time-out': 3000, 'limit': 3, 'close-button': true, 'animation-class': 'toast-right-center' }
        console.log('Done loading dependencies and configuring module!');

        $rootScope.loadApp();
    }])
})();