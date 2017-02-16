/*global require,setInterval,console */
var opcua = require("node-opcua");

// Let's create an instance of OPCUAServer
var server = new opcua.OPCUAServer({
    port: 4334, // the port of the listening socket of the server
    resourcePath: "UA/Server", // this path will be added to the endpoint resource name


	 buildInfo : {
    productName: "MySampleServer1",
    buildNumber: "7658",
    buildDate: new Date(2014,5,2)
}
});

function post_initialize() {
    console.log("initialized");

    function construct_my_address_space(server) {

    var addressSpace = server.engine.addressSpace;

    // declare a new object

  var device = addressSpace.addObject({
    organizedBy: addressSpace.rootFolder.objects,
    browseName: "MyDevice"

});


    // add some variables

	// add a variable named MyVariable1 to the newly created folder "MyDevice"
var variable= [ 0 ,40 ,32 , 5 ,8 , 7 ,6 ,8 , 11 ]
// emulate variable1 changing every 500 ms
setInterval(function(){

  for ( i=1;i<9;i++)
  {
variable[i] += Math.random() * (0.1 - 0.02) + 0.02;

  }


}, 200);

addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP1" ,
    nodeId: "ns=1;s=TMP1" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[1] });
        }
    }
});

addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP2" ,
    nodeId: "ns=1;s=TMP2" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[2] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP3" ,
    nodeId: "ns=1;s=TMP3" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[3] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP4" ,
    nodeId: "ns=1;s=TMP4" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[4] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP5" ,
    nodeId: "ns=1;s=TMP5" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[5] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP6" ,
    nodeId: "ns=1;s=TMP6" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[6] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP7" ,
    nodeId: "ns=1;s=TMP7" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[7] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP8" ,
    nodeId: "ns=1;s=TMP8" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[8] });
        }
    }
});


// add a variable named MyVariable2 to the newly created folder "MyDevice"
var variable8 = 10.0;

server.engine.addressSpace.addVariable({

    componentOf: device,

    nodeId: "ns=1;b=1020FFAA", // some opaque NodeId in namespace 4

    browseName: "MyVariable2",

    dataType: "Double",

    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable8 });
        },
        set: function (variant) {
            variable2 = parseFloat(variant.value);
            return opcua.StatusCodes.Good;
        }
    }
});

var os = require("os");
/**
 * returns the percentage of free memory on the running machine
 * @return {double}
 */
function available_memory() {
    // var value = process.memoryUsage().heapUsed / 1000000;
    var percentageMemUsed = os.freemem() / os.totalmem() * 100.0;
    return percentageMemUsed;
}
var os = require("os");
/**
 * returns the percentage of free memory on the running machine
 * @return {double}
 */
function available_memory() {
    // var value = process.memoryUsage().heapUsed / 1000000;
    var percentageMemUsed = os.freemem() / os.totalmem() * 100.0;
    return percentageMemUsed;
}

server.engine.addressSpace.addVariable({

    componentOf: device,

    nodeId: "ns=1;s=free_memory", // a string nodeID
    browseName: "FreeMemory",
    dataType: "Double",
    value: {
        get: function () {return new opcua.Variant({dataType: opcua.DataType.Double, value: available_memory() });}
    }
});

}
construct_my_address_space(server);

server.start(function() {
    console.log("Server is now listening ... ( press CTRL+C to stop)");
    console.log("port ", server.endpoints[0].port);
    var endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
console.log(" the primary server endpoint url is ", endpointUrl );
});

}
server.initialize(post_initialize);
