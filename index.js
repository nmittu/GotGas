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

            document.getElementById('fromInput').value = "My Location";

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

                calculateBestRoute(response);
                  
            } else {
                 alert("error")
            }
          
          }
        );
    
    }

    function calculateBestRoute(response) {
        
        if (response.routes.length == 1) {
            displayArr[0] = new google.maps.DirectionsRenderer({
                map: map,
                directions: response,
                routeIndex: 0,
                polylineOptions: {
                    strokeColor:"green"
                }
            });
        } else {
            var RoadWeight = calculateRoadWeight(response.routes[0]);
            var bestRoute = 0;
            for (var i = 1; i < response.routes.length; i++) {
                var Temp = calculateRoadWeight(response.routes[i]);
                if (Temp < RoadWeight) {
                    RoadWeight = Temp;
                    bestRoute = i;
                }
            }

			for (var i = 0; i < response.routes.length; i++) {
				displayArr[i] = new google.maps.DirectionsRenderer({
                    map: map,
                    directions: response,
                    routeIndex: i,
                    polylineOptions: {
                        strokeColor: i == bestRoute ? "green" : "grey"
                    }
               	});
               	
               /*	google.maps.event.addListener(displayArr[i], 'click', function(evt) {
               	    document.getElementById('totalGasUsed').value = "you clicked route: "+ i+1 
               	})*/
			}
			

			document.getElementById('totalGasUsed').innerHTML = calculateRoadWeight(response.routes[bestRoute]) + "gallons"
			
        }
    }
        
    function calculateRoadWeight(route) {
            var weight = 0;
            
            for (var i = 0; i < route.legs.length; i++) {
                for (var j = 0; j < route.legs[i].steps.length; j++) {
                    var mph = calculateRoadType(route.legs[i].steps[j]);
                    if (mph >= 55) {
                        var hM = document.getElementById('highwayMiles').value ;
                        weight += ((mph / hM)*(route.legs[i].steps[j].duration.value/360));
                    } else {
                        var cM = document.getElementById('cityMiles').value ;
                        weight += ((mph / cM)*(route.legs[i].steps[j].duration.value/360));
                    }
                }
            }
            return weight;
        }
      
      function calculateRoadType(step) {
      // find meters per second and convert to miles per hour
        var mph = (step.distance.value / step.duration.value) * 2.23694;
        
        return mph;
        }
    
    


