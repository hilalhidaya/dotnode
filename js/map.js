function initMap() {    
    // Coordenadas del negocio
    const negocio = { lat: 37.1884032, lng: -3.6208640 }; 

    // Crear el mapa centrado en el negocio
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: negocio,
    });

    // Marcador en el negocio
    const marker = new google.maps.Marker({
        position: negocio,
        map: map,
        title: "Aquí estamos",
    });

    // Obtener la ubicación del usuario
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const usuario = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                // Trazar la ruta
                const directionsService = new google.maps.DirectionsService();
                const directionsRenderer = new google.maps.DirectionsRenderer();
                directionsRenderer.setMap(map);

                const request = {
                    origin: usuario,
                    destination: negocio,
                    travelMode: "DRIVING",
                };

                directionsService.route(request, (result, status) => {
                    if (status === "OK") {
                        directionsRenderer.setDirections(result);
                    } else {
                        alert("No se pudo calcular la ruta: " + status);
                    }
                });
            },
            () => {
                alert("No se pudo obtener la ubicación del usuario.");
            }
        );
    } else {
        alert("Geolocalización no es soportada por tu navegador.");
    }
}

// Inicializar el mapa
window.onload = initMap;