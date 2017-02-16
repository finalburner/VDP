angular.module('starter.controllers', [ ])

.run(function($rootScope) {

      $rootScope.user = {
        clientid: '',
         username: '',
          password: '',
           auth: ''
       };
    })

.controller('AppCtrl', function( $scope, $ionicModal, $timeout, socket, $state) {
  $scope.list_N1 = [
  {name : 'Synthèse', url: 'app.CTsyn'},
  {name :  'Status', url: 'app.CTsta'},
  {name :  'Synoptique Primaire', url: 'app.CTsynP'},
  {name :  'Historique', url: 'app.CThis'},
  {name :  'Fiche identité', url: 'app.CTfic'},
  {name :  'Plans des équipements', url: 'app.CTpla'},
  {name :  'Documentation CT', url: 'app.CTdoc'},
  {name :  'Courbes', url: 'app.CTcou'}
  ]
 $scope.N1_name = '';
 $scope.auth = 0 ;
 $scope.sel = 0 ;

  socket.on('id', function(data){ $scope.clientid = data ; });
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html',function(modal){
          $scope.modalCnx = modal;
        }, {
          scope: $scope,  /// GIVE THE MODAL ACCESS TO PARENT SCOPE
          animation: 'slide-in-up',//'slide-left-right', 'slide-in-up', 'slide-right-left'
          focusFirstInput: true
        });

    $ionicModal.fromTemplateUrl('templates/modalN1.html', function(modal) {
          $scope.modalCtrl = modal;
        }, {
          scope: $scope,  /// GIVE THE MODAL ACCESS TO PARENT SCOPE
          animation: 'slide-in-up',//'slide-left-right', 'slide-in-up', 'slide-right-left'
          focusFirstInput: true
        });

   $scope.CT_N1 = function (name)
  {
    $scope.CT_ret = name ;
    $state.go('app.CTsyn');
  };

 $scope.closeN1 = function(id) {
sel = id ;
menu_N1=!menu_N1;
 };

  $scope.N1 = function(name) {
          $scope.modalCtrl.show();
          $scope.modalCtrl.name= name;
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

    socket.emit('login',{
    id : $scope.clientid,
    user : $scope.username,
    pass : $scope.password,
    auth : $scope.auth
    });

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

.controller('CTctrl', function($scope,socket) {


    // socket.emit('ListeCT');
    // socket.on('ListeCT_rep', function(data){
    //$scope.list_CT = data ;

    $scope.list_CT =  [
      { name: 'CT 49850',
          addr : '18,rue du Breil 75018 Paris',
          pow : '100kW Gaz SED14',
          alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être long',
          color: '#FF6633' //orange
        },
      { name: 'CT 49200',
          addr : '18,rue du Breil 75018 Paris',
          pow : '100kW Gaz SED14',
          alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être long',
          color: '#6633FF' //violet
        },

      { name: 'CT 49100',
            addr : '18,rue du Breil 75018 Paris',
            pow : '100kW Gaz SED14',
            alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être long'  ,
            color: '#003DF5' // Bleue
          },
        { name: 'CT 49850',
              addr : '18,rue du Breil 75018 Paris',
              pow : '100kW Gaz SED14',
              alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être long',
              color: '#CCFF33' // vert jaune
            },
         { name: 'CT 49650',
                addr : '18,rue du Breil 75018 Paris',
                pow : '100kW Gaz SED14',
                alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être long',
                color: '#66FF33' //vert
              }
      ];

  })

  .controller('ALctrl', function($scope,socket) {

  /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */

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

      var list_AL = [
  { type: 'AL 49850',
    date : 'hh:mm:ss - dd/mm/yyy',
    etat : 'Présente',
    alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
      color: '#003DF5' // Bleue
  },
  { type: 'AL 49850',
    date : 'hh:mm:ss - dd/mm/yyy',
    Etat : 'Présente',
    alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
      color: '#FF6633' //orange
  },
  { type: 'AL 49850',
    date : 'hh:mm:ss - dd/mm/yyy',
    Etat : 'Présente',
    alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
      color: '#003DF5' // Bleue
  },
  { type: 'AL 49850',
    date : 'hh:mm:ss - dd/mm/yyy',
    Etat : 'Présente',
    alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
    color: '#CCFF33' // vert jaune
  }
];
     $scope.list_AL = list_AL;
    })


.controller('CTActrl', function($scope,socket) {

  var list_CTA = [
{ type: 'Circuit CTA',
date : 'Optimisé',
etat : 'Présente',
alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
  color: '#003DF5', // Bleue
  tmp1 : '1111',
    tmp2 : '2222'

    },
{ type: 'Circuit CTA',
date : 'Optimisé',
Etat : 'Présente',
alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
  color: '#FF6633', //orange
  tmp1 : '1111',
    tmp2 : '2222'
},
{ type: 'Circuit CTA',
date : 'Optimisé',
Etat : 'Présente',
alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
color: '#FF6633', //orange
tmp1 : '1111',
  tmp2 : '2222'
},
{ type: 'Circuit CTA',
date : 'Optimisé',
Etat : 'Présente',
alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
color: '#FF6633', //orange
tmp1 : '1111',
  tmp2 : '2222'
},
{ type: 'Circuit CTA',
date : 'Optimisé',
Etat : 'Présente',
alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
color: '#FF6633', //orange
tmp1 : '1111',
  tmp2 : '2222'
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
  for (j=0;j<4;j++){
list_CTA[j].tmp1 = data[2*j].val;
list_CTA[j].tmp2 = data[2*j+1].val;
}
});

console.log('tmp1 : '+   list_CTA[0].tmp1 + ' - tmp2: ' +  list_CTA[0].tmp2 );

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
        $scope.hours =["06:00","07:00","08:00","09:00"];
        $scope.data = ["13","15","14","13"];

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
