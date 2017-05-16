app

.factory('AuthService', function (socket, Session) {
  var authService = {};

  authService.login = function (Cnx) {
    var promise = new Promise(function(resolve, reject) {
    socket.emit('Login_Query', Cnx)
    socket.on('Login_Answer', function(data) {
    console.log(data)
    resolve(data.user);
    Session.create(data.id, data.user.id, data.user.role);
  });
});
  return promise;
}

  authService.isAuthenticated = function () {
    return !!Session.userId;
  };

  authService.isAuthorized = function (authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (authService.isAuthenticated() &&
      authorizedRoles.indexOf(Session.userRole) !== -1);
  };

  return authService;
})

.service('Session', function () {
  this.create = function (sessionId, userId, userRole) {
    this.id = sessionId;
    this.userId = userId;
    this.userRole = userRole;
  };
  this.destroy = function () {
    this.id = null;
    this.userId = null;
    this.userRole = null;
  };
})

.factory('socket', function (socketFactory) {
  console.log(window.cordova)
  if (window.cordova) { // Mobile APP
    var mySocket = socketFactory({
      prefix: '',
      ioSocket: io.connect('http://80.14.220.219:3000')
    //  ioSocket: io.connect('http://localhost:3000')
    });
  }
  else { // Desk APP
    var mySocket = socketFactory({
      prefix: '',
     ioSocket: io.connect('http://localhost:3000')
    });
  }
  //mySocket.forward('temp');
  return mySocket
})

.factory('Notif', function (socket,$cordovaToast) { //Service de notification

socket.on('Notif', function(data) {
  // console.log(data)
  if (window.cordova)  $cordovaToast.show(data.Msg, "short", "bottom");
  else console.log(data.Msg)
});
this.Show = function(Msg) {
    if (window.cordova)  $cordovaToast.show(Msg, "short", "bottom");
    else console.log(data.Msg)
		}
return 0 ;

})

.factory('ConnectivityMonitor', function($rootScope, $cordovaNetwork,$cordovaToast){

  return {
    isOnline: function(){
      if(ionic.Platform.isWebView()){
        return $cordovaNetwork.isOnline();
      } else {
        return navigator.onLine;
      }
    },
    isOffline: function(){
      if(ionic.Platform.isWebView()){
        return !$cordovaNetwork.isOnline();
      } else {
        return !navigator.onLine;
      }
    },
    startWatching: function(){
      if(ionic.Platform.isWebView()){
          $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
          $cordovaToast.show("Connecté", "short", "bottom")
          });
          $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
          $cordovaToast.show("Déconnecté", "short", "bottom")
          });
        }
        else {
          window.addEventListener("online", function(e) {
              $cordovaToast.show("Connecté", "short", "bottom")
          }, false);

          window.addEventListener("offline", function(e) {
              $cordovaToast.show("Déconnecté", "short", "bottom")
          }, false);
        }
    }
  }
})
