// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'btford.socket-io','ngCordova','ngMap'])

.factory('socket', function (socketFactory) {
  var mySocket = socketFactory({
    prefix: '',
    // ioSocket: io.connect('80.14.220.219:3000')
   ioSocket: io.connect('localhost:3000')
  });
  //mySocket.forward('temp');
  return mySocket
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

  .state('app.carto', {
    url: '/carto',
      authentificate: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/N0/carto.html',
        controller: 'MapCtrl'
      }
    }
  })

  .state('app.alarmes', {
      url: '/alarmes',
      authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N0/alarmes.html',
            controller: 'ALctrl'
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
      authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N0/admin.html',
          controller: 'AppCtrl'
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
      url: '/syn/:CTname',
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
  $urlRouterProvider.otherwise('/app/fic');
});
