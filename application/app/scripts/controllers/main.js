'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the appApp
 */
app
  .controller('MainCtrl', function ($scope, $interval, addressBookService, discoveryService) {

    var redrawInterval;

    var flashOn = false;
    $interval(function () {
      flashOn = !flashOn;

      var newGroup = flashOn ? 'error' : 'closedsegment';
      if ($scope.NetwerkData && $scope.NetwerkData.errors) {
        var errors = $scope.NetwerkData.errors.map(function (error) {
          return error.relatedSegment;
        });
        $scope.NetwerkData.segments.forEach(function (segment) {
          if (errors.indexOf(segment.address) > -1) {
            $scope.VisData.nodes.update({ id: segment.address, group: newGroup });
          } else {
            $scope.VisData.nodes.update({ id: segment.address, group: 'closedsegment' });
          }
        });
      }
    }, 1000);

    function retrieve(system) {
      if (redrawInterval) {
        $interval.cancel(redrawInterval);
        redrawInterval = null;
      }

      discoveryService.discovery(system.address, function(netwerkData) {
        $scope.NetwerkData = netwerkData[0].data;
        $scope.NetwerkData.errors = netwerkData[1].data;



        var nodes = null;
        var edges = null;
        var network = null;

        var DIR = '../images/';
        var EDGE_LENGTH_MAIN = 150;
        var EDGE_LENGTH_SUB = 50;

        // Create a data table with nodes.
        nodes = [];

        // Create a data table with links.
        edges = [];


        var optionsFA = {
          groups: {
            house: {
              shape: 'icon',
              icon: {
                face: 'FontAwesome',
                code: '\uf015',
                size: 50,
                color: '#DC73FF'
              }
            },
            closedsegment: {
              shape: 'icon',
              icon: {
                face: 'FontAwesome',
                code: '\uf1b2',
                size: 50,
                color: '#FF9673'
              }
            },
            meter: {
              shape: 'icon',
              icon: {
                face: 'FontAwesome',
                code: '\uf0e4',
                size: 50,
                color: '#73DCFF'

              }
            },
            error: {
              shape: 'icon',
              icon: {
                face: 'FontAwesome',
                code: '\uf071',
                size: 50,
                color: '#FF0D0D'

              }
            },
            opwek: {
              shape: 'icon',
              icon: {
                face: 'FontAwesome',
                code: '\uf0e7',
                size: 50,
                color: '#F7FF57'

              }
            },
            opslag: {
              shape: 'icon',
              icon: {
                face: 'FontAwesome',
                code: '\uf241',
                size: 40,
                color: '#393BA3'

              }
            }
          }
        };

        var segments = $scope.NetwerkData.segments;

        var meters = $scope.NetwerkData.meters;

        var errors = $scope.NetwerkData.errors;

        for (var i = 0; i < segments.length; i++) {
          if (segments[i].closed) {
            nodes.push({id: segments[i].address, label: segments[i].name, group: 'closedsegment'})
          }
          else {
            if(segments[i].name.contains('opwek')){
              nodes.push({id: segments[i].address, label: segments[i].name, group: 'opwek'})
            }
            else if(segments[i].name.contains('opslag')){
              nodes.push({id: segments[i].address, label: segments[i].name, group: 'opslag'})
            }
            else{
              nodes.push({id: segments[i].address, label: segments[i].name, group: 'house'})
            }
          }
        }

        for (var i = 0; i < meters.length; i++) {
          nodes.push({id: meters[i].address, label: meters[i].name, group: 'meter'});
          edges.push({from: meters[i].address, to: meters[i].outSegment, length: EDGE_LENGTH_MAIN});
          edges.push({from: meters[i].inSegment, to: meters[i].address, length: EDGE_LENGTH_MAIN});
        }

        // create a network
        var container = document.getElementById('mynetwork');
        var data = {
          nodes: new vis.DataSet(nodes),
          edges: new vis.DataSet(edges)
        };
        var options = {}
        network = new vis.Network(container, data, optionsFA);

        $scope.VisData = data;
        $scope.Network = network;

        redrawInterval = $interval(redraw, 5000);

      });
    }

    $scope.addresses = addressBookService.addresses();
    $scope.system = $scope.addresses[0];
    $scope.$watch('system', retrieve);

    $scope.NetwerkData;
    $scope.Network
    var redraw = function (){
      if($scope.Network != null){
        discoveryService.discovery($scope.system.address, function(netwerkData) {
          $scope.NetwerkData = netwerkData[0].data;
          $scope.NetwerkData.errors = netwerkData[1].data;
        });
        $scope.Network.redraw();
      }
    }

  });


