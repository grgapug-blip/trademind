import { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  BarChart3, 
  Shield, 
  Settings, 
  RotateCcw,
  Menu,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onResetDay: () => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'rules', label: 'Rules', icon: Shield },
];

export function Header({ activeTab, onTabChange, onResetDay }: HeaderProps) {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleReset = () => {
    onResetDay();
    setShowResetDialog(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#111] border-b border-[#aeaeae33] z-50">
      <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-[#111] font-bold text-sm">TM</span>
          </div>
          <span className="text-white font-semibold text-lg hidden sm:block">TradeMind</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-white/10'
                    : 'text-[#b0b0b0] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResetDialog(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-[#b0b0b0] hover:text-white transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Day
          </button>
          <button className="p-2 text-[#b0b0b0] hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#b0b0b0] hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-[#1d1d1d] border-t border-[#aeaeae33] py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white bg-white/10'
                    : 'text-[#b0b0b0] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
          <button
            onClick={() => {
              setShowResetDialog(true);
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#b0b0b0] hover:text-white hover:bg-white/5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Day
          </button>
        </nav>
      )}

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="bg-[#1d1d1d] border-[#aeaeae33] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Reset Trading Day?</DialogTitle>
            <DialogDescription className="text-[#b0b0b0]">
              This will clear all today's trades and reset your daily stats. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <button
              onClick={() => setShowResetDialog(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="btn-danger flex-1"
            >
              Reset Day
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
