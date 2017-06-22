 /*global require,console,setTimeout */
var sql = require('mssql');
var fs = require('fs');
var app = require('express')();
var crypto = require('crypto');
var sslOptions = {
  key: fs.readFileSync('./file.pem'),
  cert: fs.readFileSync('./file.crt')
};
var http = require('https').createServer(sslOptions, app)
// var server = https.createServer(sslOptions, app)
var io = require('socket.io')(http);
process.setMaxListeners(0);
var OPC_Socket_ID ;

// SQL Srv
var config = {
    user: 'BdConnectClient',
    password: 'Uuxwp7Mcxo7Khy',
    // user: 'SQL_CLIENT',
    // password: 'VdP2016!',
    server: '10.18.10.3\\MSSQLSERVER', // You can use 'localhost\\instance' to connect to named instance
    // server: '10.18.10.3',
    database: 'DONNEES',
    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
}


http.listen(3000, function(){
  console.log('listening on *:3000');

});

process.on('uncaughtException', function(err) {
        if(err.errno === 'EADDRINUSE' && err.port === '3000')
            { console.log('Port 3000 already in use. Using Port 4000');
             http.close();
             http.listen(4000, function(){
               console.log('listening on *:4000');
             });
           }

    });


// app.get('/', function(req, res){
//   res.sendfile('index.html');
// });


io.on('connect', function(socket,$rootScope){

  //Identification du client OPC
  socket.on('OPC_Socket_Connected', function(){
  console.log('OPC_Socket_Connected : ' +  socket.id);
  OPC_Socket_ID = socket.id ;
  socket.to('Clients_Room').emit('Notif', { Msg : 'OPC Connecté' });
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
  //  console.log(data);
   var query = "Select * from dbo.SUPERVISION Where localisation = \'" + data.CT +  "' and Type= 'TA'" ;
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
var info = data.pop();
socket.to(info.Socket_ID).emit('CT_Answer', data) ;
console.log('CT_Answer to ' + info.Socket_ID)
});

//Requete d'un client donné de la liste des alarmes
socket.on('AL_Query',function(data)
{
  var fdata = Object.assign({ OPC_Socket_ID : OPC_Socket_ID, Socket_ID: socket.id }, data);
    socket.to(OPC_Socket_ID).emit('AL_Query', fdata )
    console.log('AL_Query redirected from : ' + socket.id + ' to ' + OPC_Socket_ID + ' - Mode : ' + data.Mode)
  });


//Réponse OPC d'une requete de liste des alarmes et renvoi vers le bon client
socket.on('AL_Answer',function(data) {
  var info = data.pop();
  socket.to(info.Socket_ID).emit('AL_Answer', data) ;
  console.log('AL_Answer redirected from : ' + OPC_Socket_ID + ' to ' + info.Socket_ID )

});

//Requet d'authentification SQL d'un client
socket.on('Login_Query',function(data) {
  // console.log(data)
  var hash = crypto.createHash('md5').update(data.password).digest("hex");
  // console.log(hash)
  var query = "Select * from dbo.USERS Where UserName = \'"+ data.username +"\'" ;
  sql.connect(config).then(function() {
  new sql.Request().query(query).then(function(recordset) {
    if(recordset)
    {
    rec=JSON.parse(JSON.stringify(recordset).replace(/"\s+|\s+"/g,'"'))
    if(rec[0]) // utilisateur trouvé
    {
    console.log(rec[0])
    if (rec[0].PassWord == hash)
    {
      console.log("ok")
    socket.emit('Login_Answer', { id : socket.id , user : { id : rec[0].ID , role : rec[0].Role , name : data.username , pass : hash }  })
    }
    else
    {
    // authentification problem
    console.log('Wrong User or Password')
    socket.emit('Notif', { Msg : "Nom d'utilisateur ou Mot de passe Incorrect" });
     }}
    else //utilisateur introuvable
    {console.log('No User With theses credentials')
    socket.emit('Notif', { Msg : "Nom d'utilisateur ou Mot de passe Incorrect" });
    }

  //
  // var OPC_promise = new Promise(function(resolve, reject) {
  // socket.emit('OPC_Read_Query', { Socket_id: data.Socket_id, var:{ id: recordset , value:'null' }});
  // socket.emit('AL_CT_Query', data);
}
  }).catch(function(err) {

  });
  });

});

//Redirige les MAJ des KPI OPC vers Clients_Room
socket.on('OPC_General_Update',function(data) {
  // socket.to(data.Socket_ID).emit('AL_Answer', data) ;
  // console.log(data);
  socket.to('Clients_Room').emit('OPC_General_Update',data);
});

//Requete d'un client donné de la liste des circuits d'un CT
socket.on('CTA_Query', function(data){
socket.to(OPC_Socket_ID).emit('CTA_Query', {Socket_ID : socket.id , OPC_Socket_ID : OPC_Socket_ID , Selected_CT : data.Selected_CT , Selected_PT : data.Selected_PT })
console.log('CTA_Query redirected from : ' + socket.id + ' to ' + OPC_Socket_ID )
      });

// Réponse du client OPC en circuit CTA
socket.on('CTA_Answer', function(data){
var info = data.pop()
socket.to(info.Socket_ID).emit('CTA_Answer', data)
console.log('CTA_Answer redirected from : ' + info.OPC_Socket_ID + ' to ' + info.Socket_ID )
  });

//Requete d'un client donné de la liste des circuits d'un CT
socket.on('Cha_Query', function(data){
socket.to(OPC_Socket_ID).emit('Cha_Query', {Socket_ID : socket.id , OPC_Socket_ID : OPC_Socket_ID , Selected_CT : data.Selected_CT, Selected_PT : data.Selected_PT , DGF : data.DGF })
console.log('Cha_Query redirected from : ' + socket.id + ' to ' + OPC_Socket_ID )
        });
// Réponse du client OPC en circuit CTA
socket.on('Cha_Answer', function(data){
var info = data.pop()
socket.to(info.Socket_ID).emit('Cha_Answer', data)
console.log('Cha_Answer redirected from : ' + info.OPC_Socket_ID + ' to ' + info.Socket_ID )
  });
socket.on('Cha_Answer2', function(data){
var info = data.pop()
socket.to(info.Socket_ID).emit('Cha_Answer', data)
console.log('Cha_Answer2 redirected from : ' + info.OPC_Socket_ID + ' to ' + info.Socket_ID )
  });

// //Mise à jour OPC des températures ambiantes
//   socket.on('CTA_Answer_Update', function(data){
//   socket.to(data.Socket_ID).emit('CTA_Answer_Update', data )
//   console.log('CTA_Answer_Update redirected from : ' + data.OPC_Socket_ID + ' to ' + data.Socket_ID )
//     });

//Requete d'un client donné de la liste des status du cT
    socket.on('Sta_Query', function(data){
    socket.to(OPC_Socket_ID).emit('Sta_Query', {Socket_ID : socket.id , OPC_Socket_ID : OPC_Socket_ID , Selected_CT : data.Selected_CT })
    console.log('Sta_Query redirected from : ' + socket.id + ' to ' + OPC_Socket_ID )
    });

// Réponse du client OPC status CT
    socket.on('Sta_Answer', function(data){
      var info = data.pop()
    socket.to(info.Socket_ID).emit('Sta_Answer', data )
    console.log('Sta_Answer redirected from : ' + info.OPC_Socket_ID + ' to ' + info.Socket_ID )
      });

//Requete des consignes d'un Grp fonctionnel d'un CT
   socket.on('Cons_Query', function(data){
     console.log(data)
   data.Socket_ID = socket.id ;
   data.OPC_Socket_ID = OPC_Socket_ID;
   socket.to(OPC_Socket_ID).emit('Cons_Query',  data )
   console.log('Cons_Query from : ' + socket.id + ' to ' + OPC_Socket_ID )
   });

 //Reponse OPC pour les consignes
  socket.on('Cons_Answer', function(data){
  var info = data.pop();
  socket.to(info.Socket_ID).emit('Cons_Answer', data )
  console.log('Cons_Answer from : ' + info.OPC_Socket_ID + ' to ' + info.Socket_ID )
      });

  //Reponse OPC pour les consignes
  socket.on('Cons_Update', function(data){
    console.log(data)
  socket.to(data.Socket_ID).emit('Cons_Update', data )
  console.log('CTA_Cons Update for all ' )
           });

  //Report erreur aux Clients_Room
  socket.on('Notif_All', function(data)
  {  socket.to('Clients_Room').emit('Notif',data);
  })

  socket.on('Notif_Client', function(data)
  {  console.log('Notif_Client ' + data.Socket_ID )
   socket.to(data.Socket_ID).emit('Notif', data )
  })

  socket.on('disconnect', function () {
  if (socket.id == OPC_Socket_ID)
  socket.to('Clients_Room').emit('Notif',{ Msg: 'OPC Déconnecté' });

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
  var sen = 'SELECT username,password FROM '+ table +' WHERE username ="' + user + '" AND password="' + pass + '"';
  con.query( sen ,  function(err,rows){

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
