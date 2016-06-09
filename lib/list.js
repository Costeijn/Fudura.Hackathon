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

Q.when(require('./contracts'))
    .then(web3.ext.addContractObjects)
    .then(function (contracts) {
        var system = contracts.PowerCountingSystem.contract.at(systemAddress);
    
        var segments = {};
        var segmentCount = parseInt(system.segmentCount().toString());
        console.log('The system has', segmentCount, 'segment(s):');
        for (var i = 0; i < segmentCount; i++) {
            var segment = contracts.Segment.contract.at(system.segment(i));
            var address = segment.address;
            var name = tools.bytes32ToString(segment.name());
            var closed = segment.closed();
            segments[address] = name;
            console.log('-', address, 'is', name, (closed ? '(closed)' : '(open)'));
        }
        console.log('');
    
        var meterCount = parseInt(system.meterCount().toString());
        console.log('The system has', meterCount, 'meter(s):');
        for (var i = 0; i < meterCount; i++) {
            var meter = contracts.Meter.contract.at(system.meter(i));
            var address = meter.address;
            var inSegment = segments[meter.inSegment()];
            var outSegment = segments[meter.outSegment()];
            console.log('-', address, 'is', inSegment, '->', outSegment);
        }
        console.log('');
    })
    .catch(function (err) {
        console.error(err);
        process.exit(1);
    });
