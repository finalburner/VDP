angular.module('starter.controllers', ['chart.js','angularUUID2'])

// .run(function($rootScope) {
//
//       $rootScope.user = {
//         clientid: '',
//          username: '',
//           password: '',
//            auth: ''
//        };
//     })

.service('sql_request',function(uuid2,$q,socket){
  var hash = uuid2.newguid();
  var data = undefined;
  this.get_data = function (query)
  {  var promise = new Promise(function(resolve, reject) {
     socket.emit('sql_query',{hash : hash , query : query, socketid: socket.sessionid});
     socket.on('sql_answer', function(data){
     resolve(data);
});
});
return promise;
};
})

.controller('AppCtrl', function( $rootScope, $scope, $ionicModal, $timeout, socket, $state,$ionicPopup,App_Info) {


  $scope.list_N1 = [
  {name : 'Synthèse', url: 'app.CTsyn'},
  {name :  'Status', url: 'app.CTsta'},
  {name :  'Synoptique Primaire', url: 'app.CTsynP'},
  {name :  'Historique', url: 'app.CThis'},
  {name :  'Alarmes du CT', url: 'app.alarmes'},
  {name :  'Fiche identité', url: 'app.CTfic'},
  {name :  'Plans des équipements', url: 'app.CTpla'},
  {name :  'Documentation CT', url: 'app.CTdoc'},
  {name :  'Courbes', url: 'app.CTcou'}
  ]
 $scope.N1_name = '';
 $scope.auth = 0 ;
 $scope.sel = 0 ;

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
          $scope.modalCtrl = modal;
        }, {
          scope: $scope,  /// GIVE THE MODAL ACCESS TO PARENT SCOPE
          animation: 'slide-in-up',//'slide-left-right', 'slide-in-up', 'slide-right-left'
          focusFirstInput: true
        });
//Acces à la synthèse
$scope.CT_N1 = function (name)
  {
    $state.go('app.CTsyn' , {CTname : name });
  };
$scope.closeN1 = function(id) {
sel = id ;
menu_N1=!menu_N1;
   };

//Acces Modal Niveau1
$scope.N1 = function(name) {
          $rootScope.CT_selected = name;
          $scope.modalCtrl.show();
          $scope.modalCtrl.animation =  "slide-left-right";
};

$scope.N1_close = function(name) {
$scope.modalCtrl.hide();
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


.controller('CTctrl', function($rootScope,$scope,socket,$ionicLoading,sql_request) {

  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    duration: 1000,
    maxWidth: 200,
    showDelay: 0
  });
    // socket.emit('ListeCT');
    // socket.on('ListeCT_rep', function(data){
    //$scope.list_CT = data ;
    // $scope.list_CT =  [
    //   { localisation: 'CT 49850',
    //       addr : '18,rue du Breil 75018 Paris',
    //       pow : '100kW Gaz SED14',
    //       alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être long',
    //       color: '#FF6633' //orange
    //     },
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
     sql_request.get_data('Select distinct localisation from VDP.dbo.SUPERVISION')
     .then( function(data){
       $scope.list_CT= data.reply ;
       $ionicLoading.hide();
      //  console.dir(data.reply);
     });




  })
  .controller('MapCtrl', function($scope,NgMap) {
    $scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyB3QWWdY2M8JtbDSSrVriG9lIwD5anCRHo";


  })

  .controller('AdminCtrl', function($scope,socket,$ionicLoading) {
     $ionicLoading.show({
       content: 'Loading',
       animation: 'fade-in',
       showBackdrop: true,
       duration: 1000,
       maxWidth: 200,
       showDelay: 0
     });
    $scope.list = [];
    socket.on('OPC_Update', function(data){
      $ionicLoading.hide();
      data.date = new Date().toLocaleString();
      console.log($scope.list)
      $scope.list.splice(0, 0, data);
          });

   })

.controller('ALctrl', function($rootScope, $scope,socket,$ionicLoading) {
     $ionicLoading.show({
       content: 'Loading',
       animation: 'fade-in',
       showBackdrop: true,
       duration: 1000,
       maxWidth: 200,
       showDelay: 0
     });
     if($rootScope.CT_selected == undefined) // Alarmes de tous les CTS
     {
       socket.emit('AL_Query','Data');
       socket.on('AL_reply', function(data){
        //  $scope.list_AL= data.reply ;
         $ionicLoading.hide();
        console.dir(data);
       });
     }
     else
     {
        console.log('path2')
     var request = {
       Socket_id : $rootScope.Socket_id,
       Query : $rootScope.CT_selected
     }

     socket.emit('AL_CT_Query',request);
     socket.on('AL_CT_Answer', function(data){
      //  $scope.list_AL= data.reply ;
       $ionicLoading.hide();
      console.dir(data);
     })
    }

    })
   /*
    * if given group is the selected group, deselect it
    * else, select the given group
    */
    // var list_AL = [
    // { type: 'AL 49850',
    //   date : 'hh:mm:ss - dd/mm/yyy',
    //   etat : 'Présente',
    //   alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
    //     color: '#003DF5' // Bleue
    // },
    // { type: 'AL 49850',
    //   date : 'hh:mm:ss - dd/mm/yyy',
    //   Etat : 'Présente',
    //   alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
    //     color: '#FF6633' //orange
    // }];
    // $scope.list_AL = list_AL;


    // $scope.expand_AL = function(item) {
    //     if ($scope.isItemExpanded(item)) {
    //       $scope.shownItem = null;
    //     } else {
    //       $scope.shownItem = item;
    //     }
    //   };
    //   $scope.isItemExpanded = function(item) {
    //     return $scope.shownItem === item;
    //   };

    // socket.emit('ListeAL');
  //   socket.on('connect ', function(socket){
  //
  //  console.log("Connected : " + socket.id );
  //    });
  //
  //   socket.on('OPC_Update', function(data){
  // $ionicLoading.hide();
  // //  $ionicLoading.hide();
  // var i = Object.keys($scope.list_AL).length ;
  //  data['id']= i ;
  // //  list_AL[i]= data ;
  //  $scope.list_AL[i] = data ;
  // //  console.log(list_AL);
  // //  console.log(data)
  //    });
  //   //  $scope.list_AL = list_AL;


.controller('QrCtrl', function($scope, $rootScope, $cordovaBarcodeScanner, $ionicPlatform) {
           var vm = this;

           vm.scan = function(){
               $ionicPlatform.ready(function() {
                   $cordovaBarcodeScanner
                       .scan()
                       .then(function(result) {
                           // Success! Barcode data is here
                           vm.scanResults = "We got a barcode\n" +
                           "Result: " + result.text + "\n" +
                           "Format: " + result.format + "\n" +
                           "Cancelled: " + result.cancelled;
                       }, function(error) {
                           // An error occurred
                           vm.scanResults = 'Error: ' + error;
                       });
               });
           };

           vm.scanResults = '';
       })

.controller('CTActrl', function($scope,socket,$stateParams) {

$scope.CTname = $stateParams.CTname;

  var list_CTA = [
{
type: 'Circuit CTA',
date : 'Optimisé',
etat : 'Présente',
alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
  color: '#003DF5', // Bleue
  tmp1 : '1111',
    tmp2 : '2222',
  chart : ['1','2','3','4','5','6']
    },
{ type: 'Circuit CTA',
date : 'Optimisé',
Etat : 'Présente',
alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
  color: '#FF6633', //orange
  tmp1 : '1111',
    tmp2 : '2222',
    chart : ['1','2','3','4','5','6']
},
{ type: 'Circuit CTA',
date : 'Optimisé',
Etat : 'Présente',
alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
color: '#FF6633', //orange
tmp1 : '1111',
  tmp2 : '2222',
    chart : ['1','2','3','4','5','6']
},
{ type: 'Circuit CTA',
date : 'Optimisé',
Etat : 'Présente',
alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
color: '#FF6633', //orange
tmp1 : '1111',
  tmp2 : '2222',
    chart : ['1','2','3','4','5','6']
},
{ type: 'Circuit CTA',
date : 'Optimisé',
Etat : 'Présente',
alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
color: '#FF6633', //orange
tmp1 : '1111',
  tmp2 : '2222',
    chart : ['1','2','3','4','5','6']
},
{ type: 'Circuit CTA',
date : 'Optimisé',
etat : 'Présente',
alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
  color: '#003DF5', // Bleue
  tmp1 : '1111',
    tmp2 : '2222',
  chart : ['1','2','3','4','5','6']
    },
{ type: 'Circuit CTA',
date : 'Optimisé',
Etat : 'Présente',
alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
  color: '#FF6633', //orange
  tmp1 : '1111',
    tmp2 : '2222',
    chart : ['1','2','3','4','5','6']
},
{ type: 'Circuit CTA',
date : 'Optimisé',
Etat : 'Présente',
alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
color: '#FF6633', //orange
tmp1 : '1111',
  tmp2 : '2222',
    chart : ['1','2','3','4','5','6']
},
{ type: 'Circuit CTA',
date : 'Optimisé',
Etat : 'Présente',
alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
color: '#FF6633', //orange
tmp1 : '1111',
  tmp2 : '2222',
    chart : ['1','2','3','4','5','6']
},
{ type: 'Circuit CTA',
date : 'Optimisé',
Etat : 'Présente',
alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
color: '#FF6633', //orange
tmp1 : '1111',
  tmp2 : '2222',
    chart : ['1','2','3','4','5','6']
},
{ type: 'Circuit CTA',
date : 'Optimisé',
etat : 'Présente',
alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
  color: '#003DF5', // Bleue
  tmp1 : '1111',
    tmp2 : '2222',
  chart : ['1','2','3','4','5','6']
    },
{ type: 'Circuit CTA',
date : 'Optimisé',
Etat : 'Présente',
alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
  color: '#FF6633', //orange
  tmp1 : '1111',
    tmp2 : '2222',
    chart : ['1','2','3','4','5','6']
}
];

  var ids = [
  "TMP1",
  "TMP2",
  "TMP3"
  ];
// var tmp = [0,1,2,3];
    /*
     * if given group is the selected group, deselect it
     * else, select the given group
     */

// for (j=0;j<4;j++)
// {
//   vartmp1 = 'TMP'+ (2*j+1);
//     vartmp2 = 'TMP'+(2*j+2);
//     console.log(vartmp1 + '+' + vartmp2);
// socket.on( vartmp1, function(data){
//         list_CTA[j].tmp1 =  data.toPrecision(4);
//         console.log(vartmp1 + ':' + data);
//
//       // $scope.tmp1 =  tmp[1] ;
//  });
//
//  socket.on(vartmp2 , function(data){
//       list_CTA[j].tmp2 =  data.toPrecision(4);
//       console.log(vartmp1 + ':'+ data);
//
//   // $scope.tmp2 =   tmp[2]   ;
// });
// }
socket.on('majtmp', function(data)
{
  for (j=0;j<12;j++){
list_CTA[j].tmp1 = data[2*j].val;
// list_CTA[j].chart.push(data[2*j+1].val);
list_CTA[j].tmp2 = data[2*j+1].val;

}
});



//console.log('tmp1 : '+   list_CTA[0].tmp1 + ' - tmp2: ' +  list_CTA[0].tmp2 );

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

        // socket.emit('ListeAL');
        // socket.on('ListeAL_rep', function(data){
        // $scope.list_AL = data ;
        $scope.labels =["1","2","3","4","5","6"];


        setInterval(function(){

          for ( i=0;i<12;i++)
          {

        list_CTA[i].chart.push(list_CTA[i].tmp2);
        list_CTA[i].chart.shift();

          }


        }, 3000);

        $scope.options = {
            scales: {
              yAxes: [
                {
                  id: 'y-axis-1',
                  type: 'linear',
                  display: true,
                  position: 'left'
                }
              ]
            }
          };
       $scope.list_CTA = list_CTA;


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
