/**
 * Utility functions
 * *****************
 */
(function(scope){

    /**
     * Utility function to convert units of measure
     * @param num
     * @param unit
     * @returns {number}
     */
    scope.convertToFeet = function(num, unit, dimension){
        if(!dimension) dimension = 1;
        var feetPerMeter = 3.28084;
        var conversion = 1;
        if(unit){
            if(unit == "Meters"){
                conversion = feetPerMeter;
            }
            else if(unit == "Inches"){
                conversion = 1 / 12.0;
            }
            else if(unit == "Centimeters"){
                conversion = feetPerMeter/100;
            }
        }

        var result = num * (Math.pow(conversion, dimension));

        return result;
    }

    scope.convertToAcre = function(num, unit){
        var numFeet = scope.convertToFeet(num, unit, 2);
        var squareFeetInAcre = 43560.0;

        return numFeet / squareFeetInAcre;
    }

    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };


    function PerceroEventDispatcherDecorator(o){

        var listeners = [];

        o.emit = function(name, data){
            var listener = null;
            for (var i = 0; i < listeners.length; i++) {
                var listener = listeners[i];
                if (listener.name == name) {
                    listener.callback.call(null, {name: name, data: data});
                }
            }
        }

        o.on = function(name, callback){
            listeners.push({name: name, callback: callback});
            return o;
        }
    };

    function Decorate(){};

    Decorate.withEventDispatcher = function(o){
        return new PerceroEventDispatcherDecorator(o);
    }

    scope.Decorate = Decorate;

    function Utils(){};

    Utils.randomUUID = function(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    scope.Utils = Utils;

})(window);