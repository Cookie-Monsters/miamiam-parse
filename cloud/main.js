
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
        //         }, =
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

// Parse.Cloud.define("sendMiamRequest", function(request, response) {
//     // var userQuery = new Parse.Query(Parse.User);
//     // userQuery.equalTo("name", "netbe");
//
//     // Find devices associated with these users
//     var pushQuery = new Parse.Query(Parse.Installation);
//     // pushQuery.matchesQuery('user', userQuery);
//
//     // Send push notification to query
//     Parse.Push.send({
//       where: pushQuery,
//       data: {
//         alert: "Miam?",
//         category: "MiamRequest"
//       }
//     }, {
//       success: function() {
//           console.log('yoo');
//         // Push was successful
//       },
//       error: function(error) {
//           console.log('nooo');
//         // Handle error
//       }
//     });
// });

Parse.Cloud.define("sendMiamRequest", function(request, response) {
    sendPush({
        alert: "Miam?",
        type: "MiamAccepted",
        targetUserId: "yU9R9OzpgO",
        creatorName: "Markus",
        miamId: "02qm2wbOWo"
    });
});

function sendPush(data) {
    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("objectId", data.targetUserId);

    // Find devices associated with these users
    var pushQuery = new Parse.Query(Parse.Installation);
    pushQuery.matchesQuery('user', userQuery);

    var data = {
      alert: data.alert,
      category: data.type,
      miamId: data.miamId,
      username: data.creatorName
  };

    // Send push notification to query
    Parse.Push.send({
      where: pushQuery,
      data: data
    }, {
      success: function() {
          console.log('yoo');
        // Push was successful
      },
      error: function(error) {
          console.log('nooo');
        // Handle error
      }
    });
}

Parse.Cloud.afterSave("Invitation", function(request, response) {
    var miamId;
    var miam = request.object.get("miam");
    var miamQuery = new Parse.Query("Miam");
    miamQuery.get(miam.id, {
        success: function(miam) {
          miamId = miam.id;
          var guest = request.object.get("guest");
          var guestQuery = new Parse.Query("_User");
          guestQuery.get(guest.id, {
          success: function(user) {
              var createQuery = new Parse.Query("_User");
              var creatorId = miam.get('creator').id;
              createQuery.get(miam.get('creator').id, {
                  success: function(creator) {
                    sendPush({
                        alert: "Miam?",
                        type: "MiamRequest",
                        targetUserId: user.id,
                        creatorName: creator.get('username'),
                        miamId: miamId
                    });
                  },
                  error: function(error) {
                    console.error("Got an error " + error.code + " : " + error.message);
                  }
              })
          },
          error: function(error) {
            console.error("Got an error " + error.code + " : " + error.message);
          }
          });
        },
        error: function(error) {
          console.error("Got an error " + error.code + " : " + error.message);
        }
    });
});

// Parse.Cloud.run('findRestaurant', { movie: 'The Matrix' }, {
//   success: function(ratings) {
//     // ratings should be 4.5
//   },
//   error: function(error) {
//   }
// });
