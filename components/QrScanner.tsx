
import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'https://esm.sh/jsqr@1.4.0';

interface QrScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<number>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true"); // required to tell iOS safari we don't want fullscreen
          videoRef.current.play();
          requestRef.current = requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error(err);
        setError("Não foi possível acessar a câmera. Verifique as permissões.");
      }
    };

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            onScan(code.data);
            return; // Stop scanning after first success
          }
        }
      }
      requestRef.current = requestAnimationFrame(tick);
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6">
      <div className="relative w-full max-w-md aspect-square bg-zinc-900 rounded-[2rem] overflow-hidden border-2 border-zinc-800 shadow-2xl">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
            <p className="text-red-500 font-bold">{error}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanner Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-red-600 rounded-3xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white -mt-1 -ml-1 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white -mt-1 -mr-1 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white -mb-1 -ml-1 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white -mb-1 -mr-1 rounded-br-lg"></div>
                
                {/* Scanning line animation */}
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600/50 shadow-[0_0_15px_rgba(220,38,38,0.8)] animate-[scan_2s_infinite]"></div>
              </div>
            </div>
            
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <p className="text-white text-xs font-bold uppercase tracking-widest bg-black/40 backdrop-blur-md inline-block px-4 py-2 rounded-full border border-white/10">
                Posicione o QR Code no centro
              </p>
            </div>
          </>
        )}
      </div>

      <button 
        onClick={onClose}
        className="mt-12 bg-zinc-800 text-white px-8 py-4 rounded-2xl font-bold hover:bg-zinc-700 transition-all active:scale-95"
      >
        Cancelar
      </button>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
};

export default QrScanner;
