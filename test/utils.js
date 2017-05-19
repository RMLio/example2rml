/**
 * Created by pheyvaer on 19.05.17.
 */

let makeReadable = require('readable-rml');
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

module.exports = {
  showReadableRML: showReadableRML
};