/**
 * Created by cramera on 2/22/16.
 */

'use strict';
angular.module('myApp').directive('reportToolbar', ['$window',
    function ($window, $timeout) {

        var d3 = $window.d3;

        var createToolbar = function (container) {

            var table = container.append('table')
                .attr('id', 'toolbar-table');

            var tr = table.append('tr');

            var elems = ['Export', 'Set Reminder', 'Print', 'Learn More'];

            tr.selectAll('td')
                .data(elems)
                .enter()
                .append('td')
                .html(function (d) {
                    return d;
                });
        };

        var link = function (scope, elem, attr) {
            scope.$watch('reportData', function (reportMdl) {
                if (reportMdl) {
                    createToolbar(d3.select(elem[0]));
                }
            });
        };

        return {
            restrict: 'E',
            scope: {
                reportData: '='
            },
            link: link
        };
    }
]);
