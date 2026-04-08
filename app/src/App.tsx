import { useState, useCallback } from 'react';
import { Header } from './sections/Header';
import { KeyMetrics } from './sections/KeyMetrics';
import { CooldownTimer } from './sections/CooldownTimer';
import { EmotionalTracker } from './sections/EmotionalTracker';
import { TradingJournal } from './sections/TradingJournal';
import { RulesTracker } from './sections/RulesTracker';
import { PreTradeChecklist } from './sections/PreTradeChecklist';
import { Analytics } from './sections/Analytics';
import { useDashboard } from './hooks/useDashboard';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const {
    trades,
    dailyStats,
    emotionalHistory,
    rules,
    cooldown,
    streak,
    bestStreak,
    currentEmotionalState,
    showPreTradeModal,
    canTrade,
    cantTradeReason,
    disciplineScore,
    openTrades,
    updateEmotionalState,
    cancelCooldown,
    initiateTrade,
    confirmTrade,
    closeTrade,
    deleteTrade,
    resetDay,
    setShowPreTradeModal,
  } = useDashboard();

  const handleAddTrade = useCallback((trade: Parameters<typeof initiateTrade>[0]) => {
    const success = initiateTrade(trade);
    if (!success) {
      toast.error(cantTradeReason || 'Cannot trade at this time');
    }
  }, [initiateTrade, cantTradeReason]);

  const handleConfirmTrade = useCallback((checklist: Parameters<typeof confirmTrade>[0]) => {
    confirmTrade(checklist);
    toast.success('Trade added successfully');
  }, [confirmTrade]);

  const handleCloseTrade = useCallback((tradeId: string, exitPrice: number, notes?: string) => {
    closeTrade(tradeId, exitPrice, notes);
    toast.success('Trade closed');
  }, [closeTrade]);

  const handleDeleteTrade = useCallback((tradeId: string) => {
    deleteTrade(tradeId);
    toast.success('Trade deleted');
  }, [deleteTrade]);

  const handleResetDay = useCallback(() => {
    resetDay();
    toast.success('Day reset successfully');
  }, [resetDay]);

  const handleToggleRule = useCallback((_ruleId: string) => {
    // This would toggle rule enabled state
    toast.info('Rule toggled');
  }, []);

  const handleEmotionalChange = useCallback((rating: number) => {
    updateEmotionalState(rating);
    if (rating < 6) {
      toast.warning('Your emotional state is low. Consider taking a break.', {
        duration: 5000,
      });
    }
  }, [updateEmotionalState]);

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <KeyMetrics
        disciplineScore={disciplineScore}
        tradesTaken={dailyStats.tradesTaken}
        maxTrades={dailyStats.maxTrades}
        streak={streak}
        bestStreak={bestStreak}
        emotionalState={currentEmotionalState}
        pnl={dailyStats.pnl}
        canTrade={canTrade}
        cantTradeReason={cantTradeReason}
      />
      
      <CooldownTimer
        isActive={cooldown.active}
        endTime={cooldown.endTime}
        duration={cooldown.duration}
        reason={cooldown.reason}
        onCancel={cancelCooldown}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmotionalTracker
          currentRating={currentEmotionalState}
          onRatingChange={handleEmotionalChange}
          history={emotionalHistory}
        />
        <TradingJournal
          trades={trades.slice(0, 5)}
          openTrades={openTrades}
          onAddTrade={handleAddTrade}
          onCloseTrade={handleCloseTrade}
          onDeleteTrade={handleDeleteTrade}
          canTrade={canTrade}
          cantTradeReason={cantTradeReason}
          currentEmotionalState={currentEmotionalState}
        />
      </div>
    </div>
  );

  const renderJournal = () => (
    <div className="animate-fade-in">
      <TradingJournal
        trades={trades}
        openTrades={openTrades}
        onAddTrade={handleAddTrade}
        onCloseTrade={handleCloseTrade}
        onDeleteTrade={handleDeleteTrade}
        canTrade={canTrade}
        cantTradeReason={cantTradeReason}
        currentEmotionalState={currentEmotionalState}
      />
    </div>
  );

  const renderAnalytics = () => (
    <div className="animate-fade-in">
      <Analytics trades={trades} disciplineScore={disciplineScore} />
    </div>
  );

  const renderRules = () => (
    <div className="animate-fade-in">
      <RulesTracker rules={rules} onToggleRule={handleToggleRule} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#111]">
      <Header activeTab={activeTab} onTabChange={setActiveTab} onResetDay={handleResetDay} />
      
      <main className="pt-16">
        {/* Daily Status Banner */}
        <div className="bg-gradient-to-r from-[#1d1d1d] to-[#252525] border-b border-[#aeaeae33]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#b0b0b0]">Today</p>
                  <p className="text-white font-medium">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="h-8 w-px bg-[#aeaeae33] hidden sm:block" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#b0b0b0]">Session Status</p>
                  <p className={`font-medium ${canTrade ? 'text-green-500' : 'text-red-500'}`}>
                    {canTrade ? 'Active - Can Trade' : 'Restricted'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-[#b0b0b0]">Trades Today</p>
                  <p className="text-white font-mono">
                    {dailyStats.tradesTaken} / {dailyStats.maxTrades}
                  </p>
                </div>
                <div className="h-8 w-px bg-[#aeaeae33]" />
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-[#b0b0b0]">P&L</p>
                  <p className={`font-mono font-medium ${dailyStats.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {dailyStats.pnl >= 0 ? '+' : ''}${dailyStats.pnl.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'journal' && renderJournal()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'rules' && renderRules()}
        </div>
      </main>

      {/* Pre-Trade Checklist Modal */}
      <PreTradeChecklist
        isOpen={showPreTradeModal}
        onClose={() => setShowPreTradeModal(false)}
        onConfirm={handleConfirmTrade}
      />

      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1d1d1d',
            border: '1px solid #aeaeae33',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default App;
