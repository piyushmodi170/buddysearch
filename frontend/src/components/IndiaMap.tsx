'use client';
import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

// Using a highly reliable GeoJSON file for India
const INDIA_GEO_JSON = "/india_states.geojson";

// Major cities [longitude, latitude]
const cities = [
  { name: "Delhi", coordinates: [77.2090, 28.6139], pulse: true },
  { name: "Mumbai", coordinates: [72.8777, 19.0760], pulse: true },
  { name: "Bangalore", coordinates: [77.5946, 12.9716], pulse: true },
  { name: "Hyderabad", coordinates: [78.4867, 17.3850], pulse: false },
  { name: "Chennai", coordinates: [80.2707, 13.0827], pulse: false },
  { name: "Kolkata", coordinates: [88.3639, 22.5726], pulse: true },
  { name: "Pune", coordinates: [73.8567, 18.5204], pulse: false },
  { name: "Jaipur", coordinates: [75.7873, 26.9124], pulse: true },
  { name: "Ahmedabad", coordinates: [72.5714, 23.0225], pulse: false },
  { name: "Lucknow", coordinates: [80.9462, 26.8467], pulse: false },
  { name: "Patna", coordinates: [85.1376, 25.5941], pulse: false },
  { name: "Bhopal", coordinates: [77.4126, 23.2599], pulse: true },
  { name: "Chandigarh", coordinates: [76.7794, 30.7333], pulse: false },
  { name: "Guwahati", coordinates: [91.7362, 26.1445], pulse: true },
  { name: "Kochi", coordinates: [76.2673, 9.9312], pulse: false },
  { name: "Bhubaneswar", coordinates: [85.8245, 20.2961], pulse: true },
  { name: "Indore", coordinates: [75.8577, 22.7196], pulse: false },
  { name: "Nagpur", coordinates: [79.0882, 21.1458], pulse: false },
  { name: "Surat", coordinates: [72.8311, 21.1702], pulse: false },
  { name: "Visakhapatnam", coordinates: [83.2185, 17.6868], pulse: true },
];

export default function IndiaMap() {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const geoUrl = INDIA_GEO_JSON;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-visible">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1150,
          center: [82.5, 22.5] // Exact center of India
        }}
        className="w-full h-auto drop-shadow-xl"
        width={600}
        height={700}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onMouseEnter={() => {
                  const props: any = geo.properties || {};
                  const stateName = props.NAME_1 || props.name || props.st_nm || props.ST_NM;
                  setHoveredState(stateName);
                }}
                onMouseLeave={() => {
                  setHoveredState(null);
                }}
                fill="#FDE8EC"
                stroke="#ffffff"
                strokeWidth={0.8}
                style={({
                  default: {
                    fill: "#FDE8EC",
                    stroke: "#ffffff",
                    strokeWidth: 0.8,
                    outline: "none",
                  },
                  hover: {
                    fill: "#F04438",
                    stroke: "#ffffff",
                    strokeWidth: 1,
                    outline: "none",
                  },
                  pressed: {
                    fill: "#F04438",
                    stroke: "#ffffff",
                    strokeWidth: 1,
                    outline: "none",
                  }
                }) as any}
              />
            ))
          }
        </Geographies>

        {/* Render precise markers for cities based on Long/Lat coordinates */}
        {cities.map(({ name, coordinates, pulse }) => (
          <Marker key={name} coordinates={coordinates as [number, number]}>
            <circle r={3.5} fill="#F04438" />
            {pulse && (
              <circle r={7} fill="#F04438" className="animate-ping opacity-60" />
            )}
          </Marker>
        ))}
      </ComposableMap>

      {hoveredState && (
        <div className="absolute top-4 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-xl z-10 pointer-events-none">
          {hoveredState}
        </div>
      )}
    </div>
  );
}
