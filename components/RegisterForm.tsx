
import React, { useState } from 'react';
import { apiService } from '../apiService';

interface RegisterFormProps {
  onRegisterSuccess: () => void; // Callback to e.g., switch to login view
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      await apiService.registerUser({ username, email, password });
      setSuccessMessage('Registrasi berhasil! Silakan login.');
      // Clear form or call onRegisterSuccess after a delay to show message
      setTimeout(() => {
        onRegisterSuccess();
         // Optionally clear form fields
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrasi gagal. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseClass = "mt-1 block w-full px-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:bg-gray-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>}
      {successMessage && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">{successMessage}</div>}
      
      <div>
        <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input
          type="text"
          id="register-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputBaseClass}
          required
          autoComplete="username"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          id="register-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputBaseClass}
          required
          autoComplete="email"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          id="register-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputBaseClass}
          required
          autoComplete="new-password"
          minLength={6}
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
        <input
          type="password"
          id="confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputBaseClass}
          required
          autoComplete="new-password"
          minLength={6}
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !!successMessage} // Disable if already successful and showing message
        className="w-full flex justify-center items-center px-6 py-3 text-base font-semibold text-white bg-secondary hover:bg-secondary-dark border border-transparent rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-secondary transition-all disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Memproses...
          </>
        ) : 'Register'}
      </button>
    </form>
  );
};

export default RegisterForm;
