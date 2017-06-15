/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

let makeReadable = require('readable-rml').makeReadable;
let N3 = require('n3');

function showReadableRML(rml){
  let writer = N3.Writer({
    prefixes: {
      rr: 'http://www.w3.org/ns/r2rml#',
      rml: 'http://semweb.mmlab.be/ns/rml#',
      ex: 'http://www.example.com/',
      foaf: 'http://xmlns.com/foaf/0.1/'
    }
  });

  makeReadable(rml, writer);
  writer.end(function (error, result) {
   console.log(result);
  });
}

function getReadableRML(rml, cb){
  let writer = N3.Writer({
    prefixes: {
      rr: 'http://www.w3.org/ns/r2rml#',
      rml: 'http://semweb.mmlab.be/ns/rml#',
      ex: 'http://www.example.com/',
      foaf: 'http://xmlns.com/foaf/0.1/'
    }
  });

  makeReadable(rml, writer);
  writer.end(cb);
}

module.exports = {
  showReadableRML: showReadableRML,
  getReadableRML: getReadableRML
};