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
      id: 'datasource-0',
      sourceDescription: {
        type: 'csv'
      },
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

  it('generate template', function () {
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
      id: 'datasource-0',
      sourceDescription: {
        type: 'csv'
      },
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
      assert.equal(sm.get(0).template, 'http://www.example.com/{firstname}', 'Correct template is not found.');
    });
  });

  it('2 entities - CSV', function () {
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
      id: 'datasource-0',
      sourceDescription: {type: 'csv', source: 'person-data'},
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
      id: 'datasource-1',
      sourceDescription: {type: 'csv', source: 'car-data'},
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
        if (node.label === 'firstname' && node.sourceDescription.source === 'person-data' && node.sample === 'Pieter') {
          firstNameCounter++;
        }

        if (node.label === 'brand' && node.sourceDescription.source === 'car-data' && node.sample === 'Peugeot') {
          brandNodeCounter++;
        }
      });

      assert.equal(firstNameCounter, 1, 'Firstname node is not correct or not found.');
      assert.equal(brandNodeCounter, 1, 'Brand node is not correct or not found.');
    });
  });

  it('2 entities - JSON', function () {
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
      id: 'datasource-0',
      type: 'json',
      sourceDescription: {
        type: 'json',
        source: 'person.json'
      },
      object: {
        name: {
          first: 'Pieter',
          last: 'Heyvaert'
        },
        age: 26
      }
    }, {
      id: 'datasource-2',
      type: 'json',
      sourceDescription: {
        type: 'json',
        source: 'car.json'
      },
      object: {
        id: '2',
        brand: 'Peugeot',
        owner: {
          id: '0',
          age: 26
        }
      }
    }];

    let smg = new SemanticModelGenerator(triples);
    return smg.getModel().then(function (sm) {
      let aligner = new Aligner(dataSources);
      aligner.align(sm);
      //console.log(sm);

      let brandNodeCounter = 0;
      let firstNameCounter = 0;

      sm.getAllNodes().forEach(function (node) {
        if (node.label === 'name.first' && node.sourceDescription.source === 'person.json' && node.sample === 'Pieter') {
          firstNameCounter++;
        }

        if (node.label === 'brand' && node.sourceDescription.source === 'car.json' && node.sample === 'Peugeot') {
          brandNodeCounter++;
        }
      });

      assert.equal(firstNameCounter, 1, 'Firstname node is not correct or not found.');
      assert.equal(brandNodeCounter, 1, 'Brand node is not correct or not found.');
    });
  });

  it('2 entities - JSON & CSV', function () {
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
      id: 'datasource-0',
      type: 'json',
      sourceDescription: {
        type: 'json',
        source: 'person.json'
      },
      object: {
        name: {
          first: 'Pieter',
          last: 'Heyvaert'
        },
        age: 26
      }
    }, {
      type: 'csv',
      sourceDescription: {
        type: 'csv',
        source: 'car.csv'
      },
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
        if (node.label === 'name.first' && node.sourceDescription.source === 'person.json' && node.sample === 'Pieter') {
          firstNameCounter++;
        }

        if (node.label === 'brand' && node.sourceDescription.source === 'car.csv' && node.sample === 'Peugeot') {
          brandNodeCounter++;
        }
      });

      assert.equal(firstNameCounter, 1, 'Firstname node is not correct or not found.');
      assert.equal(brandNodeCounter, 1, 'Brand node is not correct or not found.');
    });
  });
});
