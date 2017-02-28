'use strict';
      window.angular.module('myApp').directive('workshopAssessmentClassPrintedReport',['$http',
        function ($http) {

          var directive = {
            restrict: 'E',
            scope : true,
            replace: true,
            link: linker,
            templateUrl: 'scripts/directives/templates/reports/workshopAssessmentClassPrintedReport.html',
            controller: wacController
          };
          console.log("created: workshopAssessmentClassPrintedReport");
          return directive;

          function getData (scope) {
              var model = scope.model = {
                  wkshpAsmtReportInit: false
              };
              $http({method:'GET',
                    url:scope.modelUrl}).
                    then(function(response) {
                      const data = response.data;
                      console.log("Promise was resolved with data.");
                      model.titleData = data.titleModel;
                      model.toolBar = data.toolbarModel;
                      model.summaryData = data.summaryModel;
                      model.barChartData = data.barChartModel;
                      model.tableData = data.tableModel;
                      model.teacherTableModel = data.teacherTableModel;
                      model.tableData.noDataPanel =
                          data.tableModel.data.length === 0   &&
                          data.tableModel.levelA.length === 0 &&
                          data.tableModel.levelB.length === 0;
                      model.activeLrsTableModel = data.lrsTableModelA;
                      model.lrsTableModelA = data.lrsTableModelA;
                      model.lrsTableModelB = data.lrsTableModelB;
                      model.activeLrsTeacherTableModel = data.lrsTeacherTableModelA;
                      model.lrsTeacherTableModelA = data.lrsTeacherTableModelA;
                      model.lrsTeacherTableModelB = data.lrsTeacherTableModelB;
                      model.wkshpAsmtReportInit = true;
                    }).catch(function (response) {
                      console.error("Promise failed: %s", JSON.stringify(response));
                    });
              }

          function wacController ($scope) {
            console.log("called wacController");
            getData($scope);
            $scope.levelSelectedA = true;
            $scope.teacherLevelSelectedA = true;
          }

          function linker(scope, $elem, attrs) {
            console.log("called linker");
            scope.showModal = function () {
              console.log('Modal');
              $('#pocModal').modal('show');
            };
          }
        }]);
