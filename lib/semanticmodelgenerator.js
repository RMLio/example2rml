/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

let SemanticModel = require('semanticmodel').SemanticModel;
let type = require('semanticmodel').nodeType.types;
let rdfstore = require('rdfstore');
let Q = require('q');
let N3 = require('n3');

class SemanticModelGenerator {

  /**
   * Constructor of SemanticModelGenerator
   * @param triples: the triples on which to base the generation of the semantic model
   */
  constructor(triples) {
    this.triples = triples;
  }

  /**
   * Generate the model based on the triples provided via the constructor.
   * @returns {promise}: promise that resolves when the model is generated.
   */
  getModel() {
    //convert the triples to a string to load in the RDF store
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
            // subjects = subjects.sort((a, b) => {
            //   if (a.s.value < b.s.value) {
            //     return 1;
            //   } else if (a.s.value > b.s.value) {
            //     return -1;
            //   } else {
            //     return 0;
            //   }
            // });

            if (err) {
              console.error(err);
              process.exit(1);
            } else {
              let nodes = [];
              //we create class nodes for all the subjects
              subjects.forEach(function (subject) {
                let node = {
                  type: type.CLASS,
                  sample: { value: subject.s.value},
                };

                //if a class is defined, we also add it
                if (subject.c) {
                  node.label = subject.c.value;
                }

                let subjectNode = model.createNode(node);
                nodes.push(subjectNode);
              });

              //we iterate over all the nodes again and each subjects predicate and objects
              nodes.forEach(function (node) {
                let poDeferred = Q.defer();
                promises.push(poDeferred.promise);

                store.execute('SELECT DISTINCT ?p ?o WHERE { <' + node.sample.value + '> ?p ?o.}', function (err, predobjects) {
                  // predobjects = predobjects.sort((a, b) => {
                  //   if (a.p && b.p) {
                  //     if (a.p.value < b.p.value) {
                  //       return 1;
                  //     } else if (a.p.value > b.p.value) {
                  //       return -1;
                  //     } else {
                  //       if (a.o && b.o) {
                  //         if (a.o.value < b.o.value) {
                  //           return 1;
                  //         } else if (a.o.value > b.o.value) {
                  //           return -1;
                  //         } else {
                  //           return 0;
                  //         }
                  //       } else {
                  //         return 0;
                  //       }
                  //     }
                  //   } else {
                  //     return 0;
                  //   }
                  // });

                  if (err) {
                    console.error(err);
                    process.exit(1);
                  } else {
                    predobjects.forEach(function (po) {
                      //ignore the class triples
                      if (po.p.value !== 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
                        if (po.o.token === 'literal') {
                          //only when it is a literal we want to create a data node
                          let objectNode = model.createNode({
                            type: type.DATAREFERENCE,
                            sample: { value:po.o.value, type: po.o.type, language: po.o.lang }
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

                          while (i < possibleTargetNodes.length && possibleTargetNodes[i].sample.value !== po.o.value) {
                            i++;
                          }

                          if (i < possibleTargetNodes.length) {
                            model.createEdge({
                              source: node.id,
                              target: possibleTargetNodes[i].id,
                              label: po.p.value
                            });
                          } else {
                            console.log('WARNING: class node is not found; ' + po.o.value);
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
        })
      })
    }

    return d.promise;
  }
}

module.exports = SemanticModelGenerator;