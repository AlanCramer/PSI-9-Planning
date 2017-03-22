'use strict';

// Register a new Angular module named 'wac' along with its dependencies (None right now)
var app = angular.module('wac', []);

// Configure the $location service to use html5Mode. Needed in order to
// use $location.search() to obtain query params from modern URLs that
// respect the HTML 5 History API.
app.config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.html5Mode(true);
    }
]);

// Set up an injectable object of relative paths organized by category
app.constant('paths', {
    templates: {
        wacPrintReport: 'scripts/directives/templates/reports/wacPrintReport.html',
        lrsTable: 'scripts/directives/visualizations/templates/lrsTable.html'
    }
});

app.controller('wacCtrl', ['$scope', '$http', '$location', 'paths',
    function($scope, $http, $location, paths) {
        // Identify the URL that should be queried for WAC model data
        var queryParams = $location.search();
        $scope.modelUrl = queryParams['modelUrl'];
        console.log('modelUrl: ', $scope.modelUrl);

        // If a model URL was found, issue a GET request against that URL to obtain the data
        if ($scope.modelUrl) {
            $http.get($scope.modelUrl).then(function(response) {
                $scope.wacData = (response && response.data) || {};
                console.log('wacData: ', $scope.wacData);
            });
        }
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

// TODO: This needs to be modularized much better. Currently, it pollutes the global scope
// with each module's "exports", and dependencies are implicit (along with their load order). Not good.

// For example, using Gulp / Grunt (for a single, minified, concatenated JS file)
// or a module loader (such as RequireJS, for dynamic module loading)

addSharedReportServiceToModule('wac');
addLRSTableDirectiveToModule('wac');
addHorizBarChartDirectiveToModule('wac');
addReportTitleDirectiveToModule('wac');
addReportSummaryDirectiveToModule('wac');
