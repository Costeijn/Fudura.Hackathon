

app.service('discoveryService', function ($http, $q) {

  this.discovery = function (callback) {
    console.log("discovery");
    $q.all([
      $http.get('http://localhost:8081/discovery'),
      $http.get('http://localhost:8081/errors')
    ]).then(function (results) {
      console.log("test"+results);
      callback(results);
    });
  }
});
