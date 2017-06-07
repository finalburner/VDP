app
.constant('P', {
  PARAM : {
    SRV_WEB : 'https://80.11.8.31:3000',
    SRV_LOCAL : 'https://localhost:3000'

  },
  SOCKET :
  {  //Socket Event
        LQ   : 'Login_Query',
        LA   : 'Login_Answer',
        CQ   : 'Cons_Query',
        CA   : 'Cons_Answer',
        CU   : 'Cons_Update',
        CC   : 'Client_Connected',
        CO   : 'Connect',
        CTQ  : 'CT_Query',
        CTA  : 'CT_Answer',
        ALQ  : 'AL_Query',
        ALA  : 'AL_Answer',
        CTAQ : 'CTA_Query',
        CTAA : 'CTA_Answer',
        OU   : 'OPC_General_Update',
        SQ   : 'Sta_Query',
        SA   : 'Sta_Answer'
},

  ALARM :
  { //Alarm Color
        AL_10_Color : '#D500F9', //AL DefCom
        AL_3_Color : '#F44336', //AL Critique
        AL_2_Color : '#FF8E21', //AL Majeure
        AL_1_Color : '#2196F3', //AL Mineure
        AL_0_Color : '#000000' //Aucune Alarme Présente
},

  USER_ROLES :
  {
    all: '*',
    admin: 'admin',
    editor: 'editor',
    guest: 'guest'
},

  AUTH_EVENTS :
   {
     loginSuccess: 'auth-login-success',
     loginFailed: 'auth-login-failed',
     logoutSuccess: 'auth-logout-success',
     sessionTimeout: 'auth-session-timeout',
     notAuthenticated: 'auth-not-authenticated',
     notAuthorized: 'auth-not-authorized'
   },

  MODAL_N1 :
  {
    GLOBAL : [
      {name : 'Synthèse', url: 'app.CTsyn'},
      {name :  'Etats', url: 'app.CTsta'}, //status anciennement
      {name :  'Historique', url: 'app.CThis'}
      ],
    LOCAL : [
     {name :  'Fiche identité', url: 'app.CTfic'},
     {name :  'Alarmes du CT', url: 'app.alarmes'},
     {name :  'Plans des équipements', url: 'app.CTpla'},
     {name :  'Documentation CT', url: 'app.CTdoc'},
     {name :  'Courbes', url: 'app.CTcou'}
   ]

  }

})
