angular.module('Percero.Client', ['Percero.Config','Percero.Model'], function($provide) {
    $provide.factory('PerceroClient', function($log, PerceroConfig, PerceroModel) {
        PerceroClient = function() {
            Decorate.withEventDispatcher(this);

            var self = this;
            var config = PerceroConfig;
            var model = PerceroModel;
            var socket;
            var isReconnect = false;
            var reconnectId;
            var connected = false;
            var session = {};
            var commonParams = {};
            var responseCallbacks = {};

            this.connected = connected;

            this.setCommonParams = function(params) {
                $log.info('Setting commonParams');
                $log.info(params);
                commonParams = params;
            }

            this.reconnect = function() {
                isReconnect = true;
                this.connect();
            }

            var connectDeferred = null;
            var connectTimeout = null;
            this.connect = function() {
                connectDeferred = Q.defer();

                // Set a timeout of 10 seconds.
                connectTimeout = setTimeout(function(){
                    if(connectDeferred)
                        connectDeferred.reject(new Error("Connection timed out"));

                    connectTimeout = null;
                }, 10000);


                socket = io.connect('http' +  (config.gatewayPort == 443 ? 's' : '') + '://' + config.gatewayIp + ':' + config.gatewayPort, {
                    'force new connection': true,
                    'reconnect': false,
                    'try multiple transports': false,
                    'secure': (config.gatewayPort == 443 ? true : false)
                });

                socket.on('connect', function() {
                    if (isReconnect) {
                        var connectRequest = {reconnect: {lastSessionId: session.clientId, reconnectId: reconnectId, ensureMessageDelivery: true}};
                        //console.log("Client: reconnect");
                    } else {
                        connectRequest = {connect: {ensureMessageDelivery: true}};
                        //console.log("Client: connect");
                    }
                    socket.emit('message', connectRequest);
                });

                /**
                 * This is basically the response to the above emit('message')
                 */
                socket.on('gatewayConnectAck', function(message) {
                    console.log("Received gatewayConnectAck message");
                    if(connectDeferred){
                        connectDeferred.resolve();
                        connectDeferred = null;
                        clearTimeout(connectTimeout);
                        connectTimeout = null;
                    }

                    self.connected = true;
                    if (session.clientId == undefined) {
                        var updates = message.split(';')[0];
                        var jsonString = atob(updates);
                        //console.log("First gatewayConnectAck: " + jsonString);
                        updates = JSON.parse(jsonString);
                        delete updates.savedAt;
                        self.updateSession(updates);
                        //				connected = true;
                        self.emit('connect');
                    }
                    else {
                        //console.log("Second gatewayConnectAck: " + message);
                        reconnectId = message;
                    }
                });

                socket.on('connecting', function() {
                    console.log("PerceroClient:connecting");
                });
                socket.on('reconnect', function() {
                    console.log("PerceroClient:reconnect");
                });
                socket.on('reconnect', function() {
                    console.log("PerceroClient:reconnect");
                });
                socket.on('connect_failed', function() {
                    console.log("PerceroClient:connect_failed");
                });
                socket.on('reconnect_failed', function() {
                    console.log("PerceroClient:reconnect_failed");
                });
                socket.on('error', function() {
                    console.log("PerceroClient:error");
                });




                socket.on('push', function(message) {
                    var parts = message.cn.match(/^com\.percero\.agents\.([^.]+)\.vo\.(.+)$/);
                    var agent = parts[1];
                    var type = parts[2];
                    var eventName = agent + '#' + type;

                    message = model.filterIncoming(message);

                    var responseCallback = responseCallbacks[message.correspondingMessageId];
                    if (responseCallback) {
                        responseCallback(message, optionsCallback);
                        delete responseCallbacks[message.correspondingMessageId];
                    }

                    self.emit(eventName, message);

                    var autoAck = true;

                    if (autoAck && message.correspondingMessageId) {
                        var ackMessage = {
                            correspondingMessageId: message.correspondingMessageId
                        };
                        self.sendSpecialMessage('ack', ackMessage);
                    }

                    function optionsCallback(options) {
                        if (options.autoAck !== undefined) {
                            autoAck = options.autoAck;
                        }
                    }
                });

                socket.on('disconnect', function(reason) {
                    console.log("Received disconnect message: "+reason);
                    self.connected = false;
                    self.emit('disconnect', reason);
                });



                socket.on('connect_failed', function () {
                    console.log("Received connect_failed message")
                    self.emit('connect_failed');
                });

                return connectDeferred.promise;
            };

            this.disconnect = function(clearLocalData) {
                if (socket) {
                    if (clearLocalData === undefined) {
                        clearLocalData = false;
                    }
                    var logoutRequest = {
                        cn: 'com.percero.agents.sync.vo.LogoutRequest',
                        pleaseDestroyClient: clearLocalData
                    };
                    this.sendRequest('logout', logoutRequest);
                    socket.disconnect();
                }
            };

            this.updateSession = function(updates) {
                for (var key in updates) {
                    session[key] = updates[key];

                    if (updates[key] === undefined) {
                        delete session[key];
                    }
                }
            };

            this.sendRequest = function(type, request, responseCallback) {
                if (!socket) {
                    // XXX: Fail
                }
                var uuid = Utils.randomUUID();
                var payload = { messageId: uuid };
                for (key in request) {
                    payload[key] = request[key];
                }

                if (!request.hasOwnProperty('cn') || request.cn.indexOf('com.percero.agents.auth.vo') < 0) {
                    // These commonParams and anything in the session (which includes clientId)
                    // will override anything in the request with the same keys.
                    // Only included in non auth calls.
                    for (var key in commonParams) {
                        payload[key] = commonParams[key];
                    }
                }
                else {
                    $log.debug('Auth message -> NOT sending commonParams');
                }

                for (var key in session) {
                    payload[key] = session[key];
                }
                if (responseCallback) {
                    responseCallbacks[payload.messageId] = responseCallback;
                }

                socket.emit(type, payload);

                return payload;
            };

            this.sendSpecialMessage = function(type, message) {
                var payload = {};
                payload[type] = message;

                socket.emit('message', payload);
            };

        };

        return new PerceroClient();
    });
});

