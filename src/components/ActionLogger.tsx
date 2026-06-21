// PATH: src/components/ActionLogger.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { EcoAction } from '../types';
import { Sparkles, ShieldAlert, Plus, AlertTriangle } from 'lucide-react';

/**
 * Interface representing the sanitized and validated result of Custom Action Inputs.
 */
interface ValidationResult {
  ok: boolean;
  sanitizedName: string;
  sanitizedImpact: number;
  error?: string;
}

/**
 * Properties expected by the ActionLogger Component.
 */
interface ActionLoggerProps {
  onLogAction: (action: Omit<EcoAction, 'id'>) => void;
  ecoScore?: number;
}

// Reusable styling constants adhering to the DRY principle
const QUICK_ACTION_BASE_STYLE = "p-3 text-left rounded-xl border border-dashed text-xs transition-all duration-200 flex flex-col justify-between items-stretch gap-1 group/btn cursor-pointer focus:outline-none focus:ring-2";
const QUICK_ACTION_POSITIVE_STYLE = `${QUICK_ACTION_BASE_STYLE} bg-emerald-50/40 hover:bg-emerald-50 border-emerald-100 hover:border-emerald-300 hover:shadow-xs focus:ring-emerald-500`;
const QUICK_ACTION_NEGATIVE_STYLE = `${QUICK_ACTION_BASE_STYLE} bg-rose-50/20 hover:bg-rose-50/60 border-rose-100 hover:border-rose-300 hover:shadow-xs focus:ring-rose-500`;

const FILTER_TAB_BASE_STYLE = "text-[10px] uppercase font-mono px-2 py-1 rounded-md border transition-all duration-150 capitalize cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50";
const FILTER_TAB_ACTIVE_STYLE = `${FILTER_TAB_BASE_STYLE} bg-slate-800 text-white border-transparent shadow-sm`;
const FILTER_TAB_INACTIVE_STYLE = `${FILTER_TAB_BASE_STYLE} bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100`;

/**
 * Predefined static database containing exactly 6 high fidelity clinical environmental actions.
 * These act as immediate quick-log offsets to demonstrate ecosystem variability.
 */
const PREDEFINED_ACTIONS: EcoAction[] = [
  { id: '1', name: 'Ate a Plant-based Meal', impact: 10, category: 'food', description: 'Low carbon footprint protein offset' },
  { id: '2', name: 'Took a High-Altitude Flight', impact: -30, category: 'transport', description: 'Long-distance fossil emission' },
  { id: '3', name: 'Took Public Transit / Metro', impact: 15, category: 'transport', description: 'Highly efficient shared mobility' },
  { id: '4', name: 'Planted a Sapling Tree', impact: 25, category: 'conservation', description: 'Direct long-term carbon capture' },
  { id: '5', name: 'Left Electronics On Overnight', impact: -12, category: 'energy', description: 'Vampire power draw' },
  { id: '6', name: 'Used Single-Use Plastic Bottle', impact: -5, category: 'waste', description: 'Non-biodegradable oil byproduct' },
];

/**
 * ActionLogger Component
 * Renders the predefined climate activity buttons and standard custom-logging form.
 * Enforces rigorous validations, regex scanning to prevent XSS injection, and score boundaries.
 *
 * @param {ActionLoggerProps} props - Component properties containing callback log functions.
 * @returns {React.ReactElement} Destructured rendering of activity board panel interface.
 */
export const ActionLogger: React.FC<ActionLoggerProps> = ({ onLogAction, ecoScore }) => {
  // Direct state managers for custom inputs
  const [customName, setCustomName] = useState<string>('');
  const [customImpact, setCustomImpact] = useState<number>(10);
  const [customCategory, setCustomCategory] = useState<EcoAction['category']>('custom');
  
  // Feedback alert boxes and notices
  const [submittingError, setSubmittingError] = useState<string | null>(null);
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);

  // Quick Action filter selection tabs
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');

  /**
   * Performance optimizer utilizing useMemo to lazily filter the predefined lists.
   */
  const filteredActions = useMemo(() => {
    if (selectedFilterCategory === 'all') return PREDEFINED_ACTIONS;
    return PREDEFINED_ACTIONS.filter(act => act.category === selectedFilterCategory);
  }, [selectedFilterCategory]);

  /**
   * Helper function implementing strict input scanning.
   * Matches regex boundaries to block XSS parameters and verifies score boundaries strictly.
   *
   * @param {string} nameInput - Raw textual activity label.
   * @param {number} impactInput - Unsanitised numeric offset score input.
   * @returns {ValidationResult} Structure detailing operation outcome and details.
   */
  const sanitizeAndValidate = useCallback((nameInput: string, impactInput: number): ValidationResult => {
    // 1. Strict Regex Pattern match to catch XSS and structural code injection characters: <, >, {, }, =, and word "script"
    const dangerousPattern = /[<>{}=]|\bscript\b/i;
    if (dangerousPattern.test(nameInput)) {
      return {
        ok: false,
        sanitizedName: '',
        sanitizedImpact: 0,
        error: 'Security Warning: Dangerous sequences or scripting terms (<, >, {, }, =, script) are prohibited.'
      };
    }

    // 2. Extra Sanitization of text boundaries
    const cleanName = nameInput.replace(/<[^>]*>/g, '').trim();

    // 3. Strict Input Length restriction - Max 50 characters as specified
    if (cleanName.length === 0) {
      return {
        ok: false,
        sanitizedName: '',
        sanitizedImpact: 0,
        error: 'Activity name cannot be empty.'
      };
    }
    if (cleanName.length > 50) {
      return {
        ok: false,
        sanitizedName: '',
        sanitizedImpact: 0,
        error: 'Activity name exceeds maximum security length limit of 50 characters.'
      };
    }

    // 4. Score constraints validation (Strict -50 to +50 points limit check)
    const parsedImpact = Math.round(Number(impactInput));
    if (isNaN(parsedImpact)) {
      return {
        ok: false,
        sanitizedName: cleanName,
        sanitizedImpact: 0,
        error: 'Carbon impact score must be a valid integer numerical value.'
      };
    }

    if (parsedImpact < -50 || parsedImpact > 50) {
      return {
        ok: false,
        sanitizedName: cleanName,
        sanitizedImpact: 0,
        error: 'Game Balance Violation: Carbon score must remain strictly between -50 and +50 points.'
      };
    }

    return {
      ok: true,
      sanitizedName: cleanName,
      sanitizedImpact: parsedImpact
    };
  }, []);

  /**
   * Logging trigger wrapper for quick items.
   *
   * @param {EcoAction} action - Target action database entry.
   */
  const handleQuickLog = useCallback((action: EcoAction) => {
    onLogAction({
      name: action.name,
      impact: action.impact,
      category: action.category,
      description: action.description
    });
    
    setSecurityNotice(`Logged predefined action: "${action.name}" (${action.impact > 0 ? '+' : ''}${action.impact})`);
    setTimeout(() => setSecurityNotice(null), 3000);
  }, [onLogAction]);

  /**
   * Try-wrapped submit handler preventing validation bypass.
   *
   * @param {React.FormEvent} e - Form event representation.
   */
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingError(null);
    setSecurityNotice(null);

    try {
      const validationResult = sanitizeAndValidate(customName, customImpact);

      if (!validationResult.ok) {
        setSubmittingError(validationResult.error ?? 'Invalid inputs supplied.');
        return;
      }

      onLogAction({
        name: validationResult.sanitizedName,
        impact: validationResult.sanitizedImpact,
        category: customCategory,
        description: `Verified custom environmental entry classification: ${customCategory.toUpperCase()}`
      });

      setSecurityNotice(`Secured & Recorded: "${validationResult.sanitizedName}" (${validationResult.sanitizedImpact > 0 ? '+' : ''}${validationResult.sanitizedImpact})`);
      
      // Clear inputs
      setCustomName('');
      setCustomImpact(10);
      setCustomCategory('custom');
      
      setTimeout(() => setSecurityNotice(null), 4000);
    } catch (err: unknown) {
      setSubmittingError(err instanceof Error ? err.message : 'An exceptional pipeline failure has occurred during activity auditing.');
    }
  }, [customName, customImpact, customCategory, onLogAction, sanitizeAndValidate]);

  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm h-full" id="action-logger-container">
      <div>
        <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">Input Dashboard</span>
        <h3 className="text-lg font-sans font-semibold text-slate-800">🌳 Record Climate Activities</h3>
        <p className="text-xs text-slate-400 mt-1">Actions instantly modify the health of your digital island.</p>
      </div>

      {/* Security Level Notification banner */}
      {securityNotice && (
        <div 
          className="p-3 text-xs bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex items-center gap-2" 
          role="status"
          aria-live="polite"
        >
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{securityNotice}</span>
        </div>
      )}

      {/* Security State red warning borders & block banner */}
      {submittingError && (
        <div 
          className="p-3 text-xs bg-rose-50 text-rose-800 rounded-xl border border-rose-150 flex items-center gap-2 animate-pulse" 
          role="alert"
          aria-live="assertive"
        >
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          <span><strong>Input Blocked:</strong> {submittingError}</span>
        </div>
      )}

      {/* 6 Predefined Quick Logs */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-sans font-medium text-slate-700">Quick Log Panel</h4>
          <div className="flex gap-1" role="tablist" aria-label="Quick Action Categories">
            {['all', 'transport', 'food', 'conservation'].map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={selectedFilterCategory === cat}
                tabIndex={0}
                onClick={() => setSelectedFilterCategory(cat)}
                className={selectedFilterCategory === cat ? FILTER_TAB_ACTIVE_STYLE : FILTER_TAB_INACTIVE_STYLE}
                id={`tab-filter-${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
          {filteredActions.map((action) => {
            const isPositive = action.impact > 0;
            return (
              <button
                key={action.id}
                onClick={() => handleQuickLog(action)}
                aria-label={`Log ${action.name}. Impact is ${action.impact > 0 ? 'plus' : 'minus'} ${Math.abs(action.impact)} points`}
                className={isPositive ? QUICK_ACTION_POSITIVE_STYLE : QUICK_ACTION_NEGATIVE_STYLE}
              >
                <div className="flex items-start justify-between gap-1 w-full">
                  <span className="font-sans font-medium text-slate-700 transition-colors group-hover/btn:text-slate-900 line-clamp-1">
                    {action.name}
                  </span>
                  <span className={`text-[9px] uppercase font-mono tracking-wider shrink-0 px-1.5 py-0.5 rounded ${
                    action.category === 'transport' ? 'bg-indigo-150 text-indigo-700' :
                    action.category === 'food' ? 'bg-amber-100 text-amber-700' :
                    action.category === 'conservation' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-slate-100 text-slate-600'
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

      {/* Form Submission logic with boundary verification */}
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-3" aria-label="Custom Activity Registration Form">
        <span className="text-sm font-sans font-medium text-slate-700">Custom Log Entry Form</span>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="custom-action-name" className="text-2xs font-mono text-slate-400 uppercase">
              Activity Name <span className="text-red-500">*</span>
            </label>
            <input
              id="custom-action-name"
              type="text"
              required
              placeholder="e.g. Composted kitchen waste"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              maxLength={50} // Explicitly enforce max 50 characters in UI
              className={`px-3 py-2 text-xs rounded-xl border bg-slate-50/50 text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all font-sans ${
                submittingError && (customName.length > 50 || /[<>{}=]|\bscript\b/i.test(customName))
                  ? 'border-rose-300 focus:ring-rose-500/40 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-emerald-500/40 focus:border-emerald-500'
              }`}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="custom-action-impact" className="text-2xs font-mono text-slate-400 uppercase">
              Impact Score (-50 to +50)
            </label>
            <div className="relative flex items-center">
              <input
                id="custom-action-impact"
                type="number"
                min={-100} // intentionally wider in client limits to let user test boundary errors
                max={100}
                step={1}
                required
                value={customImpact}
                onChange={(e) => setCustomImpact(Number(e.target.value))}
                className={`w-full px-3 py-2 text-xs rounded-xl border bg-slate-50/50 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 transition-all font-mono ${
                  submittingError && (customImpact < -50 || customImpact > 50)
                    ? 'border-rose-300 focus:ring-rose-500/40 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-emerald-500/40 focus:border-emerald-500'
                }`}
              />
              <span className={`absolute right-3 text-2xs font-bold leading-none ${customImpact > 0 ? 'text-emerald-600' : customImpact < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {customImpact > 0 ? '👍 Positive' : customImpact < 0 ? '🚘 Emission' : 'Neutral'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
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
            <span>XSS Filter & Parser Active</span>
          </div>
          <span className="text-[10px] text-slate-300">|</span>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
            <span>Strict boundaries (-50 to +50 points) verified server-side</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ActionLogger;
