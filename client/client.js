 /*global require,console,setTimeout */
var opcua = require("node-opcua")
var async = require("async")

var client = new opcua.OPCUAClient({keepSessionAlive: true});
var endpointUrl = "opc.tcp://" + require("os").hostname() + ":4334/UA/Server";
// var endpointUrl = "opc.tcp://localhost:9080/CODRA/ComposerUAServer";
var the_session, the_subscription;

var app = require('express')();
var http = require('http').Server(app)
var io = require('socket.io')(http);

http.listen(3000, function(){
  console.log('listening on *:3000');
});

var list_CT = [
  { name: 'CT 49850',
    addr : '18,rue du Breil 75018 Paris',
    pow : '100kW Gaz SED14',
    alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être long'
  },
{ name: 'CT 49200',
    addr : '18,rue du Breil 75018 Paris',
    pow : '100kW Gaz SED14',
    alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être long'
  },

{ name: 'CT 49100',
      addr : '18,rue du Breil 75018 Paris',
      pow : '100kW Gaz SED14',
      alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être long'
    },
  { name: 'CT 49850',
        addr : '18,rue du Breil 75018 Paris',
        pow : '100kW Gaz SED14',
        alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être long'
      },
   { name: 'CT 49650',
          addr : '18,rue du Breil 75018 Paris',
          pow : '100kW Gaz SED14',
          alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être long'
        }
];

var list_AL = [
  { type: 'AL 49850',
    date : 'hh:mm:ss - dd/mm/yyy',
    etat : 'Présente',
    alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message'
  },
  { type: 'AL 49850',
    date : 'hh:mm:ss - dd/mm/yyy',
    Etat : 'Présente',
    alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message'
  },
  { type: 'AL 49850',
    date : 'hh:mm:ss - dd/mm/yyy',
    Etat : 'Présente',
    alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message'
  },
  { type: 'AL 49850',
    date : 'hh:mm:ss - dd/mm/yyy',
    Etat : 'Présente',
    alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message'
  }
];
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

var ids =
 [{ id: '1',
   str: 'TMP1',
    val: ''},
    { id: '2',
      str: 'TMP2',
       val: ''},
       { id: '3',
         str: 'TMP3',
          val: ''},
          { id: '4',
            str: 'TMP4',
             val: ''},
             { id: '5',
               str: 'TMP5',
                val: ''},
                { id: '6',
                  str: 'TMP6',
                   val: ''},
                   { id: '7',
                     str: 'TMP7',
                      val: ''},
                      { id: '8',
                        str: 'TMP8',
                         val: ''}];


function update(id,idstr,nodeid,value) {
  id.val=value;
  console.log("new content :  " + idstr + " >> " + value + " >> " + id.val);

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
          var nodeId = "ns=1;s="+id.str;
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
           update(id,id.str,nodeId,dataValue.value.value);
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
