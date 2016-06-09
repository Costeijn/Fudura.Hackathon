/**
 * Created by mark on 6/9/16.
 */
var nodes = null;
var edges = null;
var network = null;

var DIR = '../images/';
var EDGE_LENGTH_MAIN = 150;
var EDGE_LENGTH_SUB = 50;

// Called when the Visualization API is loaded.
function draw() {
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

  var segments = [
    {
      name:"House1",
      address: 1,
      closed: false

    },
    {
      name: "House2",
      address: 2,
      closed: true
    },
    {
      name: "House3",
      address: 3,
      closed: false
    }
  ];

  var meters = [
    {
    address:6,
    outsegment:1,
    insegment:2
    }];


  for (i = 0; i < segments.length; i++) {
    if (segments[i].closed) {
      nodes.push({id: segments[i].address, label: segments[i].name, group: 'closedsegments'})
    }
    else {
      nodes.push({id: segments[i].address, label: segments[i].name, group: 'segments'})
    }
  }

  for (i = 0; i < meters.length; i++){
    nodes.push({id:meters[i].address, label: meters[i].name, group:'meters'});
    edges.push({from: meters[i].address, to: meters[i].outsegment, length: EDGE_LENGTH_MAIN});
    edges.push({from: meters[i].insegment, to: meters[i].address, length: EDGE_LENGTH_MAIN});
  }

  // create a network
  var container = document.getElementById('mynetwork');
  var data = {
    nodes: nodes,
    edges: edges
  };
  var options = {  }

  network = new vis.Network(container, data, optionsFA);
}
