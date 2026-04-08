import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, ClipboardCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PreTradeChecklist as PreTradeChecklistType } from '@/types';

interface PreTradeChecklistProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (checklist: PreTradeChecklistType) => void;
}

const checklistItems = [
  {
    key: 'validSetup' as const,
    label: 'I have a valid setup according to my trading plan',
    description: 'The trade meets all my entry criteria',
  },
  {
    key: 'knowsPrices' as const,
    label: 'I know my entry, stop loss, and target prices',
    description: 'All price levels are clearly defined before entering',
  },
  {
    key: 'positionSizeOk' as const,
    label: 'My position size follows my risk management rules',
    description: 'Risk per trade is within my acceptable limits',
  },
  {
    key: 'notFomoOrRevenge' as const,
    label: 'I am not trading out of FOMO or revenge',
    description: 'This trade is based on analysis, not emotions',
  },
  {
    key: 'emotionalStateOk' as const,
    label: 'My emotional state is calm (rating 6 or higher)',
    description: 'I am in the right mental state to make decisions',
  },
];

export function PreTradeChecklist({ isOpen, onClose, onConfirm }: PreTradeChecklistProps) {
  const [checklist, setChecklist] = useState<PreTradeChecklistType>({
    validSetup: false,
    knowsPrices: false,
    positionSizeOk: false,
    notFomoOrRevenge: false,
    emotionalStateOk: false,
  });

  const allChecked = Object.values(checklist).every(Boolean);
  const checkedCount = Object.values(checklist).filter(Boolean).length;

  const toggleItem = (key: keyof PreTradeChecklistType) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirm = () => {
    onConfirm(checklist);
    // Reset checklist after confirmation
    setChecklist({
      validSetup: false,
      knowsPrices: false,
      positionSizeOk: false,
      notFomoOrRevenge: false,
      emotionalStateOk: false,
    });
  };

  const handleClose = () => {
    onClose();
    // Reset checklist after closing
    setChecklist({
      validSetup: false,
      knowsPrices: false,
      positionSizeOk: false,
      notFomoOrRevenge: false,
      emotionalStateOk: false,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1d1d1d] border-[#aeaeae33] text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-400" />
            Pre-Trade Checklist
          </DialogTitle>
          <DialogDescription className="text-[#b0b0b0]">
            Take 30 seconds. Save your account. Check each item before confirming your trade.
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[#b0b0b0]">Progress</span>
            <span className="text-white font-medium">{checkedCount} of 5</span>
          </div>
          <div className="w-full h-2 bg-[#333] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                allChecked ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${(checkedCount / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-3 mt-6">
          {checklistItems.map((item) => {
            const isChecked = checklist[item.key];
            return (
              <button
                key={item.key}
                onClick={() => toggleItem(item.key)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                  isChecked
                    ? 'bg-green-500/10 border-green-500/50'
                    : 'bg-[#111] border-[#aeaeae33] hover:border-[#aeaeae55]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      isChecked ? 'bg-green-500' : 'border-2 border-[#555]'
                    }`}
                  >
                    {isChecked && <CheckCircle className="w-4 h-4 text-[#111]" />}
                  </div>
                  <div>
                    <p className={`font-medium ${isChecked ? 'text-green-400' : 'text-white'}`}>
                      {item.label}
                    </p>
                    <p className="text-sm text-[#888] mt-1">{item.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Warning if not all checked */}
        {!allChecked && checkedCount > 0 && (
          <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mt-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-400">
              Not all items are checked. Taking trades without completing this checklist may result in rule violations.
            </p>
          </div>
        )}

        <DialogFooter className="gap-3 mt-6">
          <button onClick={handleClose} className="btn-secondary flex-1">
            Cancel Trade
          </button>
          <button
            onClick={handleConfirm}
            disabled={!allChecked}
            className={`flex-1 flex items-center justify-center gap-2 ${
              allChecked ? 'btn-success' : 'bg-[#333] text-[#666] cursor-not-allowed px-6 py-3 rounded font-medium'
            }`}
          >
            {allChecked ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Confirm Trade
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Check All Items
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
