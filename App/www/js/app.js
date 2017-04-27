// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
// angular.module('starter', ['ionic', 'starter.controllers', 'btford.socket-io','ngCordova','ngMap','ngMaterial'])
angular.module('starter', ['ionic', 'starter.controllers', 'btford.socket-io','ngAnimate','ngMap'])

.factory('socket', function (socketFactory) {
  var mySocket = socketFactory({
    prefix: '',
    // ioSocket: io.connect('http://80.14.220.219:3000')
   ioSocket: io.connect('localhost:3000')
  });
  //mySocket.forward('temp');
  return mySocket
})

.value('App_Info', {
ID : 'null',
AL_10_Color : '#D500F9', //AL DefCom
AL_3_Color : '#F44336', //AL Critique
AL_2_Color : '#FF8F00', //AL Majeure
AL_1_Color : '#2196F3', //AL Mineure
AL_0_Color : '#07F900' //Aucune Alarme Présente
})

// .service('App_Info_Ask' , function(socket, App_Info){
//   socket.emit('App_Info_Query');
//   console.log('App_Info_Query');
//
//   socket.on('App_Info_Answer',function(data){
//     App_Info.OPC_Socket_ID = data.OPC_Socket_ID ;
//   });
// })
// .run(function($ionicPlatform, $ionicPopup, $cordovaNetwork) {
//    $ionicPlatform.ready(function() {
//       if ($cordovaNetwork.isOffline()) {
//          $ionicPopup.confirm({
//             title: "Internet is not working",
//             content: "Internet is not working on your device."
//          });
//       }
//    });
// })

.config(function($provide) { // To comment
  $provide.decorator('$state', function($delegate) {
    var originalTransitionTo = $delegate.transitionTo;
    $delegate.transitionTo = function(to, toParams, options) {
      return originalTransitionTo(to, toParams, angular.extend({
        reload: true
      }, options));
    };
    return $delegate;
  });
})


.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
$stateProvider
    .state('app', {
    url: '/app',
    abstract: true,
    authentificate: true,
    templateUrl: 'templates/N0/menu.html',
    controller: 'AppCtrl'
  })


  .state('app.CT', {
    url: '/CT',
      authentificate: true,
      cache:false,
    views: {
      'menuContent': {
        templateUrl: 'templates/N0/CT.html',
        controller: 'CTctrl'
      }
    }
  })

    .state('app.CTi', {
      url: '/CTi',
        authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N0/CTi.html',
          controller: 'CTctrl'
        }
      }
    })

  .state('app.Login', {
      url: '/Login',
      views: {
        'menuContent': {
          templateUrl: 'templates/N0/CTi.html',
          controller: 'CTctrl'
        }
      }
    })
  .state('app.carto', {
    url: '/carto',
      authentificate: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/N0/carto.html',
        controller: 'CTctrl'
      }
    }
  })

  .state('app.alarmes', {
      cache : false,
      url: '/alarmes',
      authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N0/alarmes.html',
          controller: 'ALctrl'
        //   onEnter: function(){
        //   console.log('on Enter : ' + $rootScope.Selected_CT)
        //   socket.emit('AL_Query', { Selected_CT : $rootScope.Selected_CT});
        // }
        }
      }
    })
    .state('app.rapport', {
      url: '/rapport',
      authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N0/rapport.html',
          controller: 'QrCtrl'
        }
      }
    })
    .state('app.admin', {
      url: '/admin',
      cache:false,
      authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N0/admin.html',
          controller: 'AdminCtrl'
        }
      }
    })

    .state('app.biblio', {
      url: '/biblio',
      authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N0/biblio.html',
          controller: 'AppCtrl'
        }
      }
    })

    .state('app.CTsyn', {
      url: '/syn',
      cache:false,
   authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTsyn.html',
          controller: 'CTActrl'
        }
      }
    })
    .state('app.CTsta', {
      url: '/sta',
    authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTsta.html',
          controller: 'AppCtrl'
        }
      }
    })
    .state('app.CTcou', {
      url: '/cou',
    authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTcou.html',
          controller: 'CTctrl'
        }
      }
    })
    .state('app.CTdoc', {
      url: '/doc',
    authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTdoc.html',
          controller: 'CTctrl'
        }
      }
    })
    .state('app.CThis', {
      url: '/his',
    authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CThis.html',
          controller: 'CTctrl'
        }
      }
    })
    .state('app.CTfic', {
      url: '/fic',
    authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTfic.html',
          controller: 'CTfic'
        }
      }
    })
    .state('app.CTpla', {
      url: '/pla',
    authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTpla.html',
          controller: 'CTctrl'
        }
      }
    })
    .state('app.CTsynP', {
      url: '/synP',
    authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTsynP.html',
          controller: 'CTctrl'
        }
      }
    })




    ;
  // .state('app.single', {
  //   url: '/playlists/:playlistId',
  //   views: {
  //     'menuContent': {
  //       templateUrl: 'templates/playlist.html',
  //       controller: 'PlaylistCtrl'
  //     }
  //   }
  // });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/CT');
})

//
