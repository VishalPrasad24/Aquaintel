
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAppContext } from '../../context/AppContext';

interface OtpVerificationProps {
    phone: string;
    setAuthStep: (step: 'details') => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ phone, setAuthStep }) => {
    const { login } = useAppContext();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [timer, setTimer] = useState(300); // 5 minutes in seconds
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    setCanResend(true);
                    clearInterval(interval);
                    return 0;
                }
                if (prev <= 240) { // 300 - 60
                    setCanResend(true);
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        let isOtpValid = false;

        // Special handling for test credentials to bypass database check
        if (phone === '+918926413900' && otp === '123456') {
            console.log("Test user detected, bypassing OTP DB check.");
            isOtpValid = true;
        } else {
             const { data: otpData, error: otpError } = await supabase
                .from('otps')
                .select('*')
                .eq('phone', phone)
                .eq('otp_code', otp)
                .single();

            if (otpError || !otpData) {
                setError("Invalid OTP. Please try again.");
                setLoading(false);
                return;
            }

            if (new Date(otpData.expires_at) < new Date()) {
                setError("OTP has expired. Please request a new one.");
                setLoading(false);
                return;
            }
            isOtpValid = true;
        }

        if (isOtpValid) {
            // OTP is valid, now check for existing user profile
            try {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('phone', phone)
                    .single();
                
                if (profileError && profileError.code !== 'PGRST116') { // Not a "row not found" error
                    throw profileError;
                }
                
                if (profile) {
                    // Existing user, log them in
                    login(profile, 'user');
                } else {
                    // New user, proceed to details page
                    setAuthStep('details');
                }
            } catch (profileError: any) {
                 setError(`Error checking profile: ${profileError.message}`);
            }
        }
        
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white">Verify Your Number</h2>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">Enter the 6-digit code sent to {phone}</p>
             <div className="text-center font-mono text-lg text-gray-700 dark:text-gray-300">
                {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                    <label htmlFor="otp" className="sr-only">OTP</label>
                    <input type="text" id="otp" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" required className="w-full text-center tracking-[1em] text-2xl font-semibold px-3 py-2 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <button type="submit" disabled={loading || otp.length !== 6} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 dark:disabled:bg-primary-800">
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
            </form>
            {error && <p className="text-sm text-center text-danger-500">{error}</p>}
        </div>
    );
};

export default OtpVerification;