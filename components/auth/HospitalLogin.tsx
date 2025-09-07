import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAppContext } from '../../context/AppContext';
import { HospitalProfile } from '../../types';

const HospitalLogin: React.FC = () => {
    const { login, t } = useAppContext();
    const [hospitalId, setHospitalId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { data, error: dbError } = await supabase
            .from('hospitals')
            .select('*')
            .eq('unique_id', hospitalId)
            .single();

        if (dbError || !data) {
            setError('Invalid Hospital ID. Please check and try again.');
        } else {
            login(data as HospitalProfile, 'hospital');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
             <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">{t('hospital_login')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Access your institution's dashboard</p>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-8">
                     <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="hospitalId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('hospital_id')}
                            </label>
                            <input
                                type="text"
                                id="hospitalId"
                                value={hospitalId}
                                onChange={(e) => setHospitalId(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                placeholder="12345678"
                                required
                                className="mt-1 w-full text-center tracking-[0.5em] text-xl font-semibold px-3 py-2 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || hospitalId.length !== 8}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 dark:disabled:bg-primary-800"
                        >
                            {loading ? 'Verifying...' : t('login')}
                        </button>
                    </form>
                    {error && <p className="mt-4 text-sm text-center text-danger-500">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default HospitalLogin;