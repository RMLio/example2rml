#!/usr/bin/env node

const program = require('commander');
const pck = require('../package.json');
const N3 = require('n3');
const fs = require('fs');
const example2rml = require('../index.js');
const parse = require('csv-parse/lib/sync');
const utils = require('../lib/utils.js');

function parseFormat() {
  return '';
}

function input(val) {
  return val.split(',');
}

program
  .version(pck.version)
  .option('-i, --input [input]', 'paths to input data sources (comma-seperated)', input)
  .option('-t, --triples [triples]', 'path to document with example triples (Turtle, TriG, N-Triples and N-Quads)')
  .option('-o, --output [output]', `path to output file (created if doesn't exist)`)
//  .option('-f, --format [format]', `format of triples (default is 'turtle')`, parseFormat)
//  .option('-v, --verbose', 'make the execution more talkative')
  .parse(process.argv);

if (program.input.length === 0) {
  console.error('Please provide at least one input data source.');
  process.exit(1);
} else if (!program.triples) {
  console.error('Please provide the example triples.');
  process.exit(1);
} else {
  let triplesStr = fs.readFileSync(program.triples, 'utf-8');
  let dataSources = [];

  program.input.forEach(i => {
    let data = {
      sourceDescription: {
        source: i
      }
    };

    if (i.indexOf('.csv') !== -1) {
      data.sourceDescription.type = 'csv';
      data.row = [];

      let loadedData = fs.readFileSync(i, 'utf-8');
      let records = parse(loadedData, {columns: true});

      Object.keys(records[0]).forEach(c => {
        data.row.push({
          column: c,
          value: records[0][c]
        });
      });
    } else if (i.indexOf('.json') !== -1) {
      data.sourceDescription.type = 'json';
    } else {
      console.error(`Currently, the used format is not supported. Please only use CSV or JSON files with the correct extension`);
      process.exit(1);
    }

    dataSources.push(data);
  });

  let parser = N3.Parser();
  let triples = [];

  parser.parse(triplesStr, function (error, triple, prefixes) {
    if (triple) {
      triples.push(triple);
    } else {
      example2rml(triples, dataSources).then(function(rml){
        utils.getReadableRML(rml, (err, data) => {
          if (program.output) {
            fs.writeFile(program.output, data, err => {
              if (err) {
                console.error(err.message);
              }
            });
          } else {
            console.log(data);
          }
        });
      });
    }
  });
}