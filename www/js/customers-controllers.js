angular.module('invitationsApp.customers-controllers', [])
.controller('CustomersController',
['$scope', '$state', '$stateParams', '$http', '$ionicPopup', '$ionicModal', 'customerFactory', 'baseURL', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast',
function ($scope, $state, $http, $stateParams, $ionicPopup, $ionicModal, customerFactory, baseURL, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {
    //$scope.baseURL = baseURL;

// Create the host modal that we will use later
    $ionicModal.fromTemplateUrl('templates/updateCustomer.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });
    // Triggered in the login modal to close it
    $scope.closeCustomerForm = function () {
        $scope.modal.hide();
    };
    // Open the host modal
    $scope.upsertCustomer = function (customer) {
        $scope.customer = customer;
        console.log('id :' + $scope.customer.id + ' / user name: ' + $scope.customer.username);
        $scope.modal.show();
    };
    console.log($stateParams.id);
    customerFactory.get({id: $stateParams.id},
        function (response) {
            $scope.customers = response;
        },
        function (response) {
            console.log('No customers registered: ' + response.data.error.message);
        });
    // Perform the save host action when the user submits the host form
    $scope.saveCustomer = function (customer) {
      $ionicPlatform.ready(function () {
          customer.id = $stateParams.id;
          $scope.customer = customer;
          customerFactory.update($scope.customer)
            .$promise.then(
              function(response) {
                $cordovaLocalNotification.schedule({
                    id: 1,
                    title: "Customer Updated Successfully",
                    text: ''
                }).then(function () {
                    console.log('Customer Updated Successfully');
                    $scope.closeCustomerForm();
                    $state.go($state.current, null, {reload: true});
                  },
                  function () {
                  }
                );
              },
              function(response) {
                $cordovaToast
                    .show('Customer not updated ' , 'long', 'center')
                    .then(function (success) {
                        console.log('Customer not updated ' + response.data.error.message + ' id: ' + $stateParams.id);
                    }, function (error) {
                        // error
                    });
              }
            );
      });
    };
    $scope.deleteCustomer = function (customerid) {
        var confirmPopup = $ionicPopup.confirm({
            title: '<h3>Confirm Delete</h3>',
            template: '<p>Are you sure you want to delete this item?</p>'
        });
        console.log('customer id:' + customerid);
        confirmPopup.then(function (res) {
            if (res) {
              console.log('Ok to delete');
              customerFactory.delete({id: customerid})
                .$promise.then(
                  function(response){
                    $cordovaLocalNotification.schedule({
                        id: 1,
                        title: "Customer Deleted Successfully",
                        text: ''
                    }).then(function () {
                        console.log('Customer deleted Successfully');
                        $state.go($state.current, null, {reload: true});
                      },
                      function () {
                      }
                    );
                  },
                  function(response){
                    $cordovaToast
                        .show('Customer not deleted ' , 'long', 'center')
                        .then(function (success) {
                            console.log('customer not Deleted<br> ' + response.data.error.message + ' id: ' + $stateParams._id);
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
