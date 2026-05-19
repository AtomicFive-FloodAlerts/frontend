import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

type Spot = {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
};

type UserLocation = {
  latitude: number;
  longitude: number;
};

type Props = {
  spots: Spot[];
  userLocation: UserLocation | null;
};

const makeIcon = (color: string) =>
  new L.DivIcon({
    className: "",
    html: `<div style="
      width: 22px; height: 22px;
      background: ${color};
      border-radius: 50%;
      border: 2.5px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14],
  });

const ICONS = {
  HIGH:   makeIcon("#ef4444"),
  MEDIUM: makeIcon("#f97316"),
  LOW:    makeIcon("#3b82f6"),
  USER:   makeIcon("#16a34a"),
};

export default function LeafletMap({ spots, userLocation }: Props) {
  return (
    <MapContainer
      center={[6.9271, 79.8612]}
      zoom={13}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        url="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={19}
      />

      {spots.map((spot) => (
        <React.Fragment key={spot.id}>
          <Marker
            position={[spot.latitude, spot.longitude]}
            icon={ICONS[spot.priority]}
          >
            <Popup>
              <div style={{ minWidth: 170 }}>
                <p style={{ margin: "0 0 4px", fontWeight: "bold", fontSize: 15 }}>
                  {spot.name}
                </p>
                <p style={{ margin: "0 0 6px", fontSize: 13 }}>
                  {spot.description}
                </p>
                <p style={{ margin: 0, fontWeight: "bold", fontSize: 13 }}>
                  Priority: {spot.priority}
                </p>
              </div>
            </Popup>
          </Marker>

          {spot.priority === "HIGH" && (
            <Circle
              center={[spot.latitude, spot.longitude]}
              radius={5000}
              pathOptions={{
                color: "rgba(255,0,0,0.8)",
                fillColor: "rgba(255,0,0,0.25)",
                fillOpacity: 0.25,
                weight: 2,
              }}
            />
          )}

          {spot.priority === "MEDIUM" && (
            <Circle
              center={[spot.latitude, spot.longitude]}
              radius={300}
              pathOptions={{
                color: "rgba(255,165,0,0.8)",
                fillColor: "rgba(255,165,0,0.25)",
                fillOpacity: 0.25,
                weight: 2,
              }}
            />
          )}
        </React.Fragment>
      ))}

      {userLocation && (
        <Marker
          position={[userLocation.latitude, userLocation.longitude]}
          icon={ICONS.USER}
        >
          <Popup>
            <strong>You are here</strong>
            <p style={{ margin: "4px 0 0", fontSize: 13 }}>Live location</p>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}