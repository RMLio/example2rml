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
    let self = this;

    //get all values, from class nodes and data nodes
    classNodes.forEach(function (classNode) {
      let values = [];
      let dataNodes = [];
      let edges = semanticmodel.getEdgesWithNodeAsSource(classNode.id);
      let hashPosition = classNode.sample.lastIndexOf('#');
      let slashPosition = classNode.sample.lastIndexOf('/');
      let position = hashPosition > slashPosition ? hashPosition : slashPosition;
      let classNodeValue = classNode.sample.substring(position + 1);
      //console.log(`classNodeValue = ${classNodeValue}`);

      values.push(classNodeValue);

      edges.forEach(function (edge) {
        let dataNode = semanticmodel.get(edge.target);

        if (dataNode.type === type.DATAREFERENCE) {
          dataNodes.push(dataNode);

          if (values.indexOf(dataNode.sample) === -1) {
            values.push('' + dataNode.sample)
          }
        }
      });

      //console.log(values);
      //for each data sources do the alignment
      self.dataSources.forEach(function (dataSource) {
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
                template: classNode.sample.substring(0, position + 1) + '{' + vp.path + '}',
                dataSourceID: dataSource.id,
                iterator: iterator
              });
            }
            //iterate over all data nodes
            dataNodes.forEach(function (dataNode) {
              if (dataNode.sample === vp.value) {
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

  align(semanticmodel, findJoinConditions = true) {
    this._alignWithAllDataSources(semanticmodel);
    this._selectSingleDataSourceForEachNode(semanticmodel);

    if (findJoinConditions) {
      this._createJoinConditions(semanticmodel);
    }
  }

  _createJoinConditions(semanticmodel) {
    let edges = semanticmodel.getEdgesBetweenTypes(type.CLASS, type.CLASS);

    edges.forEach(edge => {
      let sourceNode = semanticmodel.get(edge.source);
      let targetNode = semanticmodel.get(edge.target);

      if (sourceNode.sourceDescription && targetNode.sourceDescription) {
        let sourceData = this._getDataSourceByID(sourceNode.sourceDescription.id);
        let targetData = this._getDataSourceByID(targetNode.sourceDescription.id);

        let sourceValues;
        let targetValues;

        if (sourceData.sourceDescription.type === 'csv') {
          sourceValues = sourceData.row;
        } else {
          let sourceObject = jsonpath.query(sourceData.object, sourceData.sourceDescription.iterator)[0];
          sourceValues = pinta.searchValuesAndPaths(sourceObject);
        }

        if (targetData.sourceDescription.type === 'csv') {
          targetValues = targetData.row;
        } else {
          let targetObject = jsonpath.query(targetData.object, targetData.sourceDescription.iterator)[0];
          targetValues = pinta.searchValuesAndPaths(targetObject);
        }

        let match = Aligner._match(sourceValues, targetValues);

        if (match) {
          if (sourceData.sourceDescription.type === 'json') {
            match.child = match.child.substr(2);
          }

          if (targetData.sourceDescription.type === 'json') {
            match.parent = match.parent.substr(2);
          }
          
          //console.log(match);
          edge.joinConditions.push(match);
        }
      }
    });
  }

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

  _selectSingleDataSourceForEachNode(semanticmodel) {
    let classNodes = semanticmodel.getAllNodes(type.CLASS);
    let self = this;

    classNodes.forEach(function (classNode) {
      let edges = semanticmodel.getEdgesWithNodeAsSource(classNode.id);
      let dataSourceCounter = {};
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

      Object.keys(dataSourceCounter).forEach(function (key) {
        if (bestDataSourceID === undefined || dataSourceCounter[bestDataSourceID] < dataSourceCounter[key]) {
          bestDataSourceID = key;
        }
      });

      if (bestDataSourceID) {
        let bestDataSource = self._getDataSourceByID(bestDataSourceID);

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