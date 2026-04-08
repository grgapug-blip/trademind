import { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, AlertTriangle, CheckCircle, Activity, Target, Brain } from 'lucide-react';
import type { Rule } from '@/types';

interface RulesTrackerProps {
  rules: Rule[];
  onToggleRule: (ruleId: string) => void;
}

const categoryConfig = {
  daily_limits: {
    label: 'Daily Limits',
    icon: Target,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  emotional: {
    label: 'Emotional Rules',
    icon: Brain,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  technical: {
    label: 'Technical Rules',
    icon: Activity,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
};

export function RulesTracker({ rules, onToggleRule }: RulesTrackerProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    daily_limits: true,
    emotional: true,
    technical: true,
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const rulesByCategory = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, Rule[]>);

  const totalViolations = rules.reduce((sum, rule) => sum + rule.violationsToday, 0);
  const totalViolationsAllTime = rules.reduce((sum, rule) => sum + rule.violationsTotal, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="section-title mb-1">Rules & Violations</h3>
            <p className="text-sm text-[#b0b0b0]">Track your trading rules and violations</p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#111] rounded-lg">
            <p className="label-small mb-1">Today&apos;s Violations</p>
            <p className={`text-3xl font-semibold font-mono ${totalViolations > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {totalViolations}
            </p>
          </div>
          <div className="p-4 bg-[#111] rounded-lg">
            <p className="label-small mb-1">All-Time Violations</p>
            <p className="text-3xl font-semibold font-mono text-[#b0b0b0]">
              {totalViolationsAllTime}
            </p>
          </div>
        </div>
        
        {totalViolations > 0 && (
          <div className="flex items-center gap-3 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-400">
              You have {totalViolations} violation{totalViolations > 1 ? 's' : ''} today. Review your rules and stay disciplined.
            </p>
          </div>
        )}
      </div>

      {/* Rules by Category */}
      {(Object.keys(rulesByCategory) as Array<keyof typeof categoryConfig>).map((category) => {
        const config = categoryConfig[category];
        const Icon = config.icon;
        const categoryRules = rulesByCategory[category] || [];
        const isExpanded = expandedCategories[category];
        const categoryViolations = categoryRules.reduce((sum, rule) => sum + rule.violationsToday, 0);

        return (
          <div key={category} className="dashboard-card p-0 overflow-hidden">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-white">{config.label}</p>
                  <p className="text-sm text-[#b0b0b0]">
                    {categoryRules.filter((r) => r.enabled).length} of {categoryRules.length} active
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {categoryViolations > 0 && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">
                    {categoryViolations} violations
                  </span>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-[#b0b0b0]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#b0b0b0]" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-[#aeaeae33]">
                {categoryRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-[#aeaeae22] last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onToggleRule(rule.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          rule.enabled
                            ? 'bg-green-500 border-green-500'
                            : 'border-[#555] hover:border-[#777]'
                        }`}
                      >
                        {rule.enabled && <CheckCircle className="w-3 h-3 text-[#111]" />}
                      </button>
                      <span className={`text-sm ${rule.enabled ? 'text-white' : 'text-[#666] line-through'}`}>
                        {rule.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      {rule.violationsToday > 0 && (
                        <span className="text-xs text-red-400">
                          {rule.violationsToday} today
                        </span>
                      )}
                      {rule.violationsTotal > 0 && (
                        <span className="text-xs text-[#666]">
                          {rule.violationsTotal} total
                        </span>
                      )}
                      {rule.violationsToday === 0 && rule.violationsTotal === 0 && (
                        <span className="text-xs text-green-500">Clean</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Tips Card */}
      <div className="dashboard-card bg-gradient-to-br from-[#1d1d1d] to-[#252525]">
        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          Discipline Tips
        </h4>
        <ul className="space-y-2 text-sm text-[#b0b0b0]">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">•</span>
            Review your rules before every trading session
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">•</span>
            Take a 15-minute break after any rule violation
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">•</span>
            Track violations to identify patterns in your behavior
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">•</span>
            Celebrate days with zero violations - they build discipline
          </li>
        </ul>
      </div>
    </div>
  );
}
