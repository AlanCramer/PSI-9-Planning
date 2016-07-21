/**
 * Created by bobhmh on 7/20/16.
 */

routerApp.controller('httpController', function($scope, $http, $state) {

    $scope.sendHttpRequest = function() {
        console.log("send request");
        $state.go('irc')
    }
//    $scope.message = 'test';

});