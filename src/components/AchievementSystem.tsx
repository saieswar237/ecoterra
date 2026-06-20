import React, { useMemo } from 'react';
import { LoggedAction } from '../types';
import { Award, Lock, CheckCircle2, ShieldAlert, Award as BadgeIcon } from 'lucide-react';

interface AchievementSystemProps {
  history: LoggedAction[];
  ecoScore: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: string;
  maxProgress: number;
  currentProgress: number;
  categoryColor: string;
}

export const AchievementSystem: React.FC<AchievementSystemProps> = React.memo(({ history, ecoScore }) => {
  // Compute individual badge states based on user activity logs & current score metrics
  const badges = useMemo<Badge[]>(() => {
    // 1. Climate Novice (at least 1 logged action)
    const totalCount = history.length;
    const noviceUnlocked = totalCount >= 1;

    // 2. Eco Warrior (Maintain Net Viability >= 90)
    const warriorUnlocked = ecoScore >= 90;

    // 3. Low Carbon Commuter (At least 2 transit activities with positive impact)
    const transitCount = history.filter(item => item.category === 'transport' && item.impact > 0).length;
    const commuterUnlocked = transitCount >= 2;

    // 4. Green Gourmet (Ate plant-based or similar positive food actions >= 1)
    const foodCount = history.filter(item => item.category === 'food' && item.impact > 0).length;
    const gourmetUnlocked = foodCount >= 1;

    // 5. Waste Eliminator (Positive waste actions >= 2)
    const wasteCount = history.filter(item => item.category === 'waste' && item.impact > 0).length;
    const wasteUnlocked = wasteCount >= 2;

    // 6. Forest Guardian (Positive conservation actions >= 2)
    const consCount = history.filter(item => item.category === 'conservation' && item.impact > 0).length;
    const consUnlocked = consCount >= 2;

    // 7. Atmospheric Purifier (Net impact of all logged actions is >= +25)
    const netImpact = history.reduce((sum, item) => sum + item.impact, 0);
    const purifierUnlocked = netImpact >= 25;

    return [
      {
        id: 'novice',
        name: 'Climate Novice',
        description: 'Take your first step on EcoTerra island by logging any carbon activity.',
        unlocked: noviceUnlocked,
        progress: `${Math.min(1, totalCount)}/1`,
        maxProgress: 1,
        currentProgress: totalCount,
        categoryColor: 'from-blue-500 to-blue-600',
      },
      {
        id: 'warrior',
        name: 'Eco Warrior',
        description: 'Achieve and maintain an optimal eco score of 90% or higher.',
        unlocked: warriorUnlocked,
        progress: `${ecoScore}% / 90%`,
        maxProgress: 90,
        currentProgress: ecoScore,
        categoryColor: 'from-emerald-500 to-emerald-600',
      },
      {
        id: 'purifier',
        name: 'Atmospheric Purifier',
        description: 'Achieve a combined net offset rating of +25 carbon points or more.',
        unlocked: purifierUnlocked,
        progress: `${netImpact > 0 ? '+' : ''}${netImpact} / +25`,
        maxProgress: 25,
        currentProgress: netImpact,
        categoryColor: 'from-teal-500 to-teal-600',
      },
      {
        id: 'commuter',
        name: 'Low Carbon Commuter',
        description: 'Log 2 or more eco-friendly transport activities (cycling, public transit).',
        unlocked: commuterUnlocked,
        progress: `${Math.min(2, transitCount)}/2`,
        maxProgress: 2,
        currentProgress: transitCount,
        categoryColor: 'from-indigo-500 to-indigo-600',
      },
      {
        id: 'gourmet',
        name: 'Green Gourmet',
        description: 'Log at least 1 carbon-reducing plant-based meal decision.',
        unlocked: gourmetUnlocked,
        progress: `${Math.min(1, foodCount)}/1`,
        maxProgress: 1,
        currentProgress: foodCount,
        categoryColor: 'from-orange-500 to-amber-600',
      },
      {
        id: 'eliminator',
        name: 'Waste Eliminator',
        description: 'Avoid single-use plastics or log recycling efforts twice.',
        unlocked: wasteUnlocked,
        progress: `${Math.min(2, wasteCount)}/2`,
        maxProgress: 2,
        currentProgress: wasteCount,
        categoryColor: 'from-purple-500 to-purple-600',
      },
      {
        id: 'guardian',
        name: 'Forest Guardian',
        description: 'Log 2 or more conservation actions (planting trees/saplings).',
        unlocked: consUnlocked,
        progress: `${Math.min(2, consCount)}/2`,
        maxProgress: 2,
        currentProgress: consCount,
        categoryColor: 'from-green-500 to-teal-600',
      },
    ];
  }, [history, ecoScore]);

  // Statistics summaries for achievements
  const unlockedCount = useMemo(() => badges.filter(b => b.unlocked).length, [badges]);

  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-5 h-full" id="achievement-system-container">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h3 className="text-base font-sans font-semibold text-slate-800">Ecosystem Achievements</h3>
            <p className="text-[11px] text-slate-400 font-sans">Unlock badges by steering the island toward peak viability</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
          {unlockedCount} / {badges.length} Unlocked
        </span>
      </div>

      {/* Progress slider overall */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-2xs font-mono">
          <span className="text-slate-500 uppercase tracking-wider">Badge Milestones</span>
          <span className="text-slate-700 font-bold">{Math.round((unlockedCount / badges.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full transition-all duration-1000 ease-out rounded-full" 
            style={{ width: `${(unlockedCount / badges.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Badge Bento List Grid */}
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[340px] pr-1.5 custom-scrollbar">
        {badges.map((badge) => {
          const progressPercent = badge.maxProgress > 0 
            ? Math.max(0, Math.min(100, (badge.currentProgress / badge.maxProgress) * 100))
            : 0;

          return (
            <div
              key={badge.id}
              className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 group relative overflow-hidden ${
                badge.unlocked
                  ? 'bg-slate-50/50 border-emerald-100 shadow-2xs hover:shadow-xs hover:bg-slate-50/90'
                  : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              {/* Left hand details */}
              <div className="flex items-start gap-3.5 z-10">
                {/* Badge Icon circle */}
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs transition-all duration-300 ${
                    badge.unlocked
                      ? `bg-gradient-to-br ${badge.categoryColor} text-white border-white/15 scale-100 rotate-0 group-hover:rotate-6`
                      : 'bg-slate-50 text-slate-400 border-slate-100'
                  }`}
                >
                  <BadgeIcon className="w-5 h-5" />
                </div>

                <div className="flex flex-col">
                  <h4 className={`text-xs font-bold leading-snug font-sans ${badge.unlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                    {badge.name}
                  </h4>
                  <p className="text-[10px] leading-relaxed text-slate-400 font-sans mt-0.5 max-w-[210px] sm:max-w-xs md:max-w-[260px]">
                    {badge.description}
                  </p>
                  
                  {/* Lock progress meter */}
                  {!badge.unlocked && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-slate-350 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-400">
                        {badge.progress}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Unlock Indicator Right */}
              <div className="shrink-0 flex flex-col items-end gap-1 font-mono z-10">
                {badge.unlocked ? (
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider animate-pulse">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md text-[9px] font-bold">
                    <Lock className="w-2.5 h-2.5 shrink-0" />
                    <span>Locked</span>
                  </div>
                )}
                {badge.unlocked && (
                  <span className="text-[10px] font-bold text-slate-400">
                    {badge.progress}
                  </span>
                )}
              </div>

              {/* Decorative dynamic ambient glow behind unlocked items */}
              {badge.unlocked && (
                <div className="absolute inset-0 bg-radial-gradient from-emerald-50/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
