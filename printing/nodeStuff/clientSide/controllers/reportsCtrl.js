/**
 * Created by bobhmh on 7/20/16.
 */

routerApp.controller('reportsCtrl', function($scope, $http, $state) {

    $scope.goToNamedState = function(state) {
        $state.go(state);
    };
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
    $scope.pdfAvailable = false;
    $scope.sendPost = function(reportName) {
        $scope.data = data;
        $http.post("http://localhost:3000/?reportName=" + reportName, data).
            then(function(response) {
                console.log(response.status);
                console.log(response.data);
                $scope.fileName = response.data;
                $scope.pdfAvailable = true;
            }
        )
    };
});


/*var data = $.param({
 json: JSON.stringify({
 name: $scope.newName
 })
 });*/

/*
 success(function(data, status) {
 console.log('Send http post.  Data: ',data);
 $scope.data = data;*/
//saveAs(data,'testData.pdf');
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
