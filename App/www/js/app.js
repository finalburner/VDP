// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
// angular.module('starter', ['ionic', 'starter.controllers', 'btford.socket-io','ngCordova','ngMap','ngMaterial'])
var app = angular.module('starter', ['ionic', 'starter.controllers', 'btford.socket-io','ngAnimate','ngMap']) ;
var controllers = angular.module('starter.controllers', ['angularUUID2','ngCordova','chart.js']);

app
.config(function($stateProvider, $urlRouterProvider,P,$ionicConfigProvider) {
$ionicConfigProvider.backButton.previousTitleText(false);
$ionicConfigProvider.backButton.icon('ion-chevron-left');
$ionicConfigProvider.backButton.text('')
$stateProvider
    .state('app', {
    url: '/app',
    abstract: true,
    authentificate: true,
    templateUrl: 'templates/N0/menu.html',
    controller: 'AppCtrl'
  })

    .state('login', {
      url: '/login',
        authentificate: true,
        cache: false,
      templateUrl: 'templates/N0/login.html',
      controller: 'AppCtrl',
      data: {
      authorizedRoles: []
    }

    })

  .state('app.CT', {
    url: '/CT',
    authentificate: true,
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/N0/CT.html',
        controller: 'CTctrl'
      }},
      data: {
      authorizedRoles: [P.USER_ROLES.admin]
    }
  })

    .state('app.CTi', {
      url: '/CTi',
      cache: false,
        authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N0/CTi.html',
          controller: 'CTctrl'
        }
      },
      data: {
      authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
    }
    })

  .state('app.Login', {
      url: '/Login',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/N0/CTi.html',
          controller: 'CTctrl'
        }
      },
      data: {
      authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
    }
    })
  .state('app.carto', {
    url: '/carto',
    cache: false,
      authentificate: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/N0/carto.html',
        controller: 'MapCtrl'
      }
    },
    data: {
    authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
  }
  })

  .state('app.alarmes', {
      cache: false,
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
      },
      data: {
      authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
    }
    })
    .state('app.rapport', {
      url: '/rapport',
      cache: false,
      authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N0/rapport.html',
          controller: 'QrCtrl'
        }
      },
      data: {
      authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
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
      },
      data: {
      authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
    }
    })

    .state('app.biblio', {
      url: '/biblio',
      cache: false,
      authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N0/biblio.html',
          controller: 'AppCtrl'
        }
      },
      data: {
      authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
    }
    })

    .state('app.CTsyn', {
      url: '/syn',
      cache: false,
   authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTsyn.html',
          controller: 'CTActrl'
        }
      },
      data: {
      authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
    }
    })
    .state('app.CTsta', {
      url: '/sta',
      cache:false,
    authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTsta.html',
          controller: 'StaCtrl'
        }
      },
      data: {
      authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
    }
    })
    .state('app.CTcou', {
      url: '/cou',
    authentificate: true,cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTcou.html',
          controller: 'CTctrl'
        }
      },
      data: {
      authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
    }
    })
    .state('app.CTdoc', {
      url: '/doc',
    authentificate: true, cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTdoc.html',
          controller: 'CTctrl'
        }
      },
      data: {
      authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
    }
    })
    .state('app.CThis', {
      url: '/his',
    authentificate: true,cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CThis.html',
          controller: 'CTctrl'
        }
      },
      data: {
      authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
    }
    })
    .state('app.CTfic', {
      url: '/fic',
    authentificate: true,cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTfic.html',
          controller: 'CTfic'
        }
      },
      data: {
      authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
    }
    })
    .state('app.CTcon', {
      url: '/CTcon',
    authentificate: true,cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTcon.html',
          controller: 'ConCtrl'
        }
      },
      data: {
      authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
    }
    })
    .state('app.CTpla', {
      url: '/pla',
    authentificate: true,cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTpla.html',
          controller: 'CTctrl'
        }
      },
      data: {
      authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
    }
    })
    .state('app.CTsynP', {
      url: '/synP',
    authentificate: true,cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTsynP.html',
          controller: 'CTctrl'
        }
      },
      data: {
      authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
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
  $urlRouterProvider.otherwise('/login');
})
