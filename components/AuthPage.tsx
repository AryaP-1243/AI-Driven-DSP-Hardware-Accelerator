import React, { useState } from 'react';
import { User } from '../types';
import { ProcessorIcon } from './icons/ProcessorIcon';

interface AuthPageProps {
  onLogin: (username: string) => void;
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBack }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const getUsers = (): User[] => {
    const usersJson = localStorage.getItem('dsp-users');
    return usersJson ? JSON.parse(usersJson) : [];
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem('dsp-users', JSON.stringify(users));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError('Username and password cannot be empty.');
      return;
    }
    const users = getUsers();
    if (users.find(u => u.username === username)) {
      setError('Username already exists. Please choose another one.');
      return;
    }
    const newUser: User = { username, password };
    saveUsers([...users, newUser]);
    onLogin(username);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const users = getUsers();
    const user = users.find(u => u.username === username);
    if (user && user.password === password) {
      onLogin(username);
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center mb-6">
          <ProcessorIcon className="w-10 h-10 text-primary mr-3" />
          <h1 className="text-2xl font-bold text-text-main tracking-wide">
            DSP Hardware Accelerator
          </h1>
        </div>
        <div className="bg-bg-panel rounded-lg shadow-xl p-8 border border-border-main">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center text-text-main">{isLoginView ? 'Login' : 'Register'}</h2>
            <p className="text-center text-text-secondary text-sm mt-2">
              {isLoginView ? "Welcome back!" : "Create an account to get started."}
            </p>
          </div>
          
          <form onSubmit={isLoginView ? handleLogin : handleRegister}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-bg-main border border-border-main rounded-md text-text-main placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-bg-main border border-border-main rounded-md text-text-main placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}

            <div className="mt-8">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-primary-text font-bold rounded-lg shadow-md transition-all duration-200"
              >
                {isLoginView ? 'Login' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="text-sm text-primary hover:text-primary-hover transition-colors">
              {isLoginView ? 'Need an account? Register' : 'Already have an account? Login'}
            </button>
          </div>
        </div>
        <div className="text-center mt-4">
            <button onClick={onBack} className="text-sm text-text-secondary hover:text-text-main transition-colors">
              &larr; Back to Home
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;