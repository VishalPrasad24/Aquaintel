
import React from 'react';
import { Page } from '../../App';
import { useAppContext } from '../../context/AppContext';
import { UserProfile } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{ icon: JSX.Element, label: string, isActive: boolean, onClick: () => void }> = ({ icon, label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 rounded-lg ${
                isActive
                ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-300'
            }`}
        >
            <div className="w-6 h-6 mr-3">{icon}</div>
            <span className="font-medium">{label}</span>
        </button>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const { t, profile, userRole, getLocationById, currentPage, setCurrentPage } = useAppContext();

    if (!profile) return null;

    const navItems: { page: Page; label: string; icon: JSX.Element }[] = [
        { page: 'dashboard', label: t('dashboard'), icon: <DashboardIcon /> },
        { page: 'map', label: t('map_view'), icon: <MapIcon /> },
        { page: 'study', label: t('study_modules'), icon: <StudyIcon /> },
        { page: 'chatbot', label: t('ai_assistant'), icon: <ChatIcon /> },
        { page: 'profile', label: t('profile'), icon: <ProfileIcon /> },
    ];
    
    const handleNavClick = (page: Page) => {
        setCurrentPage(page);
        setIsOpen(false); // Close sidebar on navigation for mobile
    };

    const profileLocation = getLocationById(profile.location);

    return (
        <>
            {/* Overlay for mobile */}
            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            ></div>
            
            <aside className={`w-64 flex-shrink-0 bg-primary-50 dark:bg-gray-800 flex flex-col fixed inset-y-0 left-0 z-40 transform transition-transform md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-gray-200 dark:border-gray-700`}>
                <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                     <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Arogya Sahayak</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => (
                        <NavItem 
                            key={item.page} 
                            icon={item.icon}
                            label={item.label}
                            isActive={currentPage === item.page}
                            onClick={() => handleNavClick(item.page)} 
                        />
                    ))}
                </nav>
                
                <button 
                    onClick={() => handleNavClick('profile')}
                    className="flex items-center w-full p-4 border-t border-gray-200 dark:border-gray-700 text-left hover:bg-primary-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                    aria-label="View profile"
                >
                    {userRole === 'user' ? (
                        <img
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            src={(profile as UserProfile).avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`}
                            alt={profile.name}
                            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`; }}
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                            <HospitalIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        </div>
                    )}
                    <div className="ml-3 overflow-hidden">
                        <p className="font-semibold text-gray-800 dark:text-white truncate">{profile.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                             {profileLocation ? `${profileLocation.city}, ${profileLocation.state}` : profile.location}
                        </p>
                    </div>
                </button>
            </aside>
        </>
    );
};

const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>;
const MapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0 0l-3.75-3.75M9 15l3.75-3.75M9 15v2.25m-3.75-6.75v2.25m6.75-2.25v2.25m0 0l3.75 3.75M15 15l-3.75 3.75M15 15V9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const StudyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const HospitalIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-2.25a2.25 2.25 0 012.25-2.25h3a2.25 2.25 0 012.25 2.25V21M12 21v-2.25a2.25 2.25 0 012.25-2.25h3a2.25 2.25 0 012.25 2.25V21" /></svg>

export default Sidebar;
