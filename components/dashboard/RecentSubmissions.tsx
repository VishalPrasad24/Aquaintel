import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
// Fix: Use named imports for date-fns to resolve module export issues.
import { subDays, parseISO, format } from 'date-fns';

const RecentSubmissions: React.FC = () => {
    const { t, hospitalReports } = useAppContext();

    const reportsLast7Days = useMemo(() => {
        const sevenDaysAgo = subDays(new Date(), 7);
        return hospitalReports.filter(report => parseISO(report.report_date) >= sevenDaysAgo).length;
    }, [hospitalReports]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-full">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{t('recent_submissions')}</h3>
            <div className="mb-4 text-center bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg">
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-300">{reportsLast7Days}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('last_7_days')}</p>
            </div>
            <div className="space-y-3 overflow-y-auto" style={{maxHeight: '200px'}}>
                {hospitalReports.length > 0 ? (
                    hospitalReports.map((report) => (
                        <div key={report.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700 dark:text-gray-200">{report.disease}</span>
                                <span className="font-bold text-gray-900 dark:text-white">{report.case_count} {t('cases')}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {format(parseISO(report.report_date), 'MMM dd, yyyy')}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No submissions yet.</p>
                )}
            </div>
        </div>
    );
};

export default RecentSubmissions;