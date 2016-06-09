var http = require("http");
var Q = require('q');
var Web3 = require('web3');
var tools = require('./ethereum-tools');

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8080'));
tools.extendWeb3(web3);
var contracts = web3.ext.addContractObjects(require('./contracts'));

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

function callbackForDefer(defer) {
    return function (error, result) {
        if (error) {
            defer.reject(error);
        } else {
            defer.resolve(result);
        }
    };
}

function getSegments(system) {
    var segmentCount = Q.defer();
    system.segmentCount(callbackForDefer(segmentCount));
    return segmentCount.promise.then(function (segmentCount) {
        segmentCount = parseInt(segmentCount.toString());

        var segments = [];
        for (var i = 0; i < segmentCount; i++) {
            var segment = Q.defer();
            system.segment(i, callbackForDefer(segment));
            var segmentPromise = segment.promise.then(function (address) {
                segment = contracts.Segment.contract.at(address);

                var nameDefer = Q.defer();
                segment.name(callbackForDefer(nameDefer));
                var namePromise = nameDefer.promise.then(tools.bytes32ToString);

                var closedDefer = Q.defer();
                segment.closed(callbackForDefer(closedDefer));
                var closedPromise = closedDefer.promise;

                var valueDefer = Q.defer();
                segment.valueSum(callbackForDefer(valueDefer));
                var valuePromise = valueDefer.promise;

                return Q.all([namePromise, closedPromise, valuePromise]).spread(function (name, closed, value) {
                    return {
                        name: name,
                        address: address,
                        closed: closed,
                        value: value,
                    };
                });
            });

            segments.push(segmentPromise);
        }

        return Q.all(segments);
    });
}

function getMeters(system) {
    var meterCount = Q.defer();
    system.meterCount(callbackForDefer(meterCount));
    return meterCount.promise.then(function (meterCount) {
        meterCount = parseInt(meterCount.toString());

        var meters = [];
        for (var i = 0; i < meterCount; i++) {
            var meter = Q.defer();
            system.meter(i, callbackForDefer(meter));
            var meterPromise = meter.promise.then(function (address) {
                meter = contracts.Meter.contract.at(address);

                var inSegmentDefer = Q.defer();
                meter.inSegment(callbackForDefer(inSegmentDefer));
                var inSegmentPromise = inSegmentDefer.promise;

                var outSegmentDefer = Q.defer();
                meter.outSegment(callbackForDefer(outSegmentDefer));
                var outSegmentPromise = outSegmentDefer.promise;

                return Q.all([inSegmentPromise, outSegmentPromise]).spread(function (inSegment, outSegment) {
                    return {
                        address: address,
                        inSegment: inSegment,
                        outSegment: outSegment
                    };
                });
            });

            meters.push(meterPromise);
        }

        return Q.all(meters);
    });
}

http.createServer(function (request, response) {

    if(request.url.indexOf('/discovery') > -1) {

        var system = contracts.PowerCountingSystem.contract.at(systemAddress);

        Q.all([getSegments(system), getMeters(system)]).spread(function (segments, meters) {
            response.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            response.end(JSON.stringify({
                segments: segments,
                meters: meters
            }));
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
