function check_id(a,b){var c="SELECT username,password FROM "+table+' WHERE username ="'+a+'" AND password="'+b+'"';con.query(c,function(a,b){return a?void console.log("ERR"):b[0]?(console.log("SQL user ok"),1):(console.log("SQL user fail "),0)})}function get_CT(){var a="SELECT TOP 40 * FROM liste_ct  ";con.query(a,function(a,b){a?console.log("ERR"):console.log(b)})}var sql=require("mssql"),app=require("express")(),crypto=require("crypto"),http=require("http").Server(app),io=require("socket.io")(http);process.setMaxListeners(0);var OPC_Socket_ID,config={user:"BdConnectClient",password:"Uuxwp7Mcxo7Khy",server:"10.18.10.3\\MSSQLSERVER",database:"DONNEES",options:{encrypt:!0}};http.listen(3e3,function(){console.log("listening on *:3000")}),process.on("uncaughtException",function(a){"EADDRINUSE"===a.errno&&"3000"===a.port&&console.log("Port 3000 already in use. Using Port 4000"),http.close(),http.listen(4e3,function(){console.log("listening on *:4000")})}),io.on("connect",function(a,b){a.on("OPC_Socket_Connected",function(){console.log("OPC_Socket_Connected : "+a.id),OPC_Socket_ID=a.id,a.to("Clients_Room").emit("Notif",{Msg:"OPC Connecté"})}),a.on("Client_Connected",function(){console.log("Client_Connected : "+a.id),a.join("Clients_Room")}),a.on("ListeCT",function(b){console.log("Demande CT de "+a.id),a.emit("ListeCT_rep",list_CT)}),a.on("ListeAL",function(b){console.log("Demande AL de "+a.id),a.emit("ListeAL_rep",list_AL)}),a.on("OPC_Update",function(a){console.log(a)}),a.on("AL_CT_Query",function(b){console.log(b);var c="Select * from dbo.SUPERVISION Where localisation = '"+b.CT+"' and Type= 'TA'";sql.connect(config).then(function(){(new sql.Request).query(c).then(function(c){new Promise(function(d,e){a.emit("OPC_Read_Query",{Socket_id:b.Socket_id,"var":{id:c,value:"null"}}),a.emit("AL_CT_Query",b)})["catch"](function(c){b.Error=c,a.emit("AL_CT_Answer",b)})})})}),a.on("CT_Query",function(){a.to(OPC_Socket_ID).emit("CT_Query",{Socket_ID:a.id,OPC_Socket_ID:OPC_Socket_ID}),console.log("CT_Query redirected from : "+a.id+" to "+OPC_Socket_ID)}),a.on("CT_Answer",function(b){a.to(b.Socket_ID).emit("CT_Answer",b)}),a.on("AL_Query",function(b){var c=Object.assign({OPC_Socket_ID:OPC_Socket_ID,Socket_ID:a.id},b);a.to(OPC_Socket_ID).emit("AL_Query",c),console.log("Al_query redirected from : "+a.id+" to "+OPC_Socket_ID+" - Mode : "+b.Mode)}),a.on("AL_Answer",function(b){console.log(b),a.to(b.Socket_ID).emit("AL_Answer",b)}),a.on("Login_Query",function(b){console.log(b);var c=crypto.createHash("md5").update(b.password).digest("hex");console.log(c);var d="Select * from dbo.USERS Where UserName = '"+b.username+"'";sql.connect(config).then(function(){(new sql.Request).query(d).then(function(d){d&&(rec=JSON.parse(JSON.stringify(d).replace(/"\s+|\s+"/g,'"')),rec[0]?(console.log(rec[0]),rec[0].PassWord==c?a.emit("Login_Answer",{id:a.id,user:{id:rec[0].ID,role:rec[0].Role,name:b.username,pass:c}}):(console.log("Wrong User or Password"),a.emit("Notif",{Msg:"Nom d'utilisateur ou Mot de passe Incorrect"}))):(console.log("No User With theses credentials"),a.emit("Notif",{Msg:"Nom d'utilisateur ou Mot de passe Incorrect"})))})["catch"](function(a){})})}),a.on("OPC_General_Update",function(b){console.log(b),a.to("Clients_Room").emit("OPC_General_Update",b)}),a.on("CTA_Query",function(b){a.to(OPC_Socket_ID).emit("CTA_Query",{Socket_ID:a.id,OPC_Socket_ID:OPC_Socket_ID,Selected_CT:b.Selected_CT}),console.log("CTA_Query redirected from : "+a.id+" to "+OPC_Socket_ID)}),a.on("CTA_Answer",function(b){a.to(b.Socket_ID).emit("CTA_Answer",b),console.log("CTA_Answer redirected from : "+b.OPC_Socket_ID+" to "+b.Socket_ID)}),a.on("CTA_Answer_Update",function(b){a.to(b.Socket_ID).emit("CTA_Answer_Update",b),console.log("CTA_Answer_Update redirected from : "+b.OPC_Socket_ID+" to "+b.Socket_ID)}),a.on("Sta_Query",function(b){a.to(OPC_Socket_ID).emit("Sta_Query",{Socket_ID:a.id,OPC_Socket_ID:OPC_Socket_ID,Selected_CT:b.Selected_CT}),console.log("Sta_Query redirected from : "+a.id+" to "+OPC_Socket_ID)}),a.on("Sta_Answer",function(b){a.to(b.Socket_ID).emit("Sta_Answer",b),console.log("Sta_Answer redirected from : "+b.OPC_Socket_ID+" to "+b.Socket_ID)}),a.on("Cons_Query",function(b){b.Socket_ID=a.id,b.OPC_Socket_ID=OPC_Socket_ID,a.to(OPC_Socket_ID).emit("Cons_Query",b),console.log("Consigne Query redirected from : "+a.id+" to "+OPC_Socket_ID)}),a.on("Cons_Answer",function(b){"TC"==b.Type&&(b.Value?b.Etat=b.TOR_CodeEtat1:b.Etat=b.TOR_CodeEtat0),console.log(b),a.to(b.Socket_ID).emit("Cons_Answer",b),console.log("CTA_Answer redirected from : "+b.OPC_Socket_ID+" to "+b.Socket_ID)}),a.on("Cons_Answer_Update",function(b){"TC"==b.Type&&(b.Value?b.Etat=b.TOR_CodeEtat1:b.Etat=b.TOR_CodeEtat0),console.log(b),a.to("Clients_Room").emit("Cons_Answer",b),console.log("CTA_Cons Update for all ")}),a.on("Notif_All",function(b){a.to("Clients_Room").emit("Notif",b)}),a.on("Notif_Client",function(b){console.log("Notif_Client "+b.Socket_ID),a.to(b.Socket_ID).emit("Notif",b)}),a.on("disconnect",function(){a.id==OPC_Socket_ID&&a.to("Clients_Room").emit("Notif",{Msg:"OPC Déconnecté"})})});