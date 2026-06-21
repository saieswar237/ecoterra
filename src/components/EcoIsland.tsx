// PATH: src/components/EcoIsland.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { IslandState } from '../types';
import { Volume2, VolumeX } from 'lucide-react';
import { ecoAudio } from '../utils/audio';

/**
 * Properties expected by the EcoIsland Component.
 */
interface EcoIslandProps {
  ecoScore: number;
}

/**
 * EcoIsland Component
 * Renders an immersive, procedurally stylized 2D island ecosystem using high fidelity inline SVGs.
 * Adapts between dynamic biological landscapes (Thriving Oasis, Overcast Autumn, Toxic Wasteland)
 * matching the current user-authored carbon score.
 * Explores procedurally generated sounds matching the ecological ambient state.
 *
 * @param {EcoIslandProps} props - Properties containing the validated score input.
 * @returns {React.ReactElement} Active visual island representation with dynamic web-audio capabilities.
 */
export const EcoIsland: React.FC<EcoIslandProps> = React.memo(({ ecoScore }) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Determine state based on score:
  // State 1 (Score > 70): optimal
  // State 2 (Score 30-70): moderate
  // State 3 (Score < 30): degraded
  const state: IslandState = useMemo(() => {
    if (ecoScore > 70) return 'optimal';
    if (ecoScore >= 30) return 'moderate';
    return 'degraded';
  }, [ecoScore]);

  // Keep ambient audio engine synchronized with ecosystem changes live
  useEffect(() => {
    ecoAudio.updateState(state);
  }, [state]);

  // Ensure sound is cleaned up/muted if the user navigates away or component unmounts
  useEffect(() => {
    return () => {
      ecoAudio.setMute(true);
    };
  }, []);

  const handleToggleAudio = () => {
    const nextPlayState = !isAudioPlaying;
    setIsAudioPlaying(nextPlayState);
    ecoAudio.setMute(!nextPlayState);
  };

  // Accessibility Mandate: Construct description for screen readers
  const { ariaLabel, descriptionText } = useMemo(() => {
    let label = '';
    let desc = '';
    if (state === 'optimal') {
      label = `Lush Green Eco Island (Score: ${ecoScore}/100)`;
      desc = `The digital ecosystem is thriving beautifully. The sky is bright blue and sunny, clouds are fluffy and white, water is clear and sparkling cyan, and several mature, lush green trees are covered in rich foliage. Active clean energy windmills are spinning quickly, and birds are soaring in the sky.`;
    } else if (state === 'moderate') {
      label = `Overcast Autumn Island (Score: ${ecoScore}/100)`;
      desc = `The digital ecosystem is showing signs of moderate stress. The sky is a dull, overcast grey-lavender, the water has turned light greyish-blue with sluggish waves, and the trees have dry yellow-orange autumn leaves with some branches starting to show. A single windmill spins slowly.`;
    } else {
      label = `Smoggy Degraded Island (Score: ${ecoScore}/100)`;
      desc = `The digital ecosystem is heavily degraded. The sky is filled with dark purple and brown toxic smog, the water is a murky, toxic blackish-green sludge with oil slicks, and the trees are dry, truncated, leafless dead stumps. Factories or leakage barrels have polluted the area, and no wildlife remains.`;
    }
    return { ariaLabel: label, descriptionText: desc };
  }, [state, ecoScore]);

  // Animated clouds for optimal/moderate and toxic smog for degraded
  const cloudAnimationsClass = "transition-all duration-1000";

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md h-full min-h-[440px] overflow-hidden group">
      {/* Dynamic Background Backdrop Glow matching Island State */}
      <div 
        className={`absolute inset-0 opacity-5 blur-2xl pointer-events-none transition-all duration-1000 ${
          state === 'optimal' ? 'bg-emerald-500 scale-105' :
          state === 'moderate' ? 'bg-amber-500 scale-100' :
          'bg-rose-500 scale-95'
        }`}
      />

      {/* Header Info */}
      <div className="relative z-10 w-full flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">Ecosystem Health</span>
          <h3 className="text-lg font-sans font-semibold text-slate-800">
            {state === 'optimal' && '🌳 Thriving Oasis'}
            {state === 'moderate' && '🍂 Balanced Autumn'}
            {state === 'degraded' && '🌋 Industrial Wasteland'}
          </h3>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-mono text-slate-400">Eco Score</span>
          <span className={`text-2xl font-bold font-mono tracking-tight transition-colors duration-500 ${
            state === 'optimal' ? 'text-emerald-500' :
            state === 'moderate' ? 'text-amber-500' :
            'text-rose-500'
          }`}>
            {ecoScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </span>
        </div>
      </div>

      {/* Progress Bar under index */}
      <div className="relative z-10 w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            state === 'optimal' ? 'bg-emerald-500' :
            state === 'moderate' ? 'bg-amber-500' :
            'bg-rose-500'
          }`}
          style={{ width: `${ecoScore}%` }}
        />
      </div>

      {/* Interactive 2D Floating Island SVGs with Dynamic Styling */}
      <div className="relative w-full max-w-[360px] aspect-square flex items-center justify-center">
        <svg
          id="eco-island-svg"
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-lg select-none"
          role="img"
          aria-label={ariaLabel}
        >
          <desc>{descriptionText}</desc>
          
          <defs>
            {/* Dynamic Sky Gradients */}
            <linearGradient id="skyGradOptimal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="60%" stopColor="#f0f9ff" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <linearGradient id="skyGradModerate" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="60%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
            <linearGradient id="skyGradDegraded" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#451a03" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Dynamic Water Gradients */}
            <linearGradient id="waterGradOptimal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="waterGradModerate" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="waterGradDegraded" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2c251e" />
              <stop offset="70%" stopColor="#14532d" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>

            {/* Island Base Soil Gradients */}
            <linearGradient id="soilGradOptimal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <linearGradient id="soilGradModerate" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5c2c16" />
              <stop offset="100%" stopColor="#3b0f02" />
            </linearGradient>
            <linearGradient id="soilGradDegraded" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2e2a24" />
              <stop offset="100%" stopColor="#171412" />
            </linearGradient>

            {/* Filters */}
            <filter id="toxicGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComponentTransfer in="blur" result="glow">
                <feFuncA type="linear" slope="0.5" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. SKY BACKDROP (Rounded Window or Portal) */}
          <clipPath id="skyClip">
            <circle cx="200" cy="200" r="180" />
          </clipPath>
          
          <g clipPath="url(#skyClip)">
            {/* Base Sky */}
            <rect 
              x="0" 
              y="0" 
              width="400" 
              height="400" 
              fill={state === 'optimal' ? 'url(#skyGradOptimal)' : state === 'moderate' ? 'url(#skyGradModerate)' : 'url(#skyGradDegraded)'}
              className="transition-all duration-1000"
            />

            {/* Sun or Smog Disk */}
            {state === 'optimal' && (
              <circle cx="310" cy="90" r="28" fill="#fef08a" className="animate-pulse duration-[3000ms]">
                <animate attributeName="r" values="26;29;26" dur="4s" repeatCount="indefinite" />
              </circle>
            )}
            {state === 'moderate' && (
              <circle cx="310" cy="90" r="24" fill="#fed7aa" opacity="0.6"/>
            )}
            {state === 'degraded' && (
              <circle cx="310" cy="90" r="20" fill="#fca5a5" opacity="0.3" filter="url(#toxicGlow)"/>
            )}

             {/* Clouds / Smog Particles */}
             {state === 'optimal' && (
               <g fill="#ffffff" opacity="0.85" className="animate-eco-drift-cloud">
                 {/* Floating clouds with secondary vertical floating animations */}
                 <path className="animate-eco-float" d="M 60,110 a 15,15 0 0 1 15,-15 a 22,22 0 0 1 35,5 a 15,15 0 0 1 10,25 h -55 a 15,15 0 0 1 -5,-15 z" />
                 <path className="animate-eco-float" style={{ animationDelay: '2.5s' }} d="M 240,75 a 12,12 0 0 1 12,-12 a 18,18 0 0 1 28,4 a 12,12 0 0 1 8,20 h -45 a 12,12 0 0 1 -3,-12 z" />
               </g>
             )}

             {state === 'moderate' && (
               <>
                 {/* Drifting moderate gray clouds */}
                 <g fill="#e2e8f0" opacity="0.75" className="animate-eco-drift-cloud">
                   <path className="animate-eco-float" d="M 40,110 a 15,15 0 0 1 20,-10 a 25,25 0 0 1 40,8 h -56 z" />
                   <path className="animate-eco-float" style={{ animationDelay: '3s' }} d="M 220,80 a 14,14 0 0 1 20,-5 a 20,20 0 0 1 30,10 h -46 z" />
                 </g>
                 
                 {/* Gentle drizzling rain streaks */}
                 <g stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" opacity="0.65">
                   <line x1="80" y1="120" x2="65" y2="155" className="animate-eco-rain-1" />
                   <line x1="160" y1="90" x2="145" y2="125" className="animate-eco-rain-2" />
                   <line x1="250" y1="110" x2="235" y2="145" className="animate-eco-rain-3" />
                   <line x1="320" y1="100" x2="305" y2="135" className="animate-eco-rain-2" />
                 </g>
               </>
             )}

             {state === 'degraded' && (
               <>
                 {/* Pulsing brown toxic smog haze */}
                 <g fill="#78350f" opacity="0.45" filter="url(#toxicGlow)" className="animate-eco-smog-cloud">
                   {/* Toxic Smog Bands trailing slowly */}
                   <path d="M 20,130 q 80,-20 160,0 t 160,0 t 80,-10 L 420,180 L -20,180 Z" />
                   <circle cx="70" cy="150" r="14" fill="#451a03" />
                   <circle cx="180" cy="120" r="12" fill="#2d1500" />
                   <circle cx="300" cy="140" r="18" fill="#451a03" />
                 </g>

                 {/* Acid rain streaks */}
                 <g stroke="#f87171" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" filter="url(#toxicGlow)">
                   <line x1="60" y1="110" x2="45" y2="145" className="animate-eco-rain-1" />
                   <line x1="110" y1="85" x2="95" y2="120" className="animate-eco-rain-2" />
                   <line x1="190" y1="115" x2="175" y2="150" className="animate-eco-rain-3" />
                   <line x1="240" y1="95" x2="225" y2="130" className="animate-eco-rain-1" />
                   <line x1="310" y1="125" x2="295" y2="160" className="animate-eco-rain-2" />
                 </g>
               </>
             )}

             {/* Birds in flight (For optimal state) */}
             {state === 'optimal' && (
               <g stroke="#0369a1" strokeWidth="2.5" fill="none" strokeLinecap="round">
                 <path d="M 80,70 Q 86,63 92,70 Q 98,63 104,70">
                   <animate attributeName="transform" type="translate" values="0,2; 5,-3; 0,2" dur="5s" repeatCount="indefinite" />
                 </path>
                 <path d="M 130,55 Q 134,50 138,55 Q 142,50 146,55">
                   <animate attributeName="transform" type="translate" values="0,-1; -3,4; 0,-1" dur="6s" repeatCount="indefinite" />
                 </path>
               </g>
             )}

            {/* 2. MAIN FLOATING ISLAND PLATFORM */}
            {/* The Turf/Grass surface */}
            <path 
              d="M 60,240 C 90,215 310,215 340,240 C 350,248 350,255 330,260 C 290,270 110,270 70,260 C 50,255 50,248 60,240 Z" 
              fill={state === 'optimal' ? '#22c55e' : state === 'moderate' ? '#ca8a04' : '#57534e'}
              className="transition-all duration-1000"
            />
            {/* Grass Highlights/Detail for Optimal */}
            {state === 'optimal' && (
              <>
                <ellipse cx="200" cy="245" rx="100" ry="8" fill="#4ade80" />
                <ellipse cx="140" cy="240" rx="30" ry="4" fill="#4ade80" />
                <ellipse cx="260" cy="242" rx="40" ry="6" fill="#4ade80" />
              </>
            )}
            
            {/* Silt soil layer (Chutes) */}
            <path 
              d="M 66,252 C 68,260 85,275 100,285 C 130,305 270,305 300,285 C 315,275 332,260 334,252 C 300,265 100,265 66,252 Z" 
              fill={state === 'optimal' ? '#854d0e' : state === 'moderate' ? '#6b21a8' : '#292524'}
              opacity="0.85"
              className="transition-all duration-1000"
            />

            {/* Floating Island Underground Stone/Soil Base */}
            <path 
              d="M 70,258 L 130,315 C 140,323 160,335 200,335 C 240,335 260,323 270,315 L 330,258 C 310,275 280,282 200,282 C 120,282 90,275 70,258 Z" 
              fill={state === 'optimal' ? 'url(#soilGradOptimal)' : state === 'moderate' ? 'url(#soilGradModerate)' : 'url(#soilGradDegraded)'}
              className="transition-all duration-1000"
            />

            {/* Roots hanging down */}
            {state === 'optimal' && (
              <g stroke="#451a03" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.75">
                <path d="M 120,280 Q 115,295 118,305" />
                <path d="M 200,285 Q 204,310 198,325" />
                <path d="M 280,280 Q 285,296 281,308" />
              </g>
            )}
            {state === 'moderate' && (
              <g stroke="#3b0f02" strokeWidth="2.5" fill="none" opacity="0.6">
                <path d="M 150,282 Q 148,295 151,302" />
                <path d="M 230,282 Q 232,300 228,312" />
              </g>
            )}

            {/* Cracked Ground cracks / details for Degraded State */}
            {state === 'degraded' && (
              <g stroke="#090504" strokeWidth="2" strokeLinecap="round" opacity="0.8">
                <path d="M 120,240 Q 150,248 180,242" />
                <path d="M 160,245 Q 165,255 170,258" />
                <path d="M 220,242 Q 250,245 280,238" />
                <path d="M 245,243 Q 240,252 245,256" />
                <path d="M 195,248 Q 200,260 205,263" />
              </g>
            )}

            {/* 3. SHRUBS / TREES / VEGETATION */}
            {/* Tree 1: Left */}
            {state === 'optimal' && (
              <g id="tree-left" className="animate-eco-sway-left">
                {/* Trunk */}
                <path d="M 110,245 Q 112,210 115,190" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
                <path d="M 115,195 Q 105,180 102,175" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
                {/* Canopy */}
                <circle cx="115" cy="170" r="24" fill="#059669" />
                <circle cx="98" cy="180" r="16" fill="#10b981" />
                <circle cx="128" cy="172" r="18" fill="#10b981" />
                <circle cx="115" cy="155" r="18" fill="#34d399" />
              </g>
            )}
            {state === 'moderate' && (
              <g id="tree-left-moderate" className="animate-eco-sway-left">
                {/* Trunk */}
                <path d="M 110,245 Q 112,210 115,190" stroke="#5c2c16" strokeWidth="5" strokeLinecap="round" />
                <path d="M 115,195 Q 105,180 102,175" stroke="#5c2c16" strokeWidth="3"  />
                {/* Reduced and Yellowing Leaves */}
                <circle cx="115" cy="172" r="18" fill="#b45309" />
                <circle cx="102" cy="180" r="12" fill="#d97706" />
                <circle cx="124" cy="175" r="12" fill="#f59e0b" />
              </g>
            )}
            {state === 'degraded' && (
              <g id="tree-left-dry">
                {/* Bare dead trunk stub */}
                <path d="M 110,245 Q 112,218 114,208" stroke="#1c1917" strokeWidth="6" strokeLinecap="round" />
                <path d="M 114,212 Q 106,204 102,201" stroke="#1c1917" strokeWidth="3.5" strokeLinecap="round" />
              </g>
            )}

            {/* Tree 2: Center (Big Tree) */}
            {state === 'optimal' && (
              <g id="tree-center" className="animate-eco-sway-center">
                {/* Trunk */}
                <path d="M 195,245 Q 198,190 200,165" stroke="#78350f" strokeWidth="10" strokeLinecap="round" />
                <path d="M 200,185 Q 170,165 165,155" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
                <path d="M 200,175 Q 230,160 235,150" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
                {/* Foliage */}
                <circle cx="200" cy="140" r="34" fill="#047857" />
                <circle cx="170" cy="155" r="26" fill="#059669" />
                <circle cx="230" cy="150" r="24" fill="#059669" />
                <circle cx="210" cy="125" r="26" fill="#10b981" />
                <circle cx="185" cy="132" r="24" fill="#10b981" />
                {/* Extra Fruits / Flowers in optimal */}
                <circle cx="180" cy="145" r="3" fill="#f43f5e" />
                <circle cx="220" cy="138" r="3.5" fill="#f43f5e" />
                <circle cx="195" cy="122" r="3" fill="#f43f5e" />
                <circle cx="210" cy="155" r="3" fill="#f43f5e" />
              </g>
            )}
            {state === 'moderate' && (
              <g id="tree-center-moderate" className="animate-eco-sway-center">
                {/* Trunk */}
                <path d="M 195,245 Q 198,190 200,165" stroke="#5c2c16" strokeWidth="8" strokeLinecap="round" />
                <path d="M 200,185 Q 170,165 165,155" stroke="#5c2c16" strokeWidth="5" strokeLinecap="round" />
                <path d="M 200,175 Q 230,160 235,150" stroke="#5c2c16" strokeWidth="4" strokeLinecap="round" />
                {/* Dry thin foliage */}
                <circle cx="200" cy="145" r="25" fill="#ca8a04" />
                <circle cx="172" cy="158" r="18" fill="#b45309" />
                <circle cx="224" cy="152" r="18" fill="#d97706" />
                <circle cx="210" cy="132" r="18" fill="#ca8a04" />
              </g>
            )}
            {state === 'degraded' && (
              <g id="tree-center-dead">
                {/* Bare dead snapped tree */}
                <path d="M 195,245 Q 198,212 196,192" stroke="#1c1917" strokeWidth="9" strokeLinecap="round" />
                <path d="M 197,210 L 180,195" stroke="#1c1917" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M 196,192 L 208,185" stroke="#1c1917" strokeWidth="4" strokeLinecap="round" />
                {/* Snapped top outline */}
                <path d="M 191,192 L 201,192 L 193,184 Z" fill="#1c1917" />
              </g>
            )}

            {/* Tree 3: Right (Windmill / Solar Panel Area) */}
            {/* If optimal, let's place a beautiful Windmill representing eco-power */}
            {state === 'optimal' && (
              <g id="clean-energy">
                {/* Windmill tower */}
                <path d="M 270,245 L 280,180" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
                <circle cx="280" cy="180" r="4" fill="#94a3b8" />
                {/* Windmill blades with dynamic animation speed */}
                <g>
                  <animateTransform 
                    attributeName="transform" 
                    type="rotate" 
                    from="0 280 180" 
                    to="360 280 180" 
                    dur="3s" 
                    repeatCount="indefinite" 
                  />
                  <line x1="280" y1="180" x2="280" y2="150" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
                  <line x1="280" y1="180" x2="306" y2="195" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
                  <line x1="280" y1="180" x2="254" y2="195" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
                </g>
                
                {/* Small green bush */}
                <circle cx="255" cy="245" r="12" fill="#047857" />
                <circle cx="290" cy="245" r="10" fill="#059669" />
              </g>
            )}

            {state === 'moderate' && (
              <g id="clean-energy-moderate">
                {/* Windmill tower and blades spin very slowly */}
                <path d="M 270,245 L 280,180" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="280" cy="180" r="3" fill="#64748b" />
                <g>
                  <animateTransform 
                    attributeName="transform" 
                    type="rotate" 
                    from="0 280 180" 
                    to="360 280 180" 
                    dur="12s" 
                    repeatCount="indefinite" 
                  />
                  <line x1="280" y1="180" x2="280" y2="152" stroke="#94a3b8" strokeWidth="2.5" />
                  <line x1="280" y1="180" x2="304" y2="194" stroke="#94a3b8" strokeWidth="2.5" />
                  <line x1="280" y1="180" x2="256" y2="194" stroke="#94a3b8" strokeWidth="2.5" />
                </g>
                <circle cx="255" cy="245" r="8" fill="#ca8a04" />
                <circle cx="290" cy="245" r="6" fill="#b45309" />
              </g>
            )}

            {state === 'degraded' && (
              <g id="pollution-barrel">
                {/* Toxic waste leak barrel / broken chimney */}
                <rect x="268" y="215" width="18" height="28" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
                {/* Yellow biohazard stripe */}
                <rect x="268" y="226" width="18" height="6" fill="#eab308" />
                {/* Skull symbol block mockup */}
                <circle cx="277" cy="229" r="2" fill="#000000" />
                
                {/* Dark sludge pool leaking */}
                <ellipse cx="277" cy="244" rx="14" ry="4" fill="#042c16" />

                {/* Leak puff representing smoke */}
                <path d="M 277,215 Q 266,200 270,192 T 262,175" stroke="#451a03" strokeWidth="3" fill="none" opacity="0.6">
                  <animate attributeName="stroke-dasharray" values="100;10;100" dur="8s" repeatCount="indefinite" />
                </path>
              </g>
            )}

            {/* 4. THE OCEAN UNDER WATER */}
            {/* Base block filling water clip height */}
            <path 
              d="M -10,310 C 130,315 270,315 410,310 L 410,410 L -10,410 Z" 
              fill="url(#waterGradOptimal)" 
              className="hidden" // Just standard reference
            />

            {/* Floating Water Layer covering lower quadrant */}
            <path 
              d="M -10,320 Q 100,310 200,320 T 410,320 L 410,410 L -10,410 Z" 
              fill={state === 'optimal' ? 'url(#waterGradOptimal)' : state === 'moderate' ? 'url(#waterGradModerate)' : 'url(#waterGradDegraded)'}
              className="transition-all duration-1000"
            />

            {/* Ripple Effects for Water */}
            {state === 'optimal' && (
              <g stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.4">
                <line x1="50" y1="340" x2="90" y2="340">
                  <animate attributeName="transform" type="translate" values="-10,0; 20,0; -10,0" dur="4s" repeatCount="indefinite" />
                </line>
                <line x1="180" y1="360" x2="240" y2="360">
                  <animate attributeName="transform" type="translate" values="15,0; -15,0; 15,0" dur="5s" repeatCount="indefinite" />
                </line>
                <line x1="280" y1="335" x2="330" y2="335">
                  <animate attributeName="transform" type="translate" values="-5,0; 15,0; -5,0" dur="3.5s" repeatCount="indefinite" />
                </line>
                {/* Happy jumping fish in optimal */}
                <path d="M 120,350 Q 130,335 140,350" stroke="#f43f5e" strokeWidth="2" fill="none">
                  <animate attributeName="transform" type="translate" values="0,10; 0,-8; 0,10" dur="4.5s" repeatCount="indefinite" />
                </path>
              </g>
            )}

            {state === 'moderate' && (
              <g stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" opacity="0.25">
                <line x1="80" y1="345" x2="110" y2="345" />
                <line x1="220" y1="355" x2="260" y2="355" />
              </g>
            )}

            {state === 'degraded' && (
              <g stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round" opacity="0.15" filter="url(#toxicGlow)">
                {/* Stagnant bubbles or toxic foam */}
                <circle cx="100" cy="350" r="3" fill="#bef264" />
                <circle cx="106" cy="352" r="1.5" fill="#bef264" />
                <circle cx="280" cy="365" r="4" fill="#bef264" />
                <circle cx="285" cy="368" r="2" fill="#bef264" />
                {/* Floating waste barrel/trash mock shape */}
                <path d="M 170,345 L 182,348 L 180,356 L 168,353 Z" fill="#7f1d1d" stroke="#1c0202" />
              </g>
            )}
          </g>
          
          {/* Border details around portal circle frame */}
          <circle 
            cx="200" 
            cy="200" 
            r="180" 
            fill="none" 
            stroke={state === 'optimal' ? '#e2e8f0' : state === 'moderate' ? '#cbd5e1' : '#451a03'} 
            strokeWidth="3"
            className="transition-colors duration-1000"
          />
        </svg>
      </div>

      {/* Footer State Feedback */}
      <div className="relative z-10 text-center mt-4">
        {state === 'optimal' && (
          <p className="text-sm font-sans font-medium text-emerald-600">
            Great job! Your low-carbon lifestyle is healing the island.
          </p>
        )}
        {state === 'moderate' && (
          <p className="text-sm font-sans font-medium text-amber-600">
            The climate is balanced, but the island is fragile. Keep improving!
          </p>
        )}
        {state === 'degraded' && (
          <p className="text-sm font-sans font-medium text-rose-600">
            S.O.S! Environmental devastation detected! Take urgent action!
          </p>
        )}
      </div>

      {/* Footer Ambient sound toggle */}
      <div className="relative z-10 mt-4 w-full flex flex-col items-center gap-1.5 border-t border-slate-100 pt-4">
        <button
          onClick={handleToggleAudio}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggleAudio();
            }
          }}
          aria-label={isAudioPlaying ? "Mute interactive climate soundscape" : "Activate interactive climate soundscape"}
          className={`px-4 py-2 rounded-full border text-xs font-semibold font-sans flex items-center justify-center gap-2 transition-all cursor-pointer focus:outline-none focus:ring-2 ${
            isAudioPlaying
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100/70 focus:ring-emerald-500/30'
              : 'bg-slate-50 text-slate-600 border-slate-200/60 hover:bg-slate-100 hover:text-slate-800 focus:ring-slate-300/30'
          }`}
        >
          {isAudioPlaying ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Ambient Sounds Active</span>
              {/* Dynamic simulated waveform bars */}
              <span className="flex items-end gap-0.5 h-3 w-4 justify-center">
                <span className="w-0.5 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.6s' }} />
                <span className="w-0.5 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.5s' }} />
                <span className="w-0.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.7s' }} />
              </span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Muted • Hear Environment</span>
            </>
          )}
        </button>
        <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
          {isAudioPlaying ? (
            state === 'optimal' ? 'Playing: Breeze & Bird Chirps' :
            state === 'moderate' ? 'Playing: Rustling Winds & Rain' :
            'Playing: Industrial Smog Hum'
          ) : (
            'Procedural Web Audio API Synth'
          )}
        </span>
      </div>
    </div>
  );
});

export default EcoIsland;
