/**
 * Created by pheyvaer on 31.03.17.
 */

let assert = require('chai').assert;
let example2rml = require('../index.js');
let type = require('semanticmodel').nodeType.types;
let makeReadable = require('readable-rml');
let N3 = require('n3');

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

      //console.log(rml);

      makeReadable(rml, writer);
      writer.end(function (error, result) {
        //console.log(result);
      });
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

      makeReadable(rml, writer);
      writer.end(function (error, result) {
        //console.log(result);
      });
    });
  });

  it('without iterator', function () {
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
      // let writer = N3.Writer({
      //   prefixes: {
      //     rr: 'http://www.w3.org/ns/r2rml#',
      //     rml: 'http://semweb.mmlab.be/ns/rml#',
      //     ex: 'http://www.example.com/',
      //     foaf: 'http://xmlns.com/foaf/0.1/'
      //   }
      // });
      //
      // makeReadable(rml, writer);
      // writer.end(function (error, result) {
      //   console.log(result);
      // });
    });
  });

  it('invalid iterator', function () {
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
});
