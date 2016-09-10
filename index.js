  
    // Note: This example requires that you consent to location sharing when
    // prompted by your browser. If you see the error "The Geolocation service
    // failed.", it means you probably did not give permission for the browser to
    // locate you.
    /*** Initializes map with current location  ***/
    
    var directionsDisplay;
    var directionsService;
    var pos;
    var map;
    var displayArr = [];

    function initMap() {
        map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 12
    });
        
    var marker = new google.maps.Marker({map: map,});

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
           pos = {
               lat: position.coords.latitude,
               lng: position.coords.longitude
            };

            marker.setPosition(pos)
            map.setCenter(pos);
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }
    
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    }

      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
      }
      
      
      function calcRoute() {
        for(var i = 0; i < displayArr.length; i ++){
          displayArr[i].setMap(null)
        }
        
      var start = document.getElementById('fromInput').value;
      var end = document.getElementById('toInput').value;
      if(start.toLowerCase() == "my location"){
        if(pos){
          start = pos
        }
        else alert("Your browser does not support location. Please enter an address")
      }
      var request = {
        origin: start,
        destination: end,
        travelMode: 'DRIVING',
        provideRouteAlternatives: true
      };
      directionsService.route(
          request,
          function (response, status) {
              if (status == google.maps.DirectionsStatus.OK) {
                
                  for (var i = 0, len = response.routes.length; i < len; i++) {
                      displayArr[i] = new google.maps.DirectionsRenderer({
                          map: map,
                          directions: response,
                          routeIndex: i
                      });
                  }
              } else {
                  alert("error")
              }
          
          }
      );
    
    }
    
    
    