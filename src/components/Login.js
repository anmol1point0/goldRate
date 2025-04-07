import React, { useState } from 'react';
import { auth } from '../firebase';
import GoldRates from './GoldRates';

const Login = () => {
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await auth.signInWithGoogle();
      setUser(result.user);
      console.log('Successfully logged in:', result.user);
    } catch (error) {
      setError(error.message);
      console.error('Error logging in:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Background patterns for visual interest
  const BackgroundPattern = () => (
    <>
      <div className="absolute inset-0 bg-[#0A192F] opacity-95">
        <div className="absolute inset-0 bg-gradient-to-b from-[#112240]/50 to-transparent"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(#234 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          opacity: '0.15'
        }}></div>
      </div>
    </>
  );

  if (user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#0A192F] p-4">
        <BackgroundPattern />
        <div className="relative max-w-4xl w-full bg-[#112240] rounded-2xl p-8 shadow-xl space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between pb-6 border-b border-blue-300/10">
            <div className="flex items-center space-x-4">
              <img
                className="h-12 w-12 rounded-full ring-2 ring-blue-400/30"
                src={user.photoURL}
                alt={user.displayName}
              />
              <div>
                <h2 className="text-xl font-semibold text-blue-100">
                  Welcome, {user.displayName}
                </h2>
                <p className="text-sm text-blue-300/70">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-blue-100 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>

          {/* Gold Rates Section */}
          <div className="mt-6">
            <GoldRates user={user} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0A192F] p-4">
      <BackgroundPattern />
      <div className="relative max-w-md w-full bg-[#112240] rounded-2xl p-8 shadow-xl space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-block">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-blue-100">
            Gold Rate Analytics
          </h2>
          <p className="text-blue-300/70 text-sm">
            Track real-time gold rates across India
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-500/5 rounded-lg p-4">
            <ul className="space-y-2 text-sm text-blue-200/80">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Live rates for 22K & 24K gold
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Location-based pricing
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Real-time price updates
              </li>
            </ul>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
                Continue with Google
              </span>
            )}
          </button>

          {error && (
            <div className="relative mt-4">
              <div className="p-4 text-center rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login; 