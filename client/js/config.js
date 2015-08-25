angular.module('Percero.Config', [], function($provide) {
    $provide.factory('PerceroConfig', function($log) {
        return {
          // The hostname and port of the ActiveStack gateway to be used
          gatewayIp: "localhost",
          gatewayPort: "8080",
          // The OAuth provider used for authentication
          oauthProviders: {
            "google": {
              redirectUri: "http://localhost:8081/oauth2callback.html",
              appKey: "426306336879-m3ffk6mqt63pot5pg1kq52b7rmf2lnfo.apps.googleusercontent.com",
              displayName: "Google"
            }
          }
        };
    });
});