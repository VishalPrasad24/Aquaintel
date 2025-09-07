import React from 'react';
import { UserRole } from '../../App';
import { useAppContext } from '../../context/AppContext';

interface RoleSelectionProps {
    onSelectRole: (role: UserRole) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
    const { t } = useAppContext();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400">Arogya Sahayak</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">Community Health Monitoring System</p>
            </div>

            <div className="w-full max-w-sm text-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">{t('are_you_a')}</h2>
                <div className="space-y-4">
                    <button
                        onClick={() => onSelectRole('user')}
                        className="w-full flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                        <UserIcon className="w-8 h-8 text-primary-500 mr-4" />
                        <span className="text-lg font-medium text-gray-700 dark:text-gray-200">{t('public_user')}</span>
                    </button>
                    <button
                        onClick={() => onSelectRole('hospital')}
                        className="w-full flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                        <HospitalIcon className="w-8 h-8 text-success-500 mr-4" />
                        <span className="text-lg font-medium text-gray-700 dark:text-gray-200">{t('hospital_staff')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

const HospitalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-2.25a2.25 2.25 0 012.25-2.25h3a2.25 2.25 0 012.25 2.25V21M12 21v-2.25a2.25 2.25 0 012.25-2.25h3a2.25 2.25 0 012.25 2.25V21" />
    </svg>
);

export default RoleSelection;