
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onComplete: (profile: UserProfile) => void;
  onLogout?: () => void;
  existingProfile?: UserProfile;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onComplete, onLogout, existingProfile }) => {
  const [step, setStep] = useState(existingProfile?.isRegistered ? 'login' : 'register_step1');
  const [username, setUsername] = useState(existingProfile?.username || '@');
  const [password, setPassword] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [name, setName] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [loginError, setLoginError] = useState(false);

  const handleUsernameChange = (val: string) => {
    let sanitized = val.toLowerCase();
    if (!sanitized.startsWith('@')) sanitized = '@' + sanitized.replace(/@/g, '');
    const isValidFormat = /^@[a-z0-9_]{3,20}$/.test(sanitized);
    setUsernameError(isValidFormat || sanitized === '@' ? '' : 'Mínimo 3 caracteres (letras, números ou _)');
    setUsername(sanitized);
  };

  const handleRegisterNext = () => {
    if (step === 'register_step1' && !usernameError && username !== '@' && password.length >= 4) {
      setStep('register_step2');
    } else if (step === 'register_step2' && name.trim()) {
      onComplete({
        name,
        username,
        password,
        avatar: `https://picsum.photos/seed/${username}/200`,
        bio: 'Usando o PopChat!',
        isRegistered: true
      });
    }
  };

  const handleLogin = () => {
    if (existingProfile && loginPassword === existingProfile.password) {
      onComplete(existingProfile);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 500);
      setLoginPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-zinc-950 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--p)] rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-zinc-800 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm bg-zinc-900/40 backdrop-blur-3xl border border-zinc-800 rounded-[3rem] p-10 shadow-2xl flex flex-col items-center">
        <div className="mb-8">
          <ICONS.Logo size={80} className="shadow-2xl rounded-[22px] animate-bounce-slow" />
        </div>

        {step === 'login' ? (
          <div className="w-full space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full border-2 border-[var(--p)] p-1 mx-auto mb-4">
                <img src={existingProfile?.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              </div>
              <h2 className="text-2xl font-black text-white mb-1">Olá, {existingProfile?.name}</h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{existingProfile?.username}</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="Sua senha secreta" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className={`w-full bg-black/40 border ${loginError ? 'border-red-500 animate-shake' : 'border-zinc-800'} rounded-2xl px-5 py-4 text-zinc-100 outline-none focus:border-[var(--p)] transition-all text-center text-lg tracking-widest`}
                />
              </div>
              <button 
                onClick={handleLogin}
                className="w-full py-4 rounded-2xl bg-[var(--p)] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-900/20 active:scale-95 transition-all"
              >
                Entrar no PopChat
              </button>
            </div>

            <button 
              onClick={() => onLogout?.()}
              className="w-full py-2 text-zinc-600 font-bold text-[9px] uppercase tracking-widest hover:text-red-500 transition-colors"
            >
              Não é você? Trocar de conta
            </button>
          </div>
        ) : step === 'register_step1' ? (
          <div className="w-full space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white mb-2">PopChat</h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Crie sua identidade anônima</p>
            </div>

            <div className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="@usuario" 
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className={`w-full bg-black/40 border ${usernameError ? 'border-red-500/50' : 'border-zinc-800'} rounded-2xl px-5 py-4 text-zinc-100 outline-none focus:border-[var(--p)] transition-all font-mono text-sm`}
                />
                {usernameError && <p className="text-[9px] text-red-500 mt-2 ml-2 font-bold uppercase tracking-widest">{usernameError}</p>}
              </div>

              <div>
                <input 
                  type="password" 
                  placeholder="Defina uma Senha" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-5 py-4 text-zinc-100 outline-none focus:border-[var(--p)] transition-all text-sm"
                />
                <p className="text-[9px] text-zinc-600 mt-2 ml-2 font-bold uppercase tracking-widest">Use ao menos 4 dígitos</p>
              </div>
            </div>

            <button 
              onClick={handleRegisterNext}
              disabled={!!usernameError || username === '@' || password.length < 4}
              className="w-full py-4 rounded-2xl bg-[var(--p)] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-900/20 disabled:opacity-20 transition-all active:scale-95"
            >
              Continuar
            </button>
          </div>
        ) : (
          <div className="w-full space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white mb-2">Quase lá!</h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Nome que outros usuários verão</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full border-4 border-zinc-800 overflow-hidden bg-zinc-800 mb-6 shadow-2xl">
                 <img src={`https://picsum.photos/seed/${username}/200`} alt="Avatar" className="w-full h-full object-cover" />
              </div>

              <input 
                type="text" 
                placeholder="Ex: Fantasma do Pop" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="w-full bg-black/40 border border-zinc-800 rounded-2xl px-5 py-4 text-zinc-100 outline-none focus:border-[var(--p)] transition-all text-sm text-center"
              />
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleRegisterNext}
                disabled={!name.trim()}
                className="w-full py-4 rounded-2xl bg-[var(--p)] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-900/20 disabled:opacity-20 transition-all active:scale-95"
              >
                Concluir Cadastro
              </button>
              <button 
                onClick={() => setStep('register_step1')}
                className="w-full py-2 rounded-xl text-zinc-500 font-bold text-[9px] uppercase tracking-widest hover:text-white transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-12 text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] max-w-xs text-center leading-loose">
        Protocolo Anônimo Ativado • Sem Coleta de Dados • 100% Local
      </p>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default AuthScreen;
