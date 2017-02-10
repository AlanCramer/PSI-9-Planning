'use strict';
app.factory('sharedReportApiSrv',

    function () {

        /* jshint maxstatements: 75 */
        // If you are adding to this service, make sure to add your method here!
        var service = {

            // Shared report functions
            initialize: initialize,
            getLRSConfig: getLRSConfig,
            formatLexile: formatLexile,
            formatDateMMDDYY: formatDateMMDDYY,
            setDefaultDateRange: setDefaultDateRange,
            pruneByDate: pruneByDate,
            resolveLowSkillTies: resolveLowSkillTies,
            configureShowModal: configureShowModal,
            setNumberValue: setNumberValue,
            roundNumberIfPossible: roundNumberIfPossible,
            createLegend: createLegend,
            createLookupTable: createLookupTable,
            partitionLookupTables: partitionLookupTables,

            // Leader central shared report functions
            parseLeaderDashboardSummaryResult: parseLeaderDashboardSummaryResult,
            parseLeaderDashboardDetailsResult: parseLeaderDashboardDetailsResult,
            getRIData: getRIData,
            parseLeaderDashboardDailySessionLengthsResult: parseLeaderDashboardDailySessionLengthsResult,
            getLCReportData: getLCReportData,
            processLCTableData: processLCTableData,
            getDistrictLicenseCounts: getDistrictLicenseCounts,
            getSchoolLicenseCounts: getSchoolLicenseCounts,
            getClassLicenseCounts: getClassLicenseCounts,
            countLicenses: countLicenses,
            compressSessionData: compressSessionData,
            createLinearChartModel: createLinearChartModel,

            // Sorting functions
            createCustomSorter: createCustomSorter,
            reverseCustomSorter: reverseCustomSorter,
            stringSort: stringSort,
            enumSort: enumSort,
            roundedNumberSort: roundedNumberSort,
            numberSort: numberSort,
            dateSort: dateSort,
            fractionStringSort: fractionStringSort,
            typeCheckForSorting: typeCheckForSorting,

            // Converting between fractions and percentages
            parseFractionString: parseFractionString,
            formatFractionAsPercentage: formatFractionAsPercentage,

            // LRSTable constructor and helper functions
            LRSTable: LRSTable,
            defaultHeaderClickHandler: defaultHeaderClickHandler,

            // LRSTable template functions for producing Angular-like HTML strings
            drilldownLink: drilldownLink,
            unlicensedStudentName: unlicensedStudentName,
            columnHeading: columnHeading,
            caretImage: caretImage,
            irToggleLinks: irToggleLinks,
            irFooterCell: irFooterCell,
            percentageOnHover: percentageOnHover,

            // Custom Intellify Endpoints
            downloadService: downloadService,
            getDownloadStatusEndpoint: getDownloadStatusEndpoint
        };

        service.LRSTable.prototype = {
            sortBy: function (key, sortFunc, order) {
                if (this.sortedBy === key) {
                    this.sortAscending = order ? (order !== 'descending') : !this.sortAscending;
                } else {
                    this.sortedBy = key;
                    this.sortAscending = (order !== 'descending');
                }

                var sortAscending = this.sortAscending;

                this.body.sort(function(a, b) {
                    // Or should it be:
                    // return sortFunc(a.data[key], b.data[key], sortAscending); // Would require changes to createCustomSorter
                    return sortFunc(a.data, b.data, sortAscending);
                });
            }
        };

        service.streamIds = {
            'district': {
                'summary': '586fbdf04fb6b86d0bf901fc',
                'details': '586fbe124fb6b86d0bf901fe',
                'dailyAvgSessions': '587febab69e77a55ca727b01',
                'csv': '586fbe324fb6b86d0bf90200/csv'
            },
            'school': {
                'summary': '586fbdb04fb6b86d0bf901f8',
                'details': '586fbdcf4fb6b86d0bf901fa',
                'dailyAvgSessions': '587feb7a69e77a55ca727af3'
            },
            'class': {
                'summary': '586fbd2f4fb6b86d0bf901f4',
                'details': '586fbd914fb6b86d0bf901f6',
                'dailyAvgSessions': '587feb1c69e77a55ca727ad6'
            },
            'student': {
                'summary': '586eec177e33ea3647fdff87'
            }
        };

        service.postprocessParams = {
            'district': {
                'summary': {
                    'iterating_base_json_path': '$.aggregations.consolidated[*]'
                },
                'details': {
                    'iterating_base_json_path': '$.aggregations.consolidated.value.schools[*]'
                },
                'dailyAvgSessions': {
                    'iterating_base_json_path': '$.aggregations.totalTimeSpentPerDay.years.buckets[*]'
                }
            },
            'school': {
                'summary': {
                    'iterating_base_json_path': '$.aggregations.consolidated[*]'
                },
                'details': {
                    'iterating_base_json_path': '$.aggregations.consolidated.value.classes[*]',
                    'joins': [
                        {
                            'stream_id': '586fbeb64fb6b86d0bf90202',
                            'iterating_base_json_path': '$.hits.hits[*]._source',
                            'primary_stream_field_json_path': '$.class.@id',
                            'join_stream_field_json_path': '$.id'
                        }
                    ],
                    'result_transformer': 'LeaderCentralResultTransformer'
                },
                'dailyAvgSessions': {
                    'iterating_base_json_path': '$.aggregations.totalTimeSpentPerDay.years.buckets[*]'
                }
            },
            'class': {
                'summary': {
                    'iterating_base_json_path': '$.aggregations.consolidated[*]',
                    'joins': [
                        {
                            'stream_id': '586fbeb64fb6b86d0bf90202',
                            'iterating_base_json_path': '$.hits.hits[*]._source',
                            'primary_stream_field_json_path': '$.class[*].@id',
                            'join_stream_field_json_path': '$.@id'
                        }
                    ],
                    'result_transformer_class': 'LeaderCentralResultTransformer'
                },
                'details': {
                    'iterating_base_json_path': '$.aggregations.consolidated.value.students[*]',
                    'joins': [
                        {
                            'stream_id': '586fbeb64fb6b86d0bf90202',
                            'iterating_base_json_path': '$.hits.hits[*]._source',
                            'primary_stream_field_json_path': '$.class[*].@id',
                            'join_stream_field_json_path': '$.@id'
                        }
                    ],
                    'result_transformer_class': 'LeaderCentralResultTransformer'
                },
                'dailyAvgSessions': {
                    'iterating_base_json_path': '$.aggregations.totalTimeSpentPerDay.years.buckets[*]'
                }
            },
            'student': {
                'summary': {
                    'iterating_base_json_path': '$.aggregations.consolidated[*]',
                    'joins': [
                        {
                            'stream_id': '586fbeb64fb6b86d0bf90202',
                            'iterating_base_json_path': '$.hits.hits[*]._source',
                            'primary_stream_field_json_path': '$.class[*].@id',
                            'join_stream_field_json_path': '$.@id'
                        }
                    ],
                    'result_transformer_class': 'LeaderCentralResultTransformer'
                }
            }
        };

//        var sensor = ScholasticSensor;

        var intellifyBase = 'https://hmh2.intellifylearning.com';

        return service;

        /* Begin shared functions */

        // WA, IRC, IRS, E3D, Observer, R180 Widget, RI Widget
        function initialize(isLCStream) {
            $log.debug('Scholastic initialize called');
            var deferred = $q.defer();
            $q.all([
                service.getLRSConfig()
            ]).then(
                function (data) {
                    var config;

                    if (isLCStream) {
                        config = init(data);
                        deferred.resolve(config);
                    } else {
                        config = sensor.initialize(data[0]);
                        deferred.resolve(config);
                    }
                }
            );
            return deferred.promise;
        }

        // Sachin's 'init.js'
        function init(data) {
            var config = _.merge(data[0], {
                host: 'hmh2.intellifylearning.com',
                apiKey: 'yScTs-BpQVaSg0PIlDlfzw',
                sensorId: 'com.hmh.wa',
                ssl: true
            });
            return sensor.initialize(config);
        }

        // WA, IRC, IRS, E3D, Observer, R180 Widget, RI Widget
        function getLRSConfig(maxRetries) {
            var deferred = $q.defer();
            maxRetries = (maxRetries === undefined) ? 3 : maxRetries;
            httpSrv.callAPI('GET',
                httpConfig.url.observe.lrsEndpoint)
                .then(
                    function (data) {
                        var initConfig = {};
                        initConfig.appId = 'http://scholastic.com/apps/observinator/v1';
                        initConfig.sensorId = 'com.scholastic.observinator.dev1';
                        initConfig.streamName = 'xxx-test-hmh-observinator-event-eventdata-5613436f0cf2bffa8000e246';
                        if (!_.isUndefined(data.lrsEndpoint)) {
                            var config = _.merge(initConfig, data);
                            deferred.resolve(config);
                        } else {
                            deferred.reject(new Error('Error getting config parameters for LRS endpoint.'));
                        }
                    },
                    function (error) {
                        // window.alert('getLRSConfig error: check console');
                        console.log(error);
                        console.log('maxRetries: ', maxRetries);

                        maxRetries -= 1;
                        if (maxRetries > 0) {
                            var newDeferred = getLRSConfig(maxRetries);
                            newDeferred.then(function (data) {
                                deferred.resolve(data);
                            }, function(error) {
                                deferred.reject(error);
                            });
                        } else {
                            deferred.reject(error);
                        }

                    }
                );
            return deferred.promise;
        }

        // IRC, IRS
        // from https://confluence.education.scholastic.com/display/INTEL/LRS+Data+Display+Rules+for+Numerals
        // Lexiles equal to 0 or less than zero will show as BR.
        // Lexiles 1 to 99 will display as BR(x) with the x representing the Lexile score.
        // Lexiles values 101 through 999 show up as the integer value unaltered.
        // Lexiles 1000 through 1700 will show up as the integer value without any commas.

        // input is an integer, output is string obeying the formatting rules
        function formatLexile(lex) {
            if (typeof lex !== 'number') {
                console.log('Bad input: Expected \'lex\' to be of type \'number\'');
                return lex;
            }

            var result;

            if (lex <= 0) {
                result = 'BR';
            }

            if (lex > 0 && lex < 100) {
                result = 'BR(' + lex + ')';
            }

            if (lex > 100 && lex <= 1700) {
                result = lex.toString() + 'L';
            }

            if (lex > 1700) {
                result = '1700+' + 'L';
            }

            return result;
        }

        function formatDateMMDDYY(date) {
            return (date.getMonth() + 1).toString() + '/' +
            date.getDate().toString() + '/' +
            date.getFullYear().toString().substr(2, 2);
        }

        // IRC, IRS, Observer
        function setDefaultDateRange() {
            var currMonth = window.moment().month();
            var currYear = window.moment().year();

            var endDate = window.moment();
            var startDate = window.moment().month(7);
            startDate = startDate.day(1);

            if (currMonth < 8) {
                startDate = startDate.subtract(1, 'y');
            }
            endDate = endDate.endOf('day');
            startDate = startDate.startOf('day');

            return {
                startDate: startDate,
                endDate: endDate,
                minDate: startDate,
                maxDate: endDate
            };
        }

        // IRC, IRS, Observer
        function pruneByDate(data, dates, startDate, endDate) {
            // 'dates' should be an array with epoch times that pair up with the elements in
            // 'data' by index. Each date that is not within the window defined by 'startDate'
            // and 'endDate' will result in its corresponding 'data' element being filtered out.
            if (data.length !== dates.length) {
                console.log('[sharedReportApiSrv.js:pruneByDate] Expected dates to have the same length as data!');
            }

            var validDates = dates.map(function(date) {
                //Use a more current version of moment !!!!
                var after = moment(date).isAfter(startDate, 'day');
                var same1 = moment(date).isSame(startDate, 'day');
                var before = moment(date).isBefore(endDate, 'day');
                var same2 = moment(date).isSame(endDate, 'day');

                return (after || same1) && (before || same2);
            });

            return data.filter(function(_, index) {
                return validDates[index];
            });
        }

        // WA, E3D
        function resolveLowSkillTies(skills, key, skillPriorities) {
            var fileAndFuncStr = '[sharedReportApiSrv.js:resolveLowSkillTies]';

            if (skills.length <= 1) {
                console.log(fileAndFuncStr + ' No ties to resolve.');
                return skills;
            }

            if (typeof key !== 'string') {
                console.log(fileAndFuncStr + ' Key should be a string.');
                return skills;
            }

            if (typeof skillPriorities[key] !== 'object') {
                // If skillPriorities does not have a valid entry for 'key',
                // we don't have a list of priorities to consult. Thus, we don't attempt
                // to break ties at all, and return the 'skills' unmodified.
                console.log(fileAndFuncStr + ' ' + key + ' not found within the skill priority list.');
                return skills;
            }

            var defaultTargetSkill = {
                skill: '',
                priority: Infinity
            };

            var prioritizedSkills = skills.map(function(skill) {
                var priorityValue = skillPriorities[key][skill];

                // If the skill is not listed within the priority list,
                // mark its priority value as null so it can be detected downstream.
                return {
                    skill: skill,
                    priority: typeof priorityValue === 'number' ? priorityValue : null
                };
            });

            var targetSkill = prioritizedSkills.reduce(function(targetSkillInfo, skillInfo) {
                if (skillInfo.priority === null) {
                    console.log(fileAndFuncStr + ' Unexpected skill: ' + skillInfo.skill);
                    return targetSkillInfo;
                }

                return skillInfo.priority < targetSkillInfo.priority ? skillInfo : targetSkillInfo;
            }, defaultTargetSkill);

            console.log(targetSkill.skill + ' won the tiebreaker among: ', skills);
            return [targetSkill.skill];
        }

        function configureShowModal(scope, entries, modalTitle) {
            return function showModal() {
                ModalService.showModal({
                    templateUrl: 'scripts/directives/templates/reports/leaderCentral/learnMoreModal.html',
                    scope: scope,
                    inputs: {
                        entries: entries,
                        modalTitle: modalTitle
                    },
                    controller: function modalController($scope, entries, modalTitle, close) {
                        $scope.entries = entries;
                        $scope.modalTitle = modalTitle;
                        $scope.close = function(result) {
                            close(result, 500); // close, but give 500ms for bootstrap to animate
                        };
                    }
                }).then(function(modal) {
                    modal.element.modal();
                    // modal.close.then(function(result) {
                    //     // For now, nothing needs to be done. However, this callback
                    //     // can be used to receive user input entered into the modal, if needed.
                    // });
                });
            };
        }

        function setNumberValue(value, defaultValue) {
            return ((typeof value === 'number') &&
                    (!isNaN(value))) ? value : defaultValue;
        }

        function roundNumberIfPossible(value, precision) {
            return (typeof value === 'number') ? _.round(value, precision) : value;
        }

        // fields looks like { name: <text>, cssClass: 'classname' }
        function createLegend(container, fields) {

            var legendContainer = container.append('div')
                .attr('class', 'legend');

            var legendCells = legendContainer.selectAll('div')
                .data(fields)
                .enter()
                .append('div')
                .style('display', 'inline');

            var svg = legendCells.append('svg')
                .style('padding', '0')
                .style('margin', '0')
                .style('width', '10px')
                .style('height', '10px');

            svg.append('rect')
                .attr('width', 10)
                .attr('height', 10)
                .attr('class', function(d) {return d.cssClass;})
                .attr('x', '0')
                .attr('y', '0');

            legendCells.append('span')
                .attr('class', 'legend-label')
                .style('padding-left', '5px')
                .style('padding-right', '10px')
                .text(function (d) {return d.name;});
        }

        /*
            // Assuming 'data' is an array of structured objects that each
            // have some ID-like property, 'createLookupTable' uses a user-provided
            // 'idExtractor' function to iterate over 'data'. It first retrieves a datum's ID.
            // Then, it adds that ID along with the corresponding datum to a lookup table.

            Example return value:
            {
                '8loeckeake1r8gv75hvij4j1_1grk0f0': <corresponding School object with matching ID>
            }
        */
        function createLookupTable(data, idExtractor) {
            if (typeof idExtractor !== 'function') {
                // Default idExtractor function - you probably don't want to use this
                idExtractor = function(datum) {
                    return datum.id;
                };
            }

            return data.reduce(function(idTable, datum) {
                var id = idExtractor(datum);

                if (idTable[id]) {
                    console.log('Odd situation: A value already exists for this ID!', idTable, datum);
                    console.log('Old data is being overwritten!');
                }

                idTable[id] = datum;

                return idTable;
            }, {});
        }

        function partitionLookupTables(tableA, tableB, tableAName, tableBName) {
            /*
                // tableA and tableB structure:

                {
                    '8743ncr87hdfc7hq001': <some object>,
                    ... (many id-object pairs)
                }
            */
            var aMinusB = {},
                aIntersectB = {},
                bMinusA = {},
                tableANameLabel = typeof tableAName === 'string' ? tableAName : 'A',
                tableBNameLabel = typeof tableBName === 'string' ? tableBName : 'B',
                valueA,
                valueB;

            for (var aId in tableA) {
                if (tableA.hasOwnProperty(aId)) {
                    valueA = tableA[aId];
                    valueB = tableB[aId];

                    // If the ID exists in A but not in B
                    if (valueA && !valueB) {
                        aMinusB[aId] = valueA; // Add this ID and its value to the set 'A minus B'
                    }

                    // If the ID exists in A and B
                    if (valueA && valueB) {
                        // Add this ID and its values to the set 'A intersect B'
                        // (we don't assume the values will be identical for the same ID
                        // between the tables, so we store both values in a 2-element array)
                        aIntersectB[aId] = [valueA, valueB];
                    }
                }
            }

            for (var bId in tableB) {
                if (tableB.hasOwnProperty(bId)) {
                    valueA = tableA[bId];
                    valueB = tableB[bId];

                    // If the ID exists in B but not in A
                    if (!valueA && valueB) {
                        bMinusA[bId] = valueB; // Add this ID and its value to the set 'B minus A'
                    }
                }
            }

            // Construct user-friendly labels for the return object
            var aMinusBLabel = tableANameLabel + ' minus ' + tableBNameLabel,
                aIntersectBLabel = tableANameLabel + ' intersect ' + tableBNameLabel,
                bMinusALabel = tableBNameLabel + ' minus ' + tableANameLabel,
                partitions = {};

            partitions[aMinusBLabel] = aMinusB;
            partitions[aIntersectBLabel] = aIntersectB;
            partitions[bMinusALabel] = bMinusA;
            partitions.aMinusB = function() {
                return aMinusB;
            };
            partitions.aIntersectB = function() {
                return aIntersectB;
            };
            partitions.bMinusA = function() {
                return bMinusA;
            };

            return partitions;
        }

        /* Leader Central */
        // Parsing Intellify's Leader Central API
        // One method for each of summary, details, and daily average sessions data
        // Adapted from Sachin's example archive
        function parseLeaderDashboardSummaryResult(rawData) {
            var data = JSON.parse(rawData);

            var results = {};
            results.data = [];

            if (!data[0]) {
                return results;
            }

            var eventData = data[0];
            var forSingleStudent = Boolean(eventData.student);

            var summaryData = {
                student: eventData.student,
                class: eventData.class,
                school: eventData.school,
                district: eventData.district,
                studentEnrollment: setNumberValue(eventData.numberOfStudents, '-'),
                r180: {
                    totalTimeSpent: typeof eventData.totalTimeSpent === 'number' ?
                                        (eventData.totalTimeSpent / 60000) : '-',
                    totalSessions: setNumberValue(eventData.totalSessions, '-'),
                    averageTotalSessions: setNumberValue(eventData.averageTotalSessions, '-'),
                    totalSegmentsStarted: setNumberValue(eventData.totalSegmentsStarted, '-'), // not used for anything
                    totalSegmentsCompleted: setNumberValue(eventData.totalSegmentsCompleted, '-'),
                    averageSegmentsCompleted: setNumberValue(eventData.averageSegmentsCompleted, '-'),
                    averageSessionsPerWeek: setNumberValue(eventData.averageSessionsPerWeek, '-'),
                    averageSessionsPerWeekNumerator: eventData.averageSessionsPerWeekNumerator || '-',
                    averageSessionLength: typeof eventData.averageSessionLength === 'number' ?
                                            (eventData.averageSessionLength / 60000) : '-',
                    averageSessionLengthNumerator: setNumberValue(eventData.averageSessionLengthNumerator, '-')
                },
                ri: getRIData(eventData, forSingleStudent)
            };

            results.data.push(summaryData);

            return results;
        }

        function parseLeaderDashboardDetailsResult(rawData) {
            var data = JSON.parse(rawData);

            var results = {};
            results.data = [];

            data.forEach(function(item) {
                var eventData = item;
                var forSingleStudent = Boolean(eventData.student);

                var detailData = {
                    student: eventData.student,
                    class: eventData.class,
                    school: eventData.school,
                    district: eventData.district,
                    studentEnrollment: setNumberValue(eventData.numberOfStudents, '-'),
                    r180: {
                        totalTimeSpent: typeof eventData.totalTimeSpent === 'number' ?
                                            (eventData.totalTimeSpent / 60000) : '-',
                        totalSessions: setNumberValue(eventData.totalSessions, '-'),
                        averageTotalSessions: setNumberValue(eventData.averageTotalSessions, '-'),
                        totalSegmentsCompleted: setNumberValue(eventData.totalSegmentsCompleted, '-'),
                        averageSegmentsCompleted: setNumberValue(eventData.averageSegmentsCompleted, '-'),
                        averageSessionsPerWeek: setNumberValue(eventData.averageSessionsPerWeek, '-'),
                        averageSessionsPerWeekNumerator: eventData.averageSessionsPerWeekNumerator || '-',
                        averageSessionLength: typeof eventData.averageSessionLength === 'number' ?
                                            (eventData.averageSessionLength / 60000) : '-',
                        averageSessionLengthNumerator: setNumberValue(eventData.averageSessionLengthNumerator, '-')
                    },
                    ri: getRIData(eventData, forSingleStudent)
                };

                results.data.push(detailData);
            });

            return results;
        }

        function getRIData(eventData, forSingleStudent) {
            // Handle the case where no RI data is present
            var riData = {
                averageNumTestsTaken: '-',
                lexGrowthGoal: '-'
            };

            var metGoal = eventData.metGoal,
                metGoalCount = eventData.metGoalCount,
                metGoalPercentage = eventData.metGoalPercentage,
                totalTests = eventData.totalTests,
                numberOfStudents = eventData.numberOfStudents;

            if (numberOfStudents > 0) {
                riData.averageNumTestsTaken = setNumberValue(totalTests / numberOfStudents, '-');

                if (forSingleStudent) {
                    // String
                    riData.lexGrowthGoal = metGoal;
                } else {
                    // Percentage
                    riData.lexGrowthGoal = setNumberValue((metGoalCount / numberOfStudents) * 100, '-');

                    if (riData.lexGrowthGoal !== metGoalPercentage) {
                        console.log('Lexile Growth Percentages don\'t match!', riData.lexGrowthGoal, metGoalPercentage);
                    }
                }
            }

            return riData;
        }

        // build 3 arrays,
        //   dailyData: [SessionData]
        //   weeklyData: [SessionData]
        //   monthlyData: [SessionData]
        //
        function SessionData(date, sessionCt, avgTimeSpent, timeSpent) {
            this.date = date;
            this.sessionCt = sessionCt;
            this.avgTimeSpent = avgTimeSpent;
            this.timeSpent = timeSpent; // redundant
        }

        function parseLeaderDashboardDailySessionLengthsResult(rawData) {
            var data = JSON.parse(rawData);

            var results = {};
            results.dailyData = [];

            data.forEach(function(item) {
                var dayData = item['days'].buckets;

                dayData.forEach(function(dayItem) {

                    // make a date from day and year
                    var date = new Date(item.key, 0);
                    date.setDate(dayItem.key);

                    var timeSpent = typeof dayItem['total_time_spent'].value === 'number' ?
                        (dayItem['total_time_spent'].value / 60000) : 0;

                    var sessionCt = dayItem['doc_count'];
                    var avgTimeSpent = (sessionCt > 0) ? timeSpent / sessionCt : 0;
                    var sessionData = new SessionData(date, sessionCt, avgTimeSpent, timeSpent);

                    results.dailyData.push(sessionData);
                });
            });

            // var _buckets = data.aggregations['years'].buckets;

            // _.filter(_buckets, function(item) {
            //     var dayData = item['days'].buckets;

            //     _.filter(dayData, function(dayItem) {

            //         // make a date from day and year
            //         var date = new Date(item.key, 0);
            //         date.setDate(dayItem.key);

            //         var timeSpent = typeof dayItem['total_time_spent'].value === 'number' ?
            //             Math.round((dayItem['total_time_spent'].value) / 6000) : 0;

            //         var sessionCt = dayItem['doc_count'];
            //         var avgTimeSpent = (sessionCt > 0) ? timeSpent / sessionCt : 0;
            //         var sessionData = new SessionData(date, sessionCt, avgTimeSpent, timeSpent);

            //         results.dailyData.push(sessionData);
            //     });
            // });

            results.dailyData.sort(function(a, b) { return a.date - b.date; });

            // plug any holes in the data
            var extraDates = [];
            var curDate;
            results.dailyData.forEach(function(dd) {
                if (!curDate) {
                    curDate = new Date(dd.date);
                }

                while (dd.date > curDate) {
                    extraDates.push (
                        new SessionData(new Date(curDate), 0, 0, 0)
                    );
                    curDate.setDate(curDate.getDate() + 1);
                }

                curDate.setDate(curDate.getDate() + 1);
            });

            results.dailyData = results.dailyData.concat(extraDates);
            results.dailyData.sort(function(a, b) { return a.date - b.date; });

            // This test data might be handy if we decide to alter the compress behavior
            // TODO - delete this commented code in a bit
            //
            //var testData = d3.range(50).map(function(i) {
            //    var date = new Date(2016, 0);
            //    date.setDate(30 + i);
            //    return {
            //        date : date,
            //        timeSpent : getRandomInt(0, 50)
            //    };
            //});
            //
            //function getRandomInt(min, max) {
            //    min = Math.ceil(min);
            //    max = Math.floor(max);
            //    return Math.floor(Math.random() * (max - min)) + min;
            //};

            results.weeklyData = compressSessionDataByWeek(results.dailyData);
            results.monthlyData = compressSessionDataByMonth(results.dailyData);

            return results;
        }

        function getLCReportData(id, aggregationLevel, typeOfData) {
            var streamId = service.streamIds[aggregationLevel][typeOfData]; // TODO: Opportunity to validate inputs...?
            var postprocessParams = service.postprocessParams[aggregationLevel][typeOfData];
            var initPromise = service.initialize(true); // TODO: Should there be a dedicated 'initializeForLC' function?

            return initPromise.then(
                function (data) {
                    var config = data;

                    var hostname = window.location.host.split('.')[0];
                    if (hostname.indexOf('localhost') === 0) { // for redirect mode support
                        hostname = 'h503000001';
                        // hostname = 'h511000002';
                    }

                    var searchBody = _.assign({
                        'custom_siteId': hostname,
                        'custom_report_time': new Date().getTime(),
                        '_postprocess_params': postprocessParams
                    });
                    searchBody['custom_' + aggregationLevel + 'Id'] = id;

                    var sensorQueryPromise = sensor.query(config.authToken, streamId, searchBody);

                    return sensorQueryPromise.then(function(data) {
                        return data;
                    });
                }
            );
        }

        function processLCTableData(data, mapFunc, summaryRow) {
            var processedData = [];

            if (data) {
                processedData = data.map(mapFunc);
            }

            if (summaryRow) {
                processedData.unshift(summaryRow);
            }

            return processedData;
        }

        function getDistrictLicenseCounts(paramObj) {
            if (!paramObj) {
                paramObj = {};
            }
            // Add mandatory params to paramObj
            paramObj.licenseCategory = 'student';

            var defer = $q.defer(),
                query = httpSrv.getQueryString(paramObj),
                url = httpConfig.url.leader.getDistrictLicenseCount;

            httpSrv.callAPI('GET', url + query).then(
                function (data) { defer.resolve(data); },
                function (error) { defer.reject(error); }
            );

            return defer.promise;
        }

        function getSchoolLicenseCounts(schoolId, paramObj) {
            if (!paramObj) {
                paramObj = {};
            }
            // Add mandatory params to paramObj
            paramObj.licenseCategory = 'student';
            paramObj.seatsBySchool = true;

            var defer = $q.defer(),
                query = httpSrv.getQueryString(paramObj),
                url = httpConfig.url.leader.getSchoolLicenseCount
                    .replace(':schoolId', schoolId);

            httpSrv.callAPI('GET', url + query).then(
                function(data) {
                    defer.resolve(data);
                },
                function(error) {
                    defer.reject(error);
                }
            );

            return defer.promise;
        }

        function getClassLicenseCounts(schoolId, classId, paramObj) {
            if (!paramObj) {
                paramObj = {};
            }
            // Add mandatory params to paramObj
            paramObj.licenseCategory = 'student';
            paramObj.seatsByClass = true;

            var defer = $q.defer(),
                query = httpSrv.getQueryString(paramObj),
                url = httpConfig.url.leader.getClassLicenseCount
                    .replace(':schoolId', schoolId)
                    .replace(':classId', classId);

            httpSrv.callAPI('GET', url + query).then(
                function(data) {
                    defer.resolve(data);
                },
                function(error) {
                    defer.reject(error);
                }
            );

            return defer.promise;
        }

        function countLicenses(productLicenseCounts, productIds) {
            productLicenseCounts = Array.isArray(productLicenseCounts) ? productLicenseCounts : [];
            productIds = productIds || {};

            return productLicenseCounts.reduce(function(total, product) {
                var additionalLicenses = 0;

                if (product.productId in productIds) {
                    additionalLicenses = product.subProductLicenseCountList.reduce(function(count, subProduct) {
                        return count + subProduct.usedCount;
                    }, 0);
                }

                return total + additionalLicenses;
            }, 0);
        }

        // compute the average the data over the passed in period
        // input data is assumed to be sorted by date, and no "holes" (one elem per day from start day)
        // output will be sorted by date
        // partial periods could be at the front or the back, currently they are at the back
        // that is, newest data at the end of the array. E.g. compress 10 days by week (dayCt = 7),
        // result will be two objects, the first will have a full week, the second 3 days
        //
        function compressSessionData(dailyData, dayCt) {

            var compressed = [];
            var accTS = 0, // accumulate the time spent
                accNS = 0; // accumulate the number of sessions

            for (var iday = 0; iday < dailyData.length; ++iday) {

                var day = dailyData[iday];
                accTS += day.timeSpent;
                accNS += day.sessionCt;

                if (iday % dayCt === dayCt - 1) {
                    compressed.push(
                        new SessionData(day.date, accNS, (accNS > 0) ? accTS / accNS : 0)
                    );
                    accTS = accNS = 0;
                }
            }

            // one more for the partial period, if needed
            var partialDayCt = dailyData.length % dayCt;
            if (partialDayCt) {
                compressed.push(
                    new SessionData(dailyData[dailyData.length - 1].date,
                        accNS, (accNS > 0) ? accTS / accNS : 0)
                );
            }

            return compressed;
        }

        // this is a specialized weekly average that
        // computes the average for each Sunday to Sat period
        // and records the result on Wednesday. A partial week
        // will render on the last day if <= WED, else on WED.
        function compressSessionDataByWeek(dailyData) {

            var compressed = [];
            var accTS = 0, // accumulate the time spent
                accNS = 0; // accumulate the number of sessions

            dailyData.forEach(function(dd) {
                accTS += dd.timeSpent;
                accNS += dd.sessionCt;

                if (dd.date.getDay() === 6)  { // if Sat

                    var prevWed = new Date(dd.date);
                    prevWed.setDate(prevWed.getDate() - 3);

                    compressed.push(
                        new SessionData(prevWed, accNS, (accNS > 0) ? accTS / accNS : 0)
                    );

                    accTS = accNS = 0;
                }
            });

            if (accNS !== 0) { // if a partial week ...

                // if past wed, set to prev Wed, else to the next Wed
                var last = new Date(dailyData[dailyData.length - 1].date);
                var diff = 3 - last.getDay();

                last.setDate(last.getDate() + diff);

                compressed.push(
                    new SessionData(last, accNS, (accNS > 0) ? accTS / accNS : 0)
                );
            }

            return compressed;
        }

        // this is a specialized monthly average that
        // computes the average for each month period
        // and records the result on the first. A partial month
        // will render on the last day (hmmmm...)
        function compressSessionDataByMonth(dailyData) {

            if (!dailyData || dailyData.length < 1) {
                return [];
            }

            var compressed = [];
            var curMonth = dailyData[0].date.getMonth();
            var accTS = 0, // accumulate the time spent
                accNS = 0; // accumulate the number of sessions

            dailyData.forEach(function(dd) {
                accTS += dd.timeSpent;
                accNS += dd.sessionCt;

                if (dd.date.getMonth() !== curMonth)  {

                    var curYear = dd.date.getFullYear();
                    if (dd.date.getMonth() === 0) {
                        curYear--; // Happy New Year
                    }

                    compressed.push(
                        new SessionData(new Date(curYear, curMonth, 1),
                            accNS, (accNS > 0) ? accTS / accNS : 0)
                    );

                    curMonth = dd.date.getMonth();
                    accTS = accNS = 0;
                }
            });

            if (accNS !== 0) { // if a partial week ...

                var last = dailyData[dailyData.length - 1].date;

                compressed.push(
                    new SessionData(new Date(last.getFullYear(), curMonth, 1),
                        accNS, (accNS > 0) ? accTS / accNS : 0)
                );
            }

            return compressed;
        }

        function createLinearChartModel(sessionData) {

            var d3 = window.d3;

            return {
                title : 'Average Session Length',
                numDataPointsShown : 7,

                getData: function() { return this.data[ this.dataFoldLevel ]; },
                getDataFoldLevel: function(lev) { return this.dataFoldLevel; },
                setDataFoldLevel: function(lev) { this.dataFoldLevel = lev; },

                dayPerPointMap: {'byDay' : 1, 'byWeek' : 7, 'byMonth' : 30},
                getDaysPerPoint: function() { return this.dayPerPointMap[this.dataFoldLevel]; },

                showMonthSeparators: function () {
                    return this.dataFoldLevel === 'byWeek' || this.dataFoldLevel === 'byDay';
                },
                showYearSeparators: function () { return this.dataFoldLevel === 'byMonth';},

                dateFormatterMap: {
                    'byDay' : d3.time.format('%a-%b %d'),
                    'byWeek' : function(d) {
                        // dates are now Wednesdays
                        var format1 = d3.time.format('%b %d');
                        var format2 = d3.time.format('%d');
                        var startOfWeek = new Date(d);
                        var endOfWeek = new Date(d);
                        startOfWeek.setDate(d.getDate() - 3);
                        endOfWeek.setDate(d.getDate() + 3);

                        var ret = format1(startOfWeek) + '-';
                        ret += (startOfWeek.getMonth() === endOfWeek.getMonth()) ?
                            format2(endOfWeek) : format1(endOfWeek);

                        return ret;
                    },
                    'byMonth' : d3.time.format('%B')
                },
                getDateFormatter: function () { return this.dateFormatterMap[this.dataFoldLevel]; },

                tickValuesMap: {
                    'byDay' : null,
                    'byWeek' : function() {
                        return this.data.byWeek.map(function(d) { return d.date; });
                    },
                    'byMonth' : null
                },
                getTickValues: function () {
                    var bub = this.tickValuesMap[this.dataFoldLevel];

                    return bub ? bub.call(this) : null;
                },

                // use get and set above...
                dataFoldLevel : 'byWeek', // which data to display
                data : {
                    byDay : sessionData.dailyData,
                    byWeek : sessionData.weeklyData,
                    byMonth : sessionData.monthlyData
                }

            };
        }

        /* End Leader Central */
        /* End of shared functions*/

        function createCustomSorter(sortRules) {
            return function(a, b, sortAscending) {
                return sortRules.reduce(function(sortValue, rule) {
                    // If a definitive sort value has already been identified,
                    // simply return that value repeatedly until there are no
                    // sort functions left.
                    if (sortValue) {
                        return sortValue;
                    }

                    var valA = a[rule.key],
                        valB = b[rule.key],
                        sortFunc = rule.sortFunc,
                        order = rule.order || (sortAscending ? 'ascending' : 'descending');

                    sortValue = sortFunc(valA, valB, order);

                    return sortValue;
                }, 0);
            };
        }

        function reverseCustomSorter(customSorter) {
            return function(a, b) {
                return customSorter(a, b) * -1;
            };
        }

        function stringSort(a, b, order) {
            // TODO: Better approach to type checking / figuring out how
            // to sort values of unexpected types.
            var typeCheckingResult = typeCheckForSorting(a, b, 'string'),
                modifier = (order === 'descending') ? -1 : 1;

            // Handle invalid inputs
            if (typeCheckingResult !== true) {
                return typeCheckingResult;
            }

            // Inputs are valid - sort as usual
            if (a.toLowerCase() < b.toLowerCase()) {
                return -1 * modifier;
            }

            if (a.toLowerCase() > b.toLowerCase()) {
                return 1 * modifier;
            }

            return 0;
        }

        // enumSort expects an "enumMap" parameter that provides sorting scores
        // that should be used for a set of specified values (the "enums").
        // Non-enum values always "lose" the sort comparison to enum values.

        // Example of enumMap value:
        /*
            {
                'Yes': 0,
                'No': 1
            }
        */
        function enumSort(enumMap) {

            return function(a, b, order) {
                var modifier = (order === 'descending') ? -1 : 1;

                var valA = enumMap[a],
                    valB = enumMap[b];

                if (valA === undefined && valB === undefined) {
                    return 0;
                } else if (valA === undefined) {
                    return 1;
                } else if (valB === undefined) {
                    return -1;
                }

                return (valA - valB) * modifier;
            };
        }

        function numberSort(a, b, order) {
            var typeCheckingResult = typeCheckForSorting(a, b, 'number'),
                modifier = (order === 'descending') ? -1 : 1;

            // Handle invalid inputs
            if (typeCheckingResult !== true) {
                return typeCheckingResult;
            }

            // Inputs are valid - sort as usual
            if (a < b) {
                return -1 * modifier;
            }

            if (a > b) {
                return 1 * modifier;
            }

            return 0;
        }

        // roundedNumberSort returns a modified "numberSort" function that
        // first rounds its arguments to a particular precision (0, by default).

        // Non-numbers can always be passed, but they will always
        // "lose" the sort comparison to values of type 'number'.
        // i.e. Non-numbers sort as if equal to negative infinity.
        function roundedNumberSort(precision) {

            return function(a, b, order) {

                if (typeof a === 'number') {
                    a = _.round(a, precision);
                }

                if (typeof b === 'number') {
                    b = _.round(b, precision);
                }

                return numberSort(a, b, order);
            };
        }

        function dateSort(a, b, order) {
            var dateA = (a instanceof Date) ? a : new Date(a),
                dateB = (b instanceof Date) ? b : new Date(b),
                isValidDateA = !isNaN(dateA.valueOf()),
                isValidDateB = !isNaN(dateB.valueOf()),
                modifier = (order === 'descending') ? -1 : 1;

            // Handle invalid inputs
            if (!isValidDateA && !isValidDateB) {
                return 0;
            }

            if (!isValidDateA) {
                return 1;
            }

            if (!isValidDateB) {
                return -1;
            }

            // Inputs are valid - sort as usual
            if (dateA < dateB) {
                return -1 * modifier;
            }

            if (dateA > dateB) {
                return 1 * modifier;
            }

            return 0;
        }

        // fractionStringSort will use the decimal value of a fraction-like
        // string to perform its sort. The string is converted into a numerator
        // and denominator if possible, then we divide to get the decimal value.
        function fractionStringSort(a, b, order) {
            var valA = parseFractionString(a),
                valB = parseFractionString(b);

            return numberSort(valA, valB, order);
        }

        function typeCheckForSorting(a, b, type) {
            var aIsValid = typeof a === type,
                bIsValid = typeof b === type;

            // Both items are invalid - treat this situation as a tie
            if (!aIsValid && !bIsValid) {
                return 0;
            }

            // a is invalid - b "wins" by default
            if (!aIsValid) {
                return 1;
            }

            // b is invalid - a "wins" by default
            if (!bIsValid) {
                return -1;
            }

            return true;
        }

        function parseFractionString(fractionString) {
            var result;

            if (typeof fractionString === 'string') {
                var fractionValues = fractionString.split('/');
                if (fractionValues.length !== 2) {
                    result = fractionString; // The input does not appear to be a fraction. Return it unmodified.
                }
                else {
                    result = fractionValues[0] / fractionValues[1];
                }
            } else {
                result = fractionString; // Not a string. Don't guess, and just return the input unmodified.
            }

            return result;
        }

        function formatFractionAsPercentage(fractionString) {
            // modified from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt
            var filterInt = function (value) {
                return (/^(\-|\+)?([0-9]+|Infinity)$/.test(value.trim())) ? Number(value) : undefined;
            };

            var cell = fractionString;
            var cellPieces = (typeof cell === 'string') ? cell.split('/') : [];

            return (cellPieces.length === 2 &&
            typeof filterInt(cellPieces[0]) === 'number' &&
            typeof filterInt(cellPieces[1]) === 'number' &&
            filterInt(cellPieces[1]) !== 0) ?
            '(' + Math.round(100 * cellPieces[0] / cellPieces[1]) + '%)' : '';
        }

        /* Other possible candidates, but some logic refactoring might need to take place: */
        /*
            - findLowScoreSkills(e3d:293) / findLowSkillList(WA:1409)
            - Sorting a list by strand, then alphabetically by skill (WA:1076 and WA:1978)
        */

        /* Table model */
        function LRSTable(tableData) {
            if (!tableData) {
                console.log('tableData should be an object!');
                tableData = {};
            }

            this.header = Array.isArray(tableData.header) ? tableData.header.slice() : [];
            this.body = Array.isArray(tableData.body) ? tableData.body.slice() : [];
            this.footer = Array.isArray(tableData.footer) ? tableData.footer.slice() : [];

            this.sortedBy = null;
            this.sortAscending = true;
            this.columns = tableData.columns;
        }

        function defaultHeaderClickHandler(ch, order) {
            return function(headerCell, headerRow, header, lrsTableModel) {
                if (typeof ch.sortFunc === 'function') {
                    lrsTableModel.sortBy(ch.colName, ch.sortFunc, order);
                }

                headerRow.forEach(function(headerCell) {
                    headerCell.class['focused'] = false;
                });

                headerCell.class['focused'] = true;
            };
        }

        /* LRSTable templating functions */
        function drilldownLink(studentId, studentName, reportId) {
            return [
                '<a ui-sref="{student: \'' + studentId + '\', report:\'' + reportId + '\'}"',
                    ' ui-sref-opts="{notify: false}">',
                    studentName,
                '</a>'
            ].join('');
        }

        function unlicensedStudentName(studentName) {
            return [
                '<span class="unlicensed-student">',
                    studentName,
                    '<img src="images/d3Report/warning-exclamation.svg"/>',
                '</span>'
            ].join('');
        }

        function columnHeading(ch, showCaret) {
            return [
                '<div class="columnHeading">',
                    '<span>' + ch.title + '</span>',
                    showCaret ? caretImage(ch.colName) : '',
                '</div>'
            ].join('');
        }

        function caretImage(columnName) {
            // The strange 'replace()' call below is to handle cases such as 'Author's Purpose',
            // which due to the apostrophe it naturally contains, would terminate the string expression early.
            // We replace every occurrence of an apostrophe with an escaped apostrophe, using replace().
            return [
                '<img class="caretImg"',
                    ' src="{{!tableModel.sortAscending',
                        ' && tableModel.sortedBy === \'' + columnName.replace('\'', '\\\'') + '\'',
                        ' ? \'images/d3Report/down.svg\' : \'images/d3Report/up.svg\'}}"',
                '/>'
            ].join('');
        }

        function irToggleLinks() {
            return [
                '<span class="toggles">',
                    '<a ng-click="tableModel.context = \'averages\'"',
                        'ng-class="tableModel.context === \'averages\' ? \'toggled\' : \'\'">',
                        'Averages</a>',
                    '<a ng-click="tableModel.context = \'totals\'"',
                        'ng-class="tableModel.context === \'totals\' ? \'toggled\' : \'\'">',
                        'Totals</a>',
                '</span>'
            ].join('');
        }

        function irFooterCell(average, total) {
            return [
                '<span ng-if="tableModel.context === \'averages\'">',
                    average,
                '</span>',
                '<span ng-if="tableModel.context === \'totals\'">',
                    total,
                '</span>'
            ].join('');
        }

        function percentageOnHover(fraction) {
            return [
                '<span>',
                    fraction,
                ' </span>',
                '<span class="tt">',
                   formatFractionAsPercentage(fraction),
               '</span>'
            ].join('');
        }

        // Custome Intellify Endpoints
        function downloadService(endpoint, data) {
            var defer = $q.defer(),
                url = intellifyBase + '/download-service/fetch/intellisearch/dynamic/' + endpoint;

            service.initialize().then(function(config) {
                $http({
                    method: 'POST',
                    url: url,
                    data: data,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + config.authToken
                    }
                }).then(
                    function(data) { defer.resolve(data); },
                    function(error) { defer.reject(error); }
                );
            }, function(error) { defer.reject(error); });

            return defer.promise;

        }

        function getDownloadStatusEndpoint() {
            return intellifyBase + '/download-service/status/';
        }
    }
);
