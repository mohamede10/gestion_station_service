"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStation } from '@/context/StationContext';
import { ShieldCheck, Eye, EyeOff, LogIn, Fuel, AlertCircle, Sparkles, Building2, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, currentUser, allUsers } = useStation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If already logged in, redirect to dashboard
    if (currentUser) {
      router.replace('/');
    }
  }, [currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 600)); // Simulate auth delay

    const success = login(email, password);
    if (success) {
      router.push('/');
    } else {
      setError('Email ou mot de passe incorrect. Vérifiez vos identifiants.');
    }
    setLoading(false);
  };

  const handleQuickLogin = (userEmail: string) => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      login(userEmail, 'admin');
      router.push('/');
    }, 400);
  };

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'from-amber-500 to-orange-600',
    GERANT: 'from-blue-500 to-indigo-600',
    CHEF_PISTE: 'from-emerald-500 to-teal-600',
    CAISSIER: 'from-purple-500 to-violet-600',
  };

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    GERANT: 'Gérant Station',
    CHEF_PISTE: ' Chef de Piste',
    CAISSIER: ' Caissier(ère)',
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-700/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-red-900/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-orange-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Left Panel – Station Image */}
      <div className="hidden lg:flex flex-col justify-between w-[680px] shrink-0 p-0 relative z-10 border-r border-slate-800/60 overflow-hidden">
        <img 
          src="/kissosso.png" 
          alt="Station TotalEnergies Kissosso" 
          className="w-full h-full object-cover"
        />
        {/* Overlay avec texte en bas */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center p-2 rounded-2xl bg-white shadow-xl shadow-black/40">
              <img 
                src="/Logo_TotalEnergies.webp" 
                alt="TotalEnergies Logo" 
                className="h-10 w-auto object-contain" 
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Station TotalEnergies<br />
            <span className="text-red-500 text-4xl">Kissosso</span>
          </h2>
          <p className="text-slate-300 text-sm mt-2 opacity-80">
            Application de gestion intégrée
          </p>
        </div>
      </div>

      {/* Right Panel – Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">

          {/* Top Logo & Title */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="inline-flex items-center justify-center p-2.5 px-3.5 rounded-2xl bg-white shadow-xl shadow-black/30 border border-slate-700/40 mb-4">
              <img 
                src="/Logo_TotalEnergies.webp" 
                alt="TotalEnergies Logo" 
                className="h-20 w-auto object-contain" 
              />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-1">Connexion</h1>
            <p className="text-slate-400 text-sm">Entrez vos identifiants pour accéder à votre espace.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Adresse Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="votre.email@totalenergies.gn"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Mot de Passe
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-black" /> : <Eye className="w-4 h-4 text-black" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg shadow-red-900/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Se Connecter
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}