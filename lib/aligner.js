/**
 * Created by pheyvaer on 31.03.17.
 */

let type = require('semanticmodel').nodeType.types;
let pinta = require('pinta-json');

class Aligner {

  /**
   * Constructor of Aligner.
   * @param dataSources: array of data sources where each data source has a type (data format), id.
   * When the data is a CSV is has a row attribute which is an array with JSON objects. These objects have a 'column' and 'value'.
   */
  constructor(dataSources) {
    this.dataSources = dataSources;

    this.dataSources.forEach(function(dataSource){
      if (dataSource.id === undefined) {
        dataSource.id = '' + new Date().getTime();
      }
    });
  }

  /**
   * Align each node of the semantic model with the data sources.
   * After this method, the nodes have label and dataSource set when a matching label was found.
   * @param semanticmodel: the semantic label that needs to be aligned with the data sources given via the constructor.
   */
  _alignWithAllDataSources(semanticmodel) {
    let classNodes = semanticmodel.getAllNodes(type.CLASS);
    let self = this;

    classNodes.forEach(function (classNode) {
      //console.log(classNode);
      let hashPosition = classNode.sample.lastIndexOf('#');
      let slashPosition = classNode.sample.lastIndexOf('/');

      let position = hashPosition > slashPosition ? hashPosition : slashPosition;
      let value = classNode.sample.substring(position + 1);
      //console.log('value: ' + value);

      self.dataSources.forEach(function (dataSource) {
        let result;

        switch (dataSource.sourceDescription.type) {
          case 'csv':
            result = Aligner._alignValueWithCSVDataSource(dataSource, value);
            break;
          case 'json':
            result = Aligner._alignValueWithJSONDataSource(dataSource, value, '');
            break;
          default:
            break;
        }

        if (result) {
          //classNode.template = classNode.sample.substring(0, position + 1) + '{' + result + '}';
          if (classNode.templates === undefined) {
            classNode.templates = [];
          }

          classNode.templates.push({template: classNode.sample.substring(0, position + 1) + '{' + result + '}', dataSourceID: dataSource.id});
        }
      });

      let edges = semanticmodel.getEdgesWithNodeAsSource(classNode.id);
      //console.log(edges);
      self.dataSources.forEach(function (dataSource) {
        edges.forEach(function (edge) {
          let dataNode = semanticmodel.get(edge.target);
          let label;

          if (dataNode.type === type.DATAREFERENCE) {
            switch (dataSource.sourceDescription.type) {
              case 'csv':
                label = Aligner._alignValueWithCSVDataSource(dataSource, dataNode.sample);
                break;
              case 'json':
                label = Aligner._alignValueWithJSONDataSource(dataSource.object, dataNode.sample);
                break;
              default:
                break;
            }

            if (label !== null) {
              //dataNode.sourceDescription = dataSource.sourceDescription;

              if (dataNode.labels === undefined) {
                dataNode.labels = [];
              }

              dataNode.labels.push({label: label, dataSourceID: dataSource.id});
            }
          }
        });
      });
    });
  }

  align(semanticmodel) {
    this._alignWithAllDataSources(semanticmodel);
    this._selectSingleDataSourceForEachNode(semanticmodel);
  }

  _selectSingleDataSourceForEachNode(semanticmodel) {
    let classNodes = semanticmodel.getAllNodes(type.CLASS);
    let self = this;

    classNodes.forEach(function (classNode) {
      let edges = semanticmodel.getEdgesWithNodeAsSource(classNode.id);
      let dataSourceCounter = {};
      let dataNodes = [];
      let updateDataSourceCounter = function(item){
        if (dataSourceCounter[item.dataSourceID] === undefined) {
          dataSourceCounter[item.dataSourceID] = 0;
        }

        dataSourceCounter[item.dataSourceID] ++;
      };

      if (classNodes.templates) {
        classNodes.templates.forEach(updateDataSourceCounter);
      }

      edges.forEach(function (edge) {
        let dataNode = semanticmodel.get(edge.target);

        if (dataNode.type === type.DATAREFERENCE) {
          dataNode.labels.forEach(updateDataSourceCounter);
          dataNodes.push(dataNode);
        }
      });

      let bestDataSourceID;

      Object.keys(dataSourceCounter).forEach(function(key){
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
          }
        }

        dataNodes.forEach(function(dataNode){
          if (dataNode.labels) {
            let i = 0;

            while (i < dataNode.labels.length && dataNode.labels[i].dataSourceID !== bestDataSourceID) {
              i++;
            }

            //console.log(i);

            if (i < dataNode.labels.length) {
              dataNode.label = dataNode.labels[i].label;
              dataNode.sourceDescription = bestDataSource.sourceDescription;
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

  /**
   * Search in the CSV data source for the label to put on the data node.
   * @param dataSource: the data source in which to look
   * @param value: the value for which the label is wanted
   * @returns {*}: null if no label is found, or the label in the data source
   * @private
   */
  static _alignValueWithCSVDataSource(dataSource, value) {
    let i = 0;

    //we check if the value in the row is the same as the sample in the node
    while (i < dataSource.row.length && dataSource.row[i].value !== value) {
      i++;
    }

    if (i < dataSource.row.length) {
      return dataSource.row[i].column;
    } else {
      return null;
    }
  }

  static _alignValueWithJSONDataSource(jsonObject, value) {
    let results = pinta.paths(jsonObject,[value]);

    if (results.length > 0) {
      return results[0].path.replace('$.', '');
    } else {
      return null;
    }
  }
}

module.exports = Aligner;