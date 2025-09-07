
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Language } from '../../types';

interface HeaderProps {
    onMenuClick: () => void;
}

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useAppContext();
    const languages: { code: Language, name: string }[] = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'as', name: 'অসমীয়া' },
        { code: 'ne', name: 'नेपाली' }
    ];

    return (
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1">
            {languages.map(lang => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-3 py-1 text-xs sm:text-sm font-semibold rounded-full transition-colors duration-300 ${language === lang.code ? 'bg-white dark:bg-gray-900 text-primary-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-900/40'}`}
                >
                    {lang.name}
                </button>
            ))}
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { profile, userRole, t, currentLocationId, setCurrentLocationId, allLocations } = useAppContext();

    if (!profile) return null;

    const currentLocation = allLocations.find(loc => loc.id === currentLocationId);
    const welcomeKey = userRole === 'user' ? 'welcome_user' : 'welcome_hospital';

    return (
        <header className="bg-primary-50 dark:bg-gray-800 shadow-sm p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={onMenuClick} className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white focus:outline-none" aria-label="Open menu">
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">{t(welcomeKey)}, {profile.name}!</h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('health_overview')} {currentLocation ? `${currentLocation.city}, ${currentLocation.district}` : '...'}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {userRole === 'user' && (
                        <div className="relative">
                            <select
                                id="location"
                                value={currentLocationId || ''}
                                onChange={(e) => setCurrentLocationId(e.target.value)}
                                className="block w-full pl-3 pr-8 py-2 text-sm border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm"
                                aria-label={t('select_location')}
                            >
                                {allLocations.map(location => (
                                    <option key={location.id} value={location.id}>
                                        {location.city}, {location.district}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="hidden sm:block">
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>
            <div className="mt-3 sm:hidden flex justify-end">
                <LanguageSwitcher />
            </div>
        </header>
    );
};

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

export default Header;