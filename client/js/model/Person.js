angular.module('HelloWorld.Domain.Person',
    [],
    function($provide) {
    $provide.factory('Person',
            function($log)
        {
    var Person = Class.extend
    ({
        construct: function(){
            var self = this;

            var ID;
            var isProxy = true;
            var isShell = true;
            var isValid = true;
            var isLoading = false;
            var cn = "io.activestack.helloworld.model.Person";
            var dateCreated;
            var dateModified;
            var userId;
            var firstName;
            var lastName;
            var nickName;
            var personRoles = []; // PersonRole
            var emails = []; // Email
            var circles = []; // Circle

            Object.defineProperty(this, "isProxy", {
                get: function() {
                    return isProxy;
                },
                set: function(val) {
                    isProxy = val;
                },
                enumerable: false
            });

            Object.defineProperty(this, "isShell", {
                get: function() {
                    return isShell;
                },
                set: function(val) {
                    isShell = val;
                },
                enumerable: false
            });

            Object.defineProperty(this, "isValid", {
                get: function() {
                    return isValid;
                },
                set: function(val) {
                    isValid = val;
                },
                enumerable: false
            });

            Object.defineProperty(this, "isLoading", {
                get: function() {
                    return isLoading;
                },
                set: function(val) {
                    isLoading = val;
                },
                enumerable: false
            });

            Object.defineProperty(this, "ID", {
                get: function() {
                    return ID;
                },
                set: function(val) {
                    ID = val;
                },
                enumerable: true
            });

            Object.defineProperty(this, "cn", {
                get: function() {
                    return cn;
                },
                set: function(val) {
                    cn = val;
                },
                enumerable: true
            });

        /** Properties **/
            Object.defineProperty(this, "dateCreated", {
                get: function() {
                    this.doLoad();
                    return dateCreated;
                },
                set: function(val) {
                    dateCreated = val;
                },
                enumerable: true
            });

            Object.defineProperty(this, "dateModified", {
                get: function() {
                    this.doLoad();
                    return dateModified;
                },
                set: function(val) {
                    dateModified = val;
                },
                enumerable: true
            });

            Object.defineProperty(this, "userId", {
                get: function() {
                    this.doLoad();
                    return userId;
                },
                set: function(val) {
                    userId = val;
                },
                enumerable: true
            });

            Object.defineProperty(this, "firstName", {
                get: function() {
                    this.doLoad();
                    return firstName;
                },
                set: function(val) {
                    firstName = val;
                },
                enumerable: true
            });

            Object.defineProperty(this, "lastName", {
                get: function() {
                    this.doLoad();
                    return lastName;
                },
                set: function(val) {
                    lastName = val;
                },
                enumerable: true
            });

        /** Target Relationships **/
            Object.defineProperty(this, "personRoles", { // PersonRole
                get: function() {
                    this.doLoad();
                    return personRoles;
                },
                set: function(val) {
                    personRoles = val;
                },
                enumerable: true
            });

            Object.defineProperty(this, "emails", { // PersonRole
                get: function() {
                    this.doLoad();
                    return emails;
                },
                set: function(val) {
                    emails = val;
                },
                enumerable: true
            });

            Object.defineProperty(this, "circles", { // Circle
                get: function() {
                    this.doLoad();
                    return circles;
                },
                set: function(val) {
                    circles = val;
                },
                enumerable: true
            });
        },
        removeReferences: function() {
            for (var i = this.personRoles.length - 1; i >=0; i--) {
                var o = this.personRoles[i];
                o.person = null;
            }

            for (var i = this.emails.length - 1; i >=0; i--) {
                var o = this.emails[i];
                o.person = null;
            }

            for (var i = this.circles.length - 1; i >=0; i--) {
                var o = this.circles[i];
                o.person = null;
            }
        },

        toClassPair: function() {
            return {ID: this.ID, cn: this.cn};
        },

        toObject: function() {
            var o = {};
            o.ID = this.ID;
            o.cn= this.cn;
            o.dateCreated = this.dateCreated;
            o.dateModified = this.dateModified;
            o.userId = this.userId;
            o.firstName = this.firstName;
            o.lastName = this.lastName;
            o.personRoles = [];
            for (var i = 0; i < this.personRoles.length; i++) {
                var entity = this.personRoles[i];
                o.personRoles.push(entity.toClassPair());
            }
            o.emails = [];
            for (var i = 0; i < this.emails.length; i++) {
                var entity = this.emails[i];
                o.emails.push(entity.toClassPair());
            }
            o.circles = [];
            for (var i = 0; i < this.circles.length; i++) {
                var entity = this.circles[i];
                o.circles.push(entity.toClassPair());
            }
            return o;
        },

        save: function(callback) {
            if (this.ID == null) {
                this.api.createObject(this.toObject(),callback);
            } else {
                this.api.putObject(this.toObject(),callback);
            }
        },
        remove: function(callback) {
            this.api.removeObject(this, callback);

        }
        ,doLoad: function(){
            if (this.isShell && !this.isLoading && this.ID) {
                this.isLoading = true;
                var that = this;
                this.api.findById(this.cn, this.ID, function() {
                    that.isShell = false;
                    that.isLoading = false;
                });
            }
        }
    });

    // Define static variables and functions
    Person.prototype._all = [];
    Person.prototype._allIsLoaded = false;

    Object.defineProperty(Person.prototype, "all", {
        get: function() {
            if(!Person.prototype._allIsLoaded){
                Person.prototype._allIsLoaded = true;
                this.api.getAllByName("io.activestack.helloworld.model.Person", function(result){
                    // Do nothing
                });
            }

            return Person.prototype._all;
        },

        enumerable: true
    });

return Person;
    });
});



