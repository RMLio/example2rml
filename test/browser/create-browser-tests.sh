#!/usr/bin/env bash

# author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
# Ghent University - imec - IDLab

./node_modules/browserify/bin/cmd.js ./test/node/aligner.js -o ./test/browser/aligner.js
./node_modules/browserify/bin/cmd.js ./test/node/csv.js -o ./test/browser/csv.js
./node_modules/browserify/bin/cmd.js ./test/node/csv_csv.js -o ./test/browser/csv_csv.js
./node_modules/browserify/bin/cmd.js ./test/node/csv_json.js -o ./test/browser/csv_json.js
./node_modules/browserify/bin/cmd.js ./test/node/json.js -o ./test/browser/json.js
./node_modules/browserify/bin/cmd.js ./test/node/json_json.js -o ./test/browser/json_json.js
./node_modules/browserify/bin/cmd.js ./test/node/semanticmodelgenerator.js -o ./test/browser/semanticmodelgenerator.js