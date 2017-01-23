angular.module('invitationsApp.events-controllers', [])
.controller('EventsController',
['$scope', '$state', '$stateParams', '$ionicPopup', '$ionicModal', 'eventFactory', 'hostEventsFactory', 'hostFactory', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast',
function ($scope, $state, $stateParams, $ionicPopup, $ionicModal, eventFactory, hostEventsFactory, hostFactory, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {
// Create the host modal that we will use later
    $ionicModal.fromTemplateUrl('templates/newEvent.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });
    // Triggered in the login modal to close it
    $scope.closeEventForm = function () {
        $scope.modal.hide();
    };
    // Open the host modal
    $scope.upsertEvent = function (event) {
        $scope.event = event;
        $scope.modal.show();
    };
    hostFactory.get({id: $stateParams.id})
      .$promise.then(
        function (response) {
            $scope.host = response;
            console.log($scope.host.name);
            hostEventsFactory.query({id: $stateParams.id},
                function (response) {
                    $scope.events = response;
                },
                function (response) {
                    console.log('No events registered: ' + response.data.error.message + ' ID: ' + $stateParams.id);
                });
        },
        function (response) {
            console.log('No hosts returned: ' + response.data.error.message + ' ID: ' + $stateParams.id);
        }
      );
    // Perform the save host action when the user submits the host form
    $scope.saveEvent = function (event) {
      $ionicPlatform.ready(function () {
          event.hostId = $stateParams.id;
          $scope.event = event;
          if ($scope.event.id) {
            eventFactory.update($scope.event)
              .$promise.then(
                function(response) {
                  $cordovaLocalNotification.schedule({
                      id: 1,
                      title: "Event Updated Successfully",
                      text: ''
                  }).then(function () {
                      console.log('event Updated Successfully');
                      $scope.closeEventForm();
                      $state.go($state.current, null, {reload: true});
                    },
                    function () {
                    }
                  );
                },
                function(response) {
                  $cordovaToast
                      .show('event not updated ' , 'long', 'center')
                      .then(function (success) {
                          console.log('event not updated ' + response.data.error.message + ' id: ' + $stateParams.id);
                      }, function (error) {
                          // error
                      });
                }
              );
          }
          else {
            eventFactory.save($scope.event)
              .$promise.then(
                function(response) {
                  $cordovaLocalNotification.schedule({
                      id: 1,
                      title: "Event Saved Successfully",
                      text: ''
                  }).then(function () {
                      console.log('event Saved Successfully');
                      $scope.closeEventForm();
                      $state.go($state.current, null, {reload: true});
                    },
                    function () {
                    }
                  );
                },
                function(response) {
                  $cordovaToast
                      .show('event not saved ' , 'long', 'center')
                      .then(function (success) {
                          console.log('event not Saved ' + response.data.error.message + ' id: ' + $stateParams.id);
                      }, function (error) {
                          // error
                      });
                }
              );
          }
      });
    };
    $scope.deleteEvent = function (eventid) {
        var confirmPopup = $ionicPopup.confirm({
            title: '<h3>Confirm Delete</h3>',
            template: '<p>Are you sure you want to delete this item?</p>'
        });
        console.log('event id:'+ eventid);
        confirmPopup.then(function (res) {
            if (res) {
              console.log('Ok to delete');
              eventFactory.delete({id: eventid})
                .$promise.then(
                  function(response){
                    $cordovaLocalNotification.schedule({
                        id: 1,
                        title: "Event Deleted Successfully",
                        text: ''
                    }).then(function () {
                        console.log('event deleted Successfully');
                        $state.go($state.current, null, {reload: true});
                      },
                      function () {
                      }
                    );
                  },
                  function(response){
                    $cordovaToast
                        .show('event not deleted ' , 'long', 'center')
                        .then(function (success) {
                            console.log('event not Deleted<br> ' + response.data.error.message + ' id: ' + $stateParams._id);
                        }, function (error) {
                            // error
                        });
                  }
                );
            } else {
                console.log('Canceled delete');
            }
        });
    };
}])
