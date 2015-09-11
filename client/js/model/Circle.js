angular.module('HelloWorld.Domain.Circle',
    [],
    function($provide) {
        $provide.factory('Circle',
            function($log)
            {
                var Circle = Class.extend
                ({
                    construct: function(){
                        var self = this;

                        var ID;
                        var isProxy = true;
                        var isShell = true;
                        var isValid = true;
                        var isLoading = false;
                        var cn = "io.activestack.helloworld.model.Circle";
                        var color;
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
                        Object.defineProperty(this, "color", {
                            get: function() {
                                this.doLoad();
                                return color;
                            },
                            set: function(val) {
                                color = val;
                            },
                            enumerable: true
                        });

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
                                        for (var i = 0; i < val.circles.length; i++) {
                                            var object = val.circles[i];
                                            if (object === self) {
                                                existing = true;
                                                break;
                                            }
                                        }
                                        if (!existing) val.circles.push(self);
                                    } else if (person != null) {
                                        for (var i = 0; i < person.circles.length; i++) {
                                            var object = person.circles[i];
                                            if (object === self) {
                                                person.circles.splice(i, 1);
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
                        o.color = this.color;
                        o.person = this.person != null ? this.person.toClassPair() : null;

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
                Circle.prototype._all = [];
                Circle.prototype._allIsLoaded = false;

                Object.defineProperty(Circle.prototype, "all", {
                    get: function() {
                        if(!Circle.prototype._allIsLoaded){
                            Circle.prototype._allIsLoaded = true;
                            this.api.getAllByName("io.activestack.helloworld.model.Circle", function(result){
                            });
                        }

                        return Circle.prototype._all;
                    },

                    enumerable: true
                });

                return Circle;
            });
    });



