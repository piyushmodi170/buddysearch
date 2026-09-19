'use client';
import React, { useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import indiaTopo from '@/data/india.topo.json';

const CITIES = [
  { name: 'Mumbai', state: 'Maharashtra', coordinates: [72.8777, 19.076], hot: true },
  { name: 'Delhi', state: 'Delhi NCR', coordinates: [77.1025, 28.7041], hot: true },
  { name: 'Bangalore', state: 'Karnataka', coordinates: [77.5946, 12.9716], hot: true },
  { name: 'Hyderabad', state: 'Telangana', coordinates: [78.4867, 17.385], hot: true },
  { name: 'Chennai', state: 'Tamil Nadu', coordinates: [80.2707, 13.0827], hot: true },
  { name: 'Kolkata', state: 'West Bengal', coordinates: [88.3639, 22.5726], hot: true },
  { name: 'Pune', state: 'Maharashtra', coordinates: [73.8567, 18.5204], hot: true },
  { name: 'Ahmedabad', state: 'Gujarat', coordinates: [72.5714, 23.0225], hot: false },
  { name: 'Jaipur', state: 'Rajasthan', coordinates: [75.7873, 26.9124], hot: false },
  { name: 'Lucknow', state: 'Uttar Pradesh', coordinates: [80.9462, 26.8467], hot: false },
  { name: 'Chandigarh', state: 'Punjab', coordinates: [76.7794, 30.7333], hot: false },
  { name: 'Indore', state: 'Madhya Pradesh', coordinates: [75.8577, 22.7196], hot: false },
  { name: 'Kochi', state: 'Kerala', coordinates: [76.2673, 9.9312], hot: false },
  { name: 'Guwahati', state: 'Assam', coordinates: [91.7362, 26.1445], hot: false },
  { name: 'Bhopal', state: 'Madhya Pradesh', coordinates: [77.4126, 23.2599], hot: false },
  { name: 'Nagpur', state: 'Maharashtra', coordinates: [79.0882, 21.1458], hot: false },
  { name: 'Coimbatore', state: 'Tamil Nadu', coordinates: [76.9558, 11.0168], hot: false },
  { name: 'Vizag', state: 'Andhra Pradesh', coordinates: [83.2185, 17.6868], hot: false },
  { name: 'Surat', state: 'Gujarat', coordinates: [72.8311, 21.1702], hot: false },
  { name: 'Patna', state: 'Bihar', coordinates: [85.1376, 25.6093], hot: false },
  { name: 'Ranchi', state: 'Jharkhand', coordinates: [85.3096, 23.3441], hot: false },
  { name: 'Dehradun', state: 'Uttarakhand', coordinates: [78.0322, 30.3165], hot: false },
  { name: 'Mysuru', state: 'Karnataka', coordinates: [76.6394, 12.2958], hot: false },
  { name: 'Noida', state: 'Uttar Pradesh', coordinates: [77.391, 28.5355], hot: false },
  { name: 'Thiruvananthapuram', state: 'Kerala', coordinates: [76.9471, 8.5241], hot: false },
  { name: 'Bhubaneswar', state: 'Odisha', coordinates: [85.8245, 20.2961], hot: false },
  { name: 'Amritsar', state: 'Punjab', coordinates: [74.8723, 31.634], hot: false },
  { name: 'Ludhiana', state: 'Punjab', coordinates: [75.8573, 30.901], hot: false },
  { name: 'Gurugram', state: 'Haryana', coordinates: [77.0266, 28.4595], hot: false },
  { name: 'Kanpur', state: 'Uttar Pradesh', coordinates: [80.3319, 26.4499], hot: false },
  { name: 'Varanasi', state: 'Uttar Pradesh', coordinates: [82.9739, 25.3176], hot: false },
  { name: 'Agra', state: 'Uttar Pradesh', coordinates: [78.0081, 27.1767], hot: false },
  { name: 'Udaipur', state: 'Rajasthan', coordinates: [73.7125, 24.5854], hot: false },
  { name: 'Jodhpur', state: 'Rajasthan', coordinates: [73.0243, 26.2389], hot: false },
  { name: 'Vadodara', state: 'Gujarat', coordinates: [73.1812, 22.3072], hot: false },
  { name: 'Rajkot', state: 'Gujarat', coordinates: [70.8022, 22.3039], hot: false },
  { name: 'Nashik', state: 'Maharashtra', coordinates: [73.7898, 19.9975], hot: false },
  { name: 'Aurangabad', state: 'Maharashtra', coordinates: [75.3433, 19.8762], hot: false },
  { name: 'Raipur', state: 'Chhattisgarh', coordinates: [81.6296, 21.2514], hot: false },
  { name: 'Jabalpur', state: 'Madhya Pradesh', coordinates: [79.9864, 23.1815], hot: false },
  { name: 'Gwalior', state: 'Madhya Pradesh', coordinates: [78.1828, 26.2183], hot: false },
  { name: 'Jamshedpur', state: 'Jharkhand', coordinates: [86.2029, 22.8046], hot: false },
  { name: 'Siliguri', state: 'West Bengal', coordinates: [88.4285, 26.7271], hot: false },
  { name: 'Cuttack', state: 'Odisha', coordinates: [85.883, 20.4625], hot: false },
  { name: 'Vijayawada', state: 'Andhra Pradesh', coordinates: [80.648, 16.5062], hot: false },
  { name: 'Guntur', state: 'Andhra Pradesh', coordinates: [80.4365, 16.3067], hot: false },
  { name: 'Warangal', state: 'Telangana', coordinates: [79.5941, 17.9689], hot: false },
  { name: 'Madurai', state: 'Tamil Nadu', coordinates: [78.1198, 9.9252], hot: false },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu', coordinates: [78.7047, 10.7905], hot: false },
  { name: 'Hubballi', state: 'Karnataka', coordinates: [75.124, 15.3647], hot: false },
  { name: 'Mangaluru', state: 'Karnataka', coordinates: [74.856, 12.9141], hot: false },
  { name: 'Kozhikode', state: 'Kerala', coordinates: [75.7804, 11.2588], hot: false },
  { name: 'Panaji', state: 'Goa', coordinates: [73.8278, 15.4909], hot: false },
  { name: 'Shimla', state: 'Himachal Pradesh', coordinates: [77.1734, 31.1048], hot: false },
  { name: 'Srinagar', state: 'Jammu and Kashmir', coordinates: [74.7973, 34.0837], hot: false },
  { name: 'Jammu', state: 'Jammu and Kashmir', coordinates: [74.857, 32.7266], hot: false },
  { name: 'Imphal', state: 'Manipur', coordinates: [93.9368, 24.817], hot: false },
  { name: 'Shillong', state: 'Meghalaya', coordinates: [91.8933, 25.5788], hot: false },
  { name: 'Agartala', state: 'Tripura', coordinates: [91.2868, 23.8315], hot: false },
  { name: 'Itanagar', state: 'Arunachal Pradesh', coordinates: [93.6053, 27.0844], hot: false },
  { name: 'Aizawl', state: 'Mizoram', coordinates: [92.7176, 23.7271], hot: false },
  { name: 'Kohima', state: 'Nagaland', coordinates: [94.1086, 25.6751], hot: false },
  { name: 'Gangtok', state: 'Sikkim', coordinates: [88.6138, 27.3389], hot: false },
  { name: 'Dispur', state: 'Assam', coordinates: [91.7898, 26.1433], hot: false },
] as const;

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const normalize = (value?: string | null) =>
  value
    ? value
        .toLowerCase()
        .replace(/nct of /g, '')
        .replace(/ ncr/g, '')
        .replace(/arunanchal/g, 'arunachal')
        .replace(/[^a-z]/g, '')
    : '';

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
    </svg>
  );
}

export default function IndiaMap() {
  const [onlineCount, setOnlineCount] = useState('2,000');
  const [activeState, setActiveState] = useState<string | null>(null);

  useEffect(() => {
    setOnlineCount((Math.floor(Math.random() * 1601) + 1200).toLocaleString('en-IN'));
  }, []);

  return (
    <section className="active-buddies" id="buddy-map" aria-label="Active Buddies on BuddySearch">
      <div className="container">
        <div className="active-buddies__header">
          <div className="active-buddies__live-badge">
            <span className="ab-pulse" aria-hidden="true" />
            {onlineCount} buddies online right now
          </div>
          <h2 className="section-title">
            Your Next Buddy <span>Is Already Here.</span>
          </h2>
          <p className="section-subtitle">
            Post what you're up for a coffee meet, shopping, movie plan, and real, verified buddies nearby who are online reply in minutes. Our nationwide network spans major cities - find a buddy near you, no matter where you are.
          </p>
        </div>

        <div className="ab-india">
          <div className="ab-india__content">
            <div className="ab-india__visual">
              <div className="ab-india__svg-wrap">
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{ scale: 950, center: [82.8, 22.5] }}
                  width={560}
                  height={540}
                  style={{ width: '100%', height: 'auto' }}
                >
                  <Geographies geography={indiaTopo}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const key = normalize(geo.properties?.name);
                        const selected = Boolean(activeState && key === activeState);
                        if (!geo.properties?.name) return null;
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={selected ? '#F96566' : '#F9EFEF'}
                            stroke={selected ? '#F96566' : '#EE9CA0'}
                            strokeWidth={selected ? 1 : 0.5}
                            style={{
                              default: { outline: 'none', transition: 'fill 0.25s ease' },
                              hover: { fill: selected ? '#F96566' : '#F0AAB4', outline: 'none' },
                              pressed: { outline: 'none' },
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>
                  {CITIES.map((city) => {
                    const selected = Boolean(activeState && normalize(city.state) === activeState);
                    const dimmed = Boolean(activeState && !selected);
                    return (
                      <Marker key={city.name} coordinates={city.coordinates as [number, number]}>
                        <g
                          className={`ab-india__marker-g ${city.hot ? 'ab-india__marker-g--hot' : ''} ${selected ? 'ab-india__marker-g--active' : ''}`}
                          opacity={dimmed ? 0.25 : 1}
                          style={{ transition: 'opacity 0.25s ease' }}
                        >
                          <circle
                            r={(city.hot ? 12 : 9) * (selected ? 1.4 : 1)}
                            fill="none"
                            stroke="rgba(249, 101, 102, 0.4)"
                            strokeWidth={1.5}
                            className="ab-india__pulse"
                          />
                          <circle r={(city.hot ? 8 : 6) * (selected ? 1.4 : 1)} fill="rgba(249, 101, 102, 0.2)" />
                          <circle
                            r={(city.hot ? 5 : 3.5) * (selected ? 1.5 : 1)}
                            fill="#F96566"
                            stroke="#fff"
                            strokeWidth={1.5}
                            className="ab-india__dot"
                          />
                          <g className="ab-india__marker-tip" opacity={0}>
                            <rect x={-38} y={-40} width={76} height={26} rx={5} fill="white" stroke="#e0e0e0" strokeWidth={0.8} />
                            <text textAnchor="middle" y={-23} style={{ fontSize: '9px', fontWeight: 700, fill: '#1a1a1a' }}>
                              {city.name}
                            </text>
                            <polygon points="-5,-14 5,-14 0,-8" fill="white" />
                          </g>
                        </g>
                      </Marker>
                    );
                  })}
                </ComposableMap>
              </div>
              <div className="ab-india__legend">
                <div className="ab-india__legend-item">
                  <div className="ab-india__legend-dot ab-india__legend-dot--single" />
                  <span>Active City</span>
                </div>
                <div className="ab-india__legend-item">
                  <div className="ab-india__legend-dot ab-india__legend-dot--hot" />
                  <span>Trending City</span>
                </div>
              </div>
            </div>

            <div className="ab-india__stats">
              <h4 className="ab-india__stats-title">Buddies Across India</h4>
              <p className="ab-india__stats-desc">
                From metropolitan hubs to emerging cities, BuddySearch connects you with verified companions wherever life takes you. Our network is growing every day.
              </p>
              <div className="ab-india__city-list">
                {STATES.map((state) => {
                  const key = normalize(state);
                  const active = activeState === key;
                  return (
                    <button
                      type="button"
                      key={state}
                      className={`ab-india__city-card ${active ? 'ab-india__city-card--active' : ''}`}
                      onMouseEnter={() => setActiveState(key)}
                      onMouseLeave={() => setActiveState(null)}
                      onFocus={() => setActiveState(key)}
                      onBlur={() => setActiveState(null)}
                    >
                      <div className="ab-india__city-card-icon">
                        <PinIcon />
                      </div>
                      <span className="ab-india__city-card-name">{state}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
