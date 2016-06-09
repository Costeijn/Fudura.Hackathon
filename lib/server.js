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
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify({a: "yolo"}));

        Q.when(require('./contracts'))
            .then(web3.ext.addContractObjects)
            .then(function (contracts) {
                var system = contracts.PowerCountingSystem.contract.at(systemAddress);

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