
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { STUDY_MODULES } from '../../constants';
import { StudyModule } from '../../types';

const COMPLETED_MODULES_KEY = 'completedStudyModules';

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ModuleCard: React.FC<{ module: StudyModule, onSelect: () => void, isCompleted: boolean }> = ({ module, onSelect, isCompleted }) => (
    <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
        onClick={onSelect}
    >
        <div className="relative">
            <img className={`h-40 w-full object-cover transition-all duration-300 group-hover:scale-105 ${isCompleted ? 'grayscale' : ''}`} src={module.imageUrl} alt={module.title} />
            {isCompleted && (
                 <div className="absolute top-3 right-3 bg-success-500 text-white rounded-full p-1 shadow-lg z-10">
                    <CheckIcon className="w-4 h-4" />
                </div>
            )}
        </div>
        <div className="p-4">
            <h3 className={`text-lg font-semibold ${isCompleted ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-primary-600 dark:text-primary-400'}`}>{module.title}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{module.summary}</p>
        </div>
    </div>
);

const ModuleDetail: React.FC<{ module: StudyModule, onClose: () => void, isCompleted: boolean, onToggleCompletion: (id: string) => void }> = ({ module, onClose, isCompleted, onToggleCompletion }) => {
    const { t, sendNotification, notificationPermission } = useAppContext();
    const [reminderSet, setReminderSet] = useState(false);

    const handleRemindMe = () => {
        if (notificationPermission !== 'granted') {
            alert("Please enable notifications from your profile to use reminders.");
            return;
        }
        setReminderSet(true);
        setTimeout(() => {
            sendNotification(
                `Study Reminder: ${module.title}`,
                {
                    body: `Don't forget to review the module on ${module.title}. Stay informed!`,
                    tag: `study-reminder-${module.id}`
                }
            );
            setTimeout(() => setReminderSet(false), 2000);
        }, 10000); // 10 second delay for demo
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl transform transition-all duration-300 scale-100" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400">{module.title}</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">{module.summary}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">{t('symptoms')}</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                            {module.symptoms.map(symptom => <li key={symptom}>{symptom}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">{t('prevention')}</h4>
                         <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                            {module.prevention.map(tip => <li key={tip}>{tip}</li>)}
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                    <button
                        onClick={() => onToggleCompletion(module.id)}
                        className={`w-full flex items-center justify-center py-2 px-4 rounded-lg font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                            isCompleted 
                            ? 'bg-success-100 text-success-700 hover:bg-success-200 dark:bg-success-900/50 dark:text-success-300 dark:hover:bg-success-900' 
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                    >
                        {isCompleted ? (
                            <>
                                <CheckCircleIcon className="w-5 h-5 mr-2" />
                                <span>Mark as Incomplete</span>
                            </>
                        ) : (
                            <span>Mark as Complete</span>
                        )}
                    </button>
                     <button
                        onClick={handleRemindMe}
                        disabled={reminderSet}
                        className="w-full flex items-center justify-center py-2 px-4 rounded-lg font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-wait"
                    >
                        {reminderSet ? t('reminder_set') : t('remind_me')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const StudyModules: React.FC = () => {
    const { t, initialStudyModule, setInitialStudyModule } = useAppContext();
    const [selectedModule, setSelectedModule] = useState<StudyModule | null>(null);
    const [completedModules, setCompletedModules] = useState<Set<string>>(() => {
        try {
            const stored = localStorage.getItem(COMPLETED_MODULES_KEY);
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch (error) {
            console.error("Failed to parse completed modules from localStorage", error);
            return new Set();
        }
    });

    useEffect(() => {
        if (initialStudyModule) {
            const moduleToOpen = STUDY_MODULES.find(m => m.id === initialStudyModule);
            if (moduleToOpen) {
                setSelectedModule(moduleToOpen);
            }
            // Clear the initial module so it doesn't re-open on navigation
            setInitialStudyModule(null);
        }
    }, [initialStudyModule, setInitialStudyModule]);

    const toggleCompletion = (moduleId: string) => {
        setCompletedModules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(moduleId)) {
                newSet.delete(moduleId);
            } else {
                newSet.add(moduleId);
            }
            localStorage.setItem(COMPLETED_MODULES_KEY, JSON.stringify(Array.from(newSet)));
            return newSet;
        });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('study_modules')}: {t('water_borne_diseases')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {STUDY_MODULES.map(module => (
                    <ModuleCard 
                        key={module.id} 
                        module={module} 
                        onSelect={() => setSelectedModule(module)} 
                        isCompleted={completedModules.has(module.id)}
                    />
                ))}
            </div>
            {selectedModule && 
                <ModuleDetail 
                    module={selectedModule} 
                    onClose={() => setSelectedModule(null)}
                    isCompleted={completedModules.has(selectedModule.id)}
                    onToggleCompletion={toggleCompletion}
                />}
        </div>
    );
};

export default StudyModules;
