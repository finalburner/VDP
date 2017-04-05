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
var BATCH_MONITORING = 50 ;
var WAIT = 1000;
var SELECT = 100 ;
var Mnemo ;
var list_AL;
var socket = io.connect('http://localhost:3000', {reconnect: true, "connect timeout" : 2000});

if (io.connected === false && io.connecting === false)
{io.connect('http://localhost:4000');
console.log('Connected to client on 4000');}
else ( console.log('Connected to client on 3000'))

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

socket.on('AL_Query', function (data){
  console.log('AL_Query : ' + data.Socket_ID) ;
  var AlmToRead = [] ;
  var query = "Select TOP 200 * from VDP.dbo.SUPERVISION WHERE Type = 'TA'  " ;
  sql.connect(config).then(function() {
  new sql.Request().query(query).then(function(recordset) {
  // console.log(recordset)
  recordset.forEach(function(id){
  // var adr;
                  Mnemo = id.Metier.trim() + '_' + id.Installation_technique.trim();
                  Mnemo +=  '_' + id.NomGroupeFonctionnel.trim() + id.DesignGroupeFonctionnel.trim();
                  Mnemo +=  '_' + id.NomObjetFonctionnel.trim() + id.DesignObjetFonctionnel.trim() ;
                  Mnemo +=  '_' + id.Information.trim() ;
                  adr = '/Application/STEGC/Paris/PT/' + id.Installation_technique.trim() ;
                  adr += '/Acquisition/' + Mnemo ;
                  var NodeId = "ns=2;s=" + adr;
                  AlmToRead.push({ NodeId : NodeId , Mnemo : Mnemo , Libelle: id.Libelle_information.trim() , Criticite : id.TOR_CriticiteAlarme.trim() , Active : '' , Ack : ''});
          });
      //  console.log(AlmToRead)
      //  socket.broadcast.to(OPC_Socket_ID).emit('OPC_Read_Query',AlmToRead);
      AlmToRead.forEach(function(id){
      alm_active = id.NodeId + '.valeur';
      alm_ack = id.NodeId + '/Alm/Acknowledged';
      // console.log(alm_state);
      the_session.readVariableValue([alm_active, alm_ack], function(err,dataValue,diagnostics) {
                if (err) {
					    	console.log( "diag >>>> " + diagnostics + " ---- Error >>>> " + err ); }
					      else {

//Gestion d'erreur OPC lecture attribut Actif
if (dataValue[0].statusCode && dataValue[0].statusCode._base.name == 'Good')
id.Actif = dataValue[0].value.value
else
console.log(id.Mnemo + " > Actif Error > " + dataValue[0].statusCode._base.name) ;

//Gestion d'erreur OPC lecture attribut ACK
if (dataValue[1].statusCode && dataValue[1].statusCode['name'] == 'Good')
id.Ack = dataValue[1].value.value
else console.dir(id.Mnemo + " > Ack Error > " + dataValue[1].statusCode['name']) ;

//Renvoi de l'alarme unitaire vers le client
var Retour = Object.assign({ OPC_Socket_ID : data.OPC_Socket_ID, Socket_ID: data.Socket_ID },id);
socket.emit('AL_Answer', Retour);
    }
      });
           });

      }).catch(function(err) { //Gestion globale des erreurs SQL
      console.log('SQL QUERY ERROR :'+ err )
      });
    });
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

function update(id,Mnemo,value) {

    id.Value = value;
    id.Mnemo = Mnemo;
    //  var data = { var: row , id : Mnemo ,value : value }
    socket.emit('OPC_Update',id);
    console.log(id);
      };



function update_sub_param(id) { //Mise à jour OPC paramètres globaux (Compteurs d'alarmes ... )
 // { id , adr , value}
    socket.emit('OPC_General_Update',id);
      };


async.series([



  function(callback)  {
    sql.connect(config).then(function() {
        // Query
    console.log('MS SQL connected success');
        new sql.Request()

         //    .input('input_parameter', sql.Int, value)
          // .query('select TOP 5 * from SUPERVISION where id = @input_parameter').then(function(recordset) {
        //  .query('select TOP '+ SELECT +' * from VDP.dbo.SUPERVISION Where Type= \'TA\' ').then(function(recordset) {
        .query('select TOP '+ SELECT +' * from VDP.dbo.SUPERVISION Where Type= \'TM\' ').then(function(recordset) {
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
              update_sub_param(id) }
              //  console.log(nodeId.toString() , "\t value : ",dataValue.value.value.toString());
              });

    });
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
           requestedPublishingInterval: 1000,
        //   requestedLifetimeCount: 10,
        //   requestedMaxKeepAliveCount: 2,
           maxNotificationsPerPublish: 5,
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
              Mnemo = id.Metier.trim() + '_' + id.Installation_technique.trim();
              Mnemo +=  '_' + id.NomGroupeFonctionnel.trim() + id.DesignGroupeFonctionnel.trim();
              Mnemo +=  '_' + id.NomObjetFonctionnel.trim() + id.DesignObjetFonctionnel.trim() ;
              Mnemo +=  '_' + id.Information.trim() ;
              adr = '/Application/STEGC/Paris/PT/' + id.Installation_technique.trim() ;
              adr += '/Acquisition/' + Mnemo + '.Valeur';
              var nodeId = "ns=2;s=" + adr;
              var monitoredItem  = the_subscription.monitor({
                 nodeId: opcua.resolveNodeId(nodeId),
                 attributeId: opcua.AttributeIds.Value
               },   {samplingInterval: 100,discardOldest: false,queueSize: 1 },
                 opcua.read_service.TimestampsToReturn.Both
                 );

              monitoredItem.on("changed",function(dataValue){
              //io.sockets.emit('Event',dataValue.value.value);
              if (dataValue.value != null )
              update(id,Mnemo,dataValue.value.value);
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
  },

    // close session
    function(callback) {
        the_session.close(function(err){
            if(err) {
                console.log("session closed failed ?");
            }
            callback();
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
