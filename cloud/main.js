
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});


Parse.Cloud.define("findRestaurant", function(request, response) {
    // locationA
    // locationB

    // 1) produce resultLocation with radius
    // 2) call foursquare
    // console.log(request.params);
    var foursquare = require('cloud/foursquare.js');
    foursquare.initialize('YD4O1MM5FRZSKI3FFSL200YT2Y2TIW40SZRHT0GN51FME4W0', 'NHGCYC4MOG2XAAIGUULEEUPWBOMG0UOFY1CKP1JEJBVA3MBS');
    var listRestaurant = [];
    foursquare.searchVenues(request.params, function(httpResponse) {
        // console.log(httpResponse.data.response.venues);
        listRestaurant = httpResponse.data.response.venues;
        console.log(listRestaurant);
        console.log('keks');
        for (var x = 0; x < listRestaurant.length; x++) {
            console.log(listRestaurant[x].name);
        }
        // console.log('list of venues ' + listRestaurant);
    }, function(httpResponse) {
        // console.log(httpResponse);
        console.error(httpResponse.text);
    });
    // console.log('list of venues ' + listRestaurant);

});

// Parse.Cloud.run('findRestaurant', { movie: 'The Matrix' }, {
//   success: function(ratings) {
//     // ratings should be 4.5
//   },
//   error: function(error) {
//   }
// });
