/**
 * Created by pheyvaer on 31.03.17.
 */

let assert = require('chai').assert;
let example2rml = require('../index.js');
let type = require('semanticmodel').nodeType.types;

describe('Index:', function () {
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

    example2rml(triples, dataSources).then(function(rml){
      console.log(rml);
      done();
    });
  });
});
