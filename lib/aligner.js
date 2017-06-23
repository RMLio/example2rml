/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

const type = require('semanticmodel').nodeType.types;
const pinta = require('pinta').json;
const jsonpath = require('jsonpath');
const InvalidIteratorError = require('./invaliditeratorerror.js');
const shortid = require('shortid');

class Aligner {

  /**
   * Constructor of Aligner.
   * @param dataSources: array of data sources where each data source has a type (data format), id.
   * When the data is a CSV is has a row attribute which is an array with JSON objects. These objects have a 'column' and 'value'.
   */
  constructor(dataSources) {
    this.dataSources = dataSources;

    for (let i = 0; i < this.dataSources.length; i ++) {
      let dataSource = this.dataSources[i];

      if (dataSource.id === undefined) {
        dataSource.id = shortid.generate();
      }
    }
  }

  /**
   * Align each node of the semantic model with the data sources.
   * After this method, the nodes have label and dataSource set when a matching label was found.
   * @param semanticmodel: the semantic label that needs to be aligned with the data sources given via the constructor.
   */
  _alignWithAllDataSources(semanticmodel) {
    let classNodes = semanticmodel.getAllNodes(type.CLASS);

    //get all values, from class nodes and data nodes
    classNodes.forEach(classNode => {
      let values = [];
      let dataNodes = [];
      let edges = semanticmodel.getEdgesWithNodeAsSource(classNode.id);
      let hashPosition = classNode.sample.value.lastIndexOf('#');
      let slashPosition = classNode.sample.value.lastIndexOf('/');
      let position = hashPosition > slashPosition ? hashPosition : slashPosition;
      let classNodeValue = classNode.sample.value.substring(position + 1);
      //console.log(`classNodeValue = ${classNodeValue}`);

      values.push(classNodeValue);

      edges.forEach(function (edge) {
        let dataNode = semanticmodel.get(edge.target);

        if (dataNode.type === type.DATAREFERENCE) {
          dataNodes.push(dataNode);

          if (values.indexOf(dataNode.sample.value) === -1) {
            values.push('' + dataNode.sample.value)
          }
        }
      });

      //console.log(values);
      //for each data sources do the alignment
      this.dataSources.forEach(function (dataSource) {
        let valuesAndPaths;
        let iterator;

        switch (dataSource.sourceDescription.type) {
          case 'csv':
            valuesAndPaths = Aligner._alignValuesWithCSVDataSource(dataSource, values);
            //console.log(valuesAndPaths);
            break;
          case 'json':
            if (dataSource.sourceDescription.iterator) {
              try {
                valuesAndPaths = Aligner._alignValuesWithJSONDataSource(dataSource, values);
              } catch (e) {
                throw new InvalidIteratorError(e.toString().split('\n').slice(1).join('\n'), dataSource.sourceDescription.iterator);
              }
            } else {
              let result = pinta.iteratorAndPaths(dataSource.object, values);
              iterator = result.iterator;
              valuesAndPaths = result.paths;
            }
            break;
          default:
            break;
        }

        //for each value and path update nodes
        if (valuesAndPaths) {
          valuesAndPaths.forEach(function (vp) {
            //console.log(vp)
            if (classNodeValue === vp.value) {
              //console.log('t');
              if (classNode.templates === undefined) {
                classNode.templates = [];
              }

              classNode.templates.push({
                template: classNode.sample.value.substring(0, position + 1) + '{' + vp.path + '}',
                dataSourceID: dataSource.id,
                iterator: iterator
              });
            }
            //iterate over all data nodes
            dataNodes.forEach(function (dataNode) {
              if (dataNode.sample.value === vp.value) {
                if (dataNode.labels === undefined) {
                  dataNode.labels = [];
                }

                dataNode.labels.push({label: vp.path, dataSourceID: dataSource.id, iterator: iterator});
              }
            });
          });
        }
      });
    });
  }

  /**
   * This method aligns the given Semantic Model with the data sources.
   * @param semanticmodel: the Semantic Model to align
   * @param findJoinConditions: if true join conditions are search for else not
   */
  align(semanticmodel, findJoinConditions = true) {
    this._alignWithAllDataSources(semanticmodel);
    this._selectSingleDataSourceForEachNode(semanticmodel);

    if (findJoinConditions) {
      this._createJoinConditions(semanticmodel);
    }
  }

  /**
   * This method creates the join conditions for the given semantic model.
   * This method only works after the alignment is done.
   * @param semanticmodel: the Semantic Model in which we look for join conditions
   * @private
   */
  _createJoinConditions(semanticmodel) {
    //we only need to check the edges between two entities
    let edges = semanticmodel.getEdgesBetweenTypes(type.CLASS, type.CLASS);

    edges.forEach(edge => {
      let sourceNode = semanticmodel.get(edge.source);
      let targetNode = semanticmodel.get(edge.target);

      //only when for both nodes the sources are found we can look for the join conditions
      if (sourceNode.sourceDescription && targetNode.sourceDescription) {
        //get the data sources of each node
        let sourceData = this._getDataSourceByID(sourceNode.sourceDescription.id);
        let targetData = this._getDataSourceByID(targetNode.sourceDescription.id);

        //get the values between which we need to compare
        let sourceValues = Aligner._getValues(sourceData);
        let targetValues = Aligner._getValues(targetData);

        //look for a match
        let match = Aligner._match(sourceValues, targetValues);

        //if match is found
        if (match) {
          if (sourceData.sourceDescription.type === 'json') {
            //we need to cut '$.' from the paths
            match.child = match.child.substr(2);
          }

          if (targetData.sourceDescription.type === 'json') {
            //we need to cut '$.' from the paths
            match.parent = match.parent.substr(2);
          }

          edge.joinConditions.push(match);
        }
      }
    });
  }

  /**
   * This method returns the data values to use to find join conditions
   * @param datasource: the data source from which the values are wanted
   * @returns {*}: the values
   * @private
   */
  static _getValues(datasource) {
    if (datasource.sourceDescription.type === 'csv') {
      return datasource.row;
    } else {
      //for json we take the values of the first object
      let sourceObject = jsonpath.query(datasource.object, datasource.sourceDescription.iterator)[0];
      return pinta.searchValuesAndPaths(sourceObject);
    }
  }

  /**
   * This method looks for a match between two sets of values.
   * @param source: the first set of values
   * @param target: the second set of values
   * @returns {undefined}: the match
   * @private
   */
  static _match(source, target) {
    let match = undefined;
    let i = 0;

    while (i < source.length && !match) {
      let j = 0;

      while (j < target.length && ('' + source[i].value) !== ('' + target[j].value)) {
        j++;
      }

      if (j < target.length) {
        match = {
          child: source[i].column ? source[i].column : source[i].path,
          parent: target[j].column ? target[j].column : target[j].path
        };
      } else {
        i++;
      }
    }

    return match;
  }

  /**
   * This method is used to select the best data source of all nodes.
   * This method can only be used once we tried to align all nodes with all data sources.
   * @param semanticmodel: the semantic model for which we want to select the best data sources
   * @private
   */
  _selectSingleDataSourceForEachNode(semanticmodel) {
    let classNodes = semanticmodel.getAllNodes(type.CLASS);

    //we iterate over all the class nodes
    classNodes.forEach(classNode => {
      //get edges that start from the class node
      let edges = semanticmodel.getEdgesWithNodeAsSource(classNode.id);
      let dataSourceCounter = {};
      //data nodes that are the target of an edge starting in class node
      let dataNodes = [];
      let updateDataSourceCounter = function (item) {
        if (dataSourceCounter[item.dataSourceID] === undefined) {
          dataSourceCounter[item.dataSourceID] = 0;
        }

        dataSourceCounter[item.dataSourceID]++;
      };

      if (classNodes.templates) {
        classNodes.templates.forEach(updateDataSourceCounter);
      }

      //we iterate over each edge and check for data nodes
      edges.forEach(function (edge) {
        let dataNode = semanticmodel.get(edge.target);

        if (dataNode.type === type.DATAREFERENCE) {
          if (dataNode.labels) {
            dataNode.labels.forEach(updateDataSourceCounter);
          }

          dataNodes.push(dataNode);
        }
      });

      let bestDataSourceID;

      //we determine the ID of the best data source
      Object.keys(dataSourceCounter).forEach(function (key) {
        if (bestDataSourceID === undefined || dataSourceCounter[bestDataSourceID] < dataSourceCounter[key]) {
          bestDataSourceID = key;
        }
      });

      //we update all the nodes so they only refer to the best data source
      if (bestDataSourceID) {
        let bestDataSource = this._getDataSourceByID(bestDataSourceID);

        if (classNode.templates) {
          let i = 0;

          while (i < classNode.templates.length && classNode.templates[i].dataSourceID !== bestDataSourceID) {
            i++;
          }

          if (i < classNode.templates.length) {
            classNode.template = classNode.templates[i].template;
            classNode.sourceDescription = bestDataSource.sourceDescription;
            classNode.sourceDescription.id = bestDataSourceID;

            if (!bestDataSource.sourceDescription.iterator) {
              classNode.sourceDescription.iterator = classNode.templates[i].iterator;
            }
          }
        }

        //we iterate over all data nodes and give them the best data source
        dataNodes.forEach(function (dataNode) {
          if (dataNode.labels) {
            let i = 0;

            while (i < dataNode.labels.length && dataNode.labels[i].dataSourceID !== bestDataSourceID) {
              i++;
            }

            if (i < dataNode.labels.length) {
              dataNode.label = dataNode.labels[i].label;
              dataNode.sourceDescription = bestDataSource.sourceDescription;
              if (!bestDataSource.sourceDescription.iterator) {
                dataNode.sourceDescription.iterator = dataNode.labels[i].iterator;
              }
            }
          }
        });
      }
    });
  }

  /**
   * This method returns a data source based on a given id.
   * @param id: the id of the data source
   * @returns {*}: the found data source
   * @private
   */
  _getDataSourceByID(id) {
    let i = 0;

    while (i < this.dataSources.length && this.dataSources[i].id !== id) {
      i++;
    }

    if (i < this.dataSources.length) {
      return this.dataSources[i];
    } else {
      return null;
    }
  }

  /**
   * This method aligns a given set of values with a given CSV data source.
   * @param dataSource: the CSV data source with which to align the values
   * @param values: the values which need to be aligned with the data source
   * @private
   */
  static _alignValuesWithCSVDataSource(dataSource, values) {
    let jsonObject = {};

    dataSource.row.forEach(function (item) {
      jsonObject[item.column] = item.value;
    });

    let results = pinta.paths(jsonObject, values);

    results.forEach(function (r) {
      r.path = r.path.replace('$.', '');
    });

    return results;
  }

  /**
   * This method aligns the given values with a given JSON data source.
   * @param dataSource: the JSON data source with which to align the values
   * @param values: the values that need to be aligned with the data source
   * @returns {Array}
   * @private
   */
  static _alignValuesWithJSONDataSource(dataSource, values) {
    //console.log(values);
    let queryResult = jsonpath.query(dataSource.object, dataSource.sourceDescription.iterator);

    if (queryResult.length === 0) {
      return [];
    } else {
      let jsonObject = queryResult[0];
      let results = pinta.paths(jsonObject, values);

      results.forEach(function (r) {
        r.path = r.path.replace('$.', '');
      });

      return results;
    }
  }
}

module.exports = Aligner;