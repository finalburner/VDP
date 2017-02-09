angular.module('starter.controllers', [ ])

.run(function($rootScope) {

      $rootScope.user = {
        'clientid': '',
         'username': '',
          'password': ''
       };
     })

.controller('AppCtrl', function( $scope, $ionicModal, $timeout, socket) {

  socket.on('id', function(data){ $scope.clientid = data ; });
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {

 $scope.username = $scope.loginData.username;
 $scope.password = $scope.loginData.password ;

    socket.emit('login',{
    id : $scope.clientid,
    user : $scope.username,
    pass : $scope.password
    });

    $timeout(function() {
      $scope.closeLogin();
    }, 100);
  };
})


.controller('CTctrl', function($scope) {
  $scope.list_CT = [
  { name: 'CT 49850',
      addr : '18,rue du Breil 75018 Paris',
      pow : '100kW Gaz SED14',
      alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être long'
    },
  { name: 'CT 49200',
      addr : '18,rue du Breil 75018 Paris',
      pow : '100kW Gaz SED14',
      alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être long'
    },

  { name: 'CT 49100',
        addr : '18,rue du Breil 75018 Paris',
        pow : '100kW Gaz SED14',
        alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être long'
      },
    { name: 'CT 49850',
          addr : '18,rue du Breil 75018 Paris',
          pow : '100kW Gaz SED14',
          alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être long'
        },
     { name: 'CT 49650',
            addr : '18,rue du Breil 75018 Paris',
            pow : '100kW Gaz SED14',
            alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être long'
          }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
