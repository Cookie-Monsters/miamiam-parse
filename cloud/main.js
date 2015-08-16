
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

function toRad(value) {
   return value * (Math.PI / 180);
}

function toDegrees(value) {
    return value * (180 / Math.PI);
}

function calculateMidPoint(firstGeoPoint, secondGeoPoint) {
    var lat1 = firstGeoPoint.latitude;
    var lon1 = firstGeoPoint.longitude;
    var lat2 = secondGeoPoint.latitude;
    var lon2 = secondGeoPoint.longitude;

    var dLon = (lon2 - lon1);
    dLon = dLon * Math.PI / 180;

    lat1 = toRad(lat1);
    lat2 = toRad(lat2);
    lon1 = toRad(lon1);

    var Bx = Math.cos(lat2) * Math.cos(dLon);
    var By = Math.cos(lat2) * Math.sin(dLon);
    var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By));
    var lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

    return new Parse.GeoPoint(toDegrees(lat3), toDegrees(lon3));
}

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

        var Miam = Parse.Object.extend("Miam");
        var Restaurant = Parse.Object.extend("Restaurant");

        var miam = new Miam();

        // for (var x = 0; x < listRestaurant.length; x++) {
        //     var restaurant = new Restaurant();
        //     var point = new Parse.GeoPoint(parseFloat(listRestaurant[x].location.lat), parseFloat(listRestaurant[x].location.lng));
        //     restaurant.set("foursquareId", listRestaurant[x].id);
        //     restaurant.set("name", listRestaurant[x].name);
        //     restaurant.set("geoPosition", point);
        //     restaurant.set("postalCode", listRestaurant[x].postalCode);
        //     restaurant.set("address", listRestaurant[x].address);
        //     restaurant.set("distance", listRestaurant[x].distance);
        //     restaurant.set("miam", miam);
        //     restaurant.save(null, {
        //         success: function(restaurant) {
        //             console.log('successfully saved');
        //         },
        //         error: function(restaurant) {
        //             console.log('error while saving the restaurant');
        //         }
        //     });
        // }

        var first = new Parse.GeoPoint(52.518179, 13.392245);
        var second = new Parse.GeoPoint(52.554202, 13.469149);
        console.log(first.kilometersTo(second));
        console.log(first.radiansTo(second));
        console.log(calculateMidPoint(first, second));
//         var query = new Parse.Query("Restaurant");
//         query.limit(3).withinGeoBox("geoPosition", first, second).find({
//             success: function(results) {
//                 console.log(results);
//                 for (var i = 0; i < results.length; i++) {
//                     console.log(results[i].get('geoPosition').latitude);
//                     console.log(results[i].get('geoPosition').longitude);
//                 }
//             },
//             error: function(error) {
//                 console.error(error);
//             }
//         });
        // query.findInBackground(new FindCallback<ParseObject>() { ... });


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
