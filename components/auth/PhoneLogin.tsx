
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

interface PhoneLoginProps {
    setPhone: (phone: string) => void;
    setAuthStep: (step: 'otp') => void;
}

const PhoneLogin: React.FC<PhoneLoginProps> = ({ setPhone, setAuthStep }) => {
    const [localPhone, setLocalPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Special handling for the test number to bypass database insert
        if (localPhone === '8926413900') {
            alert("Test Mode: Your OTP is: 123456");
            setPhone(`+91${localPhone}`);
            setAuthStep('otp');
            return; 
        }

        setLoading(true);
        const phoneNumber = `+91${localPhone}`;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        // For demo/testing, show the OTP to the user for other numbers
        alert(`Your OTP is: ${otp}`);

        const { error: dbError } = await supabase.from('otps').insert({
            phone: phoneNumber,
            otp_code: otp,
            expires_at: expiresAt,
        });

        if (dbError) {
            setError(dbError.message);
        } else {
            setPhone(phoneNumber);
            setAuthStep('otp');
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white">Sign In with Phone</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enter your 10-digit mobile number
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                            +91
                        </span>
                        <input
                            type="tel" id="phone" value={localPhone}
                            onChange={(e) => setLocalPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="9876543210" required
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>
                <button
                    type="submit" disabled={loading || localPhone.length !== 10}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 dark:disabled:bg-primary-800"
                >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
            </form>
            {error && <p className="text-sm text-center text-danger-500">{error}</p>}
        </div>
    );
};

export default PhoneLogin;
