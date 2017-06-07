
controllers

.controller('AppCtrl', ['$rootScope', '$scope', '$ionicModal', '$stateParams', '$timeout', 'socket', '$state', 'P', 'ConnectivityMonitor', 'Notif', 'AuthService', function($rootScope, $scope, $ionicModal, $stateParams, $timeout, socket, $state, P, ConnectivityMonitor, Notif, AuthService) {
  var i = 1 ;
  if(typeof google == "undefined"){
   $rootScope.mapEnable = false;
 }else{
   $rootScope.mapEnable = true;
 }
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

  if(!$rootScope.Selected_NomGrp || !$rootScope.Selected_Grp)  $state.go('app.CTsyn'); //Redirect to CT


   $scope.Validate_Item = '' ;
   $scope.List_Cons = [] ;

   $ionicLoading.show({ //Spinner au chargement initial
   content: 'Loading', animation: 'fade-in', showBackdrop: true,
   duration: 1000, maxWidth: 200,  showDelay: 0
  });

   $scope.Refresh = function() //Exécuté lors du Pull-to-Refresh et Initiation du controlleur-vue (ng-init)
   { socket.emit(P.SOCKET.CQ , { Mode : "Read" , Selected_Grp : $rootScope.Selected_Grp , Selected_CT :$rootScope.Selected_CT });}

   socket.on(P.SOCKET.CA , function(data) {
    $scope.List_Cons = data; //Met à jour la liste
    $ionicLoading.hide() //enleve le spinner
    $scope.$broadcast('scroll.refreshComplete');//Stop the ion-refresher from spinning
  });

   $scope.Write= function (item)
   {
   // console.log(item)
   item.Mode = "Write";
   socket.emit(P.SOCKET.CQ, item );
   }

   $scope.Analog_Change = function(item)
   {
     if(item.V != item.LV)
   {// console.log(item);
   item.Mode  = "Write";
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

  $scope.Refresh = function() //Exécuté lors du Pull-to-Refresh et Initiation du controlleur-vue (ng-init)
  {  socket.emit(P.SOCKET.CTQ); }

  $rootScope.$on('$stateChangeStart',  function(event, toState, toParams, fromState, fromParams){
  if(toState.url == "/carto")
   $ionicSideMenuDelegate.canDragContent(false);
  if(fromState.url == "/carto")
   $ionicSideMenuDelegate.canDragContent(true);
 });

  $scope.loc = [48.861253, 2.329920]
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

  socket.on(P.SOCKET.CTA, function(data){
  $scope.List_CT = data ; //Met à jour la liste
  $ionicLoading.hide(); //enleve le spinner
  $scope.$broadcast('scroll.refreshComplete'); //Stop the ion-refresher from spinning
  });

  $scope.CT_pow = "100kW Gaz SED14";
  $scope.CT_alm = "Message d\'information caractérisant l\'alarme.Ca peut être long"
  $scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyB3QWWdY2M8JtbDSSrVriG9lIwD5anCRHo";

  }])

.controller('ALctrl', ['$ionicModal', '$rootScope', '$scope', 'socket', '$ionicLoading', 'P', '$state', '$stateParams', function($ionicModal, $rootScope,$scope,socket,$ionicLoading,P,$state, $stateParams) {

  //ouverture du modal filtres alarmes
  $scope.modalm_open = function(name,color)
  {  $scope.modalm.show(); $scope.Filter_Alm_local = $scope.Filter_Alm ;  };

  $scope.modalm_close = function ()
  {  $scope.modalm.hide(); $scope.Filter_Alm = $scope.Filter_Alm_local ;      }

  $ionicModal.fromTemplateUrl('templates/N0/modalm.html', function(modal) {
  $scope.modalm = modal;
  }, {
  scope: $scope,  /// GIVE THE MODAL ACCESS TO PARENT SCOPE
  animation: 'slide-in-up',//'slide-left-right', 'slide-in-up', 'slide-right-left'
  focusFirstInput: true
  });

$scope.btn_voir = function(CT)   // Action boutton Alarmes->Voir
{  if (CT) $rootScope.Selected_CT = CT ;
   $state.go('app.CTsta')  }

$scope.List_AL = []
$scope.Filter_Alm_local = {} ;
$scope.Synthese_PresentCount= 0 ;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////                   FILTRAGE                    //////////////////////////////////////////
if (!$scope.Filter_Alm) $scope.Filter_Alm = { ARI : 3 , AMA : 2, AMI : 1 , ADC : 10 , P : 2 , PA : 1 , D : 3 };
// ARI : Alarme critique, AMA : alarme majeure, AMI : Alarme Mineure, ADC : Alarme Défaut com ,
// P: Présente , PA : Présente Ack , D : Disparue
$scope.filtercriticite = function(obj) { return (obj.C == $scope.Filter_Alm.ARI)||(obj.C == $scope.Filter_Alm.AMA)||(obj.C == $scope.Filter_Alm.AMI)||(obj.C == $scope.Filter_Alm.ADC) };
$scope.filteretat = function(obj) { return (obj.P == $scope.Filter_Alm.P)||(obj.P == $scope.Filter_Alm.PA)||(obj.P == $scope.Filter_Alm.D) };
$scope.filterencours= function() { $scope.Filter_Alm = { ARI : 3 , AMA : 2, AMI : 1 , ADC : 10 , P : 2 , PA : 0 , D : 0 }}
$scope.filtertoutes = function() { $scope.Filter_Alm = { ARI : 3 , AMA : 2, AMI : 1 , ADC : 10 , P : 2 , PA : 1 , D : 3 }}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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


$scope.Refresh = function() //Exécuté lors du Pull-to-Refresh et Initiation du controlleur-vue (ng-init)
{socket.emit(P.SOCKET.ALQ , { Mode : 'Read' , Selected_CT : $rootScope.Selected_CT});}//Demande mise à jour listes Alarmes


// $scope.$watch(['Synthese_PresentCount'], function(newValue, oldValue) {
// console.log("OPC Present NBR :" + $scope.Synthese_PresentCount)
// $ionicLoading.show({
// content: 'Loading', animation: 'fade-in', showBackdrop: true,
// duration: 1000, maxWidth: 200,  showDelay: 0
// });
// });

    // var list_AL = [
    // { type: 'AL 49850',
    //   date : 'hh:mm:ss - dd/mm/yyy',
    //   etat : 'Présente',
    //   alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
    //     color: '#003DF5' // Bleue
    // },

//Reception des Alarmes unitaires depuis OPC
socket.on(P.SOCKET.ALA, function(data){
$scope.List_AL = data //Met à jour la liste
$ionicLoading.hide(); //enleve le spinner
$scope.$broadcast('scroll.refreshComplete');//Stop the ion-refresher from spinning

   });

    }])


.controller('CTActrl', ['$ionicLoading', '$rootScope', '$scope', 'socket', '$state', 'P', function($ionicLoading, $rootScope, $scope, socket, $state, P) {


$scope.Selected_CT = $rootScope.Selected_CT ; //CT selectionné
if(!$scope.Selected_CT)  $state.go('app.CT'); //Redirect to CT

$ionicLoading.show({
content: 'Loading', animation: 'fade-in', showBackdrop: true,
duration: 1000, maxWidth: 200,  showDelay: 0
});

$scope.Consigne_Grp = function (NomGrp,Grp)
    {
      $rootScope.Selected_NomGrp = NomGrp;
      $rootScope.Selected_Grp = Grp;
      $state.go('app.CTcon');
    };

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

$scope.Refresh = function() //Exécuté lors du Pull-to-Refresh et Initiation du controlleur-vue (ng-init)
{ socket.emit(P.SOCKET.CTAQ , { Selected_CT : $scope.Selected_CT} ); }

socket.on(P.SOCKET.CTAA ,function(data){
$scope.List_CTA = data ; //Met à jour la liste
$ionicLoading.hide(); //enleve le spinner
$scope.$broadcast('scroll.refreshComplete'); //Stop the ion-refresher from spinning
});


// $scope.labels =["1","2","3","4","5","6"];

// $scope.options = {
//           scales: {
//             yAxes: [
//               {
//                 id: 'y-axis-1',
//                 type: 'linear',
//                 display: true,
//                 position: 'left'
//               }        ]
//           }   };

      }])

.controller('StaCtrl', ['$ionicLoading', '$scope', '$rootScope', '$state', 'socket', 'P', function($ionicLoading, $scope, $rootScope,$state,socket, P) {

  if(!$rootScope.Selected_CT)  $state.go('app.CT'); //Redirect to CT

  $scope.List_Sta = [] ;
  $ionicLoading.show({
  content: 'Loading', animation: 'fade-in', showBackdrop: true,
  duration: 1000, maxWidth: 200,  showDelay: 0
  });

  $scope.Refresh = function() //Exécuté lors du Pull-to-Refresh et Initiation du controlleur-vue (ng-init)
  {  socket.emit(P.SOCKET.SQ , { Mode : "Read" , Selected_CT : $rootScope.Selected_CT });}

  socket.on(P.SOCKET.SA , function(data) {
  $scope.List_Sta = data //Met à jour la liste
  $ionicLoading.hide(); //enleve le spinner
  $scope.$broadcast('scroll.refreshComplete');//Stop the ion-refresher from spinning
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

$ionicLoading.show({
content: 'Loading', animation: 'fade-in', showBackdrop: true,
duration: 300, maxWidth: 200,  showDelay: 0
});
// socket.on(P.SOCKET.CU, function(data) {
// // if( data.Type == 'TR' && data.Value && data.Value.toString().length >= 6 )
// // data.Value  = Math.round(data.Value).toFixed(2);
// console.log(data)
// var i = $scope.List_Cons.findIndex(function(obj) { obj.M == data.M});
// console.log(i)
// // if (i != -1 )  // -1 ==> unfound
// // $scope.List_Cons[i] = data ;
// });

$scope.Refresh = function() //Exécuté lors du Pull-to-Refresh et Initiation du controlleur-vue (ng-init)
{   socket.emit(P.SOCKET.CQ, { Mode : "Read"}); }

socket.on(P.SOCKET.CA, function(data) {
// if( data.Type == 'TR' && data.Value && data.Value.toString().length >= 6 )
// data.Value  = Math.round(data.Value).toFixed(2);
$scope.List_Cons = data ;
$ionicLoading.hide(); //enleve le spinner
$scope.$broadcast('scroll.refreshComplete'); //Stop the ion-refresher from spinning

});

$scope.Write= function (item)
{
  // console.log(item)
  if(item.V != item.LV)
  {

item.Mode = "Write";
socket.emit(P.SOCKET.CQ, item );
}};

$scope.Analog_Change = function(item)
{
  if(item.V != item.LV)
{// console.log(item);
item.Mode = "Write";
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
