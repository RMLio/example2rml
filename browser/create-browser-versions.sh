#!/usr/bin/env bash

# author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
# Ghent University - imec - IDLab

./node_modules/browserify/bin/cmd.js index.js -o ./browser/example2rml.js --standalone example2rml
./node_modules/babel-cli/bin/babel.js ./browser/example2rml.js -o ./browser/example2rml.min.js