 "use strict";/*global require,console,setTimeout */
 /////////////// =========================== ////////////////////
 /*=============> */  /* <================= */
 /////////////// =========================== ////////////////////
const Version = "1.3.11"

console.log("Serveur Mobilite version : " + Version )
var P = require(process.cwd() + '/Client_Param.js')
var PROD = P.SRV_MOBILITE.PROD
 ////////////// Variables et Dépendances /////////////////////////
var sql = require('mssql') ;
var request = require('request');
// var methodOverride = require('method-override')
// var socketioJwt = require('socketio-jwt');
var fs = require('fs') ;
var cors = require('cors')
// var passport	= require('passport');
// var passportJWT = require("passport-jwt");
// // var ExtractJwt = passportJWT.ExtractJwt;
// var JwtStrategy = passportJWT.Strategy;
// var jwt  = require('jwt-simple');
// var jwt = require('jsonwebtoken');
// var jwtOptions = {}
// jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken() ;
// jwtOptions.secretOrKey = 'VdP2016!';
var express = require('express') ;
// var session = require('express-session');
// var RedisStore = require('connect-redis')(session);
// var redisUrl = require('redis-url')
// var LdapStrategy = require('passport-ldapauth');
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
// var passportSocketIo = require('passport.socketio');
var app = express() ;
var crypto = require('crypto') ;
var morgan = require('morgan') ;
var opn = require('opn') ;
// var forceSsl = require('express-force-ssl');
var AD = require('ad');
// var ActiveDirectory = require('activedirectory');
var _ = require("lodash");
var https = require('https');
var Connected = []
// Sets up a session store with Redis
// var sessionStore = new RedisStore({ client: redisUrl.connect(process.env.REDIS_URL) });
var OPC_Socket_ID ;
var Server_ID ;
var j ;

var ad = new AD(P.LDAP)

var sslOptions = {
  key: fs.readFileSync(process.cwd() + P.TLS.key),
  cert: fs.readFileSync(process.cwd() + P.TLS.cert),
  passphrase: P.TLS.passphrase,
  requestCert: true,
  rejectUnauthorized: false
};

var ssl = https.createServer(sslOptions, app);

ssl.listen(P.SRV_MOBILITE.PORT, function(){
 console.log('listening on ' + P.SRV_MOBILITE.PORT );
});

var io = require('socket.io')(ssl, { origins: '*:*'});


//////////////// Configuration node JS ///////////////////////////////
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
process.setMaxListeners(0);

// ad.user('ahmaidouch').isMemberOf('Users')
//   .then(data => console.log(data))
//   .catch(err => console.log(err))
// //
 // ad.user('CN=ahmaidouch,CN=Users,DC=CTPARIS,DC=LOC').authenticate('P@ssw0rd')
 //     .then((data) =>
 //     {
 //      console.log(data)
 //     })
 //     .catch((err) => {
 //         console.log(err)
 //     });
//
// GET_AD_USER()
//   .then(data => {
// 	console.log(data)
//   })
// //   .catch(err => console.log(err))


// var h =  ad.user('ejacob').get()
//                          .then((data) => {
//                               console.log(data)
//                             })
// //

// function GET_AD_USER() {
//   return new Promise(function (resolve, reject) {
// 				ad.user().get()
//         .then(users => {
// 					console.dir(users[40].groups);
// 					var i;
// 					var User_List = []
// 					for (i=0 ; i < 3 ; i++ )
// 					if (users[i].sn && users[i].givenName && users[i].sAMAccountName )
// 					User_List.push({ NOM : users[i].sn, PRENOM : users[i].givenName , USERNAME : users[i].sAMAccountName})
// 					resolve(User_List)
// 				  })
// 				  .catch(err => {
// 					reject(err)
// 				  });
// })
// }
///////////////// Configuration Express /////////////////////////////
// passport.use(new LdapStrategy(OPTS, function(req, user, next) {
//
// console.log()
// }))
//   console.log('payload received', jwt_payload);));
// passport.use(new JwtStrategy(jwtOptions, function(jwt_payload, next) {
//   console.log('payload received', jwt_payload);
//   // next(null,true)
//
//   // usually this would be a database call:
//   // var user = users[_.findIndex(users, {id: jwt_payload.id})];
//   // if err    return done(err, false);
//   // if (user) {
//   //   next(null, user);
//   // } else {
//   //   next(null, false);
//   // }
// }))

app.use(morgan('dev'));
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

// Express session middleware
// app.use(session({
//   store: sessionStore,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: true,
//     maxAge: 2419200000
//   },
//   secret: 'VdP2016!'
// }));

// Initialize Passport session
// app.use(passport.initialize());
// app.use(passport.session());

// parse application/json
app.use(bodyParser.json())
// parse application/x-www-form-urlencoded
// for easier testing with Postman or plain HTML forms
app.use(bodyParser.urlencoded({
  extended: true
}));


app.options('*', cors()) // include before other routes
app.use(cors({ origin: '*' }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.options('*', cors());
// app.use(cors({optionsSuccessStatus: 200 }));
app.options('*', cors({optionsSuccessStatus: 200 }));

app.post("/login", async function(req, res) {
var user = req.body;
console.log(user)

  if (user.password && user.user_sql &&  user.AD_connect && user.user_sql != "" && user.password !="" )  {
   var auth = true

       //Hide for test
             await ad.user(user.AD_connect).authenticate(user.password).then(auth => {

             if (auth) {

               console.log(user.AD_connect + '-' + user.user_sql + ' Authenticated!');
               var DROIT = {}
               if(user.AST_Checked) report('User Authentified', 'SQL Mobilite' , '' , 'Login_I', user.user_sql + " -- ASTREINTE")
               else report('User Authentified', 'SQL Mobilite' , '' , 'Login_I',  user.user_sql  )

               /// Ajout de l'information Login à l'objet connected
               j = Connected.findIndex( function(obj) {return obj.socket == user.socket_id });
               if(j!=-1)
               {
                Connected[j].login =  user.user_sql
               }

               // //Add trace utilisateur connected
               // var request = new sql.Request()
               // request.input('login', sql.NVarChar, user.user_sql)
               // request.input('socket', sql.NVarChar, user.socket_id)
               // request.execute('MOBILITE.dbo.MOBILITE_USER_LOGGED')
               //        .then(result => {
               //        console.log(Connected)
               //     }).catch(err => {
               //        console.log(err)
               //     })

               /////////////////////////////////////// Droit Utilisateur ////////////////////////////////////////////////

               var request = new sql.Request()
               request.input('LOGIN', sql.NVarChar, user.user_sql)
               request.execute('BDD_DONNEES.dbo.MOBILE_DROIT_UTILISATEUR')
                      .then(result => {
                           var h ;
                           for (h=0; h< result.recordset.length ; h++)
                           DROIT[result.recordset[h].C] = result.recordset[h].A

              /////////////////////////////////////// Info Utilisateur ////////////////////////////////////////////////
              // console.log(rec[0])
              var request = new sql.Request()
              request.input('LOGIN', sql.NVarChar, user.user_sql)
              request.execute('BDD_DONNEES.dbo.MOBILE_GET_INFO_USER')
                     .then(result => {
                        var rec = result.recordset[0]
                        console.log(rec)
                        // var payload = { name : rec.UTI_LOGIN + ' '  , username : rec[0].username };
                        // var token = jwt.sign(payload, jwtOptions.secretOrKey)

                        var toSEND = { message: "ok", name : rec.UTI_NOM + ' ' + (rec.UTI_PRENOM || ' ') , username : rec.UTI_LOGIN ,  droit : DROIT , user : user , profil : rec.UPR_LBL , profil_COD : rec.UPR_COD }
                        if (rec.UTI_ACTIF == true) res.send(toSEND);
                        else res.status(401).json({message:"Utilisateur non actif"});

                   })
                   .catch(err => {
                     res.status(401).json({message:"Utilisateur non trouvé en base"});
                   })

                 }).catch(err => {
                   res.status(401).json({message:"Droit d'utilisateur non existant"});
                 })

             }
             else {
                  res.status(401).json({message:"Authentification échouée"});
                }

        })
        .catch(err => {
             res.status(401).json({message:"Authentification échouée"});
        });
      }
      else  res.status(401).json({message:"Nom d'utilisateur ou mot de passe vide"});
})

 //            // authentification problem
 //          report('Wrong User or Password', 'SQL Mobilite' , '' , 'Login_I', b.username )
 //            // socket.emit('Notif', { Msg : "Nom d'utilisateur ou Mot de passe Incorrect" });
 //           res.status(401).json({message:"Utilisateur ou MDP incorrect"});
 //         }}
 //          else //utilisateur introuvable
 //          {
 //          res.status(401).json({message:"Nom d'utilisateur incorrect"});
 //          report('No User With theses credentials', 'SQL Mobilite' , '' , 'Login_I' , b.username)
 //          // socket.emit('Notif', { Msg : "Nom d'utilisateur ou Mot de passe Incorrect" });
 //        }

 // });
//
// app.post("/login", function(req, res) {
// var b = req.body
// console.log(b)
//   if (b.password && b.username && b.username != "" && b.password !="" )  {
//   var hash = crypto.createHash('md5').update(b.password).digest("hex");
//   var query = "Select UTI_LOGIN as username, UTI_NOM as name, UTI_HAB_ASTREINTE as AST from BDD_DONNEES.dbo.UTILISATEUR Where UTI_LOGIN = \'"+ b.username +"\'" ;
//   var request =  new sql.Request().query(query).then(function(recordset) {
//
//         var rec=JSON.parse(JSON.stringify(recordset.recordset).replace(/"\s+|\s+"/g,'"'))
//         // console.log(rec)
//         if(rec && rec[0]) // utilisateur trouvé
//         {
//           // console.log(rec[0])
//           // PAS DE SENSIBILITE A LA CASSE
//           // var srv_user = crypto.createHash('md5').update(rec[0].username).digest("hex");
//           var app_user = crypto.createHash('md5').update(b.username).digest("hex");
//           // console.log(app_user + "-" + srv_user + "-" + app_user + "-" + hash )
//           // if (srv_user == app_user && app_user == hash) // verification a la casse user et pass
//           if (app_user == hash) // verification a la casse user et pass
//           {
//             // socket.emit('Login_Answer', { id : socket.id , user : { id : rec[0].ID , role : rec[0].Role , name : data.username , pass : hash }  })
//             if(b.AST_Checked) report('User Authentified', 'SQL Mobilite' , '' , 'Login_I', b.username + " -- ASTREINTE")
//             else report('User Authentified', 'SQL Mobilite' , '' , 'Login_I', b.username )
//             // console.log(rec[0])
//             /// Ajout de l'information Login à l'objet connected
//             j = Connected.findIndex( function(obj) {return obj.socket == b.socket_id });
//             if(j!=-1)
//             {
//              Connected[j].login = b.username
//             }
//
//             //Add trace utilisateur connected
//             var request = new sql.Request()
//             request.input('login', sql.NVarChar, b.username)
//             request.input('socket', sql.NVarChar, b.socket_id)
//             request.execute('MOBILITE.dbo.MOBILITE_USER_LOGGED', function(err, recordset)  {
//               console.log(Connected)
//             })
//
//             /////////////////////////////////////// Droit Utilisateur ////////////////////////////////////////////////
//             // console.log(rec[0])
//             var request = new sql.Request()
//             request.input('LOGIN', sql.NVarChar, rec[0].username)
//             // request.output('output_parameter', sql.NVarChar)
//             request.execute('BDD_DONNEES.dbo.MOBILE_DROIT_UTILISATEUR', function(err, recordset)  {
//
//             var rec2 = recordset.recordset
//             var DROIT = {}
//
//             for(var h=0; h< rec2.length ; h++)
//             DROIT[rec2[h].C] = rec2[h].A
//             // console.log(DROIT)
//             var payload = { name : rec[0].name , role : rec[0].Role , username : rec[0].username , password : hash };
//             var token = jwt.sign(payload, jwtOptions.secretOrKey);
//             var toSEND = { message: "ok", token: token , name : rec[0].name , username : b.username , pass : hash ,  droit : DROIT , AST_Checked : b.AST_Checked   }
//             res.send(toSEND);
//             // console.log("STATE SEND")
//
//             })
//             ////////////////////////////////////////////////////////////////////////////////////////////////////////////
//            }
//           else
//           {
//             // authentification problem
//           report('Wrong User or Password', 'SQL Mobilite' , '' , 'Login_I', b.username )
//             // socket.emit('Notif', { Msg : "Nom d'utilisateur ou Mot de passe Incorrect" });
//            res.status(401).json({message:"Utilisateur ou MDP incorrect"});
//          }}
//           else //utilisateur introuvable
//           {
//           res.status(401).json({message:"Nom d'utilisateur incorrect"});
//           report('No User With theses credentials', 'SQL Mobilite' , '' , 'Login_I' , b.username)
//           // socket.emit('Notif', { Msg : "Nom d'utilisateur ou Mot de passe Incorrect" });
//         }
//  });
//  }
//  else  res.status(401).json({message:"Nom d'utilisateur ou mot de passe vide"});
//
//  });

// app.post("/secret",passport.authenticate('jwt', { session: false}), function(req, res){
//   //  console.log(req)
//   var b = req.body
//   console.log(b)
//    res.send("Success! You can not see this without a token");
//  });

 // app.get("/secretDebug",
 //   function(req, res, next){
 //     console.log(req.get('Authorization'));
 //     next();
 //   }, function(req, res){
 //     res.send("debugging");
 // });


 app.post('/api/event', function(req, res) {
  var b = req.body
  console.log(b)
   request.post({ url : P.PrgHoraires + req.route.path, form : b }, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       res.send(body) // Show the HTML for the Google homepage.
     }
   })
 })

 app.post('/api/TR/Del', function(req, res) {
  var b = req.body
   request.post({ url : P.PrgHoraires + req.route.path, form : b }, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       res.send(body) // Show the HTML for the Google homepage.
     }
   })
 })

 app.post('/api/EL/Del', function(req, res) {
  var b = req.body
   request.post({ url : P.PrgHoraires + req.route.path, form : b }, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       res.send(body) // Show the HTML for the Google homepage.
     }
   })
 })

 app.post('/api/TR/Add', function(req, res) {
  var b = req.body
  console.log(b)
   request.post({ url : P.PrgHoraires + req.route.path, form : b }, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       res.send(body) // Show the HTML for the Google homepage.
     }
   })
 })

 app.post('/api/TR/Update', function(req, res) {
  var b = req.body
  console.log(b)
   request.post({ url : P.PrgHoraires + req.route.path, form : b }, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       res.send(body) // Show the HTML for the Google homepage.
     }
   })
 })

 app.post('/api/EL/Add', function(req, res) {
  var b = req.body
   request.post({ url : P.PrgHoraires + req.route.path, form : b }, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       res.send(body) // Show the HTML for the Google homepage.
     }
   })
 })
 app.post('/api/EL/Update', function(req, res) {
  var b = req.body
   request.post({ url : P.PrgHoraires + req.route.path, form : b }, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       res.send(body) // Show the HTML for the Google homepage.
     }
   })
 })

 app.get('/api/Raison', function(req, res) {
  var b = req.body
  // console.log(b)
   request.get( P.PrgHoraires + req.route.path , function (error, response, body) {
     if (!error && response.statusCode == 200) {
       res.send(body) // Show the HTML for the Google homepage.
     }
   })
 })

 app.post('/api/event_ER', function(req, res) {
  var b = req.body
   request.post({ url : P.PrgHoraires + req.route.path, form : b }, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       res.send(body) // Show the HTML for the Google homepage.
     }
   })
 })

  app.post('/api/LIST_EG_GF', function(req, res) {
   var b = req.body
    request.post({ url : P.PrgHoraires + req.route.path, form : b }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.send(body) // Show the HTML for the Google homepage.
      }
    })
  })

  app.post('/api/EG/Check_EG_GF', function(req, res) {
   var b = req.body
    request.post({ url : P.PrgHoraires + req.route.path, form : b }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.send(body) // Show the HTML for the Google homepage.
      }
    })
  })


 sql.connect(P.SQL).then(function() {
 report("SQL Mobilite connected ", '' , 'Server' , 'SQLM_C')
 }).catch(function(err) {
 console.log(err.code + ":" + err.message, 'SQL Mobilite' , '' , 'SQLM_C')
 });

 app.use('/',  express.static('../App/www/'));
 app.use(function(req, res, next){
   res.status(404);
   res.type('txt').send('Not found');  // default to plain-text. send()
   });

// opn('https://localhost:3000', {app: 'chrome'});

//////////////////////// Log SQL ///////////////////////////////////////
// REPORT (socketid,event,datetime,type)
// Type : Request,SQL,OPC,USER
function report(event, source, cible, type, info) {
  if (!source) source = ""
  if (!cible) cible = ""
  if (!type) type = ""
  if (!info) info = ""
  var date = new Date().toLocaleString(); ;
  if(source == OPC_Socket_ID) source = "OPC_SERVER"
  if(cible == OPC_Socket_ID) cible = "OPC_SERVER"
  console.log( date + ' : ' + type + ' : ' +  event + ' : ' + source + ' : ' + cible + ' : ' + info )
  var query = "INSERT INTO MOBILITE.dbo.mobilite(source,cible,event,datetime,type,info) Values(\'" + source + "\',\'" + cible + "\',\'" + event + "\',\'" + date + "\',\'" + type + "\',\'" + info +  "\')" ;
  var request = new sql.Request().query(query).then(function() {
  // var recordset=JSON.parse(JSON.stringify(rec).replace(/"\s+|\s+"/g,'"'))
  // console.log(rec)
}).catch(function(err) {
// report(err.code, 'SQL Mobilite' , '' , 'SQLM_E', err.message)
console.log('SQL ERROR : ' + err.message)
});
};


// process.on("SIGINT", () => { //Watch Ctrl+C command
//       console.log("Caught SIGINT. Exiting in 5 seconds.");
//
//       setTimeout(() => {
//         console.log("This should appear in the Electron console but the process will be long killed.");
//         process.exit(0);
//       }, 5000);
//     });

process.on('uncaughtException', function(err) { //Deal with used port 3000 : switch to 3001
        if(err.errno === 'EADDRINUSE' && err.port === '3000')
            { console.log('Port 3000 already in use. Using Port 3001');
             ssl.close();
             ssl.listen(3001, function(){
               console.log('listening on *:3001');
             });
           }

    });


// app.get('/', function(req, res){
//   res.sendfile('index.html');
// });


io.on('connection',function(socket){
socket.to(socket.id).emit('Connection') ;

  //Identification du client Mobile + mise en room "Clients_Room"
  socket.on('Client_Connected', function(data) {
  socket.emit('connect_id', { id : socket.id }) ;

  j = Connected.findIndex( function (obj) { return obj.uuid == data.uuid });
  if(j==-1)
  {
   Connected.push({ socket : socket.id, serial : data.serial, model : data.model, platform : data.platform, uuid : data.uuid, manufacturer : data.manufacturer })
  }
  var request = new sql.Request()
  request.input('socket', sql.NVarChar, socket.id)
  request.input('serial', sql.NVarChar, data.serial)
  request.input('model', sql.NVarChar, data.model)
  request.input('platform', sql.NVarChar, data.platform)
  request.input('uuid', sql.NVarChar, data.uuid)
  request.input('manufacturer', sql.NVarChar, data.manufacturer)
  request.execute('MOBILITE.dbo.MOBILITE_USER_CONNECTED', function(err, recordset)  {
  console.log(Connected)
  })
  report('Client_Connected', socket.id, '' , 'Server_M' )
      // socket.join('Clients_Room');

  socket.to(OPC_Socket_ID).emit('SRV_Query',{ Socket_ID : socket.id , OPC_Socket_ID : OPC_Socket_ID})
  report('SRV_Query', socket.id, OPC_Socket_ID, 'OPC_Q')

});
// io.emit('Server_ID') // catch socket's server self ID
// socket.on('Server_ID' , (s)=> Server_ID = s.id ); // catch socket's server self ID

    // report("user " + socket.id + " is connected",socket.id);
  //Identification du client OPC
socket.on('OPC_Socket_Connected', function(){
      report('OPC_Socket_Connected', socket.id , '' , 'Server_M')
      OPC_Socket_ID = socket.id ;
      socket.to('Clients_Room').emit('Notif', { Msg : 'OPC Connecté' });
});


socket.on('OPC_Report', function(data){
      report(data.event, OPC_Socket_ID , '' , data.type , data.info)
});


// socket.on('ListeCT', function(data){
//       report('Demande CT de '+ socket.id,socket.id)
//       socket.emit('ListeCT_rep' , list_CT);
// });
//
// socket.on('ListeAL', function(data){
//       report('Demande AL de '+ socket.id,socket.id)
//       socket.emit('ListeAL_rep' , list_AL);
// });

// socket.on('OPC_Update', function(data){
//      report(data,socket.id)
//     //  socket.broadcast.emit('OPC_Update',data);
// });

// //Socket query on SQL Database and Read from OPC
// socket.on('AL_CT_Query', function(data){
//    //data comming from App = { Socket_id: 'null', CT : 'null' }
//    //supposing data = { Socket_id: 'null', CT : 'null', Answer : 'null', Error : ''  }
//   //  report(data);
//    var query = "Select * from DONNEES.dbo.SUPERVISION Where localisation = \'" + data.CT +  "' and Type= 'TA'" ;
//    sql.connect(config).then(function() {
//    new sql.Request().query(query).then(function(recordset) {
//    var OPC_promise = new Promise(function(resolve, reject) {
//    socket.emit('OPC_Read_Query', { Socket_id: data.Socket_id, var:{ id: recordset , value:'null' }});
//    socket.emit('AL_CT_Query', data);
//
//    }).catch(function(err) {
//     report(err.code + ":" + err.message, 'SQL Mobilite' , '' , 'SQLM_E')
//     data.Error = err ;
//     socket.emit('AL_CT_Answer', data);
//    });
//  });
//   });
// });

//Socket query on SQL Database based on hash UUID
// socket.on('Sql_Query', function(data){
//     SQL_QUERY(data,socket) ;
//   });

//Requete d'un client donné de la liste des CT
socket.on('CT_Query', function(data){
console.log(data)
// var allConnectedClients = Object.keys(io.sockets.connected);
      data.Socket_ID = socket.id
      data.OPC_Socket_ID = OPC_Socket_ID
      socket.to(OPC_Socket_ID).emit('CT_Query', data )
      report('CT_Query', socket.id, OPC_Socket_ID, 'OPC_Q')
      // console.log(allConnectedClients)
      // console.log(allConnectedClients.length)
});

//Réponse OPC d'une requete de liste des alarmes et renvoi vers le bon client
socket.on('CT_Answer',function(data) {
      var info = data.pop();
      socket.to(info.Socket_ID).emit('CT_Answer', data) ;
      report('CT_Answer', socket.id, info.Socket_ID, 'OPC_A')
});
//Requete d'un client donné de l'etat des serveurs
socket.on('SRV_Query', function(data){
      socket.to(OPC_Socket_ID).emit('SRV_Query',{ Socket_ID : socket.id , OPC_Socket_ID : OPC_Socket_ID})
      report('SRV_Query', socket.id, OPC_Socket_ID, 'OPC_Q')
});

//Réponse donné de l'etat des serveurs
socket.on('SRV_Answer',function(data) {
      var info = data.pop();
      socket.to(info.Socket_ID).emit('SRV_Answer', data) ;
      report('SRV_Answer', socket.id, info.Socket_ID, 'OPC_A')
});

//Requete d'un client donné de l'etat de la mise à jour
socket.on('UPD_Query', function(data){

      socket.to(OPC_Socket_ID).emit('UPD_Query', {  Socket_ID : socket.id , OPC_Socket_ID : OPC_Socket_ID})
      report('UPD_Query', socket.id, OPC_Socket_ID, 'OPC_Q')

});

//Réponse donné de l'etat de la mise à jour
socket.on('UPD_Answer',function(data) {

      var info = data.pop();
      socket.to(info.Socket_ID).emit('UPD_Answer', data) ;
      report('UPD_Answer', socket.id, info.Socket_ID, 'OPC_A')
});

socket.on('AST_Query', async function(data){
      console.log(data)
      data.login = data.login.toLowerCase()
    //TEST
     //  data.AD_connect = 'hmaidoua'
    //  data.user_sql = 'hmaidoua'
      if (data.domain && data.domain.toLowerCase() == P.LDAP.domaine.toLowerCase()) //contient le Domaine => exp PRENOM.NOM@domaine
      { console.log("CASE1")
        data.AD_connect = data.login // PRENOM.NOM
        data.user_sql =  await ad.user(data.login).get()
                                 .then((data) => {
                                        if (data.sAMAccountName) return data.sAMAccountName;
                                        else socket.emit('Notif', { Msg : "Utilisateur non AD" })   })
                                 .catch(() => {console.log("ERROR AD") ; socket.emit('Notif', { Msg : "Erreur configuration AD" }) })
      }
      else if (data.domain && data.domain.toLowerCase() != P.LDAP.domaine.toLowerCase())
      {
         socket.emit('Notif', { Msg : "Nom de domaine incorrect" })
      }
      else {
        if (data.login.indexOf('.') !== -1) //Login contenant un . => PRENOM.NOM
        {
          console.log("CASE2")
          data.AD_connect = data.login ; // PRENOM.NOM
          data.user_sql =  await ad.user(data.login).get()
                                   .then((data) => {
                                            if (data.sAMAccountName) return data.sAMAccountName
                                            else socket.emit('Notif', { Msg : "Utilisateur non AD" })   })
                                    .catch(() => {console.log("ERROR AD") ; socket.emit('Notif', { Msg : "Erreur configuration AD" }) })
        }
        else //sans @ et sans . => USERNAME
        {
          console.log("CASE3")
        data.user_sql =  data.login
        data.AD_connect = await ad.user(data.login).get()
                                  .then((data) => {
                                           if (data.userPrincipalName) return data.userPrincipalName.split("@")[0];
                                           else socket.emit('Notif', { Msg : "Utilisateur non AD" })   })
                                  .catch(() => {console.log("ERROR AD") ; socket.emit('Notif', { Msg : "Erreur configuration AD" })  })
        }
      }
      data.Socket_ID = socket.id;
      data.OPC_Socket_ID = OPC_Socket_ID;
      socket.to(OPC_Socket_ID).emit('AST_Query', data)
      report('AST_Query', socket.id, OPC_Socket_ID, 'OPC_Q')

});

//Réponse donné de l'etat des serveurs
socket.on('AST_Answer',function(data) {
  console.log(data)
      socket.to(data.Socket_ID).emit('AST_Answer', data) ;
      report('AST_Answer', socket.id, data.Socket_ID, 'OPC_A')
});


//Requete d'un client donné de la liste des alarmes
socket.on('AL_Query',function(data) {
      var fdata = Object.assign({ OPC_Socket_ID : OPC_Socket_ID, Socket_ID: socket.id }, data);
      // console.log(data)
      socket.to(OPC_Socket_ID).emit('AL_Query', fdata )
      if (data.Mode == 'Read')
      report('AL_Query Read', socket.id, OPC_Socket_ID, 'OPC_Q', data.Selected_CT)
      else
      report('AL_Query Write', socket.id, OPC_Socket_ID, 'OPC_Q', data.M )

});

//Réponse OPC d'une requete de liste des alarmes et renvoi vers le bon client
socket.on('AL_Answer',function(data) {
  console.log(data)
      var info = data.pop();
      socket.to(info.Socket_ID).emit('AL_Answer', data) ;
      report('AL_Answer', OPC_Socket_ID, info.Socket_ID, 'OPC_A', info.Selected_CT)

});
// //Redirige les MAJ des KPI OPC vers Clients_Room
// socket.on('OPC_General_Update',function(data) {
//       // socket.to(data.Socket_ID).emit('AL_Answer', data) ;
//       // console.log(data);
//       socket.to('Clients_Room').emit('OPC_General_Update',data);
// });

//Requete d'un client donné de la liste des circuits d'un CT
socket.on('GF_Query', function(data){
  console.log(data)
      socket.to(OPC_Socket_ID).emit('GF_Query', {Socket_ID : socket.id , OPC_Socket_ID : OPC_Socket_ID , Selected_CT : data.Selected_CT , Selected_PT : data.Selected_PT })
      report('GF_Query', socket.id, OPC_Socket_ID, 'OPC_Q', data.Selected_CT + ":" + data.Selected_PT)
});

// Réponse du client OPC en circuit CTA
socket.on('GF_Answer', function(data){
      var info = data.LIST.pop()
      socket.to(info.Socket_ID).emit('GF_Answer', data)
      report('GF_Answer', OPC_Socket_ID, info.Socket_ID, 'OPC_A', info.Selected_CT)
  });

//Requete d'un client donné de la liste des graphes de température du Circuit
socket.on('Cha_Query', function(data){
      socket.to(OPC_Socket_ID).emit('Cha_Query', {Socket_ID : socket.id , OPC_Socket_ID : OPC_Socket_ID , Selected_CT : data.Selected_CT, Selected_PT : data.Selected_PT , NGF : data.NGF , DGF : data.DGF })
      report('Cha_Query', socket.id , OPC_Socket_ID, 'OPC_Q', data.Selected_CT + " : " + data.NGF + " : " + data.DGF)
        });

// // Réponse du client SQL pour la courbe c1
socket.on('Cha_Answer1', function(data){
      var info = data.pop()
      data.push({ NGF : info.NGF , DGF : info.DGF })
      console.log(data)
      socket.to(info.Socket_ID).emit('Cha_Answer1', data)
      report('Cha_Answer1', OPC_Socket_ID, info.Socket_ID, 'OPC_A', info.Selected_CT + " : " + info.NGF + " : " + info.DGF)
});

// Réponse du client SQL pour la courbe c2
socket.on('Cha_Answer2', function(data){
      var info = data.pop()
      data.push({ NGF : info.NGF , DGF : info.DGF })
      socket.to(info.Socket_ID).emit('Cha_Answer2', data)
      report('Cha_Answer2', info.OPC_Socket_ID, info.Socket_ID, 'OPC_A', info.Selected_CT + " : " + info.NGF + " : " + info.DGF)
  });

// Réponse du client SQL pour la courbe consigne R01/R02/R03
  socket.on('Cha_Answer3', function(data){
        var info = data.pop()
        socket.to(info.Socket_ID).emit('Cha_Answer3', data)
        report('Cha_Answer3', info.OPC_Socket_ID, info.Socket_ID, 'OPC_A', info.Selected_CT + " : " + info.NGF + " : " + info.DGF)
    });
  // //Requete d'un client donné de la liste des CT et DesignGroupeFonctionnel pour programmes horaires
  socket.on('PH_Query', function(data){
    if (data.Mode == 'CT')
    {
        socket.to(OPC_Socket_ID).emit('PH_Query', {Socket_ID : socket.id , OPC_Socket_ID : OPC_Socket_ID , Mode : data.Mode , username : data.username})
        report('PH_Query', socket.id , OPC_Socket_ID, 'OPC_Q', "Liste_CT")
      }
    if (data.Mode == 'TR')
    {
      // console.log(data)
      socket.to(OPC_Socket_ID).emit('PH_Query', {Socket_ID : socket.id , OPC_Socket_ID : OPC_Socket_ID , Mode : data.Mode , Period : data.Period })
      report('PH_Query', socket.id , OPC_Socket_ID, 'OPC_Q', "Liste_Tranches : " + data.CT + " : " + data.NGF + " : " + data.DGF + " : " + data.ID )
    }

    });

  // Réponse du client OPC pour la liste CT + DGF pour les PH
  socket.on('PH_Answer', function(data){
    // console.log(data)
    var info = data.pop();
    socket.to(info.Socket_ID).emit('PH_Answer', data) ;
    report('PH_Answer', OPC_Socket_ID, info.Socket_ID, 'OPC_A', "Liste_CT")

  });

  socket.on('PH_Answer2', function(data){
    var info = data.pop();
    socket.to(info.Socket_ID).emit('PH_Answer2', data) ;
    report('PH_Answer2', OPC_Socket_ID, info.Socket_ID, 'OPC_A', info.Selected_CT )  });

// //Mise à jour OPC des températures ambiantes
  // socket.on('CTA_Answer_Update', function(data){
  // socket.to(data.Socket_ID).emit('CTA_Answer_Update', data )
  // console.log('CTA_Answer_Update redirected from : ' + data.OPC_Socket_ID + ' to ' + data.Socket_ID )
  //   });

//Requete d'un client donné de la liste des status du cT
socket.on('Sta_Query', function(data){
  console.log(data)
      socket.to(OPC_Socket_ID).emit('Sta_Query', {Socket_ID : socket.id , OPC_Socket_ID : OPC_Socket_ID , Selected_CT : data.Selected_CT , Mode : data.Mode })
      report('Sta_Query', socket.id , OPC_Socket_ID, 'OPC_Q')
});
//
// // Réponse du client OPC status CT
socket.on('Sta_Answer', function(data){
      var info = data.pop()
      socket.to(info.Socket_ID).emit('Sta_Answer', data )
      report('Sta_Answer', info.OPC_Socket_ID, info.Socket_ID, 'OPC_A')
});

//
socket.on('Fic_Query', function(data){
  console.log(data)
// Requete de la liste des CT globale
if (data.Mode == 'CT')
  {
      socket.to(OPC_Socket_ID).emit('Fic_Query', {Socket_ID : socket.id , OPC_Socket_ID : OPC_Socket_ID , Mode : data.Mode , username : data.username})
      report('Fic_Query', socket.id , OPC_Socket_ID, 'OPC_Q', "Liste_CT")
  }
//requete la Fiche_Identite du CT
if (data.Mode == 'FIC')
  {
console.log(data)
report('Fic_Query', socket.id , OPC_Socket_ID, 'OPC_Q', "Fiche_Identite : " + data.CT)
var FIC = []
var request = new sql.Request()
request.input('NUM_CT', sql.NVarChar, data.CT)
// request.output('output_parameter', sql.NVarChar)
request.execute('BDD_DONNEES.dbo.IHM_GET_CENTRE_THERMIQUE', function(err, recordset)  {
FIC[0] = recordset.recordset[0]
})

request.execute('BDD_DONNEES.dbo.IHM_GET_CENTRE_THERMIQUE_EQUIPEMENT', function(err, recordset) {
FIC[1] = recordset.recordset
})

request.execute('BDD_DONNEES.dbo.IHM_GET_CENTRE_THERMIQUE_GROUPE_EXPLOITATION',function (err, recordset)  {
FIC[2] = recordset.recordset
})

request.execute('BDD_DONNEES.dbo.IHM_GET_CENTRE_THERMIQUE_EQUIPEMENT', function(err, recordset) {
FIC[3] = recordset.recordset
})

// request.execute('BDD_DONNEES.dbo.IHM_GET_CENTRE_THERMIQUE_GROUPE_FONCTIONNEL', (err, result) => {
// FIC[3] = result[0]
// })

request.execute('BDD_DONNEES.dbo.IHM_GET_NB_GROUPE_FONCTIONNEL', function(err, recordset)  {
FIC[4] = recordset.recordset
// console.log(FIC)
   socket.emit('Fic_Answer2', FIC )
})
}

});
//
// // Réponse du client OPC status CT
socket.on('Fic_Answer1', function(data){
  // console.log(data)
      var info = data.pop()
      socket.to(info.Socket_ID).emit('Fic_Answer1', data )
      report('Fic_Answer1', info.OPC_Socket_ID, info.Socket_ID, 'OPC_A')
});

//Requete des consignes d'un Grp fonctionnel d'un CT
socket.on('Cons_Query', function(data){
  // console.log(data)
     data.Socket_ID = socket.id ;
     data.OPC_Socket_ID = OPC_Socket_ID;
     socket.to(OPC_Socket_ID).emit('Cons_Query',  data )
     if (data.Selected_CT)
    report('Cons_Query_Read', socket.id, OPC_Socket_ID, 'OPC_Q', data.Selected_CT + ":" + data.NGF + ":" + data.DGF) //done
    else
    report('Cons_Query_Write', socket.id, OPC_Socket_ID, 'OPC_Q', data.M + ": " + data.V + ">" + data.LV ) //done

});

 //Reponse OPC pour les consignes
socket.on('Cons_Answer', function(data){
      // console.log(data)
      var info = data.pop(); // capture le dernier element de l'objet
      socket.to(info.Socket_ID).emit('Cons_Answer', data )
      report('Cons_Answer', info.OPC_Socket_ID, info.Socket_ID, 'OPC_A', info.Selected_CT + ":" + info.NGF + ":" + info.DGF)
});

//Reponse OPC pour les consignes
socket.on('Cons_Update', function(data){
     var Socket_ID = data.Socket_ID ;
     delete data.OPC_Socket_ID ;
     delete data.Socket_ID ;
    //  console.log(Socket_ID)
    socket.to('Clients_Room').emit('Cons_Update', data )  //Live update to all Clients of Consigne Changes
    report('Cons_Query_Write_Answer', OPC_Socket_ID, Socket_ID, 'OPC_A', data.M + ":" + data.V)

      // report('CTA_Cons Update all ',socket.id)
});

  //Report erreur aux Clients_Room
socket.on('Notif_All', function(data) {
      socket.to('Clients_Room').emit('Notif',data);
      report('Notif_All', OPC_Socket_ID, 'All', 'Info')
})

socket.on('Notif_Client', function(data){
  console.log(data)
      socket.to(data.Socket_ID).emit('Notif', data )
      report('Notif_Client', OPC_Socket_ID, data.Socket_ID, 'Info' , data.Msg )
})

socket.on('unlog', function (data) {
//User unlogged
j = Connected.findIndex( function(obj) {return obj.login == data.user });
if(j!=-1)
{
Connected.login = ''
}

var request = new sql.Request()
request.input('socket', sql.NVarChar, socket.id)
request.execute('MOBILITE.dbo.MOBILITE_USER_UNLOGGED', function(err, recordset)  {
})

})

socket.on('disconnect', function () {
//socket disconnected
       j = Connected.findIndex( function(obj) {return obj.socket == socket.id });
       if(j!=-1)
       {
       Connected.splice(j,1)
       }

       console.log(Connected)

       var request = new sql.Request()
       request.input('socket', sql.NVarChar, socket.id)
       request.execute('MOBILITE.dbo.MOBILITE_USER_DISCONNECTED', function(err, recordset)  {
       })

      if (socket.id == OPC_Socket_ID)
      {
      socket.to('Clients_Room').emit('Notif',{ Msg: 'OPC Déconnecté' });
      report('OPC Déconnecté', OPC_Socket_ID, '' , 'OPC_I')
      }
      else report('Client_disconnected', socket.id, '', 'Server_M')
  });
});

if (PROD == 0 )
{ // Si exécution en DEV => genère le fichier version-info
//Write Version Ressource
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
}
//
// function check_id (user,pass){
//   var sen = 'SELECT username,password FROM '+ table +' WHERE username ="' + user + '" AND password="' + pass + '"';
//   con.query( sen ,  function(err,rows){
//
//     if (err) console.log("ERR");
//   else
//   {  if (rows[0] ){
//     console.log("SQL user ok");
//     return 1;
//   }else{
//     console.log("SQL user fail ");
//     return 0;
//   }
//
// }
// });
// };

// function get_CT (){
//   var sen = 'SELECT TOP 40 * FROM liste_ct  ' ;
//   con.query( sen ,  function(err,rows){
//   //  console.log(sen);
//   //  console.log(rows[0]);
//     if (err) console.log("ERR");
//   else
//   { console.log(rows);
// }
// });
// };


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

    // con.end(function(err) {
    //   // The connection is terminated gracefully
    //   // Ensures all previously enqueued queries are still
    //   // before sending a COM_QUIT packet to the MySQL server.
    // });
    // //---------------------------------------------------------

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
