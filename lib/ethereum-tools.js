var fs = require('fs');

var solc = require('solc');
var Q = require('q');

var readDir = Q.denodeify(fs.readdir);
var readFile = Q.denodeify(fs.readFile);
var stat = Q.denodeify(fs.stat);

function callbackForDefer(defer) {
    return function (error, result) {
        if (error) {
            defer.reject(error);
        } else {
            defer.resolve(result);
        }
    };
}

function readPath(basePath, path) {
    var fullPath = basePath + (path ? '/' + path : '');
    return stat(fullPath).then(function (stats) {
        if (stats.isFile()) {
            return readFile(fullPath, 'utf-8').then(function (contents) {
                return [{
                    key: path ? path : '',
                    value: contents
                }];
            });
        } else if (stats.isDirectory()) {
            return readDir(fullPath).then(function (files) {
                var promises = files.filter(function (file) {
                    return !file.startsWith('.');
                }).map(function (file) {
                    return readPath(basePath, path ? path + '/' + file : file);
                });
                return Q.all(promises).then(function (results) {
                    return [].concat.apply([], results);
                });
            });
        }
    });
}

function kv2object(kv) {
    var obj = {};
    kv.forEach(function (item) {
        obj[item.key] = item.value;
    });
    return obj;
}

function solcCompile(sources) {
    return solc.compile({ sources: sources }, 1).contracts;
}

function compileContracts(path) {
    return readPath(path).then(kv2object).then(solcCompile);
}

function extendWeb3(web3) {
    function addContractObjects(contracts) {
        Object.keys(contracts).forEach(function (name) {
            var contract = contracts[name];
            contract.contract = web3.eth.contract(JSON.parse(contract.interface || contract.info.abiDefinition));
        });
        return contracts;
    }

    function getTransaction(txid) {
        var defer = Q.defer();
        web3.eth.getTransaction(txid, callbackForDefer(defer));
        return defer.promise;
    }   
    
    function getMinedTransaction(txid) {
        return getTransaction(txid).then(function (tx) {
            if (tx.blockNumber) {
                return tx;
            } else {
                return Q.delay(1000).then(function () {
                    return getMinedTransaction(txid);
                });
            }
        }); 
    }      

    function deployer(from) {
        return function deploy(compiledContract, gas) {
            var contract = web3.eth.contract(JSON.parse(compiledContract.interface || compiledContract.info.abiDefinition));
            var deferred = Q.defer();

            var args = [].slice.call(arguments);
            args.splice(0, 2);
            args.push({ from: from, gas: gas, data: compiledContract.bytecode || compiledContract.code });
            args.push(function (error, deployedContract) {
                if (error) {
                    deferred.reject(error);
                } else if (deployedContract.address) {
                    deferred.resolve(deployedContract);
                } else {
                    deferred.notify({ submitted: true, contract: deployedContract });
                }
            });

            Q.all(args.map(Q.when)).then(function (args) {
                deferred.notify({ submitted: false });
                contract.new.apply(contract, args.map(function (arg) {
                    return (arg && arg.address) ? arg.address : arg;
                }));
            }).catch(function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        }
    }

    web3.ext = {
        addContractObjects: addContractObjects,
        getTransaction: getTransaction,
        getMinedTransaction: getMinedTransaction,
        deployer: deployer
    };
}

function bytes32ToString(bytes32) {
    if (bytes32.substring(0, 2) != '0x') {
        throw 'input is not bytes32';
    } else if (bytes32.length % 2 != 0) {
        throw 'input is not bytes32';
    } else {
        return bytes32.match(/.{2}/g).filter(function (hex) {
            return hex != '0x' && hex != '00';
        }).map(function (hex) {
            return String.fromCharCode(parseInt(hex, 16));
        }).join('');
    }
}

module.exports = {
    extendWeb3: extendWeb3,
    bytes32ToString: bytes32ToString,
    compileContracts: compileContracts,
};

