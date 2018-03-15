/*jslint node:true*/
"use strict";
//----------------------OPC-------------------------
/////////////// =========================== ////////////////////
var Version = "1.3.11";
/////////////// =========================== ////////////////////
var P =       require(process.cwd() + '/OPC_param.js');
var winston = require('winston');
var async =   require("async");
var sql =     require('mssql');
var fs =      require('fs');
var sleep =   require('system-sleep');
var opcua =   require("node-opcua");
var io =      require('socket.io-client');
var dateFormat  = require("dateFormat");

var SRV_STATUS = { SQL : {}, OPC : {}};

// var crypto_utils = require("lib/misc/crypto_utils");
console.log("Serveur Mobilite OPC version : " + Version);
var client = new opcua.OPCUAClient(P.OPC_OPTIONS);
var the_session, the_subscription;
var ids;
var i = 0;
var Write_Perm = true; //activer le controle-commande
var BATCH_MONITORING = 0;
var WAIT = 100;
var SELECT = 0;
var Mnemo;
var list_AL;
// console.log(P)
var socket = io.connect(P.SRV_MOBILITE.SRVGST.IP, P.SRV_MOBILITE.SRVGST.PARAM);
var NodeId = "ns=2;s=";

var logger = new (winston.Logger)({  transports: [
    new (winston.transports.Console)({ level: 'debug', handleExceptions: true }), // level 7 = max ==> all messages logged --> console
    new (winston.transports.File)({ filename: 'logfile.log', level: 'debug' })],
    exitOnError: false }); // level 7 = max ==> all messages logged --> file

// if (io.connected === false && io.connecting === false)
// {io.connect(P.SRV_MOBILITE.SOCKET);
// logger.info('Connected to client on ' + P.SRV_MOBILITE.SOCKET );}

function SEND_CT_OPC(data, CT_PT_List) {
  var tmp, len, energie, OPC_Read = [];
  // console.log(CT_PT_List)
  len = CT_PT_List.length;
  var AL_10,AL_3,AL_2,AL_1;
  for (var i = 0; i < len; i++) {
  tmp = NodeId + '/Application/STEGC/Paris/PT/PT' + CT_PT_List[i].I;
  AL_10 = tmp + '/_Entite/SyntheseDefCom/ExistPresent' //Présence Alarme DefCom
  AL_3 = tmp + '/_Entite/SyntheseCritique/ExistPresent' //Présence Alarme Critique
  AL_2 = tmp + '/_Entite/SyntheseMajeure/ExistPresent' //Présence Alarme Majeure
  AL_1 = tmp + '/_Entite/SyntheseMineure/ExistPresent' //Présence Alarme Mineure
  // console.log(LAT)
  // var OPC_Read = {AD,CP,VI,LAT,LONG,AL_10,AL_3,AL_2,AL_1 }
  OPC_Read.push(AL_1,AL_2,AL_3,AL_10);
   }
  //  console.log(OPC_Read)
   var opc_len = OPC_Read.length;
   if (the_session)
       {

 the_session.readVariableValue(OPC_Read,function(err,dataValue,diagnostics) {
  if (err)
  {
   logger.error("OPC error" ) //local logging
   console.dir(err)
   OPC_Report(err, 'OPC_E') // Reporting
   }
  else {
    // console.dir(dataValue)
  for(i=0 ; i< opc_len ; i = i + 4)
  {
  var j= i/4 ;
  // CT_PT_List[j].A = CT_PT_List[j].AD + CT_PT_List[j].CP + CT_PT_List[j].VI //Adresse Complète
  CT_PT_List[j].AL = P.ALARM.AL_0_Color;
  if (dataValue[i] && dataValue[i].value && dataValue[i].value.value) CT_PT_List[j].AL = P.ALARM.AL_1_Color;
  if (dataValue[i+1] && dataValue[i+1].value && dataValue[i+1].value.value) CT_PT_List[j].AL = P.ALARM.AL_2_Color;
  if (dataValue[i+2] && dataValue[i+2].value && dataValue[i+2].value.value) CT_PT_List[j].AL = P.ALARM.AL_3_Color;
  if (dataValue[i+3] && dataValue[i+3].value && dataValue[i+3].value.value) CT_PT_List[j].AL = P.ALARM.AL_10_Color;
  // //map radius
  if (CT_PT_List[j].AL == P.ALARM.AL_0_Color) CT_PT_List[j].rad = "30"
  else  CT_PT_List[j].rad = "70"
  if(CT_PT_List[j].D)
  {
  switch(CT_PT_List[j].D.split('_')[1].substr(-1))  {
    case 'V' :
    energie ='Vapeur'
    break;
    case 'E' :
    energie ='Electricité'
    break;
    case 'G' :
    energie ='Gaz'
     break;
    default : energie = CT_PT_List[j].D.split('_')[1].substr(-1)
  }
  CT_PT_List[j].D = CT_PT_List[j].D.split('_')[2] + " " + energie  + " " + CT_PT_List[j].D.split('_')[3]
 }
  }
  // console.log(CT_PT_List)
CT_PT_List.push({OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID })
socket.compress(true).emit('CT_Answer', CT_PT_List )
logger.info('CT_Answer to ' + data.Socket_ID )
}
}) // OPCEND
}
   else { socket.emit('Notif_All', { Msg : 'OPC Session Error'}); logger.error("OPC session error") ; }// Reporting }
}


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

function OPC_Report(event, type, info)
{
socket.emit('OPC_Report',{ event : event , type : type , info : info});
}

// function AutoUpdate() {
//
// }

// setTimeout(AutoUpdate, 1000);
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

socket.on('AST_Query', function(data){
  // console.log(data)
  logger.info('AST_query from ' + data.Socket_ID)
  var query = "Select UTI_LOGIN as username, UTI_HAB_ASTREINTE as AST from BDD_DONNEES.dbo.UTILISATEUR Where UTI_LOGIN = \'"+ data.user_sql +"\'" ;
  var request =  new sql.Request().query(query).then(function(recordset) {
  var rec = recordset.recordset
  if(rec.length == 1 && data.user_sql == rec[0].username)
  {
    data.AST = rec[0].AST
    socket.emit('AST_Answer', data);
    logger.info('AST_Answer to ' + data.Socket_ID)
  }
  else {
       data.user_sql = ''
       socket.emit('AST_Answer', data);
    }
  })
});

socket.on('SRV_Query', function (data) {
  SRV_STATUS.Version = Version
  var ToSend = [ SRV_STATUS ]
  ToSend.Socket_ID = data.Socket_ID
  ToSend.push({OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID })
  logger.info('SRV_query from ' + data.Socket_ID)
  socket.emit('SRV_Answer', ToSend);
});

socket.on('UPD_Query', function (data) {
  var ToSend = []
  var request = new sql.Request()
  request.execute('MOBILITE.DBO.MOBILITE_UPDATE', (err, rec) => {
    if(rec)
    {
      ToSend.push(rec.recordset[0])
      ToSend.push({OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID })
      logger.info('UPD_query from ' + data.Socket_ID)
      socket.emit('UPD_Answer', ToSend);
      console.log(ToSend)
    }
  })
// SRV_STATUS.Version = Version
// var ToSend = [ SRV_STATUS ]
// ToSend.Socket_ID = data.Socket_ID
// ToSend.push({OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID })
// logger.info('SRV_query from ' + data.Socket_ID)
// socket.emit('SRV_Answer', ToSend);

});

//Socket query for list CT on SQL
socket.on('CT_Query', function(data){
      console.log(data);
      logger.info('CT_query from ' + data.Socket_ID);
      var CT_PT_List = [];
      var request = new sql.Request();
      request.verbose = true;
      request.input('LOGIN', sql.NVarChar, data.username)
      request.input('ASTREINTE', sql.Bit, data.AST_Checked)
      request.execute('BDD_DONNEES.dbo.MOBILE_GET_UTILISATEUR_CT', (err, rec) => {
      if (err) {
      logger.error(err) ; OPC_Report(err, 'SQLO_E') // Reporting
      }
      else
      {
      CT_PT_List = JSON.parse(JSON.stringify(rec.recordset).replace(/"\s+|\s+"/g,'"'))
      // console.log( CT_PT_List )
      if (CT_PT_List.length > 0 ) SEND_CT_OPC(data,CT_PT_List)
      else logger.info('CT_Query ERROR : AUCUN CT retrouvé ' + data.Socket_ID )
     }
     })


  // if (sql != 'Read') socket.emit('Error', { Component: 'SQL', Property : 'Session', Value : 'Off'})
 });


 //Socket query for list CT + DGF on SQL
 socket.on('PH_Query', function(data){
    console.log(data)
    logger.info('PH_Query from ' + data.Socket_ID)
    if (data.Mode == 'CT')
    {
      var request = new sql.Request();
      request.input('LOGIN', sql.NVarChar, data.username)
      request.execute('PrgHoraires.dbo.PH_GET_LIST_CT_GF', (err, rec) => {
      if (err) {
      logger.error(err) ; OPC_Report(err, 'SQLO_E') // Reporting
      }
      else
      {
      // console.log(rec)
      var CT_List = rec.recordset
      CT_List.push({OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID })
      socket.emit('PH_Answer', CT_List )
      logger.info('PH_Answer to ' + data.Socket_ID )
      }
    })
   }
  });

//Socket query for list CT + DGF on SQL
socket.on('Fic_Query', function(data){
     console.log(data)
     logger.info('Fic_Query from ' + data.Socket_ID)
     if (data.Mode == 'CT')
     {
       // Requete SQL CT + PT
       // MOBILE_GET_LIST_CT_FIC
       var request = new sql.Request();
       request.input('LOGIN', sql.NVarChar, data.username)
       request.execute('BDD_DONNEES.dbo.MOBILE_GET_LIST_CT_FIC', (err, rec) => {
       if (err) {
       logger.error(err) ; OPC_Report(err, 'SQLO_E') // Reporting
       }
       else
       {
         var CT_LIST = rec.recordset
         CT_LIST.push({OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID })
         socket.emit('Fic_Answer1', CT_LIST )
         logger.info('Fic_Answer1 to ' + data.Socket_ID )
      }

  })
  }
  //// MODE TRANCHE IMPLENTE DEPUIS L'application
   });

  //Socket query for Status list
socket.on('Sta_Query', function(data){
    console.log(data)
    var OPC_Read = [] ; //requetes OPC
    var R =[] // Listes Status
    logger.info('Sta_Query from ' + data.Socket_ID)

  if (the_session)
   {
if (data.Mode == "Read" && data.Selected_CT)
{
   var query = "Select " + P.SQL.Installation_technique + " as IT, " + P.SQL.NomGroupeFonctionnel + " as NGF, " +  P.SQL.DesignGroupeFonctionnel + " as DGF , " + P.SQL.NomObjetFonctionnel + " as NOF, "+ P.SQL.DesignObjetFonctionnel + " as DOF, " + P.SQL.Information + " as I , " + P.SQL.Libelle_information + " as L , "
       query += P.SQL.Type + " as T , " + P.SQL.TOR_CodeEtat1 + " as T1, " + P.SQL.TOR_CodeEtat0 + " as T0 from dbo.SUPERVISION WHERE " + P.SQL.Localisation + " = \'" + data.Selected_CT + "\' ";
       query += "AND ( " + P.SQL.NomGroupeFonctionnel + " = \'GENER\' OR " + P.SQL.NomGroupeFonctionnel + " = \'PRODU\' ) ";
       query += "AND " + P.SQL.Metier + " = \'CVC\' AND " + P.SQL.NomObjetFonctionnel + "= \'SYNTH\'" ;
      //  console.log(query)
      var request = new sql.Request().query(query).then(function(rec) {
      rec = JSON.parse(JSON.stringify(rec.recordset).replace(/"\s+|\s+"/g,'"'))
       var len = rec.length ;

       for (var i = 0; i < len; i++) {
         var id = rec[i]
          var Mnemo = 'CVC_PT' + id.IT + '_' + id.NGF + id.DGF + '_' + id.NOF + id.DOF + '_' + id.I ;
          var adr = '/Application/STEGC/Paris/PT/PT' + id.IT + '/Acquisition/' + Mnemo + '.Valeur';
          var NodeId = "ns=2;s=" + adr;
          OPC_Read.push(NodeId)
          R.push({ L : id.L , M : Mnemo })
        }
      console.log(OPC_Read)
      the_session.readVariableValue(OPC_Read, function(err,dataValue,diagnostics) {
            if (err)
            { logger.error("OPC error" + err );

              OPC_Report(err, 'OPC_E') // Reporting
            }
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
  OPC_Report(err, 'SQLO_E') // Reporting
  });
  }

   if ( data.Mode == "Read_Bat" )
  {
    var ToSend_CAT = [{  TEMHY :  [], TEMP3AMBIA : [] , CPTEN : [ ] , OTHERS : [] , nb : 0} ]

        var request = new sql.Request()
        request.input('NUM_CT', sql.NVarChar, data.Selected_CT)
        request.execute('MOBILE_GET_CT_ETAT', (err, rec) => {
        if (err) {
          logger.error(err)
          OPC_Report(err, 'SQLO_E') // Reporting
          }
        else {

       rec = JSON.parse(JSON.stringify(rec.recordset).replace(/"\s+|\s+"/g,'"'))
        var len = rec.length ;
         console.log(rec)
        for (var i = 0; i < len; i++) {
          var id = rec[i]
           var Mnemo = 'CVC_PT' + id.IT + '_' + id.NGF + id.DGF + '_' + id.NOF + id.DOF + '_' + id.I ;
           var adr = '/Application/STEGC/Paris/PT/PT' + id.IT + '/Acquisition/' + Mnemo + '.Valeur';
           var NodeId = "ns=2;s=" + adr;
           OPC_Read.push(NodeId)
           R[i] = id
         }

       console.log(OPC_Read)
       the_session.readVariableValue(OPC_Read, function(err,dataValue,diagnostics) {
             if (err)
             { logger.error("OPC error" + err );
               OPC_Report(err, 'OPC_E') // Reporting
               socket.emit('Notif_All', { Msg : 'OPC Session Error'}); logger.error("OPC session error")
             }
             else {
               console.dir(dataValue)
             for(i=0 ; i< len ; i++)
             {
             if (dataValue[i] && dataValue[i].value)
                   {

                   if (R[i].T == 'TA' || R[i].T == 'TC')
                   { if (dataValue[i].value.value)
                   R[i].E= rec[i].T1
                   else
                   R[i].E= rec[i].T0
                  }
                  if (R[i].T == 'TM' || R[i].T == 'TR')
                  {
                  R[i].E= dataValue[i].value.value.toFixed(2)
                 }
                 if (R[i].NOF == 'CPTEN' ) ToSend_CAT[0].CPTEN.push(R[i])
                 else if (R[i].NOF == 'TEMHY' ) ToSend_CAT[0].TEMHY.push(R[i])
                 else if (R[i].NOF == 'TEMP3' && R[i].DOF == 'AMBIA') ToSend_CAT[0].TEMP3AMBIA.push(R[i])
                 else ToSend_CAT[0].OTHERS.push(R[i])
                 ToSend_CAT[0].nb++
                }

              }
                console.log(ToSend_CAT)
                ToSend_CAT.push({OPC_Socket_ID : data.OPC_Socket_ID , Socket_ID: data.Socket_ID });
                socket.emit('Sta_Answer', ToSend_CAT);
                logger.info('Sta_Answer to ' + data.Socket_ID )

               }
        })
   }

  })

    }
    // if (sql != 'Read') socket.emit('Error', { Component: 'SQL', Property : 'Session', Value : 'Off'})
  }
   });


socket.on('Cha_Query', function (data){

//console.log(data)
var Interval = P.COURBES.Intervalle_Extraction_h;

var HLMax = new Date()
var HLMin = new Date();
HLMin.setUTCHours(HLMin.getUTCHours() - Interval )
var date_string = HLMax.getFullYear() + '-' + (HLMax.getMonth()+1) + '-' + HLMax.getDate()
var date_only = date_string.substring(0,10)
console.log(HLMax)
console.log(HLMin)
console.log(date_string)

logger.info('Cha_Query from ' + data.Socket_ID)

if (data.Selected_PT == 'null' || !data.Selected_PT)
  logger.info('No PT Selected')
else
{
  var c1,c2; //coubre adresse
  var q1,q2; //queries
  var x = []; // c1 values
  var y = []; // c2 values
  var request = new sql.Request()
  request.input('NUM_CT', sql.NVarChar, data.Selected_CT)
  request.execute('MOBILE_GET_GF', (err, rec) => {
    if (err) {
      logger.error(err)
      OPC_Report(err, 'SQLO_E') // Reporting
    }
    else {

      var h  = rec.recordset.findIndex((obj) => obj.NGF == data.NGF &&  obj.DGF == data.DGF )
      if(h != -1)
       {
         c1 = rec.recordset[h].L1 + '/Evt'
         c2 = rec.recordset[h].L2 + '/Evt'
         // console.log(c1)
         // console.log(c2)
         var request = new sql.Request()
         request.input('NUM_PT', sql.NVarChar, data.Selected_PT)
         request.input('NameC1', sql.NVarChar, c1)
         request.input('NameC2', sql.NVarChar, c2)
         request.input('ExtraDebut', sql.DateTime, HLMin)
         request.input('ExtraFin', sql.DateTime, HLMax)
         //request.input('Date', sql.Date, date_string)
         request.input('NbJour', sql.Int, P.COURBES.Intervalle_Reconstutution_j)
         request.input('intervalle', sql.Int, P.COURBES.Intervalle_Echantillonnage_m)
         request.execute('MOBILE_SUIVI_TEMPERATURES_PERIODE', (err, rec) => {
           if (err) {
             logger.error(err)
             OPC_Report(err, 'SQLO_E') // Reporting
           }
           else {
             console.log(rec.recordset)
             // var OUT = []
             //
             rec.recordset.map( (obj) => {
             if(obj.C == 'C1' && parseFloat(obj.v) + 20 >0 ) x.push({ x : obj.u , y : obj.v.toFixed(2) }) // to Array
             if(obj.C == 'C2' && parseFloat(obj.v) + 20 >0 ) y.push({ x : obj.u , y : obj.v.toFixed(2) }) // to Array
             })
             if(x.length > 0)
              {
                x.push({ OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID , Selected_CT : data.Selected_CT , NGF : data.NGF , DGF : data.DGF });
                socket.emit('Cha_Answer1', x);
                logger.info('Cha_Answer1')
              }
            if(y.length > 0)
              {
               y.push({ OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID , Selected_CT : data.Selected_CT , NGF : data.NGF , DGF : data.DGF });
               socket.emit('Cha_Answer2', y);
               logger.info('Cha_Answer2')
             }
          }
         })
        //q1 = 'SELECT TriggeringValue as v, UTC_App_DateTime as u FROM ARCHIVES.dbo.Mesure_PT' + data.Selected_PT  + ' where Name = \'' + c1 + '/Evt\' AND UTC_App_DateTime <= \'' + HLMax.toISOString() + '\' AND UTC_App_DateTime >=\' ' + HLMin.toISOString() + '\'  ORDER BY UTC_App_DateTime DESC '
      //   q2 = 'SELECT TriggeringValue as v, UTC_App_DateTime as u FROM ARCHIVES.dbo.Mesure_PT' + data.Selected_PT  + ' where Name = \'' + c2 + '/Evt\' AND UTC_App_DateTime <= \'' + HLMax.toISOString() + '\' AND UTC_App_DateTime >=\' ' + HLMin.toISOString() + '\'  ORDER BY UTC_App_DateTime DESC '

         //
         // var request = new sql.Request().query(q1).then(function(rec) {
         // var rec=JSON.parse(JSON.stringify(rec.recordset).replace(/"\s+|\s+"/g,'"'))
         // if(rec.length)
         // {
         // for (var i=0; i<rec.length; i++) // to Array
         // x.push( { x : rec[i].u , y : parseFloat(rec[i].v.replace(",",".")).toFixed(2) }) // to Array
         // if(x.length > 0)
         // {
         //   x.push({ OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID , Selected_CT : data.Selected_CT , NGF : data.NGF , DGF : data.DGF });
         // socket.emit('Cha_Answer1', x);
         // }
         // // console.log(x)
         //
         // }}).catch(function(err) {
         // logger.error(err)
         // OPC_Report(err, 'SQLO_E') // Reporting
         // });
     //
     //     // c2 values
     //     var request2 = new sql.Request().query(q2).then(function(rec2) {
     //     var rec2=JSON.parse(JSON.stringify(rec2.recordset).replace(/"\s+|\s+"/g,'"'))
     //     console.log(rec2)
     //     if(rec2.length)
     //     {
     //     for (var j=0; j<rec2.length; j++) // to Array
     //     // y.push(parseInt(rec2[j].v)) // to Array
     //     y.push( { x : rec2[i].u , y : parseFloat(rec2[i].v.replace(",",".")).toFixed(2) }) // to Array
     //     if(y.length > 0)
     //     {
     //     y.push({ OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID , Selected_CT : data.Selected_CT , NGF : data.NGF , DGF : data.DGF });
     //     socket.emit('Cha_Answer2', y);
     //     // console.log(y)
     //     }
     //     }
     //
     // }).catch(function(err) {
     // logger.error(err)
     // OPC_Report(err, 'SQLO_E') // Reporting
     // });
       }
     }
  })


}
});


socket.on('GF_Query', function (data){
logger.info('GF_query from ' + data.Socket_ID)
///////// RETURN GF.LIST et GF.INFO
if (the_session)
{
var NodeId = "ns=2;s=" ;
var OPC_Read = []  ;
var GF = { LIST : [] , INFO : {} }
var len ;
var query ;
// console.log(data)
if (data.Selected_CT == 'null' || !data.Selected_CT )
logger.info('No CT Selected')
else {

  var request = new sql.Request()
  request.input('NUM_CT', sql.NVarChar, data.Selected_CT)
  request.execute('MOBILE_GET_GF', (err, rec) => {
  if (err) {
    logger.error(err)
    OPC_Report(err, 'SQLO_E') // Reporting
    }
  else {
  var recordset = rec.recordset;
    if (recordset) {
    console.log(recordset)
    len = recordset.length
    for (var i = 0 ; i < len; i++) {

    var id = recordset[i];
    var COLOR = NodeId + '/Application/STEGC/Paris/PT/PT' + data.Selected_PT + '/GRF_PT' + data.Selected_PT + '_' + id.NGF + id.DGF + '/Synthese.PriorityMax' ;
    var L1 =  NodeId + '/Application' + id.L1 + '.valeur'
    var D1 =  NodeId + '/Application' + id.D1 + '.Trend'
    var L2 =  NodeId + '/Application' + id.L2 + '.valeur'
    var D2 =  NodeId + '/Application' + id.D2 + '.Trend'
    OPC_Read.push(COLOR)
    OPC_Read.push(L1)
    OPC_Read.push(D1)
    OPC_Read.push(L2)
    OPC_Read.push(D2)
    GF.LIST.push({ NGF : id.NGF, DGF : id.DGF , LG : id.LG , CT: id.CT , PT : id.PT , T1 : id.v1 , T2 : id.v2 , C1 : [] , C2 : [] , D1 : 0 , D2 : 0   })
    }

    var TMP_EXT = NodeId + '/Application/STEGC/Paris/PT/PT' + data.Selected_PT + '/Acquisition/CVC_PT' + data.Selected_PT + '_' + 'PRODUCTION_TEMP1EXTER_M01.Valeur' ;
    OPC_Read.push(TMP_EXT) //Nouvelle codification température extérieur CT
    TMP_EXT = NodeId + '/Application/STEGC/Paris/PT/PT' + data.Selected_PT + '/Acquisition/CVC_PT' + data.Selected_PT + '_' + 'GENER00001_TEMP1EXTER_M01.Valeur' ;
    OPC_Read.push(TMP_EXT) //Ancienne codification température extérieur CT

    // console.log(OPC_Read)
    console.log(GF)
    if(OPC_Read){
    the_session.readVariableValue(OPC_Read, function(err,dataValue,diagnostics) {
              if (err)
                  { logger.error("OPC error" + err) ; OPC_Report(err, 'OPC_E')}
              else {
                 // console.log(dataValue)
              for(i=0 ; i< OPC_Read.length -2 ; i = i + 5 )
              {
                if (dataValue[i].value )
                {
                if(dataValue[i].value.value ) {
                var C = dataValue[i].value.value; //COLOR
                GF.LIST[i/5].COLOR =  P.ALARM.AL_0_Color ; //applique la couleur alarme de base
                if (C == '1')  GF.LIST[i/5].COLOR = P.ALARM.AL_1_Color ; //applique la couleur alarme mineure
                if (C == '2')  GF.LIST[i/5].COLOR = P.ALARM.AL_2_Color ; //applique la couleur alarme majeure
                if (C == '3')  GF.LIST[i/5].COLOR = P.ALARM.AL_3_Color ; //applique la couleur alarme critique
                if (C == '10') GF.LIST[i/5].COLOR = P.ALARM.AL_10_Color ; //applique la couleur alarme def com
                }
                if (dataValue[i + 1].value) GF.LIST[i/5].T1 = dataValue[i + 1].value.value.toFixed(1) ;
                if (dataValue[i + 2].value) GF.LIST[i/5].D1 = dataValue[i + 2].value.value
                if (dataValue[i + 3].value) GF.LIST[i/5].T2 = dataValue[i + 3].value.value.toFixed(1);
                if (dataValue[i + 4].value) GF.LIST[i/5].D2 = dataValue[i + 4].value.value
                // if (GF.LIST[i/3].T1 != null) GF.LIST[i/3].T1 = parseFloat(GF.LIST[i/3].T1).toFixed(1)
                // if (GF.LIST[i/3].T2 != null) GF.LIST[i/3].T2 = parseFloat(GF.LIST[i/3].T2).toFixed(1)
                // console.log(dataValue[i + 1].value.value + '-' + GF.LIST[i/3].T1)
               }
             }
             console.log(GF.LIST)
            var j = OPC_Read.length - 2
            if(dataValue[j] && dataValue[j].value && dataValue[j].value.value) //TMP_EXT IS PRODUCTION
            GF.INFO.TMP_EXT = dataValue[j].value.value.toFixed(1)
            if(dataValue[j+1] && dataValue[j+1].value && dataValue[j+1].value.value) //TMP_EXT IS GENER0001
            GF.INFO.TMP_EXT = dataValue[j+1].value.value.toFixed(1)

GF.LIST.push({ OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID , Selected_CT: data.Selected_CT});
socket.emit('GF_Answer', GF);
// console.log(GF)
logger.info("GF Emit ")
            }});}

};}

})
}}
  else { socket.emit('Notif_All', { Msg : 'OPC Session Error'}); logger.error("OPC session error") ;  }
  // if (sql != 'Read') socket.emit('Error', { Component: 'SQL', Property : 'Session', Value : 'Off'})
});



setTimeout(function(){

  var request = new sql.Request()
  request.input('LOGIN', sql.NVarChar, 'SEN1')
  request.input('ASTREINTE', sql.BIT, 0)
  request.input('Selected_CT', sql.NVarChar, data.Selected_CT )
  request.execute('BDD_DONNEES.dbo.MOBILE_GET_UTILISATEUR_ALARME', (err, rec) => {
  if (err) {
      logger.error(err) ; OPC_Report(err, 'SQLO_E') // Reporting
  }
  else
  {
    var data = rec.recordset
    var len = data.length;
    console.log(data)
    var NodeId,Mnemo,adr,AL;
    var OPC_Read = [],ToSend=[];
    data.map(obj => {
      Mnemo = 'CVC_PT' + obj.IT + '_' + obj.NGF + obj.DGF + '_' + obj.NOF + obj.DOF + '_' + obj.I ;
      adr = '/Application/STEGC/Paris/PT/PT' + obj.IT + '/Acquisition/' + Mnemo ;
      NodeId = "ns=2;s=" + adr;
      if (obj.C && obj.L)
      {
      OPC_Read.push(NodeId + '.valeur')
      OPC_Read.push(NodeId + '/Alm/Acknowledged')
      OPC_Read.push(NodeId + '/Alm/Disabled')
      AL =  P.ALARM.AL_0_Color ; //applique la couleur alarme de base
      if (obj.C == '1')  AL = P.ALARM.AL_1_Color ; //applique la couleur alarme mineure
      if (obj.C == '2')  AL = P.ALARM.AL_2_Color ; //applique la couleur alarme majeure
      if (obj.C == '3')  AL = P.ALARM.AL_3_Color ; //applique la couleur alarme critique
      if (obj.C == '10') AL = P.ALARM.AL_10_Color ; //applique la couleur alarme def com
      if (!data.Selected_CT || data.Selected_CT == 'null')  ToSend.push({ N : NodeId, M : Mnemo, AL: AL, L : obj.L , C : obj.C , LO : obj.LO , LG : obj.LG , T0 : obj.T0, T1 : obj.T1 })
      else  ToSend.push({ N : NodeId, M : Mnemo, AL: AL, L : obj.L , C : obj.C , LG : obj.LG , LO : data.Selected_CT, T0 : obj.T0, T1 : obj.T1})     }
    })
     // console.log(OPC_Read)
     // console.log(ToSend)


    the_session.readVariableValue(OPC_Read, function(err,dataValue,diagnostics) {
     if (err) {
            logger.error("OPC error"+ err); OPC_Report(err, 'OPC_E')
     }
     else {


      // console.log(dataValue)
       var Act,Ack,Dis,date;
       for (var i = 0 ; i < len ; i++) {

         if(dataValue[3*i].value && dataValue[3*i].value != null && dataValue[3*i + 1].value && dataValue[3*i + 1].value != null && dataValue[3*i + 2].value && dataValue[3*i + 2].value != null )
           {
             Act = dataValue[3*i].value.value;
             Ack = dataValue[3*i + 1].value.value;
             Dis = dataValue[3*i + 2].value.value;
             ToSend[i].V = Act
             if (Dis == true) ToSend[i].P = 4 //inhibee
             else if(Act&&Ack) { ToSend[i].P = 1 ; ToSend[i].E = 'Présente acq'} //Présente Acquitée
             else if(Act&&!Ack) { ToSend[i].P = 2 ; ToSend[i].E = 'Présente '} //Présente ( non Ack )
             else if(!Act&&!Ack)  {
             //couleur blanche pour les alarmes disparue non Ack
               ToSend[i].P = 3 ; // Disparue ( non Ack )
               ToSend[i].AL = P.ALARM.AL_D_Color ;
               ToSend[i].E = 'Disparue'
             }
           // console.log(Act + '-' + Ack + '-' +  Dis)
           // console.log(ToSend[i])

           if(dataValue[3*i].value != null && dataValue[3*i].sourceTimestamp)
            {
              date = dataValue[3*i].sourceTimestamp;
              ToSend[i].S = ('0' + date.getDate()).slice(-2) + '/' + ('0' + date.getMonth() + 1).slice(-2)  + '/' + date.getFullYear()
              ToSend[i].S += ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
           }
         }

       }
       console.log(ToSend)
       // console.log(ToSend)
       ToSend.push({  OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID, Selected_CT : data.Selected_CT})
       socket.emit('AL_Answer', ToSend);
       logger.info('AL_Answer to ' + data.Socket_ID )
      }
    })
  }
  })
  .catch(function(err) { //Gestion globale des erreurs SQL
      logger.error(err)
      OPC_Report(err, 'SQLO_E') // Reporting
    })


},500000000)

// //////////////////Alarm Fetch on OPC server every 5min////////////////////////////////
// setTimeout(function(){
//   var query ;
//   var Ack;
//   var Actif ;
//   var OPC_Read  = [];
//   var ToSend = [];
//   query  = "Select top 1000 " + P.SQL.Localisation  + " as LO, " +  P.SQL.Libelle_information + " AS L, " +  P.SQL.Installation_technique + " AS IT,  " + P.SQL.NomGroupeFonctionnel + " AS NGF," + P.SQL.Libelle_groupe + " AS LG,"
//   query +=  P.SQL.DesignGroupeFonctionnel + " AS DGF, " +  P.SQL.NomObjetFonctionnel + " AS NOF,  " + P.SQL.DesignObjetFonctionnel + " AS DOF, " +  P.SQL.Information + " AS I,  " + P.SQL.TOR_CriticiteAlarme + " AS C, "
//   query +=  P.SQL.TOR_CodeEtat0 + " AS T0, " + P.SQL.TOR_CodeEtat1 + " AS T1"
//   query += " from dbo.SUPERVISION WHERE  " + P.SQL.Type + " = 'TA' and  " +  P.SQL.Metier + " = 'CVC' "}
//   var request = new sql.Request().query(query).then(function(rec) {
//   if (rec) {
//   var recordset=JSON.parse(JSON.stringify(rec.recordset).replace(/"\s+|\s+"/g,'"'))
//   var len = recordset.length ;
//   var opc_len ;
//   // console.log(recordset)
//   for (var i = 0 ; i < len; i++) {
//                   var id = recordset[i];
//                   var Mnemo = 'CVC_PT' + id.IT + '_' + id.NGF + id.DGF + '_' + id.NOF + id.DOF + '_' + id.I ;
//                   var adr = '/Application/STEGC/Paris/PT/PT' + id.IT + '/Acquisition/' + Mnemo ;
//                   var NodeId = "ns=2;s=" + adr;
//                   // if (id.C && id.Libelle_information )
//                   // AlmToRead.push({ NodeId : NodeId , Mnemo : Mnemo , Libelle: id.Libelle_information, Criticite : id.C , Actif : '' , Ack : ''})
//                   OPC_Read.push(NodeId + '.valeur')
//                   OPC_Read.push(NodeId + '/Alm/Acknowledged')
//                   var AL =  P.ALARM.AL_0_Color ; //applique la couleur alarme de base
//                   if (id.C == '1')  AL = P.ALARM.AL_1_Color ; //applique la couleur alarme mineure
//                   if (id.C == '2')  AL = P.ALARM.AL_2_Color ; //applique la couleur alarme majeure
//                   if (id.C == '3')  AL = P.ALARM.AL_3_Color ; //applique la couleur alarme critique
//                   if (id.C == '10') AL = P.ALARM.AL_10_Color ; //applique la couleur alarme def com
//
//   ToSend.push({ N : NodeId, M : Mnemo, AL: AL, L : id.L , C : id.C , LO : id.LO , LG : id.LG , T0 : id.T0, T1 : id.T1 })
//   else  ToSend.push({ N : NodeId, M : Mnemo, AL: AL, L : id.L , C : id.C , LG : id.LG , LO : data.Selected_CT, T0 : id.T0, T1 : id.T1})
//
//      };
// // console.log(OPC_Read)
// the_session.readVariableValue(OPC_Read, function(err,dataValue,diagnostics) {
// if (err) {
//
// logger.error("OPC error"+ err); OPC_Report(err, 'OPC_E')
// }
// else {
//   // console.log(dataValue.value)
// var T ;
// var Ack,Act;
//  for (var i = 0 ; i < len ; i++) {
// //Gestion d'erreur OPC lecture attribut Actif
// // console.log(opc_len)
// id = recordset[i];
// // console.log(id)
// if(dataValue[i].sourceTimestamp)
// ToSend[i].S= dataValue[i].sourceTimestamp.toLocaleString("fr-FR") //date type
// // console.log(ToSend[i].S)
//
// //Gestion d'erreur OPC lecture attribut value
// if (dataValue[2*i].statusCode )
// {
//   if (dataValue[2*i].statusCode._base)
//   {
//      id.StatusCode_Actif = dataValue[2*i].statusCode._base['name'];
//      if ( id.StatusCode_Actif = 'Good' && dataValue[2*i].value)
//      Act = dataValue[2*i].value.value;
//      ToSend[i].V = Act
//   }
//   if (dataValue[2*i].statusCode['name'])
//   {
//       id.StatusCode_Actif = dataValue[2*i].statusCode['name'];
//       if( id.StatusCode_Actif = 'Good' && dataValue[2*i].value)
//       Act = dataValue[2*i].value.value;
//   }
//  }
// //Gestion d'erreur OPC lecture attribut Ack
//
//  if (dataValue[2*i+1].statusCode )
//  {
//    if (dataValue[2*i+1].statusCode._base)
//    {
//       id.StatusCode_Ack = dataValue[2*i+1].statusCode._base['name'];
//       if ( id.StatusCode_Ack = 'Good' && dataValue[2*i+1].value)
//       Ack = dataValue[2*i+1].value.value;
//     }
//
//   if (dataValue[2*i+1].statusCode['name'])
//     {
//        id.StatusCode_Ack = dataValue[2*i+1].statusCode['name'];
//        if( id.StatusCode_Ack = 'Good' && dataValue[2*i+1].value)
//       Ack = dataValue[2*i+1].value.value;
//     }
//
// }
//
// if(Act&&Ack) ToSend[i].P = 1 ; //Présente Acquitée
// if(Act&&!Ack)  ToSend[i].P = 2 ; //Présente ( non Ack )
// if(!Act&&!Ack)  {
// //couleur blanche pour les alarmes disparue non Ack
//   ToSend[i].P = 3 ; // Disparue ( non Ack )
//   ToSend[i].AL = P.ALARM.AL_D_Color ;
// }
// }
//
// // console.log(ToSend)
// ToSend.push({  OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID, Selected_CT : data.Selected_CT})
// socket.emit('AL_Answer', ToSend);
// logger.info('AL_Answer to ' + data.Socket_ID )
//   }
//
//       });
//     };
//       }).catch(function(err) { //Gestion globale des erreurs SQL
//         logger.error(err)
//         OPC_Report(err, 'SQLO_E') // Reporting
//
//       });
//
// },300000);



socket.on('AL_Query', function (data){
  console.log(data)

logger.info('AL_Query from ' + data.Socket_ID)

if (the_session)
{
 if(data.Mode == "Read") {

     var request = new sql.Request()
     request.input('LOGIN', sql.NVarChar, 'SEN1')
     request.input('ASTREINTE', sql.BIT, 0)
     request.input('Selected_CT', sql.NVarChar, data.Selected_CT )
     request.execute('BDD_DONNEES.dbo.MOBILE_GET_UTILISATEUR_ALARME', (err, rec) => {
     if (err) {
         logger.error(err) ; OPC_Report(err, 'SQLO_E') // Reporting
     }
     else
     {
       var record = rec.recordset
       var len = record.length;
       // console.log(data)
       var NodeId,Mnemo,adr,AL;
       var OPC_Read = [],ToSend=[];
       record.map(obj => {
         Mnemo = 'CVC_PT' + obj.IT + '_' + obj.NGF + obj.DGF + '_' + obj.NOF + obj.DOF + '_' + obj.I ;
         adr = '/Application/STEGC/Paris/PT/PT' + obj.IT + '/Acquisition/' + Mnemo ;
         NodeId = "ns=2;s=" + adr;
         if (obj.C && obj.L)
         {
         OPC_Read.push(NodeId + '/Alm/Status')
         AL =  P.ALARM.AL_0_Color ; //applique la couleur alarme de base
         if (obj.C == '1')  AL = P.ALARM.AL_1_Color ; //applique la couleur alarme mineure
         if (obj.C == '2')  AL = P.ALARM.AL_2_Color ; //applique la couleur alarme majeure
         if (obj.C == '3')  AL = P.ALARM.AL_3_Color ; //applique la couleur alarme critique
         if (obj.C == '10') AL = P.ALARM.AL_10_Color ; //applique la couleur alarme def com
         if (!data.Selected_CT || data.Selected_CT == 'null')  ToSend.push({ N : NodeId, M : Mnemo, AL: AL, L : obj.L , C : obj.C , LO : obj.LO , LG : obj.LG , T0 : obj.T0, T1 : obj.T1 , S : ''})
         else  ToSend.push({ N : NodeId, M : Mnemo, AL: AL, L : obj.L , C : obj.C , LG : obj.LG , LO : data.Selected_CT, T0 : obj.T0, T1 : obj.T1 , S : ''})     }
       })
        console.log(OPC_Read.length)
        console.log(ToSend.length)


       the_session.readVariableValue(OPC_Read, function(err,dataValue,diagnostics) {
        if (err) {
               logger.error("OPC error"+ err); OPC_Report(err, 'OPC_E')
        }
        else {


         console.log(dataValue)
          var Act,Ack,Dis,date;
          for (var i = 0 ; i < len ; i++) {

            if(dataValue[i] && dataValue[i].value && dataValue[i].value != null)
              {
                console.log(dataValue[i].value.value)
                if (dataValue[i].value.value == 3)
                { ToSend[i].P = 2 ; ToSend[i].E = 'Présente'}
                else if (dataValue[i].value.value == 6)
                { ToSend[i].P = 1 ; ToSend[i].E = 'Présente acq'} //Présente Acquitée
                else if (dataValue[i].value.value == 8)
                { ToSend[i].P = 4 ; ToSend[i].E = 'inhibée'}//inhibee
                else if (dataValue[i].value.value == 5) {
                ToSend[i].P = 3 ;
                ToSend[i].AL = P.ALARM.AL_D_Color ;
                ToSend[i].E = 'Disparue' }
                if (dataValue[i].sourceTimestamp){
                  date = dataValue[i].sourceTimestamp;
                  ToSend[i].S = ('0' + date.getDate()).slice(-2) + '/' + ('0' + date.getMonth() + 1).slice(-2)  + '/' + date.getFullYear()
                  ToSend[i].S += ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
                }

            }

          }
          console.log(ToSend)
          // console.log(ToSend)
          ToSend.push({  OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID, Selected_CT : data.Selected_CT})
          socket.emit('AL_Answer', ToSend);
          logger.info('AL_Answer to ' + data.Socket_ID )
         }
       })
     }
     })

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
    var ToSend = [data]
    // console.dir(methodsToCall)
    the_session.call(methodsToCall,function(err,results){
    if (results && results.length && results[0].statusCode == opcua.StatusCodes.Good)
     {
       logger.info("ACK done ")
       data.Ack = true ;
       socket.emit('Notif_Client', { Msg : data.L + ' acquitté(e)' , Socket_ID : data.Socket_ID});

       ToSend.push({  OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID, Selected_CT : data.Selected_CT})
       socket.emit('AL_Answer', ToSend );
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
  console.log(data)
logger.info('Cons_Query from ' + data.Socket_ID)
if (the_session)
{
  if (data.Mode == "Read")
  {
  console.log(data)
  var NodeId = "ns=2;s=" ;
  var OPC_Read = [];
  var query ;
  var ToSend = []
  if (data.Selected_CT && data.DGF && data.NGF)
  {
    if(data.NGF == 'CIRCU' && data.Vue == 2)
    {
  var OPC_link = NodeId + '/Application'
  // Courbe vue consigne du groupe fonctionnel
  var c =  OPC_link + '/STEGC/Paris/PT/PT' + data.Selected_PT + '/Acquisition/CVC_PT' + data.Selected_PT + '_' + data.NGF + data.DGF ;
  var cext =  OPC_link + '/STEGC/Paris/PT/PT' + data.Selected_PT + '/Acquisition/CVC_PT' + data.Selected_PT + '_PRODUCTION'
  var c1 = c + '_CONSI00001_R01.Valeur' ; //T-10
  var c2 = c + '_CONSI00001_R02.Valeur' ; //T+10
  var c3 = c + '_CONSI00001_R03.Valeur' ; //T+20
  var c4 = cext + '_TEMP1EXTER_M01.Valeur' ; //Text
  var c5 = c + '_TEMP3DEPAR_M01.Valeur' ; //Tdepart
  var OPC_Read_Chart = [c1,c2,c3,c4,c5]
  var Chart_ToSend = [] ;
  console.log(OPC_Read_Chart)
  the_session.readVariableValue(OPC_Read_Chart , function(err,dataValue,diagnostics) {
    if (err)
    {
      logger.error("OPC error" + err);
      OPC_Report(err, 'OPC_E')  }
      else {
      // console.log(dataValue)
      for(i=0;i<5; i++)
      {
      if (dataValue[i] && dataValue[i].value) {
      // console.log(dataValue[i])
      Chart_ToSend[i] = parseFloat(dataValue[i].value.value).toFixed(2)
      }
      else
      Chart_ToSend[i] = 999;
     }
    //  console.log(Chart_ToSend)
     Chart_ToSend.push({ OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID , Selected_CT : data.Selected_CT, DGF : data.DGF , NGF : data.NGF });
     socket.emit('Cha_Answer3', Chart_ToSend);
     logger.info('Cha_Answer3 to ' + data.Socket_ID)

      }
  });
  }
    var ToSend_CAT = [{ CONSI00001 : [] , CONSI00002 : [], CONSI00003 : [],CONSI00004 : [],CONSI00005 : [], OTHERS : [] , nb : 0} ]
    var request = new sql.Request()
    request.input('Vue', sql.NVarChar, data.Vue)
    request.input('NUM_CT', sql.NVarChar, data.Selected_CT)
    request.input('DGF', sql.NVarChar, data.DGF)
    request.input('NGF', sql.NVarChar, data.NGF)
    request.execute('BDD_DONNEES.dbo.MOBILE_GET_CT_CONSIGNE', (err, rec) => {
    if (err) {
    logger.error(err) ; OPC_Report(err, 'SQLO_E') // Reporting
    }
    else
    {
      console.log(rec.recordset)
    var recordset=JSON.parse(JSON.stringify(rec.recordset).replace(/"\s+|\s+"/g,'"'))
    var len = recordset.length
      if (len)
      {
      for (var i = 0 ; i < len; i++) {
      var id = recordset[i] ;
      var Mnemo = 'CVC_PT' + id.IT + '_' + id.NGF + id.DGF + '_' + id.NOF + id.DOF + '_' + id.I ;
      var Adr = NodeId + '/Application/STEGC/Paris/PT/PT' + id.IT + '/Acquisition/' + Mnemo + '.Valeur';
      OPC_Read.push(Adr)
      ToSend.push({ DGF : id.DGF, NGF: id.NGF , I : id.I, GRP : id.NOF+id.DOF, NOF : id.NOF ,  DOF : id.DOF, A : id.A , A1 : id.A1 , A0 : id.A0, M: Mnemo, Adr : Adr, L : id.LI , T : id.T,T0 : id.T0, T1 : id.T1, })
      }
      console.log(OPC_Read)
    the_session.readVariableValue(OPC_Read, function(err,dataValue,diagnostics) {
      if (err)
      {
        logger.error("OPC error"+ err);
        console.log(err)
        OPC_Report(err, 'OPC_E')  }
      else {
    console.log(dataValue)
   for(i=0 ; i < len ; i++)
    {
  if (dataValue[i] && dataValue[i].value != null && (dataValue[i].value.value || dataValue[i].value.value == 0 )) {
  // ToSend[i].V = parseInt(dataValue[i].value.value.toFixed(0));
  if (typeof dataValue[i].value.value == "boolean") // cas DIGITAL
  ToSend[i].V =dataValue[i].value.value
  else{
    if (ToSend[i].I == 'M99') //Mode de fonctionnement
    {
    if (ToSend[i].NGF == 'CIRCU' && dataValue[i].value.value == '0') {ToSend[i].E = "Arrêt" }
    else if (ToSend[i].NGF == 'CIRCU' && dataValue[i].value.value == '1') {ToSend[i].E = "Arrêt optimisé" }
    else if (ToSend[i].NGF == 'CIRCU' && dataValue[i].value.value == '2') {ToSend[i].E = "Chauffage compensé" }
    else if (ToSend[i].NGF == 'CIRCU' && dataValue[i].value.value == '3') {ToSend[i].E = "Chauffage" }
    else if (ToSend[i].NGF == 'CIRCU' && dataValue[i].value.value == '4') {ToSend[i].E = "Relance optimisée" }
    else if (ToSend[i].NGF == 'CIRCU' && dataValue[i].value.value == '5') {ToSend[i].E = "Réduit de nuit" }
    else if (ToSend[i].NGF == 'CIRCU' && dataValue[i].value.value == '6') {ToSend[i].E = "Antigel" }
    else if (ToSend[i].NGF == 'CIRCU' && dataValue[i].value.value == '10') {ToSend[i].E = "Arrêt forcé" }
    else if (ToSend[i].NGF == 'CIRCU' && dataValue[i].value.value == '11') {ToSend[i].E = "Arrêt défaut" }
    else if (ToSend[i].NGF == 'CIRCU' && dataValue[i].value.value == '12') {ToSend[i].E = "Manuel" }
    else if (ToSend[i].NGF == 'CIRCU' && dataValue[i].value.value == '13') {ToSend[i].E = "Dégommage" }
    else if (ToSend[i].NGF == 'PRODU' && dataValue[i].value.value == '0') {ToSend[i].E = "Arrêt" }
    else if (ToSend[i].NGF == 'PRODU' && dataValue[i].value.value == '1') {ToSend[i].E = "Étage 1" }
    else if (ToSend[i].NGF == 'PRODU' && dataValue[i].value.value == '2') {ToSend[i].E = "Étage 2" }
    else if (ToSend[i].NGF == 'PRODU' && dataValue[i].value.value == '3') {ToSend[i].E = "Étage 3" }
    else if (ToSend[i].NGF == 'PRODU' && dataValue[i].value.value == '4') {ToSend[i].E = "Étage 4" }
    else if (ToSend[i].NGF == 'PRODU' && dataValue[i].value.value == '5') {ToSend[i].E = "Étage 5" }
    else if (ToSend[i].NGF == 'PRODU' && dataValue[i].value.value == '6') {ToSend[i].E = "Étage 6" }
    else if (ToSend[i].NGF == 'PRODU' && dataValue[i].value.value == '9') {ToSend[i].E = "Attente" }
    else if (ToSend[i].NGF == 'PRODU' && dataValue[i].value.value == '10') {ToSend[i].E = "Arrêt forcé" }
    else if (ToSend[i].NGF == 'PRODU' && dataValue[i].value.value == '11') {ToSend[i].E = "Arrêt défaut" }
    else if (ToSend[i].NGF == 'PRODU' && dataValue[i].value.value == '12') {ToSend[i].E = "Manuel" }
    else if (ToSend[i].NGF == 'PRODU' && dataValue[i].value.value == '13') {ToSend[i].E = "Dégommage" }
    else if (ToSend[i].NGF == 'EAUCS' && dataValue[i].value.value == '0') {ToSend[i].E = "ECS Satisfait" }
    else if (ToSend[i].NGF == 'EAUCS' && dataValue[i].value.value == '1') {ToSend[i].E = "ECS hydraulique" }
    else if (ToSend[i].NGF == 'EAUCS' && dataValue[i].value.value == '2') {ToSend[i].E = "ECS électrique" }
    else if (ToSend[i].NGF == 'EAUCS' && dataValue[i].value.value == '3') {ToSend[i].E = "ECS arrêt" }
    else if (ToSend[i].NGF == 'EAUCS' && dataValue[i].value.value == '10') {ToSend[i].E = "ECS Défaut" }
    else if (ToSend[i].NGF == 'EAUCS' && dataValue[i].value.value == '13') {ToSend[i].E = "Dégommage" }
    else if (ToSend[i].NGF == 'CTAIR' && dataValue[i].value.value == '0') {ToSend[i].E = "Arrêt" }
    else if (ToSend[i].NGF == 'CTAIR' && dataValue[i].value.value == '1') {ToSend[i].E = "Ventilation" }
    else if (ToSend[i].NGF == 'CTAIR' && dataValue[i].value.value == '2') {ToSend[i].E = "Chauffage" }
    else if (ToSend[i].NGF == 'CTAIR' && dataValue[i].value.value == '3') {ToSend[i].E = "Maintien en température" }
    else if (ToSend[i].NGF == 'CTAIR' && dataValue[i].value.value == '6') {ToSend[i].E = "Grand froid" }
    else if (ToSend[i].NGF == 'CTAIR' && dataValue[i].value.value == '7') {ToSend[i].E = "Arrêt forcé" }
    else if (ToSend[i].NGF == 'CTAIR' && dataValue[i].value.value == '8') {ToSend[i].E = "Manuel" }
    else if ((ToSend[i].NGF == 'ECHAN' || ToSend[i].NGF == 'CHAUD') && dataValue[i].value.value == '0') {ToSend[i].E = "Arrêt" }
    else if ((ToSend[i].NGF == 'ECHAN' || ToSend[i].NGF == 'CHAUD') && dataValue[i].value.value == '1') {ToSend[i].E = "Priorité 1" }
    else if ((ToSend[i].NGF == 'ECHAN' || ToSend[i].NGF == 'CHAUD') && dataValue[i].value.value == '2') {ToSend[i].E = "Priorité 2" }
    else if ((ToSend[i].NGF == 'ECHAN' || ToSend[i].NGF == 'CHAUD') && dataValue[i].value.value == '3') {ToSend[i].E = "Priorité 3" }
    else if ((ToSend[i].NGF == 'ECHAN' || ToSend[i].NGF == 'CHAUD') && dataValue[i].value.value == '9') {ToSend[i].E = "Attente" }
    else if ((ToSend[i].NGF == 'ECHAN' || ToSend[i].NGF == 'CHAUD') && dataValue[i].value.value == '10') {ToSend[i].E = "Arrêt forcé" }
    else if ((ToSend[i].NGF == 'ECHAN' || ToSend[i].NGF == 'CHAUD') && dataValue[i].value.value == '11') {ToSend[i].E = "Arrêt défaut" }
    else if ((ToSend[i].NGF == 'ECHAN' || ToSend[i].NGF == 'CHAUD') && dataValue[i].value.value == '12') {ToSend[i].E = "Manuel" }
    else if ((ToSend[i].NGF == 'ECHAN' || ToSend[i].NGF == 'CHAUD') && dataValue[i].value.value == '13') {ToSend[i].E = "Dégommage" }
    else {ToSend[i].E = "Inconnu" }
    // console.log(dataValue[i].value)
    }
    else
    {
      if (ToSend[i].A == '°C') ToSend[i].V = parseFloat(dataValue[i].value.value).toFixed(1);
      else ToSend[i].V = parseFloat(dataValue[i].value.value).toFixed(1);
    }
   }
  ToSend[i].LV = ToSend[i].V ;
  ToSend_CAT[0].nb++
  if (ToSend[i].GRP == 'CONSI00001' ) ToSend_CAT[0].CONSI00001.push(ToSend[i])
  else if (ToSend[i].GRP == 'CONSI00002' ) ToSend_CAT[0].CONSI00002.push(ToSend[i])
  else if (ToSend[i].GRP == 'CONSI00003' ) ToSend_CAT[0].CONSI00003.push(ToSend[i])
  else if (ToSend[i].GRP == 'CONSI00004' ) ToSend_CAT[0].CONSI00004.push(ToSend[i])
  else if (ToSend[i].GRP == 'CONSI00005' ) ToSend_CAT[0].CONSI00005.push(ToSend[i])
  else ToSend_CAT[0].OTHERS.push(ToSend[i])

}}

  ToSend_CAT.push({ OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID , Selected_CT : data.Selected_CT, DGF : data.DGF , NGF : data.NGF });
    console.log(ToSend_CAT)
  socket.emit('Cons_Answer', ToSend_CAT);
  logger.info('Cons_Answer to ' + data.Socket_ID)
    }
    });
  }
  else
  {
    ToSend_CAT.push({ OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID , Selected_CT : data.Selected_CT, DGF : data.DGF , NGF : data.NGF });
    console.log(ToSend_CAT)
    socket.emit('Cons_Answer', ToSend_CAT);
    logger.info('Cons_Answer to ' + data.Socket_ID)
  }
 }
 })

}
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

if (data.T == "TR" || data.T =="TM")  {  var nodeToWrite = [
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
         if (err) { logger.error("OPC error"+ err); OPC_Report(err, 'OPC_E')}
        else {

      if (dataValue && dataValue.value) {
      data.V = dataValue.value.value;
      //Renvoi de la consigne unitaire vers le client
      socket.emit('Notif_Client', { Msg : data.L + ' changé à ' + data.V  , Socket_ID : data.Socket_ID})
      socket.emit('Cons_Update', data);
      console.log(data)
      }

      }
    });
  }
      else { logger.error(err) ; OPC_Report(err, 'OPC_E') } // Reporting

});
}
if ( data.Mode =="Write" && !Write_Perm) { console.log(data);logger.info("Write Forbidden : " + data.M) ;  OPC_Report("WritePerm ", 'Server_M',  data.M) } // Reporting
}
  if (!the_session) { socket.emit('Notif_All', { Msg : 'OPC Session Error'}); logger.error("OPC session error") ; }
  // if (sql != 'Read') socket.emit('Error', { Component: 'SQL', Property : 'Session', Value : 'Off'})
});


function closing_handler(signal)
{
  logger.info("Closing socket")
  socket.close();
  logger.info("Closing OPC-UA session ");
  if (the_session) the_session.close(function(err){
      if(err) {
      logger.info("OPC-UA session closed failed");
      }  });
  logger.info("Closing OPC-UA Client ");
  if(client) client.disconnect(function(){})
  logger.info("Closing SQL POOL CONNECTION ");
  if (sql) sql.close()
  logger.info("Closing NodeJs Process ");
  process.exit();
};

process.on('SIGINT', closing_handler);
process.on('SIGTERM', closing_handler);

async.series([

  function(callback)  {
  sql.connect(P.SQL_OPTIONS).then(function() {
  // report("SQL Mobilite connected ", '' , 'Server' , 'SQLM_C')
  SRV_STATUS.SQL.CODE = 'Connecté';
  logger.info('MS SQL connected success');

//       .query('select TOP '+ SELECT + ' * from dbo.SUPERVISION  ').then(function(recordset) {
//         ids = JSON.parse(JSON.stringify(recordset.recordset).replace(/"\s+|\s+"/g,'"'))
//         console.log(Object.keys(ids).length);
//         callback();
//         }).catch(function(err) {
//           console.log(err.name + ' --> ' + err.code + ' : ' + err.message);
//       });
//
//       }).catch(function(err) {
//
//           SRV_STATUS.SQL = { CODE : err.code , NAME : err.name , MESSAGE : err.message }
//           console.log(err.name + ' --> ' + err.code + ' : ' + err.message);
//            callback();
//       });

  callback();
  }).catch(function(err) {
  console.log(err.code + ":" + err.message, 'SQL Mobilite' , '' , 'SQLM_C')
  SRV_STATUS.SQL = { CODE : err.code , NAME : err.name , MESSAGE : err.message }
  // callback();
  });


  sql.on('error', err => {
   console.log('/////////////////')
   console.log(err.code)
  })


  },
    // step 1 : connect to
    function(callback)  {
        client.connect(P.OPC_URL,function (err) {
            if(err) {
              console.dir(err)
                logger.info(" cannot connect to endpoint :" , P.OPC_URL );
            } else {
                logger.info("OPC connected !");
                SRV_STATUS.OPC.CODE = 'Connecté' ;
                // console.dir(client)

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
                             logger.info("OPC session Closed" , P.OPC_URL );
                         }
                       })
                       client.disconnect(function (err) {
                         if(!err) {
                             logger.info("OPC Disconnected" , P.OPC_URL );
                         }
                       })

                   });

                   client.on("connection_reestablished", function () {
                       logger.info("connection_reestablished ");
                       client.connect(P.OPC_URL,function (err) {
                           if(err) {
                               logger.info(" cannot connect to endpoint :" , P.OPC_URL );
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
    //             console.log( " name..................... ",session.name);
    // console.log( " sessionId................ ",session.sessionId);
    // console.log( " authenticationToken...... ",session.authenticationToken);
    // console.log( " timeout.................. ",session.timeout);
    // console.log( " serverNonce.............. ",session.serverNonce.toString("hex"));
    // console.log( " serverCertificate........ ",session.serverCertificate.toString("base64"));
    // console.log( " serverSignature.......... ",session.serverSignature);
    // console.log( " lastRequestSentTime...... ",new Date(session.lastRequestSentTime).toISOString(), now - session.lastRequestSentTime);
    // console.log( " lastResponseReceivedTime. ",new Date(session.lastResponseReceivedTime).toISOString(), now - session.lastResponseReceivedTime);
                callback(err);
              }
        });
    },
    function(callback) {

      function Change_callback(_nodeId) {
         var nodeId = _nodeId;
                return  function(dataValue) {
                console.log(nodeId.toString() , "\t value : ",dataValue.value.value.toString());
                socket.emit('OPC_General_Update', { id : nodeId.toString(), val : dataValue.value.value.toString() });
           };
        }
    //subscription to general OPC parameters ( Alarms Nbr , ....)
      var  init_OPC_sub=new opcua.ClientSubscription(the_session,{
        requestedPublishingInterval: 1000,
        requestedLifetimeCount: 200 ,
         requestedMaxKeepAliveCount: 20,
           maxNotificationsPerPublish: 10,
           publishingEnabled: true,
           priority: 10
       });
      var nodeId,i,monitoredItem, len ;
       len = sub_param.length
       for (i = 0 ; i < len; i++) {
                nodeId = "ns=2;s=" + sub_param[i].adr;
                monitoredItem  = init_OPC_sub.monitor({
                nodeId: opcua.resolveNodeId(nodeId),
                attributeId: opcua.AttributeIds.Value
               },   {samplingInterval: 1000,discardOldest: false,queueSize: 1 },
                 opcua.read_service.TimestampsToReturn.Both
                 );

              monitoredItem.on("changed", Change_callback(nodeId))

              //io.sockets.emit('Event',dataValue.value.value);
              // if (dataValue && dataValue.value )

              // {id.value = dataValue.value.value;
              // socket.emit('OPC_General_Update',id);
            //  }
              //  console.log(nodeId.toString() , "\t value : ",dataValue.value.value.toString());
              // });
    };

  logger.info('Subscription Finished');
  // callback();
},

  // function(callback)  {
  //
  //   function Update_CT(_nodeId) {
  //      var nodeId = _nodeId;
  //             return  function(dataValue) {
  //             console.log(nodeId.toString() , "\t value : ",dataValue.value.value.toString());
  //             // socket.emit('OPC_General_Update', { id : nodeId.toString(), val : dataValue.value.value.toString() });
  //        };
  //     }
  //   var List_Alarm_CT = [] //Recuperation des adr OPC des alarmes pour mise a jour AUTO List CT
  //   var request = new sql.Request().query("Select CTH_NUM_CT as L, CTH_NUM_PT as P from BDD_DONNEES.dbo.CENTRE_THERMIQUE").then(function(rec2) {
  //   var rec=JSON.parse(JSON.stringify(rec2.recordset).replace(/"\s+|\s+"/g,'"'))
  //   var List_Alarm_CT = []
  //   // console.log(rec)
  //   var AL_10,AL_3,AL_2,AL_1,tmp
  //   for (var i = 0; i < rec.length; i++) {
  //   tmp = NodeId + '/Application/STEGC/Paris/PT/PT' + rec[i].P;
  //   AL_10 = tmp + '/_Entite/SyntheseDefCom/ExistPresent' //Présence Alarme DefCom
  //   AL_3 = tmp + '/_Entite/SyntheseCritique/ExistPresent' //Présence Alarme Critique
  //   AL_2 = tmp + '/_Entite/SyntheseMajeure/ExistPresent' //Présence Alarme Majeure
  //   AL_1 = tmp + '/_Entite//ExistPresent' //Présence Alarme Mineure
  //   List_Alarm_CT.push(
  //     { type : 'CT', CT : rec[i].L , AL : 'SyntheseDefCom' , adr : AL_10},
  //     { type : 'CT', CT : rec[i].L , AL : 'SyntheseCritique' , adr : AL_3},
  //     { type : 'CT', CT : rec[i].L , AL : 'SyntheseMajeure' , adr : AL_2},
  //     { type : 'CT', CT : rec[i].L , AL : 'SyntheseMineure' , adr : AL_1}
  //      )
  //   }
  //   console.log(List_Alarm_CT)
  //
  // //subscription to general OPC parameters ( Alarms Nbr , ....)
  //   var  CT_Update_Sub=new opcua.ClientSubscription(the_session,{
  //     requestedPublishingInterval: 1000,
  //     requestedLifetimeCount: 200 ,
  //      requestedMaxKeepAliveCount: 20,
  //        maxNotificationsPerPublish: 10,
  //        publishingEnabled: true,
  //        priority: 10
  //    });
  //    var nodeId,i,monitoredItem, len ;
  //    len = List_Alarm_CT.length
  //    for (var h = 0 ; h < len; h++) {
  //           var  item =  List_Alarm_CT[h].adr
  //             monitoredItem  = CT_Update_Sub.monitor({
  //             nodeId: opcua.resolveNodeId(item),
  //             attributeId: opcua.AttributeIds.Value
  //            },   {samplingInterval: 1000,discardOldest: false,queueSize: 1 },
  //              opcua.read_service.TimestampsToReturn.Both
  //              );
  //
  //           monitoredItem.on("changed", Update_CT(nodeId))
  //           // {id.value = dataValue.value.value;
  //           // socket.emit('OPC_General_Update',id);
  //         }
  //
  //   }).catch(function(err) {
  //     logger.error(err)
  //     OPC_Report(err, 'SQLO_E') // Reporting
  //   });

    function(callback) {
// souscription à toutes les variables OPC

       var the_subscription=new opcua.ClientSubscription(the_session,{
         requestedPublishingInterval: 1000,
         requestedLifetimeCount: 200 ,
          requestedMaxKeepAliveCount: 20,
            maxNotificationsPerPublish: 10,
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


let detail= 'VS_VERSION_INFO VERSIONINFO\n\r' +
'FILEVERSION ' + Version.replace(/\./g,',') + ',0\n\r' +
'PRODUCTVERSION '+ Version.replace(/\./g,',') +',0\n\r' +
'FILEOS 0x40004\n\r' +
'FILETYPE 0x1\n\r' +
'{ \n\r' +
' BLOCK "StringFileInfo"\n\r' +
'{ \n\r' +
'  BLOCK "040904b0"\n\r' +
'    {   VALUE "FileDescription", "Serveur Mobilite"\n\r' +
'        VALUE "FileVersion", "' + Version + '"\n\r' +
'        VALUE "InternalName", "SRV_MOBILITE.exe"\n\r' +
'        VALUE "LegalCopyright", ""\n\r' +
'        VALUE "OriginalFilename", "SRV_MOBILITE.exe"\n\r' +
'        VALUE "ProductName", "SRV MOBILITE"\n\r' +
'        VALUE "ProductVersion", "' + Version + '"\n\r' +
'        VALUE "SquirrelAwareVersion", "1"\n\r' +
'    }\n\r' +
'}\n\r' +
'BLOCK "VarFileInfo"\n\r' +
'{\n\r' +
' VALUE "Translation", 0x0409,1200\n\r' +
'}\n\r' +
'}';

fs.writeFile('version-info.rc', detail, (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;
    console.log("Fichier de version généré")
});
