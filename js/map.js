//global variables


// This example creates a custom overlay called ATOOverlay, containing
// a U.S. Geological Survey (USGS) image of the relevant area on the map.

// Set the custom overlay object's prototype to a new instance
// of OverlayView. In effect, this will subclass the overlay class.
// Note that we set the prototype to an instance, rather than the
// parent class itself, because we do not wish to modify the parent class.

var map;
var imgOverlay;
ATOOverlay.prototype = new google.maps.OverlayView();

// Initialize the map and the custom overlay.

var infowindow;

(function () {

    //create an array of markers
    google.maps.Map.prototype.markers = new Array();

    //adds a new marker to the array
    google.maps.Map.prototype.addMarker = function(marker) {
        this.markers[this.markers.length] = marker;
    };

    //returns markers in the array
    google.maps.Map.prototype.getMarkers = function() {
        return this.markers
    };

    //closes infowindows
    google.maps.Map.prototype.clearMarkers = function() {
        if(infowindow) {
            infowindow.close();
        }

        for(var i=0; i<this.markers.length; i++){
            this.markers[i].set_map(null);
        }
    };
})();

function initialize() {
    var mapOptions = {
        zoom: 16,
        //center: new google.maps.LatLng(34.18994703, -118.92183252),
        mapTypeId: google.maps.MapTypeId.ROADMAP
        //mapTypeId: google.maps.MapTypeId.SATELLITE
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var swBound = new google.maps.LatLng(34.18605509, -118.92949732);
    var neBound = new google.maps.LatLng(34.20193861, -118.91595312);
    var bounds = new google.maps.LatLngBounds(swBound, neBound);

    // The photograph is courtesy of the U.S. Geological Survey.
    var srcImage = 'img/ato-site-map.png';

    // The custom ATOOverlay object contains the USGS image,
    // the bounds of the image, and a reference to the map.
    imgOverlay = new ATOOverlay(bounds, srcImage, map);

    d3.csv("data/data.csv", function(d) {

        data = d;

        buildInfoWindows();

    });

    // Try HTML5 geolocation
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude,
                position.coords.longitude);

            var image = 'img/you-are-here.png';
            var hereMarker = new google.maps.Marker({
                position: pos,
                map: map,
                icon: image
            });

            map.setCenter(pos);
        }, function() {
            handleNoGeolocation(true);
        });
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }
}

function handleNoGeolocation(errorFlag) {
    //if (errorFlag) {
    //    var content = 'Error: The Geolocation service failed.';
    //} else {
    //    var content = 'Error: Your browser doesn\'t support geolocation.';
    //}

    var options = {
        map: map,
        position: new google.maps.LatLng(34.18994703, -118.92183252),
        //content: content
    };

    map.setCenter(options.position);


} //end initialize function

/** @constructor */
function ATOOverlay(bounds, image, map) {

    // Initialize all properties.
    this.bounds_ = bounds;
    this.image_ = image;
    this.map_ = map;

    // Define a property to hold the image's div. We'll
    // actually create this div upon receipt of the onAdd()
    // method so we'll leave it null for now.
    this.div_ = null;

    // Explicitly call setMap on this overlay.
    this.setMap(map);
}

/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
ATOOverlay.prototype.onAdd = function() {

    var div = document.createElement('div');
    div.style.borderStyle = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';

    // Create the img element and attach it to the div.
    var img = document.createElement('img');
    img.src = this.image_;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.position = 'absolute';
    div.appendChild(img);

    this.div_ = div;

    // Add the element to the "overlayLayer" pane.
    var panes = this.getPanes();
    panes.overlayLayer.appendChild(div);
};

ATOOverlay.prototype.draw = function() {

    // We use the south-west and north-east
    // coordinates of the overlay to peg it to the correct position and size.
    // To do this, we need to retrieve the projection from the overlay.
    var overlayProjection = this.getProjection();

    // Retrieve the south-west and north-east coordinates of this overlay
    // in LatLngs and convert them to pixel coordinates.
    // We'll use these coordinates to resize the div.
    var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
    var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

    // Resize the image's div to fit the indicated dimensions.
    var div = this.div_;
    div.style.left = sw.x + 'px';
    div.style.top = ne.y + 'px';
    div.style.width = (ne.x - sw.x) + 'px';
    div.style.height = (sw.y - ne.y) + 'px';
};

// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
ATOOverlay.prototype.onRemove = function() {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
};

// parses the source csv file into a js object

var data;


// parse the building data file and add one infowindow on click for each building
var buildInfoWindows = function() {

    data.forEach(function(d) {

        //console.log(d);

        var bldgData = '<div><h3>Building: ' + d.building + '</h3>';

        //if (d.visitor) {
        //    bldgData += "<p>Vistor's Center</p>";
        //}

        if (d.fitness) {
            bldgData += '<h4>' + d.fitness + '</a></h4><p>'
                + d.fitnessHours + '</p>';
        }

        if (d.dining) {
            bldgData += '<h4><a href="' + d.diningUrl + '">' + d.dining + '</a></h4><p>'
            + d.diningHours + '</p>';
        }

        if (d.serviceGift) {
            bldgData += '<h4>' + d.serviceGift + '</a></h4><p>'
                + d.serviceGiftHours + '</p>';
        }

        if (d.serviceDryClean) {
            bldgData += '<h4><a href="' + d.serviceDryCleanUrl + '">' + d.serviceDryClean + '</a></h4>';
        }

        if (d.serviceShoe) {
            bldgData += '<h4><a href="' + d.serviceShoeUrl + '">' + d.serviceShoe + '</a></h4>';
        }

        if (d.serviceCarWash) {
            bldgData += '<h4><a href="' + d.serviceCarWashUrl + '">' + d.serviceCarWash + '</a></h4><p>'
                + d.serviceCarWashHours + '</p>';
        }

        bldgData += '</div>';
        var bldgCenter = new google.maps.LatLng(d.lat, d.lng);
        var bldgRadius = +d.rad;




        //var infowindow = new google.maps.InfoWindow({
        //    content: bldgData,
        //    maxWidth: 200
        //});

        var circleOptions = {
            strokeColor: '#ec9522',
            strokeOpacity: 1,
            strokeWeight: 2,
            fillColor: 'ffffff',
            fillOpacity: 0,
            map: map,
            center: bldgCenter,
            //center:{lat:100, lng:100},
            radius: bldgRadius
        };

        map.addMarker(createMarker(bldgData, circleOptions));

        // Add the circle to the map
        //var bldgCircle = new google.maps.Circle(circleOptions);
        //google.maps.event.addListener(bldgCircle, 'click', function(e) {
        //    infowindow.setPosition(bldgCircle.getCenter());
        //    infowindow.open(map);
        //});

    }); //end forEach

}; //end of buildContent custom function

//function wrapper test
var createMarker = function(bldgData, circleOptions) {

    // Add the circle to the map
    var bldgCircle = new google.maps.Circle(circleOptions);
    google.maps.event.addListener(bldgCircle, 'click', function(e) {
        if (infowindow) infowindow.close();
        infowindow = new google.maps.InfoWindow({
            content: bldgData,
            maxWidth: 200
        });
        infowindow.setPosition(bldgCircle.getCenter());
        infowindow.open(map);
    });
    return bldgCircle;
}

google.maps.event.addDomListener(window, 'load', initialize);
