app.service('addressBookService', function () {
  this.addresses = function () {
    return [
      {
        name: 'Mark van Cuijk',
        address: '0x3ce519f0018cdfb65161de13600185e126ee49b3'
      },
      {
        name: 'Costeijn Kuhlmann zonder errors',
        address: '0x170632d8b17a76e187bd19f0a46b77c8157f4b52'
      },
      {
        name: 'Costeijn Kuhlmann met errors',
        address: '0xbb0e8c8bf5c54335a9c38240dff8135231015463'
      },
      {
        name: 'Tims Network',
        address: '0x17a47ce516b0eb8fc0bf463d63b5e1778fbbffc2'
      }
    ];
  }
});

app.service('discoveryService', function ($http, $q) {

  this.discovery = function (system, callback) {
    $http.get('http://localhost:8081/discovery/' + encodeURIComponent(system)).then(callback);
  }
});
