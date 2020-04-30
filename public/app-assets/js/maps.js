/* eslint-disable require-jsdoc */
let map;
let infoWindow;
let marker;
let geocoder;
let directionsService;
let directionsRenderer;
let curLoc;
let distanceMatrixService;
let markers = [];

function initMap() {
  distanceMatrixService = new google.maps.DistanceMatrixService;
  infoWindow = new google.maps.InfoWindow();
  geocoder = new google.maps.Geocoder();
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  // Creting the map object
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 7,
  });
  // render the direction on map
  directionsRenderer.setMap(map);

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      curLoc = pos;
      map.setCenter(pos);
      addMarker(pos);
      infoWindow.setPosition(pos);
      infoWindow.setContent('This is You Current\n Location Now');
      infoWindow.open(map, marker);
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

// set the distance Matrix(time) to the output container
function setDistannceMatrix(outputContainer, start, end) {
  distanceMatrixService.getDistanceMatrix({
    origins: [start],
    destinations: [end],
    travelMode: 'DRIVING',
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: false,
    avoidTolls: false,
  }, function(response, status) {
    if (status !== 'OK') {
      alert('Error was: ' + status);
    } else {
      const results = response.rows[0].elements;
      outputContainer[0].text(response.originAddresses[0]);
      outputContainer[1].text(response.destinationAddresses[0]);
      outputContainer[2].text(results[0].distance.text +' in '+ results[0].duration.text);
    }
  });
}


// Calculate the display the direction
function calculateAndDisplayRoute(directionsService, directionsRenderer, start, end) {
  directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: 'DRIVING',
      },
      function(response, status) {
        if (status === 'OK') {
          directionsRenderer.setDirections(response);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

// Adds a marker to the map and push to the array.
function addMarker(location) {
  marker = new google.maps.Marker({
    position: location,
    map: map,
  });
  markers.push(marker);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}

// Handle errors from getting Geolocation
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.'
  );
  infoWindow.open(map);
}

// Convert Location Point to the Human Readerble
function setGeocodeLatLng(geocoder, position, updateElement) {
  geocoder.geocode({location: position}, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {
        if (updateElement) {
          updateElement.text(results[0].formatted_address);
        }
        return results[0].formatted_address;
      } else {
        updateElement.text('Unknown Location Check Maps');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
}
