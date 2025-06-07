
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { User } from '../types';

interface AuthPageProps {
  onLoginSuccess: (user: Omit<User, 'password'>) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 mx-auto text-primary mb-3">
                <path d="M12.75 12.75L9 15l-1.96-1.048a1.572 1.572 0 00-2.348 1.132 1.503 1.503 0 00.959 1.488c1.354.542 2.996.542 4.35 0A1.503 1.503 0 0011.5 15.084a1.572 1.572 0 00-2.348-1.132L7.25 12.75" />
                <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zM6 7.5h12v1.5H6V7.5zM6.31 9.47a.75.75 0 011.054.162l1.685 2.105a.75.75 0 010 .766l-1.685 2.105a.75.75 0 11-1.216-.878l.84-.944H6.75a.75.75 0 010-1.5h.238l-.84-.944a.75.75 0 01.162-1.054zm8.38 0a.75.75 0 00-1.054.162l-1.685 2.105a.75.75 0 000 .766l1.685 2.105a.75.75 0 101.216-.878l-.84-.944h2.825a.75.75 0 000-1.5H15.1l.84-.944a.75.75 0 00-.162-1.054z" clipRule="evenodd" />
            </svg>
            <h2 className="text-3xl font-bold text-gray-800">Selamat Datang!</h2>
            <p className="text-gray-500 mt-1">Silakan masuk atau daftar untuk melanjutkan.</p>
        </div>

        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setShowLogin(true)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors duration-150 focus:outline-none ${
                showLogin ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors duration-150 focus:outline-none ${
                !showLogin ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {showLogin ? (
          <LoginForm onLoginSuccess={onLoginSuccess} />
        ) : (
          <RegisterForm onRegisterSuccess={() => setShowLogin(true)} />
        )}
      </div>
       <p className="mt-8 text-xs text-gray-400">
            Anda dapat menggunakan akun demo: <br/> Email: <strong>demo@example.com</strong> | Password: <strong>password123</strong>
        </p>
    </div>
  );
};

export default AuthPage;
