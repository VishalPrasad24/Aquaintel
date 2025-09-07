import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { UserProfile, HospitalProfile } from '../../types';

type Tab = 'personal' | 'preferences' | 'support';

const Profile: React.FC = () => {
    const { profile, userRole, t, updateProfile, signOut, allLocations, theme, setTheme, healthAuthorityContacts, notificationPermission, requestNotificationPermission, getLocationById } = useAppContext();
    const [activeTab, setActiveTab] = useState<Tab>('personal');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [editedName, setEditedName] = useState(profile?.name || '');
    const [editedAvatarUrl, setEditedAvatarUrl] = useState((profile as UserProfile)?.avatarUrl || '');
    const [editedLocationId, setEditedLocationId] = useState(profile?.location || '');
    
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (profile) {
            setEditedName(profile.name);
            setEditedLocationId(profile.location);
            if (userRole === 'user') {
                 setEditedAvatarUrl((profile as UserProfile).avatarUrl || '');
            }
        }
    }, [profile, userRole]);

    const isDirty = useMemo(() => {
        if (!profile) return false;
        if (editedName !== profile.name) return true;
        if (userRole === 'user') {
            const userProfile = profile as UserProfile;
            if (editedLocationId !== userProfile.location) return true;
            if (editedAvatarUrl !== (userProfile.avatarUrl || '')) return true;
        }
        return false;
    }, [profile, userRole, editedName, editedLocationId, editedAvatarUrl]);
    
    const TABS: { id: Tab; label: string }[] = [
        { id: 'personal', label: t('personal_information') },
        { id: 'preferences', label: t('preferences') },
        { id: 'support', label: t('support_and_help') },
    ];

    const handleSave = async () => {
        if (!profile || !isDirty) return;
        
        setIsSaving(true);
        setSaveSuccess(false);
        
        const updates: Partial<UserProfile | HospitalProfile> = {};
        if (editedName !== profile.name) updates.name = editedName.trim();
        if (userRole === 'user') {
            const userProfile = profile as UserProfile;
            if (editedAvatarUrl !== (userProfile.avatarUrl || '')) (updates as Partial<UserProfile>).avatarUrl = editedAvatarUrl;
            if (editedLocationId !== userProfile.location) (updates as Partial<UserProfile>).location = editedLocationId;
        }
        
        try {
            await updateProfile(updates);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2500);
        } catch (error: any) {
            console.error("Save failed:", error);
            alert(`Failed to save profile changes.\n\nError: ${error.message}\n\nThis is likely due to a missing database security policy (RLS). Please ensure you have run the appropriate UPDATE policy script in your Supabase SQL Editor.`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setEditedName(profile.name);
            setEditedLocationId(profile.location);
            if (userRole === 'user') {
                setEditedAvatarUrl((profile as UserProfile).avatarUrl || '');
            }
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setEditedAvatarUrl(reader.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const renderTabContent = () => {
        if (!profile) return null;
        const currentLocation = getLocationById(profile.location);
        switch (activeTab) {
            case 'personal':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                        <div className="flex flex-col items-center text-center md:col-span-1">
                             {userRole === 'user' ? (
                                <>
                                    <img className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-primary-500 dark:border-primary-600" src={editedAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(editedName)}&background=random`} alt={editedName} onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(editedName)}&background=random`; }} />
                                    <button onClick={() => fileInputRef.current?.click()} className="mt-4 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-100 rounded-md hover:bg-primary-200 dark:bg-gray-700 dark:text-primary-300 dark:hover:bg-gray-600"> {t('change_picture')} </button>
                                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                                </>
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center shadow-lg border-4 border-primary-500 dark:border-primary-600">
                                    <HospitalIcon className="w-16 h-16 text-gray-500 dark:text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{userRole === 'user' ? t('name') : t('hospital_name')}</label>
                                <input type="text" id="profileName" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="mt-1 block w-full pl-3 pr-3 py-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('location')}</label>
                                {userRole === 'user' ? (
                                    <select id="location" value={editedLocationId} onChange={(e) => setEditedLocationId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 shadow-sm">
                                        {allLocations.sort((a,b) => a.city.localeCompare(b.city)).map(loc => ( <option key={loc.id} value={loc.id}>{loc.city}, {loc.state}</option> ))}
                                    </select>
                                ) : (
                                    <p className="mt-1 px-3 py-2 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded-md">{currentLocation ? `${currentLocation.city}, ${currentLocation.district}` : profile.location}</p>
                                )}
                            </div>
                            {isDirty && (
                                <div className="pt-4 flex justify-end space-x-3">
                                    <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition">{t('cancel')}</button>
                                    <button onClick={handleSave} disabled={isSaving} className={`px-4 py-2 text-white rounded-lg transition shadow-md ${saveSuccess ? 'bg-success-600' : 'bg-primary-600 hover:bg-primary-700'} disabled:bg-primary-400`}>
                                        {isSaving ? 'Saving...' : (saveSuccess ? 'Saved!' : t('save'))}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'preferences': 
                return (
                     <div className="space-y-6">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{t('dark_mode')}</h4>
                            <div className="flex items-center justify-between mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-300">Enable dark theme</p>
                                <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-200'}`}>
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                         <div>
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{t('notifications')}</h4>
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                {notificationPermission === 'granted' ? (
                                    <p className="text-sm text-success-600 dark:text-success-400">{t('notifications_enabled')}</p>
                                ) : (
                                    <button onClick={requestNotificationPermission} className="text-sm font-medium text-primary-600 hover:underline">{t('enable_notifications')}</button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'support':
                const contacts = healthAuthorityContacts.find(c => c.state === getLocationById(profile.location)?.state);
                const hospitalsInDistrict = contacts?.hospitals.filter(h => h.district === getLocationById(profile.location)?.district);

                return (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{t('customer_support')}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t('support_message')}</p>
                            <a href="mailto:support@arogyasahay.org" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">support@arogyasahay.org</a>
                        </div>
                         <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{t('local_health_authorities')}</h4>
                             {contacts && (
                                <div className="mt-2 space-y-4">
                                    <div>
                                        <h5 className="font-semibold text-gray-700 dark:text-gray-200">{t('state_helplines')}</h5>
                                        <ul className="mt-1 space-y-1">
                                            {contacts.helplines.map(line => (
                                                 <li key={line.name} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                                     <span className="text-gray-600 dark:text-gray-300">{line.name}</span>
                                                     <a href={`tel:${line.phone}`} className="font-mono text-primary-600 dark:text-primary-400">{line.phone}</a>
                                                 </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-gray-700 dark:text-gray-200">{t('nearby_hospitals')} ({getLocationById(profile.location)?.district})</h5>
                                        {hospitalsInDistrict && hospitalsInDistrict.length > 0 ? (
                                             <ul className="mt-1 space-y-1">
                                                {hospitalsInDistrict.map(h => (
                                                    <li key={h.name} className="text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-semibold text-gray-600 dark:text-gray-300">{h.name}</span>
                                                            <a href={`tel:${h.phone}`} className="font-mono text-primary-600 dark:text-primary-400">{h.phone}</a>
                                                        </div>
                                                        {h.address && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{h.address}</p>}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No hospitals listed for this district.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default: return null;
        }
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{userRole === 'user' ? t('user_profile') : t('hospital_profile')}</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-4xl mx-auto">
                {/* Mobile Tab Navigation */}
                <div className="md:hidden border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
                        {TABS.map(tab => (
                             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mx-2 ${activeTab === tab.id ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="md:flex">
                    {/* Desktop Tab Navigation */}
                    <div className="hidden md:flex flex-col w-full md:w-1/4 border-r border-gray-200 dark:border-gray-700 p-4">
                        <nav className="flex-1 space-y-1">
                            {TABS.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full text-left px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === tab.id ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                             <button onClick={signOut} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-danger-600 bg-danger-100 dark:bg-danger-900/50 dark:text-danger-300 rounded-md hover:bg-danger-200 dark:hover:bg-danger-900">
                                <LogoutIcon className="w-5 h-5 mr-2" />
                                {t('logout')}
                            </button>
                        </div>
                    </div>
                    
                    <div className="w-full p-6 md:p-8">
                         {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

const HospitalIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-2.25a2.25 2.25 0 012.25-2.25h3a2.25 2.25 0 012.25 2.25V21M12 21v-2.25a2.25 2.25 0 012.25-2.25h3a2.25 2.25 0 012.25 2.25V21" /></svg>;
const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>;

export default Profile;