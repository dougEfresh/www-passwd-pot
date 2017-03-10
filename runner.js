function FixedQueue(size, initialValues) {
    initialValues = (initialValues || []);
    var queue = Array.apply(null, initialValues);
    queue.fixedSize = size;
    queue.push = FixedQueue.push;
    queue.splice = FixedQueue.splice;
    queue.unshift = FixedQueue.unshift;
    FixedQueue.trimTail.call(queue);
    return ( queue );
}

FixedQueue.trimHead = function () {
    if (this.length <= this.fixedSize) {
        return;
    }
    Array.prototype.splice.call(this, 0, (this.length - this.fixedSize));
};

FixedQueue.trimTail = function () {
    if (this.length <= this.fixedSize) {
        return;
    }
    Array.prototype.splice.call(this, this.fixedSize, (this.length - this.fixedSize)
    );
};

FixedQueue.wrapMethod = function (methodName, trimMethod) {
    var wrapper = function () {
        var method = Array.prototype[methodName];
        var result = method.apply(this, arguments);
        trimMethod.call(this);
        return ( result );
    };
    return ( wrapper );
};

FixedQueue.push = FixedQueue.wrapMethod("push", FixedQueue.trimHead);
FixedQueue.splice = FixedQueue.wrapMethod("splice", FixedQueue.trimTail);
FixedQueue.unshift = FixedQueue.wrapMethod("unshift", FixedQueue.trimTail);

var hits = FixedQueue(7, []);
var boom = FixedQueue( 7, []);

var map = new Datamap({

        scope: 'world',
        element: document.getElementById('container1'),
        projection: 'winkel3',
        // change the projection to something else only if you have absolutely no cartographic sense

        fills: { defaultFill: 'black', },

        geographyConfig: {
          dataUrl: null,
          hideAntarctica: true,
          borderWidth: 0.75,
          borderColor: '#4393c3',
          popupTemplate: function(geography, data) {
            return '<div class="hoverinfo" style="color:white;background:black">' +
                   geography.properties.name + '</div>';
          },
          popupOnHover: true,
          highlightOnHover: false,
          highlightFillColor: 'black',
          highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
          highlightBorderWidth: 2
        },
    done: connect
      });

function input(data) {
    //console.log(message);
    hits.push({
        origin: {latitude: data.RemoteLatitude, longitude: data.RemoteLongitude},
        destination: {latitude: data.OriginLatitude, longitude: data.OriginLongitude}
    });
    map.arc(hits, {strokeWidth: 2, arcSharpness: 1});

    boom.push( { radius: 7, latitude: data.RemoteLatitude, longitude: data.RemoteLongitude,
                        fillOpacity: 0.5, passwd: data.Passwd} );
    map.bubbles(boom, {
        popupTemplate: function(geo, data) {
            return '<div class="hoverinfo">' + data.passwd + '</div>';
        }
    });

    /* update the scrolling attack div*/
    $('#attackdiv').append(data.RemoteCountry + " (" + data.RemoteAddr + ") " +
        " <span style='color:red'>attacks</span> " +
        data.OriginCountry +  " (" + data.OriginAddr + ") " +
        " <span style='color:steelblue'>(" + data.User +":" +data.Passwd + ")</span> " +
        "<br/>");

    $('#attackdiv').animate({scrollTop: $('#attackdiv').prop("scrollHeight")}, 500);
}

var attacks = [];
var counter = 0;
var interval;

function connect() {
    var self = this;

    console.log('Connecting');

    this.socket = new WebSocket("ws://localhost:8080/api/v1/event/stream/random");

    this.socket.onopen = function () {
        console.log('Connected');
    };

    this.socket.onmessage = function (msg) {
        input(JSON.parse(msg.data));
    };

    this.socket.onclose = function () {
        console.log('Disconnected');
    };
/*
    $.getJSON( "https://api.passwd-pot.com/api/v1/event", function( data ) {
        var items = [];
        attacks = data;
        interval = setInterval(function() {
            if (counter > attacks.length-1) {
                clearInterval(interval);
            } else {
                input(attacks[counter++]);
            }
        }, 750);
    });
    */
}

