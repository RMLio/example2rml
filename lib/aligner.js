/**
 * Created by pheyvaer on 31.03.17.
 */

let type = require('semanticmodel').nodeType.types;

class Aligner {

  constructor(dataSources) {
    this.dataSources = dataSources;
  }

  align(semanticmodel) {
    let classNodes = semanticmodel.getAllNodes(type.CLASS);
    let self = this;

    classNodes.forEach(function (classNode) {
      //console.log(classNode);
      let edges = semanticmodel.getEdgesWithNodeAsSource(classNode.id);
      //console.log(edges);
      self.dataSources.forEach(function (dataSource) {
        edges.forEach(function (edge) {
          let dataNode = semanticmodel.get(edge.target);
          if (dataNode.label === undefined || dataNode.label === null) {
            switch (dataSource.type) {
              case 'csv':
                dataNode.label = Aligner._alignDataNodeWithCSVDataSource(dataSource, dataNode);
                break;
              default:
                break;
            }

            if (dataNode.label !== null) {
              dataNode.dataSource = dataSource.id;
            }
          }
        });
      });
    });
  }

  static _alignDataNodeWithCSVDataSource(dataSource, dataNode) {
    let i = 0;

    while (i < dataSource.row.length && dataSource.row[i].value !== dataNode.sample) {
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