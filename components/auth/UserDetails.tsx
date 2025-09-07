import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { LOCATIONS } from '../../constants';
import { LocationData, UserProfile } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface UserDetailsProps {
    phone: string;
}

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const UserDetails: React.FC<UserDetailsProps> = ({ phone }) => {
    const { login } = useAppContext();
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [locationId, setLocationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const closestLocation = LOCATIONS.reduce((prev, curr) => {
                    const dist = getDistance(latitude, longitude, curr.coords.lat, curr.coords.lng);
                    return dist < prev.dist ? { dist, loc: curr } : prev;
                }, { dist: Infinity, loc: null as LocationData | null });
                setLocationId(closestLocation.loc?.id || LOCATIONS[0]?.id || null);
                setLoading(false);
            },
            () => {
                setError("Could not get your location. Please select one manually.");
                setLocationId(LOCATIONS[0]?.id || null);
                setLoading(false);
            }
        );
    }, []);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!name.trim() || !locationId || !age) {
             setError("Please fill in all details.");
             setLoading(false);
             return;
        }

        const ageNum = parseInt(age, 10);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
            setError("Please enter a valid age.");
            setLoading(false);
            return;
        }

        const { data, error: insertError } = await supabase
            .from('profiles')
            .insert({
                name: name.trim(),
                location: locationId,
                phone: phone,
                age: ageNum,
            }).select().single();

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
        } else if (data) {
            login(data as UserProfile, 'user');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white">Almost there!</h2>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">Let's set up your profile.</p>
            <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Name</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ravi Kumar" required className="mt-1 block w-full px-3 py-2 border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:ring-primary-500 focus:border-primary-500" />
                </div>
                 <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Age</label>
                    <input
                        type="number"
                        id="age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="e.g., 25"
                        required
                        className="mt-1 block w-full px-3 py-2 border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                 <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Location</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">We've detected the closest location. You can change it if needed.</p>
                     <select id="location" value={locationId || ''} onChange={(e) => setLocationId(e.target.value)} required disabled={loading} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        {loading && <option>Detecting location...</option>}
                        {LOCATIONS.map(location => ( <option key={location.id} value={location.id}>{location.city}, {location.state}</option>))}
                    </select>
                </div>
                <button type="submit" disabled={loading || !name || !age} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400">
                    {loading ? 'Saving...' : 'Save & Continue'}
                </button>
            </form>
            {error && <p className="text-sm text-center text-danger-500">{error}</p>}
        </div>
    );
};

export default UserDetails;