angular.module('HelloWorld.Domain.User',
    [],
    function($provide) {
    $provide.factory('User',
            function($log)
        {
    var User = Class.extend
    ({
        construct: function(){
            var self = this;

            var ID;
            var isProxy = true;
            var isShell = true;
            var isValid = true;
            var isLoading = false;
            var cn = "io.activestack.helloworld.model.User";
            var dateCreated;
            var dateModified;
            var userId;
            var firstName;
            var lastName;
            var nickName;
            var userRoles = []; // UserRole

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
            Object.defineProperty(this, "userRoles", { // UserRole
                get: function() {
                    this.doLoad();
                    return userRoles;
                },
                set: function(val) {
                    userRoles = val;
                },
                enumerable: true
            });
        },
        removeReferences: function() {
                for (var i = this.userRoles.length - 1; i >=0; i--) {
                    var o = this.user[i];
                    o.user = null;
                }
        },

        toClassPair: function() {
            return {ID: this.ID, className: this.cn};
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
            o.userRoles = [];
            for (var i = 0; i < this.userRoles.length; i++) {
                var entity = this.userRoles[i];
                o.userRoles.push(entity.toClassPair());
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
            if (this.isShell && !this.isLoading) {
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
    User.prototype._all = [];
    User.prototype._allIsLoaded = false;

    Object.defineProperty(User.prototype, "all", {
        get: function() {
            if(!User.prototype._allIsLoaded){
                User.prototype._allIsLoaded = true;
                this.api.getAllByName("io.activestack.helloworld.model.User", function(result){
                    // Do nothing
                });
            }

            return User.prototype._all;
        },

        enumerable: true
    });

return User;
    });
});



