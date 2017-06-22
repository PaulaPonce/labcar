function initMap(){
	var map = new google.maps.Map(document.getElementById("map"), {
		zoom: 9, //nivel de profundidad
		center: {lat: -33.437778, lng: -70.650278}, //coordenadas de Santiago
		mapTypeControl: false,
		zoomControl: false,
		streetViewControl: false
	});

	var latitude, longitude;

	window.onload = function geoFind(){
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition(geo_succes, geo_error, geo_options);
		}
	}

	var geo_succes = function(position){
		latitude = position.coords.latitude;
		longitude = position.coords.longitude;
		
		var miUbicacion = new google.maps.Marker({
			position: {lat:latitude, lng:longitude},
			animation: google.maps.Animation.DROP,
			map: map
		});

		map.setZoom(15);
		map.setCenter({lat:latitude, lng:longitude});
	}

	var geo_error = function(error){
		alert("Tenemos un problema con encontrar tu ubicación");
	}

	var geo_options = {
	enableHighAccuracy: true,
	maximumAge: 30000,
	timeout: 27000
	};

	//Autocompletado Input
	var autocompleteOrigen = new google.maps.places.Autocomplete(document.getElementById("origen"));
	autocompleteOrigen.bindTo("bounds", map);
	var autocompleteDestino = new google.maps.places.Autocomplete(document.getElementById("destino"));
	autocompleteDestino.bindTo("bounds", map);

	//Ruta
	document.getElementById("ruta").addEventListener("click", calcRoute);

	var directionsDisplay = new google.maps.DirectionsRenderer();
	var directionsService = new google.maps.DirectionsService();

	function calcRoute(){
		var start = document.getElementById("origen").value;
		var end = document.getElementById("destino").value;

		var request = {
			origin: start,
			destination: end,
			travelMode: "DRIVING"
		};
		directionsService.route(request, function(result, status){
			if(status == "OK"){
				directionsDisplay.setDirections(result);
			}
		});

		//Distancia
		var bounds = new google.maps.LatLngBounds;
		var markersArray = [];

		var destinationIcon;
		var originIcon;

		var geocoder = new google.maps.Geocoder;

		var service = new google.maps.DistanceMatrixService;
		service.getDistanceMatrix({
			origins: [start],
			destinations: [end],
			travelMode: 'DRIVING',
			unitSystem: google.maps.UnitSystem.METRIC,
			avoidHighways: false,
			avoidTolls: false
		}, function(response, status){
			if(status !== 'OK'){
				alert('Error was: ' + status);
			}else{
				var originList = response.originAddresses;
				var destinationList = response.destinationAddresses;
				var outputDiv = document.getElementById('output');
				outputDiv.innerHTML = '';
				deleteMarkers(markersArray);

				var showGeocodedAddressOnMap = function(asDestination) {
					var icon = asDestination ? destinationIcon : originIcon;
					return function(results, status){
						if(status === 'OK'){
							map.fitBounds(bounds.extend(results[0].geometry.location));
							markersArray.push(new google.maps.Marker({
								map: map,
								position: results[0].geometry.location,
								icon: icon
							}));
						}else{
							alert('Geocode was not successful due to: ' + status);
						}
					};
				};

				for(var i = 0; i < originList.length; i++){
					var results = response.rows[i].elements;
					geocoder.geocode({'address': originList[i]}, showGeocodedAddressOnMap(false));
					for(var j = 0; j < results.length; j++){
						geocoder.geocode({'address': destinationList[j]}, showGeocodedAddressOnMap(true));

						var pd = document.createElement("p");
						var pdText = document.createTextNode(results[j].distance.text);
						pd.appendChild(pdText);
						outputDiv.appendChild(pd);

						var pt = document.createElement("p");
						var ptText = document.createTextNode(results[j].duration.text);
						pt.appendChild(ptText);
						outputDiv.appendChild(pt);

						var pt = document.createElement("p");
						var ptText = document.createTextNode("$"+ parseInt(results[j].distance.text) * 300);
						pt.classList.add("bold");
						pt.appendChild(ptText);
						outputDiv.appendChild(pt);
					}
				}
			}
		});
	}
	directionsDisplay.setMap(map);
}

function deleteMarkers(markersArray) {
	for(var i = 0; i < markersArray.length; i++){
		markersArray[i].setMap(null);
	}
	markersArray = [];
}

/*
var destinationIcon = 'https://chart.googleapis.com/chart?' + 'chst=d_map_pin_letter&chld=O|FF0000|000000';
var originIcon = 'https://chart.googleapis.com/chart?' + 'chst=d_map_pin_letter&chld=O|FFFF00|000000';
*/