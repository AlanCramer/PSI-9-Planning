'use strict';
      app.directive('workshopAssessmentClassPrintedReport',
        function () {

          function wacController ($scope) {
            console.log("called wacController");
            $scope.model.wkshpAsmtReportInit = true;
            var model = $scope.model;
            var data = $scope.data;
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

          var directive = {
            restrict: 'E',
            scope : true,
            replace: true,
            link: linker,
            templateUrl: 'scripts/directives/reports/templates/reports/workshopAssessmentClassPrintedReport.html',
            controller: wacController
          };
          console.log("created: workshopAssessmentClassPrintedReport");
          return directive;
        });
