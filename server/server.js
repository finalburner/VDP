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
var variable= [];
for ( i=1;i<41;i++)
{
variable[i] = Math.random() * (60 - 10) + 10;

}
// emulate variable1 changing every 500 ms
setInterval(function(){

  for ( i=1;i<41;i++)
  {
variable[i] += Math.random() * (0.1 - 0.002) + 0.002;

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
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP9" ,
    nodeId: "ns=1;s=TMP9" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[9] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP10" ,
    nodeId: "ns=1;s=TMP10" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[10] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP11" ,
    nodeId: "ns=1;s=TMP11" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[11] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP12" ,
    nodeId: "ns=1;s=TMP12" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[12] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP13" ,
    nodeId: "ns=1;s=TMP13" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[13] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP14" ,
    nodeId: "ns=1;s=TMP14" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[14] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP15" ,
    nodeId: "ns=1;s=TMP15" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[15] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP16" ,
    nodeId: "ns=1;s=TMP16" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[16] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP17" ,
    nodeId: "ns=1;s=TMP17" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[18] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP19" ,
    nodeId: "ns=1;s=TMP19" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[19] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP20" ,
    nodeId: "ns=1;s=TMP20" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[20] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP21" ,
    nodeId: "ns=1;s=TMP21" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[21] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP22" ,
    nodeId: "ns=1;s=TMP22" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[22] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP23" ,
    nodeId: "ns=1;s=TMP23" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[23] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP24" ,
    nodeId: "ns=1;s=TMP24" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[24] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP25" ,
    nodeId: "ns=1;s=TMP25" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[25] });
        }
    }
});
addressSpace.addVariable({
    componentOf: device,
    browseName: "TMP26" ,
    nodeId: "ns=1;s=TMP26" ,
    dataType: "Int16",
    value: {
        get: function () {
            return new opcua.Variant({dataType: opcua.DataType.Double, value: variable[26] });
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
