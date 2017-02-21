
'use strict';

// summaries have
// A summary section, width ~30%, with a title and subheading
// An array of sections, with Title and Description
angular.module('myApp').directive('reportSummary', ['$window',
    function ($window) {

        var d3 = $window.d3;

        var createSummaryBox = function (container) {
            var div = container.append('div')
                .attr('id', 'summary-div');

            var summaryTitleDiv = div.append('div')
                .classed('summary-title-div', true);

            summaryTitleDiv.append('h4')
                .style('font-weight', 'bold');
            summaryTitleDiv.append('p');

            var summaryInfoDiv = div.append('div')
                .classed('summary-info-div', true);
        };

        var updateSummaryBox = function (container, reportData) {
            var summaryTitleDiv = container.select('.summary-title-div');

            summaryTitleDiv.html('');

            summaryTitleDiv.append('h4')
                .style('font-weight', 'bold')
                .text(reportData.summaryTitle);
            summaryTitleDiv.append('p')
                .text(reportData.summary);

            var summaryInfoDiv = container.select('.summary-info-div');

            summaryInfoDiv.html('');

            reportData.sections.forEach(function(section) {
                var sectionInfoDiv = summaryInfoDiv.append('div')
                    .classed('section-info-div', true);

                sectionInfoDiv.append('div')
                    .classed('section-info', true)
                    .html(section.info);
                sectionInfoDiv.append('div')
                    .classed('section-desc', true)
                    .html(section.desc);
            });
        };

        var link = function (scope, elem, attr) {
            scope.$watch('summaryData', function (reportMdl) {
                if (reportMdl) {
                    var container = d3.select(elem[0]);

                    if (container.select('div#summary-div').empty()) {
                        createSummaryBox(container);
                    }

                    updateSummaryBox(container, reportMdl);
                }
            });
        };

        return {
            restrict: 'E',
            scope: {
                summaryData: '='
            },
            link: link
        };

        function getDataFromModel(modelJson) {

            if (modelJson.length < 1) {
                return {};
            }

            var reportData = {};
            // todo: where should this hardcoded string come from?
            reportData.summary =
                'This report summarizes student formative assessment scores in the Observer tool.';

            var totals = d3.map({
                'NEARLY_THERE' : 0,
                'NOT_YET' : 0,
                'ON_TRACK' : 0
            });

            modelJson.reduce(function(totals, d) {

                if (!d.rating) {
                    // assert bad data
                    console.log('Defect: bad data passed to Observer Report Directive.');
                    return totals;
                }

                // this can't be the best way to do this
                totals._[d.rating]++;
                return totals;
            }, totals);

            reportData.mostFreqRating = totals.entries().sort(function (a, b) {
                return d3.descending(a.value, b.value);
            })[0].key;

            reportData.goalsRated = modelJson.length;

            // todo: this data should come too
            reportData.totalNotesAndReminders = 0;

            return reportData;
        }
    }
]);
