/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

let assert = require('chai').assert;
let SemanticModelGenerator = require('../lib/semanticmodelgenerator.js');
let type = require('semanticmodel').nodeType.types;

describe('SemanticModelGenerator:', function () {
  it('single entity with attributes', function () {
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

    let smg = new SemanticModelGenerator(triples);
    return smg.getModel().then(function (sm) {
      //console.log(sm);
      assert.equal(sm.getAllNodes(type.CLASS).length, 1, 'Number of class nodes is not correct.');
      assert.equal(sm.getAllNodes(type.DATAREFERENCE).length, 3, 'Number of data nodes is not correct.');
      assert.equal(sm.getAllEdges().length, 3, 'Number of edges is not correct.');
      assert.equal(sm.getEdges('http://www.example.com#firstName').length, 1, 'Firstname label not correct.');
      assert.equal(sm.getEdges('http://www.example.com#lastName').length, 1, 'Lastname label not correct.');
      assert.equal(sm.getEdges('http://www.example.com#age').length, 1, 'Age label not correct.');
    });
  });

  it('2 entities', function () {
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

    let smg = new SemanticModelGenerator(triples);
    return smg.getModel().then(function (sm) {

      assert.equal(sm.getAllNodes(type.CLASS).length, 2, 'Number of class nodes is not correct.');
      assert.equal(sm.getAllNodes(type.DATAREFERENCE).length, 2, 'Number of data nodes is not correct.');
      assert.equal(sm.getAllEdges().length, 3, 'Number of edges is not correct.');
      assert.equal(sm.getEdges('http://www.example.com#firstName').length, 1, 'Firstname label not correct.');
      assert.equal(sm.getEdges('http://www.example.com#brand').length, 1, 'Brand label not correct.');
      assert.equal(sm.getEdges('http://www.example.com#owner').length, 1, 'Owner label not correct.');
      assert.equal(sm.getEdges('http://www.example.com#owner')[0].source, 1, 'Owner edge is not correct.');
      assert.equal(sm.getEdges('http://www.example.com#owner')[0].target, 0, 'Owner edge is not correct.');
    });
  });
});
