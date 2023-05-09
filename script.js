mapboxgl.accessToken =
  'pk.eyJ1Ijoia3Vza3VzeHlyZW5uIiwiYSI6ImNsZWN4ampubzAxaDczcG16MXcwcWhhcDEifQ.9K3JBDAzq3Ru8riWg49zgw';

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
  enableHighAccuracy: true,
});

function successLocation(position) {
  setupMap([position.coords.longitude, position.coords.latitude]);
}

function errorLocation() {
  setupMap([121.0524150628587, 14.682569991056297]);
}

function getUnitCoordinates(unitId) {
  const unitRef = db.collection('units').doc(unitId);

  unitRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        const coordinates = [data.longitude, data.latitude];
        plotUnitOnMap(coordinates);
      } else {
        console.log('No such document!');
      }
    })
    .catch((error) => {
      console.log('Error getting document:', error);
    });
}

function plotUnitOnMap(coordinates) {
  const marker = new mapboxgl.Marker().setLngLat(coordinates).addTo(map);
  map.flyTo({
    center: coordinates,
    essential: true,
  });
}

function loadUnits() {
  const tomblist = document.getElementById('tomblist');

  db.collection('units')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const unitId = doc.id;

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('list-group-item', 'list-group-item-action');
        button.textContent = unitId;
        button.onclick = function () {
          getUnitCoordinates(unitId);
        };

        tomblist.appendChild(button);
      });
    });
}

function setupMap(center) {
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/kuskusxyrenn/clee7imbg000p01nx6ah0pt8w',
    center: [121.0524150628587, 14.682569991056297],
    zoom: 15,
  });

  const nav = new mapboxgl.NavigationControl();

  map.addControl(nav);

  var directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
  });

  map.addControl(directions, 'top-left');

  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      // When active the map will receive updates to the device's location as it changes.
      trackUserLocation: true,
      // Draw an arrow next to the location dot to indicate which direction the device is heading.
      showUserHeading: true,
    })
  );
}

const firebaseConfig = {
  apiKey: 'AIzaSyAYtbg3SniEAIgQRSM6rReVCQ3UXC22yE4',
  authDomain: 'himinavi-e3f9f.firebaseapp.com',
  projectId: 'himinavi-e3f9f',
  storageBucket: 'himinavi-e3f9f.appspot.com',
  messagingSenderId: '357516927893',
  appId: '1:357516927893:web:8285ade1046c68d1b90c9c',
  measurementId: 'G-WKZE7R1VHT',
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

async function init() {
  loadUnits();
}

init();
