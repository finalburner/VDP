"use strict";//----------------------OPC-------------------------
const P = require('./OPC_param.js')
const winston = require('winston');
const async = require("async");
const sql = require('mssql');
const sleep = require('system-sleep');
const opcua = require("node-opcua");
var io = require('socket.io-client');
var client = new opcua.OPCUAClient({keepSessionAlive: true});
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
var socket = io.connect('http://localhost:3000', {reconnect: true, "connect timeout" : 2000});
var NodeId = "ns=2;s=" ;

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ level: 'debug', handleExceptions: true }), // level 7 = max ==> all messages logged
    new (winston.transports.File)({ filename: 'logfile.log', level: 'debug' }) // level 7 = max ==> all messages logged
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
    CT_PT_List.data = JSON.parse(JSON.stringify(rec).replace(/"\s+|\s+"/g,'"'))
    len = CT_PT_List.data.length ;
    for (var i = 0; i < len; i++) {
    tmp = NodeId + '/Application/STEGC/Paris/PT/' + CT_PT_List.data[i].Installation_technique ;
    var AD = tmp + '/_Entite/Adresse' ;  // Adresse
    var CP = tmp + '/_Entite/CodePostal' ; //Code Postale
    var VI = tmp + '/_Entite/Ville' ; //Ville
    var LAT = tmp + '/_Entite/Latitude' ;  //latitude
    var LONG = tmp + '/_Entite/Longitude' ;  //Longitude
    var AL_10 = tmp + '/_Entite/SyntheseDefCom/ExistPresent' //Présence Alarme DefCom
    var AL_3 = tmp + '/_Entite/SyntheseCritique/ExistPresent' //Présence Alarme Critique
    var AL_2 = tmp + '/_Entite/SyntheseMajeure/ExistPresent' //Présence Alarme Majeure
    var AL_1 = tmp + '/_Entite/SyntheseMineure/ExistPresent' //Présence Alarme Mineure
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
    CT_PT_List.data[j].ADR = dataValue[i].value.value + ' ' + dataValue[i+1].value.value + ' ' + dataValue[i+2].value.value; //Adresse Complète
    if (dataValue[i+3] && dataValue[i+3].value) CT_PT_List.data[j].LAT = dataValue[i+3].value.value;
    if (dataValue[i+4] && dataValue[i+4].value) CT_PT_List.data[j].LONG = dataValue[i+4].value.value;
    CT_PT_List.data[j].AL_Color = P.ALARM.AL_0_Color;
    if (dataValue[i+5] && dataValue[i+5].value && dataValue[i+5].value.value) CT_PT_List.data[j].AL_Color = P.ALARM.AL_1_Color;
    if (dataValue[i+6] && dataValue[i+6].value && dataValue[i+6].value.value) CT_PT_List.data[j].AL_Color = P.ALARM.AL_2_Color;
    if (dataValue[i+7] && dataValue[i+7].value && dataValue[i+7].value.value) CT_PT_List.data[j].AL_Color = P.ALARM.AL_3_Color;
    if (dataValue[i+8] && dataValue[i+8].value && dataValue[i+8].value.value) CT_PT_List.data[j].AL_Color = P.ALARM.AL_10_Color;
    }
  CT_PT_List.info = { OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID }
// console.log(CT_PT_List)
socket.emit('CT_Answer', CT_PT_List)
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
      var  query = "Select Installation_technique,DesignGroupeFonctionnel,DesignObjetFonctionnel,Information,Libelle_information,Type,TOR_CodeEtat1,TOR_CodeEtat0 from dbo.SUPERVISION " ;
       query += "WHERE localisation = \'" + data.Selected_CT + "\' ";
       query += "AND NomGroupeFonctionnel = \'GENER\' AND NomObjetFonctionnel = \'SYNTH\' ";
       query += "AND Metier = \'CVC\'";

      var request = new sql.Request().query(query).then(function(rec) {
        R = JSON.parse(JSON.stringify(rec).replace(/"\s+|\s+"/g,'"'))
       var len = R.length ;
       // console.log(R)
       for (var i = 0; i < len; i++) {
          var Metier = 'CVC';
          var NomGroupeFonctionnel = 'GENER';
          var NomObjetFonctionnel = 'SYNTH';
          var Mnemo = Metier + '_' + R[i].Installation_technique;
          Mnemo +=  '_' + NomGroupeFonctionnel + R[i].DesignGroupeFonctionnel;
          Mnemo +=  '_' + NomObjetFonctionnel + R[i].DesignObjetFonctionnel ;
          Mnemo +=  '_' + R[i].Information ;
          var adr = '/Application/STEGC/Paris/PT/' + R[i].Installation_technique ;
          adr += '/Acquisition/' + Mnemo + '.Valeur';
          var NodeId = "ns=2;s=" + adr;
          R[i].Mnemo = Mnemo ;
          OPC_Read.push(NodeId)
        }

      the_session.readVariableValue(OPC_Read, function(err,dataValue,diagnostics) {
            if (err)
            { logger.error("OPC error");logger.error(diagnostics);logger.error(err); }
            else {
            for(i=0 ; i< len ; i++)
            {
            var id = R[i] ;
            if (dataValue[i] && dataValue[i].value)
                  {
                  id.Value =  dataValue[i].value.value
                  if (id.Value)
                  id.Etat= id.TOR_CodeEtat1
                  else
                  id.Etat= id.TOR_CodeEtat0
                 }
                 var Retour = {OPC_Socket_ID : data.OPC_Socket_ID , Socket_ID: data.Socket_ID , Libelle_information : id.Libelle_information , Etat: id.Etat , len : len , item : i };
                 socket.emit('Sta_Answer', Retour);
                 console.log(Retour)
               } }
       })
  }).catch(function(err) {
  logger.error(err)
  });

    }
    else { socket.emit('Notif_All', { Msg : 'OPC Session Error'}); logger.error("OPC session error") ; }
    // if (sql != 'Read') socket.emit('Error', { Component: 'SQL', Property : 'Session', Value : 'Off'})
   });

socket.on('CTA_Query', function (data){
  logger.info('CTA_query from ' + data.Socket_ID)
if (the_session)
{
var NodeId = "ns=2;s=" ;
var OPC_Read = []  ;
var len ;
var query ;
// console.log(data)
if (data.Selected_CT == 'null' )
logger.info('No CT Selected')
else {
query = "Select distinct Libelle_groupe,DesignGroupeFonctionnel,Installation_technique from dbo.SUPERVISION Where localisation =\'" + data.Selected_CT + "\' AND NomGroupeFonctionnel = 'CIRCU' AND Metier = 'CVC'"

  var request = new sql.Request().query(query).then(function(rec) {
  var recordset=JSON.parse(JSON.stringify(rec).replace(/"\s+|\s+"/g,'"'))
  if (recordset) {

    len = recordset.length
    for (var i = 0 ; i < len; i++) {
    var id = recordset[i];
    var PT = id.Installation_technique;
    var Circuit = id.Libelle_groupe;
    var Design = id.DesignGroupeFonctionnel;
    var AMBIA = '/STEGC/Paris/PT/' + PT + '/Acquisition/' + 'CVC_' + PT + '_CIRCU' + Design + '_TEMP3AMBIA_M01';
    var DEPAR=  '/STEGC/Paris/PT/' + PT + '/Acquisition/' + 'CVC_' + PT + '_CIRCU' + Design + '_TEMP3DEPAR_M01';
    var TEMP3_AMBIA = NodeId + '/Application' + AMBIA + '.Valeur' ;
    var TEMP3_DEPAR = NodeId + '/Application' + DEPAR + '.Valeur' ;
    // COURBE1 = 'SELECT TOP 5 TriggeringValue  FROM dbo.Evenements_' + PT + ' where Name = \'' + AMBIA + '/Evt\' ORDER BY UTC_App_DateTime DESC '
    // COURBE2 = 'SELECT TOP 5 TriggeringValue  FROM dbo.Evenements_' + PT + ' where Name = \'' + DEPAR + '/Evt\' ORDER BY UTC_App_DateTime DESC'
  // console.log(id)
   OPC_Read.push(TEMP3_AMBIA,TEMP3_DEPAR)
  }
  var opc_len = OPC_Read.length ;
  // console.log(OPC_Read)
  // console.log(len)
  // console.log(opc_len)

    the_session.readVariableValue( OPC_Read, function(err,dataValue,diagnostics) {
              if (err)
             { logger.error("OPC error");logger.error(diagnostics);logger.error(err); }
              else {
              for(i=0 ; i< opc_len ; i = i + 2)
              {
                id = recordset[i/2];
                if (dataValue[i])
                 { // console.log(dataValue[0])
                   if (dataValue[i].value)  {
                     id.TEMP3_AMBIA_SRC = TEMP3_AMBIA
                     id.TEMP3_AMBIA = dataValue[i].value.value


                      // new sql.Request().query(COURBE1).then(function(recordset) {
                      // recordset=JSON.parse(JSON.stringify(recordset).replace(/"\s+|\s+"/g,'"'))
                      // if (recordset)
                      // id.TEMP3_AMBIA_ARC = recordset['TriggeringValue']
                      // });
                   }
 }
 //Monitor TEMP3_AMBI
// var monitem = the_subscription.monitor({
// nodeId: opcua.resolveNodeId(TEMP3_AMBIA),
// attributeId: opcua.AttributeIds.Value
// },   {samplingInterval: 100,discardOldest: false,queueSize: 1 },
// opcua.read_service.TimestampsToReturn.Both
// )
// // console.dir(monitem)
// monitem.on("changed", function(dataValue){
// id.TEMP3_AMBIA = dataValue.value.value ;
// var Retour = Object.assign({ OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID }, id);
// socket.emit('CTA_Answer_Update', Retour);
// console.log(id)
// });


                if (dataValue[i+1])
                { //console.log(dataValue[1])
                  if (dataValue[i+1].value)
                  { id.TEMP3_DEPAR_SRC = TEMP3_DEPAR
                    id.TEMP3_DEPAR = dataValue[i+1].value.value

                    //  new sql.Request().query(COURBE2).then(function(recordset) {
                    //  recordset=JSON.parse(JSON.stringify(recordset).replace(/"\s+|\s+"/g,'"'))
                    //  if (recordset)
                    //   d.TEMP3_DEPAR_ARC = recordset['TriggeringValue']
                    // });
                   }

                }
// console.log(id)
var Retour = Object.assign({ OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID , len : len, item : i/2  }, id );
socket.emit('CTA_Answer', Retour);
logger.info("CTA Emit ")
// console.log(Retour)

              }
            }

});
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
  console.dir(data)
  if (data.Selected_CT == 'null' )
  {query = "Select top 300 ANA_Unite,ANA_ValeurMini,ANA_ValeurMaxi,Libelle_information,localisation,Metier,Installation_technique,NomGroupeFonctionnel,DesignGroupeFonctionnel,NomObjetFonctionnel,DesignObjetFonctionnel,Information,TOR_CriticiteAlarme,TOR_CodeEtat0,TOR_CodeEtat1"
  query+= " from dbo.SUPERVISION WHERE Type = 'TA' and Metier = 'CVC' "}
  else
  {query = "Select * "
   query+="from dbo.SUPERVISION WHERE Type = 'TA' and localisation =\'" + data.Selected_CT +"\'"}

  var request = new sql.Request().query(query).then(function(rec) {
  if (rec) {
  var recordset=JSON.parse(JSON.stringify(rec).replace(/"\s+|\s+"/g,'"'))
  var len = recordset.length ;
  var opc_len ;
  // console.log(recordset)
  for (var i = 0 ; i < len; i++) {
  var id = recordset[i];
  // var adr;
                  var Mnemo = id.Metier + '_' + id.Installation_technique;
                  Mnemo +=  '_' + id.NomGroupeFonctionnel + id.DesignGroupeFonctionnel;
                  Mnemo +=  '_' + id.NomObjetFonctionnel + id.DesignObjetFonctionnel ;
                  Mnemo +=  '_' + id.Information ;
                  var adr = '/Application/STEGC/Paris/PT/' + id.Installation_technique ;
                  adr += '/Acquisition/' + Mnemo ;
                  var NodeId = "ns=2;s=" + adr;
                  // if (id.TOR_CriticiteAlarme && id.Libelle_information )
                  // AlmToRead.push({ NodeId : NodeId , Mnemo : Mnemo , Libelle: id.Libelle_information, Criticite : id.TOR_CriticiteAlarme , Actif : '' , Ack : ''});
                  {
                  OPC_Read.push(NodeId + '.valeur')
                  OPC_Read.push(NodeId + '/Alm/Acknowledged')
                  recordset[i].Mnemo = Mnemo
                  recordset[i].NodeId = NodeId
               }
     };
      opc_len = OPC_Read.length ;
      the_session.readVariableValue(OPC_Read, function(err,dataValue,diagnostics) {
                if (err) {
					    	logger.error("OPC error");logger.error(diagnostics);logger.error(err); }
					      else {
    for (var i = 0 ; i < opc_len ; i+= 2) {
//Gestion d'erreur OPC lecture attribut Actif
// console.log(opc_len)
  id = recordset[i/2];
if (dataValue[i].statusCode )
{
  if (dataValue[i].statusCode._base)
  {
     id.StatusCode_Actif = dataValue[i].statusCode._base['name'];
     if ( id.StatusCode_Actif = 'Good' && dataValue[i].value)
     Actif = dataValue[i].value.value;
  }
  if (dataValue[i].statusCode['name'])
  {
      id.StatusCode_Actif = dataValue[i].statusCode['name'];
      if( id.StatusCode_Actif = 'Good' && dataValue[i].value)
      Actif= dataValue[i].value.value;
  }
 }
//Gestion d'erreur OPC lecture attribut Ack

 if (dataValue[i+1].statusCode )
 {
   if (dataValue[i+1].statusCode._base)
   {
      id.StatusCode_Ack = dataValue[i+1].statusCode._base['name'];
      if ( id.StatusCode_Ack = 'Good' && dataValue[i+1].value)
      Ack = dataValue[i+1].value.value;
    }

  if (dataValue[i+1].statusCode['name'])
    {
       id.StatusCode_Ack = dataValue[i+1].statusCode['name'];
       if( id.StatusCode_Ack = 'Good' && dataValue[i+1].value)
       Ack = dataValue[i+1].value.value;
    }

  }

// if(!(Ack && !Actif))
{

//Renvoi de l'alarme unitaire vers le client

var Retour = Object.assign({ len : len , item : i/2 , Actif : Actif , Ack : Ack,  OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID },id);
// console.log(Retour)
socket.emit('AL_Answer', Retour);
}
    }}

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
var methodsToCall = [];
   methodsToCall.push({
    objectId: opcua.resolveNodeId(data.NodeId + '/Alm'),
    methodId: opcua.resolveNodeId(data.NodeId + '/Alm.AckRequest'),
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
       socket.emit('Notif_Client', { Msg : data.Libelle + ' acquitté(e)' , Socket_ID : data.Socket_ID});
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
  if (data.Selected_CT && data.Selected_Grp)
  {
  query =  "Select Metier, Installation_technique, NomGroupeFonctionnel, "  // Consigne Analogique
  query += " DesignGroupeFonctionnel , NomObjetFonctionnel ,  DesignObjetFonctionnel ,"
  query += " Information, Libelle_groupe, Libelle_information, Type, ANA_Unite, ANA_ValeurMini, ANA_ValeurMaxi, "
  query += " TOR_CodeEtat0, TOR_CodeEtat1 from dbo.SUPERVISION WHERE Localisation =\'"+ data.Selected_CT +"\'"
  query += " AND NomGroupeFonctionnel = \'CIRCU\' AND DesignGroupeFonctionnel= \'" + data.Selected_Grp
  query += "\' AND Type IN (\'TC\' , \'TR\') AND Metier = \'CVC\' order by Type "
  // console.log(query)
}
  else
   query = "Select Metier, Installation_technique, NomGroupeFonctionnel, DesignGroupeFonctionnel , NomObjetFonctionnel ,  DesignObjetFonctionnel , Information, Libelle_groupe, Libelle_information, Type, ANA_Unite, ANA_ValeurMini, ANA_ValeurMaxi, TOR_CodeEtat0, TOR_CodeEtat1 from dbo.SUPERVISION Where Localisation =\'CT93213\' AND NomGroupeFonctionnel = \'CIRCU\' AND Type IN (\'TC\' , \'TR\') AND metier = \'CVC\' order by Type "
  // query = "Select distinct Libelle_groupe,DesignGroupeFonctionnel,Installation_technique from VDP.dbo.SUPERVISION WHERE localisation =\'" + data.Selected_CT + "\' AND NomGroupeFonctionnel = 'CIRCU' AND Metier = 'CVC'"
    var request = new sql.Request().query(query).then(function(rec) {
    var recordset=JSON.parse(JSON.stringify(rec).replace(/"\s+|\s+"/g,'"'))
    // console.log(recordset)
    var len = recordset.length
    if (recordset) {

      for (var i = 0 ; i < len; i++) {
        var id = recordset[i] ;
      var Mnemo = id.Metier + '_' + id.Installation_technique;
      Mnemo +=  '_' + id.NomGroupeFonctionnel + id.DesignGroupeFonctionnel;
      Mnemo +=  '_' + id.NomObjetFonctionnel + id.DesignObjetFonctionnel ;
      Mnemo +=  '_' + id.Information ;
      recordset[i].Mnemo = Mnemo ;
      var adr = '/Application/STEGC/Paris/PT/' + id.Installation_technique ;
      adr += '/Acquisition/' + Mnemo ;
      recordset[i].adr = NodeId + adr + '.Valeur' ;
      // console.log(id)
      OPC_Read.push(recordset[i].adr)
      }
      // console.log(OPC_Read)
      var opc_len = OPC_Read.length
      var Value,Local_Value ;
      the_session.readVariableValue(OPC_Read, function(err,dataValue,diagnostics) {
                if (err)
                {logger.error("OPC error");logger.error(diagnostics);logger.error(err);}
                else {
   for(i=0 ; i < opc_len ; i++)
    {              // console.dir(dataValue)
      // console.log(i)
  id = recordset[i];
  if (dataValue[i] && dataValue[i].value) {
  id.Value = dataValue[i].value.value
  id.Local_Value = id.Value ;

    //Renvoi de la consigne unitaire vers le client
    var Retour = Object.assign({ len : len , item : i , OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID }, id);
    socket.emit('Cons_Answer', Retour);
        }
      }
    }
    });
  };
 });
}
if ( data.Mode =="Write" && Write_Perm ) {
logger.warning("Write Forbidden : " + data.adr )
if (data.Type == "TC")
  {

var nodeToWrite = [
       {
           nodeId: opcua.resolveNodeId(data.adr ),
           attributeId: opcua.AttributeIds.Value,
           indexRange: null,
           value: { /* dataValue*/
              //  sourceTimestamp: new Date(2015, 5, 3),
              //  sourcePicoseconds: 30,
               value: { /* Variant */
                   dataType: opcua.DataType.Boolean,
                    value: data.Local_Value
               }     }       }   ];
}
if (data.Type == "TR")
  {
        // console.log(data)
var nodeToWrite = [
       {
           nodeId: opcua.resolveNodeId(data.adr ),
           attributeId: opcua.AttributeIds.Value,
           indexRange: null,
           value: { /* dataValue*/
              //  sourceTimestamp: new Date(2015, 5, 3),
              //  sourcePicoseconds: 30,
               value: { /* Variant */
                   dataType: opcua.DataType.Double,
                    value: data.Local_Value
               }     }       }   ];
}


   the_session.write(nodeToWrite, function (err, statusCodes) {
      if (!err) {
          console.log( statusCodes.length + '--' + nodeToWrite.length);
          console.log( statusCodes[0] + '--' + opcua.StatusCodes.BadNotWritable);
          console.log(statusCodes + '--' + opcua.StatusCodes.Good);

         the_session.readVariableValue(data.adr , function(err,dataValue,diagnostics) {
         if (err) {
        logger.error("OPC error");logger.error(diagnostics);logger.error(err); }
        else {
      if (dataValue && dataValue.value) {
        console.log(dataValue)
      data.Value = dataValue.value.value;
      //Renvoi de la consigne unitaire vers le client
      socket.emit('Notif_Client', { Msg : data.Libelle_information + ' changé à \'' + data.Value + '\'', Socket_ID : data.Socket_ID})
      socket.emit('Cons_Answer_Update', data);
      }

      }
    });
  }
      else logger.error(err)

});
}
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


async.series([



  function(callback)  {
    sql.connect(config_DONNEES).then(function() {
        // Query
    logger.info('MS SQL connected success');
        var request =  new sql.Request()

         //    .input('input_parameter', sql.Int, value)
          // .query('select TOP 5 * from SUPERVISION where id = @input_parameter').then(function(recordset) {
        //  .query('select TOP '+ SELECT +' * from VDP.dbo.SUPERVISION Where Type= \'TA\' ').then(function(recordset) {
        // .query('select TOP '+ SELECT +' * from VDP.dbo.SUPERVISION Where Type= \'TM\' ').then(function(recordset) {
          .query('select TOP '+ SELECT + ' * from dbo.SUPERVISION  ').then(function(recordset) {
        // .query('select * from VDP.dbo.SUPERVISION ').then(function(recordset) {
        //  ids= recordset;

            // console.dir(recordset);
          //  ids=JSON.stringify(recordset, [ 'Metier', 'Installation_technique','NomGroupeFonctionnel','DesignGroupeFonctionnel','NomObjetFonctionnel','DesignObjetFonctionnel','Information','Libelle_information']);
          //  ids=ids.replace(/\s/g, "") ;
          //  ids=JSON.parse(ids);
          ids = JSON.parse(JSON.stringify(recordset).replace(/"\s+|\s+"/g,'"'))
          console.log(Object.keys(ids).length);

          //  TOTAL = Object.keys(ids).length;
          // console.log(ids);
          callback();
          }).catch(function(err) {

            console.log(err.name + ' --> ' + err.code + ' : ' + err.message);
        });
    ////////////////// STORED SQL PROCEDURE ///////////////////////////////////
            // new sql.Request()
            // .input('input_parameter', sql.Int, value)
            // .output('output_parameter', sql.VarChar(50))
            // .execute('procedure_name').then(function(recordsets) {
            //     console.dir(recordsets);
            // }).catch(function(err) {
            //     // ... error checks
            // });
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
            return callback(err);
        });
    },

    // step 2 : createSession
    function(callback) {
        client.createSession( function(err,session) {
            if(err)   callback(err);
              else
              { the_session = session;
                logger.info("Session Ok !");
            }

        });
    },
    function(callback) {

    //subscription to general OPC parameters ( Alarms Nbr , ....)

       init_OPC_sub=new opcua.ClientSubscription(the_session,{
           requestedPublishingInterval: 1000,
        requestedLifetimeCount: 10,
         requestedMaxKeepAliveCount: 2,
           maxNotificationsPerPublish: 1,
           publishingEnabled: true,
           priority: 8
       });
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
    return callback();
  },
    // step 3 : browse
    // function(callback) {
    //    the_session.browse("ObjectsFolder", function(err,browse_result){
    //        if(!err) {
    //            browse_result[0].references.forEach(function(reference) {
    //                logger.info(" result : " +  reference.browseName.toString());
    //            });
    //        }
    //
    //    });
    // },
    //
  //   function(callback) {
  //     var crawler = new NodeCrawler(the_session);
  //
  //       crawler.on("browsed",function(element){
  //       //  logger.info("->",element.browseName.name,element.nodeId.toString());
  //   });
  //
  //   var nodeId = "ObjectsFolder";
  //   logger.info("now crawling object folder ...please wait...");
  //   crawler.read(nodeId, function (err, obj) {
  //       if (!err) {
  //           //treeify.asLines(obj, true, true, function (line) {
  //     //       console.log(JSON.parse(obj));
  //         // });
  //           }
  //
  //   });
  // },

  //  step 4 : read a variable with readVariableValue
    // function(callback) {
    //
    //   aids.forEach(function(id){
    //   var nodeId = "ns=2;s=" + id;
    //    the_session.readVariableValue(nodeId, function(err,dataValue) {
    //        if (!err) {
    //            console.log(nodeId , " >> " , dataValue.toString());
    //        }
    //           });
    //         });
    //
    // },

    // // step 4' : read a variable with read
    // function(callback) {
    //    var max_age = 0;
    //    var nodes_to_read = [
    //       { nodeId: "ns=1;s=free_memory", attributeId: opcua.AttributeIds.Value }
    //    ];
    //    the_session.read(nodes_to_read, max_age, function(err,nodes_to_read,dataValues) {
    //        if (!err) {
    //            logger.info(" free mem % = " , dataValues[0]);
    //        }
    //
    //    });
    //
    //
    // },

    // step 5: install a subscription and install a monitored item for 10 seconds
    function(callback) {
// souscription à toutes les variables OPC

       the_subscription=new opcua.ClientSubscription(the_session,{
           requestedPublishingInterval: 100,
        //   requestedLifetimeCount: 10,
        //   requestedMaxKeepAliveCount: 2,
           maxNotificationsPerPublish: 1,
           publishingEnabled: true,
           priority: 10
       });

      //  the_subscription.on("started",function(){
      //      logger.info("subscription started for 2 seconds - subscriptionId=",the_subscription.subscriptionId);
      //  }).on("keepalive",function(){
      //      logger.info("keepalive");
      //  }).on("terminated",function(){
      //
      //  });

          /* setTimeout(function(){
           the_subscription.terminate();
       },10000);*/

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
    logger.info('Subscription Finished');

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
