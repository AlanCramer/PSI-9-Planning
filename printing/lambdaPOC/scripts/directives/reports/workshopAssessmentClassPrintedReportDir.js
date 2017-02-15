'use strict';
      app.directive('workshopAssessmentClassPrintedReport',['$timeout',
        function ($timeout) {

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

              $timeout(function init() {
                  var dataPromise = instantiateModelData(scope.modelUrl);

                  dataPromise.then(function (data) {
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

                      // Needed to detect when to show the teacher scored items table
//                      var assessmentName = workshopAssessmentApiSrv.getCurrentAssessmentName() || '';
//                      scope.isEndOfWorkshop = assessmentName.indexOf('End of Workshop') !== -1;

                      model.wkshpAsmtReportInit = true;
                      scope.$digest();
                  }).catch(function (reason) {
                    console.error("Promise failed due to: %s", JSON.stringify(reason));
                  });
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
