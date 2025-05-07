// import React, { useState } from "react";
// import { MapContainer, TileLayer, Polyline } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import axios from "axios";

// const ORS_API_KEY = "5b3ce3597851110001cf6248acab2182e22e496188c19786d6d9096f"; // Встав сюди свій ключ

// const RoutingMap = () => {
//   const [coordinates, setCoordinates] = useState([
//     { lat: "", lng: "" },
//     { lat: "", lng: "" },
//   ]);
//   const [routeCoords, setRouteCoords] = useState([]);
//   const [distance, setDistance] = useState(null);

//   const handleChange = (index, field, value) => {
//     const updated = [...coordinates];
//     updated[index][field] = value;
//     setCoordinates(updated);
//   };

//   const addCoordinate = () => {
//     setCoordinates([...coordinates, { lat: "", lng: "" }]);
//   };

//   const calculateRoute = async () => {
//     const coords = coordinates.map((c) => [parseFloat(c.lng), parseFloat(c.lat)]); // ORS вимагає [lng, lat]

//     try {
//       const res = await axios.post(
//         "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
//         {
//           coordinates: coords,
//         },
//         {
//           headers: {
//             Authorization: ORS_API_KEY,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const geometry = res.data.features[0].geometry.coordinates;
//       const distanceMeters = res.data.features[0].properties.summary.distance;
//       setRouteCoords(geometry.map(([lng, lat]) => [lat, lng])); // Повертаємо назад до [lat, lng]
//       setDistance((distanceMeters / 1000).toFixed(2)); // у км
//     } catch (err) {
//       console.error("Routing error:", err);
//     }
//   };

//   return (
//     <div>
//       <h2>Маршрут (OpenRouteService + OSM)</h2>
//       {coordinates.map((coord, i) => (
//         <div key={i}>
//           <input
//             type="number"
//             placeholder="Широта"
//             value={coord.lat}
//             onChange={(e) => handleChange(i, "lat", e.target.value)}
//           />
//           <input
//             type="number"
//             placeholder="Довгота"
//             value={coord.lng}
//             onChange={(e) => handleChange(i, "lng", e.target.value)}
//           />
//         </div>
//       ))}
//       <button onClick={addCoordinate}>Додати точку</button>
//       <button onClick={calculateRoute}>Прокласти маршрут</button>

//       <MapContainer center={[50.45, 30.52]} zoom={6} style={{ height: "500px", marginTop: "20px" }}>
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
//         {routeCoords.length > 0 && (
//           <Polyline positions={routeCoords} color="blue" />
//         )}
//       </MapContainer>
//       {distance && <p>Загальна відстань: {distance} км</p>}
//     </div>
//   );
// };

// export default RoutingMap;


import React, { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";

const ORS_API_KEY = "5b3ce3597851110001cf6248acab2182e22e496188c19786d6d9096f"; // Замінити на власний ключ

function extractCoordinatesFromGoogleMapsUrl(url) {
  const regexAt = /@([-\d.]+),([-\d.]+)/;
  const regexQuery = /(?:q|place)=([-\d.]+),([-\d.]+)/;
  let match = url.match(regexAt) || url.match(regexQuery);
  if (!match) return null;
  return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
}

async function getCoordinatesFromPlaceName(placeName) {
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: placeName,
        format: "json",
        limit: 1,
      },
    });

    if (res.data.length > 0) {
      const place = res.data[0];
      return { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
    }
  } catch (e) {
    console.error("Geocoding error:", e);
  }
  return null;
}

const RoutingMap = () => {
  const [link1, setLink1] = useState("");
  const [link2, setLink2] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [points, setPoints] = useState([]);

  const getCoordsFromLink = async (url) => {
    const directCoords = extractCoordinatesFromGoogleMapsUrl(url);
    if (directCoords) return directCoords;

    const cleanName = decodeURIComponent(url.split("/").pop().replace(/\+/g, " "));
    return await getCoordinatesFromPlaceName(cleanName);
  };

  const handleRoute = async () => {
    const coord1 = await getCoordsFromLink(link1);
    const coord2 = await getCoordsFromLink(link2);

    if (!coord1 || !coord2) {
      alert("Не вдалося отримати координати з одного з посилань.");
      return;
    }

    setPoints([coord1, coord2]);

    try {
      const res = await axios.post(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          coordinates: [
            [coord1.lng, coord1.lat],
            [coord2.lng, coord2.lat],
          ],
        },
        {
          headers: {
            Authorization: ORS_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const geometry = res.data.features[0].geometry.coordinates;
      const dist = res.data.features[0].properties.summary.distance;
      setRouteCoords(geometry.map(([lng, lat]) => [lat, lng]));
      setDistance((dist / 1000).toFixed(2));
    } catch (err) {
      console.error("Routing error:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Маршрут за Google Maps посиланнями</h2>
      <input
        type="text"
        placeholder="Посилання 1"
        value={link1}
        onChange={(e) => setLink1(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <input
        type="text"
        placeholder="Посилання 2"
        value={link2}
        onChange={(e) => setLink2(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <button onClick={handleRoute}>Прокласти маршрут</button>

      <div style={{ width: "500px", height: "500px", marginTop: "20px" }}>
        <MapContainer center={[50.45, 30.52]} zoom={6} style={{ height: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" />}
          {points.map((p, i) => (
            <Marker key={i} position={[p.lat, p.lng]}>
              <Popup>Точка {i + 1}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {distance && (
        <p style={{ marginTop: "10px", fontWeight: "bold" }}>
          Відстань: {distance} км
        </p>
      )}
    </div>
  );
};

export default RoutingMap;
