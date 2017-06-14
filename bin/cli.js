#!/usr/bin/env node

const program = require('commander');
const pck = require('../package.json');
const N3 = require('n3');
const fs = require('fs');
const example2rml = require('../index.js');
const parse = require('csv-parse/lib/sync');
const utils = require('../lib/utils.js');
const path = require('path');
const winston = require('winston');

winston.addColors({
  error: 'red',
  info: 'yellow'
});

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      name: 'log-console',
      colorize: true,
      prettyPrint: true,
      silent: false,
      level: 'error'
    })
  ]
});

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

//check in data sources are provided
if (program.input.length === 0) {
  logger.error('Please provide at least one input data source.');
  process.exit(1);

//check if example triples are provided
} else if (!program.triples) {
  logger.error('Please provide the example triples.');
  process.exit(1);
} else {
//load example triples
  let triplesStr;

  try {
    triplesStr = fs.readFileSync(program.triples, 'utf-8');
  } catch(e) {
    logger.error(`The file ${program.triples} with the example triples could not be loaded. Please make sure that path is correct.`);
    process.exit(1);
  }

  let dataSources = [];

  //for each input file create a data source
  program.input.forEach(i => {
    let data = {
      sourceDescription: {
        source: i
      }
    };

    //we are dealing with a csv file
    if (i.indexOf('.csv') !== -1) {
      data.sourceDescription.type = 'csv';
      data.row = [];

      let loadedData = fs.readFileSync(i, 'utf-8');
      let records = parse(loadedData, {columns: true});

      //read the first row from the csv file
      Object.keys(records[0]).forEach(c => {
        data.row.push({
          column: c,
          value: records[0][c]
        });
      });
    //we are dealing with a json file
    } else if (i.indexOf('.json') !== -1) {
      data.sourceDescription.type = 'json';

      try {
        data.object = require(path.join(process.cwd(), i));
      } catch(e) {
        logger.error(`The data file ${i} could not be loaded. Please make sure that path is correct.`);
        process.exit(1);
      }
    } else {
      logger.error(`Currently, the used format/extension is not supported. Please only use CSV or JSON files with the correct extension`);
      process.exit(1);
    }

    dataSources.push(data);
  });

  let parser = N3.Parser();
  let triples = [];

  //parse the example triples and put them in an N3.Store
  parser.parse(triplesStr, function (error, triple, prefixes) {
    if (triple) {
      triples.push(triple);
    } else {
      //create the RML from the example triples and the data store
      example2rml(triples, dataSources).then(function(rml){
        utils.getReadableRML(rml, (err, data) => {
          //if an output file is provided we write the mapping to that file
          if (program.output) {
            fs.writeFile(program.output, data, err => {
              if (err) {
                logger.error(err.message);
              }
            });
          } else {
            //no output file is provided so we write to stdout
            console.log(data);
          }
        });
      });
    }
  });
}