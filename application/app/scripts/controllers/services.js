app.service('addressBookService', function () {
  this.addresses = function () {
    return [
      {
        name: 'Mark van Cuijk',
        address: '0x3ce519f0018cdfb65161de13600185e126ee49b3'
      },
      {
        name: 'Other network',
        address: 'grmbl'
      }
    ];
  }
});

app.service('discoveryService', function ($http, $q) {

  this.discovery = function (system, callback) {
    $q.all([
      $http.get('http://localhost:8081/discovery/' + encodeURIComponent(system)),
      $http.get('http://localhost:8081/errors/' + encodeURIComponent(system))
    ]).then(function (results) {
      callback(results);
    });
  }
});
