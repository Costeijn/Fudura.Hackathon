var http = require("http");
var Q = require('q');
var Web3 = require('web3');
var tools = require('./ethereum-tools');

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8080'));
tools.extendWeb3(web3);

var systemAddress;
if (process.argv.length == 2) {
    systemAddress = process.env['POWER_SYSTEM'];
} else {
    systemAddress = process.argv[2];
}

if (!systemAddress) {
    console.error('Specify system address as cli argument or POWER_SYSTEM var');
    process.exit(1);
}

http.createServer(function (request, response) {

    if(request.url.indexOf('/discovery') > -1) {

        Q.when(require('./contracts'))
            .then(web3.ext.addContractObjects)
            .then(function (contracts) {
                var system = contracts.PowerCountingSystem.contract.at(systemAddress);

                var segments = {};
                var responseObjects = [];
                var segmentCount = parseInt(system.segmentCount().toString());
                console.log('The system has', segmentCount, 'segment(s):');

                var responseObject =
                {
                    segments: [],
                    meters: []
                };

                for (var i = 0; i < segmentCount; i++) {
                    var segment = contracts.Segment.contract.at(system.segment(i));
                    var address = segment.address;
                    var name = tools.bytes32ToString(segment.name());
                    var closed = segment.closed();
                    segments[address] = name;
                    console.log('-', address, 'is', name, (closed ? '(closed)' : '(open)'));

                    responseObject.segments.push({
                        name: name,
                        address: address,
                        closed: closed,
                        value: tools.bytes32ToString(segment.name()),
                    });
                }

                var meterCount = parseInt(system.meterCount().toString());
                console.log('The system has', meterCount, 'meter(s):');

                for (var i = 0; i < meterCount; i++) {
                    var meter = contracts.Meter.contract.at(system.meter(i));
                    var address = meter.address;
                    var inSegment = meter.inSegment();
                    var outSegment = meter.outSegment();

                    console.log('-', address, 'is', inSegment, '->', outSegment);

                    responseObject.meters.push({
                        address: address,
                        inSegment: inSegment,
                        outSegment: outSegment
                    });
                }

                response.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                response.end(JSON.stringify(responseObject));

            })
            .catch(function (err) {
                console.error(err);
                process.exit(1);
            });

    }

    else
    {
        response.writeHead(404, {'Content-Type': 'application/json'});
        response.end();
    }


}).listen(8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');