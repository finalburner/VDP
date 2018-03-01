app

.service('Notif', ['socket', '$cordovaToast','$ionicLoading', function (socket,$cordovaToast,$ionicLoading) { //Service de notification
  socket.on('Notif', function(data) {
      $ionicLoading.hide() //enleve le spinner
      if (window.cordova)  $cordovaToast.show(data.Msg, "short", "bottom");
      else console.log(data.Msg)
  });

   this.Show = function(Msg) {
      if (window.cordova)  $cordovaToast.show(Msg, "short", "bottom");
      else console.log(Msg)
  	}

}])

.factory('AuthService', ['$ionicLoading','$localStorage','$rootScope','$http', 'Session', 'P' , 'Notif', function ($ionicLoading, $localStorage, $rootScope, $http, Session, P , Notif) {
  var authService = {};
  var SRV ;

  authService.login = function (Cnx) {
  var promise = new Promise(function(resolve, reject) {

     SRV = $localStorage.Srv_url

     $http.post(SRV + '/login' , Cnx )
     .then(function(data) {
            $ionicLoading.hide();
            resolve(data.data);
            //store local session user
    },function(error) {
      console.log(error);
      $ionicLoading.hide();
      Notif.Show(error.data.message);
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
  this.create = function (token, name, username, userRights, AST) {
    this.token = token;
    this.name = name;
    this.username = username;
    this.userRights = userRights;
    this.AST = AST;
  };
  this.destroy = function () {
    this.token = null;
    this.name = null;
    this.username = null;
    this.userRights = null;
    this.AST = null;
  };
})

.factory('socket', ['socketFactory','P','$localStorage', function (socketFactory,P,$localStorage) {
  // console.log(window.cordova)
   if(window.cordova)
   {  var URL = $localStorage.Srv_url || P.PARAM.SRV[0].url
      var mySocket = socketFactory({
      prefix: '',
      ioSocket: io.connect(URL, {secure: true , rejectUnauthorized: true, transports: ['websocket'] })
      });
  }
  else
  {  var URL = $localStorage.Srv_url || P.PARAM.SRV_LOCAL[0].url
     var mySocket = socketFactory({
     prefix: '',
     ioSocket: io.connect(URL, {secure: true , rejectUnauthorized: false })
     });
  }

  return mySocket

}])


.service('ConnectivityMonitor', ['P','socket','$rootScope', '$cordovaNetwork', '$cordovaToast','$ionicLoading', function(P,socket,$rootScope, $cordovaNetwork,$cordovaToast,$ionicLoading)
{

    // console.log($cordovaNetwork)
    ionic.Platform.ready(function() {
      if (window.device)
      {
      $rootScope.Connected = $cordovaNetwork.isOnline()
      $rootScope.network = $cordovaNetwork.getNetwork()
    }
    })
      // listen for Online event
      $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
          $ionicLoading.hide()
          $rootScope.Connected = true;
          socket.emit(P.SOCKET.SRVQ);
          $rootScope.network = $cordovaNetwork.getNetwork();
          $cordovaToast.show("Connecté", "short", "bottom")
          $rootScope.$apply();
      })

      // listen for Offline event
      $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){

          $ionicLoading.show({
              template: 'Attente de connexion internet'
           });

          $rootScope.Connected = false;
          if ($rootScope.STATUS)
          {
            $rootScope.STATUS.SQL.CODE = ""
            $rootScope.STATUS.OPC.CODE = ""
          }
          $rootScope.network = $cordovaNetwork.getNetwork();
          $cordovaToast.show("Déconnecté", "short", "bottom")
          $rootScope.$apply();
      })


}])
// .service("ApkAutoUpdater", function($q,$ionicPlatform){
//   setTimeout(function() {
//
//    // $ionicPlatform.ready(function() {
//     var self = this;
//
//     var plugin;
//
//     if(typeof cordova != "undefined" &&
//         typeof cordova.plugins.ApkAutoUpdater !== "undefined"){
//         var plugin = cordova.plugins.ApkAutoUpdater;
//         console.info("-- ApkAutoUpdater loaded");
//     }
//     // })
//     /**
//      *  Install an apk from the passed url
//      * @param String strUrl Url to download the apk from http://exmple.de/test.apk
//      */
//     this.updateFromUrl = function(strUrl) {
//         var defer = $q.defer();
//
//         if(strUrl){
//             plugin.updateFromUrl(strUrl, defer.resolve,  defer.reject);
//         }
//         return defer.promise;
//     };
//
//
//     return this;
//
//   }, 2000);
//
// });
