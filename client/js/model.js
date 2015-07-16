angular.module('Percero.Domain',['HelloWorld.Domain.User','HelloWorld.Domain.UserRole','HelloWorld.Domain.Email','HelloWorld.Domain.Block']
    , function($provide) {
    $provide.factory('PerceroDomain',
        // Uses dependency injection to include each of the model class modules
        function($log, User, UserRole, Email, Block) {
            return {
                init:function(PerceroApi){
                    for(var key in this){
                        if(typeof this[key] !== 'init'){
                            this[key].prototype.api = PerceroApi;
                        }
                    }
                },
                // Expose your model classes here
                User:       User,
                UserRole:   UserRole,
                Email:      Email,
                Block:      Block
            }
        }
    );
});


