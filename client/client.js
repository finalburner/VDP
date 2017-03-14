 /*global require,console,setTimeout */
var opcua = require("node-opcua")
var async = require("async")
var sql = require('mssql');
var client = new opcua.OPCUAClient({keepSessionAlive: true});
// var endpointUrl = "opc.tcp://" + require("os").hostname() + ":4334/UA/Server";
var endpointUrl = "opc.tcp://10.18.10.1:9080/CODRA/ComposerUAServer";
var the_session, the_subscription;

var app = require('express')();
var http = require('http').Server(app)
var io = require('socket.io')(http);

var ids =[
  { Metier: 'CVC',
     Installation_technique: 'PT108406',
     NomGroupeFonctionnel: 'GENER',
     DesignGroupeFonctionnel: '00001',
     NomObjetFonctionnel: 'TEMP1',
     DesignObjetFonctionnel: 'EXTER',
     Information: 'R05',
     Libelle_groupe: 'GENERALITES',
     Libelle_information: 'TEMPOPRISEENCOMPTETNCAVANTARRETOUREDEMARRAGE',
     Localisation: 'CT06001',
     Type: 'TR',
     TOR_CodeEtat0: null,
     TOR_CodeEtat1: null,
     TOR_CriticiteAlarme: null,
     TOR_CategorieAlarme: null,
     ANA_Unite: 'h',
     ANA_ValeurMini: '1',
     ANA_ValeurMaxi: '168',
     ACQ_Protocole: 'OPCUA',
     ACQ_Equipement: 'PT108406_1',
     ACQ_Adresse: 'K2',
     PLC_Type: null,
     PLC_Adresse: null,
     PLC_Groupe: 'Generalites',
     PLC_Objet: 'General' },
   { Metier: 'CVC',
     Installation_technique: 'PT108406',
     NomGroupeFonctionnel: 'GENER',
     DesignGroupeFonctionnel: '00001',
     NomObjetFonctionnel: 'TEMP1',
     DesignObjetFonctionnel: 'EXTER',
     Information: 'E02',
     Libelle_groupe: 'GENERALITES',
     Libelle_information: 'AUTORISATIONPARTNC',
     Localisation: 'CT06001',
     Type: 'TS',
     TOR_CodeEtat0: 'NON',
     TOR_CodeEtat1: 'OUI',
     TOR_CriticiteAlarme: null,
     TOR_CategorieAlarme: null,
     ANA_Unite: null,
     ANA_ValeurMini: null,
     ANA_ValeurMaxi: null,
     ACQ_Protocole: 'OPCUA',
     ACQ_Equipement: 'PT108406_1',
     ACQ_Adresse: 'I51',
     PLC_Type: null,
     PLC_Adresse: null,
     PLC_Groupe: 'Generalites',
     PLC_Objet: 'General' },
   { Metier: 'MFL',
     Installation_technique: 'PT108406',
     NomGroupeFonctionnel: 'GENER',
     DesignGroupeFonctionnel: '00001',
     NomObjetFonctionnel: 'CPTEN',
     DesignObjetFonctionnel: 'EAU01',
     Information: 'S01',
     Libelle_groupe: 'GENERALITES',
     Libelle_information: 'COMPTEUREAUFROIDERESET',
     Localisation: 'CT06001',
     Type: 'TC',
     TOR_CodeEtat0: 'ARRET',
     TOR_CodeEtat1: 'MARCHE',
     TOR_CriticiteAlarme: null,
     TOR_CategorieAlarme: null,
     ANA_Unite: null,
     ANA_ValeurMini: null,
     ANA_ValeurMaxi: null,
     ACQ_Protocole: 'OPCUA',
     ACQ_Equipement: 'PT108406_1',
     ACQ_Adresse: 'W31',
     PLC_Type: null,
     PLC_Adresse: null,
     PLC_Groupe: 'Generalites',
     PLC_Objet: 'GeneralCompt' } ]

// SQL Srv
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

// sql.connect(config).then(function() {
//     // Query
// console.log('MS SQL connected success');
//     new sql.Request()
//
// //    .input('input_parameter', sql.Int, value)
//   //  .query('select TOP 5 * from SUPERVISION where id = @input_parameter').then(function(recordset) {
//    .query('select TOP(40) * from VDP.dbo.SUPERVISION ').then(function(recordset) {
//       //  console.dir(recordset);
//       // ids=JSON.stringify(recordset);
//       // ids=ids.replace(/\s/g, "") ;
//       // ids=JSON.parse(ids);
// //
// console.log(ids);
//     }).catch(function(err) {
//          console.log('Request error : ' + err);
//
//     });
// ////////////////// STORED SQL PROCEDURE ///////////////////////////////////
//         // new sql.Request()
//         // .input('input_parameter', sql.Int, value)
//         // .output('output_parameter', sql.VarChar(50))
//         // .execute('procedure_name').then(function(recordsets) {
//         //     console.dir(recordsets);
//         // }).catch(function(err) {
//         //     // ... error checks
//         // });
//     }).catch(function(err) {
//         console.log('MS SQL error : ' + err);
//
//     });

    process.on('uncaughtException', function(err) {
        if(err.errno === 'EADDRINUSE')
             console.log('Port 3000 already in use');
             http.close();
    });

http.listen(3000, function(){
  console.log('listening on *:3000');
});


// app.get('/', function(req, res){
//   res.sendfile('index.html');
// });

io.on('connection', function(socket){
  console.log('Socket connected : '+ socket.id);
  socket.emit('id', socket.id );

  socket.on('disconnect', function(){
   console.log('user disconnected');
    });

//demande login
  socket.on('login', function(data){
     console.log('id: ' + data.id + ',user: ' + data.user +',pass: ' + data.pass + ',auth: ' + data.auth);
     var auths = check_id(data.user,data.pass);
     console.log(auths);
     socket.emit('login_rep' , {
       auth : check_id(data.user,data.pass)
     });
  //    console.log( check_id(data.user,data.pass) );
      });

   socket.on('ListeCT', function(data){
   console.log('Demande CT de '+ socket.id);
    socket.emit('ListeCT_rep' , list_CT);
    });

  socket.on('ListeAL', function(data){
    console.log('Demande AL de '+ socket.id);
     socket.emit('ListeAL_rep' , list_AL);
     });


  });

//---------------------------MySQL----------------------------
// var mysql = require("mysql");
// var table = "users" ;
// // First you need to create a connection to the db
// var con = mysql.createConnection({
//   host: "localhost",
//   port : "3306",
//   user: "root",
//   password: "",
//   database : "bdd"
// });
//
// con.connect(function(err){
//   if(err){
//     console.log('Error connecting to MySql Db');
//     return;
//   }
//   console.log('Connection SQL established');
//
// });

function check_id (user,pass){
  var sen = 'SELECT username,password FROM '+table+' WHERE username ="' + user + '" AND password="' +pass+ '"';
  con.query( sen ,  function(err,rows){
  //  console.log(sen);
  //  console.log(rows[0]);
    if (err) console.log("ERR");
  else
  {  if (rows[0] ){
    console.log("SQL user ok");
    return 1;
  }else{
    console.log("SQL user fail ");
    return 0;
  }

}
});
};

function get_CT (){
  var sen = 'SELECT * FROM liste_ct  ' ;
  con.query( sen ,  function(err,rows){
  //  console.log(sen);
  //  console.log(rows[0]);
    if (err) console.log("ERR");
  else
  { console.log(rows);
}
});
};

function update(id,nodeid,value) {
  console.log(nodeid + " >> " + value);

   io.sockets.emit('majtmp',ids);
    };

    // con.end(function(err) {
    //   // The connection is terminated gracefully
    //   // Ensures all previously enqueued queries are still
    //   // before sending a COM_QUIT packet to the MySQL server.
    // });
    // //---------------------------------------------------------
async.series([

    // step 1 : connect to
    function(callback)  {
        client.connect(endpointUrl,function (err) {
            if(err) {
                console.log(" cannot connect to endpoint :" , endpointUrl );
            } else {
                console.log("connected !");
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

       the_subscription=new opcua.ClientSubscription(the_session,{
           requestedPublishingInterval: 500,
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
            adr = '/Application/STEGC/Paris/PT/' + id.Installation_technique ;
              adr += '/Acquisition/' + id.Metier + '_' + id.Installation_technique ;
              adr +=  '_' + id.NomGroupeFonctionnel + id.DesignGroupeFonctionnel  ;
              adr +=  '_' + id.NomObjetFonctionnel + id.DesignObjetFonctionnel ;
              adr +=  '_' + id.Information + '.Valeur';
                 var nodeId = "ns=2;s=" + adr;
         var monitoredItem  = the_subscription.monitor({
           nodeId: opcua.resolveNodeId(nodeId),
           attributeId: opcua.AttributeIds.Value
       },
       {
           samplingInterval: 100, // rate at which the server checks th data source for changes
           // note : the samplingInterval can be much faster than the notification to the client, thus
           // the server queue the samples and publish the compte queue.
           discardOldest: true,
           queueSize: 1
       },
       opcua.read_service.TimestampsToReturn.Both
       );

       monitoredItem.on("changed",function(dataValue){

           //io.sockets.emit('Event',dataValue.value.value);
           update(id,nodeId,dataValue.value.value);
        //  console.log(nodeId.toString() , "\t value : ",dataValue.value.value.toString());

//client.end();
       });
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
