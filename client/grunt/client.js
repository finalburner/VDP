function check_id(e,o){var t="SELECT username,password FROM "+table+' WHERE username ="'+e+'" AND password="'+o+'"';con.query(t,function(e,o){return e?void console.log("ERR"):o[0]?(console.log("SQL user ok"),1):(console.log("SQL user fail "),0)})}function get_CT(){con.query("SELECT TOP 40 * FROM liste_ct  ",function(e,o){e?console.log("ERR"):console.log(o)})}var sql=require("mssql"),app=require("express")(),crypto=require("crypto"),http=require("http").Server(app),io=require("socket.io")(http);process.setMaxListeners(0);var OPC_Socket_ID,config={user:"BdConnectClient",password:"Uuxwp7Mcxo7Khy",server:"10.18.10.3\\MSSQLSERVER",database:"DONNEES",options:{encrypt:!0}};http.listen(3e3,function(){console.log("listening on *:3000")}),process.on("uncaughtException",function(e){"EADDRINUSE"===e.errno&&"3000"===e.port&&console.log("Port 3000 already in use. Using Port 4000"),http.close(),http.listen(4e3,function(){console.log("listening on *:4000")})}),io.on("connect",function(e,o){e.on("OPC_Socket_Connected",function(){console.log("OPC_Socket_Connected : "+e.id),OPC_Socket_ID=e.id,e.to("Clients_Room").emit("Notif",{Msg:"OPC Connecté"})}),e.on("Client_Connected",function(){console.log("Client_Connected : "+e.id),e.join("Clients_Room")}),e.on("ListeCT",function(o){console.log("Demande CT de "+e.id),e.emit("ListeCT_rep",list_CT)}),e.on("ListeAL",function(o){console.log("Demande AL de "+e.id),e.emit("ListeAL_rep",list_AL)}),e.on("OPC_Update",function(e){console.log(e)}),e.on("AL_CT_Query",function(o){console.log(o);var t="Select * from dbo.SUPERVISION Where localisation = '"+o.CT+"' and Type= 'TA'";sql.connect(config).then(function(){(new sql.Request).query(t).then(function(t){new Promise(function(n,c){e.emit("OPC_Read_Query",{Socket_id:o.Socket_id,var:{id:t,value:"null"}}),e.emit("AL_CT_Query",o)}).catch(function(t){o.Error=t,e.emit("AL_CT_Answer",o)})})})}),e.on("CT_Query",function(){e.to(OPC_Socket_ID).emit("CT_Query",{Socket_ID:e.id,OPC_Socket_ID:OPC_Socket_ID}),console.log("CT_Query redirected from : "+e.id+" to "+OPC_Socket_ID)}),e.on("CT_Answer",function(o){e.to(o.Socket_ID).emit("CT_Answer",o)}),e.on("AL_Query",function(o){var t=Object.assign({OPC_Socket_ID:OPC_Socket_ID,Socket_ID:e.id},o);e.to(OPC_Socket_ID).emit("AL_Query",t),console.log("Al_query redirected from : "+e.id+" to "+OPC_Socket_ID+" - Mode : "+o.Mode)}),e.on("AL_Answer",function(o){console.log(o),e.to(o.Socket_ID).emit("AL_Answer",o)}),e.on("Login_Query",function(o){console.log(o);var t=crypto.createHash("md5").update(o.password).digest("hex");console.log(t);var n="Select * from dbo.USERS Where UserName = '"+o.username+"'";sql.connect(config).then(function(){(new sql.Request).query(n).then(function(n){n&&(rec=JSON.parse(JSON.stringify(n).replace(/"\s+|\s+"/g,'"')),rec[0]?(console.log(rec[0]),rec[0].PassWord==t?e.emit("Login_Answer",{id:e.id,user:{id:rec[0].ID,role:rec[0].Role,name:o.username,pass:t}}):(console.log("Wrong User or Password"),e.emit("Notif",{Msg:"Nom d'utilisateur ou Mot de passe Incorrect"}))):(console.log("No User With theses credentials"),e.emit("Notif",{Msg:"Nom d'utilisateur ou Mot de passe Incorrect"})))}).catch(function(e){})})}),e.on("OPC_General_Update",function(o){console.log(o),e.to("Clients_Room").emit("OPC_General_Update",o)}),e.on("CTA_Query",function(o){e.to(OPC_Socket_ID).emit("CTA_Query",{Socket_ID:e.id,OPC_Socket_ID:OPC_Socket_ID,Selected_CT:o.Selected_CT}),console.log("CTA_Query redirected from : "+e.id+" to "+OPC_Socket_ID)}),e.on("CTA_Answer",function(o){e.to(o.Socket_ID).emit("CTA_Answer",o),console.log("CTA_Answer redirected from : "+o.OPC_Socket_ID+" to "+o.Socket_ID)}),e.on("CTA_Answer_Update",function(o){e.to(o.Socket_ID).emit("CTA_Answer_Update",o),console.log("CTA_Answer_Update redirected from : "+o.OPC_Socket_ID+" to "+o.Socket_ID)}),e.on("Sta_Query",function(o){e.to(OPC_Socket_ID).emit("Sta_Query",{Socket_ID:e.id,OPC_Socket_ID:OPC_Socket_ID,Selected_CT:o.Selected_CT}),console.log("Sta_Query redirected from : "+e.id+" to "+OPC_Socket_ID)}),e.on("Sta_Answer",function(o){e.to(o.Socket_ID).emit("Sta_Answer",o),console.log("Sta_Answer redirected from : "+o.OPC_Socket_ID+" to "+o.Socket_ID)}),e.on("Cons_Query",function(o){o.Socket_ID=e.id,o.OPC_Socket_ID=OPC_Socket_ID,e.to(OPC_Socket_ID).emit("Cons_Query",o),console.log("Consigne Query redirected from : "+e.id+" to "+OPC_Socket_ID)}),e.on("Cons_Answer",function(o){"TC"==o.Type&&(o.Value?o.Etat=o.TOR_CodeEtat1:o.Etat=o.TOR_CodeEtat0),console.log(o),e.to(o.Socket_ID).emit("Cons_Answer",o),console.log("CTA_Answer redirected from : "+o.OPC_Socket_ID+" to "+o.Socket_ID)}),e.on("Cons_Answer_Update",function(o){"TC"==o.Type&&(o.Value?o.Etat=o.TOR_CodeEtat1:o.Etat=o.TOR_CodeEtat0),console.log(o),e.to("Clients_Room").emit("Cons_Answer",o),console.log("CTA_Cons Update for all ")}),e.on("Notif_All",function(o){e.to("Clients_Room").emit("Notif",o)}),e.on("Notif_Client",function(o){console.log("Notif_Client "+o.Socket_ID),e.to(o.Socket_ID).emit("Notif",o)}),e.on("disconnect",function(){e.id==OPC_Socket_ID&&e.to("Clients_Room").emit("Notif",{Msg:"OPC Déconnecté"})})});