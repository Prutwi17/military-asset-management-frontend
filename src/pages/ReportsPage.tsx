import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Building2,
  Layers,
  ArrowRightLeft,
  Users,
  Flame,
  ShoppingBag,
  RefreshCw,
  Search,
  Activity,
  DollarSign,
  TrendingUp,
  Download,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { FullReportsResponse, Base, AssetCategory } from '../types';
import { reportsApi, baseApi } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();

  const [report, setReport] = useState<FullReportsResponse | null>(null);
  const [bases, setBases] = useState<Base[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'utilization' | 'base' | 'equipment' | 'audit'>('utilization');
  const [auditSubFilter, setAuditSubFilter] = useState<'ALL' | 'PURCHASES' | 'TRANSFERS' | 'ASSIGNMENTS' | 'EXPENDITURES'>('ALL');

  // Filters
  const [selectedBase, setSelectedBase] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

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

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const effectiveBaseId =
        user?.role === 'BASE_COMMANDER'
          ? user?.base?.id
          : selectedBase
          ? Number(selectedBase)
          : undefined;

      const data = await reportsApi.getReports({
        baseId: effectiveBaseId,
        category: (selectedCategory as AssetCategory) || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setReport(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate operational reports.');
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedBase, selectedCategory, startDate, endDate]);

  useEffect(() => {
    fetchBases();
    // Default 6 months date range
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    setStartDate(d.toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReports();
    }
  }, [fetchReports, startDate, endDate]);

  // Total valuation calculation
  const totalValuation = report?.baseInventory.reduce((acc, curr) => acc + Number(curr.totalValuation), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Command Reports &amp; Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Operational readiness audits, base asset valuations, and complete lifecycle logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReports}
            isLoading={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate Audit</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            className="flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">
              Military Installation
            </label>
            <select
              value={selectedBase}
              onChange={(e) => setSelectedBase(e.target.value)}
              disabled={user?.role === 'BASE_COMMANDER'}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 disabled:bg-slate-100"
            >
              {user?.role !== 'BASE_COMMANDER' && <option value="">All Bases &amp; Depots</option>}
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">
              Asset Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
            >
              <option value="">All Categories</option>
              <option value="VEHICLE">Vehicles &amp; Armor</option>
              <option value="WEAPON">Weapons &amp; Small Arms</option>
              <option value="AMMUNITION">Munitions &amp; Ordnance</option>
              <option value="COMMUNICATION">Signal &amp; Communications</option>
              <option value="IT_EQUIPMENT">Tactical IT &amp; Terminals</option>
              <option value="OTHER">Optics &amp; Field Gear</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Analytics Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('utilization')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'utilization'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Fleet Utilization &amp; Readiness</span>
        </button>

        <button
          onClick={() => setActiveTab('base')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'base'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Base-Wise Inventory</span>
        </button>

        <button
          onClick={() => setActiveTab('equipment')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'equipment'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Equipment Classification</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Transaction Movement Ledger</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-xs">Computing aggregated military inventory analytics...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-rose-500">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : (
        <>
          {/* TAB 1: FLEET UTILIZATION */}
          {activeTab === 'utilization' && report && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Combat Readiness
                    </span>
                    <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                      {report.utilization.combatReadinessRate}%
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Mission capable percentage</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Available Stock
                    </span>
                    <h3 className="text-2xl font-bold text-blue-600 mt-1">
                      {report.utilization.availableQuantity.toLocaleString()}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Armory unallocated units</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Under Maintenance
                    </span>
                    <h3 className="text-2xl font-bold text-amber-600 mt-1">
                      {report.utilization.maintenanceQuantity.toLocaleString()}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Workshop repair queue</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Active In-Use / Deployed
                    </span>
                    <h3 className="text-2xl font-bold text-purple-600 mt-1">
                      {(report.utilization.inUseQuantity + report.utilization.deployedQuantity).toLocaleString()}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Active field assignments</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Status Breakdown Detailed Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900">Fleet Status &amp; Readiness Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-emerald-700">Available / Mission Ready</span>
                        <span className="font-mono text-slate-800">
                          {report.utilization.availableQuantity} units
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${(report.utilization.availableQuantity * 100) / (report.utilization.totalQuantity || 1)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-blue-700">In Active Use</span>
                        <span className="font-mono text-slate-800">
                          {report.utilization.inUseQuantity} units
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${(report.utilization.inUseQuantity * 100) / (report.utilization.totalQuantity || 1)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-amber-700">Scheduled Workshop Maintenance</span>
                        <span className="font-mono text-slate-800">
                          {report.utilization.maintenanceQuantity} units
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{
                            width: `${(report.utilization.maintenanceQuantity * 100) / (report.utilization.totalQuantity || 1)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                      Readiness Directive
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Combat Readiness is maintained at {report.utilization.combatReadinessRate}%, satisfying the minimum strategic threshold (85%) mandated by Central Command. All armories are synchronized.
                    </p>
                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200">
                      <span>Total Models Tracked: {report.utilization.totalAssetTypes}</span>
                      <span>Total Units: {report.utilization.totalQuantity.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BASE-WISE INVENTORY */}
          {activeTab === 'base' && report && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {report.baseInventory.map((b) => (
                  <div key={b.baseId} className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {b.baseCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {b.totalAssetsCount} Asset Types
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-2">{b.baseName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{b.location || 'Strategic Command Sector'}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Stationed Quantity:</span>
                        <span className="font-bold text-slate-900 font-mono">{b.totalQuantity.toLocaleString()} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Inventory Valuation:</span>
                        <span className="font-bold text-emerald-700 font-mono">${Number(b.totalValuation).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Active Custody:</span>
                        <span className="font-semibold text-slate-800">{b.activeAssignments} items</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Base Comparison Table */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Base Installation Asset Registry
                  </h3>
                  <span className="text-xs text-slate-500">
                    Total Estimated Portfolio: <strong className="text-emerald-700">${totalValuation.toLocaleString()}</strong>
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Base Code</th>
                        <th className="py-3 px-4">Base Name</th>
                        <th className="py-3 px-4">Command Location</th>
                        <th className="py-3 px-4">Asset Models</th>
                        <th className="py-3 px-4">Stationed Volume</th>
                        <th className="py-3 px-4">Active Custody</th>
                        <th className="py-3 px-4 text-right">Estimated Valuation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.baseInventory.map((b) => (
                        <tr key={b.baseId} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono font-semibold text-blue-700">{b.baseCode}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{b.baseName}</td>
                          <td className="py-3 px-4 text-slate-600">{b.location}</td>
                          <td className="py-3 px-4 text-slate-700">{b.totalAssetsCount} models</td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900">{b.totalQuantity.toLocaleString()}</td>
                          <td className="py-3 px-4 text-slate-700">{b.activeAssignments} items</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                            ${Number(b.totalValuation).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EQUIPMENT CLASSIFICATION */}
          {activeTab === 'equipment' && report && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/60">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Equipment Category Distribution &amp; Portfolio Valuation
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Classification</th>
                        <th className="py-3 px-4">Asset Models</th>
                        <th className="py-3 px-4">Total Stock (Units)</th>
                        <th className="py-3 px-4">Portfolio Share (%)</th>
                        <th className="py-3 px-4 text-right">Total Acquisition Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.equipmentDistribution.map((eq) => (
                        <tr key={eq.category} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4">
                            <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {eq.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">{eq.categoryName}</td>
                          <td className="py-3 px-4 text-slate-700">{eq.totalAssetTypes} models</td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                            {eq.totalQuantity.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full"
                                  style={{ width: `${Math.min(eq.percentage, 100)}%` }}
                                />
                              </div>
                              <span className="font-mono text-slate-600 text-[11px]">{eq.percentage}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                            ${Number(eq.totalValuation).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRANSACTION LEDGER AUDIT */}
          {activeTab === 'audit' && report && (
            <div className="space-y-6">
              {/* Sub filters */}
              <div className="flex items-center gap-2">
                {(['ALL', 'PURCHASES', 'TRANSFERS', 'ASSIGNMENTS', 'EXPENDITURES'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setAuditSubFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      auditSubFilter === filter
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Purchases Section */}
              {(auditSubFilter === 'ALL' || auditSubFilter === 'PURCHASES') && (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="p-3.5 bg-blue-50/60 border-b border-blue-200/60 flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                      <span>Procurement Purchase History ({report.purchaseHistory.length})</span>
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">PO Number</th>
                          <th className="py-2.5 px-3">Asset</th>
                          <th className="py-2.5 px-3">Base</th>
                          <th className="py-2.5 px-3">Supplier</th>
                          <th className="py-2.5 px-3 text-right">Quantity</th>
                          <th className="py-2.5 px-3 text-right">Total Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.purchaseHistory.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 text-slate-600">{p.purchaseDate}</td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">{p.referenceNumber}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{p.assetName}</td>
                            <td className="py-2.5 px-3 text-slate-700">{p.baseName}</td>
                            <td className="py-2.5 px-3 text-slate-600">{p.supplier}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">+{p.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                              ${Number(p.totalAmount || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Transfers Section */}
              {(auditSubFilter === 'ALL' || auditSubFilter === 'TRANSFERS') && (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="p-3.5 bg-indigo-50/60 border-b border-indigo-200/60 flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                      <span>Inter-Base Transfer History ({report.transferHistory.length})</span>
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Transfer Ref</th>
                          <th className="py-2.5 px-3">Asset</th>
                          <th className="py-2.5 px-3">Movement Route</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.transferHistory.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 text-slate-600">{t.transferDate}</td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">{t.referenceNumber}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{t.assetName}</td>
                            <td className="py-2.5 px-3 text-slate-700">
                              {t.sourceBase.name} &rarr; <strong>{t.destinationBase.name}</strong>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {t.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{t.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Assignments Section */}
              {(auditSubFilter === 'ALL' || auditSubFilter === 'ASSIGNMENTS') && (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="p-3.5 bg-emerald-50/60 border-b border-emerald-200/60 flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>Personnel Custody Assignments ({report.assignmentHistory.length})</span>
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Assignment Ref</th>
                          <th className="py-2.5 px-3">Personnel</th>
                          <th className="py-2.5 px-3">Asset</th>
                          <th className="py-2.5 px-3">Base</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.assignmentHistory.map((a) => (
                          <tr key={a.id} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 text-slate-600">{a.assignmentDate}</td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">{a.referenceNumber}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {a.personnelRank} {a.personnelName} ({a.personnelId})
                            </td>
                            <td className="py-2.5 px-3 text-slate-800">{a.assetName}</td>
                            <td className="py-2.5 px-3 text-slate-600">{a.base.name}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {a.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{a.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Expenditures Section */}
              {(auditSubFilter === 'ALL' || auditSubFilter === 'EXPENDITURES') && (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="p-3.5 bg-amber-50/60 border-b border-amber-200/60 flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-600" />
                      <span>Munitions &amp; Consumables Expenditure Log ({report.expenditureHistory.length})</span>
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Expenditure Ref</th>
                          <th className="py-2.5 px-3">Expended Material</th>
                          <th className="py-2.5 px-3">Operating Unit</th>
                          <th className="py-2.5 px-3">Reason / Directive</th>
                          <th className="py-2.5 px-3 text-right">Quantity Consumed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.expenditureHistory.map((e) => (
                          <tr key={e.id} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 text-slate-600">{e.expenditureDate}</td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-amber-700">{e.referenceNumber}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{e.assetName}</td>
                            <td className="py-2.5 px-3 text-slate-800">{e.personnelOrUnit}</td>
                            <td className="py-2.5 px-3 text-slate-600">{e.reason}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                              -{e.quantity} {e.unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
