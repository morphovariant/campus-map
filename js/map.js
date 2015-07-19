//global variables
var drawMap;
var map;
var vpHeight;

//drawMap = function initialize() {
//
//    vpHeight = $(window).height();
//
//    var mapOptions = {
//        center: new google.maps.LatLng(34.189956, -118.918591),
//        zoom: 16
//    };
//    map = new google.maps.Map(document.getElementById('map-canvas'),
//        mapOptions);
//
//    $('#map-canvas').css('height', vpHeight);
//};

google.maps.event.addDomListener(window, 'load', initialize);

// This example creates a custom overlay called ATOOverlay, containing
// a U.S. Geological Survey (USGS) image of the relevant area on the map.

// Set the custom overlay object's prototype to a new instance
// of OverlayView. In effect, this will subclass the overlay class.
// Note that we set the prototype to an instance, rather than the
// parent class itself, because we do not wish to modify the parent class.

var overlay;
ATOOverlay.prototype = new google.maps.OverlayView();

// Initialize the map and the custom overlay.

function initialize() {
    var mapOptions = {
        zoom: 16,
        center: new google.maps.LatLng(34.18994703, -118.92183252),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var swBound = new google.maps.LatLng(34.18605509, -118.92949732);
    var neBound = new google.maps.LatLng(34.20193861, -118.91595312);
    var bounds = new google.maps.LatLngBounds(swBound, neBound);

    // The photograph is courtesy of the U.S. Geological Survey.
    var srcImage = 'img/ato-site-map.png';

    // The custom ATOOverlay object contains the USGS image,
    // the bounds of the image, and a reference to the map.
    overlay = new ATOOverlay(bounds, srcImage, map);
}

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

google.maps.event.addDomListener(window, 'load', initialize);


