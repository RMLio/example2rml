/**
 * Created by pheyvaer on 31.03.17.
 */

let Aligner = require('./lib/aligner.js');
let SemanticModelGenerator = require('./lib/semanticmodelgenerator.js');
let RMLMappingGenerator = require('semanticmodel').RMLMappingGenerator;
let Q = require('q');

/**
 * Generate an RML mapping from a given set of triples and data sources.
 * @param triples: the triples to consider when generating the mapping
 * @param dataSources: the data sources from which the triples are being mapped
 * @returns {promise}: the promise that will resolve once the RML mapping is generated (RDF triples are provided)
 */
function generate(triples, dataSources){
  let deferred = Q.defer();
  let smg = new SemanticModelGenerator(triples);
  let aligner = new Aligner(dataSources);
  let rmg = new RMLMappingGenerator({baseIRI: 'http://www.mymapping.com#'});

  //1. generate the semantic model
  smg.getModel().then(function(sm) {
    //2. align the semantic model with the data sources
    aligner.align(sm);
    //3. generate RML from the semantic model
    deferred.resolve(rmg.generate(sm));
  });

  return deferred.promise;
}

module.exports = generate;