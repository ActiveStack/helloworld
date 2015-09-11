angular.module('Percero.Domain',[
        'HelloWorld.Domain.Person',
        'HelloWorld.Domain.PersonRole',
        'HelloWorld.Domain.Email',
        'HelloWorld.Domain.Block',
        'HelloWorld.Domain.Circle']
    , function($provide) {
    $provide.factory('PerceroDomain',
        // Uses dependency injection to include each of the model class modules
        function($log, Person, PersonRole, Email, Block, Circle) {
            return {
                init:function(PerceroApi){
                    for(var key in this){
                        if(typeof this[key] !== 'init'){
                            this[key].prototype.api = PerceroApi;
                        }
                    }
                },
                // Expose your model classes here
                Person:       Person,
                PersonRole:   PersonRole,
                Email:      Email,
                Block:      Block,
                Circle:     Circle
            }
        }
    );
});


