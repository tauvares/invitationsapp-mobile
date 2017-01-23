angular.module('invitationsApp.hosts-controllers', [])
.controller('HostsController',
['$scope', '$state', '$stateParams', '$ionicPopup', '$ionicModal', 'hostFactory', 'baseURL', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast',
function ($scope, $state, $stateParams, $ionicPopup, $ionicModal, hostFactory, baseURL, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {
    $scope.baseURL = baseURL;
    $scope.tab = 1;
    $scope.select = function (setTab) {
        $scope.tab = setTab;
        if (setTab === 2) {
            $scope.filtText = "appetizer";
        } else if (setTab === 3) {
            $scope.filtText = "mains";
        } else if (setTab === 4) {
            $scope.filtText = "dessert";
        } else {
            $scope.filtText = "";
        }
    };
    $scope.isSelected = function (checkTab) {
        return ($scope.tab === checkTab);
    };

// Create the host modal that we will use later
    $ionicModal.fromTemplateUrl('templates/newHost.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });
    // Triggered in the login modal to close it
    $scope.closeHostForm = function () {
        $scope.modal.hide();
    };
    // Open the host modal
    $scope.upsertHost = function (host) {
        $scope.host = host;
        console.log('id :' + $scope.host.id + ' / customer id: ' + $scope.host.customerId + ' / name: ' + $scope.host.name);
        $scope.modal.show();
    };
    hostFactory.query({customerId: $stateParams.id},
        function (response) {
            $scope.hosts = response;
        },
        function (response) {
            console.log('No hosts registered: ' + response.data.error.message);
        });
    // Perform the save host action when the user submits the host form
    $scope.saveHost = function (host) {
      $ionicPlatform.ready(function () {
          host.customerId = $stateParams.id;
          $scope.host = host;
          if ($scope.host.id) {
            hostFactory.update($scope.host)
              .$promise.then(
                function(response) {
                  $cordovaLocalNotification.schedule({
                      id: 1,
                      title: "Host Updated Successfully",
                      text: ''
                  }).then(function () {
                      console.log('Host Updated Successfully');
                      $scope.closeHostForm();
                      $state.go($state.current, null, {reload: true});
                    },
                    function () {
                    }
                  );
                },
                function(response) {
                  $cordovaToast
                      .show('Host not updated ' , 'long', 'center')
                      .then(function (success) {
                          console.log('Host not updated ' + response.data.error.message + ' id: ' + $stateParams.id);
                      }, function (error) {
                          // error
                      });
                }
              );
          }
          else {
            hostFactory.save($scope.host)
              .$promise.then(
                function(response) {
                  $cordovaLocalNotification.schedule({
                      id: 1,
                      title: "Host Saved Successfully",
                      text: ''
                  }).then(function () {
                      console.log('Host Saved Successfully');
                      $scope.closeHostForm();
                      $state.go($state.current, null, {reload: true});
                    },
                    function () {
                    }
                  );
                },
                function(response) {
                  $cordovaToast
                      .show('Host not saved ' , 'long', 'center')
                      .then(function (success) {
                          console.log('Host not Saved ' + response.data.error.message + ' id: ' + $stateParams.id);
                      }, function (error) {
                          // error
                      });
                }
              );
          }
      });
    };
    $scope.deleteHost = function (hostid) {
        var confirmPopup = $ionicPopup.confirm({
            title: '<h3>Confirm Delete</h3>',
            template: '<p>Are you sure you want to delete this item?</p>'
        });
        console.log('Host id:'+hostid);
        confirmPopup.then(function (res) {
            if (res) {
              console.log('Ok to delete');
              hostFactory.delete({id: hostid})
                .$promise.then(
                  function(response){
                    $cordovaLocalNotification.schedule({
                        id: 1,
                        title: "Host Deleted Successfully",
                        text: ''
                    }).then(function () {
                        console.log('Host deleted Successfully');
                        $state.go($state.current, null, {reload: true});
                      },
                      function () {
                      }
                    );
                  },
                  function(response){
                    $cordovaToast
                        .show('Host not deleted ' , 'long', 'center')
                        .then(function (success) {
                            console.log('Host not Deleted<br> ' + response.data.error.message + ' id: ' + $stateParams._id);
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
