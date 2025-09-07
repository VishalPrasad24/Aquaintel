
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import StatCard from './StatCard';
import DiseaseBreakdownChart from './DiseaseBreakdownChart';
import { Disease, OutbreakAlertInfo } from '../../types';
import OutbreakAlert from './OutbreakAlert';
import SubmitDataModal from './ReportCaseModal';
import RecentSubmissions from './RecentSubmissions';

const OUTBREAK_THRESHOLD = 150; 

const Dashboard: React.FC = () => {
    const { t, userRole, currentLocationId, getLocationById } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const locationData = useMemo(() => getLocationById(currentLocationId), [currentLocationId, getLocationById]);

    const outbreakAlert = useMemo((): OutbreakAlertInfo | null => {
        if (!locationData) return null;
        for (const [disease, count] of Object.entries(locationData.cases)) {
            if (count > OUTBREAK_THRESHOLD) {
                return { disease: disease as Disease, level: 'High', message: t('outbreak_alert_message').replace('{disease}', disease) };
            }
        }
        return null;
    }, [locationData, t]);

    if (!locationData) {
        return <div className="text-center p-8">{t('select_location')}</div>;
    }

    const totalCases = Object.values(locationData.cases).reduce((sum, count) => sum + count, 0);
    const chartData = Object.entries(locationData.cases).map(([name, value]) => ({ name: name as Disease, cases: value }));

    return (
        <div className="space-y-6">
            {outbreakAlert && <OutbreakAlert alert={outbreakAlert} />}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {t('health_overview')} {locationData.city}, {locationData.district}
                </h2>
                {userRole === 'hospital' && (
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition duration-300 shadow-md flex items-center"
                        >
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            {t('submit_patient_data')}
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2">
                    <StatCard title={t('total_cases')} value={totalCases.toString()} />
                </div>
                <div className="lg:col-span-2">
                    <StatCard title={t('water_ph_level')} value={locationData.waterQuality.ph.toFixed(1)} />
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{t('disease_breakdown')}</h3>
                    <div style={{ height: '300px' }}>
                        <DiseaseBreakdownChart data={chartData} />
                    </div>
                </div>
                {userRole === 'hospital' && (
                    <div className="lg:col-span-2">
                        <RecentSubmissions />
                    </div>
                )}
            </div>

            {userRole === 'hospital' && (
                <SubmitDataModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
};

const PlusCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default Dashboard;