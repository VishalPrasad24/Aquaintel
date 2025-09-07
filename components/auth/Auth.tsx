import React, { useState } from 'react';
import PhoneLogin from './PhoneLogin';
import OtpVerification from './OtpVerification';
import UserDetails from './UserDetails';
import { UserRole } from '../../App';

type AuthStep = 'phone' | 'otp' | 'details';

const Auth: React.FC = () => {
    const [authStep, setAuthStep] = useState<AuthStep>('phone');
    const [phone, setPhone] = useState('');

    const renderStep = () => {
        switch (authStep) {
            case 'phone':
                return <PhoneLogin setPhone={setPhone} setAuthStep={setAuthStep} />;
            case 'otp':
                return <OtpVerification phone={phone} setAuthStep={setAuthStep} />;
            case 'details':
                return <UserDetails phone={phone} />;
            default:
                return <PhoneLogin setPhone={setPhone} setAuthStep={setAuthStep} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
             <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">Welcome to Arogya Sahayak</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Your Community Health Monitoring System</p>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-8">
                     {renderStep()}
                </div>
            </div>
        </div>
    );
};

export default Auth;