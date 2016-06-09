var Q = require('q');
var Web3 = require('web3');
var tools = require('./ethereum-tools');

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8080'));
tools.extendWeb3(web3);

var deploy = web3.ext.deployer(web3.eth.accounts[0]);
var txOptions = { from: web3.eth.accounts[0], gas: 2000000 };
var system;

function callbackForDefer(defer) {
    return function (error, result) {
        if (error) {
            defer.reject(error);
        } else {
            defer.resolve(result);
        }
    };
}

Q.when(require('./contracts'))
    .then(function (contracts) {
        console.log('Deploying...');
        var system = deploy(contracts.PowerCountingSystem, 2000000);
        var opwek1 = deploy(contracts.Segment, 2000000, system, "opwek1", false);
        var opwek2 = deploy(contracts.Segment, 2000000, system, "opwek2", false);
        var opwekSamen = deploy(contracts.Segment, 2000000, system, "opwekSamen", true);
        var verbruik1 = deploy(contracts.Segment, 2000000, system, "verbruik1", false);
        var verbruik2 = deploy(contracts.Segment, 2000000, system, "verbruik2", false);
        var verbruikSamen = deploy(contracts.Segment, 2000000, system, "verbruikSamen", true);
        return Q.all([system, opwek1, opwek2, opwekSamen, verbruik1, verbruik2, verbruikSamen]);
    })
    .then(function (contracts) {
        system = contracts.shift();
        console.log('System at', system.address);
    
        console.log('Adding segments to the system...');
        return Q.all(contracts.map(function(contract) {
            var deferred = Q.defer();
            system.addSegment(contract.address, txOptions, callbackForDefer(deferred));
            return deferred.promise.then(web3.ext.getMinedTransaction).then(function (tx) {
                tx.contract = contract;
                return tx;
            });
        }));
    })
    .spread(function (opwek1, opwek2, opwekSamen, verbruik1, verbruik2, verbruikSamen) {
        console.log('Connecting segments...');
        var connections = [
            [opwek1, opwekSamen],
            [opwek2, opwekSamen],
            [opwekSamen, verbruikSamen],
            [verbruikSamen, verbruik1],
            [verbruikSamen, verbruik2]
        ];
    
        return Q.all(connections.map(function (pair) {
            var deferred = Q.defer();
            system.connectSegments(pair[0].contract.address, pair[1].contract.address, txOptions, callbackForDefer(deferred));
            return deferred.promise.then(web3.ext.getMinedTransaction);
        }));
    })
    .then(function (txs) {
        console.log('System is set up!');
    })
    .catch(function (err) {
        console.error(err);
        process.exit(1);
    });
