app.service('addressBookService', function () {
  this.addresses = function () {
    return [
      {
        name: 'Stroomnetwerk #1',
        address: '0x3ce519f0018cdfb65161de13600185e126ee49b3'
      },
      {
        name: 'Stroomnetwerk #2',
        address: '0x2cfa7845a9e6d7b7e93f0e36fb47430f032653ef'
      }
    ];
  }
});

app.service('discoveryService', function ($http, $q) {

  this.discovery = function (system, callback) {
    $http.get('http://localhost:8081/discovery/' + encodeURIComponent(system)).then(callback);
  }
});
