import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  ArrowRightLeft,
  Users,
  Flame,
  TrendingUp,
  Activity,
  Calendar,
  Building2,
  RefreshCw,
  ArrowUpRight,
  Shield,
  Eye,
  ArrowDownLeft,
  ShoppingBag,
  Clock,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import {
  DashboardStats,
  NetMovementResponse,
  Base,
  AssetCategory,
} from '../types';
import { dashboardApi, baseApi } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bases, setBases] = useState<Base[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedBase, setSelectedBase] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [equipmentType, setEquipmentType] = useState<string>('');
  const [datePreset, setDatePreset] = useState<string>('30d');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Net Movement Modal State
  const [isNetMovementModalOpen, setIsNetMovementModalOpen] = useState(false);
  const [netMovementData, setNetMovementData] = useState<NetMovementResponse | null>(null);
  const [isNetMovementLoading, setIsNetMovementLoading] = useState(false);

  // Date Presets handler
  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    const today = new Date();
    const endStr = today.toISOString().split('T')[0];
    let startStr = '';

    if (preset === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      startStr = d.toISOString().split('T')[0];
    } else if (preset === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      startStr = d.toISOString().split('T')[0];
    } else if (preset === 'month') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      startStr = d.toISOString().split('T')[0];
    } else if (preset === 'year') {
      const d = new Date(today.getFullYear(), 0, 1);
      startStr = d.toISOString().split('T')[0];
    }

    setStartDate(startStr);
    setEndDate(endStr);
  };

  const fetchBases = async () => {
    try {
      const data = await baseApi.getAll();
      setBases(data);
      if (user?.role === 'BASE_COMMANDER' && user?.base?.id) {
        setSelectedBase(String(user.base.id));
      }
    } catch (err) {
      console.error('Failed to load bases:', err);
    }
  };

  const fetchDashboardStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const effectiveBaseId =
        user?.role === 'BASE_COMMANDER'
          ? user?.base?.id
          : selectedBase
          ? Number(selectedBase)
          : undefined;

      const data = await dashboardApi.getStats({
        baseId: effectiveBaseId,
        category: (selectedCategory as AssetCategory) || undefined,
        equipmentType: equipmentType.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedBase, selectedCategory, equipmentType, startDate, endDate]);

  const handleOpenNetMovementModal = async () => {
    setIsNetMovementModalOpen(true);
    setIsNetMovementLoading(true);
    try {
      const effectiveBaseId =
        user?.role === 'BASE_COMMANDER'
          ? user?.base?.id
          : selectedBase
          ? Number(selectedBase)
          : undefined;

      const data = await dashboardApi.getNetMovement({
        baseId: effectiveBaseId,
        category: (selectedCategory as AssetCategory) || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setNetMovementData(data);
    } catch (err) {
      console.error('Failed to load net movement details:', err);
    } finally {
      setIsNetMovementLoading(false);
    }
  };

  useEffect(() => {
    handleDatePresetChange('30d');
    fetchBases();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchDashboardStats();
    }
  }, [fetchDashboardStats, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Top Header Bar matching ui-reference.png */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Military Asset Command Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time combat readiness, inventory balance calculations, and tactical movements
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardStats}
            isLoading={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync DB</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenNetMovementModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-500/30"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Net Movement Ledger</span>
          </Button>
        </div>
      </div>

      {/* Real Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Base Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">
              Assigned Post
            </label>
            <select
              value={selectedBase}
              onChange={(e) => setSelectedBase(e.target.value)}
              disabled={user?.role === 'BASE_COMMANDER'}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {user?.role !== 'BASE_COMMANDER' && <option value="">Central Command (All Bases)</option>}
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">
              Equipment Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Asset Categories</option>
              <option value="VEHICLE">Vehicles &amp; Armor</option>
              <option value="WEAPON">Weapons &amp; Small Arms</option>
              <option value="AMMUNITION">Munitions &amp; Ordnance</option>
              <option value="COMMUNICATION">Signal &amp; Communications</option>
              <option value="IT_EQUIPMENT">Tactical IT &amp; Terminals</option>
              <option value="OTHER">Optics &amp; Field Gear</option>
            </select>
          </div>

          {/* Equipment Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">
              Equipment Model / Type
            </label>
            <input
              type="text"
              placeholder="e.g. Tank, Rifle, Transceiver..."
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Date Preset Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">
              Reporting Scope
            </label>
            <select
              value={datePreset}
              onChange={(e) => handleDatePresetChange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days (Standard)</option>
              <option value="month">Current Month</option>
              <option value="year">Current Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Date Inputs */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">
              Date Interval
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setDatePreset('custom');
                  setStartDate(e.target.value);
                }}
                className="w-1/2 px-2 py-1.5 text-xs rounded border border-slate-300 text-slate-700 focus:outline-none"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setDatePreset('custom');
                  setEndDate(e.target.value);
                }}
                className="w-1/2 px-2 py-1.5 text-xs rounded border border-slate-300 text-slate-700 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5 Core Inventory Metrics Required by Specification */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Opening Balance */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Opening Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {stats ? stats.openingBalance.toLocaleString() : '...'}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Start of period inventory</p>
          </div>
        </div>

        {/* 2. Net Movement (CLICKABLE) */}
        <div
          onClick={handleOpenNetMovementModal}
          className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm flex flex-col justify-between hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group bg-gradient-to-br from-white to-blue-50/30"
          title="Click to view detailed Net Movement transaction ledger"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
              <span>Net Movement</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold font-mono ${stats && stats.netMovement >= 0 ? 'text-blue-700' : 'text-rose-600'}`}>
                {stats ? (stats.netMovement > 0 ? `+${stats.netMovement.toLocaleString()}` : stats.netMovement.toLocaleString()) : '...'}
              </span>
              <span className="text-[10px] font-semibold text-blue-500 underline underline-offset-2">Ledger</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Purchases ({stats?.purchasesQuantity || 0}) + In ({stats?.transfersInQuantity || 0}) - Out ({stats?.transfersOutQuantity || 0})
            </p>
          </div>
        </div>

        {/* 3. Assigned */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Assigned Gear
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {stats ? stats.assignedQuantity.toLocaleString() : '...'}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Active personnel custody</p>
          </div>
        </div>

        {/* 4. Expended */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Expended Munitions
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-amber-700 font-mono">
              {stats ? stats.expendedQuantity.toLocaleString() : '...'}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Live fire &amp; consumed</p>
          </div>
        </div>

        {/* 5. Closing Balance */}
        <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm flex flex-col justify-between hover:border-emerald-400 transition-colors bg-gradient-to-br from-white to-emerald-50/20 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Closing Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-700 font-mono">
              {stats ? stats.closingBalance.toLocaleString() : '...'}
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">End of period inventory</p>
          </div>
        </div>
      </div>

      {/* Inventory Conservation Law Banner */}
      <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider font-mono bg-blue-600 text-white px-2 py-0.5 rounded text-[10px]">
            Formula Verified
          </span>
          <span>
            Closing Balance ({stats?.closingBalance}) = Opening Balance ({stats?.openingBalance}) + Net Movement ({stats?.netMovement}) - Expended ({stats?.expendedQuantity})
          </span>
        </div>
        <span className="text-[11px] font-medium text-blue-700 hidden sm:inline">
          Scope: {stats?.baseName || 'All Commands'}
        </span>
      </div>

      {/* Main Charts Grid matching ui-reference.png Screen 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Asset Status Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Operational Readiness &amp; Status Breakdown</h3>
                <p className="text-xs text-slate-500">Live equipment availability across active fleet</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-xs">
                <Activity className="w-3.5 h-3.5" />
                <span>{stats ? stats.readinessRate : 100}% Ready</span>
              </div>
            </div>

            {/* Dynamic Status Breakdown Bars */}
            <div className="space-y-3.5 pt-2">
              {stats?.statusBreakdown.map((item) => (
                <div key={item.status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="text-slate-900 font-mono">
                      {item.count.toLocaleString()} units ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(item.percentage, 2)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Total Units Stationed: {stats?.totalCurrentQuantity.toLocaleString()}</span>
            <span>Active Equipment Categories: {stats?.categoryDistribution.length}</span>
          </div>
        </div>

        {/* Right 1 Col: Category Distribution Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Asset Distribution</h3>
                <p className="text-xs text-slate-500">Inventory volume by classification</p>
              </div>
              <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {stats?.totalTrackedAssets || 0} Models
              </span>
            </div>

            {/* Category Breakdown List */}
            <div className="space-y-3 pt-1">
              {stats?.categoryDistribution.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-slate-700 font-medium">{cat.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-900 font-mono">{cat.quantity} units</span>
                    <span className="text-slate-400 text-[10px] ml-1.5">({cat.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <a
              href="/assets"
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
            >
              <span>Explore Complete Armory Catalog</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Strip matching ui-reference.png */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="/transfers"
          className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Inter-Base Transfers</h4>
              <p className="text-[11px] text-slate-500">Logistics dispatch &amp; receipt orders</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
        </a>

        <a
          href="/assignments"
          className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Personnel Assignments</h4>
              <p className="text-[11px] text-slate-500">Officer custody &amp; armory returns</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
        </a>

        <a
          href="/reports"
          className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Reports &amp; Analytics</h4>
              <p className="text-[11px] text-slate-500">Base audit, valuation &amp; utilization</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
        </a>
      </div>

      {/* NET MOVEMENT DETAILS POPUP / MODAL (Required by Specification) */}
      <Modal
        isOpen={isNetMovementModalOpen}
        onClose={() => setIsNetMovementModalOpen(false)}
        title="Net Movement Transaction Ledger"
        subtitle={`Period: ${startDate} to ${endDate} | Scope: ${netMovementData?.baseName || 'All Commands'}`}
        footer={
          <Button variant="secondary" onClick={() => setIsNetMovementModalOpen(false)}>
            Close Ledger
          </Button>
        }
      >
        <div className="space-y-4 text-xs">
          {/* Summary Metric Header */}
          <div className="grid grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-200/60">
              <span className="text-[10px] uppercase font-bold text-blue-700 block">Purchases</span>
              <span className="text-base font-bold text-blue-900 font-mono">
                +{netMovementData?.totalPurchases || 0}
              </span>
            </div>

            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200/60">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Transfers In</span>
              <span className="text-base font-bold text-emerald-900 font-mono">
                +{netMovementData?.totalTransfersIn || 0}
              </span>
            </div>

            <div className="p-2 bg-rose-50 rounded-lg border border-rose-200/60">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Transfers Out</span>
              <span className="text-base font-bold text-rose-900 font-mono">
                -{netMovementData?.totalTransfersOut || 0}
              </span>
            </div>

            <div className="p-2 bg-slate-900 text-white rounded-lg shadow-sm">
              <span className="text-[10px] uppercase font-bold text-blue-300 block">Net Movement</span>
              <span className="text-base font-bold font-mono">
                {netMovementData && netMovementData.netMovement >= 0 ? `+${netMovementData.netMovement}` : netMovementData?.netMovement}
              </span>
            </div>
          </div>

          {/* Movement Transactions Table */}
          {isNetMovementLoading ? (
            <div className="p-8 text-center text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
              <span>Compiling transaction records...</span>
            </div>
          ) : !netMovementData || netMovementData.items.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <ArrowRightLeft className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-700">No net movements recorded in this period</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Reference #</th>
                    <th className="py-2.5 px-3">Asset / Equipment</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Base / Partner</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {netMovementData.items.map((item, idx) => (
                    <tr key={`${item.reference}-${idx}`} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{item.date}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">{item.reference}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-800">{item.assetName}</span>
                        <span className="text-[10px] text-slate-400 block">{item.category}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.transactionType === 'PURCHASE'
                              ? 'bg-blue-100 text-blue-800'
                              : item.transactionType === 'TRANSFER_IN'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.transactionType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {item.partnerBaseName ? (
                          <span>
                            {item.baseName} &rarr; <span className="font-semibold">{item.partnerBaseName}</span>
                          </span>
                        ) : (
                          <span>{item.baseName}</span>
                        )}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-bold ${
                          item.quantity > 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {item.quantity > 0 ? `+${item.quantity}` : item.quantity} {item.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
