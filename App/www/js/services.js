app

.factory('AuthService', ['socket', 'Session', 'P', function (socket, Session, P) {
  var authService = {};

  authService.login = function (Cnx) {
    var promise = new Promise(function(resolve, reject) {
    socket.emit(P.SOCKET.LQ, Cnx)
    socket.on(P.SOCKET.LA, function(data) {
    resolve(data.user);
    Session.create(data.id, data.user.id, data.user.role);
  });
});
  return promise;
}

  authService.isAuthenticated = function () {
    return !!Session.userId; //false si null
  };

  authService.isAuthorized = function (authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) { // array transformation
      authorizedRoles = [authorizedRoles];
    }
    //isAuthorized = isAuthenticated && authorizedRoles Exists
    return (authService.isAuthenticated() &&
      authorizedRoles.indexOf(Session.userRole) !== -1);
  };

  return authService;
}])

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

.factory('socket', ['socketFactory','P', function (socketFactory,P) {
  // console.log(window.cordova)
  if (window.cordova) { // Mobile APP
    var mySocket = socketFactory({
      prefix: '',
      ioSocket: io.connect(P.PARAM.SRV_WEB)
    //  ioSocket: io.connect('http://localhost:3000')
    });
  }
  else { // Desk APP
    var mySocket = socketFactory({
      prefix: '',
     ioSocket: io.connect(P.PARAM.SRV_LOCAL)
    });
  }
  //mySocket.forward('temp');
  return mySocket
}])

.factory('Notif', ['socket', '$cordovaToast', function (socket,$cordovaToast) { //Service de notification

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

}])

.factory('ConnectivityMonitor', ['$rootScope', '$cordovaNetwork', '$cordovaToast', function($rootScope, $cordovaNetwork,$cordovaToast){

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
}])
