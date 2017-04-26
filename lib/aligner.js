/**
 * Created by pheyvaer on 31.03.17.
 */

let type = require('semanticmodel').nodeType.types;

class Aligner {

  /**
   * Constructor of Aligner.
   * @param dataSources: array of data sources where each data source has a type (data format), id.
   * When the data is a CSV is has a row attribute which is an array with JSON objects. These objects have a 'column' and 'value'.
   */
  constructor(dataSources) {
    this.dataSources = dataSources;
  }

  /**
   * Align each node of the semantic model with the data sources.
   * After this method, the nodes have label and dataSource set when a matching label was found.
   * @param semanticmodel: the semantic label that needs to be aligned with the data sources given via the constructor.
   */
  align(semanticmodel) {
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
        switch (dataSource.type) {
          case 'csv':
            let result =  Aligner._alignValueWithCSVDataSource(dataSource, value);

            if (result) {
              classNode.template = classNode.sample.substring(0, position + 1) + '{' + result + '}';
            }

            break;
          default:
            break;
        }

        if (classNode.template !== null) {
          classNode.sourceDescription = dataSource.sourceDescription;
        }
      });

      let edges = semanticmodel.getEdgesWithNodeAsSource(classNode.id);
      //console.log(edges);
      self.dataSources.forEach(function (dataSource) {
        edges.forEach(function (edge) {
          let dataNode = semanticmodel.get(edge.target);
          if (dataNode.label === undefined || dataNode.label === null) {
            switch (dataSource.type) {
              case 'csv':
                dataNode.label = Aligner._alignValueWithCSVDataSource(dataSource, dataNode.sample);
                break;
              default:
                break;
            }

            if (dataNode.label !== null) {
              dataNode.sourceDescription = dataSource.sourceDescription;
            }
          }
        });
      });
    });
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
}

module.exports = Aligner;