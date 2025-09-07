import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import L from 'leaflet';
import { useAppContext } from '../../context/AppContext';
import { Disease, LocationData, DiseaseData } from '../../types';
import { geocode } from '../../services/geoapifyService';
import { DISEASE_COLORS } from '../../constants';

const getFilterButtonClass = (isActive: boolean): string => {
    return `px-3 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 shadow-sm ${
        isActive
        ? 'bg-primary-600 text-white'
        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-primary-100 dark:hover:bg-gray-600'
    }`;
};

const PopupContent: React.FC<{ location: LocationData }> = ({ location }) => (
    <div className="p-1">
        <h4 className="font-bold text-md mb-1">{location.city}, {location.district}</h4>
        <ul className="text-xs space-y-0.5">
            {Object.entries(location.cases).map(([disease, count]) => (
                <li key={disease} className="flex justify-between">
                    <span>{disease}:</span>
                    <span className="font-semibold ml-2">{count}</span>
                </li>
            ))}
        </ul>
    </div>
);

// Helper function to create SVG for pie chart markers
const createPieChartIcon = (cases: DiseaseData, totalCases: number): L.DivIcon => {
    const size = Math.max(20, Math.min(60, Math.sqrt(totalCases) * 3));
    const radius = size / 2;
    let accumulatedPercent = 0;

    const slices = Object.entries(cases)
        .filter(([, count]) => count > 0)
        .map(([disease, count]) => {
            const percent = count / totalCases;
            const startAngle = accumulatedPercent * 2 * Math.PI;
            accumulatedPercent += percent;
            const endAngle = accumulatedPercent * 2 * Math.PI;
            
            const startX = radius + radius * Math.cos(startAngle);
            const startY = radius + radius * Math.sin(startAngle);
            const endX = radius + radius * Math.cos(endAngle);
            const endY = radius + radius * Math.sin(endAngle);
            
            const largeArcFlag = percent > 0.5 ? 1 : 0;
            
            const pathData = `M ${radius},${radius} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} z`;

            return `<path d="${pathData}" fill="${DISEASE_COLORS[disease as Disease]}" />`;
        }).join('');

    const svg = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));">
            ${slices}
            <circle cx="${radius}" cy="${radius}" r="${radius}" fill="transparent" stroke="rgba(255,255,255,0.5)" stroke-width="1" />
        </svg>
    `;

    return L.divIcon({
        html: svg,
        className: '', // important to clear default styling
        iconSize: [size, size],
        iconAnchor: [radius, radius]
    });
};

const PieChartLegend: React.FC = () => (
    <div className="leaflet-control leaflet-bar bg-white dark:bg-gray-800 p-2 rounded-md shadow-lg">
        <h4 className="font-bold text-xs mb-1 text-gray-800 dark:text-gray-200">Disease Legend</h4>
        <ul className="space-y-1">
            {Object.entries(DISEASE_COLORS).map(([disease, color]) => (
                 <li key={disease} className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
                    {disease}
                </li>
            ))}
        </ul>
    </div>
);


const DiseaseMap: React.FC = () => {
    const { t, locationData, allLocations } = useAppContext();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.LayerGroup>(L.layerGroup());
    const searchMarkerRef = useRef<L.Marker | null>(null);
    const legendControlRef = useRef<any>(null);


    const [filterDisease, setFilterDisease] = useState<Disease | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    
    const centerCoords: L.LatLngTuple = useMemo(() => {
        if (allLocations.length === 0) return [27.5, 88.5]; // Default fallback
        const avgLat = allLocations.reduce((sum, loc) => sum + loc.coords.lat, 0) / allLocations.length;
        const avgLng = allLocations.reduce((sum, loc) => sum + loc.coords.lng, 0) / allLocations.length;
        return [avgLat, avgLng];
    }, [allLocations]);
    
    // Initialize map and user location
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current).setView(centerCoords, 8);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            markersRef.current.addTo(map);
            mapRef.current = map;

            // Add user location marker
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        const userLatLng: L.LatLngTuple = [latitude, longitude];

                        const userIconSvg = `
                            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">
                                <circle cx="16" cy="16" r="14" fill="#0ea5e9" fill-opacity="0.2"/>
                                <circle cx="16" cy="16" r="8" fill="#0ea5e9" stroke="white" stroke-width="2.5"/>
                            </svg>`;

                        const userIconUrl = `data:image/svg+xml;base64,${btoa(userIconSvg)}`;
                        
                        const userLocationIcon = L.icon({
                            iconUrl: userIconUrl,
                            iconSize: [32, 32],
                            iconAnchor: [16, 16],
                            popupAnchor: [0, -16],
                        });
                        
                        L.marker(userLatLng, { icon: userLocationIcon })
                            .addTo(map)
                            .bindPopup('<b>You are here</b>');
                    },
                    (error) => {
                        console.warn("Could not get user location:", error.message);
                    }
                );
            }
        }
    }, [centerCoords]);

    // Update markers when data or filter changes
    useEffect(() => {
        if (!mapRef.current) return;
        
        markersRef.current.clearLayers();

        // Handle legend
        if (legendControlRef.current) {
            legendControlRef.current.remove();
            legendControlRef.current = null;
        }

        if (filterDisease === 'all') {
            const legend = new L.Control({ position: 'bottomright' });
            legend.onAdd = () => {
                const div = L.DomUtil.create('div', 'info legend');
                const root = ReactDOM.createRoot(div);
                root.render(<PieChartLegend />);
                return div;
            };
            legend.addTo(mapRef.current);
            legendControlRef.current = legend;
        }

        locationData.forEach(location => {
            const totalCases = Object.values(location.cases).reduce((sum, a) => sum + a, 0);
            if (totalCases === 0) return;
            
            let marker;

            if (filterDisease === 'all') {
                const icon = createPieChartIcon(location.cases, totalCases);
                marker = L.marker([location.coords.lat, location.coords.lng], { icon }).addTo(markersRef.current);
            } else {
                const caseCount = location.cases[filterDisease];
                if (caseCount === 0) return;

                const radius = Math.max(5, Math.sqrt(caseCount) * 2);
                const color = DISEASE_COLORS[filterDisease];

                marker = L.circleMarker([location.coords.lat, location.coords.lng], {
                    radius: radius,
                    fillColor: color,
                    color: color,
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.6
                }).addTo(markersRef.current);
            }
            
            const popupEl = document.createElement('div');
            const root = ReactDOM.createRoot(popupEl);
            root.render(<PopupContent location={location} />);
            marker.bindPopup(popupEl);
        });

    }, [locationData, filterDisease]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setIsSearching(true);
        const coords = await geocode(searchTerm);
        setIsSearching(false);

        if (coords && mapRef.current) {
            if (searchMarkerRef.current) {
                searchMarkerRef.current.remove();
            }
            mapRef.current.flyTo([coords.lat, coords.lon], 12);
            searchMarkerRef.current = L.marker([coords.lat, coords.lon]).addTo(mapRef.current);
        } else {
            alert("Location not found.");
        }
    };
    
    const handleResetView = () => {
         if (searchMarkerRef.current) {
            searchMarkerRef.current.remove();
            searchMarkerRef.current = null;
        }
        if (mapRef.current) {
            mapRef.current.flyTo(centerCoords, 8);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                 <h2 className="text-xl font-bold mb-3">{t('disease_hotspots')}</h2>
                 <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-grow w-full sm:w-auto flex space-x-2">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={t('map_search_placeholder')}
                            className="flex-grow w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm bg-gray-100 dark:bg-gray-700"
                        />
                        <button onClick={handleSearch} disabled={isSearching} className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-md hover:bg-primary-700 disabled:bg-primary-400">
                            {isSearching ? '...' : t('search')}
                        </button>
                    </div>
                     <button onClick={handleResetView} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-sm font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 w-full sm:w-auto">
                        {t('reset_view')}
                    </button>
                 </div>
                 <div className="mt-4">
                     <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">{t('filter_by_disease')}:</label>
                     <div className="flex flex-wrap gap-2 mt-1">
                         <button className={getFilterButtonClass(filterDisease === 'all')} onClick={() => setFilterDisease('all')}>{t('all_diseases')}</button>
                         {Object.values(Disease).map(disease => (
                             <button key={disease} className={getFilterButtonClass(filterDisease === disease)} onClick={() => setFilterDisease(disease)}>{disease}</button>
                         ))}
                     </div>
                 </div>
            </div>
            <div ref={mapContainerRef} className="flex-grow rounded-lg shadow-lg" style={{ height: 'calc(100vh - 250px)' }} />
        </div>
    );
};

export default DiseaseMap;