app
.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})

.constant('USER_ROLES', {
  all: '*',
  admin: 'admin',
  editor: 'editor',
  guest: 'guest'
})

.value('App_Info', {
ID : 'null',
AL_10_Color : '#D500F9', //AL DefCom
AL_3_Color : '#F44336', //AL Critique
AL_2_Color : '#FF8F00', //AL Majeure
AL_1_Color : '#2196F3', //AL Mineure
AL_0_Color : '#07F900' //Aucune Alarme Présente
})
