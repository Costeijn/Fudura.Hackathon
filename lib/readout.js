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
        console.log('System verification returns', system.verify() ? 'OK' : 'FAIL');
        var accountedPower = system.accountPower();
        console.log('Power entering the system:');
        console.log('- Accounted for', accountedPower[0].toString(), 'kWh');
        console.log('- Unaccounted for', accountedPower[2].toString(), 'kWh');
        console.log('Power leaving the system:');
        console.log('- Accounted for', accountedPower[1].toString(), 'kWh');
        console.log('- Unaccounted for', accountedPower[3].toString(), 'kWh');

        var segments = parseInt(system.segmentCount().toString());
        console.log('');
        console.log('The system has', segments, 'segment(s):');
        for (var i = 0; i < segments; i++) {
            var segment = contracts.Segment.contract.at(system.segment(i));
            var name = tools.bytes32ToString(segment.name());
            var closed = segment.closed();
            var valueSum = parseInt(segment.valueSum().toString());
            var verify = segment.verify();
            console.log('-', closed ? 'Closed' : 'Open', 'segment', name, 'status', verify ? 'OK' : 'FAIL', 'with sum', valueSum);
        }
    })
    .catch(function (err) {
        console.error(err);
        process.exit(1);
    });
