angular.module('starter.controllers', ['chart.js','angularUUID2','ngCordova'])

// .run(function($rootScope) {
//
//       $rootScope.user = {
//         clientid: '',
//          username: '',
//           password: '',
//            auth: ''
//        };
//     })

// .service('sql_request',function(uuid2,socket){
//   var hash = uuid2.newguid();
//
//   this.get_data = function (query)
//   {
//    var promise = new Promise(function(resolve, reject) {
//      socket.emit('Sql_Query',{hash : hash , query : query });
//      socket.on('Sql_Answer', function(data){
//        console.log(data)
//      resolve(data);
// });
// });
// return promise;
// };
// })
.controller('AdminCtrl', function($scope,socket,$ionicLoading) {
$scope.list_Cons = []
socket.emit('Cons_Query', { Mode : "Read"});
socket.on('Cons_Answer', function(data) {
// console.log(data)
if(data.Type == "TC")
{
if (data.Value) // true data
data.Etat = data.TOR_CodeEtat1;
else data.Etat = data.TOR_CodeEtat0;
}


ConsIndex = $scope.list_Cons.findIndex((obj => obj.Mnemo == data.Mnemo));
if (ConsIndex == -1 )  // -1
$scope.list_Cons.push(data);
else
$scope.list_Cons[ConsIndex] = data ;
});

$scope.Write= function (item)
{
// console.log(item)
item.Mode = "Write";
socket.emit('Cons_Query', item );
}

   })

.controller('AppCtrl', function($rootScope, $scope, $ionicModal, $timeout, socket, $state,App_Info) {
  $rootScope.Selected_CT = 'null';
  $scope.Unselect_CT = function(){
      $rootScope.Selected_CT = 'null';
    }

socket.on('connect', function () {
socket.emit('Client_Connected');
});
  $scope.list_N1 = [
  {name : 'Synthèse', url: 'app.CTsyn'},
  {name :  'Status', url: 'app.CTsta'},
  {name :  'Synoptique Primaire', url: 'app.CTsynP'},
  {name :  'Historique', url: 'app.CThis'},
  {name :  'Fiche identité', url: 'app.CTfic'},
  {name :  'Alarmes du CT', url: 'app.alarmes'},
  {name :  'Plans des équipements', url: 'app.CTpla'},
  {name :  'Documentation CT', url: 'app.CTdoc'},
  {name :  'Courbes', url: 'app.CTcou'}
  ]
 $scope.N1_name = '';
 $scope.auth = 0 ;
 $scope.sel = 0 ;

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

$ionicModal.fromTemplateUrl('templates/N1/modalN1.html', function(modal) {
          $scope.modalN1 = modal;
        }, {
          scope: $scope,  /// GIVE THE MODAL ACCESS TO PARENT SCOPE
          animation: 'slide-in-up',//'slide-left-right', 'slide-in-up', 'slide-right-left'
          focusFirstInput: true
        });

$scope.CT_N1 = function (name)
  {
    $rootScope.Selected_CT = name;
    $state.go('app.CTsyn');
  };

$scope.closeN1 = function(id) {
sel = id ;
menu_N1=!menu_N1;
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
$scope.closeLogin = function() {
    $scope.modalCnx.hide();
  };

// Open the login modal
$scope.login = function() {
    $scope.modalCnx.show();
  };

// Perform the login action when the user submits the login form
$scope.doLogin = function() {

 $scope.username = $scope.modalCnx.username;
 $scope.password = $scope.modalCnx.password ;

    // socket.emit('login',{
    // id : $scope.clientid,
    // user : $scope.username,
    // pass : $scope.password,
    // auth : $scope.auth
    // });

socket.on('login_rep',function(data){
 $scope.auth = data.auth;
 $scope.closeLogin();

    });

    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

$scope.unLog = function() {
$scope.auth= 0;
  };

})

.controller('CTfic', function($scope,socket) {
$scope.Live_Update = [];

socket.on('update',function(data){
$scope.Live_Update.push({ id : data.id , value : data.value });
// console.log(data.id + ">>>>" + data.value )
// console.log(Live_Update);
});
})


.controller('CTctrl', function($scope,socket,$ionicLoading,App_Info) {
  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    duration: 200,
    maxWidth: 200,
    showDelay: 0
  });

  $scope.list_CT = [] ;
  var list_CT_track = [];
  socket.emit('CT_Query');
  socket.on('CT_Answer', function(data){
  console.log(data)
  var AL_Color;
  // console.log(data)
  AL_Color = App_Info.AL_0_Color ; //applique la couleur CT de base
  if (data.AL_1)  AL_Color = App_Info.AL_1_Color ; //applique la couleur CT mineure
  if (data.AL_2)  AL_Color = App_Info.AL_2_Color ; //applique la couleur CT majeure
  if (data.AL_3)  AL_Color = App_Info.AL_3_Color ; //applique la couleur CT critique
  if (data.AL_10)  AL_Color = App_Info.AL_10_Color ; //applique la couleur CT critique
  $scope.list_CT.push({ CT : data.localisation , AL_Color : AL_Color, LAT : data.LAT , LONG : data.LONG , ADR : data.ADR }) ;
  // console.log($scope.list_CT)
  });

    // socket.emit('ListeCT');
    // socket.on('ListeCT_rep', function(data){
    //$scope.list_CT = data ;
   $scope.CT_pow = "100kW Gaz SED14";
   $scope.CT_alm = "Message d\'information caractérisant l\'alarme.Ca peut être long"

    //   { localisation: 'CT 49200',
    //       addr : '18,rue du Breil 75018 Paris',
    //       pow : '100kW Gaz SED14',
    //       alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être long',
    //       color: '#6633FF' //violet
    //     },
    //
    //   { localisation: 'CT 49100',
    //         addr : '18,rue du Breil 75018 Paris',
    //         pow : '100kW Gaz SED14',
    //         alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être long'  ,
    //         color: '#003DF5' // Bleue
    //       }
    //   ];

    $scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyB3QWWdY2M8JtbDSSrVriG9lIwD5anCRHo";


  })




.controller('ALctrl', function($rootScope,$scope,socket,$ionicLoading,App_Info,$state, $stateParams) {

$scope.Selected_CT = $rootScope.Selected_CT ;
var list_AL_Track = [];
$scope.list_AL = []
$scope.Synthese_PresentCount= 0
$scope.Filter_Alm ;

$scope.ACK = function(item)
{
  socket.emit('AL_Query', { Mode : 'Write' , Type : 'ACK', NodeId : item.NodeId });
  console.log({ Mode : 'Write' , Type : 'ACK', NodeId : item.NodeId })
}

$scope.expand_AL = function(Mnemo) {
        if ($scope.isItemExpanded(Mnemo)) {
          $scope.shownItem = null;
        } else {
          $scope.shownItem = Mnemo;
        }
      };

$scope.isItemExpanded = function(Mnemo) {
  console.log("shownitem : " + $scope.shownItem)
        return $scope.shownItem === Mnemo;
      };

socket.on('OPC_General_Update', function(data){

  if (data.id == 'Synthese.PresentCount')
  $scope.Synthese_PresentCount = data.value;
    console.log($scope.Synthese_PresentCount)
});


$scope.$watch(['Synthese_PresentCount'], function(newValue, oldValue) {

  //Demande mise à jour listes Alarmes
socket.emit('AL_Query', { Mode : 'Read' , Selected_CT : $rootScope.Selected_CT});
console.log("OPC Present NBR :" + $scope.Synthese_PresentCount)
// $ionicLoading.show({
// content: 'Loading', animation: 'fade-in', showBackdrop: true,
// duration: 700, maxWidth: 200,  showDelay: 0
// });
});
// $ionicLoading.show({
//      content: 'Loading', animation: 'fade-in', showBackdrop: false,
//      duration: 500, maxWidth: 200,  showDelay: 0
//    });
    // var list_AL = [
    // { type: 'AL 49850',
    //   date : 'hh:mm:ss - dd/mm/yyy',
    //   etat : 'Présente',
    //   alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
    //     color: '#003DF5' // Bleue
    // },

//Reception des Alarmes unitaires depuis OPC
socket.on('AL_Answer', function(data){
    console.log(data)
if (!data.Mode) // Existence propriété Mode
  { // Arrivé des infos d'une alarmes


  data.AL_Color = App_Info.AL_0_Color ; //applique la couleur CT de base
  if (data.Criticite == '1')  data.AL_Color = App_Info.AL_1_Color ; //applique la couleur CT mineure
  if (data.Criticite == '2')  data.AL_Color = App_Info.AL_2_Color ; //applique la couleur CT majeure
  if (data.Criticite == '3')  data.AL_Color = App_Info.AL_3_Color ; //applique la couleur CT critique
  if (data.Criticite == '10')  data.AL_Color = App_Info.AL_10_Color ; //applique la couleur CT critique
  if (data.Actif == true) data.Actif = "Présente"
  if (data.Actif == false) data.Actif = "Disparue"
  if (data.Ack == true) data.Ack = "Acquittée"
  if (data.Ack == false) data.Ack = "Non Acquitée"


//   if (list_AL_Track.length =='0')  // liste encore vide
//   {
//     list_AL_Track.push(data.Mnemo);
//     $scope.list_AL.push(data);
//  }
//  else
//  { //console.log('path(2)')
//    var idx = list_AL_Track.indexOf(data.Mnemo);
//   //  console.dir(data)
//   //  console.log(idx)
//   //  console.log(list_AL_Track)
//    if (idx != -1) { // si l'element existe, on peut connaitre sa position dans les deux tableaux
//     // console.log(idx) ; // Log position tableau
//     list_AL_Track.splice(idx,1,data.Mnemo);
//     $scope.list_AL.splice(idx,1,data);
//     }
//     else
// {  //console.log('path(3)')
//   list_AL_Track.push(data.Mnemo);
//   $scope.list_AL.push(data);
// }
//  }

almIndex = $scope.list_AL.findIndex((obj => obj.Mnemo == data.Mnemo));
if (almIndex == -1 )  // -1
$scope.list_AL.push(data);
else
$scope.list_AL[almIndex] = data ;

}

if (data.Mode && data.Mode =="Write")
{
// Mise à jour du status ACK après acquittement
almIndex = $scope.list_AL.findIndex((obj => obj.NodeId == data.NodeId));
$scope.list_AL[almIndex].Ack = "Acquitée"

//Console object again.
// console.log("After update: ", $scope.list_AL[almIndex])

}

   });


    // socket.emit('ListeAL');
  //
  //   socket.on('OPC_Update', function(data){
  //     $ionicLoading.hide();
  // //  $ionicLoading.hide();
  // var i = Object.keys($scope.list_AL).length ;
  //  data['id']= i ;
  // //  list_AL[i]= data ;
  //  $scope.list_AL[i] = data ;
  // //  console.log(list_AL);
  // //  console.log(data)
  //    });
    //  $scope.list_AL = list_AL;
    })

.controller('QrCtrl', function($scope, $rootScope, $cordovaBarcodeScanner, $ionicPlatform) {
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
       })

.controller('CTActrl', function($rootScope,$scope,socket) {
$scope.List_CTA = []
$scope.Selected_CT = $rootScope.Selected_CT ; //CT selectionné
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

socket.emit('CTA_Query', { Selected_CT : $scope.Selected_CT} );

socket.on('CTA_Answer',function(data){
console.log(data)

ctaIndex = $scope.list_CTA.findIndex((obj => obj.NodeId == data.NodeId));
$scope.list_AL[almIndex].Ack = "Acquitée"
$scope.List_CTA.push(data)  ;

// console.log($scope.CTA_list[0].Libelle_groupe)
});

//
// var List_CTA = [
// {
// type: 'Circuit CTA',
// date : 'Optimisé',
// etat : 'Présente'
// }
// ];


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
 // $scope.List_CTA = List_CTA;


      })


.controller('MyCtrl', function($scope, $cordovaNetwork, $rootScope) {
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
});
