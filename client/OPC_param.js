module.exports = {
  COURBES :
  {
    Intervalle_Reconstutution_j : 1,  // en Jours
    Intervalle_Echantillonnage_m : 10,   // en Minutes
    Intervalle_Extraction_h : 6      // en Heures
  },
  ALARM : {
  AL_10_Color : '#D500F9', //AL DefCom
  AL_3_Color : '#F44336', //AL Critique
  AL_2_Color : '#FF8E21', //AL Majeure
  AL_1_Color : '#EED238', //AL Mineure
  AL_0_Color : '#000000', //Aucune Alarme Présente
  AL_D_Color : '#FFFFFF' // Code blanc alarme disparue non Ack
  },

  SQL : {
       Metier : "SUP_METIER",
       Installation_technique : "SUP_INSTAL_TECHNIQUE",
       NomGroupeFonctionnel : "SUP_NOM_GPE_FONCTIONNEL",
       DesignGroupeFonctionnel : "SUP_DESIG_GPE_FONCTIONNEL",
       NomObjetFonctionnel : "SUP_NOM_OBJ_FONCTIONNEL",
       DesignObjetFonctionnel : "SUP_DESIG_OBJ_FONCTIONNEL",
       Information : "SUP_INFORMATION",
       Libelle_groupe : "SUP_LIBELLE_GPE",
       Libelle_information : "SUP_LIBELLE_INFO",
       Localisation : "SUP_LOCALISATION",
       Type : "SUP_TYPE",
       TOR_CodeEtat0 : "SUP_TOR_ETAT0",
       TOR_CodeEtat1 : "SUP_TOR_ETAT1",
       TOR_CriticiteAlarme : "SUP_TOR_CRI_ALARME",
       TOR_CategorieAlarme : "SUP_TOR_CAT_ALARME",
       ANA_Unite : "SUP_ANA_UNITE",
       ANA_ValeurMini : "SUP_ANA_MIN",
       ANA_ValeurMaxi : "SUP_ANA_MAX",
       ACQ_Protocole : "SUP_ACQ_PROTOCOLE",
       ACQ_Equipement : "SUP_ACQ_EQUIPEMENT",
       ACQ_Adresse : "SUP_ACQ_ADRESSE",
       PLC_Type : "SUP_PLC_TYPE",
       PLC_Adresse : "SUP_PLC_ADRESSE",
       PLC_Groupe : "SUP_PLC_GROUPE",
       PLC_Objet : "SUP_PLC_OBJET"
},
  SRV_MOBILITE : {
    // SOCKET : 'https://localhost:3000',
    SRVGST : { IP : 'https://localhost:443' ,
               PARAM : { secure: true , rejectUnauthorized: false , reconnect: true, "connect timeout" : 2000 }
              }
}
,
 OPC_OPTIONS : {
      applicationName : 'MOBILITE',
      keepSessionAlive: true,
      endpoint_must_exist: false,
      requestedSessionTimeout: 10000,
      connectionStrategy: {
                maxRetry: 100000,
                initialDelay: 100,
                maxDelay: 10000
        }
      //  securityMode: MessageSecurityMode.SIGNANDENCRYPT,
      //  securityPolicy: SecurityPolicy.Basic128Rsa15,
    //  applicationName: "NodeOPCUA-Client",
    //  certificateFile: "file.crt",
    //  privateKeyFile: "file.pem",
    //  serverCertificate: crypto_utils.readCertificate("file.crt"),


},

  // OPC_URL :  "opc.tcp://10.224.1.5:9080/CODRA/ComposerUAServer"
  OPC_URL :  "opc.tcp://10.18.10.1:9080/CODRA/ComposerUAServer"
 ,
 SQL_OPTIONS : {
     user: 'sa',
     password: 'VdP2016!',
     server: '10.18.10.3\\SQL2014',
    // user: 'dbConnect',
    // password: 'dbConnect',
    // server: "10.224.1.6",
    // port : '49421',
    database: 'BDD_DONNEES',
    connectionTimeout: 10000,
    requestTimeout: 30000,
    pool: {
           max: 100,
           min: 10,
           idleTimeoutMillis: 300000,
           log:true
           }
}
}
