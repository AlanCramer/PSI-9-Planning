'use strict';

// Register a new Angular module named 'wac', which has no dependencies
var app = angular.module('wac', []);

// Set up an injectable object of relative paths organized by category
app.constant('paths', {
    data: {
        wacData: 'modelData/workshopAssessmentMergedModel.json'
    },
    templates: {
        wacPrintReport: 'scripts/directives/templates/reports/wacPrintReport.html',
        lrsTable: 'scripts/directives/visualizations/templates/lrsTable.html'
    }
});

app.controller('wacCtrl', ['$scope', '$http', 'paths',
    function($scope, $http, paths) {
        $http.get(paths.data.wacData).then(function(response) {
            $scope.wacData = (response && response.data) || {};
            console.log('wacData: ', $scope.wacData);
        });
    }
]);

app.directive('wacPrintReport', ['paths',
    function(paths) {
        return {
            restrict: 'E',
            scope: {
                wacData: '='
            },
            templateUrl: paths.templates.wacPrintReport
        };
    }
]);

app.directive('lrsTable', ['paths',
    function(paths) {
        return {
            restrict: 'E',
            scope: {
                tableModel: '='
            },
            templateUrl: paths.templates.lrsTable
        };
    }
]);

// Copied from http://stackoverflow.com/questions/17417607/angular-ng-bind-html-and-directive-within-it?noredirect=1&lq=1
app.directive('compile', ['$compile',
    function ($compile) {
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
    }
]);

