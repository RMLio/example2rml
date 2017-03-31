/**
 * Created by pheyvaer on 31.03.17.
 */

let assert = require('chai').assert;
let SemanticModelGenerator = require('../lib/semanticmodelgenerator.js');
let Aligner = require('../lib/aligner.js');
let type = require('semanticmodel').nodeType.types;

describe('Aligner:', function () {
  it('single entity with attributes', function (done) {
    this.timeout(10000);
    let triples = [
      {
        subject: 'http://www.example.com/pieter',
        predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        object: 'http://www.example.com#Person'
      },
      {
        subject: 'http://www.example.com/pieter',
        predicate: 'http://www.example.com#firstName',
        object: '"Pieter"'
      },
      {
        subject: 'http://www.example.com/pieter',
        predicate: 'http://www.example.com#lastName',
        object: '"Heyvaert"'
      },
      {
        subject: 'http://www.example.com/pieter',
        predicate: 'http://www.example.com#age',
        object: '"26"'
      }
    ];

    let dataSources = [{
      type: 'csv',
      row: [{
        column: 'firstname',
        value: 'Pieter'
      },{
        column: 'lastname',
        value: 'Heyvaert'
      },{
        column: 'age',
        value: '26'
      }
      ]
    }];

    let smg = new SemanticModelGenerator(triples);
    smg.getModel().then(function(sm){
      try {
        let aligner = new Aligner(dataSources);
        aligner.align(sm);
        //console.log(sm);
        assert.equal(sm.get(1).label, 'firstname', 'Correct label is not found.');
        assert.equal(sm.get(3).label, 'lastname', 'Correct label is not found.');
        assert.equal(sm.get(5).label, 'age', 'Correct label is not found.');
      } catch (e) {
        console.log(e);
      }

      done();
    });
  });

  it('2 entities', function (done) {
    let triples = [
      {
        subject: 'http://www.example.com/pieter',
        predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        object: 'http://www.example.com#Person'
      },
      {
        subject: 'http://www.example.com/pieter',
        predicate: 'http://www.example.com#firstName',
        object: '"Pieter"'
      },
      {
        subject: 'http://www.example.com/car001',
        predicate: 'http://www.example.com#brand',
        object: '"Peugeot"'
      },
      {
        subject: 'http://www.example.com/car001',
        predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        object: 'http://www.example.com#Car'
      },
      {
        subject: 'http://www.example.com/car001',
        predicate: 'http://www.example.com#owner',
        object: 'http://www.example.com/pieter'
      }
    ];

    let dataSources = [{
      type: 'csv',
      id: 'person-data',
      row: [{
        column: 'id',
        value: '0'
      },{
        column: 'firstname',
        value: 'Pieter'
      },{
        column: 'lastname',
        value: 'Heyvaert'
      },{
        column: 'age',
        value: '26'
      }
      ]
    }, {
      type: 'csv',
      id: 'car-data',
      row: [{
        column: 'id',
        value: '2'
      },{
        column: 'brand',
        value: 'Peugeot'
      },{
        column: 'owner',
        value: '0'
      },{
        column: 'age',
        value: '26'
      }
      ]
    }];

    let smg = new SemanticModelGenerator(triples);
    smg.getModel().then(function(sm){
      try {
        let aligner = new Aligner(dataSources);
        aligner.align(sm);
        console.log(sm);
        // assert.equal(sm.getAllNodes(type.CLASS).length, 2, 'Number of class nodes is not correct.');
        // assert.equal(sm.getAllNodes(type.DATAREFERENCE).length, 2, 'Number of data nodes is not correct.');
        // assert.equal(sm.getAllEdges().length, 3, 'Number of edges is not correct.');
        // assert.equal(sm.getEdges('http://www.example.com#firstName').length, 1, 'Firstname label not correct.');
        // assert.equal(sm.getEdges('http://www.example.com#brand').length, 1, 'Brand label not correct.');
        // assert.equal(sm.getEdges('http://www.example.com#owner').length, 1, 'Owner label not correct.');
        // assert.equal(sm.getEdges('http://www.example.com#owner')[0].source, 1, 'Owner edge is not correct.');
        // assert.equal(sm.getEdges('http://www.example.com#owner')[0].target, 0, 'Owner edge is not correct.');
      } catch (e) {
        console.log(e);
      }

      done();
    });
  });
});
