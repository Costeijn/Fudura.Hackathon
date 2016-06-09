var fs = require('fs');
var tools = require('./ethereum-tools');

console.log('Compiling...');
tools.compileContracts('contracts')
    .then(function (contracts) {
        console.log('Writing contract.js...');
        fs.writeFileSync('contracts.js', 'module.exports = ' + JSON.stringify(contracts) + ';');
        console.log('Done');
    })
    .catch(function (err) {
        console.error(err);
        process.exit(1);
    });

