function initMap(){
	var map = new google.maps.Map(document.getElementById("map"), {
		zoom: 9, //nivel de profundidad
		center: {lat: -33.437778, lng: -70.650278}, //coordenadas de Santiago
		mapTypeControl: false,
		zoomControl: false,
		streetViewControl: false
	});

window.addEventListener("load", geoFind);
	var latitude, longitude;
	function geoFind(){
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

		map.setZoom(10);
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
	}
	directionsDisplay.setMap(map);
}