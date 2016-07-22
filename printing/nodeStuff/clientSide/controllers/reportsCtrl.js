/**
 * Created by bobhmh on 7/20/16.
 */

routerApp.controller('reportsCtrl', function($scope, $http, $state) {

    $scope.goToNamedState = function(state) {
        $state.go(state);
    };

    $scope.sendPost = function(reportName) {
        var data = [
            { 'name':'Infosys Technologies',
                'employees': 125000,
                'headoffice': 'Bangalore'},
            { 'name':'Cognizant Technologies',
                'employees': 100000,
                'headoffice': 'Bangalore'},
            { 'name':'Wipro',
                'employees': 115000,
                'headoffice': 'Bangalore'},
            { 'name':'Tata Consultancy Services (TCS)',
                'employees': 150000,
                'headoffice': 'Bangalore'},
        ];
        /*var data = $.param({
            json: JSON.stringify({
                name: $scope.newName
                })
            });*/
        $scope.data = data;
        $http.post("http://localhost:3000/?reportName=" + reportName, data).success(function(data, status) {
            console.log('Send http post.  Data: ',data);
            $scope.data = data;
        })
    };
});


//ANother approach  from https://hello-angularjs.appspot.com/angularjs-http-service-ajax-post-json-data-code-example

/*var helloAjaxApp = angular.module("helloAjaxApp", []);

helloAjaxApp.controller("CompaniesCtrl", ['$scope', '$http', function($scope, $http) {
    $scope.companies = [
        { 'name':'Infosys Technologies',
            'employees': 125000,
            'headoffice': 'Bangalore'},
        { 'name':'Cognizant Technologies',
            'employees': 100000,
            'headoffice': 'Bangalore'},
        { 'name':'Wipro',
            'employees': 115000,
            'headoffice': 'Bangalore'},
        { 'name':'Tata Consultancy Services (TCS)',
            'employees': 150000,
            'headoffice': 'Bangalore'},
    ];

    $scope.addRowAsyncAsJSON = function(){
        $scope.companies.push({ 'name':$scope.name, 'employees': $scope.employees, 'headoffice':$scope.headoffice });
        // Writing it to the server
        //
        var dataObj = {
            name : $scope.name,
            employees : $scope.employees,
            headoffice : $scope.headoffice
        };
        var res = $http.post('/savecompany_json', dataObj);
        res.success(function(data, status, headers, config) {
            $scope.message = data;
        });
        res.error(function(data, status, headers, config) {
            alert( "failure message: " + JSON.stringify({data: data}));
        });
        // Making the fields empty
        //
        $scope.name='';
        $scope.employees='';
        $scope.headoffice='';
    };
}]);*/
