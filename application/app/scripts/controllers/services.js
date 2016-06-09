

app.service('discoveryService', function ($http) {

  this.discovery = function () {
    $http.get('http://localhost:8081/discovery').then(function(data) {
      console.log(data);
    });
  }



  });
