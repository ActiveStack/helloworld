angular.module('HelloWorld.Domain.Email',
    [],
    function($provide) {
        $provide.factory('Email',
            function($log)
            {
                var Email = Class.extend
                ({
                    construct: function(){
                        var self = this;

                        var ID;
                        var isProxy = true;
                        var isShell = true;
                        var isValid = true;
                        var isLoading = false;
                        var cn = "io.activestack.helloworld.model.Email";
                        var dateCreated;
                        var dateModified;
                        var value;
                        var person; // Person

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

                        Object.defineProperty(this, "value", {
                            get: function() {
                                this.doLoad();
                                return value;
                            },
                            set: function(val) {
                                value = val;
                            },
                            enumerable: true
                        });


                        /** Target Relationships **/

                        /** Source Relationships **/
                        Object.defineProperty(this, "person", {  // Person
                            get: function() {
                                this.doLoad();
                                return person;
                            },
                            set: function(val) {
                                if (!this.isProxy) {
                                    if (val != null && !val.isShell) {
                                        var existing = false;
                                        for (var i = 0; i < val.emails.length; i++) {
                                            var object = val.emails[i];
                                            if (object === self) {
                                                existing = true;
                                                break;
                                            }
                                        }
                                        if (!existing) val.emails.push(self);
                                    } else if (person != null) {
                                        for (var i = 0; i < person.emails.length; i++) {
                                            var object = person.emails[i];
                                            if (object === self) {
                                                person.emails.splice(i, 1);
                                            }
                                        }
                                    }
                                }
                                person = val;
                            },
                            enumerable: true
                        });

                    },
                    removeReferences: function() {
                        this.person = null;
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
                        o.value = this.value;
                        o.Person = this.person != null ? this.person.toClassPair() : null;
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
                Email.prototype._all = [];
                Email.prototype._allIsLoaded = false;

                Object.defineProperty(Email.prototype, "all", {
                    get: function() {
                        if(!Email.prototype._allIsLoaded){
                            Email.prototype._allIsLoaded = true;
                            this.api.getAllByName("io.activestack.helloworld.model.Email", function(result){
                                // Do nothing
                            });
                        }

                        return Email.prototype._all;
                    },

                    enumerable: true
                });

                return Email;
            });
    });



