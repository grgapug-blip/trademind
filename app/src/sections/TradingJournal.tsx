import { useState } from 'react';
import { Plus, Trash2, X, Check, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Trade } from '@/types';

interface TradingJournalProps {
  trades: Trade[];
  openTrades: Trade[];
  onAddTrade: (trade: Partial<Trade>) => void;
  onCloseTrade: (tradeId: string, exitPrice: number, notes?: string) => void;
  onDeleteTrade: (tradeId: string) => void;
  canTrade: boolean;
  cantTradeReason: string;
  currentEmotionalState: number;
}

export function TradingJournal({
  trades,
  openTrades: _openTrades,
  onAddTrade,
  onCloseTrade,
  onDeleteTrade,
  canTrade,
  cantTradeReason,
  currentEmotionalState,
}: TradingJournalProps) {
  // _openTrades is available for future use (e.g., showing open trades count)
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'winners' | 'losers'>('all');

  // Form state
  const [formData, setFormData] = useState({
    symbol: '',
    direction: 'long' as 'long' | 'short',
    entryPrice: '',
    position: '',
    setupType: '',
    notes: '',
  });

  const [closeFormData, setCloseFormData] = useState({
    exitPrice: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTrade({
      symbol: formData.symbol.toUpperCase(),
      direction: formData.direction,
      entryPrice: parseFloat(formData.entryPrice),
      position: parseFloat(formData.position),
      setupType: formData.setupType,
      notes: formData.notes,
    });
    setFormData({
      symbol: '',
      direction: 'long',
      entryPrice: '',
      position: '',
      setupType: '',
      notes: '',
    });
    setShowAddModal(false);
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTrade) {
      onCloseTrade(selectedTrade.id, parseFloat(closeFormData.exitPrice), closeFormData.notes);
      setCloseFormData({ exitPrice: '', notes: '' });
      setSelectedTrade(null);
      setShowCloseModal(false);
    }
  };

  const openCloseModal = (trade: Trade) => {
    setSelectedTrade(trade);
    setShowCloseModal(true);
  };

  const filteredTrades = trades.filter((trade) => {
    switch (filter) {
      case 'open':
        return trade.status === 'open';
      case 'closed':
        return trade.status === 'closed';
      case 'winners':
        return trade.status === 'closed' && trade.pnl !== null && trade.pnl > 0;
      case 'losers':
        return trade.status === 'closed' && trade.pnl !== null && trade.pnl < 0;
      default:
        return true;
    }
  });

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="dashboard-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="section-title mb-1">Trading Journal</h3>
          <p className="text-sm text-[#b0b0b0]">Record and review your trades</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={!canTrade}
          className={`btn-primary flex items-center gap-2 ${!canTrade ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Plus className="w-4 h-4" />
          Add Trade
        </button>
      </div>

      {!canTrade && (
        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-400">{cantTradeReason}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', 'open', 'closed', 'winners', 'losers'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-white text-[#111]'
                : 'bg-[#333] text-[#b0b0b0] hover:bg-[#444]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Trades Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#aeaeae33]">
              <th className="text-left py-3 px-2 text-xs uppercase tracking-wider text-[#b0b0b0] font-medium">Time</th>
              <th className="text-left py-3 px-2 text-xs uppercase tracking-wider text-[#b0b0b0] font-medium">Symbol</th>
              <th className="text-left py-3 px-2 text-xs uppercase tracking-wider text-[#b0b0b0] font-medium">Dir</th>
              <th className="text-left py-3 px-2 text-xs uppercase tracking-wider text-[#b0b0b0] font-medium">Entry</th>
              <th className="text-left py-3 px-2 text-xs uppercase tracking-wider text-[#b0b0b0] font-medium">Exit</th>
              <th className="text-left py-3 px-2 text-xs uppercase tracking-wider text-[#b0b0b0] font-medium">P&L</th>
              <th className="text-left py-3 px-2 text-xs uppercase tracking-wider text-[#b0b0b0] font-medium">Setup</th>
              <th className="text-left py-3 px-2 text-xs uppercase tracking-wider text-[#b0b0b0] font-medium">Rules</th>
              <th className="text-left py-3 px-2 text-xs uppercase tracking-wider text-[#b0b0b0] font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-[#666]">
                  No trades found. Start by adding your first trade.
                </td>
              </tr>
            ) : (
              filteredTrades.map((trade) => (
                <tr
                  key={trade.id}
                  className="border-b border-[#aeaeae22] hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-2 text-sm text-[#b0b0b0]">{formatTime(trade.timestamp)}</td>
                  <td className="py-3 px-2 text-sm font-medium text-white">{trade.symbol}</td>
                  <td className="py-3 px-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      trade.direction === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.direction === 'long' ? 'LONG' : 'SHORT'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm font-mono text-white">${trade.entryPrice.toFixed(2)}</td>
                  <td className="py-3 px-2 text-sm font-mono text-white">
                    {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}
                  </td>
                  <td className="py-3 px-2">
                    {trade.pnl !== null ? (
                      <span className={`flex items-center gap-1 text-sm font-mono ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trade.pnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-sm text-[#666]">Open</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-sm text-[#b0b0b0]">{trade.setupType || '-'}</td>
                  <td className="py-3 px-2">
                    {trade.rulesFollowed ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      {trade.status === 'open' && (
                        <button
                          onClick={() => openCloseModal(trade)}
                          className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors"
                        >
                          Close
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteTrade(trade.id)}
                        className="text-[#666] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Trade Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-[#1d1d1d] border-[#aeaeae33] text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add New Trade</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-small mb-2 block">Symbol</label>
                <input
                  type="text"
                  required
                  placeholder="AAPL"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="input-dark w-full"
                />
              </div>
              <div>
                <label className="label-small mb-2 block">Direction</label>
                <select
                  value={formData.direction}
                  onChange={(e) => setFormData({ ...formData, direction: e.target.value as 'long' | 'short' })}
                  className="input-dark w-full"
                >
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-small mb-2 block">Entry Price</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="150.00"
                  value={formData.entryPrice}
                  onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                  className="input-dark w-full"
                />
              </div>
              <div>
                <label className="label-small mb-2 block">Position Size</label>
                <input
                  type="number"
                  required
                  placeholder="100"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="input-dark w-full"
                />
              </div>
            </div>
            <div>
              <label className="label-small mb-2 block">Setup Type</label>
              <input
                type="text"
                placeholder="e.g., Breakout, Pullback, Reversal"
                value={formData.setupType}
                onChange={(e) => setFormData({ ...formData, setupType: e.target.value })}
                className="input-dark w-full"
              />
            </div>
            <div>
              <label className="label-small mb-2 block">Notes</label>
              <textarea
                rows={3}
                placeholder="Any observations about the setup..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-dark w-full resize-none"
              />
            </div>
            <div className="flex items-center gap-2 p-3 bg-[#111] rounded-lg">
              <span className="text-sm text-[#b0b0b0]">Current Emotional State:</span>
              <span className={`text-sm font-medium ${
                currentEmotionalState >= 7 ? 'text-green-500' :
                currentEmotionalState >= 4 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {currentEmotionalState}/10
              </span>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                Add Trade
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Close Trade Modal */}
      <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
        <DialogContent className="bg-[#1d1d1d] border-[#aeaeae33] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Close Trade</DialogTitle>
          </DialogHeader>
          {selectedTrade && (
            <form onSubmit={handleCloseSubmit} className="space-y-4 mt-4">
              <div className="p-3 bg-[#111] rounded-lg">
                <p className="text-sm text-[#b0b0b0]">
                  {selectedTrade.symbol} {selectedTrade.direction.toUpperCase()} @ ${selectedTrade.entryPrice.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="label-small mb-2 block">Exit Price</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="155.00"
                  value={closeFormData.exitPrice}
                  onChange={(e) => setCloseFormData({ ...closeFormData, exitPrice: e.target.value })}
                  className="input-dark w-full"
                />
              </div>
              <div>
                <label className="label-small mb-2 block">Closing Notes</label>
                <textarea
                  rows={3}
                  placeholder="What happened? Lessons learned..."
                  value={closeFormData.notes}
                  onChange={(e) => setCloseFormData({ ...closeFormData, notes: e.target.value })}
                  className="input-dark w-full resize-none"
                />
              </div>
              <div className="flex items-center gap-2 p-3 bg-[#111] rounded-lg">
                <span className="text-sm text-[#b0b0b0]">Current Emotional State:</span>
                <span className={`text-sm font-medium ${
                  currentEmotionalState >= 7 ? 'text-green-500' :
                  currentEmotionalState >= 4 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {currentEmotionalState}/10
                </span>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Close Trade
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
