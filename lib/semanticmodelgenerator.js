/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

let SemanticModel = require('semanticmodel').SemanticModel;
let type = require('semanticmodel').nodeType.types;
let N3 = require('n3');
let namespaces = require('prefix-ns').asMap();

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
    let store = N3.Store();
    let model = new SemanticModel();

    store.addTriples(this.triples);

    let temp = store.getTriples(null, null, null).map(a => a.subject);
    let subjects = temp.filter(function(item, pos) {
      return temp.indexOf(item) === pos;
    });

    let nodes = [];

    //we create class nodes for all the subjects
    subjects.forEach(subject => {
      let node = {
        type: type.CLASS,
        sample: { value: subject},
      };

      let classes = store.getTriples(subject, namespaces.rdf + 'type', null).map(a => a.object);

      //if a class is defined, we also add it
      if (classes.length > 0) {
        node.label = classes[0];
      }

      let subjectNode = model.createNode(node);
      nodes.push(subjectNode);
    });

    //we iterate over all the nodes again and each subjects predicate and objects
    nodes.forEach(node => {
      let predobjects = store.getTriples(node.sample.value);

      predobjects.forEach(function (po) {
        //ignore the class triples
        if (po.predicate !== namespaces.rdf + 'type') {
          if (N3.Util.isLiteral(po.object)) {
            //only when it is a literal we want to create a data node
            let language = N3.Util.getLiteralLanguage(po.object);

            if (language === '') {
              language = undefined;
            }

            let datatype = N3.Util.getLiteralType(po.object);

            if (language || datatype === '' || datatype === 'http://www.w3.org/2001/XMLSchema#string') {
              datatype = undefined;
            }

            let objectNode = model.createNode({
              type: type.DATAREFERENCE,
              sample: { value: N3.Util.getLiteralValue(po.object), type: datatype, language}
            });

            model.createEdge({
              source: node.id,
              target: objectNode.id,
              label: po.predicate
            });
          } else {
            //we are dealing an edge between two class nodes
            let possibleTargetNodes = model.getAllNodes();
            let i = 0;

            while (i < possibleTargetNodes.length && possibleTargetNodes[i].sample.value !== po.object) {
              i++;
            }

            if (i < possibleTargetNodes.length) {
              model.createEdge({
                source: node.id,
                target: possibleTargetNodes[i].id,
                label: po.predicate
              });
            } else {
              console.log('WARNING: class node is not found; ' + po.object);
            }
          }
        }
      });
    });

    return model;
  }
}

module.exports = SemanticModelGenerator;