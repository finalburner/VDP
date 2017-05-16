app


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
