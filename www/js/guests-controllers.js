angular.module('invitationsApp.guests-controllers', [])
.controller('GuestsController',
['$scope', '$state', '$stateParams', '$ionicPopup', '$ionicModal', 'guestFactory', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast',
function ($scope, $state, $stateParams, $ionicPopup, $ionicModal, guestFactory, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {
// Create the host modal that we will use later
    $ionicModal.fromTemplateUrl('templates/newGuest.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });
    // Triggered in the login modal to close it
    $scope.closeGuestForm = function () {
        $scope.modal.hide();
    };
    // Open the host modal
    $scope.upsertGuest = function (guest) {
        $scope.guest = guest;
        console.log('id :' + $scope.guest.id + ' / event id: ' + $scope.guest.eventId + ' / name: ' + $scope.guest.name);
        $scope.modal.show();
    };
    guestFactory.query({eventId: $stateParams.id},
        function (response) {
            $scope.guests = response;
        },
        function (response) {
            console.log('No guests registered: ' + response.data.error.message);
        });
    // Perform the save host action when the user submits the host form
    $scope.saveGuest = function (guest) {
      $ionicPlatform.ready(function () {
          guest.eventId = $stateParams.id;
          $scope.guest = guest;
          if ($scope.guest.id) {
            guestFactory.update($scope.guest)
              .$promise.then(
                function(response) {
                  $cordovaLocalNotification.schedule({
                      id: 1,
                      title: "Guest Updated Successfully",
                      text: ''
                  }).then(function () {
                      console.log('guest Updated Successfully');
                      $scope.closeGuestForm();
                      $state.go($state.current, null, {reload: true});
                    },
                    function () {
                    }
                  );
                },
                function(response) {
                  $cordovaToast
                      .show('guest not updated ' , 'long', 'center')
                      .then(function (success) {
                          console.log('guest not updated ' + response.data.error.message + ' id: ' + $stateParams.id);
                      }, function (error) {
                          // error
                      });
                }
              );
          }
          else {
            guestFactory.save($scope.guest)
              .$promise.then(
                function(response) {
                  $cordovaLocalNotification.schedule({
                      id: 1,
                      title: "Guest Saved Successfully",
                      text: ''
                  }).then(function () {
                      console.log('guest Saved Successfully');
                      $scope.closeGuestForm();
                      $state.go($state.current, null, {reload: true});
                    },
                    function () {
                    }
                  );
                },
                function(response) {
                  $cordovaToast
                      .show('guest not saved ' , 'long', 'center')
                      .then(function (success) {
                          console.log('guest not Saved ' + response.data.error.message + ' id: ' + $stateParams.id);
                      }, function (error) {
                          // error
                      });
                }
              );
          }
      });
    };
    $scope.deleteGuest = function (guestid) {
        var confirmPopup = $ionicPopup.confirm({
            title: '<h3>Confirm Delete</h3>',
            template: '<p>Are you sure you want to delete this item?</p>'
        });
        console.log('guest id:'+ guestid);
        confirmPopup.then(function (res) {
            if (res) {
              console.log('Ok to delete');
              guestFactory.delete({id: guestid})
                .$promise.then(
                  function(response){
                    $cordovaLocalNotification.schedule({
                        id: 1,
                        title: "Guest Deleted Successfully",
                        text: ''
                    }).then(function () {
                        console.log('guest deleted Successfully');
                        $state.go($state.current, null, {reload: true});
                      },
                      function () {
                      }
                    );
                  },
                  function(response){
                    $cordovaToast
                        .show('guest not deleted ' , 'long', 'center')
                        .then(function (success) {
                            console.log('guest not Deleted<br> ' + response.data.error.message + ' id: ' + $stateParams._id);
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
