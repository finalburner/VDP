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

// process.on('uncaughtException', function(err) {
//         if(err.errno === 'EADDRINUSE' && err.port === '3000')
//              console.log('Port 3000 already in use. Using Port 4000');
//              http.close();
//              http.listen(4000, function(){
//                console.log('listening on *:4000');
//              });
//
//     });


// app.get('/', function(req, res){
//   res.sendfile('index.html');
// });


io.on('connect', function(socket,$rootScope){

  //Identification du client OPC
  socket.on('OPC_Socket_Connected', function(){
  console.log('OPC_Socket_Connected : ' +  socket.id);
  OPC_Socket_ID = socket.id ;
  });

  //Identification du client Mobile + mise en room "Clients_Room"
  socket.on('Client_Connected', function() {
  console.log('Client_Connected : ' +  socket.id);
  socket.join('Clients_Room');
   });

  // socket.on('App_Info_Query', function(){
  // socket.emit('App_Info_Answer', { OPC_Socket_ID : OPC_Socket_ID} );
  //   });
  // socket.on('disconnect', function(){
  // console.log('user disconnected');
  //   });
  // socket.on('join', function(data){
  // console.log(data)
  //  });
   //demande login
  // socket.on('login', function(data){
  //    console.log('id: ' + data.id + ',user: ' + data.user +',pass: ' + data.pass + ',auth: ' + data.auth);
  //    var auths = check_id(data.user,data.pass);
  //    console.log(auths);
  //    socket.emit('login_rep' , {
  //      auth : check_id(data.user,data.pass)
  //    });
  // //    console.log( check_id(data.user,data.pass) );
  //     });

   socket.on('ListeCT', function(data){
   console.log('Demande CT de '+ socket.id);
    socket.emit('ListeCT_rep' , list_CT);
    });

   socket.on('ListeAL', function(data){
    console.log('Demande AL de '+ socket.id);
     socket.emit('ListeAL_rep' , list_AL);
     });

    //  io.sockets.on('connection', function (socket) {
    //
    //  });

   socket.on('OPC_Update', function(data){
     console.log(data);
    //  socket.broadcast.emit('OPC_Update',data);
   });

//Socket query on SQL Database and Read from OPC
   socket.on('AL_CT_Query', function(data){
   //data comming from App = { Socket_id: 'null', CT : 'null' }
   //supposing data = { Socket_id: 'null', CT : 'null', Answer : 'null', Error : ''  }
   console.log(data);
   var query = "Select * from VDP.dbo.SUPERVISION Where localisation = \'" + data.CT +  "' and Type= 'TA'" ;
   sql.connect(config).then(function() {
   new sql.Request().query(query).then(function(recordset) {
   var OPC_promise = new Promise(function(resolve, reject) {
   socket.emit('OPC_Read_Query', { Socket_id: data.Socket_id, var:{ id: recordset , value:'null' }});
   socket.emit('AL_CT_Query', data);

   }).catch(function(err) {
     data.Error = err ;
   socket.emit('AL_CT_Answer', data);
   });
 });
  });
   });

//Socket query on SQL Database based on hash UUID
// socket.on('Sql_Query', function(data){
//     SQL_QUERY(data,socket) ;
//   });

//Requete d'un client donné de la liste des CT
socket.on('CT_Query', function(){
socket.to(OPC_Socket_ID).emit('CT_Query', {Socket_ID : socket.id , OPC_Socket_ID : OPC_Socket_ID })
console.log('CT_Query redirected from : ' + socket.id + ' to ' + OPC_Socket_ID )
      });

//Réponse OPC d'une requete de liste des alarmes et renvoi vers le bon client
socket.on('CT_Answer',function(data) {
socket.to(data.Socket_ID).emit('CT_Answer', data) ;

});

//Requete d'un client donné de la liste des alarmes
socket.on('AL_Query',function(data)
{
  var fdata = Object.assign({ OPC_Socket_ID : OPC_Socket_ID, Socket_ID: socket.id }, data);
    socket.to(OPC_Socket_ID).emit('AL_Query', fdata )
    console.log('Al_query redirected from : ' + socket.id + ' to ' + OPC_Socket_ID + ' - Mode : ' + data.Mode)
  });



//Réponse OPC d'une requete de liste des alarmes et renvoi vers le bon client
socket.on('AL_Answer',function(data) {
  socket.to(data.Socket_ID).emit('AL_Answer', data) ;
});

//Redirige les MAJ des KPI OPC vers Clients_Room
socket.on('OPC_General_Update',function(data) {
  // socket.to(data.Socket_ID).emit('AL_Answer', data) ;
  console.log(data);
  socket.to('Clients_Room').emit('OPC_General_Update',data);
});

//Requete d'un client donné de la liste des circuits d'un CT
socket.on('CTA_Query', function(data){
socket.to(OPC_Socket_ID).emit('CTA_Query', {Socket_ID : socket.id , OPC_Socket_ID : OPC_Socket_ID , Selected_CT : data.Selected_CT })
console.log('CTA_Query redirected from : ' + socket.id + ' to ' + OPC_Socket_ID )
      });

// Réponse du client OPC en circuit CTA
socket.on('CTA_Answer', function(data){
socket.to(data.Socket_ID).emit('CTA_Answer', data )
console.log('CTA_Answer redirected from : ' + data.OPC_Socket_ID + ' to ' + data.Socket_ID )
  });

//Mise à jour OPC des températures ambiantes
  socket.on('CTA_Answer_Update', function(data){
  socket.to(data.Socket_ID).emit('CTA_Answer_Update', data )
  console.log('CTA_Answer_Update redirected from : ' + data.OPC_Socket_ID + ' to ' + data.Socket_ID )
    });

//Requete des consignes d'un Grp fonctionnel d'un CT
   socket.on('Cons_Query', function(data){
   data.Socket_ID = socket.id ;
   data.OPC_Socket_ID = OPC_Socket_ID;
   socket.to(OPC_Socket_ID).emit('Cons_Query',  data )
   console.log('Consigne Query redirected from : ' + socket.id + ' to ' + OPC_Socket_ID )
   });
 //Reponse OPC pour les consignes
  socket.on('Cons_Answer', function(data){
  socket.to(data.Socket_ID).emit('Cons_Answer', data )
   console.log('CTA_Answer redirected from : ' + data.OPC_Socket_ID + ' to ' + data.Socket_ID )
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
