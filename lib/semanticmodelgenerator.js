/**
 * Created by pheyvaer on 31.03.17.
 */

let SemanticModel = require('semanticmodel').SemanticModel;
let type = require('semanticmodel').nodeType.types;
let rdfstore = require('rdfstore');
let Q = require('q');
let N3 = require('n3');

let namespaces = {
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  owl: 'http://www.w3.org/2002/07/owl#'
};

class SemanticModelGenerator {

  constructor(triples) {
    this.triples = triples;
  }

  getModel() {
    let writer = N3.Writer();
    let d = Q.defer();

    writer.addTriples(this.triples);
    writer.end(function (error, result) {
      afterToTurtle(result);
    });

    function afterToTurtle(triples) {
      rdfstore.create(function (err, store) {
        store.load("text/turtle", triples, function (err, results) {
          let model = new SemanticModel();
          let promises = [];

          let subjectDeferred = Q.defer();
          promises.push(subjectDeferred.promise);

          //iterate over all subjects
          store.execute('SELECT DISTINCT ?s ?c WHERE { ?s ?p ?o. OPTIONAL {?s a ?c}}', function (err, subjects) {
            if (err) {
              console.error(err);
              process.exit(1);
            } else {
              let nodes = [];

              subjects.forEach(function (subject) {
                let node = {
                  type: type.CLASS,
                  sample: subject.s.value,
                };

                //if a class is defined, we also add it
                if (subject.c) {
                  node.label = subject.c.value;
                }

                let subjectNode = model.createNode(node);
                nodes.push(subjectNode);
              });

              nodes.forEach(function (node) {
                let poDeferred = Q.defer();
                promises.push(poDeferred.promise);

                store.execute('SELECT DISTINCT ?p ?o WHERE { <' + node.sample + '> ?p ?o.}', function (err, predobjects) {
                  //console.log(predobjects);
                  if (err) {
                    console.error(err);
                    process.exit(1);
                  } else {
                    predobjects.forEach(function (po) {
                      if (po.p.value !== 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
                        if (po.o.token === 'literal') {
                          let objectNode = model.createNode({
                            type: type.DATAREFERENCE,
                            sample: po.o.value
                          });

                          model.createEdge({
                            source: node.id,
                            target: objectNode.id,
                            label: po.p.value
                          });
                        } else {
                          //we are dealing an edge between two class nodes
                          let possibleTargetNodes = model.getAllNodes();
                          let i = 0;

                          while (i < possibleTargetNodes.length && possibleTargetNodes[i].sample !== po.o.value) {
                            i++;
                          }

                          if (i < possibleTargetNodes.length) {
                            model.createEdge({
                              source: node.id,
                              target: possibleTargetNodes[i].id,
                              label: po.p.value
                            });
                          } else {
                            console.log('ERROR: class node is not found');
                          }
                        }
                      }
                    });

                    poDeferred.resolve();
                  }
                });
              });

              subjectDeferred.resolve();
            }
          });

          Q.all(promises).then(function () {
            d.resolve(model);
          });

          //make difference between literal and IRi as object
        })
      })
    }

    return d.promise;
  }
}

module.exports = SemanticModelGenerator;