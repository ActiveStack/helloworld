angular.module('HelloWorld.Domain.UserRole',
    [],
    function($provide) {
    $provide.factory('UserRole', 
            function($log)
        {
    var UserRole = Class.extend
    ({
        construct: function(){
            var self = this;
            
            var ID;
            var isProxy = true;
            var isShell = true;
            var isValid = true;
            var isLoading = false;
            var cn = "io.activestack.helloworld.model.UserRole";
            var dateCreated;
            var dateModified;
            var roleName;
            var user; // User
            
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
            
            Object.defineProperty(this, "roleName", {
                get: function() {
                    this.doLoad();
                    return roleName;
                },
                set: function(val) {
                    roleName = val;
                },
                enumerable: true
            });
            
    
        /** Target Relationships **/

        /** Source Relationships **/
            Object.defineProperty(this, "user", {  // User
                get: function() {
                    this.doLoad();
                    return user;
                },
                set: function(val) {
                    if (!this.isProxy) {
                        if (val != null && !val.isShell) {
                            var existing = false;
                            for (var i = 0; i < val.userRoles.length; i++) {
                                var object = val.userRoles[i];
                                if (object === self) {
                                    existing = true;
                                    break;
                                }
                            }
                            if (!existing) val.userRoles.push(self);
                        } else if (user != null) {
                            for (var i = 0; i < user.userRoles.length; i++) {
                                var object = user.userRoles[i];
                                if (object === self) {
                                    user.userRoles.splice(i, 1);
                                }
                            }
                        }
                    }
                    user = val;
                },
                enumerable: true
            });
    
        },
        removeReferences: function() {
                this.user = null;
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
            o.roleName = this.roleName;
            o.user = this.user != null ? this.user.toClassPair() : null;
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
    UserRole.prototype._all = [];
    UserRole.prototype._allIsLoaded = false;

    Object.defineProperty(UserRole.prototype, "all", {
        get: function() {
            if(!UserRole.prototype._allIsLoaded){
                UserRole.prototype._allIsLoaded = true;
                this.api.getAllByName("io.activestack.helloworld.model.UserRole", function(result){
                    // Do nothing
                });
            }
                
            return UserRole.prototype._all;
        },

        enumerable: true
    });
        
return UserRole;
    });
});



