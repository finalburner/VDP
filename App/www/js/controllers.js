
controllers

.controller('AppCtrl', ['$rootScope', '$scope', '$ionicModal', '$stateParams', '$timeout', 'socket', '$state', 'P', 'ConnectivityMonitor', 'Notif', 'AuthService', function($rootScope, $scope, $ionicModal, $stateParams, $timeout, socket, $state, P, ConnectivityMonitor, Notif, AuthService) {
  var i = 1 ;

// $state.go('app.CT'); //test only
//   $scope.$on('$ionicView.enter', function() {
//      // Code you want executed every time view is opened/
//   $rootScope.Selected_CT = "CT05320"
//   setTimeout(function(){
//   i = Math.floor(5 * Math.random() + 1)
//   if (i==1) $state.go('app.CT');
//   if (i==2) $state.go('app.CTsta');
//   if (i==3) $state.go('app.CTsyn');
//   if (i==4) $state.go('app.CTcon');
//   if (i==5) {$state.go('app.alarmes'); }
// },2000 ); // 5 à 10 s
//   })
// $rootScope.$on('$stateChangeStart', function (event, next) {
//   var authorizedRoles = next.data.authorizedRoles;
//   if (!AuthService.isAuthorized(authorizedRoles)) {
//     event.preventDefault();
//     if (AuthService.isAuthenticated()) {
//       // user is not allowed
//       $rootScope.$broadcast(P.AUTH_EVENTS.notAuthorized);
//     } else {
//       // user is not logged in
//       $rootScope.$broadcast(P.AUTH_EVENTS.notAuthenticated);
//     }
//   }
// });
ConnectivityMonitor.startWatching();
socket.on(P.SOCKET.CO , function () {
socket.emit(P.SOCKET.CC);
Notif.Show("Connecté");
});


$scope.list_N1 = P.MODAL_N1;

$scope.Cnx = {
    username: '',
    password: ''
  };

$scope.currentUser = null;
$scope.userRoles = P.USER_ROLES;
$scope.isAuthorized = AuthService.isAuthorized;

$scope.setCurrentUser = function (user) {
    $scope.currentUser = user;
  };

$scope.login = function (Cnx)
{
  // console.log(Cnx)
  AuthService.login(Cnx).then(function(user) {
  $rootScope.$broadcast(P.AUTH_EVENTS.loginSuccess);
  $scope.setCurrentUser(user);
  $state.go('app.CT');
  // console.log($scope.currentUser)
 }, function () {
      $rootScope.$broadcast(P.AUTH_EVENTS.loginFailed);
    });
  };

$scope.unlog = function ()
  {
    $rootScope.$broadcast(P.AUTH_EVENTS.logoutSuccess);
    $scope.setCurrentUser(null);
    $state.go('login');
  };

  // socket.on('id', function(data){ $scope.clientid = data ; });
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal

// Create the login modal that we will use later
$ionicModal.fromTemplateUrl('templates/N0/login.html',function(modal){
          $scope.modalCnx = modal;
        }, {
          scope: $scope,  /// GIVE THE MODAL ACCESS TO PARENT SCOPE
          animation: 'slide-in-up',//'slide-left-right', 'slide-in-up', 'slide-right-left'
          focusFirstInput: true
        });
//
$ionicModal.fromTemplateUrl('templates/N1/modalN1.html', function(modal) {
          $scope.modalN1 = modal;
        }, {
          scope: $scope,  /// GIVE THE MODAL ACCESS TO PARENT SCOPE
          animation: 'slide-in-up',//'slide-left-right', 'slide-in-up', 'slide-right-left'
          focusFirstInput: true
        });

$scope.CT_N1 = function (name) //ouvre synthèse d'un CT
  {
    // console.log(map.zoom)

    $rootScope.Selected_CT = name;
    $state.go('app.CTsyn');
  };



//Change Selected_CT to 'null' - display alarm for ALL CTS
$scope.JAL = function() {
   $rootScope.Selected_CT = 'null'
};

//ouverture du modal N1
$scope.N1_open = function(name,color) {
          $scope.modalN1.show();
          $scope.modalN1.name= name;
          $scope.modalN1.AL_Color= color;
          $scope.modalN1.animation =  "slide-left-right";
          $rootScope.Selected_CT = name;
        };

//fermeture du modal N1
$scope.N1_close = function(name) {
      $scope.modalN1.hide();
};

// Triggered in the login modal to close it
// $scope.closeLogin = function() {
//     $scope.modalCnx.hide();
//   };

// Open the login modal
// $scope.login = function() {
//     $scope.modalCnx.show();
//   };

}])

.controller('ConCtrl', ['$scope', 'socket', '$ionicLoading', '$rootScope', '$state', 'P', function($scope, socket, $ionicLoading, $rootScope,$state, P) {

   $scope.Validate_Item = '' ;
   $scope.List_Cons = [] ;

  if(!$rootScope.Selected_NomGrp || !$rootScope.Selected_Grp)  $state.go('app.CTsyn'); //Redirect to CT
   socket.emit(P.SOCKET.CQ , { M : "Read" , Selected_Grp : $rootScope.Selected_Grp , Selected_CT :$rootScope.Selected_CT });
   socket.on(P.SOCKET.CA , function(data) {
  //  console.log(data)
// if( data.Type == 'TR' && data.Value && data.Value.toString().length >= 6 )
//    data.Value  = Math.round(data.Value).toFixed(2);
    $scope.List_Cons = data;
    console.log(data)
   });

   $scope.Write= function (item)
   {
   // console.log(item)
   item.M= "Write";
   socket.emit(P.SOCKET.CQ, item );
   }

   $scope.Analog_Change = function(item)
   {
     if(item.V != item.LV)
   {// console.log(item);
   item.M = "Write";
   socket.emit(P.SOCKET.CQ, item );
   }};

      }])

.controller('CTfic', ['$scope', 'socket', function($scope,socket) {

$scope.Live_Update = [];

socket.on('update',function(data){
$scope.Live_Update.push({ id : data.id , value : data.value });
// console.log(data.id + ">>>>" + data.value )
// console.log(Live_Update);
});
}])


.controller('CTctrl', ['$rootScope', '$scope', 'socket', '$ionicLoading', 'P', '$cordovaGeolocation', '$ionicSideMenuDelegate','$state', function($rootScope, $scope,socket,$ionicLoading, P, $cordovaGeolocation, $ionicSideMenuDelegate, $state ) {


  $rootScope.$on('$stateChangeStart',  function(event, toState, toParams, fromState, fromParams){
  if(toState.url == "/carto")
   $ionicSideMenuDelegate.canDragContent(false);
  if(fromState.url == "/carto")
   $ionicSideMenuDelegate.canDragContent(true);
 });

  var def  =  [48.861253, 2.329920]
  $scope.loc = def ;
  var posOptions = {timeout: 10000, enableHighAccuracy: false};

     $cordovaGeolocation
     .getCurrentPosition(posOptions)
     .then(function (position) {
        var pos  = [ position.coords.latitude , position.coords.longitude ]
        $scope.loc = pos;
        $scope.marker = pos;
      console.log($scope.loc)
     }, function(err) {
        console.log(err)
     });

   $ionicLoading.show({
   content: 'Loading', animation: 'fade-in', showBackdrop: true,
   duration: 1000, maxWidth: 200,  showDelay: 0
  });

  socket.emit(P.SOCKET.CTQ);
  socket.on(P.SOCKET.CTA, function(data){
    // console.log("socket")
  $scope.List_CT = data ;
  // console.dir($scope.List_CT.length)
   $ionicLoading.hide();
  });

   $scope.CT_pow = "100kW Gaz SED14";
   $scope.CT_alm = "Message d\'information caractérisant l\'alarme.Ca peut être long"
   $scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyB3QWWdY2M8JtbDSSrVriG9lIwD5anCRHo";

  }])

.controller('ALctrl', ['$rootScope', '$scope', 'socket', '$ionicLoading', 'P', '$state', '$stateParams', function($rootScope,$scope,socket,$ionicLoading,P,$state, $stateParams) {

$scope.List_AL = []
$scope.Synthese_PresentCount= 0 ;
$scope.Filter_Alm ;

$scope.ACK = function(item)
{
  // console.log(item)
  if (!item.Ack)
  {item.Mode = 'Write';
  item.Type = 'ACK'
  socket.emit(P.SOCKET.ALQ, item);}
  else
  console.log('Alarme déja acquitée')
  // console.log({ Mode : 'Write' , Type : 'ACK', NodeId : item.NodeId })
}

$scope.expand_AL = function(item) {
        if ($scope.isItemExpanded(item)) {
          $scope.shownItem = null;
        } else {
          $scope.shownItem = item.M;
        }
      };

$scope.isItemExpanded = function(item) {
  // console.log("shownitem : " + $scope.shownItem)
        return $scope.shownItem === item.M;
      };

socket.on(P.SOCKET.OU, function(data){

  if (data.id == 'Synthese.PresentCount')
  $scope.Synthese_PresentCount = data.value;
    console.log($scope.Synthese_PresentCount)
});

$scope.$watch(['Synthese_PresentCount'], function(newValue, oldValue) {

  //Demande mise à jour listes Alarmes
socket.emit(P.SOCKET.ALQ , { Mode : 'Read' , Selected_CT : $rootScope.Selected_CT});
console.log("OPC Present NBR :" + $scope.Synthese_PresentCount)
// $ionicLoading.show({
// content: 'Loading', animation: 'fade-in', showBackdrop: true,
// duration: 1000, maxWidth: 200,  showDelay: 0
// });
});

    // var list_AL = [
    // { type: 'AL 49850',
    //   date : 'hh:mm:ss - dd/mm/yyy',
    //   etat : 'Présente',
    //   alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
    //     color: '#003DF5' // Bleue
    // },

//Reception des Alarmes unitaires depuis OPC
socket.on(P.SOCKET.ALA, function(data){
  // console.log(data)
$scope.List_AL = data
$ionicLoading.hide();
   });

    }])


.controller('CTActrl', ['$rootScope', '$scope', 'socket', '$state', 'P', function($rootScope, $scope, socket, $state, P) {


$scope.Selected_CT = $rootScope.Selected_CT ; //CT selectionné
if(!$scope.Selected_CT)  $state.go('app.CT'); //Redirect to CT


$scope.Consigne_Grp = function (NomGrp,Grp)
    {
      $rootScope.Selected_NomGrp = NomGrp;
      $rootScope.Selected_Grp = Grp;
      $state.go('app.CTcon');
    };
var List_CTA_Local =  [ ];
$scope.List_CTA = []

$scope.expand_AL = function(item) {
          if ($scope.isItemExpanded(item)) {
            $scope.shownItem = null;
          } else {
            $scope.shownItem = item;
          }
        };
        $scope.isItemExpanded = function(item) {
          return $scope.shownItem === item;
        };

socket.emit(P.SOCKET.CTAQ , { Selected_CT : $scope.Selected_CT} );
socket.on(P.SOCKET.CTAA ,function(data){
// console.log(data)
var cta = List_CTA_Local.findIndex(function(obj) { obj.DesignGroupeFonctionnel == data.Libelle_groupe});
if (cta == -1 )  // -1 ==> unfound
List_CTA_Local.push(data);
else
List_CTA_Local[cta] = data ;

if (data.len -1 == data.item) $scope.List_CTA = List_CTA_Local ;
});


// $scope.CTA_list = CTA_List;

// console.log(List_CTA)
// $scope.labels =["1","2","3","4","5","6"];
//
// $scope.options = {
//           scales: {
//             yAxes: [
//               {
//                 id: 'y-axis-1',
//                 type: 'linear',
//                 display: true,
//                 position: 'left'
//               }
//             ]
//           }
//         };

      }])

.controller('StaCtrl', ['$scope', '$rootScope', '$state', 'socket', 'P', function($scope, $rootScope,$state,socket, P) {

  $scope.Selected_CT = $rootScope.Selected_CT ;
  if(!$scope.Selected_CT)  $state.go('app.CT'); //Redirect to CT

  $scope.List_Sta = [] ;
  var List_Sta_Local = []
  socket.emit(P.SOCKET.SQ , { Mode : "Read" , Selected_CT : $scope.Selected_CT });
  socket.on(P.SOCKET.SA , function(data) {
  console.log(data)

  var StaIndex = List_Sta_Local.findIndex(function(obj) { obj.Mnemo == data.Mnemo});
  if (StaIndex == -1 )  // -1
  List_Sta_Local.push(data);
  else
  List_Sta_Local[StaIndex] = data ;

  if (data.len -1 == data.item ) $scope.List_Sta = List_Sta_Local ;
  });

  $scope.Write= function (item)
  {
  // console.log(item)
  item.Mode = "Write";
  socket.emit(P.SOCKET.CQ, item );
  }

}])

.controller('QrCtrl', ['$scope', '$rootScope', '$cordovaBarcodeScanner', '$ionicPlatform', function($scope, $rootScope, $cordovaBarcodeScanner, $ionicPlatform) {
           $scope.scan = function(){
               $ionicPlatform.ready(function() {
                   $cordovaBarcodeScanner
                       .scan()
                       .then(function(result) {
                           // Success! Barcode data is here
                           $scope.scanResults = "We got a barcode\n" +
                           "Result: " + result.text + "\n" +
                           "Format: " + result.format + "\n" +
                           "Cancelled: " + result.cancelled;
                       }, function(error) {
                           // An error occurred
                           $scope.scanResults = 'Error: ' + error;
                       });
               });
           };

           $scope.scanResults = '';
       }])

.controller('AdminCtrl', ['$scope', 'socket', '$ionicLoading', 'P', function($scope, socket, $ionicLoading, P) {

$scope.Validate_Item = '' ;
$scope.List_Cons = []

socket.emit(P.SOCKET.CQ, { M : "Read"});
socket.on(P.SOCKET.CA, function(data) {
// if( data.Type == 'TR' && data.Value && data.Value.toString().length >= 6 )
// data.Value  = Math.round(data.Value).toFixed(2);
$scope.List_Cons = data ;
});

socket.on(P.SOCKET.CAU, function(data) {
// if( data.Type == 'TR' && data.Value && data.Value.toString().length >= 6 )
// data.Value  = Math.round(data.Value).toFixed(2);
console.log(data)
var i = $scope.List_Cons.findIndex(function(obj) { obj.Adr == data.Adr});
if (ci != -1 )  // -1 ==> unfound
{$scope.List_Cons[i] = data ;
}

});

$scope.Write= function (item)
{
  // console.log(item)
  if(item.V != item.LV)
  {

item.M = "Write";
socket.emit(P.SOCKET.CQ, item );
}};

$scope.Analog_Change = function(item)
{
  if(item.V != item.LV)
{// console.log(item);
item.M = "Write";
socket.emit(P.SOCKET.CQ, item );
}};

   }])

.controller('MyCtrl', ['$scope', '$cordovaNetwork', '$rootScope', function($scope, $cordovaNetwork, $rootScope) {
    document.addEventListener("deviceready", function () {

        $scope.network = $cordovaNetwork.getNetwork();
        $scope.isOnline = $cordovaNetwork.isOnline();
        $scope.$apply();

        // listen for Online event
        $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
            $scope.isOnline = true;
            $scope.network = $cordovaNetwork.getNetwork();

            $scope.$apply();
        })

        // listen for Offline event
        $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
            console.log("got offline");
            $scope.isOnline = false;
            $scope.network = $cordovaNetwork.getNetwork();

            $scope.$apply();
        })

  }, false);
}]);
