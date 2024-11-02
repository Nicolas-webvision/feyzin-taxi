// Menu de navigation

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });
});

// Pop Up

document.addEventListener('DOMContentLoaded', function() {
    const features = document.querySelectorAll('.feature');
    const popups = document.querySelectorAll('.popup');
    const closeButtons = document.querySelectorAll('.close');

    features.forEach(feature => {
        feature.addEventListener('click', function() {
            const popupId = this.getAttribute('data-popup');
            document.getElementById(popupId).style.display = 'flex';
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.popup').style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('popup')) {
            event.target.style.display = 'none';
        }
    });
});

// Map calculateur de trajet

let map;
let autocompleteStart, autocompleteEnd;

// Initialisation de la carte lorsque la page est chargée
window.onload = function() {
    if (document.getElementById("map")) {
        initMap();
    }
};

// Fonction pour initialiser la carte et l'autocomplétion des adresses
function initMap() {
    // Création de la carte centrée sur Paris
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 48.8566, lng: 2.3522 },
        zoom: 13,
    });

    // Champs d'entrée pour l'autocomplétion des adresses
    const inputStart = document.getElementById("start");
    const inputEnd = document.getElementById("end");

    // Vérifie que l'API Google Places est disponible
    if (google.maps.places) {
        // Autocomplétion pour l'adresse de départ
        autocompleteStart = new google.maps.places.Autocomplete(inputStart);
        autocompleteStart.addListener('place_changed', () => {
            const place = autocompleteStart.getPlace();
            if (!place.geometry) {
                alert("L'adresse de départ n'a pas pu être trouvée.");
                return;
            }
            map.setCenter(place.geometry.location);
        });

        // Autocomplétion pour l'adresse d'arrivée
        autocompleteEnd = new google.maps.places.Autocomplete(inputEnd);
        autocompleteEnd.addListener('place_changed', () => {
            const place = autocompleteEnd.getPlace();
            if (!place.geometry) {
                alert("L'adresse d'arrivée n'a pas pu être trouvée.");
                return;
            }
            map.setCenter(place.geometry.location);
        });
    } else {
        console.error("L'API Google Places n'est pas disponible.");
    }
}

// Fonction pour calculer la distance et le prix estimé
function calculateDistanceAndPrice() {
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;
    const time = document.getElementById("time").value;
    const tripType = document.getElementById("tripType").value; // Aller simple ou aller-retour
    const luggageCount = parseInt(document.getElementById("luggage").value) || 0; // Nombre de bagages

    // Validation des adresses
    if (!start || !end) {
        alert("Veuillez entrer des adresses valides.");
        return;
    }

    // Appel au service de matrice de distance de Google Maps
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
        origins: [start],
        destinations: [end],
        travelMode: 'DRIVING',
    }, (response, status) => {
        if (status === 'OK') {
            const distance = response.rows[0].elements[0].distance.value / 1000; // Distance en km
            const hour = parseInt(time.split(':')[0]);

            // Vérification des tarifs de jour et de nuit
            const isNight = hour >= 19 || hour < 7;

            // Tarifs de base
            let baseFare = 3; // Prise en charge
            let perKmRate = 0;
            let hourlyRate = 39.47;

            // Calcul des tarifs selon le type de trajet et l'heure
            if (tripType === 'single') { // Aller simple
                perKmRate = isNight ? 2.94 : 1.96;
            } else { // Aller-retour
                perKmRate = isNight ? 1.47 : 0.98;
            }

            // Calcul du prix
            let price = baseFare + (distance * perKmRate) + (distance / 50 * hourlyRate);

            // Supplément pour les bagages
            price += luggageCount * 2;

            // Application du tarif minimum
            price = Math.max(price, 8); // Tarif minimum de 8€

            // Affichage de la distance et du prix estimé
            document.getElementById("distanceOutput").textContent = `Distance: ${distance.toFixed(2)} km`;
            document.getElementById("priceOutput").textContent = `Prix estimé: ${price.toFixed(2)} €`;
        } else {
            alert('Erreur lors de la récupération des informations de distance.');
        }
    });
}

// Ajout d'un écouteur pour le bouton de calcul si présent dans la page
if (document.getElementById("calculateDistance")) {
    document.getElementById("calculateDistance").addEventListener("click", calculateDistanceAndPrice);
}

