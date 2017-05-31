var app=angular.module("starter",["ionic","starter.controllers","btford.socket-io","ngAnimate","ngMap"]),controllers=angular.module("starter.controllers",["angularUUID2","ngCordova"]);app.config(["$stateProvider","$urlRouterProvider","P",function(t,e,a){t.state("app",{url:"/app",abstract:!0,authentificate:!0,templateUrl:"templates/N0/menu.html",controller:"AppCtrl"}).state("login",{url:"/login",authentificate:!1,cache:!1,templateUrl:"templates/N0/login.html",controller:"AppCtrl",data:{authorizedRoles:[]}}).state("app.CT",{url:"/CT",authentificate:!0,cache:!1,views:{menuContent:{templateUrl:"templates/N0/CT.html",controller:"CTctrl"},data:{authorizedRoles:[a.USER_ROLES.admin]}}}).state("app.CTi",{url:"/CTi",authentificate:!0,views:{menuContent:{templateUrl:"templates/N0/CTi.html",controller:"CTctrl"}},data:{authorizedRoles:[a.USER_ROLES.admin,a.USER_ROLES.editor]}}).state("app.Login",{url:"/Login",views:{menuContent:{templateUrl:"templates/N0/CTi.html",controller:"CTctrl"}},data:{authorizedRoles:[a.USER_ROLES.admin,a.USER_ROLES.editor]}}).state("app.carto",{url:"/carto",authentificate:!0,views:{menuContent:{templateUrl:"templates/N0/carto.html",controller:"CTctrl"}},data:{authorizedRoles:[a.USER_ROLES.admin,a.USER_ROLES.editor]}}).state("app.alarmes",{cache:!1,url:"/alarmes",authentificate:!0,views:{menuContent:{templateUrl:"templates/N0/alarmes.html",controller:"ALctrl"}},data:{authorizedRoles:[a.USER_ROLES.admin,a.USER_ROLES.editor]}}).state("app.rapport",{url:"/rapport",authentificate:!0,views:{menuContent:{templateUrl:"templates/N0/rapport.html",controller:"QrCtrl"}},data:{authorizedRoles:[a.USER_ROLES.admin,a.USER_ROLES.editor]}}).state("app.admin",{url:"/admin",cache:!1,authentificate:!0,views:{menuContent:{templateUrl:"templates/N0/admin.html",controller:"AdminCtrl"}},data:{authorizedRoles:[a.USER_ROLES.admin,a.USER_ROLES.editor]}}).state("app.biblio",{url:"/biblio",authentificate:!0,views:{menuContent:{templateUrl:"templates/N0/biblio.html",controller:"AppCtrl"}},data:{authorizedRoles:[a.USER_ROLES.admin,a.USER_ROLES.editor]}}).state("app.CTsyn",{url:"/syn",cache:!1,authentificate:!0,views:{menuContent:{templateUrl:"templates/N1/CTsyn.html",controller:"CTActrl"}},data:{authorizedRoles:[a.USER_ROLES.admin,a.USER_ROLES.editor]}}).state("app.CTsta",{url:"/sta",cache:!1,authentificate:!0,views:{menuContent:{templateUrl:"templates/N1/CTsta.html",controller:"StaCtrl"}},data:{authorizedRoles:[a.USER_ROLES.admin,a.USER_ROLES.editor]}}).state("app.CTcou",{url:"/cou",authentificate:!0,views:{menuContent:{templateUrl:"templates/N1/CTcou.html",controller:"CTctrl"}},data:{authorizedRoles:[a.USER_ROLES.admin,a.USER_ROLES.editor]}}).state("app.CTdoc",{url:"/doc",authentificate:!0,views:{menuContent:{templateUrl:"templates/N1/CTdoc.html",controller:"CTctrl"}},data:{authorizedRoles:[a.USER_ROLES.admin,a.USER_ROLES.editor]}}).state("app.CThis",{url:"/his",authentificate:!0,views:{menuContent:{templateUrl:"templates/N1/CThis.html",controller:"CTctrl"}},data:{authorizedRoles:[a.USER_ROLES.admin,a.USER_ROLES.editor]}}).state("app.CTfic",{url:"/fic",authentificate:!0,views:{menuContent:{templateUrl:"templates/N1/CTfic.html",controller:"CTfic"}},data:{authorizedRoles:[a.USER_ROLES.admin,a.USER_ROLES.editor]}}).state("app.CTcon",{url:"/CTcon",cache:!1,authentificate:!0,views:{menuContent:{templateUrl:"templates/N1/CTcon.html",controller:"ConCtrl"}},data:{authorizedRoles:[a.USER_ROLES.admin,a.USER_ROLES.editor]}}).state("app.CTpla",{url:"/pla",authentificate:!0,views:{menuContent:{templateUrl:"templates/N1/CTpla.html",controller:"CTctrl"}},data:{authorizedRoles:[a.USER_ROLES.admin,a.USER_ROLES.editor]}}).state("app.CTsynP",{url:"/synP",authentificate:!0,views:{menuContent:{templateUrl:"templates/N1/CTsynP.html",controller:"CTctrl"}},data:{authorizedRoles:[a.USER_ROLES.admin,a.USER_ROLES.editor]}}),e.otherwise("/login")}]);