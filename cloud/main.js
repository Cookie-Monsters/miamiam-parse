/* TODO:
- Modify model for accepting miam. right now it is in the status of class miam.
It won't work for multiple guests...
- hasProperty seems to not work.
*/
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
    var foursquare = require('cloud/foursquare.js');
    foursquare.initialize('YD4O1MM5FRZSKI3FFSL200YT2Y2TIW40SZRHT0GN51FME4W0', 'NHGCYC4MOG2XAAIGUULEEUPWBOMG0UOFY1CKP1JEJBVA3MBS');
    foursquare.searchVenues(request.params, function(httpResponse) {
        var listRestaurant = httpResponse.data.response.venues;

        var Restaurant = Parse.Object.extend("Restaurant");

        for (var x = 0; x < listRestaurant.length; x++) {
            var restaurant = new Restaurant();
            var point = new Parse.GeoPoint(parseFloat(listRestaurant[x].location.lat), parseFloat(listRestaurant[x].location.lng));
            restaurant.set("foursquareId", listRestaurant[x].id);
            restaurant.set("name", listRestaurant[x].name);
            restaurant.set("geoPosition", point);
            restaurant.set("postalCode", listRestaurant[x].postalCode);
            restaurant.set("address", listRestaurant[x].address);
            restaurant.set("distance", listRestaurant[x].distance);
            restaurant.set("miam", miam);
            restaurant.save(null, {
                success: function(restaurant) {
                    console.log('successfully saved');
                },
                error: function(restaurant) {
                    console.log('error while saving the restaurant');
                }
            });
        }
        // TODO: move this to own function create meeting point
        // test it and reactivate afterwards
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
});

Parse.Cloud.define("sendMiamRequest", function(request, response) {
    sendPush({
        alert: "Miam?",
        type: "MiamAccepted",
        targetUserId: "yU9R9OzpgO",
        sender: "Markus",
        miamId: "02qm2wbOWo"
    });
});
/* Params
targetUserId
sender
type
...
*/
// cannot send object? error: bad special key: __type
function sendPush(data) {
    console.log("sending push 1");

    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("objectId", data.targetUserId);
    console.log("sending push 2");
    // Find devices associated with these users
    var pushQuery = new Parse.Query(Parse.Installation);
    pushQuery.matchesQuery('user', userQuery);
    console.log("sending push 3");
    var data = {
      alert: data.alert,
      category: data.type,
      miamId: data.miamId,
      username: data.sender
  };
    console.log("sending push 4");
    // Send push notification to query
    console.log("sending push " + data);
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
    if (!request.object.hasProperty("miam") || request.object.hasProperty("guest")) {
        return false;
    }
    var miam = request.object.get("miam");
    var miamQuery = new Parse.Query("Miam");
    miamQuery.get(miam.id, {
        success: function(miam) {
          var miamId = miam.id;
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
                        sender: creator.get('username'),
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

Parse.Cloud.afterSave("Miam", function(request, response) {
    var miam = request.object;
    var status = miam.get("status");
    // TODO: retrieve guest from miam.
    var guest = miam.get("creator")
    switch (status) {
        case "accepted":
            // Notify creator a guest accepted the invite.
            console.log("accepted. Sending push");
            sendPush({
                alert: "Miam!",
                type: "MiamAccepted",
                targetUserId: miam.get("creator"),
                sender: guest,
                miamId: miam.id
            });
            // TODO: cancels all other invites
            break;
        case "pending":
                // stuff
            console.log("pending");
            break;
        default:
            console.log("unsupported status " + status);
            // stuff
    }
});
