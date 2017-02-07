/*global require,console,setTimeout */
var opcua = require("node-opcua")
var async = require("async")

var client = new opcua.OPCUAClient({keepSessionAlive: true});
var endpointUrl = "opc.tcp://" + require("os").hostname() + ":4334/UA/Server";
// var endpointUrl = "opc.tcp://localhost:9080/CODRA/ComposerUAServer";
var the_session, the_subscription;

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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
     console.log('id: ' + data.id + ',user: ' + data.user +',pass: ' + data.pass);
      socket.emit('login_rep' , check_id(data.user,data.pass));
      });
});

//---------------------------SQL----------------------------
var mysql = require("mysql");
var table = "users" ;
// First you need to create a connection to the db
var con = mysql.createConnection({
  host: "localhost",
  port : "3306",
  user: "root",
  password: "",
  database : "bdd"
});

con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection SQL established');

});

function check_id (user,pass){
  var sen = 'SELECT username,password FROM '+table+' WHERE username ="' + user + '" AND password="' +pass+ '"';
  con.query( sen ,  function(err,rows){
  //  console.log(sen);
   console.log(rows[0]);
    if (err) console.log("ERR");
  else
  {  if (rows[0] ){
    console.log("SQL user ok" );
    return 1 ;
  } else {
    console.log("SQL user fail ");
    return  0;
  }
}
});
};

check_id('admin','pass');

var ids = [
"/Application/STEGC/Paris/PT/PT108365/CVC_PT108356_ECHAN00000_TEMP3DEPAR",
"/Application/STEGC/Paris/PT/PT108365/CVC_PT108356_ECHAN00000_TEMP3RETOU",
"/Application/STEGC/Paris/PT/PT108365/CVC_PT108356_ECHAN00001_TEMP3DEPAR",
"/Application/STEGC/Paris/PT/PT108365/CVC_PT108356_ECHAN00002_TEMP3DEPAR",
"/Application/STEGC/Paris/PT/PT108365/CVC_PT108356_GENER00001_SYNTH00001",
"/Application/STEGC/Paris/PT/PT108365/CVC_PT108356_GENER00001_SYNTH00001"
];

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function update(nodeid,val) {
  console.log("new content :  " + nodeid + " >> " + val );
    io.emit("temp",{
        nodeid : nodeid ,
        val : val
      });
    }

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
           requestedPublishingInterval: 1000,
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
          var nodeId = "ns=1;s="+id;
         var monitoredItem  = the_subscription.monitor({
           nodeId: opcua.resolveNodeId(nodeId),
           attributeId: opcua.AttributeIds.Value
       },
       {
           samplingInterval: 10, // rate at which the server checks th data source for changes
           // note : the samplingInterval can be much faster than the notification to the client, thus
           // the server queue the samples and publish the compte queue.
           discardOldest: true,
           queueSize: 1
       },
       opcua.read_service.TimestampsToReturn.Both
       );

       console.log("-------------------------------------");

       monitoredItem.on("changed",function(dataValue){

           //io.sockets.emit('Event',dataValue.value.value);
           update(nodeId,dataValue.value.value);
        //  console.log(nodeId.toString() , "\t value : ",dataValue.value.value.toString());

//client.end();
       });
    });
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
