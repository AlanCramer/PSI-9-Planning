'use strict';

function addReportTitleDirectiveToModule(angularModuleName) {
    if (typeof angularModuleName !== 'string') {
        console.log('Invalid input: Provide a string identifying the Angular module\'s name');
        return;
    }

    var app = angular.module(angularModuleName);

    if (!app) {
        console.log('No Angular module found for module name: ', angularModuleName);
        return;
    }

    app.directive('reportTitle',
        function () {
            return {
                restrict: 'E',
                templateUrl: 'scripts/directives/visualizations/templates/title.html',
                scope: {
                    titleData: '='
                }
            };
        }
    );
}
