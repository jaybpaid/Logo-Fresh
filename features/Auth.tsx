import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin && password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate. Please try again.");
    }
    setLoading(false);
  };
  
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-dark p-4">
      <div className="w-full max-w-md bg-[#101122] rounded-3xl border border-white/10 p-8 shadow-[0_0_100px_rgba(138,63,252,0.2)]">
        <h1 className="text-white tracking-light text-3xl font-bold leading-tight text-center pb-8">
          {isLogin ? 'Welcome Back' : 'Create Your Account'}
        </h1>
        
        {error && <p className="bg-red-500/20 text-red-300 text-sm p-3 rounded-lg mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
          <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
          {!isLogin && <input type="password" placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />}
          
          <button type="submit" disabled={loading} className="w-full h-14 bg-primary text-white font-bold rounded-xl text-lg hover:bg-primary/90 transition-all shadow-glow-primary disabled:opacity-50">
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px flex-1 bg-white/10"></div>
          <p className="text-gray-400 text-sm">or</p>
          <div className="h-px flex-1 bg-white/10"></div>
        </div>

        <button onClick={handleGoogleSignIn} disabled={loading} className="w-full h-14 flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors disabled:opacity-50">
           <img src="https://lh3.googleusercontent.com/a/ACg8ocJ-SMD6_YAhRxdQ4ucmVeFx-SZCkvJIz2RmoPBdng0Wm5oFn6V4mQ2bXjyTfrVVDSlsGK4_HbJk0F7nq9MF2Br1szdSwB8_wt4CRuRMVbAmvrx4mrljbX9qbXHAI_1zbE1IBLbaC5Iybe09kANi3ieAroH0fAVYrP2UlB9ypo0MJ-QS7fh0pSnv6jGHspSrb8byKSER8RrfC7Y70CNr3RmuVc11SxQN78_q36ujbnZRhyZKME0zGURz7mBG9y3PZIw6tKK70TCFZiGN" alt="Google" className="w-5 h-5"/>
           Sign In with Google
        </button>
        
        <p className="text-center text-sm text-gray-400 mt-8">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-primary hover:underline ml-2">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};
