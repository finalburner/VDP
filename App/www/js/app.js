// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'btford.socket-io','myApp'])

.factory('socket', function (socketFactory) {
  var mySocket = socketFactory({
    prefix: '',
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
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.synop', {
    url: '/synop',
      authentificate: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/synop.html',
        controller: 'MyCtrl'
      }
    }
  })
  .state('app.synop.carto', {
    url: '/carto',
      authentificate: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/synop/carto.html',
        controller: 'MyCtrl'
      }
    }
  })
  .state('app.synop.CT', {
    url: '/CT',
      authentificate: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/synop/CT.html',
        controller: 'MyCtrl'
      }
    }
  })

  .state('app.alarmes', {
      url: '/alarmes',
      authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/alarmes.html',
            controller: 'MyCtrl'
        }
      }
    })
    .state('app.rapport', {
      url: '/rapport',
      authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/rapport.html',
          controller: 'MyCtrl'
        }
      }
    })
    .state('app.admin', {
      url: '/admin',
      authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/admin.html',
          controller: 'MyCtrl'
        }
      }
    })

    .state('app.biblio', {
      url: '/biblio',
      authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/biblio.html',
          controller: 'MyCtrl'
        }
      }
    });
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
  $urlRouterProvider.otherwise('/app/synop');
});
