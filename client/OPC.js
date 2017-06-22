"use strict";//----------------------OPC-------------------------
const P = require('./OPC_param.js')
const winston = require('winston');
const async = require("async");
const sql = require('mssql');
const sleep = require('system-sleep');
const opcua = require("node-opcua");
var io = require('socket.io-client');
// var crypto_utils = require("lib/misc/crypto_utils");

var options = {
    //  securityMode: MessageSecurityMode.SIGNANDENCRYPT,
    //  securityPolicy: SecurityPolicy.Basic128Rsa15,
    //  requestedSessionTimeout: 10000,
    //  applicationName: "NodeOPCUA-Client",
    //  endpoint_must_exist: false,
    //  certificateFile: "file.crt",
    //  privateKeyFile: "file.pem",
    //  serverCertificate: crypto_utils.readCertificate("file.crt"),
     connectionStrategy: {
      maxRetry: 100000,
      initialDelay: 1000,
      maxDelay: 10000},
     keepSessionAlive: true
  };
var client = new opcua.OPCUAClient(options);
// var endpointUrl = "opc.tcp://" + require("os").hostname() + ":4334/UA/Server";
var endpointUrl = "opc.tcp://10.18.10.1:9080/CODRA/ComposerUAServer";
var the_session, the_subscription;
var ids ;
var i = 0 ;
var Write_Perm = false ; //activer le controle-commande
var BATCH_MONITORING = 0 ;
var WAIT = 100;
var SELECT = 0;
var Mnemo ;
var list_AL;
var socket = io.connect('https://localhost:3000', {reconnect: true, "connect timeout" : 2000});
var NodeId = "ns=2;s=" ;

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ level: 'debug', handleExceptions: true }), // level 7 = max ==> all messages logged --> console
    new (winston.transports.File)({ filename: 'logfile.log', level: 'debug' }) // level 7 = max ==> all messages logged --> file
  ],
  exitOnError: false
});

if (io.connected === false && io.connecting === false)
{io.connect('http://localhost:4000');
logger.info('Connected to client on 4000');}
else logger.info('Connected to client on 3000')

// winston.handleExceptions(new winston.transports.File({ filename: 'path/to/exceptions.log' }))
// winston.remove(winston.transports.Console);
// { emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7 }

// logger.debug("Will not be logged in either transport!");
// logger.transports.console.level = 'debug';
// logger.transports.file.level = 'verbose';
// logger.verbose("Will be logged in both transports!");

//subscription to general OPC parameters ( Alarms Nbr , ....)
var sub_param = [
{ id : 'Synthese.PresentCount', adr : '/Application/STEGC/Paris/_Entite/Synthese.PresentCount'
},
{ id : 'SyntheseMajeure.PresentCount', adr : '/Application/STEGC/Paris/_Entite/SyntheseMajeure.PresentCount'
},
{ id : 'SyntheseMineure.PresentCount', adr : '/Application/STEGC/Paris/_Entite/SyntheseMineure.PresentCount'
},
{ id : 'SyntheseDefCom.PresentCount', adr : '/Application/STEGC/Paris/_Entite/SyntheseDefCom.PresentCount'
},
{ id : 'SyntheseCritique.PresentCount', adr : '/Application/STEGC/Paris/_Entite/SyntheseCritique.PresentCount'
}
];



// Fonction de lecture d'une variable(s) OPC
// function OPC_Read(ToRead,socket){ //ToRead = [{ nodeId , Mnemo , Libelle , Active , Ack }]
// ToRead.forEach(function(id){
// alm_active = id.nodeId + '.valeur';
// alm_ack = id.nodeId + '/Alm/Acknowledged';
// // console.log(alm_state);
// the_session.readVariableValue([alm_active, alm_ack], function(err,dataValue) {
//          if (!err) {
// id.Active = dataValue[0].value.value ;
// id.Ack = dataValue[1].value.value ;
// socket.emit('AL_Answer', id);
// // id.Value = dataValue.value.value;
// // console.log(id.Mnemo + 'est active');
// console.log(id)
//   }
// });
//      });
//     //  console.log(ToReturn)
//
// // return ToRead ;
// }

socket.on('connect', function () {
  logger.info("Socket connected <<>> Id :" + socket.id);
socket.emit('OPC_Socket_Connected');
});

//Socket query for list CT on SQL
socket.on('CT_Query', function(data){
  logger.info('CT_query from ' + data.Socket_ID)
  var tmp ;
  var OPC_Read = [] ;
  var CT_PT_List = []
  var len ;
  if (the_session)
      {

   // Requete SQL CT + PT
    var request = new sql.Request().query('Select distinct localisation,Installation_technique from dbo.SUPERVISION order by localisation').then(function(rec) {
    CT_PT_List = JSON.parse(JSON.stringify(rec).replace(/"\s+|\s+"/g,'"').replace(/localisation/g, 'L').replace(/Installation_technique/g, 'I'))
    len = CT_PT_List.length ;
    var AD,CP,VI,LAT,LONG,AL_10,AL_3,AL_2,AL_1
    for (var i = 0; i < len; i++) {
    tmp = NodeId + '/Application/STEGC/Paris/PT/' + CT_PT_List[i].I ;
    AD = tmp + '/_Entite/Adresse' ;  // Adresse
    CP = tmp + '/_Entite/CodePostal' ; //Code Postale
    VI = tmp + '/_Entite/Ville' ; //Ville
    LAT = tmp + '/_Entite/Latitude' ;  //latitude
    LONG = tmp + '/_Entite/Longitude' ;  //Longitude
    AL_10 = tmp + '/_Entite/SyntheseDefCom/ExistPresent' //Présence Alarme DefCom
    AL_3 = tmp + '/_Entite/SyntheseCritique/ExistPresent' //Présence Alarme Critique
    AL_2 = tmp + '/_Entite/SyntheseMajeure/ExistPresent' //Présence Alarme Majeure
    AL_1 = tmp + '/_Entite/SyntheseMineure/ExistPresent' //Présence Alarme Mineure
    // var OPC_Read = {AD,CP,VI,LAT,LONG,AL_10,AL_3,AL_2,AL_1 }
    OPC_Read.push(AD,CP,VI,LAT,LONG,AL_1,AL_2,AL_3,AL_10)
     }
     var opc_len = OPC_Read.length
    //  console.log(OPC_Read)
    //      console.log(OPC_Read.length)
    //      console.log(len)s
   the_session.readVariableValue(OPC_Read,function(err,dataValue,diagnostics) {
    if (err)
    logger.error("OPC error" + err)
    else {
    for(i=0 ; i< opc_len ; i = i + 9)
    {
    var j= i/9 ;
    if (dataValue[i] && dataValue[i+1] && dataValue[i+2] && dataValue[i].value && dataValue[i+1].value && dataValue[i+2].value)
    CT_PT_List[j].A = dataValue[i].value.value + ' ' + dataValue[i+1].value.value + ' ' + dataValue[i+2].value.value; //Adresse Complète
    if (dataValue[i+3] && dataValue[i+3].value) CT_PT_List[j].LA = dataValue[i+3].value.value;
    if (dataValue[i+4] && dataValue[i+4].value) CT_PT_List[j].LO = dataValue[i+4].value.value;
    CT_PT_List[j].AL = P.ALARM.AL_0_Color;
    if (dataValue[i+5] && dataValue[i+5].value && dataValue[i+5].value.value) CT_PT_List[j].AL = P.ALARM.AL_1_Color;
    if (dataValue[i+6] && dataValue[i+6].value && dataValue[i+6].value.value) CT_PT_List[j].AL = P.ALARM.AL_2_Color;
    if (dataValue[i+7] && dataValue[i+7].value && dataValue[i+7].value.value) CT_PT_List[j].AL = P.ALARM.AL_3_Color;
    if (dataValue[i+8] && dataValue[i+8].value && dataValue[i+8].value.value) CT_PT_List[j].AL = P.ALARM.AL_10_Color;
    }
  CT_PT_List.push({OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID })
  socket.emit('CT_Answer', CT_PT_List )
  logger.info('CT_Answer to ' + data.Socket_ID )
}


})
// }
}).catch(function(err) {
logger.error(err)
});

}

  if (!the_session) { socket.emit('Notif_All', { Msg : 'OPC Session Error'}); logger.error("OPC session error") ; }
  // if (sql != 'Read') socket.emit('Error', { Component: 'SQL', Property : 'Session', Value : 'Off'})
 });



  //Socket query for Status list
  socket.on('Sta_Query', function(data){
    var OPC_Read = [] ; //requetes OPC
    var R =[] // Listes Status

    logger.info('Sta_Query from ' + data.Socket_ID)
  if (the_session)
   {
   var query = "Select Installation_technique as IT,DesignGroupeFonctionnel as DGF ,DesignObjetFonctionnel as DOF,Information as I ,Libelle_information as L ,Type as T ,TOR_CodeEtat1 as T1,TOR_CodeEtat0 as T0 from dbo.SUPERVISION " ;
       query += "WHERE localisation = \'" + data.Selected_CT + "\' ";
       query += "AND NomGroupeFonctionnel = \'GENER\' AND NomObjetFonctionnel = \'SYNTH\' ";
       query += "AND Metier = \'CVC\'";
      var request = new sql.Request().query(query).then(function(rec) {
      rec = JSON.parse(JSON.stringify(rec).replace(/"\s+|\s+"/g,'"'))
       var len = rec.length ;

       for (var i = 0; i < len; i++) {
         var id = rec[i]
          var Mnemo = 'CVC_' + id.IT + '_GENER' + id.DGF + '_SYNTH' + id.DOF + '_' + id.I ;
          var adr = '/Application/STEGC/Paris/PT/' + id.IT + '/Acquisition/' + Mnemo + '.Valeur';
          var NodeId = "ns=2;s=" + adr;
          OPC_Read.push(NodeId)
          R.push({ L : id.L , M : Mnemo })
        }

      the_session.readVariableValue(OPC_Read, function(err,dataValue,diagnostics) {
            if (err)
            { logger.error("OPC error");logger.error(diagnostics);logger.error(err); }
            else {
              // console.dir(dataValue)
            for(i=0 ; i< len ; i++)
            {
            if (dataValue[i] && dataValue[i].value)
                  {
                  R[i].V =  dataValue[i].value.value
                  // console.log(dataValue[i].value.value)
                  if (R[i].V)
                  R[i].E= rec[i].T1
                  else
                  R[i].E= rec[i].T0
                 }

               }
               R.push({OPC_Socket_ID : data.OPC_Socket_ID , Socket_ID: data.Socket_ID });
               socket.emit('Sta_Answer', R);
               logger.info('Sta_Answer to ' + data.Socket_ID )

              }
       })
  }).catch(function(err) {
  logger.error(err)
  });

    }
    else { socket.emit('Notif_All', { Msg : 'OPC Session Error'}); logger.error("OPC session error") ; }
    // if (sql != 'Read') socket.emit('Error', { Component: 'SQL', Property : 'Session', Value : 'Off'})
   });


socket.on('Cha_Query', function (data){
console.log(data)
logger.info('Cha_Query from ' + data.Socket_ID)
if (data.Selected_PT == 'null' || !data.Selected_PT)
logger.info('No PT Selected')
else
{
var x = []
var y = []
var AMBIA = '/STEGC/Paris/PT/' + data.Selected_PT + '/Acquisition/CVC_' + data.Selected_PT + '_CIRCU' + data.DGF + '_TEMP3AMBIA_M01';
var DEPAR = '/STEGC/Paris/PT/' + data.Selected_PT + '/Acquisition/CVC_' + data.Selected_PT + '_CIRCU' + data.DGF + '_TEMP3DEPAR_M01';
var query = 'SELECT TOP 20 TriggeringValue as v FROM ARCHIVES.dbo.Mesure_' + data.Selected_PT  + ' where Name = \'' + DEPAR + '/Evt\' ORDER BY UTC_App_DateTime DESC '
var query2 = 'SELECT TOP 20 TriggeringValue as v FROM ARCHIVES.dbo.Mesure_' + data.Selected_PT  + ' where Name = \'' + AMBIA + '/Evt\' ORDER BY UTC_App_DateTime DESC '
//// TEMPRATURE DEPART
var request = new sql.Request().query(query).then(function(rec) {
var rec=JSON.parse(JSON.stringify(rec).replace(/"\s+|\s+"/g,'"'))
if(rec.length)
{
for (var i=0; i<rec.length; i++) // to Array
x.push(parseInt(rec[i].v)) // to Array
x.push({ OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID });
socket.emit('Cha_Answer', x);
console.log(x)
}})

// TEMPERATURE AMBIANTE
var request = new sql.Request().query(query2).then(function(rec2) {
var rec2=JSON.parse(JSON.stringify(rec2).replace(/"\s+|\s+"/g,'"'))

if(rec2.length)
{
for (var j=0; j<rec2.length; j++) // to Array
y.push(parseInt(rec2[j].v)) // to Array
y.push({ OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID });
socket.emit('Cha_Answer2', y);
console.log(y) }
})
}
});


socket.on('CTA_Query', function (data){
logger.info('CTA_query from ' + data.Socket_ID)

if (the_session)
{
var NodeId = "ns=2;s=" ;
var OPC_Read = []  ;
var CTA = []
var len ;
var query ;
// console.log(data)
if (data.Selected_CT == 'null' || !data.Selected_CT )
logger.info('No CT Selected')
else {
query = "Select distinct Libelle_groupe as LG,DesignGroupeFonctionnel as DGF from dbo.SUPERVISION Where localisation =\'" + data.Selected_CT + "\' AND NomGroupeFonctionnel = 'CIRCU' AND Metier = 'CVC'"
console.log(query)
  var request = new sql.Request().query(query).then(function(rec) {
  var recordset=JSON.parse(JSON.stringify(rec).replace(/"\s+|\s+"/g,'"'))
  if (recordset) {
    // console.log(recordset)
    len = recordset.length
    for (var i = 0 ; i < len; i++) {
    var id = recordset[i];
    var AMBIA = '/STEGC/Paris/PT/' + data.Selected_PT + '/Acquisition/CVC_' + data.Selected_PT + '_CIRCU' + id.DGF + '_TEMP3AMBIA_M01';
    var DEPAR=  '/STEGC/Paris/PT/' + data.Selected_PT + '/Acquisition/CVC_' + data.Selected_PT + '_CIRCU' + id.DGF + '_TEMP3DEPAR_M01';
    var TEMP3_AMBIA = NodeId + '/Application' + AMBIA + '.Valeur' ;
    var TEMP3_DEPAR = NodeId + '/Application' + DEPAR + '.Valeur' ;
    // var COURBE1 = 'SELECT TOP 5 TriggeringValue  FROM dbo.Evenements_' + id.IT + ' where Name = \'' + AMBIA + '/Evt\' ORDER BY UTC_App_DateTime DESC '
    // var COURBE2 = 'SELECT TOP 5 TriggeringValue  FROM dbo.Evenements_' + id.IT + ' where Name = \'' + DEPAR + '/Evt\' ORDER BY UTC_App_DateTime DESC'
    OPC_Read.push(TEMP3_AMBIA,TEMP3_DEPAR)
    CTA.push({DGF : id.DGF , LG : id.LG})
    // console.log(COURBE1)
    }
    // console.log(OPC_Read)
    var opc_len = OPC_Read.length , j ;
    if(OPC_Read){
    the_session.readVariableValue(OPC_Read, function(err,dataValue,diagnostics) {
              if (err)
             { logger.error("OPC error");logger.error(diagnostics);logger.error(err); }
              else {
                //  console.log(dataValue)
              for(i=0 ; i< opc_len ; i = i + 2)
              {
                j = i/2 ;
                if (dataValue[i] && dataValue[i].value)
                CTA[j].TA = dataValue[i].value.value //TEMP3_AMBIA

                if (dataValue[i+1]  && dataValue[i+1].value)
                CTA[j].TD = dataValue[i+1].value.value //TEMP3_DEPAR

                    //  new sql.Request().query(COURBE2).then(function(recordset) {
                    //  recordset=JSON.parse(JSON.stringify(recordset).replace(/"\s+|\s+"/g,'"'))
                    //  if (recordset)
                    //   d.TEMP3_DEPAR_ARC = recordset['TriggeringValue']
                    // });

                }
CTA.push({ OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID });
socket.emit('CTA_Answer', CTA);
logger.info("CTA Emit ")
            }

});}
            //
            // xx the_subscription.monitor("i=155",DataType.Value,function onchanged(dataValue){
            // xx    logger.info(" temperature has changed " + dataValue.value.value);
            // xx });


            // var monitoredItem  = the_subscription.monitor({
            //    nodeId: opcua.resolveNodeId(nodeId),
            //    attributeId: opcua.AttributeIds.Value
            //  },   {samplingInterval: 100,discardOldest: false,queueSize: 1 },
            //    opcua.read_service.TimestampsToReturn.Both
            //    );
            //
            // monitoredItem.on("changed",function(dataValue){
            // //io.sockets.emit('Event',dataValue.value.value);
            // if (dataValue.value != null )
            // update(id,Mnemo,dataValue.value.value);
            // //  console.log(nodeId.toString() , "\t value : ",dataValue.value.value.toString());
            // });


    // var Retour = { OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID , CTA_List : CTA_List };
    // socket.emit('CTA_Answer', Retour);
  // console.log(Retour)
};

}).catch(function(err) {
logger.error(err)
});

}
}
  else { socket.emit('Notif_All', { Msg : 'OPC Session Error'}); logger.error("OPC session error") ; }
  // if (sql != 'Read') socket.emit('Error', { Component: 'SQL', Property : 'Session', Value : 'Off'})
});


socket.on('AL_Query', function (data){

logger.info('AL_query from ' + data.Socket_ID)

if (the_session)
{
 if(data.Mode == "Read") {
  // logger.info('AL_Query : ' + data.Socket_ID) ;
  var query ;
  var Ack;
  var Actif ;
  var OPC_Read  = [];
  var ToSend = [];

  if (!data.Selected_CT || data.Selected_CT == 'null')
  {query  = "Select top 100 localisation as loc, Libelle_information AS L,Installation_technique AS IT,NomGroupeFonctionnel AS NGF,"
   query += "DesignGroupeFonctionnel AS DGF,NomObjetFonctionnel AS NOF,DesignObjetFonctionnel AS DOF,Information AS I,TOR_CriticiteAlarme AS C "
   query += "from dbo.SUPERVISION WHERE Type = 'TA' and Metier = 'CVC' "}
  else
   {query = "Select Libelle_information AS L,Installation_technique AS IT,NomGroupeFonctionnel AS NGF,"
    query += "DesignGroupeFonctionnel AS DGF,NomObjetFonctionnel AS NOF,DesignObjetFonctionnel AS DOF,Information AS I,TOR_CriticiteAlarme AS C "
    query+= "from dbo.SUPERVISION WHERE Type = 'TA' and localisation =\'" + data.Selected_CT +"\' and Metier = 'CVC' "}

  var request = new sql.Request().query(query).then(function(rec) {
  if (rec) {
  var recordset=JSON.parse(JSON.stringify(rec).replace(/"\s+|\s+"/g,'"'))
  var len = recordset.length ;
  var opc_len ;
  // console.log(recordset)
  for (var i = 0 ; i < len; i++) {
                  var id = recordset[i];
                  var Mnemo = 'CVC_' + id.IT + '_' + id.NGF + id.DGF + '_' + id.NOF + id.DOF + '_' + id.I ;
                  var adr = '/Application/STEGC/Paris/PT/' + id.IT + '/Acquisition/' + Mnemo ;
                  var NodeId = "ns=2;s=" + adr;
                  // if (id.C && id.Libelle_information )
                  // AlmToRead.push({ NodeId : NodeId , Mnemo : Mnemo , Libelle: id.Libelle_information, Criticite : id.C , Actif : '' , Ack : ''})
                  OPC_Read.push(NodeId + '.valeur')
                  OPC_Read.push(NodeId + '/Alm/Acknowledged')
                  var AL =  P.ALARM.AL_0_Color ; //applique la couleur alarme de base
                  if (id.C == '1')  AL = P.ALARM.AL_1_Color ; //applique la couleur alarme mineure
                  if (id.C == '2')  AL = P.ALARM.AL_2_Color ; //applique la couleur alarme majeure
                  if (id.C == '3')  AL = P.ALARM.AL_3_Color ; //applique la couleur alarme critique
                  if (id.C == '10') AL = P.ALARM.AL_10_Color ; //applique la couleur alarme def com

  if (!data.Selected_CT || data.Selected_CT == 'null')  ToSend.push({ N : NodeId, M : Mnemo, AL: AL, L : id.L , C : id.C , loc : id.loc })
  else  ToSend.push({ N : NodeId, M : Mnemo, AL: AL, L : id.L , C : id.C })

     };
// console.log(OPC_Read)
the_session.readVariableValue(OPC_Read, function(err,dataValue,diagnostics) {
if (err) {
logger.error("OPC error");logger.error(diagnostics);logger.error(err); }
else {
var T ;
var Ack,Act;
 for (var i = 0 ; i < len ; i++) {
//Gestion d'erreur OPC lecture attribut Actif
// console.log(opc_len)
id = recordset[i];

if(dataValue[i].sourceTimestamp)
ToSend[i].S= dataValue[i].sourceTimestamp.toLocaleString("en-GB") //date type


if (dataValue[2*i].statusCode )
{
  if (dataValue[2*i].statusCode._base)
  {
     id.StatusCode_Actif = dataValue[2*i].statusCode._base['name'];
     if ( id.StatusCode_Actif = 'Good' && dataValue[2*i].value)
     Act = dataValue[2*i].value.value;
  }
  if (dataValue[2*i].statusCode['name'])
  {
      id.StatusCode_Actif = dataValue[2*i].statusCode['name'];
      if( id.StatusCode_Actif = 'Good' && dataValue[2*i].value)
      Act= dataValue[2*i].value.value;
  }
 }
//Gestion d'erreur OPC lecture attribut Ack

 if (dataValue[2*i+1].statusCode )
 {
   if (dataValue[2*i+1].statusCode._base)
   {
      id.StatusCode_Ack = dataValue[2*i+1].statusCode._base['name'];
      if ( id.StatusCode_Ack = 'Good' && dataValue[2*i+1].value)
      Ack = dataValue[2*i+1].value.value;
    }

  if (dataValue[2*i+1].statusCode['name'])
    {
       id.StatusCode_Ack = dataValue[2*i+1].statusCode['name'];
       if( id.StatusCode_Ack = 'Good' && dataValue[2*i+1].value)
      Ack = dataValue[2*i+1].value.value;
    }

}

if(Act&&Ack) ToSend[i].P = 1 ; //Présente Acquitée
if(Act&&!Ack)  ToSend[i].P = 2 ; //Présente ( non Ack )
if(!Act&&!Ack)  ToSend[i].P = 3 ; // Disparue ( non Ack )
}

// console.log(ToSend)
ToSend.push({  OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID })
socket.emit('AL_Answer', ToSend);
logger.info('AL_Answer to ' + data.Socket_ID )
  }

      });
    };
      }).catch(function(err) { //Gestion globale des erreurs SQL
      logger.error('SQL QUERY ERROR' + err )
      });

}

if( data.Mode == "Write" )
{
  // console.log(data)
  if (data.Type == "ACK") {

  //
  // var browsePath = [
  //     opcua.browse_service.makeBrowsePath(data.nodeID + "/Alm" ,".AckRequest"),
  // ];
  //
  // the_session.translateBrowsePath(browsePath, function (err, results) {
  //     if (!err) {
  //       console.log(results[0].toString());
  //
  //     }
  // });
  console.log(data)
var methodsToCall = [];
   methodsToCall.push({
    objectId: opcua.resolveNodeId(data.N + '/Alm'),
    methodId: opcua.resolveNodeId(data.N + '/Alm.AckRequest'),
    inputArguments: [{ // Nom opérateur
        dataType: opcua.DataType.String,
        arrayType: opcua.VariantArrayType.Scalar,
        value:  "MobileVDP" },
        { // Nom poste exploitation
        dataType: opcua.DataType.String,
        arrayType: opcua.VariantArrayType.Scalar,
        value:  "MobileVDP" }
] //OK
    });

    // console.dir(methodsToCall)
    the_session.call(methodsToCall,function(err,results){
    if (results.length && results[0].statusCode == opcua.StatusCodes.Good)
     {
       logger.info("ACK done ")
       data.Ack = true ;
      //  console.log(data)
       socket.emit('Notif_Client', { Msg : data.L + ' acquitté(e)' , Socket_ID : data.Socket_ID});
       socket.emit('AL_Answer', data );
     }
     else
     logger.error(err)

    });


 }
}
}
  if (!the_session) { socket.emit('Notif_All', { Msg : 'OPC Session Error'}); logger.error("OPC session error") ; }
  // if (sql != 'Read') socket.emit('Error', { Component: 'SQL', Property : 'Session', Value : 'Off'})
    });

socket.on('Cons_Query', function (data){
  logger.info('Cons_Query from ' + data.Socket_ID)
if (the_session)
{
  if (data.Mode == "Read")
  {
  // console.log(data)
  var NodeId = "ns=2;s=" ;
  var OPC_Read = [];
  var query ;
  var ToSend = []
  if (data.Selected_CT && data.Selected_Grp)
  {
  query =  "Select Type as T, Installation_technique as IT, NomGroupeFonctionnel as NGF, "  // Consigne Analogique
  query += " DesignGroupeFonctionnel as DGF, NomObjetFonctionnel as NOF,  DesignObjetFonctionnel as DOF,"
  query += " Information as I, Libelle_groupe as LG, Libelle_information LI, Type, ANA_Unite as A, ANA_ValeurMini as A0, ANA_ValeurMaxi as A1, "
  query += " TOR_CodeEtat0 as T0 ,  TOR_CodeEtat1 as T1 from dbo.SUPERVISION WHERE Localisation =\'"+ data.Selected_CT +"\'"
  query += " AND NomGroupeFonctionnel = \'CIRCU\' AND DesignGroupeFonctionnel= \'" + data.Selected_Grp
  query += "\' AND Type IN (\'TC\' , \'TR\') AND Metier = \'CVC\' order by Type "
  // console.log(query)
}
  else
   { query = "Select Installation_technique as IT, NomGroupeFonctionnel as NGF, DesignGroupeFonctionnel AS DGF,"
   query += "NomObjetFonctionnel AS NOF,  DesignObjetFonctionnel AS DOF, Information AS I, Libelle_groupe AS LG,"
   query += "Libelle_information AS LI, Type AS T, ANA_Unite AS A, ANA_ValeurMini AS A0, ANA_ValeurMaxi AS A1 , "
   query += "TOR_CodeEtat0 AS T0, TOR_CodeEtat1 AS T1 from dbo.SUPERVISION Where Localisation =\'CT93213\' AND "
   query += "NomGroupeFonctionnel = \'CIRCU\' AND Type IN (\'TC\' , \'TR\') AND metier = \'CVC\' order by Type " }

// console.log( query)
    var request = new sql.Request().query(query).then(function(rec) {
    var recordset=JSON.parse(JSON.stringify(rec).replace(/"\s+|\s+"/g,'"'))
    // console.log(recordset)
    var len = recordset.length
    // if(data.Type == "TC")
    // {
    // if (data.Value) // true data
    // data.Etat = data.TOR_CodeEtat1;
    // else data.Etat = data.TOR_CodeEtat0;
    // }
    if (recordset) {
      for (var i = 0 ; i < len; i++) {
      var id = recordset[i] ;
      var Mnemo = 'CVC_' + id.IT + '_' + id.NGF + id.DGF + '_' + id.NOF + id.DOF + '_' + id.I ;
      var Adr = NodeId + '/Application/STEGC/Paris/PT/' + id.IT + '/Acquisition/' + Mnemo + '.Valeur';
      OPC_Read.push(Adr)
      if  (id.T == "TR") ToSend.push({ A : id.A , A1 : id.A1 , A0 : id.A0, M: Mnemo, Adr : Adr, L : id.LI , T : id.T})
      if  (id.T == "TC") ToSend.push({ T0 : id.T0, T1 : id.T1, M: Mnemo, Adr : Adr, L : id.LI , T : id.T})
      }
      // console.log(OPC_Read)


    the_session.readVariableValue(OPC_Read, function(err,dataValue,diagnostics) {
      if (err)
      {logger.error("OPC error");logger.error(diagnostics);logger.error(err);}
      else {

   for(i=0 ; i < len ; i++)
    {
  if (dataValue[i] && dataValue[i].value) {
  ToSend[i].V = dataValue[i].value.value
  ToSend[i].LV = ToSend[i].V ;
}}

  ToSend.push({ OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID });
  // console.log(ToSend)
  socket.emit('Cons_Answer', ToSend);
  logger.info('Cons_Answer to ' + data.Socket_ID)
    }
    });
  };
 });
}

if ( data.Mode =="Write" && Write_Perm) {
  // console.log(data)

if (data.T == "TC") {  var nodeToWrite = [
       {    nodeId: opcua.resolveNodeId(data.Adr ),
           attributeId: opcua.AttributeIds.Value,
           indexRange: null,
           value: { /* dataValue*/
              //  sourceTimestamp: new Date(2015, 5, 3),
              //  sourcePicoseconds: 30,
             value: { /* Variant */
              dataType: opcua.DataType.Boolean,
              value: data.LV
               }     }       }   ];  }

if (data.T == "TR")  {  var nodeToWrite = [
       {   nodeId: opcua.resolveNodeId(data.Adr ),
           attributeId: opcua.AttributeIds.Value,
           indexRange: null,
           value: { /* dataValue*/
              //  sourceTimestamp: new Date(2015, 5, 3),
              //  sourcePicoseconds: 30,
            value: { /* Variant */
            dataType: opcua.DataType.Double,
            value: data.LV
               }     }       }   ];  }

the_session.write(nodeToWrite, function (err, statusCodes) {
      if (!err) {
          console.log( statusCodes.length + '--' + nodeToWrite.length);
          console.log( statusCodes[0] + '--' + opcua.StatusCodes.BadNotWritable);
          console.log(statusCodes + '--' + opcua.StatusCodes.Good);

         the_session.readVariableValue(data.Adr , function(err,dataValue,diagnostics) {
         if (err) { logger.error("OPC error");logger.error(diagnostics);logger.error(err); }
        else {

      if (dataValue && dataValue.value) {
      data.V = dataValue.value.value;
      //Renvoi de la consigne unitaire vers le client
      socket.emit('Notif_Client', { Msg : data.L + ' changé à \'' + data.V + '\'', Socket_ID : data.Socket_ID})
      socket.emit('Cons_Update', data);
      console.log(data)
      }

      }
    });
  }
      else logger.error(err)

});
}
else if (!Write_Perm) logger.info("Write Forbidden : " + data.Adr)
}
  if (!the_session) { socket.emit('Notif_All', { Msg : 'OPC Session Error'}); logger.error("OPC session error") ; }
  // if (sql != 'Read') socket.emit('Error', { Component: 'SQL', Property : 'Session', Value : 'Off'})
});

var config_DONNEES = {
    user: 'BdConnectClient',
    password: 'Uuxwp7Mcxo7Khy',
    // user : 'root',
    // password:'P@ssw0rd',
    // server: 'localhost\\SQLEXPRESS', // You can use 'localhost\\instance' to connect to named instance
    server: '10.18.10.3\\MSSQLSERVER',
    database: 'DONNEES',

    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
}

var config_ARCHIVES = {
    user: 'BdConnectClient',
    password: 'Uuxwp7Mcxo7Khy',
    // user : 'root',
    // password:'P@ssw0rd',
    // server: 'localhost\\SQLEXPRESS', // You can use 'localhost\\instance' to connect to named instance
    server: '10.18.10.3\\MSSQLSERVER',
    database: 'ARCHIVES',

    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
}

function OPC_connect()
{


}

async.series([



  function(callback)  {
    sql.connect(config_DONNEES).then(function() {
        // Query
    logger.info('MS SQL connected success');
        var request =  new sql.Request()

         //    .input('input_parameter', sql.Int, value)
          // .query('select TOP 5 * from SUPERVISION where id = @input_parameter').then(function(recordset) {

          .query('select TOP '+ SELECT + ' * from dbo.SUPERVISION  ').then(function(recordset) {

          //  ids=JSON.stringify(recordset, [ 'Metier', 'Installation_technique','NomGroupeFonctionnel','DesignGroupeFonctionnel','NomObjetFonctionnel','DesignObjetFonctionnel','Information','Libelle_information']);
          ids = JSON.parse(JSON.stringify(recordset).replace(/"\s+|\s+"/g,'"'))
          console.log(Object.keys(ids).length);

          //  TOTAL = Object.keys(ids).length;
          // console.log(ids);
          callback();
          }).catch(function(err) {

            console.log(err.name + ' --> ' + err.code + ' : ' + err.message);
        });

        }).catch(function(err) {
            console.log(err.name + ' --> ' + err.code + ' : ' + err.message);

        });

  },
    // step 1 : connect to
    function(callback)  {
        client.connect(endpointUrl,function (err) {
            if(err) {
                logger.info(" cannot connect to endpoint :" , endpointUrl );
            } else {
                logger.info("OPC connected !");
            }
          callback(err);
        });

                   client.on("timed_out_request ", function () {
                      logger.info("timed_out_request ");
                   });
                   client.on("start_reconnection", function () {
                       logger.info("start_reconnection not working so aborting");
                       the_session.close(function (err) {
                         if(!err) {
                             logger.info("OPC session Closed" , endpointUrl );
                         }
                       })
                       client.disconnect(function (err) {
                         if(!err) {
                             logger.info("OPC Disconnected" , endpointUrl );
                         }
                       })

                   });

                   client.on("connection_reestablished", function () {
                       logger.info("connection_reestablished ");
                       client.connect(endpointUrl,function (err) {
                           if(err) {
                               logger.info(" cannot connect to endpoint :" , endpointUrl );
                           } else {
                               logger.info("OPC connected !");
                           }
                       });
                       client.createSession( function(err,session) {
                           if(!err)
                             { the_session = session;
                               logger.info("Session Ok !");
                               callback(err);
                             }
                       });

                   });
                   client.on("close", function () {
                       logger.info("close and abort");
                                          });
                   client.on("backoff", function (nb, delay) {
                       logger.info("  connection failed for the", nb,
                               " time ... We will retry in ", delay, " ms");
                   });

    },

    // step 2 : createSession
    function(callback) {
        client.createSession( function(err,session) {
            if(!err)
              { the_session = session;
                logger.info("Session Ok !");
                callback(err);
              }
        });
    },
    function(callback) {

    //subscription to general OPC parameters ( Alarms Nbr , ....)
      var  init_OPC_sub=new opcua.ClientSubscription(the_session,{
        requestedPublishingInterval: 1000,
        requestedLifetimeCount: 10,
         requestedMaxKeepAliveCount: 2,
           maxNotificationsPerPublish: 1,
           publishingEnabled: true,
           priority: 8
       });
      var id ;
       for (var i = 0, len = sub_param.length; i < len; i++) {
       id = sub_param[i];
              var nodeId = "ns=2;s=" + id.adr;
              var monitoredItem  = init_OPC_sub.monitor({
                 nodeId: opcua.resolveNodeId(nodeId),
                 attributeId: opcua.AttributeIds.Value
               },   {samplingInterval: 1000,discardOldest: false,queueSize: 1 },
                 opcua.read_service.TimestampsToReturn.Both
                 );

              monitoredItem.on("changed",function(dataValue){
              //io.sockets.emit('Event',dataValue.value.value);
              if (dataValue.value != null )
              {id.value = dataValue.value.value;
              socket.emit('OPC_General_Update',id);

             }
              //  console.log(nodeId.toString() , "\t value : ",dataValue.value.value.toString());
              });
    };

  logger.info('Subscription Finished');
  callback(err);
  },
    function(callback) {
// souscription à toutes les variables OPC

       var the_subscription=new opcua.ClientSubscription(the_session,{
           requestedPublishingInterval: 100,
        //   requestedLifetimeCount: 10,
        //   requestedMaxKeepAliveCount: 2,
           maxNotificationsPerPublish: 1,
           publishingEnabled: true,
           priority: 10
       });

       // install monitored item
       for (var i = 0, len = ids.length; i < len; i++) {
       id = ids[i];
  if  (i< BATCH_MONITORING) {
    var adr;
              Mnemo = id.Metier + '_' + id.Installation_technique;
              Mnemo +=  '_' + id.NomGroupeFonctionnel + id.DesignGroupeFonctionnel;
              Mnemo +=  '_' + id.NomObjetFonctionnel + id.DesignObjetFonctionne ;
              Mnemo +=  '_' + id.Information ;
              adr = '/Application/STEGC/Paris/PT/' + id.Installation_technique ;
              adr += '/Acquisition/' + Mnemo + '.Valeur';
              // id.Mnemo = Mnemo;
              var nodeId = "ns=2;s=" + adr;
              var monitoredItem  = the_subscription.monitor({
                 nodeId: opcua.resolveNodeId(nodeId),
                 attributeId: opcua.AttributeIds.Value
               },   {samplingInterval: 1000, discardOldest: false,queueSize: 10 },
                 opcua.read_service.TimestampsToReturn.Both
                 );

              monitoredItem.on("changed",function(dataValue){
              //io.sockets.emit('Event',dataValue.value.value);
              if (dataValue.value != null )
              id.Value = dataValue.value.value  ;
              socket.emit('OPC_Update',id);
              //  console.log(nodeId.toString() , "\t value : ",dataValue.value.value.toString());
              });
          i++;
          } else {
          sleep(WAIT);
          logger.info('wait');
          i=0;
          }
    };
    logger.info('Global Subscription Finished');

  },

    // close session
    function(callback) {
        the_session.close(function(err){
            if(err) {
                logger.info("session closed failed ?");
            }

        });
    }

],
function(err) {
    if (err) {
        logger.info(" failure ",err);
    } else {
        logger.info("done!");
    }
    client.disconnect(function(){});
}) ;
