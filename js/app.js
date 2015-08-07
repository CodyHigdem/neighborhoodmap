function appViewModel() {
  var self = this;
  var map, city, infowindow;
  var venuesList = [];

  this.mapMarkers = ko.observableArray([]);  //holds all map markers


  //Hold the current location's lat & lng - useful for re-centering map
  this.lat = ko.observable(44.969039);
  this.lng = ko.observable(-93.287428);

  //Error handling if Google Maps fails to load
  this.mapRequestTimeout = setTimeout(function() {
    $('#map-canvas').html('Google mapes is not loading. Please refresh your browser and try again.');
  }, 8000);

// Initialize Google map, perform initial deal search on a city.
  function initializeMap() {
    city = new google.maps.LatLng(44.969039, -93.287428);
    map = new google.maps.Map(document.getElementById('map-canvas'), {
          center: city,
          zoom: 10,
          zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER,
            style: google.maps.ZoomControlStyle.SMALL
          },
          streetViewControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM
            },
          mapTypeControl: false,
          panControl: false
        });
    clearTimeout(self.mapRequestTimeout);

    google.maps.event.addDomListener(window, "resize", function() {
       var center = map.getCenter();
       google.maps.event.trigger(map, "resize");
       map.setCenter(center);
    });

    infowindow = new google.maps.InfoWindow({maxWidth: 300});
    mapMarkers(venuesList)

  }





// Create and place markers and info windows on the map based on data from API
  function mapMarkers(array) {
    $.each(array, function(index, value) {
      var latitude = value.venueLat,
          longitude = value.venueLng,
          geoLoc = new google.maps.LatLng(latitude, longitude);

      var contentString = '<div id="infowindow">' +
      '<img src="' + value.dealImg + '">' +
      '<h2>' + value.dealName + '</h2>' +
      '<p>' + value.dealAddress + '</p>' +
      '<p class="rating">' + value.dealRating + '</p>' +
      '<p><a href="' + value.dealLink + '" target="_blank">Click to view deal</a></p>' +
      '<p>' + value.dealBlurb + '</p></div>';
      console.log(contentString);
      var marker = new google.maps.Marker({
        position: geoLoc,
        title: value.venueName,
        map: map
      });
      console.log(marker);
      self.mapMarkers.push({marker: marker, content: contentString});

      self.dealStatus(self.numDeals() + ' food and drink deals found near ' + self.searchLocation());

      //generate infowindows for each deal
      google.maps.event.addListener(marker, 'click', function() {
        self.searchStatus('');
         infowindow.setContent(contentString);
         map.setZoom(14);
         map.setCenter(marker.position);
         infowindow.open(map, marker);
         map.panBy(0, -150);
       });
    });
  }



  function fetch4Square(){
    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=40.7,-74&client_id=WU5UYEORI3OKUCGR5YKUBTAEYOJ2ZPZ4MFY1OAGK3CHIGKVY&client_secret=G3FWJUY3LILJCKTQJE5B1UVPSAEWEMHNWYQQ21ZBRVKDFTLR&v=20131017&near=minneapolis,mn';

  $.ajax({
    url: foursquareURL,
    dataType: 'json',
    success: function(data){
      //console.log(data.response.venues);
      var venues = data.response.venues;
      var venuesCount = venues.length;

      for (var i = 0; i < venuesCount; i++){
        var v = venues[i];
        venueName = v.name,
        venueLat = v.location.lat,
        venueLng = v.location.lng,
        venueAddress = v.location.address,
        venueURL = v.url;


          venuesList.push(venueName, venueLat, venueLng);
        var marker = new google.maps.Marker({
          map: map,
          position: new google.maps.LatLng(venueLat,venueLng),
          title: vname
        });
        mapMarkers.push(marker);
      }
      console.log("this is the venue list: " + venuesList[3].venueName);
      console.log("your map markers: " + mapMarkers);
    },
    error: function(data){
      console.log('oopsie, something went wrong try again in a little bit');

    }
  });



  }






  //Re-center map to current city if you're viewing deals that are further away
  this.centerMap = function() {
    infowindow.close();
    var currCenter = map.getCenter();
    var cityCenter = new google.maps.LatLng(self.currentLat(), self.currentLng());
    if((cityCenter.k == currCenter.A) && (cityCenter.D == currCenter.F)) {
        self.searchStatus('Map is already centered.');
    } else {
      self.searchStatus('');
      map.panTo(cityCenter);
      map.setZoom(10);
    }
  };

  initializeMap();
  fetch4Square();
}

ko.applyBindings(new appViewModel());