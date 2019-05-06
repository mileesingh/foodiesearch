var app = angular.module("app", ['ngAnimate', 'ngMaterial', 'ngResource']);
var i=0;
//https://gist.github.com/vinaygopinath/49df0b58a276281e5ffa
//Service for AutoComplete of Places and bounded using CurrentLocation for biased results
//Used CurrentLocation Service to get the Location of the User
app.directive('placeAutocomplete', function (CurrentLocation) {
    return {
        templateUrl: 'place-autocomplete.html',
        restrict: 'E',
        replace: true,
        scope: {
            'ngModel': '='
        },
        controller: function ($scope, $q) {
            if (!google || !google.maps) {
                throw new Error('Google Maps JS library is not loaded!');
            } else if (!google.maps.places) {
                throw new Error('Google Maps JS library does not have the Places module');
            }
            var autocompleteService = new google.maps.places.AutocompleteService();
            var map = new google.maps.Map(document.createElement('div'));
            var placeService = new google.maps.places.PlacesService(map);
            var location = null;
            CurrentLocation.getCurrentPosition().then(function (data) {
                location = new google.maps.LatLng({lat: data.coords.latitude, lng: data.coords.longitude});
            });
            $scope.ngModel = {};

            /**
             * @ngdoc function
             * @name getResults
             * @description
             *
             * Helper function that accepts an input string
             * and fetches the relevant location suggestions
             *
             * This wraps the Google Places Autocomplete Api
             * in a promise.
             *
             * Refer: https://developers.google.com/maps/documentation/javascript/places-autocomplete#place_autocomplete_service
             */
            var getResults = function (address) {
                var deferred = $q.defer();
                autocompleteService.getQueryPredictions({
                    input: address,
                    location: location,
                    radius: '100'
                }, function (data) {
                    deferred.resolve(data);
                });
                return deferred.promise;

            };

            /**
             * @ngdoc function
             * @name getDetails
             * @description
             * Helper function that accepts a place and fetches
             * more information about the place. This is necessary
             * to determine the latitude and longitude of the place.
             *
             * This wraps the Google Places Details Api in a promise.
             *
             * Refer: https://developers.google.com/maps/documentation/javascript/places#place_details_requests
             */
            var getDetails = function (place) {
                var deferred = $q.defer();
                placeService.getDetails({
                    'placeId': place.place_id
                }, function (details) {
                    deferred.resolve(details);
                });
                return deferred.promise;
            };

            $scope.search = function (input) {
                if (!input) {
                    return;
                }
                return getResults(input).then(function (places) {
                    return places;
                });
            };
            /**
             * @ngdoc function
             * @name getLatLng
             * @description
             * Updates the scope ngModel variable with details of the selected place.
             * The latitude, longitude and name of the place are made available.
             *
             * This function is called every time a location is selected from among
             * the suggestions.
             */
            $scope.getLatLng = function (place) {
                if (!place) {
                    $scope.ngModel = {};
                    return;
                }
                getDetails(place).then(function (details) {
                    $scope.ngModel = {
                        'component': details.address_components[0].long_name,
                        'name': place.description,
                        'latitude': details.geometry.location.lat(),
                        'longitude': details.geometry.location.lng()
                    };
                });
            }
        }
    };
});
//Current Location Service
app.factory("CurrentLocation", function ($q, $window) {
    'use strict';

    function getCurrentPosition() {
        var deferred = $q.defer();

        if (!$window.navigator.geolocation) {
            deferred.reject('Geolocation not supported.');
        } else {
            $window.navigator.geolocation.getCurrentPosition(
                function (position) {
                    deferred.resolve(position);
                },
                function (err) {
                    deferred.reject(err);
                });
        }

        return deferred.promise;
    }

    return {
        getCurrentPosition: getCurrentPosition
    };
})
//Service to get Data from Yelp Search API
app.factory("YelpSearchFactory", function ($http) {
    return {
        getData: function (terms, coord, location, category, limit) {
            var auth = {
                //
                // Update with your auth tokens.
                //
                consumerKey: "xeV_dERZPt3lLtmpi8uH5Q",
                consumerSecret: "XE5gQfUSpbDE3tjGys5ly3HNhsg",
                accessToken: "D25VBh85P31HXF_O0vTTMvJ7mTi3I3Zq",
                // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
                // You wouldn't actually want to expose your access token secret like this in a real application.
                accessTokenSecret: "2-mGOok-KmXg6oYltIdShOOXwY8",
                serviceProvider: {
                    signatureMethod: "HMAC-SHA1"
                }
            };
            var accessor = {
                consumerSecret: auth.consumerSecret,
                tokenSecret: auth.accessTokenSecret
            };
            parameters = [];
            parameters.push(['term', terms]);
            parameters.push(['ll', coord]);
            //parameters.push(['location',location])
            parameters.push(['sort', 0]);
            if (limit !== -1) {
                parameters.push(['limit', limit]);
            }
            parameters.push(['category_filter', category]);
            parameters.push(['oauth_consumer_key', auth.consumerKey]);
            parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
            parameters.push(['oauth_token', auth.accessToken]);
            parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
            parameters.push(['callback', 'angular.callbacks._' + angular.callbacks.$$counter]);

            var message = {
                'action': 'https://api.yelp.com/v2/search',
                'method': 'GET',
                'parameters': parameters
            };
            OAuth.setTimestampAndNonce(message);
            OAuth.SignatureMethod.sign(message, accessor);
            var parameterMap = OAuth.getParameterMap(message.parameters);
            parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);
            return $http.jsonp(message.action, {params: parameterMap, isArray: true}).then(function (response) {
                i++;
                return response.data;
            });
        }
    }

});
//Service to get Data from Yelp Business API
app.factory("YelpBusinessFactory", function ($http) {
    return {
        getData: function (id) {
            var auth = {
                //
                // Update with your auth tokens.
                //
                consumerKey: "xeV_dERZPt3lLtmpi8uH5Q",
                consumerSecret: "XE5gQfUSpbDE3tjGys5ly3HNhsg",
                accessToken: "D25VBh85P31HXF_O0vTTMvJ7mTi3I3Zq",
                // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
                // You wouldn't actually want to expose your access token secret like this in a real application.
                accessTokenSecret: "2-mGOok-KmXg6oYltIdShOOXwY8",
                serviceProvider: {
                    signatureMethod: "HMAC-SHA1"
                }
            };
            var accessor = {
                consumerSecret: auth.consumerSecret,
                tokenSecret: auth.accessTokenSecret
            };
            parameters = [];
            parameters.push(['oauth_consumer_key', auth.consumerKey]);
            parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
            parameters.push(['oauth_token', auth.accessToken]);
            parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
            parameters.push(['callback', 'angular.callbacks._' + angular.callbacks.$$counter]);

            var message = {
                'action': 'https://api.yelp.com/v2/business/' + id,
                'method': 'GET',
                'parameters': parameters
            };
            OAuth.setTimestampAndNonce(message);
            OAuth.SignatureMethod.sign(message, accessor);
            var parameterMap = OAuth.getParameterMap(message.parameters);
            parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);
            return $http.jsonp(message.action, {
                params: parameterMap,
                isArray: true
            }).then(function (response) {

                return response.data;
            });
        }
    }

});
//Controller to handle all the data and events
app.controller("CategoryController", function ($scope, $http, $timeout, $q, $log, CurrentLocation, YelpSearchFactory, YelpBusinessFactory) {
    $scope.location;
    var coord;
    $scope.display = false;
    $scope.selectedItem = '';
    $scope.isDisabled = false;
    $scope.data = [];
    $scope.busdata = [];
    //Get Current Location
    CurrentLocation.getCurrentPosition().then(function (data) {
        coord = {lat: data.coords.latitude, lng: data.coords.longitude};
        //After getting Current Location get top 6 places based on location
        YelpSearchFactory.getData("restaurants", coord.lat + "," + coord.lng, "", "", "6").then(function (data) {
            $scope.data = data;
            $scope.display = true;
        });
    });
    //Get Category from json file to use in Auto Complete
    $http.get("static/categories.json").success(function (data) {
        var category = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].parents[0] === "restaurants") {
                category.push(data[i]);
            }
        }
        $scope.states = category;
    });
    //Search Category in Array and Filter
    $scope.querySearch = function (query) {
        var results = query ? $scope.states.filter(createFilterFor(query)) : $scope.states,
            deferred;
        return results;
    }
    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(state) {
            return (angular.lowercase(state.title).indexOf(lowercaseQuery) === 0);
        };
    }
    //Open Map Dialog box and pass coordinates
    $scope.showmap = function (start_latitude, end_longitude) {
        window.showmap(start_latitude, end_longitude);
    }
    //Find Button Event
    $scope.find = function () {
        $scope.display = false;
        //Check for Selected Item(Category)
        if ($scope.selectedItem !== '') {
            if ($scope.selectedItem !== null) {
                var location = $scope.location.latitude + "," + $scope.location.longitude;
                //Call Yelp Service and get data
                YelpSearchFactory.getData("restaurants", location, $scope.location.name, $scope.selectedItem.alias, 10).then(function (data) {
                    $scope.data = data;
                    $scope.display = true;
                    ga('send','event','yelp','click','yelpapi');
                });
            }
        }
    }
    //Open View More Dialog box and pass id of the place
    $scope.showmore = function (id) {
        YelpBusinessFactory.getData(id).then(function (data) {
            ga('send','event','yelp','click','yelpbusiness');
            $scope.busdata = data;
            console.log($scope.busdata);
            window.openmore();

        });
    }
});
