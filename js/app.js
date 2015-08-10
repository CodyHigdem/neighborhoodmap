$(document).ready(function() {
    var self = this;
    var mpls, map, infoWindow;
    // let's make a data model of some places around Mpls
    var Model = [{
        "name": "Solera",
        "latlng": [44.976521, -93.277218]
    }, {
        "name": "Keiran Irish Pub",
        "latlng": [44.979124, -93.274664]
    }, {
        "name": "Sisyphus Brewing",
        "latlng": [44.973243, -93.288848]
    }, {
        "name": "Walker Art Museum",
        "latlng": [44.969005, -93.288440]
    }, {
        "name": "Grain Exchange",
        "latlng": [44.977730, -93.263776]
    }];

    var appViewModel = function() {
        var self = this;
        //make an array to hold the google map markers, it will be empty at first in the future we can then clear them.
        self.markers = ko.observableArray([]);
        self.allLocations = ko.observableArray([]);
        //I think this is technically two way model binding? /3way model binding??
        //Grab the filter, put it into a data-bind with the input
        self.filter = ko.observable("");

        var map = initializeMap();
        // check to see if the map is being created or not, if not...let the user know
        if (!map) {
            alert("oh fiddle sticks! Google Maps is acting up. We're going to have a chat with it. Check back a little later.");
            return;
        }
        self.map = ko.observable(map);
        fetchFoursquare(self.allLocations, self.map(), self.markers);

        // Based on the search keywords filter the list view
        // in the future having a way to filter search maybe cool. This solution does that
        //
        self.filteredArray = ko.computed(function() {
            return ko.utils.arrayFilter(self.allLocations(), function(v) {
                if (v.name.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1) {
                    if (v.marker)
                        v.marker.setMap(map);
                } else {
                    if (v.marker)
                        v.marker.setMap(null);
                }
                return v.name.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1;
            });
        }, self);

        self.clickHandler = function(data) {
            centerLocation(data, self.map(), self.markers);
        };
    };

    // Initialize google map
    function initializeMap() {

        var mapOptions = {
            center: new google.maps.LatLng(44.974726, -93.277436),
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        return new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    }

    // get location data from foursquare
    function fetchFoursquare(allLocations, map, markers) {
        var locationDataArr = [];
        //leaving this here incase I change the way I want the foursquare url to be
        var foursquareUrl = "";
        var location = [];
        //iterate through all the places in the Model listed above
        //Then put the latlong founds from google maps what's here
        //query the foursquare api and get back data
        for (var place in Model) {
            foursquareUrl = 'https://api.foursquare.com/v2/venues/search' +
                '?client_id=WU5UYEORI3OKUCGR5YKUBTAEYOJ2ZPZ4MFY1OAGK3CHIGKVY' +
                '&client_secret=G3FWJUY3LILJCKTQJE5B1UVPSAEWEMHNWYQQ21ZBRVKDFTLR' +
                '&v=20130815' +
                '&m=foursquare' +
                '&ll=' + Model[place]["latlng"][0] + ',' + Model[place]["latlng"][1] +
                '&query=' + Model[place]["name"] +
                '&intent=match';

            $.getJSON(foursquareUrl, function(data) {
                if (data.response.venues) {
                    var v = data.response.venues[0];
                    //add the v into the allLocations, this will be used to push into placeMarkers
                    allLocations.push(v);
                    location = {
                        lat: v.location.lat,
                        lng: v.location.lng,
                        name: v.name,
                        loc: v.location.address + " " + v.location.city + ", " + v.location.state + " " + v.location.postalCode
                    };
                    locationDataArr.push(location);
                    placeMarkers(allLocations, place, location, map, markers);
                } else {
                    alert("I can't help but blame you for foursquare not working. JK! Try again, something is going bonkers. Hit refresh in a bit and see");
                    return;
                }
            });
        }
    }

    // place marker for the result locations on the map
    function placeMarkers(allLocations, place, data, map, markers) {
        var latlng = new google.maps.LatLng(data.lat, data.lng);
        var marker = new google.maps.Marker({
            position: latlng,
            map: map,
            animation: google.maps.Animation.DROP,
            content: data.name + "<br>" + data.loc
        });

        // info window will pop up for each marker
        var infoWindow = new google.maps.InfoWindow({
            content: marker.content
        });
        marker.infowindow = infoWindow;
        markers.push(marker);
        allLocations()[allLocations().length - 1].marker = marker;

        // show details info about location when user clicks on a marker
        google.maps.event.addListener(marker, 'click', function() {
            // close the open infowindow
            //get markercount
            var markerCount = markers().length;
            for (var i = 0; i < markerCount; i++) {
                markers()[i].infowindow.close();
            }
            infoWindow.open(map, marker);
        });

        // toggle bounce when user clicks on a location marker on google map
        google.maps.event.addListener(marker, 'click', function() {
            toggleBounce(marker, self.markers);
        });
    }
    /* make it bounce!
     * marker is the google object that's being clicked/location being clicked
     */
    var currentMarker = null;

    function toggleBounce(marker, markers) {
        if (currentMarker) {
            currentMarker.setAnimation(null);
        }

        if (marker.setAnimation() != null) {
            marker.setAnimation(null);
        } else {
            /*This is the call that allows the marker to keep bouncing
             * letting the user know that it's still an active location
             * https://developers.google.com/maps/documentation/javascript/examples/marker-animations
             */
            marker.setAnimation(google.maps.Animation.BOUNCE);
            currentMarker = marker;
        }
    }

    // clickHandler on location list view
    function centerLocation(data, map, markers) {
        // close the open infowindow
        //http://stackoverflow.com/questions/21960214/google-map-looped-markers-wont-close-previous-infowindow
        for (var i = 0; i < markers().length; i++) {
            markers()[i].infowindow.close();
            marker[i].setAnimation(null);
        }
        map.setCenter(new google.maps.LatLng(data.location.lat, data.location.lng));
        map.setZoom(15);
        for (var i = 0; i < markers().length; i++) {
            consol.log('let');
            marker[i].setAnimation(null);
            var content = markers()[i].content.split('<br>');
            if (data.name === content[0]) {

                toggleBounce(markers()[i]);
            }
        }
    }

    ko.applyBindings(new appViewModel());
});