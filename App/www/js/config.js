app

 // $rootScope.$on('$stateChangeStart', function (event, next) {
 //    console.log(event)
 //    console.log(next)
 //    var authorizedRoles = next.data.authorizedRoles;
 //
 //    if (!AuthService.isAuthorized(authorizedRoles)) {
 //      event.preventDefault();
 //      if (AuthService.isAuthenticated()) {
 //        // user is not allowed
 //        $rootScope.$broadcast(P.AUTH_EVENTS.notAuthorized);
 //      } else {
 //        // user is not logged in
 //        $rootScope.$broadcast(P.AUTH_EVENTS.notAuthenticated);
 //        $state.go('login')
 //      }
 //    }
 //  });
// .config(['ChartJsProvider', function (ChartJsProvider) {
//     // Configure all charts
//     ChartJsProvider.setOptions({
//       chartColors: ['#FF5252', '#FF8A80'],
//       responsive: false
//     });
//     // Configure all line charts
//     ChartJsProvider.setOptions('line', {
//       showLines: false
//     });
//   }])
//

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


.run(function($ionicPlatform,$rootScope) {
  $ionicPlatform.ready(function() {

      if (window.device)
      {
        $rootScope.device = device;
      //  $rootScope.isKeyboardHide = true;
      }
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
     if (window.cordova) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          cordova.plugins.Keyboard.disableScroll(true);

          // Describe your logic which will be run each time when keyboard is about to be shown.
          // window.addEventListener('native.keyboardshow', (event) => {
          //     $rootScope.isKeyboardHide = false;
          //     console.log($rootScope.isKeyboardHide )
          //     // console.log(event.keyboardHeight);
          //  });
          //
          //  window.addEventListener('native.keyboardhide', (event) => {
          //      $rootScope.isKeyboardHide = true;
          //     console.log($rootScope.isKeyboardHide )
          //
          //   });

      }

     if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
     }


    });
})

.run(function($ionicPickerI18n) {
    $ionicPickerI18n.weekdays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    $ionicPickerI18n.months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"];
    $ionicPickerI18n.ok = "Valider";
    $ionicPickerI18n.cancel = "Annuler";
    $ionicPickerI18n.okClass = "button-positive";
    $ionicPickerI18n.cancelClass = "button-stable";
    $ionicPickerI18n.arrowButtonClass = "button-positive";
  })

.run(function($rootScope) {
      $rootScope.once = function(e, func) {
          var unhook = this.$on(e, function() {
              unhook();
              func.apply(this, arguments);
          });
      };


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
