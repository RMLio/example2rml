/**
 * Created by pheyvaer on 31.03.17.
 */

let Aligner = require('./lib/aligner.js');
let SemanticModelGenerator = require('./lib/semanticmodelgenerator.js');
let RMLMappingGenerator = require('semanticmodel').RMLMappingGenerator;
let Q = require('q');

function generate(triples, dataSources){
  let deferred = Q.defer();
  let smg = new SemanticModelGenerator(triples);
  let aligner = new Aligner(dataSources);
  let rmg = new RMLMappingGenerator({baseIRI: 'http://www.mymapping.com#'});

  smg.getModel().then(function(sm) {
    aligner.align(sm);
    deferred.resolve(rmg.generate(sm));
  });

  return deferred.promise;
}

module.exports = generate;