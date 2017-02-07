/*global require,console,setTimeout */
var opcua = require("node-opcua")
var async = require("async")
var mosca = require('mosca')
var mqtt = require('mqtt')

// mqclient = mqtt.connect('mqtt://localhost')
//
// mqclient.on('connect', function () {
//   mqclient.subscribe('presence')
// })

var client = new opcua.OPCUAClient();
var endpointUrl = "opc.tcp://" + require("os").hostname() + ":4334/UA/Server";
var the_session, the_subscription;

// client.on('message', function (topic, message) {
//   // message is Buffer
//   console.log(message.toString())
// //  client.end()
// })
// var express = require('express');
// var app = express();
// var server = require('http').Server(app);

//var server = require("net").createServer();
//var io = require("socket.io")(server);

// mosca
//console.log(process.pid);


var backjack = {
  type: 'redis',
  db: 12,
  port: 6379,
  return_buffers: true,
  host: "localhost"
};

var moscaSettings = {
  port: 1883,
//  persistence: mosca.persistence.Memory
//  backend: backjack,
  //persistence: {
//    factory: mosca.persistence.Redis
//   }
};

var server = new mosca.Server(moscaSettings);
server.on('ready', setup);

server.on('clientConnected', function(client) {
    console.log('client connected', client.id);
});

server.on('published', function(packet, client) {
  console.log('Published', packet.payload);
});

function setup() {
  console.log('Mosca server is up and running')
}

console.log(process.pid);


console.log('Serveur publishing.. ');

function update(content) {
  console.log("Temp change : " + content)

}
//io.enable('browser client minification');  // send minified client
// io.enable('browser client etag');          // apply etag caching logic based on version number
// io.enable('browser client gzip');          // gzip the file
// io.set('log level', 3);                    // reduce logging
// io.set('transports', [                     // enable all transports (optional if you want flashsocket)
//     'xhr-polling'
//   , 'websocket'
//   , 'flashsocket'
//   , 'htmlfile'
//   , 'jsonp-polling'
// ]);
//var handleClient = function (socket) {
    // we've got a client connection
  //  console.log("!!!!!!  Client connecté !!!!!!!");
//};

//io.on("connection", handleClient);

//server.listen(8000);

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
            }
            callback(err);
        });
    },

    // step 3 : browse
    function(callback) {
       the_session.browse("RootFolder", function(err,browse_result){
           if(!err) {
               browse_result[0].references.forEach(function(reference) {
                   console.log( reference.browseName.toString());
               });
           }
           callback(err);
       });
    },

    // step 4 : read a variable with readVariableValue
    function(callback) {
       the_session.readVariableValue("ns=1;s=free_memory", function(err,dataValue) {
           if (!err) {
               console.log(" free mem % = " , dataValue.toString());
           }
           callback(err);
       });


    },

    // step 4' : read a variable with read
    function(callback) {
       var max_age = 0;
       var nodes_to_read = [
          { nodeId: "ns=1;s=free_memory", attributeId: opcua.AttributeIds.Value }
       ];
       the_session.read(nodes_to_read, max_age, function(err,nodes_to_read,dataValues) {
           if (!err) {
               console.log(" free mem % = " , dataValues[0]);
           }
           callback(err);
       });


    },

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

       the_subscription.on("started",function(){
           console.log("subscription started for 2 seconds - subscriptionId=",the_subscription.subscriptionId);
       }).on("keepalive",function(){
           console.log("keepalive");
       }).on("terminated",function(){
           callback();
       });

      /* setTimeout(function(){
           the_subscription.terminate();
       },10000);*/

       // install monitored item
       var monitoredItem  = the_subscription.monitor({
           nodeId: opcua.resolveNodeId("ns=1;s=free_memory"),
           attributeId: opcua.AttributeIds.Value
       },
       {
           samplingInterval: 100,
           discardOldest: true,
           queueSize: 10
       },
       opcua.read_service.TimestampsToReturn.Both
       );
       console.log("-------------------------------------");

       monitoredItem.on("changed",function(dataValue){

           //io.sockets.emit('Event',dataValue.value.value);
           update(dataValue.value.value);
//client.end();
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
