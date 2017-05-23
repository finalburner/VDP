controllers.controller("AppCtrl",["$rootScope","$scope","$ionicModal","$stateParams","$timeout","socket","$state","P","ConnectivityMonitor","Notif","AuthService",function(a,b,c,d,e,f,g,h,i,j,k){i.startWatching(),f.on(h.SOCKET.CO,function(){f.emit(h.SOCKET.CC),j.Show("Connecté")}),b.list_N1=h.MODAL_N1,b.Cnx={username:"",password:""},b.currentUser=null,b.userRoles=h.USER_ROLES,b.isAuthorized=k.isAuthorized,b.setCurrentUser=function(a){b.currentUser=a},b.login=function(c){g.go("app.CT"),k.login(c).then(function(c){a.$broadcast(h.AUTH_EVENTS.loginSuccess),b.setCurrentUser(c),g.go("app.CT")},function(){a.$broadcast(h.AUTH_EVENTS.loginFailed)})},b.unlog=function(){a.$broadcast(h.AUTH_EVENTS.logoutSuccess),b.setCurrentUser(null),g.go("login")},c.fromTemplateUrl("templates/N0/login.html",function(a){b.modalCnx=a},{scope:b,animation:"slide-in-up",focusFirstInput:!0}),c.fromTemplateUrl("templates/N1/modalN1.html",function(a){b.modalN1=a},{scope:b,animation:"slide-in-up",focusFirstInput:!0}),b.CT_N1=function(b,c){a.Selected_CT=c,g.go("app.CTsyn")},b.closeN1=function(a){sel=a,menu_N1=!menu_N1},b.JAL=function(){a.Selected_CT="null"},b.N1_open=function(c,d){b.modalN1.show(),b.modalN1.name=c,b.modalN1.AL_Color=d,b.modalN1.animation="slide-left-right",a.Selected_CT=c},b.N1_close=function(a){b.modalN1.hide()}}]).controller("ConCtrl",["$scope","socket","$ionicLoading","$rootScope","$state","P",function(a,b,c,d,e,f){a.Selected_NomGrp=d.Selected_NomGrp,a.Selected_Grp=d.Selected_Grp,a.Validate_Item="",a.list_Cons=[],a.Selected_NomGrp&&a.Selected_Grp||e.go("app.CTsyn"),b.emit(f.SOCKET.CQ,{Mode:"Read",Selected_Grp:d.Selected_Grp,Selected_CT:d.Selected_CT}),b.on(f.SOCKET.CA,function(b){console.log(b),b.Value.toString().length>=6&&(b.Value=Math.round(b.Value).toFixed(2)),ConsIndex=a.list_Cons.findIndex(function(a){a.Mnemo==b.Mnemo}),-1==ConsIndex?a.list_Cons.push(b):a.list_Cons[ConsIndex]=b}),a.Write=function(a){a.Mode="Write",b.emit(f.SOCKET.CQ,a)},a.Analog_Change=function(a){a.Value!=a.Local_Value&&(a.Mode="Write",b.emit(f.SOCKET.CQ,a))}}]).controller("CTfic",["$scope","socket",function(a,b){a.Live_Update=[],b.on("update",function(b){a.Live_Update.push({id:b.id,value:b.value})})}]).controller("CTctrl",["$rootScope","$scope","socket","$ionicLoading","P","$cordovaGeolocation","$ionicSideMenuDelegate",function(a,b,c,d,e,f,g){a.$on("$stateChangeStart",function(a,b,c,d,e){"/carto"==b.url&&g.canDragContent(!1),"/carto"==d.url&&g.canDragContent(!0)});var h=[48.861253,2.32992];b.loc=h;var i={timeout:1e4,enableHighAccuracy:!1};f.getCurrentPosition(i).then(function(a){var c=[a.coords.latitude,a.coords.longitude];b.loc=c,b.marker=c,console.log(b.loc)},function(a){console.log(a)}),d.show({content:"Loading",animation:"fade-in",showBackdrop:!0,duration:700,maxWidth:200,showDelay:0}),b.list_CT=[],c.emit(e.SOCKET.CTQ),c.on(e.SOCKET.CTA,function(a){var c,d;c=e.ALARM.AL_0_Color,a.AL_1&&(c=e.ALARM.AL_1_Color),a.AL_2&&(c=e.ALARM.AL_2_Color),a.AL_3&&(c=e.ALARM.AL_3_Color),a.AL_10&&(c=e.ALARM.AL_10_Color),d={CT:a.localisation,AL_Color:c,LAT:a.LAT,LONG:a.LONG,ADR:a.ADR},ctIndex=b.list_CT.findIndex(function(b){b.localisation==a.localisation}),-1!=ctIndex?b.list_CT[ctIndex]=d:b.list_CT.push(d)}),b.CT_pow="100kW Gaz SED14",b.CT_alm="Message d'information caractérisant l'alarme.Ca peut être long",b.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyB3QWWdY2M8JtbDSSrVriG9lIwD5anCRHo"}]).controller("ALctrl",["$rootScope","$scope","socket","$ionicLoading","P","$state","$stateParams",function(a,b,c,d,e,f,g){b.list_AL=[],b.Synthese_PresentCount=0,b.Filter_Alm,b.ACK=function(a){a.Ack?console.log("Alarme déja acquitée"):(a.Mode="Write",a.Type="ACK",c.emit(e.SOCKET.ALQ,a))},b.expand_AL=function(a){b.isItemExpanded(a)?b.shownItem=null:b.shownItem=a.Mnemo},b.isItemExpanded=function(a){return b.shownItem===a.Mnemo},c.on(e.SOCKET.OU,function(a){"Synthese.PresentCount"==a.id&&(b.Synthese_PresentCount=a.value),console.log(b.Synthese_PresentCount)}),b.$watch(["Synthese_PresentCount"],function(d,f){c.emit(e.SOCKET.ALQ,{Mode:"Read",Selected_CT:a.Selected_CT}),console.log("OPC Present NBR :"+b.Synthese_PresentCount)}),c.on(e.SOCKET.ALA,function(a){a.AL_Color=e.ALARM.AL_0_Color,"1"==a.Criticite&&(a.AL_Color=e.ALARM.AL_1_Color),"2"==a.Criticite&&(a.AL_Color=e.ALARM.AL_2_Color),"3"==a.Criticite&&(a.AL_Color=e.ALARM.AL_3_Color),"10"==a.Criticite&&(a.AL_Color=e.ALARM.AL_10_Color),a.Actif?a.Actif_Label="Présente":a.Actif_Label="Disparue",a.Ack?a.Ack_Label="Acquittée":a.Ack_Label="Non Acquitée",almIndex=b.list_AL.findIndex(function(b){b.Mnemo==a.Mnemo}),-1!=almIndex?b.list_AL[almIndex]=a:b.list_AL.push(a)})}]).controller("CTActrl",["$rootScope","$scope","socket","$state","P",function(a,b,c,d,e){b.Selected_CT=a.Selected_CT,b.Selected_CT||d.go("app.CT"),b.Consigne_Grp=function(b,c){a.Selected_NomGrp=b,a.Selected_Grp=c,d.go("app.CTcon")},b.List_CTA=[],b.expand_AL=function(a){b.isItemExpanded(a)?b.shownItem=null:b.shownItem=a},b.isItemExpanded=function(a){return b.shownItem===a},c.emit(e.SOCKET.CTAQ,{Selected_CT:b.Selected_CT}),c.on(e.SOCKET.CTAA,function(a){console.log(a),ctaIndex=b.List_CTA.findIndex(function(b){b.DesignGroupeFonctionnel==a.DesignGroupeFonctionnel}),console.log(ctaIndex),-1!=ctaIndex?b.List_CTA[ctaIndex]=a:b.List_CTA.push(a)})}]).controller("StaCtrl",["$scope","$rootScope","$state","socket","P",function(a,b,c,d,e){a.Selected_CT=b.Selected_CT,a.list_Sta=[],d.emit(e.SOCKET.SQ,{Mode:"Read",Selected_CT:a.Selected_CT}),d.on(e.SOCKET.SA,function(b){console.log(b),StaIndex=a.list_Sta.findIndex(function(a){a.Mnemo==b.Mnemo}),-1==StaIndex?a.list_Sta.push(b):a.list_Sta[StaIndex]=b}),a.Write=function(a){a.Mode="Write",d.emit(e.SOCKET.CQ,a)}}]).controller("QrCtrl",["$scope","$rootScope","$cordovaBarcodeScanner","$ionicPlatform",function(a,b,c,d){a.scan=function(){d.ready(function(){c.scan().then(function(b){a.scanResults="We got a barcode\nResult: "+b.text+"\nFormat: "+b.format+"\nCancelled: "+b.cancelled},function(b){a.scanResults="Error: "+b})})},a.scanResults=""}]).controller("AdminCtrl",["$scope","socket","$ionicLoading","P",function(a,b,c,d){a.Validate_Item="",a.list_Cons=[],b.emit(d.SOCKET.CQ,{Mode:"Read"}),b.on(d.SOCKET.CA,function(b){b.Value.toString().length>=6&&(b.Value=Math.round(b.Value).toFixed(2)),ConsIndex=a.list_Cons.findIndex(function(a){a.Mnemo==b.Mnemo}),-1==ConsIndex?a.list_Cons.push(b):a.list_Cons[ConsIndex]=b}),a.Write=function(a){a.Mode="Write",b.emit(d.SOCKET.CQ,a)},a.Analog_Change=function(a){a.Value!=a.Local_Value&&(a.Mode="Write",b.emit(d.SOCKET.CQ,a))}}]).controller("MyCtrl",["$scope","$cordovaNetwork","$rootScope",function(a,b,c){document.addEventListener("deviceready",function(){a.network=b.getNetwork(),a.isOnline=b.isOnline(),a.$apply(),c.$on("$cordovaNetwork:online",function(c,d){a.isOnline=!0,a.network=b.getNetwork(),a.$apply()}),c.$on("$cordovaNetwork:offline",function(c,d){console.log("got offline"),a.isOnline=!1,a.network=b.getNetwork(),a.$apply()})},!1)}]);