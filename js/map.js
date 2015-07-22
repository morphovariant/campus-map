//global variables

var map;
var data;
var imgOverlay;
var infowindow;

ATOOverlay.prototype = new google.maps.OverlayView();

(function () {

    //create an array of markers
    google.maps.Map.prototype.markers = [];

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

        for(var i = 0; i < this.markers.length; i++){
            this.markers[i].set_map(null);
        }
    };

})();

// Initialize the map and the custom overlay.
function initialize() {

    var mapOptions = {
        zoom: 16,
        center: new google.maps.LatLng(34.18994703, -118.92183252),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    // overlay img and positioning
    var swBound = new google.maps.LatLng(34.18605509, -118.92949732);
    var neBound = new google.maps.LatLng(34.20193861, -118.91595312);
    var bounds = new google.maps.LatLngBounds(swBound, neBound);
    var srcImage = 'img/ato-site-map-new.png';
    imgOverlay = new ATOOverlay(bounds, srcImage, map);

    // building data
    d3.csv("data/data.csv", function(d) {

        data = d;
        buildInfoWindows();

    });

    // HTML5 geolocation
    //if(navigator.geolocation) {
    //    navigator.geolocation.getCurrentPosition(function(position) {
    //        var pos = new google.maps.LatLng(position.coords.latitude,
    //            position.coords.longitude);
    //
    //        var image = 'img/you-are-here.png';
    //        var hereMarker = new google.maps.Marker({
    //            position: pos,
    //            map: map,
    //            icon: image
    //        });
    //
    //        map.setCenter(pos);
    //    }, function() {
    //        handleNoGeolocation(true);
    //    });
    //} else {
    //    // Browser doesn't support Geolocation
    //    handleNoGeolocation(false);
    //}
} //end initialize function

// sets the location without loc svcs
//function handleNoGeolocation(errorFlag) {
//
//    var options = {
//        map: map,
//        position: new google.maps.LatLng(34.18994703, -118.92183252),
//        //content: content
//    };
//
//    map.setCenter(options.position);
//
//} // end no location

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

// object storage for filter-based markers
var visitorMarks = [];
var fitnessMarks = [];
var diningMarks = [];
var serviceMarks = [];
var parkingMarks = [];
var bldgNames = [];

// parse the building data file and add one infowindow on click for each building
var buildInfoWindows = function() {

    data.forEach(function(d) {

        //console.log(d);
        var bldgName = d.building;
        bldgNames.push(bldgName);
        var bldgCenter = new google.maps.LatLng(d.lat, d.lng);
        var bldgRadius = +d.rad;

        var bldgData = '<div><h3>Building: ' + bldgName + '</h3>';

        if (d.visitor) {
            var visitorOptions = {
                strokeColor: '#d34e2e',
                strokeOpacity: 0,
                strokeWeight: 8,
                fillColor: 'ffffff',
                fillOpacity: 0,
                map: map,
                center: bldgCenter,
                radius: bldgRadius
            };
            var visitorCircle = new google.maps.Circle(visitorOptions);
            visitorMarks.push(visitorCircle);
        }

        if (d.fitness) {
            bldgData += '<h4>Amgym</h4><p>'
                + d.fitnessHours + '</p>';
            var fitnessOptions = {
                strokeColor: '#804b9d',
                strokeOpacity: 0,
                strokeWeight: 8,
                fillColor: 'ffffff',
                fillOpacity: 0,
                map: map,
                center: bldgCenter,
                radius: bldgRadius
            };
            var fitnessCircle = new google.maps.Circle(fitnessOptions);
            fitnessMarks.push(fitnessCircle);
        }

        if (d.dining) {
            bldgData += '<h4><a href="' + d.diningUrl + '">' + d.dining + '</a></h4><p>'
                + d.diningHours + '</p>';
            var diningOptions = {
                strokeColor: '#00bbe3',
                strokeOpacity: 0,
                strokeWeight: 8,
                fillColor: 'ffffff',
                fillOpacity: 0,
                map: map,
                center: bldgCenter,
                radius: bldgRadius + 12
            };
            var diningCircle = new google.maps.Circle(diningOptions);
            diningMarks.push(diningCircle);
        }

        if (d.services) {
            var serviceOptions = {
                strokeColor: '#f1c018',
                strokeOpacity: 0,
                strokeWeight: 8,
                fillColor: 'ffffff',
                fillOpacity: 0,
                map: map,
                center: bldgCenter,
                radius: bldgRadius
            };
            var serviceCircle = new google.maps.Circle(serviceOptions);
            serviceMarks.push(serviceCircle);
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

        if (d.parking) {
            var parkingOptions = {
                strokeColor: '#87c665',
                strokeOpacity: 0,
                strokeWeight: 8,
                fillColor: 'ffffff',
                fillOpacity: 0,
                map: map,
                center: bldgCenter,
                radius: bldgRadius - 12
            };
            var parkingCircle = new google.maps.Circle(parkingOptions);
            parkingMarks.push(parkingCircle);
        }

        bldgData += '</div>';

        var circleOptions = {
            strokeColor: '#ec9522',
            strokeOpacity: 0,
            strokeWeight: 10,
            fillColor: 'ffffff',
            fillOpacity: 0,
            map: map,
            center: bldgCenter,
            radius: bldgRadius,
            bldg: bldgName
        };

        //adds invisible circles that trigger infoWindows
        map.addMarker(bldgMarker(bldgData, circleOptions));

    }); //end forEach

}; //end of buildContent custom function

// creates and returns the circle
// adds a listener for a tap to launch the infoWindow
var bldgMarker = function(bldgData, circleOptions) {

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
};

$(function() {
    $( "#bldgs" ).autocomplete({
        source: bldgNames
    });
});


findBldg = function() {
    // get all the inputs into an array.
    var input = $('#bldgs').val();

    for (i = 0; i < map.markers.length; i++) {
        if (input == map.markers[i].bldg) {
            map.markers[i].setOptions({strokeOpacity: 0.6});
            map.panTo(map.markers[i].getCenter());
        } else {
            map.markers[i].setOptions({strokeOpacity: 0})
        }
    }

};

togVis = function() {

    if ( $('input').hasClass('visOff') ) {
        $('input').removeClass('visOff').addClass('visOn');
        for (i = 0; i < visitorMarks.length; i++) {
            visitorMarks[i].setOptions({strokeOpacity: 0.6});
        }
    } else {
        $('input').addClass('visOff').removeClass('visOn');
        for (i = 0; i < visitorMarks.length; i++) {
            visitorMarks[i].setOptions({strokeOpacity: 0});
        }
    }

};

togFit = function() {

    if ( $('input').hasClass('fitOff') ) {
        $('input').removeClass('fitOff').addClass('fitOn');
        for (i = 0; i < fitnessMarks.length; i++) {
            fitnessMarks[i].setOptions({strokeOpacity: 0.6});
        }
    } else {
        $('input').addClass('fitOff').removeClass('fitOn');
        for (i = 0; i < fitnessMarks.length; i++) {
            fitnessMarks[i].setOptions({strokeOpacity: 0});
        }
    }

};

togDin = function() {

    if ( $('input').hasClass('dinOff') ) {
        $('input').removeClass('dinOff').addClass('dinOn');
        for (i = 0; i < diningMarks.length; i++) {
            diningMarks[i].setOptions({strokeOpacity: 0.6});
        }
    } else {
        $('input').addClass('dinOff').removeClass('dinOn');
        for (i = 0; i < diningMarks.length; i++) {
            diningMarks[i].setOptions({strokeOpacity: 0});
        }
    }

};

togSvc = function() {

    if ( $('input').hasClass('svcOff') ) {
        $('input').removeClass('svcOff').addClass('svcOn');
        for (i = 0; i < serviceMarks.length; i++) {
            serviceMarks[i].setOptions({strokeOpacity: 0.6});
        }
    } else {
        $('input').addClass('svcOff').removeClass('svcOn');
        for (i = 0; i < serviceMarks.length; i++) {
            serviceMarks[i].setOptions({strokeOpacity: 0});
        }
    }

};

togPrk = function() {

    if ( $('input').hasClass('prkOff') ) {
        $('input').removeClass('prkOff').addClass('prkOn');
        for (i = 0; i < parkingMarks.length; i++) {
            parkingMarks[i].setOptions({strokeOpacity: 0.6});
        }
    } else {
        $('input').addClass('prkOff').removeClass('prkOn');
        for (i = 0; i < parkingMarks.length; i++) {
            parkingMarks[i].setOptions({strokeOpacity: 0});
        }
    }

};



google.maps.event.addDomListener(window, 'load', initialize);
