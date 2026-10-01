import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowRightLeft,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Eye,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Transfer, Base, Asset, TransferStatus, AssetCategory, CreateTransferInput } from '../types';
import { transferApi, baseApi, assetApi } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { AssetImage } from '../components/common/AssetImage';
import { useAuth } from '../context/AuthContext';

export const TransfersPage: React.FC = () => {
  const { user } = useAuth();

  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [bases, setBases] = useState<Base[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedSourceBase, setSelectedSourceBase] = useState<string>('');
  const [selectedDestBase, setSelectedDestBase] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Modals
  const [isInitiateModalOpen, setIsInitiateModalOpen] = useState(false);
  const [viewTransfer, setViewTransfer] = useState<Transfer | null>(null);
  const [rejectingTransferId, setRejectingTransferId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Initiate Transfer Form State
  const [formSourceBaseId, setFormSourceBaseId] = useState<number>(user?.base?.id || 1);
  const [formAssetId, setFormAssetId] = useState<number | ''>('');
  const [formDestBaseId, setFormDestBaseId] = useState<number | ''>('');
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formTransferDate, setFormTransferDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formReason, setFormReason] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formRefNumber, setFormRefNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchBases = async () => {
    try {
      const data = await baseApi.getAll();
      setBases(data);
      if (data.length > 0 && !user?.base?.id) {
        setFormSourceBaseId(data[0].id);
        if (data.length > 1) {
          setFormDestBaseId(data[1].id);
        }
      } else if (user?.base?.id) {
        setFormSourceBaseId(user.base.id);
        const otherBase = data.find((b) => b.id !== user.base?.id);
        if (otherBase) setFormDestBaseId(otherBase.id);
      }
    } catch (err) {
      console.error('Failed to load bases:', err);
    }
  };

  const fetchAssetsForSourceBase = async (sourceId: number) => {
    try {
      const data = await assetApi.getAll({ baseId: sourceId });
      setAssets(data.filter((a) => a.quantity > 0));
      if (data.length > 0) {
        setFormAssetId(data[0].id);
        setFormQuantity(1);
      } else {
        setFormAssetId('');
      }
    } catch (err) {
      console.error('Failed to load assets for source base:', err);
    }
  };

  const fetchTransfers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await transferApi.getAll({
        sourceBaseId: selectedSourceBase ? Number(selectedSourceBase) : undefined,
        destinationBaseId: selectedDestBase ? Number(selectedDestBase) : undefined,
        category: (selectedCategory as AssetCategory) || undefined,
        status: selectedStatus || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        keyword: searchKeyword.trim() || undefined,
      });
      setTransfers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load asset transfers.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceBase, selectedDestBase, selectedCategory, selectedStatus, startDate, endDate, searchKeyword]);

  useEffect(() => {
    fetchBases();
  }, []);

  useEffect(() => {
    if (formSourceBaseId) {
      fetchAssetsForSourceBase(formSourceBaseId);
    }
  }, [formSourceBaseId]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  // Selected asset metadata for validation
  const selectedAsset = assets.find((a) => a.id === formAssetId);

  const handleOpenInitiateModal = () => {
    setFormError(null);
    const initialSource = user?.base?.id || (bases[0] ? bases[0].id : 1);
    setFormSourceBaseId(initialSource);
    const other = bases.find((b) => b.id !== initialSource);
    if (other) setFormDestBaseId(other.id);
    fetchAssetsForSourceBase(initialSource);
    setFormReason('');
    setFormNotes('');
    setFormRefNumber('');
    setFormTransferDate(new Date().toISOString().split('T')[0]);
    setIsInitiateModalOpen(true);
  };

  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAssetId) {
      setFormError('Please select an asset to transfer.');
      return;
    }
    if (!formDestBaseId || formDestBaseId === formSourceBaseId) {
      setFormError('Please select a different destination base.');
      return;
    }
    if (!formReason.trim()) {
      setFormError('Please provide a tactical transfer reason.');
      return;
    }
    if (selectedAsset && formQuantity > selectedAsset.quantity) {
      setFormError(`Insufficient inventory. Max available: ${selectedAsset.quantity} ${selectedAsset.unit}`);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload: CreateTransferInput = {
        assetId: Number(formAssetId),
        destinationBaseId: Number(formDestBaseId),
        quantity: formQuantity,
        transferDate: formTransferDate,
        reason: formReason.trim(),
        notes: formNotes.trim() || undefined,
        referenceNumber: formRefNumber.trim() || undefined,
      };

      await transferApi.create(payload);
      setIsInitiateModalOpen(false);
      fetchTransfers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to initiate transfer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await transferApi.approve(id);
      fetchTransfers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve transfer.');
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await transferApi.complete(id);
      fetchTransfers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete transfer.');
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this transfer?')) return;
    try {
      await transferApi.cancel(id);
      fetchTransfers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel transfer.');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingTransferId || !rejectReason.trim()) return;

    try {
      await transferApi.reject(rejectingTransferId, rejectReason.trim());
      setRejectingTransferId(null);
      setRejectReason('');
      fetchTransfers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject transfer.');
    }
  };

  // Metrics
  const totalCount = transfers.length;
  const pendingCount = transfers.filter((t) => t.status === 'PENDING').length;
  const approvedCount = transfers.filter((t) => t.status === 'APPROVED').length;
  const completedCount = transfers.filter((t) => t.status === 'COMPLETED').length;

  const getStatusBadgeVariant = (status: TransferStatus): import('../components/common/Badge').BadgeVariant => {
    switch (status) {
      case 'PENDING':
        return 'pending';
      case 'APPROVED':
        return 'blue';
      case 'COMPLETED':
        return 'approved';
      case 'REJECTED':
      case 'CANCELLED':
        return 'rejected';
      default:
        return 'neutral';
    }
  };

  const canApproveOrReject = (t: Transfer) => {
    if (user?.role === 'ADMIN') return true;
    if (user?.role === 'BASE_COMMANDER' && user?.base) {
      return t.sourceBase.id === user.base.id || t.destinationBase.id === user.base.id;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inter-Base Asset Transfers</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Logistical movement protocols, inter-command transfer requests, and inventory handovers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransfers}
            isLoading={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenInitiateModal}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Initiate Transfer</span>
          </Button>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Transfers</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Pending Approval</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{pendingCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">In-Transit / Approved</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{approvedCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Completed Transfers</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{completedCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, asset, reason..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          {/* Source Base Filter */}
          <select
            value={selectedSourceBase}
            onChange={(e) => setSelectedSourceBase(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
          >
            <option value="">All Origin Bases</option>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                Origin: {b.name}
              </option>
            ))}
          </select>

          {/* Destination Base Filter */}
          <select
            value={selectedDestBase}
            onChange={(e) => setSelectedDestBase(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
          >
            <option value="">All Destination Bases</option>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                Dest: {b.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
          >
            <option value="">All Categories</option>
            <option value="VEHICLE">Vehicles</option>
            <option value="WEAPON">Weapons</option>
            <option value="AMMUNITION">Ammunition</option>
            <option value="COMMUNICATION">Communication</option>
            <option value="IT_EQUIPMENT">IT Equipment</option>
            <option value="OTHER">Other Gear</option>
          </select>
        </div>

        {/* Date Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 text-xs text-slate-600">
          <span className="font-semibold text-slate-500">Date Range:</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 text-xs rounded border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 text-xs rounded border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>
          {(startDate || endDate || searchKeyword || selectedStatus || selectedSourceBase || selectedDestBase || selectedCategory) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setSearchKeyword('');
                setSelectedStatus('');
                setSelectedSourceBase('');
                setSelectedDestBase('');
                setSelectedCategory('');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 ml-auto font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Transfers Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-xs">Loading tactical movement registry...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : transfers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ArrowRightLeft className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No transfer records found</p>
            <p className="text-xs text-slate-400 mt-1">Initiate an asset transfer or clear existing filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Transfer Reference</th>
                  <th className="py-3 px-4">Asset / Equipment</th>
                  <th className="py-3 px-4">Origin &rarr; Destination Base</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Initiated / Approved</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-700">
                      {item.referenceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.assetName}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.category} {item.equipmentType ? `• ${item.equipmentType}` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <span className="text-slate-600">{item.sourceBase.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="text-blue-700 font-semibold">{item.destinationBase.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {item.quantity} <span className="text-slate-500 font-normal">{item.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{item.transferDate}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium truncate max-w-[150px]">{item.requestedBy}</div>
                      {item.approvedBy && (
                        <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                          Appr: {item.approvedBy}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Action buttons depending on status */}
                        {item.status === 'PENDING' && (
                          <>
                            {canApproveOrReject(item) && (
                              <>
                                <button
                                  onClick={() => handleApprove(item.id)}
                                  title="Approve Transfer"
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setRejectingTransferId(item.id)}
                                  title="Reject Transfer"
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleCancel(item.id)}
                              title="Cancel Request"
                              className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {item.status === 'APPROVED' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleComplete(item.id)}
                            className="text-[11px] py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500"
                          >
                            Receive &amp; Complete
                          </Button>
                        )}

                        <button
                          onClick={() => setViewTransfer(item)}
                          title="View Details"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Initiate Transfer Modal */}
      <Modal
        isOpen={isInitiateModalOpen}
        onClose={() => setIsInitiateModalOpen(false)}
        title="Initiate Inter-Base Asset Transfer"
        subtitle="Operational Transfer Order Directive"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsInitiateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleInitiateTransfer}
              isLoading={isSubmitting}
            >
              Transmit Transfer Order
            </Button>
          </div>
        }
      >
        <form onSubmit={handleInitiateTransfer} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Origin / Source Base *</label>
              <select
                value={formSourceBaseId}
                onChange={(e) => setFormSourceBaseId(Number(e.target.value))}
                disabled={user?.role === 'BASE_COMMANDER'}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 disabled:bg-slate-100"
              >
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Destination Base *</label>
              <select
                value={formDestBaseId}
                onChange={(e) => setFormDestBaseId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
                required
              >
                <option value="">Select Target Base</option>
                {bases
                  .filter((b) => b.id !== formSourceBaseId)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Asset from Origin Inventory *</label>
            <select
              value={formAssetId}
              onChange={(e) => setFormAssetId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
              required
            >
              <option value="">Select Stationed Asset</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetCode} - {a.name} (Stock: {a.quantity} {a.unit})
                </option>
              ))}
            </select>
            {selectedAsset && (
              <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg mt-2">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                  <AssetImage src={selectedAsset.imageUrl} alt={selectedAsset.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{selectedAsset.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {selectedAsset.assetCode} • Available Stock: {selectedAsset.quantity} {selectedAsset.unit}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Transfer Quantity *</label>
              <input
                type="number"
                min="1"
                max={selectedAsset ? selectedAsset.quantity : 9999}
                value={formQuantity}
                onChange={(e) => setFormQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Transfer Order Date *</label>
              <input
                type="date"
                value={formTransferDate}
                onChange={(e) => setFormTransferDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Transfer Reason / Operational Justification *</label>
            <input
              type="text"
              placeholder="e.g. Strategic armor deployment for Western sector reinforcement"
              value={formReason}
              onChange={(e) => setFormReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes / Convoy Directives</label>
            <textarea
              rows={2}
              placeholder="Convoy routes, security escort details, transport vehicle numbers..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            />
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectingTransferId !== null}
        onClose={() => {
          setRejectingTransferId(null);
          setRejectReason('');
        }}
        title="Reject Asset Transfer"
        subtitle="Specify Official Rejection Rationale"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRejectingTransferId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRejectSubmit}>
              Confirm Rejection
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Please enter the justification for rejecting this transfer order. This rationale will be permanently recorded in the military audit log.
          </p>
          <textarea
            rows={3}
            placeholder="e.g. Origin base currently on high alert; inventory cannot be depleted at this time."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            required
          />
        </div>
      </Modal>

      {/* View Transfer Details Modal */}
      <Modal
        isOpen={viewTransfer !== null}
        onClose={() => setViewTransfer(null)}
        title={viewTransfer ? `Transfer Order: ${viewTransfer.referenceNumber}` : 'Transfer Details'}
        subtitle="Logistical Transfer Record"
        footer={
          <Button variant="secondary" onClick={() => setViewTransfer(null)}>
            Close
          </Button>
        }
      >
        {viewTransfer && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-400 uppercase font-mono text-[10px]">Asset</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{viewTransfer.assetName}</p>
                <p className="text-slate-500 font-mono">{viewTransfer.assetCode || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-mono text-[10px]">Quantity</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {viewTransfer.quantity} {viewTransfer.unit}
                </p>
                <p className="text-slate-500">{viewTransfer.category}</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Origin Base</span>
                <p className="font-semibold text-slate-900">{viewTransfer.sourceBase.name}</p>
                <p className="text-[11px] text-slate-500">{viewTransfer.sourceBase.code}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-600" />
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500">Destination Base</span>
                <p className="font-semibold text-blue-800">{viewTransfer.destinationBase.name}</p>
                <p className="text-[11px] text-slate-500">{viewTransfer.destinationBase.code}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400">Status</span>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(viewTransfer.status)}>{viewTransfer.status}</Badge>
                </div>
              </div>
              <div>
                <span className="text-slate-400">Order Date</span>
                <p className="font-medium text-slate-800 mt-1">{viewTransfer.transferDate}</p>
              </div>
              <div>
                <span className="text-slate-400">Requested By</span>
                <p className="font-medium text-slate-800 mt-1">{viewTransfer.requestedBy}</p>
              </div>
              <div>
                <span className="text-slate-400">Approved By</span>
                <p className="font-medium text-slate-800 mt-1">{viewTransfer.approvedBy || 'Pending'}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-400">Operational Reason</span>
              <p className="mt-1 p-2.5 rounded-lg bg-slate-50 text-slate-700 font-medium">
                {viewTransfer.reason}
              </p>
            </div>

            {viewTransfer.rejectionReason && (
              <div>
                <span className="text-rose-500 font-bold">Rejection Reason</span>
                <p className="mt-1 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                  {viewTransfer.rejectionReason}
                </p>
              </div>
            )}

            {viewTransfer.notes && (
              <div>
                <span className="text-slate-400">Logistics Notes</span>
                <p className="mt-1 p-2.5 rounded-lg bg-slate-50 text-slate-600">
                  {viewTransfer.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
