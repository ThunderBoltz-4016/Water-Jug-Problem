import React, { useState, useEffect, useRef } from 'react';

interface JugProps {
  name: string;
  capacity: number;
  current: number;
  color?: string;
  isActive?: boolean;
}

export const Jug: React.FC<JugProps> = ({ name, capacity, current, color = "bg-blue-500", isActive }) => {
  // Calculate fill percentage
  const percentage = Math.min(100, Math.max(0, (current / capacity) * 100));
  
  // Ripple effect state
  const [rippleKey, setRippleKey] = useState(0);
  const isFirstRender = useRef(true);

  // Trigger ripple animation when water level changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Increment key to restart CSS animation
    setRippleKey(prev => prev + 1);
  }, [current]);

  return (
    <div className={`flex flex-col items-center gap-3 transition-transform duration-300 ${isActive ? 'scale-105' : 'scale-100 opacity-90'}`}>
      <div className="relative w-36 h-56 border-4 border-slate-200 bg-white/50 rounded-b-3xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 backdrop-blur-sm z-0">
        
        {/* Glass Highlights */}
        <div className="absolute top-0 right-3 w-8 h-full bg-gradient-to-l from-white/40 to-transparent skew-x-[-12deg] z-20 pointer-events-none"></div>
        <div className="absolute top-0 left-3 w-2 h-full bg-gradient-to-r from-white/30 to-transparent skew-x-[-12deg] z-20 pointer-events-none"></div>

        {/* Measurement lines */}
        <div className="absolute inset-0 z-10 pointer-events-none">
             {Array.from({ length: capacity }).map((_, i) => (
                <div 
                    key={i} 
                    className="absolute w-full border-t border-slate-300 flex items-end justify-end pr-2 opacity-50" 
                    style={{ bottom: `${((i + 1) / capacity) * 100}%` }}
                >
                    <span className="text-[10px] text-slate-500 mb-[1px] font-mono">{i + 1}L</span>
                </div>
             ))}
        </div>
        
        {/* Water Container */}
        <div 
            className={`absolute bottom-0 w-full transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${color}`}
            style={{ height: `${percentage}%` }}
        >
            {/* Ripple Effect (Conditional) */}
            {rippleKey > 0 && (
                <div 
                    key={rippleKey}
                    className="absolute top-0 left-1/2 -ml-12 -mt-12 w-24 h-24 bg-white/50 rounded-full animate-ripple z-20 pointer-events-none"
                ></div>
            )}

            {/* Wave Effect Surface */}
            <div className="absolute -top-3 left-0 w-[200%] h-6 z-0 opacity-60">
                <div className="absolute w-full h-full bg-white/30 rounded-[40%] animate-wave-back"></div>
            </div>
            <div className="absolute -top-3 left-[-50%] w-[200%] h-6 z-10 opacity-80">
                <div className="absolute w-full h-full bg-white/40 rounded-[35%] animate-wave-front"></div>
            </div>

            {/* Inner Body Gradient */}
            <div className="relative w-full h-full bg-gradient-to-b from-white/10 to-transparent z-0"></div>
        </div>

        {/* Water Level Text */}
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <span 
              className={`text-4xl font-bold transition-all duration-500 ${
                current > 0 ? 'text-white drop-shadow-md scale-100' : 'text-slate-200 scale-90'
              }`}
            >
                {current}
                <span className="text-lg ml-0.5 opacity-90">L</span>
            </span>
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="font-bold text-lg text-slate-700">{name}</h3>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Capacity: {capacity}L</p>
      </div>
    </div>
  );
};