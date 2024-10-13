
const map = L.map('map').setView([37.1820, -3.6058], 13); // Inicializa con la ubicación de tu negocio (Granada)

// Capa de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

const businessLocation = [37.1789, -3.6003];
L.marker(businessLocation).addTo(map).bindPopup("Ubicación de tu negocio").openPopup();

// Obtener ubicación del usuario
navigator.geolocation.getCurrentPosition(success, error);

function success(pos) {
    const userLat = pos.coords.latitude;
    const userLng = pos.coords.longitude;
    const userLocation = [userLat, userLng];

    // Marca la ubicación del usuario en el mapa
    L.marker(userLocation).addTo(map).bindPopup("Tu ubicación").openPopup();

    // Calcula y muestra la ruta
    calculateRoute(userLocation, businessLocation);
}

function error(err) {
    console.error(`Error (${err.code}): ${err.message}`);
    alert("No se puede obtener tu ubicación.");
}

// Función para calcular la ruta usando OpenRouteService
function calculateRoute(start, end) {
    const apiKey = '5b3ce3597851110001cf6248585bad744800451fabc15df9eb651e65'; // Reemplaza con tu API Key de OpenRouteService
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start[1]},${start[0]}&end=${end[1]},${end[0]}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const coords = data.routes[0].geometry.coordinates;
            const latLngs = coords.map(coord => [coord[1], coord[0]]);

            // Dibuja la ruta en el mapa
            L.polyline(latLngs, { color: 'blue' }).addTo(map);

            // Ajusta el zoom para que la ruta esté completamente visible
            map.fitBounds(L.polyline(latLngs).getBounds());
        })
        .catch(error => console.error('Error al calcular la ruta:', error));
}
