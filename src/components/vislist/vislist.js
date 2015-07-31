'use strict';

/**
 * @ngdoc directive
 * @name voyager.directive:visList
 * @description
 * # visList
 */
angular.module('voyager')
  .directive('visList', function (Fields, Visrec, vl, jQuery, consts, _, Logger) {
    return {
      templateUrl: 'components/vislist/vislist.html',
      restrict: 'E',
      replace: true,
      scope: {},
      link: function postLink(scope , element /*, attrs*/) {
        scope.Fields = Fields;
        scope.Visrec = Visrec;
        scope.consts = consts;
        scope.shorthands = vl.field.shorthands;
        scope.limit = consts.numInitClusters;
        // Flag to show loading spinner when the chart is rendered
        scope.rendering = false;

        element.bind('scroll', function(){
           if(jQuery(this).scrollTop() + jQuery(this).innerHeight() >= jQuery(this)[0].scrollHeight){
            if (scope.limit < Visrec.fieldSets.length) {
              scope.increaseLimit();
            }
           }
        });

        scope.increaseLimit = function() {
          if(scope.limit + consts.numMoreClusters > Visrec.numClustersGenerated) {
            Visrec.update.clusters(scope.limit + consts.numMoreClusters);
          }

          scope.limit += consts.numMoreClusters;
          Logger.logInteraction(Logger.actions.LOAD_MORE, scope.limit);
        };

        scope.select = function(fieldSet, cluster/*, $index*/) {
          Logger.logInteraction(Logger.actions.DRILL_DOWN_OPEN, fieldSet.key);
          Visrec.selectedFieldSet = fieldSet;
          Visrec.selectedCluster = cluster;
        };

        scope.isInList = function(fieldSetKey) {
          return fieldSetKey in Visrec.chartClusters;
        };

        function updateFields() {
          scope.limit = consts.numInitClusters;
          element.scrollTop(0); // scroll the the top
          var fieldList = Fields.update();
          Visrec.update.projections(fieldList);
        }

        var dUpdateFields = _.debounce(updateFields, 200, {maxWait: 1500});

        scope.$watch('Fields.fields', function(fields, oldFields) {
          if (!oldFields || _.keys(oldFields).length === 0 ) { // first time!
            updateFields();
          } else {
            dUpdateFields();
          }
        }, true);

      }
    };
  });
