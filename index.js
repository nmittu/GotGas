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
    var routes = [];
    var currentRoute = null;
    var responseGlobal;

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
        directionsDisplay.setPanel(document.getElementById('right-panel'));
    }

    

      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
      }
      
      
    function calcRoute() {
        for(var i = 0; i < displayArr.length; i++){
          displayArr[i].setMap(null);
          routes.splice(0, 1);
        }

        displayArr = [];
        routes = [];
        
        var start = document.getElementById('fromInput').value;
        var end = document.getElementById('toInput').value;
        if(start.toLowerCase() == "my location"){
            if(pos){
                start = pos
            }
            else alert("Your browser does not support location. Please enter an address")
        }
        var toll = document.getElementById('myonoffswitch').checked;
        var request = {
            origin: start,
            destination: end,
            travelMode: 'DRIVING',
            avoidTolls: toll,
            provideRouteAlternatives: true
        };
        directionsService.route(
          request,
          function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                responseGlobal = response
                calculateBestRoute(response);
                  
            } else {
                 alert("error")
            }
          
          }
        );
    document.getElementById("right-panel").style.display = "block"
    document.getElementById("map").style.right = "276px"
    }

    function calculateBestRoute(response) {
        routes = response.routes;
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
				if(i != bestRoute){
					displayArr[i] = new google.maps.DirectionsRenderer({
	                    	map: map,
	                    	directions: response,
	                    	routeIndex: i,
	                    	polylineOptions: {
	                         	strokeColor: "grey"
	                    	}
	               	});
				}
			}

			displayArr[bestRoute] = new google.maps.DirectionsRenderer({
               	map: map,
               	directions: response,
               	routeIndex: bestRoute,
               	polylineOptions: {
                    	strokeColor: "green"
               	}
          	});
			
			var modifiedResponse = response;
			modifiedResponse.routes = [response.routes[bestRoute]]
			
			directionsDisplay.setDirections(modifiedResponse);
			
            currentRoute = bestRoute;
			document.getElementById('totalGasUsed').innerHTML = calculateRoadWeight(response.routes[bestRoute]).toFixed(2) + " gallons"
			document.getElementById('distance').innerHTML = (getRouteDistance(routes[currentRoute])*0.000621371192).toFixed(2) + " miles"


			
        }
    }
    
    function prev(){
        
        displayArr[currentRoute].setMap(map)
        currentRoute = currentRoute-1
        if(currentRoute < 0){
            currentRoute = displayArr.length-1
        }

        var modifiedResponse = responseGlobal;
			modifiedResponse.routes = [routes[currentRoute]]
			
			directionsDisplay.setDirections(modifiedResponse);
       
        //displayArr[currentRoute].setMap(map)
        document.getElementById('totalGasUsed').innerHTML = calculateRoadWeight(routes[currentRoute]).toFixed(2) + " gallons"
		document.getElementById('distance').innerHTML = (getRouteDistance(routes[currentRoute])*0.000621371192).toFixed(2) + " miles"

    }
    
    
    
    
    function next(){
       
        //displayArr[currentRoute].setMap(map)
        currentRoute = currentRoute+1
        console.log("current: " +currentRoute +"length: " +displayArr.length)
        if(currentRoute >= displayArr.length){
            currentRoute = 0
        }
         var modifiedResponse = responseGlobal;
			modifiedResponse.routes = [routes[currentRoute]]
			
			directionsDisplay.setDirections(modifiedResponse);
        //displayArr[currentRoute].setMap(map)
        document.getElementById('totalGasUsed').innerHTML = calculateRoadWeight(routes[currentRoute]).toFixed(2) + " gallons"
			document.getElementById('distance').innerHTML = (getRouteDistance(routes[currentRoute])*0.000621371192).toFixed(2) + " miles"

    }
        
    function calculateRoadWeight(route) {
            var weight = 0;
            
            for (var i = 0; i < route.legs.length; i++) {
                for (var j = 0; j < route.legs[i].steps.length; j++) {
                    var mph = calculateRoadType(route.legs[i].steps[j]);
                    if (mph >= 55) {
                        var hM = document.getElementById('highwayMiles').value ;
                        weight += ((mph / hM)*(route.legs[i].steps[j].duration.value/3600));
                    } else {
                        var cM = document.getElementById('cityMiles').value ;
                        weight += ((mph / cM)*(route.legs[i].steps[j].duration.value/3600));
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

        function getRouteDistance(route) {
		  var distance = 0;
		for (var i = 0; i < route.legs.length; i++) {
			distance += route.legs[i].distance.value;
		}
		return distance;
      }
    
    

document.addEventListener("DOMContentLoaded", function (event) {
    var _selector = document.getElementById('toggleMap');
    _selector.addEventListener('change', function (event) {
        if (_selector.checked) {//map visisble
            if(window.screen.availWidth <= 544){
                //in mobile
                document.getElementById("map").style.display = "block"
                document.getElementById("right-panel").style.display = "none"
                document.getElementById("map").style.right = "0%"
            }
            else{
                document.getElementById("map").style.right = "0%"
            }
            
        } else {//map not visible
            if(window.screen.availWidth <= 544){
                //mobile
                document.getElementById("map").style.display = "none"
                document.getElementById("right-panel").style.display = "block"
                
            }
            else{
                //not mobile
                document.getElementById("map").style.right = "276px"
            }
            
        }
    });
});


function resize(){
    if(window.screen.availWidth > 544){ // not mobile
        document.getElementById("map").style.display = "block";
    }
}