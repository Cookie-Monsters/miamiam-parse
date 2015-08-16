
var url = 'api.foursquare.com/v2';
var clientId = '';
var clientSecret = '';
/*
https://api.foursquare.com/v2/venues/search
  ?client_id=CLIENT_ID
  &client_secret=CLIENT_SECRET
  &v=20130815
  &ll=40.7,-74
  &query=sushi
  */

module.exports = {
  initialize: function(apiClientId, apiClientSecret) {
    clientId = apiClientId;
    clientSecret = apiClientSecret;
    return this;
  },

  searchVenues: function(params, successCallback, errorCallback) {
      queryParams = {
          client_id : clientId,
          client_secret: clientSecret,
          ll: params['location'],
          query: "food",
          radius: params['distance'],
          intent: 'browse',
          v: 20130815

        }
     return Parse.Cloud.httpRequest({
       method: "GET",
       url: "https://" + url + "/venues/search",
       params: queryParams,
    }).then(function(httpResponse) {
       successCallback(httpResponse);

   }, function(httpResponse) {
          errorCallback(httpResponse);
    //    console.error('Request failed with response code ' + httpResponse.status);
    //    response.error("error");
   });
   }
}
