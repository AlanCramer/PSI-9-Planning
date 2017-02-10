
'use strict';

  app.directive('reportTitle',
      function () {

          return {
              restrict: 'E',
              templateUrl:'scripts/directives/visualizations/templates/title.html',
              replace: true,
              scope: {
                  titleData: '='
              }
          };
      }
  );
