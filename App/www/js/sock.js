
angular.module('myApp', [])


. controller('MyCtrl', function ($scope,$scope,socket) {

  //
    //socket.emit('Event', 'Sent an event from the client!');
    socket.on("id", function (data) {
  //  local =  angular.fromJson(data) ;
    $scope.clientid = data;

    });
  });
