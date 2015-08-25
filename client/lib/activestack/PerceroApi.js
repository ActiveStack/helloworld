angular.module('Percero.Api', ['Percero.Model','Percero.Client','Percero.Config','Percero.Domain'], function($provide) {
    $provide.factory('PerceroApi', function($log, PerceroModel, PerceroClient, PerceroConfig, PerceroDomain) {
        var PerceroApi = function() {
            Decorate.withEventDispatcher(this);
            var self = this;
            var client;
            var deviceId = Utils.randomUUID();
            var oauthCode;
            var userToken;
            var awaitingLogout = false;
            var reconnectAttempts = 0;
            var isReconnecting = false;
            var reconnectTimer;
            var currentOauthProvider = false;
            var currentOauthProviderId = false;

            // Need to inject the API service into the domain classes because they use it directly
            PerceroDomain.init(this);

            this.authenticateFromCookie = function(){
                var deferred = autoLoginDeferred = Q.defer();

                autoLoginTimeout = setTimeout(function(){
                    if(autoLoginDeferred) {
                        autoLoginDeferred.reject(new Error("Login Timed Out"));
                        autoLoginDeferred = null;
                        autoLoginUT = null;
                        autoLoginTimeout = null;
                    }
                },45000);

                userToken = this.getCookie('userToken');
                // if we have a userToken and it is valid
                if(userToken && userToken.clientId && userToken.token && userToken.user && userToken.user.ID){
                    // This will create connect to the server, and when it has established the connection will call our callback
                    // Which will try to autologin
                    deferred.notify(1);
                    self.connect()
                        .then(function(){
                            deferred.notify(2);
                            var request = {};
                            request.cn = "com.percero.agents.auth.vo.ReauthenticationRequest";
                            request.regAppKey = "";
                            request.clientId = userToken.clientId;
                            request.token = userToken.token;
                            request.userId = userToken.user.ID;
                            request.deviceId = userToken.deviceId;

                            console.log("Request")
                            console.log(request);
                            client.sendRequest("reauthenticate", request, function(message){
                                console.log(message);
                                autoLoginUT = message.result;
                                deferred.notify(3);

//                        deferred.resolve(message.result);
                            });
                        }, function(err){
                            deferred.reject(err);
                        });
                }
                else{
                    deferred.reject(new Error("No userToken cookie found"));
                }

                return deferred.promise;
            };

            this.authenticateAnonymously = function(){
                var deferred = Q.defer();

                this.connect()
                    .then(function () {
                        $log.info("Client connected");
                        self.loginAnonymously()
                            .then(
                            function (success) {
                                deferred.resolve(success);
                            },
                            function (error) {
                                deferred.reject(error);
                            });
                    }, function (error) {
                        deferred.reject(error);
                    });

                return deferred.promise;
            };

            this.loginAnonymously = function(){
                console.log("LoginAnonymously called");
                var deferred = loginDeferred = Q.defer();
                loginTimeout = setTimeout(function(){
                    if(loginDeferred) {
                        loginDeferred.reject(new Error("Login Timed Out"));
                        loginDeferred = null;
                        loginUT = null;
                        loginTimeout = null;
                    }
                },45000);
                var request = {};
                request.cn = "com.percero.agents.auth.vo.AuthenticationRequest";
                request.deviceId = deviceId;
                request.authProvider = 'anonymous';
                $log.info('Senging AuthenticationRequest');
                client.sendRequest("authenticate", request, function(message) {
                    console.log("Got authenticate response");
                    if(deferred) {
                        deferred.notify(1);
                    }

                    // Store the userToken in the cookie for later
                    $log.info('authenticateOAuthCode message:');
                    $log.info(message);
                    if(message.result) {
                        userToken = message.result;

                        $log.info('Saving userToken as cookie');
                        self.setCookie('userToken', userToken);
                        /**
                         * TODO: This only seems to break things? Is this really needed?
                         */
                        client.setCommonParams({token: message.result.token,
                            userId: message.result.user.ID,
                            deviceId: message.result.deviceId,
                            sendAck: true});


                        loginUT = userToken;
                    }
                    else
                        deferred.resolve(false);
                });

                return deferred.promise;
            };

            this.authenticateWithOAuth = function(providerId){
                var deferred = Q.defer();
                var progress = 0;
                var stateId = Math.random() * 1000000 + ""; // Required by some OAuth providers to be included in the original request.

                var oauthProvider = undefined;

                // Get the selected oauthProvider, if it exists.  If it does NOT exist then
                //  attempt to grab the default values for oauth.
                if (providerId && PerceroConfig.oauthProviders.hasOwnProperty(providerId)) {
                    oauthProvider = PerceroConfig.oauthProviders[providerId];
                }
                else {
                    throw new Error('OAuth provider: '+providerId+' not configured');
                }

                $log.debug('OAuth Provider: ' + providerId);

                // Set the current OAuth Provider.
                this.currentOauthProvider = oauthProvider;
                this.currentOauthProviderId = providerId;

                if (providerId.toUpperCase() == "GOOGLE") {
                    var uri = "https://accounts.google.com/o/oauth2/auth?client_id="
                        + oauthProvider.appKey + "&access_type=offline&redirect_uri="
                        + oauthProvider.redirectUri + "&response_type=code&" +
                        "prompt=select_account&" +
                        "scope=https://www.googleapis.com/auth/userinfo.profile%20" +
                        "https://www.googleapis.com/auth/userinfo.email%20" +
                        "http://www.google.com/m8/feeds%20" +
                        "https://apps-apis.google.com/a/feeds/groups/";
                    console.log("AuthURI:"+uri);
                }
                else if (providerId.toUpperCase() == "GITHUB") {
                    uri = "https://github.com/login/oauth/authorize?scope=user,repo,public_repo&redirect_uri="
                        + oauthProvider.redirectUri + "&client_id="
                        + oauthProvider.appKey;
                }
                else if (providerId.toUpperCase() == "LINKEDIN") {
                    uri = "https://www.linkedin.com/uas/oauth2/authorization?response_type=code&client_id="
                        + oauthProvider.appKey + "&redirect_uri="
                        + oauthProvider.redirectUri + "&state=" + stateId;
                }
                else {
                    // No valid provider found, so throw error.
                    $log.error('Invalid OAuth Provider');
                    throw new Error('Invalid OAuth Provider');
                }

                var popup = window.open(uri, "oauth", "width=1024,height=768");
                window.oauthCallback = function(paramString) {
                    // console.log("oauthCallback " + paramString);
                    deferred.notify(++progress);

                    // First break up params by '&'
                    var paramSplit = paramString.split('&');

                    for(var i=0; i<paramSplit.length; i++) {
                        var nextParamString = paramSplit[i];
                        var index = nextParamString.indexOf("code=");
                        if (index > -1) {
                            var parts = nextParamString.split("=");
                            oauthCode = parts[1];

                            self.connect()
                                .then(function () {
                                    deferred.notify(++progress);
                                    self.loginOAuth()
                                        .then(
                                        function (success) {
                                            deferred.resolve(success);
                                        },
                                        function (error) {
                                            deferred.reject(error);
                                        },
                                        function (prog) {
                                            deferred.notify(++progress);
                                        });
                                }, function (error) {
                                    deferred.reject(error);
                                });

                            // Found "code", so break out of thwe loop.
                            break;
                        } else {
                            deferred.reject(new Error("Missing OAuth Code from Param String"));
                        }
                    }
                    popup.close();
                }

                return deferred.promise;
            };

            var loginDeferred = null;
            var loginUT = null;
            var loginTimeout = null;
            this.loginOAuth = function() {
                var deferred = loginDeferred = Q.defer();
                loginTimeout = setTimeout(function(){
                    if(loginDeferred) {
                        loginDeferred.reject(new Error("Login Timed Out"));
                        loginDeferred = null;
                        loginUT = null;
                        loginTimeout = null;
                    }
                },45000);
                var request = {};
                request.cn = "com.percero.agents.auth.vo.AuthenticationRequest";
                request.regAppKey = "";
                request.credential = JSON.stringify({
                    code: oauthCode,
                    redirectUrl: this.currentOauthProvider.redirectUri
                    });
                request.deviceId = deviceId;
                request.authProvider = this.currentOauthProviderId;
                $log.info('Senging authenticateOAuthCode request');
                client.sendRequest("authenticate", request, function(message) {
                    if(deferred) {
                        deferred.notify(1);
                    }

                    // Store the userToken in the cookie for later
                    $log.info('authenticateOAuthCode message:');
                    $log.info(message);
                    if(message.result) {
                        userToken = message.result;
                        $log.info('Saving userToken as cookie');
                        self.setCookie('userToken', userToken);
                        /**
                         * TODO: This only seems to break things? Is this really needed?
                         */
                        client.setCommonParams({token: message.result.token,
                            userId: message.result.user.ID,
                            deviceId: message.result.deviceId,
                            sendAck: true});

                        loginUT = userToken;
                    }
                    else
                        deferred.resolve(false);
                });

                return deferred.promise;
            }

            var autoLoginDeferred = null;
            var autoLoginUT = null;
            var autoLoginTimeout = null;
            this.autoLogin = function(){
                var deferred = autoLoginDeferred = Q.defer();

                autoLoginTimeout = setTimeout(function(){
                    if(autoLoginDeferred) {
                        autoLoginDeferred.reject(new Error("Login Timed Out"));
                        autoLoginDeferred = null;
                        autoLoginUT = null;
                        autoLoginTimeout = null;
                    }
                },45000);

                userToken = this.getCookie('userToken');
                // if we have a userToken and it is valid
                if(userToken && userToken.clientId && userToken.token && userToken.user && userToken.user.ID){
                    // This will create connect to the server, and when it has established the connection will call our callback
                    // Which will try to autologin
                    deferred.notify(1);
                    self.connect()
                        .then(function(){
                            deferred.notify(2);
                            var request = {};
                            request.cn = "com.percero.agents.auth.vo.AuthenticateOAuthAccessTokenRequest";
                            request.regAppKey = "";
                            request.clientId = userToken.clientId;
                            request.token = userToken.token;
                            request.userId = userToken.user.ID;
                            request.deviceId = userToken.deviceId;
                            request.accessToken = userToken.accessToken;
                            request.refreshToken = "";
                            request.authProvider = "GOOGLE";

                            console.log("Request")
                            console.log(request);
                            client.sendRequest("authenticateOAuthAccessToken", request, function(message){
                                console.log(message);
                                autoLoginUT = message.result;
                                deferred.notify(3);

//                        deferred.resolve(message.result);
                            });
                        }, function(err){
                            deferred.reject(err);
                        });
                }
                else{
                    deferred.reject(new Error("No userToken cookie found"));
                }

                return deferred.promise;
            }

            this.connect = function() {
                if (client == null) {
                    self.setupClient();
                }

                return client.connect();
            }

            this.setupClient = function(){
                client = PerceroClient;
                this.client = client;
                client.on('connect', function(){
                    clearReconnectTimer();
                    self.emit('connect');
                });
                client.on('disconnect', function(){  // emitted by socketio
                    reconnectAttempts = 0;
                    self.emit('reconnecting');
                    setReconnectTimer();
                });
                /**
                 * I believe this message is sent down after authentication is successful
                 * We have to wait until this message comes down before we can send any messages
                 * so... we have to wait until this event before resolving the login promises.
                 * TOO COMPLICATED....
                 */
                client.on('sync#ConnectResponse', function(evt) {
                    if(autoLoginDeferred){
                        autoLoginDeferred.resolve(autoLoginUT);
                        autoLoginDeferred = null;
                        autoLoginUT = null;
                        clearTimeout(autoLoginTimeout);
                    }
                    else if(loginDeferred){
                        loginDeferred.resolve(loginUT);
                        loginDeferred = null;
                        loginUT = null;
                        clearTimeout(loginTimeout);
                    }
                });
                client.on('auth#DisconnectResponse', function() {
                    awaitingLogout = false;
                    client = null;
                    clearReconnectTimer();
                    self.emit("logout");
                });
                client.on('sync#PushDeleteResponse', function(evt) {
                    var objectList = evt.data.objectList;
                    for (var i = 0; i < objectList.length; i++) {
                        var o = objectList[i];
                        PerceroModel.removeObject(o);
                    };
                });
                client.on('sync#PushCWUpdateResponse', function(evt) {
                    var ob = PerceroModel.findObjectByClassIdPair(evt.data.classIdPair);
                    if(ob){
                        ob[evt.data.fieldName] = evt.data.value;
                        PerceroModel.notifyChanged(evt.data);
                    }
                });
                client.on('connect_failed', function() {
                    if (isReconnecting) {
                        setReconnectTimer();
                    }
                });
            }

            this.findById = function(className, id, callback) {
                var request = {};
                request.cn = "com.percero.agents.sync.vo.FindByIdRequest";
                request.theClassName = className;
                request.theClassId = id;
                request.regAppKey = "";
                request.clientType = "";
                request.svcOauthKey = "";
                client.sendRequest("findById", request, function(result) {
                    result.isShell = false;
                    if (callback) callback(result);
                });
            }

            this.getAllByName = function(className, callback) {
                var request = {};
                request.cn = "com.percero.agents.sync.vo.GetAllByNameRequest";
                request.theClassName = className;
                request.regAppKey = "";
                request.clientType = "";
                request.svcOauthKey = "";
                client.sendRequest("getAllByName", request, function(result) {
                    if(result.result && Array.isArray(result.result)){
                        for(var key in result.result){
                            var ob = result.result[key];
                            ob.isShell = false;
                        }
                    }
                    if (callback) callback(result);
                });
            }

            this.findByExample = function(example, callback) {
                var request = {};
                request.cn = "com.percero.agents.sync.vo.FindByExampleRequest";
                request.regAppKey = "";
                request.clientType = "";
                request.svcOauthKey = "";
                request.theObject = example;
                client.sendRequest("findByExample", request, function(result) {
                    if (callback) callback(result);
                });
            };

            this.putObject = function(o, callback) {
                var request = {};
                request.cn = "com.percero.agents.sync.vo.PutRequest";
                request.regAppKey = "";
                request.clientType = "";
                request.svcOauthKey = "";
                request.theObject = o;
                client.sendRequest("putObject", request, function(result) {
                    if (result.result === true) {
                        PerceroModel.filterIncoming(o);
                        result = true;
                    } else {
                        result = false;
                    }

                    if (callback) callback(result);
                });
            }

            this.createObject = function(o, callback) {
                o.ID = null;
                var request = {};
                request.cn = "com.percero.agents.sync.vo.CreateRequest";
                request.regAppKey = "";
                request.clientType = "";
                request.svcOauthKey = "";
                request.theObject = o;
                client.sendRequest("createObject", request, function(result) {
                    if (callback) callback(result);
                });
            }

            this.removeObject = function(o, callback) {
                var request = {};
                request.cn = "com.percero.agents.sync.vo.RemoveRequest";
                request.regAppKey = "";
                request.clientType = "";
                request.svcOauthKey = "";
                request.removePair = o.toClassPair();
                client.sendRequest("removeObject", request, function(result) {
                    if (result.result === true) {
                        PerceroModel.removeObject(o);
                        result = true;
                    } else {
                        result = false;
                    }

                    if (callback) callback(result);
                });
            }

            /**
             * Sends a message to the server asking for a derived field
             *
             * @param cn - className
             * @param id - object ID
             * @param fieldName - String
             * @param params - Array of Strings
             * @param callback - Callback function for the result
             */
            this.getChangeWatcher = function(cn, id, fieldName, params, callback) {
                var request = {};
                request.cn = "com.percero.agents.sync.vo.PushCWUpdateRequest";
                request.regAppKey = "";
                request.clientType = "";
                request.svcOauthKey = "";
                request.classIdPair = {className: cn, ID: id};
                request.fieldName = fieldName;
                request.params = params;
                client.sendRequest("getChangeWatcher", request, function(result) {
                    if (callback) callback(result);
                });
            }

            /**
             *
             * @param name - server process name
             * @param args - array
             */
            this.serverProcess = function(name, args, callback) {
                var request = {};
                request.cn = "com.percero.agents.sync.vo.RunProcessRequest";
                request.regAppKey = "";
                request.clientType = "";
                request.svcOauthKey = "";
                request.queryName = name;
                request.queryArguments = args;
                client.sendRequest("runProcess", request, function(result) {
                    if (callback) callback(result);
                });
            }

            this.getCookie = function(name){


                var c_value = document.cookie;
                var c_start = c_value.indexOf(" " + name + "=");
                if (c_start == -1)
                {
                    c_start = c_value.indexOf(name + "=");
                }
                if (c_start == -1)
                {
                    c_value = null;
                }
                else
                {
                    c_start = c_value.indexOf("=", c_start) + 1;
                    var c_end = c_value.indexOf(";", c_start);
                    if (c_end == -1)
                    {
                        c_end = c_value.length;
                    }
                    c_value = JSON.parse(c_value.substring(c_start,c_end));
                }
                console.log("Getting Cookie");
                console.log(c_value);
                return c_value;
            }

            this.setCookie = function(name,value)
            {
                console.log("Setting Cookie");
                console.log(value);

                var c_value=JSON.stringify(value);
                document.cookie=name + "=" + c_value;
                console.log(document.cookie);
            }

            function clearReconnectTimer() {
                if (reconnectTimer != null) {
                    clearTimeout(reconnectTimer);
                    reconnectTimer = null;
                }
                isReconnecting = false;
            }
            function setReconnectTimer() {
                reconnectTimer = setTimeout(function() {
                    isReconnecting = true;
                    client.reconnect();
                    reconnectAttempts++;
                }, Math.pow(3, reconnectAttempts) * 1000);
            }

            this.logout = function() {
                awaitingLogout = true;
                client.disconnect(true);
                self.setCookie('userToken',null);
            }

            /**
             * Utility function so that you can ensure a group of objects are loaded before
             * continuing processing.
             *
             * Returns a promise that will be resolved once all objects are loaded
             * Promise will reject if all objects cannot be loaded within a given timeout period
             *
             * @returns - Promise
             */
            this.load = function(obj, timeoutPeriod){
                var deferred = Q.defer();
                timeoutPeriod = timeoutPeriod?timeoutPeriod:10000; // 10 seconds
                var timeoutHandle = null;

                var obArray = [];
                if(!Array.isArray(obj) && obj)
                    obArray.push(obj);
                else
                    obArray = obj;

                // Callback count
                var cbs = 0;
                for(var i in obArray){
                    var item  = obArray[i];
                    // Make sure that the item is an entity object and is not null
                    if(item && item.cn && item.isShell){
                        cbs++;
                        /**
                         * FindById will replace the object in the background so we don't
                         * actually have to deal with the result here.
                         */
                        this.findById(item.cn, item.ID, function(result){
                            cbs--;
                            if(cbs <= 0){
                                deferred.resolve(obj);
                                if(timeoutHandle)
                                    clearTimeout(timeoutHandle);
                            }
                        });
                    }
                }

                // If we didn't need to load anything then we can just resolve now.
                if(cbs <= 0){
                    deferred.resolve(obj);
                }
                else{
                    // Set a timeout to reject the promise.
                    timeoutHandle = setTimeout(function(){
                        deferred.reject(new Error("Load operation timed out"));
                    }, timeoutPeriod);
                }

                return deferred.promise;
            }

            /**
             * Will force load all the objects along a path
             * @param obj
             * @param path - string
             */
            this.loadPath = function(obj, path){
                var parts = path.split('.');
                var obs = Array.isArray(obj)?obj:[obj];
                var promises = [];
                for(var i in obs){
                    (function(){
                        var item = obs[i];
                        var pathPart = parts.shift();
                        var deferred = Q.defer();
                        this.load(item[pathPart])
                            .then(
                            function(){
                                var newPath = parts.join('.');
                                if(newPath === '')
                                    deferred.resolve();
                                else{
                                    this.loadPath(item[pathPart], parts.join('.'))
                                        .then(function(){
                                            deferred.resolve();
                                        }, function(err){
                                            $log.error(err);
                                            deferred.reject(err);
                                        })
                                }

                            }.bind(this),
                            function(err){
                                $log.error(err);
                            });

                        promises.push(deferred.promise);
                    })();
                }

                return Q.allSettled(promises);
            }

            /**
             * Utility function to ensure that a certain path of the object PerceroModel is loaded
             *
             * @param obj
             * @param path
             * @optional timeoutPeriod
             * @returns promise
             */
            this.loadPath = function(obj, path, timeoutPeriod){

                timeoutPeriod = timeoutPeriod?timeoutPeriod:10000; // 10 seconds

                // Load the root object
                var promise = this.load(obj, timeoutPeriod);

                // If the path is non-empty then parse it and load the path
                if(path && path !== ''){
                    promise = promise.then(
                        (function(){
                            var result = null;
                            var parts = path.split(".");
                            var nextPart = parts[0];
                            if(Array.isArray(obj)){
                                var proms = [];
                                for(var i in obj){
                                    var o = obj[i];
                                    var nextOb = o[nextPart];
                                    if(nextOb)
                                        proms.push(this.loadPath(nextOb, parts.slice(1).join("."), timeoutPeriod));
                                }

                                result = Q.all(proms);
                            }
                            else{
                                var nextOb = obj[nextPart];
                                if(nextOb)
                                    result = this.loadPath(nextOb, parts.slice(1).join("."), timeoutPeriod)
                            }

                            return result;
                        }).bind(this)
                    );
                }
//        else
//            promise.then(function(result){
//            });
                return promise;
            }

//            APIExt(this);

        };

        return new PerceroApi();
    });
});