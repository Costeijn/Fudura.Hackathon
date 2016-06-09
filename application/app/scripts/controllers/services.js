

app.service('discoveryService', function ($http) {

  this.discovery = function (callback) {
    $http.get('http://localhost:8081/discovery').then(function(data) {
      callback(data);
    });
  }



  });
