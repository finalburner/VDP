app
.constant('P', {

  INFO : {
    Version : '1.3.11'
    },

  PARAM : {

    SRV : [
      { id : 0 , name : 'VDP PROD', url : 'https://k51-seb.apps.paris.fr:443'},
      { id : 1 , name : 'VDP PREPROD', url : 'https://k51-ppr-seb.apps.paris.fr:443'}
      // { id : 2 , name : 'EIFFAGE DEV', url : 'https://k51eiffageparis.hopto.org:3001'}
    ],
    SRV_LOCAL :  [
      { id : 0, name : 'DEV', url : 'https://localhost:443'},
      { id : 0 , name : 'VDP PREPROD', url : 'https://k51-ppr-seb.apps.paris.fr:443'},
      { id : 1 , name : 'VDP PROD', url : 'https://k51-seb.apps.paris.fr:443'}
  ]// dev 3000 // on local web dev SSL

  },
  SOCKET :
  {  //Socket Event
        LQ   : 'Login_Query',
        LA   : 'Login_Answer',
        CQ   : 'Cons_Query',
        CA   : 'Cons_Answer',
        CU   : 'Cons_Update',
        CC   : 'Client_Connected',
        CI   : 'connect_id',
        CO   : 'connect',
        DE   : 'disconnect',
        CTQ  : 'CT_Query',
        CTA  : 'CT_Answer',
        ALQ  : 'AL_Query',
        ALA  : 'AL_Answer',
        GFQ : 'GF_Query',
        GFA : 'GF_Answer',
        OGU  : 'OPC_General_Update',
        SQ   : 'Sta_Query',
        SA   : 'Sta_Answer',
        SA2   : 'Sta_Answer2',
        CHQ  : 'Cha_Query',
        CHA1  : 'Cha_Answer1',
        CHA2 : 'Cha_Answer2',
        CHA3 : 'Cha_Answer3',
        PHQ : 'PH_Query',
        PHA1 : 'PH_Answer',
        FQ : 'Fic_Query',
        FA1 : 'Fic_Answer1',
        FA2 : 'Fic_Answer2',
        SRVQ: 'SRV_Query',
        SRVA: 'SRV_Answer',
        AQ: 'AST_Query',
        AA: 'AST_Answer',
        UQ: 'UPD_Query',
        UA: 'UPD_Answer'


},

  ALARM :
  { //Alarm Color
        AL_10_Color : '#D500F9', //AL DefCom
        AL_3_Color : '#F44336', //AL Critique
        AL_2_Color : '#FF8E21', //AL Majeure
        AL_1_Color : '#EED238', //AL Mineure //
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
      {name :  'Synthèse', url: 'app.CTsyn' , dc: false , dev : false, droit : 1 }, //dc = sensibilite default communication // dev = en cours de dév
      {name :  'Etat', url: 'app.CTsta' , dc: false , dev : false, droit : '$root.droit.FSVEF' },
      // {name :  'Historique', url: 'app.CThis' ,dc: false , dev : true}
      ],
    LOCAL : [
     {name :  'Fiche d\'identité', url: 'app.CTfic2' , dc: false , dev : false,  droit : '$root.droit.FFIVS' },
     {name :  'Journal des alarmes', url: 'app.CTalm' , dc: false , dev : false, droit : '$root.droit.FAVAASE' },
     {name :  'Synthèse bâtiment', url: 'app.CTbat' , dc: false, dev : false,    droit : '$root.droit.FSVSB' }
    //  {name :  'Courbes', url: 'app.CTpla' , dc: false , dev : true},
    //  {name :  'Bibliothèque', url: 'app.CTpla' , dc: false , dev : true}
   ]

 },

 POP_N1 :
 {
   GLOBAL : [  //dc = default communication // dev = en cours de dév
     {name :  'Synthèse', url: 'app.CTsyn' , dc: false , dev : false , droit : 1},
     {name :  'Etat', url: 'app.CTsta' , dc: false , dev : false, droit : '$root.droit.FSVEF' }, //status anciennement
    //  {name :  'Historique', url: 'app.CTpla' , dc: false , dev : true},
     {name :  'Fiche d\'identité', url: 'app.CTfic2' , dc: false, dev : false, droit : '$root.droit.FFIVS' },
     {name :  'Journal des alarmes', url: 'app.CTalm' , dc: true, dev : false, droit : '$root.droit.FAVAASE'} ,
     {name :  'Synthèse bâtiment', url: 'app.CTbat' , dc: false, dev : false,  droit : '$root.droit.FSVSB'}
    //  {name :  'Courbes', url: 'app.CTpla' , dc: false, dev : true},
    //  {name :  'Bibliothèque', url: 'app.CTpla' , dc: false, dev : true}
   ]
 },

 POP_N2 :
 {
   GLOBAL : [
     {name :  'Fonctionnement', Vue : 1 , url: 'app.CTcon' , dc: false , dev : false, droit: 1 },
     {name :  'Consignes', Vue : 2 , url: 'app.CTcon' , dc: false , dev : false, droit : '$root.droit.FRVDSCC' },
     {name :  'Mise au point', Vue : 3 , url: 'app.CTcon' , dc: false , dev : false, droit : '$root.droit.FRVDMP' } //status anciennement

    //  {name :  'Plans équipement', Vue : 4 , url: 'app.CTpla' , dc: false , dev : true}
   ]
 },

 POP_PH :
 {
   GLOBAL : [
     {name :  'Vue calendaire', vue : 1 , url: 'app.PHtr' , dc: false , dev : false},
     {name :  'Programme standard', vue : 2 , url: 'app.PHtr' , dc: false , dev : false}
   ]
 },

 FIC : [
  { id : 1 , T : 'DESCRIPTION'},
  { id : 2 , T : 'EQUIPEMENTS'},
  { id : 3 , T : 'EXPLOITANTS'},
  { id : 4 , T : 'PRESTATIONS'}

]

, PH :{
  COLOR : [ '',   // Element 0
     '#7353ca',   //couleur typeTranche = 1
     '#0e67ff',   //couleur typeTranche = 2
     '#50e3c2',   //couleur typeTranche = 3
     '#FFA500',   //couleur typeTranche = 4
     '#FFA500'   //couleur typeTranche = 5
   ],

  DATE : {
  jours : ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi","Dimanche" ],
  jours_min : ["Dim" , "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam" ],
  mois : ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"]
 }
}

})
