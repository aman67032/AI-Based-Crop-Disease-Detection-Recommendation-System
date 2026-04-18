"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup, useMap, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

// Fix standard leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapProps {
  onPolygonDrawn: (coordinates: number[][]) => void;
  ndviPolygon?: number[][] | null;
}

const GeomanControls = ({ onPolygonDrawn }: { onPolygonDrawn: (coordinates: number[][]) => void }) => {
  const map = useMap();
  const [controlsAdded, setControlsAdded] = useState(false);

  useEffect(() => {
    if (!controlsAdded) {
      map.pm.addControls({
        position: "topleft",
        drawMarker: false,
        drawCircleMarker: false,
        drawPolyline: false,
        drawRectangle: true,
        drawPolygon: true,
        drawCircle: false,
        editMode: true,
        dragMode: true,
        cutPolygon: false,
        removalMode: true,
      });
      setControlsAdded(true);
    }

    map.on("pm:create", (e) => {
      const layer = e.layer as any;
      const latlngs = layer.getLatLngs()[0];
      // Map to [lat, lng] array
      const coords = latlngs.map((ll: any) => [ll.lat, ll.lng]);
      onPolygonDrawn(coords);
    });

    return () => {
      map.off("pm:create");
    };
  }, [map, controlsAdded, onPolygonDrawn]);

  return null;
};

const FlyToLocation = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16);
    }
  }, [position, map]);
  return null;
};

export default function MapComponent({ onPolygonDrawn, ndviPolygon }: MapProps) {
  const [position, setPosition] = useState<[number, number]>([20.5937, 78.9629]); // India center
  const [satellite, setSatellite] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  return (
    <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-500">
      <div className="absolute top-4 right-4 z-[400] flex gap-2">
        <button 
          onClick={() => setSatellite(!satellite)}
          className="bg-white px-4 py-2 rounded-xl font-bold text-sm shadow-md text-emerald-800 hover:bg-emerald-50"
        >
          {satellite ? "Switch to Map" : "Switch to Satellite"}
        </button>
        <button 
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                setPosition([pos.coords.latitude, pos.coords.longitude]);
              });
            }
          }}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-emerald-500"
        >
          📍 Find Me
        </button>
      </div>

      <MapContainer
        center={position}
        zoom={5}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <FlyToLocation position={position} />
        {satellite ? (
          <TileLayer
            attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        
        <FeatureGroup>
          <GeomanControls onPolygonDrawn={onPolygonDrawn} />
        </FeatureGroup>

        {/* Simulated NDVI Layer over the drawn polygon */}
        {ndviPolygon && (
          <Polygon 
            positions={ndviPolygon} 
            pathOptions={{ 
              color: '#ef4444', 
              fillColor: 'url(#ndvi-gradient)', 
              fillOpacity: 0.7,
              weight: 3
            }} 
          />
        )}
      </MapContainer>

      {/* SVG Gradient for fake NDVI visualization */}
      <svg width="0" height="0">
        <defs>
          <radialGradient id="ndvi-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" /> {/* Healthy center */}
            <stop offset="60%" stopColor="#eab308" stopOpacity="0.8" /> {/* Stressed middle */}
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" /> {/* Diseased edges */}
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
