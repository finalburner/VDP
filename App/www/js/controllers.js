controllers
.controller('AppCtrl', ['$q','$window','$cordovaDevice','$ionicHistory','$rootScope', '$scope','$ionicModal','$stateParams','socket','$state','P','ConnectivityMonitor', 'Notif', 'AuthService' ,'$ionicPopover' , '$http','$localStorage', '$ionicPopup', function($q, $window, $cordovaDevice, $ionicHistory, $rootScope, $scope , $ionicModal, $stateParams, socket, $state, P, ConnectivityMonitor, Notif, AuthService, $ionicPopover, $http, $localStorage,$ionicPopup) {

  // $scope.$watch('$root.Connected', function(newValue, oldValue) {
  //    console.log(newValue + '-' + oldValue)
  // });



  $scope.unlog = function ()
    {
      console.log($localStorage.currentUser)
      socket.emit('unlog', { user : $localStorage.username})
      delete $localStorage.List_CT;
      delete $localStorage.currentUser;
      $localStorage.$apply();
      $rootScope.$broadcast(P.AUTH_EVENTS.logoutSuccess);
      $rootScope.setCurrentUser(null);
      console.log($localStorage)
      $state.go('login');
    };

    socket.removeListener(P.SOCKET.CO);
    socket.on(P.SOCKET.CO , function () {
        socket.emit(P.SOCKET.CC, $rootScope.device);
        $rootScope.Socket_Connected = true
        Notif.Show("Connecté");
        console.log('Socket connected');
    });


    //reception de l'id du socket App
    socket.removeListener(P.SOCKET.CI);
    socket.on(P.SOCKET.CI , function (data) {
    $rootScope.Cnx.socket_id = data.id
    });

    socket.removeListener(P.SOCKET.DE);
    socket.on(P.SOCKET.DE , function () {
    Notif.Show("Déconnecté");
    console.log('Socket disconnected');
    $rootScope.Socket_Connected = false
    });

    $rootScope.setCurrentUser = function (user) {
       $localStorage.currentUser = user
    };
////////////////POPOVER N1 ////////////////
   // PopOVER N1
   $ionicPopover.fromTemplateUrl('templates/N1/popN1.html', {
   scope: $scope
  //  "backdropClickToClose" :true
   }).then(function(popover) {
   $scope.popN1 = popover;
   });

  $scope.popN1_open = function ($event)
  {
  $scope.CT_Color = $rootScope.CT_Color ;
  $scope.popN1.show($event)
  $scope.popN1isOpen = true ;
  }
  // Execute action on hide popover
   $scope.$on('popover.hidden', function() {
        $scope.popN1isOpen = false ;
     });

  $scope.popN1_close = function (item)
  {
   if ( !item.dev && ($rootScope.CT_Color != P.ALARM.AL_10_Color || !item.dc)) {
        $scope.popN1.hide();
        $scope.popN1isOpen = false ;
        $state.go(item.url)
   }
  }


/////////////// POPOVER N2 //////////////////
    $ionicPopover.fromTemplateUrl('templates/N2/pop_N2.html', {
    scope: $scope,
    }).then(function(popover) {
    $scope.popN2 = popover;
    });

    $scope.popN2_open = function ($event)
    {
    $scope.popN2.show($event)
    $scope.popN2isOpen = true ;
    }
    // Execute action on hide popover
    $scope.$on('popover.hidden', function() {
          $scope.popN2isOpen = false ;
       });

    $scope.popN2_close = function (item)
    {
    if (!item.dc && !item.dev) {
    $rootScope.Vue = item.Vue;
    $rootScope.titre_vue = item.name;
    $scope.popN2.hide();
    $scope.popN2isOpen = false ;
    $state.go(item.url)
  }}


// $state.go('app.CT'); //test only
//   $scope.$on('$ionicView.enter', function() {
//      // Code you want executed every time view is opened/
//   $rootScope.Selected_CT = "CT05320"

//   setTimeout(function(){
//   i = Math.floor(5 * Math.random() + 1)
//   if (i==1) $state.go('app.CT');
//   if (i==2) $state.go('app.CTsta');
//   if (i==3) $state.go('app.CTsyn');
//   if (i==4) $state.go('app.CTcon');
//   if (i==5) {$state.go('app.alarmes'); }
// },2000 ); // 5 à 10 s
//   })

// $rootScope.$on('$stateChangeStart', function (event, next) {
//   var authorizedRoles = next.data.authorizedRoles;
//   if (!AuthService.isAuthorized(authorizedRoles)) {
//     event.preventDefault();
//     if (AuthService.isAuthenticated()) {
//       // user is not allowed
//       $rootScope.$broadcast(P.AUTH_EVENTS.notAuthorized);
//     } else {
//       // user is not logged in
//       $rootScope.$broadcast(P.AUTH_EVENTS.notAuthenticated);
//     }
//   }
// });

// ConnectivityMonitor.startWatching(); //?????



$scope.pop_N1 = P.POP_N1.GLOBAL;
$scope.pop_N2 = P.POP_N2;
$scope.POP_PH = P.POP_PH;


// $scope.userRoles = P.USER_ROLES;
// $scope.isAuthorized = AuthService.isAuthorized;

  // socket.on('id', function(data){ $scope.clientid = data ; });
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {

// Create the login modal that we will use later
$ionicModal.fromTemplateUrl('templates/N0/login.html',function(modal){
          $scope.modalCnx = modal;
        }, {
          scope: $scope,  /// GIVE THE MODAL ACCESS TO PARENT SCOPE
          animation: 'slide-in-up',//'slide-left-right', 'slide-in-up', 'slide-right-left'
          focusFirstInput: true
        });
//



//Change Selected_CT to 'null' - display alarm for ALL CTS
$scope.JAL = function() {
   $rootScope.Selected_CT = 'null'
};


}])

.controller('LoginCtrl', ['$ionicLoading','$q','$window','$cordovaDevice','$ionicHistory','$rootScope', '$scope','$ionicModal','$stateParams','socket','$state','P','ConnectivityMonitor', 'Notif', 'AuthService' ,'$ionicPopover' , '$http','$localStorage', '$ionicPopup', function($ionicLoading, $q, $window, $cordovaDevice, $ionicHistory, $rootScope, $scope , $ionicModal, $stateParams, socket, $state, P, ConnectivityMonitor, Notif, AuthService, $ionicPopover, $http, $localStorage,$ionicPopup) {


  $rootScope.APK = P.INFO.Version
  $ionicLoading.show({ //Spinner au chargement initial
  content: 'Loading', animation: 'fade-in', showBackdrop: true,
  duration: 15000, maxWidth: 200,  showDelay: 0
  });

   $ionicHistory.removeBackView();
   $ionicHistory.clearHistory()

  ionic.Platform.ready(function() {

  $ionicLoading.hide()
   var Version = $localStorage.Version || 0

   if(P.INFO.Version != Version)
   {
     $localStorage.$reset()
     $localStorage.Version = P.INFO.Version
   }

  if(window.cordova)
  {
    $localStorage.$default({
      Srv_url : P.PARAM.SRV[0].url,
      Srv : P.PARAM.SRV[0],
      Srv_Connect : true,
      username : '',
      password : ''
    })
  }
  else
  {
  $localStorage.$default({
      Srv_url : P.PARAM.SRV_LOCAL[0].url,
      Srv : P.PARAM.SRV_LOCAL[0],
      Srv_Connect : true,
      username : '',
      password : ''
    })
  }

  $rootScope.Cnx = {
      username: $localStorage.username,
      password: $localStorage.password,
      AST_Checked : false,
      socket_id : ''
    };

    if (!window.cordova) //DEV : Simule La connexion Internet pour login
    {
      $rootScope.Connected = true
      $rootScope.device = {
                            available:true,
                            cordova:"6.1.2",
                            isVirtual:true,
                            manufacturer:"LENOVO",
                            model:"LENOVO P50",
                            platform:"Windows",
                            serial:"DLQ0216325006669",
                            uuid:"d322c7c2af8cbd3e",
                            version:"7.0"
                            }
    }
    else
    $rootScope.device = $cordovaDevice.getDevice()

    console.log($rootScope.device)

   })


  $scope.Authorize_Cnx = false
  $rootScope.P = P ;

  socket.removeListener(P.SOCKET.CO);
  socket.on(P.SOCKET.CO , function () {
  socket.emit(P.SOCKET.CC, $rootScope.device);
  $rootScope.Socket_Connected = true
  Notif.Show("Connecté");
  console.log('Socket connected');
  });

  //reception de l'id du socket App
  socket.removeListener(P.SOCKET.CI);
  socket.on(P.SOCKET.CI , function (data) {
  $rootScope.Cnx.socket_id = data.id
  });

  socket.removeListener(P.SOCKET.DE);
  socket.on(P.SOCKET.DE , function () {
  Notif.Show("Déconnecté");
  console.log('Socket disconnected');
  $rootScope.Socket_Connected = false
  });

    $rootScope.setCurrentUser = function (user) {
       $localStorage.currentUser = user
    };


   // socket.emit(P.SOCKET.UQ) ;  //Update query
   //
   // socket.removeListener(P.SOCKET.UA);
   // socket.on(P.SOCKET.UA , function (data)
   //  { //update Answer
   //   var localbuild = P.INFO.Version[0]+ P.INFO.Version[2] + P.INFO.Version[4]
   // // console.log(parseInt(localbuild)  < parseInt(data[0].Build))
   // console.log(data[0])
   // // console.log(P.INFO)
   //  if (parseInt(localbuild)  < parseInt(data[0].Build)) //met à jour l'application, un nouveau build APK est disponible
   //  {
   //
   // if(window.cordova)
   //  {
   //    setTimeout(function() {
   //
   //       var alertPopup = $ionicPopup.alert({
   //          title: 'Mise à jour requise',
   //          template: 'Une nouvelle mise à jour est disponible, appuyez sur OK pour l\'installer'
   //       });
   //
   //       var plugin;
   //       if(typeof cordova != "undefined" &&
   //           typeof cordova.plugins.ApkAutoUpdater !== "undefined"){
   //           var plugin = cordova.plugins.ApkAutoUpdater;
   //           console.info("ApkAutoUpdater loaded");
   //       }
   //
   //       alertPopup.then(function(res) {
   //         var defer = $q.defer();
   //         var strUrl = data[0].Link
   //         if(strUrl){
   //             plugin.updateFromUrl(strUrl, defer.resolve,  defer.reject);
   //         }
   //         return defer.promise;
   //
   //       })
   //
   //     }, 2000);
   //  }
   // }
   // });

  $scope.init_login = function ()
  {
    delete $localStorage.List_CT;

  }

  socket.removeListener(P.SOCKET.AA);
  socket.on(P.SOCKET.AA , function (data) {
      if(data && data.user_sql != ''){
      $ionicLoading.hide() //enleve le spinner
      $scope.AST = data.AST
      $rootScope.Cnx.AST_Checked = false
      $rootScope.Cnx.user_sql = data.user_sql
      $rootScope.Cnx.AD_connect = data.AD_connect
      $scope.Authorize_Cnx = true
      // console.log($rootScope.Cnx)
      window.fabric && window.fabric.Crashlytics.setUserIdentifier($rootScope.Cnx.username);
      window.fabric && window.fabric.Crashlytics.setUserName($rootScope.Cnx.user_sql);
      // window.fabric.Crashlytics.setUserEmail("some.guy@email.com");
      // window.fabric.Crashlytics.setStringValueForKey("bar", "foo");
      // window.fabric.Crashlytics.sendNonFatalCrash("Error message");
      // window.fabric.Crashlytics.addLog("about to send a crash for testing!");
      // window.fabric.Crashlytics.sendCrash();//FATAL CRASH TEST
      }
      else
      Notif.Show("Utilisateur non trouvé");
      });

    $rootScope.Cnx = { // initialise la vue login avec les paramètres enregistrés
        username: $localStorage.username, //champ introduit par l'utilisateur
        password: $localStorage.password,
        AST_Checked : false,
        socket_id : ''
    };

  //////////// Vérifie l'existence d'astreinte pour l'utilisateur  ////////////////
      // if($rootScope.Cnx.username && $rootScope.Cnx.username!= '')
      // setTimeout(function (){
      //     $scope.login_blur()
      // }, 2000); // lorsqu'il y'a deja un username sauvegardé

    $scope.login_blur = function () //lorsqu'on quitte l'input utilisateur (login)
    {
      $scope.Authorize_Cnx = false
      $localStorage.username = $rootScope.Cnx.username
      if($rootScope.Connected && $rootScope.Socket_Connected && $rootScope.Cnx.username != '')
      {
        var nameParts = $rootScope.Cnx.username.split("@");
        $rootScope.Cnx.login = nameParts.length==2 ? nameParts[0] : $rootScope.Cnx.username ; //PART1 before@
        $rootScope.Cnx.domain = nameParts.length==2 ? nameParts[1] : ''; //PART2 after@
        $localStorage.username = $rootScope.Cnx.username
        $localStorage.login =  $rootScope.Cnx.login
        $localStorage.domain =  $rootScope.Cnx.domain
        socket.emit(P.SOCKET.AQ, { username : $rootScope.Cnx.username, login : $rootScope.Cnx.login, domain : $rootScope.Cnx.domain  });

        $ionicLoading.show({ //Spinner au chargement initial
        content: 'Loading', animation: 'fade-in', showBackdrop: true,
        duration: 10000, maxWidth: 200,  showDelay: 0
        });
      }
      else if (!$rootScope.Connected)
       {
          var alertPopup = $ionicPopup.alert({
               title: 'Pas de connexion',
               template: 'Vérifiez votre connexion internet'
            });
       }
       else if ($rootScope.Connected && !$rootScope.Socket_Connected)
       {
         var alertPopup = $ionicPopup.alert({
          title: 'Connexion',
          template: 'Serveur mobilité injoignable.'
          // template: 'Serveur mobilité injoignable. Changement de serveur'
          });

       //    alertPopup.then(function() { //Changement de serveur
       //          if(window.cordova)
       //          {
       //          var h =  P.PARAM.SRV.length
       //          var i =  $localStorage.Srv['id']
       //          console.log(i +'-' + h)
       //          i++;
       //          if(i<h)
       //          {
       //          $localStorage.Srv = P.PARAM.SRV[i]
       //          $localStorage.Srv_url = P.PARAM.SRV[i].url
       //          }
       //          else if (i==h)
       //          {
       //          $localStorage.Srv = P.PARAM.SRV[0]
       //          $localStorage.Srv_url = P.PARAM.SRV[0].url
       //          }
       //
       //          setTimeout(function (){
       //                  $window.location.reload(true)
       //          }, 500);
       //          }
       //          else
       //          {
       //          var h =  P.PARAM.SRV_LOCAL.length
       //          var i =  $localStorage.Srv['id']
       //          console.log(i +'-' + h)
       //          i++;
       //          if(i<h)
       //          {
       //          $localStorage.Srv = P.PARAM.SRV_LOCAL[i]
       //          $localStorage.Srv_url = P.PARAM.SRV_LOCAL[i].url
       //          }
       //          else if (i==h)
       //          {
       //          $localStorage.Srv = P.PARAM.SRV_LOCAL[0]
       //          $localStorage.Srv_url = P.PARAM.SRV_LOCAL[0].url
       //          }
       //
       //          setTimeout(function (){
       //                  $window.location.reload(true)
       //          }, 500);
       //          }
       // })

      }


    }


    //////////////////////////////////////////////////////////////////////////////
    $scope.IspasswordShown = false

      $scope.switchPassword = function()
      {
        $scope.IspasswordShown = !$scope.IspasswordShown
     }


  $scope.login = function ()
  {
    //sauvegarde les paramètres utilisateur en localStorage

    $localStorage.NewConnexion = true // nouvelle connexion
    $localStorage.AST_Checked =  $rootScope.Cnx.AST_Checked
    // $localStorage.password = Cnx.password //mauvaise manip  NE PAS sauvegarder le pass en clair !!!!


    if ($rootScope.Connected && $rootScope.Socket_Connected)
       {
               $ionicLoading.show({ //Spinner au chargement initial
               content: 'Loading', animation: 'fade-in', showBackdrop: true,
               duration: 15000, maxWidth: 200,  showDelay: 0
               });

              AuthService.login($rootScope.Cnx).then(function(user) {
               $rootScope.droit = user.droit;
               $rootScope.profil_COD = user.profil_COD
               $rootScope.name = user.name;
               $rootScope.profil = user.profil;
               //console.log($rootScope.droit)
               $rootScope.$broadcast(P.AUTH_EVENTS.loginSuccess);
               window.fabric && window.fabric.Answers.sendCustomEvent("Connection", { "USERNAME" : user.user.user_sql , "SERVER" : $localStorage.Srv.name, "ASTREINTE" : user.user.AST_Checked, "AD" : user.user.AD_connect });
               $ionicHistory.nextViewOptions({  //Supprime le retour vers l'interface LOGIN
                                              disableBack: true,
                                              historyRoot  : true
                                             });
               $rootScope.setCurrentUser(user); //Sauvegarde l'utilisateur Actuel dans currentUser
               $state.go('app.CT'); // redirige vers Accueil

              }, function () {
                $rootScope.$broadcast(P.AUTH_EVENTS.loginFailed);
                window.fabric && window.fabric.Answers.sendLogIn("AD", false)
              });
            }
    else {

      if (!$rootScope.Connected)
       {
          var alertPopup = $ionicPopup.alert({
               title: 'Pas de connexion',
               template: 'Vérifiez votre connexion internet'
            });
       }
       else
       {

         var alertPopup = $ionicPopup.alert({
          title: 'Connexion',
          template: 'Serveur mobilité injoignable. Changement de serveur'
          });

          alertPopup.then(function() { //Changement de serveur
                if(window.cordova)
                {
                var h =  P.PARAM.SRV.length
                var i =  $localStorage.Srv['id']
                console.log(i +'-' + h)
                i++;
                if(i<h)
                {
                $localStorage.Srv = P.PARAM.SRV[i]
                $localStorage.Srv_url = P.PARAM.SRV[i].url
                }
                else if (i==h)
                {
                $localStorage.Srv = P.PARAM.SRV[0]
                $localStorage.Srv_url = P.PARAM.SRV[0].url
                }

                setTimeout(function (){
                        $window.location.reload(true)
                }, 500);
                }

       })
    }
  }
  }

  //Quittez l'application sur android
  $scope.quit = function ()
      {
  ionic.Platform.exitApp()
      };
   }])

.controller('ConCtrl', ['$ionicHistory','$scope', 'socket', '$ionicLoading', '$rootScope', '$state', 'P', '$ionicPopup', function($ionicHistory, $scope, socket, $ionicLoading, $rootScope,$state, P, $ionicPopup) {


   //test
  //  $rootScope.Selected_CT = '01001'
  //  $rootScope.Selected_NomGrp = 'CIRCU'
  //  $rootScope.Selected_DesGrp = '00001'
  //  $rootScope.Selected_PT = '108191'
  //  $rootScope.Vue = 2
   window.fabric && window.fabric.Answers.sendContentView("Consigne", "Vue", $rootScope.Vue , { "CT" : $rootScope.Selected_CT , "PT" : $rootScope.Selected_PT , "GF" : 'PT' + $rootScope.Selected_PT + '_' + $rootScope.Selected_NomGrp + '_' + $rootScope.Selected_DesGrp });


  // console.log($rootScope.Selected_CT + "-" + $rootScope.Selected_NomGrp + "-" + $rootScope.Selected_DesGrp + "-" + $rootScope.Selected_PT)
   // console.log($ionicHistory.viewHistory())
   var Confirm_executed = false;
   $scope.titre = "<div class='main-title' style='line-height: 1.6;padding-top:0px'>CT " + $rootScope.Selected_CT+"</div><div class='sub-title' style='line-height: .6;font-size: 12px;color: #315286;'> " + $rootScope.Selected_LibGrp + "</div>"
   $scope.Vue == $rootScope.Vue ;
   if(!$rootScope.Selected_NomGrp || !$rootScope.Selected_DesGrp)  $state.go('app.CTsyn'); //Redirect to CT
   if ($rootScope.Vue == 1 ) $scope.titre_vue = P.POP_N2.GLOBAL[0].name;  // fonctionnement
   if ($rootScope.Vue == 2 ) $scope.titre_vue = P.POP_N2.GLOBAL[1].name;  // consignes
   if ($rootScope.Vue == 3 ) $scope.titre_vue = P.POP_N2.GLOBAL[2].name;  // Mise au point

   $scope.Validate_Item = '' ;
   $scope.List_Cons = [] ;

   $ionicLoading.show({ //Spinner au chargement initial
   content: 'Loading', animation: 'fade-in', showBackdrop: true,
   duration: 10000, maxWidth: 200,  showDelay: 0
  });

     $scope.Confirm = function(item, key) {
        console.log(item)
        var i

        if(item.LV != item.V) //N'exécute pas la confirmation deux fois (ng-blur et submit)
        {

     var promise = new Promise(function(resolve, reject) {
       if (item.T == 'TR' || item.T == 'TM') //Analog Value
       {
       if (parseInt(item.A0) <= item.LV && item.LV <= parseInt(item.A1))
       {
         window.fabric && window.fabric.Answers.sendContentView("ConsigneChange", "Operation", "10" , { "M" : item.M , "LV" : item.LV });
         resolve("OK");
       }
       else
       reject("Error");
       }
       else // (item.T == 'TC' || item.T == 'TS' || item.T == 'TA')
       {
       resolve("OK")
       }

     });

    promise.then(function(result) {
       //Bonne valeur ---> Confirmation de la modification
         var confirmPopup = $ionicPopup.confirm({
         title: 'Consigne',
         template: 'Changer la valeur de la consigne ?',
         cancelText : 'Non',
         okText : 'Oui'
         });

         confirmPopup.then(function(res) {
         if(res) {
         window.fabric && window.fabric.Answers.sendCustomEvent("ConsigneChange", { "M" : item.M , "LV" : item.LV });
         item.Mode = "Write";
         socket.emit(P.SOCKET.CQ, item );
         i = $scope.List_Cons[key].findIndex((obj => obj.M == item.M));
         $scope.List_Cons[key][i].V = $scope.List_Cons[key][i].LV ;
         }
          else {
           i = $scope.List_Cons[key].findIndex((obj => obj.M == item.M));
           $scope.List_Cons[key][i].LV = $scope.List_Cons[key][i].V ;
           console.log('Confirmation annulé');
         }
       });
    }, function(err) {
      console.log(err)
      var A,B ;
      var C = item.A ;
      if (item.T == 'TR' || item.T == 'TM')
      { A = item.A0 ; B = item.A1 }
      else
      { A = item.T0 ; B = item.T1 }


         var alertPopup = $ionicPopup.alert({
          title: 'Valeur incorrecte',
          template: 'La valeur doit être comprise entre ' + A + ' ' + C + ' et ' + B + ' ' + C
           });
          alertPopup.then(function(res) {
            var i = $scope.List_Cons[key].findIndex((obj => obj.M == item.M));
            $scope.List_Cons[key][i].LV = $scope.List_Cons[key][i].V ;
      });
   });

      }
        };
 // mise à jour de la consigne
    // socket.on(P.SOCKET.CU , function(data) {
    //
    //   var i = $scope.List_Cons[data.GRP].findIndex((obj => obj.M == data.M));
    //   $scope.List_Cons[data.GRP][i] = data ;
    //   console.log($scope.List_Cons)
    // });

    $scope.Refresh = function() //Exécuté lors du Pull-to-Refresh et Initiation du controlleur-vue (ng-init)
    {
    socket.emit(P.SOCKET.CQ , { Mode : "Read" ,     DGF : $rootScope.Selected_DesGrp , NGF : $rootScope.Selected_NomGrp  , Selected_CT :$rootScope.Selected_CT , Vue : $rootScope.Vue , Selected_PT : $rootScope.Selected_PT});
    }

    socket.removeListener(P.SOCKET.CA);
    socket.on(P.SOCKET.CA , function(data) {
    console.log(data[0])
    $scope.List_Cons = data[0]; //Met à jour la liste
    $ionicLoading.hide() //enleve le spinner
    $scope.$broadcast('scroll.refreshComplete');//Stop the ion-refresher from spinning
    });

    socket.removeListener(P.SOCKET.CHA3);
    socket.on(P.SOCKET.CHA3 , function(data) {

      console.log(data)

                   $scope.data =  [
                           {
                               values: [
                                { x : +30, y : data[2]},
                                { x : +20, y : data[2]},
                                { x : +10, y : data[1]},
                                { x : -10, y : data[0]},
                                { x : -20, y : data[0]}
                                ],      //values - represents the array of {x,y} data points
                               color: '#6B84A8',  //color - optional: choose your own line color.
                               type : 'line',
                              //  strokeWidth: 2,
                               yAxis: 1,
                               key : 'X1'
                              //  classed: 'dashed'
                           },
                           {
                             values: [{ x : 10, y : data[4] }
                                      ],
                             yAxis: 1,
                             color: '#6B84A8',
                             type : 'scatter',
                             key : 'X2'
                           }
                       ];


      $ionicLoading.hide() //enleve le spinner
      $scope.$broadcast('scroll.refreshComplete');//Stop the ion-refresher from spinning
    });

    $scope.options = {
               chart: {
                   type: 'multiChart',
                   tooltip: { enabled : false},
                   showLegend: false,
                  //  pointSize: 20,
                  //  pointDomain: [0, 10],
                   height: 170,
                   showDistX :true,
                   showDistY :true,
                   interpolate: 'linear',
                   margin : {
                       top: 10,
                       right: 10,
                       bottom: 40,
                       left: 40
                   },
                   useInteractiveGuideline: false,
                  //  dispatch: {
                  //      stateChange: function(e){ console.log("stateChange"); },
                  //      changeState: function(e){ console.log("changeState"); },
                  //      tooltipShow: function(e){ console.log("tooltipShow"); },
                  //      tooltipHide: function(e){ console.log("tooltipHide"); }
                  //  },
                   xAxis: {
                       axisLabel: 'Température Extérieure (°C)',
                       axisLabelDistance: -5,
                       ticks: 5,
                      //  tickValues: 10,
                      //  tickSubdivide: 0,
                       tickSize: 10,
                      //  tickPadding: 10
                   },
                   yAxis: {
                       axisLabel: 'T° Départ (°C)',
                      //  tickFormat: function(d){
                      //      return d3.format('.02f')(d);
                      //  },
                       axisLabelDistance: -25
                   },
                   callback: function(chart){
                       console.log("!!! lineChart callback !!!");
                   }
               },
              //  title: {
              //      enable: true,
              //      text: 'Title for Line Chart'
              //  },
              //  subtitle: {
              //      enable: true,
              //      text: 'Subtitle for simple line chart. Lorem ipsum dolor sit amet, at eam blandit sadipscing, vim adhuc sanctus disputando ex, cu usu affert alienum urbanitas.',
              //      css: {
              //          'text-align': 'center',
              //          'margin': '10px 13px 0px 7px'
              //      }
              //  },
              //  caption: {
              //      enable: true,
              //      html: '<b>Figure 1.</b> Lorem ipsum dolor sit amet, at eam blandit sadipscing, <span style="text-decoration: underline;">vim adhuc sanctus disputando ex</span>, cu usu affert alienum urbanitas. <i>Cum in purto erat, mea ne nominavi persecuti reformidans.</i> Docendi blandit abhorreant ea has, minim tantas alterum pro eu. <span style="color: darkred;">Exerci graeci ad vix, elit tacimates ea duo</span>. Id mel eruditi fuisset. Stet vidit patrioque in pro, eum ex veri verterem abhorreant, id unum oportere intellegam nec<sup>[1, <a href="https://github.com/krispo/angular-nvd3" target="_blank">2</a>, 3]</sup>.',
              //      css: {
              //          'text-align': 'justify',
              //          'margin': '10px 13px 0px 7px'
              //      }
              //  }
           };

      }])

.controller('FicCtrl', ['$localStorage','$state', '$ionicLoading','$rootScope', '$scope', 'socket' , '$ionicPopover', 'P', function($localStorage, $state, $ionicLoading, $rootScope, $scope, socket, $ionicPopover, P) {

    console.log($state)
    $scope.Liste = P.FIC;
    $scope.titre_vue = "Fiche Identité";
    $scope.Fic = [];
    $scope.List_CT = [];

    $scope.slideHasChanged = function(index) {
        $scope.slideIndex = index;

      };

    $scope.options = {
      loop: false,
      effect: 'fade',
      speed: 500,
    }

    $ionicLoading.show({
    content: 'Loading', animation: 'fade-in', showBackdrop: true,
    duration: 5000, maxWidth: 200,  showDelay: 0
    });

    $scope.expand_AL = function(item) {
            if ($scope.isItemExpanded(item)) {
              $scope.shownItem = null;
            } else {
              $scope.shownItem = item.id;
            }
          };

    $scope.isItemExpanded = function(item) {
      // console.log("shownitem : " + $scope.shownItem)
            return $scope.shownItem === item.id;
          };

    $scope.expand_CT = function(item) {
                  if ($scope.isItemExpanded(item)) {
                    $scope.shownItem = null;
                  } else {
                    $scope.shownItem = item.L;
                  }
                };
    $scope.isCTExpanded = function(item) {
            // console.log("shownitem : " + $scope.shownItem)
              return $scope.shownItem === item.L;
          };

    $scope.Refresh1 = function() //Exécuté lors du Pull-to-Refresh et Initiation du controlleur-vue (ng-init)
    {
    socket.emit(P.SOCKET.FQ , { Mode : 'CT' , username :  $localStorage.currentUser.user.user_sql });
    window.fabric && window.fabric.Answers.sendContentView("FicheIdentite", "Vue", "1");
    }

    socket.removeListener(P.SOCKET.FA1);
    socket.on(P.SOCKET.FA1 , function(data) {
    console.log(data)
    $scope.List_CT = data; //Met à jour la liste
    $ionicLoading.hide() //enleve le spinner
    $scope.$broadcast('scroll.refreshComplete');//Stop the ion-refresher from spinning
    });

    $scope.Refresh2 = function() //Exécuté lors du Pull-to-Refresh et Initiation du controlleur-vue (ng-init)
    {
    // console.log($rootScope.Selected_CT)
    if(!$rootScope.Selected_CT)  $state.go('app.CTfic'); //Redirect to CT
    // $scope.titre_vue = "<div class='main-title' style='line-height: 1.6;padding-top:5px'>CT " + $rootScope.Selected_CT + "</div>"
    // "<div class='sub-title' style='line-height: .6;font-size: 12px;color: #315286;'> " + $rootScope.Selected_LibGrp + "</div>";
    socket.emit(P.SOCKET.FQ , { Mode : 'FIC' , CT : $rootScope.Selected_CT });
    window.fabric && window.fabric.Answers.sendContentView("FicheIdentite", "Vue", "2" , { "CT" : $rootScope.Selected_CT });
    }

    socket.removeListener(P.SOCKET.FA2);
    socket.on(P.SOCKET.FA2 , function(data) {
    $scope.List_Fic = data; //Met à jour la liste
    $ionicLoading.hide() //enleve le spinner
    $scope.$broadcast('scroll.refreshComplete');//Stop the ion-refresher from spinning
    });

    $scope.FIC_CT = function(CT) //Exécuté lors du Pull-to-Refresh et Initiation du controlleur-vue (ng-init)
    {
      $rootScope.Selected_CT = CT;
      $state.go("app.CTfic2")
    }

}])


.controller('CTctrl', ['$ionicModal','$localStorage' , '$filter', '$ionicHistory','Session','$stateParams', 'NgMap', '$rootScope', '$scope', 'socket', '$ionicLoading', 'P', '$ionicSideMenuDelegate','$state', '$anchorScroll', function($ionicModal,$localStorage, $filter, $ionicHistory, Session, $stateParams, NgMap, $rootScope, $scope,socket,$ionicLoading, P, $ionicSideMenuDelegate, $state ,$anchorScroll) {
  //  console.log($rootScope.droit)
  //  if($stateParams)
  //  console.log($stateParams)
  // console.log($session)
  // / $scope.$watch('$root.Connected', function(newValue, oldValue) {
  //    console.log(newValue + '-' + oldValue)
  // });

  // $scope.$watch('fil', function(newValue, oldValue) {
  //  console.log(newValue + '-' + oldValue)
  //  console.log(^sco)
  // })



  window.fabric && window.fabric.Answers.sendContentView("ListeCT", "Vue", "1" , { "USERNAME" : $localStorage.currentUser.user.user_sql ,"AST" : $localStorage.currentUser.AST_Checked });

  $ionicModal.fromTemplateUrl('templates/N1/modalN1.html', function(modal) {
            $scope.modalN1 = modal;
          }, {
            scope: $scope,  /// GIVE THE MODAL ACCESS TO PARENT SCOPE
            animation: 'slide-in-up',//'slide-left-right', 'slide-in-up', 'slide-right-left'
            focusFirstInput: true
          });

  $scope.list_N1 = P.MODAL_N1;

  $scope.CT_N1 = function (CT,PT, color, Adresse, CP) //ouvre synthèse d'un CT
    {
      $rootScope.Selected_CT = CT;
      $rootScope.CT_Color = color;
      // console.log($rootScope.CT_Color)
      $rootScope.Selected_PT = PT;
      $rootScope.CT_Adresse = Adresse + ', ' + CP;
      $state.go('app.CTsyn');
    };


  $scope.N1_open = function(CT, color, PT, Adresse , CP) {
              $scope.modalN1.show();
              $rootScope.CT_Color = color;
              $scope.modalN1.name= 'CT'+CT;
              $scope.modalN1.AL_Color= color;
              $scope.modalN1.animation =  "slide-left-right";
              $rootScope.Selected_CT = CT;
              $rootScope.Selected_PT = PT;
              $rootScope.CT_Adresse = Adresse + ', ' + CP;
          };

  $scope.N1_hide = function(item) {
        if (!item.dc && !item.dev)
                {$scope.modalN1.hide()
                $state.go(item.url);}
              };

  $ionicLoading.show({
  content: 'Loading', animation: 'fade-in', showBackdrop: true,
  duration: 15000, maxWidth: 200,  showDelay: 0
  });
  //this is the code to capture the emited event
  $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
     $ionicLoading.hide(); //enleve le spinner
 });


  $scope.titre = "Accueil" ;

  $scope.filter = function(search)
  {

  $scope.Filtered = $filter('filter')($rootScope.List_CT, search );

  $scope.titre ="<div class='main-title' style='line-height: 1.6;padding-top:0px'>Accueil</div><div class='sub-title' style='line-height: .6;font-size: 12px;color: #315286;'> " + $scope.Filtered.length + " centres thermiques</div>"
  }

  $ionicHistory.removeBackView();
  $ionicHistory.clearHistory()
  // console.log(Session)
  // if ($rootScope.Selected_CT && $rootScope.Selected_CT != "null") $scope.search = $rootScope.Selected_CT;
  $scope.Refresh = function() //Exécuté lors de l'initiation du controlleur-vue (ng-init)
  {// recharge la liste une fois puis la stock localement
  //  console.log($localStorage)
    if ($localStorage.NewConnexion) // Utilisateur vient de se connecter
    {
      socket.emit(P.SOCKET.CTQ, { username :  $localStorage.currentUser.user.user_sql , AST_Checked :$localStorage.currentUser.AST_Checked });
    }
    else {  // Utilisateur déja connecté : retour sur la liste des CTS

      if ($rootScope.List_CT && $rootScope.List_CT.length > 0 ) // la liste existe déja en local => rechargement de la liste
    {
      $scope.Filtered = $rootScope.List_CT
      $scope.titre ="<div class='main-title' style='line-height: 1.6;padding-top:0px'>Accueil</div><div class='sub-title' style='line-height: .6;font-size: 12px;color: #315286;'> " + $scope.Filtered.length + " centres thermiques</div>"
      $ionicLoading.hide(); //enleve le spinner
    }
    else // liste inexitante en local, requete une liste de CT
      socket.emit(P.SOCKET.CTQ, { username :  $localStorage.currentUser.user.user_sql , AST_Checked :$localStorage.currentUser.AST_Checked });
    }
  }


  $scope.Refresh2 = function() //Exécuté lors du Pull-to-Refresh => recharge une nouvelle liste SERVER
  {
      socket.emit(P.SOCKET.CTQ, { username :  $localStorage.currentUser.user.user_sql , AST_Checked :$localStorage.currentUser.AST_Checked });
  }

  $rootScope.$on('$stateChangeStart',  function(event, toState, toParams, fromState, fromParams){
  if(toState.url == "/carto")
      $ionicSideMenuDelegate.canDragContent(false);
  if(fromState.url == "/carto")
      $ionicSideMenuDelegate.canDragContent(true);
  })

  socket.removeListener(P.SOCKET.CTA);
  socket.on(P.SOCKET.CTA, function(data){
  $localStorage.NewConnexion = false
  console.log(data)
  $rootScope.List_CT = data
  $scope.filter('')
  //$rootScope.List_CT = JSON.stringify(data)
  //console.log(data)
  // $scope.Filtered = data ;
  $scope.titre ="<div class='main-title' style='line-height: 1.6;padding-top:0px'>Accueil</div><div class='sub-title' style='line-height: .6;font-size: 12px;color: #315286;'> " + $scope.List_CT.length + " centres thermiques</div>"
  $ionicLoading.hide(); //enleve le spinner
  $scope.$broadcast('scroll.refreshComplete'); //Stop the ion-refresher from spinning

  });

  $scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyB3QWWdY2M8JtbDSSrVriG9lIwD5anCRHo";

  //ouverture du modal N1
  $scope.N1_open_carto = function(A, CT, color, PT, Adresse, CP) {
  console.log(A +'-'+ CT +'-'+ color +'-'+ Adresse + '-' +   CP )
            $scope.modalN1.show();
            $scope.modalN1.name= 'CT'+CT;
            $scope.modalN1.AL_Color= color;
            $rootScope.CT_Color = color;
            $scope.modalN1.animation =  "slide-left-right";
            $rootScope.Selected_CT = CT;
            $rootScope.Selected_PT = PT;
            $rootScope.CT_Adresse = Adresse + ', ' + CP;
          };

  $scope.getrad = function(color) { //set radius in fct of AL_Color
  console.log(color)
  if(color = '#000000' ) return '80'
  else return '40'
  };

   NgMap.getMap().then(function(map) {
   $scope.map = map;
   });

     $scope.zoomChanged= function() {
     $scope.rad = $scope.map.zoom * (-4) + 120
     console.log($scope.rad)
    }

     $scope.rad = 80 ;
     $scope.loc = [48.861253, 2.329920]

     $scope.Map_CT = function (event,name) //ouvre synthèse d'un CT
        {
          $rootScope.Selected_CT = name;
          $state.go('app.CTsyn');
        };

  }])

.controller('ALctrl', ['$filter','$ionicListDelegate','$ionicModal', '$rootScope', '$scope', 'socket', '$ionicLoading', 'P', '$state', '$stateParams', function($filter, $ionicListDelegate,$ionicModal, $rootScope,$scope,socket,$ionicLoading,P,$state, $stateParams) {

   if ($scope.mode == 2)
   {
     $scope.$ionicGoBack = function(backCount) {
       $state.transitionTo('app.CTsyn');
     };
   }

  $scope.DEBUG_AL = function(item)
  {
    console.log(item)
  }

  $ionicLoading.show({
  content: 'Loading', animation: 'fade-in', showBackdrop: true,
  duration: 30000, maxWidth: 200,  showDelay: 0
  });
  //  $scope.tog = false;
  //  $scope.toggler = function() { return $scope.tog };
  //ouverture du modal filtres alarmes
  $scope.modalm_open = function(name,color)
  {  $scope.modalm.show(); $scope.Filter_Alm_local = $scope.Filter_Alm ;
    // console.log($scope.Filter_Alm)
    //  $scope.$broadcast('toggleWatchers', true);  //turn watchers back on
   };

  $scope.modalm_close = function ()
  {
    $scope.modalm.hide(); $scope.Filter_Alm = $scope.Filter_Alm_local ;
    $scope.titre_vue = "<div class='main-title' style='line-height: 1.6;padding-top:0px'>Journal des Alarmes</div><div class='sub-title' style='line-height: .6;font-size: 12px;color: #315286;'> " + $scope.$eval('(List_AL| filter:filtercriticite| filter : filteretat | filter : search).length') + " alarmes</div>"
   }

  $ionicModal.fromTemplateUrl('templates/N0/modalm.html', function(modal) {
  $scope.modalm = modal;
  }, {
  scope: $scope,  /// GIVE THE MODAL ACCESS TO PARENT SCOPE
  animation: 'slide-in-up',//'slide-left-right', 'slide-in-up', 'slide-right-left'
  focusFirstInput: true
  });

$scope.btn_voir = function(CT)   // Action boutton Alarmes->Voir
{  if (CT) $rootScope.Selected_CT = CT ;
   $state.go('app.CTsta')  }

$scope.List_AL = []
$scope.Synthese_PresentCount= 0 ;
//Cleanup the modal when we're done with it!


  // Execute action on hide modal
  // $scope.$on('modal.hidden', function() {
  //       if ($scope.List_AL.length >0) $scope.titre_vue = "<div class='main-title' style='line-height: 1.6;padding-top:0px'>Journal des Alarmes</div><div class='sub-title' style='line-height: .6;font-size: 12px;color: #315286;'> " + $scope.$eval('(List_AL| filter:filtercriticite| filter : filteretat | filter : search).length') + " alarmes</div>"
  // });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////                   FILTRAGE                    //////////////////////////////////////////
// ARI : Alarme critique, AMA : alarme majeure, AMI : Alarme Mineure, ADC : Alarme Défaut com ,
// P: Présente , PA : Présente Ack , D : Disparue
$scope.filtercriticite = function(obj) { return (obj.C == $scope.Filter_Alm.ARI)||(obj.C == $scope.Filter_Alm.AMA)||(obj.C == $scope.Filter_Alm.AMI)||(obj.C == $scope.Filter_Alm.ADC) };
$scope.filteretat = function(obj) { return (obj.P == $scope.Filter_Alm.P)||(obj.P == $scope.Filter_Alm.PA)||(obj.P == $scope.Filter_Alm.D) };
$scope.filterencours= function() { $scope.Filter_Alm = { ARI : 3 , AMA : 2, AMI : 1 , ADC : 10 , P : 2 , PA : 1 , D : 0 }}
$scope.filtertoutes = function() { $scope.Filter_Alm = { ARI : 3 , AMA : 2, AMI : 1 , ADC : 10 , P : 2 , PA : 1 , D : 3 }}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function calculate_title()
{
  if ($scope.List_AL.length >0 && $scope.mode == 1) $scope.titre_vue = "<div class='main-title' style='line-height: 1.6;padding-top:0px'>Journal des Alarmes</div><div class='sub-title' style='line-height: .6;font-size: 12px;color: #315286;'> " + $scope.$eval('(List_AL| filter:filtercriticite| filter : filteretat | filter : search).length') + " alarmes</div>"
  if ($scope.List_AL.length >0 && $scope.mode == 2) $scope.titre = "<div class='main-title' style='line-height: 1.6;padding-top:0px'>CT " + $rootScope.Selected_CT + "</div><div class='sub-title' style='line-height: .6;font-size: 12px;color: #315286;'> " + $scope.$eval('(List_AL| filter:filtercriticite| filter : filteretat | filter : search).length') + " alarmes</div>"

}

$scope.$watch('search', function(oldVal, newVal)
{ calculate_title() });

$scope.$watchCollection('Filter_Alm', function(newValues, oldValues) {
calculate_title()  });

$scope.$watchCollection('Filter_Alm_local', function(newValues, oldValues) {
calculate_title()  });


$scope.ACK = function(item)
{
  // console.log(item)
  if (!item.Ack)
  {item.Mode = 'Write';
  item.Type = 'ACK'
  socket.emit(P.SOCKET.ALQ, item);
  console.log(item)
  window.fabric && window.fabric.Answers.sendCustomEvent("AlarmeACK", { "M" : item.M  });
  }
  else
  console.log('Alarme déja acquitée')
  // console.log({ Mode : 'Write' , Type : 'ACK', NodeId : item.NodeId })
}

$scope.expand_AL = function(item) {
        if ($scope.isItemExpanded(item)) {
          $scope.shownItem = null;
        } else {
          $scope.shownItem = item.M;
        }
      };

$scope.isItemExpanded = function(item) {
  // console.log("shownitem : " + $scope.shownItem)
        return $scope.shownItem === item.M;
      }

socket.removeListener(P.SOCKET.OGU);
socket.on(P.SOCKET.OGU, function(data){
   console.log(data)
  if (data.id == 'Synthese.PresentCount')
  $scope.Synthese_PresentCount = data.value;
    console.log($scope.Synthese_PresentCount)
});

////////////////// Toutes les alarmes ////////////////////////////
$scope.Refresh1 = function() //Exécuté lors du Pull-to-Refresh et Initiation du controlleur-vue (ng-init)
{
    $scope.mode = 1// 1 <=> Toutes alarmes (alarmes.html) , 2 <=> Alarmes du CT ( CTalm.html)
    $scope.Filter_Alm_local = { ARI : 3 , AMA : 2, AMI : 1 , ADC : 10 , P : 2 , PA : 1 , D : 0 };
    $scope.Filter_Alm = { ARI : 3 , AMA : 2, AMI : 1 , ADC : 10 , P : 2 , PA : 1 , D : 0 };
    $scope.titre_vue = "Journal des Alarmes"
    console.log("mode 1 ")
    $rootScope.Selected_CT = 'null'
    socket.emit(P.SOCKET.ALQ , { Mode : 'Read' });
    window.fabric && window.fabric.Answers.sendContentView("Alarmes", "Vue", "1");


}//Demande mise à jour listes Alarmes

///////////////////// Alarmes du CT ////////////////////////////////
$scope.Refresh2 = function() //Exécuté lors du Pull-to-Refresh et Initiation du controlleur-vue (ng-init)
{
  // $( ".bar.title" ).css({'cssText': 'margin : 0 !important;'});
     if (!$rootScope.Selected_CT || $rootScope.Selected_CT=='null')  $state.go('app.CT'); //Redirect to CT
   console.log( "mode 2 ")
   $scope.Filter_Alm_local = { ARI : 3 , AMA : 2, AMI : 1 , ADC : 10 , P : 2 , PA : 1 , D : 3 };
   $scope.Filter_Alm = { ARI : 3 , AMA : 2, AMI : 1 , ADC : 10 , P : 2 , PA : 1 , D : 3 };
   $scope.mode = 2
   $scope.titre_vue = "Alarmes"
   $scope.titre  =  $rootScope.Selected_CT ;
   socket.emit(P.SOCKET.ALQ , { Mode : 'Read' , Selected_CT : $rootScope.Selected_CT });
   window.fabric && window.fabric.Answers.sendContentView("Alarmes", "Vue", "2" , { "CT" : $rootScope.Selected_CT });


}//Demande mise à jour listes Alarmes

// $scope.$watch(['Synthese_PresentCount'], function(newValue, oldValue) {
// console.log("OPC Present NBR :" + $scope.Synthese_PresentCount)

// });

//Reception des Alarmes depuis OPC
socket.removeListener(P.SOCKET.ALA);

socket.on(P.SOCKET.ALA, function(data){
  console.log(data)
  if (data && data.length == 1 && data[0].Ack == true)
  {
    var i = $scope.List_AL.findIndex((obj) => (obj.M === data[0].M ));
    $scope.List_AL[i] == data
  }
  else {
    $scope.List_AL = data //Met à jour la liste
    calculate_title()
  }

  $ionicLoading.hide(); //enleve le spinner
  $scope.$broadcast('scroll.refreshComplete');//Stop the ion-refresher from spinning
  $ionicListDelegate.closeOptionButtons();
   });

}])


.controller('GFctrl', ['$ionicListDelegate','$ionicModal','$ionicLoading', '$rootScope', '$scope', 'socket', '$state', 'P', function($ionicListDelegate, $ionicModal, $ionicLoading, $rootScope, $scope, socket, $state, P) {


  window.fabric && window.fabric.Answers.sendContentView("ListeGF", "Vue", "1" , { "CT" : $rootScope.Selected_CT , "PT" : $rootScope.Selected_PT });

  $scope.$ionicGoBack = function(backCount) {
    $state.transitionTo('app.CT');
  };

  $scope.titre_vue = "Synthèse"
  $scope.shownItem_chart = 0 ;

  $scope.ALM = function (A,B,C)
  {
    $rootScope.Selected_NomGrp = A;
    $rootScope.Selected_DesGrp = B;
    $rootScope.Selected_LibGrp = C
  }

  $ionicModal.fromTemplateUrl('templates/N1/modalT.html', function(modal) {
    $scope.modalT = modal;
    }, {
    scope: $scope,  /// GIVE THE MODAL ACCESS TO PARENT SCOPE
    animation: 'slide-in-up',//'slide-left-right', 'slide-in-up', 'slide-right-left'
    focusFirstInput: true
    });

  if(!$rootScope.Selected_CT)  $state.go('app.CT'); //Redirect to CT
  //
  $ionicLoading.show({
  content: 'Loading', animation: 'fade-in', showBackdrop: true,
  duration: 15000, maxWidth: 200,  showDelay: 200
  });

  $scope.PH_open = function(PT,NomGrp,DesGrp,LibGrp)
  {
    $rootScope.Selected_PT = PT;
    $rootScope.Selected_LibGrp = LibGrp;
    $rootScope.Selected_NomGrp = NomGrp;
    $rootScope.Selected_DesGrp = DesGrp;
    $rootScope.Selected_GF = $rootScope.Selected_PT + $rootScope.Selected_NomGrp + $rootScope.Selected_DesGrp;
    $state.go("app.PHtr")
  }

  $scope.Consigne_Grp = function (LibGrp,NomGrp,DesGrp)
      {
        $rootScope.Selected_LibGrp = LibGrp;
        $rootScope.Selected_NomGrp = NomGrp;
        $rootScope.Selected_DesGrp = DesGrp;
        $rootScope.Vue = 2 ;
        $state.go('app.CTcon');
      };

  $scope.Fonc_Grp= function (LibGrp,NomGrp,DesGrp)
  {
    $rootScope.Selected_LibGrp = LibGrp;
    $rootScope.Selected_NomGrp = NomGrp;
    $rootScope.Selected_DesGrp = DesGrp;
    $rootScope.Vue = 1 ;
    $state.go('app.CTcon');

  }

  $scope.List_GF = []
  $scope.loaded = false;
  // console.log($rootScope.Selected_CT)

  $scope.expand_AL = function(item) {
            if ($scope.isItemExpanded(item)) {
              $scope.shownItem = null;
            } else {
              $scope.loaded = false;
              $scope.chart[0] = []
              $scope.chart[1] = []
              $scope.options.scales.yAxes[0].display=false
              $scope.options.scales.yAxes[1].display=false
              $scope.shownItem = item;
              // if (item.NGF == "CIRCU") socket.emit(P.SOCKET.CHQ , { Selected_CT : $rootScope.Selected_CT , Selected_PT : $rootScope.Selected_PT , NGF : item.NGF , DGF : item.DGF} )
              socket.emit(P.SOCKET.CHQ , { Selected_CT : $rootScope.Selected_CT , Selected_PT : $rootScope.Selected_PT , NGF : item.NGF , DGF : item.DGF} )
            }
          };

    $scope.isItemExpanded = function(item) {
        return $scope.shownItem === item;
    };

    $scope.showTmp= function(T)
    {
        return (T && (parseFloat(T) + 20.0 > 0))
    }

    $scope.showSpiner= function(item)
    {

        return ($scope.isItemExpanded(item) && !$scope.loaded)
    }

    $scope.showGraphs= function(item)
    {
        // console.log(item)
        return ($scope.isItemExpanded(item) && ( item.C1.length > 0  || item.C2.length > 0 ) &&  $scope.loaded)
    }

    $scope.notmp= function(item)
    {
      console.log(!item.T1 && !item.T2)
      return !(item.T1 || item.T2) //true if no tmp at all
    }

    $scope.Refresh = function() //Exécuté lors du Pull-to-Refresh et Initiation du controlleur-vue (ng-init)
    {
        socket.emit(P.SOCKET.GFQ , { Selected_CT : $rootScope.Selected_CT , Selected_PT : $rootScope.Selected_PT} );
        console.log({ Selected_CT : $rootScope.Selected_CT , Selected_PT : $rootScope.Selected_PT})
    }

    socket.removeListener(P.SOCKET.GFA);
    socket.on(P.SOCKET.GFA ,function(data){
      console.log(data)
    $scope.List_GF = data.LIST ; //Met à jour la liste
    $rootScope.TMP_EXT = data.INFO.TMP_EXT
    $ionicLoading.hide(); //enleve le spinner
    $scope.$broadcast('scroll.refreshComplete'); //Stop the ion-refresher from spinning
    });

    var data1_present, data2_present;
    var Min1,Max1,Min2,Max2 ;
    $scope.chart = []
    $scope.colors = ['#000000', '#A3A3A3']
    $scope.loaded = false

    //Reception des courbes
    socket.removeListener(P.SOCKET.CHA1);
    socket.on(P.SOCKET.CHA1, function(data){

          console.log(data)
          if ('NGF' in data[data.length-1]) var info = data.pop() // { NGF : , DGF : }
          console.log(info)
          var i = $scope.List_GF.findIndex((obj) => (obj.NGF === info.NGF && obj.DGF === info.DGF));
          $scope.List_GF[i].C1 = data
          // console.log($scope.List_GF[i])
          if ($scope.List_GF[i].C1 && $scope.List_GF[i].C1.length > 0) {
          // for (j=0 ; j< data.length ; j++)
          // $scope.List_GF[i].C1[j].x = new Date(data[j].x)
          $scope.chart[0] = $scope.List_GF[i].C1
          $scope.options.scales.yAxes[0].display = true
          }
          // else
      //  Max1=  Math.max($scope.List_GF[i].C1)
      //  Min1 =  Math.min($scope.List_GF[i].C1)
      $scope.loaded = true

    });

    socket.removeListener(P.SOCKET.CHA2);
    socket.on(P.SOCKET.CHA2, function(data){
          console.log(data)
          if ('NGF' in data[data.length-1]) var info = data.pop()
          var i = $scope.List_GF.findIndex((obj) => (obj.NGF === info.NGF && obj.DGF === info.DGF));
          $scope.List_GF[i].C2 = data
          console.log($scope.List_GF[i])
          if ($scope.List_GF[i].C2 && $scope.List_GF[i].C2.length > 0) {
          // for (j=0 ; j< data.length ; j++)
          // $scope.List_GF[i].C2[j].x = new Date(data[j].x)
          if($scope.List_GF[i].T1)
          {
          $scope.chart[1] = $scope.List_GF[i].C2
          console.log($scope.chart)
          $scope.options.scales.yAxes[1].display = true
          }
          else
          {
            $scope.chart[0] = $scope.List_GF[i].C2
            console.log($scope.chart)
            $scope.options.scales.yAxes[0].display = true
          }
          }
          // else
          // $scope.chart[1] = []
      //  Max1=  Math.max($scope.List_GF[i].C1)
      //  Min1 =  Math.min($scope.List_GF[i].C1)
        $scope.loaded = true
    });
//
// socket.on(P.SOCKET.CHA2, function(data){
//   if (!$scope.shownItem_chart2)
//   {
//     var info = data.pop() // { NGF : , DGF : }
//     var i = $scope.List_GF.findIndex((obj) => (obj.NGF === info.NGF && obj.DGF === info.DGF));
//     $scope.shownItem_chart2 = true
//     $scope.List_GF[i].C2 = data;
//     if ($scope.List_GF[i].C2) $scope.chart[1] = $scope.List_GF[i].C2
//     console.log($scope.chart)
//    Max2=  Math.max($scope.List_GF[i].C2)
//    Min2 =  Math.min($scope.List_GF[i].C2)
//   }
// });
$scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2'}]
$scope.options = {
     elements: {
             point: {
                   radius: 0
                   }
              },

      scales: {  yAxes: [   {
                            id: 'y-axis-1',
                            type: 'linear',
                            display: true,
                            position: 'left'
                            }
                        ,{
                        id: 'y-axis-2',
                        type: 'linear',
                        display: true,
                        position: 'right'
                        }
                      ],
                 xAxes: [{
                            type : 'time',
                            time: {
                                 unit : 'hour',
                                 distribution: 'linear',
                                 bounds: 'data',
                                 displayFormats: {
                                    hour: 'HH:mm'
                                            }
                                 }
                        }]
              }

              // animation: {
              //         duration: 2000,
              //         onProgress: function(animation) {
              //         progress.value = animation.currentStep / animation.numSteps;
              //         },
              //         onComplete: function(animation) {
              //         window.setTimeout(function() {
              //         progress.value = 0;
              //         }, 2000);
              //         }
              //   }


  };

                // ticks: {
                // suggestedMin: Math.min(Min1,Min2),
                // suggestedMax: Math.max(Max1,Max2)
                // }
}])


.controller('StaCtrl', ['$ionicLoading', '$scope', '$rootScope', '$state', 'socket', 'P', function($ionicLoading, $scope, $rootScope,$state,socket, P) {


  $scope.$ionicGoBack = function(backCount) {
    $state.transitionTo('app.CTsyn');
  };

  if(!$rootScope.Selected_CT)  $state.go('app.CT'); //Redirect to CT

  $scope.List_Sta = [] ;

  $ionicLoading.show({
  content: 'Loading', animation: 'fade-in', showBackdrop: true,
  duration: 10000, maxWidth: 200,  showDelay: 0
  });

  $scope.Refresh = function() //Exécuté lors du Pull-to-Refresh et Initiation du controlleur-vue (ng-init)
  { $scope.titre_vue = "Etat";
    $scope.Vue = 1
    socket.emit(P.SOCKET.SQ , { Mode : "Read" , Selected_CT : $rootScope.Selected_CT });
    window.fabric && window.fabric.Answers.sendContentView("Etat","Vue","1", { "CT" :  $rootScope.Selected_CT });
  }

  $scope.Refresh2 = function() //Exécuté lors du Pull-to-Refresh et Initiation du controlleur-vue (ng-init)
  { $scope.titre_vue = "Synthèse bat.";
    $scope.Vue = 2
    socket.emit(P.SOCKET.SQ , { Mode : "Read_Bat" , Selected_CT : $rootScope.Selected_CT });
    window.fabric && window.fabric.Answers.sendContentView("SynthBat","Vue","1", { "CT" :  $rootScope.Selected_CT });

  }

  socket.removeListener(P.SOCKET.SA);
  socket.on(P.SOCKET.SA , function(data) {
  console.log(data);
  if($scope.Vue == 1 )
  $scope.List_Sta = data //Met à jour la liste
  else
  $scope.List_Sta = data[0]
  $ionicLoading.hide(); //enleve le spinner
  $scope.$broadcast('scroll.refreshComplete');//Stop the ion-refresher from spinning

  });

  socket.removeListener(P.SOCKET.SA2);
  socket.on(P.SOCKET.SA2 , function(data) {
  console.log(data);
  $scope.List_Sta = data //Met à jour la liste
  $ionicLoading.hide(); //enleve le spinner
  $scope.$broadcast('scroll.refreshComplete');//Stop the ion-refresher from spinning
  });

  $scope.Write= function (item)
  {
  // console.log(item)
  item.Mode = "Write";
  socket.emit(P.SOCKET.CQ, item );
  }

}])

.controller('PHCtrl', ['$localStorage','$ionicListDelegate', '$ionicPopover','$ionicLoading', '$scope', '$rootScope', '$state', 'socket', 'P' , '$http' , '$ionicModal', function($localStorage, $ionicListDelegate, $ionicPopover, $ionicLoading, $scope, $rootScope,$state,socket, P, $http, $ionicModal) {



     var URL ;
     // if (window.cordova) // Mobile APP
      URL = $localStorage.Srv.url

      $http.get(URL + '/api/Raison')
           .success(function(data) {
                    $rootScope.Raison = data ;
                    // console.log(data)
            })
           .error(function(data) {
             console.log('Error: ' + data);
           });

      //Vue initiale
      $scope.vue = 1
      $scope.menu = P.POP_PH.GLOBAL[0].name

      // $scope.menu = P.POP_PH.GLOBAL[$scope.vue - 1].name
      $ionicLoading.show({ //Spinner au chargement initial
      content: 'Loading', animation: 'fade-in', showBackdrop: true,
      duration: 10000, maxWidth: 200,  showDelay: 0
      });

      function Del_Offset(date) //Supprime l'offset du fuseau horaire
      {  return new Date(date.getTime() + (60000 * date.getTimezoneOffset())) ; }

      function Add_Offset(date) //Rétablit l'offset du fuseau horaire
      {   return new Date(date.getTime() - (60000 * date.getTimezoneOffset())) ; }

      $ionicModal.fromTemplateUrl('templates/N2/edit_modal.html', {
         scope: $scope,
         animation: 'slide-in-up'
       }).then(function(modal) {
         $scope.edit_modal = modal;
       });

         $ionicModal.fromTemplateUrl('templates/N2/apply_EG.html', {
            scope: $scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
            $scope.eg_modal = modal;
          });

       $ionicModal.fromTemplateUrl('templates/N2/add_modal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.add_modal = modal;
        });

       $scope.getdayName = function(day)
       {
         var h = $scope.daySelect.findIndex((obj) => obj.number == day)
         return $scope.daySelect[h].day
       }

       $scope.open_eg_modal = function() {
         $ionicListDelegate.closeOptionButtons();
         // liste des exception globales totales avec check pour ceux appliquées sur le GF en cours
            $http.post(URL + '/api/LIST_EG_GF' , { EG : $rootScope.Selected_GF } )
                 .success(function(data) {
                        console.log(data)
                        $scope.LIST_EG = data.map((obj) => {
                          if(obj.C == 1) obj.C = true
                          if(obj.C == 0) obj.C = false
                          return obj
                        })
               }).error(function(data) {
                       console.log('Error: ' + data);
               });

         $scope.eg_modal.show();
       };

       $scope.open_add_modal = function() {
         $ionicListDelegate.closeOptionButtons();
         $scope.add_EL = {
                          raison: '',
                          heureDebut : new Date() ,
                          heureFin : new Date() ,
                          dateException : new Date() ,
                          GF : $rootScope.Selected_GF
                          // idTrancheRemplace : item.idTrancheRemplace ,
                          // idTranche :item.idTranche ,
                          // typeTranche : item.typeTranche,
                          // day : item.numJourSemaine,
                          // dayName : $scope.getdayName(item.numJourSemaine)
           }
           console.log( $scope.add_EL )

         // if (item.id) $scope.tmp_EL.idTranche = item.id
         $scope.add_modal.show();
         // console.log($scope.tmp_EL)
       };

       $scope.open_edit_modal = function(item) {
         console.log(item)
         $ionicListDelegate.closeOptionButtons();

         $scope.tmp_EL = {
                          raison: item.idException,
                          heureDebut : Del_Offset(new Date(item.heureDebut)) ,
                          heureFin : Del_Offset(new Date(item.heureFin)) ,
                          dateException : new Date(item.laDate) ,
                          GF : $rootScope.Selected_GF ,
                          idTrancheRemplace : item.idTrancheRemplace ,
                          idTranche :item.idTranche ,
                          typeTranche : item.typeTranche,
                          day : item.numJourSemaine,
                          dayName : $scope.getdayName(item.numJourSemaine)
           }

         if (item.id) $scope.tmp_EL.idTranche = item.id
         $scope.edit_modal.show();
         console.log($scope.tmp_EL)
       };

       $scope.Del_EL = function(item) {
         item.Login = $localStorage.currentUser.user.user_sql //ajout du login
         if ($scope.vue == 2) //Tranches recurrentes
             {
              item.idTranche = item.id

             $http.post( URL  + '/api/TR/Del' ,  item )
             .success(function() {
             get_event()
             });
             }
             else {
             $http.post( URL  + '/api/EL/Del' , item )
             .success(function() {
              get_event()
              });
             }
        }


        $scope.daySelect = [
          { day : 'Lundi' , number : 1 },
            { day : 'Mardi' , number : 2 },
              { day : 'Mercredi' , number : 3 },
                { day : 'Jeudi' , number : 4 },
                  { day : 'Vendredi' , number : 5 },
                    { day : 'Samedi' , number : 6 },
                      { day : 'Dimanche' , number : 7 }
        ]


       $scope.apply_EG_State = function(item)
       {
         console.log(item)
         if(item.C)
            $http.post(URL  + '/api/EG/Check_EG_GF' , {C : 1, EG : item.EG, ID : $rootScope.Selected_GF, Login : $localStorage.currentUser.user.user_sql} )
                  .success(() => {
                     $rootScope.notify('Exception globale appliquée')
                     get_event()
                  })
          else
              $http.post(URL  + '/api/EG/Check_EG_GF' , {C : 0, EG : item.EG, ID : $rootScope.Selected_GF, Login : $localStorage.currentUser.user.user_sql} )
                    .success(() => {
                       $rootScope.notify('Exception globale enlevée')
                       get_event()
                    })
       }
       // liste des exception globales totales avec check pour ceux appliquées sur le GF en cours

       $scope.Edit_EL = function() {

           $ionicLoading.show({ //Spinner au chargement initial
           content: 'Loading', animation: 'fade-in', showBackdrop: true,
           duration: 10000, maxWidth: 200,  showDelay: 0
           });

           $scope.tmp_EL.heureDebut = Add_Offset($scope.tmp_EL.heureDebut)
           $scope.tmp_EL.heureFin = Add_Offset($scope.tmp_EL.heureFin)
           $scope.tmp_EL.dateException =  Add_Offset($scope.tmp_EL.dateException)
           var SEND = $scope.tmp_EL;
          //  console.log($scope.tmp_EL)
           SEND.raison = SEND.idException
           SEND.Login = $localStorage.currentUser.user.user_sql
           if ($scope.vue == 2)
           { //Evenement Recurrent Modification
             console.log(SEND)
             $http.post(URL + '/api/TR/Update' , SEND )
                  .success(function(data) {
                        $scope.edit_modal.hide();
                        get_event()
                }).error(function(data) {
                        console.log('Error: ' + data);
                });
            }
            else {
              if($scope.tmp_EL.typeTranche == 1)
              {
                $http.post( URL  + '/api/EL/Add' , SEND )
                     .then(function() {
                          $scope.edit_modal.hide();
                          get_event()
                     });
              }
              else {
                    $http.post(URL + '/api/EL/Update' , SEND )
                         .success(function(data) {
                                  $scope.edit_modal.hide();
                                  get_event()
                       }).error(function(data) {
                                  console.log('Error: ' + data);
                                });

                  }
             }
        }

        $scope.Add_EL = function() {
            console.log($scope.add_EL)
            $ionicLoading.show({ //Spinner au chargement initial
            content: 'Loading', animation: 'fade-in', showBackdrop: true,
            duration: 10000, maxWidth: 200,  showDelay: 0
            });

            $scope.add_EL.heureDebut = Add_Offset($scope.add_EL.heureDebut)
            $scope.add_EL.heureFin = Add_Offset($scope.add_EL.heureFin)
            $scope.add_EL.dateException = Add_Offset($scope.add_EL.dateException)
            var SEND = $scope.add_EL;
           //  console.log($scope.tmp_EL)
            // SEND.raison = SEND.idException
            SEND.Login = $localStorage.currentUser.user.user_sql
            if ($scope.vue == 2)
            { //Evenement Recurrent Ajout
              console.log(SEND)
              $http.post(URL + '/api/TR/Add' , SEND )
                   .success(function(data) {
                         $scope.add_modal.hide();
                         get_event()
                         $rootScope.notify("Tranche récurrente ajoutée")
                 }).error(function(data) {
                         console.log('Error: ' + data);
                 });
             }
             else {

                 $http.post( URL  + '/api/EL/Add' , SEND )
                 .success(function(data) {
                          $scope.add_modal.hide();
                          get_event()
                          $rootScope.notify("Exception locale ajoutée")
                          }).error(function(data) {
                                console.log('Error: ' + data);
                          });
               }
         }

       $scope.close_edit_modal = function() {
         $scope.edit_modal.hide();
         $scope.add_modal.hide();
         $scope.eg_modal.hide();
       };

       $scope.get_raison = function(id_raison)
       {
        var i = $rootScope.Raison.findIndex((obj => obj.id == id_raison));
        if (i ==-1)
         return ""
        else
        return $rootScope.Raison[i].raison
       }

      $ionicPopover.fromTemplateUrl('templates/N2/pop_PH.html', {
      scope: $scope,
      }).then(function(popover) {
      $scope.pop_PH = popover;
      });

      $scope.pop_PH_open = function ($event)
      {
          $scope.pop_PH.show($event)
      }

      $scope.pop_PH_close = function (item)
      {
          $scope.pop_PH.hide()
          $scope.vue = item.vue
          $scope.menu = item.name
          get_event()
      }

      //
      // $scope.filterVC_ER = function(obj) {
      //   return ($scope.vue == 2 && obj.typeTranche == 1)||($scope.vue ==1 && ( obj.typeTranche == 2 || obj.typeTranche == 3 ||  obj.typeTranche == 5 ) )
      // }

      $scope.getStyle = function(Type){
          return {'background-color': P.PH.COLOR[Type] };
        }

      // var jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi" ]
      // var jours_min = ["Dim" , "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam" ]
      // var mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"]
      // if(!$rootScope.Selected_CT)  $state.go('app.CT'); //Redirect to CT
      var d_start = new Date() // Monday Week Start
      d_start.setDate(d_start.getDate() - (d_start.getDay() + 6) % 7 )
      console.log(d_start)

      var d_end =  new Date() // sunday of the same Week
      d_end.setDate(d_end.getDate() - (d_end.getDay() + 6) % 7 + 6 )
      console.log(d_end)

      // RefreshDate() ; //init date

      $scope.previous_week = function () { //Monday and sunday of the previous week
      d_start.setDate(d_start.getDate() - 7 )
      d_end.setDate(d_end.getDate() - 7 )
      // console.log(d_start + " _ " + d_end)
      RefreshDate() ;
      }

      $scope.next_week = function () {
      d_start.setDate(d_start.getDate() +7 )
      d_end.setDate(d_end.getDate()  + 7 )
      // console.log(d_start + " _ " + d_end)
      RefreshDate() ;
      }


      function RefreshDate() {
      get_event();
      if (d_start.getMonth() == d_end.getMonth())
      $scope.interval = "Du " + d_start.getDate() + " au " + d_end.getDate() + " " + P.PH.DATE.mois[d_end.getMonth()]
      else
      $scope.interval = "Du " + d_start.getDate() + " " + P.PH.DATE.mois[d_start.getMonth()] +  " au " + d_end.getDate() + " " + P.PH.DATE.mois[d_end.getMonth()]
      }

      $scope.List_CT = [] ;
      $scope.Tranches = [] ;

     function get_event()
     {
        // console.log('GETEVENT')
        $ionicLoading.show({
        content: 'Loading', animation: 'fade-in', showBackdrop: true,
        duration: 5000, maxWidth: 200,  showDelay: 100
        });

        var Period = {
                  dateDebut_Day : d_start.getUTCDate(),
                  dateDebut_Month : d_start.getUTCMonth()  ,
                  dateDebut_Year : d_start.getUTCFullYear() ,
                  dateFin_Day : d_end.getUTCDate() ,
                  dateFin_Month : d_end.getUTCMonth()  ,
                  dateFin_Year : d_end.getUTCFullYear()
                }

        var SEND = { ID : $rootScope.Selected_GF , Period : Period }


         if ($scope.vue == 1)  {
               $http.post(URL + '/api/event' , SEND )
                   .success(function(data) {
                        console.log(data)
                        $scope.Tranches = data ;
                        $ionicLoading.hide(); //enleve le spinner
                        $scope.$broadcast('scroll.refreshComplete');//Stop the ion-refresher from spinning
                  }).error(function(data) {
                        console.log('Error: ' + data);
                  });
          }
         else {
               $http.post(URL + '/api/event_ER' , SEND )
                    .success(function(data) {
                            console.log(data)
                            $scope.Tranches = data ;
                            $ionicLoading.hide(); //enleve le spinner
                            $scope.$broadcast('scroll.refreshComplete');//Stop the ion-refresher from spinning
                  }).error(function(data) {
                            console.log('Error: ' + data);
                          });
            }
     }



  $scope.get_day = function (date)
  {
     // console.log(date)
     var dat = new Date(date)
     if ($scope.vue == 1 )
     return P.PH.DATE.jours_min[dat.getDay()]
     else return P.PH.DATE.jours[date- 1]
  }

  $scope.expand_CT = function(item) {
          if ($scope.isItemExpanded(item)) {
            $scope.shownItem = null;
          } else {
            $scope.shownItem = item.CT;
          }
        };

  $scope.isItemExpanded = function(item) {
    // console.log("shownitem : " + $scope.shownItem)
          return $scope.shownItem === item.CT;
        };

  $scope.Refresh1 = function() //Exécuté lors du Pull-to-Refresh et Initiation du controlleur-vue (ng-init)
  {
       $scope.titre_vue = "Programmes Horaires";
       socket.emit(P.SOCKET.PHQ , { Mode : "CT" , username : $localStorage.currentUser.user.user_sql } )
        window.fabric && window.fabric.Answers.sendContentView("ListePH","Vue", "1");
   }

   $scope.Refresh2 = function() //Exécuté lors du Pull-to-Refresh et Initiation du controlleur-vue (ng-init)
   {

   if(!$rootScope.Selected_GF)  $state.go('app.PH'); //Redirect to CT
  //////////////////////////////////////////
   if ($state.current.url == "/PHtr") RefreshDate() ;
   // get_event()
   $scope.titre_vue = "<div class='main-title' style='line-height: 1.6;padding-top:2px'>CT " + $rootScope.Selected_CT + "</div><div class='sub-title' style='line-height: .6;font-size: 12px;color: #315286;'> " + $rootScope.Selected_LibGrp + "</div>";
   socket.emit(P.SOCKET.PHQ , { Mode : "TR" , CT : $rootScope.Selected_CT  , NGF : $rootScope.Selected_NomGrp , DGF : $rootScope.Selected_DesGrp , ID : $rootScope.Selected_GF} )
   window.fabric && window.fabric.Answers.sendContentView("PH","Vue", "2", { "CT" : $rootScope.Selected_CT , "GF" : $rootScope.Selected_GF });

   }

  $scope.PH_CT_GF = function (A,B,C,D,E)
  {
    $rootScope.Selected_CT = A ;
    $rootScope.Selected_LibGrp = B ;
    $rootScope.Selected_NomGrp = C ;
    $rootScope.Selected_DesGrp = D ;
    $rootScope.Selected_GF = E ;
    console.log($rootScope.Selected_GF)
    $state.go('app.PHtr');
  }

  socket.removeListener(P.SOCKET.PHA1);
  socket.on(P.SOCKET.PHA1 , function(data) {
    console.log(data) //remplit la liste de CT avec les GF correspondants depuis la requete
    var CT_Actuel
    var CT_Precedant;
    var j = 0 ;
    CT_Precedant = data[0].L ;
    $scope.List_CT.push( { CT : data[0].L , GF : [{ DGF : data[0].DGF , NGF : data[0].NGF , LG : data[0].LG , ID : data[0].ID}] })
    for (i=1 ; i< data.length; i++)
    {
      CT_Actuel = data[i].L ;
      if (CT_Actuel != CT_Precedant)
      {
        $scope.List_CT.push( { CT : data[i].L , GF : [{ DGF : data[i].DGF , NGF : data[i].NGF , LG : data[i].LG , ID : data[i].ID }] })
        CT_Precedant = CT_Actuel ;
        j++;
      }
      else
      {
      $scope.List_CT[j].GF.push( { DGF : data[i].DGF , NGF : data[i].NGF , LG : data[i].LG , ID : data[i].ID } )

      }
    }
    // console.log($scope.List_CT)
  $ionicLoading.hide(); //enleve le spinner
  $scope.$broadcast('scroll.refreshComplete');//Stop the ion-refresher from spinning
  });


}])


.controller('AdminCtrl', ['$rootScope','$ionicHistory','$window','$state','$scope', 'socket', '$ionicLoading', 'P','$localStorage', function($rootScope, $ionicHistory ,$window ,$state, $scope, socket, $ionicLoading, P, $localStorage) {

  setTimeout(function (){
    $rootScope.Refresh_admin()
  }, 1000);

  $scope.selected_Srv = $localStorage.Srv

  $scope.Srv_Change = function (N,O)
  {

  $localStorage.Srv = N
  $localStorage.Srv_url = N.url
  $scope.unlog()
  $ionicLoading.show({
  content: 'Loading', animation: 'fade-in', showBackdrop: true,
  duration: 50000, maxWidth: 200,  showDelay: 0
  });

  setTimeout(function (){
      $window.location.reload(true)
  }, 400);

  }

  if (window.cordova) // Mobile APP
   $scope.selectables = P.PARAM.SRV
   else $scope.selectables = P.PARAM.SRV_LOCAL

  $scope.getOption = function(option){
    return option['id']
  };

  $scope.$storage = $localStorage
  console.log($scope.$storage)

  if(!window.cordova)
  $rootScope.Connected = true




    // $scope.$watch('$viewContentLoaded', function(event)
  // {
  //   console.log("Viewloaded")
  //   if ($rootScope.Connected)
  //   socket.emit(P.SOCKET.SRVQ);
  //  });

  // if ($rootScope.Connected)
  //   socket.emit(P.SOCKET.SRVQ);

// $ionicLoading.show({
// content: 'Loading', animation: 'fade-in', showBackdrop: true,
// duration: 300, maxWidth: 200,  showDelay: 0
// });
// socket.on(P.SOCKET.CU, function(data) {
// // if( data.Type == 'TR' && data.Value && data.Value.toString().length >= 6 )
// // data.Value  = Math.round(data.Value).toFixed(2);
// console.log(data)
// var i = $scope.List_Cons.findIndex(function(obj) { obj.M == data.M});
// console.log(i)
// // if (i != -1 )  // -1 ==> unfound
// // $scope.List_Cons[i] = data ;
// });

  $rootScope.Refresh_admin = function()
  {
    window.fabric && window.fabric.Answers.sendContentView("Administration", "Vue", "1");

    if ($rootScope.Connected)
   { console.log("emited")
    socket.emit(P.SOCKET.SRVQ);
    socket.removeListener(P.SOCKET.SRVA);
    socket.on(P.SOCKET.SRVA, function(data) {
    console.log("event received")
    $rootScope.STATUS = data[0] ;
    console.log(data[0])
    $scope.$broadcast('scroll.refreshComplete');//Stop the ion-refresher from spinning
    });

  }
    else
    {
    $rootScope.$broadcast('scroll.refreshComplete');//Stop the ion-refresher from spinning
    }
   }


   }])

//
// .controller('Launcher', ['$scope', function($scope) {
//   $scope.data = {
//      "launched" : "No"
//  };
//
//  $scope.reportAppLaunched = function(url) {
//      console.log("App Launched Via Custom URL");
//       console.log(url)
//
//       $scope.$apply( function() {
//          $scope.data.launched = "Yes";
//        })
//   }

// }])
