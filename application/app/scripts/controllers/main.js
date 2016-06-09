'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the appApp
 */
app
  .controller('MainCtrl', function (discoveryService) {

    discoveryService.discovery(function(netwerkData) {

      netwerkData = netwerkData.data;

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
          segments: {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf015',
              size: 50,
              color: '#DC73FF'
            }
          },
          closedsegments: {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf1b2',
              size: 50,
              color: '#FF9673'
            },
          },
          meters: {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf0e4',
              size: 50,
              color: '#73DCFF'

            }
          }
        }
      };

      var segments = netwerkData.segments;

      var meters = netwerkData.meters;


      for (var i = 0; i < segments.length; i++) {
        if (segments[i].closed) {
          nodes.push({id: segments[i].address, label: segments[i].name, group: 'closedsegments'})
        }
        else {
          nodes.push({id: segments[i].address, label: segments[i].name, group: 'segments'})
        }
      }

      for (var i = 0; i < meters.length; i++) {
        nodes.push({id: meters[i].address, label: meters[i].name, group: 'meters'});
        edges.push({from: meters[i].address, to: meters[i].outSegment, length: EDGE_LENGTH_MAIN});
        edges.push({from: meters[i].inSegment, to: meters[i].address, length: EDGE_LENGTH_MAIN});
      }

      // create a network
      var container = document.getElementById('mynetwork');
      var data = {
        nodes: nodes,
        edges: edges
      };
      var options = {}

      network = new vis.Network(container, data, optionsFA);
    });

  });
