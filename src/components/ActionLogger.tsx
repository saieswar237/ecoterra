import React, { useState, useMemo, useCallback } from 'react';
import { EcoAction } from '../types';
import { Sparkles, Trash2, ShieldAlert, Plus, Zap, AlertTriangle } from 'lucide-react';

interface ActionLoggerProps {
  onLogAction: (action: Omit<EcoAction, 'id'>) => void;
  ecoScore?: number;
}

// Predefined static list of carbon impact actions
const PREDEFINED_ACTIONS: EcoAction[] = [
  { id: '1', name: 'Took a High-Altitude Flight', impact: -30, category: 'transport', description: 'Long-distance fossil emission' },
  { id: '2', name: 'Drove a Combustion Car', impact: -10, category: 'transport', description: 'Daily fossil fuel emissions' },
  { id: '3', name: 'Ate a Plant-based Meal', impact: 10, category: 'food', description: 'Low carbon footprint protein offset' },
  { id: '4', name: 'Took Public Transit / Metro', impact: 15, category: 'transport', description: 'Highly efficient shared mobility' },
  { id: '5', name: 'Planted a Sapling Tree', impact: 25, category: 'conservation', description: 'Direct long-term carbon capture' },
  { id: '6', name: 'Left Electronics On Overnight', impact: -12, category: 'energy', description: 'Vampire power draw' },
  { id: '7', name: 'Recycled Paper, Glass & Metal', impact: 8, category: 'waste', description: 'Prevented raw material processing' },
  { id: '8', name: 'Used Single-Use Plastic Water Bottle', impact: -5, category: 'waste', description: 'Non-biodegradable oil byproduct' },
];

export const ActionLogger: React.FC<ActionLoggerProps> = ({ onLogAction, ecoScore }) => {
  // Form States
  const [customName, setCustomName] = useState('');
  const [customImpact, setCustomImpact] = useState<number>(10);
  const [customCategory, setCustomCategory] = useState<EcoAction['category']>('custom');
  
  // Security Feedback States
  const [submittingError, setSubmittingError] = useState<string | null>(null);
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);

  // Active Category Filters for Predefined
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');

  // Filtered predefined actions
  const filteredActions = useMemo(() => {
    if (selectedFilterCategory === 'all') return PREDEFINED_ACTIONS;
    return PREDEFINED_ACTIONS.filter(act => act.category === selectedFilterCategory);
  }, [selectedFilterCategory]);

  // Security Mandate: Strict Santization and Input Validation
  const sanitizeAndValidate = useCallback((nameInput: string, impactInput: number): { ok: boolean; sanitizedName: string; sanitizedImpact: number; error?: string } => {
    // 1. Strip HTML Tags to prevent XSS injection
    let cleanName = nameInput.replace(/<[^>]*>/g, '').trim();

    // 2. Extra Sanitization: Remove other dangerous scripts/characters
    cleanName = cleanName.replace(/[&"'/<>`=]/g, '').trim();

    // 3. Length Constraints
    if (cleanName.length === 0) {
      return { ok: false, sanitizedName: '', sanitizedImpact: 0, error: 'Activity name cannot be empty.' };
    }
    if (cleanName.length > 60) {
      cleanName = cleanName.slice(0, 60) + '...';
    }

    // 4. Secure Score Clamping
    // Prevent state poisoning from extremely high or fractional inputs (e.g. +999999 or NaN)
    let parsedImpact = Math.round(Number(impactInput));
    if (isNaN(parsedImpact)) {
      return { ok: false, sanitizedName: cleanName, sanitizedImpact: 0, error: 'Impact carbon score must be a valid integer.' };
    }

    // Strict boundary rules: Clamp custom impact between -50 and +50 points
    // This maintains game balance and avoids malicious inputs crashing state boundary scores
    if (parsedImpact < -50) {
      parsedImpact = -50;
    } else if (parsedImpact > 50) {
      parsedImpact = 50;
    }

    return {
      ok: true,
      sanitizedName: cleanName,
      sanitizedImpact: parsedImpact
    };
  }, []);

  // Quick Action Logger handler
  const handleQuickLog = useCallback((action: EcoAction) => {
    // Audit before logging even if predefined to double-verify security
    onLogAction({
      name: action.name,
      impact: action.impact,
      category: action.category,
      description: action.description
    });
    
    // Clear flash notices
    setSecurityNotice(`Instantly logged quick action: "${action.name}" (${action.impact > 0 ? '+' : ''}${action.impact})`);
    setTimeout(() => setSecurityNotice(null), 3000);
  }, [onLogAction]);

  // Custom Form Submission handler
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingError(null);
    setSecurityNotice(null);

    const validationResult = sanitizeAndValidate(customName, customImpact);

    if (!validationResult.ok) {
      setSubmittingError(validationResult.error ?? 'Invalid state logging input.');
      return;
    }

    // Log the sanitized safe action
    onLogAction({
      name: validationResult.sanitizedName,
      impact: validationResult.sanitizedImpact,
      category: customCategory,
      description: `User custom impact logged securely as: ${customCategory.toUpperCase()}`
    });

    // Provide visual assurance of sanitation
    setSecurityNotice(`Securely Sanitized & Logged: "${validationResult.sanitizedName}" (${validationResult.sanitizedImpact > 0 ? '+' : ''}${validationResult.sanitizedImpact})`);
    
    // Reset Form safely
    setCustomName('');
    setCustomImpact(10);
    setCustomCategory('custom');
    
    setTimeout(() => {
      setSecurityNotice(null);
    }, 4500);

  }, [customName, customImpact, customCategory, onLogAction, sanitizeAndValidate]);

  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm h-full" id="action-logger-container">
      <div>
        <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">Input Dashboard</span>
        <h3 className="text-lg font-sans font-semibold text-slate-800">🌳 Record Climate Activities</h3>
        <p className="text-xs text-slate-400 mt-1">Actions instantly modify the health of your digital island.</p>
      </div>

      {/* Security Feedback banner */}
      {securityNotice && (
        <div 
          className="p-3 text-xs bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex items-center gap-2 animate-fade-in" 
          role="status"
          aria-live="polite"
        >
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{securityNotice}</span>
        </div>
      )}

      {submittingError && (
        <div 
          className="p-3 text-xs bg-rose-50 text-rose-800 rounded-xl border border-rose-100 flex items-center gap-2 animate-pulse" 
          role="alert"
          aria-live="assertive"
        >
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          <span><strong>Input Blocked:</strong> {submittingError}</span>
        </div>
      )}

      {/* Section 1: Predefined Quick Log Buttons */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-sans font-medium text-slate-700">Quick Log Panel</h4>
          {/* Quick Filter tabs */}
          <div className="flex gap-1" role="tablist" aria-label="Quick Action Categories">
            {['all', 'transport', 'food', 'conservation'].map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={selectedFilterCategory === cat}
                tabIndex={0}
                onClick={() => setSelectedFilterCategory(cat)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedFilterCategory(cat);
                  }
                }}
                className={`text-[10px] uppercase font-mono px-2 py-1 rounded-md border transition-all duration-150 capitalize cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  selectedFilterCategory === cat 
                    ? 'bg-slate-800 text-white border-transparent shadow-sm' 
                    : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                }`}
                id={`tab-filter-${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* CSS grid buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" max-h-56="true" style={{ maxHeight: '240px', overflowY: 'auto' }}>
          {filteredActions.map((action) => {
            const isPositive = action.impact > 0;
            return (
              <button
                key={action.id}
                onClick={() => handleQuickLog(action)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleQuickLog(action);
                  }
                }}
                aria-label={`Log ${action.name}. Impact is ${action.impact > 0 ? 'plus' : 'minus'} ${Math.abs(action.impact)} points`}
                className={`p-3 text-left rounded-xl border border-dashed text-xs transition-all duration-200 flex flex-col justify-between items-stretch gap-1 group/btn cursor-pointer focus:outline-none focus:ring-2 ${
                  isPositive 
                    ? 'bg-emerald-50/40 hover:bg-emerald-50 border-emerald-100 hover:border-emerald-300 hover:shadow-xs' 
                    : 'bg-rose-50/20 hover:bg-rose-50/60 border-rose-100 hover:border-rose-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-1 w-full">
                  <span className="font-sans font-medium text-slate-700 transition-colors group-hover/btn:text-slate-900 line-clamp-1">
                    {action.name}
                  </span>
                  <span className={`text-2xs uppercase font-mono tracking-wider shrink-0 px-1.5 py-0.5 rounded ${
                    action.category === 'transport' ? 'bg-indigo-100/55 text-indigo-700' :
                    action.category === 'food' ? 'bg-amber-100/50 text-amber-700' :
                    action.category === 'conservation' ? 'bg-emerald-100/60 text-emerald-800' :
                    'bg-slate-100/60 text-slate-600'
                  }`}>
                    {action.category}
                  </span>
                </div>
                <div className="flex items-center justify-between w-full mt-1">
                  <span className="text-[10px] text-slate-400 line-clamp-1">{action.description}</span>
                  <span className={`font-mono text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPositive ? `+${action.impact}` : action.impact}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100 my-1" />

      {/* Section 2: Custom Activity Form with Security Sanitize logic */}
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-3" aria-label="Custom Activity Registration Form">
        <span className="text-sm font-sans font-medium text-slate-700">Custom Log Entry Form</span>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Action Title Input */}
          <div className="flex flex-col gap-1">
            <label htmlFor="custom-action-name" className="text-2xs font-mono text-slate-400 uppercase">
              Activity Name <span className="text-red-500">*</span>
            </label>
            <input
              id="custom-action-name"
              type="text"
              required
              placeholder="e.g. Composted compostable waste"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              maxLength={70}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-sans"
            />
          </div>

          {/* Action Impact Input */}
          <div className="flex flex-col gap-1">
            <label htmlFor="custom-action-impact" className="text-2xs font-mono text-slate-400 uppercase">
              Impact Score (-50 to +50)
            </label>
            <div className="relative flex items-center">
              <input
                id="custom-action-impact"
                type="number"
                min={-50}
                max={50}
                step={1}
                required
                value={customImpact}
                onChange={(e) => setCustomImpact(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-mono"
              />
              <span className={`absolute right-3 text-2xs font-bold leading-none ${customImpact > 0 ? 'text-emerald-600' : customImpact < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {customImpact > 0 ? '👍 Green Benefit' : customImpact < 0 ? '🚘 Carbon Cost' : 'Neutral'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          {/* Category Dropdown Selection */}
          <div className="flex flex-col gap-1">
            <label htmlFor="custom-action-category" className="text-2xs font-mono text-slate-400 uppercase">
              Classification Category
            </label>
            <select
              id="custom-action-category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value as EcoAction['category'])}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all capitalize font-sans"
            >
              <option value="custom">Custom Entry</option>
              <option value="transport">Transportation</option>
              <option value="food">Diet & Food</option>
              <option value="energy">Home & Energy</option>
              <option value="waste">Waste Management</option>
              <option value="conservation">Conservation / Offsetting</option>
            </select>
          </div>

          {/* Submission Button */}
          <button
            type="submit"
            aria-label="Securely submit custom climate activity"
            className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-sans font-medium transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Securely Submit Custom Log</span>
          </button>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
            <span>XSS Filter Active</span>
          </div>
          <span className="text-[10px] text-slate-300">|</span>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
            <span>Scores restricted safely between -50 and +50 points</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ActionLogger;
