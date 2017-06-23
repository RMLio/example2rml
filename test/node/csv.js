/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

let assert = require('chai').assert;
let example2rml = require('../../index.js');
let type = require('semanticmodel').nodeType.types;
let utils = require('../../lib/utils.js');
let N3 = require('n3');

describe('CSV:', function () {
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
      sourceDescription: {type: 'csv'},
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

    return example2rml(triples, dataSources).then(function(rml){
      assert.deepEqual(rml, require('./index.json').mappings[0], 'RML triples are not correct.');
      let writer = N3.Writer({prefixes: {
        rr: 'http://www.w3.org/ns/r2rml#',
        rml: 'http://semweb.mmlab.be/ns/rml#',
        ex: 'http://www.example.com/',
        foaf: 'http://xmlns.com/foaf/0.1/'
      }});

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
      type: 'csv',
      sourceDescription: {
        type: 'csv',
        source: '/tmp/input.csv'
      },
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

    return example2rml(triples, dataSources).then(function(rml){
      assert.deepEqual(rml, require('./index.json').mappings[1], 'RML triples are not correct.');
      let writer = N3.Writer({prefixes: {
        rr: 'http://www.w3.org/ns/r2rml#',
        rml: 'http://semweb.mmlab.be/ns/rml#',
        ex: 'http://www.example.com/',
        foaf: 'http://xmlns.com/foaf/0.1/'
      }});

      //utils.showReadableRML(rml);
    });
  });

  it('language', function () {
    let triples = [
      {
        subject: 'http://www.example.com/pieter',
        predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        object: 'http://www.example.com#Person'
      },
      {
        subject: 'http://www.example.com/pieter',
        predicate: 'http://www.example.com#firstName',
        object: '"Pieter"@en'
      }
    ];

    //the column names need to have double quotes around the header
    let dataSources = [{
      type: 'csv',
      sourceDescription: {
        type: 'csv',
        source: '/tmp/input.csv'
      },
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

    return example2rml(triples, dataSources).then(function(rml){
      //console.log(JSON.stringify(rml));
      assert.deepEqual(rml, require('./index.json').mappings[6], 'RML triples are not correct.');

      //utils.showReadableRML(rml);
    });
  });

  it('datatype', function () {
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
        object: '"Pieter"^^http://www.example.com/String'
      }
    ];

    //the column names need to have double quotes around the header
    let dataSources = [{
      type: 'csv',
      sourceDescription: {
        type: 'csv',
        source: '/tmp/input.csv'
      },
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

    return example2rml(triples, dataSources).then(function(rml){
      //console.log(JSON.stringify(rml));
      assert.deepEqual(rml, require('./index.json').mappings[7], 'RML triples are not correct.');

      //utils.showReadableRML(rml);
    });
  });
});
