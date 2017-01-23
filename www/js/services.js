'use strict';
angular.module('invitationsApp.services', ['ngResource'])
.constant("baseURL", "<YOUR_API_LOCATION:PORT>")
.factory('customerFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + "Customers/:id", null, {
        'update': {
            method: 'PUT'
        }
    });
}])
.factory('customerHostsFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + "Customers/:id/Hosts", null, {
        'update': {
            method: 'PUT'
        }
    });
}])
.factory('hostFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + "Hosts/:id", null, {
        'update': {
            method: 'PUT'
        }
    });
}])
.factory('hostEventsFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + "Hosts/:id/events", null, {
        'update': {
            method: 'PUT'
        }
    });
}])
.factory('eventFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + "Events/:id", null, {
        'update': {
            method: 'PUT'
        }
    });
}])
.factory('eventGuestsFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + "Events/:id/guests", null, {
        'update': {
            method: 'PUT'
        }
    });
}])
.factory('guestFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + "Guests/:id", null, {
        'update': {
            method: 'PUT'
        }
    });
}])
.factory('$localStorage', ['$window', function($window) {
  return {
    store: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    remove: function (key) {
      $window.localStorage.removeItem(key);
    },
    storeObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key,defaultValue) {
      return JSON.parse($window.localStorage[key] || defaultValue);
    }
  }
}])
.factory('AuthFactory', ['$resource', '$http', '$localStorage', '$rootScope', 'baseURL', '$ionicPopup',
                                    function($resource, $http, $localStorage, $rootScope, baseURL, $ionicPopup){
    var authFac = {};
    var TOKEN_KEY = 'Token';
    var isAuthenticated = false;
    var username = '';
    var userid = '';
    var authToken = undefined;
    function loadUserCredentials() {
        var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
        if (credentials.username != undefined) {
          useCredentials(credentials);
        }
    }
    function storeUserCredentials(credentials) {
        $localStorage.storeObject(TOKEN_KEY, credentials);
        useCredentials(credentials);
    }
    function useCredentials(credentials) {
        isAuthenticated = true;
        userid = credentials.userid;
        username = credentials.username;
        authToken = credentials.token;
        // Set the token as header for your requests!
        $http.defaults.headers.common['x-access-token'] = authToken;
    }
    function destroyUserCredentials() {
        authToken = undefined;
        username = '';
        userid = '';
        isAuthenticated = false;
        $http.defaults.headers.common['x-access-token'] = authToken;
        $localStorage.remove(TOKEN_KEY);
    }
    authFac.login = function(loginData) {
        $resource(baseURL + "Customers/login")
        .save(loginData,
           function(response) {
              storeUserCredentials({username:loginData.username, userid:response.userId, token: response.id});
              $rootScope.$broadcast('login:Successful');
           },
           function(response){
              isAuthenticated = false;
              var message = '<div><p>' +  response.data.error.message + '</p><p>' + response.data.error.name + '</p></div>';
              var alertPopup = $ionicPopup.alert({
                  title: '<h4>Login Failed!</h4>',
                  template: message
              });
              alertPopup.then(function(res) {
                  console.log('Login Failed!');
              });
           }
        );
    };
    authFac.logout = function() {
        $resource(baseURL + "Customers/logout").get(function(response){
        });
        destroyUserCredentials();
    };
    authFac.register = function(registerData) {
        $resource(baseURL + "Customers")
        .save(registerData,
           function(response) {
              authFac.login({username:registerData.username, password:registerData.password});
              $rootScope.$broadcast('registration:Successful');
              var alertPopup = $ionicPopup.alert({
                  title: '<h4>User registered successfully!</h4>',
                  template: ''
              });
              alertPopup.then(function(res) {
                  console.log('User registered successfully!');
              });
           },
           function(response){
              var message = '<div><p>' +  response.data.error.message +
                  '</p><p>' + response.data.error.name + '</p></div>';
              var alertPopup = $ionicPopup.alert({
                  title: '<h4>Registration Failed!</h4>',
                  template: message
              });
              alertPopup.then(function(res) {
                  console.log('Registration Failed!');
              });
           }
        );
    };
    authFac.isAuthenticated = function() {
        return isAuthenticated;
    };
    authFac.getUsername = function() {
        return username;
    };
    authFac.getUserId = function() {
        return userid;
    };
    authFac.getAuthToken = function() {
        return authToken;
    };
    authFac.facebook = function() {

    };
    loadUserCredentials();
    return authFac;
}])
;
