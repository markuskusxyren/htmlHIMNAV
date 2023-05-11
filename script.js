// Set the Mapbox access token
mapboxgl.accessToken =
  'pk.eyJ1Ijoia3Vza3VzeHlyZW5uIiwiYSI6ImNsZWN4ampubzAxaDczcG16MXcwcWhhcDEifQ.9K3JBDAzq3Ru8riWg49zgw';

// Function to get the coordinates of a unit from Firestore using its unitId
function getUnitCoordinates(unitId, map) {
  // Get a reference to the unit document in the 'tombs' collection
  const unitRef = db.collection('tombs').doc(unitId);

  // Fetch the document from Firestore
  unitRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        // Extract coordinates from the document data
        const data = doc.data();
        const coordinates = [data['coords'][1], data['coords'][0]];
        // Plot the unit on the map using its coordinates
        plotUnitOnMap(coordinates, map);
      } else {
        console.log('No such document!');
      }
    })
    .catch((error) => {
      console.log('Error getting document:', error);
    });
}

// Function to plot a unit on the map using its coordinates
function plotUnitOnMap(coordinates, map) {
  const [longitude, latitude] = coordinates;

  // Check if the coordinates are valid numbers
  if (!isNaN(longitude) && !isNaN(latitude)) {
    if (map) {
      // Create a marker and add it to the map at the specified coordinates
      const marker = new mapboxgl.Marker().setLngLat(coordinates).addTo(map);
      // Animate the map view to center on the marker
      map.flyTo({
        center: coordinates,
        essential: true,
      });
    }
  } else {
    console.log("Invalid coordinates:", coordinates);
  }
}

// Function to load the list of units from Firestore and display them in the UI
function loadUnits(map) {
  const unitList = document.getElementById('unit-list');

  // Fetch all documents from the 'tombs' collection
  db.collection('tombs')
    .get()
    .then((querySnapshot) => {
      // Iterate through each document and add a button for it to the unit list
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const unitId = data.unitId;

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('list-group-item', 'list-group-item-action');
        button.textContent = data['unitID'];
        button.onclick = function () {
          // Set the click event to fetch and display the unit's coordinates on the map
          getUnitCoordinates(doc.id, map);
        };

        unitList.appendChild(button);
      });
    });
}

// Function to set up the Mapbox GL JS map
function setupMap(center = [121.0524150628587, 14.682569991056297]) {
  // Initialize the map and set its options
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/kuskusxyrenn/clee7imbg000p01nx6ah0pt8w',
    center: center,
    zoom: 15,
  });

  // Add navigation controls to the map
  const nav = new mapboxgl.NavigationControl();
  map.addControl(nav);

   // Add directions control to the map
   var directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
  });
  map.addControl(directions, 'top-left');

  // Add geolocation control to the map
  const geolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    // Draw an arrow next to the location dot to indicate which direction the device is heading.
    showUserHeading: true,
  });
  map.addControl(geolocateControl);

  // Set the 'geolocate' event handler for the geolocation control
  geolocateControl.on('geolocate', function (e) {
    const center = [e.coords.longitude, e.coords.latitude];
    // Animate the map view to center on the user's location
    map.flyTo({
      center: center,
      essential: true,
    });
  });

  return map;
}

// Firebase configuration object
const firebaseConfig = {
  apiKey: 'AIzaSyAYtbg3SniEAIgQRSM6rReVCQ3UXC22yE4',
  authDomain: 'himinavi-e3f9f.firebaseapp.com',
  projectId: 'himinavi-e3f9f',
  storageBucket: 'himinavi-e3f9f.appspot.com',
  messagingSenderId: '357516927893',
  appId: '1:357516927893:web:8285ade1046c68d1b90c9c',
  measurementId: 'G-WKZE7R1VHT',
};

// Initialize the Firebase app with the configuration object
const app = firebase.initializeApp(firebaseConfig);
console.log("Firebase app initialized:", app);
// Initialize the Firestore database
const db = firebase.firestore(app);

// Function to read example data from Firestore
function readDataFromFirestore() {
  db.collection("tombs")
    .limit(1)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log("Example Firestore data:", doc.data());
      });
    })
    .catch((error) => {
      console.error("Error reading data from Firestore:", error);
    });
}

// Set up the event listeners and initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const showUnitsBtn = document.getElementById('show-units-btn');
  const unitListContainer = document.getElementById('unit-list-container');

  // Toggle the visibility of the unit list when the button is clicked
  showUnitsBtn.addEventListener('click', () => {
    unitListContainer.classList.toggle('d-none');
  });

  // Main function to initialize the application
  async function init() {
    const map = setupMap();
    loadUnits(map);
  }

  // Call the main initialization function
  init();
});