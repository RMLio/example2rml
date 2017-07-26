/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

let assert = require('chai').assert;
let example2rml = require('../../index.js');
let type = require('semanticmodel').nodeType.types;
let N3 = require('n3');
const utils = require('../../lib/utils.js');

describe('JSON:', function () {
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

    //the column names need to have double quotes around the header
    let dataSources = [{
      sourceDescription: {type: 'json', iterator: '$'},
      object: {
        name: {
          first: 'Pieter',
          last: 'Heyvaert'
        },
        age: "26"
      }
    }];

    return example2rml(triples, dataSources).then(function (rml) {
      assert.deepEqual(rml, require('./index.json').mappings[2], 'RML triples are not correct.');
      let writer = N3.Writer({
        prefixes: {
          rr: 'http://www.w3.org/ns/r2rml#',
          rml: 'http://semweb.mmlab.be/ns/rml#',
          ex: 'http://www.example.com/',
          foaf: 'http://xmlns.com/foaf/0.1/'
        }
      });

      //utils.showReadableRML(rml);
    });
  });

  it('with sourceDescription', function () {
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

    //the column names need to have double quotes around the header
    let dataSources = [{
      sourceDescription: {
        type: 'json',
        source: 'person.json',
        iterator: '$'
      },
      object: {
        name: {
          first: 'Pieter',
          last: 'Heyvaert'
        },
        age: "26"
      }
    }];

    return example2rml(triples, dataSources).then(function (rml) {
      assert.deepEqual(rml, require('./index.json').mappings[3], 'RML triples are not correct.');
      let writer = N3.Writer({
        prefixes: {
          rr: 'http://www.w3.org/ns/r2rml#',
          rml: 'http://semweb.mmlab.be/ns/rml#',
          ex: 'http://www.example.com/',
          foaf: 'http://xmlns.com/foaf/0.1/'
        }
      });

      //utils.showReadableRML(rml);
    });
  });

  it('without iterator', function () {
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

    //the column names need to have double quotes around the header
    let dataSources = [{
      sourceDescription: {
        type: 'json',
        source: 'person.json'
      },
      object: {
        persons: [{
          name: {
            first: 'Pieter',
            last: 'Heyvaert'
          },
          age: "26"
        }]
      }
    }];

    return example2rml(triples, dataSources).then(function (rml) {
      assert.deepEqual(rml, require('./index.json').mappings[4], 'RML triples are not correct.');
      //utils.showReadableRML(rml);
    });
  });

  it('invalid iterator', function () {
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

    //the column names need to have double quotes around the header
    let dataSources = [{
      sourceDescription: {
        type: 'json',
        source: 'person.json',
        iterator: '$.[*]'
      },
      object: {
        name: {
          first: 'Pieter',
          last: 'Heyvaert'
        },
        age: "26"
      }
    }];

    return example2rml(triples, dataSources).
    catch(function(e){
      assert.equal(e.name, 'InvalidIteratorError', 'Error is incorrect.');
    });
  });

  it('extra test', function () {
    this.timeout(10000);
    let triples = [
      {
        subject: 'http://www.example.com/person/0',
        predicate: 'http://www.example.com/name',
        object: '"John"'
      },
      {
        subject: 'http://www.example.com/person/0',
        predicate: 'http://www.example.com/name',
        object: '"30"'
      },
      {
        subject: 'http://www.example.com/person/0',
        predicate: 'http://www.example.com/friend',
        object: 'http://www.example.com/friend/Luke'
      }
    ];

    //the column names need to have double quotes around the header
    let dataSources = [{
      sourceDescription: {
        type: 'json',
        source: 'person.json'
      },
      object: {
        "persons": [
          {
            "ID": 0,
            "name": "John",
            "age": "30",
            "friend_id": 1
          },
          {
            "ID": 1,
            "name": "James",
            "age": "25",
            "friend_id": 2
          }
        ]
      }
    }];

    return example2rml(triples, dataSources).then(function (rml) {
      //console.log(JSON.stringify(rml));
      assert.deepEqual(rml, require('./index.json').mappings[5], 'RML triples are not correct.');
      //utils.showReadableRML(rml);
    });
  });
});
