 /*global require,console,setTimeout */
var sql = require('mssql');
var app = require('express')();
var http = require('http').Server(app)
var io = require('socket.io')(http);
process.setMaxListeners(0);
var OPC_Socket_ID ;
var list_AL = [
{ type: 'AL 49850',
  date : 'hh:mm:ss - dd/mm/yyy',
  etat : 'Présente',
  alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
    color: '#003DF5' // Bleue
},
{ type: 'AL 49850',
  date : 'hh:mm:ss - dd/mm/yyy',
  Etat : 'Présente',
  alarm : 'Message d\'information caractérisant l\'alarme.Ca peut être un long message',
    color: '#FF6633' //orange
}];

// SQL Srv
var config = {
    user: 'BdConnectClient',
    password: '340$Uuxwp7Mcxo7Khy',
    // user: 'SQL_CLIENT',
    // password: 'VdP2016!',
    server: 'localhost\\SQLEXPRESS', // You can use 'localhost\\instance' to connect to named instance
    // server: '10.18.10.3',
    database: 'VDP',
    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
}


http.listen(3000, function(){
  console.log('listening on *:3000');
});

process.on('uncaughtException', function(err) {
        if(err.errno === 'EADDRINUSE' && err.port === '3000')
             console.log('Port 3000 already in use. Using Port 4000');
             http.close();
             http.listen(4000, function(){
               console.log('listening on *:4000');
             });

    });


// app.get('/', function(req, res){
//   res.sendfile('index.html');
// });
function SQL_QUERY(query){
sql.connect(config).then(function() {
new sql.Request().query(query).then(function(recordset) {
return recordset;
}).catch(function(err) {
console.log('SQL QUERY EROOR :'+ err + ':' + query)
}); }); }

io.on('connect', function(socket,$rootScope){
  console.log('Socket connected :  '+ socket.id);
  socket.emit('id', socket.id );
  socket.on('ID_socket', function(){
  $rootScope.OPC_Socket_ID = socket.id ;
    });
  socket.on('App_Info_Query', function(){
  socket.emit('id', { OPC_Socket_ID : $rootScope.OPC_Socket_ID} );
    });
  socket.on('disconnect', function(){
  console.log('user disconnected');
    });
  socket.on('join', function(data){
  console.log(data)
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

     io.sockets.on('connection', function (socket) {
     });

    socket.on('OPC_Update', function(data){
     console.log(data);
     socket.broadcast.emit('OPC_Update',data);
   });


 //   socket.on('AL_CT_Query', function(data){ //Socket query on SQL Database and Read from OPC
 //   //data comming from App = { Socket_id: 'null', CT : 'null' }
 //   //supposing data = { Socket_id: 'null', CT : 'null', Answer : 'null', Error : ''  }
 //   console.log(data);
 //   var query = "Select * from VDP.dbo.SUPERVISION Where localisation = \'" + data.Socket_id +  "' and Type= 'TA'" ;
 //   sql.connect(config).then(function() {
 //   new sql.Request().query(query).then(function(recordset) {
 //   var OPC_promise = new Promise(function(resolve, reject) {
 //   socket.emit('OPC_Read_Query', { Socket_id: data.Socket_id, var:{ id: recordset , value:'null' }});
 //   socket.emit('AL_CT_Query', data);
 //
 //   }).catch(function(err) {
 //     data.Error = err ;
 //   socket.emit('AL_CT_Answer', data);
 //   });
 // });
 //  });
 //   });
    socket.on('sql_query', function(data){  //Socket query on SQL Database based on hash UUID
    var recordset = SQL_QUERY(data.query) ;
    socket.emit('sql_answer', {hash : data.hash , reply : recordset });
  });


    socket.on('AL_Query',function(data)
    {
    var AlmToRead = [] ;
    var query = "Select top 10 * from VDP.dbo.SUPERVISION WHERE Type = 'TA' and TOR_CriticiteAlarme = '3'"
    sql.connect(config).then(function() {
    new sql.Request().query(query).then(function(recordset) {
    // console.log(recordset)
    recordset.forEach(function(id){
      var adr;
                Mnemo = id.Metier.trim() + '_' + id.Installation_technique.trim();
                Mnemo +=  '_' + id.NomGroupeFonctionnel.trim() + id.DesignGroupeFonctionnel.trim();
                Mnemo +=  '_' + id.NomObjetFonctionnel.trim() + id.DesignObjetFonctionnel.trim() ;
                Mnemo +=  '_' + id.Information.trim() ;
                adr = '/Application/STEGC/Paris/PT/' + id.Installation_technique.trim() ;
                adr += '/Acquisition/' + Mnemo ;
                var nodeId = "ns=2;s=" + adr;
                AlmToRead.push({ nodeId : nodeId , Mnemo : Mnemo , Libelle: id.Libelle_information.trim()});
              });
    //  console.log(AlmToRead)
     socket.broadcast.to(OPC_Socket_ID).emit('OPC_Read_Query',AlmToRead);


    }).catch(function(err) {
    console.log('SQL QUERY EROOR :'+ err + ':' + query)
    });
  });
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
  var sen = 'SELECT TOP 40 * FROM liste_ct  ' ;
  con.query( sen ,  function(err,rows){
  //  console.log(sen);
  //  console.log(rows[0]);
    if (err) console.log("ERR");
  else
  { console.log(rows);
}
});
};



    // con.end(function(err) {
    //   // The connection is terminated gracefully
    //   // Ensures all previously enqueued queries are still
    //   // before sending a COM_QUIT packet to the MySQL server.
    // });
    // //---------------------------------------------------------
