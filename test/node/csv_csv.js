/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

let assert = require('chai').assert;
let example2rml = require('../../index.js');
let type = require('semanticmodel').nodeType.types;
let utils = require('../../lib/utils.js');

describe('CSV + CSV', function () {
  it('#1', function () {
    let triples = [
      {
        subject: 'http://www.example.com/person/0',
        predicate: 'http://www.example.com/name',
        object: '"John"'
      },
      {
        subject: 'http://www.example.com/person/0',
        predicate: 'http://www.example.com/age',
        object: '"30"'
      },
      {
        subject: 'http://www.example.com/person/0',
        predicate: 'http://www.example.com/friend',
        object: 'http://www.example.com/friend/Luke'
      },
      {
        subject: 'http://www.example.com/friend/Luke',
        predicate: 'http://www.example.com/firstname',
        object: '"Luke"'
      },
      {
        subject: 'http://www.example.com/friend/Luke',
        predicate: 'http://www.example.com/lastname',
        object: '"Test"'
      }
    ];

    let dataSources = [{
      sourceDescription: {
        type: 'csv',
        source: 'data1.csv'
      },
      row: [{
        column: 'ID',
        value: '0'
      }, {
        column: 'name',
        value: 'John'
      }, {
        column: 'age',
        value: '30'
      }, {
        column: 'friend_id',
        value: '1'
      }
      ]
    }, {
      sourceDescription: {
        type: 'csv',
        source: 'data2.csv'
      },
      row: [{
        column: 'ID',
        value: '1'
      }, {
        column: 'firstname',
        value: 'Luke'
      }, {
        column: 'lastname',
        value: 'Skywalker'
      }
      ]
    }];

    return example2rml(triples, dataSources, {
      joinConditions: false
    }).then(function (rml) {
      //console.log(JSON.stringify(rml));
      assert.deepEqual(rml, require('./csv_csv.json').mappings[0], 'RML triples are not correct.');
      //utils.showReadableRML(rml);
    });
  });

  it('#2', function () {
    let triples = [
      {
        subject: 'http://www.example.com/person/0',
        predicate: 'http://www.example.com/name',
        object: '"John"'
      },
      {
        subject: 'http://www.example.com/person/0',
        predicate: 'http://www.example.com/age',
        object: '"30"'
      },
      {
        subject: 'http://www.example.com/person/0',
        predicate: 'http://www.example.com/friend',
        object: 'http://www.example.com/friend/Luke'
      },
      {
        subject: 'http://www.example.com/friend/Luke',
        predicate: 'http://www.example.com/firstname',
        object: '"Luke"'
      },
      {
        subject: 'http://www.example.com/friend/Luke',
        predicate: 'http://www.example.com/lastname',
        object: '"Skywalker"'
      }
    ];

    let dataSources = [{
      sourceDescription: {
        type: 'csv',
        source: 'data1.csv'
      },
      row: [{
        column: 'ID',
        value: '0'
      }, {
        column: 'name',
        value: 'John'
      }, {
        column: 'age',
        value: '30'
      }, {
        column: 'friend_id',
        value: '1'
      }
      ]
    }, {
      sourceDescription: {
        type: 'csv',
        source: 'data2.csv'
      },
      row: [{
        column: 'ID',
        value: '1'
      }, {
        column: 'name',
        value: 'Luke'
      }, {
        column: 'lastname',
        value: 'Skywalker'
      }
      ]
    }];

    return example2rml(triples, dataSources, {
      joinConditions: false
    }).then(function (rml) {
      //console.log(JSON.stringify(rml));
      assert.deepEqual(rml, require('./csv_csv.json').mappings[1], 'RML triples are not correct.');
      //utils.showReadableRML(rml);
    });
  });

  it('#3', function () {
    let triples = [
      {
        subject: 'http://www.example.com/person/0',
        predicate: 'http://www.example.com/name',
        object: '"John"'
      },
      {
        subject: 'http://www.example.com/person/0',
        predicate: 'http://www.example.com/age',
        object: '"30"'
      },
      {
        subject: 'http://www.example.com/person/0',
        predicate: 'http://www.example.com/friend',
        object: 'http://www.example.com/friend/Luke'
      },
      {
        subject: 'http://www.example.com/friend/Luke',
        predicate: 'http://www.example.com/firstname',
        object: '"Luke"'
      },
      {
        subject: 'http://www.example.com/friend/Luke',
        predicate: 'http://www.example.com/lastname',
        object: '"Skywalker"'
      }
    ];

    let dataSources = [{
      sourceDescription: {
        type: 'csv',
        source: 'data1.csv'
      },
      row: [{
        column: 'ID',
        value: '0'
      }, {
        column: 'name',
        value: 'John'
      }, {
        column: 'age',
        value: '30'
      }, {
        column: 'friend_id',
        value: '1'
      }
      ]
    }, {
      sourceDescription: {
        type: 'csv',
        source: 'data2.csv'
      },
      row: [{
        column: 'ID',
        value: '1'
      }, {
        column: 'name',
        value: 'Luke'
      }, {
        column: 'lastname',
        value: 'Skywalker'
      }
      ]
    }];

    return example2rml(triples, dataSources).then(function (rml) {
      //console.log(JSON.stringify(rml));
      //console.log(rml);
      assert.deepEqual(rml, require('./csv_csv.json').mappings[2], 'RML triples are not correct.');
      //utils.showReadableRML(rml);
    });
  });

  it('#4', function () {
    let triples = [
      {
        subject: 'http://www.example.com/person/0',
        predicate: 'http://www.example.com/name',
        object: '"John"'
      },
      {
        subject: 'http://www.example.com/person/0',
        predicate: 'http://www.example.com/age',
        object: '"30"'
      },
      {
        subject: 'http://www.example.com/person/0',
        predicate: 'http://www.example.com/friend',
        object: '_:b1'
      },
      {
        subject: '_:b1',
        predicate: 'http://www.example.com/firstname',
        object: '"Luke"'
      },
      {
        subject: '_:b1',
        predicate: 'http://www.example.com/lastname',
        object: '"Skywalker"'
      }
    ];

    let dataSources = [{
      sourceDescription: {
        type: 'csv',
        source: 'data1.csv'
      },
      row: [{
        column: 'ID',
        value: '0'
      }, {
        column: 'name',
        value: 'John'
      }, {
        column: 'age',
        value: '30'
      }, {
        column: 'friend_id',
        value: '1'
      }
      ]
    }, {
      sourceDescription: {
        type: 'csv',
        source: 'data2.csv'
      },
      row: [{
        column: 'ID',
        value: '1'
      }, {
        column: 'name',
        value: 'Luke'
      }, {
        column: 'lastname',
        value: 'Skywalker'
      }
      ]
    }];

    return example2rml(triples, dataSources).then(function (rml) {
      //console.log(JSON.stringify(rml));
      //console.log(rml);
      assert.deepEqual(rml, require('./csv_csv.json').mappings[3], 'RML triples are not correct.');
      //utils.showReadableRML(rml);
    });
  });
});