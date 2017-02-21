'use strict';
  angular.module('myApp').directive('lrsTable',
      function () {
          return {
              restrict: 'E',
              replace: true,
              scope: {
                  tableModel: '=',
                  fixedColumns: '=?' // Optional
              },
              templateUrl: function(tElement, tAttrs) {
                  if (tAttrs.fixedColumns) {
                      return 'scripts/directives/visualizations/templates/lrsTableFixedColumns.html';
                  }

                  return 'scripts/directives/visualizations/templates/lrsTable.html';
              }
          };
      }
  );

  // Copied from http://stackoverflow.com/questions/17417607/angular-ng-bind-html-and-directive-within-it?noredirect=1&lq=1
  app.directive('compile', ['$compile', function ($compile) {
      return function(scope, element, attrs) {
          scope.$watch(
              function(scope) {
                  // watch the 'compile' expression for changes
                  return scope.$eval(attrs.compile);
              },
              function(value) {
                  // when the 'compile' expression changes
                  // assign it into the current DOM
                  element.html(value);

                  // compile the new DOM and link it to the current
                  // scope.
                  // NOTE: we only compile .childNodes so that
                  // we don't get into infinite loop compiling ourselves
                  $compile(element.contents())(scope);
              }
          );
      };
  }]);
