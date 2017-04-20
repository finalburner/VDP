//----------------------OPC-------------------------
var async = require("async");
var sql = require('mssql');
var sleep = require('system-sleep');
var opcua = require("node-opcua");
var io = require('socket.io-client');
var client = new opcua.OPCUAClient({keepSessionAlive: true});
// var endpointUrl = "opc.tcp://" + require("os").hostname() + ":4334/UA/Server";
var endpointUrl = "opc.tcp://10.18.10.1:9080/CODRA/ComposerUAServer";
var the_session, the_subscription;
var ids ;
var i = 0 ;
var BATCH_MONITORING = 1000 ;
var WAIT = 100;
var SELECT = 3000;
var Mnemo ;
var list_AL;
var socket = io.connect('http://localhost:3000', {reconnect: true, "connect timeout" : 2000});
var NodeId = "ns=2;s=" ;
if (io.connected === false && io.connecting === false)
{io.connect('http://localhost:4000');
console.log('Connected to client on 4000');}
else ( console.log('Connected to client on 3000'))


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
  console.log("Socket connected <<>> Id :" + socket.id);
socket.emit('OPC_Socket_Connected');
});

//Socket query for list CT on SQL
socket.on('CT_Query', function(data){

  console.log('CT_query from ' + data.Socket_ID)
    sql.connect(config).then(function() {
    new sql.Request().query('Select distinct localisation,Installation_technique from VDP.dbo.SUPERVISION').then(function(rec) {
    CT_PT_List=JSON.stringify(rec);
    CT_PT_List=CT_PT_List.replace(/\s/g, "") ;
    CT_PT_List=JSON.parse(CT_PT_List);
    // console.log(ids)
    CT_PT_List.forEach(function(id){
    CT = id.localisation ; //Centre Thermique
    PT = id.Installation_technique ; //Point technique
    AD = NodeId + '/Application/STEGC/Paris/PT/' + PT + '/_Entite/Adresse' ;  // Adresse
    CP = NodeId +'/Application/STEGC/Paris/PT/' + PT + '/_Entite/CodePostal' ; //Code Postale
    VI = NodeId +'/Application/STEGC/Paris/PT/' + PT + '/_Entite/Ville' ; //Ville
    LAT = NodeId +'/Application/STEGC/Paris/PT/' + PT + '/_Entite/Latitude' ;  //latitude
    LONG = NodeId +'/Application/STEGC/Paris/PT/' + PT + '/_Entite/Longitude' ;  //Longitude
    AL_10 = NodeId +'/Application/STEGC/Paris/PT/' + PT + '/_Entite/SyntheseDefCom/ExistPresent' //Présence Alarme DefCom
    AL_3 = NodeId +'/Application/STEGC/Paris/PT/' + PT + '/_Entite/SyntheseCritique/ExistPresent' //Présence Alarme Critique
    AL_2 = NodeId +'/Application/STEGC/Paris/PT/' + PT + '/_Entite/SyntheseMajeure/ExistPresent' //Présence Alarme Majeure
    AL_1 = NodeId +'/Application/STEGC/Paris/PT/' + PT + '/_Entite/SyntheseMineure/ExistPresent' //Présence Alarme Mineure
    the_session.readVariableValue([AD,CP,VI,LAT,LONG,AL_10,AL_3,AL_2,AL_1], function(err,dataValue,diagnostics) {
              if (err)
              console.log( "diag >>>> " + diagnostics + " ---- Error >>>> " + err );
              else {
    if (dataValue[0] && dataValue[1] && dataValue[2] && dataValue[0].value && dataValue[1].value && dataValue[2].value)
    id.ADR = dataValue[0].value.value + ' ' + dataValue[1].value.value + ' ' + dataValue[2].value.value; //Adresse Complète
    if (dataValue[3] && dataValue[3].value) id.LAT = dataValue[3].value.value;
    if (dataValue[4] && dataValue[4].value) id.LONG = dataValue[4].value.value;
    if (dataValue[5] && dataValue[5].value) id.AL_10 = dataValue[5].value.value;
    if (dataValue[6] && dataValue[6].value) id.AL_3 = dataValue[6].value.value;
    if (dataValue[7] && dataValue[7].value) id.AL_2 = dataValue[7].value.value;
    if (dataValue[8] && dataValue[8].value) id.AL_1 = dataValue[8].value.value;

  var Retour = Object.assign({OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID }, id);
  socket.emit('CT_Answer', Retour);
  console.log(dataValue);

  }

      });
  });
}).catch(function(err) {
console.log(err)
});
    }).catch(function(err) {
    console.log( err )
    });
 });

socket.on('CTA_Query', function (data){

console.log('CTA_Query : ' + data.Socket_ID) ;
var NodeId = "ns=2;s=" ;
// console.log(data)
if (data.Selected_CT == 'null' )
console.log('No CT Selected')
else {
query = "Select distinct Libelle_groupe,DesignGroupeFonctionnel,Installation_technique from VDP.dbo.SUPERVISION Where localisation =\'" + data.Selected_CT + "\' AND NomGroupeFonctionnel = 'CIRCU' AND Metier = 'CVC'"
  sql.connect(config).then(function() {
  new sql.Request().query(query).then(function(recordset) {
  recordset=JSON.parse(JSON.stringify(recordset).replace(/"\s+|\s+"/g,'"'))
  if (recordset) {
    recordset.forEach(function(id){
    PT = id.Installation_technique;
    Circuit = id.Libelle_groupe;
    Design = id.DesignGroupeFonctionnel;

    TEMP3_AMBIA = NodeId + '/Application/STEGC/Paris/PT/' + PT + '/Acquisition/' + 'CVC_' + PT + '_CIRCU' + Design + '_TEMP3AMBIA_M01.Valeur' ;
    TEMP3_DEPAR = NodeId + '/Application/STEGC/Paris/PT/' + PT + '/Acquisition/' + 'CVC_' + PT + '_CIRCU' + Design + '_TEMP3DEPAR_M01.Valeur' ;

  // console.log(id)
    the_session.readVariableValue([TEMP3_AMBIA,TEMP3_DEPAR], function(err,dataValue,diagnostics) {
              if (err)
              console.log( "diag >>>> " + diagnostics + " ---- Error >>>> " + err );
              else {

                if (dataValue[0])
                 { // console.log(dataValue[0])
                   if (dataValue[0].value)  {
                     id.TEMP3_AMBIA = dataValue[0].value.value
                     id.TEMP3_AMBIA_SRC = TEMP3_AMBIA
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

                 }

                if (dataValue[1])
                { //console.log(dataValue[1])
                  if (dataValue[1].value)
                  { id.TEMP3_DEPAR = dataValue[1].value.value}
                    id.TEMP3_DEPAR_SRC = TEMP3_DEPAR
                }

// console.log(id)
var Retour = Object.assign({ OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID }, id);
socket.emit('CTA_Answer', Retour);

              }
            });

            //
            // xx the_subscription.monitor("i=155",DataType.Value,function onchanged(dataValue){
            // xx    console.log(" temperature has changed " + dataValue.value.value);
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
});

}
}).catch(function(err) {
console.log( err )
});
}).catch(function(err) {
console.log( err )
});
}
});
console.log(new Date());

socket.on('AL_Query', function (data){

 if(data.Mode == "Read") {
  // console.log('AL_Query : ' + data.Socket_ID) ;
  var AlmToRead = [] ;
  var query ;
  // console.dir(data)
  if (data.Selected_CT == 'null' )
  query = "Select TOP 10 * from VDP.dbo.SUPERVISION WHERE Type = 'TA' and Metier = 'CVC' "
  else
  query = "Select * from VDP.dbo.SUPERVISION WHERE Type = 'TA' and localisation =\'" + data.Selected_CT +"\'"

  sql.connect(config).then(function() {
  new sql.Request().query(query).then(function(recordset) {
  // console.log(recordset)
  if (recordset) {
  recordset=JSON.parse(JSON.stringify(recordset).replace(/"\s+|\s+"/g,'"'))
  recordset.forEach(function(id){
  // var adr;
                  Mnemo = id.Metier + '_' + id.Installation_technique;
                  Mnemo +=  '_' + id.NomGroupeFonctionnel + id.DesignGroupeFonctionnel;
                  Mnemo +=  '_' + id.NomObjetFonctionnel + id.DesignObjetFonctionnel ;
                  Mnemo +=  '_' + id.Information ;
                  adr = '/Application/STEGC/Paris/PT/' + id.Installation_technique ;
                  adr += '/Acquisition/' + Mnemo ;
                  var NodeId = "ns=2;s=" + adr;
                  if (id.TOR_CriticiteAlarme && id.Libelle_information )
                  AlmToRead.push({ NodeId : NodeId , Mnemo : Mnemo , Libelle: id.Libelle_information, Criticite : id.TOR_CriticiteAlarme , Actif : '' , Ack : ''});
  });

      //  console.log(AlmToRead)
      //  socket.broadcast.to(OPC_Socket_ID).emit('OPC_Read_Query',AlmToRead);
      AlmToRead.forEach(function(id){
      alm_actif = id.NodeId + '.valeur';
      alm_ack = id.NodeId + '/Alm/Acknowledged';
      // console.log(alm_state);
      the_session.readVariableValue([alm_actif, alm_ack], function(err,dataValue,diagnostics) {
                if (err) {
					    	console.log( "diag >>>> " + diagnostics + " ---- Error >>>> " + err ); }
					      else {
console.log(id.Mnemo)

//Gestion d'erreur OPC lecture attribut Actif

if (dataValue[0].statusCode )
{
  if (dataValue[0].statusCode._base)
  {
     id.StatusCode_Actif = dataValue[0].statusCode._base['name'];
     if ( id.StatusCode_Actif = 'Good' && dataValue[0].value)
     id.Actif = dataValue[0].value.value;
  }
  if (dataValue[0].statusCode['name'])
  {
      id.StatusCode_Actif = dataValue[0].statusCode['name'];
      if( id.StatusCode_Actif = 'Good' && dataValue[0].value)
      id.Actif= dataValue[0].value.value;
  }
 }
//Gestion d'erreur OPC lecture attribut Ack

 if (dataValue[1].statusCode )
 {
   if (dataValue[1].statusCode._base)
   {
      id.StatusCode_Ack = dataValue[1].statusCode._base['name'];
      if ( id.StatusCode_Ack = 'Good' && dataValue[1].value)
      id.Ack = dataValue[1].value.value;
    }

  if (dataValue[1].statusCode['name'])
    {
       id.StatusCode_Ack = dataValue[1].statusCode['name'];
       if( id.StatusCode_Ack = 'Good' && dataValue[1].value)
       id.Ack = dataValue[1].value.value;
    }

  }

//Renvoi de l'alarme unitaire vers le client
var Retour = Object.assign({ OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID },id);
console.log(Retour)
socket.emit('AL_Answer', Retour);
    }

      });
    });
  }
      }).catch(function(err) { //Gestion globale des erreurs SQL
      console.log('SQL QUERY ERROR :' ); console.dir (err)
      });
    });
}

if( data.Mode == "Write" )
{
  console.log(data)
  if (data.Type = "ACK") {

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
       console.log("ACK done ")
       socket.emit('AL_Answer',data );
     }
     else
     console.log(err)

    });


 }
}
    });
socket.on('Cons_Query', function (data){
  if (data.Mode == "Read")
  {
  console.log(data)
  var NodeId = "ns=2;s=" ;

  query = 'Select Metier, Installation_technique, NomGroupeFonctionnel, ' + // Consigne Analogique
  ' DesignGroupeFonctionnel , NomObjetFonctionnel ,  DesignObjetFonctionnel ,'+
  '  Information, Libelle_groupe, Libelle_information, Type, ANA_Unite, ANA_ValeurMini, ANA_ValeurMaxi, '+
  'TOR_CodeEtat0, TOR_CodeEtat1 from VDP.dbo.SUPERVISION ' +
  ' Where Localisation =\'CT93213\' AND Type  IN ( \'TC\' , \'TR\' )'

  // query = "Select distinct Libelle_groupe,DesignGroupeFonctionnel,Installation_technique from VDP.dbo.SUPERVISION WHERE localisation =\'" + data.Selected_CT + "\' AND NomGroupeFonctionnel = 'CIRCU' AND Metier = 'CVC'"
    sql.connect(config).then(function() {
    new sql.Request().query(query).then(function(recordset) {
    recordset=JSON.parse(JSON.stringify(recordset).replace(/"\s+|\s+"/g,'"'))
    // console.log(recordset)
    if (recordset) {
      recordset.forEach(function(id){
      var newid;
      Mnemo = id.Metier + '_' + id.Installation_technique;
      Mnemo +=  '_' + id.NomGroupeFonctionnel + id.DesignGroupeFonctionnel;
      Mnemo +=  '_' + id.NomObjetFonctionnel + id.DesignObjetFonctionnel ;
      Mnemo +=  '_' + id.Information ;
      id.Mnemo = Mnemo ;
      adr = '/Application/STEGC/Paris/PT/' + id.Installation_technique ;
      adr += '/Acquisition/' + Mnemo ;
      id.NodeId = "ns=2;s=" + adr;
    // console.log(id)
      the_session.readVariableValue(id.NodeId + '.Valeur', function(err,dataValue,diagnostics) {
                if (err)
                console.log( "diag >>>> " + diagnostics + " ---- Error >>>> " + err );
                else {

      if (dataValue && dataValue.value) {
  id.Value = dataValue.value.value
  //Renvoi de la consigne unitaire vers le client
  var Retour = Object.assign({ OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID }, id);
  socket.emit('Cons_Answer', Retour);
        }
      }
    });
  });
} }); });
}
if ( data.Mode =="Write") {

  console.log(data)

var nodesToWrite = [
       {
           nodeId: opcua.resolveNodeId(data.NodeId + '.Valeur'),
           attributeId: opcua.AttributeIds.Value,
           indexRange: null,
           value: { /* dataValue*/
              //  sourceTimestamp: new Date(2015, 5, 3),
              //  sourcePicoseconds: 30,
               value: { /* Variant */
                   dataType: opcua.DataType.Boolean,
                    value: data.Value_Local
               }     }       }
   ];

   the_session.write(nodesToWrite, function (err, statusCodes) {
      if (!err) {
          console.log( statusCodes.length + '--' + nodesToWrite.length);
          console.log( statusCodes[0] + '--' + opcua.StatusCodes.BadNotWritable);
          console.log(statusCodes + '--' + opcua.StatusCodes.Good);

         the_session.readVariableValue(data.NodeId + '.Valeur', function(err,dataValue,diagnostics) {
         if (err) {
        console.log( "diag >>>> " + diagnostics + " ---- Error >>>> " + err ); }
        else {



      if (dataValue && dataValue.value) {
      data.Value = dataValue.value.value
      //Renvoi de la consigne unitaire vers le client
      socket.emit('Cons_Answer', data);
      }

      }
    });
  }
      else console.log(err)

});
}
});

var config = {
    user: 'BdConnectClient',
    password: '340$Uuxwp7Mcxo7Khy',
    // user : 'root',
    // password:'P@ssw0rd',
    server: 'localhost\\SQLEXPRESS', // You can use 'localhost\\instance' to connect to named instance
    database: 'VDP',

    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
}


async.series([



  function(callback)  {
    sql.connect(config).then(function() {
        // Query
    console.log('MS SQL connected success');
        new sql.Request()

         //    .input('input_parameter', sql.Int, value)
          // .query('select TOP 5 * from SUPERVISION where id = @input_parameter').then(function(recordset) {
        //  .query('select TOP '+ SELECT +' * from VDP.dbo.SUPERVISION Where Type= \'TA\' ').then(function(recordset) {
        // .query('select TOP '+ SELECT +' * from VDP.dbo.SUPERVISION Where Type= \'TM\' ').then(function(recordset) {
          .query('select TOP '+ SELECT + ' * from VDP.dbo.SUPERVISION  ').then(function(recordset) {
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
             console.log('Request error : ' + err.message);

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
            console.log('MS SQL error : ' + err);

        });

  },
    // step 1 : connect to
    function(callback)  {
        client.connect(endpointUrl,function (err) {
            if(err) {
                console.log(" cannot connect to endpoint :" , endpointUrl );
            } else {
                console.log("OPC connected !");
            }
            callback(err);
        });
    },

    // step 2 : createSession
    function(callback) {
        client.createSession( function(err,session) {
            if(!err) {
                the_session = session;
                console.log("Session Ok !");
            }
            callback(err);
        });
    },
    function(callback) {

    //subscription to general OPC parameters ( Alarms Nbr , ....)

       init_OPC_sub=new opcua.ClientSubscription(the_session,{
           requestedPublishingInterval: 1000,
        //   requestedLifetimeCount: 10,
        //   requestedMaxKeepAliveCount: 2,
           maxNotificationsPerPublish: 1,
           publishingEnabled: true,
           priority: 8
       });

  sub_param.forEach(function(id){
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

    });
    callback();
  },
    // step 3 : browse
  //   function(callback) {
  //      the_session.browse("ObjectsFolder", function(err,browse_result){
  //          if(!err) {
  //              browse_result[0].references.forEach(function(reference) {
  //                  console.log(" result : " +  reference.browseName.toString());
  //              });
  //          }
  //          callback(err);
  //      });
  //   },
  //
  //   function(callback) {
  //     var crawler = new NodeCrawler(the_session);
  //
  //       crawler.on("browsed",function(element){
  //       //  console.log("->",element.browseName.name,element.nodeId.toString());
  //   });
  //
  //   var nodeId = "ObjectsFolder";
  //   console.log("now crawling object folder ...please wait...");
  //   crawler.read(nodeId, function (err, obj) {
  //       if (!err) {
  //           //treeify.asLines(obj, true, true, function (line) {
  //     //       console.log(JSON.parse(obj));
  //         // });
  //           }
  //       callback(err);
  //   });
  // },

  //  step 4 : read a variable with readVariableValue
    // function(callback) {
    //
    //   ids.forEach(function(id){
    //   var nodeId = "ns=2;s=" + id;
    //    the_session.readVariableValue(nodeId, function(err,dataValue) {
    //        if (!err) {
    //            console.log(nodeId , " >> " , dataValue.toString());
    //        }
    //           });
    //         });
    //        callback(err);
    // },

    // // step 4' : read a variable with read
    // function(callback) {
    //    var max_age = 0;
    //    var nodes_to_read = [
    //       { nodeId: "ns=1;s=free_memory", attributeId: opcua.AttributeIds.Value }
    //    ];
    //    the_session.read(nodes_to_read, max_age, function(err,nodes_to_read,dataValues) {
    //        if (!err) {
    //            console.log(" free mem % = " , dataValues[0]);
    //        }
    //        callback(err);
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
      //      console.log("subscription started for 2 seconds - subscriptionId=",the_subscription.subscriptionId);
      //  }).on("keepalive",function(){
      //      console.log("keepalive");
      //  }).on("terminated",function(){
      //      callback();
      //  });

          /* setTimeout(function(){
           the_subscription.terminate();
       },10000);*/

       // install monitored item
  ids.forEach(function(id){
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
          console.log('wait');
          i=0;
          }
    });
    console.log('Subscription Finished');
      // callback();
  },

    // close session
    function(callback) {
        the_session.close(function(err){
            if(err) {
                console.log("session closed failed ?");
            }
            // callback();
        });
    }

],
function(err) {
    if (err) {
        console.log(" failure ",err);
    } else {
        console.log("done!");
    }
    client.disconnect(function(){});
}) ;
