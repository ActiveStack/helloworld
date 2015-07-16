angular.module('HelloWorld.Domain.Block',
    [],
    function($provide) {
        $provide.factory('Block',
            function($log)
            {
                var Block = Class.extend
                ({
                    construct: function(){
                        var self = this;

                        var ID;
                        var isProxy = true;
                        var isShell = true;
                        var isValid = true;
                        var isLoading = false;
                        var cn = "io.activestack.helloworld.model.Block";
                        var color;

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
                Block.prototype._all = [];
                Block.prototype._allIsLoaded = false;

                Object.defineProperty(Block.prototype, "all", {
                    get: function() {
                        if(!Block.prototype._allIsLoaded){
                            Block.prototype._allIsLoaded = true;
                            this.api.getAllByName("io.activestack.helloworld.model.Block", function(result){
                            });
                        }

                        return Block.prototype._all;
                    },

                    enumerable: true
                });

                return Block;
            });
    });



