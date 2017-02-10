angular.module('starter.controllers', [ ])

.run(function($rootScope) {

      $rootScope.user = {
        clientid: '',
         username: '',
          password: '',
           auth: ''
       };
     })
.controller('AppCtrl', function( $scope, $ionicModal, $timeout, socket) {

$scope.auth = 0 ;
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

  $scope.N1 = function(name) {
          $scope.modalCtrl.show();
          $scope.modalCtrl.name= name;
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
    socket.emit('ListeCT');
    socket.on('ListeCT_rep', function(data){
    $scope.list_CT = data ;
  });
  })

  .controller('ALctrl', function($scope,socket) {

  /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */

    $scope.toggleGroup = function(group) {
        if ($scope.isGroupShown(group)) {
          $scope.shownGroup = null;
        } else {
          $scope.shownGroup = group;
        }
      };
      $scope.isGroupShown = function(group) {
        return $scope.shownGroup === group;
      };

      socket.emit('ListeAL');
      socket.on('ListeAL_rep', function(data){
      $scope.list_AL = data ;
    });
    })

.controller('PlaylistCtrl', function($scope, $stateParams) {
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
