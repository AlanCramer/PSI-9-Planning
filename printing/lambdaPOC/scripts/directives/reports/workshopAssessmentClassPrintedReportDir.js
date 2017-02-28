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
              const modelUrl = scope.$eval('modelUrl');
              if (!modelUrl) {
                const errMsg = "modelUrl was not provided!";
                console.error(errMsg);
                alert(errMsg);
              } else {
                $http({method:'GET',
                    url:modelUrl}).
                    then(function(response) {
                      const data = response.data;
                      console.log("getData: Promise was resolved with data.");
                      model.titleData = data.titleModel;
                      model.toolBar = data.toolbarModel;
                      model.summaryData = data.summaryModel;
                      let barChartData = null;
                      if (data.barChartModel) {
                        barChartData = data.barChartModel;
                      } else if (data.barChartData) {
                        barChartData = data.barChartData;
                      }
                      model.barChartData = barChartData;
                      let tableData = null;
                      if (data.tableModel)
                      {
                        tableData = data.tableModel;
                      } else if (data.tableData) {
                        tableData = data.tableData;
                      }
                      model.tableData = tableData;
                      model.teacherTableModel = data.teacherTableModel;
                      model.tableData.noDataPanel = !tableData ||
                          ((!tableData.data   || tableData.data.length === 0)   &&
                           (!tableData.levelA || tableData.levelA.length === 0) &&
                           (!tableData.levelB && tableData.levelB.length === 0))
                      model.activeLrsTableModel = data.lrsTableModelA;
                      model.lrsTableModelA = data.lrsTableModelA;
                      model.lrsTableModelB = data.lrsTableModelB;
                      model.activeLrsTeacherTableModel = data.lrsTeacherTableModelA;
                      model.lrsTeacherTableModelA = data.lrsTeacherTableModelA;
                      model.lrsTeacherTableModelB = data.lrsTeacherTableModelB;
                      model.wkshpAsmtReportInit = true;
                    }).catch(function (response) {
                      console.error("getData: Promise failed: %s", JSON.stringify(response));
                    });
                  }
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
