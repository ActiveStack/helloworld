angular.module('percero', ['Percero.Config','Percero.Api','Percero.Domain','Percero.Model'], function($provide) {
    $provide.factory('percero', function($log, PerceroConfig, PerceroApi, PerceroDomain, PerceroModel) {
        function Percero(){

            this.config = PerceroConfig;
            this.decorate = Decorate;
            this.utils = Utils;
            this.api = PerceroApi;
            this.model = PerceroModel;
            this.domain = PerceroDomain;

        };

        return new Percero();
    });
});
