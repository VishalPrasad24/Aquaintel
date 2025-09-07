
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Disease } from '../../types';
import { format } from 'date-fns';

interface SubmitDataModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SubmitDataModal: React.FC<SubmitDataModalProps> = ({ isOpen, onClose }) => {
    const { t, currentLocationId, reportBulkCases, getLocationById, isOnline } = useAppContext();
    const [selectedDisease, setSelectedDisease] = useState<Disease | ''>('');
    const [caseCount, setCaseCount] = useState<number>(1);
    const [reportDate, setReportDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const location = getLocationById(currentLocationId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDisease || !currentLocationId || caseCount < 1) return;

        setIsSubmitting(true);
        await reportBulkCases({ 
            locationId: currentLocationId, 
            disease: selectedDisease,
            count: caseCount,
            date: reportDate,
        });
        setIsSubmitting(false);
        setShowSuccess(true);
        
        setTimeout(() => {
            onClose();
            setShowSuccess(false);
            setSelectedDisease('');
            setCaseCount(1);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('submit_patient_data')}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                {showSuccess ? (
                    <div className="text-center py-8">
                        <p className="text-lg font-medium text-success-600 dark:text-success-400">
                            {isOnline ? t('case_reported_successfully') : t('case_queued_offline')}
                        </p>
                    </div>
                ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('date_of_report')}</label>
                        <input
                            type="date"
                            id="date"
                            value={reportDate}
                            onChange={(e) => setReportDate(e.target.value)}
                            max={format(new Date(), 'yyyy-MM-dd')}
                            required
                            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700"
                        />
                    </div>
                    <div>
                        <label htmlFor="disease" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('select_disease')}</label>
                        <select
                            id="disease"
                            value={selectedDisease}
                            onChange={(e) => setSelectedDisease(e.target.value as Disease)}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700"
                        >
                            <option value="" disabled>-- {t('select_disease')} --</option>
                            {Object.values(Disease).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="case-count" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('number_of_cases')}</label>
                        <input
                            type="number"
                            id="case-count"
                            value={caseCount}
                            onChange={(e) => setCaseCount(Math.max(1, parseInt(e.target.value, 10)))}
                            min="1"
                            required
                            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700"
                        />
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition">
                            {t('cancel')}
                        </button>
                        <button type="submit" disabled={isSubmitting || !selectedDisease} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:bg-primary-300 dark:disabled:bg-primary-800 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Submitting...' : t('submit')}
                        </button>
                    </div>
                </form>
                )}
            </div>
        </div>
    );
};

export default SubmitDataModal;
