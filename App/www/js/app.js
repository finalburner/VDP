// Ionic Starter App
function handleOpenURL(url) {

    var body = document.getElementsByTagName("body")[0];
    var mainController = angular.element(body).scope();
    mainController.reportAppLaunched(url);

}
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
// angular.module('starter', ['ionic', 'starter.controllers', 'btford.socket-io','ngCordova','ngMap','ngMaterial'])
var app = angular.module('starter', ['vs-repeat','ionic','ionic-modal-select', 'starter.controllers', 'btford.socket-io','ngAnimate','ngMap','angularViewportWatch', "ion-datetime-picker",'ngStorage']) ;
var controllers = angular.module('starter.controllers', ['ngCordova','chart.js','nvd3']);

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
      controller: 'LoginCtrl',
      data: {
      authorizedRoles: []
    }

    })

  .state('app.CT', {
    url: '/CT/{CT}',
    authentificate: true,
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/N0/CT.html',
        controller: 'CTctrl'
      }},
      data: {
      authorizedRoles: []
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


  .state('app.carto', {
    url: '/carto',
    cache: false,
    authentificate: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/N0/carto.html',
        controller: 'CTctrl'
      }
    },
    data: {
    authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
  }
  })

  .state('app.PH', {
    url: '/PH',
    cache: false,
    authentificate: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/N1/PH.html',
        controller: 'PHCtrl'
      }
    },
    data: {
    authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
  }
  })

  .state('app.PHtr', {
    url: '/PHtr',
    cache: false,
    authentificate: true,
    views: {
      'menuContent': {
        templateUrl: 'templates/N1/PHtr.html',
        controller: 'PHCtrl'
      }
    },
    data: {
    authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
  }
  })

  .state('app.alarmes', {
      url: '/alarmes',
      cache: false,
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
    // .state('app.rapport', {
    //   url: '/rapport',
    //   // cache: false,
    //   authentificate: true,
    //   views: {
    //     'menuContent': {
    //       templateUrl: 'templates/N0/rapport.html',
    //       controller: 'QrCtrl'
    //     }
    //   },
    //   data: {
    //   authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
    // }
    // })
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

    // .state('app.biblio', {
    //   url: '/biblio',
    //   // cache: false,
    //   authentificate: true,
    //   views: {
    //     'menuContent': {
    //       templateUrl: 'templates/N0/biblio.html',
    //       controller: 'AppCtrl'
    //     }
    //   },
    //   data: {
    //   authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
    // }
    // })

    .state('app.CTsyn', {
      url: '/syn',
      cache: false,
      authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTsyn.html',
          controller: 'GFctrl'
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
    .state('app.CTbat', {
      url: '/bat',
      cache:false,
      authentificate: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTbat.html',
          controller: 'StaCtrl'
        }
      },
      data: {
      authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
    }
    })
    .state('app.CTcou', {
      url: '/cou',
      authentificate: true,
      cache: false,
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
    .state('app.CTalm', {
      url: '/CTalm',
      authentificate: true,
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTalm.html',
          controller: 'ALctrl'
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
    authentificate: true,
    cache: false,
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
      authentificate: true,
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTfic.html',
          controller: 'FicCtrl'
        }
      },
      data: {
      authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
    }
    })
    .state('app.CTfic2', {
      url: '/ficCT',
      authentificate: true,
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/N1/CTfic2.html',
          controller: 'FicCtrl'
        }
      },
      data: {
      authorizedRoles: [P.USER_ROLES.admin, P.USER_ROLES.editor]
    }
    })
    .state('app.CTcon', {
      url: '/CTcon',
    authentificate: true,
    cache: false,
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
    authentificate: true,
    cache: false,
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
