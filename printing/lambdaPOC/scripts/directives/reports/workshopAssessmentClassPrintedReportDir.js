'use strict';
      app.directive('workshopAssessmentClassPrintedReport',
        function () {

          function wacController ($scope) {
            console.log("called wacController");
            $scope.model.wkshpAsmtReportInit = true;
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
            templateUrl: 'scripts/templates/reports/workshopAssessmentClassPrintedReport.html',
            controller: wacController
          };
          console.log("created: workshopAssessmentClassPrintedReport");
          return directive;
        });
