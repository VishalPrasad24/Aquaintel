
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { UserProfile, HospitalProfile, Profile, Language, LocationData, Disease, HealthAuthorityContact, PendingBulkReport, UserRole, CaseReport } from '../types';
import { Page } from '../App';
import { LOCATIONS, TRANSLATIONS, HIERARCHICAL_LOCATIONS, HEALTH_AUTHORITY_CONTACTS } from '../constants';
import { supabase } from '../services/supabaseClient';
import * as offlineSyncService from '../services/offlineSyncService';

type HierarchicalLocation = { [state: string]: { [district: string]: string[] } };
type Theme = 'light' | 'dark';

interface AppContextType {
  profile: Profile | null;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  login: (profile: Profile, role: UserRole) => void;
  signOut: () => void;
  updateProfile: (updates: Partial<UserProfile | HospitalProfile>) => Promise<void>;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  allLocations: LocationData[];
  locationData: LocationData[];
  reportBulkCases: (report: Omit<PendingBulkReport, 'id'|'timestamp'|'hospitalId'>) => Promise<void>;
  getLocationById: (id: string) => LocationData | undefined;
  hierarchicalLocations: HierarchicalLocation;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  loadingProfile: boolean;
  healthAuthorityContacts: HealthAuthorityContact[];
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<void>;
  sendNotification: (title: string, options: NotificationOptions) => Promise<void>;
  isOnline: boolean;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  initialStudyModule: string | null;
  setInitialStudyModule: (id: string | null) => void;
  initialChatbotQuery: string | null;
  setInitialChatbotQuery: (query: string | null) => void;
  currentLocationId: string | undefined;
  setCurrentLocationId: (locationId: string) => Promise<void>;
  hospitalReports: CaseReport[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode; }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [language, setLanguage] = useState<Language>('en');
  const [locationData, setLocationData] = useState<LocationData[]>(LOCATIONS);
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('theme') as Theme | null) || 'light');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [initialStudyModule, setInitialStudyModule] = useState<string | null>(null);
  const [initialChatbotQuery, setInitialChatbotQuery] = useState<string | null>(null);
  const [hospitalReports, setHospitalReports] = useState<CaseReport[]>([]);


  const fetchCaseData = useCallback(async () => {
    try {
        const { data, error } = await supabase.from('case_reports').select('*');
        if (error) throw error;
        
        const aggregatedCases = LOCATIONS.map(loc => {
          const newCases = { ...loc.cases };
          for (const disease in newCases) newCases[disease as Disease] = 0;
          
          const reportsForLocation = data.filter(report => report.location_id === loc.id);
          reportsForLocation.forEach(report => {
            if (newCases[report.disease as Disease] !== undefined) {
               newCases[report.disease as Disease] += report.case_count;
            }
          });
          return { ...loc, cases: newCases };
        });
        setLocationData(aggregatedCases);

    } catch (error) {
        console.warn("Could not fetch case data from Supabase. This is likely due to a missing RLS policy on 'case_reports'. Falling back to sample data.", error);
        setLocationData(LOCATIONS);
    }
  }, []);

   const fetchHospitalReports = useCallback(async (hospitalId: string) => {
    if (!hospitalId) return;
    const { data, error } = await supabase
      .from('case_reports')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('report_date', { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching hospital reports:", error);
    } else {
      setHospitalReports(data as CaseReport[]);
    }
  }, []);

  const syncPendingReports = useCallback(async () => {
    if (!profile || userRole !== 'hospital') return;
    const pending = await offlineSyncService.getPendingReports();
    if (pending.length > 0) {
      console.log(`Syncing ${pending.length} offline reports...`);
      for (const report of pending) {
        const { error } = await supabase.from('case_reports').insert({
          hospital_id: report.hospitalId,
          location_id: report.locationId,
          disease: report.disease,
          case_count: report.count,
          report_date: report.date,
        });
        if (!error) {
          await offlineSyncService.deletePendingReport(report.id!);
        } else {
          console.error("Failed to sync report:", error);
        }
      }
      console.log("Offline sync complete.");
      fetchCaseData();
      fetchHospitalReports(profile.id);
    }
  }, [profile, userRole, fetchCaseData, fetchHospitalReports]);
  
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); syncPendingReports(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingReports]);
  
  const login = (profileData: Profile, role: UserRole) => {
    setProfile(profileData);
    setUserRole(role);
    localStorage.setItem('userRole', role);
    localStorage.setItem('profile', JSON.stringify(profileData));
    fetchCaseData(); // Refresh data on login
    if (role === 'hospital') {
      fetchHospitalReports(profileData.id);
    }
  };

  const signOut = () => {
    setProfile(null);
    setUserRole(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('profile');
    setCurrentPage('dashboard');
    fetchCaseData(); // Refresh data on logout to show public view
  };
  
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as UserRole;
    const savedProfile = localStorage.getItem('profile');

    if (savedRole && savedProfile) {
        try {
            const parsedProfile = JSON.parse(savedProfile);
            setUserRole(savedRole);
            setProfile(parsedProfile);
            if (savedRole === 'hospital') {
                fetchHospitalReports(parsedProfile.id);
            }
        } catch(e) {
            console.error("Failed to parse profile from localStorage", e);
            localStorage.clear();
        }
    }
    fetchCaseData();
    setLoadingProfile(false);
  }, [fetchCaseData, fetchHospitalReports]);

  const updateProfile = async (updates: Partial<UserProfile | HospitalProfile>) => {
    if (!profile || !userRole) return;
    
    const tableName = userRole === 'user' ? 'profiles' : 'hospitals';
    const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();
    
    if (error) {
        console.error("Error updating profile:", error);
        throw error;
    } else if (data) {
        const newProfile = data as Profile;
        setProfile(newProfile);
        localStorage.setItem('profile', JSON.stringify(newProfile));
    }
  };

  const setCurrentLocationId = async (locationId: string) => {
    if (!profile || !userRole) return;
    
    if (userRole === 'hospital') return; // Hospitals cannot change location

    const oldProfile = profile;
    const newProfile = { ...profile, location: locationId };
    setProfile(newProfile);
    localStorage.setItem('profile', JSON.stringify(newProfile));

    try {
        await updateProfile({ location: locationId });
    } catch (error) {
        setProfile(oldProfile); // Revert on failure
        localStorage.setItem('profile', JSON.stringify(oldProfile));
        alert("Failed to save location change. Please ensure you have the correct database permissions (RLS policies) and try again.");
    }
  };

  const reportBulkCases = async (report: Omit<PendingBulkReport, 'id'|'timestamp'|'hospitalId'>) => {
    if (!profile || userRole !== 'hospital') return;
    const fullReport: Omit<PendingBulkReport, 'id'|'timestamp'> = { ...report, hospitalId: profile.id };

    if (isOnline) {
        const { error } = await supabase.from('case_reports').insert({
            hospital_id: fullReport.hospitalId,
            location_id: fullReport.locationId,
            disease: fullReport.disease,
            case_count: fullReport.count,
            report_date: fullReport.date,
        });
        if (error) {
            console.error("Failed to submit report, queuing offline:", error);
            await offlineSyncService.addPendingReport(fullReport);
        } else {
            fetchCaseData();
            fetchHospitalReports(profile.id);
        }
    } else {
        await offlineSyncService.addPendingReport(fullReport);
    }
  };

  useEffect(() => {
    if ('Notification' in window) setNotificationPermission(Notification.permission);
  }, []);
  const requestNotificationPermission = async () => { /* ... */ };
  const sendNotification = async (title: string, options: NotificationOptions) => { /* ... */ };
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const t = useCallback((key: string): string => TRANSLATIONS[key]?.[language] || key, [language]);
  const getLocationById = useCallback((id?: string) => {
      if (!id) return undefined;
      return locationData.find(loc => loc.id === id);
  }, [locationData]);

  return (
    <AppContext.Provider value={{
      profile, userRole, setUserRole, login, signOut, updateProfile,
      language, setLanguage, t,
      allLocations: LOCATIONS, locationData,
      reportBulkCases,
      getLocationById, hierarchicalLocations: HIERARCHICAL_LOCATIONS,
      theme, setTheme, loadingProfile, healthAuthorityContacts: HEALTH_AUTHORITY_CONTACTS,
      notificationPermission, requestNotificationPermission, sendNotification,
      isOnline, currentPage, setCurrentPage,
      initialStudyModule, setInitialStudyModule, initialChatbotQuery, setInitialChatbotQuery,
      currentLocationId: profile?.location, setCurrentLocationId,
      hospitalReports
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppContextProvider');
  return context;
};
