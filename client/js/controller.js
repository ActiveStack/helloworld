// Declare your application module with a dependency on Percero
var app = angular.module('helloWorldApp', ['percero']);

app.controller('HelloWorldCtrl', function ($scope, percero) {
    $scope.message = "Hello world";
    $scope.authenticated = false;
    $scope.percero = percero;

    $scope.anonLogin = function(){
        percero.api.authenticateAnonymously()
            .then(
            onLoginComplete,
            function(error){
                console.log(error);
            },
            function(progress) {
                console.log(progress);
            });
    };

    $scope.cookieLogin = function(){
        percero.api.authenticateFromCookie()
            .then(
            onLoginComplete,
            function(error){
                console.log(error);
            },
            function(progress) {
                console.log(progress);
            });

    };

    $scope.googleLogin = function(){
        percero.api.authenticateWithOAuth('googleoauth')
            .then(
            onLoginComplete,
            function(error){
                console.log(error);
            },
            function(progress) {
                console.log(progress);
            });

    };

    $scope.creds = {}
    $scope.userPassLogin = function(){
        percero.api.authenticateWithUserPass($scope.creds.username, $scope.creds.password, 'pulse_http')
            .then(
            onLoginComplete,
            function(error){
                console.log(error);
            },
            function(progress) {
                console.log(progress);
            });

    };

    function onLoginComplete(userToken){
        console.log("onLoginResult");
        if(!userToken){
            console.log("token falsey")
        }else{
            /**
             * Successful auth... now pull down the person object so
             * we know who we are
             */
            console.log("Auth Success!")
            $scope.authenticated = true;

            /**
             * Now do a lookup for our user object
             */
            var example = new percero.domain.User();
            example.userId = userToken.user.ID;
            console.log("UserID: "+userToken.user.ID);
            percero.api.findByExample(example, function(message) {
                console.log(message);
                $scope.user = message.result[0];
                //$scope.$apply(function(){
                //    // This also gets hit when the server sends down a person object
                //    $scope.user = user;
                //    console.log(user);
                //});
            });
        }
    }

    $scope.percero = percero;

    var COLORS = ['#abcdef','#aabbcc','#ddeeff','#001122','#334455','#667788'];
    function getRandomColor(){
        var index = Math.floor(Math.random()*10)%COLORS.length;
        return COLORS[index];
    }

    $scope.addBlock = function(){
        var block = new percero.domain.Block();
        block.color = getRandomColor();
        block.save();
    }

    $scope.changeColor = function(block){
        block.color = getRandomColor();
        block.save();
    }

    $scope.removeBlock = function(block){
        block.remove();
    }


});