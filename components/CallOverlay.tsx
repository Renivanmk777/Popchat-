
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Chat } from '../types';
import { ICONS } from '../constants';

interface CallOverlayProps {
  chat: Chat;
  callType: 'audio' | 'video';
  direction: 'incoming' | 'outgoing';
  onEndCall: () => void;
}

// Audio Helper Functions (Based on SDK Guidelines)
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createPCM(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const CallOverlay: React.FC<CallOverlayProps> = ({ chat, callType, direction, onEndCall }) => {
  const [callState, setCallState] = useState<'ringing' | 'connecting' | 'active'>('ringing');
  const [status, setStatus] = useState(direction === 'incoming' ? 'Chamada Recebida' : 'Chamando...');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [callTime, setCallTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const sessionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  let nextStartTime = 0;

  useEffect(() => {
    if (direction === 'outgoing') {
      const ringTimer = setTimeout(() => {
        handleAccept();
      }, 3000);
      return () => clearTimeout(ringTimer);
    }
  }, [direction]);

  useEffect(() => {
    if (callState === 'active') {
      timerRef.current = setInterval(() => setCallTime(prev => prev + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  useEffect(() => {
    return () => stopAll();
  }, []);

  const stopAll = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (audioContextRef.current) {
      audioContextRef.current.input.close();
      audioContextRef.current.output.close();
    }
    if (frameIntervalRef.current) window.clearInterval(frameIntervalRef.current);
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch(e) {}
    }
  };

  const handleAccept = async () => {
    setCallState('connecting');
    setStatus('Conectando...');
    
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const ai = new GoogleGenAI({ apiKey });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = { input: inputCtx, output: outputCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: callType === 'video' 
      });

      if (callType === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `Você é ${chat.name} (${chat.username}). Personalidade: ${chat.personality}. Agora você está em uma chamada de ${callType} com o usuário. Aja exatamente como esta pessoa, seja breve, cordial e informal como se estivesse realmente ao telefone.`
        },
        callbacks: {
          onopen: () => {
            setCallState('active');
            setStatus('Em Chamada');
            
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm = createPCM(inputData);
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcm }));
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);

            if (callType === 'video') {
              frameIntervalRef.current = window.setInterval(() => {
                if (isVideoOff || !videoRef.current || !canvasRef.current) return;
                const canvas = canvasRef.current;
                const video = videoRef.current;
                canvas.width = video.videoWidth / 4;
                canvas.height = video.videoHeight / 4;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  canvas.toBlob(blob => {
                    if (blob) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } }));
                      };
                      reader.readAsDataURL(blob);
                    }
                  }, 'image/jpeg', 0.5);
                }
              }, 1000);
            }
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const ctx = audioContextRef.current.output;
              nextStartTime = Math.max(nextStartTime, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.onended = () => sourcesRef.current.delete(source);
              source.start(nextStartTime);
              nextStartTime += buffer.duration;
              sourcesRef.current.add(source);
            }
            if (msg.serverContent?.interrupted) {
              for (const s of sourcesRef.current) { try { s.stop(); } catch(e) {} }
              sourcesRef.current.clear();
              nextStartTime = 0;
            }
          },
          onerror: (e) => {
            console.error(e);
            setStatus('Erro na conexão');
          },
          onclose: () => onEndCall()
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Acesso Negado');
      setTimeout(onEndCall, 2000);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[250] bg-zinc-950 flex flex-col items-center justify-between overflow-hidden animate-in fade-in duration-500">
      {/* Dynamic Background Blur */}
      <div className="absolute inset-0 z-0">
        <img src={chat.avatar} className="w-full h-full object-cover blur-[80px] opacity-30 scale-125" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center mt-20 space-y-6">
        <div className="relative">
          <div className={`absolute inset-0 bg-[var(--p)] rounded-full animate-ping opacity-20 scale-[2] ${callState === 'active' ? 'hidden' : ''}`}></div>
          <img 
            src={chat.avatar} 
            className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/10 shadow-2xl relative z-10 transition-all duration-700 ${isVideoOff ? 'scale-100' : 'scale-0 opacity-0'}`} 
            alt={chat.name} 
          />
          
          {callType === 'video' && (
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 z-20 transition-all duration-700 ${isVideoOff ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
               <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-48 h-64 md:w-64 md:h-80 object-cover rounded-[2.5rem] border-2 border-white/20 shadow-2xl bg-zinc-900" 
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white tracking-tight">{chat.name}</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-[10px]">{status}</p>
          {callState === 'active' && (
            <p className="text-[var(--p)] font-mono text-xl font-bold mt-4 animate-pulse">{formatTime(callTime)}</p>
          )}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md px-12 mb-20">
        {callState === 'ringing' && direction === 'incoming' ? (
          <div className="flex items-center justify-between animate-in slide-in-from-bottom-12 duration-500">
            <button 
              onClick={onEndCall}
              className="flex flex-col items-center space-y-3 group"
            >
              <div className="p-6 rounded-full bg-red-600 text-white shadow-xl group-active:scale-90 transition-all">
                <svg className="w-8 h-8 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Recusar</span>
            </button>

            <button 
              onClick={handleAccept}
              className="flex flex-col items-center space-y-3 group"
            >
              <div className="p-6 rounded-full bg-green-500 text-white shadow-xl animate-bounce group-active:scale-90 transition-all">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Atender</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-6 md:space-x-12">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-5 rounded-full transition-all border border-white/5 active:scale-90 ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'}`}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMuted ? "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z M3 3l18 18" : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"} />
              </svg>
            </button>

            <button 
              onClick={onEndCall}
              className="p-6 rounded-full bg-red-600 text-white shadow-2xl transition-all hover:bg-red-700 active:scale-95 transform"
            >
              <svg className="w-10 h-10 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </button>

            {callType === 'video' && (
              <button 
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-5 rounded-full transition-all border border-white/5 active:scale-90 ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'}`}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isVideoOff ? "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14 M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z M3 3l18 18" : "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14 M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"} />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CallOverlay;
