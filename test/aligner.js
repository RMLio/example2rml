/**
 * Created by pheyvaer on 31.03.17.
 */

let assert = require('chai').assert;
let SemanticModelGenerator = require('../lib/semanticmodelgenerator.js');
let Aligner = require('../lib/aligner.js');
let type = require('semanticmodel').nodeType.types;

describe('Aligner:', function () {
  it('single entity with attributes', function () {
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
      }, {
        column: 'lastname',
        value: 'Heyvaert'
      }, {
        column: 'age',
        value: '26'
      }
      ]
    }];

    let smg = new SemanticModelGenerator(triples);
    return smg.getModel().then(function (sm) {
      let aligner = new Aligner(dataSources);
      aligner.align(sm);
      //console.log(sm);
      assert.equal(sm.get(1).label, 'firstname', 'Correct label is not found.');
      assert.equal(sm.get(3).label, 'lastname', 'Correct label is not found.');
      assert.equal(sm.get(5).label, 'age', 'Correct label is not found.');
    });
  });

  it('generate template', function (done) {
    this.timeout(10000);
    let triples = [
      {
        subject: 'http://www.example.com/Pieter',
        predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        object: 'http://www.example.com#Person'
      },
      {
        subject: 'http://www.example.com/Pieter',
        predicate: 'http://www.example.com#firstName',
        object: '"Pieter"'
      },
      {
        subject: 'http://www.example.com/Pieter',
        predicate: 'http://www.example.com#lastName',
        object: '"Heyvaert"'
      },
      {
        subject: 'http://www.example.com/Pieter',
        predicate: 'http://www.example.com#age',
        object: '"26"'
      }
    ];

    let dataSources = [{
      type: 'csv',
      row: [{
        column: 'firstname',
        value: 'Pieter'
      }, {
        column: 'lastname',
        value: 'Heyvaert'
      }, {
        column: 'age',
        value: '26'
      }
      ]
    }];

    let smg = new SemanticModelGenerator(triples);
    smg.getModel().then(function (sm) {
      try {
        let aligner = new Aligner(dataSources);
        aligner.align(sm);
        //console.log(sm);
        assert.equal(sm.get(0).template, 'http://www.example.com/{firstname}', 'Correct template is not found.');
      } catch (e) {
        console.log(e);
      }

      done();
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

    let dataSources = [{
      type: 'csv',
      sourceDescription: 'person-data',
      row: [{
        column: 'id',
        value: '0'
      }, {
        column: 'firstname',
        value: 'Pieter'
      }, {
        column: 'lastname',
        value: 'Heyvaert'
      }, {
        column: 'age',
        value: '26'
      }
      ]
    }, {
      type: 'csv',
      sourceDescription: 'car-data',
      row: [{
        column: 'id',
        value: '2'
      }, {
        column: 'brand',
        value: 'Peugeot'
      }, {
        column: 'owner',
        value: '0'
      }, {
        column: 'age',
        value: '26'
      }
      ]
    }];

    let smg = new SemanticModelGenerator(triples);
    return smg.getModel().then(function (sm) {
      let aligner = new Aligner(dataSources);
      aligner.align(sm);
      //console.log(sm);

      let brandNodeCounter = 0;
      let firstNameCounter = 0;

      sm.getAllNodes().forEach(function (node) {
        if (node.label === 'firstname' && node.sourceDescription === 'person-data' && node.sample === 'Pieter') {
          firstNameCounter++;
        }

        if (node.label === 'brand' && node.sourceDescription === 'car-data' && node.sample === 'Peugeot') {
          brandNodeCounter++;
        }
      });

      assert.equal(firstNameCounter, 1, 'Firstname node is not correct or not found.');
      assert.equal(brandNodeCounter, 1, 'Brand node is not correct or not found.');
    });
  });
});
