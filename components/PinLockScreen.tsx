
import React, { useState } from 'react';
import { ICONS } from '../constants';

interface PinLockScreenProps {
  correctPin: string;
  onUnlock: () => void;
  useCalculator?: boolean;
}

const PinLockScreen: React.FC<PinLockScreenProps> = ({ correctPin, onUnlock, useCalculator }) => {
  const [pin, setPin] = useState('');
  const [display, setDisplay] = useState('0');
  const [error, setError] = useState(false);

  const handleCalcInput = (btn: string) => {
    if (btn === 'AC') {
      setDisplay('0');
      setPin('');
      return;
    }

    if (btn === '=') {
      try {
        // Realiza cálculo real
        const cleanExpr = display.replace(/×/g, '*').replace(/÷/g, '/');
        const result = eval(cleanExpr);
        setDisplay(String(result));
        setPin(''); // Reseta o PIN invisível ao calcular para evitar desbloqueios acidentais
      } catch (e) {
        setDisplay('Erro');
      }
      return;
    }

    if (!isNaN(Number(btn))) {
      const newPin = pin + btn;
      setPin(newPin);
      setDisplay(display === '0' ? btn : display + btn);

      // Desbloqueio silencioso: Se o PIN correto for digitado em qualquer parte da sequência
      if (newPin.includes(correctPin)) {
        onUnlock();
      }
      return;
    }

    // Operadores
    if (['+', '-', '×', '÷', '.'].includes(btn)) {
      setDisplay(display + btn);
    }
  };

  const handlePinInput = (num: number) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === correctPin) {
          setTimeout(onUnlock, 150);
        } else {
          setError(true);
          setTimeout(() => { setError(false); setPin(''); }, 600);
        }
      }
    }
  };

  if (useCalculator) {
    return (
      <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[340px] bg-black rounded-[3rem] p-4 flex flex-col">
          {/* Display da Calculadora */}
          <div className="flex-1 flex flex-col items-end justify-end px-6 py-10">
            <span className="text-zinc-500 text-sm font-mono mb-2">PopCalc v2.4</span>
            <span className="text-6xl font-light text-white tracking-tighter truncate w-full text-right">{display}</span>
          </div>
          
          {/* Teclado Estilo iOS */}
          <div className="grid grid-cols-4 gap-3">
            {['AC', '+/-', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', ',', '=', ''].map((btn, i) => {
              if (btn === '') return <div key={i} />;
              
              const isOperator = ['÷', '×', '-', '+', '='].includes(btn);
              const isSpecial = ['AC', '+/-', '%'].includes(btn);
              const isZero = btn === '0';

              return (
                <button
                  key={i}
                  onClick={() => handleCalcInput(btn)}
                  className={`flex items-center justify-center text-2xl font-medium transition-all active:opacity-50 ${isZero ? 'col-span-2 rounded-[30px] aspect-auto h-[72px]' : 'rounded-full aspect-square'} ${
                    isOperator ? 'bg-orange-500 text-white' : isSpecial ? 'bg-zinc-300 text-black' : 'bg-zinc-800 text-white'
                  }`}
                >
                  {btn}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] bg-zinc-950 flex flex-col items-center justify-center p-8 overflow-hidden animate-in fade-in duration-500">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--p)] rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        <div className="mb-12 shadow-2xl rounded-[30px]"><ICONS.Logo size={100} /></div>
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Segurança Ativa</h2>
        
        <div className={`flex space-x-6 mb-16 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${pin.length > i ? 'bg-[var(--p)] scale-125 shadow-[0_0_15px_var(--p)]' : 'bg-zinc-800'}`}></div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '←'].map((btn, idx) => (
            btn === '' ? <div key={idx} /> : (
              <button
                key={idx}
                onClick={() => typeof btn === 'number' ? handlePinInput(btn) : setPin(pin.slice(0, -1))}
                className="w-full aspect-square rounded-full flex items-center justify-center text-2xl font-bold text-zinc-100 bg-white/5 border border-white/5 hover:bg-white/10 active:scale-90 transition-all"
              >
                {btn}
              </button>
            )
          ))}
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default PinLockScreen;
