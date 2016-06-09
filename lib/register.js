var Q = require('q');
var Web3 = require('web3');
var tools = require('./ethereum-tools');

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8080'));
tools.extendWeb3(web3);

var txOptions = { from: web3.eth.accounts[0], gas: 2000000 };

function callbackForDefer(defer) {
    return function (error, result) {
        if (error) {
            defer.reject(error);
        } else {
            defer.resolve(result);
        }
    };
}

var registrations = [];
for (var i = 2; i < process.argv.length; i++) {
    var registration = process.argv[i].split(':');
    if (registration.length != 2) {
        console.error('Invalid registration');
        process.exit(1);
    }
    registrations.push({
        meter: registration[0],
        value: parseInt(registration[1])
    });
}

Q.when(require('./contracts'))
    .then(web3.ext.addContractObjects)
    .then(function (contracts) {
        console.log('Registering', registrations.length, 'new values...');
        return Q.all(registrations.map(function (reg) {
            var meter = contracts.Meter.contract.at(reg.meter);
            var deferred = Q.defer();
            meter.registerValue(reg.value, txOptions, callbackForDefer(deferred));
            return deferred.promise.then(web3.ext.getMinedTransaction);
        }));
    })
    .then(function (txs) {
        console.log('Done');
    })
    .catch(function (err) {
        console.error(err);
        process.exit(1);
    });
