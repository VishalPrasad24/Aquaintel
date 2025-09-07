
import React from 'react';
import { OutbreakAlertInfo } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface OutbreakAlertProps {
    alert: OutbreakAlertInfo;
}

const OutbreakAlert: React.FC<OutbreakAlertProps> = ({ alert }) => {
    const { t, setCurrentPage, setInitialStudyModule, setInitialChatbotQuery } = useAppContext();

    const handleLearnMore = () => {
        setInitialStudyModule(alert.disease);
        setCurrentPage('study');
    };

    const handleAskAI = () => {
        const query = `Tell me more about the current ${alert.disease} outbreak and what I should do to stay safe.`;
        setInitialChatbotQuery(query);
        setCurrentPage('chatbot');
    };

    return (
        <div className="bg-danger-50 dark:bg-danger-900/30 border-l-4 border-danger-500 p-4 rounded-r-lg shadow-md mb-6">
            <div className="flex">
                <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-danger-500" />
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-danger-800 dark:text-danger-300">{t('high_alert')}</h3>
                        <p className="mt-1 text-sm text-danger-700 dark:text-danger-200">
                            {alert.message}
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0 flex space-x-3">
                        <button
                            onClick={handleLearnMore}
                            className="px-3 py-1.5 text-sm font-semibold text-white bg-danger-600 rounded-md hover:bg-danger-700 transition-colors"
                        >
                            {t('learn_more')}
                        </button>
                         <button
                            onClick={handleAskAI}
                            className="px-3 py-1.5 text-sm font-semibold text-danger-700 bg-danger-100 rounded-md hover:bg-danger-200 dark:bg-danger-900/50 dark:text-danger-200 dark:hover:bg-danger-900"
                        >
                            {t('ask_ai_assistant')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);


export default OutbreakAlert;
