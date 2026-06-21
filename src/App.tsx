// PATH: src/App.tsx
import React, { useState, useMemo, useCallback } from 'react';
import EcoIsland from './components/EcoIsland';
import ActionLogger from './components/ActionLogger';
import { AchievementSystem } from './components/AchievementSystem';
import { LoggedAction, EcoAction } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TreePine, 
  Sprout, 
  Car, 
  Plane, 
  Trash2, 
  Zap, 
  Activity, 
  Utensils, 
  Award, 
  BookOpen, 
  RefreshCw, 
  Info,
  Calendar,
  Layers,
  Heart,
  ChevronRight,
  ShieldCheck,
  Download
} from 'lucide-react';

/**
 * Main App Component
 * Serves as the central state engine for EcoTerra V1.2.
 * Coordinates carbon ledger history, synchronized localStorage updates, environmental grades,
 * and passes the calculated state down to nested interactive simulation components.
 *
 * @returns {React.ReactElement} The visual main framework of the EcoAuditor dashboard.
 */
export default function App(): React.ReactElement {
  // Global ecoScore state (default 100, synced to localStorage for reliability)
  const [ecoScore, setEcoScore] = useState<number>(() => {
    const saved = localStorage.getItem('ecoterra_score');
    return saved !== null ? Math.min(100, Math.max(0, parseInt(saved, 10))) : 100;
  });

  // Global history of activity logs
  const [history, setHistory] = useState<LoggedAction[]>(() => {
    const saved = localStorage.getItem('ecoterra_history');
    return saved !== null ? JSON.parse(saved) : [];
  });

  // Ledger filter categorization state
  const [ledgerFilter, setLedgerFilter] = useState<string>('all');

  /**
   * Efficiency Metric: Filtered ledger items using useMemo (prevents unnecessary sorting/filtering cycles)
   */
  const filteredHistory = useMemo(() => {
    if (ledgerFilter === 'all') return history;
    return history.filter(item => item.category === ledgerFilter);
  }, [history, ledgerFilter]);

  /**
   * Efficiency Metric: useMemo to calculate the total carbon offset trend to prevent excessive calculations during renders
   */
  const totalOffset = useMemo(() => {
    return history.reduce((sum, item) => sum + item.impact, 0);
  }, [history]);

  /**
   * Performance optimizer calculating circle-dash offsets dynamically for the physical UI ring.
   */
  const netViabilityRing = useMemo(() => {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const safeScore = isNaN(ecoScore) ? 100 : Math.min(100, Math.max(0, ecoScore));
    const strokeDashoffset = circumference - (safeScore / 100) * circumference;
    
    let ringColor = 'text-rose-500';
    if (safeScore >= 30) {
      ringColor = safeScore > 70 ? 'text-emerald-500' : 'text-amber-500';
    }
    return {
      radius,
      circumference,
      strokeDashoffset,
      ringColor
    };
  }, [ecoScore]);

  /**
   * Callback logging function allowing secure appending of historical actions.
   * Locked carefully in useCallback to guard children rendering performance.
   *
   * @param {Omit<EcoAction, 'id'>} action - Sanitsed action payload containing description, category, and impact.
   */
  const handleLogAction = useCallback((action: Omit<EcoAction, 'id'>) => {
    const uniqueId = String(Date.now()) + '-' + Math.random().toString(36).substring(2, 9);
    
    const newLogged: LoggedAction = {
      id: uniqueId,
      actionId: Math.random().toString(36).substring(2, 9),
      name: action.name,
      impact: action.impact,
      category: action.category,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      note: action.description
    };

    setHistory((prev) => {
      const nextHistory = [newLogged, ...prev];
      localStorage.setItem('ecoterra_history', JSON.stringify(nextHistory));
      return nextHistory;
    });

    // Ensure state boundary score lock between 0 and 100
    setEcoScore((prev) => {
      let nextScore = prev + action.impact;
      if (nextScore > 100) nextScore = 100;
      if (nextScore < 0) nextScore = 0;
      localStorage.setItem('ecoterra_score', String(nextScore));
      return nextScore;
    });
  }, []);

  /**
   * Safely deletes logged item and cleanly reverts their respective delta scores.
   *
   * @param {string} id - The specific targeted item log UUID.
   * @param {number} impact - The carbon offset score recorded on this action.
   */
  const handleDeleteItem = useCallback((id: string, impact: number) => {
    setHistory((prev) => {
      const nextHistory = prev.filter(item => item.id !== id);
      localStorage.setItem('ecoterra_history', JSON.stringify(nextHistory));
      return nextHistory;
    });

    setEcoScore((prev) => {
      let nextScore = prev - impact;
      if (nextScore > 100) nextScore = 100;
      if (nextScore < 0) nextScore = 0;
      localStorage.setItem('ecoterra_score', String(nextScore));
      return nextScore;
    });
  }, []);

  /**
   * Resets the client cache and deletes all localized histories, restoring pristine health status.
   */
  const handleResetApp = useCallback(() => {
    if (window.confirm("Are you sure you want to reset your EcoTerra island to pristine health status? This will wipe your history log.")) {
      setEcoScore(100);
      setHistory([]);
      localStorage.setItem('ecoterra_score', '100');
      localStorage.setItem('ecoterra_history', '[]');
    }
  }, []);

  /**
   * Packages entire ledger database inside a clean JSON schema bundle for localized audit logging.
   */
  const handleExportJSON = useCallback(() => {
    if (history.length === 0) return;
    const exportData = {
      appName: "EcoTerra Island Auditor",
      exportTimestamp: new Date().toISOString(),
      currentEcoScore: ecoScore,
      totalOffsetTrend: totalOffset,
      historyLog: history
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ecoterra_audit_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [history, ecoScore, totalOffset]);

  /**
   * Computes reactive environmental advice corresponding to the active climate grade using useMemo.
   */
  const currentLevelTips = useMemo(() => {
    if (ecoScore > 70) {
      return {
        rating: 'A+ High Biosphere Integrity',
        summary: 'Your environment is in a premium preservation state. Clean breezes rustle leaves, aquatic streams flow with crystal purity, and clean power sustains your community.',
        tips: [
          'Spread the word: Sustainable eating reduces deforestation rates up to 60%.',
          'Keep utilizing public transit to save an average of 4.8 metric tons of CO2 per person annually.',
          'Double check your insulation: Cozy heat seals reduce home energy carbon grids by 15%.'
        ],
        cssClass: 'border-emerald-100 bg-emerald-50/30 text-emerald-800'
      };
    } else if (ecoScore >= 30) {
      return {
        rating: 'B- Moderate Climate Stress',
        summary: 'Your island is undergoing resource depletion. Sky margins are cloudy and forests are turning brittle. Small adjustments can offset carbon output back to balance.',
        tips: [
          'Try implementing a Beef-Free-Week: Raising cows consumes 20x more carbon acreage than vegetables.',
          'Consider air drying laundry: Electric dryers generate nearly 2kg of carbon gas per cycle.',
          'Configure vampire energy plugs: Turn off active computer stations and game hubs at night.'
        ],
        cssClass: 'border-amber-100 bg-amber-50/20 text-amber-800'
      };
    } else {
      return {
        rating: 'F- Severe Ecological Failure',
        summary: 'EMERGENCY ACTION REQUIRED. Smog haze surrounds barren soil, acidifying your waters. Industrial runoff and high emissions have destroyed natural carbon sinks.',
        tips: [
          'Immediate Shift: Log a Plant-Based day or Tree Plantation offset to re-oxygenate soil layers.',
          'Choose local active transit: Walking or bicycling yields exactly 0g of gaseous carbon offsets.',
          'Urgent: Clean up waste to stop toxic microplastic particles from entering soil reserves.'
        ],
        cssClass: 'border-rose-100 bg-rose-50/30 text-rose-800'
      };
    }
  }, [ecoScore]);

  /**
   * Helper utility retrieving beautiful icon classes mapping to unique categorization logs.
   *
   * @param {string} category - Specific tag describing action type (e.g. food, transport).
   * @returns {React.ReactElement} Dynamic rendering of the Lucide-react symbol.
   */
  const getCategoryIcon = (category: string): React.ReactElement => {
    switch (category) {
      case 'transport': return <Plane className="w-4 h-4 text-indigo-600" />;
      case 'food': return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'energy': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'waste': return <Trash2 className="w-4 h-4 text-slate-500" />;
      case 'conservation': return <Sprout className="w-4 h-4 text-emerald-600" />;
      default: return <Activity className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col justify-between font-sans selection:bg-emerald-100 selection:text-emerald-900 leading-normal" id="ecoterra-root">
      
      {/* 1. COMPREHENSIVE HEADER & BRAND BLOCK */}
      <header className="w-full bg-white border-b border-slate-100 py-4 px-6 md:px-12 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand Layout */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20">
              <TreePine className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-sans font-bold tracking-tight text-slate-900">EcoTerra</span>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  Carbon Engine v1.2
                </span>
              </div>
              <p className="text-xs text-slate-400">The Living 2D Carbon Footprint Emulator</p>
            </div>
          </div>

          {/* Core Metric Counters Header Bar */}
          <div className="flex items-center gap-3 text-xs font-sans">
            <div className="hidden md:flex flex-col items-end pr-4 border-r border-slate-100">
              <span className="text-2xs font-mono uppercase tracking-wider text-slate-400">Total Activities</span>
              <span className="text-sm font-semibold font-mono text-slate-800" data-testid="header-total-actions">{history.length} logged</span>
            </div>
            <div className="hidden md:flex flex-col items-end pr-4 border-r border-slate-100">
              <span className="text-2xs font-mono uppercase tracking-wider text-slate-400">Carbon Trend</span>
              <span className={`text-sm font-semibold font-mono flex items-center gap-1 ${totalOffset >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} data-testid="header-carbon-trend">
                {totalOffset >= 0 ? '+' : ''}{totalOffset} Offset
              </span>
            </div>
            <button
              onClick={handleResetApp}
              aria-label="Reset digital island database"
              className="px-3.5 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl transition-all flex items-center gap-1.5 font-sans cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
              <span className="font-medium">Reset Island</span>
            </button>
            <button
              onClick={handleExportJSON}
              disabled={history.length === 0}
              aria-label="Export carbon activity logs as JSON"
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 font-sans focus:outline-none focus:ring-2 ${
                history.length === 0
                  ? 'text-slate-300 bg-slate-50 border border-slate-200/50 cursor-not-allowed'
                  : 'text-slate-700 bg-emerald-50/70 hover:bg-emerald-100/95 border border-emerald-100/80 hover:border-emerald-250 cursor-pointer focus:ring-emerald-300/40'
              }`}
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">Export JSON</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. PRIMARY APPLICATION CONTAINER GRID */}
      <main className="w-full max-w-7xl mx-auto px-4 py-8 md:px-8 flex-1 flex flex-col gap-8">
        
        {/* Intro banner */}
        <section className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-emerald-950/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_bottom_right,white,transparent)]" />
          
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight">
              An action ripples across nature. Watch your island thrive or decay.
            </h1>
            <p className="text-sm text-emerald-100/95 mt-2 max-w-2xl font-sans font-light">
              This gamified simulation translates daily lifestyle decisions directly into environmental health. Logging benefits like eating plant-based or planting saplings grows forests and purifies seawater, while carbon-heavy activities turn the atmosphere into a choking soot-cloud.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shrink-0 flex items-center gap-3">
            <Award className="w-10 h-10 text-emerald-300 animate-pulse" />
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-250">Current Health Grade</h4>
              <p className="text-lg font-sans font-bold leading-tight">
                {ecoScore > 70 ? '🟢 Excellence Oasis' : ecoScore >= 30 ? '🟡 Fragile balance' : '🔴 Ecological Distress'}
              </p>
            </div>
          </div>
        </section>

        {/* Core Double Module Grid Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Visual Island Screen on Left (take 5/12 columns) */}
          <div className="lg:col-span-5 h-full">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="h-full"
            >
              <EcoIsland ecoScore={ecoScore} />
            </motion.div>
          </div>

          {/* Action Logger Dashboard on Right (take 7/12 columns) */}
          <div className="lg:col-span-7 h-full">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="h-full"
            >
              <ActionLogger onLogAction={handleLogAction} ecoScore={ecoScore} />
            </motion.div>
          </div>
        </section>

        {/* 3. DYNAMIC INSIGHTS & HISTORIC LOG LIST */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Diagnostic Environmental Tips & Badges (6/12 columns) */}
          <div className="md:col-span-6 flex flex-col gap-8">
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-sans font-semibold text-slate-800">Carbon Science Advisor</h3>
              </div>

              {/* Dynamic feedback state header */}
              <div className={`p-4 rounded-2xl border ${currentLevelTips.cssClass} transition-colors duration-1000`}>
                <span className="text-3xs font-mono uppercase tracking-wider font-bold">Climate Zone Grade</span>
                <h4 className="text-sm font-sans font-bold mt-0.5">{currentLevelTips.rating}</h4>
                <p className="text-xs mt-1.5 font-sans leading-relaxed">{currentLevelTips.summary}</p>
              </div>

              {/* Bulleted tip checklists */}
              <div className="mt-4 flex flex-col gap-2">
                <p className="text-xs font-mono uppercase text-slate-400">Direct Eco Recommendations:</p>
                {currentLevelTips.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 font-sans mt-1">
                    <ChevronRight className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Informational stats summary */}
            <div className="p-6 bg-slate-900 text-slate-100 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-sans">
                <Info className="w-20 h-20" />
              </div>
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Carbon Reduction Audit</h4>
                
                {/* Visual Net Viability Progress Circle Ring */}
                <div className="flex items-center gap-4 mt-4 bg-slate-800/40 p-3 rounded-2xl border border-slate-800/60">
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                      <circle
                        cx="20"
                        cy="20"
                        r={netViabilityRing.radius}
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r={netViabilityRing.radius}
                        className={`${netViabilityRing.ringColor} transition-all duration-1000 ease-out`}
                        strokeWidth="3.5"
                        strokeDasharray={netViabilityRing.circumference}
                        strokeDashoffset={netViabilityRing.strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-bold font-mono text-slate-100">{ecoScore}%</span>
                  </div>
                  <div>
                    <span className="text-2xs font-mono uppercase tracking-wider text-slate-500">Net Viability</span>
                    <h5 className="text-xs font-semibold text-slate-200 mt-0.5 font-sans">
                      {ecoScore > 70 ? 'Optimal Biosphere' : ecoScore >= 30 ? 'Ecosystem Stress' : 'Critical Depleted'}
                    </h5>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                <div className="p-2 bg-slate-800/40 rounded-xl border border-slate-800/30">
                  <p className="text-sm font-mono font-bold text-emerald-400">{history.filter(h => h.impact > 0).length}</p>
                  <p className="text-[10px] uppercase text-slate-400 font-mono">Green Benefits</p>
                </div>
                <div className="p-2 bg-slate-800/40 rounded-xl border border-slate-800/30">
                  <p className="text-sm font-mono font-bold text-rose-400">{history.filter(h => h.impact < 0).length}</p>
                  <p className="text-[10px] uppercase text-slate-400 font-mono font-bold">Impact Costs</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono justify-center border-t border-slate-800 pt-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Encrypted Client-Side Vault Protection</span>
              </div>
            </div>

            {/* Achievement Badge System component */}
            <AchievementSystem history={history} ecoScore={ecoScore} />
          </div>

          {/* Historical Activity log with delete options (6/12 columns) */}
          <div className="md:col-span-6 h-full">
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 h-full" style={{ minHeight: '440px' }} id="carbon-log-ledger-container">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-sans font-semibold text-slate-800">Carbon Log Ledger</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                      {filteredHistory.length} listed
                    </span>
                    <button
                      onClick={handleExportJSON}
                      disabled={history.length === 0}
                      aria-label="Download carbon audit log as JSON"
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500/40 ${
                        history.length === 0
                          ? 'text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-100 hover:border-emerald-250'
                      }`}
                      title={history.length === 0 ? "Log activities to export data" : "Export activity history JSON"}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Ledger filter categorizer */}
                <div className="flex flex-wrap gap-1" role="tablist" aria-label="Ledger category filter tabs">
                  {['all', 'transport', 'food', 'conservation', 'waste', 'energy'].map((cat) => (
                    <button
                      key={cat}
                      role="tab"
                      aria-selected={ledgerFilter === cat}
                      tabIndex={0}
                      onClick={() => setLedgerFilter(cat)}
                      className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500/40 ${
                        ledgerFilter === cat
                          ? 'bg-emerald-600 text-white border-transparent'
                          : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive history listing */}
              <div className="flex-1 flex flex-col gap-2 max-h-120 overflow-y-auto pr-1" id="history-scroller">
                <AnimatePresence initial={false}>
                  {filteredHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400 gap-2 flex-1">
                      <Layers className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-sans font-medium text-slate-500">No matching items in this category ledger.</p>
                      <p className="text-2xs font-mono max-w-xs uppercase tracking-wider text-slate-400">Tap quick action items or submit customized inputs to populate ledger items.</p>
                    </div>
                  ) : (
                    filteredHistory.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="bg-slate-50/70 hover:bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between gap-3 group transition-all"
                        id={`logged-item-${item.id}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-sans font-medium text-slate-800 line-clamp-1">{item.name}</h4>
                            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                              <span>{item.timestamp}</span>
                              <span>•</span>
                              <span className="capitalize">{item.category}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pr-1 shrink-0">
                          <span className={`font-mono text-xs font-bold ${item.impact > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {item.impact > 0 ? `+${item.impact}` : item.impact}
                          </span>
                          
                          <button
                            onClick={() => handleDeleteItem(item.id, item.impact)}
                            aria-label={`Invert log and delete "${item.name}"`}
                            className="p-1 px-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-rose-200 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 4. DESIGN CREDITS / FOOTER */}
      <footer className="w-full bg-white border-t border-slate-150 py-6 px-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans flex items-center gap-1 justify-center">
            <span>EcoTerra gamified platform</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>PromptWars Challenge 3 Submission.</span>
          </p>
          <div className="flex items-center gap-4 font-mono text-2xs uppercase">
            <span className="text-[#10b981] font-bold">● High Biosphere Compliant</span>
            <span>Made with Vite & React 18</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
