module.exports = {
   PrgHoraires : 'http://localhost:5000',

   SQL : {
           user: 'sa',
           password: 'VdP2016!',
           server: "10.18.10.3\\SQL2014",
          // user: 'dbConnect',
          // password: 'dbConnect',
          // server: "10.224.1.6",
          // port : '49421',
          database: 'BDD_DONNEES',
          connectionTimeout: 20000,
          requestTimeout: 15000,
          pool: {
               max: 100,
               min: 10,
               idleTimeoutMillis: 300000,
               log:true
               }
       },

   SRV_MOBILITE :  {
         PORT : 443 ,
         PROD : 0
       },

   LDAP:  {
         url: "ldap://10.18.10.7",
         baseDN: 'dc=CTPARIS,dc=LOC',
         user: "ejacob@CTPARIS.LOC",
         pass: "P@ssw0rd",
         domaine : "CTPARIS.loc" //ldap Domaine if exists
   },

   TLS: {
         key : '/files/device.key',
         cert: '/files/device.crt',
         passphrase: ''
   }

}
